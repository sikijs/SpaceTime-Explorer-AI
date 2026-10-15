import { useState } from 'react'
import type { CSSProperties } from 'react'
import { runDecay } from '../physics/makingNewParticles'

// Step 4 of docs/experiments/spacetime-geometry/06-making-new-particles.md for Part 2 (decay): the section, the introduction (stage B),
// the two controls (the pieces' mass, r, and the passing observer's speed), a labeled diagram of the setup (the parent at rest, and
// the passing observer), and its "How to read this diagram" caption (CLAUDE.md §14). Only the setup is shown. There is deliberately no
// Run, prediction, results or tutor yet: those are later steps, and the caption will be extended when the run is built. Every number
// comes from `runDecay` (CLAUDE.md §9). Wording here is draft for the owner's review (CLAUDE.md §28.1).

// The terms and formulas that stage B's introduction defines, added to the "Words and formulas" panel once Part 2 appears (spec,
// Introduction, rule 5). They repeat the introduction's wording, with no new claims.
export const PART_TWO_REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Decay', meaning: 'a particle turning into lighter particles on its own, with nothing hitting it.' },
  { term: 'Parent, pieces', meaning: 'the parent is the particle before it decays. The pieces are what it turns into.' },
  { term: 'Mass given up', meaning: 'the parent’s mass minus the sum of the pieces’ rest masses.' },
  {
    term: 'Pieces of a decay at rest: E = ½ each, pc = √(¼ − r²)',
    meaning:
      'the parent is at rest, so the total momentum is zero, and the two equal pieces move apart with equal energies, each half the parent’s energy. Here r is each piece’s mass as a fraction of the parent’s.',
  },
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
const VIEW_HEIGHT = 330
const CENTER_X = 260
const LINE_Y = 130
const PARENT_RADIUS = 22

function formatNumber(value: number, digits = 2): string {
  const text = value.toFixed(digits)
  return /^-0\.0+$/.test(text) ? text.slice(1) : text.replace('-', '−')
}

function passingLabel(speed: number): string {
  return `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

function DecayDiagram({ passingSpeed, pieceMass }: { passingSpeed: number; pieceMass: number }) {
  const result = runDecay(pieceMass, passingSpeed)
  const parent = result.labParent
  const arrowId = `decay-arrowhead-${PASSING_COLOR.slice(1)}`
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Setup: in the lab, a parent particle sits at rest, with a mass of 1, an energy of ${parent.energy.toFixed(2)} and a momentum times c of ${parent.momentumTimesC.toFixed(2)}. A passing observer moves along the same line at ${passingLabel(passingSpeed)}.`}
      style={SVG_STYLE}
    >
      <defs>
        <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={PASSING_COLOR} />
        </marker>
      </defs>
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The lab's view: the parent particle, at rest
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        Energy is in the parent's rest energies. Momentum is shown as momentum × c.
      </text>

      <line x1="20" y1={LINE_Y} x2={VIEW_WIDTH - 20} y2={LINE_Y} stroke={TICK_COLOR} strokeWidth="1" strokeDasharray="2 5" />
      <circle cx={CENTER_X} cy={LINE_Y} r={PARENT_RADIUS} fill={LAB_COLOR} stroke="#0b1020" strokeWidth="1.5" />
      <text x={CENTER_X} y={LINE_Y - 36} fontSize="12" fontWeight="bold" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        The parent
      </text>
      <text x={CENTER_X} y={LINE_Y - 22} fontSize="11" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        at rest in the lab
      </text>
      <text x={CENTER_X} y={LINE_Y + 44} fontSize="11" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        mass 1
      </text>
      <text x={CENTER_X} y={LINE_Y + 58} fontSize="11" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        energy {formatNumber(parent.energy)}
      </text>
      <text x={CENTER_X} y={LINE_Y + 72} fontSize="11" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        momentum × c {formatNumber(parent.momentumTimesC)}
      </text>

      <circle cx={CENTER_X} cy="250" r="8" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
      <line
        x1={CENTER_X + Math.sign(passingSpeed) * 14}
        y1="250"
        x2={CENTER_X + Math.sign(passingSpeed) * (14 + 20 + 80 * Math.abs(passingSpeed))}
        y2="250"
        stroke={PASSING_COLOR}
        strokeWidth="2.5"
        markerEnd={`url(#${arrowId})`}
      />
      <text x={CENTER_X} y="284" fontSize="12" fontWeight="bold" textAnchor="middle" fill={PASSING_COLOR}>
        The passing observer
      </text>
      <text x={CENTER_X} y="300" fontSize="11" textAnchor="middle" fill={PASSING_COLOR}>
        moves at {passingLabel(passingSpeed)} ({passingSpeed > 0 ? 'to the right' : 'to the left'}), along the same line
      </text>
    </svg>
  )
}

