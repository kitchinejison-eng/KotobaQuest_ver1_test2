'use strict';
const fs = require('fs'), vm = require('vm'), assert = require('assert'), path=require('path');
function build(folder,storageMap=new Map()){
  const isFlat=fs.existsSync(path.join(folder,'kotoba-ai-judge.js'));
  const p=(name)=>path.join(folder,isFlat?name:'scripts/learning/'+name);
  const nodes=new Map();
  function element(id){if(!nodes.has(id))nodes.set(id,{id,textContent:'',checked:false,disabled:false,hidden:false,max:0,value:0,dataset:{},addEventListener(){}});return nodes.get(id);}
  const localStorage={getItem(k){return storageMap.has(k)?storageMap.get(k):null;},setItem(k,v){storageMap.set(k,''+v);},removeItem(k){storageMap.delete(k);}};
  const document={readyState:'loading',getElementById:element,addEventListener(){}};
  const ctx={console,document,localStorage,Math,Date,JSON,Set,Array,Object,Number,Boolean,String,Error,Map};
  ctx.window=ctx;
  ctx.KotobaLevels={maxLevel(){return 10;}};
  vm.createContext(ctx);
  for(const file of ['learning-mode-veta12.js','kotoba-ai-judge.js','kotoba-ai-integration-v252.js'])vm.runInContext(fs.readFileSync(p(file),'utf8'),ctx,{filename:file});
  return {ctx,nodes,element,storageMap};
}
function testPlatform(root){
  const state=new Map();
  let app=build(root,state),lm=app.ctx.KotobaLearningMode,judge=app.ctx.KotobaAIJudge,gui=app.ctx.KotobaAIIntegration;
  assert.equal(lm.isEnabled(),true,'new profile learning must start ON');
  assert.equal(judge.isEnabled(),true,'new profile AI must start ON');
  gui.renderResult('matching',1,3);
  assert.match(app.element('kqAIResultStatus').textContent,/0\/3問/);
  assert.equal(app.element('kqAIResultMeter').max,3);
  assert.equal(app.element('kqAIResultPrediction').textContent,'');
  const q={question:'いちごは？',answer:'いちご',choices:['いちご','すいか'],difficultyLevel:1};
  gui.beginSession('matching',[q,q],1,3);
  const bad=gui.observeFirst({activityId:'matching',question:q,answerMode:'voice-read',correct:true,questionIndex:0});
  assert.equal(bad.accepted,false,'voice should be excluded');
  for(let i=0;i<41;i++){
    // A new session yields a unique attemptId and simulates a new question set.
    gui.beginSession('matching',[q,q],1,3);
    const result=gui.observeFirst({activityId:'matching',question:q,answerMode:'objective-choice',correct:i%3!==0,questionIndex:0});
    assert.equal(result.accepted,true,'valid choice first attempt count '+i);
    gui.renderResult('matching',1,3);
    const count=i+1;
    const meter=app.element('kqAIResultMeter');
    const wantMax=count<3?3:count<6?6:count<12?12:count<24?24:count<40?40:count;
    assert.equal(meter.max,wantMax,'threshold for '+count);
    if(count<3){assert.match(app.element('kqAIResultStatus').textContent,/準備中/);assert.equal(app.element('kqAIResultPrediction').textContent,'');}
    else {assert.match(app.element('kqAIResultPrediction').textContent,/正答確率/);assert.match(gui.finishSummary('matching',1,3),/正答確率/);}
    if(count>=3 && count<12)assert.match(app.element('kqAIResultAdvice').textContent,/12問/);
  }
  assert.equal(judge.predict({activityId:'matching',level:1}).observations,41);
  assert.equal(judge.predict({activityId:'matching',level:1}).stage.nextTarget,null);
  assert.match(app.element('kqAIResultProgress').textContent,/継続学習中/);
  // Changes to ON/OFF are independently stored and preserved across reopening.
  assert.equal(lm.setEnabled(false),true);
  gui.renderResult('matching',1,3);
  assert.match(app.element('kqAIResultStatus').textContent,/学習モードがOFF/);
  app=build(root,state);lm=app.ctx.KotobaLearningMode;judge=app.ctx.KotobaAIJudge;gui=app.ctx.KotobaAIIntegration;
  assert.equal(lm.isEnabled(),false,'saved learning OFF must persist');
  assert.equal(judge.isEnabled(),true,'AI flag independent from learning flag');
  lm.setEnabled(true);judge.setEnabled(false);
  app=build(root,state);lm=app.ctx.KotobaLearningMode;judge=app.ctx.KotobaAIJudge;gui=app.ctx.KotobaAIIntegration;
  assert.equal(lm.isEnabled(),true);assert.equal(judge.isEnabled(),false,'saved AI OFF must persist');
  gui.renderResult('matching',1,3);assert.match(app.element('kqAIResultStatus').textContent,/AI判定・学習がOFF/);
  judge.setEnabled(true);
  app=build(root,state);assert.equal(app.ctx.KotobaAIJudge.isEnabled(),true);
  // Simulate old model record without enabled choice: default ON without data loss.
  const legacy=new Map([['kotobaquest_ai_judge_v252_guest',JSON.stringify({version:1,models:{matching:{weights:[-0.08,-0.38,0.85,0.12],count:9,correct:6,recent:[1,0,1],seenAttempts:[]}}})]]);
  const migrated=build(root,legacy).ctx.KotobaAIJudge;
  assert.equal(migrated.isEnabled(),true);assert.equal(migrated.predict({activityId:'matching'}).observations,9);
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/id="learningModeEnabled" type="checkbox" checked/);
  assert.match(html,/id="aiJudgeEnabled" type="checkbox" checked/);
  assert.match(html,/id="kqAIResultProgress"/);
  assert.match(html,/id="kqAIResultMeter"/);
  assert.ok(html.indexOf('kotoba-ai-judge.js?v=254') < html.indexOf('kotoba-ai-integration-v252.js?v=254'));
  console.log(path.basename(root)+' : OK (41 answers, progressive analysis, settings persistence, legacy migration, DOM)');
}
testPlatform(path.resolve(__dirname,'..','.'));
