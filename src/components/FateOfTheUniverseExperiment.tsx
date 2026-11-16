import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  FUTURE_GRAPH_MAX_YEARS,
  MAX_DARK_ENERGY_FRACTION,
  expansionRateAtSize,
  futureRelativeSize,
  ruleOfSeventy,
  runFateOfTheUniverseExperiment,
  steadyDoublingEstimate,
  galaxySpeedKmPerS,
} from '../physics/fateOfTheUniverseExperiment'
import type { FarFutureGuess, NextDoublingGuess } from '../physics/fateOfTheUniverseExperiment'
import { FateOfTheUniverseResults } from './FateOfTheUniverseResults'
import { FateOfTheUniverseTutor } from './FateOfTheUniverseTutor'
import { CosmologySynthesis } from './CosmologySynthesis'
import {
  BarsCaption,
  DoublingBars,
  GalaxyStrip,
  GraphCaption,
  REAL_COLOR,
  SizeGraph,
  StripCaption,
  YOUR_COLOR,
  YourBarsCaption,
  YourGraphCaption,
  formatSize,
  nextDoublingYearsAt,
} from './FateOfTheUniversePictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'
import { universeAgeYears } from '../physics/universeAgeExperiment'

// Cosmology, Experiment 10, audited to the newer rules (docs/audit/cosmology/10-draft-wording.md, approved by the owner on 2026-11-16).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a real
// picture or table; they are drawn in white once their feature is drawn (§14, "Predictions and the Real Results").

interface FateOfTheUniverseExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type ShareMode = 'none' | 'weaker' | 'bestFit' | 'stronger' | 'custom'

const PRESET_SHARES: Record<Exclude<ShareMode, 'custom'>, number> = {
  none: 0,
  weaker: 0.3,
  bestFit: BEST_FIT_DARK_ENERGY_FRACTION,
  stronger: MAX_DARK_ENERGY_FRACTION,
}

