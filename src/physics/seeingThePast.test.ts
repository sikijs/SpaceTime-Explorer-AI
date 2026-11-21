import { describe, it, expect } from 'vitest'
import { classifyEventPair } from './lightCones'
import {
  PART_ONE_DIRECTION,
  PART_ONE_SPEED,
  RUN_DISTANCE,
  STRIP_MAX_C,
  checkUpRows,
  closedFormImageSpeed,
  guessStretch,
  imageComparedWithShip,
  lookingRange,
  measuredPositionAt,
  runSeeingExperiment,
  seenAt,
  stripPosition,
} from './seeingThePast'
import type { Direction, SpeedGuess } from './seeingThePast'

const DIRECTIONS: Direction[] = ['approaching', 'receding']
const SPREAD = [0.01, 0.1, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9, 0.99]
const PRESETS = [0.3, 0.5, 0.6, 0.9]

describe('Seeing the past physics (Spacetime Geometry, Experiment 4)', () => {
  it('matches the hand-worked examples at 0.6c', () => {
    const approaching = runSeeingExperiment('approaching', 0.6)
    expect(approaching.firstLooking).toBeCloseTo(5, 10)
    expect(approaching.lastLooking).toBeCloseTo(7 + 2 / 3, 10) // 4 ÷ 0.6 + 1 = 7.67
    expect(approaching.measuredDuration).toBeCloseTo(4 / 0.6, 10)
    expect(approaching.imageDuration).toBeCloseTo(8 / 3, 10) // 2.67
    expect(approaching.imageSpeed).toBeCloseTo(1.5, 10)

    const receding = runSeeingExperiment('receding', 0.6)
    expect(receding.firstLooking).toBeCloseTo(1, 10)
    expect(receding.lastLooking).toBeCloseTo(11 + 2 / 3, 10) // 6.67 + 5 = 11.67
    expect(receding.imageDuration).toBeCloseTo(32 / 3, 10) // 10.67
    expect(receding.imageSpeed).toBeCloseTo(0.375, 10)

    // The first and last images are the ship's start and end positions.
    const first = seenAt('approaching', 0.6, 5)
    expect(first.emissionTime).toBeCloseTo(0, 10)
    expect(first.seenPosition).toBeCloseTo(5, 10)
    const last = seenAt('approaching', 0.6, 7 + 2 / 3)
    expect(last.emissionTime).toBeCloseTo(4 / 0.6, 10)
    expect(last.seenPosition).toBeCloseTo(1, 10)
  })

  it('every seen event is linked to its looking event by light, and is earlier', () => {
    for (const direction of DIRECTIONS) {
      for (const speed of SPREAD) {
        for (const s of runSeeingExperiment(direction, speed).samples) {
          const seen = { time: s.emissionTime, position: s.seenPosition }
          const looking = { time: s.lookingTime, position: 0 }
          expect(classifyEventPair(seen, looking)).toBe('light-only')
          expect(s.emissionTime).toBeLessThan(s.lookingTime)
        }
      }
    }
  })

  it('the measured speed from the samples is the chosen speed', () => {
    for (const direction of DIRECTIONS) {
      for (const speed of SPREAD) {
        const { samples } = runSeeingExperiment(direction, speed)
        const a = samples[0]
        const b = samples[samples.length - 1]
        const found = Math.abs(b.measuredPosition - a.measuredPosition) / (b.lookingTime - a.lookingTime)
        expect(found).toBeCloseTo(speed, 10)
      }
    }
  })

  it('the image speed matches the closed forms v ÷ (1 − v) and v ÷ (1 + v)', () => {
    for (const speed of SPREAD) {
      expect(runSeeingExperiment('approaching', speed).imageSpeed).toBeCloseTo(speed / (1 - speed), 8)
      expect(runSeeingExperiment('receding', speed).imageSpeed).toBeCloseTo(speed / (1 + speed), 8)
    }
  })

  it('reproduces the specification table for the four presets', () => {
    // The table in the specification is rounded to two decimals (0.375 is shown as 0.38), so allow half a unit
    // in the last place plus a little for the exact-half case.
    const approaching = [0.43, 1.0, 1.5, 9.0]
    const receding = [0.23, 0.33, 0.38, 0.47]
    PRESETS.forEach((speed, i) => {
      expect(Math.abs(runSeeingExperiment('approaching', speed).imageSpeed - approaching[i])).toBeLessThan(0.006)
      expect(Math.abs(runSeeingExperiment('receding', speed).imageSpeed - receding[i])).toBeLessThan(0.006)
    })
  })

  it('an approaching image is faster than the ship and a receding image is slower', () => {
    for (const speed of SPREAD) {
      expect(runSeeingExperiment('approaching', speed).imageSpeed).toBeGreaterThan(speed)
      expect(runSeeingExperiment('receding', speed).imageSpeed).toBeLessThan(speed)
    }
  })

  it('the approaching image is faster than light exactly when v > 0.5; the receding image stays below 0.5', () => {
    for (const speed of SPREAD) {
      const approaching = runSeeingExperiment('approaching', speed).imageSpeed
      if (speed > 0.5) expect(approaching).toBeGreaterThan(1)
      else if (speed < 0.5) expect(approaching).toBeLessThan(1)
      else expect(approaching).toBeCloseTo(1, 10)
      expect(runSeeingExperiment('receding', speed).imageSpeed).toBeLessThan(0.5)
    }
    expect(runSeeingExperiment('receding', 0.999).imageSpeed).toBeGreaterThan(0.49)
  })

  it('the seen ship is the earlier ship: farther from the lab when approaching, nearer when receding', () => {
    for (const speed of SPREAD) {
      for (const s of runSeeingExperiment('approaching', speed).samples) {
        expect(s.seenPosition).toBeGreaterThanOrEqual(s.measuredPosition - 1e-12)
      }
      for (const s of runSeeingExperiment('receding', speed).samples) {
        expect(s.seenPosition).toBeLessThanOrEqual(s.measuredPosition + 1e-12)
      }
    }
  })

  it('a later emission time always gives a later looking time', () => {
    for (const direction of DIRECTIONS) {
      for (const speed of SPREAD) {
        const { samples } = runSeeingExperiment(direction, speed)
        for (let i = 1; i < samples.length; i++) {
          expect(samples[i].emissionTime).toBeGreaterThan(samples[i - 1].emissionTime)
          expect(samples[i].lookingTime).toBeGreaterThan(samples[i - 1].lookingTime)
        }
      }
    }
  })

  it('as v shrinks, the image speed approaches the ship speed', () => {
    for (const direction of DIRECTIONS) {
      const gaps = [0.1, 0.01, 0.001].map(
        (speed) => Math.abs(runSeeingExperiment(direction, speed).imageSpeed - speed),
      )
      expect(gaps[1]).toBeLessThan(gaps[0])
      expect(gaps[2]).toBeLessThan(gaps[1])
      expect(gaps[2]).toBeLessThan(0.001)
    }
  })

  it('the ship covers 4 light-seconds, both as measured and as seen', () => {
    for (const direction of DIRECTIONS) {
      for (const speed of SPREAD) {
        const run = runSeeingExperiment(direction, speed)
        expect(run.distanceCovered).toBeCloseTo(RUN_DISTANCE, 10)
        expect(run.measuredSpeed * run.measuredDuration).toBeCloseTo(RUN_DISTANCE, 10)
      }
    }
  })

  it('throws RangeError for out-of-range inputs', () => {
    for (const direction of DIRECTIONS) {
      for (const bad of [0, -0.5, 1, 1.5, NaN]) {
        expect(() => runSeeingExperiment(direction, bad)).toThrow(RangeError)
        expect(() => seenAt(direction, bad, 5)).toThrow(RangeError)
      }
      const { first, last } = lookingRange(direction, 0.6)
      expect(() => seenAt(direction, 0.6, first - 0.01)).toThrow(RangeError)
      expect(() => seenAt(direction, 0.6, last + 0.01)).toThrow(RangeError)
      expect(() => seenAt(direction, 0.6, NaN)).toThrow(RangeError)
    }
  })

  it('is a pure function of (direction, speed)', () => {
    for (const direction of DIRECTIONS) {
      expect(runSeeingExperiment(direction, 0.6)).toEqual(runSeeingExperiment(direction, 0.6))
    }
  })
})

