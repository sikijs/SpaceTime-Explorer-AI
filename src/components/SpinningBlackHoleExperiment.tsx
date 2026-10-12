import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { BLACK_HOLE_PRESETS, runSpinningBlackHoleExperiment } from '../physics/spinningBlackHoleExperiment'
import type { SpinningBlackHoleResult } from '../physics/spinningBlackHoleExperiment'
import type { ObjectPreset } from '../physics/blackHoleSizeExperiment'

interface SpinningBlackHoleExperimentProps {
  onComplete?: () => void
}

// Fixed real-world playback duration for the whole run, independent of the physics result (CLAUDE.md §11). The black hole
// is "spun up" from 0 to the chosen spin over this time.
const ANIMATION_DURATION_MS = 10_000

const KM_PER_AU = 149_597_870.7

const WITH_COLOR = '#4ade80' // a probe circling with the spin
const AGAINST_COLOR = '#fb7185' // a probe circling against the spin
const REFERENCE_COLOR = '#94a3b8' // the no-spin reference (Experiment 3)
const HORIZON_COLOR = '#e2e8f0'

const SPIN_PRESETS = [0, 0.5, 0.9, 0.99]

// This experiment's four prediction questions, per its specification's "Prediction Activity". Choices are not marked
// here; they are compared with the model's results later (the Results step). Draft wording, for the owner's review
// (CLAUDE.md §28.1). The wording avoids the word "dragging", which would give away the first two answers.
type EdgeChoice = 'closer' | 'same' | 'farther'
const edgeChoices: Array<{ value: EdgeChoice; label: string }> = [
  { value: 'closer', label: 'Closer to the black hole' },
  { value: 'same', label: 'The same place' },
  { value: 'farther', label: 'Farther from the black hole' },
]

type HorizonChoice = 'bigger' | 'same' | 'smaller'
const horizonChoices: Array<{ value: HorizonChoice; label: string }> = [
  { value: 'bigger', label: 'Bigger' },
  { value: 'same', label: 'The same size' },
  { value: 'smaller', label: 'Smaller' },
]

type EnergyChoice = 'with' | 'against' | 'same'
const energyChoices: Array<{ value: EnergyChoice; label: string }> = [
  { value: 'with', label: 'The one circling with the spin' },
  { value: 'against', label: 'The one circling against the spin' },
  { value: 'same', label: 'They give up the same' },
]

// The map (the first picture): seen from above, distances to scale, in reference radii.
const MAP_WIDTH = 700
const MAP_HEIGHT = 540
const MAP_CX = 225
const MAP_CY = 290
const MAP_SCALE = 42 // pixels per reference radius
const MAP_LABEL_X = 466

// The edges graph (the second picture): the spin from 0 to 1 across, distance up, in reference radii.
const EDGES_WIDTH = 700
const EDGES_HEIGHT = 440
const EDGES_LEFT = 84
const EDGES_RIGHT = 500
const EDGES_TOP = 66
const EDGES_BOTTOM = 330
const EDGES_MAX = 5

// The energy picture (the third picture): two bars and a graph, on one shared vertical scale.
const ENERGY_WIDTH = 700
const ENERGY_HEIGHT = 440
const ENERGY_LEFT = 52
const ENERGY_RIGHT = 530
const ENERGY_TOP = 66
const ENERGY_BOTTOM = 330
const ENERGY_MAX = 0.45
const ENERGY_PLOT_LEFT = 250

const CAPTION_STYLE: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const CAPTION_PARAGRAPH_STYLE: CSSProperties = { marginTop: 0, marginBottom: '0.4rem' }
const SVG_STYLE: CSSProperties = {
  display: 'block',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

// A distance in reference radii, to two decimals ("1.16", "0.72").
const formatRadii = (value: number) => value.toFixed(2)

const formatPercent = (fraction: number) => `${(fraction * 100).toFixed(1)}%`

// A length in plain units, from meters to trillions of kilometers.
function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

// Kilometers, with astronomical units added once that is the more natural unit.
function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}

function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

