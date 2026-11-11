import type { ReactNode } from 'react'
import {
  diagramTicksFor,
  guessMarkerFor,
  levelReferenceLineFor,
  orderWording,
  sameMomentLineExtended,
  shapeMarkerFor,
} from '../physics/spacetimeDiagramView'
import type { OrderChoice, ShapeChoice, SpacetimeDiagramData, WorldlinePoint } from '../physics/spacetimeDiagramView'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox } from './Experiment6Pictures'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 8: the spacetime diagram (dark ground, labelled axes, tick marks, a key, the white guess
// marker) and its captions, audited to the newer rules (docs/audit/relativity-of-time-and-motion/08-draft-wording.md, approved by the
// owner on 2026-11-10). Every number drawn comes from the physics module (src/physics/spacetimeDiagramView.ts; CLAUDE.md §9). The
// wording is the owner's to approve line by line (CLAUDE.md §28.1).

export const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const BACK_LIGHT = '#60a5fa' // blue: the back end, lighter for the dark ground
const FRONT_LIGHT = '#a78bfa' // purple: the front end, lighter for the dark ground
const ORIGIN_COLOR = '#e6a700' // amber: the flash released (a fixed reference)
const SAME_MOMENT_COLOR = '#34d399' // green: the block's own "same moment" line (Experiment 9)
const LEVEL_COLOR = '#cbd5e1' // pale grey: the lab's level "same moment" line (Experiment 9)
const INK = '#0b1020'
const GRID = '#1e293b'

const W = 720
const PLOT_LEFT = 84
const PLOT_RIGHT_MARGIN = 214
const PLOT_MAX_WIDTH = W - PLOT_LEFT - PLOT_RIGHT_MARGIN
const PLOT_MAX_HEIGHT = 380
const BOTTOM_MARGIN = 82
const TOP_WITH_MARKER = 96
const TOP_PLAIN = 48
const stroke = { stroke: INK, strokeWidth: 4, paintOrder: 'stroke' } as const

// The lines grow upward over the playback: this only reads a point partway along an existing straight line, it does not compute a
// physical quantity.
function pointAt(a: WorldlinePoint, b: WorldlinePoint, t: number): WorldlinePoint {
  if (t <= a.time) return a
  if (t >= b.time) return b
  const fraction = (t - a.time) / (b.time - a.time)
  return { position: a.position + fraction * (b.position - a.position), time: a.time + fraction * (b.time - a.time) }
}

const trim = (x: number, digits = 4) => String(parseFloat(x.toFixed(digits)))

export interface DiagramProps {
  diagram: SpacetimeDiagramData
  animTime: number
  title: string
  label: string
  scaleDiagrams?: SpacetimeDiagramData[] // Part 2: the widest runs (at rest and the fastest), so every run is drawn at one scale
  guess?: OrderChoice | null // Part 1: the learner's guess, in white (never moves a dot)
  pinkSpeed?: number | null // Part 2: the learner's own speed, written in pink
  // Experiment 9: undefined for "Drawing Spacetime" (no extra lines); a boolean says whether the green and grey lines are drawn yet.
  showSameMomentLines?: boolean
  shapeGuess?: ShapeChoice | null // Experiment 9, Part 1: the learner's guess, a white example bar (never moves a line)
}

// Draws what the physics view layer reports; no physics is calculated here.
export function SpacetimeDiagram({
  diagram,
  animTime,
  title,
  label,
  scaleDiagrams,
  guess = null,
  pinkSpeed = null,
  showSameMomentLines,
  shapeGuess = null,
}: DiagramProps) {
  const ticks = diagramTicksFor(scaleDiagrams ?? diagram)
  const positionRange = ticks.positionMax - ticks.positionMin
  const scale = Math.min(PLOT_MAX_WIDTH / positionRange, PLOT_MAX_HEIGHT / ticks.timeMax)
  const plotW = positionRange * scale
  const plotH = ticks.timeMax * scale
  const top = guess !== null || shapeGuess !== null ? TOP_WITH_MARKER : TOP_PLAIN
  const H = top + plotH + BOTTOM_MARGIN
  const x = (position: number) => PLOT_LEFT + (position - ticks.positionMin) * scale
  const y = (time: number) => top + plotH - time * scale
  const plotRight = PLOT_LEFT + plotW
  const axisY = top + plotH

  const line = (a: WorldlinePoint, b: WorldlinePoint, color: string, dashed: boolean, key: string) => {
    const end = pointAt(a, b, animTime)
    return (
      <line
        key={key}
        x1={x(a.position)}
        y1={y(a.time)}
        x2={x(end.position)}
        y2={y(end.time)}
        stroke={color}
        strokeWidth={3}
        strokeDasharray={dashed ? '6 5' : undefined}
      />
    )
  }

  const backShown = animTime >= diagram.backEvent.time
  const frontShown = animTime >= diagram.frontEvent.time
  const overlap = Math.abs(diagram.backEvent.time - diagram.frontEvent.time) < 1e-9

  const eventDot = (point: WorldlinePoint, color: string, name: string, side: 'left' | 'right') => {
    const cx = x(point.position)
    const cy = y(point.time)
    const anchorX = side === 'left' ? cx - 28 : cx + 28
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill={color} stroke={INK} strokeWidth={1.5} />
        <text x={anchorX} y={cy - 2} fill={color} fontSize="12" fontWeight="bold" textAnchor={side === 'left' ? 'end' : 'start'} {...stroke}>
          {name} reached
        </text>
        <text x={anchorX} y={cy + 12} fill={color} fontSize="12" fontWeight="bold" textAnchor={side === 'left' ? 'end' : 'start'} {...stroke}>
          {point.time.toFixed(3)} s
        </text>
      </g>
    )
  }

  // The guess has no size or position of its own, so it is a white marker: a ring round the dot (or both dots), a pointer and a box
  // labelled YOUR GUESS, above the picture, joined to the ring by a line. It appears only once the dot it points at is drawn.
  const marker = () => {
    if (guess === null) return null
    const target = guessMarkerFor(diagram, guess)
    const drawn = target.pointsAt === 'backDot' ? backShown : target.pointsAt === 'frontDot' ? frontShown : backShown && frontShown
    if (!drawn) return null
    const text = `YOUR GUESS: ${orderWording[guess]}`
    const boxWidth = text.length * 8 + 20
    const centreX = target.points.reduce((sum, p) => sum + x(p.position), 0) / target.points.length
    const boxX = Math.min(Math.max(centreX - boxWidth / 2, 6), W - boxWidth - 6)
    const boxY = 30
    const boxBottom = boxY + 30
    const ringR = 16
    return (
      <g>
        {target.points.map((p, i) => {
          const cx = x(p.position)
          const cy = y(p.time)
          const fromX = Math.min(Math.max(cx, boxX + 12), boxX + boxWidth - 12)
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={ringR} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
              <line x1={fromX} y1={boxBottom} x2={cx} y2={cy - ringR - 8} stroke={GUESS_COLOR} strokeWidth={2} strokeDasharray="6 4" />
              <polygon points={`${cx - 7},${cy - ringR - 8} ${cx + 7},${cy - ringR - 8} ${cx},${cy - ringR}`} fill={GUESS_COLOR} />
            </g>
          )
        })}
        <rect x={boxX} y={boxY} width={boxWidth} height={30} fill={INK} stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
        <text x={boxX + 10} y={boxY + 20} fill={GUESS_COLOR} fontSize="14" fontWeight="bold">
          {text}
        </text>
      </g>
    )
  }

  // Experiment 9: the block's own "same moment" line (green) and the lab's level line (pale grey), drawn once the dots are drawn.
  const sameMomentLines = () => {
    if (showSameMomentLines !== true) return null
    const [gFrom, gTo] = sameMomentLineExtended(diagram, ticks.positionMin, ticks.positionMax, ticks.timeMax)
    const [lFrom, lTo] = levelReferenceLineFor(diagram, ticks.positionMin, ticks.positionMax)
    const labelX = (x(diagram.backEvent.position) + x(diagram.frontEvent.position)) / 2
    const labelY = (y(diagram.backEvent.time) + y(diagram.frontEvent.time)) / 2
    // the picture's y runs downward, so a line that rises to the right turns the text anticlockwise
    const labelAngle = (-Math.atan2(y(diagram.backEvent.time) - y(diagram.frontEvent.time), x(diagram.frontEvent.position) - x(diagram.backEvent.position)) * 180) / Math.PI
    return (
      <g>
        <line x1={x(lFrom.position)} y1={y(lFrom.time)} x2={x(lTo.position)} y2={y(lTo.time)} stroke={LEVEL_COLOR} strokeWidth={2} strokeDasharray="10 6" />
        <line x1={x(gFrom.position)} y1={y(gFrom.time)} x2={x(gTo.position)} y2={y(gTo.time)} stroke={SAME_MOMENT_COLOR} strokeWidth={4} />
        <text x={x(lTo.position) - 6} y={y(lTo.time) + 15} fill={LEVEL_COLOR} fontSize="11" fontWeight="bold" textAnchor="end" {...stroke}>
          A level line: the lab’s “same moment”
        </text>
        {/* named along the line, above it, halfway between the two dots (the clearest stretch of the picture) */}
        <text
          transform={`translate(${labelX} ${labelY}) rotate(${labelAngle})`}
          y={-10}
          fill={SAME_MOMENT_COLOR}
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
          {...stroke}
        >
          The block’s own “same moment” line
        </text>
      </g>
    )
  }

  // Experiment 9: the guess is only "flat" or "tilted", so it is a white example bar (level, or leaning at a fixed example lean that is
  // never the real lean), in a box labelled YOUR GUESS above the picture and joined to the bar by a dashed line. It appears with the
  // real line, and it never moves a line.
  const shapeMarker = () => {
    if (shapeGuess === null || showSameMomentLines !== true) return null
    const marker = shapeMarkerFor(shapeGuess)
    const text = `YOUR GUESS (a marker only): the line will be ${shapeGuess === 'flat' ? 'flat' : 'tilted'}`
    const boxWidth = text.length * 8 + 20
    const boxX = Math.min(Math.max(PLOT_LEFT, 6), W - boxWidth - 6)
    const boxY = 30
    const cx = x(ticks.positionMin + 0.13)
    const cy = y(ticks.timeMax - 0.1)
    const half = 46
    const dx = half
    const dy = -marker.lean * half // equal pixel scale on both axes
    const arrow = (px: number, py: number, ux: number, uy: number) => {
      const norm = Math.hypot(ux, uy)
      const [ax, ay] = [ux / norm, uy / norm]
      return `${px},${py} ${px - ax * 12 - ay * 6},${py - ay * 12 + ax * 6} ${px - ax * 12 + ay * 6},${py - ay * 12 - ax * 6}`
    }
    return (
      <g>
        <line x1={boxX + 40} y1={boxY + 30} x2={cx} y2={cy - 14} stroke={GUESS_COLOR} strokeWidth={2} strokeDasharray="6 4" />
        <line x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} stroke={GUESS_COLOR} strokeWidth={5} strokeLinecap="round" />
        <polygon points={arrow(cx + dx + 4, cy + dy, dx, dy)} fill={GUESS_COLOR} />
        <polygon points={arrow(cx - dx - 4, cy - dy, -dx, -dy)} fill={GUESS_COLOR} />
        <rect x={boxX} y={boxY} width={boxWidth} height={30} fill={INK} stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
        <text x={boxX + 10} y={boxY + 20} fill={GUESS_COLOR} fontSize="14" fontWeight="bold">
          {text}
        </text>
      </g>
    )
  }

  const keyX = plotRight + 18
  const keyEntry = (row: number, sample: ReactNode, text: string) => (
    <g key={row}>
      {sample}
      <text x={keyX + 28} y={top + 28 + row * 24} fill={TEXT_COLOR} fontSize="11">
        {text}
      </text>
    </g>
  )
  const sampleLine = (row: number, color: string, dashed: boolean) => (
    <line x1={keyX} y1={top + 24 + row * 24} x2={keyX + 22} y2={top + 24 + row * 24} stroke={color} strokeWidth={3} strokeDasharray={dashed ? '6 5' : undefined} />
  )

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        {title}
      </text>
      {pinkSpeed !== null && (
        <text x={W - 14} y={20} fill={YOURS_COLOR} fontSize="13" fontWeight="bold" textAnchor="end">
          your speed: {pinkSpeed}c
        </text>
      )}

      {/* grid, tick marks and numbers */}
      {ticks.positions.map((p) => (
        <g key={`p${p}`}>
          <line x1={x(p)} y1={top} x2={x(p)} y2={axisY} stroke={GRID} strokeWidth={1} />
          <line x1={x(p)} y1={axisY} x2={x(p)} y2={axisY + 5} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <text x={x(p)} y={axisY + 19} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
            {trim(p, 1)}
          </text>
        </g>
      ))}
      {ticks.times.map((t) => (
        <g key={`t${t}`}>
          <line x1={PLOT_LEFT} y1={y(t)} x2={plotRight} y2={y(t)} stroke={GRID} strokeWidth={1} />
          <line x1={PLOT_LEFT - 5} y1={y(t)} x2={PLOT_LEFT} y2={y(t)} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <text x={PLOT_LEFT - 9} y={y(t) + 4} fill={MUTED_COLOR} fontSize="11" textAnchor="end">
            {trim(t, 1)}
          </text>
        </g>
      ))}

      {/* the axes, with arrows and names */}
      <line x1={PLOT_LEFT} y1={axisY} x2={plotRight + 6} y2={axisY} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <polygon points={`${plotRight + 6},${axisY - 5} ${plotRight + 6},${axisY + 5} ${plotRight + 15},${axisY}`} fill={TEXT_COLOR} />
      <line x1={PLOT_LEFT} y1={axisY} x2={PLOT_LEFT} y2={top - 6} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <polygon points={`${PLOT_LEFT - 5},${top - 6} ${PLOT_LEFT + 5},${top - 6} ${PLOT_LEFT},${top - 15}`} fill={TEXT_COLOR} />
      <text x={(PLOT_LEFT + plotRight) / 2} y={axisY + 58} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        position (light-seconds) →
      </text>
      <text
        x={20}
        y={top + plotH / 2}
        fill={TEXT_COLOR}
        fontSize="12"
        fontWeight="bold"
        textAnchor="middle"
        transform={`rotate(-90 20 ${top + plotH / 2})`}
      >
        time (seconds) →
      </text>

      {/* position 0: the place where the flash is released */}
      <line x1={x(0)} y1={top} x2={x(0)} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="2 4" />

      {line(diagram.backWorldline[0], diagram.backWorldline[1], BACK_LIGHT, false, 'back')}
      {line(diagram.frontWorldline[0], diagram.frontWorldline[1], FRONT_LIGHT, false, 'front')}
      {line(diagram.leftLightWorldline[0], diagram.leftLightWorldline[1], BACK_LIGHT, true, 'left-light')}
      {line(diagram.rightLightWorldline[0], diagram.rightLightWorldline[1], FRONT_LIGHT, true, 'right-light')}

      <circle cx={x(0)} cy={y(0)} r={7} fill={ORIGIN_COLOR} stroke={INK} strokeWidth={1.5} />
      <text x={x(0)} y={axisY + 38} fill={ORIGIN_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
        ▲ Flash released here
      </text>

      {backShown && eventDot(diagram.backEvent, BACK_LIGHT, 'Back end', x(diagram.backEvent.position) - 28 - 120 >= 6 ? 'left' : 'right')}
      {frontShown && !overlap && eventDot(diagram.frontEvent, FRONT_LIGHT, 'Front end', x(diagram.frontEvent.position) + 28 + 120 <= plotRight ? 'right' : 'left')}
      {frontShown && overlap && (
        <text x={x(diagram.frontEvent.position) + 28} y={y(diagram.frontEvent.time) + 4} fill={FRONT_LIGHT} fontSize="12" fontWeight="bold" {...stroke}>
          both ends reached
        </text>
      )}
      {sameMomentLines()}
      {marker()}
      {shapeMarker()}

      {/* the key: every drawn thing is named here */}
      <text x={keyX} y={top - 4} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        What the drawing shows
      </text>
      {keyEntry(0, sampleLine(0, BACK_LIGHT, false), 'Back end of the block')}
      {keyEntry(1, sampleLine(1, FRONT_LIGHT, false), 'Front end of the block')}
      {keyEntry(2, sampleLine(2, BACK_LIGHT, true), 'Light going to the back end')}
      {keyEntry(3, sampleLine(3, FRONT_LIGHT, true), 'Light going to the front end')}
      {keyEntry(4, <circle cx={keyX + 11} cy={top + 24 + 4 * 24} r={6} fill={ORIGIN_COLOR} stroke={INK} strokeWidth={1.5} />, 'Flash released here')}
      {keyEntry(5, <circle cx={keyX + 11} cy={top + 24 + 5 * 24} r={6} fill={BACK_LIGHT} stroke={INK} strokeWidth={1.5} />, 'Event: light reaches an end')}
      {showSameMomentLines !== undefined && keyEntry(6, sampleLine(6, SAME_MOMENT_COLOR, false), 'Block’s own “same moment”')}
      {showSameMomentLines !== undefined && keyEntry(7, sampleLine(7, LEVEL_COLOR, true), 'Lab’s level “same moment”')}
    </svg>
  )
}

