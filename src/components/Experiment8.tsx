import { useEffect, useMemo, useState } from 'react'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { spacetimeDiagramFor } from '../physics/spacetimeDiagramView'
import type { WorldlinePoint } from '../physics/spacetimeDiagramView'
import { Experiment8Tutor } from './Experiment8Tutor'

type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'
export type OrderChoice = 'same' | 'back' | 'front'

const MIN_CUSTOM_SPEED = 0.01
const MAX_SPEED = 0.9

// The diagram uses one pixel-per-unit scale for both axes (light-seconds and seconds), so that
// light's worldline is always drawn at the same slope, at every rod speed. Only the drawn size
// shrinks for a larger diagram; the two axes are never scaled differently from each other.
const BASE_PX_PER_UNIT = 140
const MAX_DRAWN_SIZE = 520
const MARGIN = 64

// Playback pacing only, chosen for readability — it does not affect the physics (§11: simulation
// time is separate from wall-clock playback speed). Every worldline is played over the same
// wall-clock duration, however far it reaches in lab time, so faster rods do not animate faster.
const ANIMATION_DURATION_MS = 2500

// The worldlines from spacetimeDiagramView are already straight lines between two known points
// (position linear in time, per that module's own comment); this only reads a point partway along
// an existing line for the reveal animation, it does not compute any new physical quantity.
function pointAt(a: WorldlinePoint, b: WorldlinePoint, t: number): WorldlinePoint {
  if (t <= a.time) return a
  if (t >= b.time) return b
  const fraction = (t - a.time) / (b.time - a.time)
  return {
    position: a.position + fraction * (b.position - a.position),
    time: a.time + fraction * (b.time - a.time),
  }
}

const orderChoices: Array<{ value: OrderChoice; label: string }> = [
  { value: 'back', label: "The back end's worldline" },
  { value: 'front', label: "The front end's worldline" },
  { value: 'same', label: 'Both at the same time' },
]

export const orderWording: Record<OrderChoice, string> = {
  same: 'both at the same time',
  back: "the back end's worldline first",
  front: "the front end's worldline first",
}

// The back event is never later than the front event; they coincide only at v = 0 (Experiment 7,
// Required Physics Test 2, reused here without recomputation).
export function actualOrderFor(result: SimultaneityResult): OrderChoice {
  return result.velocity === 0 ? 'same' : 'back'
}

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

interface DiagramProps {
  diagram: ReturnType<typeof spacetimeDiagramFor>
  animTime: number
}

// Draws what the physics view layer reports; no physics is calculated here. The axes and scale
// are sized from the full diagram, so they stay fixed while animTime reveals the lines gradually.
function SpacetimeDiagram({ diagram, animTime }: DiagramProps) {
  const allPoints: WorldlinePoint[] = [
    ...diagram.backWorldline,
    ...diagram.frontWorldline,
    ...diagram.leftLightWorldline,
    ...diagram.rightLightWorldline,
  ]
  const maxAbsPosition = Math.max(...allPoints.map((p) => Math.abs(p.position)), 0.01)
  const maxTime = Math.max(...allPoints.map((p) => p.time), 0.01)

  const pxPerUnit = Math.min(
    BASE_PX_PER_UNIT,
    (MAX_DRAWN_SIZE - 2 * MARGIN) / (2 * maxAbsPosition),
    (MAX_DRAWN_SIZE - 2 * MARGIN) / maxTime
  )
  const width = 2 * maxAbsPosition * pxPerUnit + 2 * MARGIN
  const height = maxTime * pxPerUnit + 2 * MARGIN

  const xPix = (position: number) => MARGIN + maxAbsPosition * pxPerUnit + position * pxPerUnit
  const yPix = (time: number) => height - MARGIN - time * pxPerUnit

  const line = (a: WorldlinePoint, b: WorldlinePoint, color: string, dashed: boolean, key: string) => (
    <line
      key={key}
      x1={xPix(a.position)}
      y1={yPix(a.time)}
      x2={xPix(b.position)}
      y2={yPix(b.time)}
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray={dashed ? '5 4' : undefined}
    />
  )

  const eventDot = (point: WorldlinePoint, key: string, labelSide: 'left' | 'right') => (
    <g key={key}>
      <circle cx={xPix(point.position)} cy={yPix(point.time)} r="5" fill="#2e7d32" />
      <text
        x={xPix(point.position) + (labelSide === 'left' ? -8 : 8)}
        y={yPix(point.time) + 4}
        fontSize="13"
        fill="#2e7d32"
        textAnchor={labelSide === 'left' ? 'end' : 'start'}
      >
        {point.time.toFixed(3)} s
      </text>
    </g>
  )

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Spacetime diagram: position left to right, time bottom to top, showing the rod's worldlines and the flash of light"
      style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}
    >
      <line x1={MARGIN} y1={height - MARGIN} x2={width - MARGIN} y2={height - MARGIN} stroke="#999" strokeWidth={1} />
      <line x1={xPix(0)} y1={MARGIN} x2={xPix(0)} y2={height - MARGIN} stroke="#ccc" strokeWidth={1} strokeDasharray="2 3" />
      <circle cx={xPix(0)} cy={yPix(0)} r="4" fill="#e6a700" />

      {line(diagram.backWorldline[0], pointAt(diagram.backWorldline[0], diagram.backWorldline[1], animTime), '#333', false, 'back')}
      {line(diagram.frontWorldline[0], pointAt(diagram.frontWorldline[0], diagram.frontWorldline[1], animTime), '#333', false, 'front')}
      {line(diagram.leftLightWorldline[0], pointAt(diagram.leftLightWorldline[0], diagram.leftLightWorldline[1], animTime), '#e6a700', true, 'left-light')}
      {line(diagram.rightLightWorldline[0], pointAt(diagram.rightLightWorldline[0], diagram.rightLightWorldline[1], animTime), '#e6a700', true, 'right-light')}

      {animTime >= diagram.backEvent.time && eventDot(diagram.backEvent, 'back-event', 'left')}
      {animTime >= diagram.frontEvent.time && eventDot(diagram.frontEvent, 'front-event', 'right')}
    </svg>
  )
}

