import {test} from 'node:test';
import assert from 'node:assert/strict';
import {completeSum,engagement,aggregateLinkedIn,yearMonths} from '../src/linkedinMetrics.ts';
test('missing or invalid months are not counted as zero',()=>{
 assert.equal(completeSum([0,10]),10);
 for(const values of [[],[undefined,10],[NaN,1],[null,2]]) assert.equal(completeSum(values),undefined);
 const d={channels:[{id:'linkedin_organic',values:{impressions:10}}]};
 assert.equal(aggregateLinkedIn([d,undefined]).impressions,undefined);
 assert.equal(aggregateLinkedIn([d,d]).impressions,20);
});
test('engagement uses weighted totals and requires all constituents',()=>{
 assert.equal(engagement({impressions:58000,clicks:1400,likes:740,comments:120,shares:60}),4);
 assert.equal(engagement({impressions:0,clicks:0,likes:0,comments:0,shares:0}),undefined);
 assert.equal(engagement({impressions:100,clicks:10}),undefined);
});
test('year selection follows Swiss calendar including year boundary',()=>{
 assert.deepEqual(yearMonths(new Date('2025-12-31T23:30:00Z')),['2026-01']);
 assert.equal(yearMonths(new Date('2026-09-29T20:42:00Z')).length,9);
});