const heading = { margin: '0 0 0.25rem' } as const
const list = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const

// Lengths close to the rest length need more decimals to be told apart (at 0.01c the block is 0.49998 light-seconds long).
const lengthText = (rest: number, length: number) => (length !== rest && rest - length < 0.0005 ? length.toFixed(5) : length.toFixed(3))

// Appears when the drawing starts; no times and no answers (CLAUDE.md §12).
export function DiagramCaption({ speedLabel, part }: { speedLabel: string; part: 1 | 2 }) {
  return (
    <CaptionBox>
      <p style={heading}>
        <strong>How to read this diagram.</strong>
      </p>
      <ul style={list}>
        <li>
          <strong>The picture.</strong> A spacetime diagram of one flash and one block {part === 1 ? `moving at ${speedLabel}` : 'at the speed you chose'}.{' '}
          <strong>Position</strong> runs across, in light-seconds (a light-second is the distance light travels in one second, about
          300,000 km). <strong>Time</strong> runs up, in seconds, measured from the moment the flash was released. Both axes use the same
          scale, so no line&rsquo;s lean is stretched.
        </li>
        <li>
          <strong>The amber dot</strong> is the flash being released: position 0, time 0.
        </li>
        <li>
          <strong>The two solid lines</strong> are the block&rsquo;s two ends: <strong>blue</strong> is the back end, <strong>purple</strong>{' '}
          is the front end. They lean over together because the block is moving, and they stay the same distance apart because the
          block does not stretch.
        </li>
        <li>
          <strong>The two dashed lines</strong> are the flash: <strong>blue</strong> is the part going towards the back end and{' '}
          <strong>purple</strong> the part going towards the front end. They start at the amber dot and form a V. Light&rsquo;s lean is the
          same at every block speed.
        </li>
        <li>
          <strong>The dots</strong> appear where a dashed line meets a solid line of the same colour. Each is an <strong>event</strong>: the
          flash reaching that end. The number beside it is the time, in seconds, at which it happened.
        </li>
        {part === 1 ? (
          <li>
            <strong>The white marker</strong> (once the dots appear) is your guess. It points at the choice you made. It is only a marker.
          </li>
        ) : (
          <li>
            <strong>The pink writing</strong> shows the speed you chose. The scale is the same in every run, so you can compare runs.
          </li>
        )}
        <li>
          <strong>How it is drawn.</strong> The lines grow upward over a few seconds. Playback speed only changes how long the drawing
          takes, not what is drawn.
        </li>
        <li>
          <strong>When the drawing ends:</strong> the lines stop at the later of the two events, and the worked moment and &ldquo;What to
          look for&rdquo; appear below.
        </li>
      </ul>
    </CaptionBox>
  )
}

