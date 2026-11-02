import type { ReactNode } from 'react'
import {
  DIFFERENCE_ANSWER_CHOICES,
  DIPOLE_DIRECTION_GALACTIC,
  MICROWAVE_TEMPERATURE_K,
  PLANCK_DIPOLE_AMPLITUDE_UK,
  PUBLISHED_SPEED_KM_S,
  QUASAR_2021_CHANCE,
  QUASAR_COUNT,
  QUASAR_DIRECTION_GALACTIC,
  QUASAR_EXPECTED_AMPLITUDE,
  QUASAR_OBSERVED_AMPLITUDE,
  QUASAR_SIGNIFICANCE,
  SPEED_ANSWER_CHOICES,
  SPEED_OF_LIGHT_KM_S,
  SROLL_DIPOLE_AMPLITUDE_UK,
  coinFlipsInARow,
  dipole,
  resultsCheckUp,
  stepsTable,
} from '../physics/microwaveDipole'
import type { PairReading } from '../physics/microwaveDipole'
import { ResultsTable } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 7: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's guesses or settings. The wording is Claude's DRAFT of 2026-11-02,
// for the owner's approval line by line (CLAUDE.md §28.1). Why a moving observer sees the sky warmer ahead, and what could explain the quasar mismatch, are left to the tutor (CLAUDE.md §12, §13).
// The papers and pages behind the numbers are listed at the end (a later step), after the run.

const noteStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' } as const
const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)
const n3 = (x: number) => x.toFixed(3)
const k6 = (x: number) => x.toFixed(6)
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
// Lower-case only the first letter, so that a unit such as the K in kelvin keeps its capital.
const lowerFirst = (w: string) => w.charAt(0).toLowerCase() + w.slice(1)
const km = (x: number) => x.toLocaleString('en-US', { maximumFractionDigits: 2 })

