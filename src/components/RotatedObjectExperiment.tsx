import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { frontFaceWidth, runRotatedCube } from '../physics/rotatedObject'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { RotatedObjectTutor } from './RotatedObjectTutor'

// Step 4 of docs/experiments/spacetime-geometry/10-rotated-not-squashed.md (the basic interface): the introduction, the "Words and
// formulas" panel, the speed control, Picture 1 (what the lab measures, with the cube at rest outlined for comparison), the cube at
// rest as the reference photograph, places held for Picture 2 (where the light left from) and the moving cube's photograph, and the
// "How to read this diagram" caption (CLAUDE.md §14).
// Steps 5 and 6 (learner interaction): the two predictions, Run (off until both are made), and the staged run: the cube flies past (Picture
// 1), where the light left from (Picture 2), the moving cube's photograph, then the cube at rest turned by the matching angle.
// Step 7: the results panel (neutral numbers, the predictions recorded and not marked).
// Step 8: the tutor (RotatedObjectTutor.tsx), and the formulas added to the "Words and formulas" panel after the run. The chapter summary
// is in App.tsx and shows after the tutor's explanation. Before the run, the moving cube's photograph and the lag are not shown: they are
// what the predictions ask (§12). Numbers come from `src/physics/rotatedObject.ts` (CLAUDE.md §9).
// Wording here is draft for the owner's review (CLAUDE.md §28.1).

const SPEED_PRESETS = [0.3, 0.6, 0.9, 0.99]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Photograph', meaning: 'the picture a camera records of the light that reaches it at one instant. It is not the same as measuring the cube with a ruler.' },
  { term: 'The faces of the cube', meaning: 'the front face is the one toward the camera, the back face is the one away from it, the leading face is the one that points the way the cube is moving, and the trailing face is the one that points the opposite way. Seen from above, the cube is a square and the four faces are its four sides.' },
  { term: 'Contracted', meaning: 'shorter along the direction of motion, as measured by the lab (Experiment 6 of the first chapter). The factor is D = √(1 − β²), the time dilation factor of Experiment 3, where β is the speed as a fraction of c.' },
  { term: 'Turned (rotated)', meaning: 'a cube is turned when you look at it from an angle, so that you see two of its faces at once. A photograph “looks turned” if it looks like that.' },
  { term: 'Speed written as 0.6c', meaning: 'a fraction of the speed of light, c. 0.6c is six tenths of the speed of light.' },
]

// Added to the panel only after the run: the formulas show how wide each face is, which the predictions ask (§12).
const FORMULA_ENTRIES: { term: string; meaning: string }[] = [
  {
    term: 'The widths in the photograph',
    meaning:
      'With L the cube’s side at rest, β the speed as a fraction of c and D = √(1 − β²): the front face is D × L wide (the contraction of Experiment 6), the trailing face is β × L wide (the back corners’ light left one side’s light travel time earlier, and in that time the cube moved β × L), and the whole photograph is L × (D + β) wide. Example: β = 0.6, so D = 0.8. The front face is 0.8 wide, the trailing face 0.6 wide, and the photograph 1.4 wide, for a cube whose side at rest is 1.',
  },
  {
    term: 'The turn angle θ',
    meaning:
      'A cube at rest, turned by θ, shows a front face L × cos θ wide and a side face L × sin θ wide. These match the moving cube’s photograph when cos θ = D and sin θ = β, which is possible because D² + β² = 1. Example: β = 0.6 gives θ = 36.9°, cos θ = 0.8 and sin θ = 0.6. The cube has not turned. Only its photograph looks as if it had.',
  },
]

type ShapePrediction = 'squashed' | 'same' | 'stretched' | 'turned'
type FacePrediction = 'none' | 'leading' | 'trailing'

// The answers to the two questions in the specification's "Prediction Activity" section (draft wording, §28.1).
const SHAPE_CHOICES: { value: ShapePrediction; label: string }[] = [
  { value: 'squashed', label: 'Squashed along its direction of motion' },
  { value: 'same', label: 'The same as at rest' },
  { value: 'stretched', label: 'Stretched along its direction of motion' },
  { value: 'turned', label: 'Turned, as though the cube were rotated' },
]
const FACE_CHOICES: { value: FacePrediction; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'leading', label: 'The leading face' },
  { value: 'trailing', label: 'The trailing face' },
]

const ANIMATION_DURATION_MS = 12000
// The run's stages, as fractions of the animation: the cube at rest, the cube flies past, where the light left from, the photograph is
// assembled, then the comparison with the turned cube.
const FLY_START = 0.15
const FLY_DONE_AT = 0.35
const LIGHT_DONE_AT = 0.6
const PHOTO_DONE_AT = 0.8

const CAPTION_STYLE: CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--text-muted)',
  padding: '0.75rem 1rem',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
}

const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const LAB_COLOR = '#38bdf8'
const LIGHT_COLOR = '#c4b5fd'
const PHOTO_COLOR = '#facc15'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

const VIEW_WIDTH = 650
const CENTER_X = 325
// The cube's side at rest, in drawing units. Every picture uses this scale.
const SIDE = 150

function PictureTitle({ children, color }: { children: string; color: string }) {
  return (
    <text x="14" y="26" fill={color} fontSize="18" fontWeight="bold" style={HALO}>
      {children}
    </text>
  )
}

// A camera drawn at the bottom of Pictures 1 and 2.
function Camera({ y }: { y: number }) {
  return (
    <g>
      <rect x={CENTER_X - 28} y={y - 58} width="56" height="30" rx="5" fill="#334155" stroke={TEXT_COLOR} strokeWidth="2" />
      <circle cx={CENTER_X} cy={y - 43} r="8" fill="#0b1020" stroke={TEXT_COLOR} strokeWidth="2" />
      <text x={CENTER_X} y={y - 8} fill={TEXT_COLOR} fontSize="15" textAnchor="middle" style={HALO}>
        camera (very far away, below the bottom of this picture)
      </text>
    </g>
  )
}

