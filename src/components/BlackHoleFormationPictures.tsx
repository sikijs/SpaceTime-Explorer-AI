import type { CSSProperties, ReactNode } from 'react'
import {
  CHANDRASEKHAR_LIMIT_SOLAR_MASSES,
  HORIZON_KM_PER_SOLAR_MASS,
  LIMIT_MARKERS,
  MAX_CORE_MASS,
  MIN_CORE_MASS,
  NEUTRON_STAR_RADIUS_KM,
  SIZE_MARKERS,
  SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
  SURE_NEUTRON_STAR_TOP_SOLAR_MASSES,
  THRESHOLD_GUESS_MASSES,
  isOffScale,
  whiteDwarfRadiusKm,
} from '../physics/blackHoleFormationExperiment'
import type { CoreOutcome, CoreResult, LimitAnswer, SizeAnswer, ThresholdAnswer } from '../physics/blackHoleFormationExperiment'
import { LIMIT_TEXT, SIZE_TEXT, THRESHOLD_TEXT } from './BlackHoleFormationChoices'

// Black Holes, Experiment 9 (audit update): the three pictures and their captions (docs/audit/black-holes-and-strong-gravity/09-draft-wording.md,
// sections 5 and 6, "all defaults" from the owner on 2026-11-18). Every number comes from the physics module and the drawings only display it
// (CLAUDE.md §9). White is used for nothing but the learner's guess marks: the chosen core and the graph dot are cyan, and the horizon and the
// black hole zone are rose. A guess mark is drawn only when a guess is passed in, and the page passes it once the run has finished.

export const WHITE_DWARF_COLOR = '#60a5fa'
export const NEUTRON_STAR_COLOR = '#a78bfa'
export const UNCERTAIN_COLOR = '#f59e0b'
export const BLACK_HOLE_COLOR = '#fb7185' // the black hole zone and the horizon (rose: white is for guesses only)
export const HORIZON_COLOR = '#fb7185'
export const NOW_COLOR = '#22d3ee' // the core you chose
const LABEL_COLOR = '#f1f5f9'

const OUTCOME_COLOR: Record<CoreOutcome, string> = {
  'white-dwarf': WHITE_DWARF_COLOR,
  'neutron-star': NEUTRON_STAR_COLOR,
  uncertain: UNCERTAIN_COLOR,
  'black-hole': BLACK_HOLE_COLOR,
}
export const OUTCOME_NAME: Record<CoreOutcome, string> = {
  'white-dwarf': 'a white dwarf',
  'neutron-star': 'a neutron star',
  uncertain: 'uncertain: a neutron star or a black hole',
  'black-hole': 'a black hole',
}

// The ladder (the first picture): the core mass on a logarithmic scale.
export const LADDER_WIDTH = 700
const LADDER_HEIGHT = 440
const LADDER_LEFT = 60
const LADDER_RIGHT = 640
const BAR_TOP = 170
const BAR_HEIGHT = 60

// The size ruler (the second picture): size in km on a logarithmic scale.
export const RULER_WIDTH = 700
const RULER_HEIGHT = 380
const RULER_LEFT = 60
const RULER_RIGHT = 640
const RULER_Y = 200
const RULER_MIN_KM = 0.1
const RULER_MAX_KM = 100_000
// Where the squeeze starts (an arbitrary large size, for the picture only).
const SQUEEZE_START_KM = 50_000

// The white dwarf's size graph (the third picture).
export const WD_WIDTH = 700
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
const list = { margin: '0.25rem 0 0.5rem', paddingLeft: '1.25rem' } as const
const SVG_STYLE: CSSProperties = {
  display: 'block',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
  marginTop: '1rem',
}

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
export function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A length in km, in plain words.
export const formatKm = (km: number) => `${formatNumber(km)} km`

// A ratio, to two decimals when small and two figures when large ("2.54", "5,100").
export const formatRatio = (ratio: number) => (ratio >= 100 ? Number(ratio.toPrecision(2)).toLocaleString('en-US') : ratio.toFixed(2))

