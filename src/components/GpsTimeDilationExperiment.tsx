import { useState } from 'react'
import {
  CROSSOVER_ORBITAL_RADIUS_METERS,
  EARTH_RADIUS_METERS,
  runGpsTimeDilationExperiment,
} from '../physics/gpsTimeDilationExperiment'
import type { GpsTimeDilationResult } from '../physics/gpsTimeDilationExperiment'
import { GpsTimeDilationTutor } from './GpsTimeDilationTutor'

interface GpsTimeDilationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const MIN_ALTITUDE_KM = 300
const MAX_ALTITUDE_KM = 36_000
const ISS_ALTITUDE_KM = 400
const GPS_ALTITUDE_KM = 20_200
const GEOSTATIONARY_ALTITUDE_KM = 35_786
const CROSSOVER_ALTITUDE_KM = (CROSSOVER_ORBITAL_RADIUS_METERS - EARTH_RADIUS_METERS) / 1000

const VIEW_SIZE = 300
const VIEW_CENTER = VIEW_SIZE / 2
const EARTH_VIEW_RADIUS = 40
const SATELLITE_DOT_RADIUS = 4
// Square-root scale so the diagram stays legible across the 300 km-36,000 km range without the
// satellite point sitting on top of Earth at low altitudes. Sized so the satellite point at
// MAX_ALTITUDE_KM stays fully inside the view box, with a small margin, rather than running off
// the top edge (previously it could land off-canvas at high altitudes, e.g. Geostationary).
const ORBIT_VIEW_SCALE =
  (VIEW_CENTER - EARTH_VIEW_RADIUS - SATELLITE_DOT_RADIUS * 2) / Math.sqrt(MAX_ALTITUDE_KM)

type MoreLessSameChoice = 'more' | 'less' | 'same'
type YesNoChoice = 'yes' | 'no'
type ExperimentStatus = 'idle' | 'complete'

function orbitViewRadius(altitudeKm: number): number {
  return EARTH_VIEW_RADIUS + ORBIT_VIEW_SCALE * Math.sqrt(altitudeKm)
}

function altitudeToRadiusMeters(altitudeKm: number): number {
  return EARTH_RADIUS_METERS + altitudeKm * 1000
}

function formatAltitude(altitudeKm: number): string {
  return `${Math.round(altitudeKm).toLocaleString()} km`
}

function formatSpeed(metersPerSecond: number): string {
  return `${(metersPerSecond / 1000).toFixed(3)} km/s`
}

function formatMicrosecondsPerDay(fraction: number): string {
  const microsecondsPerDay = fraction * 86400 * 1_000_000
  const sign = microsecondsPerDay > 0 ? '+' : ''
  return `${sign}${microsecondsPerDay.toFixed(1)} µs/day`
}

function moreLessSameLabel(choice: MoreLessSameChoice): string {
  return choice === 'more' ? 'more' : choice === 'less' ? 'less' : 'about the same'
}

function fasterSlowerSameLabel(choice: MoreLessSameChoice): string {
  return choice === 'more' ? 'faster' : choice === 'less' ? 'slower' : 'the same rate'
}

function MoreLessSameQuestion({
  prompt,
  moreLabel,
  lessLabel,
  sameLabel,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  prompt: string
  moreLabel: string
  lessLabel: string
  sameLabel: string
  selected: MoreLessSameChoice | null
  submitted: MoreLessSameChoice | null
  onSelect: (choice: MoreLessSameChoice) => void
  disabled: boolean
}) {
  const choices: Array<{ value: MoreLessSameChoice; label: string }> = [
    { value: 'more', label: moreLabel },
    { value: 'less', label: lessLabel },
    { value: 'same', label: sameLabel },
  ]
  const labelFor = (choice: MoreLessSameChoice) =>
    choices.find((c) => c.value === choice)!.label.toLowerCase()

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {choices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected
          ? `Your prediction: ${labelFor(selected)}`
          : submitted
            ? `Your prediction: ${labelFor(submitted)}`
            : 'Choose an option to continue'}
      </p>
    </div>
  )
}

