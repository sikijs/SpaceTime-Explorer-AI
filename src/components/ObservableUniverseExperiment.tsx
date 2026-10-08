import { useEffect, useState } from 'react'
import { ObservableUniverseTutor } from './ObservableUniverseTutor'
import {
  CMB_REDSHIFT,
  MAX_REDSHIFT,
  MIN_REDSHIFT,
  REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS,
  REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS,
  SOURCE_PRESETS,
  lightTravelYears,
  runObservableUniverseExperiment,
  timeAfterBigBangYears,
} from '../physics/observableUniverseExperiment'
import { BEST_FIT_DARK_ENERGY_FRACTION } from '../physics/darkEnergyExperiment'
import { RECOMBINATION_YEARS_AFTER_BIG_BANG } from '../physics/cosmicMicrowaveBackgroundExperiment'

interface ObservableUniverseExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type SourceMode = 'preset' | 'custom'

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 8000

const TRAVEL_COLOR = '#38bdf8'
const TODAY_COLOR = '#fbbf24'
const LEFT_COLOR = '#4ade80'

// This experiment's two prediction questions, per its specification's "Prediction Activity". Choices are
// not scored.
type TodayChoice = 'less' | 'about' | 'more'
const todayChoices: Array<{ value: TodayChoice; label: string }> = [
  { value: 'less', label: 'Less than 10 billion light-years' },
  { value: 'about', label: 'About 10 billion light-years' },
  { value: 'more', label: 'More than 10 billion light-years' },
]

type LeftChoice = 'thirteen' | 'few' | 'closer'
const leftChoices: Array<{ value: LeftChoice; label: string }> = [
  { value: 'thirteen', label: 'About 13 billion light-years' },
  { value: 'few', label: 'A few billion light-years' },
  { value: 'closer', label: 'Far closer than that, under 100 million light-years' },
]

// What the model gives for each prediction question (not scored; used only to say whether the learner's
// answer matched).
const ACTUAL_TODAY: TodayChoice = 'more'
const ACTUAL_LEFT: LeftChoice = 'closer'

// Fixed distance axis for both pictures (billions of light-years), so nothing jumps when the learner
// changes the source. It covers the largest distance the experiment can give (about 44.6).
const AXIS_MAX_BILLION_LY = 50

// Distance diagram geometry. The bars are drawn to a true linear scale.
const DIAGRAM_WIDTH = 560
const DIAGRAM_HEIGHT = 285
const EARTH_X = 60
const AXIS_RIGHT = 535
const PIXELS_PER_BILLION_LY = (AXIS_RIGHT - EARTH_X) / AXIS_MAX_BILLION_LY
const BAR_HEIGHT = 16
const ROW_TRAVEL_Y = 100
const ROW_TODAY_Y = 152
const ROW_LEFT_Y = 204
const AXIS_Y = 240
const MIN_VISIBLE_BAR_PX = 3

// Graph geometry: distances against redshift, with redshift on a logarithmic axis.
const GRAPH_WIDTH = 480
const GRAPH_HEIGHT = 310
const GRAPH_LEFT = 60
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 44
const GRAPH_BOTTOM = GRAPH_HEIGHT - 52
const LOG_RANGE = Math.log10(MAX_REDSHIFT / MIN_REDSHIFT)

function graphX(redshift: number): number {
  return GRAPH_LEFT + (Math.log10(redshift / MIN_REDSHIFT) / LOG_RANGE) * (GRAPH_RIGHT - GRAPH_LEFT)
}

function graphY(billionLy: number): number {
  return GRAPH_BOTTOM - (billionLy / AXIS_MAX_BILLION_LY) * (GRAPH_BOTTOM - GRAPH_TOP)
}

