const fs=require('fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const code=fs.readFileSync(process.argv[2],'utf8');
const i=code.indexOf('function recordQuestionOutcome('),end=code.indexOf('\nfunction showWrongAnswerGuide(',i);
assert.ok(i>=0&&end>i,'recordQuestionOutcome must exist');
const func=code.slice(i,end);
const dirs=process.argv[3];const ai=fs.readFileSync(path.join(dirs,'kotoba-ai-judge.js'),'utf8');const bridge=fs.readFileSync(path.join(dirs,'kotoba-ai-integration-v252.js'),'utf8');
const values=new Map();const store={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
let run=0;let answers=[];const w={localStorage:store,KotobaQuestUserProfile:{getCurrent:()=>({profileId:'u1'})},KotobaLearningMode:{isEnabled:()=>true},KotobaLevels:{maxLevel:()=>10,get:()=>({selected:2,unlocked:3})}};
const doc={readyState:'loading',addEventListener(){},getElementById(){return null}};
const scope={window:w,document:doc,Date,Math,JSON,Set,Number,String,Object,Array,console,
 current:0,selectedActivity:'matching',questionResults:answers,questionDisplayName:q=>q.question,
 questionImprovement:()=>'',setTimeout:()=>{},$:()=>({classList:{contains:()=>false}})};
vm.createContext(scope);vm.runInContext(ai,scope);vm.runInContext(bridge,scope);
vm.runInContext(func,scope);
w.KotobaAIJudge.setEnabled(true);
const q=(i)=>({question:'問題 '+i,id:'id'+i,answer:'赤',choices:['赤','青'],difficultyLevel:2});
w.KotobaAIIntegration.beginSession('matching',[q(1)],2,3);
vm.runInContext(`recordQuestionOutcome({question:'問題 1',id:'id1',answer:'赤',choices:['赤','青'],difficultyLevel:2},true,'赤',{answerMode:'objective-choice'});`,scope);
assert.equal(w.KotobaAIJudge.predict({activityId:'matching',level:2}).observations,1,'first choice should train model');
vm.runInContext(`recordQuestionOutcome({question:'問題 1',id:'id1',answer:'赤',choices:['赤','青'],difficultyLevel:2},false,'青',{answerMode:'objective-choice'});`,scope);
assert.equal(w.KotobaAIJudge.predict({activityId:'matching',level:2}).observations,1,'repeat must not retrain');
scope.current=1;
vm.runInContext(`recordQuestionOutcome({question:'問題 2',id:'id2',answer:'赤',choices:['赤','青'],difficultyLevel:2},true,'赤',{answerMode:'voice-read'});`,scope);
assert.equal(w.KotobaAIJudge.predict({activityId:'matching',level:2}).observations,1,'voice must not train');
scope.current=2;
vm.runInContext(`recordQuestionOutcome({question:'問題 3',id:'id3',answer:'赤',choices:['赤','青'],difficultyLevel:2},true,'赤',{afterRetry:true,answerMode:'objective-choice'});`,scope);
assert.equal(w.KotobaAIJudge.predict({activityId:'matching',level:2}).observations,1,'after retry must not train');
console.log('PASS recordQuestionOutcome -> AI first-only/voice-excluded/retry-excluded');
