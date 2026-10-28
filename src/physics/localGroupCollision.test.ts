import { describe, it, expect } from 'vitest'
import {
  G_KPC,
  KPC_PER_GYR_PER_KM_S,
  M31_DISTANCE_MODULUS,
  distanceKpc,
  APPROACH_SPEED_KM_S,
  HALO_MASS_MILKY_WAY,
  HALO_MASS_M31,
  TOTAL_MASS,
  SIDEWAYS_SPEED_2025_KM_S,
  SIDEWAYS_SPEED_2026_KM_S,
  SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S,
  MERGER_DISTANCE_KPC,
  PUBLISHED_2025,
  PUBLISHED_2026,
  orbit,
  straightFallGyr,
  constantSpeedGyr,
  unboundSidewaysKmS,
  sidewaysForFirstPass,
  nearestOnLogScale,
  FALL_CHOICES,
  fallAnswer,
  fallGuessResult,
  fallGuessMarker,
  PASS_CHOICES,
  passAnswer,
  passGuessResult,
  passGuessMarker,
  TRIAL_SIDEWAYS_KM_S,
  TRIAL_MASSES_SOLAR,
  sidewaysRange2026,
  APPROACH_SPEED_ALTERNATIVE_KM_S,
  MONTE_CARLO_TRIALS_2025,
} from './localGroupCollision'

// Constants written out again here, separately from the module (SI units): the Sun's GM, the kiloparsec and the Gyr.
const GM_SUN_SI = 1.32712440018e20 // m^3/s^2
const KPC_M = 3.0856775814913673e19
const GYR_S = 1e9 * 365.25 * 86400

// An independent check of the orbit: step the two-body motion directly (leapfrog, in kpc and Gyr) and read off the closest distance and the time to it.
function integrate(massSolar: number, sidewaysKmS: number, maxGyr = 12, dt = 0.0002) {
  const mu = (GM_SUN_SI / KPC_M / 1e6) * massSolar // kpc (km/s)^2
  const k = (1e3 * GYR_S) / KPC_M // kpc per Gyr per km/s
  const muG = mu * k * k // kpc^3 / Gyr^2
  let x = (10 ** ((M31_DISTANCE_MODULUS + 5) / 5)) / 1e3
  let y = 0
  let vx = -APPROACH_SPEED_KM_S * k
  let vy = sidewaysKmS * k
  const acc = (px: number, py: number) => {
    const r = Math.hypot(px, py)
    return [(-muG * px) / r ** 3, (-muG * py) / r ** 3]
  }
  let [ax, ay] = acc(x, y)
  let best = Math.hypot(x, y)
  let bestT = 0
  for (let t = 0; t < maxGyr; t += dt) {
    vx += (ax * dt) / 2
    vy += (ay * dt) / 2
    x += vx * dt
    y += vy * dt
    ;[ax, ay] = acc(x, y)
    vx += (ax * dt) / 2
    vy += (ay * dt) / 2
    const r = Math.hypot(x, y)
    if (r < best) {
      best = r
      bestT = t + dt
    } else if (r > best * 1.5 && t > bestT + 0.5) break
  }
  return { passKpc: best, passGyr: bestT }
}

describe('the published numbers and the constants', () => {
  it('holds the studies\' numbers as listed (test 8)', () => {
    expect(APPROACH_SPEED_KM_S).toBe(109)
    expect(HALO_MASS_MILKY_WAY).toBe(1.0e12)
    expect(HALO_MASS_M31).toBe(1.3e12)
    expect(TOTAL_MASS).toBeCloseTo(2.3e12, 0)
    expect(SIDEWAYS_SPEED_2025_KM_S).toBe(76)
    expect(SIDEWAYS_SPEED_2026_KM_S).toBe(46.7)
    expect(SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S).toBe(24)
    expect(MERGER_DISTANCE_KPC).toBe(20)
    expect(M31_DISTANCE_MODULUS).toBe(24.407)
    expect(PUBLISHED_2025.mergerPercentWithin10Gyr).toBe(50)
    expect(PUBLISHED_2025.twoBodyPercent).toBe(44)
    expect(PUBLISHED_2026.mergerPercent).toBe(90)
    expect(PUBLISHED_2026.medianMergerTimeGyr).toBe(6.5)
  })
  it('G in kpc (km/s)^2 per Sun is 4.30e-6, from the Sun\'s GM, and a km/s is 1.0227 kpc per Gyr', () => {
    expect(G_KPC).toBeCloseTo(GM_SUN_SI / KPC_M / 1e6, 14)
    expect(G_KPC).toBeCloseTo(4.30089e-6, 10)
    expect(KPC_PER_GYR_PER_KM_S).toBeCloseTo(1.02271, 4)
  })
  it('a distance modulus of 24.407 is 761 kpc (test 9)', () => {
    expect(distanceKpc()).toBeCloseTo(761.03, 1)
    expect(Math.abs(distanceKpc() - 761)).toBeLessThan(1)
    expect(distanceKpc(25)).toBeCloseTo(1000, 3)
  })
})

