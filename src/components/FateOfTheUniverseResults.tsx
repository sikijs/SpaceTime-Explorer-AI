import type { ReactNode } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  HUBBLE_RANGE_OLDEST_LIGHT,
  HUBBLE_RANGE_SPACE_TELESCOPES,
  PLANCK_MATTER_SHARE,
  PLANCK_MATTER_SHARE_UNCERTAINTY,
  expansionRateAtSize,
  futureRelativeSize,
  galaxySpeedKmPerS,
  hubbleRateWithinPublishedValues,
  longTermExpansionRate,
  matterContributionAtSize,
  matterShareGapInPlanckUncertainties,
  noDarkEnergyUniverse,
  realUniverse,
  ruleOfSeventy,
  runFateOfTheUniverseExperiment,
  speedUpWithinPublishedRange,
  speedUpYearsAfterBigBang,
  publishedSpeedUpRangeYearsAgo,
} from '../physics/fateOfTheUniverseExperiment'
import type { FarFutureGuess, NextDoublingGuess } from '../physics/fateOfTheUniverseExperiment'
import { universeAgeYears } from '../physics/universeAgeExperiment'
import { FAR_FUTURE_TEXT, GUESS_COLOR, NEXT_DOUBLING_TEXT, YOUR_COLOR } from './FateOfTheUniversePictures'
import { GuessTag, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 10, Part 3: the results (docs/audit/cosmology/10-draft-wording.md, section 5, approved by the owner on 2026-11-16).
// Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page (CLAUDE.md §12,
// §13). Neither guess changes a table. Only the pink column of Table 2 and "What your numbers show" follow Part 2's dark energy share.

export interface FateOfTheUniverseResultsProps {
  guesses: { farFuture: FarFutureGuess; nextDoubling: NextDoublingGuess } | null
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

// Sizes are printed to one decimal place, as in the approved draft (21.3, 424.8, 3.4, 5.2).
const formatSize = (size: number) => size.toFixed(1)
const billions = (years: number, digits = 1) => (years / 1e9).toFixed(digits)
const withCommas = (n: number) => Math.round(n).toLocaleString('en-US')
const BILLION = 1e9

// "6.1 billion years ago", "will start in 0.7 billion years", or "never".
function speedUpText(share: number): string {
  const r = runFateOfTheUniverseExperiment(share)
  if (r.speedUpYearsFromNow === null) return 'Never'
  if (r.speedUpYearsFromNow < 0) return `About ${billions(-r.speedUpYearsFromNow)} billion years ago`
  return `About ${billions(r.speedUpYearsFromNow)} billion years from now`
}
function settleText(share: number, long = false): string {
  const r = runFateOfTheUniverseExperiment(share)
  if (r.longTermDoublingTimeYears === Infinity) return long ? 'No, each one takes longer' : 'they never settle'
  return long ? `Yes, toward ${billions(r.longTermDoublingTimeYears)} billion years` : `they settle toward ${billions(r.longTermDoublingTimeYears)} billion years`
}

export function FateOfTheUniverseResults({ guesses, share }: FateOfTheUniverseResultsProps) {
  const real = realUniverse()
  const none = noDarkEnergyUniverse()
  const you = runFateOfTheUniverseExperiment(share)
  const L = BEST_FIT_DARK_ENERGY_FRACTION
  const pct = Math.round(share * 100)
  const rule = ruleOfSeventy(L)
  const matterShare = 1 - L
  const matterGap = matterShareGapInPlanckUncertainties(matterShare)
  const range = publishedSpeedUpRangeYearsAgo()
  const hubble = hubbleRateWithinPublishedValues(real.expansionRateToday)
  const sizeIn50You = futureRelativeSize(50 * BILLION, share)
  const sizeIn50Real = futureRelativeSize(50 * BILLION, L)
  const speedToday = galaxySpeedKmPerS(100, 1, share)
  const speedIn50 = galaxySpeedKmPerS(100, sizeIn50You, share)
  const rateIn50 = expansionRateAtSize(sizeIn50You, share)
  const matterIn50 = matterContributionAtSize(sizeIn50You, share)
  const totalIn50 = matterIn50 + share
  const compare = share > L ? 'more' : share < L ? 'less' : 'the same'

  return (
    <div style={{ fontSize: '0.875rem' }}>
      {guesses && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (the far future of the real universe): <strong>{FAR_FUTURE_TEXT[guesses.farFuture]}</strong>. The numbers it is about are in Table 2, in the &ldquo;size in 50 and 100 billion years&rdquo; rows, in the &ldquo;real universe&rdquo; column. <GuessTag />
            </li>
            <li>
              <strong>Guess 2</strong> (the next doubling): <strong>{NEXT_DOUBLING_TEXT[guesses.nextDoubling]}</strong>. The number it is about is in Table 2, in the &ldquo;first four doublings&rdquo; row, second figure, in the &ldquo;real universe&rdquo; column. <GuessTag />
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}

      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: Check-up, this model against published values (none of these rows depends on your Part 2 choice)</p>
      <Table heads={['What we compare', 'This model', 'Published', 'Reading']}>
        <tr>
          <td style={cell}>(a) The matter share of the universe</td>
          <td style={cell}>{matterShare.toFixed(2)} (dark energy {L.toFixed(2)}, rounded, for this page)</td>
          <td style={cell}>
            {PLANCK_MATTER_SHARE} ± {PLANCK_MATTER_SHARE_UNCERTAINTY} (Planck 2018); dark energy about {(1 - PLANCK_MATTER_SHARE).toFixed(3)} if the universe is exactly flat (our arithmetic)
          </td>
          <td style={cell}>
            <strong>
              {Math.abs(matterShare - PLANCK_MATTER_SHARE).toFixed(3)} {matterShare < PLANCK_MATTER_SHARE ? 'below' : 'above'} Planck&rsquo;s value, about {Math.round(Math.abs(matterGap))} of Planck&rsquo;s stated uncertainties
            </strong>
            ; the page&rsquo;s split is a rounded, illustrative one
          </td>
        </tr>
        <tr>
          <td style={cell}>(b) When the expansion began to speed up</td>
          <td style={cell}>
            {billions(-(real.speedUpYearsFromNow ?? 0))} billion years ago ({billions(speedUpYearsAfterBigBang(L) ?? 0)} billion years after the Big Bang)
          </td>
          <td style={cell}>about 5 to 6 billion years ago (NASA, 2006); about 7.5 billion years ago (NASA, 2023); 9 billion years after the universe began (NASA, 2026)</td>
          <td style={cell}>
            <strong>the published figures differ among themselves; the model&rsquo;s is {speedUpWithinPublishedRange(L) ? 'within the spread' : 'outside the spread'}</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(c) The expansion rate today</td>
          <td style={cell}>{real.expansionRateToday.toFixed(0)} km/s per megaparsec</td>
          <td style={cell}>
            about {HUBBLE_RANGE_SPACE_TELESCOPES[0]} to {HUBBLE_RANGE_SPACE_TELESCOPES[1]} (space telescopes) and about {HUBBLE_RANGE_OLDEST_LIGHT[0]} to {HUBBLE_RANGE_OLDEST_LIGHT[1]} (the oldest light), NASA 2025
          </td>
          <td style={cell}>
            <strong>{hubble.any ? 'within the published values' : 'outside the published values'}</strong>; the &ldquo;Hubble tension&rdquo; is that they disagree
          </td>
        </tr>
        <tr>
          <td style={cell}>(d) The settled doubling time, exact against a rule of thumb</td>
          <td style={cell}>{billions(rule.exactDoublingTimeYears, 2)} billion years (exact)</td>
          <td style={cell}>
            {billions(rule.doublingTimeYears)} billion years from the rule &ldquo;doubling time = 70 ÷ percent growth per billion years&rdquo; (about {rule.percentGrowthPerBillionYears.toFixed(1)} percent), a rough rule, not a published value
          </td>
          <td style={cell}>
            <strong>the same, to about {Math.round(rule.gapPercent ?? 0)} percent</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(e) The size in 50 and 100 billion years, and the four doublings</td>
          <td style={cell}>
            {formatSize(sizeIn50Real)}× and {formatSize(real.sizeAtEnd)}×; {real.doublings.map((d) => billions(d.years)).join(', ')} billion years
          </td>
          <td style={cell}>none: calculated here only</td>
          <td style={cell}>
            <strong>not a measurement</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(f) Whether dark energy is constant</td>
          <td style={cell}>assumed to be</td>
          <td style={cell}>
            DESI, March 2025: a changing dark energy favoured at 3.1σ; Dark Energy Survey, January 2026: fits &ldquo;no better&rdquo; than the standard model; DESI Lyman-alpha, July 2026: agrees with the standard model, hints &ldquo;may fade away&rdquo;
          </td>
          <td style={cell}>
            <strong>not settled</strong>
          </td>
        </tr>
      </Table>
      <Note title="What this table tells us">
        <li>
          <strong>(a)</strong> <em>What it is:</em> the page&rsquo;s split of matter and dark energy beside Planck&rsquo;s measured matter share. <em>What it means:</em> {matterShare.toFixed(2)} against {PLANCK_MATTER_SHARE} ± {PLANCK_MATTER_SHARE_UNCERTAINTY}. <em>Why it matters:</em> every number on this page depends on the split, so it is good to know it is a little rounded. <em>How sure:</em> Planck&rsquo;s abstract does not print dark energy, so {(1 - PLANCK_MATTER_SHARE).toFixed(3)} is our subtraction for a flat universe.
        </li>
        <li>
          <strong>(b)</strong> <em>What it is:</em> when the model says the expansion changed from slowing down to speeding up. <em>What it means:</em> {billions(-(real.speedUpYearsFromNow ?? 0), 2)} billion years ago. <em>Why it matters:</em> it is one of the model&rsquo;s few results that can be compared with the sky. <em>How sure:</em> NASA&rsquo;s own figures differ, from about {billions(range.minYears)} to {billions(range.maxYears)} billion years ago (the 2026 page&rsquo;s &ldquo;9 billion years after the universe began&rdquo; is about 5 billion years ago if the universe is about 13.8 billion years old: our arithmetic), so no single published value is given; the model&rsquo;s matched-today universe is {billions(universeAgeYears(L), 2)} billion years old.
        </li>
        <li>
          <strong>(c)</strong> <em>What it is:</em> the expansion rate used for every universe here. <em>What it means:</em> {real.expansionRateToday.toFixed(0)} sits inside the published values. <em>Why it matters:</em> it sets the time scale of the whole experiment. <em>How sure:</em> the values disagree depending on how they are measured, so {real.expansionRateToday.toFixed(0)} is illustrative.
        </li>
        <li>
          <strong>(d)</strong> <em>What it is:</em> how long the universe takes to double once the early, matter-dominated stage has passed. <em>What it means:</em> the exact {billions(rule.exactDoublingTimeYears, 2)} against {billions(rule.doublingTimeYears)} from a rule used for savings accounts. <em>Why it matters:</em> it is a check inside the page&rsquo;s own arithmetic. <em>How sure:</em> the rule is only rough.
        </li>
        <li>
          <strong>(e)</strong> <em>What it is:</em> what the model gives for the future. <em>What it means:</em> no measured value exists. <em>Why it matters:</em> it is what the model gives, not a prediction.
        </li>
        <li>
          <strong>(f)</strong> <em>What it is:</em> the biggest assumption on the page. <em>What it means:</em> recent results do not agree. <em>Why it matters:</em> if dark energy changed, the future could be very different. <em>How sure:</em> the question is open, as of November 2026.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', margin: '1.25rem 0 0.25rem' }}>Table 2: The real universe, no dark energy, and yours (calculated here; the pink column follows your Part 2 choice)</p>
      <Table heads={['', 'The real universe (70%)', 'No dark energy (0%)', <span key="y" style={{ color: YOUR_COLOR }}>Your universe ({pct}%)</span>]}>
        <tr>
          <td style={cell}>The size in 50 billion years</td>
          <td style={cell}>
            <strong>{formatSize(sizeIn50Real)}× today&rsquo;s</strong>
            {guesses && <GuessTag />}
          </td>
          <td style={cell}>{formatSize(futureRelativeSize(50 * BILLION, 0))}×</td>
          <td style={cell}>{formatSize(sizeIn50You)}×</td>
        </tr>
        <tr>
          <td style={cell}>The size in 100 billion years</td>
          <td style={cell}>
            <strong>{formatSize(real.sizeAtEnd)}×</strong>
            {guesses && <GuessTag />}
          </td>
          <td style={cell}>{formatSize(none.sizeAtEnd)}×</td>
          <td style={cell}>{formatSize(you.sizeAtEnd)}×</td>
        </tr>
        <tr>
          <td style={cell}>The first four doublings take (billion years)</td>
          <td style={cell}>
            <strong>{real.doublings.map((d) => billions(d.years)).join(', ')}</strong>
            {guesses && <GuessTag />}
          </td>
          <td style={cell}>{none.doublings.map((d) => billions(d.years)).join(', ')}</td>
          <td style={cell}>{you.doublings.map((d) => billions(d.years)).join(', ')}</td>
        </tr>
        <tr>
          <td style={cell}>Do the doublings settle?</td>
          <td style={cell}>{settleText(L, true)}</td>
          <td style={cell}>{settleText(0, true)}</td>
          <td style={cell}>{settleText(share, true)}</td>
        </tr>
        <tr>
          <td style={cell}>Is the expansion speeding up today?</td>
          <td style={cell}>{real.accelerationToday ? 'Yes' : 'No, it is still slowing down'}</td>
          <td style={cell}>{none.accelerationToday ? 'Yes' : 'No, it is still slowing down'}</td>
          <td style={cell}>{you.accelerationToday ? 'Yes' : 'No, it is still slowing down'}</td>
        </tr>
        <tr>
          <td style={cell}>When the expansion starts speeding up</td>
          <td style={cell}>{speedUpText(L)}</td>
          <td style={cell}>{speedUpText(0)}</td>
          <td style={cell}>{speedUpText(share)}</td>
        </tr>
        <tr>
          <td style={cell}>The expansion rate today, and after 100 billion years</td>
          <td style={cell}>
            {real.expansionRateToday.toFixed(1)} and {real.expansionRateAtEnd.toFixed(1)} km/s per megaparsec
          </td>
          <td style={cell}>
            {none.expansionRateToday.toFixed(1)} and {none.expansionRateAtEnd.toFixed(1)}
          </td>
          <td style={cell}>
            {you.expansionRateToday.toFixed(1)} and {you.expansionRateAtEnd.toFixed(1)}
          </td>
        </tr>
        <tr>
          <td style={cell}>The value it settles toward</td>
          <td style={cell}>{real.longTermExpansionRate.toFixed(1)} km/s per megaparsec</td>
          <td style={cell}>Zero (it keeps falling, but never reaches it)</td>
          <td style={cell}>{you.longTermExpansionRate === 0 ? 'Zero (it keeps falling, but never reaches it)' : `${you.longTermExpansionRate.toFixed(1)} km/s per megaparsec`}</td>
        </tr>
      </Table>
      {guesses && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>The tags mark where each guess is about. They show the guess only, not whether it is right.</p>}
      <Note title="What this table tells us">
        <li>
          <em>What it is:</em> the model&rsquo;s future for the real universe, for none, and for your choice.
        </li>
        <li>
          <em>What it means with the real numbers:</em> the real universe is {formatSize(sizeIn50Real)} times its size in 50 billion years against {formatSize(futureRelativeSize(50 * BILLION, 0))} times with no dark energy; its doublings take {billions(real.doublings[0].years)} to {billions(real.doublings[3].years)} billion years against {withCommas(none.doublings[0].years / BILLION)} to {withCommas(none.doublings[3].years / BILLION)} for none.
        </li>
        <li>
          <em>Why it matters:</em> it puts the whole question in one table: how the future changes with the dark energy.
        </li>
        <li>
          <em>How sure:</em> these are what the model gives for a constant dark energy, not a prediction of how the real universe will end.
        </li>
      </Note>

      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', border: `1px solid ${YOUR_COLOR}`, borderRadius: '6px' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What your numbers show.</strong> With <strong>{pct}% dark energy</strong>, your universe is <strong>{formatSize(sizeIn50You)}×</strong> its size today in 50 billion years and <strong>{formatSize(you.sizeAtEnd)}×</strong> in 100 billion. Its first four doublings take <strong>{you.doublings.map((d) => billions(d.years)).join(', ')}</strong> billion years, and {settleText(share)}.{' '}
          {you.accelerationToday
            ? 'It is already speeding up today.'
            : you.speedUpYearsFromNow === null
              ? 'It never speeds up.'
              : `It is still slowing down today, and the speed-up starts in about ${billions(you.speedUpYearsFromNow)} billion years.`}{' '}
          Compared with the real universe (70%): {compare === 'the same' ? 'the same dark energy, so the same future' : `${compare} dark energy, so ${compare === 'more' ? 'a faster' : 'a slower'} future`}.
        </p>
        <p style={{ margin: 0 }}>
          <strong>These are trial values and your own numbers. They do not say the real universe is like that.</strong>
        </p>
      </div>

      <p style={{ marginTop: '1.25rem', marginBottom: '0.5rem' }}>
        <strong>What the expansion rate means for a galaxy&rsquo;s speed.</strong> Take a galaxy 100 megaparsecs away today. It moves away at {expansionRateAtSize(1, share).toFixed(0)} × 100 = {withCommas(speedToday)} kilometers per second. After 50 billion years the expansion rate is {rateIn50.toFixed(1)}, and that galaxy is {formatSize(sizeIn50You)} times farther away, so it moves away at about {withCommas(speedIn50)} kilometers per second. A galaxy&rsquo;s speed is the expansion rate times its distance.{' '}
        {speedIn50 > speedToday
          ? 'The rate has fallen, but it acts on a much larger distance, so the speed has still gone up: the expansion is speeding up even though the rate has dropped.'
          : 'Here the rate falls by more than the distance grows, so the speed goes down: the expansion is slowing down.'}{' '}
        (Far enough away, such speeds can be larger than the speed of light without breaking relativity, because it is space stretching, not motion through space, as in Cosmology 8.)
      </p>

      <p style={{ marginBottom: '0.5rem' }}>
        <strong>Why the expansion rate is what it is.</strong> The expansion rate depends on what the universe contains. In this model, you take two contributions, add them, and then take a square root: <strong>expansion rate = today&rsquo;s rate × the square root of (matter&rsquo;s contribution + dark energy&rsquo;s contribution)</strong>. (The square root is just how this model combines the two. All you need is that the rate goes up when either contribution goes up, and down when either goes down.)
      </p>
      <p style={{ marginBottom: '0.5rem' }}>
        Today, matter&rsquo;s contribution is {(1 - share).toFixed(2)} and dark energy&rsquo;s is {share.toFixed(2)}, and together they make 1.00. The square root of 1.00 is 1, so the rate is {expansionRateAtSize(1, share).toFixed(0)} × 1 = <strong>{expansionRateAtSize(1, share).toFixed(0)}</strong>. After 50 billion years, matter&rsquo;s contribution has shrunk to about {matterIn50.toFixed(5)} and dark energy&rsquo;s is {share.toFixed(2)}. The total is about {totalIn50.toFixed(share === 0 ? 4 : 2)}, and the rate is {expansionRateAtSize(1, share).toFixed(0)} × √{totalIn50.toFixed(share === 0 ? 4 : 2)} ≈ <strong>{rateIn50.toFixed(1)}</strong>.{' '}
        {share > 0
          ? `The floor the rate settles to is today's rate × √(dark energy's share) = ${expansionRateAtSize(1, share).toFixed(0)} × √${share.toFixed(2)} ≈ ${you.longTermExpansionRate.toFixed(1)}.`
          : 'With no dark energy there is no floor: the rate keeps falling toward zero, and never quite reaches it.'}
      </p>
      <p style={{ marginBottom: '0.25rem' }}>The share sets the floor, so changing the dark energy changes where the rate settles:</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
        {[0.9, BEST_FIT_DARK_ENERGY_FRACTION, 0.33].map((x) => (
          <li key={x}>
            {Math.round(x * 100)}% dark energy: {expansionRateAtSize(1, x).toFixed(0)} × √{x.toFixed(2)} ≈ <strong>{longTermExpansionRate(x).toFixed(1)}</strong>
            {x === 0.9 ? ' (a high floor, so the rate barely drops)' : ''}
          </li>
        ))}
        <li>
          No dark energy: there is no floor. The rate keeps falling toward zero ({none.expansionRateAtEnd.toFixed(1)} after 100 billion years), and never quite reaches it.
        </li>
      </ul>

      <div style={{ margin: '0.75rem 0', padding: '0.75rem 1rem', border: '2px solid #f59e0b', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What this model can and cannot tell you.</strong> Everything above depends on one assumption: that dark energy is a constant that never changes. That is the simplest possibility and many measurements fit it, but it is being tested, and recent results do not agree (see Table 1, row (f)). Nobody yet knows what dark energy actually is. If it changed with time, the future could be very different. So this is what the model gives for a constant dark energy, not a prediction of how the real universe will end.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The model covers only how the size of the universe changes. It does not say anything about stars, black holes, or the universe becoming cold and dark. It also assumes the universe is flat. Other endings are possible if the dark energy changed over time, or the universe were not flat: a collapse back together (a &ldquo;Big Crunch&rdquo;, in which, as NASA&rsquo;s page puts it, the universe &ldquo;implodes or compresses&rdquo;), or a runaway stretching that tears even galaxies apart (a &ldquo;Big Rip&rdquo;). This model cannot say anything about them. The 100 billion years on the graph is only the range of the axis, not a prediction of any event.
        </p>
      </div>

      <p style={{ marginBottom: '0.25rem' }}>
        <strong>What this model simplifies.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
        <li>It is the same simplified universe as Cosmology 5, 6, 8 and 9: flat, with matter and a constant dark energy, an illustrative Hubble constant of 70, and no light or other very fast particles.</li>
        <li>
          Every universe is matched to the real one today (same expansion rate and size), so a universe with no dark energy is only {billions(universeAgeYears(0))} billion years old today in this comparison, as in Cosmology 6.
        </li>
        <li>Things held together by their own gravity, such as our galaxy and its neighbors, do not expand. In the drawing, only the space between groups stretches. The drawing is a schematic illustration and not to scale.</li>
      </ul>
    </div>
  )
}
