import { describe, expect, it } from 'vitest'
import {
  CROSSOVER_ORBITAL_RADIUS_METERS,
  EARTH_GM,
  EARTH_RADIUS_METERS,
  runGpsTimeDilationExperiment,
} from './gpsTimeDilationExperiment'

const ISS_ORBITAL_RADIUS_METERS = EARTH_RADIUS_METERS + 400_000
const GPS_ORBITAL_RADIUS_METERS = EARTH_RADIUS_METERS + 20_200_000

describe('runGpsTimeDilationExperiment', () => {
  it('computes orbital speed from sqrt(EARTH_GM / orbitalRadiusMeters)', () => {
    for (const radius of [7e6, 1e7, 2.6571e7, 4.2164e7]) {
      const result = runGpsTimeDilationExperiment(radius)
      expect(result.orbitalSpeedMetersPerSecond).toBeCloseTo(Math.sqrt(EARTH_GM / radius), 6)
    }
  })

  it('orbital speed strictly decreases as orbital radius increases', () => {
    const radii = [7e6, 1e7, 1.5e7, 2.6571e7, 4.2164e7]
    const speeds = radii.map((r) => runGpsTimeDilationExperiment(r).orbitalSpeedMetersPerSecond)
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeLessThan(speeds[i - 1])
    }
  })

  it('speed effect is always negative, and its magnitude strictly decreases as radius increases', () => {
    const radii = [7e6, 1e7, 1.5e7, 2.6571e7, 4.2164e7]
    const magnitudes = radii.map((r) => {
      const result = runGpsTimeDilationExperiment(r)
      expect(result.speedEffectFraction).toBeLessThan(0)
      return Math.abs(result.speedEffectFraction)
    })
    for (let i = 1; i < magnitudes.length; i++) {
      expect(magnitudes[i]).toBeLessThan(magnitudes[i - 1])
    }
  })

  it('gravity effect is always positive, and strictly increases as radius increases', () => {
    const radii = [7e6, 1e7, 1.5e7, 2.6571e7, 4.2164e7]
    const values = radii.map((r) => {
      const result = runGpsTimeDilationExperiment(r)
      expect(result.gravityEffectFraction).toBeGreaterThan(0)
      return result.gravityEffectFraction
    })
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('net effect is approximately zero at the crossover orbital radius', () => {
    const result = runGpsTimeDilationExperiment(CROSSOVER_ORBITAL_RADIUS_METERS)
    expect(result.netEffectFraction).toBeCloseTo(0, 9)
  })

  it('crossover orbital radius equals 1.5 * EARTH_RADIUS_METERS exactly', () => {
    expect(CROSSOVER_ORBITAL_RADIUS_METERS).toBe(1.5 * EARTH_RADIUS_METERS)
  })

  it('net effect is negative at the ISS\'s real altitude and positive at GPS altitude', () => {
    const iss = runGpsTimeDilationExperiment(ISS_ORBITAL_RADIUS_METERS)
    const gps = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    expect(iss.netEffectFraction).toBeLessThan(0)
    expect(gps.netEffectFraction).toBeGreaterThan(0)
  })

  it('matches the real, published GPS correction of approximately +38 microseconds/day', () => {
    const gps = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    expect(gps.netMicrosecondsPerDay).toBeCloseTo(38.5, 0)
    expect(gps.speedEffectFraction * 86400 * 1_000_000).toBeCloseTo(-7.2, 0)
    expect(gps.gravityEffectFraction * 86400 * 1_000_000).toBeCloseTo(45.7, 0)
  })

  it('rejects an orbital radius at or below Earth\'s radius', () => {
    expect(() => runGpsTimeDilationExperiment(EARTH_RADIUS_METERS)).toThrow(RangeError)
    expect(() => runGpsTimeDilationExperiment(EARTH_RADIUS_METERS - 1)).toThrow(RangeError)
  })

  it('is deterministic across repeated calls for the same input', () => {
    const a = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    const b = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    expect(a).toEqual(b)
  })
})
