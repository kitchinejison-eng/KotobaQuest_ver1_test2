const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const base=process.argv[2];
const path=require('path');
const moduleCode=fs.readFileSync(path.join(base,'kotoba-ai-judge.js'),'utf8');
const bridgeCode=fs.readFileSync(path.join(base,'kotoba-ai-integration-v252.js'),'utf8');
const entries=new Map();const store={getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)};
let pid='user-1', learning=true;let confirmCount=0;
const dom=new Map(),listeners={};
for(const id of ['aiJudgeEnabled','aiJudgeStatus','aiJudgeReset','learningModeEnabled']){
 dom.set(id,{checked:false,disabled:false,dataset:{},textContent:'',addEventListener:(event,cb)=>{listeners[id+'-'+event]=cb;}});
}
const doc={readyState:'complete',getElementById:id=>dom.get(id)||null,addEventListener(){}};
const w={localStorage:store,KotobaQuestUserProfile:{getCurrent:()=>({profileId:pid})},KotobaLearningMode:{isEnabled:()=>learning},KotobaLevels:{maxLevel:()=>10},confirm:()=>{confirmCount++;return true;}};
const ctx=vm.createContext({window:w,document:doc,Date,Math,JSON,Set,Number,String,Object,Array,console});
vm.runInContext(moduleCode,ctx);vm.runInContext(bridgeCode,ctx);
const ai=w.KotobaAIJudge,bridge=w.KotobaAIIntegration;let passed=0;
function test(n,fn){fn();passed++;console.log('OK',n)}
const q=(i,level=2)=>({id:'q'+i,difficultyLevel:level,answer:'あ',choices:['あ','い','う']});
test('OFF initially',()=>{assert.equal(ai.isEnabled(),false);assert.equal(dom.get('aiJudgeEnabled').checked,false)});
test('cannot learn while OFF',()=>{bridge.beginSession('matching',[q(1)],2,3);assert.equal(bridge.observeFirst({activityId:'matching',question:q(1),questionIndex:0,correct:true,answerMode:'objective-choice'}).accepted,false)});
test('user opt-in',()=>{dom.get('aiJudgeEnabled').checked=true;listeners['aiJudgeEnabled-change']();assert.equal(ai.isEnabled(),true)});
test('first objective answer accepted',()=>{bridge.beginSession('matching',[q(1)],2,3);assert.equal(bridge.observeFirst({activityId:'matching',question:q(1),questionIndex:0,correct:true,answerMode:'objective-choice'}).accepted,true)});
test('deduplicate first question',()=>assert.equal(bridge.observeFirst({activityId:'matching',question:q(1),questionIndex:0,correct:false,answerMode:'objective-choice'}).accepted,false));
test('exclude voice',()=>assert.equal(bridge.observeFirst({activityId:'matching',question:q(2),questionIndex:1,correct:true,answerMode:'voice-read'}).accepted,false));
test('exclude copy and articulation',()=>assert.equal(bridge.observeFirst({activityId:'copy',question:q(2),questionIndex:1,correct:true,answerMode:'objective-choice'}).accepted,false));
test('exclude no choices and self-report',()=>{
 assert.equal(bridge.observeFirst({activityId:'matching',question:{answer:'できた',choices:['できた','まだ']},questionIndex:2,correct:true,answerMode:'objective-choice'}).accepted,false);
 assert.equal(bridge.observeFirst({activityId:'matching',question:q(2),questionIndex:2,correct:true,answerMode:'objective-choice',selfReported:true}).accepted,false)
});
test('exclude rhythm tap',()=>assert.equal(bridge.eligible('catchTongue',{answer:'3',choices:['3','4'],catchAnswerMode:'catch-mora-tap'},'objective-choice'),false));
test('learning disabled overrides AI',()=>{learning=false;assert.equal(bridge.enabled(),false);assert.equal(bridge.observeFirst({activityId:'matching',question:q(2),questionIndex:1,correct:true,answerMode:'objective-choice'}).accepted,false);learning=true});
test('12 answers produce prediction',()=>{
 for(let i=1;i<=12;i++){bridge.beginSession('matching',[q(i)],2,3);const r=bridge.observeFirst({activityId:'matching',question:q(i),questionIndex:0,correct:i%3!==0,answerMode:'objective-choice'});assert.equal(r.accepted,true)}
 assert.equal(ai.predict({activityId:'matching',level:2}).observations,13);
 assert.equal(ai.predict({activityId:'matching',level:2}).certainty,'暫定');
});
test('COM reorder is non-destructive',()=>{
 const arr=[q('x',1),q('y',2),q('z',3)];
 const result=bridge.beginSession('matching',arr,2,2);
 assert.equal(result.length,arr.length);
 assert.equal(JSON.stringify(result.map(x=>x.id).sort()),JSON.stringify(arr.map(x=>x.id).sort()));
 assert.deepEqual(arr.map(x=>x.id),['qx','qy','qz']);
});
test('recommendation never auto-applies',()=>{
 const s=bridge.recommendation('matching',2,2);
 assert.equal(s.prediction.observations,13);
 assert.equal(s.recommendation.willApply,false);
 assert.ok(s.recommendation.recommendedLevel<=2);
});
test('results are labelled informational',()=>{
 const s=bridge.finishSummary('matching',2,2);assert.match(s,/参考値/);assert.match(s,/自動変更なし/)
});
test('profile isolation',()=>{
 pid='user-2';assert.equal(ai.isEnabled(),false);
 assert.equal(ai.predict({activityId:'matching',level:2}).observations,0);
 pid='user-1';assert.equal(ai.predict({activityId:'matching',level:2}).observations,13)
});
test('AI reset with confirmation',()=>{
 listeners['aiJudgeReset-click']();assert.equal(confirmCount,1);
 assert.equal(ai.predict({activityId:'matching',level:2}).observations,0);
 assert.equal(ai.isEnabled(),true)
});
test('off switch stops learning',()=>{
 dom.get('aiJudgeEnabled').checked=false;listeners['aiJudgeEnabled-change']();assert.equal(bridge.enabled(),false)
});
console.log('PASS',passed,'integrated tests');
