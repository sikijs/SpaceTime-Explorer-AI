import { describe, expect, it } from 'vitest'
import {
  ATOM_ANSWER_CHOICES,
  ELEMENT_TESTS,
  TUTOR_LONG_WAIT_S,
  atomGuessResult,
  shareGuessResult,
  tutorFigures,
  SENSITIVITY_TEMPERATURES_MEV,
  heliumShareForTemperature,
  certaintyRows,
  lithiumGapOverGiveOrTake,
  ownReading,
  pairReading,
  resultsCheckUp,
  stepsTable,
  PRESET_MASS_DIFFERENCE_ID,
  PRESET_WAIT_S,
  TRIAL_AXIS_MAX_ATOMS,
  TRIAL_AXIS_MAX_NEUTRONS_PER_PROTON,
  TRIAL_AXIS_MIN_ATOMS,
  settingsFromChoices,
  trialFigures,
  SAMPLE_NUCLEONS,
  atomGuessValue,
  atomRows,
  gapBetween,
  massRows,
  nucleonSample,
  shareGuessPercent,
  testOverlap,
  timeline,
  BARYON_DENSITY_OMEGA_B_H2,
  COMPARE_RELATIVE_TOLERANCE,
  DEUTERIUM_OBSERVED_E5,
  DEUTERIUM_THEORY_E5,
  FREEZE_OUT_KT_MEV,
  FREEZE_OUT_TIME_S,
  HELIUM_EMPRESS_VERSION_ONE,
  HELIUM_OBSERVED_EMPRESS,
  HELIUM_OBSERVED_LBT,
  HELIUM_THEORY,
  HELIUM_TO_HYDROGEN_WEIGHT,
  LITHIUM_OBSERVED_E10,
  LITHIUM_OBSERVED_E10_2013,
  LITHIUM_THEORY_E10,
  LITHIUM_THEORY_E10_2013,
  MASS_DIFFERENCE_CHOICES,
  NEUTRON_LIFETIME_BOTTLE_S,
  NEUTRON_LIFETIME_IN_BEAM_S,
  NEUTRON_LIFETIME_S,
  NEUTRON_PROTON_MASS_DIFFERENCE_MEV,
  REAL_SETTINGS,
  REAL_WAIT_S,
  SHARE_ANSWER_CHOICES,
  WAIT_CHOICES_S,
  atomAnswerIdFor,
  compare,
  heliumAtomsPerHundredHydrogen,
  heliumMassShare,
  insideGiveOrTake,
  observedAtomsPerHundredHydrogen,
  neutronsPerProtonAfterWait,
  neutronsPerProtonAtFreezeOut,
  predictionOneAnswerId,
  predictionOverObservation,
  predictionTwoAnswerId,
  rangesOverlap,
  recipe,
  shareAnswerIdFor,
} from './earlyUniverseRecipe'

// A separate calculation, written here and not taken from the module (test 7).
function separateHeliumShare(q: number, kt: number, waitS: number): number {
  const x = Math.exp(-q / kt) * Math.exp(-(waitS - 1) / 878.4)
  return (2 * x) / (1 + x)
}

describe('constants (test 1)', () => {
  it('are stored as specified', () => {
    expect(NEUTRON_PROTON_MASS_DIFFERENCE_MEV).toBe(1.29333)
    expect(NEUTRON_LIFETIME_S).toBe(878.4)
    expect(FREEZE_OUT_TIME_S).toBe(1)
    expect(REAL_WAIT_S).toBe(180)
    expect(HELIUM_TO_HYDROGEN_WEIGHT).toBe(4)
  })
})

describe('the two neutron-lifetime experiments (NIST)', () => {
  it('are stored as quoted and disagree by about 9 seconds, with the model value near the bottle one', () => {
    expect(NEUTRON_LIFETIME_IN_BEAM_S).toBe(887.7)
    expect(NEUTRON_LIFETIME_BOTTLE_S).toBe(878.5)
    expect(NEUTRON_LIFETIME_IN_BEAM_S - NEUTRON_LIFETIME_BOTTLE_S).toBeCloseTo(9.2, 10)
    expect(Math.abs(NEUTRON_LIFETIME_S - NEUTRON_LIFETIME_BOTTLE_S)).toBeLessThan(0.2)
  })
})