interface Experiment8Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment8({ onComplete, onTutorComplete }: Experiment8Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [predictionOrder, setPredictionOrder] = useState<OrderChoice | null>(null)
  const [submittedOrder, setSubmittedOrder] = useState<OrderChoice | null>(null)
  const [result, setResult] = useState<SimultaneityResult | null>(null)
  const [replayCount, setReplayCount] = useState(0)
  const [animTime, setAnimTime] = useState(0)

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) : velocity
  const isValid =
    velocity === 'other'
      ? selectedVelocity >= MIN_CUSTOM_SPEED && selectedVelocity <= MAX_SPEED
      : true
  const canStart = isValid && predictionOrder !== null

  const handleStart = () => {
    if (!canStart) return
    setSubmittedOrder(predictionOrder)
    setPredictionOrder(null)
    setResult(runSimultaneityExperiment(selectedVelocity))
    onComplete?.()
  }

  const diagram = useMemo(() => (result ? spacetimeDiagramFor(result) : null), [result])
  const totalRunTime = diagram ? diagram.backWorldline[1].time : 0

  useEffect(() => {
    if (!diagram) return
    if (totalRunTime <= 0) {
      setAnimTime(totalRunTime)
      return
    }
    let start: number | null = null
    let frameId: number
    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / ANIMATION_DURATION_MS, 1)
      setAnimTime(progress * totalRunTime)
      if (progress < 1) frameId = requestAnimationFrame(step)
    }
    setAnimTime(0)
    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [diagram, totalRunTime, replayCount])

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 8 — Drawing Spacetime</h2>

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
            <strong>The question.</strong> In Experiment 7, you saw two separate numbers: the time
            the flash reached the back end of the moving rod, and the time it reached the front
            end. They were different. Is there a single picture that shows why, instead of two
            numbers computed separately?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A graph you already know.</strong> Picture an ordinary graph of a car's
            position over time. Position runs left to right (the horizontal axis); time runs
            bottom to top (the vertical axis) — so later moments are higher up the page, and
            further-along positions are further to the right. A parked car draws
            a straight vertical line: its position never changes, only time passes. A car cruising
            at a steady speed draws a straight line that leans over instead — the faster it goes,
            the more it leans. Nothing new so far; this is a graph you've likely seen in a math
            class.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The same graph, new name.</strong> A spacetime diagram is exactly this kind of
            graph, just applied to physics: position left to right, time bottom to top. A single
            moment at a single
            place — "here, right now" — is one point on it, called an <strong>event</strong> (the
            same word Experiment 1 used for a moment in time; now it also has a place). A line that
            traces where something was at every moment is called its <strong>worldline</strong>. A
            parked car's worldline is vertical; a cruising car's worldline leans over. That's all a
            worldline is.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>One rod, two worldlines.</strong> This experiment uses the same rigid rod as
            Experiment 7: it doesn't stretch or bend, and both of its ends move together at one
            steady speed. But the rod still has two ends — a <strong>front end</strong> and a
            {' '}<strong>back end</strong> — and they're never at the same position. Each end gets
            traced separately, so the diagram shows two leaning lines, not one. They lean by the
            same amount and stay the rod's own length apart, the whole time — just two "cruising
            cars," side by side, at a fixed distance from each other. (The lean is about motion
            through time, not the rod bending in space — freeze the diagram at any one moment and
            the rod is still perfectly straight.)
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Light's worldline.</strong> Light always travels at c, the same speed, in the
            lab (Experiment 5). So a flash of light always leans over by the same fixed amount, no
            matter how fast the rod is moving — only the rod's lines get steeper or shallower as
            its speed changes. In this experiment, the flash is released from the rod's exact
            center and spreads both ways at once, so it draws two worldlines from that single
            starting point — one leaning toward the back end, one toward the front — meeting only
            there. (It's two separate rays, not one ray reversing direction, so don't read it as
            dipping down and coming back up.)
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What is being done.</strong> Experiment 7 calculated the two times when the
            flash reached each end. Here we draw the whole situation as one picture instead, so
            you can see those same two events as the points where the rod's worldlines cross the
            light's worldlines.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Before you press START, look ahead to what the diagram will
            show and predict: which worldline will the light reach first — the rod's back end, its
            front end, or will it reach both at exactly the same time? Guesses are not scored.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: '0.25rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything here is drawn from the lab's point of view. The rod's own point of view
              is not drawn as a separate set of axes in this experiment.
            </li>
            <li>There is no gravity, and the rod keeps a steady speed.</li>
            <li>Light always travels at c in the lab, in both directions (Experiment 5).</li>
            <li>
              The rod's length, seen from the lab, is shorter than its rest length, by the amount
              Experiment 6 found.
            </li>
            <li>The flash is released from the exact center of the rod, just as in Experiment 7.</li>
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
            <button onClick={() => setVelocity(0)} style={optionButtonStyle(velocity === 0, false)}>
              0c (at rest)
            </button>
            {[0.1, 0.3, 0.5, 0.8].map((preset) => (
              <button
                key={preset}
                onClick={() => setVelocity(preset as VelocityOption)}
                style={optionButtonStyle(velocity === preset, false)}
              >
                {preset}c
              </button>
            ))}
            <button onClick={() => setVelocity('other')} style={optionButtonStyle(velocity === 'other', false)}>
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
                placeholder={`Fraction of c (${MIN_CUSTOM_SPEED}-${MAX_SPEED})`}
                style={inputStyle}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Make a prediction
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Here is a spacetime diagram: position runs left to right, time runs bottom to top. A line that leans
            over means something moving. A flash of light is released from the middle of the rod
            and travels outward in both directions. On the diagram, which worldline will the light
            cross first?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {orderChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPredictionOrder(choice.value)}
                style={optionButtonStyle(predictionOrder === choice.value, false)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {predictionOrder !== null
              ? `Your prediction: ${orderChoices.find((c) => c.value === predictionOrder)?.label.toLowerCase()}.`
              : submittedOrder !== null
                ? `Your prediction: ${orderChoices.find((c) => c.value === submittedOrder)?.label.toLowerCase()}.`
                : 'Choose an option to continue'}
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={!canStart}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: canStart ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canStart ? 'pointer' : 'not-allowed',
            opacity: canStart ? 1 : 0.7,
          }}
        >
          START
        </button>

        <div style={{ marginTop: '2rem' }}>
          {diagram && result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <SpacetimeDiagram diagram={diagram} animTime={animTime} />
              <p style={{ fontSize: '0.8125rem', color: '#555', margin: '0.25rem 0 0' }}>
                The dot where the two dashed lines meet marks where the flash was released. The
                solid lines are the rod's back and front ends, leaning over together because the
                rod is moving — the two lines stay parallel and the same distance apart, since
                both ends move at the rod's one steady speed. The dashed lines are the flash of
                light, growing upward as time passes — one toward each end, forming a "V" from
                that shared starting point, not one line reversing direction. A dot appears where
                the light meets each end.
              </p>
              {animTime >= totalRunTime && (
                <button
                  onClick={() => setReplayCount((n) => n + 1)}
                  style={{ ...optionButtonStyle(false, false), alignSelf: 'flex-start' }}
                >
                  Replay
                </button>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#999' }}>
              Make a prediction and press START to see the diagram.
            </p>
          )}
        </div>

        {result && submittedOrder !== null && (
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
              <p style={{ ...resultLineStyle, fontWeight: 'bold' }}>Your prediction</p>
              <p style={resultLineStyle}>
                You guessed the light would cross {orderWording[submittedOrder]}.
              </p>
              <p style={resultLineStyle}>
                Actual result, in the lab's frame: {orderWording[actualOrderFor(result)]}.
              </p>
            </div>
          </div>
        )}

        {result && submittedOrder !== null && (
          <Experiment8Tutor
            result={result}
            predictionOrder={submittedOrder}
            onExplained={onTutorComplete}
          />
        )}
      </div>
    </div>
  )
}
