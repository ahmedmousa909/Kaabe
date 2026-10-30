// Templates are draft workflows, never automatically activated.
const wf=(name,nodes,edges)=>({schemaVersion:"1.0",name,nodes:nodes.map(([id,type,config={}])=>({id,type,config})),edges:edges.map(([source,target])=>({source,target}))});
export const templates=[
 wf("WhatsApp customer support",[["message","trigger.webhook"],["agent","action.ai",{task:"Reply using approved business knowledge"}],["reply","action.http",{integration:"whatsapp-business"}]],[["message","agent"],["agent","reply"]]),
 wf("Gmail to Google Sheets",[["email","trigger.webhook"],["sheet","action.http",{integration:"google-sheets"}]],[["email","sheet"]]),
 wf("Telegram AI assistant",[["message","trigger.webhook"],["agent","action.ai"],["send","action.http",{integration:"telegram"}]],[["message","agent"],["agent","send"]]),
 wf("Appointment request",[["request","trigger.webhook"],["agent","action.ai",{task:"Extract appointment details"}],["end","logic.end"]],[["request","agent"],["agent","end"]]),
 wf("Airtable lead capture",[["lead","trigger.webhook"],["create","action.http",{integration:"airtable"}]],[["lead","create"]])
];
