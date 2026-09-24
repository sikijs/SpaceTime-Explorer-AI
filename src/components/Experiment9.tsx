import { useEffect, useMemo, useState } from 'react'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import { spacetimeDiagramFor, sameMomentLineFor } from '../physics/spacetimeDiagramView'
import type { WorldlinePoint } from '../physics/spacetimeDiagramView'
import { Experiment9Tutor } from './Experiment9Tutor'

type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'
export type ShapeChoice = 'flat' | 'tilted'

const MIN_CUSTOM_SPEED = 0.01
const MAX_SPEED = 0.9

// Same scale rule as Experiment 8: one pixel-per-unit for both axes, so slopes are never distorted.
const BASE_PX_PER_UNIT = 140
const MAX_DRAWN_SIZE = 520
const MARGIN = 64

// Same playback pacing as Experiment 8 — presentation only, not part of the physics (§11).
const ANIMATION_DURATION_MS = 2500

function pointAt(a: WorldlinePoint, b: WorldlinePoint, t: number): WorldlinePoint {
  if (t <= a.time) return a
  if (t >= b.time) return b
  const fraction = (t - a.time) / (b.time - a.time)
  return {
    position: a.position + fraction * (b.position - a.position),
    time: a.time + fraction * (b.time - a.time),
  }
}

const shapeChoices: Array<{ value: ShapeChoice; label: string }> = [
  { value: 'flat', label: 'Flat, level across the page' },
  { value: 'tilted', label: 'Tilted' },
]