function YesNoQuestion({
  prompt,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  prompt: string
  selected: YesNoChoice | null
  submitted: YesNoChoice | null
  onSelect: (choice: YesNoChoice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {(['yes', 'no'] as YesNoChoice[]).map((choice) => (
          <button
            key={choice}
            onClick={() => onSelect(choice)}
            disabled={disabled}
            className={`toggle-button${selected === choice ? ' is-selected' : ''}`}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {choice === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected
          ? `Your prediction: ${selected === 'yes' ? 'Yes' : 'No'}`
          : submitted
            ? `Your prediction: ${submitted === 'yes' ? 'Yes' : 'No'}`
            : 'Choose an option to continue'}
      </p>
    </div>
  )
}

export function GpsTimeDilationExperiment({ onComplete, onTutorComplete }: GpsTimeDilationExperimentProps) {
  const [altitudeKm, setAltitudeKm] = useState(GPS_ALTITUDE_KM)
  const [status, setStatus] = useState<ExperimentStatus>('idle')
  const [confirmedResult, setConfirmedResult] = useState<GpsTimeDilationResult | null>(null)
  const [confirmedAltitudeKm, setConfirmedAltitudeKm] = useState(GPS_ALTITUDE_KM)
  const [runCount, setRunCount] = useState(0)
  const [explanationReached, setExplanationReached] = useState(false)

  const [speedEffectPrediction, setSpeedEffectPrediction] = useState<MoreLessSameChoice | null>(null)
  const [crossoverPrediction, setCrossoverPrediction] = useState<YesNoChoice | null>(null)
  const [gpsPrediction, setGpsPrediction] = useState<MoreLessSameChoice | null>(null)
  const [submittedSpeedEffectPrediction, setSubmittedSpeedEffectPrediction] =
    useState<MoreLessSameChoice | null>(null)
  const [submittedCrossoverPrediction, setSubmittedCrossoverPrediction] = useState<YesNoChoice | null>(null)
  const [submittedGpsPrediction, setSubmittedGpsPrediction] = useState<MoreLessSameChoice | null>(null)

  const hasAllPredictions =
    speedEffectPrediction !== null && crossoverPrediction !== null && gpsPrediction !== null
  const hasSubmittedPredictions = submittedSpeedEffectPrediction !== null

  const liveResult = runGpsTimeDilationExperiment(altitudeToRadiusMeters(altitudeKm))

  const handleShowResults = () => {
    if (!hasAllPredictions) return
    if (!hasSubmittedPredictions) {
      setSubmittedSpeedEffectPrediction(speedEffectPrediction)
      setSubmittedCrossoverPrediction(crossoverPrediction)
      setSubmittedGpsPrediction(gpsPrediction)
    }
    setConfirmedResult(liveResult)
    setConfirmedAltitudeKm(altitudeKm)
    setStatus('complete')
    setExplanationReached(false)
    setRunCount((count) => count + 1)
    onComplete?.()
  }

  // Re-opens the three prediction questions for editing (keeping the learner's current choices
  // visible) and clears the results/tutor, which are gated on the submitted predictions.
  const handleChangePredictions = () => {
    setSubmittedSpeedEffectPrediction(null)
    setSubmittedCrossoverPrediction(null)
    setSubmittedGpsPrediction(null)
    setStatus('idle')
    setConfirmedResult(null)
    setExplanationReached(false)
  }

  const satelliteViewRadius = orbitViewRadius(altitudeKm)
  const satelliteX = VIEW_CENTER
  const satelliteY = VIEW_CENTER - satelliteViewRadius
  const crossoverViewRadius = orbitViewRadius(CROSSOVER_ALTITUDE_KM)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 9 — Real Clocks in Orbit (GPS and the Balance of Two Effects)</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> A GPS satellite's clock has to be extremely accurate —
            a tiny error becomes a real position error on the ground. But a satellite's clock
            experiences relativity two ways at once: Experiments 3–4 showed that motion slows a
            clock down; Experiment 2 showed that being higher in a gravitational field speeds a
            clock up. Which one wins for a real satellite?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> Think of a swimmer caught between a downstream
            current and a headwind blowing the opposite way — which direction they actually end up
            drifting depends on which push is stronger at that particular moment. A GPS satellite's
            clock is caught in exactly this kind of tug-of-war, between the two relativistic effects
            you've already met separately, in Experiments 2 and 3/4.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You'll choose an orbital altitude. From that one
            number, we calculate the satellite's real orbital speed (as in Experiment 6), and
            from that, both relativistic effects on its clock — using real Earth numbers, not
            exaggerated ones.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Try different altitudes — including the real GPS altitude
            — and see which effect wins, and by how much.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              Both effects use the same first-order approximation as Experiments 2 and 3/4 —
              accurate to extremely high precision for a real satellite, but not the exact
              general-relativistic formula.
            </li>
            <li>
              The orbit is treated as exactly circular, Earth as a perfect non-rotating sphere,
              and a few smaller real GPS corrections (Earth's rotation, orbital eccentricity, and
              others) are left out entirely.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>One more thing.</strong> This is the last experiment in this two-chapter
            journey. Once you've run it, scroll down to "Putting It All Together" below — it
            steps back and explains, in full, what the two theories behind everything you've
            explored (special relativity and general relativity) actually claim, using only what
            you've already seen for yourself.
          </p>
        </div>

        <MoreLessSameQuestion
          prompt="A satellite orbiting higher up moves slower than one orbiting lower down (as in Experiment 6). As altitude increases, does the speed-based slowing effect on the satellite's clock get stronger, weaker, or stay the same?"
          moreLabel="More"
          lessLabel="Less"
          sameLabel="About the same"
          selected={speedEffectPrediction}
          submitted={submittedSpeedEffectPrediction}
          onSelect={setSpeedEffectPrediction}
          disabled={hasSubmittedPredictions}
        />
        <YesNoQuestion
          prompt="Do you think there's a specific altitude where the speed effect and the gravity effect exactly cancel, so the satellite clock matches a ground clock?"
          selected={crossoverPrediction}
          submitted={submittedCrossoverPrediction}
          onSelect={setCrossoverPrediction}
          disabled={hasSubmittedPredictions}
        />
        <MoreLessSameQuestion
          prompt="At GPS altitude (about 20,200 km), do you think the satellite's clock ends up running faster than a ground clock, slower, or at the same rate?"
          moreLabel="Faster"
          lessLabel="Slower"
          sameLabel="Same rate"
          selected={gpsPrediction}
          submitted={submittedGpsPrediction}
          onSelect={setGpsPrediction}
          disabled={hasSubmittedPredictions}
        />

        {hasAllPredictions ? (
          <>
            {hasSubmittedPredictions && (
              <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Your predictions are locked in above. You can still try as many different
                  altitudes as you like below — move the slider or a preset, then click "Show
                  results" again. Or, change your predictions and start over:
                </p>
                <button
                  type="button"
                  onClick={handleChangePredictions}
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
            <label htmlFor="gps-altitude" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Orbital altitude: {formatAltitude(altitudeKm)}
            </label>
            <input
              id="gps-altitude"
              type="range"
              min={MIN_ALTITUDE_KM}
              max={MAX_ALTITUDE_KM}
              step={10}
              value={altitudeKm}
              onChange={(event) => setAltitudeKm(Number(event.target.value))}
              style={{ width: '100%' }}
            />

            <div style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => setAltitudeKm(ISS_ALTITUDE_KM)}
                className={`toggle-button${altitudeKm === ISS_ALTITUDE_KM ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                ISS (~400 km)
              </button>
              <button
                type="button"
                onClick={() => setAltitudeKm(GPS_ALTITUDE_KM)}
                className={`toggle-button${altitudeKm === GPS_ALTITUDE_KM ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                GPS (~20,200 km)
              </button>
              <button
                type="button"
                onClick={() => setAltitudeKm(GEOSTATIONARY_ALTITUDE_KM)}
                className={`toggle-button${altitudeKm === GEOSTATIONARY_ALTITUDE_KM ? ' is-selected' : ''}`}
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Geostationary (~35,786 km)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <svg
                width={VIEW_SIZE}
                height={VIEW_SIZE}
                viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
                style={{ border: '1px solid var(--border-color, #ccc)', flexShrink: 0 }}
              >
                <circle
                  cx={VIEW_CENTER}
                  cy={VIEW_CENTER}
                  r={crossoverViewRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  opacity={0.4}
                />
                <circle cx={VIEW_CENTER} cy={VIEW_CENTER} r={EARTH_VIEW_RADIUS} fill="currentColor" opacity={0.6} />
                <circle
                  cx={VIEW_CENTER}
                  cy={VIEW_CENTER}
                  r={satelliteViewRadius}
                  fill="none"
                  stroke="currentColor"
                  opacity={0.25}
                />
                <circle cx={satelliteX} cy={satelliteY} r={SATELLITE_DOT_RADIUS} fill="currentColor" />
                <text x={8} y={VIEW_SIZE - 8} fontSize={10} fill="currentColor" opacity={0.6}>
                  dashed ring: crossover altitude (~{Math.round(CROSSOVER_ALTITUDE_KM).toLocaleString()} km)
                </text>
              </svg>
            </div>

            <button
              type="button"
              className="action-button"
              onClick={handleShowResults}
              style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem' }}
            >
              Show results
            </button>
          </>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Answer all three predictions above to explore orbital altitude.
          </p>
        )}

        {status === 'complete' &&
          confirmedResult &&
          submittedSpeedEffectPrediction &&
          submittedCrossoverPrediction &&
          submittedGpsPrediction && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
              <h3 style={{ marginTop: 0 }}>Results</h3>
              <p>
                Altitude: <strong>{formatAltitude(confirmedAltitudeKm)}</strong> (orbital radius{' '}
                {(confirmedResult.orbitalRadiusMeters / 1000).toFixed(0)} km). Orbital speed:{' '}
                <strong>{formatSpeed(confirmedResult.orbitalSpeedMetersPerSecond)}</strong>.
              </p>
              <p>
                Speed effect (from motion, Experiment 3/4's mechanism):{' '}
                <strong>{formatMicrosecondsPerDay(confirmedResult.speedEffectFraction)}</strong> — always
                slows the clock. Gravity effect (from altitude, Experiment 2's mechanism):{' '}
                <strong>{formatMicrosecondsPerDay(confirmedResult.gravityEffectFraction)}</strong> — always
                speeds the clock up.
              </p>
              <p>
                Net effect: <strong>{formatMicrosecondsPerDay(confirmedResult.netEffectFraction)}</strong>. At
                this altitude, the{' '}
                <strong>{confirmedResult.netEffectFraction > 0 ? 'gravity' : 'speed'}</strong> effect wins, so
                the satellite clock runs{' '}
                <strong>{confirmedResult.netEffectFraction > 0 ? 'fast' : 'slow'}</strong> compared to a ground
                clock. The two effects exactly cancel at about{' '}
                <strong>{Math.round(CROSSOVER_ALTITUDE_KM).toLocaleString()} km</strong> — this altitude is{' '}
                {confirmedAltitudeKm > CROSSOVER_ALTITUDE_KM ? 'above' : 'below'} that crossover point.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                This isn't hypothetical: real GPS satellites orbit at about 20,200 km, well above the
                crossover, and their clocks really do run about +38 microseconds per day fast — a correction
                real GPS receivers apply every day, or their position calculations would drift by kilometers
                within a day.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your prediction, speed effect vs. altitude:</strong>{' '}
                {moreLessSameLabel(submittedSpeedEffectPrediction)}. In fact, the speed effect gets weaker as
                altitude increases — a higher orbit moves slower.
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Your prediction, is there a crossover:</strong>{' '}
                {submittedCrossoverPrediction === 'yes' ? 'Yes' : 'No'}. In fact, yes — the two effects exactly
                cancel at about {Math.round(CROSSOVER_ALTITUDE_KM).toLocaleString()} km.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Your prediction, GPS altitude:</strong>{' '}
                {fasterSlowerSameLabel(submittedGpsPrediction)}. In fact, at GPS altitude the satellite clock
                runs faster.
              </p>
            </div>
          )}
      </div>

      {status === 'complete' &&
        confirmedResult &&
        submittedSpeedEffectPrediction &&
        submittedCrossoverPrediction &&
        submittedGpsPrediction && (
          <GpsTimeDilationTutor
            key={runCount}
            speedEffectPrediction={submittedSpeedEffectPrediction}
            crossoverPrediction={submittedCrossoverPrediction}
            gpsPrediction={submittedGpsPrediction}
            result={confirmedResult}
            onExplained={() => {
              setExplanationReached(true)
              onTutorComplete?.()
            }}
          />
        )}

      {explanationReached && (
        <div
          className="exp-card"
          style={{ marginTop: '2rem', padding: '1.5rem', fontSize: '0.9375rem', lineHeight: 1.6 }}
        >
          <h2 style={{ marginTop: 0 }}>Putting It All Together: What Is Relativity?</h2>
          <p>
            You've now run every experiment in this two-part journey. Everything you've seen is part of two
            theories, both created by Albert Einstein: <strong>special relativity</strong> (1905) and{' '}
            <strong>general relativity</strong> (1915). Neither name has come up until now, on purpose — first
            you experienced what they predict, and only now do we name what they actually claim.
          </p>

          <h3>Special Relativity</h3>
          <p>
            Special relativity rests on exactly two starting assumptions. Everything in the first part of this
            journey (Experiments 1–11) follows logically from just these two — none of it is a separate, extra
            rule.
          </p>
          <p>
            <strong>1. The Principle of Relativity.</strong> The laws of physics work exactly the same for
            everyone moving at a constant speed in a straight line. There's no experiment you can run inside a
            sealed, smoothly-moving box that tells you whether you're "moving" or "standing still."
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            <em>A daily-life picture:</em> sit in a train with the curtains drawn, on perfectly smooth track,
            moving at a steady 200 km/h. Pour a cup of coffee. It pours exactly as it would if the train were
            parked at the station — nothing about the physics gives away that you're moving. This is the
            "reference frame" idea from Experiment 2.
          </p>
          <p>
            <strong>2. The speed of light is the same for everyone.</strong> Light in a vacuum travels at the
            same speed — about 300,000 km/s — no matter how fast its source is moving, and no matter how fast
            the person measuring it is moving. This breaks the everyday rule that speeds add together. You saw
            this rule directly in Experiment 5, comparing the everyday "speeds add" rule against light's
            actual behavior.
          </p>
          <p>
            <strong>Why these two are enough:</strong> if light's speed must come out the same for every
            observer (rule 2), but different observers can be moving relative to each other (which rule 1
            allows), then something else has to give — and what gives is time and space themselves. Time
            dilation (Experiments 3–4), length contraction (Experiment 6), the relativity of simultaneity
            (Experiment 7), and the twin paradox's asymmetry (Experiment 10) aren't independent rules you had
            to take on faith — they're the unavoidable consequence of holding both of the above at once.
            Experiment 11's Lorentz transformation is the exact mathematical machine that turns these two
            rules into every one of those specific effects.
          </p>

          <h3>General Relativity</h3>
          <p>
            General relativity rests on two core ideas: one is a foundational assumption, the other is the
            theory's central claim.
          </p>
          <p>
            <strong>1. The Equivalence Principle.</strong> Being in a gravitational field and being in an
            accelerating rocket are locally indistinguishable — no experiment done inside a small, sealed
            cabin can tell the two apart. This is exactly Experiment 1's result: a dropped ball behaves
            identically in both cabins.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            <em>A daily-life picture:</em> if the cable holding an elevator snapped, everyone inside would
            float — weightless — for the few seconds before it hit the ground. That's not gravity switching
            off. It's the same physics as coasting in a spaceship far from any planet, engine off. Free fall
            <em> is</em> weightlessness, exactly, because gravity and acceleration are the same thing locally.
          </p>
          <p>
            <strong>2. Gravity is the curvature of spacetime, not a force pulling things together.</strong>{' '}
            Massive objects bend the shape of spacetime around them, and everything — including light — simply
            follows the straightest possible path through that curved shape (a "geodesic"). What looks like an
            attractive force is really geometry.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            <em>How you built this up, piece by piece:</em> Experiment 1 established the equivalence
            principle. Experiment 3 showed gravity isn't exactly like acceleration — real gravity has a
            center, so it pulls things together, which a uniformly accelerating rocket can never reproduce.
            Experiment 4 showed what "curvature" concretely means: parallel paths that converge. Experiment 5
            showed what determines how much curvature there is: mass and distance. Experiments 6–8 showed the
            consequences of that curvature — orbits, black holes, and light bending. This experiment (9)
            showed that gravitational time dilation isn't a rare, exotic effect confined to thought
            experiments — it's a real correction in a real, working system.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            <em>The same simple math, reused:</em> the acceleration × height / c²-style formulas used
            throughout Chapter 2 (Experiments 2 and 9) are the simplified, weak-field version of general
            relativity's curvature effect — not a separate rule invented for this project, but the real theory
            scaled down to something calculable by hand.
          </p>

          <h3>Why we waited until now to say this</h3>
          <p style={{ marginBottom: 0 }}>
            Naming these theories at the very start would have asked you to accept abstract statements before
            you had any reason to believe them. Instead, every one of the nine-plus-eleven experiments you ran
            was one small, concrete piece of evidence — and only now, with all of it in hand, do the two
            abstract-sounding theories turn into: "oh, that's just describing what I already watched happen."
          </p>
        </div>
      )}
    </div>
  )
}
