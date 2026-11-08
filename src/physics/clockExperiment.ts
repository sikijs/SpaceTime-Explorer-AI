// Physics model for Experiment 1 — "What Does a Clock Measure?"
// See docs/experiments/relativity-of-time-and-motion/01-clock.md for the authoritative specification.
//
// One simulation time unit corresponds to one second of clock time (spec §4).
// Clock readings and durations are expressed in seconds; formatting to
// HH:MM:SS is a presentation concern and belongs to the UI layer, not here.

export interface ClockEvent {
  label: 'start' | 'end'
  clockReading: number
}

export interface ClockExperimentResult {
  experimentDuration: number
  initialClockReading: number
  finalClockReading: number
  elapsedTime: number
  startEvent: ClockEvent
  endEvent: ClockEvent
}

export function runClockExperiment(durationSeconds: number): ClockExperimentResult {
  const initialClockReading = 0
  const startEvent: ClockEvent = { label: 'start', clockReading: initialClockReading }

  const finalClockReading = initialClockReading + durationSeconds
  const endEvent: ClockEvent = { label: 'end', clockReading: finalClockReading }

  const elapsedTime = finalClockReading - initialClockReading

  return {
    experimentDuration: durationSeconds,
    initialClockReading,
    finalClockReading,
    elapsedTime,
    startEvent,
    endEvent,
  }
}

// --- Audit update (2026-11-08): where a learner's guess sits on the Event Interval strip ---
// The strip's scale runs from 0 to twice the experiment's duration. It depends only on the
// duration, never on the guess, so the real picture does not change with a guess.

export interface GuessOnStrip {
  scaleEnd: number
  fraction: number
  offEdge: 'left' | 'right' | null
  differenceFromReal: number
}

export function stripScaleEnd(durationSeconds: number): number {
  return 2 * durationSeconds
}

export function guessPositionOnStrip(durationSeconds: number, guessSeconds: number): GuessOnStrip {
  if (!isFinite(guessSeconds)) {
    throw new Error('The guess must be a finite number of seconds')
  }
  const scaleEnd = stripScaleEnd(durationSeconds)
  const rawFraction = scaleEnd > 0 ? guessSeconds / scaleEnd : 0
  const offEdge = rawFraction < 0 ? 'left' : rawFraction > 1 ? 'right' : null
  const fraction = Math.min(1, Math.max(0, rawFraction))
  const differenceFromReal = guessSeconds - runClockExperiment(durationSeconds).elapsedTime
  return { scaleEnd, fraction, offEdge, differenceFromReal }
}
