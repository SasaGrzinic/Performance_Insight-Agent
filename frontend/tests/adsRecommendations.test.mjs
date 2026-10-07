import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adsAdvice} from '../src/adsRecommendations.ts';
const c=(extra={})=>({id:'c1',name:'Echte Kampagne',status:'ACTIVE',objective:'LEAD_GENERATION',values:{},...extra});
const data=(campaigns,extra={})=>({campaigns,status:'connected',last_success:'2026-10-06',start:'2025-10-07',end:'2026-10-06',...extra});
test('demo campaigns and unconfirmed data never produce advice',()=>{
 assert.deepEqual(adsAdvice(data([c({example:true})])),[]);
 assert.deepEqual(adsAdvice(data([c()],{status:'error'})),[]);
 assert.deepEqual(adsAdvice(data([c()],{last_success:null})),[]);
});
test('draft and future start are preparation not performance assessments',()=>{
 for(const campaign of [c({status:'DRAFT'}),c({start:'2026-11-01'})]){
 const [r]=adsAdvice(data([campaign]));assert.equal(r.preparation,true);assert.match(r.action,/Lead-Gen-Formular/);assert.doesNotMatch(r.observation,/0 Leads/);
 }
});
test('missing leads are distinct from observed zero; valid completion ratio only',()=>{
 const [missing]=adsAdvice(data([c({values:{impressions:30}})]));assert.match(missing.observation,/nicht verfügbar/);
 const [zero]=adsAdvice(data([c({values:{leads:0,lead_form_opens:10}})]));assert.match(zero.observation,/Abschlussrate: 0 %/);
 for(const values of [{leads:2},{leads:2,lead_form_opens:0},{leads:4,lead_form_opens:2}])assert.doesNotMatch(adsAdvice(data([c({values})]))[0].observation,/Abschlussrate:/);
});
test('awareness does not judge campaign by clicks or claim unique reach',()=>{
 const [r]=adsAdvice(data([c({objective:'BRAND_AWARENESS',values:{impressions:500,clicks:0}})]));assert.match(r.observation,/500 Impressionen/);assert.match(r.context,/Wenige Klicks allein sind kein Misserfolg/);
});
test('website advice retains CTR sample-size context and named campaign',()=>{
 const [r]=adsAdvice(data([c({objective:'WEBSITE_VISIT',ctr:20,values:{impressions:5,landing_page_clicks:1}})]));assert.equal(r.campaign,'Echte Kampagne');assert.match(r.observation,/CTR 20 %/);assert.match(r.context,/wenigen Impressionen/);
});

test('historical metadata without measurements yields data context, not optimisation',()=>{assert.match(adsAdvice(data([c()]))[0].title,/Datenzeitraum/);});
