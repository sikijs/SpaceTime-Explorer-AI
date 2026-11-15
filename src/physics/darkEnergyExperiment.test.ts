import { describe, expect, it } from 'vitest'
import {
  HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
  REAL_SPEED_OF_LIGHT_KM_PER_S,
  cosmologicalRedshift,
} from './hubblesLawExperiment'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  GUESS_ARROW_LENGTH_Q0,
  GUESS_REDSHIFT,
  KM_PER_MPC,
  LIGHT_YEARS_PER_MPC,
  MATCH_TOLERANCE,
  MAX_DARK_ENERGY_FRACTION,
  MAX_REDSHIFT,
  PUBLISHED_DARK_ENERGY_RANGE_PERCENT,
  PUBLISHED_KEY_PROJECT,
  SUPERNOVA_REDSHIFTS,
  actualGravityEffect,
  actualLooks,
  brightnessExample,
  brightnessRelativeToMatterOnly,
  checkUp,
  comovingDistanceMpc,
  decelerationCurve,
  decelerationParameter,
  expansionDirection,
  expansionRateRatio,
  gravityGuessMarker,
  gravityGuessMatches,
  inverseSquareBrightness,
  looksGuessGraphMarker,
  looksGuessMatches,
  looksGuessRing,
  luminosityDistanceMpc,
  magnitudesDimmer,
  matchingShareBand,
  nearbyAgreementPercent,
  panelPoint,
  readingFor,
  runDarkEnergyExperiment,
  shareVerdict,
  zeroCrossingShare,
  type GravityGuess,
  type LooksGuess,
} from './darkEnergyExperiment'

const hubbleDistance = REAL_SPEED_OF_LIGHT_KM_PER_S / HUBBLE_CONSTANT_KM_PER_S_PER_MPC

describe('comovingDistanceMpc', () => {
  it('matches the exact matter-only result when there is no dark energy', () => {
    for (const z of [0.1, 0.5, 1]) {
      const exact = 2 * hubbleDistance * (1 - 1 / Math.sqrt(1 + z))
      expect(Math.abs(comovingDistanceMpc(z, 0) - exact) / exact).toBeLessThan(1e-9)
    }
  })

  it('matches c z / H0 exactly when the universe is all dark energy', () => {
    for (const z of [0.1, 0.5, 1]) {
      const exact = hubbleDistance * z
      expect(Math.abs(comovingDistanceMpc(z, 1) - exact) / exact).toBeLessThan(1e-9)
    }
  })

  it('converges: doubling the integration steps barely changes the result', () => {
    const coarse = comovingDistanceMpc(1, 0.7, 1000)
    const fine = comovingDistanceMpc(1, 0.7, 2000)
    expect(Math.abs(coarse - fine) / fine).toBeLessThan(1e-9)
  })
})

describe('luminosityDistanceMpc', () => {
  it('agrees with Experiment 1 for nearby objects, whatever the dark energy share', () => {
    for (const share of [0, 0.3, 0.7, 0.9]) {
      const z = 0.01
      const d = luminosityDistanceMpc(z, share)
      expect(Math.abs(d - hubbleDistance * z) / (hubbleDistance * z)).toBeLessThan(0.02)
      expect(Math.abs(cosmologicalRedshift(d) - z) / z).toBeLessThan(0.02)
    }
  })

  it('is strictly larger for a larger dark energy share, at any redshift above 0', () => {
    for (const z of [0.2, 0.5, 0.8, 1]) {
      let previous = 0
      for (const share of [0, 0.2, 0.4, 0.6, 0.8]) {
        const d = luminosityDistanceMpc(z, share)
        expect(d).toBeGreaterThan(previous)
        previous = d
      }
    }
  })
})

describe('brightnessRelativeToMatterOnly', () => {
  it('is 1 with no dark energy and below 1 with some', () => {
    for (const z of SUPERNOVA_REDSHIFTS) {
      expect(brightnessRelativeToMatterOnly(z, 0)).toBeCloseTo(1, 12)
      expect(brightnessRelativeToMatterOnly(z, 0.3)).toBeLessThan(1)
    }
  })

  it('dims more at higher redshift for 70% dark energy, with about 0.69 at redshift 0.5', () => {
    const [low, mid, high] = SUPERNOVA_REDSHIFTS.map((z) => brightnessRelativeToMatterOnly(z, 0.7))
    expect(low).toBeGreaterThan(mid)
    expect(mid).toBeGreaterThan(high)
    expect(mid).toBeGreaterThan(0.6)
    expect(mid).toBeLessThan(0.8)
  })
})

