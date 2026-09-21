import { useEffect, useRef, useState } from 'react'
import {
  lengthContractionStateAt,
  runLengthContractionExperiment,
} from '../physics/lengthContractionExperiment'
import type { LengthContractionResult, PulseLeg } from '../physics/lengthContractionExperiment'

type VelocityOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'

// This experiment allows speeds up to 0.9c: the tick of the "same length" clock grows very quickly
// above that (about 50 seconds at 0.99c).
const MIN_SPEED = 0.01
const MAX_SPEED = 0.9

// Playback only: real milliseconds shown per lab second, so that no run lasts more than about
// 15 real seconds. Never affects the physical result.
const PLAYBACK_MS_PER_LAB_SECOND = 2000
const MAX_RUN_MS = 15000

// Drawing constants (SVG units). Distances from the model are in light-seconds. The clocks are drawn
// along a horizontal line, the direction of motion, so the panels are wide.
const VIEW_WIDTH = 720
const VIEW_HEIGHT = 110
const AXIS_Y = 55
const LEFT_MARGIN = 20
const RIGHT_MARGIN = 20
const MIRROR_HALF_HEIGHT = 26
const LEG_OFFSET = 8
const MAX_PX_PER_LS = 280

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

// Same clock look as Experiments 3 to 5.
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

// The furthest the front mirror gets during the run, over both moving clocks. All panels share one
// scale so the lengths and paths can be compared by eye.
function widestExtent(geometry: LengthContractionResult): number {
  return Math.max(
    geometry.sameLength.lengthInLab + geometry.sameLength.sidewaysDistancePerTick,
    geometry.shorterLength.lengthInLab + geometry.shorterLength.sidewaysDistancePerTick
  )
}

function pixelsPerLightSecond(geometry: LengthContractionResult): number {
  return Math.min(MAX_PX_PER_LS, (VIEW_WIDTH - LEFT_MARGIN - RIGHT_MARGIN) / widestExtent(geometry))
}

interface LightClockPanelProps {
  title: string
  caption: string
  scale: number
  clockReading: number
  leg: PulseLeg
  turnPosition: number // where the pulse turns round: the front mirror at that moment
  startFrontPosition: number | null // where the front mirror started; null for the rest clock
  backMirrorPosition: number
  frontMirrorPosition: number
  pulsePosition: number
}

// Draws what the physics model reports at the current lab time; no physics is calculated here.
// The forward and return legs are drawn at slightly different heights only so both can be seen.
function LightClockPanel({
  title,
  caption,
  scale,
  clockReading,
  leg,
  turnPosition,
  startFrontPosition,
  backMirrorPosition,
  frontMirrorPosition,
  pulsePosition,
}: LightClockPanelProps) {
  const x = (position: number) => LEFT_MARGIN + position * scale
  const forwardY = AXIS_Y - LEG_OFFSET
  const returnY = AXIS_Y + LEG_OFFSET
  const pulseY = leg === 'forward' ? forwardY : returnY

  const trace: Array<[number, number]> = [[x(0), forwardY]]
  if (leg !== 'forward') trace.push([x(turnPosition), forwardY], [x(turnPosition), returnY])
  trace.push([x(pulsePosition), pulseY])

  const mirror = (position: number, key: string, color: string, dashed = false) => (
    <line
      key={key}
      x1={x(position)}
      y1={AXIS_Y - MIRROR_HALF_HEIGHT}
      x2={x(position)}
      y2={AXIS_Y + MIRROR_HALF_HEIGHT}
      stroke={color}
      strokeWidth={dashed ? 2 : 6}
      strokeDasharray={dashed ? '4 3' : undefined}
    />
  )

  return (
    <div style={{ textAlign: 'center', width: '100%', minWidth: 0 }}>
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>{title}</p>
      <div style={clockBoxStyle}>{formatClockReading(clockReading)}</div>
      <div style={{ backgroundColor: '#d9ecff', borderRadius: '6px', padding: '0.5rem' }}>
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          role="img"
          aria-label={`${title}: light pulse travelling between two mirrors along the direction of motion`}
          style={{ width: '100%', height: 'auto' }}
        >
          {startFrontPosition !== null && (
            <>
              {mirror(0, 'start-back', '#999', true)}
              {mirror(startFrontPosition, 'start-front', '#999', true)}
              <text x={x(0)} y={AXIS_Y + MIRROR_HALF_HEIGHT + 14} textAnchor="middle" fontSize="11" fill="#666">
                start
              </text>
              <text
                x={x(startFrontPosition)}
                y={AXIS_Y + MIRROR_HALF_HEIGHT + 14}
                textAnchor="middle"
                fontSize="11"
                fill="#666"
              >
                start
              </text>
            </>
          )}
          <polyline
            points={trace.map(([px, py]) => `${px},${py}`).join(' ')}
            fill="none"
            stroke="#e6a700"
            strokeWidth="2"
          />
          {mirror(backMirrorPosition, 'back', '#333')}
          {mirror(frontMirrorPosition, 'front', '#333')}
          <circle cx={x(pulsePosition)} cy={pulseY} r="5" fill="#e6a700" />
        </svg>
      </div>
      <p style={{ fontSize: '0.8125rem', color: '#555', marginTop: '0.5rem' }}>{caption}</p>
    </div>
  )
}

