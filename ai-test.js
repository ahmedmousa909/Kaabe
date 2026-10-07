const c=window.kaabeSupabase,$=s=>document.querySelector(s);
(async()=>{
  const {data:s,error:se}=await c.auth.getSession();
  if(se||!s.session){$("#reply").textContent="SESSION ERROR: Please log in to Kaabe again.";return}
  const {data:b,error:be}=await c.from("businesses").select("id").eq("owner_id",s.session.user.id).limit(1);
  if(be||!b?.length){$("#reply").textContent="BUSINESS ERROR: "+(be?.message||"No business found");return}
  const {data:a,error:ae}=await c.from("agents").select("id,name,type").eq("business_id",b[0].id);
  if(ae){$("#reply").textContent="AGENT ERROR: "+ae.message;return}
  $("#agent").innerHTML=(a||[]).map(x=>`<option value="${x.id}">${x.name} (${x.type})</option>`).join("");
})();
$("#send").onclick=async()=>{
  const reply=$("#reply"), btn=$("#send");
  btn.disabled=true; reply.textContent="Sending request...";
  try{
    const {data,error}=await c.functions.invoke("kaabe-ai",{body:{
      agent_id:$("#agent").value,
      message:$("#message").value.trim()
    }});
    if(error){
      let details=error.message||String(error);
      try{
        if(error.context){
          const raw=await error.context.text();
          if(raw) details+="\nSERVER RESPONSE:\n"+raw;
        }
      }catch(_){}
      reply.textContent="FUNCTION ERROR:\n"+details;
    }else{
      reply.textContent="RAW RESPONSE:\n"+JSON.stringify(data,null,2);
      if(data?.reply) reply.textContent="KAABE AI:\n"+data.reply;
      else if(data?.error) reply.textContent="BACKEND ERROR:\n"+data.error+"\n\nRAW:\n"+JSON.stringify(data,null,2);
    }
  }catch(e){reply.textContent="CLIENT ERROR:\n"+(e?.message||String(e))}
  btn.disabled=false;
};