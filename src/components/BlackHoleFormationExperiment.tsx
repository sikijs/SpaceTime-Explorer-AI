import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  CHANDRASEKHAR_LIMIT_SOLAR_MASSES,
  MAX_CORE_MASS,
  MIN_CORE_MASS,
  NEUTRON_STAR_RADIUS_KM,
  SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
  SURE_NEUTRON_STAR_TOP_SOLAR_MASSES,
  runBlackHoleFormationExperiment,
  whiteDwarfRadiusKm,
} from '../physics/blackHoleFormationExperiment'
import type { CoreOutcome, CoreResult } from '../physics/blackHoleFormationExperiment'

interface BlackHoleFormationExperimentProps {
  onComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The "squeeze"
// is only a way of showing the result; it does not model the time a real collapse takes.
const ANIMATION_DURATION_MS = 10_000

const MASS_PRESETS = [0.6, 1.0, 1.4, 1.8, 2.5, 3.5, 10]

const WHITE_DWARF_COLOR = '#60a5fa'
const NEUTRON_STAR_COLOR = '#a78bfa'
const UNCERTAIN_COLOR = '#f59e0b'
const BLACK_HOLE_COLOR = '#e2e8f0'
const HORIZON_COLOR = '#e2e8f0'

const OUTCOME_COLOR: Record<CoreOutcome, string> = {
  'white-dwarf': WHITE_DWARF_COLOR,
  'neutron-star': NEUTRON_STAR_COLOR,
  uncertain: UNCERTAIN_COLOR,
  'black-hole': BLACK_HOLE_COLOR,
}
const OUTCOME_NAME: Record<CoreOutcome, string> = {
  'white-dwarf': 'a white dwarf',
  'neutron-star': 'a neutron star',
  uncertain: 'uncertain: a neutron star or a black hole',
  'black-hole': 'a black hole',
}

// The ladder (the first picture): the core mass on a logarithmic scale.
const LADDER_WIDTH = 700
const LADDER_HEIGHT = 380
const LADDER_LEFT = 60
const LADDER_RIGHT = 640
const BAR_TOP = 124
const BAR_HEIGHT = 60

// The size ruler (the second picture): size in km on a logarithmic scale.
const RULER_WIDTH = 700
const RULER_HEIGHT = 380
const RULER_LEFT = 60
const RULER_RIGHT = 640
const RULER_Y = 200
const RULER_MIN_KM = 0.1
const RULER_MAX_KM = 100_000
// Where the squeeze starts (an arbitrary large size, for the picture only).
const SQUEEZE_START_KM = 50_000

// The white dwarf's size graph (the third picture).
const WD_WIDTH = 700
const WD_HEIGHT = 440
const WD_LEFT = 84
const WD_RIGHT = 500
const WD_TOP = 66
const WD_BOTTOM = 330
const WD_MASS_MIN = 0.3
const WD_MASS_MAX = 2.0
const WD_RADIUS_MAX_KM = 14_000
const WD_CURVE_POINTS = 90

const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }
const SVG_STYLE: CSSProperties = {
  display: 'block',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
  marginTop: '1rem',
}

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A length in km, in plain words.
const formatKm = (km: number) => `${formatNumber(km)} km`

// A ratio, to two decimals when small and three figures when large ("2.54", "5,060").
const formatRatio = (ratio: number) => (ratio >= 100 ? Number(ratio.toPrecision(2)).toLocaleString('en-US') : ratio.toFixed(2))

// A position of the squeeze: the ball shrinks by the same factor in each equal slice of the playback, as on the
// logarithmic ruler. It ends at what holds it up, or, for a black hole, inside its own horizon.
function squeezeRadiusAt(result: CoreResult, progress: number): number {
  const end = result.heldUpRadiusKm ?? result.horizonRadiusKm * 0.3
  return SQUEEZE_START_KM * (end / SQUEEZE_START_KM) ** progress
}

