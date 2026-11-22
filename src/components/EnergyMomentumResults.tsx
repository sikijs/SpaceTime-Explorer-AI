import type { ReactNode } from 'react'
import { SECTION_A_PASSING_SPEED, SECTION_A_SPEED, checkUpRows, guessMarkerFor, runInvariantExperiment } from '../physics/energyMomentum'
import type { BarName, InvariantGuess } from '../physics/energyMomentum'
import { RulesAfterRun } from './EnergyMomentumIntro'

// Spacetime Geometry 5, Section A, Part 3 (the results) of the audit update of 2026-11-21. Wording: docs/audit/spacetime-geometry/05-draft-wording.md,
// section 6 (approved by the owner on 2026-11-21, "approved all defaults"). Part 3 always shows Part 1's fixed run (a particle at 0.6c, passing observer
// at +0.3c): neither the guess nor Part 2's settings change anything here. Every number comes from `energyMomentum.ts`.

export type Prediction = InvariantGuess

// The three answers of Part 1's prediction (wording approved on 2026-10-15; the question text lost its time² − distance² hint in the audit).
export const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'same', label: '(a) The same energy and the same momentum.' },
  { value: 'nothing', label: '(b) Different energies and different momenta, with nothing about them that they agree on.' },
  {
    value: 'one-number',
    label: '(c) Different energies and different momenta, but there is some number, worked out from the energy and the momentum, that they agree on.',
  },
]

const note = { fontSize: '0.8125rem', color: 'var(--text-muted)' } as const
const cell = { padding: '0.3rem 1rem 0.3rem 0' } as const

function fixed(value: number): string {
  const text = value.toFixed(4)
  return (/^-0\.0+$/.test(text) ? text.slice(1) : text).replace('-', '−')
}

function two(value: number): string {
  return value.toFixed(2).replace('-', '−')
}

// A small dark tag, "your guess", beside a column heading the guess names. It is a marker only: it never says right or wrong.
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
    <div style={{ ...note, margin: '0 0 1.25rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>{title}</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{children}</ul>
    </div>
  )
}

