import type { ReactNode } from 'react'
import { SEED_CHOICES, TIME_CHOICES, efficiencyChoices, exampleSteps, resultsCheckUp, settingsGrid } from '../physics/blackHoleGrowth'
import type { SeedChoiceId, TimeChoiceId } from '../physics/blackHoleGrowth'
import { ResultsTable } from './WideBinariesExperiment'
import { commas, efficiencyPercent, n1 } from './BlackHoleGrowthPictures'

// Frontier and Beyond, Experiment 23: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's
// guesses or settings. The wording is a DRAFT for the owner's line-by-line approval (CLAUDE.md §28.1). The explanation of what the numbers mean for how real black
// holes grew, and any verdict between the explanations, are left to the tutor (CLAUDE.md §12, §13).

const noteStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' } as const
const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

// Years as "758 million years", and a mass as "38 million Suns" or "8,284 Suns".
function millionYears(years: number): string {
  return `${commas(years / 1e6)} million years`
}
function millionYears1(years: number): string {
  return `${n1(years / 1e6)} million years`
}
function suns(x: number): string {
  return x >= 1e6 ? `${commas(x / 1e6)} million Suns` : `${commas(x)} Suns`
}
function suns1(x: number): string {
  return x >= 1e6 ? `${n1(x / 1e6)} million Suns` : `${commas(x)} Suns`
}

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

