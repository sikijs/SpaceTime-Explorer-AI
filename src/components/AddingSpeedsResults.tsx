import type { ReactNode } from 'react'
import { FLASH_ANSWER_CHOICES, SPEED_ANSWER_CHOICES, TESTED, pictureThree, resultsCheckUp, stepsTable } from '../physics/addingSpeeds'
import type { Comparison } from '../physics/addingSpeeds'
import { ResultsTable } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 3: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's guesses or settings. The wording is
// Claude's DRAFT of 2026-10-30, for the owner's approval line by line (CLAUDE.md §28.1). Why the rule has the form it has beyond the short account in Picture 1, and what the two tests show about the
// speed of light, are left to the tutor (CLAUDE.md §12, §13). The papers behind the numbers are listed at the end (Step 8), after the run: each link was opened on 2026-10-30; the 1964 paper and the 1886 paper were read, NASA's page in part, and Fizeau's and von Laue's papers could not be opened (not linked).

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const noteStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' } as const
const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

// A speed written to as many decimals as it needs (up to five), without trailing zeros.
const fmt = (x: number) => {
  const t = x.toFixed(5).replace(/0+$/, '')
  return t.endsWith('.') ? t + '0' : t
}
const num = (x: number) => String(Number(x.toFixed(3)))
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

