import { describe, it, expect } from 'vitest'
import {
  G,
  C,
  HBAR,
  JUPITER_MASS_KG,
  SUN_MASS_KG,
  EARTH_MASS_KG,
  PUBLISHED_TENSION_AT_10_M_DYN_CM2,
  PUBLISHED_NEUTRON_STAR_MATCH_RADIUS_M,
  CASIMIR_MEASURED_WITHIN_PERCENT,
  secondaryNegativeMassKg,
  shapeFunction,
  shapeSlope,
  flareOutSlope,
  circumferenceRadius,
  embeddingHeight,
  embeddingProfile,
  energyDensity,
  throatTension,
  tensionInDynPerCm2,
  totalNegativeMassKg,
  totalNegativeMassNumericKg,
  negativeMassInUnits,
  negativeEnergyNeededJ,
  schwarzschildRadiusM,
  arealRadiusFraction,
  throatRadiusFraction,
  bridgeSlice,
  traceRightMovingRay,
  casimirEnergyPerAreaJPerM2,
  casimirEnergyDensityJPerM3,
  casimirShortfall,
  casimirAreaNeededM2,
  fractionOfObservableUniverseSurface,
  ECHO_SEARCHES,
  nearestOnLogScale,
  CROSS_CHOICES,
  lightCanCross,
  crossAnswer,
  crossGuessResult,
  crossGuessMarker,
  MASS_CHOICES,
  massAnswer,
  massChoiceKg,
  massGuessResult,
  massGuessMarker,
  MASS_LANDMARKS,
  MASS_RULER,
  massRulerPosition,
  TRIAL_THROAT_RADII_M,
  TRIAL_PLATE_GAPS_M,
  TRIAL_DEFAULT_THROAT_RADIUS_M,
  TRIAL_DEFAULT_PLATE_GAP_M,
  trialPicture,
  ENERGY_RULER,
  energyRulerPosition,
  PICTURE_PROFILE_HALF_LENGTH_M,
  SNAPSHOT_TIMES,
  PICTURE_RAY_START,
  pictureOne,
  bridgeSnapshots,
  pictureRayEndsAtT,
  TENSION_AXES,
  tensionCurve,
  tensionMarks,
  tensionAxisPosition,
  radiusAxisPosition,
  pictureThree,
  PREDICTION_THROAT_RADIUS_M,
} from './wormholes'

// Independent helpers, written here and not taken from the module under test.
function bisect(f: (x: number) => number, lo: number, hi: number): number {
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) < 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
function simpson(f: (x: number) => number, a: number, b: number, n: number): number {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 === 0 ? 2 : 4)
  return (s * h) / 3
}

