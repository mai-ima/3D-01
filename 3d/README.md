# 日本の信号・軌道 3Dモデルライブラリ

日本の信号機(車両用・歩行者用・路面電車・鉄道・踏切)と軌道を、コード(Three.js)で作図し、
**glTF 2.0 バイナリ(GLB)** として書き出すプロジェクトです。他のスレッド・プロジェクトから
`3d/models` の GLB と `3d/runtime` をそのまま使えます。

収録: 信号 23種(車両用8 / 歩行者用4 / 車両・歩行者一体2 / 路面電車3 / 鉄道4 / 踏切2)、軌道 3種、
道路関係 18種(標識4 / 防護柵2 / 道路付属物4 / 道路照明2 / 工事用品2 / 路面4)、
高速道路 10種(料金所1 / 標識3 / 情報板1 / 防護柵・分離帯4 / 照明1)、
道路(車道) 4種(一般国道 / 主要地方道 / 高規格幹線道路 / 高速自動車国道。長さ20mの区画を並べて使う)。

## 構成(データの流れ)

```
3d/src  ──(export)──▶  3d/models  ──(viewer / runtime)──▶  画面・他プロジェクト
  ソース(1モデル=1ファイル)   GLB・meta.json・サムネイル・index.json
```

```
3d/
├─ src/                       モデルのソース。フォルダ階層 = カテゴリ階層
│  ├─ kit/
│  │  ├─ index.js             共通部品(材質・ポール・レンズ・ランプ・任意部品)
│  │  ├─ signal-parts.js      信号機用の部品(灯器ヘッド・取付金具・歩行者灯・鉄道灯器・状態表)
│  │  ├─ track-parts.js       軌道用の部品(レール断面・まくらぎ・砂利・敷石)
│  │  ├─ road-parts.js        道路用の部品(標識板・支柱・金具・反射材・発光面)
│  │  ├─ expressway-parts.js  高速道路用の部品(緑地の案内板・トラス・料金所の表示板・断面の押し出し)
│  │  └─ roadway-parts.js     道路(車道)の部品(舗装・区画線・縁石・ガードレール・ワイヤロープ・壁)
│  ├─ categories.json         カテゴリ名(日本語)。フォルダのパスをキーにする
│  ├─ registry.js             自動生成(npm run registry)。手で編集しない
│  ├─ signal/<サブ>/<id>.js   信号モデル(vehicle / pedestrian / combined / tram / rail / crossing)
│  ├─ track/<サブ>/<id>.js    軌道モデル(railway / tram)
│  ├─ road/<サブ>/<id>.js     道路モデル(sign / barrier / facility / lighting / construction / surface)
│  ├─ expressway/<サブ>/<id>.js 高速道路モデル(tollgate / sign / info / barrier / lighting)
│  └─ roadway/<サブ>/<id>.js   道路(車道)モデル(national / regional / arterial / expressway)
├─ models/                    成果物(自動生成。リポジトリに含める)
│  ├─ index.json              全モデルの目録(状態・オプション・寸法・ランプ一覧)
│  └─ <カテゴリ…>/<id>/{model.glb, meta.json, thumb.jpg}
├─ runtime/model-runtime.js   GLB の読み込み・点灯制御・オプション切替(他プロジェクトにコピーして使える)
├─ viewer/                    ブラウザのビューア
│  ├─ main.js / env.js        画面の動作 / 背景・地面・照明
│  ├─ ui.css                  共通スタイル
│  ├─ index.html              信号ビューア(左=一覧 / 中央=3D / 右=操作)
│  ├─ library.html            全モデルのライブラリ(一覧→詳細)
│  └─ _stage.html _ctl.html   2つの画面で共有するマークアップ(ビルド時に差し込む)
└─ tools/                     制作・検証ツール(下記)
```

## 使い方(コマンド)

`npm install` のあと、Playwright が必要です(`npm i -g playwright`。見つからなければ自動でグローバルも探します)。

| コマンド | 内容 |
|---|---|
| `npm run build` | 書き出し → 最適化 → 整合性検査 → ビューア生成 → 動作確認を通して実行 |
| `npm run export [id…]` | `src` から GLB と `index.json` を生成(id 指定で一部だけ) |
| `npm run optimize` | GLB を最適化(頂点溶接+量子化。ノード名・マテリアル名は保持) |
| `npm run check` | **整合性検査**。状態・サイクル・オプション・ランプが GLB と食い違っていないか+依存関係の規則 |
| `node 3d/tools/audit-options.cjs <出力先>` | **全選択肢の撮影監査**。全モデル×全オプションを1つずつ撮影(`python 3d/tools/sheet-options.py` で一覧シートに)。文字の干渉・床との重なりを目視 |
| `npm run check:ao` | 画質「高」で黒い四角(AOの不具合)が出ないことの回帰テスト |
| `npm run quality` | **品質監査(数値)**。三角形数・材質数・寸法・オプションの実在などを見て、現実品質に足りない疑いを報告(汚れ・経年劣化は評価しない) |
| `npm run smoke` | ビューアの動作確認(折りたたみ・オプション・現示・検索・遮断機の動き) |
| `npm run thumbs [id…]` | サムネイルを生成 |
| `npm run viewer` | `dist/signals.html` と `dist/all.html` を生成(`dist/` は Git 管理外) |
| `npm run pack` | アーティファクト公開用(GLB を base64 テキスト化)を `3d/dist/pub` に作る |
| `npm run audit -- <出力先> [env] [id…]` | 各モデルを「全体/灯器アップ」で撮影(目視確認用) |

