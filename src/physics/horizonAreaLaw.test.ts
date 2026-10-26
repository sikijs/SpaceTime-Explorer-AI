import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  AREA_AXIS_MAX_KM2,
  areaAfterKm2,
  areaPicture,
  areaScalingWorked,
  areaSteps,
  blackHoleEqualMergerRatio,
  ceilingWorked,
  directionGuessResult,
  raindropMergerRatio,
  sizeGuessGap,
  checkUp,
  ceilingHeadroomPercent,
  trialOverRealAfter,
  TRIAL_AXIS_MAX_KM2,
  ceilingPicture,
  guessBar,
  massPicture,
  areaChange,
  directionAnswer,
  directionMarker,
  GW250114,
  guessAreaAfterKm2,
  horizonAreaKm2,
  maxRadiatedFraction,
  pressAreaChange,
  radiatedFraction,
  radiatedSolar,
  runHorizonAreaLaw,
  SHARE_CHOICES_PERCENT,
  SIZE_CHOICES,
  sizeAnswer,
  SPIN_CHOICES,
  totalAreaBeforeKm2,
  trialMerger,
} from './horizonAreaLaw'

// A separate calculation with the constants written out (CODATA G and c, the nominal solar mass), in km^2.
const G = 6.6743e-11
const C = 299_792_458
const SUN = 1.98847e30
function separateAreaKm2(massSolar: number, spin: number): number {
  const gm = ((G * massSolar * SUN) / C ** 2) / 1000 // km
  return 8 * Math.PI * gm * gm * (1 + Math.sqrt(1 - spin * spin))
}
// The constants of the two modules differ from these in the fifth digit, so compare to 0.1 percent.
function expectClose(actual: number, expected: number, relative = 1e-3) {
  expect(Math.abs(actual - expected) / expected).toBeLessThan(relative)
}

describe('the area of one horizon (required tests 1 and 2)', () => {
  it('is 16 pi (GM/c^2)^2 for a non-spinning black hole, against a separate calculation', () => {
    expectClose(horizonAreaKm2(33.6, 0), separateAreaKm2(33.6, 0))
    expectClose(horizonAreaKm2(33.6, 0), 123_700, 2e-3)
    expectClose(horizonAreaKm2(62.7, 0.68), separateAreaKm2(62.7, 0.68))
  })
  it('goes as the square of the mass', () => {
    expectClose(horizonAreaKm2(20, 0.3) / horizonAreaKm2(10, 0.3), 4, 1e-9)
  })
  it('falls as the spin rises, to just over half at spin 0.99', () => {
    expect(horizonAreaKm2(10, 0.5)).toBeLessThan(horizonAreaKm2(10, 0))
    expect(horizonAreaKm2(10, 0.9)).toBeLessThan(horizonAreaKm2(10, 0.5))
    expectClose(horizonAreaKm2(10, 0.99) / horizonAreaKm2(10, 0), 0.5705, 1e-3)
  })
})

describe('before and after (required tests 3 to 6)', () => {
  it('the area before is about 237,400 km2 (non-spinning) and 233,600 with spins of 0.25', () => {
    expectClose(totalAreaBeforeKm2(), 237_400, 2e-3)
    expectClose(totalAreaBeforeKm2([GW250114.initialSpinMax, GW250114.initialSpinMax]), 233_600, 2e-3)
    expectClose(totalAreaBeforeKm2(), separateAreaKm2(33.6, 0) + separateAreaKm2(32.2, 0))
  })
  it('the area after is about 373,400 km2 and follows the mass and the spin', () => {
    expectClose(areaAfterKm2(), 373_400, 2e-3)
    expectClose(areaAfterKm2(), separateAreaKm2(62.7, 0.68))
    expect(horizonAreaKm2(63.7, 0.68)).toBeGreaterThan(areaAfterKm2())
    expect(horizonAreaKm2(62.7, 0.69)).toBeLessThan(areaAfterKm2())
  })
  it('the change is about 1.57 (57 percent) by the formula and 400 / 240 = 1.67 by the press, and the two differ', () => {
    const f = areaChange()
    expect(f.ratio).toBeCloseTo(1.573, 2)
    expect(f.percent).toBeCloseTo(57.3, 0)
    const p = pressAreaChange()
    expect(p.ratio).toBeCloseTo(400 / 240, 12)
    expect(p.beforeKm2).toBe(240_000)
    expect(p.afterKm2).toBe(400_000)
    expect(p.ratio).not.toBeCloseTo(f.ratio, 1)
  })
  it('the mass radiated is 3.1 Suns, 4.7 percent', () => {
    expect(radiatedSolar()).toBe(3.1)
    expect(radiatedFraction()).toBeCloseTo(3.1 / 65.8, 12)
    expect(radiatedFraction()).toBeCloseTo(0.047, 3)
  })
  it('the mass falls while the area rises (the point of the experiment)', () => {
    expect(GW250114.finalMassSolar).toBeLessThan(33.6 + 32.2)
    expect(areaAfterKm2()).toBeGreaterThan(totalAreaBeforeKm2())
  })
})

