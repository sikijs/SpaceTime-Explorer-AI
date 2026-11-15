import type { ReactNode } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  OLDEST_STARS_AGE_YEARS,
  PLANCK_LIKE_DARK_ENERGY_FRACTION,
  PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC,
  PUBLISHED_CHABOYER_1997,
  PUBLISHED_HIPPARCOS,
  PUBLISHED_NASA_HUBBLE_RANGES,
  PUBLISHED_PLANCK,
  checkUp,
  darkEnergyExample,
  matterOnlyExample,
  measuredAgeShare,
  percentDifference,
  starTestPassShare,
  universeAgeYears,
  valuesTable,
  yourComparison,
} from '../physics/universeAgeExperiment'
import type { CheckUpRow, DarkEnergyGuess, MatterOnlyGuess } from '../physics/universeAgeExperiment'
import { DARK_GUESS_TEXT, GUESS_COLOR, MATTER_GUESS_TEXT, YOUR_SHARE_COLOR } from './UniverseAgePictures'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 6, Part 3: the results (docs/audit/cosmology/06-draft-wording.md, section 5).
// Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page (CLAUDE.md §12,
// §13). Neither guess changes a table. Only the amber row of Table 2 and "What your numbers show" follow Part 2's share.

export interface UniverseAgeResultsProps {
  guesses: { matter: MatterOnlyGuess; dark: DarkEnergyGuess } | null
  share: number
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

const b = (years: number) => (years / 1e9).toFixed(2)
// The published age is quoted to three decimals, as the Planck paper's table gives it (13.797 ± 0.023)
const b3 = (years: number) => (years / 1e9).toFixed(3)
const abs = (years: number) => Math.abs(years / 1e9).toFixed(2)

export function UniverseAgeResults({ guesses, share }: UniverseAgeResultsProps) {
  const rows = Object.fromEntries(checkUp().map((r) => [r.id, r])) as Record<CheckUpRow['id'], CheckUpRow>
  const matter = matterOnlyExample()
  const best = darkEnergyExample()
  const yours = yourComparison(share)
  const planck = PUBLISHED_PLANCK
  const stars = OLDEST_STARS_AGE_YEARS
  const passShare = starTestPassShare()
  const measuredShare = measuredAgeShare()
  const values = valuesTable()
  const hubbleOnlyAge = universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION, PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC)
  const pairAge = universeAgeYears(PLANCK_LIKE_DARK_ENERGY_FRACTION, PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC)
  const pct = Math.round(share * 100)
  const diffText = (reading: string, years: number) => (reading === 'the same' ? 'the same, within the published uncertainty' : `${reading}, by ${abs(years)}`)

