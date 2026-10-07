import { useEffect, useState } from 'react'
import { UniverseAgeTutor } from './UniverseAgeTutor'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  GRAPH_MAX_YEARS,
  MAX_DARK_ENERGY_FRACTION,
  OLDEST_STARS_AGE_YEARS,
  PLANCK_LIKE_DARK_ENERGY_FRACTION,
  PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
  constantSpeedRelativeSize,
  relativeSizeAtTime,
  runUniverseAgeExperiment,
  universeAgeYears,
} from '../physics/universeAgeExperiment'

interface UniverseAgeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type ShareMode = 'none' | 'bestFit' | 'custom'

// This experiment's two prediction questions, per its specification's "Prediction Activity".
// Choices are not scored.
type MatterOnlyAgeChoice = 'longer' | 'shorter' | 'same'
const matterOnlyAgeChoices: Array<{ value: MatterOnlyAgeChoice; label: string }> = [
  { value: 'longer', label: 'Longer' },
  { value: 'shorter', label: 'Shorter' },
  { value: 'same', label: 'The same' },
]

type DarkEnergyAgeChoice = 'older' | 'younger' | 'same'
const darkEnergyAgeChoices: Array<{ value: DarkEnergyAgeChoice; label: string }> = [
  { value: 'older', label: 'Older' },
  { value: 'younger', label: 'Younger' },
  { value: 'same', label: 'The same age' },
]

// Guaranteed by the model itself (see universeAgeExperiment.test.ts): matter only is two thirds of the
// Hubble time (shorter), and any dark energy makes the universe older than matter only.
const ACTUAL_MATTER_ONLY_AGE: MatterOnlyAgeChoice = 'shorter'
const ACTUAL_DARK_ENERGY_AGE: DarkEnergyAgeChoice = 'older'

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 9000

// Graph geometry: relative size (vertical, today = 1) against time since the Big Bang (horizontal).
const GRAPH_WIDTH = 560
const GRAPH_HEIGHT = 340
const GRAPH_LEFT = 60
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 84
const GRAPH_BOTTOM = GRAPH_HEIGHT - 50
const GRAPH_MAX_SIZE = 1.15
const CURVE_POINTS = 120

const MATTER_ONLY_COLOR = '#38bdf8'
const CHOSEN_COLOR = '#fbbf24'
const CONSTANT_SPEED_COLOR = '#a78bfa'
const STARS_COLOR = '#94a3b8'

function graphX(years: number): number {
  return GRAPH_LEFT + (years / GRAPH_MAX_YEARS) * (GRAPH_RIGHT - GRAPH_LEFT)
}

function graphY(size: number): number {
  return GRAPH_BOTTOM - (size / GRAPH_MAX_SIZE) * (GRAPH_BOTTOM - GRAPH_TOP)
}

const billions = (years: number) => (years / 1e9).toFixed(2)