describe('the ceiling and the trial merger (required tests 7 and 8)', () => {
  it('about 24 percent at the measured spin and about 29 percent with no spin', () => {
    expect(maxRadiatedFraction(0.68)).toBeCloseTo(0.24, 2)
    expect(maxRadiatedFraction(0)).toBeCloseTo(0.293, 3)
  })
  it('the no-spin ceiling for equal masses would be exactly 1 - 1/sqrt(2)', () => {
    // m1 = m2: M_f = sqrt(2) m, total 2 m, share = 1 - sqrt(2)/2. The unequal masses here give almost the same.
    expect(1 - Math.SQRT1_2).toBeCloseTo(0.2929, 4)
    expect(Math.abs(maxRadiatedFraction(0) - (1 - Math.SQRT1_2))).toBeLessThan(2e-3)
  })
  it('at the ceiling the area ratio is exactly 1, just below it above 1, just above it the area falls', () => {
    for (const spin of [0, 0.5, 0.68, 0.9]) {
      const c = maxRadiatedFraction(spin)
      expect(trialMerger(c, spin).ratio).toBeCloseTo(1, 9)
      expect(trialMerger(c - 0.01, spin).ratio).toBeGreaterThan(1)
      expect(trialMerger(c - 0.01, spin).areaWentDown).toBe(false)
      expect(trialMerger(c + 0.01, spin).ratio).toBeLessThan(1)
      expect(trialMerger(c + 0.01, spin).areaWentDown).toBe(true)
    }
  })
  it('the real settings give the real area after (4.7 percent is the rounded 4.71 percent) and the area does not go down', () => {
    const exact = trialMerger(radiatedFraction(), GW250114.finalSpin)
    expect(exact.areaAfterKm2).toBeCloseTo(areaAfterKm2(), 3)
    expect(exact.areaWentDown).toBe(false)
    expectClose(trialMerger(0.047, 0.68).areaAfterKm2, areaAfterKm2(), 5e-4)
  })
  it('30 percent at spin 0.68 would make the area go down', () => {
    const t = trialMerger(0.3, 0.68)
    expect(t.areaWentDown).toBe(true)
    expect(t.ratio).toBeLessThan(1)
    expect(t.massAfterSolar).toBeCloseTo(0.7 * 65.8, 9)
    expect(t.ceiling).toBeCloseTo(maxRadiatedFraction(0.68), 12)
  })
  it('more spin after means a smaller area for the same share', () => {
    expect(trialMerger(0.047, 0.9).areaAfterKm2).toBeLessThan(trialMerger(0.047, 0.5).areaAfterKm2)
  })
})