describe('the neutron share at freeze-out (test 2)', () => {
  it('is exp(-Q / kT)', () => {
    expect(neutronsPerProtonAtFreezeOut(1, 1)).toBeCloseTo(Math.exp(-1), 12)
    expect(neutronsPerProtonAtFreezeOut()).toBeCloseTo(Math.exp(-1.29333 / FREEZE_OUT_KT_MEV), 12)
  })
  it('rises with temperature and falls with the mass difference', () => {
    expect(neutronsPerProtonAtFreezeOut(1.29333, 0.8)).toBeGreaterThan(neutronsPerProtonAtFreezeOut(1.29333, 0.72))
    expect(neutronsPerProtonAtFreezeOut(1.29333, 0.72)).toBeGreaterThan(neutronsPerProtonAtFreezeOut(1.29333, 0.5))
    expect(neutronsPerProtonAtFreezeOut(2.58666)).toBeLessThan(neutronsPerProtonAtFreezeOut(1.29333))
    expect(neutronsPerProtonAtFreezeOut(0.646665)).toBeGreaterThan(neutronsPerProtonAtFreezeOut(1.29333))
  })
  it('is 1 when there is no mass difference', () => {
    expect(neutronsPerProtonAtFreezeOut(0, 1)).toBe(1)
  })
  it('rejects a bad temperature or a negative difference', () => {
    expect(() => neutronsPerProtonAtFreezeOut(1.29333, 0)).toThrow(RangeError)
    expect(() => neutronsPerProtonAtFreezeOut(-1, 1)).toThrow(RangeError)
  })
})

describe('decay while waiting (test 3)', () => {
  it('is unchanged at the freeze-out time', () => {
    expect(neutronsPerProtonAfterWait(0.2, FREEZE_OUT_TIME_S)).toBe(0.2)
  })
  it('falls to 1/e after one lifetime', () => {
    expect(neutronsPerProtonAfterWait(0.2, FREEZE_OUT_TIME_S + NEUTRON_LIFETIME_S)).toBeCloseTo(0.2 / Math.E, 12)
  })
  it('halves after one lifetime times ln 2', () => {
    expect(neutronsPerProtonAfterWait(0.2, FREEZE_OUT_TIME_S + NEUTRON_LIFETIME_S * Math.LN2)).toBeCloseTo(0.1, 12)
  })
  it('rejects a wait that ends before freeze-out', () => {
    expect(() => neutronsPerProtonAfterWait(0.2, 0.5)).toThrow(RangeError)
  })
})

describe('the helium share by mass (test 4)', () => {
  it('is 0.25 for one neutron per seven protons', () => {
    expect(heliumMassShare(1 / 7)).toBeCloseTo(0.25, 12)
  })
  it('is 0 with no neutrons and 1 with equal numbers', () => {
    expect(heliumMassShare(0)).toBe(0)
    expect(heliumMassShare(1)).toBe(1)
  })
  it('rises with the neutron share', () => {
    expect(heliumMassShare(0.2)).toBeGreaterThan(heliumMassShare(0.1))
  })
})

describe('helium atoms per 100 hydrogen atoms (test 5)', () => {
  it('is 8.15 for the observed share 0.2458', () => {
    expect(heliumAtomsPerHundredHydrogen(HELIUM_OBSERVED_LBT.value)).toBeCloseTo(8.15, 2)
  })
  it('is 0 for no helium and 25 for a share of 0.5 ... uses the weight 4', () => {
    expect(heliumAtomsPerHundredHydrogen(0)).toBe(0)
    // share 0.5: 0.5 of the mass is helium (0.125 weight units of 4) per 0.5 hydrogen: 25 per 100.
    expect(heliumAtomsPerHundredHydrogen(0.5)).toBeCloseTo(25, 10)
  })
  it('is not what a weight of 1 or 2 would give', () => {
    const share = 0.2458
    expect(heliumAtomsPerHundredHydrogen(share)).not.toBeCloseTo((100 * share) / (1 - share), 2)
    expect(heliumAtomsPerHundredHydrogen(share)).not.toBeCloseTo((100 * (share / 2)) / (1 - share), 2)
  })
  it('rejects a share outside 0 to below 1', () => {
    expect(() => heliumAtomsPerHundredHydrogen(1)).toThrow(RangeError)
    expect(() => heliumAtomsPerHundredHydrogen(-0.1)).toThrow(RangeError)
  })
})

