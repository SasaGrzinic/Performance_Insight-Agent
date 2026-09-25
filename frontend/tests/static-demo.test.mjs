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

test('analytics demo uses synthetic page cohorts and source metrics', async()=>{
  const {demoAnalytics,demoMonthlySources,demoAnalyticsTraffic}=await import('../src/analyticsDemo.ts');
  for(const area of ['campaign','profile','competence','blog','behind','news','stories']){
    const report=demoAnalytics(area,'2026-06');
    assert.ok(report.pages.every(p=>p.title.startsWith('Demo:')&&p.path.startsWith('/demo/')&&p.published_at.startsWith('2026-06')));
  }
  assert.equal(demoAnalytics('blog','2026').pages.length,6);
  assert.equal(demoMonthlySources('2026-02').end,'2026-02-28');
  assert.equal(demoMonthlySources('2026-02').ai.sessions,40);
  assert.equal(demoAnalyticsTraffic().ai.sessions,8);
});
