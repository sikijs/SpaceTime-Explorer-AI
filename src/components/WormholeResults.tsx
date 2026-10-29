import type { ReactNode } from 'react'
import { CROSS_CHOICES, ECHO_SEARCHES, MASS_CHOICES, PREDICTION_THROAT_RADIUS_M, exampleSteps, resultsCheckUp } from '../physics/wormholes'
import type { Comparison, CrossChoiceId, MassChoiceId } from '../physics/wormholes'
import { ResultsTable } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 1: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's guesses or settings. The wording is the
// owner's draft of 2026-10-29, approved line by line (CLAUDE.md §28.1). Why the simplest throat closes and why a flare needs negative energy are left to the tutor (CLAUDE.md §12, §13). The papers behind
// the numbers are listed in a later step, after the run, because some of them give the answers to the predictions.

const noteStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' } as const
const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

const SUPERSCRIPT: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
function sci(x: number, digits: number = 1): string {
  const exponent = Math.floor(Math.log10(x))
  const mantissa = x / Math.pow(10, exponent)
  return `${mantissa.toFixed(digits)} × 10${String(exponent).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
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

export function WormholeResults({ crossGuess, massGuess }: { crossGuess: CrossChoiceId | null; massGuess: MassChoiceId | null }) {
  const c = resultsCheckUp()
  const s = exampleSteps()
  const crossLabel = crossGuess !== null ? (CROSS_CHOICES.find((x) => x.id === crossGuess)?.label ?? '') : ''
  const massLabel = massGuess !== null ? (MASS_CHOICES.find((x) => x.id === massGuess)?.label ?? '') : ''
  const tag1 = crossGuess !== null ? ` [your guess for Prediction 1: ${crossLabel}]` : ''
  const tag2 = massGuess !== null ? ` [your guess for Prediction 2: ${massLabel}]` : ''
  const [f1, f2, f3] = c.closingFractions
  const [t1, t2, t3] = c.closingTimes

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0f766e' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: '#0f766e' }}>Part 3: The results</h3>
      <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>What we are about to do.</strong> Here are the numbers behind the pictures, in three tables, each with a short guide. These tables are the real numbers, so they never change with your guesses or with your settings in Part 2.
      </p>

      <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Where this stands (as of October 2026): Open.</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Settled:</strong> what the equations say. The simplest throat closes, and an open throat needs negative energy.
          </li>
          <li>
            <strong>Open:</strong> whether any wormhole exists. No one has seen one, and the {ECHO_SEARCHES.length} searches for echoes listed in Table 3 found nothing significant.
          </li>
          <li>The numbers come from abstracts and summaries, and from this page’s own calculation. No paper was read in full.</li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real result for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (could light cross the simplest wormhole?): you guessed <strong>{crossGuess !== null ? crossLabel : '…'}</strong>. The real result is in Table 1, in the row “The simplest throat, over time”.
          </li>
          <li>
            <strong>Prediction 2</strong> (the negative mass a {PREDICTION_THROAT_RADIUS_M} metre throat needs): you guessed <strong>{massGuess !== null ? massLabel : '…'}</strong>. The real number is in Table 1, in the row “Negative mass”, and in Table 2.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1 is a check-up: it sets each number this page
        calculates beside a reference, and says in plain words how they compare, with “the same”, “more” or “less”. It does not say “good” or “bad”, because there is no accepted range for how closely such a calculation should match. Where there is no number to compare with, it says so.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the calculated numbers beside a reference</p>
      <ResultsTable
        minWidth={760}
        head={['What we compare', 'Calculated here', 'Reference', 'How to read it']}
        rows={[
          [
            `The simplest throat, over time${tag1}`,
            `at T = ${t1}, ${t2} and ${t3}: ${n2(f1)}, ${n2(f2)} and ${n2(f3)} of its opening size`,
            'its opening size at T = 0, which is 1.00',
            c.closingFallsEachTime ? `Less each time. By T = ${c.shutAtT} it is shut.` : 'Not less each time.',
          ],
          [
            `Negative mass, ${PREDICTION_THROAT_RADIUS_M} m throat${tag2}`,
            `${sci(c.massKg)} kg (${n2(c.massJupiters)} Jupiters)`,
            `a secondary summary’s formula: ${sci(c.secondaryMassKg)} kg (${n2(c.secondaryJupiters)} Jupiters)`,
            `${comparisonWord(c.massVersusSecondary)}: ${n2(c.massRatio)} times.`,
          ],
          [
            '10 m throat: tension',
            `${sci(c.tension10mDynPerCm2)} dyn/cm²`,
            `Kuhfittig 2022: ${sci(c.publishedTension10mDynPerCm2, 0)} dyn/cm²`,
            `${comparisonWord(c.tension10mVersusPublished)}: ${n2(c.tension10mRatio)} times.`,
          ],
          [
            '3 km throat: tension',
            `${sci(c.tension3kmDynPerCm2)} dyn/cm²`,
            'the published statement: the same size as the pressure at the centre of a massive neutron star',
            'A comparison in words only. No number for the star was read.',
          ],
          [
            `Casimir energy, plates ${c.casimirGapM * 1e6} µm apart, 1 m²`,
            `${sci(c.casimirJPerM2)} J`,
            `the energy a ${PREDICTION_THROAT_RADIUS_M} m throat needs, ${sci(c.neededJ)} J`,
            `Less: the energy needed is ${sci(c.shortfall)} times as much.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the main numbers from this page’s calculation, each set beside a reference: the throat’s own starting size, a formula from a summary, a published figure, or the energy a throat needs.',
          },
          {
            label: 'What it means',
            text: (
              <>
                The simplest throat shrinks to {n2(f1)}, {n2(f2)} and {n2(f3)} of its opening size at T = {t1}, {t2} and {t3}, and is shut at T = {c.shutAtT}. A throat {PREDICTION_THROAT_RADIUS_M} m in radius needs {sci(c.massKg)} kg of negative mass, which is {n2(c.massJupiters)} Jupiters. The summary’s formula gives {n2(c.secondaryJupiters)} Jupiters,
                so the two differ by {n2(c.massRatio)} times, but both say “about one Jupiter”. The tension at a 10 m throat is {n2(c.tension10mRatio)} times Kuhfittig’s figure, and a 3 km throat has a tension of {sci(c.tension3kmDynPerCm2)} dyn/cm², which the published statement puts at the size of the pressure at the centre of a massive neutron star. The plates hold{' '}
                {sci(c.casimirJPerM2)} J per square metre, which is {sci(c.shortfall)} times too little. To make up the gap you would need plates covering {n2(c.fractionOfUniverseSurface)} times the surface of the observable universe, which is a rough illustration and not a design.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'a shape that the equations allow is not the same as a thing that exists. The numbers show what holding a tunnel open would cost: negative mass of about one Jupiter for a tunnel two metres across, a pull as strong as anything known in nature for a larger one, and a laboratory source of negative energy that is smaller by more than fifty powers of ten. Why the simplest throat closes, and why a flared tunnel needs negative energy at all, is for the tutor.',
          },
          {
            label: 'How sure the numbers are',
            text: `the mass formula is worked out on this page, and the only other formula found is from a summary, so the two differ and neither is confirmed against Morris and Thorne’s paper. The closing of the simplest throat uses a standard relation that was not checked against Fuller and Wheeler’s paper. Kuhfittig’s figure is read from a 2022 paper that repeats Morris and Thorne’s, and the Casimir energy is a standard formula for ideal plates, which real plates only approach.`,
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. From the throat radius to the negative mass, for a {s.radiusM} metre throat</p>
      <ResultsTable
        minWidth={640}
        head={['Step', 'Value', 'How to read it']}
        rows={[
          ['Throat radius (b₀)', `${s.radiusM} m`, 'How wide the narrowest part of the tunnel is, measured from the middle to the wall.'],
          ['The speed of light squared (c²)', `${sci(s.c ** 2)} m²/s²`, 'The speed of light times itself. It turns a mass into an energy.'],
          ['The constant of gravity (G)', `${sci(s.g, 4)} m³/(kg s²)`, 'A number for how strong gravity is.'],
          ['The closed form: π × b₀ × c² ÷ (2 × G)', `${sci(s.closedFormKg)} kg`, `3.14 × ${s.radiusM} × ${sci(s.c ** 2)} ÷ (2 × ${sci(s.g, 4)}). The negative mass that a throat this size needs, added over both sides of the tunnel.`],
          ['The same mass by a separate sum', `${sci(s.numericKg)} kg`, `Adding up the negative density, slice by slice, over the whole tunnel. It is the same as the closed form to ${s.relativeDifference < 1e-9 ? 'ten figures' : 'a few figures'}.`],
          ['In Jupiters, and in Earths', `${n2(s.jupiters)} Jupiters, ${Math.round(s.earths)} Earths`, 'The mass divided by the mass of Jupiter, and of the Earth. This is the number to compare with Prediction 2.'],
          ['The energy of that mass (mass × c²)', `${sci(s.energyJ)} J`, 'The negative energy that the throat needs, in joules. It is the number compared with the Casimir energy in Table 1.'],
          ['The tension at the throat', `${sci(s.tensionPa)} Pa`, 'The pull along the tunnel, in pascals (force per square metre), that would hold the throat open.'],
        ]}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'the steps from the throat’s radius to the mass it needs, each with its number, so that no step is hidden.',
          },
          {
            label: 'What it means',
            text: (
              <>
                A throat {s.radiusM} m in radius gives π × {s.radiusM} × {sci(s.c ** 2)} ÷ (2 × {sci(s.g, 4)}) = {sci(s.closedFormKg)} kg. A separate sum over the tunnel gives the same, so the formula does what it says. That mass is {n2(s.jupiters)} Jupiters. Its energy, mass × c², is {sci(s.energyJ)} J. A throat twice as wide needs twice
                the mass, because b₀ appears once in the formula.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'the size of the cost grows with the size of the tunnel. A tunnel big enough for a person to pass needs far more than a tiny one.',
          },
          {
            label: 'How sure the numbers are',
            text: 'the formula is worked out on this page from the simplest throat in Morris and Thorne’s mathematics, and the choice of that shape was not checked against their paper. The agreement of the two sums shows that the arithmetic is right. It does not show that the shape is the one they used.',
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. What has been looked for: searches for echoes</p>
      <ResultsTable
        minWidth={640}
        head={['Search', 'Events searched', 'What it found']}
        rows={ECHO_SEARCHES.map((e) => [`${e.authors} (${e.arxiv})`, e.events.join(', '), `${e.finding.charAt(0).toUpperCase()}${e.finding.slice(1)}.`])}
      />
      <Note
        items={[
          {
            label: 'What it is',
            text: 'two searches of gravitational-wave data for echoes, faint repeats that some ideas say a wormhole would leave and a black hole would not. These are the two searches this page read, not every search.',
          },
          {
            label: 'What it means',
            text: (
              <>
                The first search found no statistically significant evidence of echoes in {ECHO_SEARCHES[0].events.length} events. The second gives a Bayes factor of {ECHO_SEARCHES[1].bayesFactor} for echoes in {ECHO_SEARCHES[1].events.join(', ')}. A Bayes factor above 1 favours echoes and below 1 disfavours them, and the authors say that this one is not robust evidence.
              </>
            ),
          },
          {
            label: 'Why it matters',
            text: 'this is the only observational test in the table. It looks for one kind of sign, and finding none does not rule out every kind of wormhole.',
          },
          {
            label: 'How sure the numbers are',
            text: 'both rows come from the papers’ abstracts, which were read for this page. The full papers were not.',
          },
        ]}
      />
    </div>
  )
}