describe('decelerationParameter', () => {
  it('is +0.5 with no dark energy, -0.55 at 70%, and 0 at one third', () => {
    expect(decelerationParameter(0)).toBeCloseTo(0.5, 12)
    expect(decelerationParameter(0.7)).toBeCloseTo(-0.55, 12)
    expect(decelerationParameter(1 / 3)).toBeCloseTo(0, 12)
  })
})

describe('runDarkEnergyExperiment', () => {
  it('reports the three supernovae, a curve to the maximum redshift, and the expansion direction', () => {
    const none = runDarkEnergyExperiment(0)
    const best = runDarkEnergyExperiment(0.7)
    expect(best.supernovae.map((s) => s.redshift)).toEqual(SUPERNOVA_REDSHIFTS)
    expect(best.curve[0].redshift).toBe(0)
    expect(best.curve[best.curve.length - 1].redshift).toBeCloseTo(MAX_REDSHIFT, 12)
    expect(none.isExpansionAccelerating).toBe(false)
    expect(best.isExpansionAccelerating).toBe(true)
    const mid = best.supernovae[1]
    expect(mid.distanceMpc).toBeGreaterThan(mid.matterOnlyDistanceMpc)
  })
})

const gravityGuesses: GravityGuess[] = ['slow', 'speed', 'none']
const looksGuesses: LooksGuess[] = ['brighter', 'same', 'dimmer']

describe('what the model actually gives (the tutor marks the guesses with these)', () => {
  it('says matter alone slows the expansion and the best fit speeds it up', () => {
    expect(expansionDirection(0)).toBe('slowing down')
    expect(expansionDirection(BEST_FIT_DARK_ENERGY_FRACTION)).toBe('speeding up')
    expect(expansionDirection(1 / 3)).toBe('steady')
    expect(actualGravityEffect()).toBe('slow')
  })

  it('says the best fit makes the middle supernova look dimmer than matter-only predicts', () => {
    expect(actualLooks()).toBe('dimmer')
    expect(brightnessRelativeToMatterOnly(GUESS_REDSHIFT, BEST_FIT_DARK_ENERGY_FRACTION)).toBeLessThan(1)
  })

  it('marks exactly one answer right for each guess', () => {
    expect(gravityGuesses.filter(gravityGuessMatches)).toEqual(['slow'])
    expect(looksGuesses.filter(looksGuessMatches)).toEqual(['dimmer'])
  })

  it('agrees with the run result for the direction of the expansion at every share', () => {
    for (const share of [0, 0.2, 0.33, 0.34, 0.5, 0.7, 0.9]) {
      expect(expansionDirection(share) === 'speeding up').toBe(runDarkEnergyExperiment(share).isExpansionAccelerating)
    }
  })
})

describe('guess marks', () => {
  it('draws guess 1 at a share of 0 as an arrow up, an arrow down or a dot, all different', () => {
    const slow = gravityGuessMarker('slow')
    const speed = gravityGuessMarker('speed')
    const none = gravityGuessMarker('none')
    expect([slow.kind, speed.kind, none.kind]).toEqual(['up', 'down', 'dot'])
    expect(slow.darkEnergyFraction).toBe(0)
    expect(slow.toQ0).toBeCloseTo(GUESS_ARROW_LENGTH_Q0, 12)
    expect(speed.toQ0).toBeCloseTo(-GUESS_ARROW_LENGTH_Q0, 12)
    expect(none.toQ0).toBe(0)
  })

  it('keeps the guess-1 arrow a fixed length that is not the real value', () => {
    expect(GUESS_ARROW_LENGTH_Q0).not.toBeCloseTo(decelerationParameter(0), 3)
  })

  it('draws the guess-2 ring larger than, the same as, or smaller than the dashed ring', () => {
    expect(looksGuessRing('brighter').radiusFactor).toBeGreaterThan(1)
    expect(looksGuessRing('same').radiusFactor).toBe(1)
    expect(looksGuessRing('dimmer').radiusFactor).toBeLessThan(1)
    for (const g of looksGuesses) expect(looksGuessRing(g).redshift).toBe(GUESS_REDSHIFT)
  })

  it('draws the guess-2 graph marker above, on or below the blue line at the same redshift', () => {
    expect(looksGuessGraphMarker('brighter').brightness).toBeGreaterThan(1)
    expect(looksGuessGraphMarker('same').brightness).toBe(1)
    expect(looksGuessGraphMarker('dimmer').brightness).toBeLessThan(1)
    for (const g of looksGuesses) expect(looksGuessGraphMarker(g).redshift).toBe(GUESS_REDSHIFT)
  })

  it('never moves with the learner share: a guess mark depends on the guess alone', () => {
    const before = [gravityGuessMarker('slow'), looksGuessRing('dimmer'), looksGuessGraphMarker('dimmer')]
    runDarkEnergyExperiment(0.2)
    runDarkEnergyExperiment(0.9)
    expect([gravityGuessMarker('slow'), looksGuessRing('dimmer'), looksGuessGraphMarker('dimmer')]).toEqual(before)
  })
})

