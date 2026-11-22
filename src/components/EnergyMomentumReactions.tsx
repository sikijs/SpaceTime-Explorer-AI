import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { EnergyMomentumReactionsTutor } from './EnergyMomentumReactionsTutor'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'
import {
  SECTION_C_PASSING_SPEED,
  SECTION_C_SPEED,
  heliumCheckUp,
  reactionCheckUpRows,
  reactionGuessMarker,
  runReactionExperiment,
  systemMassOf,
  totalsOf,
} from '../physics/energyMomentum'
import type { ReactionExperimentResult, ReactionGuess, ReactionKind, ReactionPiece } from '../physics/energyMomentum'

// Spacetime Geometry 5, Section C (reactions: can the masses change?), of docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md.
// Audit update of 2026-11-21 (wording in docs/audit/spacetime-geometry/05-draft-wording-section-c.md; the owner accepted all defaults of the gap report): Section C is in
// four Parts. Part 1 is one guess about one fixed run (a particle and its antiparticle at 0.6c, a passing observer at +0.3c), with the lab's picture, the mass ledger with the
// white guess tick, and the passing observer's picture; Part 2 lets the learner choose the process, its setting and the observer's speed, and run it; Part 3 has the results
// of Part 1's run (and the helium check-up once helium has been run); Part 4 the tutor (`EnergyMomentumReactionsTutor`). Parts 2 to 4 appear after the first Run, and Start over
// clears Section C. Every number comes from `energyMomentum.ts`. Wording here is draft for the owner's review (CLAUDE.md §28.1).

type Prediction = ReactionGuess

// The three answers of Section C's prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1). One
// question for all three processes, with the process named. Not scored, and the learner is not told which is right (§12).
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'less', label: '(a) The total mass after is less than before.' },
  { value: 'same', label: '(b) The total mass is the same.' },
  { value: 'more', label: '(c) The total mass after is more than before.' },
]

const PROCESS_SENTENCE: Record<ReactionKind, string> = {
  annihilation: 'The two particles meet and turn into something else.',
  'pair-creation': 'The two beams of light meet.',
  'helium-binding': 'The two protons and two neutrons bind into a helium nucleus.',
}

// The terms and formulas that stage C's introduction defines, added to the "Words and formulas" panel once Part 3 appears (spec,
// Introduction, rule 5). They repeat the introduction's wording, with no new claims.
export const PART_THREE_REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Electric charge', meaning: 'a property that makes things pull or push each other. The electron is negative, the proton positive, the neutron has none.' },
  { term: 'Antiparticle', meaning: 'a particle with the same mass as another, but opposite electric charge. The electron’s antiparticle is the positron.' },
  { term: 'Photon', meaning: 'here, a light pulse of a given energy, with no mass.' },
  { term: 'Annihilation', meaning: 'a particle and its antiparticle meeting and turning into light.' },
  { term: 'Pair creation', meaning: 'light turning into a particle and its antiparticle.' },
  { term: 'Threshold', meaning: 'the least energy at which something can happen.' },
  { term: 'Nucleus, proton, neutron', meaning: 'the tiny, heavy core of an atom, made of protons (positive) and neutrons (no charge). Helium-4 has two of each.' },
  { term: 'Binding energy', meaning: 'the energy needed to pull a nucleus apart into its protons and neutrons. It is also the energy released when they come together.' },
  { term: 'Mass defect', meaning: 'how much less a nucleus weighs than its separate parts.' },
  { term: 'Fusion', meaning: 'nuclei joining into a heavier nucleus, as happens in the Sun.' },
  {
    term: 'Electron-volt (eV)',
    meaning:
      'the unit of energy used for particles: the energy an electron gains crossing a 1-volt battery, about 1.6 × 10⁻¹⁹ joules. keV is a thousand eV, MeV a million, GeV a billion, TeV a million million. “938 MeV/c²” is the proton’s mass.',
  },
  { term: 'Rest mass', meaning: 'the mass a piece has when it sits still, as in Section A. A pulse of light has no mass, so its rest mass is zero.' },
  {
    term: 'Sum of the rest masses, and the system’s mass',
    meaning: 'the first adds up the masses of the separate pieces (a light pulse counts as zero). The second is M = √(E_total² − (P_total c)²), worked out from the pieces’ total energy and momentum.',
  },
  { term: 'Speed from energy: v = √(1 − 1 ÷ E²)', meaning: 'a particle with energy E, in its own rest energies, has D = 1 ÷ E.' },
  {
    term: 'Mass ledger',
    meaning: 'four bars on one scale: the sum of the rest masses, before (grey) and after (blue), and the system’s mass, before and after.',
  },
  { term: 'Your guess tick (Section C)', meaning: 'a white tick on the mass ledger that stands for the answer you chose. It has no size of its own, and it does not change any bar.' },
]

const KIND_CHOICES: { value: ReactionKind; label: string }[] = [
  { value: 'annihilation', label: 'A particle and its antiparticle meet' },
  { value: 'pair-creation', label: 'Two beams of light meet' },
  { value: 'helium-binding', label: 'A helium nucleus forms' },
]

// The settings in "Learner Controls" for Part 3. The starting setting of each process is a draft choice.
const ANNIHILATION_SPEEDS = [0, 0.6, 0.9]
const PHOTON_ENERGIES = [0.5, 1, 2, 5]
const PASSING_SPEED_PRESETS = [-0.6, -0.3, 0.3, 0.6]
const START_SETTING: Record<ReactionKind, number> = { annihilation: 0.6, 'pair-creation': 2, 'helium-binding': 0 }

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
const LIGHT_COLOR = '#facc15'
const PASSING_COLOR = '#c4b5fd'
const VIEW_WIDTH = 520
const VIEW_HEIGHT = 830
const MEET_X = 260
const LAB_LINE_Y = 150
const OBSERVER_LINE_Y = 690
const PIECE_RADIUS = 16
const NUCLEUS_RADIUS = 22
// Pixels of travel to the meeting point for each 1c of speed, the same as in Section B and in both pictures here.
const PIXELS_PER_SPEED = 200
const LIGHT_START = 150
const LIGHT_MAX_LENGTH = 110
// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
const ANIMATION_DURATION_MS = 12_000
// The share of the playback used by each picture: the lab's first, then the passing observer's.
const LAB_END = 0.4
const OBSERVER_END = 0.8
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

function signed(value: number, digits = 2): string {
  return value.toFixed(digits).replace('-', '−')
}

