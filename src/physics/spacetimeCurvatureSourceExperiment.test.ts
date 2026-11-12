import { describe, it, expect } from 'vitest'
import {
  strengthsForMassAndDistance,
  K_DILATION,
  K_TIDAL,
  STRENGTH_CAP,
  STRENGTH_AXIS_TOP,
  PREDICTION_KEYS,
  predictionSetup,
  rawStrength,
  strengthOf,
  isCapped,
  strengthLine,
  strengthLineFor,
  sweepRange,
  endStrengths,
  actualOutcomeFor,
  guessMarkerFor,
  markGuess,
  formatStrength,
  tidalCapDistance,
  workedNumbers,
  refresherNumbers,
  part2Examples,
} from './spacetimeCurvatureSourceExperiment'
import type { PredictionChoice } from './spacetimeCurvatureSourceExperiment'

describe('What Curves Spacetime? Experiment Physics', () => {
  it('lands exactly on each experiment\'s own middle preset at medium mass, medium distance', () => {
    const { timeDilationStrength, convergenceStrength } = strengthsForMassAndDistance(2, 2)
    expect(timeDilationStrength).toBeCloseTo(0.3, 12)
    expect(convergenceStrength).toBeCloseTo(0.3, 12)
  })

  it('both strengths strictly increase as mass increases, distance held fixed', () => {
    const small = strengthsForMassAndDistance(1, 2)
    const large = strengthsForMassAndDistance(4, 2)
    expect(large.timeDilationStrength).toBeGreaterThan(small.timeDilationStrength)
    expect(large.convergenceStrength).toBeGreaterThan(small.convergenceStrength)
  })

  it('both strengths strictly increase as distance decreases, mass held fixed', () => {
    const far = strengthsForMassAndDistance(2, 4)
    const close = strengthsForMassAndDistance(2, 1)
    expect(close.timeDilationStrength).toBeGreaterThan(far.timeDilationStrength)
    expect(close.convergenceStrength).toBeGreaterThan(far.convergenceStrength)
  })

  it('convergence strength falls off with distance faster than time dilation strength', () => {
    const near = strengthsForMassAndDistance(2, 1)
    const far = strengthsForMassAndDistance(2, 4)

    const dilationRatio = near.timeDilationStrength / far.timeDilationStrength
    const convergenceRatio = near.convergenceStrength / far.convergenceStrength

    expect(convergenceRatio).toBeGreaterThan(dilationRatio)
  })

  it('clamps time dilation strength within Experiment 2\'s own valid custom range (0.05-0.9)', () => {
    const veryStrong = strengthsForMassAndDistance(100, 1)
    const veryWeak = strengthsForMassAndDistance(1, 100)
    expect(veryStrong.timeDilationStrength).toBe(0.9)
    expect(veryWeak.timeDilationStrength).toBe(0.05)
  })

  it('clamps convergence strength within Experiment 3\'s own valid custom range (0.02-0.9)', () => {
    const veryStrong = strengthsForMassAndDistance(100, 1)
    const veryWeak = strengthsForMassAndDistance(1, 100)
    expect(veryStrong.convergenceStrength).toBe(0.9)
    expect(veryWeak.convergenceStrength).toBe(0.02)
  })

  it('rejects non-positive relative mass', () => {
    expect(() => strengthsForMassAndDistance(0, 2)).toThrow(RangeError)
    expect(() => strengthsForMassAndDistance(-1, 2)).toThrow(RangeError)
    expect(() => strengthsForMassAndDistance(NaN, 2)).toThrow(RangeError)
  })

  it('rejects non-positive relative distance', () => {
    expect(() => strengthsForMassAndDistance(2, 0)).toThrow(RangeError)
    expect(() => strengthsForMassAndDistance(2, -1)).toThrow(RangeError)
    expect(() => strengthsForMassAndDistance(2, NaN)).toThrow(RangeError)
  })

  it('is deterministic across repeated calls', () => {
    expect(strengthsForMassAndDistance(2, 2)).toEqual(strengthsForMassAndDistance(2, 2))
  })

  describe('audit update: the four guesses, the strength lines, the outcome, the markers and the worked numbers', () => {
    const CHOICES: PredictionChoice[] = ['stronger', 'same', 'weaker']
    const MASSES = [1, 2, 4]
    const DISTANCES = [1, 2, 4]

    it('the constants are the approved ones', () => {
      expect(K_DILATION).toBe(0.3)
      expect(K_TIDAL).toBe(1.2)
      expect(STRENGTH_CAP).toBe(0.9)
      expect(STRENGTH_AXIS_TOP).toBeGreaterThan(STRENGTH_CAP)
    })

    it('the nine-row table of strengths, including the capped cells', () => {
      const rows: Array<[number, number, string, string]> = [
        [1, 1, '0.300', '0.900'],
        [2, 1, '0.600', '0.900'],
        [4, 1, '0.900', '0.900'],
        [1, 2, '0.150', '0.150'],
        [2, 2, '0.300', '0.300'],
        [4, 2, '0.600', '0.600'],
        [1, 4, '0.075', '0.020'],
        [2, 4, '0.150', '0.0375'],
        [4, 4, '0.300', '0.075'],
      ]
      for (const [m, d, dil, tidal] of rows) {
        expect(formatStrength(strengthOf('dilation', m, d))).toBe(dil)
        expect(formatStrength(strengthOf('tidal', m, d))).toBe(tidal)
      }
      expect(isCapped('tidal', 1, 1)).toBe(true)
      expect(isCapped('tidal', 2, 1)).toBe(true)
      expect(isCapped('tidal', 4, 1)).toBe(true)
      expect(isCapped('dilation', 4, 1)).toBe(true)
      expect(isCapped('tidal', 1, 4)).toBe(true)
      expect(isCapped('dilation', 2, 1)).toBe(false)
      expect(isCapped('tidal', 2, 2)).toBe(false)
      expect(rawStrength('tidal', 2, 1)).toBeCloseTo(2.4, 12)
      expect(rawStrength('tidal', 1, 4)).toBeCloseTo(0.01875, 12)
    })

    it('the four setups match the four questions', () => {
      expect(PREDICTION_KEYS).toEqual(['closerDilation', 'closerTidal', 'biggerDilation', 'biggerTidal'])
      expect(predictionSetup('closerDilation')).toMatchObject({ effect: 'dilation', variable: 'distance', fixedValue: 2, from: 4, to: 1 })
      expect(predictionSetup('closerTidal')).toMatchObject({ effect: 'tidal', variable: 'distance', fixedValue: 2, from: 4, to: 1 })
      expect(predictionSetup('biggerDilation')).toMatchObject({ effect: 'dilation', variable: 'mass', fixedValue: 2, from: 1, to: 4 })
      expect(predictionSetup('biggerTidal')).toMatchObject({ effect: 'tidal', variable: 'mass', fixedValue: 2, from: 1, to: 4 })
    })

    it('each line goes from its own start value to its own end value and never falls as the mass moves in or gets bigger', () => {
      for (const key of PREDICTION_KEYS) {
        const line = strengthLineFor(key)
        const { start, end } = endStrengths(key)
        expect(line[0].strength).toBeCloseTo(start, 12)
        expect(line[line.length - 1].strength).toBeCloseTo(end, 12)
        for (let i = 1; i < line.length; i++) expect(line[i].strength).toBeGreaterThanOrEqual(line[i - 1].strength - 1e-12)
        for (const p of line) {
          expect(p.strength).toBeLessThanOrEqual(STRENGTH_CAP)
          expect(p.strength).toBeGreaterThan(0)
        }
      }
    })

    it('the real outcome is computed: "stronger" at the four Medium setups, and "same" for the tidal strength at Close distance (the cap)', () => {
      for (const key of PREDICTION_KEYS) expect(actualOutcomeFor(key)).toBe('stronger')
      const tidalAtClose = MASSES.map((m) => strengthOf('tidal', m, 1))
      expect(new Set(tidalAtClose).size).toBe(1)
      expect(tidalAtClose[0]).toBe(0.9)
      // At Close distance a bigger mass raises the time-dilation strength but not the tidal strength.
      expect(strengthOf('dilation', 4, 1)).toBeGreaterThan(strengthOf('dilation', 1, 1))
    })

    it('a sweep can include a learner value outside the presets', () => {
      expect(sweepRange('distance')).toEqual({ start: 4, end: 1 })
      expect(sweepRange('mass')).toEqual({ start: 1, end: 4 })
      expect(sweepRange('distance', 0.5)).toEqual({ start: 4, end: 0.5 })
      expect(sweepRange('distance', 10)).toEqual({ start: 10, end: 1 })
      expect(sweepRange('mass', 8)).toEqual({ start: 1, end: 8 })
      const line = strengthLine('tidal', 'distance', 2, sweepRange('distance', 10))
      expect(line[0].x).toBe(10)
      expect(line[line.length - 1].x).toBe(1)
    })

    it('the ring is at the end of the line and is the same for all three guesses; the arrow follows the direction guessed', () => {
      for (const key of PREDICTION_KEYS) {
        const markers = CHOICES.map((c) => guessMarkerFor(key, c))
        for (const m of markers) {
          expect(m.x).toBe(predictionSetup(key).to)
          expect(m.strength).toBe(endStrengths(key).end)
          expect(m.boxText).toContain('YOUR GUESS')
          expect(m.boxText).toContain('a marker only')
        }
        expect(markers.map((m) => m.arrow)).toEqual(['up', 'none', 'down'])
      }
      expect(guessMarkerFor('closerTidal', 'stronger').boxText).toContain('closer mass, tidal effect')
      expect(guessMarkerFor('biggerDilation', 'weaker').boxText).toContain('the effect gets weaker')
      expect(guessMarkerFor('biggerDilation', 'same').boxText).toContain('the effect stays the same')
    })

    it('marking a guess matches only the real outcome, names the line\'s two end values, mentions the cap, and never changes the outcome', () => {
      for (const key of PREDICTION_KEYS) {
        const before = actualOutcomeFor(key)
        for (const c of CHOICES) expect(markGuess(key, c).matched).toBe(c === 'stronger')
        expect(actualOutcomeFor(key)).toBe(before)
      }
      expect(markGuess('closerDilation', 'stronger').text).toContain('rises from 0.150 at Far to 0.600 at Close')
      expect(markGuess('closerTidal', 'same').text).toContain('rises from 0.0375 at Far to 0.900 at Close, where it reaches the cap')
      expect(markGuess('biggerDilation', 'stronger').text).toContain('rises from 0.150 at Small to 0.600 at Large')
      expect(markGuess('biggerTidal', 'weaker').text).toContain('different from your guess')
      expect(markGuess('closerDilation', 'stronger').text).toContain('matched')
    })

    it('formatStrength writes three decimals, and four where needed', () => {
      expect(formatStrength(0.15)).toBe('0.150')
      expect(formatStrength(0.0375)).toBe('0.0375')
      expect(formatStrength(0.9)).toBe('0.900')
      expect(formatStrength(1.2)).toBe('1.200')
      expect(formatStrength(DISTANCES.length)).toBe('3.000')
    })

    it('the tidal strength is held at the cap below a distance of about 1.4 at Medium mass', () => {
      expect(tidalCapDistance(2).toFixed(3)).toBe('1.387')
      expect(strengthOf('tidal', 2, 1.3)).toBe(0.9)
      expect(strengthOf('tidal', 2, 1.5)).toBeLessThan(0.9)
    })

    it('workedNumbers match the page wording', () => {
      const w = workedNumbers()
      expect(w.mediumDilation).toBeCloseTo(0.3, 12)
      expect(w.mediumTidal).toBeCloseTo(0.3, 12)
      expect(w.farDilation).toBeCloseTo(0.15, 12)
      expect(w.farTidal).toBeCloseTo(0.0375, 12)
      expect(w.closeDilation).toBeCloseTo(0.6, 12)
      expect(w.closeTidalFormula).toBeCloseTo(2.4, 12)
      expect(w.closeTidal).toBe(0.9)
      expect(w.largeCloseDilationFormula).toBeCloseTo(1.2, 12)
      expect(w.largeCloseTidalFormula).toBeCloseTo(4.8, 12)
      expect(w.smallFarDilation).toBeCloseTo(0.075, 12)
      expect(w.smallFarTidalFormula).toBeCloseTo(0.01875, 12)
      expect(w.smallFarTidal).toBe(0.02)
      expect(w.tidalCapDistanceAtMediumMass.toFixed(1)).toBe('1.4')
    })

    it('the refresher numbers come from Experiments 2 and 3\'s own functions', () => {
      const r = refresherNumbers()
      expect(r.ceilingTicksPerFloorTickAt0p3.toFixed(2)).toBe('1.43')
      expect(r.ceilingTicksPerFloorTickAt0p6.toFixed(2)).toBe('2.50')
      expect(r.planetLandingSeparationAt0p3.toFixed(3)).toBe('0.700')
      expect(r.planetLandingSeparationAt0p6.toFixed(3)).toBe('0.400')
    })

    it('Part 2\'s three worked settings, with the clocks\' and balls\' own numbers', () => {
      const [mediumMedium, largeMedium, largeClose] = part2Examples()
      expect(formatStrength(mediumMedium.dilationStrength)).toBe('0.300')
      expect(mediumMedium.ceilingTicksPerFloorTick.toFixed(2)).toBe('1.43')
      expect(mediumMedium.ceilingTicksAfterRun.toFixed(2)).toBe('14.29')
      expect(mediumMedium.planetLandingSeparation.toFixed(3)).toBe('0.700')
      expect(formatStrength(largeMedium.dilationStrength)).toBe('0.600')
      expect(formatStrength(largeMedium.tidalStrength)).toBe('0.600')
      expect(largeMedium.ceilingTicksPerFloorTick.toFixed(2)).toBe('2.50')
      expect(largeMedium.ceilingTicksAfterRun.toFixed(2)).toBe('25.00')
      expect(largeMedium.planetLandingSeparation.toFixed(3)).toBe('0.400')
      expect(largeMedium.dilationCapped || largeMedium.tidalCapped).toBe(false)
      expect(formatStrength(largeClose.dilationStrength)).toBe('0.900')
      expect(formatStrength(largeClose.tidalStrength)).toBe('0.900')
      expect(largeClose.dilationCapped && largeClose.tidalCapped).toBe(true)
      expect(largeClose.ceilingTicksPerFloorTick.toFixed(2)).toBe('10.00')
      expect(largeClose.ceilingTicksAfterRun.toFixed(2)).toBe('100.00')
      expect(largeClose.planetLandingSeparation.toFixed(3)).toBe('0.100')
    })
  })
})
