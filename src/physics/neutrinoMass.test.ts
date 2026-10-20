import { describe, it, expect } from 'vitest'
import {
  BOUNDS,
  CEILINGS,
  clumpSmoothing,
  energyDensityShare,
  heavyBeforeRelease,
  heavyRedshift,
  heavyTimeYears,
  MASS_SQUARED_GAPS,
  matterShare,
  neutrinoTemperatureKelvin,
  oscillationFloor,
  PREDICTION_TOTAL_MASS_EV,
  roomRange,
  roomUnder,
  runNeutrinoMass,
  typicalEnergyEv,
} from './neutrinoMass'

// Tests for Frontier and Beyond Experiment 4 (docs/experiments/frontier-and-beyond/04-can-the-universe-weigh-a-neutrino.md, "Required Physics Tests").
// The numbers below were worked out separately, by an independent script and by hand, so a wrong formula in the module cannot make a test pass.

const bound = (name: string) => BOUNDS.find((b) => b.name === name)!
const desiJuly2026 = bound('DESI DR2 + CMB (July 2026)').value
const desiMarch2025 = bound('DESI DR2 + CMB (March 2025)').value

describe('the neutrino temperature (test 1)', () => {
  it('is 1.945 K for a 2.725 K microwave background', () => {
    expect(neutrinoTemperatureKelvin(2.725)).toBeCloseTo(1.945, 3)
  })

  it('is (4/11)^(1/3) = 0.714 of the photon temperature', () => {
    expect(neutrinoTemperatureKelvin(1)).toBeCloseTo(0.7138, 4)
    expect(neutrinoTemperatureKelvin(10) / neutrinoTemperatureKelvin(5)).toBeCloseTo(2, 10)
  })
})

describe('the typical energy (test 2)', () => {
  it('is 5.28e-4 eV at the neutrino temperature of today', () => {
    // 3.151 x 8.617333e-5 eV/K x 1.94501 K = 5.2813e-4 eV (2.715e-4 eV per kelvin)
    expect(typicalEnergyEv(1.94501)).toBeCloseTo(5.2813e-4, 7)
  })
})

describe('when the neutrinos turn heavy (tests 3 to 5)', () => {
  it('gives the redshifts worked out by hand', () => {
    expect(heavyRedshift(0.0592 / 3)).toBeCloseTo(36.36, 1) // 0.019733 / 5.2823e-4 = 37.36
    expect(heavyRedshift(0.1 / 3)).toBeCloseTo(62.1, 1)
    expect(heavyRedshift(1)).toBeCloseTo(1892.1, 0)
  })

  it('is strictly increasing with mass', () => {
    const masses = [0.01, 0.02, 0.05, 0.1, 0.3, 1]
    for (let i = 1; i < masses.length; i += 1) {
      expect(heavyRedshift(masses[i])).toBeGreaterThan(heavyRedshift(masses[i - 1]))
    }
  })

  it("a mass of 0.576 eV turns heavy at the microwave background's redshift, lighter ones later and heavier ones earlier", () => {
    expect(Math.abs(heavyRedshift(0.576088) - 1089.8)).toBeLessThan(1)
    expect(heavyRedshift(0.4)).toBeLessThan(1089.8)
    expect(heavyRedshift(0.8)).toBeGreaterThan(1089.8)
  })

  it('takes about 75 million years for 0.0197 eV, and is strictly decreasing with mass', () => {
    // Worked out by a separate numerical integration of the matter plus dark energy universe: 75.4 million years.
    expect(heavyTimeYears(0.0592 / 3) / 1e6).toBeGreaterThan(75.4 * 0.98)
    expect(heavyTimeYears(0.0592 / 3) / 1e6).toBeLessThan(75.4 * 1.02)
    expect(heavyTimeYears(0.1 / 3) / 1e6).toBeCloseTo(34.4, 0)
    const masses = [0.01, 0.02, 0.05, 0.1, 0.3]
    for (let i = 1; i < masses.length; i += 1) {
      expect(heavyTimeYears(masses[i])).toBeLessThan(heavyTimeYears(masses[i - 1]))
    }
  })
})

