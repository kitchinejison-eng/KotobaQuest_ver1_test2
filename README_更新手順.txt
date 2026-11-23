ことばクエスト Ver.2.5.4a | GitHub公開サイト用 追加差し替え9ファイル
対象：https://github.com/kitchinejison-eng/KotobaQuest_ver1_test
確認日：2026年11月23日

調査結果
- 会話イベント画像 2_neko.webp / 3_sirasu.webp / 3_neko2.webp は GitHub main に既にあります（再アップロード不要）。
- 会話イベント背景 back_1.jpg～back_5.jpg と吹き出し m_e1097_0.png も main にあります。
- 以下の9ファイルは修正前の版のままでした。
- 本ZIPはVer.2.5.4ベースの会話イベント修正（Ver.2.5.4a）で、修正済み9ファイルを収録しています。

アップロード対象9ファイル：
  opening-event.html
  kotoba-quest-ud.html
  index.html
  service-worker.js
  VERSION.txt
  scripts/application/app.js
  scripts/games/fantasy-v47.js
  styles/games/fantasy-event-veta13.css
  styles/ui/veta19-dialogue.css


作業手順
1. GitHubの既存リポジトリのデータをバックアップしてください。
2. このZIPを解凍してください。
3. 上記の9ファイルを、GitHubのリポジトリの「同じ階層」に上書きアップロードしコミットしてください。
   例：scripts/application/app.js は scripts/application/app.js に上書き。
   ZIP自体や新しいsiteフォルダーを上げても動作しません。
4. Actions → Deploy static content to Pages の成功を確認してください。
5. https://kitchinejison-eng.github.io/KotobaQuest_ver1_test/opening-event.html?v=254a を確認。
6. Chrome・Edgeは Ctrl + Shift + R 、改善しない場合はシークレットウィンドウで確認。
※サイトデータの一括削除は、保存された学習記録を消す恐れがあるため推奨しません。

注意
- このZIPはまだGitHubに適用していません（GitHub接続は読み取りのみ）。
- コードの静的検査済みですが、GitHub Pages公開URLの直接HTTP検証・実機画面テストは未実施です。
