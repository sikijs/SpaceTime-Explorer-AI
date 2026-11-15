import type { ReactNode } from 'react'
import {
  LENS_DISTANCE_MPC,
  LENS_TO_SOURCE_DISTANCE_MPC,
  OBSERVED_RING_ARCSECONDS,
  PUBLISHED_BROADHURST,
  SOURCE_DISTANCE_MPC,
  VISIBLE_MASS_FRACTION,
  checkUp,
  imaginedFourTimes,
  ringComparisonExample,
  visibleOnlyMassSolarMasses,
  workedOutVisibleShare,
  yourComparison,
} from '../physics/gravitationalLensingExperiment'
import type { CheckUpRow, FourTimesGuess, RingSizeGuess } from '../physics/gravitationalLensingExperiment'
import { FOUR_TIMES_GUESS_TEXT, GUESS_COLOR, RING_SIZE_GUESS_TEXT, YOUR_MASS_COLOR, massLabel } from './GravitationalLensingPictures'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 7, Part 3: the results (docs/audit/cosmology/07-draft-wording.md, section 5).
// Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page (CLAUDE.md §12,
// §13). Neither guess changes a table. Only the gold row of Table 2 and "What your numbers show" follow Part 2's mass.

export interface GravitationalLensingResultsProps {
  guesses: { ringSize: RingSizeGuess; fourTimes: FourTimesGuess } | null
  mass: number
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

const a = (v: number) => v.toFixed(1)

export function GravitationalLensingResults({ guesses, mass }: GravitationalLensingResultsProps) {
  const rows = Object.fromEntries(checkUp().map((r) => [r.id, r])) as Record<CheckUpRow['id'], CheckUpRow>
  const e = ringComparisonExample()
  const share = workedOutVisibleShare()
  const imagined = imaginedFourTimes()
  const yours = yourComparison(mass)
  const visibleMass = visibleOnlyMassSolarMasses()
  const published = PUBLISHED_BROADHURST.einsteinRadiusArcseconds
  const readingText = (reading: string, diff: number) => (reading === 'the same' ? 'the same' : `${reading}, by ${Math.abs(diff).toFixed(1)}`)

  return (
    <div style={{ fontSize: '0.875rem' }}>
      {guesses && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (more mass, against the ring we see): <strong>it would give {RING_SIZE_GUESS_TEXT[guesses.ringSize]}</strong>. The two numbers it is about are in Table 2, in the rows &ldquo;Visible matter only&rdquo; and &ldquo;The observed ring&rdquo;.
            </li>
            <li>
              <strong>Guess 2</strong> (four times the mass): <strong>the ring would be {FOUR_TIMES_GUESS_TEXT[guesses.fourTimes]}</strong>. The number it is about is in Table 1, row (d).
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}

      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: Check-up (none of these rows depends on your Part 2 mass)</p>
      <Table heads={['What we compare', 'Calculated here', 'Published', 'How they compare']}>
        <tr>
          <td style={cell}>(a) The ring the visible matter alone would make, against the observed ring</td>
          <td style={cell}>{a(rows.a.thisPage)} arcseconds</td>
          <td style={cell}>
            {OBSERVED_RING_ARCSECONDS} (a given value; about {published} in Broadhurst and others 2005)
          </td>
          <td style={cell}>
            <strong>{readingText(rows.a.reading, rows.a.difference!)}</strong> arcseconds
          </td>
        </tr>
        <tr>
          <td style={cell}>(b) The mass inside the observed ring, running the formula backward</td>
          <td style={cell}>{massLabel(rows.b.thisPage)} solar masses</td>
          <td style={cell}>no outside value read</td>
          <td style={cell}>
            <strong>Calculated here only</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(c) The page&rsquo;s visible share, against a share worked out from two papers</td>
          <td style={cell}>{rows.c.thisPage.toFixed(0)} percent</td>
          <td style={cell}>about {share.clusterPercent.toFixed(1)} percent (Planck 2018 and Gonzalez and others 2013: worked out here)</td>
          <td style={cell}>
            <strong>{readingText(rows.c.reading, rows.c.difference!)}</strong> points
          </td>
        </tr>
        <tr>
          <td style={cell}>
            (d) The ring for four times the visible mass, against the visible-only ring {guesses && <GuessTag />}
          </td>
          <td style={cell}>
            {a(rows.d.thisPage)} against {a(rows.d.beside!)} arcseconds
          </td>
          <td style={cell}>none (a result of the formula)</td>
          <td style={cell}>
            <strong>Calculated here only</strong>: exactly double
          </td>
        </tr>
      </Table>
      {guesses && <p style={smallNote}>The tags mark where each guess is about: guess 2 at row (d), and guess 1 at the first two rows of Table 2. They show the guess only, not whether it is right.</p>}
      <p style={smallNote}>
        Rows (a) and (c) are measured against given or worked-out values, rows (b) and (d) have no published value. &ldquo;The same&rdquo; is said only for no difference at all, and no cut-off such as &ldquo;close enough&rdquo; is used here.
      </p>

      <Note title="What this table tells us">
        <li>
          <strong>Row (a).</strong> <em>What it is:</em> the ring that the cluster&rsquo;s stars and hot gas alone would make, beside the ring astronomers see. <em>What it means:</em> {a(rows.a.thisPage)} against {OBSERVED_RING_ARCSECONDS}: the real ring is {a(e.differenceArcseconds)} arcseconds wider, and {e.ratio.toFixed(1)} times as wide. <em>Why it matters:</em> a wider ring means more bending, so more mass than the visible matter. <em>How sure:</em> the {OBSERVED_RING_ARCSECONDS} is a rounded value for Abell 1689
          (Broadhurst and others give about {published}), so the gap is about {a(e.differenceArcseconds)} to {a(published - e.visibleRingArcseconds)}.
        </li>
        <li>
          <strong>Row (b).</strong> <em>What it is:</em> the ring formula run backward. <em>What it means:</em> {massLabel(e.observedMassSolarMasses)} solar masses inside {OBSERVED_RING_ARCSECONDS} arcseconds, which is {e.massRatio.toFixed(1)} times the visible mass. <em>Why it matters:</em> it is the cluster&rsquo;s weight, found with no scale. <em>How sure:</em> no published value was read to compare with it.
        </li>
        <li>
          <strong>Row (c).</strong> <em>What it is:</em> the share of the cluster&rsquo;s mass that is stars and hot gas. <em>What it means:</em> from Planck&rsquo;s numbers the whole universe is {share.universalPercent.toFixed(1)} percent ordinary matter (0.0224 ÷ 0.674² ÷ 0.315), and Gonzalez and others find big clusters about 7 percent below that, {share.clusterPercent.toFixed(1)}. <em>Why it matters:</em> it sets the blue ring. <em>How sure:</em> my arithmetic on read numbers, not a quoted figure; no page read says &ldquo;about 15 percent&rdquo;.
        </li>
        <li>
          <strong>Row (d).</strong> <em>What it is:</em> the ring for four times the visible mass. <em>What it means:</em> {a(imagined.ringArcseconds)} arcseconds, exactly twice {a(e.visibleRingArcseconds)}. <em>Why it matters:</em> it is the number behind guess 2. <em>How sure:</em> it is the formula, not a measurement.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 2: The rings (calculated here; the gold row follows your Part 2 mass)</p>
      <Table heads={['Ring', 'Your value (arcseconds)', 'Published value', 'How yours compares']}>
        <tr>
          <td style={cell}>
            Visible matter only ({massLabel(visibleMass)} solar masses) {guesses && <GuessTag />}
          </td>
          <td style={cell}>{a(e.visibleRingArcseconds)}</td>
          <td style={cell}>none: calculated here</td>
          <td style={cell}>not compared</td>
        </tr>
        <tr style={{ backgroundColor: 'rgba(251, 191, 36, 0.12)' }}>
          <td style={cell}>
            <strong style={{ color: YOUR_MASS_COLOR }}>Your cluster</strong> ({massLabel(mass)} solar masses)
          </td>
          <td style={cell}>{a(yours.ringArcseconds)}</td>
          <td style={cell}>
            {OBSERVED_RING_ARCSECONDS} (given); about {published} (Broadhurst)
          </td>
          <td style={cell}>
            <strong>{readingText(yours.againstObserved.reading, yours.againstObserved.differenceArcseconds)}</strong> than the {OBSERVED_RING_ARCSECONDS}
          </td>
        </tr>
        <tr>
          <td style={cell}>
            The observed ring ({massLabel(e.observedMassSolarMasses)} solar masses inside) {guesses && <GuessTag />}
          </td>
          <td style={cell}>{OBSERVED_RING_ARCSECONDS.toFixed(1)}</td>
          <td style={cell}>about {published} (Broadhurst and others 2005)</td>
          <td style={cell}>
            <strong>{readingText('less', OBSERVED_RING_ARCSECONDS - published)}</strong> than the published {published}
          </td>
        </tr>
        <tr>
          <td style={cell}>Four times the visible mass (imagined)</td>
          <td style={cell}>{a(imagined.ringArcseconds)}</td>
          <td style={cell}>none: imagined</td>
          <td style={cell}>not compared</td>
        </tr>
      </Table>
      {guesses && <p style={smallNote}>The tags mark where guess 1 is about (the visible-only and observed rows). They show the guess only, not whether it is right.</p>}

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> The rings for masses you can choose, beside the real one.
        </li>
        <li>
          <strong>What it means with the real numbers.</strong> A cluster needs about {e.massRatio.toFixed(1)} times the visible mass ({massLabel(e.observedMassSolarMasses)} against {massLabel(e.visibleMassSolarMasses)}) to make the ring astronomers see. The observed {OBSERVED_RING_ARCSECONDS} is {a(published - OBSERVED_RING_ARCSECONDS)} below Broadhurst and others&rsquo; &ldquo;approximately {published}&rdquo;.
        </li>
        <li>
          <strong>Why it matters.</strong> The ring is a measurement of mass.
        </li>
        <li>
          <strong>How sure.</strong> The observed ring is a given, rounded value, and the published estimate read for this page is a little different (about {published}).
        </li>
      </Note>

      <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', border: `1px solid ${YOUR_MASS_COLOR}`, borderRadius: '6px', fontSize: '0.875rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What your numbers show.</strong> With a cluster of <strong>{massLabel(mass)}</strong> solar masses, your ring is <strong>{a(yours.ringArcseconds)}</strong> arcseconds: <strong>{readingText(yours.againstObserved.reading, yours.againstObserved.differenceArcseconds)}</strong> than the observed {OBSERVED_RING_ARCSECONDS}, and <strong>{yours.ringOverVisibleRing.toFixed(2)}</strong> times the visible-only ring. Row (d) of Table 1 does not change with your mass.
        </p>
        <p style={{ margin: 0, fontSize: '0.8125rem' }}>
          <strong>These are trial values and your own numbers. They do not say the real cluster is like that.</strong>
        </p>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: 'rgba(15, 118, 110, 0.08)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#0f766e' }}>In the real world</p>
        <p style={{ margin: '0.5rem 0 0.4rem' }}>
          Real galaxy clusters make rings and bright arcs like these, and astronomers use them to weigh clusters. The cluster Abell 1689 is a well-known example, and its ring is the one used here as the &ldquo;observed&rdquo; ring.
        </p>
        <p style={{ margin: '0 0 0.4rem' }}>
          <strong>What this model simplifies.</strong> The cluster is treated as perfectly round, with the source exactly behind its centre; real clusters are lumpy and rarely line up perfectly, so real rings are usually broken arcs. The three distances ({LENS_DISTANCE_MPC} Mpc to the cluster, {SOURCE_DISTANCE_MPC} Mpc to the source and {LENS_TO_SOURCE_DISTANCE_MPC} Mpc between them) are fixed, rounded values for one real situation. The observed ring ({OBSERVED_RING_ARCSECONDS} arcseconds) and the visible share ({Math.round(VISIBLE_MASS_FRACTION * 100)} percent) are given values, not worked out here, and the visible share is an average for real clusters applied to the mass inside the ring, which is approximate.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Remember:</strong> lensing weighs the mass and shows where it is. No source read for this page says what the unseen mass is made of, and nothing here claims to.
        </p>
      </div>
    </div>
  )
}