export function BlackHoleGrowthResults({ timeGuess, seedGuess }: { timeGuess: TimeChoiceId | null; seedGuess: SeedChoiceId | null }) {
  const c = resultsCheckUp()
  const s = exampleSteps()
  const grid = settingsGrid()
  const effs = efficiencyChoices()
  const timeLabel = timeGuess !== null ? (TIME_CHOICES.find((x) => x.id === timeGuess)?.label ?? '') : ''
  const seedLabel = seedGuess !== null ? (SEED_CHOICES.find((x) => x.id === seedGuess)?.label ?? '') : ''
  const tag1 = timeGuess !== null ? ` [your guess for Prediction 1: ${timeLabel}]` : ''
  const tag2 = seedGuess !== null ? ` [your guess for Prediction 2: ${seedLabel}]` : ''
  // Which seeds are in time at the efficiency of column j, read from the module's grid.
  const inTime = (j: number) => {
    const ok = grid.filter((row) => row[j].fits).map((row) => suns(row[j].seedSolar))
    return ok.length === 0 ? 'none of the seeds in the table is in time' : ok.length === grid.length ? 'every seed in the table is in time' : `the seeds in time are ${ok.join(', ')}`
  }
  const comparisonWord = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0f766e' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: '#0f766e' }}>Part 3: The results</h3>
      <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>What we are about to do.</strong> Here are the numbers behind the pictures, set out in three tables, each with a short guide to reading it. These tables are the real numbers, so they never change with your
        guesses or with your settings in Part 2.
      </p>

      <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Where this stands (as of October 2026).</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Settled:</strong> the speed limit on how fast a black hole can take in gas (the Eddington limit), and that a black hole feeding at that limit multiplies its mass by the same factor in every equal span of time.
          </li>
          <li>
            <strong>Strong evidence:</strong> that the James Webb Space Telescope sees growing black holes very early in the history of the universe, such as the one in CAPERS-LRD-z9, seen as it was when the universe was about {millionYears(c.ageYears)} old.
          </li>
          <li>
            <strong>Open:</strong> whether any of these black holes grew faster than the limit or started out heavy, and what the little red dots really are. Their black hole masses have a wide give-or-take and may be much smaller than first estimated.
          </li>
          <li>The numbers come from abstracts and summaries. No paper was read in full for this page, so each published number should be checked against its paper.</li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real number for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (how long a black hole of 10 Suns takes to reach the mass of CAPERS-LRD-z9): you guessed <strong>{timeGuess !== null ? timeLabel : '…'}</strong>. The real calculated number is in Table 1, in the first row, in Table 2, in
            the row “Time needed”, and in Table 3, in the row for a seed of 10 Suns, in the column for 10 percent.
          </li>
          <li>
            <strong>Prediction 2</strong> (the smallest seed that could do it in the time available): you guessed <strong>{seedGuess !== null ? seedLabel : '…'}</strong>. The real calculated number is in Table 1, in the row “Smallest seed”.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1 is
        a check-up: it sets each calculated number beside a published number, or beside the comparison this page sets, and says in plain words how they compare, with “the same”, “more”, “less” or “inside”. It does not say “good” or “bad”, because there is no accepted
        range for how closely a calculated growth time should match a published one. The <strong>give-or-take</strong> of a measurement is the “±” after it, or a range. A <strong>growth time</strong> is the time in which a black hole feeding at the limit multiplies its mass
        by 2.72, as in Picture 1.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the calculated numbers beside the published ones, or the comparison this page sets</p>
      <ResultsTable
        minWidth={760}
        head={['What we compare', 'Calculated here', 'Published value, or the comparison used here', 'How to read it']}
        rows={[
          [
            `Time for a seed of ${c.stellarSeedSolar} Suns to reach ${suns(c.objectSolar)}${tag1}`,
            `${millionYears(c.neededYears)} (${n1(exampleSteps().growthTimes)} growth times of ${millionYears1(c.growthTimeYears)})`,
            `the time available, ${millionYears(c.availableYears)}: the universe’s age at CAPERS-LRD-z9, ${millionYears(c.ageYears)}, less the ${millionYears(s.startAgeYears)} before the seed starts to feed (imagined for the question)`,
            `${comparisonWord(c.neededComparison)}: ${n1(c.neededOverAvailable)} times the time available, ${millionYears(c.neededYears - c.availableYears)} longer.`,
          ],
          [
            'Age of the universe when the light of CAPERS-LRD-z9 left it',
            millionYears(c.ageYears),
            `about half a billion years (${millionYears(c.ageReferenceYears)}), in summaries of the discovery paper`,
            `${comparisonWord(c.ageComparison)}, to the nearest 100 million years.`,
          ],
          [
            `Smallest seed that reaches ${suns(c.objectSolar)} in the time available${tag2}`,
            suns(c.smallestSeedSolar),
            `the seed of ${c.stellarSeedSolar} Suns of Prediction 1 (a comparison set by this page, not a published number)`,
            `More: about ${commas(c.smallestOverStellar)} times heavier.`,
          ],
          [
            'The Eddington time',
            millionYears1(c.eddingtonYears),
            `about ${millionYears(c.eddingtonReferenceYears)}, in a search summary of what sources give (not read at a page)`,
            `${comparisonWord(c.eddingtonComparison)}, to the nearest 10 million years.`,
          ],
          [
            'Mass of the black hole of CAPERS-LRD-z9',
            `${suns(c.objectSolar)}, used as published, not calculated here`,
            `the authors’ range, ${n1(c.publishedLowSolar / 1e6)} million to ${commas(c.publishedHighSolar / 1e6)} million Suns, a factor of about ${commas(c.publishedRangeFactor)}`,
            `Inside the range. The give-or-take on the logarithm alone, ± 0.15, gives ${commas(c.objectGiveOrTakeLowSolar / 1e6)} million to ${commas(c.objectGiveOrTakeHighSolar / 1e6)} million Suns.`,
          ],
          [
            `Time for a seed of ${c.stellarSeedSolar} Suns to reach the two ends of that range`,
            `${millionYears(c.neededForLowYears)} (to ${suns1(c.publishedLowSolar)}) to ${millionYears(c.neededForHighYears)} (to ${suns(c.publishedHighSolar)})`,
            `the time available, ${millionYears(c.availableYears)}`,
            `More at both ends: ${n1(c.neededForLowOverAvailable)} to ${n1(c.neededForHighOverAvailable)} times the time available.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the time that the calculation says a black hole of 10 Suns needs, set beside the time that the universe had, then the age and the Eddington time set beside the published numbers, then the mass of the black hole and the time it would need at the two ends of its published range.',
          },
          {
            label: 'What it means',
            text: (
              <>
                A black hole of {c.stellarSeedSolar} Suns that feeds at the limit all the time needs {n1(s.growthTimes)} growth times of {millionYears1(c.growthTimeYears)} to reach {suns(c.objectSolar)}: {n1(s.growthTimes)} × {n1(c.growthTimeYears / 1e6)} = {millionYears(c.neededYears)}. The time available is {millionYears(c.availableYears)}, so the time
                needed is {n1(c.neededOverAvailable)} times as long. The smallest seed that fits is {suns(c.smallestSeedSolar)}. Because the mass is multiplied again and again, a heavy seed saves a lot of time: it is a bit like money earning interest, where
                starting with more gets you to a target sooner. At the two ends of the mass range, the time needed for 10 Suns is {millionYears(c.neededForLowYears)} and {millionYears(c.neededForHighYears)}, still {n1(c.neededForLowOverAvailable)} to {n1(c.neededForHighOverAvailable)} times the time available.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'the first row is the question this experiment asks: was there enough time? Rows 2 and 4 show that the numbers behind it are the ones the sources give. Rows 5 and 6 show that a seed of 10 Suns needs more than the time available at both ends of the published range of the mass, and that the range is wide. What this means for how real black holes grew is for the tutor.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the growth time rests on a textbook formula and on a 10 percent efficiency that was chosen for the question, and on feeding at the limit, all the time, from a start at 100 million years, which is imagined. The mass of the black hole and its range are read from a summary of the discovery paper, and come from the width of a line in a spectrum under one reading of that line; the other reading would give a much lower mass. The references for the age and the Eddington time come from search summaries and not from a page that was read.',
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. From the Eddington time to the time needed</p>
      <ResultsTable
        minWidth={620}
        head={['Step', 'Picture 1’s black hole', 'How to read it']}
        rows={[
          ['The Eddington time', millionYears1(s.eddingtonYears), 'The basic time scale of the limit, worked out from constants of nature with a textbook formula.'],
          ['Efficiency', `${efficiencyPercent(s.efficiency)} percent`, 'The share of the stored energy of the falling matter that is given out as light. Chosen for the question.'],
          ['One growth time', millionYears1(s.growthTimeYears), `${efficiencyPercent(s.efficiency)} ÷ ${efficiencyPercent(1 - s.efficiency)} × ${n1(s.eddingtonYears / 1e6)}: the efficiency divided by the share that is kept, times the Eddington time.`],
          ['Seed', suns(s.seedSolar), 'The black hole that feeding starts from.'],
          ['Mass to reach', suns(s.targetSolar), 'The estimated mass of the black hole of CAPERS-LRD-z9.'],
          ['Factor to multiply by', commas(s.massFactor), 'The mass to reach divided by the seed.'],
          ['Growth times needed', n1(s.growthTimes), 'How many times the mass must be multiplied by 2.72 to make that factor (its natural logarithm).'],
          ['Doublings needed', n1(s.doublings), 'The same count in doublings: the growth times ÷ 0.69.'],
          [`Time needed${tag1}`, millionYears(s.neededYears), `${n1(s.growthTimes)} growth times × ${n1(s.growthTimeYears / 1e6)} million years.`],
          ['When feeding starts', millionYears(s.startAgeYears), 'Imagined for the question.'],
          ['Age at which the mass is reached', millionYears(s.reachesAtAgeYears), 'The start plus the time needed.'],
          ['Age of the universe at CAPERS-LRD-z9', millionYears(s.objectAgeYears), 'From its redshift, 9.288, with Experiment 5’s model.'],
          ['Time available', millionYears(s.availableYears), 'The age of the universe at CAPERS-LRD-z9 less the start.'],
        ]}
      />
      <Note
        items={[
          { label: 'What it is', text: 'the steps from the Eddington time to the time needed, for the black hole of Picture 1, each worked out from the one before.' },
          {
            label: 'What it means',
            text: (
              <>
                The Eddington time, {millionYears1(s.eddingtonYears)}, becomes one growth time of {millionYears1(s.growthTimeYears)} once the efficiency is allowed for. A black hole that begins at {suns(s.seedSolar)} must reach {suns(s.targetSolar)}, a factor of {commas(s.massFactor)}. That is {n1(s.growthTimes)} growth times, {n1(s.growthTimes)} × {n1(s.growthTimeYears / 1e6)} ={' '}
                {millionYears(s.neededYears)}. In doublings, the same count is {n1(s.doublings)}. Like a single bacterium that divides every hour and passes a million after 20 hours, the time depends on how many multiplications are needed.
              </>
            ),
          },
          { label: 'Why it matters', text: 'these are the numbers behind your first prediction, and they are the ones that Picture 1 and Drawing A use. Why a higher efficiency makes a growth time longer is for the tutor to explain.' },
          { label: 'How sure the numbers are', text: 'the first row is a textbook value and has no source read at a page; the efficiency and the start are choices made for the question; the other rows follow from them by arithmetic.' },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. Other seeds and other efficiencies: the time to reach {suns(c.objectSolar)}, and whether it is in time</p>
      <ResultsTable
        minWidth={680}
        head={[`Seed (“in time” means an age of ${millionYears(c.ageYears)} or less)`, ...effs.map((e) => `Efficiency ${efficiencyPercent(e)} percent`)]}
        rows={grid.map((row) => [
          `${suns(row[0].seedSolar)}${row[0].seedSolar === c.stellarSeedSolar ? tag1 : ''}`,
          ...row.map(
            (cell) =>
              `${millionYears(cell.yearsNeeded)}, reaching the mass at an age of ${millionYears(cell.reachesAtAgeYears)}: ${cell.fits ? 'in time' : 'too late'}`,
          ),
        ])}
      />
      <Note
        items={[
          { label: 'What it is', text: 'the same calculation as Table 2, for every seed and every efficiency that you can choose in Part 2, as fixed numbers. “In time” means the mass is reached no later than the age at which the light of CAPERS-LRD-z9 left it.' },
          {
            label: 'What it means',
            text: (
              <>
                {effs.map((e, j) => (
                  <span key={e}>
                    At {efficiencyPercent(e)} percent, {inTime(j)}. {j === 0 ? `Even a seed of ${suns(grid[0][0].seedSolar)} needs ${millionYears(grid[0][0].yearsNeeded)} there, and the time available is ${millionYears(c.availableYears)}. ` : ''}
                  </span>
                ))}
                Reading along a row from left to right, the efficiency rises and the time needed gets longer.
              </>
            ),
          },
          { label: 'Why it matters', text: 'it shows that both the seed and the efficiency decide the time. A heavier seed saves growth times, and a lower efficiency makes each growth time shorter. What each means for how real black holes grew, and what this model leaves out, is for the tutor.' },
          { label: 'How sure the numbers are', text: 'every cell assumes that the black hole feeds at the limit, all the time, from the moment the universe is 100 million years old, with no mergers and no change of efficiency as it grows. These are not facts about a real black hole. The 40 percent column is a trial value near the top of the range for a spinning black hole.' },
        ]}
      />
    </div>
  )
}
