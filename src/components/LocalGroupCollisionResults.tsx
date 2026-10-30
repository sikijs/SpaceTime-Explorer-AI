import type { ReactNode } from 'react'
import {
  FALL_CHOICES,
  M31_CONCENTRATION_2025,
  M31_CONCENTRATION_2026,
  MEDIAN_MERGER_TIME_2025_GYR,
  MONTE_CARLO_SAMPLES_2026_PER_RUN,
  MONTE_CARLO_TRIALS_2025,
  PASS_CHOICES,
  PROPER_MOTION_2025,
  PROPER_MOTION_2026,
  PUBLISHED_2025,
  PUBLISHED_2026,
  SIDEWAYS_SPEED_2025_KM_S,
  SIDEWAYS_SPEED_2026_KM_S,
  SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S,
  exampleSteps,
  resultsCheckUp,
} from '../physics/localGroupCollision'
import type { Comparison, FallChoiceId, PassChoiceId } from '../physics/localGroupCollision'
import { ResultsTable } from './WideBinariesExperiment'

// Cosmic Horizons, Experiment 25: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's guesses or settings. The wording is a
// DRAFT for the owner's line-by-line approval (CLAUDE.md §28.1). Why a falling galaxy speeds up, why a sideways speed makes a loop, why a close first pass is not yet a merger and which of the studies' differences
// matters most are left to the tutor (CLAUDE.md §12, §13). The papers and pages behind the numbers are listed at the end, after the run, because some of them give "four billion years" (CLAUDE.md §12).

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const noteStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' } as const
const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)
const comparisonWord = (w: Comparison | string) => w.charAt(0).toUpperCase() + w.slice(1)

