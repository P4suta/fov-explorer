# 視野角エクスプローラ (fov-explorer)

センサーサイズ × レンズ焦点距離 → 画角(水平 / 垂直 / 対角)を即座に計算する
インタラクティブな Web ツール。

> [Live: p4suta.github.io/fov-explorer](https://p4suta.github.io/fov-explorer/)

## できること

- センサー定型(中判 / フルサイズ / APS-C / MFT / 1″ / S35 / S16 / スマホ等)
  またはカスタム W×H の選択
- 焦点距離スライダ + 数値入力(プリセット 14 / 24 / 35 / 50 / 85 / 135 / 200 / 400)
- 距離スライダで「指定距離で何 m × 何 m が映るか」をリアルタイム表示
- 視野角コーンの SVG 図示(距離グリッド + 選択距離ハイライト)
- クロップ係数と 35 mm 換算焦点距離

## アーキテクチャ

```
┌─ src/lib/units.ts        — Mm / Deg / Rad branded types (unique symbol)
├─ src/lib/optics.ts       — angleOfView, fieldOfView, cropFactor, ...
├─ src/lib/sensors.ts      — 定型センサーカタログ(tuple-literal)
├─ src/components/Diagram.svelte — top-down SVG cone view
└─ src/App.svelte          — runes-based reactive UI
```

光学関係は薄レンズ近似で

```
AoV(d, f) = 2 · arctan(d / 2f)
```

を一点に集約。`Mm`/`Deg`/`Rad` は `unique symbol` を使った nominal 型で、
"Math.tan に degree を渡す" のような単位ミスを *型レベルで* 拒否する。

## 開発(Docker-only)

ホスト側に必要なのは `docker compose` と `just` のみ。Bun/Vite/Vitest/Biome は
全てコンテナ内で動く。

```bash
just bootstrap       # Docker image build + bun install
just dev             # vite dev server (http://localhost:5173)
just test            # vitest
just coverage        # C1 100% 強制ゲート
just lint            # Biome (めっちゃ厳しい設定)
just typecheck       # svelte-check + tsc strict
just strict-code     # bare TODO / @ts-ignore / : any 等を grep で拒否
just ci              # 上記をまとめて実行
```

### 厳格度

| Layer | 設定 |
|---|---|
| TypeScript | `strict` + `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess` + `verbatimModuleSyntax` + `noPropertyAccessFromIndexSignature` |
| Biome | `linter.rules.* = { all: true }` (a11y / complexity / correctness / performance / security / style / suspicious 全部 on) |
| Vitest | C1 (branch) coverage **100% 強制**(下回ったら CI 失敗) |
| 性質テスト | fast-check による monotonicity / scaling / identity の検証 |
| 静的 grep | `TODO/FIXME(#NN)` 必須、`@ts-ignore` / `biome-ignore` / `as any` 禁止 |

## 公開

`main` への push で `pages.yml` が自動デプロイ。GitHub Pages 設定は
`Settings → Pages → Source: GitHub Actions`。

## License

MIT OR Apache-2.0(`LICENSE-MIT` / `LICENSE-APACHE`)
