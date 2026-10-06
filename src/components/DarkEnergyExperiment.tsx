import { useEffect, useState } from 'react'
import { DarkEnergyTutor } from './DarkEnergyTutor'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  MAX_DARK_ENERGY_FRACTION,
  MAX_REDSHIFT,
  decelerationParameter,
  luminosityDistanceMpc,
  runDarkEnergyExperiment,
} from '../physics/darkEnergyExperiment'

interface DarkEnergyExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type ShareMode = 'none' | 'bestFit' | 'custom'

// This experiment's two prediction questions, per its specification's "Prediction Activity".
// Choices are not scored.
type GravityEffectChoice = 'slow' | 'speed' | 'none'
const gravityEffectChoices: Array<{ value: GravityEffectChoice; label: string }> = [
  { value: 'slow', label: 'Slow it down' },
  { value: 'speed', label: 'Speed it up' },
  { value: 'none', label: 'Not change it' },
]

type LooksChoice = 'brighter' | 'same' | 'dimmer'
const looksChoices: Array<{ value: LooksChoice; label: string }> = [
  { value: 'brighter', label: 'Brighter' },
  { value: 'same', label: 'The same' },
  { value: 'dimmer', label: 'Dimmer' },
]

// Guaranteed by the model itself (see darkEnergyExperiment.test.ts): matter alone slows the
// expansion, and any dark energy makes distant supernovae look dimmer than matter-only predicts -
// not dependent on the learner's chosen share.
const ACTUAL_GRAVITY_EFFECT: GravityEffectChoice = 'slow'
const ACTUAL_LOOKS: LooksChoice = 'dimmer'

// How close to the best-fit curve (as a fraction of its brightness, at every redshift) counts as
// "matching", per the specification's "Results".
const MATCH_TOLERANCE = 0.05

// A redshift small enough that every model should agree, to show the link back to Experiment 1.
const NEARBY_REDSHIFT = 0.01

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 4000

// Supernova view geometry. Earth is on the left; each supernova is placed by its redshift.
const SN_WIDTH = 520
const SN_HEIGHT = 250
const EARTH_X = 40
const SN_Y = 120
const SN_BASE_RADIUS = 32
function snX(redshift: number): number {
  return 90 + redshift * 470
}

// Graph geometry.
const GRAPH_WIDTH = 460
const GRAPH_HEIGHT = 300
const GRAPH_LEFT = 55
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 25
const GRAPH_BOTTOM = GRAPH_HEIGHT - 50
const GRAPH_MIN_BRIGHTNESS = 0.3
const GRAPH_MAX_BRIGHTNESS = 1.05

const MATTER_ONLY_COLOR = '#38bdf8'
const CHOSEN_COLOR = '#fbbf24'
const BEST_FIT_COLOR = '#4ade80'

function graphX(redshift: number): number {
  return GRAPH_LEFT + (redshift / MAX_REDSHIFT) * (GRAPH_RIGHT - GRAPH_LEFT)
}

function graphY(brightness: number): number {
  return (
    GRAPH_BOTTOM -
    ((brightness - GRAPH_MIN_BRIGHTNESS) / (GRAPH_MAX_BRIGHTNESS - GRAPH_MIN_BRIGHTNESS)) *
      (GRAPH_BOTTOM - GRAPH_TOP)
  )
}