// ---- The audit update (Spacetime Geometry 4, 2026-11-21): Part 1's fixed case, the strip of speeds, the check-up ----

const GUESSES: SpeedGuess[] = ['slower', 'same', 'faster']

describe('Part 1 is fixed on a spaceship coming toward the lab at 0.6c', () => {
  it('uses the specification\'s headline case: it looks to move at 1.5c', () => {
    expect(PART_ONE_DIRECTION).toBe('approaching')
    expect(PART_ONE_SPEED).toBe(0.6)
    const run = runSeeingExperiment(PART_ONE_DIRECTION, PART_ONE_SPEED)
    expect(run.imageSpeed).toBeCloseTo(1.5, 12)
    expect(run.measuredDuration).toBeCloseTo(4 / 0.6, 12)
    expect(run.imageDuration).toBeCloseTo(4 / 1.5, 12)
  })
})

describe('closedFormImageSpeed: v ÷ (1 − v) approaching, v ÷ (1 + v) receding', () => {
  it('gives 1.5c approaching and 0.375c receding at 0.6c (the specification\'s figures)', () => {
    expect(closedFormImageSpeed('approaching', 0.6)).toBeCloseTo(1.5, 12)
    expect(closedFormImageSpeed('receding', 0.6)).toBeCloseTo(0.375, 12)
  })

  it('equals the speed the run measures from its two arrival times, at every direction and speed tested', () => {
    for (const direction of DIRECTIONS) {
      for (const v of SPREAD) {
        expect(closedFormImageSpeed(direction, v)).toBeCloseTo(runSeeingExperiment(direction, v).imageSpeed, 10)
      }
    }
  })

  it('rejects a speed that is not above 0 and below c', () => {
    for (const bad of [0, 1, 1.2, -0.1, NaN]) expect(() => closedFormImageSpeed('approaching', bad)).toThrow(RangeError)
  })
})

