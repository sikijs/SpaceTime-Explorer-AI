import { useEffect, useRef, useState } from 'react'
import {
  invariantLightSpeedStateAt,
  runInvariantLightSpeedExperiment,
} from '../physics/invariantLightSpeedExperiment'
import type { InvariantLightSpeedResult, RuleResult } from '../physics/invariantLightSpeedExperiment'
import { MIRROR_SEPARATION, REST_TICK_DURATION } from '../physics/lightClockExperiment'
import { Experiment5Tutor } from './Experiment5Tutor'

type VelocityOption = 0.1 | 0.3 | 0.5 | 0.8 | 'other'
type ExperimentStatus = 'idle' | 'running' | 'complete'
type RuleChoice = 'everyday' | 'actual' | 'same'

interface Prediction {
  choice: RuleChoice
  everydayTick: number
  actualTick: number
}

function describeChoice(choice: RuleChoice): string {
  if (choice === 'same') return 'both rules give the same tick'
  if (choice === 'everyday') return 'the everyday rule gives the longer tick'
  return "light's actual rule gives the longer tick"
}

function describePrediction(p: Prediction): string {
  return `Your prediction: ${describeChoice(p.choice)}. Everyday rule: ${p.everydayTick} s. Light's actual rule: ${p.actualTick} s.`
}

const RULE_CHOICE_LABELS: Record<RuleChoice, string> = {
  everyday: 'Everyday rule',
  actual: "Light's actual rule",
  same: 'Both the same',
}

// Playback only: real milliseconds shown per lab second. Never affects the physical result.
const PLAYBACK_MS_PER_LAB_SECOND = 2000

// Drawing constants (SVG units). Distances from the model are in light-seconds.
const VIEW_SIZE = 200
const MIRROR_WIDTH_LS = 0.4
const MAX_PX_PER_LS = 280
const DRAW_MARGIN = 15
// When the moving clock travels far in one tick (high speeds), the drawing would become tiny in a
// square box. Above this distance the panels are stacked and drawn in a wider box instead.
const WIDE_THRESHOLD_LS = 2.5
const WIDE_VIEW_WIDTH = 720

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

// Same clock look as Experiments 3 and 4.
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

function widestSideways(geometry: InvariantLightSpeedResult): number {
  return Math.max(
    geometry.sidewaysDistancePerTick.everydayRule,
    geometry.sidewaysDistancePerTick.actualRule
  )
}

function isWideRun(geometry: InvariantLightSpeedResult): boolean {
  return widestSideways(geometry) > WIDE_THRESHOLD_LS
}

function viewWidthFor(geometry: InvariantLightSpeedResult): number {
  return isWideRun(geometry) ? WIDE_VIEW_WIDTH : VIEW_SIZE
}

// All three panels share one scale so the light paths can be compared by eye.
function pixelsPerLightSecond(geometry: InvariantLightSpeedResult): number {
  return Math.min(
    MAX_PX_PER_LS,
    (viewWidthFor(geometry) - 2 * DRAW_MARGIN) / (widestSideways(geometry) + MIRROR_WIDTH_LS)
  )
}

interface LightClockPanelProps {
  title: string
  caption: string
  mirrorSeparation: number
  scale: number
  viewWidth: number
  wide: boolean
  sidewaysPerTick: number // 0 for the rest clock
  clockReading: number
  pulseHeight: number
  phase: number
  sidewaysOffset: number
}

