import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  PART1_EVENT_INDEX,
  PART1_PASSING_SPEED,
  PRESET_EVENTS,
  checkUpRows,
  guessMarkerPosition,
  runLightConeExperiment,
} from '../physics/lightCones'
import type { EventRelation, LightConeGuess, PairReading } from '../physics/lightCones'
import { LightConesTutor } from './LightConesTutor'
import { SPEED_OF_LIGHT } from '../physics/movingClockExperiment'
import { ConeFigure, ShoutFigure, SnapshotsFigure } from './LightConesFigures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Spacetime Geometry, Experiment 2, audited to the newer rules (docs/audit/spacetime-geometry/02-draft-wording.md, approved by the
// owner on 2026-11-19 "I will go with your recommendation"): the page in four Parts, Part 1 fixed on event B = 5 s and 3 ls and a
// +0.3c passing observer, a white YOUR GUESS ring in the region the answer names, a check-up table, links, a words box, Start over
// and a tutor that marks the guess. Every number drawn comes from the physics module (src/physics/lightCones.ts; CLAUDE.md §9).
// The wording is the owner's to approve line by line (CLAUDE.md §28.1).
// Presets are the defaults of Decisions 4 and 6 of docs/experiments/spacetime-geometry/02-light-cones.md.
const PASSING_SPEED_PRESETS = [-0.5, -0.3, 0, 0.3, 0.5]

type Prediction = LightConeGuess
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const PART2_COLOR = '#be185d'
const PART2_DEFAULT_EVENT_INDEX = 2
const PART2_DEFAULT_PASSING_SPEED = -0.5

// The three answers of the prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1).
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'slower', label: 'Yes, and it could be slower than light' },
  { value: 'light-only', label: 'Yes, but only light itself could do it' },
  { value: 'no', label: 'No, not even light could' },
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
const EVENT_O_COLOR = '#3b82f6'
const EVENT_B_COLOR = '#f59e0b'
const OBSERVER_COLOR = '#8b5cf6'

// Drawing constants (SVG units). Position runs across (-6 to 6 light-seconds), time runs up (0 to 6 seconds).
const VIEW_WIDTH = 460
const VIEW_HEIGHT = 400
const CENTER_X = 230
const X_SCALE = 31
const ORIGIN_Y = 300
const T_SCALE = 34
const MAX_POSITION = 6
const MAX_TIME = 6
// How far the dimmed past half of the cone is drawn below the ruler, in seconds.
const PAST_TIME = 2
// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
const ANIMATION_DURATION_MS = 9_000
const FLASH_COLOR = '#facc15'
const INSIDE_COLOR = '#14b8a6'
const OUTSIDE_COLOR = '#fb7185'
const PAST_COLOR = '#94a3b8'
// A dark outline so a label stays readable where it crosses a line.
const TIME_COLOR = '#38bdf8'
const DISTANCE_COLOR = '#f472b6'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

function xOf(position: number): number {
  return CENTER_X + position * X_SCALE
}
function yOf(time: number): number {
  return ORIGIN_Y - time * T_SCALE
}

const GUESS_BOX_TEXT: Record<LightConeGuess, string> = {
  slower: 'slower than light could',
  'light-only': 'only light could',
  no: 'not even light could',
}

// Where the YOUR GUESS box sits for each answer: beside its ring, off the yellow edges, the time axis and the labels. The leader
// line joins the box to the ring (it ends at the ring's outline; endDx and endDy are the offset from the ring's centre).
const GUESS_BOX: Record<LightConeGuess, { x: number; y: number; w: number; leaderX: number; leaderY: number; endDx: number; endDy: number }> = {
  slower: { x: 90, y: 96, w: 124, leaderX: 152, leaderY: 128, endDx: -6, endDy: -7 },
  'light-only': { x: 8, y: 166, w: 98, leaderX: 106, leaderY: 182, endDx: -9, endDy: -2 },
  no: { x: 8, y: 166, w: 98, leaderX: 57, leaderY: 198, endDx: -1, endDy: -9 },
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
  // The learner's guess, drawn as a white ring in the region the answer names, only once the regions are drawn (Part 1 only).
  guess?: LightConeGuess | null
  // True for the Part 2 drawing: framed and labelled in the Part 2 colour.
  yours?: boolean
}