  return (
    <div style={{ fontSize: '0.875rem' }}>
      {guesses && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (a universe of only matter, against Cosmology 2&rsquo;s constant-speed estimate): <strong>it would {MATTER_GUESS_TEXT[guesses.matter]} that estimate</strong>. The two numbers it is about are in Table 2, in the row &ldquo;Matter only&rdquo; and the row for the Hubble time.
            </li>
            <li>
              <strong>Guess 2</strong> (adding dark energy, against a matter-only universe): <strong>it would {DARK_GUESS_TEXT[guesses.dark]}</strong>. The number it is about is in Table 2, in the row &ldquo;Your universe&rdquo;.
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}

      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: Check-up (none of these rows depends on your Part 2 share)</p>
      <Table heads={['What we compare', 'Calculated here (billion years)', 'Published (billion years)', 'How they compare']}>
        <tr>
          <td style={cell}>(a) The best fit&rsquo;s age ({Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}% dark energy, 70 km/s) against the measured age</td>
          <td style={cell}>{b(rows.a.thisPageYears)}</td>
          <td style={cell}>
            {b3(planck.ageYears)} ± {b3(planck.ageUncertaintyYears)} (Planck 2018)
          </td>
          <td style={cell}>
            <strong>{diffText(rows.a.reading, rows.a.differenceYears!)}</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(b) The Planck-like pair ({PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC} km/s and {(PLANCK_LIKE_DARK_ENERGY_FRACTION * 100).toFixed(1)}% dark energy) against the measured age</td>
          <td style={cell}>{b(rows.b.thisPageYears)}</td>
          <td style={cell}>
            {b3(planck.ageYears)} ± {b3(planck.ageUncertaintyYears)}
          </td>
          <td style={cell}>
            <strong>{diffText(rows.b.reading, rows.b.differenceYears!)}</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(c) A universe of only matter against the oldest known star clusters</td>
          <td style={cell}>{b(rows.c.thisPageYears)}</td>
          <td style={cell}>older than about {b(stars)} (a 2023 study; depends on its model)</td>
          <td style={cell}>
            <strong>{diffText(rows.c.reading, rows.c.differenceYears!)}</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(d) Cosmology 2&rsquo;s Hubble time against the measured age</td>
          <td style={cell}>{b(rows.d.thisPageYears)}</td>
          <td style={cell}>
            {b3(planck.ageYears)} ± {b3(planck.ageUncertaintyYears)}
          </td>
          <td style={cell}>
            <strong>{diffText(rows.d.reading, rows.d.differenceYears!)}</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(e) A universe of only matter against the Hubble time</td>
          <td style={cell}>
            {b(rows.e.thisPageYears)} against {b(matter.hubbleTimeYears)} (ratio {(matter.ageYears / matter.hubbleTimeYears).toFixed(3)})
          </td>
          <td style={cell}>no outside value</td>
          <td style={cell}>
            <strong>Less (two thirds); calculated here only</strong>
          </td>
        </tr>
      </Table>
      <p style={smallNote}>
        Rows (a), (b) and (d) are measured against Planck 2018&rsquo;s age; row (c) against a lower limit from a 2023 study; row (e) has no published value. &ldquo;The same&rdquo; is said only when the difference is inside the published uncertainty (± {b3(planck.ageUncertaintyYears)}). No cut-off such as &ldquo;close enough&rdquo; is used here.
      </p>

      <Note title="What this table tells us">
        <li>
          <strong>Row (a), the best fit.</strong> <em>What it is:</em> the age this page&rsquo;s model gives for {Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)} percent dark energy and 70 km/s, beside the age Planck found. <em>What it means:</em> {b(rows.a.thisPageYears)} is {abs(rows.a.differenceYears!)} billion years less than {b3(planck.ageYears)}, and Planck&rsquo;s own uncertainty is {b3(planck.ageUncertaintyYears)}. <em>Why it matters:</em> the model has the right shape but rounded inputs (70, not{' '}
          {PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC}), so it lands close but not on the published number. Row (b) shows why: use the published inputs and the gap goes.
        </li>
        <li>
          <strong>Row (b), the Planck-like pair.</strong> <em>What it is:</em> the same formula with the values the Planck paper gives ({PUBLISHED_PLANCK.hubbleConstant}, here rounded to {PLANCK_LIKE_HUBBLE_CONSTANT_KM_PER_S_PER_MPC}, and a dark energy share of {PUBLISHED_PLANCK.darkEnergyShare}, rounded to {(PLANCK_LIKE_DARK_ENERGY_FRACTION * 100).toFixed(1)} percent). <em>What it means:</em> {(rows.b.thisPageYears / 1e9).toFixed(3)} against {b3(planck.ageYears)}. <em>Why it matters:</em> the simple model you are using is the model that gives the age; only its inputs were illustrative. <em>How sure:</em> the match is to the digits shown, and a different rounding would shift the last digit.
        </li>
        <li>
          <strong>Row (c), only matter against the oldest clusters.</strong> <em>What it is:</em> the matter-only age against a lower limit for the oldest star clusters. <em>What it means:</em> {b(rows.c.thisPageYears)} against &ldquo;older than about {b(stars)}&rdquo;: the universe would be about {abs(rows.c.differenceYears!)} billion years younger than stars inside it. <em>Why it matters:</em> a universe cannot be younger than its own stars, so this version cannot be the real one, whatever the exact figure. <em>How sure:</em> the {b(stars)} depends on the study&rsquo;s model (it assumed a matter share of 0.3), so it is a rough test.
        </li>
        <li>
          <strong>Row (d), the straight-line estimate.</strong> <em>What it is:</em> the Hubble time from Cosmology 2. <em>What it means:</em> {b(rows.d.thisPageYears)} is {abs(rows.d.differenceYears!)} more than {b3(planck.ageYears)}, about {percentDifference(rows.d.thisPageYears, planck.ageYears).toFixed(1)} percent. <em>Why it matters:</em> it is close, but you will be asked in Part 4 why.
        </li>
        <li>
          <strong>Row (e), only matter against the Hubble time.</strong> <em>What it is:</em> the matter-only age as a fraction of the Hubble time. <em>What it means:</em> exactly two thirds in this model, a result of the calculation and not a measurement; no official page read states it. <em>Why it matters:</em> it is the &ldquo;simple calculation&rdquo; below: (2 ÷ 3) × {b(matter.hubbleTimeYears)} = {b(matter.ageYears)}.
        </li>
      </Note>

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>The oldest star clusters, and how their ages have moved.</strong> In 1997 ESA reported that the Hipparcos satellite&rsquo;s distances showed the oldest stars were farther away, and so brighter and younger, than thought: other estimates had given them about {(PUBLISHED_HIPPARCOS.earlierEstimateYears / 1e9).toFixed(1)} billion years, and Hipparcos gave about {(PUBLISHED_HIPPARCOS.hipparcosYears / 1e9).toFixed(0)}. Chaboyer and others (1997) found {(PUBLISHED_CHABOYER_1997.ageYears / 1e9).toFixed(1)} ± {(PUBLISHED_CHABOYER_1997.uncertaintyYears / 1e9).toFixed(1)} billion years. A 2023 study finds the oldest ones older than about {b(stars)}. The estimates have moved a good deal as the methods improved, which is why this page treats the marker as a rough test and not a precise figure.
        </p>
      </div>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 2: The ages (calculated here; the amber row follows your Part 2 share)</p>
      <Table heads={['Version', 'Your value (billion years)', 'Published value', 'How yours compares']}>
        <tr>
          <td style={cell}>
            Matter only {guesses && <GuessTag />}
          </td>
          <td style={cell}>{b(matter.ageYears)}</td>
          <td style={cell}>none: an imagined universe</td>
          <td style={cell}>not compared</td>
        </tr>
        <tr>
          <td style={cell}>Cosmology 2&rsquo;s constant-speed estimate (the Hubble time) {guesses && <GuessTag />}</td>
          <td style={cell}>{b(matter.hubbleTimeYears)}</td>
          <td style={cell}>none: a simplified picture</td>
          <td style={cell}>not compared</td>
        </tr>
        <tr style={{ backgroundColor: 'rgba(251, 191, 36, 0.12)' }}>
          <td style={cell}>
            <strong style={{ color: YOUR_SHARE_COLOR }}>Your universe</strong> ({pct}% dark energy) {guesses && <GuessTag />}
          </td>
          <td style={cell}>{b(yours.ageYears)}</td>
          <td style={cell}>
            {b3(planck.ageYears)} ± {b3(planck.ageUncertaintyYears)} (Planck 2018)
          </td>
          <td style={cell}>
            <strong>{diffText(yours.againstMeasured.reading, yours.againstMeasured.differenceYears)}</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>The oldest known star clusters (lower limit)</td>
          <td style={cell}>n/a</td>
          <td style={cell}>older than about {b(stars)}</td>
          <td style={cell}>
            your universe is <strong>{yours.againstOldestStars.older ? 'older' : 'younger'}</strong> than this, by {abs(yours.againstOldestStars.differenceYears)}
          </td>
        </tr>
      </Table>
      {guesses && <p style={smallNote}>The tags mark where each guess is about: guess 1 at the first two rows, guess 2 at the amber row. They show the guess only, not whether it is right.</p>}

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> The page&rsquo;s four ages, with the one row you control.
        </li>
        <li>
          <strong>What it means with the real numbers.</strong> A universe passes the star test (older than {b(stars)}) from about {(passShare * 100).toFixed(0)} percent dark energy; it equals the measured age at about {(measuredShare * 100).toFixed(1)} percent (with this page&rsquo;s 70 km/s).
        </li>
        <li>
          <strong>Why it matters.</strong> The match to the real age depends on the inputs, not only on the share (Table 3).
        </li>
      </Note>