// Picture 1: the cube from above at the instant of the photograph, as the lab measures it. Motion is to the right, and the camera is far
// away below the picture. The cube at rest is a faint dashed square for comparison; the solid rectangle is the contracted cube, drawn
// about the same centre.
function LabMeasuredPicture({ speed, offset }: { speed: number; offset: number }) {
  const width = SIDE * frontFaceWidth(speed)
  const left = CENTER_X - width / 2
  const right = CENTER_X + width / 2
  const top = 175
  const bottom = top + SIDE
  const restLeft = CENTER_X - SIDE / 2
  const height = 475
  const sideLabelRight = Math.max(right, restLeft + SIDE) + 10
  const sideLabelLeft = Math.min(left, restLeft) - 10
  return (
    <svg viewBox={`0 0 ${VIEW_WIDTH} ${height}`} style={SVG_STYLE} role="img" aria-label="The cube as the lab measures it, seen from above">
      <PictureTitle color={LAB_COLOR}>Picture 1: the cube as the lab’s ruler measures it</PictureTitle>
      <line x1="16" y1="52" x2="46" y2="52" stroke={MUTED_COLOR} strokeWidth="2" strokeDasharray="6 5" />
      <text x="54" y="57" fill={MUTED_COLOR} fontSize="14" style={HALO}>
        dashed outline: the cube when it is not moving
      </text>
      <line x1="16" y1="76" x2="46" y2="76" stroke={LAB_COLOR} strokeWidth="3" />
      <text x="54" y="81" fill={LAB_COLOR} fontSize="14" style={HALO}>
        solid blue: the cube while it moves, as the ruler measures it
      </text>
      <text x="16" y="104" fill={TEXT_COLOR} fontSize="14" style={HALO}>
        We look down on the cube from above, so we see a square, not the cube’s roof.
      </text>
      <line x1={CENTER_X - 60} y1={136} x2={CENTER_X + 60} y2={136} stroke={TEXT_COLOR} strokeWidth="2" />
      <polygon points={`${CENTER_X + 60},136 ${CENTER_X + 50},131 ${CENTER_X + 50},141`} fill={TEXT_COLOR} />
      <text x={CENTER_X + 70} y={141} fill={TEXT_COLOR} fontSize="14" style={HALO}>
        the cube moves this way
      </text>
      <rect x={restLeft} y={top} width={SIDE} height={SIDE} fill="none" stroke={MUTED_COLOR} strokeWidth="2" strokeDasharray="6 5" />
      <rect x={left + offset} y={top} width={width} height={SIDE} fill="rgba(56,189,248,0.25)" stroke={LAB_COLOR} strokeWidth="3" />
      <text x={CENTER_X} y={top - 10} fill={TEXT_COLOR} fontSize="14" textAnchor="middle" style={HALO}>
        back face (the side of the square farthest from the camera)
      </text>
      <text x={CENTER_X} y={bottom + 20} fill={TEXT_COLOR} fontSize="14" textAnchor="middle" style={HALO}>
        front face (the side of the square nearest the camera)
      </text>
      <text x={sideLabelRight} y={top + SIDE / 2 - 4} fill={TEXT_COLOR} fontSize="14" style={HALO}>
        leading face
      </text>
      <text x={sideLabelRight} y={top + SIDE / 2 + 14} fill={MUTED_COLOR} fontSize="13" style={HALO}>
        (the side facing
      </text>
      <text x={sideLabelRight} y={top + SIDE / 2 + 30} fill={MUTED_COLOR} fontSize="13" style={HALO}>
        the way it moves)
      </text>
      <text x={sideLabelLeft} y={top + SIDE / 2 - 4} fill={TEXT_COLOR} fontSize="14" textAnchor="end" style={HALO}>
        trailing face
      </text>
      <text x={sideLabelLeft} y={top + SIDE / 2 + 14} fill={MUTED_COLOR} fontSize="13" textAnchor="end" style={HALO}>
        (the side facing
      </text>
      <text x={sideLabelLeft} y={top + SIDE / 2 + 30} fill={MUTED_COLOR} fontSize="13" textAnchor="end" style={HALO}>
        away from the way it moves)
      </text>
      {[-1, 0, 1].map((k) => (
        <g key={k}>
          <line x1={CENTER_X + k * 60} y1={bottom + 38} x2={CENTER_X + k * 60} y2={height - 70} stroke={LIGHT_COLOR} strokeWidth="1.5" strokeDasharray="5 4" />
          <polygon
            points={`${CENTER_X + k * 60},${height - 62} ${CENTER_X + k * 60 - 5},${height - 72} ${CENTER_X + k * 60 + 5},${height - 72}`}
            fill={LIGHT_COLOR}
          />
        </g>
      ))}
      <text x={CENTER_X + 90} y={bottom + 70} fill={LIGHT_COLOR} fontSize="14" style={HALO}>
        light going to the camera
      </text>
      <Camera y={height} />
    </svg>
  )
}

