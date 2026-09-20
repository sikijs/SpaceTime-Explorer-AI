import { useEffect, useState } from 'react'
import {
  lightClockStateAt,
  runLightClockExperiment,
  MIRROR_SEPARATION,
  REST_TICK_DURATION,
} from '../physics/lightClockExperiment'
import type { LightClockExperimentResult, LightClockState } from '../physics/lightClockExperiment'
import { Experiment4Tutor } from './Experiment4Tutor'

type VelocityOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'

// Playback only: real milliseconds shown per lab second. Never affects the physical result.
const PLAYBACK_MS_PER_LAB_SECOND = 2000

// Drawing constants (SVG units). Distances from the model are in light-seconds.
const VIEW_SIZE = 200
const MIRROR_WIDTH_LS = 0.4
const MAX_PX_PER_LS = 280
const MAX_DRAW_WIDTH = 170

const optionButtonStyle = (selected: boolean, disabled: boolean) => ({
  marginRight: '0.5rem',
  padding: '0.5rem 1rem',
  backgroundColor: selected ? '#007bff' : '#f0f0f0',
  color: selected ? 'white' : 'black',
  border: '1px solid #ccc',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '0.875rem',
  opacity: disabled ? 0.6 : 1,
})

const inputStyle = {
  padding: '0.5rem',
  fontSize: '0.875rem',
  border: '1px solid #ccc',
  borderRadius: '4px',
  width: '200px',
}

// Same clock look as Experiment 3.
const clockBoxStyle = {
  fontSize: '2.5rem',
  fontFamily: 'monospace',
  fontWeight: 'bold' as const,
  padding: '1rem 0.5rem',
  backgroundColor: '#d9ecff',
  borderRadius: '6px',
  textAlign: 'center' as const,
  marginBottom: '0.75rem',
}

