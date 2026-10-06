import { useEffect, useState } from 'react'
import { DarkMatterTutor } from './DarkMatterTutor'
import {
  MAX_DARK_MATTER_AMOUNT,
  MAX_RADIUS_KPC,
  MIN_RADIUS_KPC,
  OBSERVED_SPEED_KM_PER_S,
  orbitalPeriodYears,
  rotationCurve,
  runDarkMatterExperiment,
  visibleEnclosedMass,
} from '../physics/darkMatterExperiment'

interface DarkMatterExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type AmountMode = 'none' | 'match' | 'custom'

// This experiment's two prediction questions, per its specification's "Prediction Activity".
// Choices are not scored.
type SpeedComparisonChoice = 'faster' | 'slower' | 'same'
const speedComparisonChoices: Array<{ value: SpeedComparisonChoice; label: string }> = [
  { value: 'faster', label: 'Faster' },
  { value: 'slower', label: 'Slower' },
  { value: 'same', label: 'About the same' },
]

type MeasuredChoice = 'match' | 'faster' | 'slower'
const measuredChoices: Array<{ value: MeasuredChoice; label: string }> = [
  { value: 'match', label: 'They will match' },
  { value: 'faster', label: 'Faster than predicted' },
  { value: 'slower', label: 'Slower than predicted' },
]

// Guaranteed by the model itself (the visible-only speed falls with radius; the measured speed is
// well above it) - not dependent on the learner's chosen amount. See darkMatterExperiment.test.ts.
const ACTUAL_SPEED: SpeedComparisonChoice = 'slower'
const ACTUAL_MEASURED: MeasuredChoice = 'faster'

// How close to the observed speed counts as "matching", per the specification's "Results".
const MATCH_TOLERANCE = 0.05

// Fixed real-world playback duration, and a fixed span of simulated time, so playback speed never
// changes the physical result (CLAUDE.md §11). One billion years gives the inner star several laps and
// the outer star about one, so the speed difference between the two models is visible as lap counts.
const ANIMATION_DURATION_MS = 6000
const SIMULATED_YEARS = 1e9

// The three marker stars, at radii from the specification's "Display" section.
const STAR_RADII_KPC = [8, 16, 30]

// Galaxy view geometry.
const GALAXY_SIZE = 380
const GALAXY_CENTER = GALAXY_SIZE / 2
const GALAXY_PX_PER_KPC = 150 / MAX_RADIUS_KPC

// Graph geometry.
const GRAPH_WIDTH = 460
const GRAPH_HEIGHT = 300
const GRAPH_LEFT = 55
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 20
const GRAPH_BOTTOM = GRAPH_HEIGHT - 50
const GRAPH_MAX_SPEED = 260

const VISIBLE_COLOR = '#38bdf8'
const DARK_MATTER_COLOR = '#c084fc'
const OBSERVED_COLOR = '#4ade80'

function graphX(radiusKpc: number): number {
  return (
    GRAPH_LEFT +
    ((radiusKpc - MIN_RADIUS_KPC) / (MAX_RADIUS_KPC - MIN_RADIUS_KPC)) * (GRAPH_RIGHT - GRAPH_LEFT)
  )
}

function graphY(speedKmPerS: number): number {
  return GRAPH_BOTTOM - (speedKmPerS / GRAPH_MAX_SPEED) * (GRAPH_BOTTOM - GRAPH_TOP)
}

