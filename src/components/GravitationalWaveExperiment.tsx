import { useEffect, useState } from 'react'
import { BASE_ARM_LENGTH, gravitationalWaveStateAt } from '../physics/gravitationalWaveExperiment'

interface GravitationalWaveExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_SIZE = 320
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180
type ExperimentStatus = 'idle' | 'running' | 'complete'

// How many full oscillation cycles a run plays through, per the specification.
const RUN_CYCLES = 5
// Fixed real-world playback duration, independent of the chosen frequency (CLAUDE.md §11 —
// playback speed must not change the physical result, only how quickly it's shown).
const ANIMATION_DURATION_MS = 3500

interface SourcePreset {
  label: string
  amplitude: number
  frequency: number
}

const presets: SourcePreset[] = [
  { label: 'Distant / weak source', amplitude: 0.08, frequency: 0.5 },
  { label: 'Typical detected event', amplitude: 0.2, frequency: 1 },
  { label: 'Strong / nearby source', amplitude: 0.35, frequency: 1.6 },
]

function armEndPoint(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x'
    ? { x: CORNER.x + pixels, y: CORNER.y }
    : { x: CORNER.x, y: CORNER.y - pixels }
}

type DirectionChoice = 'same-way' | 'opposite-ways'
type AfterChoice = 'longer' | 'shorter' | 'back-to-original'

const directionChoices: Array<{ value: DirectionChoice; label: string }> = [
  { value: 'same-way', label: 'Both arms do the same thing at the same time' },
  { value: 'opposite-ways', label: 'The two arms do opposite things' },
]

const afterChoices: Array<{ value: AfterChoice; label: string }> = [
  { value: 'longer', label: 'Longer than they started' },
  { value: 'shorter', label: 'Shorter than they started' },
  { value: 'back-to-original', label: 'Back to their original length' },
]

