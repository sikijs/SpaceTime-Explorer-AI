import {
  CMB_REDSHIFT,
  GALAXY_A_REDSHIFT,
  MAX_REDSHIFT,
  MIN_REDSHIFT,
  captionNumbers,
  galaxyA,
  leftGuessMark,
  runObservableUniverseExperiment,
  sourceB,
  todayGuessMarker,
  zoomAxisFor,
  zoomPanel,
} from '../physics/observableUniverseExperiment'
import type { LeftGuess, TodayGuess } from '../physics/observableUniverseExperiment'
import { TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 8, audited to the newer rules (docs/audit/cosmology/08-draft-wording.md, approved by the owner on 2026-11-15).
// Three pictures, each with its own caption: Picture 1 (the three distances for Galaxy A and Source B, with a zoomed panel), Picture 2 (the
// graph for every source) and Picture 3 (Part 2: the three distances for the learner's own source). Every number (a distance, the place of a
// guess mark) comes from the physics module; this file only draws and words it (CLAUDE.md §9). White is only ever the learner's guess
// (§14). The guess marks are drawn only once the run has finished (§12).

export const GUESS_COLOR = '#ffffff'
export const TRAVEL_COLOR = '#38bdf8' // blue: how far the light travelled
export const TODAY_COLOR = '#fbbf24' // gold: how far away the source is today
export const LEFT_COLOR = '#4ade80' // green: how far away it was when the light left
export const YOUR_SOURCE_COLOR = YOURS_COLOR // pink: the learner's own source (Part 2)
const SOURCE_DOT = '#fde68a'

export const TODAY_GUESS_TEXT: Record<TodayGuess, string> = {
  less: 'less than 10 billion light-years',
  about: 'about 10 billion light-years',
  more: 'more than 10 billion light-years',
}
export const LEFT_GUESS_TEXT: Record<LeftGuess, string> = {
  thirteen: 'about 13 billion light-years',
  few: 'a few billion light-years',
  closer: 'far closer than that, under 100 million light-years',
}
const TODAY_BOX_TEXT: Record<TodayGuess, string> = { less: 'less than 10 billion ly', about: 'about 10 billion ly', more: 'more than 10 billion ly' }
const LEFT_BOX_TEXT: Record<LeftGuess, string> = { thirteen: 'about 13 billion ly', few: 'a few billion ly', closer: 'under 100 million ly' }

// Distances in light-years, written in billions, or in millions where that reads more clearly.
export function distanceLabel(lightYears: number): string {
  if (lightYears >= 1e9) return `${(lightYears / 1e9).toFixed(2)} billion light-years`
  return `${Math.round(lightYears / 1e6)} million light-years`
}
const billions = (lightYears: number, digits = 2) => (lightYears / 1e9).toFixed(digits)
export function redshiftLabel(redshift: number): string {
  return redshift >= 10 ? redshift.toFixed(1) : redshift.toFixed(2)
}

const halo = { stroke: '#0b1020', strokeWidth: 3, paintOrder: 'stroke' } as const

function GuessBox({ x, y, width, line }: { x: number; y: number; width: number; line: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={32} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2.5} />
      <text x={x + width / 2} y={y + 14} fill={GUESS_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + width / 2} y={y + 27} fill={GUESS_COLOR} fontSize="9.5" textAnchor="middle">
        {line}
      </text>
    </g>
  )
}

// A thick white arrow along a horizontal line, pointing left or right, with a head.
function WhiteArrow({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  const dir = x2 >= x1 ? 1 : -1
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={GUESS_COLOR} strokeWidth={3.5} />
      <polygon points={`${x2 + dir * 8},${y} ${x2},${y - 6} ${x2},${y + 6}`} fill={GUESS_COLOR} />
    </g>
  )
}

// ---- Picture 1: the three distances for Galaxy A and Source B on one true axis, and the zoomed panel ----
const W = 560
const EARTH_X = 60
const AXIS_RIGHT = 535
const AXIS_MAX_BILLION_LY = 50
const PX_PER_LIGHT_YEAR = (AXIS_RIGHT - EARTH_X) / (AXIS_MAX_BILLION_LY * 1e9)
const BAR_H = 14
const MIN_BAR_PX = 3
const BOX_X = 415
const BOX_W = 135
const AXIS_ROWS = [0, 10, 20, 30, 40, 50]

