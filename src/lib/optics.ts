import { type Deg, type Mm, type Rad, radToDeg } from './units.ts';

/**
 * Geometric optics for a thin-lens / pinhole approximation:
 *
 *     AoV(d, f) = 2 · arctan( d / (2f) )
 *
 * where `d` is a sensor extent (width / height / diagonal) and `f` is the
 * lens focal length. Real lenses depart from this near the wide end (lens
 * distortion, pupil-magnification effects) but the textbook formula is
 * accurate enough for framing / scouting work and is the de-facto reference
 * used throughout the camera industry.
 */

export interface SensorSize {
  readonly width: Mm;
  readonly height: Mm;
}

export const diagonal = (s: SensorSize): Mm =>
  Math.hypot(s.width as number, s.height as number) as Mm;

export const angleOfView = (extent: Mm, focal: Mm): Rad => {
  if ((focal as number) <= 0) {
    throw new RangeError(`focal length must be > 0 mm, got ${focal as number}`);
  }
  if ((extent as number) < 0) {
    throw new RangeError(`sensor extent must be >= 0 mm, got ${extent as number}`);
  }
  return (2 * Math.atan((extent as number) / (2 * (focal as number)))) as Rad;
};

export interface FieldOfView {
  readonly horizontal: Deg;
  readonly vertical: Deg;
  readonly diagonal: Deg;
}

export const fieldOfView = (sensor: SensorSize, focal: Mm): FieldOfView => ({
  horizontal: radToDeg(angleOfView(sensor.width, focal)),
  vertical: radToDeg(angleOfView(sensor.height, focal)),
  diagonal: radToDeg(angleOfView(diagonal(sensor), focal)),
});

/** Diagonal of the 35 mm full-frame reference sensor (36 × 24 mm). */
export const FULL_FRAME_DIAGONAL_MM: Mm = Math.hypot(36, 24) as Mm;

/**
 * Crop factor: ratio of the 35 mm full-frame diagonal to the given sensor's
 * diagonal. Full-frame ≡ 1.0 by definition; APS-C ≈ 1.5; MFT ≈ 2.0.
 */
export const cropFactor = (sensor: SensorSize): number => {
  const d = diagonal(sensor) as number;
  if (d <= 0) {
    throw new RangeError('sensor must have positive diagonal');
  }
  return (FULL_FRAME_DIAGONAL_MM as number) / d;
};

/** "35 mm equivalent" focal length — the focal length that would yield the
 * same diagonal angle of view on a full-frame sensor. */
export const equivalentFocal = (sensor: SensorSize, focal: Mm): Mm =>
  (cropFactor(sensor) * (focal as number)) as Mm;

const tanHalf = (extent: Mm, focal: Mm): number =>
  Math.tan((angleOfView(extent, focal) as number) / 2);

const requireNonNegativeDistance = (distance: Mm): void => {
  if ((distance as number) < 0) {
    throw new RangeError(`distance must be >= 0 mm, got ${distance as number}`);
  }
};

/** Width of the framed scene at a given working distance from the lens. */
export const widthAtDistance = (sensor: SensorSize, focal: Mm, distance: Mm): Mm => {
  requireNonNegativeDistance(distance);
  return (2 * (distance as number) * tanHalf(sensor.width, focal)) as Mm;
};

/** Height of the framed scene at a given working distance from the lens. */
export const heightAtDistance = (sensor: SensorSize, focal: Mm, distance: Mm): Mm => {
  requireNonNegativeDistance(distance);
  return (2 * (distance as number) * tanHalf(sensor.height, focal)) as Mm;
};
