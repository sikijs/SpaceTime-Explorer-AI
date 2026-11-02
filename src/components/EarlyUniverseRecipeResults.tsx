import type { ReactNode } from 'react'
import {
  ATOM_ANSWER_CHOICES,
  DEUTERIUM_OBSERVED_E5,
  DEUTERIUM_THEORY_E5,
  FREEZE_OUT_TIME_S,
  HELIUM_EMPRESS_VERSION_ONE,
  HELIUM_TO_HYDROGEN_WEIGHT,
  LITHIUM_OBSERVED_E10,
  LITHIUM_THEORY_E10,
  SENSITIVITY_TEMPERATURES_MEV,
  SHARE_ANSWER_CHOICES,
  certaintyRows,
  heliumShareForTemperature,
  lithiumGapOverGiveOrTake,
  resultsCheckUp,
  stepsTable,
} from '../physics/earlyUniverseRecipe'
import type { PairReading } from '../physics/earlyUniverseRecipe'
import { ResultsTable } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 6: Part 3, the results (CLAUDE.md §14, "Reading the Results" and "Predictions and the Real Results").
// Every number is read from the physics module (CLAUDE.md §9); this file only sets it out. The tables are the real numbers and never change with the learner's guesses or settings. The wording is
// Claude's DRAFT of 2026-11-01, for the owner's approval line by line (CLAUDE.md §28.1). Why helium and not heavier elements was made, why the neutrons could only be held after about three minutes, and what might explain
// the lithium gap are left to the tutor (CLAUDE.md §12, §13). The papers and pages behind the numbers are listed at the end (a later step), after the run.

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
const n3 = (x: number) => x.toFixed(3)
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)

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

// A plain reading of a published calculation beside a measurement, using the give-or-takes only (no other cut-off).
function readPair(p: PairReading, digits: (x: number) => string): string {
  if (p.overlap) return `${cap(p.reading)}: they differ by ${digits(p.difference)}, and their give-or-takes added together are ${digits(p.combinedGiveOrTake)}, so each reaches the other.`
  return `${cap(p.reading)}: the measurement is ${p.reading} than the calculation by ${digits(p.difference)}, and the give-or-takes added together are only ${digits(p.combinedGiveOrTake)}, so the two do not reach each other.`
}