// The two guess questions are kept exactly as the owner approved them (2026-10-09), both about the real (best-fit) universe.
const farFutureChoices: Array<{ value: FarFutureGuess; label: string }> = [
  { value: 'stops', label: 'The expansion slows down and stops' },
  { value: 'slower', label: 'The expansion keeps going, but ever more slowly' },
  { value: 'faster', label: 'The expansion keeps speeding up and never stops' },
]
const nextDoublingChoices: Array<{ value: NextDoublingGuess; label: string }> = [
  { value: 'shorter', label: 'Shorter, about 5 billion years' },
  { value: 'same', label: 'About the same, about 11 billion years' },
  { value: 'longer', label: 'Much longer, about 30 billion years' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

// Fixed real-world playback duration (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 10000
const DEFAULT_SHARE_MODE: ShareMode = 'weaker'
const DEFAULT_CUSTOM_SHARE = 0.5

const billions = (years: number, digits = 1) => (years / 1e9).toFixed(digits)
const WORDS_FOR_NUMBERS: Record<number, string> = { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' }

// ---- the introduction (the owner's approved wording, 2026-11-16; no answers given: §12) ----
function Intro() {
  const p = { marginTop: 0, marginBottom: '0.75rem' } as const
  const list = { marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' } as const
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={p}>
        <strong>The question.</strong> Since Cosmology 1 and 2 you have known that the universe is expanding: faraway galaxies are moving apart. In Cosmology 5 you met dark energy, which changes how that expansion behaves, and in Cosmology 6 you used it to work out the universe&rsquo;s age. All of that looked at the past and the present. So what happens next? Does the expansion ever stop? Does it slow down, or turn around, or does it go on forever?
      </p>
      <p style={p}>
        <strong>What happens.</strong> Every earlier experiment in this chapter looked at the universe as it was, or as it is today: how it began, how fast it is stretching, what it is made of, how old it is. This one looks the other way, at what happens <em>next</em>. That is a bigger question than it first sounds. In the model you will use, the universe is {billions(universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION))} billion years old today, and the graph you will see runs {billions(FUTURE_GRAPH_MAX_YEARS, 0)} billion years into the future: more than {WORDS_FOR_NUMBERS[Math.floor(FUTURE_GRAPH_MAX_YEARS / universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION))]} times as long as everything that has happened since the Big Bang. So we are asking about a future far longer than the whole past.
      </p>
      <p style={p}>
        Nobody can watch that future. What astronomers do instead is what a weather forecaster does: take what is known today and the rules that have worked so far, and run them forward. A forecast is only as good as its ingredients, and here there are just a few: how fast space is stretching today, how much of the universe&rsquo;s energy is matter (whose gravity pulls everything together), and how much is dark energy (which works in a different way, as you saw in Cosmology 5). Run the same rules forward with different amounts of each, and you get different futures. This experiment lets you see how different they can be.
      </p>
      <p style={p}>
        It is also a real test, not just a story. A model that gets the past right ought to say something sensible about what comes next, and where it cannot, because the answer depends on something nobody knows yet, that shows what is still missing. One of the model&rsquo;s key assumptions is being tested by new measurements right now (see &ldquo;As of November 2026&rdquo; below), so the answer you will see is what the model gives, not a settled fact about the real future.
      </p>
      <p style={p}>
        <strong>Your guesses.</strong> First you will look at the real universe. You will make two guesses about its future. Then you press <strong>Run</strong>, and the experiment takes the simple model you used in Cosmology 5 and 6 and runs it forward in time, from today to 100 billion years from now. Two pictures draw themselves: a <strong>graph</strong> of how big the universe becomes compared with today, and four <strong>bars</strong> showing how long the universe takes to double in size, once, twice, three times and four times. Your guesses are drawn on them in white. Then, in <strong>Part 2</strong>, you choose how much of the universe&rsquo;s energy is dark energy, and watch your own universe grow in the same two pictures, plus a drawing of galaxies spreading apart. You can try as many choices as you like and compare.
      </p>
      <p style={p}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables. They are drawn on the real graph and the real bars in <strong>white</strong>, in a box labelled YOUR GUESS, after the run, and shown again beside the results. The dark energy share you choose in Part 2 does change Pictures 3 to 5 and the pink column of the results table, but never the real pictures in Part 1. If you change a guess, press Run and see nothing change, that is not a fault: a guess is only a guess.
      </p>
      <p style={p}>
        <strong>Step 1: the size of the universe.</strong> The universe&rsquo;s <strong>size</strong> here means the distances between faraway galaxies, compared with what they are today (as in Cosmology 6). Today is 1×, and 2× means every such distance has doubled. For example, two galaxies that are 100 million light-years apart today would be 200 million light-years apart when the universe is 2× its size today. It is not the size of any one object: your own body, the Earth and our galaxy do not grow.
      </p>
      <p style={p}>
        <strong>Step 2: the doubling time.</strong> The <strong>doubling time</strong> is how long the universe takes to double in size. If it doubles in 10 billion years, then in 10 billion years every distance between faraway galaxies will be twice what it is today, and 10 billion years after that, four times. Comparing doubling times is a fair way to compare growth, because doubling from 1× to 2× and doubling from 100× to 200× are the same kind of step, even though the second adds far more distance.
      </p>
      <p style={p}>
        <strong>Step 3: the expansion rate.</strong> The <strong>expansion rate</strong> is how fast distances are growing, for each unit of distance. It is the number from Hubble&rsquo;s Law (Cosmology 1): at 70 kilometers per second per <strong>megaparsec</strong> (a megaparsec is about 3.3 million light-years), a galaxy one megaparsec away moves away from us at 70 kilometers per second, and one 100 megaparsecs away at 70 × 100 = 7,000 kilometers per second. The word &ldquo;constant&rdquo; in &ldquo;Hubble constant&rdquo; means the same everywhere in space at one moment. It does not mean the same for all time: in this experiment the expansion rate can change as the universe ages.
      </p>
      <p style={p}>
        <strong>Step 4: what sets the rate.</strong> What sets the expansion rate is what the universe contains. The matter and the dark energy each add a part to it. We call each one&rsquo;s part its <strong>contribution</strong>. The two contributions add up to 1 today. For the real universe, matter&rsquo;s is 0.30 and dark energy&rsquo;s is 0.70 (rounded; Planck&rsquo;s 2018 measurement of the matter share is 0.315 ± 0.007). You will see how the two contributions change as the universe grows.
      </p>
      <p style={p}>
        <strong>Step 5: what &ldquo;flat&rdquo; means here.</strong> When we say the universe is <strong>flat</strong>, we mean the shape of space itself, averaged over very large distances. In flat space, the geometry you learned at school works: two straight lines that start out parallel stay parallel forever, and the angles of a triangle add up to 180°. Space could instead be curved on the largest scales, like the sphere in Curved Spacetime where two travelers who set out side by side met at the pole. This is a different idea from the curved spacetime around a star, which bends the paths of things passing close by. &ldquo;Flat&rdquo; here is only about the overall shape of space once you zoom out so far that galaxies blur into a smooth background. A comparison: the Earth is curved, but a tabletop is flat for everyday purposes, because you are looking at a tiny piece of it.
      </p>
      <p style={p}>
        Measurements of the oldest light (Cosmology 3), combined with other measurements, are consistent with a flat universe: Planck&rsquo;s 2018 results give the curvature&rsquo;s contribution as 0.001 ± 0.002 (with BAO, a map of galaxies used with it). This experiment assumes space is exactly flat. That has a simple consequence: the contributions of matter and dark energy add up to exactly 1, with no third contribution from curvature.
      </p>
      <p style={p}>
        <strong>Step 6: why ask this at all.</strong> So far, this chapter has described the universe as it was, or as it is. This is the first time we use the model to ask where the universe is heading. That is also a test of how well we understand it: a model that gets the past right should be able to say what comes next, and the places where it cannot, because the answer depends on something we do not know, show what is still missing. You will see that the future depends on one thing above all: how much dark energy there is.
      </p>
      <p style={p}>
        <strong>Your job.</strong> First, make two guesses about the real universe. Then press Run. Afterwards, in Part 2, choose a dark energy share of your own and compare.
      </p>
      <p style={p}>
        <strong>What to look for.</strong> <strong>Look at:</strong> the bars, from one doubling to the next, and the gold line against the blue dashed line. <strong>What it means:</strong> the bars show how long each doubling takes, and the blue dashed line is the same universe with no dark energy at all. <strong>Why it matters:</strong> how the bars change (or do not) is the whole question. In Part 2, look at what happens to the bars and the line when you change the dark energy.
      </p>
      <p style={p}>
        <strong>How this page is laid out.</strong> Below this introduction the page has four parts. <strong>Part 1</strong> is where you guess and watch the real universe. <strong>Part 2</strong> is where you try your own dark energy share. <strong>Part 3</strong> shows the results and what they mean. <strong>Part 4</strong> is the tutor. Parts 2, 3 and 4 appear when your first run has finished. Below Part 4 comes the chapter&rsquo;s closing section, &ldquo;Putting It All Together&rdquo;.
      </p>
      <p style={{ ...p, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={list}>
        <li>
          The same simple universe as Cosmology 5, 6, 8 and 9: &ldquo;flat&rdquo; (explained above), containing matter and dark energy, with an illustrative Hubble constant of 70 kilometers per second per megaparsec, with the same real caveat: published values differ by how they are measured (about 70 to 76 from space telescopes and about 67 to 68 from the oldest light, NASA 2025), the &ldquo;Hubble tension&rdquo;. Light and other very fast particles are left out. They mattered only in the very early universe, so they make no practical difference to the future.
        </li>
        <li>
          <strong>The dark energy is assumed to be a constant that never changes.</strong> That is the simplest possibility, and many measurements fit it. But it is being tested: in 2025 results from the DESI survey, combined with the oldest light, favoured a dark energy that changes over time, and in 2026 other results were mixed (see &ldquo;As of November 2026&rdquo; below). Nobody yet knows what dark energy is, and if it changed with time, the future could be very different. This is the biggest uncertainty in this experiment.
        </li>
        <li>The universe is assumed to be exactly flat, as in the earlier experiments, and not worked out here. A universe that was not flat would add a third contribution to the expansion, and could behave differently in the far future. This experiment does not cover that.</li>
        <li>Only the expansion is modeled. The experiment says how the size of the universe changes. It does not say anything about stars running out of fuel, black holes, or the universe becoming cold and dark, though many people think of those as &ldquo;the end of the universe.&rdquo;</li>
        <li>
          Things held together by their own gravity do not expand: a galaxy, our Milky Way and its neighbors, the Solar System, you. Only the space between such groups stretches. This is stated here, not modeled. (No plain official page was found that says it, so the page gives it as the model&rsquo;s own assumption.)
        </li>
        <li>
          Every universe you try is matched to the real one today: the same expansion rate and the same size. A universe with no dark energy would then be younger today ({billions(universeAgeYears(0))} billion years) than one with dark energy ({billions(universeAgeYears(BEST_FIT_DARK_ENERGY_FRACTION))} billion years), as in Cosmology 6.
        </li>
      </ul>
      <p style={{ ...p, marginBottom: '0.75rem' }}>
        <strong>Some new words:</strong> size (of the universe), doubling time, expansion rate, contribution, megaparsec, flat, Hubble tension. All are in the Words and formulas box below.
      </p>
      <p style={p}>
        <strong>One more thing.</strong> This is the last experiment in this chapter. Once you have reached the tutor&rsquo;s explanation, scroll down to &ldquo;Putting It All Together&rdquo;. It steps back and shows how all ten experiments fit into one story, and which parts of that story are still open.
      </p>
      <p style={{ ...p, marginBottom: 0 }}>
        <strong>As of November 2026.</strong> Dark energy is assumed constant here, but astronomers are testing that. In March 2025 the DESI collaboration reported that its first three years of data, combined with measurements of the oldest light, favoured a dark energy that changes over time, at a strength of 3.1σ (σ, &ldquo;sigma&rdquo;, is a measure of how strong a statistical hint is: the larger, the stronger). In January 2026 the Dark Energy Survey reported that its data also fit an evolving dark energy &ldquo;but no better than they fit the standard model&rdquo;. On 30 July 2026 DESI&rsquo;s new Lyman-alpha measurements agreed with the standard model, which &ldquo;could indicate that the current hints of evolving dark energy may fade away&rdquo;; the collaboration also notes that a more complex model may be needed. As of November 2026 the question is still open.
      </p>
    </div>
  )
}

// ---- the words box (the formulas that give guess 2 away appear only after the first run: §12) ----
function referenceEntries(afterRun: boolean) {
  const real = runFateOfTheUniverseExperiment(BEST_FIT_DARK_ENERGY_FRACTION)
  const rule = ruleOfSeventy(BEST_FIT_DARK_ENERGY_FRACTION)
  const steady = steadyDoublingEstimate(BEST_FIT_DARK_ENERGY_FRACTION, 50e9)
  const entries = [
    { term: 'Size (of the universe)', meaning: 'the distances between faraway galaxies, compared with today. 1× is today, 2× means every such distance has doubled. It is not the size of any one object.' },
    { term: 'Doubling time', meaning: 'how long the universe takes to double in size. If it is 10 billion years, then two galaxies 100 million light-years apart today are 200 million apart 10 billion years from now.' },
    { term: 'Expansion rate', meaning: 'how fast distances are growing, for each unit of distance, in kilometers per second per megaparsec. 70 means a galaxy 1 megaparsec away moves away at 70 km/s.' },
    { term: 'Hubble constant and Hubble tension', meaning: '70 km/s per megaparsec in this model; published values differ by how they are measured (about 70 to 76 from space telescopes and about 67 to 68 from the oldest light, NASA 2025): the “Hubble tension”.' },
    { term: 'Megaparsec', meaning: 'a unit of distance: about 3.3 million light-years.' },
    { term: 'Contribution (matter’s, dark energy’s)', meaning: 'the part each adds to the expansion rate. Today they add up to 1 (0.30 and 0.70 for the real universe).' },
    { term: 'Flat', meaning: 'space on the very largest scales is not curved, so straight parallel paths stay parallel. Planck 2018 is consistent with flat (0.001 ± 0.002).' },
    { term: 'Dark energy', meaning: 'the cause of the speeding up of the expansion (Cosmology 5). In this model it is a constant that never changes.' },
    { term: 'Matter', meaning: 'the stars, planets and us, and dark matter (Cosmology 4). Its density thins out as the universe grows.' },
    { term: 'Radiation (left out)', meaning: 'the light and other very fast particles of the early universe. The model leaves it out; it makes no practical difference to the future.' },
    { term: 'Speeding up', meaning: 'the speed at which faraway galaxies move apart gets larger and larger. This is not the same as the expansion rate rising: the rate can fall while the speeds still grow.' },
    { term: 'Settle', meaning: 'a number that stops changing much, such as the doubling time with dark energy or the expansion rate at late times.' },
    { term: 'Big Crunch and Big Rip', meaning: 'two other endings: a collapse back together, and a runaway stretching that tears even galaxies apart. This model cannot say anything about them.' },
    { term: 'Escape speed', meaning: 'the speed a thrown ball needs to climb away from a planet for ever without falling back (the Gravity chapter).' },
    { term: 'DESI and the Dark Energy Survey', meaning: 'two projects that map galaxies and supernovae to test whether dark energy changes.' },
    { term: 'σ (sigma)', meaning: 'a measure of how strong a statistical hint is: the larger, the stronger.' },
    { term: 'The oldest light', meaning: 'the cosmic microwave background (Cosmology 3).' },
    { term: 'Formula: a galaxy’s speed', meaning: `the expansion rate × its distance. For a galaxy 100 megaparsecs away today: ${real.expansionRateToday.toFixed(0)} × 100 = ${galaxySpeedKmPerS(100, 1, BEST_FIT_DARK_ENERGY_FRACTION).toLocaleString('en-US')} km/s.` },
    { term: 'Formula: the expansion rate', meaning: `today’s rate × √(matter’s contribution + dark energy’s contribution). Today: ${real.expansionRateToday.toFixed(0)} × √1.00 = ${real.expansionRateToday.toFixed(0)}.` },
  ]
  if (afterRun) {
    entries.push(
      { term: 'Formula: size after a time, if the size doubles every T years', meaning: `2^(time ÷ T). With T = ${billions(real.longTermDoublingTimeYears)}: 2^(50 ÷ ${billions(real.longTermDoublingTimeYears)}) ≈ ${steady.estimate.toFixed(0)}, about ${steady.gapPercent.toFixed(0)}% below the model’s ${steady.modelSize.toFixed(1)} (the early doublings are shorter).` },
      { term: 'Formula: the settled doubling time', meaning: `ln 2 ÷ (today’s rate × √(dark energy’s share)), in time units. For 70%: about ${billions(real.longTermDoublingTimeYears)} billion years.` },
      { term: 'Formula: the rule of thumb', meaning: `doubling time ≈ 70 ÷ the percent growth per billion years. With about ${rule.percentGrowthPerBillionYears.toFixed(1)} percent: 70 ÷ ${rule.percentGrowthPerBillionYears.toFixed(1)} ≈ ${billions(rule.doublingTimeYears)} billion years.` },
      { term: 'Formula: the size when the speed-up starts', meaning: `((1 − share) ÷ (2 × share))^(1/3). For 70%: ${real.speedUpSize.toFixed(3)}.` },
    )
  } else {
    entries.push({ term: 'More words', meaning: 'four more formulas appear here after your first run, because they give the size of the doublings, which is what you are about to guess.' })
  }
  return entries
}

// ---- links (read on 2026-11-16 through a helper's fetch tool, which returns model summaries; see the draft's source table). The pages that say
// the expansion speeds up, and what the alternatives are, appear after the first Run (§12), because they say what the tutor asks about. ----
const LINKS_BEFORE: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://arxiv.org/abs/1807.06209',
    label: 'Planck 2018 results VI: cosmological parameters (arXiv:1807.06209)',
    what: 'the paper behind the matter share (0.315 ± 0.007), the curvature (0.001 ± 0.002) and the Hubble constant (67.4 ± 0.5). A technical paper; the abstract is the readable part. (Abstract read through an HTML copy.)',
  },
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/',
    label: 'NASA: the Hubble constant and the tension (updated 4 August 2025)',
    what: 'NASA’s plain page: about 70 to 76 from space telescopes and about 67 to 68 from the oldest light. (Read.)',
  },
  {
    href: 'https://imagine.gsfc.nasa.gov/observatories/satellite/wmap/shape.html',
    label: 'NASA: The Shape of the Universe',
    what: 'the page behind the word “flat”. (Read for Cosmology 8; to be re-read.)',
  },
  {
    href: 'https://www.desi.lbl.gov/2025/03/19/more-than-a-hint-of-evolving-dark-energy-new-results-and-data-from-desi/',
    label: 'DESI collaboration: DR2 results, March 2025',
    what: 'the collaboration’s page on the first three years of data: “strengthen hints that dark energy is evolving”. (Read.)',
  },
  {
    href: 'https://arxiv.org/abs/2503.14738',
    label: 'DESI Data Release 2 results, paper II (arXiv:2503.14738)',
    what: 'the paper behind the 3.1σ figure. A technical paper; the abstract is the readable part. (Read.)',
  },
  {
    href: 'https://www.desi.lbl.gov/2026/07/30/new-desi-dr2-lyman-alpha-results-shed-light-on-dark-energy/',
    label: 'DESI collaboration: new Lyman-alpha results, 30 July 2026',
    what: 'the newest official page found: the new measurements “agree with the standard model”. (Read.)',
  },
  {
    href: 'https://www.ifae.es/news/2026/01/22/dark-energy-survey-scientists-release-new-analysis-of-how-the-universe-expands/',
    label: 'Dark Energy Survey final analysis, via IFAE, 22 January 2026',
    what: 'the Dark Energy Survey’s final supernova and galaxy-map analysis: its data fit the evolving model “but no better than they fit the standard model”. (Read.)',
  },
]
const LINKS_AFTER: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://science.nasa.gov/dark-energy/',
    label: 'NASA: Dark Energy (updated 12 August 2026)',
    what: 'NASA’s current page: “Nine billion years after the universe began, its expansion started to speed up”. (Read.)',
  },
  {
    href: 'https://science.nasa.gov/missions/hubble/dark-energy-changes-the-universe',
    label: 'NASA Hubble: Dark energy changes the universe (updated 17 April 2023)',
    what: 'the speed-up “about 7.5 billion years ago”, and what a “big rip” or a “big crunch” would be, if dark energy were not constant. (Read.)',
  },
  {
    href: 'https://science.nasa.gov/universe/overview/',
    label: 'NASA: Cosmic History (updated 12 August 2026)',
    what: '“it’s likely the universe will continue to expand forever”. (Read.)',
  },
  {
    href: 'https://science.nasa.gov/missions/hubble/hubble-finds-evidence-for-dark-energy-in-the-young-universe/',
    label: 'NASA Hubble: Hubble finds evidence for dark energy in the young universe (16 November 2006)',
    what: 'the older figure: the expansion “began speeding up about five to six billion years ago”. (Read.)',
  },
]