describe('the predictions (required test 9)', () => {
  it('the direction answer is "up" and the size answer is 1.6, against both the formula and the press ratio', () => {
    expect(directionAnswer()).toBe('up')
    expect(sizeAnswer()).toBe(1.6)
    // The nearest button is 1.6 whichever of the two real ratios is used (1.57 or 1.67): neither is nearer to 1.05 or 6.
    for (const r of [areaChange().ratio, pressAreaChange().ratio]) {
      const nearest = [...SIZE_CHOICES].sort((a, b) => Math.abs(Math.log(a / r)) - Math.abs(Math.log(b / r)))[0]
      expect(nearest).toBe(1.6)
    }
  })
  it('the nearest button uses a log scale: 2.5 is nearest 1.6, and 3.2 is nearest 6 (a plain-distance rule would say 1.6)', () => {
    expect(sizeAnswer(2.5)).toBe(1.6)
    expect(sizeAnswer(3.2)).toBe(6)
    expect(sizeAnswer(1.02)).toBe(1.05)
    expect(sizeAnswer(0.97)).toBe(0.95)
    expect(sizeAnswer(0.4)).toBe(0.6)
    expect(sizeAnswer(0.3)).toBe(0.17)
  })
  it('the buttons are balanced: as many below 1 as above, each mirrored on a log scale to within 5 percent', () => {
    const below = SIZE_CHOICES.filter((c) => c < 1)
    const above = SIZE_CHOICES.filter((c) => c > 1)
    expect(below.length).toBe(above.length)
    const mirrored = [...below].reverse().map((c) => 1 / c).sort((a, b) => a - b)
    mirrored.forEach((m, i) => expect(Math.abs(m / above[i] - 1)).toBeLessThan(0.05))
  })
  it('the guess markers sit in the right places', () => {
    expect(directionMarker('down')).toBe(-1)
    expect(directionMarker('same')).toBe(0)
    expect(directionMarker('up')).toBe(1)
    expect(guessAreaAfterKm2(1.05)).toBeCloseTo(1.05 * totalAreaBeforeKm2(), 6)
    expect(guessAreaAfterKm2(1.6)).toBeCloseTo(1.6 * totalAreaBeforeKm2(), 6)
    expect(guessAreaAfterKm2(6)).toBeCloseTo(6 * totalAreaBeforeKm2(), 6)
    for (const c of [0.17, 0.6, 0.95] as const) {
      expect(guessAreaAfterKm2(c)).toBeCloseTo(c * totalAreaBeforeKm2(), 6)
      expect(guessAreaAfterKm2(c)).toBeLessThan(totalAreaBeforeKm2())
    }
    for (const c of [1.05, 1.6, 6] as const) expect(guessAreaAfterKm2(c)).toBeGreaterThan(totalAreaBeforeKm2())
    expect(guessAreaAfterKm2(1.05)).toBeLessThan(guessAreaAfterKm2(1.6))
  })
})

describe('the published data the introduction quotes', () => {
  it('records the event as read from the sources', () => {
    expect(GW250114.massesSolar).toEqual([33.6, 32.2])
    expect(GW250114.signalToNoise).toBe(80)
    expect(GW250114.strongerThanPreviousBest).toEqual([3, 4])
    expect(GW250114.distanceBillionLightYears).toBe(1.14)
    expect(GW250114.detected).toBe('14 January 2025')
    expect(GW250114.radiatedUncertaintySolar).toBe(2.2)
  })
})

describe('imports (required test 10)', () => {
  it('imports only the Black Holes 1 and Black Holes 8 modules', () => {
    const source = readFileSync(new URL('./horizonAreaLaw.ts', import.meta.url), 'utf8')
    const imports = [...source.matchAll(/^import\b[^\n]*?['"]([^'"]+)['"]\s*$/gm)].map((m) => m[1])
    expect(imports.sort()).toEqual(['./blackHoleSizeExperiment', './spinningBlackHoleExperiment'])
  })
})

describe('out-of-range inputs (required test 11)', () => {
  it('throws RangeError for bad masses, spins and shares', () => {
    expect(() => horizonAreaKm2(0, 0)).toThrow(RangeError)
    expect(() => horizonAreaKm2(-1, 0)).toThrow(RangeError)
    expect(() => horizonAreaKm2(Number.NaN, 0)).toThrow(RangeError)
    expect(() => horizonAreaKm2(10, 1)).toThrow(RangeError)
    expect(() => horizonAreaKm2(10, -0.1)).toThrow(RangeError)
    expect(() => maxRadiatedFraction(1)).toThrow(RangeError)
    expect(() => trialMerger(-0.01, 0.5)).toThrow(RangeError)
    expect(() => trialMerger(1, 0.5)).toThrow(RangeError)
    expect(() => trialMerger(0.1, 1.2)).toThrow(RangeError)
    expect(() => trialMerger(Number.POSITIVE_INFINITY, 0.5)).toThrow(RangeError)
  })
  it('a share of 0 is allowed (the first control button)', () => {
    expect(trialMerger(0, 0.5).massAfterSolar).toBeCloseTo(65.8, 9)
  })
})

