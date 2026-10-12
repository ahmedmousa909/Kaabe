(async()=>{'use strict';
const sb=window.kaabeSupabase,$=id=>document.getElementById(id);
const detail=$('wa-connection-detail'),summary=$('wa-message-summary'),root=$('wa-messages');
const status=message=>{$('wa-setup-state').textContent=message};
const safeDate=d=>d?new Date(d).toLocaleString():'';
if(!sb){status('Supabase is not configured.');return}
let businessId=null,agents=[],selected=null;
try{
 const {data:{user},error:authError}=await sb.auth.getUser();
 if(authError||!user){status('Please log in first.');detail.textContent='Sign in required.';return}
 const {data:business,error:be}=await sb.from('businesses').select('id,name').eq('owner_id',user.id).limit(1).maybeSingle();
 if(be||!business){status('Create a business first.');detail.textContent='Business profile not found.';return}
 businessId=business.id;
 const [agentRes,workflowRes,connectionRes]=await Promise.all([
  sb.from('agents').select('id,name,type,status,settings').eq('business_id',businessId).eq('type','whatsapp').order('created_at',{ascending:true}),
  sb.from('automations').select('id,name,template,status').eq('business_id',businessId).eq('template','whatsapp'),
  sb.from('whatsapp_connections').select('connection_status,phone_number_id,connected_at').eq('business_id',businessId).maybeSingle()
 ]);
 if(agentRes.error)throw agentRes.error;
 agents=agentRes.data||[];
 const sel=$('wa-agent-select');sel.replaceChildren();
 if(!agents.length){
  status('No WhatsApp AI Assistant found. Create one in AI Assistants, then return here.');
  const opt=document.createElement('option');opt.textContent='Create a WhatsApp AI Assistant first';sel.append(opt);
  $('wa-save-settings').disabled=true;$('wa-test-btn').disabled=true;
 }else{
  for(const a of agents){const o=document.createElement('option');o.value=a.id;o.textContent=a.name+' · '+a.status;sel.append(o)}
  const display=()=>{selected=agents.find(a=>a.id===sel.value);if(!selected)return;
   $('wa-instructions').value=selected.settings?.instructions||'';
   $('wa-reply-mode').value=selected.settings?.reply_mode||'draft_only';
   status('Editing '+selected.name+'. Save your settings before testing.')};
  sel.addEventListener('change',display);display();
  $('wa-save-settings').onclick=async()=>{
   if(!selected)return;
   const btn=$('wa-save-settings');btn.disabled=true;$('wa-save-result').textContent='Saving…';
   const settings={...(selected.settings||{}),instructions:$('wa-instructions').value.trim(),reply_mode:$('wa-reply-mode').value};
   const {data,error}=await sb.from('agents').update({settings,updated_at:new Date().toISOString()}).eq('id',selected.id).eq('business_id',businessId).select('id,settings').single();
   btn.disabled=false;
   if(error){$('wa-save-result').textContent='Save failed: '+error.message;return}
   selected.settings=data.settings;$('wa-save-result').textContent='✓ Settings saved to your business.';
  };
  $('wa-test-btn').onclick=async()=>{
   const message=$('wa-test-input').value.trim();if(!message){$('wa-test-result').textContent='Enter a message first.';return}
   const btn=$('wa-test-btn');btn.disabled=true;$('wa-test-result').textContent='KAABE AI is processing…';
   try{const {data,error}=await sb.functions.invoke('kaabe-ai',{body:{agent_id:selected.id,message}});
    if(error)throw error;
    if(data?.error)throw Error(data.error);
    $('wa-test-result').textContent=data?.reply||'No reply returned.';
   }catch(e){$('wa-test-result').textContent='AI test failed: '+(e.message||String(e))}
   finally{btn.disabled=false}
  };
 }
 if(workflowRes.error){$('wa-workflow-count').textContent='Could not load workflows.'}
 else{
  const workflows=workflowRes.data||[];
  $('wa-workflow-count').textContent=workflows.length+' WhatsApp workflows configured. Workflow activation does not enable Meta messaging.';
  if(workflows.length){
   const {data:runs}=await sb.from('automation_runs').select('automation_id,status,created_at,input_text,output_text').eq('business_id',businessId).in('automation_id',workflows.map(x=>x.id)).order('created_at',{ascending:false}).limit(8);
   for(const run of runs||[]){const box=document.createElement('div');box.className='wa-message';const label=document.createElement('strong');label.textContent=(workflows.find(w=>w.id===run.automation_id)?.name||'Workflow')+' · '+run.status;const p=document.createElement('small');p.textContent=safeDate(run.created_at)+' · '+(run.input_text||'').slice(0,130);box.append(label,p);$('wa-run-history').append(box)}
  }
 }
 if(connectionRes.error){detail.textContent='Could not load connection status.';return}
 const connection=connectionRes.data;
 if(!connection||connection.connection_status!=='connected'){
  detail.textContent='Not connected. Configure your agent and test AI now; Meta approval is required for live customer onboarding.';
  summary.textContent='No connected customer WhatsApp number. Message history appears after connection.';
  return;
 }
 detail.textContent='Connected · Phone ID '+connection.phone_number_id+' · '+business.name;
 const {data:messages,error:me}=await sb.from('whatsapp_inbound_events').select('message_text,message_type,processing_status,received_at').eq('phone_number_id',connection.phone_number_id).order('received_at',{ascending:false}).limit(20);
 if(me){summary.textContent='Message history unavailable: '+me.message;return}
 summary.textContent=(messages?.length||0)+' recent incoming messages';
 root.replaceChildren();
 for(const msg of messages||[]){const box=document.createElement('div');box.className='wa-message';const p=document.createElement('div');p.textContent=msg.message_text||'['+msg.message_type+']';const small=document.createElement('small');small.textContent=safeDate(msg.received_at)+' · '+msg.processing_status;box.append(p,small);root.append(box)}
}catch(e){status('Workspace error: '+(e.message||String(e)));detail.textContent='Unable to load workspace.'}
})();