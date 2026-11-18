import type { CSSProperties, ReactNode } from 'react'
import { EDGE_MARKER_RADII, HORIZON_MARKER_RADII } from '../physics/spinningBlackHoleExperiment'
import type { EdgeAnswer, EnergyAnswer, HorizonAnswer, SpinningBlackHoleResult } from '../physics/spinningBlackHoleExperiment'
import { EDGE_TEXT, ENERGY_TEXT, HORIZON_TEXT } from './SpinningBlackHoleChoices'

// Black Holes, Experiment 8 (audit update): the three pictures and their captions (docs/audit/black-holes-and-strong-gravity/08-draft-wording.md,
// sections 5 and 6, "all defaults" from the owner on 2026-11-18). Every number comes from the physics module and the drawings only display it
// (CLAUDE.md §9). White is used for nothing but the learner's guess marks: the horizon is violet and the "now" dots are cyan. A guess mark is drawn only
// when a guess is passed in, and the page passes it once the run has finished.

export const WITH_COLOR = '#4ade80' // a probe circling with the spin
export const AGAINST_COLOR = '#fb7185' // a probe circling against the spin
export const REFERENCE_COLOR = '#94a3b8' // the no-spin reference (Black Holes 3)
export const HORIZON_COLOR = '#c084fc' // the horizon (violet: white is for guesses only)
export const NOW_COLOR = '#22d3ee' // "where each line is at the spin now"

// The map (the first picture): seen from above, distances to scale, in reference radii.
export const MAP_WIDTH = 700
const MAP_HEIGHT = 660
const MAP_CX = 225
const MAP_CY = 290
const MAP_SCALE = 42 // pixels per reference radius
const MAP_LABEL_X = 466

// The edges graph (the second picture): the spin from 0 to 1 across, distance up, in reference radii.
export const EDGES_WIDTH = 700
const EDGES_HEIGHT = 520
const EDGES_LEFT = 84
const EDGES_RIGHT = 500
const EDGES_TOP = 66
const EDGES_BOTTOM = 330
const EDGES_MAX = 5

// The energy picture (the third picture): two bars and a graph, on one shared vertical scale.
export const ENERGY_WIDTH = 700
const ENERGY_HEIGHT = 440
const ENERGY_LEFT = 52
const ENERGY_RIGHT = 530
const ENERGY_TOP = 66
const ENERGY_BOTTOM = 330
const ENERGY_MAX = 0.45
const ENERGY_PLOT_LEFT = 250
const BAR_WITH_X = 64
const BAR_AGAINST_X = 144
const BAR_WIDTH = 50

const KM_PER_AU = 149_597_870.7

const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }
const list = { margin: '0.25rem 0 0.5rem', paddingLeft: '1.25rem' } as const
const SVG_STYLE: CSSProperties = {
  display: 'block',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
export function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A distance in reference radii, to two decimals ("1.16", "0.72").
export const formatRadii = (value: number) => value.toFixed(2)

export const formatPercent = (fraction: number) => `${(fraction * 100).toFixed(1)}%`

// A length in plain units, from meters to trillions of kilometers.
export function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

// Kilometers, with astronomical units added once that is the more natural unit.
export function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}

export function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// The point of the curve for the current moment of the playback (the spin rises from 0 to the chosen spin).
export function pointAt(result: SpinningBlackHoleResult, progress: number) {
  const last = result.curve.length - 1
  return result.curve[Math.min(last, Math.max(0, Math.round(progress * last)))]
}

// Moves labels apart so that none is closer than `gap` pixels to the next one, keeping their order, and keeping them
// between `min` and `max`.
function spread(ys: number[], gap: number, min: number, max: number): number[] {
  const order = ys.map((_, i) => i).sort((a, b) => ys[a] - ys[b])
  const out = [...ys]
  let previous = min - gap
  for (const i of order) {
    out[i] = Math.max(ys[i], previous + gap)
    previous = out[i]
  }
  const overflow = out[order[order.length - 1]] - max
  if (overflow > 0) {
    let next = max + gap
    for (const i of [...order].reverse()) {
      out[i] = Math.min(out[i], next - gap)
      next = out[i]
    }
  }
  return out
}

// A small arrowhead on a circle of radius r around (cx, cy), at the angle theta (degrees, counterclockwise from the
// right, as seen on the screen), pointing the way a probe circling counterclockwise (or clockwise) would go.
function Arrowhead({ cx, cy, r, theta, counterclockwise, color }: { cx: number; cy: number; r: number; theta: number; counterclockwise: boolean; color: string }) {
  const a = (theta * Math.PI) / 180
  const px = cx + r * Math.cos(a)
  const py = cy - r * Math.sin(a)
  const direction = counterclockwise ? 1 : -1
  const tx = -Math.sin(a) * direction
  const ty = -Math.cos(a) * direction
  const nx = -ty
  const ny = tx
  const tip = `${px + 8 * tx},${py + 8 * ty}`
  const left = `${px - 4 * tx + 5 * nx},${py - 4 * ty + 5 * ny}`
  const right = `${px - 4 * tx - 5 * nx},${py - 4 * ty - 5 * ny}`
  return <polygon points={`${tip} ${left} ${right}`} fill={color} />
}

