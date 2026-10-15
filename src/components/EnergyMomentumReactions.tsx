import { useState } from 'react'
import type { CSSProperties } from 'react'
import { runReactionExperiment } from '../physics/energyMomentum'
import type { ReactionKind, ReactionPiece } from '../physics/energyMomentum'

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
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

const VIEW_WIDTH = 520
const VIEW_HEIGHT = 340
const MEET_X = 260
const LINE_Y = 150
const PIECE_RADIUS = 16
// Pixels of travel to the meeting point for each 1c of speed, the same as in Part 2.
const PIXELS_PER_SPEED = 200

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

// Where each piece sits before the reaction, and where its labels go. Pieces that start close together get their labels moved
// apart, so the numbers do not run into each other.
function layoutPieces(kind: ReactionKind, setting: number, count: number): { xs: number[]; labelXs: number[] } {
  if (kind === 'helium-binding') {
    const xs = [MEET_X - 165, MEET_X - 55, MEET_X + 55, MEET_X + 165].slice(0, count)
    return { xs, labelXs: xs }
  }
  // The pieces start apart by their speed's worth of travel (annihilation), or at a fixed distance (the light beams); at rest
  // they are drawn just touching, so that both can be seen.
  const offset = kind === 'annihilation' ? Math.max(PIECE_RADIUS * 2 + 8, setting * PIXELS_PER_SPEED) : 150
  const xs = [MEET_X - offset, MEET_X + offset]
  const labelXs = offset < 70 ? [MEET_X - 70, MEET_X + 70] : xs
  return { xs, labelXs }
}

function pieceNumbers(piece: ReactionPiece): string[] {
  return [
    `energy ${piece.reading.energy.toFixed(2)}`,
    `momentum × c ${signed(piece.reading.momentumTimesC)}`,
    piece.restMass === 0 ? 'rest mass 0 (no mass)' : `rest mass ${piece.restMass.toFixed(2)}`,
  ]
}

