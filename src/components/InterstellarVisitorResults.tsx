import type { ReactNode } from 'react'
import { BEND_CHOICES, SPEED_CHOICES, exampleSteps, knownObjects, resultsCheckUp } from '../physics/interstellarVisitor'
import type { BendChoiceId, Comparison, SpeedChoiceId } from '../physics/interstellarVisitor'
import { ResultsTable } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 24: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's guesses or
// settings. The wording is a DRAFT for the owner's line-by-line approval (CLAUDE.md §28.1). The explanation of why a path is open or closed, why the speed rises and why a faster
// visitor is bent less, and any verdict, are left to the tutor (CLAUDE.md §12, §13).

const noteStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' } as const
const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function n1(x: number): string {
  return x.toFixed(1)
}
function n2(x: number): string {
  return x.toFixed(2)
}
function commas(x: number): string {
  return Math.round(x).toLocaleString('en-US')
}
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

export function InterstellarVisitorResults({ bendGuess, speedGuess }: { bendGuess: BendChoiceId | null; speedGuess: SpeedChoiceId | null }) {
  const c = resultsCheckUp()
  const s = exampleSteps()
  const known = knownObjects()
  const bendLabel = bendGuess !== null ? (BEND_CHOICES.find((x) => x.id === bendGuess)?.label ?? '') : ''
  const speedLabel = speedGuess !== null ? (SPEED_CHOICES.find((x) => x.id === speedGuess)?.label ?? '') : ''
  const tag1 = bendGuess !== null ? ` [your guess for Prediction 1: ${bendLabel}]` : ''
  const tag2 = speedGuess !== null ? ` [your guess for Prediction 2: ${speedLabel}]` : ''
  const gmText = `${(s.gm / 1e20).toFixed(3)} × 10²⁰ m³/s²`

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0f766e' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: '#0f766e' }}>Part 3: The results</h3>
      <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>What we are about to do.</strong> Here are the numbers behind the pictures, set out in three tables, each with a short guide to reading it. These tables are the real numbers, so they never change with your guesses or with your settings in Part 2.
      </p>

      <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Where this stands (as of October 2026).</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Settled:</strong> that 3I/ATLAS came from outside our solar system, and its path round the Sun, to the precision that is published (an eccentricity of {c.eccentricityPublished}, and a closest approach of {s.closestApproachAu} AU). The Sun’s gravity alone gives the speeds and
            the bend in this page’s pictures.
          </li>
          <li>
            <strong>Not part of this experiment:</strong> what 3I/ATLAS is made of, how old it is and how its gas and dust behave. They are being studied, and some are debated.
          </li>
          <li>The numbers come from the discovery paper’s abstract, a Wikipedia table of its orbit, and the pages of NASA and ESA. No paper was read in full for this page, so each published number should be checked against its source.</li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real number for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (how much the Sun bends the path of 3I/ATLAS): you guessed <strong>{bendGuess !== null ? bendLabel : '…'}</strong>. The real calculated number is in Table 1, in the row “Total bend”, in Table 2, in the row “Total bend”, and in Table 3, in the row for 3I/ATLAS.
          </li>
          <li>
            <strong>Prediction 2</strong> (its speed at its closest approach): you guessed <strong>{speedGuess !== null ? speedLabel : '…'}</strong>. The real calculated number is in Table 1, in the row “Speed at closest approach”, and in Table 2, in the row “Speed at closest approach”.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1 is a check-up: it sets each calculated
        number beside a published number, or beside a comparison this page sets, and says in plain words how they compare, with “the same”, “more” or “less”. “The same” means that the two agree when both are rounded to the precision of the published number. It does not say “good” or “bad”, because there is no
        accepted range for how closely a calculated number should match. The <strong>eccentricity</strong> is the number that says how open a path is, and the <strong>bend</strong> is the angle through which the Sun’s pull turns the object’s direction of travel, as in Picture 1.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the calculated numbers beside the published ones, or the comparison this page sets</p>
      <ResultsTable
        minWidth={760}
        head={['What we compare', 'Calculated here', 'Published value, or the comparison used here', 'How to read it']}
        rows={[
          [
            'Speed far from the Sun',
            `${n1(c.speedFarAwayKmS)} km/s, worked out from the eccentricity and the closest approach`,
            `${c.speedFarAwayPublishedKmS} km/s, in the discovery paper’s abstract`,
            `${comparisonWord(c.speedFarAwayComparison)}, to the nearest km/s.`,
          ],
          [
            'Eccentricity, from the rounded speed far away and the closest approach',
            n2(c.eccentricityFromRounded),
            `${c.eccentricityPublished}, in Wikipedia’s table of the orbit (the abstract gives about 6.1)`,
            `${comparisonWord(c.eccentricityComparison)}, to two decimal places.`,
          ],
          [
            `Speed at closest approach${tag2}`,
            `${n1(c.speedAtClosestKmS)} km/s, which is ${commas(c.speedAtClosestMph)} miles an hour and ${commas(c.speedAtClosestKmH)} km/h`,
            `NASA: about ${commas(c.nasaMph)} miles an hour (${n1(c.nasaKmS)} km/s)`,
            `${comparisonWord(c.nasaComparison)}, to the nearest thousand miles an hour.`,
          ],
          [
            'Speed at closest approach, again',
            `${n1(c.speedAtClosestKmS)} km/s`,
            `ESA: roughly ${commas(c.esaKmH)} km/h (${n1(c.esaKmS)} km/s)`,
            `${comparisonWord(c.esaComparison)}, to the nearest ten thousand km/h.`,
          ],
          [
            'Escape speed at closest approach',
            `${n1(c.escapeSpeedAtClosestKmS)} km/s`,
            `the object’s own speed there, ${n1(c.speedAtClosestKmS)} km/s (a comparison set by this page, not a published number)`,
            `Less: the object is going ${n2(c.speedOverEscape)} times as fast as the escape speed.`,
          ],
          [
            `Total bend${tag1}`,
            `${n1(c.bendDegrees)} degrees`,
            `the bends worked out the same way for ʻOumuamua, ${n1(c.oumuamuaBendDegrees)} degrees, and Borisov, ${n1(c.borisovBendDegrees)} degrees (no published bend of 3I/ATLAS was found)`,
            `${comparisonWord(c.bendVersusOumuamua)} than ʻOumuamua’s, and ${c.bendVersusBorisov} than Borisov’s.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the speeds, the eccentricity and the bend of 3I/ATLAS from the calculation, each set beside a published number where there is one, or beside a comparison that this page sets.',
          },
          {
            label: 'What it means',
            text: (
              <>
                Worked out from the closest approach and the eccentricity, the speed far from the Sun is {n1(c.speedFarAwayKmS)} km/s, the same as the {c.speedFarAwayPublishedKmS} km/s in the discovery paper’s abstract. The speed at the closest approach is {n1(c.speedAtClosestKmS)} km/s, which is about {commas(c.speedAtClosestMph)} miles an hour. NASA gives about {commas(c.nasaMph)} and ESA
                roughly {commas(c.esaKmH)} km/h, and both are the same as the calculation at the precision they give. At that distance the escape speed is {n1(c.escapeSpeedAtClosestKmS)} km/s, so the object is going {n2(c.speedOverEscape)} times as fast as the escape speed. The total bend is {n1(c.bendDegrees)} degrees, smaller than the bend of either of the
                two earlier visitors, {n1(c.oumuamuaBendDegrees)} degrees for ʻOumuamua and {n1(c.borisovBendDegrees)} degrees for Borisov (Table 3).
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'the speeds agree with the published ones, so the calculation of the Sun’s gravity alone reproduces the numbers that are given for 3I/ATLAS. The bend is a calculation and not a measurement: no published bend was found, and it follows from the eccentricity. What the speeds and the bend mean is for the tutor.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the eccentricity and the closest approach come from Wikipedia’s table of the orbit, which is a secondary source (the discovery paper’s abstract agrees to two figures; the astronomers’ own orbit tables were not read). NASA and ESA do not say how their speeds were worked out, so the agreement checks this arithmetic and may not be an independent test of it. The calculation leaves out the planets’ pulls and the push of the comet’s own gas; astronomers have measured a tiny push of that kind, and its effect on these numbers was not worked out here. The formulas are standard results for a path under the Sun’s gravity alone, worked out by hand and by a separate script, and not read at a source.',
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. From two numbers to the speeds and the bend</p>
      <ResultsTable
        minWidth={640}
        head={['Step', '3I/ATLAS', 'How to read it']}
        rows={[
          ['The strength of the Sun’s pull (GM)', gmText, 'A number for how strong the Sun’s gravity is: the Sun’s mass times the constant of gravity. A standard value.'],
          ['Closest approach (q)', `${s.closestApproachAu} AU, which is ${commas(s.closestApproachMillionKm)} million km`, 'How near the object came to the Sun. Published.'],
          ['Eccentricity (e)', `${s.eccentricity}`, 'How open the path is. Published.'],
          ['Speed far from the Sun', `${n1(s.speedFarAwayKmS)} km/s`, `The square root of (e − 1) × GM ÷ q, which is the square root of ${n2(s.eccentricity - 1)} × GM ÷ q.`],
          ['Escape speed at closest approach', `${n1(s.escapeSpeedKmS)} km/s`, 'The square root of 2 × GM ÷ q: the speed above which the Sun cannot hold an object at that distance.'],
          [
            `Speed at closest approach${tag2}`,
            `${n1(s.speedAtClosestKmS)} km/s`,
            `The square root of (the speed far away squared plus the escape speed squared): ${n2(s.speedFarAwayKmS)}² + ${n2(s.escapeSpeedKmS)}² = ${commas(s.speedFarAwaySquared)} + ${commas(s.escapeSpeedSquared)} = ${commas(s.sumOfSquares)}, and its square root is ${n1(s.speedAtClosestKmS)}.`,
          ],
          ['One divided by the eccentricity', s.oneOverEccentricity.toFixed(4), `1 ÷ ${s.eccentricity}.`],
          ['Half the bend', `${n2(s.halfBendDegrees)} degrees`, `The angle whose sine is ${s.oneOverEccentricity.toFixed(4)}, which the arcsin (sin⁻¹) button of a calculator gives.`],
          [`Total bend${tag1}`, `${n2(s.bendDegrees)} degrees`, `2 × ${n2(s.halfBendDegrees)} = ${n2(s.bendDegrees)} degrees, which is ${n1(s.bendDegrees)} degrees.`],
          [
            'Direction of travel, in and out (Picture 1)',
            `${n2(s.headingInDegrees)} degrees and ${n2(s.headingOutDegrees)} degrees`,
            `Each measured as an angle from the direction pointing right across the page, turning anticlockwise: ${n2(s.headingOutDegrees)} − ${n2(s.headingInDegrees)} = ${n2(s.bendDegrees)} degrees, the same bend.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the steps from the Sun’s pull and two measured numbers, the closest approach and the eccentricity, to the speeds and the bend, each worked out from the one before.',
          },
          {
            label: 'What it means',
            text: (
              <>
                Only two numbers about 3I/ATLAS are needed: {s.closestApproachAu} AU and {s.eccentricity}. With the strength of the Sun’s pull, they give the speed far away, {n1(s.speedFarAwayKmS)} km/s, and the escape speed at the closest approach, {n1(s.escapeSpeedKmS)} km/s, and from those the speed there, {n1(s.speedAtClosestKmS)} km/s. They also give the bend:
                1 ÷ {s.eccentricity} = {s.oneOverEccentricity.toFixed(4)}, whose arcsin is {n2(s.halfBendDegrees)} degrees, and twice that is {n2(s.bendDegrees)} degrees. It is like a recipe: two ingredients, and the Sun’s pull, make the whole path.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'these are the numbers behind your two predictions, and the ones that Pictures 1 and 2 and Drawing A use. Why the formulas take this form is for the tutor.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the first three rows are standard or published values; the other rows follow from them by arithmetic and standard formulas, which were not read at a source.',
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. The three known visitors from another star</p>
      <ResultsTable
        minWidth={700}
        head={['Visitor', 'Eccentricity', 'Speed far from the Sun', 'Total bend (calculated)', 'How to read it']}
        rows={[
          [
            `${known[0].name} (${known[0].year})`,
            `${known[0].eccentricity}`,
            `${known[0].speedFarAwayKmS} km/s`,
            `${n1(known[0].bendDegrees)} degrees`,
            'The most bent of the three. Its eccentricity is only just above 1, which is the border between an open and a closed path.',
          ],
          [`${known[1].name} (${known[1].year})`, `${known[1].eccentricity}`, `${known[1].speedFarAwayKmS} km/s`, `${n1(known[1].bendDegrees)} degrees`, 'Bent less than ʻOumuamua and more than 3I/ATLAS.'],
          [
            `${known[2].name} (${known[2].year})${tag1}`,
            `${known[2].eccentricity}`,
            `${known[2].speedFarAwayKmS} km/s`,
            `${n1(known[2].bendDegrees)} degrees`,
            'The least bent of the three. It has the highest eccentricity, the most open path, and the highest speed far from the Sun.',
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the eccentricity and the speed far from the Sun of the three interstellar visitors seen so far, with the total bend that each eccentricity gives, calculated in the same way for all three.',
          },
          {
            label: 'What it means',
            text: (
              <>
                The bend depends on the eccentricity: {known[0].eccentricity} gives {n1(known[0].bendDegrees)} degrees, {known[1].eccentricity} gives {n1(known[1].bendDegrees)} degrees, and {known[2].eccentricity} gives {n1(known[2].bendDegrees)} degrees. The higher the eccentricity, the less the path is bent. The three visitors also passed the Sun at different distances, so their
                speeds far away are not the whole story, and this table does not say why their eccentricities differ.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'it shows that the bend of 3I/ATLAS is not typical of every visitor: a slower one, or one that passes much nearer, can be bent by a great deal more. Why that is for the tutor.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the eccentricities and speeds of ʻOumuamua and Borisov are rounded values from a Wikipedia page, and the primary sources were not read. The bends are calculated here, and no published bend was found for any of the three.',
          },
        ]}
      />
    </div>
  )
}
