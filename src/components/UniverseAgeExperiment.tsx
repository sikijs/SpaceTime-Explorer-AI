import { useEffect, useState } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  GRAPH_MAX_YEARS,
  MAX_DARK_ENERGY_FRACTION,
  OLDEST_STARS_AGE_YEARS,
  constantSpeedRelativeSize,
  relativeSizeAtTime,
  runUniverseAgeExperiment,
} from '../physics/universeAgeExperiment'

interface UniverseAgeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type ShareMode = 'none' | 'bestFit' | 'custom'

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 5000

// Graph geometry: relative size (vertical, today = 1) against time since the Big Bang (horizontal).
const GRAPH_WIDTH = 560
const GRAPH_HEIGHT = 340
const GRAPH_LEFT = 60
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 70
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

export function UniverseAgeExperiment(_props: UniverseAgeExperimentProps) {
  const { onComplete } = _props
  const [mode, setMode] = useState<ShareMode>('bestFit')
  const [customShare, setCustomShare] = useState(0.4)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const share = mode === 'none' ? 0 : mode === 'bestFit' ? BEST_FIT_DARK_ENERGY_FRACTION : customShare
  const result = runUniverseAgeExperiment(share)
  const isActive = status === 'running' || status === 'complete'

  const handleModeChange = (next: ShareMode) => {
    setMode(next)
    if (status === 'complete') setStatus('idle')
  }

  const handleRun = () => {
    if (status === 'running') return
    setStatus('running')
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
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Share of the universe's energy that is dark energy:
          </p>
          <button
            type="button"
            onClick={() => handleModeChange('none')}
            disabled={status === 'running'}
            className={`toggle-button${mode === 'none' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            None (matter only)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('bestFit')}
            disabled={status === 'running'}
            className={`toggle-button${mode === 'bestFit' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            The best fit to observations (about {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}%)
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('custom')}
            disabled={status === 'running'}
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
                disabled={status === 'running'}
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
          disabled={status === 'running'}
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

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
          <text x={GRAPH_RIGHT} y={graphY(1) + 14} fill="#94a3b8" fontSize="10" textAnchor="end">
            today's size
          </text>

          {/* Oldest known star clusters: a faint marker on the time axis */}
          <line
            x1={graphX(OLDEST_STARS_AGE_YEARS)}
            y1={graphY(1)}
            x2={graphX(OLDEST_STARS_AGE_YEARS)}
            y2={GRAPH_BOTTOM}
            stroke={STARS_COLOR}
            strokeDasharray="2 3"
            opacity={0.7}
          />
          <text
            x={graphX(OLDEST_STARS_AGE_YEARS) - 4}
            y={GRAPH_BOTTOM - 8}
            fill={STARS_COLOR}
            fontSize="10"
            textAnchor="end"
          >
            Oldest known star clusters (about {billions(OLDEST_STARS_AGE_YEARS)})
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
                <text x={graphX(m.years)} y={graphY(1) - m.lift} fill={m.color} fontSize="10" fontWeight="600" textAnchor="middle">
                  {m.name}: {billions(m.years)}
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

        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> The graph shows how big the universe was at each
            moment since the Big Bang. "Size" here means the distances between galaxies compared with today,
            so today's size is 1, and it is not the size of any physical object.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Each line starts at size 0 at the Big Bang (left) and grows. The dot at the end of a line marks
              the moment it reaches today's size, which is that version's age.
            </li>
            <li>
              <span style={{ color: CONSTANT_SPEED_COLOR }}>Purple dashed:</span> Experiment 2's picture, in
              which the universe grew at one constant speed.
            </li>
            <li>
              <span style={{ color: MATTER_ONLY_COLOR }}>Blue:</span> a universe containing only matter.
            </li>
            <li>
              <span style={{ color: CHOSEN_COLOR }}>Gold:</span> a universe with the dark energy share you
              chose. Move the control and watch its end dot move.
            </li>
            <li>
              The faint grey dotted line marks the age of the oldest known star clusters (a rounded value). A
              universe cannot be younger than the things inside it.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
