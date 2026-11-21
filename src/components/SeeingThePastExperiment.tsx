import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  PART_ONE_DIRECTION,
  PART_ONE_SPEED,
  STRIP_MAX_C,
  guessStretch,
  measuredPositionAt,
  runSeeingExperiment,
  seenAt,
  stripPosition,
} from '../physics/seeingThePast'
import type { Direction, SpeedGuess } from '../physics/seeingThePast'
import { SeeingThePastTutor } from './SeeingThePastTutor'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { SeeingThePastIntro, SeeingThePastLinks, seeingThePastWordsEntries } from './SeeingThePastIntro'
import { SeeingThePastJetLinks, SeeingThePastResultsTables } from './SeeingThePastResults'

// Spacetime Geometry 4 (docs/experiments/spacetime-geometry/04-what-you-see-is-the-past.md), audit update of 2026-11-21 (wording in
// docs/audit/spacetime-geometry/04-draft-wording.md, approved by the owner on 2026-11-21). The page is in four Parts: Part 1 is one guess about one fixed run
// (a spaceship coming toward the lab at 0.6c), with the map, the graph and, once the run ends, Panel B with the white guess marker; Part 2 lets the learner
// choose the direction and speed; Part 3 has the results; Part 4 the tutor. Parts 2 to 4 appear after the first Run, and Start over clears everything.
// Every position and number comes from `seeingThePast.ts`. The introduction is in `SeeingThePastIntro.tsx`, the results tables in `SeeingThePastResults.tsx`.
const SPEED_PRESETS = [0.3, 0.5, 0.6, 0.9]
type Prediction = SpeedGuess

// The three answers of the prediction in the specification's "Prediction Activity" section (wording approved by the owner on 2026-10-14, §28.1).
// (b) is never right; it is there because it is the natural guess.
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'slower', label: "Slower than the spaceship's real speed" },
  { value: 'same', label: "The same as the spaceship's real speed" },
  { value: 'faster', label: "Faster than the spaceship's real speed" },
]

