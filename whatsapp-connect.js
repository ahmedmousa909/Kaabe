/* KAABE WhatsApp Business App Coexistence onboarding.
   No Meta app secret, system-user token, or OAuth code is stored in this static site.
   The server endpoint must verify the logged-in business, exchange OAuth codes securely,
   subscribe WABA webhooks, and store credentials server-side before enabling the button. */
(async function(){
'use strict';
const APP_ID='1130415533005166';
const CONFIG_ID='2141503733114213';
const sb=window.kaabeSupabase;
const button=document.getElementById('wa-connect');
const status=document.getElementById('wa-status');
const set=(message)=>{status.textContent=message};
if(!sb){set('KAABE authentication is unavailable.');return}
let session;
let signupIds=null;
window.addEventListener('message',event=>{
 if(event.origin!=='https://www.facebook.com'&&event.origin!=='https://web.facebook.com')return;
 let data=event.data;try{if(typeof data==='string')data=JSON.parse(data)}catch{return}
 if(data?.type!=='WA_EMBEDDED_SIGNUP')return;
 const info=data.data||{};
 if(data.event==='FINISH'||data.event==='FINISH_ONLY_WABA'||data.event==='FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'){
  const waba=String(info.waba_id||''),phone=String(info.phone_number_id||'');
  if(/^\d{5,30}$/.test(waba)&&/^\d{5,30}$/.test(phone))signupIds={waba_id:waba,phone_number_id:phone};
 }
});
try{({data:{session}}=await sb.auth.getSession())}catch(e){set('Unable to check login.');return}
if(!session){set('Please log in to KAABE first.');return}
let businessId=sessionStorage.getItem('kaabe_business_id');
if(!businessId){
 const {data,error}=await sb.from('businesses').select('id').eq('owner_id',session.user.id).limit(1);
 if(error||!data?.length){set('Business account not found.');return}
 businessId=data[0].id;
}
// Only enable onboarding when server explicitly confirms readiness. Never authorize
// Meta before a secure OAuth code exchange endpoint exists.
try{
 const {data,error}=await sb.functions.invoke('kaabe-whatsapp-onboard',{body:{action:'status',business_id:businessId}});
 if(data?.connection?.connection_status==='connected'){set('WhatsApp Business is connected to KAABE. Phone ID: '+data.connection.phone_number_id);return}\n if(error||data?.ready!==true){set('WhatsApp customer onboarding is waiting for Meta production approval. Your existing WhatsApp Business App remains unchanged.');return}
}catch(e){set('Secure onboarding backend is not available yet. Your WhatsApp Business App is unchanged.');return}
set('Ready to start Meta WhatsApp Business App onboarding.');
button.disabled=false;
function loadSDK(){
 return new Promise((resolve,reject)=>{
 if(window.FB)return resolve();
 window.fbAsyncInit=()=>{window.FB.init({appId:APP_ID,cookie:false,xfbml:false,version:'v23.0'});resolve()};
 const script=document.createElement('script');script.src='https://connect.facebook.net/en_US/sdk.js';script.async=true;script.onerror=()=>reject(new Error('Meta SDK could not load'));document.head.append(script);
 });
}
button.addEventListener('click',async()=>{
 button.disabled=true;signupIds=null;set('Opening Meta onboarding…');
 try{
  await loadSDK();
  window.FB.login(async response=>{
   if(!response?.authResponse?.code){set('Connection cancelled or Meta did not return an authorization code.');button.disabled=false;return}
   set('Completing secure server-side authorization…');
   if(!signupIds){set('Meta did not return the required WhatsApp account and phone details. Connection was not saved.');button.disabled=false;return;}
   // The code is single-use and must never be printed to the UI or console.
   const {data,error}=await sb.functions.invoke('kaabe-whatsapp-onboard',{body:{action:'complete',business_id:businessId,code:response.authResponse.code,...signupIds}});
   if(error||!data?.connected){set('Meta authorization received, but KAABE could not finish secure onboarding. Please contact support before retrying.')}
   else{set('WhatsApp connection completed. KAABE will verify webhook delivery before enabling AI replies.')}
   button.disabled=false;
  },{config_id:CONFIG_ID,response_type:'code',override_default_response_type:true,extras:{setup:{},featureType:'whatsapp_business_app_onboarding',sessionInfoVersion:'3'}});
 }catch(e){set('Could not open Meta onboarding.');button.disabled=false}
});
})();