// A white YOUR GUESS box joined by a line to its mark on the real picture. White always means the learner's guess.
function GuessBox({ x, y, width = 200, lines, target }: { x: number; y: number; width?: number; lines: string[]; target: { x: number; y: number } }) {
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

export interface EdgeGuesses {
  with: EdgeAnswer
  against: EdgeAnswer
  horizon: HorizonAnswer
}

// The first picture: a map seen from above, with the horizon and the two last safe orbits.
export function SafeOrbitMap({ result, progress, guesses }: { result: SpinningBlackHoleResult; progress: number; guesses?: EdgeGuesses | null }) {
  const now = pointAt(result, progress)
  const S = MAP_SCALE
  const referenceKm = result.referenceRadiusKm

  // Each label: its color, two lines of text, the ring it points to, and the angle on that ring where its line starts.
  const labels = [
    { color: AGAINST_COLOR, line1: 'last safe orbit, circling', line2: `against the spin: ${formatRadii(now.lastSafeAgainst)}`, r: now.lastSafeAgainst * S, theta: 40 },
    { color: REFERENCE_COLOR, line1: 'last safe orbit with no spin', line2: `(Black Holes 3): ${formatRadii(result.noSpinLastSafe)}`, r: result.noSpinLastSafe * S, theta: 28 },
    { color: WITH_COLOR, line1: 'last safe orbit, circling', line2: `with the spin: ${formatRadii(now.lastSafeWith)}`, r: now.lastSafeWith * S, theta: 14 },
    { color: HORIZON_COLOR, line1: 'horizon with no spin', line2: '(the size it would have): 1.00', r: S, theta: -6 },
    { color: HORIZON_COLOR, line1: 'horizon now (the point', line2: `of no return): ${formatRadii(now.horizon)}`, r: now.horizon * S, theta: -32 },
  ]
  const labelYs = spread([150, 205, 260, 315, 370], 52, 120, 420)

  const markAt = (radii: number, angle: number) => {
    const a = (angle * Math.PI) / 180
    return { x: MAP_CX + radii * S * Math.cos(a), y: MAP_CY - radii * S * Math.sin(a) }
  }
  const withMark = guesses ? markAt(EDGE_MARKER_RADII[guesses.with], -35) : null
  const againstMark = guesses ? markAt(EDGE_MARKER_RADII[guesses.against], -62) : null
  const horizonMark = guesses ? markAt(HORIZON_MARKER_RADII[guesses.horizon], -98) : null

  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, marginTop: '1rem', maxWidth: `${MAP_WIDTH}px` }}>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        The map: where the safe orbits are
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Seen from above the black hole, distances to scale. Spin now: {now.spin.toFixed(2)} (the run ends at {result.spin}).
      </text>

      {/* Which way the black hole turns */}
      <polyline
        points={Array.from({ length: 28 }, (_, i) => {
          const a = ((50 + i * 10) * Math.PI) / 180
          return `${52 + 18 * Math.cos(a)},${88 - 18 * Math.sin(a)}`
        }).join(' ')}
        fill="none"
        stroke={HORIZON_COLOR}
        strokeWidth={2}
      />
      <Arrowhead cx={52} cy={88} r={18} theta={320} counterclockwise color={HORIZON_COLOR} />
      <text x={80} y={84} fill={HORIZON_COLOR} fontSize="10">
        spin: the black hole
      </text>
      <text x={80} y={97} fill={HORIZON_COLOR} fontSize="10">
        turns this way
      </text>

      {/* The rings, from the farthest to the nearest */}
      <circle cx={MAP_CX} cy={MAP_CY} r={result.noSpinLastSafe * S} fill="none" stroke={REFERENCE_COLOR} strokeWidth={1.5} strokeDasharray="6 5" />
      <circle cx={MAP_CX} cy={MAP_CY} r={now.lastSafeAgainst * S} fill="none" stroke={AGAINST_COLOR} strokeWidth={2.5} />
      <circle cx={MAP_CX} cy={MAP_CY} r={now.lastSafeWith * S} fill="none" stroke={WITH_COLOR} strokeWidth={2.5} />
      <circle cx={MAP_CX} cy={MAP_CY} r={S} fill="none" stroke={HORIZON_COLOR} strokeWidth={1} strokeDasharray="2 4" strokeOpacity={0.8} />
      <circle cx={MAP_CX} cy={MAP_CY} r={now.horizon * S} fill="#000000" stroke={HORIZON_COLOR} strokeWidth={1.5} />

      {/* Which way a probe circles on each ring */}
      <Arrowhead cx={MAP_CX} cy={MAP_CY} r={now.lastSafeWith * S} theta={125} counterclockwise color={WITH_COLOR} />
      <Arrowhead cx={MAP_CX} cy={MAP_CY} r={now.lastSafeAgainst * S} theta={150} counterclockwise={false} color={AGAINST_COLOR} />

      {/* Labels, joined to their rings by thin lines */}
      {labels.map((label, i) => {
        const a = (label.theta * Math.PI) / 180
        const x0 = MAP_CX + label.r * Math.cos(a)
        const y0 = MAP_CY - label.r * Math.sin(a)
        const y = labelYs[i]
        return (
          <g key={i}>
            <line x1={x0} y1={y0} x2={MAP_LABEL_X - 4} y2={y} stroke={label.color} strokeWidth={1} strokeOpacity={0.8} />
            <circle cx={x0} cy={y0} r={2.5} fill={label.color} />
            <text x={MAP_LABEL_X} y={y - 3} fill={label.color} fontSize="10.5" fontWeight="bold">
              {label.line1}
            </text>
            <text x={MAP_LABEL_X} y={y + 10} fill={label.color} fontSize="10.5">
              {label.line2}
            </text>
          </g>
        )
      })}

      {/* The ring arrows are small, so say what they mean */}
      <text x={MAP_CX} y={MAP_CY + 4.5 * S + 20} fill="#94a3b8" fontSize="10" textAnchor="middle">
        The small arrows on the green and rose rings show which way a probe circles on each.
      </text>

      {/* The learner's guesses: white marks and boxes, only once the run has finished */}
      {guesses && withMark && againstMark && horizonMark && (
        <>
          {/* The boxes are in the order of their marks from the top, so that no two lines cross: the horizon mark, then guess 1, then guess 2. */}
          <GuessBox x={MAP_LABEL_X} y={440} width={222} lines={['guess 3, the horizon:', HORIZON_TEXT[guesses.horizon]]} target={horizonMark} />
          <GuessBox x={MAP_LABEL_X} y={498} width={222} lines={['guess 1, circling with the spin:', EDGE_TEXT[guesses.with]]} target={withMark} />
          <GuessBox x={MAP_LABEL_X} y={556} width={222} lines={['guess 2, circling against the spin:', EDGE_TEXT[guesses.against]]} target={againstMark} />
          <WhiteMarker x={withMark.x} y={withMark.y} />
          <WhiteMarker x={againstMark.x} y={againstMark.y} />
          <WhiteMarker x={horizonMark.x} y={horizonMark.y} />
        </>
      )}

      {/* The scale */}
      <line x1={14} y1={MAP_HEIGHT - 22} x2={14 + S} y2={MAP_HEIGHT - 22} stroke={HORIZON_COLOR} strokeWidth={2} />
      <text x={14 + S + 8} y={MAP_HEIGHT - 26} fill="#94a3b8" fontSize="10">
        = 1 reference radius: the horizon radius this black hole would have with no spin,
      </text>
      <text x={14 + S + 8} y={MAP_HEIGHT - 13} fill="#94a3b8" fontSize="10">
        {formatDistance(referenceKm)}. Every distance on the map is measured from the center.
      </text>
    </svg>
  )
}

