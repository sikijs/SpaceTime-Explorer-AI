import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { runReactionExperiment } from '../physics/energyMomentum'
import type { ReactionExperimentResult, ReactionKind, ReactionPiece } from '../physics/energyMomentum'

// Steps 4 and 6 of docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md, Part 3 only: the basic interface (the
// three controls: which process, its setting, the passing observer's speed; and the setup diagram, the lab's view just before the
// reaction, with the passing observer marked), the introduction (stage C) and the prediction. The run, the results and the tutor
// are later steps, so the prediction does not gate anything yet. Every number comes from `runReactionExperiment` in `energyMomentum.ts`.
// Wording here is draft for the owner's review (CLAUDE.md §28.1).

type Prediction = 'less' | 'same' | 'more'

// The three answers of Part 3's prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1). One
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
  {
    term: 'Sum of the rest masses, and the system’s mass',
    meaning: 'the first adds up the masses of the separate pieces (a light pulse counts as zero). The second is M = √(E_total² − (P_total c)²), worked out from the pieces’ total energy and momentum.',
  },
  { term: 'Speed from energy: v = √(1 − 1 ÷ E²)', meaning: 'a particle with energy E, in its own rest energies, has D = 1 ÷ E.' },
  { term: 'Energy released', meaning: '(sum of rest masses before − sum after) × c².' },
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
const VIEW_HEIGHT = 790
const MEET_X = 260
const LAB_LINE_Y = 150
const OBSERVER_LINE_Y = 650
const PIECE_RADIUS = 16
const NUCLEUS_RADIUS = 22
// Pixels of travel to the meeting point for each 1c of speed, the same as in Part 2 and in both pictures here.
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
// the pieces after it (after 0 to 1). The same as Part 2's.
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

// The mass ledger, in the lab, once the reaction has happened: the sum of the rest masses before and after, the system's mass
// before and after, and the energy released or absorbed, all on one scale.
function MassLedger({ result, inMeV }: { result: ReactionExperimentResult; inMeV: boolean }) {
  const unit = inMeV ? 'MeV' : 'rest energies'
  const rows: { label: string; value: number; color: string; y: number }[] = [
    { label: 'Sum of the rest masses, before', value: result.sumOfRestMassesBefore, color: '#94a3b8', y: LEDGER_TOP + 24 },
    { label: 'Sum of the rest masses, after', value: result.sumOfRestMassesAfter, color: LAB_COLOR, y: LEDGER_TOP + 46 },
    { label: "The system's mass, before", value: result.systemMassBefore, color: '#94a3b8', y: LEDGER_TOP + 82 },
    { label: "The system's mass, after", value: result.systemMassAfter, color: LAB_COLOR, y: LEDGER_TOP + 104 },
  ]
  const scale = LEDGER_BAR_MAX / Math.max(...rows.map((r) => r.value), 1e-9)
  const released = result.energyReleased
  const releasedText =
    Math.abs(released) < 5e-10
      ? 'No energy is released or absorbed.'
      : released > 0
        ? `Energy released: ${released.toFixed(2)} ${unit}`
        : `Energy absorbed: ${(-released).toFixed(2)} ${unit}`
  return (
    <g>
      <text x="12" y={LEDGER_TOP} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The mass ledger, in the lab (in {unit})
      </text>
      {rows.map((row) => (
        <g key={row.label}>
          <text x="12" y={row.y + 8} fontSize="10" fill={row.color}>
            {row.label}
          </text>
          <rect x={LEDGER_BAR_X} y={row.y} width={Math.max(row.value * scale, 2)} height="10" rx="2" fill={row.color} />
          <text x={LEDGER_BAR_X + Math.max(row.value * scale, 2) + 6} y={row.y + 9} fontSize="10" fill={row.color}>
            {row.value.toFixed(2)}
          </text>
        </g>
      ))}
      <text x="12" y={LEDGER_TOP + 138} fontSize="11" fontWeight="bold" fill={LIGHT_COLOR}>
        {releasedText}
      </text>
    </g>
  )
}