// Picture 2: the same view, with where each corner was when the light now reaching the camera left it. The front corners did not move
// in that time. The back corners' light left earlier by one side's light travel time, when they were farther back by β × side.
function LightPicture({ speed }: { speed: number }) {
  const result = runRotatedCube(speed)
  const width = SIDE * result.measuredWidth
  const left = CENTER_X - width / 2
  const top = 90
  const bottom = top + SIDE
  const height = 400
  const xOf = (labUnits: number) => left + SIDE * labUnits
  const back = result.corners.filter((corner) => corner.depth > 0)
  const front = result.corners.filter((corner) => corner.depth === 0)
  const lag = result.trailingFaceWidth // how far the cube moved while the extra light travelled: β × side, from the physics module
  const legendX = 440
  return (
    <svg viewBox={`0 0 ${VIEW_WIDTH} ${height}`} style={SVG_STYLE} role="img" aria-label="Where each corner was when the light now reaching the camera left it">
      <PictureTitle color={LIGHT_COLOR}>Picture 2: where the light that reaches the camera came from</PictureTitle>
      <rect x={left} y={top} width={width} height={SIDE} fill="rgba(56,189,248,0.12)" stroke={LAB_COLOR} strokeWidth="2" />
      {front.map((corner) => (
        <g key={corner.name}>
          <line x1={xOf(corner.imageX)} y1={bottom} x2={xOf(corner.imageX)} y2={height - 70} stroke={LIGHT_COLOR} strokeWidth="2" />
          <circle cx={xOf(corner.imageX)} cy={bottom} r="5" fill={LIGHT_COLOR} />
        </g>
      ))}
      {back.map((corner) => (
        <g key={corner.name}>
          <line x1={xOf(corner.imageX)} y1={top} x2={xOf(corner.imageX)} y2={height - 70} stroke={LIGHT_COLOR} strokeWidth="2" />
          <circle cx={xOf(corner.imageX)} cy={top} r="6" fill="none" stroke={LIGHT_COLOR} strokeWidth="2" strokeDasharray="3 2" />
          <circle cx={xOf(corner.labX)} cy={top} r="5" fill={LAB_COLOR} />
          <line x1={xOf(corner.labX)} y1={top - 10} x2={xOf(corner.imageX) + 6} y2={top - 10} stroke={TEXT_COLOR} strokeWidth="1.5" />
          <polygon points={`${xOf(corner.imageX) + 6},${top - 10} ${xOf(corner.imageX) + 14},${top - 14} ${xOf(corner.imageX) + 14},${top - 6}`} fill={TEXT_COLOR} />
          <text x={(xOf(corner.labX) + xOf(corner.imageX)) / 2} y={top - 16} fill={TEXT_COLOR} fontSize="13" textAnchor="middle" style={HALO}>
            {lag.toFixed(2)}
          </text>
        </g>
      ))}
      <line x1="30" y1={top} x2="30" y2={bottom} stroke={TEXT_COLOR} strokeWidth="2" />
      <polygon points={`30,${top} 25,${top + 10} 35,${top + 10}`} fill={TEXT_COLOR} />
      <polygon points={`30,${bottom} 25,${bottom - 10} 35,${bottom - 10}`} fill={TEXT_COLOR} />
      <text x="40" y={top + SIDE / 2 + 5} fill={TEXT_COLOR} fontSize="14" style={HALO}>
        1.00
      </text>
      <rect x={legendX - 8} y="100" width="16" height="12" fill="rgba(56,189,248,0.12)" stroke={LAB_COLOR} strokeWidth="2" />
      <text x={legendX + 14} y="111" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        the cube now (as in Picture 1)
      </text>
      <circle cx={legendX} cy="136" r="5" fill={LAB_COLOR} />
      <text x={legendX + 14} y="141" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        back corner now
      </text>
      <circle cx={legendX} cy="166" r="6" fill="none" stroke={LIGHT_COLOR} strokeWidth="2" strokeDasharray="3 2" />
      <text x={legendX + 14} y="171" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        back corner when its
      </text>
      <text x={legendX + 14} y="187" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        light left
      </text>
      <line x1={legendX - 8} y1="212" x2={legendX + 8} y2="212" stroke={TEXT_COLOR} strokeWidth="1.5" />
      <text x={legendX + 14} y="217" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        arrow and number: how far
      </text>
      <text x={legendX + 14} y="233" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        the cube moved in between
      </text>
      <text x={legendX + 14} y="249" fill={MUTED_COLOR} fontSize="13" style={HALO}>
        (in cube sides)
      </text>
      <line x1={legendX - 8} y1="274" x2={legendX + 8} y2="274" stroke={LIGHT_COLOR} strokeWidth="2" />
      <text x={legendX + 14} y="279" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        light from a corner,
      </text>
      <text x={legendX + 14} y="295" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        going to the camera
      </text>
      <line x1={legendX} y1="312" x2={legendX} y2="334" stroke={TEXT_COLOR} strokeWidth="2" />
      <polygon points={`${legendX},312 ${legendX - 4},320 ${legendX + 4},320`} fill={TEXT_COLOR} />
      <polygon points={`${legendX},334 ${legendX - 4},326 ${legendX + 4},326`} fill={TEXT_COLOR} />
      <text x={legendX + 14} y="319" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        double arrow on the left:
      </text>
      <text x={legendX + 14} y="335" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        the back corners are 1.00
      </text>
      <text x={legendX + 14} y="351" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        (one cube side) farther
      </text>
      <text x={legendX + 14} y="367" fill={TEXT_COLOR} fontSize="13" style={HALO}>
        from the camera
      </text>
      <Camera y={height} />
    </svg>
  )
}

// A picture whose contents appear only after the run (a later step), so the answer to the predictions is not shown in advance (§12).
function HeldPicture({ title, color, note, height }: { title: string; color: string; note: string; height: number }) {
  return (
    <svg viewBox={`0 0 ${VIEW_WIDTH} ${height}`} style={SVG_STYLE} role="img" aria-label={title}>
      <PictureTitle color={color}>{title}</PictureTitle>
      <rect x="40" y="46" width={VIEW_WIDTH - 80} height={height - 70} rx="8" fill="none" stroke={MUTED_COLOR} strokeWidth="2" strokeDasharray="8 6" />
      <text x={CENTER_X} y={46 + (height - 70) / 2 + 5} fill={MUTED_COLOR} fontSize="16" textAnchor="middle" style={HALO}>
        {note}
      </text>
    </svg>
  )
}

