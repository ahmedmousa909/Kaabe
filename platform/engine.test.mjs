import test from "node:test";import assert from "node:assert/strict";
import {validateWorkflow,runWorkflow,autoMap} from "./engine.mjs";
const flow={schemaVersion:"1.0",name:"Demo",nodes:[{id:"start",type:"trigger.manual",config:{}},{id:"change",type:"action.transform",config:{set:{status:"ready"}}},{id:"end",type:"logic.end",config:{}}],edges:[{source:"start",target:"change"},{source:"change",target:"end"}]};
test("valid graph",()=>assert.deepEqual(validateWorkflow(flow),[]));
test("detects cycles",()=>assert.ok(validateWorkflow({...flow,edges:[...flow.edges,{source:"end",target:"start"}]}).some(x=>x.includes("Cycle"))));
test("runs and passes data",async()=>{const r=await runWorkflow(flow,{customer:"Amina"});assert.equal(r.status,"success");assert.deepEqual(r.results.end,{customer:"Amina",status:"ready"});});
test("requires confirmation for missing mapping",()=>assert.deepEqual(autoMap({email:"a@example.com"},["email","name"]).unmapped,["name"]));
test("external actions fail closed",async()=>{const f={...flow,nodes:[flow.nodes[0],{id:"change",type:"action.email",config:{}},flow.nodes[2]]};const r=await runWorkflow(f,{});assert.equal(r.status,"failed");});
