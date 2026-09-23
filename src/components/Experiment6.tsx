import { useEffect, useRef, useState } from 'react'
import {
  REST_LENGTH,
  lengthContractionStateAt,
  runLengthContractionExperiment,
} from '../physics/lengthContractionExperiment'
import { REST_TICK_DURATION } from '../physics/lightClockExperiment'
import { Experiment6Tutor } from './Experiment6Tutor'
import type { MirrorDistanceChoice } from './Experiment6Tutor'
import type {
  ClockVersionResult,
  LengthContractionResult,
  PulseLeg,
} from '../physics/lengthContractionExperiment'

type VelocityOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'

// This experiment allows speeds up to 0.9c: the tick of the clock whose mirrors stay as far apart as at rest grows very quickly
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
const VIEW_HEIGHT = 92
const AXIS_Y = 42
const LEFT_MARGIN = 20
const RIGHT_MARGIN = 20
const MIRROR_HALF_HEIGHT = 26
const LEG_OFFSET = 8
const MAX_PX_PER_LS = 280

const mirrorDistanceChoices: Array<{ value: MirrorDistanceChoice; label: string }> = [
  { value: 'same', label: 'As far apart as at rest' },
  { value: 'closer', label: 'Closer together' },
  { value: 'farther', label: 'Farther apart' },
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

// Same clock look as Experiments 3 to 5, smaller so that all three clocks fit on the screen at once.
const clockBoxStyle = {
  fontSize: '1.6rem',
  fontFamily: 'monospace',
  fontWeight: 'bold' as const,
  padding: '0.4rem 0.25rem',
  backgroundColor: '#d9ecff',
  borderRadius: '6px',
  textAlign: 'center' as const,
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

  const mirror = (position: number, key: string, color: string, dashed = false, opacity = 1) => (
    <line
      key={key}
      x1={x(position)}
      y1={AXIS_Y - MIRROR_HALF_HEIGHT}
      x2={x(position)}
      y2={AXIS_Y + MIRROR_HALF_HEIGHT}
      stroke={color}
      strokeWidth={dashed ? 2 : 6}
      strokeDasharray={dashed ? '4 3' : undefined}
      opacity={opacity}
    />
  )

  // Once the pulse has turned round, leave a faint mark where the front mirror was at that moment,
  // because the mirror itself has moved on. Only the moving clocks need it: the rest clock's mirror stays put.
  const showTurnMark = startFrontPosition !== null && leg !== 'forward'
  const turnLabelAnchor = x(turnPosition) > VIEW_WIDTH - 110 ? 'end' : 'middle'

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: '0 0 170px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', color: '#666', margin: '0 0 0.25rem' }}>{title}</p>
        <div style={clockBoxStyle}>{formatClockReading(clockReading)}</div>
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
          {showTurnMark && (
            <>
              {mirror(turnPosition, 'turn', '#333', false, 0.3)}
              <text
                x={x(turnPosition)}
                y={AXIS_Y - MIRROR_HALF_HEIGHT - 5}
                textAnchor={turnLabelAnchor}
                fontSize="11"
                fill="#666"
              >
                front mirror when the pulse hit it
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
    </div>
  )
}

const resultLineStyle = { margin: '0.5rem 0', fontSize: '0.875rem' }
const resultBlockStyle = { paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }

// Shows a difference in seconds with its sign; a difference below the shown precision reads 0.000.
function formatDifference(seconds: number): string {
  const text = seconds.toFixed(3)
  if (text === '0.000' || text === '-0.000') return '0.000'
  return seconds > 0 ? `+${text}` : `−${text.replace('-', '')}`
}