describe('the values the introduction quotes', () => {
  it('the 2026 give-or-take range is 22.7 to 70.7 km/s, the alternative approach speed is 114 and the 2025 study used 100,000 trials', () => {
    expect(sidewaysRange2026().low).toBeCloseTo(22.7, 10)
    expect(sidewaysRange2026().high).toBeCloseTo(70.7, 10)
    expect(APPROACH_SPEED_ALTERNATIVE_KM_S).toBe(114)
    expect(APPROACH_SPEED_ALTERNATIVE_KM_S).toBeGreaterThan(APPROACH_SPEED_KM_S)
    expect(MONTE_CARLO_TRIALS_2025).toBe(100000)
  })
})

describe('the straight fall (tests 1 and 6)', () => {
  it('takes 3.81 billion years, worked separately by stepping the motion, and the constant-speed time is 6.83 and longer', () => {
    expect(straightFallGyr()).toBeCloseTo(3.81, 2)
    // Stepping a tiny sideways speed (0.01 km/s) reproduces the radial fall to the time of the closest pass.
    const stepped = integrate(TOTAL_MASS, 0.01)
    expect(Math.abs(stepped.passGyr - straightFallGyr())).toBeLessThan(0.02)
    expect(constantSpeedGyr()).toBeCloseTo(6.83, 2)
    expect(constantSpeedGyr()).toBeGreaterThan(straightFallGyr())
  })
  it('a heavier pair falls faster: 1.8, 2.3 and 2.8 times 10^12 Suns give 4.05, 3.81 and 3.62 billion years', () => {
    expect(straightFallGyr(1.8e12)).toBeCloseTo(4.05, 2)
    expect(straightFallGyr(2.3e12)).toBeCloseTo(3.81, 2)
    expect(straightFallGyr(2.8e12)).toBeCloseTo(3.62, 2)
  })
})

describe('the first pass (tests 2, 3, 4 and 6)', () => {
  it('for 46.7 km/s the first pass is 66.5 kpc after 4.20 billion years, and the stepped motion agrees', () => {
    const o = orbit(TOTAL_MASS, 46.7)
    expect(o.firstPassKpc).toBeCloseTo(66.5, 0)
    expect(o.firstPassGyr as number).toBeCloseTo(4.2, 1)
    const s = integrate(TOTAL_MASS, 46.7)
    expect(Math.abs(s.passKpc - o.firstPassKpc)).toBeLessThan(0.5)
    expect(Math.abs(s.passGyr - (o.firstPassGyr as number))).toBeLessThan(0.02)
  })
  it('gives 183 kpc after 4.66 billion years for 76 km/s, and 15.2 and 157.8 kpc for 22.7 and 70.7 km/s', () => {
    const a = orbit(TOTAL_MASS, 76)
    expect(a.firstPassKpc).toBeCloseTo(183.2, 0)
    expect(a.firstPassGyr as number).toBeCloseTo(4.66, 1)
    expect(orbit(TOTAL_MASS, 22.7).firstPassKpc).toBeCloseTo(15.2, 0)
    expect(orbit(TOTAL_MASS, 70.7).firstPassKpc).toBeCloseTo(157.8, 0)
    for (const v of [22.7, 70.7, 76]) {
      const s = integrate(TOTAL_MASS, v)
      expect(Math.abs(s.passKpc - orbit(TOTAL_MASS, v).firstPassKpc) / orbit(TOTAL_MASS, v).firstPassKpc).toBeLessThan(0.01)
    }
  })
  it('the sideways speed that gives a 20 kpc first pass is 26.0 km/s, and the first pass rises with the sideways speed', () => {
    expect(sidewaysForFirstPass(MERGER_DISTANCE_KPC)).toBeCloseTo(25.96, 1)
    expect(orbit(TOTAL_MASS, sidewaysForFirstPass(MERGER_DISTANCE_KPC)).firstPassKpc).toBeCloseTo(20, 4)
    let last = -1
    for (const v of [0, 5, 10, 23, 47, 76, 100, 118]) {
      const r = orbit(TOTAL_MASS, v).firstPassKpc
      expect(r).toBeGreaterThan(last)
      last = r
    }
  })
  it('the first pass is p / (1 + e), and a heavier pair passes closer: 84.5, 66.5 and 54.6 kpc at 46.7 km/s', () => {
    const o = orbit(TOTAL_MASS, 46.7)
    const mu = G_KPC * TOTAL_MASS
    const p = o.angularMomentum ** 2 / mu
    expect(o.firstPassKpc).toBeCloseTo(p / (1 + o.eccentricity), 10)
    expect(orbit(1.8e12, 46.7).firstPassKpc).toBeCloseTo(84.5, 0)
    expect(orbit(2.8e12, 46.7).firstPassKpc).toBeCloseTo(54.6, 0)
  })
  it('conserves the energy and the angular momentum (a round trip between two distances) and returns after the period', () => {
    const o = orbit(TOTAL_MASS, 46.7)
    const mu = G_KPC * TOTAL_MASS
    // At the closest and farthest points the speed is L / r, and the energy is the same as at the start.
    const rp = o.firstPassKpc
    const ra = o.farthestKpc as number
    const eAt = (r: number) => (o.angularMomentum / r) ** 2 / 2 - mu / r
    expect(eAt(rp)).toBeCloseTo(o.energy, 6)
    expect(eAt(ra)).toBeCloseTo(o.energy, 6)
    expect((rp + ra) / 2).toBeCloseTo(mu / (-2 * o.energy), 6) // the semi-major axis
    expect(o.periodGyr as number).toBeCloseTo(46.6, 0)
  })
})