const DIRECTION_CHOICES: { value: Direction; label: string }[] = [
  { value: 'approaching', label: 'Toward the lab' },
  { value: 'receding', label: 'Away from the lab' },
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
const DEFAULT_SHIP_COLOR = '#f59e0b'
const CONE_COLOR = '#facc15'
// White is kept for the learner's guess (CLAUDE.md §14, "Predictions and the Real Results"). Pink marks only the learner's own settings in Part 2.
const GUESS_COLOR = '#ffffff'
// A dark outline so a label stays readable where it crosses a line.
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

// Drawing constants (SVG units). Position runs across (-1 to 6 light-seconds); the time axis is cut to fit the chosen run.
const VIEW_WIDTH = 460
const VIEW_HEIGHT = 420
const LEFT_X = 70
const RIGHT_MARGIN = 14
const MIN_POSITION = -1
const MIN_MAX_POSITION = 6
const ORIGIN_Y = 370
const TOP_Y = 50
// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
const ANIMATION_DURATION_MS = 10_000

function directionWords(direction: Direction): string {
  return direction === 'approaching' ? 'toward the lab' : 'away from the lab'
}

interface DiagramProps {
  direction: Direction
  speed: number
  // null while idle (only the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
  // The colour of the spaceship's marks: the page's orange in Part 1, pink for the learner's own settings in Part 2.
  accent?: string
}

function lerp(a: number, b: number, fraction: number): number {
  return a + (b - a) * fraction
}

// The looking time at a point in the playback, kept inside the run so a rounding error at the very end cannot push it out.
function lookingTimeAt(first: number, last: number, progress: number): number {
  return Math.min(last, Math.max(first, lerp(first, last, progress)))
}

// While idle it draws only the setup: the lab's axes, the eye at position 0, the lab's clock line, and the spaceship's path as the lab
// works it out. It deliberately draws no telescope view then: where the spaceship looks to be is what the learner is asked to
// predict (§12). While the run plays, the lab's looking event moves up its clock line, the past light cone is drawn from it
// (two lines going down), and two squares are marked on the spaceship's path: a hollow one where the cone crosses it (where the spaceship
// looks to be) and a solid one at the same lab time as the looking event (where the spaceship really is).
function Diagram({ direction, speed, progress, accent }: DiagramProps) {
  const SHIP_COLOR = accent ?? DEFAULT_SHIP_COLOR
  const run = runSeeingExperiment(direction, speed)
  const maxTime = Math.ceil(run.lastLooking)
  // The spaceship keeps flying while the lab looks, so the position axis is cut to fit the real spaceship at the last looking time.
  const maxPosition = Math.max(MIN_MAX_POSITION, Math.ceil(measuredPositionAt(direction, speed, run.lastLooking)))
  const xOf = (position: number) => LEFT_X + ((position - MIN_POSITION) / (maxPosition - MIN_POSITION)) * (VIEW_WIDTH - LEFT_X - RIGHT_MARGIN)
  const yOf = (time: number) => ORIGIN_Y - (time / maxTime) * (ORIGIN_Y - TOP_Y)
  const startPosition = measuredPositionAt(direction, speed, 0)
  const endPosition = measuredPositionAt(direction, speed, run.measuredDuration)
  const startX = xOf(startPosition)
  const endX = xOf(endPosition)
  const startY = yOf(0)
  const endY = yOf(run.measuredDuration)
  const timeStep = maxTime <= 8 ? 1 : 2
  const timeMarks = Array.from({ length: Math.floor(maxTime / timeStep) + 1 }, (_, i) => i * timeStep)
  const positionMarks = Array.from({ length: maxPosition - MIN_POSITION + 1 }, (_, i) => i + MIN_POSITION)
  const playing = progress !== null
  const complete = progress !== null && progress >= 1
  // The spaceship keeps flying after its 4 light-seconds, because the real spaceship is marked at the looking time, which can be later.
  const pathLastTime = run.lastLooking
  const pathLastX = xOf(measuredPositionAt(direction, speed, pathLastTime))
  const pathLastY = yOf(pathLastTime)

  let looking: ReturnType<typeof seenAt> | null = null
  if (playing) looking = seenAt(direction, speed, lookingTimeAt(run.firstLooking, run.lastLooking, progress))
  // The right edge of the cone runs down and out at one light-second per second, until it leaves the drawing.
  const coneReach = looking === null ? 0 : Math.min(looking.lookingTime, maxPosition)
  const leftReach = looking === null ? 0 : Math.min(looking.lookingTime, -MIN_POSITION)
  // The cone's label is turned to lie along its right edge.
  const edgeAngle =
    looking === null
      ? 0
      : (Math.atan2(yOf(looking.lookingTime - coneReach) - yOf(looking.lookingTime), xOf(coneReach) - xOf(0)) * 180) / Math.PI

  // A label for a mark in the right third of the drawing goes to the left of the mark, so it stays inside the drawing.
  const nearRight = (position: number) => xOf(position) > VIEW_WIDTH - 200
  // The label sits most of the way down the edge, where the spaceship's path has moved away from it.
  const labelX = looking === null ? 0 : xOf(0) + (xOf(coneReach) - xOf(0)) * 0.6
  const labelY = looking === null ? 0 : yOf(looking.lookingTime) + (yOf(looking.lookingTime - coneReach) - yOf(looking.lookingTime)) * 0.6 - 8

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`${looking === null ? 'Setup: ' : complete ? 'Result: ' : 'Playback: '}the lab's eye and telescope are at position 0. A spaceship flies ${directionWords(direction)} at ${speed}c, from ${startPosition} light-seconds to ${endPosition} light-seconds, which takes ${run.measuredDuration.toFixed(2)} seconds on the lab's clock.${looking === null ? '' : ` The lab looks at ${looking.lookingTime.toFixed(2)} seconds. The spaceship really is ${looking.measuredPosition.toFixed(2)} light-seconds away, and it looks to be ${looking.seenPosition.toFixed(2)} light-seconds away, where it was at ${looking.emissionTime.toFixed(2)} seconds.`}`}
      style={SVG_STYLE}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Space and time, from the lab's point of view
      </text>
      <text x="12" y="34" fontSize="11" fill={MUTED_COLOR}>
        {looking === null
          ? "The spaceship's path as the lab works it out with its ruler and clocks"
          : 'Hollow square: where the spaceship looks to be. Solid square: where it really is.'}
      </text>

      {/* Axes: position along the bottom, time up the side. */}
      <line x1={xOf(MIN_POSITION)} y1={ORIGIN_Y} x2={xOf(maxPosition)} y2={ORIGIN_Y} stroke={TICK_COLOR} strokeWidth="1.5" />
      <line x1={xOf(MIN_POSITION)} y1={ORIGIN_Y} x2={xOf(MIN_POSITION)} y2={TOP_Y} stroke={TICK_COLOR} strokeWidth="1.5" />
      {positionMarks.map((p) => (
        <g key={`p${p}`}>
          <line x1={xOf(p)} y1={ORIGIN_Y} x2={xOf(p)} y2={ORIGIN_Y + 5} stroke={TICK_COLOR} />
          <text x={xOf(p)} y={ORIGIN_Y + 18} fontSize="11" textAnchor="middle" fill={TICK_COLOR}>
            {p}
          </text>
        </g>
      ))}
      {timeMarks.map((t) => (
        <g key={`t${t}`}>
          <line x1={xOf(MIN_POSITION) - 5} y1={yOf(t)} x2={xOf(MIN_POSITION)} y2={yOf(t)} stroke={TICK_COLOR} />
          <text x={xOf(MIN_POSITION) - 9} y={yOf(t) + 4} fontSize="11" textAnchor="end" fill={TICK_COLOR}>
            {t}
          </text>
        </g>
      ))}
      <text x={(xOf(MIN_POSITION) + xOf(maxPosition)) / 2} y={ORIGIN_Y + 38} fontSize="12" textAnchor="middle" fill={TEXT_COLOR}>
        Position (light-seconds, right is positive)
      </text>
      <text
        x="14"
        y={(ORIGIN_Y + TOP_Y) / 2}
        fontSize="12"
        textAnchor="middle"
        fill={TEXT_COLOR}
        transform={`rotate(-90 14 ${(ORIGIN_Y + TOP_Y) / 2})`}
      >
        Time on the lab's clock (seconds)
      </text>

      {/* The lab: the eye sits at position 0, and its own place in space is a vertical line as time goes up. */}
      <line x1={xOf(0)} y1={ORIGIN_Y} x2={xOf(0)} y2={TOP_Y} stroke={LAB_LINE_COLOR} strokeWidth="2" strokeDasharray="6 4" />
      <text x={xOf(0) + 6} y={ORIGIN_Y - 34} fontSize="11" fill={LAB_LINE_COLOR} style={HALO}>
        The lab's clock line
      </text>
      <circle cx={xOf(0)} cy={ORIGIN_Y} r="6" fill="#0b1020" stroke={LAB_LINE_COLOR} strokeWidth="2.5" />
      <text x={xOf(0) + 10} y={ORIGIN_Y - 10} fontSize="11" fill={LAB_LINE_COLOR} style={HALO}>
        The lab's eye and telescope (position 0)
      </text>

      {/* The spaceship's path: solid for the 4 light-seconds it covers, dashed for where it keeps flying afterwards. */}
      <line x1={endX} y1={endY} x2={pathLastX} y2={pathLastY} stroke={SHIP_COLOR} strokeWidth="2" strokeDasharray="3 4" />
      <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={SHIP_COLOR} strokeWidth="3" />
      <rect x={startX - 3} y={startY - 3} width="6" height="6" fill={SHIP_COLOR} />
      <rect x={endX - 3} y={endY - 3} width="6" height="6" fill={SHIP_COLOR} />
      <text
        x={(endX + pathLastX) / 2 + (nearRight((endPosition + measuredPositionAt(direction, speed, pathLastTime)) / 2) ? -8 : 8)}
        y={(endY + pathLastY) / 2 + 3}
        textAnchor={nearRight((endPosition + measuredPositionAt(direction, speed, pathLastTime)) / 2) ? 'end' : 'start'}
        fontSize="10"
        fill={SHIP_COLOR}
        style={HALO}
      >
        The path continues
      </text>
      {/* Shown until the yellow dot gets near the height of the end of the run, where the labels of the dot and the squares would be printed on top of this one. */}
      {(looking === null || Math.abs(looking.lookingTime - run.measuredDuration) > 1.3) && (
        <text
          x={endX + (nearRight(endPosition) ? -9 : 9)}
          y={endY + 4}
          textAnchor={nearRight(endPosition) ? 'end' : 'start'}
          fontSize="10"
          fill={SHIP_COLOR}
          style={HALO}
        >
          Where the run ends ({endPosition.toFixed(0)} ls away)
        </text>
      )}
      <text
        x={startX + (startPosition >= 3 ? -10 : 10)}
        y={startY - 54}
        textAnchor={startPosition >= 3 ? 'end' : 'start'}
        fontSize="11"
        fill={SHIP_COLOR}
        style={HALO}
      >
        The spaceship's path starts here ({startPosition} ls away)
      </text>

      {/* The telescope's view, drawn while the run plays and when it ends. */}
      {looking !== null && (
        <g>
          <line
            x1={xOf(0)}
            y1={yOf(looking.lookingTime)}
            x2={xOf(coneReach)}
            y2={yOf(looking.lookingTime - coneReach)}
            stroke={CONE_COLOR}
            strokeWidth="2.5"
          />
          <line
            x1={xOf(0)}
            y1={yOf(looking.lookingTime)}
            x2={xOf(-leftReach)}
            y2={yOf(looking.lookingTime - leftReach)}
            stroke={CONE_COLOR}
            strokeWidth="2.5"
          />
          <text
            x={labelX}
            y={labelY}
            fontSize="11"
            fill={CONE_COLOR}
            textAnchor="middle"
            transform={`rotate(${edgeAngle} ${labelX} ${labelY})`}
            style={HALO}
          >
            Past light cone: light reaching the eye now
          </text>
          {/* The looking event, on the lab's clock line. */}
          <circle cx={xOf(0)} cy={yOf(looking.lookingTime)} r="6" fill={CONE_COLOR} stroke="#0b1020" strokeWidth="1.5" />
          <text x={xOf(0) + 10} y={yOf(looking.lookingTime) - 8} fontSize="11" fill={CONE_COLOR} style={HALO}>
            The lab looks now (clock: {looking.lookingTime.toFixed(2)} s)
          </text>
          {/* Where the spaceship really is at that lab time: a solid square. */}
          <rect
            x={xOf(looking.measuredPosition) - 6}
            y={yOf(looking.lookingTime) - 6}
            width="12"
            height="12"
            fill={SHIP_COLOR}
            stroke="#0b1020"
            strokeWidth="1.5"
          />
          <text
            x={xOf(looking.measuredPosition) + (nearRight(looking.measuredPosition) ? -12 : 12)}
            y={yOf(looking.lookingTime) + 4}
            textAnchor={nearRight(looking.measuredPosition) ? 'end' : 'start'}
            fontSize="11"
            fill={SHIP_COLOR}
            style={HALO}
          >
            Where the spaceship really is now
          </text>
          {/* Where the spaceship looks to be, where the cone crosses its path: a hollow square at the earlier time. */}
          <rect
            x={xOf(looking.seenPosition) - 6}
            y={yOf(looking.emissionTime) - 6}
            width="12"
            height="12"
            fill="#0b1020"
            stroke={SHIP_COLOR}
            strokeWidth="2.5"
          />
          <text
            x={xOf(looking.seenPosition) + (nearRight(looking.seenPosition) ? -12 : 12)}
            y={yOf(looking.emissionTime) + 4}
            textAnchor={nearRight(looking.seenPosition) ? 'end' : 'start'}
            fontSize="11"
            fill={SHIP_COLOR}
            style={HALO}
          >
            Where the spaceship looks to be
          </text>
        </g>
      )}
    </svg>
  )
}