// The same-moment line is flat only when both events share a lab time, i.e. only at v = 0
// (Experiment 7, Required Physics Test 2, reused here without recomputation).
export function actualShapeFor(result: SimultaneityResult): ShapeChoice {
  return result.velocity === 0 ? 'flat' : 'tilted'
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

interface DiagramProps {
  diagram: ReturnType<typeof spacetimeDiagramFor>
  animTime: number
  showSameMomentLine: boolean
}

// Draws what the physics view layer reports; no physics is calculated here.
function SpacetimeDiagram({ diagram, animTime, showSameMomentLine }: DiagramProps) {
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

  // The same-moment line (Experiment 9) drawn through the two already-known events, extended to
  // the diagram's horizontal edges — a rendering choice only, using the two endpoints exactly as
  // sameMomentLineFor returns them, no new physics.
  const [start, end] = sameMomentLineFor(diagram)
  const timeOverPositionSlope = (end.time - start.time) / (end.position - start.position)
  const extendedLeft: WorldlinePoint = {
    position: -maxAbsPosition,
    time: start.time + timeOverPositionSlope * (-maxAbsPosition - start.position),
  }
  const extendedRight: WorldlinePoint = {
    position: maxAbsPosition,
    time: start.time + timeOverPositionSlope * (maxAbsPosition - start.position),
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Spacetime diagram: position left to right, time bottom to top, showing the rod's worldlines, the flash of light, and the same-moment line"
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

      {showSameMomentLine && line(extendedLeft, extendedRight, '#8e24aa', false, 'same-moment')}
    </svg>
  )
}

interface Experiment9Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment9({ onComplete, onTutorComplete }: Experiment9Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [predictionShape, setPredictionShape] = useState<ShapeChoice | null>(null)
  const [submittedShape, setSubmittedShape] = useState<ShapeChoice | null>(null)
  const [result, setResult] = useState<SimultaneityResult | null>(null)
  const [replayCount, setReplayCount] = useState(0)
  const [animTime, setAnimTime] = useState(0)

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) : velocity
  const isValid =
    velocity === 'other'
      ? selectedVelocity >= MIN_CUSTOM_SPEED && selectedVelocity <= MAX_SPEED
      : true
  const canStart = isValid && predictionShape !== null

  const handleStart = () => {
    if (!canStart) return
    setSubmittedShape(predictionShape)
    setPredictionShape(null)
    setResult(runSimultaneityExperiment(selectedVelocity))
    onComplete?.()
  }

  const diagram = useMemo(() => (result ? spacetimeDiagramFor(result) : null), [result])
  const totalRunTime = diagram ? diagram.backWorldline[1].time : 0
  const lineRevealed = animTime >= totalRunTime

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
      <h2>Experiment 9 — Same Time, Different Line</h2>

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
            <strong>The question.</strong> Imagine two friends riding together in a car — one
            sitting in the front seat, one in the back. Something happens at the front of the car.
            A little later (or maybe at the very same time — that's the question), something else
            happens at the back. The two friends, riding together, can compare notes and agree on
            whether those two things happened at the same moment.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            Now imagine someone standing still on the sidewalk, watching the car drive past. Would
            that person necessarily agree with the two friends about which things happened "at the
            same moment"? It seems like they should — after all, it's the same two events. But it
            turns out the answer is no, and you've already seen why.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            Here's why that can happen. You saw it, back in Experiment 7, with the rod: a flash of
            light was released from the rod's exact center. In the rod's own frame, the flash has
            equally far to travel in each direction, so it reaches both ends at the same moment.
            But the rod is moving — so, as seen from the lab, the back end moves toward the point
            where the flash started, while the front end moves away from it. That means the flash
            reaches the back end first, according to the lab's own clocks. Whenever two events
            happen in different places, and something has to travel between them to connect them,
            motion can shift how those events line up in time — differently, depending on who's
            watching.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            Someone riding along with the moving rod says the flash reached both ends at exactly
            the same moment — just like the two friends in the car, comparing notes. Someone
            standing still in the lab, watching the rod go by, does not agree. This chapter asks:
            can we actually see that disagreement on the diagram, instead of just being told about
            it in numbers?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A line for "the same moment."</strong> Look at the diagram again — the one you
            built in the last chapter. Any flat, level line drawn straight across it, the kind
            that doesn't lean up or down at all, connects points that all happen at the same
            moment, according to the lab. That's what "the same moment" means on this page, for
            someone standing still and watching, like the person on the sidewalk.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>But the rod is moving, like the car.</strong> The rod isn't standing still —
            it's moving, just like the car with the two friends inside. Someone riding along with
            the rod has their own sense of "the same moment," the same way the two friends in the
            car do. The question this chapter asks is simple: on this same page, what does their
            "same moment" line actually look like?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What you're about to do.</strong> We're going to draw one new line — a single
            straight line through the two dots you already saw. Before we do, make a prediction:
            will that line be flat, like the lab's "same moment" line? Or will it lean over?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: '0.25rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything here is still seen from the lab's side, exactly like the last chapter —
              we are only adding one new line to a picture you've already seen, nothing else
              changes.
            </li>
            <li>There is no gravity, and the rod keeps a steady speed.</li>
            <li>Light always travels at c in the lab, in both directions (Experiment 5).</li>
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
            You already know, from the last chapter, that someone riding along with the rod would
            say both flashes arrived at exactly the same moment. If we draw a single straight line
            through those two dots, what do you expect: will that line come out flat, level across
            the page — or will it come out tilted?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {shapeChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPredictionShape(choice.value)}
                style={optionButtonStyle(predictionShape === choice.value, false)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {predictionShape !== null
              ? `Your prediction: ${shapeChoices.find((c) => c.value === predictionShape)?.label.toLowerCase()}.`
              : submittedShape !== null
                ? `Your prediction: ${shapeChoices.find((c) => c.value === submittedShape)?.label.toLowerCase()}.`
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
              <SpacetimeDiagram diagram={diagram} animTime={animTime} showSameMomentLine={lineRevealed} />
              <p style={{ fontSize: '0.8125rem', color: '#555', margin: '0.25rem 0 0' }}>
                The black lines are the rod's back and front ends; the gold dashed lines are the
                flash of light. The purple line, once it appears, is the new one: it passes
                through the same two dots you already saw, and shows what counts as "the same
                moment" for someone riding along with the rod.
              </p>
              {lineRevealed && (
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

        {result && submittedShape !== null && lineRevealed && (
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
              <strong>Rod speed:</strong> {result.velocity}c
            </p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
              <strong>Rod's length, seen from the lab (Experiment 6):</strong>{' '}
              {result.labLength.toFixed(3)} light-seconds (rest length {result.restLength.toFixed(3)})
            </p>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                In the lab's frame
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Back end reached: {result.backEventLabTime.toFixed(3)} s
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Front end reached: {result.frontEventLabTime.toFixed(3)} s
              </p>
            </div>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                Your prediction
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                You guessed the line would be {submittedShape}. It is actually{' '}
                {actualShapeFor(result)}.
              </p>
            </div>
          </div>
        )}

        {result && submittedShape !== null && lineRevealed && (
          <Experiment9Tutor
            result={result}
            predictionShape={submittedShape}
            onExplained={onTutorComplete}
          />
        )}
      </div>
    </div>
  )
}
