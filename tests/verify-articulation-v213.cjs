'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const filepath=process.argv[2];
if(!filepath) throw Error('usage: node test.cjs app.js');
const s=fs.readFileSync(filepath,'utf8');
let start=s.indexOf('var ARTICULATION_GROUPS = [');
let end=s.indexOf('function cancelArticulationAutoNext()',start);
assert(start>=0&&end>start, 'source group area exists');
const context={Math,Set};
vm.runInNewContext(s.slice(start,end),context);
const arr=Array.from(context.ARTICULATION_GROUPS);
assert.equal(arr.length,6,'six groups');
assert.deepEqual(Array.from(arr.map(g=>g.letters.length)),[5,5,5,5,5,3]);
assert.equal(new Set(arr.flatMap(g=>Array.from(g.letters))).size,28);
const all=arr.flatMap(g=>Array.from(context.buildArticulationGroupQuestions(g.id)));
assert.equal(all.length,28);
const bySound=Object.fromEntries(all.map(q=>[q.answer,q]));
for(const [a,b] of [['ファ','フィ'],['フィ','フェ'],['や','ゆ'],['し','ち'],['た','て'],['な','ね']]) assert.notEqual(a,b);
for(const letter of ['ファ','フィ','フェ','フォ']) {
 assert.equal(bySound[letter].navPlace,'lips',letter+' uses lips');
 assert.match(bySound[letter].navGuide,/歯で下唇をかむ必要はありません/);
}
assert.equal(bySound['ヴァ'].navPlace,'labiodental','foreign v comparison only');
assert.match(bySound['ヴァ'].navGuide,/個人差/);
for(const letter of ['や','ゆ','よ'])assert.match(bySound[letter].navDisplayName,/硬口蓋接近音/);
assert.match(bySound['し'].navDisplayName,/摩擦音/);
assert.match(bySound['ち'].navDisplayName,/破擦音/);
assert.equal(bySound['し'].navPlace,'alveolopalatal');
assert.equal(bySound['ち'].navPlace,'alveolopalatal');
assert.match(bySound['た'].navGuide,/空気を一度止めてから離します/);
assert.match(bySound['な'].navGuide,/鼻に息を通します/);
for(let i=0;i<1000;i++) {
 const q=context.buildRandomArticulationQuiz();
 assert.equal(q.length,5);
 assert.equal(new Set(q.map(x=>x.navGroup)).size,5);
 assert.equal(new Set(q.map(x=>x.answer)).size,5);
}
assert(s.includes('q.navDisplayName || group.name'),'per-sound header');
assert(s.includes('positions[q.navPlace || group.place]'),'per-sound diagram');
assert(s.includes('認識一致 '),'recognition score is disambiguated');
assert(s.includes('認識文字が一致しませんでした。聞き取りの誤りの可能性もあります。'),'no incorrect clinical claim');
console.log('PASS: 28 sounds, 6 groups, 5 random questions, per-sound guides, recognition-label safety');