// The second picture: position (up) against the lab's clock (across). The solid line with solid squares is where the spaceship
// really is, the dashed line with hollow squares is where it looks to be. Both are drawn up to the current looking time.
const PLOT_WIDTH = 460
const PLOT_HEIGHT = 340
const PLOT_LEFT = 70
const PLOT_RIGHT = 440
const PLOT_TOP = 80
const PLOT_BOTTOM = 280

// Panel B (Part 1 only): a strip of speeds as a fraction of c, joined to the graph's picture when the run ends. The real speed and the image's speed are
// drawn from the run; the white ring and the YOUR GUESS box are only a marker for the learner's answer, on the stretch of the strip it names.
const STRIP_TOP = PLOT_HEIGHT + 22
const STRIP_AXIS_Y = STRIP_TOP + 100
const STRIP_BOX_WIDTH = 330
const STRIP_PICTURE_HEIGHT = STRIP_AXIS_Y + 80
const STRIP_GUESS_EXTRA = 112

const GUESS_STRIP_LABELS: Record<SpeedGuess, string> = {
  slower: "Slower than the spaceship's real speed",
  same: "The same as the spaceship's real speed",
  faster: "Faster than the spaceship's real speed",
}

function SpeedStrip({ speed, imageSpeed, guess }: { speed: number; imageSpeed: number; guess: SpeedGuess | null }) {
  const xOfSpeed = (value: number) => PLOT_LEFT + stripPosition(value) * (PLOT_RIGHT - PLOT_LEFT)
  const ticks = [0, 0.5, 1, 1.5, 2].filter((t) => t <= STRIP_MAX_C)
  const realX = xOfSpeed(speed)
  const imageX = xOfSpeed(imageSpeed)
  const bracketY = STRIP_AXIS_Y + 40
  const stretches: { id: SpeedGuess; from: number; to: number; label: string }[] = [
    { id: 'slower', ...guessStretch('slower', speed), label: 'slower' },
    { id: 'same', ...guessStretch('same', speed), label: 'the same' },
    { id: 'faster', ...guessStretch('faster', speed), label: 'faster' },
  ]
  const named = guess === null ? null : stretches.find((st) => st.id === guess)!
  const ringFrom = named === null ? 0 : named.id === 'same' ? realX - 30 : xOfSpeed(named.from) + (named.id === 'faster' ? 6 : 0)
  const ringTo = named === null ? 0 : named.id === 'same' ? realX + 30 : xOfSpeed(named.to) - (named.id === 'slower' ? 6 : 0)
  const ringCenter = (ringFrom + ringTo) / 2
  const boxX = Math.min(Math.max(ringCenter - STRIP_BOX_WIDTH / 2, 8), PLOT_WIDTH - 8 - STRIP_BOX_WIDTH)
  // The "the same" label sits on a second row, so that the other two rings do not cross it; its ring is taller to take it in.
  const ringTop = bracketY - 12
  const ringHeight = named !== null && named.id === 'same' ? 62 : 36
  const boxY = ringTop + ringHeight + 30
  return (
    <g data-testid="speed-strip">
      <line x1="0" y1={STRIP_TOP - 12} x2={PLOT_WIDTH} y2={STRIP_TOP - 12} stroke={MUTED_COLOR} strokeWidth="0.5" />
      <text x="12" y={STRIP_TOP + 6} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Panel B: how fast does it move? (speeds, as a fraction of c)
      </text>
      <text x="12" y={STRIP_TOP + 22} fontSize="10" fill={MUTED_COLOR}>
        One scale, 0 to {STRIP_MAX_C}. The three stretches below the line are the three answers.
      </text>
      <line x1={PLOT_LEFT} y1={STRIP_AXIS_Y} x2={PLOT_RIGHT} y2={STRIP_AXIS_Y} stroke={TICK_COLOR} strokeWidth="2" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xOfSpeed(t)} y1={STRIP_AXIS_Y} x2={xOfSpeed(t)} y2={STRIP_AXIS_Y + 6} stroke={TICK_COLOR} />
          <text x={xOfSpeed(t)} y={STRIP_AXIS_Y + 19} fontSize="10" textAnchor="middle" fill={TICK_COLOR}>
            {t}
          </text>
        </g>
      ))}
      <line x1={xOfSpeed(1)} y1={STRIP_AXIS_Y - 40} x2={xOfSpeed(1)} y2={STRIP_AXIS_Y} stroke={CONE_COLOR} strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={xOfSpeed(1) + 5} y={STRIP_AXIS_Y - 44} fontSize="10" fill={CONE_COLOR} style={HALO}>
        1 = the speed of light
      </text>

      {/* The real speed: a solid tick. The image's speed: a hollow diamond. (Solid is real, hollow is seen, as in the pictures above.) */}
      <rect x={realX - 2} y={STRIP_AXIS_Y - 20} width="4" height="20" fill={DEFAULT_SHIP_COLOR} />
      <text x={realX + 3} y={STRIP_AXIS_Y - 25} textAnchor="end" fontSize="10" fontWeight="bold" fill={DEFAULT_SHIP_COLOR} style={HALO}>
        Real speed {speed.toFixed(2)}c
      </text>
      <polygon
        points={`${imageX},${STRIP_AXIS_Y - 9} ${imageX + 8},${STRIP_AXIS_Y} ${imageX},${STRIP_AXIS_Y + 9} ${imageX - 8},${STRIP_AXIS_Y}`}
        fill="#0b1020"
        stroke={DEFAULT_SHIP_COLOR}
        strokeWidth="2.5"
      />
      <text x={imageX} y={STRIP_AXIS_Y - 25} textAnchor="middle" fontSize="10" fontWeight="bold" fill={DEFAULT_SHIP_COLOR} style={HALO}>
        Image speed {imageSpeed.toFixed(2)}c
      </text>

      {/* The three stretches: the three answers of the prediction. */}
      {stretches.map((st) => {
        const a = xOfSpeed(st.from) + (st.id === 'faster' ? 6 : 0)
        const b = xOfSpeed(st.to) - (st.id === 'slower' ? 6 : 0)
        const mid = (a + b) / 2
        return (
          <g key={st.id}>
            {st.id !== 'same' && (
              <>
                <line x1={a} y1={bracketY} x2={b} y2={bracketY} stroke={MUTED_COLOR} strokeWidth="2" />
                <line x1={a} y1={bracketY - 4} x2={a} y2={bracketY + 4} stroke={MUTED_COLOR} strokeWidth="2" />
                <line x1={b} y1={bracketY - 4} x2={b} y2={bracketY + 4} stroke={MUTED_COLOR} strokeWidth="2" />
              </>
            )}
            {st.id === 'same' && <line x1={realX} y1={STRIP_AXIS_Y + 6} x2={realX} y2={bracketY + 22} stroke={MUTED_COLOR} strokeWidth="1" strokeDasharray="2 2" />}
            <text x={mid} y={bracketY + (st.id === 'same' ? 36 : 16)} textAnchor="middle" fontSize="11" fill={MUTED_COLOR}>
              {st.label}
            </text>
          </g>
        )
      })}

      {/* The white guess: a ring round the stretch the answer names, a pointer and the YOUR GUESS box. It is only a marker. */}
      {named !== null && (
        <g data-testid="guess-mark">
          <rect x={ringFrom} y={ringTop} width={ringTo - ringFrom} height={ringHeight} rx="7" fill="none" stroke={GUESS_COLOR} strokeWidth="3" />
          <polygon points={`${ringCenter},${ringTop + ringHeight + 2} ${ringCenter - 7},${ringTop + ringHeight + 14} ${ringCenter + 7},${ringTop + ringHeight + 14}`} fill={GUESS_COLOR} />
          <rect x={boxX} y={boxY} width={STRIP_BOX_WIDTH} height="54" rx="5" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="2.5" />
          <text x={boxX + 10} y={boxY + 18} fontSize="11" fontWeight="bold" fill={GUESS_COLOR}>
            YOUR GUESS
          </text>
          <text x={boxX + 10} y={boxY + 32} fontSize="11" fill={GUESS_COLOR}>
            Image speed compared with the real speed:
          </text>
          <text x={boxX + 10} y={boxY + 46} fontSize="11" fill={GUESS_COLOR}>
            {GUESS_STRIP_LABELS[named.id]}
          </text>
        </g>
      )}
    </g>
  )
}

