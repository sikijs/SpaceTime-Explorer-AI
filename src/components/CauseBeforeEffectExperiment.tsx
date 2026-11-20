import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { PRESET_EVENTS } from '../physics/lightCones'
import type { EventRelation } from '../physics/lightCones'
import { checkUpRows, orderFromStrip, orderStripForEvent, runCauseBeforeEffectExperiment } from '../physics/causeBeforeEffect'
import { CauseBeforeEffectTutor } from './CauseBeforeEffectTutor'
import type { EventOrder, OrderReading, PredictionAnswer } from '../physics/causeBeforeEffect'
import { ChainFigure, SameMomentFigure, ScrambledFigure, SeeingFigure, SpeedStrip } from './CauseBeforeEffectFigures'
import { ConeFigure } from './LightConesFigures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Steps 2 to 7 (basic interface, prediction, run gate, playback, results, tutor) of docs/experiments/spacetime-geometry/03-cause-before-effect.md:
// introduction, controls, the prediction, the Run button, the diagram with its caption and playback, and the results.
// Step 7 adds the tutor, which is shown below the card once the results are.
// Presets are the defaults of Decisions 2 and 3 of that specification.
const PASSING_SPEED_PRESETS = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]

// Spacetime Geometry, Experiment 3, audited to the newer rules (docs/audit/spacetime-geometry/03-draft-wording.md): the page in four
// Parts, Part 1 fixed on event B = 3 s and 5 ls (outside the cone) with a +0.3c passing observer, a strip of observer speeds with a
// white YOUR GUESS ring, a check-up table, links, a words box, Start over and a tutor that marks the guess. Every number drawn comes
// from the physics module (src/physics/causeBeforeEffect.ts; CLAUDE.md §9). The wording is the owner's to approve (CLAUDE.md §28.1).
const PART1_EVENT_INDEX = 3
const PART1_PASSING_SPEED = 0.3
const PART2_DEFAULT_EVENT_INDEX = 4
const PART2_DEFAULT_PASSING_SPEED = -0.6
const PART2_COLOR = '#be185d'
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)

type Prediction = PredictionAnswer

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
  // True for the Part 2 drawing: framed in the Part 2 colour.
  yours?: boolean
}

