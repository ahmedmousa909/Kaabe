const menu=document.querySelector(".hamburger"),panel=document.querySelector(".mobile-menu");
menu?.addEventListener("click",()=>{const open=panel.classList.toggle("open");menu.textContent=open?"✕":"☰";menu.setAttribute("aria-expanded",open)});
panel?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{panel.classList.remove("open");menu.textContent="☰";menu.setAttribute("aria-expanded","false")}));
const language=document.querySelector(".language"),trigger=document.querySelector(".lang-trigger");
trigger?.addEventListener("click",e=>{e.stopPropagation();language.classList.toggle("open")});
document.addEventListener("click",()=>language?.classList.remove("open"));
const tr={en:{home:"Home",product:"Product",solutions:"Solutions",pricing:"Pricing",resources:"Resources",login:"Login",getStarted:"Get Started",getStartedFree:"Get Started Free →"},so:{home:"Bogga Hore",product:"Adeegga",solutions:"Xalalka",pricing:"Qiimaha",resources:"Khayraadka",login:"Gal",getStarted:"Bilow",getStartedFree:"Bilaash Ku Bilow →"}};
function setLang(code){const d=tr[code]||tr.en;document.documentElement.lang=code;document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(d[k])el.textContent=d[k]});const lc=document.querySelector("#lang-code");if(lc)lc.textContent=code.toUpperCase();localStorage.setItem("kaabe-language",code);language?.classList.remove("open")}
document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));setLang(localStorage.getItem("kaabe-language")||"en");