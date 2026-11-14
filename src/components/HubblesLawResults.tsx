import type { ReactNode } from 'react'
import {
  HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
  PUBLISHED_COMA,
  PUBLISHED_H0_EARLY,
  PUBLISHED_H0_LOCAL,
  PUBLISHED_VIRGO_DISTANCE_MPC,
  hubbleCheckUp,
} from '../physics/hubblesLawExperiment'
import type { CheckUpReading, HubblePair, RedshiftGuess, SpeedGuess } from '../physics/hubblesLawExperiment'
import { GUESS_COLOR, fmtNumber } from './HubblesLawPictures'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 1, Part 3: the results (docs/audit/cosmology/01-draft-wording.md, section 6, approved by the owner on
// 2026-11-14). Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page
// (CLAUDE.md §12, §13).

export interface HubblesLawResultsProps {
  // The pair from the most recent run (Part 1's, or one of the learner's own in Part 2).
  pair: HubblePair
  ownDistances: boolean
  guesses: { speed: SpeedGuess; redshift: RedshiftGuess } | null
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

const SPEED_TEXT: Record<SpeedGuess, string> = { twice: 'twice as fast', same: 'the same speed', half: 'half as fast' }
const REDSHIFT_TEXT: Record<RedshiftGuess, string> = { nearer: 'the nearer galaxy (B)', farther: 'the farther galaxy (A)', same: 'no difference' }

const READING_TEXT: Record<CheckUpReading, string> = {
  between: 'Between the two published values; not either of them',
  same: 'The same',
  'same-to-printed-digits': 'The same to the digits NASA gives; not an independent check (see the note)',
  'calculated-only': 'Calculated only',
}

const JET_KM_PER_S = 0.3
const oneSignificant = (v: number) => {
  const e = Math.floor(Math.log10(Math.abs(v)))
  return Math.round(v / 10 ** e) * 10 ** e
}
const fmtMpc = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(1))))

