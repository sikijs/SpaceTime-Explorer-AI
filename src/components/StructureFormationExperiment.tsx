import { useEffect, useMemo, useState } from 'react'
import {
  CLUMP_THRESHOLD,
  MATTER_RADIATION_EQUALITY_REDSHIFT,
  MAX_START_DELTA,
  MIN_START_DELTA,
  RECOMBINATION_REDSHIFT,
  START_SIZE_PRESETS,
  growthBetween,
  runStructureFormationExperiment,
  type KindOfMatter,
  type StructureFormationResult,
} from '../physics/structureFormationExperiment'

interface StructureFormationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type StartMode = 'preset' | 'custom'

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 9000

const ORDINARY_COLOR = '#fbbf24'
const DARK_COLOR = '#a78bfa'
const NO_DARK_ENERGY_COLOR = '#cbd5e1'
const CLUMP_COLOR = '#4ade80'

const kindLabels: Record<KindOfMatter, string> = {
  ordinary: 'Ordinary matter only',
  'ordinary-plus-dark': 'Ordinary plus dark matter',
}

// The custom slider moves along a logarithmic scale, so small and large ripples are both easy to pick.
const SLIDER_STEPS = 1000
function sliderToDelta(position: number): number {
  return MIN_START_DELTA * (MAX_START_DELTA / MIN_START_DELTA) ** (position / SLIDER_STEPS)
}
function deltaToSlider(delta: number): number {
  return Math.round((Math.log(delta / MIN_START_DELTA) / Math.log(MAX_START_DELTA / MIN_START_DELTA)) * SLIDER_STEPS)
}

// "1 part in 850", rounded sensibly.
function partsInLabel(delta: number): string {
  const parts = 1 / delta
  const rounded = parts >= 1000 ? Math.round(parts / 10) * 10 : Math.round(parts)
  return `1 part in ${rounded.toLocaleString('en-US')}`
}

function yearsLabel(years: number): string {
  if (years >= 1e9) return `${(years / 1e9).toFixed(2)} billion years`
  if (years >= 1e6) return `${(years / 1e6).toFixed(1)} million years`
  return `${Math.round(years / 1000).toLocaleString('en-US')} thousand years`
}

function redshiftLabel(redshift: number): string {
  if (redshift >= 100) return Math.round(redshift).toLocaleString('en-US')
  return redshift >= 10 ? redshift.toFixed(1) : redshift.toFixed(2)
}

// Shared geometry for the two graphs: time since the Big Bang on a logarithmic axis.
const GRAPH_WIDTH = 520
const GRAPH_HEIGHT = 310
const GRAPH_LEFT = 62
const GRAPH_RIGHT = GRAPH_WIDTH - 20
const GRAPH_TOP = 44
const GRAPH_BOTTOM = GRAPH_HEIGHT - 56
const TIME_MIN_YEARS = 1e4
const TIME_MAX_YEARS = 2e10
const timeTicks = [1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10]
const timeTickLabels = ['10 thousand', '100 thousand', '1 million', '10 million', '100 million', '1 billion', '10 billion']

function timeX(years: number): number {
  const fraction = Math.log10(years / TIME_MIN_YEARS) / Math.log10(TIME_MAX_YEARS / TIME_MIN_YEARS)
  return GRAPH_LEFT + fraction * (GRAPH_RIGHT - GRAPH_LEFT)
}

function logY(value: number, min: number, max: number): number {
  const fraction = Math.log10(value / min) / Math.log10(max / min)
  return GRAPH_BOTTOM - fraction * (GRAPH_BOTTOM - GRAPH_TOP)
}

const GROWTH_Y_MIN = 1
const GROWTH_Y_MAX = 5000
const growthTicks = [1, 10, 100, 1000]
const EXCESS_Y_MIN = 1e-5
const EXCESS_Y_MAX = 10
const excessTicks = [1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1]
const excessTickLabels = ['0.00001', '0.0001', '0.001', '0.01', '0.1', '1']

