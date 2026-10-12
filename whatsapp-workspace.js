(async()=>{'use strict';
const sb=window.kaabeSupabase,detail=document.getElementById('wa-connection-detail'),summary=document.getElementById('wa-message-summary'),root=document.getElementById('wa-messages');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!sb){detail.textContent='Authentication unavailable';return}
try{
 const {data:{user},error:authError}=await sb.auth.getUser();
 if(authError||!user){detail.textContent='Sign in to see your WhatsApp workspace.';return}
 const {data:business,error:be}=await sb.from('businesses').select('id,name').eq('owner_id',user.id).limit(1).maybeSingle();
 if(be||!business){detail.textContent='Create your business first in KAABE onboarding.';return}
 const {data:connection,error:ce}=await sb.from('whatsapp_connections').select('connection_status,phone_number_id,connected_at').eq('business_id',business.id).maybeSingle();
 if(ce){detail.textContent='Could not load WhatsApp connection: '+ce.message;return}
 if(!connection||connection.connection_status!=='connected'){
  detail.textContent='Not connected. You can configure Knowledge, AI Agent and Workflows now. Meta approval is required for live customer onboarding.';
  summary.textContent='No customer WhatsApp number connected. Message history will be available after connection.';
  return
 }
 detail.textContent='Connected · Phone ID '+connection.phone_number_id+' · '+business.name;
 const {data:messages,error:me}=await sb.from('whatsapp_inbound_events').select('message_text,message_type,processing_status,received_at').eq('phone_number_id',connection.phone_number_id).order('received_at',{ascending:false}).limit(20);
 if(me){summary.textContent='Message history unavailable. Access policy needs verification.';return}
 summary.textContent=(messages?.length||0)+' recent incoming messages';
 root.replaceChildren();
 for(const msg of messages||[]){
  const box=document.createElement('div');box.className='wa-message';
  const p=document.createElement('div');p.textContent=msg.message_text||'['+msg.message_type+']';
  const small=document.createElement('small');small.textContent=new Date(msg.received_at).toLocaleString()+' · '+msg.processing_status;
  box.append(p,small);root.append(box);
 }
}catch(e){detail.textContent='Workspace loading error. Please reload or sign in again.'}
})();