// Appears when the drawing ends: it contains the numbers, so it waits until the guess is locked and the dots are drawn.
export function WorkedMoment({ result, diagram, part }: { result: SimultaneityResult; diagram: SpacetimeDiagramData; part: 1 | 2 }) {
  const v = result.velocity
  const half = result.labLength / 2
  const rest = result.restLength
  const moving = v > 0
  const closeBack = trim(1 + v)
  const closeFront = trim(1 - v)
  const backTime = result.backEventLabTime
  const frontTime = result.frontEventLabTime
  const backPos = diagram.backEvent.position
  const frontPos = diagram.frontEvent.position
  const gap = result.labTimeGap
  // Four decimals for the half-length, so that the divisions below can be checked by hand (0.2165 ÷ 1.5 = 0.144).
  const halfText = half.toFixed(rest - result.labLength < 0.0005 && moving ? 5 : 4)
  const f = (n: number) => n.toFixed(moving && rest - result.labLength < 0.0005 ? 5 : 3)
  const signed = (n: number) => f(n).replace('-', '−')
  return (
    <CaptionBox>
      <p style={{ ...heading, marginBottom: '0.5rem' }}>
        <strong>
          A worked moment, step by step ({part === 1 ? 'at' : 'for'} {v}c).
        </strong>
      </p>
      <ol style={list}>
        <li>
          The block is {rest.toFixed(3)} light-seconds long at rest.{' '}
          {moving
            ? `As seen from the lab it is shorter, ${lengthText(rest, result.labLength)} light-seconds, `
            : 'At rest the lab sees it at that length, '}
          so each end starts {halfText} light-second from the middle, where the flash is released.
        </li>
        <li>
          <strong>The back end.</strong>{' '}
          {moving
            ? `It runs towards the flash and the flash runs towards it, so the gap between them closes at c + ${v}c = ${closeBack}c: ${halfText} ÷ ${closeBack} = `
            : `It stays where it is, so the flash covers ${halfText} light-second at c: ${halfText} ÷ 1 = `}
          <strong>{f(backTime)} s</strong>.{' '}
          {moving
            ? `In that time the back end has moved to position −${halfText} + ${v} × ${f(backTime)} = `
            : 'Its position is '}
          <strong>{signed(backPos)}</strong>. That is the blue dot.
        </li>
        <li>
          <strong>The front end.</strong>{' '}
          {moving
            ? `It runs away from the flash, so the flash gains on it at c − ${v}c = ${closeFront}c: ${halfText} ÷ ${closeFront} = `
            : `It also stays where it is: ${halfText} ÷ 1 = `}
          <strong>{f(frontTime)} s</strong>.{' '}
          {moving ? `The front end has then moved to ${halfText} + ${v} × ${f(frontTime)} = ` : 'Its position is '}
          <strong>{signed(frontPos)}</strong>. That is the purple dot.
        </li>
        <li>
          {gap > 0
            ? `The blue dot is ${gap.toFixed(3)} s lower than the purple dot. Lower on the diagram means earlier.`
            : 'The two dots are at the same height, both at the same time. Nothing is moving, so the flash reaches both ends together.'}
        </li>
      </ol>
    </CaptionBox>
  )
}

