import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  SECTION_B_PASSING_SPEED,
  SECTION_B_PIECE_MASS,
  decayMassGuessMarker,
  passingObserverMassGuessMarker,
  runDecay,
} from '../physics/makingNewParticles'
import type { DecayMassGuess, PassingObserverMassGuess } from '../physics/makingNewParticles'
import { MakingNewParticlesDecayTutor } from './MakingNewParticlesDecayTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'
import {
  CollisionToDecayCaption,
  CollisionToDecayLead,
  CollisionToDecayPicture,
  DecayBookkeepingCaption,
  DecayBookkeepingLead,
  DecayBookkeepingPicture,
  LastingTimesCaption,
  LastingTimesLead,
  LastingTimesPicture,
  MakingNewParticlesDecayLinks,
  SECTION_B_REFERENCE_ENTRIES,
  SectionBFormulasAndJob,
  SectionBIntroduction,
} from './MakingNewParticlesDecayIntro'
import { DecayResults } from './MakingNewParticlesDecayResults'

// Spacetime Geometry 6, Section B (decay; the experiment's "Part 2" until the audit of 2026-11-22). Audit update of 2026-11-23 (wording in
// docs/audit/spacetime-geometry/06-draft-wording-section-b.md, approved by the owner on 2026-11-23: "all defaults").
// Section B is in four Parts. Part 1 is one fixed run (pieces of 0.25 of the parent's mass, a passing observer at +0.3c) with two guesses, required before Run: how the
// pieces' rest masses added up compare with the parent's (a white tick on the ledger's grey bar) and whether the passing observer finds the same system's mass as the lab
// (a white tick on the purple bar). Part 2 lets the learner choose r and the passing observer's speed; Part 3 has the results of Part 1's run; Part 4 the tutor.
// Parts 2 to 4 appear after the first Run, the guesses lock at Run, and Start over clears Section B. Every number comes from `runDecay` (CLAUDE.md §9).

const PART_ONE_COLOR = '#d97706'
const PART_TWO_COLOR = '#be185d'
const PART_THREE_COLOR = '#0f766e'
const PART_FOUR_COLOR = '#0066cc'
const GUESS_COLOR = '#ffffff'

const GUESS1_CHOICES: { value: DecayMassGuess; label: string }[] = [
  { value: 'less', label: "(a) The pieces' masses add up to less than the parent's mass." },
  { value: 'same', label: "(b) The same as the parent's mass." },
  { value: 'more', label: "(c) More than the parent's mass." },
]
const GUESS2_CHOICES: { value: PassingObserverMassGuess; label: string }[] = [
  { value: 'same', label: "(a) The same as the lab's." },
  { value: 'different', label: "(b) Not the same as the lab's." },
]

const MASS_PRESETS: { value: number; label: string }[] = [
  { value: 0, label: '0 (pieces of light)' },
  { value: 0.1, label: '0.1' },
  { value: 0.25, label: '0.25' },
  { value: 0.4, label: '0.4' },
  { value: 0.5, label: '0.5' },
  { value: 0.6, label: '0.6' },
]
const PASSING_SPEED_PRESETS = [-0.6, -0.3, 0.3, 0.6]

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
const PASSING_COLOR = '#c4b5fd'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

const VIEW_WIDTH = 520
const VIEW_HEIGHT = 560
const CENTER_X = 260
const PARENT_RADIUS = 22

function formatNumber(value: number, digits = 2): string {
  const text = value.toFixed(digits)
  return /^-0\.0+$/.test(text) ? text.slice(1) : text.replace('-', '−')
}

