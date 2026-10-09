import { useEffect, useState } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  FUTURE_GRAPH_MAX_YEARS,
  MAX_DARK_ENERGY_FRACTION,
  PAST_GRAPH_YEARS,
  expansionRateAtSize,
  futureRelativeSize,
  longTermExpansionRate,
  runFateOfTheUniverseExperiment,
  yearsToGrow,
} from '../physics/fateOfTheUniverseExperiment'
import { universeAgeYears } from '../physics/universeAgeExperiment'
import { FateOfTheUniverseTutor } from './FateOfTheUniverseTutor'

interface FateOfTheUniverseExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type ShareMode = 'none' | 'weaker' | 'bestFit' | 'stronger' | 'custom'

const PRESET_SHARES: Record<Exclude<ShareMode, 'custom'>, number> = {
  none: 0,
  weaker: 0.3,
  bestFit: BEST_FIT_DARK_ENERGY_FRACTION,
  stronger: MAX_DARK_ENERGY_FRACTION,
}

// This experiment's two prediction questions, per its specification's "Prediction Activity", both about
// the real (best-fit) universe. Choices are not scored here.
type FarFutureChoice = 'stops' | 'slower' | 'faster'
const farFutureChoices: Array<{ value: FarFutureChoice; label: string }> = [
  { value: 'stops', label: 'The expansion slows down and stops' },
  { value: 'slower', label: 'The expansion keeps going, but ever more slowly' },
  { value: 'faster', label: 'The expansion keeps speeding up and never stops' },
]

type NextDoublingChoice = 'shorter' | 'same' | 'longer'
const nextDoublingChoices: Array<{ value: NextDoublingChoice; label: string }> = [
  { value: 'shorter', label: 'Shorter, about 5 billion years' },
  { value: 'same', label: 'About the same, about 11 billion years' },
  { value: 'longer', label: 'Much longer, about 30 billion years' },
]

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 10000

const CHOSEN_COLOR = '#fbbf24'
const REFERENCE_COLOR = '#38bdf8'
const CLUSTER_COLOR = '#60a5fa'
const MUTED_COLOR = '#94a3b8'

// Size-versus-time graph: relative size on a logarithmic vertical axis, time from now horizontally.
const GRAPH_WIDTH = 560
const GRAPH_HEIGHT = 340
const GRAPH_LEFT = 64
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 54
const GRAPH_BOTTOM = GRAPH_HEIGHT - 50
const GRAPH_MIN_SIZE = 0.1
const GRAPH_MAX_SIZE = 1000
const CURVE_POINTS = 220
const TIME_TICKS_BILLIONS = [-10, 0, 20, 40, 60, 80, 100]
const SIZE_TICKS = [0.1, 1, 10, 100, 1000]

const GRAPH_TIME_SPAN = FUTURE_GRAPH_MAX_YEARS + PAST_GRAPH_YEARS
const LOG_SPAN = Math.log10(GRAPH_MAX_SIZE) - Math.log10(GRAPH_MIN_SIZE)

function graphX(yearsFromNow: number): number {
  return GRAPH_LEFT + ((yearsFromNow + PAST_GRAPH_YEARS) / GRAPH_TIME_SPAN) * (GRAPH_RIGHT - GRAPH_LEFT)
}

function graphY(size: number): number {
  const fraction = (Math.log10(size) - Math.log10(GRAPH_MIN_SIZE)) / LOG_SPAN
  return GRAPH_BOTTOM - fraction * (GRAPH_BOTTOM - GRAPH_TOP)
}

// Doubling-time bars: a fixed, labeled scale, so bars are comparable between runs. A bar longer than the
// scale is cut off with a break mark and labeled with its real length.
const BARS_WIDTH = 560
const BARS_HEIGHT = 230
const BARS_LEFT = 110
const BARS_SCALE_WIDTH = 380
const BARS_SCALE_MAX_YEARS = 80e9
const BARS_TOP = 56
const BARS_ROW_HEIGHT = 34
const BARS_TICKS_BILLIONS = [0, 20, 40, 60, 80]

function barX(years: number): number {
  return BARS_LEFT + (Math.min(years, BARS_SCALE_MAX_YEARS) / BARS_SCALE_MAX_YEARS) * BARS_SCALE_WIDTH
}

// "Galaxies spreading out" strip. Schematic: the spacing shown adds the same step for every doubling of
// the size, so that the strip fits on screen at every size the run reaches.
const STRIP_WIDTH = 560
const STRIP_HEIGHT = 190
const STRIP_CLUSTER_X = 70
const STRIP_Y = 100
const STRIP_GALAXIES = 3

function stripSpacing(size: number): number {
  return 40 + 11 * Math.log2(Math.max(size, 1))
}

const billions = (years: number, digits = 1) => (years / 1e9).toFixed(digits)

function formatSize(size: number): string {
  if (size >= 100) return Math.round(size).toString()
  if (size >= 10) return size.toFixed(1)
  return size.toFixed(2)
}

const svgStyle = {
  display: 'block',
  marginTop: '1rem',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  backgroundColor: '#0b1020',
  maxWidth: '100%',
  height: 'auto',
} as const