describe('the shape of the simplest open throat', () => {
  it('has b(b0) = b0, b(r) < r outside, and a flare-out slope of -1 (below 1) whatever the size', () => {
    for (const b0 of [1e-3, 1, 3e3, 1e4]) {
      expect(shapeFunction(b0, b0)).toBeCloseTo(b0, 12)
      expect(flareOutSlope(b0)).toBeCloseTo(-1, 12)
      expect(flareOutSlope(b0)).toBeLessThan(1)
      for (const k of [1.0001, 1.5, 3, 100]) expect(shapeFunction(k * b0, b0)).toBeLessThan(k * b0)
    }
  })
  it('has a slope equal to the numerical derivative of b(r)', () => {
    const b0 = 2
    for (const r of [2.5, 3, 7]) {
      const h = 1e-6
      const numeric = (shapeFunction(r + h, b0) - shapeFunction(r - h, b0)) / (2 * h)
      expect(shapeSlope(r, b0)).toBeCloseTo(numeric, 5)
    }
  })
  it('has a circumference radius sqrt(l^2 + b0^2), smallest (b0) at the throat, and grows both ways', () => {
    const b0 = 5
    expect(circumferenceRadius(0, b0)).toBeCloseTo(b0, 12)
    expect(circumferenceRadius(12, b0)).toBeCloseTo(13, 12)
    expect(circumferenceRadius(-12, b0)).toBeCloseTo(13, 12)
  })
  it('draws the height b0 arccosh(r / b0), equal to the integral of dr / sqrt(r / b - 1) worked separately', () => {
    const b0 = 3
    for (const R of [4, 9, 30]) {
      // r = b0 + w^2 removes the end singularity: the integrand 2 w / sqrt(r/b - 1) with b = b0^2 / r.
      const f = (w: number) => {
        if (w === 0) return Math.sqrt(2 * b0) // the limit of 2 b0 / sqrt(2 b0 + w^2) at w = 0
        const r = b0 + w * w
        const b = (b0 * b0) / r
        return (2 * w) / Math.sqrt(r / b - 1)
      }
      const numeric = simpson(f, 0, Math.sqrt(R - b0), 4000)
      expect(embeddingHeight(R, b0)).toBeCloseTo(numeric, 5)
    }
    expect(embeddingHeight(b0, b0)).toBeCloseTo(0, 12)
  })
  it('draws a profile whose mouths flare away from each other (height has the sign of l) and which is symmetric in radius', () => {
    const pts = embeddingProfile(2, 10, 100)
    expect(pts).toHaveLength(101)
    const mid = pts[50]
    expect(mid.l).toBeCloseTo(0, 12)
    expect(mid.z).toBeCloseTo(0, 12)
    for (let i = 0; i < 50; i++) {
      expect(pts[100 - i].r).toBeCloseTo(pts[i].r, 10)
      expect(pts[100 - i].z).toBeCloseTo(-pts[i].z, 10)
      expect(pts[i].z).toBeLessThan(0)
    }
  })
  it('refuses a radius that is not above zero and a circumference radius inside the throat', () => {
    expect(() => shapeFunction(1, 0)).toThrow(RangeError)
    expect(() => shapeFunction(0.5, 1)).toThrow(RangeError)
    expect(() => embeddingHeight(0.5, 1)).toThrow(RangeError)
    expect(() => throatTension(-1)).toThrow(RangeError)
  })
})

describe('the energy that holds a throat open', () => {
  it('is negative everywhere, falls as 1 / r^4, and at the throat equals minus the tension in size', () => {
    const b0 = 4
    for (const r of [4, 5, 12, 100]) expect(energyDensity(r, b0)).toBeLessThan(0)
    expect(energyDensity(8, b0) / energyDensity(4, b0)).toBeCloseTo(1 / 16, 12)
    expect(energyDensity(b0, b0)).toBeCloseTo(-throatTension(b0), 6)
  })
  it('has the tension c^4 / (8 pi G b0^2): 4.82e40 Pa at 10 m (the published 5e41 dyn/cm^2 within 4 percent) and 5.35e35 Pa at 3 km', () => {
    const own = (r: number) => Math.pow(299792458, 4) / (8 * Math.PI * 6.6743e-11 * r * r)
    expect(throatTension(10)).toBeCloseTo(own(10), -30)
    expect(throatTension(10) / 4.8154e40).toBeCloseTo(1, 3)
    expect(tensionInDynPerCm2(10)).toBeCloseTo(throatTension(10) * 10, -30)
    expect(Math.abs(tensionInDynPerCm2(10) - PUBLISHED_TENSION_AT_10_M_DYN_CM2) / PUBLISHED_TENSION_AT_10_M_DYN_CM2).toBeLessThan(0.04)
    expect(throatTension(PUBLISHED_NEUTRON_STAR_MATCH_RADIUS_M) / 5.3505e35).toBeCloseTo(1, 3)
    expect(throatTension(20) / throatTension(10)).toBeCloseTo(0.25, 12)
  })
  it('has a total negative mass -pi b0 c^2 / (2G): the closed form agrees with an integral of the density over the proper volume, for any size', () => {
    for (const b0 of [1e-3, 1, 3e3]) {
      expect(totalNegativeMassNumericKg(b0) / totalNegativeMassKg(b0)).toBeCloseTo(1, 3)
    }
  })
  it('is 2.115e27 kg, 1.11 Jupiter masses, for a 1 metre throat, and proportional to the radius', () => {
    expect(totalNegativeMassKg(1) / 2.1152e27).toBeCloseTo(1, 3)
    expect(totalNegativeMassKg(1) / JUPITER_MASS_KG).toBeCloseTo(1.11, 2)
    expect(totalNegativeMassKg(1000) / totalNegativeMassKg(1)).toBeCloseTo(1000, 9)
    const u = negativeMassInUnits(totalNegativeMassKg(1))
    expect(u.jupiters).toBeCloseTo(1.114, 2)
    expect(u.earths).toBeCloseTo(totalNegativeMassKg(1) / EARTH_MASS_KG, 6)
    expect(u.suns).toBeCloseTo(totalNegativeMassKg(1) / SUN_MASS_KG, 12)
  })
  it('differs from the secondary summary (-b0 c^2 / G, 0.71 Jupiter) by the factor pi / 2', () => {
    expect(totalNegativeMassKg(1) / secondaryNegativeMassKg(1)).toBeCloseTo(Math.PI / 2, 12)
    expect(secondaryNegativeMassKg(1) / JUPITER_MASS_KG).toBeCloseTo(0.709, 2)
  })
  it('has an energy of M c^2: 1.90e44 J for a 1 metre throat', () => {
    expect(negativeEnergyNeededJ(1) / 1.9011e44).toBeCloseTo(1, 3)
    expect(negativeEnergyNeededJ(1)).toBeCloseTo(totalNegativeMassKg(1) * C * C, -25)
  })
})

