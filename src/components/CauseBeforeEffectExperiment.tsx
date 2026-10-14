import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { PRESET_EVENTS } from '../physics/lightCones'
import type { EventRelation } from '../physics/lightCones'
import { runCauseBeforeEffectExperiment } from '../physics/causeBeforeEffect'
import { CauseBeforeEffectTutor } from './CauseBeforeEffectTutor'
import type { EventOrder, OrderReading } from '../physics/causeBeforeEffect'

// Steps 2 to 7 (basic interface, prediction, run gate, playback, results, tutor) of docs/experiments/spacetime-geometry/03-cause-before-effect.md:
// introduction, controls, the prediction, the Run button, the diagram with its caption and playback, and the results.
// Step 7 adds the tutor, which is shown below the card once the results are.
// Presets are the defaults of Decisions 2 and 3 of that specification.
const PASSING_SPEED_PRESETS = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]

type Prediction = 'yes' | 'same-moment' | 'no'

// The three answers of the prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1).
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'yes', label: 'Yes, a fast enough observer could find B first' },
  { value: 'same-moment', label: 'An observer could find them at exactly the same moment, but none could find B first' },
  { value: 'no', label: 'No, every observer finds O first' },
]

// The dark canvas used by the newer experiments, with light text and lines.
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
const TICK_COLOR = '#cbd5e1'
const LAB_LINE_COLOR = '#38bdf8'
const EVENT_O_COLOR = '#3b82f6'
const EVENT_B_COLOR = '#f59e0b'
const OBSERVER_COLOR = '#8b5cf6'
const FLASH_COLOR = '#facc15'
const INSIDE_COLOR = '#14b8a6'
const OUTSIDE_COLOR = '#fb7185'
// A dark outline so a label stays readable where it crosses a line.
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

// Drawing constants (SVG units). Position runs across (-6 to 6 light-seconds), time runs up (0 to 6 seconds).
// The drawing leaves room below the ruler: a same-moment line can dip below it.
const VIEW_WIDTH = 460
const VIEW_HEIGHT = 420
const CENTER_X = 230
const X_SCALE = 31
const ORIGIN_Y = 320
const T_SCALE = 34
const MAX_POSITION = 6
const MAX_TIME = 6
// The lowest time drawn, below the ruler.
const MIN_TIME = -2
// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
// The lab's line sweeps first, then the passing observer's line, then it settles through O.
const ANIMATION_DURATION_MS = 10_000
const LAB_SWEEP_END = 0.4
const PASSING_SWEEP_END = 0.85
// How far past the events a sweep starts and stops, in seconds.
const SWEEP_MARGIN = 1

function xOf(position: number): number {
  return CENTER_X + position * X_SCALE
}
function yOf(time: number): number {
  return ORIGIN_Y - time * T_SCALE
}

// A same-moment line is time = slope × position + level. This returns its two ends, cut to the drawn area, or null if none of
// it is in the drawing.
function lineEnds(slope: number, level: number): { x1: number; y1: number; x2: number; y2: number } | null {
  let from = -MAX_POSITION
  let to = MAX_POSITION
  if (slope === 0) {
    if (level < MIN_TIME || level > MAX_TIME) return null
  } else {
    const a = (MIN_TIME - level) / slope
    const b = (MAX_TIME - level) / slope
    from = Math.max(from, Math.min(a, b))
    to = Math.min(to, Math.max(a, b))
    if (from >= to) return null
  }
  return { x1: xOf(from), y1: yOf(slope * from + level), x2: xOf(to), y2: yOf(slope * to + level) }
}

// A small numbered circle, in an observer's line colour, marking the order in which that observer meets an event.
function Badge({ x, y, number, color }: { x: number; y: number; number: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="8" fill="#0b1020" stroke={color} strokeWidth="2" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill={TEXT_COLOR}>
        {number}
      </text>
    </g>
  )
}

function lerp(a: number, b: number, fraction: number): number {
  return a + (b - a) * fraction
}

function eventLabel(index: number): string {
  const { time, position } = PRESET_EVENTS[index]
  return `${time} seconds later, ${Math.abs(position)} light-seconds to the ${position < 0 ? 'left' : 'right'}`
}

function passingLabel(speed: number): string {
  if (speed === 0) return 'At rest in the lab'
  return `${Math.abs(speed)}c, moving to the ${speed > 0 ? 'right' : 'left'}`
}

interface DiagramProps {
  eventIndex: number
  passingSpeed: number
  // null while idle (the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
}

