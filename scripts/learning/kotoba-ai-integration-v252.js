/* Kotoba Quest Ver.2.5.4 - on-device model integration.
 * Optional small ML model for objective choice questions only.
 * This model gives research/prototype estimates, not a clinical assessment.
 * No network calls. Never changes existing mastery or manually selected Lv.
 */
(function(root){
 'use strict';
 if(root.KotobaAIIntegration)return;
 var ai=root.KotobaAIJudge;
 if(!ai)return;
 var selectedActivity='', runId='', counter=0, lastActivity='';
 var excluded={articulationNavigator:1,copy:1,pronunciationTraining:1,repeat:1,mora:1,
   voiceRead:1,naming:1,board:1,roleplay:1,aac:1,anagram:1,aiConversation:1,localAIConversation:1,readingMemory:1,
   catchTongue:1,foundationVoice:1};
 var acceptedModes={ 'objective-choice':1,'catch-selection-trial':1,
   'catch-conversation-recall':1 };
 function learningOn(){try{return !!(root.KotobaLearningMode&&root.KotobaLearningMode.isEnabled());}catch(_){return false;}}
 function enabled(){return learningOn() && ai.isEnabled();}
 function eligible(activity,q,mode){
   if(!activity||excluded[String(activity)]||!q||!acceptedModes[String(mode||'')])return false;
   if(q.catchAnswerMode==='catch-mora-tap')return false;
   if(String(q.answer||'')==='できた'||q.selfReported||q.skipped||q.hintOnly)return false;
   if(!Array.isArray(q.choices)||q.choices.length<2)return false;
   return q.choices.some(function(c){return String(c)===String(q.answer);});
 }
 function difficulty(q, fallback){
   var n=Number(q&&(q.difficultyLevel||q.level))||Number(fallback)||1;
   return Math.max(1,Math.min(10,Math.round(n)));
 }
 function newRun(activity){
   selectedActivity=String(activity||'');
   counter++;
   runId=Date.now().toString(36)+'-'+counter.toString(36)+'-'+Math.random().toString(36).slice(2,10);
 }
 function reorder(questions,activity,lv,unlocked){
   if(!enabled()||!Array.isArray(questions)||questions.length<2)return questions;
   if(excluded[String(activity)])return questions;
   var sample=ai.predict({activityId:activity,level:lv});
   if(sample.observations<12)return questions;
   var output=[],remaining=questions.slice();
   // Ordering only: never alter the number of questions, correct answers or unlocked levels.
   while(remaining.length){
     var choices=remaining.filter(function(q){return eligible(activity,q,q.catchAnswerMode||'objective-choice');});
     if(!choices.length){output.push.apply(output,remaining);break;}
     var picked=ai.chooseQuestion(choices,{activityId:activity,currentLevel:lv,unlockedLevel:unlocked});
     if(!picked){output.push.apply(output,remaining);break;}
     var idx=remaining.indexOf(picked);
     if(idx<0){output.push.apply(output,remaining);break;}
     output.push(remaining.splice(idx,1)[0]);
   }
   return output;
 }
 function beginSession(activity,questions,level,unlocked){
   newRun(activity);
   var result=reorder(questions,activity,level,unlocked);
   updateStatus(activity,level);
   return result;
 }
 function observeFirst(input){
   var info=input||{},activity=String(info.activityId||selectedActivity);
   var q=info.question,mode=info.answerMode;
   if(!enabled()||!eligible(activity,q,mode)||typeof info.correct!=='boolean')return {accepted:false,reason:'対象外・OFF'};
   if(info.afterRetry||info.assistedInput||info.selfReported)return {accepted:false,reason:'初回の客観回答以外'};
   if(!runId||activity!==selectedActivity)return {accepted:false,reason:'セッション未開始'};
   var attemptId=runId+'-q'+Number(info.questionIndex||0);
   var result=ai.observe({activityId:activity,difficultyLevel:difficulty(q,info.level),
     correct:info.correct,source:'choice',attemptId:attemptId});
   if(result.accepted){lastActivity=activity;updateStatus(activity,difficulty(q,info.level));}
   return result;
 }
 function recommendation(activity,level,unlocked){
   if(!enabled())return null;
   var pred=ai.predict({activityId:activity,level:level});
   // Show the first tentative estimate after 3 answers, but keep level advice
   // and question reordering at their original 12-answer requirement.
   if(pred.observations<12)return {prediction:pred,recommendation:null};
   var max=root.KotobaLevels&&root.KotobaLevels.maxLevel?root.KotobaLevels.maxLevel(activity):10;
   return {prediction:pred,recommendation:ai.recommend({activityId:activity,currentLevel:level,unlockedLevel:unlocked,maxLevel:max})};
 }
 function stageText(stage) {
   if(!stage || !stage.ready)return '初期分析まであと'+(stage?stage.remaining:3)+'問';
   if(stage.nextTarget!==null)return '次の分析段階まであと'+stage.remaining+'問';
   return '学習履歴を蓄積しながら分析を続けます';
 }
 function progressText(stage) {
   if(!stage)return '0/3問';
   return stage.nextTarget===null ? stage.observations+'問を学習済み' : stage.observations+'/'+stage.nextTarget+'問';
 }
 function statusMessage(activity,level){
   if(!learningOn())return '学習モードがOFFです。AI学習も停止しています。';
   if(!ai.isEnabled())return 'OFF：利用者の回答を機械学習モデルには追加しません。';
   if(!activity)return 'ON（初期設定）：選択式の初回回答を端末内で学習します。3問から初期分析、6→12→24→40問で段階的に参考表示を更新します。';
   var pred=ai.predict({activityId:activity,level:level||1});
   var stage=pred.stage || ai.analysisStage(pred.observations);
   if(!stage.ready)return 'ON：'+activity+' は'+progressText(stage)+'。'+stageText(stage)+'。';
   return 'ON：'+activity+' の次の正答確率（'+stage.label+'）'+pred.probability+'％。'+progressText(stage)+'、'+stageText(stage)+'。医療的な判定ではありません。';
 }
 function updateStatus(activity,level){
   var toggle=document.getElementById('aiJudgeEnabled');
   var msg=document.getElementById('aiJudgeStatus');
   if(toggle){toggle.checked=ai.isEnabled();toggle.disabled=!learningOn();}
   if(msg)msg.textContent=statusMessage(activity||lastActivity,level);
 }
 function setup(){
   var toggle=document.getElementById('aiJudgeEnabled');
   if(toggle&&!toggle.dataset.aiJudgeBound){
     toggle.dataset.aiJudgeBound='1';
     toggle.addEventListener('change',function(){
       if(!learningOn()){toggle.checked=false;updateStatus();return;}
       ai.setEnabled(!!toggle.checked);updateStatus();
     });
   }
   var reset=document.getElementById('aiJudgeReset');
   if(reset&&!reset.dataset.aiJudgeBound){
     reset.dataset.aiJudgeBound='1';
     reset.addEventListener('click',function(){
       if(typeof root.confirm==='function' && !root.confirm('端末内AIの学習データを初期化します。よろしいですか？'))return;
       ai.reset();lastActivity='';updateStatus();
     });
   }
   var learningToggle=document.getElementById('learningModeEnabled');
   if(learningToggle&&!learningToggle.dataset.aiJudgeBound){
     learningToggle.dataset.aiJudgeBound='1';
     learningToggle.addEventListener('change',function(){updateStatus();});
   }
   updateStatus();
 }
 function renderResult(activity,level,unlocked){
   var panel=document.getElementById('kqAIResultPanel');
   if(!panel)return;
   panel.hidden=false;
   var status=document.getElementById('kqAIResultStatus');
   var prediction=document.getElementById('kqAIResultPrediction');
   var advice=document.getElementById('kqAIResultAdvice');
   if(prediction)prediction.textContent='';
   if(advice)advice.textContent='';
   var progress=document.getElementById('kqAIResultProgress');
   var meter=document.getElementById('kqAIResultMeter');
   if(progress)progress.textContent='';
   if(meter)meter.hidden=true;
   if(!learningOn()){if(status)status.textContent='学習モードがOFFのため、AI分析は停止しています。';return;}
   if(!ai.isEnabled()){if(status)status.textContent='AI判定・学習がOFFです。';return;}
   if(excluded[String(activity)]){if(status)status.textContent='この課題はAI推定の対象外です。';return;}
   var info=recommendation(activity,level,unlocked);
   var count=info&&info.prediction?info.prediction.observations:0;
   var stage=info&&info.prediction&&info.prediction.stage ? info.prediction.stage : ai.analysisStage(count);
   if(progress)progress.textContent=stage.label+'｜'+progressText(stage)+'。'+stageText(stage)+'。';
   if(meter){meter.hidden=false;meter.max=stage.nextTarget===null?Math.max(40,count):stage.nextTarget;meter.value=Math.min(count,meter.max);}
   if(!stage.ready){
     if(status)status.textContent='初期分析の準備中です（'+count+'/3問）。選択式問題の初回回答を学習しています。';
     return;
   }
   if(status)status.textContent='AI分析：'+stage.label+'（学習した回答 '+count+'件）';
   if(prediction)prediction.textContent='次の選択式問題の正答確率（推定）：'+info.prediction.probability+'％';
   if(advice)advice.textContent=info.recommendation?
     'おすすめ難易度：Lv.'+info.recommendation.recommendedLevel+'（'+info.recommendation.reason+'。AI提案だけでは変更しません）':
     'まだ回答数が少ないため、おすすめLvは12問から表示します。現在選んでいるLvを維持します。';
 }
 function finishSummary(activity,level,unlocked){
   var item=recommendation(activity,level,unlocked);
   if(!item||!item.prediction||item.prediction.observations<3)return '';
   var rec=item.recommendation;
   var stage=item.prediction.stage || ai.analysisStage(item.prediction.observations);
   var lvText=rec?' ／ AI提案：Lv.'+rec.recommendedLevel+'（自動変更なし）':'';
   return '端末内AI（'+stage.label+'）：次の選択式問題の正答確率 '+item.prediction.probability+'％（推定・'+item.prediction.observations+'件）'+lvText+'。';
 }
 root.KotobaAIIntegration={enabled:enabled,eligible:eligible,beginSession:beginSession,
   observeFirst:observeFirst,finishSummary:finishSummary,renderResult:renderResult,recommendation:recommendation,
   updateStatus:updateStatus,statusMessage:statusMessage,version:'2.5.4'};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
 else setup();
})(window);
