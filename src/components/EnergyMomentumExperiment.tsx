import { useEffect, useState } from 'react'
import { EnergyMomentumTutor } from './EnergyMomentumTutor'
import { EnergyMomentumCollision, PART_TWO_REFERENCE_ENTRIES } from './EnergyMomentumCollision'
import { EnergyMomentumReactions, PART_THREE_REFERENCE_ENTRIES } from './EnergyMomentumReactions'
import { EnergyMomentumIntro, EnergyMomentumLinks, EnergyMomentumSources, energyMomentumWordsEntries } from './EnergyMomentumIntro'
import { EnergyMomentumResultsTables, PREDICTION_CHOICES } from './EnergyMomentumResults'
import type { Prediction } from './EnergyMomentumResults'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'
import type { CSSProperties } from 'react'
import { SECTION_A_PASSING_SPEED, SECTION_A_SPEED, guessMarkerFor, particleReading, readingFor, runInvariantExperiment } from '../physics/energyMomentum'
import type { BarName, EnergyMomentumReading } from '../physics/energyMomentum'

// Spacetime Geometry 5, Section A (energy and momentum, seen by different observers), of docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md.
// Audit update of 2026-11-21 (wording in docs/audit/spacetime-geometry/05-draft-wording.md, approved by the owner on 2026-11-21, "approved all defaults"): Section A is
// in four Parts. Part 1 is one guess about one fixed run (a particle at 0.6c, a passing observer at +0.3c), with the map and, from Run, the bars with the white guess
// marker; Part 2 lets the learner choose the object and speeds; Part 3 has the results; Part 4 the tutor. Parts 2 to 4 appear after the first Run, and Start over clears
// Section A. Sections B and C (below, in `EnergyMomentumCollision.tsx` and `EnergyMomentumReactions.tsx`) are not changed by this step except for their names.
// Every number comes from `energyMomentum.ts`. The introduction and links are in `EnergyMomentumIntro.tsx`, the results in `EnergyMomentumResults.tsx`.
type Kind = 'particle' | 'light'

// The elements Part 1 and Part 2 sit in, so the skip link and the back link can scroll to them.
const PART_TWO_ID = 'energy-momentum-part-2'
const PART_ONE_ID = 'energy-momentum-part-1'
const PART_THREE_ID = 'energy-momentum-part-3'

const KIND_CHOICES: { value: Kind; label: string }[] = [
  { value: 'particle', label: 'A particle with mass' },
  { value: 'light', label: 'A light pulse' },
]
const PARTICLE_SPEED_PRESETS = [0, 0.3, 0.6, 0.8, 0.9, 0.99]
const PASSING_SPEED_PRESETS = [-0.8, -0.6, -0.3, 0, 0.3, 0.6, 0.8]

// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
// The passing observer's speed sweeps from 0 to its chosen value over the first part, then holds there.
const ANIMATION_DURATION_MS = 12_000
const SWEEP_END = 0.85

// The dark canvas used by the newer experiments, with light text and lines.
const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const TICK_COLOR = '#cbd5e1'
const LAB_COLOR = '#38bdf8'
const OWN_COLOR = '#4ade80'
const PASSING_COLOR = '#c4b5fd'
const CURVE_COLOR = '#facc15'
const ENERGY_BAR_COLOR = '#f59e0b'
const MOMENTUM_BAR_COLOR = '#8b5cf6'
const INVARIANT_BAR_COLOR = '#14b8a6'
// A dark outline so a label stays readable where it crosses a line.
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

// Drawing constants (SVG units). Momentum × c runs across, energy runs up; both are cut to fit the chosen setup.
const VIEW_WIDTH = 460
const VIEW_HEIGHT = 462
const LEFT_X = 70
const RIGHT_X = 440
const BOTTOM_Y = 392
const TOP_Y = 152

function kindWords(kind: Kind): string {
  return kind === 'particle' ? 'a particle with mass' : 'a light pulse'
}

