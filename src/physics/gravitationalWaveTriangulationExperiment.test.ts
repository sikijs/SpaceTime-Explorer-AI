import { describe, expect, it } from 'vitest'
import {
  arrivalOrderFor,
  arrivalTimeSeconds,
  DETECTORS,
  DIRECTION_PRESETS,
  REAL_SPEED_OF_LIGHT_KM_PER_S,
} from './gravitationalWaveTriangulationExperiment'

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
