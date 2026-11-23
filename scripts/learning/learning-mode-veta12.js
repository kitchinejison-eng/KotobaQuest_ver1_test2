/* KotobaQuest Ver.2.5.4 — 端末内の学習履歴に基づく自動難易度調整。
 * 言語能力の臨床的評価、発音精度のAI採点、外部生成AIの呼び出しは行わない。
 * 旧学習履歴・熟練度・手動難易度は維持し、新規プロフィールは学習モードON。OFFの利用者設定は保持。
 */
(function (root) {
  'use strict';
  if (root.KotobaLearningMode) return;
  var PREFIX = 'kotobaquest_learning_mode_veta12_';
  var AUTO_PREFIX = 'kotobaquest_auto_difficulty_v251_';
  var DISALLOWED = {articulationNavigator:1,copy:1,pronunciationTraining:1,
    repeat:1,mora:1,aiConversation:1,localAIConversation:1,readingMemory:1};
  function profileId() {
    try {
      var p = root.KotobaQuestUserProfile && root.KotobaQuestUserProfile.getCurrent();
      if (p && p.profileId) return String(p.profileId).replace(/[^\w-]/g, '').slice(0,60);
      var old = JSON.parse(localStorage.getItem('kotobaquest_user_profile_v1') || '{}');
      if (old.profileId) return String(old.profileId).replace(/[^\w-]/g, '').slice(0,60);
    } catch (_) {}
    return 'unconfigured';
  }
  function key() {return PREFIX + profileId();}
  function autoKey() {return AUTO_PREFIX + profileId();}
  function isEnabled() {
    // No stored choice => ON; explicit OFF => OFF. Do not erase existing preferences.
    try {return localStorage.getItem(key()) !== '0';} catch (_) {return true;}
  }
  function setEnabled(enabled) {
    try {localStorage.setItem(key(), enabled ? '1' : '0');return true;} catch (_) {return false;}
  }
  function readAuto() {
    try {
      var obj = JSON.parse(localStorage.getItem(autoKey()) || '{}');
      return obj && typeof obj === 'object' && !Array.isArray(obj)
        ? {enabled:obj.enabled === true, cooldown:obj.cooldown && typeof obj.cooldown === 'object' ? obj.cooldown : {},
          history:Array.isArray(obj.history) ? obj.history.slice(-30) : []}
        : {enabled:false,cooldown:{},history:[]};
    } catch (_) {return {enabled:false,cooldown:{},history:[]};}
  }
  function writeAuto(data) {
    try {localStorage.setItem(autoKey(), JSON.stringify(data));return true;} catch (_) {return false;}
  }
  function isAutoDifficultyEnabled() {return isEnabled() && readAuto().enabled;}
  function setAutoDifficultyEnabled(value) {
    var data=readAuto();data.enabled=!!value;
    var ok=writeAuto(data); if(ok)syncSettings();return ok;
  }
  // Only objectively graded activities; skip and self-ratings are not evidence.
  function canAutoAdjust(id) {return !!id && !DISALLOWED[String(id)];}
  function getLevelStats(id, level) {
    if(!root.KotobaAdaptive || !root.KotobaAdaptive.getSkill)return null;
    var rec=root.KotobaAdaptive.getSkill(id);
    var stats=rec && rec.byLevel && rec.byLevel[level];
    if(!stats || Number(stats.total)<5)return null;
    var recent=Array.isArray(stats.recent) ? stats.recent.slice(-8) : [];
    var validRecent=recent.length>=5;
    // Previous versions may have no `recent`; use historic counts until new observations arrive.
    var n=validRecent?recent.length:Number(stats.total);
    var successes=validRecent?recent.reduce(function(a,b){return a+(b?1:0);},0):Number(stats.correct)||0;
    var rate=n?successes/n:0;
    var estimate=Number(stats.probability);
    if(!Number.isFinite(estimate))return null;
    return {total:Number(stats.total), rate:rate, estimate:estimate, sample:n};
  }
  function recommendation(id, selectedLevel) {
    var max=root.KotobaLevels && root.KotobaLevels.maxLevel ? root.KotobaLevels.maxLevel(id):10;
    var level=Math.max(1,Math.min(max,Math.round(Number(selectedLevel)||1)));
    if(!isEnabled() || !canAutoAdjust(id))return null;
    var stats=getLevelStats(id,level);
    if(!stats)return null;
    var suggested=level;
    if(stats.estimate>=.78 && stats.rate>=.80)suggested=Math.min(max,level+1);
    else if(stats.estimate<.38 && stats.rate<.50)suggested=Math.max(1,level-1);
    return {level:suggested,current:level,total:stats.total,
      estimate:Math.round(stats.estimate*100),rate:Math.round(stats.rate*100),sample:stats.sample};
  }
  function noteManualSelection(id,level) {
    if(!canAutoAdjust(id))return;
    var info=readAuto(),stats=getLevelStats(id,level);
    info.cooldown[id]={level:Number(level),baseline:stats?stats.total:0,needed:10,reason:'manual'};
    writeAuto(info);
  }
  // At session end only. Never unlock an unearned level or override a manual choice immediately.
  function applyAutoDifficulty(id,levelResult,adaptiveSummary,completed) {
    if(!completed || !isAutoDifficultyEnabled() || !canAutoAdjust(id) ||
       !levelResult || !adaptiveSummary || !root.KotobaLevels || !root.KotobaLevels.select)return null;
    if(levelResult.raised)return null; // Existing 100-point unlock takes precedence.
    var progress=root.KotobaLevels.get(id),current=Number(levelResult.level);
    if(progress.selected!==current)return null; // User changed it elsewhere; don't overwrite.
    var rec=recommendation(id,current);
    if(!rec || rec.level===current)return null;
    // Locked levels must not be silently unlocked by the statistical estimate.
    if(rec.level>progress.unlocked)return null;
    var settings=readAuto(),pause=settings.cooldown[id];
    if(pause && Number(pause.level)===current) {
      var currentStats=getLevelStats(id,current);
      var delta=(currentStats?currentStats.total:0)-Number(pause.baseline||0);
      if(delta<Math.max(5,Number(pause.needed)||10))return null;
    }
    var next=root.KotobaLevels.select(id,rec.level);
    if(!next || next.selected!==rec.level)return null;
    var nextStats=getLevelStats(id,rec.level);
    settings.cooldown[id]={level:rec.level,baseline:nextStats?nextStats.total:0,needed:10,reason:'auto'};
    var change={activity:String(id),from:current,to:rec.level,rate:rec.rate,
      estimate:rec.estimate,observations:rec.total,at:new Date().toISOString(),
      method:'学習履歴に基づく統計的な自動調整'};
    settings.history.push(change);settings.history=settings.history.slice(-30);
    writeAuto(settings);
    updateAutoStatus();
    return change;
  }
  function updateAutoStatus() {
    var input=document.getElementById('autoDifficultyEnabled'),host=document.getElementById('autoDifficultyStatus');
    if(input){input.checked=readAuto().enabled; input.disabled=!isEnabled();}
    if(host) {
      var data=readAuto(),last=data.history.length?data.history[data.history.length-1]:null;
      host.textContent=!isEnabled()?'学習モードがOFFのため停止しています。':
        !data.enabled?'OFF：難易度の手動選択と熟練度100点でのLv解放は従来どおりです。':
        'ON：採点済み5問以上の履歴で判定し、次回の難易度を1段階だけ調整します。未解放Lvには進みません。';
      if(last && data.enabled)host.textContent+='　最近の変更：'+last.activity+' Lv.'+last.from+' → Lv.'+last.to+'。';
    }
  }
  function syncSettings() {
    var input=document.getElementById('learningModeEnabled'),status=document.getElementById('learningModeStatus');
    if(input)input.checked=isEnabled();
    if(status)status.textContent=isEnabled()
      ?'ON（初期設定）：学習履歴を端末内で保存し、苦手な問題を復習します。自動難易度は別スイッチで選べます。'
      :'OFF：通常の練習と既存の記録は使えます。自動難易度と個別学習は停止します。';
    updateAutoStatus();
    if(root.KotobaAIIntegration)root.KotobaAIIntegration.updateStatus();
    if(root.KotobaPersonalReview)root.KotobaPersonalReview.renderSettings();
  }
  function setup() {
    var input=document.getElementById('learningModeEnabled');
    if(input&&!input.dataset.boundLearningMode){
      input.dataset.boundLearningMode='1';
      input.addEventListener('change',function(){
        if(!setEnabled(input.checked)){
          input.checked=!input.checked;
          var status=document.getElementById('learningModeStatus');
          if(status)status.textContent='設定を保存できませんでした。保存領域を確認してください。';
          return;
        }
        syncSettings();
        var button=document.getElementById('learningModeReload');if(button)button.hidden=false;
      });
    }
    var auto=document.getElementById('autoDifficultyEnabled');
    if(auto&&!auto.dataset.boundAutoDifficulty){
      auto.dataset.boundAutoDifficulty='1';
      auto.addEventListener('change',function(){
        if(!setAutoDifficultyEnabled(auto.checked)){
          auto.checked=!auto.checked;
          var msg=document.getElementById('autoDifficultyStatus');if(msg)msg.textContent='保存に失敗しました。';
        }
      });
    }
    var reload=document.getElementById('learningModeReload');
    if(reload&&!reload.dataset.boundLearningModeReload){
      reload.dataset.boundLearningModeReload='1';
      reload.addEventListener('click',function(){root.location.reload();});
    }
    syncSettings();
  }
  root.KotobaLearningMode={isEnabled:isEnabled,setEnabled:setEnabled,
    recommendation:recommendation,syncSettings:syncSettings,
    isAutoDifficultyEnabled:isAutoDifficultyEnabled,setAutoDifficultyEnabled:setAutoDifficultyEnabled,
    applyAutoDifficulty:applyAutoDifficulty,noteManualSelection:noteManualSelection,
    getAutoDifficultyHistory:function(){return readAuto().history.slice();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})(window);