function Note({ items }: { items: { label: string; text: ReactNode }[] }) {
  return (
    <div style={noteStyle}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What this table tells us.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {items.map((item) => (
          <li key={item.label}>
            <strong>{item.label}:</strong> {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function LocalGroupCollisionResults({ fallGuess, passGuess }: { fallGuess: FallChoiceId | null; passGuess: PassChoiceId | null }) {
  const c = resultsCheckUp()
  const s = exampleSteps()
  const fallLabel = fallGuess !== null ? (FALL_CHOICES.find((x) => x.id === fallGuess)?.label ?? '') : ''
  const passLabel = passGuess !== null ? (PASS_CHOICES.find((x) => x.id === passGuess)?.label ?? '') : ''
  const tag1 = fallGuess !== null ? ` [your guess for Prediction 1: ${fallLabel}]` : ''
  const tag2 = passGuess !== null ? ` [your guess for Prediction 2: ${passLabel}]` : ''
  const sideways2026 = n1(SIDEWAYS_SPEED_2026_KM_S)
  const plusMinus = n1(SIDEWAYS_SPEED_2026_PLUS_MINUS_KM_S)
  const pm25 = PROPER_MOTION_2025
  const pm26 = PROPER_MOTION_2026
  const muText = `${(s.mu / 1e6).toFixed(2)} × 10⁶ kpc (km/s)²`
  const commas = (x: number) => Math.round(x).toLocaleString('en-US')

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0f766e' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: '#0f766e' }}>Part 3: The results</h3>
      <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>What we are about to do.</strong> Here are the numbers behind the pictures, set out in three tables, each with a short guide to reading it. These tables are the real numbers, so they never change with your guesses or with your settings in Part 2.
      </p>

      <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Where this stands (as of October 2026): Contested.</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Settled:</strong> that Andromeda is coming towards the Milky Way, from the colour shift in its light, which has been known for more than a century (the 2025 paper says so), and its distance, to a small give-or-take.
          </li>
          <li>
            <strong>Contested:</strong> how fast Andromeda moves sideways ({SIDEWAYS_SPEED_2025_KM_S} km/s in the 2025 study, {sideways2026} ± {plusMinus} km/s in the 2026 study), and with it the chance of a merger within 10 billion years (about {PUBLISHED_2025.mergerPercentWithin10Gyr} percent against about {PUBLISHED_2026.mergerPercent} percent).
          </li>
          <li>
            <strong>Open:</strong> how much the other galaxies matter (the two studies find opposite effects for the Large Magellanic Cloud), and what newer measurements will show. ESA lists Gaia’s next data release, Data Release 4, as expected in December 2026.
          </li>
          <li>The numbers come from the full texts of the two papers on arXiv (read for this page), ESA’s and NASA’s pages, and this page’s own calculation. The versions printed in the journals were not read.</li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real number for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (how long a straight fall would take): you guessed <strong>{fallGuess !== null ? fallLabel : '…'}</strong>. The real calculated number is in Table 1, in the row “Straight fall”.
          </li>
          <li>
            <strong>Prediction 2</strong> (how close the first pass would be, for {sideways2026} km/s): you guessed <strong>{passGuess !== null ? passLabel : '…'}</strong>. The real calculated number is in Table 1, in the row “First pass for {sideways2026} km/s”, and in Table 2, in the row “First pass”.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1 is a check-up: it sets each number this page calculates beside
        a comparison that this page sets, or beside a number that the 2026 study gives, and says in plain words how they compare, with “the same”, “more” or “less”. It does not say “good” or “bad”, because there is no accepted range for how closely a simple calculation should match. A <strong>first pass</strong> is the
        point where the two galaxies are closest for the first time, as in Picture 2.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the calculated numbers beside a comparison or a published number</p>
      <ResultsTable
        minWidth={760}
        head={['What we compare', 'Calculated here', 'Comparison used here, or published value', 'How to read it']}
        rows={[
          [
            `Straight fall${tag1}`,
            `${n2(c.straightFallGyr)} billion years`,
            `distance ÷ speed, ${n2(c.constantSpeedGyr)} billion years (a comparison set by this page: the time if the speed never changed)`,
            `${comparisonWord(c.fallVersusConstant)}: ${n2(c.fallRatio)} times as long.`,
          ],
          [
            `First pass for ${sideways2026} km/s${tag2}`,
            `${n1(c.firstPass2026Kpc)} kpc, after ${n2(c.firstPass2026Gyr)} billion years`,
            `${c.ringKpc} kpc, the distance both studies call “merged”`,
            `${comparisonWord(c.pass2026Versus)}: ${n1(c.pass2026Ratio)} times ${c.ringKpc} kpc.`,
          ],
          [
            `First pass for ${SIDEWAYS_SPEED_2025_KM_S} km/s`,
            `${n1(c.firstPass2025Kpc)} kpc`,
            `${c.ringKpc} kpc, as above`,
            `${comparisonWord(c.pass2025Versus)}: ${n1(c.pass2025Ratio)} times ${c.ringKpc} kpc.`,
          ],
          [
            `Time to the first pass, for ${sideways2026} km/s`,
            `${n2(c.firstPass2026Gyr)} billion years`,
            `the 2026 study’s median merger time, ${n1(c.medianMergerGyr)} billion years, with a give-or-take of +${n1(PUBLISHED_2026.medianPlusGyr)} and −${n1(PUBLISHED_2026.medianMinusGyr)} (from ${n1(c.medianLowGyr)} to ${n1(c.medianHighGyr)})`,
            `${comparisonWord(c.timeVersusMedian)}: ${n1(c.timeGapGyr)} billion years before the median${c.timeBelowLowEnd ? `, and before the low end of its range, ${n1(c.medianLowGyr)}` : ''}.`,
          ],
          [
            `Sideways speed that gives a ${c.ringKpc} kpc first pass`,
            `${n1(c.sidewaysFor20Kpc)} km/s`,
            `the 2026 study’s ${sideways2026} ± ${plusMinus} km/s (from ${n1(c.rangeLowKmS)} to ${n1(c.rangeHighKmS)})`,
            c.sidewaysFor20InRange ? 'Inside the give-or-take range.' : 'Outside the give-or-take range.',
          ],
          [
            'Sideways speed above which the pair is not bound',
            `${n1(c.unboundKmS)} km/s`,
            `the faster of the two studies’ speeds, ${SIDEWAYS_SPEED_2025_KM_S} km/s`,
            `${comparisonWord(c.unboundVersusStudies)}: both studies’ speeds are below it.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the times and distances from this page’s calculation of the two galaxies alone, each set beside a comparison that this page sets or beside a number that the 2026 study gives.',
          },
          {
            label: 'What it means',
            text: (
              <>
                A straight fall takes {n2(c.straightFallGyr)} billion years, which is {n2(c.fallRatio)} times the {n2(c.constantSpeedGyr)} billion of distance ÷ speed. With the sideways speeds of the two studies the first pass is {n1(c.firstPass2026Kpc)} kpc ({sideways2026} km/s) and {n1(c.firstPass2025Kpc)} kpc ({SIDEWAYS_SPEED_2025_KM_S} km/s), which is {n1(c.pass2026Ratio)} and{' '}
                {n1(c.pass2025Ratio)} times the {c.ringKpc} kpc that the studies call merged. For {sideways2026} km/s the first pass comes {n2(c.firstPass2026Gyr)} billion years from now, {n1(c.timeGapGyr)} billion years before the 2026 study’s median merger time. The sideways speed that would give exactly {c.ringKpc} kpc, {n1(c.sidewaysFor20Kpc)} km/s, lies inside the
                2026 give-or-take, from {n1(c.rangeLowKmS)} to {n1(c.rangeHighKmS)} km/s. And {n1(c.unboundKmS)} km/s, above which the pair would not be bound, is higher than either study’s speed.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: `the sideways speed decides how close the first pass is, and the 2026 give-or-take is wide enough to include speeds that give a first pass inside ${c.ringKpc} kpc as well as ones far outside it. A first pass outside the ${c.ringKpc} kpc ring is not the same as no merger, because both studies find mergers in many of their runs. Why that is, and what the time before the median means, is for the tutor.`,
          },
          {
            label: 'How sure the numbers are',
            text: `the median merger time and its give-or-take are from the abstract of the 2026 paper, which was read for this page; the “range” is the median minus and plus that give-or-take, as this page reads it. The studies’ times come from their own models, which have more galaxies and dynamical friction, so they are a different kind of number from a two-point first pass, and this row sets them side by side without saying that they should match. The approach speed, ${Math.round(s.approachKmS)} km/s, is a rounded value that neither paper gives.`,
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. From the state now to the first pass, for {sideways2026} km/s</p>
      <ResultsTable
        minWidth={640}
        head={['Step', 'Value', 'How to read it']}
        rows={[
          ['Distance now (r₀)', `${n1(s.distanceKpc)} kpc`, 'How far Andromeda is. From a distance modulus of 24.407, which both studies use.'],
          ['Approach speed (v_r)', `${Math.round(s.approachKmS)} km/s`, 'How fast Andromeda moves straight towards the Milky Way. A rounded value from the literature.'],
          ['Sideways speed (v_t)', `${sideways2026} km/s`, 'How fast Andromeda moves across the line between the two. The 2026 study’s value.'],
          ['Total mass (M)', `${n1(s.totalMass / 1e12)} trillion Suns`, 'The masses of the two halos added up: 1.0 and 1.3 trillion Suns.'],
          ['The strength of the pull (G × M)', muText, 'A number for how strong the pull of the two halos is: the constant of gravity times the total mass.'],
          [
            'Energy of the motion, per unit of mass',
            `${commas(s.energy)} (km/s)²`,
            `Half of (v_r² + v_t²), minus (G × M) ÷ r₀: ${commas(s.halfSpeedSquared)} − ${commas(s.potential)} = ${commas(s.energy)}. A negative number means the two are bound to each other.`,
          ],
          ['Sideways angular momentum (L)', `${commas(s.angularMomentum)} kpc km/s`, `r₀ × v_t = ${n1(s.distanceKpc)} × ${sideways2026}. A number for how much sideways motion the pair has.`],
          ['Size of the orbit (p)', `${n1(s.p)} kpc`, `L² ÷ (G × M) = ${commas(s.angularMomentum)}² ÷ ${(s.mu / 1e6).toFixed(2)} million. A distance that sets the scale of the loop.`],
          ['How open the loop is (eccentricity, e)', n2(s.eccentricity), 'A number between 0 and 1 for a loop that closes, and above 1 for one that does not. It comes from the energy and L.'],
          [`First pass${tag2}`, `${n1(s.firstPassKpc)} kpc`, `p ÷ (1 + e) = ${n1(s.p)} ÷ ${n2(1 + s.eccentricity)}.`],
          ['Time to the first pass', `${n2(s.firstPassGyr)} billion years`, 'From the shape of the loop, by the standard formula for the time along such an orbit. The sum is not shown here.'],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the steps from the state now, three measured numbers and the total mass, to the first pass and the time it takes, each worked out from the ones before.',
          },
          {
            label: 'What it means',
            text: (
              <>
                Only four things about the pair are needed: the distance, {n1(s.distanceKpc)} kpc, the approach speed, {Math.round(s.approachKmS)} km/s, the sideways speed, {sideways2026} km/s, and the total mass, {n1(s.totalMass / 1e12)} trillion Suns. They give an energy of {commas(s.energy)} (km/s)², which is negative, so the pair is bound, and a sideways angular momentum of{' '}
                {commas(s.angularMomentum)}. From those come the size of the orbit, {n1(s.p)} kpc, how open it is, {n2(s.eccentricity)}, and the first pass, {n1(s.firstPassKpc)} ÷ {n2(1 + s.eccentricity)} = {n1(s.firstPassKpc)} kpc. It is like a recipe: four ingredients make the whole orbit.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'these are the numbers behind your Prediction 2, and the ones that Picture 2 and Drawing A use for every setting. Why the formulas take this form is for the tutor.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the first four rows are published or rounded values, as the notes in Table 1 say; the other rows follow from them by arithmetic and by standard two-body formulas, which were checked here against a separate step-by-step calculation of the motion but not read at a source.',
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. The two studies side by side</p>
      <ResultsTable
        minWidth={760}
        head={['', '2025 study', '2026 study', 'How to read it']}
        rows={[
          ['Who and where', 'Sawala and others, Nature Astronomy, June 2025', 'Wu and others, accepted by The Astrophysical Journal Letters, March 2026', 'Both follow the same method: many trial runs of the orbits of four galaxies, with the uncertain numbers drawn at random.'],
          [
            'Andromeda’s sideways speed',
            `about ${SIDEWAYS_SPEED_2025_KM_S} km/s (the most likely value)`,
            `${sideways2026} ± ${plusMinus} km/s`,
            'The 2026 value is smaller. Neither paper’s sentence says which frame it is given in.',
          ],
          [
            'Andromeda’s proper motion (millionths of an arcsecond a year, east–west and north–south)',
            `${pm25.ra} ± ${pm25.raPlusMinus} and ${pm25.dec} ± ${pm25.decPlusMinus}`,
            `${pm26.ra} ± ${pm26.raPlusMinus} and ${pm26.dec} ± ${pm26.decPlusMinus}`,
            'The measurement the sideways speed comes from. The 2026 study uses newer Gaia data, corrected for known errors in Gaia’s positions.',
          ],
          ['Distance modulus of Andromeda', '24.407 ± 0.032', '24.407 ± 0.032', 'The same.'],
          [
            'Halo masses (trillion Suns)',
            'Milky Way 1.0 ± 0.2; Andromeda 1.3 ± 0.4',
            'Milky Way 1.0 ± 0.2; Andromeda 1.3 ± 0.4',
            'The same.',
          ],
          [
            'Halo concentration of Andromeda (how tightly the halo is packed towards its centre)',
            `${M31_CONCENTRATION_2025.value} ± ${M31_CONCENTRATION_2025.plusMinus}`,
            `${M31_CONCENTRATION_2026.value} ± ${M31_CONCENTRATION_2026.plusMinus}`,
            'More in 2026. The papers do not say here how much this changes the result.',
          ],
          ['Galaxies in the model', 'Milky Way, Andromeda, M33, Large Magellanic Cloud', 'Milky Way, Andromeda, M33, Large Magellanic Cloud', 'The same.'],
          [
            'Chance of a merger within 10 billion years',
            `about ${PUBLISHED_2025.mergerPercentWithin10Gyr} percent`,
            `about ${PUBLISHED_2026.mergerPercent} percent (from ${PUBLISHED_2026.percentRangeLow} to ${PUBLISHED_2026.percentRangeHigh} percent across the range of Andromeda’s motion that the data allow)`,
            'More in 2026.',
          ],
          [
            'Median merger time of the runs that merge',
            `${MEDIAN_MERGER_TIME_2025_GYR} billion years`,
            `${n1(PUBLISHED_2026.medianMergerTimeGyr)} billion years (+${n1(PUBLISHED_2026.medianPlusGyr)}, −${n1(PUBLISHED_2026.medianMinusGyr)})`,
            'Less in 2026.',
          ],
          ['Effect of the Large Magellanic Cloud on the merger chance', 'lowers it', 'raises it (the 2026 paper says its effect is reversed)', 'Opposite.'],
          [
            'Number of trial runs',
            `${commas(MONTE_CARLO_TRIALS_2025)} simulations (ESA’s figure; the paper says each probability uses at least 2,500 samples)`,
            `${commas(MONTE_CARLO_SAMPLES_2026_PER_RUN)} samples for each set-up`,
            'Both are large. The 2025 paper says its statistical errors are below 1 percent.',
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the main inputs and results of the two studies, in their own words and numbers, with nothing calculated here.',
          },
          {
            label: 'What it means',
            text: (
              <>
                The distance and the halo masses of the Milky Way and Andromeda are the same. Andromeda’s sideways speed is smaller in 2026 ({sideways2026} km/s against about {SIDEWAYS_SPEED_2025_KM_S}), the proper motion behind it is different, the halo concentration of Andromeda is different, and the effect of the Large Magellanic Cloud is the opposite. The chance of a merger is about{' '}
                {PUBLISHED_2026.mergerPercent} percent in 2026 against about {PUBLISHED_2025.mergerPercentWithin10Gyr} in 2025, and the median merger time is {n1(PUBLISHED_2026.medianMergerTimeGyr)} billion years against {MEDIAN_MERGER_TIME_2025_GYR}.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'the two studies put in more than one different number, so this table cannot say which difference matters most. The 2026 paper’s own tests point to Andromeda’s sideways motion. What that means for the chance of a merger is for the tutor.',
          },
          {
            label: 'How sure the numbers are',
            text: 'all of these are read from the arXiv full texts of the two papers (the 2025 numbers from its parameter table and text, the 2026 numbers from its abstract and Table 1), except ESA’s figure of 100,000 simulations. The 2025 study’s “most likely” 76 km/s and the 2026 study’s 46.7 ± 24.0 km/s do not name a frame, and the 2026 study takes its value from its authors’ earlier paper, which was not read. Journal versions were not read.',
          },
        ]}
      />

      <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>The papers and pages behind these numbers.</strong> They are listed here, after the run, because some of them give dates that your predictions ask for. Links open in a new tab.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <ExternalLink href="https://arxiv.org/abs/2408.00064">Apocalypse When? No Certainty of a Milky Way – Andromeda Collision (Sawala and others, 2025)</ExternalLink>: the 2025 study, with its parameters, its probabilities and its method. Published in <em>Nature Astronomy</em>; this link is the free copy on arXiv.
          </li>
          <li>
            <ExternalLink href="https://arxiv.org/abs/2603.22863">The Fate of the Milky Way–Andromeda System: To Merge or Not? (Wu and others, 2026)</ExternalLink>: the 2026 study, with the newer measurements and a test of how the chance of a merger depends on Andromeda’s motion.
          </li>
          <li>
            <ExternalLink href="https://science.nasa.gov/missions/hubble/apocalypse-when-hubble-casts-doubt-on-certainty-of-galactic-collision/">NASA: Apocalypse When? Hubble casts doubt on certainty of galactic collision</ExternalLink>: NASA’s plain account of the 2025 study (June 2, 2025), and of the 2012 prediction it
            questions.
          </li>
          <li>
            <ExternalLink href="https://esahubble.org/news/heic2508/">ESA/Hubble: Hubble casts doubt on certainty of galactic collision</ExternalLink>: the same story from ESA, with a link to the paper.
          </li>
          <li>
            <ExternalLink href="https://science.nasa.gov/missions/hubble/nasas-hubble-shows-milky-way-is-destined-for-head-on-collision/">NASA: Hubble shows Milky Way is destined for a head-on collision</ExternalLink>: NASA’s 2012 account of the earlier result, from Hubble’s measurement of Andromeda’s sideways motion.
          </li>
          <li>
            <ExternalLink href="https://www.esa.int/Science_Exploration/Space_Science/Gaia/Gaia_clocks_new_speeds_for_Milky_Way-Andromeda_collision">ESA: Gaia clocks new speeds for Milky Way–Andromeda collision</ExternalLink>: ESA’s 2019 account of a result from Gaia’s first measurements of Andromeda’s motion.
          </li>
        </ul>
      </div>
    </div>
  )
}
