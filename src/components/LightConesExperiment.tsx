import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { PRESET_EVENTS, runLightConeExperiment } from '../physics/lightCones'
import type { EventRelation, PairReading } from '../physics/lightCones'
import { LightConesTutor } from './LightConesTutor'
import { SPEED_OF_LIGHT } from '../physics/movingClockExperiment'

// Steps 2 to 7 (basic interface, prediction, run gate, playback, results, tutor) of docs/experiments/spacetime-geometry/02-light-cones.md:
// introduction, controls, the prediction, the Run button, the diagram with its caption and playback, the results, and
// the tutor, which is shown below the card once the results are.
// Presets are the defaults of Decisions 4 and 6 of that specification.
const PASSING_SPEED_PRESETS = [-0.5, -0.3, 0, 0.3, 0.5]

type Prediction = 'slower' | 'light-only' | 'no'

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

// While idle it draws only the setup: the lab's two axes, event O and event B, and the passing observer. It deliberately
// draws no light cone and no regions then: where B sits relative to the cone is the answer to the prediction (§12).
// While the run plays, the lab's clock counts up and the flash of light spreads from O at one light-second per second,
// and B appears at its time. When the run ends, the whole cone and its regions are drawn.
function Diagram({ eventIndex, passingSpeed, progress }: DiagramProps) {
  const { event } = runLightConeExperiment(PRESET_EVENTS[eventIndex], passingSpeed)
  const playing = progress !== null
  const complete = progress !== null && progress >= 1
  const labTime = (progress ?? 0) * MAX_TIME
  const showB = !playing || labTime >= event.time
  // How far the flash has spread by now, in light-seconds, on each side of O.
  const frontSpread = SPEED_OF_LIGHT * labTime
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
      aria-label={`${complete ? 'Result: the light cone of event O, with its inside, its edge and its outside, and event B. ' : playing ? 'Playback: a flash of light spreads out from event O. ' : 'Setup: '}Event O is here and now, at position 0 and time 0. Event B happens ${eventLabel(eventIndex)}. A passing observer is shown: ${passingLabel(passingSpeed).toLowerCase()}.`}
      style={SVG_STYLE}
    >
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Space and time, from the lab's point of view
      </text>

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
          <text x="30" y="36">Inside the cone: something slower than light could get here</text>
          <rect x="12" y="41" width="12" height="3" fill={FLASH_COLOR} />
          <text x="30" y="49">Edge of the cone: the flash itself; only light could get here</text>
          <rect x="12" y="54" width="12" height="8" fill={OUTSIDE_COLOR} fillOpacity="0.6" />
          <text x="30" y="62">Outside the cone: nothing could get here</text>
          <rect x="12" y="67" width="12" height="8" fill={PAST_COLOR} fillOpacity="0.5" />
          <text x="30" y="75">Past half: where a flash could have come from to reach O</text>
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
function ResultsBars({ rows }: { rows: ObserverRow[] }) {
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

// The prediction is about the chosen event B, so choosing a different B clears it; the passing observer's speed does not
// affect the question and keeps it. Changing the event, the speed or the prediction returns to the idle state, so a run
// is never shown for different settings.
interface LightConesExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function LightConesExperiment({ onComplete, onTutorComplete }: LightConesExperimentProps) {
  const [eventIndex, setEventIndex] = useState(0)
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

  // The results are shown only when the playback has ended; the physics result does not depend on the prediction.
  const result = useMemo(() => runLightConeExperiment(PRESET_EVENTS[eventIndex], passingSpeed), [eventIndex, passingSpeed])
  const observers: ObserverRow[] = [
    { name: 'The lab', reading: result.lab },
    { name: 'The passing observer', reading: result.passing },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 2 — Light Cones: Which Events Can Affect Which</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: wording approved by the owner on 2026-10-13 (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Imagine you shout across a field. Sound travels about 340 meters every
            second. A friend stands 1,000 meters away. Two seconds after your shout, the sound has covered only 680
            meters, so it has not reached your friend yet. Whatever your friend does at that moment, your shout
            cannot have caused it. The news simply has not arrived. So whether one thing can affect another depends
            on whether a signal can cover the distance in the time available. This experiment asks the same
            question about light, the fastest signal there is: for two events, could anything that starts at the
            first reach the second in time? And would a moving observer, who measures a different time and a
            different distance, give a different answer?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> An <strong>event</strong> is something that happens at one
            place at one moment. A <strong>signal</strong> is anything that carries an effect from one place to
            another: a shout, a flash of light, a spaceship. We measure distance in <strong>light-seconds</strong>:
            one light-second is the distance light travels in one second, about 300,000 kilometers. So light covers
            1 light-second in 1 second, 2 in 2 seconds, and so on. The <strong>light cone</strong> of an event is the
            set of all the events that a flash of light from it could reach. Its future half holds the events the
            flash can reach later. Its past half holds the events from which a flash could have reached it.
            Real space has three dimensions, so a flash spreads out as a growing ball, and the cone is a picture of
            that growing ball over time. To make it fit on a page, the drawings here show only one dimension of
            space, along a line.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Event O is "here, now": you, in the lab, at time 0. Event B is another
            event, a few seconds later and some distance away. When you run the experiment, a flash of light leaves
            O and spreads out in both directions, and you see whether it gets to B's position before B happens,
            exactly when B happens, or too late. A passing observer, who moves past the lab, then measures the same
            two events with their own ruler and clock.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Working it out yourself.</strong> You can already test whether a signal could make it. Take an
            example that is not one of the choices below: an event 2 seconds after O and 1 light-second away. Light
            covers 2 light-seconds in 2 seconds, and the event is only 1 light-second away, so light would arrive
            with time to spare. To get there in time, something would need a speed of 1 ÷ 2 = 0.5 of the speed
            of light. Anything that can go at that speed or faster, up to the speed of light, could make it.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose event B and the passing observer's speed. Then you will predict
            whether anything could get from O to B, and run the experiment to see.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What we assume.</strong> Space is flat, with no gravity. Every speed stays steady, and
            everything moves along one line. Speeds are given as a fraction of <strong>c</strong>, the speed of
            light. Nothing can travel faster than light.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Event B</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            Each choice says when B happens after O, and how far from O it is. Time is measured in the lab.
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
            Event O is "here, now". Event B happens {eventLabel(eventIndex)}. Could something that starts at O, and
            never goes faster than light, arrive at B in time to be there when B happens?
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
              ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.toLowerCase()}.`
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
              <strong>How to read this diagram.</strong> The drawing is from the lab's point of view. Position runs
              left to right, and time runs upward, so an event higher up happens later.
            </p>
            <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The horizontal grey line</strong> is the lab's ruler, at time 0. Its numbers are distances in
                light-seconds from the middle. A mark that says 2 is 2 light-seconds, about 600,000 kilometers, from
                the middle. Marks to the left are negative.
              </li>
              <li>
                <strong>The vertical grey line</strong> is the lab itself, which stays at the middle of the ruler as
                time goes by. Its numbers are seconds on the lab's clock.
              </li>
              <li>
                <strong style={{ color: EVENT_O_COLOR }}>Blue square (O):</strong> "here, now", the start. It is at
                the middle of the ruler, at time 0.
              </li>
              <li>
                <strong style={{ color: EVENT_B_COLOR }}>Orange square (B):</strong> the other event. Its height is
                when it happens, and its place along the ruler is how far away it is. The dashed orange lines show
                both numbers: one down to the ruler, one across to the lab's clock.
              </li>
              <li>
                <strong style={{ color: OBSERVER_COLOR }}>Purple square (the passing observer):</strong> shown at the
                top right. The arrow shows which way they move relative to the lab, and no arrow means they are at
                rest in the lab. In this drawing they are only shown, not moved.
              </li>
              <li>
                <strong style={{ color: FLASH_COLOR }}>Yellow lines (the flash of light):</strong> appear when you press
                Run. A flash leaves O in both directions and spreads at 1 light-second every second, so each yellow
                line climbs one light-second across for every second up. While it plays, a dashed line marks the
                lab's clock, and the yellow dots are the front of the flash. B appears when the lab's clock reaches
                its time.
              </li>
              <li>
                <strong>The shaded regions:</strong> when the run ends, the yellow lines are the edges of the light
                cone. <strong style={{ color: INSIDE_COLOR }}>Teal</strong> is inside the cone: events that something
                slower than light could reach from O. <strong style={{ color: OUTSIDE_COLOR }}>Rose</strong> is
                outside the cone: events that nothing could reach, not even light.{' '}
                <strong style={{ color: PAST_COLOR }}>The dimmed grey triangle</strong> below the ruler is the past
                half of the cone. The key at the top of the drawing says the same.
              </li>
            </ul>
            <p style={{ margin: 0 }}>
              <strong>What to look for.</strong> Choose different events B and watch where the orange square lands.
              Each choice is a different time and a different distance. Ask yourself how fast something would have
              to go to get from O to B, remembering that light covers 1 light-second in 1 second. Then press Run
              and watch the front of the flash. Does it get to B's position before B happens, exactly when B
              happens, or too late? When the run ends, look at which region B is in. What each observer measures
              appears in the results, below.
            </p>
          </div>
        </div>
        {status === 'complete' && prediction !== null && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Event B happened {eventLabel(eventIndex)}, and the passing observer was {passingLabel(passingSpeed).toLowerCase()}. Times and
              distances are measured by each observer, and the lab's numbers are the first row. Your prediction was: {PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.toLowerCase()}.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
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
                  {observers.map((o) => (
                    <tr key={o.name}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{o.name}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{o.reading.timeBetween.toFixed(2)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{Math.abs(o.reading.distanceBetween).toFixed(2)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{signed(o.reading.intervalSquared)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{o.reading.speedNeeded.toFixed(2)}c</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{RELATION_NAMES[o.reading.relation]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 0 }}>
              In the last column, "reachable" means B is inside the light cone, "light only" means B is on its edge,
              and "unreachable" means B is outside it.
            </p>

            <ResultsBars rows={observers} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>How to read this drawing.</strong> Two observers each measured the same two events, O and B. Each
                observer gets one row, in the same order as the table above. The drawing shows the same numbers as the
                table, as lengths and as a coloured block.
              </p>
              <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong style={{ color: TIME_COLOR }}>Blue bar (time):</strong> how much time that observer found
                  between O and B, in seconds ("s"). A longer bar means more time passed, according to that observer.
                </li>
                <li>
                  <strong style={{ color: DISTANCE_COLOR }}>Pink bar (distance):</strong> how far apart that observer
                  found O and B, in light-seconds ("ls"). A pink bar with no length would mean the observer found both
                  events at the same place.
                </li>
                <li>
                  <strong>The blue and pink bars share one scale,</strong> set by the longest bar in the drawing, which
                  is named at the bottom. So you can compare a blue bar and a pink bar directly, and compare bars in
                  different rows.
                </li>
                <li>
                  <strong>The block on the right (time² − distance²):</strong> worked out for each observer from their
                  own two numbers: multiply the time by itself, multiply the distance by itself, and subtract. For
                  example, a row with time 3.00 s and distance 2.00 ls would give 3 × 3 − 2 × 2 = 9 − 4 = 5.00. The
                  block is the same size in every row on purpose, so read the number written inside it. Its colour
                  shows the sign of the number, with the same colours as the cone in the drawing above:{' '}
                  <strong style={{ color: INSIDE_COLOR }}>teal</strong> for a positive number,{' '}
                  <strong style={{ color: FLASH_COLOR }}>yellow</strong> for zero and{' '}
                  <strong style={{ color: OUTSIDE_COLOR }}>rose</strong> for a negative number. The word under the block
                  says which case that is.
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>What to look for.</strong> Compare how the blue and pink bars change from one row to the next.
                Then compare the blocks: their numbers, their colours and the words under them. Next, change the
                passing observer's speed, run again, and see whether what you noticed still holds. Then try a different
                event B. A good test is to try the passing observer at rest in the lab (0c), then at −0.5c.
              </p>
            </div>
          </div>
        )}
      </div>

      {status === 'complete' && prediction !== null && (
        <LightConesTutor
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
