import { useMemo, useState } from 'react'
import { runSimultaneityExperiment } from '../physics/relativityOfSimultaneityExperiment'
import type { SimultaneityResult } from '../physics/relativityOfSimultaneityExperiment'
import {
  spacetimeDiagramFor,
  sameMomentLineFor,
  rodTimeAxisFor,
  rodSpaceAxisFor,
} from '../physics/spacetimeDiagramView'
import type { WorldlinePoint } from '../physics/spacetimeDiagramView'
import { lorentzTransform } from '../physics/lorentzTransform'
import { Experiment11Tutor } from './Experiment11Tutor'

type VelocityOption = 0 | 0.1 | 0.3 | 0.5 | 0.8 | 'other'
export type TimeChoice = 'same' | 'different'

const MIN_CUSTOM_SPEED = 0.01
const MAX_SPEED = 0.9

const timeChoices: Array<{ value: TimeChoice; label: string }> = [
  { value: 'same', label: 'Same time' },
  { value: 'different', label: 'Different times' },
]

// The two events are always simultaneous in the rod's frame (Experiment 7's own
// rodFrameEventTime, reused here without recomputation), for any velocity.
export function actualTimeOutcome(): TimeChoice {
  return 'same'
}

// Same scale rule as Experiments 8/9: one pixel-per-unit for both axes, so slopes are never distorted.
const BASE_PX_PER_UNIT = 140
const MAX_DRAWN_SIZE = 520
const MARGIN = 64

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
}

// Draws what the physics/view layer reports; no physics is calculated here. Static (no
// animation), matching this experiment's "Run" behavior.
function SpacetimeDiagram({ diagram }: DiagramProps) {
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

  // Extend a line (given as two known points) to the diagram's horizontal edges — a rendering
  // choice only, no new physics. Used for Experiment 9's same-moment line and this experiment's
  // rod-space-axis, both of which are anchored inside the diagram rather than at its edges.
  const extendToEdges = (a: WorldlinePoint, b: WorldlinePoint): [WorldlinePoint, WorldlinePoint] => {
    const slope = (b.time - a.time) / (b.position - a.position)
    return [
      { position: -maxAbsPosition, time: a.time + slope * (-maxAbsPosition - a.position) },
      { position: maxAbsPosition, time: a.time + slope * (maxAbsPosition - a.position) },
    ]
  }

  const [sameMomentStart, sameMomentEnd] = extendToEdges(...sameMomentLineFor(diagram))
  const [rodSpaceStart, rodSpaceEnd] = extendToEdges(...rodSpaceAxisFor(diagram))
  const [rodTimeStart, rodTimeEnd] = rodTimeAxisFor(diagram)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Spacetime diagram: position left to right, time bottom to top, showing the rod's worldlines, the flash of light, Experiment 9's same-moment line, and the rod's own time and space axes"
      style={{ width: '100%', maxWidth: `${width}px`, height: 'auto' }}
    >
      <line x1={MARGIN} y1={height - MARGIN} x2={width - MARGIN} y2={height - MARGIN} stroke="#999" strokeWidth={1} />
      <line x1={xPix(0)} y1={MARGIN} x2={xPix(0)} y2={height - MARGIN} stroke="#ccc" strokeWidth={1} strokeDasharray="2 3" />
      <circle cx={xPix(0)} cy={yPix(0)} r="4" fill="#e6a700" />

      {line(diagram.backWorldline[0], diagram.backWorldline[1], '#333', false, 'back')}
      {line(diagram.frontWorldline[0], diagram.frontWorldline[1], '#333', false, 'front')}
      {line(diagram.leftLightWorldline[0], diagram.leftLightWorldline[1], '#e6a700', true, 'left-light')}
      {line(diagram.rightLightWorldline[0], diagram.rightLightWorldline[1], '#e6a700', true, 'right-light')}

      {eventDot(diagram.backEvent, 'back-event', 'left')}
      {eventDot(diagram.frontEvent, 'front-event', 'right')}

      {line(sameMomentStart, sameMomentEnd, '#8e24aa', false, 'same-moment')}
      {line(rodSpaceStart, rodSpaceEnd, '#e65100', true, 'rod-space-axis')}
      {line(rodTimeStart, rodTimeEnd, '#e65100', false, 'rod-time-axis')}
    </svg>
  )
}

interface Experiment11Props {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function Experiment11({ onComplete, onTutorComplete }: Experiment11Props) {
  const [velocity, setVelocity] = useState<VelocityOption>(0.5)
  const [customVelocity, setCustomVelocity] = useState('')
  const [predictionOutcome, setPredictionOutcome] = useState<TimeChoice | null>(null)
  const [submittedOutcome, setSubmittedOutcome] = useState<TimeChoice | null>(null)
  const [result, setResult] = useState<SimultaneityResult | null>(null)

  const selectedVelocity = velocity === 'other' ? parseFloat(customVelocity) : velocity
  const isValid =
    velocity === 'other'
      ? selectedVelocity >= MIN_CUSTOM_SPEED && selectedVelocity <= MAX_SPEED
      : true
  const canCalculate = isValid && predictionOutcome !== null

