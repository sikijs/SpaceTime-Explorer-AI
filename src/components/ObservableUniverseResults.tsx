import type { ReactNode } from 'react'
import {
  PLANCK_AGE_YEARS,
  PLANCK_BASED_CMB_SOURCE_DISTANCE_LIGHT_YEARS,
  PLANCK_BASED_EDGE_LIGHT_YEARS,
  PUBLISHED_LIGHT_LEFT_YEARS_AFTER_BIG_BANG,
  REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS,
  REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS,
  checkUp,
  distanceTable,
  modelLightLeftYearsRounded,
  whatYourNumbersShow,
} from '../physics/observableUniverseExperiment'
import type { CheckUpRow, LeftGuess, TodayGuess } from '../physics/observableUniverseExperiment'
import { GUESS_COLOR, LEFT_GUESS_TEXT, LEFT_COLOR, TODAY_COLOR, TODAY_GUESS_TEXT, TRAVEL_COLOR, YOUR_SOURCE_COLOR, distanceLabel, redshiftLabel } from './ObservableUniversePictures'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 8, Part 3: the results (docs/audit/cosmology/08-draft-wording.md, section 5).
// Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page (CLAUDE.md §12,
// §13). Neither guess changes a table. Only the pink row of Table 2 and "What your numbers show" follow Part 2's source.

