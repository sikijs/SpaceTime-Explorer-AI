import { useEffect, useState } from 'react'
import {
  BLACK_HOLE_PRESETS,
  FAR_CLOCK_RUN_SECONDS,
  MAX_DISTANCE_IN_HORIZON_RADII,
  MIN_DISTANCE_IN_HORIZON_RADII,
  clockReadingsAt,
  exactSlowingFactor,
  firstOrderSlowingFactor,
  runTimeNearBlackHoleExperiment,
  surfaceSlowing,
} from '../physics/timeNearBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { TimeNearBlackHoleTutor } from './TimeNearBlackHoleTutor'

interface TimeNearBlackHoleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 640
const VIEW_HEIGHT = 360
const AXIS_LEFT = 90
const AXIS_RIGHT = 600
const AXIS_Y = 270

// The two graphs below the clocks (Pictures 2 and 3).
const GRAPH_HEIGHT = 290
const PLOT_LEFT = 70
const PLOT_RIGHT = 600
const PLOT_TOP = 62
const PLOT_BOTTOM = 232
const FIRST_ORDER_COLOR = '#fb923c'

const CLOCK_RADIUS = 52
const CLOCK_Y = 112
const HOVERING_CLOCK_X = 170
const FAR_CLOCK_X = 470
// One turn of a clock's hand is this many seconds of that clock's own time.
const SECONDS_PER_TURN = 10

// Fixed real-world playback duration, independent of the physics result (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 10000

const KM_PER_AU = 149_597_870.7

// How many times heavier the giant black hole (M87*) is than the small one, in millions; from the presets, so that
// the text and the model cannot disagree.
const MASS_RATIO_MILLIONS = Math.round(
  BLACK_HOLE_PRESETS[BLACK_HOLE_PRESETS.length - 1].massSolarMasses / BLACK_HOLE_PRESETS[0].massSolarMasses / 1e6,
)

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

// Up to four significant figures, with no trailing zeros ("0.5", "0.000999").
function formatSmall(value: number): string {
  return String(Number(value.toPrecision(4)))
}

function formatPercent(percent: number): string {
  return percent < 0.01 ? 'less than 0.01%' : `${Number(percent.toPrecision(2))}%`
}