const LINK_BUTTON: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  color: '#0066cc',
  textDecoration: 'underline',
  cursor: 'pointer',
}

// Part 2's section. `skippedPartOne` is true when the learner reached Part 2 with the skip link instead of through Part 1's tutor; the
// introduction then adds a reminder. `onBackToPartOne` scrolls back up to Part 1.
export function MakingNewParticlesDecay({
  skippedPartOne = false,
  onBackToPartOne,
}: {
  skippedPartOne?: boolean
  onBackToPartOne?: () => void
}) {
  const [pieceMass, setPieceMass] = useState(0.25)
  const [passingSpeed, setPassingSpeed] = useState(0.3)

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Part 2 — Decay</h3>
      {onBackToPartOne && (
        <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1rem' }}>
          <button type="button" onClick={onBackToPartOne} style={LINK_BUTTON}>
            ← Back to Part 1 - Making a new particle
          </button>
        </p>
      )}

      {/* Introduction, stage B (needed by Part 2): draft wording for the owner's review (CLAUDE.md §28.1), from the specification's
          "Introduction: two stages". It does not say how the pieces' masses compare with the parent's (that is Part 2's prediction, §12). */}
      <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {skippedPartOne && (
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>If you skipped Part 1.</strong> This part uses the system's mass, M = √(E_total² − (P_total c)²), worked out from the
            total energy and total momentum of all the particles taken together, and the idea of a threshold: a reaction can happen only if
            the system's mass is at least the total rest mass of everything that comes out. For example, a system with a total energy of 5
            and a total momentum × c of 3 has M = √(25 − 9) = 4. Open the "Words and formulas" panel at the top of Part 1 for more.
          </p>
        )}
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>The question.</strong> In Part 1, we made a new particle by smashing particles together, and the energy of motion of the
          collision became the mass of the new particle. Now we run the idea backward. Can a particle turn into lighter particles on its
          own, with nothing hitting it? If it can, what happens to the mass that goes missing, and what must the lighter particles be like?
        </p>

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Some new words.</strong> Here is each one in plain language.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Decay:</strong> a particle turning into lighter particles on its own, with nothing hitting it. This experiment shows
              what the lighter particles must be like, so we give no everyday example here that would give that away.
            </li>
            <li>
              <strong>Parent:</strong> the particle before it decays. <strong>Pieces:</strong> what it turns into. Here a parent always
              turns into two equal pieces. A piece can also be a pulse of light, which has no mass.
            </li>
            <li>
              <strong>Mass given up:</strong> the parent's mass minus the sum of the pieces' rest masses. (A piece's rest mass is its mass
              when it sits still, as in Part 1. A pulse of light counts as zero.)
            </li>
          </ul>
        </div>

        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>The units.</strong> In this part, the parent's rest energy is 1, and each piece's mass, <em>r</em>, is a fraction of the
          parent's mass. For example, r = 0.25 means each piece has a quarter of the parent's mass. The case r = 0 means two pulses of
          light.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>The formula we need: the pieces' energy and momentum.</strong> The parent is at rest, so the total momentum is zero. The
          two equal pieces move apart in opposite directions with equal energies, so each has half the parent's energy, E = ½. A piece's
          momentum × c then follows from the combination in Experiment 5: for one piece, E² − (pc)² is its mass squared, r², so pc = √(¼ −
          r²). For example, take r = 0.3, which is not one of the choices. Each piece has E = ½ and pc = √(0.25 − 0.09) = 0.4, so its speed
          is pc ÷ E = 0.4 ÷ 0.5 = 0.8c. <em>What it does not mean:</em> it does not say that a decay will happen, only what the pieces would
          be like if it did.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>What happens.</strong> A parent particle sits at rest in the lab, and then it decays into two equal pieces. You choose how
          heavy each piece is, and which way and how fast a passing observer moves. When you press Run, the picture plays in stages:
        </p>
        <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The lab's view.</strong> The parent sits still. Then it splits, and the two pieces move apart along the line, one to the
            right and one to the left. If you chose r = 0, the pieces are pulses of light, drawn as arrows instead of circles. Each piece is
            labelled with its energy, its momentum × c and its rest mass.
          </li>
          <li>
            <strong>The mass ledger.</strong> Bars then compare the masses. One bar is the parent's mass, and another is the sum of the
            pieces' rest masses. Two more bars show the system's mass of the pieces, as it was before the split and after it. The mass given
            up is written under them.
          </li>
          <li>
            <strong>The passing observer's view.</strong> The same decay is then shown as the passing observer measures it. For them, the
            lab and the parent are moving, so the energies and momenta they find are different from the lab's.
          </li>
          <li>
            <strong>The results.</strong> A table lists the total energy and total momentum × c before and after the decay, for each
            observer. After that come a few questions for you to think about.
          </li>
        </ol>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          Two things to keep in mind. A decay is shown only if energy and momentum allow it, and if they do not, the picture says so
          instead. And the experiment shows only what the pieces would be like. It does not show how long the parent waits before it decays,
          or whether it will decay at all.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>Your job.</strong> Choose the pieces' mass and the passing observer's speed. Then predict how the sum of the pieces'
          masses compares with the parent's mass, and run it. You are not graded.
        </p>
        <p style={{ margin: 0 }}>
          <strong>What we assume.</strong> Everything moves along one line. The parent decays into exactly two equal pieces. Only energy and
          momentum are tracked, and whether and when a decay happens is not modeled.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The pieces' mass, r</label>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
          The mass of each piece, as a fraction of the parent's mass. Zero means pieces of light, which have no mass.
        </p>
        <div style={{ marginBottom: '1rem' }}>
          {MASS_PRESETS.map((choice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => setPieceMass(choice.value)}
              className={`toggle-button${pieceMass === choice.value ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {choice.label}
            </button>
          ))}
        </div>

        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The passing observer's speed</label>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
          The passing observer moves along the same line. A plus sign means they move to the right, and a minus sign to the left.
        </p>
        <div>
          {PASSING_SPEED_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPassingSpeed(value)}
              className={`toggle-button${passingSpeed === value ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {passingLabel(value)}
            </button>
          ))}
        </div>
      </div>

      <DecayDiagram passingSpeed={passingSpeed} pieceMass={pieceMass} />

      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>How to read this diagram.</strong> The diagram shows the starting situation of the decay, as the lab sees it. Nothing has
          happened yet. Your choices are r = {pieceMass === 0 ? '0 (pieces of light)' : pieceMass} for the pieces' mass and{' '}
          {passingLabel(passingSpeed)} for the passing observer.
        </p>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>What is drawn</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The dashed horizontal line</strong> is the one line along which everything in this experiment moves.
          </li>
          <li>
            <strong>The sky-blue circle</strong> is the parent particle, the one that will decay. It has no arrow because it is not moving:
            it is at rest in the lab.
          </li>
          <li>
            <strong>The numbers under the parent</strong> are what the lab measures for it. Its mass is 1, because the parent's rest energy
            is our unit. Its energy is 1, because it is at rest, so it has only its rest energy. Its momentum × c is 0, because it is not
            moving.
          </li>
          <li>
            <strong>The hollow purple circle</strong> is the passing observer. It is hollow because it is not a particle in the experiment,
            only someone who watches and measures. The purple arrow shows which way they move, and a longer arrow means a faster observer.
          </li>
        </ul>
        <p style={{ margin: 0 }}>
          Colours: sky blue is what the lab measures. Purple is the passing observer. The pieces that the parent decays into are not drawn
          yet.
        </p>
      </div>
    </div>
  )
}
