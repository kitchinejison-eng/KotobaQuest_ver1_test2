ことばクエスト Ver.2.5.2 問題ファイル分割・整理版

■ 問題を編集する場所
question-data/課題ID/lv01.js ～ lv10.js
構音筋ビジュアルナビゲーション（articulationNavigator）はLv.1～5のみです。

■ 編集方法
1. 変更前にZIPを別名保存してバックアップ
2. 課題IDのフォルダを開き、該当LvのlvXX.jsをテキストエディターで編集
3. question（問題文）、answer（正解）、hint（ヒント）、choices（選択肢）等を変更
4. 文字列はダブルクォーテーションで囲み、配列・カンマ・括弧の構造を壊さない
5. question-data/manage_questions.py check で検査
6. アプリを起動して問題を実際に確認（キャッシュが残る場合は再読み込み）

■ 一覧を出力
Python 3 があれば、question-data フォルダに移動して
  python manage_questions.py check
  python manage_questions.py export question_list.csv
  python manage_questions.py show naming 1
で問題を一覧・確認できます。CSVは閲覧・整理用です。CSVを編集してもアプリには自動反映されません。

■ 大事な制限
この版で分割したのはapp.jsの基本問題113件です。
追加問題はscripts/questions/question-bank-veta11.js等、専用問題は別のゲームスクリプトに残ります。
追加問題のLvの判定・補充処理は既存の仕組みが優先される場合があります。
Lvの割当は原版の値または仮分類を引き継いでおり、臨床的難易度の妥当性は未検証です。
空のlvXX.jsは編集用の枠で、まだ問題が入っていません。
ローカルで直接index.htmlを開く場合はブラウザの制限があるため、同梱の起動方法に従ってください。
