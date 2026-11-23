import type { CSSProperties, ReactNode } from 'react'
import { makingCheckUpRows, runMakingExperiment } from '../physics/makingNewParticles'
import type { SetupResult } from '../physics/makingNewParticles'
import { systemMassOf, totalsOf } from '../physics/energyMomentum'

// Spacetime Geometry 6, Section A, Part 3: the results of Part 1's run, with the reading guide of CLAUDE.md §14 ("Reading the Results"): the guesses beside the results
// (guess only, never marked), a check-up, and a "What this table tells us" note under each table. Audit update of 2026-11-22 (wording in
// docs/audit/spacetime-geometry/06-draft-wording.md, sections 5a to 5c; the notes for groups 1 and 2 are drafted from the approved outline, for the owner's review, §28.1).
// Every number comes from `runMakingExperiment` and `makingCheckUpRows` in the physics module; nothing here depends on a guess except the guess block and its tags.

const CELL: CSSProperties = { padding: '0.3rem 1rem 0.3rem 0' }
const NOTE: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)' }

// Four decimal places, with a minus sign for a negative number and no "-0.0000".
function four(value: number): string {
  const text = value.toFixed(4).replace('-', '−')
  return /^−0\.0+$/.test(text) ? text.slice(1) : text
}

function two(value: number): string {
  const text = value.toFixed(2)
  return /^-0\.0+$/.test(text) ? text.slice(1) : text.replace('-', '−')
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

interface MakingResultsProps {
  energyOfMotion: number
  newMass: number
  // The learner's two guesses, as the words on their buttons (the page shows them again here; it never marks them).
  guess1Label: string
  guess2Label: string
}

function verdict(canMake: boolean, newMass: number, threshold: number, energy: number): string {
  return canMake
    ? `A new particle of mass ${newMass} can be made. It needs K ≥ ${two(threshold)}, and K = ${energy} is supplied.`
    : `A new particle of mass ${newMass} cannot be made. It needs K ≥ ${two(threshold)}, and only K = ${energy} is supplied.`
}

export function MakingResults({ energyOfMotion, newMass, guess1Label, guess2Label }: MakingResultsProps) {
  const result = runMakingExperiment(energyOfMotion, newMass)
  const A: SetupResult = result.stationaryTarget
  const B: SetupResult = result.headOn
  const K = energyOfMotion
  const checkUp = makingCheckUpRows(result)
  const sameCount = checkUp.filter((row) => row.reading === 'the same').length
  const ownA = totalsOf(A.ownPieces)
  const ownB = totalsOf(B.ownPieces)
  const ownMassA = systemMassOf(A.ownPieces)
  const ownMassB = systemMassOf(B.ownPieces)

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ ...NOTE, marginTop: 0 }}>
        These numbers are for Part 1's run: the energy of motion supplied was K = {K}, and the new particle's mass was X = {newMass}. Energies are in rest energies of one colliding particle.
        They never change with your predictions or with the settings you try in Part 2.
      </p>

      <div style={{ ...NOTE, padding: '0.75rem 1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', marginBottom: '1.25rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Your predictions, beside the results</p>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>Your first guess:</strong> {guess1Label} <strong>The question it was about:</strong> which setup leaves more usable energy? <strong>Where its numbers appear:</strong> the row
          "Usable energy, M − 2" in the table "Usable and locked-in energy, and what it takes to make the new particle", which is tagged "your guess", and the green parts of the first set of bars. It shows only what you chose.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Your second guess:</strong> {guess2Label} <strong>The question it was about:</strong> is the system's mass that the system's own observer finds the same as the lab found for
          Setup A? <strong>Where its numbers appear:</strong> the row "The system's mass, M, found by the system's own observer" in the table "What the system's own observer finds", which is tagged "your guess", and the
          outlined bar in the lower panel of Picture 2. It shows only what you chose.
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
          <strong>What it is:</strong> six checks of this page against its own physics, each with a plain reading: "the same" when the number found is the number expected.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> in your run {sameCount} of the {checkUp.length} rows read "the same". For example, in Setup A the usable energy {four(A.usable)} and the
          locked-in energy {four(A.lockedIn)} add up to {four(A.usable + A.lockedIn)}, which is K = {K}, and the system's mass {four(A.systemMass)} is √(4 + 2 × {K}) = {four(Math.sqrt(4 + 2 * K))}.
        </li>
        <li>
          <strong>Why it matters:</strong> it shows that the numbers on this page agree with each other and with the formulas, so you can trust the comparisons below. It is a check of the
          page's arithmetic, not a measurement of anything real. These rows say nothing about which setup leaves more usable energy: that is for you to read from the tables and the tutor to explain.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>What the lab finds</h4>
      <ResultsTable
        head={['', 'Setup A (stationary target)', 'Setup B (head-on beams)']}
        rows={[
          ['Total energy in the lab', two(A.totalEnergy), two(B.totalEnergy)],
          ['Total momentum × c in the lab', two(A.totalMomentumTimesC), two(B.totalMomentumTimesC)],
          ["The system's mass, M, found by the lab", two(A.systemMass), two(B.systemMass)],
        ]}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> the totals the lab measures for the two colliding particles taken together, and the system's mass M worked out from them as M = √(E_total² − (P_total c)²).
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> in both setups the total energy is {two(A.totalEnergy)}: 2 rest energies for the two particles plus K = {K} of energy of motion. The
          total momentum × c is {two(A.totalMomentumTimesC)} in Setup A, because the beam particle brings momentum with it, and {two(B.totalMomentumTimesC)} in Setup B, because the two momenta point
          opposite ways and cancel. So M = √({two(A.totalEnergy)}² − {two(A.totalMomentumTimesC)}²) = {two(A.systemMass)} in Setup A, and √({two(B.totalEnergy)}² − 0²) = {two(B.systemMass)} in Setup
          B.
        </li>
        <li>
          <strong>Why it matters:</strong> M is the number that decides whether a new particle can be made. Two equal skaters who meet head-on and stop have a total momentum of zero, as in Setup B. A
          skater who skates into one standing still brings momentum that has to go somewhere, as in Setup A. The same total energy with a different total momentum gives a different M.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>What the system's own observer finds</h4>
      <ResultsTable
        head={['', 'Setup A (stationary target)', 'Setup B (head-on beams)']}
        rows={[
          ["Total energy, as the system's own observer finds it", two(ownA.energy), two(ownB.energy)],
          ["Total momentum × c, as the system's own observer finds it", two(ownA.momentumTimesC), two(ownB.momentumTimesC)],
          ["The system's mass, M, found by the system's own observer", two(ownMassA), two(ownMassB)],
          ["Speed of the system's own observer", `${two(Math.abs(A.ownObserverSpeed))}c`, `${two(Math.abs(B.ownObserverSpeed))}c`],
        ]}
        tagRow={2}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> the same two particles, measured by the observer who travels along with the system as a whole, so that for them the total momentum is zero. For Setup B
          that observer is the lab itself.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> in Setup A this observer moves at {two(Math.abs(A.ownObserverSpeed))}c and finds a total energy of {two(ownA.energy)} and a total
          momentum × c of {two(ownA.momentumTimesC)}. Those are different from the lab's {two(A.totalEnergy)} and {two(A.totalMomentumTimesC)}. But the system's mass they work out is{' '}
          {two(ownMassA)}, the same number as the lab's {two(A.systemMass)}. In Setup B the observer is at rest in the lab and every number is the lab's.
        </li>
        <li>
          <strong>Why it matters:</strong> two observers can disagree about the energy and the momentum and still agree about M, as in Experiment 5. That agreement is what makes M a number you can
          trust when you ask whether a new particle can be made. It is also the number of your second guess.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>Usable and locked-in energy, and what it takes to make the new particle</h4>
      <ResultsTable
        head={['', 'Setup A (stationary target)', 'Setup B (head-on beams)']}
        rows={[
          ['Usable energy, M − 2', two(A.usable), two(B.usable)],
          ['Locked-in energy, K − usable', two(A.lockedIn), two(B.lockedIn)],
          ['Share of K locked in', `${A.lockedShare * 100 < 0.05 ? '0.0' : (A.lockedShare * 100).toFixed(1)}%`, `${B.lockedShare * 100 < 0.05 ? '0.0' : (B.lockedShare * 100).toFixed(1)}%`],
          [`Least K to make X = ${newMass}`, two(result.stationaryTargetThreshold), two(result.headOnThreshold)],
        ]}
        tagRow={0}
      />
      <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
        <strong>Setup A:</strong> {verdict(result.stationaryTargetCanMake, newMass, result.stationaryTargetThreshold, K)}
      </p>
      <p style={{ fontSize: '0.875rem', margin: '0 0 0.75rem' }}>
        <strong>Setup B:</strong> {verdict(result.headOnCanMake, newMass, result.headOnThreshold, K)}
      </p>
      <Notes>
        <li>
          <strong>What it is:</strong> the part of K that can become mass (usable energy, M − 2), the part kept as motion of the whole system (locked-in energy, K minus the usable part), and the
          least K that would make a new particle of your chosen mass X.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> in Setup A, K = {K} splits into {two(A.usable)} usable and {two(A.lockedIn)} locked in ({(A.lockedShare * 100).toFixed(1)} percent of K),
          and the least K for X = {newMass} is {two(result.stationaryTargetThreshold)}, so at K = {K} the new particle {result.stationaryTargetCanMake ? 'can' : 'cannot'} be made. In Setup B,{' '}
          {two(B.usable)} of the {K} is usable and {two(B.lockedIn)} is locked in, and the least K is {two(result.headOnThreshold)}, so it {result.headOnCanMake ? 'can' : 'cannot'} be made.
        </li>
        <li>
          <strong>Why it matters:</strong> two ways of supplying the same energy can leave very different amounts for making mass, and the threshold says whether the new particle appears at all. This
          row is the number your first guess was about. The tutor explains where the locked-in energy comes from.
        </li>
      </Notes>
    </div>
  )
}
