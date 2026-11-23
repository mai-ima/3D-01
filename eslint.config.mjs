// ESLint(フラット設定)。目的は「実行前に誤りを見つける」こと: 未定義の名前・重複・到達不能コードなどを error にする。
// 1行に詰めた書き方のコードが多いため、見た目に関する規則(整形・未使用変数)は入れない。
import js from '@eslint/js';
import globals from 'globals';
const browser={...globals.browser,__api:'writable',__ready:'writable',__VIEWER__:'readonly'};
export default [
  {ignores:['node_modules/**','dist/**','3d/dist/**','3d/models/**','3d/src/registry.js']},
  js.configs.recommended,
  {files:['3d/src/**/*.js','3d/viewer/**/*.js','3d/runtime/**/*.js','3d/tools/export-entry.js'],languageOptions:{ecmaVersion:2023,sourceType:'module',globals:browser}},
  {files:['3d/tools/**/*.cjs'],languageOptions:{ecmaVersion:2023,sourceType:'commonjs',globals:{...globals.node,...browser,exportOne:'readonly',listIds:'readonly'}}},
  {rules:{
    'no-unused-vars':['warn',{args:'none',caughtErrors:'none',varsIgnorePattern:'^_',ignoreRestSiblings:true}],
    'no-empty':['error',{allowEmptyCatch:true}],
    'no-constant-condition':'off','no-prototype-builtins':'off','no-cond-assign':['error','except-parens'],
    'no-useless-escape':'off','no-inner-declarations':'off','no-fallthrough':'off','no-case-declarations':'off',
  }},
];