// A position of the squeeze: the ball shrinks by the same factor in each equal slice of the playback, as on the logarithmic ruler. It ends at
// what holds it up, or, for a black hole, inside its own horizon.
function squeezeRadiusAt(result: CoreResult, progress: number): number {
  const end = result.heldUpRadiusKm ?? result.horizonRadiusKm * 0.3
  return SQUEEZE_START_KM * (end / SQUEEZE_START_KM) ** progress
}

// A white YOUR GUESS box joined by a line to its mark on the real picture. White always means the learner's guess.
function GuessBox({ x, y, width = 220, lines, target }: { x: number; y: number; width?: number; lines: string[]; target: { x: number; y: number } }) {
  const height = 14 * (lines.length + 1) + 12
  const startX = Math.min(Math.max(target.x, x + 10), x + width - 10)
  const from =
    target.y <= y
      ? { x: startX, y }
      : target.y >= y + height
        ? { x: startX, y: y + height }
        : target.x < x
          ? { x, y: y + height / 2 }
          : { x: x + width, y: y + height / 2 }
  return (
    <g>
      <line x1={from.x} y1={from.y} x2={target.x} y2={target.y} stroke="#ffffff" strokeWidth={2} />
      <rect x={x} y={y} width={width} height={height} rx={5} fill="#0b1020" stroke="#ffffff" strokeWidth={2.5} />
      <text x={x + 10} y={y + 18} fill="#ffffff" fontSize="11" fontWeight="bold">
        YOUR GUESS
      </text>
      {lines.map((line, i) => (
        <text key={line} x={x + 10} y={y + 32 + 14 * i} fill="#ffffff" fontSize="11">
          {line}
        </text>
      ))}
    </g>
  )
}

// A big white marker: a thick ring round a solid dot, so that it cannot be missed.
function WhiteMarker({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={12} fill="none" stroke="#ffffff" strokeWidth={3.5} />
      <circle cx={x} cy={y} r={5} fill="#ffffff" stroke="#0b1020" strokeWidth={1.5} />
    </g>
  )
}

// A thick white arrow from (x1, y1) to (x2, y2), with a head at the end.
function WhiteArrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = (dir: number) => `${x2 + 12 * Math.cos(angle + dir)},${y2 + 12 * Math.sin(angle + dir)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${head(Math.PI - 0.5)} ${head(Math.PI + 0.5)}`} fill="#ffffff" />
    </g>
  )
}

export interface LadderGuesses {
  threshold: ThresholdAnswer
  limit: LimitAnswer
}

