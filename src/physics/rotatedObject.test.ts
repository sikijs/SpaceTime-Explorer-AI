import { describe, it, expect } from 'vitest'
import { apparentTurnDegrees, frontFaceWidth, photographWidth, runRotatedCube, sphereOutlineRadius, trailingFaceWidth } from './rotatedObject'
import type { CornerName } from './rotatedObject'

// Tests for Experiment 10 (docs/experiments/spacetime-geometry/10-rotated-not-squashed.md, "Required Physics Tests"). The numbers in the
// specification's table are written out here by hand, so a wrong formula in the module cannot make a test pass.

const SPEEDS = [0.3, 0.6, 0.9, 0.99]
const dilation = (speed: number) => Math.sqrt(1 - speed * speed)

// An independent brute-force route that does not use the module: a camera at (0, −R) far from the cube, and the cube's corners moving
// at a signed velocity along x. For each corner, find (by bisection) the time its light left it so that the light arrives at the camera at
// the moment T_obs, and take the direction the camera sees it in, written as a position across the image at the camera's distance R.
// The lab positions at the moment of the photograph (lab time 0) are the contracted ones: the corner at rest position x' is at D x'.
const CAMERA_DISTANCE = 1e7
function imageXOfCorner(restX: number, depth: number, signedSpeed: number): number {
  const D = dilation(Math.abs(signedSpeed))
  const xAtPhoto = D * restX // lab position at lab time 0 (Experiment 6), for a cube whose trailing edge is at 0 then
  const arrival = CAMERA_DISTANCE // the light from a point at depth 0 and x = 0, leaving at time 0, arrives at R
  const cornerAt = (t: number) => xAtPhoto + signedSpeed * t
  const gap = (t: number) => arrival - t - Math.hypot(cornerAt(t), depth + CAMERA_DISTANCE)
  let low = -1e3
  let high = 1e3
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2
    if (gap(mid) > 0) low = mid
    else high = mid
  }
  const leftAt = (low + high) / 2
  return (cornerAt(leftAt) * CAMERA_DISTANCE) / (depth + CAMERA_DISTANCE)
}

const CORNERS: { name: CornerName; restX: number; depth: number }[] = [
  { name: 'frontTrailing', restX: 0, depth: 0 },
  { name: 'frontLeading', restX: 1, depth: 0 },
  { name: 'backTrailing', restX: 0, depth: 1 },
  { name: 'backLeading', restX: 1, depth: 1 },
]

describe('a cube at rest (test 1)', () => {
  it('is the plain square: front face 1, no trailing face, total 1, no turn', () => {
    const result = runRotatedCube(0)
    expect(result.frontFaceWidth).toBeCloseTo(1, 12)
    expect(result.trailingFaceWidth).toBeCloseTo(0, 12)
    expect(result.photographWidth).toBeCloseTo(1, 12)
    expect(result.turnDegrees).toBe(0)
    expect(result.leadingFaceVisible).toBe(false)
    expect(frontFaceWidth(0)).toBe(1)
    expect(trailingFaceWidth(0)).toBe(0)
    expect(photographWidth(0)).toBe(1)
  })
})

describe('the brute-force route with a camera far away (test 2)', () => {
  it('puts each corner where the light that arrives now left from, and gives the same widths as the closed forms', () => {
    for (const speed of SPEEDS) {
      const result = runRotatedCube(speed)
      for (const corner of CORNERS) {
        const brute = imageXOfCorner(corner.restX, corner.depth, speed)
        const model = result.corners.find((c) => c.name === corner.name)!.imageX
        expect(brute).toBeCloseTo(model, 4)
      }
      const frontWidth = imageXOfCorner(1, 0, speed) - imageXOfCorner(0, 0, speed)
      const trailing = imageXOfCorner(0, 0, speed) - imageXOfCorner(0, 1, speed)
      expect(frontWidth).toBeCloseTo(dilation(speed), 4)
      expect(trailing).toBeCloseTo(speed, 4)
      expect(frontWidth + trailing).toBeCloseTo(dilation(speed) + speed, 4)
    }
  })
})

describe('the lab measures the cube contracted (test 3)', () => {
  it('has the width D × side along the motion at one lab time, and the depth unchanged, from the Lorentz transformation', () => {
    for (const speed of SPEEDS) {
      for (const side of [1, 2.5]) {
        const result = runRotatedCube(speed, side)
        expect(result.measuredWidth).toBeCloseTo(dilation(speed) * side, 9)
        const back = result.corners.filter((c) => c.depth > 0)
        expect(back.length).toBe(2)
        for (const c of result.corners) expect(c.depth === 0 || c.depth === side).toBe(true)
      }
    }
  })
})