function passingLabel(speed: number): string {
  return `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
const ANIMATION_DURATION_MS = 12_000
// The share of the playback used by each stage: the lab's picture, then the passing observer's picture, then the ledger bars.
const LAB_END = 0.4
const OBSERVER_END = 0.8
// Pixels the pieces travel for each 1c of speed, the same in both pictures so that speeds can be compared.
const PIXELS_PER_SPEED = 150
const PICTURE_HEIGHT = 330
const LIGHT_COLOR = '#facc15'

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

// Where a picture is in its own story, from 0 to 1: a pause with the parent, a flash as it splits, then the pieces moving apart.
function panelStory(q: number): { split: boolean; move: number; flash: number } {
  const move = clamp01((q - 0.3) / 0.7)
  return { split: q >= 0.2, move: move * move * (3 - 2 * move), flash: q >= 0.2 && q < 0.35 ? 1 - (q - 0.2) / 0.15 : 0 }
}

function speedWords(speed: number): string {
  if (Math.abs(speed) < 5e-10) return 'at rest'
  return `${speed > 0 ? 'moving right' : 'moving left'}`
}

interface PieceShape {
  name: string
  note: string
  isLight: boolean
  restMass: number
  energy: number
  momentumTimesC: number
  speed: number
}

interface PanelProps {
  top: number
  title: string
  subtitle: string
  color: string
  q: number
  allowed: boolean
  parent: { energy: number; momentumTimesC: number; speed: number }
  pieces: PieceShape[]
  arrowId: string
}

// One picture of the decay. Before the split it shows the parent (with an arrow if it is moving). After the split it shows the two
// pieces moving apart from the place where the parent was. The labels stay where the pieces end up, so they do not move while
// the pieces do. If the decay is not allowed, the parent stays and the picture says so.
function DecayPanel({ top, title, subtitle, color, q, allowed, parent, pieces, arrowId }: PanelProps) {
  const story = panelStory(q)
  const lineY = top + 96
  const showPieces = allowed && story.split
  const finalXs = pieces.map((p) => CENTER_X + p.speed * PIXELS_PER_SPEED)
  const labelXs = [...finalXs]
  if (pieces.length === 2 && Math.abs(finalXs[0] - finalXs[1]) < 150) {
    const mid = (finalXs[0] + finalXs[1]) / 2
    const order = finalXs[0] <= finalXs[1] ? [0, 1] : [1, 0]
    labelXs[order[0]] = mid - 75
    labelXs[order[1]] = mid + 75
  }
  const arrow = (x: number, speed: number, radius: number) =>
    Math.abs(speed) < 5e-10 ? null : (
      <line
        x1={x + Math.sign(speed) * (radius + 4)}
        y1={lineY}
        x2={x + Math.sign(speed) * (radius + 4 + 14 + 40 * Math.abs(speed))}
        y2={lineY}
        stroke={color}
        strokeWidth="2.5"
        markerEnd={`url(#${arrowId})`}
      />
    )

  return (
    <g>
      <text x="12" y={top + 16} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        {title}
      </text>
      <text x="12" y={top + 32} fontSize="11" fill={MUTED_COLOR}>
        {subtitle}
      </text>
      <line x1="20" y1={lineY} x2={VIEW_WIDTH - 20} y2={lineY} stroke={TICK_COLOR} strokeWidth="1" strokeDasharray="2 5" />

      {(!showPieces || !allowed) && (
        <g>
          {arrow(CENTER_X, parent.speed, PARENT_RADIUS)}
          <circle cx={CENTER_X} cy={lineY} r={PARENT_RADIUS} fill={color} stroke="#0b1020" strokeWidth="1.5" />
          <text x={CENTER_X} y={lineY - 36} fontSize="12" fontWeight="bold" textAnchor="middle" fill={color} style={HALO}>
            The parent
          </text>
          <text x={CENTER_X} y={lineY - 22} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
            {Math.abs(parent.speed) < 5e-10 ? 'at rest' : `${speedWords(parent.speed)}, ${formatNumber(Math.abs(parent.speed))}c`}
          </text>
          {!showPieces && (
            <g>
              <text x={CENTER_X} y={lineY + 40} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                mass 1
              </text>
              <text x={CENTER_X} y={lineY + 54} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                energy {formatNumber(parent.energy)}
              </text>
              <text x={CENTER_X} y={lineY + 68} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                momentum × c {formatNumber(parent.momentumTimesC)}
              </text>
            </g>
          )}
        </g>
      )}

      {story.flash > 0 && allowed && (
        <circle
          cx={CENTER_X}
          cy={lineY}
          r={PARENT_RADIUS + 20 * (1 - story.flash)}
          fill="none"
          stroke="#facc15"
          strokeWidth="3"
          opacity={story.flash}
        />
      )}

      {showPieces &&
        pieces.map((p, i) => {
          const x = CENTER_X + p.speed * PIXELS_PER_SPEED * story.move
          const radius = Math.max(PARENT_RADIUS * Math.sqrt(p.restMass), 6)
          return (
            <g key={p.name}>
              {p.isLight ? (
                <line
                  x1={x - Math.sign(p.speed) * 18}
                  y1={lineY}
                  x2={x + Math.sign(p.speed) * 18}
                  y2={lineY}
                  stroke={LIGHT_COLOR}
                  strokeWidth="3.5"
                  markerEnd={`url(#decay-arrowhead-${LIGHT_COLOR.slice(1)})`}
                />
              ) : (
                <g>
                  {arrow(x, p.speed, radius)}
                  <circle cx={x} cy={lineY} r={radius} fill={color} stroke="#0b1020" strokeWidth="1.5" />
                </g>
              )}
              <text
                x={labelXs[i]}
                y={lineY - 36}
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fill={p.isLight ? LIGHT_COLOR : color}
                style={HALO}
              >
                {p.name}
              </text>
              <text x={labelXs[i]} y={lineY - 22} fontSize="10" textAnchor="middle" fill={p.isLight ? LIGHT_COLOR : color} style={HALO}>
                {p.note}
              </text>
              <text x={labelXs[i]} y={lineY + 40} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                {p.isLight ? 'speed 1c (light)' : `speed ${formatNumber(Math.abs(p.speed))}c`}
              </text>
              <text x={labelXs[i]} y={lineY + 54} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                energy {formatNumber(p.energy)}
              </text>
              <text x={labelXs[i]} y={lineY + 68} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                momentum × c {formatNumber(p.momentumTimesC)}
              </text>
              <text x={labelXs[i]} y={lineY + 82} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                rest mass {formatNumber(p.restMass)}
              </text>
            </g>
          )
        })}

      {!allowed && q >= 0.3 && (
        <g>
          <text x={CENTER_X} y={lineY + 100} fontSize="12" fontWeight="bold" textAnchor="middle" fill="#fb923c" style={HALO}>
            No decay can happen.
          </text>
          <text x={CENTER_X} y={lineY + 116} fontSize="11" textAnchor="middle" fill="#fb923c" style={HALO}>
            The pieces would weigh more than the parent.
          </text>
        </g>
      )}
    </g>
  )
}

