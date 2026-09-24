import {test} from 'node:test';
import assert from 'node:assert/strict';
import {comparisonSeries} from '../src/comparison.ts';

test('calendar day alignment preserves zeros, missing days and different month lengths',()=>{
 const points=comparisonSeries(['2024-02','2024-03'],[{series:[{day:1,clicks:0},{day:29,clicks:8}]},{series:[{day:1,clicks:3},{day:31,clicks:12}]}],'clicks');
 assert.equal(points.length,31);
 assert.equal(points[0]['2024-02'],0);
 assert.equal(points[28]['2024-02'],8);
 assert.equal(points[30]['2024-02'],null);
 assert.equal(points[30]['2024-03'],12);
 assert.equal(points[1]['2024-03'],null);
});
test('unloaded comparison and unavailable metrics never become zero',()=>{
 assert.deepEqual(comparisonSeries(['2026-08','2026-07'],[{series:[{day:1,impressions:20}]},undefined],'clicks'),[{day:1,'2026-08':null,'2026-07':null}]);
});

import {averageWatchSeconds, postsOnDay} from '../src/comparison.ts';
test('average viewing duration uses milliseconds per qualifying view, never viewers',()=>{
 assert.equal(averageWatchSeconds({watch_time_ms:12000,video_views:4,video_viewers:2}),3);
 assert.equal(averageWatchSeconds({watch_time_ms:0,video_views:4}),0);
 assert.equal(averageWatchSeconds({watch_time_ms:12000,video_views:0}),undefined);
 assert.equal(averageWatchSeconds({video_views:4}),undefined);
});
test('hover associates all posts by exact publication date across compared months',()=>{
 const posts=[{published_at:'2026-08-06T12:00:00Z',title:'A'},{published_at:'2026-08-06T13:00:00Z',title:'B'},{published_at:'2026-07-06T12:00:00Z',title:'C'}];
 assert.deepEqual(postsOnDay(posts,'2026-08',6).map(p=>p.title),['A','B']);
 assert.equal(postsOnDay(posts,'2026-08',7).length,0);
});
