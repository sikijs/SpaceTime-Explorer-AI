import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  INTERVAL_SCALE_END,
  checkUpRows,
  guessMarkerOnScale,
  intervalFractionOnScale,
  runIntervalExperiment,
} from '../physics/spacetimeInterval'
import type { IntervalExperimentResult, IntervalGuess, ObserverReading } from '../physics/spacetimeInterval'
import { SpacetimeIntervalTutor } from './SpacetimeIntervalTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'

// Spacetime Geometry, Experiment 1, audited to the newer rules (docs/audit/spacetime-geometry/01-draft-wording.md, approved by
// the owner on 2026-11-19 "all defaults"): the page in four Parts, Part 1 fixed on a 0.6c clock and a +0.5c passing observer,
// a side scale with a white YOUR GUESS marker, a check-up table, links, a words box, Start over and a tutor that marks the guess.
// Every number drawn comes from the physics module (src/physics/spacetimeInterval.ts; CLAUDE.md §9). The wording is the
// owner's to approve line by line (CLAUDE.md §28.1).

// Presets are the defaults of Decision 5 in docs/experiments/spacetime-geometry/01-the-interval.md.
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
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const YOURS_PART2_COLOR = '#be185d' // the Part 2 colour: frames the pictures the learner's own speeds draw

type Prediction = IntervalGuess

const CLOCK_SPEED_PRESETS = [0, 0.3, 0.6, 0.9, 0.99]
const PASSING_SPEED_PRESETS = [-0.8, -0.5, 0, 0.5, 0.8]

function passingLabel(speed: number): string {
  if (speed === 0) return 'At rest in the lab'
  return speed > 0 ? `${speed}c, same way as the clock` : `${Math.abs(speed)}c, the opposite way`
}

// Drawing constants (SVG units). The ruler is scaled so the clock's tick 1 always fits.
const VIEW_WIDTH = 460
const VIEW_HEIGHT = 290
const RULER_START_X = 40
const RULER_END_X = 420
const RULER_Y = 150
// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
const ANIMATION_DURATION_MS = 6_000
const CLOCK_COLOR = '#10b981'
const TIME_COLOR = '#38bdf8'
const DISTANCE_COLOR = '#f472b6'
const INTERVAL_COLOR = '#a3e635'

interface SetupDiagramProps {
  clockSpeed: number
  passingSpeed: number
  // null while idle (the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
  // Part 2's pictures are framed in the Part 2 colour and labelled "your speeds".
  yours?: boolean
}

// Draws the setup, and while the run plays the moving clock travelling from tick 0 to tick 1: the lab ruler, the two events, the clock's path and the passing observer.
// It deliberately shows no interval and no other observer's numbers; those come after the run (§12).
export function SetupDiagram({ clockSpeed, passingSpeed, progress, yours = false }: SetupDiagramProps) {
  const { tickOne } = runIntervalExperiment(clockSpeed, passingSpeed)
  const distance = tickOne.position
  const rulerMax = Math.max(1, Math.ceil(distance))
  const scale = (RULER_END_X - RULER_START_X) / rulerMax
  const tickOneX = RULER_START_X + distance * scale
  const marks = Array.from({ length: rulerMax + 1 }, (_, i) => i)
  // Labels start at the square when it is on the left half of the drawing and end at it when it is on the right,
  // so a long label is never cut off by either edge.
  const tickOneAnchor = tickOneX < VIEW_WIDTH / 2 ? 'start' : 'end'
  const tickOneLabelX = tickOneAnchor === 'start' ? tickOneX - 14 : tickOneX + 14
  const sameSpot = distance === 0
  const playing = progress !== null
  // Tick 1 is marked only once the clock reaches it. The clock's own face counts from 0 to 1 second as it goes.
  const showTickOne = !playing || progress >= 1
  const clockX = RULER_START_X + distance * scale * (progress ?? 0)
  // The purple arrow's length follows the passing observer's speed (at 0.5c it is 40 units long).
  const arrowLength = 80 * Math.abs(passingSpeed)

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Setup: a clock moving at ${clockSpeed}c ticks twice, ${distance.toFixed(2)} light-seconds apart in the lab. A passing observer is shown: ${passingLabel(passingSpeed).toLowerCase()}.`}
      style={yours ? { ...SVG_STYLE, border: `3px solid ${YOURS_PART2_COLOR}` } : SVG_STYLE}
    >
      <text x={RULER_START_X} y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The lab's ruler (distance in light-seconds)
      </text>
      {yours && (
        <text x={VIEW_WIDTH - 8} y="18" textAnchor="end" fontSize="11" fontWeight="bold" fill="#f9a8d4">
          your speeds
        </text>
      )}

      {/* The passing observer, above the ruler, with an arrow for the direction of travel. */}
      <rect x={VIEW_WIDTH / 2 - 16} y="34" width="32" height="20" rx="3" fill="#8b5cf6" />
      {passingSpeed !== 0 && (
        <g>
          <line
            x1={VIEW_WIDTH / 2 + (passingSpeed > 0 ? 22 : -22)}
            y1="44"
            x2={VIEW_WIDTH / 2 + (passingSpeed > 0 ? 22 + arrowLength : -(22 + arrowLength))}
            y2="44"
            stroke="#8b5cf6"
            strokeWidth="3"
          />
          <polygon
            points={
              passingSpeed > 0
                ? `${VIEW_WIDTH / 2 + 28 + arrowLength},44 ${VIEW_WIDTH / 2 + 18 + arrowLength},39 ${VIEW_WIDTH / 2 + 18 + arrowLength},49`
                : `${VIEW_WIDTH / 2 - 28 - arrowLength},44 ${VIEW_WIDTH / 2 - 18 - arrowLength},39 ${VIEW_WIDTH / 2 - 18 - arrowLength},49`
            }
            fill="#8b5cf6"
          />
        </g>
      )}
      <text x={VIEW_WIDTH / 2} y="72" textAnchor="middle" fontSize="11" fill={TEXT_COLOR}>
        Passing observer: {passingLabel(passingSpeed).toLowerCase()}
      </text>

      {/* The ruler. */}
      <line x1={RULER_START_X} y1={RULER_Y} x2={RULER_END_X} y2={RULER_Y} stroke={MUTED_COLOR} strokeWidth="3" />
      {marks.map((m) => (
        <g key={m}>
          <line
            x1={RULER_START_X + m * scale}
            y1={RULER_Y - 6}
            x2={RULER_START_X + m * scale}
            y2={RULER_Y + 6}
            stroke={TICK_COLOR}
            strokeWidth="2"
          />
          <text x={RULER_START_X + m * scale} y={RULER_Y + 22} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
            {m}
          </text>
        </g>
      ))}

      {/* The clock's path between the two events. */}
      {!sameSpot && (
        <line x1={RULER_START_X} y1={RULER_Y} x2={tickOneX} y2={RULER_Y} stroke="#f59e0b" strokeWidth="5" />
      )}

      {/* Event: tick 0. */}
      <rect x={RULER_START_X - 14} y={RULER_Y - 36} width="28" height="20" rx="3" fill="#3b82f6" />
      <text x={RULER_START_X} y={RULER_Y - 44} textAnchor="start" fontSize="11" fill={TEXT_COLOR}>
        Tick 0: the clock at the lab's start
      </text>

      {showTickOne && (
        <g>
          {/* Event: tick 1. */}
          <rect
            x={tickOneX - 14}
            y={RULER_Y + 34}
            width="28"
            height="20"
            rx="3"
            fill="#f59e0b"
          />
          <text x={tickOneLabelX} y={RULER_Y + 70} textAnchor={tickOneAnchor} fontSize="11" fill={TEXT_COLOR}>
            Tick 1: one second later by the clock's own face
          </text>
          <text x={tickOneLabelX} y={RULER_Y + 85} textAnchor={tickOneAnchor} fontSize="11" fill={TEXT_COLOR}>
            {sameSpot ? '(the clock is at rest, so the same spot)' : `(${distance.toFixed(2)} light-seconds along the lab's ruler)`}
          </text>
        </g>
      )}

      {/* The moving clock, drawn only during and after the playback; before it, the blue square stands for the clock. */}
      {playing && (
        <g>
          <rect x={clockX - 10} y={RULER_Y - 10} width="20" height="20" rx="3" fill={CLOCK_COLOR} stroke="#0b1020" strokeWidth="2" />
          <rect x={RULER_START_X} y="262" width="12" height="12" rx="2" fill={CLOCK_COLOR} />
          <text x={RULER_START_X + 18} y="272" fontSize="11" fill={TEXT_COLOR}>
            The moving clock: its own face reads {progress.toFixed(2)} seconds
          </text>
        </g>
      )}
    </svg>
  )
}

