import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  ASTRONOMICAL_UNIT,
  closestApproachDistance,
  closestApproachTerms,
  earthMatchDistance,
  earthTerms,
  EARTH,
  effectsAnswer,
  effectsOf,
  farOrbitDistance,
  gapSeconds,
  lagMillisecondsPerDay,
  lagOverOneOrbitSeconds,
  orbitAverageTerms,
  orbitSpeed,
  orbitTerms,
  PARKER,
  runFastestSpacecraft,
  SECONDS_PER_DAY,
  semiMajorAxis,
  speedAt,
  sizeAnswer,
  SPEED_OF_LIGHT,
  SUN,
  timeScale,
} from './fastestSpacecraft'

// Tests for Frontier and Beyond Experiment 11 (docs/experiments/frontier-and-beyond/11-the-fastest-spacecraft.md, "Required Physics Tests").
// The expected values are worked out by hand from the constants, so a wrong formula in the module cannot make a test pass. With c = 299,792,458 m/s,
// c^2 = 8.98755e16 m^2/s^2. At closest approach the distance from the Sun's centre is 6.16759e9 + 6.957e8 = 6.86329e9 m. Gravity: GM / (r c^2) = 1.32712e20 /
// (6.86329e9 x 8.98755e16) = 1.32712e20 / 6.16850e26 = 2.1515e-7. Speed: 192,220^2 / (2 x 8.98755e16) = 3.69485e10 / 1.79751e17 = 2.0555e-7. The total is 4.2070e-7,
// and over a day (86,400 s) the clock loses 4.2070e-7 x 86,400 = 0.036349 s = 36.35 ms. The Earth's equator clock: 6.9655e-10 (Experiment 10) + the Sun at 1 AU,
// 1.32712e20 / (1.495979e11 x 8.98755e16) = 9.8706e-9, + the Earth's orbital speed 29,780^2 / (2 x 8.98755e16) = 4.9338e-9: total 1.5501e-8. The probe against the Earth:
// (4.2070e-7 - 1.5501e-8) x 86,400 = 4.0520e-7 x 86,400 = 35.01 ms. The ellipse: a^3 = GM T^2 / (4 pi^2) with T = 88 x 86,400 = 7.6032e6 s gives a = 5.7923e10 m, so
// the far end is 2a - r = 1.15846e11 - 6.86329e9 = 1.08983e11 m = 0.7285 AU, and the speed at closest approach is sqrt(GM (2 / r - 1 / a)) = 190.74 km/s.

const rel = (value: number, reference: number) => Math.abs(value - reference) / Math.abs(reference)

describe('the probe at closest approach (test 1)', () => {
  it('has gravity 2.1515e-7, speed 2.0555e-7 and total 4.2070e-7', () => {
    const t = closestApproachTerms()
    expect(rel(t.gravity, 2.1515e-7)).toBeLessThan(1e-4)
    expect(rel(t.speed, 2.0555e-7)).toBeLessThan(1e-4)
    expect(rel(t.total, 4.2070e-7)).toBeLessThan(1e-4)
  })
  it('is at 6,863,290 km from the Sun\'s centre', () => {
    expect(rel(closestApproachDistance(), 6.86329e9)).toBeLessThan(1e-9)
  })
  it('has terms that add to the total', () => {
    const t = closestApproachTerms()
    expect(t.total).toBeCloseTo(t.gravity + t.speed, 20)
  })
})

describe('the lag against a clock far from everything and against the Earth (tests 2 and 3)', () => {
  it('is 36.35 ms a day against a clock far from everything', () => {
    const farClock = { gravity: 0, speed: 0, total: 0 }
    expect(rel(lagMillisecondsPerDay(farClock, closestApproachTerms()), 36.35)).toBeLessThan(1e-3)
  })
  it('has the Earth\'s clock lowered by 1.5501e-8', () => {
    expect(rel(earthTerms().total, 1.5501e-8)).toBeLessThan(1e-3)
  })
  it('is 35.01 ms a day against the Earth\'s clock, and the gap after a day matches', () => {
    const lag = lagMillisecondsPerDay(earthTerms(), closestApproachTerms())
    expect(rel(lag, 35.01)).toBeLessThan(1e-3)
    expect(rel(gapSeconds(earthTerms(), closestApproachTerms(), SECONDS_PER_DAY), 35.01e-3)).toBeLessThan(1e-3)
  })
  it('is proportional to the time', () => {
    expect(gapSeconds(earthTerms(), closestApproachTerms(), 2 * SECONDS_PER_DAY)).toBeCloseTo(
      2 * gapSeconds(earthTerms(), closestApproachTerms(), SECONDS_PER_DAY),
      12,
    )
  })
})

