import type { ReactNode } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  GUESS_REDSHIFT,
  MATCH_TOLERANCE,
  PUBLISHED_DARK_ENERGY_RANGE_PERCENT,
  PUBLISHED_MATTER_SHARE_PLANCK,
  PUBLISHED_RIESS_FARTHER_PERCENT,
  PUBLISHED_UNIVERSE_SHARES_PERCENT,
  brightnessExample,
  checkUp,
  decelerationParameter,
  expansionDirection,
  magnitudesDimmer,
  matchingShareBand,
  runDarkEnergyExperiment,
  zeroCrossingShare,
} from '../physics/darkEnergyExperiment'
import type { CheckUpRow, GravityGuess, LooksGuess } from '../physics/darkEnergyExperiment'
import { GRAVITY_GUESS_TEXT, GUESS_COLOR, LOOKS_GUESS_TEXT } from './DarkEnergyPictures'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 5, Part 3: the results (docs/audit/cosmology/05-draft-wording.md, section 5).
// Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page
// (CLAUDE.md §12, §13). Neither guess changes a table. Only the "your universe" columns follow Part 2's share.
// Table 1, row (a): the number only until the learner reaches the tutor's explanation, then the word as well (question C, default).

export interface DarkEnergyResultsProps {
  guesses: { gravity: GravityGuess; looks: LooksGuess } | null
  share: number
  explained: boolean
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

const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(2)}`
const fmt0 = (v: number) => v.toFixed(0)

export function DarkEnergyResults({ guesses, share, explained }: DarkEnergyResultsProps) {
  const rows = Object.fromEntries(checkUp().map((r) => [r.id, r])) as Record<CheckUpRow['id'], CheckUpRow>
  const best = BEST_FIT_DARK_ENERGY_FRACTION
  const example = brightnessExample(best)
  const yours = runDarkEnergyExperiment(share)
  const bestRun = runDarkEnergyExperiment(best)
  const crossing = zeroCrossingShare()
  const band = matchingShareBand()
  const { low, high } = PUBLISHED_DARK_ENERGY_RANGE_PERCENT
  const planckDark = (1 - PUBLISHED_MATTER_SHARE_PLANCK.value) * 100
  const mag = magnitudesDimmer(example.brightness)
  const verdictLine = `At ${(share * 100).toFixed(0)} percent the brightness stays within ${Math.round(MATCH_TOLERANCE * 100)} percent of the best fit's at every redshift only for shares from about ${(band.low * 100).toFixed(0)} to ${(band.high * 100).toFixed(0)} percent.`

  return (
    <div style={{ fontSize: '0.875rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: Check-up (none of these rows depends on your Part 2 share)</p>
      <Table heads={['What we check', 'What we expect', 'What we found', 'How they compare']}>
        <tr>
          <td style={cell}>
            (a) Expansion today, a universe of only matter (deceleration number) {guesses && <GuessTag />}
          </td>
          <td style={cell}>no outside value</td>
          <td style={cell}>
            {signed(rows.a.thisPage)}
            {explained ? ` (${expansionDirection(0)})` : ''}
          </td>
          <td style={cell}>
            <strong>Calculated here only</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(b) Expansion today, astronomers&rsquo; best fit ({Math.round(best * 100)}% dark energy)</td>
          <td style={cell}>the observed result, found by two teams in 1998: the expansion is speeding up (NASA)</td>
          <td style={cell}>{signed(rows.b.thisPage)}</td>
          <td style={cell}>
            <strong>The same direction</strong> as the observed result
          </td>
        </tr>
        <tr>
          <td style={cell}>(c) Brightness at redshift {GUESS_REDSHIFT}, best fit, compared with matter only</td>
          <td style={cell}>1.00 in a matter-only universe</td>
          <td style={cell}>
            {rows.c.thisPage.toFixed(2)} {guesses && <GuessTag />}
          </td>
          <td style={cell}>
            <strong>Less</strong>, by about {Math.abs(rows.c.differencePercent!).toFixed(0)} percent
          </td>
        </tr>
        <tr>
          <td style={cell}>(d) The share at which the speed-up begins</td>
          <td style={cell}>the model&rsquo;s own value, {(crossing * 100).toFixed(0)} percent</td>
          <td style={cell}>the best fit, {Math.round(best * 100)} percent, is well above it</td>
          <td style={cell}>
            <strong>Calculated here only</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(e) The best fit&rsquo;s share of dark energy</td>
          <td style={cell}>
            NASA: &ldquo;approximately {low} to {high}%&rdquo;
          </td>
          <td style={cell}>{Math.round(best * 100)} percent</td>
          <td style={cell}>
            <strong>Within NASA&rsquo;s stated range</strong>, at its top
          </td>
        </tr>
      </Table>
      {guesses && <p style={smallNote}>The tags mark where each guess is about: guess 1 at row (a), guess 2 at row (c) and in Table 2 at redshift {GUESS_REDSHIFT}. They show the guess only, not whether it is right.</p>}
      <p style={smallNote}>
        Rows (a), (c) and (d) are calculated here from a simple model of the universe. Only the figures in rows (b) and (e) are published. The model&rsquo;s own &ldquo;within {Math.round(MATCH_TOLERANCE * 100)} percent&rdquo; rule, used in Part 2, is this page&rsquo;s, not a published cut-off. No cut-off such as &ldquo;close enough&rdquo; is used
        here.
      </p>

      <Note title="What this table tells us">
        <li>
          <strong>Rows (a) and (b), expansion today.</strong> <em>What it is:</em> the deceleration number says, in one number, whether the expansion is slowing down (above zero), speeding up (below zero) or steady (zero) today. <em>What it means:</em> in this model a universe of only matter gives{' '}
          {signed(rows.a.thisPage)} and the best fit gives {signed(rows.b.thisPage)}, so the two sit on opposite sides of zero. <em>Why it matters:</em> it turns a long history into one number that anybody can compare. Think of a car&rsquo;s dashboard: the sign says whether you are on the accelerator or the brake. The
          sum is q = 0.5 − 1.5 × (dark energy share); at {Math.round(best * 100)} percent that is 0.5 − {(1.5 * best).toFixed(2)} = {signed(decelerationParameter(best))}. <em>How sure:</em> these are model numbers, not measurements. The observed result in row (b) is only the direction, not the number.
        </li>
        <li>
          <strong>Row (c), brightness at redshift {GUESS_REDSHIFT}.</strong> <em>What it is:</em> how bright the middle supernova looks compared with a matter-only universe. <em>What it means:</em> {example.brightness.toFixed(2)}, so about {example.percentDimmer.toFixed(0)} percent less bright ({mag.toFixed(2)} magnitudes, the logarithmic
          scale astronomers use), which means it is placed about {example.percentFarther.toFixed(0)} percent farther away ({example.distanceMpc.toFixed(0)} against {example.matterOnlyDistanceMpc.toFixed(0)} Mpc). <em>Why it matters:</em> a supernova of known true brightness that looks less bright than expected is farther away than expected, and the distance records how space stretched
          on the light&rsquo;s way. <em>Careful with published numbers:</em> Riess and others (1998) reported distances {PUBLISHED_RIESS_FARTHER_PERCENT.low} to {PUBLISHED_RIESS_FARTHER_PERCENT.high} percent <em>farther</em> than in a universe with a low matter density (20 percent) and no dark energy. That is a different comparison from this page&rsquo;s (a universe that is all matter), so the two
          percentages cannot be set side by side. <em>How sure:</em> the {example.brightness.toFixed(2)} is a calculation at a rounded {Math.round(best * 100)} percent, not a measurement.
        </li>
        <li>
          <strong>Row (d), where the speed-up begins.</strong> <em>What it is:</em> the share at which the deceleration number reaches zero. <em>What it means:</em> in this model, {(crossing * 100).toFixed(0)} percent: for any share above it the expansion speeds up. <em>Why it matters:</em> it shows that a fairly small share can change the sign. The best fit is about double it. <em>How sure:</em> this is the page&rsquo;s model (flat,
          constant dark energy), not a measurement.
        </li>
        <li>
          <strong>Row (e), the best fit.</strong> <em>What it is:</em> the share of the universe&rsquo;s energy that astronomers&rsquo; fits give to dark energy. <em>What it means:</em> the page&rsquo;s {Math.round(best * 100)} is a rounded value. NASA&rsquo;s pages say &ldquo;approximately {low} to {high}%&rdquo; and {PUBLISHED_UNIVERSE_SHARES_PERCENT.darkEnergy} percent (with dark matter {PUBLISHED_UNIVERSE_SHARES_PERCENT.darkMatter} and
          ordinary matter {PUBLISHED_UNIVERSE_SHARES_PERCENT.ordinaryMatter} percent), and Planck&rsquo;s matter share of {PUBLISHED_MATTER_SHARE_PLANCK.value} ± {PUBLISHED_MATTER_SHARE_PLANCK.uncertainty} leaves {planckDark.toFixed(1)} percent for dark energy in a flat universe (worked out here, not stated in the paper&rsquo;s abstract). <em>Why it matters:</em> this share fixes the green line; a few percent either way would
          not change the story. <em>How sure:</em> the exact value depends on the data set and the date, and none of the pages read gives both.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 2: How far and how bright (calculated here; the &ldquo;your universe&rdquo; columns follow your Part 2 share)</p>
      <Table heads={['Redshift', 'Distance, matter only (Mpc)', `Distance, your universe (${(share * 100).toFixed(0)}% dark energy) (Mpc)`, 'Brightness, your universe', 'Brightness, astronomers’ best fit']}>
        {yours.supernovae.map((sn, i) => (
          <tr key={sn.redshift}>
            <td style={cell}>
              {sn.redshift} {guesses && sn.redshift === GUESS_REDSHIFT && <GuessTag />}
            </td>
            <td style={cell}>{fmt0(sn.matterOnlyDistanceMpc)}</td>
            <td style={cell}>{fmt0(sn.distanceMpc)}</td>
            <td style={cell}>{(sn.brightnessRelativeToMatterOnly * 100).toFixed(0)}%</td>
            <td style={cell}>{(bestRun.supernovae[i].brightnessRelativeToMatterOnly * 100).toFixed(0)}%</td>
          </tr>
        ))}
      </Table>
      {guesses && <p style={smallNote}>The tag marks where guess 2 is about (redshift {GUESS_REDSHIFT}). Only the columns for &ldquo;your universe&rdquo; follow Part 2&rsquo;s share; every other number stays the same.</p>}

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> The distance each supernova appears to have in a matter-only universe and in yours, and how bright it looks compared with a matter-only universe.
        </li>
        <li>
          <strong>What it means with the real numbers.</strong> At the best fit, a supernova at redshift 0.2 looks {(bestRun.supernovae[0].brightnessRelativeToMatterOnly * 100).toFixed(0)} percent as bright as in a matter-only universe, at 0.5 {(bestRun.supernovae[1].brightnessRelativeToMatterOnly * 100).toFixed(0)} percent and at 0.8{' '}
          {(bestRun.supernovae[2].brightnessRelativeToMatterOnly * 100).toFixed(0)} percent, because its distance is {fmt0(bestRun.supernovae[0].distanceMpc)} against {fmt0(bestRun.supernovae[0].matterOnlyDistanceMpc)}, {fmt0(bestRun.supernovae[1].distanceMpc)} against {fmt0(bestRun.supernovae[1].matterOnlyDistanceMpc)} and{' '}
          {fmt0(bestRun.supernovae[2].distanceMpc)} against {fmt0(bestRun.supernovae[2].matterOnlyDistanceMpc)} Mpc. The farther the supernova, the bigger the gap.
        </li>
        <li>
          <strong>Why it matters.</strong> The gap grows with distance, which is why astronomers needed supernovae out to redshift 0.5 and beyond, and why nearby galaxies could not settle the question.
        </li>
        <li>
          <strong>Trial values.</strong> The &ldquo;your universe&rdquo; columns follow your Part 2 share. These are <strong>trial values</strong>. They show what would happen in a universe with that much dark energy, and do not say the real universe is like that. {verdictLine} (The {Math.round(MATCH_TOLERANCE * 100)} percent is this page&rsquo;s own yardstick, not a
          published one.)
        </li>
      </Note>

      {guesses && (
        <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (in a universe of only matter, how gravity affects the expansion): <strong>it would {GRAVITY_GUESS_TEXT[guesses.gravity]}</strong>. The number it is about is in Table 1, row (a).
            </li>
            <li>
              <strong>Guess 2</strong> (if the expansion were speeding up, how a faraway supernova would look): <strong>it would {LOOKS_GUESS_TEXT[guesses.looks]}</strong>. The number it is about is in Table 1, row (c), and Table 2 at redshift {GUESS_REDSHIFT}.
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: 'rgba(15, 118, 110, 0.08)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#0f766e' }}>A worked example</p>
        <p style={{ margin: '0.5rem 0 0.4rem' }}>
          At redshift {example.redshift}, a matter-only universe puts the supernova at about {fmt0(example.matterOnlyDistanceMpc)} Mpc and the best fit puts it at about {fmt0(example.distanceMpc)} Mpc. Brightness falls with the square of the distance, so its brightness compared with matter-only is ({fmt0(example.matterOnlyDistanceMpc)} ÷ {fmt0(example.distanceMpc)})² ≈{' '}
          {example.brightness.toFixed(2)}.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Remember:</strong> this model treats the universe as flat, with only matter and a constant dark energy, and treats supernovae as equally bright. The best fit is a model, not raw data. It uses the same illustrative Hubble constant as Cosmology 1 (70 km/s/Mpc); the real value is still debated (about 67 to 73).
        </p>
      </div>
    </div>
  )
}
