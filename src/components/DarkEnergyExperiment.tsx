import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  GUESS_REDSHIFT,
  KM_PER_MPC,
  LIGHT_YEARS_PER_MPC,
  MATCH_TOLERANCE,
  MAX_DARK_ENERGY_FRACTION,
  PUBLISHED_KEY_PROJECT,
  PUBLISHED_UNIVERSE_SHARES_PERCENT,
  brightnessExample,
  decelerationParameter,
  expansionDirection,
  expansionRateRatio,
  inverseSquareBrightness,
  matchingShareBand,
  shareVerdict,
  zeroCrossingShare,
} from '../physics/darkEnergyExperiment'
import type { GravityGuess, LooksGuess } from '../physics/darkEnergyExperiment'
import { DarkEnergyResults } from './DarkEnergyResults'
import { DarkEnergyTutor } from './DarkEnergyTutor'
import { BrightnessGraph, ExpansionPanel, Part1GraphCaption, Part1PanelCaption, Part1SupernovaCaption, Part2Caption, SupernovaPicture } from './DarkEnergyPictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 5, audited to the newer rules (docs/audit/cosmology/05-draft-wording.md, approved by the owner on 2026-11-15).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a
// real picture or table; they are drawn in white once the run has finished (§14, "Predictions and the Real Results").

interface DarkEnergyExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// One run is a fixed real duration, whatever the share (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 4000