describe('runHorizonAreaLaw (required test 12)', () => {
  it('gives the real values, the same for every setting', () => {
    const base = runHorizonAreaLaw({ sharePercent: 4.7, spinAfter: 0.68 }).real
    expect(base.massBeforeSolar).toBe(65.8)
    expect(base.radiatedSolar).toBe(3.1)
    expectClose(base.areaBeforeKm2, 237_400, 2e-3)
    expectClose(base.areaAfterKm2, 373_400, 2e-3)
    expect(base.ceilingAtMeasuredSpin).toBeCloseTo(0.24, 2)
    expect(base.ceilingNoSpin).toBeCloseTo(0.293, 3)
    for (const share of SHARE_CHOICES_PERCENT) {
      for (const spin of SPIN_CHOICES) {
        expect(runHorizonAreaLaw({ sharePercent: share, spinAfter: spin }).real).toEqual(base)
      }
    }
  })
  it('every control setting (six shares by four spins) matches a separate calculation and is never NaN', () => {
    const before = separateAreaKm2(33.6, 0) + separateAreaKm2(32.2, 0)
    for (const share of SHARE_CHOICES_PERCENT) {
      for (const spin of SPIN_CHOICES) {
        const t = runHorizonAreaLaw({ sharePercent: share, spinAfter: spin }).trial
        const mass = (1 - share / 100) * 65.8
        const area = separateAreaKm2(mass, spin)
        expectClose(t.areaAfterKm2, area)
        expectClose(t.ratio, area / before)
        expect(t.areaWentDown).toBe(area < before)
        for (const v of [t.areaAfterKm2, t.ratio, t.ceiling, t.massAfterSolar]) expect(Number.isNaN(v)).toBe(false)
      }
    }
  })
  it('the real settings do not go down and a 30 percent merger does at the measured spin', () => {
    expect(runHorizonAreaLaw({ sharePercent: 4.7, spinAfter: 0.68 }).trial.areaWentDown).toBe(false)
    expect(runHorizonAreaLaw({ sharePercent: 30, spinAfter: 0.68 }).trial.areaWentDown).toBe(true)
    // At spin 0.9 the ceiling is about 16.5 percent, so 20 percent is too much and 10 is not.
    expect(runHorizonAreaLaw({ sharePercent: 20, spinAfter: 0.9 }).trial.areaWentDown).toBe(true)
    expect(runHorizonAreaLaw({ sharePercent: 10, spinAfter: 0.9 }).trial.areaWentDown).toBe(false)
  })
})