function Note({ items }: { items: { label: string; text: ReactNode }[] }) {
  return (
    <div style={noteStyle}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What this table tells us.</strong>
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
        {items.map((item) => (
          <li key={item.label} style={{ marginBottom: '0.5rem' }}>
            <strong>{item.label}:</strong> {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

// A plain reading of two numbers with their give-or-takes (no other cut-off).
function readPair(p: PairReading, digits: (x: number) => string, unit: string): string {
  if (p.overlap) return `${cap(p.reading)}: they differ by ${digits(p.difference)} ${unit}, and their give-or-takes added together are ${digits(p.combinedGiveOrTake)} ${unit}, so each reaches the other.`
  return `${cap(p.reading)}: they differ by ${digits(p.difference)} ${unit}, and their give-or-takes added together are only ${digits(p.combinedGiveOrTake)} ${unit}, so the two do not reach each other.`
}

export function MicrowaveDipoleResults({ differenceGuess, speedGuess }: { differenceGuess: string | null; speedGuess: string | null }) {
  const c = resultsCheckUp()
  const t = stepsTable()
  const d = dipole(t.speedKmS)
  const differenceLabel = differenceGuess !== null ? lowerFirst(DIFFERENCE_ANSWER_CHOICES.find((x) => x.id === differenceGuess)?.label ?? '') : ''
  const speedLabel = speedGuess !== null ? lowerFirst(SPEED_ANSWER_CHOICES.find((x) => x.id === speedGuess)?.label ?? '') : ''
  const tag1 = differenceGuess !== null ? ` [your guess for Prediction 1: ${differenceLabel}]` : ''
  const tag2 = speedGuess !== null ? ` [your guess for Prediction 2: ${speedLabel}]` : ''
  const light = Math.round(SPEED_OF_LIGHT_KM_S).toLocaleString('en-US')
  const publishedPercent = (PUBLISHED_SPEED_KM_S.giveOrTake / PUBLISHED_SPEED_KM_S.value) * 100
  const amplitudePercent = (PLANCK_DIPOLE_AMPLITUDE_UK.giveOrTake / PLANCK_DIPOLE_AMPLITUDE_UK.value) * 100
  const flips = coinFlipsInARow(QUASAR_2021_CHANCE)
  const [s26a, s26b, s26c] = QUASAR_SIGNIFICANCE.bashir2026
  const low26 = Math.min(s26a, s26b, s26c)
  const high26 = Math.max(s26a, s26b, s26c)

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0f766e' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: '#0f766e' }}>Part 3: The results</h3>
      <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>What we are about to do.</strong> Here are the numbers behind the pictures, in three tables, each with a short guide. These tables are the real numbers, so they never change with your guesses or with your settings in Part 2.
      </p>

      <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Where this stands (as of November 2026): Settled for the microwave sky, Contested for the quasars.</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Settled:</strong> the microwave glow is a little warmer in one direction and a little cooler in the opposite one, and the size of the difference fits a Solar System moving at about {Math.round(t.speedKmS)} km/s relative to the glow’s own frame. NASA’s table lists five analyses of the pattern, from 1996 to 2021, and
            two of them are in Table 1. These are old, much-repeated measurements, not a new result.
          </li>
          <li>
            <strong>Contested:</strong> whether faraway quasars agree. Their counts are lopsided in a similar direction, but {n2(c.quasarSize.timesExpected)} times as much as our motion alone should give. Three published analyses of the same quasars give {QUASAR_SIGNIFICANCE.secrest2021}σ (2021), “exceeds 5σ” (a 2025 review) and {low26}σ to {high26}σ (2026). The page shows all three and does not
            choose between them.
          </li>
          <li>
            <strong>What was read:</strong> NASA’s table of the dipole’s size and direction; the start of the 2025 review and the abstracts of the quasar papers; the 2021 paper’s numbers through a converted web copy. No paper was read in full.
          </li>
          <li>
            <strong>Not checked here:</strong> the quasar counts themselves, and why the quasar pattern is bigger than expected; the older measurements (COBE, 1996, and WMAP, 2009) that NASA’s table lists, which are not shown; the small yearly change as the Earth goes round the Sun; and any newer result beyond one limited search.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real result for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (the difference between the temperature straight ahead and straight behind): you guessed <strong>{differenceGuess !== null ? differenceLabel : '…'}</strong>. The real number is in Table 2, in step 7.
          </li>
          <li>
            <strong>Prediction 2</strong> (the Solar System’s speed relative to the glow): you guessed <strong>{speedGuess !== null ? speedLabel : '…'}</strong>. The real numbers are in Table 1, in the first row, and in Table 2, in step 9.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1 sets each number beside a reference and says in plain words how they compare.
        “Give-or-take” is the size of the doubt that the people who made a number put on it: 3362.08 ± 0.64 means “about 3362.08, give or take 0.64”. Two numbers are called “the same” here only when their give-or-takes added together are big enough for each to reach the other. Otherwise the table says “more” or “less”. It does not say
        “good” or “bad”, because there is no accepted range for how closely two directions, or a count and a calculation, should agree.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the numbers beside a reference</p>
      <ResultsTable
        minWidth={860}
        head={['What we compare', 'Found', 'Reference', 'How to read it']}
        rows={[
          [
            `The speed relative to the glow, worked out here from the measured size of the warm-to-average difference (calculated here)${tag2}`,
            `${n2(c.speedFromAmplitude.found.value)} km/s`,
            `the published speed: ${km(PUBLISHED_SPEED_KM_S.value)} ± ${PUBLISHED_SPEED_KM_S.giveOrTake} km/s`,
            `${readPair(c.speedFromAmplitude, n3, 'km/s')} The speed is calculated from the size, so this row checks the arithmetic and does not add a new measurement.`,
          ],
          [
            'The size of the warm-to-average difference (the amplitude): two analyses of the Planck satellite’s data',
            `${PLANCK_DIPOLE_AMPLITUDE_UK.value} ± ${PLANCK_DIPOLE_AMPLITUDE_UK.giveOrTake} µK (Planck, 2020)`,
            `${SROLL_DIPOLE_AMPLITUDE_UK.value} ± ${SROLL_DIPOLE_AMPLITUDE_UK.giveOrTake} µK (a reanalysis called SRoll2.2, 2021)`,
            readPair(c.twoAnalyses, n2, 'µK'),
          ],
          [
            'The size worked out here from the measured speed (calculated here)',
            `${n2(c.pageAmplitude.found.value)} µK`,
            `Planck’s measured size: ${PLANCK_DIPOLE_AMPLITUDE_UK.value} ± ${PLANCK_DIPOLE_AMPLITUDE_UK.giveOrTake} µK`,
            `${cap(c.pageAmplitude.reading)}: ${n2(c.pageAmplitude.difference)} µK apart, inside the ${PLANCK_DIPOLE_AMPLITUDE_UK.giveOrTake} µK give-or-take. This is the row above turned round, so it is not an independent check.`,
          ],
          [
            `How lopsided the counts of ${QUASAR_COUNT.toLocaleString('en-US')} quasars are (counted)`,
            `${QUASAR_OBSERVED_AMPLITUDE}`,
            `the size expected from our motion alone: about ${QUASAR_EXPECTED_AMPLITUDE} (calculated by the paper’s authors)`,
            `${cap(c.quasarSize.reading)}: ${n2(c.quasarSize.timesExpected)} times the expected size. The paper says “over twice as large as expected”. This page has no give-or-take for either number, so the table gives no verdict on the gap. Table 3 gives the papers’ own measures.`,
          ],
          [
            'The direction of the quasar dipole beside the microwave dipole (calculated here from the two sets of coordinates)',
            `${n2(c.direction.separationDegrees)}° apart`,
            'the same direction (0° apart)',
            `Not the same direction: ${n2(c.direction.separationDegrees)}° apart (the paper states ${c.direction.paperStatesDegrees}°). There is no accepted range for how close the two should be, so the page gives no verdict. The paper calls the two directions similar.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'The speed worked out from the size',
            text: (
              <>
                <em>What it is:</em> the Solar System’s speed relative to the glow, found not with a speedometer but from how big the warm-to-average difference is. <em>What it means:</em> {PLANCK_DIPOLE_AMPLITUDE_UK.value} µK is {(PLANCK_DIPOLE_AMPLITUDE_UK.value / 1000000).toFixed(8)} K. Divided by the average temperature of {MICROWAVE_TEMPERATURE_K} K that is {t.beta.toFixed(7)}, and times the speed of light, {light} km/s, it is {n2(c.speedFromAmplitude.found.value)} km/s,
                the published figure. It is like working out how fast a car is going from how much higher its horn sounds as it comes toward you. <em>Why it matters:</em> the whole result rests on this one number, a speed of about {Math.round(t.speedKmS)} km/s. <em>How sure:</em> the published give-or-take is {n2(publishedPercent)} percent of the speed. The number is only as good as the idea that all of the pattern comes from our motion, and the quasar rows are a test of that idea.
              </>
            ),
          },
          {
            label: 'Two analyses of the amplitude',
            text: (
              <>
                <em>What it is:</em> the size of the warm-to-average difference, as found by two analyses of the same satellite’s data. <em>What it means:</em> {PLANCK_DIPOLE_AMPLITUDE_UK.value} ± {PLANCK_DIPOLE_AMPLITUDE_UK.giveOrTake} and {SROLL_DIPOLE_AMPLITUDE_UK.value} ± {SROLL_DIPOLE_AMPLITUDE_UK.giveOrTake} differ by {n2(c.twoAnalyses.difference)}, less than the {n2(c.twoAnalyses.combinedGiveOrTake)} their give-or-takes add up to, so they are “the same”. It is like two people weighing the same bag of flour on two good scales and getting 3362.08 and 3361.90 grams. <em>Why it matters:</em> the size of the pattern is
                pinned down to about {n2(amplitudePercent)} percent, so a speed worked out from it is tight too. <em>How sure:</em> both analyses use the same satellite’s data, so they are not two independent measurements, and the page does not show the older measurements in NASA’s table.
              </>
            ),
          },
          {
            label: 'The size worked out from the speed',
            text: (
              <>
                <em>What it is:</em> the same calculation as the first row, run the other way: from the speed to the size. <em>What it means:</em> {n2(c.pageAmplitude.found.value)} µK against {PLANCK_DIPOLE_AMPLITUDE_UK.value} ± {PLANCK_DIPOLE_AMPLITUDE_UK.giveOrTake}. <em>Why it matters:</em> it shows the page’s arithmetic is consistent. It is not a test of the physics. <em>How sure:</em> it is exactly as sure as the speed it started from.
              </>
            ),
          },
          {
            label: 'How lopsided the quasar counts are',
            text: (
              <>
                <em>What it is:</em> the quasars were counted all over the sky. A few more are seen on one side than on the other, and the number says how many more, as a fraction of the average count. <em>What it means:</em> {QUASAR_OBSERVED_AMPLITUDE} is about {n1(QUASAR_OBSERVED_AMPLITUDE * 100)} percent more than average on one side, against about {n1(QUASAR_EXPECTED_AMPLITUDE * 100)} percent expected: {n2(c.quasarSize.timesExpected)} times as much.{' '}
                <em>Why it matters:</em> if the same motion made both the microwave pattern and the quasar pattern, the two should agree. This is the reason the second result is Contested. <em>How sure:</em> the expected size is rounded by the paper, and this page has no give-or-take for either number. How surprising the gap is, is what Table 3 sets out.
              </>
            ),
          },
          {
            label: 'The direction of the quasar dipole',
            text: (
              <>
                <em>What it is:</em> the angle between the direction the quasar counts point to and the direction the microwave glow is warmest. <em>What it means:</em> they are {n2(c.direction.separationDegrees)}° apart. The whole sky is 360° round, so that is less than a tenth of the way round. <em>Why it matters:</em> the two patterns point roughly the same way. The mismatch is mostly in size. <em>How sure:</em> the microwave direction (l = {DIPOLE_DIRECTION_GALACTIC.l}°, b = {DIPOLE_DIRECTION_GALACTIC.b}°) is from NASA’s table and the quasar direction (l = {QUASAR_DIRECTION_GALACTIC.l}°, b = {QUASAR_DIRECTION_GALACTIC.b}°) is from the 2021 paper.
                The angle is worked out here and agrees with the paper’s {c.direction.paperStatesDegrees}°. This page read no give-or-take for the quasar direction, so it cannot say how close “similar” is.
              </>
            ),
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. This page’s calculation, step by step</p>
      <ResultsTable
        minWidth={860}
        head={['Step', 'What it is', 'Value', 'How to read it']}
        rows={[
          ['1', 'The glow’s average temperature', `${t.averageK} K`, 'Measured. Quoted from a 2025 review.'],
          ['2', 'The Solar System’s speed relative to the glow', `${km(t.speedKmS)} km/s`, `Measured with Planck. The published value, give or take ${PUBLISHED_SPEED_KM_S.giveOrTake} km/s.`],
          ['3', 'The speed as a fraction of the speed of light', `${t.beta.toFixed(7)}, which is 1 part in ${n1(t.betaOneInParts)}`, `${km(t.speedKmS)} ÷ ${light} = ${t.beta.toFixed(7)}.`],
          ['4', 'The temperature straight ahead', `${k6(t.aheadK)} K`, 'Worked out from steps 1 to 3 with the rule for light and motion from Experiment 8.'],
          ['5', 'The temperature straight behind', `${k6(t.behindK)} K`, 'The same rule, for the opposite direction.'],
          ['6', 'The temperature sideways', `${k6(t.sidewaysK)} K`, `The same rule, for a direction at right angles. It is very close to the average, ${t.averageK} K.`],
          [
            `7${tag1}`,
            'The difference between straight ahead and straight behind',
            `${k6(t.aheadMinusBehindK)} K, which is ${n2(t.aheadMinusBehindK * 1000)} mK`,
            `Step 4 minus step 5: ${k6(t.aheadK)} − ${k6(t.behindK)}. Straight ahead is ${n3(d.aheadWarmerThanAverageK * 1000)} mK above the average, and straight behind is ${n3(d.behindCoolerThanAverageK * 1000)} mK below it.`,
          ],
          ['8', 'The size of the warm-to-average difference (the amplitude)', `${n2(t.amplitudeFirstOrderMicrokelvin)} µK`, `Step 3 times step 1: ${t.beta.toFixed(7)} × ${t.averageK} K. This simple size is the one Planck’s figure is quoted as.`],
          [
            `9${tag2}`,
            'The speed worked back out from Planck’s measured size',
            `${n2(t.speedFromPublishedAmplitudeKmS)} km/s`,
            `${PLANCK_DIPOLE_AMPLITUDE_UK.value} µK ÷ 1,000,000 ÷ ${t.averageK} K × ${light} km/s.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What the steps are',
            text: (
              <>
                <em>What it is:</em> the whole calculation, from the average temperature and the speed to the temperatures in three directions. <em>What it means:</em> it is a chain, each step using the one before. Steps 1 to 3 are the inputs (two measured numbers and their ratio to the speed of light); steps 4 to 6 apply one rule to them; steps 7 and 8 turn the temperatures into a difference and a size; step 9 runs the chain backwards, from Planck’s measured size to a speed. <em>Why it matters:</em> nothing in
                the chain is a guess: change the speed in step 2 and every later number changes with it, which is what Part 2 lets you try. <em>How sure:</em> it is exactly as sure as the two measured numbers it starts from.
              </>
            ),
          },
          {
            label: 'How small the difference is',
            text: (
              <>
                <em>What it is:</em> step 3 says the speed is 1 part in {n1(t.betaOneInParts)} of the speed of light. <em>What it means:</em> the glow’s temperature changes by about the same fraction: straight ahead it is about 1 part in {Math.round(t.betaOneInParts)} warmer than the average. That is like a rope 8 metres long being 1 centimetre longer. <em>Why it matters:</em> this is why it takes a very sensitive instrument to measure the pattern.
                <em>How sure:</em> this follows from steps 2 and 3, so it is as sure as the speed is.
              </>
            ),
          },
          {
            label: 'The two sides are not quite equal',
            text: (
              <>
                <em>What it is:</em> straight ahead is {n3(d.aheadWarmerThanAverageK * 1000)} mK above the average and straight behind is {n3(d.behindCoolerThanAverageK * 1000)} mK below it, so step 7 is not exactly twice step 8. <em>What it means:</em> step 8, the simple size, {n3(t.amplitudeFirstOrderMicrokelvin / 1000)} mK, lies between the two. The exact rule treats the two sides slightly differently. <em>Why it matters:</em> Planck’s figure is quoted as the simple size, so this page compares it with step 8, and not
                with half of step 7. The gap, {n1((d.aheadWarmerThanAverageK * 1000000) - t.amplitudeFirstOrderMicrokelvin)} µK, is bigger than the {PLANCK_DIPOLE_AMPLITUDE_UK.giveOrTake} µK give-or-take on Planck’s number, so the choice matters at that level. <em>How sure:</em> that Planck’s figure is the simple size is the usual meaning of “amplitude” for this pattern, and the 2025 review writes the pattern’s size to this simple order; the page did not check it against the Planck papers.
              </>
            ),
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. The second test: counts of distant quasars (quoted from papers)</p>
      <ResultsTable
        minWidth={860}
        head={['Number', 'Value', 'Where it comes from', 'How to read it']}
        rows={[
          ['The quasars counted', `${QUASAR_COUNT.toLocaleString('en-US')} quasars`, 'The 2021 paper’s final sample, from the WISE satellite’s CatWISE2020 catalogue.', 'A quasar is the very bright centre of a very distant galaxy.'],
          ['How lopsided the counts are', `${QUASAR_OBSERVED_AMPLITUDE}`, 'Counted. The 2021 paper.', `About ${n1(QUASAR_OBSERVED_AMPLITUDE * 100)} percent more than average on one side, ${n1(QUASAR_OBSERVED_AMPLITUDE * 1000)} in every 1,000.`],
          ['How lopsided they should be from our motion alone', `about ${QUASAR_EXPECTED_AMPLITUDE}`, 'Calculated by the 2021 paper’s authors, and rounded by the paper.', `About ${n1(QUASAR_EXPECTED_AMPLITUDE * 100)} percent, ${n1(QUASAR_EXPECTED_AMPLITUDE * 1000)} in every 1,000.`],
          ['The counted size divided by the expected size', n2(c.quasarSize.timesExpected), 'Calculated here.', 'The paper says “over twice as large as expected”.'],
          ['The direction the counts point to', `l = ${QUASAR_DIRECTION_GALACTIC.l}°, b = ${QUASAR_DIRECTION_GALACTIC.b}°`, 'The 2021 paper.', `${n2(c.direction.separationDegrees)}° from the microwave dipole’s direction (calculated here; the paper states ${c.direction.paperStatesDegrees}°).`],
          [
            'How sure, 2021',
            `${QUASAR_SIGNIFICANCE.secrest2021}σ (a chance of 5 in 10 million, p = 5 × 10⁻⁷)`,
            'The 2021 paper’s abstract, counted one-sided.',
            `The paper says that if motion alone made the pattern, a count this lopsided would turn up by chance about 5 times in 10 million. That is about as unlikely as a fair coin landing heads ${Math.round(flips)} times in a row.`,
          ],
          ['How sure, 2025', '“now exceeds 5σ”', 'A 2025 review by Secrest, von Hausegger, Rameez, Mohayaee and Sarkar: five of the six authors of the 2021 paper.', 'The review’s own words, from its abstract. It gives no single figure there.'],
          [
            'How sure, 2026',
            `${s26a}σ, ${s26b}σ and ${s26c}σ`,
            'A reanalysis of the same quasars (Bashir, Chingangbam and Appleby), accepted for publication in the Astrophysical Journal.',
            `The three figures are for three different assumptions about how the quasars bunch together: no clustering pattern (${s26a}σ), one pointing in a random direction (${s26b}σ), and one pointing the same way as our motion (${s26c}σ).`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What the table is',
            text: (
              <>
                <em>What it is:</em> the second test of the idea that our motion makes the microwave pattern. If it does, then the count of faraway objects should be lopsided too, in the same direction, by an amount that can be calculated. <em>What it means:</em> the direction is similar ({n2(c.direction.separationDegrees)}° apart) but the size is {n2(c.quasarSize.timesExpected)} times what was calculated. <em>Why it matters:</em> a settled result in one place and a mismatch in another is how science learns what is solid and what is not. <em>How sure:</em> the next two items.
              </>
            ),
          },
          {
            label: 'What σ means',
            text: (
              <>
                <em>What it is:</em> a measure of how surprising a result would be if only chance were at work: the bigger the number, the less likely chance is. <em>What it means:</em> for the 2021 paper’s {QUASAR_SIGNIFICANCE.secrest2021}σ the chance is 5 in 10 million, about the same as getting heads {Math.round(flips)} times in a row when flipping a coin ({flips.toFixed(1)} flips if you work it out exactly). <em>Why it matters:</em> it tells you how much weight to give a difference, though not what causes it.{' '}
                <em>How sure:</em> the page worked out the coin-flip comparison from the paper’s own chance. It did not work out a chance for the other two analyses, whose method it did not read in full.
              </>
            ),
          },
          {
            label: 'Why the three analyses differ',
            text: (
              <>
                <em>What it means:</em> the 2026 reanalysis used the same quasars and gives {low26}σ to {high26}σ, lower than 2021’s {QUASAR_SIGNIFICANCE.secrest2021}σ. It says the difference is reduced but “cannot be explained solely by the clustering dipole or mode coupling from the survey mask”. The 2025 review, by authors of the 2021 paper, says it “now exceeds 5σ”. <em>Why it matters:</em> the analyses agree that the counted size is larger than expected, and disagree on how surprising that is. That is why the
                page calls this part Contested, and does not choose. <em>How sure:</em> all three are as quoted from abstracts, and the reasons for the differences were not worked out here.
              </>
            ),
          },
        ]}
      />
    </div>
  )
}