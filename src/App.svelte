<script lang="ts">
  import Diagram from './components/Diagram.svelte';
  import {
    cropFactor,
    equivalentFocal,
    fieldOfView,
    type SensorSize,
  } from './lib/optics.ts';
  import {
    DEFAULT_SENSOR_FORMAT,
    SENSOR_FORMATS,
    type SensorFormat,
    findFormat,
  } from './lib/sensors.ts';
  import { type Mm, mm } from './lib/units.ts';

  let formatId = $state<string>('ff');
  let useCustom = $state<boolean>(false);
  let customW = $state<number>(36);
  let customH = $state<number>(24);
  let focalMm = $state<number>(50);
  let distanceM = $state<number>(3);

  const format = $derived<SensorFormat>(
    findFormat(formatId) ?? DEFAULT_SENSOR_FORMAT,
  );

  const sensor = $derived<SensorSize>(
    useCustom
      ? { width: mm(customW), height: mm(customH) }
      : { width: format.width, height: format.height },
  );

  const focal = $derived<Mm>(mm(focalMm));
  const fov = $derived(fieldOfView(sensor, focal));
  const cf = $derived(cropFactor(sensor));
  const equiv = $derived(equivalentFocal(sensor, focal));

  const fmt1 = (n: number): string => n.toFixed(1);
  const fmt2 = (n: number): string => n.toFixed(2);

  const categoryLabel = {
    'medium-format': '中判',
    'full-frame': '35mm 系',
    'aps-c': 'APS-C',
    mft: 'マイクロフォーサーズ',
    cinema: 'シネマ',
    compact: 'コンパクト',
    phone: 'スマートフォン',
  } as const;
  type Category = keyof typeof categoryLabel;
  const categoryOrder: readonly Category[] = [
    'medium-format',
    'full-frame',
    'aps-c',
    'mft',
    'cinema',
    'compact',
    'phone',
  ];

  const grouped: Readonly<Record<Category, readonly SensorFormat[]>> = (() => {
    const acc: Record<Category, SensorFormat[]> = {
      'medium-format': [],
      'full-frame': [],
      'aps-c': [],
      mft: [],
      cinema: [],
      compact: [],
      phone: [],
    };
    for (const f of SENSOR_FORMATS) {
      acc[f.category].push(f);
    }
    return acc;
  })();

  // Common focal-length presets — quick-jump buttons.
  const focalPresets = [14, 24, 35, 50, 85, 135, 200, 400] as const;
</script>

