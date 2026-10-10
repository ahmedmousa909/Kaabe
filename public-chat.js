(()=>{const css=document.createElement('style');css.textContent=`
#kaabe-chat-launch{position:fixed;right:22px;bottom:22px;z-index:9998;border:0;border-radius:999px;padding:15px 20px;background:linear-gradient(110deg,#ffb53b,#ff750a);color:#18110b;font-weight:700;box-shadow:0 12px 30px #ff7c1a45;cursor:pointer}
#kaabe-public-chat{position:fixed;right:22px;bottom:82px;z-index:9999;width:min(380px,calc(100vw - 28px));height:min(530px,calc(100dvh - 110px));background:#fff;color:#171717;border:1px solid #e7d5c7;border-radius:18px;box-shadow:0 18px 50px #1c110b55;display:none;flex-direction:column;overflow:hidden;font-family:system-ui,sans-serif}
#kaabe-public-chat.open{display:flex}#kaabe-public-chat header{position:static;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(110deg,#100f0e,#2b180d);padding:16px;border:0;min-height:auto}#kaabe-public-chat header button{background:transparent;border:0;color:white;font-size:23px;cursor:pointer}
#kaabe-public-messages{flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:12px}#kaabe-public-messages .msg{max-width:88%;padding:11px 13px;border-radius:13px;line-height:1.5;font-size:14px;white-space:pre-wrap}#kaabe-public-messages .bot{background:#f3f3f3;color:#222;align-self:flex-start}#kaabe-public-messages .user{background:#ff9c35;color:#20140a;align-self:flex-end}
#kaabe-public-chat form{display:flex;gap:8px;padding:12px;background:#fafafa}#kaabe-public-chat input{flex:1;min-width:0;background:#fff;border:1px solid #e4d7ca;color:#171717;padding:12px;border-radius:10px}#kaabe-public-chat form button{border:0;background:#ff8515;color:#17110a;padding:10px 13px;border-radius:10px;cursor:pointer}
#kaabe-public-chat .note{font-size:11px;color:#7b7169;padding:0 12px 10px;background:#fafafa}
`;document.head.append(css);
const launch=document.getElementById('kaabe-chat-launch')||document.createElement('button');launch.id='kaabe-chat-launch';launch.textContent='✦ Ask KAABE AI';launch.setAttribute('aria-label','Open KAABE assistant');
const panel=document.createElement('section');panel.id='kaabe-public-chat';panel.setAttribute('aria-label','KAABE assistant');panel.innerHTML='<header><strong style="display:flex;align-items:center;gap:8px"><img src="kaabe-spark.svg" alt="" style="width:29px;height:29px"> Kaabe AI Assistant</strong><button type="button" aria-label="Close chat">×</button></header><div id="kaabe-public-messages" role="log" aria-live="polite"></div><form><input aria-label="Your question" placeholder="Ask about KAABE..." maxlength="500" required><button type="submit">Send</button></form><div class="note">KAABE AI · Multilingual assistant</div>';document.body.append(launch,panel);
const messages=panel.querySelector('#kaabe-public-messages');function add(text,who){const e=document.createElement('div');e.className='msg '+who;e.textContent=text;messages.append(e);messages.scrollTop=messages.scrollHeight}
add('Welcome to KAABE AI! 👋 I am here to help you explore KAABE, create your account, and learn about our services. Ask me in any language you prefer.','bot');
launch.onclick=()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))panel.querySelector('input').focus()};panel.querySelector('header button').onclick=()=>panel.classList.remove('open');
const history=[];let busy=false;
panel.querySelector('form').onsubmit=async e=>{
e.preventDefault();if(busy)return;
const input=panel.querySelector('input'),q=input.value.trim();if(!q)return;
input.value='';add(q,'user');const send=panel.querySelector('form button');busy=true;send.disabled=true;
const pending=document.createElement('div');pending.className='msg bot';pending.textContent='KAABE AI is thinking…';messages.append(pending);messages.scrollTop=messages.scrollHeight;
try{
const response=await fetch('https://zrjuflogyaxortzktmbh.supabase.co/functions/v1/kaabe-public-ai',{method:'POST',headers:{'Content-Type':'application/json','apikey':'sb_publishable_xUVlWrvr2wjdg9k6_efleQ_6VaqAvsx'},body:JSON.stringify({message:q,history:history.slice(-6)})});
const data=await response.json();
if(!response.ok||!data.reply)throw new Error(data.error||'AI service unavailable');
pending.textContent=data.reply;history.push({role:'user',content:q},{role:'assistant',content:data.reply});if(history.length>8)history.splice(0,history.length-8);
}catch(err){pending.textContent='KAABE AI is temporarily unavailable. Please try again later. / KAABE AI hadda lama heli karo. Fadlan mar kale isku day.';console.warn('KAABE public AI:',err.message)}
finally{busy=false;send.disabled=false}
};
})();