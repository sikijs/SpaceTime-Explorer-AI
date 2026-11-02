import { describe, it, expect } from 'vitest'
import { actualOutcome } from './Experiment10'
import { runTwinParadoxExperiment } from '../physics/twinParadoxExperiment'

describe('Experiment 10 actual outcome', () => {
  it('says the Earth twin is older, as the physics gives, at every speed', () => {
    ;[0.01, 0.1, 0.3, 0.5, 0.6, 0.8, 0.9].forEach((v) => {
      const result = runTwinParadoxExperiment(2, v)
      expect(result.travelerElapsedTime).toBeLessThan(result.labElapsedTime)
      expect(actualOutcome()).toBe('earthOlder')
    })
  })
})
