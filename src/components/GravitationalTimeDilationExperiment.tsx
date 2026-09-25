import { useEffect, useState } from 'react'
import {
  runGravitationalTimeDilationExperiment,
  tickCountAt,
} from '../physics/gravitationalTimeDilationExperiment'
import type { GravitationalTimeDilationExperimentResult } from '../physics/gravitationalTimeDilationExperiment'
import { GravitationalTimeDilationTutor } from './GravitationalTimeDilationTutor'

type StrengthPreset = 0.1 | 0.3 | 0.6 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'
export type PredictionChoice = 'sameRate' | 'differentRates'

interface GravitationalTimeDilationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// How much floor-clock time the run covers. The specification's physics model has no natural
// stopping point (unlike Experiment 1's ball reaching the floor), so this is a UI choice, not a
// physics one: 10 floor-seconds keeps tick counts readable across the whole strength range.
const RUN_DURATION_FLOOR_SECONDS = 10
const ANIMATION_DURATION_MS = 3000

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'sameRate', label: 'The same rate' },
  { value: 'differentRates', label: 'Different rates' },
]

// Ceiling and floor clocks always share the physics model's single formula (see
// gravitationalTimeDilationExperiment.ts), so the ceiling clock always ticks faster for any
// valid strength.
export function actualOutcome(): PredictionChoice {
  return 'differentRates'
}

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

const GRAPH_WIDTH = 340
const GRAPH_HEIGHT = 190
const GRAPH_MARGIN = { top: 12, right: 16, bottom: 28, left: 40 }
const GRAPH_SAMPLE_COUNT = 24