describe('the neutrinos\' share of the whole energy (added at the final review)', () => {
  it('is (total / 93.14) / h^2: 0.00140 for 0.0592 eV', () => {
    // 0.0592 / 93.14 = 6.3560e-4; / 0.674^2 (= 0.454276) = 1.39915e-3
    expect(energyDensityShare(0.0592)).toBeCloseTo(1.39915e-3, 7)
  })

  it('is proportional to the total, and the matter share is it divided by the matter fraction 0.315', () => {
    expect(energyDensityShare(0.2) / energyDensityShare(0.1)).toBeCloseTo(2, 10)
    expect(matterShare(0.0592)).toBeCloseTo(energyDensityShare(0.0592) / 0.315, 12)
  })

  it('throws RangeError for a total that is not above zero', () => {
    expect(() => energyDensityShare(0)).toThrow(RangeError)
    expect(() => energyDensityShare(-0.1)).toThrow(RangeError)
  })

  it('names the predictions\' total as 0.06 eV', () => {
    expect(PREDICTION_TOTAL_MASS_EV).toBe(0.06)
    expect(heavyBeforeRelease(PREDICTION_TOTAL_MASS_EV)).toBe('after')
  })
})

describe('the matter share and the smoothing (tests 6 and 7)', () => {
  it('gives 0.44 percent at 0.0592 eV and 0.90 percent at 0.12 eV', () => {
    // 0.0592 / 93.14 / 0.674^2 / 0.315 = 0.004442
    expect(matterShare(0.0592) * 100).toBeCloseTo(0.444, 2)
    expect(matterShare(0.12) * 100).toBeCloseTo(0.900, 2)
  })

  it('is proportional to the total mass', () => {
    expect(matterShare(0.2) / matterShare(0.1)).toBeCloseTo(2, 10)
  })

  it('smooths small clumps by eight times the share (3.55 percent at 0.0592 eV)', () => {
    expect(clumpSmoothing(0.0592) * 100).toBeCloseTo(3.55, 2)
    expect(clumpSmoothing(0.3)).toBeCloseTo(8 * matterShare(0.3), 12)
    expect(clumpSmoothing(0.5) * 100).toBeCloseTo(30.0, 1)
  })

  it('refuses totals above 0.5 eV', () => {
    expect(() => clumpSmoothing(0.51)).toThrow(RangeError)
  })
})

describe('the oscillation floors (tests 8 and 13)', () => {
  it('are 0.0588 and 0.1004 eV', () => {
    expect(oscillationFloor('normal')).toBeCloseTo(0.0588, 4)
    expect(oscillationFloor('inverted')).toBeCloseTo(0.1004, 4)
  })

  it('has the inverted floor above the normal one, and each within 0.001 of the value the DESI papers quote', () => {
    expect(oscillationFloor('inverted')).toBeGreaterThan(oscillationFloor('normal'))
    expect(Math.abs(oscillationFloor('normal') - 0.059)).toBeLessThan(0.001)
    expect(Math.abs(oscillationFloor('inverted') - 0.1)).toBeLessThan(0.001)
  })

  it('are made of the two gaps and nothing else (the lightest neutrino is massless)', () => {
    // normal: 0 + sqrt(7.49e-5) + sqrt(2.513e-3) = 0.0086545 + 0.0501299
    expect(oscillationFloor('normal')).toBeCloseTo(Math.sqrt(MASS_SQUARED_GAPS.solar) + Math.sqrt(MASS_SQUARED_GAPS.atmosphericNormal), 12)
    expect(Math.sqrt(MASS_SQUARED_GAPS.solar)).toBeCloseTo(8.6545e-3, 7)
    expect(Math.sqrt(MASS_SQUARED_GAPS.atmosphericNormal)).toBeCloseTo(5.01299e-2, 6)
  })
})

