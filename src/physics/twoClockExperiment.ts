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