interface ObserverRow {
  name: string
  reading: ObserverReading
}

// Bar sizes (SVG units) for the results drawing. Time and distance bars share one scale; the
// time² − distance² bar is the same fixed length for every observer, so any change in it would show as a change in length.
const BARS_VIEW_HEIGHT = 300
const BARS_VIEW_WIDTH = 660
// The side scale (time² − distance² on its own scale, 0 to INTERVAL_SCALE_END), one small track per row.
const SIDE_LEFT = 480
const SIDE_RIGHT = 640
const BAR_START_X = 10
const BAR_MAX_LENGTH = 200
const INTERVAL_BAR_X = 330
const INTERVAL_BAR_LENGTH = 100
const ROW_HEIGHT = 80
const ROWS_TOP = 36

export function ResultsBars({
  rows,
  result,
  guess,
  yours = false,
}: {
  rows: ObserverRow[]
  result: IntervalExperimentResult
  // The learner's guess (Part 1 only); null draws no white mark.
  guess: Prediction | null
  yours?: boolean
}) {
  const sideX = (fraction: number) => SIDE_LEFT + fraction * (SIDE_RIGHT - SIDE_LEFT)
  const trackY = (i: number) => ROWS_TOP + i * ROW_HEIGHT + 37
  const marker = guess ? guessMarkerOnScale(result, guess) : null
  const guessText: Record<Prediction, string> = { bigger: 'bigger in the lab', same: 'the same in both', smaller: 'smaller in the lab' }
  const haloText = { stroke: '#0b1020', strokeWidth: 4, paintOrder: 'stroke' } as const
  // Time is never shorter than distance (|distance| < time for a clock's ticks), so the longest time sets the scale.
  const longest = Math.max(...rows.flatMap((r) => [r.reading.timeBetween, Math.abs(r.reading.distanceBetween)]))
  const lengthOf = (value: number) => (Math.abs(value) / longest) * BAR_MAX_LENGTH

  return (
    <svg
      viewBox={`0 0 ${BARS_VIEW_WIDTH} ${BARS_VIEW_HEIGHT}`}
      role="img"
      aria-label={`Bars of the time, the distance and time squared minus distance squared that each of the three observers found. ${rows
        .map((r) => `${r.name}: time ${r.reading.timeBetween.toFixed(2)}, distance ${Math.abs(r.reading.distanceBetween).toFixed(2)}, time squared minus distance squared ${r.reading.intervalSquared.toFixed(2)}`)
        .join('. ')}.${marker ? ` Your guess is drawn as a white marker, ${guessText[marker.guess]}, beside the real values on the side scale.` : ''}`}
      style={yours ? { ...SVG_STYLE, border: `3px solid ${YOURS_PART2_COLOR}` } : SVG_STYLE}
    >
      <text x={BAR_START_X} y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Time and distance (one scale)
      </text>
      <text x={INTERVAL_BAR_X} y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        time² − distance²
      </text>
      <text x={SIDE_LEFT} y="13" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        time² − distance²
      </text>
      <text x={SIDE_LEFT} y="26" fontSize="11" fill={TEXT_COLOR}>
        on its own scale
      </text>
      {yours && (
        <text x={BARS_VIEW_WIDTH - 8} y={BARS_VIEW_HEIGHT - 10} textAnchor="end" fontSize="11" fontWeight="bold" fill="#f9a8d4">
          your speeds
        </text>
      )}
      {rows.map((row, i) => {
        const y = ROWS_TOP + i * ROW_HEIGHT
        const distance = Math.abs(row.reading.distanceBetween)
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
            {/* The side scale: the same number on a scale of its own, 0 to INTERVAL_SCALE_END. */}
            <line x1={SIDE_LEFT} y1={trackY(i)} x2={SIDE_RIGHT} y2={trackY(i)} stroke={MUTED_COLOR} strokeWidth="3" />
            {Array.from({ length: INTERVAL_SCALE_END + 1 }, (_, t) => (
              <g key={t}>
                <line x1={sideX(intervalFractionOnScale(t))} y1={trackY(i) - 5} x2={sideX(intervalFractionOnScale(t))} y2={trackY(i) + 5} stroke={TICK_COLOR} />
                <text x={sideX(intervalFractionOnScale(t))} y={trackY(i) + 20} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
                  {t}
                </text>
              </g>
            ))}
            <circle cx={sideX(intervalFractionOnScale(row.reading.intervalSquared))} cy={trackY(i)} r="6" fill={INTERVAL_COLOR} />
            <text
              x={sideX(intervalFractionOnScale(row.reading.intervalSquared)) + 10}
              y={trackY(i) + 20}
              fontSize="11"
              fill={INTERVAL_COLOR}
              {...haloText}
            >
              {row.reading.intervalSquared.toFixed(2)}
            </text>
            <rect x={INTERVAL_BAR_X} y={y + 20} width={INTERVAL_BAR_LENGTH} height="34" rx="2" fill={INTERVAL_COLOR} />
            <text x={INTERVAL_BAR_X + INTERVAL_BAR_LENGTH / 2} y={y + 42} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0b1020">
              {row.reading.intervalSquared.toFixed(2)}
            </text>
          </g>
        )
      })}
      {marker && (
        <g>
          {/* The white guess mark: a marker only. Its position is set against the clock-frame row's real value (row 2), joined by a thin dashed line. */}
          <line x1={sideX(marker.markerFraction)} y1={trackY(0)} x2={sideX(intervalFractionOnScale(marker.clockFrameValue))} y2={trackY(1)} stroke={GUESS_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1={sideX(marker.markerFraction)} y1={60} x2={sideX(marker.markerFraction)} y2={trackY(0) - 8} stroke={GUESS_COLOR} strokeWidth="2" />
          <rect
            x={Math.min(Math.max(sideX(marker.markerFraction) - 70, SIDE_LEFT - 10), BARS_VIEW_WIDTH - 150)}
            y={30}
            width="140"
            height="30"
            rx="4"
            fill="#0b1020"
            stroke={GUESS_COLOR}
            strokeWidth="2"
          />
          <text x={Math.min(Math.max(sideX(marker.markerFraction) - 70, SIDE_LEFT - 10), BARS_VIEW_WIDTH - 150) + 70} y={43} textAnchor="middle" fontSize="11" fontWeight="bold" fill={GUESS_COLOR}>
            YOUR GUESS
          </text>
          <text x={Math.min(Math.max(sideX(marker.markerFraction) - 70, SIDE_LEFT - 10), BARS_VIEW_WIDTH - 150) + 70} y={55} textAnchor="middle" fontSize="10" fill={GUESS_COLOR}>
            {guessText[marker.guess]}
          </text>
          <circle cx={sideX(marker.markerFraction)} cy={trackY(0)} r="9" fill="none" stroke={GUESS_COLOR} strokeWidth="3" />
        </g>
      )}
      <text x={BAR_START_X} y={BARS_VIEW_HEIGHT - 10} fontSize="10" fill={MUTED_COLOR}>
        s = seconds, ls = light-seconds. The longest time or distance bar here is {longest.toFixed(2)}.
      </text>
    </svg>
  )
}

