import { useEffect, useState } from 'react'
import {
  runTidalEffectExperiment,
  ballPositionsAt,
  EARTH_GRAVITY,
} from '../physics/tidalEffectExperiment'
import type { TidalEffectExperimentResult, TidalEffectScene } from '../physics/tidalEffectExperiment'
import { TidalEffectTutor } from './TidalEffectTutor'

type AccelerationPreset = 0.5 | 1 | 2 | 'other'
type StrengthPreset = 0.1 | 0.3 | 0.6 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'
export type PredictionChoice = 'converge' | 'same' | 'apart'

const INITIAL_HEIGHT_METERS = 2
const INITIAL_SEPARATION_METERS = 1
const CABIN_HEIGHT_PX = 220
const CABIN_WIDTH_PX = 160
const BALL_SIZE_PX = 16
const HORIZONTAL_PX_PER_METER = 60
const ANIMATION_DURATION_MS = 2000

interface TidalEffectExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'converge', label: "They'll drift together" },
  { value: 'same', label: "They'll stay the same distance apart" },
  { value: 'apart', label: "They'll drift apart" },
]

// Both scenes always call the same physics formulas (see tidalEffectExperiment.ts): the planet
// scene converges for any valid convergenceStrength, and the rocket scene never does.
export function actualOutcomeFor(scene: TidalEffectScene): PredictionChoice {
  return scene === 'planet' ? 'converge' : 'same'
}

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