export function FateOfTheUniverseExperiment({ onComplete, onTutorComplete }: FateOfTheUniverseExperimentProps) {
  const [mode, setMode] = useState<ShareMode>('bestFit')
  const [customShare, setCustomShare] = useState(0.5)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [farFuturePrediction, setFarFuturePrediction] = useState<FarFutureChoice | null>(null)
  const [nextDoublingPrediction, setNextDoublingPrediction] = useState<NextDoublingChoice | null>(null)
  const [submittedFarFuturePrediction, setSubmittedFarFuturePrediction] = useState<FarFutureChoice | null>(null)
  const [submittedNextDoublingPrediction, setSubmittedNextDoublingPrediction] =
    useState<NextDoublingChoice | null>(null)

  const hasPrediction = farFuturePrediction !== null && nextDoublingPrediction !== null
  const hasSubmittedPrediction =
    submittedFarFuturePrediction !== null && submittedNextDoublingPrediction !== null

  const share = mode === 'custom' ? customShare : PRESET_SHARES[mode]
  const result = runFateOfTheUniverseExperiment(share)
  const isActive = status === 'running' || status === 'complete'

  const handleModeChange = (next: ShareMode) => {
    setMode(next)
    if (status === 'complete') setStatus('idle')
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedFarFuturePrediction(farFuturePrediction)
      setSubmittedNextDoublingPrediction(nextDoublingPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's precedent: re-opens both questions for editing without resetting
  // the chosen share.
  const handleChangePrediction = () => {
    setSubmittedFarFuturePrediction(null)
    setSubmittedNextDoublingPrediction(null)
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

  // Simulated time and playback are separate (CLAUDE.md §11): the run sweeps linearly from now to the
  // end of the time axis, and every number shown comes from the physics model at that moment.
  const displayedProgress = status === 'idle' ? 0 : progress
  const yearsFromNow = displayedProgress * FUTURE_GRAPH_MAX_YEARS
  const currentSize = futureRelativeSize(yearsFromNow, share)

  // The past (left of today) is always drawn; the future is drawn up to the current moment.
  const lineFor = (darkEnergyFraction: number) => {
    const points: string[] = []
    for (let i = 0; i <= CURVE_POINTS; i++) {
      const t = -PAST_GRAPH_YEARS + (i / CURVE_POINTS) * (yearsFromNow + PAST_GRAPH_YEARS)
      const size = futureRelativeSize(t, darkEnergyFraction)
      // Points below the axis (the earliest moments of a universe with little dark energy) are skipped.
      if (size >= GRAPH_MIN_SIZE) points.push(`${graphX(t).toFixed(1)},${graphY(size).toFixed(1)}`)
    }
    return points.join(' ')
  }
  const chosenLine = lineFor(share)
  const referenceLine = share > 0 ? lineFor(0) : ''

  const speedUpVisible =
    result.speedUpYearsFromNow !== null &&
    result.speedUpYearsFromNow >= -PAST_GRAPH_YEARS &&
    result.speedUpYearsFromNow <= yearsFromNow

  // The doubling underway at this moment (none once the universe is past the last one drawn).
  const currentDoublingIndex = isActive
    ? result.doublings.findIndex((d) => currentSize >= d.fromSize && currentSize < d.toSize)
    : -1

  // Values for the Results panel. The predictions are marked against the real (best-fit) universe, and
  // the no-dark-energy run is used as the contrast, whatever share the learner is trying.
  const realResult = runFateOfTheUniverseExperiment(BEST_FIT_DARK_ENERGY_FRACTION)
  const noDarkEnergyResult = runFateOfTheUniverseExperiment(0)
  const sizeIn50 = futureRelativeSize(50e9, share)
  const settledDoublingYears = result.longTermDoublingTimeYears
  const doublingsIn50 = 50e9 / settledDoublingYears
  // The doublings have "settled" if the fourth is within 5% of the settled value.
  const hasSettled =
    settledDoublingYears !== Infinity &&
    result.doublings[result.doublings.length - 1].years >= 0.95 * settledDoublingYears
  // The steady-doubling rule is a fair estimate only if even the first doubling is already close to the
  // settled time (at least 70% of it).
  const ruleApplies =
    settledDoublingYears !== Infinity && result.doublings[0].years >= 0.7 * settledDoublingYears
  const settledEstimate = Math.pow(2, doublingsIn50)
  const estimateGapPercent = Math.abs(sizeIn50 - settledEstimate) / sizeIn50 * 100
  // A galaxy 100 megaparsecs away today: how fast it moves away now, and after 50 billion years.
  const EXAMPLE_DISTANCE_MPC = 100
  const exampleSpeedToday = expansionRateAtSize(1, share) * EXAMPLE_DISTANCE_MPC
  const exampleSpeedIn50 = expansionRateAtSize(sizeIn50, share) * EXAMPLE_DISTANCE_MPC * sizeIn50
  const withCommas = (n: number) => Math.round(n).toLocaleString('en-US')

  // Labels near the right edge of the bars picture are drawn inside the bar or to the left of the marker
  // so that they are never cut off.
  const nearRightEdge = barX(settledDoublingYears) > BARS_LEFT + 200

  const stepNow = stripSpacing(currentSize)
  const nextDoublingYears = yearsToGrow(currentSize, 2 * currentSize, share)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 10 — The Fate of the Universe: Does the Expansion Ever Stop?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> The universe is expanding (Experiments 1 and 2), and Experiments 5
            and 6 showed that dark energy has been speeding that expansion up. So what happens next? Does the
            expansion ever stop? Does it slow down, or turn around, or does it go on forever?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You choose how much of the universe's energy is dark energy, and
            the experiment runs the same simple model as Experiments 5 and 6 forward in time, up to 100
            billion years from now. Three pictures show the result: a graph of how big the universe becomes
            compared with today, a set of bars showing how long the universe takes to double in size, and a
            drawing of galaxies spreading apart.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> The universe's <strong>size</strong> here means the
            distances between faraway galaxies, compared with what they are today (as in Experiment 6). Today
            is 1×, and 2× means every such distance has doubled. The <strong>doubling time</strong> is how
            long the universe takes to double in size. If it doubles in 10 billion years, then two galaxies
            that are 100 million light-years apart today will be 200 million light-years apart after 10
            billion years. The <strong>expansion rate</strong> is how fast distances are growing, for each
            unit of distance. It is the number from Hubble's Law (Experiment 1): at 70 kilometers per second
            per <strong>megaparsec</strong> (a megaparsec is about 3.3 million light-years), a galaxy one
            megaparsec away moves away at 70 kilometers per second. The word "constant" in "Hubble constant"
            means the same everywhere in space at one moment. It does not mean the same for all time, and in
            this experiment the expansion rate can change as the universe ages. What sets the rate is what the
            universe contains: the matter and the dark energy each add a part to it. We call each one's part
            its <strong>contribution</strong>. The two contributions add up to 1 today (for the real universe,
            matter's is 0.30 and dark energy's is 0.70), and you will see how they change.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What "flat" means here.</strong> When we say the universe is <strong>flat</strong>, we mean
            the shape of space itself, averaged over very large distances. In flat space, the geometry you
            learned at school works: two straight lines that start out parallel stay parallel forever, and the
            angles of a triangle add up to 180°.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            Space could instead be curved on the largest scales. You met curved space in Gravity and Curved
            Spacetime, Experiment 4: two travelers walking as straight as they could across a sphere started
            side by side and ended up meeting at the pole. A universe whose space was curved like a sphere
            would do something similar on the grandest scale.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            This is a different idea from the curved spacetime around a star or a planet, which bends the
            paths of things passing close by. "Flat" here is only about the overall shape of space at one
            moment, once you zoom out so far that galaxies blur into a smooth background. A flat universe can
            still be expanding. A comparison: the Earth is curved, but a tabletop is flat for everyday
            purposes, because you are looking at a tiny piece of it.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            Measurements of the oldest light (Experiment 3), combined with other measurements, find space to
            be flat to within less than half a percent. This experiment assumes it is exactly flat. That has a
            simple consequence: the contributions of matter and dark energy to the expansion add up to exactly
            1 (the 0.30 and 0.70 used later), with no third contribution from curvature.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> So far, this chapter has described the universe as it was, or
            as it is. This is the first time we use the model to ask where the universe is heading. That is
            also a test of how well we understand it: a model that gets the past right should be able to say
            what comes next, and the places where it cannot, because the answer depends on something we do
            not know, show what is still missing. You will see that the future depends on one thing above all:
            how much dark energy there is.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make two predictions. Then choose a share of dark energy and run
            it. Try the other choices too, and compare.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> How the bars change from one doubling to the next, how the gold
            line compares with the blue dashed line (the universe with no dark energy), and what happens to
            the expansion rate in the readout. We reuse the expansion from Experiments 1 and 2, and dark
            energy and the universe's age from Experiments 5 and 6, with the same meaning.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The same simple universe as Experiments 5, 6, 8 and 9: "flat" (explained above), containing
              matter and dark energy, with an illustrative Hubble constant of 70
              kilometers per second per megaparsec, with the same real caveat: published values range from
              about 67 to 73, the "Hubble tension." Light and other very fast particles are left out. They
              mattered only in the very early universe, so they make no practical difference to the future.
            </li>
            <li>
              <strong>The dark energy is assumed to be a constant that never changes.</strong> That is the
              simplest possibility, and many measurements fit it. But it is being tested, and some recent
              results hint that dark energy may be weakening over time. Nobody yet knows what dark energy is,
              and if it changed with time, the future could be very different. This is the biggest uncertainty
              in this experiment.
            </li>
            <li>
              The universe is assumed to be exactly flat, as in the earlier experiments, and not worked out
              here. A universe that was not flat would add a third contribution to the expansion, and could
              behave differently in the far future. This experiment does not cover that.
            </li>
            <li>
              Only the expansion is modeled. The experiment says how the size of the universe changes. It
              does not say anything about stars running out of fuel, black holes, or the universe becoming cold
              and dark, though many people think of those as "the end of the universe."
            </li>
            <li>
              Things held together by their own gravity do not expand: a galaxy, our Milky Way and its
              neighbors, the Solar System, you. Only the space between such groups stretches. This is stated
              here, not modeled.
            </li>
            <li>
              Every universe you try is matched to the real one today: the same expansion rate and the same
              size. A universe with no dark energy would then be younger today than one with dark energy, as
              in Experiment 6.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            The universe is expanding today. What do you think the far future looks like?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {farFutureChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setFarFuturePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${farFuturePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Suppose the universe takes about 11 billion years to double in size from today. How long will the
            next doubling take, from twice today's size to four times?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {nextDoublingChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setNextDoublingPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${nextDoublingPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  farFutureChoices.find((c) => c.value === (farFuturePrediction ?? submittedFarFuturePrediction))!
                    .label
                }; ${
                  nextDoublingChoices.find(
                    (c) => c.value === (nextDoublingPrediction ?? submittedNextDoublingPrediction),
                  )!.label
                }`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many dark energy shares as you like
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
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Share of the universe's energy that is dark energy:
          </p>
          {(
            [
              ['none', 'None (0%)'],
              ['weaker', 'Weaker (30%)'],
              ['bestFit', `The best fit to observations (about ${Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}%)`],
              ['stronger', `Stronger (${Math.round(MAX_DARK_ENERGY_FRACTION * 100)}%)`],
              ['custom', 'Custom'],
            ] as Array<[ShareMode, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => handleModeChange(value)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${mode === value ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {label}
            </button>
          ))}
          {mode === 'custom' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="fate-share" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Dark energy: {Math.round(customShare * 100)}% of the total (matter makes up the other{' '}
                {100 - Math.round(customShare * 100)}%)
              </label>
              <input
                id="fate-share"
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
            Dark energy share: {Math.round(share * 100)}% &nbsp;|&nbsp; Years from now:{' '}
            <strong>{billions(yearsFromNow)} billion</strong> &nbsp;|&nbsp; Size: <strong>{formatSize(currentSize)}×</strong>{' '}
            today's
            <br />
            Expansion rate: {expansionRateAtSize(currentSize, share).toFixed(1)} km/s per megaparsec &nbsp;|&nbsp;
            Time for the next doubling: <strong>{billions(nextDoublingYears)} billion years</strong>
          </p>
        )}

        {hasSubmittedPrediction && (
          <>
        <svg
          width={GRAPH_WIDTH}
          height={GRAPH_HEIGHT}
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          style={svgStyle}
        >
          <text x={GRAPH_WIDTH / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
            How big the universe is, from the past into the future
          </text>

          {/* Legend */}
          <g fontSize="10" fill="#e2e8f0">
            <line x1={GRAPH_LEFT + 10} y1={36} x2={GRAPH_LEFT + 34} y2={36} stroke={CHOSEN_COLOR} strokeWidth={3.5} />
            <text x={GRAPH_LEFT + 40} y={39}>With your dark energy</text>
            <line x1={GRAPH_LEFT + 200} y1={36} x2={GRAPH_LEFT + 224} y2={36} stroke={REFERENCE_COLOR} strokeWidth={2} strokeDasharray="6 4" />
            <text x={GRAPH_LEFT + 230} y={39}>
              {share > 0 ? 'No dark energy (for comparison)' : 'No dark energy (the same as your choice)'}
            </text>
          </g>

          {/* Axes and tick labels */}
          <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#64748b" />
          <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#64748b" />
          {TIME_TICKS_BILLIONS.map((t) => (
            <g key={t}>
              <line x1={graphX(t * 1e9)} y1={GRAPH_BOTTOM} x2={graphX(t * 1e9)} y2={GRAPH_BOTTOM + 4} stroke="#64748b" />
              <text x={graphX(t * 1e9)} y={GRAPH_BOTTOM + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          {SIZE_TICKS.map((s) => (
            <g key={s}>
              <line x1={GRAPH_LEFT - 4} y1={graphY(s)} x2={GRAPH_LEFT} y2={graphY(s)} stroke="#64748b" />
              <line x1={GRAPH_LEFT} y1={graphY(s)} x2={GRAPH_RIGHT} y2={graphY(s)} stroke="#1e293b" />
              <text x={GRAPH_LEFT - 8} y={graphY(s) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
                {s}×
              </text>
            </g>
          ))}
          <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_HEIGHT - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle">
            Years from now (billions). Left of 0 is the past.
          </text>
          <text
            x={14}
            y={(GRAPH_TOP + GRAPH_BOTTOM) / 2}
            fill="#cbd5e1"
            fontSize="11"
            textAnchor="middle"
            transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}
          >
            Size compared with today (log scale)
          </text>

          {/* Today */}
          <line x1={graphX(0)} y1={GRAPH_TOP} x2={graphX(0)} y2={GRAPH_BOTTOM} stroke="#475569" strokeDasharray="4 4" />
          <text x={graphX(0) + 5} y={GRAPH_TOP + 12} fill={MUTED_COLOR} fontSize="10">
            today
          </text>

          {referenceLine && (
            <polyline points={referenceLine} fill="none" stroke={REFERENCE_COLOR} strokeWidth={2} strokeDasharray="6 4" />
          )}
          {chosenLine && <polyline points={chosenLine} fill="none" stroke={CHOSEN_COLOR} strokeWidth={3.5} />}

          {/* Where the expansion started to speed up, once the line has reached it */}
          {speedUpVisible && result.speedUpYearsFromNow !== null && (
            <g>
              <circle cx={graphX(result.speedUpYearsFromNow)} cy={graphY(result.speedUpSize)} r={5} fill="#f472b6" stroke="#0b1020" strokeWidth={1.5} />
              <text
                x={graphX(result.speedUpYearsFromNow) + 9}
                y={graphY(result.speedUpSize) + 18}
                fill="#f472b6"
                stroke="#0b1020"
                strokeWidth={3}
                paintOrder="stroke"
                fontSize="10"
                fontWeight="600"
              >
                <tspan x={graphX(result.speedUpYearsFromNow) + 9}>Expansion starts</tspan>
                <tspan x={graphX(result.speedUpYearsFromNow) + 9} dy="12">speeding up</tspan>
              </text>
            </g>
          )}

          {/* The moving point: where the universe is right now in the run */}
          {isActive && (
            <circle cx={graphX(yearsFromNow)} cy={graphY(currentSize)} r={5} fill="#ffffff" stroke={CHOSEN_COLOR} strokeWidth={2} />
          )}
        </svg>

        <svg
          width={BARS_WIDTH}
          height={BARS_HEIGHT}
          viewBox={`0 0 ${BARS_WIDTH} ${BARS_HEIGHT}`}
          style={svgStyle}
        >
          <text x={BARS_WIDTH / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
            How long each doubling of the universe's size takes
          </text>

          {result.longTermDoublingTimeYears !== Infinity && (
            <g>
              <line
                x1={barX(result.longTermDoublingTimeYears)}
                y1={BARS_TOP - 12}
                x2={barX(result.longTermDoublingTimeYears)}
                y2={BARS_TOP + BARS_ROW_HEIGHT * result.doublings.length - 6}
                stroke="#f472b6"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text
                x={barX(result.longTermDoublingTimeYears) + (nearRightEdge ? -4 : 4)}
                y={BARS_TOP - 16}
                fill="#f472b6"
                fontSize="10"
                fontWeight="600"
                textAnchor={nearRightEdge ? 'end' : 'start'}
              >
                Settles to {billions(result.longTermDoublingTimeYears)} billion years
                {result.longTermDoublingTimeYears > BARS_SCALE_MAX_YEARS ? ' (off the scale)' : ''}
              </text>
            </g>
          )}
          {result.longTermDoublingTimeYears === Infinity && (
            <text x={BARS_LEFT} y={BARS_TOP - 16} fill="#f472b6" fontSize="10" fontWeight="600">
              No dark energy: it never settles, each doubling takes longer
            </text>
          )}

          {result.doublings.map((d, i) => {
            const y = BARS_TOP + i * BARS_ROW_HEIGHT
            const clipped = d.years > BARS_SCALE_MAX_YEARS
            const endX = barX(d.years)
            const labelInside = clipped || endX - BARS_LEFT > 230
            return (
              <g key={d.fromSize}>
                <text x={BARS_LEFT - 8} y={y + 16} fill="#cbd5e1" fontSize="11" textAnchor="end">
                  {d.fromSize}× → {d.toSize}×
                </text>
                <rect
                  x={BARS_LEFT}
                  y={y + 4}
                  width={endX - BARS_LEFT}
                  height={20}
                  fill={CHOSEN_COLOR}
                  stroke={currentDoublingIndex === i ? '#ffffff' : 'none'}
                  strokeWidth={2.5}
                  rx={2}
                />
                {clipped && (
                  <path
                    d={`M ${endX - 8} ${y + 2} l 6 8 l -6 4 l 6 8 l -6 4`}
                    fill="none"
                    stroke="#0b1020"
                    strokeWidth={3}
                  />
                )}
                {labelInside ? (
                  <text x={BARS_LEFT + 10} y={y + 18} fill="#0b1020" fontSize="11" fontWeight="700">
                    {billions(d.years)} billion years{clipped ? ' (off the scale)' : ''}
                  </text>
                ) : (
                  <text
                    x={endX + 8}
                    y={y + 18}
                    fill="#e2e8f0"
                    stroke="#0b1020"
                    strokeWidth={3}
                    paintOrder="stroke"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {billions(d.years)} billion years
                  </text>
                )}
              </g>
            )
          })}

          {/* Time scale */}
          <line x1={BARS_LEFT} y1={BARS_TOP + BARS_ROW_HEIGHT * result.doublings.length} x2={BARS_LEFT + BARS_SCALE_WIDTH} y2={BARS_TOP + BARS_ROW_HEIGHT * result.doublings.length} stroke="#64748b" />
          {BARS_TICKS_BILLIONS.map((t) => (
            <g key={t}>
              <line x1={barX(t * 1e9)} y1={BARS_TOP + BARS_ROW_HEIGHT * result.doublings.length} x2={barX(t * 1e9)} y2={BARS_TOP + BARS_ROW_HEIGHT * result.doublings.length + 4} stroke="#64748b" />
              <text x={barX(t * 1e9)} y={BARS_TOP + BARS_ROW_HEIGHT * result.doublings.length + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <text x={BARS_LEFT + BARS_SCALE_WIDTH / 2} y={BARS_HEIGHT - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle">
            Time for the doubling (billions of years)
          </text>
        </svg>

        <svg
          width={STRIP_WIDTH}
          height={STRIP_HEIGHT}
          viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`}
          style={svgStyle}
        >
          <text x={STRIP_WIDTH / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
            Our cluster stays the same size while the space between groups stretches (schematic)
          </text>
          <text x={STRIP_WIDTH / 2} y={40} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            Spacing between groups now: {formatSize(currentSize)}× today's. The drawing is not to scale.
          </text>

          {/* Our cluster: bound by its own gravity, so it does not expand */}
          <circle cx={STRIP_CLUSTER_X} cy={STRIP_Y} r={24} fill="none" stroke={CLUSTER_COLOR} strokeDasharray="3 3" />
          {[
            [-9, 2],
            [2, -8],
            [8, 7],
          ].map(([dx, dy]) => (
            <circle key={`${dx}${dy}`} cx={STRIP_CLUSTER_X + dx} cy={STRIP_Y + dy} r={4.5} fill={CLUSTER_COLOR} />
          ))}
          <text x={STRIP_CLUSTER_X} y={STRIP_Y + 44} fill={CLUSTER_COLOR} fontSize="10" textAnchor="middle">
            <tspan x={STRIP_CLUSTER_X}>Our cluster</tspan>
            <tspan x={STRIP_CLUSTER_X} dy="12">(held together by gravity)</tspan>
          </text>

          {/* Distant galaxies, whose spacing follows the size of the universe */}
          {Array.from({ length: STRIP_GALAXIES }, (_, k) => {
            const x = STRIP_CLUSTER_X + (k + 1) * stepNow
            return (
              <g key={k}>
                <ellipse cx={x} cy={STRIP_Y} rx={9} ry={5} fill={CHOSEN_COLOR} />
                <text x={x} y={STRIP_Y + 24} fill={CHOSEN_COLOR} fontSize="10" textAnchor="middle">
                  Galaxy {String.fromCharCode(65 + k)}
                </text>
              </g>
            )
          })}
          <line x1={STRIP_CLUSTER_X + 30} y1={STRIP_Y - 20} x2={STRIP_CLUSTER_X + STRIP_GALAXIES * stepNow} y2={STRIP_Y - 20} stroke={MUTED_COLOR} strokeWidth={1} />
          <text x={STRIP_CLUSTER_X + (30 + STRIP_GALAXIES * stepNow) / 2} y={STRIP_Y - 26} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            space between them stretches
          </text>
        </svg>

        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> The three pictures show the same run in three different
            ways: how big the universe gets, how long each doubling takes, and what happens to the galaxies.
            When you press <strong>Run</strong>, they play together for about 10 seconds, covering the next
            100 billion years. In every picture, the <span style={{ color: CHOSEN_COLOR }}>gold</span> color
            is the universe with the dark energy share you chose. The{' '}
            <span style={{ color: REFERENCE_COLOR }}>blue</span> dashed line is a universe with no dark
            energy, drawn only in the graph, as something to compare with.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 1, the graph: how big the universe gets.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>The bottom axis is time, counted from now.</strong> The number is in billions of years.
              0 is today. To the right is the future, up to 100 billion years from now. To the left of 0 is
              the past, back to 10 billion years ago, as this model works it out.
            </li>
            <li>
              <strong>The side axis is the universe's size, compared with today.</strong> It is the
              distances between faraway galaxies. 1× means the same as today, 2× means every such distance
              has doubled, and 0.5× would mean they were half as far apart. It is not the size of any one
              object. The dashed vertical line marked "today" is where the size is 1×.
            </li>
            <li>
              <strong>Why the side axis jumps by 10 each step.</strong> The marks go 0.1×, 1×, 10×, 100×,
              1000×. On an ordinary scale, going from 1× to 2× would be a tiny step beside going from 1× to
              1000×, and you could not see both. On this scale, every doubling is the same height, whether it
              is from 1× to 2× or from 100× to 200×. That gives you a simple way to read the line: a
              <strong> straight</strong> line means each doubling takes the same time as the one before; a line
              that <strong>bends toward flat</strong> means each doubling takes longer than the one before; a
              line that <strong>bends upward</strong> means each takes less time.
            </li>
            <li>
              <strong>The two lines.</strong> The <span style={{ color: CHOSEN_COLOR }}>gold line</span> is the
              universe with your dark energy share. The{' '}
              <span style={{ color: REFERENCE_COLOR }}>blue dashed line</span> is the same universe with no
              dark energy at all. If you choose 0%, the two are the same, so the gold line is drawn on top of
              the blue one and the legend says so. Both lines pass through 1× at "today", because every
              universe here is set up to match the real one today.
            </li>
            <li>
              <strong>The white dot</strong> is where the universe is right now during the run. It moves
              along the gold line from today toward 100 billion years from now.
            </li>
            <li>
              <strong>The <span style={{ color: '#f472b6' }}>pink dot</span></strong>, when it appears, marks the
              moment the expansion changes from slowing down to speeding up. "Speeding up" here means the
              speed at which faraway galaxies move apart gets larger and larger. The Results explain why that
              is not the same as the expansion rate rising. Move the dark energy control and run again: the
              pink dot moves, and with no dark energy it never appears, because that moment never comes.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 2, the bars: how long each doubling takes.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>What each bar is.</strong> There are four bars, one for each doubling of the universe's
              size: first from today's size to twice that (1× → 2×), then 2× → 4×, then 4× → 8×, then 8× →
              16×. The <strong>length of a bar is the time that doubling takes</strong>. For example, if the
              first bar is 10 billion years long, then 10 billion years from now every distance between
              faraway galaxies will be twice what it is today.
            </li>
            <li>
              <strong>Why doublings.</strong> A doubling is a fair unit for comparing growth. Doubling from
              1× to 2× and doubling from 100× to 200× are the same kind of step, even though the second
              adds far more distance. Comparing the bars with each other tells you whether the growth is
              speeding up, slowing down, or staying steady.
            </li>
            <li>
              <strong>The scale at the bottom</strong> is time in billions of years, and it is the same every
              time, from 0 to 80, so bars from different runs can be compared. If a doubling takes longer than
              80 billion years, its bar is cut at the edge with a zigzag break mark, and its real length is
              written inside the bar, as "(off the scale)".
            </li>
            <li>
              <strong>Comparing bar to bar.</strong> A longer bar means a slower doubling. Look down the four
              bars. Are they getting longer, staying about the same, or getting shorter? Then change the dark
              energy share and look again.
            </li>
            <li>
              <strong>The pink dashed line</strong>, when it appears, marks the value the doubling time settles
              toward once the universe is very large. With no dark energy there is no such value, and the
              picture says so instead.
            </li>
            <li>
              <strong>The white outline</strong> on one bar marks the doubling the universe is in at this
              moment of the run.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 3, the strip: what happens to the galaxies.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>What is drawn.</strong> A row of galaxies. The{' '}
              <span style={{ color: CLUSTER_COLOR }}>blue dots</span> on the left are our own home cluster:
              the Milky Way and its neighbors. The <span style={{ color: CHOSEN_COLOR }}>gold ovals</span> are
              three faraway galaxies, A, B and C.
            </li>
            <li>
              <strong>What it shows.</strong> As the run plays, the faraway galaxies move farther from our
              cluster and from each other, as the space between them stretches. But our cluster stays the same
              size. It is held together by its own gravity, which is far stronger than the stretching at that
              scale, so it does not expand. Think of dots drawn on a rubber sheet that is being stretched: the
              dots stay the same size, but the distances between them grow. (Like any comparison, this is not
              exact: in the real universe, the stretching is not a sheet being pulled from outside.)
            </li>
            <li>
              <strong>This drawing is not to scale.</strong> The line of text under the title gives the real
              number: how many times larger the spacing between groups is than today. That number is exact.
              The drawing shows it in a squeezed way, adding the same step for each doubling, so that it
              still fits on the screen. At 100 billion years in the real case, the true spacing would be
              hundreds of times today's, far too wide to draw.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>The line of numbers above the pictures.</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li>
              <strong>Years from now</strong> and <strong>Size</strong> are where the run is right now, the same
              as the white dot in Picture 1.
            </li>
            <li>
              <strong>Expansion rate</strong> is how fast distances are growing for each unit of distance, in
              kilometers per second for each megaparsec (about 3.3 million light-years) of distance.
            </li>
            <li>
              <strong>Time for the next doubling</strong> is how long the universe would take to double from
              the size it has right now. The motion is there only to help you see what is happening, and the
              numbers are exact.
            </li>
          </ul>
        </div>

            {status === 'complete' && submittedFarFuturePrediction && submittedNextDoublingPrediction && (
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color, #ccc)',
                }}
              >
                <h3 style={{ marginTop: 0 }}>Results</h3>
                <p>
                  You chose <strong>{Math.round(share * 100)}% dark energy</strong>. For that choice:
                </p>
                <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                  <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                    <tbody>
                      {[
                        ["The universe's size in 50 billion years", `${formatSize(sizeIn50)}× today's`],
                        ["The universe's size in 100 billion years", `${formatSize(result.sizeAtEnd)}× today's`],
                        [
                          'The first four doublings take',
                          result.doublings.map((d) => billions(d.years)).join(', ') + ' billion years',
                        ],
                        [
                          'Do the doublings settle?',
                          settledDoublingYears === Infinity
                            ? 'No, each one takes longer'
                            : hasSettled
                              ? `Yes, toward ${billions(settledDoublingYears)} billion years`
                              : `Heading toward ${billions(settledDoublingYears)} billion years, but not there yet`,
                        ],
                        [
                          'Is the expansion speeding up today?',
                          result.accelerationToday ? 'Yes' : 'No, it is still slowing down',
                        ],
                        [
                          'When the expansion starts speeding up',
                          result.speedUpYearsFromNow === null
                            ? 'Never'
                            : result.speedUpYearsFromNow < 0
                              ? `It started about ${billions(-result.speedUpYearsFromNow)} billion years ago`
                              : `It will start about ${billions(result.speedUpYearsFromNow)} billion years from now`,
                        ],
                        [
                          'The expansion rate today, and after 100 billion years',
                          `${result.expansionRateToday.toFixed(1)} and ${result.expansionRateAtEnd.toFixed(1)} km/s per megaparsec`,
                        ],
                        [
                          'The value it settles toward',
                          result.longTermExpansionRate === 0
                            ? 'Zero (it keeps falling, but never reaches it)'
                            : `${result.longTermExpansionRate.toFixed(1)} km/s per megaparsec`,
                        ],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td style={{ padding: '0.25rem 1rem 0.25rem 0' }}>{label}</td>
                          <td style={{ textAlign: 'right', padding: '0.25rem 0' }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>A simple calculation.</strong>{' '}
                  {settledDoublingYears === Infinity ? (
                    <>
                      With no dark energy, each doubling takes about 2.83 times as long as the one before
                      (that number is 2 × the square root of 2). So the first doubling takes{' '}
                      {billions(result.doublings[0].years)} billion years, the next takes about{' '}
                      {billions(result.doublings[0].years)} × 2.83 ≈ {billions(result.doublings[0].years * 2.83, 0)}
                      , and the one after that about {billions(result.doublings[0].years * 2.83 * 2.83, 0)}. The
                      universe keeps growing, but more and more slowly.
                    </>
                  ) : ruleApplies ? (
                    <>
                      The first doubling takes {billions(result.doublings[0].years)} billion years, the next
                      takes {billions(result.doublings[1].years)}, and by the fourth the time is{' '}
                      {billions(result.doublings[3].years)}, close to the settled{' '}
                      {billions(settledDoublingYears)}. If every doubling took the settled{' '}
                      {billions(settledDoublingYears)} billion years, then 50 billion years would be 50 ÷{' '}
                      {billions(settledDoublingYears)} ≈ {doublingsIn50.toFixed(1)} doublings, and the size would
                      grow by 2 multiplied by itself {doublingsIn50.toFixed(1)} times, which is about{' '}
                      {formatSize(settledEstimate)}. The model's own value is {formatSize(sizeIn50)}, about{' '}
                      {estimateGapPercent.toFixed(0)}% {sizeIn50 > settledEstimate ? 'higher' : 'lower'}, because the
                      earliest doublings are shorter than the settled time: matter's pull has not yet faded.
                    </>
                  ) : (
                    <>
                      With so little dark energy, matter's pull is still strong for a long time. The doublings
                      take {result.doublings.map((d) => billions(d.years)).join(', ')} billion years: still
                      getting longer, and heading toward the settled {billions(settledDoublingYears)}. So the
                      simple rule of a steady doubling time does not describe the early part of the run. For a
                      long while, this universe behaves much like the one with no dark energy, and the steady
                      growth only takes over later.
                    </>
                  )}
                </p>

                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>What the expansion rate means for a galaxy's speed.</strong> Take a galaxy 100
                  megaparsecs away today. It moves away at {expansionRateAtSize(1, share).toFixed(0)} × 100 ={' '}
                  {withCommas(exampleSpeedToday)} kilometers per second. After 50 billion years the expansion rate
                  is {expansionRateAtSize(sizeIn50, share).toFixed(1)}, and that galaxy is {formatSize(sizeIn50)}{' '}
                  times farther away, so it moves away at about {withCommas(exampleSpeedIn50)} kilometers per
                  second. A galaxy's speed is the expansion rate times its distance.{' '}
                  {exampleSpeedIn50 > exampleSpeedToday
                    ? 'The rate has fallen, but it acts on a much larger distance, so the speed has still gone up: the expansion is speeding up even though the rate has dropped.'
                    : 'Here the rate falls by more than the distance grows, so the speed goes down: the expansion is slowing down.'}{' '}
                  (Far enough away, such speeds can be larger than the speed of light without breaking
                  relativity, because it is space stretching, not motion through space, as in Experiment 8.)
                </p>

                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Why the expansion rate is what it is.</strong> The expansion rate depends on what the
                  universe contains. In this model, you take two contributions, add them, and then take a square
                  root: <strong>expansion rate = today's rate × the square root of (matter's contribution +
                  dark energy's contribution)</strong>. (The square root is just how this model combines the
                  two. All you need is that the rate goes up when either contribution goes up, and down when
                  either goes down.)
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  Today, matter's contribution is {(1 - share).toFixed(2)} and dark energy's is {share.toFixed(2)},
                  and together they make 1.00. The square root of 1.00 is 1, so the rate is{' '}
                  {result.expansionRateToday.toFixed(0)} × 1 = <strong>{result.expansionRateToday.toFixed(0)}</strong>.
                  The two contributions behave differently as the universe grows. Matter thins out as the universe
                  grows, so its contribution shrinks. In this model, dark energy does not thin out, so its
                  contribution stays at {share.toFixed(2)}. After 50 billion years, the universe is{' '}
                  {formatSize(sizeIn50)} times bigger, and matter's contribution has shrunk to about{' '}
                  {((1 - share) / Math.pow(sizeIn50, 3)).toFixed(5)}. The total is about{' '}
                  {((1 - share) / Math.pow(sizeIn50, 3) + share).toFixed(share === 0 ? 4 : 2)}, and the rate is{' '}
                  {result.expansionRateToday.toFixed(0)} × √{((1 - share) / Math.pow(sizeIn50, 3) + share).toFixed(share === 0 ? 4 : 2)} ≈{' '}
                  <strong>{expansionRateAtSize(sizeIn50, share).toFixed(1)}</strong>.{' '}
                  {share > 0
                    ? `After that, almost nothing is left of matter's contribution, so the rate stops falling. It settles at today's rate × √(dark energy's share) = ${result.expansionRateToday.toFixed(0)} × √${share.toFixed(2)} ≈ ${result.longTermExpansionRate.toFixed(1)}.`
                    : "With no dark energy, there is nothing to hold the rate up. Matter's contribution keeps shrinking, so the rate keeps falling toward zero, and never quite reaches it."}
                </p>
                <p style={{ marginBottom: '0.25rem' }}>
                  The share sets the floor, so changing the dark energy changes where the rate settles:
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                  {[0.9, BEST_FIT_DARK_ENERGY_FRACTION, 0.33].map((x) => (
                    <li key={x}>
                      {Math.round(x * 100)}% dark energy: {result.expansionRateToday.toFixed(0)} × √{x.toFixed(2)} ≈{' '}
                      <strong>{longTermExpansionRate(x).toFixed(1)}</strong>
                      {x === 0.9 ? ' (a high floor, so the rate barely drops)' : ''}
                    </li>
                  ))}
                  <li>
                    No dark energy: there is no floor. The rate keeps falling toward zero (
                    {noDarkEnergyResult.expansionRateAtEnd.toFixed(1)} after 100 billion years), and never quite
                    reaches it.
                  </li>
                </ul>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Does dark energy change?</strong> In this model it does not: its contribution is assumed
                  to stay constant. That is an assumption, not a certainty, and astronomers are testing it right
                  now. Many measurements fit a constant dark energy. But in 2025, results from the DESI survey
                  (a map of millions of galaxies), combined with other measurements, hinted that dark energy may
                  be weakening over time. The hint was not strong enough to count as a discovery, and some
                  astronomers think errors in the supernova measurements could explain it. Newer results in 2026
                  have been mixed, and one of them moved back toward a constant dark energy. At the time of
                  writing (October 2026), the question is still open. If dark energy did change, the rate would
                  settle somewhere else and the future would be different (see the box below).
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>A comparison from daily life.</strong> Picture a bath fed by two taps. One tap slowly
                  turns itself down as time passes (matter). The other keeps running at the same rate (dark
                  energy, in this model). The total flow falls at first, then levels off at what the steady tap
                  supplies. A bigger steady tap means a higher level, and with no steady tap the flow dwindles
                  toward nothing. Like any comparison, it is not exact: the model combines the two
                  contributions with the square root above, not by simply adding two flows.
                </p>

                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Checking your first prediction:</strong> asked what the far future looks like, you
                  answered "{farFutureChoices.find((c) => c.value === submittedFarFuturePrediction)!.label}". For
                  the real universe (about {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}% dark energy), the
                  model gives a universe that grows to about {formatSize(futureRelativeSize(50e9, BEST_FIT_DARK_ENERGY_FRACTION))}{' '}
                  times today's size in 50 billion years and about {formatSize(realResult.sizeAtEnd)} times in
                  100 billion years, and the expansion keeps speeding up and never stops.{' '}
                  {submittedFarFuturePrediction === 'faster'
                    ? 'So your prediction was right.'
                    : submittedFarFuturePrediction === 'slower'
                      ? 'So your prediction was off this time. "Going on, but ever more slowly" is what the model gives with no dark energy: try the None preset and compare.'
                      : 'So your prediction was off this time. In this model the expansion does not stop, even with no dark energy: with only matter, it slows down forever without quite stopping.'}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Checking your second prediction:</strong> asked how long the next doubling takes, you
                  answered "{nextDoublingChoices.find((c) => c.value === submittedNextDoublingPrediction)!.label}". For
                  the real universe, the first doubling takes {billions(realResult.doublings[0].years)} billion
                  years and the next takes {billions(realResult.doublings[1].years)}, about the same, and the
                  doublings settle toward {billions(realResult.longTermDoublingTimeYears)} billion years. With no
                  dark energy the next doubling would take {billions(noDarkEnergyResult.doublings[1].years, 0)} billion
                  years instead.{' '}
                  {submittedNextDoublingPrediction === 'same'
                    ? 'So your prediction was right.'
                    : 'So your prediction was off this time.'}
                </p>

                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>A comparison from daily life.</strong> Think of a savings account that earns a fixed
                  interest rate. It takes the same number of years to double from 100 dollars to 200 as from
                  1,000 to 2,000, however large the balance gets, because the interest is always the same
                  fraction of what is there. With dark energy, the universe behaves like that: its growth
                  becomes a fixed percentage over each stretch of time, so each doubling takes the same time.
                  Like any comparison, it is not exact: the universe's early doublings are not quite equal.
                </p>
                {share === 0 && (
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>A comparison for no dark energy.</strong> Throw a ball upward slowly, and gravity
                    pulls it back. Throw it fast enough (the escape speed, from the Orbits experiment in the
                    Gravity chapter) and it keeps slowing down as it climbs but never stops and never falls
                    back. A flat universe with only matter is exactly that borderline case: gravity slows the
                    expansion forever, but never quite stops it. This is an analogy, not the same calculation.
                  </p>
                )}

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
                    <strong>What this model can and cannot tell you.</strong> Everything above depends on one
                    assumption: that dark energy is a constant that never changes. That is the simplest
                    possibility and many measurements fit it, but it is being tested, and some recent results
                    hint that dark energy may be weakening. Nobody yet knows what dark energy actually is. If it
                    changed with time, the future could be very different. So this is what
                    the model gives for a constant dark energy, not a prediction of how the real universe will
                    end.
                  </p>
                  <p style={{ marginTop: 0, marginBottom: 0 }}>
                    The model covers only how the size of the universe changes. It does not say anything about
                    stars, black holes, or the universe becoming cold and dark. It also assumes the universe is
                    flat. Other endings are possible if the dark energy changed over time, or the universe were
                    not flat: a collapse back together (a "Big Crunch"), or a runaway stretching that tears
                    even galaxies apart (a "Big Rip"). This model cannot say anything about them. The 100
                    billion years on the graph is only the range of the axis, not a prediction of any event.
                  </p>
                </div>
                <p style={{ marginBottom: '0.25rem' }}>
                  <strong>What this model simplifies.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                  <li>
                    It is the same simplified universe as Experiments 5, 6, 8 and 9: flat, with matter and a
                    constant dark energy, an illustrative Hubble constant of 70, and no light or other very fast
                    particles.
                  </li>
                  <li>
                    Every universe is matched to the real one today (same expansion rate and size), so a universe
                    with no dark energy is only {billions(universeAgeYears(0))}{' '}
                    billion years old today in this comparison, as in Experiment 6.
                  </li>
                  <li>
                    Things held together by their own gravity, such as our galaxy and its neighbors, do not
                    expand. In the drawing, only the space between groups stretches. The drawing is a schematic
                    illustration and not to scale.
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {status === 'complete' && submittedFarFuturePrediction && submittedNextDoublingPrediction && (
        <FateOfTheUniverseTutor
          key={runCount}
          predictedFarFuture={submittedFarFuturePrediction}
          predictedNextDoubling={submittedNextDoublingPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