describe('the rotation route (test 4)', () => {
  it('has the same two widths as a cube at rest turned by arcsin β, projected flat', () => {
    for (const speed of SPEEDS) {
      const theta = Math.asin(speed)
      // A square at rest, turned by θ about the vertical axis, seen from the camera's side: each corner (x, y) goes to the flat position
      // x cos θ + y sin θ across the picture. The front face runs from the corner (0, 0) to (1, 0), the side face from (0, 0) to (0, 1).
      const across = (x: number, y: number) => x * Math.cos(theta) + y * Math.sin(theta)
      const turnedFront = across(1, 0) - across(0, 0)
      const turnedSide = across(0, 1) - across(0, 0)
      const result = runRotatedCube(speed)
      expect(result.frontFaceWidth).toBeCloseTo(turnedFront, 9)
      expect(result.trailingFaceWidth).toBeCloseTo(turnedSide, 9)
      expect(result.turnedFrontFaceWidth).toBeCloseTo(turnedFront, 9)
      expect(result.turnedSideFaceWidth).toBeCloseTo(turnedSide, 9)
    }
  })
})

describe('the specification table (test 5)', () => {
  const D = [0.954, 0.8, 0.436, 0.141]
  const total = [1.254, 1.4, 1.336, 1.131]
  const turn = [17.46, 36.87, 64.16, 81.89]
  it('matches the table to the digits written there', () => {
    SPEEDS.forEach((speed, i) => {
      expect(frontFaceWidth(speed)).toBeCloseTo(D[i], 3)
      expect(trailingFaceWidth(speed)).toBeCloseTo(speed, 12)
      expect(photographWidth(speed)).toBeCloseTo(total[i], 3)
      expect(apparentTurnDegrees(speed)).toBeCloseTo(turn[i], 2)
    })
  })

  it('has the worked example of the specification at 0.6c: 0.8 + 0.6 = 1.4, turned 36.9 degrees', () => {
    const result = runRotatedCube(0.6)
    expect(result.frontFaceWidth).toBeCloseTo(0.8, 9)
    expect(result.trailingFaceWidth).toBeCloseTo(0.6, 9)
    expect(result.photographWidth).toBeCloseTo(1.4, 9)
    expect(result.turnDegrees).toBeCloseTo(36.87, 2)
  })
})

describe('the identity behind the rotation (test 6)', () => {
  it('has D² + β² = 1, so cos θ = D and sin θ = β for θ = arcsin β', () => {
    for (const speed of [0.1, ...SPEEDS, 0.999]) {
      expect(dilation(speed) ** 2 + speed ** 2).toBeCloseTo(1, 12)
      const theta = (apparentTurnDegrees(speed) * Math.PI) / 180
      expect(Math.cos(theta)).toBeCloseTo(dilation(speed), 12)
      expect(Math.sin(theta)).toBeCloseTo(speed, 12)
    }
  })
})

describe('how the widths change with speed (test 7)', () => {
  it('has the trailing face rising, the front face falling, and a total above 1 that is largest at β = 1 ÷ √2', () => {
    let previousFront = Infinity
    let previousTrailing = -Infinity
    let bestSpeed = 0
    let best = 0
    for (let speed = 0.01; speed < 0.995; speed += 0.01) {
      const front = frontFaceWidth(speed)
      const trailing = trailingFaceWidth(speed)
      expect(front).toBeLessThan(previousFront)
      expect(trailing).toBeGreaterThan(previousTrailing)
      expect(photographWidth(speed)).toBeGreaterThan(1)
      previousFront = front
      previousTrailing = trailing
      if (photographWidth(speed) > best) {
        best = photographWidth(speed)
        bestSpeed = speed
      }
    }
    expect(bestSpeed).toBeCloseTo(1 / Math.SQRT2, 2)
    expect(photographWidth(1 / Math.SQRT2)).toBeCloseTo(Math.SQRT2, 9)
    expect(apparentTurnDegrees(1 / Math.SQRT2)).toBeCloseTo(45, 9)
  })
})

describe('the leading face is never seen (test 8)', () => {
  it('has no back leading corner beyond the front leading corner, at any speed', () => {
    for (const speed of [0, 0.1, ...SPEEDS, 0.999, 0.99999]) {
      const result = runRotatedCube(speed)
      expect(result.leadingFaceVisible).toBe(false)
      const frontLeading = result.corners.find((c) => c.name === 'frontLeading')!.imageX
      const backLeading = result.corners.find((c) => c.name === 'backLeading')!.imageX
      expect(backLeading).toBeLessThanOrEqual(frontLeading + 1e-12)
    }
  })
})