補助: `tools/render-blender.py`(Blender で物理ベースのレンダリング)、`tools/sheet.py`(撮影画像の一覧シート)、
`tools/shot.cjs`(ビューアの任意操作を撮影)。

## 新しいモデルを追加する

1. `3d/src/<カテゴリ>/<サブ>/<id>.js` を作る。既存ファイルを手本に、次の形で `export default` する。
   ```js
   import {…使う部品だけ…} from '../../kit/signal-parts.js';
   export default {id, name, desc, dims, focus, view, states, cycle, night, options, build(){ … return {root, lamps}; }};
   ```
2. 新しいカテゴリなら `src/categories.json` に日本語名を足す。
3. `npm run build`、続いて `npm run thumbs <id>`。

## GLB の規約(他のスレッドで使うときの約束)

- 単位はメートル、原点は設置面の中心、**正面は +Z**、上は +Y。
- **ランプ**: メッシュ名 `lamp_<key>`(LED式)/ `lampB_<key>`(電球式)。マテリアル名 `lens_<key>` / `lensB_<key>`。
  GLB は消灯状態で、点灯色は `material.userData.litColor`、輝度係数は `litIntensity`。
- **任意部品**: ノード名 `opt_<オプション>_<選択肢>`。部品は常に **`on`** の名前で作り、`off` は「何も付けない」を意味する。
  灯火方式だけは `opt_lens_led` / `opt_lens_bulb` の2択。GLB には全バリエーションが入っているので、
  `runtime` の `setOption()` で選んだものだけを表示する(素の glTF ビューアでは重なって見える)。
- **色オプション**: `type:'color'` のオプションは、`target` のマテリアルの色を差し替える(例: 灯器の本体色)。
- **可動部**: `anim.node` で指すグループを、状態の `arm`(ラジアン)へ回す(遮断機)。
- **現示**: `states[]`(`on` 点灯 / `flash` 点滅 / `flash2` 逆位相の点滅)、`cycle[]`(自動循環の順序と秒数)。

## runtime の使い方

```js
import {loadModel, cycleAt} from './runtime/model-runtime.js';
const index = await (await fetch('models/index.json')).json();
const entry = index.models.find(m => m.id === 'jp-combo-arm-ped');
const m = await loadModel('models/' + entry.file, entry);   // m.root が Three.js の Group
scene.add(m.root);
m.setOption('button', 'off');   // 押ボタン箱を外す
m.setOption('lens', 'bulb');    // 電球式(フレネルレンズ)にする
m.setState('s4');               // 車 赤 / 歩 青
// 毎フレーム: m.update(deltaSec, elapsedSec);
```

## 書き出し時の自動警告(`npm run export`)

- `△ 文字の重なり`: 標識などの画像で、文字の外接枠が重なっている(矢印・図形との重なりは目視)。
- `△ 地面と同じ高さで上を向いた面`: ビューアの地面(y=0)と重なって乱れる面(z-fighting)がある。底を少し下げるか、わずかに浮かす。

## 依存の関係(守ること)

- `kit/index.js` は他に依存しない。`signal-parts.js`・`track-parts.js`・`road-parts.js` は `kit/index.js` だけに依存する。
- `expressway-parts.js` は `road-parts.js` だけに依存する(高速道路は道路の部品を土台にする)。
- `roadway-parts.js` は `road-parts.js` だけに依存する。
- モデル(`src/signal`, `src/track`, `src/road`, `src/expressway`, `src/roadway`)は、自分のカテゴリの部品ファイルだけを import する。モデル同士は import しない。
- `runtime` は Three.js だけに依存する(`src` や `viewer` を参照しない)。
- `viewer` は `runtime` と `models/index.json` だけを通してモデルを扱い、`src` を参照しない。

## 精度について

- 形状・配列・色は、公開資料と Wikimedia Commons の実物写真との見比べに基づく。数値で確認できたのは、
  レンズ径φ300/φ250、LED灯器の外形(フジ工芸社・ショージの公表値)、遮断かんの塗装と水平時の高さ0.8m(国の告示)、
  鋼管柱の径(広島県警の設計書)、踏切全方向形警報灯の寸法など。
- 寸法の多くは代表値からの推定で、各モデルの `dims` に明記している。メーカー・年式・事業者で差がある。
- 日本全国の全種類の完全再現は未達。収録範囲は `models/index.json` を参照。
