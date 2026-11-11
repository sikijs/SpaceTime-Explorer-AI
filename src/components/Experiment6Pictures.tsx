import type { ReactNode } from 'react'
import {
  choiceMarker,
  lengthBarRows,
  lengthBarsScaleEnd,
  guessPositionOnLengthBars,
  lengthContractionStateAt,
  runLengthContractionExperiment,
} from '../physics/lengthContractionExperiment'
import type { LengthContractionResult, LengthChoice, PulseLeg } from '../physics/lengthContractionExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Relativity of Time and Motion, Experiment 6: the pictures (the three light clocks, the three mirror-gap bars and their captions),
// audited to the newer rules (docs/audit/relativity-of-time-and-motion/06-draft-wording.md, approved by the owner on 2026-11-09).
// Every number drawn comes from the physics module (src/physics/lengthContractionExperiment.ts; CLAUDE.md §9). The wording is the
// owner's to approve line by line (CLAUDE.md §28.1).

export const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const REST_COLOR = '#3b82f6' // blue: the rest clock
const CLOSER_COLOR = '#f59e0b' // amber: the moving clock with the mirrors closer together
const IMAGINED_COLOR = '#a78bfa' // violet: the moving clock with the mirrors as far apart as at rest, which is imagined (on the dark bars)
const IMAGINED_DARK = '#6d28d9' // the same violet, darker, for the light-blue clock panels
const CLOSER_DARK = '#b45309' // the same amber, darker, for text on the light-blue clock panels
const REST_DARK = '#1d4ed8' // the same blue, darker, for text on the light-blue clock panels

// Drawing constants (SVG units). Distances from the model are in light-seconds. The clocks are drawn along a horizontal
// line, the direction of motion, so the panels are wide.
const VIEW_WIDTH = 720
const VIEW_HEIGHT = 176
const AXIS_Y = 80
const LEFT_MARGIN = 20
const RIGHT_MARGIN = 20
const MIRROR_HALF_HEIGHT = 26
const LEG_OFFSET = 8
const MAX_PX_PER_LS = 280

const round3 = (n: number) => parseFloat(n.toFixed(3))

