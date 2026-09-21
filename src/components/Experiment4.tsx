import { useEffect, useRef, useState } from 'react'
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
              <text x={startX} y={topY - 10} textAnchor="middle" fontSize="11" fill="#666">
                start
              </text>
              <text x={startX} y={bottomY + 18} textAnchor="middle" fontSize="11" fill="#666">
                start
              </text>
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

interface Experiment4Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment4({ onComplete, onTutorComplete }: Experiment4Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [predictionInput, setPredictionInput] = useState('')
  const [submittedPrediction, setSubmittedPrediction] = useState<number | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<LightClockExperimentResult | null>(null)
  const [labTime, setLabTime] = useState(0)
  const displayRef = useRef<HTMLDivElement>(null)

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
    // Bring the two clocks fully into view so the learner can watch the run.
    displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const animationDurationMs = result.movingTickDuration * PLAYBACK_MS_PER_LAB_SECOND
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      // A frame timestamp can fall slightly before startTime; never let lab time go negative.
      const progress = Math.min(Math.max((currentTime - startTime) / animationDurationMs, 0), 1)
      setLabTime(progress * result.movingTickDuration)

      if (progress >= 1) {
        setLabTime(result.movingTickDuration)
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
            <strong>The question.</strong> In Experiment 3, the moving clock measured less time than
            the lab clock. But why? What is going on inside a clock that could make it behave
            differently when it moves? To find out, we look inside the simplest clock we can build.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What a light clock is.</strong> A light clock is a clock made from a pulse of
            light that bounces up and down between two mirrors, one above the other. One trip up
            and back down is one <strong>tick</strong>, just like one tick of an ordinary clock.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How far apart are the mirrors?</strong> Light travels about 300,000 km in one
            second. We place the mirrors about{' '}
            {(MIRROR_SEPARATION * 300000).toLocaleString('en-US')} km apart, which is half of that
            distance. So light needs half a second to get from one mirror to the other, and one
            second for the whole trip up and back. That means one tick takes exactly{' '}
            {REST_TICK_DURATION} second when the clock is standing still. Real clocks are much
            smaller. We use a giant clock so that the numbers are easy to read. The distance light
            travels in one second has a name: a <strong>light-second</strong>. So the mirrors are
            half a light-second apart.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Two identical light clocks start at the same moment. One
            stands still in the lab. The other moves sideways at a steady speed that you choose.
            From the lab, we watch one tick of each clock and draw the path the pulse of light
            takes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Before you press START, predict how long one tick of the
            moving clock will take. Give your answer in <strong>lab seconds</strong>: seconds
            counted by the clocks standing still in the lab. A wrong guess is fine. Guesses are not
            scored.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How this differs from Experiment 3.</strong> Experiment 3 compared two clocks
            over a longer time, to see <em>how big</em> the difference is. This experiment looks at
            just one tick, to see <em>why</em> the difference happens.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a steady speed. It never speeds up or slows down.</li>
            <li>The moving clock moves sideways, across the light's up-and-down path, not along it.</li>
            <li>Both clocks start together: their pulses of light leave the bottom mirror at the same moment.</li>
            <li>
              We watch both clocks from the lab. The lab is a <strong>reference frame</strong>, as
              in Experiment 2: a group of people and clocks that are all standing still relative to
              one another, with their clocks set to agree. <strong>Lab time</strong> is the time
              shown on those clocks.
            </li>
            <li>
              The moving clock is not standing still relative to the lab, so it is not part of the
              lab's reference frame. It has its own reference frame: the point of view of someone
              riding along with it. So two reference frames are involved: the lab's and the moving
              clock's.
            </li>
            <li>
              The light source (the small lamp that sends out the pulse) and both mirrors are parts
              of the moving clock. Seen from the lab, they all move together, sideways, at the same
              speed.
            </li>
          </ul>
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
            The clock standing still ticks once every {REST_TICK_DURATION} second. The other clock
            moves sideways at {selectedVelocity ? `${selectedVelocity}c` : '—'}. Someone in the lab
            watches the light pulse in each clock, timing it with the lab's clocks. How many lab
            seconds will one tick of the moving clock take? Type a number.
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

        {/* Placed directly under START so the run is on screen the moment it begins. */}
        <div ref={displayRef} style={{ marginTop: '2rem' }}>
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
                caption={`Moving at ${shownVelocity}c (seen from the lab). Both mirrors move together. Dashed lines show where they started.`}
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
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: '#555' }}>
              c is the speed of light. A light speed of 1.000c means exactly the speed of light. A
              light-second is the distance light travels in one second.
            </p>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                Rest clock
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Distance the light travels in one tick: {result.restLightPath.toFixed(3)} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Time for one tick, on the lab's clocks: {result.restTickDuration.toFixed(3)} s
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Light's speed, seen from the lab (distance ÷ time): {result.lightSpeedRest.toFixed(3)}c
              </p>
            </div>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                Moving clock
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Distance the light travels in one tick: {result.movingLightPath.toFixed(3)} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Time for one tick, on the lab's clocks: {result.movingTickDuration.toFixed(3)} s
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Distance the clock moves sideways during one tick:{' '}
                {result.sidewaysDistancePerTick.toFixed(3)} light-seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Light's speed, seen from the lab (distance ÷ time): {result.lightSpeedMoving.toFixed(3)}c
              </p>
            </div>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>You guessed:</strong> {submittedPrediction} seconds
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>The real time for one tick of the moving clock, on the lab's clocks:</strong>{' '}
                {result.movingTickDuration.toFixed(3)} seconds
              </p>
            </div>
          </div>
        )}

        {status === 'complete' && result && submittedPrediction !== null && (
          <Experiment4Tutor
            onExplained={onTutorComplete}
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