// How much slower a clock at a real surface runs, in plain units.
function formatSlowing(fraction: number): string {
  if (fraction >= 0.01) return `about ${Math.round(fraction * 100)}% slower`
  const perSecond =
    fraction < 1e-6
      ? `${Number((fraction * 1e9).toPrecision(2))} billionths of a second`
      : `${Number((fraction * 1e6).toPrecision(2))} millionths of a second`
  const perDaySeconds = fraction * 86400
  const perDay =
    perDaySeconds < 1e-3
      ? `${Number((perDaySeconds * 1e6).toPrecision(2))} millionths of a second`
      : `${Number(perDaySeconds.toPrecision(2))} seconds`
  return `loses about ${perSecond} every second, about ${perDay} per day`
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

export function TimeNearBlackHoleExperiment({ onComplete, onTutorComplete }: TimeNearBlackHoleExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('stellar-black-hole')
  const [distance, setDistance] = useState(10)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

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
    setRunCount((count) => count + 1)
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
  // The kilometer label sits under the axis; it is kept clear of the black hole's box on the left and of the
  // picture's right edge (the width is estimated from the text length, since SVG text is not measured here).
  const distanceLabel = `= ${formatDistance(result.distanceKm)} from the center`
  const distanceLabelWidth = distanceLabel.length * 5.8
  const distanceLabelX = Math.min(Math.max(hoveringX - distanceLabelWidth / 2, horizonX + 10), VIEW_WIDTH - 8 - distanceLabelWidth)
  const hoveringLabelX = Math.min(Math.max(hoveringX, AXIS_LEFT + 120), AXIS_RIGHT - 100)

  // Picture 2: the factor against distance, from the horizon (1) out to 100 horizon radii. The curve starts at
  // 1.001, so the horizon's own values (exact 0, first order 0.5) are added as the first point.
  const graphXFor = (d: number) => PLOT_LEFT + (Math.log10(d) / logMax) * (PLOT_RIGHT - PLOT_LEFT)
  const graphYFor = (factor: number) => PLOT_BOTTOM - factor * (PLOT_BOTTOM - PLOT_TOP)
  const factorPath = (pick: (point: (typeof result.curve)[number]) => number, atHorizon: number) =>
    [`M ${graphXFor(1)} ${graphYFor(atHorizon)}`]
      .concat(result.curve.map((pt) => `L ${graphXFor(pt.distanceInHorizonRadii)} ${graphYFor(pick(pt))}`))
      .join(' ')
  const exactPath = factorPath((pt) => pt.exact, exactSlowingFactor(1))
  const firstOrderPath = factorPath((pt) => pt.firstOrder, firstOrderSlowingFactor(1))

  // Picture 3: each clock's reading against the far-away clock's time, drawn up to the present moment of the run.
  const timeX = (seconds: number) => PLOT_LEFT + (seconds / FAR_CLOCK_RUN_SECONDS) * (PLOT_RIGHT - PLOT_LEFT)
  const readingY = (seconds: number) => PLOT_BOTTOM - (seconds / FAR_CLOCK_RUN_SECONDS) * (PLOT_BOTTOM - PLOT_TOP)

  // Values for the Results panel.
  const showResults = status === 'complete' && hasSubmittedPrediction
  const factorOnePercentOut = exactSlowingFactor(1.01)
  const holesAtTwo = BLACK_HOLE_PRESETS.map((p) => runTimeNearBlackHoleExperiment(p.id, 2))
  const holesAtChosen = BLACK_HOLE_PRESETS.map((p) => runTimeNearBlackHoleExperiment(p.id, distance))
  const surfaces = (
    [
      ['Earth', 'earth'],
      ['The Sun', 'sun'],
      ['A neutron star', 'neutron-star'],
    ] as const
  ).map(([label, id]) => ({ label, ...surfaceSlowing(id) }))
  const percentTooHigh = ((result.firstOrderFactor - result.exactFactor) / result.exactFactor) * 100
  const justOutsideRight = submittedJustOutside === 'tenth'
  const massRight = submittedMass === 'same'
  const approximationRight = submittedApproximation === 'worse-closer'

  const isPresetSelected = (d: number) => Math.abs(Math.log(d / distance)) < 1e-9

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 2 — Time Near a Black Hole: Does a Clock Ever Stop?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Wording approved by the owner on 2026-10-10 (CLAUDE.md §28.1). It must not give away the answers to the
            three predictions below (§12): no mention of the factor reaching zero, of the mass not mattering, or of
            where the simple formula fails. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Gravity and Curved Spacetime, Experiments 2 and 9, you saw that a
            clock lower down in a gravity field ticks more slowly than a clock higher up, and that for Earth the
            difference is tiny. A black hole is a place where gravity is as strong as it ever gets. So how much
            does it slow a clock? Is the slowing ever so great that a clock stops?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> In everyday life, time seems to pass at one steady rate for
            everyone, everywhere. A clock at the bottom of a building and a clock at the top agree for all
            practical purposes, because the difference is far too small to notice without extremely precise
            equipment. That is why nobody thinks about it. But the earlier experiments left two things open. They
            never went anywhere that gravity is strong. And they used a simple formula that was made for weak
            gravity. This experiment goes to the strongest gravity there is, and asks what happens there.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You pick one of three real black holes, and a distance from its
            center at which to hold a clock at rest. A second, identical clock is far away. Both clocks start
            together, and the far-away clock runs for {FAR_CLOCK_RUN_SECONDS} seconds of its own time. Three
            pictures show what happens: the two clocks with a ruler for the distance, a graph of how fast the
            held clock ticks at each distance, and a graph of what each clock reads as the run plays.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> The <strong>far-away clock</strong> is a clock held so far
            from the black hole that the black hole's gravity does not affect it. We treat its rate as the normal
            rate, and compare everything with it. The <strong>hovering clock</strong> is an identical clock held
            still at a fixed distance from the black hole's center. It does not fall and it does not orbit. How
            it is held in place is not described. The <strong>horizon</strong> is the edge of a black hole, the
            one-way boundary you met in Experiment 1 of this chapter. The <strong>horizon radius</strong> is the
            distance from the black hole's center to its horizon, and we measure distances in horizon radii: 10
            horizon radii means ten times as far from the center as the edge is. For the biggest black holes
            the distances in kilometers are huge, so we also give them in <strong>astronomical units</strong>{' '}
            (AU): 1 AU is the distance from the Earth to the Sun, about 150 million kilometers.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The black holes.</strong> They are the three from Experiment 1: a stellar black hole of 10
            Suns' worth of mass (a round, illustrative value), Sagittarius A*, the black hole at the center of
            our galaxy, and M87*, the black hole imaged in the galaxy M87. Their masses are about 4 million and
            6.5 billion Suns.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What this builds on.</strong> Experiment 1 of this chapter gave you the horizon radius. Gravity
            and Curved Spacetime, Experiment 2 showed that gravity slows clocks, and Experiment 9 put in real
            numbers for Earth using a simple formula. Here we use the exact formula from general relativity, the
            exact theory of gravity, in place of that simple one.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make three predictions. Then choose a black hole and a distance, and
            run it. Try other distances and other black holes too, and compare.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> How the two clocks' readings compare, and what changes when you move
            the held clock nearer or farther, and when you change the black hole.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>This is a thought experiment.</strong> It does not describe how the hovering clock is held
              in place, or model whatever would do it.
            </li>
            <li>
              <strong>Only two clocks, each held at rest, are compared.</strong> It does not describe a clock
              that is falling, orbiting or moving, or a traveler. What a traveler who falls toward a black hole
              experiences is different, and it is the subject of a later experiment in this chapter.
            </li>
            <li>
              <strong>Nothing inside the horizon is modeled.</strong> A clock cannot be held there, so the
              distance control stops just short of the horizon.
            </li>
            <li>
              <strong>The formula for the slowing is given, not derived.</strong> Deriving it needs Einstein's
              equations, which are outside this project. It is exact for the simplest kind of black hole: one
              that does not spin and has no electric charge. Real black holes usually spin, and that changes the
              picture. The simple formula from the earlier experiments is shown beside it, labeled as an
              approximation for weak gravity.
            </li>
            <li>
              The far-away clock is treated as being so far away that the black hole's gravity does not affect
              it at all.
            </li>
            <li>
              Distance is measured as in Experiment 1, as it would be measured around the black hole. The
              experiment does not discuss how that differs from a distance measured straight inward.
            </li>
            <li>
              The masses of Sagittarius A* and M87* are rounded values, and the stellar black hole's mass of 10
              Suns is an illustrative round value, not a particular object.
            </li>
          </ul>
        </div>

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
            giant one (M87*, {MASS_RATIO_MILLIONS} million times as heavy). Which one ticks more slowly, compared with a clock far
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
              The slider is logarithmic: equal steps along it multiply the distance by the same amount. A horizon radius is the size of the black hole's edge; 1 horizon
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
              {readings.hovering.toFixed(2)} s &nbsp;|&nbsp; Slowing factor (hovering rate ÷ far-away rate): {result.exactFactor.toFixed(4)}
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
            horizon (edge of the black hole): {formatDistance(result.horizonRadiusKm)} from the center
          </text>

          <text x={(horizonX + AXIS_RIGHT) / 2} y={AXIS_Y + 66} fill="#94a3b8" fontSize="11" textAnchor="middle">
            distance from the black hole's center, in horizon radii (logarithmic)
          </text>

          {/* Where the hovering clock is held */}
          <line x1={HOVERING_CLOCK_X} y1={CLOCK_Y + CLOCK_RADIUS + 42} x2={hoveringX} y2={AXIS_Y - 38} stroke={HOVERING_COLOR} strokeDasharray="3 4" strokeOpacity={0.6} />
          <line x1={hoveringX} y1={AXIS_Y} x2={hoveringX} y2={AXIS_Y - 16} stroke={HOVERING_COLOR} />
          <circle cx={hoveringX} cy={AXIS_Y} r={7} fill={HOVERING_COLOR} />
          <text x={hoveringLabelX} y={AXIS_Y - 20} fill={HOVERING_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
            hovering clock: {formatRadii(distance)} horizon radii
          </text>
          <text x={distanceLabelX} y={AXIS_Y + 34} fill={HOVERING_COLOR} fontSize="11" textAnchor="start">
            {distanceLabel}
          </text>

          {/* The far-away clock is much farther out than the ruler reaches */}
          <text x={VIEW_WIDTH - 12} y={AXIS_Y + 86} fill={FAR_COLOR} fontSize="11" textAnchor="end">
            the far-away clock is much farther out than this ruler reaches →
          </text>
        </svg>

        {/* Picture 2: the exact slowing factor against the simple formula from Gravity Experiments 2 and 9 */}
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${GRAPH_HEIGHT}`}
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
            Picture 2: how fast the hovering clock ticks, against its distance
          </text>
          <text x={12} y={38} fill="#94a3b8" fontSize="11">
            Vertical: the hovering clock's rate compared with the far-away clock's (1 = the same rate)
          </text>

          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line x1={PLOT_LEFT} y1={graphYFor(f)} x2={PLOT_RIGHT} y2={graphYFor(f)} stroke="#334155" />
              <text x={PLOT_LEFT - 8} y={graphYFor(f) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                {f}
              </text>
            </g>
          ))}
          {[1, 1.5, 3, 10, 100].map((d) => (
            <g key={d}>
              <line x1={graphXFor(d)} y1={PLOT_BOTTOM} x2={graphXFor(d)} y2={PLOT_BOTTOM + 5} stroke="#94a3b8" />
              <text x={graphXFor(d)} y={PLOT_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor={d === 1 ? 'start' : 'middle'}>
                {d}
              </text>
            </g>
          ))}
          <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 38} fill="#94a3b8" fontSize="11" textAnchor="middle">
            distance from the black hole's center, in horizon radii (logarithmic)
          </text>

          {/* The horizon, where the exact line reaches zero */}
          <line x1={graphXFor(1)} y1={PLOT_TOP - 6} x2={graphXFor(1)} y2={PLOT_BOTTOM} stroke={HORIZON_COLOR} strokeWidth={2} />
          <text x={graphXFor(1) + 6} y={PLOT_TOP + 8} fill={HORIZON_COLOR} fontSize="11">
            horizon
          </text>

          <path d={firstOrderPath} fill="none" stroke={FIRST_ORDER_COLOR} strokeWidth={3} strokeDasharray="7 5" />
          <path d={exactPath} fill="none" stroke={HOVERING_COLOR} strokeWidth={3} />

          {/* The chosen distance on each line */}
          <line x1={graphXFor(distance)} y1={PLOT_TOP - 6} x2={graphXFor(distance)} y2={PLOT_BOTTOM} stroke="#e2e8f0" strokeDasharray="2 4" strokeOpacity={0.7} />
          <text
            x={Math.min(Math.max(graphXFor(distance), PLOT_LEFT + 45), PLOT_RIGHT - 45)}
            y={PLOT_TOP - 10}
            fill="#e2e8f0"
            fontSize="11"
            textAnchor="middle"
          >
            your distance: {formatRadii(distance)}
          </text>
          <circle cx={graphXFor(distance)} cy={graphYFor(result.firstOrderFactor)} r={6} fill="#0b1020" stroke={FIRST_ORDER_COLOR} strokeWidth={3} />
          <circle cx={graphXFor(distance)} cy={graphYFor(result.exactFactor)} r={6} fill={HOVERING_COLOR} stroke="#0b1020" strokeWidth={2} />

          {/* Legend and the values at the chosen distance */}
          <line x1={250} y1={PLOT_BOTTOM - 62} x2={280} y2={PLOT_BOTTOM - 62} stroke={HOVERING_COLOR} strokeWidth={3} />
          <text x={286} y={PLOT_BOTTOM - 58} fill={HOVERING_COLOR} fontSize="11">
            exact: {result.exactFactor.toFixed(4)} at {formatRadii(distance)}
          </text>
          <line x1={250} y1={PLOT_BOTTOM - 42} x2={280} y2={PLOT_BOTTOM - 42} stroke={FIRST_ORDER_COLOR} strokeWidth={3} strokeDasharray="7 5" />
          <text x={286} y={PLOT_BOTTOM - 38} fill={FIRST_ORDER_COLOR} fontSize="11">
            simple formula (Gravity Experiments 2 and 9): {result.firstOrderFactor.toFixed(4)}
          </text>
        </svg>

        {/* Picture 3: both clocks' readings over the run */}
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${GRAPH_HEIGHT}`}
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
            Picture 3: what each clock reads as the far-away clock runs
          </text>
          <text x={12} y={38} fill="#94a3b8" fontSize="11">
            Drawn as the run plays. Horizontal: the far-away clock's reading. Vertical: each clock's own reading.
          </text>

          {[0, 20, 40, 60].map((t) => (
            <g key={t}>
              <line x1={PLOT_LEFT} y1={readingY(t)} x2={PLOT_RIGHT} y2={readingY(t)} stroke="#334155" />
              <text x={PLOT_LEFT - 8} y={readingY(t) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
                {t}
              </text>
              <line x1={timeX(t)} y1={PLOT_BOTTOM} x2={timeX(t)} y2={PLOT_BOTTOM + 5} stroke="#94a3b8" />
              <text x={timeX(t)} y={PLOT_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 38} fill="#94a3b8" fontSize="11" textAnchor="middle">
            far-away clock's reading (seconds)
          </text>
          <text x={PLOT_LEFT - 8} y={PLOT_TOP - 10} fill="#94a3b8" fontSize="10" textAnchor="end">
            seconds
          </text>

          {progress > 0 && (
            <>
              <line x1={timeX(0)} y1={readingY(0)} x2={timeX(readings.far)} y2={readingY(readings.far)} stroke={FAR_COLOR} strokeWidth={3} />
              <line x1={timeX(0)} y1={readingY(0)} x2={timeX(readings.far)} y2={readingY(readings.hovering)} stroke={HOVERING_COLOR} strokeWidth={3} />
              <circle cx={timeX(readings.far)} cy={readingY(readings.far)} r={5} fill={FAR_COLOR} />
              <circle cx={timeX(readings.far)} cy={readingY(readings.hovering)} r={5} fill={HOVERING_COLOR} />
            </>
          )}

          <line x1={96} y1={PLOT_TOP + 14} x2={126} y2={PLOT_TOP + 14} stroke={FAR_COLOR} strokeWidth={3} />
          <text x={132} y={PLOT_TOP + 18} fill={FAR_COLOR} fontSize="11">
            far-away clock (reads the same as the horizontal axis)
          </text>
          <line x1={96} y1={PLOT_TOP + 34} x2={126} y2={PLOT_TOP + 34} stroke={HOVERING_COLOR} strokeWidth={3} />
          <text x={132} y={PLOT_TOP + 38} fill={HOVERING_COLOR} fontSize="11">
            hovering clock
          </text>
          <circle cx={111} cy={PLOT_TOP + 54} r={5} fill="#e2e8f0" />
          <text x={132} y={PLOT_TOP + 58} fill="#e2e8f0" fontSize="11">
            dots: the present moment of the run
          </text>
        </svg>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
            <strong>How to read these diagrams.</strong> The pictures compare two identical clocks. Both are
            held still. One is far away from the black hole, so far that its gravity does not affect it. The
            other hovers close to the black hole. Picture 1 shows the two clocks, Picture 2 shows how the
            hovering clock's rate depends on its distance, and Picture 3 shows what both clocks read over the
            run.
          </p>
          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>Picture 1, the two clocks (the top picture)</strong>
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
              <strong>Why the hovering clock can fall behind.</strong> It sits deeper in the black hole's
              gravity than the far-away clock does. As you saw in Gravity and Curved Spacetime, Experiment 2, a
              clock deeper in a gravity field ticks more slowly than one higher up. Here you can see how much
              more slowly, and how that changes with distance.
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

          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>Picture 2, the rate against distance (the middle picture)</strong>
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The height of a line is how fast the hovering clock ticks compared with the far-away
              clock.</strong> A height of 1 means the same rate. A height of 0.5 means half as fast, and 0
              means not ticking at all. Along the bottom is the same distance ruler as in Picture 1, with the
              horizon on the left.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The solid blue line is the exact answer</strong>, the one this experiment uses for the
              clock in Picture 1. The two dots mark the distance you chose.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The dashed orange line is the simple formula from Gravity and Curved Spacetime,
              Experiments 2 and 9.</strong> It is an approximation made for weak gravity. Look at where the two
              lines lie on top of each other and where they pull apart, and what each says at the horizon, the
              red line.
            </li>
          </ol>

          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>Picture 3, the readings over time (the bottom picture)</strong>
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li style={{ marginBottom: 0 }}>
              <strong>Each line shows what a clock reads, against the far-away clock's reading.</strong> It is
              drawn as the run plays. The gold line is the far-away clock, which by definition reads the same as
              the horizontal axis. The blue line is the hovering clock. A steeper line means a faster clock. The
              dots show the present moment of the run.
            </li>
          </ol>
        </div>

        {showResults && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You held a clock at <strong>{formatRadii(distance)} horizon radii</strong> (
              {formatDistance(result.distanceKm)}) from the center of <strong>{result.preset.label}</strong> (
              {formatMass(result.preset.massSolarMasses)}). The far-away clock ran for{' '}
              {FAR_CLOCK_RUN_SECONDS} seconds of its own time. For this run:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <tbody>
                  {[
                    ['The far-away clock read', `${result.farClockReadingSeconds.toFixed(2)} s`],
                    ['The hovering clock read', `${result.hoveringClockReadingSeconds.toFixed(2)} s`],
                    [
                      'The slowing factor (hovering rate ÷ far-away rate)',
                      `${result.exactFactor.toFixed(4)}, so the hovering clock ticks at ${formatPercent(result.exactFactor * 100)} of the far-away rate`,
                    ],
                    [
                      'What the simple formula (Gravity Experiments 2 and 9) gives at this distance',
                      `${result.firstOrderFactor.toFixed(4)}, which is ${formatPercent(percentTooHigh)} too high`,
                    ],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' }}>{label}</td>
                      <td style={{ padding: '0.3rem 0', verticalAlign: 'top' }}>
                        <strong>{value}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>
              <strong>Checking your first prediction:</strong> asked how fast a clock ticks when it hovers only 1%
              beyond the horizon, you answered "
              {justOutsideChoices.find((c) => c.value === submittedJustOutside)!.label}". The exact factor at 1.01
              horizon radii is {factorOnePercentOut.toFixed(4)}, so the clock ticks at about one tenth of the
              far-away rate: about one tick for every ten of yours.{' '}
              {justOutsideRight
                ? 'So your prediction was right.'
                : submittedJustOutside === 'stopped'
                  ? 'So your prediction was off this time. The clock is slowed a great deal, but it has not stopped. The factor reaches zero only at the horizon itself.'
                  : submittedJustOutside === 'half'
                    ? 'So your prediction was off this time. Half as fast is what the simple formula from the earlier experiments gives here (about 0.5), but the exact answer is far smaller.'
                    : 'So your prediction was off this time. The slowing is large this close to the horizon.'}
            </p>
            <p>
              <strong>Checking your second prediction:</strong> asked which of two clocks at twice the horizon
              radius ticks more slowly, one near a small black hole and one near a giant one, you answered "
              {massChoices.find((c) => c.value === submittedMass)!.label}". At 2 horizon radii the factor is{' '}
              {holesAtTwo[0].exactFactor.toFixed(4)} near the 10-Sun black hole and{' '}
              {holesAtTwo[2].exactFactor.toFixed(4)} near {holesAtTwo[2].preset.label}: the same, even though
              M87* is {MASS_RATIO_MILLIONS} million times as heavy.{' '}
              {massRight
                ? 'So your prediction was right.'
                : 'So your prediction was off this time. The factor depends only on how many horizon radii away the clock is, not on the mass. Each clock is the same fraction of the way to its own black hole\'s edge.'}
            </p>
            <p>
              <strong>Checking your third prediction:</strong> asked whether the simple formula from Gravity
              Experiments 2 and 9 would still be accurate next to a horizon, you answered "
              {approximationChoices.find((c) => c.value === submittedApproximation)!.label}". At 10 horizon radii the
              exact factor is {exactSlowingFactor(10).toFixed(4)} and the simple formula gives{' '}
              {firstOrderSlowingFactor(10).toFixed(4)}: they agree to within 0.2%. At 1.01 horizon radii they are{' '}
              {factorOnePercentOut.toFixed(4)} and {firstOrderSlowingFactor(1.01).toFixed(4)}: far apart. At the
              horizon itself the exact factor is 0 and the simple formula still gives 0.5.{' '}
              {approximationRight
                ? 'So your prediction was right.'
                : submittedApproximation === 'still-accurate'
                  ? 'So your prediction was off this time. The simple formula is a weak-gravity approximation, and near the horizon gravity is not weak.'
                  : 'So your prediction was off this time. Far from the horizon the simple formula is accurate, which is why it worked for Earth and for GPS satellites.'}
            </p>

            <p style={{ marginBottom: '0.25rem' }}>
              <strong>The simple math.</strong> The exact factor is <strong>√(1 − r_s ÷ r)</strong>, where r_s is
              the horizon radius and r is the clock's distance from the center. This is given, not derived. Here
              it is for your distance, {formatRadii(distance)} horizon radii:
            </p>
            <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
              <li>
                r_s ÷ r is 1 ÷ {formatRadii(distance)} = {formatSmall(1 / distance)}.
              </li>
              <li>
                1 − {formatSmall(1 / distance)} = {formatSmall(1 - 1 / distance)}.
              </li>
              <li>
                The square root of {formatSmall(1 - 1 / distance)} is {result.exactFactor.toFixed(4)}. This is the
                factor.
              </li>
              <li>
                In {FAR_CLOCK_RUN_SECONDS} seconds on the far-away clock, the hovering clock registers{' '}
                {result.exactFactor.toFixed(4)} × {FAR_CLOCK_RUN_SECONDS} = {result.hoveringClockReadingSeconds.toFixed(2)}{' '}
                seconds.
              </li>
            </ol>
            <p>
              The factor depends only on r ÷ r_s, which is why a different black hole gives the same answer at
              the same number of horizon radii. Here are all three at your distance:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    {['Black hole', 'Distance from its center', 'Factor', 'Hovering clock reads'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holesAtChosen.map((r) => (
                    <tr key={r.preset.id}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' }}>{r.preset.label}</td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' }}>
                        {formatDistance(r.distanceKm)}
                      </td>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' }}>
                        <strong>{r.exactFactor.toFixed(4)}</strong>
                      </td>
                      <td style={{ padding: '0.3rem 0', verticalAlign: 'top' }}>
                        <strong>{r.hoveringClockReadingSeconds.toFixed(2)} s</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p>
              <strong>The same effect on real objects.</strong> This is the effect from Gravity and Curved
              Spacetime, Experiments 2 and 9 (gravitational time dilation: clocks lower down in a gravity field
              tick more slowly), now at full strength. For a clock at rest on the surface of a real object,
              compared with a clock far away, the same formula gives:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <tbody>
                  {surfaces.map((row) => (
                    <tr key={row.label}>
                      <td style={{ padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' }}>{row.label}</td>
                      <td style={{ padding: '0.3rem 0', verticalAlign: 'top' }}>
                        <strong>{formatSlowing(row.fractionSlower)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              The surface of Earth is about {Math.round(1 / surfaces[0].rsOverR / 1e7) * 10} million horizon radii from its center, so the slowing is tiny,
              which is why the simple formula was enough for GPS. A neutron star's surface is only about{' '}
              {Math.round(1 / surfaces[2].rsOverR)} horizon radii out, and a clock there runs far slower. (The neutron star's radius is the rounded
              value from Experiment 1 of this chapter.)
            </p>

            <p>
              <strong>A comparison from daily life.</strong> Picture a swimmer holding their place in a river just
              above a waterfall. The nearer they are to the edge, the faster the water pulls them toward it, so the
              harder they must paddle to stay put. Holding a clock still near a horizon is like that: the push
              needed grows larger and larger the closer it is, and has no limit. This is an analogy for the push
              needed to hover, not for the slowing of time itself, which has a different cause.
            </p>

            <div
              style={{
                margin: '0.75rem 0',
                padding: '0.75rem 1rem',
                border: '2px solid #f59e0b',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
              }}
            >
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What this model can and cannot tell you.</strong> This is a thought experiment about two
                clocks, each held at rest. It does not say how the hovering clock is held in place. In real life
                that would take engines whose push grows without limit as the clock nears the horizon. At exactly
                the horizon the formula gives zero, but no clock can be held there.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                It compares a clock held still near the black hole with one far away. It does not tell you what a
                traveler who falls toward the black hole experiences. That is different, and it is the subject of
                a later experiment in this chapter. Nothing inside the horizon is modeled.
              </p>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                The exact formula is given, not derived, and it is for the simplest kind of black hole: one that
                does not spin and has no electric charge. Real black holes usually spin, and that changes the
                picture. The far-away clock is treated as so far that gravity does not affect it at all. The
                simple formula shown beside the exact one is an approximation for weak gravity. The neutron star's
                size is a rounded value, and the stellar black hole's mass of 10 Suns is an illustrative round
                value.
              </p>
            </div>
          </div>
        )}
          </>
        )}
      </div>

      {status === 'complete' && submittedJustOutside && submittedMass && submittedApproximation && (
        <TimeNearBlackHoleTutor
          key={runCount}
          predictedJustOutside={submittedJustOutside}
          predictedMass={submittedMass}
          predictedApproximation={submittedApproximation}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