// While idle it draws only the setup: the lab's two axes, event O and event B, and the passing observer. It deliberately draws
// no same-moment lines and no light cone then: which side of each line B falls on is the answer to the prediction (§12).
// While the run plays, the lab's same-moment line sweeps up through the two events, then the passing observer's tilted line
// does, and a numbered badge marks each event in the order that observer meets it. When the run ends, the lines through O and
// the light cone are drawn together.
export function Diagram({ eventIndex, passingSpeed, progress, yours = false }: DiagramProps) {
  const { event, lab, passing, sameMomentLineSlope } = runCauseBeforeEffectExperiment(PRESET_EVENTS[eventIndex], passingSpeed)
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
      style={{ ...SVG_STYLE, border: yours ? `3px solid ${PART2_COLOR}` : SVG_STYLE.border }}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={yours ? PART2_COLOR : TEXT_COLOR}>
        {yours ? 'Your event: ' : ''}Space and time, from the lab's point of view
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
      {/* Each observer's own clock reading at B, measured from O, from the physics module. It appears with that observer's badge on B. */}
      {labMetB && (
        <text x={bX} y={bY + 38} textAnchor="middle" fontSize="10" fontWeight="bold" fill={LAB_LINE_COLOR} style={HALO}>
          lab clock: {signed(lab.timeBetween)} s
        </text>
      )}
      {passingMetB && (
        <text x={bX} y={bY + 50} textAnchor="middle" fontSize="10" fontWeight="bold" fill={OBSERVER_COLOR} style={HALO}>
          passing clock: {signed(passing.timeBetween)} s
        </text>
      )}
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
export function ResultsBars({ rows }: { rows: ObserverRow[] }) {
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

// ---- Pages read on 20 November 2026 (draft wording, section 10). No plain page from NASA, ESA, CERN or Fermilab was found (§29 rule 3(c)). ----
const LINKS = [
  {
    href: 'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/Special_relativity_rel_sim/index.html',
    label: 'John D. Norton, "Relativity of Simultaneity", University of Pittsburgh course "Einstein for Everyone"',
    what: 'light-signal thought experiments showing that observers in relative motion disagree about whether distant events are simultaneous, and that this is not just the light taking time to reach them.',
  },
  {
    href: 'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/spacetime/index.html',
    label: 'John D. Norton, "Spacetime", University of Pittsburgh',
    what: 'how drawings of space and time are built, with animations; light cones, and which events can be causally connected and which cannot if nothing goes faster than light.',
  },
  {
    href: 'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/spacetime_rel_sim/',
    label: 'John D. Norton, "Spacetime and the Relativity of Simultaneity", University of Pittsburgh',
    what: 'how different observers cut one spacetime into different sets of same-moment events: the idea behind the tilted line of Figure E.',
  },
  {
    href: 'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/spacetime_tachyon/index.html',
    label: 'John D. Norton, "Spacetime, Tachyons, Twins and Clocks", University of Pittsburgh',
    what: 'a thought experiment about imagined particles that go faster than light, where some observers find an effect before its cause. Such particles are only an idea: none has ever been observed.',
  },
  {
    href: 'https://www.einstein-online.info/en/spacetime/',
    label: 'Einstein Online, "Spacetime", Max Planck Institute for Gravitational Physics',
    what: 'a plain article on how observers disagree about simultaneity but agree on which events can influence which, with light cones and the speed of light as the limit.',
  },
  {
    href: 'https://en.wikisource.org/wiki/Translation:Space_and_Time',
    label: 'Hermann Minkowski, "Space and Time" (1908), English translation as edited on Wikisource',
    what: 'the original lecture that introduced spacetime and the light cone. It is technical, not plain language.',
  },
  {
    href: 'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/origins_pathway/On-the_electrodynamics/index.html',
    label: 'Albert Einstein, "On the Electrodynamics of Moving Bodies" (1905), Introduction and Sections 1 and 2, on the University of Pittsburgh course site',
    what: 'Section 1 is where Einstein defines what "simultaneous" means for far-apart events, using light signals. Dated language, and only the first sections.',
  },
]

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const
const captionStyle = { fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' } as const
const two = (value: number) => Math.abs(value).toFixed(2)

function Block({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: '1rem' }}>{children}</div>
}

function WhereFrom({ children }: { children: ReactNode }) {
  return (
    <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
      <strong>Where the real picture comes from.</strong> {children}
    </p>
  )
}

function GuessTag() {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: GUESS_COLOR,
        backgroundColor: '#0b1020',
        border: `1px solid ${GUESS_COLOR}`,
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      your guess
    </span>
  )
}

function FigureCaption({ children }: { children: ReactNode }) {
  return <div style={{ ...captionStyle, marginBottom: '1rem' }}>{children}</div>
}

// The "Words and formulas" box. The case names, the order names and the flip speed show the answer to the prediction, so they appear
// only after the Part 1 run has finished (CLAUDE.md §12). Their numbers come from the physics module (CLAUDE.md §9).
export function referenceEntries(done: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Event', meaning: 'something that happens at one place at one moment, such as a flash of light or a firecracker going off.' },
    {
      term: 'Cause and effect',
      meaning:
        'in this experiment, one event can be the cause of another only if something starting at the first could reach the second without going faster than light.',
    },
    { term: 'Observer', meaning: 'someone with their own ruler and synchronized clocks who measures when and where events happen. The lab is one; the passing observer is another.' },
    { term: 'Sees and finds', meaning: '"Sees" is when light reaches your eyes. "Finds" is what you work out after taking away the time the light took to arrive (Figure C).' },
    { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 kilometers.' },
    { term: 'c', meaning: 'the speed of light. 0.6c is 60 percent of that speed.' },
    { term: 'Light cone', meaning: 'all the events a flash of light from one event could reach (Figure D). Its two yellow edges are the paths of the flash going right and going left.' },
    { term: 'Same-moment line', meaning: 'on a drawing of space and time, the line through all the events an observer finds at the same moment as O. Level for the lab, tilted for a moving observer (Figure E).' },
    {
      term: 'Time between',
      meaning:
        'how much time one observer finds from O to B. Positive means B is later than O; negative means B is earlier. For an observer moving at u (a fraction of c) it is γ × (t − u × x), where t and x are the lab’s time and distance and γ = 1 ÷ √(1 − u²). Example, t = 3 s, x = 5 ls, u = 0.3: γ = 1 ÷ √(1 − 0.09) = 1.05, and 3 − 0.3 × 5 = 1.5, so 1.05 × 1.5 = 1.57 seconds.',
    },
    { term: 'Distance between', meaning: 'how far apart in space one observer finds O and B.' },
  ]
  if (done) {
    const r = runCauseBeforeEffectExperiment(PRESET_EVENTS[PART1_EVENT_INDEX], PART1_PASSING_SPEED)
    entries.push(
      {
        term: 'time² − distance²',
        meaning: `multiply the time by itself, multiply the distance by itself, subtract. For the lab, ${two(r.lab.timeBetween)} s and ${two(r.lab.distanceBetween)} ls: ${two(r.lab.timeBetween)} × ${two(r.lab.timeBetween)} − ${two(r.lab.distanceBetween)} × ${two(r.lab.distanceBetween)} = ${(r.lab.timeBetween ** 2).toFixed(2)} − ${(r.lab.distanceBetween ** 2).toFixed(2)} = ${signed(r.lab.intervalSquared)}.`,
      },
      { term: 'Reachable, light only, unreachable', meaning: 'the three cases, named in the results table: B inside the light cone, on its edge, or outside it.' },
      { term: 'Order', meaning: '“O first”, “the same moment” or “B first”: which of the two events an observer finds happened first.' },
      {
        term: 'The flip speed',
        meaning: `the speed at which an observer finds O and B at the same moment: t ÷ x. For B at ${r.event.time} s and ${r.event.position} ls, ${r.event.time} ÷ ${r.event.position} = ${two(r.simultaneitySpeed ?? 0)}c. Beyond it the order changes.`,
      },
    )
  }
  return entries
}

// ---- Captions ----

function lookFor(items: { look: string; means: ReactNode; matters: ReactNode }[]) {
  return <LookForList items={items} />
}

export function DiagramCaption({ complete, part2, result }: { complete: boolean; part2: boolean; result: ReturnType<typeof runCauseBeforeEffectExperiment> }) {
  const { lab, passing } = result
  const passingNumberO = passing.order === 'b-first' ? 2 : 1
  const passingNumberB = passing.order === 'o-first' ? 2 : 1
  const relationWord = lab.relation === 'reachable' ? 'inside the cone (teal)' : lab.relation === 'light-only' ? 'on the edge of the cone (yellow)' : 'outside the cone (rose)'
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this diagram.</strong> This is a map of space and time together, drawn from the lab&rsquo;s point of view. Every point on it is an event: a
        place and a moment. Sideways is <strong>place</strong>: left or right of the lab, measured in light-seconds. Upward is <strong>time</strong>: the higher a
        point is, the later it happens by the lab&rsquo;s clock. A good comparison is a timetable drawn as a picture, with the stops along the bottom and the hours
        going up the side. The list below says what each part of the drawing is.
      </p>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What is really happening in the animation.</strong> Nothing is flying across the picture. No light is being sent and no object is moving. The two
        sweeping lines are a way of asking one question about each observer: <em>which events does this observer say happen at the same moment?</em> Here it is,
        one step at a time.
      </p>
      <ol style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>First, what &ldquo;now&rdquo; means.</strong> Look at your watch. It says 3:00 in the afternoon. Everything that happens while your watch says 3:00
          is happening &ldquo;now&rdquo; for you. If a friend in another town has a watch set to match yours, then what happens there while their watch says 3:00 is
          &ldquo;now&rdquo; for you as well. An observer in this experiment is just like that: someone with a ruler and a set of matching clocks, spread out
          through space, who counts events as happening at the same moment when their clocks show the same time.
        </li>
        <li>
          <strong>Next, why that is a line on the map.</strong> The map has place going sideways and time going up. All the events that an observer&rsquo;s clocks
          mark as, say, 3:00 sit at the same height. Joined together, they form one line. That is the observer&rsquo;s <strong>now-line</strong>. It is a line of
          &ldquo;all the events that are happening now, wherever they are.&rdquo;
        </li>
        <li>
          <strong>Then, why the line climbs.</strong> One second later the observer&rsquo;s clocks say 3:00 and 1 second, and the now-line is one step higher. A
          minute later it is higher again. So as time passes, the now-line rises up the map. A photocopier is a good picture of it: a bar of light slides along the
          page, and whatever the bar is over at that instant is the part being copied. The sweeping line is that bar, and the map is the page.
        </li>
        <li>
          <strong>Now, how the line tells us the order.</strong> As the line rises, it touches the squares one after the other. The moment it touches a square is the
          moment that observer&rsquo;s &ldquo;now&rdquo; reaches that event. So <strong>the square touched first is the event this observer says happened first</strong>.
          If the line touches both squares at the same instant, this observer says they happened at the same moment. Example with this run&rsquo;s own numbers: O is at
          time 0, and B is at {two(lab.timeBetween)} seconds on the lab&rsquo;s clock. The lab&rsquo;s now-line rises from below, reaches O&rsquo;s height first, and
          reaches B&rsquo;s height only {two(lab.timeBetween)} seconds of the lab&rsquo;s time later. That is what &ldquo;B is later by the lab&rsquo;s clock&rdquo;
          looks like on the map.
        </li>
        <li>
          <strong>A puzzle to clear up: both lines touch the orange square at the same height.</strong> Look at the scale up the side of the map. It shows the
          <em> lab&rsquo;s</em> clock only. The orange square B is one fixed point on this map, so it sits at one height on that scale: {two(lab.timeBetween)} seconds.
          Any line that touches B must touch it at that height. That is why the sky-blue line and the purple line both meet B at the {two(lab.timeBetween)}-second
          mark. It does <strong>not</strong> mean that the passing observer&rsquo;s clock says {two(lab.timeBetween)} seconds when their line reaches B. The passing
          observer does not use the lab&rsquo;s clocks. They use their own, and the scale on the side does not show those. So there are two different things to
          keep apart: <strong>where</strong> a line touches B on the map (the same place for both, because B is one point), and <strong>what that observer&rsquo;s own
          clock reads</strong> at that moment (which can be a different number for each observer). The second one is the number the experiment is really about, and
          it is shown on the diagram, beside each observer&rsquo;s badge on B, as soon as that observer&rsquo;s line has reached B. It is also given in the
          &ldquo;worked moment&rdquo; paragraph under the diagram and in the results table once the run has ended.
        </li>
        <li>
          <strong>Why there are two lines.</strong> The experiment asks whether two different observers agree about the order. So the animation runs the same
          sweep twice. The sky-blue line is the lab&rsquo;s now-line. The purple line is the passing observer&rsquo;s now-line. Each has its own clocks, so each has its
          own line. Watch which square each line touches first, and compare. (You do not need to understand yet why the purple line is tilted. That is for the tutor
          to explain after you have made your prediction and watched.)
        </li>
        <li>
          <strong>Last, the numbered badges.</strong> When a line touches O or B, a small badge with a number appears beside that square. &ldquo;1&rdquo; means that
          this observer found it first. &ldquo;2&rdquo; means second. If both squares get a &ldquo;1&rdquo; from the same line, that observer found them at the same
          moment. The badges are a record of the order, so that you can look back at them once the sweep is over. When a line reaches B, a short label also appears
          under B, in that line&rsquo;s colour: &ldquo;lab clock&rdquo; or &ldquo;passing clock&rdquo;, followed by a number of seconds. That number is what that
          observer&rsquo;s <em>own</em> clock reads at B, counted from O. It is the number that the puzzle step, &ldquo;both lines touch the orange square at the same height&rdquo;, is about.
        </li>
      </ol>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The horizontal grey line (the lab&rsquo;s ruler).</strong> It shows place, at time 0. A mark that says 2 is 2 light-seconds, about 600,000 kilometers,
          from the middle. Marks to the left are negative.
        </li>
        <li>
          <strong>The vertical grey line (the lab itself).</strong> The lab stays in the middle of the ruler, so the lab&rsquo;s own clock runs up this line. Its numbers
          are seconds on the lab&rsquo;s clock.
        </li>
        <li>
          <strong style={{ color: '#3b82f6' }}>Blue square, O.</strong> &ldquo;Here, now&rdquo;: the lab&rsquo;s own place, at time 0.
        </li>
        <li>
          <strong style={{ color: '#f59e0b' }}>Orange square, B.</strong> The other event. Its height is when it happens by the lab&rsquo;s clock, and its place along the
          ruler is how far away it is. The dashed orange lines show both numbers.
        </li>
        <li>
          <strong style={{ color: '#8b5cf6' }}>Purple square, the passing observer.</strong> Shown at the top right. The arrow shows which way they move relative to the
          lab, and its length follows their speed: a longer arrow means a faster observer. No arrow means they are at rest in the lab. They are only shown, not moved.
        </li>
        <li>
          <strong style={{ color: '#38bdf8' }}>Sky-blue line, the lab&rsquo;s same-moment line.</strong> It appears when you press Run, and it is level. It sweeps up first.
          Each time it touches O or B, a small numbered sky-blue badge appears beside that square. When it reaches B, a sky-blue label under B, &ldquo;lab clock&rdquo;,
          gives the lab&rsquo;s own clock reading at B, counted from O. Then it turns dashed and waits while the next line sweeps.
        </li>
        <li>
          <strong style={{ color: '#8b5cf6' }}>Purple line, the passing observer&rsquo;s same-moment line.</strong> It sweeps up after the sky-blue one and is tilted,
          because the passing observer moves. It gets purple badges. A badge says the order in which that line touched the squares: 1 means touched first, 2 means
          touched second. If both say 1, the line touched both at once. When this line reaches B, a purple label under B, &ldquo;passing clock&rdquo;, gives the
          passing observer&rsquo;s own clock reading at B, counted from O.
        </li>
        {complete && (
          <li>
            <strong>The coloured regions and the yellow lines.</strong> They appear when the run ends, and both lines then rest on O. The yellow lines are the edges of
            O&rsquo;s light cone. <strong style={{ color: '#14b8a6' }}>Teal</strong> is inside the cone: for an event here, O could be the cause.{' '}
            <strong style={{ color: '#fb7185' }}>Rose</strong> is outside it: for an event here, O could not be the cause. The key at the top left repeats this.
          </li>
        )}
      </ul>
      {complete ? (
        <>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>A worked moment.</strong> {part2 ? 'In your run' : 'In the Part 1 run'}, B is {two(lab.timeBetween)} seconds after O and {two(lab.distanceBetween)}{' '}
            light-seconds away in the lab. The passing observer, at {result.passingObserverSpeed > 0 ? '+' : result.passingObserverSpeed < 0 ? '−' : ''}
            {Math.abs(result.passingObserverSpeed)}c, finds {signed(passing.timeBetween)} seconds and {two(passing.distanceBetween)} light-seconds. Both numbers differ from
            the lab&rsquo;s, so the two lines are placed differently.
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>Why both lines meet B at the same mark.</strong> Both lines touch the orange square at the {two(lab.timeBetween)}-second mark of the side scale,
            because B is one point on the map and that scale is the lab&rsquo;s clock. But the two observers do not read the same clock. When the lab&rsquo;s line
            reaches B, the lab&rsquo;s own clock reads {two(lab.timeBetween)} seconds after O. When the passing observer&rsquo;s line reaches B, the passing
            observer&rsquo;s own clock reads {signed(passing.timeBetween)} seconds after O. The line meets B at the same place on the map, but each observer&rsquo;s
            clock gives a different time.
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>What to look for.</strong>
          </p>
          {lookFor([
            {
              look: 'the numbered badges on O and on B, sky-blue for the lab and purple for the passing observer',
              means: (
                <>
                  the lab&rsquo;s badges read 1 on O and 2 on B; the passing observer&rsquo;s read {passingNumberO} on O and {passingNumberB} on B
                  {passing.order === 'same-moment' ? ' (both 1: the same moment)' : ''}
                </>
              ),
              matters: 'each badge says which event that observer found first, which is the thing the question asks about',
            },
            {
              look: 'which region B sits in now that the run has ended',
              means: <>B is {relationWord}</>,
              matters:
                'the cone is the test of whether something could have gone from O to B; what it says about the order two observers find is left to the tutor',
            },
          ])}
        </>
      ) : (
        <p style={{ margin: 0 }}>
          A worked moment and what to look for appear here once the run has ended, so that they do not give anything away before you have made your prediction.
        </p>
      )}
    </div>
  )
}