function passingLabel(speed: number): string {
  if (speed === 0) return '0c (at rest in the lab)'
  return `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

function signed(value: number, digits = 2): string {
  return value.toFixed(digits).replace('-', '−')
}

function niceStep(max: number): number {
  if (max <= 4) return 1
  if (max <= 10) return 2
  if (max <= 25) return 5
  return 10
}

// The observer's speed at a point in the playback: it rises from 0 to its chosen value, then holds.
function sweptSpeed(passingSpeed: number, progress: number): number {
  const fraction = Math.min(progress / SWEEP_END, 1)
  const eased = fraction * fraction * (3 - 2 * fraction)
  return passingSpeed * eased
}

// The readings that observers at many speeds would find for a particle with the lab's mass, all found with the physics model's
// own transformation (the particle at rest, seen by observers moving at each speed). They fall on one curve.
function curvePoints(): EnergyMomentumReading[] {
  const rest = particleReading(0)
  const points: EnergyMomentumReading[] = []
  for (let i = -90; i <= 90; i++) points.push(readingFor(Math.tanh(i / 20), rest))
  return points
}

interface DiagramProps {
  kind: Kind
  speed: number
  passingSpeed: number
  // null while idle (only the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
}

// While idle it draws only the setup: the two axes and the lab's own reading. It deliberately draws no curve and no other
// reading then: whether the readings share anything is what the learner is asked to predict (§12). While the run plays it also
// draws the curve, the particle's own reading and the passing observer's reading, which slides along the curve as their speed
// rises from 0 to the chosen value.
function Diagram({ kind, speed, passingSpeed, progress }: DiagramProps) {
  const result = runInvariantExperiment(kind, speed, passingSpeed)
  const allReadings = [result.lab, result.passing, ...(result.own ? [result.own] : [])]
  const reach = Math.max(...allReadings.map((r) => Math.max(r.energy, Math.abs(r.momentumTimesC))))
  const limit = Math.max(2, Math.ceil(reach * 1.1))
  const step = niceStep(limit)
  const marks = Array.from({ length: Math.floor(limit / step) + 1 }, (_, i) => i * step)
  const centerX = (LEFT_X + RIGHT_X) / 2
  const xOf = (momentum: number) => centerX + (momentum / limit) * ((RIGHT_X - LEFT_X) / 2)
  const yOf = (energy: number) => BOTTOM_Y - (energy / limit) * (BOTTOM_Y - TOP_Y)
  const unit = kind === 'particle' ? "the particle's rest energies" : "the lab's measurement of the pulse"
  const playing = progress !== null
  const complete = progress !== null && progress >= 1
  const lab = result.lab
  const currentSpeed = playing ? sweptSpeed(passingSpeed, progress) : 0
  const passing = readingFor(currentSpeed, lab)
  const labX = xOf(lab.momentumTimesC)
  const labY = yOf(lab.energy)
  const passingX = xOf(passing.momentumTimesC)
  const passingY = yOf(passing.energy)
  const curve = kind === 'particle' ? curvePoints() : []
  const curvePath = curve.map((r) => `${xOf(r.momentumTimesC).toFixed(1)},${yOf(r.energy).toFixed(1)}`).join(' ')
  const passingMoved = Math.abs(passingX - labX) + Math.abs(passingY - labY) > 14

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`${complete ? 'Result: ' : playing ? 'Playback: ' : 'Setup: '}the lab measures ${kindWords(kind)}${kind === 'particle' ? ` moving at ${speed}c` : ' moving to the right'}. In ${unit}, the lab finds an energy of ${lab.energy.toFixed(2)} and a momentum times c of ${lab.momentumTimesC.toFixed(2)}.${playing ? ` A passing observer moving at ${currentSpeed.toFixed(2)}c finds an energy of ${passing.energy.toFixed(2)} and a momentum times c of ${passing.momentumTimesC.toFixed(2)}.${result.own ? ' The particle’s own observer finds an energy of 1.00 and a momentum times c of 0.00.' : ''}` : ''}`}
      style={SVG_STYLE}
    >
      <defs>
        <clipPath id="energy-momentum-plot-area">
          <rect x={LEFT_X} y={TOP_Y - 6} width={RIGHT_X - LEFT_X} height={BOTTOM_Y - TOP_Y + 6} />
        </clipPath>
      </defs>
      <text x="12" y="18" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Energy and momentum, as measured by different observers
      </text>
      <text x="12" y="34" fontSize="11" fill={MUTED_COLOR}>
        Energy is in {unit}.
      </text>
      <text x="12" y="48" fontSize="11" fill={MUTED_COLOR}>
        Momentum is shown as momentum × c, in the same units.
      </text>

      {/* The key: each reading has its own shape and colour, with its numbers beside it. */}
      <rect x="16" y="59" width="10" height="10" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <text x="34" y="68" fontSize="11" fill={LAB_COLOR}>
        <tspan fontWeight="bold">The lab’s reading:</tspan> energy {lab.energy.toFixed(2)}, momentum × c {signed(lab.momentumTimesC)}
      </text>
      {result.own && (
        <g>
          {playing ? (
            <polygon points="21,76 27,83 21,90 15,83" fill={OWN_COLOR} stroke="#0b1020" strokeWidth="1.5" />
          ) : null}
          {playing && (
            <text x="34" y="86" fontSize="11" fill={OWN_COLOR}>
              <tspan fontWeight="bold">The particle’s own reading:</tspan> energy {result.own.energy.toFixed(2)}, momentum × c{' '}
              {signed(Math.abs(result.own.momentumTimesC) < 5e-10 ? 0 : result.own.momentumTimesC)}
            </text>
          )}
        </g>
      )}
      {playing && (
        <g>
          <circle cx="21" cy={result.own ? 103 : 85} r="6" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
          <text x="34" y={result.own ? 107 : 89} fontSize="11" fontWeight="bold" fill={PASSING_COLOR}>
            The passing observer’s reading
          </text>
          <text x="34" y={result.own ? 121 : 103} fontSize="11" fill={PASSING_COLOR}>
            moving at {signed(currentSpeed)}c: energy {passing.energy.toFixed(2)}, momentum × c {signed(passing.momentumTimesC)}
          </text>
        </g>
      )}

      {/* Axes: momentum × c across (zero in the middle), energy up. */}
      <line x1={LEFT_X} y1={BOTTOM_Y} x2={RIGHT_X} y2={BOTTOM_Y} stroke={TICK_COLOR} strokeWidth="1.5" />
      <line x1={centerX} y1={BOTTOM_Y} x2={centerX} y2={TOP_Y} stroke={TICK_COLOR} strokeWidth="1.5" />
      {marks.flatMap((m) => (m === 0 ? [0] : [-m, m])).map((m) => (
        <g key={`p${m}`}>
          <line x1={xOf(m)} y1={BOTTOM_Y} x2={xOf(m)} y2={BOTTOM_Y + 5} stroke={TICK_COLOR} />
          <text x={xOf(m)} y={BOTTOM_Y + 18} fontSize="11" textAnchor="middle" fill={TICK_COLOR}>
            {m < 0 ? `−${Math.abs(m)}` : m}
          </text>
        </g>
      ))}
      {marks.map((m) => (
        <g key={`e${m}`}>
          <line x1={centerX - 5} y1={yOf(m)} x2={centerX} y2={yOf(m)} stroke={TICK_COLOR} />
          <text x={centerX - 9} y={yOf(m) + 4} fontSize="11" textAnchor="end" fill={TICK_COLOR}>
            {m}
          </text>
        </g>
      ))}
      <text x={centerX} y={BOTTOM_Y + 38} fontSize="12" textAnchor="middle" fill={TEXT_COLOR}>
        Momentum × c (right is moving to the right)
      </text>
      <text x="14" y={(BOTTOM_Y + TOP_Y) / 2} fontSize="12" textAnchor="middle" fill={TEXT_COLOR} transform={`rotate(-90 14 ${(BOTTOM_Y + TOP_Y) / 2})`}>
        Energy
      </text>

      {/* The curve (for a particle) or the two straight edges (for light), drawn once the run starts. */}
      {playing && (
        <g clipPath="url(#energy-momentum-plot-area)">
          {kind === 'particle' ? (
            <polyline points={curvePath} fill="none" stroke={CURVE_COLOR} strokeWidth="2" />
          ) : (
            <g>
              <line x1={centerX} y1={BOTTOM_Y} x2={xOf(limit)} y2={yOf(limit)} stroke={CURVE_COLOR} strokeWidth="2" />
              <line x1={centerX} y1={BOTTOM_Y} x2={xOf(-limit)} y2={yOf(limit)} stroke={CURVE_COLOR} strokeWidth="2" />
            </g>
          )}
        </g>
      )}
      {playing && kind === 'particle' && (
        <text x={xOf(-limit * 0.1) - 8} y={yOf(limit * 0.9)} textAnchor="end" fontSize="11" fill={CURVE_COLOR} style={HALO}>
          <tspan x={xOf(-limit * 0.1) - 8}>The curve: where the readings of</tspan>
          <tspan x={xOf(-limit * 0.1) - 8} dy="13">observers at every other speed fall</tspan>
        </text>
      )}
      {playing && kind === 'light' && (
        <text x={xOf(-limit * 0.06) - 4} y={yOf(limit * 0.9)} textAnchor="end" fontSize="11" fill={CURVE_COLOR} style={HALO}>
          <tspan x={xOf(-limit * 0.06) - 4}>The two straight lines: where light</tspan>
          <tspan x={xOf(-limit * 0.06) - 4} dy="13">always sits (energy = momentum × c)</tspan>
        </text>
      )}

      {/* The trail the passing observer's reading has left along the curve. */}
      {playing && passingMoved && (
        <line x1={labX} y1={labY} x2={passingX} y2={passingY} stroke={PASSING_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      )}

      {/* The lab's reading: a solid square. */}
      <line x1={labX} y1={labY} x2={labX} y2={BOTTOM_Y} stroke={LAB_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      <line x1={centerX} y1={labY} x2={labX} y2={labY} stroke={LAB_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      <rect x={labX - 6} y={labY - 6} width="12" height="12" fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      {/* The particle's own reading: a diamond. */}
      {playing && result.own && (
        <g>
          <polygon points={`${xOf(0)},${yOf(1) - 8} ${xOf(0) + 8},${yOf(1)} ${xOf(0)},${yOf(1) + 8} ${xOf(0) - 8},${yOf(1)}`} fill={OWN_COLOR} stroke="#0b1020" strokeWidth="1.5" />
        </g>
      )}

      {/* The passing observer's reading: a hollow circle that slides along the curve as the observer's speed rises. */}
      {playing && (
        <g>
          <circle cx={passingX} cy={passingY} r="7" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
        </g>
      )}
    </svg>
  )
}

interface BarsRow {
  name: string
  color: string
  reading: EnergyMomentumReading
}

const BARS_VIEW_WIDTH = 520
const BARS_CENTER_X = 250
const BARS_LABEL_X = 20
const BARS_MAX_LENGTH = 190
const BARS_TOP = 62
const BARS_GROUP_HEIGHT = 92
const BARS_ROW_HEIGHT = 20

// Words of a YOUR GUESS box, broken into short lines.
function wrapWords(text: string, maxChars: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const word of text.split(' ')) {
    if (current !== '' && (current + ' ' + word).length > maxChars) {
      lines.push(current)
      current = word
    } else current = current === '' ? word : current + ' ' + word
  }
  if (current !== '') lines.push(current)
  return lines
}

const GUESS_COLOR = '#ffffff'
const BARS_GUTTER = 200
const BAR_ROW_OF: Record<BarName, number> = { energy: 0, momentum: 1, invariant: 2 }

// For each observer, three bars on one scale around a middle line at zero: the energy, the momentum × c, and the combination
// E² − (pc)². A bar to the right is positive and a bar to the left is negative. The numbers beside each bar say the same, so
// colour is not needed. With a `guess`, white outlines go round the bars the guess names, for every observer, and a YOUR GUESS box
// in the right-hand margin is joined to an outline by a line. The outlines are only a marker: they have no size of their own and
// change no bar (`guessMarkerFor`, Rule A of the audit).
export function ReadingBars({ rows, guess }: { rows: BarsRow[]; guess?: Prediction | null }) {
  const longest = Math.max(...rows.flatMap((r) => [r.reading.energy, Math.abs(r.reading.momentumTimesC), Math.abs(r.reading.invariant)]), 1e-9)
  const lengthOf = (value: number) => (Math.abs(value) / longest) * BARS_MAX_LENGTH
  const height = BARS_TOP + rows.length * BARS_GROUP_HEIGHT + 28
  const outlines = guess ? guessMarkerFor(guess) : []
  const width = BARS_VIEW_WIDTH + (outlines.length > 0 ? BARS_GUTTER : 0)
  const OUTLINE_LEFT = BARS_LABEL_X - 8
  const OUTLINE_RIGHT = BARS_VIEW_WIDTH - 4
  const groupTop = (g: number) => BARS_TOP + g * BARS_GROUP_HEIGHT

  const quantities = (reading: EnergyMomentumReading) => [
    { label: 'Energy E', value: reading.energy, color: ENERGY_BAR_COLOR },
    { label: 'Momentum × c', value: Math.abs(reading.momentumTimesC) < 5e-10 ? 0 : reading.momentumTimesC, color: MOMENTUM_BAR_COLOR },
    { label: 'E² − (momentum × c)²', value: Math.abs(reading.invariant) < 5e-10 ? 0 : reading.invariant, color: INVARIANT_BAR_COLOR },
  ]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Bars of the energy, the momentum times c, and the combination E squared minus the square of momentum times c, for each observer. ${rows
        .map((row) => `${row.name}: energy ${row.reading.energy.toFixed(2)}, momentum times c ${row.reading.momentumTimesC.toFixed(2)}, combination ${row.reading.invariant.toFixed(2)}`)
        .join('. ')}.${outlines.length > 0 ? ` White outlines mark your guess: ${outlines.map((o) => o.label).join('. ')}. They are only a marker.` : ''}`}
      style={SVG_STYLE}
    >
      <text x="20" y="22" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        What each observer measures (one scale)
      </text>
      <text x="20" y="38" fontSize="10" fill={MUTED_COLOR}>
        Bars start at the middle line, which is zero. A bar to the left is negative.
      </text>
      <line x1={BARS_CENTER_X} y1="46" x2={BARS_CENTER_X} y2={height - 24} stroke={TICK_COLOR} strokeWidth="1.5" />
      {rows.map((row, g) => {
        const top = groupTop(g)
        return (
          <g key={row.name}>
            <text x={BARS_LABEL_X} y={top - 4} fontSize="12" fontWeight="bold" fill={row.color}>
              {row.name}
            </text>
            {quantities(row.reading).map((q, i) => {
              const y = top + 4 + i * BARS_ROW_HEIGHT
              const length = lengthOf(q.value)
              return (
                <g key={q.label}>
                  <text x={BARS_LABEL_X} y={y + 12} fontSize="10" fill={MUTED_COLOR}>
                    {q.label}
                  </text>
                  {length > 0.5 && (
                    <rect x={q.value >= 0 ? BARS_CENTER_X : BARS_CENTER_X - length} y={y + 2} width={length} height="12" rx="2" fill={q.color} />
                  )}
                  <text x={BARS_VIEW_WIDTH - 12} y={y + 12} textAnchor="end" fontSize="10" fill={TEXT_COLOR}>
                    {signed(q.value)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
      <text x="20" y={height - 8} fontSize="10" fill={MUTED_COLOR}>
        The longest bar here is {longest.toFixed(2)}.
      </text>

      {/* The white guess: an outline round the bars the answer names, for every observer, and a YOUR GUESS box joined to one outline by a line. */}
      {outlines.map((outline, k) => {
        const firstRow = Math.min(...outline.bars.map((b) => BAR_ROW_OF[b]))
        const lastRow = Math.max(...outline.bars.map((b) => BAR_ROW_OF[b]))
        const onlyInvariant = outline.bars.length === 1 && outline.bars[0] === 'invariant'
        const linkedGroup = onlyInvariant ? rows.length - 1 : 0
        const y0 = (g: number) => groupTop(g) + 4 + firstRow * BARS_ROW_HEIGHT + 1
        const y1 = (g: number) => groupTop(g) + 4 + (lastRow + 1) * BARS_ROW_HEIGHT - 1
        const midY = (y0(linkedGroup) + y1(linkedGroup)) / 2
        const [title, rest] = outline.label.split(': ')
        const lines = wrapWords(rest, 22)
        const boxX = BARS_VIEW_WIDTH + 18
        const boxW = BARS_GUTTER - 28
        const boxH = 38 + lines.length * 14
        const boxY = Math.max(6, Math.min(midY - boxH / 2, height - boxH - 6))
        return (
          <g key={k}>
            {rows.map((row, g) => (
              <rect
                key={row.name}
                x={OUTLINE_LEFT}
                y={y0(g)}
                width={OUTLINE_RIGHT - OUTLINE_LEFT}
                height={y1(g) - y0(g)}
                rx="4"
                fill="none"
                stroke={GUESS_COLOR}
                strokeWidth="3"
              />
            ))}
            <line x1={OUTLINE_RIGHT + 8} y1={midY} x2={boxX} y2={Math.max(boxY + 10, Math.min(midY, boxY + boxH - 10))} stroke={GUESS_COLOR} strokeWidth="3" />
            <polygon points={`${OUTLINE_RIGHT + 2},${midY} ${OUTLINE_RIGHT + 14},${midY - 7} ${OUTLINE_RIGHT + 14},${midY + 7}`} fill={GUESS_COLOR} />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} rx="6" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="3" />
            <text x={boxX + boxW / 2} y={boxY + 24} textAnchor="middle" fontSize="16" fontWeight="bold" fill={GUESS_COLOR}>
              {title}
            </text>
            {lines.map((line, i) => (
              <text key={i} x={boxX + boxW / 2} y={boxY + 42 + i * 14} textAnchor="middle" fontSize="11" fill={GUESS_COLOR}>
                {line}
              </text>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

interface EnergyMomentumExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// The quick-reference panel ("Words and formulas"): one line for each term and formula introduced so far (spec, Introduction,
// rule 5). Part 1's are listed from the start, and Part 2's are added once Part 2 appears; Part 3's are added once Part 3 appears. Draft
// wording for the owner's review (§28.1). The one-line formulas repeat the introduction's, with no new claims.
export const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Particle', meaning: 'a very small piece of matter, such as an electron or a proton, treated here as a single point.' },
  {
    term: 'Observer',
    meaning:
      'someone with their own ruler and synchronized clocks. The lab is at rest, a passing observer moves past it, and the particle’s own observer travels along with the particle.',
  },
  { term: 'c', meaning: 'the speed of light, about 300,000 kilometers per second. 0.6c is 60 percent of it.' },
  {
    term: 'Time dilation factor, D(v)',
    meaning: '√(1 − v²): how much a moving clock’s ticking is slowed. It is 1 at rest and gets smaller as v gets closer to c.',
  },
  { term: 'Mass', meaning: 'in this experiment, the number you would find if the particle were sitting still beside you.' },
  { term: 'Energy', meaning: 'the ability to make things happen, such as to heat water or to move something. Measured in joules (J) in everyday life.' },
  { term: 'Kinetic energy', meaning: 'energy of motion. At everyday speeds it is ½ × mass × speed².' },
  { term: 'Momentum', meaning: 'a measure of how hard a moving thing is to stop. At everyday speeds it is mass × speed.' },
  { term: 'Rest energy', meaning: 'the energy a particle has when it is not moving. Here it is the unit of energy, written as 1.' },
  { term: 'Total energy', meaning: 'the rest energy plus the kinetic energy.' },
  { term: 'A light pulse', meaning: 'a short flash of light. It carries energy and momentum, but it has no mass.' },
  { term: 'E = 1 ÷ D(v)', meaning: 'the total energy of a particle moving at speed v, in rest energies. At v = 0 it is 1, the rest energy.' },
  { term: 'pc = v ÷ D(v)', meaning: 'the momentum times c, in rest energies: the total energy multiplied by the speed.' },
  { term: 'E² − (pc)²', meaning: 'square the energy, square the momentum times c, and subtract. Not the same as E² + (pc)².' },
  { term: 'v′ = (v − u) ÷ (1 − uv)', meaning: 'the speed another observer, moving at u, measures for something moving at v in the lab.' },
  { term: 'Light: E = pc', meaning: 'for a light pulse, the energy equals the momentum times c, and the combination E² − (pc)² is zero.' },
]

export function ReferencePanel({ entries }: { entries: { term: string; meaning: string }[] }) {
  return (
    <details
      style={{
        marginBottom: '2rem',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        border: '2px solid #0066cc',
        borderRadius: '8px',
        backgroundColor: '#f0f7ff',
      }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', color: '#0066cc' }}>
        📖 Words and formulas: click to open a quick reference
      </summary>
      <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem' }}>
        {entries.map((entry) => (
          <li key={entry.term}>
            <strong>{entry.term}:</strong> {entry.meaning}
          </li>
        ))}
      </ul>
    </details>
  )
}

// ---- The pictures' captions (CLAUDE.md §14, "Animated Diagrams"; wording: docs/audit/spacetime-geometry/05-draft-wording.md, section 5) ----

const captionStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 } as const
const pictureTitle = { fontWeight: 'bold', fontSize: '0.875rem', marginTop: '1.5rem', marginBottom: '0.5rem' } as const
const PART_ONE_COLOR = '#d97706'
const PART_TWO_COLOR = '#be185d'
const PART_THREE_COLOR = '#0f766e'
const PART_FOUR_COLOR = '#0066cc'

interface CaptionProps {
  kind: Kind
  speed: number
  passingSpeed: number
  // True once the playback has started, and once it has finished: a feature is explained only when it is drawn (§12).
  started: boolean
  done: boolean
  // True for Part 2's drawings, which follow the learner's settings.
  own?: boolean
}

// The caption of the map of energy and momentum (Picture 1 in Part 1, Drawing A in Part 2).
function MapCaption({ kind, speed, passingSpeed, started, done, own }: CaptionProps) {
  const fixedRun = runInvariantExperiment('particle', SECTION_A_SPEED, SECTION_A_PASSING_SPEED)
  const f2 = (v: number) => signed(Math.abs(v) < 5e-10 ? 0 : v, 2)
  return (
    <div style={captionStyle}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{own ? 'How to read Drawing A.' : 'How to read this diagram.'}</strong>{' '}
        {own
          ? 'This is the map of Part 1 again, drawn for your settings, with a pink line beside it because it follows your settings. Everything in it means what it meant in Part 1. '
          : ''}
        For {own ? 'your settings' : 'this run'}, the lab measures {kindWords(kind)}
        {kind === 'particle' ? ` moving at ${speed}c` : ' moving to the right'}, and the passing observer moves at {passingLabel(passingSpeed)}.
      </p>
      <p style={{ margin: '0 0 0.5rem' }}>
            <strong>{own ? 'Drawing A: the map of energy and momentum.' : 'Picture 1: the map of energy and momentum.'}</strong> Across the bottom is <strong>momentum × c</strong>.
            Zero is in the middle, a point to the right means moving to the right, and a point to the left means moving to the
            left. Up the side is <strong>energy</strong>.{' '}
            {kind === 'particle'
              ? 'We count it in a convenient unit: the energy the particle has when it is sitting still, which we call 1. So an energy of 1 means "just its resting energy", and an energy of 2.5 means "2.5 times that". Across the bottom, momentum × c is counted in the same unit, so the two can be compared.'
              : "We count it in the lab's own measurement of the pulse, which we call 1, because a light pulse never sits still and so has no resting energy. Across the bottom, momentum × c is counted in the same unit, so the two can be compared."}{' '}
            The parts of the map are:
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The sky-blue square, "The lab's reading".</strong> What the lab measures. The dashed lines show where it
              sits on each axis.
            </li>
            {kind === 'particle' && (
              <li>
                <strong>The green diamond, "The particle's own reading".</strong> What an observer who travels along with the
                particle measures. For them the particle is at rest, like a person sitting beside you on a train: they are not moving
                relative to you. Momentum depends on how fast something moves relative to the observer, so for this observer the
                momentum × c is 0. All that is left is the particle's resting energy, which is 1. The diamond therefore sits on the
                zero line, at height 1. It appears when you press Run.
              </li>
            )}
            <li>
              <strong>The hollow purple circle, "The passing observer's reading".</strong> Imagine a second person, the passing
              observer, who flies past the lab in a straight line. They measure the very same {kind === 'particle' ? 'particle' : 'light pulse'},
              but because they are moving, they get a <em>different</em> energy and a <em>different</em> momentum × c than the
              lab does. The circle is a dot on the map that shows those two numbers: how far across it sits is their momentum × c,
              and how high it sits is their energy. When you press Run, the passing observer starts out standing still next to
              the lab, so the circle starts right on top of the lab's square (they get the same numbers). Then they speed up,
              little by little, until they reach the speed you chose. As their speed changes, their numbers change, so the circle
              moves across the map. A dashed purple line shows the path the circle has travelled, and the words beside it give
              their speed at that moment and their two numbers.
            </li>
            {started && (
            <li>
              <strong>{kind === 'particle' ? 'The yellow curve.' : 'The two straight yellow lines.'}</strong>{' '}
              {kind === 'particle'
                ? 'Every observer, whatever their speed, gets one energy and one momentum × c for this particle, and so has one dot on the map. The yellow curve is the line that all of those dots fall on. Think of a road drawn on a map: you can stand at many places along it, but you cannot stand off it. In the same way, the passing observer\'s circle can sit at many places, depending on their speed, but it always stays on the curve. Notice the lowest point of the curve, straight above zero. That is where an observer who moves along with the particle sits, because for them the particle is not moving, so its momentum × c is zero and only its rest energy is left. The farther an observer\'s dot is from that point, the faster the particle appears to move to them, and the more energy and momentum it has. The curve appears when you press Run.'
                : 'Every observer, whatever their speed, gets one energy and one momentum × c for the light pulse, and so has one dot on the map. A light pulse always has an energy equal to its momentum × c. That is why all of those dots fall on a straight line: the right-hand line if the pulse moves to the right, the left-hand line if it moves to the left (where the momentum × c is a negative number). Think of a road drawn on a map: you can stand at many places along it, but you cannot stand off it. In the same way, the passing observer\'s circle can sit at many places, depending on their speed, but it always stays on the line. Light has no "at rest" reading, so unlike a particle, no observer can get a dot at zero momentum. The lines appear when you press Run.'}
            </li>
            )}
          </ul>
      {started && (
        <>
          <p style={{ margin: '0 0 0.75rem' }}>
            <strong>What if a momentum is negative?</strong> A negative momentum × c means moving to the <em>left</em>. The sign
            shows only the direction; the size shows how much. Energy has no direction, so it is never negative.{' '}
            {kind === 'particle'
              ? 'You may see a negative momentum × c for the passing observer even though the lab sees the particle moving to the right. This happens when the passing observer moves to the right faster than the particle does. They overtake it, so from their point of view the particle falls behind and drifts to the left. It is like driving at 100 km/h past a truck that is doing 60 km/h: the truck is moving forward along the road, but from your seat it slides backward past your window. On the map, their circle then sits to the left of the middle line.'
              : 'A light pulse moving to the left always has a negative momentum × c, for every observer, because every observer sees it moving to the left. A passing observer who moves to the right sees the pulse with a larger energy and a larger (negative) momentum × c, and one who moves to the left sees smaller ones. On the map, the dots for a left-moving pulse sit on the left-hand line.'}
            {' '}A negative momentum is one observer's measurement at one moment. It does not mean that the particle slowed down,
            stopped and turned around. A particle that really did that would need something to push it, such as a wall it
            bounces off.
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>What is happening in this experiment.</strong>{' '}
            {kind === 'particle'
              ? 'In short: one particle, one lab, and an observer who gradually speeds up. Nothing about the particle changes. Only the observer\'s speed changes, and with it, what the observer measures.'
              : 'In short: one light pulse, one lab, and an observer who gradually speeds up. Nothing about the pulse changes. Only the observer\'s speed changes, and with it, what the observer measures.'}
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>What stays the same.</strong>{' '}
              {kind === 'particle'
                ? 'The particle moves through the lab at one steady speed the whole time, and nothing pushes it. The lab\'s square never moves on the map.'
                : 'The pulse moves through the lab in one direction the whole time. The lab\'s square never moves on the map.'}
            </li>
            <li>
              <strong>What changes.</strong> The passing observer starts at rest beside the lab and then speeds up. At every speed they
              are a different observer, so they get a different energy and a different momentum × c for the very same{' '}
              {kind === 'particle' ? 'particle' : 'pulse'}. The purple circle shows those two numbers, so it moves as their speed changes.
            </li>
            {kind === 'particle' ? (
              <li>
                <strong>What the circle does, step by step.</strong> Think of watching a truck that drives at 60 km/h along a road. Now
                you drive along the same road, speeding up.
                <ul style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                  <li>
                    <em>You are slower than the truck</em> (say 30 km/h). The truck still pulls ahead of you. In the same way, while the
                    observer is slower than the particle, the particle still moves to the right for them, and the circle sits to the
                    right of the middle line (momentum × c is positive).
                  </li>
                  <li>
                    <em>You match the truck</em> (60 km/h). It seems to hover beside your window. In the same way, when the observer
                    moves at the particle's speed, the particle is at rest for them. The circle lands on the green diamond, and momentum × c
                    is 0.
                  </li>
                  <li>
                    <em>You are faster than the truck</em> (say 100 km/h). You overtake it, and it seems to slide backward. In the same
                    way, the particle seems to move to the left, and the circle moves to the left of the middle line (momentum × c is
                    negative).
                  </li>
                </ul>
                The truck never changed its speed, only yours did. The circle goes through all three stages only if the observer's chosen
                speed is beyond the particle's. If it is smaller, the circle stops before it gets to the diamond.
              </li>
            ) : (
              <li>
                <strong>What the circle does.</strong> The pulse moves to the right in the lab, and every observer sees it moving to the
                right, because nothing can overtake light. So its momentum × c stays positive for all of them, and only the size changes.
                An observer who moves to the right (with the pulse) sees a smaller energy and a smaller momentum × c. One who moves to the
                left (toward it) sees larger ones. The circle slides along the line but never crosses the middle.
              </li>
            )}
          </ul>
        </>
      )}
      <div style={{ margin: '0.75rem 0' }}>
      <WhereFrom>
        <strong>Calculated here:</strong> every number on the map, from the rules of special relativity given in the introduction (the same rule that carries time and position from one
        observer to another carries the lab's energy and momentum to the passing observer's). <strong>Measured:</strong> nothing on this page. The rules have been tested in particle
        accelerators (the tutor says more). <strong>Imagined for the question:</strong> the particle and the observers.
      </WhereFrom>
      </div>
      <p style={{ margin: '0 0 0.5rem' }}>
            <strong>What happens in the animation.</strong>
          </p>
          <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              Before you press Run, {own ? 'Drawing A' : 'Picture 1'} shows only the lab's reading. Nothing from the other observers is drawn yet.
            </li>
            <li>
              When you press Run, {kind === 'particle' ? 'the curve and the particle’s own reading appear' : 'the two straight lines appear'},
              and the passing observer's circle appears on top of the lab's square. {own ? 'Drawing B' : 'Picture 2'} appears below.
            </li>
            <li>
              The passing observer's speed climbs from 0 to the chosen speed. The circle slides along{' '}
              {kind === 'particle' ? 'the curve' : 'the line'}, and the bars for the passing observer change as it goes.
            </li>
            <li>
              The animation takes about 12 seconds. It only sets how fast you watch, and it does not change what the experiment
              finds. At the end, everything stays on the screen.
            </li>
          </ol>
      {!own && done && (
        <>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>A worked moment, with numbers that are not among the choices.</strong> Say a particle moves at 0.5c in the lab. The lab finds energy 1.155 and momentum × c 0.577. A passing
            observer moves at +0.2c. Their numbers come from the same rule as for time and position in the earlier experiments, with energy in the place of time and momentum × c in the place of
            position: they divide by the time dilation factor at 0.2c, which is √(1 − 0.04) = 0.980, and use energy − 0.2 × momentum × c, and momentum × c − 0.2 × energy. So the energy is
            (1.155 − 0.2 × 0.577) ÷ 0.980 = 1.061, and the momentum × c is (0.577 − 0.2 × 1.155) ÷ 0.980 = 0.354. The experiment does this arithmetic for you.
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList
            items={[
              {
                look: 'the hollow purple circle, as it slid',
                means: `its height is the passing observer's energy and its place across is their momentum × c. In this run both changed, from the lab's ${f2(fixedRun.lab.energy)} and ${f2(fixedRun.lab.momentumTimesC)} to ${f2(fixedRun.passing.energy)} and ${f2(fixedRun.passing.momentumTimesC)}`,
                matters: 'it shows that two observers measuring the same particle get different energies and different momenta, so energy and momentum on their own are not what everyone agrees on',
              },
              {
                look: 'the yellow curve and where the circle ended up',
                means: 'every reading, whatever the observer\'s speed, lands on this one curve. The circle never leaves it',
                matters: 'the readings differ, but they are not scattered anywhere on the map. Something is held fixed, and the tutor says what',
              },
              {
                look: 'the green diamond, at the lowest point of the curve',
                means: `the particle's own observer finds a momentum × c of ${f2(fixedRun.own!.momentumTimesC)} and an energy of ${f2(fixedRun.own!.energy)}, the rest energy, which is our unit`,
                matters: 'it is the lowest point of the curve, so no observer finds less energy than the rest energy',
              },
            ]}
          />
        </>
      )}
    </div>
  )
}

// The caption of the bars (Picture 2 in Part 1, Drawing B in Part 2). Only Part 1's Picture 2 carries the white guess marker.
function BarsCaption({ kind, speed, passingSpeed, done, own, guess }: CaptionProps & { guess: Prediction | null }) {
  const fixedRun = runInvariantExperiment('particle', SECTION_A_SPEED, SECTION_A_PASSING_SPEED)
  const f2 = (v: number) => signed(Math.abs(v) < 5e-10 ? 0 : v, 2)
  return (
    <div style={captionStyle}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{own ? 'How to read Drawing B.' : 'How to read Picture 2.'}</strong>{' '}
        {own ? 'These are the bars of Part 1 again, drawn for your settings. ' : ''}
        This picture is a set of <strong>bars</strong> that show the same numbers as the map. For {own ? 'your settings' : 'this run'}, the lab measures {kindWords(kind)}
        {kind === 'particle' ? ` moving at ${speed}c` : ' moving to the right'}, and the passing observer moves at {passingLabel(passingSpeed)}.
      </p>
      <p style={{ margin: '0 0 0.5rem' }}>
            <strong>{own ? 'Drawing B: the bars.' : 'Picture 2: the bars.'}</strong> For each observer there are three bars on one scale. The top bar is the{' '}
            <strong>energy</strong>, the middle bar is the <strong>momentum × c</strong>, and the bottom bar is the{' '}
            <strong>combination E² − (momentum × c)²</strong>: the energy multiplied by itself, minus the momentum × c
            multiplied by itself. Each bar starts at the middle line, which is zero. A bar to the left means a negative number.
            The number beside each bar says the same thing.
          </p>
      {guess !== null && (
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>The white outlines.</strong> The white outlines and the YOUR GUESS box are your guess, drawn on the bars it names. They are <strong>only a marker</strong>: they have no size
          of their own, and they do not change the bars. A different guess puts the outlines round different bars.
        </p>
      )}
      {done && !own && (
        <p style={{ margin: '0 0 0.5rem' }}>
          The sign of a number does not change the bottom bar. A negative number multiplied by itself is positive, so the sign drops out.
        </p>
      )}
      <div style={{ margin: '0.75rem 0' }}>
      <WhereFrom>
        <strong>Calculated here:</strong> the bars, by the same calculation as the map. <strong>Measured:</strong> nothing on this page. <strong>Imagined for the question:</strong> the particle and
        the observers. {guess !== null && 'The white outlines are your guess, drawn by this page. They are not part of the result.'}
      </WhereFrom>
      </div>
      {!own && done && (
        <>
          <p style={{ margin: '0.75rem 0 0.25rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList
            items={[
              {
                look: 'the top bar of each observer (the energy)',
                means: `the three observers' energy bars have different lengths: ${f2(fixedRun.lab.energy)} for the lab, ${f2(fixedRun.own!.energy)} for the particle's own observer and ${f2(fixedRun.passing.energy)} for the passing observer`,
                matters: 'the observers do not agree on the energy',
              },
              {
                look: 'the middle bar of each observer (the momentum × c)',
                means: `the lab's is ${f2(fixedRun.lab.momentumTimesC)}, the particle's own observer's is ${f2(fixedRun.own!.momentumTimesC)} and the passing observer's is ${f2(fixedRun.passing.momentumTimesC)}`,
                matters: 'the observers do not agree on the momentum either',
              },
              {
                look: 'the bottom bar of each observer (E² − (momentum × c)²)',
                means: `all three bars are the same length, ${f2(fixedRun.lab.invariant)}`,
                matters: 'one combination of energy and momentum is the same for every observer. The tutor explains why',
              },
            ]}
          />
        </>
      )}
    </div>
  )
}

type PlayStatus = 'idle' | 'running' | 'complete'

// Plays a run: progress goes from 0 to 1 over ANIMATION_DURATION_MS, then the status becomes 'complete'. The length only sets how fast the result is
// shown; the physics does not depend on it (§11).
function usePlayback(status: PlayStatus, setStatus: (status: PlayStatus) => void, setProgress: (progress: number) => void) {
  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId: number
    const animate = (currentTime: number) => {
      const fraction = Math.min(Math.max((currentTime - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(fraction)
      if (fraction >= 1) {
        setStatus('complete')
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, setStatus, setProgress])
}

// The bars of one run at one moment of the playback: the lab, the particle's own observer (not for light) and the passing observer, whose
// speed is swept from 0 to its chosen value.
function barRowsFor(kind: Kind, speed: number, passingSpeed: number, status: PlayStatus, progress: number): BarsRow[] {
  const result = runInvariantExperiment(kind, speed, passingSpeed)
  const currentSpeed = status === 'idle' ? 0 : sweptSpeed(passingSpeed, progress)
  const rows: BarsRow[] = [{ name: 'The lab', color: LAB_COLOR, reading: result.lab }]
  if (result.own) rows.push({ name: 'The particle’s own observer', color: OWN_COLOR, reading: result.own })
  rows.push({ name: 'The passing observer', color: PASSING_COLOR, reading: readingFor(currentSpeed, result.lab) })
  return rows
}

export function EnergyMomentumExperiment({ onComplete, onTutorComplete }: EnergyMomentumExperimentProps) {
  // ---- Section A, Part 1: one guess, one fixed run (a particle at 0.6c, a passing observer at +0.3c) ----
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState<PlayStatus>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the Start overs, so the tutor starts again at its first question.
  const [resetCount, setResetCount] = useState(0)

  // ---- Section A, Part 2: the learner's own object and speeds ----
  const [kind, setKind] = useState<Kind>('particle')
  const [speed, setSpeed] = useState(SECTION_A_SPEED)
  const [passingSpeed, setPassingSpeed] = useState(SECTION_A_PASSING_SPEED)
  const [ownStatus, setOwnStatus] = useState<PlayStatus>('idle')
  const [ownProgress, setOwnProgress] = useState(0)
  // True once a light pulse has been run in Part 2: the tutor's paragraph about light appears then.
  const [ranLight, setRanLight] = useState(false)

  // ---- Sections B and C (not changed by this audit step) ----
  // Section B is shown only after the learner has reached Section A's tutor explanation (spec, Learner Controls, Decision 2).
  const [partOneExplained, setPartOneExplained] = useState(false)
  // A learner who already knows Section A can skip to Section B with a link. Section B is then shown without Section A's tutor explanation, and it says so (it
  // uses a combination from Section A). Skipping does not count as having reached the explanation, so it does not call onTutorComplete or onComplete. Once Section B is open,
  // the same link reads "Go to Section B - Collision" and scrolls down to it, so a learner who went back up can return.
  const [skippedToPartTwo, setSkippedToPartTwo] = useState(false)
  // Section C is shown after the learner has reached Section B's tutor explanation (spec, Learner Controls), or by a skip link in Section A or B. Skipping to Section C also
  // opens Section B above it, because Section C uses Section B's terms. As with Section B, skipping does not count as having reached an explanation.
  const [partTwoExplained, setPartTwoExplained] = useState(false)
  const [skippedToPartThree, setSkippedToPartThree] = useState(false)
  const partTwoShown = partOneExplained || skippedToPartTwo || skippedToPartThree
  const partThreeShown = partTwoExplained || skippedToPartThree

  usePlayback(status, setStatus, setProgress)
  usePlayback(ownStatus, setOwnStatus, setOwnProgress)

  // Parts 2, 3 and 4 appear as soon as the first Run has finished.
  const partOneDone = status === 'complete'
  const playing = status === 'running' || ownStatus === 'running'
  const startOverDisabled = (prediction === null && status === 'idle' && ownStatus === 'idle') || playing

  useEffect(() => {
    if (skippedToPartTwo) document.getElementById(PART_TWO_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [skippedToPartTwo])

  useEffect(() => {
    if (skippedToPartThree) document.getElementById(PART_THREE_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [skippedToPartThree])

  useEffect(() => {
    if (ownStatus === 'complete' && kind === 'light') setRanLight(true)
  }, [ownStatus, kind])

  const goToPartThree = () => {
    if (partThreeShown) document.getElementById(PART_THREE_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else setSkippedToPartThree(true)
  }

  const handleRun = () => {
    if (prediction === null || locked) return
    setLocked(true)
    setProgress(0)
    setStatus('running')
  }
  // Start over: clears the guess, the runs, the results and the tutor of Section A, and returns Section A to its first state.
  const handleStartOver = () => {
    if (playing) return
    setPrediction(null)
    setLocked(false)
    setStatus('idle')
    setProgress(0)
    setKind('particle')
    setSpeed(SECTION_A_SPEED)
    setPassingSpeed(SECTION_A_PASSING_SPEED)
    setOwnStatus('idle')
    setOwnProgress(0)
    setRanLight(false)
    setResetCount((n) => n + 1)
  }
  const chooseOwn = (change: () => void) => {
    change()
    setOwnStatus('idle')
    setOwnProgress(0)
  }
  const handleRunOwn = () => {
    setOwnProgress(0)
    setOwnStatus('running')
  }

  const guessLabel = prediction === null ? '' : PREDICTION_CHOICES.find((c) => c.value === prediction)!.label
  const partOneRows = barRowsFor('particle', SECTION_A_SPEED, SECTION_A_PASSING_SPEED, status, progress)
  const ownRows = barRowsFor(kind, speed, passingSpeed, ownStatus, ownProgress)
  const pinkFrame = { borderLeft: `4px solid ${PART_TWO_COLOR}`, paddingLeft: '0.75rem' } as const

  const wordsEntries = [
    ...energyMomentumWordsEntries(partOneDone),
    ...(partTwoShown ? PART_TWO_REFERENCE_ENTRIES : []),
    ...(partThreeShown ? PART_THREE_REFERENCE_ENTRIES : []),
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — Energy, Momentum and Mass: What Do All Observers Agree On?</h2>

      <div id={PART_ONE_ID} className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Section A: Energy and momentum, seen by different observers</h3>
        <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1rem' }}>
          {!partTwoShown && <span style={{ color: 'var(--text-muted)' }}>Already know this? </span>}
          <button
            type="button"
            onClick={() => {
              if (partTwoShown) document.getElementById(PART_TWO_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              else setSkippedToPartTwo(true)
            }}
            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {partTwoShown ? 'Go to Section B - Collision ↓' : 'Skip to Section B - Collision'}
          </button>
          {' · '}
          <button
            type="button"
            onClick={goToPartThree}
            style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {partThreeShown ? 'Go to Section C - Reactions ↓' : 'Skip to Section C - Reactions'}
          </button>
        </p>

        {/* ===== Above Part 1: the introduction, the words and the links ===== */}
        <EnergyMomentumIntro />
        <ReferencePanel entries={wordsEntries} />
        <EnergyMomentumLinks />

        {/* ===== Part 1 ===== */}
        <PartHeader color={PART_ONE_COLOR} title="Part 1: Predict, then watch">
          You will predict what two observers who move differently will find when they measure the same particle, then press Run and watch. Your guess is drawn on the real bars in
          white. It never changes them.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            A particle with mass is moving past the lab at <strong>{SECTION_A_SPEED}c</strong>. The lab measures its energy and its momentum. A passing observer, who moves past the lab at{' '}
            <strong>+{SECTION_A_PASSING_SPEED}c</strong> in the same direction, measures them too. What do you think the two observers find for this particle?
          </p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.5rem' }}>Your guess is drawn on the bars in Picture 2, in white.</p>
          <div>
            {PREDICTION_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                disabled={locked}
                onClick={() => setPrediction(choice.value)}
                className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
                style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: locked ? 'not-allowed' : 'pointer' }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={smallNote}>
            {prediction === null
              ? 'Choose an option to continue'
              : locked
                ? 'Your prediction is locked while you try other settings. To change it, press Start over.'
                : `Your prediction: ${guessLabel.slice(0, 3)}. You can still change it until you press Run.`}
          </p>
        </div>

        <button type="button" className="action-button" onClick={handleRun} disabled={prediction === null || locked} style={{ padding: '0.6rem 1.5rem' }}>
          {status === 'running' ? 'Running...' : locked ? 'Run (done)' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{ marginLeft: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: startOverDisabled ? 'not-allowed' : 'pointer', opacity: startOverDisabled ? 0.5 : 1 }}
        >
          Start over
        </button>
        {prediction === null && <p style={smallNote}>Choose a prediction above to run the experiment.</p>}

        <p style={pictureTitle}>Picture 1: the map of energy and momentum</p>
        <Diagram kind="particle" speed={SECTION_A_SPEED} passingSpeed={SECTION_A_PASSING_SPEED} progress={status === 'idle' ? null : progress} />
        <MapCaption kind="particle" speed={SECTION_A_SPEED} passingSpeed={SECTION_A_PASSING_SPEED} started={status !== 'idle'} done={partOneDone} />

        {status === 'idle' ? (
          <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1rem' }}>Picture 2, the bars, and your white guess on them, appear here when you press Run.</p>
        ) : (
          <>
            <p style={pictureTitle}>Picture 2: the bars{prediction !== null ? ', with your guess in white' : ''}</p>
            <ReadingBars rows={partOneRows} guess={prediction} />
            <BarsCaption
              kind="particle"
              speed={SECTION_A_SPEED}
              passingSpeed={SECTION_A_PASSING_SPEED}
              started
              done={partOneDone}
              guess={prediction}
            />
          </>
        )}

        {/* ===== Part 2: appears when the first Run has finished ===== */}
        {partOneDone && (
          <>
            <PartHeader color={PART_TWO_COLOR} title="Part 2: Now try it yourself">
              You choose a different object (a light pulse instead of a particle), a different speed for the particle, or a different speed for the passing observer, and run it again. These
              choices change the drawings. Your prediction does not. They are trial values for an imagined particle, and they do not say that a real particle is like that.
            </PartHeader>

            <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
              Your prediction does not change the drawings or the tables. These settings change Drawing A and Drawing B below, and they do not change Part 3's table, which is for Part 1's run.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>What moves past the lab?</label>
              <div style={{ marginBottom: '1rem' }}>
                {KIND_CHOICES.map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    disabled={ownStatus === 'running'}
                    onClick={() => chooseOwn(() => setKind(choice.value))}
                    className={`toggle-button${kind === choice.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>

              {kind === 'particle' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The particle's speed in the lab</label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                    It is given as a fraction of <strong>c</strong>, the speed of light. The particle moves to the right. 0c means it is at rest in the lab.
                  </p>
                  <div>
                    {PARTICLE_SPEED_PRESETS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        disabled={ownStatus === 'running'}
                        onClick={() => chooseOwn(() => setSpeed(value))}
                        className={`toggle-button${speed === value ? ' is-selected' : ''}`}
                        style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        {value === 0 ? '0c (at rest)' : `${value}c`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The passing observer's speed</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                The passing observer moves past the lab, along the same line. A plus sign means they move to the right, and a minus sign to the left. 0c means they are at rest in the lab, like
                the lab itself.
              </p>
              <div>
                {PASSING_SPEED_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={ownStatus === 'running'}
                    onClick={() => chooseOwn(() => setPassingSpeed(value))}
                    className={`toggle-button${passingSpeed === value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {passingLabel(value)}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="action-button" onClick={handleRunOwn} disabled={ownStatus === 'running'} style={{ padding: '0.6rem 1.5rem' }}>
              {ownStatus === 'running' ? 'Running...' : 'Run these settings'}
            </button>
            {!ranLight && (
              <p style={smallNote}>The tutor's paragraph about light appears after you have run a light pulse here. Choose "A light pulse" and press Run these settings.</p>
            )}

            {ownStatus === 'idle' ? (
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1rem' }}>
                Choose an object and speeds, then press Run these settings. Drawing A (the map) and Drawing B (the bars) appear here.
              </p>
            ) : (
              <>
                <div style={pinkFrame}>
                  <p style={{ ...pictureTitle, color: PART_TWO_COLOR }}>
                    Drawing A: the map, for your settings ({kind === 'particle' ? `a particle at ${speed}c` : 'a light pulse'}, passing observer at {passingLabel(passingSpeed)})
                  </p>
                  <Diagram kind={kind} speed={speed} passingSpeed={passingSpeed} progress={ownProgress} />
                  <MapCaption kind={kind} speed={speed} passingSpeed={passingSpeed} started done={ownStatus === 'complete'} own />
                  <p style={{ ...pictureTitle, color: PART_TWO_COLOR }}>Drawing B: the bars, for your settings</p>
                  <ReadingBars rows={ownRows} />
                  <BarsCaption kind={kind} speed={speed} passingSpeed={passingSpeed} started done={ownStatus === 'complete'} own guess={null} />
                </div>
              </>
            )}

            {/* ===== Part 3: the results of Part 1's run ===== */}
            <PartHeader color={PART_THREE_COLOR} title="Part 3: The results">
              Here are the numbers behind Part 1's pictures, a check-up of this page against its own physics, and your guess beside the real result. The check-up and the tables never change
              with your prediction or with the settings you tried in Part 2.
            </PartHeader>
            {prediction !== null && <EnergyMomentumResultsTables prediction={prediction} />}
            <EnergyMomentumSources />

            {/* ===== Part 4: the tutor ===== */}
            <PartHeader color={PART_FOUR_COLOR} title="Part 4: The tutor">
              The tutor asks three questions, one at a time: what you saw, how your guess compares with the pictures, and one question about the particle's own observer. Then it goes through
              your guess and explains. The tutor's questions are not marked.
            </PartHeader>
          </>
        )}
      </div>

      {partOneDone && prediction !== null && (
        <EnergyMomentumTutor
          key={resetCount}
          kind="particle"
          speed={SECTION_A_SPEED}
          passingSpeed={SECTION_A_PASSING_SPEED}
          predicted={prediction}
          ranLight={ranLight}
          onExplained={() => setPartOneExplained(true)}
        />
      )}

      {partTwoShown && (
        <div id={PART_TWO_ID}>
          <EnergyMomentumCollision
            skippedPartOne={(skippedToPartTwo || skippedToPartThree) && !partOneExplained}
            onBackToPartOne={() => document.getElementById(PART_ONE_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            onExplained={() => setPartTwoExplained(true)}
            onGoToPartThree={goToPartThree}
            partThreeShown={partThreeShown}
          />
        </div>
      )}

      {partThreeShown && (
        <div id={PART_THREE_ID}>
          <EnergyMomentumReactions
            skippedPartOne={(skippedToPartTwo || skippedToPartThree) && !partOneExplained}
            skippedPartTwo={skippedToPartThree && !partTwoExplained}
            onBackToPartOne={() => document.getElementById(PART_ONE_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            onBackToPartTwo={() => document.getElementById(PART_TWO_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            onComplete={onComplete}
            onTutorComplete={onTutorComplete}
          />
        </div>
      )}
    </div>
  )
}