function passingLabel(speed: number): string {
  return `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

function settingLabel(kind: ReactionKind, value: number): string {
  if (kind === 'annihilation') return value === 0 ? 'At rest' : `${value}c each`
  return `${value} each`
}

function directionWords(momentum: number): string {
  return Math.abs(momentum) < 5e-10 ? 'at rest' : momentum > 0 ? 'moves to the right' : 'moves to the left'
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

// Where a picture is in its own story, from 0 to 1: a pause, the pieces coming together (approach 0 to 1), the reaction, then
// the pieces after it (after 0 to 1). The same as Section B's.
function panelStory(q: number): { approach: number; after: number; collided: boolean; flash: number } {
  const approach = clamp01((q - 0.2) / 0.45)
  const after = clamp01((q - 0.65) / 0.35)
  const smooth = approach * approach * (3 - 2 * approach)
  return { approach: smooth, after, collided: q >= 0.65, flash: q >= 0.65 && q < 0.8 ? 1 - (q - 0.65) / 0.15 : 0 }
}

function pieceNumbers(piece: ReactionPiece): string[] {
  return [
    `energy ${piece.reading.energy.toFixed(2)}`,
    `momentum × c ${signed(piece.reading.momentumTimesC)}`,
    piece.restMass === 0 ? 'rest mass 0 (no mass)' : `rest mass ${piece.restMass.toFixed(2)}`,
  ]
}

const isLightPiece = (piece: ReactionPiece) => piece.restMass === 0
const lightLength = (piece: ReactionPiece) => Math.min(40 + 16 * piece.reading.energy, LIGHT_MAX_LENGTH)
const particleArrowLength = (piece: ReactionPiece) => 14 + 50 * Math.abs(piece.reading.speed)

// Two label positions that are too close are moved apart, so that the numbers do not run into each other.
function spreadLabels(xs: number[]): number[] {
  if (xs.length !== 2 || Math.abs(xs[0] - xs[1]) >= 140) return xs
  const mid = (xs[0] + xs[1]) / 2
  return xs[0] <= xs[1] ? [mid - 70, mid + 70] : [mid + 70, mid - 70]
}

interface Placed {
  piece: ReactionPiece
  x: number // the circle's centre, or the tail of a light pulse's arrow
  labelX: number
}

// The pieces before the reaction, where they are now and where their labels go. Particles start a speed's worth of travel from
// the meeting point (apart by a fixed gap when both are at rest, so that both can be seen); light pulses start at a fixed distance.
// Four pieces of helium are drawn at rest in a row: how they come together is not shown (accounting only).
function placeBefore(kind: ReactionKind, pieces: ReactionPiece[], approach: number): Placed[] {
  if (kind === 'helium-binding') {
    const xs = [MEET_X - 165, MEET_X - 55, MEET_X + 55, MEET_X + 165]
    return pieces.map((piece, i) => ({ piece, x: xs[i], labelX: xs[i] }))
  }
  if (kind === 'pair-creation') {
    return pieces.map((piece) => {
      const direction = Math.sign(piece.reading.momentumTimesC)
      const start = MEET_X - direction * LIGHT_START
      // The arrow's head, not its tail, comes to the meeting point.
      return { piece, x: start + direction * (LIGHT_START - lightLength(piece)) * approach, labelX: start + (direction * lightLength(piece)) / 2 }
    })
  }
  const speeds = pieces.map((piece) => piece.reading.speed)
  let starts = speeds.map((v) => MEET_X - v * PIXELS_PER_SPEED)
  const pushedApart = Math.abs(starts[1] - starts[0]) < PIECE_RADIUS * 2 + 8
  if (pushedApart) {
    const mid = (starts[0] + starts[1]) / 2
    starts = [mid - PIECE_RADIUS - 4, mid + PIECE_RADIUS + 4]
  }
  const labelXs = spreadLabels(starts)
  return pieces.map((piece, i) => ({
    piece,
    x: pushedApart ? starts[i] : MEET_X + (starts[i] - MEET_X) * (1 - approach),
    labelX: labelXs[i],
  }))
}

// The pieces after the reaction. `created` is false only below the pair-creation threshold, where nothing happens and the two
// light pulses carry on through each other.
function placeAfter(kind: ReactionKind, pieces: ReactionPiece[], created: boolean, after: number): Placed[] {
  if (kind === 'pair-creation' && !created) {
    return pieces.map((piece) => {
      const direction = Math.sign(piece.reading.momentumTimesC)
      // The labels are at the ends the pulses have reached, under the pulses, which have passed through each other.
      return { piece, x: MEET_X - direction * lightLength(piece) + direction * LIGHT_START * after, labelX: MEET_X + direction * (LIGHT_START - lightLength(piece) / 2) }
    })
  }
  if (kind === 'helium-binding') {
    return pieces.map((piece) => {
      if (isLightPiece(piece)) {
        const direction = Math.sign(piece.reading.momentumTimesC)
        return { piece, x: MEET_X + direction * (NUCLEUS_RADIUS + 8 + 80 * after), labelX: MEET_X + direction * 165 }
      }
      const drift = piece.reading.speed * PIXELS_PER_SPEED * 0.5
      // The nucleus's label stays at the centre, clear of the labels of the two light pulses.
      return { piece, x: MEET_X + drift * after, labelX: MEET_X }
    })
  }
  if (kind === 'annihilation') {
    return pieces.map((piece) => {
      const direction = Math.sign(piece.reading.momentumTimesC)
      return { piece, x: MEET_X + direction * 110 * after, labelX: MEET_X + direction * 100 }
    })
  }
  // Pair creation: the particle and its antiparticle, side by side at the threshold, and moving apart above it.
  const side = (i: number) => (i === 0 ? 1 : -1) * (PIECE_RADIUS + 4)
  const finals = pieces.map((piece, i) => MEET_X + side(i) + piece.reading.speed * PIXELS_PER_SPEED * 0.5)
  const labelXs = spreadLabels(finals.map((x) => Math.min(Math.max(x, 100), 420)))
  return pieces.map((piece, i) => ({
    piece,
    x: MEET_X + side(i) + piece.reading.speed * PIXELS_PER_SPEED * 0.5 * after,
    labelX: labelXs[i],
  }))
}

function glyphFor(kind: ReactionKind, piece: ReactionPiece): string {
  if (kind === 'helium-binding') return piece.label === 'proton' ? 'p' : piece.label === 'neutron' ? 'n' : 'He'
  return piece.label === 'particle' ? '+' : '−'
}

interface PanelProps {
  kind: ReactionKind
  lineY: number
  title: string
  subtitle: string
  frameColor: string
  q: number
  before: ReactionPiece[]
  after: ReactionPiece[]
  created: boolean
  inMeV: boolean
}

// One picture of the reaction: the pieces come to the meeting point, the reaction happens, and the pieces after it are shown. The
// labels and numbers stay where the pieces start, or finish, so they do not run into each other as the pieces move.
function ReactionPanel({ kind, lineY, title, subtitle, frameColor, q, before, after, created, inMeV }: PanelProps) {
  const story = panelStory(q)
  const pieces = story.collided ? placeAfter(kind, after, created, story.after) : placeBefore(kind, before, story.approach)
  const unitsNote = inMeV ? 'Energy, momentum × c and rest mass are all in MeV, a unit of energy.' : 'Energy and rest mass are in rest energies of one particle.'
  const momentumNote = inMeV ? 'A rest mass in MeV means its mass × c², written as an energy.' : 'Momentum is shown as momentum × c.'

  return (
    <g>
      <text x="12" y={lineY - 130} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        {title}
      </text>
      <text x="12" y={lineY - 114} fontSize="11" fill={MUTED_COLOR}>
        {unitsNote}
      </text>
      <text x="12" y={lineY - 100} fontSize="11" fill={MUTED_COLOR}>
        {momentumNote}
      </text>
      {subtitle !== '' && (
        <text x="12" y={lineY - 86} fontSize="11" fill={MUTED_COLOR}>
          {subtitle}
        </text>
      )}
      <line x1="20" y1={lineY} x2={VIEW_WIDTH - 20} y2={lineY} stroke={TICK_COLOR} strokeWidth="1" strokeDasharray="2 5" />
      <line x1={MEET_X} y1={lineY - 34} x2={MEET_X} y2={lineY + (story.collided ? 34 : 88)} stroke={MUTED_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      {!story.collided && (
        <text x={MEET_X} y={lineY + 100} fontSize="11" textAnchor="middle" fill={MUTED_COLOR} style={HALO}>
          {kind === 'helium-binding' ? 'where they will come together' : 'where they meet'}
        </text>
      )}
      {story.collided && kind === 'pair-creation' && !created && (
        <text x={MEET_X} y={lineY + 100} fontSize="11" fontWeight="bold" textAnchor="middle" fill={LIGHT_COLOR} style={HALO}>
          No pair can be made: the light pulses pass through each other.
        </text>
      )}
      {kind === 'helium-binding' && (
        <text x={MEET_X} y={lineY + (story.collided ? 100 : 114)} fontSize="10" textAnchor="middle" fill={MUTED_COLOR} style={HALO}>
          Energy accounting only: how the pieces come together is not shown.
        </text>
      )}

      {story.flash > 0 && created && <circle cx={MEET_X} cy={lineY} r={20 + 30 * (1 - story.flash)} fill="none" stroke="#facc15" strokeWidth="3" opacity={story.flash} />}

      {pieces.map(({ piece, x, labelX }, i) => {
        const light = isLightPiece(piece)
        const direction = Math.sign(piece.reading.momentumTimesC)
        const color = light ? LIGHT_COLOR : frameColor
        const radius = piece.label === 'helium-4 nucleus' ? NUCLEUS_RADIUS : PIECE_RADIUS
        const length = light ? lightLength(piece) : particleArrowLength(piece)
        const arrowStart = light ? x : x + direction * (radius + 4)
        return (
          <g key={`${story.collided ? 'after' : 'before'}-${i}`}>
            {direction !== 0 && (
              <line
                x1={arrowStart}
                y1={lineY}
                x2={arrowStart + direction * length}
                y2={lineY}
                stroke={color}
                strokeWidth={light ? 3.5 : 2.5}
                markerEnd={`url(#reaction-arrowhead-${color.slice(1)})`}
              />
            )}
            {!light && <circle cx={x} cy={lineY} r={radius} fill={color} stroke="#0b1020" strokeWidth="1.5" />}
            {!light && (
              <text x={x} y={lineY + 4} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0b1020">
                {glyphFor(kind, piece)}
              </text>
            )}
            <text x={labelX} y={lineY - 56} fontSize="12" fontWeight="bold" textAnchor="middle" fill={color} style={HALO}>
              {piece.label}
            </text>
            <text x={labelX} y={lineY - 42} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
              {directionWords(piece.reading.momentumTimesC)}
            </text>
            {pieceNumbers(piece).map((line, k) => (
              <text key={k} x={labelX} y={lineY + 44 + 14 * k} fontSize="10" textAnchor="middle" fill={color} style={HALO}>
                {line}
              </text>
            ))}
          </g>
        )
      })}
    </g>
  )
}

const LEDGER_TOP = 340
const LEDGER_BAR_X = 200
const LEDGER_BAR_MAX = 230
const GUESS_COLOR = '#ffffff'

// The mass ledger, in the lab, once the reaction has happened: the sum of the rest masses before and after, the system's mass
// before and after, and the energy released or absorbed, all on one scale. The scale comes from the real values only, so a guess never changes a bar.
// With a `guess`, a white tick goes across the two rest-mass bars (before and after) and a YOUR GUESS box hangs below them.
function MassLedger({ result, inMeV, guess }: { result: ReactionExperimentResult; inMeV: boolean; guess: Prediction | null }) {
  const unit = inMeV ? 'MeV' : 'rest energies'
  const rows: { label: string; value: number; color: string; y: number }[] = [
    { label: 'Sum of the rest masses, before', value: result.sumOfRestMassesBefore, color: '#94a3b8', y: LEDGER_TOP + 24 },
    { label: 'Sum of the rest masses, after', value: result.sumOfRestMassesAfter, color: LAB_COLOR, y: LEDGER_TOP + 46 },
    { label: "The system's mass, before", value: result.systemMassBefore, color: '#94a3b8', y: LEDGER_TOP + 112 },
    { label: "The system's mass, after", value: result.systemMassAfter, color: LAB_COLOR, y: LEDGER_TOP + 134 },
  ]
  const scale = LEDGER_BAR_MAX / Math.max(...rows.map((r) => r.value), 1e-9)
  const released = result.energyReleased
  const releasedText =
    Math.abs(released) < 5e-10
      ? 'No energy is released or absorbed.'
      : released > 0
        ? `Energy released: ${released.toFixed(2)} ${unit}`
        : `Energy absorbed: ${(-released).toFixed(2)} ${unit}`
  const marker = guess === null ? null : reactionGuessMarker(guess, result.sumOfRestMassesBefore)
  const tickX = marker === null ? 0 : LEDGER_BAR_X + marker.position * scale
  const boxX = Math.min(Math.max(tickX - 85, 12), 338)
  return (
    <g>
      <text x="12" y={LEDGER_TOP} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The mass ledger, in the lab (in {unit})
      </text>
      {marker !== null && (
        <g>
          <line x1={tickX} y1={LEDGER_TOP + 16} x2={tickX} y2={LEDGER_TOP + 66} stroke={GUESS_COLOR} strokeWidth="4" />
          <rect x={boxX} y={LEDGER_TOP + 66} width="170" height="40" rx="6" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="3" />
          <text x={boxX + 85} y={LEDGER_TOP + 84} textAnchor="middle" fontSize="16" fontWeight="bold" fill={GUESS_COLOR}>
            YOUR GUESS
          </text>
          <text x={boxX + 85} y={LEDGER_TOP + 99} textAnchor="middle" fontSize="11" fill={GUESS_COLOR}>
            {marker.label.replace('YOUR GUESS: ', '')}
          </text>
        </g>
      )}
      {rows.map((row) => (
        <g key={row.label}>
          <text x="12" y={row.y + 8} fontSize="10" fill={row.color}>
            {row.label}
          </text>
          <rect x={LEDGER_BAR_X} y={row.y} width={Math.max(row.value * scale, 2)} height="10" rx="2" fill={row.color} />
          <text x={LEDGER_BAR_X + Math.max(row.value * scale, 2) + 6} y={row.y + 9} fontSize="10" fill={row.color} style={HALO}>
            {row.value.toFixed(2)}
          </text>
        </g>
      ))}
      <text x="12" y={LEDGER_TOP + 168} fontSize="11" fontWeight="bold" fill={LIGHT_COLOR}>
        {releasedText}
      </text>
    </g>
  )
}