describe('imageComparedWithShip: what the tutor marks the guess against', () => {
  it('approaching images are faster, receding images are slower, at every speed on the page', () => {
    for (const v of PRESETS) {
      expect(imageComparedWithShip('approaching', v)).toBe('faster')
      expect(imageComparedWithShip('receding', v)).toBe('slower')
    }
  })

  it('"the same" is never the answer at any speed above 0 and below c (the answer choice is a natural guess, never right)', () => {
    for (const direction of DIRECTIONS) {
      for (const v of SPREAD) expect(imageComparedWithShip(direction, v)).not.toBe('same')
    }
  })

  it('Part 1\'s answer is "faster"', () => {
    expect(imageComparedWithShip(PART_ONE_DIRECTION, PART_ONE_SPEED)).toBe('faster')
  })
})

describe('the strip of image speeds and the white guess marker', () => {
  it('runs from 0 to 2c, so that Part 1\'s image speed (1.5c) fits', () => {
    expect(STRIP_MAX_C).toBe(2)
    expect(runSeeingExperiment(PART_ONE_DIRECTION, PART_ONE_SPEED).imageSpeed).toBeLessThan(STRIP_MAX_C)
  })

  it('stripPosition puts 0 at the left end, 2c at the right end and 1c in the middle', () => {
    expect(stripPosition(0)).toBe(0)
    expect(stripPosition(STRIP_MAX_C)).toBe(1)
    expect(stripPosition(1)).toBeCloseTo(0.5, 12)
    expect(stripPosition(5)).toBe(1) // clamped
    expect(() => stripPosition(-0.1)).toThrow(RangeError)
  })

  it('"slower" names the stretch from 0 to the real speed, "the same" the tick at the real speed, "faster" the stretch above it', () => {
    expect(guessStretch('slower', 0.6)).toEqual({ from: 0, to: 0.6 })
    expect(guessStretch('same', 0.6)).toEqual({ from: 0.6, to: 0.6 })
    expect(guessStretch('faster', 0.6)).toEqual({ from: 0.6, to: STRIP_MAX_C })
  })

  it('a different guess gives a different stretch, in the order slower, the same, faster', () => {
    const stretches = GUESSES.map((g) => guessStretch(g, 0.6))
    expect(new Set(stretches.map((r) => `${r.from}-${r.to}`)).size).toBe(3)
    expect(stretches[0].to).toBeLessThanOrEqual(stretches[1].from)
    expect(stretches[1].to).toBeLessThanOrEqual(stretches[2].from)
  })

  it('every stretch lies inside the strip, for every speed the strip can show', () => {
    for (const v of [0.1, 0.3, 0.5, 0.6, 0.9, 0.99]) {
      for (const g of GUESSES) {
        const { from, to } = guessStretch(g, v)
        expect(from).toBeGreaterThanOrEqual(0)
        expect(to).toBeLessThanOrEqual(STRIP_MAX_C)
        expect(to).toBeGreaterThanOrEqual(from)
      }
    }
  })

  it('Part 1\'s real image speed lies inside the "faster" stretch, and outside the other two', () => {
    const image = runSeeingExperiment(PART_ONE_DIRECTION, PART_ONE_SPEED).imageSpeed
    const inside = (g: SpeedGuess) => {
      const { from, to } = guessStretch(g, PART_ONE_SPEED)
      return image > from && image <= to
    }
    expect(inside('faster')).toBe(true)
    expect(inside('slower')).toBe(false)
    expect(inside('same')).toBe(false)
  })

  it('rejects a real speed that is not above 0 and below c', () => {
    expect(() => guessStretch('faster', 0)).toThrow(RangeError)
    expect(() => guessStretch('slower', 1)).toThrow(RangeError)
  })
})

