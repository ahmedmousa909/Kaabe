const client=window.kaabeSupabase,$=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
function closeSidebar(){ $("#sidebar")?.classList.remove("open"); $("#sidebar-backdrop")?.classList.remove("open"); }
function openSidebar(){ $("#sidebar")?.classList.add("open"); $("#sidebar-backdrop")?.classList.add("open"); }
function toast(t){const x=$("#toast");if(!x)return;x.textContent=t;x.classList.add("show");clearTimeout(window._kt);window._kt=setTimeout(()=>x.classList.remove("show"),2200)}
(async()=>{const {data,error}=await client.auth.getSession();if(error||!data.session){location.href="login.html";return}const user=data.session.user;const full=user.user_metadata?.full_name||user.email?.split("@")[0]||"User";$("#welcome-name").textContent=full.split(" ")[0];$("#account-name").textContent=full;$("#avatar").textContent=full.charAt(0).toUpperCase();const {data:biz,error:bizError}=await client.from("businesses").select("id,name,timezone").eq("owner_id",user.id).order("created_at",{ascending:true}).limit(1);if(bizError)return;if(!biz||!biz.length){location.href="onboarding.html";return}sessionStorage.setItem("kaabe_business_id",biz[0].id);$("#side-business").textContent=biz[0].name;$("#side-zone").textContent=biz[0].timezone||"Europe/Berlin"})();
$("#menu-btn")?.addEventListener("click",()=>$("#sidebar")?.classList.contains("open")?closeSidebar():openSidebar());
$("#sidebar-close")?.addEventListener("click",closeSidebar);$("#sidebar-backdrop")?.addEventListener("click",closeSidebar);
$("#logout")?.addEventListener("click",async()=>{await client.auth.signOut();sessionStorage.removeItem("kaabe_business_id");location.href="index.html"});
$("#quick-create-assistant")?.addEventListener("click",()=>location.href="assistants.html?create=1");
$$("[data-agent]").forEach(b=>b.addEventListener("click",()=>location.href=`assistants.html?focus=${encodeURIComponent(b.dataset.agent)}`));
$$("[data-coming]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();closeSidebar();toast(el.dataset.coming+" is the next Kaabe module to connect.");}));
$("#range-btn")?.addEventListener("click",()=>toast("Dashboard range: Last 7 days"));
document.getElementById("nav-knowledge")?.addEventListener("click",(e)=>{
  e.preventDefault();
  window.location.assign("./knowledge.html");
});
document.getElementById("quick-add-knowledge")?.addEventListener("click",()=>{
  window.location.assign("./knowledge.html?create=1");
});
