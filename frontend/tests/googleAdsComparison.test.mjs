import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adsComparison} from '../src/googleAdsComparison.ts';
const row=(id,date,clicks,conversions=2,spend=20)=>({id,date,currency:'CHF',clicks,impressions:100,conversions,spend});
const report=(daily)=>({daily,start:'2026-10-01',end:'2026-10-04',previous_start:'2026-09-01',previous_end:'2026-09-30'});
test('Google Ads compares same selected IDs and equal days, excludes today',()=>{
 const d=report([row('a','2026-10-01',10),row('a','2026-10-02',20),row('a','2026-10-05',999),row('a','2026-09-01',5),row('a','2026-09-02',10),row('a','2026-09-03',999),row('b','2026-10-01',999)]);
 const c=adsComparison(d,['a'],'CHF');assert.equal(c.current.clicks,30);assert.equal(c.previous.clicks,15);assert.equal(c.end,'2026-10-02');assert.equal(c.previous_end,'2026-09-02');
});
test('CPA is computed from sums, zero remains zero, missing blocks',()=>{
 const c=adsComparison(report([row('a','2026-10-01',0,0,0),row('b','2026-10-01',10,10,20),row('a','2026-09-01',10,1,10),row('b','2026-09-01',20,9,90)]),['a','b'],'CHF');assert.equal(c.current.cpa,2);assert.equal(c.previous.cpa,10);
 const zero=adsComparison(report([row('a','2026-10-01',0,0,0),row('a','2026-09-01',10)]),['a'],'CHF');assert.equal(zero.current.clicks,0);assert.equal(zero.current.cpa,null);
 assert.ok(adsComparison(report([row('a','2026-10-02',10),row('a','2026-09-01',10)]),['a'],'CHF').reason);
 assert.ok(adsComparison(report(null),['a'],'CHF').reason);
});
