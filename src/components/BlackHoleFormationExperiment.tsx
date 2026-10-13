import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  CHANDRASEKHAR_LIMIT_SOLAR_MASSES,
  MAX_CORE_MASS,
  MIN_CORE_MASS,
  NEUTRON_STAR_RADIUS_KM,
  SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
  SURE_NEUTRON_STAR_TOP_SOLAR_MASSES,
  HORIZON_KM_PER_SOLAR_MASS,
  runBlackHoleFormationExperiment,
  whiteDwarfRadiusKm,
  whiteDwarfRadiusSteps,
} from '../physics/blackHoleFormationExperiment'
import type { CoreOutcome, CoreResult } from '../physics/blackHoleFormationExperiment'
import { BlackHoleFormationTutor } from './BlackHoleFormationTutor'

interface BlackHoleFormationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The "squeeze"
// is only a way of showing the result; it does not model the time a real collapse takes.
const ANIMATION_DURATION_MS = 10_000

const MASS_PRESETS = [0.6, 1.0, 1.4, 1.8, 2.5, 3.5, 10]

// This experiment's three prediction questions, per its specification's "Prediction Activity". Choices are not marked
// here; they are compared with the model's results later (the Results step). The question wording was approved by the owner
// on 2026-10-12 (CLAUDE.md §28.1).
type SizeChoice = 'bigger' | 'same' | 'smaller'
const sizeChoices: Array<{ value: SizeChoice; label: string }> = [
  { value: 'bigger', label: 'It gets bigger' },
  { value: 'same', label: 'It stays the same size' },
  { value: 'smaller', label: 'It gets smaller' },
]

type ThresholdChoice = 'about-one' | 'about-three' | 'about-thirty'
const thresholdChoices: Array<{ value: ThresholdChoice; label: string }> = [
  { value: 'about-one', label: 'About the mass of the Sun (1 Sun)' },
  { value: 'about-three', label: "About 3 times the Sun's mass (3 Suns)" },
  { value: 'about-thirty', label: "About 30 times the Sun's mass (30 Suns)" },
]
// The mass each choice names, in Suns, for working out which one the model's black hole edge is nearest to.
const THRESHOLD_MASS: Record<ThresholdChoice, number> = { 'about-one': 1, 'about-three': 3, 'about-thirty': 30 }