export function formatClockReading(seconds: number): string {
  const tenths = Math.round(seconds * 10)
  const whole = Math.floor(tenths / 10)
  const minutes = Math.floor(whole / 60)
  const secs = whole % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths % 10}`
}

// Same clock look as Experiments 3 to 5, smaller so that all three clocks fit on the screen at once.
const clockBoxStyle = {
  fontSize: '1.6rem',
  fontFamily: 'monospace',
  fontWeight: 'bold' as const,
  padding: '0.4rem 0.25rem',
  backgroundColor: '#d9ecff',
  borderRadius: '6px',
  textAlign: 'center' as const,
}

// The furthest the front mirror gets during the run, over both moving clocks. All panels share one scale so the lengths and
// paths can be compared by eye.
function widestExtent(geometry: LengthContractionResult): number {
  return Math.max(
    geometry.sameLength.lengthInLab + geometry.sameLength.sidewaysDistancePerTick,
    geometry.shorterLength.lengthInLab + geometry.shorterLength.sidewaysDistancePerTick
  )
}

function pixelsPerLightSecond(geometry: LengthContractionResult): number {
  return Math.min(MAX_PX_PER_LS, (VIEW_WIDTH - LEFT_MARGIN - RIGHT_MARGIN) / widestExtent(geometry))
}

interface LightClockPanelProps {
  title: string
  titleColor: string
  titleLines: string[] // drawn inside the picture, one line each, so a long title is not cut off at the edges
  readingNote: string
  scale: number
  clockReading: number
  leg: PulseLeg
  turnPosition: number // where the pulse turns round: the front mirror at that moment
  startFrontPosition: number | null // where the front mirror started; null for the rest clock
  backMirrorPosition: number
  frontMirrorPosition: number
  pulsePosition: number
  pulseColor: string
  pathLabelColor: string
}

// Draws what the physics model reports at the current lab time; no physics is calculated here.
// The forward and return legs are drawn at slightly different heights only so both can be seen.
function LightClockPanel({
  title,
  titleColor,
  titleLines,
  readingNote,
  scale,
  clockReading,
  leg,
  turnPosition,
  startFrontPosition,
  backMirrorPosition,
  frontMirrorPosition,
  pulsePosition,
  pulseColor,
  pathLabelColor,
}: LightClockPanelProps) {
  const x = (position: number) => LEFT_MARGIN + position * scale
  const forwardY = AXIS_Y - LEG_OFFSET
  const returnY = AXIS_Y + LEG_OFFSET
  const pulseY = leg === 'forward' ? forwardY : returnY

  const trace: Array<[number, number]> = [[x(0), forwardY]]
  if (leg !== 'forward') trace.push([x(turnPosition), forwardY], [x(turnPosition), returnY])
  trace.push([x(pulsePosition), pulseY])

  const mirror = (position: number, key: string, color: string, dashed = false, opacity = 1) => (
    <line
      key={key}
      x1={x(position)}
      y1={AXIS_Y - MIRROR_HALF_HEIGHT}
      x2={x(position)}
      y2={AXIS_Y + MIRROR_HALF_HEIGHT}
      stroke={color}
      strokeWidth={dashed ? 2 : 6}
      strokeDasharray={dashed ? '4 3' : undefined}
      opacity={opacity}
    />
  )

  // Once the pulse has turned round, leave a faint mark where the front mirror was at that moment,
  // because the mirror itself has moved on. Only the moving clocks need it: the rest clock's mirror stays put.
  const showTurnMark = startFrontPosition !== null && leg !== 'forward'
  const turnLabelAnchor = x(turnPosition) > VIEW_WIDTH - 110 ? 'end' : 'middle'
  // The "Light pulse" label sits beside the dot; when the pulse is at a mirror, the label moves clear of the mirror bar.
  const pulseX = x(pulsePosition)
  const nearFront = Math.abs(pulseX - x(frontMirrorPosition)) < 16
  const nearBack = Math.abs(pulseX - x(backMirrorPosition)) < 16
  const pulseLabelLeft = pulseX > VIEW_WIDTH - 100 || nearFront
  const pulseLabelDx = nearFront || nearBack ? 16 : 9
  const pulseLabelY = leg === 'forward' ? pulseY - 10 : pulseY + 18
  const mirrorLabelY = AXIS_Y + MIRROR_HALF_HEIGHT + 14
  // The two mirror labels sit under the mirrors; when the mirrors are close together on the screen they are kept apart.
  const mirrorsClose = Math.abs(x(frontMirrorPosition) - x(backMirrorPosition)) < 110
  // At the left edge the back mirror's label would run off the picture, so it starts at the mirror instead of being centred on it.
  const backLabelAtEdge = !mirrorsClose && x(backMirrorPosition) < 60
  // The length of the clock: a double-headed arrow between the two mirrors, below their labels, with thin dashed lines down from
  // the mirrors. It follows the mirrors, which move together, so it keeps the same length through the run. The number is given
  // in the length strip when the run ends.
  const lengthArrowY = VIEW_HEIGHT - 26
  const arrowLeft = x(backMirrorPosition)
  const arrowRight = x(frontMirrorPosition)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: '0 0 170px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', color: titleColor, fontWeight: 'bold', margin: '0 0 0.25rem' }}>{title}</p>
        <div className="clock-readout" style={clockBoxStyle}>
          {formatClockReading(clockReading)}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{readingNote}</p>
      </div>
      <div style={{ flex: '1 1 320px', minWidth: 0, backgroundColor: '#d9ecff', borderRadius: '6px', padding: '0.25rem 0.5rem' }}>
        <svg className="narrow-scroll"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`${titleLines.join(' ')}: light pulse travelling between two mirrors along the direction of motion`}
          style={{ width: '100%', height: 'auto' }}
        >
          <text x={LEFT_MARGIN} y={14} fontSize="12" fontWeight="bold" fill={titleColor}>
            {titleLines.map((line, i) => (
              <tspan key={i} x={LEFT_MARGIN} dy={i === 0 ? 0 : 13}>
                {line}
              </tspan>
            ))}
          </text>
          {startFrontPosition !== null && (
            <>
              {mirror(0, 'start-back', '#999', true)}
              {mirror(startFrontPosition, 'start-front', '#999', true)}
            </>
          )}
          {showTurnMark && (
            <>
              {mirror(turnPosition, 'turn', '#333', false, 0.3)}
              <text x={x(turnPosition)} y={AXIS_Y - MIRROR_HALF_HEIGHT - 5} textAnchor={turnLabelAnchor} fontSize="11" fill="#666">
                front mirror when the pulse hit it
              </text>
            </>
          )}
          <polyline points={trace.map(([px, py]) => `${px},${py}`).join(' ')} fill="none" stroke={pulseColor} strokeWidth="2" />
          {mirror(backMirrorPosition, 'back', '#333')}
          {mirror(frontMirrorPosition, 'front', '#333')}
          <circle cx={x(pulsePosition)} cy={pulseY} r="5" fill={pulseColor} />
          <text
            x={pulseLabelLeft ? pulseX - pulseLabelDx : pulseX + pulseLabelDx}
            y={pulseLabelY}
            textAnchor={pulseLabelLeft ? 'end' : 'start'}
            fontSize="10"
            fontWeight="bold"
            fill={pathLabelColor}
          >
            Light pulse
          </text>
          <text x={backLabelAtEdge ? Math.max(4, x(backMirrorPosition) - 8) : x(backMirrorPosition)} y={mirrorLabelY} textAnchor={mirrorsClose ? 'end' : backLabelAtEdge ? 'start' : 'middle'} fontSize="10" fontWeight="bold" fill="#222">
            Back mirror
          </text>
          <text x={x(frontMirrorPosition)} y={mirrorLabelY} textAnchor={mirrorsClose ? 'start' : 'middle'} fontSize="10" fontWeight="bold" fill="#222">
            Front mirror
          </text>
          <g stroke="#222" strokeWidth="1" fill="#222">
            <line x1={arrowLeft} y1={mirrorLabelY + 6} x2={arrowLeft} y2={lengthArrowY + 4} strokeDasharray="2 2" />
            <line x1={arrowRight} y1={mirrorLabelY + 6} x2={arrowRight} y2={lengthArrowY + 4} strokeDasharray="2 2" />
            <line x1={arrowLeft + 4} y1={lengthArrowY} x2={arrowRight - 4} y2={lengthArrowY} />
            <polygon points={`${arrowLeft},${lengthArrowY} ${arrowLeft + 7},${lengthArrowY - 3.5} ${arrowLeft + 7},${lengthArrowY + 3.5}`} stroke="none" />
            <polygon points={`${arrowRight},${lengthArrowY} ${arrowRight - 7},${lengthArrowY - 3.5} ${arrowRight - 7},${lengthArrowY + 3.5}`} stroke="none" />
          </g>
          <text x={(arrowLeft + arrowRight) / 2} y={lengthArrowY - 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#222">
            length of the clock
          </text>
          <line x1={10} y1={VIEW_HEIGHT - 12} x2={30} y2={VIEW_HEIGHT - 12} stroke={pulseColor} strokeWidth="2" />
          <text x={36} y={VIEW_HEIGHT - 8} fontSize="10" fill="#444">
            Path of the light (forward leg and return leg)
          </text>
          {startFrontPosition !== null && (
            <>
              <line x1={300} y1={VIEW_HEIGHT - 12} x2={320} y2={VIEW_HEIGHT - 12} stroke="#999" strokeWidth="2" strokeDasharray="4 3" />
              <text x={326} y={VIEW_HEIGHT - 8} fontSize="10" fill="#444">
                Where the mirrors started
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  )
}

// The three panels (the rest clock, and the same moving clock with its mirrors as far apart as at rest and with its mirrors closer
// together), with the lab-time readout above them.
export function ThreeClockPanels({
  geometry,
  labTime,
  running,
}: {
  geometry: LengthContractionResult
  labTime: number
  running: boolean
}) {
  const state = lengthContractionStateAt(geometry, Math.max(labTime, 0))
  const scale = pixelsPerLightSecond(geometry)
  // A reading is not a tick length: say when it was read.
  const runEnd = Math.max(geometry.sameLength.tickDuration, geometry.shorterLength.tickDuration)
  const finished = labTime >= runEnd - 1e-9
  const readingNote = running ? 'reading now' : finished ? 'reading when the run ended' : 'reading at the start'
  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {running ? 'Running...' : finished ? 'Finished' : 'At rest'} · Lab time: <strong>{labTime.toFixed(2)} s</strong> · Moving clocks at{' '}
        <strong>{geometry.velocity}c</strong>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <LightClockPanel
          title="Rest clock"
          titleColor={REST_DARK}
          titleLines={[`Rest clock: length ${geometry.restLength.toFixed(3)} light-seconds`, 'at rest in the lab']}
          readingNote={readingNote}
          scale={scale}
          clockReading={state.restClock.clockReading}
          leg={state.restClock.phase < 0.5 ? 'forward' : 'return'}
          turnPosition={geometry.restLength}
          startFrontPosition={null}
          backMirrorPosition={state.restClock.backMirrorPosition}
          frontMirrorPosition={state.restClock.frontMirrorPosition}
          pulsePosition={state.restClock.pulsePosition}
          pulseColor="#e6a700"
          pathLabelColor="#7a5600"
        />
        <LightClockPanel
          title="Moving clock: same length as at rest (imagined)"
          titleColor={IMAGINED_DARK}
          titleLines={['IMAGINED: moving clock,', 'same length as at rest, seen from the lab']}
          readingNote={readingNote}
          scale={scale}
          clockReading={state.sameLength.clockReading}
          leg={state.sameLength.leg}
          turnPosition={geometry.sameLength.forwardLegPath}
          startFrontPosition={geometry.sameLength.lengthInLab}
          backMirrorPosition={state.sameLength.backMirrorPosition}
          frontMirrorPosition={state.sameLength.frontMirrorPosition}
          pulsePosition={state.sameLength.pulsePosition}
          pulseColor={IMAGINED_DARK}
          pathLabelColor={IMAGINED_DARK}
        />
        <LightClockPanel
          title="Moving clock: shorter"
          titleColor={CLOSER_DARK}
          titleLines={['Moving clock, shorter:', 'seen from the lab']}
          readingNote={readingNote}
          scale={scale}
          clockReading={state.shorterLength.clockReading}
          leg={state.shorterLength.leg}
          turnPosition={geometry.shorterLength.forwardLegPath}
          startFrontPosition={geometry.shorterLength.lengthInLab}
          backMirrorPosition={state.shorterLength.backMirrorPosition}
          frontMirrorPosition={state.shorterLength.frontMirrorPosition}
          pulsePosition={state.shorterLength.pulsePosition}
          pulseColor="#e6a700"
          pathLabelColor="#7a5600"
        />
      </div>
    </div>
  )
}

// ---- The three mirror-gap bars (Part 1's picture, and Drawing A in Part 2 with the learner's speed in pink) ----
const B = { width: 640, left: 160, right: 600, height: 392 }
const REST_BAR_Y = 40
const SAME_BAR_Y = 150
const CLOSER_BAR_Y = 235
const BAR_H = 22
const AXIS_BAR_Y = 305
const TAG_Y = 350

export interface GapGuesses {
  choice: LengthChoice
  gap: number
}

const CHOICE_TEXT: Record<LengthChoice, string> = {
  same: 'the same length as at rest',
  shorter: 'shorter than at rest',
  longer: 'longer than at rest',
}

export function GapBars({
  experiment,
  pinkSpeed,
  guesses,
  label,
  title,
}: {
  experiment: LengthContractionResult
  pinkSpeed: number | null // Drawing A: the learner's own speed, written in pink
  guesses: GapGuesses | null // Part 1: the learner's two guesses, in white
  label: string
  title?: string // the picture's title; the default is Part 1's
}) {
  const scaleEnd = lengthBarsScaleEnd(experiment)
  const rows = lengthBarRows(experiment)
  // What the pulse did in each clock, written under that bar's number, so the learner can see how the length was found.
  const tripText = (row: (typeof rows)[number]) =>
    row.returnLegDuration === null
      ? `pulse: ${row.forwardLegDuration.toFixed(3)} s across, tick ${row.tickDuration.toFixed(3)} s`
      : `pulse: ${row.forwardLegDuration.toFixed(3)} s forward, ${row.returnLegDuration.toFixed(3)} s back, tick ${row.tickDuration.toFixed(3)} s`
  const px = (lightSeconds: number) => B.left + (lightSeconds / scaleEnd) * (B.right - B.left)
  const restEnd = px(experiment.restLength)
  const sameEnd = px(experiment.sameLength.lengthInLab)
  const closerEnd = px(experiment.shorterLength.lengthInLab)
  const stroke = { stroke: '#0b1020', strokeWidth: 4, paintOrder: 'stroke' } as const

  // A number has a position, so its mark follows it: a white dashed line across the two moving bars at the guessed gap, a white dot
  // on the amber bar, and a YOUR GUESS box joined to it by the line.
  const guessMark = (value: number) => {
    const mark = guessPositionOnLengthBars(experiment, value)
    const markX = B.left + mark.fraction * (B.right - B.left)
    const text = `YOUR GUESS: ${value} light-seconds long${mark.offEdge ? ' (off the scale)' : ''}`
    const boxWidth = Math.max(170, text.length * 8 + 16)
    const boxX = Math.min(Math.max(markX - boxWidth / 2, 4), B.width - boxWidth - 4)
    const boxY = SAME_BAR_Y - 44
    const barMid = CLOSER_BAR_Y + BAR_H / 2
    return (
      <g>
        <line x1={markX} y1={boxY + 22} x2={markX} y2={barMid} stroke={GUESS_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
        {mark.offEdge === null ? (
          <circle cx={markX} cy={barMid} r={7} fill={GUESS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
        ) : (
          <polygon
            points={
              mark.offEdge === 'right'
                ? `${markX + 12},${barMid} ${markX},${barMid - 9} ${markX},${barMid + 9}`
                : `${markX - 12},${barMid} ${markX},${barMid - 9} ${markX},${barMid + 9}`
            }
            fill={GUESS_COLOR}
          />
        )}
        <rect x={boxX} y={boxY} width={boxWidth} height={22} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
        <text x={boxX + 8} y={boxY + 15} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
          {text}
        </text>
      </g>
    )
  }

  // The choice has no size or position, so it is a marker only. "As far apart" outlines the violet bar's label and "closer together"
  // outlines the amber bar's, each joined by a white line to a white tag at the bottom; "farther apart" is a white arrow just past
  // the end of the rest bar, joined to the tag by a line along the right-hand side.
  const choiceMark = (choice: LengthChoice) => {
    const marker = choiceMarker(experiment, choice)
    const text = `YOUR GUESS (a marker only): ${CHOICE_TEXT[choice]}`
    const boxWidth = text.length * 7.4 + 16
    const tagMid = TAG_Y + 13
    if (marker.pointsAt === 'pastRestBar') {
      const arrowY = REST_BAR_Y + BAR_H / 2
      const railX = B.width - 14
      return (
        <g>
          <polygon points={`${restEnd + 28},${arrowY} ${restEnd + 12},${arrowY - 9} ${restEnd + 12},${arrowY + 9}`} fill={GUESS_COLOR} />
          <polyline points={`${restEnd + 28},${arrowY} ${railX},${arrowY} ${railX},${tagMid} ${4 + boxWidth},${tagMid}`} fill="none" stroke={GUESS_COLOR} strokeWidth={2} />
          <rect x={4} y={TAG_Y} width={boxWidth} height={26} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
          <text x={12} y={TAG_Y + 17} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
            {text}
          </text>
        </g>
      )
    }
    const barY = marker.pointsAt === 'sameBar' ? SAME_BAR_Y : CLOSER_BAR_Y
    return (
      <g>
        <line x1={7} y1={TAG_Y} x2={7} y2={barY + BAR_H / 2} stroke={GUESS_COLOR} strokeWidth={2} />
        <line x1={7} y1={barY + BAR_H / 2} x2={12} y2={barY + BAR_H / 2} stroke={GUESS_COLOR} strokeWidth={2} />
        <rect x={12} y={barY - 12} width={B.left - 26} height={BAR_H + 26} fill="none" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
        <rect x={4} y={TAG_Y} width={boxWidth} height={26} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
        <text x={12} y={TAG_Y + 17} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
          {text}
        </text>
      </g>
    )
  }

  return (
    <svg className="narrow-scroll" width={B.width} height={B.height} viewBox={`0 0 ${B.width} ${B.height}`} style={svgStyle} role="img" aria-label={label}>
      {pinkSpeed !== null && (
        <text x={4} y={16} fill={YOURS_COLOR} fontSize="13" fontWeight="bold">
          your speed: {pinkSpeed}c
        </text>
      )}
      <text x={B.left} y={16} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        {title ?? (pinkSpeed !== null ? 'Length of the moving clock at your speed' : 'Length of each clock, seen from the lab')}
      </text>
      {/* a dashed line joins the three bars at the back mirror, where all three clocks start */}
      <line x1={px(0)} y1={REST_BAR_Y} x2={px(0)} y2={CLOSER_BAR_Y + BAR_H} stroke={MUTED_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />

      <text x={16} y={REST_BAR_Y + 10} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        Rest clock
      </text>
      <text x={16} y={REST_BAR_Y + 23} fill={TEXT_COLOR} fontSize="11">
        length of the clock
      </text>
      <rect x={px(0)} y={REST_BAR_Y} width={restEnd - px(0)} height={BAR_H} fill={REST_COLOR} />

      <text x={16} y={SAME_BAR_Y + 2} fill={IMAGINED_COLOR} fontSize="11" fontWeight="bold">
        IMAGINED:
      </text>
      <text x={16} y={SAME_BAR_Y + 15} fill={IMAGINED_COLOR} fontSize="11" fontWeight="bold">
        same length
      </text>
      <text x={16} y={SAME_BAR_Y + 28} fill={IMAGINED_COLOR} fontSize="11" fontWeight="bold">
        as at rest
      </text>
      <rect x={px(0)} y={SAME_BAR_Y} width={sameEnd - px(0)} height={BAR_H} fill={IMAGINED_COLOR} />

      <text x={16} y={CLOSER_BAR_Y + 10} fill={CLOSER_COLOR} fontSize="12" fontWeight="bold">
        Moving clock,
      </text>
      <text x={16} y={CLOSER_BAR_Y + 23} fill={CLOSER_COLOR} fontSize="12" fontWeight="bold">
        shorter
      </text>
      <rect x={px(0)} y={CLOSER_BAR_Y} width={closerEnd - px(0)} height={BAR_H} fill={CLOSER_COLOR} />

      <line x1={B.left} y1={AXIS_BAR_Y} x2={B.right} y2={AXIS_BAR_Y} stroke={MUTED_COLOR} strokeWidth={2} />
      {[0, scaleEnd / 2, scaleEnd].map((t, i) => (
        <g key={i}>
          <line x1={px(t)} y1={AXIS_BAR_Y - 5} x2={px(t)} y2={AXIS_BAR_Y + 5} stroke={MUTED_COLOR} />
          <text x={px(t)} y={AXIS_BAR_Y + 18} fill={MUTED_COLOR} fontSize="10" textAnchor={i === 0 ? 'start' : i === 2 ? 'end' : 'middle'}>
            {round3(t)}
          </text>
        </g>
      ))}
      <text x={14} y={AXIS_BAR_Y + 36} fill={MUTED_COLOR} fontSize="10">
        length of the clock = distance between its mirrors, in light-seconds (0 = the back mirror, where all clocks start)
      </text>
      {/* white: the learner's guesses, placed on the same scale */}
      {guesses && guessMark(guesses.gap)}
      {/* the length and trip-time labels are drawn after the guess line, so their dark outline keeps the line from running through the words */}
      <text x={restEnd} y={REST_BAR_Y + BAR_H + 15} fill={TEXT_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        length: {experiment.restLength.toFixed(3)} light-seconds
      </text>
      <text x={restEnd} y={REST_BAR_Y + BAR_H + 29} fill={MUTED_COLOR} fontSize="11" textAnchor="middle" {...stroke}>
        {tripText(rows[0])}
      </text>
      <text x={sameEnd} y={SAME_BAR_Y + BAR_H + 15} fill={IMAGINED_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        length: {experiment.sameLength.lengthInLab.toFixed(3)} light-seconds
      </text>
      <text x={sameEnd} y={SAME_BAR_Y + BAR_H + 29} fill={MUTED_COLOR} fontSize="11" textAnchor="middle" {...stroke}>
        {tripText(rows[1])}
      </text>
      <text x={closerEnd} y={CLOSER_BAR_Y + BAR_H + 16} fill={CLOSER_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle" {...stroke}>
        length: {experiment.shorterLength.lengthInLab.toFixed(3)} light-seconds
      </text>
      <text x={closerEnd} y={CLOSER_BAR_Y + BAR_H + 30} fill={MUTED_COLOR} fontSize="11" textAnchor="middle" {...stroke}>
        {tripText(rows[2])}
      </text>
      {guesses && choiceMark(guesses.choice)}
    </svg>
  )
}

function LookFor({ items }: { items: Array<{ look: string; means: string; matters: string }> }) {
  return (
    <>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
    </>
  )
}

export function CaptionBox({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '0.75rem 1rem',
        fontSize: '0.8125rem',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: 'var(--text-muted)',
      }}
    >
      {children}
    </div>
  )
}

// Shown from the start: only what is drawn before the run.
export function PanelsCaption() {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the three light clocks.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>Three panels</strong> show the same kind of clock, with its two mirrors in a line along the direction of motion. The
          top one, the <strong>Rest clock</strong>, stands still in the lab. The other two are the <strong>same moving clock</strong>,
          seen from the lab, drawn twice. The only difference is the <strong>length</strong> of the clock, as seen from the lab. The
          violet one, labelled <strong>IMAGINED</strong>, is the same length as at rest, which is a &ldquo;what if&rdquo;. The
          amber-titled one is shorter.
        </li>
        <li>
          <strong>In each panel,</strong> two black bars are the <strong>back mirror</strong> and the <strong>front mirror</strong>.
          The dot is the <strong>light pulse</strong>, and the line is the <strong>path</strong> it has taken so far (violet in the
          imagined panel, yellow in the other two). The <strong>double arrow</strong> under the mirrors is the{' '}
          <strong>length of the clock</strong>, from the back mirror to the front mirror. The three panels use the same scale (in
          light-seconds), so you can compare lengths by eye.
        </li>
        <li>
          <strong>The moving clocks:</strong> the whole clock, both mirrors, slides along together, front mirror first. The dashed
          lines show where the mirrors started. Once the pulse has hit the front mirror, a faint mark shows where that mirror was at
          that moment, because the mirror has already moved on.
        </li>
        <li>
          <strong>The two legs of the path</strong> are drawn at slightly different heights only so that you can see both. The light
          really travels along one line.
        </li>
        <li>
          <strong>The readouts:</strong> above the panels, &ldquo;Lab time&rdquo; is the time on the clocks standing still in the lab.
          Each panel&rsquo;s box shows that clock&rsquo;s own reading (minutes:seconds.tenths: 00:01.2 is 1.2 seconds), and the note
          under it says when it was read. A reading is not the length of a tick.
        </li>
        <li>
          <strong>When the run ends:</strong> every clock has its own job, and the run stops when the last job is done.
          <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The clock standing still</strong> keeps ticking until the run ends.
            </li>
            <li>
              <strong>Each moving clock</strong> makes exactly <strong>one tick</strong>: its pulse goes from the back mirror to the
              front mirror and back once. Then that clock <strong>freezes</strong> and keeps showing its reading.
            </li>
            <li>
              <strong>The two moving clocks finish at different moments</strong>, because the tick is shorter for the clock that
              is shorter. That clock freezes first, while the other pulse is still on its way. It is like two
              runners who each run one lap at the same speed, one on a shorter track: the one on the shorter track finishes first and
              waits at the line.
            </li>
            <li>
              <strong>The run ends</strong> when the slower of the two moving clocks has finished its tick.
            </li>
          </ul>
        </li>
      </ul>
    </CaptionBox>
  )
}

export function BarsCaption({
  name,
  experiment,
  guesses,
  pink,
}: {
  name: string
  experiment: LengthContractionResult
  guesses: boolean
  pink: boolean
}) {
  const e = experiment
  const rest = e.restLength.toFixed(3)
  const same = e.sameLength.lengthInLab.toFixed(3)
  const closer = e.shorterLength.lengthInLab.toFixed(3)
  const gap = (e.sameLength.lengthInLab - e.shorterLength.lengthInLab).toFixed(3)
  const sample = guessPositionOnLengthBars(e, 0.45)
  const slow = runLengthContractionExperiment(0.1)
  const fast = runLengthContractionExperiment(0.8)
  const scaleEnd = round3(lengthBarsScaleEnd(e))
  const rows = lengthBarRows(e)
  const sameRow = rows[1]
  const shorterRow = rows[2]
  const t3 = (n: number | null) => (n === null ? '' : n.toFixed(3))
  const items = pink
    ? [
        {
          look: 'the amber bar in each run in “Runs so far”.',
          means: `Its length gets smaller as the speed goes up (here ${closer} light-seconds at ${e.velocity}c; at 0.1c it is ${slow.shorterLength.lengthInLab.toFixed(4)} and at 0.8c it is ${fast.shorterLength.lengthInLab.toFixed(3)}), while the violet length stays at ${same}.`,
          matters: 'It shows how the length found in Part 1 depends on the speed.',
        },
      ]
    : [
        {
          look: 'the right end of the blue bar.',
          means: `The clock standing still is ${rest} light-seconds long.`,
          matters: 'Every other length is compared with this one, so it shows what “no change in length” looks like.',
        },
        {
          look: 'the blue bar and the violet bar together.',
          means: `They end in the same place, ${rest} and ${same} light-seconds. The violet clock is the same length as the clock at rest.`,
          matters: 'It is the “what if” we are testing: that moving does not change length.',
        },
        {
          look: 'the gap between the end of the amber bar and the end of the violet bar.',
          means: `The amber clock is ${same} − ${closer} = ${gap} light-seconds shorter than the rest length.`,
          matters: 'It turns the difference between the two moving clocks into a length you can see. The tutor will help you work out which of the two fits what time dilation says.',
        },
        {
          look: `the trip times written under the bars (${t3(sameRow.forwardLegDuration)} s forward and ${t3(sameRow.returnLegDuration)} s back for violet; ${t3(shorterRow.forwardLegDuration)} s forward and ${t3(shorterRow.returnLegDuration)} s back for amber).`,
          means: `Each bar’s length and its trip times go together: the violet length ${same} gives a tick of ${t3(sameRow.tickDuration)} s, and the amber length ${closer} gives a tick of ${t3(shorterRow.tickDuration)} s.`,
          matters: 'It shows how light’s travel time is used to read a length, so you can see that a different length gives a different round trip.',
        },
      ]
  if (guesses) {
    items.push({
      look: 'the white YOUR GUESS mark and the end of the amber bar, and at the white marker tag.',
      means: 'The gap between the mark and the end of the bar is how far your length was from the amber clock’s length, in light-seconds. The tag only says which choice you made.',
      matters: 'It puts the length you expected beside the lengths found.',
    })
  }
  const v = e.velocity
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read {name}.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The bars</strong> appear when the run ends. They are a <strong>length scale</strong> in light-seconds: the further
          right, the longer. Each bar is the <strong>length of one clock</strong>, as seen from the lab, from the back mirror (0) to
          the front mirror. Think of a train carriage drawn as a bar: a longer bar is a longer carriage. The scale runs to {scaleEnd}{' '}
          light-second, twice the rest length, so there is room on the right
          {pink ? ' at every speed, so you can compare one run with another' : ''}.
        </li>
        {pink ? (
          <li>
            <strong>Blue</strong> is the rest clock. <strong>Amber</strong> is the moving clock, shorter. <strong>Violet</strong> is
            the moving clock with the same length as at rest: imagined, drawn only to answer the question. <strong>Pink</strong>{' '}
            marks your own speed, written above the bars, so you can tell this drawing from Part 1&rsquo;s. &ldquo;Runs so
            far&rdquo; lists every run in this Part.
          </li>
        ) : (
          <>
            <li>
              <strong>Blue: the clock standing still.</strong> This is the baseline. Its length is {rest} light-seconds.
            </li>
            <li>
              <strong>Violet: the moving clock with the same length as at rest.</strong> This one is imagined, drawn only to answer
              the question. Its length is {same} light-seconds.
            </li>
            <li>
              <strong>Amber: the moving clock, shorter.</strong> At {v}c its length is {closer} light-seconds.
            </li>
          </>
        )}
        <li>
          <strong>How each bar&rsquo;s length was found.</strong> Each length comes from the time the pulse of light takes on its
          trips, because light&rsquo;s speed in the lab is always c: distance = speed &times; time. For the rest clock the pulse
          crosses in {t3(rows[0].forwardLegDuration)} s, and 1 &times; {round3(rows[0].forwardLegDuration)} = {rest} light-seconds.
          For the moving clocks the pulse&rsquo;s two trips take different times, because the mirrors are moving, and the
          calculation allows for that. The trip times are written under each bar.
        </li>
        {!pink && guesses && (
          <li>
            <strong>The white mark and the YOUR GUESS box</strong> are your number, placed on the same scale. A white arrow at the
            edge means your guess is beyond the end of the scale. The <strong>white marker tag</strong> is your choice: it has no
            size, it is only a marker that points at the choice you made. None of the white things ever moves a bar.
          </li>
        )}
      </ul>
      {pink ? (
        <p style={{ marginBottom: '0.5rem' }}>
          <strong>A worked moment.</strong>{' '}
          {`At ${v}c the amber clock is ${closer} light-seconds long. The pulse ran forward for ${closer} ÷ ${round3(1 - v)} = ${shorterRow.forwardLegDuration.toFixed(3)} s and back for ${closer} ÷ ${round3(1 + v)} = ${t3(shorterRow.returnLegDuration)} s: one tick took ${shorterRow.tickDuration.toFixed(3)} s, the tick that time dilation gives (${e.timeDilationTick.toFixed(3)} s). For the violet clock one tick took ${e.sameLength.tickDuration.toFixed(3)} s.`}
        </p>
      ) : (
        <>
          <p style={{ marginBottom: '0.25rem' }}>
            <strong>A worked moment, step by step</strong> (clocks moving at {v}c, with the standing-still length {rest} light-seconds).
          </p>
          <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Which way is each trip?</strong> &ldquo;Forward&rdquo; is the pulse going from the back mirror to the front mirror.
              &ldquo;Back&rdquo; is the pulse coming home again. The pulse always travels at c, as seen from the lab. But both mirrors are moving, and that changes how quickly
              the pulse reaches the mirror it is heading for. <em>Going forward, the pulse is chasing a mirror that is running away,
              so it gains on it slowly. Coming back, the mirror is moving towards the pulse, so they meet quickly.</em> Like a
              runner chasing a bus that is pulling away (the gap closes slowly), against two people walking towards each other
              (the gap closes fast).
            </li>
            <li>
              <strong>How fast does the pulse close the gap?</strong> Going forward, the front mirror runs away from it: c &minus; {v}c ={' '}
              <strong>{round3(1 - v)}c</strong>. Coming back, the back mirror runs towards it: c + {v}c = <strong>{round3(1 + v)}c</strong>.
            </li>
            <li>
              <strong>The violet clock</strong> keeps the length {same} light-seconds. Forward: <strong>{`${same} ÷ ${round3(1 - v)} = ${e.sameLength.forwardLegDuration.toFixed(3)} s`}</strong>. Back:{' '}
              <strong>{`${same} ÷ ${round3(1 + v)} = ${e.sameLength.returnLegDuration.toFixed(3)} s`}</strong>. Added together,{' '}
              <strong>{`one tick took ${e.sameLength.tickDuration.toFixed(3)} s`}</strong>.
            </li>
            <li>
              <strong>The amber clock</strong> is shorter, {closer} light-seconds. Forward: <strong>{`${closer} ÷ ${round3(1 - v)} = ${e.shorterLength.forwardLegDuration.toFixed(3)} s`}</strong>. Back:{' '}
              <strong>{`${closer} ÷ ${round3(1 + v)} = ${e.shorterLength.returnLegDuration.toFixed(3)} s`}</strong>. Added together,{' '}
              <strong>{`one tick took ${e.shorterLength.tickDuration.toFixed(3)} s`}</strong>.
            </li>
            <li>
              <strong>Compare with time dilation.</strong> Time dilation says one tick of the moving clock takes{' '}
              <strong>{e.timeDilationTick.toFixed(3)} s</strong>.
            </li>
            {guesses && (
              <li>
                <strong>Your guess.</strong> {`If you had guessed 0.45 light-seconds, your white mark would sit at 0.45, ${Math.abs(sample.differenceFromReal).toFixed(3)} light-seconds ${sample.differenceFromReal >= 0 ? 'to the right of' : 'to the left of'} the end of the amber bar.`}
              </li>
            )}
          </ol>
        </>
      )}
      <LookFor items={items} />
    </CaptionBox>
  )
}
