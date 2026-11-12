import { describe, it, expect } from 'vitest'
import {
  runGravitationalTimeDilationExperiment,
  tickCountAt,
  actualOutcome,
  ceilingTicksPerFloorTick,
  guessMarkerFor,
  markGuess,
  tickAxisTop,
  workedNumbers,
  RUN_DURATION_FLOOR_SECONDS,
} from './gravitationalTimeDilationExperiment'
import type { PredictionChoice } from './gravitationalTimeDilationExperiment'

describe('Gravitational Time Dilation Experiment Physics', () => {
  it('frequencyRatio equals 1 - strength', () => {
    expect(runGravitationalTimeDilationExperiment(0.1).frequencyRatio).toBeCloseTo(0.9, 12)
    expect(runGravitationalTimeDilationExperiment(0.3).frequencyRatio).toBeCloseTo(0.7, 12)
    expect(runGravitationalTimeDilationExperiment(0.6).frequencyRatio).toBeCloseTo(0.4, 12)
  })

  it('is deterministic across repeated runs', () => {
    expect(runGravitationalTimeDilationExperiment(0.3)).toEqual(runGravitationalTimeDilationExperiment(0.3))
  })

  it('rejects strength outside (0, 1)', () => {
    expect(() => runGravitationalTimeDilationExperiment(0)).toThrow(RangeError)
    expect(() => runGravitationalTimeDilationExperiment(1)).toThrow(RangeError)
    expect(() => runGravitationalTimeDilationExperiment(-0.1)).toThrow(RangeError)
    expect(() => runGravitationalTimeDilationExperiment(1.5)).toThrow(RangeError)
    expect(() => runGravitationalTimeDilationExperiment(NaN)).toThrow(RangeError)
  })
})

describe('Tick Count Over Time', () => {
  const result = runGravitationalTimeDilationExperiment(0.3)

  it('floor clock tick count equals elapsed time exactly', () => {
    ;[0, 1, 2.5, 10].forEach((t) => {
      expect(tickCountAt(result, t, 'floor')).toBe(t)
    })
  })

  it('ceiling clock ticks faster than the floor clock for every t > 0', () => {
    ;[0.1, 1, 5, 100].forEach((t) => {
      expect(tickCountAt(result, t, 'ceiling')).toBeGreaterThan(tickCountAt(result, t, 'floor'))
    })
  })

  it('ceiling tick count matches t / frequencyRatio', () => {
    ;[0.1, 1, 5].forEach((t) => {
      expect(tickCountAt(result, t, 'ceiling')).toBeCloseTo(t / result.frequencyRatio, 12)
    })
  })

  it('both clocks read zero at t = 0', () => {
    expect(tickCountAt(result, 0, 'floor')).toBe(0)
    expect(tickCountAt(result, 0, 'ceiling')).toBe(0)
  })

  it('a greater strength produces a bigger gap between the two clocks at the same elapsed time', () => {
    const weak = runGravitationalTimeDilationExperiment(0.1)
    const strong = runGravitationalTimeDilationExperiment(0.6)
    const gapAt = (r: typeof weak, t: number) => tickCountAt(r, t, 'ceiling') - tickCountAt(r, t, 'floor')
    expect(gapAt(strong, 10)).toBeGreaterThan(gapAt(weak, 10))
  })

  it('rejects negative elapsed time', () => {
    expect(() => tickCountAt(result, -0.1, 'floor')).toThrow(RangeError)
    expect(() => tickCountAt(result, NaN, 'ceiling')).toThrow(RangeError)
  })

  it('is deterministic', () => {
    expect(tickCountAt(result, 3, 'ceiling')).toEqual(tickCountAt(result, 3, 'ceiling'))
  })
})