type LimitChoice = 'higher' | 'same' | 'lower'
const limitChoices: Array<{ value: LimitChoice; label: string }> = [
  { value: 'higher', label: 'Higher' },
  { value: 'same', label: 'The same' },
  { value: 'lower', label: 'Lower' },
]

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
    { mass: CHANDRASEKHAR_LIMIT_SOLAR_MASSES, text: `limit: ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES}`, anchor: 'end' },
    { mass: SURE_NEUTRON_STAR_TOP_SOLAR_MASSES, text: `about ${SURE_NEUTRON_STAR_TOP_SOLAR_MASSES}`, anchor: 'middle' },
    { mass: SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES, text: `about ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES}`, anchor: 'start' },
  ]
  const legend: Array<[CoreOutcome, string]> = [
    ['white-dwarf', `White dwarf: below ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, held up by the push of electrons. Roughly the size of the Earth.`],
    ['neutron-star', `Neutron star: from ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES} up to about ${SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} Suns, held up by the push of neutrons. About ${NEUTRON_STAR_RADIUS_KM} km in radius.`],
    ['uncertain', `Not known: between about ${SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} and ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns, a neutron star might hold, or nothing might. This is not settled.`],
    ['black-hole', `Black hole: above about ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns, no known pressure holds the core up, so it collapses inside its horizon.`],
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

export function BlackHoleFormationExperiment({ onComplete, onTutorComplete }: BlackHoleFormationExperimentProps) {
  const [mass, setMass] = useState(1.4)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)

  const [sizePrediction, setSizePrediction] = useState<SizeChoice | null>(null)
  const [thresholdPrediction, setThresthresholdPrediction] = useState<ThresholdChoice | null>(null)
  const [limitPrediction, setLimitPrediction] = useState<LimitChoice | null>(null)
  const [submittedSize, setSubmittedSize] = useState<SizeChoice | null>(null)
  const [submittedThreshold, setSubmittedThreshold] = useState<ThresholdChoice | null>(null)
  const [submittedLimit, setSubmittedLimit] = useState<LimitChoice | null>(null)

  const hasPrediction = sizePrediction !== null && thresholdPrediction !== null && limitPrediction !== null
  const hasSubmittedPrediction = submittedSize !== null && submittedThreshold !== null && submittedLimit !== null

  const result = useMemo(() => runBlackHoleFormationExperiment(mass), [mass])
  const showResults = status === 'complete' && hasSubmittedPrediction

  // The numbers the Results need, all from the physics module (CLAUDE.md §9). The white dwarf's radius is worked at the
  // chosen mass if it is a white dwarf, or at 1 Sun if it is not.
  const workedMass = result.outcome === 'white-dwarf' ? result.coreMassSolarMasses : 1
  const wdSteps = useMemo(() => whiteDwarfRadiusSteps(workedMass), [workedMass])
  const presetRows = useMemo(() => MASS_PRESETS.map((m) => runBlackHoleFormationExperiment(m)), [])
  const radiusLight = whiteDwarfRadiusKm(0.6)
  const radiusMiddle = whiteDwarfRadiusKm(1)
  const radiusHeavy = whiteDwarfRadiusKm(1.4)
  const sizeModel: SizeChoice = radiusMiddle < radiusLight ? 'smaller' : radiusMiddle > radiusLight ? 'bigger' : 'same'
  // The choice nearest (in ratio) to the mass above which nothing known holds a core up.
  const thresholdModel = (Object.keys(THRESHOLD_MASS) as ThresholdChoice[]).reduce((best, choice) =>
    Math.abs(Math.log(THRESHOLD_MASS[choice] / SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES)) <
    Math.abs(Math.log(THRESHOLD_MASS[best] / SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES))
      ? choice
      : best,
  )
  const limitModel: LimitChoice =
    SURE_NEUTRON_STAR_TOP_SOLAR_MASSES > CHANDRASEKHAR_LIMIT_SOLAR_MASSES ? 'higher' : SURE_NEUTRON_STAR_TOP_SOLAR_MASSES < CHANDRASEKHAR_LIMIT_SOLAR_MASSES ? 'lower' : 'same'

  const handleMassChange = (value: number) => {
    setMass(value)
    setStatus('idle')
    setProgress(0)
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedSize(sizePrediction)
      setSubmittedThreshold(thresholdPrediction)
      setSubmittedLimit(limitPrediction)
    }
    setStatus('running')
    setProgress(0)
    setRunCount((n) => n + 1)
  }

  // Matches the rest of the project's precedent: re-opens all three questions for editing without resetting the chosen
  // core mass.
  const handleChangePrediction = () => {
    setSubmittedSize(null)
    setSubmittedThreshold(null)
    setSubmittedLimit(null)
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

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 9 — How a Black Hole Forms: What Can Hold Up a Dead Star's Core?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        {/* Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). The introduction must not give away the answers to the
            three predictions below (§12): not that a heavier white dwarf is smaller, not that there is a largest mass that
            a white dwarf or a neutron star can have (so it does not use the word "limit" and does not name the
            Chandrasekhar limit, which the first picture's caption names), and not that a neutron star can have more mass
            than a white dwarf. It does not say that nothing known holds a heavy enough core up. */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 1 you squeezed objects until they became black holes, and found how
            small each one would have to be. You also found that a neutron star, a dead star only about {NEUTRON_STAR_RADIUS_KM} km in radius, is only
            about 3 times too big. But in nature there is no hand doing the squeezing. When a star runs out of fuel, its own
            gravity squeezes its core, the middle of the star. So what does the squeezing, and what can stop it?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Why even ask this.</strong> The Sun will never become a black hole. Some stars do. What decides the
            difference? It comes down to what is left at the center when the fuel is gone, and whether anything can hold it
            up.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>How a star ends, and where a black hole comes in.</strong> Six short ideas.
          </p>
          <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>A star is a balance.</strong> A star is a huge ball of hot gas. Its own gravity pulls every part of it
              toward the center. What stops it from collapsing is a push outward, from the heat inside. Think of a balloon: the
              air inside pushes out, the rubber pulls in, and the balloon keeps its shape for as long as the two balance. The
              Sun has kept this balance for about 4.6 billion years.
            </li>
            <li>
              <strong>The heat comes from fuel.</strong> Deep in the middle of a star, the heat and the squeeze are so great that
              the tiny particles at the center of atoms, their nuclei, are forced to join together, and each time they do, they
              release energy. This is called <strong>nuclear fusion</strong>. It is what keeps the gas hot, and the hot gas is
              what pushes outward. The star's "fuel" is whatever can still be fused.
            </li>
            <li>
              <strong>The fuel runs out.</strong> A star does not have an endless supply. Like a campfire, once the wood is used
              up, the heat is no longer made, and it fades. When the middle of the star has no fuel left that it can use, the
              push that came from the heat fades with it.
            </li>
            <li>
              <strong>Gravity then squeezes the core.</strong> The middle part of the star, where the fuel was used up, is its{' '}
              <strong>core</strong>. With the push of the heat gone, gravity squeezes the core, packing the same matter into less
              and less room. (What happens to the star's outer layers is a different story, and this experiment leaves it out.)
              The more mass a core has, the harder gravity pulls it in.
            </li>
            <li>
              <strong>Squeezing brings in a different kind of push.</strong> Particles do not like being crowded together, and
              when a core is squeezed hard enough, they push back. This push has nothing to do with heat, so it can still be
              there when the core has cooled. You will meet the details below. The question is whether this push is enough to
              balance gravity and hold the core up. If it is, the core stops shrinking, at a size where the push and gravity
              balance, just as the balloon does. If it is not, nothing stops the squeeze.
            </li>
            <li>
              <strong>What is left depends on what holds the core up.</strong> Three things can be left behind. A{' '}
              <strong>white dwarf</strong> is a dead core held up by one kind of particle. A <strong>neutron star</strong> is a
              dead core held up by another, much more tightly squeezed. And if nothing can hold the core up, it keeps shrinking
              until it is inside its own horizon, and that is a <strong>black hole</strong>. So a black hole forms when a
              dead core is squeezed past anything that can hold it up. The experiment asks how that depends on the core's mass.
            </li>
          </ol>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What happens.</strong> Here is the whole experiment, step by step.
          </p>
          <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>You make three predictions.</li>
            <li>You choose the mass of a dead star's core, in Suns (one Sun is the mass of our Sun).</li>
            <li>
              You press Run. A ball, the core, shrinks over 10 seconds, from a large size down to whatever holds it up. This is
              only how the result is shown, and it is not how long a real collapse takes.
            </li>
            <li>
              A <strong>ladder</strong> shows what holds a core up, for every mass. A <strong>ruler</strong> shows how wide the
              core ends up compared with its own horizon. A <strong>graph</strong> shows how the size of one kind of dead star
              depends on its mass.
            </li>
            <li>The experiment stops at the horizon. It does not show anything inside it.</li>
          </ol>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some words we will use.</strong> A <strong>dead star's core</strong> is the central part of a star that has
            used up its fuel. A star's fuel is what makes it push outward against its own gravity, so once the fuel is gone,
            only a push that comes from squeezing particles together is left. A <strong>white dwarf</strong> is a dead star
            roughly the size of the Earth, and a <strong>neutron star</strong> is a dead star only about {NEUTRON_STAR_RADIUS_KM} km in
            radius (about {2 * NEUTRON_STAR_RADIUS_KM} km across), about the size of a city. Atoms are made of particles. An <strong>electron</strong> is a tiny particle that moves
            around the outside of an atom, and a <strong>neutron</strong> is a particle that sits in the middle of an atom, in
            its nucleus. Both can hold a dead star up, in a way that has a name: <strong>degeneracy pressure</strong>. Here is a
            comparison. In a theatre, every seat holds one person, and you cannot put two people in the same seat, however hard
            you push. Electrons, and neutrons, behave a little like this: no two of them can be in exactly the same state, so
            when they are crowded together they resist being crowded more. That resistance is the push. The comparison is only
            a picture, and the tutor comes back to it. Finally, from Experiment 1: a <strong>Sun</strong> is the mass of our
            Sun, which is how we measure the mass of a core here, and the <strong>horizon radius</strong> is the distance from
            the center to the horizon of a black hole of that mass, the size the core would have to be squeezed inside to be a
            black hole.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What this builds on.</strong> Experiment 1 found the horizon radius and squeezed real objects down to it.
            It said that what could do the squeezing, and what would stop it, was not modeled. This experiment is the answer.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> First, make three predictions. Then choose a core mass and run it. Try other masses too,
            and compare.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What to look for.</strong> Where your core is on the ladder, where the ball stops, how far that is from the
            ring of the horizon, and what the three pictures show as you try different masses.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>This is a thought experiment about a dead core</strong> that has cooled, is not spinning and is at rest.
              How the star got to the end of its life is not shown.
            </li>
            <li>
              <strong>The numbers are standard results, given and not derived,</strong> and some are not known exactly. The
              experiment says which, when it uses them.
            </li>
            <li>
              <strong>The sizes and masses are round numbers.</strong> Real ones vary a little.
            </li>
            <li>
              <strong>The experiment stops at the horizon.</strong> Nothing inside it is modeled.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A white dwarf is a dead star held up by the push of its electrons. If you add more mass to a white dwarf, what do
            you think happens to its size?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {sizeChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setSizePrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${sizePrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            At about what mass do you think a dead star's core first becomes a black hole? (This is the mass of the core, not of
            the whole star.)
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {thresholdChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setThresthresholdPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${thresholdPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A neutron star is held up by neutrons instead of electrons. Do you think the largest mass a neutron star can have
            is higher than, the same as, or lower than a white dwarf's?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {limitChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setLimitPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${limitPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${sizeChoices.find((c) => c.value === (sizePrediction ?? submittedSize))!.label}; ${
                  thresholdChoices.find((c) => c.value === (thresholdPrediction ?? submittedThreshold))!.label
                }; ${limitChoices.find((c) => c.value === (limitPrediction ?? submittedLimit))!.label}`
              : 'Answer all three questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many core masses as you like below. Or, change your
              predictions and start over:
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
            The mass of the dead star's core, in Suns (the Sun's mass is 1):
          </p>
          {MASS_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleMassChange(m)}
              disabled={!hasPrediction || status === 'running'}
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
          disabled={!hasPrediction || status === 'running'}
          style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
        >
          {status === 'running' ? 'Running...' : 'Run'}
        </button>

        {!hasPrediction && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Answer the predictions above to try the controls.</p>
        )}

        {/* Shown only once the current settings have been run: changing the mass returns to idle and hides it again. */}
        {hasSubmittedPrediction && status !== 'idle' && (
          <>
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              A core of {formatNumber(result.coreMassSolarMasses)} Suns is {OUTCOME_NAME[result.outcome]}. Its horizon radius is{' '}
              {formatKm(result.horizonRadiusKm)}.{' '}
              {result.radiusOverHorizon === null
                ? 'Nothing known holds it up.'
                : `What holds it up has a radius of ${formatKm(result.heldUpRadiusKm as number)}${result.outcome === 'uncertain' ? ' (if a neutron star holds it)' : ''}, which is ${formatRatio(result.radiusOverHorizon)} times its horizon radius.`}
            </p>

            <Ladder result={result} />
            {/* Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). */}
            <div style={{ ...CAPTION_STYLE, maxWidth: `${LADDER_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this picture: the ladder.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> A dead star's core has used up its fuel, so nothing is left to push outward
                against its own gravity, except a push that comes from squeezing particles together. The bar is a scale of the
                core's mass, in Suns, and it is divided into zones by what can hold the core up. A <em>white dwarf</em> is a
                dead star held up by electrons, and is roughly the size of the Earth. A <em>neutron star</em> is held
                up by neutrons, and is only about {NEUTRON_STAR_RADIUS_KM} km in radius (about {2 * NEUTRON_STAR_RADIUS_KM} km across). The white marker shows the mass you chose.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. What is really happening.</strong> The limits between the zones are standard results that are given
                here and not derived. The white dwarf's limit, {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, is called the <em>Chandrasekhar limit</em>, after the physicist who worked it out in the 1930s, and it is well established. The neutron star's limit is not
                known exactly: neutron stars of about 2 Suns are known, and the theory says the limit is somewhere between about 2 and 3 (some newer studies point to the lower end). That
                is why the hatched zone between about 2 and 3 is marked as not known.
              </p>
              <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
                <strong>3. How the picture shows it.</strong> Read the ladder one step at a time:
              </p>
              <ul style={{ margin: '0 0 0.4rem 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The bar is a ruler for the core's mass.</strong> The smallest mass is on the left ({MIN_CORE_MASS} Suns)
                  and the largest is on the right ({MAX_CORE_MASS} Suns), and the numbers under the bar are the marks. The marks are
                  not evenly spaced, because each step to the right is a bigger jump in mass. That way the bar has room for
                  small cores and for big ones.
                </li>
                <li>
                  <strong>The white marker shows the core you chose.</strong> It points to its mass on the ruler, and its label
                  says the mass in Suns.
                </li>
                <li>
                  <strong>The color under the marker tells you what holds that core up.</strong> Blue means the push of
                  electrons holds it: a white dwarf. Violet means the push of neutrons holds it: a neutron star. The hatched
                  zone means that nobody knows for sure. Black means that no known push holds it, so it becomes a black hole.
                  The key under the bar says the same in words.
                </li>
                <li>
                  <strong>The dashed lines are the edges between the zones.</strong> Each edge is the heaviest core that one
                  kind of push can hold up. At {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns the push of electrons gives out. At about{' '}
                  {SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} Suns we are still sure that neutrons can hold a core up (neutron stars a
                  little over 2 Suns have been measured). By about {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns the theory says that
                  even neutrons can no longer hold it (some newer studies put the limit nearer 2 to 2.3 Suns).
                </li>
                <li>
                  <strong>The hatched zone is "not known" on purpose.</strong> Between about {SURE_NEUTRON_STAR_TOP_SOLAR_MASSES}{' '}
                  and {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns, scientists cannot yet say whether a core is held up or not,
                  because the matter inside a neutron star is not fully understood. The picture shows this as unknown instead
                  of pretending to know.
                </li>
                <li>
                  <strong>Try this:</strong> run 0.6, then 1.8, then 2.5, then 3.5, and watch the marker cross from blue to
                  violet to hatched to black.
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
                up. The ball stops where it is held up: the white dwarf's radius, or the neutron star's {NEUTRON_STAR_RADIUS_KM} km radius. The horizon
                radius is given by the formula from Experiment 1. The squeeze is only a way of showing the result: it does not
                model how long a real collapse takes.
              </p>
              <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: '0.2rem' }}>
                <strong>3. How the picture shows it.</strong> Read the picture one part at a time:
              </p>
              <ul style={{ margin: '0 0 0.4rem 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>How the ruler works.</strong> The marks are 0.1, 1, 10, 100, 1,000, 10,000 and 100,000 km, and each
                  one is ten times the one before. The distance on the screen from 1 to 10 km is the same as from 1,000 to
                  10,000 km, even though the first step covers 9 km and the second covers 9,000. That is how one ruler can show
                  a neutron star's radius of about 12 km and a white dwarf's radius of thousands of km at the same time.
                </li>
                <li>
                  <strong>The ring is the horizon radius.</strong> It is the size the core would have to be squeezed inside to
                  be a black hole. A heavier core has a bigger horizon, so the ring sits farther to the right for a heavier core.
                </li>
                <li>
                  <strong>The ball is the core's own radius.</strong> It starts at the far right, because the core starts large,
                  and moves left as the core is squeezed. It stops where something holds the core up, and that spot is the
                  core's size at the end.
                </li>
                <li>
                  <strong>The gap between the ball and the ring is the room left before a black hole.</strong> The number
                  under the ruler says how many times as wide as its horizon the core is. A ratio of 2.5, for example, means the
                  core is 2.5 times as wide as its horizon, so it would have to be squeezed to 2.5 times smaller to become a
                  black hole. For a white dwarf the ratio is in the hundreds or thousands: it is very far from a black hole.
                </li>
                <li>
                  <strong>The black area is inside the horizon.</strong> Any size to the left of the ring is smaller than the
                  horizon radius. A core squeezed into that area is a black hole.
                </li>
                <li>
                  <strong>If nothing holds the core up, the ball does not stop.</strong> It keeps moving left, past the ring and
                  into the black area.
                </li>
                <li>
                  <strong>Try this:</strong> run 1.4, then 1.8, and compare where the ball stops and how far it is from the
                  ring. Then run 3.5 and watch what changes.
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
                neutron star's {NEUTRON_STAR_RADIUS_KM} km, which is too small to show at this scale. The dashed white line is the limit, {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns.
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
                  <strong>What a point on the curve means.</strong> Pick a mass on the bottom axis and go straight up to the blue
                  curve. The height there, read on the side axis, is the radius of a white dwarf of that mass.
                </li>
                <li>
                  <strong>Follow the curve from left to right.</strong> It goes down, so each extra bit of mass makes a
                  smaller white dwarf, not a bigger one. In the model, a white dwarf of 0.6 Suns has a radius of{' '}
                  {formatKm(radiusLight)}, one of 1.0 Sun has {formatKm(radiusMiddle)}, and one of 1.4 Suns has{' '}
                  {formatKm(radiusHeavy)}.
                </li>
                <li>
                  <strong>The curve falls faster and faster near the end.</strong> It reaches zero at the dashed white line, at{' '}
                  {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns. A white dwarf cannot be heavier than that, so there is no blue curve
                  to the right of the line.
                </li>
                <li>
                  <strong>The dashed violet line is a neutron star.</strong> Its radius, {NEUTRON_STAR_RADIUS_KM} km, is less
                  than a thousandth of the height of this graph, so it sits on the bottom edge. It looks like zero, but it is
                  not: it is just tiny next to a white dwarf.
                </li>
                <li>
                  <strong>The white dot is your core.</strong> It shows your core's mass and radius on the curve. If your core is
                  heavier than {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, it is not a white dwarf, so there is no dot, and the picture
                  says so.
                </li>
                <li>
                  <strong>Try this:</strong> run 0.6, then 1.0, then 1.4, and watch the dot slide down the curve.
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

            {showResults && (() => {
              const four = (v: number) => v.toFixed(4)
              const verdict = (right: boolean, wrongText: string) => (right ? 'So your prediction was right.' : `So your prediction was off this time. ${wrongText}`)
              const heldUpText = (r: CoreResult) =>
                r.heldUpRadiusKm === null ? 'none: nothing known holds it' : `${formatKm(r.heldUpRadiusKm)}${r.outcome === 'uncertain' ? ' if it holds' : ''}`
              const ratioText = (r: CoreResult) => (r.radiusOverHorizon === null ? '—' : formatRatio(r.radiusOverHorizon))
              return (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color, #ccc)' }}>
                  {/* Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). */}
                  <h3 style={{ marginTop: 0 }}>Results</h3>
                  <p>
                    You squeezed a dead star's core of <strong>{formatNumber(result.coreMassSolarMasses)} Suns</strong>. For this run:
                  </p>
                  <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                      <tbody>
                        {[
                          ['What it is', OUTCOME_NAME[result.outcome]],
                          ['Its horizon radius', formatKm(result.horizonRadiusKm)],
                          ['The radius of what holds it up', heldUpText(result)],
                          ['That radius divided by the horizon radius', result.radiusOverHorizon === null ? 'it ends smaller than its horizon' : `${formatRatio(result.radiusOverHorizon)} times`],
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
                    <strong>Checking your first prediction:</strong> asked what happens to a white dwarf's size when you add mass,
                    you answered "{sizeChoices.find((c) => c.value === submittedSize)!.label}". In the model, a white dwarf of 0.6
                    Suns has a radius of {formatKm(radiusLight)}, one of 1.0 Sun has {formatKm(radiusMiddle)}, and one of 1.4 Suns
                    has {formatKm(radiusHeavy)}.{' '}
                    {verdict(
                      submittedSize === sizeModel,
                      submittedSize === 'bigger' ? 'A heavier white dwarf is smaller, not bigger.' : 'The size changes: a heavier white dwarf is smaller.',
                    )}
                  </p>
                  <p>
                    <strong>Checking your second prediction:</strong> asked at about what mass a dead star's core first becomes a
                    black hole, you answered "{thresholdChoices.find((c) => c.value === submittedThreshold)!.label}". In the model,
                    electrons hold a core up below {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, neutrons hold it up to about{' '}
                    {SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} Suns (the model calls what lies between about{' '}
                    {SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} and {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns not known), and above about{' '}
                    {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns nothing known holds it up. So a core first becomes a black hole at
                    about {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns, and perhaps a little sooner, since the stretch between about{' '}
                    {SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} and {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns is not known.{' '}
                    {verdict(
                      submittedThreshold === thresholdModel,
                      submittedThreshold === 'about-one'
                        ? `A core of about 1 Sun is a white dwarf: it takes about ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns before nothing known can hold the core up.`
                        : `A core does not need to be that heavy: above about ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns, nothing known holds it up.`,
                    )}
                  </p>
                  <p>
                    <strong>Checking your third prediction:</strong> asked whether a neutron star's largest mass is higher than,
                    the same as, or lower than a white dwarf's, you answered "{limitChoices.find((c) => c.value === submittedLimit)!.label}". In
                    the model, a white dwarf's largest mass is {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, and a neutron star's is at
                    least about {SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} Suns, and perhaps up to about{' '}
                    {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES}.{' '}
                    {verdict(
                      submittedLimit === limitModel,
                      `Neutrons can hold up a heavier core than electrons can: at least about ${SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} Suns, against ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES}.`,
                    )}
                  </p>

                  <p style={{ marginBottom: '0.25rem' }}>
                    <strong>The simple math: the horizon, and how close the core gets to it.</strong> The horizon radius is{' '}
                    {formatNumber(HORIZON_KM_PER_SOLAR_MASS)} km for every Sun of mass (Experiment 1). For your core:
                  </p>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
                    <li>
                      The horizon radius is {formatNumber(HORIZON_KM_PER_SOLAR_MASS)} km × {formatNumber(result.coreMassSolarMasses)} ={' '}
                      <strong>{formatKm(result.horizonRadiusKm)}</strong>.
                    </li>
                    {result.heldUpRadiusKm === null ? (
                      <li>
                        Nothing known holds a core this heavy up, so there is no radius to compare: it keeps shrinking until it
                        is smaller than its horizon, which makes it a black hole.
                      </li>
                    ) : (
                      <>
                        <li>
                          What holds it up has a radius of <strong>{formatKm(result.heldUpRadiusKm)}</strong>
                          {result.outcome === 'white-dwarf' ? ' (worked out below)' : result.outcome === 'neutron-star' ? " (a neutron star's round 12 km)" : ' (a neutron star\'s 12 km, if a neutron star holds it)'}.
                        </li>
                        <li>
                          How many times wider than its horizon the core is: {formatNumber(result.heldUpRadiusKm)} ÷{' '}
                          {formatNumber(result.horizonRadiusKm)} = <strong>{formatRatio(result.radiusOverHorizon as number)}</strong>.
                        </li>
                      </>
                    )}
                  </ol>

                  <p style={{ marginBottom: '0.25rem' }}>
                    <strong>The simple math: a white dwarf's radius.</strong> For a white dwarf of {formatNumber(workedMass)}{' '}
                    {workedMass === 1 ? 'Sun' : 'Suns'}
                    {result.outcome === 'white-dwarf' ? '' : ' (your core is not a white dwarf, so we use 1 Sun as an example)'}, the model's
                    formula is <strong>R = 0.0131 R☉ × M^(−1/3) × √(1 − (M ÷ 1.44)^(4/3))</strong>, where R☉ is the Sun's
                    radius, 695,700 km, and M is the mass in Suns. It is given, not derived. Worked out:
                  </p>
                  <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
                    <li>
                      0.0131 × 695,700 km = {Math.round(wdSteps.scaleKm).toLocaleString('en-US')} km.
                    </li>
                    <li>
                      M^(−1/3) = {formatNumber(workedMass)}^(−1/3) = {four(wdSteps.massFactor)}.
                    </li>
                    <li>
                      M ÷ 1.44 = {four(wdSteps.massOverLimit)}, and {four(wdSteps.massOverLimit)}^(4/3) = {four(wdSteps.limitTerm)}.
                    </li>
                    <li>
                      √(1 − {four(wdSteps.limitTerm)}) = {four(wdSteps.squeezeFactor)}. As M gets close to 1.44, this number gets
                      close to 0.
                    </li>
                    <li>
                      R = {Math.round(wdSteps.scaleKm).toLocaleString('en-US')} km × {four(wdSteps.massFactor)} ×{' '}
                      {four(wdSteps.squeezeFactor)} = <strong>{formatKm(wdSteps.radiusKm)}</strong>.
                    </li>
                  </ol>

                  <p>The preset masses compare like this:</p>
                  <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                    <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                      <thead>
                        <tr>
                          {['Core mass (Suns)', 'What it is', 'Horizon radius', 'Radius of what holds it up', 'That radius ÷ the horizon radius'].map((h) => (
                            <th key={h} style={{ textAlign: 'left', padding: '0.3rem 1rem 0.3rem 0' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {presetRows.map((row) => (
                          <tr key={row.coreMassSolarMasses} style={row.coreMassSolarMasses === result.coreMassSolarMasses ? { fontWeight: 'bold' } : undefined}>
                            <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{row.coreMassSolarMasses}</td>
                            <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{OUTCOME_NAME[row.outcome].replace(/^a /, '')}</td>
                            <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{formatKm(row.horizonRadiusKm)}</td>
                            <td style={{ padding: '0.3rem 1rem 0.3rem 0' }}>{heldUpText(row)}</td>
                            <td style={{ padding: '0.3rem 0' }}>{ratioText(row)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p>
                    <strong>A comparison from daily life.</strong> Think of people being squeezed into a lift. At first you can
                    keep adding people, and the crowd pushes back harder and harder against being squeezed. But a crowd can only
                    push back so hard, and past a certain number there is no way to fit more in. A dead core's push is a little
                    like this: the more mass is squeezed together, the harder the particles push back, but each kind of push (the
                    electrons', the neutrons') has a most it can give. This is only a comparison, and it does not explain why the
                    pushes give out where they do.
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
                      <strong>What this model can and cannot tell you.</strong> This is a thought experiment about the dead core
                      of a star, which has cooled, is not spinning and is at rest. It does not follow the star's life, the
                      explosion that can happen when a core collapses, or how long a real collapse takes: the squeeze you
                      watched is only a way of showing the result. It does not say which stars end up as which, and it stops at
                      the horizon, so nothing inside is modeled.
                    </p>
                    <p style={{ marginTop: 0, marginBottom: 0 }}>
                      The limits are standard results, given and not derived. The white dwarf's, {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns,
                      is well established. The neutron star's is not known exactly, which is why a stretch of masses is drawn as
                      not known. "Nothing known holds a heavier core up" is a statement about what is known: a form of matter
                      that could has been suggested, but none has been seen, and the experiment does not model one. The sizes
                      are round or fitted numbers, and real ones vary a little.
                    </p>
                  </div>
                </div>
              )
            })()}
          </>
        )}
      </div>

      {showResults && (
        <BlackHoleFormationTutor
          key={runCount}
          predictedSize={submittedSize}
          predictedThreshold={submittedThreshold}
          predictedLimit={submittedLimit}
          matches={{ size: submittedSize === sizeModel, threshold: submittedThreshold === thresholdModel, limit: submittedLimit === limitModel }}
          onExplained={() => onTutorComplete?.()}
        />
      )}
    </div>
  )
}