interface Experiment6Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// onTutorComplete is wired up in a later step, when the tutor exists.
export function Experiment6({ onComplete }: Experiment6Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<LengthContractionResult | null>(null)
  const [labTime, setLabTime] = useState(0)
  const displayRef = useRef<HTMLDivElement>(null)

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) || 0 : velocity
  const isRunning = status === 'running'
  const isValid = selectedVelocity >= MIN_SPEED && selectedVelocity <= MAX_SPEED
  const speedLabel = isValid ? `${selectedVelocity}c` : '—'
  const statusLabel = isRunning ? 'Running...' : status === 'complete' ? 'Finished' : 'At rest'
  const canStart = isValid && !isRunning

  // Before a run, preview the drawing for the selected speed. After a run, keep that run's own geometry.
  const geometry = result ?? (isValid ? runLengthContractionExperiment(selectedVelocity) : null)
  const clockState = geometry ? lengthContractionStateAt(geometry, labTime) : null
  const shownSpeedLabel = result ? `${result.velocity}c` : speedLabel

  const handleStart = () => {
    if (!canStart) return
    setLabTime(0)
    setResult(runLengthContractionExperiment(selectedVelocity))
    setStatus('running')
    // Bring the clocks into view so the learner can watch the run.
    displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    // The run lasts until the slower moving clock (the same-length clock) has finished its tick.
    const runDuration = Math.max(result.sameLength.tickDuration, result.shorterLength.tickDuration)
    const animationDurationMs =
      runDuration * Math.min(PLAYBACK_MS_PER_LAB_SECOND, MAX_RUN_MS / runDuration)
    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      // A frame timestamp can fall slightly before startTime; never let lab time go negative.
      const progress = Math.min(Math.max((currentTime - startTime) / animationDurationMs, 0), 1)
      setLabTime(progress * runDuration)

      if (progress >= 1) {
        setLabTime(runDuration)
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  const movingCaption = `Moving at ${shownSpeedLabel} (seen from the lab), along its own length. Both mirrors move together. Dashed lines show where they started. The two legs of the pulse are drawn at slightly different heights only so that you can see both. The light really travels along one line.`

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Experiment 6 — Does Motion Change Length?</h1>

      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Moving clock speed
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Speeds are given as a fraction of <strong>c</strong>, the speed of light (about 300,000
            km/s). For example, 0.5c means half the speed of light. In this experiment you can
            choose speeds up to {MAX_SPEED}c.
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
                min={MIN_SPEED}
                max={MAX_SPEED}
                step="0.01"
                value={customVelocity}
                onChange={(e) => setCustomVelocity(e.target.value)}
                disabled={isRunning}
                placeholder={`Fraction of c (${MIN_SPEED}-${MAX_SPEED})`}
                style={inputStyle}
              />
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Selected speed: <strong>{speedLabel}</strong>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <LightClockPanel
                title="Rest Clock"
                caption="At rest in the lab"
                scale={pixelsPerLightSecond(geometry)}
                clockReading={clockState.restClock.clockReading}
                leg={clockState.restClock.phase < 0.5 ? 'forward' : 'return'}
                turnPosition={geometry.restLength}
                startFrontPosition={null}
                backMirrorPosition={clockState.restClock.backMirrorPosition}
                frontMirrorPosition={clockState.restClock.frontMirrorPosition}
                pulsePosition={clockState.restClock.pulsePosition}
              />
              <LightClockPanel
                title="Moving Clock, same length"
                caption={movingCaption}
                scale={pixelsPerLightSecond(geometry)}
                clockReading={clockState.sameLength.clockReading}
                leg={clockState.sameLength.leg}
                turnPosition={geometry.sameLength.forwardLegPath}
                startFrontPosition={geometry.sameLength.lengthInLab}
                backMirrorPosition={clockState.sameLength.backMirrorPosition}
                frontMirrorPosition={clockState.sameLength.frontMirrorPosition}
                pulsePosition={clockState.sameLength.pulsePosition}
              />
              <LightClockPanel
                title="Moving Clock, shorter length"
                caption={movingCaption}
                scale={pixelsPerLightSecond(geometry)}
                clockReading={clockState.shorterLength.clockReading}
                leg={clockState.shorterLength.leg}
                turnPosition={geometry.shorterLength.forwardLegPath}
                startFrontPosition={geometry.shorterLength.lengthInLab}
                backMirrorPosition={clockState.shorterLength.backMirrorPosition}
                frontMirrorPosition={clockState.shorterLength.frontMirrorPosition}
                pulsePosition={clockState.shorterLength.pulsePosition}
              />
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Choose a speed between {MIN_SPEED}c and {MAX_SPEED}c to see the clocks.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