// The first picture: what holds the core up, by mass. With guesses, it also draws the white marks for guesses 2 and 3.
export function Ladder({ result, guesses }: { result: CoreResult; guesses?: LadderGuesses | null }) {
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

  // The marks. Guess 2 is positional: a white line through the bar at its mass, or an arrow off the right end for a mass beyond the scale.
  const thresholdMass = guesses ? THRESHOLD_GUESS_MASSES[guesses.threshold] : null
  const offScale = thresholdMass !== null && isOffScale(thresholdMass)
  const thresholdX = thresholdMass === null ? 0 : offScale ? LADDER_RIGHT - 20 : xFor(thresholdMass)
  // Guess 3 is a marker only, drawn at the Chandrasekhar edge: an arrow to the right, a short bar, or an arrow to the left.
  const edgeX = xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES)
  const limitKind = guesses ? LIMIT_MARKERS[guesses.limit] : null
  const limitTarget = { x: limitKind === 'right' ? edgeX + 56 : limitKind === 'left' ? edgeX - 56 : edgeX, y: BAR_TOP + 10 }

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
      <text x={Math.min(Math.max(mx, 120), LADDER_RIGHT - 70)} y={BAR_TOP - 40} fill={NOW_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        your core: {formatNumber(result.coreMassSolarMasses)} Suns
      </text>
      <polygon points={`${mx - 8},${BAR_TOP - 28} ${mx + 8},${BAR_TOP - 28} ${mx},${BAR_TOP - 12}`} fill={NOW_COLOR} />

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
            <text x={(x0 + x1) / 2} y={BAR_TOP + 26} fill={LABEL_COLOR} fontSize="10.5" fontWeight="bold" textAnchor="middle">
              {line1}
            </text>
            <text x={(x0 + x1) / 2} y={BAR_TOP + 40} fill={LABEL_COLOR} fontSize="10" textAnchor="middle">
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
          <line x1={xFor(e.mass)} y1={BAR_TOP} x2={xFor(e.mass)} y2={BAR_TOP + BAR_HEIGHT + 30} stroke="#cbd5e1" strokeOpacity={0.55} strokeDasharray="2 3" />
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

      {/* The learner's guesses: white marks and boxes, only once the run has finished */}
      {guesses && thresholdMass !== null && limitKind && (
        <>
          {/* Guess 2: a white line through the bar at the mass it names (an arrow off the right end for a mass beyond the scale) */}
          {offScale ? (
            <WhiteArrow x1={LADDER_RIGHT - 60} y1={BAR_TOP - 14} x2={LADDER_RIGHT + 44} y2={BAR_TOP - 14} />
          ) : (
            <>
              <line x1={thresholdX} y1={BAR_TOP - 14} x2={thresholdX} y2={BAR_TOP + BAR_HEIGHT + 8} stroke="#ffffff" strokeWidth={4} />
              <WhiteMarker x={thresholdX} y={BAR_TOP - 14} />
            </>
          )}
          {/* Guess 3: a marker only, at the Chandrasekhar edge */}
          {limitKind === 'bar' ? (
            <line x1={edgeX} y1={BAR_TOP - 4} x2={edgeX} y2={BAR_TOP + 26} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
          ) : (
            <WhiteArrow x1={edgeX} y1={BAR_TOP + 10} x2={limitTarget.x} y2={BAR_TOP + 10} />
          )}
          <GuessBox x={LADDER_RIGHT - 250} y={50} width={250} lines={['guess 2, the mass where a core', 'first becomes a black hole:', THRESHOLD_TEXT[guesses.threshold]]} target={offScale ? { x: LADDER_RIGHT - 20, y: BAR_TOP - 24 } : { x: thresholdX, y: BAR_TOP - 26 }} />
          <GuessBox x={LADDER_LEFT - 20} y={50} width={250} lines={['guess 3, a neutron star’s largest mass:', LIMIT_TEXT[guesses.limit]]} target={{ x: limitTarget.x, y: BAR_TOP + 4 }} />
        </>
      )}
    </svg>
  )
}