describe('both effects slow the clock (test 4)', () => {
  it('has a positive gravity term and a positive speed term, so both slow it', () => {
    const t = closestApproachTerms()
    expect(t.gravity).toBeGreaterThan(0)
    expect(t.speed).toBeGreaterThan(0)
    expect(effectsOf(t)).toBe('both slow')
  })
  it('names the other two cases for the other signs', () => {
    expect(effectsOf({ gravity: -1, speed: -1, total: -2 })).toBe('both speed up')
    expect(effectsOf({ gravity: -1, speed: 0.5, total: -0.5 })).toBe('work against each other')
    expect(effectsOf({ gravity: 1, speed: -0.5, total: 0.5 })).toBe('work against each other')
  })
  it('has the two terms within 5 percent of each other', () => {
    const t = closestApproachTerms()
    expect(rel(t.gravity, t.speed)).toBeLessThan(0.05)
  })
})

describe('the orbit (tests 5, 6 and 7)', () => {
  it('has a semi-major axis of 5.7923e10 m and a far end of 0.7285 AU', () => {
    expect(rel(semiMajorAxis(), 5.7923e10)).toBeLessThan(1e-4)
    expect(rel(farOrbitDistance() / ASTRONOMICAL_UNIT, 0.7285)).toBeLessThan(1e-3)
  })
  it('has a speed of 190.74 km/s at the closest point, within 1 percent of NASA\'s 192.22', () => {
    const v = orbitSpeed(closestApproachDistance())
    expect(rel(v, 1.9074e5)).toBeLessThan(1e-3)
    expect(rel(v, PARKER.closestApproachSpeed)).toBeLessThan(0.01)
  })
  it('has both terms falling steadily from the closest point to the far end', () => {
    const near = closestApproachDistance()
    const far = farOrbitDistance()
    let previous = orbitTerms(near)
    for (let i = 1; i <= 20; i += 1) {
      const t = orbitTerms(near + ((far - near) * i) / 20)
      expect(t.gravity).toBeLessThan(previous.gravity)
      expect(t.speed).toBeLessThan(previous.speed)
      previous = t
    }
  })
  it('has far-end terms much smaller than the closest-approach terms', () => {
    const far = orbitTerms(farOrbitDistance())
    expect(far.total).toBeLessThan(closestApproachTerms().total / 5)
    expect(far.speed).toBeLessThan(closestApproachTerms().speed)
  })
  it('has the time-average of the two terms 1.5 GM / (a c^2), matching a numerical average over the ellipse', () => {
    const avg = orbitAverageTerms()
    expect(rel(avg.total, 3.824e-8)).toBeLessThan(1e-3)
    // Numerical check: time runs as dt proportional to (1 - e cos E) dE, with r = a (1 - e cos E).
    const a = semiMajorAxis()
    const e = 1 - closestApproachDistance() / a
    const n = 20000
    let sum = 0
    for (let i = 0; i < n; i += 1) {
      const E = ((i + 0.5) / n) * 2 * Math.PI
      const r = a * (1 - e * Math.cos(E))
      sum += orbitTerms(Math.min(Math.max(r, closestApproachDistance()), farOrbitDistance())).total * (1 - e * Math.cos(E))
    }
    expect(rel(sum / n, avg.total)).toBeLessThan(1e-4)
  })
  it('lags 0.173 s behind the Earth\'s clock over one orbit, far less than the 3.08 s of one closest-approach rate', () => {
    expect(rel(lagOverOneOrbitSeconds(), 0.1729)).toBeLessThan(5e-3)
    const atClosest = gapSeconds(earthTerms(), closestApproachTerms(), PARKER.periodDays * SECONDS_PER_DAY)
    expect(rel(atClosest, 3.081)).toBeLessThan(1e-3)
    expect(lagOverOneOrbitSeconds()).toBeLessThan(atClosest / 10)
  })
})

describe('the distance at which the probe\'s clock matches the Earth\'s (test 12)', () => {
  it('is 0.699 AU, where the lag against the Earth\'s clock is zero', () => {
    const d = earthMatchDistance()
    expect(rel(d / ASTRONOMICAL_UNIT, 0.6989)).toBeLessThan(1e-3)
    expect(Math.abs(lagMillisecondsPerDay(earthTerms(), orbitTerms(d)))).toBeLessThan(1e-9)
  })
  it('has the probe\'s clock the slower one closer in and the faster one farther out', () => {
    const d = earthMatchDistance()
    expect(lagMillisecondsPerDay(earthTerms(), orbitTerms(d * 0.9))).toBeGreaterThan(0)
    expect(lagMillisecondsPerDay(earthTerms(), orbitTerms(d * 1.02))).toBeLessThan(0)
    expect(rel(lagMillisecondsPerDay(earthTerms(), orbitTerms(farOrbitDistance())), -0.0993)).toBeLessThan(2e-2)
  })
})