// ---- Wording and small pieces ----

// Part 1 is fixed on the worked case of the specification and its tests: a 0.6c clock and a +0.5c passing observer.
export const PART1_CLOCK_SPEED = 0.6
export const PART1_PASSING_SPEED = 0.5
const PART2_DEFAULT_CLOCK_SPEED = 0.9
const PART2_DEFAULT_PASSING_SPEED = -0.5

// Pages fetched and read on 19 November 2026 (draft wording, section 2). No plain official page was found for the spacetime
// interval itself (CLAUDE.md §29 rule 3(c)); the introduction and the words box define it in plain words.
const LINKS = [
  {
    href: 'https://en.wikisource.org/wiki/Space_and_Time_(Saha)',
    label: 'Minkowski, "Space and Time" (1908), English translation by Meghnad Saha (1920), on Wikisource',
    what: 'the original lecture in which Minkowski joined space and time into one. Hard going, but its opening is short and readable.',
  },
  {
    href: 'https://phys.libretexts.org/Bookshelves/Conceptual_Physics/Conceptual_Physics_(Crowell)/08:_Relativity/8.02:_Distortion_of_Space_and_Time',
    label: 'Benjamin Crowell, Conceptual Physics, section 8.2, "Distortion of Space and Time" (on LibreTexts)',
    what: 'a college textbook page that defines the interval as time² − distance² (with c set to 1), works an example with two observers (13² − 11² = 48 for one, 8² − 4² = 48 for the other) and explains why the number is the same for both.',
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

const two = (value: number) => Math.abs(value).toFixed(2)

// The "Words and formulas" box. The interval names and the formula show the answer to the prediction, so they appear only after the
// Part 1 run has finished (CLAUDE.md §12). Their numbers come from the physics module (CLAUDE.md §9).
export function referenceEntries(done: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Event', meaning: 'something that happens at one place at one moment: a clock ticking, a flash going off, a ball landing.' },
    { term: 'Observer', meaning: 'someone, or something, that measures events from their own position and motion.' },
    { term: 'The lab', meaning: 'the observer for whom the lab itself stands still. The clock moves past the lab.' },
    { term: 'At rest', meaning: 'not moving compared with the observer you are talking about.' },
    { term: 'Light-second', meaning: 'the distance light travels in one second, exactly 299,792,458 meters (about 300,000 kilometers). Measuring distance this way puts it in the same units as time.' },
    { term: 'c', meaning: 'the speed of light. 0.6c is six-tenths of that speed.' },
    { term: 'Time between', meaning: 'how many seconds an observer finds between two events.' },
    { term: 'Distance between', meaning: "how many light-seconds an observer finds between two events, measured in that observer's own frame." },
    { term: 'time² − distance²', meaning: 'multiply the time by itself, multiply the distance by itself, subtract the second from the first.' },
  ]
  if (done) {
    const r = runIntervalExperiment(PART1_CLOCK_SPEED, PART1_PASSING_SPEED)
    entries.push(
      { term: 'Interval squared', meaning: 'the name of that number, time² − distance².' },
      { term: 'Interval', meaning: 'the square root of the interval squared.' },
      {
        term: 'Formula',
        meaning: `time² − distance². Worked example from this page, for the lab at ${PART1_CLOCK_SPEED}c: the time between the ticks is ${two(r.lab.timeBetween)} s and the distance is ${two(r.lab.distanceBetween)} ls, so ${two(r.lab.timeBetween)} × ${two(r.lab.timeBetween)} − ${two(r.lab.distanceBetween)} × ${two(r.lab.distanceBetween)} = ${(r.lab.timeBetween ** 2).toFixed(4)} − ${(r.lab.distanceBetween ** 2).toFixed(4)} = ${two(r.lab.intervalSquared)}. For the clock itself: ${two(r.clockFrame.timeBetween)} × ${two(r.clockFrame.timeBetween)} − ${two(r.clockFrame.distanceBetween)} × ${two(r.clockFrame.distanceBetween)} = ${two(r.clockFrame.intervalSquared)}.`,
      },
    )
  }
  return entries
}

const GUESS_LABEL: Record<Prediction, string> = {
  bigger: 'Bigger in the lab',
  same: 'The same in both',
  smaller: 'Smaller in the lab',
}

// ---- Captions ----

export function SetupCaption({ part2 }: { part2: boolean }) {
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this diagram.</strong> The drawing is from the lab&rsquo;s point of view. Everything is placed using the
        lab&rsquo;s own ruler.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The grey line</strong> is the lab&rsquo;s ruler. Its numbers are distances in light-seconds, measured from the start
          of the ruler. If a mark says 2, it is 2 light-seconds, about 600,000 kilometers, from the start.
        </li>
        <li>
          <strong style={{ color: '#3b82f6' }}>Blue square (tick 0):</strong> the first event. The moving clock ticks for the first
          time at the start of the ruler.
        </li>
        <li>
          <strong style={{ color: '#f59e0b' }}>Orange square (tick 1):</strong> the second event. It sits where the lab finds the clock
          when the clock&rsquo;s own face shows that one second has passed since tick 0. The orange line along the ruler is the
          distance the clock has covered between the two events, as the lab measures it. For example, at 0.6c the orange square lands
          0.75 light-seconds along the ruler. At 0c the clock does not move, so there is no orange line, and tick 1 is at the same
          spot as tick 0.
        </li>
        <li>
          <strong style={{ color: '#10b981' }}>Green square (the moving clock):</strong> appears when you press Run. It travels along
          the ruler from tick 0 to tick 1. The line beneath the drawing shows the number on the clock&rsquo;s own face as it goes,
          counting up to one second.
        </li>
        <li>
          <strong style={{ color: '#8b5cf6' }}>Purple square (the passing observer):</strong> the third observer. The arrow shows which
          way they move relative to the lab, and its length follows their speed: a longer arrow means a faster observer. No arrow means
          they are at rest in the lab. In this drawing they are only shown, not moved.
        </li>
      </ul>
      <p style={{ margin: 0 }}>
        <strong>What to look for.</strong>{' '}
        {part2
          ? 'Change the clock’s speed and watch where tick 1 lands: the faster the clock, the farther along the ruler it is. Change the passing observer’s speed and watch the purple arrow change direction and length. The drawing only sets up the two events. The measurements each observer makes of them appear after you run.'
          : 'Watch where tick 1 lands: at 0.6c it is 0.75 light-seconds along the ruler. The drawing only sets up the two events. The measurements each observer makes of them appear after you run.'}
      </p>
    </div>
  )
}