// While idle it draws only the setup: the lab's two axes, event O and event B, and the passing observer. It deliberately draws
// no same-moment lines and no light cone then: which side of each line B falls on is the answer to the prediction (§12).
// While the run plays, the lab's same-moment line sweeps up through the two events, then the passing observer's tilted line
// does, and a numbered badge marks each event in the order that observer meets it. When the run ends, the lines through O and
// the light cone are drawn together.
function Diagram({ eventIndex, passingSpeed, progress }: DiagramProps) {
  const { event, passing, sameMomentLineSlope } = runCauseBeforeEffectExperiment(PRESET_EVENTS[eventIndex], passingSpeed)
  const playing = progress !== null
  const complete = progress !== null && progress >= 1
  const fraction = progress ?? 0
  // Each same-moment line meets O at level 0, and B at the level where B sits: time − slope × position.
  const labLevelB = event.time
  const passingLevelB = event.time - sameMomentLineSlope * event.position
  const labSweepFrom = -SWEEP_MARGIN
  const labSweepTo = labLevelB + SWEEP_MARGIN
  const passingSweepFrom = Math.min(0, passingLevelB) - SWEEP_MARGIN
  const passingSweepTo = Math.max(0, passingLevelB) + SWEEP_MARGIN

  let labLevel: number | null = null
  let passingLevel: number | null = null
  if (complete) {
    labLevel = 0
    passingLevel = 0
  } else if (playing) {
    if (fraction < LAB_SWEEP_END) {
      labLevel = lerp(labSweepFrom, labSweepTo, fraction / LAB_SWEEP_END)
    } else {
      labLevel = 0
      passingLevel =
        fraction < PASSING_SWEEP_END
          ? lerp(passingSweepFrom, passingSweepTo, (fraction - LAB_SWEEP_END) / (PASSING_SWEEP_END - LAB_SWEEP_END))
          : lerp(passingSweepTo, 0, (fraction - PASSING_SWEEP_END) / (1 - PASSING_SWEEP_END))
    }
  }
  const passingSettling = playing && fraction >= PASSING_SWEEP_END
  // A badge appears on an event once that observer's sweeping line has reached it.
  const labMetO = playing && (fraction >= LAB_SWEEP_END || (labLevel !== null && labLevel >= 0))
  const labMetB = playing && (fraction >= LAB_SWEEP_END || (labLevel !== null && labLevel >= labLevelB))
  const passingMetO = playing && fraction >= LAB_SWEEP_END && (passingSettling || (passingLevel !== null && passingLevel >= 0))
  const passingMetB = playing && fraction >= LAB_SWEEP_END && (passingSettling || (passingLevel !== null && passingLevel >= passingLevelB))
  // The numbers come from the physics model's order; the sweep only decides when they appear.
  const passingNumberO = passing.order === 'b-first' ? 2 : 1
  const passingNumberB = passing.order === 'o-first' ? 2 : 1
  const labLine = labLevel === null ? null : lineEnds(0, labLevel)
  const passingLine = passingLevel === null ? null : lineEnds(sameMomentLineSlope, passingLevel)
  const bX = xOf(event.position)
  const bY = yOf(event.time)
  const positionMarks = Array.from({ length: 2 * MAX_POSITION + 1 }, (_, i) => i - MAX_POSITION)
  const timeMarks = Array.from({ length: MAX_TIME + 1 }, (_, i) => i)
  // The label is kept off the time axis and inside the drawing: beside B when there is room on its side, above B and
  // leaning toward the middle when B is far out. It sits above B's dashed guide lines, so it is never struck through.
  const roomBeside = Math.abs(event.position) <= 3
  const labelOnRight = event.position > 0
  const bAnchor = roomBeside === labelOnRight ? 'start' : 'end'
  const bLabelX = bAnchor === 'start' ? bX + (roomBeside ? 12 : -8) : bX + (roomBeside ? -12 : 8)

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`${complete ? 'Result: the lab\'s and the passing observer\'s same-moment lines through O, the light cone, and event B. ' : playing ? 'Playback: a same-moment line sweeps up through the events. ' : 'Setup: '}Event O is here and now, at position 0 and time 0. Event B happens ${eventLabel(eventIndex)}. A passing observer is shown: ${passingLabel(passingSpeed).toLowerCase()}.`}
      style={SVG_STYLE}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Space and time, from the lab's point of view
      </text>

      {/* The regions and the cone's edges, drawn behind everything else once the run has ended. */}
      {complete && (
        <g>
          <polygon
            points={`${CENTER_X},${ORIGIN_Y} ${xOf(MAX_TIME)},${yOf(MAX_TIME)} ${xOf(-MAX_TIME)},${yOf(MAX_TIME)}`}
            fill={INSIDE_COLOR}
            fillOpacity="0.25"
          />
          <polygon
            points={`${CENTER_X},${ORIGIN_Y} ${xOf(MAX_TIME)},${yOf(MAX_TIME)} ${xOf(MAX_POSITION)},${yOf(MAX_TIME)} ${xOf(MAX_POSITION)},${ORIGIN_Y}`}
            fill={OUTSIDE_COLOR}
            fillOpacity="0.22"
          />
          <polygon
            points={`${CENTER_X},${ORIGIN_Y} ${xOf(-MAX_TIME)},${yOf(MAX_TIME)} ${xOf(-MAX_POSITION)},${yOf(MAX_TIME)} ${xOf(-MAX_POSITION)},${ORIGIN_Y}`}
            fill={OUTSIDE_COLOR}
            fillOpacity="0.22"
          />
          <line x1={CENTER_X} y1={ORIGIN_Y} x2={xOf(MAX_TIME)} y2={yOf(MAX_TIME)} stroke={FLASH_COLOR} strokeWidth="2.5" />
          <line x1={CENTER_X} y1={ORIGIN_Y} x2={xOf(-MAX_TIME)} y2={yOf(MAX_TIME)} stroke={FLASH_COLOR} strokeWidth="2.5" />
        </g>
      )}

      {/* The key to the drawing, top left. */}
      {playing && (
        <g fontSize="10" fill={TEXT_COLOR}>
          <rect x="12" y="28" width="12" height="3" fill={LAB_LINE_COLOR} />
          <text x="30" y="33">Sky-blue line: the lab's same-moment line</text>
          <rect x="12" y="40" width="12" height="3" fill={OBSERVER_COLOR} />
          <text x="30" y="45">Purple line: the passing observer's same-moment line</text>
          <circle cx="18" cy="54" r="5" fill="#0b1020" stroke={TEXT_COLOR} />
          <text x="30" y="57">Badge 1: met first. Badge 2: met second. Both 1: the same moment.</text>
          {complete && (
            <g>
              <rect x="12" y="64" width="12" height="8" fill={INSIDE_COLOR} fillOpacity="0.6" />
              <text x="30" y="70">Teal: inside the cone, O could cause an event here</text>
              <rect x="12" y="76" width="12" height="8" fill={OUTSIDE_COLOR} fillOpacity="0.6" />
              <text x="30" y="82">Rose: outside the cone, O could not cause an event here</text>
              <rect x="12" y="88" width="12" height="3" fill={FLASH_COLOR} />
              <text x="30" y="93">Yellow: the edge of the cone</text>
            </g>
          )}
        </g>
      )}

      {/* The passing observer, top right, with an arrow for the direction of travel. */}
      <rect x={VIEW_WIDTH - 86} y="34" width="32" height="20" rx="3" fill={OBSERVER_COLOR} />
      {passingSpeed !== 0 && (
        <g>
          <line
            x1={VIEW_WIDTH - 70 + (passingSpeed > 0 ? 22 : -22)}
            y1="44"
            x2={VIEW_WIDTH - 70 + (passingSpeed > 0 ? 36 : -36)}
            y2="44"
            stroke={OBSERVER_COLOR}
            strokeWidth="3"
          />
          <polygon
            points={
              passingSpeed > 0
                ? `${VIEW_WIDTH - 70 + 42},44 ${VIEW_WIDTH - 70 + 34},39 ${VIEW_WIDTH - 70 + 34},49`
                : `${VIEW_WIDTH - 70 - 42},44 ${VIEW_WIDTH - 70 - 34},39 ${VIEW_WIDTH - 70 - 34},49`
            }
            fill={OBSERVER_COLOR}
          />
        </g>
      )}
      <text x={VIEW_WIDTH - 70} y="72" textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Passing observer
      </text>
      <text x={VIEW_WIDTH - 70} y="85" textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
        {passingSpeed === 0 ? 'at rest in the lab' : `${Math.abs(passingSpeed)}c, to the ${passingSpeed > 0 ? 'right' : 'left'}`}
      </text>

      {/* The time axis: the lab's clock at position 0, time going up. */}
      <line x1={CENTER_X} y1={ORIGIN_Y} x2={CENTER_X} y2={yOf(MAX_TIME)} stroke={MUTED_COLOR} strokeWidth="2" />
      {timeMarks.map((m) => (
        <g key={`t${m}`}>
          <line x1={CENTER_X - 5} y1={yOf(m)} x2={CENTER_X + 5} y2={yOf(m)} stroke={TICK_COLOR} strokeWidth="1.5" />
          {m > 0 && (
            <text x={CENTER_X - 9} y={yOf(m) + 4} textAnchor="end" fontSize="10" fill={MUTED_COLOR}>
              {m}
            </text>
          )}
        </g>
      ))}
      <text x={CENTER_X - 9} y={yOf(MAX_TIME) - 8} textAnchor="end" fontSize="10" fill={TEXT_COLOR}>
        Time (seconds)
      </text>

      {/* The position axis: the lab's ruler at time 0, with distances in light-seconds. */}
      <line x1={xOf(-MAX_POSITION)} y1={ORIGIN_Y} x2={xOf(MAX_POSITION)} y2={ORIGIN_Y} stroke={MUTED_COLOR} strokeWidth="2" />
      {positionMarks.map((m) => (
        <g key={`x${m}`}>
          <line x1={xOf(m)} y1={ORIGIN_Y - 5} x2={xOf(m)} y2={ORIGIN_Y + 5} stroke={TICK_COLOR} strokeWidth="1.5" />
          {m !== 0 && (
            <text x={xOf(m)} y={ORIGIN_Y + 18} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
              {m}
            </text>
          )}
        </g>
      ))}
      <text x={CENTER_X} y={VIEW_HEIGHT - 8} textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Position along the lab's ruler (light-seconds; left is negative, right is positive)
      </text>

      {/* The same-moment lines through the two events: the lab's, and the passing observer's (tilted by their speed). */}
      {labLine && (
        <line
          x1={labLine.x1}
          y1={labLine.y1}
          x2={labLine.x2}
          y2={labLine.y2}
          stroke={LAB_LINE_COLOR}
          strokeWidth="2.5"
          strokeDasharray={playing && !complete && fraction >= LAB_SWEEP_END ? '6 4' : undefined}
        />
      )}
      {passingLine && (
        <line x1={passingLine.x1} y1={passingLine.y1} x2={passingLine.x2} y2={passingLine.y2} stroke={OBSERVER_COLOR} strokeWidth="2.5" />
      )}

      {/* Guide lines from event B to the two axes, so its time and distance can be read off. */}
      <line x1={bX} y1={bY} x2={bX} y2={ORIGIN_Y} stroke={EVENT_B_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1={bX} y1={bY} x2={CENTER_X} y2={bY} stroke={EVENT_B_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />

      {/* Event O: here, now. */}
      <rect x={CENTER_X - 7} y={ORIGIN_Y - 7} width="14" height="14" rx="2" fill={EVENT_O_COLOR} />
      <text x={CENTER_X + 12} y={ORIGIN_Y - 10} textAnchor="start" fontSize="11" fill={TEXT_COLOR}>
        O: here, now
      </text>

      {/* Event B: the other event. */}
      <rect x={bX - 7} y={bY - 7} width="14" height="14" rx="2" fill={EVENT_B_COLOR} />
      <text x={bLabelX} y={bY - 24} textAnchor={bAnchor} fontSize="11" fill={TEXT_COLOR} style={HALO}>
        B: the other event
      </text>
      <text x={bLabelX} y={bY - 12} textAnchor={bAnchor} fontSize="10" fill={MUTED_COLOR} style={HALO}>
        {event.time} s later, {Math.abs(event.position)} ls {event.position < 0 ? 'left' : 'right'}
      </text>

      {/* Direct labels on the lines once the run has ended. */}
      {complete && labLine && (
        <text x={labLine.x1 + 4} y={labLine.y1 - 8} textAnchor="start" fontSize="10" fill={LAB_LINE_COLOR} style={HALO}>
          {sameMomentLineSlope === 0 ? 'same-moment line (lab and passing observer)' : "the lab's same-moment line"}
        </text>
      )}
      {complete && passingLine && sameMomentLineSlope !== 0 && (
        // At the lower end of the tilted line, on the free side of it, so it stays off the cone, the time axis and the events.
        <text
          x={passingLine.y1 > passingLine.y2 ? passingLine.x1 + 8 : passingLine.x2 - 8}
          y={Math.max(passingLine.y1, passingLine.y2) + 4}
          textAnchor={passingLine.y1 > passingLine.y2 ? 'start' : 'end'}
          fontSize="10"
          fill={OBSERVER_COLOR}
          style={HALO}
        >
          the passing observer's same-moment line
        </text>
      )}

      {/* Badges: the order in which each observer's line meets the events. Lab badges sit above-left, the passing observer's below-left. */}
      {labMetO && <Badge x={CENTER_X - 16} y={ORIGIN_Y - 16} number={1} color={LAB_LINE_COLOR} />}
      {labMetB && <Badge x={bX - 16} y={bY + 16} number={2} color={LAB_LINE_COLOR} />}
      {passingMetO && <Badge x={CENTER_X - 16} y={ORIGIN_Y + 16} number={passingNumberO} color={OBSERVER_COLOR} />}
      {passingMetB && <Badge x={bX + 16} y={bY + 16} number={passingNumberB} color={OBSERVER_COLOR} />}
    </svg>
  )
}