function ChoiceButtons<T extends string>({ options, selected, disabled, onSelect }: { options: Array<{ value: T; label: string }>; selected: T | null; disabled: boolean; onSelect: (value: T) => void }) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {options.map((choice) => (
        <button
          key={choice.value}
          type="button"
          onClick={() => onSelect(choice.value)}
          disabled={disabled}
          className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
          style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '0.875rem', opacity: disabled ? 0.6 : 1 }}
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
}

function Question({ prompt, guessText, children }: { prompt: string; guessText: string | null; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      {children}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{guessText ? `Your guess: ${guessText}` : 'Choose an option to continue'}</p>
    </div>
  )
}

export function FateOfTheUniverseExperiment({ onComplete, onTutorComplete }: FateOfTheUniverseExperimentProps) {
  const [farFutureGuess, setFarFutureGuess] = useState<FarFutureGuess | null>(null)
  const [nextDoublingGuess, setNextDoublingGuess] = useState<NextDoublingGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ farFuture: FarFutureGuess; nextDoubling: NextDoublingGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  const [part1Running, setPart1Running] = useState(false)
  const [part1Progress, setPart1Progress] = useState(0)
  const [explained, setExplained] = useState(false)

  // Part 2's setting. The default is the 30% case: the real universe is already in Part 1, and 30% shows a speed-up still to come.
  const [mode, setMode] = useState<ShareMode>(DEFAULT_SHARE_MODE)
  const [customShare, setCustomShare] = useState(DEFAULT_CUSTOM_SHARE)
  // Part 2's pictures are drawn when its own Run is pressed; at rest they show the whole picture.
  const [part2Running, setPart2Running] = useState(false)
  const [part2Progress, setPart2Progress] = useState(1)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const hasAllGuesses = farFutureGuess !== null && nextDoublingGuess !== null
  const locked = submitted !== null
  const shownFarFuture = submitted?.farFuture ?? farFutureGuess
  const shownNextDoubling = submitted?.nextDoubling ?? nextDoublingGuess
  const share = mode === 'custom' ? customShare : PRESET_SHARES[mode]
  const L = BEST_FIT_DARK_ENERGY_FRACTION

  // Part 1's animation: one run, a fixed real duration (CLAUDE.md §11).
  useEffect(() => {
    if (!part1Running) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setPart1Progress(p)
      if (p >= 1) {
        setPart1Running(false)
        setPart1Done(true)
        onCompleteRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [part1Running])

  // Part 2's animation: the learner's universe from today to 100 billion years from now, over the same fixed duration.
  useEffect(() => {
    if (!part2Running) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setPart2Progress(p)
      if (p >= 1) {
        setPart2Running(false)
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [part2Running])

  const handleRun = () => {
    if (!hasAllGuesses || part1Running || part1Done) return
    if (!submitted) setSubmitted({ farFuture: farFutureGuess!, nextDoubling: nextDoublingGuess! })
    setPart1Progress(0)
    setPart1Running(true)
  }

  // Changing the share changes only Part 2's drawings: it never hides Parts 3 and 4 or restarts the tutor.
  const settle = () => {
    if (!part2Running) setPart2Progress(1)
  }
  const handleModeChange = (next: ShareMode) => {
    setMode(next)
    settle()
  }
  const handlePart2Run = () => {
    if (part2Running) return
    setPart2Progress(0)
    setPart2Running(true)
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    setFarFutureGuess(null)
    setNextDoublingGuess(null)
    setSubmitted(null)
    setPart1Done(false)
    setPart1Running(false)
    setPart1Progress(0)
    setExplained(false)
    setMode(DEFAULT_SHARE_MODE)
    setCustomShare(DEFAULT_CUSTOM_SHARE)
    setPart2Running(false)
    setPart2Progress(1)
  }

  const hasAnythingToClear = farFutureGuess !== null || nextDoublingGuess !== null || locked || part1Done
  const startOverDisabled = !hasAnythingToClear || part1Running

  const started = part1Running || part1Done
  const shownProgress1 = part1Done ? 1 : part1Progress
  const yearsFromNow1 = shownProgress1 * FUTURE_GRAPH_MAX_YEARS
  const size1 = futureRelativeSize(yearsFromNow1, L)
  const yearsFromNow2 = part2Progress * FUTURE_GRAPH_MAX_YEARS
  const size2 = futureRelativeSize(yearsFromNow2, share)
  const pct = Math.round(share * 100)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 10: The Fate of the Universe: Does the Expansion Ever Stop?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 16 November 2026 through a helper&rsquo;s fetch tool, which returns summaries, so a quotation or figure on this page should be checked against the live page. No plain official page was found for flatness, for galaxies not expanding or for how strong a hint must be to count as a discovery, so this page gives the first two as the model&rsquo;s own assumptions and does not discuss the third. The savings-account, ball and bath comparisons have no source.
          </p>
          <ul style={listStyle}>
            {LINKS_BEFORE.map((l) => (
              <li key={l.href} style={{ marginBottom: '0.5rem' }}>
                <ExternalLink href={l.href}>{l.label}</ExternalLink>: {l.what}
              </li>
            ))}
          </ul>
          {part1Done ? (
            <>
              <p style={{ ...smallNote, marginBottom: '0.25rem' }}>Four more links, now that you have run it:</p>
              <ul style={listStyle}>
                {LINKS_AFTER.map((l) => (
                  <li key={l.href} style={{ marginBottom: '0.5rem' }}>
                    <ExternalLink href={l.href}>{l.label}</ExternalLink>: {l.what}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p style={smallNote}>Four more links, on the speed-up and the far future, appear here after your first Run, because their wording would give away what you are asked about.</p>
          )}
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make two guesses about the <strong>real</strong> universe: the best fit to the measurements, in which about 70 percent of the energy is dark energy. Then you will press Run and watch two pictures draw themselves: a graph of how big the universe becomes, and four bars showing how long each doubling of its size takes. Your guesses are drawn on them in white. Nothing you guess changes the real pictures.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>Both guesses are about the real universe, whatever you try later in Part 2.</p>
          <Question prompt="The universe is expanding today. What do you think the far future looks like?" guessText={optionText(farFutureChoices, shownFarFuture)}>
            <ChoiceButtons options={farFutureChoices} selected={shownFarFuture} disabled={locked || part1Running} onSelect={setFarFutureGuess} />
          </Question>
          <Question prompt="Suppose the universe takes about 11 billion years to double in size from today. How long will the next doubling take, from twice today's size to four times?" guessText={optionText(nextDoublingChoices, shownNextDoubling)}>
            <ChoiceButtons options={nextDoublingChoices} selected={shownNextDoubling} disabled={locked || part1Running} onSelect={setNextDoublingGuess} />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your guesses are locked while you try other settings. To change them, press Start over. Start over clears your guesses, the runs, the results and the tutor.
            </p>
          )}
        </div>

        <button type="button" className="action-button" onClick={handleRun} disabled={!hasAllGuesses || part1Running || part1Done} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          {part1Running ? 'Running...' : part1Done ? 'Run (done)' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{ marginLeft: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: startOverDisabled ? 'not-allowed' : 'pointer', opacity: startOverDisabled ? 0.5 : 1 }}
        >
          Start over
        </button>
        {!hasAllGuesses && !locked && <p style={smallNote}>Answer both questions above to run.</p>}

        {started && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.8125rem' }}>
            Real universe (about 70% dark energy) &nbsp;|&nbsp; Years from now: <strong>{billions(yearsFromNow1)} billion</strong> &nbsp;|&nbsp; Size: <strong>{formatSize(size1)}×</strong> today&rsquo;s
            <br />
            Expansion rate: {expansionRateAtSize(size1, L).toFixed(1)} km/s per megaparsec &nbsp;|&nbsp; Time for the next doubling: <strong>{billions(nextDoublingYearsAt(shownProgress1, L))} billion years</strong>
          </p>
        )}

        {started && (
          <Block>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 1: the graph, how big the universe gets (the real universe)</p>
            <SizeGraph share={L} progress={shownProgress1} color={REAL_COLOR} legend="The real universe (about 70% dark energy)" finished={part1Done} guess={part1Done && submitted ? submitted.farFuture : null} />
            <GraphCaption arrived={part1Done} />
          </Block>
        )}
        {started && (
          <Block>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 2: the bars, how long each doubling takes (the real universe)</p>
            <DoublingBars share={L} progress={shownProgress1} color={REAL_COLOR} staged guess={submitted ? submitted.nextDoubling : null} />
            <BarsCaption arrived={part1Done} />
          </Block>
        )}
        {part1Done && (
          <Block>
            <WhereFrom>
              <strong>Calculated here:</strong> both lines, all four bars, the green dot and the dashed marker, and every number, for a flat universe with a constant dark energy and a Hubble constant of 70, without radiation (the model of Cosmology 5, 6 and 8, run forward). Today&rsquo;s split of matter 0.30 and dark energy 0.70 is this page&rsquo;s own rounded best-fit value; Planck 2018 gives 0.315 ± 0.007 for matter (see Table 1). <strong>Assumed, not known:</strong> that dark energy is a constant that never changes. <strong>An axis choice, not an event:</strong> the graph stops at 100 billion years because that is the range of its axis, not because anything is predicted to happen then. <strong>Your guess:</strong> the white marks only. Nothing on this page is imagined.
            </WhereFrom>
          </Block>
        )}
        {!started && <p style={smallNote}>After you press Run, the two pictures draw themselves, each with a caption. When the run ends your white guess marks and a &ldquo;Where the real picture comes from&rdquo; note appear, and so do Parts 2, 3 and 4.</p>}
        {started && !part1Done && <p style={smallNote}>The white curve, the white bar and Parts 2, 3 and 4 appear as the run goes on and when it ends.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose how much of the universe&rsquo;s energy is dark energy and watch your own universe grow. Press Run to see its graph, its four doubling bars and a drawing of galaxies spreading apart. Your guesses do not change anything in this part; your choice does.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Share of the universe&rsquo;s energy that is dark energy:</p>
              {(
                [
                  ['none', 'None (0%)'],
                  ['weaker', 'Weaker (30%)'],
                  ['bestFit', `The best fit to observations (about ${Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)}%)`],
                  ['stronger', `Stronger (${Math.round(MAX_DARK_ENERGY_FRACTION * 100)}%)`],
                  ['custom', 'Custom'],
                ] as Array<[ShareMode, string]>
              ).map(([value, label]) => (
                <button key={value} type="button" onClick={() => handleModeChange(value)} className={`toggle-button${mode === value ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                  {label}
                </button>
              ))}
              {mode === 'custom' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="fate-share" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Dark energy: {Math.round(customShare * 100)}% of the total (matter makes up the other {100 - Math.round(customShare * 100)}%)
                  </label>
                  <input
                    id="fate-share"
                    type="range"
                    min={0}
                    max={MAX_DARK_ENERGY_FRACTION}
                    step={0.01}
                    value={customShare}
                    onChange={(event) => {
                      setCustomShare(Number(event.target.value))
                      settle()
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              <p style={{ ...smallNote, marginTop: '0.5rem' }}>
                Dark energy at 0% has no push at all, so only matter&rsquo;s pull slows the expansion. At 30% the expansion is still slowing down today, and a speed-up comes later. These are <strong>trial values</strong>: they show what a universe with that much dark energy would do, and they do not say the real universe has that much.
              </p>
              <div style={{ marginTop: '0.75rem' }}>
                <button type="button" className="action-button" onClick={handlePart2Run} disabled={part2Running} style={{ padding: '0.5rem 1.5rem' }}>
                  {part2Running ? 'Running...' : 'Run: watch your universe grow'}
                </button>
              </div>
              <p style={smallNote}>
                Your guesses are locked while you try other settings. Your guesses do not change the drawings or tables, but this setting does: it changes Pictures 3 to 5 and the pink column in Part 3. While the share is on the real best fit (70%), your pink picture and the Part 1 picture are the same, so change the share to see something move.
              </p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', marginBottom: 0 }}>
                Dark energy share: <strong style={{ color: YOUR_COLOR }}>{pct}%</strong> &nbsp;|&nbsp; Years from now: <strong>{billions(yearsFromNow2)} billion</strong> &nbsp;|&nbsp; Size: <strong>{formatSize(size2)}×</strong> today&rsquo;s
                <br />
                Expansion rate: {expansionRateAtSize(size2, share).toFixed(1)} km/s per megaparsec &nbsp;|&nbsp; Time for the next doubling: <strong>{billions(nextDoublingYearsAt(part2Progress, share))} billion years</strong>
              </p>
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 3: your universe&rsquo;s graph</p>
              <SizeGraph share={share} progress={part2Progress} color={YOUR_COLOR} legend={`Your universe (${pct}% dark energy)`} finished={false} guess={null} />
              <YourGraphCaption share={share} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 4: your universe&rsquo;s bars</p>
              <DoublingBars share={share} progress={part2Progress} color={YOUR_COLOR} staged={false} guess={null} />
              <YourBarsCaption share={share} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 5: the galaxies, spreading apart (schematic)</p>
              <GalaxyStrip share={share} progress={part2Progress} />
              <StripCaption />
            </Block>
            <Block>
              <WhereFrom>
                <strong>Calculated here:</strong> every line, bar and number, from the model (as in Part 1). <strong>Your choice:</strong> the dark energy share (a trial value). <strong>An illustration, not to scale:</strong> the galaxy strip. Nothing here is imagined.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              These are the results of your first run, with what each table means. The numbers come from the physics and do not change with your guesses; only the pink column follows your choice in Part 2.
            </PartHeader>
            <FateOfTheUniverseResults guesses={submitted} share={share} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks you three questions about what you saw, then explains it and goes through your two guesses.
            </PartHeader>
            {submitted && (
              <FateOfTheUniverseTutor
                predictedFarFuture={submitted.farFuture}
                predictedNextDoubling={submitted.nextDoubling}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            )}
            {explained && <p style={{ ...smallNote, marginTop: '1rem' }}>You have reached the tutor&rsquo;s explanation. You can still try other settings in Part 2; the tutor does not restart.</p>}
          </>
        )}
      </div>

      {explained && <CosmologySynthesis />}
    </div>
  )
}

