import {test} from 'node:test';
import assert from 'node:assert/strict';
import {linkedinAdsBenchmark,googleAdsBenchmark,ownPostMedian} from '../src/benchmarks.ts';
test('Ads references do not cross objectives, definitions, currencies or networks',()=>{
 assert.equal(linkedinAdsBenchmark('BRAND_AWARENESS','ctr','CHF'),undefined);
 assert.equal(linkedinAdsBenchmark('WEBSITE_VISIT','landing_page_ctr','CHF'),undefined);
 assert.equal(linkedinAdsBenchmark('WEBSITE_VISIT','cpc','USD'),undefined);
 assert.equal(linkedinAdsBenchmark('WEBSITE_VISIT','ctr','CHF').value,'0.63 %');
 assert.equal(linkedinAdsBenchmark('BRAND_AWARENESS','cpm','CHF').value,'CHF 10.12');
 assert.equal(googleAdsBenchmark('DISPLAY','ctr'),undefined);
 assert.equal(googleAdsBenchmark('PERFORMANCE_MAX','ctr'),undefined);
 assert.equal(googleAdsBenchmark('SEARCH','cpc'),undefined);
 assert.equal(googleAdsBenchmark('SEARCH','ctr').value,'6.10 %');
});
test('Own median separates formats and excludes unknown metrics without inventing zero',()=>{
 const p=(clicks,kind='video')=>({kind,metrics:{impressions:100,clicks,likes:0,comments:0,shares:0}});
 assert.equal(ownPostMedian([p(1),p(3)],'video'),undefined);
 assert.deepEqual(ownPostMedian([p(0),p(2),p(8),p(100,'image'),p(undefined)],'video'),{value:2,count:3});
 assert.deepEqual(ownPostMedian([p(0),p(2),p(8),p(10)],'video'),{value:5,count:4});
 assert.equal(ownPostMedian([p(1),p(NaN),p(-2)],'video'),undefined);
});