describe('the room under a ceiling (tests 9 and 10)', () => {
  it('gives the ratios worked out by hand', () => {
    expect(roomUnder(0.0592, 'normal').ratio).toBeCloseTo(1.0071, 3) // 0.0592 / 0.058784
    expect(roomUnder(0.0642, 'normal').ratio).toBeCloseTo(1.0921, 3)
    expect(roomUnder(0.12, 'normal').ratio).toBeCloseTo(2.041, 2)
    expect(roomUnder(0.163, 'normal').ratio).toBeCloseTo(2.773, 2)
  })

  it('has a negative difference when the ceiling is below the floor', () => {
    expect(roomUnder(0.0565, 'normal').difference).toBeLessThan(0)
    expect(roomUnder(0.0642, 'inverted').difference).toBeLessThan(0)
    expect(roomUnder(0.0592, 'normal').difference).toBeGreaterThan(0)
  })

  it('sorts the ceilings into the three ranges', () => {
    expect(roomRange(0.0592, 'normal')).toBe('veryLittle')
    expect(roomRange(0.0642, 'normal')).toBe('veryLittle')
    expect(roomRange(0.0565, 'normal')).toBe('none')
    expect(roomRange(0.12, 'normal')).toBe('plenty')
    expect(roomRange(0.163, 'normal')).toBe('plenty')
  })

  it('has its edges at the floor and at 1.2 times the floor', () => {
    const floor = oscillationFloor('normal')
    expect(roomRange(floor * 0.999, 'normal')).toBe('none')
    expect(roomRange(floor * 1.001, 'normal')).toBe('veryLittle')
    expect(roomRange(floor * 1.199, 'normal')).toBe('veryLittle')
    expect(roomRange(floor * 1.201, 'normal')).toBe('plenty')
  })

  it('gives no room under the inverted floor for any DESI ceiling of the standard model', () => {
    expect(roomRange(desiMarch2025, 'inverted')).toBe('none')
    expect(roomRange(desiJuly2026, 'inverted')).toBe('none')
    expect(roomRange(0.0565, 'inverted')).toBe('none')
  })
})

describe('Prediction 1 (test 11)', () => {
  it('is "after" for 0.06 eV and "before" for 2 eV', () => {
    expect(heavyBeforeRelease(0.06)).toBe('after')
    expect(heavyBeforeRelease(2)).toBe('before')
  })

  it('uses the equal split of three: the answer for a total of 1 eV is "after" (0.33 eV each), but "before" if it were carried by one neutrino', () => {
    expect(heavyRedshift(1 / 3)).toBeCloseTo(630.2, 0) // 0.33333 / 5.2813e-4 = 631.2
    expect(heavyBeforeRelease(1)).toBe('after')
    expect(heavyRedshift(1)).toBeGreaterThan(1089.8)
    expect(heavyBeforeRelease(1.8)).toBe('before') // 0.6 eV each: 1 + z = 1136
  })

  it('does not depend on the split for 0.06 eV: even one neutrino carrying it all turns heavy after the release', () => {
    expect(heavyRedshift(0.06 / 3)).toBeLessThan(1089.8)
    expect(heavyRedshift(0.06)).toBeLessThan(1089.8)
    expect(heavyRedshift(0.06)).toBeCloseTo(112.6, 0)
  })
})

