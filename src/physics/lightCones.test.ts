import { describe, it, expect } from 'vitest'
import {
  EVENT_O,
  PRESET_EVENTS,
  classifyEventPair,
  runLightConeExperiment,
  speedNeeded,
} from './lightCones'
import type { EventRelation } from './lightCones'

const PASSING_SPEEDS = [-0.99, -0.8, -0.5, -0.3, 0, 0.3, 0.5, 0.8, 0.99]
const OFFERED_SPEEDS = [-0.5, -0.3, 0, 0.3, 0.5]
const EXPECTED: { relation: EventRelation; interval: number; speed: number }[] = [
  { relation: 'reachable', interval: 16, speed: 0.6 },
  { relation: 'reachable', interval: 9, speed: 0.8 },
  { relation: 'light-only', interval: 0, speed: 1 },
  { relation: 'unreachable', interval: -16, speed: 5 / 3 },
  { relation: 'unreachable', interval: -9, speed: 1.25 },
]

describe('Light cone physics (Spacetime Geometry, Experiment 2)', () => {
  it('classifies the five preset events as in the specification table', () => {
    PRESET_EVENTS.forEach((event, i) => {
      expect(classifyEventPair(EVENT_O, event)).toBe(EXPECTED[i].relation)
      expect(runLightConeExperiment(event, 0).lab.intervalSquared).toBeCloseTo(EXPECTED[i].interval, 12)
    })
  })

  it('speedNeeded is |x| ÷ t, and Infinity for distance with no time', () => {
    PRESET_EVENTS.forEach((event, i) => {
      expect(speedNeeded(EVENT_O, event)).toBeCloseTo(EXPECTED[i].speed, 12)
    })
    expect(speedNeeded({ time: 2, position: 0 }, { time: 2, position: 3 })).toBe(Infinity)
  })

  it("the passing observer's interval squared equals the lab's, for every preset and speed", () => {
    for (const event of PRESET_EVENTS) {
      for (const u of PASSING_SPEEDS) {
        const result = runLightConeExperiment(event, u)
        expect(result.passing.intervalSquared).toBeCloseTo(result.lab.intervalSquared, 6)
      }
    }
  })

  it("the passing observer's relation equals the lab's, for every preset and speed", () => {
    for (const event of PRESET_EVENTS) {
      for (const u of PASSING_SPEEDS) {
        const result = runLightConeExperiment(event, u)
        expect(result.passing.relation).toBe(result.lab.relation)
      }
    }
  })

  it('a light-only pair stays light-only: transformed time and distance are equal in size', () => {
    const lightOnly = PRESET_EVENTS[2]
    for (const u of PASSING_SPEEDS) {
      const { passing } = runLightConeExperiment(lightOnly, u)
      expect(passing.relation).toBe('light-only')
      expect(Math.abs(passing.distanceBetween)).toBeCloseTo(Math.abs(passing.timeBetween), 9)
    }
  })

  it('speed needed is below 1 for reachable pairs and above 1 for unreachable pairs, for both observers', () => {
    for (const event of PRESET_EVENTS) {
      for (const u of PASSING_SPEEDS) {
        const { lab, passing } = runLightConeExperiment(event, u)
        if (lab.relation === 'reachable') {
          expect(lab.speedNeeded).toBeLessThan(1)
          expect(passing.speedNeeded).toBeLessThan(1)
        } else if (lab.relation === 'unreachable') {
          expect(lab.speedNeeded).toBeGreaterThan(1)
          expect(passing.speedNeeded).toBeGreaterThan(1)
        }
      }
    }
  })

  it("the passing observer's time and distance differ from the lab's when u is not 0", () => {
    for (const event of PRESET_EVENTS) {
      const { lab, passing } = runLightConeExperiment(event, 0.5)
      expect(Math.abs(passing.timeBetween - lab.timeBetween)).toBeGreaterThan(0.1)
      expect(Math.abs(passing.distanceBetween - lab.distanceBetween)).toBeGreaterThan(0.1)
    }
  })

  it('at u = 0 the passing observer agrees with the lab on everything', () => {
    for (const event of PRESET_EVENTS) {
      const { lab, passing } = runLightConeExperiment(event, 0)
      expect(passing.timeBetween).toBeCloseTo(lab.timeBetween, 12)
      expect(passing.distanceBetween).toBeCloseTo(lab.distanceBetween, 12)
    }
  })

  it('the time between the events keeps its sign for reachable and light-only pairs; for unreachable pairs it can flip', () => {
    for (const event of PRESET_EVENTS) {
      const relation = runLightConeExperiment(event, 0).lab.relation
      if (relation === 'unreachable') continue
      for (const u of PASSING_SPEEDS) {
        expect(runLightConeExperiment(event, u).passing.timeBetween).toBeGreaterThan(0)
      }
    }
    // Documents what the next experiment needs. Not shown to the learner here (Decision 6).
    expect(runLightConeExperiment(PRESET_EVENTS[3], 0.8).passing.timeBetween).toBeLessThan(0)
    expect(runLightConeExperiment(PRESET_EVENTS[4], -0.99).passing.timeBetween).toBeLessThan(0)
  })

  it('at the offered passing speeds (|u| <= 0.5), no preset event changes its order', () => {
    for (const event of PRESET_EVENTS) {
      for (const u of OFFERED_SPEEDS) {
        expect(runLightConeExperiment(event, u).passing.timeBetween).toBeGreaterThan(0)
      }
    }
  })

  it('the light front at the event time is t on the side of B, and its position matches the relation', () => {
    PRESET_EVENTS.forEach((event, i) => {
      const { lightFrontPositionAtEventTime: front } = runLightConeExperiment(event, 0)
      expect(Math.abs(front)).toBe(event.time)
      expect(Math.sign(front)).toBe(Math.sign(event.position))
      const frontReachedB = Math.abs(front) - Math.abs(event.position)
      const relation = EXPECTED[i].relation
      if (relation === 'reachable') expect(frontReachedB).toBeGreaterThan(0)
      if (relation === 'light-only') expect(frontReachedB).toBe(0)
      if (relation === 'unreachable') expect(frontReachedB).toBeLessThan(0)
    })
  })

  it('throws RangeError for out-of-range input', () => {
    expect(() => runLightConeExperiment(PRESET_EVENTS[0], 1)).toThrow(RangeError)
    expect(() => runLightConeExperiment(PRESET_EVENTS[0], -1)).toThrow(RangeError)
    expect(() => runLightConeExperiment(PRESET_EVENTS[0], 1.2)).toThrow(RangeError)
    expect(() => runLightConeExperiment({ time: 0, position: 2 }, 0)).toThrow(RangeError)
    expect(() => runLightConeExperiment({ time: -1, position: 2 }, 0)).toThrow(RangeError)
  })

  it('the result is a pure function of (event, u)', () => {
    expect(runLightConeExperiment(PRESET_EVENTS[3], 0.3)).toEqual(runLightConeExperiment(PRESET_EVENTS[3], 0.3))
  })
})