// The second picture: the held-up core and its horizon, on one logarithmic ruler of sizes.
export function SizeRuler({ result, progress }: { result: CoreResult; progress: number }) {
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
  const ballName = result.outcome === 'white-dwarf' ? 'white dwarf' : result.outcome === 'black-hole' ? 'the core' : 'neutron star'

  return (
    <svg viewBox={`0 0 ${RULER_WIDTH} ${RULER_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, maxWidth: `${RULER_WIDTH}px` }}>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        How wide is the core, compared with its own horizon?
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        A ruler of sizes (radius, in km). Each step to the right is ten times bigger. The core shrinks from the right.
      </text>

      {/* The region inside the horizon */}
      <rect x={RULER_LEFT} y={RULER_Y - 46} width={Math.max(0, ringX - RULER_LEFT)} height={92} fill="#000000" stroke={HORIZON_COLOR} strokeOpacity={0.6} strokeDasharray="3 3" />
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

// The third picture: a white dwarf's radius against its mass. With a guess, it also draws the white mark for guess 1.
export function WhiteDwarfGraph({ result, guess }: { result: CoreResult; guess?: SizeAnswer | null }) {
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

  // Guess 1: a marker only, beside the middle of the curve. The arrow's slope shows which kind of answer it is, not a size.
  const kind = guess ? SIZE_MARKERS[guess] : null
  const cx = xFor(0.9)
  const cy = yFor(whiteDwarfRadiusKm(0.9)) - 42
  const arrow = kind === 'up' ? { x1: cx - 32, y1: cy + 16, x2: cx + 32, y2: cy - 16 } : kind === 'down' ? { x1: cx - 32, y1: cy - 16, x2: cx + 32, y2: cy + 16 } : { x1: cx - 34, y1: cy, x2: cx + 34, y2: cy }

  return (
    <svg viewBox={`0 0 ${WD_WIDTH} ${WD_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, maxWidth: `${WD_WIDTH}px` }}>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        A white dwarf's size against its mass
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
      <line x1={xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES)} y1={WD_TOP} x2={xFor(CHANDRASEKHAR_LIMIT_SOLAR_MASSES)} y2={WD_BOTTOM} stroke="#cbd5e1" strokeOpacity={0.6} strokeDasharray="4 4" />
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
          <circle cx={xFor(result.coreMassSolarMasses)} cy={yFor(result.heldUpRadiusKm)} r={6} fill={NOW_COLOR} stroke={WHITE_DWARF_COLOR} strokeWidth={2.5} />
          <text x={xFor(result.coreMassSolarMasses) + 10} y={yFor(result.heldUpRadiusKm) - 10} fill={NOW_COLOR} fontSize="10.5" fontWeight="bold">
            your core: {formatKm(result.heldUpRadiusKm)}
          </text>
        </>
      )}

      {/* The learner's guess: a white marker and its box, only once the run has finished */}
      {guess && kind && (
        <>
          {kind === 'flat' ? (
            <line x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" />
          ) : (
            <WhiteArrow x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} />
          )}
          <GuessBox x={WD_RIGHT + 14} y={WD_TOP + 60} width={176} lines={['guess 1, adding mass:', SIZE_TEXT[guess]]} target={{ x: arrow.x2, y: arrow.y2 }} />
        </>
      )}

      <text x={96} y={WD_HEIGHT - 42} fill="#cbd5e1" fontSize="11">
        {isWhiteDwarf
          ? `Your core (${formatNumber(result.coreMassSolarMasses)} Suns) is a white dwarf: the cyan dot is where it sits on the curve.`
          : `Your core (${formatNumber(result.coreMassSolarMasses)} Suns) is above the limit, so it is not a white dwarf: it has no dot on the curve.`}
      </text>
      <text x={96} y={WD_HEIGHT - 20} fill="#94a3b8" fontSize="10">
        The curve is a formula fitted to a numerical calculation, and the real size of a white dwarf varies a little.
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------------------------------------------
// The captions. Each names what is drawn and what it means; the mechanism and the verdicts are left to the tutor (CLAUDE.md §12, §13).
// Every "what to look for" item has three parts: Look at, What it means, Why it matters.
// ---------------------------------------------------------------------------------------------------------------------------------
function LookFor({ look, means, matters }: { look: ReactNode; means: ReactNode; matters: ReactNode }) {
  return (
    <li style={{ marginBottom: '0.3rem' }}>
      <strong>Look at</strong> {look} <strong>What it means:</strong> {means} <strong>Why it matters:</strong> {matters}
    </li>
  )
}

