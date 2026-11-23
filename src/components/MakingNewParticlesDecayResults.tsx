import type { CSSProperties, ReactNode } from 'react'
import { decayCheckUpRows, runDecay } from '../physics/makingNewParticles'
import { totalsOf } from '../physics/energyMomentum'

// Spacetime Geometry 6, Section B, Part 3: the results of Part 1's run, with the reading guide of CLAUDE.md §14 ("Reading the Results"): the guesses beside the results (guess only,
// never marked), a check-up, and a "What this table tells us" note under each table. Audit update of 2026-11-23 (wording in docs/audit/spacetime-geometry/06-draft-wording-section-b.md,
// sections 5a to 5c, approved by the owner on 2026-11-23; the notes are drafted from the approved outline). Every number comes from `runDecay` and `decayCheckUpRows`; nothing here
// depends on a guess except the guess block and its tags.

const CELL: CSSProperties = { padding: '0.3rem 1rem 0.3rem 0' }
const NOTE: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)' }

function four(value: number): string {
  const text = value.toFixed(4).replace('-', '−')
  return /^−0\.0+$/.test(text) ? text.slice(1) : text
}

function two(value: number): string {
  const text = value.toFixed(2)
  return /^-0\.0+$/.test(text) ? text.slice(1) : text.replace('-', '−')
}