// While idle it draws only the setup: the lab's two axes, event O and event B, and the passing observer. It deliberately
// draws no light cone and no regions then: where B sits relative to the cone is the answer to the prediction (§12).
// While the run plays, the lab's clock counts up and the flash of light spreads from O at one light-second per second,
// and B appears at its time. When the run ends, the whole cone and its regions are drawn.
export function Diagram({ eventIndex, passingSpeed, progress, guess = null, yours = false }: DiagramProps) {
  const { event } = runLightConeExperiment(PRESET_EVENTS[eventIndex], passingSpeed)
  const playing = progress !== null
  const complete = progress !== null && progress >= 1
  const labTime = (progress ?? 0) * MAX_TIME
  const showB = !playing || labTime >= event.time
  // How far the flash has spread by now, in light-seconds, on each side of O.
  const frontSpread = SPEED_OF_LIGHT * labTime
  const bX = xOf(event.position)
  // The passing observer's arrow is longer for a faster observer (up to 40 units at 0.5c).
  const arrowShaft = 6 + (34 * Math.abs(passingSpeed)) / 0.5
  const ring = complete && guess !== null ? guessMarkerPosition(guess) : null
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
      aria-label={`${complete ? 'Result: the light cone of event O, with its inside, its edge and its outside, and event B. ' : playing ? 'Playback: a flash of light spreads out from event O. ' : 'Setup: '}Event O is here and now, at position 0 and time 0. Event B happens ${eventLabel(eventIndex)}. A passing observer is shown: ${passingLabel(passingSpeed).toLowerCase()}.`}
      style={yours ? { ...SVG_STYLE, border: `3px solid ${PART2_COLOR}` } : SVG_STYLE}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Space and time, from the lab's point of view
      </text>
      {yours && (
        <text x={VIEW_WIDTH - 12} y="18" textAnchor="end" fontSize="12" fontWeight="bold" fill="#f9a8d4">
          your event and speed
        </text>
      )}

      {/* The regions, drawn behind everything else once the run has ended. */}
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
          <polygon
            points={`${CENTER_X},${ORIGIN_Y} ${xOf(-PAST_TIME)},${yOf(-PAST_TIME)} ${xOf(PAST_TIME)},${yOf(-PAST_TIME)}`}
            fill={PAST_COLOR}
            fillOpacity="0.18"
            stroke={PAST_COLOR}
            strokeDasharray="4 3"
          />
        </g>
      )}

      {/* The flash of light from O: its two fronts, spreading at one light-second per second. */}
      {playing && (
        <g>
          <line x1={CENTER_X} y1={ORIGIN_Y} x2={xOf(-frontSpread)} y2={yOf(labTime)} stroke={FLASH_COLOR} strokeWidth="2.5" />
          <line x1={CENTER_X} y1={ORIGIN_Y} x2={xOf(frontSpread)} y2={yOf(labTime)} stroke={FLASH_COLOR} strokeWidth="2.5" />
          {!complete && (
            <g>
              <line x1={xOf(-MAX_POSITION)} y1={yOf(labTime)} x2={xOf(MAX_POSITION)} y2={yOf(labTime)} stroke={TEXT_COLOR} strokeOpacity="0.5" strokeDasharray="3 4" />
              <circle cx={xOf(-frontSpread)} cy={yOf(labTime)} r="4" fill={FLASH_COLOR} />
              <circle cx={xOf(frontSpread)} cy={yOf(labTime)} r="4" fill={FLASH_COLOR} />
              {labTime > 0.8 && (
                <text x={xOf(frontSpread) - 8} y={yOf(labTime) - 8} textAnchor="end" fontSize="10" fill={FLASH_COLOR} style={HALO}>
                  front of the flash
                </text>
              )}
            </g>
          )}
        </g>
      )}

      {/* The key to the drawing: the lab's clock while it plays, the regions once it has ended. */}
      {playing && !complete && (
        <g>
          <text x="12" y="36" fontSize="11" fill={TEXT_COLOR}>
            Lab clock: {labTime.toFixed(1)} s
          </text>
          <text x="12" y="50" fontSize="10" fill={MUTED_COLOR}>
            The flash spreads 1 light-second every second.
          </text>
        </g>
      )}
      {complete && (
        <g fontSize="10" fill={TEXT_COLOR}>
          <rect x="12" y="28" width="12" height="8" fill={INSIDE_COLOR} fillOpacity="0.6" />
          <text x="30" y="36">Inside the cone</text>
          <rect x="12" y="41" width="12" height="3" fill={FLASH_COLOR} />
          <text x="30" y="49">Edge of the cone: the path of the front of the flash</text>
          <rect x="12" y="54" width="12" height="8" fill={OUTSIDE_COLOR} fillOpacity="0.6" />
          <text x="30" y="62">Outside the cone</text>
          <rect x="12" y="67" width="12" height="8" fill={PAST_COLOR} fillOpacity="0.5" />
          <text x="30" y="75">Past half of the cone</text>
        </g>
      )}

      {/* The passing observer, top right, with an arrow for the direction of travel. */}
      <rect x={VIEW_WIDTH - 86} y="34" width="32" height="20" rx="3" fill={OBSERVER_COLOR} />
      {passingSpeed !== 0 && (
        <g>
          <line
            x1={VIEW_WIDTH - 70 + (passingSpeed > 0 ? 18 : -18)}
            y1="44"
            x2={VIEW_WIDTH - 70 + (passingSpeed > 0 ? 1 : -1) * (18 + arrowShaft)}
            y2="44"
            stroke={OBSERVER_COLOR}
            strokeWidth="3"
          />
          <polygon
            points={
              passingSpeed > 0
                ? `${VIEW_WIDTH - 70 + 26 + arrowShaft},44 ${VIEW_WIDTH - 70 + 18 + arrowShaft},39 ${VIEW_WIDTH - 70 + 18 + arrowShaft},49`
                : `${VIEW_WIDTH - 70 - 26 - arrowShaft},44 ${VIEW_WIDTH - 70 - 18 - arrowShaft},39 ${VIEW_WIDTH - 70 - 18 - arrowShaft},49`
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

      {/* Guide lines from event B to the two axes, so its time and distance can be read off. B appears when the lab clock reaches its time. */}
      {showB && (
        <g>
          <line x1={bX} y1={bY} x2={bX} y2={ORIGIN_Y} stroke={EVENT_B_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1={bX} y1={bY} x2={CENTER_X} y2={bY} stroke={EVENT_B_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />
        </g>
      )}

      {complete && (
        <text x={CENTER_X} y={yOf(-PAST_TIME) - 6} textAnchor="middle" fontSize="10" fill={PAST_COLOR}>
          past
        </text>
      )}

      {/* Event O: here, now. */}
      <rect x={CENTER_X - 7} y={ORIGIN_Y - 7} width="14" height="14" rx="2" fill={EVENT_O_COLOR} />
      <text x={CENTER_X + 12} y={ORIGIN_Y - 10} textAnchor="start" fontSize="11" fill={TEXT_COLOR}>
        O: here, now
      </text>

      {/* Event B: the other event. */}
      {showB && (
        <g>
          <rect x={bX - 7} y={bY - 7} width="14" height="14" rx="2" fill={EVENT_B_COLOR} />
          <text x={bLabelX} y={bY - 24} textAnchor={bAnchor} fontSize="11" fill={TEXT_COLOR} style={HALO}>
            B: the other event
          </text>
          <text x={bLabelX} y={bY - 12} textAnchor={bAnchor} fontSize="10" fill={MUTED_COLOR} style={HALO}>
            {event.time} s later, {Math.abs(event.position)} ls {event.position < 0 ? 'left' : 'right'}
          </text>
        </g>
      )}
      {/* The learner's guess: a white ring in the region the answer names, drawn only once the regions are drawn. It is only a marker. */}
      {ring !== null && guess !== null && (
        <g>
          <line
            x1={GUESS_BOX[guess].leaderX}
            y1={GUESS_BOX[guess].leaderY}
            x2={xOf(ring.position) + GUESS_BOX[guess].endDx}
            y2={yOf(ring.time) + GUESS_BOX[guess].endDy}
            stroke={GUESS_COLOR}
            strokeWidth="2"
          />
          <circle cx={xOf(ring.position)} cy={yOf(ring.time)} r="9" fill="none" stroke={GUESS_COLOR} strokeWidth="3.5" />
          <rect x={GUESS_BOX[guess].x} y={GUESS_BOX[guess].y} width={GUESS_BOX[guess].w} height="32" rx="4" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="2" />
          <text x={GUESS_BOX[guess].x + GUESS_BOX[guess].w / 2} y={GUESS_BOX[guess].y + 14} textAnchor="middle" fontSize="11" fontWeight="bold" fill={GUESS_COLOR}>
            YOUR GUESS
          </text>
          <text x={GUESS_BOX[guess].x + GUESS_BOX[guess].w / 2} y={GUESS_BOX[guess].y + 27} textAnchor="middle" fontSize="9" fill={GUESS_COLOR}>
            {GUESS_BOX_TEXT[guess]}
          </text>
        </g>
      )}
      {/* A short note as B appears, while the flash is still spreading. */}
      {playing && !complete && showB && labTime < event.time + 1 && (
        <text x={bX} y={bY + 22} textAnchor="middle" fontSize="10" fill={EVENT_B_COLOR} style={HALO}>
          B happens now
        </text>
      )}
    </svg>
  )
}

// Plain names for the three cases (Decision 3), and the colour of the block that shows each sign of the interval.
const RELATION_NAMES: Record<EventRelation, string> = {
  reachable: 'reachable',
  'light-only': 'light only',
  unreachable: 'unreachable',
}
const RELATION_COLORS: Record<EventRelation, string> = {
  reachable: INSIDE_COLOR,
  'light-only': FLASH_COLOR,
  unreachable: OUTSIDE_COLOR,
}

// Two decimals, with a true minus sign for a negative number.
function signed(value: number): string {
  return value.toFixed(2).replace('-', '−')
}

interface ObserverRow {
  name: string
  reading: PairReading
}

const BARS_VIEW_WIDTH = 460
const BARS_VIEW_HEIGHT = 230
const BAR_START_X = 20
const BAR_MAX_LENGTH = 180
const BLOCK_X = 300
const BLOCK_WIDTH = 140
const ROWS_TOP = 36
const ROW_HEIGHT = 82

// The two observers' time and distance as bars on one scale, and the sign of time² − distance² as one block of the same
// size in each row, coloured by sign, so that what changes (the bars) and what does not (the block) can be compared.
export function ResultsBars({ rows }: { rows: ObserverRow[] }) {
  const distanceOf = (r: ObserverRow) => Math.abs(r.reading.distanceBetween)
  const longest = Math.max(...rows.flatMap((r) => [r.reading.timeBetween, distanceOf(r)]))
  const lengthOf = (value: number) => (value / longest) * BAR_MAX_LENGTH

  return (
    <svg
      viewBox={`0 0 ${BARS_VIEW_WIDTH} ${BARS_VIEW_HEIGHT}`}
      role="img"
      aria-label={`Bars of the time and the distance that each observer found between O and B, and the value of time squared minus distance squared. ${rows
        .map((r) => `${r.name}: time ${r.reading.timeBetween.toFixed(2)}, distance ${distanceOf(r).toFixed(2)}, time squared minus distance squared ${signed(r.reading.intervalSquared)}, ${RELATION_NAMES[r.reading.relation]}`)
        .join('. ')}.`}
      style={SVG_STYLE}
    >
      <text x={BAR_START_X} y="22" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Time and distance (one scale)
      </text>
      <text x={BLOCK_X} y="22" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        time² − distance²
      </text>
      {rows.map((row, i) => {
        const y = ROWS_TOP + i * ROW_HEIGHT
        const distance = distanceOf(row)
        const color = RELATION_COLORS[row.reading.relation]
        return (
          <g key={row.name}>
            <text x={BAR_START_X} y={y + 12} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
              {row.name}
            </text>
            <rect x={BAR_START_X} y={y + 20} width={lengthOf(row.reading.timeBetween)} height="14" rx="2" fill={TIME_COLOR} />
            <text x={BAR_START_X + lengthOf(row.reading.timeBetween) + 6} y={y + 31} fontSize="11" fill={TEXT_COLOR}>
              time {row.reading.timeBetween.toFixed(2)} s
            </text>
            <rect x={BAR_START_X} y={y + 40} width={lengthOf(distance)} height="14" rx="2" fill={DISTANCE_COLOR} />
            <text x={BAR_START_X + lengthOf(distance) + 6} y={y + 51} fontSize="11" fill={TEXT_COLOR}>
              distance {distance.toFixed(2)} ls
            </text>
            <rect x={BLOCK_X} y={y + 20} width={BLOCK_WIDTH} height="34" rx="2" fill={color} />
            <text x={BLOCK_X + BLOCK_WIDTH / 2} y={y + 42} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0b1020">
              {signed(row.reading.intervalSquared)}
            </text>
            <text x={BLOCK_X + BLOCK_WIDTH / 2} y={y + 68} textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
              {RELATION_NAMES[row.reading.relation]}
            </text>
          </g>
        )
      })}
      <text x={BAR_START_X} y={BARS_VIEW_HEIGHT - 10} fontSize="10" fill={MUTED_COLOR}>
        s = seconds, ls = light-seconds. The longest time or distance bar here is {longest.toFixed(2)}.
      </text>
    </svg>
  )
}

// ---- Pages read on 19 November 2026 (draft wording, section 2). No plain official page on the light cone was found (§29 rule 3(c)). ----
const LINKS = [
  {
    href: 'https://en.wikisource.org/wiki/Space_and_Time_(Saha)',
    label: 'Minkowski, "Space and Time" (1908), English translation by Meghnad Saha (1920), on Wikisource',
    what: 'the lecture that first drew time and space together; its pictures of "light cones" are the idea behind this page.',
  },
  {
    href: 'https://sites.pitt.edu/~jdnorton/teaching/HPS_0410/chapters/spacetime/index.html',
    label: 'John D. Norton, "Spacetime", University of Pittsburgh course "Einstein for Everyone"',
    what: 'a plain, picture-and-animation chapter for non-specialists. It builds a light cone from a flash of light and explains the past half, the future half and "elsewhere", and which events can be connected by signals.',
  },
  {
    href: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/speed-of-sound-interactive/',
    label: 'NASA Glenn Research Center, "Speed of Sound Interactive" (Beginners Guide to Aeronautics)',
    what: 'what the speed of sound is and why it depends on the air; it gives about 1,100 feet per second at sea level on a standard day, a little under 340 meters per second.',
  },
  {
    href: 'https://www.nist.gov/si-redefinition/meter',
    label: 'NIST: "The Meter"',
    what: 'why a light-second is an exact distance: in 1983 the meter was defined using the speed of light, which was fixed at exactly 299,792,458 meters per second.',
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

// The "Words and formulas" box. The speed needed, the formula and the three case names show the answer to the prediction, so they
// appear only after the Part 1 run has finished (CLAUDE.md §12). Their numbers come from the physics module (CLAUDE.md §9).
export function referenceEntries(done: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Event', meaning: 'something that happens at one place at one moment.' },
    { term: 'Signal', meaning: 'anything that carries an effect from one place to another: a shout, a flash of light, a spaceship.' },
    { term: 'Light-second', meaning: 'the distance light travels in one second, about 300,000 kilometers.' },
    { term: 'c', meaning: 'the speed of light. 0.5c is half that speed.' },
    { term: 'Light cone', meaning: 'all the events a flash of light from one event could reach.' },
    { term: 'Edge of the cone', meaning: 'the path of the front of the flash, drawn as two yellow lines.' },
    { term: 'Past half and future half', meaning: 'the lower half of the cone is where a flash could have come from; the upper half is where it can get to later.' },
    { term: 'Time between / distance between', meaning: 'how much time, and how far apart in space, two events are, as one observer measures them.' },
  ]
  if (done) {
    const r = runLightConeExperiment(PRESET_EVENTS[PART1_EVENT_INDEX], PART1_PASSING_SPEED)
    entries.push(
      {
        term: 'Speed needed',
        meaning: `the distance divided by the time. For example, ${two(r.lab.distanceBetween)} light-seconds in ${two(r.lab.timeBetween)} seconds needs ${two(r.lab.distanceBetween)} ÷ ${two(r.lab.timeBetween)} = ${two(r.lab.speedNeeded)} of the speed of light.`,
      },
      {
        term: 'time² − distance²',
        meaning: `multiply the time by itself, multiply the distance by itself, subtract. For ${two(r.lab.timeBetween)} s and ${two(r.lab.distanceBetween)} ls: ${two(r.lab.timeBetween)} × ${two(r.lab.timeBetween)} − ${two(r.lab.distanceBetween)} × ${two(r.lab.distanceBetween)} = ${(r.lab.timeBetween ** 2).toFixed(2)} − ${(r.lab.distanceBetween ** 2).toFixed(2)} = ${two(r.lab.intervalSquared)}.`,
      },
      { term: 'Reachable, light only, unreachable', meaning: 'the three cases, named in the results table.' },
      { term: 'Timelike, lightlike, spacelike', meaning: "the physicists' words for the same three cases." },
    )
  }
  return entries
}

// ---- Captions ----

export function DiagramCaption({ complete, part2 }: { complete: boolean; part2: boolean }) {
  const r = runLightConeExperiment(PRESET_EVENTS[PART1_EVENT_INDEX], PART1_PASSING_SPEED)
  const other = runLightConeExperiment(PRESET_EVENTS[3], 0.3)
  const margin = Math.abs(r.lightFrontPositionAtEventTime) - Math.abs(r.lab.distanceBetween)
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this diagram.</strong> The drawing is from the lab&rsquo;s point of view. Position runs left to right, and
        time runs upward, as in Figure C, so an event higher up happens later.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The horizontal grey line</strong> is the lab&rsquo;s ruler, at time 0. Its numbers are distances in light-seconds from the
          middle. A mark that says 2 is 2 light-seconds, about 600,000 kilometers, from the middle. Marks to the left are negative.
        </li>
        <li>
          <strong>The vertical grey line</strong> is the lab itself, which stays at the middle of the ruler as time goes by. Its numbers are
          seconds on the lab&rsquo;s clock.
        </li>
        <li>
          <strong style={{ color: EVENT_O_COLOR }}>Blue square (O):</strong> &ldquo;here, now&rdquo;, the start. It is at the middle of the
          ruler, at time 0.
        </li>
        <li>
          <strong style={{ color: EVENT_B_COLOR }}>Orange square (B):</strong> the other event. Its height is when it happens, and its place
          along the ruler is how far away it is. The dashed orange lines show both numbers: one down to the ruler, one across to the
          lab&rsquo;s clock.
        </li>
        <li>
          <strong style={{ color: OBSERVER_COLOR }}>Purple square (the passing observer):</strong> shown at the top right. The arrow shows
          which way they move relative to the lab, and its length follows their speed: a longer arrow means a faster observer. No arrow means
          they are at rest in the lab. In this drawing they are only shown, not moved.
        </li>
        <li>
          <strong style={{ color: FLASH_COLOR }}>Yellow lines (the flash of light):</strong> appear when you press Run. A flash leaves O in both
          directions and spreads at 1 light-second every second, so each yellow line climbs one light-second across for every second up. While
          it plays, a dashed line marks the lab&rsquo;s clock, and the yellow dots are the front of the flash. B appears when the
          lab&rsquo;s clock reaches its time.
        </li>
        {complete && (
          <li>
            <strong>The shaded regions:</strong> when the run ends, the yellow lines are the edges of the light cone.{' '}
            <strong style={{ color: INSIDE_COLOR }}>Teal</strong> is inside the cone and <strong style={{ color: OUTSIDE_COLOR }}>rose</strong> is
            outside it. <strong style={{ color: PAST_COLOR }}>The dimmed grey triangle</strong> below the ruler is the past half of the cone. The
            key at the top of the drawing says the same. What each region means for the question is left to you and the tutor.
          </li>
        )}
        {complete && !part2 && (
          <li>
            <strong style={{ color: GUESS_COLOR }}>The white ring and the YOUR GUESS box:</strong> your guess, placed in the region your answer
            names. It is only a marker. It is not B, and it does not move the real picture.
          </li>
        )}
      </ul>
      {!part2 && !complete ? (
        <p style={{ margin: 0 }}>
          <strong>A worked moment and what to look for</strong> appear here once the run has ended, so that they do not give anything away
          before you have made your prediction.
        </p>
      ) : (
        <>
      <p style={{ margin: '0 0 0.5rem' }}>
          <strong>A worked moment.</strong>{' '}
          {part2
            ? `Take B at ${other.lab.timeBetween.toFixed(0)} seconds and ${two(other.lab.distanceBetween)} light-seconds, with the observer at 0.3c. The lab finds ${two(other.lab.timeBetween)} s and ${two(other.lab.distanceBetween)} ls, and ${two(other.lab.timeBetween)} × ${two(other.lab.timeBetween)} − ${two(other.lab.distanceBetween)} × ${two(other.lab.distanceBetween)} = ${(other.lab.timeBetween ** 2).toFixed(2)} − ${(other.lab.distanceBetween ** 2).toFixed(2)} = −${two(other.lab.intervalSquared)}. The observer finds ${two(other.passing.timeBetween)} s and ${two(other.passing.distanceBetween)} ls, and ${two(other.passing.timeBetween)}² − ${two(other.passing.distanceBetween)}² comes to about −${two(other.passing.intervalSquared)} (the shown numbers are rounded).`
            : `B is ${two(r.lab.timeBetween)} seconds after O and ${two(r.lab.distanceBetween)} light-seconds away. In ${two(r.lab.timeBetween)} seconds the front of the flash gets ${two(r.lab.timeBetween)} light-seconds from O. B's place is ${two(r.lab.distanceBetween)} light-seconds from O. So when B happens, the front of the flash is already ${two(margin)} light-seconds past B's place.`}
        </p>
        {part2 ? (
          <>
            <p style={{ margin: '0 0 0.25rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList
              items={[
                {
                  look: 'the yellow front of the flash and the orange square B as the lab’s clock reaches B’s time, in each of your runs',
                  means: 'whether the front of the flash has reached B’s place by then, is exactly there, or is still short of it',
                  matters: 'it is the plain test of whether even light could make the trip, for the event you chose',
                },
                ...(complete
                  ? [
                      {
                        look: 'the region B sits in once the run ends (teal, a yellow edge, or rose), for each event you try',
                        means: 'B falls inside the cone, on one of its edges, or outside it, depending on its time and its distance',
                        matters: 'it shows that the three regions are three different answers to the question of Part 1. The tutor explains what each means.',
                      },
                    ]
                  : []),
              ]}
            />
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 0.25rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList
              items={[
                {
                  look: 'the yellow dot at the front of the flash as the lab’s clock reaches 5 seconds, and the orange square B',
                  means: `the front is ${two(r.lab.timeBetween)} light-seconds out, ${two(margin)} light-seconds past B's place, when B happens`,
                  matters: 'it tells you whether the flash, the fastest signal there is, got to B’s place in time',
                },
                ...(complete
                  ? [
                      {
                        look: 'which region B sits in now that the run has ended, and the white ring',
                        means: 'B lies inside the cone, on one of its edges, or outside it, and your ring sits in the region your answer names',
                        matters: 'it sets the answer to your question beside your guess. Which region means which answer is for the tutor.',
                      },
                    ]
                  : []),
              ]}
            />
          </>
        )}
  
        </>
      )}
    </div>
  )
}

export function BarsCaption({ result, part2 }: { result: ReturnType<typeof runLightConeExperiment>; part2: boolean }) {
  const { lab, passing } = result
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this drawing.</strong> Two observers each measured the same two events, O and B. Each observer gets one row,
        in the same order as the table above. The drawing shows the same numbers as the table, as lengths and as a coloured block.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong style={{ color: TIME_COLOR }}>Blue bar (time):</strong> how much time that observer found between O and B, in seconds
          (&ldquo;s&rdquo;). A longer bar means more time passed, according to that observer.
        </li>
        <li>
          <strong style={{ color: DISTANCE_COLOR }}>Pink bar (distance):</strong> how far apart that observer found O and B, in light-seconds
          (&ldquo;ls&rdquo;). A pink bar with no length would mean the observer found both events at the same place.
        </li>
        <li>
          <strong>The blue and pink bars share one scale,</strong> set by the longest bar in the drawing, which is named at the bottom. So you
          can compare a blue bar and a pink bar directly, and compare bars in different rows.
        </li>
        <li>
          <strong>The block on the right (time² − distance²):</strong> worked out for each observer from their own two numbers: multiply the
          time by itself, multiply the distance by itself, and subtract. For example, a row with time 3.00 s and distance 2.00 ls would give
          3 × 3 − 2 × 2 = 9 − 4 = 5.00. The block is the same size in every row on purpose, so read the number written inside it. Its colour
          shows the sign of the number, with the same colours as the cone in the drawing above:{' '}
          <strong style={{ color: INSIDE_COLOR }}>teal</strong> for a positive number, <strong style={{ color: FLASH_COLOR }}>yellow</strong>{' '}
          for zero and <strong style={{ color: OUTSIDE_COLOR }}>rose</strong> for a negative number. The word under the block says which case
          that is.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>A worked moment.</strong> {part2 ? 'In your run' : 'In the Part 1 run'}, the lab found {two(lab.timeBetween)} s and{' '}
        {two(lab.distanceBetween)} ls, so its block reads {signed(lab.intervalSquared)}. The passing observer found {two(passing.timeBetween)} s
        and {two(passing.distanceBetween)} ls.
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          {
            look: 'the blue and pink bars of the two rows',
            means: `the lab found ${two(lab.timeBetween)} s and ${two(lab.distanceBetween)} ls, the passing observer ${two(passing.timeBetween)} s and ${two(passing.distanceBetween)} ls`,
            matters: 'the two observers disagree about the time and about the distance between the same two events, which is the starting point of the question',
          },
          {
            look: 'the two blocks, their numbers, their colours and the words under them',
            means: `the lab's block reads ${signed(lab.intervalSquared)} (${RELATION_NAMES[lab.relation]}) and the passing observer's reads ${signed(passing.intervalSquared)} (${RELATION_NAMES[passing.relation]})`,
            matters: 'it puts the number and the case side by side for both observers, so you can see whether they disagree about it. Why is left to the tutor.',
          },
        ]}
      />
    </div>
  )
}

// ---- The playback ----

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

function observersOf(result: ReturnType<typeof runLightConeExperiment>): ObserverRow[] {
  return [
    { name: 'The lab', reading: result.lab },
    { name: 'The passing observer', reading: result.passing },
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

interface LightConesExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function LightConesExperiment({ onComplete, onTutorComplete }: LightConesExperimentProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [eventIndex, setEventIndex] = useState(PART2_DEFAULT_EVENT_INDEX)
  const [passingSpeed, setPassingSpeed] = useState(PART2_DEFAULT_PASSING_SPEED)
  // The event and speed of the Part 2 run being shown (chosen when Run your event is pressed), and every finished Part 2 run.
  const [part2Choice, setPart2Choice] = useState<RunRecord>({ eventIndex: PART2_DEFAULT_EVENT_INDEX, passingSpeed: PART2_DEFAULT_PASSING_SPEED })
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const part1 = useRun(onComplete)
  const part2 = useRun()

  // The real results never read the prediction (CLAUDE.md §14, "Predictions and the Real Results").
  const part1Result = useMemo(() => runLightConeExperiment(PRESET_EVENTS[PART1_EVENT_INDEX], PART1_PASSING_SPEED), [])
  const part2Result = useMemo(() => runLightConeExperiment(PRESET_EVENTS[part2Choice.eventIndex], part2Choice.passingSpeed), [part2Choice])

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
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Light Cones: Which Events Can Affect Which</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: approved wording of docs/audit/spacetime-geometry/02-draft-wording.md (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Imagine you shout across a field. Sound travels about 340 meters every second. A friend stands
            1,000 meters away. Two seconds after your shout, the sound has covered only 680 meters, so it has not reached your friend yet.
            Whatever your friend does at that moment, your shout cannot have caused it. The news simply has not arrived. So whether one
            thing can affect another depends on whether a signal can cover the distance in the time available. This experiment asks the same
            question about light, the fastest signal there is: for two events, could anything that starts at the first reach the second in
            time? And would a moving observer, who measures a different time and a different distance, give a different answer? Figure A
            draws the shout so that you can see it.
          </p>

          <p style={paragraph}>
            <strong>A closer look at the shout.</strong> Look at Figure A. It is a picture of the shout, with distance across the page and
            time going up. You shout at the bottom left, at time 0. The sound spreads out along the sloping line: after 1 second it is 340
            meters away, after 2 seconds 680 meters, after 3 seconds 1,020 meters. Three friends are marked, and each is at a different
            distance, but we look at all of them at the same moment, 2 seconds after the shout.
          </p>
          <ShoutFigure />
          <FigureCaption>
            <strong>How to read Figure A.</strong> This is an illustration, not a measurement. The blue square is your shout. The sloping blue
            line is the sound, moving 340 meters every second. The dashed line is the moment we look at, 2 seconds after the shout. The
            three orange dots are three friends standing at 340, 680 and 1,000 meters. A friend to the left of the sloping line at that moment
            has been reached by the sound; a friend to the right has not.
          </FigureCaption>
          <p style={paragraph}>
            The friend at 340 meters has already heard you. The sound went past that spot a whole second ago, so what you shouted could have
            changed what they did. The friend at 680 meters is hearing you at exactly that moment. The friend at 1,000 meters has heard
            nothing yet. So at that moment there are three kinds of friend: those the news has already reached, one it is reaching right
            now, and those it has not reached.
          </p>
          <p style={paragraph}>
            Notice what the sloping line does. It is the dividing line. Friends on one side of it are inside what your shout could have
            affected by then; friends on the other side are outside. Keep that idea of a dividing line: it is the whole of this experiment.
          </p>

          <p style={paragraph}>
            <strong>How a flash of light becomes a cone.</strong> Now replace the shout with a flash of light, the fastest signal there is.
            Light travels 1 light-second every second. A light-second is the distance light travels in one second, about 300,000
            kilometers, so the numbers stay small: after 2 seconds the flash is 2 light-seconds from where it started, after 3 seconds, 3.
          </p>
          <p style={paragraph}>
            Space has three directions, but to keep the drawings simple we look along one line only, left and right. A flash that goes off at
            one spot spreads both ways along the line. Figure B shows four snapshots of the same flash, one for each second. The flash starts
            in the middle, and then two bright fronts move away from it, one to the left and one to the right, each 1 light-second farther
            every second.
          </p>
          <SnapshotsFigure />
          <FigureCaption>
            <strong>How to read Figure B.</strong> This is an illustration. Each row is one snapshot of the same line, marked in
            light-seconds, and the label on the left says how many seconds have passed. The yellow dots are the two fronts of the flash. The
            faint dashed lines join each front to where it was one second earlier, so you can see how fast it moves: 1 light-second every
            second.
          </FigureCaption>
          <p style={paragraph}>
            Figure C does something clever with those snapshots. It stacks them up, with the earliest at the bottom and the later ones
            above, so that time runs upward, like the shout picture. The two moving fronts then trace out two straight lines that spread
            apart like the sides of a letter V. These two lines are the <strong>edges</strong> of a <strong>light cone</strong>. The flash
            only ever reaches events on the edge or inside the V on its way up. The picture is called a cone because in real space, with
            three directions, the flash is a growing ball, and stacking up the balls would make an ice-cream cone shape. We draw only one
            direction, so we see a flat V.
          </p>
          <ConeFigure />
          <FigureCaption>
            <strong>How to read Figure C.</strong> This is an illustration. Position runs across (in light-seconds) and time runs up (in
            seconds). The blue square, O, is where and when the flash goes off. The bright yellow dots and lines are the two fronts at each
            second, now stacked: they are the edges of the cone, and the space between them above O is the future half. The dimmer dashed
            lines below O are the past half. There are three kinds of place in this drawing: inside the V, on its two edges, and outside it.
            What that means for whether something can get there is the question you will be asked.
          </FigureCaption>
          <p style={paragraph}>
            <strong>The cone also reaches into the past.</strong> So far the flash has only gone forward in time: it starts at O and
            spreads out, later and later. But we can ask the question the other way round. Which places and moments could a flash have
            set out from, and still got to O in time? Go back to the shout. Suppose a friend 340 meters away shouted exactly 1 second ago.
            The sound takes 1 second to cross 340 meters, so you are hearing it at this very moment. If they shouted 5 seconds ago
            instead, you heard it long ago. In both cases their shout could have reached you by now. A friend 340 meters away who
            shouted only half a second ago is different: the sound is still on its way, and you cannot have heard it yet.
          </p>
          <p style={paragraph}>
            The <strong>past half</strong> of the light cone collects all the places and moments from which a flash could have arrived at
            O in time. It is the dashed lower half of Figure C, below O, which is just the upper half turned upside down. A flash that
            arrives at O at time 0 must have set out earlier, so its starting moment is below 0 on the picture. The{' '}
            <strong>future half</strong> is the other way round: the places and moments that a flash leaving O can get to later.
          </p>
          <p style={paragraph}>
            One more thing. Every event has its own light cone, not just O, and the cone is there even if no flash ever goes off. The
            flash does not make the cone. The cone is a way of drawing what a flash from that event would do, a little like a lamp that is
            switched off: you can still say how far its light would have reached by now if it had been on.
          </p>

          <p style={paragraph}>
            <strong>Some words we will use.</strong> An <strong>event</strong> is something that happens at one place at one moment: a shout, a
            flash of light going off, a clock ticking. A <strong>signal</strong> is anything that carries an effect from one place to another:
            a shout, a flash of light, a spaceship. We measure distance in <strong>light-seconds</strong>. The <strong>light cone</strong> of an
            event is the set of all the events that a flash of light from it could reach. Speeds are given as a fraction of <strong>c</strong>,
            the speed of light, so 0.5c is half that speed. The &ldquo;Words and formulas&rdquo; box below has the rest, with a short plain
            meaning each: event, signal, light-second, c, light cone, edge of the cone, past half, future half, time between, distance between,
            speed needed, time² − distance², reachable, light only, unreachable, timelike, lightlike, spacelike.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> Event O is &ldquo;here, now&rdquo;: you, in the lab, at time 0. Event B is another event,{' '}
            {PRESET_EVENTS[PART1_EVENT_INDEX].time} seconds later and {PRESET_EVENTS[PART1_EVENT_INDEX].position} light-seconds away to the
            right. In Part 1 you predict whether anything could get from O to B in time. Then you press Run. A flash of light leaves O and
            spreads out in both directions, and you watch whether its front gets to B&rsquo;s place before B happens, exactly when B happens,
            or too late. When the run ends, the drawing shows the edges of the light cone and shades the regions it makes. A passing observer,
            who moves past the lab at {PART1_PASSING_SPEED}c in the same direction as B lies, then measures the same two events with their own
            ruler and clock, and you see their numbers beside the lab&rsquo;s. In Part 2 you choose the event B and the observer&rsquo;s speed
            yourself.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Predict whether anything that never goes faster than light could get from O to B in time to be there
            when B happens, then press Run and watch. Guesses are not scored. Then try other events and speeds in Part 2, and talk it over with
            the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real pictures.</strong> Your guess never changes the real pictures, the table or the numbers: they come
            from a calculation that knows nothing about what you guessed. Your guess is drawn on the diagram in white, as a ring in the region
            your answer names, with a box labelled YOUR GUESS. It is shown again beside the results. In Part 2 the event and speed you choose do
            change the drawings, and the marks they move are in the Part 2 colour.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What we assume.</strong> Space is flat, with no gravity. Every speed stays steady, and everything moves along one line.
            Speeds are given as a fraction of <strong>c</strong>, the speed of light. Nothing can travel faster than light.
          </p>
        </div>

        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Checked on 19 November 2026. Each link opens in a new tab. This page has no real experimental
            result; the first link is the original lecture behind the idea. No plain page from NASA, ESA or a similar official source was found
            for the light cone itself, so the nearest, a university course for non-specialists, is listed second.
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
          First you guess whether anything could get from O to B in time. Then you press Run. A flash of light leaves O, and when the run ends
          the diagram shows the edges of the light cone and your guess drawn on it in white.
        </PartHeader>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            Event O is &ldquo;here, now&rdquo;. Event B happens {PRESET_EVENTS[PART1_EVENT_INDEX].time} seconds later,{' '}
            {PRESET_EVENTS[PART1_EVENT_INDEX].position} light-seconds to the right. Could something that starts at O, and never goes faster than
            light, arrive at B in time to be there when B happens?
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
              ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.toLowerCase()}.${locked ? ' Your prediction is locked while you try other events and speeds. To change it, press Start over.' : ''}`
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
          <Diagram
            eventIndex={PART1_EVENT_INDEX}
            passingSpeed={PART1_PASSING_SPEED}
            progress={part1.status === 'idle' ? null : part1.progress}
            guess={part1Done ? prediction : null}
          />
          <WhereFrom>
            Calculated here, not measured: the flash spreads at exactly 1 light-second per second, so the edges of the cone are worked out from
            that; the times and distances for the lab and for the passing observer come from the Lorentz transformation of &ldquo;Moving
            frames&rdquo; in the first chapter. No instrument measured them and nothing here is imagined. The white ring is only your guess,
            placed in the region your answer names.
          </WhereFrom>
          <DiagramCaption complete={part1Done} part2={false} />
        </Block>

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color={PART2_COLOR} title="Part 2: Now try it yourself">
              Now you choose the event B and the passing observer&rsquo;s speed, and run again. These choices change the drawings. Your guess
              does not.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Event B</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                Each choice says when B happens after O, and how far from O it is. Time is measured in the lab.
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
                Your guess does not change the drawings or the tables. These settings do. While every setting is on the Part 1 values the
                drawing looks the same as in Part 1, so change one to see it move.
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
              <Block>
                <Diagram eventIndex={part2Choice.eventIndex} passingSpeed={part2Choice.passingSpeed} progress={part2.progress} yours />
                <WhereFrom>
                  Calculated here, not measured, for the event and speed you chose: the flash spreads at exactly 1 light-second per second, and
                  the times and distances come from the Lorentz transformation of &ldquo;Moving frames&rdquo;. Nothing here is imagined. Your
                  guess is not redrawn here: it was a guess for the Part 1 run.
                </WhereFrom>
                <DiagramCaption complete={part2Done} part2 />
              </Block>
            )}

            {part2Runs.length > 0 && (
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Runs so far</p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => {
                    const r = runLightConeExperiment(PRESET_EVENTS[run.eventIndex], run.passingSpeed)
                    return (
                      <li key={i}>
                        Event {shortEventLabel(run.eventIndex)}, observer {speedLabel(run.passingSpeed)}: lab: {RELATION_NAMES[r.lab.relation]} · passing
                        observer: {RELATION_NAMES[r.passing.relation]}
                      </li>
                    )
                  })}
                </ul>
                <p style={smallNote}>Each case says where B sits for that observer: inside the cone, on its edge, or outside it.</p>
              </div>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && prediction !== null && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guess beside them. Nothing in this Part changes with your guess or with the
              settings you choose in Part 2.
            </PartHeader>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Event B happened {eventLabel(PART1_EVENT_INDEX)}, and the passing observer was {passingLabel(PART1_PASSING_SPEED).toLowerCase()}. Times and
              distances are measured by each observer, and the lab&rsquo;s numbers are the first row.
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
                  {checkUp.map((row) => (
                    <tr key={row.what}>
                      <td style={tdStyle}>{row.what}</td>
                      <td style={tdStyle}>{row.expected}</td>
                      <td style={tdStyle}>{row.found}</td>
                      <td style={tdStyle}>{row.reading}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '0.95rem' }}>The two observers&rsquo; numbers</p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
                <thead>
                  <tr>
                    {[
                      'Observer',
                      'Time from O to B (seconds)',
                      'Distance from O to B (light-seconds)',
                      'time² − distance²',
                      'Speed needed to get from O to B (fraction of c)',
                      'Which case',
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
                      <td style={tdStyle}>{o.reading.timeBetween.toFixed(2)}</td>
                      <td style={tdStyle}>{Math.abs(o.reading.distanceBetween).toFixed(2)}</td>
                      <td style={tdStyle}>{signed(o.reading.intervalSquared)}</td>
                      <td style={tdStyle}>{o.reading.speedNeeded.toFixed(2)}c</td>
                      <td style={tdStyle}>
                        {RELATION_NAMES[o.reading.relation]}
                        {i === 0 && <GuessTag />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={smallNote}>
              In the last column, &ldquo;reachable&rdquo; means B is inside the light cone, &ldquo;light only&rdquo; means B is on its edge, and
              &ldquo;unreachable&rdquo; means B is outside it. Your guess ({PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.toLowerCase()}) is
              drawn on the diagram as the white ring.
            </p>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>What this table tells us</p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is:</strong> the time, the distance and the speed that two observers each find between the same two events O
                  and B, and the case each puts B in.
                </li>
                <li>
                  <strong>What it means with the real numbers:</strong> the lab finds {two(part1Result.lab.timeBetween)} s and{' '}
                  {two(part1Result.lab.distanceBetween)} ls, the passing observer {two(part1Result.passing.timeBetween)} s and{' '}
                  {two(part1Result.passing.distanceBetween)} ls. Those differ. But {two(part1Result.lab.timeBetween)}² −{' '}
                  {two(part1Result.lab.distanceBetween)}² = {two(part1Result.lab.intervalSquared)} and {two(part1Result.passing.timeBetween)}² −{' '}
                  {two(part1Result.passing.distanceBetween)}² comes to about {two(part1Result.passing.intervalSquared)}, and the speed needed is{' '}
                  {two(part1Result.lab.speedNeeded)} for the lab and {two(part1Result.passing.speedNeeded)} for the passing observer: different
                  numbers, both below 1.
                </li>
                <li>
                  <strong>Why it matters:</strong> it shows that two observers can disagree about the time, the distance and the speed needed,
                  and still put B in the same case. Why they agree, and what that says about cause and effect, is left to the tutor and to later
                  experiments.
                </li>
                <li>
                  <strong>How sure the numbers are:</strong> they come from a tested calculation (the Lorentz transformation of &ldquo;Moving
                  frames&rdquo;). No instrument measured them. The shown numbers are rounded; the exact value of time² − distance² is{' '}
                  {two(part1Result.lab.intervalSquared)}.
                </li>
              </ul>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the speed of light and the Lorentz transformation. Nothing here
              changes with your guess or with the settings you choose in Part 2.
            </p>

            <Block>
              <ResultsBars rows={observers1} />
              <WhereFrom>
                Calculated here, not measured: the same numbers as the table above, drawn as bars and blocks. Nothing here is imagined.
              </WhereFrom>
              <BarsCaption result={part1Result} part2={false} />
            </Block>

            {part2Done && (
              <Block>
                <ResultsBars rows={observers2} />
                <WhereFrom>
                  Calculated here, not measured, for the event and speed you chose in Part 2. It changes with those settings, not with your guess.
                </WhereFrom>
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
            <LightConesTutor
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