export function ResultsCaption({ result, guess, part2 }: { result: IntervalExperimentResult; guess: boolean; part2: boolean }) {
  const { lab, clockFrame } = result
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read the results picture.</strong> Three observers each measured the same two ticks of the clock. Each observer
        gets one row, and the rows are in the same order as the table in Part 3. The picture shows the same numbers as the table, as lengths.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong style={{ color: TIME_COLOR }}>Blue bar (time):</strong> the time that observer found between the two ticks, in
          seconds (&ldquo;s&rdquo;). A longer bar means more time.
        </li>
        <li>
          <strong style={{ color: DISTANCE_COLOR }}>Pink bar (distance):</strong> how far apart that observer found the two ticks, in
          light-seconds (&ldquo;ls&rdquo;; one light-second is the distance light travels in one second). No pink bar means the
          observer found both ticks at the same place, as an observer does for whom the clock is at rest. The blue and pink bars share
          one scale, set by the longest bar, which is named at the bottom. A very long bar for one observer can make the others look
          short, but their labels still give the exact numbers.
        </li>
        <li>
          <strong style={{ color: INTERVAL_COLOR }}>Green block (time² − distance²):</strong> the number you were asked about, worked
          out for each observer from their own two numbers. The blocks are all the same length on purpose: their length is not the
          size of the number. Read the number written in the block.
        </li>
        <li>
          <strong>The side scale (on the right):</strong> the same three numbers on a scale of their own, from 0 to 2, one small track
          for each row, so that they can be compared by position. Each <strong style={{ color: INTERVAL_COLOR }}>lime dot</strong> is a
          real value.
        </li>
        {guess && (
          <li>
            <strong style={{ color: GUESS_COLOR }}>The white mark and the YOUR GUESS box:</strong> your guess, placed beside the real
            values on the side scale and joined by a thin dashed line to the clock&rsquo;s own row. <strong>It is only a marker.</strong>{' '}
            &ldquo;Bigger&rdquo;, &ldquo;the same&rdquo; and &ldquo;smaller&rdquo; have no size of their own, so the mark sits above,
            on and below 1.00 (at 1.50, 1.00 and 0.50). Its position is not a number you guessed, and it never moves the real values.
          </li>
        )}
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>A worked moment.</strong>{' '}
        {part2
          ? `In this run the lab finds ${two(lab.timeBetween)} s between the ticks and ${two(lab.distanceBetween)} ls, and the clock's own frame finds ${two(clockFrame.timeBetween)} s and ${two(clockFrame.distanceBetween)} ls. The green number for each row is on the right of its block.`
          : `At ${result.clockSpeed}c the lab finds ${two(lab.timeBetween)} s between the ticks and ${two(lab.distanceBetween)} ls. So ${two(lab.timeBetween)} × ${two(lab.timeBetween)} − ${two(lab.distanceBetween)} × ${two(lab.distanceBetween)} = ${(lab.timeBetween ** 2).toFixed(4)} − ${(lab.distanceBetween ** 2).toFixed(4)} = ${two(lab.intervalSquared)}. The clock's own frame finds ${two(clockFrame.timeBetween)} s and ${two(clockFrame.distanceBetween)} ls: ${two(clockFrame.timeBetween)} × ${two(clockFrame.timeBetween)} − ${two(clockFrame.distanceBetween)} × ${two(clockFrame.distanceBetween)} = ${two(clockFrame.intervalSquared)}.`}
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          part2
            ? {
                look: 'the three green numbers in each run, and in "Runs so far".',
                means: 'the observers’ times and distances change with the speeds you chose, and the green number for each of them is what it is.',
                matters: 'it lets you see whether what you found in Part 1 still holds at other speeds.',
              }
            : {
                look: 'the blue and pink bars of the lab row and of the clock’s own row.',
                means: `the lab finds more time (${two(lab.timeBetween)} s against ${two(clockFrame.timeBetween)} s) and some distance (${two(lab.distanceBetween)} ls against ${two(clockFrame.distanceBetween)} ls).`,
                matters: 'the two observers disagree about both numbers, which is the starting point of the question.',
              },
          {
            look: 'the three lime dots on the side scale and the numbers beside them.',
            means: 'the number time² − distance² for each observer.',
            matters: 'it puts the number you were asked about side by side for all three observers, so you can see whether the observers disagree about it.',
          },
          ...(guess
            ? [
                {
                  look: 'the white YOUR GUESS mark and the lab row’s lime dot.',
                  means: 'where your guess sits against the real number for the lab.',
                  matters: 'it sets what you expected beside what was found. Which explanation is right is left to the tutor.',
                },
              ]
            : []),
        ]}
      />
    </div>
  )
}

