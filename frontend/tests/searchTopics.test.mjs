import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchTopic,topicTotals} from '../src/searchTopics.ts';
test('specific themes override brand and generic services across languages',()=>{
 for(const term of ['Sonio cloud consulting','infrastructure services','serveur cloud']) assert.equal(searchTopic(term),'cloud');
 assert.equal(searchTopic('gestion des données'),'data');
 assert.equal(searchTopic('sécurité'),'security');
 assert.equal(searchTopic('Sonio jobs'),'people');
 assert.equal(searchTopic('Sonio AG'),'brand');
 assert.equal(searchTopic('poste de travail'),'workplace');
});
test('ambiguous and unknown terms stay unassigned, without double counting',()=>{
 assert.equal(searchTopic('cloud backup'),'other');
 assert.equal(searchTopic('unknown person'),'other');
 const rows=[{term:'cloud',clicks:4,impressions:20},{term:'cloud backup',clicks:2,impressions:8},{term:'Sonio AG',clicks:10,impressions:40}];
 const totals=topicTotals(rows);
 assert.equal(totals.reduce((s,t)=>s+t.count,0),3);
 assert.equal(totals.reduce((s,t)=>s+t.clicks,0),16);
 assert.equal(totals.reduce((s,t)=>s+t.impressions,0),68);
});
