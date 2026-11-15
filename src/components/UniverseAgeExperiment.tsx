import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  MAX_DARK_ENERGY_FRACTION,
  OLDEST_STARS_AGE_YEARS,
  PUBLISHED_NASA_HUBBLE_RANGES,
  darkEnergyExample,
  matterOnlyExample,
  runUniverseAgeExperiment,
  yourComparison,
} from '../physics/universeAgeExperiment'
import type { DarkEnergyGuess, MatterOnlyGuess } from '../physics/universeAgeExperiment'
import { UniverseAgeResults } from './UniverseAgeResults'
import { UniverseAgeTutor } from './UniverseAgeTutor'
import { AgeGraph, Part1GraphCaption, Part2Caption } from './UniverseAgePictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 6, audited to the newer rules (docs/audit/cosmology/06-draft-wording.md, approved by the owner on 2026-11-15).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a real
// picture or table; they are drawn in white once the run has finished (§14, "Predictions and the Real Results").

interface UniverseAgeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type ShareMode = 'none' | 'bestFit' | 'custom'

// One run is a fixed real duration, whatever the share (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 9000

// The two guess questions are kept exactly as the owner approved them on 2026-10-07 and again on 2026-11-15 ("as written").
const matterOnlyAgeChoices: Array<{ value: MatterOnlyGuess; label: string }> = [
  { value: 'longer', label: 'Longer' },
  { value: 'shorter', label: 'Shorter' },
  { value: 'same', label: 'The same' },
]
const darkEnergyAgeChoices: Array<{ value: DarkEnergyGuess; label: string }> = [
  { value: 'older', label: 'Older' },
  { value: 'younger', label: 'Younger' },
  { value: 'same', label: 'The same age' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

const BEST_PERCENT = Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)
const billions = (years: number) => (years / 1e9).toFixed(2)

// ---- the introduction (as the owner approved it, with the changes in the draft's section 1) ----
function Intro() {
  const p = { marginTop: 0, marginBottom: '0.75rem' } as const
  const hubble = matterOnlyExample().hubbleTimeYears
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={p}>
        <strong>The question.</strong> How old is the universe, and was the estimate from the Big Bang experiment (Cosmology 2) really right?
      </p>
      <p style={p}>
        <strong>What happens.</strong> In this experiment you find out how old the universe comes out when you use the whole history of its expansion. First you make two guesses. Then you press <strong>Run</strong>, and a graph is drawn that shows how big the universe has been at every moment since the <strong>Big Bang</strong>, in three versions: Cosmology 2&rsquo;s constant-speed picture, a universe with only matter, and the universe astronomers&rsquo; measurements point to (about {BEST_PERCENT} percent <strong>dark energy</strong>). Each line grows until it reaches &ldquo;today&rsquo;s size&rdquo;, and it stops at a dot. The place of that dot on the time axis is that version&rsquo;s <strong>age</strong>, written beside it. Your guesses are then drawn on the graph in white. After that, <strong>in Part 2</strong>, you choose a share of dark energy yourself and watch a fourth, amber line being drawn beside the other three, so you can see how the age changes. The results and a tutor follow.
      </p>
      <p style={p}>
        <strong>Where this comes from.</strong> In Cosmology 2 you ran the expansion backward at a constant speed and got the <strong>Hubble time</strong>, about 14 billion years, remarkably close to the real measured age of the universe, about 13.8 billion years. But that experiment also said the real expansion has not been at a constant speed, and Cosmology 5 (Dark Energy) showed it has slowed down and later sped up. This experiment puts these together to ask what age the real expansion history gives.
      </p>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>A new term: the universe&rsquo;s relative size.</strong> The graph below needs a way to say &ldquo;how big the universe was&rdquo; at some moment in the past. But we cannot give the universe one size in kilometres. We do not know whether it has an edge or goes on for ever, so there is nothing to measure it from end to end. Astronomers use a different idea, which is easy to picture:
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Look at the distances between faraway galaxies.</strong> As space stretches (Cosmology 1), these distances grow. So &ldquo;how much has the universe grown?&rdquo; can be asked as &ldquo;how much farther apart are galaxies now than they were then?&rdquo;
        </li>
        <li>
          <strong>Use today as the yardstick.</strong> We call today&rsquo;s distances <strong>1</strong>, in the way that 100 percent means &ldquo;the whole amount&rdquo;. The <strong>relative size</strong> at any other moment is the distances then, <em>compared with</em> the distances now.
        </li>
        <li>
          <strong>A worked example.</strong> Suppose two galaxies are 100 million light-years apart today. When the relative size was <strong>0.5</strong>, they were 0.5 × 100 = 50 million light-years apart: half as far. When it was <strong>0.25</strong>, they were 25 million light-years apart. A pair that is 400 million light-years apart today would have been 200 million apart at 0.5. In this model <strong>every</strong> pair of faraway galaxies changes by the same fraction, which is why one number is enough for the whole universe.
        </li>
        <li>
          <strong>A picture to hold on to.</strong> Take a photograph of the galaxies as they are today and print it on a photocopier at 50 percent. Every distance in the copy is half as long, and the pattern of galaxies is unchanged. The copy stands for the universe when its relative size was 0.5. At 100 percent you have today&rsquo;s picture (relative size 1). Shrink it again and again, and at relative size 0 every distance is zero: that is the Big Bang, which this page treats as the starting moment.
        </li>
        <li>
          <strong>What it does not mean.</strong> It is not a length in kilometres, it is not the size of any one object (a galaxy, a star or you do not grow as it does), and it says nothing about whether the universe has an edge. It is only a ratio, a &ldquo;how many times as far apart as today&rdquo;.
        </li>
        <li>
          <strong>How you will see it.</strong> The up-and-down axis of the graph is this number. A line that is at height 1 has reached today&rsquo;s size. A line at height 0.5 is at the moment when galaxies were half as far apart as now.
        </li>
      </ul>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>What &ldquo;older&rdquo; and &ldquo;younger&rdquo; mean here.</strong> You will be asked whether a universe would be &ldquo;older&rdquo; or &ldquo;younger&rdquo; than another. That can sound as if we were changing a real universe, so here is exactly what is meant:
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>There is only one real universe, with one real age, and nothing here changes it.</strong> Its <strong>age</strong> is how long it took to grow from the Big Bang (relative size 0) to the size it has today (relative size 1).
        </li>
        <li>
          <strong>So we compare possible universes, on paper.</strong> We cannot experiment on the real one, but we can ask a &ldquo;what if&rdquo; question and do the sums: <em>if a universe had contained these things, how long would that growth have taken?</em> Each possible universe gets one answer: a number of billions of years.
        </li>
        <li>
          <strong>What is kept the same.</strong> Every universe we compare starts at the Big Bang, ends at today&rsquo;s size, and is set up to have the <strong>same expansion speed today</strong>, because today&rsquo;s speed is the one thing we can measure. So the comparison is fair.
        </li>
        <li>
          <strong>What is different.</strong> Only what is inside: matter only, or matter plus some dark energy. Different contents mean a different story of how the expansion sped up or slowed down along the way, and so a different time to get from 0 to 1.
        </li>
        <li>
          <strong>Older means a longer time; younger means a shorter time.</strong> If one universe&rsquo;s sum gives 12 billion years and another&rsquo;s gives 10, we say the first is &ldquo;2 billion years older&rdquo;: its growth took 2 billion years longer. (These two numbers are only an example to show the words. They are not results.) A race is a good picture: two runners run the same 100 metres and finish at the same speed, but one runner&rsquo;s race lasted 14 seconds and the other&rsquo;s 12. The 14-second race is the &ldquo;older&rdquo; one, because it took longer to get from the start to the same finish line.
        </li>
        <li>
          <strong>On the graph,</strong> the age of each universe is where its line ends, at the dot. The farther right the dot, the longer the growth took, so the older the universe. A dot farther left means younger.
        </li>
        <li>
          <strong>Why bother?</strong> The real question is which contents give an age that fits what we observe.
        </li>
      </ul>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>A daily-life picture.</strong> The bathtub. Suppose you walk into a bathroom and find the tub full, with the tap still running. You want to know how long it has been filling.
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The quick way.</strong> The tub holds 200 litres and the tap is running at 10 litres a minute <em>right now</em>. Dividing, 200 ÷ 10 = <strong>20 minutes</strong>.
        </li>
        <li>
          <strong>When the quick way is right.</strong> Only if the flow was 10 litres a minute the whole time. If somebody turned the tap up or down while the tub was filling, the answer is no longer 20 minutes. It could be shorter or longer, depending on what the tap did, and today&rsquo;s flow alone cannot tell you. To get the answer you would need the flow at every moment: the tap&rsquo;s <em>whole history</em>.
        </li>
        <li>
          <strong>Each part of the picture is part of the universe.</strong> The tub being full is the universe at today&rsquo;s size (relative size 1); an empty tub is the Big Bang (relative size 0); the water level is the relative size. The tap&rsquo;s flow is how fast the universe is growing. &ldquo;How long has it been filling?&rdquo; is the <strong>age</strong>. The quick sum, level ÷ today&rsquo;s flow, is Cosmology 2&rsquo;s <strong>Hubble time</strong> (the constant-speed estimate). And the tap&rsquo;s whole history is the universe&rsquo;s <strong>expansion history</strong>, which is the new thing this experiment adds.
        </li>
        <li>
          <strong>Where the picture stops.</strong> A tap is turned by a person. The universe&rsquo;s expansion is not: what the universe contains decides how its growth speeds up or slows down. The picture shows why today&rsquo;s speed alone is not enough. It does not tell you what the history was; that is what the graph is for.
        </li>
      </ul>
      <p style={p}>
        <strong>Your job.</strong> First, make two predictions about how a universe&rsquo;s age depends on how its expansion has changed. Then press Run, and afterwards pick a share of dark energy and run it.
      </p>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong> When the graph is drawn, these are the things to watch. Each one says what to look at, what it means and why it matters. (The numbers and what they show come later, in the caption under the graph and in the results.)
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Look at:</strong> the dot at the end of each line, and the number written beside it. <strong>What it means:</strong> the dot is the moment that version of the universe reaches today&rsquo;s size, so the number is its <strong>age</strong> in billions of years. The farther right the dot, the older that universe. <strong>Why it matters:</strong> the three ages are the answer to the question. Comparing them tells you what each kind of universe would give.
        </li>
        <li>
          <strong>Look at:</strong> how each line rises, steeply in some places and gently in others. <strong>What it means:</strong> a steep stretch is a time when the universe was growing fast; a gentle stretch is a time when it was growing slowly. <strong>Why it matters:</strong> the shape of a line is that version&rsquo;s expansion history, and the age comes from the whole shape, not from one point on it. That is the idea of the bathtub.
        </li>
        <li>
          <strong>Look at:</strong> your white guess marks, which appear when the run ends, beside the real dots. <strong>What it means:</strong> each mark shows which side of a real dot you guessed. <strong>Why it matters:</strong> you can compare your guess with the real graph at a glance. The tutor goes through each guess at the end.
        </li>
        <li>
          <strong>Look at:</strong> in Part 2, the amber dot as you change the share of dark energy. <strong>What it means:</strong> it is the age of a universe with the share you chose. <strong>Why it matters:</strong> by moving it you see how a universe&rsquo;s age depends on what it contains.
        </li>
      </ul>
      <p style={p}>
        We reuse <strong>dark energy</strong>, the <strong>Hubble time</strong> and the <strong>Big Bang</strong> from earlier experiments, with the same meaning.
      </p>
      <p style={p}>
        <strong>How this page is laid out.</strong> Below this introduction the page has four parts. <strong>Part 1</strong> is where you guess and watch. <strong>Part 2</strong> is where you try your own settings. <strong>Part 3</strong> shows the results and what they mean. <strong>Part 4</strong> is the tutor. Parts 2, 3 and 4 appear when your first run has finished.
      </p>
      <p style={p}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables. They are drawn on the real picture in <strong>white</strong>, in a box labelled YOUR GUESS, and shown again beside the results. The real pictures come from the physics. The share of dark energy you choose in Part 2 does change the amber line and the amber rows of the tables, but never the blue, purple or green ones.
      </p>
      <p style={{ ...p, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          The universe is the same simple model as in Cosmology 5: &ldquo;flat&rdquo;, containing only matter and a constant dark energy, with matter&rsquo;s share being 100% minus dark energy&rsquo;s share. Light and other radiation, which matters only very early on, are left out. For the age that is a good approximation, but still an approximation.
        </li>
        <li>
          The Hubble constant is the same illustrative value as in Cosmology 1 (70 km/s per megaparsec). Real measurements disagree a little, which is called the <strong>Hubble tension</strong>: as of November 2026, NASA says space-telescope measurements give around {PUBLISHED_NASA_HUBBLE_RANGES.spaceTelescopes.low} to {PUBLISHED_NASA_HUBBLE_RANGES.spaceTelescopes.high} and measurements from the cosmic microwave background about {PUBLISHED_NASA_HUBBLE_RANGES.microwaveBackground.low} to {PUBLISHED_NASA_HUBBLE_RANGES.microwaveBackground.high}. The real measured age (about 13.8 billion years) comes from the lower value and a slightly lower dark energy share, which the results will show.
        </li>
        <li>The Big Bang is treated as an idealized starting moment, when the relative size was 0. What happened at or before it, including cosmic inflation, is not modeled.</li>
        <li>Cosmology 2&rsquo;s constant-speed line is a simplified model shown for comparison, not a rival theory.</li>
        <li>
          The real measured age is a given value, not worked out here. The age of the oldest known star clusters is used only as a comparison marker: a 2023 study finds the oldest ones older than about {(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)} billion years, a figure that depends on the model the study used.
        </li>
        <li>
          The dark energy here is <strong>constant</strong> (it never changes). As of November 2026 some recent measurements hint that it may change with time; Cosmic Horizons has an experiment on that. This page does not try that idea.
        </li>
        <li>Nothing here claims to say what dark energy is.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> age of the universe, relative size, expansion history, flat universe, Hubble tension, star cluster. Each is in the &ldquo;Words and formulas&rdquo; box below. (The Hubble time is {billions(hubble)} billion years at 70 km/s per megaparsec.)
      </p>
    </div>
  )
}

// ---- the words box: the formulas' worked examples (they give the results) wait until after the first Run ----
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const matter = matterOnlyExample()
  const best = darkEnergyExample()
  const entries = [
    { term: 'Age of the universe', meaning: 'how long ago the Big Bang was: the time it took the universe to grow from nothing to its size today.' },
    { term: 'Big Bang', meaning: 'the idealized starting moment, when the relative size was 0 (Cosmology 2).' },
    { term: 'Hubble constant', meaning: 'how fast space stretches per megaparsec today: 70 km/s per Mpc here.' },
    { term: 'Hubble time', meaning: `1 ÷ the Hubble constant: the age the universe would have if it had always grown at today's speed. At 70 km/s per megaparsec it is ${billions(matter.hubbleTimeYears)} billion years (Cosmology 2).` },
    { term: 'Hubble tension', meaning: 'the small disagreement between two ways of measuring the Hubble constant: telescopes looking at nearby galaxies, and measurements of the cosmic microwave background.' },
    { term: 'Relative size', meaning: 'how many times as far apart faraway galaxies were, compared with today. Today is 1. If two galaxies are 100 million light-years apart today, then at relative size 0.5 they were 0.5 × 100 = 50 million light-years apart. Like a photocopy of today’s picture of the galaxies shrunk to 50 percent: every distance is halved and the pattern is unchanged. At 0 every distance is zero (the Big Bang). Not a length in kilometres, not the size of any object, and it says nothing about whether the universe has an edge.' },
    { term: 'Older and younger (in this experiment)', meaning: 'older means that the sum for a possible universe gives a longer time to grow from the Big Bang to today’s size; younger means a shorter time. Every universe compared has the same expansion speed today, and nothing changes the real universe. Like two runners running the same 100 metres: the race that lasted longer is the “older” one.' },
    { term: 'Expansion history', meaning: 'how fast space has been stretching at every moment since the Big Bang: slowing, speeding up, or steady.' },
    { term: 'Flat universe', meaning: 'a universe where space on the largest scales is not curved, so straight parallel paths stay parallel.' },
    { term: 'Matter', meaning: 'everything with mass: stars, gas, dust and dark matter. On this page, all of it together.' },
    { term: 'Dark energy', meaning: 'the name for whatever could make the expansion speed up (Cosmology 5). It is not the same as dark matter.' },
    { term: 'Radiation', meaning: 'light and other energy that travels at the speed of light. It mattered only very early on and is left out here.' },
    { term: 'Inflation', meaning: 'a very early, very fast stretching of space that some theories propose. Not modeled here.' },
    { term: 'Star cluster', meaning: 'a ball of hundreds of thousands of stars that formed together. The oldest are among the oldest things we can date, so the universe must be at least as old as they are.' },
    { term: 'Billion years', meaning: '1,000,000,000 years.' },
    { term: 'Formula: the Hubble time', meaning: `1 ÷ H0. At 70 km/s per megaparsec this is ${billions(matter.hubbleTimeYears)} billion years.` },
  ]
  if (afterRun) {
    entries.push({
      term: 'Formula: the age with no dark energy, with a worked example',
      meaning: `age = (2 ÷ 3) × the Hubble time = (2 ÷ 3) × ${billions(matter.hubbleTimeYears)} = ${billions(matter.ageYears)} billion years.`,
    })
    entries.push({
      term: 'Formula: the age with dark energy share L (flat universe), with a worked example',
      meaning: `age = Hubble time × (2 ÷ (3 × √L)) × asinh(√(L ÷ (1 − L))). At L = ${best.share}: √${best.share} = ${best.root.toFixed(3)}; 2 ÷ (3 × ${best.root.toFixed(3)}) = ${best.factor.toFixed(3)}; √(${best.share} ÷ ${(1 - best.share).toFixed(1)}) = ${best.argument.toFixed(3)}; asinh(${best.argument.toFixed(3)}) = ${best.asinhValue.toFixed(4)}; so ${billions(best.hubbleTimeYears)} × ${best.factor.toFixed(3)} × ${best.asinhValue.toFixed(4)} = ${billions(best.ageYears)} billion years. The page checks this closed form against a direct sum over many small steps.`,
    })
  } else {
    entries.push({ term: 'More words', meaning: 'the formulas for the age and their worked examples appear here after your first run, because the numbers in them would give away what you are about to guess.' })
  }
  return entries
}

// ---- links (pages read 2026-11-15 through helper summaries; see the draft's source table) ----
const LINKS: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://arxiv.org/abs/1807.06209',
    label: 'Planck Collaboration (2018): cosmological parameters',
    what: 'the paper behind the most precise measurements of the universe’s age (about 13.8 billion years), its expansion rate and its matter and dark energy shares. A technical paper; the table of parameters is the part to look for. (Abstract and Table 2 read; the age is in the table, not the abstract.)',
  },
  {
    href: 'https://science.nasa.gov/mission/wmap/wmap-overview/',
    label: 'NASA WMAP: mission overview',
    what: 'NASA’s page on the WMAP mission, which measured the universe’s age at about 13.77 billion years and its make-up (about 5, 25 and 70 percent). (Read; dated 16 April 2026. It does not explain how the age is worked out.)',
  },
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/',
    label: 'NASA: The Hubble constant and the tension',
    what: 'NASA’s plain page on why two ways of measuring the expansion rate disagree, and how that rate gives an age of about 13.8 billion years. (Read; dated 4 August 2025.)',
  },
  {
    href: 'https://sci.esa.int/web/hipparcos/-/37087-info-04-1997-esa-s-hipparcos-satellite-revises-the-scale-of-the-cosmos',
    label: 'ESA: Hipparcos revises the scale of the cosmos (1997)',
    what: 'ESA’s 1997 announcement that the Hipparcos satellite’s distances made the oldest stars younger than thought. Written as news of its time, so its numbers are old. (Read.)',
  },
  {
    href: 'https://arxiv.org/abs/astro-ph/9706128',
    label: 'Chaboyer and others (1997): the ages of globular clusters',
    what: 'a technical paper working out how the new Hipparcos distances lower the ages of the oldest star clusters. The abstract is the readable part. (Abstract read.)',
  },
  {
    href: 'https://arxiv.org/abs/2302.07899',
    label: 'Cimatti and Moresco (2023): the oldest stars as a clock',
    what: 'a recent paper that uses the oldest star clusters and stars to set a lower limit on the universe’s age (older than 13.3 billion years). A technical paper; the abstract is the readable part. (Abstract read; the journal page was read too.)',
  },
  {
    href: 'https://science.nasa.gov/universe/the-universe-is-expanding-faster-these-days-and-dark-energy-is-responsible-so-what-is-dark-energy',
    label: 'NASA: What is dark energy?',
    what: 'NASA’s plain explainer on dark energy, the ingredient that changes the age. The same page is linked from Cosmology 5. (Read for Cosmology 5; to be re-read before printing.)',
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

export function UniverseAgeExperiment({ onComplete, onTutorComplete }: UniverseAgeExperimentProps) {
  const [matterGuess, setMatterGuess] = useState<MatterOnlyGuess | null>(null)
  const [darkGuess, setDarkGuess] = useState<DarkEnergyGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ matter: MatterOnlyGuess; dark: DarkEnergyGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  const [part1Running, setPart1Running] = useState(false)
  const [part1Progress, setPart1Progress] = useState(0)
  const [explained, setExplained] = useState(false)

  const [mode, setMode] = useState<ShareMode>('bestFit')
  const [customShare, setCustomShare] = useState(0.4)
  // Part 2's amber line is drawn when its own Run is pressed; at rest it shows the whole line.
  const [part2Running, setPart2Running] = useState(false)
  const [part2Progress, setPart2Progress] = useState(1)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const hasAllGuesses = matterGuess !== null && darkGuess !== null
  const locked = submitted !== null
  const shownMatter = submitted?.matter ?? matterGuess
  const shownDark = submitted?.dark ?? darkGuess
  const share = mode === 'none' ? 0 : mode === 'bestFit' ? BEST_FIT_DARK_ENERGY_FRACTION : customShare

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

  // Part 2's animation: the amber line, over the same fixed duration.
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
    if (!submitted) setSubmitted({ matter: matterGuess!, dark: darkGuess! })
    setPart1Progress(0)
    setPart1Running(true)
  }

  // Changing the share changes only Part 2's drawing: it never hides Parts 3 and 4 or restarts the tutor.
  const handleModeChange = (next: ShareMode) => {
    setMode(next)
    if (!part2Running) setPart2Progress(1)
  }

  const handlePart2Run = () => {
    if (part2Running) return
    setPart2Progress(0)
    setPart2Running(true)
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    setMatterGuess(null)
    setDarkGuess(null)
    setSubmitted(null)
    setPart1Done(false)
    setPart1Running(false)
    setPart1Progress(0)
    setExplained(false)
    setMode('bestFit')
    setCustomShare(0.4)
    setPart2Running(false)
    setPart2Progress(1)
  }

  const hasAnythingToClear = matterGuess !== null || darkGuess !== null || locked || part1Done
  const startOverDisabled = !hasAnythingToClear || part1Running

  const started = part1Running || part1Done
  const shownProgress1 = part1Done ? 1 : part1Progress

  const yours = yourComparison(share)
  const run = runUniverseAgeExperiment(share)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 6: How Old Is the Universe?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 15 November 2026 through helper summaries, so a quotation or figure on this page should be checked against the live page. No plain official page was found that explains how the age is worked out from the expansion history or that the age depends on what the universe contains, so this page defines those ideas in its own words and does not point to a source for them.
          </p>
          <ul style={listStyle}>
            {LINKS.map((l) => (
              <li key={l.href} style={{ marginBottom: '0.5rem' }}>
                <ExternalLink href={l.href}>{l.label}</ExternalLink>: {l.what}
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make two guesses. Then you will press Run and watch one graph being drawn: three lines showing how big the universe has been since the Big Bang, one for each of three versions of the universe. Your guesses are drawn on the graph in white. Nothing you guess changes the real graph.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="If the universe contained only matter, so gravity has been slowing the expansion all along, would its age be longer than, shorter than, or the same as Experiment 2's constant-speed estimate (about 14 billion years)?"
            guessText={optionText(matterOnlyAgeChoices, shownMatter)}
          >
            <ChoiceButtons options={matterOnlyAgeChoices} selected={shownMatter} disabled={locked || part1Running} onSelect={setMatterGuess} />
          </Question>
          <Question
            prompt="Dark energy speeds the expansion up in recent times. Compared with a matter-only universe, would adding dark energy make the universe older, younger, or the same age?"
            guessText={optionText(darkEnergyAgeChoices, shownDark)}
          >
            <ChoiceButtons options={darkEnergyAgeChoices} selected={shownDark} disabled={locked || part1Running} onSelect={setDarkGuess} />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your predictions are locked while you try other settings. To change them, press Start over. Start over clears your guesses, the runs, the results and the tutor.
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
          <Block>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The graph: how big the universe has been since the Big Bang</p>
            <AgeGraph drawn={shownProgress1} share={null} shareDrawn={1} finished={part1Done} guesses={part1Done ? submitted : null} />
            <Part1GraphCaption started={started} arrived={part1Done} />
          </Block>
        )}

        {part1Done && (
          <Block>
            <WhereFrom>
              <strong>Calculated here:</strong> all three lines and every age on them, from the formulas in the Words and formulas box, for a flat universe with matter and a constant dark energy and this page&rsquo;s 70 km/s per megaparsec. <strong>The green line is a calculation at {BEST_PERCENT} percent dark energy, not a plot of measurements.</strong> <strong>Measured (by others):</strong> the oldest known star clusters are older than about{' '}
              {(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)} billion years (a lower limit from a 2023 study by Cimatti and Moresco, which depends on the model it used). It is given here, not worked out. <strong>Imagined for the question:</strong> the matter-only universe (we cannot visit one), Cosmology 2&rsquo;s constant-speed line (a simplified picture) and, in Part 2, your own share of dark energy.{' '}
              <strong>Your guess:</strong> the white marks only.
            </WhereFrom>
          </Block>
        )}
        {!started && <p style={smallNote}>After you press Run, the graph is drawn: the three lines grow from the Big Bang and each ends at a dot with its age, and a caption appears under it. When the run ends the grey line and your white guess marks appear, with a &ldquo;Where the real picture comes from&rdquo; note, and Parts 2, 3 and 4 appear below.</p>}
        {started && !part1Done && <p style={smallNote}>The grey line, your white guess marks and Parts 2, 3 and 4 appear when the run ends.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose how much dark energy the universe has. Press Run and an amber line is drawn for your choice, beside the blue, purple and green lines from Part 1. Your guesses do not change anything in this part; your settings do.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Share of the universe&rsquo;s energy that is dark energy:</p>
              <button type="button" onClick={() => handleModeChange('none')} className={`toggle-button${mode === 'none' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                None (matter only)
              </button>
              <button type="button" onClick={() => handleModeChange('bestFit')} className={`toggle-button${mode === 'bestFit' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                The best fit to observations (about {BEST_PERCENT}%)
              </button>
              <button type="button" onClick={() => handleModeChange('custom')} className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                Custom
              </button>
              {mode === 'custom' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="universe-age-share" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Dark energy: {Math.round(customShare * 100)}% of the total (matter makes up the other {100 - Math.round(customShare * 100)}%)
                  </label>
                  <input
                    id="universe-age-share"
                    type="range"
                    min={0}
                    max={MAX_DARK_ENERGY_FRACTION}
                    step={0.01}
                    value={customShare}
                    onChange={(event) => {
                      setCustomShare(Number(event.target.value))
                      if (!part2Running) setPart2Progress(1)
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <button type="button" className="action-button" onClick={handlePart2Run} disabled={part2Running} style={{ padding: '0.5rem 1.5rem' }}>
                  {part2Running ? 'Running...' : 'Run: draw the amber line with your share'}
                </button>
              </div>
              <p style={smallNote}>
                Your predictions are locked while you try other settings. Your guesses do not change the drawings or tables, but this share does: it changes the amber line, the amber dot and the amber row in Part 3. Every other number stays the same. These shares are <strong>trial values</strong>: they show what would happen in a universe with that much dark energy, and they do not say the real universe is like that. While the share is on the best fit ({BEST_PERCENT} percent), the amber line lies exactly on the green one, so change the share to see something move.
              </p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', marginBottom: 0 }}>
                Dark energy share: {Math.round(share * 100)}% &nbsp;|&nbsp; Age of this universe: <strong>{billions(run.ageYears)} billion years</strong>
                <br />
                Matter only: {billions(run.matterOnlyAgeYears)} billion years &nbsp;|&nbsp; Hubble time (Cosmology 2): {billions(run.hubbleTimeYears)} billion years &nbsp;|&nbsp; Real measured age: {billions(run.realAgeYears)} billion years
                <br />
                This universe is <strong>{yours.againstOldestStars.older ? 'older' : 'younger'}</strong> than the oldest known star clusters (older than about {(OLDEST_STARS_AGE_YEARS / 1e9).toFixed(1)} billion years).
              </p>
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The graph again, with your share ({Math.round(share * 100)}% dark energy)</p>
              <AgeGraph drawn={1} share={share} shareDrawn={part2Progress} finished guesses={null} />
              <Part2Caption share={share} />
            </Block>
            <Block>
              <WhereFrom>
                <strong>Calculated here</strong> from the share you chose: the amber line, the amber dot and the numbers in the amber row of Part 3. The purple, blue and green lines and the grey line are the same as in Part 1. <strong>Imagined for the question:</strong> your trial share of dark energy.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              These are the results of your first run, with what each table means. The ages come from the physics and do not change with your guesses; only the amber row follows your settings in Part 2.
            </PartHeader>
            <UniverseAgeResults guesses={submitted} share={share} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks you three questions about what you saw, then explains it and goes through your two guesses.
            </PartHeader>
            {submitted && (
              <UniverseAgeTutor
                predictedMatterOnly={submitted.matter}
                predictedDarkEnergy={submitted.dark}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            )}
            {explained && <p style={{ ...smallNote, marginTop: '1rem' }}>You have reached the tutor&rsquo;s explanation. You can still try another share in Part 2; the tutor does not restart.</p>}
          </>
        )}
      </div>
    </div>
  )
}