describe('the slowing or speeding up panel', () => {
  it('has a point for every 0.05 of share from 0 to the maximum, falling as the share rises', () => {
    const curve = decelerationCurve()
    expect(curve[0].darkEnergyFraction).toBe(0)
    expect(curve[curve.length - 1].darkEnergyFraction).toBeCloseTo(MAX_DARK_ENERGY_FRACTION, 12)
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].decelerationParameter).toBeLessThan(curve[i - 1].decelerationParameter)
    }
  })

  it('gives the blue dot +0.50 at a share of 0 and the green dot -0.55 at the best fit', () => {
    expect(panelPoint(0).decelerationParameter).toBeCloseTo(0.5, 12)
    expect(panelPoint(BEST_FIT_DARK_ENERGY_FRACTION).decelerationParameter).toBeCloseTo(-0.55, 12)
  })

  it('crosses zero at exactly one third', () => {
    expect(zeroCrossingShare()).toBeCloseTo(1 / 3, 12)
    expect(decelerationParameter(zeroCrossingShare())).toBeCloseTo(0, 12)
  })
})

describe('shareVerdict and the matching band', () => {
  it('matches the best fit itself and nothing is reported for it as too little or too much', () => {
    expect(shareVerdict(BEST_FIT_DARK_ENERGY_FRACTION)).toBe('match')
  })

  it('calls a small share too little and a large one too much', () => {
    expect(shareVerdict(0)).toBe('too-little')
    expect(shareVerdict(0.3)).toBe('too-little')
    expect(shareVerdict(0.9)).toBe('too-much')
  })

  it('matches over a band of about 66 to 74 percent, not only at 70', () => {
    const { low, high } = matchingShareBand()
    expect(low).toBeGreaterThan(0.64)
    expect(low).toBeLessThan(0.68)
    expect(high).toBeGreaterThan(0.72)
    expect(high).toBeLessThan(0.76)
    expect(low).toBeLessThan(BEST_FIT_DARK_ENERGY_FRACTION)
    expect(high).toBeGreaterThan(BEST_FIT_DARK_ENERGY_FRACTION)
  })

  it('gives the same band every time it is asked', () => {
    expect(matchingShareBand()).toEqual(matchingShareBand())
    expect(matchingShareBand().low).toBeLessThan(matchingShareBand().high)
  })

  it('uses a 5 percent tolerance and holds at the band edges', () => {
    expect(MATCH_TOLERANCE).toBe(0.05)
    const { low, high } = matchingShareBand()
    expect(shareVerdict(low - 0.01)).toBe('too-little')
    expect(shareVerdict(high + 0.01)).toBe('too-much')
  })
})