interface ReactionDiagramProps {
  kind: ReactionKind
  setting: number
  passingSpeed: number
  // null while idle (only the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
}

// While idle it draws the lab's setup, just before the reaction, with the passing observer marked. While the run plays it shows the
// lab's reaction first, with the mass ledger, and then the same reaction as the passing observer sees it, both in the same style.
function ReactionDiagram({ kind, setting, passingSpeed, progress }: ReactionDiagramProps) {
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
        title={playing ? "Picture 1: the lab's view of the reaction" : "The lab's view, just before the reaction"}
        subtitle=""
        frameColor={LAB_COLOR}
        q={labQ}
        before={result.labBefore}
        after={result.labAfter}
        created={result.created}
        inMeV={inMeV}
      />

      {/* The passing observer: a hollow circle (as in Parts 1 and 2) with an arrow for their way and speed. */}
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

      {labCollided && <MassLedger result={result} inMeV={inMeV} />}

      {showObserverPicture ? (
        <ReactionPanel
          kind={kind}
          lineY={OBSERVER_LINE_Y}
          title="Picture 2: the same reaction, as the passing observer sees it"
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

// Part 3's section: the controls and the setup diagram only. The settings are remembered for each process, so that going back to a
// process does not lose its setting.
export function EnergyMomentumReactions() {
  const [kind, setKind] = useState<ReactionKind>('annihilation')
  const [settings, setSettings] = useState<Record<ReactionKind, number>>(START_SETTING)
  const [passingSpeed, setPassingSpeed] = useState(0.3)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const setting = settings[kind]
  // Changing a setting, or the prediction, returns to the setup, so a run is never shown for different settings.
  const returnToIdle = () => {
    setStatus('idle')
    setProgress(0)
  }

  useEffect(() => {
    if (status !== 'running') return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const fraction = clamp01((currentTime - startTime) / ANIMATION_DURATION_MS)
      setProgress(fraction)

      if (fraction >= 1) {
        setStatus('complete')
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status])
  const settingPresets = kind === 'annihilation' ? ANNIHILATION_SPEEDS : kind === 'pair-creation' ? PHOTON_ENERGIES : []

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Part 3 — Reactions: can the masses change?</h3>

      {/* Introduction, stage C (needed by Part 3): draft wording for the owner's review (CLAUDE.md §28.1), from the specification's
          "Introduction: three stages". It does not say how the masses compare in any reaction (that is Part 3's prediction, §12). */}
      <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Some new words.</strong> Here is each one in plain language.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Electric charge:</strong> a property that makes things pull or push each other. The electron has negative
              charge, the proton positive, and the neutron none.
            </li>
            <li>
              <strong>Antiparticle:</strong> a particle with the same mass as another, but opposite electric charge. The electron's
              antiparticle is the <strong>positron</strong>. Charge is conserved too: a particle and its antiparticle have a total
              charge of zero.
            </li>
            <li>
              <strong>Photon:</strong> here, a light pulse of a given energy, with no mass. (The quantum idea behind the word is not
              needed.)
            </li>
            <li>
              <strong>Annihilation:</strong> a particle and its antiparticle meeting and turning into light.{' '}
              <strong>Pair creation:</strong> light turning into a particle and its antiparticle.
            </li>
            <li>
              <strong>Threshold:</strong> the least energy at which something can happen. To get over a 1-meter wall you have to jump
              at least high enough to reach the top. With less, nothing happens at all.
            </li>
            <li>
              <strong>Atomic nucleus:</strong> the tiny, heavy core of an atom, made of <strong>protons</strong> (positive) and{' '}
              <strong>neutrons</strong> (no charge). <strong>Helium-4</strong> has two of each.
            </li>
            <li>
              <strong>Binding energy:</strong> the energy needed to pull a nucleus apart into its separate protons and neutrons. It
              is also the energy released when they come together. Think of a ball in a pit: it takes energy to lift it out, and it
              gives up that same energy when it falls in.
            </li>
            <li>
              <strong>Mass defect:</strong> how much less a nucleus weighs than its separate parts. (The experiment shows the
              amount.)
            </li>
            <li>
              <strong>Fusion:</strong> nuclei joining into a heavier nucleus, as happens in the Sun.
            </li>
            <li>
              <strong>The electron-volt (eV):</strong> the unit of energy used for particles: the energy an electron gains when it
              crosses a 1-volt battery. 1 eV is a tiny 1.6 × 10⁻¹⁹ joules. A particle of visible light carries about 2 or 3 eV.{' '}
              <strong>keV</strong> is a thousand eV, <strong>MeV</strong> a million, <strong>GeV</strong> a billion, and{' '}
              <strong>TeV</strong> a million million. Particle masses are written as energy divided by c²: "938 MeV/c²" is the
              proton's.
            </li>
            <li>
              <strong>The sum of the rest masses, and the system's mass:</strong> the first adds up the masses of the separate
              pieces, and a light pulse counts as zero. The second is the M from Part 2, worked out from the pieces' total energy and
              total momentum. The experiment compares the two kinds of total.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Formulas needed here.</strong> Each is read in words, with an example.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>The system's mass again:</strong> M = √(E_total² − (P_total c)²). In words: "put the total energy and the total
              momentum through the same combination." <em>What it does not mean:</em> it is not the sum of the pieces' masses.
            </li>
            <li>
              <strong>Speed from energy:</strong> a particle with energy E (in its own rest energies) has D = 1 ÷ E, so v = √(1 − 1 ÷
              E²). In words: "the more energy it has, the closer to c it moves." Example, which is not one of the choices: E = 3 gives
              D = 1/3, so v = √(1 − 1/9) = √(8/9) = 0.943. It follows from E = 1 ÷ D(v) in the introduction at the top of the page.
            </li>
            <li>
              <strong>Energy released:</strong> (sum of rest masses before − sum after) × c². In words: "the drop in the total of the
              rest masses, turned into energy." Example, in rest energies: if the pieces' rest masses add up to 3 before and 2.5 after,
              then 0.5 rest energies are released. <em>What it does not mean:</em> it does not say whether a given process releases or
              needs energy. That is for the experiment to show.
            </li>
          </ul>
        </div>

        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>What happens.</strong> Three processes are offered: a particle and its antiparticle meet, two beams of light meet,
          and two protons and two neutrons bind into a helium nucleus. In each, the lab is the observer for whom the total momentum is
          zero, and then the same reaction is shown as a passing observer measures it.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>Your job.</strong> Choose one of the processes and its setting, and choose the passing observer's speed. Then
          predict how the total of the rest masses compares before and after the reaction. You are not graded.
        </p>
        <p style={{ margin: 0 }}>
          <strong>What we assume.</strong> Energy and momentum are conserved, and nothing else enters or leaves. The helium-4 process
          is energy accounting only: it does not show how the pieces come together, which takes several steps in practice.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={SECTION_LABEL}>Which process</label>
        <div>
          {KIND_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => {
                setKind(choice.value)
                returnToIdle()
              }}
              className={`toggle-button${kind === choice.value ? ' is-selected' : ''}`}
              style={BUTTON}
            >
              {choice.label}
            </button>
          ))}
        </div>

        {kind !== 'helium-binding' && (
          <div style={{ marginTop: '1rem' }}>
            <label style={SECTION_LABEL}>
              {kind === 'annihilation' ? 'The speed of each particle in the lab' : 'The energy of each beam of light in the lab'}
            </label>
            <p style={HINT}>
              {kind === 'annihilation'
                ? 'Both move at this same speed, given as a fraction of c, the speed of light, one to the right and the other to the left. "At rest" means they are not moving.'
                : "Both beams have this same energy, in rest energies of the particle that might be made. One moves to the right and the other to the left."}
            </p>
            <div>
              {settingPresets.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSettings((s) => ({ ...s, [kind]: value }))
                    returnToIdle()
                  }}
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
          <p style={HINT}>
            The passing observer moves along the same line. A plus sign means they move to the right, and a minus sign to the left.
          </p>
          <div>
            {PASSING_SPEED_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPassingSpeed(value)
                  returnToIdle()
                }}
                className={`toggle-button${passingSpeed === value ? ' is-selected' : ''}`}
                style={BUTTON}
              >
                {passingLabel(value)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <label style={SECTION_LABEL}>Make a prediction</label>
        <p style={{ ...HINT, marginBottom: '0.75rem' }}>
          {PROCESS_SENTENCE[kind]} Energy and momentum are conserved. Add up the masses of the separate pieces <strong>before</strong>,
          and the masses of the pieces <strong>after</strong>. How do the two totals compare?
        </p>
        <div>
          {PREDICTION_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => {
                setPrediction(choice.value)
                returnToIdle()
              }}
              className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
              style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
          {prediction !== null
            ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.slice(0, 3)}. This is not graded.`
            : 'Choose an option to continue'}
        </p>
      </div>

      <button
        type="button"
        className="action-button"
        onClick={() => {
          setProgress(0)
          setStatus('running')
        }}
        disabled={prediction === null || status === 'running'}
        style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem' }}
      >
        {status === 'running' ? 'Running...' : 'Run'}
      </button>
      {prediction === null && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Choose a prediction above to run the experiment.</p>
      )}

      <div style={{ marginTop: '2rem' }}>
        <ReactionDiagram kind={kind} setting={setting} passingSpeed={passingSpeed} progress={status === 'idle' ? null : progress} />
      </div>

      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>How to read this diagram.</strong> Before you press Run, it shows the situation just before the reaction, as the lab
          sees it. Each piece is named. A <strong>circle</strong> is a piece that has mass: a particle, an antiparticle, a proton or a
          neutron (the letters inside say which), and later the helium nucleus. A <strong>yellow arrow with no circle</strong> is a
          pulse of light. It has no mass, so it has nothing to draw as a circle. An arrow shows which way a piece moves, and a longer
          arrow means a faster particle or a more energetic pulse. A piece with no arrow is at rest. Under each piece are the numbers
          the lab measures for it: its <em>energy</em>, its <em>momentum × c</em> (a minus sign means it moves to the left) and its{' '}
          <em>rest mass</em>, the mass it has when it sits still. The dashed vertical line marks where the pieces meet. The{' '}
          <strong>hollow purple circle</strong> is the passing observer, who moves along the same line. Its arrow shows which way they
          move and, by its length, how fast. For your current choice, the passing observer moves at {passingLabel(passingSpeed)}.
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>What happens when you press Run.</strong>
        </p>
        <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Picture 1, the lab.</strong> This is the view of someone at rest in the lab, drawn in blue (the light stays
            yellow). The pieces come together at the dashed line, and a yellow ring flashes when the reaction happens. Then the
            pieces after the reaction are shown, with their own names and numbers, in the same units. For the helium nucleus, the
            four pieces stay at rest and the picture is only an accounting of the energy: it does not show how they come together.
            If the two beams of light are too weak, no pair can be made, and the picture says so and shows the beams passing through
            each other.
          </li>
          <li>
            <strong>The mass ledger.</strong> Once the reaction has happened, four bars appear on one scale. Grey bars are before the
            reaction and blue bars are after. The first pair of bars adds up the rest masses of the separate pieces, where a pulse of
            light counts as zero. The second pair is the system's mass, worked out from the total energy and the total momentum of the
            pieces, as in Part 2. Under the bars is the energy released or absorbed, which is the sum of the rest masses before minus
            the sum after.
          </li>
          <li>
            <strong>Picture 2, the passing observer.</strong> Then the same reaction is shown as the passing observer sees it, in
            purple. The pieces move at different speeds than in the lab, and the energies and momenta are different, because this
            observer moves. The scale is the same as in Picture 1 (the same number of pixels for each 1c of speed), so the two pictures
            can be compared. Each number is what that observer measures.
          </li>
          <li>
            The animation takes about 12 seconds. It only sets how fast you watch, and it does not change what the experiment finds.
            At the end, everything stays on the screen.
          </li>
        </ol>
      </div>
    </div>
  )
}
