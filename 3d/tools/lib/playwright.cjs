// playwright の読み込み(プロジェクト内 → グローバル(npm root -g)の順に探す)。NODE_PATH の指定は不要
const {execSync}=require('child_process');
function load(){try{return require('playwright');}catch{}
  try{const g=execSync('npm root -g',{encoding:'utf8'}).trim();return require(require('path').join(g,'playwright'));}catch{}
  throw new Error('playwright が見つかりません。`npm i -g playwright` を実行してください');}
module.exports=load();
