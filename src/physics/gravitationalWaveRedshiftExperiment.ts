// Models the Doppler redshift of a gravitational wave from a source receding directly along the
// line of sight. Reuses gravitationalWaveChirpExperiment.ts's chirpStateAt/chirpRunFor unchanged
// for the chirp itself, and movingClockExperiment.ts's timeDilationFactorFor unchanged for the
// relativistic part. The only new physics here is the classical (non-relativistic) Doppler
// stretching factor, combined with that reused time dilation factor to produce the exact
// relativistic Doppler formula (see this experiment's specification, "Physics Model").
import { timeDilationFactorFor, SPEED_OF_LIGHT } from './movingClockExperiment'

// The classical (non-relativistic) Doppler stretching factor for a source receding directly
// along the line of sight — the same relationship a receding sound or light source already
// follows. Not a new physical idea; a direct restatement of the everyday Doppler effect.
export function classicalDopplerFactorFor(speed: number): number {
  return 1 / (1 + speed / SPEED_OF_LIGHT)
}

// The full relativistic Doppler factor: the classical stretching above, combined with this
// project's own time dilation factor (reused unchanged, not reintroduced). This is the exact
// relativistic Doppler formula, built from two pieces the learner already has rather than
// presented as one new, unexplained equation.
export function dopplerFactorFor(speed: number): number {
  return classicalDopplerFactorFor(speed) * timeDilationFactorFor(speed)
}
