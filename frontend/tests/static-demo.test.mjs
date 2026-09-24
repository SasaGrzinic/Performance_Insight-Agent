import assert from 'node:assert/strict';
import {test} from 'node:test';
import {staticDemoResponse,demoCampaigns} from '../src/staticDemo.ts';
test('public demo has synthetic data and no private API fallback',()=>{
  assert.throws(()=>staticDemoResponse('/auth/me'));
  assert.throws(()=>staticDemoResponse('/linkedin/ads/campaigns'));
  const d=staticDemoResponse('/demo/dashboard?month=2027-02');
  assert.equal(d.demo,true);assert.equal(d.series.length,28);
  assert.equal(d.series.at(-1).date,'2027-02-28');
  assert.equal(d.comparison_month,'2027-01');
  assert.ok(d.channels.every(c=>c.status==='demo'));
  assert.ok(demoCampaigns().campaigns.every(c=>c.name.startsWith('Demo:')));
});