// The point of the curve for the current moment of the playback (the spin rises from 0 to the chosen spin).
function pointAt(result: SpinningBlackHoleResult, progress: number) {
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

// The first picture: a map seen from above, with the horizon and the two last safe orbits.
function SafeOrbitMap({ result, progress }: { result: SpinningBlackHoleResult; progress: number }) {
  const now = pointAt(result, progress)
  const S = MAP_SCALE
  const referenceKm = result.referenceRadiusKm

  // Each label: its color, two lines of text, the ring it points to, and the angle on that ring where its line starts.
  const labels = [
    { color: AGAINST_COLOR, line1: 'last safe orbit, circling', line2: `against the spin: ${formatRadii(now.lastSafeAgainst)}`, r: now.lastSafeAgainst * S, theta: 40 },
    { color: REFERENCE_COLOR, line1: 'last safe orbit with no spin', line2: `(Experiment 3): ${formatRadii(result.noSpinLastSafe)}`, r: result.noSpinLastSafe * S, theta: 28 },
    { color: WITH_COLOR, line1: 'last safe orbit, circling', line2: `with the spin: ${formatRadii(now.lastSafeWith)}`, r: now.lastSafeWith * S, theta: 14 },
    { color: HORIZON_COLOR, line1: 'horizon with no spin', line2: '(the size it would have): 1.00', r: S, theta: -6 },
    { color: HORIZON_COLOR, line1: 'horizon now (the point', line2: `of no return): ${formatRadii(now.horizon)}`, r: now.horizon * S, theta: -32 },
  ]
  const labelYs = spread([150, 205, 260, 315, 370], 52, 120, 420)

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
function EdgesGraph({ result, progress }: { result: SpinningBlackHoleResult; progress: number }) {
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
    { color: REFERENCE_COLOR, text: 'no spin: 3 (Experiment 3)', y: yFor(result.noSpinLastSafe) },
    { color: WITH_COLOR, text: 'circling with the spin', y: yFor(last.lastSafeWith) },
    { color: HORIZON_COLOR, text: 'horizon', y: yFor(last.horizon) },
  ]
  const endYs = spread(ends.map((e) => e.y), 16, EDGES_TOP, EDGES_BOTTOM)

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
          <circle cx={xFor(now.spin)} cy={yFor(now.horizon)} r={5} fill="#ffffff" stroke={HORIZON_COLOR} strokeWidth={2} />
          <circle cx={xFor(now.spin)} cy={yFor(now.lastSafeAgainst)} r={5} fill="#ffffff" stroke={AGAINST_COLOR} strokeWidth={2} />
          <circle cx={xFor(now.spin)} cy={yFor(now.lastSafeWith)} r={5} fill="#ffffff" stroke={WITH_COLOR} strokeWidth={2} />
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

      <circle cx={96} cy={EDGES_HEIGHT - 42} r={5} fill="#ffffff" stroke={HORIZON_COLOR} strokeWidth={2} />
      <text x={108} y={EDGES_HEIGHT - 38} fill="#e2e8f0" fontSize="11">
        where each line is at the spin now
      </text>
      <text x={96} y={EDGES_HEIGHT - 22} fill="#94a3b8" fontSize="10">
        The lines are drawn up to the spin you chose. The dashed line is Experiment 3's last safe orbit,
      </text>
      <text x={96} y={EDGES_HEIGHT - 9} fill="#94a3b8" fontSize="10">
        for a black hole that does not spin.
      </text>
    </svg>
  )
}

// The third picture: the energy given up on the way down, as two bars for now and two curves against the spin, on one
// vertical scale.
function EnergyPicture({ result, progress }: { result: SpinningBlackHoleResult; progress: number }) {
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
    { x: 64, color: WITH_COLOR, fraction: now.energyReleasedWith, line1: 'circling', line2: 'with the spin' },
    { x: 144, color: AGAINST_COLOR, fraction: now.energyReleasedAgainst, line1: 'circling', line2: 'against the spin' },
  ]

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
          <rect x={b.x} y={yFor(b.fraction)} width={50} height={barHeight(b.fraction)} fill={b.color} fillOpacity={0.85} />
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
          <circle cx={xFor(now.spin)} cy={yFor(now.energyReleasedWith)} r={5} fill="#ffffff" stroke={WITH_COLOR} strokeWidth={2} />
          <circle cx={xFor(now.spin)} cy={yFor(now.energyReleasedAgainst)} r={5} fill="#ffffff" stroke={AGAINST_COLOR} strokeWidth={2} />
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

      <text x={ENERGY_LEFT} y={ENERGY_HEIGHT - 8} fill="#94a3b8" fontSize="10">
        The curves are drawn up to the spin you chose. The dashed line is the value with no spin.
      </text>
    </svg>
  )
}

