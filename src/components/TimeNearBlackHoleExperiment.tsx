import { useEffect, useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  FAR_CLOCK_RUN_SECONDS,
  MAX_DISTANCE_IN_HORIZON_RADII,
  MIN_DISTANCE_IN_HORIZON_RADII,
  clockReadingsAt,
  runTimeNearBlackHoleExperiment,
} from '../physics/timeNearBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'

interface TimeNearBlackHoleExperimentProps {
  onComplete?: () => void
}

const VIEW_WIDTH = 640
const VIEW_HEIGHT = 360
const AXIS_LEFT = 90
const AXIS_RIGHT = 600
const AXIS_Y = 270

const CLOCK_RADIUS = 52
const CLOCK_Y = 112
const HOVERING_CLOCK_X = 170
const FAR_CLOCK_X = 470
// One turn of a clock's hand is this many seconds of that clock's own time.
const SECONDS_PER_TURN = 10

// Fixed real-world playback duration, independent of the physics result (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 10000

const KM_PER_AU = 149_597_870.7

const FAR_COLOR = '#facc15'
const HOVERING_COLOR = '#22d3ee'
const HORIZON_COLOR = '#fb7185'
const BLACK_HOLE_COLOR = '#e879f9'

const DISTANCE_PRESETS = [100, 10, 3, 1.5, 1.1, 1.01]
const AXIS_TICKS = [100, 10, 3, 1.5]

// This experiment's three prediction questions, per its specification's "Prediction Activity". Choices are not
// scored here; they are compared with the model's results later.
type JustOutsideChoice = 'same' | 'half' | 'tenth' | 'stopped'
const justOutsideChoices: Array<{ value: JustOutsideChoice; label: string }> = [
  { value: 'same', label: 'About the same rate' },
  { value: 'half', label: 'About half as fast' },
  { value: 'tenth', label: 'About one tenth as fast' },
  { value: 'stopped', label: 'It has stopped' },
]

type MassChoice = 'small' | 'giant' | 'same'
const massChoices: Array<{ value: MassChoice; label: string }> = [
  { value: 'small', label: 'The one near the small black hole' },
  { value: 'giant', label: 'The one near the giant black hole' },
  { value: 'same', label: 'They tick at the same relative rate' },
]

type ApproximationChoice = 'still-accurate' | 'worse-closer' | 'never-accurate'
const approximationChoices: Array<{ value: ApproximationChoice; label: string }> = [
  { value: 'still-accurate', label: 'Yes, it will still be about as accurate' },
  { value: 'worse-closer', label: 'It will be accurate far from the horizon, but get worse the closer you get' },
  { value: 'never-accurate', label: 'No, it will be wrong everywhere near a black hole, even far from the horizon' },
]

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A distance in horizon radii. Near the horizon the extra digits matter (1.001 is not 1).
function formatRadii(value: number): string {
  return value < 10 ? String(Number(value.toPrecision(4))) : formatNumber(value)
}

// A length in plain units, from meters to trillions of kilometers.
function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

// Kilometers, with astronomical units added once that is the more natural unit.
function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}

function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

function ClockFace({
  cx,
  cy,
  color,
  title,
  readingSeconds,
}: {
  cx: number
  cy: number
  color: string
  title: string
  readingSeconds: number
}) {
  const angle = ((readingSeconds % SECONDS_PER_TURN) / SECONDS_PER_TURN) * 2 * Math.PI
  const handLength = CLOCK_RADIUS - 8
  return (
    <g>
      <text x={cx} y={cy - CLOCK_RADIUS - 12} fill={color} fontSize="13" fontWeight="bold" textAnchor="middle">
        {title}
      </text>
      <circle cx={cx} cy={cy} r={CLOCK_RADIUS} fill="#0f172a" stroke={color} strokeWidth={3} />
      {Array.from({ length: SECONDS_PER_TURN }, (_, i) => {
        const a = (i / SECONDS_PER_TURN) * 2 * Math.PI
        return (
          <line
            key={i}
            x1={cx + (CLOCK_RADIUS - 8) * Math.sin(a)}
            y1={cy - (CLOCK_RADIUS - 8) * Math.cos(a)}
            x2={cx + (CLOCK_RADIUS - 2) * Math.sin(a)}
            y2={cy - (CLOCK_RADIUS - 2) * Math.cos(a)}
            stroke={color}
            strokeOpacity={0.7}
          />
        )
      })}
      <line
        x1={cx}
        y1={cy}
        x2={cx + handLength * Math.sin(angle)}
        y2={cy - handLength * Math.cos(angle)}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={3} fill={color} />
      <text x={cx} y={cy + CLOCK_RADIUS + 20} fill={color} fontSize="14" fontWeight="bold" textAnchor="middle">
        Reads {readingSeconds.toFixed(2)} s
      </text>
      <text x={cx} y={cy + CLOCK_RADIUS + 36} fill="#94a3b8" fontSize="10" textAnchor="middle">
        one turn of the hand = {SECONDS_PER_TURN} s on this clock
      </text>
    </g>
  )
}