export function StripCaption({ result, part2, guess }: { result: ReturnType<typeof runCauseBeforeEffectExperiment>; part2: boolean; guess: Prediction | null }) {
  const strip = orderStripForEvent(result.event)
  const u = result.passingObserverSpeed
  const uText = `${u > 0 ? '+' : u < 0 ? '−' : ''}${Math.abs(u).toFixed(2)}c`
  const found = orderFromStrip(strip, u)
  const stretchWords = strip.stretches
    .map((s) => `${s.order === 'o-first' ? 'O first' : 'B first'} from ${s.from < 0 ? '−' : ''}${Math.abs(s.from).toFixed(2)}c to ${s.to < 0 ? '−' : ''}${Math.abs(s.to).toFixed(2)}c`)
    .join(', then ')
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this strip.</strong> It answers the question of Part 1 for every speed at once. The diagram above shows one passing observer; this strip
        shows what a passing observer at <em>any</em> speed would find about O and B, for the same event B. Each point along the bar is one speed, from &minus;c at
        the left (moving left at the speed of light) to +c at the right. No observer can reach &minus;c or +c, so the two ends are limits, not speeds anyone can have.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong style={{ color: '#93c5fd' }}>Solid blue stretch, &ldquo;O first&rdquo;.</strong> An observer at any speed in this stretch finds that O happened first.
        </li>
        <li>
          <strong style={{ color: '#f59e0b' }}>Orange hatched stretch, &ldquo;B first&rdquo;.</strong> An observer at any speed in this stretch finds that B happened first.
          If this stretch is missing, no speed gives that result for this event.
        </li>
        <li>
          <strong style={{ color: '#facc15' }}>Yellow line.</strong> The one speed at which an observer finds O and B at the same moment. It is missing if no speed
          below c does that.
        </li>
        <li>
          <strong style={{ color: '#8b5cf6' }}>Purple tick.</strong> The passing observer in this run, at {uText}.
        </li>
        <li>
          <strong>The grey &ldquo;0 (the lab)&rdquo; mark.</strong> The lab itself, at rest.
        </li>
        {!part2 && guess !== null && (
          <li>
            <strong style={{ color: '#ffffff', textShadow: '0 0 2px #000' }}>White ring and the YOUR GUESS box.</strong> Your guess, placed in the stretch your answer
            names: the &ldquo;B first&rdquo; stretch for &ldquo;yes&rdquo;, the yellow line for &ldquo;the same moment but never B first&rdquo;, the &ldquo;O first&rdquo;
            stretch for &ldquo;no&rdquo;. It is only a marker. It does not move the strip, and the strip is the same whatever you guessed.
          </li>
        )}
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>A worked moment.</strong> For this event, the strip reads: {stretchWords}
        {strip.flipSpeed !== null ? `, with the same moment at ${strip.flipSpeed < 0 ? '−' : ''}${Math.abs(strip.flipSpeed).toFixed(2)}c (the time ${result.event.time} divided by the distance ${result.event.position})` : ''}
        . The passing observer at {uText} is in the &ldquo;{found === 'o-first' ? 'O first' : found === 'b-first' ? 'B first' : 'the same moment'}&rdquo; place, which matches the
        diagram above.
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>What to look for.</strong>
      </p>
      {lookFor([
        {
          look: 'where the strip changes from one stretch to the other, and the yellow line there',
          means:
            strip.flipSpeed === null
              ? 'there is no change: every speed from −c to +c gives “O first” for this event'
              : `the change is at ${strip.flipSpeed < 0 ? '−' : ''}${Math.abs(strip.flipSpeed).toFixed(2)}c; ${stretchWords}`,
          matters: 'it turns “any speed” into one picture, so you can see which speeds give which order and which speeds do not',
        },
        {
          look: part2 || guess === null ? 'the purple tick' : 'the purple tick and your white ring',
          means:
            part2 || guess === null
              ? `the passing observer at ${uText} is in the “${found === 'o-first' ? 'O first' : found === 'b-first' ? 'B first' : 'the same moment'}” place`
              : `the purple tick (${uText}) is in the “${found === 'o-first' ? 'O first' : found === 'b-first' ? 'B first' : 'the same moment'}” place, and the white ring sits in the stretch your answer names`,
          matters: 'it lets you set the one run you watched, and your guess, beside every other speed. Whether your guess fits the strip is for the tutor.',
        },
      ])}
    </div>
  )
}