describe('moving the other way (test 9)', () => {
  it('gives the mirror image of the photograph: the leading face is then on the left and the trailing face on the right', () => {
    for (const speed of SPEEDS) {
      // The cube moving to the left, by the brute-force route with a negative velocity. Its corners at the moment of the photograph are at
      // −D × (rest position), mirroring the cube moving to the right.
      const right = (x: number, y: number) => imageXOfCorner(x, y, speed)
      const left = (x: number, y: number) => -imageXOfCorner(x, y, speed) // the mirror image, by symmetry
      const directLeft = (x: number, y: number) => imageXOfCorner(-x, y, -speed) // the cube mirrored in x, moving left
      for (const corner of CORNERS) {
        expect(directLeft(corner.restX, corner.depth)).toBeCloseTo(left(corner.restX, corner.depth), 4)
        expect(right(corner.restX, corner.depth)).toBeCloseTo(-directLeft(corner.restX, corner.depth), 4)
      }
    }
  })
})

describe('a moving sphere (test 10)', () => {
  it('has an outline of its own radius in the photograph, at every speed', () => {
    for (const speed of SPEEDS) {
      for (const radius of [1, 3]) {
        const D = dilation(speed)
        // Points on the sphere in its own frame, put at one lab time (x × D) and sheared by the lag (a point at depth y appears β y
        // behind), then looked at from the camera: the picture shows the position across the motion (x) and the height (z).
        let largestX = 0
        let largestZ = 0
        let largestRadius = 0
        const steps = 200
        for (let i = 0; i <= steps; i++) {
          const polar = (Math.PI * i) / steps
          for (let j = 0; j < 2 * steps; j++) {
            const azimuth = (Math.PI * j) / steps
            const restX = radius * Math.sin(polar) * Math.cos(azimuth)
            const depth = radius * Math.sin(polar) * Math.sin(azimuth)
            const height = radius * Math.cos(polar)
            const imageX = D * restX - speed * depth
            largestX = Math.max(largestX, Math.abs(imageX))
            largestZ = Math.max(largestZ, Math.abs(height))
            largestRadius = Math.max(largestRadius, Math.hypot(imageX, height))
          }
        }
        expect(largestX).toBeCloseTo(radius, 3)
        expect(largestZ).toBeCloseTo(radius, 3)
        expect(largestRadius).toBeCloseTo(radius, 3)
        expect(sphereOutlineRadius(speed, radius)).toBeCloseTo(radius, 9)
      }
    }
  })
})

describe('scaling (test 11)', () => {
  it('doubles every width when the side is doubled', () => {
    for (const speed of SPEEDS) {
      const one = runRotatedCube(speed, 1)
      const two = runRotatedCube(speed, 2)
      expect(two.frontFaceWidth).toBeCloseTo(2 * one.frontFaceWidth, 9)
      expect(two.trailingFaceWidth).toBeCloseTo(2 * one.trailingFaceWidth, 9)
      expect(two.photographWidth).toBeCloseTo(2 * one.photographWidth, 9)
      expect(two.turnDegrees).toBeCloseTo(one.turnDegrees, 12)
    }
  })
})

describe('out-of-range input (test 12)', () => {
  it('throws RangeError for a speed below 0 or at or above 1, and for a non-positive side or radius', () => {
    expect(() => runRotatedCube(-0.1)).toThrow(RangeError)
    expect(() => runRotatedCube(1)).toThrow(RangeError)
    expect(() => runRotatedCube(1.5)).toThrow(RangeError)
    expect(() => runRotatedCube(Number.NaN)).toThrow(RangeError)
    expect(() => runRotatedCube(0.5, 0)).toThrow(RangeError)
    expect(() => runRotatedCube(0.5, -1)).toThrow(RangeError)
    expect(() => frontFaceWidth(1)).toThrow(RangeError)
    expect(() => trailingFaceWidth(-0.1)).toThrow(RangeError)
    expect(() => photographWidth(0.5, 0)).toThrow(RangeError)
    expect(() => apparentTurnDegrees(1)).toThrow(RangeError)
    expect(() => sphereOutlineRadius(0.5, 0)).toThrow(RangeError)
    expect(() => sphereOutlineRadius(1, 1)).toThrow(RangeError)
  })
})
