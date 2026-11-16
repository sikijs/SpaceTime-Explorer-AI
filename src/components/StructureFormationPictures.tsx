import {
  CLUMP_THRESHOLD,
  GROWTH_AXIS_MAX,
  GROWTH_AXIS_MIN,
  MAX_START_DELTA,
  MIN_START_DELTA,
  captionNumbers,
  growthCurve,
  growthGuessMark,
  headStartGuessMarker,
  runStructureFormationExperiment,
  startFacts,
} from '../physics/structureFormationExperiment'
import type { GrowthGuess, HeadStartGuess, KindOfMatter, StructureFormationResult } from '../physics/structureFormationExperiment'
import { TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 9, audited to the newer rules (docs/audit/cosmology/09-draft-wording.md, approved by the owner on 2026-11-15).
// Four pictures, each with its own caption: Picture 1 (the growth graph, Part 1: fixed on both kinds of matter, no starting size) and, in
// Part 2, Picture 2 (the strip), Picture 3 (your ripple's density excess) and Picture 4 (how big must a ripple start). Every number (a
// growth, the place of a guess mark) comes from the physics module; this file only draws and words it (CLAUDE.md §9). White is only ever
// the learner's guess (§14). The guess marks are drawn only once the run has finished (§12).

export const GUESS_COLOR = '#ffffff'
export const ORDINARY_COLOR = '#fbbf24' // amber: ordinary matter
export const DARK_COLOR = '#a78bfa' // violet: ordinary plus dark matter
export const NO_DARK_ENERGY_COLOR = '#dc2626' // red, dashed (readable on the dark picture and the light page): growth with no dark energy
export const CLUMP_COLOR = '#4ade80' // green: the clump line and the (schematic) glow
export const YOUR_COLOR = YOURS_COLOR // pink: the learner's own settings (Part 2)

export const GROWTH_GUESS_TEXT: Record<GrowthGuess, string> = { ten: 'about 10 times', thousand: 'about 1,000 times', million: 'about a million times' }
export const HEAD_START_GUESS_TEXT: Record<HeadStartGuess, string> = { none: 'no difference', small: 'a small difference', decides: 'it would decide the outcome' }
const HEAD_START_BOX_TEXT: Record<HeadStartGuess, string> = { none: 'no difference', small: 'a small difference', decides: 'it would decide' }
const GROWTH_BOX_TEXT: Record<GrowthGuess, string> = { ten: 'about 10 times', thousand: 'about 1,000 times', million: 'about a million times' }

export const kindLabels: Record<KindOfMatter, string> = { ordinary: 'Ordinary matter only', 'ordinary-plus-dark': 'Ordinary plus dark matter' }
export const kindColor = (kind: KindOfMatter) => (kind === 'ordinary' ? ORDINARY_COLOR : DARK_COLOR)

// "1 part in 850", rounded sensibly.
export function partsInLabel(delta: number): string {
  const parts = 1 / delta
  const rounded = parts >= 1000 ? Math.round(parts / 10) * 10 : Math.round(parts)
  return `1 part in ${rounded.toLocaleString('en-US')}`
}
export function yearsLabel(years: number): string {
  if (years >= 1e9) return `${(years / 1e9).toFixed(2)} billion years`
  if (years >= 1e6) return `${(years / 1e6).toFixed(1)} million years`
  return `${Math.round(years / 1000).toLocaleString('en-US')} thousand years`
}
export function redshiftLabel(redshift: number): string {
  if (redshift >= 100) return Math.round(redshift).toLocaleString('en-US')
  return redshift >= 10 ? redshift.toFixed(1) : redshift.toFixed(2)
}
const whole = (n: number) => Math.round(n).toLocaleString('en-US')

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

// ---- Shared geometry: time since the Big Bang on a logarithmic axis ----
const TIME_MIN_YEARS = 1e4
const TIME_MAX_YEARS = 2e10
const timeTicks = [1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10]
const timeTickLabels = ['10 thousand', '100 thousand', '1 million', '10 million', '100 million', '1 billion', '10 billion']
const growthTicks = [1, 10, 100, 1000]

// ---- Picture 1: the growth graph (Part 1). A wide right margin holds the YOUR GUESS boxes. ----
const G_WIDTH = 660
const G_HEIGHT = 320
const G_LEFT = 62
const G_RIGHT = 470
const G_TOP = 50
const G_BOTTOM = G_HEIGHT - 58
const BOX_X = 500
const BOX_W = 150
const gTimeX = (years: number) => G_LEFT + (Math.log10(Math.max(years, TIME_MIN_YEARS) / TIME_MIN_YEARS) / Math.log10(TIME_MAX_YEARS / TIME_MIN_YEARS)) * (G_RIGHT - G_LEFT)
const gGrowthY = (growth: number) => G_BOTTOM - (Math.log10(Math.max(growth, GROWTH_AXIS_MIN) / GROWTH_AXIS_MIN) / Math.log10(GROWTH_AXIS_MAX / GROWTH_AXIS_MIN)) * (G_BOTTOM - G_TOP)
const PX_PER_DECADE = (G_BOTTOM - G_TOP) / Math.log10(GROWTH_AXIS_MAX / GROWTH_AXIS_MIN)

// The part of a curve drawn so far (0 = the start, 1 = today): the points up to the progress, then the interpolated tip.
function drawnSoFar<T extends { yearsAfterBigBang: number }>(points: T[], progress: number, value: (p: T) => number) {
  const position = Math.min(Math.max(progress, 0), 1) * (points.length - 1)
  const low = Math.floor(position)
  const t = position - low
  const high = Math.min(low + 1, points.length - 1)
  const tip = {
    years: points[low].yearsAfterBigBang + (points[high].yearsAfterBigBang - points[low].yearsAfterBigBang) * t,
    value: value(points[low]) + (value(points[high]) - value(points[low])) * t,
  }
  const drawn = points.slice(0, low + 1).map((p) => ({ years: p.yearsAfterBigBang, value: value(p) }))
  drawn.push(tip)
  return { drawn, tip }
}

export interface GrowthGraphProps {
  // 0 to 1: how far the run has gone (the lines draw from their starts toward today)
  progress: number
  // true once the run has ended: the end labels and the white marks are drawn then and not before
  finished: boolean
  guesses: { growth: GrowthGuess; headStart: HeadStartGuess } | null
}

export function GrowthGraph({ progress, finished, guesses }: GrowthGraphProps) {
  const ordinary = growthCurve('ordinary')
  const dark = growthCurve('ordinary-plus-dark')
  const o = startFacts('ordinary')
  const d = startFacts('ordinary-plus-dark')
  const lines = [
    { points: ordinary, color: ORDINARY_COLOR, value: (p: (typeof ordinary)[number]) => p.growth, dashed: false },
    { points: dark, color: DARK_COLOR, value: (p: (typeof dark)[number]) => p.growth, dashed: false },
  ]
  const dashed = [
    { points: ordinary, value: (p: (typeof ordinary)[number]) => p.growthWithoutDarkEnergy },
    { points: dark, value: (p: (typeof dark)[number]) => p.growthWithoutDarkEnergy },
  ]
  const poly = (drawn: Array<{ years: number; value: number }>) => drawn.map((p) => `${gTimeX(p.years)},${gGrowthY(p.value)}`).join(' ')
  const growthMark = finished && guesses ? growthGuessMark(guesses.growth) : null
  const headMarker = finished && guesses ? headStartGuessMarker(guesses.headStart) : null
  const amberEndY = gGrowthY(o.growthSinceStart)
  const BOX1_Y = G_TOP + 4
  const BOX2_Y = 128
  return (
    <svg width={G_WIDTH} height={G_HEIGHT} viewBox={`0 0 ${G_WIDTH} ${G_HEIGHT}`} style={svgStyle} role="img" aria-label="How many times a ripple grows, for ordinary matter and for ordinary plus dark matter">
      <text x={(G_LEFT + G_RIGHT) / 2} y={18} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        How many times a ripple grows
      </text>
      <line x1={G_LEFT} y1={G_TOP} x2={G_LEFT} y2={G_BOTTOM} stroke="#64748b" />
      <line x1={G_LEFT} y1={G_BOTTOM} x2={G_RIGHT} y2={G_BOTTOM} stroke="#64748b" />
      {timeTicks.map((t, i) => (
        <g key={t}>
          <line x1={gTimeX(t)} y1={G_BOTTOM} x2={gTimeX(t)} y2={G_BOTTOM + 4} stroke="#64748b" />
          <text x={gTimeX(t)} y={G_BOTTOM + 16} fill="#cbd5e1" fontSize="9" textAnchor="middle">
            {timeTickLabels[i]}
          </text>
        </g>
      ))}
      {growthTicks.map((g) => (
        <g key={g}>
          <line x1={G_LEFT - 4} y1={gGrowthY(g)} x2={G_LEFT} y2={gGrowthY(g)} stroke="#64748b" />
          <text x={G_LEFT - 8} y={gGrowthY(g) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
            {g.toLocaleString('en-US')}
          </text>
        </g>
      ))}
      <text x={(G_LEFT + G_RIGHT) / 2} y={G_HEIGHT - 28} fill="#cbd5e1" fontSize="11" textAnchor="middle">
        Time since the Big Bang (years; each tick is ten times the one before)
      </text>
      <text x={(G_LEFT + G_RIGHT) / 2} y={G_HEIGHT - 12} fill="#94a3b8" fontSize="10" textAnchor="middle">
        (the model leaves out light, so the earliest times are approximate)
      </text>
      <text x={14} y={(G_TOP + G_BOTTOM) / 2} fill="#cbd5e1" fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(G_TOP + G_BOTTOM) / 2})`}>
        Times grown since its start
      </text>

      {dashed.map((l, i) => (
        <polyline key={`dashed-${i}`} points={poly(drawnSoFar(l.points, progress, l.value).drawn)} fill="none" stroke={NO_DARK_ENERGY_COLOR} strokeWidth={2} strokeDasharray="4 4" />
      ))}
      {lines.map((l) => (
        <polyline key={l.color} points={poly(drawnSoFar(l.points, progress, l.value).drawn)} fill="none" stroke={l.color} strokeWidth={2.5} />
      ))}
      {lines.map((l) => {
        const { tip } = drawnSoFar(l.points, progress, l.value)
        return <circle key={`dot-${l.color}`} cx={gTimeX(tip.years)} cy={gGrowthY(tip.value)} r={5} fill={l.color} stroke="#0b1020" strokeWidth={2} />
      })}

      {/* The numbers at the end of each line, once the run has ended */}
      {finished && (
        <g>
          <text x={G_LEFT + 14} y={G_TOP + 16} fill={DARK_COLOR} fontSize="10" fontWeight="600" {...halo}>
            With dark matter: about {whole(d.growthSinceStart)} times
          </text>
          <text x={G_LEFT + 14} y={G_TOP + 32} fill={ORDINARY_COLOR} fontSize="10" fontWeight="600" {...halo}>
            Ordinary matter: about {whole(o.growthSinceStart)} times
          </text>
          <text x={G_LEFT + 14} y={G_TOP + 48} fill={NO_DARK_ENERGY_COLOR} fontSize="10" fontWeight="600" {...halo}>
            Dashed, without dark energy: about {whole(o.growthWithoutDarkEnergy)} and {whole(d.growthWithoutDarkEnergy)} times
          </text>
        </g>
      )}

      {/* Guess 1: a white tick at the guessed height at the "today" end; a million is off the top, so only an arrow */}
      {growthMark && guesses && (
        <g>
          {growthMark.kind === 'tick' ? (
            <>
              <line x1={G_RIGHT - 38} y1={gGrowthY(growthMark.atTimesGrown)} x2={G_RIGHT + 8} y2={gGrowthY(growthMark.atTimesGrown)} stroke={GUESS_COLOR} strokeWidth={3.5} />
              <line x1={G_RIGHT + 8} y1={gGrowthY(growthMark.atTimesGrown)} x2={BOX_X} y2={BOX1_Y + 16} stroke={GUESS_COLOR} strokeWidth={1.5} />
            </>
          ) : (
            <>
              <line x1={G_RIGHT - 14} y1={G_TOP + 26} x2={G_RIGHT - 14} y2={G_TOP + 4} stroke={GUESS_COLOR} strokeWidth={3.5} />
              <polygon points={`${G_RIGHT - 14},${G_TOP - 4} ${G_RIGHT - 20},${G_TOP + 6} ${G_RIGHT - 8},${G_TOP + 6}`} fill={GUESS_COLOR} />
              <text x={G_RIGHT - 24} y={G_TOP - 4} fill={GUESS_COLOR} fontSize="10" fontWeight="600" textAnchor="end" {...halo}>
                off this scale: about a million
              </text>
              <line x1={G_RIGHT - 8} y1={G_TOP + 6} x2={BOX_X} y2={BOX1_Y + 16} stroke={GUESS_COLOR} strokeWidth={1.5} />
            </>
          )}
          <GuessBox x={BOX_X} y={BOX1_Y} width={BOX_W} line={GROWTH_BOX_TEXT[guesses.growth]} />
        </g>
      )}

      {/* Guess 2 (marker only): a ring or an arrow on the amber line's end, pointing toward the violet line's end */}
      {headMarker && guesses && (
        <g>
          {headMarker.kind === 'ring' ? (
            <circle cx={G_RIGHT} cy={amberEndY} r={9} fill="none" stroke={GUESS_COLOR} strokeWidth={3.5} />
          ) : (
            <>
              <line x1={G_RIGHT} y1={amberEndY} x2={G_RIGHT} y2={amberEndY - headMarker.lengthDecades * PX_PER_DECADE} stroke={GUESS_COLOR} strokeWidth={3.5} />
              <polygon
                points={`${G_RIGHT},${amberEndY - headMarker.lengthDecades * PX_PER_DECADE - 8} ${G_RIGHT - 6},${amberEndY - headMarker.lengthDecades * PX_PER_DECADE + 2} ${G_RIGHT + 6},${amberEndY - headMarker.lengthDecades * PX_PER_DECADE + 2}`}
                fill={GUESS_COLOR}
              />
            </>
          )}
          <line x1={G_RIGHT + 9} y1={amberEndY} x2={BOX_X} y2={BOX2_Y + 16} stroke={GUESS_COLOR} strokeWidth={1.5} />
          <GuessBox x={BOX_X} y={BOX2_Y} width={BOX_W} line={HEAD_START_BOX_TEXT[guesses.headStart]} />
        </g>
      )}
    </svg>
  )
}

// ---- Part 2 pictures. These follow the learner's two controls; each has a pink frame. ----
const yourFrame = { ...svgStyle, border: `2px solid ${YOUR_COLOR}` }

// Picture 2: the strip. A fixed patch of matter followed as space stretches, drawn to the model's true density excess, with no exaggeration.
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

// Position of each particle: those near the centre are pulled in as the density excess grows. A one-dimensional shift chosen so the
// centre's density is exactly (1 + density excess) times the average.
export function particleX(index: number, densityExcess: number): number {
  const q = (index + 0.5) / PARTICLE_COUNT - 0.5
  const shift = densityExcess / (1 + densityExcess)
  const x = q - (shift * Math.sin(2 * Math.PI * q)) / (2 * Math.PI)
  return STRIP_LEFT + (x + 0.5) * (STRIP_RIGHT - STRIP_LEFT)
}

// The point on a result's curve at a fraction (0 = the start, 1 = today), interpolated between samples.
export function curveAt(result: StructureFormationResult, fraction: number) {
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

export function StripPicture({ kind, startDelta, progress }: { kind: KindOfMatter; startDelta: number; progress: number }) {
  const result = runStructureFormationExperiment(kind, startDelta)
  const now = curveAt(result, progress)
  const hasClumped = now.densityExcess >= CLUMP_THRESHOLD
  const shownExcess = Math.min(now.densityExcess, CLUMP_THRESHOLD)
  const sizeFactor = (1 + result.startRedshift) / (1 + now.redshift)
  const patch = kindColor(kind)
  const cx = (STRIP_LEFT + STRIP_RIGHT) / 2
  return (
    <svg width={STRIP_WIDTH} height={STRIP_HEIGHT} viewBox={`0 0 ${STRIP_WIDTH} ${STRIP_HEIGHT}`} style={yourFrame} role="img" aria-label="A strip of the early universe with a slightly denser region at its centre">
      <text x={STRIP_WIDTH / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Your region, growing (drawn to the model&apos;s true density excess)
      </text>
      {hasClumped && <ellipse cx={cx} cy={(STRIP_TOP + STRIP_BOTTOM) / 2} rx={60} ry={46} fill={CLUMP_COLOR} opacity={0.22} />}
      <rect x={STRIP_LEFT} y={STRIP_TOP} width={STRIP_RIGHT - STRIP_LEFT} height={STRIP_BOTTOM - STRIP_TOP} fill="none" stroke="#334155" />
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
      <line x1={cx} y1={STRIP_BOTTOM + 4} x2={cx} y2={STRIP_BOTTOM + 22} stroke={patch} />
      <text x={cx} y={STRIP_BOTTOM + 36} fill={patch} fontSize="11" fontWeight="600" textAnchor="middle">
        The slightly denser region (the centre)
      </text>
      <text x={STRIP_LEFT} y={STRIP_TOP - 10} fill="#cbd5e1" fontSize="10">
        A strip of the early universe: each dot is a bit of matter
      </text>
      {hasClumped && (
        <text x={cx} y={STRIP_TOP - 28} fill={CLUMP_COLOR} fontSize="10" fontWeight="600" textAnchor="middle">
          A clump has formed. A galaxy would grow here in the real universe (the glow is schematic; not computed)
        </text>
      )}
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
  )
}

// Picture 3: your ripple's density excess against time, with the clump line.
const E_WIDTH = 520
const E_HEIGHT = 310
const E_LEFT = 62
const E_RIGHT = E_WIDTH - 20
const E_TOP = 44
const E_BOTTOM = E_HEIGHT - 56
const EXCESS_MIN = 1e-5
const EXCESS_MAX = 10
const excessTicks = [1e-5, 1e-4, 1e-3, 1e-2, 1e-1, 1]
const excessTickLabels = ['0.00001', '0.0001', '0.001', '0.01', '0.1', '1']
const eTimeX = (years: number) => E_LEFT + (Math.log10(Math.max(years, TIME_MIN_YEARS) / TIME_MIN_YEARS) / Math.log10(TIME_MAX_YEARS / TIME_MIN_YEARS)) * (E_RIGHT - E_LEFT)
const eY = (value: number) => E_BOTTOM - (Math.log10(value / EXCESS_MIN) / Math.log10(EXCESS_MAX / EXCESS_MIN)) * (E_BOTTOM - E_TOP)

export function ExcessGraph({ kind, startDelta, progress }: { kind: KindOfMatter; startDelta: number; progress: number }) {
  const result = runStructureFormationExperiment(kind, startDelta)
  const now = curveAt(result, progress)
  const patch = kindColor(kind)
  const firstClump = result.curve.findIndex((p) => p.densityExcess >= CLUMP_THRESHOLD)
  const pointCount = firstClump === -1 ? result.curve.length : firstClump + 1
  const points = result.curve
    .slice(0, pointCount)
    .map((p) => `${eTimeX(p.yearsAfterBigBang)},${eY(Math.min(p.densityExcess, CLUMP_THRESHOLD))}`)
    .join(' ')
  return (
    <svg width={E_WIDTH} height={E_HEIGHT} viewBox={`0 0 ${E_WIDTH} ${E_HEIGHT}`} style={yourFrame} role="img" aria-label="Your ripple: how much denser than average, against time">
      <text x={E_WIDTH / 2} y={18} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Your ripple: how much denser than average
      </text>
      <line x1={E_LEFT} y1={E_TOP} x2={E_LEFT} y2={E_BOTTOM} stroke="#64748b" />
      <line x1={E_LEFT} y1={E_BOTTOM} x2={E_RIGHT} y2={E_BOTTOM} stroke="#64748b" />
      {timeTicks.map((t, i) => (
        <g key={t}>
          <line x1={eTimeX(t)} y1={E_BOTTOM} x2={eTimeX(t)} y2={E_BOTTOM + 4} stroke="#64748b" />
          <text x={eTimeX(t)} y={E_BOTTOM + 16} fill="#cbd5e1" fontSize="9" textAnchor="middle">
            {timeTickLabels[i]}
          </text>
        </g>
      ))}
      {excessTicks.map((d, i) => (
        <g key={d}>
          <line x1={E_LEFT - 4} y1={eY(d)} x2={E_LEFT} y2={eY(d)} stroke="#64748b" />
          <text x={E_LEFT - 8} y={eY(d) + 4} fill="#cbd5e1" fontSize="10" textAnchor="end">
            {excessTickLabels[i]}
          </text>
        </g>
      ))}
      <text x={(E_LEFT + E_RIGHT) / 2} y={E_HEIGHT - 28} fill="#cbd5e1" fontSize="11" textAnchor="middle">
        Time since the Big Bang (years; each tick is ten times the one before)
      </text>
      <text x={14} y={(E_TOP + E_BOTTOM) / 2} fill="#cbd5e1" fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(E_TOP + E_BOTTOM) / 2})`}>
        Density excess (0.1 = 10% denser)
      </text>
      <line x1={E_LEFT} y1={eY(CLUMP_THRESHOLD)} x2={E_RIGHT} y2={eY(CLUMP_THRESHOLD)} stroke={CLUMP_COLOR} strokeDasharray="5 4" />
      <text x={E_LEFT + 8} y={eY(CLUMP_THRESHOLD) - 6} fill={CLUMP_COLOR} fontSize="10" fontWeight="600">
        Becomes a clump (the model stops following it here)
      </text>
      <polyline points={points} fill="none" stroke={patch} strokeWidth={2.5} />
      <text x={E_RIGHT} y={E_BOTTOM - 8} fill={patch} fontSize="10" fontWeight="600" textAnchor="end">
        {kindLabels[kind]}
      </text>
      <circle cx={eTimeX(now.yearsAfterBigBang)} cy={eY(Math.max(Math.min(now.densityExcess, CLUMP_THRESHOLD), EXCESS_MIN))} r={5} fill={patch} stroke="#0b1020" strokeWidth={2} />
    </svg>
  )
}

