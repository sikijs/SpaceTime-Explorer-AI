import type { ReactNode } from 'react'
import { DELAY_ANSWER_CHOICES, DISTANCE_ANSWER_CHOICES, EARTH_DISTANCE_AU, TARGET_CHOICES, TESTED, resultsCheckUp, stepsTable } from '../physics/sunDelay'
import { ResultsTable } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 5: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's guesses or settings. The wording is
// Claude's DRAFT of 2026-11-01, for the owner's approval line by line (CLAUDE.md §28.1). Which of the two ways of calculating real signals follow, and what the tests show beyond the figures quoted, are left to the tutor
// (CLAUDE.md §12, §13). The papers and pages behind the numbers are listed at the end (Step 8), after the run.

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
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
const commas1 = (x: number) => x.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const sci5 = (x: number) => `${(x * 1e5).toFixed(1)} × 10⁻⁵`

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

export function SunDelayResults({ delayGuess, distanceGuess }: { delayGuess: string | null; distanceGuess: string | null }) {
  const c = resultsCheckUp()
  const rows = stepsTable()
  const delayLabel = delayGuess !== null ? (DELAY_ANSWER_CHOICES.find((x) => x.id === delayGuess)?.label ?? '') : ''
  const distanceLabel = distanceGuess !== null ? (DISTANCE_ANSWER_CHOICES.find((x) => x.id === distanceGuess)?.label ?? '') : ''
  const tag1 = delayGuess !== null ? ` [your guess for Prediction 1: ${delayLabel} longer]` : ''
  const tag2 = distanceGuess !== null ? ` [your guess for Prediction 2: ${distanceLabel}]` : ''
  const at10 = rows.find((r) => r.radii === c.far.radii)!
  const at100 = rows[rows.length - 1]

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0f766e' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: '#0f766e' }}>Part 3: The results</h3>
      <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>What we are about to do.</strong> Here are the numbers behind the pictures, in three tables, each with a short guide. These tables are the real numbers, so they never change with your guesses or with your settings in Part 2.
      </p>

      <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Where this stands (as of October 2026): Settled.</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Settled:</strong> the extra time that the Sun adds to a signal passing it has been measured, in old tests from the 1960s to 2002, and NASA says the most exact of them, with the Cassini spacecraft, fits the theory’s value to {c.tests.cassiniPpm} parts in a million. This page reports those tests. It does not report a new
            result.
          </li>
          <li>
            <strong>Open:</strong> whether any tiny deviation exists below what the tests could see. The abstract of the Cassini paper says its result approaches the level at which, theoretically, deviations are expected in some cosmological models.
          </li>
          <li>
            <strong>What was read:</strong> NASA’s release about the Cassini test, Wikipedia’s account of the delay and its history, and the abstract of the Cassini paper. Shapiro’s paper was not read, and only the abstract of the Cassini paper was. Shapiro’s figures are from Wikipedia’s quotation of him.
          </li>
          <li>
            <strong>Not checked here:</strong> any test newer than Cassini beyond one limited search; the Sun’s hot outer atmosphere, the planets’ own gravity and the motion of the Earth and the target, which the page’s model leaves out; and the split of the extra time into two equal parts, which rests on Wikipedia and not on a paper.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real result for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (how much longer the trip takes when the signal just touches the Sun): you guessed <strong>{delayGuess !== null ? `${delayLabel} longer` : '…'}</strong>. The real number is in Table 1, in the first row, and in the first row of Table 2.
          </li>
          <li>
            <strong>Prediction 2</strong> (the signal passes {c.far.radii} times farther out): you guessed <strong>{distanceGuess !== null ? distanceLabel : '…'}</strong>. The real numbers are in Table 1, in the row beginning “Passing {c.far.radii} solar radii”, and in the row for {c.far.radii} solar radii in Table 2.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1 sets each number beside a reference and says in plain
        words how they compare, with “more” or “less”. It does not say “good” or “bad”, because there is no accepted range for how closely a simple calculation should match an old estimate. “Give-or-take” is the size of the doubt that the people who made a measurement put on it, so a difference smaller than
        the give-or-take is “inside” it. “Parts per million” (ppm) says how closely a test fixed a number: {c.tests.cassiniPpm} ppm is {c.tests.cassiniPpm} in every 1,000,000.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the numbers beside a reference</p>
      <ResultsTable
        minWidth={820}
        head={['What we compare', 'Calculated or measured', 'Reference', 'How to read it']}
        rows={[
          [
            `Trip to Venus just touching the Sun: the extra time (calculated here)${tag1}`,
            `${n1(c.grazing.delayUs)} µs`,
            `Shapiro’s estimate in 1964, as quoted: about ${c.grazing.shapiroUs} µs`,
            `${cap(c.grazing.versusShapiro)}, by ${n1(c.grazing.differenceUs)} µs, which is ${n1(c.grazing.differencePercentOfShapiro)} percent of his figure. The page’s calculation is simplified and his figure is a rounded estimate, quoted second-hand, so the page does not say why they differ or which is closer.`,
          ],
          [
            'The same extra time, as extra path for the signal',
            `${n1(c.grazing.pathKm)} km`,
            `Shapiro’s “equivalent to ${c.grazing.shapiroPathKm} km”, as quoted`,
            `${cap(c.grazing.pathVersusShapiro)}, by ${n1(c.grazing.pathDifferenceKm)} km. This is the same ${n1(c.grazing.differencePercentOfShapiro)} percent as the line above, since it is the same time.`,
          ],
          [
            'The ordinary picture of gravity (imagined for the question)',
            `${n1(c.ordinary.halfUs)} µs`,
            `the full calculation: ${n1(c.ordinary.fullUs)} µs`,
            `${cap(c.ordinary.versusFull)}: exactly ${n2(c.ordinary.fractionOfFull)} of it. The box under Picture 2 says why.`,
          ],
          [
            `Passing ${c.far.radii} solar radii from the Sun’s centre, 10 times farther out (calculated here)${tag2}`,
            `${n1(c.far.delayUs)} µs`,
            `the same trip just touching the Sun: ${n1(c.grazing.delayUs)} µs`,
            `${cap(c.far.versusGrazing)}: ${n2(c.far.timesSmaller)} times smaller.`,
          ],
          [
            'The extra time as a share of the whole trip',
            `${n1(c.grazing.partsPerTenMillion)} parts in ten million`,
            `the whole trip with no effect from the Sun: ${commas1(c.grazing.flatUs)} µs (${n1(c.grazing.flatMinutes)} minutes)`,
            `Far less: about 1 part in ${n1(c.grazing.oneInMillions)} million.`,
          ],
          [
            'How closely the Cassini test fixed the delay, as NASA states it',
            `${c.tests.cassiniPpm} parts per million`,
            `the Viking landers, 1979: about ${c.tests.vikingPpm.toLocaleString('en-US')} parts per million`,
            `${cap(c.tests.versusViking)}, so a closer fit, by a factor of ${n1(c.tests.vikingOverCassini)}. NASA’s release says “${c.tests.jplFactor} times greater” than before.`,
          ],
          [
            `For scale: ${c.tests.cassiniPpm} parts per million of this page’s extra time for the Venus trip`,
            `${n2(c.forScale.cassiniFractionOfGrazingNs)} billionths of a second, which is ${n1(c.forScale.cassiniFractionOfGrazingM)} m of path`,
            `NASA’s Deep Space Network: routine ranging precise to about ${c.forScale.nasaRangingM} m`,
            'Both are of the order of a metre. This is an illustration only: Cassini’s trip had a different shape from the one on this page, and the page did not take its figures.',
          ],
          [
            'Cassini’s own way of writing its result: how far the number called gamma was from 1 (the paper’s abstract; the rest of the paper was not read)',
            `(γ − 1) = (${sci5(c.gamma.gammaMinusOne)}) give-or-take ${sci5(c.gamma.giveOrTake)}`,
            'exact agreement with the theory would be 0',
            `${c.gamma.zeroInside ? 'Inside' : 'Outside'}: 0 is ${sci5(c.gamma.zeroDifference)} away, which is less than the give-or-take of ${sci5(c.gamma.giveOrTake)}. Gamma (γ) is the number in the formula that is 1 in the theory and 0 in the ordinary picture of gravity.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the main numbers of this experiment, each set beside a reference: the extra time for the trip that just touches the Sun, the same trip farther out, the ordinary picture of gravity, how small the extra time is against the trip, and how closely the real tests fixed it.',
          },
          {
            label: 'What it means',
            text: (
              <>
                For the Venus trip that just touches the Sun, the page’s calculation gives {n1(c.grazing.delayUs)} µs, against Shapiro’s quoted {c.grazing.shapiroUs} µs. Ten times farther out it gives {n1(c.far.delayUs)} µs, which is {n2(c.far.timesSmaller)} times smaller. The extra time is about 1 part in {n1(c.grazing.oneInMillions)} million of
                the {n1(c.grazing.flatMinutes)} minute trip. NASA says the Cassini test fixed the delay to {c.tests.cassiniPpm} parts per million, {n1(c.tests.vikingOverCassini)} times closer than the Viking test. Cassini’s own figure has zero inside its give-or-take.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: (
              <>
                a delay of {n1(c.grazing.delayUs)} µs on a trip of {n1(c.grazing.flatMinutes)} minutes is a very small change, and the tests had to find it and then fix it to a tiny fraction of itself. Twenty parts per million of this page’s extra time is {n2(c.forScale.cassiniFractionOfGrazingNs)} billionths of a second, about{' '}
                {n1(c.forScale.cassiniFractionOfGrazingM)} m of path, which is about the same size as the precision NASA’s ranging routinely has. What the figures say about which way of calculating real signals follow is for the tutor.
              </>
            ),
          },
          {
            label: 'How sure the numbers are',
            text: `the calculated numbers are exact arithmetic for the page’s simple model. They use only the main part of the formula, and a fuller calculation adds a smaller term that this page leaves out. The planets’ distances are round figures. Shapiro’s figures are from Wikipedia’s quotation of him. NASA’s “${c.tests.cassiniPpm} parts per million”, “${c.tests.jplFactor} times” and “one part in a thousand” are from its release. Cassini’s (γ − 1) figure is from the paper’s abstract. The “about a metre” ranging figure is from a summary of NASA’s course chapter.`,
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. From the closest distance to the extra time (the Venus trip)</p>
      <ResultsTable
        minWidth={860}
        head={['Closest distance, from the Sun’s centre', 'The extra time', 'The part from time running slower', 'The part from space being stretched', 'Compared with just touching the Sun', 'As extra path']}
        rows={rows.map((r) => [
          `${r.radii === 1 ? '1 solar radius (just touching the surface)' : `${r.radii} solar radii`} (${n1(r.distanceMillionKm)} million km)${r.radii === 1 ? tag1 : r.radii === c.far.radii ? tag2 : ''}`,
          `${n1(r.delayUs)} µs`,
          `${n1(r.timeSlowingUs)} µs`,
          `${n1(r.spaceStretchingUs)} µs`,
          r.radii === 1 ? 'the starting point' : `${n2(r.timesSmallerThanAt1)} times smaller`,
          `${n1(r.pathKm)} km`,
        ])}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the extra time for the same trip, the Earth to Venus and back, at every closest distance you can choose in Part 2, with the two parts of it from the box under Picture 2.',
          },
          {
            label: 'What it means',
            text: (
              <>
                The extra time falls as the signal passes farther from the Sun, but slowly: from {n1(rows[0].delayUs)} µs to {n1(at10.delayUs)} µs at ten times the distance, and to {n1(at100.delayUs)} µs at a hundred times, which is {n1(at100.timesSmallerThanAt1)} times smaller. In every row the two parts are equal, and they add up to the extra time.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'a signal does not have to touch the Sun to be delayed. At a hundred solar radii the extra time is still tens of microseconds, so the Sun’s effect on a signal reaches a long way out. Why it falls so slowly is for the tutor.',
          },
          {
            label: 'How sure the numbers are',
            text: `exact arithmetic for the page’s model, for the Earth at ${EARTH_DISTANCE_AU} AU and Venus at ${TARGET_CHOICES.find((x) => x.id === 'venus')!.distanceAu} AU on opposite sides of the Sun. The page does not claim that any test measured the delay at each of these distances.`,
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. What has been tested, and what has not</p>
      <ResultsTable minWidth={680} head={['Idea', 'What has been found', 'Status']} rows={TESTED.map((r) => [r.idea, r.what, r.status])} />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'a short list of the ideas on this page, each with what has been found and a plain label for how far it has been tested. It is a list of what this page found, not of every study.',
          },
          {
            label: 'What it means',
            text: 'three rows are measurements, all old: the first radar tests, the Viking landers and the Cassini spacecraft. “Calculated here” means worked out on this page. “Not covered here” means outside this experiment. It does not mean nothing has been done.',
          },
          {
            label: 'Why it matters',
            text: 'this is the line between what was measured and what this page worked out. The extra time at different distances, and its two equal parts, are calculated here. The measurements are the three tests, and only as their figures were quoted to this page.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the Viking and Cassini figures are from NASA’s release, which was read. Shapiro’s figures are from Wikipedia’s quotation. The Cassini paper’s own figure is from its abstract. No paper was read in full, and the search for newer tests was limited.',
          },
        ]}
      />
      <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>The papers and pages behind these numbers.</strong> They are listed here, after the run, because they give away what the tests found. Links open in a new tab. The Nature page and the NASA release were opened in a browser on 1 November 2026. The Wikipedia page was read through a fetch tool the same day. Only the
          abstract of the Cassini paper was read. No paper was read in full.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <ExternalLink href="https://www.nature.com/articles/nature01997">Bertotti, Iess and Tortora, “A test of general relativity using radio links with the Cassini spacecraft”, Nature 425, 374–376 (25 September 2003)</ExternalLink>: the Cassini test in Picture 4 and Table 1. This link goes to the publisher’s page, which shows the abstract. The rest of the paper is behind a
            subscription and was not read. The abstract says the team measured the frequency shift of radio waves (the change in how many wave crests arrive each second) to and from Cassini as they passed near the Sun, and gives the result gamma = 1 + ({sci5(c.gamma.gammaMinusOne)} ± {sci5(c.gamma.giveOrTake)}). It also says that gamma is 1 in general relativity and 0 in the Newtonian model of gravity (the ordinary picture).
          </li>
          <li>
            <ExternalLink href="https://www.jpl.nasa.gov/news/saturn-bound-spacecraft-tests-einsteins-theory/">NASA Jet Propulsion Laboratory, “Saturn-Bound Spacecraft Tests Einstein’s Theory” (2 October 2003)</ExternalLink>: a plain account of the Cassini test, and the source of the “{c.tests.cassiniPpm} parts per million”, the “{c.tests.jplFactor} times greater” and the “one part per thousand” for the Viking landers in 1979 that this page
            uses. The release names the paper “A New Test of General Relativity With the Cassini Space Mission”, which is not the title that Nature shows. This page uses Nature’s.
          </li>
          <li>
            <ExternalLink href="https://en.wikipedia.org/wiki/Shapiro_time_delay">Wikipedia, “Shapiro time delay”</ExternalLink>: not an official source and not a paper. It is where this page’s formula, Shapiro’s 1964 figures (as it quotes them) and the account of the 1966 and 1967 radar tests come from.
          </li>
          <li>
            <strong>Not linked</strong> (no readable copy could be opened here): Shapiro’s paper, “Fourth Test of General Relativity”, Physical Review Letters 13, 789 (1964), whose publisher’s page was refused on 1 November 2026 (a security check in a browser; HTTP 403 earlier). The figures of about {c.grazing.shapiroUs} µs, {c.grazing.shapiroPathKm} km and {c.shapiroEstimatePercent[0]} to {c.shapiroEstimatePercent[1]} percent are from Wikipedia’s quotation of it, not
            from the paper. Also not linked: Reasenberg and others, “Viking relativity experiment: verification of signal retardation by solar gravity”, Astrophysical Journal 234, L219 (1979). The Cassini paper lists it as the Viking test of the delay, and its title and place of publication are taken from that list. The archive page asked for human
            verification and was not opened. The page’s “one part in a thousand” is NASA’s statement, and the Cassini abstract also says that earlier experiments confirmed the delay to about 0.1 percent.
          </li>
        </ul>
      </div>
    </div>
  )
}