describe('the closing of the simplest wormhole (the Einstein-Rosen bridge)', () => {
  it('has a horizon radius 2GM/c^2 (2.95 km for the Sun)', () => {
    expect(schwarzschildRadiusM(SUN_MASS_KG)).toBeCloseTo(2953.3, 0)
    expect(() => schwarzschildRadiusM(0)).toThrow(RangeError)
  })
  it('solves (x - 1) e^x = u for the circumference radius, checked by substitution and by a separate root-finder', () => {
    for (const u of [-0.99, -0.5, -0.25, 0, 1, 10, 1000]) {
      const x = arealRadiusFraction(u)
      expect((x - 1) * Math.exp(x)).toBeCloseTo(u, 8)
      expect(x).toBeCloseTo(bisect((y) => (y - 1) * Math.exp(y) - u, 0, 50), 8)
    }
    expect(arealRadiusFraction(0)).toBeCloseTo(1, 12)
    expect(arealRadiusFraction(-1)).toBe(0)
    expect(() => arealRadiusFraction(-2)).toThrow(RangeError)
  })
  it('has a throat that falls from the horizon radius at T = 0 to nothing at T = 1, steadily, and the same for -T', () => {
    expect(throatRadiusFraction(0)).toBeCloseTo(1, 12)
    expect(throatRadiusFraction(1)).toBe(0)
    let previous = throatRadiusFraction(0)
    for (const T of [0.1, 0.3, 0.5, 0.7, 0.9, 0.99, 1]) {
      const x = throatRadiusFraction(T)
      expect(x).toBeLessThan(previous)
      expect(throatRadiusFraction(-T)).toBeCloseTo(x, 12)
      previous = x
    }
    expect(throatRadiusFraction(0.5)).toBeCloseTo(bisect((y) => (y - 1) * Math.exp(y) + 0.25, 0, 1), 10)
    expect(() => throatRadiusFraction(1.2)).toThrow(RangeError)
  })
  it('has a slice whose narrowest circumference radius is the throat at X = 0, with the proper distance rising steadily and antisymmetric about it', () => {
    for (const T of [0, 0.5, 0.9]) {
      const pts = bridgeSlice(T, 3, 400)
      const mid = pts[200]
      expect(mid.X).toBeCloseTo(0, 12)
      expect(mid.distance).toBe(0)
      expect(mid.radiusFraction).toBeCloseTo(throatRadiusFraction(T), 10)
      expect(Math.min(...pts.map((p) => p.radiusFraction))).toBeCloseTo(mid.radiusFraction, 12)
      for (let i = 1; i < pts.length; i++) expect(pts[i].distance).toBeGreaterThan(pts[i - 1].distance)
      for (let i = 0; i <= 200; i++) expect(pts[400 - i].distance).toBeCloseTo(-pts[i].distance, 8)
      for (let i = 201; i <= 400; i++) expect(pts[i].radiusFraction).toBeGreaterThan(pts[i - 1].radiusFraction)
    }
  })
  it('has a proper distance along the slice equal to a separate fine integral of 2 sqrt(e^-x / x) dX', () => {
    const T = 0.5
    const x = (X: number) => bisect((y) => (y - 1) * Math.exp(y) - (X * X - T * T), 0, 60)
    const g = (X: number) => 2 * Math.sqrt(Math.exp(-x(X)) / x(X))
    const reference = simpson(g, 0, 1.5, 4000)
    const pts = bridgeSlice(T, 3, 2000)
    const at = pts.find((p) => Math.abs(p.X - 1.5) < 1e-9)!
    expect(at.distance).toBeCloseTo(reference, 4)
    expect(() => bridgeSlice(1)).toThrow(RangeError)
  })
  it('sends no right-moving ray from the left exterior into the right exterior: it ends on the singularity at T = (1 + k^2) / (2|k|), never before T = 1', () => {
    const starts: [number, number][] = [
      [0, -1],
      [0, -3],
      [-2, -4],
      [1, -2],
      [0.5, -5],
      [-0.5, -0.7],
      [3, -10],
    ]
    for (const [T0, X0] of starts) {
      const k = X0 - T0
      const ray = traceRightMovingRay(T0, X0)
      expect(ray.reachesRightExterior).toBe(false)
      expect(ray.endsAtT).toBeCloseTo((1 + k * k) / (2 * Math.abs(k)), 12)
      expect(ray.endsAtT).toBeGreaterThanOrEqual(1 - 1e-12)
      const last = ray.points[ray.points.length - 1]
      expect(last.T * last.T - last.X * last.X).toBeCloseTo(1, 8)
      for (const p of ray.points) expect(p.T * p.T - p.X * p.X).toBeLessThanOrEqual(1 + 1e-9)
    }
    expect(traceRightMovingRay(0, -1).endsAtT).toBeCloseTo(1, 12)
    expect(() => traceRightMovingRay(0, 1)).toThrow(RangeError)
    expect(() => traceRightMovingRay(2, -1)).toThrow(RangeError)
  })
})

