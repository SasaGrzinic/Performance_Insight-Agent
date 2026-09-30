import {test} from 'node:test';
import assert from 'node:assert/strict';
import {metricRecommendations} from '../src/recommendations.ts';
test('rule recommendations use only finite observed values and retain real zero',()=>{
 const c=(id,value,previous)=>({id,name:id,primary:'views',fields:{views:'Aufrufe'},values:{views:value},previous:{views:previous}});
 const result=metricRecommendations({partial:true,channels:[c('missing',undefined,10),c('invalid',NaN,10),c('zero',0,10),c('youtube',20,0)]});
 assert.deepEqual(result.map(r=>r.channel),['zero','youtube']);
 assert.equal(result[0].priority,'high');
 assert.deepEqual(result[0].evidence,['zero.views']);
 assert.match(result[0].caveat,/keine KI-Analyse/);
 assert.match(result[0].caveat,/unvollständig/);
});