export function DarkMatterExperiment({ onComplete, onTutorComplete }: DarkMatterExperimentProps) {
  const [mode, setMode] = useState<AmountMode>('match')
  const [customAmount, setCustomAmount] = useState(0.5)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [speedPrediction, setSpeedPrediction] = useState<SpeedComparisonChoice | null>(null)
  const [measuredPrediction, setMeasuredPrediction] = useState<MeasuredChoice | null>(null)
  const [submittedSpeedPrediction, setSubmittedSpeedPrediction] = useState<SpeedComparisonChoice | null>(null)
  const [submittedMeasuredPrediction, setSubmittedMeasuredPrediction] = useState<MeasuredChoice | null>(null)

  const hasPrediction = speedPrediction !== null && measuredPrediction !== null
  const hasSubmittedPrediction = submittedSpeedPrediction !== null && submittedMeasuredPrediction !== null

  const amount = mode === 'none' ? 0 : mode === 'match' ? 1 : customAmount
  const result = runDarkMatterExperiment(amount)
  const isActive = status === 'running' || status === 'complete'

  const handleModeChange = (next: AmountMode) => {
    setMode(next)
    if (status === 'complete') setStatus('idle')
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedSpeedPrediction(speedPrediction)
      setSubmittedMeasuredPrediction(measuredPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's precedent: re-opens both questions for editing without
  // resetting the chosen amount.
  const handleChangePrediction = () => {
    setSubmittedSpeedPrediction(null)
    setSubmittedMeasuredPrediction(null)
    setStatus('idle')
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

  const displayedProgress = status === 'idle' ? 0 : progress
  const simulatedYears = displayedProgress * SIMULATED_YEARS

  const stars = rotationCurve(amount, STAR_RADII_KPC).map((point) => {
    const speed = point.withDarkMatterSpeedKmPerS
    const periodYears = orbitalPeriodYears(point.radiusKpc, speed)
    // Each star starts on the right of the center and moves counterclockwise at the chosen model's speed.
    const angle = (2 * Math.PI * simulatedYears) / periodYears
    const rPx = point.radiusKpc * GALAXY_PX_PER_KPC
    return {
      ...point,
      speed,
      periodYears,
      x: GALAXY_CENTER + rPx * Math.cos(angle),
      y: GALAXY_CENTER - rPx * Math.sin(angle),
      laps: simulatedYears / periodYears,
    }
  })

  const visibleOnlyLine = result.curve
    .map((p) => `${graphX(p.radiusKpc).toFixed(1)},${graphY(p.visibleOnlySpeedKmPerS).toFixed(1)}`)
    .join(' ')
  const shownRadiusLimit =
    MIN_RADIUS_KPC + (status === 'complete' ? 1 : displayedProgress) * (MAX_RADIUS_KPC - MIN_RADIUS_KPC)
  const withDarkMatterLine = result.curve
    .filter((p) => p.radiusKpc <= shownRadiusLimit)
    .map((p) => `${graphX(p.radiusKpc).toFixed(1)},${graphY(p.withDarkMatterSpeedKmPerS).toFixed(1)}`)
    .join(' ')

  // Whether the chosen amount reproduces the measured speed (within MATCH_TOLERANCE) at every distance.
  const worstDeviation = Math.max(
    ...result.curve.map(
      (p) => Math.abs(p.withDarkMatterSpeedKmPerS - OBSERVED_SPEED_KM_PER_S) / OBSERVED_SPEED_KM_PER_S,
    ),
  )
  const amountVerdict: 'match' | 'too-little' | 'too-much' =
    worstDeviation <= MATCH_TOLERANCE
      ? 'match'
      : result.curve.some(
            (p) => p.withDarkMatterSpeedKmPerS < OBSERVED_SPEED_KM_PER_S * (1 - MATCH_TOLERANCE),
          )
        ? 'too-little'
        : 'too-much'
  const visibleMassAt8Kpc = visibleEnclosedMass(8)

  // Display-only: the halo's glow strength follows the chosen amount, so the control visibly changes
  // the picture and not only the numbers.
  // Any amount above zero is clearly visible, and more dark matter is clearly stronger.
  const haloOpacity = amount === 0 ? 0 : 0.45 + 0.55 * Math.min(1, amount / MAX_DARK_MATTER_AMOUNT)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 4 — Dark Matter</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Is the matter we can see in a galaxy all the matter there is?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Stars orbit the center of their galaxy, held in orbit by gravity,
            just as planets orbit the Sun. In the Orbits experiment (Gravity and Curved Spacetime, Experiment
            6) you found that, for a given mass and distance, there is one "just right" sideways speed that
            keeps an object circling. That speed depends on how much mass is pulling inward: more mass inside
            the orbit means a faster orbit is needed. So by measuring how fast stars orbit, we can work out
            how much mass is pulling on them, in effect weighing the galaxy. Here we compare two things: the
            orbit speeds we would expect from the matter we can see (stars and gas), and the speeds
            astronomers actually measure. The name for matter that we cannot see because it gives off no
            light, but that still pulls on other things with gravity, is <strong>dark matter</strong>. How
            much of it there is, if any, is what this experiment explores.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> Whirl a ball on a string. The faster the ball goes, the
            harder the string has to pull it inward, so if you could feel only the string's pull, you could
            tell how fast the ball was moving. In the same way, how fast stars orbit tells us how hard gravity
            is pulling them inward, and so how much mass is doing the pulling.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> Almost everything we know about the universe comes from light.
            But gravity works whether or not something shines: a dark object pulls just as hard as a glowing
            one. That gives us a second, independent way to count the mass in a galaxy, one that does not
            depend on light at all. If the count from light and the count from gravity agree, the matter we
            can see is all there is. If they do not, that is worth investigating.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A sealed-box picture.</strong> Imagine a sealed, opaque box with only a small window.
            Through the window you can see some of what is inside. Then you weigh the whole box on a scale. If
            the scale reads far more than the contents you can see should weigh, something you cannot see is
            also in there. Astronomers do the same with galaxies: the "window" is the light we can see, and
            the "scale" is gravity, read from how fast stars orbit.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>How are the speeds measured?</strong> Astronomers use the same idea as the Doppler effect
            named in Hubble's Law (Experiment 1 of this chapter) and in Gravitational Waves Experiment 5: the
            light from stars and gas on the side of a galaxy that is moving toward us is shifted very slightly
            toward blue, and light from the side moving away is shifted very slightly toward red. How big that
            shift is tells us how fast they are moving, without anyone having to travel there.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>New terms.</strong> Distances here are in <strong>kiloparsecs (kpc)</strong>. One
            kiloparsec is about 3,260 light-years. Our Sun is roughly 8 kpc from the center of the Milky Way.
            A graph of how fast things orbit at different distances from the center is called a{' '}
            <strong>rotation curve</strong>. Masses are measured in <strong>solar masses</strong>, where one
            solar mass is the mass of our Sun.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, predict how the orbit speed of a star far from the center
            compares with a star nearer in, if the visible matter were all the mass. Then predict whether the
            real measured speeds will match what the visible matter predicts.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> After answering, pick an amount of dark matter below and run
            it. Compare the three lines on the graph: the speed predicted from visible matter only, the speed
            actually measured, and the speed predicted once your chosen dark matter is added.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Ordinary Newtonian gravity is used. The speeds here (about 220 km/s) are tiny compared with the
              speed of light, so general relativity is not needed.
            </li>
            <li>
              Each star moves in a circle, and gravity depends only on the mass inside its orbit. Real
              galaxies are mostly flat disks, so this is a simplification, but it gives the right overall
              picture.
            </li>
            <li>
              The mass shapes used here are simple formulas, not a fit to one real galaxy. Their numbers were
              chosen so the results land near the Milky Way's real values. The "visible matter only" line is
              therefore a teaching model, not a measurement.
            </li>
            <li>
              The "measured" speed is a given, real-world value of about 220 km/s (the Milky Way near the Sun,
              and many other galaxies), not something worked out here. Real measured curves are not perfectly
              flat.
            </li>
            <li>
              Only the outer galaxy is shown, from 5 to 30 kpc from the center. The crowded inner region needs
              a more detailed model and is not covered.
            </li>
            <li>
              Nothing here claims to say what dark matter is. The purple glow is just a shape that supplies
              extra mass.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If the stars and gas we can see were all the mass in the galaxy, how would the orbit speed of a
            star far from the center compare with a star nearer the center?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {speedComparisonChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setSpeedPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${speedPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Astronomers measure the real speeds of far-out stars. Do you think the measured speeds will match
            what the visible matter predicts?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {measuredChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setMeasuredPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${measuredPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  speedComparisonChoices.find(
                    (c) => c.value === (speedPrediction ?? submittedSpeedPrediction),
                  )!.label
                }, ${
                  measuredChoices.find(
                    (c) => c.value === (measuredPrediction ?? submittedMeasuredPrediction),
                  )!.label
                }`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many amounts as you like below. Or,
              change your predictions and start over:
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
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Amount of dark matter:</p>
          <button
            type="button"
            onClick={() => handleModeChange('none')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'none' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            None (visible matter only)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('match')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'match' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            The amount that matches observations
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('custom')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Custom
          </button>
          {mode === 'custom' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="dark-matter-amount" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Dark matter: {customAmount.toFixed(2)} × the amount that matches observations
              </label>
              <input
                id="dark-matter-amount"
                type="range"
                min={0}
                max={MAX_DARK_MATTER_AMOUNT}
                step={0.05}
                value={customAmount}
                disabled={!hasPrediction || status === 'running'}
                onChange={(event) => {
                  setCustomAmount(Number(event.target.value))
                  if (status === 'complete') setStatus('idle')
                }}
                style={{ width: '100%' }}
              />
            </div>
          )}
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

        {isActive && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {stars.map((star, index) => (
              <span key={star.radiusKpc}>
                {index > 0 && <br />}
                Star at {star.radiusKpc} kpc: {star.speed.toFixed(0)} km/s &nbsp;|&nbsp; one lap every{' '}
                {(star.periodYears / 1e6).toFixed(0)} million years &nbsp;|&nbsp; laps so far:{' '}
                {star.laps.toFixed(1)}
              </span>
            ))}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <svg
            width={GALAXY_SIZE}
            height={GALAXY_SIZE}
            viewBox={`0 0 ${GALAXY_SIZE} ${GALAXY_SIZE}`}
            style={{
              display: 'block',
              border: '1px solid var(--border-color, #ccc)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#0b1020',
              maxWidth: '100%',
            }}
          >
            <defs>
              <radialGradient id="dark-matter-halo-gradient">
                <stop offset="0%" stopColor={DARK_MATTER_COLOR} stopOpacity={1} />
                <stop offset="100%" stopColor={DARK_MATTER_COLOR} stopOpacity={0.45} />
              </radialGradient>
              <radialGradient id="dark-matter-visible-gradient">
                <stop offset="0%" stopColor="#fef3c7" stopOpacity={1} />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
              </radialGradient>
            </defs>

            <text x={GALAXY_CENTER} y={18} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
              The galaxy, seen from above
            </text>

            {/* The dark matter halo (invisible in reality; shown here as a faint glow) */}
            <circle
              cx={GALAXY_CENTER}
              cy={GALAXY_CENTER}
              r={165}
              fill="url(#dark-matter-halo-gradient)"
              opacity={haloOpacity}
            />
            {/* The halo's outer edge, so its extent is visible as well as its glow */}
            <circle
              cx={GALAXY_CENTER}
              cy={GALAXY_CENTER}
              r={165}
              fill="none"
              stroke={DARK_MATTER_COLOR}
              strokeWidth={2}
              opacity={haloOpacity}
            />

            {/* The orbits, labeled by distance from the center */}
            {STAR_RADII_KPC.map((radiusKpc) => (
              <g key={radiusKpc}>
                <circle
                  cx={GALAXY_CENTER}
                  cy={GALAXY_CENTER}
                  r={radiusKpc * GALAXY_PX_PER_KPC}
                  fill="none"
                  stroke="#475569"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={GALAXY_CENTER}
                  y={GALAXY_CENTER - radiusKpc * GALAXY_PX_PER_KPC - 4}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {radiusKpc} kpc{radiusKpc === 8 ? ' (about the Sun)' : ''}
                </text>
              </g>
            ))}

            {/* The visible matter: the bright center */}
            <circle cx={GALAXY_CENTER} cy={GALAXY_CENTER} r={26} fill="url(#dark-matter-visible-gradient)" />
            <text x={GALAXY_CENTER} y={GALAXY_CENTER + 42} fill="#fde68a" fontSize="10" textAnchor="middle">
              visible matter (stars, gas)
            </text>

            {/* The marker stars */}
            {stars.map((star) => (
              <circle
                key={star.radiusKpc}
                cx={star.x}
                cy={star.y}
                r={6}
                fill="#fde68a"
                stroke="#f8fafc"
                strokeWidth={1.5}
              />
            ))}

            <circle
              cx={GALAXY_CENTER - 78}
              cy={GALAXY_SIZE - 28}
              r={5}
              fill="#fde68a"
              stroke="#f8fafc"
              strokeWidth={1.5}
            />
            <text x={GALAXY_CENTER - 68} y={GALAXY_SIZE - 25} fill="#e2e8f0" fontSize="10">
              = a star orbiting at that distance
            </text>
            <text
              x={GALAXY_CENTER}
              y={GALAXY_SIZE - 10}
              fill={DARK_MATTER_COLOR}
              fontSize="10"
              textAnchor="middle"
            >
              {amount === 0
                ? 'no dark matter halo'
                : 'faint purple glow = dark matter halo (invisible in reality)'}
            </text>
          </svg>

          {hasSubmittedPrediction && (
            <svg
              width={GRAPH_WIDTH}
              height={GRAPH_HEIGHT}
              viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
              style={{
                display: 'block',
                border: '1px solid var(--border-color, #ccc)',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#0b1020',
                maxWidth: '100%',
              }}
            >
              <text
                x={GRAPH_WIDTH / 2}
                y={14}
                fill="#e2e8f0"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Orbital speed versus distance from the center
              </text>

              {/* Axes and ticks */}
              <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#94a3b8" />
              <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#94a3b8" />
              {[0, 100, 200].map((speed) => (
                <g key={speed}>
                  <line
                    x1={GRAPH_LEFT - 4}
                    y1={graphY(speed)}
                    x2={GRAPH_LEFT}
                    y2={graphY(speed)}
                    stroke="#94a3b8"
                  />
                  <text
                    x={GRAPH_LEFT - 8}
                    y={graphY(speed) + 3}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {speed}
                  </text>
                </g>
              ))}
              {[5, 10, 15, 20, 25, 30].map((radiusKpc) => (
                <g key={radiusKpc}>
                  <line
                    x1={graphX(radiusKpc)}
                    y1={GRAPH_BOTTOM}
                    x2={graphX(radiusKpc)}
                    y2={GRAPH_BOTTOM + 4}
                    stroke="#94a3b8"
                  />
                  <text
                    x={graphX(radiusKpc)}
                    y={GRAPH_BOTTOM + 16}
                    fill="#94a3b8"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {radiusKpc}
                  </text>
                </g>
              ))}
              <text
                x={(GRAPH_LEFT + GRAPH_RIGHT) / 2}
                y={GRAPH_BOTTOM + 32}
                fill="#e2e8f0"
                fontSize="11"
                textAnchor="middle"
              >
                distance from the galaxy's center (kpc)
              </text>
              <text
                x={14}
                y={(GRAPH_TOP + GRAPH_BOTTOM) / 2}
                fill="#e2e8f0"
                fontSize="11"
                textAnchor="middle"
                transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}
              >
                orbital speed (km/s)
              </text>

              {/* Observed speed (a given reference line) */}
              <line
                x1={graphX(MIN_RADIUS_KPC)}
                y1={graphY(OBSERVED_SPEED_KM_PER_S)}
                x2={graphX(MAX_RADIUS_KPC)}
                y2={graphY(OBSERVED_SPEED_KM_PER_S)}
                stroke={OBSERVED_COLOR}
                strokeWidth={2}
                strokeDasharray="6 4"
              />

              {/* Predicted from visible matter only */}
              <polyline points={visibleOnlyLine} fill="none" stroke={VISIBLE_COLOR} strokeWidth={2.5} />

              {/* Predicted with the chosen amount of dark matter */}
              {isActive && withDarkMatterLine && (
                <polyline
                  points={withDarkMatterLine}
                  fill="none"
                  stroke={DARK_MATTER_COLOR}
                  strokeWidth={2.5}
                />
              )}

              {/* Legend */}
              <g transform={`translate(${GRAPH_LEFT + 10}, ${GRAPH_BOTTOM - 62})`}>
                <line
                  x1={0}
                  y1={0}
                  x2={22}
                  y2={0}
                  stroke={OBSERVED_COLOR}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                <text x={28} y={3} fill="#e2e8f0" fontSize="10">
                  observed speed (about {OBSERVED_SPEED_KM_PER_S} km/s)
                </text>
                <line x1={0} y1={14} x2={22} y2={14} stroke={VISIBLE_COLOR} strokeWidth={2.5} />
                <text x={28} y={17} fill="#e2e8f0" fontSize="10">
                  predicted from visible matter only
                </text>
                <line x1={0} y1={28} x2={22} y2={28} stroke={DARK_MATTER_COLOR} strokeWidth={2.5} />
                <text x={28} y={31} fill="#e2e8f0" fontSize="10">
                  predicted with the chosen dark matter
                </text>
              </g>
            </svg>
          )}
        </div>

        {hasSubmittedPrediction && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
              <strong>How to read this diagram.</strong> The left picture is the galaxy from above. The bright
              center is the <strong>visible matter</strong> (stars and gas), the dashed rings are three
              distances from the center, and the three small stars orbit on them. The faint purple glow is the{' '}
              <strong>dark matter</strong>, which is invisible in reality; it is drawn only to show how much
              you have added. The right graph shows how fast a star would orbit at each distance.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              <li>
                The <strong style={{ color: VISIBLE_COLOR }}>blue line</strong> is the speed predicted from
                the visible matter alone. The{' '}
                <strong style={{ color: OBSERVED_COLOR }}>green dashed line</strong> is the speed typically
                measured. Compare how the two behave as you move away from the center.
              </li>
              <li>
                The <strong style={{ color: DARK_MATTER_COLOR }}>purple line</strong> is the speed predicted
                once the dark matter you chose is added. It appears when you run, and moves as you change the
                amount. Compare it with the other two lines.
              </li>
              <li>
                The stars orbit at the speed of the purple line, for a fixed span of simulated time, so a
                faster star completes more laps. The numbers above the pictures are exact; the stars' ring
                sizes are drawn to scale, but the dark matter glow is only a visual aid.
              </li>
            </ul>
          </div>
        )}
        {status === 'complete' && submittedSpeedPrediction && submittedMeasuredPrediction && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color, #ccc)',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You added <strong>{amount.toFixed(2)} ×</strong> the amount of dark matter that matches
              observations. Speeds the model predicts at three distances (km/s):
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.25rem 1rem 0.25rem 0' }}>Distance</th>
                    <th style={{ textAlign: 'right', padding: '0.25rem 1rem' }}>Visible matter only</th>
                    <th style={{ textAlign: 'right', padding: '0.25rem 1rem' }}>With your dark matter</th>
                    <th style={{ textAlign: 'right', padding: '0.25rem 0 0.25rem 1rem' }}>
                      Measured (about)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STAR_RADII_KPC.map((radiusKpc) => {
                    const point = result.curve.find((p) => p.radiusKpc === radiusKpc)!
                    return (
                      <tr key={radiusKpc}>
                        <td style={{ padding: '0.25rem 1rem 0.25rem 0' }}>{radiusKpc} kpc</td>
                        <td style={{ textAlign: 'right', padding: '0.25rem 1rem' }}>
                          {point.visibleOnlySpeedKmPerS.toFixed(0)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '0.25rem 1rem' }}>
                          {point.withDarkMatterSpeedKmPerS.toFixed(0)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '0.25rem 0 0.25rem 1rem' }}>
                          {OBSERVED_SPEED_KM_PER_S}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p>
              {amountVerdict === 'match'
                ? 'With this amount, the predicted speed stays within 5% of the measured speed at every distance, so the visible matter plus this dark matter can account for what is observed.'
                : amountVerdict === 'too-little'
                  ? 'With this amount, the predicted speed still falls short of the measured speed at some distances: this is not yet enough extra mass to explain what is observed.'
                  : 'With this amount, the predicted speed overshoots the measured speed at some distances: this is more extra mass than the observations call for.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your first prediction:</strong> you guessed a far star would orbit{' '}
              {speedComparisonChoices.find((c) => c.value === submittedSpeedPrediction)!.label.toLowerCase()}{' '}
              than a near one if the visible matter were all the mass. The visible-only line falls from{' '}
              {result.curve[0].visibleOnlySpeedKmPerS.toFixed(0)} km/s at {MIN_RADIUS_KPC} kpc to{' '}
              {result.curve[result.curve.length - 1].visibleOnlySpeedKmPerS.toFixed(0)} km/s at{' '}
              {MAX_RADIUS_KPC} kpc, so far stars would be slower —{' '}
              {submittedSpeedPrediction === ACTUAL_SPEED
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}{' '}
              The planets in our solar system behave the same way, because nearly all the mass is at the
              center: Earth orbits at about 30 km/s, while far-away Neptune moves at only about 5.4 km/s.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your second prediction:</strong> you guessed the measured speeds would be{' '}
              {measuredChoices.find((c) => c.value === submittedMeasuredPrediction)!.label.toLowerCase()}.
              Real measurements show far-out stars moving at about {OBSERVED_SPEED_KM_PER_S} km/s, much faster
              than the visible matter alone predicts —{' '}
              {submittedMeasuredPrediction === ACTUAL_MEASURED
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>A worked example.</strong> At 8 kpc (about the Sun's distance) the model's visible
              matter inside the orbit is about {(visibleMassAt8Kpc / 1e10).toFixed(1)}×10¹⁰ solar masses.
              Using v = √(G × M / r) with G = 4.3×10⁻⁶ (in these units): v = √(4.3×10⁻⁶ ×{' '}
              {(visibleMassAt8Kpc / 1e10).toFixed(1)}×10¹⁰ / 8) ≈{' '}
              {result.curve.find((p) => p.radiusKpc === 8)!.visibleOnlySpeedKmPerS.toFixed(0)} km/s. The
              measured value is about {OBSERVED_SPEED_KM_PER_S} km/s, so more mass than the visible matter
              must be pulling inward.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              This kind of measurement goes back to the 1970s, when astronomers Vera Rubin and Kent Ford
              measured how fast stars and gas orbit in galaxies, including our neighbor, the Andromeda galaxy,
              and found speeds that stayed high far from the center.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Remember:</strong> this uses ordinary Newtonian gravity, which is fine at these speeds,
              and the mass shapes are a simple teaching model, not a fit to a real galaxy. The measured speed
              is a given, rounded value, and real curves are not perfectly flat.
            </p>
          </div>
        )}
      </div>

      {status === 'complete' && submittedSpeedPrediction && submittedMeasuredPrediction && (
        <DarkMatterTutor
          key={runCount}
          predictedSpeed={submittedSpeedPrediction}
          predictedMeasured={submittedMeasuredPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
