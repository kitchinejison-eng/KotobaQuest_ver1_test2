/* Lv別問題データの読込後に実行。既存の問題追加スクリプトはそのまま動作します。 */
window.KotobaLevelBankBuild=function(){var out={};var files=window.KotobaLevelFiles||{};Object.keys(files).forEach(function(id){out[id]=[];Object.keys(files[id]).map(Number).sort(function(a,b){return a-b}).forEach(function(lv){out[id]=out[id].concat(files[id][lv]);});});return out;};
