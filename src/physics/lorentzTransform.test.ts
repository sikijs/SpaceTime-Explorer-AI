import { describe, it, expect } from 'vitest'
import { lorentzTransform } from './lorentzTransform'
import { spacetimeDiagramFor } from './spacetimeDiagramView'
import { runSimultaneityExperiment } from './relativityOfSimultaneityExperiment'
import { REST_LENGTH } from './lengthContractionExperiment'

const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.9]
const TEST_EVENTS = [
  { position: 0, time: 0 },
  { position: 1.5, time: 2 },
  { position: -0.7, time: 3.2 },
  { position: 2.4, time: 0.1 },
]

describe('Lorentz Transform Physics (Experiment 11)', () => {
  it('is the identity at v = 0, for arbitrary events', () => {
    TEST_EVENTS.forEach((event) => {
      const transformed = lorentzTransform(event, 0)
      expect(transformed.time).toBeCloseTo(event.time, 12)
      expect(transformed.position).toBeCloseTo(event.position, 12)
    })
  })

  it('preserves the invariant interval (time^2 - position^2) for arbitrary events and speeds', () => {
    TEST_EVENTS.forEach((event) => {
      SPEEDS.forEach((v) => {
        const transformed = lorentzTransform(event, v)
        const originalInterval = event.time * event.time - event.position * event.position
        const transformedInterval = transformed.time * transformed.time - transformed.position * transformed.position
        expect(transformedInterval).toBeCloseTo(originalInterval, 10)
      })
    })
  })

  it("matches Experiment 7's own rodFrameEventTime for both back and front events, at every tested speed", () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      const transformedBack = lorentzTransform(diagram.backEvent, v)
      const transformedFront = lorentzTransform(diagram.frontEvent, v)

      expect(transformedBack.time).toBeCloseTo(result.rodFrameEventTime, 10)
      expect(transformedFront.time).toBeCloseTo(result.rodFrameEventTime, 10)
      expect(transformedBack.time).toBeCloseTo(transformedFront.time, 10)
    })
  })

  it("gives a constant rod-frame position for the rod's own worldline endpoints, matching its rest length", () => {
    SPEEDS.forEach((v) => {
      const result = runSimultaneityExperiment(v)
      const diagram = spacetimeDiagramFor(result)

      const backStart = lorentzTransform(diagram.backWorldline[0], v)
      const backEnd = lorentzTransform(diagram.backWorldline[1], v)
      const frontStart = lorentzTransform(diagram.frontWorldline[0], v)
      const frontEnd = lorentzTransform(diagram.frontWorldline[1], v)

      expect(backStart.position).toBeCloseTo(-REST_LENGTH / 2, 10)
      expect(backEnd.position).toBeCloseTo(-REST_LENGTH / 2, 10)
      expect(frontStart.position).toBeCloseTo(REST_LENGTH / 2, 10)
      expect(frontEnd.position).toBeCloseTo(REST_LENGTH / 2, 10)
    })
  })

  it('is deterministic across repeated calls', () => {
    TEST_EVENTS.forEach((event) => {
      SPEEDS.forEach((v) => {
        const a = lorentzTransform(event, v)
        const b = lorentzTransform(event, v)
        expect(a).toEqual(b)
      })
    })
  })
})