export function UniverseAgeExperiment({ onComplete, onTutorComplete }: UniverseAgeExperimentProps) {
  const [mode, setMode] = useState<ShareMode>('bestFit')
  const [customShare, setCustomShare] = useState(0.4)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [matterOnlyPrediction, setMatterOnlyPrediction] = useState<MatterOnlyAgeChoice | null>(null)
  const [darkEnergyPrediction, setDarkEnergyPrediction] = useState<DarkEnergyAgeChoice | null>(null)
  const [submittedMatterOnlyPrediction, setSubmittedMatterOnlyPrediction] =
    useState<MatterOnlyAgeChoice | null>(null)
  const [submittedDarkEnergyPrediction, setSubmittedDarkEnergyPrediction] =
    useState<DarkEnergyAgeChoice | null>(null)

  const hasPrediction = matterOnlyPrediction !== null && darkEnergyPrediction !== null
  const hasSubmittedPrediction =
    submittedMatterOnlyPrediction !== null && submittedDarkEnergyPrediction !== null

  const share = mode === 'none' ? 0 : mode === 'bestFit' ? BEST_FIT_DARK_ENERGY_FRACTION : customShare
  const result = runUniverseAgeExperiment(share)
  const isActive = status === 'running' || status === 'complete'

  const handleModeChange = (next: ShareMode) => {
    setMode(next)
    if (status === 'complete') setStatus('idle')
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedMatterOnlyPrediction(matterOnlyPrediction)
      setSubmittedDarkEnergyPrediction(darkEnergyPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((count) => count + 1)
  }

  // Matches the rest of the project's precedent: re-opens both questions for editing without
  // resetting the chosen share.
  const handleChangePrediction = () => {
    setSubmittedMatterOnlyPrediction(null)
    setSubmittedDarkEnergyPrediction(null)
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

  // The line sweeps out from the Big Bang to the end of the time axis. Each version's line is drawn
  // only up to the moment it reaches today's size (1), where its end marker sits.
  const displayedProgress = status === 'idle' ? 0 : progress
  const reachedYears = displayedProgress * GRAPH_MAX_YEARS

  const lineUpTo = (sizeAt: (years: number) => number, endYears: number) => {
    const last = Math.min(reachedYears, endYears)
    if (last <= 0) return ''
    return Array.from({ length: CURVE_POINTS + 1 }, (_, i) => {
      const years = (i / CURVE_POINTS) * last
      return `${graphX(years).toFixed(1)},${graphY(sizeAt(years)).toFixed(1)}`
    }).join(' ')
  }

  const matterOnlyLine = lineUpTo((t) => relativeSizeAtTime(t, 0), result.matterOnlyAgeYears)
  const chosenLine = lineUpTo((t) => relativeSizeAtTime(t, share), result.ageYears)
  const constantLine = lineUpTo(constantSpeedRelativeSize, result.hubbleTimeYears)

  // End markers appear once the sweep has reached that version's age. Labels are staggered in height
  // because the ages can lie very close together on the time axis.
  const endMarkers = [
    { key: 'matter', years: result.matterOnlyAgeYears, color: MATTER_ONLY_COLOR, lift: 14, name: 'Matter only' },
    { key: 'chosen', years: result.ageYears, color: CHOSEN_COLOR, lift: 32, name: 'Your choice' },
    { key: 'constant', years: result.hubbleTimeYears, color: CONSTANT_SPEED_COLOR, lift: 50, name: 'Constant speed' },
  ]

  const ticks = [0, 5, 10, 15, 20]

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 6 — How Old Is the Universe?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> How old is the universe, and was the estimate from the Big Bang
            experiment (Experiment 2) really right?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> In Experiment 2 you ran the expansion backward at a constant speed
            and got the <strong>Hubble time</strong>, about 14 billion years, remarkably close to the real
            measured age of the universe, about 13.8 billion years. But that experiment also said the real
            expansion has not been at a constant speed, and Experiment 5 showed it has slowed down and later
            sped up. Here you put these together. You choose a share of <strong>dark energy</strong>, and the
            graph shows how big the universe has been at every moment since the <strong>Big Bang</strong>,
            in three versions: Experiment 2's constant-speed picture, a universe with only matter, and a
            universe with the dark energy you chose. Each line reaches "today" at a different moment, and
            that moment is that version's age.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A new term: the universe's relative size.</strong> This means the distances between
            galaxies, compared with what they are today. Today's value is set to 1. A relative size of 0.5
            means galaxies were half as far apart as they are now. It is not the size of any physical object,
            and it says nothing about whether the universe has an edge.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What "older" and "younger" mean here.</strong> Nothing in this experiment changes a real
            universe. There is only one real universe, with one real age. Instead, we compare different
            possible universes. Every one of them is set up to have the same expansion rate today, because
            that is the thing we can measure. They differ only in what they contain: matter only, or matter
            plus some dark energy. For each one, we work out how long it would have taken to grow from
            nothing to today's size. "Older" means that calculation gives a longer time, and "younger"
            means a shorter one. The real question is which contents give an age that fits what we observe.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A daily-life picture.</strong> Suppose you walk into a bathroom and find the tub full.
            How long has it been filling? If you know the water level now and the tap's flow, you might
            divide one by the other. But that only works if the flow was the same the whole time. If the tap
            was turned up or down along the way, you would need to know its whole history, not just its flow
            right now.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make two predictions about how a universe's age depends on how
            its expansion has changed. Then pick a share of dark energy and run it.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Compare where the three lines reach today's size. Move the
            dark energy share and watch how the gold line's end point moves. We reuse{' '}
            <strong>dark energy</strong>, <strong>redshift</strong>, the <strong>Hubble time</strong> and the{' '}
            <strong>Big Bang</strong> from earlier experiments, with the same meaning.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              The universe is the same simple model as in Experiment 5: "flat", containing only matter and a
              constant dark energy, with matter's share being 100% minus dark energy's share. Light and other
              radiation, which matters only very early on, are left out. For the age that is a good
              approximation, but still an approximation.
            </li>
            <li>
              The Hubble constant is the same illustrative value as in Experiment 1 (70 km/s per megaparsec),
              with the same real caveat: published values range from about 67 to 73, the "Hubble tension."
              The real measured age (13.8 billion years) comes from a slightly lower Hubble constant and a
              slightly lower dark energy share, which the results will show.
            </li>
            <li>
              The Big Bang is treated as an idealized starting moment, when the relative size was 0. What
              happened at or before it, including cosmic inflation, is not modeled.
            </li>
            <li>
              Experiment 2's constant-speed line is a simplified model shown for comparison, not a rival
              theory.
            </li>
            <li>
              The real measured age is a given value, not worked out here. The age of the oldest known star
              clusters is a rounded value used only as a comparison marker.
            </li>
            <li>Nothing here claims to say what dark energy is.</li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If the universe contained only matter, so gravity has been slowing the expansion all along, would
            its age be longer than, shorter than, or the same as Experiment 2's constant-speed estimate
            (about 14 billion years)?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {matterOnlyAgeChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setMatterOnlyPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${matterOnlyPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Dark energy speeds the expansion up in recent times. Compared with a matter-only universe, would
            adding dark energy make the universe older, younger, or the same age?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {darkEnergyAgeChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setDarkEnergyPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${darkEnergyPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${
                  matterOnlyAgeChoices.find(
                    (c) => c.value === (matterOnlyPrediction ?? submittedMatterOnlyPrediction),
                  )!.label
                }, ${
                  darkEnergyAgeChoices.find(
                    (c) => c.value === (darkEnergyPrediction ?? submittedDarkEnergyPrediction),
                  )!.label
                }`
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
              <label htmlFor="universe-age-share" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Dark energy: {Math.round(customShare * 100)}% of the total (matter makes up the other{' '}
                {100 - Math.round(customShare * 100)}%)
              </label>
              <input
                id="universe-age-share"
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
            Dark energy share: {Math.round(share * 100)}% &nbsp;|&nbsp; Age of this universe:{' '}
            <strong>{billions(result.ageYears)} billion years</strong>
            <br />
            Matter only: {billions(result.matterOnlyAgeYears)} billion years &nbsp;|&nbsp; Hubble time
            (Experiment 2): {billions(result.hubbleTimeYears)} billion years &nbsp;|&nbsp; Real measured age:{' '}
            {billions(result.realAgeYears)} billion years
            <br />
            This universe is{' '}
            <strong>{result.isOlderThanOldestStars ? 'older' : 'younger'}</strong> than the oldest known star
            clusters (about {billions(OLDEST_STARS_AGE_YEARS)} billion years).
          </p>
        )}

        {hasSubmittedPrediction && (
        <svg
          width={GRAPH_WIDTH}
          height={GRAPH_HEIGHT}
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          style={{
            display: 'block',
            marginTop: '1rem',
            border: '1px solid var(--border-color, #ccc)',
            borderRadius: '8px',
            backgroundColor: '#0b1020',
            maxWidth: '100%',
            height: 'auto',
          }}
        >
          <text x={GRAPH_WIDTH / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
            How big the universe was, from the Big Bang to today
          </text>

          {/* Axes */}
          <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#64748b" />
          <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#64748b" />
          {ticks.map((t) => (
            <g key={t}>
              <line x1={graphX(t * 1e9)} y1={GRAPH_BOTTOM} x2={graphX(t * 1e9)} y2={GRAPH_BOTTOM + 4} stroke="#64748b" />
              <text x={graphX(t * 1e9)} y={GRAPH_BOTTOM + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_HEIGHT - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle">
            Time since the Big Bang (billions of years)
          </text>
          <text
            x={14}
            y={(GRAPH_TOP + GRAPH_BOTTOM) / 2}
            fill="#cbd5e1"
            fontSize="11"
            textAnchor="middle"
            transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}
          >
            Relative size (today = 1)
          </text>
          <text x={GRAPH_LEFT - 6} y={graphY(0) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
            0
          </text>
          <text x={GRAPH_LEFT - 6} y={graphY(1) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
            1
          </text>

          {/* "Today" level */}
          <line x1={GRAPH_LEFT} y1={graphY(1)} x2={GRAPH_RIGHT} y2={graphY(1)} stroke="#475569" strokeDasharray="4 4" />
          <text x={GRAPH_LEFT + 8} y={graphY(1) - 5} fill="#94a3b8" fontSize="10">
            today's size
          </text>

          {/* Oldest known star clusters: a faint marker on the time axis */}
          <line
            x1={graphX(OLDEST_STARS_AGE_YEARS)}
            y1={graphY(1)}
            x2={graphX(OLDEST_STARS_AGE_YEARS)}
            y2={GRAPH_BOTTOM}
            stroke={STARS_COLOR}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          {/* The label sits to the right of the vertical line, joined to it by a short pointer, so it
              reads as a label for that line and not for the time axis below. */}
          <line
            x1={graphX(OLDEST_STARS_AGE_YEARS)}
            y1={graphY(0.45)}
            x2={graphX(OLDEST_STARS_AGE_YEARS) + 12}
            y2={graphY(0.45)}
            stroke={STARS_COLOR}
            strokeWidth={1.5}
          />
          <text fill={STARS_COLOR} fontSize="10">
            <tspan x={graphX(OLDEST_STARS_AGE_YEARS) + 16} y={graphY(0.45) - 6}>
              ◄ This vertical dotted line:
            </tspan>
            <tspan x={graphX(OLDEST_STARS_AGE_YEARS) + 16} y={graphY(0.45) + 7}>
              age of the oldest known
            </tspan>
            <tspan x={graphX(OLDEST_STARS_AGE_YEARS) + 16} y={graphY(0.45) + 20}>
              star clusters, about {(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)}
            </tspan>
            <tspan x={graphX(OLDEST_STARS_AGE_YEARS) + 16} y={graphY(0.45) + 33}>
              billion years
            </tspan>
          </text>

          {/* The three versions of the universe's growth */}
          {constantLine && <polyline points={constantLine} fill="none" stroke={CONSTANT_SPEED_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />}
          {matterOnlyLine && <polyline points={matterOnlyLine} fill="none" stroke={MATTER_ONLY_COLOR} strokeWidth={2.5} />}
          {chosenLine && <polyline points={chosenLine} fill="none" stroke={CHOSEN_COLOR} strokeWidth={3.5} />}

          {/* End markers: where each version reaches today's size, labeled with its age */}
          {endMarkers.map((m) =>
            isActive && reachedYears >= m.years ? (
              <g key={m.key}>
                <line x1={graphX(m.years)} y1={graphY(1)} x2={graphX(m.years)} y2={graphY(1) - m.lift + 4} stroke={m.color} strokeWidth={1} />
                <circle cx={graphX(m.years)} cy={graphY(1)} r={5} fill={m.color} />
                <text x={graphX(m.years)} y={graphY(1) - m.lift} fill={m.color} stroke="#0b1020" strokeWidth={3} paintOrder="stroke" fontSize="10" fontWeight="600" textAnchor={graphX(m.years) > GRAPH_WIDTH - 110 ? 'end' : 'middle'}>
                  {m.name}: {billions(m.years)} billion years
                </text>
              </g>
            ) : null,
          )}

          {/* Legend */}
          <g fontSize="10" fill="#e2e8f0">
            <line x1={GRAPH_LEFT + 10} y1={34} x2={GRAPH_LEFT + 34} y2={34} stroke={CONSTANT_SPEED_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
            <text x={GRAPH_LEFT + 40} y={37}>Constant speed (Experiment 2)</text>
            <line x1={GRAPH_LEFT + 200} y1={34} x2={GRAPH_LEFT + 224} y2={34} stroke={MATTER_ONLY_COLOR} strokeWidth={2.5} />
            <text x={GRAPH_LEFT + 230} y={37}>Matter only</text>
            <line x1={GRAPH_LEFT + 310} y1={34} x2={GRAPH_LEFT + 334} y2={34} stroke={CHOSEN_COLOR} strokeWidth={3.5} />
            <text x={GRAPH_LEFT + 340} y={37}>With your dark energy</text>
          </g>
        </svg>
        )}

        {hasSubmittedPrediction && (
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> The graph tells the story of how big the universe has
            been at each moment since the Big Bang, and asks one question of each version of the story: when
            does it reach the size the universe has today? That moment is the age.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>The two axes.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>Across the bottom is time</strong>, counted from the Big Bang (on the far left) in
              billions of years. Moving right means moving later in cosmic history.
            </li>
            <li>
              <strong>Up the side is the universe's relative size</strong>: how far apart galaxies were,
              compared with today. The dashed line at 1 is "today's size". A height of 0.5 would mean galaxies
              were half as far apart as now, and 0 is the Big Bang itself. It is not the size of any physical
              object.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>The three lines.</strong> All three start at the same place, size 0 at the Big Bang, and
            grow upward. They differ in how they grow.
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong style={{ color: CONSTANT_SPEED_COLOR }}>Purple dashed line:</strong> Experiment 2's
              picture, in which the universe grew at one constant speed. It is a perfectly straight line.
            </li>
            <li>
              <strong style={{ color: MATTER_ONLY_COLOR }}>Blue line:</strong> a universe containing only
              matter. Gravity slows its expansion, so it rises steeply at first and then flattens.
            </li>
            <li>
              <strong style={{ color: CHOSEN_COLOR }}>Gold line:</strong> a universe with the dark energy
              share you chose. Move the control and run again, and this line changes.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>The dots and their labels.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              Each line stops at a dot on the dashed "today's size" line. The dot marks the moment that
              version of the universe reaches today's size. <strong>The number in its label is that
              version's age</strong>, in billions of years. The farther right the dot, the older the
              universe.
            </li>
            <li>
              The labels are stacked at different heights only so that they do not overlap when two ages are
              close together.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>The grey dotted line.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              It marks the age of the oldest known star clusters, about 12.5 billion years (a rounded value).
              A universe cannot be younger than the things inside it, so any line whose dot sits{' '}
              <em>to the left</em> of the grey line describes a universe that is too young to be the real
              one.
            </li>
            <li>
              <strong>Why it is there:</strong> without it, the graph shows three different ages and nothing
              to say which is better. The grey line is a test every possible universe must pass, like a pot
              that cannot have been boiling for longer than the stove has existed. Look at where the blue
              dot lands compared with it. In the 1990s this clash between a matter-only universe and the
              oldest stars was one of the clues that pointed toward dark energy, and back then the cluster ages
              were thought to be even higher (about 16 to 20 billion years) before being revised down to
              about 12 to 13. A dot to the right of the
              grey line passes the test, but that only shows the universe is not too young, not that its age
              is exactly right. The 12.5 figure is a rounded value, so treat the line as a test, not a
              precise measurement.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Things to try.</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
            <li>
              <strong>None (matter only):</strong> the gold line lies right on top of the blue line. Notice
              where its dot lands compared with the purple dot, and with the grey line.
            </li>
            <li>
              <strong>The best fit (about {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}%):</strong> the
              gold dot moves far to the right of the blue dot. Compare it with the purple dot and with the
              real measured age (13.8 billion years) in the readout above.
            </li>
            <li>
              <strong>Custom:</strong> drag the slider and run again. As dark energy grows, does the gold
              dot always move the same way?
            </li>
          </ul>
          <p style={{ marginTop: '0.6rem', marginBottom: 0 }}>
            The numbers in the labels and the readout are exact. The colors and the staggering of the labels
            are there to help you compare.
          </p>
        </div>
        )}
        {status === 'complete' && submittedMatterOnlyPrediction && submittedDarkEnergyPrediction && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color, #ccc)',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Results</h3>
            <p>
              You chose <strong>{Math.round(share * 100)}% dark energy</strong>. This universe reaches
              today's size after <strong>{billions(result.ageYears)} billion years</strong>, so that is its
              age. For comparison:
            </p>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <tbody>
                  {[
                    ['Matter only (no dark energy)', result.matterOnlyAgeYears],
                    ["Experiment 2's constant-speed estimate (the Hubble time)", result.hubbleTimeYears],
                    ['Your universe', result.ageYears],
                    ['The real measured age (a given value)', result.realAgeYears],
                  ].map(([label, years]) => (
                    <tr key={label as string}>
                      <td style={{ padding: '0.25rem 1rem 0.25rem 0' }}>{label}</td>
                      <td style={{ textAlign: 'right', padding: '0.25rem 0' }}>
                        {billions(years as number)} billion years
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>A simple calculation.</strong> With no dark energy, the age works out to exactly two
              thirds of the Hubble time: (2 ÷ 3) × {billions(result.hubbleTimeYears)} ≈{' '}
              {billions(result.matterOnlyAgeYears)} billion years. With dark energy the formula is a little
              longer, but the idea is the same: the age comes from adding up the whole expansion history,
              moment by moment.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your first prediction:</strong> asked whether a matter-only universe would be
              older or younger than Experiment 2's constant-speed estimate, you answered "
              {matterOnlyAgeChoices.find((c) => c.value === submittedMatterOnlyPrediction)!.label}". The
              matter-only age is {billions(result.matterOnlyAgeYears)} billion years against{' '}
              {billions(result.hubbleTimeYears)}, so it comes out{' '}
              {result.matterOnlyAgeYears < result.hubbleTimeYears ? 'shorter' : 'longer'} —{' '}
              {submittedMatterOnlyPrediction === ACTUAL_MATTER_ONLY_AGE
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}{' '}
              Gravity slows the expansion, so in the past the universe was expanding faster than it is today,
              and it reached today's size sooner than a constant speed would.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Checking your second prediction:</strong> asked whether adding dark energy would make
              the universe older, younger or the same age, you answered "
              {darkEnergyAgeChoices.find((c) => c.value === submittedDarkEnergyPrediction)!.label}". In this
              model, a universe with any dark energy comes out older than a matter-only universe with the same
              expansion rate today: at the best-fit{' '}
              {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}% it is{' '}
              {billions(universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION))} billion years, against{' '}
              {billions(result.matterOnlyAgeYears)} for matter only —{' '}
              {submittedDarkEnergyPrediction === ACTUAL_DARK_ENERGY_AGE
                ? 'so your prediction was right.'
                : 'so your prediction was off this time.'}{' '}
              {share === 0
                ? 'You chose no dark energy this time, so try adding some to see the age grow.'
                : 'The expansion was slower for longer in the past, so it took longer to reach today\'s size.'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>The oldest star clusters.</strong> Your universe is{' '}
              <strong>{result.isOlderThanOldestStars ? 'older' : 'younger'}</strong> than the oldest known
              star clusters (about {billions(OLDEST_STARS_AGE_YEARS)} billion years, a rounded value).{' '}
              {result.isOlderThanOldestStars
                ? 'That is required: the universe cannot be younger than the things inside it.'
                : 'That is a problem: the universe cannot be younger than the things inside it, so a universe like this one cannot be the real one.'}{' '}
              A matter-only universe is only {billions(result.matterOnlyAgeYears)} billion years old, younger
              than those clusters. In the 1990s that puzzle was one of the clues that pointed toward dark
              energy, before the supernova results of Experiment 5 were announced. The puzzle was actually
              sharper then: early-1990s estimates put the oldest clusters at about 16 to 20 billion years.
              In 1995 the Hipparcos satellite's distance measurements showed the clusters were somewhat
              farther away, and therefore brighter and younger, than thought, which lowered the estimates
              to about 12 to 13 billion years. Even at that lower age, a matter-only universe is still too
              young.
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Why Experiment 2's estimate came out close.</strong> The constant-speed estimate was
              about {billions(result.hubbleTimeYears)} billion years, and the real answer is about{' '}
              {billions(result.realAgeYears)}. This was a happy coincidence, not a method. Gravity's early
              slowdown makes the real age shorter than the Hubble time, and dark energy's later speed-up makes
              it longer again. The two effects roughly cancel. Only the whole expansion history gives the
              age.
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
                <strong>Why not exactly 13.8?</strong> At 70 km/s/Mpc and {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}%
                dark energy, this model gives {billions(universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION))}{' '}
                billion years. The real measured age comes from a slightly different set of values, and both
                changes matter:
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  Hubble constant 70 and dark energy {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}%:{' '}
                  {billions(universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION))} billion years.
                </li>
                <li>
                  Only the Hubble constant lowered to {PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC}:{' '}
                  {billions(
                    universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION, PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC),
                  )}{' '}
                  billion years (a lower Hubble constant means a slower expansion, so a longer age, which
                  overshoots).
                </li>
                <li>
                  Both lowered, to {PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC} and{' '}
                  {(PLANCK_LIKE_DARK_ENERGY_FRACTION * 100).toFixed(1)}% dark energy:{' '}
                  <strong>
                    {billions(
                      universeAgeYears(PLANCK_LIKE_DARK_ENERGY_FRACTION, PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC),
                    )}{' '}
                    billion years
                  </strong>
                  , matching the real measured age.
                </li>
              </ul>
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                The real Hubble constant is still debated (about 67 to 73, the Hubble tension from Experiment
                1), so the simple 70 used here is only illustrative.
              </p>
            </div>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Remember:</strong> this model treats the universe as flat, with only matter and a
              constant dark energy. Radiation, inflation, and what happened at the Big Bang itself are left
              out, and the Hubble constant is illustrative. The real measured age is a given value, not
              worked out here.
            </p>
          </div>
        )}
      </div>

      {status === 'complete' && submittedMatterOnlyPrediction && submittedDarkEnergyPrediction && (
        <UniverseAgeTutor
          key={runCount}
          predictedMatterOnly={submittedMatterOnlyPrediction}
          predictedDarkEnergy={submittedDarkEnergyPrediction}
          onExplained={onTutorComplete}
        />
      )}
    </div>
  )
}
