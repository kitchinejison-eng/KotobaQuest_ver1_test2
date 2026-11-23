/* Kotoba Quest 2.0.0: Catch Game Lab (trial). No clinical scores.
 * Separate learning history. Never modify legacy mastery, daily streak or
 * adaptive learning keys. Runs in PC, Android WebView and iOS WKWebView.
 */
(function (global) {
  'use strict';
  var CORE = {
    modes: [
      {id:'image', num:'01', icon:'🍎', title:'イメージキャッチ', description:'動く絵を見て○×で答える', genre:'認知・理解', tag:'○×・視覚判断', total:5},
      {id:'category', num:'02', icon:'🚌', title:'カテゴリーキャッチ', description:'流れることばから仲間を見つけて選ぶ', genre:'認知・理解', tag:'カテゴリー判断', total:5},
      {id:'tongue', num:'03', icon:'🥁', title:'早口言葉とリズム', description:'見本に続けて読み、タップで拍を刻む', genre:'発音・発声', tag:'リズム・発音', total:5},
      {id:'word', num:'04', icon:'☂️', title:'ワードキャッチ', description:'手がかりから正しい言葉を選ぶ', genre:'失語症・言語', tag:'語彙想起・穴埋め', total:5},
      {id:'conversation', num:'05', icon:'💬', title:'会話キャッチ（役割交代）', description:'A/Bの役を交代して読み、最後に想起問題', genre:'日常会話・コミュニケーション', tag:'役割交代・会話', total:3}
    ],
    image: [
      {emoji:'🍎',q:'これは赤いりんごですか？',right:'yes',word:'りんご'},
      {emoji:'🍌',q:'これはみかんですか？',right:'no',word:'バナナ'},
      {emoji:'🚃',q:'これは電車ですか？',right:'yes',word:'電車'},
      {emoji:'🐈',q:'これは犬ですか？',right:'no',word:'ねこ'},
      {emoji:'☂️',q:'これは傘ですか？',right:'yes',word:'かさ'}
    ],
    category: [
      {q:'乗り物だけをキャッチしよう',correct:'🚌',choices:[['🚌','バス'],['🍌','バナナ'],['🍊','みかん'],['🐄','うし']]},
      {q:'果物だけをキャッチしよう',correct:'🍊',choices:[['🚃','電車'],['🍊','みかん'],['🚲','自転車'],['🐈','ねこ']]},
      {q:'乗り物だけをキャッチしよう',correct:'🚃',choices:[['🐟','さかな'],['🌷','はな'],['🚃','電車'],['🍙','おにぎり']]},
      {q:'動物だけをキャッチしよう',correct:'🐕',choices:[['📚','ほん'],['🚗','くるま'],['🍎','りんご'],['🐕','いぬ']]},
      {q:'食べ物だけをキャッチしよう',correct:'🍙',choices:[['🍙','おにぎり'],['✈️','ひこうき'],['🧢','ぼうし'],['🌈','にじ']]}
    ],
    tongue: [
      {text:'あかまきがみ、あおまきがみ、きまきがみ',note:'ゆっくり、4回の拍をタップしてから読んでみましょう。'},
      {text:'なまむぎ、なまごめ、なまたまご',note:'息が苦しくならない速度で読みます。'},
      {text:'すももも、ももも、もものうち',note:'口の開き方を意識します。'},
      {text:'かえる、ぴょこぴょこ、みぴょこぴょこ',note:'区切りながら読みます。'},
      {text:'となりのきゃくは、よくかきくうきゃくだ',note:'最後まで同じ調子で読みます。'}
    ],
    word: [
      {q:'雨が降ったときに使うものは？',right:'かさ',choices:['かさ','くつ','かばん','はな']},
      {q:'字を書くときに使うものは？',right:'えんぴつ',choices:['はさみ','えんぴつ','せっけん','さら']},
      {q:'寒い日に首に巻くものは？',right:'マフラー',choices:['くつした','ぼうし','マフラー','うちわ']},
      {q:'手を洗うときに使うものは？',right:'せっけん',choices:['しゃもじ','せっけん','はし','ほん']},
      {q:'本を借りる場所は？',right:'としょかん',choices:['こうえん','えき','びょういん','としょかん']}
    ],
    conversation:[
      {scene:'お店で買い物',lines:[['A','いらっしゃいませ。何をお探しですか？'],['B','りんごを二つください。'],['A','はい、りんごを二つですね。']],q:'Bさんが買いたいものは？',right:'りんご',choices:['りんご','バナナ','おちゃ','パン']},
      {scene:'朝のあいさつ',lines:[['A','おはようございます。'],['B','おはようございます。今日は晴れですね。'],['A','そうですね。散歩に行きたいです。']],q:'Bさんは今日の天気をどう言いましたか？',right:'晴れ',choices:['雨','雪','晴れ','くもり']},
      {scene:'カフェで注文',lines:[['A','ご注文は何になさいますか？'],['B','温かいコーヒーをお願いします。'],['A','かしこまりました。']],q:'Bさんが注文した飲み物は？',right:'コーヒー',choices:['紅茶','コーヒー','水','ジュース']}
    ]
  };
  function normalize(s){return String(s||'').normalize('NFKC').replace(/[\s、。,.!！?？]/g,'').toLowerCase().replace(/[ァ-ヶ]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0x60)});}
  function dateKey(d){var t=d||new Date();return [t.getFullYear(),('0'+(t.getMonth()+1)).slice(-2),('0'+t.getDate()).slice(-2)].join('-');}
  function correctVoice(heard,word){return !!(word&&word.aliases)&&word.aliases.some(function(v){var h=normalize(heard),t=normalize(v);return !!h && (h===t||h.includes(t));});}
  function safeProfile(){try{var p=JSON.parse(global.localStorage.getItem('kotobaquest_user_profile_v1')||'null');return p&&/^[\w-]{4,100}$/.test(String(p.profileId))?p.profileId:'guest';}catch(_){return 'guest';}}
  function keyForProfile(profile){return 'kotobaquest_catch_trial_v1_'+profile;}
  var API={MODES:CORE.modes,normalize:normalize,dateKey:dateKey,correctVoice:correctVoice,keyForProfile:keyForProfile};
  global.KQCatchLabCore=API;
  if(typeof module!=='undefined'&&module.exports){module.exports=API;}
  if(typeof document==='undefined') return;

  var $=function(id){return document.getElementById(id);};
  var modeGrid=$('modeGrid'), stage=$('stage'), menu=$('menuView'), play=$('playView');
  if(!modeGrid||!stage||!menu||!play) return;
  var trial=null, currentRec=null, profile=safeProfile();
  var VISIBLE_MODES=CORE.modes.map(function(m){return m.id;});
  function esc(x){return String(x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function history(){try{var h=JSON.parse(global.localStorage.getItem(keyForProfile(profile))||'null');return h&&Array.isArray(h.sessions)?h:{sessions:[]};}catch(_){return {sessions:[]};}}
  function saveHistory(x){try{global.localStorage.setItem(keyForProfile(profile),JSON.stringify(x));return true;}catch(_){return false;}}
  function drawStats(){var h=history(),day=dateKey(),today=h.sessions.filter(function(v){return v.day===day&&CORE.modes.some(function(m){return m.id===v.mode;});});$('todayCount').textContent=today.reduce(function(a,v){return a+Number(v.success||0);},0);$('todayModes').textContent=new Set(today.filter(function(v){return CORE.modes.some(function(m){return m.id===v.mode;});}).map(function(v){return v.mode;})).size+' / 5';$('totalSessions').textContent=Number(h.totalSessions||h.sessions.length);}
  function lastSessionFor(mode, sessions){
    for(var i=sessions.length-1;i>=0;i--){if(sessions[i].mode===mode)return sessions[i];}
    return null;
  }
  function questionHint(){
    if(!trial)return '';
    if(trial.id==='image')return '絵の名前をゆっくり読んで、質問と一致するか考えてください。';
    if(trial.id==='category')return '指定された仲間（乗り物・果物など）を思い浮かべてください。';
    if(trial.id==='word')return 'ヒントの場面で実際に何を使うか考えてください。';
    if(trial.id==='tongue')return '声はゆっくりで大丈夫です。4回の拍で区切って練習してください。';
    return '会話を思い出し、Bさんが話した内容に注目してください。';
  }
  function safeCsv(text){var s=String(text===undefined||text===null?'':text);return '"'+s.replace(/"/g,'""')+'"';}
  function historyCsv(){
    var headings=['日付','課題','対応ジャンル','正解・自己確認','採点問題数','スキップ数','音声文字一致数','自己確認数','練習時間（秒）'];
    var rows=history().sessions.filter(function(s){return VISIBLE_MODES.indexOf(s.mode)>=0;}).map(function(s){var m=CORE.modes.find(function(v){return v.id===s.mode;});return [s.day,m?m.title:s.mode,m?m.genre:'',s.success,s.answered,s.skipped,s.voiceMatched,s.selfReported,s.durationSec];});
    return '\ufeff'+[headings].concat(rows).map(function(row){return row.map(safeCsv).join(',');}).join('\r\n');
  }
  function downloadRecords(){
    try{var blob=new Blob([historyCsv()],{type:'text/csv;charset=utf-8'});var url=global.URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='ことばキャッチ_試作学習記録.csv';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){global.URL.revokeObjectURL(url);},1200);}
    catch(_){alert('この端末ではCSV出力できません。記録は画面で確認できます。');}
  }
  function drawHistory(){
    var panel=$('historyPanel'),host=$('historyList');if(!panel||!host)return;
    var list=history().sessions.filter(function(x){return VISIBLE_MODES.indexOf(x.mode)>=0;}).slice(-30).reverse();
    host.innerHTML=list.length?list.map(function(x){var m=CORE.modes.find(function(v){return v.id===x.mode;});var objective=x.questionResults?x.questionResults.filter(function(q){return q.correct&&q.source==='choice';}).length:Math.max(0,Number(x.nonSelfCorrect||0)-Number(x.voiceMatched||0));return '<li><strong>'+esc(x.day||'')+'｜'+esc(m?m.title:x.mode)+'</strong><span>採点正解 '+objective+'回／自己確認 '+Number(x.selfReported||0)+'回／スキップ '+Number(x.skipped||0)+'回</span></li>';}).join(''):'<li>まだ記録はありません。</li>';
  }
  function syncTheme(){try{var p=global.localStorage.getItem('kotobaquest_plan_test_v121')==='premium';document.documentElement.setAttribute('data-kq-plan',p?'premium':'free');}catch(_){}}
  function showMenu(){stopRec();if('speechSynthesis' in global){try{global.speechSynthesis.cancel();}catch(_){}}trial=null;play.hidden=true;menu.hidden=false;$('feedback').hidden=true;drawStats();drawModeGrid();global.scrollTo&&global.scrollTo(0,0);}
  function start(id){var m=CORE.modes.find(function(x){return x.id===id;});if(!m)return;stopRec();trial={id:id,mode:m,i:0,correct:0,answered:false,phase:id==='conversation'?'a':'question',taps:0,sources:[],questionResults:[],questionIndex:-1,hintUsed:false,started:Date.now()};menu.hidden=true;play.hidden=false;$('playIcon').textContent=m.icon;$('playSub').textContent='（試作途中） '+m.num+' / 05';$('play-title').textContent=m.title+'（試作途中）';$('playHint').textContent=m.genre+'｜'+m.description;render();global.scrollTo&&global.scrollTo(0,0);}
  function feedback(message,type){var f=$('feedback');f.hidden=false;f.textContent=message;f.className='feedback'+(type?' '+type:'');}
  function resetFeedback(){$('feedback').hidden=true;$('feedback').className='feedback';$('feedback').textContent='';}
  function opts(arr,ans){return '<div class="options">'+arr.map(function(x){var label=Array.isArray(x)?x[0]+' '+x[1]:x;var key=Array.isArray(x)?x[0]:x;return '<button type="button" class="option" data-action="answer" data-answer="'+esc(key)+'">'+esc(label)+'</button>';}).join('')+'</div>';}
  function current(){return trial&&CORE[trial.id]&&CORE[trial.id][trial.i];}
  function questionMode(){if(!trial)return null;return current();}
  function speakText(){if(!trial)return '';var v=questionMode();switch(trial.id){
    case 'image':return v.q;case 'category':return v.q;case 'tongue':return v.text;
    case 'word':return v.q;
    case 'conversation':return trial.phase==='quiz'?v.q:(v.lines[trial.phase==='a'?0:1]||[])[1]||'';
    default:return '';
  }}
  function speak(override){var text=override||speakText();if(!text)return;var rate=trial&&trial.id==='tongue'?Math.min(1.25,0.78+trial.i*0.11):0.88;try{
     if(global.AndroidSpeech&&typeof global.AndroidSpeech.speak==='function'&&trial.id!=='tongue'){global.AndroidSpeech.speak(text);return;}
     if(global.KotobaNativeBridge&&typeof global.KotobaNativeBridge.speak==='function'){global.KotobaNativeBridge.speak(text,rate,1,1,'catch-'+Date.now());return;}
     if(!global.speechSynthesis)throw Error('speech synthesis unavailable');
     global.speechSynthesis.cancel();var utter=new SpeechSynthesisUtterance(text);utter.lang='ja-JP';utter.rate=rate;global.speechSynthesis.speak(utter);
  }catch(e){feedback('読み上げが利用できません。文字を見ながら練習してください。','info');}}
  function stopRec(){if(currentRec){try{currentRec.abort();}catch(_){}currentRec=null;}}
  function hideNext(){var next=$('nextBtn');next.hidden=true;next.disabled=false;}
  function render(){if(!trial)return;resetFeedback();hideNext();trial.answered=false;
    var id=trial.id,v=questionMode(),count=trial.mode.total;
    if(trial.questionIndex!==trial.i){trial.questionIndex=trial.i;trial.questionStarted=Date.now();trial.hintUsed=false;}
    $('playCounter').textContent=(trial.i+1)+' / '+count+' 問';$('stepFill').style.width=(100*trial.i/count)+'%';$('skipBtn').hidden=false;$('listenBtn').hidden=false;var hintBtn=$('hintBtn');if(hintBtn)hintBtn.hidden=(global.localStorage&&global.localStorage.getItem('kotobaquest_hints_v2')==='0');
    if(id==='image'){stage.innerHTML='<div class="fall-zone" aria-hidden="true"><div class="falling-object">'+esc(v.emoji)+'</div></div><div class="question">'+esc(v.q)+'</div>'+opts([['yes','〇 はい'],['no','× いいえ']]);
    }else if(id==='category'){stage.innerHTML='<div class="question">'+esc(v.q)+'</div><p class="subquestion">流れるカードをタップ／クリックしてキャッチ！</p><div class="moving-choice">'+opts(v.choices)+'</div>';
    }else if(id==='tongue'){stage.innerHTML='<div class="question">見本のテンポ '+(trial.i===0?'ゆっくり':trial.i+1+'段階目')+'で読もう</div><div class="speech-bubble">'+esc(v.text)+'</div><p class="small-note">'+esc(v.note)+'</p><p class="small-note">4回タップするごとに、次の言葉を練習します。発音の点数はつけません。</p><div class="tap-marks">'+[0,1,2,3].map(function(i){return '<span class="'+(i<trial.taps?'on':'')+'"></span>';}).join('')+'</div><button type="button" class="action-btn" data-action="tap">👏 リズムをタップ ('+trial.taps+'/4)</button>'+(trial.taps>=4?'<button type="button" class="action-btn" data-action="self">✓ 声に出して練習した</button>':'');
    }else if(id==='word'){stage.innerHTML='<div class="big-emoji">💭</div><div class="question">'+esc(v.q)+'</div><p class="subquestion">正しいことばのカプセルをキャッチ！</p><div class="moving-choice">'+opts(v.choices)+'</div>';
    }else if(id==='conversation'){
      if(trial.phase==='quiz'){stage.innerHTML='<div class="question">さいごの想起問題</div><p class="small-note">'+esc(v.scene)+'</p><div class="question">'+esc(v.q)+'</div>'+opts(v.choices);}
      else{var index=trial.phase==='a'?0:1;stage.innerHTML='<div class="question">'+esc(v.scene)+'</div><p class="subquestion">AとBを交代しながら読みます。今は'+(index?'B':'A')+'の番です。</p><div class="speech-bubble'+(index?' alt':'')+'"><strong>'+esc(v.lines[index][0])+'：</strong>'+esc(v.lines[index][1])+'</div>'+(index===1?'<div class="speech-bubble"><strong>A：</strong>'+esc(v.lines[2][1])+'</div><button class="outline action-btn" type="button" data-action="speakClose">🔈 Aさんの返事を聞く</button>':'')+'<button type="button" class="action-btn" data-action="said">'+(index?'Bを読んだ・想起問題へ':'Aを読んだ・次はB')+' →</button>';}$('skipBtn').hidden=true;
    }
  }
  function resolve(isCorrect,message,source){if(!trial||trial.answered)return;trial.answered=true;trial.taps=0;
    if(isCorrect)trial.correct++;trial.sources.push({correct:!!isCorrect,source:source||'choice'});
    var question=questionMode()||{};trial.questionResults.push({id:trial.id+'-'+(trial.i+1),question:String(question.q||question.text||question.scene||''),correct:!!isCorrect,source:source||'choice',hintUsed:!!trial.hintUsed,responseMs:Math.max(0,Date.now()-(trial.questionStarted||Date.now()))});
    feedback(message,isCorrect?'':'warn');$('nextBtn').hidden=false;$('skipBtn').hidden=true;if($('hintBtn'))$('hintBtn').hidden=true;
    var rightKey=(trial.id==='image'?current().right:trial.id==='category'?current().correct:trial.id==='word'?current().right:trial.id==='conversation'?CORE.conversation[trial.i].right:null);
    stage.querySelectorAll('[data-action="answer"]').forEach(function(b){b.disabled=true;if(isCorrect&&b.getAttribute('data-answer')===rightKey){b.classList.add('correct');}});
    $('stepFill').style.width=(100*(trial.i+1)/trial.mode.total)+'%';
  }
  function answer(a){if(!trial||trial.answered)return;var v=questionMode(),expected=(trial.id==='image'?v.right:trial.id==='category'?v.correct:v.right);var ok=a===expected;resolve(ok,ok?'キャッチ成功！ 正解です。':'今回は違いました。正解は「'+(trial.id==='image'?(expected==='yes'?'〇':'×'):expected)+'」です。', 'choice');}
  function finish(){if(!trial)return;stopRec();var t=trial;var self=t.sources.filter(function(x){return x.correct&&x.source==='self';}).length;var voice=t.sources.filter(function(x){return x.correct&&x.source==='voice';}).length;var objective=t.sources.filter(function(x){return x.correct&&x.source==='choice';}).length;var h=history();h.totalSessions=Number(h.totalSessions||h.sessions.length)+1;h.sessions.push({mode:t.id,day:dateKey(),success:t.correct,answered:t.sources.filter(function(x){return x.source!=='skip';}).length,skipped:t.sources.filter(function(x){return x.source==='skip';}).length,nonSelfCorrect:t.correct-self,voiceMatched:voice,selfReported:self,questionResults:t.questionResults.slice(),at:Date.now(),durationSec:Math.floor((Date.now()-t.started)/1000)});h.sessions=h.sessions.slice(-250);var stored=saveHistory(h);$('playCounter').textContent='練習終了';$('stepFill').style.width='100%';$('listenBtn').hidden=true;$('skipBtn').hidden=true;$('nextBtn').hidden=true;if($('hintBtn'))$('hintBtn').hidden=true;resetFeedback();stage.innerHTML='<div class="summary"><span class="big-emoji">🌟</span><h3>おつかれさまでした！</h3><strong>'+t.correct+' / '+t.mode.total+'</strong><p>正解 '+objective+'回／自己確認 '+self+'回／スキップ '+t.sources.filter(function(x){return x.source==='skip';}).length+'回</p><p class="small-note">音声認識一致：'+voice+'回／自己確認：'+self+'回<br>正確な発音・リハビリ効果を採点したものではありません。</p><p class="small-note">'+(stored?'この端末の試作練習記録に保存しました。':'この端末には保存できませんでした。')+'</p><button class="action-btn" data-action="back">別の課題を選ぶ</button></div>';trial.ended=true;drawStats();drawModeGrid();}
  function next(){if(!trial||trial.ended||!trial.answered)return;trial.i++;trial.taps=0;if(trial.i>=trial.mode.total){finish();return;}if(trial.id==='conversation')trial.phase='a';render();}
  function skip(){if(!trial||trial.answered||trial.ended)return;trial.answered=true;trial.sources.push({correct:false,source:'skip'});trial.questionResults.push({id:trial.id+'-'+(trial.i+1),question:String((questionMode()||{}).q||(questionMode()||{}).text||(questionMode()||{}).scene||''),correct:false,source:'skip',hintUsed:!!trial.hintUsed,responseMs:Math.max(0,Date.now()-(trial.questionStarted||Date.now()))});feedback('この問題をスキップしました。採点対象にはしません。','info');$('nextBtn').hidden=false;$('skipBtn').hidden=true;if($('hintBtn'))$('hintBtn').hidden=true;}
  function press(action,button){if(action==='back'){showMenu();return;}if(!trial||trial.ended)return;
    if(action==='speak'){speak();return;}if(action==='hint'){trial.hintUsed=true;feedback('ヒント：'+questionHint(),'info');return;}if(action==='speakClose'&&trial.id==='conversation'){speak(questionMode().lines[2][1]);return;}if(action==='skip'){skip();return;}if(action==='next'){next();return;}
    if(trial.answered)return;
    if(action==='answer'){answer(button.getAttribute('data-answer'));return;}
    if(action==='self'){resolve(true,'声に出して練習しました（自己確認として記録します）。','self');return;}
    if(action==='said'){trial.phase=trial.phase==='a'?'b':'quiz';render();return;}
    if(action==='tap'){trial.taps=Math.min(4,trial.taps+1);render();return;}
  }
  function drawModeGrid(){var sessions=history().sessions;modeGrid.innerHTML=CORE.modes.map(function(m){var count=sessions.filter(function(v){return v.mode===m.id;}).length;var last=lastSessionFor(m.id,sessions);return '<button type="button" class="mode-card" data-mode="'+m.id+'"><span class="mode-top"><span class="mode-icon">'+m.icon+'</span><span class="mode-num">'+m.num+' / 05</span></span><strong>'+esc(m.title)+'</strong><span class="mode-genre">'+esc(m.genre)+'</span><span class="mode-trial-flag">（試作途中）</span><p>'+esc(m.description)+'</p><span class="mode-history">練習 '+count+'回'+(last?'｜前回 '+Number(last.success||0)+'回達成':'｜未実施')+'</span><span class="mode-footer"><span>'+esc(m.tag)+'</span><span>はじめる ›</span></span></button>';}).join('');}
  var historyToggle=$('historyToggle'),historyPanel=$('historyPanel');
  if(historyToggle)historyToggle.addEventListener('click',function(){historyPanel.hidden=!historyPanel.hidden;if(!historyPanel.hidden)drawHistory();historyToggle.textContent=historyPanel.hidden?'練習記録を見る':'練習記録を閉じる';});
  if($('csvExport'))$('csvExport').addEventListener('click',downloadRecords);
  if($('historyPrint'))$('historyPrint').addEventListener('click',function(){if(historyPanel){historyPanel.hidden=false;drawHistory();}global.print();});
  document.addEventListener('click',function(e){var b=e.target.closest('[data-mode]');if(b){start(b.getAttribute('data-mode'));return;}var a=e.target.closest('[data-action]');if(a)press(a.getAttribute('data-action'),a);});
  global.addEventListener('storage',syncTheme);global.addEventListener('pagehide',stopRec);syncTheme();drawStats();drawModeGrid();
  // 既存ジャンルから選んだ課題を、直接その練習画面で開始する。
  try {var requested=new URLSearchParams(global.location.search).get('mode');if(VISIBLE_MODES.indexOf(requested)>=0)start(requested);}catch(_){}
})(typeof window!=='undefined'?window:globalThis);
