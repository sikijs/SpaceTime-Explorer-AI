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

export function GravitationalWaveExperiment(_props: GravitationalWaveExperimentProps) {
  const [amplitude, setAmplitude] = useState(0.2)
  const [frequency, setFrequency] = useState(1)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [simulatedTime, setSimulatedTime] = useState(0)

  const isRunning = status === 'running'
  const displayedTime = isRunning || status === 'complete' ? simulatedTime : 0
  const state = gravitationalWaveStateAt(displayedTime, amplitude, frequency)

  const handleRun = () => {
    if (isRunning) return
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
          disabled={isRunning}
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
          disabled={isRunning}
          onChange={(event) => setFrequency(Number(event.target.value))}
          style={{ width: '100%' }}
        />

        <div style={{ marginTop: '1rem' }}>
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="toggle-button"
              disabled={isRunning}
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
          disabled={isRunning}
          style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>

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