describe('the unbound case (test 5)', () => {
  it('the pair is just unbound at 118.8 km/s sideways, and above that the module says it is not bound and gives no time', () => {
    expect(unboundSidewaysKmS()).toBeCloseTo(118.81, 1)
    expect(orbit(TOTAL_MASS, 118).bound).toBe(true)
    const o = orbit(TOTAL_MASS, 120)
    expect(o.bound).toBe(false)
    expect(o.firstPassGyr).toBeNull()
    expect(o.periodGyr).toBeNull()
    expect(o.eccentricity).toBeGreaterThan(1)
    expect(orbit(TOTAL_MASS, 100).bound).toBe(true)
  })
  it('rejects impossible inputs', () => {
    expect(() => orbit(0, 10)).toThrow(RangeError)
    expect(() => orbit(1e12, -1)).toThrow(RangeError)
    expect(() => orbit(1e12, 10, -5)).toThrow(RangeError)
    expect(() => orbit(1e12, 10, 100, 0)).toThrow(RangeError)
    expect(() => sidewaysForFirstPass(0)).toThrow(RangeError)
    expect(() => constantSpeedGyr(0)).toThrow(RangeError)
  })
})

describe('the predictions (tests 7 and 10)', () => {
  it('compares on a log scale, not a linear one', () => {
    const c = [{ v: 1 }, { v: 100 }]
    expect(nearestOnLogScale(c, 20, (x) => x.v).v).toBe(100) // a linear comparison would pick 1 (19 away against 80)
    expect(nearestOnLogScale(c, 5, (x) => x.v).v).toBe(1)
  })
  it('Prediction 1 has the answer "about 4 billion years" for a fall of 3.81, and "about 7" is the distance-over-speed guess', () => {
    expect(fallAnswer()).toBe('f4')
    expect(fallGuessResult('f4')).toBe('matched')
    for (const id of ['f1', 'f2', 'f7', 'f14'] as const) expect(fallGuessResult(id)).toBe('not matched')
    expect(nearestOnLogScale(FALL_CHOICES, constantSpeedGyr(), (c) => c.gyr).id).toBe('f7')
  })
  it('Prediction 2 has the answer "about 70 kiloparsecs" for a first pass of 66.5', () => {
    expect(passAnswer()).toBe('p70')
    expect(passGuessResult('p70')).toBe('matched')
    for (const id of ['p7', 'p20', 'p250', 'p900'] as const) expect(passGuessResult(id)).toBe('not matched')
  })
  it('the buttons are the ones in the specification and are balanced about each answer on a log scale', () => {
    expect(FALL_CHOICES.map((c) => c.gyr)).toEqual([1, 2, 4, 7, 14])
    expect(PASS_CHOICES.map((c) => c.kpc)).toEqual([7, 20, 70, 250, 900])
    const f = straightFallGyr()
    expect(Math.abs(Math.log(f / 2) - Math.log(7 / f))).toBeLessThan(0.1)
    const r = orbit(TOTAL_MASS, SIDEWAYS_SPEED_2026_KM_S).firstPassKpc
    expect(Math.abs(Math.log(r / 20) - Math.log(250 / r))).toBeLessThan(0.2)
  })
  it('each guess has its own marker, in increasing order', () => {
    const f = FALL_CHOICES.map((c) => fallGuessMarker(c.id).gyr)
    expect(f).toEqual([...f].sort((a, b) => a - b))
    expect(new Set(f).size).toBe(FALL_CHOICES.length)
    const p = PASS_CHOICES.map((c) => passGuessMarker(c.id).kpc)
    expect(p).toEqual([...p].sort((a, b) => a - b))
    expect(new Set(p).size).toBe(PASS_CHOICES.length)
  })
  it('the controls hold the specification\'s trial values, and none changes with a guess', () => {
    expect([...TRIAL_SIDEWAYS_KM_S]).toEqual([0, 23, 47, 76, 100])
    expect([...TRIAL_MASSES_SOLAR]).toEqual([1.8e12, 2.3e12, 2.8e12])
    const before = JSON.stringify([orbit(TOTAL_MASS, 46.7), straightFallGyr(), fallAnswer(), passAnswer()])
    fallGuessResult('f1')
    passGuessMarker('p900')
    expect(JSON.stringify([orbit(TOTAL_MASS, 46.7), straightFallGyr(), fallAnswer(), passAnswer()])).toBe(before)
  })
})