const gravityChoices: Array<{ value: GravityGuess; label: string }> = [
  { value: 'slow', label: 'Slow it down' },
  { value: 'speed', label: 'Speed it up' },
  { value: 'none', label: 'Not change it' },
]
const looksChoices: Array<{ value: LooksGuess; label: string }> = [
  { value: 'brighter', label: 'Brighter' },
  { value: 'same', label: 'The same' },
  { value: 'dimmer', label: 'Dimmer' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

type ShareMode = 'none' | 'bestFit' | 'custom'
const BEST_PERCENT = Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)

// ---- the introduction (no answers given: §12; longer and more explanatory at the owner's request, 2026-11-15) ----
function Intro() {
  const twice = inverseSquareBrightness(2)
  const ten = inverseSquareBrightness(10)
  const shares = PUBLISHED_UNIVERSE_SHARES_PERCENT
  const p = { marginTop: 0, marginBottom: '0.75rem' } as const
  const cellStyle = { border: '1px solid var(--border-color, #ccc)', padding: '0.35rem 0.5rem', verticalAlign: 'top', fontSize: '0.8125rem' } as const
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={p}>
        <strong>The question.</strong> Is the expansion of the universe speeding up, slowing down, or staying steady, and how could anyone possibly tell?
      </p>
      <p style={p}>
        <strong>What happens.</strong> In Cosmology 1 (Hubble&rsquo;s Law) you saw that faraway galaxies move away from us faster than nearby ones, and that this is because space itself is stretching. In Cosmology 2 (the Big Bang) you read that the stretching has not always happened at the same pace. This
        experiment asks how astronomers found that out.
      </p>
      <p style={p}>
        <em>Think of the stretching the way you would think of a car&rsquo;s speed.</em> A car can be speeding up, slowing down or holding steady, and you can tell which by watching the speedometer for a minute or two. The universe&rsquo;s &ldquo;speedometer&rdquo; is the rate at which space stretches, and we cannot watch it for
        a minute: the change we are asking about takes billions of years. So astronomers use a trick: <strong>light is a record of the past.</strong> Light from a faraway galaxy set off long ago, and on its way to us it crossed space that was stretching the whole time. How far the light had to go depends on how the stretching
        went. So if we can measure how far away something really is, we have measured part of the history of the stretching.
      </p>
      <p style={p}>
        <em>But how do you measure how far away something is?</em> You need something whose true brightness you already know. A 100-watt bulb at the far end of a street looks dimmer than a 100-watt bulb next to you, and from how dim it looks you can work out how far away it is. An object like that is called a <strong>standard candle</strong>; more on what that means just below.
      </p>
      <p style={p}>
        <strong>A daily-life picture, with numbers.</strong> Look at a car&rsquo;s headlights at night. Light spreads out as it travels, so it gets thinner the farther it goes. A car <strong>twice</strong> as far away looks <strong>one quarter</strong> as bright: 1 ÷ (2 × 2) = 1 ÷ 4 = {twice}. A car <strong>ten</strong>{' '}
        times as far away looks <strong>one hundred</strong> times dimmer: 1 ÷ (10 × 10) = 1 ÷ 100 = {ten}. This is called the <strong>inverse-square rule</strong>: brightness falls as one over the distance multiplied by itself. If you know the headlights&rsquo; true brightness, then how bright they look tells you how far away
        the car is.
      </p>
      <p style={p}>
        <strong>Why &ldquo;squared&rdquo;?</strong> The light spreads out over the surface of a ball that keeps growing as the light travels. Twice as far, and the ball&rsquo;s surface is 2 × 2 = 4 times as big, so each patch of it, including the patch that is your eye, gets one quarter of the light.
      </p>
      <p style={p}>
        <strong>What is a standard candle?</strong> A standard candle is a <em>kind</em> of object, or a <em>kind</em> of event, that gives out a known amount of light. Every single one of that kind gives out the same amount, so if you know that amount, then how bright one looks from Earth tells you how far away it is (the
        inverse-square rule above). Astronomers do not rely on one kind of candle. They use different ones for different distances.
      </p>
      <p style={p}>
        <strong>Two kinds of candle.</strong> <strong>Cepheid variables</strong> are stars that slowly brighten and dim in a steady pulse; the pulse rate is tied to how bright the star really is, so timing the pulse tells astronomers its true brightness. Cepheids work for nearer galaxies: NASA&rsquo;s Hubble Key Project
        measured almost {PUBLISHED_KEY_PROJECT.cepheids} of them in {PUBLISHED_KEY_PROJECT.galaxies} galaxies out to {PUBLISHED_KEY_PROJECT.reachLightYears / 1e6} million light-years. <strong>Type Ia supernovae</strong> are far brighter than any Cepheid, so they can be used much farther away. That is why this experiment uses them.
      </p>
      <p style={p}>
        <strong>How is a candle&rsquo;s true brightness found?</strong> From the ladder below it. A geometric method called <strong>parallax</strong> (the shift in a star&rsquo;s position when seen from two points, like your thumb jumping against the wall when you blink one eye, then the other) measures the distance to
        nearby Cepheids. Cepheids in galaxies that have hosted a supernova then fix the supernova&rsquo;s true brightness. NASA: &ldquo;each rung or measurement technique relies upon the previous step for calibration.&rdquo; This chain is called the <strong>cosmic distance ladder</strong>. Think of pacing out a short stretch of
        road, using it to mark a measuring wheel, then using the wheel to measure a long road.
      </p>
      <p style={p}>
        <strong>In this experiment</strong> all three supernovae are treated as exactly equally bright, and every brightness is compared with a matter-only universe, so the true brightness cancels out. In reality no candle is perfect, and astronomers correct for small differences.
      </p>
      <p style={p}>
        <strong>The standard candle used here.</strong> A <strong>Type Ia supernova</strong> is a special kind of exploding star. It begins as a <strong>white dwarf</strong>: the small, dense, glowing core left behind when a star like our Sun runs out of fuel. If a white dwarf has a companion star close by, it can pull gas off it.
        As the gas piles on, the white dwarf gets heavier, until it passes a limit of about 1.4 times the mass of our Sun and can no longer hold itself together. It then explodes. (&ldquo;Type Ia&rdquo; is just astronomers&rsquo; label for this kind, based on what its light looks like.) Because every one of these explosions starts from nearly
        the same situation, they give out <strong>about the same amount of light</strong> each time. That is what makes them useful as standard candles. They are not perfectly identical, but the differences can be allowed for: a slightly brighter one fades more slowly over its first two weeks or so, so watching how fast a supernova
        fades lets astronomers correct for small differences. In this experiment we simplify and treat every Type Ia supernova as exactly the same.
      </p>
      <p style={p}>
        <strong>The two ideas put together.</strong> If a supernova&rsquo;s true brightness is known, how bright it looks tells us how far away it is (the inverse-square rule). And how far away it is depends on how space stretched while its light was travelling to us. So the brightness of faraway supernovae can be used to read the history of the
        stretching. This experiment compares what we would see in two different kinds of universe. You will make guesses about both before you see them.
      </p>
      <p style={p}>
        <strong>Two kinds of universe.</strong> A <strong>universe with only matter</strong> is one where everything in space is stars, gas, dust and anything else that has mass. A <strong>universe with dark energy</strong> also contains an extra ingredient that astronomers call <strong>dark energy</strong>: the name for whatever could make the
        stretching of space speed up. Whether our real universe has it, and how much, is the question you will explore. The page measures the amount as a <strong>share</strong> of all the energy in the universe: 0 percent means none, 70 percent means seven tenths of everything. Matter makes up the rest.
      </p>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>Dark energy and dark matter: two different things.</strong> You may have met another &ldquo;dark&rdquo; thing in <strong>Cosmology 4: dark matter</strong>. The two names sound alike, but astronomers treat them as <strong>two different things</strong>. NASA puts it this way: &ldquo;dark energy is not the same as dark matter.
        Their main similarity is that we don&rsquo;t yet know what they are!&rdquo; Here is how they differ:
      </p>
      <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={cellStyle} />
              <th style={{ ...cellStyle, textAlign: 'left' }}>Dark matter</th>
              <th style={{ ...cellStyle, textAlign: 'left' }}>Dark energy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}><strong>What does it do?</strong></td>
              <td style={cellStyle}>It has mass, so it has gravity. It is the invisible &ldquo;glue&rdquo; that helps hold galaxies and clusters of galaxies together.</td>
              <td style={cellStyle}>It is the name for whatever could make the stretching of <strong>space itself</strong> speed up.</td>
            </tr>
            <tr>
              <td style={cellStyle}><strong>Where does it act?</strong></td>
              <td style={cellStyle}>Inside and around galaxies and clusters, where there is matter to pull on.</td>
              <td style={cellStyle}>Across the whole of space, on the largest scales.</td>
            </tr>
            <tr>
              <td style={cellStyle}><strong>How was it found?</strong></td>
              <td style={cellStyle}>From how fast stars orbit inside galaxies (Cosmology 4), from how clusters of galaxies move, and from how gravity bends the light of galaxies behind them.</td>
              <td style={cellStyle}>From how bright very distant supernovae look (this experiment).</td>
            </tr>
            <tr>
              <td style={cellStyle}><strong>How much of the universe?</strong></td>
              <td style={cellStyle}>About {shares.darkMatter} percent (NASA).</td>
              <td style={cellStyle}>About {shares.darkEnergy} percent (NASA); the page&rsquo;s model uses a rounded {BEST_PERCENT}.</td>
            </tr>
            <tr>
              <td style={cellStyle}><strong>Do we know what it is?</strong></td>
              <td style={cellStyle}>No.</td>
              <td style={cellStyle}>No.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={p}>
        <strong>An everyday way to keep them apart.</strong> Think of a balloon with coins glued to its rubber, being blown up. The coins stay the same size and are held in place by their own glue: that is like <strong>matter</strong>, and dark matter is the part of it we cannot see. The rubber stretching between the coins is like{' '}
        <strong>space expanding</strong>. Dark energy is not another coin. It is the name for whatever could change <em>how fast the rubber stretches</em>. Dark matter is something <strong>in</strong> space; dark energy is something about <strong>space itself</strong>.
      </p>
      <p style={p}>
        <strong>Do they come from the same source?</strong> Nobody knows of a link. The pages this experiment draws on describe them as separate, found in different ways and doing different jobs, and none of them says that they share a source (or that they do not). What each one is made of is unknown, and this experiment does not claim a
        connection between them. When this page says &ldquo;matter&rdquo;, it means <strong>all</strong> the matter together, dark matter and ordinary matter. It has no separate &ldquo;dark matter&rdquo; dial: the only dial is the share of dark energy.
      </p>
      <p style={p}>
        <strong>Distance and redshift, a reminder.</strong> Distances here are in <strong>megaparsecs (Mpc)</strong>. One megaparsec is about {(LIGHT_YEARS_PER_MPC / 1e6).toFixed(2)} million light-years, which is about {(KM_PER_MPC / 1e18).toFixed(0)} million million million kilometres. <strong>Redshift</strong> is a number that says how much the
        light of a faraway object has been stretched on its way to us, as space stretched. A bigger redshift means the object is farther away and its light set off longer ago. The three supernovae here are at redshifts 0.2, 0.5 and 0.8.
      </p>
      <p style={p}>
        <strong>What you will do.</strong> The page below has four parts. <strong>Part 1</strong> asks for two guesses; then you press <strong>Run</strong> and watch three supernovae, one graph and one small panel, all for the universe astronomers&rsquo; best measurements point to. <strong>Part 2</strong> lets you choose your own share of dark
        energy and see what changes. <strong>Part 3</strong> gives the results, with a short guide to reading them. <strong>Part 4</strong> is a tutor who talks it over with you.
      </p>
      <p style={p}>
        <strong>Your guesses never change the real pictures or tables.</strong> After you press Run, they are drawn on the pictures in <strong>white</strong>, and shown again beside the results. The only things that change the drawings are the share you choose in Part 2. If you change a guess, press Run and see nothing change, that is
        not a fault: a guess is only a guess.
      </p>
      <p style={{ ...p, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Flat.</strong> Space on the very largest scales is treated as not curved, the way a flat sheet is not curved, so straight parallel paths stay parallel. (In Gravity and Curved Spacetime you met a curved surface, the sphere.) This is a simplification, and a good one for the redshifts used here.
        </li>
        <li>
          <strong>Only matter and dark energy.</strong> Light and other radiation, which matter only very early on, are left out. Matter&rsquo;s share is 100 percent minus dark energy&rsquo;s share. In the real universe about {shares.darkMatter} percent is dark matter and about {shares.ordinaryMatter} percent is ordinary matter (NASA); the page adds them together
          as &ldquo;matter&rdquo;.
        </li>
        <li>
          <strong>Dark energy is treated as constant:</strong> the same in every bit of space at all times. This is the simplest model. As of November 2026 astronomers are testing whether it is exactly constant: in 2025 the DESI survey reported that dark energy that changes with time fits its data better than a constant one, by 2.8 to 4.2
          &ldquo;sigma&rdquo; (a measure of how unlikely the pattern is to be chance; bigger means less likely) depending on which supernova list is used, and described this as a possible solution to tensions in the standard model. That question is explored in the Cosmic Horizons experiment on evolving dark energy. It is{' '}
          <strong>not</strong> tested here.
        </li>
        <li>
          <strong>The Hubble constant</strong> is the same illustrative 70 km/s per megaparsec as in Cosmology 1; published values run from about 67 to 73, a disagreement known as the &ldquo;Hubble tension&rdquo;.
        </li>
        <li>
          <strong>Every supernova is treated as exactly equally bright.</strong> In reality astronomers correct for small differences.
        </li>
        <li>
          <strong>The &ldquo;best fit&rdquo; is a model, not data.</strong> It is a dark energy share of <strong>{BEST_PERCENT} percent</strong> (a rounded value; NASA gives &ldquo;approximately 68.3 to 70%&rdquo;) that makes the model&rsquo;s supernova brightness match what astronomers have measured. The green line is calculated here from that share; it is{' '}
          <strong>not</strong> a plot of individual supernovae.
        </li>
        <li>Only redshifts up to 1 are shown.</li>
        <li>Nothing here claims to say what dark energy is.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> dark matter (a reminder from Cosmology 4), supernova, Type Ia supernova, white dwarf, standard candle, Cepheid variable, parallax, cosmic distance ladder, brightness, inverse-square rule, redshift, megaparsec, expansion, matter, dark energy, flat universe, Hubble constant, deceleration number, sigma. The &ldquo;Words and formulas&rdquo; box below has each one with a short
        meaning.
      </p>
    </div>
  )
}

// ---- the words box: the formulas' worked examples (they give the results) wait until after the first Run ----
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const e = brightnessExample(BEST_FIT_DARK_ENERGY_FRACTION)
  const crossing = zeroCrossingShare()
  const entries = [
    { term: 'Supernova', meaning: 'an exploding star.' },
    { term: 'Type Ia supernova', meaning: 'the kind used here: a white dwarf that explodes after pulling gas from a companion star.' },
    { term: 'White dwarf', meaning: 'the small, dense, glowing core left when a star like our Sun runs out of fuel.' },
    { term: 'Standard candle', meaning: 'a kind of object or event that gives out a known amount of light, such as a 100-watt bulb. How bright one looks then tells us how far away it is. Cepheid variables and Type Ia supernovae are two kinds used by astronomers.' },
    { term: 'Cepheid variable', meaning: 'a star that slowly brightens and dims in a steady pulse. The pulse rate is tied to how bright the star really is, so it works as a standard candle for nearer galaxies.' },
    { term: 'Parallax', meaning: 'the apparent shift of an object’s position when you look at it from two different points, like your thumb jumping against the wall when you blink one eye, then the other. It gives distances to nearby stars by geometry alone.' },
    { term: 'Cosmic distance ladder', meaning: 'the chain of distance methods, each calibrated by the one before: parallax, then Cepheids, then Type Ia supernovae.' },
    { term: 'Brightness', meaning: 'how much light from an object reaches us.' },
    { term: 'Inverse-square rule', meaning: 'brightness = true brightness ÷ (distance × distance), up to a constant. Light spreads over a ball whose surface grows as distance squared. Twice as far means one quarter as bright; ten times as far means one hundredth.' },
    { term: 'Redshift', meaning: 'a number that says how much light has been stretched on its way to us as space stretched. Bigger means farther away and set off longer ago.' },
    { term: 'Megaparsec (Mpc)', meaning: `a unit of distance: about ${(LIGHT_YEARS_PER_MPC / 1e6).toFixed(2)} million light-years.` },
    { term: 'Expansion', meaning: 'the stretching of space itself, which carries faraway galaxies away from us.' },
    { term: 'Matter', meaning: 'everything with mass: stars, gas, dust and dark matter. On this page, all of it together.' },
    { term: 'Dark energy', meaning: 'the name for whatever could make the expansion speed up. It is not the same as dark matter.' },
    { term: 'Dark matter', meaning: 'invisible matter that has gravity and helps hold galaxies together (Cosmology 4).' },
    { term: 'Flat universe', meaning: 'a universe where space on the largest scales is not curved, so straight parallel paths stay parallel.' },
    { term: 'Hubble constant', meaning: 'how fast space stretches per megaparsec today: 70 km/s per Mpc here.' },
    { term: 'Deceleration number', meaning: 'one number for “slowing down or speeding up today”: above zero means slowing down, below zero means speeding up, zero means steady.' },
    { term: 'Sigma', meaning: 'a measure of how unlikely a pattern is to be chance. Bigger means less likely.' },
    { term: 'Four ideas for dark energy (NASA)', meaning: 'a built-in energy of empty space (a cosmological constant); a new, changing energy called quintessence; odd “defects” in space; or a flaw in the theory of gravity (general relativity).' },
  ]
  if (afterRun) {
    entries.push({
      term: 'Formula 1: brightness against distance, with a worked example',
      meaning: `brightness compared with matter-only = (distance matter-only ÷ distance in your universe)². At redshift ${e.redshift} and ${BEST_PERCENT} percent: (${e.matterOnlyDistanceMpc.toFixed(0)} ÷ ${e.distanceMpc.toFixed(0)})² = ${e.brightness.toFixed(2)}.`,
    })
    entries.push({
      term: 'Formula 2: the deceleration number, with a worked example',
      meaning: `q = 0.5 − 1.5 × (dark energy share). At ${BEST_PERCENT} percent: 0.5 − ${(1.5 * BEST_FIT_DARK_ENERGY_FRACTION).toFixed(2)} = ${decelerationParameter(BEST_FIT_DARK_ENERGY_FRACTION).toFixed(2)}. With none: +${decelerationParameter(0).toFixed(2)}. It is zero at one third: 0.5 − 1.5 × (1/3) = 0 (${(crossing * 100).toFixed(0)} percent).`,
    })
    entries.push({
      term: 'Formula 3: the expansion rate, with a worked example',
      meaning: `E(z) = √[(1 − share) × (1 + z)³ + share]. At redshift 0.5 and ${BEST_PERCENT} percent: √[0.3 × 3.375 + 0.7] = √1.7125 = ${expansionRateRatio(0.5, BEST_FIT_DARK_ENERGY_FRACTION).toFixed(3)}. The distance itself needs a sum over many small steps; the page does it by computer (Simpson’s rule).`,
    })
  } else {
    entries.push({ term: 'More words', meaning: 'the formulas and their worked examples appear here after your first run, because the numbers in them would give away what you are about to guess.' })
  }
  return entries
}

