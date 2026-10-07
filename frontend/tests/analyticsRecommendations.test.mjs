import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyticsAdvice} from '../src/analyticsRecommendations.ts';
const sources={updated_at:'2026-10-06',sources:[],ai:{providers:[],evidence:[]}};
test('missing provider is never reported as zero',()=>{const [r]=analyticsAdvice(undefined,sources);assert.match(r.observation,/Claude: keine zugeordnete/);assert.doesNotMatch(r.observation,/0 Sitzungen/);});
test('observed AI sources preserved without guessing bing or direct',()=>{const [r]=analyticsAdvice(undefined,{...sources,ai:{providers:[{label:'Microsoft Copilot',value:8}],evidence:[]}});assert.match(r.observation,/Microsoft Copilot: 8 Sitzungen/);});
test('warnings and thresholding suppress unreliable recommendations',()=>{assert.deepEqual(analyticsAdvice(undefined,{...sources,warning:'stale'}),[]);assert.deepEqual(analyticsAdvice(undefined,{...sources,thresholded:true}),[]);});
test('monthly pages must have recognized category and observed values',()=>{const p={updated_at:'2026-10-06',pages:[{path:'/blog/a',title:'Thema',kind:'blog',current:{screenPageViews:12}},{path:'/services/support',kind:'service',current:{screenPageViews:200}}]};const r=analyticsAdvice(p);assert.equal(r.length,2);assert.match(r[0].observation,/Thema/);assert.match(r[0].observation,/Berichtsmonat/);});