interface DecayDiagramProps {
  passingSpeed: number
  pieceMass: number
  // null while idle (only the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
}
export function DecayDiagram({ passingSpeed, pieceMass, progress }: DecayDiagramProps) {
  const result = runDecay(pieceMass, passingSpeed)
  const playing = progress !== null
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  const observerQ = playing ? clamp01((progress - LAB_END) / (OBSERVER_END - LAB_END)) : 0
  const showObserver = playing && progress > LAB_END
  const parent = result.labParent
  const shapeOf = (pieces: typeof result.labPieces): PieceShape[] =>
    pieces.map((piece, i) => ({
      name: pieceMass === 0 ? `Light pulse ${i + 1}` : `Piece ${i + 1}`,
      note: `went ${i === 0 ? 'right' : 'left'} in the lab`,
      isLight: pieceMass === 0,
      restMass: piece.restMass,
      energy: piece.reading.energy,
      momentumTimesC: piece.reading.momentumTimesC,
      speed: piece.reading.speed,
    }))
  const arrowIds = (color: string) => `decay-arrowhead-${color.slice(1)}`
  const labPieces = shapeOf(result.labPieces)
  const passingPieces = shapeOf(result.passingPieces)
  const resultNote = playing
    ? ` In the lab, ${result.allowed ? `the parent splits into two ${pieceMass === 0 ? 'light pulses' : 'pieces'}.` : 'no decay can happen.'}`
    : ''
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`${playing ? 'Playback' : 'Setup'}: in the lab, a parent particle sits at rest, with a mass of 1, an energy of ${parent.energy.toFixed(2)} and a momentum times c of ${parent.momentumTimesC.toFixed(2)}. A passing observer moves along the same line at ${passingLabel(passingSpeed)}.${resultNote}`}
      style={SVG_STYLE}
    >
      <defs>
        {[PASSING_COLOR, LAB_COLOR, LIGHT_COLOR].map((color) => (
          <marker
            key={color}
            id={arrowIds(color)}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>
      <text x="12" y="16" fontSize="11" fill={MUTED_COLOR}>
        Energy is in the parent's rest energies. Momentum is shown as momentum × c.
      </text>
      <text x="12" y="30" fontSize="11" fill={MUTED_COLOR}>
        Both pictures are on the same scale.
      </text>
      <g transform="translate(0 28)">
        <DecayPanel
          top={0}
          title="Picture 1: the lab's view"
          subtitle="The lab is at rest, and so is the parent."
          color={LAB_COLOR}
          q={labQ}
          allowed={result.allowed}
          parent={{ energy: parent.energy, momentumTimesC: parent.momentumTimesC, speed: 0 }}
          pieces={labPieces}
          arrowId={arrowIds(LAB_COLOR)}
        />

        {/* The passing observer, marked in the setup: a hollow circle with an arrow for their way and speed. */}
        <circle cx={CENTER_X} cy="234" r="8" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
        <line
          x1={CENTER_X + Math.sign(passingSpeed) * 14}
          y1="234"
          x2={CENTER_X + Math.sign(passingSpeed) * (14 + 20 + 80 * Math.abs(passingSpeed))}
          y2="234"
          stroke={PASSING_COLOR}
          strokeWidth="2.5"
          markerEnd={`url(#${arrowIds(PASSING_COLOR)})`}
        />
        <text x={CENTER_X} y="264" fontSize="12" fontWeight="bold" textAnchor="middle" fill={PASSING_COLOR}>
          The passing observer
        </text>
        <text x={CENTER_X} y="280" fontSize="11" textAnchor="middle" fill={PASSING_COLOR}>
          moves at {passingLabel(passingSpeed)} ({passingSpeed > 0 ? 'to the right' : 'to the left'}), along the same line
        </text>

        {showObserver ? (
          <DecayPanel
            top={PICTURE_HEIGHT - 30}
            title="Picture 2: the same decay, as the passing observer measures it"
            subtitle="Their ruler and clocks move with them, so for them they are at rest."
            color={PASSING_COLOR}
            q={observerQ}
            allowed={result.allowed}
            parent={{
              energy: result.passingParent.energy,
              momentumTimesC: result.passingParent.momentumTimesC,
              speed: result.passingParent.speed,
            }}
            pieces={passingPieces}
            arrowId={arrowIds(PASSING_COLOR)}
          />
        ) : (
          <text x="12" y={PICTURE_HEIGHT - 10} fontSize="11" fill={MUTED_COLOR}>
            {playing
              ? 'Next, the same decay as the passing observer measures it.'
              : 'Press Run to see the decay, and then how the passing observer measures it.'}
          </text>
        )}
      </g>
    </svg>
  )
}

const LEDGER_BAR_WIDTH = 340
// The scale never depends on a guess: it leaves room for the guess ticks (up to 1.25 of the parent's bar) and for a sum of the pieces' rest masses of up to 1.2.
const LEDGER_FULL_SCALE = 1.25
const LEDGER_ROW_HEIGHT = 22
const LEDGER_TOP = 50
const LEDGER_ROW_STEP = 60

// The ledger: bars for the parent's mass and the sum of the pieces' rest masses, and bars for the system's mass of the pieces, as the lab and the passing observer find it.
// `fill` is how much of each bar is drawn, from 0 to 1. With `guess1` and `guess2` (Part 1 only) a white tick and a YOUR GUESS box are drawn once the bars are full. They are only
// markers and change no bar.
export function DecayLedger({
  pieceMass,
  passingSpeed,
  fill,
  guess1,
  guess2,
  withGuesses = false,
}: {
  pieceMass: number
  passingSpeed: number
  fill: number
  guess1?: DecayMassGuess | null
  guess2?: PassingObserverMassGuess | null
  // True for Part 1's ledger, which keeps room for the two guess boxes.
  withGuesses?: boolean
}) {
  const result = runDecay(pieceMass, passingSpeed)
  const full = fill >= 1
  const scale = LEDGER_BAR_WIDTH / Math.max(LEDGER_FULL_SCALE, result.sumOfRestMasses)
  const rows: { name: string; value: number; color: string }[] = [
    { name: "The parent's mass", value: 1, color: LAB_COLOR },
    { name: 'Sum of the pieces’ rest masses', value: result.sumOfRestMasses, color: '#94a3b8' },
  ]
  if (result.allowed) {
    rows.push({ name: "The system's mass of the pieces, as the lab finds it", value: result.systemMassLab, color: LAB_COLOR })
    rows.push({
      name: "The system's mass of the pieces, as the passing observer finds it",
      value: result.systemMassPassing,
      color: PASSING_COLOR,
    })
  }
  const rowY = (i: number) => LEDGER_TOP + i * LEDGER_ROW_STEP + 16
  const rowsBottom = LEDGER_TOP + rows.length * LEDGER_ROW_STEP
  const boxTop = rowsBottom + 6
  const height = withGuesses ? boxTop + 54 + 36 : LEDGER_TOP + rows.length * LEDGER_ROW_STEP + 50
  const tick1 = full && withGuesses && guess1 ? decayMassGuessMarker(guess1) : null
  const tick2 = full && withGuesses && guess2 && result.allowed ? passingObserverMassGuessMarker(guess2, result) : null
  const x = (position: number) => 12 + position * scale
  const boxText = (label: string) => label.replace('YOUR GUESS: ', '')
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      role="img"
      aria-label={`Mass ledger. The parent's mass is 1. The sum of the pieces' rest masses is ${result.sumOfRestMasses.toFixed(2)}.${result.allowed ? ` The system's mass of the pieces is ${result.systemMassLab.toFixed(2)} for the lab and ${result.systemMassPassing.toFixed(2)} for the passing observer. The mass given up is ${result.massGivenUp.toFixed(2)}.` : ' No decay can happen, because the pieces would weigh more than the parent.'}${tick1 ? ` Your first guess, ${boxText(tick1.label)}, is marked by a white tick on the grey bar's row.` : ''}${tick2 ? ` Your second guess, ${boxText(tick2.label)}, is marked by a white tick on the passing observer's bar.` : ''}`}
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The mass ledger
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        Masses are in the parent's rest energies. A longer bar is a larger mass.
      </text>
      {rows.map((row, i) => {
        const y = rowY(i)
        return (
          <g key={row.name}>
            <text x="12" y={y - 4} fontSize="11" fill={TEXT_COLOR}>
              {row.name}
            </text>
            <rect x="12" y={y + 2} width={Math.max(row.value * scale * fill, 0)} height={LEDGER_ROW_HEIGHT} fill={row.color} />
            {full && (
              <text x="12" y={y + LEDGER_ROW_HEIGHT + 16} fontSize="10" fill={MUTED_COLOR}>
                {formatNumber(row.value, 3)}
              </text>
            )}
          </g>
        )
      })}
      {/* The guesses: white ticks on the grey bar's row and on the passing observer's bar, each joined to a large YOUR GUESS box. They are only markers. */}
      {tick1 && (
        <g>
          <line x1={x(tick1.tickPosition)} y1={rowY(1) - 2} x2={x(tick1.tickPosition)} y2={rowY(1) + LEDGER_ROW_HEIGHT + 6} stroke={GUESS_COLOR} strokeWidth="4" />
          <polyline
            points={`${x(tick1.tickPosition)},${rowY(1) + 2 + LEDGER_ROW_HEIGHT / 2} 505,${rowY(1) + 2 + LEDGER_ROW_HEIGHT / 2} 505,${boxTop}`}
            fill="none"
            stroke={GUESS_COLOR}
            strokeWidth="2"
          />
          <rect x={266} y={boxTop} width="246" height="54" rx="6" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="3" />
          <text x={389} y={boxTop + 22} textAnchor="middle" fontSize="16" fontWeight="bold" fill={GUESS_COLOR}>
            YOUR GUESS
          </text>
          <text x={389} y={boxTop + 40} textAnchor="middle" fontSize="12" fill={GUESS_COLOR}>
            {boxText(tick1.label)}
          </text>
        </g>
      )}
      {tick2 && (
        <g>
          <line x1={x(tick2.tickPosition)} y1={rowY(3) - 2} x2={x(tick2.tickPosition)} y2={rowY(3) + LEDGER_ROW_HEIGHT + 6} stroke={GUESS_COLOR} strokeWidth="4" />
          <line x1={x(tick2.tickPosition)} y1={rowY(3) + LEDGER_ROW_HEIGHT + 6} x2={133} y2={boxTop} stroke={GUESS_COLOR} strokeWidth="2" />
          <rect x={12} y={boxTop} width="246" height="54" rx="6" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="3" />
          <text x={135} y={boxTop + 22} textAnchor="middle" fontSize="16" fontWeight="bold" fill={GUESS_COLOR}>
            YOUR GUESS
          </text>
          <text x={135} y={boxTop + 40} textAnchor="middle" fontSize="12" fill={GUESS_COLOR}>
            {boxText(tick2.label)}
          </text>
        </g>
      )}
      {full && (
        <text x="12" y={height - 16} fontSize="12" fontWeight="bold" fill={result.allowed ? TEXT_COLOR : '#fb923c'}>
          {result.allowed
            ? `Mass given up: 1 − ${formatNumber(result.sumOfRestMasses)} = ${formatNumber(result.massGivenUp)}`
            : `The pieces would weigh ${formatNumber(result.sumOfRestMasses)}, more than the parent's 1: no decay can happen.`}
        </text>
      )}
    </svg>
  )
}

const CAPTION: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }

