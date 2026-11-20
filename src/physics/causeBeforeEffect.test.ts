import { describe, it, expect } from 'vitest'
import {
  checkUpRows,
  eventOrder,
  guessMarkerSpeed,
  guessMatchesStrip,
  guessRegion,
  orderFromStrip,
  orderStripForEvent,
  regionsOnStrip,
  runCauseBeforeEffectExperiment,
  simultaneitySpeed,
} from './causeBeforeEffect'
import { PRESET_EVENTS } from './lightCones'

const SPREAD = [-0.999, -0.99, -0.9, -0.8, -0.6, -0.3, 0, 0.3, 0.6, 0.8, 0.9, 0.99, 0.999]
// Preset indexes: 0 and 1 are reachable, 2 is light only, 3 and 4 are unreachable.
const NOT_UNREACHABLE = [0, 1, 2]
const [UNREACHABLE_RIGHT, UNREACHABLE_LEFT] = [PRESET_EVENTS[3], PRESET_EVENTS[4]]

// The time between O and B for an observer moving at u, computed here from γ × (t − u × x), independent of lorentzTransform.
function expectedTime(t: number, x: number, u: number): number {
  return (t - u * x) / Math.sqrt(1 - u * u)
}

describe('Cause before effect physics (Spacetime Geometry, Experiment 3)', () => {
  it('eventOrder is o-first, same-moment and b-first for hand-calculated cases', () => {
    expect(eventOrder({ time: 0, position: 0 }, { time: 3, position: 5 })).toBe('o-first')
    expect(eventOrder({ time: 0, position: 0 }, { time: 0, position: 5 })).toBe('same-moment')
    expect(eventOrder({ time: 0, position: 0 }, { time: -2, position: 5 })).toBe('b-first')
    // The two cells of the table in the specification: (3 s, 5 ls) at +0.6c and at +0.9c.
    expect(runCauseBeforeEffectExperiment(UNREACHABLE_RIGHT, 0.6).passing.order).toBe('same-moment')
    expect(runCauseBeforeEffectExperiment(UNREACHABLE_RIGHT, 0.9).passing.order).toBe('b-first')
    // The worked example: γ = 2.294, 2.294 × (3 − 4.5) = −3.44 s, 2.294 × (5 − 2.7) = 5.28 ls.
    const example = runCauseBeforeEffectExperiment(UNREACHABLE_RIGHT, 0.9).passing
    expect(example.timeBetween).toBeCloseTo(-3.441, 3)
    expect(example.distanceBetween).toBeCloseTo(5.277, 3)
    expect(example.intervalSquared).toBeCloseTo(-16, 9)
  })

  it('reachable and light-only events are o-first for every passing speed, for the lab and the passing observer', () => {
    for (const i of NOT_UNREACHABLE) {
      for (const u of SPREAD) {
        const result = runCauseBeforeEffectExperiment(PRESET_EVENTS[i], u)
        expect(result.lab.order).toBe('o-first')
        expect(result.passing.order).toBe('o-first')
        expect(result.passing.timeBetween).toBeGreaterThan(0)
      }
    }
  })

  it('an unreachable event is b-first beyond the same-moment speed, same-moment at it, and o-first on the other side', () => {
    // (3 s, 5 ls): same moment at +0.6c. Above it the order flips; below it does not.
    for (const u of SPREAD) {
      const order = runCauseBeforeEffectExperiment(UNREACHABLE_RIGHT, u).passing.order
      const expected = Math.abs(u - 0.6) < 1e-12 ? 'same-moment' : u > 0.6 ? 'b-first' : 'o-first'
      expect(order).toBe(expected)
    }
    // (4 s, −5 ls): same moment at −0.8c. Below it the order flips; above it does not.
    for (const u of SPREAD) {
      const order = runCauseBeforeEffectExperiment(UNREACHABLE_LEFT, u).passing.order
      const expected = Math.abs(u + 0.8) < 1e-12 ? 'same-moment' : u < -0.8 ? 'b-first' : 'o-first'
      expect(order).toBe(expected)
    }
  })

  it('simultaneitySpeed is t ÷ x for the unreachable presets and null for the others', () => {
    expect(simultaneitySpeed(UNREACHABLE_RIGHT)).toBeCloseTo(0.6, 12)
    expect(simultaneitySpeed(UNREACHABLE_LEFT)).toBeCloseTo(-0.8, 12)
    for (const i of NOT_UNREACHABLE) expect(simultaneitySpeed(PRESET_EVENTS[i])).toBeNull()
    expect(simultaneitySpeed({ time: 2, position: 0 })).toBeNull()
  })

  it('whenever the passing observer finds a different order from the lab, the pair is unreachable (grid)', () => {
    for (let t = 0.5; t <= 10; t += 0.5) {
      for (let x = -10; x <= 10; x += 0.5) {
        const event = { time: t, position: x }
        for (const u of SPREAD) {
          const result = runCauseBeforeEffectExperiment(event, u)
          if (result.passing.order !== result.lab.order) {
            expect(result.lab.relation).toBe('unreachable')
          }
        }
      }
    }
  })

  it("the passing observer's interval squared and relation equal the lab's, for every preset and speed", () => {
    for (const event of PRESET_EVENTS) {
      for (const u of SPREAD) {
        const { lab, passing } = runCauseBeforeEffectExperiment(event, u)
        expect(passing.intervalSquared).toBeCloseTo(lab.intervalSquared, 6)
        expect(passing.relation).toBe(lab.relation)
      }
    }
  })

  it("the passing observer's time between the events equals γ × (t − u × x), computed independently", () => {
    for (const event of PRESET_EVENTS) {
      for (const u of [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]) {
        const { passing } = runCauseBeforeEffectExperiment(event, u)
        expect(passing.timeBetween).toBeCloseTo(expectedTime(event.time, event.position, u), 9)
      }
    }
    // A few cells of the specification's table.
    expect(runCauseBeforeEffectExperiment(PRESET_EVENTS[0], -0.9).passing.timeBetween).toBeCloseTo(17.67, 2)
    expect(runCauseBeforeEffectExperiment(PRESET_EVENTS[2], 0.9).passing.timeBetween).toBeCloseTo(0.69, 2)
    expect(runCauseBeforeEffectExperiment(PRESET_EVENTS[4], -0.9).passing.timeBetween).toBeCloseTo(-1.15, 2)
  })

  it('sameMomentLineSlope equals u, and B is above the line exactly when the passing observer finds O first', () => {
    for (const event of PRESET_EVENTS) {
      for (const u of SPREAD) {
        const result = runCauseBeforeEffectExperiment(event, u)
        expect(result.sameMomentLineSlope).toBe(u)
        const heightAboveLine = event.time - result.sameMomentLineSlope * event.position
        if (Math.abs(heightAboveLine) > 1e-9) {
          expect(result.passing.order).toBe(heightAboveLine > 0 ? 'o-first' : 'b-first')
        } else {
          expect(result.passing.order).toBe('same-moment')
        }
      }
    }
  })

  it('every same-moment line through O stays outside the light cone (|slope| < 1)', () => {
    for (const u of SPREAD) {
      const { sameMomentLineSlope } = runCauseBeforeEffectExperiment(PRESET_EVENTS[0], u)
      expect(Math.abs(sameMomentLineSlope)).toBeLessThan(1)
    }
  })

  it('at u = 0 the passing observer agrees with the lab on everything', () => {
    for (const event of PRESET_EVENTS) {
      const { lab, passing } = runCauseBeforeEffectExperiment(event, 0)
      expect(passing.timeBetween).toBeCloseTo(lab.timeBetween, 12)
      expect(passing.distanceBetween).toBeCloseTo(lab.distanceBetween, 12)
      expect(passing.order).toBe(lab.order)
    }
  })

  it('throws RangeError for out-of-range input', () => {
    expect(() => runCauseBeforeEffectExperiment(PRESET_EVENTS[0], 1)).toThrow(RangeError)
    expect(() => runCauseBeforeEffectExperiment(PRESET_EVENTS[0], -1)).toThrow(RangeError)
    expect(() => runCauseBeforeEffectExperiment(PRESET_EVENTS[0], 1.5)).toThrow(RangeError)
    expect(() => runCauseBeforeEffectExperiment({ time: 0, position: 2 }, 0)).toThrow(RangeError)
    expect(() => runCauseBeforeEffectExperiment({ time: -1, position: 2 }, 0)).toThrow(RangeError)
  })

  it('the result is a pure function of (event, u)', () => {
    expect(runCauseBeforeEffectExperiment(UNREACHABLE_RIGHT, 0.9)).toEqual(runCauseBeforeEffectExperiment(UNREACHABLE_RIGHT, 0.9))
  })

  describe('Audit update: the strip of speeds, the guess marker and the check-up', () => {
    it('the strip splits at the flip speed for the two unreachable presets, with the sides the specification gives', () => {
      const right = orderStripForEvent(UNREACHABLE_RIGHT)
      expect(right.flipSpeed).toBeCloseTo(0.6, 12)
      expect(right.stretches.map((s) => s.order)).toEqual(['o-first', 'b-first'])
      expect(right.stretches[0].from).toBe(-1)
      expect(right.stretches[0].to).toBeCloseTo(0.6, 12)
      expect(right.stretches[1].to).toBe(1)
      const left = orderStripForEvent(UNREACHABLE_LEFT)
      expect(left.flipSpeed).toBeCloseTo(-0.8, 12)
      expect(left.stretches.map((s) => s.order)).toEqual(['b-first', 'o-first'])
    })

    it('reachable and light-only events have one o-first stretch and no flip speed or b-first stretch', () => {
      for (const i of NOT_UNREACHABLE) {
        const strip = orderStripForEvent(PRESET_EVENTS[i])
        expect(strip.flipSpeed).toBeNull()
        expect(strip.stretches).toEqual([{ order: 'o-first', from: -1, to: 1 }])
        expect(regionsOnStrip(strip)).toEqual(['o-first'])
      }
    })

    it('the strip agrees with the Lorentz-transformed order for every preset and every speed in the spread', () => {
      for (const event of PRESET_EVENTS) {
        const strip = orderStripForEvent(event)
        for (const u of [...SPREAD, 0.6, -0.8]) {
          expect(orderFromStrip(strip, u)).toBe(runCauseBeforeEffectExperiment(event, u).passing.order)
        }
      }
    })

    it('the stretches cover −c to +c with no gap, and meet at the flip speed', () => {
      for (const event of PRESET_EVENTS) {
        const strip = orderStripForEvent(event)
        expect(strip.stretches[0].from).toBe(-1)
        expect(strip.stretches[strip.stretches.length - 1].to).toBe(1)
        for (let i = 1; i < strip.stretches.length; i++) {
          expect(strip.stretches[i].from).toBe(strip.stretches[i - 1].to)
          expect(strip.stretches[i].from).toBe(strip.flipSpeed)
        }
      }
    })

    it('each answer names its own kind of place, and the marker lands inside it', () => {
      expect(guessRegion('yes')).toBe('b-first')
      expect(guessRegion('same-moment')).toBe('same-moment')
      expect(guessRegion('no')).toBe('o-first')
      const strip = orderStripForEvent(UNREACHABLE_RIGHT) // Part 1's event: (3 s, 5 ls)
      // yes: the middle of the b-first stretch, 0.6 to 1.
      expect(guessMarkerSpeed('yes', strip)).toBeCloseTo(0.8, 12)
      expect(orderFromStrip(strip, guessMarkerSpeed('yes', strip)!)).toBe('b-first')
      // same moment: the flip speed itself.
      expect(guessMarkerSpeed('same-moment', strip)).toBeCloseTo(0.6, 12)
      expect(orderFromStrip(strip, guessMarkerSpeed('same-moment', strip)!)).toBe('same-moment')
      // no: the middle of the o-first stretch, −1 to 0.6.
      expect(guessMarkerSpeed('no', strip)).toBeCloseTo(-0.2, 12)
      expect(orderFromStrip(strip, guessMarkerSpeed('no', strip)!)).toBe('o-first')
    })

    it('different answers give different markers, and a place the strip does not have gives no marker', () => {
      const strip = orderStripForEvent(UNREACHABLE_RIGHT)
      const marks = (['yes', 'same-moment', 'no'] as const).map((a) => guessMarkerSpeed(a, strip))
      expect(new Set(marks).size).toBe(3)
      const inside = orderStripForEvent(PRESET_EVENTS[0])
      expect(guessMarkerSpeed('yes', inside)).toBeNull()
      expect(guessMarkerSpeed('same-moment', inside)).toBeNull()
      expect(guessMarkerSpeed('no', inside)).toBe(0)
    })

    it('regionsOnStrip lists the real places: all three for an unreachable event, only o-first otherwise', () => {
      expect(regionsOnStrip(orderStripForEvent(UNREACHABLE_RIGHT)).sort()).toEqual(['b-first', 'o-first', 'same-moment'])
      expect(regionsOnStrip(orderStripForEvent(UNREACHABLE_LEFT)).sort()).toEqual(['b-first', 'o-first', 'same-moment'])
    })

    it('guessMatchesStrip: yes holds only where B can be first, no only where it cannot, and the middle answer never holds', () => {
      for (const i of [3, 4]) {
        const strip = orderStripForEvent(PRESET_EVENTS[i])
        expect(guessMatchesStrip('yes', strip)).toBe(true)
        expect(guessMatchesStrip('no', strip)).toBe(false)
        expect(guessMatchesStrip('same-moment', strip)).toBe(false)
      }
      for (const i of NOT_UNREACHABLE) {
        const strip = orderStripForEvent(PRESET_EVENTS[i])
        expect(guessMatchesStrip('yes', strip)).toBe(false)
        expect(guessMatchesStrip('no', strip)).toBe(true)
        expect(guessMatchesStrip('same-moment', strip)).toBe(false)
      }
    })

    it('the strip and the guess marker do not depend on any guess or on the passing speed (pure function of the event)', () => {
      expect(orderStripForEvent(UNREACHABLE_RIGHT)).toEqual(orderStripForEvent({ ...UNREACHABLE_RIGHT }))
    })

    it('the check-up for Part 1 (3 s, 5 ls, +0.3c) says the same on all three rows', () => {
      const rows = checkUpRows(runCauseBeforeEffectExperiment(UNREACHABLE_RIGHT, 0.3))
      expect(rows).toHaveLength(3)
      expect(rows[0]).toMatchObject({ expected: '-16.00', found: '-16.00', same: true })
      expect(rows[1]).toMatchObject({ expected: 'unreachable', found: 'unreachable', same: true })
      expect(rows[2]).toMatchObject({ expected: 'o-first', found: 'o-first', same: true })
    })

    it('every row of the check-up says the same for every preset and every speed', () => {
      for (const event of PRESET_EVENTS) {
        for (const u of [...SPREAD, 0.6, -0.8]) {
          for (const row of checkUpRows(runCauseBeforeEffectExperiment(event, u))) expect(row.same).toBe(true)
        }
      }
    })

    it('orderStripForEvent and orderFromStrip throw RangeError out of range', () => {
      expect(() => orderStripForEvent({ time: 0, position: 3 })).toThrow(RangeError)
      expect(() => orderFromStrip(orderStripForEvent(UNREACHABLE_RIGHT), 1.5)).toThrow(RangeError)
    })
  })
})
