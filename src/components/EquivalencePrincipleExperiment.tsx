import { useEffect, useState } from 'react'
import {
  runEquivalencePrincipleExperiment,
  ballHeightAboveFloorAt,
  EARTH_GRAVITY,
} from '../physics/equivalencePrincipleExperiment'
import type { EquivalencePrincipleExperimentResult } from '../physics/equivalencePrincipleExperiment'
import { EquivalencePrincipleTutor } from './EquivalencePrincipleTutor'

type AccelerationPreset = 0.5 | 1 | 2 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'
export type PredictionChoice = 'differently' | 'sameWay'

const INITIAL_HEIGHT_METERS = 2
const CABIN_HEIGHT_PX = 220
const BALL_SIZE_PX = 20

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'differently', label: 'Differently' },
  { value: 'sameWay', label: 'The same way' },
]

// Both scenes always call the same physics formula with the same inputs (see
// equivalencePrincipleExperiment.ts), so the ball moves the same way in both, for any acceleration.
export function actualOutcome(): PredictionChoice {
  return 'sameWay'
}

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

interface EquivalencePrincipleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Deliberately unlabeled beyond "Cabin A"/"Cabin B" — which cabin is gravity and which is
// acceleration is explained once, in the introduction, not repeated as a caption here. Showing
// it here throughout the run would undercut the point: that the ball alone can't tell you.
function Cabin({ label, height }: { label: string; height: number }) {
  const fraction = height / INITIAL_HEIGHT_METERS
  const ballTopPx = (1 - fraction) * (CABIN_HEIGHT_PX - BALL_SIZE_PX)

  return (
    <div style={{ flex: '1 1 220px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
      <div
        className="exp-card"
        style={{
          position: 'relative',
          height: `${CABIN_HEIGHT_PX}px`,
          width: '140px',
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: `${ballTopPx}px`,
            transform: 'translateX(-50%)',
            width: `${BALL_SIZE_PX}px`,
            height: `${BALL_SIZE_PX}px`,
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
          }}
        />
      </div>
      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Height above floor: <strong>{height.toFixed(2)} m</strong>
      </p>
    </div>
  )
}

const GRAPH_WIDTH = 340
const GRAPH_HEIGHT = 190
const GRAPH_MARGIN = { top: 12, right: 16, bottom: 28, left: 40 }
const GRAPH_SAMPLE_COUNT = 24

// Both cabins' curves come from the same ballHeightAboveFloorAt call with the same result, so
// they are the same polyline drawn twice — the point being that they lie exactly on top of
// each other, not two independently plausible curves that happen to match.
//
// revealUpToSeconds lets the curve draw progressively, in step with the falling ball, instead of
// appearing all at once only after the run finishes: pass the live elapsed time while running,
// or result.timeToFloorSeconds once complete.
function HeightVsTimeGraph({
  result,
  revealUpToSeconds,
}: {
  result: EquivalencePrincipleExperimentResult
  revealUpToSeconds: number
}) {
  const plotWidth = GRAPH_WIDTH - GRAPH_MARGIN.left - GRAPH_MARGIN.right
  const plotHeight = GRAPH_HEIGHT - GRAPH_MARGIN.top - GRAPH_MARGIN.bottom

  const revealedSeconds = Math.min(Math.max(revealUpToSeconds, 0), result.timeToFloorSeconds)
  const revealedSampleCount = Math.max(1, Math.round(GRAPH_SAMPLE_COUNT * (revealedSeconds / result.timeToFloorSeconds)))

  const points = Array.from({ length: revealedSampleCount + 1 }, (_, i) => {
    const t = (i / revealedSampleCount) * revealedSeconds
    return { t, h: ballHeightAboveFloorAt(result, t) }
  })

  const xFor = (t: number) => GRAPH_MARGIN.left + (t / result.timeToFloorSeconds) * plotWidth
  const yFor = (h: number) => GRAPH_MARGIN.top + (1 - h / INITIAL_HEIGHT_METERS) * plotHeight

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.t).toFixed(1)} ${yFor(p.h).toFixed(1)}`)
    .join(' ')

  const markerHeight = ballHeightAboveFloorAt(result, revealedSeconds)
  const markerX = xFor(revealedSeconds)
  const markerY = yFor(markerHeight)

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
        Ball height above the floor, over time
      </p>
      <svg
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
        role="img"
        aria-label="Graph of ball height above the floor over time. Cabin A and Cabin B produce the exact same curve."
        style={{ width: '100%', maxWidth: `${GRAPH_WIDTH}px`, display: 'block', margin: '0 auto' }}
      >
        <line
          x1={GRAPH_MARGIN.left}
          y1={GRAPH_MARGIN.top}
          x2={GRAPH_MARGIN.left}
          y2={GRAPH_HEIGHT - GRAPH_MARGIN.bottom}
          stroke="#ccc"
          strokeWidth={1}
        />
        <line
          x1={GRAPH_MARGIN.left}
          y1={GRAPH_HEIGHT - GRAPH_MARGIN.bottom}
          x2={GRAPH_WIDTH - GRAPH_MARGIN.right}
          y2={GRAPH_HEIGHT - GRAPH_MARGIN.bottom}
          stroke="#ccc"
          strokeWidth={1}
        />
        <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth={3} strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
        {revealedSeconds < result.timeToFloorSeconds && (
          <circle cx={markerX} cy={markerY} r={5} fill="#4f46e5" stroke="white" strokeWidth={1.5} />
        )}
        <text x={GRAPH_MARGIN.left} y={GRAPH_HEIGHT - 10} fontSize="10" fill="#888">
          0 s
        </text>
        <text x={GRAPH_WIDTH - GRAPH_MARGIN.right} y={GRAPH_HEIGHT - 10} fontSize="10" fill="#888" textAnchor="end">
          {result.timeToFloorSeconds.toFixed(2)} s
        </text>
        <text x={2} y={GRAPH_MARGIN.top + 8} fontSize="10" fill="#888">
          {INITIAL_HEIGHT_METERS} m
        </text>
        <text x={2} y={GRAPH_HEIGHT - GRAPH_MARGIN.bottom} fontSize="10" fill="#888">
          0 m
        </text>
      </svg>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
        Cabin A (solid) and Cabin B (dashed) — the two lines lie exactly on top of each other.
      </p>
    </div>
  )
}

export function EquivalencePrincipleExperiment({ onComplete, onTutorComplete }: EquivalencePrincipleExperimentProps) {
  const [preset, setPreset] = useState<AccelerationPreset>(1)
  const [customG, setCustomG] = useState('')
  const [predictionChoice, setPredictionChoice] = useState<PredictionChoice | null>(null)
  const [submittedPrediction, setSubmittedPrediction] = useState<PredictionChoice | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<EquivalencePrincipleExperimentResult | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const selectedG = preset === 'other' ? parseFloat(customG) || 0 : preset
  const isRunning = status === 'running'
  const isComplete = status === 'complete'
  const isValidG = selectedG > 0 && selectedG <= 5
  const hasPrediction = predictionChoice !== null
  const canRun = isValidG && hasPrediction

  const height = result
    ? ballHeightAboveFloorAt(result, Math.min(elapsedSeconds, result.timeToFloorSeconds))
    : INITIAL_HEIGHT_METERS

  const handleRun = () => {
    if (!canRun) return
    const experimentResult = runEquivalencePrincipleExperiment(selectedG * EARTH_GRAVITY, INITIAL_HEIGHT_METERS)
    setSubmittedPrediction(predictionChoice)
    setPredictionChoice(null)
    setResult(experimentResult)
    setElapsedSeconds(0)
    setStatus('running')
  }

  const handleRunAgain = () => {
    setStatus('idle')
    setResult(null)
    setElapsedSeconds(0)
    setSubmittedPrediction(null)
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const animationDurationMs = 2000
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      // Clamped on both sides: a browser's first rAF callback can occasionally report a
      // timestamp earlier than the performance.now() captured just above, making this
      // otherwise-negative — which ballHeightAboveFloorAt would then reject.
      const progress = Math.min(Math.max((currentTime - startTime) / animationDurationMs, 0), 1)
      setElapsedSeconds(progress * result.timeToFloorSeconds)

      if (progress >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 1 — The Equivalence Principle</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Imagine you're sealed inside a windowless cabin — no windows,
            no way to look outside. You drop a ball. Could you tell, just from watching the ball fall,
            whether your cabin is sitting still on a planet, or racing through empty space with a
            rocket pushing it?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Cabin A sits on the ground, where gravity pulls the ball down.
            Cabin B is in deep space, far from any planet — nothing is pulling on it — but a rocket
            engine is pushing the cabin (and its floor) forward at a steady rate. In both cabins,
            someone drops a ball and we watch how it moves relative to the floor.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Watch both cabins and compare how the ball moves in each one.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Both cabins are idealized: no air, a single small ball, and a steady push or pull the whole time.</li>
            <li>
              This experiment doesn't use anything about light or moving clocks from earlier chapters —
              it's about gravity and acceleration, a fresh starting point.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Acceleration (used for both cabins)
          </label>

          <div style={{ marginBottom: '1rem' }}>
            {[0.5, 1, 2].map((g) => (
              <button
                key={g}
                onClick={() => setPreset(g as AccelerationPreset)}
                disabled={isRunning}
                className={`toggle-button${preset === g ? ' is-selected' : ''}`}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: isRunning ? 0.6 : 1,
                }}
              >
                {g}g
              </button>
            ))}
            <button
              onClick={() => setPreset('other')}
              disabled={isRunning}
              className={`toggle-button${preset === 'other' ? ' is-selected' : ''}`}
              style={{
                padding: '0.5rem 1rem',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: isRunning ? 0.6 : 1,
              }}
            >
              Other
            </button>
          </div>

          {preset === 'other' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="number"
                min="0.1"
                max="5"
                step="0.1"
                value={customG}
                onChange={(e) => setCustomG(e.target.value)}
                disabled={isRunning}
                placeholder="Enter g (0.1-5)"
                className="field-input"
                style={{
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  width: '200px',
                  opacity: isRunning ? 0.6 : 1,
                  cursor: isRunning ? 'not-allowed' : 'text',
                }}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Selected acceleration:{' '}
            <strong>
              {isValidG ? `${selectedG}g (${(selectedG * EARTH_GRAVITY).toFixed(2)} m/s²)` : '—'}
            </strong>
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '2rem',
          }}
        >
          <Cabin label="Cabin A" height={height} />
          <Cabin label="Cabin B" height={height} />
        </div>

        {result && (
          <div style={{ marginBottom: '2rem' }}>
            <HeightVsTimeGraph
              result={result}
              revealUpToSeconds={isComplete ? result.timeToFloorSeconds : elapsedSeconds}
            />
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            If you were sealed inside each cabin and dropped a ball, do you think the ball would
            move differently in the two cabins, or exactly the same way?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {predictionChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPredictionChoice(choice.value)}
                disabled={isRunning}
                className={`toggle-button${predictionChoice === choice.value ? ' is-selected' : ''}`}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: isRunning ? 0.6 : 1,
                }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {predictionChoice
              ? `Your prediction: ${labelFor(predictionChoice)}`
              : submittedPrediction
                ? `Your prediction: ${labelFor(submittedPrediction)}`
                : 'Choose an option to continue'}
          </p>
        </div>

        <button
          onClick={isComplete ? handleRunAgain : handleRun}
          disabled={isRunning || (!isComplete && !canRun)}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {isRunning ? 'Running...' : isComplete ? 'Run Again' : 'Drop the ball'}
        </button>

        {isComplete && result && submittedPrediction && (
          <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h2 className="app-title" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
              Results
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Acceleration:</strong> {result.accelerationInG}g ({result.accelerationMetersPerSecondSquared.toFixed(2)} m/s²)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Time for the ball to reach the floor:</strong> {result.timeToFloorSeconds.toFixed(2)} s —
                the same in both cabins.
              </p>
            </div>

            <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You predicted:</strong> the ball would move {labelFor(submittedPrediction)} in the two cabins.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>What actually happened:</strong> the ball moved {labelFor(actualOutcome())} in both cabins —
                the exact same height at every moment.
              </p>
            </div>

            <div style={{ marginBottom: '0', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                From inside either cabin, watching only the ball, there is no experiment here that
                would tell you which cabin you were in.
              </p>
            </div>
          </div>
        )}

        {isComplete && result && submittedPrediction && (
          <EquivalencePrincipleTutor predictionChoice={submittedPrediction} result={result} onExplained={onTutorComplete} />
        )}
      </div>
    </div>
  )
}
