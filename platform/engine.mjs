// KAABE deterministic workflow engine v0.1 — no external side effects by default.
export function validateWorkflow(flow) {
 const errors=[];
 if(!flow||typeof flow!=="object") return ["Workflow must be an object"];
 if(flow.schemaVersion!=="1.0") errors.push("Unsupported schema version");
 if(!Array.isArray(flow.nodes)||!flow.nodes.length) errors.push("At least one node is required");
 if(!Array.isArray(flow.edges)) errors.push("Edges must be an array");
 if(errors.length) return errors;
 const ids=new Set();
 for(const n of flow.nodes){if(!n.id||ids.has(n.id)) errors.push("Node ID missing or duplicate: "+n.id);ids.add(n.id);}
 const adj=new Map(flow.nodes.map(n=>[n.id,[]]));const incoming=new Map(flow.nodes.map(n=>[n.id,0]));
 for(const e of flow.edges){if(!ids.has(e.source)||!ids.has(e.target)){errors.push("Edge refers to missing node");continue;}adj.get(e.source).push(e.target);incoming.set(e.target,incoming.get(e.target)+1);}
 const seen=new Set(),stack=new Set();
 function visit(id){if(stack.has(id)){errors.push("Cycle detected at "+id);return;}if(seen.has(id))return;seen.add(id);stack.add(id);for(const t of adj.get(id))visit(t);stack.delete(id);}
 for(const id of ids)visit(id);
 if(!flow.nodes.some(n=>n.type.startsWith("trigger."))) errors.push("Missing trigger");
 if(!flow.nodes.some(n=>n.type.startsWith("trigger.")&&incoming.get(n.id)===0)) errors.push("No root trigger");
 return [...new Set(errors)];
}
export function resolvePath(data,path){return String(path).split(".").reduce((v,k)=>v==null?undefined:v[k],data);}
export function autoMap(source,fields){
 const result={},unmapped=[];
 for(const field of fields){if(Object.prototype.hasOwnProperty.call(source,field))result[field]=source[field];else unmapped.push(field);}
 return {mapped:result,unmapped,requiresReview:unmapped.length>0};
}
export async function runWorkflow(flow,input={},handlers={}){
 const errors=validateWorkflow(flow);if(errors.length)throw new Error(errors.join("; "));
 const nodes=new Map(flow.nodes.map(n=>[n.id,n]));const incoming=new Map(flow.nodes.map(n=>[n.id,0]));const outgoing=new Map(flow.nodes.map(n=>[n.id,[]]));
 for(const e of flow.edges){incoming.set(e.target,incoming.get(e.target)+1);outgoing.get(e.source).push(e);}
 const roots=flow.nodes.filter(n=>incoming.get(n.id)===0&&n.type.startsWith("trigger."));
 const results={},timeline=[];const queue=roots.map(n=>({id:n.id,data:input}));let steps=0;
 while(queue.length){if(++steps>500)throw new Error("Execution step limit exceeded");
 const {id,data}=queue.shift(),node=nodes.get(id);let output;
 try{
 if(node.type.startsWith("trigger."))output=data;
 else if(node.type==="action.transform"){output={...data,...(node.config?.set||{})};}
 else if(node.type==="logic.if"){const v=resolvePath(data,node.config?.field||"");output={...data,__condition:v===node.config?.equals};}
 else if(node.type==="logic.end")output=data;
 else {const handler=handlers[node.type];if(typeof handler!=="function")throw new Error("No authorized handler configured for "+node.type);output=await handler({input:data,config:node.config,nodeId:id});}
 results[id]=output;timeline.push({nodeId:id,status:"success"});
 }catch(e){timeline.push({nodeId:id,status:"failed",error:String(e.message||e)});return {status:"failed",timeline,results};}
 for(const edge of outgoing.get(id)){if(node.type==="logic.if"&&edge.sourceHandle&&edge.sourceHandle!==String(Boolean(output.__condition)))continue;queue.push({id:edge.target,data:output});}
 }
 return {status:"success",timeline,results};
}