// Values only, as reported by the physics model; no explanation here (that comes from the tutor).
function VersionResultBlock({ title, version }: { title: string; version: ClockVersionResult }) {
  return (
    <div style={resultBlockStyle}>
      <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>{title}</p>
      <p style={resultLineStyle}>
        Distance between the mirrors, seen from the lab: {version.lengthInLab.toFixed(3)}{' '}
        light-seconds ({version.lengthRatio.toFixed(3)} of the distance at rest)
      </p>
      <p style={resultLineStyle}>
        Time for the pulse's trip forward: {version.forwardLegDuration.toFixed(3)} s
      </p>
      <p style={resultLineStyle}>
        Time for the pulse's trip back: {version.returnLegDuration.toFixed(3)} s
      </p>
      <p style={resultLineStyle}>
        Time for one tick, on the lab's clocks: {version.tickDuration.toFixed(3)} s
      </p>
      <p style={resultLineStyle}>
        Light's speed, seen from the lab (distance ÷ time): {version.lightSpeedForward.toFixed(3)}c
        going forward, {version.lightSpeedReturn.toFixed(3)}c coming back
      </p>
      <p style={resultLineStyle}>
        Difference from the tick that time dilation gives:{' '}
        {formatDifference(version.differenceFromTimeDilationTick)} s
      </p>
    </div>
  )
}

