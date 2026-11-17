import type { ReactNode } from 'react'
import {
  BLACK_HOLE_PRESETS,
  COMPARISON_DISTANCE_IN_HORIZON_RADII,
  FAR_CLOCK_RUN_SECONDS,
  SECONDS_PER_YEAR,
  gpsCheckUpRow,
  percentTooHigh,
  readAgainst,
  runTimeNearBlackHoleExperiment,
  simpleAgainstExactRows,
  surfaceSlowing,
  timesAsMuch,
  twoHolesAtTwoRadii,
} from '../physics/timeNearBlackHoleExperiment'
import type {
  ApproximationGuess,
  JustOutsideGuess,
  MassGuess,
  TimeNearBlackHoleResult,
} from '../physics/timeNearBlackHoleExperiment'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'
import {
  approximationLabel,
  formatDistance,
  formatDuration,
  formatLength,
  formatMass,
  formatNumber,
  formatPercent,
  formatRadii,
  formatSlowing,
  formatSmall,
  justOutsideLabel,
  massLabel,
} from './TimeNearBlackHolePictures'

// Black Holes, Experiment 2 (audit update): Part 3, the results. Nothing here changes with a guess. The guesses are shown beside the
// results, never marked right or wrong (that is the tutor's job, CLAUDE.md §12, §13). Every number comes from the physics module; the
// interface only shows it and does the plain arithmetic of a worked example on module values.