// How far the playback has got in each picture, shared by the drawing and the caption so that a feature is explained only once it is drawn (§12).
export function reactionMilestones(progress: number | null) {
  const playing = progress !== null
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  return { playing, ledgerDrawn: playing && panelStory(labQ).collided, observerDrawn: playing && progress > LAB_END }
}

interface ReactionDiagramProps {
  kind: ReactionKind
  setting: number
  passingSpeed: number
  // null while idle (only the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
  // True for Part 2's drawings (Drawing A and B), which follow the learner's settings and carry no guess.
  own?: boolean
  // The learner's guess, drawn as a white tick on the mass ledger once it is drawn (Part 1 only).
  guess?: Prediction | null
}

// While idle it draws the lab's setup, just before the reaction, with the passing observer marked. While the run plays it shows the
// lab's reaction first, with the mass ledger, and then the same reaction as the passing observer sees it, both in the same style.
export function ReactionDiagram({ kind, setting, passingSpeed, progress, own = false, guess = null }: ReactionDiagramProps) {
  const result = runReactionExperiment(kind, setting, passingSpeed)
  const inMeV = kind === 'helium-binding'
  const playing = progress !== null
  const complete = progress !== null && progress >= 1
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  const observerQ = playing ? clamp01((progress - LAB_END) / (OBSERVER_END - LAB_END)) : 0
  const showObserverPicture = playing && progress > LAB_END
  const labCollided = panelStory(labQ).collided
  const piecesText = (pieces: ReactionPiece[]) =>
    pieces.map((p) => `${p.label}: energy ${p.reading.energy.toFixed(2)}, momentum times c ${p.reading.momentumTimesC.toFixed(2)}, rest mass ${p.restMass.toFixed(2)}`).join('. ')
  const afterText = labCollided
    ? ` ${result.created ? 'After' : 'Nothing happens, so after'}: ${piecesText(result.labAfter)}. The sum of the rest masses goes from ${result.sumOfRestMassesBefore.toFixed(2)} to ${result.sumOfRestMassesAfter.toFixed(2)}, and the system's mass goes from ${result.systemMassBefore.toFixed(2)} to ${result.systemMassAfter.toFixed(2)}.`
    : ''
  const observerText = showObserverPicture
    ? ` The passing observer sees the same reaction with different energies and momenta. Before: ${piecesText(result.passingBefore)}.`
    : ''

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`${complete ? 'Result: ' : playing ? 'Playback: ' : 'Setup: '}the lab's view of the reaction "${KIND_CHOICES.find((c) => c.value === kind)?.label.toLowerCase()}"${inMeV ? ', in MeV' : ''}. Before: ${piecesText(result.labBefore)}. A passing observer moves at ${passingLabel(passingSpeed)}.${afterText}${observerText}`}
      style={SVG_STYLE}
    >
      <defs>
        {[LAB_COLOR, LIGHT_COLOR, PASSING_COLOR].map((color) => (
          <marker key={color} id={`reaction-arrowhead-${color.slice(1)}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>

      <ReactionPanel
        kind={kind}
        lineY={LAB_LINE_Y}
        title={playing ? `${own ? 'Drawing A' : 'Picture 1'}: the lab's view of the reaction` : "The lab's view, just before the reaction"}
        subtitle=""
        frameColor={LAB_COLOR}
        q={labQ}
        before={result.labBefore}
        after={result.labAfter}
        created={result.created}
        inMeV={inMeV}
      />

      {/* The passing observer: a hollow circle (as in Sections A and B) with an arrow for their way and speed. */}
      <circle cx="60" cy="300" r="8" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
      <line
        x1={60 + Math.sign(passingSpeed) * 14}
        y1="300"
        x2={60 + Math.sign(passingSpeed) * (14 + 20 + 80 * Math.abs(passingSpeed))}
        y2="300"
        stroke={PASSING_COLOR}
        strokeWidth="2.5"
        markerEnd={`url(#reaction-arrowhead-${PASSING_COLOR.slice(1)})`}
      />
      <text x="165" y="298" fontSize="12" fontWeight="bold" fill={PASSING_COLOR}>
        The passing observer
      </text>
      <text x="165" y="314" fontSize="11" fill={PASSING_COLOR}>
        moves at {passingLabel(passingSpeed)} ({passingSpeed > 0 ? 'to the right' : 'to the left'}), along the same line
      </text>

      {labCollided && <MassLedger result={result} inMeV={inMeV} guess={guess} />}

      {showObserverPicture ? (
        <ReactionPanel
          kind={kind}
          lineY={OBSERVER_LINE_Y}
          title={`${own ? 'Drawing B' : 'Picture 2'}: the same reaction, as the passing observer sees it`}
          subtitle="Their ruler and clocks move with them, so for them they are at rest."
          frameColor={PASSING_COLOR}
          q={observerQ}
          before={result.passingBefore}
          after={result.passingAfter}
          created={result.created}
          inMeV={inMeV}
        />
      ) : (
        playing && (
          <text x="12" y={OBSERVER_LINE_Y - 100} fontSize="11" fill={MUTED_COLOR}>
            Next, the same reaction as the passing observer sees it.
          </text>
        )
      )}
    </svg>
  )
}

const SECTION_LABEL: CSSProperties = { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }
const HINT: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }
const BUTTON: CSSProperties = { marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }
const captionStyle: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }
const smallNote: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }
const pictureTitle: CSSProperties = { fontWeight: 'bold', fontSize: '0.875rem', marginTop: '1.5rem', marginBottom: '0.5rem' }
const linkButton: CSSProperties = { background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }
const PART_ONE_COLOR = '#d97706'
const PART_TWO_COLOR = '#be185d'
const PART_THREE_COLOR = '#0f766e'
const PART_FOUR_COLOR = '#0066cc'

const CELL: CSSProperties = { padding: '0.3rem 1rem 0.3rem 0' }
const NOTE: CSSProperties = { fontSize: '0.8125rem', color: 'var(--text-muted)' }

// Numbers in the results tables: four decimal places, with a minus sign for a negative number and no "-0.0000".
function formatNumber(value: number): string {
  const text = value.toFixed(4).replace('-', '−')
  return /^−0\.0+$/.test(text) ? text.slice(1) : text
}

// A difference that is zero apart from rounding is shown as 0.0000.
function formatDifference(value: number): string {
  return formatNumber(Math.abs(value) < 5e-5 ? 0 : value)
}

function two(value: number): string {
  return value.toFixed(2).replace('-', '−')
}

function ResultsTable({ head, rows, tagRow }: { head: string[]; rows: string[][]; tagRow?: number }) {
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ ...CELL, textAlign: 'left' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} style={CELL}>
                  {cell}
                  {tagRow === r && i === 0 && <GuessTag />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// A small dark tag, "your guess", beside the table row the guess is about. It is a marker only: it never says right or wrong.
function GuessTag() {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.6875rem',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#0b1020',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      your guess
    </span>
  )
}

function NotesBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ ...NOTE, margin: '0 0 1.25rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>{title}</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{children}</ul>
    </div>
  )
}

function settingSentence(kind: ReactionKind, setting: number): string {
  if (kind === 'annihilation') return setting === 0 ? 'The particle and its antiparticle were at rest in the lab.' : `The particle and its antiparticle each moved at ${setting}c in the lab.`
  if (kind === 'pair-creation') return `Each beam of light had an energy of ${setting} rest energies in the lab.`
  return 'The two protons and the two neutrons were at rest in the lab.'
}

// ---- The caption of the pictures (CLAUDE.md §14, "Animated Diagrams"; wording: draft section 5) ----

interface CaptionProps {
  kind: ReactionKind
  setting: number
  passingSpeed: number
  progress: number | null
  // True for Part 2's drawings.
  own?: boolean
  guess?: Prediction | null
}

