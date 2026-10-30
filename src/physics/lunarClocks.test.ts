import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  DAYS_PER_MONTH,
  DAYS_PER_YEAR,
  directionAnswer,
  directionOf,
  earthEquatorTerms,
  earthOrbitTerms,
  EARTH,
  GEOSTATIONARY_RADIUS_M,
  gainMicrosecondsPerDay,
  gapSeconds,
  GPS_ALTITUDE_M,
  moonOrbitCrossoverAltitude,
  moonOrbitTerms,
  MOON,
  moonSurfaceTerms,
  NIST_2024,
  runLunarClocks,
  SECONDS_PER_DAY,
  sizeAnswer,
  SPEED_OF_LIGHT,
  timeScale,
} from './lunarClocks'

// Tests for Cosmic Horizons Experiment 10 (docs/experiments/frontier-and-beyond/10-does-time-tick-faster-on-the-moon.md, "Required Physics Tests").
// The expected values are worked out by hand from the constants, so a wrong formula in the module cannot make a test pass. With c = 299,792,458 m/s,
// c^2 = 8.98755e16 m^2/s^2. The Earth's equator: gravity GM / (R c^2) = 3.986004e14 / (6.378137e6 x 8.98755e16) = 3.986004e14 / 5.73229e23 = 6.9535e-10; the spin
// speed is 7.2921159e-5 x 6.378137e6 = 465.10 m/s, so the spin term is 465.10^2 / (2 x 8.98755e16) = 216,318 / 1.79751e17 = 1.2034e-12; the total is 6.9655e-10. The
// Moon's surface: gravity 4.9028e12 / (1.7374e6 x 8.98755e16) = 4.9028e12 / 1.56155e23 = 3.1398e-11; the Earth's pull 3.986004e14 / (3.844e8 x 8.98755e16) =
// 3.986004e14 / 3.45483e25 = 1.1538e-11; the orbital speed 1022^2 / (2 x 8.98755e16) = 1,044,484 / 1.79751e17 = 5.8107e-12 (the spin adds 1.2e-16); the total is
// 4.8746e-11. The gain is (6.9655e-10 - 4.8746e-11) x 86,400 s = 6.4780e-10 x 86,400 = 55.97e-6 s. Orbits: for the International Space Station (r = 6.778137e6 m)
// the lowering is 1.5 x GM / (r c^2) = 1.5 x 6.5431e-10 = 9.8147e-10, so the gain is (6.9655e-10 - 9.8147e-10) x 86,400 = -24.62 microseconds a day.

const rel = (value: number, reference: number) => Math.abs(value - reference) / Math.abs(reference)

describe('the Earth\'s equator clock (test 1)', () => {
  it('has gravity 6.9535e-10, spin 1.2034e-12 and total 6.9655e-10', () => {
    const t = earthEquatorTerms()
    expect(rel(t.gravityOwn, 6.9535e-10)).toBeLessThan(1e-4)
    expect(rel(t.speed, 1.2034e-12)).toBeLessThan(1e-3)
    expect(rel(t.total, 6.9655e-10)).toBeLessThan(1e-4)
    expect(t.gravityOther).toBe(0)
  })
  it('has terms that add to the total', () => {
    const t = earthEquatorTerms()
    expect(t.total).toBeCloseTo(t.gravityOwn + t.gravityOther + t.speed, 20)
  })
})

describe('the Moon\'s surface clock (test 2)', () => {
  it('has the Moon\'s gravity 3.1398e-11, the Earth\'s pull 1.1538e-11, speed 5.8108e-12 and total 4.8746e-11', () => {
    const t = moonSurfaceTerms()
    expect(rel(t.gravityOwn, 3.1398e-11)).toBeLessThan(1e-4)
    expect(rel(t.gravityOther, 1.1538e-11)).toBeLessThan(1e-4)
    expect(rel(t.speed, 5.8108e-12)).toBeLessThan(1e-3)
    expect(rel(t.total, 4.8746e-11)).toBeLessThan(1e-4)
  })
  it('has the Moon\'s own gravity as its largest term and the speed as its smallest', () => {
    const t = moonSurfaceTerms()
    expect(t.gravityOwn).toBeGreaterThan(t.gravityOther)
    expect(t.gravityOther).toBeGreaterThan(t.speed)
  })
})