const cell = { padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' } as const
const headCell = { ...cell, textAlign: 'left', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-color, #ccc)' } as const
const tableStyle = { fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' } as const
const tableLead = { fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' } as const

function Note({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
        <strong>What this table tells us</strong>
      </p>
      {children}
    </div>
  )
}

function Scroll({ children }: { children: ReactNode }) {
  return <div style={{ overflowX: 'auto', maxWidth: '100%' }}>{children}</div>
}

export interface TimeNearBlackHoleResultsProps {
  partOne: TimeNearBlackHoleResult
  justOutsideGuess: JustOutsideGuess
  massGuess: MassGuess
  approximationGuess: ApproximationGuess
  partTwo: TimeNearBlackHoleResult | null
}

export function TimeNearBlackHoleResults({
  partOne,
  justOutsideGuess,
  massGuess,
  approximationGuess,
  partTwo,
}: TimeNearBlackHoleResultsProps) {
  const checkUp = simpleAgainstExactRows()
  const gps = gpsCheckUpRow()
  const holesAtTwo = BLACK_HOLE_PRESETS.map((p) => runTimeNearBlackHoleExperiment(p.id, COMPARISON_DISTANCE_IN_HORIZON_RADII))
  const { small, giant } = twoHolesAtTwoRadii()
  const surfaces = (
    [
      ['Earth', 'earth'],
      ['The Sun', 'sun'],
      ['A neutron star', 'neutron-star'],
    ] as const
  ).map(([label, id]) => ({ label, ...surfaceSlowing(id) }))
  const d1 = partOne.distanceInHorizonRadii
  const massRatioMillions = Math.round(giant.preset.massSolarMasses / small.preset.massSolarMasses / 1e6)
  const ten = checkUp[0]
  const two = checkUp[1]
  const near = checkUp[2]
  const farSecondsPerHoveringSecond = 1 / partOne.exactFactor
  const videoSeconds = FAR_CLOCK_RUN_SECONDS / partOne.exactFactor
  const comparedWithPartOne = partTwo ? readAgainst(partTwo.exactFactor, partOne.exactFactor) : null
  const versusPartOne = comparedWithPartOne === 'the same' ? 'the same as' : `${comparedWithPartOne} than`

  return (
    <div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>How to read these tables.</strong> A table of science numbers is a bit like a blood test: the numbers mean little until someone says
          what each one is. So under every table there is a note called “What this table tells us”. It has four parts: <strong>what it is</strong>,{' '}
          <strong>what it means</strong> with the real numbers, <strong>why it matters</strong>, and <strong>how sure we are</strong> of the numbers.
        </p>
        <ul style={listStyle}>
          <li>
            <strong>Table 1</strong> checks the simple formula from the earlier experiments against the exact one.
          </li>
          <li>
            <strong>Table 2</strong> gives the numbers behind the run you watched in Part 1.
          </li>
          <li>
            <strong>Table 3</strong> gives the same distance, in horizon radii, around the three black holes.
          </li>
          <li>
            <strong>Table 4</strong> gives the numbers for your own run from Part 2.
          </li>
          <li>
            <strong>Table 5</strong> shows the same effect on real objects, from the Earth to a neutron star.
          </li>
        </ul>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The words “the same”, “more” and “less” are this page’s own, not an official scale. The numbers beside them say how much. Where a number is
          calculated here and has not been measured, the note says so.
        </p>
      </div>

      <div
        style={{
          margin: '0 0 1.25rem',
          padding: '0.75rem 1rem',
          border: '1px solid #ffffff',
          borderRadius: '8px',
          backgroundColor: '#0b1020',
          color: '#e2e8f0',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Your guesses, beside the results.</strong> They are shown as you made them, and nothing here says whether they are right.
          The tutor does that. To compare, find the row with the white “your guess” tag and look at its numbers.
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Guess 1:</strong> {justOutsideLabel(justOutsideGuess)}. The question was: how fast does a clock tick when it hovers only 1%
            beyond the horizon? Its number is the slowing factor in Table 2. <GuessTag />
          </li>
          <li>
            <strong>Guess 2:</strong> {massLabel(massGuess)}. The question was: which of two clocks at {COMPARISON_DISTANCE_IN_HORIZON_RADII}{' '}
            horizon radii ticks more slowly, one near a small black hole and one near a giant one? Its numbers are the two factors in Table 3.{' '}
            <GuessTag />
          </li>
          <li>
            <strong>Guess 3:</strong> {approximationLabel(approximationGuess)}. The question was: will the simple formula still be accurate
            next to a horizon? Its numbers are the rows of Table 1. <GuessTag />
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: A check-up on the simple formula</h4>
      <p style={tableLead}>
        Each row sets what we expect (the exact answer, or NIST’s published figure) beside what the simple formula gives, with a plain reading.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>What we compared</th>
              <th style={headCell}>Expected</th>
              <th style={headCell}>The simple formula gives</th>
              <th style={headCell}>Reading</th>
            </tr>
          </thead>
          <tbody>
            {checkUp.map((r) => (
              <tr key={r.distanceInHorizonRadii}>
                <td style={cell}>
                  At {formatRadii(r.distanceInHorizonRadii)} horizon radii <GuessTag />
                </td>
                <td style={cell}>the exact factor, {r.exact.toFixed(4)}</td>
                <td style={cell}>
                  <strong>{r.simple.toFixed(4)}</strong>
                </td>
                <td style={cell}>
                  <strong>{r.reading}</strong>: {formatNumber(r.percentMore)}% more
                  {r.timesAsMuch >= 2 ? `, ${formatNumber(r.timesAsMuch)} times as large` : ''}
                </td>
              </tr>
            ))}
            <tr>
              <td style={cell}>The gravity-only effect on a GPS satellite’s clock, in microseconds per day</td>
              <td style={cell}>{gps.published}, as NIST publishes it</td>
              <td style={cell}>
                <strong>{gps.found.toFixed(1)}</strong>
              </td>
              <td style={cell}>
                <strong>{gps.reading}</strong>: {formatNumber(gps.percentDifference)}% more
              </td>
            </tr>
          </tbody>
        </table>
      </Scroll>
      <p style={smallNote}>
        The exact factor is calculated here from the formula given in the words box. The published GPS figure is NIST’s “Putting Einstein to the
        Test” (updated 17 April 2025), read on 2026-11-16; it gives a whole number.
      </p>
      <Note>
        <ul style={listStyle}>
          <li>
            <strong>What it is.</strong> A comparison of two ways to work out the same thing: how much gravity slows a clock. The{' '}
            <strong>exact</strong> formula, from Einstein’s general theory of relativity, is the one behind Pictures 1 to 3. The <strong>simple</strong>{' '}
            formula is the first-order one from Gravity and Curved Spacetime, Experiments 2 and 9. The last row compares the simple formula with the one
            figure NIST publishes for GPS satellites.
          </li>
          <li>
            <strong>What it means, with the real numbers.</strong> A worked example at 10 horizon radii. The exact factor is √(1 − 1 ÷ 10) = √0.9 ={' '}
            {ten.exact.toFixed(4)}. The simple formula gives 1 − 1 ÷ (2 × 10) = 1 − 0.05 = {ten.simple.toFixed(4)}. The simple value is{' '}
            {(ten.simple - ten.exact).toFixed(4)} higher, and {(ten.simple - ten.exact).toFixed(4)} ÷ {ten.exact.toFixed(4)} ={' '}
            {formatNumber(ten.percentMore)}% of the exact value. The same steps at 2 horizon radii give {two.exact.toFixed(4)} and{' '}
            {two.simple.toFixed(4)}, which is {formatNumber(two.percentMore)}% more. At {formatRadii(near.distanceInHorizonRadii)} they give{' '}
            {near.exact.toFixed(4)} and {near.simple.toFixed(4)}: {formatNumber(near.percentMore)}% more, or {formatNumber(near.timesAsMuch)} times as large. For GPS, the simple formula gives{' '}
            {gps.found.toFixed(1)} microseconds per day, {formatNumber(gps.percentDifference)}% more than NIST’s whole number 45.
          </li>
          <li>
            <strong>A comparison from daily life.</strong> A rule of thumb such as “allow 20 minutes for every mile” is a good guide for a walk on
            level ground and a poor one for a steep mountain climb. A shortcut is accurate where it was made to be used. The simple formula was made for
            weak gravity, such as the Earth’s.
          </li>
          <li>
            <strong>Why it matters.</strong> It shows how far a formula made for weak gravity can be trusted, and where it cannot. It is the check that
            your third guess is drawn beside.
          </li>
          <li>
            <strong>How sure is the number?</strong> The exact formula has been tested by clocks on Earth and by light from a star near our galaxy’s black
            hole, but never at a horizon. The rows at 2 and {formatRadii(near.distanceInHorizonRadii)} are calculated here, not measured. NIST gives only a
            whole number, 45, and the simple formula gives {gps.found.toFixed(1)}, which would round to {Math.round(gps.found)}: they differ by about{' '}
            {(gps.found - gps.published).toFixed(1)} microseconds per day ({formatNumber(gps.percentDifference)}%). This page does not claim more than the numbers say.
          </li>
        </ul>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: Part 1’s run</h4>
      <p style={tableLead}>The numbers behind Pictures 1 to 3, for the run you watched.</p>
      <Scroll>
        <table style={tableStyle}>
          <tbody>
            {[
              ['The black hole', `${partOne.preset.label} (${formatMass(partOne.preset.massSolarMasses)})`],
              ['The hovering clock’s distance', `${formatRadii(d1)} horizon radii (${formatDistance(partOne.distanceKm)} from the center)`],
              ['The far-away clock read', `${partOne.farClockReadingSeconds.toFixed(2)} s`],
              ['The hovering clock read', `${partOne.hoveringClockReadingSeconds.toFixed(2)} s`],
              [
                'The slowing factor (hovering rate ÷ far-away rate)',
                `${partOne.exactFactor.toFixed(4)}, so the hovering clock ticks at ${formatPercent(partOne.exactFactor * 100)} of the far-away rate`,
              ],
              [
                'What the simple formula gives at this distance',
                `${partOne.firstOrderFactor.toFixed(4)}, which is ${formatNumber(percentTooHigh(d1))}% more (${formatNumber(timesAsMuch(d1))} times as large)`,
              ],
            ].map(([label, value], i) => (
              <tr key={label}>
                <td style={cell}>
                  {label}
                  {i === 4 && <GuessTag />}
                </td>
                <td style={{ ...cell, paddingRight: 0 }}>
                  <strong>{value}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <ul style={listStyle}>
          <li>
            <strong>What it is.</strong> A record of the run in Part 1: which black hole, where the hovering clock was, what both clocks read, and the
            slowing factor. It never changes with your guesses.
          </li>
          <li>
            <strong>What it means, with the real numbers.</strong> The factor is √(1 − r_s ÷ r) = √(1 − 1 ÷ {formatRadii(d1)}) = √{formatSmall(1 - 1 / d1)} ={' '}
            {formatSmall(partOne.exactFactor)}. In {FAR_CLOCK_RUN_SECONDS} seconds on the far-away clock, the hovering clock registers{' '}
            {formatSmall(partOne.exactFactor)} × {FAR_CLOCK_RUN_SECONDS} = {partOne.hoveringClockReadingSeconds.toFixed(2)} seconds. Turned around:{' '}
            1 ÷ {formatSmall(partOne.exactFactor)} = {farSecondsPerHoveringSecond.toFixed(2)}, so about {Math.round(farSecondsPerHoveringSecond)} seconds
            pass on the far-away clock for every second on the hovering one.
          </li>
          <li>
            <strong>A comparison from daily life.</strong> It is like watching a video in slow motion. Played at the hovering clock’s rate, a{' '}
            {FAR_CLOCK_RUN_SECONDS}-second video would last {FAR_CLOCK_RUN_SECONDS} ÷ {formatSmall(partOne.exactFactor)} ={' '}
            {formatNumber(videoSeconds)} seconds, about {Math.round(videoSeconds / 60)} minutes.
          </li>
          <li>
            <strong>Why it matters.</strong> It is the number that your first guess is drawn beside in Picture 2.
          </li>
          <li>
            <strong>How sure is the number?</strong> It is calculated from a formula that has not been tested at this distance. The mass of the black
            hole is a round, illustrative 10 Suns.
          </li>
        </ul>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: The same distance around three black holes</h4>
      <p style={tableLead}>
        One clock held {COMPARISON_DISTANCE_IN_HORIZON_RADII} horizon radii from the center of each black hole, after {FAR_CLOCK_RUN_SECONDS} seconds on the
        far-away clock.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Black hole', 'Mass', 'Distance from its center', 'Slowing factor', 'Hovering clock reads'].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holesAtTwo.map((r) => (
              <tr key={r.preset.id}>
                <td style={cell}>
                  {r.preset.label} <GuessTag />
                </td>
                <td style={cell}>{formatMass(r.preset.massSolarMasses)}</td>
                <td style={cell}>
                  {formatRadii(COMPARISON_DISTANCE_IN_HORIZON_RADII)} horizon radii = {formatDistance(r.distanceKm)}
                </td>
                <td style={cell}>
                  <strong>{r.exactFactor.toFixed(4)}</strong>
                </td>
                <td style={cell}>
                  <strong>{r.hoveringClockReadingSeconds.toFixed(2)} s</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <ul style={listStyle}>
          <li>
            <strong>What it is.</strong> The slowing factor for a clock held {COMPARISON_DISTANCE_IN_HORIZON_RADII} horizon radii from the center of each
            of the three black holes of Black Holes 1: the stellar one, Sagittarius A* and M87*.
          </li>
          <li>
            <strong>What it means, with the real numbers.</strong> The three factors are {holesAtTwo.map((r) => r.exactFactor.toFixed(4)).join(', ')}, and
            the three hovering clocks read {holesAtTwo.map((r) => r.hoveringClockReadingSeconds.toFixed(2)).join(' s, ')} s after{' '}
            {FAR_CLOCK_RUN_SECONDS} seconds. The masses differ enormously: M87* is {massRatioMillions} million times as heavy as the 10-Sun black hole, and
            the clocks are {formatLength(small.distanceKm)}, {formatLength(holesAtTwo[1].distanceKm)} and {formatLength(giant.distanceKm)} from their
            centers.
          </li>
          <li>
            <strong>Why it matters.</strong> It is the real comparison that your second guess is drawn beside in Picture 2b. Look at the “Mass”,
            “Distance” and “Slowing factor” columns together.
          </li>
          <li>
            <strong>How sure is the number?</strong> Calculated here, not measured. The masses are rounded values from Black Holes 1: Sagittarius A* uses
            4.3 million Suns, a little more than ESO’s “four million”.
          </li>
        </ul>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 4: Your own run in Part 2</h4>
      {partTwo === null ? (
        <p style={{ ...smallNote, fontWeight: 'bold' }}>
          Not run yet. Choose a black hole and a distance in Part 2 and press its Run button; your numbers appear here, with a note about what they show.
        </p>
      ) : (
        <>
          <p style={tableLead}>The numbers behind Pictures 4 to 6, for the black hole and distance you chose.</p>
          <Scroll>
            <table style={tableStyle}>
              <tbody>
                {[
                  ['The black hole', `${partTwo.preset.label} (${formatMass(partTwo.preset.massSolarMasses)})`],
                  [
                    'The hovering clock’s distance',
                    `${formatRadii(partTwo.distanceInHorizonRadii)} horizon radii (${formatDistance(partTwo.distanceKm)} from the center)`,
                  ],
                  ['The far-away clock read', `${partTwo.farClockReadingSeconds.toFixed(2)} s`],
                  ['The hovering clock read', `${partTwo.hoveringClockReadingSeconds.toFixed(2)} s`],
                  [
                    'The slowing factor',
                    `${partTwo.exactFactor.toFixed(4)}, so the hovering clock ticks at ${formatPercent(partTwo.exactFactor * 100)} of the far-away rate`,
                  ],
                  [
                    'What the simple formula gives',
                    `${partTwo.firstOrderFactor.toFixed(4)}, which is ${formatNumber(percentTooHigh(partTwo.distanceInHorizonRadii))}% more${
                      timesAsMuch(partTwo.distanceInHorizonRadii) >= 2 ? `, ${formatNumber(timesAsMuch(partTwo.distanceInHorizonRadii))} times as large` : ''
                    }`,
                  ],
                  [
                    'Compared with Part 1’s run (factor ' + partOne.exactFactor.toFixed(4) + ')',
                    `your factor is ${versusPartOne} Part 1’s (${partTwo.exactFactor.toFixed(4)} against ${partOne.exactFactor.toFixed(4)})`,
                  ],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={cell}>{label}</td>
                    <td style={{ ...cell, paddingRight: 0 }}>
                      <strong>{value}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>
          <Note>
            <ul style={listStyle}>
              <li>
                <strong>What it is.</strong> The numbers behind Pictures 4 to 6 for the run you chose. Your guesses do not change it; your settings do.
              </li>
              <li>
                <strong>What it means, with the real numbers.</strong> At {formatRadii(partTwo.distanceInHorizonRadii)} horizon radii the factor is{' '}
                √(1 − 1 ÷ {formatRadii(partTwo.distanceInHorizonRadii)}) = √{formatSmall(1 - 1 / partTwo.distanceInHorizonRadii)} ={' '}
                {formatSmall(partTwo.exactFactor)}, so {FAR_CLOCK_RUN_SECONDS} seconds on the far-away clock become{' '}
                {partTwo.hoveringClockReadingSeconds.toFixed(2)} seconds on the hovering one. Part 1’s run gave {formatSmall(partOne.exactFactor)}, so your factor is{' '}
                {versusPartOne} Part 1’s.
              </li>
              <li>
                <strong>Why it matters.</strong> Try a second distance and a second black hole, and compare this table with the last run. Picture 5’s lines
                already cover every distance; each run you make reads one point off them.
              </li>
              <li>
                <strong>These are trial values.</strong> They are your own numbers, not a claim that a real clock was placed there. They are calculated here from the
                same formula as everything else on this page.
              </li>
            </ul>
          </Note>
        </>
      )}

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 5: The same effect on real objects</h4>
      <p style={tableLead}>
        For a clock at rest on the surface of a real object, compared with a clock far away, the same formula gives these rates.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Object', 'How far out, in horizon radii', 'Slowing compared with far away', 'Over a year'].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {surfaces.map((row) => (
              <tr key={row.label}>
                <td style={cell}>{row.label}</td>
                <td style={cell}>about {formatNumber(1 / row.rsOverR)}</td>
                <td style={cell}>
                  <strong>{formatSlowing(row.fractionSlower)}</strong>
                </td>
                <td style={cell}>about {formatDuration(row.fractionSlower * SECONDS_PER_YEAR)} behind</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <ul style={listStyle}>
          <li>
            <strong>What it is.</strong> The same slowing as in the tables above, worked out for the surface of the Earth, the Sun and a neutron star. “How far out”
            is the surface’s distance from the object’s center in horizon radii (from Black Holes 1), so it can be compared with the distances in Part 1.
          </li>
          <li>
            <strong>What it means, with the real numbers.</strong> The Earth’s surface is about {formatNumber(1 / surfaces[0].rsOverR / 1e6)} million horizon
            radii from its center, and a clock there falls behind a far-away one by about {formatDuration(surfaces[0].fractionSlower * SECONDS_PER_YEAR)} in a
            year. The Sun’s surface is about {formatNumber(1 / surfaces[1].rsOverR)} horizon radii out, and a clock there loses about{' '}
            {formatDuration(surfaces[1].fractionSlower * SECONDS_PER_YEAR)} a year. A neutron star’s surface is only about{' '}
            {formatNumber(1 / surfaces[2].rsOverR)} horizon radii out, and a clock there loses about {formatDuration(surfaces[2].fractionSlower * SECONDS_PER_YEAR)}{' '}
            a year.
          </li>
          <li>
            <strong>Why it matters.</strong> It joins this experiment to Gravity and Curved Spacetime, Experiments 2 and 9. For the Earth the slowing is tiny, which is
            why the simple formula was enough for GPS. The closer an object’s surface is to its own horizon, the bigger the slowing.
          </li>
          <li>
            <strong>How sure is the number?</strong> Calculated here. The neutron star’s 12 km radius is the round value from Black Holes 1, and published values differ
            by more than 2 km, so its row is the least certain.
          </li>
        </ul>
      </Note>

      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        <strong>A comparison from daily life, for the push.</strong> Picture a swimmer holding their place in a river just above a waterfall. The nearer they
        are to the edge, the faster the water pulls them toward it, so the harder they must paddle to stay put. Holding a clock still near a
        horizon is like that: the push needed grows larger and larger the closer it is, and has no limit. This is an analogy for the push needed
        to hover, not for the slowing of time itself, which has a different cause.
      </p>

      <div
        style={{
          margin: '0.75rem 0',
          padding: '0.75rem 1rem',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What this model can and cannot tell you.</strong>
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>A thought experiment.</strong> It does not say how the hovering clock is held in place. In real life that would take engines whose push grows
            without limit as the clock nears the horizon. At exactly the horizon the formula gives zero, but no clock can be held there.
          </li>
          <li>
            <strong>Two clocks at rest.</strong> It compares a clock held still near the black hole with one far away. It does not tell you what a traveler who falls
            toward the black hole experiences. That is different, and it is the subject of Black Holes 5. Nothing inside the horizon is modeled.
          </li>
          <li>
            <strong>The simplest black hole.</strong> The exact formula is given, not derived, and it is for a black hole that does not spin and has no electric charge.
            Real black holes usually spin, and that changes the picture.
          </li>
          <li>
            <strong>Far away is treated as infinitely far.</strong> The far-away clock is treated as so far that gravity does not affect it at all. The simple formula shown
            beside the exact one is an approximation for weak gravity.
          </li>
          <li>
            <strong>Rounded values.</strong> The neutron star’s size is a rounded value, and the stellar black hole’s mass of 10 Suns is an illustrative round value.
          </li>
        </ul>
      </div>

      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Check it against NASA.</strong> Two NASA pages describe how something near a black hole looks from far away. They are linked here, after
          your run, because they state what a far-away observer sees.
        </p>
        <ul style={listStyle}>
          <li>
            <a
              href="https://science.nasa.gov/universe/what-happens-when-something-gets-too-close-to-a-black-hole/"
              target="_blank"
              rel="noreferrer"
            >
              NASA, “What Happens When Something Gets ‘Too Close’ to a Black Hole?”
            </a>{' '}
            (3 May 2023): NASA explains that time passes more slowly closer to a black hole, and describes what a far-away observer would see of an object
            approaching the event horizon.
          </li>
          <li>
            <a
              href="https://science.nasa.gov/universe/black-holes/new-nasa-black-hole-visualization-takes-viewers-beyond-the-brink/"
              target="_blank"
              rel="noreferrer"
            >
              NASA, “New NASA Black Hole Visualization Takes Viewers Beyond the Brink”
            </a>{' '}
            (6 May 2024): a NASA visualization of a camera falling toward a black hole, with an outside observer’s view of it.
          </li>
        </ul>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          Both pages are about an object or a camera approaching the horizon, which is the subject of Black Holes 5. The clock in Table 2 is held still at{' '}
          {formatRadii(d1)} horizon radii, which is a different situation.
        </p>
      </div>
    </div>
  )
}
