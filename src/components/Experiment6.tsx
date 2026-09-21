import { useEffect, useRef, useState } from 'react'
import {
  REST_LENGTH,
  lengthContractionStateAt,
  runLengthContractionExperiment,
} from '../physics/lengthContractionExperiment'
import { REST_TICK_DURATION } from '../physics/lightClockExperiment'
import type {
  ClockVersionResult,
  LengthContractionResult,
  PulseLeg,
} from '../physics/lengthContractionExperiment'

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
        Length seen from the lab: {version.lengthInLab.toFixed(3)} light-seconds (
        {version.lengthRatio.toFixed(3)} of the length at rest)
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

// onTutorComplete is wired up in a later step, when the tutor exists.
export function Experiment6({ onComplete }: Experiment6Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [predictionInput, setPredictionInput] = useState('')
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
  const canStart = isValid && hasPrediction && !isRunning
  // What time dilation says for the selected speed (Experiments 3 and 4), shown in the prediction text.
  const timeDilationTick = isValid ? runLengthContractionExperiment(selectedVelocity).timeDilationTick : null

  // Before a run, preview the drawing for the selected speed. After a run, keep that run's own geometry.
  const geometry = result ?? (isValid ? runLengthContractionExperiment(selectedVelocity) : null)
  const clockState = geometry ? lengthContractionStateAt(geometry, labTime) : null
  const shownSpeedLabel = result ? `${result.velocity}c` : speedLabel

  const handleStart = () => {
    if (!canStart) return
    setSubmittedPrediction(predictionValue)
    setPredictionInput('')
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
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: '#555' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 4, the two mirrors of our light clock were
            one above the other, across the direction the clock moved. What if we turn the clock
            so that its mirrors are in a line with the direction it moves?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A quick reminder: the light clock.</strong> A light clock is a clock made from
            a pulse of light that bounces between two mirrors. One trip from the back mirror to the
            front mirror and back is one <strong>tick</strong>, just like one tick of an ordinary
            clock.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How far apart are the mirrors?</strong> Light travels about 300,000 km in one
            second. We place the mirrors about{' '}
            {(REST_LENGTH * 300000).toLocaleString('en-US')} km apart, which is half of that
            distance. So light needs half a second to get from one mirror to the other, and one
            second for the whole trip there and back. That means one tick takes exactly{' '}
            {REST_TICK_DURATION} second when the clock is standing still. Real clocks are much
            smaller. We use a giant clock so that the numbers are easy to read. The distance light
            travels in one second has a name: a <strong>light-second</strong>. So the mirrors are
            half a light-second apart.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The moving clock.</strong> Now imagine the same clock moving along its own
            length, with its front mirror first. Seen from the lab, the pulse leaves the back mirror
            and travels toward the front mirror. But the front mirror is moving away, so the pulse
            has to chase it. On the way back, the back mirror is moving toward the pulse, so they
            meet sooner. In the lab, the pulse's trip forward is long, and its trip back is short.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What is the length of a moving clock?</strong> The length of the moving clock,
            seen from the lab, is the distance between its two mirrors as the lab observers measure
            it. Both mirrors move together at the same speed, so this distance stays the same all
            the way through a run. Someone riding along with the moving clock measures the same
            length as for the clock standing still: half a light-second. But what do the lab
            observers measure? That is what this experiment explores.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The rule we assume.</strong> In Experiments 3 and 4 you saw that a moving clock
            ticks more slowly, as measured by the lab's clocks. That effect is called{' '}
            <strong>time dilation</strong>. We assume that it works for every moving clock, however
            the clock is built and whichever way it is turned. We also keep the rule from
            Experiments 4 and 5: in the lab, light always goes at the same speed, <strong>c</strong>,
            in both directions. So the moving clock's tick must take the time that time dilation
            gives.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What you will see.</strong> Three clocks start at the same moment. One stands
            still in the lab. The other two are the same moving clock, drawn twice: once where its
            length seen from the lab is the same as at rest, and once where its length is shorter.
            We watch one tick of each moving clock and draw the path the pulse takes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Before you press START, make a prediction. How far apart, in
            light-seconds, must the two mirrors of the moving clock be, as seen from the lab, for its
            tick to take the time that time dilation gives? The tick is measured in{' '}
            <strong>lab seconds</strong>: seconds counted by the clocks standing still in the lab.
            A wrong guess is fine. Guesses are not scored.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a steady speed. It never speeds up or slows down.</li>
            <li>The moving clock moves along the line that joins its mirrors, with the front mirror first.</li>
            <li>All the clocks start together: their pulses of light leave the back mirror at the same moment.</li>
            <li>
              We watch everything from the lab. The lab is a <strong>reference frame</strong>, as
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
              The light source and both mirrors are parts of the moving clock. Seen from the lab,
              they all move together, at the same speed.
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
            on the lab's clocks. Light always goes at c in the lab. How far apart, in light-seconds,
            must the two mirrors of the moving clock be, as seen from the lab, for its tick to take
            that long? Type a number.
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
            {hasPrediction
              ? `Your prediction: ${predictionValue} light-seconds`
              : submittedPrediction !== null
                ? `Your prediction: ${submittedPrediction} light-seconds`
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
                Length (distance between the mirrors): {result.restLength.toFixed(3)} light-seconds
              </p>
              <p style={resultLineStyle}>
                Time for one tick, on the lab's clocks: {result.restTickDuration.toFixed(3)} s
              </p>
              <p style={resultLineStyle}>Light's speed, seen from the lab: 1.000c</p>
            </div>

            <VersionResultBlock title="Moving clock, same length" version={result.sameLength} />
            <VersionResultBlock title="Moving clock, shorter length" version={result.shorterLength} />

            <div style={resultBlockStyle}>
              <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>Your prediction</p>
              <p style={resultLineStyle}>
                You guessed that the two mirrors must be {submittedPrediction} light-seconds apart,
                seen from the lab.
              </p>
              <p style={resultLineStyle}>
                Length of the same-length clock: {result.sameLength.lengthInLab.toFixed(3)}{' '}
                light-seconds
              </p>
              <p style={resultLineStyle}>
                Length of the shorter-length clock: {result.shorterLength.lengthInLab.toFixed(3)}{' '}
                light-seconds
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