// The custom slider moves along a logarithmic scale, so low and high redshifts are both easy to pick.
const SLIDER_STEPS = 1000
function sliderToRedshift(position: number): number {
  return MIN_REDSHIFT * (MAX_REDSHIFT / MIN_REDSHIFT) ** (position / SLIDER_STEPS)
}
function redshiftToSlider(redshift: number): number {
  return Math.round((Math.log(redshift / MIN_REDSHIFT) / Math.log(MAX_REDSHIFT / MIN_REDSHIFT)) * SLIDER_STEPS)
}

// Distances in light-years, written in billions, or in millions where that reads more clearly.
function distanceLabel(lightYears: number): string {
  if (lightYears >= 1e9) return `${(lightYears / 1e9).toFixed(2)} billion light-years`
  return `${Math.round(lightYears / 1e6)} million light-years`
}

function redshiftLabel(redshift: number): string {
  return redshift >= 10 ? redshift.toFixed(1) : redshift.toFixed(2)
}

const graphTicksX = [0.1, 1, 10, 100, 1000]
const graphTicksY = [0, 10, 20, 30, 40, 50]
const axisTicks = [0, 10, 20, 30, 40, 50]

export function ObservableUniverseExperiment({ onComplete, onTutorComplete }: ObservableUniverseExperimentProps) {
  const [mode, setMode] = useState<SourceMode>('preset')
  const [presetId, setPresetId] = useState(SOURCE_PRESETS[SOURCE_PRESETS.length - 1].id)
  const [customRedshift, setCustomRedshift] = useState(5)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  // Remounts the tutor on each new run so its conversation starts over.
  const [runCount, setRunCount] = useState(0)

  const [todayPrediction, setTodayPrediction] = useState<TodayChoice | null>(null)
  const [leftPrediction, setLeftPrediction] = useState<LeftChoice | null>(null)
  const [submittedTodayPrediction, setSubmittedTodayPrediction] = useState<TodayChoice | null>(null)
  const [submittedLeftPrediction, setSubmittedLeftPrediction] = useState<LeftChoice | null>(null)

  const hasPrediction = todayPrediction !== null && leftPrediction !== null
  const hasSubmittedPrediction = submittedTodayPrediction !== null && submittedLeftPrediction !== null

  const preset = SOURCE_PRESETS.find((p) => p.id === presetId)!
  const redshift = mode === 'preset' ? preset.redshift : customRedshift
  const result = runObservableUniverseExperiment(redshift)
  const isActive = status === 'running' || status === 'complete'

  // The prediction questions are about a galaxy whose light travelled about 10 billion years and about the
  // oldest light, whichever source the learner chose, so their answers are checked against these.
  const tenBillionYearExample = runObservableUniverseExperiment(2)
  const oldestLight = runObservableUniverseExperiment(CMB_REDSHIFT)
  const modelEmissionYears = timeAfterBigBangYears(1 / (1 + CMB_REDSHIFT), BEST_FIT_DARK_ENERGY_FRACTION)
  const modelBelowRealPercent =
    (1 - oldestLight.distanceTodayLightYears / REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS) * 100

  const handlePresetChange = (id: string) => {
    setMode('preset')
    setPresetId(id)
    if (status === 'complete') setStatus('idle')
  }

  const handleCustom = () => {
    setMode('custom')
    if (status === 'complete') setStatus('idle')
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedTodayPrediction(todayPrediction)
      setSubmittedLeftPrediction(leftPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's precedent: re-opens both questions for editing without resetting
  // the chosen source.
  const handleChangePrediction = () => {
    setSubmittedTodayPrediction(null)
    setSubmittedLeftPrediction(null)
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

  // At rest the diagram shows the finished result, so a new source visibly changes it at once. During
  // a run the light travels outward while the source is carried from where it was to where it is now.
  const displayedProgress = status === 'running' ? progress : 1

  const travelledBillionLy = result.lightTravelYears / 1e9
  const todayBillionLy = result.distanceTodayLightYears / 1e9
  const leftBillionLy = result.distanceWhenLightLeftLightYears / 1e9

  const travelledShown = travelledBillionLy * displayedProgress
  const sourceShown = leftBillionLy + (todayBillionLy - leftBillionLy) * displayedProgress

  const barWidth = (billionLy: number) => Math.max(billionLy * PIXELS_PER_BILLION_LY, MIN_VISIBLE_BAR_PX)
  const diagramX = (billionLy: number) => EARTH_X + billionLy * PIXELS_PER_BILLION_LY

  const curveOf = (pick: (point: (typeof result.curve)[number]) => number) =>
    result.curve.map((point) => `${graphX(point.redshift)},${graphY(pick(point) / 1e9)}`).join(' ')

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 8 — How Far Can We See? The Observable Universe</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> The universe is about 13.5 billion years old in this model, and
            light travels one light-year in a year. So how far away can the things we see be, and how large is
            the part of the universe that we can see?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> A <strong>light-year</strong> is the distance light travels in one
            year. The <strong>observable universe</strong> is the part of the universe whose light has had
            time to reach us. You choose a source of light: a galaxy, or the oldest light of all, the cosmic
            microwave background from Experiment 3. Its light travels to Earth, and you see three distances
            for that one source: how far the light travelled, how far away the source is{' '}
            <strong>today</strong> (at this moment, measured across all of space at once), and how far away it
            was <strong>when the light left</strong> it. Each source is described by its{' '}
            <strong>redshift</strong>, as in Experiment 1: how much the light's wavelength was stretched on the
            way, so a larger redshift means light that left earlier.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> When you watch a firework burst far away, you see it a
            moment after it happened, because its light needed time to reach you. What you see is the past, and
            the farther away the firework, the older the light. The night sky works the same way, except that
            the delays are millions or billions of years.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> Every picture of the sky is made of light that has had time to
            reach us, so the limit on what we can see is a limit on what we can ever study. How big is that
            limit, and is it set only by the universe's age?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make two predictions about the three distances. Then pick a
            source and run it.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Compare the three distances for the source you choose, and see
            how they change as you choose sources whose light left earlier. We reuse the expanding universe
            from Experiments 1 and 2, the oldest light from Experiment 3, and the dark energy and age of
            Experiments 5 and 6.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The same simplified universe as Experiments 5 and 6: "flat" (space on the very largest scales is not
              curved, so straight parallel paths stay parallel), with matter and a constant dark energy (70%), and an illustrative Hubble constant of 70 km/s per megaparsec (a megaparsec, Mpc, is about
              3.3 million light-years), with the same real caveat: published values range from about 67 to 73,
              the "Hubble tension." <strong>Radiation</strong> (the light and other very fast particles of the
              early universe) is left out, as in those experiments. This matters most for the earliest times,
              and the results will show how much difference it makes.
            </li>
            <li>The source stays at a fixed spot in the stretching space, with no motion of its own through space.</li>
            <li>The light travels along a straight line to Earth, and nothing blocks or bends it.</li>
            <li>
              "Distance today" means the distance at the present moment, as if rulers were laid end to end
              across all of space at once. It is a way of defining a distance in an expanding universe, not
              something a signal could measure.
            </li>
            <li>
              The cosmic microwave background stands in for "the farthest we can see with light." The true edge
              of the observable universe is slightly farther, and is not computed here.
            </li>
            <li>
              Real reference values for the oldest light's source and for the edge of the observable universe
              are given for comparison, not worked out here.
            </li>
            <li>
              Nothing here says how large the whole universe is. The observable universe is only the part we
              can see. The universe may be much larger, and this experiment does not say.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A galaxy's light has been travelling toward us for 10 billion years. How far away is that galaxy
            today?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {todayChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setTodayPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${todayPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            The oldest light we can see left its source when the universe was very young. How far away was that
            source when the light left it?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {leftChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setLeftPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${leftPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  todayChoices.find((c) => c.value === (todayPrediction ?? submittedTodayPrediction))!.label
                }; ${leftChoices.find((c) => c.value === (leftPrediction ?? submittedLeftPrediction))!.label}`
              : 'Answer both questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many sources as you like below. Or,
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
            The source whose light travels to Earth (a larger redshift means light that left earlier):
          </p>
          {SOURCE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${mode === 'preset' && presetId === p.id ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {p.label} (redshift {p.redshift === CMB_REDSHIFT ? '1089.8' : p.redshift})
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustom}
            disabled={!hasPrediction || status === 'running'}
            className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Custom
          </button>
          {mode === 'custom' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="observable-redshift" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Source redshift: {redshiftLabel(customRedshift)}
              </label>
              <input
                id="observable-redshift"
                type="range"
                min={0}
                max={SLIDER_STEPS}
                step={1}
                value={redshiftToSlider(customRedshift)}
                disabled={!hasPrediction || status === 'running'}
                onChange={(event) => {
                  setCustomRedshift(sliderToRedshift(Number(event.target.value)))
                  if (status === 'complete') setStatus('idle')
                }}
                style={{ width: '100%' }}
              />
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            Chosen redshift: {redshiftLabel(redshift)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={!hasPrediction || status === 'running'}
          className="action-button"
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
            Redshift: <strong>{redshiftLabel(redshift)}</strong> &nbsp;|&nbsp; Every distance has grown by a
            factor of {result.stretchingFactor.toFixed(2)} since the light left
            <br />
            Light travelled: {distanceLabel(result.lightTravelYears)}
            <br />
            Source today: {distanceLabel(result.distanceTodayLightYears)}
            <br />
            Source when the light left: {distanceLabel(result.distanceWhenLightLeftLightYears)}
          </p>
        )}

        {hasSubmittedPrediction && (
          <>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <svg
            width={DIAGRAM_WIDTH}
            height={DIAGRAM_HEIGHT}
            viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
            style={{
              display: 'block',
              border: '1px solid var(--border-color, #ccc)',
              borderRadius: '8px',
              backgroundColor: '#0b1020',
              maxWidth: '100%',
              height: 'auto',
            }}
          >
            <text x={DIAGRAM_WIDTH / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
              Three distances for the same source (drawn to a true scale)
            </text>

            {/* Earth, and the line every distance is measured from */}
            <circle cx={EARTH_X} cy={52} r={9} fill="#38bdf8" />
            <text x={EARTH_X + 14} y={56} fill="#e2e8f0" fontSize="11" fontWeight="600">
              Earth
            </text>
            <line x1={EARTH_X} y1={64} x2={EARTH_X} y2={AXIS_Y} stroke="#64748b" strokeDasharray="3 4" />

            {/* Row 1: how far the light travelled */}
            <text x={EARTH_X + 6} y={ROW_TRAVEL_Y - 8} fill={TRAVEL_COLOR} fontSize="11" fontWeight="600">
              How far the light travelled: {distanceLabel(result.lightTravelYears)}
            </text>
            <rect x={EARTH_X} y={ROW_TRAVEL_Y} width={barWidth(travelledShown)} height={BAR_HEIGHT} fill={TRAVEL_COLOR} opacity={0.85} />

            {/* Row 2: how far away the source is (today, at the end of the run) */}
            <text x={EARTH_X + 6} y={ROW_TODAY_Y - 8} fill={TODAY_COLOR} fontSize="11" fontWeight="600">
              How far away the source is today: {distanceLabel(result.distanceTodayLightYears)}
            </text>
            <rect x={EARTH_X} y={ROW_TODAY_Y} width={barWidth(sourceShown)} height={BAR_HEIGHT} fill={TODAY_COLOR} opacity={0.85} />
            <circle cx={diagramX(sourceShown)} cy={ROW_TODAY_Y + BAR_HEIGHT / 2} r={7} fill="#fde68a" stroke="#0b1020" strokeWidth={2} />
            <text
              x={diagramX(sourceShown) + 12}
              y={ROW_TODAY_Y + BAR_HEIGHT / 2 + 4}
              fill="#fde68a"
              fontSize="10"
              fontWeight="600"
            >
              The source
            </text>

            {/* Row 3: how far away it was when the light left */}
            <text x={EARTH_X + 6} y={ROW_LEFT_Y - 8} fill={LEFT_COLOR} fontSize="11" fontWeight="600">
              How far away it was when the light left: {distanceLabel(result.distanceWhenLightLeftLightYears)}
            </text>
            <rect x={EARTH_X} y={ROW_LEFT_Y} width={barWidth(leftBillionLy)} height={BAR_HEIGHT} fill={LEFT_COLOR} opacity={0.9} />

            {/* The shared distance axis */}
            <line x1={EARTH_X} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} stroke="#64748b" />
            {axisTicks.map((t) => (
              <g key={t}>
                <line x1={diagramX(t)} y1={AXIS_Y} x2={diagramX(t)} y2={AXIS_Y + 4} stroke="#64748b" />
                <text x={diagramX(t)} y={AXIS_Y + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                  {t}
                </text>
              </g>
            ))}
            <text x={(EARTH_X + AXIS_RIGHT) / 2} y={DIAGRAM_HEIGHT - 10} fill="#cbd5e1" fontSize="11" textAnchor="middle">
              Distance from Earth (billions of light-years)
            </text>
          </svg>

          <svg
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            style={{
              display: 'block',
              border: '1px solid var(--border-color, #ccc)',
              borderRadius: '8px',
              backgroundColor: '#0b1020',
              maxWidth: '100%',
              height: 'auto',
            }}
          >
            <text x={GRAPH_WIDTH / 2} y={18} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
              The three distances for every source
            </text>
            <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#64748b" />
            <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#64748b" />
            {graphTicksX.map((z) => (
              <g key={z}>
                <line x1={graphX(z)} y1={GRAPH_BOTTOM} x2={graphX(z)} y2={GRAPH_BOTTOM + 4} stroke="#64748b" />
                <text x={graphX(z)} y={GRAPH_BOTTOM + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                  {z}
                </text>
              </g>
            ))}
            {graphTicksY.map((d) => (
              <g key={d}>
                <line x1={GRAPH_LEFT - 4} y1={graphY(d)} x2={GRAPH_LEFT} y2={graphY(d)} stroke="#64748b" />
                <text x={GRAPH_LEFT - 8} y={graphY(d) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
                  {d}
                </text>
              </g>
            ))}
            <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_HEIGHT - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle">
              Source redshift (each tick is ten times the one before)
            </text>
            <text
              x={14}
              y={(GRAPH_TOP + GRAPH_BOTTOM) / 2}
              fill="#cbd5e1"
              fontSize="11"
              textAnchor="middle"
              transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}
            >
              Distance (billions of light-years)
            </text>

            <polyline points={curveOf((p) => p.distanceTodayLightYears)} fill="none" stroke={TODAY_COLOR} strokeWidth={2.5} />
            <polyline points={curveOf((p) => p.lightTravelYears)} fill="none" stroke={TRAVEL_COLOR} strokeWidth={2.5} />
            <polyline points={curveOf((p) => p.distanceWhenLightLeftLightYears)} fill="none" stroke={LEFT_COLOR} strokeWidth={2.5} />

            <text x={GRAPH_RIGHT} y={graphY(result.curve[result.curve.length - 1].distanceTodayLightYears / 1e9) - 8} fill={TODAY_COLOR} fontSize="10" fontWeight="600" textAnchor="end">
              Source today
            </text>
            <text x={GRAPH_RIGHT} y={graphY(result.curve[result.curve.length - 1].lightTravelYears / 1e9) - 8} fill={TRAVEL_COLOR} fontSize="10" fontWeight="600" textAnchor="end">
              Light travelled
            </text>
            <text x={graphX(60)} y={graphY(8)} fill={LEFT_COLOR} fontSize="10" fontWeight="600" textAnchor="middle">
              When the light left
            </text>

            {/* The chosen source */}
            <line x1={graphX(redshift)} y1={GRAPH_TOP} x2={graphX(redshift)} y2={GRAPH_BOTTOM} stroke="#e2e8f0" strokeDasharray="3 4" opacity={0.7} />
            <circle cx={graphX(redshift)} cy={graphY(todayBillionLy)} r={5} fill={TODAY_COLOR} stroke="#0b1020" strokeWidth={2} />
            <circle cx={graphX(redshift)} cy={graphY(travelledBillionLy)} r={5} fill={TRAVEL_COLOR} stroke="#0b1020" strokeWidth={2} />
            <circle cx={graphX(redshift)} cy={graphY(leftBillionLy)} r={5} fill={LEFT_COLOR} stroke="#0b1020" strokeWidth={2} />
            <text
              x={graphX(redshift)}
              y={GRAPH_TOP - 8}
              fill="#e2e8f0"
              fontSize="10"
              fontWeight="600"
              textAnchor={graphX(redshift) > GRAPH_RIGHT - 60 ? 'end' : graphX(redshift) < GRAPH_LEFT + 40 ? 'start' : 'middle'}
            >
              Your chosen source
            </text>
          </svg>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read these diagrams.</strong> Long ago, a distant galaxy (or the oldest light of
            all) sent light toward Earth. That light has been travelling ever since, and we have only just
            received it. The two pictures above show <strong>three different distances</strong> for that one
            source. Your job is to see how much those three distances differ, and how the differences change
            when you choose a source whose light left earlier.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Two units first.</strong> A <strong>light-year</strong> is the distance light travels in
            one year (about 9.5 million million kilometers). The distances here are so large that they are
            given in <strong>billions of light-years</strong>; one billion is a thousand million. And the{' '}
            <strong>redshift</strong>, which you choose, is a number that tells you how long ago the light
            left. A bigger redshift means older light. For example, light with a redshift of 0.5 left about{' '}
            {(lightTravelYears(0.5, BEST_FIT_DARK_ENERGY_FRACTION) / 1e9).toFixed(1)} billion years ago, a
            redshift of 2 about {(lightTravelYears(2, BEST_FIT_DARK_ENERGY_FRACTION) / 1e9).toFixed(1)}, a
            redshift of 10 about {(lightTravelYears(10, BEST_FIT_DARK_ENERGY_FRACTION) / 1e9).toFixed(1)}, and
            the oldest light we can see (redshift 1089.8) about{' '}
            {(lightTravelYears(CMB_REDSHIFT, BEST_FIT_DARK_ENERGY_FRACTION) / 1e9).toFixed(1)} billion years
            ago.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 1, the three distances, drawn to a true scale.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>Earth</strong> is the blue dot at the top left. Every bar starts at the dashed line
              below it and reaches to the right. The axis along the bottom tells you how far each bar
              reaches, in billions of light-years. Each tick is 10 billion more. The scale is true, so a bar
              twice as long really means twice the distance.
            </li>
            <li>
              The <strong style={{ color: TRAVEL_COLOR }}>blue bar</strong> is{' '}
              <strong>how far the light travelled</strong>. Light moves at a fixed speed, so this is simply
              how long the light has been on its way, multiplied by that speed. For example, light that has
              been travelling for 5 billion years has covered 5 billion light-years. The bar is drawn
              starting from Earth only so that its length can be compared with the other two. The light
              itself travelled the other way, from the source toward Earth.
            </li>
            <li>
              The <strong style={{ color: TODAY_COLOR }}>gold bar</strong> is{' '}
              <strong>how far away the source is today</strong>. Picture freezing everything at this exact
              moment and stretching a very long measuring tape from Earth to the source. The gold bar is the
              length of that tape. The pale gold dot, labeled "The source," sits at its end.
            </li>
            <li>
              The <strong style={{ color: LEFT_COLOR }}>green bar</strong> is{' '}
              <strong>how far away the source was at the moment it let the light go</strong>. It is the
              length the same measuring tape would have had back then. For the oldest sources this bar is so
              short at this scale that you can hardly see it, so read its label to get the number.
            </li>
            <li>
              When you press <strong>Run</strong>, watch for about 8 seconds. The blue bar grows as the light
              travels, and the gold bar and the dot grow as the source goes from where it was when the light
              left to where it is today. The motion is drawn to help you notice the change. It is not a movie
              of real history, but the lengths at the end are exact.
            </li>
            <li>
              <strong>Try it with the source on the screen now</strong> (redshift {redshiftLabel(redshift)}):
              the light travelled {distanceLabel(result.lightTravelYears)}, the source is{' '}
              {distanceLabel(result.distanceTodayLightYears)} away today, and it was{' '}
              {distanceLabel(result.distanceWhenLightLeftLightYears)} away when the light left. Compare the
              three bar lengths with those numbers. What do you notice about which bar is longest and which
              is shortest?
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 2, the graph: the same three distances for every source at once.</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li>
              Picture 1 shows one source. The graph shows <strong>every</strong> source, so you can see how
              the three distances change as the light left earlier and earlier. Each point on a curve is one
              possible source.
            </li>
            <li>
              Across the bottom is the redshift (the older the light, the farther to the right). The ticks
              are 0.1, 1, 10, 100 and 1000, so each tick is <strong>ten times</strong> the one before. That
              is how a very nearby source and the oldest light can share one graph, rather like a ruler
              where each step multiplies instead of adds. Up the side is distance, in billions of
              light-years.
            </li>
            <li>
              The three curves are colored to match the bars in Picture 1:{' '}
              <strong style={{ color: TRAVEL_COLOR }}>blue</strong> for how far the light travelled,{' '}
              <strong style={{ color: TODAY_COLOR }}>gold</strong> for how far away the source is today, and{' '}
              <strong style={{ color: LEFT_COLOR }}>green</strong> for how far away it was when the light
              left.
            </li>
            <li>
              The dashed vertical line and the three dots mark the source you chose. How high each dot sits
              is the length of the matching bar in Picture 1. Choose a different source and the dots slide
              along the curves. The graph does not move while the playback runs, because it shows the
              result for all sources at once.
            </li>
            <li>
              Follow each curve from left to right, and ask: where are the three curves close together, and
              where do they spread apart? Which curve levels off? Which keeps climbing? Which one rises and
              then falls?
            </li>
          </ul>
          <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
            The numbers in the live readout are exact. The colors and the moving source are drawn to help you
            compare.
          </p>
        </div>

        {status === 'complete' && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color, #ccc)',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You chose a source with a redshift of <strong>{redshiftLabel(redshift)}</strong>. For that one
              source:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <tbody>
                  {[
                    ['How far the light travelled', distanceLabel(result.lightTravelYears)],
                    ['How far away the source is today', distanceLabel(result.distanceTodayLightYears)],
                    ['How far away it was when the light left', distanceLabel(result.distanceWhenLightLeftLightYears)],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ padding: '0.25rem 1rem 0.25rem 0' }}>{label}</td>
                      <td style={{ textAlign: 'right', padding: '0.25rem 0', whiteSpace: 'nowrap' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginBottom: '0.5rem' }}>
              The source is <strong>{result.todayOverTravelled.toFixed(2)} times</strong> as far away today as
              the distance its light travelled.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your first prediction:</strong> asked how far away a galaxy is today if its
              light has travelled for 10 billion years, you answered "
              {todayChoices.find((c) => c.value === submittedTodayPrediction)!.label}". For every source, the
              distance today is more than the distance the light travelled. For example, the light from the
              redshift 2 galaxy travelled {distanceLabel(tenBillionYearExample.lightTravelYears)}, and that
              galaxy is {distanceLabel(tenBillionYearExample.distanceTodayLightYears)} away today —{' '}
              {submittedTodayPrediction === ACTUAL_TODAY
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your second prediction:</strong> asked how far away the source of the oldest
              light was when the light left it, you answered "
              {leftChoices.find((c) => c.value === submittedLeftPrediction)!.label}". The model gives{' '}
              {distanceLabel(oldestLight.distanceWhenLightLeftLightYears)}, which is far closer than{' '}
              {distanceLabel(oldestLight.lightTravelYears)} —{' '}
              {submittedLeftPrediction === ACTUAL_LEFT
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Why the distances differ.</strong> While the light was travelling, the space it crossed
              kept stretching, and every distance between faraway objects grew with it. A comparison: an ant
              starts at one end of a rubber band and walks toward the other end at a steady pace, while the
              band is stretched. When the ant arrives, the two ends of the band are much farther apart than
              the total length of the ant's steps. The light is the ant, your source is the end of the band the ant
              started from, and Earth is the end it walks toward. Like any comparison, it is not exact, but it shows the idea.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>A simple calculation.</strong> Every distance has grown by the same factor as the
              universe's size, which is 1 + the redshift. For your source that factor is{' '}
              {result.stretchingFactor.toFixed(2)}, so {distanceLabel(result.distanceWhenLightLeftLightYears)} ×{' '}
              {result.stretchingFactor.toFixed(2)} ≈ {distanceLabel(result.distanceTodayLightYears)}. For the
              oldest light the factor is {oldestLight.stretchingFactor.toFixed(1)}, so{' '}
              {distanceLabel(oldestLight.distanceWhenLightLeftLightYears)} ×{' '}
              {oldestLight.stretchingFactor.toFixed(1)} ≈ {distanceLabel(oldestLight.distanceTodayLightYears)}.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Nothing travelled faster than light.</strong> The light always moved at the speed of
              light through the space around it. The extra distance comes from the space between us and the
              source stretching, not from anything moving faster than light.
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
                <strong>How close is this model to the real values?</strong> For the oldest light, this model
                gives a source {distanceLabel(oldestLight.distanceTodayLightYears)} away today. Real
                astronomers find about {(REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS / 1e9).toFixed(1)} billion light-years for it, and
                about {(REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS / 1e9).toFixed(1)} billion light-years for the edge of the
                observable universe, the farthest from which any signal could have reached us by now, which is
                a little farther still. The model is about {modelBelowRealPercent.toFixed(1)}% below the real
                figure for the oldest light.
              </p>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                The cause is the one stated at the start: this model leaves out radiation, which matters most
                at the earliest times. The same cause makes this model put the oldest light's departure at
                about {(Math.round(modelEmissionYears / 1e3) * 1e3).toLocaleString('en-US')} years after the Big
                Bang, where Experiment 3 gives about{' '}
                {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')}. The real values are given for
                comparison and are not worked out here.
              </p>
            </div>
            <p style={{ marginBottom: '0.25rem' }}>
              <strong>What this model simplifies.</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
              <li>
                It is the same simplified universe as Experiments 5 and 6: flat, with matter and a constant
                dark energy, an illustrative Hubble constant of 70, and no radiation.
              </li>
              <li>
                The source has no motion of its own, the light travels in a straight line, and "distance
                today" is a way of defining a distance across all of space at once.
              </li>
              <li>
                The cosmic microwave background stands in for the farthest we can see with light, and the
                observable universe is only the part we can see, not the whole universe.
              </li>
            </ul>
          </div>
        )}
          </>
        )}
      </div>

      {status === 'complete' && submittedTodayPrediction && submittedLeftPrediction && (
        <ObservableUniverseTutor
          key={runCount}
          predictedToday={submittedTodayPrediction}
          predictedLeft={submittedLeftPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