describe('the numbers the pictures draw', () => {
  it('Picture 1: the masses, the 3.1 Suns that left and its 4.7 percent', () => {
    const m = massPicture()
    expect(m.massesBeforeSolar).toEqual([33.6, 32.2])
    expect(m.totalBeforeSolar).toBe(65.8)
    expect(m.massAfterSolar).toBe(62.7)
    expect(m.radiatedSolar).toBe(3.1)
    expect(m.massAfterSolar + m.radiatedSolar).toBeCloseTo(m.totalBeforeSolar, 9)
    expect(m.radiatedPercent).toBeCloseTo(4.711, 2)
    expect(m.spinAfter).toBe(0.68)
    expect(m.spinBeforeMax).toBe(0.25)
  })
  it('Picture 2: the two segments add up to the total before, which is below the area after and the scale', () => {
    const a = areaPicture()
    expect(a.segmentsBeforeKm2[0] + a.segmentsBeforeKm2[1]).toBeCloseTo(a.totalBeforeKm2, 6)
    expectClose(a.segmentsBeforeKm2[0], separateAreaKm2(33.6, 0))
    expectClose(a.segmentsBeforeKm2[1], separateAreaKm2(32.2, 0))
    expect(a.segmentsBeforeKm2[0]).toBeGreaterThan(a.segmentsBeforeKm2[1])
    expect(a.afterKm2).toBeGreaterThan(a.totalBeforeKm2)
    expect(a.afterKm2).toBeLessThan(a.axisMaxKm2)
    expect(a.axisMaxKm2).toBe(AREA_AXIS_MAX_KM2)
    expect([a.pressBeforeKm2, a.pressAfterKm2]).toEqual([240_000, 400_000])
    expect(a.spinsLowerBeforeByPercent).toBeCloseTo(1.6, 1)
  })
  it('the guess bar follows the guess and is cut off at the top of the scale only when it would run off', () => {
    const before = totalAreaBeforeKm2()
    for (const c of SIZE_CHOICES) expect(guessBar(c).areaKm2).toBeCloseTo(c * before, 6)
    expect(guessBar(1.6).offScale).toBe(false)
    expect(guessBar(1.6).drawnKm2).toBeCloseTo(1.6 * before, 6)
    expect(guessBar(6).offScale).toBe(true)
    expect(guessBar(6).drawnKm2).toBe(AREA_AXIS_MAX_KM2)
    expect(guessBar(6).areaKm2).toBeGreaterThan(AREA_AXIS_MAX_KM2)
    expect(guessBar(0.17).drawnKm2).toBeLessThan(guessBar(0.6).drawnKm2)
  })
  it('Picture 3: the curves start at the ratio for no radiation, cross 1 at the ceilings, and the real point sits on the measured-spin curve', () => {
    const c = ceilingPicture()
    expect(c.measuredSpin[0].sharePercent).toBe(0)
    expect(c.measuredSpin[0].ratio).toBeCloseTo(trialMerger(0, 0.68).ratio, 12)
    expect(c.noSpin[0].ratio).toBeGreaterThan(c.measuredSpin[0].ratio)
    expect(c.measuredSpin[c.measuredSpin.length - 1].sharePercent).toBeCloseTo(35, 9)
    // The curves fall as the share rises.
    for (let i = 1; i < c.measuredSpin.length; i++) expect(c.measuredSpin[i].ratio).toBeLessThan(c.measuredSpin[i - 1].ratio)
    // A point below the ceiling is above 1, above it below 1.
    for (const [curve, ceiling] of [[c.measuredSpin, c.ceilingMeasuredSpinPercent], [c.noSpin, c.ceilingNoSpinPercent]] as const) {
      for (const p of curve) expect(p.ratio > 1).toBe(p.sharePercent < ceiling)
    }
    expect(c.ceilingMeasuredSpinPercent).toBeCloseTo(24.0, 0)
    expect(c.ceilingNoSpinPercent).toBeCloseTo(29.3, 1)
    expect(c.real.sharePercent).toBeCloseTo(4.711, 2)
    expect(c.real.ratio).toBeCloseTo(areaChange().ratio, 12)
    expectClose(trialMerger(c.real.sharePercent / 100, 0.68).ratio, c.real.ratio, 1e-9)
    // Every point stays inside the picture's vertical scale.
    for (const p of [...c.measuredSpin, ...c.noSpin]) expect(p.ratio).toBeLessThan(c.ratioMax)
  })
})

describe('areaSteps (the worked moments in the captions)', () => {
  it('multiplies out to the area, step by step, against a separate calculation', () => {
    const a = areaSteps(33.6, 0)
    expect(a.gmKm).toBeCloseTo(49.62, 1)
    expect(a.gmSquaredKm2).toBeCloseTo(a.gmKm ** 2, 9)
    expect(a.sixteenPi).toBeCloseTo(50.265, 3)
    expect(a.h).toBe(1)
    expect(a.gmSquaredKm2 * a.sixteenPi * a.h).toBeCloseTo(a.areaKm2, 6)
    expectClose(a.areaKm2, separateAreaKm2(33.6, 0))
    const b = areaSteps(62.7, 0.68)
    expect(b.h).toBeCloseTo(0.8666, 3)
    expect(b.gmSquaredKm2 * b.sixteenPi * b.h).toBeCloseTo(b.areaKm2, 6)
    expectClose(b.areaKm2, 373_400, 2e-3)
  })
})

