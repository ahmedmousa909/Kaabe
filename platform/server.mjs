import {createServer} from "node:http";
import {randomUUID} from "node:crypto";
import {runWorkflow,validateWorkflow} from "./engine.mjs";
import {templates} from "./templates.mjs";
const port=Number(process.env.PORT||8787), host=process.env.HOST||"127.0.0.1";
const maxBody=65536;const workflows=new Map();const runs=new Map();
const send=(res,status,body)=>{res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"});res.end(JSON.stringify(body));};
async function json(req){let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>maxBody)throw Error("Payload too large");chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString("utf8"));}
const server=createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,"http://localhost");
 if(req.method==="GET"&&url.pathname==="/health")return send(res,200,{ok:true,service:"kaabe-engine",mode:"development"});
 if(req.method==="GET"&&url.pathname==="/api/templates")return send(res,200,{templates});
 if(req.method==="POST"&&url.pathname==="/api/workflows/validate"){const flow=await json(req);const errors=validateWorkflow(flow);return send(res,errors.length?422:200,{valid:errors.length===0,errors});}
 // This prototype deliberately does not expose remote execution: production auth,
 // tenant isolation, durable queues, rate limits and audit logging are prerequisites.
 if(url.pathname.startsWith("/api/"))return send(res,501,{error:"Endpoint not available in development prototype"});
 send(res,404,{error:"Not found"});
 }catch(e){send(res,e.message==="Payload too large"?413:400,{error:e.message});}
});
if(import.meta.url===new URL(process.argv[1],"file:").href)server.listen(port,host,()=>console.log("KAABE development API listening on "+host+":"+port));
export {server};
