import { useEffect, useState } from 'react'
import {
  MIN_RADIUS_IN_HORIZON_RADII,
  OBJECT_PRESETS,
  horizonRadiusKm,
  runBlackHoleSizeExperiment,
} from '../physics/blackHoleSizeExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'
import { BlackHoleGuide } from './BlackHoleGuide'
import { BlackHoleSizeTutor } from './BlackHoleSizeTutor'

interface BlackHoleSizeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 640
const VIEW_HEIGHT = 290
const AXIS_LEFT = 40
const AXIS_RIGHT = 600
const AXIS_Y = 170
const REGION_TOP = 62
const REGION_BOTTOM = 238

// Fixed real-world playback duration, independent of the physics result (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 4000

const KM_PER_AU = 149_597_870.7

// Fixed, illustrative landmarks, drawn only when they fall inside the current axis range. They exist
// only to make the scale understandable; they are not results (specification, "Display").
const LANDMARKS: Array<{ label: string; km: number }> = [
  { label: 'a coin (1 cm)', km: 1e-5 },
  { label: 'a person (2 m)', km: 2e-3 },
  { label: 'a small city (10 km)', km: 10 },
  { label: 'Earth (6,371 km)', km: 6371 },
  { label: 'the Sun (695,700 km)', km: 695_700 },
  { label: "Mercury's orbit (0.39 AU)", km: 0.39 * KM_PER_AU },
  { label: 'Earth to Sun (1 AU)', km: KM_PER_AU },
  { label: "Neptune's orbit (30 AU)", km: 30 * KM_PER_AU },
]

// The ball picture below the ruler. Real sizes span up to ten powers of ten, so the drawn radius grows
// only slowly with the real one: HORIZON_DRAWN_RADIUS * (1 + BALL_GROWTH * log10(radius / horizon radius)).
// It equals the red circle exactly at the horizon radius, is smaller below it and bigger above it, so the
// comparison with the red circle is honest even though the drawn sizes are not to scale.
const BALL_VIEW_HEIGHT = 230
const BALL_CENTER_X = 450
const BALL_CENTER_Y = 115
const HORIZON_DRAWN_RADIUS = 22
const BALL_GROWTH = 0.35

function drawnBallRadius(radiusInHorizonRadii: number): number {
  return Math.max(HORIZON_DRAWN_RADIUS * (1 + BALL_GROWTH * Math.log10(radiusInHorizonRadii)), 3)
}

// This experiment's two prediction questions, per its specification's "Prediction Activity". Choices are
// not scored here; they are compared with the model's results later.
type SunRadiusChoice = 'earth-size' | 'thirty-km' | 'three-km'
const sunRadiusChoices: Array<{ value: SunRadiusChoice; label: string }> = [
  { value: 'earth-size', label: 'About 6,000 kilometers, the size of Earth' },
  { value: 'thirty-km', label: 'About 30 kilometers' },
  { value: 'three-km', label: 'About 3 kilometers, a few city blocks' },
]

type MassScalingChoice = 'ten' | 'thousand' | 'million'
const massScalingChoices: Array<{ value: MassScalingChoice; label: string }> = [
  { value: 'ten', label: 'About 10 times wider' },
  { value: 'thousand', label: 'About 1,000 times wider' },
  { value: 'million', label: 'About a million times wider' },
]