describe('the negative energy we know: the Casimir effect', () => {
  it('has an energy per area pi^2 hbar c / (720 d^3): 4.334e-10 J/m^2 at 1 micrometre, falling as 1 / d^3', () => {
    expect(casimirEnergyPerAreaJPerM2(1e-6) / 4.3338e-10).toBeCloseTo(1, 3)
    expect(casimirEnergyPerAreaJPerM2(1e-6) / (Math.PI ** 2 * HBAR * C / 720 / 1e-18)).toBeCloseTo(1, 12)
    expect(casimirEnergyPerAreaJPerM2(0.5e-6) / casimirEnergyPerAreaJPerM2(1e-6)).toBeCloseTo(8, 12)
    expect(casimirEnergyDensityJPerM3(1e-6) * 1e-6).toBeCloseTo(casimirEnergyPerAreaJPerM2(1e-6), 12)
    expect(CASIMIR_MEASURED_WITHIN_PERCENT).toBe(5)
  })
  it('is about 4.4e53 times too small for a 1 metre throat and 1 m^2 of plates 1 micrometre apart, and needs about a fifth of the observable universe\'s surface in plate', () => {
    expect(casimirShortfall(1, 1e-6) / 4.3866e53).toBeCloseTo(1, 2)
    expect(casimirShortfall(1, 1e-6, 4)).toBeCloseTo(casimirShortfall(1, 1e-6) / 4, -45)
    expect(casimirAreaNeededM2(1, 1e-6)).toBeCloseTo(casimirShortfall(1, 1e-6), -45)
    expect(fractionOfObservableUniverseSurface(casimirAreaNeededM2(1, 1e-6))).toBeCloseTo(0.18, 2)
    expect(casimirShortfall(1000, 1e-6) / casimirShortfall(1, 1e-6)).toBeCloseTo(1000, 6)
    expect(casimirShortfall(1, 1e-7) / casimirShortfall(1, 1e-6)).toBeCloseTo(1e-3, 9)
  })
})