// The caption under the two decay pictures. Every look-for item is drawn only once its feature is drawn (Picture 2's after the lab's picture has played).
export function DecayDiagramCaption({
  pieceMass,
  passingSpeed,
  progress,
  own = false,
}: {
  pieceMass: number
  passingSpeed: number
  progress: number | null
  own?: boolean
}) {
  const result = runDecay(pieceMass, passingSpeed)
  const f = (v: number) => formatNumber(v, 2)
  const playing = progress !== null
  const lab1 = result.labPieces[0]
  const pass1 = result.passingPieces[0]
  const pass2 = result.passingPieces[1]
  const items: { look: string; means: string; matters: string }[] = []
  if (playing && progress > 0.2 * LAB_END && result.allowed && lab1) {
    items.push({
      look: 'the yellow ring and then the two pieces in Picture 1',
      means: `the parent splits into two ${pieceMass === 0 ? 'pulses of light' : 'pieces'} with E = ${f(lab1.reading.energy)} each and pc = +${f(lab1.reading.momentumTimesC)} and −${f(lab1.reading.momentumTimesC)}, each moving at ${pieceMass === 0 ? '1c (light)' : `${f(Math.abs(lab1.reading.speed))}c`}`,
      matters: 'equal and opposite momenta cancel, as the parent’s total momentum of 0 requires',
    })
  }
  if (playing && progress > LAB_END && result.allowed && pass1 && pass2) {
    items.push({
      look: 'the numbers under the two pieces in Picture 2',
      means: `the passing observer finds energies of ${f(pass1.reading.energy)} and ${f(pass2.reading.energy)} and momenta of ${f(pass1.reading.momentumTimesC)} and ${f(pass2.reading.momentumTimesC)}, not the lab’s ${f(lab1.reading.energy)} and ±${f(lab1.reading.momentumTimesC)}`,
      matters: 'observers can disagree about energy and momentum, which is why the questions are about the system’s mass',
    })
  }
  return (
    <div style={CAPTION}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> The diagram shows one decay twice: first as the lab measures it (Picture 1), and then as a passing observer measures it (Picture 2).{' '}
        {own ? 'Your settings' : 'The choices here'} are r = {pieceMass === 0 ? '0 (pieces of light)' : pieceMass} for the pieces' mass and {passingLabel(passingSpeed)} for the passing observer. Both
        pictures are on the same scale, so you can compare them directly. (c is the speed of light, so 0.5c is half the speed of light.)
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>The pictures</strong>
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Picture 1, the lab (sky blue).</strong> The lab is at rest, and so is the parent. This picture is there from the start.
        </li>
        <li>
          <strong>Picture 2, the passing observer (purple).</strong> The same decay, measured by someone moving along the same line. It appears during the run, after Picture 1 has played. For
          them, the lab and the parent are moving, so the parent has an arrow, and the pieces have different energies and momenta from the lab's.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>What is drawn in each picture</strong>
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The dashed horizontal line</strong> is the one line along which everything in this experiment moves.
        </li>
        <li>
          <strong>The large circle</strong> is the parent. In Picture 1 it has no arrow because it is at rest. Its numbers are mass, energy and momentum × c. The parent's mass is 1 because the
          parent's rest energy is our unit.
        </li>
        <li>
          <strong>The yellow ring</strong> flashes at the moment of the decay, when the parent splits.
        </li>
        <li>
          <strong>The two smaller circles</strong> are the pieces. A circle's size is a rough picture of its rest mass: a heavier piece is drawn larger. An arrow shows which way a piece moves, and
          a longer arrow means a faster piece. Under each piece are its speed, energy, momentum × c and rest mass. A minus sign on the momentum means it moves to the left.
        </li>
        <li>
          <strong>A yellow arrow with no circle</strong> is a pulse of light. It appears when r = 0. A pulse of light has no mass, so it has no circle, and it always moves at the speed of light.
        </li>
        <li>
          <strong>The labels "went right in the lab" and "went left in the lab"</strong> let you follow the same piece from Picture 1 to Picture 2, even if the passing observer sees both pieces
          moving the same way.
        </li>
        <li>
          <strong>The hollow purple circle</strong> is the passing observer. It is hollow because it is not a particle in the experiment, only someone who watches and measures. Its arrow shows which
          way they move, and a longer arrow means a faster observer.
        </li>
      </ul>
      {items.length > 0 && (
        <>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList items={items} />
        </>
      )}
      <p style={{ margin: '0.75rem 0 0' }}>Not shown: how long the parent waits before it decays, or whether it will decay at all. Only energy and momentum are tracked.</p>
      <WhereFrom>
        <strong>Calculated here:</strong> every number and picture, from the rules of special relativity in Experiment 5. <strong>Measured:</strong> nothing on this page's pictures. <strong>Imagined
        for the question:</strong> the parent and its pieces (a made-up particle) and the passing observer.
      </WhereFrom>
    </div>
  )
}