function PredictionQuestion({
  label,
  prompt,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  label: string
  prompt: string
  selected: PredictionChoice | null
  submitted: PredictionChoice | null
  onSelect: (choice: PredictionChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {predictionChoices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected
          ? `Your prediction: ${labelFor(selected)}`
          : submitted
            ? `Your prediction: ${labelFor(submitted)}`
            : 'Choose an option to continue'}
      </p>
    </div>
  )
}

function Cabin({
  label,
  result,
  scene,
  elapsedSeconds,
}: {
  label: string
  result: TidalEffectExperimentResult
  scene: TidalEffectScene
  elapsedSeconds: number
}) {
  const positions = ballPositionsAt(result, elapsedSeconds, scene)
  const fraction = positions.heightAboveFloor / result.initialHeightMeters
  const ballTopPx = (1 - fraction) * (CABIN_HEIGHT_PX - BALL_SIZE_PX)
  const centerPx = CABIN_WIDTH_PX / 2

  return (
    <div style={{ flex: '1 1 220px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
      <div
        className="exp-card"
        style={{
          position: 'relative',
          height: `${CABIN_HEIGHT_PX}px`,
          width: `${CABIN_WIDTH_PX}px`,
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        {[positions.leftBallOffset, positions.rightBallOffset].map((offsetMeters, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${centerPx + offsetMeters * HORIZONTAL_PX_PER_METER}px`,
              top: `${ballTopPx}px`,
              transform: 'translateX(-50%)',
              width: `${BALL_SIZE_PX}px`,
              height: `${BALL_SIZE_PX}px`,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Separation: <strong>{(positions.rightBallOffset - positions.leftBallOffset).toFixed(3)} m</strong>
      </p>
    </div>
  )
}

const GRAPH_WIDTH = 340
const GRAPH_HEIGHT = 190
const GRAPH_MARGIN = { top: 12, right: 16, bottom: 28, left: 40 }
const GRAPH_SAMPLE_COUNT = 24

function separationAt(result: TidalEffectExperimentResult, t: number, scene: TidalEffectScene): number {
  const positions = ballPositionsAt(result, t, scene)
  return positions.rightBallOffset - positions.leftBallOffset
}

// The rocket scene's line stays flat while the planet scene's bends downward — both come from
// the same ballPositionsAt call, so the gap between the two lines is the point being shown.
function SeparationVsTimeGraph({
  result,
  revealUpToSeconds,
}: {
  result: TidalEffectExperimentResult
  revealUpToSeconds: number
}) {
  const plotWidth = GRAPH_WIDTH - GRAPH_MARGIN.left - GRAPH_MARGIN.right
  const plotHeight = GRAPH_HEIGHT - GRAPH_MARGIN.top - GRAPH_MARGIN.bottom

  const revealedSeconds = Math.min(Math.max(revealUpToSeconds, 0), result.timeToFloorSeconds)
  const revealedSampleCount = Math.max(1, Math.round(GRAPH_SAMPLE_COUNT * (revealedSeconds / result.timeToFloorSeconds)))

  const xFor = (t: number) => GRAPH_MARGIN.left + (t / result.timeToFloorSeconds) * plotWidth
  const yFor = (separation: number) =>
    GRAPH_MARGIN.top + (1 - separation / result.initialSeparationMeters) * plotHeight

  const pathFor = (scene: TidalEffectScene) =>
    Array.from({ length: revealedSampleCount + 1 }, (_, i) => {
      const t = (i / revealedSampleCount) * revealedSeconds
      return { t, separation: separationAt(result, t, scene) }
    })
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(p.t).toFixed(1)} ${yFor(p.separation).toFixed(1)}`)
      .join(' ')

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
        Ball separation over time
      </p>
      <svg
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
        role="img"
        aria-label="Graph of ball separation over time for the planet cabin and the rocket cabin. The rocket cabin's line stays flat; the planet cabin's line bends downward."
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
        <path d={pathFor('rocket')} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
        <path d={pathFor('planet')} fill="none" stroke="#4f46e5" strokeWidth={3} strokeLinecap="round" />
        <text x={GRAPH_MARGIN.left} y={GRAPH_HEIGHT - 10} fontSize="10" fill="#888">
          0 s
        </text>
        <text x={GRAPH_WIDTH - GRAPH_MARGIN.right} y={GRAPH_HEIGHT - 10} fontSize="10" fill="#888" textAnchor="end">
          {result.timeToFloorSeconds.toFixed(2)} s
        </text>
        <text x={2} y={GRAPH_MARGIN.top + 8} fontSize="10" fill="#888">
          {result.initialSeparationMeters.toFixed(1)} m
        </text>
        <text x={2} y={GRAPH_HEIGHT - GRAPH_MARGIN.bottom} fontSize="10" fill="#888">
          0 m
        </text>
      </svg>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
        Planet cabin (solid) and rocket cabin (dashed) — only the planet cabin's separation shrinks.
      </p>
    </div>
  )
}

export function TidalEffectExperiment({ onComplete, onTutorComplete }: TidalEffectExperimentProps) {
  const [accelerationPreset, setAccelerationPreset] = useState<AccelerationPreset>(1)
  const [customG, setCustomG] = useState('')
  const [strengthPreset, setStrengthPreset] = useState<StrengthPreset>(0.3)
  const [customStrength, setCustomStrength] = useState('')
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<TidalEffectExperimentResult | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [planetPrediction, setPlanetPrediction] = useState<PredictionChoice | null>(null)
  const [rocketPrediction, setRocketPrediction] = useState<PredictionChoice | null>(null)
  const [submittedPlanetPrediction, setSubmittedPlanetPrediction] = useState<PredictionChoice | null>(null)
  const [submittedRocketPrediction, setSubmittedRocketPrediction] = useState<PredictionChoice | null>(null)

  const selectedG = accelerationPreset === 'other' ? parseFloat(customG) || 0 : accelerationPreset
  const selectedStrength = strengthPreset === 'other' ? parseFloat(customStrength) || 0 : strengthPreset
  const isRunning = status === 'running'
  const isComplete = status === 'complete'
  const isValidG = selectedG > 0 && selectedG <= 5
  const isValidStrength = selectedStrength >= 0.02 && selectedStrength <= 0.9
  const hasBothPredictions = planetPrediction !== null && rocketPrediction !== null
  const canRun = isValidG && isValidStrength && hasBothPredictions

  const handleRun = () => {
    if (!canRun) return
    const experimentResult = runTidalEffectExperiment(
      selectedG * EARTH_GRAVITY,
      INITIAL_HEIGHT_METERS,
      INITIAL_SEPARATION_METERS,
      selectedStrength
    )
    setSubmittedPlanetPrediction(planetPrediction)
    setSubmittedRocketPrediction(rocketPrediction)
    setPlanetPrediction(null)
    setRocketPrediction(null)
    setResult(experimentResult)
    setElapsedSeconds(0)
    setStatus('running')
  }

  const handleRunAgain = () => {
    setStatus('idle')
    setResult(null)
    setElapsedSeconds(0)
    setSubmittedPlanetPrediction(null)
    setSubmittedRocketPrediction(null)
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
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
      <h2>Experiment 3 — Why Gravity Isn't Just Acceleration</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 1, you saw that a ball falls the same way
            whether your cabin sits still under gravity or accelerates through space. Does that stay
            true no matter how big the cabin is?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> The same two cabins as before — one on the ground, one in
            deep space with a rocket — but now each cabin drops two balls side by side, the same
            distance apart, at the same time. We'll watch whether that distance changes as they fall.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Watch both cabins and compare whether the two balls' distance
            changes in each one.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Both cabins are idealized, just like Experiment 1.</li>
            <li>The convergence you'll see uses a simplified, first-order approximation, not the exact calculation.</li>
            <li>
              "Convergence strength" is an exaggerated stand-in for how big the cabin is compared to
              the planet — a real planet is so much bigger than any cabin that this effect is normally
              far too small to see, so here it's exaggerated so you can actually watch it happen.
            </li>
            <li>
              This experiment doesn't use anything about light, moving clocks, or speeds close to
              light from earlier chapters — it's about ordinary gravity and acceleration, like
              Experiment 1.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Acceleration (used for both cabins)
          </label>
          <div style={{ marginBottom: '1rem' }}>
            {[0.5, 1, 2].map((g) => (
              <button
                key={g}
                onClick={() => setAccelerationPreset(g as AccelerationPreset)}
                disabled={isRunning}
                className={`toggle-button${accelerationPreset === g ? ' is-selected' : ''}`}
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
              onClick={() => setAccelerationPreset('other')}
              disabled={isRunning}
              className={`toggle-button${accelerationPreset === 'other' ? ' is-selected' : ''}`}
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
          {accelerationPreset === 'other' && (
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
              style={{ padding: '0.5rem', fontSize: '0.875rem', width: '200px' }}
            />
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Convergence strength
          </label>
          <div style={{ marginBottom: '1rem' }}>
            {[0.1, 0.3, 0.6].map((strength) => (
              <button
                key={strength}
                onClick={() => setStrengthPreset(strength as StrengthPreset)}
                disabled={isRunning}
                className={`toggle-button${strengthPreset === strength ? ' is-selected' : ''}`}
                style={{
                  marginRight: '0.5rem',
                  padding: '0.5rem 1rem',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: isRunning ? 0.6 : 1,
                }}
              >
                {strength}
              </button>
            ))}
            <button
              onClick={() => setStrengthPreset('other')}
              disabled={isRunning}
              className={`toggle-button${strengthPreset === 'other' ? ' is-selected' : ''}`}
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
          {strengthPreset === 'other' && (
            <input
              type="number"
              min="0.02"
              max="0.9"
              step="0.01"
              value={customStrength}
              onChange={(e) => setCustomStrength(e.target.value)}
              disabled={isRunning}
              placeholder="Enter strength (0.02-0.9)"
              className="field-input"
              style={{ padding: '0.5rem', fontSize: '0.875rem', width: '220px' }}
            />
          )}
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
          <Cabin
            label="Planet"
            result={result ?? runTidalEffectExperiment(EARTH_GRAVITY, INITIAL_HEIGHT_METERS, INITIAL_SEPARATION_METERS, 0.3)}
            scene="planet"
            elapsedSeconds={result ? Math.min(elapsedSeconds, result.timeToFloorSeconds) : 0}
          />
          <Cabin
            label="Rocket"
            result={result ?? runTidalEffectExperiment(EARTH_GRAVITY, INITIAL_HEIGHT_METERS, INITIAL_SEPARATION_METERS, 0.3)}
            scene="rocket"
            elapsedSeconds={result ? Math.min(elapsedSeconds, result.timeToFloorSeconds) : 0}
          />
        </div>

        {result && (
          <div style={{ marginBottom: '2rem' }}>
            <SeparationVsTimeGraph
              result={result}
              revealUpToSeconds={isComplete ? result.timeToFloorSeconds : elapsedSeconds}
            />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Make a prediction</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Two balls are dropped side by side in each cabin, the same distance apart. As they fall,
            do you think the two balls will drift closer together, drift farther apart, or stay
            exactly the same distance apart?
          </p>
          <PredictionQuestion
            label="Planet cabin"
            prompt="What will the two balls do in the cabin resting on the planet?"
            selected={planetPrediction}
            submitted={submittedPlanetPrediction}
            onSelect={setPlanetPrediction}
            disabled={isRunning}
          />
          <PredictionQuestion
            label="Rocket cabin"
            prompt="What will the two balls do in the cabin accelerating through deep space?"
            selected={rocketPrediction}
            submitted={submittedRocketPrediction}
            onSelect={setRocketPrediction}
            disabled={isRunning}
          />
        </div>

        <button
          onClick={isComplete ? handleRunAgain : handleRun}
          disabled={isRunning || (!isComplete && !canRun)}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {isRunning ? 'Running...' : isComplete ? 'Run Again' : 'Drop the balls'}
        </button>

        {isComplete && result && submittedPlanetPrediction && submittedRocketPrediction && (
          <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
            <h2 className="app-title" style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
              Results
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Acceleration:</strong> {result.accelerationInG}g ({result.accelerationMetersPerSecondSquared.toFixed(2)} m/s²)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Convergence strength:</strong> {result.convergenceStrength}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final separation, planet cabin:</strong>{' '}
                {separationAt(result, result.timeToFloorSeconds, 'planet').toFixed(3)} m (started at{' '}
                {result.initialSeparationMeters.toFixed(3)} m)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final separation, rocket cabin:</strong>{' '}
                {separationAt(result, result.timeToFloorSeconds, 'rocket').toFixed(3)} m — unchanged.
              </p>
            </div>

            <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You predicted, planet cabin:</strong> {labelFor(submittedPlanetPrediction)}.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>What actually happened:</strong> {labelFor(actualOutcomeFor('planet'))}.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You predicted, rocket cabin:</strong> {labelFor(submittedRocketPrediction)}.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>What actually happened:</strong> {labelFor(actualOutcomeFor('rocket'))}.
              </p>
            </div>

            <div style={{ marginBottom: '0', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Unlike Experiment 1's single ball, two balls spread apart reveal a difference between
                the two cabins after all: a real gravitational field pulls slightly differently from
                different places, something uniform acceleration cannot do.
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                This convergence is called a <strong>tidal effect</strong> — the same kind of effect
                responsible for ocean tides.
              </p>
            </div>
          </div>
        )}

        {isComplete && result && submittedPlanetPrediction && submittedRocketPrediction && (
          <TidalEffectTutor
            planetPrediction={submittedPlanetPrediction}
            rocketPrediction={submittedRocketPrediction}
            result={result}
            onExplained={onTutorComplete}
          />
        )}
      </div>
    </div>
  )
}