// A feature is explained only once it is drawn (§12). Nothing here says which of the "before" and "after" bars is longer, or whether the totals are kept: that is the
// learner's to observe and the tutor's to explain (§12, §13).
export function ReactionCaptions({ kind, setting, passingSpeed, progress, own = false, guess = null }: CaptionProps) {
  const result = runReactionExperiment(kind, setting, passingSpeed)
  const { playing, ledgerDrawn, observerDrawn } = reactionMilestones(progress)
  const inMeV = kind === 'helium-binding'
  const unit = inMeV ? 'MeV' : 'rest energies'
  const picture1 = own ? 'Drawing A' : 'Picture 1'
  const picture2 = own ? 'Drawing B' : 'Picture 2'
  const readings = (pieces: ReactionPiece[]) => pieces.map((piece) => piece.reading)
  const labBefore = totalsOf(readings(result.labBefore))
  const labAfter = totalsOf(readings(result.labAfter))
  const passingBefore = totalsOf(readings(result.passingBefore))
  const passingAfter = totalsOf(readings(result.passingAfter))
  const piecesText = (pieces: ReactionPiece[]) => pieces.map((p) => `${p.label} (energy ${two(p.reading.energy)}, momentum × c ${two(p.reading.momentumTimesC)})`).join('; ')
  const released = result.energyReleased
  const releasedWords =
    Math.abs(released) < 5e-10 ? 'no energy released or absorbed' : released > 0 ? `energy released: ${two(released)} ${unit}` : `energy absorbed: ${two(-released)} ${unit}`

  const picture1Items = [
    {
      look: 'the three numbers under each piece before the reaction (energy, momentum × c and rest mass)',
      means: `${piecesText(result.labBefore)}. Adding them, the lab finds a total energy of ${two(labBefore.energy)} and a total momentum × c of ${two(labBefore.momentumTimesC)} ${unit}`,
      matters: 'these are the totals that the reaction may or may not keep. Part 3 gives the numbers after it, and the tutor goes through what they show',
    },
    ...(ledgerDrawn
      ? [
          {
            look: `the pieces after the reaction${kind === 'pair-creation' && !result.created ? ' (the light pulses carry on)' : ''}, with their names, directions and numbers`,
            means: `the lab now finds ${piecesText(result.labAfter)}, a total energy of ${two(labAfter.energy)} and a total momentum × c of ${two(labAfter.momentumTimesC)}`,
            matters: 'these are all the lab has to describe what is left, so you can set them beside the totals from before',
          },
          {
            look: 'the four bars of the mass ledger: grey before, blue after',
            means: `the first pair is the sum of the rest masses, ${two(result.sumOfRestMassesBefore)} before and ${two(result.sumOfRestMassesAfter)} after (a pulse of light counts as zero). The second pair is the system's mass, ${two(result.systemMassBefore)} before and ${two(result.systemMassAfter)} after, in ${unit}`,
            matters: 'the question you predicted is the comparison of the first pair of bars. The page does not say how they compare, so read it from the bars. The tutor goes through the second pair',
          },
          {
            look: 'the line under the bars',
            means: `it gives the sum of the rest masses before minus the sum after: ${releasedWords}`,
            matters: 'a plus sign means the sum went down and the difference is given off as energy, and a minus sign means the reverse. Part 3 explains the rule',
          },
        ]
      : []),
  ]
  const picture2Items = [
    {
      look: 'the numbers under each piece before the reaction in the purple picture',
      means: `${piecesText(result.passingBefore)}. These are not the lab's numbers`,
      matters: 'the same pieces get different energies and momenta when they are measured by someone who moves differently, as in Section A',
    },
    {
      look: 'the totals in this picture, before and after the reaction',
      means: `this observer's total energy is ${two(passingBefore.energy)} before and ${two(passingAfter.energy)} after, and their total momentum × c is ${two(passingBefore.momentumTimesC)} before and ${two(passingAfter.momentumTimesC)} after`,
      matters: 'this is the check, on this observer\'s own numbers, of whether the totals were kept. Part 3 lists the differences',
    },
  ]

  return (
    <div style={captionStyle}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{own ? `How to read ${picture1}.` : 'How to read this diagram.'}</strong>{' '}
        {own ? "This is the lab's picture of the reaction you chose, with a pink line beside it because it follows your settings. Everything in it means what it meant in Part 1. " : ''}
        {own ? 'For your settings' : 'For this run'}, the process is "{KIND_CHOICES.find((c) => c.value === kind)?.label.toLowerCase()}". {settingSentence(kind, setting)} The passing observer moves at {passingLabel(passingSpeed)}. Speeds are
        given as a fraction of <strong>c</strong>, the speed of light: 0.6c is 60 percent of it.
      </p>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>{picture1}: the lab's view of the reaction.</strong> It is drawn in sky blue for the particles, and light is always yellow. The parts of it are:
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>A circle.</strong> A piece that has mass: a particle, an antiparticle, a proton or a neutron, and later the helium nucleus (<strong>He</strong>, drawn a little larger). The sign or letter inside only
          tells the pieces apart. It is a label, not a measurement.
        </li>
        <li>
          <strong>A yellow arrow with no circle.</strong> A pulse of light. It has no mass, so it has nothing to draw as a circle.
        </li>
        <li>
          <strong>The arrows.</strong> An arrow shows which way a piece moves. A longer arrow means a faster particle or a more energetic pulse. A piece with no arrow is at rest.
        </li>
        <li>
          <strong>The numbers under each piece.</strong> Its <em>energy</em>, its <em>momentum × c</em> (a minus sign means it moves to the left) and its <em>rest mass</em>, the mass it has when it sits still.{' '}
          {inMeV ? 'For helium all three are in MeV, a unit of energy, because the masses are real measured masses.' : 'Energy and rest mass are in the rest energies of one particle, so 1 is one particle sitting still. Momentum is shown as momentum × c, in the same unit.'}
        </li>
        <li>
          <strong>The dashed vertical line.</strong> Where the pieces meet{kind === 'helium-binding' ? ' (for helium, where they come together)' : ''}.
        </li>
        <li>
          <strong>The hollow purple circle, "The passing observer", with its arrow.</strong> The second person, who moves along the same line. Its arrow shows their way and, by its length, their speed. They are used in{' '}
          {picture2}.
        </li>
        {playing && (
          <li>
            <strong>The yellow ring.</strong> It flashes at the moment of the reaction{kind === 'pair-creation' && !result.created ? ' (not drawn here: below the threshold nothing happens)' : ''}.
          </li>
        )}
        {kind === 'helium-binding' && (
          <li>
            <strong>The note "Energy accounting only".</strong> How the four pieces come together is not shown. The picture shows the four pieces before and what there is afterward.
          </li>
        )}
        {ledgerDrawn && (
          <li>
            <strong>The four bars of the mass ledger.</strong> All four are on the same scale, so their lengths can be compared. Grey bars are before the reaction and blue bars are after. The first pair is the{' '}
            <em>sum of the rest masses</em>: it adds up the masses of the separate pieces, each as it would be if the piece sat still, and a pulse of light counts as zero. A bar of zero is drawn as a thin stub. The
            second pair is the <em>system's mass</em>, worked out from the total energy and the total momentum × c of all the pieces taken together, as in Section B. The number at the end of each bar is its value.
          </li>
        )}
        {ledgerDrawn && (
          <li>
            <strong>The line under the bars.</strong> The sum of the rest masses before minus the sum after, in {unit}: "released" for a plus sign, "absorbed" for a minus sign.
          </li>
        )}
        {ledgerDrawn && guess !== null && !own && (
          <li>
            <strong>The white tick and the YOUR GUESS box.</strong> This is the answer you chose, drawn across the first two (rest-mass) bars. It is <strong>only a marker</strong>: it has no size of its own, it only
            shows whether you chose "less after than before" (half-way along the grey bar), "the same" (at its end) or "more" (beyond it), and it does not change any bar.
          </li>
        )}
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What to look for in {picture1}.</strong>
      </p>
      <LookForList items={picture1Items} />
      {!own && (
        <WhereFrom>
          <strong>Calculated here:</strong> every number and bar, from the rules of special relativity given in Section A and the conservation of energy and momentum.{' '}
          {inMeV && (
            <>
              <strong>Measured:</strong> the masses of the proton, the neutron and the helium-4 nucleus (CODATA 2022 values, from NIST); the two equal light pulses are a model of the accounting.{' '}
            </>
          )}
          {!inMeV && (
            <>
              <strong>Measured:</strong> nothing on this page. The rules have been tested in particle accelerators (the tutor says more).{' '}
            </>
          )}
          <strong>Imagined for the question:</strong> the particles and the observers{inMeV ? ', and the way the pieces come together' : ''}.
        </WhereFrom>
      )}

      {observerDrawn && (
        <>
          <p style={{ margin: '1.25rem 0 0.5rem' }}>
            <strong>{picture2}: the same reaction, as the passing observer sees it.</strong> It appears below {picture1} after the lab's reaction has played. The particles are drawn in purple instead of blue (light is still
            yellow), so you can tell at a glance whose numbers you are reading.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Whose view it is.</strong> The passing observer moves along the same line, so for <em>them</em> it is the lab, and everything in it, that moves. The pieces move differently from how they did in {picture1}.
              A pair that left the meeting point in opposite directions in the lab may leave in the same direction for this observer.
            </li>
            <li>
              <strong>Light.</strong> Light always moves at c for every observer, but its energy differs: of two light pulses, one can have more energy than the other, and the lengths of their arrows show it.
            </li>
            <li>
              <strong>The same scale.</strong> The drawing uses the same number of pixels for each 1c of speed as {picture1}, so you can compare how far and how fast things move in the two pictures.
            </li>
          </ul>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>What to look for in {picture2}.</strong>
          </p>
          <LookForList items={picture2Items} />
          <p style={{ margin: '0.75rem 0 0' }}>
            <strong>A worked moment, with numbers that are not among the choices.</strong> Say a particle and its antiparticle each move at 0.5c in the lab. In the lab's picture you would read, under the particle, energy
            1.155, momentum × c 0.577 and rest mass 1, and under the antiparticle, energy 1.155, momentum × c −0.577 and rest mass 1. Before the reaction, the total energy is 1.155 + 1.155 = 2.309 and the total momentum × c is
            0.577 + (−0.577) = 0. The sum of the rest masses is 1 + 1 = 2. Now say the passing observer moves at +0.2c. The rule is the one from Section A: divide by the time dilation factor at 0.2c, which is √(1 − 0.04) = 0.980,
            and use energy − 0.2 × momentum × c and momentum × c − 0.2 × energy. For the particle, the energy is (1.155 − 0.2 × 0.577) ÷ 0.980 = 1.061 and the momentum × c is (0.577 − 0.2 × 1.155) ÷ 0.980 = 0.354. For the
            antiparticle, they are (1.155 + 0.2 × 0.577) ÷ 0.980 = 1.296 and (−0.577 − 0.2 × 1.155) ÷ 0.980 = −0.825. So this observer's totals before the reaction are 2.357 and −0.471. The experiment does this arithmetic for
            you, and shows what comes out of the meeting.
          </p>
          {!own && (
            <WhereFrom>
              <strong>Calculated here:</strong> every number, by the same rule that carried energy and momentum from one observer to another in Section A. <strong>Measured:</strong>{' '}
              {inMeV ? 'the three masses (CODATA 2022, from NIST)' : 'nothing on this page'}. <strong>Imagined for the question:</strong> the particles and the observers.
            </WhereFrom>
          )}
        </>
      )}
      <p style={{ ...smallNote, marginTop: '0.75rem' }}>
        The animation takes about 12 seconds. It only sets how fast you watch, and it does not change what the experiment finds. At the end, everything stays on the screen.
      </p>
    </div>
  )
}