describe('monotonic behaviour (test 6)', () => {
  it('a longer wait gives less helium', () => {
    const shares = WAIT_CHOICES_S.map((waitS) => recipe({ waitS, massDifferenceFactor: 1 }).heliumMassShare)
    for (let i = 1; i < shares.length; i++) expect(shares[i]).toBeLessThan(shares[i - 1])
  })
  it('a larger mass difference gives less helium', () => {
    const shares = MASS_DIFFERENCE_CHOICES.map((c) => recipe({ waitS: REAL_WAIT_S, massDifferenceFactor: c.factor }).heliumMassShare)
    for (let i = 1; i < shares.length; i++) expect(shares[i]).toBeLessThan(shares[i - 1])
  })
  it('helium is never below 0 or above 1', () => {
    for (const waitS of WAIT_CHOICES_S) for (const c of MASS_DIFFERENCE_CHOICES) {
      const r = recipe({ waitS, massDifferenceFactor: c.factor })
      expect(r.heliumMassShare).toBeGreaterThan(0)
      expect(r.heliumMassShare).toBeLessThan(1)
      expect(r.heliumMassShare + r.hydrogenMassShare).toBeCloseTo(1, 12)
    }
  })
})

describe('the whole recipe against a separate calculation (test 7)', () => {
  it('agrees at every control setting to 1 part in a million', () => {
    for (const waitS of WAIT_CHOICES_S) for (const c of MASS_DIFFERENCE_CHOICES) {
      const r = recipe({ waitS, massDifferenceFactor: c.factor })
      const expected = separateHeliumShare(NEUTRON_PROTON_MASS_DIFFERENCE_MEV * c.factor, FREEZE_OUT_KT_MEV, waitS)
      expect(Math.abs(r.heliumMassShare - expected) / expected).toBeLessThan(1e-6)
    }
  })
  it('gives the illustrative figures in the specification at the real settings and at 600 s and 1,200 s', () => {
    const real = recipe(REAL_SETTINGS)
    expect(real.neutronsPerProton).toBeCloseTo(0.135, 3)
    expect(real.neutronsPerProtonAsOneIn).toBeCloseTo(7.39, 2)
    expect(real.heliumMassShare).toBeCloseTo(0.238, 3)
    expect(recipe({ waitS: 60, massDifferenceFactor: 1 }).heliumMassShare).toBeCloseTo(0.269, 3)
    expect(recipe({ waitS: 600, massDifferenceFactor: 1 }).heliumMassShare).toBeCloseTo(0.155, 3)
    expect(recipe({ waitS: 1200, massDifferenceFactor: 1 }).heliumMassShare).toBeCloseTo(0.081, 3)
  })
  it('reports the share of freeze-out neutrons left', () => {
    expect(recipe(REAL_SETTINGS).neutronsLeftFraction).toBeCloseTo(Math.exp(-179 / 878.4), 12)
  })
  it('uses the chosen mass difference for the trial values', () => {
    expect(recipe({ waitS: 180, massDifferenceFactor: 2 }).massDifferenceMeV).toBeCloseTo(2.58666, 10)
  })
})

describe('the stored published figures (test 8)', () => {
  it('are as quoted', () => {
    expect(HELIUM_OBSERVED_LBT).toEqual({ value: 0.2458, giveOrTake: 0.0013 })
    expect(HELIUM_OBSERVED_EMPRESS).toEqual({ value: 0.2402, giveOrTake: 0.004 })
    expect(HELIUM_THEORY).toEqual({ value: 0.2467, giveOrTake: 0.0002 })
    expect(DEUTERIUM_OBSERVED_E5).toEqual({ value: 2.508, giveOrTake: 0.029 })
    expect(DEUTERIUM_THEORY_E5).toEqual({ value: 2.445, giveOrTake: 0.038 })
    expect(LITHIUM_OBSERVED_E10).toEqual({ value: 1.45, giveOrTake: 0.25 })
    expect(LITHIUM_THEORY_E10).toEqual({ value: 5.523, giveOrTake: 0.196 })
    expect(BARYON_DENSITY_OMEGA_B_H2).toBe(0.02237)
    expect(LITHIUM_THEORY_E10_2013.value).toBe(4.89)
    expect(LITHIUM_OBSERVED_E10_2013.value).toBe(1.58)
  })
})