describe('worked examples', () => {
  it('follows the inverse-square rule: twice as far is a quarter, ten times as far is a hundredth', () => {
    expect(inverseSquareBrightness(2)).toBeCloseTo(0.25, 12)
    expect(inverseSquareBrightness(10)).toBeCloseTo(0.01, 12)
  })

  it('gives the redshift-0.5 moment at the best fit: 2358 and 2833 Mpc, 0.69, about 31 percent dimmer', () => {
    const e = brightnessExample(BEST_FIT_DARK_ENERGY_FRACTION)
    expect(Math.round(e.matterOnlyDistanceMpc)).toBe(2358)
    expect(Math.round(e.distanceMpc)).toBe(2833)
    expect(e.brightness).toBeCloseTo(0.693, 3)
    expect(e.brightness).toBeCloseTo(e.distanceRatio ** 2, 12)
    expect(Math.round(e.percentDimmer)).toBe(31)
    expect(Math.round(e.percentFarther)).toBe(20)
  })

  it('has the same number the run reports for that supernova', () => {
    const fromRun = runDarkEnergyExperiment(0.7).supernovae.find((s) => s.redshift === GUESS_REDSHIFT)!
    expect(brightnessExample(0.7).brightness).toBeCloseTo(fromRun.brightnessRelativeToMatterOnly, 12)
  })

  it('has no difference at all with no dark energy', () => {
    const e = brightnessExample(0)
    expect(e.brightness).toBeCloseTo(1, 12)
    expect(e.percentDimmer).toBeCloseTo(0, 9)
  })

  it('puts nearby supernovae within about half of one percent of matter-only', () => {
    expect(nearbyAgreementPercent()).toBeGreaterThan(0)
    expect(nearbyAgreementPercent()).toBeLessThan(1)
  })

  it('gives the introduction expansion-rate example E = 1.309 at redshift 0.5 and 70 percent', () => {
    expect(expansionRateRatio(0.5, 0.7)).toBeCloseTo(1.309, 3)
  })

  it('turns a brightness ratio into magnitudes (0.40 dimmer at the best fit)', () => {
    expect(magnitudesDimmer(brightnessExample(0.7).brightness)).toBeCloseTo(0.4, 2)
    expect(magnitudesDimmer(1)).toBeCloseTo(0, 12)
  })

  it('quotes the megaparsec in light-years and kilometres', () => {
    expect(LIGHT_YEARS_PER_MPC).toBeCloseTo(3.26e6, -4)
    expect(KM_PER_MPC).toBeCloseTo(3.0857e19, -15)
  })
})

describe('published figures quoted in the introduction', () => {
  it('has the Hubble Key Project figures: almost 800 Cepheids, 18 galaxies, out to 65 million light-years', () => {
    expect(PUBLISHED_KEY_PROJECT).toEqual({ galaxies: 18, reachLightYears: 65e6, cepheids: 800 })
  })
})

describe('the check-up', () => {
  const rows = checkUp()
  const row = (id: string) => rows.find((r) => r.id === id)!

  it('has five rows in order and does not depend on any learner share', () => {
    expect(rows.map((r) => r.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(checkUp()).toEqual(rows)
  })

  it('row a: matter only is +0.50 and has no outside reference', () => {
    expect(row('a').thisPage).toBeCloseTo(0.5, 12)
    expect(row('a').beside).toBeNull()
    expect(row('a').reading).toBe('calculated here only')
  })

  it('row b: the best fit is -0.55 and its direction agrees with the observed result', () => {
    expect(row('b').thisPage).toBeCloseTo(-0.55, 12)
    expect(row('b').reading).toBe('same direction as observed')
  })

  it('row c: brightness at redshift 0.5 is 0.69 against 1.00 and reads "less"', () => {
    expect(row('c').thisPage).toBeCloseTo(0.693, 3)
    expect(row('c').beside).toBe(1)
    expect(row('c').differencePercent!).toBeLessThan(-30)
    expect(row('c').reading).toBe('less')
  })

  it('row d: the speed-up begins at one third, far below the best fit, and is calculated only', () => {
    expect(row('d').beside).toBeCloseTo(1 / 3, 12)
    expect(row('d').thisPage).toBe(BEST_FIT_DARK_ENERGY_FRACTION)
    expect(row('d').reading).toBe('calculated here only')
  })

  it('row e: 70 percent sits within NASA\'s stated range, at its top', () => {
    expect(PUBLISHED_DARK_ENERGY_RANGE_PERCENT).toEqual({ low: 68.3, high: 70 })
    expect(row('e').thisPage).toBeCloseTo(70, 9)
    expect(row('e').reading).toBe('within the published range')
  })

  it('never invents a cut-off: with no range a reading is only less, more or the same', () => {
    expect(readingFor(-0.001)).toBe('less')
    expect(readingFor(0.001)).toBe('more')
    expect(readingFor(0)).toBe('the same')
  })
})

describe('module independence', () => {
  it('imports the Hubble constant and speed of light from hubblesLawExperiment and nothing from the dark matter or CMB modules', async () => {
    const source = await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL('./darkEnergyExperiment.ts', import.meta.url), 'utf-8'),
    )
    const importLines = source.split('\n').filter((line: string) => line.trim().startsWith('import'))
    const fromHubble = importLines.filter((line: string) => line.includes('hubblesLawExperiment')).join(' ')
    expect(fromHubble).toContain('HUBBLE_CONSTANT_KM_PER_S_PER_MPC')
    expect(fromHubble).toContain('REAL_SPEED_OF_LIGHT_KM_PER_S')
    for (const name of ['darkMatterExperiment', 'cosmicMicrowaveBackgroundExperiment']) {
      expect(importLines.some((line: string) => line.includes(name))).toBe(false)
    }
  })
})
