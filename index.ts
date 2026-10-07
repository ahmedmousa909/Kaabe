import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const json=(x:any,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{...cors,"Content-Type":"application/json"}});
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const auth=req.headers.get("Authorization"); if(!auth)return json({error:"Not authenticated"},401);
  const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:auth}}});
  const {data:{user}}=await sb.auth.getUser(); if(!user)return json({error:"Invalid session"},401);
  const {message,agent_id}=await req.json(); if(!message||!agent_id)return json({error:"message and agent_id required"},400);
  const {data:a,error:ae}=await sb.from("agents").select("*").eq("id",agent_id).single(); if(ae||!a)return json({error:"Assistant not found"},404);
  const {data:k,error:ke}=await sb.from("knowledge_items").select("category,title,content").eq("business_id",a.business_id); if(ke)throw ke;
  const kb=(k||[]).map((x:any)=>`[${x.category}] ${x.title}\n${x.content}`).join("\n\n");
  const instructions=a.settings?.instructions||"You are a helpful business assistant.";
  const system=`${instructions}\n\nBUSINESS KNOWLEDGE:\n${kb||"No business knowledge yet."}\n\nRULES:\n- Use the knowledge for business facts.\n- Never invent prices, hours, policies, availability, or services.\n- If information is missing, say you do not have it yet.\n- Reply in the customer's language.`;
  const key=Deno.env.get("OPENAI_API_KEY"); if(!key)return json({error:"OPENAI_API_KEY is not configured"},500);
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-6-luna",instructions:system,input:String(message),max_output_tokens:350})});
  const d=await r.json(); if(!r.ok)return json({error:d?.error?.message||"OpenAI request failed"},r.status);
  return json({reply:d.output_text||"",agent:a.name});
 }catch(e){return json({error:e?.message||String(e)},500)}
});