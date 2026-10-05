import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reportFact,reportChapterFacts} from '../src/reportEvidence.ts';
const channel={id:'analytics',name:'Analytics',values:{sessions:0},fields:{sessions:'Sitzungen'},units:{sessions:'count'}};
test('Report facts preserve zero, missing and suppress unverified comparisons',()=>{
 assert.equal(reportFact({channels:[channel]},'analytics','sessions').value,'0');
 assert.equal(reportFact({channels:[channel]},'analytics','engaged_sessions').value,'—');
 const c={...channel,comparisons:{sessions:{status:'comparable',stale:true,value:20,previous:10}}};
 assert.equal(reportFact({channels:[c]},'analytics','sessions').change,null);
 c.comparisons.sessions.stale=false;
 assert.equal(reportFact({channels:[c]},'analytics','sessions').direction,'up');
 c.comparisons.sessions.previous=0;
 assert.equal(reportFact({channels:[c]},'analytics','sessions').change,null);
});
test('Report events use event stock and actual employee field',()=>{
 const e={id:'events',name:'Events',fields:{},values:{employees:999},units:{},event_summary:{values:{employees:12,customers:0},coverage:{employees:{known:2}},event_count:3,notice:'Bestand'}};
 const facts=reportChapterFacts({channels:[e]},'marketing',2);
 assert.equal(facts[1].value,'12');assert.equal(facts[1].label,'Sonio');assert.equal(facts[3].value,'0');assert.equal(facts[0].value,'—');
});