describe('comparison helpers (test 9)', () => {
  it('compare says the same, more or less', () => {
    expect(compare(1, 1)).toBe('the same')
    expect(compare(1.1, 1)).toBe('more')
    expect(compare(0.9, 1)).toBe('less')
  })
  it('a tenfold wider tolerance would fail: a value a little off is not "the same"', () => {
    // 10x the tolerance is still far smaller than this difference; the helper must not call it the same.
    expect(compare(1 + 10 * COMPARE_RELATIVE_TOLERANCE * 100, 1)).toBe('more')
    expect(COMPARE_RELATIVE_TOLERANCE).toBe(1e-9)
  })
  it('insideGiveOrTake uses the reference give-or-take only', () => {
    expect(insideGiveOrTake(0.2467, HELIUM_OBSERVED_LBT)).toBe(true) // |0.2467 - 0.2458| = 0.0009 <= 0.0013
    expect(insideGiveOrTake(0.249, HELIUM_OBSERVED_LBT)).toBe(false) // 0.0032 > 0.0013
  })
  it('rangesOverlap adds both give-or-takes', () => {
    expect(rangesOverlap(HELIUM_OBSERVED_LBT, HELIUM_THEORY)).toBe(true)
    expect(rangesOverlap(DEUTERIUM_OBSERVED_E5, DEUTERIUM_THEORY_E5)).toBe(true)
    expect(rangesOverlap(LITHIUM_OBSERVED_E10, LITHIUM_THEORY_E10)).toBe(false)
    expect(rangesOverlap(LITHIUM_OBSERVED_E10_2013, LITHIUM_THEORY_E10_2013)).toBe(false)
  })
  it('a tenfold wider tolerance would change the lithium verdict', () => {
    const wider = (m: { value: number; giveOrTake: number }) => ({ value: m.value, giveOrTake: m.giveOrTake * 10 })
    expect(rangesOverlap(wider(LITHIUM_OBSERVED_E10), wider(LITHIUM_THEORY_E10))).toBe(true)
  })
})

describe('the lithium ratio (test 10)', () => {
  it('is 3.81 for the 2026 pair and 3.09 for the 2013 pair, not rounded', () => {
    expect(predictionOverObservation(LITHIUM_THEORY_E10, LITHIUM_OBSERVED_E10)).toBeCloseTo(3.8090, 3)
    expect(predictionOverObservation(LITHIUM_THEORY_E10_2013, LITHIUM_OBSERVED_E10_2013)).toBeCloseTo(3.0949, 3)
    expect(predictionOverObservation(LITHIUM_THEORY_E10, LITHIUM_OBSERVED_E10)).not.toBe(3)
  })
})

describe('the answers (test 11)', () => {
  it('Prediction 1 is about 25 percent and Prediction 2 is about 8', () => {
    expect(predictionOneAnswerId()).toBe('about-25')
    expect(predictionTwoAnswerId()).toBe('about-8')
  })
  it('the real count comes from the observed share (8.15), not from the tuned model (about 7.9)', () => {
    expect(observedAtomsPerHundredHydrogen()).toBeCloseTo(8.15, 2)
    expect(Math.abs(observedAtomsPerHundredHydrogen() - recipe().heliumAtomsPerHundredHydrogen)).toBeGreaterThan(0.1)
  })
  it('the buttons are the five specified', () => {
    expect(SHARE_ANSWER_CHOICES.map((c) => c.percent)).toEqual([1, 10, 25, 50, 75])
    expect(ATOM_ANSWER_CHOICES.map((c) => c.atoms)).toEqual([1, 8, 25, 50, 100])
  })
  it('the share is matched on a linear scale (16.5 percent is nearer 10 than 25 on that scale)', () => {
    expect(shareAnswerIdFor(0.165)).toBe('about-10')
    expect(shareAnswerIdFor(0.2458)).toBe('about-25')
    expect(shareAnswerIdFor(0.7)).toBe('about-75')
  })
  it('the atom count is matched on a log scale (15 is nearer 25 than 8 on that scale)', () => {
    expect(atomAnswerIdFor(15)).toBe('about-25')
    expect(atomAnswerIdFor(8.15)).toBe('about-8')
    expect(atomAnswerIdFor(0.9)).toBe('about-1')
  })
})

describe('the module has no memory (test 12)', () => {
  it('gives the same recipe twice and does not depend on anything a learner chooses', () => {
    const a = recipe({ waitS: 300, massDifferenceFactor: 0.5 })
    recipe({ waitS: 60, massDifferenceFactor: 2 })
    expect(recipe({ waitS: 300, massDifferenceFactor: 0.5 })).toEqual(a)
  })
})