function ReactionSetupDiagram({ kind, setting, passingSpeed }: { kind: ReactionKind; setting: number; passingSpeed: number }) {
  const result = runReactionExperiment(kind, setting, passingSpeed)
  const pieces = result.labBefore
  const inMeV = kind === 'helium-binding'
  const unit = inMeV ? ' MeV' : ''
  const { xs, labelXs } = layoutPieces(kind, setting, pieces.length)
  const subtitle =
    inMeV ? 'Energy, momentum × c and rest mass are all in MeV, a unit of energy.' : 'Energy and rest mass are in rest energies of one particle.'
  const subtitle2 = inMeV ? 'A rest mass in MeV means its mass × c², written as an energy.' : 'Momentum is shown as momentum × c.'
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Setup: the lab's view just before the reaction "${KIND_CHOICES.find((c) => c.value === kind)?.label.toLowerCase()}". ${pieces
        .map((p) => `${p.label}: energy ${p.reading.energy.toFixed(2)}${unit}, momentum times c ${p.reading.momentumTimesC.toFixed(2)}${unit}, rest mass ${p.restMass.toFixed(2)}${unit}`)
        .join('. ')}. A passing observer moves at ${passingLabel(passingSpeed)}.`}
      style={SVG_STYLE}
    >
      <defs>
        {[LAB_COLOR, LIGHT_COLOR, PASSING_COLOR].map((color) => (
          <marker key={color} id={`reaction-arrowhead-${color.slice(1)}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The lab's view, just before the reaction
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        {subtitle}
      </text>
      <text x="12" y="50" fontSize="11" fill={MUTED_COLOR}>
        {subtitle2}
      </text>

      <line x1="20" y1={LINE_Y} x2={VIEW_WIDTH - 20} y2={LINE_Y} stroke={TICK_COLOR} strokeWidth="1" strokeDasharray="2 5" />
      <line x1={MEET_X} y1={LINE_Y - 34} x2={MEET_X} y2={LINE_Y + 88} stroke={MUTED_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      <text x={MEET_X} y={LINE_Y + 100} fontSize="11" textAnchor="middle" fill={MUTED_COLOR} style={HALO}>
        {kind === 'helium-binding' ? 'where they will come together' : 'where they meet'}
      </text>

      {pieces.map((piece, i) => {
        const isLight = piece.restMass === 0
        const momentum = piece.reading.momentumTimesC
        const direction = Math.sign(momentum)
        const x = xs[i]
        const color = isLight ? LIGHT_COLOR : LAB_COLOR
        // A light pulse is drawn as an arrow only, with no circle, so that "no mass" can be seen.
        const arrowLength = isLight ? Math.min(40 + 16 * piece.reading.energy, 110) : 14 + 50 * Math.abs(piece.reading.speed)
        const arrowStart = isLight ? x : x + direction * (PIECE_RADIUS + 4)
        return (
          <g key={i}>
            {direction !== 0 && (
              <line
                x1={arrowStart}
                y1={LINE_Y}
                x2={arrowStart + direction * arrowLength}
                y2={LINE_Y}
                stroke={color}
                strokeWidth={isLight ? 3.5 : 2.5}
                markerEnd={`url(#reaction-arrowhead-${color.slice(1)})`}
              />
            )}
            {!isLight && (
              <circle cx={x} cy={LINE_Y} r={PIECE_RADIUS} fill={color} stroke="#0b1020" strokeWidth="1.5" />
            )}
            {!isLight && (
              <text x={x} y={LINE_Y + 4} fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0b1020">
                {kind === 'helium-binding' ? (piece.label === 'proton' ? 'p' : 'n') : piece.label === 'particle' ? '+' : '−'}
              </text>
            )}
            <text x={labelXs[i]} y={LINE_Y - 56} fontSize="12" fontWeight="bold" textAnchor="middle" fill={color} style={HALO}>
              {piece.label}
            </text>
            <text x={labelXs[i]} y={LINE_Y - 42} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
              {directionWords(momentum)}
            </text>
            {pieceNumbers(piece).map((line, k) => (
              <text key={k} x={labelXs[i]} y={LINE_Y + 44 + 14 * k} fontSize="10" textAnchor="middle" fill={color} style={HALO}>
                {line}
              </text>
            ))}
          </g>
        )
      })}

      {/* The passing observer: a hollow circle (as in Part 1 and Part 2) with an arrow for their way and speed. */}
      <circle cx="60" cy="290" r="8" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
      <line
        x1={60 + Math.sign(passingSpeed) * 14}
        y1="290"
        x2={60 + Math.sign(passingSpeed) * (14 + 20 + 80 * Math.abs(passingSpeed))}
        y2="290"
        stroke={PASSING_COLOR}
        strokeWidth="2.5"
        markerEnd={`url(#reaction-arrowhead-${PASSING_COLOR.slice(1)})`}
      />
      <text x="140" y="288" fontSize="12" fontWeight="bold" fill={PASSING_COLOR}>
        The passing observer
      </text>
      <text x="140" y="304" fontSize="11" fill={PASSING_COLOR}>
        moves at {passingLabel(passingSpeed)} ({passingSpeed > 0 ? 'to the right' : 'to the left'}), along the same line
      </text>
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
  const setting = settings[kind]
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
              onClick={() => setKind(choice.value)}
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
          <p style={HINT}>
            The passing observer moves along the same line. A plus sign means they move to the right, and a minus sign to the left.
          </p>
          <div>
            {PASSING_SPEED_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
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
              onClick={() => setPrediction(choice.value)}
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

      <div style={{ marginTop: '2rem' }}>
        <ReactionSetupDiagram kind={kind} setting={setting} passingSpeed={passingSpeed} />
      </div>

      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        <p style={{ margin: 0 }}>
          <strong>How to read this diagram.</strong> It shows the situation just before the reaction, as the lab sees it. Each
          piece is named. A <strong>circle</strong> is a piece that has mass: a particle, an antiparticle, a proton or a neutron
          (the letters inside say which). A <strong>yellow arrow with no circle</strong> is a pulse of light. It has no mass, so
          it has nothing to draw as a circle. An arrow shows which way a piece moves, and a longer arrow means a faster particle
          or a more energetic pulse. A piece with no arrow is at rest. Under each piece are the numbers the lab measures for it:
          its <em>energy</em>, its <em>momentum × c</em> (a minus sign means it moves to the left) and its <em>rest mass</em>,
          the mass it has when it sits still. The dashed vertical line marks where the pieces meet. The{' '}
          <strong>hollow purple circle</strong> is the passing observer, who moves along the same line. Its arrow shows which way
          they move and, by its length, how fast. For your current choice, the passing observer moves at {passingLabel(passingSpeed)}.
        </p>
      </div>
    </div>
  )
}