function passingLabel(speed: number): string {
  return `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

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

function Notes({ children }: { children: ReactNode }) {
  return (
    <div style={{ ...NOTE, margin: '0 0 1.25rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>What this table tells us</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{children}</ul>
    </div>
  )
}

interface DecayResultsProps {
  pieceMass: number
  passingSpeed: number
  // The learner's two guesses, as the words on their buttons (the page shows them again here; it never marks them).
  guess1Label: string
  guess2Label: string
}

export function DecayResults({ pieceMass, passingSpeed, guess1Label, guess2Label }: DecayResultsProps) {
  const result = runDecay(pieceMass, passingSpeed)
  const r = pieceMass
  const checkUp = decayCheckUpRows(result)
  const sameCount = checkUp.filter((row) => row.reading === 'the same').length
  const labBefore = totalsOf([result.labParent])
  const labAfter = totalsOf(result.labPieces.map((p) => p.reading))
  const passingBefore = totalsOf([result.passingParent])
  const passingAfter = totalsOf(result.passingPieces.map((p) => p.reading))
  const [lab1] = result.labPieces
  const [pass1, pass2] = result.passingPieces
  const passing = passingLabel(passingSpeed)
  const pieceRows = (pieces: typeof result.labPieces) =>
    pieces.map((p, i) => [
      r === 0 ? `Light pulse ${i + 1}` : `Piece ${i + 1}`,
      r === 0 ? '1c (light)' : `${four(Math.abs(p.reading.speed))}c`,
      four(p.reading.energy),
      four(p.reading.momentumTimesC),
      four(p.restMass),
    ])
  const totalRow = (name: string, before: number, after: number) => [name, four(before), four(after), four(Math.abs(after - before) < 5e-10 ? 0 : after - before)]

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ ...NOTE, marginTop: 0 }}>
        These numbers are for Part 1's run: each piece has {r === 0 ? 'no mass (pulses of light)' : `${r} times the parent's mass`}, and the passing observer moved at {passing}. Masses and energies
        are in the parent's rest energies. They never change with your predictions or with the settings you try in Part 2.
      </p>

      <div style={{ ...NOTE, padding: '0.75rem 1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', marginBottom: '1.25rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Your predictions, beside the results</p>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>Your first guess:</strong> {guess1Label} <strong>The question it was about:</strong> how do the pieces' rest masses added up compare with the parent's mass?{' '}
          <strong>Where its numbers appear:</strong> the row "The pieces' rest masses added up (2r)" in the table "The masses", which is tagged "your guess", and the grey bar of the mass ledger. It shows
          only what you chose.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Your second guess:</strong> {guess2Label} <strong>The question it was about:</strong> is the system's mass of the pieces that the passing observer finds the same as the lab's?{' '}
          <strong>Where its numbers appear:</strong> the row "As the passing observer finds it" in the table "The system's mass", which is tagged "your guess", and the purple bar of the mass ledger.
          It shows only what you chose.
        </p>
      </div>

      <h4 style={{ margin: '0 0 0.25rem' }}>The check-up</h4>
      <p style={{ ...NOTE, margin: '0 0 0.5rem' }}>
        Each row sets what this physics says to expect beside what was found in your run, with a plain reading. No outside measurement is used here.
      </p>
      <ResultsTable
        head={['Check', 'What we would expect', 'What was found', 'Reading']}
        rows={checkUp.map((row) => [
          row.check,
          row.expected === null ? 'the numbers to be equal' : four(row.expected),
          row.found.map(four).join(' and '),
          row.reading,
        ])}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> {checkUp.length} checks of this page against its own physics, each with a plain reading: "the same" when the number found is the number expected, or when two
          numbers that should be equal are equal.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> in your run {sameCount} of the {checkUp.length} rows read "the same". For example, the lab finds a total energy of{' '}
          {four(labBefore.energy)} before and {four(labAfter.energy)} after, and the passing observer finds {four(passingBefore.energy)} before and {four(passingAfter.energy)} after: different
          from the lab's, but unchanged by the decay. And each piece's energy of motion, {four(lab1.reading.energy - lab1.restMass)}, added for the two pieces is {four(2 * (lab1.reading.energy - lab1.restMass))}, which is the mass given up, {four(result.massGivenUp)}.
        </li>
        <li>
          <strong>Why it matters:</strong> it shows that the numbers on this page agree with each other and with the formulas, so you can trust the comparisons below. It is a check of the page's
          arithmetic, not a measurement of anything real. For the neutral pion and uranium-238 there is no row: those are real measurements, and the tutor quotes them.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>The masses</h4>
      <ResultsTable
        head={['', 'Mass']}
        rows={[
          ["The parent's mass", four(1)],
          ["The pieces' rest masses added up (2r)", four(result.sumOfRestMasses)],
          ['The mass given up (parent − pieces)', four(result.massGivenUp)],
        ]}
        tagRow={1}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> the parent's mass (our unit, 1), the rest masses of the two pieces added up, and the mass given up: the parent's mass minus the pieces' rest masses.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the parent's mass is {four(1)}, the pieces' rest masses add up to 2 × {r} = {four(result.sumOfRestMasses)}, and the mass given up is 1 −{' '}
          {two(result.sumOfRestMasses)} = {four(result.massGivenUp)}.
        </li>
        <li>
          <strong>Why it matters:</strong> this row is the number your first guess was about. The page does not say which answer is right: the tutor does.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>The pieces, as the lab measures them</h4>
      <ResultsTable head={['', 'Speed', 'Energy', 'Momentum × c', 'Rest mass']} rows={pieceRows(result.labPieces)} />
      <h4 style={{ margin: '0 0 0.25rem' }}>The pieces, as the passing observer ({passing}) measures them</h4>
      <ResultsTable head={['', 'Speed', 'Energy', 'Momentum × c', 'Rest mass']} rows={pieceRows(result.passingPieces)} />
      <Notes>
        <li>
          <strong>What it is:</strong> each piece's speed, energy, momentum × c and rest mass, first as the lab measures it and then as the passing observer measures it. A minus sign on a momentum means
          the piece moves to the left.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the lab finds an energy of {four(lab1.reading.energy)} for each piece and momenta of {four(lab1.reading.momentumTimesC)} and{' '}
          {four(-lab1.reading.momentumTimesC)}, so each piece moves at {four(Math.abs(lab1.reading.speed))}c. The passing observer finds energies of {four(pass1.reading.energy)} and{' '}
          {four(pass2.reading.energy)} and momenta of {four(pass1.reading.momentumTimesC)} and {four(pass2.reading.momentumTimesC)}. But the rest mass of each piece is {four(lab1.restMass)} for both.
        </li>
        <li>
          <strong>Why it matters:</strong> two observers can disagree about a piece's energy, momentum and speed, and still agree about its rest mass, which is a property of the piece itself.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>The totals, before the decay (the parent) and after it (the two pieces together)</h4>
      <ResultsTable
        head={['', 'Before', 'After', 'Difference']}
        rows={[
          totalRow('Lab: total energy', labBefore.energy, labAfter.energy),
          totalRow('Lab: total momentum × c', labBefore.momentumTimesC, labAfter.momentumTimesC),
          totalRow('Passing observer: total energy', passingBefore.energy, passingAfter.energy),
          totalRow('Passing observer: total momentum × c', passingBefore.momentumTimesC, passingAfter.momentumTimesC),
        ]}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> the total energy and the total momentum × c before the decay (the parent alone) and after it (both pieces added together), for each observer, and the
          difference between them.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> every difference is {four(0)}. The lab's total energy is {four(labBefore.energy)} before and after and its total momentum is{' '}
          {four(labBefore.momentumTimesC)} before and after. The passing observer sees the parent moving, so for them the totals are {four(passingBefore.energy)} and{' '}
          {four(passingBefore.momentumTimesC)}, and they are the same after the decay.
        </li>
        <li>
          <strong>Why it matters:</strong> energy and momentum were conserved for both observers, even though they disagree about the numbers. A bank that moves your money from one account into
          two still shows the same total.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>The system's mass, worked out from the total energy and total momentum</h4>
      <ResultsTable
        head={['', 'Before', 'After']}
        rows={[
          ['As the lab finds it', four(Math.sqrt(result.labParent.invariant)), four(result.systemMassLab)],
          ['As the passing observer finds it', four(Math.sqrt(result.passingParent.invariant)), four(result.systemMassPassing)],
        ]}
        tagRow={1}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> the system's mass M = √(E_total² − (P_total c)²), worked out from the totals in the table above, for the parent before the decay and for the two pieces after it.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the lab finds {four(result.systemMassLab)} and the passing observer finds {four(result.systemMassPassing)}, before and after. For the
          passing observer: √({four(passingAfter.energy)}² − {four(Math.abs(passingAfter.momentumTimesC))}²) = {four(result.systemMassPassing)}.
        </li>
        <li>
          <strong>Why it matters:</strong> the system's mass is the number every observer agrees on, which is why it is the number to compare. The row for the passing observer is the number your
          second guess was about. The tutor explains the mechanism.
        </li>
      </Notes>
    </div>
  )
}
