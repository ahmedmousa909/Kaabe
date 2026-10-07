const client=window.kaabeSupabase,$=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
let business=null, agents=[];

const templates={
  whatsapp:{name:"WhatsApp AI",type:"whatsapp",description:"Answers customer messages, FAQs and booking requests on WhatsApp.",tag:"Customer Support · WhatsApp"},
  email:{name:"Email AI",type:"email",description:"Reads, classifies and prepares smart replies for incoming business email.",tag:"Email · Smart Replies"},
  appointment:{name:"Appointment AI",type:"appointment",description:"Checks availability, books appointments and handles rescheduling.",tag:"Calendar · Bookings"},
  sales:{name:"Lead & Sales AI",type:"sales",description:"Captures leads, qualifies prospects and helps turn conversations into sales.",tag:"Leads · Sales"},
  receptionist:{name:"AI Receptionist",type:"receptionist",description:"Handles customer enquiries and routes requests to the right place.",tag:"Reception · Customer Care"},
  support:{name:"Customer Support AI",type:"support",description:"Uses your business knowledge to answer common customer questions.",tag:"Knowledge · Support"}
};

function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function tagFor(type){return templates[type]?.tag||"AI Assistant"}
function render(){
  const grid=$("#assistant-grid");
  $("#total-count").textContent=agents.length;
  $("#active-count").textContent=agents.filter(a=>a.status==="active").length;
  if(!agents.length){
    grid.innerHTML='<div class="empty-agents"><h3>No AI assistants yet</h3><p>Create your first assistant to start building your AI workforce.</p></div>';
    return;
  }
  grid.innerHTML=agents.map(a=>`
    <article class="assistant-card" data-id="${a.id}">
      <div class="assistant-card-top"><div class="assistant-icon">🤖</div>
      <span class="status ${a.status==="active"?"active":"ready"}">● ${a.status==="active"?"Active":"Paused"}</span></div>
      <h3>${esc(a.name)}</h3><p>${esc(a.description||"Kaabe AI Assistant")}</p>
      <div class="assistant-tags"><span>${esc(tagFor(a.type))}</span></div>
      <div class="assistant-actions">
        <button class="configure" data-id="${a.id}">Configure</button>
        <button class="toggle ${a.status==="active"?"active":""}" data-id="${a.id}">${a.status==="active"?"Pause":"Activate"}</button>
      </div>
    </article>`).join("");
  $$(".configure").forEach(b=>b.onclick=()=>location.href=`assistant-config.html?id=${encodeURIComponent(b.dataset.id)}`);
  $$(".toggle").forEach(b=>b.onclick=()=>toggleAgent(b.dataset.id));
}
async function loadAgents(){
  const {data,error}=await client.from("agents").select("*").eq("business_id",business.id).order("created_at",{ascending:true});
  if(error){alert("Could not load assistants: "+error.message);return}
  agents=data||[]; render();
}
async function toggleAgent(id){
  const a=agents.find(x=>x.id===id); if(!a)return;
  const status=a.status==="active"?"paused":"active";
  const {error}=await client.from("agents").update({status,updated_at:new Date().toISOString()}).eq("id",id);
  if(error){alert("Could not update assistant: "+error.message);return}
  a.status=status; render();
}
async function createFromTemplate(key){
  if(!business)return;
  const t=templates[key]; if(!t)return;
  const {data,error}=await client.from("agents").insert({
    business_id:business.id,name:t.name,type:t.type,status:"paused",
    description:t.description,settings:{tone:"professional",reply_mode:"approval_required"}
  }).select().single();
  if(error){alert("Could not create assistant: "+error.message);return}
  agents.push(data); render(); $("#agent-modal")?.classList.remove("open");
}
(async()=>{
  const{data,error}=await client.auth.getSession();
  if(error||!data.session){location.href="login.html";return}
  const u=data.session.user,n=u.user_metadata?.full_name||u.email?.split("@")[0]||"User";
  $("#account-name").textContent=n; $("#avatar").textContent=n[0].toUpperCase();
  const{data:b,error:be}=await client.from("businesses").select("id,name,timezone").eq("owner_id",u.id).order("created_at",{ascending:true}).limit(1);
  if(be||!b?.length){location.href="onboarding.html";return}
  business=b[0]; sessionStorage.setItem("kaabe_business_id",business.id);
  $("#side-business").textContent=business.name; $("#side-zone").textContent=business.timezone||"Europe/Berlin";
  await loadAgents();
  if(new URLSearchParams(location.search).get("create")==="1") $("#agent-modal")?.classList.add("open");
})();
$("#menu-btn")?.addEventListener("click",()=>$("#sidebar")?.classList.toggle("open"));
const modal=$("#agent-modal");
$("#create-agent")?.addEventListener("click",()=>modal?.classList.add("open"));
$("#modal-close")?.addEventListener("click",()=>modal?.classList.remove("open"));
modal?.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("open")});


// Robust template click handler (works for taps on button text/icons too)
document.addEventListener("click", async (e)=>{
  const btn=e.target.closest?.("[data-template]");
  if(!btn) return;
  e.preventDefault();
  if(btn.dataset.busy==="1") return;
  btn.dataset.busy="1";
  const old=btn.textContent;
  btn.textContent="Creating…";
  try{ await createFromTemplate(btn.dataset.template); }
  finally{ btn.dataset.busy="0"; btn.textContent=old; }
});

// Direct mobile-safe handler used by template buttons.
window.kaabeCreateAgent=async function(key,btn){
  if(!business){
    alert("Business is still loading. Close this window and try again in a moment.");
    return;
  }
  if(!templates[key]){
    alert("Unknown assistant template.");
    return;
  }
  const old=btn?.textContent||"Create";
  if(btn){btn.disabled=true;btn.textContent="Creating…";}
  try{
    await createFromTemplate(key);
  }catch(err){
    alert("Create failed: "+(err?.message||String(err)));
  }finally{
    if(btn){btn.disabled=false;btn.textContent=old;}
  }
};
