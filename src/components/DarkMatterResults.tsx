import type { ReactNode } from 'react'
import {
  MARKER_STAR_RADII_KPC,
  OBSERVED_SPEED_KM_PER_S,
  PUBLISHED_SUN_LAP_YEARS,
  PUBLISHED_SUN_SPEED_EILERS_KM_PER_S,
  PUBLISHED_SUN_SPEED_REID_KM_PER_S,
  checkUp,
  rotationCurve,
  visibleEnclosedMass,
  GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS,
} from '../physics/darkMatterExperiment'
import type { CheckUpRow, MeasuredGuess, SpeedGuess } from '../physics/darkMatterExperiment'
import { GUESS_COLOR, MEASURED_GUESS_TEXT, SPEED_GUESS_TEXT } from './DarkMatterPictures'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 4, Part 3: the results (docs/audit/cosmology/04-draft-wording.md, section 5).
// Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page
// (CLAUDE.md §12, §13). Neither guess changes a table. Only the "With your dark matter" column follows Part 2's amount.

export interface DarkMatterResultsProps {
  guesses: { speed: SpeedGuess; measured: MeasuredGuess } | null
  amount: number
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

const abs0 = (v: number) => Math.abs(v).toFixed(0)
const fmt0 = (v: number) => v.toFixed(0)
const million = (years: number) => (years / 1e6).toFixed(0)

export function DarkMatterResults({ guesses, amount }: DarkMatterResultsProps) {
  const rows = Object.fromEntries(checkUp().map((r) => [r.id, r])) as Record<CheckUpRow['id'], CheckUpRow>
  const sunVisible = rows.a.thisPage
  const farVisible = rows.b.thisPage
  const [matchSun, , matchFar] = rotationCurve(1, MARKER_STAR_RADII_KPC)
  const table2 = rotationCurve(amount, MARKER_STAR_RADII_KPC)
  const mass8 = visibleEnclosedMass(8)
  const g = GRAVITATIONAL_CONSTANT_KPC_KMS2_PER_SOLAR_MASS

  return (
    <div style={{ fontSize: '0.875rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: Check-up (calculated beside published; none of these rows depends on your Part 2 amount)</p>
      <Table heads={['What we check', 'This page', 'Beside', 'How they compare']}>
        <tr>
          <td style={cell}>(a) Visible matter only, speed at 8 kpc</td>
          <td style={cell}>{fmt0(rows.a.thisPage)} km/s</td>
          <td style={cell}>the page&rsquo;s measured reference, {OBSERVED_SPEED_KM_PER_S} km/s</td>
          <td style={cell}>
            <strong>Less</strong>, by about {abs0(rows.a.differencePercent)} percent
          </td>
        </tr>
        <tr>
          <td style={cell}>(b) Visible matter only, speed at 30 kpc</td>
          <td style={cell}>{fmt0(rows.b.thisPage)} km/s</td>
          <td style={cell}>the same reference, {OBSERVED_SPEED_KM_PER_S} km/s</td>
          <td style={cell}>
            <strong>Less</strong>, by about {abs0(rows.b.differencePercent)} percent {guesses && <GuessTag />}
          </td>
        </tr>
        <tr>
          <td style={cell}>(c) The matching amount, speed at 8 kpc and at 30 kpc</td>
          <td style={cell}>
            {fmt0(matchSun.withDarkMatterSpeedKmPerS)} and {fmt0(matchFar.withDarkMatterSpeedKmPerS)} km/s
          </td>
          <td style={cell}>the same reference, {OBSERVED_SPEED_KM_PER_S} km/s</td>
          <td style={cell}>
            <strong>The same</strong>, within {Math.abs(rows.c.differencePercent).toFixed(1)} percent at every distance from 5 to 30 kpc. Calculated here; the amount was chosen to do this, so it is <strong>not an independent test</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(d) One lap at the Sun&rsquo;s distance, at the matching amount</td>
          <td style={cell}>about {million(rows.d.thisPage)} million years</td>
          <td style={cell}>about {million(PUBLISHED_SUN_LAP_YEARS)} million years (NASA Starchild, written in 2000)</td>
          <td style={cell}>
            <strong>Less</strong>, by about {abs0(rows.d.differencePercent)} percent
          </td>
        </tr>
        <tr>
          <td style={cell}>(e) The page&rsquo;s reference speed against published values</td>
          <td style={cell}>{OBSERVED_SPEED_KM_PER_S} km/s</td>
          <td style={cell}>
            {PUBLISHED_SUN_SPEED_EILERS_KM_PER_S.toFixed(1)} (Eilers and others, 2018); {PUBLISHED_SUN_SPEED_REID_KM_PER_S} (Reid and others, 2014)
          </td>
          <td style={cell}>
            <strong>Less than both</strong>: a rounded teaching value
          </td>
        </tr>
      </Table>
      {guesses && <p style={smallNote}>The tag marks where guess 2 is about (row b). It shows the guess only, not whether it is right.</p>}
      <p style={smallNote}>
        Rows (a), (b), (c) and (d) are calculated here from a teaching model of a galaxy. Only row (d)&rsquo;s right-hand figure and row (e)&rsquo;s two figures are published values. The page found no published range for the share of the mass that is dark matter, so no row is given for it.
      </p>

      <Note title="What this table tells us">
        <li>
          <strong>Rows (a) and (b), visible matter only.</strong> <em>What it is:</em> the speed a star needs if only the visible matter pulled on it. <em>What it means:</em> {fmt0(sunVisible)} km/s at 8 kpc and {fmt0(farVisible)} km/s at 30 kpc, against the {OBSERVED_SPEED_KM_PER_S} km/s
          reference: less, by about a quarter and by more than half. <em>Why it matters:</em> the gap grows with distance, so it is largest where the stars are far from the visible matter. <em>How sure:</em> the blue line comes from a teaching model, not a real galaxy, so the numbers
          show the idea, not a real galaxy&rsquo;s weight.
        </li>
        <li>
          <strong>Row (c), the matching amount.</strong> <em>What it is:</em> the speed with dark matter added in the amount the page calls &ldquo;matching&rdquo;. <em>What it means:</em> {fmt0(matchSun.withDarkMatterSpeedKmPerS)} to {fmt0(matchFar.withDarkMatterSpeedKmPerS)} km/s, within{' '}
          {Math.abs(rows.c.differencePercent).toFixed(1)} percent of {OBSERVED_SPEED_KM_PER_S} at every distance. <em>Why it matters:</em> it shows the model <em>can</em> be made to fit. It is not evidence that dark matter exists, because the amount was chosen to give this fit. The evidence is in
          the measurements, not in this row. The &ldquo;within 5 percent&rdquo; rule used for &ldquo;the same&rdquo; is this page&rsquo;s own rule, not a published one.
        </li>
        <li>
          <strong>Row (d), the Sun&rsquo;s lap.</strong> <em>What it is:</em> the time for one lap, 2 × π × r ÷ v. <em>What it means:</em> about {million(rows.d.thisPage)} million years at 8 kpc, against NASA&rsquo;s &ldquo;about {million(PUBLISHED_SUN_LAP_YEARS)} million years&rdquo; for the
          Sun: less, by about {abs0(rows.d.differencePercent)} percent. <em>Why it matters:</em> it is a plain check that the units and the sums behave. It is not a test of dark matter. <em>How sure:</em> NASA&rsquo;s page was written in 2000 and gives a round figure.
        </li>
        <li>
          <strong>Row (e), the reference speed.</strong> <em>What it is:</em> the green line&rsquo;s {OBSERVED_SPEED_KM_PER_S} km/s set beside two published values. <em>What it means:</em> both papers give higher figures, by {fmt0(PUBLISHED_SUN_SPEED_EILERS_KM_PER_S - OBSERVED_SPEED_KM_PER_S)} and{' '}
          {fmt0(PUBLISHED_SUN_SPEED_REID_KM_PER_S - OBSERVED_SPEED_KM_PER_S)} km/s. Eilers and others also find the real curve gently declining beyond the inner galaxy. <em>Why it matters:</em> the green line is a simple reference, not the full measured curve, so do not take {OBSERVED_SPEED_KM_PER_S}{' '}
          as the exact speed of our Sun.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 2: Speeds at three distances (calculated here; the last column is the page&rsquo;s given reference)</p>
      <Table heads={['Distance', 'Visible matter only', `With your dark matter (${amount.toFixed(2)} × the matching amount)`, 'Measured reference (given)']}>
        {table2.map((p) => (
          <tr key={p.radiusKpc}>
            <td style={cell}>{p.radiusKpc} kpc</td>
            <td style={cell}>
              {fmt0(p.visibleOnlySpeedKmPerS)} km/s {guesses && (p.radiusKpc === 8 || p.radiusKpc === 30) && <GuessTag />}
            </td>
            <td style={cell}>{fmt0(p.withDarkMatterSpeedKmPerS)} km/s</td>
            <td style={cell}>{OBSERVED_SPEED_KM_PER_S} km/s</td>
          </tr>
        ))}
      </Table>
      {guesses && <p style={smallNote}>The tags on the &ldquo;Visible matter only&rdquo; column (8 and 30 kpc) mark where guess 1 is about. Only the column &ldquo;With your dark matter&rdquo; follows Part 2&rsquo;s amount; every other number stays the same.</p>}

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> The speeds the model gives for the three stars you saw.
        </li>
        <li>
          <strong>What it means with the real numbers.</strong> With only visible matter the speed falls from {fmt0(table2[0].visibleOnlySpeedKmPerS)} to {fmt0(table2[1].visibleOnlySpeedKmPerS)} to {fmt0(table2[2].visibleOnlySpeedKmPerS)} km/s across the three distances. With your amount it goes
          from {fmt0(table2[0].withDarkMatterSpeedKmPerS)} to {fmt0(table2[1].withDarkMatterSpeedKmPerS)} to {fmt0(table2[2].withDarkMatterSpeedKmPerS)}.
        </li>
        <li>
          <strong>Why it matters.</strong> It is the same graph as in Part 1, in numbers. There is no second table for the controls, because the purple line already shows what the amount does.
        </li>
      </Note>

      {guesses && (
        <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (a far star&rsquo;s speed compared with a near star&rsquo;s, if the visible matter were all the mass): <strong>{SPEED_GUESS_TEXT[guesses.speed]}</strong>. The numbers are in Table 2, &ldquo;Visible matter only&rdquo;, at 8 and 30 kpc.
            </li>
            <li>
              <strong>Guess 2</strong> (whether the measured speeds match the visible-matter prediction): <strong>they will {MEASURED_GUESS_TEXT[guesses.measured]}</strong>. The numbers are in Table 1, row (b).
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: 'rgba(15, 118, 110, 0.08)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#0f766e' }}>A worked example</p>
        <p style={{ margin: '0.5rem 0 0.4rem' }}>
          At 8 kpc (about the Sun&rsquo;s distance) the model&rsquo;s visible matter inside the orbit is about {(mass8 / 1e10).toFixed(1)}×10¹⁰ solar masses. Using v = √(G × M ÷ r) with G = {(g * 1e6).toFixed(1)}×10⁻⁶ (in these units): v = √({(g * 1e6).toFixed(1)}×10⁻⁶ ×{' '}
          {(mass8 / 1e10).toFixed(1)}×10¹⁰ ÷ 8) ≈ {fmt0(sunVisible)} km/s.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Remember:</strong> this uses ordinary Newtonian gravity, which is fine at these speeds, and the mass shapes are a simple teaching model, not a fit to a real galaxy. The measured speed is a given, rounded value, and real curves are not perfectly flat.
        </p>
      </div>
    </div>
  )
}
