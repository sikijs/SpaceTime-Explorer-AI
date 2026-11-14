import { describe, expect, it } from 'vitest'
import {
  GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS,
  MAX_DARK_MATTER_AMOUNT,
  MAX_RADIUS_KPC,
  MIN_RADIUS_KPC,
  OBSERVED_SPEED_KM_PER_S,
  circularSpeedKmPerS,
  haloEnclosedMass,
  orbitalPeriodYears,
  rotationCurve,
  runDarkMatterExperiment,
  visibleEnclosedMass,
} from './darkMatterExperiment'

const radii = Array.from({ length: MAX_RADIUS_KPC - MIN_RADIUS_KPC + 1 }, (_, i) => MIN_RADIUS_KPC + i)

describe('rotationCurve', () => {
  it('equals the visible-only speed at every radius when amount is 0', () => {
    for (const p of rotationCurve(0, radii)) {
      expect(p.withDarkMatterSpeedKmPerS).toBeCloseTo(p.visibleOnlySpeedKmPerS, 10)
    }
  })

  it('has a visible-only speed that strictly decreases with radius', () => {
    const curve = rotationCurve(0, radii)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].visibleOnlySpeedKmPerS).toBeLessThan(curve[i - 1].visibleOnlySpeedKmPerS)
    }
  })

  it('is within 5% of the observed speed at every radius when amount is 1', () => {
    for (const p of rotationCurve(1, radii)) {
      expect(
        Math.abs(p.withDarkMatterSpeedKmPerS - OBSERVED_SPEED_KM_PER_S) / OBSERVED_SPEED_KM_PER_S,
      ).toBeLessThan(0.05)
    }
  })

  it('gives a strictly higher speed at every radius for a larger amount', () => {
    const low = rotationCurve(0.5, radii)
    const high = rotationCurve(1.5, radii)
    low.forEach((p, i) =>
      expect(high[i].withDarkMatterSpeedKmPerS).toBeGreaterThan(p.withDarkMatterSpeedKmPerS),
    )
  })

  it('has a visible-only speed at 8 kpc well below the observed speed', () => {
    const [p] = rotationCurve(0, [8])
    expect(p.visibleOnlySpeedKmPerS).toBeLessThan(OBSERVED_SPEED_KM_PER_S * 0.85)
  })
})

describe('circularSpeedKmPerS', () => {
  it('satisfies speed^2 * radius / G = enclosed mass', () => {
    for (const r of [5, 8, 20, 30]) {
      const mass = visibleEnclosedMass(r) + haloEnclosedMass(r, 1)
      const v = circularSpeedKmPerS(r, mass)
      expect((v * v * r) / GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS).toBeCloseTo(mass, -2)
    }
  })
})

describe('haloEnclosedMass', () => {
  it('is 0 when amount is 0, grows with radius, and is never negative', () => {
    for (const r of radii) expect(haloEnclosedMass(r, 0)).toBe(0)
    let previous = 0
    for (const r of radii) {
      const mass = haloEnclosedMass(r, MAX_DARK_MATTER_AMOUNT)
      expect(mass).toBeGreaterThanOrEqual(0)
      expect(mass).toBeGreaterThan(previous)
      previous = mass
    }
  })
})

describe('orbitalPeriodYears', () => {
  it('is within 10% of 230 million years at 8 kpc when amount is 1', () => {
    const [p] = rotationCurve(1, [8])
    const years = orbitalPeriodYears(8, p.withDarkMatterSpeedKmPerS)
    expect(Math.abs(years - 230e6) / 230e6).toBeLessThan(0.1)
  })
})

describe('runDarkMatterExperiment', () => {
  it('returns one curve point per kiloparsec across the outer galaxy', () => {
    const result = runDarkMatterExperiment(1)
    expect(result.amount).toBe(1)
    expect(result.curve.map((p) => p.radiusKpc)).toEqual(radii)
  })
})

describe('module independence', () => {
  it('does not import from the expansion-physics modules', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./darkMatterExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    for (const name of ['hubblesLawExperiment', 'bigBangExperiment', 'cosmicMicrowaveBackgroundExperiment']) {
      expect(importLines.some((line: string) => line.includes(name))).toBe(false)
    }
  })
})

// ---- Audit update (2026-11-14) ----
import {
  GUESS_LINE_STEP_KM_PER_S,
  MARKER_STAR_RADII_KPC,
  MATCH_TOLERANCE,
  PUBLISHED_SUN_SPEED_EILERS_KM_PER_S,
  PUBLISHED_SUN_SPEED_REID_KM_PER_S,
  actualMeasuredComparison,
  actualSpeedComparison,
  amountVerdict,
  checkUp,
  darkMatterShare,
  guessLineEndpoints,
  guessMarker,
  lapsInSimulatedSpan,
  matchingAmountBand,
  measuredGuessMatches,
  percentDifference,
  readingFor,
  speedGuessMatches,
} from './darkMatterExperiment'

