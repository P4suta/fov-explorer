import { describe, expect, it } from 'vitest';
import { deg, degToRad, mm, rad, radToDeg } from '../src/lib/units.ts';

describe('units', () => {
  it('mm/deg/rad pass values through unchanged at runtime', () => {
    expect(mm(36) as number).toBe(36);
    expect(deg(45) as number).toBe(45);
    expect(rad(1.5) as number).toBe(1.5);
  });

  describe('degToRad ↔ radToDeg', () => {
    it('agrees with the canonical anchor values', () => {
      expect(degToRad(deg(0)) as number).toBe(0);
      expect(degToRad(deg(90)) as number).toBeCloseTo(Math.PI / 2, 12);
      expect(degToRad(deg(180)) as number).toBeCloseTo(Math.PI, 12);
      expect(radToDeg(rad(Math.PI)) as number).toBeCloseTo(180, 12);
      expect(radToDeg(rad(Math.PI / 4)) as number).toBeCloseTo(45, 12);
    });

    it('round-trips within float tolerance', () => {
      for (const d of [-180, -45, 0, 1, 47, 90, 179.99, 360]) {
        const back = radToDeg(degToRad(deg(d))) as number;
        expect(back).toBeCloseTo(d, 10);
      }
    });
  });
});
