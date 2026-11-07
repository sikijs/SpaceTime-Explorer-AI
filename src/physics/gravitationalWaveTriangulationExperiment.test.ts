import { describe, expect, it } from 'vitest'
import {
  arrivalOrderFor,
  arrivalSummary,
  arrivalTimeSeconds,
  compareWord,
  DETECTORS,
  DIRECTION_PRESETS,
  firstDetectorGuessMatches,
  firstDetectorOutcome,
  gapVersusLimitWord,
  pairLimitMs,
  REAL_SPEED_OF_LIGHT_KM_PER_S,
  timingGuessMarker,
  timingGuessMatches,
  timingOutcome,
  TIMELINE_MAX_MS,
  TRIANGULATION_PART1_DIRECTION_INDEX,
  yourDirectionComparison,
} from './gravitationalWaveTriangulationExperiment'
import type { DetectorName } from './gravitationalWaveTriangulationExperiment'

function distanceKm(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function centroidOfDetectors(): { x: number; y: number } {
  const x = DETECTORS.reduce((sum, d) => sum + d.x, 0) / DETECTORS.length
  const y = DETECTORS.reduce((sum, d) => sum + d.y, 0) / DETECTORS.length
  return { x, y }
}

describe('arrivalTimeSeconds', () => {
  it('is 0 for a detector placed exactly at the array centroid, for any direction', () => {
    const centroid = centroidOfDetectors()
    const atCentroid = { name: 'Centroid', ...centroid }

    for (const directionDegrees of [0, 45, 90, 180, 250, 315]) {
      expect(arrivalTimeSeconds(atCentroid, directionDegrees)).toBeCloseTo(0, 9)
    }
  })

  it('gives a pair of detectors an arrival-time gap equal to their separation / c, for a direction aligned exactly along the line between them', () => {
    const hanford = DETECTORS.find((d) => d.name === 'Hanford')!
    const livingston = DETECTORS.find((d) => d.name === 'Livingston')!

    // Hanford and Livingston are both at y = 0 in the schematic, so the line between them points
    // exactly along the 0-degree direction.
    const directionDegrees = 0
    const expectedGapSeconds = distanceKm(hanford, livingston) / REAL_SPEED_OF_LIGHT_KM_PER_S

    const gapSeconds = Math.abs(
      arrivalTimeSeconds(livingston, directionDegrees) - arrivalTimeSeconds(hanford, directionDegrees),
    )

    expect(gapSeconds).toBeCloseTo(expectedGapSeconds, 9)
  })

  it('gives a pair of detectors an arrival-time gap of 0 for a direction perpendicular to the line between them', () => {
    const hanford = DETECTORS.find((d) => d.name === 'Hanford')!
    const livingston = DETECTORS.find((d) => d.name === 'Livingston')!

    // The 90-degree direction is perpendicular to the 0-degree Hanford-Livingston line.
    const directionDegrees = 90

    const gapSeconds = Math.abs(
      arrivalTimeSeconds(livingston, directionDegrees) - arrivalTimeSeconds(hanford, directionDegrees),
    )

    expect(gapSeconds).toBeCloseTo(0, 9)
  })

  it('never gives a pair of detectors an arrival-time gap larger than their separation / c, for any direction', () => {
    const sampleDirections = Array.from({ length: 24 }, (_, i) => i * 15) // 0, 15, 30, ..., 345

    for (const directionDegrees of sampleDirections) {
      for (const a of DETECTORS) {
        for (const b of DETECTORS) {
          if (a === b) continue

          const maxPossibleGapSeconds = distanceKm(a, b) / REAL_SPEED_OF_LIGHT_KM_PER_S
          const gapSeconds = Math.abs(
            arrivalTimeSeconds(a, directionDegrees) - arrivalTimeSeconds(b, directionDegrees),
          )

          expect(gapSeconds).toBeLessThanOrEqual(maxPossibleGapSeconds + 1e-9)
        }
      }
    }
  })
})

describe('arrivalOrderFor', () => {
  it('gives each of the three direction presets a different full arrival order', () => {
    const orders = DIRECTION_PRESETS.map((preset) =>
      arrivalOrderFor(preset.directionDegrees)
        .map((arrival) => arrival.detector.name)
        .join(' -> '),
    )

    expect(new Set(orders).size).toBe(DIRECTION_PRESETS.length)
  })

  it('sorts arrivals from earliest (most negative) to latest time', () => {
    for (const preset of DIRECTION_PRESETS) {
      const order = arrivalOrderFor(preset.directionDegrees)
      for (let i = 1; i < order.length; i++) {
        expect(order[i].arrivalTimeSeconds).toBeGreaterThanOrEqual(order[i - 1].arrivalTimeSeconds)
      }
    }
  })
})

describe('the audit additions (draft wording, section 10)', () => {
  const A = DIRECTION_PRESETS[TRIANGULATION_PART1_DIRECTION_INDEX]
  const names: DetectorName[] = ['Hanford', 'Livingston', 'Virgo']

  it('uses Direction A for Part 1 and reproduces the three arrival tables the draft quotes', () => {
    expect(A.label).toBe('Direction A')
    const expected: Array<[number, DetectorName, number, number]> = [
      [0, 'Virgo', 5.8, 15.81],
      [250, 'Hanford', 3.42, 28.27],
      [280, 'Livingston', 1.74, 22.96],
    ]
    for (const [degrees, first, second, third] of expected) {
      const summary = arrivalSummary(degrees)
      expect(summary.firstDetector).toBe(first)
      expect(summary.order[0].afterFirstMs).toBe(0)
      expect(summary.order[1].afterFirstMs).toBeCloseTo(second, 2)
      expect(summary.order[2].afterFirstMs).toBeCloseTo(third, 2)
      expect(summary.maxGapMs).toBeCloseTo(third, 2)
    }
  })

  it('gives the three pair limits (10.01, 29.02 and 25.02 ms) and never lets a gap exceed its limit, for any direction', () => {
    expect(pairLimitMs('Hanford', 'Livingston')).toBeCloseTo(10.01, 2)
    expect(pairLimitMs('Hanford', 'Virgo')).toBeCloseTo(29.02, 2)
    expect(pairLimitMs('Livingston', 'Virgo')).toBeCloseTo(25.02, 2)
    for (let degrees = 0; degrees < 360; degrees += 5) {
      for (const pair of arrivalSummary(degrees).pairGaps) expect(pair.gapMs).toBeLessThanOrEqual(pair.limitMs + 1e-6)
    }
  })

  it('has Direction A pair gaps of 10.01, 15.81 and 5.80 ms, with Hanford to Livingston exactly at its limit', () => {
    const gaps = arrivalSummary(A.directionDegrees).pairGaps
    expect(gaps[0].gapMs).toBeCloseTo(10.01, 2)
    expect(gaps[1].gapMs).toBeCloseTo(15.81, 2)
    expect(gaps[2].gapMs).toBeCloseTo(5.8, 2)
    expect(gapVersusLimitWord(gaps[0].gapMs, gaps[0].limitMs)).toBe('at the limit')
    expect(gapVersusLimitWord(gaps[1].gapMs, gaps[1].limitMs)).toBe('less than the limit')
    expect(gapVersusLimitWord(gaps[2].gapMs, gaps[2].limitMs)).toBe('less than the limit')
    expect(gaps[1].gapMs / gaps[1].limitMs).toBeCloseTo(0.54, 2)
    expect(gaps[2].gapMs / gaps[2].limitMs).toBeCloseTo(0.23, 2)
  })

  it('rejects a gap larger than its limit', () => {
    expect(() => gapVersusLimitWord(10.5, 10.01)).toThrow(RangeError)
  })

  it('holds the largest gap of every preset on the timeline scale', () => {
    for (const preset of DIRECTION_PRESETS) expect(arrivalSummary(preset.directionDegrees).maxGapMs).toBeLessThan(TIMELINE_MAX_MS)
    expect(TIMELINE_MAX_MS - Math.max(...DIRECTION_PRESETS.map((p) => arrivalSummary(p.directionDegrees).maxGapMs))).toBeLessThan(2)
  })

  it('decides the first detector and the timing class in the module, for every direction and choice', () => {
    for (const preset of DIRECTION_PRESETS) {
      expect(names.filter((choice) => firstDetectorGuessMatches(choice, preset.directionDegrees))).toHaveLength(1)
      expect(timingOutcome(preset.directionDegrees)).toBe('different') // no preset has a gap under 0.01 ms
      expect(timingGuessMatches('different', preset.directionDegrees)).toBe(true)
      expect(timingGuessMatches('same', preset.directionDegrees)).toBe(false)
    }
    expect(firstDetectorOutcome(A.directionDegrees)).toBe('Virgo')
    expect(firstDetectorGuessMatches('Hanford', A.directionDegrees)).toBe(false)
    expect(firstDetectorOutcome(250)).toBe('Hanford')
    expect(firstDetectorOutcome(280)).toBe('Livingston')
  })

  it('calls the timing "same" only for a gap below 0.01 ms (a direction perpendicular to every pair would be needed)', () => {
    // 90 degrees is perpendicular to the Hanford-Livingston line, but the other two pairs still differ
    expect(timingOutcome(90)).toBe('different')
  })

  it('gives a different marker for each timing guess, and never reads the direction', () => {
    expect(timingGuessMarker('same')).toBe('equals')
    expect(timingGuessMarker('different')).toBe('notEqual')
  })

  it('says "the same" in every Table 2 row at Direction A, and "different" or "more" once the direction changes', () => {
    const atA = yourDirectionComparison(0)
    expect(atA.atPart1Direction).toBe(true)
    for (const word of Object.values(atA.words)) expect(word).toBe('the same')
    const atB = yourDirectionComparison(1)
    expect(atB.atPart1Direction).toBe(false)
    expect(atB.words.first).toBe('different')
    expect(atB.words.maxGap).toBe('more')
    expect(atB.everyGapWithinLimit).toBe(true)
    // Hanford to Virgo at B is 28.27 ms against a limit of 29.02: within 3 percent
    const hv = atB.yours.pairGaps[1]
    expect(1 - hv.gapMs / hv.limitMs).toBeLessThan(0.03)
    const atC = yourDirectionComparison(2)
    expect(atC.words.maxGap).toBe('more')
    expect(() => yourDirectionComparison(7)).toThrow(RangeError)
  })

  it('compareWord uses only equality for "the same"', () => {
    expect(compareWord(5, 5)).toBe('the same')
    expect(compareWord(5.01, 5)).toBe('more')
    expect(compareWord(4.99, 5)).toBe('less')
  })
})