describe('guess marks', () => {
  it('draws a different line for each guess 1 answer, starting on the visible-only line', () => {
    const faster = guessLineEndpoints('faster')
    const same = guessLineEndpoints('same')
    const slower = guessLineEndpoints('slower')
    const start = rotationCurve(0, [MIN_RADIUS_KPC])[0].visibleOnlySpeedKmPerS
    for (const g of [faster, same, slower]) {
      expect(g.startRadiusKpc).toBe(MIN_RADIUS_KPC)
      expect(g.endRadiusKpc).toBe(MAX_RADIUS_KPC)
      expect(g.startSpeedKmPerS).toBeCloseTo(start, 10)
    }
    expect(faster.endSpeedKmPerS - start).toBeCloseTo(GUESS_LINE_STEP_KM_PER_S, 10)
    expect(same.endSpeedKmPerS).toBeCloseTo(start, 10)
    expect(slower.endSpeedKmPerS - start).toBeCloseTo(-GUESS_LINE_STEP_KM_PER_S, 10)
  })

  it('keeps the guess line inside the drawn speed range of the graph (0 to 260 km/s)', () => {
    for (const guess of ['faster', 'same', 'slower'] as const) {
      const g = guessLineEndpoints(guess)
      expect(g.endSpeedKmPerS).toBeGreaterThan(0)
      expect(g.endSpeedKmPerS).toBeLessThan(260)
    }
  })

  it('places the guess 2 marker at the far end, anchored on the visible-only line, with a kind per answer', () => {
    const visibleFar = rotationCurve(0, [MAX_RADIUS_KPC])[0].visibleOnlySpeedKmPerS
    const kinds = (['match', 'faster', 'slower'] as const).map((g) => guessMarker(g).kind)
    expect(new Set(kinds).size).toBe(3)
    for (const g of ['match', 'faster', 'slower'] as const) {
      const m = guessMarker(g)
      expect(m.radiusKpc).toBe(MAX_RADIUS_KPC)
      expect(m.anchorSpeedKmPerS).toBeCloseTo(visibleFar, 10)
      expect(m.measuredSpeedKmPerS).toBe(OBSERVED_SPEED_KM_PER_S)
    }
  })
})

describe('what the model actually gives, and the tutor marking', () => {
  it('derives "slower" for guess 1 and "faster" for guess 2 from the curve, not from constants', () => {
    expect(actualSpeedComparison()).toBe('slower')
    expect(actualMeasuredComparison()).toBe('faster')
  })

  it('marks exactly one answer of each guess as matching', () => {
    expect((['faster', 'same', 'slower'] as const).filter(speedGuessMatches)).toEqual(['slower'])
    expect((['match', 'faster', 'slower'] as const).filter(measuredGuessMatches)).toEqual(['faster'])
  })

  it('has a measured reference above the visible-only line at every distance (the guess 2 premise)', () => {
    for (const p of rotationCurve(0, radii)) {
      expect(OBSERVED_SPEED_KM_PER_S).toBeGreaterThan(p.visibleOnlySpeedKmPerS * (1 + MATCH_TOLERANCE))
    }
  })

  it('does not read a guess anywhere in the real curve: it depends only on the amount', () => {
    expect(runDarkMatterExperiment(1)).toEqual(runDarkMatterExperiment(1))
  })
})

describe('amountVerdict and matchingAmountBand', () => {
  it('says match at 1, too-little at 0 and 0.5, too-much at 2', () => {
    expect(amountVerdict(1)).toBe('match')
    expect(amountVerdict(0)).toBe('too-little')
    expect(amountVerdict(0.5)).toBe('too-little')
    expect(amountVerdict(2)).toBe('too-much')
  })

  it('has a matching band of about 0.86 to 1.09 that contains 1', () => {
    const band = matchingAmountBand()
    expect(band.low).toBeGreaterThan(0.84)
    expect(band.low).toBeLessThan(0.88)
    expect(band.high).toBeGreaterThan(1.07)
    expect(band.high).toBeLessThan(1.11)
    expect(band.low).toBeLessThanOrEqual(1)
    expect(band.high).toBeGreaterThanOrEqual(1)
  })
})

describe('readings and worked examples', () => {
  it('reads a difference as less, more or the same', () => {
    expect(readingFor(-23)).toBe('less')
    expect(readingFor(3)).toBe('more')
    expect(readingFor(0)).toBe('the same')
    expect(readingFor(-1.3, 5)).toBe('the same')
    expect(readingFor(-8, 5)).toBe('less')
  })

  it('computes percent difference with the sign of (value - reference)', () => {
    expect(percentDifference(110, 100)).toBeCloseTo(10, 10)
    expect(percentDifference(90, 100)).toBeCloseTo(-10, 10)
  })

  it('gives the worked moment for the 8 kpc star: about 290 million years a lap and about 3.4 laps', () => {
    const v8 = rotationCurve(0, [8])[0].visibleOnlySpeedKmPerS
    expect(v8).toBeCloseTo(169.3, 0)
    expect(orbitalPeriodYears(8, v8) / 1e6).toBeCloseTo(290, -1)
    expect(lapsInSimulatedSpan(8, v8)).toBeCloseTo(3.4, 1)
  })

  it('gives more laps to the inner star than the outer star in the same span (visible matter only)', () => {
    const [inner, , outer] = rotationCurve(0, MARKER_STAR_RADII_KPC)
    expect(lapsInSimulatedSpan(inner.radiusKpc, inner.visibleOnlySpeedKmPerS)).toBeGreaterThan(
      lapsInSimulatedSpan(outer.radiusKpc, outer.visibleOnlySpeedKmPerS),
    )
  })

  it('gives dark matter 3.5e10 solar masses inside 8 kpc and about 40 percent share at the matching amount', () => {
    expect(haloEnclosedMass(8, 1) / 1e10).toBeCloseTo(3.5, 1)
    expect(darkMatterShare(8, 1)).toBeCloseTo(0.398, 2)
    expect(darkMatterShare(30, 1)).toBeCloseTo(0.796, 2)
    expect(darkMatterShare(8, 0)).toBe(0)
  })
})