const MARKER_COLOR = '#facc15'
const BLACK_HOLE_COLOR = '#e879f9'
const HORIZON_COLOR = '#fb7185'

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A length in plain units, from millimeters to trillions of kilometers.
function formatLength(km: number): string {
  if (km < 1e-3) return `${formatNumber(km * 1e6)} mm`
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

function formatMass(solarMasses: number): string {
  if (solarMasses < 1e-3) return `${(solarMasses * 1e6).toFixed(0)} millionths of a solar mass`
  if (solarMasses === 1) return '1 solar mass'
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

function decadeLabel(exponent: number): string {
  const km = 10 ** exponent
  return formatLength(km)
}

export function BlackHoleSizeExperiment({ onComplete, onTutorComplete }: BlackHoleSizeExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('sun')
  const preset = OBJECT_PRESETS.find((p) => p.id === presetId)!
  const horizonKm = horizonRadiusKm(preset.massSolarMasses)
  const startKm = preset.realRadiusKm ?? horizonKm * 100
  const minKm = horizonKm * MIN_RADIUS_IN_HORIZON_RADII

  const [chosenRadiusKm, setChosenRadiusKm] = useState(horizonKm * 10)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [sunRadiusPrediction, setSunRadiusPrediction] = useState<SunRadiusChoice | null>(null)
  const [massScalingPrediction, setMassScalingPrediction] = useState<MassScalingChoice | null>(null)
  const [submittedSunRadiusPrediction, setSubmittedSunRadiusPrediction] = useState<SunRadiusChoice | null>(null)
  const [submittedMassScalingPrediction, setSubmittedMassScalingPrediction] =
    useState<MassScalingChoice | null>(null)

  const hasPrediction = sunRadiusPrediction !== null && massScalingPrediction !== null
  const hasSubmittedPrediction =
    submittedSunRadiusPrediction !== null && submittedMassScalingPrediction !== null

  const result = runBlackHoleSizeExperiment(presetId, chosenRadiusKm)

  const handlePresetChange = (id: ObjectPreset['id']) => {
    const next = OBJECT_PRESETS.find((p) => p.id === id)!
    const nextHorizon = horizonRadiusKm(next.massSolarMasses)
    setPresetId(id)
    setChosenRadiusKm(nextHorizon * 10)
    setStatus('idle')
    setProgress(0)
  }

  const handleRadiusChange = (radiusKm: number) => {
    setChosenRadiusKm(radiusKm)
    setStatus('idle')
    setProgress(0)
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedSunRadiusPrediction(sunRadiusPrediction)
      setSubmittedMassScalingPrediction(massScalingPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's precedent: re-opens both questions for editing without resetting
  // the chosen object or radius.
  const handleChangePrediction = () => {
    setSubmittedSunRadiusPrediction(null)
    setSubmittedMassScalingPrediction(null)
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

  // The marker's radius: at the start before a run, following the model's own squeeze curve during it,
  // and at the chosen radius once it is complete.
  const curveIndex = Math.round(progress * (result.curve.length - 1))
  const markerRadiusKm = status === 'idle' ? result.startRadiusKm : result.curve[curveIndex].radiusKm
  const markerIsBlackHole = markerRadiusKm <= horizonKm

  // A logarithmic axis from the start radius (right) down to 0.1 of the horizon radius (left), so a
  // squeeze moves the marker to the left.
  const logMin = Math.log10(minKm)
  const logMax = Math.log10(startKm)
  const xFor = (km: number) =>
    AXIS_LEFT + ((Math.log10(km) - logMin) / (logMax - logMin)) * (AXIS_RIGHT - AXIS_LEFT)

  const horizonX = xFor(horizonKm)
  const markerX = xFor(markerRadiusKm)
  const chosenX = xFor(chosenRadiusKm)
  const markerLabelX = Math.min(Math.max(markerX, AXIS_LEFT + 80), AXIS_RIGHT - 80)

  const firstDecade = Math.ceil(logMin - 1e-9)
  const lastDecade = Math.floor(logMax + 1e-9)
  const decades: number[] = []
  for (let k = firstDecade; k <= lastDecade; k++) decades.push(k)

  const visibleLandmarks = LANDMARKS.filter((l) => l.km >= minKm && l.km <= startKm * 1.0000001)

  const squeezePresets = [
    { label: preset.realRadiusKm === null ? 'Hypothetical start' : 'Real size', radiusKm: startKm },
    { label: '10 times the horizon radius', radiusKm: horizonKm * 10 },
    { label: 'Exactly the horizon radius', radiusKm: horizonKm },
    { label: 'Half the horizon radius', radiusKm: horizonKm * 0.5 },
  ]
  const isPresetSelected = (radiusKm: number) => Math.abs(Math.log(radiusKm / chosenRadiusKm)) < 1e-9

  // Values for the Results panel.
  const kmPerSolarMass = horizonRadiusKm(1)
  const sunPredictionRight = submittedSunRadiusPrediction === 'three-km'
  const scalingPredictionRight = submittedMassScalingPrediction === 'thousand'
  const showResults = status === 'complete' && hasSubmittedPrediction

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 1 — How Small Must Something Be to Become a Black Hole?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Gravity and Curved Spacetime, Experiment 7, you saw that when a
            mass is concentrated enough, even light cannot escape it, and that is a black hole. But that
            experiment used made-up amounts. Here we use real objects and real numbers, and ask: how small
            would a real object, such as the Earth or the Sun, have to be squeezed to become a black hole?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You pick an object, then imagine squeezing all of its mass into a
            smaller and smaller ball. As the ball shrinks, the experiment compares its size with a critical
            size. Two pictures show the squeeze: a ruler of sizes, and a drawing of the ball.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> The <strong>radius</strong> of a ball is the distance
            from its middle to its surface. The <strong>horizon radius</strong> is the critical size for an
            object's mass: if all of the mass is squeezed into a ball with that radius or smaller, the object
            is a black hole. Every mass has its own horizon radius. In Gravity and Curved Spacetime, Experiment 7,
            you found this same critical size using ordinary gravity. The exact theory, general relativity,
            gives the same radius. A <strong>solar mass</strong> is the mass
            of our Sun, and we measure masses in solar masses (as in Cosmology, Experiment 4). Some of the
            sizes here are very large, so we also use the <strong>astronomical unit</strong> (AU): the
            distance from the Earth to the Sun, about 150 million kilometers.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What is a black hole?</strong> A black hole is a region of space where gravity is so
            strong that nothing that gets close enough can ever leave it, not even light. Its edge is called
            the <strong>horizon</strong>, and the horizon radius is the distance from the middle to that edge.
            The horizon is not a solid surface or a wall. It is a one-way boundary: anything can cross it
            going in, and nothing, not even light, can come back out. Because no light comes out, a black
            hole cannot be seen directly. We find them by its gravity's effect on things nearby, in two
            main ways. First, stars near it are pulled into orbit around it. By tracking how fast a star
            circles and how big its orbit is, astronomers can work out how much mass it is circling, the
            same method Cosmology Experiment 4 used. At the center of our galaxy, stars circle at great
            speed around a point where we can see nothing, and the speeds need about 4.3 million Suns' worth
            of mass in a tiny space. Second, gas that falls toward a black hole speeds up and is squeezed
            until it is so hot that it glows brightly. That glow comes from the gas just outside the
            horizon. The black hole itself gives off no light.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            A black hole is also not a vacuum cleaner. Far from it, its pull is the same as that of any other
            object with the same mass. If the Sun were replaced by a black hole with exactly the Sun's mass,
            the Earth would keep orbiting just as it does now. A black hole is special only very close to it,
            and this experiment is about how close "very close" is.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How are black holes formed?</strong> A star stays the size it is because two things
            balance. Gravity pulls all of its material inward. The heat and pressure from the nuclear
            reactions in its core push outward. A comparison: a balloon keeps its size because the air inside
            pushes out and the rubber pulls in. If the air leaks out, the balloon shrinks.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            When a star runs out of fuel, the push outward weakens and gravity wins. The core collapses
            inward, and the outer layers are blown off in an explosion. What is left behind depends on how
            much mass the core has. A small core stops collapsing as a white dwarf. A bigger one is squeezed
            into a neutron star, where the material is packed so tightly that it can resist further squeezing.
            But for a star many times more massive than the Sun, the core left behind is heavier than anything
            that can resist, and nothing stops the collapse. The core keeps shrinking until its whole mass is
            inside its horizon radius. At that point it is a black hole. This is exactly the squeeze you will
            try in this experiment: the experiment lets you choose the final size, and asks whether it is
            small enough.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            Black holes with millions or billions of times the Sun's mass, like Sagittarius A* and M87*, are
            found at the centers of galaxies. How they grew so large is still an open question in science. Some
            of their growth comes from swallowing gas and stars and from merging with other black holes, but
            exactly how the first ones got so big so quickly is not settled.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The objects.</strong> You can choose Earth, the Sun, a neutron star (the tiny, extremely
            dense core left behind when a large star dies), a stellar black hole (one with a mass of a few
            Suns), Sagittarius A* (the black hole at the center of our galaxy), and M87* (the black hole
            imaged in the galaxy M87). The three black holes are already inside their own horizons, so there
            is no real size to squeeze them from. For those three, the squeeze starts from an invented
            "hypothetical" ball 100 times as wide as the horizon radius. It is labeled hypothetical wherever
            it appears.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> Earlier experiments said that gravity's strangest effects
            are tiny for everyday objects and large only near very compact ones. This is a way to put numbers
            on that: how far from the threshold is each real object? And how does the threshold depend on
            how much mass there is? The answers set the scale for everything else about black holes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to read more?</strong> After you have made your predictions and run the experiment
            once, an optional guide to black holes appears below the Results. It explains what they
            are, how they form, how we know they exist, and what scientists have found recently. It is held
            back until then so that it does not give away the answers to the predictions.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make two predictions. Then choose an object, choose a radius to
            squeeze it to, and run it. Try other objects and radii too, and compare.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Where the horizon radius falls on the ruler compared with the
            object's real size, and what changes when the ball is squeezed past it.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>This is a thought experiment.</strong> It does not say how a real object could be
              squeezed, or what force would do it. Real stars that are massive enough do collapse on their
              own, but that process is not modeled.
            </li>
            <li>
              <strong>What happens inside the horizon is not modeled.</strong> The horizon is where this
              experiment's story stops.
            </li>
            <li>
              <strong>The formula for the horizon radius is given, not derived.</strong> Deriving it needs
              Einstein's equations, which are outside this project. It is exact for the simplest kind of black
              hole: one that does not spin and has no electric charge. Real black holes usually spin, and a
              spinning one has a different, more complicated horizon.
            </li>
            <li>
              All of the mass is treated as being inside the ball, at rest, with none lost along the way. The
              ball does not spin.
            </li>
            <li>
              The real sizes of Earth, the Sun and the neutron star are rounded values, used only as the
              starting points of the squeeze. A neutron star's size is not settled exactly, so the value used
              is a round figure inside the range found by observations. The "stellar black hole" mass is an
              illustrative round value, not a particular object.
            </li>
            <li>
              The "radius" is measured as it would be around the object, and the experiment does not discuss
              how it differs from a distance measured straight inward. The exact theory distinguishes them, and
              a later experiment may return to it.
            </li>
            <li>
              The three black holes are named for their real masses only. The experiment does not describe
              the glowing gas around them or the images made of them.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            To turn the Sun into a black hole, you would have to squeeze all of its mass into a ball of what
            radius?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {sunRadiusChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setSunRadiusPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${sunRadiusPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A black hole has 1,000 times the mass of another black hole. How much wider is its horizon?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {massScalingChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setMassScalingPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${massScalingPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  sunRadiusChoices.find((c) => c.value === (sunRadiusPrediction ?? submittedSunRadiusPrediction))!
                    .label
                }; ${
                  massScalingChoices.find(
                    (c) => c.value === (massScalingPrediction ?? submittedMassScalingPrediction),
                  )!.label
                }`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many objects and radii as you like
              below. Or, change your predictions and start over:
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
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Object:</p>
          {OBJECT_PRESETS.map((p) => (
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
            Squeeze the whole mass into a ball of radius:
          </p>
          {squeezePresets.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handleRadiusChange(s.radiusKm)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${isPresetSelected(s.radiusKm) ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {s.label}
            </button>
          ))}
          <div style={{ marginTop: '0.5rem' }}>
            <label htmlFor="black-hole-size-radius" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Radius: {formatLength(chosenRadiusKm)} ({formatNumber(result.chosenInHorizonRadii)} horizon radii)
            </label>
            <input
              id="black-hole-size-radius"
              type="range"
              min={logMin}
              max={logMax}
              step={0.005}
              value={Math.log10(chosenRadiusKm)}
              disabled={!hasPrediction || status === 'running'}
              onChange={(event) => handleRadiusChange(10 ** Number(event.target.value))}
              style={{ width: '100%' }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              The slider is logarithmic: each step to the left makes the radius a fixed number of times smaller.
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
          {status === 'running' ? 'Squeezing...' : 'Run'}
        </button>

        {!hasPrediction && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer the predictions above to try the controls.
          </p>
        )}

        {status !== 'idle' && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {preset.label}: {formatMass(preset.massSolarMasses)}
            <br />
            Current radius: {formatLength(markerRadiusKm)}
            &nbsp;|&nbsp; Horizon radius: {formatLength(horizonKm)}
            <br />
            Radius in horizon radii: {formatNumber(markerRadiusKm / horizonKm)} &nbsp;|&nbsp;{' '}
            {markerIsBlackHole ? 'It is a black hole.' : 'It is not a black hole.'}
          </p>
        )}

        {hasSubmittedPrediction && (
          <>
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
            Picture 1: the ruler
          </text>
          {/* Inside the horizon: a distinct shaded region to the left of the horizon line */}
          <rect
            x={AXIS_LEFT}
            y={REGION_TOP}
            width={Math.max(horizonX - AXIS_LEFT, 0)}
            height={REGION_BOTTOM - REGION_TOP}
            fill="rgba(251, 113, 133, 0.16)"
          />
          <line x1={AXIS_LEFT} y1={REGION_BOTTOM + 6} x2={horizonX} y2={REGION_BOTTOM + 6} stroke={HORIZON_COLOR} strokeWidth={2} />
          <text x={AXIS_LEFT} y={REGION_BOTTOM + 22} fill={HORIZON_COLOR} fontSize="12">
            Inside the horizon: a black hole
          </text>

          {/* The axis and its decade ticks */}
          <line x1={AXIS_LEFT} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} stroke="#94a3b8" strokeWidth={2} />
          {decades.map((k) => (
            <g key={k}>
              <line x1={xFor(10 ** k)} y1={AXIS_Y - 5} x2={xFor(10 ** k)} y2={AXIS_Y + 5} stroke="#94a3b8" />
              <text x={xFor(10 ** k)} y={AXIS_Y + 20} fill="#94a3b8" fontSize="10" textAnchor="middle">
                {decadeLabel(k)}
              </text>
            </g>
          ))}

          {/* Fixed landmarks for scale, only those inside this range */}
          {visibleLandmarks.map((l, index) => {
            const x = xFor(l.km)
            const labelY = AXIS_Y - 22 - (index % 3) * 20
            return (
              <g key={l.label}>
                <line x1={x} y1={AXIS_Y} x2={x} y2={labelY + 4} stroke="#64748b" strokeDasharray="2 3" />
                <circle cx={x} cy={AXIS_Y} r={3} fill="#64748b" />
                <text
                  x={x > AXIS_RIGHT - 70 ? x + 4 : x < AXIS_LEFT + 70 ? x - 4 : x}
                  y={labelY}
                  fill="#cbd5e1"
                  fontSize="10"
                  textAnchor={x > AXIS_RIGHT - 70 ? 'end' : x < AXIS_LEFT + 70 ? 'start' : 'middle'}
                >
                  {l.label}
                </text>
              </g>
            )
          })}

          {/* The horizon line */}
          <line x1={horizonX} y1={REGION_TOP} x2={horizonX} y2={REGION_BOTTOM} stroke={HORIZON_COLOR} strokeWidth={2} />
          <text x={horizonX + 6} y={REGION_BOTTOM - 8} fill={HORIZON_COLOR} fontSize="12">
            Horizon radius: {formatLength(horizonKm)}
          </text>

          {/* Where the learner chose to squeeze to, until the run reaches it */}
          {status !== 'complete' && (
            <g>
              <circle cx={chosenX} cy={AXIS_Y} r={9} fill="none" stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={chosenX} y={AXIS_Y + 42} fill="#e2e8f0" fontSize="10" textAnchor="middle">
                your chosen radius
              </text>
            </g>
          )}

          {/* The object's radius */}
          <line x1={markerX} y1={AXIS_Y} x2={markerX} y2={REGION_TOP - 6} stroke={markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR} />
          <circle cx={markerX} cy={AXIS_Y} r={7} fill={markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR} />
          <text
            x={markerLabelX}
            y={REGION_TOP - 24}
            fill={markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR}
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            {result.preset.label} radius: {formatLength(markerRadiusKm)}
          </text>
          <text
            x={markerLabelX}
            y={REGION_TOP - 10}
            fill={markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR}
            fontSize="11"
            textAnchor="middle"
          >
            {markerIsBlackHole ? 'a black hole' : preset.realRadiusKm === null && status === 'idle' ? 'hypothetical start' : 'not a black hole'}
          </text>
        </svg>

        {/* A drawing of the ball itself, beside the ruler's position for it */}
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${BALL_VIEW_HEIGHT}`}
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
          <text x={20} y={26} fill="#e2e8f0" fontSize="12" fontWeight="bold">
            Picture 2: the ball (the object squeezed to this radius)
          </text>
          <circle cx={BALL_CENTER_X} cy={BALL_CENTER_Y} r={drawnBallRadius(markerRadiusKm / horizonKm)}
            fill={markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR}
            fillOpacity={markerIsBlackHole ? 0.9 : 0.55}
            stroke={markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR}
            strokeWidth={2}
          />
          <circle cx={BALL_CENTER_X} cy={BALL_CENTER_Y} r={HORIZON_DRAWN_RADIUS} fill="none" stroke={HORIZON_COLOR} strokeWidth={2} strokeDasharray="5 4" />
          <circle cx={30} cy={56} r={7} fill={markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR} fillOpacity={0.7} />
          <text x={46} y={60} fill={markerIsBlackHole ? BLACK_HOLE_COLOR : MARKER_COLOR} fontSize="12">
            The ball: radius {formatLength(markerRadiusKm)}
          </text>
          <circle cx={30} cy={82} r={7} fill="none" stroke={HORIZON_COLOR} strokeWidth={2} strokeDasharray="3 2" />
          <text x={46} y={86} fill={HORIZON_COLOR} fontSize="12">
            Red circle: horizon radius, {formatLength(horizonKm)}
          </text>
          <text x={20} y={BALL_VIEW_HEIGHT - 16} fill="#94a3b8" fontSize="11">
            {markerIsBlackHole
              ? 'The ball is at or inside the red circle: a black hole.'
              : 'The ball is bigger than the red circle: not a black hole.'}
          </text>
        </svg>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
            <strong>How to read these diagrams.</strong> Imagine taking all of an object's mass and squeezing
            it into a smaller and smaller ball. The size of the ball is measured by its{' '}
            <strong>radius</strong>: the distance from the middle of the ball to its surface. The two
            pictures above show the same squeeze in two different ways. Picture 1 (the ruler) tells you the
            exact size. Picture 2 (the ball) lets you see the ball.
          </p>

          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>Picture 1, the ruler (the top picture)</strong>
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The line across the middle is a ruler for the radius.</strong> Each place on the ruler
              stands for a ball of a certain size: the further right, the bigger the ball, and the further
              left, the smaller the ball. For example, a spot marked 10 km means a ball with a radius of
              10 km.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Each tick on the ruler is 10 times bigger than the one before it.</strong> For example,
              the ticks might read 1 km, 10 km, 100 km, 1,000 km. This is called a logarithmic ruler. We use
              it because the sizes here are very different from each other: a coin and the distance from
              Earth to the Sun are far too different to fit on an ordinary ruler, where everything small would
              shrink to a dot. On this ruler, going from 1 km to 10 km takes the same space as going from
              10 km to 100 km, even though the second step is ten times longer.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The yellow dot shows the ball's radius right now.</strong> The dot is always the same
              size. Only its position changes, and its position on the ruler is the ball's radius. Before
              you press Run, it sits at the right end, the starting size. For Earth, the Sun and the neutron
              star that is the object's real size. The three black holes have no real size to start from, so
              the picture starts them from a made-up (hypothetical) ball 100 times wider than their horizon
              radius (see the next point). When you press Run, the dot slides to the left, which is the
              squeezing, and stops at the dashed circle, the radius you chose.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The red line is the horizon radius: the critical size.</strong> If the ball is bigger
              than this, the object is not a black hole. If the ball is squeezed down to this size or
              smaller, it is a black hole: its pull is so strong that nothing, not even light, can get out.
              The shaded area to the left of the red line is the "inside the horizon" zone. When the dot
              reaches the line or crosses into the shaded area, it turns pink and the label changes to "a
              black hole".
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The gray dots are everyday objects to compare with.</strong> They are there so that the
              numbers mean something. For example, if the dot is to the left of the "small city (10 km)" dot,
              the ball is smaller than a small city. Their positions are fixed and they are not results. Only
              the ones that fit on the current ruler are shown.
            </li>
          </ol>

          <p style={{ marginTop: '0.6rem', marginBottom: '0.3rem' }}>
            <strong>Picture 2, the ball (the bottom picture)</strong>
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The yellow circle is the ball itself.</strong> It is the object with all of its mass
              squeezed into a ball of the radius shown in the legend. Press Run and you will see the circle
              shrink, in step with the dot sliding left in Picture 1.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>The red dashed circle is the horizon radius.</strong> It is the same critical size as
              the red line in Picture 1, drawn as a circle so you can compare it with the ball. It never
              changes size.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>Compare the two circles.</strong> While the yellow circle is bigger than the red one,
              the object is not a black hole. When it shrinks to the red circle and then fits inside it, it
              turns pink: the ball is now a black hole. The sentence at the bottom of the picture says which
              of the two cases you are looking at.
            </li>
            <li style={{ marginBottom: '0.4rem' }}>
              <strong>This picture is not to scale.</strong> Real sizes differ by billions of times, and
              nothing that different can be drawn on one screen, so the drawing grows much more slowly than
              the real size. You can trust only the comparison: bigger than the red circle, the same, or
              smaller. Picture 1 tells you by how much.
            </li>
          </ol>

          <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
            <strong>What to look for:</strong> where the red line sits compared with the starting size in
            Picture 1, and how that changes when you pick a different object. Then press Run and watch what
            happens, in both pictures, as the squeeze passes the horizon.
          </p>
        </div>
        {showResults && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You squeezed <strong>{preset.label}</strong> ({formatMass(preset.massSolarMasses)}) into a ball of
              radius <strong>{formatLength(result.chosenRadiusKm)}</strong>. For this object:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <tbody>
                  {[
                    ['Its horizon radius', formatLength(result.horizonRadiusKm)],
                    [
                      'The squeeze needed from its real size',
                      result.squeezeNeeded === null
                        ? 'Not applicable: it is already a black hole, so it has no real size to squeeze from. The start in the pictures was a hypothetical ball.'
                        : `${formatNumber(result.squeezeNeeded)} times smaller (from ${formatLength(preset.realRadiusKm!)} to ${formatLength(result.horizonRadiusKm)})`,
                    ],
                    [
                      'The ball you chose, in horizon radii',
                      `${formatNumber(result.chosenInHorizonRadii)} (${result.chosenInHorizonRadii > 1 ? 'bigger than' : result.chosenInHorizonRadii === 1 ? 'exactly' : 'smaller than'} its horizon radius)`,
                    ],
                    ['Is it a black hole?', result.becomesBlackHole ? 'Yes: all of the mass is at or inside its horizon radius.' : 'No: the ball is still bigger than its horizon radius.'],
                    [
                      'Ordinary-gravity escape speed at that radius',
                      `${formatNumber(result.escapeSpeedFractionOfLight)} times the speed of light`,
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
              <strong>Checking your first prediction:</strong> asked what radius the Sun would have to be
              squeezed to, you answered "{sunRadiusChoices.find((c) => c.value === submittedSunRadiusPrediction)!.label}".
              The Sun's horizon radius is about {formatLength(kmPerSolarMass)}.{' '}
              {sunPredictionRight
                ? 'So your prediction was right.'
                : submittedSunRadiusPrediction === 'thirty-km'
                  ? 'So your prediction was off this time. About 30 kilometers is the horizon radius of a black hole with 10 Suns\' worth of mass, ten times the Sun\'s.'
                  : 'So your prediction was off this time. A ball the size of Earth is more than 2,000 times too big: the Sun would have to be squeezed far smaller than that.'}
            </p>
            <p>
              <strong>Checking your second prediction:</strong> asked how much wider the horizon of a black hole
              with 1,000 times the mass would be, you answered "
              {massScalingChoices.find((c) => c.value === submittedMassScalingPrediction)!.label}". It is exactly
              1,000 times wider.{' '}
              {scalingPredictionRight
                ? 'So your prediction was right.'
                : 'So your prediction was off this time. The horizon radius is directly proportional to the mass: 1,000 times the mass gives 1,000 times the radius, not 10 times and not a million times.'}
            </p>

            <p style={{ marginBottom: '0.25rem' }}>
              <strong>The simple math.</strong> The horizon radius is <strong>r = 2GM / c²</strong>, where G is
              the gravitational constant, M is the mass and c is the speed of light. You do not need to
              calculate it yourself: it works out to about {formatNumber(kmPerSolarMass)} kilometers for every
              solar mass. So:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
              <li>1 solar mass (the Sun): 1 × {formatNumber(kmPerSolarMass)} km ≈ {formatLength(horizonRadiusKm(1))}, about 3 km.</li>
              <li>10 solar masses: 10 × {formatNumber(kmPerSolarMass)} km ≈ {formatLength(horizonRadiusKm(10))}, about 30 km.</li>
              <li>1,000 solar masses: 1,000 × {formatNumber(kmPerSolarMass)} km ≈ {formatLength(horizonRadiusKm(1000))}.</li>
              <li>
                Your object, {preset.label}: {formatNumber(preset.massSolarMasses)} × {formatNumber(kmPerSolarMass)}{' '}
                km ≈ {formatLength(result.horizonRadiusKm)}.
              </li>
            </ul>
            <p>
              Each time the mass is multiplied by some number, the horizon radius is multiplied by the same
              number. Real objects are very far from this limit, which is why the strange effects of gravity
              from the earlier chapters were so small for everyday objects. The Sun would have to shrink about{' '}
              {formatNumber(695_700 / kmPerSolarMass)} times. Earth would have to shrink from 6,371 km to under a
              centimeter. A neutron star, though, is only about {formatNumber(12 / horizonRadiusKm(1.4))} times too
              big, which is why it is the closest thing to a black hole that is not one.
            </p>

            <p>
              <strong>A comparison from daily life.</strong> Your weight depends on two things: how much mass the
              planet has, and how far you are from its center. Suppose the Earth were squeezed to half its
              radius with the same mass. You would then be half as far from the center, and you would weigh
              four times as much. Squeezing a mass smaller makes the pull at its surface stronger, and a black
              hole is what you get when the squeeze goes far enough. This is an analogy to show why squeezing
              matters, not the same calculation.
            </p>

            <p>
              <strong>The link to Gravity and Curved Spacetime, Experiment 7.</strong> That experiment asked for
              the mass at which the escape speed reaches the speed of light. The last row of the table above is
              that same idea in real units, using ordinary gravity: it reaches exactly 1, the speed of light, at
              the horizon radius, and is above 1 inside it. Above 1 does not mean anything travels faster than
              light. It means nothing can escape. The exact theory, general relativity, gives the same radius,
              and adds what the horizon really is: a one-way boundary, not a surface. You can cross it going in,
              and nothing, not even light, can come back out.
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
                <strong>What this model can and cannot tell you.</strong> This is a thought experiment. It does
                not say how a real object could be squeezed, what force would do it, or what stops it. It does
                not say anything about what happens inside the horizon.
              </p>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                The formula is given, not derived, and it is for the simplest kind of black hole: one that does
                not spin and has no electric charge. Real black holes usually spin, and a spinning one has a
                different, more complicated horizon. The real sizes of Earth, the Sun and the neutron star are
                rounded values, and the neutron star's size is not settled exactly. The stellar black hole's mass
                of 10 Suns is an illustrative round value, and the starting ball for the three black holes was
                hypothetical, not a real size.
              </p>
            </div>
          </div>
        )}
        <BlackHoleGuide />
          </>
        )}
      </div>

      {status === 'complete' && submittedSunRadiusPrediction && submittedMassScalingPrediction && (
        <BlackHoleSizeTutor
          key={runCount}
          predictedSunRadius={submittedSunRadiusPrediction}
          predictedMassScaling={submittedMassScalingPrediction}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
