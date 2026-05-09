import type { SensorSize } from './optics.ts';
import { mm } from './units.ts';

export type SensorCategory =
  | 'medium-format'
  | 'full-frame'
  | 'aps-c'
  | 'mft'
  | 'compact'
  | 'cinema'
  | 'phone';

export interface SensorFormat extends SensorSize {
  readonly id: string;
  readonly label: string;
  readonly category: SensorCategory;
}

/**
 * Standard sensor formats. Dimensions follow industry-published values
 * (CIPA / manufacturer datasheets); when figures vary slightly between
 * makers (e.g. APS-C 23.6 vs Canon 22.3) we keep both as separate entries.
 */
export const SENSOR_FORMATS = [
  {
    id: 'mf-645',
    label: '中判 645 (56×41.5)',
    category: 'medium-format',
    width: mm(56),
    height: mm(41.5),
  },
  {
    id: 'gfx',
    label: '中判 44×33 (GFX / X1D)',
    category: 'medium-format',
    width: mm(43.8),
    height: mm(32.9),
  },
  {
    id: 'ff',
    label: 'フルサイズ 35mm (36×24)',
    category: 'full-frame',
    width: mm(36),
    height: mm(24),
  },
  {
    id: 'aps-h',
    label: 'APS-H (28.7×19.0)',
    category: 'full-frame',
    width: mm(28.7),
    height: mm(19.0),
  },
  {
    id: 'aps-c',
    label: 'APS-C Sony/Nikon/Fuji (23.6×15.6)',
    category: 'aps-c',
    width: mm(23.6),
    height: mm(15.6),
  },
  {
    id: 'aps-c-canon',
    label: 'APS-C Canon (22.3×14.9)',
    category: 'aps-c',
    width: mm(22.3),
    height: mm(14.9),
  },
  {
    id: 'mft',
    label: 'マイクロフォーサーズ (17.3×13.0)',
    category: 'mft',
    width: mm(17.3),
    height: mm(13.0),
  },
  {
    id: 's35-3perf',
    label: 'Super 35 3-perf (24.89×13.86)',
    category: 'cinema',
    width: mm(24.89),
    height: mm(13.86),
  },
  {
    id: 's35-4perf',
    label: 'Super 35 4-perf (24.89×18.66)',
    category: 'cinema',
    width: mm(24.89),
    height: mm(18.66),
  },
  {
    id: 's16',
    label: 'Super 16 (12.52×7.41)',
    category: 'cinema',
    width: mm(12.52),
    height: mm(7.41),
  },
  {
    id: '1in',
    label: '1型 (13.2×8.8)',
    category: 'compact',
    width: mm(13.2),
    height: mm(8.8),
  },
  {
    id: '1-1.7',
    label: '1/1.7型 (7.6×5.7)',
    category: 'compact',
    width: mm(7.6),
    height: mm(5.7),
  },
  {
    id: '1-2.3',
    label: '1/2.3型 (6.17×4.55)',
    category: 'compact',
    width: mm(6.17),
    height: mm(4.55),
  },
  {
    id: 'phone-1in',
    label: 'スマホ 1型相当 (13.2×8.8)',
    category: 'phone',
    width: mm(13.2),
    height: mm(8.8),
  },
  {
    id: 'phone-1-1.56',
    label: 'スマホ 1/1.56型 (8.0×6.0)',
    category: 'phone',
    width: mm(8.0),
    height: mm(6.0),
  },
] as const satisfies readonly SensorFormat[];

/**
 * Tuple-literal indexing keeps `[0]` non-`undefined` even under
 * `noUncheckedIndexedAccess` — gives us a default that works without a
 * throwable empty-array branch (which would be untestable for C1).
 */
export const DEFAULT_SENSOR_FORMAT: SensorFormat = SENSOR_FORMATS[0];

export const findFormat = (id: string): SensorFormat | undefined =>
  SENSOR_FORMATS.find((f) => f.id === id);
