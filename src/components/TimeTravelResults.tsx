import type { ReactNode } from 'react'
import { BEFORE_CHOICES, CLOCK_CHOICES, TESTED, exampleSteps, pictureTwo, resultsCheckUp } from '../physics/timeTravel'
import type { Comparison } from '../physics/timeTravel'
import { ResultsTable } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 2: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's guesses or settings. The wording is
// Claude's DRAFT of 2026-10-30, for the owner's approval line by line (CLAUDE.md §28.1). Why the tunnel turns an offset into a path back in time, and what chronology protection means, are left to the
// tutor (CLAUDE.md §12, §13). The papers behind the numbers are listed at the end (Step 8), after the run, because some of them give the answers to the predictions. Each link was fetched on 2026-10-30; the two publisher pages (APS) returned 403 and are not linked. The papers' abstracts were read, not the full papers. The list's wording is approved (2026-10-30) (CLAUDE.md §28.1).

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const noteStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' } as const
const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

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

export function TimeTravelResults({ clockGuess, beforeGuess }: { clockGuess: string | null; beforeGuess: string | null }) {
  const c = resultsCheckUp()
  const s = exampleSteps()
  const p2 = pictureTwo()
  const clockLabel = clockGuess !== null ? (CLOCK_CHOICES.find((x) => x.id === clockGuess)?.label ?? '') : ''
  const beforeLabel = beforeGuess !== null ? (BEFORE_CHOICES.find((x) => x.id === beforeGuess)?.label ?? '') : ''
  const tag1 = clockGuess !== null ? ` [your guess for Prediction 1: ${clockLabel}]` : ''
  const tag2 = beforeGuess !== null ? ` [your guess for Prediction 2: ${beforeLabel}]` : ''

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0f766e' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: '#0f766e' }}>Part 3: The results</h3>
      <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>What we are about to do.</strong> Here are the numbers behind the pictures, in three tables, each with a short guide. These tables are the real numbers, so they never change with your guesses or with your settings in Part 2.
      </p>

      <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Where this stands (as of October 2026): Settled for the future; Open for the past.</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Settled:</strong> a clock that moves fast counts less time than one that stays behind. That has been measured with real clocks.
          </li>
          <li>
            <strong>Open:</strong> whether a path back in time can exist. In this page’s model one does, but the model needs a wormhole that no one has seen. No path back in time has been seen, and nobody has proved whether nature allows or forbids one.
          </li>
          <li>The numbers come from this page’s own calculation and from search results and summaries. NASA’s Space Place page was read. No paper was read in full.</li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real result for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (how long mouth B’s own clock says the trip took): you guessed <strong>{clockGuess !== null ? clockLabel : '…'}</strong>. The real number is in Table 1, in the row “B’s clock after the trip”.
          </li>
          <li>
            <strong>Prediction 2</strong> (could a traveller get back before they left?): you guessed <strong>{beforeGuess !== null ? beforeLabel : '…'}</strong>. The real result is in Table 1, in the row “Time gained, at best”.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1
        sets what this page calculates beside a reference and says in plain words how they compare, with “the same”, “more” or “less”. It does not say “good” or “bad”, because there is no accepted range for how closely such a calculation should
        match.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the calculated numbers beside a reference</p>
      <ResultsTable
        minWidth={760}
        head={['What we compare', 'Calculated here', 'Reference', 'How to read it']}
        rows={[
          [
            'Offset between the two clocks, by the twin formula',
            `${num(c.offsetFormulaYears)} years`,
            `the jump of the tunnel link in Picture 2: ${num(p2.entry.time)} − ${num(p2.exit.time)} = ${num(c.offsetFromLinkYears)} years`,
            `${comparisonWord(c.offsetVersusLink)}.`,
          ],
          [
            `B’s clock after the trip${tag1}`,
            `${num(c.movingYears)} years`,
            `A’s clock, which stayed put: ${num(c.stayAtHomeYears)} years`,
            `${comparisonWord(c.movingVersusStayAtHome)}: ${num(c.movingOverStayAtHome)} times as much.`,
          ],
          [
            'Which way the clock difference goes',
            c.movingClockIsBehind ? 'the moving clock is behind the one that stayed' : 'the moving clock is not behind',
            'NASA Space Place: a clock flown round the world on an aircraft came back slightly behind a clock on the ground',
            c.movingClockIsBehind ? 'The same direction. No number from the flights was read, so the sizes are not compared.' : 'Not the same direction.',
          ],
          [
            'Offset beside the light-travel time between the mouths',
            `${num(c.offsetFormulaYears)} years`,
            `the time light needs to cross the gap outside: ${num(c.lightTravelYears)} year`,
            `${comparisonWord(c.offsetVersusLight)}: ${num(c.offsetOverLight)} times as much.`,
          ],
          [
            `Time gained, at best${tag2}`,
            `${num(c.timeGainedYears)} years`,
            `the entry and the arrival in Picture 2: ${num(p2.entry.time)} − ${num(p2.arrival.time)} = ${num(c.gainedFromDiagramYears)} years`,
            `${comparisonWord(c.gainedVersusDiagram)}.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the main numbers from this page’s calculation, each set beside a reference: the same number worked out a second way, the clock that stayed behind, the light-travel time that the offset has to beat, and the direction of the difference that NASA reports for a real clock.',
          },
          {
            label: 'What it means',
            text: (
              <>
                The offset is {num(c.offsetFormulaYears)} years by the twin formula and {num(c.offsetFromLinkYears)} years as the jump of the tunnel link, so the two routes agree. Mouth B’s clock counted {num(c.movingYears)} years against A’s {num(c.stayAtHomeYears)}, which is{' '}
                {num(c.movingOverStayAtHome)} times as much. The offset is {num(c.offsetOverLight)} times the light-travel time, so it is long enough to beat it, and the time gained is {num(c.offsetFormulaYears)} − {num(c.lightTravelYears)} = {num(c.timeGainedYears)} years, the same as the gap between the arrival
                and the entry in Picture 2.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'the clock difference is the part that has been measured (in direction, by real clocks), and the step from a clock difference to a path back in time is the part that has not. The comparison shows that this page’s model hangs together: the same numbers come out whichever way they are worked out. It does not show that a wormhole could exist.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the twin formula is standard special relativity, the same arithmetic as Experiment 10. The rule that the tunnel joins equal clock readings, and the condition that the offset must beat the light-travel time, are this page’s reading of a summary of Morris, Thorne and Yurtsever’s 1988 paper, which was not read. The agreement of the rows shows that the arithmetic is consistent, not that the model is true of nature.',
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. From the speed to the time gained</p>
      <ResultsTable
        minWidth={640}
        head={['Step', 'Value', 'How to read it']}
        rows={[
          ['Speed of the moving mouth', `${s.speed} c`, `${s.speed * 100} percent of the speed of light. The trip lasts ${s.tripYears} years on A’s clock.`],
          ['The speed squared', `${num(s.speedSquared)}`, `${s.speed} × ${s.speed}.`],
          ['One minus that', `${num(s.oneMinusSquared)}`, `1 − ${num(s.speedSquared)}.`],
          ['The factor k (its square root)', `${num(s.factor)}`, `√${num(s.oneMinusSquared)}. A moving clock counts k times as many years as a clock that stays.`],
          ['B’s clock', `${num(s.movingYears)} years`, `${s.tripYears} × ${num(s.factor)}. This is the number to compare with Prediction 1.`],
          ['The offset', `${num(s.offsetYears)} years`, `${s.tripYears} − ${num(s.movingYears)}. How far B’s clock is behind A’s.`],
          ['The separation, and the light-travel time', `${s.separationLy} light-year, ${num(s.lightTravelYears)} year`, `Light crosses one light-year in one year. Nothing crosses faster.`],
          ['The time gained, at best', `${num(s.timeGainedYears)} years`, `${num(s.offsetYears)} − ${num(s.lightTravelYears)}. This is the number to compare with Prediction 2.`],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the steps from the speed of the moving mouth to the time gained, each with its number, so that no step is hidden.',
          },
          {
            label: 'What it means',
            text: (
              <>
                At {s.speed} c the factor k is √(1 − {num(s.speedSquared)}) = {num(s.factor)}. Over {s.tripYears} years on A’s clock, B’s clock counts {s.tripYears} × {num(s.factor)} = {num(s.movingYears)} years, so it is {num(s.offsetYears)} years behind. Light needs {num(s.lightTravelYears)} year to cross the{' '}
                {s.separationLy} light-year gap. {num(s.offsetYears)} − {num(s.lightTravelYears)} = {num(s.timeGainedYears)} years.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'each step is plain arithmetic. The first five are the twin paradox and have been tested with real clocks. Only the last two depend on the tunnel, and that part is a model.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the arithmetic is exact for the numbers chosen. The model leaves out the turning round and speeding up of mouth B, so the real offset in such a trip would differ slightly, and this page does not say by how much.',
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. What has been tested, and what has not</p>
      <ResultsTable minWidth={640} head={['Idea', 'What has been found', 'Status']} rows={TESTED.map((r) => [r.idea, r.what, r.status])} />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'a short list of the ideas on this page, each with what has been found and a plain label for how far it has been tested. It is a list of what this page found, not of every study.',
          },
          {
            label: 'What it means',
            text: 'only the first row is a measurement: real clocks have been seen to count different amounts of time. “Not seen” means that no observation was reported in the sources read. It does not mean that it has been shown to be impossible. “A conjecture” means an idea that has been argued for but not proved, and “Simulated only” means done on a computer, not in nature.',
          },
          {
            label: 'Why it matters',
            text: 'this is the line between what is known and what is imagined. Travel to the future is known. Travel to the past is a mathematical possibility in some models, with no observation behind it. A learner reading a headline about “time travel” can ask which row it belongs to.',
          },
          {
            label: 'How sure the numbers are',
            text: 'only the first row rests on a page that was read in full, NASA’s Space Place page. The others come from search results and from the abstracts of the papers listed below, which were read. No paper was read in full, and the 1988 abstract does not say how the time machine is made by moving one mouth.',
          },
        ]}
      />
      <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>The papers behind these numbers.</strong> They are listed here, after the run, because some of them give the answers to your predictions. Links open in a new tab. Only the abstracts (the short summaries at the top) were read for this page, not the full papers.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <ExternalLink href="https://authors.library.caltech.edu/9262/">Morris, Thorne and Yurtsever, “Wormholes, time machines, and the weak energy condition”, Physical Review Letters (1988)</ExternalLink>: the paper that showed a wormhole, if one could be made and kept open, could be turned into a time machine.
          </li>
          <li>
            <ExternalLink href="https://arxiv.org/abs/hep-th/9202090">Visser, “From wormhole to time machine: comments on Hawking’s chronology protection conjecture” (1992)</ExternalLink>: a reply to Hawking’s idea that, in the model problems it studies, supports it.
          </li>
          <li>
            <ExternalLink href="https://arxiv.org/abs/2101.08592">Luminet, “Closed timelike curves, singularities and causality: a survey from Gödel to chronological protection”, Universe (2021)</ExternalLink>: a history of paths back in time in general relativity.
          </li>
          <li>
            <ExternalLink href="https://arxiv.org/abs/2408.06023">Bunyaratavej, Burikham and Senjaya (2024)</ExternalLink> and <ExternalLink href="https://arxiv.org/abs/2509.19744">Park and Maeda (2025)</ExternalLink>: the two recent papers in Table 3, each on a particular kind of black hole.
          </li>
          <li>
            <ExternalLink href="https://arxiv.org/abs/2607.27473">Morapakula and Ikeda, “Closed timelike curve decoding on quantum hardware” (2026)</ExternalLink>: the quantum-computer simulation in Table 3.
          </li>
          <li>
            <strong>Not linked</strong> (the publisher’s page could not be checked here): Hawking, “Chronology protection conjecture”, <em>Physical Review D</em> 46, 603 (1992), and the publisher’s own page for the 1988 paper.
          </li>
        </ul>
      </div>
    </div>
  )
}