describe('the guesses as numbers for the white marks', () => {
  it('turn each button into its value and reject an unknown one', () => {
    expect(SHARE_ANSWER_CHOICES.map((c) => shareGuessPercent(c.id))).toEqual([1, 10, 25, 50, 75])
    expect(ATOM_ANSWER_CHOICES.map((c) => atomGuessValue(c.id))).toEqual([1, 8, 25, 50, 100])
    expect(() => shareGuessPercent('nope')).toThrow(RangeError)
    expect(() => atomGuessValue('nope')).toThrow(RangeError)
  })
})

describe('the 200-particle sample', () => {
  it('has the counts the specification drew at the real settings', () => {
    const s = nucleonSample()
    expect(s.total).toBe(SAMPLE_NUCLEONS)
    expect(s.neutronsAtFreezeOut).toBe(28)
    expect(s.protonsAtFreezeOut).toBe(172)
    expect(s.neutronsAfterWait).toBe(24)
    expect(s.decayed).toBe(4)
    expect(s.heliumNuclei).toBe(12)
    expect(s.hydrogenNuclei).toBe(152)
    expect(s.heliumDots).toBe(48)
  })
  it('keeps every particle at every control setting', () => {
    for (const waitS of WAIT_CHOICES_S) for (const c of MASS_DIFFERENCE_CHOICES) {
      const s = nucleonSample({ waitS, massDifferenceFactor: c.factor })
      expect(s.neutronsAtFreezeOut + s.protonsAtFreezeOut).toBe(200)
      expect(s.neutronsAfterWait + s.protonsAfterWait).toBe(200)
      expect(s.heliumDots + s.hydrogenNuclei).toBe(200)
      expect(s.decayed).toBeGreaterThanOrEqual(0)
      expect(s.hydrogenNuclei).toBeGreaterThanOrEqual(0)
    }
  })
  it('agrees with the exact helium share to within the rounding of whole particles (0.03)', () => {
    for (const waitS of WAIT_CHOICES_S) for (const c of MASS_DIFFERENCE_CHOICES) {
      const settings = { waitS, massDifferenceFactor: c.factor }
      expect(Math.abs(nucleonSample(settings).heliumDots / 200 - recipe(settings).heliumMassShare)).toBeLessThan(0.03)
    }
  })
})

describe('the timeline', () => {
  it('has freeze-out, the end of the wait and one lifetime, and the wait is about a fifth of a lifetime', () => {
    const t = timeline()
    expect(t.freezeOutS).toBe(1)
    expect(t.waitEndS).toBe(180)
    expect(t.lifetimeS).toBe(878.4)
    expect(t.waitAsFractionOfLifetime).toBeCloseTo(0.2049, 4)
  })
})

describe('the rows of Pictures 2 and 3', () => {
  it('Picture 2 rows are in percent and in atoms, from the model and the published values', () => {
    const m = massRows()
    expect(m.map((r) => r.id)).toEqual(['model', 'lbt', 'empress', 'theory'])
    expect(m[0].value).toBeCloseTo(recipe().heliumMassShare * 100, 10)
    expect(m[1].value).toBeCloseTo(24.58, 10)
    expect(m[1].giveOrTake).toBeCloseTo(0.13, 10)
    expect(m[2].value).toBeCloseTo(24.02, 10)
    expect(m[3].value).toBeCloseTo(24.67, 10)
    const a = atomRows()
    expect(a[0].value).toBeCloseTo(recipe().heliumAtomsPerHundredHydrogen, 10)
    expect(a[1].value).toBeCloseTo(8.15, 2)
  })
  it('Picture 3 has the three elements, and only helium has a second team', () => {
    expect(ELEMENT_TESTS.map((t) => t.id)).toEqual(['helium', 'deuterium', 'lithium'])
    expect(ELEMENT_TESTS.filter((t) => t.otherObserved !== null).map((t) => t.id)).toEqual(['helium'])
  })
  it('the published calculation overlaps the measurement for helium (LBT) and deuterium, and not for lithium', () => {
    expect(ELEMENT_TESTS.map(testOverlap)).toEqual([true, true, false])
  })
  it('the other helium team does not overlap the published calculation', () => {
    expect(rangesOverlap(HELIUM_OBSERVED_EMPRESS, HELIUM_THEORY)).toBe(false)
  })
  it('gapBetween gives the difference and the combined give-or-take', () => {
    const g = gapBetween(DEUTERIUM_OBSERVED_E5, DEUTERIUM_THEORY_E5)
    expect(g.difference).toBeCloseTo(0.063, 10)
    expect(g.combinedGiveOrTake).toBeCloseTo(0.067, 10)
    const l = gapBetween(LITHIUM_THEORY_E10, LITHIUM_OBSERVED_E10)
    expect(l.difference).toBeCloseTo(4.073, 10)
    expect(l.combinedGiveOrTake).toBeCloseTo(0.446, 10)
  })
})