describe('checkUpRows: the page\'s numbers set beside what the same physics gives', () => {
  const rows = checkUpRows(PART_ONE_DIRECTION, PART_ONE_SPEED)
  const byId = (id: string) => rows.find((r) => r.id === id)!

  it('has the three rows of the draft, in order: image speed, distance, time', () => {
    expect(rows.map((r) => r.id)).toEqual(['image-speed', 'image-distance', 'image-time'])
  })

  it('image speed: the run\'s 1.50c against the formula 0.6 ÷ 0.4, the same', () => {
    const r = byId('image-speed')
    expect(r.page).toBeCloseTo(1.5, 12)
    expect(r.expected).toBeCloseTo(closedFormImageSpeed(PART_ONE_DIRECTION, PART_ONE_SPEED), 12)
    expect(r.reading).toBe('the same')
  })

  it('image distance: 4 light-seconds against the spaceship\'s own distance, the same', () => {
    const r = byId('image-distance')
    expect(r.page).toBeCloseTo(RUN_DISTANCE, 12)
    const start = measuredPositionAt(PART_ONE_DIRECTION, PART_ONE_SPEED, 0)
    const end = measuredPositionAt(PART_ONE_DIRECTION, PART_ONE_SPEED, runSeeingExperiment(PART_ONE_DIRECTION, PART_ONE_SPEED).measuredDuration)
    expect(r.expected).toBeCloseTo(Math.abs(end - start), 12)
    expect(r.reading).toBe('the same')
  })

  it('image time: 2.67 s against the spaceship\'s 6.67 s, less by 4.00 s', () => {
    const r = byId('image-time')
    expect(r.page).toBeCloseTo(4 / 1.5, 12)
    expect(r.expected).toBeCloseTo(4 / 0.6, 12)
    expect(r.reading).toBe('less')
    expect(r.gap).toBeCloseTo(4, 12)
  })

  it('"the same" is said only when the two numbers agree at the two decimals the page shows; otherwise "more" or "less" with the gap', () => {
    for (const direction of DIRECTIONS) {
      for (const v of PRESETS) {
        for (const r of checkUpRows(direction, v)) {
          const same = Math.abs(r.page - r.expected) < 0.005
          expect(r.reading === 'the same').toBe(same)
          if (!same) expect(r.reading).toBe(r.page > r.expected ? 'more' : 'less')
          expect(r.gap).toBeCloseTo(Math.abs(r.page - r.expected), 12)
        }
      }
    }
  })

  it('every row, for every direction and preset speed, has finite numbers', () => {
    for (const direction of DIRECTIONS) {
      for (const v of PRESETS) {
        for (const r of checkUpRows(direction, v)) {
          expect(Number.isFinite(r.page)).toBe(true)
          expect(Number.isFinite(r.expected)).toBe(true)
          expect(Number.isFinite(r.gap)).toBe(true)
        }
      }
    }
  })

  it('for a receding spaceship at 0.6c the speed row reads "the same" and the time row reads "more": the image takes longer than the spaceship', () => {
    const receding = checkUpRows('receding', 0.6)
    expect(receding.find((r) => r.id === 'image-speed')!.reading).toBe('the same')
    expect(receding.find((r) => r.id === 'image-time')!.reading).toBe('more')
  })
})