// A set of axes for a graph, shared by the second and third pictures: horizontal gridlines with labels at the left, and
// the spin from 0 to 1 along the bottom.
function SpinAxis({ left, right, bottom, title }: { left: number; right: number; bottom: number; title: string }) {
  const xFor = (spin: number) => left + spin * (right - left)
  return (
    <>
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((s) => (
        <g key={s}>
          <line x1={xFor(s)} y1={bottom} x2={xFor(s)} y2={bottom + 5} stroke="#94a3b8" />
          <text x={xFor(s)} y={bottom + 18} fill="#94a3b8" fontSize="10" textAnchor="middle">
            {s}
          </text>
        </g>
      ))}
      <text x={(left + right) / 2} y={bottom + 36} fill="#94a3b8" fontSize="11" textAnchor="middle">
        {title}
      </text>
    </>
  )
}

// The second picture: how the horizon and the two edges move as the spin grows.
export function EdgesGraph({ result, progress, guesses }: { result: SpinningBlackHoleResult; progress: number; guesses?: EdgeGuesses | null }) {
  const xFor = (spin: number) => EDGES_LEFT + spin * (EDGES_RIGHT - EDGES_LEFT)
  const yFor = (d: number) => EDGES_BOTTOM - (d / EDGES_MAX) * (EDGES_BOTTOM - EDGES_TOP)
  const now = pointAt(result, progress)
  const last = result.curve[result.curve.length - 1]
  const lines = {
    horizon: result.curve.map((p) => `${xFor(p.spin)},${yFor(p.horizon)}`).join(' '),
    with: result.curve.map((p) => `${xFor(p.spin)},${yFor(p.lastSafeWith)}`).join(' '),
    against: result.curve.map((p) => `${xFor(p.spin)},${yFor(p.lastSafeAgainst)}`).join(' '),
  }
  const ends = [
    { color: AGAINST_COLOR, text: 'circling against the spin', y: yFor(last.lastSafeAgainst) },
    { color: REFERENCE_COLOR, text: `no spin: ${result.noSpinLastSafe} (Black Holes 3)`, y: yFor(result.noSpinLastSafe) },
    { color: WITH_COLOR, text: 'circling with the spin', y: yFor(last.lastSafeWith) },
    { color: HORIZON_COLOR, text: 'horizon', y: yFor(last.horizon) },
  ]
  const endYs = spread(ends.map((e) => e.y), 16, EDGES_TOP, EDGES_BOTTOM)

  const withMark = guesses ? { x: xFor(0.3), y: yFor(EDGE_MARKER_RADII[guesses.with]) } : null
  const againstMark = guesses ? { x: xFor(0.55), y: yFor(EDGE_MARKER_RADII[guesses.against]) } : null
  const horizonMark = guesses ? { x: xFor(0.8), y: yFor(HORIZON_MARKER_RADII[guesses.horizon]) } : null

  return (
    <svg viewBox={`0 0 ${EDGES_WIDTH} ${EDGES_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, marginTop: '1rem', maxWidth: `${EDGES_WIDTH}px` }}>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        How the edges move as the spin grows
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Horizontal: the spin. Vertical: distance from the center, in reference radii. Spin now: {now.spin.toFixed(2)}.
      </text>

      {[0, 1, 2, 3, 4, 5].map((d) => (
        <g key={d}>
          <line x1={EDGES_LEFT} y1={yFor(d)} x2={EDGES_RIGHT} y2={yFor(d)} stroke="#334155" />
          <text x={EDGES_LEFT - 8} y={yFor(d) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {d}
          </text>
        </g>
      ))}
      <text x={14} y={(EDGES_TOP + EDGES_BOTTOM) / 2} fill="#94a3b8" fontSize="10" textAnchor="middle" transform={`rotate(-90 14 ${(EDGES_TOP + EDGES_BOTTOM) / 2})`}>
        distance from the center (reference radii)
      </text>
      <SpinAxis left={EDGES_LEFT} right={EDGES_RIGHT} bottom={EDGES_BOTTOM} title="the black hole's spin (0 is not spinning; the largest you can choose is 0.99)" />

      <line x1={EDGES_LEFT} y1={yFor(result.noSpinLastSafe)} x2={EDGES_RIGHT} y2={yFor(result.noSpinLastSafe)} stroke={REFERENCE_COLOR} strokeWidth={1.5} strokeDasharray="6 5" />
      <polyline points={lines.horizon} fill="none" stroke={HORIZON_COLOR} strokeWidth={3} />
      <polyline points={lines.against} fill="none" stroke={AGAINST_COLOR} strokeWidth={3} />
      <polyline points={lines.with} fill="none" stroke={WITH_COLOR} strokeWidth={3} />
      {progress > 0 && (
        <>
          <circle cx={xFor(now.spin)} cy={yFor(now.horizon)} r={5} fill={NOW_COLOR} stroke={HORIZON_COLOR} strokeWidth={2} />
          <circle cx={xFor(now.spin)} cy={yFor(now.lastSafeAgainst)} r={5} fill={NOW_COLOR} stroke={AGAINST_COLOR} strokeWidth={2} />
          <circle cx={xFor(now.spin)} cy={yFor(now.lastSafeWith)} r={5} fill={NOW_COLOR} stroke={WITH_COLOR} strokeWidth={2} />
        </>
      )}

      {/* Where each line ends (at the chosen spin), named in the margin */}
      {ends.map((e, i) => (
        <g key={e.text}>
          <line x1={EDGES_RIGHT} y1={e.y} x2={EDGES_RIGHT + 10} y2={endYs[i]} stroke={e.color} strokeOpacity={0.7} />
          <text x={EDGES_RIGHT + 14} y={endYs[i] + 4} fill={e.color} fontSize="10.5">
            {e.text}
          </text>
        </g>
      ))}

      {/* The learner's guesses: white marks and boxes, only once the run has finished */}
      {guesses && withMark && againstMark && horizonMark && (
        <>
          <GuessBox x={24} y={384} width={206} lines={['guess 1, circling with the spin:', EDGE_TEXT[guesses.with]]} target={withMark} />
          <GuessBox x={246} y={384} width={206} lines={['guess 2, circling against the spin:', EDGE_TEXT[guesses.against]]} target={againstMark} />
          <GuessBox x={468} y={384} width={206} lines={['guess 3, the horizon:', HORIZON_TEXT[guesses.horizon]]} target={horizonMark} />
          <WhiteMarker x={withMark.x} y={withMark.y} />
          <WhiteMarker x={againstMark.x} y={againstMark.y} />
          <WhiteMarker x={horizonMark.x} y={horizonMark.y} />
        </>
      )}

      <circle cx={96} cy={EDGES_HEIGHT - 42} r={5} fill={NOW_COLOR} stroke={HORIZON_COLOR} strokeWidth={2} />
      <text x={108} y={EDGES_HEIGHT - 38} fill="#e2e8f0" fontSize="11">
        where each line is at the spin now
      </text>
      <text x={96} y={EDGES_HEIGHT - 22} fill="#94a3b8" fontSize="10">
        The lines are drawn up to the spin you chose. The dashed line is Black Holes 3's last safe orbit,
      </text>
      <text x={96} y={EDGES_HEIGHT - 9} fill="#94a3b8" fontSize="10">
        for a black hole that does not spin.
      </text>
    </svg>
  )
}

// The third picture: the energy given up on the way down, as two bars for now and two curves against the spin, on one
// vertical scale.
export function EnergyPicture({ result, progress, guess }: { result: SpinningBlackHoleResult; progress: number; guess?: EnergyAnswer | null }) {
  const now = pointAt(result, progress)
  const last = result.curve[result.curve.length - 1]
  const yFor = (fraction: number) => ENERGY_BOTTOM - (fraction / ENERGY_MAX) * (ENERGY_BOTTOM - ENERGY_TOP)
  const xFor = (spin: number) => ENERGY_PLOT_LEFT + spin * (ENERGY_RIGHT - ENERGY_PLOT_LEFT)
  const barHeight = (fraction: number) => ENERGY_BOTTOM - yFor(fraction)
  const lines = {
    with: result.curve.map((p) => `${xFor(p.spin)},${yFor(p.energyReleasedWith)}`).join(' '),
    against: result.curve.map((p) => `${xFor(p.spin)},${yFor(p.energyReleasedAgainst)}`).join(' '),
  }
  const ends = [
    { color: WITH_COLOR, text: 'circling with the spin', y: yFor(last.energyReleasedWith) },
    { color: AGAINST_COLOR, text: 'circling against the spin', y: yFor(last.energyReleasedAgainst) },
    { color: REFERENCE_COLOR, text: `no spin: ${formatPercent(result.noSpinEnergyReleased)}`, y: yFor(result.noSpinEnergyReleased) },
  ]
  const endYs = spread(ends.map((e) => e.y), 16, ENERGY_TOP, ENERGY_BOTTOM)
  const bars = [
    { x: BAR_WITH_X, color: WITH_COLOR, fraction: now.energyReleasedWith, line1: 'circling', line2: 'with the spin' },
    { x: BAR_AGAINST_X, color: AGAINST_COLOR, fraction: now.energyReleasedAgainst, line1: 'circling', line2: 'against the spin' },
  ]

  // The white outline for guess 4: round the bar it names, or round both for "the same". Marker only.
  const outlined = guess === 'with' ? [bars[0]] : guess === 'against' ? [bars[1]] : guess === 'same' ? bars : []
  const outlineLeft = outlined.length ? Math.min(...outlined.map((b) => b.x)) - 6 : 0
  const outlineRight = outlined.length ? Math.max(...outlined.map((b) => b.x)) + BAR_WIDTH + 6 : 0
  const outlineTop = outlined.length ? Math.min(...outlined.map((b) => yFor(Math.max(b.fraction, result.noSpinEnergyReleased)) - 24)) : 0

  return (
    <svg viewBox={`0 0 ${ENERGY_WIDTH} ${ENERGY_HEIGHT}`} width="100%" style={{ ...SVG_STYLE, marginTop: '1rem', maxWidth: `${ENERGY_WIDTH}px` }}>
      <text x={12} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold">
        Energy released on the way down
      </text>
      <text x={12} y={38} fill="#94a3b8" fontSize="11">
        Vertical: the share of its rest-mass energy a probe gives up. Left: now (spin {now.spin.toFixed(2)}). Right: the same two shares for every spin.
      </text>

      {[0, 0.1, 0.2, 0.3, 0.4].map((v) => (
        <g key={v}>
          <line x1={ENERGY_LEFT} y1={yFor(v)} x2={ENERGY_RIGHT} y2={yFor(v)} stroke="#334155" />
          <text x={ENERGY_LEFT - 6} y={yFor(v) + 4} fill="#94a3b8" fontSize="10" textAnchor="end">
            {Math.round(v * 100)}%
          </text>
        </g>
      ))}

      {/* The bars, for the spin now */}
      {bars.map((b) => (
        <g key={b.line2}>
          <rect x={b.x} y={yFor(b.fraction)} width={BAR_WIDTH} height={barHeight(b.fraction)} fill={b.color} fillOpacity={0.85} />
          <text x={b.x + 25} y={yFor(Math.max(b.fraction, result.noSpinEnergyReleased)) - 6} fill={b.color} fontSize="11" fontWeight="bold" textAnchor="middle">
            {formatPercent(b.fraction)}
          </text>
          <text x={b.x + 25} y={ENERGY_BOTTOM + 16} fill={b.color} fontSize="10" textAnchor="middle">
            {b.line1}
          </text>
          <text x={b.x + 25} y={ENERGY_BOTTOM + 29} fill={b.color} fontSize="10" textAnchor="middle">
            {b.line2}
          </text>
        </g>
      ))}

      {/* The no-spin value, across both */}
      <line x1={ENERGY_LEFT} y1={yFor(result.noSpinEnergyReleased)} x2={ENERGY_RIGHT} y2={yFor(result.noSpinEnergyReleased)} stroke={REFERENCE_COLOR} strokeWidth={1.5} strokeDasharray="6 5" />

      {/* The graph against the spin */}
      <line x1={ENERGY_PLOT_LEFT} y1={ENERGY_TOP} x2={ENERGY_PLOT_LEFT} y2={ENERGY_BOTTOM} stroke="#475569" />
      <polyline points={lines.against} fill="none" stroke={AGAINST_COLOR} strokeWidth={3} />
      <polyline points={lines.with} fill="none" stroke={WITH_COLOR} strokeWidth={3} />
      {progress > 0 && (
        <>
          <circle cx={xFor(now.spin)} cy={yFor(now.energyReleasedWith)} r={5} fill={NOW_COLOR} stroke={WITH_COLOR} strokeWidth={2} />
          <circle cx={xFor(now.spin)} cy={yFor(now.energyReleasedAgainst)} r={5} fill={NOW_COLOR} stroke={AGAINST_COLOR} strokeWidth={2} />
        </>
      )}
      <SpinAxis left={ENERGY_PLOT_LEFT} right={ENERGY_RIGHT} bottom={ENERGY_BOTTOM} title="the black hole's spin" />

      {ends.map((e, i) => (
        <g key={e.text}>
          <line x1={ENERGY_RIGHT} y1={e.y} x2={ENERGY_RIGHT + 10} y2={endYs[i]} stroke={e.color} strokeOpacity={0.7} />
          <text x={ENERGY_RIGHT + 14} y={endYs[i] + 4} fill={e.color} fontSize="10.5">
            {e.text}
          </text>
        </g>
      ))}

      {/* The learner's guess: a thick white outline round the bar it names, and its box, only once the run has finished */}
      {guess && outlined.length > 0 && (
        <>
          <rect x={outlineLeft} y={outlineTop} width={outlineRight - outlineLeft} height={ENERGY_BOTTOM + 4 - outlineTop} rx={4} fill="none" stroke="#ffffff" strokeWidth={3.5} />
          <GuessBox x={ENERGY_LEFT + 4} y={74} width={190} lines={['guess 4, which gives up more:', ENERGY_TEXT[guess]]} target={{ x: (outlineLeft + outlineRight) / 2, y: outlineTop }} />
        </>
      )}

      <text x={ENERGY_LEFT} y={ENERGY_HEIGHT - 8} fill="#94a3b8" fontSize="10">
        The curves are drawn up to the spin you chose. The dashed line is the value with no spin.
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------------------------------------------------------------
// The captions. Each names what is drawn and what it means; the outcomes ("which one moves in") and the mechanism are left to the tutor
// (CLAUDE.md §12, §13). Every "what to look for" item has three parts: Look at, What it means, Why it matters.
// ---------------------------------------------------------------------------------------------------------------------------------
function LookFor({ look, means, matters }: { look: ReactNode; means: ReactNode; matters: ReactNode }) {
  return (
    <li style={{ marginBottom: '0.3rem' }}>
      <strong>Look at</strong> {look} <strong>What it means:</strong> {means} <strong>Why it matters:</strong> {matters}
    </li>
  )
}

export function MapCaption({ result, number, complete, withGuesses }: { result: SpinningBlackHoleResult; number: number; complete: boolean; withGuesses?: boolean }) {
  const km = result.referenceRadiusKm
  const noSpin = result.spin === 0
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${MAP_WIDTH}px` }}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read Picture {number}: the map.</strong> You are looking down on the black hole from above. The black disk in the middle is the black hole’s horizon, the point of no return. The rings are the last safe circular orbit, the closest circle a small probe can follow without a tiny nudge sending it
        spiraling in (you met it in Black Holes 3; astronomers call it the innermost stable circular orbit, or ISCO). Every distance is measured from the center, in <em>reference radii</em>: one reference radius is the horizon radius the same black hole would have if it did not spin (the scale bar at the bottom
        shows its length). The spin is a number from 0 (not spinning) up toward 1, the fastest possible.
      </p>
      <ul style={list}>
        <li>
          <strong>The black disk</strong> is the horizon. Its size is the horizon radius. The dotted violet ring just around it marks where the horizon would be with no spin, so the band between the dotted ring and the edge of the disk shows how much the horizon has changed. With no spin there is no band.
        </li>
        <li>
          <strong>The dashed grey ring</strong> is Black Holes 3’s last safe orbit, for a black hole that does not spin. It never moves, so use it as a yardstick: a ring inside it is closer to the black hole than the no-spin edge, and a ring outside it is farther away.
        </li>
        <li>
          <strong>The green ring and the rose ring</strong> are the last safe orbits for the two directions. Green is a probe circling the same way the black hole spins, rose is a probe circling the opposite way.
        </li>
        <li>
          <strong>The small arrows</strong> show which way a probe goes round on each ring. The green arrow points the same way as the violet arrow in the top left corner, which is the way the black hole turns, and the rose arrow points the opposite way.
        </li>
        <li>
          <strong>The labels</strong> are joined to their rings by thin lines. Each gives that ring’s distance from the center, in reference radii. To turn it into kilometers, multiply by the length of the scale bar (one reference radius).
        </li>
        {withGuesses && complete && (
          <li>
            <strong>The white YOUR GUESS boxes</strong> are your first three guesses, each joined by a line to a white mark. A white mark is only a marker: its place shows which kind of answer you gave (inside the dashed ring, on it, or outside it; inside the dotted ring, on it, or outside it), not a number you chose.
          </li>
        )}
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>What appears when.</strong> {number === 1 ? 'During the 10-second run' : 'During the run'} the spin rises from 0 to {result.spin}. At the start the green, rose and dashed rings sit together. The rings and the disk move as the spin rises, and the labels follow them.
        {withGuesses ? ' When the run has finished, your white guesses appear.' : ''}
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong>{' '}
        {noSpin
          ? `With a spin of 0 the green ring, the rose ring and the dashed ring all sit at ${result.noSpinLastSafe} reference radii, and the horizon is at 1. Choose a spin above 0 to see them separate.`
          : `At the end of the run the spin is ${result.spin}: the green ring is at ${formatRadii(result.lastSafeWith)} reference radii, the rose ring at ${formatRadii(result.lastSafeAgainst)}, the dashed ring still at ${result.noSpinLastSafe}, and the horizon at ${formatRadii(result.horizon)}. One reference radius is ${formatDistance(km)} here, so the green ring is about ${formatDistance(result.lastSafeWith * km)} from the center and the rose ring about ${formatDistance(result.lastSafeAgainst * km)}.`}
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        <LookFor
          look="the green ring against the dashed ring."
          means={`they are at ${formatRadii(result.lastSafeWith)} and ${result.noSpinLastSafe} reference radii (${formatDistance(result.lastSafeWith * km)} and ${formatDistance(result.noSpinLastSafe * km)} from the center).`}
          matters="it is the picture’s answer, for a probe circling with the spin, to the question this page asks."
        />
        <LookFor
          look="the rose ring against the dashed ring."
          means={`they are at ${formatRadii(result.lastSafeAgainst)} and ${result.noSpinLastSafe} reference radii (${formatDistance(result.lastSafeAgainst * km)} and ${formatDistance(result.noSpinLastSafe * km)} from the center).`}
          matters="it shows what the direction of circling does to the answer, for the same black hole."
        />
        <LookFor
          look="the black disk against the dotted violet ring."
          means={`the disk’s radius is ${formatRadii(result.horizon)} reference radii, and the ring’s is 1.`}
          matters="the black hole’s mass did not change during the run, only its spin."
        />
      </ul>
      <p style={{ margin: 0 }}>
        <strong>A limit.</strong> This is a map of where the edges are, not a path. It does not show a probe moving, and it applies only to probes circling in the flat sheet through the black hole’s equator. The “spinning up” while Run plays is only a way of showing many different spins one after another: each spin is a
        separate black hole with its own edges, and nothing in the experiment changes the spin over time.
      </p>
    </div>
  )
}