describe('the gain of the Moon\'s clock (test 3)', () => {
  const gain = gainMicrosecondsPerDay(earthEquatorTerms(), moonSurfaceTerms())
  it('is 55.97 microseconds a day, and positive', () => {
    expect(rel(gain, 55.97)).toBeLessThan(1e-3)
    expect(gain).toBeGreaterThan(0)
  })
  it('is within 0.2 percent of NIST\'s 56.02', () => {
    expect(rel(gain, NIST_2024.gainMicrosecondsPerDay)).toBeLessThan(0.002)
  })
  it('is zero for a clock against itself and changes sign when the two are swapped', () => {
    expect(gainMicrosecondsPerDay(earthEquatorTerms(), earthEquatorTerms())).toBe(0)
    expect(gainMicrosecondsPerDay(moonSurfaceTerms(), earthEquatorTerms())).toBeCloseTo(-gain, 9)
  })
})

describe('other places on the Earth\'s side (test 4)', () => {
  it('the International Space Station loses 24.62 microseconds a day', () => {
    expect(rel(gainMicrosecondsPerDay(earthEquatorTerms(), earthOrbitTerms(4.0e5)), -24.62)).toBeLessThan(1e-3)
  })
  it('a GPS clock gains 38.56, which agrees with Gravity Experiment 9\'s 38', () => {
    const gps = gainMicrosecondsPerDay(earthEquatorTerms(), earthOrbitTerms(GPS_ALTITUDE_M))
    expect(rel(gps, 38.56)).toBeLessThan(1e-3)
    expect(Math.abs(gps - 38)).toBeLessThan(1)
  })
  it('a geostationary clock gains 46.55', () => {
    expect(rel(gainMicrosecondsPerDay(earthEquatorTerms(), earthOrbitTerms(GEOSTATIONARY_RADIUS_M - EARTH.equatorialRadius)), 46.55)).toBeLessThan(1e-3)
  })
})

describe('a clock orbiting the Moon, against the Moon\'s surface (test 5)', () => {
  const againstSurface = (altitude: number) => gainMicrosecondsPerDay(moonSurfaceTerms(), moonOrbitTerms(altitude))
  it('loses 1.135 microseconds a day at 100 km and 0.757 at 300 km', () => {
    expect(rel(againstSurface(1e5), -1.135)).toBeLessThan(2e-3)
    expect(rel(againstSurface(3e5), -0.757)).toBeLessThan(2e-3)
  })
  it('matches the surface clock at half a Moon radius (868.7 km) and gains above it', () => {
    expect(moonOrbitCrossoverAltitude()).toBeCloseTo(0.5 * MOON.radius, 6)
    // Exact when the Moon's spin is ignored; the spin term (1.2e-16, in the surface clock only) leaves about 1e-5 microseconds a day.
    expect(Math.abs(againstSurface(moonOrbitCrossoverAltitude()))).toBeLessThan(1e-4)
    expect(Math.abs(againstSurface(moonOrbitCrossoverAltitude()))).toBeLessThan(Math.abs(againstSurface(1e5)) / 1000)
    expect(rel(againstSurface(1e6), 0.130)).toBeLessThan(1e-2)
    expect(againstSurface(1e7)).toBeGreaterThan(2)
  })
})

describe('the gap over a time (test 6)', () => {
  it('is 55.97 microseconds over a day, 1.703 milliseconds over a month and 20.44 milliseconds over a year', () => {
    const e = earthEquatorTerms()
    const m = moonSurfaceTerms()
    expect(rel(gapSeconds(e, m, SECONDS_PER_DAY), 55.97e-6)).toBeLessThan(1e-3)
    expect(rel(gapSeconds(e, m, SECONDS_PER_DAY * DAYS_PER_MONTH), 1.7036e-3)).toBeLessThan(1e-3)
    expect(rel(gapSeconds(e, m, SECONDS_PER_DAY * DAYS_PER_YEAR), 20.443e-3)).toBeLessThan(1e-3)
  })
  it('is proportional to the time', () => {
    const e = earthEquatorTerms()
    const m = moonSurfaceTerms()
    expect(rel(gapSeconds(e, m, 3000), 3 * gapSeconds(e, m, 1000))).toBeLessThan(1e-12)
    expect(gapSeconds(e, m, 0)).toBe(0)
  })
})