export function DarkEnergyExperiment({ onComplete, onTutorComplete }: DarkEnergyExperimentProps) {
  const [mode, setMode] = useState<ShareMode>('bestFit')
  const [customShare, setCustomShare] = useState(0.4)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [gravityPrediction, setGravityPrediction] = useState<GravityEffectChoice | null>(null)
  const [looksPrediction, setLooksPrediction] = useState<LooksChoice | null>(null)
  const [submittedGravityPrediction, setSubmittedGravityPrediction] = useState<GravityEffectChoice | null>(
    null,
  )
  const [submittedLooksPrediction, setSubmittedLooksPrediction] = useState<LooksChoice | null>(null)

  const hasPrediction = gravityPrediction !== null && looksPrediction !== null
  const hasSubmittedPrediction = submittedGravityPrediction !== null && submittedLooksPrediction !== null

  const share = mode === 'none' ? 0 : mode === 'bestFit' ? BEST_FIT_DARK_ENERGY_FRACTION : customShare
  const result = runDarkEnergyExperiment(share)
  const bestFit = runDarkEnergyExperiment(BEST_FIT_DARK_ENERGY_FRACTION)
  const isActive = status === 'running' || status === 'complete'

  const handleModeChange = (next: ShareMode) => {
    setMode(next)
    if (status === 'complete') setStatus('idle')
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedGravityPrediction(gravityPrediction)
      setSubmittedLooksPrediction(looksPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's precedent: re-opens both questions for editing without
  // resetting the chosen share.
  const handleChangePrediction = () => {
    setSubmittedGravityPrediction(null)
    setSubmittedLooksPrediction(null)
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

  // Whether the chosen share reproduces the best-fit curve (within MATCH_TOLERANCE) at every redshift.
  const signedDeviations = result.curve.map((p, i) => {
    const reference = bestFit.curve[i].brightnessRelativeToMatterOnly
    return (p.brightnessRelativeToMatterOnly - reference) / reference
  })
  const shareVerdict: 'match' | 'too-little' | 'too-much' = signedDeviations.every(
    (d) => Math.abs(d) <= MATCH_TOLERANCE,
  )
    ? 'match'
    : Math.max(...signedDeviations) > MATCH_TOLERANCE
      ? 'too-little'
      : 'too-much'
  const middleSupernova = result.supernovae.find((sn) => sn.redshift === 0.5)!
  const bestFitMiddleSupernova = bestFit.supernovae.find((sn) => sn.redshift === 0.5)!

  // While running, each supernova's brightness eases from the matter-only value (1) to the chosen
  // model's value; the chosen line is drawn out to the redshift reached so far.
  const displayedProgress = status === 'idle' ? 0 : progress
  const reachedRedshift = displayedProgress * MAX_REDSHIFT

  const toLine = (points: Array<{ redshift: number; brightnessRelativeToMatterOnly: number }>) =>
    points
      .map((p) => `${graphX(p.redshift).toFixed(1)},${graphY(p.brightnessRelativeToMatterOnly).toFixed(1)}`)
      .join(' ')

  const chosenLine = toLine(result.curve.filter((p) => p.redshift <= reachedRedshift + 1e-9))
  const bestFitLine = toLine(bestFit.curve)
  const matterOnlyLine = `${graphX(0)},${graphY(1)} ${graphX(MAX_REDSHIFT)},${graphY(1)}`

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — Dark Energy</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> Has the universe's expansion been speeding up or slowing down, and
            how could we possibly tell?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> In Hubble's Law (Experiment 1) you saw that farther galaxies recede
            faster, using a formula that only works for nearby galaxies. In the Big Bang experiment
            (Experiment 2) you read that the real expansion rate has changed over cosmic history. To find out
            how, astronomers look at very distant objects, whose light left them long ago. A special kind of
            exploding star, a <strong>Type Ia supernova</strong>, is useful for this, because its true
            brightness is very nearly the same each time, or can be corrected to be. An object of known
            brightness is called a <strong>standard candle</strong>: how dim it looks tells us how far away it
            is. Here you compare how bright such supernovae would look in two kinds of universe.{' '}
            <strong>Dark energy</strong> is the name for a hypothetical energy that would push space to expand
            faster instead of slower. Whether it exists, and how much, is what this experiment explores.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>More about Type Ia supernovae.</strong> Many stars like our Sun end their lives as a{' '}
            <strong>white dwarf</strong>: a dense, glowing leftover core, about the size of the Earth but with
            roughly the mass of the Sun. A white dwarf that is circling close to another star, and pulling gas
            from it, can eventually grow too heavy to hold itself together. It then blows apart in a huge
            explosion, which is a Type Ia supernova ("Type Ia" is just astronomers' label for this particular
            kind, based on what its light looks like). For a few weeks the explosion shines as brightly as
            billions of Suns, rivaling the light of an entire small galaxy of stars, so it can be seen across
            billions of light-years. Because these explosions start from very similar conditions, they reach
            very nearly the same true peak brightness. Astronomers can also fine-tune the estimate: a slightly
            brighter one tends to fade more slowly, so watching how fast a supernova fades lets them correct
            for small differences.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> Look at the headlights of a car at night. A car twice as
            far away looks one quarter as bright, because light spreads out as it travels. So if you know how
            bright the headlights really are, how dim they look tells you how far away the car is. If they
            look dimmer than you expected, the car is farther away than you thought.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> The distance to a faraway object depends on what the
            universe's expansion did while its light was traveling to us. So a supernova's dimness is a test
            of how the expansion has behaved, not only of how far away the supernova is.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, predict how gravity alone, in a universe containing only matter,
            would affect the expansion. Then predict how a faraway supernova would look if the expansion were
            speeding up instead.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> After answering, pick a share of dark energy below and run it.
            Compare the supernovae's brightness, and the lines on the graph, with what a matter-only universe
            predicts. We reuse <strong>redshift</strong> and <strong>Mpc</strong> from earlier experiments,
            with the same meaning.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The universe is treated as "flat", meaning space on the very largest scales is not curved the
              way the sphere's surface was in Gravity and Curved Spacetime Experiment 4, so straight parallel
              paths stay parallel. It is also treated as containing only matter and dark energy. Matter's
              share is 100% minus dark energy's share. Light and other radiation, which only matters very
              early on, are left out. For the redshifts used here (up to 1), that is a good approximation, but
              still an approximation.
            </li>
            <li>
              Dark energy is treated as a constant: the same energy in every bit of space at all times, never
              thinning out as space expands. This is the simplest model. Whether it is exactly constant is an
              open research question and is not tested here.
            </li>
            <li>
              The Hubble constant is the same illustrative value as in Experiment 1 (70 km/s per megaparsec),
              with the same real caveat: published values range from about 67 to 73, a disagreement known as
              the "Hubble tension."
            </li>
            <li>
              Supernovae are treated as perfect standard candles. In reality astronomers calibrate and correct
              for small differences between them.
            </li>
            <li>
              The "best fit" line is not raw data. It is the model astronomers have found to match real
              supernova observations, with dark energy at about 70% of the total (a rounded value). It stands
              for what is measured; it is not a plot of individual supernovae.
            </li>
            <li>Only redshifts up to 1 are shown.</li>
            <li>Nothing here claims to say what dark energy is.</li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If the universe contained only matter, how would gravity affect the expansion?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {gravityEffectChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setGravityPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${gravityPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Now suppose the expansion were speeding up instead. A faraway supernova's light would travel
            through space that has been stretching faster and faster. Compared with a universe that is slowing
            down, would that supernova look brighter, the same, or dimmer?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {looksChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setLooksPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${looksPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  gravityEffectChoices.find(
                    (c) => c.value === (gravityPrediction ?? submittedGravityPrediction),
                  )!.label
                }, ${looksChoices.find((c) => c.value === (looksPrediction ?? submittedLooksPrediction))!.label}`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many shares as you like below. Or,
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
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Share of the universe's energy that is dark energy:
          </p>
          <button
            type="button"
            onClick={() => handleModeChange('none')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'none' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            None (matter only)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('bestFit')}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'bestFit' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            The best fit to observations (about {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}%)
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
              <label htmlFor="dark-energy-share" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Dark energy: {Math.round(customShare * 100)}% of the total (matter makes up the other{' '}
                {100 - Math.round(customShare * 100)}%)
              </label>
              <input
                id="dark-energy-share"
                type="range"
                min={0}
                max={MAX_DARK_ENERGY_FRACTION}
                step={0.01}
                value={customShare}
                disabled={!hasPrediction || status === 'running'}
                onChange={(event) => {
                  setCustomShare(Number(event.target.value))
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
            {result.supernovae.map((sn, index) => (
              <span key={sn.redshift}>
                {index > 0 && <br />}
                Supernova at redshift {sn.redshift}: appears {sn.distanceMpc.toFixed(0)} Mpc away (matter-only
                universe: {sn.matterOnlyDistanceMpc.toFixed(0)} Mpc) &nbsp;|&nbsp; brightness{' '}
                {(sn.brightnessRelativeToMatterOnly * 100).toFixed(0)}% of the matter-only prediction
              </span>
            ))}
            <br />
            Today, in this universe, the expansion is{' '}
            <strong>{result.isExpansionAccelerating ? 'speeding up' : 'slowing down'}</strong>.
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <svg
            width={SN_WIDTH}
            height={SN_HEIGHT}
            viewBox={`0 0 ${SN_WIDTH} ${SN_HEIGHT}`}
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
              <radialGradient id="supernova-glow">
                <stop offset="0%" stopColor="#fffbeb" stopOpacity={1} />
                <stop offset="100%" stopColor={CHOSEN_COLOR} stopOpacity={0.6} />
              </radialGradient>
            </defs>

            <text x={SN_WIDTH / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
              Exploding stars (Type Ia supernovae) at three distances
            </text>

            {/* Earth, the observer */}
            <circle cx={EARTH_X} cy={SN_Y} r={12} fill="#38bdf8" />
            <text x={EARTH_X} y={SN_Y + 30} fill="#e2e8f0" fontSize="11" textAnchor="middle">
              Earth
            </text>
            <line
              x1={EARTH_X + 14}
              y1={SN_Y}
              x2={SN_WIDTH - 10}
              y2={SN_Y}
              stroke="#334155"
              strokeDasharray="4 4"
            />

            {result.supernovae.map((sn) => {
              // Brightness eases from 1 (matter-only) to the chosen value as the run plays.
              const shownBrightness = 1 - displayedProgress * (1 - sn.brightnessRelativeToMatterOnly)
              const x = snX(sn.redshift)
              return (
                <g key={sn.redshift}>
                  {hasSubmittedPrediction && (
                    <>
                      {/* What a matter-only universe predicts: hidden until predictions are locked in (CLAUDE.md §12) */}
                      <circle
                        cx={x}
                        cy={SN_Y}
                        r={SN_BASE_RADIUS}
                        fill="none"
                        stroke={MATTER_ONLY_COLOR}
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                      />
                    </>
                  )}
                  {/* What the chosen universe gives */}
                  <circle
                    cx={x}
                    cy={SN_Y}
                    r={SN_BASE_RADIUS * Math.sqrt(shownBrightness)}
                    fill="url(#supernova-glow)"
                    opacity={0.25 + 0.75 * shownBrightness}
                  />
                  <text x={x} y={SN_Y - SN_BASE_RADIUS - 8} fill="#e2e8f0" fontSize="11" textAnchor="middle">
                    redshift {sn.redshift}
                  </text>
                  <text x={x} y={SN_Y + SN_BASE_RADIUS + 18} fill="#fde68a" fontSize="10" textAnchor="middle">
                    {isActive ? `${(shownBrightness * 100).toFixed(0)}% as bright` : ' '}
                  </text>
                </g>
              )
            })}

            {hasSubmittedPrediction && (
              <g transform={`translate(20, ${SN_HEIGHT - 42})`}>
                <circle
                  cx={6}
                  cy={0}
                  r={6}
                  fill="none"
                  stroke={MATTER_ONLY_COLOR}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <text x={18} y={3} fill="#e2e8f0" fontSize="10">
                  dashed ring = how bright it would look in a matter-only universe
                </text>
                <circle cx={6} cy={18} r={6} fill="url(#supernova-glow)" />
                <text x={18} y={21} fill="#e2e8f0" fontSize="10">
                  glowing disk = how bright it looks with your chosen dark energy
                </text>
              </g>
            )}
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
                Brightness of a supernova versus its redshift
              </text>

              {/* Axes and ticks */}
              <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#94a3b8" />
              <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#94a3b8" />
              {[0.4, 0.6, 0.8, 1].map((b) => (
                <g key={b}>
                  <line x1={GRAPH_LEFT - 4} y1={graphY(b)} x2={GRAPH_LEFT} y2={graphY(b)} stroke="#94a3b8" />
                  <text x={GRAPH_LEFT - 8} y={graphY(b) + 3} fill="#94a3b8" fontSize="10" textAnchor="end">
                    {b.toFixed(1)}
                  </text>
                </g>
              ))}
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((z) => (
                <g key={z}>
                  <line
                    x1={graphX(z)}
                    y1={GRAPH_BOTTOM}
                    x2={graphX(z)}
                    y2={GRAPH_BOTTOM + 4}
                    stroke="#94a3b8"
                  />
                  <text x={graphX(z)} y={GRAPH_BOTTOM + 16} fill="#94a3b8" fontSize="10" textAnchor="middle">
                    {z}
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
                redshift (how far away the supernova is)
              </text>
              <text
                x={14}
                y={(GRAPH_TOP + GRAPH_BOTTOM) / 2}
                fill="#e2e8f0"
                fontSize="11"
                textAnchor="middle"
                transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}
              >
                brightness, compared with matter-only
              </text>

              {/* Matter-only prediction (the reference: 1) */}
              <polyline points={matterOnlyLine} fill="none" stroke={MATTER_ONLY_COLOR} strokeWidth={2.5} />

              {/* Prediction with the chosen dark energy */}
              {isActive && chosenLine && (
                <polyline points={chosenLine} fill="none" stroke={CHOSEN_COLOR} strokeWidth={2.5} />
              )}

              {/* Astronomers' best fit (a given reference curve), drawn on top so it stays visible when it coincides with your line */}
              <polyline
                points={bestFitLine}
                fill="none"
                stroke={BEST_FIT_COLOR}
                strokeWidth={2}
                strokeDasharray="6 4"
              />

              {/* Legend */}
              <g transform={`translate(${GRAPH_LEFT + 10}, ${GRAPH_BOTTOM - 62})`}>
                <line x1={0} y1={0} x2={22} y2={0} stroke={MATTER_ONLY_COLOR} strokeWidth={2.5} />
                <text x={28} y={3} fill="#e2e8f0" fontSize="10">
                  matter-only prediction
                </text>
                <line
                  x1={0}
                  y1={14}
                  x2={22}
                  y2={14}
                  stroke={BEST_FIT_COLOR}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                <text x={28} y={17} fill="#e2e8f0" fontSize="10">
                  astronomers' best fit (about {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}% dark energy)
                </text>
                <line x1={0} y1={28} x2={22} y2={28} stroke={CHOSEN_COLOR} strokeWidth={2.5} />
                <text x={28} y={31} fill="#e2e8f0" fontSize="10">
                  prediction with your chosen dark energy
                </text>
              </g>
            </svg>
          )}
        </div>

        {hasSubmittedPrediction && (
          <div
            style={{
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              marginTop: '0.75rem',
              lineHeight: 1.55,
            }}
          >
            <p style={{ marginTop: 0, marginBottom: '0.6rem' }}>
              <strong>How to read this diagram.</strong> Both pictures answer one question: how bright do
              faraway exploding stars look, compared with what a universe made of only matter would predict?
              If they look dimmer than that, they are farther away than that universe says, and that is how we
              can tell the expansion has been speeding up.
            </p>

            <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
              <strong>The left picture: three supernovae.</strong>
            </p>
            <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
              <li>
                <strong>Earth</strong> is on the left, where we are looking from. The three exploding stars
                sit at redshifts 0.2, 0.5 and 0.8. A bigger redshift means the star is farther away and its
                light left it longer ago. All three stars have exactly the same true brightness, so any
                difference in how bright they look comes from distance alone.
              </li>
              <li>
                The <strong style={{ color: MATTER_ONLY_COLOR }}>dashed blue ring</strong> shows how bright
                that star would look in a universe containing only matter. Think of it as the "expected"
                brightness.
              </li>
              <li>
                The <strong style={{ color: CHOSEN_COLOR }}>glowing disk</strong> shows how bright it looks
                with the dark energy you chose. The disk's area is drawn in proportion to brightness, and the
                percentage under it says how bright it is compared with the ring. A disk smaller than its ring
                means the star looks <em>dimmer</em> than expected.
              </li>
              <li>
                <strong>Why dimmer means farther.</strong> Light spreads out as it travels, so brightness
                falls with the square of the distance. Like car headlights: a car twice as far away looks one
                quarter as bright. So a star that looks one quarter as bright as expected must be twice as far
                as expected. The same logic applies here, just with smaller changes.
              </li>
            </ul>

            <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
              <strong>The right picture: the same comparison at every distance.</strong>
            </p>
            <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
              <li>
                Across the bottom is <strong>redshift</strong> (how far away the star is). Up the side is{' '}
                <strong>brightness compared with matter-only</strong>, where 1.0 means "exactly as bright as a
                matter-only universe predicts" and 0.7 means "70% as bright".
              </li>
              <li>
                The <strong style={{ color: MATTER_ONLY_COLOR }}>blue line</strong> is the matter-only
                prediction. It is flat at 1.0 because we are measuring everything against it.
              </li>
              <li>
                The <strong style={{ color: CHOSEN_COLOR }}>amber line</strong> is the prediction for the dark
                energy you chose. It appears when you run, and it moves when you change the amount. Where it
                sits <em>below</em> the blue line, the stars look dimmer than expected.
              </li>
              <li>
                The <strong style={{ color: BEST_FIT_COLOR }}>green dashed line</strong> is the best fit
                astronomers have found to real supernova observations. It is a model curve, not individual
                measurements. If your amber line lies on top of the green line, your universe looks like the
                one we observe.
              </li>
              <li>
                Notice that all three lines meet at the left, and spread apart toward the right. That means
                nearby objects look the same in every universe, and only very distant ones show the
                difference. This is why Hubble's Law (Experiment 1) worked for nearby galaxies.
              </li>
            </ul>

            <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
              <strong>Things to try.</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
              <li>
                <strong>None (matter only):</strong> the amber line lies right on the blue line, and every
                disk fills its ring. Nothing looks dimmer than expected.
              </li>
              <li>
                <strong>The best fit (about {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}%):</strong> the
                amber line lies on the green line, and the disks shrink inside their rings, more so for the
                farther stars.
              </li>
              <li>
                <strong>Custom:</strong> drag the slider and run again. A small share dims the stars a little,
                and a large share dims them a lot. The line above the pictures also tells you whether the
                expansion today is speeding up or slowing down. In this model it speeds up once dark energy is
                more than about one third of the total.
              </li>
            </ul>
            <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
              The numbers above the pictures are exact. The colors and disk sizes are drawn to help you see
              the comparison.
            </p>
          </div>
        )}
        {status === 'complete' && submittedGravityPrediction && submittedLooksPrediction && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color, #ccc)',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You chose <strong>{Math.round(share * 100)}% dark energy</strong>. In this universe the
              expansion today is{' '}
              <strong>{result.isExpansionAccelerating ? 'speeding up' : 'slowing down'}</strong>. How far away
              each supernova appears, and how bright it looks compared with a matter-only universe:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '0.25rem 1rem 0.25rem 0' }}>Redshift</th>
                    <th style={{ textAlign: 'right', padding: '0.25rem 1rem' }}>
                      Distance, matter only (Mpc)
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.25rem 1rem' }}>
                      Distance, your universe (Mpc)
                    </th>
                    <th style={{ textAlign: 'right', padding: '0.25rem 0 0.25rem 1rem' }}>Brightness</th>
                  </tr>
                </thead>
                <tbody>
                  {result.supernovae.map((sn) => (
                    <tr key={sn.redshift}>
                      <td style={{ padding: '0.25rem 1rem 0.25rem 0' }}>{sn.redshift}</td>
                      <td style={{ textAlign: 'right', padding: '0.25rem 1rem' }}>
                        {sn.matterOnlyDistanceMpc.toFixed(0)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.25rem 1rem' }}>
                        {sn.distanceMpc.toFixed(0)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.25rem 0 0.25rem 1rem' }}>
                        {(sn.brightnessRelativeToMatterOnly * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              {shareVerdict === 'match'
                ? "With this share, the predicted brightness stays within 5% of the astronomers' best fit at every redshift, so this universe would look like the one we observe."
                : shareVerdict === 'too-little'
                  ? 'With this share, distant supernovae still look brighter than the best fit says they do: this is not yet enough dark energy to explain what is observed.'
                  : 'With this share, distant supernovae look dimmer than the best fit says they do: this is more dark energy than the observations call for.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your first prediction:</strong> asked how gravity would affect the expansion in
              a matter-only universe, you answered "
              {gravityEffectChoices.find((c) => c.value === submittedGravityPrediction)!.label}". Matter pulls
              on other matter, so it works against the expansion: in this model a matter-only universe is{' '}
              {decelerationParameter(0) > 0 ? 'slowing down' : 'speeding up'} today —{' '}
              {submittedGravityPrediction === ACTUAL_GRAVITY_EFFECT
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your second prediction:</strong> you guessed a faraway supernova would look{' '}
              {looksChoices.find((c) => c.value === submittedLooksPrediction)!.label.toLowerCase()} if the
              expansion were speeding up. With the best-fit {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}%
              dark energy, a supernova at redshift 0.5 looks only{' '}
              {(bestFitMiddleSupernova.brightnessRelativeToMatterOnly * 100).toFixed(0)}% as bright as in a
              matter-only universe, because the extra stretching of space has carried it farther away —{' '}
              {submittedLooksPrediction === ACTUAL_LOOKS
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>A worked example.</strong> At redshift 0.5, a matter-only universe puts the supernova at
              about {middleSupernova.matterOnlyDistanceMpc.toFixed(0)} Mpc, and your universe puts it at about{' '}
              {middleSupernova.distanceMpc.toFixed(0)} Mpc. Brightness falls with the square of the distance,
              so its brightness compared with matter-only is (
              {middleSupernova.matterOnlyDistanceMpc.toFixed(0)} ÷ {middleSupernova.distanceMpc.toFixed(0)})²
              ≈ {middleSupernova.brightnessRelativeToMatterOnly.toFixed(2)}, about{' '}
              {((1 - middleSupernova.brightnessRelativeToMatterOnly) * 100).toFixed(0)}% dimmer.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Nearby objects agree.</strong> At a tiny redshift of {NEARBY_REDSHIFT}, a matter-only
              universe puts a supernova at about {luminosityDistanceMpc(NEARBY_REDSHIFT, 0).toFixed(1)} Mpc
              and yours puts it at about {luminosityDistanceMpc(NEARBY_REDSHIFT, share).toFixed(1)} Mpc:
              essentially the same. That is why Hubble's Law (Experiment 1) worked so well for nearby
              galaxies: the different versions of the universe only disagree at large distances.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              This kind of measurement is real: in 1998 and 1999 two independent research teams found that
              distant Type Ia supernovae look dimmer than a slowing universe predicts, and that discovery
              shared the 2011 Nobel Prize in Physics.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Remember:</strong> this model treats the universe as flat, with only matter and a
              constant dark energy, and treats supernovae as perfect standard candles. The "best fit" line is
              the model astronomers found to match real supernovae, not raw data. It uses the same
              illustrative Hubble constant as Experiment 1 (70 km/s/Mpc), and the real value is still debated
              (about 67 to 73).
            </p>
          </div>
        )}
      </div>

      {status === 'complete' && submittedGravityPrediction && submittedLooksPrediction && (
        <DarkEnergyTutor
          key={runCount}
          predictedGravity={submittedGravityPrediction}
          predictedLooks={submittedLooksPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