function DirectionQuestion({
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  selected: DirectionChoice | null
  submitted: DirectionChoice | null
  onSelect: (choice: DirectionChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        When a gravitational wave passes through the two perpendicular arms, do you think both
        arms stretch and squeeze together (the same way, at the same time), or do they do opposite
        things?
      </p>
      <div style={{ marginBottom: '0.5rem' }}>
        {directionChoices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected || submitted
          ? `Your prediction: ${directionChoices.find((c) => c.value === (selected ?? submitted))!.label}`
          : 'Choose an option to continue'}
      </p>
    </div>
  )
}

function AfterQuestion({
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  selected: AfterChoice | null
  submitted: AfterChoice | null
  onSelect: (choice: AfterChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        After the wave has completely passed, do you think the arms end up longer than they
        started, shorter, or back to their original length?
      </p>
      <div style={{ marginBottom: '0.5rem' }}>
        {afterChoices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected || submitted
          ? `Your prediction: ${afterChoices.find((c) => c.value === (selected ?? submitted))!.label}`
          : 'Choose an option to continue'}
      </p>
    </div>
  )
}

export function GravitationalWaveExperiment(_props: GravitationalWaveExperimentProps) {
  const [amplitude, setAmplitude] = useState(0.2)
  const [frequency, setFrequency] = useState(1)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [simulatedTime, setSimulatedTime] = useState(0)

  const [directionPrediction, setDirectionPrediction] = useState<DirectionChoice | null>(null)
  const [afterPrediction, setAfterPrediction] = useState<AfterChoice | null>(null)
  const [submittedDirectionPrediction, setSubmittedDirectionPrediction] = useState<DirectionChoice | null>(null)
  const [submittedAfterPrediction, setSubmittedAfterPrediction] = useState<AfterChoice | null>(null)

  const hasAllPredictions = directionPrediction !== null && afterPrediction !== null
  const hasSubmittedPredictions = submittedDirectionPrediction !== null

  const isRunning = status === 'running'
  const displayedTime = isRunning || status === 'complete' ? simulatedTime : 0
  const state = gravitationalWaveStateAt(displayedTime, amplitude, frequency)

  const handleRun = () => {
    if (!hasAllPredictions || isRunning) return
    if (!hasSubmittedPredictions) {
      setSubmittedDirectionPrediction(directionPrediction)
      setSubmittedAfterPrediction(afterPrediction)
    }
    setStatus('running')
  }

  useEffect(() => {
    if (status !== 'running') return

    const totalSimulatedTime = RUN_CYCLES / frequency
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setSimulatedTime(progress * totalSimulatedTime)

      if (progress >= 1) {
        setStatus('complete')
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, frequency])

  const xEnd = armEndPoint('x', state.armXLength)
  const yEnd = armEndPoint('y', state.armYLength)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 1 — Ripples in Spacetime</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Experiment 4 showed that curved space can make two
            straight-as-possible paths drift together. But can spacetime's curvature itself move —
            can it travel somewhere, like a ripple on a pond? And if it did, could we ever actually
            detect it?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll watch two perpendicular "arms" of free-floating
            points, set up the same way a real gravitational-wave detector is built. When a wave
            passes through, you'll see one arm stretch while the other squeezes, over and over,
            before both settle back to normal.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Try different wave strengths and speeds — including a
            strength modeled on a real detected event — and watch what the two arms do, together
            and compared to each other.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The effect here is hugely exaggerated — a real gravitational wave changes a real
              detector's arms by about one-thousandth the width of a single proton, far too small
              to show at any visible scale.
            </li>
            <li>
              The wave here arrives at one constant strength and speed for simplicity; real events
              (like two black holes spiraling together) actually build up in both strength and
              speed right until the moment of collision.
            </li>
          </ul>
        </div>

        <DirectionQuestion
          selected={directionPrediction}
          submitted={submittedDirectionPrediction}
          onSelect={setDirectionPrediction}
          disabled={hasSubmittedPredictions}
        />
        <AfterQuestion
          selected={afterPrediction}
          submitted={submittedAfterPrediction}
          onSelect={setAfterPrediction}
          disabled={hasSubmittedPredictions}
        />

        <label htmlFor="wave-amplitude" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Wave amplitude: {amplitude.toFixed(2)}
        </label>
        <input
          id="wave-amplitude"
          type="range"
          min={0.05}
          max={0.4}
          step={0.01}
          value={amplitude}
          disabled={!hasAllPredictions || isRunning}
          onChange={(event) => setAmplitude(Number(event.target.value))}
          style={{ width: '100%' }}
        />

        <label
          htmlFor="wave-frequency"
          style={{ display: 'block', marginTop: '1rem', marginBottom: '0.5rem' }}
        >
          Wave frequency: {frequency.toFixed(2)}
        </label>
        <input
          id="wave-frequency"
          type="range"
          min={0.25}
          max={2}
          step={0.05}
          value={frequency}
          disabled={!hasAllPredictions || isRunning}
          onChange={(event) => setFrequency(Number(event.target.value))}
          style={{ width: '100%' }}
        />

        <div style={{ marginTop: '1rem' }}>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="toggle-button"
              disabled={!hasAllPredictions || isRunning}
              onClick={() => {
                setAmplitude(preset.amplitude)
                setFrequency(preset.frequency)
              }}
              style={{ marginRight: '0.5rem' }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasAllPredictions || isRunning}
          style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        {!hasAllPredictions && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer both predictions above to try the controls.
          </p>
        )}

        <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.875rem' }}>
          Strain: {state.strain.toFixed(3)} &nbsp;|&nbsp; Arm X length: {state.armXLength.toFixed(3)}{' '}
          &nbsp;|&nbsp; Arm Y length: {state.armYLength.toFixed(3)}
        </p>

        <svg
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          style={{ marginTop: '1rem', border: '1px solid var(--border-color, #ccc)', overflow: 'hidden' }}
        >
          <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke="currentColor" strokeWidth={1.5} />
          <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke="currentColor" strokeWidth={1.5} />
          <circle cx={CORNER.x} cy={CORNER.y} r={4} fill="currentColor" />
          <circle cx={xEnd.x} cy={xEnd.y} r={4} fill="currentColor" />
          <circle cx={yEnd.x} cy={yEnd.y} r={4} fill="currentColor" />
        </svg>
      </div>
    </div>
  )
}