describe('the trial drawing (Step 5)', () => {
  it('the headroom is the ceiling minus the share, and is negative when a trial goes past the ceiling', () => {
    const t = trialMerger(0.1, 0.68)
    expect(ceilingHeadroomPercent(t)).toBeCloseTo(maxRadiatedFraction(0.68) * 100 - 10, 9)
    expect(ceilingHeadroomPercent(t)).toBeGreaterThan(0)
    expect(ceilingHeadroomPercent(trialMerger(0.3, 0.68))).toBeLessThan(0)
    expect(ceilingHeadroomPercent(trialMerger(maxRadiatedFraction(0.5), 0.5))).toBeCloseTo(0, 9)
  })
  it('the headroom is negative exactly when the area went down', () => {
    for (const share of SHARE_CHOICES_PERCENT) {
      for (const spin of SPIN_CHOICES) {
        const t = trialMerger(share / 100, spin)
        expect(ceilingHeadroomPercent(t) < 0).toBe(t.areaWentDown)
      }
    }
  })
  it('trial over real after is 1 for the real settings and follows the area otherwise', () => {
    expect(trialOverRealAfter(trialMerger(radiatedFraction(), 0.68))).toBeCloseTo(1, 9)
    const t = trialMerger(0, 0)
    expect(trialOverRealAfter(t)).toBeCloseTo(t.areaAfterKm2 / areaAfterKm2(), 12)
    expect(trialOverRealAfter(t)).toBeGreaterThan(1)
  })
  it('the drawing scale holds the largest trial and the real bars', () => {
    expect(trialMerger(0, 0).areaAfterKm2).toBeLessThan(TRIAL_AXIS_MAX_KM2)
    expect(totalAreaBeforeKm2()).toBeLessThan(TRIAL_AXIS_MAX_KM2)
    for (const share of SHARE_CHOICES_PERCENT) for (const spin of SPIN_CHOICES) expect(trialMerger(share / 100, spin).areaAfterKm2).toBeLessThan(TRIAL_AXIS_MAX_KM2)
  })
})

describe('the results check-up (Step 6)', () => {
  it('the mass row: 65.8 before, 62.7 after, less by 4.7 percent', () => {
    const c = checkUp().mass
    expect(c.beforeSolar).toBe(65.8)
    expect(c.afterSolar).toBe(62.7)
    expect(c.lessByPercent).toBeCloseTo((3.1 / 65.8) * 100, 9)
  })
  it('the area rows compare the formula with the press figures, with the sign of the gap', () => {
    const c = checkUp()
    expect(c.areaBefore.pressOverFormulaPercent).toBeCloseTo((240_000 / totalAreaBeforeKm2() - 1) * 100, 9)
    expect(c.areaBefore.pressOverFormulaPercent).toBeCloseTo(1.1, 1)
    expect(c.areaAfter.pressOverFormulaPercent).toBeCloseTo((400_000 / areaAfterKm2() - 1) * 100, 9)
    expect(c.areaAfter.pressOverFormulaPercent).toBeCloseTo(7.1, 1)
    expect(c.areaBefore.pressOverFormulaPercent).toBeGreaterThan(0)
    expect(c.areaAfter.pressOverFormulaPercent).toBeGreaterThan(c.areaBefore.pressOverFormulaPercent)
  })
  it('the change row has both ratios, each above 1, and they differ', () => {
    const c = checkUp().areaChange
    expect(c.formulaRatio).toBeCloseTo(1.573, 2)
    expect(c.pressRatio).toBeCloseTo(400 / 240, 12)
    expect(c.formulaPercent).toBeCloseTo(57.3, 0)
    expect(c.pressPercent).toBeCloseTo(66.7, 1)
    expect(c.formulaRatio).toBeGreaterThan(1)
    expect(c.pressRatio).toBeGreaterThan(c.formulaRatio)
  })
  it('the ceiling row: 4.7 percent against 24.0, about a fifth, about 5 times below', () => {
    const c = checkUp().ceiling
    expect(c.sharePercent).toBeCloseTo(4.711, 2)
    expect(c.ceilingPercent).toBeCloseTo(24.0, 0)
    expect(c.shareOverCeiling).toBeCloseTo(c.sharePercent / c.ceilingPercent, 12)
    expect(c.shareOverCeiling).toBeCloseTo(0.196, 2)
    expect(c.ceilingOverShare).toBeCloseTo(5.1, 1)
    expect(c.shareOverCeiling * c.ceilingOverShare).toBeCloseTo(1, 12)
  })
})