describe('what has been searched for', () => {
  it('holds the two searches as published: no significant echoes in three events, and a Bayes factor of 1.87 for GW231123 that is not robust', () => {
    expect(ECHO_SEARCHES).toHaveLength(2)
    const wu = ECHO_SEARCHES.find((s) => s.id === 'wu')!
    expect(wu.events).toEqual(['GW150914', 'GW231226', 'GW250114'])
    expect(wu.arxiv).toBe('arXiv:2512.24730')
    expect(wu.bayesFactor).toBeNull()
    const lai = ECHO_SEARCHES.find((s) => s.id === 'lai')!
    expect(lai.events).toEqual(['GW231123'])
    expect(lai.arxiv).toBe('arXiv:2602.01615')
    expect(lai.bayesFactor).toBe(1.87)
  })
})

describe('the predictions', () => {
  it('picks the nearest button on a log scale', () => {
    const choices = [{ v: 1 }, { v: 10 }, { v: 100 }]
    expect(nearestOnLogScale(choices, 3, (c) => c.v).v).toBe(1)
    expect(nearestOnLogScale(choices, 4, (c) => c.v).v).toBe(10)
    expect(nearestOnLogScale(choices, 6, (c) => c.v).v).toBe(10)
    expect(nearestOnLogScale(choices, 1e9, (c) => c.v).v).toBe(100)
    expect(() => nearestOnLogScale(choices, 0, (c) => c.v)).toThrow(RangeError)
  })
  it('has the answer "no" to Prediction 1: no ray reaches the other side', () => {
    expect(lightCanCross()).toBe(false)
    expect(crossAnswer()).toBe('no')
    expect(CROSS_CHOICES.map((c) => c.id)).toEqual(['yes', 'no'])
    expect(crossGuessResult('no')).toBe('matched')
    expect(crossGuessResult('yes')).toBe('not matched')
    expect(crossGuessMarker('yes')).toEqual({ crosses: true })
    expect(crossGuessMarker('no')).toEqual({ crosses: false })
  })
  it('has the answer "about the mass of Jupiter" to Prediction 2, the nearest button on a log scale to 2.1e27 kg', () => {
    expect(massAnswer()).toBe('m27')
    expect(massChoiceKg('m27')).toBe(1e27)
    expect(massGuessResult('m27')).toBe('matched')
    for (const c of MASS_CHOICES) if (c.id !== 'm27') expect(massGuessResult(c.id)).toBe('not matched')
    expect(massGuessMarker('m15')).toEqual({ kg: 1e15 })
    const values = MASS_CHOICES.map((c) => c.kg)
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1])
  })
  it('does not change when a guess is made or changed: the module is pure', () => {
    const before = [totalNegativeMassKg(1), throatTension(1), crossAnswer(), massAnswer(), casimirShortfall(1, 1e-6)]
    for (const id of ['yes', 'no'] as const) crossGuessResult(id)
    for (const c of MASS_CHOICES) {
      massGuessResult(c.id)
      massGuessMarker(c.id)
    }
    const after = [totalNegativeMassKg(1), throatTension(1), crossAnswer(), massAnswer(), casimirShortfall(1, 1e-6)]
    expect(after).toEqual(before)
  })
})