// The first picture: what holds the core up, by mass.
function Ladder({ result }: { result: CoreResult }) {
  const logLow = Math.log(MIN_CORE_MASS)
  const logHigh = Math.log(MAX_CORE_MASS)
  const xFor = (mass: number) => LADDER_LEFT + ((Math.log(mass) - logLow) / (logHigh - logLow)) * (LADDER_RIGHT - LADDER_LEFT)
  const mx = xFor(result.coreMassSolarMasses)
  const zoneLabels: Record<CoreOutcome, [string, string]> = {
    'white-dwarf': ['white dwarf', 'held up by electrons'],
    'neutron-star': ['neutron', 'star'],
    uncertain: ['not', 'known'],
    'black-hole': ['black hole', 'no known pressure holds it'],
  }
  const ticks = [0.3, 0.5, 1, 2, 3, 5, 10]
  const edges: Array<{ mass: number; text: string; anchor: 'end' | 'middle' | 'start' }> = [
    { mass: CHANDRASEKHAR_LIMIT_SOLAR_MASSES, text: 'limit: 1.44', anchor: 'end' },
    { mass: SURE_NEUTRON_STAR_TOP_SOLAR_MASSES, text: 'about 2', anchor: 'middle' },
    { mass: SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES, text: 'about 3', anchor: 'start' },
  ]
  const legend: Array<[CoreOutcome, string]> = [
    ['white-dwarf', 'White dwarf: below 1.44 Suns, held up by the push of electrons. About as wide as the Earth or smaller.'],
    ['neutron-star', 'Neutron star: from 1.44 up to about 2 Suns, held up by the push of neutrons. About 12 km across.'],
    ['uncertain', 'Not known: between about 2 and 3 Suns, a neutron star might hold, or nothing might. This is not settled.'],
    ['black-hole', 'Black hole: above about 3 Suns, no known pressure holds the core up, so it collapses inside its horizon.'],
  ]

  return (
    <svg viewBox={`0 0 ${LADDER_WIDTH} ${LADDER_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, maxWidth: `${LADDER_WIDTH}px` }}>
      <defs>
        <pattern id="uncertain-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#3b2a0a" />
          <line x1="0" y1="0" x2="0" y2="8" stroke={UNCERTAIN_COLOR} strokeWidth="3" />
        </pattern>
      </defs>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The ladder: what holds the core up
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: the core's mass, in Suns (each step to the right is a bigger mass; the scale is logarithmic).
      </text>

      {/* The marker for the chosen core */}
      <text x={Math.min(Math.max(mx, 120), LADDER_RIGHT - 70)} y={84} fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
        your core: {formatNumber(result.coreMassSolarMasses)} Suns
      </text>
      <polygon points={`${mx - 8},96 ${mx + 8},96 ${mx},112`} fill="#ffffff" />

      {/* The four zones */}
      {result.ladder.map((zone) => {
        const x0 = xFor(zone.fromSolarMasses)
        const x1 = xFor(zone.toSolarMasses)
        const [line1, line2] = zoneLabels[zone.outcome]
        const dark = zone.outcome === 'white-dwarf' || zone.outcome === 'neutron-star'
        const fill = zone.outcome === 'uncertain' ? 'url(#uncertain-hatch)' : zone.outcome === 'black-hole' ? '#000000' : OUTCOME_COLOR[zone.outcome]
        return (
          <g key={zone.outcome}>
            <rect
              x={x0}
              y={BAR_TOP}
              width={x1 - x0}
              height={BAR_HEIGHT}
              fill={fill}
              fillOpacity={dark ? 0.55 : 1}
              stroke={zone.outcome === 'black-hole' ? BLACK_HOLE_COLOR : '#0b1020'}
              strokeWidth={zone.outcome === 'black-hole' ? 1.5 : 1}
            />
            <text x={(x0 + x1) / 2} y={BAR_TOP + 26} fill="#ffffff" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              {line1}
            </text>
            <text x={(x0 + x1) / 2} y={BAR_TOP + 40} fill="#ffffff" fontSize="10" textAnchor="middle">
              {line2}
            </text>
          </g>
        )
      })}

      {/* The scale and the three edges */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xFor(t)} y1={BAR_TOP + BAR_HEIGHT} x2={xFor(t)} y2={BAR_TOP + BAR_HEIGHT + 5} stroke="#94a3b8" />
          <text x={xFor(t)} y={BAR_TOP + BAR_HEIGHT + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      {edges.map((e) => (
        <g key={e.text}>
          <line x1={xFor(e.mass)} y1={BAR_TOP} x2={xFor(e.mass)} y2={BAR_TOP + BAR_HEIGHT + 30} stroke="#ffffff" strokeOpacity={0.45} strokeDasharray="2 3" />
          <text x={xFor(e.mass) + (e.anchor === 'end' ? -4 : e.anchor === 'start' ? 4 : 0)} y={BAR_TOP + BAR_HEIGHT + 42} fill="#e2e8f0" fontSize="10" textAnchor={e.anchor}>
            {e.text}
          </text>
        </g>
      ))}
      <text x={(LADDER_LEFT + LADDER_RIGHT) / 2} y={BAR_TOP + BAR_HEIGHT + 62} fill="#94a3b8" fontSize="11" textAnchor="middle">
        the core's mass, in Suns
      </text>

      {/* What each zone means */}
      {legend.map(([outcome, text], i) => (
        <g key={outcome}>
          <rect
            x={60}
            y={BAR_TOP + BAR_HEIGHT + 82 + i * 22}
            width={12}
            height={12}
            fill={outcome === 'uncertain' ? 'url(#uncertain-hatch)' : outcome === 'black-hole' ? '#000000' : OUTCOME_COLOR[outcome]}
            fillOpacity={outcome === 'white-dwarf' || outcome === 'neutron-star' ? 0.55 : 1}
            stroke={outcome === 'black-hole' ? BLACK_HOLE_COLOR : 'none'}
          />
          <text x={80} y={BAR_TOP + BAR_HEIGHT + 92 + i * 22} fill="#cbd5e1" fontSize="10.5">
            {text}
          </text>
        </g>
      ))}
    </svg>
  )
}

// The second picture: the held-up core and its horizon, on one logarithmic ruler of sizes.
function SizeRuler({ result, progress }: { result: CoreResult; progress: number }) {
  const logLow = Math.log10(RULER_MIN_KM)
  const logHigh = Math.log10(RULER_MAX_KM)
  const xFor = (km: number) => RULER_LEFT + ((Math.log10(km) - logLow) / (logHigh - logLow)) * (RULER_RIGHT - RULER_LEFT)
  const ticks = [0.1, 1, 10, 100, 1000, 10_000, 100_000]
  const ringX = xFor(result.horizonRadiusKm)
  const radiusNow = squeezeRadiusAt(result, progress)
  const ballX = xFor(radiusNow)
  const color = OUTCOME_COLOR[result.outcome]
  const isBlackHole = result.outcome === 'black-hole'
  const finished = progress >= 1
  const ballName =
    result.outcome === 'white-dwarf' ? 'white dwarf' : result.outcome === 'black-hole' ? 'the core' : 'neutron star'

  return (
    <svg viewBox={`0 0 ${RULER_WIDTH} ${RULER_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, maxWidth: `${RULER_WIDTH}px` }}>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        How wide is the core, compared with its own horizon?
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        A ruler of sizes (radius, in km). Each step to the right is ten times bigger. The core shrinks from the right.
      </text>

      {/* The region inside the horizon */}
      <rect x={RULER_LEFT} y={RULER_Y - 46} width={Math.max(0, ringX - RULER_LEFT)} height={92} fill="#000000" stroke={HORIZON_COLOR} strokeOpacity={0.5} strokeDasharray="3 3" />
      <text x={RULER_LEFT + 6} y={RULER_Y - 52} fill="#cbd5e1" fontSize="10">
        smaller than the horizon radius: a black hole
      </text>

      {/* The ruler */}
      <line x1={RULER_LEFT} y1={RULER_Y} x2={RULER_RIGHT} y2={RULER_Y} stroke="#94a3b8" strokeWidth={2} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xFor(t)} y1={RULER_Y - 5} x2={xFor(t)} y2={RULER_Y + 5} stroke="#94a3b8" />
          <text x={xFor(t)} y={RULER_Y + 48} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {t >= 1000 ? t.toLocaleString('en-US') : t}
          </text>
        </g>
      ))}
      <text x={(RULER_LEFT + RULER_RIGHT) / 2} y={RULER_Y + 66} fill="#94a3b8" fontSize="11" textAnchor="middle">
        radius, in km (logarithmic)
      </text>

      {/* The horizon ring */}
      <circle cx={ringX} cy={RULER_Y} r={9} fill="none" stroke={HORIZON_COLOR} strokeWidth={2.5} />
      <text x={ringX} y={RULER_Y - 18} fill={HORIZON_COLOR} fontSize="10.5" fontWeight="bold" textAnchor="middle">
        horizon
      </text>

      {/* The core: a ball that shrinks */}
      <circle cx={ballX} cy={RULER_Y} r={7} fill={isBlackHole && finished ? '#000000' : color} stroke={isBlackHole ? HORIZON_COLOR : 'none'} strokeWidth={1.5} />
      <text x={ballX} y={RULER_Y + 26} fill={color} fontSize="10.5" fontWeight="bold" textAnchor="middle">
        {ballName}
      </text>

      {/* The numbers */}
      <text x={60} y={RULER_Y + 100} fill={HORIZON_COLOR} fontSize="11">
        <tspan fontWeight="bold">horizon radius (the ring): </tspan>
        {formatKm(result.horizonRadiusKm)}
      </text>
      <text x={60} y={RULER_Y + 120} fill={color} fontSize="11">
        <tspan fontWeight="bold">the core (the ball): </tspan>
        {isBlackHole
          ? 'nothing known holds it up, so it keeps shrinking, past its horizon'
          : result.outcome === 'uncertain'
            ? `${formatKm(radiusNow)}${finished ? ', if a neutron star holds it' : ' so far'}`
            : `${formatKm(radiusNow)}${finished ? '' : ' so far'}`}
      </text>
      <text x={60} y={RULER_Y + 140} fill="#e2e8f0" fontSize="11">
        <tspan fontWeight="bold">how many times wider than its horizon: </tspan>
        {result.radiusOverHorizon === null ? 'it gets smaller than its horizon' : `${formatRatio(result.radiusOverHorizon)} times`}
      </text>
    </svg>
  )
}

