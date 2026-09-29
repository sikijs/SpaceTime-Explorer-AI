import { useEffect, useRef, useState } from 'react'
import { BASE_ARM_LENGTH, gravitationalWaveStateAt } from '../physics/gravitationalWaveExperiment'
import { GravitationalWaveTutor } from './GravitationalWaveTutor'

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

interface RunSummary {
  amplitude: number
  frequency: number
  minArmXLength: number
  maxArmXLength: number
  minArmYLength: number
  maxArmYLength: number
}

interface HistoryPoint {
  time: number
  armXLength: number
  armYLength: number
}

const GRAPH_WIDTH = 320
const GRAPH_HEIGHT = 140
const GRAPH_PADDING = 8
// Covers the full range of arm lengths reachable at the maximum learner-chosen amplitude (0.4).
const GRAPH_MIN_LENGTH = 0.75
const GRAPH_MAX_LENGTH = 1.25

function graphPoint(time: number, armLength: number, totalSimulatedTime: number): string {
  const x = GRAPH_PADDING + (time / totalSimulatedTime) * (GRAPH_WIDTH - 2 * GRAPH_PADDING)
  const normalized = (armLength - GRAPH_MIN_LENGTH) / (GRAPH_MAX_LENGTH - GRAPH_MIN_LENGTH)
  const y = GRAPH_HEIGHT - GRAPH_PADDING - normalized * (GRAPH_HEIGHT - 2 * GRAPH_PADDING)
  return `${x},${y}`
}

// Guaranteed by the physics model itself (see gravitationalWaveExperiment.ts): the two arms
// always deviate equally and oppositely, and always return to rest length after a full number
// of cycles — so these are the same regardless of the chosen amplitude/frequency.
const ACTUAL_DIRECTION: DirectionChoice = 'opposite-ways'
const ACTUAL_AFTER: AfterChoice = 'back-to-original'

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