// A photograph drawn as faces side by side, trailing (or side) face on the left, darker, then the front face. Every width is written on
// it, so the picture never relies on shade alone.
function Photograph({ x, y, sideWidth, frontWidth, sideName, label, total }: { x: number; y: number; sideWidth: number; frontWidth: number; sideName: string; label: string[]; total?: number }) {
  const sideW = SIDE * sideWidth
  const frontW = SIDE * frontWidth
  const lines = total === undefined ? label : [...label, `total width ${total.toFixed(2)}`]
  return (
    <g>
      {sideWidth > 0 && (
        <g>
          <rect x={x} y={y} width={sideW} height={SIDE} fill="rgba(250,204,21,0.45)" stroke={PHOTO_COLOR} strokeWidth="3" />
          <text x={x + sideW / 2} y={y + SIDE / 2 + 6} fill={TEXT_COLOR} fontSize="16" textAnchor="middle" style={HALO}>
            {sideWidth.toFixed(2)}
          </text>
          <text x={x + sideW - 4} y={y - 8} fill={TEXT_COLOR} fontSize="13" textAnchor="end" style={HALO}>
            {sideName}
          </text>
        </g>
      )}
      <rect x={x + sideW} y={y} width={frontW} height={SIDE} fill="rgba(250,204,21,0.2)" stroke={PHOTO_COLOR} strokeWidth="3" />
      <text x={x + sideW + frontW / 2} y={y + SIDE / 2 + 6} fill={TEXT_COLOR} fontSize="16" textAnchor="middle" style={HALO}>
        {frontWidth.toFixed(2)}
      </text>
      <text x={x + sideW + 4} y={y - 8} fill={TEXT_COLOR} fontSize="13" style={HALO}>
        front face
      </text>
      {lines.map((line, index) => (
        <text key={line} x={x} y={y + SIDE + 22 + index * 18} fill={index === 0 ? TEXT_COLOR : MUTED_COLOR} fontSize="14" style={HALO}>
          {line}
        </text>
      ))}
    </g>
  )
}

// The cube at rest, turned by `degrees`, seen from above with the camera below, so the learner can see what "turned" means. The turn is
// the one that brings the left (trailing) side toward the camera, which is the side that shows in the moving cube's photograph. The
// front and side edges are the two the camera can see; the other two edges face away from it. The dashed square is the cube before it
// is turned.
function TurnedCubeTopView({ cx, cy, degrees }: { cx: number; cy: number; degrees: number }) {
  const radians = (degrees * Math.PI) / 180
  const c = Math.cos(radians)
  const s = Math.sin(radians)
  const h = SIDE / 2
  // Turn a point (x, y) of the cube at rest by -θ (screen coordinates, y down), about the centre.
  const turn = (x: number, y: number) => ({ x: cx + x * c + y * s, y: cy - x * s + y * c })
  const bottomLeft = turn(-h, h)
  const bottomRight = turn(h, h)
  const topRight = turn(h, -h)
  const topLeft = turn(-h, -h)
  const edge = (a: { x: number; y: number }, b: { x: number; y: number }, color: string, dashed: boolean) => (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={dashed ? 2 : 4} strokeDasharray={dashed ? '6 5' : undefined} />
  )
  const label = (a: { x: number; y: number }, b: { x: number; y: number }, nx: number, ny: number, text: string, color: string) => {
    const x = (a.x + b.x) / 2 + nx * 16
    const y = (a.y + b.y) / 2 + ny * 16 + 4
    return (
      <text x={x} y={y} fill={color} fontSize="13" textAnchor={nx > 0.3 ? 'start' : nx < -0.3 ? 'end' : 'middle'} style={HALO}>
        {text}
      </text>
    )
  }
  return (
    <g>
      <rect x={cx - h} y={cy - h} width={SIDE} height={SIDE} fill="none" stroke={MUTED_COLOR} strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6" />
      <polygon
        points={[bottomLeft, bottomRight, topRight, topLeft].map((point) => `${point.x},${point.y}`).join(' ')}
        fill="rgba(250,204,21,0.1)"
      />
      {edge(topLeft, topRight, MUTED_COLOR, true)}
      {edge(bottomRight, topRight, MUTED_COLOR, true)}
      {edge(topLeft, bottomLeft, '#b8860b', false)}
      {edge(bottomLeft, bottomRight, PHOTO_COLOR, false)}
      {label(bottomLeft, bottomRight, s, c, 'front', TEXT_COLOR)}
      {label(topLeft, bottomLeft, -c, s, 'side', TEXT_COLOR)}
      {label(topLeft, topRight, -s, -c, 'back (hidden)', MUTED_COLOR)}
      {label(bottomRight, topRight, c, -s, 'leading', MUTED_COLOR)}
    </g>
  )
}

// Picture 3: the cube at rest is always shown (the reference). The moving cube's photograph appears once it is assembled, and the cube at
// rest turned by the matching angle after that.
function PhotographsPicture({ speed, showMoving, showTurned }: { speed: number; showMoving: boolean; showTurned: boolean }) {
  const result = runRotatedCube(speed)
  const height = 580
  const rowOne = 72
  const rowTwo = 325
  const left = 40
  const right = 330
  return (
    <svg viewBox={`0 0 ${VIEW_WIDTH} ${height}`} style={SVG_STYLE} role="img" aria-label="The photographs: the cube at rest, the moving cube, and the cube at rest turned">
      <PictureTitle color={PHOTO_COLOR}>Picture 3: the photographs</PictureTitle>
      <Photograph x={left} y={rowOne} sideWidth={0} frontWidth={1} sideName="" label={[`photograph of the cube`, `at rest (the reference)`]} />
      {showMoving ? (
        <Photograph x={right} y={rowOne} sideWidth={result.trailingFaceWidth} frontWidth={result.frontFaceWidth} sideName="trailing face" label={[`photograph of the cube`, `moving at ${speed}c`]} total={result.photographWidth} />
      ) : (
        <g>
          <rect x={right} y={rowOne} width={SIDE * 1.4} height={SIDE} fill="none" stroke={MUTED_COLOR} strokeWidth="2" strokeDasharray="8 6" />
          <text x={right + SIDE * 0.7} y={rowOne + SIDE / 2 + 5} fill={MUTED_COLOR} fontSize="15" textAnchor="middle" style={HALO}>
            appears during the run
          </text>
          <text x={right + SIDE * 0.7} y={rowOne + SIDE + 22} fill={TEXT_COLOR} fontSize="15" textAnchor="middle" style={HALO}>
            photograph of the moving cube
          </text>
        </g>
      )}
      {showTurned ? (
        <g>
          <Photograph x={right} y={rowTwo} sideWidth={result.turnedSideFaceWidth} frontWidth={result.turnedFrontFaceWidth} sideName="side face" label={[`photograph of the cube at rest,`, `turned by ${result.turnDegrees.toFixed(1)}°`]} />
          <TurnedCubeTopView cx={left + 140} cy={rowTwo + SIDE / 2 + 5} degrees={result.turnDegrees} />
          <text x={left + 140} y={rowTwo + SIDE + 55} fill={TEXT_COLOR} fontSize="14" textAnchor="middle" style={HALO}>
            the same cube at rest, seen from above,
          </text>
          <text x={left + 140} y={rowTwo + SIDE + 73} fill={TEXT_COLOR} fontSize="14" textAnchor="middle" style={HALO}>
            turned by {result.turnDegrees.toFixed(1)}°, with the camera below
          </text>
          <text x={right} y={rowTwo + SIDE + 62} fill={PHOTO_COLOR} fontSize="16" fontWeight="bold" style={HALO}>
            Same two widths
          </text>
          <text x={right} y={rowTwo + SIDE + 80} fill={MUTED_COLOR} fontSize="14" style={HALO}>
            as the moving cube’s photograph above
          </text>
        </g>
      ) : (
        <g>
          <rect x={right} y={rowTwo} width={SIDE * 1.4} height={SIDE} fill="none" stroke={MUTED_COLOR} strokeWidth="2" strokeDasharray="8 6" />
          <text x={right + SIDE * 0.7} y={rowTwo + SIDE / 2 + 5} fill={MUTED_COLOR} fontSize="15" textAnchor="middle" style={HALO}>
            appears at the end of the run
          </text>
          <text x={right + SIDE * 0.7} y={rowTwo + SIDE + 22} fill={TEXT_COLOR} fontSize="15" textAnchor="middle" style={HALO}>
            photograph of the cube at rest, turned
          </text>
        </g>
      )}
    </svg>
  )
}