describe('Part 2: the trial settings and Drawing A', () => {
  it('the preset is the real settings', () => {
    expect(PRESET_WAIT_S).toBe(180)
    expect(PRESET_MASS_DIFFERENCE_ID).toBe('real')
    expect(settingsFromChoices(PRESET_WAIT_S, PRESET_MASS_DIFFERENCE_ID)).toEqual(REAL_SETTINGS)
  })
  it('turns each pair of buttons into settings and rejects a button that does not exist', () => {
    expect(settingsFromChoices(600, 'double')).toEqual({ waitS: 600, massDifferenceFactor: 2 })
    expect(settingsFromChoices(60, 'half')).toEqual({ waitS: 60, massDifferenceFactor: 0.5 })
    expect(() => settingsFromChoices(123, 'real')).toThrow(RangeError)
    expect(() => settingsFromChoices(180, 'triple' as never)).toThrow(RangeError)
  })
  it('at the preset the trial equals the real settings in every figure', () => {
    const f = trialFigures(REAL_SETTINGS)
    expect(f.trial).toEqual(f.real)
    expect(f.heliumTrialOverReal).toBe(1)
    expect(f.neutronsTrialOverReal).toBe(1)
    expect(f.trialHeliumPercent).toBeCloseTo(f.realHeliumPercent, 12)
  })
  it('the real settings in the figures never move with the trial settings', () => {
    const a = trialFigures({ waitS: 60, massDifferenceFactor: 0.5 }).real
    const b = trialFigures({ waitS: 1200, massDifferenceFactor: 2 }).real
    expect(a).toEqual(b)
    expect(a.heliumMassShare).toBeCloseTo(recipe(REAL_SETTINGS).heliumMassShare, 12)
  })
  it('gives the measured helium (24.58 percent, 8.15 atoms) beside the trial', () => {
    const f = trialFigures({ waitS: 300, massDifferenceFactor: 1 })
    expect(f.measuredHeliumPercent).toBeCloseTo(24.58, 10)
    expect(f.measuredAtomsPerHundred).toBeCloseTo(8.15, 2)
    expect(f.heliumTrialMinusMeasuredPoints).toBeCloseTo(f.trialHeliumPercent - 24.58, 10)
  })
  it('agrees with a separate calculation at all 15 settings', () => {
    for (const waitS of WAIT_CHOICES_S) for (const c of MASS_DIFFERENCE_CHOICES) {
      const f = trialFigures(settingsFromChoices(waitS, c.id))
      const expected = separateHeliumShare(NEUTRON_PROTON_MASS_DIFFERENCE_MEV * c.factor, FREEZE_OUT_KT_MEV, waitS)
      expect(Math.abs(f.trial.heliumMassShare - expected) / expected).toBeLessThan(1e-6)
      expect(f.heliumTrialOverReal).toBeCloseTo(expected / separateHeliumShare(NEUTRON_PROTON_MASS_DIFFERENCE_MEV, FREEZE_OUT_KT_MEV, 180), 6)
      expect(f.waitAsFractionOfLifetime).toBeCloseTo(waitS / 878.4, 12)
    }
  })
  it('keeps every setting inside Drawing A\'s rulers', () => {
    for (const waitS of WAIT_CHOICES_S) for (const c of MASS_DIFFERENCE_CHOICES) {
      const f = trialFigures(settingsFromChoices(waitS, c.id))
      expect(f.trial.neutronsPerProton).toBeLessThan(TRIAL_AXIS_MAX_NEUTRONS_PER_PROTON)
      expect(f.trial.heliumAtomsPerHundredHydrogen).toBeGreaterThan(TRIAL_AXIS_MIN_ATOMS)
      expect(f.trial.heliumAtomsPerHundredHydrogen).toBeLessThan(TRIAL_AXIS_MAX_ATOMS)
      expect(f.trialHeliumPercent).toBeLessThan(100)
    }
  })
  it('a longer wait lowers helium relative to the real settings, and a smaller difference raises it', () => {
    expect(trialFigures({ waitS: 600, massDifferenceFactor: 1 }).heliumTrialOverReal).toBeLessThan(1)
    expect(trialFigures({ waitS: 60, massDifferenceFactor: 1 }).heliumTrialOverReal).toBeGreaterThan(1)
    expect(trialFigures({ waitS: 180, massDifferenceFactor: 0.5 }).heliumTrialOverReal).toBeGreaterThan(1)
    expect(trialFigures({ waitS: 180, massDifferenceFactor: 2 }).heliumTrialOverReal).toBeLessThan(1)
  })
})