<div class="page">
  <header class="hero">
    <h1>視野角エクスプローラ</h1>
    <p class="sub">
      センサーサイズ × 焦点距離 → 画角(水平 / 垂直 / 対角)を即座に計算。
    </p>
  </header>

  <section class="controls" aria-label="入力">
    <div class="ctrl ctrl-wide">
      <label for="sensor-pick">センサー</label>
      <select id="sensor-pick" bind:value={formatId} disabled={useCustom}>
        {#each categoryOrder as cat (cat)}
          <optgroup label={categoryLabel[cat]}>
            {#each grouped[cat] as f (f.id)}
              <option value={f.id}>{f.label}</option>
            {/each}
          </optgroup>
        {/each}
      </select>

      <label class="toggle">
        <input type="checkbox" bind:checked={useCustom} />
        <span>カスタム</span>
      </label>

      <fieldset class="custom" disabled={!useCustom}>
        <input
          type="number"
          min="0.1"
          max="200"
          step="0.1"
          bind:value={customW}
          aria-label="幅 (mm)"
        />
        <span aria-hidden="true">×</span>
        <input
          type="number"
          min="0.1"
          max="200"
          step="0.1"
          bind:value={customH}
          aria-label="高さ (mm)"
        />
        <span class="unit">mm</span>
      </fieldset>
    </div>

    <div class="ctrl">
      <label for="focal-slider">
        焦点距離 <strong>{fmt1(focalMm)} mm</strong>
      </label>
      <div class="row">
        <input
          id="focal-slider"
          type="range"
          min="4"
          max="800"
          step="0.5"
          bind:value={focalMm}
        />
        <input
          type="number"
          min="0.1"
          max="2000"
          step="0.1"
          bind:value={focalMm}
          aria-label="焦点距離 (mm)"
          class="num"
        />
        <span class="unit">mm</span>
      </div>
      <div class="presets">
        {#each focalPresets as p (p)}
          <button
            type="button"
            class="preset"
            class:active={focalMm === p}
            onclick={() => {
              focalMm = p;
            }}
          >
            {p}
          </button>
        {/each}
      </div>
    </div>

    <div class="ctrl">
      <label for="dist-slider">
        距離 <strong>{fmt1(distanceM)} m</strong>
      </label>
      <div class="row">
        <input
          id="dist-slider"
          type="range"
          min="0.3"
          max="50"
          step="0.1"
          bind:value={distanceM}
        />
        <input
          type="number"
          min="0.1"
          max="500"
          step="0.1"
          bind:value={distanceM}
          aria-label="距離 (m)"
          class="num"
        />
        <span class="unit">m</span>
      </div>
    </div>
  </section>

  <section class="readout" aria-label="計算結果">
    <div class="cell big">
      <div class="lab">水平</div>
      <div class="val">{fmt1(fov.horizontal as number)}<span class="deg">°</span></div>
    </div>
    <div class="cell big">
      <div class="lab">垂直</div>
      <div class="val">{fmt1(fov.vertical as number)}<span class="deg">°</span></div>
    </div>
    <div class="cell big accent">
      <div class="lab">対角</div>
      <div class="val">{fmt1(fov.diagonal as number)}<span class="deg">°</span></div>
    </div>
    <div class="cell">
      <div class="lab">クロップ係数</div>
      <div class="val">×{fmt2(cf)}</div>
    </div>
    <div class="cell">
      <div class="lab">35mm 換算焦点距離</div>
      <div class="val">{fmt1(equiv as number)} mm</div>
    </div>
  </section>

  <section class="diagram-section" aria-label="視野角コーン">
    <Diagram {sensor} {focal} distanceMeters={distanceM} />
  </section>

  <footer class="foot">
    <p>
      <code>AoV = 2·arctan(d / 2f)</code> 薄レンズ近似。魚眼/超広角は実測値と差が出ます。
    </p>
    <p class="src">
      <a href="https://github.com/P4suta/fov-explorer" rel="noopener">source</a>
    </p>
  </footer>
</div>

<style>
  .page {
    max-width: 1100px;
    margin: 0 auto;
    padding: clamp(16px, 4vw, 40px);
    display: flex;
    flex-direction: column;
    gap: clamp(16px, 3vw, 28px);
  }

  .hero h1 {
    margin: 0 0 4px 0;
    font-size: clamp(1.5rem, 2.6vw + 0.5rem, 2.2rem);
    font-weight: 700;
    letter-spacing: -0.01em;
  }
  .sub {
    margin: 0;
    color: var(--muted);
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
  }
  @media (min-width: 800px) {
    .controls {
      grid-template-columns: 1fr 1fr;
    }
    .ctrl-wide {
      grid-column: 1 / -1;
    }
  }

  .ctrl {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .ctrl > label {
    color: var(--muted);
    font-size: 0.92rem;
  }
  .ctrl strong {
    color: var(--text);
    font-family: ui-monospace, "JetBrains Mono", monospace;
    font-weight: 600;
    margin-left: 6px;
  }
  .ctrl-wide {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }

  select,
  .num,
  .custom input {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
    color: var(--text);
    font-family: ui-monospace, "JetBrains Mono", monospace;
  }
  select:focus,
  .num:focus,
  input[type="number"]:focus,
  input[type="range"]:focus,
  .preset:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }
  select {
    flex: 1 1 240px;
    min-width: 0;
  }
  .num {
    width: 90px;
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--muted);
    cursor: pointer;
  }
  .toggle input {
    accent-color: var(--accent);
  }

  .custom {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 10px;
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface-2);
  }
  .custom:disabled,
  .custom[disabled] {
    opacity: 0.45;
  }
  .custom input {
    width: 70px;
    padding: 4px 6px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .row input[type="range"] {
    flex: 1 1 auto;
    min-width: 0;
    accent-color: var(--accent);
  }
  .unit {
    color: var(--muted);
    font-family: ui-monospace, "JetBrains Mono", monospace;
  }

  .presets {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .preset {
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 10px;
    color: var(--muted);
    cursor: pointer;
    font-family: ui-monospace, "JetBrains Mono", monospace;
    font-size: 0.85rem;
  }
  .preset:hover {
    color: var(--text);
    border-color: var(--accent);
  }
  .preset.active {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-soft);
  }

  .readout {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  .cell {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
  }
  .cell .lab {
    color: var(--muted);
    font-size: 0.82rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .cell .val {
    font-family: ui-monospace, "JetBrains Mono", monospace;
    font-size: 1.6rem;
    font-weight: 600;
    margin-top: 4px;
    line-height: 1.1;
  }
  .cell.big .val {
    font-size: 2rem;
  }
  .cell.accent {
    border-color: var(--accent);
  }
  .cell.accent .val {
    color: var(--accent);
  }
  .deg {
    font-size: 0.7em;
    margin-left: 1px;
    color: var(--muted);
  }

  .foot {
    color: var(--muted);
    font-size: 0.85rem;
  }
  .foot p { margin: 4px 0; }
  .foot code {
    font-family: ui-monospace, "JetBrains Mono", monospace;
    background: var(--surface-2);
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid var(--border);
  }
  .src a {
    color: var(--muted);
    text-decoration: none;
    border-bottom: 1px dotted var(--border);
  }
  .src a:hover { color: var(--accent); border-bottom-color: var(--accent); }
</style>