// The third picture: a white dwarf's radius against its mass. The heavier, the smaller, down to nothing at the limit.
function WhiteDwarfGraph({ result }: { result: CoreResult }) {
  const xFor = (mass: number) => WD_LEFT + ((mass - WD_MASS_MIN) / (WD_MASS_MAX - WD_MASS_MIN)) * (WD_RIGHT - WD_LEFT)
  const yFor = (km: number) => WD_BOTTOM - (km / WD_RADIUS_MAX_KM) * (WD_BOTTOM - WD_TOP)
  const lastMass = CHANDRASEKHAR_LIMIT_SOLAR_MASSES - 1e-4
  const points: Array<[number, number]> = []
  for (let i = 0; i < WD_CURVE_POINTS; i++) {
    const mass = WD_MASS_MIN + ((lastMass - WD_MASS_MIN) * i) / (WD_CURVE_POINTS - 1)
    points.push([xFor(mass), yFor(whiteDwarfRadiusKm(mass))])
  }
  points.push([xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES), yFor(0)])
  const line = points.map(([x, y]) => `${x},${y}`).join(' ')
  const isWhiteDwarf = result.outcome === 'white-dwarf'
  const massTicks = [0.5, 1, 1.5, 2]

  return (
    <svg viewBox={`0 0 ${WD_WIDTH} ${WD_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, maxWidth: `${WD_WIDTH}px` }}>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        Heavier is smaller: a white dwarf's size against its mass
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: the core's mass, in Suns. Vertical: the radius of what holds the core up, in km.
      </text>

      {[0, 2000, 4000, 6000, 8000, 10_000, 12_000, 14_000].map((km) => (
        <g key={km}>
          <line x1={WD_LEFT} y1={yFor(km)} x2={WD_RIGHT} y2={yFor(km)} stroke="#334155" />
          <text x={WD_LEFT - 8} y={yFor(km) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {km.toLocaleString('en-US')}
          </text>
        </g>
      ))}
      <text x={14} y={(WD_TOP + WD_BOTTOM) / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${(WD_TOP + WD_BOTTOM) / 2})`}>
        radius (km)
      </text>
      {massTicks.map((m) => (
        <g key={m}>
          <line x1={xFor(m)} y1={WD_BOTTOM} x2={xFor(m)} y2={WD_BOTTOM + 5} stroke="#94a3b8" />
          <text x={xFor(m)} y={WD_BOTTOM + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {m}
          </text>
        </g>
      ))}
      <text x={(WD_LEFT + WD_RIGHT) / 2} y={WD_BOTTOM + 36} fill="#94a3b8" fontSize="11" textAnchor="middle">
        the core's mass, in Suns
      </text>

      {/* The limit */}
      <line x1={xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES)} y1={WD_TOP} x2={xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES)} y2={WD_BOTTOM} stroke="#ffffff" strokeOpacity={0.5} strokeDasharray="4 4" />
      <text x={xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES) + 6} y={WD_TOP + 14} fill="#e2e8f0" fontSize="10">
        the limit, 1.44 Suns:
      </text>
      <text x={xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES) + 6} y={WD_TOP + 27} fill="#e2e8f0" fontSize="10">
        a white dwarf's radius falls to zero
      </text>

      {/* The white dwarf curve and the neutron star line */}
      <polyline points={line} fill="none" stroke={WHITE_DWARF_COLOR} strokeWidth={3.5} />
      <line x1={xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES)} y1={yFor(NEUTRON_STAR_RADIUS_KM)} x2={WD_RIGHT} y2={yFor(NEUTRON_STAR_RADIUS_KM)} stroke={NEUTRON_STAR_COLOR} strokeWidth={3} strokeDasharray="6 4" />
      <text x={xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES) + 8} y={yFor(NEUTRON_STAR_RADIUS_KM) - 24} fill={NEUTRON_STAR_COLOR} fontSize="10">
        neutron star: {NEUTRON_STAR_RADIUS_KM} km
      </text>
      <text x={xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES) + 8} y={yFor(NEUTRON_STAR_RADIUS_KM) - 11} fill={NEUTRON_STAR_COLOR} fontSize="10">
        (too small to see at this scale)
      </text>
      <text x={xFor(0.5)} y={yFor(whiteDwarfRadiusKm(0.5)) - 12} fill={WHITE_DWARF_COLOR} fontSize="10.5" fontWeight="bold">
        white dwarf
      </text>

      {/* The chosen core */}
      {isWhiteDwarf && result.heldUpRadiusKm !== null && (
        <>
          <circle cx={xFor(result.coreMassSolarMasses)} cy={yFor(result.heldUpRadiusKm)} r={6} fill="#ffffff" stroke={WHITE_DWARF_COLOR} strokeWidth={2.5} />
          <text x={xFor(result.coreMassSolarMasses) + 10} y={yFor(result.heldUpRadiusKm) - 10} fill="#ffffff" fontSize="10.5" fontWeight="bold">
            your core: {formatKm(result.heldUpRadiusKm)}
          </text>
        </>
      )}
      <text x={96} y={WD_HEIGHT - 42} fill="#cbd5e1" fontSize="11">
        {isWhiteDwarf
          ? `Your core (${formatNumber(result.coreMassSolarMasses)} Suns) is a white dwarf: the white dot is where it sits on the curve.`
          : `Your core (${formatNumber(result.coreMassSolarMasses)} Suns) is above the limit, so it is not a white dwarf: it has no dot on the curve.`}
      </text>
      <text x={96} y={WD_HEIGHT - 20} fill="#94a3b8" fontSize="10">
        The curve is a formula fitted to a numerical calculation, and the real size of a white dwarf varies a little.
      </text>
    </svg>
  )
}