// Plain names for the cases (as in Experiment 2) and for the order each observer finds.
const RELATION_NAMES: Record<EventRelation, string> = {
  reachable: 'reachable',
  'light-only': 'light only',
  unreachable: 'unreachable',
}
const ORDER_NAMES: Record<EventOrder, string> = {
  'o-first': 'O first',
  'same-moment': 'the same moment',
  'b-first': 'B first',
}

// Two decimals, with a true minus sign for a negative number.
function signed(value: number): string {
  return value.toFixed(2).replace('-', '\u2212')
}

interface ObserverRow {
  name: string
  color: string
  reading: OrderReading
}

const BARS_VIEW_WIDTH = 520
const BARS_VIEW_HEIGHT = 190
const BARS_CENTER_X = 260
const BAR_MAX_LENGTH = 200
const BARS_ROWS_TOP = 56
const BARS_ROW_HEIGHT = 58

// The time each observer found from O to B, as a bar on one scale around a middle line at zero. A bar to the right means B
// was later than O, a bar to the left means B was earlier. The words next to each bar say the same, so colour is not needed.
function ResultsBars({ rows }: { rows: ObserverRow[] }) {
  const longest = Math.max(...rows.map((r) => Math.abs(r.reading.timeBetween)), 1e-9)
  const lengthOf = (value: number) => (Math.abs(value) / longest) * BAR_MAX_LENGTH

  return (
    <svg
      viewBox={`0 0 ${BARS_VIEW_WIDTH} ${BARS_VIEW_HEIGHT}`}
      role="img"
      aria-label={`Bars of the time each observer found from O to B. A bar to the right means B was later than O, and a bar to the left means B was earlier. ${rows
        .map((r) => `${r.name}: ${signed(r.reading.timeBetween)} seconds, ${ORDER_NAMES[r.reading.order]}`)
        .join('. ')}.`}
      style={SVG_STYLE}
    >
      <text x="20" y="22" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Time from O to B, as each observer found it (one scale)
      </text>
      <text x={BARS_CENTER_X - 8} y="44" textAnchor="end" fontSize="10" fill={MUTED_COLOR}>
        {'\u2190 B earlier than O'}
      </text>
      <text x={BARS_CENTER_X + 8} y="44" textAnchor="start" fontSize="10" fill={MUTED_COLOR}>
        {'B later than O \u2192'}
      </text>
      <line
        x1={BARS_CENTER_X}
        y1="48"
        x2={BARS_CENTER_X}
        y2={BARS_VIEW_HEIGHT - 28}
        stroke={TICK_COLOR}
        strokeWidth="1.5"
      />
      {rows.map((row, i) => {
        const y = BARS_ROWS_TOP + i * BARS_ROW_HEIGHT
        const time = row.reading.timeBetween
        const length = lengthOf(time)
        return (
          <g key={row.name}>
            <text x="20" y={y + 10} fontSize="12" fontWeight="bold" fill={row.color}>
              {row.name}
            </text>
            <text x={BARS_VIEW_WIDTH - 20} y={y + 10} textAnchor="end" fontSize="11" fill={TEXT_COLOR}>
              {signed(time)} s: {ORDER_NAMES[row.reading.order]}
            </text>
            {length > 0.5 && (
              <rect
                x={time > 0 ? BARS_CENTER_X : BARS_CENTER_X - length}
                y={y + 18}
                width={length}
                height="16"
                rx="2"
                fill={row.color}
              />
            )}
            {length <= 0.5 && <circle cx={BARS_CENTER_X} cy={y + 26} r="4" fill={row.color} />}
          </g>
        )
      })}
      <text x="20" y={BARS_VIEW_HEIGHT - 10} fontSize="10" fill={MUTED_COLOR}>
        s = seconds. The longest bar here is {longest.toFixed(2)} s. The middle line is zero.
      </text>
    </svg>
  )
}