export function SpinningBlackHoleExperiment({ onComplete }: SpinningBlackHoleExperimentProps) {
  const [presetId, setPresetId] = useState<ObjectPreset['id']>('stellar-black-hole')
  const [spin, setSpin] = useState(0.9)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)

  const [withPrediction, setWithPrediction] = useState<EdgeChoice | null>(null)
  const [againstPrediction, setAgainstPrediction] = useState<EdgeChoice | null>(null)
  const [horizonPrediction, setHorizonPrediction] = useState<HorizonChoice | null>(null)
  const [energyPrediction, setEnergyPrediction] = useState<EnergyChoice | null>(null)
  const [submittedWith, setSubmittedWith] = useState<EdgeChoice | null>(null)
  const [submittedAgainst, setSubmittedAgainst] = useState<EdgeChoice | null>(null)
  const [submittedHorizon, setSubmittedHorizon] = useState<HorizonChoice | null>(null)
  const [submittedEnergy, setSubmittedEnergy] = useState<EnergyChoice | null>(null)

  const hasPrediction = withPrediction !== null && againstPrediction !== null && horizonPrediction !== null && energyPrediction !== null
  const hasSubmittedPrediction =
    submittedWith !== null && submittedAgainst !== null && submittedHorizon !== null && submittedEnergy !== null

  const result = useMemo(() => runSpinningBlackHoleExperiment(presetId, spin), [presetId, spin])
  const now = pointAt(result, progress)
  const km = result.referenceRadiusKm

  const handlePresetChange = (id: ObjectPreset['id']) => {
    setPresetId(id)
    setStatus('idle')
    setProgress(0)
  }

  const handleSpinChange = (value: number) => {
    setSpin(value)
    setStatus('idle')
    setProgress(0)
  }

  const handleRun = () => {
    if (!hasPrediction || status === 'running') return
    if (!hasSubmittedPrediction) {
      setSubmittedWith(withPrediction)
      setSubmittedAgainst(againstPrediction)
      setSubmittedHorizon(horizonPrediction)
      setSubmittedEnergy(energyPrediction)
    }
    setStatus('running')
    setProgress(0)
  }

  // Matches the rest of the project's precedent: re-opens all four questions for editing without resetting the chosen
  // black hole or spin.
  const handleChangePrediction = () => {
    setSubmittedWith(null)
    setSubmittedAgainst(null)
    setSubmittedHorizon(null)
    setSubmittedEnergy(null)
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
      <h2>Experiment 8 — Spinning Black Holes: Does Spin Change Where Orbits Are Safe?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Suppose the black hole spins and a probe circles the same way as the spin. Compared with a black hole that does
            not spin (where the last safe orbit is at 3 horizon radii), where do you think the last safe orbit is?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {edgeChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setWithPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${withPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Now the probe circles against the spin. Where do you think the last safe orbit is, compared with no spin?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {edgeChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setAgainstPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${againstPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            As the black hole spins faster, does its horizon (the point of no return) get bigger, stay the same size, or get
            smaller?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {horizonChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setHorizonPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${horizonPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            A probe slowly spirals down to its last safe orbit, giving up some of its energy on the way. Which probe do you
            think gives up more, when the black hole spins fast?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {energyChoices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                onClick={() => setEnergyPrediction(choice.value)}
                disabled={hasSubmittedPrediction}
                className={`toggle-button${energyPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || hasSubmittedPrediction
              ? `Your predictions: ${edgeChoices.find((c) => c.value === (withPrediction ?? submittedWith))!.label}; ${
                  edgeChoices.find((c) => c.value === (againstPrediction ?? submittedAgainst))!.label
                }; ${horizonChoices.find((c) => c.value === (horizonPrediction ?? submittedHorizon))!.label}; ${
                  energyChoices.find((c) => c.value === (energyPrediction ?? submittedEnergy))!.label
                }`
              : 'Answer all four questions to continue'}
          </p>
        </div>

        {hasSubmittedPrediction && (
          <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Your predictions are locked in above. You can still try as many black holes and spins as you like below. Or,
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
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Black hole:</p>
          {BLACK_HOLE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePresetChange(p.id)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${presetId === p.id ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Spin the black hole up to this spin (0 is not spinning; the fastest possible spin is 1, which no black hole quite
            reaches):
          </p>
          {SPIN_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSpinChange(s)}
              disabled={!hasPrediction || status === 'running'}
              className={`toggle-button${spin === s ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
            >
              {s}
            </button>
          ))}
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

        {/* Shown only once the current settings have been run: changing the black hole or the spin returns to idle and hides it again. */}
        {hasSubmittedPrediction && status !== 'idle' && (
          <>
            <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {result.preset.label}: {formatMass(result.preset.massSolarMasses)}. One reference radius (the horizon radius it
              would have with no spin) is {formatDistance(km)}.
              <br />
              Spin now {now.spin.toFixed(2)}, of {result.spin} chosen. Horizon {formatRadii(now.horizon)} reference radii (
              {formatDistance(now.horizon * km)}). Last safe orbit circling with the spin {formatRadii(now.lastSafeWith)} (
              {formatDistance(now.lastSafeWith * km)}), against the spin {formatRadii(now.lastSafeAgainst)} (
              {formatDistance(now.lastSafeAgainst * km)}). Energy given up on the way down: {formatPercent(now.energyReleasedWith)} with
              the spin, {formatPercent(now.energyReleasedAgainst)} against it.
            </p>

            <SafeOrbitMap result={result} progress={progress} />
            {/* Draft wording, for the owner's review (CLAUDE.md §28.1). */}
            <div style={{ ...CAPTION_STYLE, maxWidth: `${MAP_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this picture: the map.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> You are looking down on the black hole from above. The black disk in the
                middle is the black hole's horizon, the point of no return. The rings are the last safe circular orbit, the
                closest circle a small probe can follow without a tiny nudge sending it spiraling in (you met it in Experiment
                3). The green ring is for a probe circling the same way the black hole spins, and the rose ring is for a probe
                circling the opposite way. The dashed grey ring is where that edge was in Experiment 3, for a black hole that
                does not spin.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. The units.</strong> Every distance is measured from the center, in reference radii. One reference
                radius is the horizon radius the same black hole would have if it did not spin (the scale bar at the bottom
                shows its length). Using it lets you compare the same black hole at different spins. The spin is a number from
                0 (not spinning) up toward 1, the fastest possible.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>3. What is really happening.</strong> The formulas for a spinning black hole, which are given and not
                derived here, say where the horizon and the two safe-orbit edges are for each spin. The picture draws what they
                give. Why the direction of the circling matters is not shown here.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>4. How the picture shows it.</strong> When you press Run, the black hole is spun up from 0 to the spin
                you chose. Watch each ring and the black disk: the dotted white ring is the horizon with no spin, so you can see
                how much the real horizon has shrunk. Each ring is joined by a thin line to a label that gives its distance.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> This is a map of where the edges are, not a path. It does not show a probe moving,
                and it follows probes circling in the flat sheet through the black hole's equator only.
              </p>
            </div>

            <EdgesGraph result={result} progress={progress} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${EDGES_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this graph: how the edges move as the spin grows.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> Across the bottom is the spin, from 0 (not spinning) to 1. Up the side is the
                distance from the center, in reference radii. The white line is the horizon, the green line is the last safe
                orbit for a probe circling with the spin, and the rose line is the last safe orbit for a probe circling against
                it. The dashed grey line is the 3 of Experiment 3, for no spin. The lines are drawn up to the spin you chose,
                and each dot is where that line is at the spin now.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. What is really happening.</strong> At each spin, the three lines show the horizon and the two edges
                that the formulas for a spinning black hole give (given, not derived here).
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>3. How the picture shows it.</strong> At spin 0 the green and rose lines start together on the dashed
                line, because the direction does not matter when nothing spins. As the spin grows they separate, one going down
                and the other going up, and the white line (the horizon) also goes down.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> The lines show where the edges are, not how a probe gets there.
              </p>
            </div>

            <EnergyPicture result={result} progress={progress} />
            <div style={{ ...CAPTION_STYLE, maxWidth: `${ENERGY_WIDTH}px` }}>
              <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
                <strong>How to read this picture: energy released on the way down.</strong>
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>1. What is drawn.</strong> A probe has an energy stored in its mass (its rest-mass energy). Imagine a
                probe that slowly spirals in from far away down to the last safe orbit. On the way it gives up some of that
                energy. The vertical scale is the share it gives up, as a percentage. The two bars on the left are for the spin
                now, and the two curves on the right show the same two shares for every spin. Green is a probe circling with the
                spin, rose is a probe circling against it, and the dashed grey line is the value with no spin.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>2. What is really happening.</strong> The formulas for a spinning black hole (given, not derived here)
                give the energy of a circular orbit at each distance. The share given up is what is lost between far away and
                the last safe orbit. Where that energy goes is not shown.
              </p>
              <p style={CAPTION_PARAGRAPH_STYLE}>
                <strong>3. How the picture shows it.</strong> Compare each bar with the dashed line, and watch how each bar and
                each dot move as the spin grows. Then compare the energy with where the matching ring was on the map.
              </p>
              <p style={{ margin: 0 }}>
                <strong>A limit.</strong> This assumes the probe descends gradually, through safe circular orbits, and it does
                not say where the energy goes or how a real black hole's surroundings behave.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