describe('Part 3: the check-up, the steps and how sure each number is', () => {
  it('reads "the same" only where the ranges overlap, and otherwise more or less', () => {
    const c = resultsCheckUp()
    expect(c.helium.reading).toBe('the same')
    expect(c.heliumEmpress.reading).toBe('less')
    expect(c.deuterium.reading).toBe('the same')
    expect(c.lithium.reading).toBe('less')
    expect(c.helium.overlap).toBe(true)
    expect(c.lithium.overlap).toBe(false)
  })
  it('has the differences and combined give-or-takes', () => {
    const c = resultsCheckUp()
    expect(c.helium.difference).toBeCloseTo(0.09, 8)
    expect(c.helium.combinedGiveOrTake).toBeCloseTo(0.15, 8)
    expect(c.heliumEmpress.difference).toBeCloseTo(0.65, 8)
    expect(c.heliumEmpress.combinedGiveOrTake).toBeCloseTo(0.42, 8)
    expect(c.lithium.difference).toBeCloseTo(4.073, 8)
    expect(c.lithiumRatio).toBeCloseTo(3.809, 3)
  })
  it('a pair that just touches counts as overlapping, and one just beyond does not', () => {
    expect(pairReading({ value: 1, giveOrTake: 0.1 }, { value: 1.2, giveOrTake: 0.1 }).overlap).toBe(true)
    expect(pairReading({ value: 1, giveOrTake: 0.1 }, { value: 1.2001, giveOrTake: 0.1 }).overlap).toBe(false)
    expect(pairReading({ value: 1, giveOrTake: 0.1 }, { value: 1.5, giveOrTake: 0.1 }).reading).toBe('more')
  })
  it('this page\'s own helium is less than the measured value by 0.74 points and is not inside its give-or-take', () => {
    const c = resultsCheckUp()
    expect(c.pageHelium.reading).toBe('less')
    expect(c.pageHelium.difference).toBeCloseTo(0.741, 3)
    expect(ownReading(24.6, { value: 24.58, giveOrTake: 0.13 }).reading).toBe('the same')
    expect(ownReading(24.8, { value: 24.58, giveOrTake: 0.13 }).reading).toBe('more')
  })
  it('this page\'s atoms per 100 hydrogen is less than the count from the measured share', () => {
    const c = resultsCheckUp()
    expect(c.pageAtoms.reading).toBe('less')
    expect(c.pageAtoms.value).toBeCloseTo(7.83, 1)
    expect(c.pageAtoms.measured.value).toBeCloseTo(8.15, 2)
  })
  it('the steps table matches the recipe at the real settings', () => {
    const t = stepsTable()
    expect(t.massDifferenceMeV).toBe(1.29333)
    expect(t.freezeOutKtMeV).toBe(0.72)
    expect(t.freezeOutOneIn).toBeCloseTo(6.03, 2)
    expect(t.waitS).toBe(180)
    expect(t.decaySeconds).toBe(179)
    expect(t.leftFraction).toBeCloseTo(Math.exp(-179 / 878.4), 12)
    expect(t.oneIn).toBeCloseTo(7.39, 2)
    expect(t.heliumShare).toBeCloseTo(0.2384, 3)
    expect(t.heliumShare + t.hydrogenShare).toBeCloseTo(1, 12)
    expect(t.heliumShare).toBeCloseTo((2 * t.neutronsPerProton) / (1 + t.neutronsPerProton), 12)
  })
  it('the steps table follows the settings it is given', () => {
    expect(stepsTable({ waitS: 600, massDifferenceFactor: 1 }).decaySeconds).toBe(599)
    expect(stepsTable({ waitS: 600, massDifferenceFactor: 1 }).heliumShare).toBeLessThan(stepsTable().heliumShare)
  })
  it('gives how sure each number is, as a percent of its value', () => {
    const rows = certaintyRows()
    const pct = (id: string) => rows.find((r) => r.id === id)!.percentOfValue
    expect(rows).toHaveLength(7)
    expect(pct('helium-lbt')).toBeCloseTo(0.529, 3)
    expect(pct('helium-empress')).toBeCloseTo(1.665, 3)
    expect(pct('helium-theory')).toBeCloseTo(0.081, 3)
    expect(pct('deuterium-observed')).toBeCloseTo(1.156, 3)
    expect(pct('deuterium-theory')).toBeCloseTo(1.554, 3)
    expect(pct('lithium-observed')).toBeCloseTo(17.241, 3)
    expect(pct('lithium-theory')).toBeCloseTo(3.549, 3)
  })
  it('the lithium gap is about 9 times the give-or-takes added together', () => {
    expect(lithiumGapOverGiveOrTake()).toBeCloseTo(9.13, 2)
  })
})