// Draws what the physics model reports at the current lab time; no physics is calculated here.
function LightClockPanel({
  title,
  caption,
  mirrorSeparation: L,
  scale,
  viewWidth,
  wide,
  sidewaysPerTick: sideways,
  clockReading,
  pulseHeight,
  phase,
  sidewaysOffset,
}: LightClockPanelProps) {
  const moving = sideways > 0
  const bottomY = VIEW_SIZE / 2 + (L * scale) / 2
  const topY = VIEW_SIZE / 2 - (L * scale) / 2
  const drawWidth = (sideways + MIRROR_WIDTH_LS) * scale
  const startX = (viewWidth - drawWidth) / 2 + (MIRROR_WIDTH_LS / 2) * scale
  const currentX = startX + sidewaysOffset * scale
  const halfMirror = (MIRROR_WIDTH_LS / 2) * scale
  const pulseY = bottomY - pulseHeight * scale

  const trace: Array<[number, number]> = [[startX, bottomY]]
  if (phase > 0.5) trace.push([startX + (sideways / 2) * scale, topY])
  trace.push([currentX, pulseY])

  return (
    <div style={{ textAlign: 'center', flex: wide ? 'none' : '1 1 200px', minWidth: 0 }}>
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem', minHeight: '2.5em' }}>
        {title}
      </p>
      <div style={clockBoxStyle}>{formatClockReading(clockReading)}</div>
      <div style={{ backgroundColor: '#d9ecff', borderRadius: '6px', padding: '0.5rem' }}>
        <svg
          viewBox={`0 0 ${viewWidth} ${VIEW_SIZE}`}
          role="img"
          aria-label={`${title}: light pulse travelling between two mirrors`}
          style={{ width: '100%', maxWidth: wide ? '100%' : '220px', height: 'auto' }}
        >
          {moving && sideways * scale > 4 && (
            <>
              <line x1={startX - halfMirror} y1={topY} x2={startX + halfMirror} y2={topY} stroke="#999" strokeWidth="2" strokeDasharray="4 3" />
              <line x1={startX - halfMirror} y1={bottomY} x2={startX + halfMirror} y2={bottomY} stroke="#999" strokeWidth="2" strokeDasharray="4 3" />
              <text x={startX} y={topY - 10} textAnchor="middle" fontSize="11" fill="#666">
                start
              </text>
              <text x={startX} y={bottomY + 18} textAnchor="middle" fontSize="11" fill="#666">
                start
              </text>
            </>
          )}
          <polyline points={trace.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke="#e6a700" strokeWidth="2" />
          <line x1={currentX - halfMirror} y1={topY} x2={currentX + halfMirror} y2={topY} stroke="#333" strokeWidth="6" />
          <line x1={currentX - halfMirror} y1={bottomY} x2={currentX + halfMirror} y2={bottomY} stroke="#333" strokeWidth="6" />
          <circle cx={currentX} cy={pulseY} r="6" fill="#e6a700" />
        </svg>
      </div>
      <p style={{ fontSize: '0.8125rem', color: '#555', marginTop: '0.5rem' }}>{caption}</p>
    </div>
  )
}

const resultLineStyle = { margin: '0.5rem 0', fontSize: '0.875rem' }
const resultBlockStyle = { paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }

// Values only, as reported by the physics model; no explanation here (that comes from the tutor).
function RuleResultBlock({ title, rule }: { title: string; rule: RuleResult }) {
  return (
    <div style={resultBlockStyle}>
      <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>{title}</p>
      <p style={resultLineStyle}>Distance the light travels in one tick: {rule.lightPath.toFixed(3)} light-seconds</p>
      <p style={resultLineStyle}>Time for one tick, on the lab's clocks: {rule.movingTickDuration.toFixed(3)} s</p>
      <p style={resultLineStyle}>
        Light's speed, seen from the lab (distance ÷ time): {rule.lightSpeedInLab.toFixed(3)}c
      </p>
      <p style={resultLineStyle}>
        Time dilation factor (rest tick ÷ moving tick; 1 means no slowing): {rule.timeDilationFactor.toFixed(3)}
      </p>
    </div>
  )
}

interface Experiment5Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment5({ onComplete, onTutorComplete }: Experiment5Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [choice, setChoice] = useState<RuleChoice | null>(null)
  const [everydayInput, setEverydayInput] = useState('')
  const [actualInput, setActualInput] = useState('')
  const [submittedPrediction, setSubmittedPrediction] = useState<Prediction | null>(null)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [result, setResult] = useState<InvariantLightSpeedResult | null>(null)
  const [labTime, setLabTime] = useState(0)
  const displayRef = useRef<HTMLDivElement>(null)

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) || 0 : velocity
  const isRunning = status === 'running'
  const isValid = selectedVelocity >= 0.01 && selectedVelocity <= 0.99
  const speedLabel = isValid ? `${selectedVelocity}c` : '—'
  const statusLabel = isRunning ? 'Running...' : status === 'complete' ? 'Finished' : 'At rest'
  const everydayValue = everydayInput.trim() ? Number(everydayInput) : null
  const actualValue = actualInput.trim() ? Number(actualInput) : null
  const prediction: Prediction | null =
    choice !== null &&
    everydayValue !== null &&
    isFinite(everydayValue) &&
    actualValue !== null &&
    isFinite(actualValue)
      ? { choice, everydayTick: everydayValue, actualTick: actualValue }
      : null
  const canStart = isValid && prediction !== null && !isRunning

  // Before a run, preview the drawing for the selected speed. After a run, keep that run's own geometry.
  const geometry = result ?? (isValid ? runInvariantLightSpeedExperiment(selectedVelocity) : null)
  const clockState = geometry ? invariantLightSpeedStateAt(geometry, labTime) : null
  const shownSpeedLabel = result ? `${result.velocity}c` : speedLabel

  const handleStart = () => {
    if (!canStart || prediction === null) return
    setSubmittedPrediction(prediction)
    setChoice(null)
    setEverydayInput('')
    setActualInput('')
    setLabTime(0)
    setResult(runInvariantLightSpeedExperiment(selectedVelocity))
    setStatus('running')
    // Bring the clocks fully into view so the learner can watch the run.
    displayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  useEffect(() => {
    if (status !== 'running' || !result) return

    // The run lasts until the slower moving clock (light's actual rule) has finished its tick.
    const runDuration = result.actualRule.movingTickDuration
    const animationDurationMs = runDuration * PLAYBACK_MS_PER_LAB_SECOND
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

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — Why Can't Light Go Faster?</h2>

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
            <strong>The question.</strong> In Experiment 4 we explained time dilation using one big
            assumption about how light behaves. What would change if light behaved differently?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A quick reminder: the light clock.</strong> A light clock is a clock made from a
            flash of light that bounces up and down between two mirrors. One trip up and back down
            is one <strong>tick</strong>, just like one tick of an ordinary clock.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How far apart are the mirrors?</strong> Light travels about 300,000 km in one
            second. We place the mirrors about {(MIRROR_SEPARATION * 300000).toLocaleString('en-US')} km apart,
            which is half of that distance. So light needs half a second to get from one mirror to
            the other, and one second for the whole trip up and back. That means one tick takes
            exactly {REST_TICK_DURATION} second when the clock is standing still. Real clocks are
            much smaller. We use a giant clock so that the numbers are easy to read. The distance
            light travels in one second has a name: a <strong>light-second</strong>. So the mirrors
            are half a light-second apart.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>The idea we want to test.</strong> Inside every light clock there is a small
            lamp, called the <strong>light source</strong>, that sends out the flash of light. In
            the moving clock, the lamp moves sideways along with the whole clock. Picture a car
            driving past you at night with its headlights on. The moving clock is like the car, and
            its lamp is like the headlights. So here is the question: does the car's movement
            change how fast the light from its headlights travels? In the same way, does the lamp's
            movement change how fast its light travels? We will compare two possible answers, which
            we call rules:
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The everyday rule: speeds add.</strong> Imagine you are on a moving train and
              you throw a ball forward. Someone standing on the ground sees the ball go faster than
              it would from a train that is standing still, because the train's speed is added to
              the ball's speed. The everyday rule says light works the same way: when the lamp
              moves, its light gets the lamp's speed added to it. This is only a "what if". It is
              what everyday life would lead us to guess, not a claim about how light really works.
            </li>
            <li>
              <strong>Light's actual rule: light always goes at c.</strong> Seen from the lab,
              light always travels at the same speed, called <strong>c</strong>, which is about
              300,000 km every second. It does not matter how fast the lamp that sent out the light
              is moving. This is the rule we use for light in this course (it is Einstein's postulate,
              as in Experiment 4).
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What you will see.</strong> Three clocks start at the same moment. One clock
            stands still in the lab. The other two are the same moving clock, shown twice: once
            where light follows the everyday rule, and once where light follows its actual rule. We
            watch one tick of each moving clock and draw the path the light takes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Before you press START, make a prediction. Which rule makes
            the moving clock's tick take longer? And how many seconds will one tick take under each
            rule? These seconds are <strong>lab seconds</strong>: seconds counted by the clocks
            standing still in the lab. A wrong guess is fine. Guesses are not scored.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>There is no gravity, and the moving clock keeps a steady speed. It never speeds up or slows down.</li>
            <li>The moving clock moves sideways, across the light's up-and-down path, not along it.</li>
            <li>All the clocks start together: their flashes of light leave the bottom mirror at the same moment.</li>
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
              they all move together, sideways, at the same speed. The mirrors stay the same distance
              apart.
            </li>
            <li>
              Someone riding along with the moving clock sees the light leave at speed c and go
              straight up, just like in the clock that stands still. This is true under both rules.
              The two rules differ only in what the lab sees.
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
            Selected speed: <strong>{speedLabel}</strong>
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            The clock standing still ticks once every {REST_TICK_DURATION} second. The other clock
            moves sideways at {speedLabel}. Someone in the lab watches the light in each clock,
            timing it with the lab's clocks. <strong>Step 1:</strong> which rule makes the moving
            clock's tick take longer, or do both rules give the same tick?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {(Object.keys(RULE_CHOICE_LABELS) as RuleChoice[]).map((option) => (
              <button
                key={option}
                onClick={() => setChoice(option)}
                disabled={isRunning}
                style={optionButtonStyle(choice === option, isRunning)}
              >
                {RULE_CHOICE_LABELS[option]}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            <strong>Step 2:</strong> how many lab seconds will one tick of the moving clock take under each rule? Type a number for each.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <label style={{ fontSize: '0.875rem' }}>
              Everyday rule
              <br />
              <input
                type="number"
                step="any"
                value={everydayInput}
                onChange={(e) => setEverydayInput(e.target.value)}
                disabled={isRunning}
                placeholder="Enter seconds"
                style={{ ...inputStyle, marginTop: '0.25rem' }}
              />
            </label>
            <label style={{ fontSize: '0.875rem' }}>
              Light's actual rule
              <br />
              <input
                type="number"
                step="any"
                value={actualInput}
                onChange={(e) => setActualInput(e.target.value)}
                disabled={isRunning}
                placeholder="Enter seconds"
                style={{ ...inputStyle, marginTop: '0.25rem' }}
              />
            </label>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {prediction
              ? describePrediction(prediction)
              : submittedPrediction !== null
                ? describePrediction(submittedPrediction)
                : 'Choose a rule and enter both tick durations to continue'}
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
            <div
              style={{
                display: 'flex',
                flexDirection: isWideRun(geometry) ? 'column' : 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                gap: '1rem',
              }}
            >
              <LightClockPanel
                title="Rest Clock"
                caption="At rest in the lab"
                mirrorSeparation={geometry.mirrorSeparation}
                scale={pixelsPerLightSecond(geometry)}
                viewWidth={viewWidthFor(geometry)}
                wide={isWideRun(geometry)}
                sidewaysPerTick={0}
                {...clockState.restClock}
                sidewaysOffset={0}
              />
              <LightClockPanel
                title="Moving Clock, everyday rule"
                caption={`Moving at ${shownSpeedLabel} (seen from the lab). Both mirrors move together. Dashed lines show where they started.`}
                mirrorSeparation={geometry.mirrorSeparation}
                scale={pixelsPerLightSecond(geometry)}
                viewWidth={viewWidthFor(geometry)}
                wide={isWideRun(geometry)}
                sidewaysPerTick={geometry.sidewaysDistancePerTick.everydayRule}
                {...clockState.everydayRule}
              />
              <LightClockPanel
                title="Moving Clock, light's actual rule"
                caption={`Moving at ${shownSpeedLabel} (seen from the lab). Both mirrors move together. Dashed lines show where they started.`}
                mirrorSeparation={geometry.mirrorSeparation}
                scale={pixelsPerLightSecond(geometry)}
                viewWidth={viewWidthFor(geometry)}
                wide={isWideRun(geometry)}
                sidewaysPerTick={geometry.sidewaysDistancePerTick.actualRule}
                {...clockState.actualRule}
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

            <p style={resultLineStyle}>
              <strong>Moving clock speed:</strong> {result.velocity}c
            </p>
            <p style={{ ...resultLineStyle, color: '#555' }}>
              c is the speed of light. A light speed of 1.000c means exactly the speed of light. A light-second is the distance light travels in one second.
            </p>

            <div style={resultBlockStyle}>
              <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>Rest clock</p>
              <p style={resultLineStyle}>
                Distance the light travels in one tick: {result.restLightPath.toFixed(3)} light-seconds
              </p>
              <p style={resultLineStyle}>
                Time for one tick, on the lab's clocks: {result.restTickDuration.toFixed(3)} s
              </p>
              <p style={resultLineStyle}>
                Light's speed, seen from the lab (distance ÷ time): {result.lightSpeedRest.toFixed(3)}c
              </p>
            </div>

            <RuleResultBlock title="Moving clock, everyday rule" rule={result.everydayRule} />
            <RuleResultBlock title="Moving clock, light's actual rule" rule={result.actualRule} />

            <div style={resultBlockStyle}>
              <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>Your prediction</p>
              <p style={resultLineStyle}>You guessed that {describeChoice(submittedPrediction.choice)}.</p>
              <p style={resultLineStyle}>
                Everyday rule: you guessed {submittedPrediction.everydayTick} s; the real time was{' '}
                {result.everydayRule.movingTickDuration.toFixed(3)} s
              </p>
              <p style={resultLineStyle}>
                Light's actual rule: you guessed {submittedPrediction.actualTick} s; the real time was{' '}
                {result.actualRule.movingTickDuration.toFixed(3)} s
              </p>
            </div>
          </div>
        )}

        {status === 'complete' && result && submittedPrediction !== null && (
          <Experiment5Tutor
            onExplained={onTutorComplete}
            velocity={result.velocity}
            prediction={submittedPrediction}
            restTickDuration={result.restTickDuration}
            everydayTick={result.everydayRule.movingTickDuration}
            everydayLightSpeed={result.everydayRule.lightSpeedInLab}
            everydayLightPath={result.everydayRule.lightPath}
            everydaySidewaysDistancePerTick={result.sidewaysDistancePerTick.everydayRule}
            mirrorSeparation={result.mirrorSeparation}
            actualTick={result.actualRule.movingTickDuration}
            actualTimeDilationFactor={result.actualRule.timeDilationFactor}
          />
        )}
      </div>
    </div>
  )
}
