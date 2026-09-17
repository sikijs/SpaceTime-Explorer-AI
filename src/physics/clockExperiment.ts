// Physics model for Experiment 1 — "What Does a Clock Measure?"
// See docs/experiments/01-clock.md for the authoritative specification.
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
