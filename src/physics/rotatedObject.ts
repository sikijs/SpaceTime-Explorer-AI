import { lorentzTransform } from './lorentzTransform'
import { timeDilationFactorFor } from './movingClockExperiment'

// Spacetime Geometry, Experiment 10: a fast object looks rotated, not squashed
// (docs/experiments/spacetime-geometry/10-rotated-not-squashed.md).
// Units: c = 1, so a speed is a fraction of the speed of light (written β in the specification), and lengths are in the cube's own
// units (the cube's side at rest is `side`). The cube moves along x (the leading face points toward +x). The camera is very far away in
// the direction of -y, looking straight across the cube's path, so the light from every part of the cube travels along parallel lines
// toward -y. The depth `y` of a point is how far it is from the camera's side of the cube: the front face is at depth 0 and the back
// face at depth `side`. The photograph records the light that arrives at one moment: the same moment for every point, so light from
// a point at depth y left y ÷ c earlier than light from a point at depth 0.
//
// The rule: the lab measures the cube's width along the motion at one lab time as D × side (length contraction, Experiment 6). The
// light from a point at depth y left y earlier, and the cube moved β y in that time, so that point appears β y behind where it is
// measured to be at the moment of the photograph. The corners' positions in the photograph therefore give the front face (D × side) and
// the trailing face (β × side), and the same widths as a cube at rest turned by arcsin β.

function assertSpeed(speed: number): void {
  if (!(Number.isFinite(speed) && speed >= 0 && speed < 1)) throw new RangeError(`the speed must be from 0 up to, but not including, c, got ${speed}`)
}

function assertPositive(value: number, name: string): void {
  if (!(Number.isFinite(value) && value > 0)) throw new RangeError(`${name} must be a positive number, got ${value}`)
}

// The front face's width as the lab measures it at one lab time: D × side (Experiment 6).
export function frontFaceWidth(speed: number, side = 1): number {
  assertSpeed(speed)
  assertPositive(side, 'the side')
  return timeDilationFactorFor(speed) * side
}

// The trailing face's apparent width in the photograph: β × side. The back face's light left `side` ÷ c earlier, and the cube moved
// β × side in that time.
export function trailingFaceWidth(speed: number, side = 1): number {
  assertSpeed(speed)
  assertPositive(side, 'the side')
  return speed * side
}

// The photograph's total width: the front face plus the trailing face.
export function photographWidth(speed: number, side = 1): number {
  return frontFaceWidth(speed, side) + trailingFaceWidth(speed, side)
}

// The angle, in degrees, by which a cube at rest would have to be turned to look the same in a photograph: sin θ = β.
export function apparentTurnDegrees(speed: number): number {
  assertSpeed(speed)
  return (Math.asin(speed) * 180) / Math.PI
}

export type CornerName = 'frontTrailing' | 'frontLeading' | 'backTrailing' | 'backLeading'

export interface CubeCorner {
  name: CornerName
  restX: number // position along the motion in the cube's own frame (0 for trailing corners, side for leading ones)
  depth: number // distance from the camera's side of the cube: 0 at the front face, side at the back face
  labX: number // where the lab measures the corner at the moment of the photograph (one lab time)
  emittedEarlierBy: number // how much earlier than the photograph the light now arriving left this corner: depth ÷ c
  labXWhenLightLeft: number // where the corner was when that light left it
  imageX: number // where the corner appears in the photograph (parallel rays, so the same as labXWhenLightLeft)
}

export interface RotatedCubeResult {
  speed: number
  side: number
  timeDilationFactor: number // D
  corners: CubeCorner[]
  measuredWidth: number // the lab's measured width along the motion, D × side
  frontFaceWidth: number // the front face as it appears in the photograph
  trailingFaceWidth: number // the trailing face as it appears in the photograph
  photographWidth: number
  leadingFaceVisible: boolean
  turnDegrees: number // arcsin β
  restPhotographWidth: number // a cube at rest: the plain square, `side`
  turnedFrontFaceWidth: number // a cube at rest turned by `turnDegrees`: side × cos θ
  turnedSideFaceWidth: number // and its side face: side × sin θ
}

// Works out, for each corner of the cube, where it appears in the photograph, by asking when the light that arrives now left it. The
// cube's corners at rest are built in its own frame, and the lab's measurement at one lab time is found with the Lorentz transformation
// (the same position as D × the rest position, Experiment 6). The corners' apparent positions then give the widths; nothing here
// uses the closed forms `frontFaceWidth`, `trailingFaceWidth` or `photographWidth`.
export function runRotatedCube(speed: number, side = 1): RotatedCubeResult {
  assertSpeed(speed)
  assertPositive(side, 'the side')
  const D = timeDilationFactorFor(speed)
  const specs: { name: CornerName; restX: number; depth: number }[] = [
    { name: 'frontTrailing', restX: 0, depth: 0 },
    { name: 'frontLeading', restX: side, depth: 0 },
    { name: 'backTrailing', restX: 0, depth: side },
    { name: 'backLeading', restX: side, depth: side },
  ]
  const corners: CubeCorner[] = specs.map(({ name, restX, depth }) => {
    // The corner's worldline in the cube's own frame is x' = restX. The event on it that the lab assigns the lab time 0 is the one at
    // time t' = −β x'. The lab's coordinates of that event come from the transformation by velocity −β (the lab, as the cube's frame
    // sees it).
    const labEvent = lorentzTransform({ time: -speed * restX, position: restX }, -speed)
    const labX = labEvent.position
    const emittedEarlierBy = depth // c = 1: the extra distance to the camera, as a travel time
    const labXWhenLightLeft = labX - speed * emittedEarlierBy
    return { name, restX, depth, labX, emittedEarlierBy, labXWhenLightLeft, imageX: labXWhenLightLeft }
  })
  const at = (name: CornerName) => corners.find((corner) => corner.name === name) as CubeCorner
  const frontWidth = at('frontLeading').imageX - at('frontTrailing').imageX
  const trailingWidth = at('frontTrailing').imageX - at('backTrailing').imageX
  const xs = corners.map((corner) => corner.imageX)
  const turn = apparentTurnDegrees(speed)
  const turnRadians = (turn * Math.PI) / 180
  return {
    speed,
    side,
    timeDilationFactor: D,
    corners,
    measuredWidth: at('frontLeading').labX - at('frontTrailing').labX,
    frontFaceWidth: frontWidth,
    trailingFaceWidth: trailingWidth,
    photographWidth: Math.max(...xs) - Math.min(...xs),
    // The leading face would show if a back leading corner appeared beyond the front leading corner.
    leadingFaceVisible: at('backLeading').imageX > at('frontLeading').imageX + 1e-12,
    turnDegrees: turn,
    restPhotographWidth: side,
    turnedFrontFaceWidth: side * Math.cos(turnRadians),
    turnedSideFaceWidth: side * Math.sin(turnRadians),
  }
}

// The radius of a moving sphere's outline in the photograph. The lab measures the sphere as an ellipse with semi-axes D R along the
// motion and R across it, and the lag shears it by β per unit of depth, so its outline's half-width is √((D R)² + (β R)²) = R, the
// sphere's own radius, at every speed.
export function sphereOutlineRadius(speed: number, radius = 1): number {
  assertSpeed(speed)
  assertPositive(radius, 'the radius')
  const D = timeDilationFactorFor(speed)
  return Math.sqrt((D * radius) ** 2 + (speed * radius) ** 2)
}