export function GravitationalWaveExperiment({ onComplete, onTutorComplete }: GravitationalWaveExperimentProps) {
  const [amplitude, setAmplitude] = useState(0.2)
  const [frequency, setFrequency] = useState(1)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [simulatedTime, setSimulatedTime] = useState(0)
  const [runSummary, setRunSummary] = useState<RunSummary | null>(null)
  const [runCount, setRunCount] = useState(0)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [runTotalSimulatedTime, setRunTotalSimulatedTime] = useState(0)
  const runExtremesRef = useRef({ minArmXLength: BASE_ARM_LENGTH, maxArmXLength: BASE_ARM_LENGTH, minArmYLength: BASE_ARM_LENGTH, maxArmYLength: BASE_ARM_LENGTH })

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
    runExtremesRef.current = {
      minArmXLength: BASE_ARM_LENGTH,
      maxArmXLength: BASE_ARM_LENGTH,
      minArmYLength: BASE_ARM_LENGTH,
      maxArmYLength: BASE_ARM_LENGTH,
    }
    setRunSummary(null)
    setHistory([])
    setRunTotalSimulatedTime(RUN_CYCLES / frequency)
    setStatus('running')
    setRunCount((count) => count + 1)
  }

  useEffect(() => {
    if (status !== 'running') return

    const totalSimulatedTime = RUN_CYCLES / frequency
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const progress = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      const time = progress * totalSimulatedTime
      setSimulatedTime(time)

      const frameState = gravitationalWaveStateAt(time, amplitude, frequency)
      const extremes = runExtremesRef.current
      extremes.minArmXLength = Math.min(extremes.minArmXLength, frameState.armXLength)
      extremes.maxArmXLength = Math.max(extremes.maxArmXLength, frameState.armXLength)
      extremes.minArmYLength = Math.min(extremes.minArmYLength, frameState.armYLength)
      extremes.maxArmYLength = Math.max(extremes.maxArmYLength, frameState.armYLength)
      setHistory((previous) => [
        ...previous,
        { time, armXLength: frameState.armXLength, armYLength: frameState.armYLength },
      ])

      if (progress >= 1) {
        setStatus('complete')
        setRunSummary({ amplitude, frequency, ...runExtremesRef.current })
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, amplitude, frequency, onComplete])

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
            <strong>What "a ripple in spacetime" actually means.</strong> Every experiment in the
            "Gravity and Curved Spacetime" chapter showed spacetime curving around a mass that just
            sits there — the curvature was always fixed in place, like a bowling ball resting in the
            middle of a stretched sheet. But if that mass suddenly moves — especially something as
            violent as two black holes spiraling into each other — the dent it makes in spacetime has
            to change too. And that change can't happen everywhere at once: Experiment 5 showed that
            nothing, including a change in spacetime's own shape, can spread faster than the speed of
            light. So the change ripples outward from the source at exactly that speed, carrying a
            real, physical distortion of space along with it — squeezing space in one direction while
            stretching it in the perpendicular direction, then swapping back and forth, over and over,
            as it passes by. That traveling distortion is a gravitational wave.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> Drop a stone into a still pond. The ripple that
            spreads outward isn't water traveling all the way across the pond — it's a changing
            shape traveling, while each bit of water mostly just bobs up and down in place as the
            ripple passes under it. A gravitational wave works the same way for space itself: nothing
            physically flies outward from the source, but the shape of space at any given point
            stretches and squeezes as the ripple washes through it — which is exactly what you're
            about to watch happen to the two arms below.
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
            <li>
              This shows only one pattern a gravitational wave can stretch and squeeze in (called a
              "polarization") — real gravitational waves can also stretch and squeeze along a
              second, diagonal pair of directions at the same time, which this experiment leaves
              out.
            </li>
            <li>
              This shows the effect on two arms directly, not how a real detector actually measures
              such a tiny change (LIGO uses lasers bounced down each arm) — that measurement process
              itself isn't modeled here.
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
          Strain: {(Math.abs(state.strain) < 1e-9 ? 0 : state.strain).toFixed(3)} &nbsp;|&nbsp; Arm X
          length: {state.armXLength.toFixed(3)} &nbsp;|&nbsp; Arm Y length: {state.armYLength.toFixed(3)}
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

        {history.length > 1 && runTotalSimulatedTime > 0 && (
          <svg
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            style={{ marginTop: '1rem', border: '1px solid var(--border-color, #ccc)' }}
          >
            <line
              x1={GRAPH_PADDING}
              y1={graphPoint(0, BASE_ARM_LENGTH, runTotalSimulatedTime).split(',')[1]}
              x2={GRAPH_WIDTH - GRAPH_PADDING}
              y2={graphPoint(0, BASE_ARM_LENGTH, runTotalSimulatedTime).split(',')[1]}
              stroke="var(--border-color, #ccc)"
              strokeDasharray="4 4"
            />
            <polyline
              points={history.map((point) => graphPoint(point.time, point.armXLength, runTotalSimulatedTime)).join(' ')}
              fill="none"
              stroke="#7c3aed"
              strokeWidth={1.5}
            />
            <polyline
              points={history.map((point) => graphPoint(point.time, point.armYLength, runTotalSimulatedTime)).join(' ')}
              fill="none"
              stroke="#0891b2"
              strokeWidth={1.5}
            />
          </svg>
        )}
        {history.length > 1 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            <span style={{ color: '#7c3aed' }}>■</span> Arm X length &nbsp;&nbsp;
            <span style={{ color: '#0891b2' }}>■</span> Arm Y length &nbsp;&nbsp; (vs. simulated time)
          </p>
        )}

        {status === 'complete' &&
          runSummary &&
          submittedDirectionPrediction &&
          submittedAfterPrediction && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
              <h3 style={{ marginTop: 0 }}>Results</h3>
              <p>
                Wave amplitude <strong>{runSummary.amplitude.toFixed(2)}</strong>, frequency{' '}
                <strong>{runSummary.frequency.toFixed(2)}</strong>
                {presets.find(
                  (p) => p.amplitude === runSummary.amplitude && p.frequency === runSummary.frequency
                ) && (
                  <>
                    {' '}
                    (
                    {
                      presets.find(
                        (p) => p.amplitude === runSummary.amplitude && p.frequency === runSummary.frequency
                      )!.label
                    }
                    )
                  </>
                )}
                .
              </p>
              <p>
                Arm X ranged from <strong>{runSummary.minArmXLength.toFixed(3)}</strong> to{' '}
                <strong>{runSummary.maxArmXLength.toFixed(3)}</strong> — stretching by up to{' '}
                <strong>{(runSummary.maxArmXLength - BASE_ARM_LENGTH).toFixed(3)}</strong> and
                squeezing by up to{' '}
                <strong>{(BASE_ARM_LENGTH - runSummary.minArmXLength).toFixed(3)}</strong> (rest
                length is {BASE_ARM_LENGTH.toFixed(3)}). Arm Y ranged from{' '}
                <strong>{runSummary.minArmYLength.toFixed(3)}</strong> to{' '}
                <strong>{runSummary.maxArmYLength.toFixed(3)}</strong> — stretching by up to{' '}
                <strong>{(runSummary.maxArmYLength - BASE_ARM_LENGTH).toFixed(3)}</strong> and
                squeezing by up to{' '}
                <strong>{(BASE_ARM_LENGTH - runSummary.minArmYLength).toFixed(3)}</strong>.
              </p>
              <p>
                While the wave passed, the two arms always moved in opposite directions — as one
                stretched, the other squeezed by exactly the same amount — and both settled back to
                their original length of {BASE_ARM_LENGTH.toFixed(3)} once the wave had passed.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your prediction, direction:</strong>{' '}
                {directionChoices.find((c) => c.value === submittedDirectionPrediction)!.label}. In
                fact: {directionChoices.find((c) => c.value === ACTUAL_DIRECTION)!.label.toLowerCase()}.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Your prediction, after the wave:</strong>{' '}
                {afterChoices.find((c) => c.value === submittedAfterPrediction)!.label}. In fact:{' '}
                {afterChoices.find((c) => c.value === ACTUAL_AFTER)!.label.toLowerCase()}.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <strong>A real detection.</strong> This experiment's effect is hugely exaggerated.
                LIGO's real detectors have arms about 4 kilometers long, and the real gravitational
                wave from GW150914 (two colliding black holes, detected in 2015) changed those arms
                by only about one part in 10²¹ — roughly one-thousandth the width of a single proton.
                LIGO has since detected many more, including GW170817 in 2017, a neutron-star merger
                also seen by ordinary telescopes moments later.
              </p>
            </div>
          )}
      </div>

      {status === 'complete' && submittedDirectionPrediction && submittedAfterPrediction && (
        <GravitationalWaveTutor
          key={runCount}
          directionPrediction={submittedDirectionPrediction}
          afterPrediction={submittedAfterPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