describe('the data (tests 12 and 14)', () => {
  it('equals the published values', () => {
    expect(bound('KATRIN (one neutrino kind)').value).toBe(0.45)
    expect(bound('Planck 2018 + BAO').value).toBe(0.12)
    expect(bound('DESI + CMB with Planck PR4').value).toBe(0.1)
    expect(desiMarch2025).toBe(0.0642)
    expect(bound('DESI DR2 + CMB, evolving dark energy').value).toBe(0.163)
    expect(bound('DESI DR2 + CMB, no Lyman-alpha full shape (July 2026)').value).toBe(0.0565)
    expect(desiJuly2026).toBe(0.0592)
    expect(bound('Planck 2018 + BAO').year).toBe(2018)
    expect(desiMarch2025).not.toBe(desiJuly2026)
    expect(bound('DESI DR2 + CMB (March 2025)').year).toBe(2025)
    expect(bound('DESI DR2 + CMB (July 2026)').year).toBe(2026)
    for (const b of BOUNDS) expect(b.source.length).toBeGreaterThan(5)
  })

  it('has the ceilings come down in date order to the floor', () => {
    const floor = oscillationFloor('normal')
    const planck = bound('Planck 2018 + BAO').value
    expect(planck).toBeGreaterThan(desiMarch2025)
    expect(desiMarch2025).toBeGreaterThan(desiJuly2026)
    expect(desiJuly2026).toBeGreaterThan(floor)
  })

  it('draws the ceilings the specification names and leaves the others for the table', () => {
    const drawn = CEILINGS.filter((b) => b.drawn).map((b) => b.value).sort()
    expect(drawn).toEqual([0.0592, 0.0642, 0.12, 0.163].sort())
    expect(bound('KATRIN (one neutrino kind)').drawn).toBe(false)
  })
})

describe('the result for a chosen total', () => {
  it('collects the numbers the results show, for 0.0592 eV', () => {
    const r = runNeutrinoMass(0.0592)
    expect(r.massEachEv).toBeCloseTo(0.019733, 6)
    expect(r.heavyRedshift).toBeCloseTo(36.36, 1)
    expect(r.heavyTiming).toBe('after')
    expect(r.timesLaterThanRelease).toBeGreaterThan(190)
    expect(r.timesLaterThanRelease).toBeLessThan(205)
    expect(r.releaseRedshift).toBe(1089.8)
    expect(r.releaseYears).toBe(380000)
    expect(r.heavyRedshiftOneNeutrino).toBeCloseTo(111.07, 1)
    expect(r.share).toBe(matterShare(0.0592))
    expect(r.smoothing).toBe(8 * r.share)
    expect(r.floors.normal).toBeCloseTo(0.0588, 4)
    expect(r.rooms.length).toBe(CEILINGS.length)
  })

  it('gives each ceiling its room under both orderings', () => {
    const r = runNeutrinoMass(0.1)
    const july = r.rooms.find((x) => x.bound.value === 0.0592)!
    expect(july.normal.range).toBe('veryLittle')
    expect(july.inverted.range).toBe('none')
    const planck = r.rooms.find((x) => x.bound.value === 0.12)!
    expect(planck.normal.range).toBe('plenty')
    expect(planck.inverted.range).toBe('veryLittle') // 0.12 / 0.1004 = 1.195
  })
})

describe('out-of-range inputs (test 15)', () => {
  it('throws RangeError', () => {
    expect(() => neutrinoTemperatureKelvin(0)).toThrow(RangeError)
    expect(() => typicalEnergyEv(-1)).toThrow(RangeError)
    expect(() => heavyRedshift(0)).toThrow(RangeError)
    expect(() => heavyRedshift(-0.01)).toThrow(RangeError)
    expect(() => matterShare(0)).toThrow(RangeError)
    expect(() => clumpSmoothing(0.6)).toThrow(RangeError)
    expect(() => roomUnder(0, 'normal')).toThrow(RangeError)
    expect(() => oscillationFloor('sideways' as 'normal')).toThrow(RangeError)
    expect(() => heavyBeforeRelease(0)).toThrow(RangeError)
    expect(() => runNeutrinoMass(-1)).toThrow(RangeError)
    expect(() => heavyTimeYears(0.0001)).toThrow(RangeError) // below the typical energy today, so not yet matter-like
  })
})