function PositionPlot({
  direction,
  speed,
  progress,
  strip,
  accent,
}: {
  direction: Direction
  speed: number
  progress: number
  strip?: { guess: SpeedGuess | null }
  accent?: string
}) {
  const SHIP_COLOR = accent ?? DEFAULT_SHIP_COLOR
  const run = runSeeingExperiment(direction, speed)
  const complete = progress >= 1
  const timeMin = Math.floor(run.firstLooking)
  const timeMax = Math.ceil(run.lastLooking)
  const realAt = (time: number) => measuredPositionAt(direction, speed, time)
  const positionMax = Math.ceil(Math.max(realAt(run.lastLooking), realAt(run.firstLooking), ...run.samples.map((sample) => sample.seenPosition)))
  const xOfTime = (time: number) => PLOT_LEFT + ((time - timeMin) / (timeMax - timeMin)) * (PLOT_RIGHT - PLOT_LEFT)
  const yOfPosition = (position: number) => PLOT_BOTTOM - (position / positionMax) * (PLOT_BOTTOM - PLOT_TOP)
  const now = seenAt(direction, speed, lookingTimeAt(run.firstLooking, run.lastLooking, progress))
  const reached = run.samples.filter((sample) => sample.lookingTime <= now.lookingTime)
  const seenPoints = [...reached.map((sample) => [sample.lookingTime, sample.seenPosition]), [now.lookingTime, now.seenPosition]]
  const realPoints = [
    [run.firstLooking, realAt(run.firstLooking)],
    [now.lookingTime, realAt(now.lookingTime)],
  ]
  const toPath = (points: number[][]) => points.map(([t, p]) => `${xOfTime(t)},${yOfPosition(p)}`).join(' ')
  const timeStep = timeMax - timeMin <= 8 ? 1 : 2
  const timeMarks = Array.from({ length: Math.floor((timeMax - timeMin) / timeStep) + 1 }, (_, i) => timeMin + i * timeStep)
  const positionMarks = Array.from({ length: positionMax + 1 }, (_, i) => i)

  const showStrip = strip !== undefined && complete
  const picHeight = showStrip ? STRIP_PICTURE_HEIGHT + (strip!.guess !== null ? STRIP_GUESS_EXTRA : 0) : PLOT_HEIGHT
  // The two lines are named on the lines, beside where each starts: the higher start gets its name above it, the lower one below it.
  const realStart = { x: xOfTime(run.firstLooking), y: yOfPosition(realAt(run.firstLooking)) }
  const seenStart = { x: xOfTime(run.firstLooking), y: yOfPosition(run.samples[0].seenPosition) }
  const realIsHigher = realStart.y < seenStart.y
  // Each label sits clear of its own line: above the line for the higher one, below it for the lower one, allowing for how the line slopes under the text.
  const LABEL_WIDTH = 150
  const slopeOf = (startY: number, endY: number) => (endY - startY) / (xOfTime(run.lastLooking) - xOfTime(run.firstLooking))
  const labelY = (startY: number, endY: number, above: boolean) => {
    const m = slopeOf(startY, endY)
    const ys = [startY + m * 8, startY + m * (8 + LABEL_WIDTH)]
    return above ? Math.min(...ys) - 7 : Math.max(...ys) + 15
  }
  const realLabelY = labelY(realStart.y, yOfPosition(realAt(run.lastLooking)), realIsHigher)
  const seenLabelY = labelY(seenStart.y, yOfPosition(run.samples[run.samples.length - 1].seenPosition), !realIsHigher)

  return (
    <svg
      viewBox={`0 0 ${PLOT_WIDTH} ${picHeight}`}
      role="img"
      aria-label={`Where the spaceship is and where it looks to be, against the lab's clock. At ${now.lookingTime.toFixed(2)} seconds the spaceship really is ${now.measuredPosition.toFixed(2)} light-seconds away, and it looks to be ${now.seenPosition.toFixed(2)} light-seconds away.${complete ? ` The spaceship's real speed is ${run.measuredSpeed.toFixed(2)}c and its image's speed is ${run.imageSpeed.toFixed(2)}c.` : ''}${showStrip ? ' Panel B below shows the two speeds on one strip, and the three answers as three stretches of it.' : ''}`}
      style={SVG_STYLE}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Where the spaceship is and where it looks to be
      </text>
      <text x="12" y="34" fontSize="11" fill={SHIP_COLOR}>
        {complete ? `Solid line, solid squares: where the spaceship really is (${run.measuredSpeed.toFixed(2)}c)` : 'Solid line, solid squares: where the spaceship really is'}
      </text>
      <text x="12" y="49" fontSize="11" fill={SHIP_COLOR}>
        {complete ? `Dashed line, hollow squares: where it looks to be (${run.imageSpeed.toFixed(2)}c)` : 'Dashed line, hollow squares: where the spaceship looks to be'}
      </text>

      <line x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM} stroke={TICK_COLOR} strokeWidth="1.5" />
      <line x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_LEFT} y2={PLOT_TOP} stroke={TICK_COLOR} strokeWidth="1.5" />
      {timeMarks.map((t) => (
        <g key={`t${t}`}>
          <line x1={xOfTime(t)} y1={PLOT_BOTTOM} x2={xOfTime(t)} y2={PLOT_BOTTOM + 5} stroke={TICK_COLOR} />
          <text x={xOfTime(t)} y={PLOT_BOTTOM + 18} fontSize="11" textAnchor="middle" fill={TICK_COLOR}>
            {t}
          </text>
        </g>
      ))}
      {positionMarks.map((p) => (
        <g key={`p${p}`}>
          <line x1={PLOT_LEFT - 5} y1={yOfPosition(p)} x2={PLOT_LEFT} y2={yOfPosition(p)} stroke={TICK_COLOR} />
          <text x={PLOT_LEFT - 9} y={yOfPosition(p) + 4} fontSize="11" textAnchor="end" fill={TICK_COLOR}>
            {p}
          </text>
        </g>
      ))}
      <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 38} fontSize="12" textAnchor="middle" fill={TEXT_COLOR}>
        The lab's clock (seconds)
      </text>
      <text
        x="14"
        y={(PLOT_TOP + PLOT_BOTTOM) / 2}
        fontSize="12"
        textAnchor="middle"
        fill={TEXT_COLOR}
        transform={`rotate(-90 14 ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
      >
        Distance from the lab (light-seconds)
      </text>

      {/* The current looking time. */}
      <line x1={xOfTime(now.lookingTime)} y1={PLOT_BOTTOM} x2={xOfTime(now.lookingTime)} y2={PLOT_TOP} stroke={CONE_COLOR} strokeWidth="1" strokeDasharray="2 4" />

      <polyline points={toPath(realPoints)} fill="none" stroke={SHIP_COLOR} strokeWidth="3" />
      <polyline points={toPath(seenPoints)} fill="none" stroke={SHIP_COLOR} strokeWidth="2.5" strokeDasharray="7 5" />
      <rect x={xOfTime(now.lookingTime) - 5} y={yOfPosition(now.measuredPosition) - 5} width="10" height="10" fill={SHIP_COLOR} />
      <rect
        x={xOfTime(now.lookingTime) - 5}
        y={yOfPosition(now.seenPosition) - 5}
        width="10"
        height="10"
        fill="#0b1020"
        stroke={SHIP_COLOR}
        strokeWidth="2.5"
      />
      <text x={realStart.x + 8} y={realLabelY} fontSize="10" fontWeight="bold" fill={SHIP_COLOR} style={HALO}>
        The spaceship really is
      </text>
      <text x={seenStart.x + 8} y={seenLabelY} fontSize="10" fontWeight="bold" fill={SHIP_COLOR} style={HALO}>
        The spaceship looks to be
      </text>
      {showStrip && <SpeedStrip speed={run.measuredSpeed} imageSpeed={run.imageSpeed} guess={strip!.guess} />}
    </svg>
  )
}

const BARS_VIEW_WIDTH = 520
const BARS_VIEW_HEIGHT = 190
const BARS_LEFT = 20
const BARS_RIGHT = 500
const BARS_ROWS_TOP = 70
const BARS_ROW_HEIGHT = 50

interface SpeedRow {
  name: string
  speed: number
  // The spaceship's real motion is a solid bar and its image is a hollow one, as in the diagrams, so colour is not needed.
  hollow: boolean
}

// The two speeds as bars on one scale, with a line at 1 (the speed of light). A bar that crosses the line is faster than light.
// The words next to each bar give the same numbers.
function SpeedBars({ rows, accent }: { rows: SpeedRow[]; accent?: string }) {
  const SHIP_COLOR = accent ?? DEFAULT_SHIP_COLOR
  const scaleMax = Math.max(1.2, ...rows.map((row) => row.speed * 1.05))
  const xOfSpeed = (value: number) => BARS_LEFT + (value / scaleMax) * (BARS_RIGHT - BARS_LEFT)

  return (
    <svg
      viewBox={`0 0 ${BARS_VIEW_WIDTH} ${BARS_VIEW_HEIGHT}`}
      role="img"
      aria-label={`Bars of the two speeds on one scale, with a line at 1, the speed of light. ${rows
        .map((row) => `${row.name}: ${row.speed.toFixed(2)}c`)
        .join('. ')}.`}
      style={SVG_STYLE}
    >
      <text x="20" y="22" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The two speeds, as a fraction of c (one scale)
      </text>
      <line x1={xOfSpeed(1)} y1="38" x2={xOfSpeed(1)} y2={BARS_VIEW_HEIGHT - 28} stroke={CONE_COLOR} strokeWidth="2" strokeDasharray="5 4" />
      <text x={xOfSpeed(1)} y="34" textAnchor={xOfSpeed(1) > BARS_VIEW_WIDTH * 0.7 ? 'end' : 'start'} dx={xOfSpeed(1) > BARS_VIEW_WIDTH * 0.7 ? -6 : 6} fontSize="10" fill={CONE_COLOR}>
        1 = the speed of light
      </text>
      <line x1={BARS_LEFT} y1="38" x2={BARS_LEFT} y2={BARS_VIEW_HEIGHT - 28} stroke={TICK_COLOR} strokeWidth="1.5" />
      {rows.map((row, i) => {
        const y = BARS_ROWS_TOP + i * BARS_ROW_HEIGHT
        return (
          <g key={row.name}>
            <text x={BARS_LEFT + 6} y={y + 2} fontSize="12" fontWeight="bold" fill={SHIP_COLOR}>
              {row.name}
            </text>
            <text x={BARS_RIGHT} y={y + 2} textAnchor="end" fontSize="11" fill={TEXT_COLOR}>
              {row.speed.toFixed(2)}c
            </text>
            <rect
              x={BARS_LEFT}
              y={y + 10}
              width={Math.max(xOfSpeed(row.speed) - BARS_LEFT, 1)}
              height="16"
              rx="2"
              fill={row.hollow ? '#0b1020' : SHIP_COLOR}
              stroke={SHIP_COLOR}
              strokeWidth="2"
            />
          </g>
        )
      })}
      <text x="20" y={BARS_VIEW_HEIGHT - 10} fontSize="10" fill={MUTED_COLOR}>
        c = the speed of light. Both bars start at zero, on the left, and use the same scale.
      </text>
    </svg>
  )
}

interface SeeingThePastExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type PlayStatus = 'idle' | 'running' | 'complete'

// Plays a run: progress goes from 0 to 1 over ANIMATION_DURATION_MS, then the status becomes 'complete'. The length only sets how fast the result is
// shown; the physics does not depend on it (§11).
function usePlayback(status: PlayStatus, setStatus: (status: PlayStatus) => void, setProgress: (progress: number) => void, onDone?: () => void) {
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId: number
    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)
      if (fraction >= 1) {
        setStatus('complete')
        done.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, setStatus, setProgress])
}

const PART_ONE_COLOR = '#d97706'
const PART_TWO_COLOR = '#be185d'
const PART_THREE_COLOR = '#0f766e'
const PART_FOUR_COLOR = '#0066cc'
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 } as const
const captionStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' } as const
const pictureTitle = { fontWeight: 'bold', fontSize: '0.875rem', marginTop: '1.5rem', marginBottom: '0.5rem' } as const
const two = (value: number) => value.toFixed(2)

// ---- The caption of Picture 1 (the map of space and time): only what is drawn before Run; the rest once the run has started ----

function MapCaption({ direction, speed, started }: { direction: Direction; speed: number; started: boolean }) {
  const run = runSeeingExperiment(direction, speed)
  const first = run.samples[0]
  const last = run.samples[run.samples.length - 1]
  return (
    <div style={captionStyle}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> This is a <strong>map of space and time</strong>, drawn from the lab's point of view. For this run the spaceship flies{' '}
        {directionWords(direction)} at {speed}c. Think of a train timetable drawn as a picture. Sideways tells you <em>where</em>: how far from the lab, in light-seconds
        (a light-second is the distance light travels in one second, about 300,000 kilometers). The number 0 is the lab itself, and the higher the number, the farther to the
        right. Upward tells you <em>when</em>: the higher a point is, the later it is by the lab's clock, in seconds. So a point high up and far to the right is a place far
        from the lab at a late time. The parts of the map are:
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The lab's eye and telescope.</strong> The small circle at the bottom, at position 0. This is where the observer stands and looks. The spaceship is not here. The
          spaceship is far away, and the telescope looks at it.
        </li>
        <li>
          <strong>The lab's clock line.</strong> The dashed sky-blue line going straight up from the circle. The lab stays at position 0, so as time passes, it only moves up. The
          line shows the lab's clock running.
        </li>
        <li>
          <strong>The spaceship's path.</strong> The orange line. Each point on it says where the lab works out the spaceship is at that moment, using its ruler and synchronized
          clocks. It is solid for the 4 light-seconds that the spaceship covers in {two(run.measuredDuration)} seconds, and dashed after that, where the spaceship keeps flying. Labels
          mark where it starts, where the run ends and where the path continues.
        </li>
        {started && (
          <>
            <li>
              <strong>The yellow dot, "The lab looks now".</strong> It appears when you press Run. It is the moment the observer looks through the telescope, and the number next
              to it is the lab's clock at that moment. As the clock runs, the dot climbs the lab's clock line.
            </li>
            <li>
              <strong>The two yellow lines, the "past light cone".</strong> They go down from the yellow dot. They show which places you are seeing, right now, and from when. Light
              covers 1 light-second each second. So light that reaches the telescope now and left 2 seconds ago came from 2 light-seconds away. Light that left 5 seconds ago came from 5
              light-seconds away. Mark those points on the map and they fall on a straight line sloping down from the dot: the yellow line. Anything on a yellow line is something the
              telescope is showing right now.
            </li>
            <li>
              <strong>The solid square, "Where the spaceship really is now".</strong> This is where the lab works out the spaceship is at the same moment as the yellow dot. It sits at
              the same height as the dot.
            </li>
            <li>
              <strong>The hollow square, "Where the spaceship looks to be".</strong> This is the place where a yellow line crosses the spaceship's path. The telescope is showing the
              spaceship at that spot, because that is where the spaceship was when it sent the light that is arriving now.
            </li>
          </>
        )}
      </ul>

      {started && (
        <>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>What happens in the animation, step by step.</strong> The animation is a way of watching the lab's clock run, from the first moment the observer has something to
            look at, to the last. Here is what you will see, in order.
          </p>
          <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Before you press Run.</strong> Picture 1 shows only what the lab has worked out with its ruler and clocks: the lab's eye and telescope, the lab's clock line, and the
              spaceship's path. There is no yellow dot, no yellow line and no square on the path yet, because the telescope has not looked at anything. Picture 2 is not shown yet.
            </li>
            <li>
              <strong>You press Run.</strong> A yellow dot appears on the lab's clock line, with the words "The lab looks now" and a clock reading beside it. This first moment is when the
              very first light from the spaceship's starting point reaches the telescope. Picture 2 appears below Picture 1.
            </li>
            <li>
              <strong>The dot climbs.</strong> As the lab's clock runs, the yellow dot rises up the clock line, and the number beside it counts up in seconds. The animation takes about 10
              real seconds to cover the whole run. That only sets how fast you watch it. It does not change what the experiment finds.
            </li>
            <li>
              <strong>The yellow lines follow the dot.</strong> At every moment, two yellow lines go down from the dot, one down to the left and one down to the right. Together they are
              the past light cone. The spaceship is on the right of the lab, so the line that matters is the one going down to the right. It is the line that meets the spaceship's path.
              The line going to the left has no spaceship to meet, so you can ignore it.
            </li>
            <li>
              <strong>The solid square flies along the path.</strong> This is the spaceship itself, where the lab works out it is at the moment of the yellow dot. It is always at the same
              height as the dot. As the dot climbs, the solid square moves along the spaceship's path in the direction the spaceship is flying.
            </li>
            <li>
              <strong>The hollow square moves too.</strong> It is always where the right-hand yellow line crosses the path. When the dot moves up, the yellow line moves up with it, so the
              crossing point slides along the path as well. Watch the two squares side by side. They are not in the same place.
            </li>
            <li>
              <strong>Picture 2 is drawn at the same time.</strong> A dotted yellow line moves across it from left to right. It is the current moment of looking. Two squares sit on that
              line, one solid and one hollow, and their heights are the two distances from the lab, the real one and the seen one. Behind them, a solid line and a dashed line grow longer,
              following the squares, so you can see how each distance changed over the whole run.
            </li>
            <li>
              <strong>To read any moment.</strong> Look at the clock number beside the yellow dot. Then go straight down from the solid square to the position numbers at the bottom of
              Picture 1. That number is how far away the spaceship really is at that moment. Do the same from the hollow square. That number is how far away the spaceship looks to be.
            </li>
            <li>
              <strong>The end.</strong> The animation stops when the dot reaches the moment the last light from the end of the journey arrives at the telescope. Everything stays on the
              screen. The key above Picture 2 now gives the speed of each line, Panel B joins Picture 2, the results appear below, and you can press Run again once you have pressed Start
              over.
            </li>
          </ol>

          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>A worked moment, with numbers that are not among the choices.</strong> Say a spaceship flies toward the lab at 0.4c, from 5 light-seconds away, and the lab looks at its
            clock reading 8 seconds. Step 1: by 8 seconds the spaceship has flown 0.4 × 8 = 3.2 light-seconds, so it really is 5 − 3.2 = 1.8 light-seconds away. That is the solid square. Step
            2: which light is arriving at the telescope at 8 seconds? Suppose it left the spaceship at 5 seconds. By then the spaceship had flown 0.4 × 5 = 2 light-seconds, so it was 5 − 2 = 3
            light-seconds away. Light takes 3 seconds to cover 3 light-seconds, so it arrives at 5 + 3 = 8 seconds. That matches, so the telescope shows the spaceship at 3 light-seconds away.
            That is the hollow square. So at that moment, the spaceship really is 1.8 light-seconds away, but it looks to be 3 light-seconds away, where it was 3 seconds earlier.
          </p>

          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList
            items={[
              {
                look: 'the solid square and the hollow square on the orange path, at any moment',
                means: `they are in different places. At the moment of looking, the lab works out that the spaceship is at the solid square, but the telescope shows it at the hollow square, where it was when the light left it. At the first moment of looking, for example, the spaceship really is ${two(first.measuredPosition)} light-seconds away and looks to be ${two(first.seenPosition)}`,
                matters: 'this is the difference between measured and seen, the idea this experiment is about',
              },
              {
                look: 'how the hollow square moves along the path as the yellow dot climbs, compared with the solid square',
                means: `both slide along the same path, but not at the same rate. By the last moment of looking the hollow square has gone from ${two(first.seenPosition)} to ${two(last.seenPosition)} light-seconds and the solid square from ${two(first.measuredPosition)} to ${two(last.measuredPosition)}`,
                matters: 'the rate of the hollow square is the speed of the image, which is what your guess was about',
              },
            ]}
          />
        </>
      )}
      <WhereFrom>
        <strong>Calculated here:</strong> the path, from the speed shown and straight-line motion, and (once the run starts) the two squares, from the time light takes to travel (distance divided
        by the speed of light). <strong>Measured:</strong> nothing. <strong>Imagined:</strong> the lab, the spaceship and its speed. No formula from relativity is used.
      </WhereFrom>
    </div>
  )
}

// ---- The caption of Picture 2 (the graph), with Panel B once the run has ended ----

function GraphCaption({ direction, speed, complete, withGuess }: { direction: Direction; speed: number; complete: boolean; withGuess: boolean }) {
  const run = runSeeingExperiment(direction, speed)
  const first = run.samples[0]
  const last = run.samples[run.samples.length - 1]
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this graph.</strong> Across the bottom is the lab's clock, in seconds. Up the side is the distance from the lab, in light-seconds. There are two lines. A line
        that is steeper is changing its distance faster.
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The solid line with solid squares.</strong> Where the spaceship really is.
        </li>
        <li>
          <strong>The dashed line with hollow squares.</strong> Where the spaceship looks to be. They are the same two squares as in Picture 1, now shown against the lab's clock.
        </li>
        <li>
          <strong>The dotted yellow line.</strong> The current moment of looking, moving from left to right as the run plays. When the run ends, the key above the graph gives each line's speed.
        </li>
        {complete && withGuess && (
          <li>
            <strong>Panel B, below the graph.</strong> A strip of speeds, as a fraction of c (1 is the speed of light, the dashed yellow line). The solid orange tick is the spaceship's real
            speed and the hollow diamond is the image's speed. The three stretches under the line are the three answers: "slower" is the stretch to the left of the real speed, "the same" is the
            tick itself, and "faster" is the stretch to the right. <strong>The white ring and the YOUR GUESS box are your guess, drawn on the stretch it names. The white mark is only a marker
            for your answer: it has no size of its own and it is not a measurement.</strong> It does not change the real graph or the real speeds.
          </li>
        )}
      </ul>
      {complete && (
        <>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList
            items={[
              {
                look: 'where each line starts and how steep each is',
                means: `over the same ${two(run.imageDuration)} seconds of the lab's clock, the dashed line goes from ${two(first.seenPosition)} to ${two(last.seenPosition)} light-seconds and the solid line goes from ${two(first.measuredPosition)} to ${two(last.measuredPosition)}`,
                matters: "a steeper line is a faster change of distance, so the image's speed is not the spaceship's speed",
              },
              ...(withGuess
                ? [
                    {
                      look: 'your white ring in Panel B and the hollow diamond',
                      means: 'where your answer falls against the real result',
                      matters: 'a guess is a way of testing an idea; the tutor goes through yours',
                    },
                  ]
                : []),
            ]}
          />
        </>
      )}
      <WhereFrom>
        <strong>Calculated here:</strong> both lines and both speeds, from straight-line motion plus the time the light takes to travel (distance divided by the speed of light). <strong>Measured:</strong>{' '}
        nothing. <strong>Imagined:</strong> the spaceship, the lab and the {speed}c speed.
        {withGuess && <> The white mark is your guess, drawn on the stretch it names; it shows only your guess.</>}
      </WhereFrom>
    </div>
  )
}

