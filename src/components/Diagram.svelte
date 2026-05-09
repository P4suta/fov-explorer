<script lang="ts">
  import {
    fieldOfView,
    heightAtDistance,
    widthAtDistance,
  } from '../lib/optics.ts';
  import type { SensorSize } from '../lib/optics.ts';
  import { type Mm, mm } from '../lib/units.ts';

  interface Props {
    sensor: SensorSize;
    focal: Mm;
    distanceMeters: number;
  }
  const { sensor, focal, distanceMeters }: Props = $props();

  const W = 1000;
  const H = 420;
  const PAD = 24;
  const LENS_X = PAD + 24;
  const AXIS_Y = H / 2;
  const CONE_LEN = W - LENS_X - PAD;

  const fov = $derived(fieldOfView(sensor, focal));
  const halfAng = $derived(((fov.horizontal as number) * Math.PI) / 360);

  // Visible scene depth in meters: ~1.4× selected distance, with a sane floor
  // so the diagram never collapses to nothing for tiny working distances.
  const sceneDepth = $derived(Math.max(distanceMeters * 1.4, 4));
  const pxPerMeter = $derived(CONE_LEN / sceneDepth);
  const xAtMeter = (m: number): number => LENS_X + m * pxPerMeter;

  // Cone apex points — SVG viewBox handles the clip for ultra-wide angles.
  const halfExtAtEnd = $derived(Math.tan(halfAng) * CONE_LEN);
  const conePts = $derived(
    `${LENS_X},${AXIS_Y} ${LENS_X + CONE_LEN},${AXIS_Y - halfExtAtEnd} ${LENS_X + CONE_LEN},${AXIS_Y + halfExtAtEnd}`,
  );

  const candidateTicks = [0.5, 1, 2, 3, 5, 10, 20, 50, 100] as const;
  const ticks = $derived(
    candidateTicks.filter(
      (m) => m !== distanceMeters && m <= sceneDepth * 0.96,
    ),
  );

  const widthMeters = (m: number): number =>
    (widthAtDistance(sensor, focal, mm(m * 1000)) as number) / 1000;
  const heightMeters = (m: number): number =>
    (heightAtDistance(sensor, focal, mm(m * 1000)) as number) / 1000;

  const fmt = (n: number): string => (n >= 10 ? n.toFixed(1) : n.toFixed(2));
  const fmtM = (n: number): string => (n >= 10 ? `${n.toFixed(0)}m` : `${n}m`);

  const selX = $derived(xAtMeter(distanceMeters));
  const selHalfPx = $derived(distanceMeters * Math.tan(halfAng) * pxPerMeter);
  const selW = $derived(widthMeters(distanceMeters));
  const selH = $derived(heightMeters(distanceMeters));
</script>

<svg
  viewBox="0 0 {W} {H}"
  preserveAspectRatio="xMidYMid meet"
  xmlns="http://www.w3.org/2000/svg"
  class="diagram"
  role="img"
  aria-label="視野角コーン図"
>
  <line
    x1={LENS_X}
    y1={AXIS_Y}
    x2={LENS_X + CONE_LEN}
    y2={AXIS_Y}
    class="axis"
  />

  <polygon points={conePts} class="cone" />

  {#each ticks as m (m)}
    {@const x = xAtMeter(m)}
    {@const halfPx = m * Math.tan(halfAng) * pxPerMeter}
    <line x1={x} y1={AXIS_Y - halfPx} x2={x} y2={AXIS_Y + halfPx} class="tick" />
    <text x={x} y={H - 8} class="tick-label">{fmtM(m)}</text>
  {/each}

  <line
    x1={selX}
    y1={AXIS_Y - selHalfPx}
    x2={selX}
    y2={AXIS_Y + selHalfPx}
    class="sel-line"
  />
  <text
    x={selX}
    y={Math.max(AXIS_Y - selHalfPx - 10, 18)}
    class="sel-label"
  >
    {fmt(selW)} × {fmt(selH)} m  @  {fmt(distanceMeters)} m
  </text>

  <ellipse cx={LENS_X} cy={AXIS_Y} rx="6" ry="22" class="lens" />
</svg>

<style>
  .diagram {
    display: block;
    width: 100%;
    height: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .axis {
    stroke: var(--axis);
    stroke-width: 1.2;
    stroke-dasharray: 4 4;
  }
  .cone {
    fill: var(--cone-fill);
    stroke: var(--cone-stroke);
    stroke-width: 1.5;
    stroke-linejoin: round;
  }
  .tick {
    stroke: var(--tick);
    stroke-width: 1;
    stroke-dasharray: 2 3;
    opacity: 0.65;
  }
  .tick-label {
    fill: var(--muted);
    font-size: 14px;
    text-anchor: middle;
    font-family: ui-monospace, "JetBrains Mono", monospace;
  }
  .sel-line {
    stroke: var(--accent);
    stroke-width: 2.5;
  }
  .sel-label {
    fill: var(--accent);
    font-size: 16px;
    font-weight: 600;
    text-anchor: middle;
    font-family: ui-monospace, "JetBrains Mono", monospace;
  }
  .lens {
    fill: var(--lens);
    stroke: var(--lens-stroke);
    stroke-width: 1.4;
  }
</style>
