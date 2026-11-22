# 3D モデルライブラリ(日本の信号・軌道)

他のスレッド・プロジェクトから再利用するための **3Dモデル資産**と、その制作・確認用ツール一式。
モデルは Three.js(コード)で作図し、**glTF 2.0 バイナリ(GLB)** として書き出します。

## フォルダ構成(信号 → 車両用信号 → 各3Dモデル)

```
3d/
├─ models/                          ← 成果物(GLB・メタ情報・サムネイル)
│  ├─ index.json                    ← 全モデルの目録(カテゴリ名・現示・オプション・寸法など)
│  ├─ signal/                       信号
│  │  ├─ vehicle/                   車両用信号
│  │  │  └─ jp-veh-h300-arm/        各3Dモデル(1モデル=1フォルダ)
│  │  │       ├─ model.glb
│  │  │       ├─ meta.json
│  │  │       └─ thumb.jpg
│  │  ├─ pedestrian/                歩行者用信号
│  │  ├─ combined/                  車両・歩行者一体信号
│  │  ├─ tram/                      路面電車用信号
│  │  ├─ rail/                      鉄道信号
│  │  └─ crossing/                  踏切
│  └─ track/                        軌道
│     ├─ railway/                   鉄道軌道(砂利道床・スラブ)
│     └─ tram/                      路面電車軌道(併用軌道)
├─ src/                             ← モデルのソース(同じ階層で1モデル=1ファイル)
│  ├─ kit/index.js                  共通部品(灯器レンズ・ポール・材質・任意部品)
│  ├─ kit/signal-parts.js           信号機用の部品(灯器ヘッド・取付金具・状態テーブル)
│  ├─ kit/track-parts.js            軌道用の部品(レール断面・まくらぎ・道床・敷石)
│  ├─ categories.json               カテゴリの日本語名
│  ├─ registry.js                   自動生成(モデル一覧)
│  └─ signal/…/<id>.js, track/…/<id>.js
├─ runtime/model-runtime.js         ← 他プロジェクトにそのままコピーして使える読み込み・制御ランタイム
├─ viewer/                          ← プレビューア(単一HTMLにビルド)
└─ tools/                           ← 書き出し・サムネイル・ビルド・目視確認
```

## 新しいモデルを追加する

1. `3d/src/<カテゴリ>/<サブカテゴリ>/<id>.js` を作る(既存ファイルを参考に `export default {id, name, desc, dims, states, cycle, options, build(){…}}`)。
2. 新カテゴリなら `3d/src/categories.json` に日本語名を足す。
3. `NODE_PATH=$(npm root -g) node 3d/tools/export.cjs` → GLB と `index.json` を再生成(`id` を引数に渡すと一部だけ)。
4. `node 3d/tools/thumbs.cjs` → サムネイル、`node 3d/tools/build-viewer.cjs` → `dist/signals.html`(信号のみ) と `dist/all.html`(全モデル)。

## GLB の規約(他スレッドで使うときの約束)

- 単位はメートル、原点は設置面(地面)の中心、**正面は +Z**、上は +Y。
- **ランプ**: メッシュ名 `lamp_<key>`(LED式レンズ)/ `lampB_<key>`(電球式レンズ)。マテリアル名 `lens_<key>` / `lensB_<key>`。
  GLB は**消灯状態**で出力され、点灯色は `material.userData.litColor`、輝度係数は `litIntensity` に入っている。
- **任意部品・方式**: ノード名 `opt_<オプション>_<選択肢>`(例 `opt_lens_led` / `opt_lens_bulb` / `opt_backplate_on`)。
  GLB には**全バリエーションが入っている**ため、`runtime` の `setOption()` で選択中のものだけを表示する。
  (素の glTF ビューアで開くと全バリエーションが重なって見える)
- **アニメーション**: 遮断機など可動部は `index.json` の `anim.node`(例 `gate_arm`)を回転させる。
- **現示(状態)**: `index.json` の `states[]`(`on` 常時点灯 / `flash` 点滅 / `flash2` 逆位相の点滅 / `arm` 可動角)と `cycle[]`(自動循環の順序と秒数)。

## ランタイムの使い方

```js
import {loadModel, cycleAt} from './runtime/model-runtime.js';
const index = await (await fetch('models/index.json')).json();
const entry = index.models.find(m => m.id === 'jp-combo-arm-ped');
const m = await loadModel('models/' + entry.file, entry);   // → three.js の Group(m.root)
scene.add(m.root);
m.setOption('button', 'off');     // 押ボタン箱を外す
m.setOption('lens', 'bulb');      // 電球式(フレネルレンズ)にする
m.setState('s4');                 // 車 赤 / 歩 青
// 毎フレーム: m.update(deltaSec, elapsedSec);
```

## 精度について

- **形状・配列・色**は公開情報(警察庁仕様・各社資料・解説記事)に基づく。確認できたのは、レンズ径φ300/φ250、前傾15°(積雪地20°)、踏切全方向形警報灯の寸法、鉄道色灯式の灯数と配列、路面電車用信号の現示など。
- **寸法の多くは代表値からの推定**(各モデルの `dims` に明記)。メーカー・年式・事業者で差がある。
- 日本全国のすべての信号の完全再現は未達。収録範囲は `index.json` と `models/` を参照。