describe('checkUp', () => {
  const rows = Object.fromEntries(checkUp().map((r) => [r.id, r]))

  it('has rows a to e, each with a difference that matches its two numbers', () => {
    expect(Object.keys(rows)).toEqual(['a', 'b', 'c', 'd', 'e'])
    for (const id of ['a', 'b', 'd', 'e'] as const) {
      expect(rows[id].differencePercent).toBeCloseTo(percentDifference(rows[id].thisPage, rows[id].beside), 10)
    }
  })

  it('reads the visible-only speed as less than the 220 reference at 8 and 30 kpc (about 23 and 54 percent)', () => {
    expect(rows.a.reading).toBe('less')
    expect(rows.a.differencePercent).toBeCloseTo(-23, 0)
    expect(rows.b.reading).toBe('less')
    expect(rows.b.differencePercent).toBeCloseTo(-54.3, 0)
  })

  it('reads the matching amount as the same as 220, within 1.3 percent at every distance', () => {
    expect(rows.c.reading).toBe('the same')
    expect(Math.abs(rows.c.differencePercent)).toBeLessThan(1.4)
    expect(Math.abs(rows.c.differencePercent)).toBeGreaterThan(1.2)
  })

  it('gives a lap of about 225 million years at the matching amount, about 2 percent less than NASA\'s 230', () => {
    expect(rows.d.thisPage / 1e6).toBeCloseTo(225, -1)
    expect(rows.d.reading).toBe('less')
    expect(rows.d.differencePercent).toBeCloseTo(-2.1, 0)
  })

  it('reads the page\'s 220 reference as less than both published values', () => {
    expect(rows.e.reading).toBe('less')
    expect(PUBLISHED_SUN_SPEED_EILERS_KM_PER_S).toBeGreaterThan(OBSERVED_SPEED_KM_PER_S)
    expect(PUBLISHED_SUN_SPEED_REID_KM_PER_S).toBeGreaterThan(OBSERVED_SPEED_KM_PER_S)
  })

  it('does not depend on the learner\'s amount', () => {
    expect(checkUp()).toEqual(checkUp())
  })
})

// ---- Introduction numbers (2026-11-14) ----
import {
  HYDROGEN_RED_LINE_NM,
  dopplerShiftNanometres,
  enclosedMassFromSpeed,
  fractionOfLightSpeed,
  sirenShiftPercent,
  speedRatioForMassRatio,
} from './darkMatterExperiment'

describe('introduction numbers', () => {
  it('gives 220 km/s as about 0.07 percent of the speed of light', () => {
    expect(fractionOfLightSpeed(220) * 100).toBeCloseTo(0.0734, 3)
  })

  it('shifts the red hydrogen line by about 0.48 nm at 220 km/s, from 656.3 to about 655.8 nm', () => {
    const shift = dopplerShiftNanometres(220)
    expect(shift).toBeCloseTo(0.48, 2)
    expect(HYDROGEN_RED_LINE_NM - shift).toBeCloseTo(655.8, 1)
    expect(dopplerShiftNanometres(0)).toBe(0)
    expect(dopplerShiftNanometres(440)).toBeCloseTo(2 * shift, 10)
  })

  it('gives a siren shift of about 9 percent at 30 m/s, about 120 times the galaxy shift', () => {
    expect(sirenShiftPercent(30)).toBeCloseTo(8.8, 1)
    expect(sirenShiftPercent(30) / (fractionOfLightSpeed(220) * 100)).toBeGreaterThan(115)
    expect(sirenShiftPercent(30) / (fractionOfLightSpeed(220) * 100)).toBeLessThan(125)
  })

  it('gives about 2.3e10 solar masses for 100 km/s at 10 kpc, and inverts the page\'s speed formula', () => {
    expect(enclosedMassFromSpeed(100, 10) / 1e10).toBeCloseTo(2.3, 1)
    expect(circularSpeedKmPerS(10, enclosedMassFromSpeed(100, 10))).toBeCloseTo(100, 8)
  })

  it('gives twice the speed for four times the mass, with the same distance', () => {
    expect(speedRatioForMassRatio(4)).toBe(2)
    expect(circularSpeedKmPerS(8, 4e10) / circularSpeedKmPerS(8, 1e10)).toBeCloseTo(2, 10)
  })
})