export function EnergyMomentumResultsTables({ prediction }: { prediction: Prediction }) {
  const result = runInvariantExperiment('particle', SECTION_A_SPEED, SECTION_A_PASSING_SPEED)
  const checkUp = checkUpRows(result, 'particle')
  const guessed = new Set<BarName>(guessMarkerFor(prediction).flatMap((outline) => outline.bars))
  const guessLabel = PREDICTION_CHOICES.find((c) => c.value === prediction)!.label
  const rows = [
    { name: 'The lab', reading: result.lab },
    ...(result.own ? [{ name: 'The particle’s own observer', reading: result.own }] : []),
    { name: 'The passing observer', reading: result.passing },
  ]
  const columns: { head: string; bar: BarName | null }[] = [
    { head: 'Observer', bar: null },
    { head: 'Speed they measure (c)', bar: null },
    { head: 'Energy E', bar: 'energy' },
    { head: 'Momentum × c', bar: 'momentum' },
    { head: 'E² − (momentum × c)²', bar: 'invariant' },
  ]
  const ledger = result.kineticEnergy !== null && result.newtonKineticEnergy !== null
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ ...note, marginTop: 0 }}>
        These numbers are for Part 1's run: a particle moving at {SECTION_A_SPEED}c in the lab, and a passing observer moving at +{SECTION_A_PASSING_SPEED}c. They are in
        the particle's rest energies. They never change with your prediction or with the settings you try in Part 2.
      </p>

      <div style={{ ...note, padding: '0.75rem 1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', marginBottom: '1.25rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Your prediction, beside the results</p>
        <p style={{ margin: 0 }}>
          <strong>Your guess:</strong> {guessLabel} <strong>The question it was about:</strong> do the observers who move differently agree on anything about the
          particle's energy and momentum? <strong>Where its numbers appear:</strong> the columns tagged "your guess" in the table below, and the bars it outlines in Picture 2.
          It shows only what you chose.
        </p>
      </div>

      <h4 style={{ margin: '0 0 0.25rem' }}>The check-up</h4>
      <p style={{ ...note, margin: '0 0 0.5rem' }}>
        Each row sets what the same physics says to expect beside what was found in your run, with a plain reading. No outside measurement is used here.
      </p>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
          <thead>
            <tr>
              {['Check', 'What we would expect', 'What was found', 'Reading'].map((h) => (
                <th key={h} style={{ textAlign: 'left', ...cell }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {checkUp.map((row) => (
              <tr key={row.check}>
                <td style={cell}>{row.check}</td>
                <td style={cell}>{row.expected === null ? 'no value to expect' : fixed(row.expected)}</td>
                <td style={cell}>{row.found.map(fixed).join(' and ')}</td>
                <td style={cell}>{row.reading}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <NotesBlock title="What this table tells us">
        <li>
          <strong>What it is:</strong> the three observers' E² − (momentum × c)², each set beside 1, the value this physics says a particle's should have (its rest energy
          squared, and the rest energy is our unit, 1). The last row sets the lab's energy beside the passing observer's.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> in your run the three values are {checkUp.slice(0, 3).map((r) => fixed(r.found[0])).join(', ')}: the same as 1
          each time. The two energies, {fixed(result.lab.energy)} and {fixed(result.passing.energy)}, are different.
        </li>
        <li>
          <strong>Why it matters:</strong> a number that every observer finds the same belongs to the particle itself, and not to who is looking at it.
        </li>
        <li>
          <strong>How sure the numbers are:</strong> they are calculated here from the rules in the introduction, not measured on this page. The expected value of 1 comes
          from the same rules, so this check shows that the page is consistent with them. It is not an outside test of the rules.
        </li>
      </NotesBlock>

      <h4 style={{ margin: '0 0 0.25rem' }}>What each observer measured</h4>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.head} style={{ textAlign: 'left', ...cell }}>
                  {col.head}
                  {col.bar !== null && guessed.has(col.bar) && <GuessTag />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.name}>
                <td style={cell}>{o.name}</td>
                <td style={cell}>{fixed(o.reading.speed)}</td>
                <td style={cell}>{fixed(o.reading.energy)}</td>
                <td style={cell}>{fixed(o.reading.momentumTimesC)}</td>
                <td style={cell}>{fixed(o.reading.invariant)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul style={{ ...note, margin: '0 0 1rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Speed they measure:</strong> how fast that observer finds the particle moving. A plus sign means to the right and a minus sign to the left.
        </li>
        <li>
          <strong>Energy E</strong> and <strong>Momentum × c:</strong> what that observer measures. A minus sign on the momentum means it points to the left.
        </li>
        <li>
          <strong>E² − (momentum × c)²:</strong> the energy multiplied by itself, minus the momentum × c multiplied by itself.
        </li>
      </ul>
      <NotesBlock title="What this table tells us">
        <li>
          <strong>What it is:</strong> one row for each observer's measurements of the same particle: its speed, its energy, its momentum × c and the combination in the last
          column.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the lab found an energy of {fixed(result.lab.energy)} and a momentum × c of {fixed(result.lab.momentumTimesC)}.
          The passing observer found {fixed(result.passing.energy)} and {fixed(result.passing.momentumTimesC)}. The particle's own observer found {fixed(result.own!.energy)} and{' '}
          {fixed(result.own!.momentumTimesC)}, so the particle is at rest for them. The first two columns of numbers differ from row to row. The last column is{' '}
          {fixed(result.lab.invariant)} in every row.
        </li>
        <li>
          <strong>Why it matters:</strong> energy and momentum depend on who measures them. One combination of the two does not. In physics that number is called the
          particle's mass, in energy units (the tutor goes through why).
        </li>
      </NotesBlock>

      {ledger && (
        <>
          <h4 style={{ margin: '0 0 0.25rem' }}>The energy ledger</h4>
          <p style={{ ...note, margin: '0 0 0.5rem' }}>
            For the lab's measurement of the particle at {SECTION_A_SPEED}c, in the particle's rest energies:
          </p>
          <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
            <tbody>
              <tr>
                <td style={cell}>Rest energy (the energy at rest)</td>
                <td>1.0000</td>
              </tr>
              <tr>
                <td style={cell}>Kinetic energy (the extra energy from moving)</td>
                <td>{result.kineticEnergy!.toFixed(4)}</td>
              </tr>
              <tr>
                <td style={cell}>Total energy</td>
                <td>{result.lab.energy.toFixed(4)}</td>
              </tr>
              <tr>
                <td style={cell}>Newton's ½ × (speed)² for comparison</td>
                <td>{result.newtonKineticEnergy!.toFixed(4)}</td>
              </tr>
            </tbody>
          </table>
          <NotesBlock title="What this table tells us">
            <li>
              <strong>What it is:</strong> the lab's total energy split into the energy the particle has at rest and the extra energy it has because it moves, with the
              everyday formula ½ × (speed)² set beside the true kinetic energy.
            </li>
            <li>
              <strong>What it means with the real numbers:</strong> at {SECTION_A_SPEED}c the true kinetic energy is {result.kineticEnergy!.toFixed(4)} rest energies. The everyday
              formula gives {result.newtonKineticEnergy!.toFixed(4)}: ½ × {SECTION_A_SPEED} × {SECTION_A_SPEED} = {result.newtonKineticEnergy!.toFixed(2)}. So the everyday formula is
              too small by {two(result.kineticEnergy! - result.newtonKineticEnergy!)} here.
            </li>
            <li>
              <strong>Why it matters:</strong> the everyday formula is right for slow things and wrong for fast ones. A comparison: a map that is accurate for a walk across town
              but not for a flight across an ocean. The gap grows as the speed rises.
            </li>
          </NotesBlock>
        </>
      )}

      <RulesAfterRun />
    </div>
  )
}