interface Experiment6Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment6({ onComplete, onTutorComplete }: Experiment6Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [predictionChoice, setPredictionChoice] = useState<MirrorDistanceChoice | null>(null)
  const [predictionInput, setPredictionInput] = useState('')
  const [submittedChoice, setSubmittedChoice] = useState<MirrorDistanceChoice | null>(null)
  const [submittedPrediction, setSubmittedPrediction] = useState<number | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<LengthContractionResult | null>(null)
  const [labTime, setLabTime] = useState(0)
  const displayRef = useRef<HTMLDivElement>(null)

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) || 0 : velocity
  const isRunning = status === 'running'
  const isValid = selectedVelocity >= MIN_SPEED && selectedVelocity <= MAX_SPEED
  const speedLabel = isValid ? `${selectedVelocity}c` : '—'
  const statusLabel = isRunning ? 'Running...' : status === 'complete' ? 'Finished' : 'At rest'
  const predictionValue = predictionInput.trim() ? Number(predictionInput) : null
  const hasPrediction = predictionValue !== null && isFinite(predictionValue)
  const canStart = isValid && predictionChoice !== null && hasPrediction && !isRunning
  // What time dilation says for the selected speed (Experiments 3 and 4), shown in the prediction text.
  const timeDilationTick = isValid ? runLengthContractionExperiment(selectedVelocity).timeDilationTick : null

  // Before a run, preview the drawing for the selected speed. After a run, keep that run's own geometry.
  const geometry = result ?? (isValid ? runLengthContractionExperiment(selectedVelocity) : null)
  const clockState = geometry ? lengthContractionStateAt(geometry, labTime) : null
  const shownSpeedLabel = result ? `${result.velocity}c` : speedLabel

  const handleStart = () => {
    if (!canStart) return
    setSubmittedChoice(predictionChoice)
    setSubmittedPrediction(predictionValue)
    setPredictionChoice(null)
    setPredictionInput('')
    setLabTime(0)
    setResult(runLengthContractionExperiment(selectedVelocity))
    setStatus('running')
    // Bring the clocks into view so the learner can watch the run.
    displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    // The run lasts until the slower moving clock (mirrors as far apart as at rest) has finished its tick.
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

  const clocksCaption = `The rest clock stands still in the lab. The moving clocks move at ${shownSpeedLabel} (seen from the lab), along their own length. Both mirrors of a moving clock move together, and dashed lines show where they started. Once the pulse has hit the front mirror, a faint mark shows where the mirror was at that moment. The two legs of a pulse are drawn at slightly different heights only so that you can see both. The light really travels along one line.`

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 6 — Does Motion Change Length?</h2>

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
            <strong>The question.</strong> In Experiment 4, the two mirrors of our light clock were
            one above the other, across the direction the clock moved. What happens if we turn the
            clock so that its mirrors are in a line with the direction it moves?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A quick reminder: the light clock.</strong> A light clock is a pulse of light
            that bounces between two mirrors. One trip from the back mirror to the front mirror and
            back is one <strong>tick</strong>. A <strong>light-second</strong> is the distance light
            travels in one second, about 300,000 km. Our mirrors are half a light-second apart (about{' '}
            {(REST_LENGTH * 300000).toLocaleString('en-US')} km), so one tick of a clock standing
            still takes exactly {REST_TICK_DURATION} second. Real clocks are much smaller. We use a
            giant clock so that the numbers are easy to read.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What is different when it moves.</strong> Now imagine the same clock moving
            along its own length, front mirror first. Both mirrors move together at the same speed.
            Seen from the lab, the front mirror runs away from the pulse, so the pulse has to chase
            it. On the way back, the back mirror runs toward the pulse, so they meet sooner. The
            trip forward is long, and the trip back is short.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The rule we keep.</strong> In Experiments 3 and 4 you saw that a moving clock
            ticks more slowly, as measured by the lab's clocks. That effect is called{' '}
            <strong>time dilation</strong>. We assume that it works for every moving clock, however
            it is turned. So one tick of the moving clock must take the time that time dilation
            gives. We also keep the rule from Experiments 4 and 5: in the lab, light always goes at
            the same speed, <strong>c</strong>, in both directions.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What you will see.</strong> Three clocks start at the same moment. One stands
            still in the lab. The other two are the same moving clock, drawn twice. The only
            difference is the distance between the mirrors, as the lab observers measure it. In one
            drawing, the mirrors are as far apart as they are at rest. In the other, they are closer
            together. Because the mirrors move together, that distance does not change during a
            run. We watch one tick of each moving clock.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Before you press START, make a prediction in two parts.
            First, choose whether the mirrors of the moving clock must be as far apart as at rest,
            closer together, or farther apart, as seen from the lab, for its tick to take the time
            that time dilation gives. Then say how far apart they must be, in light-seconds. A wrong
            guess is fine. Guesses are not scored.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a steady speed. It never speeds up or slows down.</li>
            <li>All the clocks start together: their pulses of light leave the back mirror at the same moment.</li>
            <li>
              We watch everything from the lab. The lab is a <strong>reference frame</strong>, as
              in Experiment 2: a group of people and clocks that are all standing still relative to
              one another, with their clocks set to agree. <strong>Lab time</strong> is the time
              shown on those clocks, and the tick is measured in <strong>lab seconds</strong>.
            </li>
            <li>
              The moving clock is not standing still relative to the lab, so it is not part of the
              lab's reference frame. It has its own reference frame: the point of view of someone
              riding along with it. So two reference frames are involved: the lab's and the moving
              clock's.
            </li>
            <li>
              Someone riding along with the moving clock sees the pulse leave at speed c, travel to
              the front mirror and back, and one tick takes 1 second on the clock's own display.
            </li>
          </ul>
        </div>

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

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            The clock standing still has its mirrors {REST_LENGTH} light-seconds apart, and one tick
            takes {REST_TICK_DURATION} second. Another identical clock moves along its own length at{' '}
            {speedLabel}. Time dilation says that one tick of the moving clock takes{' '}
            <strong>{timeDilationTick !== null ? timeDilationTick.toFixed(3) : '—'} seconds</strong>{' '}
            on the lab's clocks. Light always goes at c in the lab.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            <strong>Part 1.</strong> For its tick to take that long, the two mirrors of the moving
            clock, as seen from the lab, must be:
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {mirrorDistanceChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPredictionChoice(choice.value)}
                disabled={isRunning}
                style={optionButtonStyle(predictionChoice === choice.value, isRunning)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            <strong>Part 2.</strong> How far apart, in light-seconds, must they be? Type a number.
          </p>
          <input
            type="number"
            step="any"
            value={predictionInput}
            onChange={(e) => setPredictionInput(e.target.value)}
            disabled={isRunning}
            placeholder="Enter light-seconds"
            style={{
              ...inputStyle,
              opacity: isRunning ? 0.6 : 1,
              cursor: isRunning ? 'not-allowed' : 'text',
            }}
          />
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {predictionChoice !== null && hasPrediction
              ? `Your prediction: ${mirrorDistanceChoices.find((c) => c.value === predictionChoice)?.label.toLowerCase()}, ${predictionValue} light-seconds`
              : submittedPrediction !== null && submittedChoice !== null
                ? `Your prediction: ${mirrorDistanceChoices.find((c) => c.value === submittedChoice)?.label.toLowerCase()}, ${submittedPrediction} light-seconds`
                : 'Choose an option and enter a number to continue'}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <LightClockPanel
                title="Rest Clock"
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
                title="Moving clock: mirrors as far apart as at rest"
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
                title="Moving clock: mirrors closer together"
                scale={pixelsPerLightSecond(geometry)}
                clockReading={clockState.shorterLength.clockReading}
                leg={clockState.shorterLength.leg}
                turnPosition={geometry.shorterLength.forwardLegPath}
                startFrontPosition={geometry.shorterLength.lengthInLab}
                backMirrorPosition={clockState.shorterLength.backMirrorPosition}
                frontMirrorPosition={clockState.shorterLength.frontMirrorPosition}
                pulsePosition={clockState.shorterLength.pulsePosition}
              />
              <p style={{ fontSize: '0.8125rem', color: '#555', margin: '0.25rem 0 0' }}>
                {clocksCaption}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Choose a speed between {MIN_SPEED}c and {MAX_SPEED}c to see the clocks.
            </p>
          )}
        </div>

        {status === 'complete' && result && submittedPrediction !== null && submittedChoice !== null && (
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
              <strong>Moving clock speed:</strong> {result.velocity}c
            </p>
            <p style={{ ...resultLineStyle, color: '#555' }}>
              c is the speed of light. A light speed of 1.000c means exactly the speed of light. A
              light-second is the distance light travels in one second.
            </p>
            <p style={resultLineStyle}>
              <strong>The tick that time dilation gives (Experiments 3 and 4):</strong>{' '}
              {result.timeDilationTick.toFixed(3)} s
            </p>

            <div style={resultBlockStyle}>
              <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>Rest clock</p>
              <p style={resultLineStyle}>
                Distance between the mirrors: {result.restLength.toFixed(3)} light-seconds
              </p>
              <p style={resultLineStyle}>
                Time for one tick, on the lab's clocks: {result.restTickDuration.toFixed(3)} s
              </p>
              <p style={resultLineStyle}>Light's speed, seen from the lab: 1.000c</p>
            </div>

            <VersionResultBlock title="Moving clock: mirrors as far apart as at rest" version={result.sameLength} />
            <VersionResultBlock title="Moving clock: mirrors closer together" version={result.shorterLength} />

            <div style={resultBlockStyle}>
              <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>Your prediction</p>
              <p style={resultLineStyle}>
                You guessed that the two mirrors must be{' '}
                {mirrorDistanceChoices.find((c) => c.value === submittedChoice)?.label.toLowerCase()}
                , {submittedPrediction} light-seconds apart, seen from the lab.
              </p>
              <p style={resultLineStyle}>
                Distance between the mirrors, clock with the mirrors as far apart as at rest:{' '}
                {result.sameLength.lengthInLab.toFixed(3)} light-seconds
              </p>
              <p style={resultLineStyle}>
                Distance between the mirrors, clock with the mirrors closer together:{' '}
                {result.shorterLength.lengthInLab.toFixed(3)} light-seconds
              </p>
            </div>
          </div>
        )}

        {status === 'complete' && result && submittedPrediction !== null && submittedChoice !== null && (
          <Experiment6Tutor
            onExplained={onTutorComplete}
            velocity={result.velocity}
            predictionChoice={submittedChoice}
            prediction={submittedPrediction}
            restLength={result.restLength}
            timeDilationTick={result.timeDilationTick}
            timeDilationFactor={result.timeDilationFactor}
            sameLength={result.sameLength}
            shorterLength={result.shorterLength}
          />
        )}
      </div>
    </div>
  )
}
