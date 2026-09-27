const vm=require('node:vm'),assert=require('node:assert/strict'),fs=require('node:fs');
const code=fs.readFileSync(require('node:path').join(__dirname,'../site-events-v1.js'),'utf8');
function harness(host='loops.uz'){
 const sent=[],observed=[],listeners={};const w={ym:(...a)=>sent.push(['ym',...a]),datafast:(...a)=>sent.push(['df',...a]),dispatchEvent:e=>observed.push(e.detail)};
 vm.runInNewContext(code,{window:w,document:{addEventListener:(name,f)=>listeners[name]=f},location:{hostname:host,pathname:'/target/',origin:`https://${host}`,href:`https://${host}/target/?secret=private`},CustomEvent:function(n,o){this.detail=o.detail},Set,URL});
 return {w,sent,observed,click:(href,prevented=false)=>listeners.click({target:{closest:()=>({href})},defaultPrevented:prevented})};
}
let h=harness();h.click('https://t.me/dani_gzv?text=SECRET-NAME-PHONE');assert.equal(h.sent.length,2);assert(!JSON.stringify(h.sent).includes('SECRET'));assert(!JSON.stringify(h.sent).includes('private'));assert.equal(h.observed[0].name,'contact_click');
h.click('https://loops.uz/cases/case-nwl/',true);assert.equal(h.sent.length,2);
h.click('https://loops.uz/cases/case-nwl/');assert.equal(h.observed.at(-1).name,'case_full_open');assert.equal(h.observed.at(-1).params.case_id,'nwl');
h.w.loopsTrack('lead_received');assert.equal(h.sent.length,4);
h.w.loopsTrack('brief_prepared','invalid id');assert.equal(h.observed.at(-1).params.case_id,undefined);
h=harness('127.0.0.1');h.w.loopsTrack('brief_prepared');assert.equal(h.sent.length,0);assert.equal(h.observed.length,1);
console.log('Analytics: local exclusion, event distinction, PII exclusion and navigation tests passed');