function formatClockReading(seconds: number): string {
  const tenths = Math.round(seconds * 10)
  const whole = Math.floor(tenths / 10)
  const minutes = Math.floor(whole / 60)
  const secs = whole % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths % 10}`
}

// Both panels share one scale so the two light paths can be compared by eye.
function pixelsPerLightSecond(geometry: LightClockExperimentResult): number {
  return Math.min(
    MAX_PX_PER_LS,
    MAX_DRAW_WIDTH / (geometry.sidewaysDistancePerTick + MIRROR_WIDTH_LS)
  )
}

interface LightClockPanelProps {
  title: string
  caption: string
  geometry: LightClockExperimentResult
  state: LightClockState
  moving: boolean
}

// Draws what the physics model reports at the current lab time; no physics is calculated here.
function LightClockPanel({ title, caption, geometry, state, moving }: LightClockPanelProps) {
  const scale = pixelsPerLightSecond(geometry)
  const L = geometry.mirrorSeparation
  const sideways = moving ? geometry.sidewaysDistancePerTick : 0
  const phase = moving ? state.movingPhase : state.restPhase
  const ownReading = moving ? state.movingClockReading : state.restClockReading
  const pulseHeightNow = moving ? state.movingPulseHeight : state.restPulseHeight
  const offsetNow = moving ? state.movingSidewaysOffset : 0

  const bottomY = VIEW_SIZE / 2 + (L * scale) / 2
  const topY = VIEW_SIZE / 2 - (L * scale) / 2
  const drawWidth = (sideways + MIRROR_WIDTH_LS) * scale
  const startX = (VIEW_SIZE - drawWidth) / 2 + (MIRROR_WIDTH_LS / 2) * scale
  const currentX = startX + offsetNow * scale
  const halfMirror = (MIRROR_WIDTH_LS / 2) * scale
  const pulseY = bottomY - pulseHeightNow * scale

  const trace: Array<[number, number]> = [[startX, bottomY]]
  if (phase > 0.5) trace.push([startX + (sideways / 2) * scale, topY])
  trace.push([currentX, pulseY])

  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>{title}</p>
      <div style={clockBoxStyle}>{formatClockReading(ownReading)}</div>
      <div style={{ backgroundColor: '#d9ecff', borderRadius: '6px', padding: '0.5rem' }}>
        <svg
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          role="img"
          aria-label={`${title}: light pulse travelling between two mirrors`}
          style={{ width: '100%', maxWidth: '220px', height: 'auto' }}
        >
          {moving && sideways * scale > 4 && (
            <>
              <line
                x1={startX - halfMirror}
                y1={topY}
                x2={startX + halfMirror}
                y2={topY}
                stroke="#999"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <line
                x1={startX - halfMirror}
                y1={bottomY}
                x2={startX + halfMirror}
                y2={bottomY}
                stroke="#999"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </>
          )}
          <polyline
            points={trace.map(([x, y]) => `${x},${y}`).join(' ')}
            fill="none"
            stroke="#e6a700"
            strokeWidth="2"
          />
          <line
            x1={currentX - halfMirror}
            y1={topY}
            x2={currentX + halfMirror}
            y2={topY}
            stroke="#333"
            strokeWidth="6"
          />
          <line
            x1={currentX - halfMirror}
            y1={bottomY}
            x2={currentX + halfMirror}
            y2={bottomY}
            stroke="#333"
            strokeWidth="6"
          />
          <circle cx={currentX} cy={pulseY} r="6" fill="#e6a700" />
        </svg>
      </div>
      <p style={{ fontSize: '0.8125rem', color: '#555', marginTop: '0.5rem' }}>{caption}</p>
    </div>
  )
}

export function Experiment4() {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [predictionInput, setPredictionInput] = useState('')
  const [submittedPrediction, setSubmittedPrediction] = useState<number | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<LightClockExperimentResult | null>(null)
  const [labTime, setLabTime] = useState(0)

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) || 0 : velocity
  const isRunning = status === 'running'
  const isValid = selectedVelocity >= 0.01 && selectedVelocity <= 0.99
  const statusLabel = isRunning ? 'Running...' : 'At rest'
  const predictionValue = predictionInput.trim() ? Number(predictionInput) : null
  const hasPrediction = predictionValue !== null && isFinite(predictionValue)
  const canStart = isValid && hasPrediction && !isRunning

  // Before a run, preview the drawing for the selected speed. After a run, keep that run's own geometry.
  const geometry = result ?? (isValid ? runLightClockExperiment(selectedVelocity) : null)
  const clockState = geometry ? lightClockStateAt(geometry, labTime) : null
  const shownVelocity = result ? result.velocity : selectedVelocity

  const handleStart = () => {
    if (!canStart) return
    setSubmittedPrediction(predictionValue)
    setPredictionInput('')
    setLabTime(0)
    setResult(runLightClockExperiment(selectedVelocity))
    setStatus('running')
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const animationDurationMs = result.movingTickDuration * PLAYBACK_MS_PER_LAB_SECOND
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / animationDurationMs, 1)
      setLabTime(progress * result.movingTickDuration)

      if (progress >= 1) {
        setLabTime(result.movingTickDuration)
        setStatus('complete')
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Experiment 4 — The Light Clock</h1>

      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: '#555' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> What is going on inside a clock that could make it
            behave differently when it moves?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What a light clock is.</strong> A pulse of light bounces between two mirrors,
            one above the other. One round trip, from the bottom mirror to the top mirror and back,
            is one <strong>tick</strong>. Here the mirrors are {MIRROR_SEPARATION} light-seconds
            apart. A <strong>light-second</strong> is the distance light travels in one second
            (about 300,000 km), so one tick of a clock at rest takes {REST_TICK_DURATION} second.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Two identical light clocks start together. One sits
            still in the lab. The other moves sideways at a steady speed you choose. We watch one
            tick of each clock from the lab and trace the path the light pulse takes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Predict how long, in lab seconds, one tick of the moving
            clock takes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How this differs from Experiment 3.</strong> Experiment 3 compared two clocks
            over a longer time and measured <em>how much</em> they differ. This experiment zooms in
            on a single tick to look at <em>why</em>.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a constant speed (no acceleration).</li>
            <li>The moving clock travels sideways, at right angles to the line joining its mirrors.</li>
            <li>Both clocks start together: their pulses leave the bottom mirror at the same moment.</li>
            <li>
              The lab has clocks at rest that are synchronized with each other, as in Experiment 2.
              <strong> Lab time</strong> is time read on those lab clocks.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            {statusLabel} · Lab time: <strong>{labTime.toFixed(2)} s</strong>
          </p>

          {geometry && clockState ? (
            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '1rem' }}>
              <LightClockPanel
                title="Rest Clock"
                caption="At rest in the lab"
                geometry={geometry}
                state={clockState}
                moving={false}
              />
              <LightClockPanel
                title="Moving Clock"
                caption={`Moving at ${shownVelocity}c (seen from the lab)`}
                geometry={geometry}
                state={clockState}
                moving
              />
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Choose a speed between 0.01c and 0.99c to see the clocks.
            </p>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Moving clock speed
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Speeds are given as a fraction of <strong>c</strong>, the speed of light (about 300,000
            km/s). For example, 0.5c means half the speed of light.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            {[0.1, 0.3, 0.5, 0.8].map((preset) => (
              <button
                key={preset}
                onClick={() => setVelocity(preset as VelocityOption)}
                disabled={isRunning}
                style={optionButtonStyle(velocity === preset, isRunning)}
              >
                {preset}c
              </button>
            ))}
            <button
              onClick={() => setVelocity('other')}
              disabled={isRunning}
              style={optionButtonStyle(velocity === 'other', isRunning)}
            >
              Other
            </button>
          </div>

          {velocity === 'other' && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="number"
                min="0.01"
                max="0.99"
                step="0.01"
                value={customVelocity}
                onChange={(e) => setCustomVelocity(e.target.value)}
                disabled={isRunning}
                placeholder="Fraction of c (0.01-0.99)"
                style={inputStyle}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Selected speed: <strong>{selectedVelocity ? `${selectedVelocity}c` : '—'}</strong>
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Two identical light clocks. The rest clock ticks once every {REST_TICK_DURATION} second.
            The other clock moves sideways at {selectedVelocity ? `${selectedVelocity}c` : '—'}. The lab observer
            watches the light pulse in each clock. How long, in lab seconds, will one tick of the
            moving clock take?
          </p>
          <input
            type="number"
            step="any"
            value={predictionInput}
            onChange={(e) => setPredictionInput(e.target.value)}
            disabled={isRunning}
            placeholder="Enter seconds"
            style={{
              ...inputStyle,
              opacity: isRunning ? 0.6 : 1,
              cursor: isRunning ? 'not-allowed' : 'text',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {hasPrediction
              ? `Your prediction: ${predictionValue} seconds`
              : submittedPrediction !== null
                ? `Your prediction: ${submittedPrediction} seconds`
                : 'Enter a prediction to continue'}
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: isRunning ? '#6c757d' : canStart ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canStart ? 'pointer' : 'not-allowed',
            opacity: canStart ? 1 : 0.7,
          }}
        >
          {isRunning ? 'Running...' : 'START'}
        </button>

        {status === 'complete' && result && submittedPrediction !== null && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#fafafa',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>Results</h2>

            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
              <strong>Moving clock speed:</strong> {result.velocity}c
            </p>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                Rest clock
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Light path per tick: {result.restLightPath.toFixed(3)} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Tick duration (lab time): {result.restTickDuration.toFixed(3)} s
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Light speed (path ÷ duration): {result.lightSpeedRest.toFixed(3)}c
              </p>
            </div>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                Moving clock
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Light path per tick: {result.movingLightPath.toFixed(3)} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Tick duration (lab time): {result.movingTickDuration.toFixed(3)} s
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Sideways distance per tick: {result.sidewaysDistancePerTick.toFixed(3)} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Light speed (path ÷ duration): {result.lightSpeedMoving.toFixed(3)}c
              </p>
            </div>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Your prediction:</strong> {submittedPrediction} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Actual moving-clock tick:</strong> {result.movingTickDuration.toFixed(3)}{' '}
                seconds
              </p>
            </div>
          </div>
        )}

        {status === 'complete' && result && submittedPrediction !== null && (
          <Experiment4Tutor
            velocity={result.velocity}
            prediction={submittedPrediction}
            restTickDuration={result.restTickDuration}
            movingTickDuration={result.movingTickDuration}
            timeDilationFactor={result.timeDilationFactor}
          />
        )}
      </div>
    </div>
  )
}