describe('the ruler of masses and the trial values', () => {
  it('places the landmarks in order along a log ruler from 100 kg to 10^32 kg', () => {
    let previous = -1
    for (const l of MASS_LANDMARKS) {
      const p = massRulerPosition(l.kg)
      expect(p).toBeGreaterThan(previous)
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
      previous = p
    }
    expect(massRulerPosition(MASS_RULER.minKg)).toBeCloseTo(0, 12)
    expect(massRulerPosition(MASS_RULER.maxKg)).toBeCloseTo(1, 12)
    expect(massRulerPosition(1e17)).toBeCloseTo(0.5, 12)
    expect(() => massRulerPosition(0)).toThrow(RangeError)
  })
  it('gives a finite trial picture for every combination of the two controls, with the numbers of the module', () => {
    expect(TRIAL_THROAT_RADII_M).toHaveLength(5)
    expect(TRIAL_PLATE_GAPS_M).toHaveLength(3)
    expect(TRIAL_THROAT_RADII_M).toContain(TRIAL_DEFAULT_THROAT_RADIUS_M)
    expect(TRIAL_PLATE_GAPS_M).toContain(TRIAL_DEFAULT_PLATE_GAP_M)
    for (const b0 of TRIAL_THROAT_RADII_M)
      for (const d of TRIAL_PLATE_GAPS_M) {
        const t = trialPicture(b0, d)
        expect(t.negativeMassKg).toBeCloseTo(totalNegativeMassKg(b0), -20)
        expect(t.tensionPa).toBeCloseTo(throatTension(b0), -20)
        expect(t.shortfall).toBeCloseTo(casimirShortfall(b0, d), -30)
        expect(t.inUnits.jupiters).toBeCloseTo(t.negativeMassKg / JUPITER_MASS_KG, 6)
        for (const v of [t.negativeMassKg, t.tensionPa, t.neededJ, t.casimirJPerM2, t.shortfall, t.plateAreaM2, t.fractionOfUniverseSurface]) {
          expect(Number.isFinite(v)).toBe(true)
          expect(v).toBeGreaterThan(0)
        }
      }
  })
  it('flags only the 3 km throat as the published neutron-star match, and gives the default trial values the numbers of the prediction', () => {
    expect(trialPicture(3000, 1e-6).isPublishedNeutronStarMatch).toBe(true)
    expect(trialPicture(1000, 1e-6).isPublishedNeutronStarMatch).toBe(false)
    const d = trialPicture(TRIAL_DEFAULT_THROAT_RADIUS_M, TRIAL_DEFAULT_PLATE_GAP_M)
    expect(d.negativeMassKg).toBeCloseTo(totalNegativeMassKg(1), -20)
    expect(d.shortfall / 4.3866e53).toBeCloseTo(1, 2)
  })
  it('gives the tension ratio against the 3 km throat and puts every trial value on its ruler', () => {
    expect(trialPicture(3000, 1e-6).tensionOverNeutronStarCentre).toBeCloseTo(1, 12)
    expect(trialPicture(1000, 1e-6).tensionOverNeutronStarCentre).toBeCloseTo(9, 9)
    expect(trialPicture(1e4, 1e-6).tensionOverNeutronStarCentre).toBeCloseTo(0.09, 9)
    expect(energyRulerPosition(ENERGY_RULER.minJ)).toBeCloseTo(0, 12)
    expect(energyRulerPosition(ENERGY_RULER.maxJ)).toBeCloseTo(1, 12)
    expect(() => energyRulerPosition(0)).toThrow(RangeError)
    for (const b0 of TRIAL_THROAT_RADII_M)
      for (const d of TRIAL_PLATE_GAPS_M) {
        const t = trialPicture(b0, d)
        for (const q of [t.massRulerPosition, t.neededEnergyRulerPosition, t.casimirEnergyRulerPosition]) {
          expect(q).toBeGreaterThan(0)
          expect(q).toBeLessThan(1)
        }
        expect(t.neededEnergyRulerPosition).toBeGreaterThan(t.casimirEnergyRulerPosition)
      }
    expect(trialPicture(1, 1e-5).casimirEnergyRulerPosition).toBeLessThan(trialPicture(1, 1e-7).casimirEnergyRulerPosition)
  })
  it('uses the constants G and c as given', () => {
    expect(G).toBe(6.6743e-11)
    expect(C).toBe(299_792_458)
  })
})

