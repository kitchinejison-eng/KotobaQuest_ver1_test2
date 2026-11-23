// Node.js v18以上で実行できます: node tests/catch_integrated_v210_selftest.js
const assert=require('node:assert/strict');
const lab=require("./../scripts/training/catch-integrated-v210.js");
const ids=Object.keys(lab.MODES);
assert.equal(ids.length,5);
for(const id of ids){ const bank=lab.bank(id);assert.equal(bank.length,240); for(let level=1;level<=10;level++) assert.equal(bank.filter(q=>q.difficultyLevel===level).length,24);for(const q of bank){ assert(q.answer!==undefined);if(q.choices)assert(q.choices.includes(q.answer));} }
console.log('PASS: 5課題・合計1200パターン・Lv1～10');