export function EarlyUniverseRecipeResults({ shareGuess, atomGuess }: { shareGuess: string | null; atomGuess: string | null }) {
  const c = resultsCheckUp()
  const t = stepsTable()
  const rows = certaintyRows()
  const sens = SENSITIVITY_TEMPERATURES_MEV.map((kt) => ({ kt, helium: heliumShareForTemperature(kt) * 100 }))
  const shareLabel = shareGuess !== null ? (SHARE_ANSWER_CHOICES.find((x) => x.id === shareGuess)?.label.toLowerCase() ?? '') : ''
  const atomLabel = atomGuess !== null ? (ATOM_ANSWER_CHOICES.find((x) => x.id === atomGuess)?.label.toLowerCase() ?? '') : ''
  const tag1 = shareGuess !== null ? ` [your guess for Prediction 1: ${shareLabel} helium by mass]` : ''
  const tag2 = atomGuess !== null ? ` [your guess for Prediction 2: ${atomLabel} helium atoms for every 100 hydrogen atoms]` : ''
  const lithiumTimes = c.lithiumRatio
  const gapTimes = lithiumGapOverGiveOrTake()
  const certainty = (id: string) => rows.find((r) => r.id === id)!

  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0f766e' }}>
      <h3 style={{ margin: '0 0 0.5rem', color: '#0f766e' }}>Part 3: The results</h3>
      <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>What we are about to do.</strong> Here are the numbers behind the pictures, in three tables, each with a short guide. These tables are the real numbers, so they never change with your guesses or with your settings in Part 2.
      </p>

      <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Where this stands (as of October 2026): Settled for helium and deuterium, Open for lithium.</strong>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Settled:</strong> for deuterium, and for the helium measurement made with the Large Binocular Telescope (LBT), the published calculation and the measurement agree within their give-or-takes (Table 1). These are long-standing tests, not a new result. A second helium
            value, from the EMPRESS collaboration, is lower, and its range does not reach the calculation’s. The page shows both and does not choose between them.
          </li>
          <li>
            <strong>Open:</strong> lithium-7. The published calculation is about {n1(lithiumTimes)} times the measurement, and no cause has been settled. The tutor says what has been tried.
          </li>
          <li>
            <strong>What was read:</strong> a 2026 review of the calculations (Burns), the abstract and parts of the LBT paper, the abstracts of two EMPRESS papers, NIST’s page on the neutron’s lifetime and two Berkeley Lab pages. Most numbers were read through a summary of the 2026 review, so the deuterium, lithium-7 and
            neutron figures are not verified at the page itself. The Particle Data Group’s review could not be read.
          </li>
          <li>
            <strong>Not checked here:</strong> the full chain of nuclear reactions that the real calculations follow; how the amounts depend on the density of ordinary matter and on the number of kinds of neutrino; the body of the EMPRESS paper (only its abstract was read); and any newer result beyond one limited search.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real result for each. They are not marked here.
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Prediction 1</strong> (the share of the early universe’s ordinary matter, by mass, that was helium): you guessed <strong>{shareGuess !== null ? shareLabel : '…'}</strong>. The real numbers are in Table 1, in the first row.
          </li>
          <li>
            <strong>Prediction 2</strong> (helium atoms for every 100 hydrogen atoms): you guessed <strong>{atomGuess !== null ? atomLabel : '…'}</strong>. The real numbers are in Table 1, in the last row, and in the last row of Table 2.
          </li>
        </ul>
      </div>

      <p style={paragraph}>
        <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under it, called “What this table tells us”. Table 1 sets each number beside a reference and says in plain
        words how they compare. “Give-or-take” is the size of the doubt that the people who made a number put on it: 24.58 ± 0.13 means “about 24.58, give or take 0.13”. Two numbers are called “the same” here only when their give-or-takes added together are big enough for each to reach the other. Otherwise the table says
        “more” or “less”. It does not say “good” or “bad”, because there is no accepted range for how closely a simple calculation should match a measurement.
      </p>

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the numbers beside a reference</p>
      <ResultsTable
        minWidth={860}
        head={['What we compare', 'Found', 'Reference', 'How to read it']}
        rows={[
          [
            `Helium by mass, measured with the LBT${tag1}`,
            `${n2(c.helium.found.value)} ± ${n2(c.helium.found.giveOrTake)} percent`,
            `the published calculation: ${n2(c.helium.calculation.value)} ± ${n2(c.helium.calculation.giveOrTake)} percent`,
            readPair(c.helium, n2),
          ],
          [
            'Helium by mass, from the EMPRESS collaboration (Yanagisawa and colleagues, 2025)',
            `${n2(c.heliumEmpress.found.value)} ± ${n2(c.heliumEmpress.found.giveOrTake)} percent`,
            `the published calculation: ${n2(c.heliumEmpress.calculation.value)} ± ${n2(c.heliumEmpress.calculation.giveOrTake)} percent`,
            readPair(c.heliumEmpress, n2),
          ],
          [
            'Deuterium, measured (×10⁻⁵ deuterium atoms per hydrogen atom)',
            `${DEUTERIUM_OBSERVED_E5.value} ± ${DEUTERIUM_OBSERVED_E5.giveOrTake}`,
            `the published calculation: ${DEUTERIUM_THEORY_E5.value} ± ${DEUTERIUM_THEORY_E5.giveOrTake}`,
            readPair(c.deuterium, n3),
          ],
          [
            'Lithium-7, measured (×10⁻¹⁰ lithium-7 atoms per hydrogen atom)',
            `${LITHIUM_OBSERVED_E10.value} ± ${LITHIUM_OBSERVED_E10.giveOrTake}`,
            `the published calculation: ${LITHIUM_THEORY_E10.value} ± ${LITHIUM_THEORY_E10.giveOrTake}`,
            `${readPair(c.lithium, n2)} The calculation is ${n1(lithiumTimes)} times the measurement.`,
          ],
          [
            'Helium by mass, this page’s own calculation (calculated here, not a test)',
            `${n2(c.pageHelium.value)} percent`,
            `the LBT measurement: ${n2(c.pageHelium.measured.value)} ± ${n2(c.pageHelium.measured.giveOrTake)} percent`,
            `${cap(c.pageHelium.reading)}: ${n2(c.pageHelium.difference)} percentage points ${c.pageHelium.reading === 'less' ? 'below' : c.pageHelium.reading === 'more' ? 'above' : 'from'} the measured value, ${c.pageHelium.reading === 'the same' ? 'inside' : 'outside'} its give-or-take. The page’s calculation rests on a temperature it chose, so this is not a test of the physics.`,
          ],
          [
            `Helium atoms for every 100 hydrogen atoms, this page’s own calculation (calculated here, not a test)${tag2}`,
            n1(c.pageAtoms.value),
            `the count worked out from the LBT share: ${n2(c.pageAtoms.measured.value)}`,
            `${cap(c.pageAtoms.reading)}: ${n2(c.pageAtoms.difference)} ${c.pageAtoms.reading === 'less' ? 'below' : c.pageAtoms.reading === 'more' ? 'above' : 'from'} the count from the measured share. This is the same gap as in the row above, counted in atoms instead of weight.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'Helium, measured with the LBT',
            text: (
              <>
                <em>What it is:</em> the share of the weight that is helium, measured from the light of gas in small galaxies that have made very few heavy elements, set beside a calculation of the same share from nuclear physics. <em>What it means:</em> {n2(c.helium.found.value)} ± {n2(c.helium.found.giveOrTake)} and {n2(c.helium.calculation.value)} ± {n2(c.helium.calculation.giveOrTake)} differ by {n2(c.helium.difference)}, less than the {n2(c.helium.combinedGiveOrTake)} their
                give-or-takes add up to, so they are “the same”. It is like two forecasts for tomorrow’s temperature, 20 ± 1 degrees and 21 ± 1 degrees: each reaches the other, so both can be right. <em>Why it matters:</em> a calculation and a measurement made in completely different ways land on the same quarter of the weight. <em>How sure:</em> the measurement’s
                give-or-take is {n2(certainty('helium-lbt').percentOfValue)} percent of its value.
              </>
            ),
          },
          {
            label: 'Helium, from the EMPRESS collaboration',
            text: (
              <>
                <em>What it is:</em> a second helium measurement, made with the Subaru telescope on galaxies with very few heavy elements (called very metal-poor galaxies). <em>What it means:</em> {n2(c.heliumEmpress.found.value)} ± {n2(c.heliumEmpress.found.giveOrTake)} is lower than the calculation by {n2(c.heliumEmpress.difference)}, more than the {n2(c.heliumEmpress.combinedGiveOrTake)} their give-or-takes add up to, so the two do not reach each other. <em>Why it matters:</em> two measurements of the same thing do
                not give the same value, which is part of how sure the answer really is. The 2026 review says the analyses differ in how they extend their results to a galaxy with no heavy elements, in how uniform their observations are, and in how they treat impossible values, and it does not say which is right. <em>How sure:</em> the value is the one in the abstract of the 2025 paper by Yanagisawa and colleagues (version of July 2026). An earlier version of the same paper gave {n2(HELIUM_EMPRESS_VERSION_ONE.value * 100)} percent, which is lower still, and the page does not say which version a reader should prefer. The paper’s body was not read.
              </>
            ),
          },
          {
            label: 'Deuterium',
            text: (
              <>
                <em>What it is:</em> deuterium (hydrogen with one proton and one neutron) as a share of the hydrogen, in units of 0.00001, so 2.5 means about 2.5 deuterium atoms in every 100,000 hydrogen atoms. <em>What it means:</em> {DEUTERIUM_OBSERVED_E5.value} and {DEUTERIUM_THEORY_E5.value} differ by {n3(c.deuterium.difference)}, less than the {n3(c.deuterium.combinedGiveOrTake)} their give-or-takes add up to, so they are “the same”.
                <em> Why it matters:</em> it is a second element that has been both calculated and measured, and the two agree, which is stronger than one element agreeing. <em>How sure:</em> the measurement’s give-or-take is {n2(certainty('deuterium-observed').percentOfValue)} percent of its value, tighter than lithium’s.
              </>
            ),
          },
          {
            label: 'Lithium-7',
            text: (
              <>
                <em>What it is:</em> lithium-7 as a share of the hydrogen, in units of 0.0000000001. <em>What it means:</em> {LITHIUM_OBSERVED_E10.value} and {LITHIUM_THEORY_E10.value} differ by {n2(c.lithium.difference)}, which is {n1(gapTimes)} times the {n3(c.lithium.combinedGiveOrTake)} their give-or-takes add up to, so the ranges are far apart, and the calculation is {n1(lithiumTimes)} times the measurement. <em>Why it matters:</em> this is the one
                element where the numbers do not meet, which is why it is called “Open”. <em>How sure:</em> the measurement is the least precise of the set (its give-or-take is {n1(certainty('lithium-observed').percentOfValue)} percent of its value), yet even a doubt that large cannot close a gap this wide. The page does not give a cause.
              </>
            ),
          },
          {
            label: 'This page’s own calculation',
            text: (
              <>
                <em>What it is:</em> the simplified calculation of Table 2, set beside the LBT measurement. <em>What it means:</em> it gives {n2(c.pageHelium.value)} percent, {n2(c.pageHelium.difference)} points below {n2(c.pageHelium.measured.value)}, and {n1(c.pageAtoms.value)} helium atoms for every 100 hydrogen atoms against {n2(c.pageAtoms.measured.value)}. <em>Why it matters:</em> it lands near the measurement, but it is not a test, because one number in it was chosen. If the chosen temperature were{' '}
                {sens[0].kt} instead of {sens[1].kt} MeV, the helium share would be {n1(sens[0].helium)} percent, and at {sens[2].kt} MeV it would be {n1(sens[2].helium)} percent, against {n1(sens[1].helium)} percent now. <em>How sure:</em> not sure at all: the choice moves the answer by several points either way, and nothing on this page shows the choice was the right one.
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
          ['1', 'How much heavier the neutron is than the proton', `${n2(t.massDifferenceMeV)} MeV`, 'From the list of values in the 2026 review, read through a summary.'],
          ['2', 'The temperature used to work out how many neutrons there are at the start of the wait', `${n2(t.freezeOutKtMeV)} MeV`, 'Chosen by this page, not measured. It is the weakest link (see the note under Table 1).'],
          [
            '3',
            `Neutrons for every proton at the start of the wait (about ${FREEZE_OUT_TIME_S} second)`,
            `${n3(t.freezeOutNeutronsPerProton)}, which is 1 neutron in ${n1(t.freezeOutOneIn)} protons`,
            'Worked out from steps 1 and 2 by the page’s one rule, which the tutor explains.',
          ],
          ['4', 'The wait', `${t.waitS} seconds from the start, so ${t.decaySeconds} seconds of waiting`, 'The time at which the page counts the neutrons that are left.'],
          ['5', 'The share of those neutrons still there after the wait', `${Math.round(t.leftFraction * 100)} percent`, `Neutrons on their own last ${n1(t.lifetimeS)} seconds on average, so ${t.decaySeconds} seconds is about ${Math.round((t.decaySeconds / t.lifetimeS) * 100)} percent of that.`],
          ['6', 'Neutrons for every proton after the wait', `${n3(t.neutronsPerProton)}, which is 1 neutron in ${n1(t.oneIn)} protons`, 'Step 3’s number times step 5’s share.'],
          [
            '7',
            'Helium by weight',
            `${n1(t.heliumShare * 100)} percent (hydrogen: ${n1(t.hydrogenShare * 100)} percent)`,
            `Every neutron left pairs with a proton in a helium-4 nucleus: 2 × ${n3(t.neutronsPerProton)} ÷ (1 + ${n3(t.neutronsPerProton)}) = ${n3(t.heliumShare)}.`,
          ],
          [
            `8${tag2}`,
            'Helium atoms for every 100 hydrogen atoms',
            n1(t.atomsPerHundred),
            `A helium atom weighs ${HELIUM_TO_HYDROGEN_WEIGHT} times as much as a hydrogen atom, so ${n1(t.heliumShare * 100)} percent of the weight is only ${n1(t.atomsPerHundred)} atoms for every 100 hydrogen atoms.`,
          ],
        ]}
      />
      <Note
        items={[
          {
            label: 'What the steps are',
            text: (
              <>
                <em>What it is:</em> the whole calculation, from the neutron and proton to the helium share. <em>What it means:</em> it is a chain, each step using the one before. Steps 1 and 2 give how many neutrons there are at the start (1 in {n1(t.freezeOutOneIn)}); the wait takes that down to 1 in {n1(t.oneIn)}; steps 7 and 8 turn the neutrons that remain into helium. <em>Why it matters:</em> the helium share is decided almost
                entirely by how many neutrons remain, so anything that changes steps 1 to 6 changes the helium. That is what the two settings in Part 2 do.
              </>
            ),
          },
          {
            label: 'The wait and the neutrons’ lifetime',
            text: (
              <>
                <em>What it is:</em> neutrons on their own do not last, as the introduction said. <em>What it means:</em> think of a bucket with a slow leak: after a while there is less water in it. Here {Math.round(t.leftFraction * 100)} percent of the neutrons are still there after {t.decaySeconds} seconds. <em>Why it matters:</em> a longer wait would leave fewer neutrons and so less helium (try it in Part 2). <em>How sure:</em> the neutron’s average life is itself in dispute between two kinds of experiment, as the introduction said.
              </>
            ),
          },
          {
            label: 'The temperature in step 2',
            text: (
              <>
                <em>What it is:</em> a number that the page chose so that the answer lands in the right region. <em>What it means:</em> with the real wait, {sens[0].kt} MeV gives {n1(sens[0].helium)} percent helium, {sens[1].kt} MeV gives {n1(sens[1].helium)} percent and {sens[2].kt} MeV gives {n1(sens[2].helium)} percent. <em>Why it matters:</em> this is why Table 1 calls the page’s own calculation “not a test”. A full calculation does not choose such a number. <em>How sure:</em> the value was not taken from a source.
              </>
            ),
          },
        ]}
      />

      <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. How sure each published number is</p>
      <ResultsTable
        minWidth={860}
        head={['Number', 'Value, give or take', 'Give-or-take as a share of the value', 'How to read it']}
        rows={rows.map((r) => {
          const names: Record<string, string> = {
            'helium-lbt': 'Helium by mass, LBT measurement (percent)',
            'helium-empress': 'Helium by mass, EMPRESS value (percent)',
            'helium-theory': 'Helium by mass, published calculation (percent)',
            'deuterium-observed': 'Deuterium, measured (×10⁻⁵)',
            'deuterium-theory': 'Deuterium, published calculation (×10⁻⁵)',
            'lithium-observed': 'Lithium-7, measured (×10⁻¹⁰)',
            'lithium-theory': 'Lithium-7, published calculation (×10⁻¹⁰)',
          }
          const digits = r.id.startsWith('helium') ? n2 : r.id.startsWith('deuterium') ? n3 : n2
          const how = r.kind === 'measured' ? 'A measurement.' : 'A calculation by others.'
          return [names[r.id], `${digits(r.value)} ± ${digits(r.giveOrTake)}`, `${n2(r.percentOfValue)} percent`, how]
        })}
      />
      <Note
        items={[
          {
            label: 'What the table is',
            text: (
              <>
                <em>What it is:</em> the size of the doubt on each number, as a share of the number itself. <em>What it means:</em> a smaller share means a more precise number. It is like measuring a table with a ruler marked in millimetres and one marked in centimetres: both can be honest, but one pins the length down more tightly. <em>Why it matters:</em> whether two numbers “agree” depends on how tight each is: a loose number can agree with almost anything.
              </>
            ),
          },
          {
            label: 'Which are tight and which are loose',
            text: (
              <>
                <em>What it means:</em> the helium calculation is the tightest of all ({n2(certainty('helium-theory').percentOfValue)} percent) and the LBT measurement is close behind ({n2(certainty('helium-lbt').percentOfValue)} percent); the EMPRESS value is looser ({n2(certainty('helium-empress').percentOfValue)} percent); deuterium is at about {n1(certainty('deuterium-observed').percentOfValue)} to {n1(certainty('deuterium-theory').percentOfValue)} percent; the lithium-7 measurement is the loosest
                ({n1(certainty('lithium-observed').percentOfValue)} percent). <em>Why it matters:</em> lithium is the loosest measurement and still does not meet the calculation, so its gap is not simply a matter of a loose number. <em>How sure:</em> all of these give-or-takes are as quoted in a 2026 review, read through a summary for deuterium and lithium.
              </>
            ),
          },
        ]}
      />

      <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>The papers and pages behind these numbers.</strong> They are listed here, after the run, because some of them give away the answers. Links open in a new tab. The arXiv abstract pages and the Berkeley Lab pages were opened on 1 November 2026. No paper was read in full.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <ExternalLink href="https://arxiv.org/abs/2601.22238">Aver, Skillman, Pogge, Rogers, Weller, Olive, Berg, Salzer, Miller and Méndez-Delgado, “The LBT Y_p Project IV: A New Value of the Primordial Helium Abundance”, arXiv:2601.22238 (29 January 2026)</ExternalLink>: the
            “LBT” helium measurement, {n2(c.helium.found.value)} ± {n2(c.helium.found.giveOrTake)} percent, from 54 gas clouds in small galaxies with very few heavy elements (15 of them in the final average). Submitted to the journals of the American Astronomical Society. The abstract and parts of the full text were read.
          </li>
          <li>
            <ExternalLink href="https://arxiv.org/abs/2506.24050">Yanagisawa and 20 others, “EMPRESS. XV. A New Determination of the Primordial Helium Abundance Suggesting a Moderately Low Y_P Value”, arXiv:2506.24050 (first version 30 June 2025, latest 30 July 2026)</ExternalLink>: the EMPRESS value,{' '}
            {n2(c.heliumEmpress.found.value)} ± {n2(c.heliumEmpress.found.giveOrTake)} percent, in the abstracts of the second and third versions. The first version’s abstract gave {n2(HELIUM_EMPRESS_VERSION_ONE.value * 100)} percent (+{n2(HELIUM_EMPRESS_VERSION_ONE.plus * 100)}, −{n2(HELIUM_EMPRESS_VERSION_ONE.minus * 100)}), and that is the figure the LBT paper’s table lists. The arXiv page says the paper was accepted for the
            Astrophysical Journal. Only the abstract pages were read.
          </li>
          <li>
            <ExternalLink href="https://arxiv.org/abs/2203.09617">Matsumoto, Ouchi and 43 others, “EMPRESS. VIII. A New Determination of Primordial He Abundance with Extremely Metal-Poor Galaxies”, arXiv:2203.09617 (17 March 2022)</ExternalLink>: an earlier EMPRESS paper, whose abstract gives 23.70 percent (+0.34, −0.33). This page does not draw it. Only the abstract was read.
          </li>
          <li>
            <ExternalLink href="https://arxiv.org/abs/2603.22414">Burns, “Inside the Black Box of Big Bang Nucleosynthesis: A Comprehensive Sensitivity Atlas for the Precision Era”, arXiv:2603.22414 (23 March 2026, revised 31 July 2026), Physics Reports 1194 (2026) 1–40</ExternalLink>: the 2026 review that this page takes the published
            calculations, the deuterium and lithium-7 figures and the neutron’s mass difference from. The start of the text was read as written, and the rest through a summary, so the deuterium, lithium-7 and neutron figures are not verified at the page itself.
          </li>
          <li>
            <ExternalLink href="https://arxiv.org/abs/1307.6955">Coc, Uzan and Vangioni, “Standard Big-Bang Nucleosynthesis after Planck”, arXiv:1307.6955 (26 July 2013)</ExternalLink>: an older calculation, whose abstract says the calculated lithium-7 is about 3 times the measurement. Its text was read in full, but it is a 2013 paper and its measured values are older.
          </li>
          <li>
            <ExternalLink href="https://aether.lbl.gov/www/science/bbndetails.html">Silk, “Origin of the Light Elements” (a page hosted by Berkeley Lab, with no date)</ExternalLink>: a plain account of the first seconds and minutes. Its “one neutron for every ten protons” is a rough figure and differs from the 1 in {n1(t.freezeOutOneIn)} and 1 in {n1(t.oneIn)} on this page, which does not use it. The “about 1 MeV”, “about 1 second” and “about three minutes” in
            the tutor are from this page.
          </li>
          <li>
            <ExternalLink href="https://www2.lbl.gov/abc/wallchart/chapters/10/0.html">Berkeley Lab, The ABC of Nuclear Science, Chapter 10, “Origin of the Elements” (last updated 9 August 2000)</ExternalLink>: a plain account that helium is about a quarter of the mass. It is old: it gives the age of the universe as about 15 billion years, which today’s figure replaces.
          </li>
          <li>
            <strong>Not linked:</strong> the Particle Data Group’s review of Big-Bang nucleosynthesis, whose file opened but could not be read here; the papers behind the deuterium and lithium-7 measurements, which this page knows only through Burns’s review; and any source for the temperature that step 2 of Table 2 uses, which this page chose. No plain page from NASA, ESA or another official source was found that explains how the first nuclei formed
            without also giving the answers, so the two Berkeley Lab pages above are the nearest, listed after the run.
          </li>
        </ul>
      </div>
    </div>
  )
}
