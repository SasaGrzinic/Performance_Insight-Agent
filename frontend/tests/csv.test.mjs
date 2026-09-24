import {test} from 'node:test';
import assert from 'node:assert/strict';
import {csv} from '../src/csv.ts';
test('CSV keeps zeros and missing values distinct and protects spreadsheet formulas',()=>{
 assert.equal(csv([['Title;"x"',0,null,'=HYPERLINK("bad")',-2,'line\nbreak']]),'\uFEFF"Title;""x""";"0";"";"\'=HYPERLINK(""bad"")";"-2";"line\nbreak"');
});
