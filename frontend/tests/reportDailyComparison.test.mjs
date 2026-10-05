import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dailyReportChange} from '../src/reportDailyComparison.ts';
test('Daily comparison distinguishes decrease, zero, missing and untrusted values',()=>{
 assert.equal(dailyReportChange(120,100),20);
 assert.equal(dailyReportChange(50,100),-50);
 assert.equal(dailyReportChange(0,100),-100);
 for(const pair of [[null,100],[10,null],[10,0],[NaN,10],[10,Infinity]])assert.equal(dailyReportChange(...pair),null);
 assert.equal(dailyReportChange(120,100,false),null);
});