// Floor and ceiling curves both come from the same tickCountAt call with the same result, so
// the gap between the two lines is the point — the ceiling's line always rises faster.
function TickCountVsTimeGraph({
  result,
  revealUpToFloorSeconds,
}: {
  result: GravitationalTimeDilationExperimentResult
  revealUpToFloorSeconds: number
}) {
  const plotWidth = GRAPH_WIDTH - GRAPH_MARGIN.left - GRAPH_MARGIN.right
  const plotHeight = GRAPH_HEIGHT - GRAPH_MARGIN.top - GRAPH_MARGIN.bottom

  const revealedSeconds = Math.min(Math.max(revealUpToFloorSeconds, 0), RUN_DURATION_FLOOR_SECONDS)
  const maxTicks = tickCountAt(result, RUN_DURATION_FLOOR_SECONDS, 'ceiling')
  const sampleCount = Math.max(1, Math.round(GRAPH_SAMPLE_COUNT * (revealedSeconds / RUN_DURATION_FLOOR_SECONDS)))

  const xFor = (t: number) => GRAPH_MARGIN.left + (t / RUN_DURATION_FLOOR_SECONDS) * plotWidth
  const yFor = (ticks: number) => GRAPH_MARGIN.top + (1 - ticks / maxTicks) * plotHeight

  const pathFor = (clock: 'floor' | 'ceiling') =>
    Array.from({ length: sampleCount + 1 }, (_, i) => {
      const t = (i / sampleCount) * revealedSeconds
      return { t, ticks: tickCountAt(result, t, clock) }
    })
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.t).toFixed(1)} ${yFor(p.ticks).toFixed(1)}`)
      .join(' ')

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
        Tick count over time
      </p>
      <svg
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
        role="img"
        aria-label="Graph of tick count over time for the floor clock and the ceiling clock. The ceiling clock's line rises faster."
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
        <path d={pathFor('floor')} fill="none" stroke="#4f46e5" strokeWidth={3} strokeLinecap="round" />
        <path d={pathFor('ceiling')} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
        <text x={GRAPH_MARGIN.left} y={GRAPH_HEIGHT - 10} fontSize="10" fill="#888">
          0 s
        </text>
        <text x={GRAPH_WIDTH - GRAPH_MARGIN.right} y={GRAPH_HEIGHT - 10} fontSize="10" fill="#888" textAnchor="end">
          {RUN_DURATION_FLOOR_SECONDS} s
        </text>
        <text x={2} y={GRAPH_MARGIN.top + 8} fontSize="10" fill="#888">
          {maxTicks.toFixed(0)}
        </text>
        <text x={2} y={GRAPH_HEIGHT - GRAPH_MARGIN.bottom} fontSize="10" fill="#888">
          0
        </text>
      </svg>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
        Floor clock (solid) and ceiling clock (dashed) — the ceiling clock's line rises faster.
      </p>
    </div>
  )
}

// Steps 4-8 of CLAUDE.md §21 are all built: basic UI, connect to physics, prediction, results
// panel, and the AI tutor below.
export function GravitationalTimeDilationExperiment({
  onComplete,
  onTutorComplete,
}: GravitationalTimeDilationExperimentProps) {
  const [preset, setPreset] = useState<StrengthPreset>(0.3)
  const [customStrength, setCustomStrength] = useState('')
  const [predictionChoice, setPredictionChoice] = useState<PredictionChoice | null>(null)
  const [submittedPrediction, setSubmittedPrediction] = useState<PredictionChoice | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<GravitationalTimeDilationExperimentResult | null>(null)
  const [elapsedFloorSeconds, setElapsedFloorSeconds] = useState(0)

  const selectedStrength = preset === 'other' ? parseFloat(customStrength) || 0 : preset
  const isRunning = status === 'running'
  const isComplete = status === 'complete'
  const isValidStrength = selectedStrength > 0 && selectedStrength < 1
  const hasPrediction = predictionChoice !== null
  const canRun = isValidStrength && hasPrediction

  const ceilingTicks = result ? tickCountAt(result, elapsedFloorSeconds, 'ceiling') : 0
  const floorTicks = result ? tickCountAt(result, elapsedFloorSeconds, 'floor') : 0

  const handleRun = () => {
    if (!canRun) return
    setResult(runGravitationalTimeDilationExperiment(selectedStrength))
    setSubmittedPrediction(predictionChoice)
    setPredictionChoice(null)
    setElapsedFloorSeconds(0)
    setStatus('running')
  }

  const handleRunAgain = () => {
    setStatus('idle')
    setResult(null)
    setElapsedFloorSeconds(0)
    setSubmittedPrediction(null)
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      // Clamped: a browser's first rAF callback can occasionally report a timestamp earlier
      // than the performance.now() captured just above, which would otherwise go negative.
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setElapsedFloorSeconds(progress * RUN_DURATION_FLOOR_SECONDS)

      if (progress >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result, onComplete])

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 2 — Does Gravity Change Time?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 1 you saw that a ball falls the same way
            whether you're sitting still under gravity or accelerating through empty space. Now
            let's ask about clocks instead of balls: if two clocks sit at different heights in
            that same accelerating rocket, do they tick at the same rate?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> The same rocket cabin from before, this time with one
            clock fixed to the floor and one fixed to the ceiling. As the rocket accelerates,
            we'll count how many ticks each clock registers.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Watch both clocks and compare how many ticks each one
            registers.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              "Strength" stands in for two real things combined: how hard the rocket accelerates,
              and how far apart the floor and ceiling clocks are. The bigger the strength, the
              bigger the difference between the two clocks. A real rocket or building would need a
              strength far too small to see, so here it's exaggerated so you can actually watch it
              happen.
            </li>
            <li>
              This experiment uses a simplified, first-order version of the real physics, not the
              full exact treatment.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Strength (used for both clocks)
          </label>

          <div style={{ marginBottom: '1rem' }}>
            {[0.1, 0.3, 0.6].map((s) => (
              <button
                key={s}
                onClick={() => setPreset(s as StrengthPreset)}
                disabled={isRunning}
                className={`toggle-button${preset === s ? ' is-selected' : ''}`}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: isRunning ? 0.6 : 1,
                }}
              >
                {s}
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
                min="0.05"
                max="0.9"
                step="0.01"
                value={customStrength}
                onChange={(e) => setCustomStrength(e.target.value)}
                disabled={isRunning}
                placeholder="Enter strength (0.05-0.9)"
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
            Selected strength: <strong>{isValidStrength ? selectedStrength : '—'}</strong>
          </p>
        </div>

        <div className="exp-card" style={{ padding: '1rem', marginBottom: '2rem', maxWidth: '260px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Ceiling clock</p>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>
              Ticks: <strong>{ceilingTicks.toFixed(2)}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Floor clock</p>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>
              Ticks: <strong>{floorTicks.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        {result && (
          <div style={{ marginBottom: '2rem' }}>
            <TickCountVsTimeGraph
              result={result}
              revealUpToFloorSeconds={isComplete ? RUN_DURATION_FLOOR_SECONDS : elapsedFloorSeconds}
            />
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Two identical clocks sit in the same accelerating rocket — one at the floor, one at
            the ceiling. Do you think they'll tick at the same rate, or at different rates?
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
          {isRunning ? 'Running...' : isComplete ? 'Run Again' : 'Start the clocks'}
        </button>

        {isComplete && result && submittedPrediction && (
          <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h2 className="app-title" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
              Results
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Strength:</strong> {result.strength} (frequency ratio: {result.frequencyRatio.toFixed(2)})
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Ceiling clock ticks:</strong> {ceilingTicks.toFixed(2)}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Floor clock ticks:</strong> {floorTicks.toFixed(2)}
              </p>
            </div>

            <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You predicted:</strong> the clocks would tick at {labelFor(submittedPrediction)}.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>What actually happened:</strong> the clocks ticked at {labelFor(actualOutcome())} —
                the ceiling clock registered more ticks than the floor clock.
              </p>
            </div>

            <div style={{ marginBottom: '0', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Because gravity and acceleration are locally indistinguishable (Experiment 1), a
                clock lower in a real gravitational field must likewise run slower than one higher
                up — this is gravitational time dilation.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                This isn't just a puzzle — GPS satellites have to correct for exactly this effect
                to stay accurate.
              </p>
            </div>
          </div>
        )}

        {isComplete && result && submittedPrediction && (
          <GravitationalTimeDilationTutor
            predictionChoice={submittedPrediction}
            result={result}
            onExplained={onTutorComplete}
          />
        )}
      </div>
    </div>
  )
}
