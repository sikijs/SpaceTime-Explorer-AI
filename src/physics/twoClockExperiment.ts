export interface ClockEvent {
  clockReadingA: number
  clockReadingB: number
  simulationTime: number
}

export interface TwoClockExperimentResult {
  experimentDuration: number
  startEvent: ClockEvent
  endEvent: ClockEvent
  elapsedTimeA: number
  elapsedTimeB: number
  difference: number
}

export function runTwoClockExperiment(
  durationSeconds: number
): TwoClockExperimentResult {
  // Initial state: both clocks at rest, synchronized at 00:00:00
  const initialReading = 0

  // Start event
  const startEvent: ClockEvent = {
    clockReadingA: initialReading,
    clockReadingB: initialReading,
    simulationTime: 0,
  }

  // End event: after duration seconds
  // Both clocks advance at the same rate since they're at rest in the same frame
  const finalReading = durationSeconds

  const endEvent: ClockEvent = {
    clockReadingA: finalReading,
    clockReadingB: finalReading,
    simulationTime: durationSeconds,
  }

  // Calculate elapsed time for each clock
  const elapsedTimeA = endEvent.clockReadingA - startEvent.clockReadingA
  const elapsedTimeB = endEvent.clockReadingB - startEvent.clockReadingB

  // Difference between elapsed times
  const difference = Math.abs(elapsedTimeA - elapsedTimeB)

  return {
    experimentDuration: durationSeconds,
    startEvent,
    endEvent,
    elapsedTimeA,
    elapsedTimeB,
    difference,
  }
}

// --- Audit update (2026-11-08): each clock read separately, and where the guesses sit on the Event Interval strip ---
// The strip's scale runs from 0 to twice the experiment's duration. It depends only on the duration, never on the guesses,
// so the real picture does not change with a guess.

export interface ClockReadingsAt {
  clockReadingA: number
  clockReadingB: number
}

// Each clock's reading at a simulation time from 0 to the duration, taken from the model for each clock separately.
// (The model makes both equal; the interface reads each clock from here instead of sharing one value.)
export function clockReadingsAt(durationSeconds: number, simulationTime: number): ClockReadingsAt {
  const { startEvent, endEvent } = runTwoClockExperiment(durationSeconds)
  const progress = durationSeconds > 0 ? Math.min(Math.max(simulationTime / durationSeconds, 0), 1) : 1
  return {
    clockReadingA: startEvent.clockReadingA + progress * (endEvent.clockReadingA - startEvent.clockReadingA),
    clockReadingB: startEvent.clockReadingB + progress * (endEvent.clockReadingB - startEvent.clockReadingB),
  }
}

export interface GuessOnStrip {
  fraction: number
  offEdge: 'left' | 'right' | null
  differenceFromReal: number
}

export interface GuessPositionsOnStrip {
  scaleEnd: number
  clockA: GuessOnStrip
  clockB: GuessOnStrip
}

export function twoClockStripScaleEnd(durationSeconds: number): number {
  return 2 * durationSeconds
}

export function guessPositionsOnStrip(durationSeconds: number, guessA: number, guessB: number): GuessPositionsOnStrip {
  if (!isFinite(guessA) || !isFinite(guessB)) {
    throw new Error('Each guess must be a finite number of seconds')
  }
  const scaleEnd = twoClockStripScaleEnd(durationSeconds)
  const result = runTwoClockExperiment(durationSeconds)
  const place = (guess: number, elapsed: number): GuessOnStrip => {
    const raw = scaleEnd > 0 ? guess / scaleEnd : 0
    return {
      fraction: Math.min(1, Math.max(0, raw)),
      offEdge: raw < 0 ? 'left' : raw > 1 ? 'right' : null,
      differenceFromReal: guess - elapsed,
    }
  }
  return { scaleEnd, clockA: place(guessA, result.elapsedTimeA), clockB: place(guessB, result.elapsedTimeB) }
}
