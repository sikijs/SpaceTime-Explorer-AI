import { useEffect, useRef, useState } from 'react'
import {
  runSimultaneityExperiment,
  labViewStateAt,
  rodViewStateAt,
} from '../physics/relativityOfSimultaneityExperiment'
import type {
  SimultaneityResult,
  SimultaneityViewState,
} from '../physics/relativityOfSimultaneityExperiment'
import { Experiment7Tutor, actualOrderFor, orderWording } from './Experiment7Tutor'
import type { OrderChoice, FrameAgreementChoice } from './Experiment7Tutor'

type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'

// A custom speed must be positive; the v = 0 baseline is reached through its own preset instead.
const MIN_CUSTOM_SPEED = 0.01
const MAX_SPEED = 0.9

// Playback only: real milliseconds shown per lab second, capped so no run lasts too long.
// Never affects the physical result.
const PLAYBACK_MS_PER_LAB_SECOND = 4000
const MAX_RUN_MS = 15000

const VIEW_WIDTH = 720
const VIEW_HEIGHT = 92
const AXIS_Y = 42
const CENTER_X = VIEW_WIDTH / 2
const SIDE_MARGIN = 24
const MIRROR_HALF_HEIGHT = 26
const MAX_PX_PER_LS = 600

const orderChoices: Array<{ value: OrderChoice; label: string }> = [
  { value: 'same', label: 'At the same time' },
  { value: 'back', label: 'The back end first' },
  { value: 'front', label: 'The front end first' },
]

const agreementChoices: Array<{ value: FrameAgreementChoice; label: string }> = [
  { value: 'agree', label: 'Agree with the lab' },
  { value: 'disagree', label: 'Disagree with the lab' },
]

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

const resultLineStyle = { margin: '0.5rem 0', fontSize: '0.875rem' }
const resultBlockStyle = { paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }

interface SimultaneityPanelProps {
  title: string
  scale: number
  state: SimultaneityViewState
  backEventTime: number
  frontEventTime: number
}

// Draws what the physics model reports at the current time; no physics is calculated here.
function SimultaneityPanel({ title, scale, state, backEventTime, frontEventTime }: SimultaneityPanelProps) {
  const x = (position: number) => CENTER_X + position * scale

  const mirror = (position: number, key: string, color: string) => (
    <line
      key={key}
      x1={x(position)}
      y1={AXIS_Y - MIRROR_HALF_HEIGHT}
      x2={x(position)}
      y2={AXIS_Y + MIRROR_HALF_HEIGHT}
      stroke={color}
      strokeWidth={6}
    />
  )

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: '0 0 170px' }}>
        <p style={{ fontSize: '0.8125rem', color: '#666', margin: '0 0 0.25rem' }}>{title}</p>
        <p style={{ fontSize: '0.8125rem', margin: '0 0 0.125rem' }}>
          Back end reached: {state.backEventFired ? `${backEventTime.toFixed(3)} s` : '—'}
        </p>
        <p style={{ fontSize: '0.8125rem', margin: 0 }}>
          Front end reached: {state.frontEventFired ? `${frontEventTime.toFixed(3)} s` : '—'}
        </p>
      </div>
      <div
        style={{
          flex: '1 1 320px',
          minWidth: 0,
          backgroundColor: '#d9ecff',
          borderRadius: '6px',
          padding: '0.25rem 0.5rem',
        }}
      >
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`${title}: a flash of light travelling from the rod's center to both ends`}
          style={{ width: '100%', height: 'auto' }}
        >
          <line x1={x(0)} y1={4} x2={x(0)} y2={VIEW_HEIGHT - 4} stroke="#999" strokeWidth={1} strokeDasharray="2 3" />
          {mirror(state.backMirrorPosition, 'back', '#333')}
          {mirror(state.frontMirrorPosition, 'front', '#333')}
          <circle cx={x(state.leftPulsePosition)} cy={AXIS_Y} r="5" fill={state.backEventFired ? '#2e7d32' : '#e6a700'} />
          <circle cx={x(state.rightPulsePosition)} cy={AXIS_Y} r="5" fill={state.frontEventFired ? '#2e7d32' : '#e6a700'} />
        </svg>
      </div>
    </div>
  )
}