      <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', border: `1px solid ${YOUR_SHARE_COLOR}`, borderRadius: '6px', fontSize: '0.875rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What your numbers show.</strong> With <strong>{pct}%</strong> dark energy, your universe is <strong>{b(yours.ageYears)}</strong> billion years old: <strong>{yours.againstMeasured.reading === 'the same' ? 'the same as' : `${yours.againstMeasured.reading} than`}</strong> the measured {b3(planck.ageYears)}
          {yours.againstMeasured.reading === 'the same' ? '' : ` by ${abs(yours.againstMeasured.differenceYears)}`}, and <strong>{yours.againstOldestStars.older ? 'older' : 'younger'}</strong> than the oldest known star clusters by {abs(yours.againstOldestStars.differenceYears)}. Row (c) of Table 1 does not change with your share: a universe of only matter is still younger than the clusters. Each time you raise the share the age rises.
        </p>
        <p style={{ margin: 0, fontSize: '0.8125rem' }}>
          <strong>These are trial values and your own numbers. They do not say the real universe is like that.</strong>
        </p>
      </div>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 3: Which values give 13.8?</p>
      <Table heads={['Hubble constant (km/s per Mpc)', 'Dark energy', 'Age (billion years)']}>
        {values.map((r, i) => (
          <tr key={i}>
            <td style={cell}>{r.hubbleConstant}{i === 1 ? ' only' : ''}</td>
            <td style={cell}>{(r.share * 100).toFixed(r.share === PLANCK_LIKE_DARK_ENERGY_FRACTION ? 1 : 0)}%</td>
            <td style={cell}>{i === 2 ? <strong>{b(r.ageYears)}</strong> : b(r.ageYears)}</td>
          </tr>
        ))}
      </Table>
      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> The question &ldquo;Why not exactly 13.8?&rdquo; as a table.
        </li>
        <li>
          <strong>What it means with the real numbers.</strong> Lowering the Hubble constant alone overshoots ({b(hubbleOnlyAge)}); lowering both gives {b(pairAge)}.
        </li>
        <li>
          <strong>Why it matters.</strong> The real age needs both numbers to be right. The Hubble constant is still debated (NASA, August 2025: space telescopes about {PUBLISHED_NASA_HUBBLE_RANGES.spaceTelescopes.low} to {PUBLISHED_NASA_HUBBLE_RANGES.spaceTelescopes.high}, the microwave background about {PUBLISHED_NASA_HUBBLE_RANGES.microwaveBackground.low} to {PUBLISHED_NASA_HUBBLE_RANGES.microwaveBackground.high}), so the 70 used here is only illustrative.
        </li>
      </Note>

      <div style={{ marginTop: '1.5rem', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: 'rgba(15, 118, 110, 0.08)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#0f766e' }}>A simple calculation</p>
        <p style={{ margin: '0.5rem 0 0.4rem' }}>
          With no dark energy, the age works out to exactly two thirds of the Hubble time: (2 ÷ 3) × {b(matter.hubbleTimeYears)} ≈ {b(matter.ageYears)} billion years. With dark energy the formula is a little longer, but the idea is the same: the age comes from adding up the whole expansion history, moment by moment. At {Math.round(best.share * 100)} percent it is {b(best.hubbleTimeYears)} × {best.factor.toFixed(3)} × {best.asinhValue.toFixed(3)} ≈ {b(best.ageYears)}.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Remember:</strong> this model treats the universe as flat, with only matter and a constant dark energy. Radiation, inflation, and what happened at the Big Bang itself are left out, and the Hubble constant is illustrative. The measured age is a given value, not worked out here.
        </p>
      </div>
    </div>
  )
}