export function HubblesLawResults({ pair, ownDistances, guesses }: HubblesLawResultsProps) {
  const { near, far } = pair
  const rows = Object.fromEntries(hubbleCheckUp().map((row) => [row.id, row]))
  const pct = (z: number) => (z * 100).toFixed(3)
  const jetTimes = oneSignificant(near.recessionSpeedKmPerS / JET_KM_PER_S)

  return (
    <div style={{ fontSize: '0.875rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: The pair{ownDistances ? ' (your own distances, from your latest run in Part 2)' : ''}</p>
      <Table heads={['', 'Distance', 'Recession speed', 'Redshift (z)', 'Stretch factor (1 + z)']}>
        <tr>
          <td style={cell}>
            <strong>Galaxy B</strong>
          </td>
          <td style={cell}>{fmtMpc(near.distanceMpc)} Mpc</td>
          <td style={cell}>
            {fmtNumber(near.recessionSpeedKmPerS)} km/s {guesses && <GuessTag />}
          </td>
          <td style={cell}>
            {near.redshift.toFixed(5)} {guesses && <GuessTag />}
          </td>
          <td style={cell}>{near.wavelengthStretchFactor.toFixed(5)}</td>
        </tr>
        <tr>
          <td style={cell}>
            <strong>Galaxy A</strong>
          </td>
          <td style={cell}>{fmtMpc(far.distanceMpc)} Mpc</td>
          <td style={cell}>
            {fmtNumber(far.recessionSpeedKmPerS)} km/s {guesses && <GuessTag />}
          </td>
          <td style={cell}>
            {far.redshift.toFixed(5)} {guesses && <GuessTag />}
          </td>
          <td style={cell}>{far.wavelengthStretchFactor.toFixed(5)}</td>
        </tr>
      </Table>
      {guesses && (
        <p style={smallNote}>
          The tags mark where your guesses are about: the speed column for guess 1 and the redshift column for guess 2. They show the guess only, not whether it is right.
        </p>
      )}

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> The distance of each galaxy and the numbers worked out from it with a Hubble constant of {HUBBLE_CONSTANT_KM_PER_S_PER_MPC} km/s per Mpc.
        </li>
        <li>
          <strong>What it means.</strong> A galaxy at {fmtMpc(near.distanceMpc)} Mpc moves away at {fmtNumber(near.recessionSpeedKmPerS)} km/s; one at {fmtMpc(far.distanceMpc)} Mpc, at {fmtNumber(far.recessionSpeedKmPerS)} km/s. A speed of{' '}
          {fmtNumber(near.recessionSpeedKmPerS)} km/s is about {fmtNumber(jetTimes)} times a fast jet&rsquo;s (about {JET_KM_PER_S} km/s). Their light is stretched by {pct(near.redshift)} percent and {pct(far.redshift)} percent.
        </li>
        <li>
          <strong>Why it matters.</strong> It is the rule that lets astronomers turn a measured redshift into a distance, or a distance into a speed. Why the numbers relate this way is for the tutor.
        </li>
        <li>
          <strong>How sure it is.</strong> These are calculated, not measured on this page. The Hubble constant of {HUBBLE_CONSTANT_KM_PER_S_PER_MPC} is a round value chosen for the page.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 2: Check-up against published values</p>
      <Table heads={['What we check', 'What we used', 'What the sources give', 'Reading']}>
        <tr>
          <td style={cell}>Hubble constant</td>
          <td style={cell}>{rows['hubble-constant'].used} km/s per Mpc</td>
          <td style={cell}>
            About {PUBLISHED_H0_LOCAL.value} ± {PUBLISHED_H0_LOCAL.uncertainty} from nearby stars and supernovae (Riess and others, 2022); about {PUBLISHED_H0_EARLY.value} ± {PUBLISHED_H0_EARLY.uncertainty} from the early universe (Planck, 2018)
          </td>
          <td style={cell}>{READING_TEXT[rows['hubble-constant'].reading]}</td>
        </tr>
        <tr>
          <td style={cell}>Virgo Cluster&rsquo;s distance (Galaxy B in Part 1)</td>
          <td style={cell}>{rows['virgo-distance'].used} Mpc</td>
          <td style={cell}>
            {PUBLISHED_VIRGO_DISTANCE_MPC.value} ± {PUBLISHED_VIRGO_DISTANCE_MPC.random} (random) ± {PUBLISHED_VIRGO_DISTANCE_MPC.systematic} (systematic) Mpc (Mei and others, 2007)
          </td>
          <td style={cell}>{READING_TEXT[rows['virgo-distance'].reading]}</td>
        </tr>
        <tr>
          <td style={cell}>Coma Cluster&rsquo;s redshift, at its distance of {PUBLISHED_COMA.distanceMpc} Mpc</td>
          <td style={cell}>z = {rows['coma-redshift'].used.toFixed(5)}</td>
          <td style={cell}>
            z of {PUBLISHED_COMA.redshift} at about {PUBLISHED_COMA.distanceMpc} Mpc (NASA)
          </td>
          <td style={cell}>{READING_TEXT[rows['coma-redshift'].reading]}</td>
        </tr>
        <tr>
          <td style={cell}>Speed of Galaxy B in Part 1</td>
          <td style={cell}>{fmtNumber(rows['speed-of-b'].used)} km/s</td>
          <td style={cell}>No published reference</td>
          <td style={cell}>{READING_TEXT[rows['speed-of-b'].reading]}</td>
        </tr>
      </Table>

      <Note title="What this table tells us">
        <li>
          <strong>Hubble constant.</strong> <em>What it is:</em> the number that sets the page&rsquo;s speeds. <em>What it means:</em> published values from two methods are about {PUBLISHED_H0_LOCAL.value} and about {PUBLISHED_H0_EARLY.value}. The page&rsquo;s{' '}
          {HUBBLE_CONSTANT_KM_PER_S_PER_MPC} sits between them, so it favours neither. NASA&rsquo;s page gives the ranges 70&ndash;76 and 67&ndash;68 for the two methods. <em>Why it matters:</em> this disagreement is the Hubble tension, a real, unsolved puzzle; the
          page does not say which side is right. <em>How sure:</em> both values are from the papers&rsquo; abstracts, which were read; the full papers were not.
        </li>
        <li>
          <strong>Virgo distance.</strong> <em>What it means:</em> the page&rsquo;s {PUBLISHED_VIRGO_DISTANCE_MPC.value} matches the paper&rsquo;s measured mean to the digit. <em>Why it matters:</em> Galaxy B&rsquo;s distance is a measured one, not invented. <em>How
          sure:</em> the paper&rsquo;s systematic uncertainty is {PUBLISHED_VIRGO_DISTANCE_MPC.systematic} Mpc, about 7 percent.
        </li>
        <li>
          <strong>Coma.</strong> <em>What it means:</em> NASA prints a distance of about {PUBLISHED_COMA.distanceMpc} Mpc and a redshift of {PUBLISHED_COMA.redshift} together, and the page&rsquo;s {PUBLISHED_COMA.distanceMpc} Mpc gives {rows['coma-redshift'].used.toFixed(4)}.{' '}
          <em>Why it matters, and the weak link:</em> a galaxy cluster this far away is in the smooth stretching of space, so its distance is itself worked out from its redshift with a Hubble constant. That makes this row a consistency check, not an independent
          test of the law.
        </li>
        <li>
          <strong>Speed of Galaxy B.</strong> No published reference. The Virgo Cluster&rsquo;s galaxies also move on their own through gravity, so its measured speeds are not simply {fmtNumber(rows['speed-of-b'].used)} km/s.
        </li>
      </Note>

      {guesses && (
        <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (how Galaxy A&rsquo;s speed compares with Galaxy B&rsquo;s): <strong>{SPEED_TEXT[guesses.speed]}</strong>. The speed column of Table 1 is where its answer is.
            </li>
            <li>
              <strong>Guess 2</strong> (which galaxy&rsquo;s light looks redder): <strong>{REDSHIFT_TEXT[guesses.redshift]}</strong>. The redshift column of Table 1 is where its answer is.
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}
    </div>
  )
}