describe('the tutor numbers (Step 7)', () => {
  it('direction: only "up" matches', () => {
    expect(directionGuessResult('up')).toEqual({ matched: true, real: 'up' })
    expect(directionGuessResult('down').matched).toBe(false)
    expect(directionGuessResult('same').matched).toBe(false)
    expect(directionGuessResult('down').real).toBe('up')
  })
  it('size: only 1.6 matches; the gap is how many times the guess is from the real 1.57, on either side', () => {
    const real = areaChange().ratio
    for (const c of SIZE_CHOICES) expect(sizeGuessGap(c).matched).toBe(c === 1.6)
    expect(sizeGuessGap(1.6).verdict).toBe('matched')
    expect(sizeGuessGap(0.6).verdict).toBe('below')
    expect(sizeGuessGap(0.6).times).toBeCloseTo(real / 0.6, 12)
    expect(sizeGuessGap(6).verdict).toBe('above')
    expect(sizeGuessGap(6).times).toBeCloseTo(6 / real, 12)
    expect(sizeGuessGap(6).times).toBeCloseTo(3.81, 1)
    for (const c of SIZE_CHOICES) expect(sizeGuessGap(c).times).toBeGreaterThanOrEqual(1)
    expect(sizeGuessGap(1.05).realRatio).toBe(real)
  })
  it('area scaling: the squares of the masses, and the same ratio as the area change', () => {
    const w = areaScalingWorked()
    expect(w.squaresBefore[0]).toBeCloseTo(1128.96, 6)
    expect(w.squaresBefore[1]).toBeCloseTo(1036.84, 6)
    expect(w.sumOfSquares).toBeCloseTo(2165.8, 6)
    expect(w.totalMassSquared).toBeCloseTo(65.8 ** 2, 9)
    expect(w.ratioNoLossNoSpin).toBeCloseTo(2.0, 2)
    expect(w.afterMassSquared).toBeCloseTo(62.7 ** 2, 9)
    expect(w.spinFactorAfter).toBeCloseTo(0.8666, 3)
    expect(w.ratio).toBeCloseTo(areaChange().ratio, 9)
    // The one black hole's mass squared is more than the sum of the two squares, even after losing mass.
    expect(w.afterMassSquared).toBeGreaterThan(w.sumOfSquares)
    expect(w.afterMassSquared).toBeLessThan(w.totalMassSquared)
  })
  it('raindrops lose surface and black holes gain it, for equal masses', () => {
    expect(raindropMergerRatio()).toBeCloseTo(0.7937, 3)
    expect(raindropMergerRatio()).toBeLessThan(1)
    expect(blackHoleEqualMergerRatio()).toBe(2)
  })
  it('the ceiling worked step by step matches maxRadiatedFraction', () => {
    const w = ceilingWorked(0.68)
    expect(w.minMassAfterSolar).toBeCloseTo(49.99, 1)
    expect(w.sharePercent).toBeCloseTo(24.0, 0)
    expect(w.sharePercent).toBeCloseTo((1 - w.minMassAfterSolar / w.massBeforeSolar) * 100, 9)
    expect(w.sharePercent).toBeCloseTo(maxRadiatedFraction(0.68) * 100, 9)
    expect(ceilingWorked(0).minMassAfterSolar).toBeCloseTo(Math.sqrt(33.6 ** 2 + 32.2 ** 2), 9)
    expect(ceilingWorked(0).sharePercent).toBeCloseTo(29.3, 1)
    // The area at the smallest mass after equals the area before.
    expect(horizonAreaKm2(w.minMassAfterSolar, 0.68)).toBeCloseTo(totalAreaBeforeKm2(), 3)
  })
})