export function EdgesCaption({ result, number, complete, withGuesses }: { result: SpinningBlackHoleResult; number: number; complete: boolean; withGuesses?: boolean }) {
  const mid = (spin: number) => result.curve.find((p) => p.spin >= spin)
  const half = mid(0.5)
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${EDGES_WIDTH}px` }}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read Picture {number}: how the edges move as the spin grows.</strong> Across the bottom is the spin, from 0 (not spinning) to 1. Up the side is the distance from the center, in reference radii (one reference radius is the horizon radius the black hole would have if it did not spin). The violet
        line is the horizon, the green line is the last safe orbit for a probe circling with the spin, and the rose line is the last safe orbit for a probe circling against it. The dashed grey line is the {result.noSpinLastSafe} of Black Holes 3, for no spin. The lines are drawn up to the spin you chose, and each cyan dot is where that line is at the spin now.
      </p>
      <ul style={list}>
        <li>
          <strong>Pick a spin</strong> on the horizontal axis and go straight up from it. The three lines you cross give the three distances at that spin. The number beside each crossing, on the vertical axis, is that distance from the center.
        </li>
        <li>
          <strong>At the far left, the spin is 0.</strong> The green and rose lines start together on the dashed line at {result.noSpinLastSafe}, which is Black Holes 3’s value, and the violet line starts at 1, the horizon of Black Holes 1’s black hole.
        </li>
        <li>
          <strong>The cyan dots</strong> mark where each line is at the spin the run has reached. During Run they slide along the lines from left to right, and at the end they stop at the spin you chose. The lines themselves are drawn all the way to that spin.
        </li>
        {withGuesses && complete && (
          <li>
            <strong>The white YOUR GUESS boxes</strong> are your first three guesses, each joined by a line to a white mark placed above, level with or below the line it is about. A white mark is only a marker: its place shows which kind of answer you gave, not a number you chose.
          </li>
        )}
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>What appears when.</strong> The lines are drawn at once, up to the spin you chose. During the run the cyan dots move from the left. {withGuesses ? 'When the run has finished, your white guesses appear.' : ''}
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong>{' '}
        {result.spin >= 0.5 && half
          ? `At a spin of 0.5 the green line is at ${formatRadii(half.lastSafeWith)}, the rose line at ${formatRadii(half.lastSafeAgainst)} and the violet line at ${formatRadii(half.horizon)}. At ${result.spin} they are ${formatRadii(result.lastSafeWith)}, ${formatRadii(result.lastSafeAgainst)} and ${formatRadii(result.horizon)}.`
          : `At a spin of ${result.spin} the green line is at ${formatRadii(result.lastSafeWith)}, the rose line at ${formatRadii(result.lastSafeAgainst)} and the violet line at ${formatRadii(result.horizon)}.`}
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        <LookFor
          look="where the three lines begin, at the left."
          means={`they start at ${result.noSpinLastSafe}, ${result.noSpinLastSafe} and 1.`}
          matters="with no spin the page gives back the values of Black Holes 3 and Black Holes 1, so it agrees with what you already found."
        />
        <LookFor
          look="the gap between the green line and the rose line at the right-hand end."
          means={`it is ${formatRadii(result.lastSafeAgainst - result.lastSafeWith)} reference radii (${formatRadii(result.lastSafeWith)} and ${formatRadii(result.lastSafeAgainst)}).`}
          matters="it is the size of the difference that the direction of circling makes."
        />
        <LookFor
          look="the violet line against the number 1 on the side."
          means={`at the right-hand end it is at ${formatRadii(result.horizon)}, against 1 with no spin.`}
          matters="it shows what the same black hole’s horizon is at this spin."
        />
      </ul>
      <p style={{ margin: 0 }}>
        <strong>A limit.</strong> The lines show where the edges are, not how a probe gets there.
      </p>
    </div>
  )
}

export function EnergyCaption({ result, number, complete, withGuesses }: { result: SpinningBlackHoleResult; number: number; complete: boolean; withGuesses?: boolean }) {
  return (
    <div style={{ ...CAPTION_STYLE, maxWidth: `${ENERGY_WIDTH}px` }}>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>How to read Picture {number}: energy released on the way down.</strong> A probe has an energy stored in its mass (its <em>rest-mass energy</em>). Imagine a probe that slowly spirals in from far away down to the last safe orbit. On the way it gives up some of that energy. The vertical scale is the share it gives
        up, as a percentage. The two bars on the left are for the spin now, and the two curves on the right show the same two shares for every spin. Green is a probe circling with the spin, rose is a probe circling against it, and the dashed grey line is the value with no spin. Where the energy goes is not shown.
      </p>
      <ul style={list}>
        <li>
          <strong>The height of a bar</strong> is the share of its rest-mass energy that probe gives up, read against the percentage scale on the left. A taller bar means more energy given up. The labels over the bars give the exact percentages.
        </li>
        <li>
          <strong>The dashed grey line</strong> is the share with no spin, about {formatPercent(result.noSpinEnergyReleased)}. A bar that rises above the line gives up more than a probe would with no spin, and a bar that stops below it gives up less. With no spin, both bars reach the line.
        </li>
        <li>
          <strong>The two curves on the right</strong> show the same two shares for every spin, from 0 on the left to 1 on the right. Each bar is as tall as its curve is at the spin the run has reached, which is where the cyan dots are.
        </li>
        {withGuesses && complete && (
          <li>
            <strong>The white YOUR GUESS box</strong> is your fourth guess, joined by a line to a thick white outline round the bar it names (round both bars if you guessed that they give up the same). A white mark is only a marker: it shows which answer you gave, not a number you chose.
          </li>
        )}
      </ul>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>What appears when.</strong> The curves are drawn at once, up to the spin you chose. During the run the bars grow with the spin and the cyan dots slide along the curves. {withGuesses ? 'When the run has finished, your white guess appears.' : ''}
      </p>
      <p style={CAPTION_PARAGRAPH_STYLE}>
        <strong>A worked moment.</strong>{' '}
        {result.spin === 0
          ? `With a spin of 0 both bars are ${formatPercent(result.energyReleasedWith)}, level with the dashed line.`
          : `At a spin of ${result.spin} the probe circling with the spin gives up ${formatPercent(result.energyReleasedWith)} of its rest-mass energy and the one circling against it gives up ${formatPercent(result.energyReleasedAgainst)}. With no spin it is ${formatPercent(result.noSpinEnergyReleased)}.`}
      </p>
      <p style={{ ...CAPTION_PARAGRAPH_STYLE, marginBottom: 0 }}>
        <strong>What to look for.</strong>
      </p>
      <ul style={list}>
        <LookFor
          look="the two bars against the dashed line."
          means={`the bars are at ${formatPercent(result.energyReleasedWith)} and ${formatPercent(result.energyReleasedAgainst)}, and the line is at ${formatPercent(result.noSpinEnergyReleased)}.`}
          matters="it shows how the share of energy a probe gives up depends on the direction it circles, and on the spin."
        />
        <LookFor
          look="the two curves on the right, from left to right."
          means="each curve shows one probe’s share as the spin goes from 0 to the spin you chose."
          matters="it shows whether the difference between the two probes is steady or grows with the spin."
        />
        <LookFor
          look="a bar next to the ring it goes with on the map."
          means="the map gives each probe’s last safe orbit, and the bar gives the energy that probe gave up on the way there."
          matters="the two pictures describe the same two probes, so each can be read against the other."
        />
      </ul>
      <p style={{ margin: 0 }}>
        <strong>A limit.</strong> This assumes the probe descends gradually, through safe circular orbits, and it does not say where the energy goes or how a real black hole’s surroundings behave.
      </p>
    </div>
  )
}