// ---- Playback ----

// The playback is only presentation: its length does not change the result (CLAUDE.md §11).
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

export function observersOf(result: IntervalExperimentResult): ObserverRow[] {
  return [
    { name: 'The lab', reading: result.lab },
    { name: "The moving clock itself (the clock's own frame)", reading: result.clockFrame },
    { name: 'The passing observer', reading: result.passing },
  ]
}

interface RunRecord {
  clockSpeed: number
  passingSpeed: number
}

interface SpacetimeIntervalExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function SpacetimeIntervalExperiment({ onComplete, onTutorComplete }: SpacetimeIntervalExperimentProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [clockSpeed, setClockSpeed] = useState(PART2_DEFAULT_CLOCK_SPEED)
  const [passingSpeed, setPassingSpeed] = useState(PART2_DEFAULT_PASSING_SPEED)
  // The speeds of the Part 2 run being shown (chosen when Run your speeds is pressed), and every finished Part 2 run.
  const [part2Speeds, setPart2Speeds] = useState<RunRecord>({ clockSpeed: PART2_DEFAULT_CLOCK_SPEED, passingSpeed: PART2_DEFAULT_PASSING_SPEED })
  const [part2Runs, setPart2Runs] = useState<RunRecord[]>([])
  const part1 = useRun(onComplete)
  const part2 = useRun()

  // The real results never read the prediction (CLAUDE.md §14, "Predictions and the Real Results").
  const part1Result = useMemo(() => runIntervalExperiment(PART1_CLOCK_SPEED, PART1_PASSING_SPEED), [])
  const part2Result = useMemo(() => runIntervalExperiment(part2Speeds.clockSpeed, part2Speeds.passingSpeed), [part2Speeds])

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
    setPart2Speeds({ clockSpeed, passingSpeed })
    part2.start()
  }

  // Record each finished Part 2 run once.
  useEffect(() => {
    if (part2Done) setPart2Runs((runs) => [...runs, part2Speeds])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [part2Done])

  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setPrediction(null)
    setClockSpeed(PART2_DEFAULT_CLOCK_SPEED)
    setPassingSpeed(PART2_DEFAULT_PASSING_SPEED)
    setPart2Speeds({ clockSpeed: PART2_DEFAULT_CLOCK_SPEED, passingSpeed: PART2_DEFAULT_PASSING_SPEED })
    setPart2Runs([])
  }

  const observers1 = observersOf(part1Result)
  const observers2 = observersOf(part2Result)
  const checkUp = checkUpRows(part1Result)
  const observerNames = { lab: 'The lab', clockFrame: 'The moving clock itself', passing: 'The passing observer' }
  const tdStyle = { padding: '0.3rem 1rem 0.3rem 0' } as const

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 1 — The Interval: One Number Everyone Agrees On</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: approved wording of docs/audit/spacetime-geometry/01-draft-wording.md (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Imagine you are on a train and drop a ball. You see it fall straight down, so for you it
            landed in the same spot it was dropped. Someone on the platform sees the train carry the ball forward as it falls, so for
            them it landed many meters from where it was dropped. You and the platform observer disagree about how far apart those two
            events were: the dropping and the landing. Earlier experiments showed that moving observers can also disagree about how
            much time passed between two events. So observers can differ on both the time and the distance. That raises the question
            this experiment explores: when two observers disagree on both numbers, is there still some way of combining their own two
            numbers that gives the same answer for everyone? Or is everything about two events up to each observer&rsquo;s point of
            view?
          </p>
          <p style={paragraph}>
            <strong>Some words we will use.</strong> An <strong>event</strong> is something that happens at one place at one moment: a
            clock ticking, a flash of light going off, a ball landing. Two events have a time between them and a distance between
            them. We measure distance in <strong>light-seconds</strong>: one light-second is the distance light travels in one second,
            about 300,000 kilometers. Measuring distance this way puts it in the same units as time, so the two can be compared
            directly.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> A clock moves past the lab at a steady speed. It ticks once every second of its own face, as
            the moving clock did in the first chapter. Two of its ticks are our two events: tick 0, and tick 1 one second later by the
            clock&rsquo;s own face. Three observers will each measure the same two events. The first is the lab, which sees the clock
            move. The second is the clock itself, for which the clock is simply at rest. The third is a passing observer who moves past
            the lab. Each observer reports two numbers: the time between the two ticks and the distance between them. In Part 1 the
            clock moves at {PART1_CLOCK_SPEED}c and the passing observer at {PART1_PASSING_SPEED}c in the same direction. (&ldquo;0.6c&rdquo;
            means six-tenths of the speed of light.) The prediction is about a number you can make from any observer&rsquo;s two
            readings, using one fixed recipe: <em>square the time, square the distance, then subtract the second from the first</em>.
            For example, an observer who reads a time of 5 seconds and a distance of 3 light-seconds gets 5 &times; 5 = 25, then
            3 &times; 3 = 9, then 25 &minus; 9 = 16. You will not calculate it yourself. You only predict how the lab&rsquo;s number
            compares with the clock&rsquo;s own: bigger in the lab, the same in both, or smaller in the lab. Then run it and look at
            the numbers all three observers find. In Part 2 you choose both speeds yourself.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Predict how the lab&rsquo;s number compares with the clock&rsquo;s own, then press Run and watch.
            Guesses are not scored. Then try other speeds in Part 2, and talk it over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guess and the real pictures.</strong> Your guess never changes the real pictures, the table or the numbers:
            they come from a calculation that knows nothing about what you guessed. Your guess is drawn on the results picture in
            white, in a box labelled YOUR GUESS, and it is shown again beside the results. In Part 2 the speeds you choose do change
            the drawings, and the marks they move are in the Part 2 colour.
          </p>
          <p style={paragraph}>
            <strong>Space and time as one thing.</strong> In everyday life we keep space and time apart. Space is <em>where</em>{' '}
            something is, measured in meters or kilometers. Time is <em>when</em> it happens, measured in seconds or hours. We use two
            different rulers, one for each. Yet to pin down an event you need both. &ldquo;Meet me at the station&rdquo; is not enough.
            You also need &ldquo;at 3 o&rsquo;clock&rdquo;. A ball landing, a clock ticking and a flash of light each have a place
            and a moment.
          </p>
          <p style={paragraph}>
            In 1908 the mathematician Hermann Minkowski told a conference: &ldquo;Henceforth, the old conception of space for itself,
            and time for itself shall reduce to a mere shadow, and some sort of union of the two will be found consistent with
            facts.&rdquo; In plain words, he was saying that space on its own and time on its own are only shadows. A shadow shows
            only part of an object, and its shape changes as the light moves. In the same way, the time between two events and the
            distance between them each change depending on who is measuring. What is real, he said, is some kind of combination of
            the two. Minkowski gave this talk three years after Einstein&rsquo;s first paper on relativity. He had been Einstein&rsquo;s
            mathematics teacher, and he was the first to see that Einstein&rsquo;s results could be described as a single &ldquo;space
            and time&rdquo; taken together, now called <strong>spacetime</strong>.
          </p>
          <p style={paragraph}>
            This experiment looks at one small piece of that idea. It does not try to explain all of spacetime. It asks only this: for
            the same two events, can we build one number from the time between them and the distance between them, so that we can ask
            whether different observers find the same number or different numbers? You will make the prediction, see the real
            numbers, and then the tutor will help you work out what they mean.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning:
            event, observer, the lab, at rest, light-second, c, time between, distance between, time² − distance², interval squared,
            interval.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What we assume.</strong> Space is flat, with no gravity. Every speed stays steady, and everything moves along one
            line. Speeds are given as a fraction of <strong>c</strong>, the speed of light.
          </p>
        </div>

        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Checked on 19 November 2026. Each link opens in a new tab. This page has no real
            experimental result; the first link is the original lecture behind the idea. No plain page from NASA, ESA or a similar
            official source was found for the spacetime interval itself, so none is listed.
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
          First you guess how the lab&rsquo;s number compares with the clock&rsquo;s own. Then you press Run. A clock moving at{' '}
          {PART1_CLOCK_SPEED}c ticks twice, and the picture sets the two ticks along the lab&rsquo;s ruler. When the run ends, a
          results picture appears, with your guess drawn on it in white.
        </PartHeader>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What &ldquo;time² − distance²&rdquo; means.</strong> Take the time between two events, in seconds. Take the distance
            between them, in light-seconds. Multiply each number by itself, then subtract the distance result from the time result. For
            example, if two events are 3 seconds apart in time and 2 light-seconds apart in space, then 3 × 3 = 9, 2 × 2 = 4, and 9 − 4
            = 5. Each observer can work out this number for the same two events from their own measurements.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why this recipe?</strong> Each piece has a plain reason.
          </p>
          <ul style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Both numbers in the same units.</strong> Time is in seconds and distance is in light-seconds, so the two can be
              put into one sum. You cannot sensibly combine seconds with kilometers, just as you cannot add hours to meters.
            </li>
            <li>
              <strong>Squaring.</strong> A distance can be counted as positive or negative depending on which way you measure along
              the line. Squaring removes that, so only how far apart the events are matters, not which way you faced. For example,
              2 × 2 = 4 and (−2) × (−2) = 4.
            </li>
            <li>
              <strong>Subtracting.</strong> If you were combining two distances, such as the east and north parts of a walk, you would
              add the squares. Time and distance are different kinds of thing, so this experiment tries subtracting instead. This is
              the combination that physicists have used since Minkowski&rsquo;s time. The experiment does not prove here that it is
              the right one to use. It tests what this recipe gives for three different observers, and the tutor afterwards helps
              you see what the numbers say.
            </li>
          </ul>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            The clock moves at {PART1_CLOCK_SPEED}c. Each observer takes their own time between the two ticks and their own distance
            between them, and works out time² − distance². How will the lab&rsquo;s number compare with the clock&rsquo;s own?
          </p>
          <div>
            {(Object.keys(GUESS_LABEL) as Prediction[]).map((choice) => (
              <button
                key={choice}
                type="button"
                disabled={locked}
                onClick={() => setPrediction(choice)}
                className={`toggle-button${prediction === choice ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: locked ? 0.6 : 1 }}
              >
                {GUESS_LABEL[choice]}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            {prediction !== null
              ? `Your prediction: ${GUESS_LABEL[prediction].toLowerCase()}.${locked ? ' Your prediction is locked while you try other speeds. To change it, press Start over.' : ''}`
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
          <SetupDiagram clockSpeed={PART1_CLOCK_SPEED} passingSpeed={PART1_PASSING_SPEED} progress={part1.status === 'idle' ? null : part1.progress} />
          <WhereFrom>
            Calculated here, not measured: the two ticks and their places on the ruler come from the clock&rsquo;s speed and the time
            dilation factor of &ldquo;A moving clock&rdquo;. No instrument measured them and nothing here is imagined.
          </WhereFrom>
          <SetupCaption part2={false} />
        </Block>

        {part1Done && prediction !== null ? (
          <Block>
            <ResultsBars rows={observers1} result={part1Result} guess={prediction} />
            <WhereFrom>
              Calculated here, not measured: each observer&rsquo;s time and distance are worked out from the clock&rsquo;s speed using the
              Lorentz transformation of &ldquo;Moving frames&rdquo; and the time dilation factor of &ldquo;A moving clock&rdquo;;
              time² − distance² is then worked out from them. No instrument measured them and nothing here is imagined. The white mark is
              only your guess, placed beside the real values on the side scale.
            </WhereFrom>
            <ResultsCaption result={part1Result} guess part2={false} />
          </Block>
        ) : (
          <p style={smallNote}>
            {part1Running ? 'The results picture will appear when the run ends.' : 'After you press Run, a results picture for the three observers will appear here when the run ends.'}
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the clock&rsquo;s speed and the passing observer&rsquo;s speed, and run it again. The speeds you choose
              change the pictures in this Part. They do not change Part 1&rsquo;s pictures, the results in Part 3, or your guess.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Clock speed</label>
              <div style={{ marginBottom: '1rem' }}>
                {CLOCK_SPEED_PRESETS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    disabled={part2Running}
                    onClick={() => setClockSpeed(speed)}
                    className={`toggle-button${clockSpeed === speed ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {speed === 0 ? '0c (at rest)' : `${speed}c`}
                  </button>
                ))}
              </div>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Passing observer&rsquo;s speed</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                Measured from the lab. A positive speed is the same direction the clock moves; a negative speed is the opposite
                direction.
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
                    {speed === 0 ? '0c (at rest in the lab)' : `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`}
                  </button>
                ))}
              </div>
              <p style={smallNote}>Your guess does not change these drawings, but the speeds you choose do.</p>
              <button
                type="button"
                className="action-button"
                onClick={handleRunPart2}
                disabled={part1Running || part2Running}
                style={{ marginTop: '0.75rem', padding: '0.6rem 1.5rem' }}
              >
                {part2Running ? 'Running...' : 'Run your speeds'}
              </button>
            </div>

            {part2.status === 'idle' ? (
              <p style={smallNote}>Not run yet. Choose both speeds and press Run your speeds; the pictures for your speeds will appear here.</p>
            ) : (
              <Block>
                <SetupDiagram clockSpeed={part2Speeds.clockSpeed} passingSpeed={part2Speeds.passingSpeed} progress={part2.progress} yours />
                <WhereFrom>
                  Calculated here, not measured, for the speeds you chose: the two ticks and their places on the ruler come from the
                  clock&rsquo;s speed and the time dilation factor of &ldquo;A moving clock&rdquo;. Nothing here is imagined.
                </WhereFrom>
                <SetupCaption part2 />
                {part2Done && (
                  <div style={{ marginTop: '1rem' }}>
                    <ResultsBars rows={observers2} result={part2Result} guess={null} yours />
                    <WhereFrom>
                      Calculated here, not measured, for the speeds you chose: worked out with the Lorentz transformation of
                      &ldquo;Moving frames&rdquo; and the time dilation factor of &ldquo;A moving clock&rdquo;. Your guess is not
                      redrawn here: it was a guess for the Part 1 run.
                    </WhereFrom>
                    <ResultsCaption result={part2Result} guess={false} part2 />
                  </div>
                )}
              </Block>
            )}

            {part2Runs.length > 0 && (
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Runs so far</p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {part2Runs.map((run, i) => {
                    const r = runIntervalExperiment(run.clockSpeed, run.passingSpeed)
                    return (
                      <li key={i}>
                        {run.clockSpeed}c clock, {run.passingSpeed}c observer: lab {two(r.lab.intervalSquared)} · clock {two(r.clockFrame.intervalSquared)} · passing {two(r.passing.intervalSquared)}
                      </li>
                    )
                  })}
                </ul>
                <p style={smallNote}>Each number is time² − distance² for that observer.</p>
              </div>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && prediction !== null && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guess beside them. Nothing in this Part changes with your guess or with
              the speeds you choose in Part 2.
            </PartHeader>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              The clock moved at {part1Result.clockSpeed}c and the passing observer at {part1Result.passingObserverSpeed}c, both measured
              from the lab.
            </p>

            <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '0.95rem' }}>Check-up</p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['Observer', 'What we would expect', 'What was found', 'A plain reading'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {checkUp.map((row) => (
                    <tr key={row.observer}>
                      <td style={tdStyle}>{observerNames[row.observer]}</td>
                      <td style={tdStyle}>{two(row.expected)} (the clock&rsquo;s own face reads 1 second between its ticks, so its time² − distance² is 1 × 1 = 1)</td>
                      <td style={tdStyle}>{two(row.found)}</td>
                      <td style={tdStyle}>{row.reading}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p style={{ margin: '0.5rem 0', fontWeight: 'bold', fontSize: '0.95rem' }}>The three observers&rsquo; numbers</p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
                <thead>
                  <tr>
                    {['Observer', 'Time between the ticks (seconds)', 'Distance between the ticks (light-seconds)', 'time² − distance²'].map((h) => (
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
                      <td style={tdStyle}>
                        {o.reading.intervalSquared.toFixed(2)}
                        {i === 0 && <GuessTag />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={smallNote}>
              Your guess is drawn on the results picture as the white mark ({GUESS_LABEL[prediction].toLowerCase()}), beside the lab
              row&rsquo;s number.
            </p>

            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>What this table tells us</p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is:</strong> the three observers&rsquo; time and distance between the same two ticks, and the number
                  worked out from each pair.
                </li>
                <li>
                  <strong>What it means with the real numbers:</strong> the lab finds {two(part1Result.lab.timeBetween)} s and{' '}
                  {two(part1Result.lab.distanceBetween)} ls, the clock finds {two(part1Result.clockFrame.timeBetween)} s and{' '}
                  {two(part1Result.clockFrame.distanceBetween)} ls, and the passing observer finds {two(part1Result.passing.timeBetween)} s
                  and {two(part1Result.passing.distanceBetween)} ls. Those differ. But {two(part1Result.lab.timeBetween)}² −{' '}
                  {two(part1Result.lab.distanceBetween)}² = {two(part1Result.lab.intervalSquared)}, {two(part1Result.clockFrame.timeBetween)}² −{' '}
                  {two(part1Result.clockFrame.distanceBetween)}² = {two(part1Result.clockFrame.intervalSquared)}, and{' '}
                  {two(part1Result.passing.timeBetween)}² − {two(part1Result.passing.distanceBetween)}² comes to about{' '}
                  {two(part1Result.passing.intervalSquared)} (the shown numbers are rounded).
                </li>
                <li>
                  <strong>Why it matters:</strong> it shows that the three observers disagree about time and about distance but agree on
                  one number made from the two. Why they agree, and whether it holds for other pairs of events, is left to the tutor and
                  to later experiments.
                </li>
                <li>
                  <strong>How sure the numbers are:</strong> they come from a tested calculation, the Lorentz transformation of
                  &ldquo;Moving frames&rdquo;. No instrument measured them.
                </li>
              </ul>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the clock&rsquo;s speed (see the caption under the results
              picture). Nothing here changes with your guess or with the speeds you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && prediction !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your white guess mark, then explains.
            </PartHeader>
            <SpacetimeIntervalTutor
              key={prediction}
              clockSpeed={PART1_CLOCK_SPEED}
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