export function LookFor({ result, part, runs }: { result: SimultaneityResult; part: 1 | 2; runs?: SimultaneityResult[] }) {
  const gap = result.labTimeGap
  const items =
    part === 1
      ? [
          {
            look: 'the blue dot and the purple dot.',
            means: `the flash reached the back end at ${result.backEventLabTime.toFixed(3)} s and the front end at ${result.frontEventLabTime.toFixed(3)} s, and the blue dot sits lower.`,
            matters: 'this is the answer to your guess, read straight off the diagram.',
          },
          {
            look: 'the height between the two dots.',
            means: `it is ${gap.toFixed(3)} s: the time between the two events.`,
            matters: 'it turns “at the same time or not” into a distance you can see: 0 would mean the dots are level.',
          },
          {
            look: 'the two solid lines and the dashed line each one meets.',
            means: 'the back end leans towards the light’s path, and the front end leans away from it.',
            matters: 'this is what makes the two meetings happen at different heights. The tutor will help you work out why.',
          },
          {
            look: 'the white marker and the dot it points at.',
            means: 'it shows the choice you made.',
            matters: 'it puts what you expected beside what was drawn.',
          },
        ]
      : [
          {
            look: 'the height between the two dots in each run of “Runs so far”.',
            means: `it is ${(runs ?? [result]).map((r) => `${r.labTimeGap.toFixed(3)} s at ${r.velocity}c`).join(', ')}.`,
            matters: 'it shows how far apart in time the two events are as the block goes faster.',
          },
          {
            look: 'the two dots when the block is at 0c, if you have run it.',
            means: 'they are level, the same height.',
            matters: 'it is the baseline: with no motion, the flash reaches both ends together.',
          },
        ]
  return (
    <CaptionBox>
      <p style={{ ...heading, marginBottom: '0.5rem' }}>
        <strong>What to look for</strong>
      </p>
      <LookForList items={items} />
    </CaptionBox>
  )
}

// The speeds used in the Part 2 note: the gap on the diagram at each preset speed, from the module.
export function presetGapText(): string {
  return [0, 0.1, 0.3, 0.5, 0.8, 0.9].map((v) => `${runSimultaneityExperiment(v).labTimeGap.toFixed(3)} s at ${v}c`).join(', ')
}