// ---- Part 3: the results of Part 1's run (draft section 6) ----

export function ReactionResults({ prediction, heliumRun }: { prediction: Prediction; heliumRun: boolean }) {
  const result = runReactionExperiment('annihilation', SECTION_C_SPEED, SECTION_C_PASSING_SPEED)
  const unit = 'rest energies'
  const readings = (pieces: ReactionPiece[]) => pieces.map((piece) => piece.reading)
  const labBefore = totalsOf(readings(result.labBefore))
  const labAfter = totalsOf(readings(result.labAfter))
  const passingBefore = totalsOf(readings(result.passingBefore))
  const passingAfter = totalsOf(readings(result.passingAfter))
  const passingMassBefore = systemMassOf(readings(result.passingBefore))
  const passingMassAfter = systemMassOf(readings(result.passingAfter))
  const checkUp = reactionCheckUpRows(result)
  const row = (name: string, before: number, after: number) => [name, formatNumber(before), formatNumber(after), formatDifference(after - before)]
  const released = result.energyReleased
  const guessLabel = PREDICTION_CHOICES.find((c) => c.value === prediction)!.label
  const helium = heliumCheckUp(runReactionExperiment('helium-binding', 0, 0.3))
  const heliumResult = runReactionExperiment('helium-binding', 0, 0.3)

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ ...NOTE, marginTop: 0 }}>
        These numbers are for Part 1's run: a particle and its antiparticle, each moving at {SECTION_C_SPEED}c in the lab, and a passing observer moving at +{SECTION_C_PASSING_SPEED}c. They are in rest energies of one particle.
        They never change with your prediction or with the settings you try in Part 2.
      </p>

      <div style={{ ...NOTE, padding: '0.75rem 1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', marginBottom: '1.25rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Your prediction, beside the results</p>
        <p style={{ margin: 0 }}>
          <strong>Your guess:</strong> {guessLabel} <strong>The question it was about:</strong> how does the total of the masses of the separate pieces compare before and after a particle and its antiparticle meet?{' '}
          <strong>Where its numbers appear:</strong> the row tagged "your guess" in the table below, and the first two bars of the mass ledger in Picture 1. It shows only what you chose.
        </p>
      </div>

      <div style={{ ...NOTE, margin: '0 0 1.25rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Now that you have run it</p>
        <p style={{ margin: '0 0 0.25rem' }}>
          Two lines were left out of the introduction, because they would have given away what you were asked to predict. Here they are.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>Energy released:</strong> (sum of the rest masses before − sum after) × c². In words: "the drop in the total of the rest masses, times c², is the amount of energy given off." Example, in rest energies: if
            the rest masses add up to 3 before and 2.5 after, then 3 − 2.5 = 0.5 rest energies are released. If it were the other way round, 2.5 before and 3 after, the result would be 2.5 − 3 = −0.5, and a minus sign means
            energy is absorbed instead. <em>What it does not mean:</em> it does not say that a given process releases or absorbs energy. The experiment shows that.
          </li>
          <li>
            <strong>The system's mass and the sum of the separate masses.</strong> The system's mass is not the sum of the pieces' masses. They are two different totals, and a reaction can change one without changing the other.
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.25rem' }}>The check-up</h4>
      <p style={{ ...NOTE, margin: '0 0 0.5rem' }}>
        Each row sets what the same physics says to expect beside what was found in your run, with a plain reading. No outside measurement is used in this table.
      </p>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
          <thead>
            <tr>
              {['Check', 'What we would expect', 'What was found', 'Reading'].map((h) => (
                <th key={h} style={{ textAlign: 'left', ...CELL }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checkUp.map((r) => (
              <tr key={r.check}>
                <td style={CELL}>{r.check}</td>
                <td style={CELL}>{r.expected === null ? 'equal' : formatNumber(r.expected)}</td>
                <td style={CELL}>{r.found.map(formatNumber).join(' and ')}</td>
                <td style={CELL}>{r.reading}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <NotesBlock title="What this table tells us">
        <li>
          <strong>What it is:</strong> seven checks of the page's own physics. The first four set each observer's total energy and total momentum × c, after the reaction minus before, beside 0, the value that conservation
          expects. The last three set the system's mass beside itself: before and after for each observer, and the lab's beside the passing observer's.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the lab's total energy is {formatNumber(labBefore.energy)} before and {formatNumber(labAfter.energy)} after, and the passing observer's is{' '}
          {formatNumber(passingBefore.energy)} and {formatNumber(passingAfter.energy)}. Every difference is 0, and the system's mass is {formatNumber(result.systemMassBefore)} in all three comparisons.
        </li>
        <li>
          <strong>Why it matters:</strong> energy and momentum are kept for every observer, and so is the system's mass. A bookkeeping that loses nothing is what lets you see what a reaction does change.
        </li>
        <li>
          <strong>How sure the numbers are:</strong> they are calculated here from the rules in the introduction, not measured on this page. The expected values come from the same rules, so this checks that the page is
          consistent with them. It is not an outside test of the rules.
        </li>
      </NotesBlock>

      <h4 style={{ margin: '0 0 0.25rem' }}>The sum of the rest masses</h4>
      <p style={{ ...NOTE, margin: '0 0 0.5rem' }}>
        This adds up the masses of the separate pieces, and a pulse of light counts as zero. In {unit}.
      </p>
      <ResultsTable head={['', 'Before', 'After', 'Difference']} rows={[row('Sum of the rest masses', result.sumOfRestMassesBefore, result.sumOfRestMassesAfter)]} tagRow={0} />
      <NotesBlock title="What this table tells us">
        <li>
          <strong>What it is:</strong> the total of the masses the separate pieces would have if each sat still, before and after the meeting.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the particle and its antiparticle have a rest mass of 1 each, so {two(result.sumOfRestMassesBefore)} before. The two pulses of light count as zero, so{' '}
          {two(result.sumOfRestMassesAfter)} after. The difference is {formatDifference(result.sumOfRestMassesAfter - result.sumOfRestMassesBefore)}.
        </li>
        <li>
          <strong>Why it matters:</strong> this is the total your guess was about. It is a different number from the system's mass in the next table, and the pair of numbers shows what the reaction changes and what it does not.
        </li>
      </NotesBlock>

      <h4 style={{ margin: '0 0 0.25rem' }}>The system's mass</h4>
      <p style={{ ...NOTE, margin: '0 0 0.5rem' }}>
        It is worked out from the total energy and the total momentum × c of all the pieces, as M = √(E_total² − (P_total c)²). In {unit}.
      </p>
      <ResultsTable
        head={['Observer', 'Before', 'After', 'Difference']}
        rows={[
          row("The system's mass, found by the lab", result.systemMassBefore, result.systemMassAfter),
          row("The system's mass, found by the passing observer", passingMassBefore, passingMassAfter),
        ]}
      />
      <NotesBlock title="What this table tells us">
        <li>
          <strong>What it is:</strong> the mass of the whole group of pieces taken together, worked out by each observer from their own totals.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the lab finds {formatNumber(result.systemMassBefore)} before and {formatNumber(result.systemMassAfter)} after. The passing observer finds{' '}
          {formatNumber(passingMassBefore)} and {formatNumber(passingMassAfter)}. All four are the same.
        </li>
        <li>
          <strong>Why it matters:</strong> the system's mass does not depend on the observer, and the reaction does not change it, even where the pieces themselves change. The tutor explains how two pulses of light, which have no mass
          each, can have a mass together.
        </li>
      </NotesBlock>

      <h4 style={{ margin: '0 0 0.25rem' }}>The energy released or absorbed</h4>
      <p style={{ ...NOTE, margin: '0 0 0.5rem' }}>
        The sum of the rest masses before minus the sum after, in {unit}.{' '}
        {released > 0 ? `Energy released: ${formatNumber(released)} ${unit}.` : released < 0 ? `Energy absorbed: ${formatNumber(-released)} ${unit}.` : 'No energy was released or absorbed.'}
      </p>
      <NotesBlock title="What this table tells us">
        <li>
          <strong>What it is:</strong> the drop in the sum of the rest masses, which is the amount that the rule "energy released = drop in rest masses × c²" counts as given off.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> {two(result.sumOfRestMassesBefore)} − {two(result.sumOfRestMassesAfter)} = {two(released)} {unit}. In the lab the two pulses carry {two(labAfter.energy)} {unit} between
          them, which is the total energy before.
        </li>
        <li>
          <strong>Why it matters:</strong> this is where the rest energy of the particle and its antiparticle went. The tutor goes through what "released" means here and what it does not.
        </li>
      </NotesBlock>

      <h4 style={{ margin: '0 0 0.25rem' }}>The total energy before and after the reaction, for each observer</h4>
      <p style={{ ...NOTE, margin: '0 0 0.5rem' }}>In {unit}. Each difference is the total after minus the total before.</p>
      <ResultsTable head={['Observer', 'Before', 'After', 'Difference']} rows={[row('The lab', labBefore.energy, labAfter.energy), row('The passing observer', passingBefore.energy, passingAfter.energy)]} />
      <h4 style={{ margin: '0 0 0.25rem' }}>The total momentum × c before and after the reaction, for each observer</h4>
      <p style={{ ...NOTE, margin: '0 0 0.5rem' }}>It is in the same units as the energy. A minus sign means the total points to the left.</p>
      <ResultsTable
        head={['Observer', 'Before', 'After', 'Difference']}
        rows={[row('The lab', labBefore.momentumTimesC, labAfter.momentumTimesC), row('The passing observer', passingBefore.momentumTimesC, passingAfter.momentumTimesC)]}
      />
      <NotesBlock title="What these two tables tell us">
        <li>
          <strong>What they are:</strong> each observer's totals of energy and of momentum × c, before and after, and the difference.
        </li>
        <li>
          <strong>What they mean with the real numbers:</strong> the lab's momentum × c is {formatNumber(labBefore.momentumTimesC)} before and {formatNumber(labAfter.momentumTimesC)} after. The passing observer's is{' '}
          {formatNumber(passingBefore.momentumTimesC)} and {formatNumber(passingAfter.momentumTimesC)}. The observers' numbers differ from each other, but each observer's own totals do not change.
        </li>
        <li>
          <strong>Why it matters:</strong> this is the conservation rule the experiment relies on. It is what lets the page work out what comes out of the meeting without guessing.
        </li>
      </NotesBlock>

      <h4 style={{ margin: '0 0 0.25rem' }}>The helium check-up</h4>
      {heliumRun ? (
        <>
          <p style={{ ...NOTE, margin: '0 0 0.5rem' }}>
            From your run of "A helium nucleus forms" in Part 2. The published reference is worked out from measured masses, so this one row does use an outside source.
          </p>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
              <thead>
                <tr>
                  {['Check', 'Published reference', 'What was found', 'Reading'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', ...CELL }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={CELL}>Energy released when helium-4 forms</td>
                  <td style={CELL}>{helium.published.toFixed(4)} MeV</td>
                  <td style={CELL}>{helium.found.toFixed(4)} MeV</td>
                  <td style={CELL}>{helium.reading}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <NotesBlock title="What this table tells us">
            <li>
              <strong>What it is:</strong> the energy given off when two protons and two neutrons bind into helium-4, set beside the same energy worked out from the measured masses of the proton, the neutron and the helium-4 nucleus
              (2022 CODATA values, from NIST).
            </li>
            <li>
              <strong>What it means with the real numbers:</strong> 2 × 938.2721 + 2 × 939.5654 − 3727.3794 = {helium.published.toFixed(4)} MeV from the published masses. The page's own masses give {helium.found.toFixed(4)} MeV, which is{' '}
              {((heliumResult.energyReleased / heliumResult.sumOfRestMassesBefore) * 100).toFixed(3)} percent of the mass of the four pieces. The reading is "the same" when they agree to the rounding of the page's masses, which are given to 0.001 MeV.
            </li>
            <li>
              <strong>Why it matters:</strong> it shows that a real nucleus weighs less than its parts by an amount that matches a published energy.
            </li>
            <li>
              <strong>How sure the number is:</strong> the published masses are measured to about one part in ten billion, so the reference is firm. It is worked out here from them, not copied from a table of binding energies.
            </li>
          </NotesBlock>
        </>
      ) : (
        <p style={{ ...NOTE, margin: '0 0 1rem' }}>
          <strong>Not run yet.</strong> This check-up appears once you have run "A helium nucleus forms". Go back to Part 2, choose it and press Run these settings.
        </p>
      )}
    </div>
  )
}

// ---- "Want to know more?" (draft section 9). Every page was fetched and read on 2026-11-21 before it was linked. ----

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function ReactionLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://home.cern/science/physics/antimatter/">CERN, "Antimatter"</Ext> (page read on 21 November 2026; it shows no date): every particle has an antiparticle with the same mass and the opposite electric
          charge; they are made in pairs, and when they meet they annihilate, leaving only energy behind.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.nibib.nih.gov/science-education/science-topics/nuclear-medicine">NIBIB (US National Institutes of Health), "Nuclear Medicine"</Ext> (reviewed September 2025): how a PET scan uses a positron meeting an
          electron, which gives two gamma-ray photons going in opposite directions.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sun.html">NASA Goddard, "Cosmicopia: Ask Us: Sun"</Ext> (an archived Goddard page, read on 21 November 2026; its answers are dated 2000 to 2010): the Sun fuses
          about 600 million tons of hydrogen every second, and its power divided by c² is about 4 million tons of mass per second.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Where the numbers come from</p>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://physics.nist.gov/cgi-bin/cuu/Value?malc2mev">NIST, 2022 CODATA recommended values</Ext> (read on 21 November 2026): the measured mass, as an energy in MeV, of the alpha particle (the helium-4 nucleus). The same site has
          the proton, the neutron and the electron (
          <Ext href="https://physics.nist.gov/cgi-bin/cuu/Value?mpc2mev">proton</Ext>, <Ext href="https://physics.nist.gov/cgi-bin/cuu/Value?mnc2mev">neutron</Ext>,{' '}
          <Ext href="https://physics.nist.gov/cgi-bin/cuu/Value?mec2mev">electron</Ext>). These are tables of numbers, not plain pages.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        No plain-language page from NASA, ESA, CERN or another official source was found, and read, for <em>binding energy and mass defect</em> or for <em>the electron-volt</em> (searched 21 November 2026), so this page explains
        them in its own words. The original papers for the positron (Anderson, 1932) and the antiparticle idea (Dirac, 1928) were not fetched, so they are not linked. The energy rule behind this chapter is Einstein's 1905 paper,
        linked at the end of Section A's results.
      </p>
    </div>
  )
}

type PlayStatus = 'idle' | 'running' | 'complete'

// Plays a run: progress goes from 0 to 1 over ANIMATION_DURATION_MS, then the status becomes 'complete'. The length only sets how fast the result is shown (§11).
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
  }, [status, setStatus, setProgress, onDone])
}

interface ShownRun {
  kind: ReactionKind
  setting: number
  passingSpeed: number
}

// The processes of Part 2, in the order the next one not yet run is chosen automatically. A particle and its antiparticle already ran in Part 1.
const PART_TWO_ORDER: ReactionKind[] = ['pair-creation', 'helium-binding', 'annihilation']

// Section C. Part 1 is one guess about one fixed run, and locks when Run is pressed. Parts 2 to 4 appear once that run has finished. Start over clears everything of
// Section C. `skippedPartOne` and `skippedPartTwo` are true when the learner reached it with a skip link instead of through that section's tutor; the introduction then
// adds a reminder, because it uses ideas from that section. `onBackToPartOne` and `onBackToPartTwo` scroll back up to Sections A and B.
export function EnergyMomentumReactions({
  skippedPartOne = false,
  skippedPartTwo = false,
  onBackToPartOne,
  onBackToPartTwo,
  onComplete,
  onTutorComplete,
}: {
  skippedPartOne?: boolean
  skippedPartTwo?: boolean
  onBackToPartOne?: () => void
  onBackToPartTwo?: () => void
  // Called when Part 1's playback reaches its end, and when the tutor reaches its explanation (the experiment's completion marks).
  onComplete?: () => void
  onTutorComplete?: () => void
}) {
  // ---- Part 1: one guess, one fixed run (a particle and its antiparticle at 0.6c, a passing observer at +0.3c) ----
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState<PlayStatus>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the Start overs, so the tutor starts again at its first question.
  const [resetCount, setResetCount] = useState(0)

  // ---- Part 2: the learner's own choice. The choice (kind, settings, observer) is separate from the run shown, so the next process can be selected while the last run stays on the screen. ----
  const [kind, setKind] = useState<ReactionKind>(PART_TWO_ORDER[0])
  const [settings, setSettings] = useState<Record<ReactionKind, number>>(START_SETTING)
  const [passingSpeed, setPassingSpeed] = useState(0.3)
  const [shown, setShown] = useState<ShownRun | null>(null)
  const [ownStatus, setOwnStatus] = useState<PlayStatus>('idle')
  const [ownProgress, setOwnProgress] = useState(0)
  // The runs finished in Part 2, by process (the tutor's paragraphs and the helium check-up use them).
  const [ran, setRan] = useState<Partial<Record<ReactionKind, ShownRun>>>({})

  const partOneDone = status === 'complete'
  const playing = status === 'running' || ownStatus === 'running'
  const startOverDisabled = (prediction === null && status === 'idle' && ownStatus === 'idle') || playing
  const setting = settings[kind]
  const settingPresets = kind === 'annihilation' ? ANNIHILATION_SPEEDS : kind === 'pair-creation' ? PHOTON_ENERGIES : []

  usePlayback(status, setStatus, setProgress, onComplete)
  usePlayback(ownStatus, setOwnStatus, setOwnProgress)

  // When a Part 2 run finishes, record it and select the next process not yet run (the last run stays on the screen).
  useEffect(() => {
    if (ownStatus !== 'complete' || shown === null) return
    const nowRan = { ...ran, [shown.kind]: shown }
    setRan(nowRan)
    const next = PART_TWO_ORDER.find((k) => k !== shown.kind && nowRan[k] === undefined && !(k === 'annihilation'))
    if (next !== undefined) setKind(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownStatus])

  const handleRun = () => {
    if (prediction === null || locked) return
    setLocked(true)
    setProgress(0)
    setStatus('running')
  }
  // Start over: clears the guess, the runs, the results and the tutor of Section C, and returns Section C to its first state.
  const handleStartOver = () => {
    if (playing) return
    setPrediction(null)
    setLocked(false)
    setStatus('idle')
    setProgress(0)
    setKind(PART_TWO_ORDER[0])
    setSettings(START_SETTING)
    setPassingSpeed(0.3)
    setShown(null)
    setOwnStatus('idle')
    setOwnProgress(0)
    setRan({})
    setResetCount((n) => n + 1)
  }
  const handleRunOwn = () => {
    setShown({ kind, setting, passingSpeed })
    setOwnProgress(0)
    setOwnStatus('running')
  }
  const pinkFrame = { borderLeft: `4px solid ${PART_TWO_COLOR}`, paddingLeft: '0.75rem' } as const
  const notRun = (['pair-creation', 'helium-binding'] as ReactionKind[]).filter((k) => ran[k] === undefined)
  const extraRuns = { 'pair-creation': ran['pair-creation'], 'helium-binding': ran['helium-binding'] }

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Section C: Reactions, can the masses change?</h3>
      {(onBackToPartOne || onBackToPartTwo) && (
        <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1rem' }}>
          {onBackToPartOne && (
            <button type="button" onClick={onBackToPartOne} style={linkButton}>
              ← Back to Section A - Energy and momentum
            </button>
          )}
          {onBackToPartOne && onBackToPartTwo && ' · '}
          {onBackToPartTwo && (
            <button type="button" onClick={onBackToPartTwo} style={linkButton}>
              ← Back to Section B - Collision
            </button>
          )}
        </p>
      )}

      {/* Introduction (draft wording, section 1, for the owner's review, CLAUDE.md §28.1). Every term is defined before it is used, each formula is read in words with a worked example,
          and nothing says how the masses compare in any reaction (that is the prediction, §12). The two formulas that would give it away are shown in Part 3. */}
      <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {skippedPartOne && (
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>If you skipped Section A.</strong> This section uses three ideas from Section A. First, a particle's energy and its momentum × c are measured in the same units, and its <em>rest energy</em>, the energy
            it has when it sits still, is the unit, written as 1. Second, a particle moving at speed v has an energy of E = 1 ÷ D(v), where D(v) = √(1 − v²) is the time dilation factor. For example, at 0.6c, D = √(1 − 0.36) =
            0.8, so E = 1 ÷ 0.8 = 1.25 rest energies. Third, a pulse of light has no mass, and its energy equals its momentum × c. Open the "Words and formulas" panel at the top of the page if you need more of a reminder.
          </p>
        )}
        {skippedPartTwo && (
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>If you skipped Section B.</strong> This section uses the mass of a system from Section B. A <em>system</em> is a group of pieces taken together, and its mass is worked out from its total energy and its total
            momentum × c: M = √(E_total² − (P_total c)²). For example, a group of pieces with a total energy of 5 and a total momentum × c of 3 has M = √(25 − 9) = 4. The totals add up each piece's value with its direction,
            so a piece moving to the left counts as negative. Open the "Words and formulas" panel at the top of the page if you need a reminder.
          </p>
        )}

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The question.</strong> In Section B two lumps of clay stuck together, and we asked two things. First, what happens if we weigh each piece on its own and add the weights up? Second, what is the
            mass of the whole group of pieces taken together? In Section C we ask the same two things, but in situations where the pieces themselves change. They do not just stick together. Here are the three
            situations.
          </p>
          <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>A particle meets its "opposite twin".</strong> Every kind of particle has a twin called an <em>antiparticle</em>. It has the same mass, but the opposite electric charge. The electron's twin is
              the positron. When a particle and its twin meet, both can disappear, and light comes out. This really happens: a hospital PET scan works by detecting the light given off when positrons meet electrons
              in the body.
            </li>
            <li>
              <strong>Light turns into particles.</strong> Light that carries enough energy can turn into a particle and its twin. Pieces appear where there were none. There is a smallest amount of energy for this
              (called a threshold), and with less light than that, nothing appears.
            </li>
            <li>
              <strong>Four particles join into one.</strong> Two protons and two neutrons can bind together into a single helium nucleus. This kind of joining is what makes the Sun shine.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What stays the same in all three.</strong> The total energy and the total momentum are conserved, as in Section B. Think of money moved between bank accounts: the amount in each account changes,
            but the grand total does not. Here the "accounts" are the pieces before and the pieces after.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The two things we ask about.</strong> They sound alike, but they are different.
          </p>
          <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The total of the separate masses.</strong> Imagine weighing every piece alone, sitting still, and adding the numbers up. For example, a 2 kg bag and a 3 kg bag give 2 + 3 = 5 kg. A piece of
              light has no mass, so it adds nothing to this total.
            </li>
            <li>
              <strong>The mass of the whole system.</strong> This is not found by weighing the pieces. It is worked out from the <em>total energy</em> and the <em>total momentum</em>, with the formula from Section B:
              M = √(E_total² − (P_total c)²). For example, a group with a total energy of 5 and a total momentum × c of 3 has M = √(25 − 9) = 4, whatever the pieces inside it are doing.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            A shop gives an everyday comparison. For a bag of coins, "how many coins are there?" and "what is their total value?" are two different questions. After you swap some coins for others, either answer
            might stay the same or might change. Section C finds out which is which, for the masses.
          </p>
          <p style={{ margin: 0 }}>
            <strong>What you will do.</strong> You are asked to predict first, for a particle meeting its twin: how does the total of the separate masses compare before and after they meet? Then you can try all three
            situations and watch what each one does.
          </p>
        </div>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>Why these three processes.</strong> They are the best-known cases where the pieces themselves change, not just their motion. In one, pieces disappear. In another, pieces appear from light. In the third, several
          pieces become one. Trying all three lets you see what happens in each, so you do not have to trust a single example.
        </p>

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Some new words.</strong> Here is each one in plain language, with an example.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Electric charge:</strong> a property that makes things pull or push each other. When you rub a balloon on your hair, it picks up charge and then sticks to the wall. The electron has negative charge, the
              proton positive, and the neutron none.
            </li>
            <li>
              <strong>Antiparticle:</strong> a particle with the same mass as another, but opposite electric charge. Think of it as the particle's opposite twin. The electron's antiparticle is the <strong>positron</strong>, with
              the same mass as the electron but positive charge. Charge is conserved too: a particle and its antiparticle have a total charge of zero, so the two together are electrically neutral.
            </li>
            <li>
              <strong>Photon:</strong> here, a pulse of light of a given energy, with no mass. (The quantum idea behind the word is not needed.) We draw it as an arrow, with no circle.
            </li>
            <li>
              <strong>Annihilation:</strong> a particle and its antiparticle meeting and turning into light. <strong>Pair creation:</strong> light turning into a particle and its antiparticle.
            </li>
            <li>
              <strong>Threshold:</strong> the least energy at which something can happen. To get over a 1-meter wall you have to jump at least high enough to reach the top. With less, nothing happens at all: you do not get
              half-way over. Or: a bus ride costs 2 coins, and with 1 coin you cannot go at all.
            </li>
            <li>
              <strong>Atomic nucleus:</strong> the tiny, heavy core of an atom, made of <strong>protons</strong> (positive) and <strong>neutrons</strong> (no charge). <strong>Helium-4</strong> is the common kind of helium, with two
              protons and two neutrons in its nucleus.
            </li>
            <li>
              <strong>Binding energy:</strong> the energy needed to pull a nucleus apart into its separate protons and neutrons. It is also the energy released when they come together. Think of a ball in a pit. If it takes 5 units
              of energy to lift the ball out, then it gives up those same 5 units when it falls back in.
            </li>
            <li>
              <strong>Mass defect:</strong> how much less a nucleus weighs than its separate parts. (The experiment shows the amount.)
            </li>
            <li>
              <strong>Fusion:</strong> nuclei joining into a heavier nucleus, as happens in the Sun.
            </li>
            <li>
              <strong>The electron-volt (eV):</strong> the unit of energy used for particles. It is the energy an electron gains when it crosses a 1-volt battery. 1 eV is a tiny 1.6 × 10⁻¹⁹ joules, far too small for everyday use
              but about the right size for a single particle: a particle of visible light carries about 2 or 3 eV. <strong>keV</strong> is a thousand eV, <strong>MeV</strong> a million, <strong>GeV</strong> a billion, and{' '}
              <strong>TeV</strong> a million million. Particle masses are written as energy divided by c²: "938 MeV/c²" is the proton's, and 938 MeV is its rest energy.
            </li>
            <li>
              <strong>The sum of the rest masses, and the system's mass:</strong> these are two different totals. The first adds up the masses of the separate pieces, each as it would be if the piece sat still, and a pulse of
              light counts as zero. The second is the M from Section B, worked out from the pieces' <em>total energy</em> and <em>total momentum</em>. The experiment compares the first total before and after, and then does the
              same for the second.
            </li>
            <li>
              <strong>Mass ledger:</strong> the name of the four bars the experiment draws once the reaction has happened: the sum of the rest masses and the system's mass, each before and after, all on one scale.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Formulas needed here.</strong> Each is read in words, with an example worked out step by step. One more is given in Part 3, after your first run, because it would give away what you are asked to predict.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>The system's mass again:</strong> M = √(E_total² − (P_total c)²). In words: "add up all the energies, add up all the momenta × c (with their directions), and put the two totals through the same
              subtract-the-squares combination as before." Example: pieces with a total energy of 5 and a total momentum × c of 3 give M = √(25 − 9) = √16 = 4.
            </li>
            <li>
              <strong>Speed from energy:</strong> a particle with energy E (in its own rest energies) has D = 1 ÷ E, so v = √(1 − 1 ÷ E²). In words: "the more energy it has, the closer to c it moves." It follows from E = 1 ÷
              D(v) in the introduction at the top of the page. Example, which is not one of the choices: E = 3 gives D = 1/3, so v = √(1 − 1/9) = √(8/9) = 0.943. As a check, E = 1 gives v = √(1 − 1) = 0: a particle with only
              its rest energy is at rest.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What happens.</strong> Part 1 shows one reaction twice: a particle and its antiparticle meet in the lab, and then a passing observer sees the same meeting.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Before you press Run.</strong> You see the setup: the two pieces, each with an arrow for its way and speed, and the numbers the lab measures for each (energy, momentum × c and rest mass).
            </li>
            <li>
              <strong>Picture 1, the lab's view.</strong> The pieces slide together, a yellow ring flashes where they meet, and the pieces after the meeting appear. Then four bars appear on one scale: the mass ledger.
            </li>
            <li>
              <strong>Picture 2, a passing observer's view.</strong> The same reaction replayed with that observer's numbers.
            </li>
            <li>
              <strong>Then it is your turn.</strong> In Part 2 you try two other processes (two beams of light meeting, and a helium nucleus forming) and other settings. Part 3 gives the numbers and Part 4 is the tutor.
            </li>
          </ul>
        </div>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>Why the lab is a special observer.</strong> In every process, the lab is the observer for whom the total momentum is zero. Picture two skaters of equal weight gliding toward each other at equal speeds. To someone
          standing at the meeting point their momenta cancel: one is to the right, the other to the left, and the total is zero. We pick that observer as the lab. It keeps things simple, because a total momentum of zero before the
          reaction means a total of zero after it, and so what comes out can be worked out from energy and momentum being conserved alone, without guessing.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>The passing observer.</strong> The passing observer moves along the same line, at +0.3c to the right in Part 1. They measure the same reaction with their own ruler and clocks, so they find different speeds,
          energies and momenta from the lab, as the passing observers did in Sections A and B. The experiment shows their numbers next to the lab's, so that you can compare what each observer finds.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>Your job.</strong> Predict first. Part 1 uses a particle and its antiparticle that each move at 0.6c in the lab, and a passing observer who moves at 0.3c to the right. Choose one of the three answers, then press
          Run. You are not graded. <strong>Your prediction never changes the pictures or the tables.</strong> They come from the physics. Your guess is drawn on the mass ledger in white, with a box labelled YOUR GUESS, and it is
          shown again beside the results. After your first run, Part 2 lets you try other processes and settings. Those choices <em>do</em> change the drawings, but not your prediction. If you want to change your prediction, press
          Start over.
        </p>
        <p style={{ margin: 0 }}>
          <strong>What we assume.</strong> Energy and momentum are conserved, and nothing else enters or leaves: this is a rule of the experiment. Everything happens along one line. Only the situation just before and just after each
          reaction is shown, not the reaction itself. The helium-4 process is energy accounting only: it does not show how the pieces come together, which takes several steps in practice. Electric charge, neutrinos, and the force
          that holds a nucleus together are not part of the experiment.
        </p>
      </div>

      <ReactionLinks />

      {/* ===== Part 1: predict, then watch ===== */}
      <PartHeader color={PART_ONE_COLOR} title="Part 1: Predict, then watch">
        You will predict how the total of the masses of the pieces compares before and after a particle and its antiparticle meet, then press Run and watch the meeting from two points of view. Your guess is drawn on the real mass ledger
        in white. It never changes it.
      </PartHeader>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction</p>
        <p style={{ ...HINT, marginBottom: '0.75rem' }}>
          A particle and its antiparticle, each moving at {SECTION_C_SPEED}c in the lab, meet. {PROCESS_SENTENCE.annihilation} Energy and momentum are conserved. Add up the masses of the separate pieces <strong>before</strong>, and the
          masses of the pieces <strong>after</strong>. How do the two totals compare?
        </p>
        <div>
          {PREDICTION_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              disabled={locked}
              onClick={() => setPrediction(choice.value)}
              className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
              style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
          {prediction === null
            ? 'Choose an option to continue'
            : locked
              ? 'Your prediction is locked while you try other settings. To change it, press Start over.'
              : `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.slice(0, 3)}. You can still change it until you press Run.`}
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

      <p style={pictureTitle}>Pictures 1 and 2: the meeting, as the lab sees it and as a passing observer sees it</p>
      <ReactionDiagram kind="annihilation" setting={SECTION_C_SPEED} passingSpeed={SECTION_C_PASSING_SPEED} progress={status === 'idle' ? null : progress} guess={prediction} />
      {status === 'idle' && (
        <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.75rem' }}>
          Picture 2, the passing observer's view, the mass ledger, and your white guess on it, appear in this picture when you press Run.
        </p>
      )}
      <ReactionCaptions kind="annihilation" setting={SECTION_C_SPEED} passingSpeed={SECTION_C_PASSING_SPEED} progress={status === 'idle' ? null : progress} guess={prediction} />

      {/* ===== Part 2: appears when the first Run has finished ===== */}
      {partOneDone && (
        <>
          <PartHeader color={PART_TWO_COLOR} title="Part 2: Now try it yourself">
            You choose another process (two beams of light meeting, or a helium nucleus forming) or another setting, and press Run these settings. These choices change the drawings. Your prediction does not. They are trial values for
            imagined pieces, and they do not say that a real process is like that.
          </PartHeader>

          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            Your prediction does not change the drawings or the tables. These settings change Drawing A and Drawing B below, and they do not change Part 3's tables, which are for Part 1's run.
          </p>
          {notRun.length > 0 && (
            <p style={{ ...smallNote, fontWeight: 'bold', marginTop: 0, marginBottom: '0.75rem' }}>
              Not run yet: {notRun.map((k) => KIND_CHOICES.find((c) => c.value === k)?.label.toLowerCase()).join(', ')}. The tutor's paragraphs{notRun.includes('helium-binding') ? " and Part 3's helium check-up" : ''} for a process
              appear after you have run it here. The next one is already chosen below: press Run these settings.
            </p>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={SECTION_LABEL}>Which process</label>
            <div>
              {KIND_CHOICES.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  disabled={ownStatus === 'running'}
                  onClick={() => setKind(choice.value)}
                  className={`toggle-button${kind === choice.value ? ' is-selected' : ''}`}
                  style={BUTTON}
                >
                  {choice.label}
                  {ran[choice.value] !== undefined ? ' ✓' : ''}
                </button>
              ))}
            </div>

            {kind !== 'helium-binding' && (
              <div style={{ marginTop: '1rem' }}>
                <label style={SECTION_LABEL}>{kind === 'annihilation' ? 'The speed of each particle in the lab' : 'The energy of each beam of light in the lab'}</label>
                <p style={HINT}>
                  {kind === 'annihilation'
                    ? 'Both move at this same speed, given as a fraction of c, the speed of light, one to the right and the other to the left. "At rest" means they are not moving.'
                    : 'Both beams have this same energy, in rest energies of the particle that might be made. One moves to the right and the other to the left.'}
                </p>
                <div>
                  {settingPresets.map((value) => (
                    <button
                      key={value}
                      type="button"
                      disabled={ownStatus === 'running'}
                      onClick={() => setSettings((s) => ({ ...s, [kind]: value }))}
                      className={`toggle-button${setting === value ? ' is-selected' : ''}`}
                      style={BUTTON}
                    >
                      {settingLabel(kind, value)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <label style={SECTION_LABEL}>The passing observer's speed</label>
              <p style={HINT}>The passing observer moves along the same line. A plus sign means they move to the right, and a minus sign to the left.</p>
              <div>
                {PASSING_SPEED_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={ownStatus === 'running'}
                    onClick={() => setPassingSpeed(value)}
                    className={`toggle-button${passingSpeed === value ? ' is-selected' : ''}`}
                    style={BUTTON}
                  >
                    {passingLabel(value)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="button" className="action-button" onClick={handleRunOwn} disabled={ownStatus === 'running'} style={{ padding: '0.6rem 1.5rem' }}>
            {ownStatus === 'running' ? 'Running...' : 'Run these settings'}
          </button>

          {shown === null ? (
            <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1rem' }}>
              Choose a process and settings, then press Run these settings. Drawing A (the lab's view) and Drawing B (the passing observer's view) appear here.
            </p>
          ) : (
            <div style={pinkFrame}>
              <p style={{ ...pictureTitle, color: PART_TWO_COLOR }}>
                Drawings A and B: your last run ({KIND_CHOICES.find((c) => c.value === shown.kind)?.label.toLowerCase()}; {settingSentence(shown.kind, shown.setting).replace(/\.$/, '')}; passing observer at{' '}
                {passingLabel(shown.passingSpeed)})
              </p>
              <ReactionDiagram kind={shown.kind} setting={shown.setting} passingSpeed={shown.passingSpeed} progress={ownProgress} own />
              <ReactionCaptions kind={shown.kind} setting={shown.setting} passingSpeed={shown.passingSpeed} progress={ownProgress} own />
            </div>
          )}

          {/* ===== Part 3: the results of Part 1's run ===== */}
          <PartHeader color={PART_THREE_COLOR} title="Part 3: The results">
            Here are the numbers behind Part 1's pictures, a check-up of this page against its own physics, and your guess beside the real result. The tables never change with your prediction or with the settings you tried in Part 2.
          </PartHeader>
          {prediction !== null && <ReactionResults prediction={prediction} heliumRun={ran['helium-binding'] !== undefined} />}

          {/* ===== Part 4: the tutor ===== */}
          <PartHeader color={PART_FOUR_COLOR} title="Part 4: The tutor">
            The tutor asks you three questions, one at a time: what you saw, how your guess compares with the pictures, and where the energy went. Then it goes through your guess and explains. The tutor's questions are not marked.
          </PartHeader>
          {prediction !== null && (
            <EnergyMomentumReactionsTutor
              key={resetCount}
              kind="annihilation"
              setting={SECTION_C_SPEED}
              passingSpeed={SECTION_C_PASSING_SPEED}
              predicted={prediction}
              extraRuns={extraRuns}
              onExplained={() => onTutorComplete?.()}
            />
          )}
        </>
      )}
    </div>
  )
}