export function BarsCaption({ result, part2 }: { result: ReturnType<typeof runCauseBeforeEffectExperiment>; part2: boolean }) {
  const { lab, passing } = result
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this drawing.</strong> The drawing shows only the &ldquo;Time from O to B&rdquo; column of the table, as bars, so you can see at a glance
        which way each observer&rsquo;s time points. The top bar is the lab and the bottom bar is the passing observer, in the same order as the table.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The line in the middle is zero:</strong> no time between O and B. Every bar starts on it.
        </li>
        <li>
          <strong>A bar to the right</strong> means B happened <em>after</em> O for that observer. <strong>A bar to the left</strong> means B happened{' '}
          <em>before</em> O for that observer. The labels above the bars say the same.
        </li>
        <li>
          <strong>The length of a bar</strong> is how many seconds that observer found between O and B. Both bars use the same scale, so you can compare them directly.
          A dot instead of a bar means the same moment.
        </li>
        <li>
          <strong>The words at the right of each row</strong> give the same result in words: the time in seconds and which event came first.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>A worked moment.</strong> {part2 ? 'In your run' : 'In the Part 1 run'}, the lab&rsquo;s bar is {signed(lab.timeBetween)} s long and the passing
        observer&rsquo;s is {signed(passing.timeBetween)} s.
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>What to look for.</strong>
      </p>
      {lookFor([
        {
          look: 'the two bars and which way each points',
          means: `the lab found ${signed(lab.timeBetween)} s (${ORDER_NAMES[lab.order]}) and the passing observer ${signed(passing.timeBetween)} s (${ORDER_NAMES[passing.order]})`,
          matters: 'it shows at a glance whether the two observers found the same order of the two events',
        },
        {
          look: 'the lengths of the two bars',
          means: `the passing observer’s bar is ${passing.timeBetween < lab.timeBetween ? 'shorter' : passing.timeBetween > lab.timeBetween ? 'longer' : 'the same length'} than the lab’s`,
          matters: 'the two observers disagree about how much time there is between the two events, even where they agree on the order',
        },
      ])}
    </div>
  )
}

