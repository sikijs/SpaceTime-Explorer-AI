import type { ReactNode } from 'react'
import { LIFETIME_ANSWER_CHOICES, MOUNT_BETA, MOUNT_COUNT_SEA_PER_HOUR, MOUNT_COUNT_TOP_PER_HOUR, MOUNT_HEIGHT_M, SHARE_ANSWER_CHOICES, TESTED, resultsCheckUp, shareAfterLifetimes, stepsTable } from '../physics/muonLifetime'
import { ResultsTable } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 4: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's guesses or settings. The wording is
// Claude's DRAFT of 2026-10-31, for the owner's approval line by line (CLAUDE.md §28.1). Why a moving muon's lifetime is longer, and what the two tests show about it, are left to the tutor
// (CLAUDE.md §12, §13). The papers behind the numbers are listed later (a later step), after the run.

const noteStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' } as const
const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)
const n3 = (x: number) => x.toFixed(3)
const n4 = (x: number) => x.toFixed(4)
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
const spaced = (x: number) => String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

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

export function MuonLifetimeResults({ shareGuess, lifetimeGuess }: { shareGuess: string | null; lifetimeGuess: string | null }) {
  const c = resultsCheckUp()
  const t = stepsTable()
  const keep = shareAfterLifetimes(1)
  const shareLabel = shareGuess !== null ? (SHARE_ANSWER_CHOICES.find((x) => x.id === shareGuess)?.label ?? '') : ''
  const lifetimeLabel = lifetimeGuess !== null ? (LIFETIME_ANSWER_CHOICES.find((x) => x.id === lifetimeGuess)?.label ?? '') : ''
  const tag1 = shareGuess !== null ? ` [your guess for Prediction 1: ${shareLabel} of every 100]` : ''
  const tag2 = lifetimeGuess !== null ? ` [your guess for Prediction 2: ${lifetimeLabel}]` : ''

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
            <strong>Settled:</strong> muons that are moving have been timed in two old tests, one on a mountain in 1962 and one in a storage ring at CERN in 1977, and the results agree with special relativity. These tests are old. This page reports them. It does not report a new result.
          </li>
          <li>
            <strong>What was read:</strong> the Particle Data Group’s page for the muon’s lifetime at rest, the abstract of the CERN paper, and Wikipedia’s account of the mountain test. Neither original paper was read in full. The mountain test’s figures are from Wikipedia’s account, not from the paper.
          </li>
          <li>
            <strong>Not checked here:</strong> how muons are made and how high up, beyond one educational page; and other tests of the same idea, which were not looked up.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real result for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (muons still alive at sea level): you guessed <strong>{shareGuess !== null ? `${shareLabel} of every 100` : '…'}</strong>. The real numbers are in Table 1, in the rows beginning “Mountain: muons alive at sea level”, and the count is in the second of them.
          </li>
          <li>
            <strong>Prediction 2</strong> (how long muons in the ring last): you guessed <strong>{lifetimeGuess !== null ? lifetimeLabel : '…'}</strong>. The real numbers are in Table 1, in the rows beginning “Ring”.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1 sets each number
        beside a reference and says in plain words how they compare, with “more” or “less”. It does not say “good” or “bad”, because there is no accepted range for how closely a simple calculation should match a measurement. “Give-or-take” is the size of the doubt that the
        people who made a measurement put on it, so a difference smaller than the give-or-take is “inside” it.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the numbers beside a reference</p>
      <ResultsTable
        minWidth={820}
        head={['What we compare', 'Calculated or measured', 'Reference', 'How to read it']}
        rows={[
          [
            'Mountain: muons alive at sea level, lifetime unchanged (calculated here)',
            `${n1(c.mount.everyday * 100)} of every 100`,
            `counted at sea level: ${n1(c.mount.counted * 100)} of every 100 (${MOUNT_COUNT_SEA_PER_HOUR} ÷ ${MOUNT_COUNT_TOP_PER_HOUR})`,
            `${cap(c.mount.everydayVersusCounted)}: the count is ${n1(c.mount.countedOverEveryday)} times as large.`,
          ],
          [
            `Mountain: muons alive at sea level, longer lifetime (calculated here)${tag1}`,
            `${n1(c.mount.slow * 100)} of every 100`,
            `counted at sea level: ${n1(c.mount.counted * 100)} of every 100`,
            `${cap(c.mount.slowVersusCounted)}, by ${n1(Math.abs(c.mount.slowMinusCountedPer100))} of every 100. The calculation is simpler than the real test (it ignores muons slowing down on the way), so the page does not say how big a difference to expect.`,
          ],
          [
            'Mountain: the paper’s factor for how much longer a moving muon lasts',
            `measured: ${c.mount.factorMeasured}, give-or-take ${c.mount.factorMeasuredGiveOrTake}`,
            `the paper’s calculation: ${c.mount.factorPredicted}, give-or-take ${c.mount.factorPredictedGiveOrTake}`,
            c.mount.factorsOverlap
              ? `The two ranges overlap: the numbers differ by ${n1(c.mount.factorDifference)}, which is less than the two give-or-takes added together (${c.mount.factorMeasuredGiveOrTake} + ${c.mount.factorPredictedGiveOrTake} = ${n1(c.mount.factorMeasuredGiveOrTake + c.mount.factorPredictedGiveOrTake)}).`
              : 'The two ranges do not overlap.',
          ],
          [
            `Ring: average lifetime of the muons, calculated here${tag2}`,
            `${n2(c.ring.predictedUs)} µs`,
            `a muon at rest: ${n3(c.rest.us)} µs`,
            `More: ${n2(c.ring.predictedOverRest)} times as long.`,
          ],
          [
            'Ring: measured, positive muons (CERN, 1977)',
            `${n3(c.ring.plus.measuredUs)} µs, give-or-take ${n3(c.ring.plus.giveOrTakeUs)}`,
            `calculated: ${n2(c.ring.predictedUs)} µs`,
            `${c.ring.plus.differenceUs < 0 ? 'Less' : 'More'}, by ${n3(Math.abs(c.ring.plus.differenceUs))} µs, ${c.ring.plus.inside ? 'inside' : 'outside'} the measurement’s own give-or-take.`,
          ],
          [
            'Ring: measured, negative muons (CERN, 1977)',
            `${n3(c.ring.minus.measuredUs)} µs, give-or-take ${n3(c.ring.minus.giveOrTakeUs)}`,
            `calculated: ${n2(c.ring.predictedUs)} µs`,
            `${c.ring.minus.differenceUs < 0 ? 'Less' : 'More'}, by ${n3(Math.abs(c.ring.minus.differenceUs))} µs (${n3(Math.abs(c.ring.minus.differencePercent))} percent), which is ${n1(Math.abs(c.ring.minus.giveOrTakes))} times the measurement’s own give-or-take, so ${c.ring.minus.inside ? 'inside' : 'outside'} it. The paper states agreement to ${n1(c.ring.paperLimitPercent)} percent at 95 percent confidence, and ${n3(Math.abs(c.ring.minus.differencePercent))} percent is ${c.ring.minusInsidePaperLimit ? 'below' : 'above'} that. The page gives no further verdict.`,
          ],
          [
            'Rest lifetime: the CERN paper’s own value for negative muons, found by assuming special relativity',
            `${n4(c.rest.paperMinusUs)} µs, give-or-take ${n4(c.rest.paperMinusGiveOrTakeUs)}`,
            `the Particle Data Group’s average, measured at rest: ${n4(c.rest.us)} µs`,
            `${cap(c.rest.paperMinusVersusPdg)}, by ${n2(Math.abs(c.rest.paperMinusDifferencePercent))} percent. The paper’s value is worked out from the ring data, so the page does not say which of the two is more reliable.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the main numbers of this experiment, each set beside a reference: the count on the mountain, the calculation for the ring, the ring’s two measurements, and the muon’s lifetime at rest.',
          },
          {
            label: 'What it means',
            text: (
              <>
                On the mountain, if every muon lasted only {n3(c.rest.us)} µs, about {n1(c.mount.everyday * 100)} of every 100 would arrive alive. The count was {n1(c.mount.counted * 100)} of every 100, which is {n1(c.mount.countedOverEveryday)} times as many. The second calculation, with a longer
                lifetime, gives {n1(c.mount.slow * 100)}, which is {n1(Math.abs(c.mount.slowMinusCountedPer100))} above the count. In the ring, the calculated lifetime is {n2(c.ring.predictedUs)} µs, which is {n2(c.ring.predictedOverRest)} times the lifetime at rest. The two measured
                lifetimes are {n3(c.ring.plus.measuredUs)} and {n3(c.ring.minus.measuredUs)} µs, each within {n3(Math.abs(c.ring.minus.differenceUs))} µs of the calculation.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: (
              <>
                a count and two timings were made with very different methods. On the mountain, the count of {n1(c.mount.counted * 100)} of every 100 is far above the {n1(c.mount.everyday * 100)} that a lifetime of {n1(c.rest.us)} µs gives. In the ring, the measured lifetimes are about {n1(c.ring.plus.measuredOverRest)} times the lifetime at rest, and they land within about{' '}
                {n2(Math.abs(c.ring.minus.differencePercent))} percent of the calculation. Nothing on this page says why a moving muon should last longer. The tutor goes through that.
              </>
            ),
          },
          {
            label: 'How sure the numbers are',
            text: `the calculated numbers are exact arithmetic for the page’s simple model. The count of ${MOUNT_COUNT_TOP_PER_HOUR} and ${MOUNT_COUNT_SEA_PER_HOUR} muons an hour is from Wikipedia’s account of the mountain test, not from the paper. The ring’s figures are from the CERN paper’s abstract. The model is simpler than the real mountain test, so its ${n1(c.mount.slow * 100)} is not meant to match the count exactly.`,
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. From the speed to the answer</p>
      <ResultsTable
        minWidth={760}
        head={['Step', 'Prediction 1: the mountain', 'Prediction 2: the ring', 'How to read it']}
        rows={[
          ['The speed, relative to the ground or the lab', `${t.one.beta} c`, `${t.two.beta.toFixed(5)} c`, 'As a fraction of c, the speed of light.'],
          ['The average lifetime at rest', `${n3(t.one.restLifetimeUs)} µs`, `${n3(t.two.restLifetimeUs)} µs`, 'The same for both: it is measured for a muon sitting still.'],
          ['How many times longer the average lifetime is at this speed', `${n2(t.one.timesLonger)} times`, `${n2(t.two.timesLonger)} times`, 'The number that the calculation uses for each speed. The tutor explains where it comes from.'],
          ['The average lifetime at this speed', `${n1(t.one.lifetimeUs)} µs`, `${n2(t.two.lifetimeUs)} µs`, 'The lifetime at rest multiplied by the line above.'],
          ['The trip', `${spaced(MOUNT_HEIGHT_M)} m at ${MOUNT_BETA} c takes ${n2(t.one.tripUs)} µs`, 'none: the muons go round and round until they decay', 'The mountain trip is distance ÷ speed. The ring has no fixed trip.'],
          ['The trip as a number of lifetimes', `${n2(t.one.tripLifetimesUnchanged)} (lifetime at rest), or ${n2(t.one.tripLifetimesLonger)} (longer lifetime)`, 'not used', `The trip time divided by the lifetime. Each lifetime keeps about ${n3(keep)} of the muons.`],
          ['The answer', `${n1(t.one.slowShare * 100)} of every 100 alive at sea level`, `${n2(t.two.lifetimeUs)} µs`, 'This is the number to compare with each prediction.'],
          ['What was measured', `${n1(t.one.counted * 100)} of every 100 counted`, `${n3(t.two.measuredPlusUs)} and ${n3(t.two.measuredMinusUs)} µs`, 'From the mountain count and the ring measurement.'],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the steps from the speed to the answer, for the two predictions side by side, so that no step is hidden.',
          },
          {
            label: 'What it means',
            text: (
              <>
                For the mountain, the longer lifetime is {n2(t.one.timesLonger)} × {n3(t.one.restLifetimeUs)} = {n1(t.one.lifetimeUs)} µs. The trip is {n2(t.one.tripUs)} µs, which is {n2(t.one.tripLifetimesLonger)} of that lifetime, and {n1(t.one.slowShare * 100)} of every 100 are left. For the ring, the lifetime is{' '}
                {n2(t.two.timesLonger)} × {n3(t.two.restLifetimeUs)} = {n2(t.two.lifetimeUs)} µs.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: `each step is plain arithmetic: one multiplication, one division and one repeated multiplication by ${n3(keep)}. The only thing the page has not explained is the “how many times longer” line, because that is what the tutor is for.`,
          },
          {
            label: 'How sure the numbers are',
            text: 'the arithmetic is exact for the numbers chosen. Whether nature follows it is what Tables 1 and 3 are about.',
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
            text: 'three rows are measurements: the lifetime at rest, the count on the mountain and the ring. All three are old or settled. “Calculated here” means worked out on this page. “Imagined for the question” means a way of describing, with no measurement behind it. “Not covered here” means outside this experiment. It does not mean nothing has been done.',
          },
          {
            label: 'Why it matters',
            text: 'this is the line between what was measured and what this page worked out or imagined. The muon’s own description in Picture 3 is not a measurement. It is a calculation that gives the same share as the ground’s.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the rest lifetime is from the Particle Data Group’s listing. The mountain count is second-hand, from Wikipedia’s account. The ring figures are from the CERN paper’s abstract. No paper was read in full.',
          },
        ]}
      />
    </div>
  )
}