// The strip picture: a fixed patch of matter followed as space stretches (so the matter keeps the same
// spot in the picture while the real distances between particles grow). Drawn to the model's true density
// excess, with no exaggeration, so a very small ripple really looks almost smooth.
const STRIP_WIDTH = 560
const STRIP_HEIGHT = 250
const STRIP_LEFT = 40
const STRIP_RIGHT = STRIP_WIDTH - 40
const STRIP_TOP = 86
const STRIP_BOTTOM = 166
const PARTICLE_COUNT = 150

// A fixed, repeatable scatter of heights, so the picture does not change between renders.
const particleHeights = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const value = Math.sin(i * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
})

// Position of each particle: those near the center are pulled in as the density excess grows. A
// one-dimensional shift chosen so the center's density is exactly (1 + density excess) times the average.
function particleX(index: number, densityExcess: number): number {
  const q = (index + 0.5) / PARTICLE_COUNT - 0.5
  const shift = densityExcess / (1 + densityExcess)
  const x = q - (shift * Math.sin(2 * Math.PI * q)) / (2 * Math.PI)
  return STRIP_LEFT + (x + 0.5) * (STRIP_RIGHT - STRIP_LEFT)
}

// The point on a result's curve at a fraction (0 = the start, 1 = today), interpolated between samples.
function curveAt(result: StructureFormationResult, fraction: number) {
  const position = Math.min(Math.max(fraction, 0), 1) * (result.curve.length - 1)
  const low = Math.floor(position)
  const high = Math.min(low + 1, result.curve.length - 1)
  const t = position - low
  const a = result.curve[low]
  const b = result.curve[high]
  return {
    redshift: a.redshift + (b.redshift - a.redshift) * t,
    yearsAfterBigBang: a.yearsAfterBigBang + (b.yearsAfterBigBang - a.yearsAfterBigBang) * t,
    growth: a.growth + (b.growth - a.growth) * t,
    densityExcess: a.densityExcess + (b.densityExcess - a.densityExcess) * t,
  }
}

