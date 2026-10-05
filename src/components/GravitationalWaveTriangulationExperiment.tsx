import { useEffect, useRef, useState } from 'react'
import {
  arrivalOrderFor,
  DETECTORS,
  DIRECTION_PRESETS,
  type DetectorArrival,
} from '../physics/gravitationalWaveTriangulationExperiment'
import { GravitationalWaveTriangulationTutor } from './GravitationalWaveTriangulationTutor'

interface GravitationalWaveTriangulationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_SIZE = 320
const PADDING = 50

// Maps the schematic km coordinates in the physics model onto the SVG view box. This scaling is
// a display concern only (CLAUDE.md §9) - it never changes any arrival-time value, only where a
// detector is drawn.
const minX = Math.min(...DETECTORS.map((d) => d.x))
const maxX = Math.max(...DETECTORS.map((d) => d.x))
const minY = Math.min(...DETECTORS.map((d) => d.y))
const maxY = Math.max(...DETECTORS.map((d) => d.y))
const spanX = maxX - minX || 1
const spanY = maxY - minY || 1
const scale = (VIEW_SIZE - PADDING * 2) / Math.max(spanX, spanY)

function toSvgPoint(detectorX: number, detectorY: number) {
  return {
    x: PADDING + (detectorX - minX) * scale,
    y: VIEW_SIZE - PADDING - (detectorY - minY) * scale, // flip y so larger km-y is drawn higher
  }
}

// Purely a visual exaggeration (CLAUDE.md §11): the real arrival-time gaps are only a few
// milliseconds, far too fast to watch. This stretches the slowest run out to this many real
// on-screen milliseconds, without changing any of the arrival-time values themselves - those are
// read directly from the physics model, in real seconds, in the readout below. Slowed down from
// an earlier 2400ms after the owner found the flashes too quick to follow.
const VISUAL_DURATION_MS = 5000

// How long the two illustrative arcs take to sweep into view once a run completes, so the learner
// can watch them develop rather than have them pop in instantly.
const ARC_REVEAL_DURATION_MS = 1800

type Status = 'idle' | 'running' | 'complete'

// This experiment's two prediction questions, per its specification's "Prediction Activity".
type FirstDetectorChoice = 'Hanford' | 'Livingston' | 'Virgo'
const firstDetectorChoices: FirstDetectorChoice[] = ['Hanford', 'Livingston', 'Virgo']

type TimingChoice = 'same' | 'different'
const timingChoices: Array<{ value: TimingChoice; label: string }> = [
  { value: 'same', label: 'Essentially the same instant' },
  { value: 'different', label: 'Measurably different times' },
]

