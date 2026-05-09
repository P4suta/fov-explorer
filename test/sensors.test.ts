import { describe, expect, it } from 'vitest';
import { cropFactor } from '../src/lib/optics.ts';
import { findFormat, SENSOR_FORMATS } from '../src/lib/sensors.ts';

describe('SENSOR_FORMATS catalog', () => {
  it('has a unique id for every entry', () => {
    const ids = SENSOR_FORMATS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has only positive sensor dimensions', () => {
    for (const f of SENSOR_FORMATS) {
      expect(f.width as number).toBeGreaterThan(0);
      expect(f.height as number).toBeGreaterThan(0);
    }
  });

  it('contains the canonical full-frame entry with cropFactor 1', () => {
    const ff = findFormat('ff');
    expect(ff).toBeDefined();
    if (!ff) {
      throw new Error('unreachable');
    }
    expect(cropFactor(ff)).toBe(1);
    expect(ff.width as number).toBe(36);
    expect(ff.height as number).toBe(24);
  });

  it('reports MFT cropFactor ≈ 2.0', () => {
    const mft = findFormat('mft');
    expect(mft).toBeDefined();
    if (!mft) {
      throw new Error('unreachable');
    }
    expect(cropFactor(mft)).toBeCloseTo(2.0, 2);
  });
});

describe('findFormat', () => {
  it('returns the matching format', () => {
    expect(findFormat('aps-c')?.id).toBe('aps-c');
  });

  it('returns undefined for an unknown id', () => {
    expect(findFormat('does-not-exist')).toBeUndefined();
  });
});
