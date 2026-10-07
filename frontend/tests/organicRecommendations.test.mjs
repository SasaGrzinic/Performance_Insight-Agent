import {test} from 'node:test';
import assert from 'node:assert/strict';
import {organicAdvice} from '../src/organicRecommendations.ts';
const post=(metrics,kind='text')=>({id:'1',title:'Cloud erklärt',published_at:'2026-10-01',kind,metrics,url:'https://www.linkedin.com/feed/update/1'});
test('missing, zero clicks and stale data never invent successful posts',()=>{
 assert.deepEqual(organicAdvice(undefined,[post({clicks:0}),post({})],true),[]);
 assert.deepEqual(organicAdvice(undefined,[post({clicks:50})],false),[]);
});
test('resonance names actual post and does not fabricate missing metrics',()=>{
 const [r]=organicAdvice(undefined,[post({clicks:12,comments:0})],true);
 assert.match(r.observation,/Cloud erklärt/);assert.match(r.observation,/0 Kommentare/);assert.doesNotMatch(r.observation,/Reposts/);assert.match(r.context,/nicht automatisch Website/);
});
test('video zero views has no invented average or awareness claim',()=>{
 const [r]=organicAdvice(undefined,[post({video_views:0,watch_time_ms:100},'video')],true);
 assert.doesNotMatch(r.observation,/Ø/);assert.match(r.check,/keine Aussage/);
});
test('video average uses qualified views and milliseconds',()=>{
 const [r]=organicAdvice(undefined,[post({video_views:10,watch_time_ms:20000},'video')],true);assert.match(r.observation,/Ø 2 Sekunden/);
});
test('only comparable fresh impressions support period observation, including zero',()=>{
 const comparison={status:'comparable',stale:false,value:0,previous:20};
 assert.equal(organicAdvice({comparisons:{impressions:comparison}},[],false).length,1);
 assert.equal(organicAdvice({comparisons:{impressions:{...comparison,stale:true}}},[],false).length,0);
});
