import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { measuredPositionAt, runSeeingExperiment, seenAt } from '../physics/seeingThePast'
import type { Direction } from '../physics/seeingThePast'
import { SeeingThePastTutor } from './SeeingThePastTutor'

// Steps 4 to 7 of docs/experiments/spacetime-geometry/04-what-you-see-is-the-past.md: the controls, the setup diagram, and the
// playback that connects the diagram to the physics model (the lab's looking event moves up, the past light cone is drawn from
// it, and the real spaceship and the seen spaceship are marked on the spaceship's path), with the second plot of the two positions. Every
// position comes from `seeingThePast.ts`. Step 6 adds the prediction, which gates the Run button. Step 7 adds the results panel, and the draft introduction opens
// the page. Step 8 adds the tutor, which is shown below the card once the results are. Presets are Decision 3 and the fixed runs are Decision 4 of that specification. Wording here is draft
// for the owner's review (CLAUDE.md §28.1).
const SPEED_PRESETS = [0.3, 0.5, 0.6, 0.9]
type Prediction = 'slower' | 'same' | 'faster'

// The three answers of the prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1).
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
const SHIP_COLOR = '#f59e0b'
const CONE_COLOR = '#facc15'
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
}

function lerp(a: number, b: number, fraction: number): number {
  return a + (b - a) * fraction
}

