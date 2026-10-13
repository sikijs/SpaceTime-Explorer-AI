import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { runIntervalExperiment } from '../physics/spacetimeInterval'
import type { ObserverReading } from '../physics/spacetimeInterval'
import { SpacetimeIntervalTutor } from './SpacetimeIntervalTutor'

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

type Prediction = 'bigger' | 'same' | 'smaller'

// The three answers of the prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1).
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'bigger', label: 'Bigger in the lab' },
  { value: 'same', label: 'The same in both' },
  { value: 'smaller', label: 'Smaller in the lab' },
]

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
}

// Draws the setup, and while the run plays the moving clock travelling from tick 0 to tick 1: the lab ruler, the two events, the clock's path and the passing observer.
// It deliberately shows no interval and no other observer's numbers; those come after the run (§12).
function SetupDiagram({ clockSpeed, passingSpeed, progress }: SetupDiagramProps) {
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

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Setup: a clock moving at ${clockSpeed}c ticks twice, ${distance.toFixed(2)} light-seconds apart in the lab. A passing observer is shown: ${passingLabel(passingSpeed).toLowerCase()}.`}
      style={SVG_STYLE}
    >
      <text x={RULER_START_X} y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The lab's ruler (distance in light-seconds)
      </text>

      {/* The passing observer, above the ruler, with an arrow for the direction of travel. */}
      <rect x={VIEW_WIDTH / 2 - 16} y="34" width="32" height="20" rx="3" fill="#8b5cf6" />
      {passingSpeed !== 0 && (
        <g>
          <line
            x1={VIEW_WIDTH / 2 + (passingSpeed > 0 ? 22 : -22)}
            y1="44"
            x2={VIEW_WIDTH / 2 + (passingSpeed > 0 ? 62 : -62)}
            y2="44"
            stroke="#8b5cf6"
            strokeWidth="3"
          />
          <polygon
            points={
              passingSpeed > 0
                ? `${VIEW_WIDTH / 2 + 68},44 ${VIEW_WIDTH / 2 + 58},39 ${VIEW_WIDTH / 2 + 58},49`
                : `${VIEW_WIDTH / 2 - 68},44 ${VIEW_WIDTH / 2 - 58},39 ${VIEW_WIDTH / 2 - 58},49`
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
const BAR_START_X = 10
const BAR_MAX_LENGTH = 200
const INTERVAL_BAR_X = 330
const INTERVAL_BAR_LENGTH = 100
const ROW_HEIGHT = 80
const ROWS_TOP = 36

function ResultsBars({ rows }: { rows: ObserverRow[] }) {
  // Time is never shorter than distance (|distance| < time for a clock's ticks), so the longest time sets the scale.
  const longest = Math.max(...rows.flatMap((r) => [r.reading.timeBetween, Math.abs(r.reading.distanceBetween)]))
  const lengthOf = (value: number) => (Math.abs(value) / longest) * BAR_MAX_LENGTH

  return (
    <svg
      viewBox={`0 0 460 ${BARS_VIEW_HEIGHT}`}
      role="img"
      aria-label={`Bars of the time, the distance and time squared minus distance squared that each of the three observers found. ${rows
        .map((r) => `${r.name}: time ${r.reading.timeBetween.toFixed(2)}, distance ${Math.abs(r.reading.distanceBetween).toFixed(2)}, time squared minus distance squared ${r.reading.intervalSquared.toFixed(2)}`)
        .join('. ')}.`}
      style={SVG_STYLE}
    >
      <text x={BAR_START_X} y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Time and distance (one scale)
      </text>
      <text x={INTERVAL_BAR_X} y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        time² − distance²
      </text>
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
            <rect x={INTERVAL_BAR_X} y={y + 20} width={INTERVAL_BAR_LENGTH} height="34" rx="2" fill={INTERVAL_COLOR} />
            <text x={INTERVAL_BAR_X + INTERVAL_BAR_LENGTH / 2} y={y + 42} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0b1020">
              {row.reading.intervalSquared.toFixed(2)}
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

// Steps 2 to 7 (basic interface, prediction, run gate, playback, results, tutor) of docs/experiments/spacetime-geometry/01-the-interval.md.
// The tutor (Step 7) is shown below the card once the results are.
// Changing either speed or the prediction returns to the idle state, as in the other experiments.
interface SpacetimeIntervalExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function SpacetimeIntervalExperiment({ onComplete, onTutorComplete }: SpacetimeIntervalExperimentProps) {
  const [clockSpeed, setClockSpeed] = useState(0.6)
  const [passingSpeed, setPassingSpeed] = useState(0.5)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the runs so the tutor starts again at its first question after each run.
  const [runCount, setRunCount] = useState(0)
  // The results are shown only when the playback has ended; the physics result does not depend on the prediction.
  const result = useMemo(() => runIntervalExperiment(clockSpeed, passingSpeed), [clockSpeed, passingSpeed])
  const observers: ObserverRow[] = [
    { name: 'The lab', reading: result.lab },
    { name: "The moving clock itself (the clock's own frame)", reading: result.clockFrame },
    { name: 'The passing observer', reading: result.passing },
  ]

  const returnToIdle = () => {
    setStatus('idle')
    setProgress(0)
  }

  const handleClockSpeedChange = (speed: number) => {
    setClockSpeed(speed)
    returnToIdle()
  }
  const handlePassingSpeedChange = (speed: number) => {
    setPassingSpeed(speed)
    returnToIdle()
  }
  const handlePredictionChange = (choice: Prediction) => {
    setPrediction(choice)
    returnToIdle()
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
      <h2>Experiment 1 — The Interval: One Number Everyone Agrees On</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Imagine you are on a train and drop a ball. You see it fall straight
            down, so for you it landed in the same spot it was dropped. Someone on the platform sees the train
            carry the ball forward as it falls, so for them it landed many meters from where it was dropped. You
            and the platform observer disagree about how far apart those two events were: the dropping and the
            landing. Earlier experiments showed that moving observers can also disagree about how much time
            passed between two events. So observers can differ on both the time and the distance. That raises the
            question this experiment explores: when two observers disagree on both numbers, is there still some
            way of combining their own two numbers that gives the same answer for everyone? Or is everything
            about two events up to each observer's point of view?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> An <strong>event</strong> is something that happens at one
            place at one moment: a clock ticking, a flash of light going off, a ball landing. Two events have a
            time between them and a distance between them. We measure distance in <strong>light-seconds</strong>:
            one light-second is the distance light travels in one second, about 300,000 kilometers. Measuring
            distance this way puts it in the same units as time, so the two can be compared directly.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A clock moves past the lab at a steady speed. It ticks once every
            second of its own face, as the moving clock did in Experiments 3 to 5. Two of its ticks are our two
            events: tick 0, and tick 1 one second later by the clock's own face. Three observers will each
            measure the same two events. The first is the lab, which sees the clock move. The second is the clock
            itself, for which the clock is simply at rest. The third is a passing observer who moves past the lab
            at a speed you choose. Each observer reports two numbers: the time between the two ticks and the
            distance between them. You will predict how a certain combination of those two numbers compares
            between the lab and the clock, then run the experiment and look at what all three observers find.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose the clock's speed and the passing observer's speed. Then you will
            predict what the three observers find, and run the experiment to see.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What we assume.</strong> Space is flat, with no gravity. Every speed stays steady, and
            everything moves along one line. Speeds are given as a fraction of <strong>c</strong>, the speed
            of light.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Clock speed</label>
          <div style={{ marginBottom: '1rem' }}>
            {CLOCK_SPEED_PRESETS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => handleClockSpeedChange(speed)}
                className={`toggle-button${clockSpeed === speed ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {speed === 0 ? '0c (at rest)' : `${speed}c`}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Passing observer's speed
          </label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            Measured from the lab. A positive speed is the same direction the clock moves; a negative speed is
            the opposite direction.
          </p>
          <div>
            {PASSING_SPEED_PRESETS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => handlePassingSpeedChange(speed)}
                className={`toggle-button${passingSpeed === speed ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {speed === 0 ? '0c (at rest in the lab)' : `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What "time² − distance²" means.</strong> Take the time between two events, in seconds. Take
            the distance between them, in light-seconds. Multiply each number by itself, then subtract the
            distance result from the time result. For example, if two events are 3 seconds apart in time and 2
            light-seconds apart in space, then 3 × 3 = 9, 2 × 2 = 4, and 9 − 4 = 5. Each observer can work out
            this number for the same two events from their own measurements.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            If the clock is moving, the lab sees its two ticks farther apart in time and in space than the clock's own face
            shows. What do you expect the number "time² − distance²" to be for the lab, compared with the
            clock's own frame?
          </p>
          <div>
            {PREDICTION_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => handlePredictionChange(choice.value)}
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
          style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {prediction === null && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>
            Choose a prediction above to run the experiment.
          </p>
        )}

        <div style={{ marginTop: '2rem' }}>
          <SetupDiagram clockSpeed={clockSpeed} passingSpeed={passingSpeed} progress={status === 'idle' ? null : progress} />
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>How to read this diagram.</strong> The drawing is from the lab's point of view. Everything is
              placed using the lab's own ruler.
            </p>
            <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The grey line</strong> is the lab's ruler. Its numbers are distances in light-seconds,
                measured from the start of the ruler. If a mark says 2, it is 2 light-seconds, about 600,000
                kilometers, from the start.
              </li>
              <li>
                <strong style={{ color: '#3b82f6' }}>Blue square (tick 0):</strong> the first event. The moving
                clock ticks for the first time at the start of the ruler.
              </li>
              <li>
                <strong style={{ color: '#f59e0b' }}>Orange square (tick 1):</strong> the second event. It sits
                where the lab finds the clock when the clock's own face shows that one second has passed since
                tick 0. The orange line along the ruler is the distance the clock has covered between the two
                events, as the lab measures it. For example, at 0.6c the orange square lands 0.75 light-seconds
                along the ruler. At 0c the clock does not move, so there is no orange line, and tick 1 is at the
                same spot as tick 0.
              </li>
              <li>
                <strong style={{ color: '#10b981' }}>Green square (the moving clock):</strong> appears when you
                press Run. It travels along the ruler from tick 0 to tick 1. The line beneath the drawing shows
                the number on the clock's own face as it goes, counting up to one second.
              </li>
              <li>
                <strong style={{ color: '#8b5cf6' }}>Purple square (the passing observer):</strong> the third
                observer. The arrow shows which way they move relative to the lab, and no arrow means they are at
                rest in the lab. In this drawing they are only shown, not moved.
              </li>
            </ul>
            <p style={{ margin: 0 }}>
              <strong>What to look for.</strong> Change the clock's speed and watch where tick 1 lands: the faster
              the clock, the farther along the ruler it is. Change the passing observer's speed and watch the purple
              arrow change direction. The drawing only sets up the two events. The measurements each observer makes
              of them appear after you run the experiment.
            </p>
          </div>
        </div>
        {status === 'complete' && prediction !== null && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              The clock moved at {result.clockSpeed}c and the passing observer at {result.passingObserverSpeed}c, both measured
              from the lab. Your prediction was: {PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.toLowerCase()}.
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
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
                  {observers.map((o) => (
                    <tr key={o.name}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{o.name}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{o.reading.timeBetween.toFixed(2)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{Math.abs(o.reading.distanceBetween).toFixed(2)}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{o.reading.intervalSquared.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ResultsBars rows={observers} />
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>How to read this drawing.</strong> Three observers each measured the same two ticks of the
                clock. Each observer gets one row, and the rows are in the same order as the table above. The drawing
                shows the same numbers as the table, as lengths.
              </p>
              <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong style={{ color: TIME_COLOR }}>Blue bar (time):</strong> how much time that observer found
                  between the two ticks. The label at the end of the bar gives it in seconds ("s"). A longer bar means
                  more time passed, according to that observer.
                </li>
                <li>
                  <strong style={{ color: DISTANCE_COLOR }}>Pink bar (distance):</strong> how far apart that observer
                  found the two ticks, as a number of light-seconds ("ls"). A pink bar with no length means the observer
                  found both ticks at the same place. That is what an observer finds if the clock is at rest for them.
                </li>
                <li>
                  <strong>The blue and pink bars share one scale.</strong> A light-second and a second are the same
                  kind of length here, because of how we measure distance. So you can compare a blue bar and a pink bar
                  directly. The scale is set by the longest bar in the drawing, which is named at the bottom. Bars from
                  different observers can be compared the same way. This means that a very long bar for one observer can
                  make the others look short, but their labels still give the exact numbers.
                </li>
                <li>
                  <strong style={{ color: INTERVAL_COLOR }}>Green block (time² − distance²):</strong> the number you
                  predicted about. It is worked out for each observer from their own two numbers: multiply the time by
                  itself, multiply the distance by itself, and subtract. For example, a row with time 3.00 s and
                  distance 2.00 ls would give 3 × 3 − 2 × 2 = 9 − 4 = 5.00. The block is drawn at the same length in
                  every row on purpose, so its length does not stand for the size of the number. Read the number written
                  inside it.
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>What to look for.</strong> Compare how the blue and pink bars change from one row to the next.
                Then compare the numbers inside the green blocks. Next, change the clock's speed or the passing
                observer's speed, run again, and see whether what you noticed still holds. A good test is to try the
                passing observer at rest in the lab (0c), then at −0.8c.
              </p>
            </div>
          </div>
        )}
      </div>

      {status === 'complete' && prediction !== null && (
        <SpacetimeIntervalTutor
          key={runCount}
          clockSpeed={clockSpeed}
          passingSpeed={passingSpeed}
          predicted={prediction}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}

