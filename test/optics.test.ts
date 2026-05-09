import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  angleOfView,
  cropFactor,
  diagonal,
  equivalentFocal,
  FULL_FRAME_DIAGONAL_MM,
  fieldOfView,
  heightAtDistance,
  widthAtDistance,
} from '../src/lib/optics.ts';
import { mm } from '../src/lib/units.ts';

const FULL_FRAME = { width: mm(36), height: mm(24) };
const APS_C = { width: mm(23.6), height: mm(15.6) };
const MFT = { width: mm(17.3), height: mm(13.0) };

const FOCAL_POSITIVE_RE = /> 0 mm/;
const EXTENT_NONNEG_RE = />= 0 mm/;
const POSITIVE_DIAGONAL_RE = /positive diagonal/;

describe('diagonal', () => {
  it('matches the canonical 35mm full-frame diagonal', () => {
    expect(diagonal(FULL_FRAME) as number).toBeCloseTo(43.2666, 3);
    expect(FULL_FRAME_DIAGONAL_MM as number).toBeCloseTo(43.2666, 3);
  });

  it('returns the hypotenuse for arbitrary positive sensors', () => {
    expect(diagonal({ width: mm(3), height: mm(4) }) as number).toBeCloseTo(5, 12);
  });
});

describe('angleOfView', () => {
  it('matches textbook anchors on full-frame (50/35/24/100 mm)', () => {
    const ff = FULL_FRAME;
    const fovAt = (f: number) => fieldOfView(ff, mm(f));
    expect(fovAt(50).diagonal as number).toBeCloseTo(46.79, 1);
    expect(fovAt(35).diagonal as number).toBeCloseTo(63.44, 1);
    expect(fovAt(24).diagonal as number).toBeCloseTo(84.06, 1);
    expect(fovAt(100).diagonal as number).toBeCloseTo(24.41, 1);
  });

  it('rejects non-positive focal length', () => {
    expect(() => angleOfView(mm(36), mm(0))).toThrow(RangeError);
    expect(() => angleOfView(mm(36), mm(-50))).toThrow(FOCAL_POSITIVE_RE);
  });

  it('rejects negative sensor extent', () => {
    expect(() => angleOfView(mm(-1), mm(50))).toThrow(RangeError);
    expect(() => angleOfView(mm(-1), mm(50))).toThrow(EXTENT_NONNEG_RE);
  });

  it('returns 0 rad when the sensor extent is 0', () => {
    expect(angleOfView(mm(0), mm(50)) as number).toBe(0);
  });

  it('is monotonically decreasing in focal length (fixed sensor)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 1, max: 100, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.01, max: 50, noNaN: true, noDefaultInfinity: true }),
        (extent, f1, df) => {
          const a = angleOfView(mm(extent), mm(f1)) as number;
          const b = angleOfView(mm(extent), mm(f1 + df)) as number;
          return b <= a;
        },
      ),
    );
  });

  it('is monotonically increasing in sensor extent (fixed focal)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 200, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0, max: 100, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.01, max: 50, noNaN: true, noDefaultInfinity: true }),
        (focal, e1, de) => {
          const a = angleOfView(mm(e1), mm(focal)) as number;
          const b = angleOfView(mm(e1 + de), mm(focal)) as number;
          return b >= a;
        },
      ),
    );
  });

  it('approaches 0 as focal → ∞', () => {
    expect(angleOfView(mm(36), mm(1e9)) as number).toBeCloseTo(0, 6);
  });
});

describe('fieldOfView', () => {
  it('horizontal > vertical and diagonal is the largest', () => {
    const fov = fieldOfView(FULL_FRAME, mm(50));
    const h = fov.horizontal as number;
    const v = fov.vertical as number;
    const d = fov.diagonal as number;
    expect(h).toBeGreaterThan(v);
    expect(d).toBeGreaterThan(h);
  });

  it('produces the documented 50 mm-on-FF triple within 0.1°', () => {
    const fov = fieldOfView(FULL_FRAME, mm(50));
    expect(fov.horizontal as number).toBeCloseTo(39.6, 1);
    expect(fov.vertical as number).toBeCloseTo(27.0, 1);
    expect(fov.diagonal as number).toBeCloseTo(46.8, 1);
  });
});

describe('cropFactor', () => {
  it('is exactly 1 for full-frame', () => {
    expect(cropFactor(FULL_FRAME)).toBe(1);
  });

  it('matches the published anchors (≈1.53 for APS-C, ≈2.0 for MFT)', () => {
    expect(cropFactor(APS_C)).toBeCloseTo(1.529, 2);
    expect(cropFactor(MFT)).toBeCloseTo(2.0, 2);
  });

  it('rejects a degenerate (0×0) sensor', () => {
    expect(() => cropFactor({ width: mm(0), height: mm(0) })).toThrow(POSITIVE_DIAGONAL_RE);
  });
});

describe('equivalentFocal', () => {
  it('is identity on full-frame', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 2000, noNaN: true, noDefaultInfinity: true }),
        (f) => (equivalentFocal(FULL_FRAME, mm(f)) as number) === f,
      ),
    );
  });

  it('matches the cropFactor × focal identity', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.5, max: 50, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.5, max: 50, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 1, max: 2000, noNaN: true, noDefaultInfinity: true }),
        (w, h, f) => {
          const sensor = { width: mm(w), height: mm(h) };
          const eq = equivalentFocal(sensor, mm(f)) as number;
          return Math.abs(eq - cropFactor(sensor) * f) < 1e-9;
        },
      ),
    );
  });
});

describe('widthAtDistance / heightAtDistance', () => {
  it('produce the documented framing at 50 mm / 3 m on full-frame', () => {
    // 50 mm on FF: horizontal AoV ~39.6° → tan(19.8°) ≈ 0.36; 2·3·0.36 ≈ 2.16 m
    const w = widthAtDistance(FULL_FRAME, mm(50), mm(3000)) as number;
    const h = heightAtDistance(FULL_FRAME, mm(50), mm(3000)) as number;
    expect(w).toBeCloseTo(2160, -1);
    expect(h).toBeCloseTo(1440, -1);
  });

  it('returns 0 framing at distance 0', () => {
    expect(widthAtDistance(FULL_FRAME, mm(50), mm(0)) as number).toBe(0);
    expect(heightAtDistance(FULL_FRAME, mm(50), mm(0)) as number).toBe(0);
  });

  it('rejects negative distance', () => {
    expect(() => widthAtDistance(FULL_FRAME, mm(50), mm(-1))).toThrow(RangeError);
    expect(() => heightAtDistance(FULL_FRAME, mm(50), mm(-1))).toThrow(RangeError);
  });

  it('scales linearly with distance', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 100, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0.5, max: 50, noNaN: true, noDefaultInfinity: true }),
        (d, k) => {
          const w1 = widthAtDistance(FULL_FRAME, mm(50), mm(d)) as number;
          const w2 = widthAtDistance(FULL_FRAME, mm(50), mm(d * k)) as number;
          return Math.abs(w2 - w1 * k) < 1e-6;
        },
      ),
    );
  });
});