// ---- One playback, used for Part 1 and for Part 2 ----
function useRun(onFinish?: () => void) {
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const fraction = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)
      if (fraction >= 1) {
        setStatus('complete')
        finishRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status])

  const start = useCallback(() => {
    setProgress(0)
    setStatus('running')
  }, [])
  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(0)
  }, [])
  return { status, progress, start, reset }
}

function observersOf(result: ReturnType<typeof runCauseBeforeEffectExperiment>): ObserverRow[] {
  return [
    { name: 'The lab', color: LAB_LINE_COLOR, reading: result.lab },
    { name: 'The passing observer', color: OBSERVER_COLOR, reading: result.passing },
  ]
}

interface RunRecord {
  eventIndex: number
  passingSpeed: number
}

function shortEventLabel(index: number): string {
  const { time, position } = PRESET_EVENTS[index]
  return `${time} s and ${Math.abs(position)} ls ${position < 0 ? 'left' : 'right'}`
}

function speedLabel(speed: number): string {
  return speed === 0 ? '0c (at rest in the lab)' : `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

interface CauseBeforeEffectExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function CauseBeforeEffectExperiment({ onComplete, onTutorComplete }: CauseBeforeEffectExperimentProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [eventIndex, setEventIndex] = useState(PART2_DEFAULT_EVENT_INDEX)
  const [passingSpeed, setPassingSpeed] = useState(PART2_DEFAULT_PASSING_SPEED)
  // The event and speed of the Part 2 run being shown (chosen when Run your event is pressed), and every finished Part 2 run.
  const [part2Choice, setPart2Choice] = useState<RunRecord>({ eventIndex: PART2_DEFAULT_EVENT_INDEX, passingSpeed: PART2_DEFAULT_PASSING_SPEED })
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const part1 = useRun(onComplete)
  const part2 = useRun()

  // The real results never read the prediction (CLAUDE.md §14, "Predictions and the Real Results").
  const part1Result = useMemo(() => runCauseBeforeEffectExperiment(PRESET_EVENTS[PART1_EVENT_INDEX], PART1_PASSING_SPEED), [])
  const part2Result = useMemo(() => runCauseBeforeEffectExperiment(PRESET_EVENTS[part2Choice.eventIndex], part2Choice.passingSpeed), [part2Choice])

  const part1Running = part1.status === 'running'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  const part2Done = part2.status === 'complete'
  const locked = part1.status !== 'idle'

  const hasAnythingToClear = prediction !== null || locked || part2Runs.length > 0 || part2.status !== 'idle'
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleRunPart1 = () => {
    if (prediction === null || locked) return
    part1.start()
  }
  const handleRunPart2 = () => {
    if (part1Running || part2Running) return
    setPart2Choice({ eventIndex, passingSpeed })
    part2.start()
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done) setPart2Runs((runs) => [...runs, part2Choice])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPrediction(null)
    setEventIndex(PART2_DEFAULT_EVENT_INDEX)
    setPassingSpeed(PART2_DEFAULT_PASSING_SPEED)
    setPart2Choice({ eventIndex: PART2_DEFAULT_EVENT_INDEX, passingSpeed: PART2_DEFAULT_PASSING_SPEED })
    setPart2Runs([])
  }

  const observers1 = observersOf(part1Result)
  const observers2 = observersOf(part2Result)
  const checkUp = checkUpRows(part1Result)
  const tdStyle = { padding: '0.3rem 1rem 0.3rem 0' } as const
  const flip = part1Result.simultaneitySpeed
  const checkExpected = (i: number, value: string) =>
    i === 0 ? signed(parseFloat(value)) : i === 1 ? RELATION_NAMES[value as EventRelation] : ORDER_NAMES[value as EventOrder]
  const guessLabel = prediction === null ? '' : PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.replace(/^(Yes|No|An)/, (w) => w.toLowerCase()) ?? ''

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cause Before Effect: Can the Order of Events Change?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: draft wording of docs/audit/spacetime-geometry/03-draft-wording.md (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Imagine a flash of light is sent out, and when it reaches a light-sensitive switch, a firecracker goes off. The flash is the{' '}
            <strong>cause</strong>, because it makes the bang happen. The bang is the <strong>effect</strong>. In everyday life, nobody would ever find that the
            firecracker went off before the flash was sent. Whoever you ask, the cause comes first, and an effect never comes before the thing that caused it. Earlier
            experiments gave us a reason to look at this more carefully. They showed that &ldquo;at the same time&rdquo; can depend on who is measuring: two far-apart
            events can be at the same moment for one observer and at different moments for another. If observers can disagree about whether two events are
            simultaneous, a bigger question follows. Can they also disagree about which of the two events came <em>first</em>? And if they can, does that break cause
            and effect? Could some observer, somewhere, find that the firecracker went off before the flash was sent? This experiment is about finding out when the
            order of two events can change, and when it cannot. The next few sections build up the pieces, with pictures.
          </p>

          <p style={paragraph}>
            <strong>What a cause does: it makes a trip.</strong> Look at Figure A. A cause does not reach its effect instantly. Something has to travel from one to the
            other, and that takes time. Here the flash is sent at 0 seconds from a lamp. It travels across the room to the switch, which takes 1 second because the
            switch is 1 light-second away. At 1 second it arrives, and the firecracker goes off at once. In the picture, distance is across the page and time goes up,
            so the trip is the slanting line, and the three events, the flash sent, the flash arriving and the bang, are three points one above another in time.
            Everyone who watches this chain agrees on its order: sent, then arrives, then bang.
          </p>
          <ChainFigure />
          <FigureCaption>
            <strong>How to read Figure A.</strong> This is an illustration, not a measurement. The blue square is the flash being sent from the lamp, at distance 0 and
            time 0. The yellow slanting line is the flash travelling at 1 light-second every second. The yellow dot is the flash arriving at the switch, which is the
            dashed vertical line, 1 light-second away. The orange square is the firecracker going off. A light-second is the distance light travels in one second, about
            300,000 kilometers. What to look at: the three events go upward in time, and each needs the trip before it.
          </FigureCaption>
          <p style={paragraph}>
            Here is the same thing in daily life. You post a letter on Monday. It reaches your friend on Wednesday. Your friend writes back, and you get the reply on
            Friday. The reply cannot arrive before your letter was posted, because it is an answer to it. Every link in a chain like this is a trip that takes time,
            and the trip is why the order of the links is fixed.
          </p>

          <p style={paragraph}>
            <strong>What &ldquo;effect before cause&rdquo; would look like.</strong> Now picture the order going wrong. Imagine the firecracker
            going off first. The bang happens, and only afterwards the flash is sent and travels to the switch. That would be an effect with no cause behind it yet.
            Everyday examples of the same scrambling are an egg that is whole again before it was dropped, a reply that arrives before the question was asked, or a
            verdict that is read before the trial begins. Nobody has ever seen such a thing, and the whole of science depends on it never happening: if effects could
            come before their causes, we could not say that one thing makes another happen. Figure B puts the normal order beside the scrambled one so that you can see
            exactly what is meant. The scrambled version is <strong>imagined</strong>. It is drawn only so that we know what we are looking for, and it is not something
            that was measured or that this experiment shows.
          </p>
          <ScrambledFigure />
          <FigureCaption>
            <strong>How to read Figure B.</strong> This is an illustration of an idea. The top row, in solid blue, is the order we expect: the flash is sent, it arrives, then
            the bang. The bottom row, dashed and in grey-violet, is the same three events in a scrambled order, with the bang first. Grey-violet and the word
            IMAGINED mean that this row is not a measurement and not a result. What to look at: the same three boxes appear in both rows, and only the order differs.
          </FigureCaption>

          <p style={paragraph}>
            <strong>Seeing is not the same as finding out.</strong> There is one more idea to be careful with. An observer does not see events at the moment they happen,
            because light takes time to reach their eyes. Suppose a firecracker goes off 3 light-seconds away. Its light takes 3 seconds to arrive. So an observer who
            looks at that moment sees it 3 seconds after it happened. A careful observer does not simply trust what reaches their eyes. They know how far away the
            firecracker is, so they take away the travel time: 3 seconds after seeing it, minus 3 seconds of travel, gives the moment it really happened. When this
            experiment says an observer <strong>finds</strong> the order of two events, it means the order they work out in this careful way, from their own ruler and
            their own synchronized clocks. It never means the order in which the light happens to reach their eyes. (A later experiment is about what an observer{' '}
            <em>sees</em>.)
          </p>
          <SeeingFigure />
          <FigureCaption>
            <strong>How to read Figure C.</strong> This is an illustration. The line is the observer&rsquo;s clock, in seconds. The orange dot at 0 is the firecracker going
            off. The yellow arrow is its light travelling; it takes 3 seconds because the firecracker is 3 light-seconds away. The light-blue eye at 3 is the observer
            seeing it. The green dashed arrow is the careful observer working backwards: 3 − 3 = 0, so it happened at time 0. What to look at: the seen time (3 s) and
            the found time (0 s) differ by exactly the light&rsquo;s travel time.
          </FigureCaption>

          <p style={paragraph}>
            <strong>Two things from the earlier experiments.</strong> The last experiment drew the <strong>light cone</strong> of an event. Look at Figure D, the same
            picture as Figure C of that experiment. It shows an event O, &ldquo;here, now&rdquo;, with the two paths of a flash of light that leaves it, one going right
            and one going left. The paths spread out like the sides of a V. Together they are the edges of O&rsquo;s light cone. A signal that never goes faster than
            light starts at O and can reach only the places on or between those edges. That is what &ldquo;could O be the cause of something?&rdquo; means in this
            experiment: the something must lie on or between the edges.
          </p>
          <ConeFigure />
          <FigureCaption>
            <strong>How to read Figure D.</strong> This is an illustration. Position runs across, in light-seconds, and time runs up, in seconds. The blue square, O, is
            where and when a flash goes off. The bright yellow dots and lines are the two fronts of the flash at each second, stacked: they are the edges of the cone, and
            the space between them above O is the future half. The dimmer dashed lines below O are the past half. What to look at: two straight edges, spreading
            apart at exactly 1 light-second for every second.
          </FigureCaption>
          <p style={paragraph}>
            The first chapter also drew a <strong>same-moment line</strong>. Look at Figure E. For the lab, which stands still, the line through O is level. It joins all
            the events that the lab finds happening at the same moment as O. A passing observer, who moves, has their own ruler and clocks, and finds a different set of
            events at the same moment as O. Their same-moment line through O is <strong>tilted</strong>, and the faster they move, the more it tilts. You do not need to
            work out why: the first chapter showed it, and this experiment uses it.
          </p>
          <SameMomentFigure />
          <FigureCaption>
            <strong>How to read Figure E.</strong> This is an illustration. Position runs across, in light-seconds, and time runs up, in seconds. The blue square, O, is
            here and now. The sky-blue line is the lab&rsquo;s same-moment line: level, because the lab&rsquo;s own clocks show the same time all along it. The purple line is
            the same-moment line of one passing observer, moving to the right at 0.5c, which means half the speed of light. It rises to the right, by half a second for
            every light-second. The tilt shown is for that example speed; the experiment uses other speeds. What to look at: both lines pass through O, and only the
            tilt differs.
          </FigureCaption>

          <p style={paragraph}>
            <strong>Some words we will use.</strong> An <strong>event</strong> is something that happens at one place at one moment, such as a flash of light or a
            firecracker going off. In this experiment, one event can be the <strong>cause</strong> of another only if something starting at the first could reach the
            second without going faster than light: that is the light cone of Figure D. If the second event is not on or inside the first event&rsquo;s cone, nothing could
            make the trip in time, and the first could not have caused it. A <strong>light-second</strong> is the distance light travels in one second, about 300,000
            kilometers. Speeds are given as a fraction of <strong>c</strong>, the speed of light, so 0.6c is 60 percent of that speed. The &ldquo;Words and
            formulas&rdquo; box below has each one, with a short plain meaning: event, cause and effect, observer, sees and finds, light-second, c, light cone,
            same-moment line, time between, distance between, time² − distance², reachable, light only, unreachable, order, the flip speed.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> There are two events. Event O is &ldquo;here, now&rdquo;: something at your place in the lab at time 0. Event B is another event,{' '}
            {PRESET_EVENTS[PART1_EVENT_INDEX].time} seconds later by the lab&rsquo;s clock and {PRESET_EVENTS[PART1_EVENT_INDEX].position} light-seconds away to the
            right. There are also two observers. The first is the lab itself, which is at rest. The second is a passing observer who moves past the lab, to the right, at{' '}
            {PART1_PASSING_SPEED}c. Each has their own ruler and synchronized clocks, so each finds the times and distances of O and B in their own way. In Part 1 you
            predict whether <em>any</em> observer, moving at any speed below the speed of light, could find that B happened before O. Then you press Run. A sweeping
            line for each of the two observers climbs the diagram and touches O and B one after the other; the event a line touches first is the event that observer finds
            came first. When the run ends, the cone is drawn, and below the diagram a strip shows every speed from the speed of light to the left to the speed of light to
            the right, so that you can see what order each speed would find. In Part 2 you choose the event B and the passing speed yourself.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Predict whether any observer, at any speed below the speed of light, could find that B happened before O. Then press Run and watch.
            Guesses are not scored. Then try other events and speeds in Part 2, and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real pictures.</strong> Your guess never changes the real pictures, the table or the numbers: they come from a calculation that
            knows nothing about what you guessed. Your guess is drawn in white on the strip of speeds, as a ring in the stretch your answer names, with a box labelled
            YOUR GUESS. It is shown again beside the results. In Part 2 the event and the speed you choose do change the drawings, and the marks they move are in the
            Part 2 colour.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What we assume.</strong> Space is flat, with no gravity. Every speed stays steady: nobody speeds up, slows down or turns. Everything moves along one
            straight line, to the right or to the left. Nothing can travel faster than light. Speeds are given as a fraction of <strong>c</strong>, the speed of light.
          </p>
        </div>

        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Checked on 20 November 2026. Each link opens in a new tab. This page has no real experimental result; the last two links
            are the original lectures and papers behind the idea. No plain page from NASA, ESA, CERN or a similar space or physics agency was found for these ideas, so
            the plain-language links come from a university course and a Max Planck institute.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            {LINKS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you guess whether any observer could find B before O. Then you press Run. Two lines sweep up the diagram, one for the lab and one for a passing observer,
          and when the run ends the cone is drawn and a strip of speeds appears beneath it, with your guess in white.
        </PartHeader>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            Event O happens first in the lab. Event B happens {PRESET_EVENTS[PART1_EVENT_INDEX].time} seconds later, {PRESET_EVENTS[PART1_EVENT_INDEX].position}{' '}
            light-seconds to the right. Observers who move at different speeds find different times and distances. Could some observer, moving at some speed below the
            speed of light, find that B happened <em>before</em> O?
          </p>
          <div>
            {PREDICTION_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                disabled={locked}
                onClick={() => setPrediction(choice.value)}
                className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: locked ? 0.6 : 1 }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            {prediction !== null
              ? `Your prediction: ${guessLabel}.${locked ? ' Your prediction is locked while you try other events and speeds. To change it, press Start over.' : ''}`
              : 'Choose an option to continue'}
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRunPart1}
          disabled={prediction === null || locked || part2Running}
          style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem' }}
        >
          {part1Running ? 'Running...' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{
            marginLeft: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            cursor: startOverDisabled ? 'not-allowed' : 'pointer',
            opacity: startOverDisabled ? 0.5 : 1,
          }}
        >
          Start over
        </button>
        {prediction === null && !locked && <p style={smallNote}>Choose a prediction above to run the experiment.</p>}

        <Block>
          <Diagram eventIndex={PART1_EVENT_INDEX} passingSpeed={PART1_PASSING_SPEED} progress={part1.status === 'idle' ? null : part1.progress} />
          <WhereFrom>
            Calculated here, not measured: the flash spreads at exactly 1 light-second per second, so the edges of the cone are worked out from that; the times and
            distances for the lab and for the passing observer come from the Lorentz transformation of &ldquo;Moving frames&rdquo; in the first chapter. No instrument
            measured them and nothing here is imagined.
          </WhereFrom>
          <DiagramCaption complete={part1Done} part2={false} result={part1Result} />
        </Block>

        {part1Done && (
          <Block>
            <SpeedStrip event={PRESET_EVENTS[PART1_EVENT_INDEX]} passingSpeed={PART1_PASSING_SPEED} guess={prediction} />
            <WhereFrom>
              Calculated here, not measured: the times between O and B for each observer come from the Lorentz transformation of &ldquo;Moving frames&rdquo;, and the strip
              is the same calculation done for every speed from &minus;c to +c, to show which event each would find first. No instrument measured them and nothing here is
              imagined. The white ring is only your guess, placed in the stretch your answer names.
            </WhereFrom>
            <StripCaption result={part1Result} part2={false} guess={prediction} />
          </Block>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color={PART2_COLOR} title="Part 2: Now try it yourself">
              Now you choose the event B and the passing observer&rsquo;s speed, and run again. These choices change the drawings. Your guess does not.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Event B</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                Each choice says when B happens after O in the lab, and how far from O it is. These are the same five events as in the last experiment.
              </p>
              <div style={{ marginBottom: '1rem' }}>
                {PRESET_EVENTS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={part2Running}
                    onClick={() => setEventIndex(i)}
                    className={`toggle-button${eventIndex === i ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {eventLabel(i)}
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Passing observer&rsquo;s speed</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                Measured from the lab. A positive speed is to the right in the drawing; a negative speed is to the left.
              </p>
              <div>
                {PASSING_SPEED_PRESETS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    disabled={part2Running}
                    onClick={() => setPassingSpeed(speed)}
                    className={`toggle-button${passingSpeed === speed ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {speedLabel(speed)}
                  </button>
                ))}
              </div>
              <p style={smallNote}>
                Your guess does not change the drawings or the tables. These settings do. While every setting is on the Part 1 values the drawing looks the same as in
                Part 1, so change one to see it move.
              </p>
              <button
                type="button"
                className="action-button"
                onClick={handleRunPart2}
                disabled={part1Running || part2Running}
                style={{ marginTop: '0.75rem', padding: '0.6rem 1.5rem' }}
              >
                {part2Running ? 'Running...' : 'Run your event'}
              </button>
            </div>

            {part2.status === 'idle' ? (
              <p style={smallNote}>Not run yet. Choose an event and a speed and press Run your event; the drawing for your choices will appear here.</p>
            ) : (
              <>
                <Block>
                  <Diagram eventIndex={part2Choice.eventIndex} passingSpeed={part2Choice.passingSpeed} progress={part2.progress} yours />
                  <WhereFrom>
                    Calculated here, not measured, for the event and speed you chose: the flash spreads at exactly 1 light-second per second, and the times and distances
                    come from the Lorentz transformation of &ldquo;Moving frames&rdquo;. Nothing here is imagined. Your guess is not redrawn here: it was a guess for the
                    Part 1 run.
                  </WhereFrom>
                  <DiagramCaption complete={part2Done} part2 result={part2Result} />
                </Block>
                {part2Done && (
                  <Block>
                    <SpeedStrip event={PRESET_EVENTS[part2Choice.eventIndex]} passingSpeed={part2Choice.passingSpeed} yours />
                    <WhereFrom>
                      Calculated here, not measured, for the event and speed you chose: the same calculation as the Part 1 strip. Nothing here is imagined.
                    </WhereFrom>
                    <StripCaption result={part2Result} part2 guess={null} />
                  </Block>
                )}
              </>
            )}

            {part2Runs.length > 0 && (
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Runs so far</p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => {
                    const r = runCauseBeforeEffectExperiment(PRESET_EVENTS[run.eventIndex], run.passingSpeed)
                    return (
                      <li key={i}>
                        Event {shortEventLabel(run.eventIndex)}, observer {speedLabel(run.passingSpeed)}: lab: {ORDER_NAMES[r.lab.order]} · passing observer:{' '}
                        {ORDER_NAMES[r.passing.order]} · {RELATION_NAMES[r.lab.relation]}
                      </li>
                    )
                  })}
                </ul>
                <p style={smallNote}>Each line says which event each observer found first, and the case B was in for the lab.</p>
              </div>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && prediction !== null && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guess beside them. Nothing in this Part changes with your guess or with the settings you choose in Part 2.
            </PartHeader>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Event B happened {eventLabel(PART1_EVENT_INDEX)} by the lab&rsquo;s clock, and the passing observer was {passingLabel(PART1_PASSING_SPEED).toLowerCase()}. Both
              observers measured the same two events, O and B, each with their own ruler and clocks. The lab&rsquo;s numbers are the first row.
            </p>

            <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '0.95rem' }}>Check-up</p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['What we compare', 'What we would expect', 'What was found', 'A plain reading'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {checkUp.map((row, i) => (
                    <tr key={row.label}>
                      <td style={tdStyle}>{row.label}</td>
                      <td style={tdStyle}>{checkExpected(i, row.expected)}</td>
                      <td style={tdStyle}>{checkExpected(i, row.found)}</td>
                      <td style={tdStyle}>{row.same ? 'the same' : 'not the same'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={smallNote}>
              The expected numbers do not come from the passing observer: the first two are the lab&rsquo;s own values, because time² − distance² and the case are the same for
              every observer, and the third is read from the strip of speeds.
            </p>

            <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '0.95rem' }}>The two observers&rsquo; numbers</p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
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
                  {observers1.map((o, i) => (
                    <tr key={o.name}>
                      <td style={tdStyle}>{o.name}</td>
                      <td style={tdStyle}>{signed(o.reading.timeBetween)}</td>
                      <td style={tdStyle}>{Math.abs(o.reading.distanceBetween).toFixed(2)}</td>
                      <td style={tdStyle}>{signed(o.reading.intervalSquared)}</td>
                      <td style={tdStyle}>{RELATION_NAMES[o.reading.relation]}</td>
                      <td style={tdStyle}>
                        {ORDER_NAMES[o.reading.order]}
                        {i === 0 && <GuessTag />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={smallNote}>
              A minus sign on the time means B was <em>before</em> O for that observer. &ldquo;Reachable&rdquo; means B is inside the light cone, &ldquo;light only&rdquo; on
              its edge, and &ldquo;unreachable&rdquo; outside it. Your guess ({guessLabel}) is drawn on the strip of speeds as the white ring.
            </p>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>What this table tells us</p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is:</strong> the time, the distance and the case that two observers each find between the same two events O and B, and which event each
                  finds first.
                </li>
                <li>
                  <strong>What it means with the real numbers:</strong> the lab finds {two(part1Result.lab.timeBetween)} s and {two(part1Result.lab.distanceBetween)} ls, the
                  passing observer {two(part1Result.passing.timeBetween)} s and {two(part1Result.passing.distanceBetween)} ls. Those differ. But{' '}
                  {two(part1Result.lab.timeBetween)}² − {two(part1Result.lab.distanceBetween)}² = {signed(part1Result.lab.intervalSquared)}, and{' '}
                  {two(part1Result.passing.timeBetween)}² − {two(part1Result.passing.distanceBetween)}² comes to about {signed(part1Result.passing.intervalSquared)}: the
                  same number, and the same case, {RELATION_NAMES[part1Result.lab.relation]}. Both observers find {ORDER_NAMES[part1Result.lab.order]}.
                  {flip !== null &&
                    ` The speed at which an observer would find O and B at the same moment is ${two(flip)}c (${part1Result.event.time} ÷ ${part1Result.event.position}); the passing observer’s ${two(PART1_PASSING_SPEED)}c is below it.`}
                </li>
                <li>
                  <strong>Why it matters:</strong> two observers can disagree about the time and the distance between two events and still agree on the number and the
                  case, and the strip shows which speeds find which order. Why the case and the order are linked, and what that says about cause and effect, is left to
                  the tutor.
                </li>
                <li>
                  <strong>How sure the numbers are:</strong> they come from a tested calculation (the Lorentz transformation of &ldquo;Moving frames&rdquo;). No instrument
                  measured them. The shown numbers are rounded; the exact value of time² − distance² is {signed(part1Result.lab.intervalSquared)}.
                </li>
              </ul>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the speed of light and the Lorentz transformation. Nothing here changes with your guess or with the
              settings you choose in Part 2.
            </p>

            <Block>
              <ResultsBars rows={observers1} />
              <WhereFrom>Calculated here, not measured: the time column of the table above, drawn as bars. Nothing here is imagined.</WhereFrom>
              <BarsCaption result={part1Result} part2={false} />
            </Block>

            {part2Done && (
              <Block>
                <ResultsBars rows={observers2} />
                <WhereFrom>Calculated here, not measured, for the event and speed you chose in Part 2. It changes with those settings, not with your guess.</WhereFrom>
                <BarsCaption result={part2Result} part2 />
              </Block>
            )}
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && prediction !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your white guess ring, then explains.
            </PartHeader>
            <CauseBeforeEffectTutor
              key={prediction}
              event={PRESET_EVENTS[PART1_EVENT_INDEX]}
              passingSpeed={PART1_PASSING_SPEED}
              predicted={prediction}
              onExplained={() => onTutorComplete?.()}
            />
          </>
        )}
      </div>
    </div>
  )
}