export function StructureFormationExperiment({ onComplete }: StructureFormationExperimentProps) {
  const [kind, setKind] = useState<KindOfMatter>('ordinary-plus-dark')
  const [mode, setMode] = useState<StartMode>('preset')
  const [presetId, setPresetId] = useState('one-in-1000')
  const [customDelta, setCustomDelta] = useState(5e-4)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const preset = START_SIZE_PRESETS.find((p) => p.id === presetId)!
  const startDelta = mode === 'preset' ? preset.startDelta : customDelta
  const result = runStructureFormationExperiment(kind, startDelta)
  const isActive = status === 'running' || status === 'complete'

  // Both kinds of matter, for the growth graph, which needs no starting size.
  const ordinaryResult = useMemo(() => runStructureFormationExperiment('ordinary', startDelta), [startDelta])
  const darkResult = useMemo(() => runStructureFormationExperiment('ordinary-plus-dark', startDelta), [startDelta])
  // Growth with no dark energy, from the physics module, for the chosen kind (the thin reference line).
  const withoutDarkEnergy = useMemo(
    () => result.curve.map((point) => growthBetween(result.startRedshift, point.redshift, 0)),
    [result.curve, result.startRedshift],
  )

  const handleKindChange = (next: KindOfMatter) => {
    setKind(next)
    if (status === 'complete') setStatus('idle')
  }
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

  // At rest the picture shows the finished result; during a run it plays from the start to today.
  const displayedProgress = status === 'running' ? progress : 1
  const now = curveAt(result, displayedProgress)
  const hasClumped = now.densityExcess >= CLUMP_THRESHOLD
  // The picture follows the ripple only until it becomes a clump; the linear model stops being valid there.
  const shownExcess = Math.min(now.densityExcess, CLUMP_THRESHOLD)
  const sizeFactor = (1 + result.startRedshift) / (1 + now.redshift)

  const polyline = (
    points: Array<{ yearsAfterBigBang: number }>,
    yOf: (index: number) => number,
    upTo = points.length,
  ) =>
    points
      .slice(0, upTo)
      .map((point, index) => `${timeX(Math.max(point.yearsAfterBigBang, TIME_MIN_YEARS))},${yOf(index)}`)
      .join(' ')

  // Where the chosen ripple's curve first reaches the clump line (the curve is cut there).
  const firstClumpIndex = result.curve.findIndex((point) => point.densityExcess >= CLUMP_THRESHOLD)
  const excessPointCount = firstClumpIndex === -1 ? result.curve.length : firstClumpIndex + 1
  const excessY = (index: number) =>
    logY(Math.min(result.curve[index].densityExcess, CLUMP_THRESHOLD), EXCESS_Y_MIN, EXCESS_Y_MAX)

  // The "needed starting size" panel: a logarithmic axis of density excess.
  const NEED_WIDTH = 560
  const NEED_HEIGHT = 250
  const NEED_LEFT = 50
  const NEED_RIGHT = NEED_WIDTH - 30
  const needX = (delta: number) =>
    NEED_LEFT + (Math.log10(delta / 1e-5) / Math.log10(1e-2 / 1e-5)) * (NEED_RIGHT - NEED_LEFT)
  const needRows = [
    { label: "The oldest light's temperature ripple (not a density excess)", delta: 1e-5, color: '#cbd5e1', y: 70 },
    { label: 'Needed to become a clump: ordinary matter', delta: ordinaryResult.requiredStartDelta, color: ORDINARY_COLOR, y: 112 },
    { label: 'Needed to become a clump: with dark matter', delta: darkResult.requiredStartDelta, color: DARK_COLOR, y: 154 },
    { label: 'Your starting size', delta: startDelta, color: CLUMP_COLOR, y: 196 },
  ]

  const patchColor = kind === 'ordinary' ? ORDINARY_COLOR : DARK_COLOR

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 9 — How Did Galaxies Form? Growing Structure from Tiny Ripples</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>What matter is gathering:</p>
          {(['ordinary', 'ordinary-plus-dark'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleKindChange(option)}
              disabled={status === 'running'}
              className={`toggle-button${kind === option ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {kindLabels[option]}
              {option === 'ordinary'
                ? ` (starts at redshift ${RECOMBINATION_REDSHIFT})`
                : ` (starts at redshift ${MATTER_RADIATION_EQUALITY_REDSHIFT.toLocaleString('en-US')})`}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            How much denser than average the early region starts (its starting density excess):
          </p>
          {START_SIZE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              disabled={status === 'running'}
              className={`toggle-button${mode === 'preset' && presetId === p.id ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustom}
            disabled={status === 'running'}
            className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Custom
          </button>
          {mode === 'custom' && (
            <div style={{ marginTop: '0.5rem' }}>
              <label htmlFor="structure-start-delta" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Starting density excess: {partsInLabel(customDelta)}
              </label>
              <input
                id="structure-start-delta"
                type="range"
                min={0}
                max={SLIDER_STEPS}
                step={1}
                value={deltaToSlider(customDelta)}
                disabled={status === 'running'}
                onChange={(event) => {
                  setCustomDelta(sliderToDelta(Number(event.target.value)))
                  if (status === 'complete') setStatus('idle')
                }}
                style={{ width: '100%' }}
              />
            </div>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            Chosen starting size: {partsInLabel(startDelta)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={status === 'running'}
          className="action-button"
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

        {isActive && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Time since the Big Bang: <strong>{yearsLabel(now.yearsAfterBigBang)}</strong> &nbsp;|&nbsp; Redshift:{' '}
            {redshiftLabel(now.redshift)}
            <br />
            The ripple has grown <strong>{now.growth.toFixed(1)}</strong> times &nbsp;|&nbsp; Space has stretched{' '}
            {sizeFactor.toFixed(1)} times since the start
            <br />
            Density excess: {hasClumped ? `${CLUMP_THRESHOLD} or more (a clump has formed)` : now.densityExcess.toPrecision(2)}
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          {/* Picture 1: the growing ripple */}
          <svg
            width={STRIP_WIDTH}
            height={STRIP_HEIGHT}
            viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`}
            style={{
              display: 'block',
              border: '1px solid var(--border-color, #ccc)',
              borderRadius: '8px',
              backgroundColor: '#0b1020',
              maxWidth: '100%',
              height: 'auto',
            }}
          >
            <text x={STRIP_WIDTH / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
              A slightly denser region, growing (drawn to the model's true density excess)
            </text>

            {hasClumped && (
              <ellipse
                cx={(STRIP_LEFT + STRIP_RIGHT) / 2}
                cy={(STRIP_TOP + STRIP_BOTTOM) / 2}
                rx={60}
                ry={46}
                fill={CLUMP_COLOR}
                opacity={0.22}
              />
            )}
            <rect
              x={STRIP_LEFT}
              y={STRIP_TOP}
              width={STRIP_RIGHT - STRIP_LEFT}
              height={STRIP_BOTTOM - STRIP_TOP}
              fill="none"
              stroke="#334155"
            />
            {particleHeights.map((h, index) => (
              <circle
                key={index}
                cx={particleX(index, shownExcess)}
                cy={STRIP_TOP + 6 + h * (STRIP_BOTTOM - STRIP_TOP - 12)}
                r={2.2}
                fill={kind === 'ordinary-plus-dark' && index % 2 === 0 ? DARK_COLOR : ORDINARY_COLOR}
                opacity={0.9}
              />
            ))}

            {/* The ripple's center, labeled */}
            <line
              x1={(STRIP_LEFT + STRIP_RIGHT) / 2}
              y1={STRIP_BOTTOM + 4}
              x2={(STRIP_LEFT + STRIP_RIGHT) / 2}
              y2={STRIP_BOTTOM + 22}
              stroke={patchColor}
            />
            <text
              x={(STRIP_LEFT + STRIP_RIGHT) / 2}
              y={STRIP_BOTTOM + 36}
              fill={patchColor}
              fontSize="11"
              fontWeight="600"
              textAnchor="middle"
            >
              The slightly denser region (the center)
            </text>
            <text x={STRIP_LEFT} y={STRIP_TOP - 10} fill="#cbd5e1" fontSize="10">
              A strip of the early universe: each dot is a bit of matter
            </text>
            {hasClumped && (
              <text
                x={(STRIP_LEFT + STRIP_RIGHT) / 2}
                y={STRIP_TOP - 28}
                fill={CLUMP_COLOR}
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                A clump has formed. A galaxy would grow here in the real universe (the glow is schematic; not computed)
              </text>
            )}

            {/* Legend */}
            <circle cx={STRIP_LEFT + 6} cy={STRIP_HEIGHT - 22} r={3} fill={ORDINARY_COLOR} />
            <text x={STRIP_LEFT + 14} y={STRIP_HEIGHT - 18} fill="#cbd5e1" fontSize="10">
              Ordinary matter
            </text>
            {kind === 'ordinary-plus-dark' && (
              <>
                <circle cx={STRIP_LEFT + 120} cy={STRIP_HEIGHT - 22} r={3} fill={DARK_COLOR} />
                <text x={STRIP_LEFT + 128} y={STRIP_HEIGHT - 18} fill="#cbd5e1" fontSize="10">
                  Dark matter
                </text>
              </>
            )}
            <text x={STRIP_RIGHT} y={STRIP_HEIGHT - 18} fill="#cbd5e1" fontSize="10" textAnchor="end">
              Space has stretched {sizeFactor.toFixed(1)} times since the start
            </text>
          </svg>

          {/* Picture 2: growth against time, which needs no starting size */}
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
              How many times a ripple grows
            </text>
            <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#64748b" />
            <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#64748b" />
            {timeTicks.map((t, i) => (
              <g key={t}>
                <line x1={timeX(t)} y1={GRAPH_BOTTOM} x2={timeX(t)} y2={GRAPH_BOTTOM + 4} stroke="#64748b" />
                <text x={timeX(t)} y={GRAPH_BOTTOM + 16} fill="#cbd5e1" fontSize="9" textAnchor="middle">
                  {timeTickLabels[i]}
                </text>
              </g>
            ))}
            {growthTicks.map((g) => (
              <g key={g}>
                <line x1={GRAPH_LEFT - 4} y1={logY(g, GROWTH_Y_MIN, GROWTH_Y_MAX)} x2={GRAPH_LEFT} y2={logY(g, GROWTH_Y_MIN, GROWTH_Y_MAX)} stroke="#64748b" />
                <text x={GRAPH_LEFT - 8} y={logY(g, GROWTH_Y_MIN, GROWTH_Y_MAX) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
                  {g.toLocaleString('en-US')}
                </text>
              </g>
            ))}
            <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_HEIGHT - 28} fill="#cbd5e1" fontSize="11" textAnchor="middle">
              Time since the Big Bang (years; each tick is ten times the one before)
            </text>
            <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_HEIGHT - 12} fill="#94a3b8" fontSize="10" textAnchor="middle">
              (the model leaves out light, so the earliest times are approximate)
            </text>
            <text
              x={14}
              y={(GRAPH_TOP + GRAPH_BOTTOM) / 2}
              fill="#cbd5e1"
              fontSize="11"
              textAnchor="middle"
              transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}
            >
              Times grown since its start
            </text>

            <polyline
              points={polyline(result.curve, (i) => logY(withoutDarkEnergy[i], GROWTH_Y_MIN, GROWTH_Y_MAX))}
              fill="none"
              stroke={NO_DARK_ENERGY_COLOR}
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            <polyline
              points={polyline(ordinaryResult.curve, (i) => logY(ordinaryResult.curve[i].growth, GROWTH_Y_MIN, GROWTH_Y_MAX))}
              fill="none"
              stroke={ORDINARY_COLOR}
              strokeWidth={2.5}
            />
            <polyline
              points={polyline(darkResult.curve, (i) => logY(darkResult.curve[i].growth, GROWTH_Y_MIN, GROWTH_Y_MAX))}
              fill="none"
              stroke={DARK_COLOR}
              strokeWidth={2.5}
            />
            <text x={GRAPH_RIGHT} y={GRAPH_BOTTOM - 28} fill={DARK_COLOR} fontSize="10" fontWeight="600" textAnchor="end">
              With dark matter: about {Math.round(darkResult.growthSinceStart).toLocaleString('en-US')} times
            </text>
            <text x={GRAPH_RIGHT} y={GRAPH_BOTTOM - 12} fill={ORDINARY_COLOR} fontSize="10" fontWeight="600" textAnchor="end">
              Ordinary matter: about {Math.round(ordinaryResult.growthSinceStart).toLocaleString('en-US')} times
            </text>
            <text x={GRAPH_RIGHT} y={GRAPH_TOP + 8} fill={NO_DARK_ENERGY_COLOR} fontSize="10" fontWeight="600" textAnchor="end">
              Dashed, without dark energy: about {Math.round(withoutDarkEnergy[withoutDarkEnergy.length - 1]).toLocaleString('en-US')} times
            </text>

            {isActive && (
              <circle
                cx={timeX(Math.max(now.yearsAfterBigBang, TIME_MIN_YEARS))}
                cy={logY(Math.max(now.growth, 1), GROWTH_Y_MIN, GROWTH_Y_MAX)}
                r={5}
                fill={patchColor}
                stroke="#0b1020"
                strokeWidth={2}
              />
            )}
          </svg>

          {/* Picture 3: the density excess of the chosen ripple */}
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
              Your ripple: how much denser than average
            </text>
            <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke="#64748b" />
            <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke="#64748b" />
            {timeTicks.map((t, i) => (
              <g key={t}>
                <line x1={timeX(t)} y1={GRAPH_BOTTOM} x2={timeX(t)} y2={GRAPH_BOTTOM + 4} stroke="#64748b" />
                <text x={timeX(t)} y={GRAPH_BOTTOM + 16} fill="#cbd5e1" fontSize="9" textAnchor="middle">
                  {timeTickLabels[i]}
                </text>
              </g>
            ))}
            {excessTicks.map((d, i) => (
              <g key={d}>
                <line x1={GRAPH_LEFT - 4} y1={logY(d, EXCESS_Y_MIN, EXCESS_Y_MAX)} x2={GRAPH_LEFT} y2={logY(d, EXCESS_Y_MIN, EXCESS_Y_MAX)} stroke="#64748b" />
                <text x={GRAPH_LEFT - 8} y={logY(d, EXCESS_Y_MIN, EXCESS_Y_MAX) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
                  {excessTickLabels[i]}
                </text>
              </g>
            ))}
            <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_HEIGHT - 28} fill="#cbd5e1" fontSize="11" textAnchor="middle">
              Time since the Big Bang (years; each tick is ten times the one before)
            </text>
            <text
              x={14}
              y={(GRAPH_TOP + GRAPH_BOTTOM) / 2}
              fill="#cbd5e1"
              fontSize="11"
              textAnchor="middle"
              transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}
            >
              Density excess (0.1 = 10% denser)
            </text>

            <line
              x1={GRAPH_LEFT}
              y1={logY(CLUMP_THRESHOLD, EXCESS_Y_MIN, EXCESS_Y_MAX)}
              x2={GRAPH_RIGHT}
              y2={logY(CLUMP_THRESHOLD, EXCESS_Y_MIN, EXCESS_Y_MAX)}
              stroke={CLUMP_COLOR}
              strokeDasharray="5 4"
            />
            <text x={GRAPH_LEFT + 8} y={logY(CLUMP_THRESHOLD, EXCESS_Y_MIN, EXCESS_Y_MAX) - 6} fill={CLUMP_COLOR} fontSize="10" fontWeight="600">
              Becomes a clump (the model stops following it here)
            </text>
            <polyline
              points={polyline(result.curve, excessY, excessPointCount)}
              fill="none"
              stroke={patchColor}
              strokeWidth={2.5}
            />
            <text x={GRAPH_RIGHT} y={GRAPH_BOTTOM - 8} fill={patchColor} fontSize="10" fontWeight="600" textAnchor="end">
              {kindLabels[kind]}
            </text>
            {isActive && (
              <circle
                cx={timeX(Math.max(now.yearsAfterBigBang, TIME_MIN_YEARS))}
                cy={logY(Math.max(Math.min(now.densityExcess, CLUMP_THRESHOLD), EXCESS_Y_MIN), EXCESS_Y_MIN, EXCESS_Y_MAX)}
                r={5}
                fill={patchColor}
                stroke="#0b1020"
                strokeWidth={2}
              />
            )}
          </svg>

          {/* Picture 4: the starting size needed for a clump */}
          <svg
            width={NEED_WIDTH}
            height={NEED_HEIGHT}
            viewBox={`0 0 ${NEED_WIDTH} ${NEED_HEIGHT}`}
            style={{
              display: 'block',
              border: '1px solid var(--border-color, #ccc)',
              borderRadius: '8px',
              backgroundColor: '#0b1020',
              maxWidth: '100%',
              height: 'auto',
            }}
          >
            <text x={NEED_WIDTH / 2} y={20} fill="#e2e8f0" fontSize="12" fontWeight="600" textAnchor="middle">
              How big must a ripple start to become a clump by today?
            </text>
            {needRows.map((row) => (
              <g key={row.label}>
                <text x={NEED_LEFT} y={row.y - 14} fill={row.color} fontSize="10" fontWeight="600">
                  {row.label}: {partsInLabel(row.delta)}
                </text>
                <line x1={NEED_LEFT} y1={row.y} x2={NEED_RIGHT} y2={row.y} stroke="#334155" />
                <circle cx={needX(row.delta)} cy={row.y} r={6} fill={row.color} stroke="#0b1020" strokeWidth={2} />
              </g>
            ))}
            {[1e-5, 1e-4, 1e-3, 1e-2].map((d) => (
              <g key={d}>
                <line x1={needX(d)} y1={216} x2={needX(d)} y2={220} stroke="#64748b" />
                <text x={needX(d)} y={232} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                  {d}
                </text>
              </g>
            ))}
            <line x1={NEED_LEFT} y1={216} x2={NEED_RIGHT} y2={216} stroke="#64748b" />
            <text x={NEED_WIDTH - 10} y={NEED_HEIGHT - 4} fill="#94a3b8" fontSize="9" textAnchor="end">
              Density excess (each tick is ten times the one before)
            </text>
          </svg>
        </div>

        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read these diagrams.</strong> Imagine a region of the very early universe that is
            only <em>slightly</em> denser than the average. Gravity pulls a little extra matter into it, which
            makes it a little denser still. At the same time, the stretching of space keeps spreading
            everything out. The four pictures above show how that tug-of-war plays out over time, and how big
            the starting difference has to be for the region to end up as a clump (the seed of a galaxy).
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Two words first.</strong> The <strong>density excess</strong> is how much denser than
            average the region is. A density excess of 0.1 means 10% denser: if an average patch holds 100
            grains of sand, this one holds 110. A density excess of 1 means twice the average. The{' '}
            <strong>growth</strong> is how many times bigger the density excess has become since the start. If
            a region starts 1 part in 1,000 denser and grows 100 times, it ends up 1 part in 10 denser.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 1, the strip.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>What is drawn.</strong> A long, thin slice of the early universe. Each dot is a small
              bit of matter. <span style={{ color: ORDINARY_COLOR }}>Amber dots</span> are ordinary matter, and{' '}
              <span style={{ color: DARK_COLOR }}>violet dots</span> are dark matter (shown only when you
              choose "ordinary plus dark matter"). The middle of the strip is the slightly denser region.
            </li>
            <li>
              <strong>What it shows.</strong> At the start, the dots are spread almost evenly. As the ripple
              grows, dots drift toward the middle and crowd together. The crowding is drawn at the model's
              true density excess, with nothing exaggerated. So a tiny ripple, such as 1 part in 100,000,
              really does look almost perfectly smooth even after it has grown thousands of times. That is
              not a mistake in the picture: it is how small the ripple still is.
            </li>
            <li>
              <strong>Space stretching.</strong> The picture follows one fixed patch of matter, so the dots
              keep their place on the screen while the space between them stretches. The label under the
              strip says by how much: when it says "stretched 3,401 times," every distance in the real
              universe has grown 3,401 times since the start.
            </li>
            <li>
              <strong>The green glow.</strong> If the ripple reaches a density excess of 1, a green glow
              appears around the middle. That is the moment the region has become a clump, and a galaxy would
              grow there in the real universe. The glow is only an illustration. The model does not compute
              what the clump looks like. It only tells you <em>when</em> the region would become one.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 2, how many times a ripple grows.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>What the axes mean.</strong> Along the bottom is time since the Big Bang, from 10
              thousand years to 10 billion years. Each tick is ten times the one before, so early times are
              not squashed into the corner. Up the side is how many times the ripple has grown since it
              started. Each tick is again ten times the one before (1, 10, 100, 1,000).
            </li>
            <li>
              <strong>The two lines.</strong> The{' '}
              <span style={{ color: DARK_COLOR }}>violet line</span> is ordinary plus dark matter. It starts
              earlier (at about 50 thousand years in this model), because dark matter does not interact with light and so
              can begin to gather before ordinary matter can. The{' '}
              <span style={{ color: ORDINARY_COLOR }}>amber line</span> is ordinary matter alone. It starts
              later (at about 470 thousand years in this model, which leaves out light, so the real figure is
              about 380 thousand), when the oldest light (Experiment 3) was released and ordinary matter
              stopped being held smooth by light. This picture does not depend on how big
              you choose the starting ripple.
            </li>
            <li>
              <strong>What to look for.</strong> Both lines climb steadily. By today, the amber line has
              grown about {Math.round(ordinaryResult.growthSinceStart).toLocaleString('en-US')} times and the
              violet line about {Math.round(darkResult.growthSinceStart).toLocaleString('en-US')} times, so
              the head start is worth a factor of about{' '}
              {(darkResult.growthSinceStart / ordinaryResult.growthSinceStart).toFixed(1)}. While matter
              dominates, a ripple grows in step with the size of the universe: if the universe doubles in size, the ripple
              doubles.
            </li>
            <li>
              <strong>The dashed line.</strong> It shows the growth with no dark energy at all (for the kind
              of matter you chose): about{' '}
              {Math.round(withoutDarkEnergy[withoutDarkEnergy.length - 1]).toLocaleString('en-US')} times,
              against about {Math.round(result.growthSinceStart).toLocaleString('en-US')} times with it. The
              two lines separate only near the end, because dark energy only became important in the last few
              billion years. From then on the expansion speeds up, which makes it harder for gravity to pull
              matter together, so the growth slows down.
            </li>
            <li>
              <strong>The moving dot</strong> marks where the ripple is during the run.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 3, your ripple.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>What is drawn.</strong> The density excess of the starting size you chose (
              {partsInLabel(startDelta)}), against the same time axis as Picture 2. Up the side, each tick is
              ten times the one before, from 0.00001 (1 part in 100,000) to 1 (twice the average density).
            </li>
            <li>
              <strong>The green dashed line.</strong> It marks a density excess of 1. A ripple that reaches
              it has become a clump, and the model stops following it there, because the simple description
              of a slightly denser region no longer applies once it is that dense.
            </li>
            <li>
              <strong>What to look for.</strong> This line is Picture 2's line, lifted so that it starts at
              the size you chose. Your ripple ends today at{' '}
              {result.becameClump
                ? `a density excess of 1 or more: it became a clump, at a time when the redshift was about ${redshiftLabel(result.redshiftOfClump ?? 0)}.`
                : `a density excess of about ${result.densityExcessToday.toPrecision(2)}, so it did not reach the green line and did not become a clump.`}{' '}
              Try a different starting size to see the line start higher or lower, and watch whether it
              reaches the green line.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
            <strong>Picture 4, how big must a ripple start.</strong>
          </p>
          <ul style={{ margin: '0 0 0.6rem 0', paddingLeft: '1.1rem' }}>
            <li>
              <strong>What is drawn.</strong> Four dots on one sideways scale of density excess, each tick ten
              times the one before. Further right means a bigger starting difference.
            </li>
            <li>
              <strong>The idea.</strong> Since a ripple grows by a fixed number of times, you can work
              backward: the smallest starting ripple that reaches 1 by today is 1 divided by that number. For
              ordinary matter the growth is about {Math.round(ordinaryResult.growthSinceStart).toLocaleString('en-US')}, so the
              ripple must start at about 1 ÷ {Math.round(ordinaryResult.growthSinceStart).toLocaleString('en-US')} = {partsInLabel(ordinaryResult.requiredStartDelta)}.
              With the dark matter head start the growth is about {Math.round(darkResult.growthSinceStart).toLocaleString('en-US')},
              so it needs only about {partsInLabel(darkResult.requiredStartDelta)}.
            </li>
            <li>
              <strong>The green dot</strong> is the starting size you chose. If it is to the right of a
              kind of matter's dot, your ripple is big enough to become a clump with that kind of matter. If
              it is to the left, it is not.
            </li>
            <li>
              <strong>The grey dot at the far left</strong> is the size of the oldest light's ripple (1 part
              in 100,000), but be careful: that is a difference in <em>temperature</em> (Experiment 3), which
              is not the same thing as how much denser a region of matter is. The picture puts them side by
              side for reference only. This model does not say whether the real universe started with
              enough, and it does not draw that conclusion.
            </li>
          </ul>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Running it.</strong> When you press <strong>Run</strong>, watch for about 9 seconds. The
            strip and the moving dots play from the start to today. The motion is only there to help you see
            the growth, and the numbers at the end are exact. Time on the graphs is approximate for the
            earliest moments, because this model leaves out light and other very fast particles, as in
            Experiments 5 to 8.
          </p>
        </div>
      </div>
    </div>
  )
}