export function TimeNearBlackHoleExperiment({ onComplete }: TimeNearBlackHoleExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('stellar-black-hole')
  const [distance, setDistance] = useState(10)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const [justOutsidePrediction, setJustOutsidePrediction] = useState<JustOutsideChoice | null>(null)
  const [massPrediction, setMassPrediction] = useState<MassChoice | null>(null)
  const [approximationPrediction, setApproximationPrediction] = useState<ApproximationChoice | null>(null)
  const [submittedJustOutside, setSubmittedJustOutside] = useState<JustOutsideChoice | null>(null)
  const [submittedMass, setSubmittedMass] = useState<MassChoice | null>(null)
  const [submittedApproximation, setSubmittedApproximation] = useState<ApproximationChoice | null>(null)

  const hasPrediction = justOutsidePrediction !== null && massPrediction !== null && approximationPrediction !== null
  const hasSubmittedPrediction =
    submittedJustOutside !== null && submittedMass !== null && submittedApproximation !== null

  const result = runTimeNearBlackHoleExperiment(presetId, distance)
  const readings = clockReadingsAt(result, progress * FAR_CLOCK_RUN_SECONDS)

  const handlePresetChange = (id: ObjectPreset['id']) => {
    setPresetId(id)
    setStatus('idle')
    setProgress(0)
  }

  const handleDistanceChange = (value: number) => {
    setDistance(value)
    setStatus('idle')
    setProgress(0)
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedJustOutside(justOutsidePrediction)
      setSubmittedMass(massPrediction)
      setSubmittedApproximation(approximationPrediction)
    }
    setStatus('running')
    setProgress(0)
  }

  // Matches the rest of the project's precedent: re-opens all three questions for editing without resetting the
  // chosen black hole or distance.
  const handleChangePrediction = () => {
    setSubmittedJustOutside(null)
    setSubmittedMass(null)
    setSubmittedApproximation(null)
    setStatus('idle')
    setProgress(0)
  }

  useEffect(() => {
    if (status !== 'running') return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)

      if (fraction >= 1) {
        setStatus('complete')
        onComplete?.()
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status, onComplete])

  // A logarithmic ruler of distance in horizon radii: the horizon (1) on the left, next to the black hole, and far
  // away (100) on the right, so that it runs the same way as the slider.
  const logMax = Math.log10(MAX_DISTANCE_IN_HORIZON_RADII)
  const xFor = (d: number) => AXIS_LEFT + (Math.log10(d) / logMax) * (AXIS_RIGHT - AXIS_LEFT)
  const hoveringX = xFor(distance)
  const horizonX = xFor(1)
  const hoveringLabelX = Math.min(Math.max(hoveringX, AXIS_LEFT + 120), AXIS_RIGHT - 100)

  const isPresetSelected = (d: number) => Math.abs(Math.log(d / distance)) < 1e-9

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 2 — Time Near a Black Hole: Does a Clock Ever Stop?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A clock hovers just outside a black hole's horizon, only 1% farther from the center than the horizon
            is. You watch it from far away. How fast does it tick compared with an identical clock next to you?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {justOutsideChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setJustOutsidePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${justOutsidePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Two clocks each hover at twice the horizon radius: one near a small black hole (10 Suns), one near a
            giant one (M87*, 650 million times as heavy). Which one ticks more slowly, compared with a clock far
            away?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {massChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setMassPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${massPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            In Gravity and Curved Spacetime, Experiments 2 and 9, we used a simple formula for how gravity slows
            clocks, and it worked well. Will that same simple formula still be accurate right next to a black
            hole's horizon?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {approximationChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setApproximationPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${approximationPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  justOutsideChoices.find((c) => c.value === (justOutsidePrediction ?? submittedJustOutside))!.label
                }; ${massChoices.find((c) => c.value === (massPrediction ?? submittedMass))!.label}; ${
                  approximationChoices.find((c) => c.value === (approximationPrediction ?? submittedApproximation))!
                    .label
                }`
              : 'Answer all three questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many black holes and distances as you
              like below. Or, change your predictions and start over:
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

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Black hole:</p>
          {BLACK_HOLE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${presetId === p.id ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Hold the second clock at rest at this distance from the black hole's center:
          </p>
          {DISTANCE_PRESETS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDistanceChange(d)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${isPresetSelected(d) ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {d === MAX_DISTANCE_IN_HORIZON_RADII ? '100 (far)' : d}
            </button>
          ))}
          <div style={{ marginTop: '0.5rem' }}>
            <label htmlFor="time-near-black-hole-distance" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Distance: {formatRadii(distance)} horizon radii ({formatDistance(result.distanceKm)})
            </label>
            <input
              id="time-near-black-hole-distance"
              type="range"
              min={Math.log10(MIN_DISTANCE_IN_HORIZON_RADII)}
              max={logMax}
              step="any"
              value={Math.log10(distance)}
              disabled={!hasPrediction || status === 'running'}
              onChange={(event) =>
                handleDistanceChange(
                  Math.min(
                    Math.max(10 ** Number(event.target.value), MIN_DISTANCE_IN_HORIZON_RADII),
                    MAX_DISTANCE_IN_HORIZON_RADII,
                  ),
                )
              }
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              The slider is logarithmic. A horizon radius is the size of the black hole's edge; 1 horizon
              radius is the edge itself, and the slider stops just short of it.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasPrediction || status === 'running'}
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

        {!hasPrediction && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer the predictions above to try the controls.
          </p>
        )}

        {hasSubmittedPrediction && (
          <>
        <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {result.preset.label}: {formatMass(result.preset.massSolarMasses)}; horizon radius{' '}
          {formatDistance(result.horizonRadiusKm)}
          <br />
          Hovering clock's distance: {formatRadii(distance)} horizon radii ({formatDistance(result.distanceKm)})
          {status !== 'idle' && (
            <>
              <br />
              Far-away clock: {readings.far.toFixed(2)} s &nbsp;|&nbsp; Hovering clock:{' '}
              {readings.hovering.toFixed(2)} s &nbsp;|&nbsp; Slowing factor: {result.exactFactor.toFixed(4)}
            </>
          )}
        </p>

        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          width="100%"
          style={{
            marginTop: '1rem',
            display: 'block',
            maxWidth: `${VIEW_WIDTH}px`,
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#0b1020',
          }}
        >
          <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
            Picture 1: two identical clocks, one far away and one hovering near a black hole
          </text>

          <ClockFace cx={FAR_CLOCK_X} cy={CLOCK_Y} color={FAR_COLOR} title="Far-away clock" readingSeconds={readings.far} />
          <ClockFace
            cx={HOVERING_CLOCK_X}
            cy={CLOCK_Y}
            color={HOVERING_COLOR}
            title="Hovering clock"
            readingSeconds={readings.hovering}
          />

          {/* Inside the horizon: a distinct shaded region to the left of the horizon line */}
          <rect
            x={8}
            y={AXIS_Y - 54}
            width={horizonX - 8}
            height={86}
            fill="rgba(232, 121, 249, 0.18)"
            stroke={BLACK_HOLE_COLOR}
            strokeOpacity={0.6}
          />
          <text x={(8 + horizonX) / 2} y={AXIS_Y - 24} fill={BLACK_HOLE_COLOR} fontSize="11" textAnchor="middle">
            black
          </text>
          <text x={(8 + horizonX) / 2} y={AXIS_Y - 10} fill={BLACK_HOLE_COLOR} fontSize="11" textAnchor="middle">
            hole
          </text>

          {/* The axis and its ticks */}
          <line x1={horizonX} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} stroke="#94a3b8" strokeWidth={2} />
          {AXIS_TICKS.map((d) => (
            <g key={d}>
              <line x1={xFor(d)} y1={AXIS_Y - 5} x2={xFor(d)} y2={AXIS_Y + 5} stroke="#94a3b8" />
              <text x={xFor(d)} y={AXIS_Y + 20} fill="#94a3b8" fontSize="10" textAnchor="middle">
                {d}
              </text>
            </g>
          ))}

          {/* The horizon line */}
          <line x1={horizonX} y1={AXIS_Y - 54} x2={horizonX} y2={AXIS_Y + 32} stroke={HORIZON_COLOR} strokeWidth={2} />
          <text x={horizonX} y={AXIS_Y + 20} fill={HORIZON_COLOR} fontSize="10" textAnchor="middle">
            1
          </text>
          <text x={horizonX + 6} y={AXIS_Y + 48} fill={HORIZON_COLOR} fontSize="11" textAnchor="start">
            horizon (edge of the black hole)
          </text>

          <text x={(horizonX + AXIS_RIGHT) / 2} y={AXIS_Y + 66} fill="#94a3b8" fontSize="11" textAnchor="middle">
            distance from the black hole's center, in horizon radii (logarithmic)
          </text>

          {/* Where the hovering clock is held */}
          <line x1={HOVERING_CLOCK_X} y1={CLOCK_Y + CLOCK_RADIUS + 42} x2={hoveringX} y2={AXIS_Y - 34} stroke={HOVERING_COLOR} strokeDasharray="3 4" strokeOpacity={0.6} />
          <line x1={hoveringX} y1={AXIS_Y} x2={hoveringX} y2={AXIS_Y - 34} stroke={HOVERING_COLOR} />
          <circle cx={hoveringX} cy={AXIS_Y} r={7} fill={HOVERING_COLOR} />
          <text x={hoveringLabelX} y={AXIS_Y - 20} fill={HOVERING_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
            hovering clock: {formatRadii(distance)} horizon radii
          </text>

          {/* The far-away clock is much farther out than the ruler reaches */}
          <text x={VIEW_WIDTH - 12} y={AXIS_Y + 86} fill={FAR_COLOR} fontSize="11" textAnchor="end">
            the far-away clock is much farther out than this ruler reaches →
          </text>
        </svg>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
            <strong>How to read this diagram.</strong> The picture compares two identical clocks. Both are
            held still. One is far away from the black hole, so far that its gravity does not affect it. The
            other hovers close to the black hole.
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The two round dials are the clocks.</strong> The blue one on the left is the hovering
              clock. The gold one on the right is the far-away clock. Each hand goes around once for every{' '}
              {SECONDS_PER_TURN} seconds of that clock's own time, and the number below each dial is that
              clock's own reading. Before you press Run, both read 0. When you press Run, the far-away clock
              runs for {FAR_CLOCK_RUN_SECONDS} seconds of its own time, shown in about{' '}
              {ANIMATION_DURATION_MS / 1000} seconds of real time. If the two clocks tick at the same rate, the
              two hands stay together. If they tick at different rates, the hands drift apart.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The line at the bottom is a ruler for the hovering clock's distance.</strong> The
              distance is measured from the black hole's center, in horizon radii. A horizon radius is how far
              the black hole's edge is from its center, so 10 means ten times as far from the center as the
              edge is. Each tick is farther from the black hole than the one to its left, and the ruler is
              logarithmic, so equal steps along it mean multiplying the distance by the same amount.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The blue dot shows where the hovering clock is held.</strong> Use the buttons or the
              slider above to move it. The red line is the horizon, the edge of the black hole, and the shaded
              area to its left stands for the inside of the black hole. A clock cannot hover there, so the
              slider stops just short of the line.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The far-away clock is not on the ruler.</strong> It is much farther from the black hole
              than the ruler reaches, so it is drawn only as the gold dial and the gold note.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Changing the black hole changes the distances in kilometers, not the picture's shape.</strong>{' '}
              The ruler is in horizon radii, so it looks the same for every black hole. What changes is the
              real distance shown for the same number of horizon radii.
            </li>
            <li style={{ marginBottom: 0 }}>
              <strong>What this picture is not.</strong> It compares two clocks that are each held at rest. It
              does not show a traveler falling toward the black hole, and it does not show how the clock is held
              in place.
            </li>
          </ol>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