describe('the speed to display (test 13)', () => {
  it('is NASA\'s 192.22 km/s at the closest point and the oval\'s speed elsewhere', () => {
    expect(speedAt(closestApproachDistance())).toBe(PARKER.closestApproachSpeed)
    expect(rel(speedAt(closestApproachDistance() * 1.0001), 1.9073e5)).toBeLessThan(2e-3)
    expect(rel(speedAt(farOrbitDistance()), 1.2012e4)).toBeLessThan(2e-3)
  })
  it('agrees with the speed term of the same point', () => {
    for (const au of [0.1, 0.3, 0.6]) {
      const d = au * ASTRONOMICAL_UNIT
      const fromTerm = Math.sqrt(2 * orbitTerms(d).speed) * SPEED_OF_LIGHT
      expect(rel(speedAt(d), fromTerm)).toBeLessThan(1e-9)
    }
    expect(rel(Math.sqrt(2 * closestApproachTerms().speed) * SPEED_OF_LIGHT, speedAt(closestApproachDistance()))).toBeLessThan(1e-9)
  })
  it('throws outside the orbit', () => {
    expect(() => speedAt(closestApproachDistance() - 1)).toThrow(RangeError)
  })
})

describe('the published data (test 8)', () => {
  it('equals the module\'s constants (catches a typing error)', () => {
    expect(SPEED_OF_LIGHT).toBe(299_792_458)
    expect(SUN.gm).toBe(1.32712440018e20)
    expect(SUN.radius).toBe(6.957e8)
    expect(EARTH.gm).toBe(3.986004418e14)
    expect(EARTH.equatorialRadius).toBe(6.378137e6)
    expect(EARTH.rotation).toBe(7.2921159e-5)
    expect(EARTH.orbitalSpeed).toBe(2.978e4)
    expect(ASTRONOMICAL_UNIT).toBe(1.495978707e11)
    expect(PARKER.closestApproachAltitude).toBe(6.16759e9)
    expect(PARKER.closestApproachSpeed).toBe(1.9222e5)
    expect(PARKER.periodDays).toBe(88)
    expect(PARKER.source).toMatch(/Guinness/)
  })
})

describe('out-of-range input (test 9)', () => {
  it('throws a RangeError', () => {
    expect(() => orbitTerms(closestApproachDistance() - 1)).toThrow(RangeError)
    expect(() => orbitTerms(farOrbitDistance() + 1)).toThrow(RangeError)
    expect(() => orbitTerms(Number.NaN)).toThrow(RangeError)
    expect(() => gapSeconds(earthTerms(), closestApproachTerms(), -1)).toThrow(RangeError)
    expect(() => timeScale(0)).toThrow(RangeError)
    expect(() => effectsOf({ gravity: Number.NaN, speed: 1, total: Number.NaN })).toThrow(RangeError)
    expect(() => runFastestSpacecraft(closestApproachDistance(), -1)).toThrow(RangeError)
    expect(() => runFastestSpacecraft(1, 1)).toThrow(RangeError)
  })
})

describe('the module stands alone (test 10)', () => {
  it('imports nothing from the other experiments\' physics modules', () => {
    const source = readFileSync(new URL('./fastestSpacecraft.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/^import /m)
  })
})

describe('the predictions\' answers and the run (test 11)', () => {
  it('has Prediction 1\'s answer "both slow" and Prediction 2\'s answer "millisecond"', () => {
    expect(effectsAnswer()).toBe('both slow')
    expect(sizeAnswer()).toBe('millisecond')
  })
  it('has timeScale as the unit in which the number is at least 1', () => {
    expect(timeScale(35e-6)).toBe('microsecond')
    expect(timeScale(35e-3)).toBe('millisecond')
    expect(timeScale(35)).toBe('second')
    expect(timeScale(1)).toBe('second')
    expect(timeScale(1e-3)).toBe('millisecond')
  })
  it('collects the terms, the lag, the gap and the effects for a point on the orbit', () => {
    const closest = runFastestSpacecraft(closestApproachDistance(), SECONDS_PER_DAY)
    expect(rel(closest.lagMillisecondsPerDay, 35.01)).toBeLessThan(1e-3)
    expect(rel(closest.gapSeconds, 35.01e-3)).toBeLessThan(1e-3)
    expect(closest.effects).toBe('both slow')
    const far = runFastestSpacecraft(farOrbitDistance(), SECONDS_PER_DAY)
    expect(far.lagMillisecondsPerDay).toBeLessThan(closest.lagMillisecondsPerDay)
    expect(far.terms.total).toBeCloseTo(orbitTerms(farOrbitDistance()).total, 20)
  })
  it('has the same orbit average as the average computed from the orbit\'s own numbers', () => {
    expect(orbitAverageTerms().gravity).toBeGreaterThan(0)
    expect(orbitAverageTerms().speed).toBeCloseTo(orbitAverageTerms().gravity / 2, 20)
  })
})