const xOf = (lightYears: number) => EARTH_X + lightYears * PX_PER_LIGHT_YEAR
const barW = (lightYears: number) => (lightYears <= 0 ? 0 : Math.max(lightYears * PX_PER_LIGHT_YEAR, MIN_BAR_PX))

// Row positions (top of each bar). Group A, then group B, then the main axis, then the zoomed panel.
const A_ROWS = { travel: 96, today: 152, left: 208 }
const B_ROWS = { travel: 276, today: 332, left: 388 }
const AXIS_Y = 440
const ZOOM_TOP = 490
const ZOOM_BOX_Y = 520
const ZOOM_BRACKET_Y = 574
const ZOOM_BAR_Y = 602
const ZOOM_AXIS_Y = 632
const PICTURE1_HEIGHT = 684

export interface DistancePictureProps {
  // 0 to 1: how far the run has gone (the blue bars grow, the gold bars and dots move out)
  progress: number
  // true once the run has ended: the white marks are drawn then and not before
  finished: boolean
  guesses: { today: TodayGuess; left: LeftGuess } | null
}

function SourceGroup({ title, redshift, rows, progress }: { title: string; redshift: number; rows: { travel: number; today: number; left: number }; progress: number }) {
  const r = runObservableUniverseExperiment(redshift)
  const travelled = r.lightTravelYears * progress
  const sourceNow = r.distanceWhenLightLeftLightYears + (r.distanceTodayLightYears - r.distanceWhenLightLeftLightYears) * progress
  return (
    <g>
      <text x={EARTH_X} y={rows.travel - 26} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
        {title}
      </text>
      <text x={EARTH_X + 6} y={rows.travel - 6} fill={TRAVEL_COLOR} fontSize="11" fontWeight="600" {...halo}>
        How far the light travelled: {distanceLabel(r.lightTravelYears)}
      </text>
      <rect x={EARTH_X} y={rows.travel} width={barW(travelled)} height={BAR_H} fill={TRAVEL_COLOR} opacity={0.85} />
      <text x={EARTH_X + 6} y={rows.today - 6} fill={TODAY_COLOR} fontSize="11" fontWeight="600" {...halo}>
        How far away the source is today: {distanceLabel(r.distanceTodayLightYears)}
      </text>
      <rect x={EARTH_X} y={rows.today} width={barW(sourceNow)} height={BAR_H} fill={TODAY_COLOR} opacity={0.85} />
      <circle cx={xOf(sourceNow)} cy={rows.today + BAR_H / 2} r={7} fill={SOURCE_DOT} stroke="#0b1020" strokeWidth={2} />
      <text x={xOf(sourceNow) + 12} y={rows.today + BAR_H / 2 + 4} fill={SOURCE_DOT} fontSize="10" fontWeight="600" {...halo}>
        The source
      </text>
      <text x={EARTH_X + 6} y={rows.left - 6} fill={LEFT_COLOR} fontSize="11" fontWeight="600" {...halo}>
        How far away it was when the light left: {distanceLabel(r.distanceWhenLightLeftLightYears)}
      </text>
      <rect x={EARTH_X} y={rows.left} width={barW(r.distanceWhenLightLeftLightYears)} height={BAR_H} fill={LEFT_COLOR} opacity={0.9} />
    </g>
  )
}