export function BlackHoleFormationExperiment({ onComplete }: BlackHoleFormationExperimentProps) {
  const [mass, setMass] = useState(1.4)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const result = useMemo(() => runBlackHoleFormationExperiment(mass), [mass])

  const handleMassChange = (value: number) => {
    setMass(value)
    setStatus('idle')
    setProgress(0)
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

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 9 — How a Black Hole Forms: What Can Hold Up a Dead Star's Core?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            The mass of the dead star's core, in Suns (the Sun's mass is 1):
          </p>
          {MASS_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleMassChange(m)}
              disabled={status === 'running'}
              className={`toggle-button${mass === m ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {m}
            </button>
          ))}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            A core of {formatNumber(mass)} Suns would have a horizon radius of {formatKm(result.horizonRadiusKm)}.
          </p>
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

        {/* Shown only once the current settings have been run: changing the mass returns to idle and hides it again. */}
        {status !== 'idle' && (
          <>
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              A core of {formatNumber(result.coreMassSolarMasses)} Suns is {OUTCOME_NAME[result.outcome]}. Its horizon radius is{' '}
              {formatKm(result.horizonRadiusKm)}.{' '}
              {result.radiusOverHorizon === null
                ? 'Nothing known holds it up.'
                : `What holds it up has a radius of ${formatKm(result.heldUpRadiusKm as number)}${result.outcome === 'uncertain' ? ' (if a neutron star holds it)' : ''}, which is ${formatRatio(result.radiusOverHorizon)} times its horizon radius.`}
            </p>

            <Ladder result={result} />
            {/* Draft wording, for the owner's review (CLAUDE.md §28.1). */}
            <div style={{ ...CAPTION_STYLE, maxWidth: `${LADDER_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this picture: the ladder.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> A dead star's core has used up its fuel, so nothing is left to push outward
                against its own gravity, except a push that comes from squeezing particles together. The bar is a scale of the
                core's mass, in Suns, and it is divided into zones by what can hold the core up. A <em>white dwarf</em> is a
                dead star held up by electrons, and is about as wide as the Earth or smaller. A <em>neutron star</em> is held
                up by neutrons, and is only about 12 km across. The white marker shows the mass you chose.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. What is really happening.</strong> The limits between the zones are standard results that are given
                here and not derived. The white dwarf's limit, 1.44 Suns, is well established. The neutron star's limit is not
                known exactly: neutron stars of about 2 Suns are known, and the theory says the limit is at most about 3. That
                is why the hatched zone between about 2 and 3 is marked as not known.
              </p>
              <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
                <strong>3. How the picture shows it.</strong> Read the ladder like this:
              </p>
              <ul style={{ margin: '0 0 0.4rem 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Find the marker.</strong> The zone it is over tells you what, if anything, holds that core up. The
                  key under the bar says what each zone means.
                </li>
                <li>
                  <strong>Read the three edges.</strong> The dashed lines mark 1.44, about 2 and about 3 Suns. Each one is a
                  mass at which one kind of push runs out.
                </li>
                <li>
                  <strong>Notice the hatched zone.</strong> It is the only zone drawn as not known. There, a neutron star might
                  hold the core, or nothing might.
                </li>
                <li>
                  <strong>In this run,</strong> your core of {formatNumber(result.coreMassSolarMasses)} Suns is{' '}
                  {OUTCOME_NAME[result.outcome]}.
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> This is a thought experiment about a dead core that has cooled, is not spinning and is
                at rest. How a star gets to the end of its life is not shown, and the round numbers are not exact.
              </p>
            </div>

            <SizeRuler result={result} progress={progress} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${RULER_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this picture: the size ruler.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> A ruler of sizes, from 0.1 km to 100,000 km. Each step to the right is ten
                times bigger, so one ruler can show a core the size of a planet and one the size of a city. The white ring is the
                core's <em>horizon radius</em>: the size it would have to be squeezed inside to be a black hole (you met it in
                Experiment 1). The colored ball is the core, shrinking from the right. The black area to the left of the ring
                is smaller than the horizon radius.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. What is really happening.</strong> The core is squeezed by its own gravity until something holds it
                up. The ball stops where it is held up: the white dwarf's radius, or the neutron star's 12 km. The horizon
                radius is given by the formula from Experiment 1. The squeeze is only a way of showing the result: it does not
                model how long a real collapse takes.
              </p>
              <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
                <strong>3. How the picture shows it.</strong> Read the picture one part at a time:
              </p>
              <ul style={{ margin: '0 0 0.4rem 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The ring</strong> marks the horizon radius. It moves to the right for a heavier core, because a
                  heavier core has a bigger horizon.
                </li>
                <li>
                  <strong>The ball</strong> starts at the far right and shrinks. Watch where it stops, and how far it is from
                  the ring. The farther to the right of the ring, the more room there is before the core would be a black hole.
                </li>
                <li>
                  <strong>The numbers under the ruler</strong> give the horizon radius, the core's radius and how many times
                  wider than its horizon the core is.
                </li>
                <li>
                  <strong>If nothing holds the core,</strong> the ball does not stop: it shrinks past the ring, into the black
                  area, and becomes a black hole.
                </li>
                <li>
                  <strong>In this run,</strong>{' '}
                  {result.radiusOverHorizon === null
                    ? `the core of ${formatNumber(result.coreMassSolarMasses)} Suns has nothing known to hold it, so it ends inside its horizon of ${formatKm(result.horizonRadiusKm)}.`
                    : `the core of ${formatNumber(result.coreMassSolarMasses)} Suns ends at ${formatKm(result.heldUpRadiusKm as number)}, which is ${formatRatio(result.radiusOverHorizon)} times its horizon radius of ${formatKm(result.horizonRadiusKm)}.`}
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> The sizes are typical values, and real ones vary a little. The squeeze starts from an
                arbitrary large size, only for the picture.
              </p>
            </div>

            <WhiteDwarfGraph result={result} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${WD_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this graph: heavier is smaller.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> Across the bottom is the core's mass, in Suns. Up the side is the radius of a
                white dwarf of that mass, in km. The blue curve is the white dwarf's radius. The dashed violet line is the
                neutron star's 12 km, which is too small to show at this scale. The dashed white line is the limit, 1.44 Suns.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. What is really happening.</strong> The curve comes from a formula for white dwarfs that is given, and
                that was fitted to a numerical calculation. It is only a close description, and the real size of a white dwarf
                varies a little.
              </p>
              <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
                <strong>3. How the picture shows it.</strong> Read the graph like this:
              </p>
              <ul style={{ margin: '0 0 0.4rem 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Start at the left and move right,</strong> along the blue curve. As the mass grows, the curve falls:
                  a heavier white dwarf is smaller, not bigger.
                </li>
                <li>
                  <strong>The curve falls faster and faster</strong> near the limit, and reaches zero at 1.44 Suns. Past that
                  mass, electrons cannot hold the core up, so there is no white dwarf.
                </li>
                <li>
                  <strong>The white dot</strong> is your core, if it is a white dwarf. If your core is heavier than 1.44 Suns,
                  there is no dot, and the picture says so.
                </li>
                <li>
                  <strong>In this run,</strong>{' '}
                  {result.outcome === 'white-dwarf'
                    ? `your core of ${formatNumber(result.coreMassSolarMasses)} Suns is a white dwarf of ${formatKm(result.heldUpRadiusKm as number)}.`
                    : `your core of ${formatNumber(result.coreMassSolarMasses)} Suns is above the limit, so it is not a white dwarf.`}
                </li>
              </ul>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> This shows white dwarfs only, and shows no real measurements. It does not show what
                holds a heavier core up.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