// ---- links (pages read 2026-11-15 through helper summaries; see the draft's source table). The pages that say supernovae looked dimmer or
// that the expansion speeds up would give away the guesses, so they appear after the first Run (§12). ----
const LINKS_BEFORE: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://science.nasa.gov/universe/overview/building-blocks/',
    label: 'NASA: Building Blocks of the universe',
    what: 'NASA’s short page on how much of the universe is ordinary matter, dark matter and dark energy (5, 27 and 68 percent). (Read; no year or data set is stated on the page.)',
  },
  {
    href: 'https://science.nasa.gov/dark-matter/',
    label: 'NASA: Dark Matter',
    what: 'NASA’s page on dark matter, the other “dark” ingredient: how it holds galaxies together and how it was found. Read it beside this experiment to see the difference. (Read; no date or data set on the 27 percent.)',
  },
  {
    href: 'https://chandra.harvard.edu/xray_sources/supernovas.html',
    label: 'Chandra: Supernovas and supernova remnants',
    what: 'a plain page from NASA’s Chandra X-ray Center on how a white dwarf becomes a Type Ia supernova and why these explosions work as standard candles. (Read.)',
  },
  {
    href: 'https://esahubble.org/images/heic1611a/',
    label: 'ESA/Hubble: Cosmic distance ladder',
    what: 'a short ESA/Hubble page on how parallax, Cepheid variables and Type Ia supernovae are linked into a distance ladder. (Read.)',
  },
  {
    href: 'https://science.nasa.gov/missions/hubble/nasas-webb-hubble-telescopes-affirm-universes-expansion-rate-puzzle-persists/',
    label: 'NASA: Webb and Hubble affirm the universe’s expansion-rate puzzle',
    what: 'NASA’s plain account of the distance ladder, in which “each rung or measurement technique relies upon the previous step for calibration”. (Read.)',
  },
  {
    href: 'https://science.nasa.gov/missions/hubble/hubble-completes-eight-year-effort-to-measure-expanding-universe/',
    label: 'NASA: Hubble completes eight-year effort to measure the expanding universe',
    what: 'NASA’s page on the Hubble Key Project, which measured almost 800 Cepheid variables in 18 galaxies. The source of the Cepheid figures on this page. (Read.)',
  },
  {
    href: 'https://svs.gsfc.nasa.gov/vis/a010000/a013800/a013852/13852_Roman_Standard_Candle_Supernovae_transP.html',
    label: 'NASA SVS: Standard candle supernovae',
    what: 'a transcript of a short NASA video that explains what a standard candle is and how Type Ia supernovae are used to measure distance. (Read; a transcript.)',
  },
  {
    href: 'https://imagine.gsfc.nasa.gov/educators/programs/cosmictimes/online_edition/1993/foolproof.html',
    label: 'NASA Cosmic Times: Fool-proofing galactic candles (1993)',
    what: 'a short NASA article, written as 1993 news, on how astronomers learned that brighter Type Ia supernovae fade more slowly and used that to correct their distances. (Read; written in 1993.)',
  },
  {
    href: 'https://arxiv.org/abs/1807.06209',
    label: 'Planck Collaboration (2018): cosmological parameters',
    what: 'the paper behind the most precise measure of how much of the universe is matter (about 31.5 percent). A technical paper; the abstract is the readable part. (Abstract read, partly.)',
  },
  {
    href: 'https://arxiv.org/abs/2503.14738',
    label: 'DESI Collaboration (2025): baryon acoustic oscillation results',
    what: 'the 2025 survey result that hints dark energy may change over time. A technical paper; the abstract is the readable part. (Abstract read.)',
  },
]
const LINKS_AFTER: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://science.nasa.gov/universe/the-universe-is-expanding-faster-these-days-and-dark-energy-is-responsible-so-what-is-dark-energy',
    label: 'NASA: What is dark energy?',
    what: 'NASA’s plain explainer on what dark energy is, how distant supernovae that looked dimmer than expected led to its discovery in 1998, and four ideas for what it could be. (Read.)',
  },
  {
    href: 'https://science.nasa.gov/mission/roman-space-telescope/dark-energy',
    label: 'NASA Roman Space Telescope: dark energy',
    what: 'how a coming NASA telescope will use thousands of supernovae to test dark energy, including whether it changes over time. (Read.)',
  },
  {
    href: 'https://sci.esa.int/web/euclid/-/what-is-dark-energy-',
    label: 'ESA Euclid: What is dark energy?',
    what: 'the European Space Agency’s plain explainer on dark energy, including the idea that it is a constant property of empty space and how the Euclid telescope will test that. (Read.)',
  },
  {
    href: 'https://www.esa.int/Science_Exploration/Space_Science/Euclid/The_dark_Universe',
    label: 'ESA: The dark Universe',
    what: 'a short ESA page that sets dark matter and dark energy side by side. (Read.)',
  },
  {
    href: 'https://www.kva.se/en/news/nobelpriset-i-fysik-2011-2/',
    label: 'Royal Swedish Academy of Sciences: the 2011 Nobel Prize in Physics',
    what: 'the announcement from the academy that awards the prize: who won, and why, for finding that the expansion of the universe is speeding up. (Read; nobelprize.org itself could not be opened. The page quotes a 2011 figure of “roughly 75 percent” for dark energy, which is older than NASA’s 68 percent; this page does not use it.)',
  },
  {
    href: 'https://arxiv.org/abs/astro-ph/9805201',
    label: 'Riess and others (1998): supernova evidence for an accelerating universe',
    what: 'the first team’s paper. A technical paper; the abstract (the summary) is the readable part. (Abstract read only.)',
  },
  {
    href: 'https://arxiv.org/abs/astro-ph/9812133',
    label: 'Perlmutter and others (1999): 42 high-redshift supernovae',
    what: 'the second team’s paper. A technical paper; the abstract is the readable part. (Abstract read only.)',
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

export function DarkEnergyExperiment({ onComplete, onTutorComplete }: DarkEnergyExperimentProps) {
  const [gravityGuess, setGravityGuess] = useState<GravityGuess | null>(null)
  const [looksGuess, setLooksGuess] = useState<LooksGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ gravity: GravityGuess; looks: LooksGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  const [part1Running, setPart1Running] = useState(false)
  const [part1Progress, setPart1Progress] = useState(0)
  const [explained, setExplained] = useState(false)

  const [mode, setMode] = useState<ShareMode>('bestFit')
  const [customShare, setCustomShare] = useState(0.4)
  // Part 2's disks ease from the ring size to their final size when its own Run is pressed; at rest they show the final state.
  const [part2Running, setPart2Running] = useState(false)
  const [part2Progress, setPart2Progress] = useState(1)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const hasAllGuesses = gravityGuess !== null && looksGuess !== null
  const locked = submitted !== null
  const shownGravity = submitted?.gravity ?? gravityGuess
  const shownLooks = submitted?.looks ?? looksGuess
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

  // Part 2's animation: the disks at the brightness of the chosen share, over the same fixed duration.
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
    if (!submitted) setSubmitted({ gravity: gravityGuess!, looks: looksGuess! })
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
    setGravityGuess(null)
    setLooksGuess(null)
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

  const hasAnythingToClear = gravityGuess !== null || looksGuess !== null || locked || part1Done
  const startOverDisabled = !hasAnythingToClear || part1Running

  const started = part1Running || part1Done
  const shownProgress1 = part1Done ? 1 : part1Progress

  const verdict = shareVerdict(share)
  const band = matchingShareBand()
  const direction = expansionDirection(share)
  const q = decelerationParameter(share)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 5: Dark Energy</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 15 November 2026 through helper summaries, so a quotation or figure on this page should be checked against the live page. No official page was found that says whether dark matter and dark energy might share a source, so this page does not say, and
            no official page was found for the idea that a Type Ia supernova is &ldquo;as bright as billions of Suns&rdquo;, so this page does not say that either.
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
              <p style={{ ...smallNote, marginBottom: '0.25rem' }}>More links, now that you have run it:</p>
              <ul style={listStyle}>
                {LINKS_AFTER.map((l) => (
                  <li key={l.href} style={{ marginBottom: '0.5rem' }}>
                    <ExternalLink href={l.href}>{l.label}</ExternalLink>: {l.what}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p style={smallNote}>Seven more links, on how dark energy was found, the two teams&rsquo; papers and the Nobel Prize, appear here after your first Run, because their wording would give away what you are guessing.</p>
          )}
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make two guesses. Then you will press Run and watch three exploding stars at three distances, one graph and one small panel, all drawn for the universe astronomers&rsquo; measurements point to. Your guesses are drawn on the pictures in white. Nothing you guess changes the real pictures.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question prompt="If the universe contained only matter, how would gravity affect the expansion?" guessText={optionText(gravityChoices, shownGravity)}>
            <ChoiceButtons options={gravityChoices} selected={shownGravity} disabled={locked || part1Running} onSelect={setGravityGuess} />
          </Question>
          <Question
            prompt="Now suppose the expansion were speeding up instead. A faraway supernova's light would travel through space that has been stretching faster and faster. Compared with a universe that is slowing down, would that supernova look brighter, the same, or dimmer?"
            guessText={optionText(looksChoices, shownLooks)}
          >
            <ChoiceButtons options={looksChoices} selected={shownLooks} disabled={locked || part1Running} onSelect={setLooksGuess} />
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

        <Block>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 1: three exploding stars</p>
          <SupernovaPicture kind="best" share={BEST_FIT_DARK_ENERGY_FRACTION} progress={shownProgress1} started={started} guess={part1Done ? submitted!.looks : null} />
          <Part1SupernovaCaption started={started} arrived={part1Done} />
        </Block>
        <Block>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 2: brightness against redshift</p>
          <BrightnessGraph drawn={started ? shownProgress1 : null} share={null} guess={part1Done ? submitted!.looks : null} />
          {started ? <Part1GraphCaption started={started} arrived={part1Done} /> : null}
        </Block>
        <Block>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 3: is the expansion speeding up or slowing down today?</p>
          <ExpansionPanel drawn={started ? shownProgress1 : null} share={null} guess={part1Done ? submitted!.gravity : null} />
          {started ? <Part1PanelCaption started={started} arrived={part1Done} /> : null}
        </Block>

        {part1Done && (
          <Block>
            <WhereFrom>
              <strong>Measured:</strong> the astronomers&rsquo; best fit of about <strong>{BEST_PERCENT} percent</strong> dark energy is a rounded value. NASA gives &ldquo;approximately 68.3 to 70%&rdquo;. It comes from real supernova measurements, first reported in 1998 by two teams, and many measurements since. It is given here, not worked out.{' '}
              <strong>Calculated here:</strong> every distance, every brightness, the blue line, the green dashed line, the panel&rsquo;s curve and the redshift-{GUESS_REDSHIFT} numbers, from the formulas in the Words and formulas box, using the page&rsquo;s 70 km/s per megaparsec. <strong>The green line is a calculation at {BEST_PERCENT} percent, not a plot of
              supernovae.</strong> <strong>Imagined for the question:</strong> the three supernovae at redshifts 0.2, 0.5 and 0.8; the assumption that all three are exactly equally bright; the &ldquo;matter-only universe&rdquo; (we cannot visit one); and, in Part 2, your own share of dark energy. White is only ever your guess.
            </WhereFrom>
          </Block>
        )}
        {!started && <p style={smallNote}>After you press Run, the dashed rings and the blue line appear, the green disks and the green dashed line are drawn, and a caption appears for each picture. When the run ends your white guess marks and a &ldquo;Where the real picture comes from&rdquo; note appear, and Parts 2, 3 and 4 appear below.</p>}
        {started && !part1Done && <p style={smallNote}>Your white guess marks and Parts 2, 3 and 4 appear when the run ends.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now choose your own share of dark energy and see what changes. The amber line, the amber disks and the amber dot show your universe next to the best fit. Your guesses do not change anything here; the share does.
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
                  <label htmlFor="dark-energy-share" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Dark energy: {Math.round(customShare * 100)}% of the total (matter makes up the other {100 - Math.round(customShare * 100)}%)
                  </label>
                  <input
                    id="dark-energy-share"
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
                  {part2Running ? 'Running...' : 'Run: watch the disks with your share'}
                </button>
              </div>
              <p style={smallNote}>
                Your predictions are locked while you try other settings. Your guesses do not change the drawings or tables, but this share does: it changes the amber disks, the amber line and the amber dot, and the &ldquo;your universe&rdquo; columns in Part 3. Every other number stays the same. These shares are{' '}
                <strong>trial values</strong>: they show what would happen in a universe with that much dark energy, and they do not say the real universe is like that. While the share is on the best fit ({BEST_PERCENT} percent), your amber drawings lie exactly on the green ones, so change the share to see something move.
              </p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', marginBottom: 0 }}>
                At {Math.round(share * 100)} percent dark energy, today the expansion is <strong>{direction}</strong> (deceleration number {q > 0 ? '+' : q < 0 ? '−' : ''}
                {Math.abs(q).toFixed(2)}).{' '}
                {verdict === 'match'
                  ? `The brightness stays within ${Math.round(MATCH_TOLERANCE * 100)} percent of the best fit's at every redshift.`
                  : verdict === 'too-little'
                    ? `Distant supernovae still look more than ${Math.round(MATCH_TOLERANCE * 100)} percent brighter than the best fit says at some redshifts.`
                    : `Distant supernovae look more than ${Math.round(MATCH_TOLERANCE * 100)} percent less bright than the best fit says at some redshifts.`}{' '}
                The &ldquo;within {Math.round(MATCH_TOLERANCE * 100)} percent&rdquo; rule is this page&rsquo;s own, not a published cut-off. Shares from about {Math.round(band.low * 100)} to {Math.round(band.high * 100)} percent meet it.
              </p>
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 4: the three stars with your share ({Math.round(share * 100)}% dark energy)</p>
              <SupernovaPicture kind="yours" share={share} progress={part2Progress} started guess={null} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 5: brightness against redshift, with your share</p>
              <BrightnessGraph drawn={1} share={share} guess={null} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 6: slowing down or speeding up today, with your share</p>
              <ExpansionPanel drawn={1} share={share} guess={null} />
              <Part2Caption share={share} />
            </Block>
            <Block>
              <WhereFrom>
                <strong>Calculated here</strong> from the share you chose: the amber disks, the amber line, the amber dot and the numbers in the &ldquo;your universe&rdquo; columns. The blue and green lines and the dashed rings are the same as in Part 1. <strong>Imagined for the question:</strong> your trial share of dark energy.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures. Table 1 sets the page&rsquo;s numbers beside what astronomers report. Table 2 gives how far and how bright each supernova is. Your guesses are shown beside the tables, and nothing you guess changes a number in either table. Only the &ldquo;your universe&rdquo; columns in Table 2 follow
              the share you chose in Part 2.
            </PartHeader>
            <DarkEnergyResults guesses={submitted} share={share} explained={explained} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              You will talk over what you saw. The tutor will ask three questions, then explain, and will say how each of your guesses compares.
            </PartHeader>
            {submitted && (
              <DarkEnergyTutor
                predictedGravity={submitted.gravity}
                predictedLooks={submitted.looks}
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
