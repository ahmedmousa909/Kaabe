const client=window.kaabeSupabase;const $=s=>document.querySelector(s);(async()=>{const {data,error}=await client.auth.getSession();if(error||!data.session){location.href="login.html";return}const user=data.session.user;const full=user.user_metadata?.full_name||user.email?.split("@")[0]||"User";$("#welcome-name").textContent=full.split(" ")[0];$("#account-name").textContent=full;$("#avatar").textContent=full.charAt(0).toUpperCase();const {data:biz,error:bizError}=await client.from("businesses").select("id,name,timezone").eq("owner_id",user.id).order("created_at",{ascending:true}).limit(1);if(bizError)return;if(!biz||!biz.length){location.href="onboarding.html";return}sessionStorage.setItem("kaabe_business_id",biz[0].id);$("#side-business").textContent=biz[0].name;$("#side-zone").textContent=biz[0].timezone||"Europe/Berlin"})();$("#menu-btn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));$("#logout").addEventListener("click",async()=>{await client.auth.signOut();sessionStorage.removeItem("kaabe_business_id");location.href="index.html"});
// Reliable dashboard navigation (mobile + desktop)
document.getElementById("nav-ai-assistants")?.addEventListener("click",(e)=>{
  e.preventDefault();
  window.location.assign("./assistants.html");
});
document.getElementById("manage-ai-assistants")?.addEventListener("click",(e)=>{
  e.preventDefault();
  window.location.assign("./assistants.html");
});
document.getElementById("quick-create-assistant")?.addEventListener("click",()=>{
  window.location.assign("./assistants.html?create=1");
});