describe('how sensitive the helium share is to the chosen temperature', () => {
  it('gives the page\'s own value at the chosen temperature and moves with it', () => {
    expect(heliumShareForTemperature(FREEZE_OUT_KT_MEV)).toBeCloseTo(recipe().heliumMassShare, 12)
    expect(heliumShareForTemperature(0.65)).toBeCloseTo(0.2007, 4)
    expect(heliumShareForTemperature(0.8)).toBeCloseTo(0.2788, 4)
    expect(heliumShareForTemperature(0.8)).toBeGreaterThan(heliumShareForTemperature(0.72))
    expect(heliumShareForTemperature(0.72)).toBeGreaterThan(heliumShareForTemperature(0.65))
  })
  it('follows the settings it is given', () => {
    expect(heliumShareForTemperature(0.8, { waitS: 600, massDifferenceFactor: 1 })).toBeLessThan(heliumShareForTemperature(0.8))
  })
  it('offers three temperatures, the chosen one in the middle', () => {
    expect(SENSITIVITY_TEMPERATURES_MEV).toEqual([0.65, 0.72, 0.8])
  })
})

describe('the tutor: marking the guesses and the figures it quotes', () => {
  it('marks a guess matched only for the nearest button to the real answer', () => {
    expect(SHARE_ANSWER_CHOICES.map((c) => shareGuessResult(c.id))).toEqual(['not matched', 'not matched', 'matched', 'not matched', 'not matched'])
    expect(ATOM_ANSWER_CHOICES.map((c) => atomGuessResult(c.id))).toEqual(['not matched', 'matched', 'not matched', 'not matched', 'not matched'])
    expect(() => shareGuessResult('nope')).toThrow(RangeError)
    expect(() => atomGuessResult('nope')).toThrow(RangeError)
  })
  it('quotes the worked numbers: the mass difference over the temperature, the waits and the sensitivity', () => {
    const t = tutorFigures()
    expect(t.massOverTemperature).toBeCloseTo(1.7963, 4)
    expect(t.real.freezeOutNeutronsPerProton).toBeCloseTo(Math.exp(-t.massOverTemperature), 12)
    expect(t.decaySeconds).toBe(179)
    expect(t.longWaitS).toBe(TUTOR_LONG_WAIT_S)
    expect(t.longHeliumPercent).toBeCloseTo(8.13, 2)
    expect(t.middleHeliumPercent).toBeCloseTo(15.48, 2)
    expect(t.longNeutronsLeftFraction).toBeCloseTo(0.2554, 3)
    expect(t.longHeliumPercent).toBeLessThan(t.real.heliumMassShare * 100)
  })
  it('quotes the measured shares and the lithium gap', () => {
    const t = tutorFigures()
    expect(t.lbtPercent).toBeCloseTo(24.58, 10)
    expect(t.hydrogenPercentLbt).toBeCloseTo(75.42, 10)
    expect(t.theoryPercent).toBeCloseTo(24.67, 10)
    expect(t.atomsFromMeasured).toBeCloseTo(8.15, 2)
    expect(t.lithiumRatio).toBeCloseTo(3.809, 3)
    expect(t.lithiumGapTimes).toBeCloseTo(9.13, 2)
    expect(t.sensitivity.map((s) => s.kt)).toEqual([0.65, 0.72, 0.8])
  })
})

describe('the EMPRESS paper\'s first version', () => {
  it('is stored as its abstract gave it and sits below the later value', () => {
    expect(HELIUM_EMPRESS_VERSION_ONE).toEqual({ value: 0.2387, plus: 0.0036, minus: 0.0031 })
    expect(HELIUM_EMPRESS_VERSION_ONE.value).toBeLessThan(HELIUM_OBSERVED_EMPRESS.value)
  })
})