describe('Audit update: outcome, guess marker, marking, axis and worked numbers', () => {
  const choices: PredictionChoice[] = ['sameRate', 'differentRates']

  it('the real outcome is "differentRates": the ceiling count exceeds the floor count at the end of the run', () => {
    expect(actualOutcome()).toBe('differentRates')
    ;[0.1, 0.3, 0.6, 0.9].forEach((s) => {
      const r = runGravitationalTimeDilationExperiment(s)
      expect(tickCountAt(r, RUN_DURATION_FLOOR_SECONDS, 'ceiling')).toBeGreaterThan(
        tickCountAt(r, RUN_DURATION_FLOOR_SECONDS, 'floor')
      )
    })
  })

  it('the run lasts 10 floor-clock seconds', () => {
    expect(RUN_DURATION_FLOOR_SECONDS).toBe(10)
  })

  it('ceilingTicksPerFloorTick is 1 / frequencyRatio (1.4286 at 0.3)', () => {
    const r = runGravitationalTimeDilationExperiment(0.3)
    expect(ceilingTicksPerFloorTick(r)).toBeCloseTo(1 / 0.7, 12)
    expect(ceilingTicksPerFloorTick(r)).toBeCloseTo(1.4286, 4)
  })

  it('the guess marker sits at the line ends, in the same place for either guess', () => {
    const r = runGravitationalTimeDilationExperiment(0.3)
    const [a, b] = choices.map((c) => guessMarkerFor(r, c))
    expect(a.timeSeconds).toBe(b.timeSeconds)
    expect(a.floorTicks).toBe(b.floorTicks)
    expect(a.ceilingTicks).toBe(b.ceilingTicks)
    expect(a.timeSeconds).toBe(10)
    expect(a.floorTicks).toBeCloseTo(10, 12)
    expect(a.ceilingTicks).toBeCloseTo(14.2857, 4)
    expect(a.boxText).toContain('the same rate')
    expect(b.boxText).toContain('different rates')
    expect(a.boxText).toContain('a marker only')
  })

  it('marking a guess never changes the result or the outcome', () => {
    const r = runGravitationalTimeDilationExperiment(0.3)
    const before = JSON.stringify(r)
    choices.forEach((c) => {
      guessMarkerFor(r, c)
      markGuess(r, c)
    })
    expect(JSON.stringify(r)).toBe(before)
    expect(actualOutcome()).toBe('differentRates')
  })

  it('markGuess: "differentRates" matches, "sameRate" does not, with the real totals in the text', () => {
    const r = runGravitationalTimeDilationExperiment(0.3)
    const right = markGuess(r, 'differentRates')
    const wrong = markGuess(r, 'sameRate')
    expect(right.matched).toBe(true)
    expect(wrong.matched).toBe(false)
    ;[right, wrong].forEach((m) => {
      expect(m.text).toContain('10.00 ticks')
      expect(m.text).toContain('14.29')
    })
    expect(right.text).toContain('matched')
    expect(wrong.text).toContain('different from your guess')
  })

  it('tickAxisTop is 25 for the presets and the next multiple of 25 above larger totals', () => {
    expect(tickAxisTop(0.1)).toBe(25)
    expect(tickAxisTop(0.3)).toBe(25)
    expect(tickAxisTop(0.6)).toBe(25)
    expect(tickAxisTop(0.8)).toBe(50)
    expect(tickAxisTop(0.85)).toBe(75)
    expect(tickAxisTop(0.9)).toBe(100)
  })

  it('every preset ceiling total fits under its axis top', () => {
    ;[0.1, 0.3, 0.6].forEach((s) => {
      const r = runGravitationalTimeDilationExperiment(s)
      expect(tickCountAt(r, RUN_DURATION_FLOOR_SECONDS, 'ceiling')).toBeLessThanOrEqual(tickAxisTop(s))
    })
  })

  it('workedNumbers match the page wording', () => {
    const w = workedNumbers()
    expect(w.momentFloorTicks.toFixed(2)).toBe('5.00')
    expect(w.momentCeilingTicks.toFixed(2)).toBe('7.14')
    expect(w.ceilingTotalAt0p1.toFixed(2)).toBe('11.11')
    expect(w.ceilingTotalAt0p3.toFixed(2)).toBe('14.29')
    expect(w.ceilingTotalAt0p6.toFixed(2)).toBe('25.00')
    expect(w.floorTotal).toBe(10)
    expect(w.ceilingPerFloorAt0p3.toFixed(2)).toBe('1.43')
    // g * h / c^2 = 9.8 * 10 / 299,792,458^2 = 1.0904e-15
    expect(w.realStrength1g10m).toBeCloseTo(1.09e-15, 17)
    expect(w.realStrength1g10m.toPrecision(3)).toBe('1.09e-15')
  })
})