describe('the predictions\' answers (test 7)', () => {
  it('the Moon\'s clock is faster and the Space Station\'s is slower', () => {
    expect(directionOf(gainMicrosecondsPerDay(earthEquatorTerms(), moonSurfaceTerms()))).toBe('faster')
    expect(directionOf(gainMicrosecondsPerDay(earthEquatorTerms(), earthOrbitTerms(4.0e5)))).toBe('slower')
    expect(directionOf(0)).toBe('same')
    expect(directionAnswer()).toBe('faster')
  })
  it('the gap after a day is a microsecond-sized number', () => {
    expect(sizeAnswer()).toBe('microsecond')
    // The unit is the one in which the number is at least 1: 56 microseconds is "about 56 microseconds", and not "about 0.06 milliseconds".
    expect(timeScale(5.6e-8)).toBe('nanosecond')
    expect(timeScale(2e-2)).toBe('millisecond')
    expect(timeScale(5.597e-5)).toBe('microsecond')
    expect(timeScale(2e-7)).toBe('nanosecond') // 200 nanoseconds, not 0.2 microseconds
    expect(timeScale(1e-6)).toBe('microsecond')
    expect(timeScale(1e-3)).toBe('millisecond')
  })
})

describe('the published data (test 8)', () => {
  it('equal the module\'s constants', () => {
    expect(SPEED_OF_LIGHT).toBe(299_792_458)
    expect(EARTH.gm).toBe(3.986004418e14)
    expect(EARTH.equatorialRadius).toBe(6.378137e6)
    expect(EARTH.rotation).toBe(7.2921159e-5)
    expect(MOON.gm).toBe(4.9028e12)
    expect(MOON.radius).toBe(1.7374e6)
    expect(MOON.meanDistance).toBe(3.844e8)
    expect(MOON.orbitalSpeed).toBe(1.022e3)
    expect(NIST_2024.gainMicrosecondsPerDay).toBe(56.02)
    expect(NIST_2024.source).toContain('Ashby and Patla')
    expect(DAYS_PER_YEAR).toBe(365.25)
  })
  it('the Moon\'s own-gravity term is the 2.71 microseconds a day that the "Lunar Time" paper gives against unscaled lunar time', () => {
    expect(rel(moonSurfaceTerms().gravityOwn * SECONDS_PER_DAY * 1e6, 2.713)).toBeLessThan(1e-3)
  })
})

describe('the learner\'s own place', () => {
  it('collects the numbers for each place', () => {
    const moon = runLunarClocks('moonSurface', 0, SECONDS_PER_DAY)
    expect(rel(moon.gainMicrosecondsPerDay, 55.97)).toBeLessThan(1e-3)
    expect(rel(moon.gapSeconds, 55.97e-6)).toBeLessThan(1e-3)
    expect(moon.direction).toBe('faster')
    expect(runLunarClocks('earthEquator', 0, 100).gainMicrosecondsPerDay).toBe(0)
    expect(runLunarClocks('earthOrbit', 4.0e5, 1).direction).toBe('slower')
    expect(rel(runLunarClocks('gps', 0, 1).gainMicrosecondsPerDay, 38.56)).toBeLessThan(1e-3)
    expect(rel(runLunarClocks('geostationary', 0, 1).gainMicrosecondsPerDay, 46.55)).toBeLessThan(1e-3)
    expect(rel(runLunarClocks('moonOrbit', 1e5, 1).gainMicrosecondsPerDay, 54.84)).toBeLessThan(1e-3)
  })
})

describe('out-of-range input (test 9)', () => {
  it('throws a RangeError', () => {
    expect(() => earthOrbitTerms(-1)).toThrow(RangeError)
    expect(() => moonOrbitTerms(-1)).toThrow(RangeError)
    expect(() => earthOrbitTerms(Number.NaN)).toThrow(RangeError)
    expect(() => gapSeconds(earthEquatorTerms(), moonSurfaceTerms(), -1)).toThrow(RangeError)
    expect(() => directionOf(Number.NaN)).toThrow(RangeError)
    expect(() => timeScale(0)).toThrow(RangeError)
    expect(() => runLunarClocks('moonOrbit', -5, 1)).toThrow(RangeError)
    expect(() => runLunarClocks('gps', 0, -1)).toThrow(RangeError)
  })
})

describe('the module stands alone (test 10)', () => {
  it('imports nothing from the other experiments\' physics modules', () => {
    const source = readFileSync(new URL('./lunarClocks.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^import /m)
  })
})