export function AddingSpeedsResults({ shipGuess, flashGuess }: { shipGuess: string | null; flashGuess: string | null }) {
  const c = resultsCheckUp()
  const s = stepsTable()
  const p3 = pictureThree()
  const shipLabel = shipGuess !== null ? (SPEED_ANSWER_CHOICES.find((x) => x.id === shipGuess)?.label ?? '') : ''
  const flashLabel = flashGuess !== null ? (FLASH_ANSWER_CHOICES.find((x) => x.id === flashGuess)?.label ?? '') : ''
  const tag1 = shipGuess !== null ? ` [your guess for Prediction 1: ${shipLabel}]` : ''
  const tag2 = flashGuess !== null ? ` [your guess for Prediction 2: ${flashLabel}]` : ''

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
            <strong>Settled:</strong> the rule for adding speeds has been tested, in water in 1851 and with a flash of light from fast particles in 1964. Both tests are old, and this page reports them. It does not report a new result.
          </li>
          <li>
            <strong>What was read:</strong> a typed copy of Michelson and Morley’s 1886 paper, whose figures and typeset equations were not seen; a Wikipedia account of Fizeau’s experiment (the first part of it); and a scan of the 1964 paper that a computer turned into text, so its figures still need
            checking against the pages. No other paper was read, and no number from Fizeau’s own paper was read, so none is used.
          </li>
          <li>
            <strong>Not checked here:</strong> whether the rule has been tested in other ways was not looked up, and the rule itself was checked only against a short account in a Wikipedia article, not a textbook.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real result for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (how fast the lab sees the probe move): you guessed <strong>{shipGuess !== null ? shipLabel : '…'}</strong>. The real number is in Table 1, in the row “What the lab measures for the probe”.
          </li>
          <li>
            <strong>Prediction 2</strong> (how fast the lab measures the gamma ray): you guessed <strong>{flashGuess !== null ? flashLabel : '…'}</strong>. The real number is in Table 1, in the row “The gamma ray’s speed measured in 1964”.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1 sets each
        number beside a reference and says in plain words how they compare, with “the same”, “more” or “less”. It does not say “good” or “bad”, because there is no accepted range for how closely such a calculation should match. In this page “the same” means within 1 percent, which is a
        reading aid, not a scientific rule.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the numbers beside a reference</p>
      <ResultsTable
        minWidth={800}
        head={['What we compare', 'Calculated or measured', 'Reference', 'How to read it']}
        rows={[
          [
            `What the lab measures for the probe${tag1}`,
            `${fmt(c.rule)} c (the rule)`,
            `the everyday sum: ${fmt(c.everyday)} c`,
            `${comparisonWord(c.ruleVersusEveryday)}: ${num(c.ruleOverEveryday)} times as much.`,
          ],
          [
            'The probe’s speed relative to the spaceship, worked back from that result',
            `${fmt(c.probeWorkedBack)} c`,
            `the probe’s speed we started with: ${fmt(c.probe)} c`,
            `${comparisonWord(c.probeWorkedBackVersusProbe)}. The rule, run backwards, gives back the number that went in.`,
          ],
          [
            'Light in moving water: the fraction of the water’s speed added to the light’s (the rule)',
            `${num(c.waterRuleShare)} of v`,
            `the everyday sum: all of v, which is ${num(c.waterEverydayShare)} of v`,
            `${comparisonWord(c.waterRuleVersusEveryday)}: ${num(c.waterRuleOverEveryday)} times as much.`,
          ],
          [
            'Light in moving water: the same fraction, measured by Michelson and Morley in 1886',
            `${num(c.waterMeasured)} of v, possible error ±${num(c.waterMeasuredGiveOrTake)}`,
            `the rule’s fraction: ${num(c.waterRuleShare)} of v`,
            c.waterMeasuredAgreesWithRule
              ? `${comparisonWord('the same')}, within their possible error (the two differ by ${num(Math.abs(c.waterRuleMinusMeasured))}). The everyday sum, 1 of v, is ${num(1 / c.waterMeasured)} times the measured value and far outside the range.`
              : 'Not the same: the rule is outside their possible error.',
          ],
          [
            `The gamma ray’s speed measured in 1964${tag2}`,
            `${fmt(c.pionMeasured)} c, give-or-take ${fmt(c.pionGiveOrTake)} c`,
            'the speed of light, c: 1 c',
            c.pionMeasuredAgreesWithLight ? `${comparisonWord(c.pionMeasuredVersusLight)}, and within the measurement’s own give-or-take.` : `${comparisonWord(c.pionMeasuredVersusLight)}, but outside the measurement’s own give-or-take.`,
          ],
          [
            'The same measurement, beside the everyday sum',
            `${fmt(c.pionMeasured)} c`,
            `the everyday sum: ${fmt(c.pionEveryday)} c`,
            `${comparisonWord(c.pionMeasuredVersusEveryday)}: ${num(c.pionMeasuredOverEveryday)} times as much, about half.`,
          ],
          [
            `A flash sent forward from ships at ${p3.flashFromShips.map((r) => r.ship).join(', ')} c, by the rule`,
            `${fmt(p3.flashFromShips[0].rule)} c for each of the ${c.shipsCount} ships`,
            'the speed of light, c: 1 c',
            c.shipsAllGiveLight ? `${comparisonWord('the same')} for all ${c.shipsCount}.` : 'Not the same for all.',
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the main numbers of this experiment, each set beside a reference: the everyday sum, the number that went into the rule, c itself, and the full drag that the everyday sum would give for water.',
          },
          {
            label: 'What it means',
            text: (
              <>
                For the spaceship and its probe, the lab measures {fmt(c.rule)} c, which is {num(c.ruleOverEveryday)} times the everyday sum of {fmt(c.everyday)} c. Run the rule backwards and it returns {fmt(c.probeWorkedBack)} c, the probe’s own speed, so the rule is consistent with itself. In water, the
                rule adds {num(c.waterRuleShare)} of the water’s speed to the light’s, where the everyday sum would add all of it, and Michelson and Morley measured {num(c.waterMeasured)} (possible error ±{num(c.waterMeasuredGiveOrTake)}), which agrees with the rule and not with the everyday sum. In 1964 the gamma ray was measured at {fmt(c.pionMeasured)} c, give-or-take {fmt(c.pionGiveOrTake)} c, so it sits on c (within that give-or-take) and about
                half of the everyday sum, {fmt(c.pionEveryday)} c. The rule gives c for a flash from every ship in Picture 3, panel B.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: <>two of these rows are measurements, and the everyday sum fails both. The water rows show it by a small amount in speed, since the water is slow, but the measured fraction, {num(c.waterMeasured)}, is less than half of what the everyday sum says. The 1964 row shows it by a large one, since the source was almost as fast as light itself. A rule that matches one test and fails the other would not be much use. This one matches both.</>,
          },
          {
            label: 'How sure the numbers are',
            text: 'the rule’s numbers are exact arithmetic. The 1964 figures are from a scan that a computer turned into text, and still need checking against its pages. The 1886 figures are from a typed copy, and their “possible error” is the authors’ own estimate, not a standard statistical error bar. Fizeau’s own number was not read. The rule itself has been checked here only against a short account in a Wikipedia article, not a textbook.',
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. From the two speeds to what the lab measures</p>
      <ResultsTable
        minWidth={760}
        head={['Step', 'Prediction 1: spaceship and probe', 'Prediction 2: pions and flash', 'How to read it']}
        rows={[
          ['The first speed, a (relative to the lab)', `${s.one.a} c`, `${s.two.a} c`, 'The spaceship for Prediction 1, and the pions for Prediction 2, as fractions of c.'],
          ['The second speed, b (relative to the one that sends it out)', `${s.one.b} c`, `${s.two.b} c`, 'The probe for Prediction 1. For Prediction 2, the gamma ray, which is light, so b is 1.'],
          ['The top: a + b', `${fmt(s.one.top)}`, `${fmt(s.two.top)}`, 'The everyday sum.'],
          ['The bottom: 1 + a × b', `${fmt(s.one.bottom)}`, `${fmt(s.two.bottom)}`, 'The correction. If it were 1, the rule would give the everyday sum.'],
          ['The result: top ÷ bottom', `${fmt(s.one.result)} c`, `${fmt(s.two.result)} c`, 'What the lab measures. This is the number to compare with each prediction.'],
          ['The result as a percentage of c', `${num(s.one.percentOfC)} percent`, `${num(s.two.percentOfC)} percent`, 'The result multiplied by 100.'],
          ['How far the everyday sum is above the result', `${fmt(s.one.gap)} c`, `${fmt(s.two.gap)} c`, 'The everyday sum minus the result: the gap in Pictures 1 and 3.'],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the steps of the rule for the two predictions, side by side, each with its number, so that no step is hidden.',
          },
          {
            label: 'What it means',
            text: (
              <>
                For Prediction 1 the top is {fmt(s.one.top)} and the bottom is {fmt(s.one.bottom)}, so the result is {fmt(s.one.top)} ÷ {fmt(s.one.bottom)} = {fmt(s.one.result)} c. For Prediction 2 the top and the bottom are both {fmt(s.two.top)}, so the result is exactly {fmt(s.two.result)} c. The
                gap is {fmt(s.one.gap)} c for the first and {fmt(s.two.gap)} c for the second.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'each step is plain arithmetic: one addition, one multiplication, one more addition and one division. The only difference between the two columns is that b is 1 in the second, and that is what makes the top and the bottom equal. You can see in one place why a flash of light is measured at c.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the arithmetic is exact for the numbers chosen. Whether nature follows the rule is what Table 3 is about.',
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
            text: 'two rows are measurements: Fizeau’s water in 1851 (confirmed in 1886) and the CERN flash of 1964. Both are old. “Not checked here” means that this page did not look it up. It does not mean that nothing has been done. “Not covered here” means that it is outside this experiment.',
          },
          {
            label: 'Why it matters',
            text: 'this is the line between what the page checked and what it did not. A rule that is stated in a textbook is not the same as a rule that has been measured. These two tests are the page’s evidence that the rule has been measured.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the first row rests on the first part of a Wikipedia article, not on Fizeau’s papers. The second rests on a scan of the 1964 paper that a computer turned into text, whose figures still need checking against its pages. No paper was read in full.',
          },
        ]}
      />
      <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>The papers and pages behind these numbers.</strong> They are listed here, after the run, because they give away the answers to your predictions. Links open in a new tab. Each link was opened on 30 October 2026. Only the 1964 paper (a scan) and the 1886 paper (a
          typed copy) were read for this page. NASA’s page was read in part.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <ExternalLink href="https://doi.org/10.1016/0031-9163(64)91095-9">Alväger, Farley, Kjellman and Wallin, “Test of the second postulate of special relativity in the GeV region”, Physics Letters 12, 260 (1964)</ExternalLink>: the CERN test in Picture 3. This link goes to
            the publisher’s record of the paper.{' '}
            <ExternalLink href="https://docente.unife.it/guido.zavattini/allegati/alvaeger-pl1964.pdf">A scan of the paper</ExternalLink> is kept by a university lecturer; it is the copy read for this page.
          </li>
          <li>
            <ExternalLink href="https://en.wikisource.org/wiki/Influence_of_Motion_of_the_Medium_on_the_Velocity_of_Light">Michelson and Morley, “Influence of motion of the medium on the velocity of light”, American Journal of Science (1886)</ExternalLink>: the repeat of Fizeau’s
            experiment in Picture 2, with larger tubes. This is a typed copy of the paper on Wikisource.
          </li>
          <li>
            <ExternalLink href="https://science.nasa.gov/solar-system/10-things-einstein-got-right/">NASA Science, “10 Things Einstein Got Right”</ExternalLink>: a plain page that says all light obeys one speed, and that light of very different energies travels at the same speed. It does not
            cover adding speeds.
          </li>
          <li>
            <strong>Not linked</strong> (no readable copy could be opened here): Fizeau’s own paper of 1851 (<em>Comptes Rendus</em> 33, 349), and von Laue’s paper of 1907 (<em>Annalen der Physik</em> 328, 989), whose publisher’s page was refused.
          </li>
        </ul>
      </div>
    </div>
  )
}
