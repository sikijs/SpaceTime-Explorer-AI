import type { ReactNode } from 'react'
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC, PUBLISHED_H0_EARLY, PUBLISHED_H0_LOCAL } from '../physics/hubblesLawExperiment'
import { REAL_UNIVERSE_AGE_YEARS, bigBangCheckUp, galaxyTimeRow } from '../physics/bigBangExperiment'
import type { AgeGuess, BigBangCheckUpReading, TimeGuess } from '../physics/bigBangExperiment'
import { GUESS_COLOR, fmtBillions } from './BigBangPictures'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 2, Part 3: the results (docs/audit/cosmology/02-draft-wording.md, section 6, approved by the owner on 2026-11-14).
// Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page (CLAUDE.md §12, §13).

export interface BigBangResultsProps {
  // The three presets' distances, then (if the learner has added one in Part 2) their own, last.
  presetDistances: Array<{ label: string; distanceMpc: number }>
  ownDistanceMpc: number | null
  guesses: { time: TimeGuess; age: AgeGuess } | null
}

const th = { textAlign: 'left', borderBottom: '2px solid var(--border-color, #ccc)', padding: '0.35rem 0.45rem', fontSize: '0.8125rem' } as const
const cell = { padding: '0.35rem 0.45rem', borderBottom: '1px solid var(--border-color, #ccc)', verticalAlign: 'top', fontSize: '0.8125rem' } as const

function Table({ heads, children }: { heads: ReactNode[]; children: ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem', width: '100%' }}>
        <thead>
          <tr>
            {heads.map((h, i) => (
              <th key={i} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{title}</strong>
      </p>
      <ul style={{ marginTop: 0, paddingLeft: '1.25rem' }}>{children}</ul>
    </div>
  )
}

const TIME_TEXT: Record<TimeGuess, string> = { longer: 'longer', shorter: 'shorter', same: 'the same' }
const AGE_TEXT: Record<AgeGuess, string> = { muchLonger: 'much longer than the real age', muchShorter: 'much shorter than the real age', close: 'close to the real age, but not exact' }

const fmtMpc = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(1))))
const fmtNumber = (v: number) => Math.round(v).toLocaleString('en-US')

const READING_TEXT: Record<Exclude<BigBangCheckUpReading, 'more'>, string> = {
  less: 'Less',
  same: 'The same',
  between: 'Between the two published values; not either of them',
  'between-not-independent': 'The measured age lies between them. Not an independent check',
  'calculated-only': 'Calculated only',
}