// Picture 4: how big must a ripple start to become a clump by today? (The learner's own size is the pink dot.)
const N_WIDTH = 560
const N_HEIGHT = 250
const N_LEFT = 50
const N_RIGHT = N_WIDTH - 30
const needX = (delta: number) => N_LEFT + (Math.log10(delta / 1e-5) / Math.log10(1e-2 / 1e-5)) * (N_RIGHT - N_LEFT)

export function NeededSizePicture({ startDelta }: { startDelta: number }) {
  const o = startFacts('ordinary')
  const d = startFacts('ordinary-plus-dark')
  const rows = [
    { label: "The oldest light's temperature ripple (not a density excess)", delta: MIN_START_DELTA, color: NO_DARK_ENERGY_COLOR, y: 70 },
    { label: 'Needed to become a clump: ordinary matter', delta: o.requiredStartDelta, color: ORDINARY_COLOR, y: 112 },
    { label: 'Needed to become a clump: with dark matter', delta: d.requiredStartDelta, color: DARK_COLOR, y: 154 },
    { label: 'Your starting size', delta: startDelta, color: YOUR_COLOR, y: 196 },
  ]
  return (
    <svg width={N_WIDTH} height={N_HEIGHT} viewBox={`0 0 ${N_WIDTH} ${N_HEIGHT}`} style={yourFrame} role="img" aria-label="How big must a ripple start to become a clump by today">
      <text x={N_WIDTH / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        How big must a ripple start to become a clump by today?
      </text>
      {rows.map((row) => (
        <g key={row.label}>
          <text x={N_LEFT} y={row.y - 14} fill={row.color} fontSize="10" fontWeight="600">
            {row.label}: {partsInLabel(row.delta)}
          </text>
          <line x1={N_LEFT} y1={row.y} x2={N_RIGHT} y2={row.y} stroke="#334155" />
          <circle cx={needX(row.delta)} cy={row.y} r={6} fill={row.color} stroke="#0b1020" strokeWidth={2} />
        </g>
      ))}
      {[1e-5, 1e-4, 1e-3, 1e-2].map((x) => (
        <g key={x}>
          <line x1={needX(x)} y1={216} x2={needX(x)} y2={220} stroke="#64748b" />
          <text x={needX(x)} y={232} fill="#cbd5e1" fontSize="10" textAnchor="middle">
            {x}
          </text>
        </g>
      ))}
      <line x1={N_LEFT} y1={216} x2={N_RIGHT} y2={216} stroke="#64748b" />
      <text x={N_WIDTH - 10} y={N_HEIGHT - 4} fill="#94a3b8" fontSize="9" textAnchor="end">
        Density excess (each tick is ten times the one before)
      </text>
    </svg>
  )
}

// ---- Captions (the owner's approved wording: docs/audit/cosmology/09-draft-wording.md, sections 3 and 4) ----
export function Part1GrowthCaption({ arrived }: { arrived: boolean }) {
  const n = captionNumbers()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the growth graph, how many times a ripple grows.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          Along the bottom is <strong>time since the Big Bang</strong>, from 10 thousand years to 10 billion years. Each tick is ten times the one before, so the early times are not squashed into the corner. Up the side is <strong>how many times a region&rsquo;s density excess has grown</strong> since it started. Each tick is again ten times the one before (1, 10, 100, 1,000).
        </li>
        <li>
          The <strong style={{ color: ORDINARY_COLOR }}>amber line</strong> is ordinary matter alone. In this model it starts growing when the oldest light was released, about <strong>{n.ordinaryStartThousandYears} thousand years</strong> after the Big Bang (this model leaves out light, so the real figure is about 380 thousand, as in Cosmology 3). The <strong style={{ color: DARK_COLOR }}>violet line</strong> is ordinary plus dark matter. In this model it starts earlier, about <strong>{n.darkStartThousandYears} thousand years</strong> after the Big Bang. The graph does not depend on how big you choose the starting ripple.
        </li>
        <li>
          The two <strong style={{ color: NO_DARK_ENERGY_COLOR }}>red dashed lines</strong> show the same growth with <strong>no dark energy at all</strong>, one for each start. They lie just above their solid lines at the end.
        </li>
        <li>
          When you press <strong>Run</strong>, watch for about 9 seconds. The lines draw from their starts, and a dot rides on each. The motion is drawn to help you notice the growth; it is not a movie of real history, but the numbers at the end are exact.
        </li>
        {arrived && (
          <>
            <li>
              <strong>A worked moment.</strong> Growth is how many times bigger the density excess has become. A region that starts 1 part in 1,000 denser and grows 100 times ends 1 part in 10 denser.
            </li>
            <li>
              <strong>The white marks are only markers where a guess has no size.</strong> Guess 1&rsquo;s ticks at 10 and 1,000 are at their true heights, and the arrow for &ldquo;about a million&rdquo; means only &ldquo;off the top of the graph&rdquo;. Guess 2&rsquo;s ring and arrows have fixed lengths that mean nothing as numbers. Each mark sits in a box labelled YOUR GUESS. None of them says right or wrong.
            </li>
          </>
        )}
      </ul>
      {arrived && (
        <LookFor
          items={[
            {
              look: 'the end of the amber line',
              means: `a region of ordinary matter has grown about ${whole(n.ordinaryGrowth)} times between the oldest light's release and today.`,
              matters: 'this is the number your first guess was about.',
            },
            {
              look: 'the end of the violet line, against the amber line',
              means: `with the earlier start the growth is about ${whole(n.darkGrowth)} times, ${n.headStartFactor.toFixed(1)} times the amber line's.`,
              matters: 'this is the comparison your second guess was about.',
            },
            {
              look: 'each dashed line, against its solid line',
              means: `with no dark energy the growth would be ${whole(n.ordinaryWithoutDarkEnergy)} and ${whole(n.darkWithoutDarkEnergy)}, about ${Math.round(n.lostToDarkEnergyPercent / (1 - n.lostToDarkEnergyPercent / 100))} percent more than the solid lines.`,
              matters: 'it shows that dark energy takes some of the growth away; why is for the tutor.',
            },
            {
              look: 'the white marks',
              means: 'each shows what you guessed, beside the real lines.',
              matters: 'you can compare at a glance; the tutor goes through each guess.',
            },
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function StripCaption() {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: the strip.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          A long, thin slice of the early universe. Each dot is a small bit of matter. <strong style={{ color: ORDINARY_COLOR }}>Amber dots</strong> are ordinary matter and <strong style={{ color: DARK_COLOR }}>violet dots</strong> are dark matter (shown only for &ldquo;ordinary plus dark matter&rdquo;; the split is not to scale with the real proportions). The middle is the slightly denser region.
        </li>
        <li>
          As the ripple grows, dots drift toward the middle and crowd together. The crowding is drawn at the model&rsquo;s true density excess, with nothing exaggerated, so a tiny ripple such as 1 part in 100,000 really does look almost perfectly smooth even after it has grown thousands of times. That is not a mistake in the picture: it is how small the ripple still is.
        </li>
        <li>
          The picture follows one fixed patch of matter, so the dots keep their place on the screen while the space between them stretches. The label says by how much: when it says &ldquo;stretched 3,401 times&rdquo;, every distance in the real universe has grown 3,401 times since the start.
        </li>
        <li>
          <strong style={{ color: CLUMP_COLOR }}>The green glow</strong>, if your ripple reaches a density excess of 1, is only an illustration of a clump. The model does not compute what the clump looks like; it only tells you <em>when</em> the region would become one.
        </li>
      </ul>
      <LookFor
        items={[
          {
            look: 'the dots as the run goes on',
            means: 'they drift toward the middle by an amount set by your ripple’s density excess.',
            matters: 'it shows what a growing ripple does to the matter around it.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export function ExcessCaption({ kind, startDelta }: { kind: KindOfMatter; startDelta: number }) {
  const r = runStructureFormationExperiment(kind, startDelta)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: your ripple.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          The density excess of the starting size you chose ({partsInLabel(startDelta)}), against the same time axis as Picture 1. Up the side, each tick is ten times the one before, from 0.00001 (1 part in 100,000) to 1 (twice the average).
        </li>
        <li>
          The <strong style={{ color: CLUMP_COLOR }}>green dashed line</strong> marks a density excess of 1. A ripple that reaches it has become a clump, and the model stops following it there, because the simple description of a slightly denser region no longer applies once it is that dense.
        </li>
      </ul>
      <LookFor
        items={[
          {
            look: 'your line, against the green dashed line',
            means: r.becameClump
              ? `your ripple reached a density excess of 1 or more, so it became a clump, at a time when the redshift was about ${redshiftLabel(r.redshiftOfClump ?? 0)}.`
              : `your ripple ends today at a density excess of about ${r.densityExcessToday.toPrecision(2)}, so it did not reach the green line and did not become a clump.`,
            matters: 'it is the model’s answer to “would this region become a galaxy?” for your starting size.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export function NeededSizeCaption({ kind, startDelta }: { kind: KindOfMatter; startDelta: number }) {
  const o = startFacts('ordinary')
  const d = startFacts('ordinary-plus-dark')
  const r = runStructureFormationExperiment(kind, startDelta)
  const where = startDelta > Math.max(o.requiredStartDelta, d.requiredStartDelta) ? 'to the right of both' : startDelta >= Math.min(o.requiredStartDelta, d.requiredStartDelta) ? 'between the two' : 'to the left of both'
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: how big must a ripple start.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          Four dots on one sideways scale of density excess, each tick ten times the one before. Further right means a bigger starting difference.
        </li>
        <li>
          Since a ripple grows by a fixed number of times, you can work backward: the smallest starting ripple that reaches 1 by today is 1 divided by that number. For ordinary matter the growth is about {whole(o.growthSinceStart)}, so the ripple must start at about 1 ÷ {whole(o.growthSinceStart)} = {partsInLabel(o.requiredStartDelta)}. With the earlier start the growth is about {whole(d.growthSinceStart)}, so it needs only about {partsInLabel(d.requiredStartDelta)}.
        </li>
        <li>
          <strong style={{ color: YOUR_COLOR }}>Your starting size</strong> is the pink dot: if it is to the right of a kind of matter&rsquo;s dot, your ripple is big enough to become a clump with that kind of matter.
        </li>
        <li>
          <strong style={{ color: NO_DARK_ENERGY_COLOR }}>The red dot at the far left</strong> is the size of the oldest light&rsquo;s ripple, 1 part in 100,000, but be careful: that is a difference in <em>temperature</em> (Cosmology 3), which is not the same as how much denser a region of matter is. The picture puts them side by side for reference only. This model does not say whether the real universe started with enough, and it does not draw that conclusion.
        </li>
      </ul>
      <LookFor
        items={[
          {
            look: 'the pink dot, against the amber and violet dots',
            means: `it is ${where}; with ${kindLabels[kind].toLowerCase()} your ripple ${r.becameClump ? 'became' : 'did not become'} a clump.`,
            matters: 'the gap between the amber and violet dots is the range of starting sizes where the earlier start decides whether a clump forms.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export { MAX_START_DELTA, MIN_START_DELTA }