export function LadderCaption({ result, number, complete, withGuesses }: { result: CoreResult; number: number; complete: boolean; withGuesses?: boolean }) {
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${LADDER_WIDTH}px` }}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read Picture {number}: the ladder.</strong> A dead star’s core has used up its fuel, so nothing is left to push outward against its own gravity, except a push that comes from squeezing particles together. The bar is a scale of the core’s mass, in Suns, divided into zones by what can hold the core up. A{' '}
        <em>white dwarf</em> is a dead star held up by electrons, and is roughly the size of the Earth. A <em>neutron star</em> is held up by neutrons, and is only about {NEUTRON_STAR_RADIUS_KM} km in radius (about {2 * NEUTRON_STAR_RADIUS_KM} km across). The cyan marker shows the mass you chose.
      </p>
      <ul style={list}>
        <li>
          <strong>The bar is a ruler for the core’s mass.</strong> The smallest mass is on the left ({MIN_CORE_MASS} Suns) and the largest is on the right ({MAX_CORE_MASS} Suns), and the numbers under the bar are the marks. The marks are not evenly spaced, because each step to the right is a bigger jump in mass. That way the bar has room for small cores and for big ones.
        </li>
        <li>
          <strong>The color under the marker tells you what holds that core up.</strong> Blue means the push of electrons holds it: a white dwarf. Violet means the push of neutrons holds it: a neutron star. The hatched zone means that nobody knows for sure. The dark zone with a rose edge means that no known push holds it, so it becomes a black hole. The key under the bar says the same in words.
        </li>
        <li>
          <strong>The dashed lines are the edges between the zones.</strong> Each edge is the heaviest core that one kind of push can hold up. The first, at {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, is called the <em>Chandrasekhar limit</em>, after the physicist who worked it out in the 1930s, and it is well established. The limits are standard results, given here and not derived.
        </li>
        <li>
          <strong>The hatched zone is “not known” on purpose.</strong> The largest mass a neutron star can have is not known exactly, because the matter inside a neutron star is not fully understood. The picture shows this as unknown instead of pretending to know.
        </li>
        {withGuesses && complete && (
          <li>
            <strong>The white YOUR GUESS boxes</strong> are your guesses 2 and 3, each joined by a line to a white mark. Guess 2 is a number of Suns, so its mark is a white line through the bar at that mass; if you chose 30 Suns, it is an arrow off the right end of the bar, because 30 is beyond the scale. Guess 3 has no number of its own, so its mark is only a marker at the {CHANDRASEKHAR_LIMIT_SOLAR_MASSES}-Suns edge: an arrow to the right (higher), a short bar on the edge (the same) or an arrow to the left (lower).
          </li>
        )}
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>What appears when.</strong> The ladder is drawn as soon as you press Run, with the cyan marker at your core’s mass. {withGuesses ? 'When the run has finished, your white guesses appear.' : ''}
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong> A core of {formatNumber(result.coreMassSolarMasses)} Suns is {OUTCOME_NAME[result.outcome]}. Its horizon radius is {formatNumber(HORIZON_KM_PER_SOLAR_MASS)} km × {formatNumber(result.coreMassSolarMasses)} = {formatKm(result.horizonRadiusKm)}.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        <LookFor
          look="where the colors change along the bar."
          means={`they change at ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES}, about ${SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} and about ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns.`}
          matters="each color is what can hold the core up, so each edge is the most a core can weigh and still be held up."
        />
        <LookFor
          look="the hatched zone."
          means={`between about ${SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} and about ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns it is not known whether a core is a neutron star or a black hole.`}
          matters="the page marks where nobody is sure, as well as where they are."
        />
        <LookFor
          look="the cyan marker."
          means={`a core of ${formatNumber(result.coreMassSolarMasses)} Suns is in the ${result.outcome === 'white-dwarf' ? 'white dwarf' : result.outcome === 'neutron-star' ? 'neutron star' : result.outcome === 'uncertain' ? 'not known' : 'black hole'} zone.`}
          matters="it is the picture’s answer, for your core, to what can hold it up."
        />
      </ul>
      <p style={{ margin: 0 }}>
        <strong>A limit.</strong> This is a thought experiment about a dead core that has cooled, is not spinning and is at rest. How a star gets to the end of its life is not shown, and the round numbers are not exact.
      </p>
    </div>
  )
}

export function RulerCaption({ result, number }: { result: CoreResult; number: number }) {
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${RULER_WIDTH}px` }}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read Picture {number}: the size ruler.</strong> A ruler of sizes, from 0.1 km to 100,000 km. Each step to the right is ten times bigger, so one ruler can show a core the size of a planet and one the size of a city. The rose ring is the core’s <em>horizon radius</em>: the size it would have to be squeezed inside to be a black hole (you met it in Black Holes 1). The colored ball is the core, shrinking from the right. The black area to the left of the ring is smaller than the horizon radius.
      </p>
      <ul style={list}>
        <li>
          <strong>How the ruler works.</strong> The marks are 0.1, 1, 10, 100, 1,000, 10,000 and 100,000 km, and each one is ten times the one before. The distance on the screen from 1 to 10 km is the same as from 1,000 to 10,000 km, even though the first step covers 9 km and the second covers 9,000. That is how one ruler can show a neutron star’s radius of about 12 km and a white dwarf’s radius of thousands of km at the same time.
        </li>
        <li>
          <strong>The ring is the horizon radius.</strong> A heavier core has a bigger horizon, so the ring sits farther to the right for a heavier core. Here is what the horizon is, and whose it is.
          <ul style={list}>
            <li>
              <strong>What a horizon is.</strong> Think of the horizon at sea: it is the line past which you cannot see. The horizon of a black hole is a boundary of the same kind, but much stronger. Inside it, gravity is so strong that nothing can get out, not even light. Something can cross it going in, but nothing can come back out. So we can never see what is inside. It is a boundary in space around a mass, not a solid wall or surface that you could stand on.
            </li>
            <li>
              <strong>Whose horizon it is.</strong> It is the horizon of the black hole that this core’s mass would make if all of it were squeezed inside. It belongs to the mass, not to any star. The ring shows where that horizon is, or would be. While the core is bigger than the ring, the core is not a black hole, and the ring is only where the boundary would be if the core were squeezed that small. Only when the core goes inside the ring is it a black hole.
            </li>
            <li>
              <strong>The horizon radius.</strong> This is the distance from the center of the core to the horizon. It depends only on the mass: {formatNumber(HORIZON_KM_PER_SOLAR_MASS)} km for each Sun of mass (from Black Holes 1). For a core of 2 Suns, for example, it is {formatNumber(HORIZON_KM_PER_SOLAR_MASS)} × 2 = {formatKm(HORIZON_KM_PER_SOLAR_MASS * 2)}.
            </li>
          </ul>
        </li>
        <li>
          <strong>The ball is the core.</strong> Its place on the ruler is the core’s own radius, the distance from the center of the core to its surface. The ball is a marker for that size: the core itself is not drawn to scale. A ball farther to the right is a bigger core, and a ball farther to the left is a smaller one.
          <ul style={list}>
            <li>
              <strong>Where it starts and how it moves.</strong> The ball starts at the far right, at 50,000 km, because the core begins large. When you press Run, gravity squeezes the core and the ball moves to the left as the core gets smaller. The ball stops where something holds the core up. Each step to the left on this ruler is a ten times smaller size, so a ball that moves from 50,000 km to 5,000 km has made a smaller trip on the screen than one that moves from 50,000 km to 5 km.
            </li>
            <li>
              <strong>The color of the ball.</strong> It tells you what holds the core up, using the same colors as the ladder. <em>Blue</em>: electrons hold it, so it is a white dwarf. <em>Violet</em>: neutrons hold it, so it is a neutron star. <em>Amber</em>: it is not known what holds it. <em>Black with a rose edge</em>: nothing known holds it, so the ball does not stop and goes past the ring.
            </li>
            <li>
              <strong>The ring and the ball together.</strong> If the ball stops to the right of the ring, the core is bigger than its horizon radius, so it is not a black hole. If the ball goes to the left of the ring, into the black area, the core is smaller than its horizon radius, and it is a black hole.
            </li>
          </ul>
        </li>
        <li>
          <strong>The number under the ruler</strong> says how many times as wide as its horizon the core is. A ratio of 2.5, for example, means the core is 2.5 times as wide as its horizon.
        </li>
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>What appears when.</strong> The ring is there from the start. During the 10-second run the ball shrinks from the right, by the same factor in each equal slice of the time, which is how a logarithmic ruler is read. The squeeze is only a way of showing the result: it is not how long a real collapse takes.
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong>{' '}
        {result.radiusOverHorizon === null
          ? `For ${formatNumber(result.coreMassSolarMasses)} Suns the ring is at ${formatKm(result.horizonRadiusKm)}. The ball shrinks from 50,000 km, passes the ring and goes into the black area: nothing known stops it.`
          : `For ${formatNumber(result.coreMassSolarMasses)} Suns the ring is at ${formatKm(result.horizonRadiusKm)} and the ball stops at ${formatKm(result.heldUpRadiusKm as number)}, which is ${formatNumber(result.heldUpRadiusKm as number)} ÷ ${formatNumber(result.horizonRadiusKm)} = ${formatRatio(result.radiusOverHorizon)} times its horizon radius.`}
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        <LookFor
          look="the ball against the ring when the run ends."
          means={result.radiusOverHorizon === null ? 'the ball is inside the ring: it is smaller than its own horizon.' : `the ball is ${formatRatio(result.radiusOverHorizon)} times as wide as the ring.`}
          matters="the gap between the ball and the ring is the room left before the core would be a black hole."
        />
        <LookFor
          look="the ring’s place on the ruler."
          means={`it is at ${formatKm(result.horizonRadiusKm)} for ${formatNumber(result.coreMassSolarMasses)} Suns.`}
          matters="the horizon radius depends only on the mass, so it is the same however the core is held up."
        />
      </ul>
      <p style={{ margin: 0 }}>
        <strong>A limit.</strong> The sizes are typical values, and real ones vary a little. The squeeze starts from an arbitrary large size, only for the picture.
      </p>
    </div>
  )
}