// While idle it draws only the setup: the lab's axes, the eye at position 0, the lab's clock line, and the spaceship's path as the lab
// works it out. It deliberately draws no telescope view then: where the spaceship looks to be is what the learner is asked to
// predict (§12). While the run plays, the lab's looking event moves up its clock line, the past light cone is drawn from it
// (two lines going down), and two squares are marked on the spaceship's path: a hollow one where the cone crosses it (where the spaceship
// looks to be) and a solid one at the same lab time as the looking event (where the spaceship really is).
function Diagram({ direction, speed, progress }: DiagramProps) {
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
  if (playing) looking = seenAt(direction, speed, lerp(run.firstLooking, run.lastLooking, progress))
  // The right edge of the cone runs down and out at one light-second per second, until it leaves the drawing.
  const coneReach = looking === null ? 0 : Math.min(looking.lookingTime, maxPosition)
  const leftReach = looking === null ? 0 : Math.min(looking.lookingTime, -MIN_POSITION)
  // The cone's label is turned to lie along its right edge.
  const edgeAngle =
    looking === null
      ? 0
      : (Math.atan2(yOf(looking.lookingTime - coneReach) - yOf(looking.lookingTime), xOf(coneReach) - xOf(0)) * 180) / Math.PI

  // A label for a mark in the right third of the drawing goes to the left of the mark, so it stays inside the drawing.
  const nearRight = (position: number) => xOf(position) > VIEW_WIDTH * 0.62
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

function PositionPlot({ direction, speed, progress }: { direction: Direction; speed: number; progress: number }) {
  const run = runSeeingExperiment(direction, speed)
  const complete = progress >= 1
  const timeMin = Math.floor(run.firstLooking)
  const timeMax = Math.ceil(run.lastLooking)
  const realAt = (time: number) => measuredPositionAt(direction, speed, time)
  const positionMax = Math.ceil(Math.max(realAt(run.lastLooking), realAt(run.firstLooking), ...run.samples.map((sample) => sample.seenPosition)))
  const xOfTime = (time: number) => PLOT_LEFT + ((time - timeMin) / (timeMax - timeMin)) * (PLOT_RIGHT - PLOT_LEFT)
  const yOfPosition = (position: number) => PLOT_BOTTOM - (position / positionMax) * (PLOT_BOTTOM - PLOT_TOP)
  const now = seenAt(direction, speed, lerp(run.firstLooking, run.lastLooking, progress))
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

  return (
    <svg
      viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
      role="img"
      aria-label={`Where the spaceship is and where it looks to be, against the lab's clock. At ${now.lookingTime.toFixed(2)} seconds the spaceship really is ${now.measuredPosition.toFixed(2)} light-seconds away, and it looks to be ${now.seenPosition.toFixed(2)} light-seconds away.${complete ? ` The spaceship's real speed is ${run.measuredSpeed.toFixed(2)}c and its image's speed is ${run.imageSpeed.toFixed(2)}c.` : ''}`}
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
function SpeedBars({ rows }: { rows: SpeedRow[] }) {
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

// Changing the direction or the speed returns to the idle state, so a run is never shown for different settings.
export function SeeingThePastExperiment({ onComplete, onTutorComplete }: SeeingThePastExperimentProps) {
  const [direction, setDirection] = useState<Direction>('approaching')
  const [speed, setSpeed] = useState(0.6)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  // The question names the direction and the speed, so changing either clears the prediction.
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  // Counts the runs so the tutor starts again at its first question after each run.
  const [runCount, setRunCount] = useState(0)
  const run = runSeeingExperiment(direction, speed)
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

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 4 — What You See Is the Past: Where Is the Spaceship, and Where Does It Look to Be?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Imagine a friend who is travelling toward you and mails you one postcard at
            the end of every day. You might expect a card to arrive every day. But each card is mailed from a place a
            little closer to you than the one before, so its trip is a little shorter, and the cards arrive less than a
            day apart. A friend travelling away from you does the opposite. Each card is mailed from farther away, its
            trip is longer, and the cards arrive more than a day apart. Light from a spaceship also takes time to reach a
            telescope. This experiment is about what that does to what the telescope shows. The first three experiments
            of this group were about what is <em>measured</em>: the times and distances an observer works out from their
            own ruler and synchronized clocks, after allowing for the time light takes to travel. Experiment 3 ended by
            saying that this is not what the observer sees with their own eyes. This experiment is about what is{' '}
            <em>seen</em>.
          </p>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some words we will use.</strong> Here is each one in plain language.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>The lab's telescope:</strong> the telescope the observer looks through. It is <em>in the lab</em>,
                not on the spaceship. It stays at the lab's own place, which we call position 0, and it never moves. On the
                diagram, the small circle at position 0 marks it and is labeled "The lab's eye and telescope". The spaceship
                is the thing being watched, far away from the telescope. The light that the telescope collects is light
                that left the spaceship and travelled to position 0.
              </li>
              <li>
                <strong>Light-second:</strong> the distance light travels in one second, about 300,000 kilometers. We
                measure distances in light-seconds, so light covers 1 light-second in 1 second, 2 in 2 seconds, and so
                on.
              </li>
              <li>
                <strong>Measured position:</strong> where the lab works out the spaceship is at a given moment, using its
                ruler and its synchronized clocks, as in the earlier experiments.
              </li>
              <li>
                <strong>Looking time:</strong> the reading of the lab's clock at the moment the observer looks through
                the lab's telescope.
              </li>
              <li>
                <strong>Seen position, or where the spaceship looks to be:</strong> the position the spaceship had when it sent
                the light that reaches the telescope at the looking time. The light has to travel first, so what the
                telescope shows is the spaceship as it was earlier. For example, if the spaceship was 3 light-seconds away when it
                sent the light, the light takes 3 seconds to arrive, so at the moment it arrives, the telescope shows
                the spaceship as it was 3 seconds earlier. We call this the spaceship's <strong>image</strong>. When we say the
                image <em>moves</em>, we mean that the place where the spaceship looks to be changes as the looking time
                goes on.
              </li>
              <li>
                <strong>Past light cone:</strong> the set of all the events whose light reaches the observer at one
                moment. In Experiment 2, a light cone showed which events a flash of light from one event could reach
                later. The past light cone is the same cone turned to point back in time: it holds the events from which
                a flash of light could have reached the observer's eye now. On the diagram, its two edges go downward
                from the moment of looking, because the light left earlier.
              </li>
            </ul>
          </div>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A spaceship flies in a straight line, steadily, either toward the lab or away
            from it. The lab can work out where the spaceship really is at every moment, using its ruler and synchronized
            clocks. An observer in the lab also watches the spaceship through a telescope. As the lab's clock runs, the
            diagram shows a yellow dot, which is the moment of looking, climbing the lab's clock line. From the dot,
            the past light cone goes down. Where the cone crosses the spaceship's path, a hollow square shows where the spaceship
            looks to be. A solid square shows where the spaceship really is at that same moment. A second drawing plots both
            positions against the lab's clock, so you can compare how they change. At the end, a table and a drawing
            give the two speeds.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Working out how the image moves.</strong> You can work this out with numbers. Here is an example that
            is not one of the choices below. A spaceship flies toward the lab at 0.4c, from 5 light-seconds away to 1
            light-second away. Step 1: it covers 4 light-seconds at 0.4 light-seconds per second, so by the lab's clock
            this takes 4 ÷ 0.4 = 10 seconds. Step 2: the first light, from 5 light-seconds away, takes 5 seconds to
            arrive, so the first image arrives at time 5. Step 3: the last light, sent after 10 seconds from 1
            light-second away, takes 1 second to arrive, so the last image arrives at time 10 + 1 = 11. Step 4: the
            image moved 4 light-seconds between time 5 and time 11, which is 6 seconds, so its speed is 4 ÷ 6 = 0.67c.
            The spaceship itself moved at 0.4c. The same steps work for any spaceship: find when the first and last light arrive,
            and divide the distance by the time between them.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> There are three things to do, in this order. First, choose whether the spaceship flies
            toward the lab or away from it. Second, choose its real speed, from four choices. Third, make your
            prediction: compared with the spaceship's real speed, will its image seem to move slower, at the same speed, or
            faster? You are not graded, and a guess is fine. The Run button stays switched off until you have chosen a
            prediction. Then press Run and watch the two squares and the second drawing. Try the other direction and
            other speeds afterwards to see how the picture changes.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What we assume.</strong> To keep the idea clear, we simplify the situation in five ways. (1) The spaceship
            flies straight toward the lab or straight away from it, so everything happens along one line. (2) Its speed
            stays steady, and there is no gravity. (3) The telescope shows only <em>where</em> the spaceship looks to be. It
            shows nothing about the spaceship's brightness or color. (4) The lab and its telescope stay at rest at position 0. Only the spaceship moves. (5) Nothing can travel faster than light. This rule
            applies to the spaceship, and to anything that carries a signal. Speeds are given as a fraction of{' '}
            <strong>c</strong>, the speed of light. For example, 0.6c means 60 percent of the speed of light, and 1c is
            the speed of light itself.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Direction of the spaceship</label>
          <div style={{ marginBottom: '1rem' }}>
            {DIRECTION_CHOICES.map((choice) => (
              <button
                key={choice.value}
                onClick={() => {
                  setDirection(choice.value)
                  setPrediction(null)
                  returnToIdle()
                }}
                className={`toggle-button${direction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The spaceship's real speed</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            This is the speed the lab works out with its ruler and synchronized clocks. It is given as a fraction of{' '}
            <strong>c</strong>, the speed of light.
          </p>
          <div>
            {SPEED_PRESETS.map((value) => (
              <button
                key={value}
                onClick={() => {
                  setSpeed(value)
                  setPrediction(null)
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

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            A spaceship flies <strong>{directionWords(direction)}</strong> at <strong>{speed}c</strong>. This is its real speed,
            worked out with the lab's ruler and synchronized clocks. An observer in the lab watches it through a
            telescope. The picture the observer sees is made of light that reaches the telescope now, and that light left
            the spaceship earlier. Compared with the spaceship's real speed, how fast does its <em>image</em> seem to move across
            the observer's view?
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
          <Diagram direction={direction} speed={speed} progress={status === 'idle' ? null : progress} />
        </div>

        {status !== 'idle' && (
          <div style={{ marginTop: '1.5rem' }}>
            <PositionPlot direction={direction} speed={speed} progress={progress} />
          </div>
        )}

        {/* Caption for both pictures: draft wording for the owner's review (CLAUDE.md §28.1). */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read these pictures.</strong> There are two pictures. The first is a <strong>map of space and
            time</strong>. The second, which appears when you press Run, is a <strong>graph of the spaceship's distance</strong>.
            Both are drawn from the lab's point of view. For your current choice, the spaceship flies{' '}
            {directionWords(direction)} at {speed}c.
          </p>

          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>Picture 1: the map of space and time.</strong> Think of a train timetable drawn as a picture. Sideways
            tells you <em>where</em>: how far from the lab, in light-seconds. The number 0 is the lab itself, and the
            higher the number, the farther to the right. Upward tells you <em>when</em>: the higher a point is, the later
            it is by the lab's clock, in seconds. So a point high up and far to the right is a place far from the lab at
            a late time. The parts of the map are:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The lab's eye and telescope.</strong> The small circle at the bottom, at position 0. This is where
              the observer stands and looks. The spaceship is not here. The spaceship is far away, and the telescope looks at it.
            </li>
            <li>
              <strong>The lab's clock line.</strong> The dashed sky-blue line going straight up from the circle. The lab
              stays at position 0, so as time passes, it only moves up. The line shows the lab's clock running.
            </li>
            <li>
              <strong>The spaceship's path.</strong> The orange line. Each point on it says where the lab works out the spaceship is
              at that moment, using its ruler and synchronized clocks. It is solid for the 4 light-seconds that the spaceship
              covers in {run.measuredDuration.toFixed(2)} seconds, and dashed after that, where the spaceship keeps flying. A
              label marks the place where it starts.
            </li>
            <li>
              <strong>The yellow dot, "The lab looks now".</strong> It appears when you press Run. It is the moment the
              observer looks through the telescope, and the number next to it is the lab's clock at that moment. As the
              clock runs, the dot climbs the lab's clock line.
            </li>
            <li>
              <strong>The two yellow lines, the "past light cone".</strong> They go down from the yellow dot. They show
              which places you are seeing, right now, and from when. Light covers 1 light-second each second. So light
              that reaches the telescope now and left 2 seconds ago came from 2 light-seconds away. Light that left 5
              seconds ago came from 5 light-seconds away. Mark those points on the map and they fall on a straight line
              sloping down from the dot: the yellow line. Anything on a yellow line is something the telescope is
              showing right now.
            </li>
            <li>
              <strong>The solid square, "Where the spaceship really is now".</strong> This is where the lab works out the spaceship
              is at the same moment as the yellow dot. It sits at the same height as the dot.
            </li>
            <li>
              <strong>The hollow square, "Where the spaceship looks to be".</strong> This is the place where a yellow line
              crosses the spaceship's path. The telescope is showing the spaceship at that spot, because that is where the spaceship was
              when it sent the light that is arriving now. It sits <em>lower</em> than the dot, because that light left
              earlier.
            </li>
          </ul>

          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>Picture 2: the graph of the spaceship's distance.</strong> Across the bottom is the lab's clock, in seconds.
            Up the side is the distance from the lab, in light-seconds. There are two lines. The{' '}
            <strong>solid line with solid squares</strong> is where the spaceship really is. The{' '}
            <strong>dashed line with hollow squares</strong> is where the spaceship looks to be. They are the same two squares as
            in Picture 1, now shown against the lab's clock. The dotted yellow line is the current moment of looking. A
            line that is steeper is changing its distance faster. When the run ends, the key above the graph gives each
            line's speed.
          </p>

          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>What happens in the animation, step by step.</strong> The animation is a way of watching the lab's
            clock run, from the first moment the observer has something to look at, to the last. Here is what you will
            see, in order.
          </p>
          <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Before you press Run.</strong> Picture 1 shows only what the lab has worked out with its ruler and
              clocks: the lab's eye and telescope, the lab's clock line, and the spaceship's path. There is no yellow dot,
              no yellow line and no square on the path yet, because the telescope has not looked at anything. Picture 2 is
              not shown yet.
            </li>
            <li>
              <strong>You press Run.</strong> A yellow dot appears on the lab's clock line, with the words "The lab looks
              now" and a clock reading beside it. This first moment is when the very first light from the spaceship's
              starting point reaches the telescope. Picture 2 appears below Picture 1.
            </li>
            <li>
              <strong>The dot climbs.</strong> As the lab's clock runs, the yellow dot rises up the clock line, and the
              number beside it counts up in seconds. The animation takes about 10 real seconds to cover the whole run.
              That only sets how fast you watch it. It does not change what the experiment finds.
            </li>
            <li>
              <strong>The yellow lines follow the dot.</strong> At every moment, two yellow lines go down from the dot,
              one down to the left and one down to the right. Together they are the past light cone. The spaceship is on
              the right of the lab, so the line that matters is the one going down to the right. It is the line that
              meets the spaceship's path. The line going to the left has no spaceship to meet, so you can ignore it.
            </li>
            <li>
              <strong>The solid square flies along the path.</strong> This is the spaceship itself, where the lab works out
              it is at the moment of the yellow dot. It is always at the same height as the dot. As the dot climbs, the
              solid square moves along the spaceship's path in the direction the spaceship is flying.
            </li>
            <li>
              <strong>The hollow square moves too.</strong> It is always where the right-hand yellow line crosses the
              path. When the dot moves up, the yellow line moves up with it, so the crossing point slides along the path
              as well. Watch the two squares side by side. They are not in the same place. The hollow square is always
              lower on the map than the solid square, because it marks light that left the spaceship earlier.
            </li>
            <li>
              <strong>Picture 2 is drawn at the same time.</strong> A dotted yellow line moves across it from left to
              right. It is the current moment of looking. Two squares sit on that line, one solid and one hollow, and
              their heights are the two distances from the lab, the real one and the seen one. Behind them, a solid line
              and a dashed line grow longer, following the squares, so you can see how each distance changed over the
              whole run.
            </li>
            <li>
              <strong>To read any moment.</strong> Look at the clock number beside the yellow dot. Then go straight down
              from the solid square to the position numbers at the bottom of Picture 1. That number is how far away the
              spaceship really is at that moment. Do the same from the hollow square. That number is how far away the
              spaceship looks to be.
            </li>
            <li>
              <strong>The end.</strong> The animation stops when the dot reaches the moment the last light from the end of
              the journey arrives at the telescope. Everything stays on the screen. The key above Picture 2 now gives the
              speed of each line, the results appear below, and you can press Run again.
            </li>
          </ol>

          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>A worked moment, with numbers that are not among the choices.</strong> Say a spaceship flies toward the lab
            at 0.4c, from 5 light-seconds away, and the lab looks at its clock reading 8 seconds. Step 1: by 8 seconds the
            spaceship has flown 0.4 × 8 = 3.2 light-seconds, so it really is 5 − 3.2 = 1.8 light-seconds away. That is the
            solid square. Step 2: which light is arriving at the telescope at 8 seconds? Suppose it left the spaceship at 5
            seconds. By then the spaceship had flown 0.4 × 5 = 2 light-seconds, so it was 5 − 2 = 3 light-seconds away. Light
            takes 3 seconds to cover 3 light-seconds, so it arrives at 5 + 3 = 8 seconds. That matches, so the telescope
            shows the spaceship at 3 light-seconds away. That is the hollow square. So at that moment, the spaceship really is 1.8
            light-seconds away, but it looks to be 3 light-seconds away, where it was 3 seconds earlier.
          </p>

          <p style={{ margin: 0 }}>
            <strong>What to look for.</strong> Follow these steps.
          </p>
          <ol style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Before you run:</strong> look at the lab, its clock line and the spaceship's path. Make your prediction.
            </li>
            <li>
              <strong>While it runs:</strong> watch the two squares on the spaceship's path. Which one is lower? Is one of them
              always on the same side of the other? Does the gap between them change as the yellow dot climbs?
            </li>
            <li>
              <strong>In Picture 2:</strong> watch the two lines grow. Do they start at the same height? Are they equally
              steep?
            </li>
            <li>
              <strong>When it ends:</strong> compare the speeds in the results below with your prediction. Then choose
              another direction or speed, make a prediction, and run it again.
            </li>
          </ol>
        </div>

        {/* Results: draft wording for the owner's review (CLAUDE.md §28.1). Values only; the explanation comes from the tutor (§12). */}
        {status === 'complete' && prediction !== null && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>What you ran.</strong> A spaceship flew {directionWords(direction)} at {speed}c, as the lab works it out
              with its ruler and synchronized clocks. The lab watched it through a telescope. <strong>Your prediction
              was:</strong> {PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.toLowerCase()}. It is only
              recorded here, not marked right or wrong.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>The table.</strong> The first row is the spaceship's real motion. The second row is the motion of its
              image, which means the place where the spaceship looks to be.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['', 'Distance covered (light-seconds)', 'Time it took (seconds)', 'Speed (fraction of c)'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "The spaceship's real motion", time: run.measuredDuration, speed: run.measuredSpeed },
                    { name: 'The image (where the spaceship looks to be)', time: run.imageDuration, speed: run.imageSpeed },
                  ].map((row) => (
                    <tr key={row.name}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{row.name}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{run.distanceCovered.toFixed(2)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{row.time.toFixed(2)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{row.speed.toFixed(2)}c</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What each number means.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Distance covered:</strong> how far the spaceship moved along its path, and how far the place where
                  it looks to be moved. Both are 4 light-seconds.
                </li>
                <li>
                  <strong>Time it took:</strong> for the spaceship, the time on the lab's clock between its start and its end.
                  For the image, the time on the lab's clock between the moment the first light arrived at the telescope
                  and the moment the last light arrived.
                </li>
                <li>
                  <strong>Speed:</strong> the distance covered divided by the time it took, as a fraction of{' '}
                  <strong>c</strong>. For example, 4 light-seconds in 10 seconds is 4 ÷ 10 = 0.40c.
                </li>
              </ul>
            </div>
            <SpeedBars
              rows={[
                { name: "The spaceship's real speed", speed: run.measuredSpeed, hollow: false },
                { name: "The image's speed (where the spaceship looks to be)", speed: run.imageSpeed, hollow: true },
              ]}
            />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>How to read this drawing.</strong> Each bar is a speed, as a fraction of c, and both use the same
                scale. The solid bar is the spaceship's real speed, and the hollow bar is the speed of its image. The dashed
                yellow line marks 1, the speed of light. A bar that stops before the line is slower than light, and a
                bar that goes past the line is faster than light. The numbers on the right say the same thing.
              </p>
              <p style={{ margin: 0 }}>
                <strong>What to look for.</strong> Compare the two bars with each other and with the yellow line. Then
                choose another direction or speed, make a prediction, and run it again to see which numbers change.
              </p>
            </div>
          </div>
        )}
      </div>

      {status === 'complete' && prediction !== null && (
        <SeeingThePastTutor
          key={runCount}
          direction={direction}
          speed={speed}
          predicted={prediction}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
