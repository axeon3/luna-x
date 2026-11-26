import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';

export function wrapAzimuthDeg(azimuthDeg: number): number {
  const wrapped = ((azimuthDeg % 360) + 360) % 360;
  return wrapped === 360 || Object.is(wrapped, -0) ? 0 : wrapped;
}

describe('Lunar invariants', () => {
  it('wrapAzimuthDeg normalizes finite angles into [0, 360)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }),
        (az) => {
          const wrapped = wrapAzimuthDeg(az);
          expect(wrapped).toBeGreaterThanOrEqual(0);
          expect(wrapped).toBeLessThan(360);
        },
      ),
    );
  });

  it('wrapAzimuthDeg is periodic with period 360 degrees', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e4, max: 1e4, noNaN: true, noDefaultInfinity: true }),
        (az) => {
          const a = wrapAzimuthDeg(az);
          const b = wrapAzimuthDeg(az + 360);
          expect(Math.abs(a - b)).toBeLessThan(1e-6);
        },
      ),
    );
  });
});
