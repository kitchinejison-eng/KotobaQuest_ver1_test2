/* ことばクエスト Ver.2.1.0 | 試作キャッチ課題・メイントレーニング統合
 * 共通の出題数・ヒント・熟練度・個別学習・結果・記録を使用する。
 * 音読・発音の正確さを採点しない。リズム課題の判定対象は拍数のみ。
 * 過去の試作記録は main app.js 側で成績を再計算せず移行する。
 */
(function (root) {
 'use strict';
 var MODES={catchTongue:'早口言葉とリズム',catchImage:'イメージキャッチ',catchCategory:'カテゴリーキャッチ',catchWord:'ワードキャッチ',catchConversation:'会話キャッチ（役割交代）'};
 var IMAGES=[
 ['🍎','りんご','みかん'],['🍌','バナナ','いちご'],['🍊','みかん','りんご'],['🍓','いちご','ぶどう'],
 ['🐈','ねこ','いぬ'],['🐕','いぬ','ねこ'],['🐄','うし','うま'],['🐎','うま','うし'],
 ['🚌','バス','電車'],['🚃','電車','バス'],['🚲','自転車','バイク'],['✈️','飛行機','ふね'],
 ['☂️','かさ','ぼうし'],['🧢','ぼうし','かさ'],['🧤','手袋','くつした'],['🧦','くつした','手袋'],
 ['📚','本','ノート'],['✏️','えんぴつ','はさみ'],['🪥','歯ブラシ','くし'],['⌚','時計','かばん'],
 ['🍙','おにぎり','パン'],['🍞','パン','おにぎり'],['🐟','さかな','とり'],['🌻','ひまわり','チューリップ']
 ];
 var GROUPS={
 '乗り物':[['🚌','バス'],['🚃','電車'],['🚲','自転車'],['✈️','飛行機'],['🚕','タクシー'],['🚢','ふね']],
 '果物':[['🍎','りんご'],['🍊','みかん'],['🍌','バナナ'],['🍇','ぶどう'],['🍓','いちご'],['🍑','もも']],
 '動物':[['🐈','ねこ'],['🐕','いぬ'],['🐄','うし'],['🐎','うま'],['🐇','うさぎ'],['🐘','ぞう']],
 '食べ物':[['🍙','おにぎり'],['🍞','パン'],['🍜','ラーメン'],['🍕','ピザ'],['🍣','すし'],['🍡','だんご']],
 '日用品':[['☂️','かさ'],['🧤','手袋'],['🪥','歯ブラシ'],['🧴','せっけん'],['✏️','えんぴつ'],['📚','本']]
 };
 var WORDS=[
 ['雨の日に開いて使うものは？','かさ',['ぼうし','くつ','はさみ'],'外で雨をよけます。'],
 ['字を書くときに使うものは？','えんぴつ',['せっけん','タオル','コップ'],'紙に文字を書きます。'],
 ['寒い日に首に巻くものは？','マフラー',['うちわ','ぼうし','くつ'],'首を温かくします。'],
 ['手を洗うときに使うものは？','せっけん',['えんぴつ','かさ','くし'],'泡立てて汚れを落とします。'],
 ['本を借りる場所は？','としょかん',['こうえん','えき','スーパー'],'本がたくさんあります。'],
 ['時間を確認するときに見るものは？','とけい',['はさみ','くつ','ふうとう'],'針や数字があります。'],
 ['歯をみがく道具は？','はぶらし',['くし','スプーン','ふで'],'毛先で歯をみがきます。'],
 ['料理を冷やす家電は？','れいぞうこ',['せんたくき','テレビ','そうじき'],'冷たい食品を保管します。'],
 ['雨がやんだあと、空に見える七色のものは？','にじ',['ほし','くも','つき'],'七色の弧です。'],
 ['手紙を出す場所は？','ゆうびんきょく',['こうえん','びょういん','としょかん'],'切手や郵便を扱います。'],
 ['食事でご飯をつまむ二本の道具は？','はし',['フォーク','スプーン','コップ'],'二本一組で使います。'],
 ['お湯を沸かす器具は？','やかん',['ふらいぱん','おさら','ざる'],'水を入れて火にかけます。'],
 ['足に履いて外を歩くものは？','くつ',['てぶくろ','ぼうし','かさ'],'左右で一組です。'],
 ['紙を切るための道具は？','はさみ',['えんぴつ','のり','ふで'],'二枚の刃で切ります。'],
 ['頭を乾かすために風を出すものは？','ドライヤー',['せんぷうき','れいぞうこ','テレビ'],'髪を乾かす電気製品です。'],
 ['夜、寝るときに頭の下に置くものは？','まくら',['ふとん','タオル','いす'],'頭を支える寝具です。'],
 ['水を飲むための容器は？','コップ',['おさら','なべ','はし'],'手で持って飲みます。'],
 ['暑いときに風を送るものは？','うちわ',['マフラー','てぶくろ','かさ'],'手であおぎます。'],
 ['洗った体を拭くものは？','タオル',['ノート','はさみ','くつ'],'布で水分をふきます。'],
 ['部屋を掃除するとき、ゴミを吸う家電は？','そうじき',['テレビ','とけい','れいぞうこ'],'床のほこりを吸います。'],
 ['自転車に乗るとき、頭を守るものは？','ヘルメット',['マフラー','うちわ','かさ'],'頭にかぶる保護具です。'],
 ['暗い道を照らす携帯用の道具は？','かいちゅうでんとう',['でんわ','とけい','はぶらし'],'手に持って光を出します。'],
 ['料理を混ぜるときに使う道具は？','しゃもじ',['くつ','ノート','かさ'],'ご飯をよそうのにも使います。'],
 ['洋服をしまう家具は？','たんす',['つくえ','いす','ベッド'],'引き出しがあります。']
 ];
 var TONGUES=[
 ['なまむぎ なまごめ なまたまご','なまむぎ'],['あかまきがみ あおまきがみ きまきがみ','あかまきがみ'],
 ['すももも ももも もものうち','すもも'],['となりのきゃくは よくかきくうきゃくだ','きゃく'],
 ['かえる ぴょこぴょこ みぴょこぴょこ','ぴょこぴょこ'],['あおい いえの まえを あるく','あおい'],
 ['しろい しろくま しろい くつ','しろくま'],['はやく はこを はこぼう','はこ'],
 ['きょうは きれいな そら','きょう'],['きしゃが きしゃに きしゃを のせた','きしゃ'],
 ['みどりの もりに みみずが いる','みみず'],['あさから あめが あがった','あさ'],
 ['たけやぶ やけた たけやぶ','たけやぶ'],['さくら さく さく さくら','さくら'],
 ['ぴかぴか ひかる ひかり','ぴかぴか'],['きいろい きくの はな','きく'],
 ['はなやの はなの はなし','はなや'],['こねこが こっそり ここに きた','こねこ'],
 ['くまが くるまに くらくら','くるま'],['やまの やぎが やまへ いく','やぎ'],
 ['あたらしい くつを くつばこへ','くつばこ'],['きょうしつで きょうは べんきょう','きょうしつ'],
 ['とおい ところに とりが とぶ','とり'],['しんぶんしを しずかに よむ','しんぶんし']
 ];
 var CONVERSATIONS=[
 ['買い物', [['A','いらっしゃいませ。何をお探しですか？'],['B','りんごを二つください。'],['A','りんごを二つですね。']], '何を買いますか？','りんご',['パン','バナナ','牛乳']],
 ['朝のあいさつ',[['A','おはようございます。'],['B','今日は晴れですね。'],['A','散歩に行きたいですね。']], '今日の天気は？','晴れ',['雨','雪','くもり']],
 ['カフェ注文',[['A','ご注文をどうぞ。'],['B','温かいコーヒーをください。'],['A','かしこまりました。']], '注文した飲み物は？','コーヒー',['紅茶','水','ジュース']],
 ['駅の案内',[['A','どちらに行きますか？'],['B','図書館へ行きます。'],['A','次の角を右に曲がってください。']], '行き先は？','図書館',['病院','学校','公園']],
 ['忘れ物',[['A','何か探していますか？'],['B','青いかさを探しています。'],['A','受付で確認しましょう。']], '探しているものは？','かさ',['くつ','財布','本']],
 ['昼ごはん',[['A','今日のお昼は何にしますか？'],['B','うどんにします。'],['A','いいですね。']], '食べたいものは？','うどん',['そば','パン','ご飯']],
 ['散歩',[['A','今日はどこを歩きますか？'],['B','近くの公園へ行きます。'],['A','ゆっくり歩きましょう。']], '散歩する場所は？','公園',['駅','スーパー','図書館']],
 ['服の買い物',[['A','何色をお探しですか？'],['B','青いシャツが欲しいです。'],['A','こちらにあります。']], '欲しいシャツの色は？','青',['赤','白','黒']],
 ['バス停',[['A','バスは何時ですか？'],['B','三時に来ます。'],['A','あと少しですね。']], 'バスが来る時刻は？','三時',['二時','四時','五時']],
 ['電話',[['A','明日は何時に会いますか？'],['B','十時に会いましょう。'],['A','わかりました。']], '待ち合わせの時刻は？','十時',['八時','九時','十一時']],
 ['お茶',[['A','何を飲みますか？'],['B','温かいお茶をお願いします。'],['A','お持ちします。']], '飲むものは？','お茶',['牛乳','水','コーヒー']],
 ['病院の受付',[['A','今日はどうされましたか？'],['B','予約していた診察です。'],['A','お名前をお願いします。']], '来た目的は？','診察',['買い物','食事','散歩']],
 ['雨の日',[['A','外は雨ですね。'],['B','かさを持っていきます。'],['A','気をつけてください。']], '持っていくものは？','かさ',['ぼうし','水筒','タオル']],
 ['映画',[['A','週末は何を見ましたか？'],['B','映画を見ました。'],['A','楽しかったですか？']], '週末に見たものは？','映画',['演劇','スポーツ','ニュース']],
 ['郵便局',[['A','何を送りたいですか？'],['B','手紙を一通お願いします。'],['A','切手はこちらです。']], '送りたいものは？','手紙',['荷物','本','写真']],
 ['買い物の支払い',[['A','お支払いはどうしますか？'],['B','現金で払います。'],['A','承知しました。']], '支払い方法は？','現金',['カード','電子マネー','ポイント']],
 ['図書館',[['A','どんな本を読みますか？'],['B','料理の本を借ります。'],['A','三階にあります。']], '借りたい本は？','料理の本',['旅行の本','歴史の本','絵本']],
 ['体調確認',[['A','今日は調子はいかがですか？'],['B','少し疲れています。'],['A','休憩しましょう。']], 'Bさんの調子は？','疲れている',['元気','眠くない','おなかがすいた']],
 ['花屋',[['A','どのお花にしますか？'],['B','赤いバラを三本ください。'],['A','かしこまりました。']], '選んだ花は？','バラ',['菊','桜','ひまわり']],
 ['傘立て',[['A','傘はどこにありますか？'],['B','入口の傘立てにあります。'],['A','ありがとうございます。']], '傘がある場所は？','入口',['台所','庭','屋上']],
 ['飲食店',[['A','ご飯の量はいかがしますか？'],['B','少なめでお願いします。'],['A','少なめですね。']], 'ご飯の量は？','少なめ',['大盛り','普通','おかわり']],
 ['道案内',[['A','郵便局はどこですか？'],['B','まっすぐ歩いて左です。'],['A','助かりました。']], '曲がる方向は？','左',['右','後ろ','上']],
 ['予定',[['A','何曜日に買い物へ行きますか？'],['B','金曜日に行きます。'],['A','一緒に行きましょう。']], '買い物に行く曜日は？','金曜日',['月曜日','火曜日','日曜日']],
 ['食事の希望',[['A','デザートは何にしますか？'],['B','プリンをお願いします。'],['A','お持ちします。']], '注文したデザートは？','プリン',['ゼリー','ケーキ','アイス']]
 ];
 function mora(word){return Array.from(String(word||'').replace(/[\s、。・]/g,'')).filter(function(c){return !'ゃゅょぁぃぅぇぉゎャュョァィゥェォヮ'.includes(c);}).length;}
 function levelChoices(answer, others, level){var n=level<=2?2:level<=4?3:4;return [answer].concat(others.filter(function(x){return x!==answer;}).slice(0,n-1));}
 function itemFor(id, lv, i){var q={id:id+'-lv'+lv+'-'+(i+1),difficultyLevel:lv,catchMode:id,trial:true};
  if(id==='catchImage') {var x=IMAGES[i%IMAGES.length],truth=((i+lv)%3!==0);q.emoji=x[0];q.prompt='絵を見て質問に○×で答えましょう。';q.question='これは'+(truth?x[1]:x[2])+'ですか？';q.voiceText=q.question;q.answer=truth?'〇':'×';q.choices=['〇','×'];q.hint='絵の形と、質問で言っている物の名前を比べましょう。';q.explanation='絵の名前は「'+x[1]+'」です。質問と一致するかどうかを判断します。';q.catchVisual=x[0];}
  else if(id==='catchCategory') {var keys=Object.keys(GROUPS), k=keys[i%keys.length],list=GROUPS[k],correct=list[(Math.floor(i/keys.length)+lv-1)%list.length];var other=[];for(var b=1;b<=4;b++){var cat=keys[(i+b)%keys.length],arr=GROUPS[cat];other.push(arr[(i+lv+b)%arr.length]);}q.emoji='🎯';q.question=k+'の仲間を選んでください。';q.prompt=q.question;q.voiceText=q.question;q.answer=correct[1];q.choices=levelChoices(q.answer,other.map(function(x){return x[1];}),lv);q.catchIcons={};[correct].concat(other).forEach(function(x){q.catchIcons[x[1]]=x[0];});q.hint=k+'に当てはまる物を、ひとつずつ確かめましょう。';q.explanation='「'+correct[1]+'」は'+k+'の仲間です。';}
  else if(id==='catchWord') {var w=WORDS[i%WORDS.length];q.emoji='💭';q.question=w[0];q.prompt=w[0];q.voiceText=w[0];q.answer=w[1];q.choices=levelChoices(q.answer,w[2],lv);q.hint=w[3];q.explanation=w[3]+' 正解は「'+w[1]+'」です。';}
  else if(id==='catchTongue') {var t=TONGUES[i%TONGUES.length];q.emoji='🥁';q.question='「'+t[1]+'」は何拍ですか？';q.prompt='まず短い文章を、無理のない速さで読んでみましょう。';q.answer=String(mora(t[1]));q.hint='「ゃ・ゅ・ょ」は直前の音と一緒に1拍。「っ」「ん」はそれぞれ1拍です。';q.explanation='「'+t[1]+'」は'+q.answer+'拍です。これは拍数の確認であり、発音の正確さの採点ではありません。';q.catchPhrase=t[0];q.catchTarget=t[1];q.catchTempo=Math.min(1.15,0.72+(lv-1)*0.045);q.catchAnswerMode='catch-mora-tap';}
  else if(id==='catchConversation') {var c=CONVERSATIONS[i%CONVERSATIONS.length];q.emoji='💬';q.question='会話を読んで内容を思い出しましょう。';q.catchAsk=c[2];q.prompt='場面：'+c[0];q.answer=c[3];q.choices=levelChoices(q.answer,c[4],lv);q.hint='Bさんのせりふに注目して思い出しましょう。';q.explanation='会話の内容を確認しましょう。正解は「'+c[3]+'」です。';q.catchLines=c[1];q.catchScene=c[0];q.catchAnswerMode='catch-conversation-recall';}
  return q;
 }
 var cache={};
 function bank(id){if(!MODES[id])return [];if(!cache[id]){var x=[];for(var lv=1;lv<=10;lv++)for(var i=0;i<24;i++)x.push(itemFor(id,lv,i));cache[id]=x;}return cache[id];}
 function esc(x){return String(x||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function btn(text,cls){var b=document.createElement('button');b.type='button';b.className=cls||'choice';b.textContent=text;return b;}
 var streak=0, activeId=null;
 var MODE_KEY='kotobaquest_catch_motion_v250';
 function playCue(kind){try{if(root.KotobaAudio&&root.KotobaAudio.isSeOn&&!root.KotobaAudio.isSeOn())return;if(root.KotobaSoundDesign)root.KotobaSoundDesign.play(kind);}catch(_){}}
 function motionAllowed(){try{return localStorage.getItem(MODE_KEY)!=='calm'&&!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(_){return false;}}
 function shuffledChoices(options,seed){var items=(options||[]).slice(),n=0;String(seed).split('').forEach(function(c){n=(n*31+c.charCodeAt(0))>>>0;});for(var i=items.length-1;i>0;i--){var j=n%(i+1);var t=items[i];items[i]=items[j];items[j]=t;n=(Math.imul(n,1664525)+1013904223)>>>0;}if(items.length>1&&items[0]===options[0])items.push(items.shift());return items;}
 function render(id,q,ctx){
  var area=document.getElementById('answerArea');if(!area||!q)return;
  if(activeId!==id){streak=0;activeId=id;}
  area.innerHTML='';area.classList.add('kq-catch-game-area');
  var stage=document.createElement('section');stage.className='kq-catch-game-stage';stage.setAttribute('aria-label','ことばキャッチ練習');area.appendChild(stage);
  var headline=document.createElement('div');headline.className='kq-catch-game-head';
  var stageText=document.createElement('div');stageText.className='kq-catch-game-head-copy';
  var kicker=document.createElement('small');kicker.textContent='🎮 ことばクエスト ／ （試作途中）';
  var title=document.createElement('strong');title.textContent=MODES[id]+' · Lv.'+(q.difficultyLevel||1);
  stageText.append(kicker,title);headline.appendChild(stageText);
  var combo=document.createElement('div');combo.className='kq-catch-combo';combo.setAttribute('aria-live','polite');combo.textContent='連続キャッチ '+streak+'回';headline.appendChild(combo);stage.appendChild(headline);
  var guide=document.createElement('p');guide.className='kq-catch-instruction';stage.appendChild(guide);
  var movement=(id==='catchImage'||id==='catchCategory'||id==='catchWord');
  var calm=!motionAllowed();
  if(movement){
   var controls=document.createElement('div');controls.className='kq-catch-controls';
   var toggle=btn(calm?'▶ 動きをつける':'⏸ 動きを止める','kq-catch-mode-btn');
   toggle.setAttribute('aria-pressed',String(calm));
   var small=document.createElement('span');small.className='kq-catch-access-note';small.textContent='時間制限なし・動きを止めても採点は同じ';
   toggle.addEventListener('click',function(){calm=!calm;stage.classList.toggle('kq-catch-calm',calm);toggle.textContent=calm?'▶ 動きをつける':'⏸ 動きを止める';toggle.setAttribute('aria-pressed',String(calm));try{localStorage.setItem(MODE_KEY,calm?'calm':'move');}catch(_){}});
   controls.append(toggle,small);stage.appendChild(controls);
  }
  stage.classList.toggle('kq-catch-calm',calm);
  function done(b,choice){
   if(stage.dataset.answered==='yes')return;
   stage.dataset.answered='yes';
   var correct=choice===q.answer;
   streak=correct?streak+1:0;
   combo.textContent=correct?'✨ 連続キャッチ '+streak+'回':'次の問題で再挑戦';
   stage.classList.add(correct?'kq-catch-hit':'kq-catch-miss');
   b.classList.add(correct?'kq-catch-target-hit':'kq-catch-target-miss');
   if(streak>0&&streak%3===0)playCue('cardCombo');
   ctx.answer(b,choice);
  }
  function targets(choices,withIcons){
   var track=document.createElement('div');track.className='kq-catch-track';track.setAttribute('role','group');track.setAttribute('aria-label','キャッチすることば');
   shuffledChoices(choices,q.id).forEach(function(choice,i){
    var label=withIcons&&q.catchIcons&&q.catchIcons[choice]?q.catchIcons[choice]+' '+choice:choice;
    var b=btn(label,'choice kq-catch-target');b.dataset.choice=choice;
    b.style.setProperty('--track-i',String(i));
    b.setAttribute('aria-label',choice+'をキャッチ');
    b.addEventListener('click',function(){done(b,choice);});track.appendChild(b);
   });
   stage.appendChild(track);
  }
  if(id==='catchImage'){
   guide.textContent='落ちてくる絵を見て、○か×をキャッチ！';
   var scene=document.createElement('div');scene.className='kq-catch-scene';
   var sprite=btn(q.catchVisual,'kq-catch-sprite');sprite.setAttribute('aria-label','絵をキャッチする');
   sprite.addEventListener('click',function(){sprite.classList.add('kq-catch-sprite-grabbed');sprite.disabled=true;guide.textContent='✨ 絵をキャッチ！ ○か×で答えてください。';playCue('cardFlip');});
   scene.appendChild(sprite);stage.appendChild(scene);
   var prompt=document.createElement('p');prompt.className='kq-catch-question';prompt.textContent=q.question;stage.appendChild(prompt);
   targets(q.choices,false);
  }else if(id==='catchCategory'){
   guide.textContent='仲間に入ることばを見つけてキャッチ！';
   var prompt=document.createElement('p');prompt.className='kq-catch-question';prompt.textContent=q.question;stage.appendChild(prompt);
   targets(q.choices,true);
  }else if(id==='catchWord'){
   guide.textContent='ヒントを読んで、正しいことばをキャッチ！';
   var prompt=document.createElement('p');prompt.className='kq-catch-question';prompt.textContent=q.question;stage.appendChild(prompt);
   targets(q.choices,false);
  }else if(id==='catchTongue'){
   guide.textContent='リズムチャレンジ：声に出してから、拍を数えよう';
   var prompt=document.createElement('div');prompt.className='kq-catch-speech';prompt.textContent=q.catchPhrase;stage.appendChild(prompt);
   var caption=document.createElement('p');caption.className='kq-catch-instruction';caption.textContent='対象のことば「'+q.catchTarget+'」をタップで数えます。発音の良し悪しを採点するものではありません。';stage.appendChild(caption);
   var sample=btn('🔈 お手本を聞く','kq-catch-mode-btn');sample.addEventListener('click',function(){ctx.speak(q.catchPhrase,q.catchTempo);});stage.appendChild(sample);
   var dots=document.createElement('div');dots.className='kq-catch-beats';dots.setAttribute('aria-hidden','true');
   for(var k=0;k<12;k++){var dot=document.createElement('span');dot.className='kq-catch-beat';dots.appendChild(dot);}stage.appendChild(dots);
   var status=document.createElement('p');status.className='kq-catch-beat-status';status.setAttribute('aria-live','polite');status.textContent='0拍';stage.appendChild(status);
   var taps=0,actions=document.createElement('div');actions.className='kq-catch-beat-actions';
   var tap=btn('👏 1拍タップ','kq-catch-tap-btn');
   var reset=btn('↻ 数え直す','kq-catch-mode-btn');
   var check=btn('拍数を答える','choice kq-catch-submit-btn');check.disabled=true;
   function drawBeats(){status.textContent=taps+'拍';Array.prototype.forEach.call(dots.children,function(d,i){d.classList.toggle('active',i<taps);});check.disabled=taps===0;}
   tap.addEventListener('click',function(){if(taps>=12||stage.dataset.answered==='yes')return;taps++;drawBeats();playCue('tap');});
   reset.addEventListener('click',function(){if(stage.dataset.answered==='yes')return;taps=0;drawBeats();});
   check.addEventListener('click',function(){if(!taps)return;tap.disabled=true;reset.disabled=true;done(check,String(taps));});
   actions.append(tap,reset,check);stage.appendChild(actions);
  }else if(id==='catchConversation'){
   guide.textContent='会話クエスト：AさんとBさんのせりふを読んで、最後に思い出そう';
   var place=document.createElement('p');place.className='kq-catch-scene-label';place.textContent='📍 '+q.catchScene;stage.appendChild(place);
   var progress=document.createElement('div');progress.className='kq-catch-role-progress';progress.setAttribute('aria-live','polite');stage.appendChild(progress);
   var dialogue=document.createElement('div');dialogue.className='kq-catch-role-scene';stage.appendChild(dialogue);
   var step=0,lines=q.catchLines||[];
   function drawRole(){dialogue.innerHTML='';progress.textContent=step<lines.length?'会話 '+(step+1)+' / '+lines.length:'思い出しクイズ';
    if(step<lines.length){var l=lines[step];
      var avatar=document.createElement('div');avatar.className='kq-catch-role-avatar';avatar.textContent=l[0];avatar.setAttribute('aria-hidden','true');
      var bubble=document.createElement('p');bubble.className='kq-catch-role-bubble';bubble.textContent=l[1];
      var row=document.createElement('div');row.className='kq-catch-role-row';row.append(avatar,bubble);dialogue.appendChild(row);
      var say=btn('🔈 お手本を聞く','kq-catch-mode-btn');say.addEventListener('click',function(){ctx.speak(l[1]);});
      var next=btn('読んだ・'+(step===lines.length-1?'クイズへ':'次のせりふへ')+' →','kq-catch-role-next');
      next.addEventListener('click',function(){if(stage.dataset.answered==='yes')return;step++;playCue('navigate');drawRole();});dialogue.append(say,next);
    }else{
      var ask=document.createElement('p');ask.className='kq-catch-question';ask.textContent=q.catchAsk;dialogue.appendChild(ask);
      var track=document.createElement('div');track.className='kq-catch-track';
      shuffledChoices(q.choices,q.id).forEach(function(c){var b=btn(c,'choice kq-catch-target');b.dataset.choice=c;b.addEventListener('click',function(){done(b,c);});track.appendChild(b);});dialogue.appendChild(track);
      var repeat=btn('↻ 会話をもう一度見る','kq-catch-mode-btn');repeat.addEventListener('click',function(){if(stage.dataset.answered==='yes')return;step=0;drawRole();});dialogue.appendChild(repeat);
    }
   }
   drawRole();
  }
 }
 root.KotobaCatchIntegrated={MODES:MODES,isCatch:function(x){return !!MODES[x];},bank:bank,render:render,mora:mora};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.KotobaCatchIntegrated;
})(typeof window!=='undefined'?window:globalThis);