export function GraphCaption({ result, number, complete, withGuesses }: { result: CoreResult; number: number; complete: boolean; withGuesses?: boolean }) {
  const light = whiteDwarfRadiusKm(0.6)
  const middle = whiteDwarfRadiusKm(1)
  const heavy = whiteDwarfRadiusKm(1.4)
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${WD_WIDTH}px` }}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read Picture {number}: a white dwarf’s size against its mass.</strong> Across the bottom is the core’s mass, in Suns. Up the side is the radius of a white dwarf of that mass, in km. The blue curve is the white dwarf’s radius. The dashed violet line is the neutron star’s {NEUTRON_STAR_RADIUS_KM} km, which is too small to show at this scale. The dashed grey line is the limit, {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns.
      </p>
      <ul style={list}>
        <li>
          <strong>What a point on the curve means.</strong> Pick a mass on the bottom axis and go straight up to the blue curve. The height there, read on the side axis, is the radius of a white dwarf of that mass.
        </li>
        <li>
          <strong>The curve ends at the dashed grey line.</strong> A white dwarf cannot be heavier than that, so there is no blue curve to the right of the line.
        </li>
        <li>
          <strong>The dashed violet line is a neutron star.</strong> Its radius, {NEUTRON_STAR_RADIUS_KM} km, is less than a thousandth of the height of this graph, so it sits on the bottom edge. It looks like zero, but it is not: it is just tiny next to a white dwarf.
        </li>
        <li>
          <strong>The cyan dot is your core.</strong> It shows your core’s mass and radius on the curve. If your core is heavier than {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, it is not a white dwarf, so there is no dot, and the picture says so.
        </li>
        {withGuesses && complete && (
          <li>
            <strong>The white YOUR GUESS box</strong> is your guess 1, joined by a line to a short white arrow beside the curve: sloping up (bigger), flat (the same size) or sloping down (smaller). The arrow is only a marker: its slope shows which kind of answer you gave, not a size you chose.
          </li>
        )}
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>What appears when.</strong> The curve is drawn as soon as you press Run. {withGuesses ? 'When the run has finished, your white guess appears.' : ''}
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong> At 0.6 Suns the curve is at {formatKm(light)}, at 1.0 Sun at {formatKm(middle)} and at 1.4 Suns at {formatKm(heavy)}.
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        <LookFor
          look="the height of the curve at 0.6, at 1.0 and at 1.4 Suns."
          means={`it is ${formatKm(light)}, ${formatKm(middle)} and ${formatKm(heavy)}.`}
          matters="it shows how a white dwarf’s size depends on its mass."
        />
        <LookFor
          look="where the curve ends."
          means={`it reaches zero at the dashed grey line, ${CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns.`}
          matters="it is the most a core can weigh and still be held up by electrons."
        />
        <LookFor
          look="the cyan dot."
          means={result.outcome === 'white-dwarf' ? `your core of ${formatNumber(result.coreMassSolarMasses)} Suns is a white dwarf of ${formatKm(result.heldUpRadiusKm as number)}.` : `your core of ${formatNumber(result.coreMassSolarMasses)} Suns is above the limit, so it has no dot.`}
          matters="it shows whether electrons can hold your core up at all."
        />
      </ul>
      <p style={{ margin: 0 }}>
        <strong>A limit.</strong> This shows white dwarfs only. It does not show what holds a heavier core up, and the page’s check-up in Part 3 compares the curve with one real white dwarf.
      </p>
    </div>
  )
}