// The caption under the mass ledger. The worked moment (r = 0.3) is here, after the ledger is drawn, and every look-for item is about a feature that is drawn.
export function DecayLedgerCaption({ pieceMass, passingSpeed, withGuesses = false }: { pieceMass: number; passingSpeed: number; withGuesses?: boolean }) {
  const result = runDecay(pieceMass, passingSpeed)
  const f = (v: number, d = 2) => formatNumber(v, d)
  const items: { look: string; means: string; matters: string }[] = [
    {
      look: 'the grey bar against the sky-blue parent bar',
      means: result.allowed
        ? `the pieces’ rest masses add up to ${f(result.sumOfRestMasses)}, and the parent’s mass is 1`
        : `the pieces’ rest masses would add up to ${f(result.sumOfRestMasses)}, and the parent’s mass is 1`,
      matters: withGuesses ? 'it is the question of your first guess (the page does not say which answer is right; the tutor does)' : 'it is the comparison at the heart of this section: pieces against parent',
    },
  ]
  if (result.allowed) {
    items.push({
      look: 'the sky-blue and purple "system’s mass" bars',
      means: `the lab finds ${f(result.systemMassLab, 3)} and the passing observer ${f(result.systemMassPassing, 3)}`,
      matters: withGuesses ? 'it is the question of your second guess (the page does not say whether the two are equal)' : 'whether two observers agree on the system’s mass is the question of Experiment 5, asked again here',
    })
    items.push({
      look: `the line of words under the bars, "Mass given up: 1 − ${f(result.sumOfRestMasses)} = ${f(result.massGivenUp)}"`,
      means: 'it is the parent’s mass minus the pieces’ rest masses',
      matters: 'it is the quantity the tutor asks about',
    })
  }
  return (
    <div style={CAPTION}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the mass ledger.</strong> A ledger is a list that keeps track of amounts. This one keeps track of mass. Each bar is one amount, and a longer bar is a larger mass. All
        the masses are in the parent's rest energies, so the parent's mass is 1. The bars fill in from the left at the end of the run.
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The parent's mass</strong> (sky blue) is the mass of the particle before it decays.
        </li>
        <li>
          <strong>The sum of the pieces' rest masses</strong> (grey) is the rest mass of one piece plus the rest mass of the other. A pulse of light counts as zero.
        </li>
        <li>
          <strong>The system's mass of the pieces</strong> is worked out from the pieces' total energy and total momentum, the same way as in Experiment 5. It is shown once as the lab finds it (sky blue)
          and once as the passing observer finds it (purple). These two bars are left out if no decay can happen, because then there are no pieces.
        </li>
        <li>
          <strong>The line of words under the bars</strong> gives the mass given up: the parent's mass minus the sum of the pieces' rest masses. If no decay can happen, it says so instead.
        </li>
        {withGuesses && (
          <li>
            <strong>The white ticks and the YOUR GUESS boxes</strong> show the two answers you chose: one on the grey bar's row, and one on the passing observer's purple bar. <em>They are only
            markers.</em> A tick marks which answer you picked, not a size, and it changes no bar. The first guess "less", "the same" or "more" is marked at 0.75, 1.00 or 1.25 of the parent's
            bar. The second guess "the same" is marked at the end of the lab's bar, and "not the same" at half of it.
          </li>
        )}
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>A worked moment (r = 0.3, which is not one of the buttons).</strong> Each piece has energy 0.5 and momentum × c of √(0.25 − 0.09) = 0.4, so it moves at 0.4 ÷ 0.5 = 0.8c. The two
        pieces' rest masses add up to 0.3 + 0.3 = 0.6, the parent's mass is 1, and the mass given up is 1 − 0.6 = 0.4.
      </p>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
      <WhereFrom>
        <strong>Calculated here:</strong> every bar and number, from the rules of Experiment 5. <strong>Measured:</strong> nothing on the ledger. <strong>Imagined for the question:</strong> the
        parent and pieces (a made-up particle) and the observer.
      </WhereFrom>
    </div>
  )
}