export function BigBangResults({ presetDistances, ownDistanceMpc, guesses }: BigBangResultsProps) {
  const rows = [...presetDistances.map((p) => ({ ...p, yours: false })), ...(ownDistanceMpc !== null ? [{ label: 'Your galaxy', distanceMpc: ownDistanceMpc, yours: true }] : [])]
  const check = Object.fromEntries(bigBangCheckUp().map((row) => [row.id, row]))
  const age = check['age-against-measured']
  const atPublished = check['age-at-published-h0']
  const time = galaxyTimeRow(presetDistances[0].distanceMpc).timeBackYears

  return (
    <div style={{ fontSize: '0.875rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: The time back to zero distance</p>
      <Table heads={['Galaxy', 'Distance', 'Recession speed', 'Time back to zero distance']}>
        {rows.map((row) => {
          const r = galaxyTimeRow(row.distanceMpc)
          return (
            <tr key={`${row.label}-${row.distanceMpc}`}>
              <td style={cell}>
                <strong>{row.label}</strong>
              </td>
              <td style={cell}>{fmtMpc(row.distanceMpc)} Mpc</td>
              <td style={cell}>{fmtNumber(r.recessionSpeedKmPerS)} km/s</td>
              <td style={cell}>
                {fmtBillions(r.timeBackYears)} billion years {guesses && <GuessTag />}
              </td>
            </tr>
          )
        })}
      </Table>
      {guesses && <p style={smallNote}>The tag marks where guess 1 is about: the last column. It shows the guess only, not whether it is right.</p>}

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> How long each galaxy takes to go back to zero distance, if it had always moved at its present speed.
        </li>
        <li>
          <strong>What it means.</strong> The galaxies are very different distances and speeds ({fmtNumber(galaxyTimeRow(presetDistances[0].distanceMpc).recessionSpeedKmPerS)} up to{' '}
          {fmtNumber(galaxyTimeRow(presetDistances[presetDistances.length - 1].distanceMpc).recessionSpeedKmPerS)} km/s), yet the time is the same to the digit, {fmtBillions(time)} billion years.
        </li>
        <li>
          <strong>Why it matters.</strong> A single time for every galaxy is what lets us talk about one beginning for the whole universe. Why the numbers come out the same is for the tutor.
        </li>
        <li>
          <strong>How sure it is.</strong> These are calculated, not measured on this page, and they assume constant speeds.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 2: Check-up against published values</p>
      <Table heads={['What we check', 'What we used', 'What the sources give', 'Reading']}>
        <tr>
          <td style={cell}>This page&rsquo;s answer against the age measured by others</td>
          <td style={cell}>
            {fmtBillions(age.used)} billion years {guesses && <GuessTag />}
          </td>
          <td style={cell}>About {(REAL_UNIVERSE_AGE_YEARS / 1e9).toFixed(1)} billion years (NASA)</td>
          <td style={cell}>
            More, by about {((age.relativeGap ?? 0) * 100).toFixed(1)} percent ({fmtBillions(age.used - REAL_UNIVERSE_AGE_YEARS)} billion years)
          </td>
        </tr>
        <tr>
          <td style={cell}>Hubble constant</td>
          <td style={cell}>{check['hubble-constant'].used} km/s per Mpc</td>
          <td style={cell}>
            About {PUBLISHED_H0_LOCAL.value} ± {PUBLISHED_H0_LOCAL.uncertainty} (Riess and others, 2022); about {PUBLISHED_H0_EARLY.value} ± {PUBLISHED_H0_EARLY.uncertainty} (Planck, 2018)
          </td>
          <td style={cell}>{READING_TEXT[check['hubble-constant'].reading as Exclude<BigBangCheckUpReading, 'more'>]}</td>
        </tr>
        <tr>
          <td style={cell}>This page&rsquo;s answer if the Hubble constant were {PUBLISHED_H0_LOCAL.value}, and if it were {PUBLISHED_H0_EARLY.value}</td>
          <td style={cell}>
            {fmtBillions(atPublished.publishedLow!)} and {fmtBillions(atPublished.publishedHigh!)} billion years
          </td>
          <td style={cell}>About {(REAL_UNIVERSE_AGE_YEARS / 1e9).toFixed(1)} billion years (NASA)</td>
          <td style={cell}>{READING_TEXT[atPublished.reading as Exclude<BigBangCheckUpReading, 'more'>]}</td>
        </tr>
        <tr>
          <td style={cell}>Each galaxy&rsquo;s time back to zero</td>
          <td style={cell}>{fmtBillions(check['time-per-galaxy'].used)} billion years</td>
          <td style={cell}>No published reference</td>
          <td style={cell}>The same for every galaxy; calculated only</td>
        </tr>
      </Table>
      {guesses && <p style={smallNote}>The tag marks where guess 2 is about: this page&rsquo;s answer in the first row. It shows the guess only, not whether it is right.</p>}

      <Note title="What this table tells us">
        <li>
          <strong>This page&rsquo;s answer against the measured age.</strong> <em>What it is:</em> the number this experiment found, next to the age found by other methods. <em>What it means:</em> {fmtBillions(age.used)} against about{' '}
          {(REAL_UNIVERSE_AGE_YEARS / 1e9).toFixed(1)}, so this page&rsquo;s answer is a little more, about {((age.relativeGap ?? 0) * 100).toFixed(1)} percent. <em>Why it matters:</em> a plain constant-speed calculation comes out near the measured age, which is
          informative. But it is not proof that this is how the age is found. <em>How sure:</em> the {(REAL_UNIVERSE_AGE_YEARS / 1e9).toFixed(1)} is NASA&rsquo;s rounded figure, read on three pages; the page does not give an uncertainty.
        </li>
        <li>
          <strong>Hubble constant and its two published values.</strong> <em>What it means:</em> the Hubble constant is itself debated (Cosmology 1: the Hubble tension). Set to the two published values, this page&rsquo;s method gives{' '}
          {fmtBillions(atPublished.publishedLow!)} and {fmtBillions(atPublished.publishedHigh!)} billion years. <em>Why it matters:</em> the measured {(REAL_UNIVERSE_AGE_YEARS / 1e9).toFixed(1)} sits between them. It would be easy to read that as a test of the method. It is not:
          the measured age is not found from 1 divided by the Hubble constant but by fitting a fuller model, so this row is a consistency check only.
        </li>
        <li>
          <strong>Each galaxy&rsquo;s time.</strong> No published reference. It comes out the same because of the rule v = H0 × d ({HUBBLE_CONSTANT_KM_PER_S_PER_MPC} km/s per Mpc here), which the tutor explains.
        </li>
      </Note>

      {guesses && (
        <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (a farther galaxy&rsquo;s time against a nearer one&rsquo;s): <strong>{TIME_TEXT[guesses.time]}</strong>. The last column of Table 1 is where its answer is.
            </li>
            <li>
              <strong>Guess 2</strong> (this page&rsquo;s answer against the real age): <strong>{AGE_TEXT[guesses.age]}</strong>. The first row of Table 2 is where its answer is.
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}

      <div
        style={{
          marginTop: '1.5rem',
          padding: '0.9rem 1rem',
          borderRadius: '8px',
          border: '1px solid #d97706',
          backgroundColor: 'rgba(217, 119, 6, 0.1)',
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: '#b45309' }}>Important: this is not how astronomers measure the universe&rsquo;s age.</p>
        <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.875rem' }}>
          The universe&rsquo;s expansion rate has changed over time: it slowed for several billion years as matter pulled on itself, and has been speeding up more recently because of dark energy (NASA). So simply running today&rsquo;s rate backward does not retrace the real history.
        </p>
      </div>
    </div>
  )
}
