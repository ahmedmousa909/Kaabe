(function(){
const sb=window.kaabeSupabase;
const panel=document.createElement('section');
panel.className='panel';panel.id='kaabe-ai-live';
panel.style.cssText='margin-top:24px;padding:24px';
panel.innerHTML=`<div class="panel-head"><h2><img src="kaabe-spark.svg" alt="" style="width:26px;height:26px;vertical-align:middle;margin-right:7px">Ask Kaabe AI</h2><span style="color:#9a612f;font-size:13px">Live AI Engine</span></div><p style="color:#6d6d6d">Ask your AI assistant a question using your business Knowledge Base.</p><label for="kaabe-ai-agent">Assistant</label><select id="kaabe-ai-agent" style="display:block;width:100%;padding:12px;margin:8px 0 14px;border-radius:10px;background:#fff;color:#191919;border:1px solid #e5d5c5"></select><label for="kaabe-ai-message">Your message</label><textarea id="kaabe-ai-message" rows="3" placeholder="Type a message to test your AI assistant..." style="display:block;width:100%;padding:12px;margin:8px 0 14px;border-radius:10px;background:#fff;color:#191919;border:1px solid #e5d5c5;resize:vertical"></textarea><button id="kaabe-ai-ask" type="button" style="padding:12px 22px;border:0;border-radius:10px;color:#18100a;background:linear-gradient(90deg,#ffb338,#ff7913);cursor:pointer">Ask Kaabe AI</button><div id="kaabe-ai-answer" role="status" aria-live="polite" style="margin-top:16px;white-space:pre-wrap;line-height:1.6;color:#252525;background:#fff6ec;padding:16px;border-radius:12px">Loading assistants…</div>`;
const mount=document.querySelector('.content .lower')||document.querySelector('.content');
if(!mount||!sb)return;
mount.parentNode.insertBefore(panel,mount.nextSibling);
const el=id=>document.getElementById(id);
const show=x=>{el('kaabe-ai-answer').textContent=x};
async function init(){
try{
const {data:{session},error:sessionError}=await sb.auth.getSession();
if(sessionError||!session){show('Please log in again.');return}
let businessId=sessionStorage.getItem('kaabe_business_id');
if(!businessId){const {data:b,error:be}=await sb.from('businesses').select('id').eq('owner_id',session.user.id).limit(1);if(be)throw be;businessId=b?.[0]?.id}
if(!businessId){show('No business found.');return}
const {data:agents,error}=await sb.from('agents').select('id,name,type').eq('business_id',businessId).order('created_at',{ascending:true});
if(error)throw error;
if(!agents?.length){show('No AI assistants found. Create an assistant first.');return}
for(const a of agents){const opt=document.createElement('option');opt.value=a.id;opt.textContent=`${a.name} (${a.type})`;el('kaabe-ai-agent').append(opt)}
show('Ready — choose an assistant and send a message.');
}catch(e){show('Setup error: '+(e?.message||String(e)))}}
el('kaabe-ai-ask').addEventListener('click',async()=>{
const message=el('kaabe-ai-message').value.trim();const agent_id=el('kaabe-ai-agent').value;
if(!message){show('Please enter a message.');return}if(!agent_id){show('Please select an assistant.');return}
const btn=el('kaabe-ai-ask');el('kaabe-ai-message').value='';btn.disabled=true;show('Kaabe AI is thinking…');
try{const {data,error}=await sb.functions.invoke('kaabe-ai',{body:{agent_id,message}});
if(error){let detail=error.message||String(error);try{const raw=await error.context?.text();if(raw)detail+='\n'+raw}catch{}show('AI Error: '+detail)}else if(data?.error){show('AI Error: '+data.error)}else{show(data?.reply||'No reply returned.')}}catch(e){show('Request failed: '+(e?.message||String(e)))}finally{btn.disabled=false}
});init();
})();