  const handleReveal = () => {
    if (!canCalculate) return
    setSubmittedOutcome(predictionOutcome)
    setPredictionOutcome(null)
    setResult(runSimultaneityExperiment(selectedVelocity))
    onComplete?.()
  }

  const diagram = useMemo(() => (result ? spacetimeDiagramFor(result) : null), [result])
  const transformedBackEvent = diagram && result ? lorentzTransform(diagram.backEvent, result.velocity) : null
  const transformedFrontEvent = diagram && result ? lorentzTransform(diagram.frontEvent, result.velocity) : null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 11 — The Rod's Own Axes</h2>

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
            <strong>The question.</strong> Experiment 9 showed you a tilted line — the rod's own
            idea of "the same moment" — but that line, by itself, doesn't tell you the actual
            numbers. Is there a real mathematical rule for converting the lab's numbers into the
            rod's own numbers, for any event?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>There is: it's called the Lorentz transformation.</strong> It's a rule that
            takes an event's position and time, as measured in the lab, and calculates the
            position and time that someone moving along with the rod would measure for that exact
            same event. It doesn't change what happened — it just translates the description from
            one point of view into the other, the way converting kilometers to miles doesn't
            change a distance, only how it's written down.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What you're about to do.</strong> We're going to draw two new lines on the
            diagram — the rod's own time direction and its own "now" direction, both tilted — and
            then use the Lorentz transformation to calculate the rod's own numbers for the two
            events from Experiment 7. Before we do, make a prediction: using this real
            calculation, will the two events come out at the same time in the rod's frame, or
            different times?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What we assume.</strong> Everything here is still the same rod-and-flash
            scenario from Experiments 6 through 9 — nothing about the setup changes. We're only
            adding two new lines to the picture and calculating two new numbers.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Rod speed
          </label>
          <p style={{ fontSize: '0.875rem', color: '#555', marginBottom: '0.75rem' }}>
            Speeds are given as a fraction of <strong>c</strong>, the speed of light.
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
            Experiment 7 told you the flash reaches the back end and the front end at different
            times, according to the lab. If we calculate the actual time each event happens{' '}
            <em>in the rod's own frame</em>, using the real math for converting between frames,
            what do you expect: will the two events come out at the same time, or at different
            times?
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {timeChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPredictionOutcome(choice.value)}
                style={optionButtonStyle(predictionOutcome === choice.value, false)}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            {predictionOutcome !== null
              ? `Your prediction: ${timeChoices.find((c) => c.value === predictionOutcome)?.label.toLowerCase()}.`
              : submittedOutcome !== null
                ? `Your prediction: ${timeChoices.find((c) => c.value === submittedOutcome)?.label.toLowerCase()}.`
                : 'Choose an option to continue'}
          </p>
        </div>

        <button
          onClick={handleReveal}
          disabled={!canCalculate}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: canCalculate ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canCalculate ? 'pointer' : 'not-allowed',
            opacity: canCalculate ? 1 : 0.7,
          }}
        >
          CALCULATE
        </button>

        {diagram && result && (
          <div style={{ marginTop: '2rem' }}>
            <SpacetimeDiagram diagram={diagram} />
            <p style={{ fontSize: '0.8125rem', color: '#555', margin: '0.25rem 0 0' }}>
              Black lines: the rod's back and front ends. Gold dashed lines: the flash of light.
              Purple line: Experiment 9's same-moment line, through the two events. Orange lines
              (one dashed, one solid): the rod's own space axis and time axis, through the origin.
            </p>
          </div>
        )}

        {result && transformedBackEvent && transformedFrontEvent && (
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

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                In the lab's frame
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Back event: position {diagram!.backEvent.position.toFixed(3)} ls, time{' '}
                {diagram!.backEvent.time.toFixed(3)} s
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Front event: position {diagram!.frontEvent.position.toFixed(3)} ls, time{' '}
                {diagram!.frontEvent.time.toFixed(3)} s
              </p>
            </div>

            <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                In the rod's own frame (Lorentz transformation)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Back event: position {transformedBackEvent.position.toFixed(3)} ls, time{' '}
                {transformedBackEvent.time.toFixed(3)} s
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                Front event: position {transformedFrontEvent.position.toFixed(3)} ls, time{' '}
                {transformedFrontEvent.time.toFixed(3)} s
              </p>
            </div>

            {submittedOutcome !== null && (
              <div style={{ paddingTop: '1rem', marginTop: '1rem', borderTop: '1px solid #ddd' }}>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  Your prediction
                </p>
                <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                  You guessed:{' '}
                  {timeChoices.find((c) => c.value === submittedOutcome)?.label.toLowerCase()}. It
                  is actually:{' '}
                  {timeChoices.find((c) => c.value === actualTimeOutcome())?.label.toLowerCase()}.
                </p>
              </div>
            )}
          </div>
        )}

        {submittedOutcome !== null && transformedBackEvent && transformedFrontEvent && (
          <Experiment11Tutor
            transformedBackEvent={transformedBackEvent}
            transformedFrontEvent={transformedFrontEvent}
            predictionOutcome={submittedOutcome}
            onExplained={onTutorComplete}
          />
        )}
      </div>
    </div>
  )
}