interface Experiment7Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment7({ onComplete, onTutorComplete }: Experiment7Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [predictionOrder, setPredictionOrder] = useState<OrderChoice | null>(null)
  const [predictionAgreement, setPredictionAgreement] = useState<FrameAgreementChoice | null>(null)
  const [submittedOrder, setSubmittedOrder] = useState<OrderChoice | null>(null)
  const [submittedAgreement, setSubmittedAgreement] = useState<FrameAgreementChoice | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<SimultaneityResult | null>(null)
  const [playTime, setPlayTime] = useState(0)
  const displayRef = useRef<HTMLDivElement>(null)

  // An empty or unparsable custom field must stay invalid, not silently fall back to a speed.
  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) : velocity
  const isRunning = status === 'running'
  const isValid =
    velocity === 'other'
      ? selectedVelocity >= MIN_CUSTOM_SPEED && selectedVelocity <= MAX_SPEED
      : true
  const speedLabel = isValid ? `${selectedVelocity}c` : '—'
  const statusLabel = isRunning ? 'Running...' : status === 'complete' ? 'Finished' : 'At rest'
  const canStart = isValid && predictionOrder !== null && predictionAgreement !== null && !isRunning

  // Before a run, preview the geometry for the selected speed. After a run, keep that run's own result.
  const geometry = result ?? (isValid ? runSimultaneityExperiment(selectedVelocity) : null)
  const shownSpeedLabel = result ? `${result.velocity}c` : speedLabel

  const handleStart = () => {
    if (!canStart) return
    setSubmittedOrder(predictionOrder)
    setSubmittedAgreement(predictionAgreement)
    setPredictionOrder(null)
    setPredictionAgreement(null)
    setPlayTime(0)
    setResult(runSimultaneityExperiment(selectedVelocity))
    setStatus('running')
    displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    const runDuration = Math.max(result.frontEventLabTime, result.rodFrameEventTime)
    const animationDurationMs =
      runDuration * Math.min(PLAYBACK_MS_PER_LAB_SECOND, MAX_RUN_MS / runDuration)
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / animationDurationMs, 0), 1)
      setPlayTime(progress * runDuration)

      if (progress >= 1) {
        setPlayTime(runDuration)
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  const labState = geometry ? labViewStateAt(geometry, playTime) : null
  const rodState = geometry ? rodViewStateAt(geometry, playTime) : null

  const labExtent = geometry ? geometry.labLength / 2 + geometry.velocity * geometry.frontEventLabTime : 1
  const rodExtent = geometry ? geometry.restLength / 2 : 1
  const labScale = Math.min(MAX_PX_PER_LS, (CENTER_X - SIDE_MARGIN) / labExtent)
  const rodScale = Math.min(MAX_PX_PER_LS, (CENTER_X - SIDE_MARGIN) / rodExtent)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Experiment 7 — At the Same Time... For Whom?</h1>

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
            <strong>The question.</strong> If two things happen "at the same time," is that a fact
            everyone agrees on, no matter how they are moving?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> In Experiment 6, a rod moved along its own length, and
            its length, seen from the lab, was shorter than its length at rest. Here we use that
            same rod. A flash of light is released from its exact middle and travels out to both
            ends. Someone riding along with the rod sees the flash reach both ends together. The lab
            sees something different.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What "point of view" means here.</strong> Every observer in this experiment is
            standing still relative to their own reference frame, just watching. "The rod's own
            point of view" means what someone moving along with the rod — at the same speed, right
            beside it — would see and measure with their own clocks. "The lab's point of view" means
            what someone standing still in the lab, watching the rod go by, would see and measure
            with the lab's clocks. Both viewpoints are equally real; the experiment asks whether they
            agree on what "at the same time" means.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Before you press START, predict whether the flash reaches the
            two ends of the moving rod at the same moment, as measured by the lab's clocks, and if
            not, which end first. Also predict whether the rod's own point of view agrees or
            disagrees with the lab. Guesses are not scored.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>A new term: simultaneity.</strong> "Simultaneity" just means two things happening
            at the same time. "Relativity of simultaneity" is the idea that different reference
            frames can disagree about which events are simultaneous.
          </p>
          <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: '0.25rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the rod keeps a steady speed.</li>
            <li>Light always travels at c in the lab, in both directions (Experiment 5).</li>
            <li>
              The rod's length, seen from the lab, is shorter than its rest length, by the amount
              Experiment 6 found.
            </li>
            <li>The rod only moves along its own length. There is no sideways motion.</li>
            <li>
              Two reference frames are involved, as in Experiments 3 to 6: the lab's and the moving
              rod's.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Rod speed
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Speeds are given as a fraction of <strong>c</strong>, the speed of light. In this
            experiment you can choose speeds up to {MAX_SPEED}c.
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => setVelocity(0)}
              disabled={isRunning}
              style={optionButtonStyle(velocity === 0, isRunning)}
            >
              0c (at rest)
            </button>
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
                min={MIN_CUSTOM_SPEED}
                max={MAX_SPEED}
                step="0.01"
                value={customVelocity}
                onChange={(e) => setCustomVelocity(e.target.value)}
                disabled={isRunning}
                placeholder={`Fraction of c (${MIN_CUSTOM_SPEED}-${MAX_SPEED})`}
                style={inputStyle}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Selected speed: <strong>{speedLabel}</strong>
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            A rod is 0.5 light-seconds long. A flash of light is released from its exact center. If
            the rod is standing still, the flash reaches both ends at the same time. Now the rod
            moves at {speedLabel} along its own length. Light still travels at c in the lab, in both
            directions.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            <strong>Part 1.</strong> Will the flash reach the two ends of the moving rod at the same
            time, as measured by the lab's clocks? If not, which end first?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {orderChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPredictionOrder(choice.value)}
                disabled={isRunning}
                style={optionButtonStyle(predictionOrder === choice.value, isRunning)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            <strong>Part 2.</strong> Someone riding along with the rod also has a point of view. Does
            it agree or disagree with the lab about whether the two ends were reached at the same
            time?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {agreementChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPredictionAgreement(choice.value)}
                disabled={isRunning}
                style={optionButtonStyle(predictionAgreement === choice.value, isRunning)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {predictionOrder !== null && predictionAgreement !== null
              ? `Your prediction: ${orderChoices.find((c) => c.value === predictionOrder)?.label.toLowerCase()}; the rod's own view would ${predictionAgreement === 'agree' ? 'agree' : 'disagree'} with the lab.`
              : submittedOrder !== null && submittedAgreement !== null
                ? `Your prediction: ${orderChoices.find((c) => c.value === submittedOrder)?.label.toLowerCase()}; the rod's own view would ${submittedAgreement === 'agree' ? 'agree' : 'disagree'} with the lab.`
                : 'Choose an option in each part to continue'}
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

        <div ref={displayRef} style={{ marginTop: '2rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            {statusLabel} · Time: <strong>{playTime.toFixed(2)} s</strong>
          </p>

          {geometry && labState && rodState ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <SimultaneityPanel
                title="The rod's own point of view"
                scale={rodScale}
                state={rodState}
                backEventTime={geometry.rodFrameEventTime}
                frontEventTime={geometry.rodFrameEventTime}
              />
              <SimultaneityPanel
                title="The lab's point of view"
                scale={labScale}
                state={labState}
                backEventTime={geometry.backEventLabTime}
                frontEventTime={geometry.frontEventLabTime}
              />
              <p style={{ fontSize: '0.8125rem', color: '#555', margin: '0.25rem 0 0' }}>
                The dashed line marks where the flash was released. The rod moves at {shownSpeedLabel}{' '}
                in the lab's panel; it does not move in its own panel. A dot turns green once the
                flash has reached that end.
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Choose a speed between 0c and {MAX_SPEED}c to see the rod.
            </p>
          )}
        </div>

        {status === 'complete' && result && submittedOrder !== null && submittedAgreement !== null && (
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

            <p style={resultLineStyle}>
              <strong>Rod speed:</strong> {result.velocity}c
            </p>
            <p style={resultLineStyle}>
              <strong>Rod's length, seen from the lab (Experiment 6):</strong>{' '}
              {result.labLength.toFixed(3)} light-seconds (rest length {result.restLength.toFixed(3)})
            </p>

            <div style={resultBlockStyle}>
              <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>In the lab's frame</p>
              <p style={resultLineStyle}>
                Back end reached: {result.backEventLabTime.toFixed(3)} s
              </p>
              <p style={resultLineStyle}>
                Front end reached: {result.frontEventLabTime.toFixed(3)} s
              </p>
              <p style={resultLineStyle}>Gap between the two events: {result.labTimeGap.toFixed(3)} s</p>
            </div>

            <div style={resultBlockStyle}>
              <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>In the rod's own frame</p>
              <p style={resultLineStyle}>
                Both ends reached: {result.rodFrameEventTime.toFixed(3)} s
              </p>
            </div>

            <div style={resultBlockStyle}>
              <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>Your prediction</p>
              <p style={resultLineStyle}>
                You guessed the flash would reach the ends{' '}
                {orderChoices.find((c) => c.value === submittedOrder)?.label.toLowerCase()}, and that
                the rod's own view would{' '}
                {submittedAgreement === 'agree' ? 'agree' : 'disagree'} with the lab.
              </p>
              <p style={resultLineStyle}>
                Actual result, in the lab's frame: {orderWording[actualOrderFor(result)]}, a gap of{' '}
                {result.labTimeGap.toFixed(3)} s.
              </p>
            </div>
          </div>
        )}

        {status === 'complete' && result && submittedOrder !== null && submittedAgreement !== null && (
          <Experiment7Tutor
            result={result}
            predictionOrder={submittedOrder}
            predictionAgreement={submittedAgreement}
            onExplained={onTutorComplete}
          />
        )}
      </div>
    </div>
  )
}