describe('the numbers for Pictures 1 to 3', () => {
  it('draws Picture 1 for the 1 metre throat of Prediction 2, from -3 m to +3 m, with radius sqrt(10) = 3.162 m at the ends', () => {
    const p = pictureOne()
    expect(p.throatRadiusM).toBe(PREDICTION_THROAT_RADIUS_M)
    expect(p.halfLengthM).toBe(PICTURE_PROFILE_HALF_LENGTH_M)
    expect(p.profile[0].l).toBeCloseTo(-3, 12)
    expect(p.profile[p.profile.length - 1].l).toBeCloseTo(3, 12)
    expect(p.radiusAtEndM).toBeCloseTo(Math.sqrt(10), 12)
    expect(Math.min(...p.profile.map((q) => q.r))).toBeCloseTo(1, 12)
  })
  it('has four moments, 0, 0.5, 0.9 and 0.99, with the throat radii 1.000, 0.898, 0.517 and 0.187 of the horizon radius', () => {
    expect([...SNAPSHOT_TIMES]).toEqual([0, 0.5, 0.9, 0.99])
    const snaps = bridgeSnapshots()
    expect(snaps.map((s) => s.T)).toEqual([0, 0.5, 0.9, 0.99])
    const expected = [1, 0.8982, 0.5170, 0.1873]
    snaps.forEach((s, i) => {
      expect(s.throatRadiusFraction).toBeCloseTo(expected[i], 3)
      expect(s.throatRadiusFraction).toBeCloseTo(bisect((y) => (y - 1) * Math.exp(y) + SNAPSHOT_TIMES[i] ** 2, 0, 1), 8)
      expect(s.slice.length).toBeGreaterThan(100)
    })
  })
  it('puts the ray on the left of the throat at every moment, moving towards the middle, ending on the singularity at T = 13/12 = 1.0833', () => {
    expect(PICTURE_RAY_START).toEqual({ T: 0, X: -1.5 })
    const snaps = bridgeSnapshots()
    snaps.forEach((s, i) => {
      expect(s.ray.X).toBeCloseTo(SNAPSHOT_TIMES[i] - 1.5, 12)
      expect(s.ray.X).toBeLessThan(0)
      expect(s.ray.distance).toBeLessThan(0)
      expect(s.earlierRays).toHaveLength(i)
    })
    expect(snaps[3].earlierRays.map((r) => r.X)).toEqual([-1.5, -1, -0.6])
    expect(pictureRayEndsAtT()).toBeCloseTo((1 + 2.25) / 3, 12)
    // The interpolated distance agrees with a finer slice.
    const fine = bridgeSlice(0.5, 3, 2400).find((p) => Math.abs(p.X + 1) < 1e-9)!.distance
    expect(snaps[1].ray.distance).toBeCloseTo(fine, 2)
  })
  it('has a tension curve falling as 1 / r^2 (a hundred times for every tenfold radius), with marks for 1 m and 3 km', () => {
    const c = tensionCurve(70)
    expect(c[0].radiusM).toBeCloseTo(TENSION_AXES.minRadiusM, 12)
    expect(c[c.length - 1].radiusM).toBeCloseTo(TENSION_AXES.maxRadiusM, 6)
    for (let i = 10; i < c.length; i++) expect(c[i].tensionPa).toBeLessThan(c[i - 1].tensionPa)
    expect(c[10].tensionPa / c[20].tensionPa).toBeCloseTo(100, 6)
    const marks = tensionMarks()
    expect(marks.map((m) => m.id)).toEqual(['1m', '3km'])
    expect(marks[0].tensionPa).toBeCloseTo(throatTension(1), -30)
    expect(marks[1].publishedNeutronStarMatch).toBe(true)
    expect(marks[0].publishedNeutronStarMatch).toBe(false)
    expect(tensionAxisPosition(TENSION_AXES.minPa)).toBeCloseTo(0, 12)
    expect(tensionAxisPosition(TENSION_AXES.maxPa)).toBeCloseTo(1, 12)
    expect(radiusAxisPosition(1)).toBeCloseTo(3 / 7, 12)
    for (const p of c) {
      expect(p.tensionPa).toBeGreaterThanOrEqual(TENSION_AXES.minPa)
      expect(p.tensionPa).toBeLessThanOrEqual(TENSION_AXES.maxPa)
    }
  })
  it('gives Picture 3 the 1 metre throat: 2.115e27 kg, 354 Earths, 1.11 Jupiters, a position on the ruler beside Jupiter, and the secondary summary at 0.71 Jupiters', () => {
    const p = pictureThree()
    expect(p.throatRadiusM).toBe(1)
    expect(p.negativeMassKg / 2.1152e27).toBeCloseTo(1, 3)
    expect(p.inUnits.earths).toBeCloseTo(354.2, 0)
    expect(p.inUnits.jupiters).toBeCloseTo(1.114, 2)
    expect(p.inUnits.suns).toBeCloseTo(0.001064, 5)
    expect(p.rulerPosition).toBeCloseTo(0.8442, 3)
    expect(p.tensionPa / 4.8155e42).toBeCloseTo(1, 3)
    expect(p.secondaryJupiters).toBeCloseTo(0.709, 2)
    expect(p.worked.kg).toBeCloseTo(Math.PI * p.worked.radiusM * p.worked.c * p.worked.c / (2 * p.worked.g), -20)
  })
})
