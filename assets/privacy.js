(function(){
'use strict';
const key='golzio_consent_v1',ttl=180*24*60*60*1000,config=window.GOLZIO_TRACKING||{};
const ga=/^G-[A-Z0-9]+$/.test(config.googleAnalyticsId||'')?config.googleAnalyticsId:'';
const meta=/^\d+$/.test(config.metaPixelId||'')?config.metaPixelId:'';
const page=location.pathname.endsWith('tarjetas.html')?'tarjetas':location.pathname.endsWith('privacidad.html')?'privacidad':'consultoria';
const cleanURL='https://golzio.cl/'+(page==='tarjetas'?'tarjetas.html':page==='privacidad'?'privacidad.html':'');
let consent={analytics:false,marketing:false},stored=null,gaLoaded=false,metaLoaded=false;
try{stored=JSON.parse(localStorage.getItem(key));if(stored&&stored.version===1&&Date.now()-stored.time<ttl)consent={analytics:stored.analytics===true,marketing:stored.marketing===true};else stored=null;}catch(e){}
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
function script(src){const s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s);}
function activate(){
 if(consent.analytics&&ga&&!gaLoaded){gaLoaded=true;gtag('consent','update',{analytics_storage:'granted'});gtag('js',new Date());gtag('config',ga,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:15552000,page_location:cleanURL,page_referrer:''});gtag('event','page_view',{page_location:cleanURL,page_referrer:'',page_title:document.title,business_line:page});script('https://www.googletagmanager.com/gtag/js?id='+ga);}
 if(consent.marketing&&meta&&!metaLoaded){metaLoaded=true;const f=window.fbq=function(){f.callMethod?f.callMethod.apply(f,arguments):f.queue.push(arguments)};f.push=f;f.loaded=true;f.version='2.0';f.queue=[];window._fbq=f;f('consent','grant');f('set','autoConfig',false,meta);f('init',meta);f('track','PageView');script('https://connect.facebook.net/en_US/fbevents.js');}
}
function track(name,details){const data=Object.assign({business_line:page,page_location:cleanURL,page_referrer:''},details||{});if(consent.analytics&&gaLoaded)gtag('event',name,data);if(consent.marketing&&metaLoaded)window.fbq('trackCustom',name,{business_line:page,placement:data.placement||'',progress:data.progress||0});}
document.addEventListener('click',function(e){const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';const placement=a.closest('section')?.id||(a.closest('footer')?'footer':a.classList.contains('wa-float')?'floating':'navigation');if(href.startsWith('https://wa.me/'))track('whatsapp_click',{placement});else if(href.startsWith('mailto:'))track('email_click',{placement});else if(href.includes('nfc.golzio.cl'))track('card_demo_click',{placement});});
const video=document.querySelector('#tarjeta-video');if(video){let started=false;const marks=new Set();video.addEventListener('play',()=>{if(!started){track('video_start');started=true;}});video.addEventListener('timeupdate',()=>{for(const n of [25,50,75])if(video.duration&&video.currentTime/video.duration*100>=n&&!marks.has(n)){marks.add(n);track('video_progress',{progress:n});}});video.addEventListener('ended',()=>track('video_complete'));video.addEventListener('volumechange',()=>{if(!video.muted&&video.volume>0)track('video_sound_on');});}
const banner=document.createElement('section');banner.className='cookie-banner';banner.hidden=true;banner.setAttribute('aria-label','Preferencias de cookies');
banner.innerHTML='<h2>Tu privacidad, tú decides</h2><p>Analítica (Google) y publicidad (Meta), solo con tu permiso. Puedes cambiar tu elección. <a href="privacidad.html">Política de privacidad</a>.</p><div class="cookie-options" hidden><label><input type="checkbox" checked disabled> Necesarias: recordar tu elección.</label><label><input id="cookie-analytics" type="checkbox"> Analítica: visitas e interacción con la web (Google).</label><label><input id="cookie-marketing" type="checkbox"> Publicidad: medición y audiencias (Meta).</label></div><div class="cookie-actions"><button type="button" data-choice="reject">Rechazar</button><button type="button" data-choice="accept">Aceptar todas</button><button type="button" data-choice="configure">Configurar</button><button type="button" data-choice="save" hidden>Guardar preferencias</button></div>';
document.body.appendChild(banner);
const options=banner.querySelector('.cookie-options'),analytics=banner.querySelector('#cookie-analytics'),marketing=banner.querySelector('#cookie-marketing');
function size(){document.body.style.setProperty('--cookie-height',banner.offsetHeight+'px');}
new ResizeObserver(size).observe(banner);
function open(focus){banner.hidden=false;document.body.classList.add('cookie-open');analytics.checked=consent.analytics;marketing.checked=consent.marketing;size();if(focus)banner.querySelector('button').focus();}
function clearCookies(){const domains=[location.hostname,'.'+location.hostname,'.golzio.cl',''];for(const part of document.cookie.split(';')){const name=part.trim().split('=')[0];if(/^(_ga|_gid|_gat|_fbp|_fbc)/.test(name))for(const domain of domains)document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'');}}
function save(next){const revoked=(consent.analytics&&!next.analytics)||(consent.marketing&&!next.marketing);consent=next;try{localStorage.setItem(key,JSON.stringify({...consent,version:1,time:Date.now()}));}catch(e){}banner.hidden=true;document.body.classList.remove('cookie-open');if(revoked){if(ga)window['ga-disable-'+ga]=!consent.analytics;gtag('consent','update',{analytics_storage:consent.analytics?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});if(metaLoaded&&!consent.marketing)window.fbq('consent','revoke');clearCookies();location.reload();return;}activate();}
banner.addEventListener('click',function(e){const choice=e.target.closest('[data-choice]')?.dataset.choice;if(choice==='accept')save({analytics:true,marketing:true});if(choice==='reject')save({analytics:false,marketing:false});if(choice==='save')save({analytics:analytics.checked,marketing:marketing.checked});if(choice==='configure'){options.hidden=false;banner.querySelector('[data-choice="save"]').hidden=false;e.target.hidden=true;analytics.focus();}});
document.querySelectorAll('[data-cookie-settings]').forEach(b=>b.addEventListener('click',()=>open(true)));
window.addEventListener('storage',e=>{if(e.key===key)location.reload();});
if(!stored)open(false);activate();
})();