// The prediction is about the chosen event B, so choosing a different B clears it; the passing observer's speed does not
// change the question and keeps it. Changing the event, the speed or the prediction returns to the idle state, so a run is
// never shown for different settings.
interface CauseBeforeEffectExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function CauseBeforeEffectExperiment({ onComplete, onTutorComplete }: CauseBeforeEffectExperimentProps) {
  const [eventIndex, setEventIndex] = useState(3)
  const [passingSpeed, setPassingSpeed] = useState(0.3)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the runs so the tutor starts again at its first question after each run.
  const [runCount, setRunCount] = useState(0)
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

  // Also checks the chosen setup, so the drawing never shows an impossible one. The results are shown only when the
  // playback has ended; the physics result does not depend on the prediction.
  const result = useMemo(() => runCauseBeforeEffectExperiment(PRESET_EVENTS[eventIndex], passingSpeed), [eventIndex, passingSpeed])
  const observers: ObserverRow[] = [
    { name: 'The lab', color: LAB_LINE_COLOR, reading: result.lab },
    { name: 'The passing observer', color: OBSERVER_COLOR, reading: result.passing },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 3 — Cause Before Effect: Can the Order of Events Change?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Imagine a ball is thrown at a window, and the window breaks. The throw is
            the <strong>cause</strong>, because it makes the breaking happen. The breaking is the{' '}
            <strong>effect</strong>. In everyday life, nobody would ever find that the window broke before the ball
            was thrown. Whoever you ask, the cause comes first, and an effect can never come before the thing that
            caused it. Earlier experiments gave us a reason to look at this more carefully. They showed that "at the
            same time" can depend on who is measuring: two far-apart events can be at the same moment for one
            observer and at different moments for another. If observers can disagree about whether two events are
            simultaneous, a bigger question follows. Can they also disagree about which of the two events came{' '}
            <em>first</em>? And if they can, does that break cause and effect? Could some observer, somewhere, find
            that the window broke before the ball was thrown? This experiment is about finding out when the order of
            two events can change, and when it cannot.
          </p>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some words we will use.</strong> Five words matter in this experiment. Here is each one in plain
              language.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Event:</strong> something that happens at one place at one moment, such as a flash of light
                or a window breaking. It is a point in space and time.
              </li>
              <li>
                <strong>Light cone:</strong> the set of events that a flash of light from a given event could reach.
                Think of the ripples from a stone dropped in a pond. They spread outward at a fixed speed, and they
                can only touch places the ripple has had time to reach. Light plays the part of the ripple, and
                nothing can travel faster than it.
              </li>
              <li>
                <strong>Cause:</strong> in this experiment, one event can be the cause of another only if something
                starting at the first event could reach the second without going faster than light. That is the test
                from the last experiment: the second event must lie inside, or on the edge of, the first event's
                light cone. If the second event is outside the cone, the first one could not have caused it, because
                nothing could get there in time.
              </li>
              <li>
                <strong>An observer "finds" the order of two events:</strong> this means the order worked out from
                their own ruler and their own synchronized clocks, after allowing for the time light takes to reach
                them. It does not mean the order in which the light first arrives at their eyes. For example, if an
                event happens 3 light-seconds away, its light reaches you 3 seconds later. A careful observer
                subtracts those 3 seconds and finds when it really happened.
              </li>
              <li>
                <strong>Same-moment line:</strong> on the diagram of space and time, the line through all the events
                that an observer finds happening at the same moment as event O. For the lab, that line is level. For
                an observer who moves, it is tilted, as you saw in "Same Time, Different Line".
              </li>
            </ul>
          </div>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> There are two events. Event O is "here, now": something happening at your
            place in the lab at time 0. Event B is a second event, which happens a few seconds later by the lab's
            clock and some distance away. You choose which B to use from five choices. There are also two
            observers. The first is the lab itself, which is at rest. The second is a passing observer who moves
            past the lab in a straight line at a speed you choose, to the right or to the left. Each observer has
            their own ruler and their own synchronized clocks, so each one measures the times and distances of O and B
            in their own way. First you predict whether any observer could find B before O. Then you press Run. The
            diagram shows a sweeping line for each observer, the lab's and the passing observer's. Each line climbs
            upward through the diagram and touches O and B one after the other. The event a line touches first is the
            event that observer finds came first. At the end you can see whether the two observers found the same
            order.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Working out a possible cause.</strong> You can already test whether O could be the cause of B,
            using one idea: <em>could something starting at O have reached B in the time available, without going
            faster than light?</em> If yes, O could be the cause. If no, it could not. An everyday version: you leave
            home at noon, and a friend 20 kilometers away is called at 12:30. Walking at 5 kilometers per hour, you
            cover only 2.5 kilometers in half an hour, so you could not be the one who reached them in time. Now the
            same test with light, using an example that is not one of the choices below: event B happens 4 seconds
            after O, and 1 light-second away. A <strong>light-second</strong> is the distance light travels in one
            second. Step 1: in 4 seconds, light covers 4 light-seconds. Step 2: B is only 1 light-second away.
            Step 3: 1 is less than 4, so a flash from O would arrive long before B happens. Something starting at O
            could easily reach B, so O could be the cause of B. The rule to use on the choices below: compare the
            distance to B with the time until B. If the distance is no bigger than the time, B is inside, or on the
            edge of, O's light cone.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> There are three things to do, in this order. First, choose event B from the
            five choices. Second, choose the passing observer's speed. Third, make your prediction: could <em>any</em>{' '}
            observer, moving at any speed below the speed of light, find that B happened <em>before</em> O? You are
            not graded, and a guess is fine. The Run button stays switched off until you have chosen a prediction.
            Then press Run and watch what the two observers find. Try other choices of B and other speeds afterwards
            to see how the picture changes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What we assume.</strong> To keep the idea clear, we simplify the situation in four ways. (1) There
            is no gravity, so space is flat and light travels in straight lines. (2) Every speed stays steady: nobody
            speeds up, slows down or turns. (3) Everything moves along one straight line, to the right or to the left,
            so we only need one distance for each event. (4) Nothing can travel faster than light. Speeds are given as
            a fraction of <strong>c</strong>, the speed of light. For example, 0.6c means 60 percent of the speed of
            light, and 1c is the speed of light itself.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Event B</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            Each choice says when B happens after O in the lab, and how far from O it is. These are the same five
            events as in the last experiment.
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {PRESET_EVENTS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setEventIndex(i)
                  setPrediction(null)
                  returnToIdle()
                }}
                className={`toggle-button${eventIndex === i ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {eventLabel(i)}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Passing observer's speed
          </label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            Measured from the lab. A positive speed is to the right in the drawing; a negative speed is to the left.
          </p>
          <div>
            {PASSING_SPEED_PRESETS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => {
                  setPassingSpeed(speed)
                  returnToIdle()
                }}
                className={`toggle-button${passingSpeed === speed ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {speed === 0 ? '0c (at rest in the lab)' : `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            In the lab, event O happens first, and event B happens {eventLabel(eventIndex)}. Observers who move at
            different speeds measure different times and distances. Could some observer, moving at some speed below
            the speed of light, find that B happened <em>before</em> O?
          </p>
          <div>
            {PREDICTION_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => {
                  setPrediction(choice.value)
                  returnToIdle()
                }}
                className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            {prediction !== null
              ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.replace(/^(Yes|No|An)/, (w) => w.toLowerCase())}.`
              : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={() => {
            setProgress(0)
            setRunCount((n) => n + 1)
            setStatus('running')
          }}
          disabled={prediction === null || status === 'running'}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {prediction === null && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>
            Choose a prediction above to run the experiment.
          </p>
        )}

        <div style={{ marginTop: '2rem' }}>
          <Diagram eventIndex={eventIndex} passingSpeed={passingSpeed} progress={status === 'idle' ? null : progress} />
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>How to read this diagram.</strong> This is a map of space and time together, drawn from the
              lab's point of view. Every point on it is an event: a place and a moment. Two directions matter.
              Sideways is <strong>place</strong>: left or right of the lab, measured in light-seconds. Upward is{' '}
              <strong>time</strong>: the higher a point is, the later it happens by the lab's clock. So an event
              that is high and far to the right happens late and far away, and an event on the middle line happens
              at the lab's own place. A good comparison is a timetable drawn as a picture, with the stops along the
              bottom and the hours going up the side. The list below says what each part of the drawing is.
            </p>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>What is really happening in the animation.</strong> Think of each sweeping line as a
              "now-line". For one observer, it passes through every event that happens at the same moment by that
              observer's own clocks. The line then climbs, and as it climbs, that observer's "now" moves later and
              later. This is like a scanner bar moving down a page: whatever the bar is over at one instant is "now",
              and the bar reaches different parts of the page one after another. So when the line touches an event,
              that is the moment the observer's "now" reaches that event. The event touched first is the event that
              observer finds came first, and the event touched second is the one they find came second. If a line
              touches both at once, that observer finds them at the same moment. Nothing is travelling along the
              line, and no light is being sent. The line is just a way of reading off which events each observer's
              own clocks and ruler say are happening together, and in what order. The experiment runs the same
              sweep twice, once for the lab and once for the passing observer, so that you can compare what the two
              of them find.
            </p>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>Why two lines?</strong> Because two observers can have different "nows". The lab is at rest,
              so its "now-line" is level: every event at the same height has the same time by the lab's clock. The
              passing observer is moving, and as you saw in "Same Time, Different Line", a moving observer does not
              agree with the lab about which far-away events happen at the same moment. On the diagram, that shows up
              as a tilt. A passing observer moving to the right has a line that rises toward the right, and one moving
              to the left has a line that rises toward the left. The faster they move, the steeper the tilt, and
              at 0c, when they are at rest in the lab, the two lines are the same. An everyday comparison: two people
              looking at the same mountain range from different spots disagree about which peak looks "in front".
              Neither is wrong, because each is describing the same mountains from their own position. In the same
              way, the lab and the passing observer describe the same two events from their own motion, and the
              diagram lets you compare what they say.
            </p>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>A worked example</strong> (using numbers that are not among the choices). Suppose B happens 6
              seconds after O in the lab, 2 light-seconds to the right, and the passing observer moves to the right at
              0.5c. Here is how to read the diagram for this case.
            </p>
            <ol style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The lab's line.</strong> It is level. O is at height 0 and B is at height 6, so the lab's line
                touches O first and B second. The lab finds O first.
              </li>
              <li>
                <strong>The tilt of the passing observer's line.</strong> At 0.5c, it rises 0.5 seconds for every
                light-second to the right.
              </li>
              <li>
                <strong>Where that line is at B's place.</strong> B is 2 light-seconds to the right, so the line
                through O is at 0.5 × 2 = 1 second high there.
              </li>
              <li>
                <strong>Compare it with B.</strong> B is at 6 seconds, which is above 1 second. So B is above the
                passing observer's line through O. Above means later, so this observer also finds O first and B
                second.
              </li>
            </ol>
            <p style={{ margin: '0 0 0.5rem' }}>
              Both observers agree on the order here. Now try the choices in the experiment, and compare the tilted
              line with B's position each time.
            </p>
            <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The horizontal grey line (the lab's ruler).</strong> It shows place, at time 0. The numbers
                along it are distances from the middle in light-seconds. A mark that says 2 is 2 light-seconds from
                the middle, which is about 600,000 kilometers. Marks to the left of the middle are negative, which
                means "to the left".
              </li>
              <li>
                <strong>The vertical grey line (the lab itself).</strong> It shows time. The lab stays in the middle
                of the ruler as time goes by, so the lab's own clock runs up this line. Its numbers are seconds on
                the lab's clock.
              </li>
              <li>
                <strong style={{ color: EVENT_O_COLOR }}>Blue square, O.</strong> This is "here, now": the lab's
                own place, at time 0. It sits where the two grey lines cross.
              </li>
              <li>
                <strong style={{ color: EVENT_B_COLOR }}>Orange square, B.</strong> This is the other event. How far
                to the side it is shows how far away it happens. How high it is shows when it happens by the lab's
                clock. The dashed orange lines help you read both numbers: one goes down to the ruler, and one goes
                across to the lab's clock line.
              </li>
              <li>
                <strong style={{ color: OBSERVER_COLOR }}>Purple square, the passing observer.</strong> It is in the
                top right corner, with its label. It is not on the diagram's grid, because it only tells you who the
                second observer is. An arrow shows which way they move relative to the lab. No arrow means they are
                at rest in the lab. It stays still in the drawing.
              </li>
              <li>
                <strong style={{ color: LAB_LINE_COLOR }}>Sky-blue line, the lab's same-moment line.</strong> It
                appears when you press Run. It is level, because all events at the same height happen at the same
                moment by the lab's clock. It sweeps up first. Each time it touches O or B, a small numbered
                sky-blue badge appears beside that square. Then it turns dashed and waits while the next line sweeps.
              </li>
              <li>
                <strong style={{ color: OBSERVER_COLOR }}>Purple line, the passing observer's same-moment line.</strong>{' '}
                It sweeps up after the sky-blue one. It is tilted, because the passing observer moves, and it gets
                purple badges beside the squares. The numbers on the badges say the order in which that observer's
                line touched them: 1 means touched first, and 2 means touched second. If both badges say 1, the line
                touched both at the same moment.
              </li>
              <li>
                <strong>The colored regions and the yellow lines.</strong> They appear when the run ends, and both
                lines then rest on O. The yellow lines are the edges of O's light cone from the last experiment.{' '}
                <strong style={{ color: INSIDE_COLOR }}>Teal</strong> is inside the cone: for an event here, O could
                be the cause. <strong style={{ color: OUTSIDE_COLOR }}>Rose</strong> is outside the cone: for an
                event here, O could not be the cause. The key at the top left of the drawing repeats this.
              </li>
            </ul>
            <p style={{ margin: 0 }}>
              <strong>What to look for.</strong> Follow these steps.
            </p>
            <ol style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>Before you run:</strong> choose an event B and watch where the orange square lands. Ask
                yourself whether O could be the cause of B. To check, compare how far away B is with how much time
                passes before B happens, using the fact that light covers 1 light-second each second.
              </li>
              <li>
                <strong>While it runs:</strong> watch the sky-blue line (the lab's) and the purple line (the passing
                observer's) climb. For each line, notice which square it touches first, O or B. Is it the same square
                for both lines?
              </li>
              <li>
                <strong>When it ends:</strong> look at which colored region B is in, teal or rose. Then look at which
                side of each line B is on. Above a line means B is later than O for that observer. Below it means B
                is earlier than O for that observer.
              </li>
              <li>
                <strong>Then try again:</strong> pick a different B or a different speed, and see what changes and
                what stays the same. Each observer's numbers appear in the results, below the drawing.
              </li>
            </ol>
          </div>
        </div>
        {/* Results: draft wording for the owner's review (CLAUDE.md §28.1). Values only; the explanation comes from the tutor (§12). */}
        {status === 'complete' && prediction !== null && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>What you ran.</strong> Event B happened {eventLabel(eventIndex)} by the lab's clock, and the
              passing observer was {passingLabel(passingSpeed).toLowerCase()}. Both observers measured the same two
              events, O and B, each with their own ruler and clocks. <strong>Your prediction was:</strong>{' '}
              {PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.replace(/^(Yes|No|An)/, (w) => w.toLowerCase())}.
              It is only recorded here, not marked right or wrong.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>The table.</strong> Each observer has one row. The first row is the lab. The second row is the
              passing observer.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {[
                      'Observer',
                      'Time from O to B (seconds)',
                      'Distance between O and B (light-seconds)',
                      'time² − distance²',
                      'Could O cause B?',
                      'Which event came first',
                    ].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {observers.map((o) => (
                    <tr key={o.name}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{o.name}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{signed(o.reading.timeBetween)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{Math.abs(o.reading.distanceBetween).toFixed(2)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{signed(o.reading.intervalSquared)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{RELATION_NAMES[o.reading.relation]}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{ORDER_NAMES[o.reading.order]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What each column means.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Time from O to B:</strong> how much time that observer found between the two events. A plus
                  number means B happened after O. A number with a minus sign means B happened <em>before</em> O for
                  that observer. For example, 5.00 means B was 5 seconds after O, and {'\u2212'}2.00 means B was 2
                  seconds before O.
                </li>
                <li>
                  <strong>Distance between O and B:</strong> how far apart that observer found the two events.
                </li>
                <li>
                  <strong>time² − distance²:</strong> the time multiplied by itself, minus the distance multiplied by
                  itself. For example, a time of 3 and a distance of 2 give 3 × 3 − 2 × 2 = 9 − 4 = 5. A positive number
                  or zero means B is inside or on the edge of O's light cone. A negative number means B is outside it.
                </li>
                <li>
                  <strong>Could O cause B?</strong> "reachable" means B is inside O's light cone, so something slower
                  than light could get from O to B. "light only" means B is on the edge of the cone, so only light could
                  get there. "unreachable" means B is outside the cone, so nothing could get from O to B in time.
                </li>
                <li>
                  <strong>Which event came first:</strong> "O first", "B first", or "the same moment", according to
                  that observer's own clocks.
                </li>
              </ul>
            </div>

            <ResultsBars rows={observers} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>How to read this drawing.</strong> The drawing shows only the "Time from O to B" column of the
                table, as bars, so you can see at a glance which way each observer's time points. The top bar is the
                lab and the bottom bar is the passing observer, in the same order as the table.
              </p>
              <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The line in the middle is zero:</strong> no time between O and B. Every bar starts on it.
                </li>
                <li>
                  <strong>A bar that goes to the right</strong> means B happened <em>after</em> O for that observer.{' '}
                  <strong>A bar that goes to the left</strong> means B happened <em>before</em> O for that observer. The
                  labels above the bars say the same.
                </li>
                <li>
                  <strong>The length of a bar</strong> is how many seconds that observer found between O and B. Both
                  bars use the same scale, so you can compare their lengths directly. The longest bar is named at the
                  bottom. If a row shows a dot instead of a bar, that observer found the two events at the same
                  moment.
                </li>
                <li>
                  <strong>The words at the right of each row</strong> give the same result in words: the time in
                  seconds, and which event came first for that observer.
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>What to look for.</strong> First, compare the two bars. Do they point the same way? Second, look
                at the "Could O cause B?" column and the "time² − distance²" column for both rows. Are those the same
                for both observers? Then pick a different event B or a different passing speed, run it again, and
                watch which numbers change and which stay the same.
              </p>
            </div>
          </div>
        )}
      </div>

      {status === 'complete' && prediction !== null && (
        <CauseBeforeEffectTutor
          key={runCount}
          event={PRESET_EVENTS[eventIndex]}
          passingSpeed={passingSpeed}
          predicted={prediction}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