// Changing the direction or the speed in Part 2 clears only Part 2's drawings; Part 1, the results and the tutor stay as they were.
export function SeeingThePastExperiment({ onComplete, onTutorComplete }: SeeingThePastExperimentProps) {
  // ---- Part 1: one guess, one fixed run (a spaceship coming toward the lab at 0.6c) ----
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState<PlayStatus>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the Start overs, so the tutor starts again at its first question.
  const [resetCount, setResetCount] = useState(0)
  const partOne = runSeeingExperiment(PART_ONE_DIRECTION, PART_ONE_SPEED)

  // ---- Part 2: the learner's own direction and speed ----
  const [direction, setDirection] = useState<Direction>(PART_ONE_DIRECTION)
  const [speed, setSpeed] = useState(PART_ONE_SPEED)
  const [ownStatus, setOwnStatus] = useState<PlayStatus>('idle')
  const [ownProgress, setOwnProgress] = useState(0)
  const ownRun = runSeeingExperiment(direction, speed)

  usePlayback(status, setStatus, setProgress, onComplete)
  usePlayback(ownStatus, setOwnStatus, setOwnProgress)

  // Parts 2, 3 and 4 appear as soon as the first Run has finished.
  const partOneDone = status === 'complete'
  const playing = status === 'running' || ownStatus === 'running'
  const startOverDisabled = (prediction === null && status === 'idle' && ownStatus === 'idle') || playing

  const handleRun = () => {
    if (prediction === null || locked) return
    setLocked(true)
    setProgress(0)
    setStatus('running')
  }
  // Start over: clears the guess, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    if (playing) return
    setPrediction(null)
    setLocked(false)
    setStatus('idle')
    setProgress(0)
    setDirection(PART_ONE_DIRECTION)
    setSpeed(PART_ONE_SPEED)
    setOwnStatus('idle')
    setOwnProgress(0)
    setResetCount((n) => n + 1)
  }
  const chooseDirection = (value: Direction) => {
    setDirection(value)
    setOwnStatus('idle')
    setOwnProgress(0)
  }
  const chooseSpeed = (value: number) => {
    setSpeed(value)
    setOwnStatus('idle')
    setOwnProgress(0)
  }
  const handleRunOwn = () => {
    setOwnProgress(0)
    setOwnStatus('running')
  }

  const guessLabel = prediction === null ? '' : PREDICTION_CHOICES.find((c) => c.value === prediction)!.label

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>What You See Is the Past: Where Is the Spaceship, and Where Does It Look to Be?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* ===== Above Part 1: the introduction, the links and the words ===== */}
        <SeeingThePastIntro />
        <ReferencePanel entries={seeingThePastWordsEntries(partOneDone)} />
        <SeeingThePastLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color={PART_ONE_COLOR} title="Part 1: Predict, then watch">
          You will make one guess about one spaceship, then press Run and watch the lab look at it through a telescope. The real pictures and tables never change with your guess. Your guess is
          drawn on them in white once the run ends, and it appears again beside the results.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            A spaceship flies <strong>{directionWords(PART_ONE_DIRECTION)}</strong> at <strong>{PART_ONE_SPEED}c</strong>. This is its real speed, worked out with the lab's ruler and synchronized
            clocks. An observer in the lab watches it through a telescope. The picture the observer sees is made of light that reaches the telescope now, and that light left the spaceship earlier.
            Compared with the spaceship's real speed, how fast does its <em>image</em> seem to move across the observer's view?
          </p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.5rem' }}>Your guess is drawn on Panel B, the strip of speeds under the graph, in white.</p>
          <div>
            {PREDICTION_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                disabled={locked}
                onClick={() => setPrediction(choice.value)}
                className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: locked ? 'not-allowed' : 'pointer' }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={smallNote}>{prediction !== null ? `Your prediction: ${guessLabel.toLowerCase()}.` : 'Choose an option to continue'}</p>
          {locked && <p style={smallNote}>Your prediction is locked while you try other settings. To change it, press Start over.</p>}
        </div>

        <button type="button" className="action-button" onClick={handleRun} disabled={prediction === null || locked} style={{ padding: '0.6rem 1.5rem' }}>
          {status === 'running' ? 'Running...' : locked ? 'Run (done)' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{ marginLeft: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: startOverDisabled ? 'not-allowed' : 'pointer', opacity: startOverDisabled ? 0.5 : 1 }}
        >
          Start over
        </button>
        {prediction === null && <p style={smallNote}>Choose a prediction above to run the experiment.</p>}

        <p style={{ ...pictureTitle }}>Picture 1: the map of space and time</p>
        <Diagram direction={PART_ONE_DIRECTION} speed={PART_ONE_SPEED} progress={status === 'idle' ? null : progress} />
        <MapCaption direction={PART_ONE_DIRECTION} speed={PART_ONE_SPEED} started={status !== 'idle'} />

        {status === 'idle' ? (
          <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1rem' }}>Picture 2, the graph of the spaceship's distance, and Panel B, the strip of speeds, appear here when you press Run.</p>
        ) : (
          <>
            <p style={{ ...pictureTitle }}>Picture 2: the graph of the spaceship's distance{partOneDone ? ', with Panel B' : ''}</p>
            <PositionPlot direction={PART_ONE_DIRECTION} speed={PART_ONE_SPEED} progress={progress} strip={{ guess: prediction }} />
            <GraphCaption direction={PART_ONE_DIRECTION} speed={PART_ONE_SPEED} complete={partOneDone} withGuess={prediction !== null} />
          </>
        )}

        {/* ===== Part 2: appears when the first Run has finished ===== */}
        {partOneDone && (
          <>
            <PartHeader color={PART_TWO_COLOR} title="Part 2: Now try it yourself">
              Now you choose the direction and the speed, and run it as often as you like. Your guess stays as it was. It does not change any picture or table; these settings do. They are trial
              values for an imagined spaceship, and they do not say that a real spaceship is like that.
            </PartHeader>

            <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
              Your guess does not change the drawings or the tables. These settings change Drawing A and Drawing B below. Part 1 and Part 3 stay as they were.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Direction of the spaceship</label>
              <div style={{ marginBottom: '1rem' }}>
                {DIRECTION_CHOICES.map((choice) => (
                  <button
                    key={choice.value}
                    onClick={() => chooseDirection(choice.value)}
                    disabled={ownStatus === 'running'}
                    className={`toggle-button${direction === choice.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The spaceship's real speed</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                This is the speed the lab works out with its ruler and synchronized clocks. It is given as a fraction of <strong>c</strong>, the speed of light.
              </p>
              <div>
                {SPEED_PRESETS.map((value) => (
                  <button
                    key={value}
                    onClick={() => chooseSpeed(value)}
                    disabled={ownStatus === 'running'}
                    className={`toggle-button${speed === value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {value}c
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="action-button" onClick={handleRunOwn} disabled={ownStatus === 'running'} style={{ padding: '0.6rem 1.5rem' }}>
              {ownStatus === 'running' ? 'Running...' : 'Run these settings'}
            </button>

            {ownStatus === 'idle' ? (
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1rem' }}>
                Choose a direction and a speed, then press Run these settings. Drawing A (the map and the graph) and Drawing B (the two speeds) appear here.
              </p>
            ) : (
              <>
                <p style={{ ...pictureTitle, color: PART_TWO_COLOR }}>Drawing A: the map and the graph, for your settings ({speed}c, {directionWords(direction)})</p>
                <Diagram direction={direction} speed={speed} progress={ownProgress} accent={PART_TWO_COLOR} />
                <div style={{ marginTop: '1rem' }}>
                  <PositionPlot direction={direction} speed={speed} progress={ownProgress} accent={PART_TWO_COLOR} />
                </div>
                <div style={captionStyle}>
                  <p style={{ margin: '0 0 0.5rem' }}>
                    <strong>How to read Drawing A.</strong> These are Picture 1 and Picture 2 again, drawn for your settings. The spaceship's marks are pink here, because they follow your settings.
                    Everything else means what it meant in Part 1: the solid square and solid line are where the spaceship really is, and the hollow square and dashed line are where it looks to be.
                  </p>
                </div>
                {ownStatus === 'complete' && (
                  <>
                    <p style={{ ...pictureTitle, color: PART_TWO_COLOR }}>Drawing B: the two speeds, for your settings</p>
                    <SpeedBars
                      accent={PART_TWO_COLOR}
                      rows={[
                        { name: "The spaceship's real speed", speed: ownRun.measuredSpeed, hollow: false },
                        { name: "The image's speed (where the spaceship looks to be)", speed: ownRun.imageSpeed, hollow: true },
                      ]}
                    />
                    <div style={captionStyle}>
                      <p style={{ margin: 0 }}>
                        <strong>How to read Drawing B.</strong> Each bar is a speed, as a fraction of c, and both use the same scale. The solid bar is the spaceship's real speed, and the hollow bar
                        is the speed of its image. The dashed yellow line marks 1, the speed of light. A bar that stops before the line is slower than light, and a bar that goes past the line is
                        faster than light.
                      </p>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ===== Part 3: the results of Part 1's run ===== */}
            <PartHeader color={PART_THREE_COLOR} title="Part 3: The results">
              Here are the numbers behind the pictures, a check-up of this page against its own physics, and your guess beside the real result.
            </PartHeader>
            {prediction !== null && <SeeingThePastResultsTables prediction={prediction} />}
            <SpeedBars
              rows={[
                { name: "The spaceship's real speed", speed: partOne.measuredSpeed, hollow: false },
                { name: "The image's speed (where the spaceship looks to be)", speed: partOne.imageSpeed, hollow: true },
              ]}
            />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>How to read this drawing.</strong> Each bar is a speed, as a fraction of c, and both use the same scale. The solid bar is the spaceship's real speed, and the hollow bar is the
                speed of its image. The dashed yellow line marks 1, the speed of light. A bar that stops before the line is slower than light, and a bar that goes past the line is faster than light. The
                numbers on the right say the same thing.
              </p>
              <p style={{ margin: '0 0 0.25rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'the hollow bar against the yellow dashed line',
                    means:
                      partOne.imageSpeed > 1
                        ? `it goes past the line: the image's speed is ${two(partOne.imageSpeed)}c, more than the speed of light`
                        : `it stops before the line: the image's speed is ${two(partOne.imageSpeed)}c, less than the speed of light`,
                    matters:
                      partOne.imageSpeed > 1
                        ? 'this looks like it breaks the speed limit, which the tutor explains does not happen'
                        : 'the image is slower than light here, as the spaceship is',
                  },
                  {
                    look: 'the hollow bar against the solid bar',
                    means: `the image's speed is ${(partOne.imageSpeed / partOne.measuredSpeed).toFixed(1)} times the real speed here (${two(partOne.imageSpeed)} ÷ ${two(partOne.measuredSpeed)})`,
                    matters: 'it shows by how much seeing differs from measuring',
                  },
                ]}
              />
            </div>
            <SeeingThePastJetLinks />

            {/* ===== Part 4: the tutor ===== */}
            <PartHeader color={PART_FOUR_COLOR} title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your guess compares with the pictures, and one question about why the image moves as it does. Then it goes through your guess and
              explains. The tutor's questions are not marked.
            </PartHeader>
          </>
        )}
      </div>

      {partOneDone && prediction !== null && (
        <SeeingThePastTutor
          key={resetCount}
          direction={PART_ONE_DIRECTION}
          speed={PART_ONE_SPEED}
          predicted={prediction}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