const hint: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }
const smallNote: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }
const answerStyle: CSSProperties = { display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }
const toggleStyle: CSSProperties = { marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }
const pictureTitle: CSSProperties = { fontWeight: 'bold', fontSize: '0.875rem', margin: '1.5rem 0 0.5rem' }

const LINK_BUTTON: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  color: '#0066cc',
  textDecoration: 'underline',
  cursor: 'pointer',
}

type PlayStatus = 'idle' | 'running' | 'complete'

// Plays one run from 0 to 1 over ANIMATION_DURATION_MS. It only sets how fast the result is shown; the physics does not depend on it (§11).
function usePlayback(status: PlayStatus, setStatus: (status: PlayStatus) => void, setProgress: (progress: number) => void, onDone?: () => void) {
  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId: number
    const animate = (currentTime: number) => {
      const fraction = clamp01((currentTime - startTime) / ANIMATION_DURATION_MS)
      setProgress(fraction)
      if (fraction >= 1) {
        setStatus('complete')
        onDone?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])
}

// Section B's card. `skippedPartOne` is true when the learner reached Section B with the skip link instead of through Section A's tutor; the introduction then adds a reminder.
// `onBackToPartOne` scrolls back up to Section A.
export function MakingNewParticlesDecay({
  skippedPartOne = false,
  onBackToPartOne,
  onComplete,
  onExplained,
}: {
  skippedPartOne?: boolean
  onBackToPartOne?: () => void
  // Called when Part 1's playback ends, and when the learner reaches the tutor's explanation (spec, Decision 14).
  onComplete?: () => void
  onExplained?: () => void
}) {
  // ---- Part 1: two guesses, one fixed run ----
  const [guess1, setGuess1] = useState<DecayMassGuess | null>(null)
  const [guess2, setGuess2] = useState<PassingObserverMassGuess | null>(null)
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState<PlayStatus>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the Start overs, so the tutor starts again at its first question.
  const [resetCount, setResetCount] = useState(0)
  // ---- Part 2: the learner's own r and passing speed ----
  const [ownMass, setOwnMass] = useState(SECTION_B_PIECE_MASS)
  const [ownSpeed, setOwnSpeed] = useState(SECTION_B_PASSING_SPEED)
  const [shown, setShown] = useState<{ r: number; speed: number } | null>(null)
  const [ownStatus, setOwnStatus] = useState<PlayStatus>('idle')
  const [ownProgress, setOwnProgress] = useState(0)

  usePlayback(status, setStatus, setProgress, onComplete)
  usePlayback(ownStatus, setOwnStatus, setOwnProgress)

  const r1 = SECTION_B_PIECE_MASS
  const u1 = SECTION_B_PASSING_SPEED
  const partOneDone = status === 'complete'
  const playing = status === 'running' || ownStatus === 'running'
  const bothChosen = guess1 !== null && guess2 !== null
  const startOverDisabled = (guess1 === null && guess2 === null && status === 'idle' && ownStatus === 'idle') || playing
  const guess1Label = GUESS1_CHOICES.find((c) => c.value === guess1)?.label ?? ''
  const guess2Label = GUESS2_CHOICES.find((c) => c.value === guess2)?.label ?? ''
  const pinkFrame = { borderLeft: `4px solid ${PART_TWO_COLOR}`, paddingLeft: '0.75rem' } as const

  const handleRun = () => {
    if (!bothChosen || locked) return
    setLocked(true)
    setProgress(0)
    setStatus('running')
  }
  // Start over: clears the guesses, the runs, the results and the tutor of Section B, and returns Section B to its first state.
  const handleStartOver = () => {
    if (playing) return
    setGuess1(null)
    setGuess2(null)
    setLocked(false)
    setStatus('idle')
    setProgress(0)
    setOwnMass(SECTION_B_PIECE_MASS)
    setOwnSpeed(SECTION_B_PASSING_SPEED)
    setShown(null)
    setOwnStatus('idle')
    setOwnProgress(0)
    setResetCount((n) => n + 1)
  }
  const chooseOwn = (change: () => void) => {
    change()
    setOwnStatus('idle')
    setOwnProgress(0)
  }
  const handleRunOwn = () => {
    setShown({ r: ownMass, speed: ownSpeed })
    setOwnProgress(0)
    setOwnStatus('running')
  }

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Section B: Decay, what happens when a particle comes apart?</h3>
      {onBackToPartOne && (
        <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1rem' }}>
          <button type="button" onClick={onBackToPartOne} style={LINK_BUTTON}>
            ← Back to Section A - Making a new particle
          </button>
        </p>
      )}

      {skippedPartOne && (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>If you skipped Section A.</strong> This section uses the system's mass, M = √(E_total² − (P_total c)²), worked out from the total energy and total momentum of all the particles taken
          together, and the idea of a threshold: a reaction can happen only if the system's mass is at least the total rest mass of everything that comes out. For example, a system with a total
          energy of 5 and a total momentum × c of 3 has M = √(25 − 9) = 4.
        </p>
      )}

      <SectionBIntroduction />
      <div style={{ marginBottom: '1.5rem' }}>
        <DecayBookkeepingLead />
        <DecayBookkeepingPicture />
        <DecayBookkeepingCaption />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <CollisionToDecayLead />
        <CollisionToDecayPicture />
        <CollisionToDecayCaption />
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <LastingTimesLead />
        <LastingTimesPicture />
        <LastingTimesCaption />
      </div>
      <SectionBFormulasAndJob />

      <ReferencePanel entries={SECTION_B_REFERENCE_ENTRIES} />

      <MakingNewParticlesDecayLinks />

      {/* ===== Part 1: predict, then watch ===== */}
      <PartHeader color={PART_ONE_COLOR} title="Part 1: Predict, then watch">
        You will predict how the masses of the two pieces of a decay add up compared with the mass of the particle that decayed, then guess what a passing observer finds for the mass of the whole
        system, press Run and watch the decay. Your guesses are drawn on the real bars in white. They never change them.
      </PartHeader>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction (1 of 2): how the masses compare</p>
        <p style={hint}>
          A particle at rest splits into two equal pieces. Each piece has {r1} times the parent's mass. Compare the total of the pieces' rest masses with the parent's mass. How do they compare?
        </p>
        <p style={hint}>
          <strong>What Run will show.</strong> Pressing Run plays one decay twice. <strong>Picture 1</strong> is the lab's view. <strong>Picture 2</strong> is the same decay as a passing observer
          measures it: someone who moves along the same line at +{u1}c. Then the <strong>mass ledger</strong> fills in. You make two predictions before you press Run: the first is about how the
          masses compare, and the second is about what the passing observer finds for the system's mass.
        </p>
        <div>
          {GUESS1_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              disabled={locked}
              onClick={() => setGuess1(choice.value)}
              className={`toggle-button${guess1 === choice.value ? ' is-selected' : ''}`}
              style={answerStyle}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p style={{ ...smallNote, marginBottom: 0 }}>
          {guess1 === null
            ? 'Choose an option to continue'
            : locked
              ? 'Your prediction is locked while you try other settings. To change it, press Start over.'
              : `Your prediction: ${guess1Label.slice(0, 3)}. You can still change it until you press Run.`}
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction (2 of 2): the passing observer</p>
        <p style={hint}>
          Now think about the purple picture, where a passing observer who moves at +{u1}c watches the same decay. They measure each piece's energy and momentum for themselves, and they add those up, and
          they work out the system's mass of the two pieces with the same formula, M = √(E_total² − (P_total c)²). The lab did the same with its own numbers. Is the system's mass the passing observer
          finds the same as the lab's?
        </p>
        <div>
          {GUESS2_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              disabled={locked}
              onClick={() => setGuess2(choice.value)}
              className={`toggle-button${guess2 === choice.value ? ' is-selected' : ''}`}
              style={answerStyle}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p style={{ ...smallNote, marginBottom: 0 }}>
          {guess2 === null
            ? 'Choose an option to continue'
            : locked
              ? 'Your prediction is locked while you try other settings. To change it, press Start over.'
              : `Your prediction: ${guess2Label.slice(0, 3)}. You can still change it until you press Run.`}
        </p>
      </div>

      <button type="button" className="action-button" onClick={handleRun} disabled={!bothChosen || locked} style={{ padding: '0.6rem 1.5rem' }}>
        {status === 'running' ? 'Running...' : locked ? 'Run (done)' : 'Run (the lab, then the passing observer)'}
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
      {!bothChosen && <p style={smallNote}>Choose both predictions above to run the experiment.</p>}

      <p style={pictureTitle}>Pictures 1 and 2: the decay, as the lab sees it and as the passing observer sees it</p>
      <DecayDiagram passingSpeed={u1} pieceMass={r1} progress={status === 'idle' ? null : progress} />
      {status === 'idle' && (
        <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.75rem' }}>
          Picture 2, the mass ledger and your two white guesses (one on the grey bar, one on the passing observer's bar) appear in these pictures when you press Run.
        </p>
      )}
      <DecayDiagramCaption pieceMass={r1} passingSpeed={u1} progress={status === 'idle' ? null : progress} />

      {status !== 'idle' && progress > OBSERVER_END && (
        <div style={{ marginTop: '1.5rem' }}>
          <DecayLedger
            pieceMass={r1}
            passingSpeed={u1}
            fill={clamp01((progress - OBSERVER_END) / (1 - OBSERVER_END))}
            guess1={guess1}
            guess2={guess2}
            withGuesses
          />
          <DecayLedgerCaption pieceMass={r1} passingSpeed={u1} withGuesses />
        </div>
      )}

      {/* ===== Part 2: appears when the first Run has finished ===== */}
      {partOneDone && (
        <>
          <PartHeader color={PART_TWO_COLOR} title="Part 2: Now try it yourself">
            You choose how heavy each piece is (r) and how fast the passing observer moves, and press Run these settings. These choices change the drawings. Your predictions do not. They are trial values
            for an imagined particle, and they do not say that a real particle is like that.
          </PartHeader>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            Your predictions do not change the drawings or the tables. These settings change the two pictures and the ledger below, and they do not change Part 3's tables, which are for Part 1's run.
          </p>
          <div style={{ ...pinkFrame, marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The pieces' mass, r</label>
            <p style={hint}>The mass of each piece, as a fraction of the parent's mass. Zero means pieces of light, which have no mass.</p>
            <div style={{ marginBottom: '1rem' }}>
              {MASS_PRESETS.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  disabled={ownStatus === 'running'}
                  onClick={() => chooseOwn(() => setOwnMass(choice.value))}
                  className={`toggle-button${ownMass === choice.value ? ' is-selected' : ''}`}
                  style={toggleStyle}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The passing observer's speed</label>
            <p style={hint}>The passing observer moves along the same line. A plus sign means they move to the right, and a minus sign to the left.</p>
            <div>
              {PASSING_SPEED_PRESETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={ownStatus === 'running'}
                  onClick={() => chooseOwn(() => setOwnSpeed(value))}
                  className={`toggle-button${ownSpeed === value ? ' is-selected' : ''}`}
                  style={toggleStyle}
                >
                  {passingLabel(value)}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="action-button" onClick={handleRunOwn} disabled={ownStatus === 'running'} style={{ padding: '0.6rem 1.5rem' }}>
            {ownStatus === 'running' ? 'Running...' : 'Run these settings'}
          </button>
          {ownStatus === 'idle' && (
            <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.75rem' }}>
              Choose r and the passing observer's speed, then press Run these settings. The two pictures and the mass ledger appear here.
            </p>
          )}
          {shown !== null && ownStatus !== 'idle' && (
            <div style={{ ...pinkFrame, marginTop: '1rem' }}>
              <p style={pictureTitle}>
                The decay for your settings (r = {shown.r === 0 ? '0, pieces of light' : shown.r}, passing observer at {passingLabel(shown.speed)})
              </p>
              <DecayDiagram passingSpeed={shown.speed} pieceMass={shown.r} progress={ownProgress} />
              <DecayDiagramCaption pieceMass={shown.r} passingSpeed={shown.speed} progress={ownProgress} own />
              {ownProgress > OBSERVER_END && (
                <div style={{ marginTop: '1.5rem' }}>
                  <DecayLedger pieceMass={shown.r} passingSpeed={shown.speed} fill={clamp01((ownProgress - OBSERVER_END) / (1 - OBSERVER_END))} />
                  <DecayLedgerCaption pieceMass={shown.r} passingSpeed={shown.speed} />
                </div>
              )}
            </div>
          )}

          {/* ===== Part 3: the results of Part 1's run ===== */}
          <PartHeader color={PART_THREE_COLOR} title="Part 3: The results">
            Here are the numbers behind Part 1's pictures, a check-up of this page against its own physics, and your two guesses beside the real results. The tables never change with your predictions or with
            the settings you tried in Part 2.
          </PartHeader>
          {bothChosen && <DecayResults pieceMass={r1} passingSpeed={u1} guess1Label={guess1Label} guess2Label={guess2Label} />}

          {/* ===== Part 4: the tutor ===== */}
          <PartHeader color={PART_FOUR_COLOR} title="Part 4: The tutor">
            The tutor asks you three questions, one at a time, about what you saw and how your guesses compare with the bars, then goes through the explanation and two real examples. The tutor's questions
            are not marked.
          </PartHeader>
          {bothChosen && (
            <MakingNewParticlesDecayTutor
              key={resetCount}
              pieceMass={r1}
              passingSpeed={u1}
              predicted={guess1}
              passingPredicted={guess2}
              onExplained={onExplained}
            />
          )}
        </>
      )}
    </div>
  )
}