export function DistancePicture({ progress, finished, guesses }: DistancePictureProps) {
  const zoom = zoomPanel()
  const zoomX = (lightYears: number) => EARTH_X + (lightYears / zoom.axisMaxLightYears) * (AXIS_RIGHT - EARTH_X)
  const todayMark = finished && guesses ? todayGuessMarker(guesses.today) : null
  const leftMark = finished && guesses ? leftGuessMark(guesses.left) : null
  const todayY = A_ROWS.today + BAR_H + 10 // the mark's line ends here and a thin line joins it to the box
  const leftY = B_ROWS.left + BAR_H + 10
  const sourceBLeft = sourceB().distanceWhenLightLeftLightYears
  return (
    <svg width={W} height={PICTURE1_HEIGHT} viewBox={`0 0 ${W} ${PICTURE1_HEIGHT}`} style={svgStyle} role="img" aria-label="The three distances for Galaxy A and for Source B, with a zoomed panel for Source B's distance when the light left">
      <text x={W / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Three distances for each source (drawn to a true scale)
      </text>

      {/* Earth, and the line every distance is measured from */}
      <circle cx={EARTH_X} cy={44} r={8} fill={TRAVEL_COLOR} />
      <text x={EARTH_X + 14} y={48} fill={TEXT_COLOR} fontSize="11" fontWeight="600">
        Earth
      </text>
      <line x1={EARTH_X} y1={54} x2={EARTH_X} y2={AXIS_Y} stroke="#64748b" strokeDasharray="3 4" />

      <SourceGroup title="Galaxy A (redshift 2)" redshift={GALAXY_A_REDSHIFT} rows={A_ROWS} progress={progress} />
      <SourceGroup title="Source B: the oldest light we can see (redshift 1089.8)" redshift={CMB_REDSHIFT} rows={B_ROWS} progress={progress} />

      {/* The shared main axis */}
      <line x1={EARTH_X} y1={AXIS_Y} x2={AXIS_RIGHT} y2={AXIS_Y} stroke="#64748b" />
      {AXIS_ROWS.map((t) => (
        <g key={t}>
          <line x1={xOf(t * 1e9)} y1={AXIS_Y} x2={xOf(t * 1e9)} y2={AXIS_Y + 4} stroke="#64748b" />
          <text x={xOf(t * 1e9)} y={AXIS_Y + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={(EARTH_X + AXIS_RIGHT) / 2} y={AXIS_Y + 36} fill="#cbd5e1" fontSize="11" textAnchor="middle">
        Distance from Earth (billions of light-years)
      </text>

      {/* The zoomed panel: its own title, its own axis, a different scale */}
      <line x1={10} y1={ZOOM_TOP - 12} x2={W - 10} y2={ZOOM_TOP - 12} stroke="#334155" />
      <text x={W / 2} y={ZOOM_TOP + 6} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Zoomed in: Source B when the light left (a different scale)
      </text>
      <text x={EARTH_X + 6} y={ZOOM_BAR_Y - 6} fill={LEFT_COLOR} fontSize="11" fontWeight="600" {...halo}>
        Source B when the light left: {distanceLabel(sourceBLeft)}
      </text>
      <rect x={EARTH_X} y={ZOOM_BAR_Y} width={progress > 0 ? zoomX(zoom.greenBarLightYears) - EARTH_X : 0} height={BAR_H} fill={LEFT_COLOR} opacity={0.9} />
      <line x1={EARTH_X} y1={ZOOM_BAR_Y - 20} x2={EARTH_X} y2={ZOOM_AXIS_Y} stroke="#64748b" strokeDasharray="3 4" />
      <line x1={EARTH_X} y1={ZOOM_AXIS_Y} x2={AXIS_RIGHT} y2={ZOOM_AXIS_Y} stroke="#64748b" />
      {zoom.ticksLightYears.map((t) => (
        <g key={t}>
          <line x1={zoomX(t)} y1={ZOOM_AXIS_Y} x2={zoomX(t)} y2={ZOOM_AXIS_Y + 4} stroke="#64748b" />
          <text x={zoomX(t)} y={ZOOM_AXIS_Y + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
            {t / 1e6}
          </text>
        </g>
      ))}
      <text x={(EARTH_X + AXIS_RIGHT) / 2} y={ZOOM_AXIS_Y + 36} fill="#cbd5e1" fontSize="11" textAnchor="middle">
        Distance from Earth (millions of light-years)
      </text>

      {/* Guess 1: a white line at 10 billion on Galaxy A's gold row, with an arrow or a ring (marker only) */}
      {todayMark && guesses && (
        <g>
          <line x1={xOf(todayMark.lineAtLightYears)} y1={A_ROWS.today - 4} x2={xOf(todayMark.lineAtLightYears)} y2={todayY} stroke={GUESS_COLOR} strokeWidth={3} />
          <line x1={xOf(todayMark.lineAtLightYears)} y1={todayY} x2={BOX_X} y2={todayY} stroke={GUESS_COLOR} strokeWidth={1.5} />
          {todayMark.kind === 'ring' ? (
            <circle cx={xOf(todayMark.lineAtLightYears)} cy={todayY} r={7} fill="none" stroke={GUESS_COLOR} strokeWidth={3.5} />
          ) : (
            <WhiteArrow x1={xOf(todayMark.arrowFromLightYears)} x2={xOf(todayMark.arrowToLightYears)} y={todayY} />
          )}
          <GuessBox x={BOX_X} y={todayY - 20} width={BOX_W} line={TODAY_BOX_TEXT[guesses.today]} />
        </g>
      )}

      {/* Guess 2, "about 13 billion": a white line at 13 billion on Source B's green row */}
      {leftMark && leftMark.panel === 'main' && guesses && (
        <g>
          <line x1={xOf(leftMark.atLightYears)} y1={B_ROWS.left - 4} x2={xOf(leftMark.atLightYears)} y2={leftY} stroke={GUESS_COLOR} strokeWidth={3} />
          <line x1={xOf(leftMark.atLightYears)} y1={leftY} x2={BOX_X} y2={leftY} stroke={GUESS_COLOR} strokeWidth={1.5} />
          <GuessBox x={BOX_X} y={leftY - 20} width={BOX_W} line={LEFT_BOX_TEXT[guesses.left]} />
        </g>
      )}

      {/* Guess 2, "under 100 million": a white bracket from 0 to 100 million on the zoomed panel */}
      {leftMark && leftMark.panel === 'zoom' && leftMark.kind === 'bracket' && guesses && (
        <g>
          <line x1={zoomX(leftMark.fromLightYears)} y1={ZOOM_BRACKET_Y} x2={zoomX(leftMark.toLightYears)} y2={ZOOM_BRACKET_Y} stroke={GUESS_COLOR} strokeWidth={3} />
          <line x1={zoomX(leftMark.fromLightYears)} y1={ZOOM_BRACKET_Y - 7} x2={zoomX(leftMark.fromLightYears)} y2={ZOOM_BRACKET_Y + 7} stroke={GUESS_COLOR} strokeWidth={3} />
          <line x1={zoomX(leftMark.toLightYears)} y1={ZOOM_BRACKET_Y - 7} x2={zoomX(leftMark.toLightYears)} y2={ZOOM_BRACKET_Y + 7} stroke={GUESS_COLOR} strokeWidth={3} />
          <line x1={BOX_X + BOX_W / 2} y1={ZOOM_BOX_Y + 32} x2={BOX_X + BOX_W / 2} y2={ZOOM_BRACKET_Y} stroke={GUESS_COLOR} strokeWidth={1.5} />
          <GuessBox x={BOX_X} y={ZOOM_BOX_Y} width={BOX_W} line={LEFT_BOX_TEXT[guesses.left]} />
        </g>
      )}

      {/* Guess 2, "a few billion": no size of its own, so only an arrow at the panel's right edge, off the scale */}
      {leftMark && leftMark.panel === 'zoom' && leftMark.kind === 'edge-arrow' && guesses && (
        <g>
          <WhiteArrow x1={AXIS_RIGHT - 40} x2={W - 14} y={ZOOM_BAR_Y + BAR_H / 2} />
          <text x={AXIS_RIGHT - 46} y={ZOOM_BAR_Y + BAR_H / 2 + 4} fill={GUESS_COLOR} fontSize="10" fontWeight="600" textAnchor="end" {...halo}>
            off this scale
          </text>
          <line x1={BOX_X + BOX_W / 2} y1={ZOOM_BOX_Y + 32} x2={AXIS_RIGHT - 10} y2={ZOOM_BAR_Y + BAR_H / 2 - 8} stroke={GUESS_COLOR} strokeWidth={1.5} />
          <GuessBox x={BOX_X} y={ZOOM_BOX_Y} width={BOX_W} line={LEFT_BOX_TEXT[guesses.left]} />
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2: the graph, the three distances for every source ----
const GRAPH_W = 480
const GRAPH_H = 310
const GRAPH_LEFT = 60
const GRAPH_RIGHT = GRAPH_W - 20
const GRAPH_TOP = 44
const GRAPH_BOTTOM = GRAPH_H - 52
const LOG_RANGE = Math.log10(MAX_REDSHIFT / MIN_REDSHIFT)
const graphX = (redshift: number) => GRAPH_LEFT + (Math.log10(redshift / MIN_REDSHIFT) / LOG_RANGE) * (GRAPH_RIGHT - GRAPH_LEFT)
const graphY = (billionLy: number) => GRAPH_BOTTOM - (billionLy / AXIS_MAX_BILLION_LY) * (GRAPH_BOTTOM - GRAPH_TOP)
const graphTicksX = [0.1, 1, 10, 100, 1000]
const graphTicksY = [0, 10, 20, 30, 40, 50]

export interface GraphMark {
  redshift: number
  label: string
  color: string
}

export function DistanceGraph({ marks }: { marks: GraphMark[] }) {
  const curve = runObservableUniverseExperiment(GALAXY_A_REDSHIFT).curve
  const line = (pick: (p: (typeof curve)[number]) => number) => curve.map((p) => `${graphX(p.redshift)},${graphY(pick(p) / 1e9)}`).join(' ')
  const end = curve[curve.length - 1]
  return (
    <svg width={GRAPH_W} height={GRAPH_H} viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} style={svgStyle} role="img" aria-label="The three distances for every source, against redshift">
      <text x={GRAPH_W / 2} y={18} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
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
      <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_H - 8} fill="#cbd5e1" fontSize="11" textAnchor="middle">
        Source redshift (each tick is ten times the one before)
      </text>
      <text x={14} y={(GRAPH_TOP + GRAPH_BOTTOM) / 2} fill="#cbd5e1" fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}>
        Distance (billions of light-years)
      </text>

      <polyline points={line((p) => p.distanceTodayLightYears)} fill="none" stroke={TODAY_COLOR} strokeWidth={2.5} />
      <polyline points={line((p) => p.lightTravelYears)} fill="none" stroke={TRAVEL_COLOR} strokeWidth={2.5} />
      <polyline points={line((p) => p.distanceWhenLightLeftLightYears)} fill="none" stroke={LEFT_COLOR} strokeWidth={2.5} />

      <text x={GRAPH_RIGHT} y={graphY(end.distanceTodayLightYears / 1e9) - 8} fill={TODAY_COLOR} fontSize="10" fontWeight="600" textAnchor="end">
        Source today
      </text>
      <text x={GRAPH_RIGHT} y={graphY(end.lightTravelYears / 1e9) - 8} fill={TRAVEL_COLOR} fontSize="10" fontWeight="600" textAnchor="end">
        Light travelled
      </text>
      <text x={graphX(60)} y={graphY(8)} fill={LEFT_COLOR} fontSize="10" fontWeight="600" textAnchor="middle">
        When the light left
      </text>

      {marks.map((m) => {
        const r = runObservableUniverseExperiment(m.redshift)
        const x = graphX(m.redshift)
        return (
          <g key={m.label}>
            <line x1={x} y1={GRAPH_TOP} x2={x} y2={GRAPH_BOTTOM} stroke={m.color} strokeDasharray="3 4" strokeWidth={m.color === YOUR_SOURCE_COLOR ? 2 : 1} opacity={0.9} />
            <circle cx={x} cy={graphY(r.distanceTodayLightYears / 1e9)} r={5} fill={TODAY_COLOR} stroke="#0b1020" strokeWidth={2} />
            <circle cx={x} cy={graphY(r.lightTravelYears / 1e9)} r={5} fill={TRAVEL_COLOR} stroke="#0b1020" strokeWidth={2} />
            <circle cx={x} cy={graphY(r.distanceWhenLightLeftLightYears / 1e9)} r={5} fill={LEFT_COLOR} stroke="#0b1020" strokeWidth={2} />
            <text x={x} y={GRAPH_TOP - 8} fill={m.color} fontSize="10" fontWeight="600" textAnchor={x > GRAPH_RIGHT - 50 ? 'end' : x < GRAPH_LEFT + 40 ? 'start' : 'middle'} {...halo}>
              {m.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---- Picture 3 (Part 2): the three distances for the learner's own source, with a zoomed strip when the green bar is too short to see ----
const OWN_ROWS = { travel: 78, today: 124, left: 170 }
const OWN_AXIS_Y = 204
const OWN_STRIP_TITLE_Y = 262
const OWN_STRIP_BAR_Y = 292
const OWN_STRIP_AXIS_Y = 318

export function OwnSourcePicture({ redshift, progress }: { redshift: number; progress: number }) {
  const r = runObservableUniverseExperiment(redshift)
  const travelled = r.lightTravelYears * progress
  const sourceNow = r.distanceWhenLightLeftLightYears + (r.distanceTodayLightYears - r.distanceWhenLightLeftLightYears) * progress
  const axis = zoomAxisFor(r.distanceWhenLightLeftLightYears)
  const height = axis === null ? 250 : 372
  const stripX = (lightYears: number) => EARTH_X + (lightYears / (axis ?? 1)) * (AXIS_RIGHT - EARTH_X)
  return (
    <svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} style={{ ...svgStyle, border: `2px solid ${YOUR_SOURCE_COLOR}` }} role="img" aria-label="The three distances for your own source">
      <text x={W / 2} y={20} fill={YOUR_SOURCE_COLOR} fontSize="12" fontWeight="700" textAnchor="middle">
        Your source (redshift {redshiftLabel(redshift)}): its three distances (true scale)
      </text>
      <circle cx={EARTH_X} cy={42} r={8} fill={TRAVEL_COLOR} />
      <text x={EARTH_X + 14} y={46} fill={TEXT_COLOR} fontSize="11" fontWeight="600">
        Earth
      </text>
      <line x1={EARTH_X} y1={52} x2={EARTH_X} y2={OWN_AXIS_Y} stroke="#64748b" strokeDasharray="3 4" />

      <text x={EARTH_X + 6} y={OWN_ROWS.travel - 6} fill={TRAVEL_COLOR} fontSize="11" fontWeight="600" {...halo}>
        How far the light travelled: {distanceLabel(r.lightTravelYears)}
      </text>
      <rect x={EARTH_X} y={OWN_ROWS.travel} width={barW(travelled)} height={BAR_H} fill={TRAVEL_COLOR} opacity={0.85} />
      <text x={EARTH_X + 6} y={OWN_ROWS.today - 6} fill={TODAY_COLOR} fontSize="11" fontWeight="600" {...halo}>
        How far away the source is today: {distanceLabel(r.distanceTodayLightYears)}
      </text>
      <rect x={EARTH_X} y={OWN_ROWS.today} width={barW(sourceNow)} height={BAR_H} fill={TODAY_COLOR} opacity={0.85} />
      <circle cx={xOf(sourceNow)} cy={OWN_ROWS.today + BAR_H / 2} r={7} fill={SOURCE_DOT} stroke="#0b1020" strokeWidth={2} />
      <text x={xOf(sourceNow) + 12} y={OWN_ROWS.today + BAR_H / 2 + 4} fill={SOURCE_DOT} fontSize="10" fontWeight="600" {...halo}>
        The source
      </text>
      <text x={EARTH_X + 6} y={OWN_ROWS.left - 6} fill={LEFT_COLOR} fontSize="11" fontWeight="600" {...halo}>
        How far away it was when the light left: {distanceLabel(r.distanceWhenLightLeftLightYears)}
      </text>
      <rect x={EARTH_X} y={OWN_ROWS.left} width={barW(r.distanceWhenLightLeftLightYears)} height={BAR_H} fill={LEFT_COLOR} opacity={0.9} />

      <line x1={EARTH_X} y1={OWN_AXIS_Y} x2={AXIS_RIGHT} y2={OWN_AXIS_Y} stroke="#64748b" />
      {AXIS_ROWS.map((t) => (
        <g key={t}>
          <line x1={xOf(t * 1e9)} y1={OWN_AXIS_Y} x2={xOf(t * 1e9)} y2={OWN_AXIS_Y + 4} stroke="#64748b" />
          <text x={xOf(t * 1e9)} y={OWN_AXIS_Y + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={(EARTH_X + AXIS_RIGHT) / 2} y={OWN_AXIS_Y + 34} fill="#cbd5e1" fontSize="11" textAnchor="middle">
        Distance from Earth (billions of light-years)
      </text>

      {axis !== null && (
        <g>
          <line x1={10} y1={OWN_STRIP_TITLE_Y - 18} x2={W - 10} y2={OWN_STRIP_TITLE_Y - 18} stroke="#334155" />
          <text x={W / 2} y={OWN_STRIP_TITLE_Y} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
            Zoomed in: your source when the light left (a different scale)
          </text>
          <text x={EARTH_X + 6} y={OWN_STRIP_BAR_Y - 6} fill={LEFT_COLOR} fontSize="11" fontWeight="600" {...halo}>
            {distanceLabel(r.distanceWhenLightLeftLightYears)}
          </text>
          <rect x={EARTH_X} y={OWN_STRIP_BAR_Y} width={stripX(r.distanceWhenLightLeftLightYears) - EARTH_X} height={BAR_H} fill={LEFT_COLOR} opacity={0.9} />
          <line x1={EARTH_X} y1={OWN_STRIP_BAR_Y - 20} x2={EARTH_X} y2={OWN_STRIP_AXIS_Y} stroke="#64748b" strokeDasharray="3 4" />
          <line x1={EARTH_X} y1={OWN_STRIP_AXIS_Y} x2={AXIS_RIGHT} y2={OWN_STRIP_AXIS_Y} stroke="#64748b" />
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => (
            <g key={f}>
              <line x1={stripX(f * axis)} y1={OWN_STRIP_AXIS_Y} x2={stripX(f * axis)} y2={OWN_STRIP_AXIS_Y + 4} stroke="#64748b" />
              <text x={stripX(f * axis)} y={OWN_STRIP_AXIS_Y + 16} fill="#cbd5e1" fontSize="10" textAnchor="middle">
                {Math.round((f * axis) / 1e6)}
              </text>
            </g>
          ))}
          <text x={(EARTH_X + AXIS_RIGHT) / 2} y={OWN_STRIP_AXIS_Y + 34} fill="#cbd5e1" fontSize="11" textAnchor="middle">
            Distance from Earth (millions of light-years)
          </text>
        </g>
      )}
    </svg>
  )
}

// ---- Captions (the owner's approved wording: docs/audit/cosmology/08-draft-wording.md, section 3) ----
export function Part1DistanceCaption({ started, arrived }: { started: boolean; arrived: boolean }) {
  const a = galaxyA()
  const b = sourceB()
  const zoom = zoomPanel()
  const n = captionNumbers()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the three distances for Galaxy A and Source B, drawn to a true scale.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>Earth</strong> is the blue dot at the top left. Every bar starts at the dashed line below it and reaches to the right. The axis along the bottom gives the distance in <strong>billions of light-years</strong> (a <strong>light-year</strong> is the distance light travels in one year); each tick is 10 billion more. The scale is true, so a bar twice as long means twice the distance.
        </li>
        <li>
          There are two groups of bars: <strong>Galaxy A</strong> (redshift 2) and <strong>Source B</strong> (the oldest light, redshift 1089.8). Each group has three bars, in the same colours as the graph.
        </li>
        <li>
          The <strong style={{ color: TRAVEL_COLOR }}>blue bar</strong> is <strong>how far the light travelled</strong>. Light moves at a fixed speed, so this is how long the light has been on its way, multiplied by that speed: for Galaxy A, {billions(a.lightTravelYears)} billion years × 1 light-year per year = {billions(a.lightTravelYears)} billion light-years. The bar starts at Earth only so that its length can be compared with the others; the light itself travelled the other way, from the source toward Earth.
        </li>
        <li>
          The <strong style={{ color: TODAY_COLOR }}>gold bar</strong> is <strong>how far away the source is today</strong>: the freeze-frame measuring tape from Earth to the source. The pale gold dot, labelled &ldquo;The source&rdquo;, sits at its end.
        </li>
        <li>
          The <strong style={{ color: LEFT_COLOR }}>green bar</strong> is <strong>how far away the source was when the light left</strong>: the length the same tape had back then. For Source B this bar is too short to see on this scale, so the <strong>zoomed panel</strong> at the bottom shows it on its own scale.
        </li>
        <li>
          <strong>The zoomed panel</strong> is a second drawing with its own title and its own axis, from 0 to {zoom.axisMaxLightYears / 1e6} million light-years, so each tick is {zoom.tickStepLightYears / 1e6} million. It shows Source B&rsquo;s green bar on that scale. Do not compare its lengths with the main axis: it is a different scale.
        </li>
        <li>
          When you press <strong>Run</strong>, watch for about 8 seconds. The blue bars grow as the light travels, and the gold bars and dots grow as each source goes from where it was when the light left to where it is today. The motion is drawn to help you notice the change; it is not a movie of real history, but the lengths at the end are exact.
        </li>
        {arrived && (
          <>
            <li>
              <strong>A worked moment.</strong> For Galaxy A the blue bar is {billions(a.lightTravelYears)} billion light-years, the gold bar {billions(a.distanceTodayLightYears)} and the green bar {billions(a.distanceWhenLightLeftLightYears)}. For Source B the blue bar is {billions(b.lightTravelYears)}, the gold bar {billions(b.distanceTodayLightYears)} and the green bar {Math.round(b.distanceWhenLightLeftLightYears / 1e6)} million light-years ({billions(b.distanceWhenLightLeftLightYears, 3)} billion).
            </li>
            <li>
              <strong>The white marks are only markers.</strong> Guess 1&rsquo;s arrow has a fixed length that means nothing as a number, and the arrow for &ldquo;a few billion&rdquo; means only &ldquo;off this scale&rdquo;. The white line at 10 billion and the white line at 13 billion are at their true places on the axis. Each mark sits in a box labelled YOUR GUESS. None of them says right or wrong.
            </li>
          </>
        )}
      </ul>
      {arrived && started && (
        <LookFor
          items={[
            {
              look: 'the blue bar and the gold bar for Galaxy A',
              means: `the light travelled ${billions(a.lightTravelYears)} billion light-years, and the source is ${billions(a.distanceTodayLightYears)} billion light-years away today, ${billions(n.galaxyAGapLightYears)} billion farther.`,
              matters: 'this is the comparison your first guess was about.',
            },
            {
              look: 'Source B’s green bar in the zoomed panel',
              means: `the source was ${Math.round(b.distanceWhenLightLeftLightYears / 1e6)} million light-years away when the light left.`,
              matters: 'this is the comparison your second guess was about.',
            },
            {
              look: 'the white marks',
              means: 'each shows what you guessed, beside the real bar.',
              matters: 'you can compare at a glance; the tutor goes through each guess.',
            },
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function Part1GraphCaption({ arrived }: { started?: boolean; arrived: boolean }) {
  const b = sourceB()
  const n = captionNumbers()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the graph, the three distances for every source.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          Picture 1 shows two sources. The graph shows <strong>every</strong> source, so you can see how the three distances change as the light left earlier and earlier. Each point on a curve is one possible source.
        </li>
        <li>
          Across the bottom is the <strong>redshift</strong> (the older the light, the farther to the right), on a scale where each tick is <strong>ten times</strong> the one before: 0.1, 1, 10, 100, 1000. That is how a very near source and the oldest light can share one graph, like a ruler where each step multiplies instead of adds. Up the side is distance, in billions of light-years.
        </li>
        <li>
          The three curves match the bars&rsquo; colours: <strong style={{ color: TRAVEL_COLOR }}>blue</strong>, how far the light travelled; <strong style={{ color: TODAY_COLOR }}>gold</strong>, how far away the source is today; <strong style={{ color: LEFT_COLOR }}>green</strong>, how far away it was when the light left.
        </li>
        <li>
          The two <strong>dashed vertical lines</strong> mark Galaxy A (redshift 2) and Source B (redshift 1089.8), each with three dots; how high a dot sits is the length of the matching bar in Picture 1. Nothing here moves during the run, because the graph shows every source at once.
        </li>
      </ul>
      {arrived && (
        <LookFor
          items={[
            {
              look: 'each curve, from left to right',
              means: `the blue curve rises and then flattens near ${billions(n.travelCurveEndLightYears, 1)}; the gold curve keeps climbing, past ${Math.floor(n.todayCurveEndLightYears / 1e9)}; the green curve rises, peaks near ${billions(n.leftCurvePeakLightYears, 1)} around redshift ${n.leftCurvePeakRedshift.toFixed(1)}, and then falls to about ${billions(b.distanceWhenLightLeftLightYears, 2)}.`,
              matters: 'the three distances do not move together, and that is the whole question of this experiment.',
            },
            {
              look: 'the gap between the blue curve and the gold curve at the right-hand end',
              means: `for Source B they are ${billions(b.lightTravelYears)} and ${billions(b.distanceTodayLightYears)}, a difference of ${billions(n.sourceBGapLightYears)} billion light-years.`,
              matters: 'the light’s journey and the source’s distance today are very different numbers.',
            },
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function Part2Caption({ redshift }: { redshift: number }) {
  const r = runObservableUniverseExperiment(redshift)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the three distances for your own source.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          The pink frame and the pink dashed line on the graph mark <strong>your source</strong>. The three bars are drawn in the same colours as in Picture 1: <strong style={{ color: TRAVEL_COLOR }}>blue</strong> for how far the light travelled, <strong style={{ color: TODAY_COLOR }}>gold</strong> for how far away the source is today and <strong style={{ color: LEFT_COLOR }}>green</strong> for how far away it was when the light left. The axis is the same true scale as Picture 1&rsquo;s main axis.
        </li>
        <li>
          When a source&rsquo;s green bar is under 1 billion light-years it is too short to see, so a <strong>zoomed strip</strong> with its own axis appears under the picture. It is a different scale.
        </li>
      </ul>
      <LookFor
        items={[
          {
            look: 'the three bars for your source',
            means: `with redshift ${redshiftLabel(redshift)} the light travelled ${distanceLabel(r.lightTravelYears)}, the source is ${distanceLabel(r.distanceTodayLightYears)} away today and was ${distanceLabel(r.distanceWhenLightLeftLightYears)} away when the light left.`,
            matters: 'it lets you see how the three distances change as the light left earlier.',
          },
        ]}
      />
    </CaptionBox>
  )
}