interface RotatedObjectExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// The completion mark is called when the run ends. The explained mark belongs to the tutor, a later step.
export function RotatedObjectExperiment({ onComplete, onTutorComplete }: RotatedObjectExperimentProps) {
  // Counts the runs so the tutor starts again at its first question after each run.
  const [runCount, setRunCount] = useState(0)
  const [speed, setSpeed] = useState(SPEED_PRESETS[1])
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  // Both questions name the speed, so changing the speed clears both predictions.
  const [predictionShape, setPredictionShape] = useState<ShapePrediction | null>(null)
  const [predictionFace, setPredictionFace] = useState<FacePrediction | null>(null)
  const measuredWidth = frontFaceWidth(speed)
  const result = runRotatedCube(speed)
  const returnToIdle = () => {
    setStatus('idle')
    setProgress(0)
  }

  useEffect(() => {
    if (status !== 'running') return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)

      if (fraction >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, onComplete])

  // The stages (the physics result does not depend on this pace, CLAUDE.md §11). The cube starts off to the left and flies to the point
  // opposite the camera.
  const idle = status === 'idle'
  const flyFraction = idle || progress >= FLY_DONE_AT ? 1 : Math.max(0, (progress - FLY_START) / (FLY_DONE_AT - FLY_START))
  const cubeOffset = -(1 - flyFraction) * 300
  const showLight = !idle && progress >= FLY_DONE_AT
  const showMoving = !idle && progress >= LIGHT_DONE_AT
  const showTurned = !idle && progress >= PHOTO_DONE_AT
  const stageLabel = idle
    ? null
    : showTurned
      ? 'Stage 5: the comparison with the cube at rest, turned'
      : showMoving
        ? 'Stage 4: the photograph is assembled'
        : showLight
          ? 'Stage 3: where the light left from'
          : progress >= FLY_START
            ? 'Stage 2: the cube flies past the camera'
            : 'Stage 1: the cube at rest is photographed'
  const bothPredicted = predictionShape !== null && predictionFace !== null
  const showResults = status === 'complete' && predictionShape !== null && predictionFace !== null

  return (
    <div>
      <h2>Experiment 10 — A Fast Object Looks Rotated, Not Squashed</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Introduction". It does not say
            what the photograph looks like, or which faces it shows (that is what the predictions ask, §12). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 6 of the first chapter we saw that a fast-moving object is shorter along its
            direction of motion, as the lab measures it. In Experiment 4 of this group we saw that what a camera records is not what a
            ruler measures, because light takes time to arrive. So what does a <em>photograph</em> of a fast cube look like? Is the cube
            squashed in the photograph, as the ruler suggests?
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some words.</strong> The new ones are photograph, the four faces of the cube, and turned.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Photograph:</strong> the picture a camera records of the light that reaches it at one instant. It is not the same
                as measuring the cube with a ruler.
              </li>
              <li>
                <strong>The faces of the cube:</strong> the <strong>front</strong> face is the one toward the camera, and the{' '}
                <strong>back</strong> face is the one away from it. The <strong>leading</strong> face is the one that points the way the
                cube is moving, and the <strong>trailing</strong> face is the one that points the opposite way. Seen from above, the cube
                is a square. In the pictures the camera is at the bottom, far away, and the motion is to the right, so the four faces
                are the four sides of the square: the back face at the top of the picture, the front face at the bottom, the leading
                face on the right and the trailing face on the left. (We look down on the cube, so “back” is not its roof.)
              </li>
              <li>
                <strong>Contracted</strong> (from Experiment 6): shorter along the direction of motion, as the lab measures it. The factor
                is <em>D</em>, the time dilation factor of Experiment 3. For example, at 0.6c, <em>D</em> = 0.8, so a cube that is 1 unit
                long at rest is measured as 0.8 units long.
              </li>
              <li>
                <strong>Turned (rotated):</strong> a cube is turned when you look at it from an angle, so that you see two of its faces
                at once. A photograph “looks turned” if it looks like that.
              </li>
              <li>
                <strong>Speed written as 0.6c:</strong> a fraction of the speed of light, <em>c</em>. So 0.6c is six tenths of the speed
                of light, and 0.9c is nine tenths.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>An everyday example: a long train and the sound it makes.</strong> Sound takes time to travel. It moves at about 340
              metres every second, so it is slow enough for us to notice the delay.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                Imagine you stand beside a railway track, and a very long train, say 340 metres long, is passing. A loud horn sounds at
                the same moment at the front end and at the back end of the train.
              </li>
              <li>
                Suppose the horn at the end nearest to you is 100 metres from you, and the horn at the end farthest from you is 440
                metres from you. The near horn’s sound reaches you after about 0.3 seconds. The far horn’s sound has 340 metres more to
                travel, which takes one extra second, so it reaches you after about 1.3 seconds.
              </li>
              <li>
                So the two sounds do not reach you together. If you could somehow record only what reaches your ears at one single
                moment, that recording would mix different moments of the train’s life: the near end as it was a short time ago, and the
                far end as it was a full second earlier than that.
              </li>
              <li>
                A camera does the same with light. A photograph records the light that reaches the camera at one instant, and light from
                the parts of an object that are farther away left them earlier. Light is far faster than sound, so the delay is tiny in
                daily life. But a cube moving close to the speed of light covers a lot of ground even in a tiny time. The example does not
                say what this does to the picture. That is for you to predict.
              </li>
            </ul>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What happens.</strong> A cube flies past a camera, and you watch the experiment in five stages. Each stage adds
              something to the pictures below, and the caption under the pictures explains each one.
            </p>
            <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>The cube at rest is photographed.</strong> First the cube is standing still, and the camera takes a photograph of
                it. This is your reference, so you know what an ordinary photograph of the cube looks like.
              </li>
              <li>
                <strong>The cube flies past.</strong> Now the cube moves at the speed you chose. The camera is very far away and looks
                straight across the cube’s path. Picture 1 shows the cube from above at the moment it is exactly opposite the camera. This is
                the cube as the lab measures it at that one moment, with a ruler, drawn beside the cube at rest for comparison.
              </li>
              <li>
                <strong>Where the light left from.</strong> The camera records the light that arrives now, and different corners of the cube
                sent that light at different times. Picture 2 shows where each corner was when the light now reaching the camera left it.
              </li>
              <li>
                <strong>The photograph is assembled.</strong> Picture 3 shows what the camera records from that light: the photograph of the
                moving cube, with the width of each face written on it.
              </li>
              <li>
                <strong>The comparison.</strong> Finally the photograph is put beside the cube at rest, turned by some angle, so you can see
                how the two compare.
              </li>
            </ol>
          </div>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose the cube’s speed. Predict what the photograph will look like, and which faces it will show.
            Then run the experiment. You are not graded while you predict. The tutor will compare your predictions with the result
            afterwards.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What we assume.</strong> The camera is very far away and looks straight across the cube’s path, and its shutter is
            instant. The cube moves at a steady speed. We show a flat slice: the cube from above, and its photograph. We show only the
            shape, not color or brightness. The cube is the same cube at all times: it is not really turned.
          </p>
        </div>

        <ReferencePanel entries={status === 'complete' ? [...REFERENCE_ENTRIES, ...FORMULA_ENTRIES] : REFERENCE_ENTRIES} />

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The cube’s speed</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            As a fraction of the speed of light, c. For example, 0.9c is nine tenths of the speed of light.
          </p>
          <div>
            {SPEED_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setSpeed(value)
                  setPredictionShape(null)
                  setPredictionFace(null)
                  returnToIdle()
                }}
                className={`toggle-button${speed === value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {value}c
              </button>
            ))}
          </div>
        </div>

        {/* The two predictions (draft wording, §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        {(
          [
            {
              title: 'Prediction 1: the shape of the photograph',
              text: (
                <>
                  The lab measures the cube as shorter along its direction of motion (Experiment 6). A camera far away, looking straight
                  across the cube’s path, takes one photograph at the moment the cube is opposite it. The cube moves at <strong>{speed}c</strong>.
                  Compared with a photograph of the same cube at rest, will the photograph of the moving cube look squashed along its
                  direction of motion, the same as at rest, stretched along its direction of motion, or turned, as though the cube were
                  rotated?
                </>
              ),
              choices: SHAPE_CHOICES,
              value: predictionShape,
              set: (value: string) => setPredictionShape(value as ShapePrediction),
            },
            {
              title: 'Prediction 2: which faces the camera can see',
              text: (
                <>
                  Think about the cube’s faces. The <strong>front</strong> face is the one toward the camera. The <strong>leading</strong>{' '}
                  face is the one that points in the direction the cube is moving. The <strong>trailing</strong> face is the one that points
                  the opposite way. Besides the front face, which other face, if any, can the camera see?
                </>
              ),
              choices: FACE_CHOICES,
              value: predictionFace,
              set: (value: string) => setPredictionFace(value as FacePrediction),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              {question.text} You are not graded, and a guess is fine.
            </p>
            <div>
              {question.choices.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => {
                    question.set(choice.value)
                    returnToIdle()
                  }}
                  className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
              {question.value !== null ? `Your prediction: ${question.choices.find((c) => c.value === question.value)?.label.toLowerCase()}.` : 'Choose an option to continue'}
            </p>
          </div>
        ))}

        <button
          type="button"
          className="action-button"
          onClick={() => {
            setProgress(0)
            setRunCount((n) => n + 1)
            setStatus('running')
          }}
          disabled={!bothPredicted || status === 'running'}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {!bothPredicted && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}
        {stageLabel && <p style={{ fontSize: '0.875rem', fontWeight: 'bold', margin: '1rem 0 0' }}>{stageLabel}</p>}

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '1.5rem 0 0.75rem' }}>
          The cube’s speed is {speed}c. All the pictures are drawn on the same scale.
        </p>
        {/* "How to read this diagram" (CLAUDE.md §14): draft wording for the owner's review (§28.1). Each picture has its own caption directly
            under it that explains every label drawn in that picture, in simple words. Nothing here says what the photograph shows, which
            faces it contains or how wide it is (§12). */}
        <div style={CAPTION_STYLE}>
          <strong>How to read this diagram</strong>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>The idea behind the pictures.</strong> There are three pictures. They all show the same cube at the same moment, in
            three different ways, and you read them from the top. Picture 1 is what a ruler would find. Picture 2 shows where the light that
            reaches the camera came from. Picture 3 is the photograph itself. Under each picture is a short guide to every label in it.
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>Who is looking.</strong> The <em>lab</em> is the room that the camera and the ruler belong to. It is not moving, and the
            cube moves past it. “At the instant of the photograph” means the moment the cube is exactly opposite the camera and the shutter
            opens.
          </p>
          <p style={{ margin: '0.5rem 0 0' }}>
            <strong>The units.</strong> Every width is written as a fraction of the cube’s side at rest, so 1.00 means one full side. All
            the pictures use the same scale. For example, if the cube’s side at rest were 100 centimetres, then 0.60 would mean 60
            centimetres.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '0.75rem', margin: '1rem 0' }}>
          <LabMeasuredPicture speed={speed} offset={cubeOffset} />
          <div style={CAPTION_STYLE}>
            <strong>Guide to Picture 1: the cube as the lab’s ruler measures it</strong>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Whose view it is:</strong> the lab’s. Imagine freezing time in the lab at the instant of the photograph, and laying a
              ruler along the cube. We look down on the cube from above, so we see it as a square or a rectangle, not as a box with a roof.
              It is on screen from the start. In stage 2 the cube slides in from the left until it sits opposite the camera.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li><strong>“dashed outline: the cube when it is not moving”</strong> is the cube at rest, as a dashed grey square. It is there to compare with.</li>
              <li><strong>“solid blue: the cube while it moves, as the ruler measures it”</strong> is the blue rectangle. Compare its width with the dashed square’s. A ruler finds a moving cube shorter along its motion (Experiment 6). For example, at 0.6c the ruler finds 0.80 of the side, which is 80 centimetres for a cube that is 100 centimetres at rest. Its depth, toward the camera, does not change.</li>
              <li><strong>“We look down on the cube from above…”</strong> tells you the viewpoint. The picture is a map of the cube from above. “Top” in the picture means farther from the camera, not “up in the air”.</li>
              <li><strong>“the cube moves this way”</strong> is the white arrow. It shows the direction the cube travels.</li>
              <li><strong>“back face”</strong> is the side of the square at the top of the picture, the side farthest from the camera. <strong>“front face”</strong> is the side at the bottom, nearest the camera.</li>
              <li><strong>“leading face”</strong> is the right side, the one that points the way the cube moves. <strong>“trailing face”</strong> is the left side, the one that points the opposite way. These two sides are the same distance from the camera.</li>
              <li><strong>“light going to the camera”</strong> are the purple dashed arrows. They show the direction the light travels, from the cube down to the camera.</li>
              <li><strong>“camera”</strong> is the camera. It is very far away, far below the bottom of the picture, so the drawing only shows its direction.</li>
            </ul>
          </div>

          {showLight ? (
            <LightPicture speed={speed} />
          ) : (
            <HeldPicture title="Picture 2: where the light that reaches the camera came from" color={LIGHT_COLOR} note="appears during the run" height={200} />
          )}
          <div style={CAPTION_STYLE}>
            <strong>Guide to Picture 2: where the light that reaches the camera came from</strong>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>The idea.</strong> The camera records the light that reaches it <em>now</em>. But light takes time to travel, so
              that light left the cube a little while ago. Think of light as a letter in the post. A letter that reaches you today was
              posted a few days ago, from where the sender was <em>then</em>. If the sender has moved house since, today’s address is
              not the place the letter was posted from. A letter with a longer way to travel was posted earlier. Picture 2 asks, for each
              corner of the cube: where was the corner when the light now reaching the camera was “posted”? It is empty until stage 3 of
              the run.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li><strong>“the cube now (as in Picture 1)”</strong> is the faint blue rectangle. It is the cube at the instant of the photograph, the same rectangle as in Picture 1.</li>
              <li><strong>“light from a corner, going to the camera”</strong> are the purple lines. Each line is the light from one corner of the cube, going straight down to the camera. They are parallel because the camera is very far away.</li>
              <li><strong>“double arrow on the left: the back corners are 1.00 (one cube side) farther from the camera”</strong> goes with the white double-headed arrow on the left, which has 1.00 written beside it. The top corners (the back corners) are one full side of the cube farther from the camera than the bottom corners (the front corners). So the light from a back corner had one side more to travel, and it left earlier. The front corners have no extra distance, so we use them as the reference: their purple lines simply start on the corners.</li>
              <li><strong>“back corner now”</strong> is a filled blue dot. It marks where a back corner is at the instant of the photograph, the same place as in Picture 1.</li>
              <li><strong>“back corner when its light left”</strong> is a dashed purple circle. It marks where that back corner was when it sent out the light that is reaching the camera now. The purple line of that corner starts from this circle, because that is where the light began its trip. (In the letter example: the dot is today’s address and the circle is the place the letter was posted from.)</li>
              <li><strong>“arrow and number: how far the cube moved in between”</strong> is the short white arrow and the number above it. The arrow goes from the dot to the circle, and the number is the distance between them, in cube sides. This is how far the cube travelled while the light went the extra distance.</li>
            </ul>
            <p style={{ margin: '0.5rem 0 0' }}>
              <strong>Example with real numbers.</strong> At <strong>{speed}c</strong>, the light from a back corner took one side’s worth
              of light travel time longer to arrive. In that time the cube moves {speed.toFixed(2)} of its side (for a cube that is 100
              centimetres at rest, {Math.round(speed * 100)} centimetres). That is the number above the arrow, and it is the distance
              between each dot and its circle.
            </p>
          </div>

          <PhotographsPicture speed={speed} showMoving={showMoving} showTurned={showTurned} />
          <div style={CAPTION_STYLE}>
            <strong>Guide to Picture 3: the photographs</strong>
            <p style={{ margin: '0.5rem 0' }}>
              <strong>Whose view it is:</strong> the camera’s. A photograph is flat. It is made only of the light that reached the camera,
              so Picture 3 is built from the light lines of Picture 2, not from Picture 1’s ruler. Each photograph is drawn as the faces it
              shows, side by side, as you would see them in the picture.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li><strong>The numbers inside the boxes</strong> (such as 1.00) are the width of that face in the photograph, in cube sides. For example, a face marked 0.50 is half as wide as one full side of the cube at rest.</li>
              <li><strong>The names above the boxes</strong> (“front face”, and any other face the photograph shows) say which face of the cube each box is. The paler box is the front face and the darker box is any other face. Do not go by the shade alone. The number and the name tell you which face it is.</li>
              <li><strong>“photograph of the cube at rest (the reference)”</strong> is the top-left photograph, drawn first, in stage 1. The cube is standing still, so the camera sees one plain square face, 1.00 wide. It shows you what an ordinary photograph of the cube looks like.</li>
              <li><strong>“photograph of the cube moving at …c”</strong> is the top-right photograph. It appears in stage 4. It is what the camera records from the moving cube at the speed you chose. Under it, <strong>“total width”</strong> is the width of the whole photograph, all its faces added together. You can compare it with the 1.00 of the cube at rest. Until stage 4 you see a dashed empty box.</li>
              <li><strong>“the same cube at rest, seen from above, turned by …°, with the camera below”</strong> is the sketch at the lower left. It appears in stage 5. It is a map from above, like Picture 1, of a cube standing still but turned, the way you would turn a box on a table to see two of its faces at once. The faint dashed square is the cube before it is turned. “Turned by 0°” would leave it exactly on the dashed square, showing only its front face. The two <strong>bold coloured sides</strong>, “front” (bright yellow, at the bottom) and “side” (darker yellow, at the left), are the two sides the camera can see. The two <strong>thin dashed sides</strong> (“back (hidden)” and “leading”) face away from the camera, so they are not in its photograph. The width of each box in the photograph is how wide that side looks from the camera’s point of view, straight across the picture. A side that is turned toward the camera looks wider, and a side that is turned away looks narrower.</li>
              <li><strong>“photograph of the cube at rest, turned by …°”</strong> is the lower right photograph. It shows what the camera records from that turned cube, as two boxes with their widths written on them. It is chosen so that its two widths match the moving cube’s. The words <strong>“Same two widths”</strong> under it mark the match.</li>
            </ul>
          </div>
        </div>

        <div style={CAPTION_STYLE}>
          <p style={{ margin: '0 0 0.25rem' }}><strong>What appears when.</strong></p>
          <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>Stage 1: the cube at rest is photographed. The reference photograph is the only thing in Picture 3.</li>
            <li>Stage 2: the cube slides into place in Picture 1.</li>
            <li>Stage 3: Picture 2 fills in.</li>
            <li>Stage 4: the moving cube’s photograph appears in Picture 3.</li>
            <li>Stage 5: the turned cube appears in Picture 3, for comparison.</li>
          </ol>
          <p style={{ margin: '0.5rem 0 0.25rem' }}>
            <strong>A moment with real numbers.</strong> At <strong>{speed}c</strong>, the lab’s ruler measures the cube at{' '}
            <strong>{measuredWidth.toFixed(2)}</strong> of its side at rest (1.00): that is Picture 1’s solid rectangle against the dashed
            square. In Picture 2, the back corners’ light left one side’s light travel time earlier, and in that time the cube moved{' '}
            <strong>{speed.toFixed(2)}</strong> of its side. Picture 3 then adds up what the camera records.
          </p>
          <p style={{ margin: '0.5rem 0 0.25rem' }}><strong>What to look for.</strong></p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>How wide is the moving cube’s photograph, compared with the cube at rest (1.00)?</li>
            <li>Which faces are drawn in it, and how wide is each?</li>
            <li>How do the widths of the turned cube compare with the moving cube’s?</li>
          </ul>
          <p style={{ margin: '0.5rem 0 0' }}>
            <strong>Why the numbers come out this way.</strong> This is not explained here. After the run, the tutor explains it, and the
            “Words and formulas” panel above gains the formulas.
          </p>
        </div>

        {showResults && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            {/* Neutral (CLAUDE.md §12): numbers only, the predictions recorded and not marked here (the tutor's explanation compares them with
                the result). Draft wording for the owner's review (§28.1). */}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>What you ran.</strong> A cube flew past a camera at {speed}c, and the camera took one photograph at the instant the cube
              was opposite it. <strong>Your predictions were:</strong> the photograph would look{' '}
              {SHAPE_CHOICES.find((c) => c.value === predictionShape)?.label.toLowerCase()}; besides the front face, the camera could see{' '}
              {predictionFace === 'none' ? 'no other face' : FACE_CHOICES.find((c) => c.value === predictionFace)?.label.toLowerCase()}. They are
              only recorded here. The tutor’s explanation, further down, compares them with the result.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>The numbers.</strong> Every width is in units of the cube’s side at rest, so 1.00 is one full side. “Turned cube” means
              the cube at rest, turned until it shows the same two widths as the moving cube’s photograph.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['', 'The cube at rest', `The cube moving at ${speed}c`].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Width along the motion, measured by the lab’s ruler', '1.00', result.measuredWidth.toFixed(2)],
                    ['Front face in the photograph', '1.00', result.frontFaceWidth.toFixed(2)],
                    ['Trailing face in the photograph', '0.00', result.trailingFaceWidth.toFixed(2)],
                    ['Total width of the photograph', result.restPhotographWidth.toFixed(2), result.photographWidth.toFixed(2)],
                    ['Turn angle of the turned cube', '0°', `${result.turnDegrees.toFixed(1)}°`],
                  ].map(([label, rest, moving]) => (
                    <tr key={label}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{label}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{rest}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{moving}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>The turned cube’s widths.</strong> Its front face is {result.turnedFrontFaceWidth.toFixed(2)} wide and its side face is{' '}
                {result.turnedSideFaceWidth.toFixed(2)} wide.
              </li>
              <li>
                <strong>The leading face.</strong> {result.leadingFaceVisible ? 'It appears in the photograph.' : 'It does not appear in the photograph.'}
              </li>
              <li>
                <strong>The number D.</strong> At {speed}c, D = √(1 − {speed}²) = {result.timeDilationFactor.toFixed(3)}, the same factor that
                the moving clock of Experiment 3 used.
              </li>
            </ul>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1rem', marginBottom: 0 }}>
              Choose another speed, make both predictions and run it again to see which numbers change.
            </p>
          </div>
        )}
      </div>

      {showResults && predictionShape !== null && predictionFace !== null && (
        <RotatedObjectTutor
          key={runCount}
          speed={speed}
          predictedShape={predictionShape}
          predictedFace={predictionFace}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