export function GravitationalWaveTriangulationExperiment({
  onComplete,
  onTutorComplete,
}: GravitationalWaveTriangulationExperimentProps) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [flashedDetectorNames, setFlashedDetectorNames] = useState<string[]>([])
  const [runCount, setRunCount] = useState(0)
  const [arcRevealProgress, setArcRevealProgress] = useState(0)
  const frameIdRef = useRef<number | undefined>(undefined)
  const arcFrameIdRef = useRef<number | undefined>(undefined)

  const [firstDetectorPrediction, setFirstDetectorPrediction] = useState<FirstDetectorChoice | null>(null)
  const [timingPrediction, setTimingPrediction] = useState<TimingChoice | null>(null)
  const [submittedFirstDetectorPrediction, setSubmittedFirstDetectorPrediction] =
    useState<FirstDetectorChoice | null>(null)
  const [submittedTimingPrediction, setSubmittedTimingPrediction] = useState<TimingChoice | null>(null)

  const hasPrediction = firstDetectorPrediction !== null && timingPrediction !== null
  const hasSubmittedPrediction = submittedFirstDetectorPrediction !== null && submittedTimingPrediction !== null

  const preset = DIRECTION_PRESETS[selectedPresetIndex]
  const order: DetectorArrival[] = arrivalOrderFor(preset.directionDegrees)
  const earliestTime = order[0].arrivalTimeSeconds
  const latestTime = order[order.length - 1].arrivalTimeSeconds
  const spreadSeconds = latestTime - earliestTime || 1

  const handleSelectPreset = (index: number) => {
    if (!hasPrediction) return
    setSelectedPresetIndex(index)
    setStatus('idle')
    setFlashedDetectorNames([])
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedFirstDetectorPrediction(firstDetectorPrediction)
      setSubmittedTimingPrediction(timingPrediction)
    }
    setFlashedDetectorNames([])
    setStatus('running')
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's own precedent: re-opens both questions for editing without
  // resetting the chosen direction.
  const handleChangePrediction = () => {
    setSubmittedFirstDetectorPrediction(null)
    setSubmittedTimingPrediction(null)
    setStatus('idle')
    setFlashedDetectorNames([])
  }

  useEffect(() => {
    if (status !== 'running') return

    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsedMs = currentTime - startTime
      const elapsedFraction = Math.min(elapsedMs / VISUAL_DURATION_MS, 1)

      const nowReached = order
        .filter((arrival) => (arrival.arrivalTimeSeconds - earliestTime) / spreadSeconds <= elapsedFraction)
        .map((arrival) => arrival.detector.name)
      setFlashedDetectorNames(nowReached)

      if (elapsedFraction >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameIdRef.current = requestAnimationFrame(animate)
    }

    frameIdRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, selectedPresetIndex])

  // Sweeps the two illustrative arcs into view over ARC_REVEAL_DURATION_MS once a run completes,
  // instead of having them appear instantly - purely a presentational animation (CLAUDE.md §11),
  // reset to 0 on every new run via the runCount dependency.
  useEffect(() => {
    if (status !== 'complete') {
      setArcRevealProgress(0)
      return
    }

    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / ARC_REVEAL_DURATION_MS, 1)
      setArcRevealProgress(progress)
      if (progress < 1) {
        arcFrameIdRef.current = requestAnimationFrame(animate)
      }
    }

    arcFrameIdRef.current = requestAnimationFrame(animate)

    return () => {
      if (arcFrameIdRef.current !== undefined) cancelAnimationFrame(arcFrameIdRef.current)
    }
  }, [status, runCount])

  // An arrow, drawn from just outside the detector triangle, pointing in the direction the wave
  // travels FROM - purely illustrative (CLAUDE.md §9), matching the physics model's own
  // directionDegrees convention.
  const centerSvg = toSvgPoint((minX + maxX) / 2, (minY + maxY) / 2)
  const arrowRadians = (preset.directionDegrees * Math.PI) / 180
  const arrowLength = 70
  const arrowTip = {
    x: centerSvg.x + Math.cos(arrowRadians) * arrowLength,
    y: centerSvg.y - Math.sin(arrowRadians) * arrowLength,
  }

  // A fixed point on the schematic, at the given angle (degrees) and radius (pixels) from the
  // array's center - used only to draw the two illustrative "sky-narrowing" arcs below.
  function pointAt(angleDegrees: number, radiusPixels: number) {
    const radians = (angleDegrees * Math.PI) / 180
    return {
      x: centerSvg.x + Math.cos(radians) * radiusPixels,
      y: centerSvg.y - Math.sin(radians) * radiusPixels,
    }
  }

  // Keeps a label point safely inside the view box (with margin for its own text width) instead
  // of running off the edge at certain direction angles.
  function clampToViewBox(point: { x: number; y: number }) {
    return {
      x: Math.min(Math.max(point.x, 45), VIEW_SIZE - 45),
      y: Math.min(Math.max(point.y, 15), VIEW_SIZE - 15),
    }
  }

  // Two arcs, sketching the directions "consistent with" two of the three detectors' pairwise
  // timing gaps - centered near the chosen direction but offset from it and from each other, so
  // together they visibly narrow toward it without being a real computed intersection. This is
  // explicitly illustrative only (CLAUDE.md §9; this experiment's specification, "Simplifying
  // assumptions"), not derived from the actual timing geometry. Only two are shown, not all three
  // possible pairs, to keep the picture simple - a real localization effort would use all three.
  // Each arc sweeps from its start angle toward its full end angle as arcRevealProgress goes from
  // 0 to 1, so the learner can watch it develop rather than have it appear all at once.
  const arcOneStartAngle = preset.directionDegrees - 50
  const arcOneFullEndAngle = preset.directionDegrees + 20
  const arcOneCurrentEndAngle = arcOneStartAngle + (arcOneFullEndAngle - arcOneStartAngle) * arcRevealProgress
  const arcOneStart = pointAt(arcOneStartAngle, 130)
  const arcOneEnd = pointAt(arcOneCurrentEndAngle, 130)
  // Labels sit at a smaller, fixed radius than the wedges themselves, so they stay inside the view
  // box regardless of angle instead of running off the edge.
  const arcOneLabelPoint = pointAt((arcOneStartAngle + arcOneFullEndAngle) / 2, 90)

  const arcTwoStartAngle = preset.directionDegrees - 20
  const arcTwoFullEndAngle = preset.directionDegrees + 50
  const arcTwoCurrentEndAngle = arcTwoStartAngle + (arcTwoFullEndAngle - arcTwoStartAngle) * arcRevealProgress
  const arcTwoStart = pointAt(arcTwoStartAngle, 155)
  const arcTwoEnd = pointAt(arcTwoCurrentEndAngle, 155)
  const arcTwoLabelPoint = pointAt((arcTwoStartAngle + arcTwoFullEndAngle) / 2, 108)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 6 — Triangulation</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> A single detector can tell you that a gravitational wave
            arrived. Can it tell you which direction it came from?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The everyday version of this idea.</strong> Imagine three friends standing far
            apart from each other in a field. Someone far away shouts. The friend closest to the
            shout hears it first. The other two hear it a little later — and exactly how much
            later depends on how much farther away they each are from the direction the shout came
            from. Just from the order your friends heard it, and how many moments apart, you could
            work out roughly which direction the shout came from — without ever looking that way
            yourself. That is the entire idea this experiment is about. Nothing more exotic than
            that.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens here.</strong> Three real detectors - Hanford, Livingston, and
            Virgo - play the role of the three friends. They sit far apart on Earth (Hanford and
            Livingston, for example, are about 3,000 km apart). A gravitational wave travels at a
            fixed, finite speed - the same speed as light, about 300,000 km every second - so it
            cannot reach every detector at the same instant unless it happens to arrive from one
            very special direction. It reaches whichever detector is closest to where it came from
            slightly sooner than the others, exactly like the shout.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A quick worked example.</strong> Hanford and Livingston are about 3,000 km
            apart. At 300,000 km per second, the very longest it could possibly take the wave to
            cross that extra distance is 3,000 ÷ 300,000 = 0.01 seconds - 10 milliseconds. That is
            why the gaps you will see between detectors in this experiment are only a few
            milliseconds: tiny, but real, and exactly the clue used to figure out direction.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, predict which detector will register the wave first.
            Then predict whether the three detectors will register it at essentially the same
            instant, or at measurably different times.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Pick a direction below, then run the experiment and
            watch the three dots light up one after another. The order they light up in, and how
            many milliseconds apart (shown underneath once it finishes), is exactly the same kind
            of clue as the shout example above - it is what lets you (or a real detector network)
            work out the direction, even though nothing ever "looks" at the sky directly. After the
            flashes finish, two shaded wedges also sweep into view - see "How to read this diagram"
            below the controls for what they mean.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>The wave is a flat front traveling in a straight line at exactly the speed of light.</li>
            <li>
              The three detectors are shown on a flat, schematic diagram, not a real map - their
              positions only approximate the real distances between them.
            </li>
            <li>The animation is slowed way down so the arrival gaps - only a few milliseconds in reality - are easy to watch.</li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Which detector do you think the wave will reach first?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {firstDetectorChoices.map((choice) => (
              <button
                key={choice}
                onClick={() => setFirstDetectorPrediction(choice)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${firstDetectorPrediction === choice ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Do you think the three detectors will all register the wave at essentially the same
            instant, or at measurably different times?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {timingChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setTimingPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${timingPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${firstDetectorPrediction ?? submittedFirstDetectorPrediction}, ${
                  timingChoices.find(
                    (c) => c.value === (timingPrediction ?? submittedTimingPrediction)
                  )!.label
                }`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many different directions
              as you like below. Or, change your predictions and start over:
            </p>
            <button
              type="button"
              onClick={handleChangePrediction}
              className="secondary-button"
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: 'rgba(124, 58, 237, 0.22)',
              }}
            >
              Change predictions
            </button>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          {DIRECTION_PRESETS.map((directionPreset, index) => (
            <button
              key={directionPreset.label}
              type="button"
              onClick={() => handleSelectPreset(index)}
              disabled={!hasPrediction}
              className={`toggle-button${selectedPresetIndex === index ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {directionPreset.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasPrediction || status === 'running'}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {!hasPrediction && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer the predictions above to try the controls.
          </p>
        )}

        <svg
          width={VIEW_SIZE}
          height={VIEW_SIZE}
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          style={{
            marginTop: '1rem',
            display: 'block',
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#0b1020',
          }}
        >
          <line
            x1={centerSvg.x}
            y1={centerSvg.y}
            x2={arrowTip.x}
            y2={arrowTip.y}
            stroke="#fbbf24"
            strokeWidth={2}
          />
          <polygon
            points={`${arrowTip.x},${arrowTip.y} ${arrowTip.x - 6},${arrowTip.y + 10} ${arrowTip.x + 6},${arrowTip.y + 10}`}
            fill="#fbbf24"
            transform={`rotate(${90 - preset.directionDegrees}, ${arrowTip.x}, ${arrowTip.y})`}
          />
          <text x={arrowTip.x} y={arrowTip.y - 10} fill="#fbbf24" fontSize="10" textAnchor="middle">
            wave arrives from here
          </text>

          {DETECTORS.map((detector) => {
            const point = toSvgPoint(detector.x, detector.y)
            const hasFlashed = flashedDetectorNames.includes(detector.name)
            return (
              <g key={detector.name}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hasFlashed ? 14 : 8}
                  fill={hasFlashed ? '#f5f3ff' : '#67e8f9'}
                  opacity={hasFlashed ? 0.95 : 0.7}
                />
                <text x={point.x} y={point.y + 26} fill="#e5e7eb" fontSize="12" textAnchor="middle">
                  {detector.name}
                </text>
              </g>
            )
          })}

          {status === 'complete' && (
            <>
              {/* Shaded wedges, not thin lines: a wedge is much easier to read as "a range of
                  possible directions" than a bare curve, which is the whole point being
                  illustrated. Each wedge fans out from the detector array's own center. */}
              <path
                d={`M ${centerSvg.x},${centerSvg.y} L ${arcOneStart.x},${arcOneStart.y} A 130,130 0 0,1 ${arcOneEnd.x},${arcOneEnd.y} Z`}
                fill="#f472b6"
                fillOpacity={0.18}
                stroke="#f472b6"
                strokeWidth={1.5}
                strokeDasharray="6 5"
                opacity={0.9}
              />
              <path
                d={`M ${centerSvg.x},${centerSvg.y} L ${arcTwoStart.x},${arcTwoStart.y} A 155,155 0 0,1 ${arcTwoEnd.x},${arcTwoEnd.y} Z`}
                fill="#34d399"
                fillOpacity={0.18}
                stroke="#34d399"
                strokeWidth={1.5}
                strokeDasharray="6 5"
                opacity={0.9}
              />
              {arcRevealProgress >= 1 && (
                <>
                  <text
                    x={clampToViewBox(arcOneLabelPoint).x}
                    y={clampToViewBox(arcOneLabelPoint).y}
                    fill="#f472b6"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    possible directions (A)
                  </text>
                  <text
                    x={clampToViewBox(arcTwoLabelPoint).x}
                    y={clampToViewBox(arcTwoLabelPoint).y}
                    fill="#34d399"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    possible directions (B)
                  </text>
                </>
              )}
            </>
          )}
        </svg>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> The three dots are the detectors. A dot
            grows brighter and larger the instant the wave reaches it. The yellow arrow shows the
            direction the wave is actually coming from in this run — the thing a real detector has
            to figure out, since it can't just look at the sky.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What the two shaded wedges are.</strong> Comparing just two detectors'
            arrival times doesn't give you one exact direction — only a range of directions that
            could all produce the same timing gap. Think back to the three friends in the
            introduction: if you only compared two of the friends' times, you'd know the shout
            came from "somewhere over there," roughly on one side, but not the precise spot. Wedge{' '}
            <strong>A</strong> is that kind of range from comparing one pair of detectors; wedge{' '}
            <strong>B</strong> is the same idea from comparing a different pair. They are sketches
            of this idea, not exact calculations.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            Where the two wedges overlap is a <em>smaller</em> range of directions, not one exact
            direction. The true direction has to be somewhere inside that overlap, but the overlap
            itself still covers many possible directions — left, right, up, down, anywhere inside
            it. That's triangulation's real limit: comparing more detector pairs keeps narrowing the
            range, but even real gravitational-wave detector networks usually only narrow a
            signal's source down to a patch of sky, not one single exact point.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            Only two wedges are shown, not all three possible pairs (Hanford–Livingston,
            Hanford–Virgo, Livingston–Virgo) — two is enough to show the idea; a real
            localization effort would combine all three.
          </p>
        </div>

        {status === 'complete' &&
          submittedFirstDetectorPrediction &&
          submittedTimingPrediction &&
          (() => {
            const actualFirstDetector = order[0].detector.name
            const lastDetector = order[order.length - 1].detector.name
            const maxGapMs = (latestTime - earliestTime) * 1000
            const actualTiming: TimingChoice = maxGapMs < 0.01 ? 'same' : 'different'
            const firstDetectorMatched = submittedFirstDetectorPrediction === actualFirstDetector
            const timingMatched = submittedTimingPrediction === actualTiming

            return (
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
                <h3 style={{ marginTop: 0 }}>Results</h3>
                <p>
                  You chose <strong>{preset.label}</strong> as the incoming direction. Here is what
                  each detector actually recorded, earliest first:
                </p>
                <ol style={{ marginTop: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                  {order.map((arrival) => (
                    <li key={arrival.detector.name}>
                      {arrival.detector.name}:{' '}
                      {((arrival.arrivalTimeSeconds - earliestTime) * 1000).toFixed(2)} ms after the
                      first
                    </li>
                  ))}
                </ol>
                <p>
                  <strong>What this means:</strong> <strong>{actualFirstDetector}</strong> registered
                  the wave before the other two, which (as in the introduction's shout example)
                  tells us the wave came from somewhat closer to {actualFirstDetector}'s side of the
                  triangle. <strong>{lastDetector}</strong>, registering last - a full{' '}
                  <strong>{maxGapMs.toFixed(2)} ms</strong> behind {actualFirstDetector} - was the
                  detector farthest from the direction the wave actually came from, the same way the
                  friend who heard the shout last was the one standing farthest from it.
                </p>
                <p>
                  <strong>Checking your first prediction:</strong> you guessed{' '}
                  <strong>{submittedFirstDetectorPrediction}</strong> would register first. It was
                  actually <strong>{actualFirstDetector}</strong> —{' '}
                  {firstDetectorMatched
                    ? 'so your prediction was right.'
                    : 'so your prediction was off this time.'}
                </p>
                <p>
                  <strong>Checking your second prediction:</strong> you guessed the three arrivals
                  would be{' '}
                  <strong>
                    {timingChoices.find((c) => c.value === submittedTimingPrediction)!.label.toLowerCase()}
                  </strong>
                  . The real spread, from first to last, was{' '}
                  <strong>{maxGapMs.toFixed(2)} ms</strong> — easily measurable, so that counts as
                  "measurably different times" —{' '}
                  {timingMatched ? 'matching your prediction.' : 'not what you predicted.'}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  A real detector network compares exactly this kind of timing gap across three or
                  more detectors — not just one — to narrow down which patch of sky a signal came
                  from. This is how a real event like GW170817 (Experiment 4) could be matched to a
                  location telescopes could then point at and see light from.
                </p>
              </div>
            )
          })()}
      </div>

      {status === 'complete' && submittedFirstDetectorPrediction && submittedTimingPrediction && (
        <GravitationalWaveTriangulationTutor
          key={runCount}
          predictedFirstDetector={submittedFirstDetectorPrediction}
          predictedTiming={submittedTimingPrediction}
          actualFirstDetector={order[0].detector.name}
          actualMaxGapMs={(latestTime - earliestTime) * 1000}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