export interface ObservableUniverseResultsProps {
  guesses: { today: TodayGuess; left: LeftGuess } | null
  redshift: number
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

const bil = (v: number, digits = 2) => (v / 1e9).toFixed(digits)
const thousands = (v: number) => (Math.round(v / 1e3) * 1e3).toLocaleString('en-US')

// "less, by about 0.6 to 1.1 billion light-years" from the module's comparison with a published range.
function readingBillions(row: CheckUpRow, unit: string): string {
  const lo = Math.abs(row.comparison.differenceAtLow) / 1e9
  const hi = Math.abs(row.comparison.differenceAtHigh) / 1e9
  const [small, large] = lo < hi ? [lo, hi] : [hi, lo]
  const range = small.toFixed(1) === large.toFixed(1) ? `${large.toFixed(1)}` : `${small.toFixed(1)} to ${large.toFixed(1)}`
  return `${row.comparison.reading}, by about ${range} billion ${unit}`
}
function readingYears(row: CheckUpRow): string {
  const lo = Math.abs(row.comparison.differenceAtLow)
  const hi = Math.abs(row.comparison.differenceAtHigh)
  const [small, large] = lo < hi ? [lo, hi] : [hi, lo]
  return `${row.comparison.reading}, by about ${thousands(small)} to ${thousands(large)} years`
}
const percentRange = (row: CheckUpRow) => {
  const lo = Math.abs(row.comparison.percentAtLow)
  const hi = Math.abs(row.comparison.percentAtHigh)
  const [small, large] = lo < hi ? [lo, hi] : [hi, lo]
  return `${small.toFixed(1)} to ${large.toFixed(1)} percent`
}

export function ObservableUniverseResults({ guesses, redshift }: ObservableUniverseResultsProps) {
  const rows = Object.fromEntries(checkUp().map((r) => [r.id, r])) as Record<CheckUpRow['id'], CheckUpRow>
  const table = distanceTable(redshift)
  const yours = whatYourNumbersShow(redshift)
  const [rowA, rowB, rowYours] = table
  const youGuess = guesses !== null

  return (
    <div style={{ fontSize: '0.875rem' }}>
      {guesses && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (Galaxy A, whose light has travelled about 10 billion years): <strong>its distance today is {TODAY_GUESS_TEXT[guesses.today]}</strong>. The number it is about is in Table 2, in the Galaxy A row, &ldquo;Source today&rdquo;.
            </li>
            <li>
              <strong>Guess 2</strong> (Source B, the oldest light): <strong>it was {LEFT_GUESS_TEXT[guesses.left]} away when the light left</strong>. The number it is about is in Table 2, in the Source B row, &ldquo;When the light left&rdquo;.
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}

      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: Check-up, this model against published values (none of these rows depends on your Part 2 source)</p>
      <Table heads={['What we compare', 'This model', 'Published', 'How they compare']}>
        <tr>
          <td style={cell}>(a) The oldest light&rsquo;s source, how far away today</td>
          <td style={cell}>{bil(rows.a.model)} billion light-years</td>
          <td style={cell}>
            about {bil(PLANCK_BASED_CMB_SOURCE_DISTANCE_LIGHT_YEARS.low, 1)} to {bil(PLANCK_BASED_CMB_SOURCE_DISTANCE_LIGHT_YEARS.high, 1)} (worked out from Planck 2018&rsquo;s numbers by a helper; no official page prints it) and {bil(REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS, 1)} (Wikipedia, citing Gott and others 2005)
          </td>
          <td style={cell}>
            <strong>{readingBillions(rows.a, 'light-years')}</strong> ({percentRange(rows.a)})
          </td>
        </tr>
        <tr>
          <td style={cell}>(b) The same distance, against the edge of the observable universe</td>
          <td style={cell}>{bil(rows.b.model)} billion light-years</td>
          <td style={cell}>
            about {bil(PLANCK_BASED_EDGE_LIGHT_YEARS.low, 1)} to {bil(PLANCK_BASED_EDGE_LIGHT_YEARS.high, 1)} (the same helper&rsquo;s calculation) and {bil(REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS, 1)} (Wikipedia)
          </td>
          <td style={cell}>
            <strong>{readingBillions(rows.b, 'light-years')}</strong> ({percentRange(rows.b)}); the edge is the farthest source, a little beyond the oldest light&rsquo;s
          </td>
        </tr>
        <tr>
          <td style={cell}>(c) When the oldest light left, in years after the Big Bang</td>
          <td style={cell}>about {modelLightLeftYearsRounded().toLocaleString('en-US')} years</td>
          <td style={cell}>
            about {PUBLISHED_LIGHT_LEFT_YEARS_AFTER_BIG_BANG.low.toLocaleString('en-US')} to {PUBLISHED_LIGHT_LEFT_YEARS_AFTER_BIG_BANG.high.toLocaleString('en-US')} (NASA/JPL and ESA, 2013)
          </td>
          <td style={cell}>
            <strong>{readingYears(rows.c)}</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(d) The age of the universe</td>
          <td style={cell}>{bil(rows.d.model)} billion years</td>
          <td style={cell}>
            {bil(PLANCK_AGE_YEARS, 3)} billion years (Planck 2018)
          </td>
          <td style={cell}>
            <strong>{readingBillions(rows.d, 'years')}</strong>
          </td>
        </tr>
      </Table>

      <Note title="What this table tells us">
        <li>
          <strong>(a) What it is:</strong> the model&rsquo;s distance to the oldest light&rsquo;s source today, beside published figures. <strong>What it means:</strong> {bil(rows.a.model)} against about 45.2 to 45.7: the model is about {readingBillions(rows.a, 'light-years').replace(/^less, by about /, '')} too small ({percentRange(rows.a)}). <strong>Why it matters:</strong> the model is close enough to teach the idea, and the gap has known causes: it leaves out radiation (which matters most at the earliest times) and uses a Hubble constant of 70 where Planck&rsquo;s is 67.4. <strong>How sure:</strong> the published figure is the weak link, because no official page prints it; one figure is a helper&rsquo;s own calculation and the other is from Wikipedia.
        </li>
        <li>
          <strong>(b) What it is:</strong> the farthest we could ever have seen, beside the model&rsquo;s oldest-light distance. <strong>What it means:</strong> the edge is a little farther than the oldest light&rsquo;s source. <strong>Why it matters:</strong> it is why this page calls the oldest light a stand-in for &ldquo;the farthest we can see with light&rdquo;. <strong>How sure:</strong> the same weak link as row (a).
        </li>
        <li>
          <strong>(c) What it is:</strong> the time after the Big Bang when the oldest light left. <strong>What it means:</strong> the model puts it at about {modelLightLeftYearsRounded().toLocaleString('en-US')} years, against 370,000 to 380,000: later by about {readingYears(rows.c).replace(/^more, by about /, '').replace(' years', '')} years. <strong>Why it matters:</strong> it is the same missing radiation showing up in a second number. <strong>How sure:</strong> NASA/JPL and ESA give slightly different figures for the same release, so a range is shown.
        </li>
        <li>
          <strong>(d) What it is:</strong> the model&rsquo;s age beside Planck&rsquo;s. <strong>What it means:</strong> {bil(rows.d.model)} against {bil(PLANCK_AGE_YEARS, 3)} billion years, which is {Math.abs(rows.d.comparison.differenceAtLow / 1e9).toFixed(2)} billion years less. <strong>Why it matters:</strong> the model&rsquo;s age sets the light-travel times in the bars. <strong>How sure:</strong> Planck&rsquo;s age is read from the paper, and its uncertainty (0.020 billion years) is far smaller than the gap.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 2: The three distances (calculated here, in billions of light-years; the pink row follows your Part 2 source)</p>
      <Table heads={['Source', <span style={{ color: TRAVEL_COLOR }}>Light travelled</span>, <span style={{ color: TODAY_COLOR }}>Source today</span>, <span style={{ color: LEFT_COLOR }}>When the light left</span>]}>
        <tr>
          <td style={cell}>Galaxy A (redshift 2)</td>
          <td style={cell}>{bil(rowA.lightTravelYears)}</td>
          <td style={cell}>
            {bil(rowA.distanceTodayLightYears)} {youGuess && <GuessTag />}
          </td>
          <td style={cell}>{bil(rowA.distanceWhenLightLeftLightYears)}</td>
        </tr>
        <tr>
          <td style={cell}>Source B, the oldest light (redshift 1089.8)</td>
          <td style={cell}>{bil(rowB.lightTravelYears)}</td>
          <td style={cell}>{bil(rowB.distanceTodayLightYears)}</td>
          <td style={cell}>
            {bil(rowB.distanceWhenLightLeftLightYears, 3)} ({distanceLabel(rowB.distanceWhenLightLeftLightYears)}) {youGuess && <GuessTag />}
          </td>
        </tr>
        <tr style={{ backgroundColor: 'rgba(244, 114, 182, 0.12)' }}>
          <td style={cell}>
            <strong style={{ color: YOUR_SOURCE_COLOR }}>Your source</strong> (redshift {redshiftLabel(redshift)})
          </td>
          <td style={cell}>{bil(rowYours.lightTravelYears)}</td>
          <td style={cell}>{bil(rowYours.distanceTodayLightYears)}</td>
          <td style={cell}>{bil(rowYours.distanceWhenLightLeftLightYears, rowYours.distanceWhenLightLeftLightYears < 1e9 ? 3 : 2)}</td>
        </tr>
      </Table>
      {youGuess && <p style={smallNote}>The tags mark where each guess is about (guess 1 at Galaxy A&rsquo;s &ldquo;Source today&rdquo;, guess 2 at Source B&rsquo;s &ldquo;When the light left&rdquo;). They show the guess only, not whether it is right.</p>}

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> The three distances for the two sources in Part 1 and for the one you chose.
        </li>
        <li>
          <strong>What it means with the real numbers.</strong> For every source in the table the distance today is greater than the distance the light travelled: {rowA.distanceTodayLightYears / rowA.lightTravelYears > 1 ? (rowA.distanceTodayLightYears / rowA.lightTravelYears).toFixed(2) : ''} times as great for Galaxy A and {(rowB.distanceTodayLightYears / rowB.lightTravelYears).toFixed(2)} times for Source B.
        </li>
        <li>
          <strong>Why it matters.</strong> The light&rsquo;s journey does not tell you where the source is now.
        </li>
        <li>
          <strong>How sure.</strong> The numbers are calculated here in a simplified model, close to but not exactly the published ones (Table 1).
        </li>
      </Note>

      <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', border: `1px solid ${YOUR_SOURCE_COLOR}`, borderRadius: '6px', fontSize: '0.875rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What your numbers show.</strong> With a source at redshift <strong>{redshiftLabel(yours.redshift)}</strong>, the light travelled <strong>{bil(yours.lightTravelYears)}</strong> billion light-years, the source is <strong>{bil(yours.distanceTodayLightYears)}</strong> away today, and it was <strong>{distanceLabel(yours.distanceWhenLightLeftLightYears)}</strong> away when the light left. Compared with Galaxy A, your source&rsquo;s distance today is{' '}
          <strong>{yours.todayReadingAgainstGalaxyA === 'the same' ? 'the same' : `${yours.todayReadingAgainstGalaxyA}, by ${bil(Math.abs(yours.todayMinusGalaxyALightYears))} billion light-years`}</strong>.
        </p>
        <p style={{ margin: 0, fontSize: '0.8125rem' }}>
          <strong>These are trial values and your own numbers. They do not say that a real galaxy is like that.</strong> While your source is on redshift 2 or the oldest light, its row repeats Galaxy A&rsquo;s or Source B&rsquo;s, so choose another to see it move.
        </p>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: 'rgba(15, 118, 110, 0.08)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#0f766e' }}>What this model simplifies</p>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>It is the same simplified universe as Cosmology 5 and 6: flat, with matter and a constant dark energy, an illustrative Hubble constant of 70, and no radiation.</li>
          <li>The source has no motion of its own, the light travels in a straight line, and &ldquo;distance today&rdquo; is a way of defining a distance across all of space at once.</li>
          <li>The cosmic microwave background stands in for the farthest we can see with light, and the observable universe is only the part we can see, not the whole universe.</li>
        </ul>
      </div>
    </div>
  )
}
