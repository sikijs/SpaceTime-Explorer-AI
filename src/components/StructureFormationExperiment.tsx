import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  CLUMP_THRESHOLD,
  MATTER_RADIATION_EQUALITY_REDSHIFT,
  MAX_START_DELTA,
  MIN_START_DELTA,
  RECOMBINATION_REDSHIFT,
  START_SIZE_PRESETS,
  runStructureFormationExperiment,
  workedExamples,
} from '../physics/structureFormationExperiment'
import type { GrowthGuess, HeadStartGuess, KindOfMatter } from '../physics/structureFormationExperiment'
import { StructureFormationResults } from './StructureFormationResults'
import { StructureFormationTutor } from './StructureFormationTutor'
import {
  ExcessCaption,
  ExcessGraph,
  GrowthGraph,
  NeededSizeCaption,
  NeededSizePicture,
  Part1GrowthCaption,
  StripCaption,
  StripPicture,
  YOUR_COLOR,
  curveAt,
  kindLabels,
  partsInLabel,
  redshiftLabel,
  yearsLabel,
} from './StructureFormationPictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 9, audited to the newer rules (docs/audit/cosmology/09-draft-wording.md, approved by the owner on 2026-11-15).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a real
// picture or table; they are drawn in white once the run has finished (§14, "Predictions and the Real Results").

interface StructureFormationExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type StartMode = 'preset' | 'custom'

// One run is a fixed real duration, whatever the settings (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 9000

// The two guess questions are kept exactly as the owner approved them on 2026-10-09.
const growthChoices: Array<{ value: GrowthGuess; label: string }> = [
  { value: 'ten', label: 'About 10 times' },
  { value: 'thousand', label: 'About 1,000 times' },
  { value: 'million', label: 'About a million times' },
]
const headStartChoices: Array<{ value: HeadStartGuess; label: string }> = [
  { value: 'none', label: 'No difference' },
  { value: 'small', label: 'A small difference' },
  { value: 'decides', label: 'It would decide the outcome' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

// The custom slider moves along a scale where each step multiplies, so small and large ripples are both easy to pick.
const SLIDER_STEPS = 1000
const sliderToDelta = (position: number) => MIN_START_DELTA * (MAX_START_DELTA / MIN_START_DELTA) ** (position / SLIDER_STEPS)
const deltaToSlider = (delta: number) => Math.round((Math.log(delta / MIN_START_DELTA) / Math.log(MAX_START_DELTA / MIN_START_DELTA)) * SLIDER_STEPS)

// ---- the introduction (the owner's approved wording, 2026-11-15; no answers given: §12) ----
function Intro() {
  const p = { marginTop: 0, marginBottom: '0.75rem' } as const
  const list = { marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' } as const
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={p}>
        <strong>The question.</strong> The oldest light we can see (the cosmic microwave background, from Cosmology 3) shows an early universe that was almost perfectly smooth: its temperature differs by only about 1 part in 100,000 from place to place. Yet today the universe is full of galaxies, with huge empty spaces between them. How did a nearly smooth universe turn into a lumpy one?
      </p>
      <p style={p}>
        <strong>What happens.</strong> You will look at one small region of the early universe. Picture a patch of space, and the matter inside it. Most patches hold about the same amount of matter, the average. But this patch is a tiny bit different: it holds just slightly <em>more</em> matter than average, so it is just slightly denser. Think of a big hall where people are spread almost evenly, except for one spot that is a little more crowded than the rest. That patch is the &ldquo;region&rdquo; in this experiment.
      </p>
      <p style={p}>
        We then follow that one region through time, from the moment the oldest light was released (the very earliest time this model looks at for ordinary matter) all the way to today. During all those billions of years two things are going on. The region&rsquo;s extra gravity pulls in more matter, which would make the extra density grow. At the same time space is expanding, which spreads matter out and works against that growth. At every moment we can ask one question: <em>by what factor has the extra density grown since the start?</em> For example, if a region began 1 part in 1,000 denser than average and its extra density has grown 10 times, it is now 10 parts in 1,000 (1 part in 100) denser than average. That factor is the <strong>growth</strong> (Step 4 below). The experiment shows you how big that growth can get between the oldest light and today, and how the answer depends on the kind of matter that is gathering.
      </p>
      <p style={p}>
        <strong>Your guesses.</strong> First you make two guesses. Then you press <strong>Run</strong>, and a graph shows how many times such a region grows. Your guesses are drawn on the graph in white. In <strong>Part 2</strong> you choose what kind of matter is gathering and how much denser than average your region starts, and you watch your own region. The results and a tutor follow.
      </p>
      <p style={p}>
        <strong>Step 1: the oldest light, a reminder.</strong> In Cosmology 3 you met the oldest light we can see. NASA&rsquo;s COBE page says its temperature ripples are &ldquo;only one part in 100,000 compared to the 2.73 degree Kelvin average&rdquo;. ESA says these tiny temperature differences &ldquo;correspond to regions of slightly different densities at very early times, representing the seeds of all future structure: the stars and galaxies of today&rdquo;. So the story of every galaxy begins with a region that was a tiny bit denser than its surroundings.
      </p>
      <p style={p}>
        <strong>Step 2: a new word, density excess.</strong> The <strong>density excess</strong> is how much denser than average a region is. A density excess of 0.1 means 10 percent denser: if an average patch of space holds 100 grains of matter, this one holds 110. A density excess of 1 means twice the average. (This is an everyday picture, not a measurement.)
      </p>
      <p style={p}>
        <strong>Step 3: the tug-of-war.</strong> A region that is slightly denser has slightly more gravity, so it pulls in a little extra matter from around it. With that extra matter it is denser still, so it pulls harder. But space is also expanding (Cosmology 1 and 2), and the expansion keeps spreading everything out. The two effects work against each other. This experiment is about how that contest comes out.
      </p>
      <p style={p}>
        <strong>Step 4: growth.</strong> The <strong>growth</strong> is how many times bigger the density excess has become since the region started. If a region starts 1 part in 1,000 denser and its density excess grows 100 times, it ends up 1 part in 10 denser.
      </p>
      <p style={p}>
        <strong>Step 5: a clump.</strong> A <strong>clump</strong> is a region that has become dense enough (a density excess of 1, twice the average) that it would pull itself together into a lump held together by its own gravity, such as a galaxy. This experiment says <em>when</em> a region would become a clump. It does not say what the clump looks like.
      </p>
      <p style={p}>
        <strong>Step 6: redshift, a reminder.</strong> In Cosmology 1 and 8 you met <strong>redshift</strong>: a number that tells how long ago something was. A bigger redshift means an earlier time.
      </p>
      <p style={p}>
        <strong>Step 7: why ask this at all.</strong> Every galaxy, and every cluster of galaxies, started as a tiny difference in density. Working out how fast those differences could grow tells us what the early universe must have been like, and it brings together the oldest light (Cosmology 3), dark matter (Cosmology 4) and dark energy (Cosmology 5).
      </p>
      <p style={p}>
        <strong>Your job.</strong> First, make two guesses. Then press Run. Afterwards, in Part 2, choose a kind of matter and a starting size of your own.
      </p>
      <p style={p}>
        <strong>What to look for.</strong> <strong>Look at:</strong> the two lines on the graph. <strong>What it means:</strong> one line is for ordinary matter and the other is for dark matter, and each shows how many times a region of that kind of matter has grown. <strong>Why it matters:</strong> how high they climb is the whole question. In Part 2, look at whether your own region becomes a clump.
      </p>
      <p style={p}>
        <strong>How this page is laid out.</strong> Below this introduction the page has four parts. <strong>Part 1</strong> is where you guess and watch. <strong>Part 2</strong> is where you try your own settings. <strong>Part 3</strong> shows the results and what they mean. <strong>Part 4</strong> is the tutor. Parts 2, 3 and 4 appear when your first run has finished.
      </p>
      <p style={p}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables. They are drawn on the real graph in <strong>white</strong>, in a box labelled YOUR GUESS, after the run, and shown again beside the results. The real pictures come from the physics. The kind of matter and the starting size you choose in Part 2 do change the strip, your ripple&rsquo;s graph and the pink row of the table, but never the Part 1 graph. If you change a guess, press Run and see nothing change, that is not a fault: a guess is only a guess.
      </p>
      <p style={{ ...p, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={list}>
        <li>
          The same simplified universe as Cosmology 5, 6 and 8: &ldquo;flat&rdquo; (space on the very largest scales is not curved, so straight parallel paths stay parallel), with matter and a constant dark energy (70 percent), and an illustrative Hubble constant of 70 km/s per megaparsec (a megaparsec is about 3.3 million light-years). Published values range from about 67 to 73: the &ldquo;Hubble tension&rdquo;. <strong>Radiation</strong> (the light and other very fast particles of the early universe) is left out, so the model cannot describe the time before matter outweighed radiation.
        </li>
        <li>Only the first, simple stage of growth is modelled: a region that is still only slightly denser than average. Real structure formation also involves pressure, gas cooling, the birth of stars and mergers of clumps, and none of these are modelled.</li>
        <li>
          The starting size of the region is your own illustrative choice, not a measurement. The oldest light&rsquo;s 1 part in 100,000 is a difference in <em>temperature</em>, which is not the same as how much denser a region of matter is, and how the two are related depends on the size of the region. This model does not capture that. (No official page was found that says how they differ.)
        </li>
        <li>A single region is treated on its own. Real galaxies form where many ripples of many sizes overlap.</li>
        <li>The model says <em>when</em> a region would become a clump. It does not say what the clump looks like.</li>
        <li>The ripples of the oldest light are the seeds. For ordinary matter the model lets a region start growing when the oldest light was released.</li>
      </ul>
      <p style={{ ...p, marginBottom: '0.75rem' }}>
        <strong>Some new words:</strong> density excess, growth, clump, redshift, ripple, megaparsec. All are in the Words and formulas box below.
      </p>
      <p style={{ ...p, marginBottom: 0 }}>
        <strong>As of November 2026.</strong> The best measurements of the oldest light come from ESA&rsquo;s Planck satellite. Its final results (the 2018 paper, revised in 2021) give the redshift of the oldest light as 1089.8 and the redshift when matter began to outweigh radiation as about 3,400 (3,387 to 3,407, depending on which data are combined). This experiment uses both as given values.
      </p>
    </div>
  )
}

// ---- the words box (the formulas that give guess 1 away appear only after the first run: §12) ----
function referenceEntries(afterRun: boolean) {
  const w = workedExamples()
  const entries = [
    { term: 'Density excess', meaning: `how much denser than average a region is. 0.1 means 10 percent denser: an average patch of ${w.grainsAverage} grains, this one ${w.grainsInRegion}. 1 means twice the average.` },
    { term: 'Growth', meaning: `how many times bigger the density excess has become since the region started. A region that starts ${partsInLabel(w.smallStartDelta)} denser and grows ${w.smallGrowth} times ends ${partsInLabel(w.smallEndDelta)} denser.` },
    { term: 'Clump', meaning: 'a region dense enough (a density excess of 1, twice the average) that it would pull itself together into a lump held together by its own gravity, such as a galaxy.' },
    { term: 'Ripple', meaning: 'a region that is slightly denser (or less dense) than average.' },
    { term: 'Redshift', meaning: 'a number that tells how long ago something was: a bigger redshift means an earlier time (Cosmology 1 and 8).' },
    { term: 'Ordinary matter', meaning: 'the matter that makes stars, planets and us, and that interacts with light.' },
    { term: 'Dark matter', meaning: 'matter we cannot see but whose gravity we can feel (Cosmology 4).' },
    { term: 'Dark energy', meaning: 'the cause of the speeding up of the expansion; 70 percent of the model’s universe (Cosmology 5).' },
    { term: 'The cosmic microwave background', meaning: 'the oldest light we can see, with temperature ripples of about 1 part in 100,000 (Cosmology 3; NASA’s COBE page).' },
    { term: 'Radiation (left out here)', meaning: 'the light and other very fast particles of the early universe. The model leaves it out, so the earliest times are rough.' },
    { term: 'Matter-radiation equality', meaning: 'the time when matter began to outweigh radiation; redshift about 3,400 (Planck 2018 gives 3,387 to 3,407). The model starts dark matter’s growth here.' },
    { term: 'Linear growth', meaning: 'the simple first stage of growth, while a region is still only slightly denser than average. This model only follows that stage.' },
    { term: 'Flat universe', meaning: 'space on the very largest scales is not curved, so straight parallel paths stay parallel.' },
    { term: 'Hubble constant and Hubble tension', meaning: '70 km/s per megaparsec in this model; published values range from about 67 to 73, the “Hubble tension”.' },
    { term: 'Megaparsec', meaning: 'a unit of distance: about 3.3 million light-years.' },
    { term: '“1 part in 100,000”', meaning: 'a difference of 1 in every 100,000, that is 0.00001, or 0.001 percent.' },
  ]
  if (afterRun) {
    entries.push(
      { term: 'Formula: density excess today, with a worked example', meaning: `starting size × growth. For a start of ${partsInLabel(w.exampleStartDelta)} and ordinary matter: ${w.exampleStartDelta} × ${w.exampleOrdinaryGrowth.toFixed(1)} ≈ ${w.exampleOrdinaryExcess.toFixed(2)}.` },
      { term: 'Formula: the starting size needed to be a clump', meaning: `1 ÷ growth. For ordinary matter: 1 ÷ ${w.exampleOrdinaryGrowth.toFixed(1)} = ${partsInLabel(1 / w.exampleOrdinaryGrowth)}.` },
      { term: 'Formula: growth with no dark energy', meaning: `1 + the start redshift. For ordinary matter: 1 + ${RECOMBINATION_REDSHIFT} = ${w.ordinaryWithoutDarkEnergy.toFixed(1)}; for the earlier start: 1 + ${MATTER_RADIATION_EQUALITY_REDSHIFT.toLocaleString('en-US')} = ${w.darkWithoutDarkEnergy.toLocaleString('en-US')}.` },
    )
  } else {
    entries.push({ term: 'More words', meaning: 'three more formulas appear here after your first run, because they give the size of the growth, which is what you are about to guess.' })
  }
  return entries
}

// ---- links (read on 2026-11-15 through a helper's fetch tool, which returns model summaries; see the draft's source table). The pages
// that say dark matter clumped first, and the two technical papers that give the growth formula and the 1.686, appear after the first Run
// (§12), because they say what the tutor asks about. ----
const LINKS_BEFORE: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://asd.gsfc.nasa.gov/archive/mather/cobe/science.html',
    label: 'NASA GSFC: COBE science results',
    what: 'John Mather’s page on COBE, the first satellite to measure the oldest light’s ripples: “only one part in 100,000”. (Read; last updated 11 April 2013.)',
  },
  {
    href: 'https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_reveals_an_almost_perfect_Universe',
    label: 'ESA: Planck reveals an almost perfect Universe (2013)',
    what: 'ESA’s plain page: the oldest light’s tiny temperature differences “correspond to regions of slightly different densities ... the seeds of all future structure”. (Read.)',
  },
  {
    href: 'https://www.jpl.nasa.gov/news/planck-mission-explores-the-history-of-our-universe/',
    label: 'NASA/JPL: Planck mission explores the history of our universe (2015)',
    what: 'Planck’s maps “show where matter had just begun to clump together into the seeds of the galaxies we see around us today”. (Read.)',
  },
  {
    href: 'https://arxiv.org/abs/1807.06209',
    label: 'Planck Collaboration (2018): cosmological parameters',
    what: 'the paper behind the oldest light’s redshift (1089.8) and the redshift when matter began to outweigh radiation (about 3,400). A technical paper; the abstract is the readable part. (Abstract and an HTML copy of Table 2 read.)',
  },
  {
    href: 'https://imagine.gsfc.nasa.gov/observatories/satellite/wmap/shape.html',
    label: 'NASA: The Shape of the Universe',
    what: 'the page behind the word “flat” in the assumptions. (Read for Cosmology 8.)',
  },
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/',
    label: 'NASA: the Hubble constant and the tension',
    what: 'NASA’s plain page behind the range 67 to 73. (Read for Cosmology 6 and 8; to be re-read.)',
  },
]
const LINKS_AFTER: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://www.jpl.nasa.gov/news/nasa-reveals-new-details-about-dark-matters-influence-on-universe/',
    label: 'NASA/JPL: NASA reveals new details about dark matter’s influence on the universe (26 January 2026)',
    what: '“Scientists think dark matter began to clump together first and that those dark matter clumps then pulled together regular matter.” (Read.)',
  },
  {
    href: 'https://science.nasa.gov/missions/hubble/nasa-hubble-maps-the-cosmic-web-of-clumpy-dark-matter-in-3-d/',
    label: 'NASA: Hubble maps the cosmic web of clumpy dark matter in 3-D (2007)',
    what: '“normal matter, including all stars and galaxies, collect within the densest concentrations of dark matter”. (Read.)',
  },
  {
    href: 'https://arxiv.org/abs/astro-ph/0006089',
    label: 'The growth approximation, printed in arXiv:astro-ph/0006089',
    what: 'a technical paper that quotes the Carroll, Press and Turner (1992) formula for how much a ripple grows; this page checks its own number against it. The 1992 paper itself was not read. (Read.)',
  },
  {
    href: 'https://arxiv.org/abs/1005.0233',
    label: 'Spherical collapse model in dark energy cosmologies (arXiv:1005.0233)',
    what: 'a technical paper that gives 1.686 as the linear density excess at which a region collapses, for a universe with matter only; this page’s clump line is a simpler 1. (Read.)',
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

export function StructureFormationExperiment({ onComplete, onTutorComplete }: StructureFormationExperimentProps) {
  const [growthGuess, setGrowthGuess] = useState<GrowthGuess | null>(null)
  const [headStartGuess, setHeadStartGuess] = useState<HeadStartGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ growth: GrowthGuess; headStart: HeadStartGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  const [part1Running, setPart1Running] = useState(false)
  const [part1Progress, setPart1Progress] = useState(0)
  const [explained, setExplained] = useState(false)

  // Part 2's two settings. The defaults are the preset where the earlier start decides whether a clump forms.
  const [kind, setKind] = useState<KindOfMatter>('ordinary-plus-dark')
  const [mode, setMode] = useState<StartMode>('preset')
  const [presetId, setPresetId] = useState('one-in-1000')
  const [customDelta, setCustomDelta] = useState(5e-4)
  // Part 2's pictures are drawn when its own Run is pressed; at rest they show the whole picture.
  const [part2Running, setPart2Running] = useState(false)
  const [part2Progress, setPart2Progress] = useState(1)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const hasAllGuesses = growthGuess !== null && headStartGuess !== null
  const locked = submitted !== null
  const shownGrowth = submitted?.growth ?? growthGuess
  const shownHeadStart = submitted?.headStart ?? headStartGuess
  const preset = START_SIZE_PRESETS.find((p) => p.id === presetId)!
  const startDelta = mode === 'preset' ? preset.startDelta : customDelta

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

  // Part 2's animation: the region grows from its start to today, over the same fixed duration.
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
    if (!submitted) setSubmitted({ growth: growthGuess!, headStart: headStartGuess! })
    setPart1Progress(0)
    setPart1Running(true)
  }

  // Changing a setting changes only Part 2's drawings: it never hides Parts 3 and 4 or restarts the tutor.
  const settle = () => {
    if (!part2Running) setPart2Progress(1)
  }
  const handleKindChange = (next: KindOfMatter) => {
    setKind(next)
    settle()
  }
  const handlePresetChange = (id: string) => {
    setMode('preset')
    setPresetId(id)
    settle()
  }
  const handleCustom = () => {
    setMode('custom')
    settle()
  }
  const handlePart2Run = () => {
    if (part2Running) return
    setPart2Progress(0)
    setPart2Running(true)
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    setGrowthGuess(null)
    setHeadStartGuess(null)
    setSubmitted(null)
    setPart1Done(false)
    setPart1Running(false)
    setPart1Progress(0)
    setExplained(false)
    setKind('ordinary-plus-dark')
    setMode('preset')
    setPresetId('one-in-1000')
    setCustomDelta(5e-4)
    setPart2Running(false)
    setPart2Progress(1)
  }

  const hasAnythingToClear = growthGuess !== null || headStartGuess !== null || locked || part1Done
  const startOverDisabled = !hasAnythingToClear || part1Running

  const started = part1Running || part1Done
  const shownProgress1 = part1Done ? 1 : part1Progress
  const result = runStructureFormationExperiment(kind, startDelta)
  const now = curveAt(result, part2Progress)
  const hasClumped = now.densityExcess >= CLUMP_THRESHOLD
  const sizeFactor = (1 + result.startRedshift) / (1 + now.redshift)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 9: How Did Galaxies Form? Growing Structure from Tiny Ripples</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 15 November 2026 through a helper&rsquo;s fetch tool, which returns summaries, so a quotation or figure on this page should be checked against the live page. No single official page says all of &ldquo;ripples of about 1 part in 100,000, dark matter clumped first, ordinary matter followed&rdquo;, so this page uses three. No official page was found that says how the oldest light&rsquo;s temperature ripples differ from the matter ripples, or a plain one that says ordinary matter is held smooth by light until the universe becomes transparent, so this page states both as the model&rsquo;s own assumptions. The savings-account picture has no source.
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
            <p style={smallNote}>Four more links, on dark matter clumping first and on the numbers behind the growth, appear here after your first Run, because their wording would give away what you are asked about.</p>
          )}
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make two guesses about how a slightly denser region of the early universe grows. Then you will press Run and watch a graph draw itself. It has two lines, one for <strong>ordinary matter</strong> (the matter in stars, planets and us) and one for <strong>dark matter</strong> (matter we cannot see, but whose gravity we can feel). Each line shows how many times the region&rsquo;s extra density grows. Your guesses are drawn on the graph in white. Nothing you guess changes the real graph.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="Guess 1: how much will the extra density grow? A region starts only slightly denser than average. Gravity pulls extra matter into it, which makes it denser still, while the expansion of space works against that. We follow it from the moment the oldest light was released until today. By today, how many times bigger will its extra density be than it was at the start? (For example, a region that starts 1 part in 1,000 denser and grows 10 times ends 1 part in 100 denser.) Choose the size you think is closest."
            guessText={optionText(growthChoices, shownGrowth)}
          >
            <ChoiceButtons options={growthChoices} selected={shownGrowth} disabled={locked || part1Running} onSelect={setGrowthGuess} />
          </Question>
          <Question prompt="Guess 2: what would a head start do? In this model, a region starts gathering matter at the moment the oldest light was released. Now imagine it could start earlier, before that moment, so it had more time to grow. Would that change the growth you guessed in Guess 1? Choose how big a difference you think it would make." guessText={optionText(headStartChoices, shownHeadStart)}>
            <ChoiceButtons options={headStartChoices} selected={shownHeadStart} disabled={locked || part1Running} onSelect={setHeadStartGuess} />
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
          <Block>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 1: the growth graph, how many times a ripple grows</p>
            <GrowthGraph progress={shownProgress1} finished={part1Done} guesses={part1Done ? submitted : null} />
            <Part1GrowthCaption arrived={part1Done} />
          </Block>
        )}

        {part1Done && (
          <Block>
            <WhereFrom>
              <strong>Calculated here:</strong> both lines, the dashed lines and every number, for a flat universe with 70 percent dark energy and a Hubble constant of 70, without radiation (the model of Cosmology 1, 2, 5 and 8), by the growth formula in the Words and formulas box. <strong>Given by others, not worked out here:</strong> the oldest light&rsquo;s redshift, {RECOMBINATION_REDSHIFT}, and the redshift when matter began to outweigh radiation, about {MATTER_RADIATION_EQUALITY_REDSHIFT.toLocaleString('en-US')} (Planck 2018; see Table 1). <strong>Your guess:</strong> the white marks only. Nothing on this page is imagined.
            </WhereFrom>
          </Block>
        )}
        {!started && <p style={smallNote}>After you press Run, the two lines draw themselves, with a caption under the graph. When the run ends the numbers at the end of each line, your white guess marks and a &ldquo;Where the real picture comes from&rdquo; note appear, and Parts 2, 3 and 4 appear below.</p>}
        {started && !part1Done && <p style={smallNote}>The numbers at the end of each line, your white guess marks and Parts 2, 3 and 4 appear when the run ends.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose what kind of matter is gathering and how much denser than average your region starts. Press Run and watch your own region grow, in a strip, on a graph and against the sizes needed to become a clump. Your guesses do not change anything in this part; your choices do.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>What matter is gathering:</p>
              {(['ordinary', 'ordinary-plus-dark'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleKindChange(option)}
                  className={`toggle-button${kind === option ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {kindLabels[option]}
                  {option === 'ordinary' ? ` (starts at redshift ${RECOMBINATION_REDSHIFT})` : ` (starts at redshift ${MATTER_RADIATION_EQUALITY_REDSHIFT.toLocaleString('en-US')})`}
                </button>
              ))}
              <p style={{ ...smallNote, marginTop: '0.25rem' }}>
                For ordinary plus dark matter this model lets a region start growing earlier, at redshift about {MATTER_RADIATION_EQUALITY_REDSHIFT.toLocaleString('en-US')} (when matter began to outweigh radiation), instead of at the oldest light&rsquo;s release. That earlier start is a given value, not something the model works out, and what dark matter is made of is not specified (Cosmology 4).
              </p>

              <p style={{ fontWeight: 'bold', margin: '1rem 0 0.5rem' }}>How much denser than average the early region starts (its starting density excess):</p>
              {START_SIZE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetChange(p.id)}
                  className={`toggle-button${mode === 'preset' && presetId === p.id ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {p.label}
                </button>
              ))}
              <button type="button" onClick={handleCustom} className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                Custom
              </button>
              {mode === 'custom' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="structure-start-delta" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Starting density excess: {partsInLabel(customDelta)}
                  </label>
                  <input
                    id="structure-start-delta"
                    type="range"
                    min={0}
                    max={SLIDER_STEPS}
                    step={1}
                    value={deltaToSlider(customDelta)}
                    onChange={(event) => {
                      setCustomDelta(sliderToDelta(Number(event.target.value)))
                      settle()
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <button type="button" className="action-button" onClick={handlePart2Run} disabled={part2Running} style={{ padding: '0.5rem 1.5rem' }}>
                  {part2Running ? 'Running...' : 'Run: watch your region grow'}
                </button>
              </div>
              <p style={smallNote}>
                Your guesses are locked while you try other settings. Your guesses do not change the drawings or tables, but these settings do: they change the strip, Picture 3 and the pink row in Part 3. These starting sizes are <strong>trial values</strong>: they show what would happen for a region that starts that much denser, and they do not say the real universe started that way. The starting size is your own illustrative choice, not a measurement.
              </p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', marginBottom: 0 }}>
                Chosen: <strong style={{ color: YOUR_COLOR }}>{kindLabels[kind].toLowerCase()}</strong>, starting size <strong style={{ color: YOUR_COLOR }}>{partsInLabel(startDelta)}</strong>
                <br />
                Time since the Big Bang: <strong>{yearsLabel(now.yearsAfterBigBang)}</strong> &nbsp;|&nbsp; Redshift: {redshiftLabel(now.redshift)}
                <br />
                The ripple has grown <strong>{now.growth.toFixed(1)}</strong> times &nbsp;|&nbsp; Space has stretched {sizeFactor.toFixed(1)} times since the start
                <br />
                Density excess: {hasClumped ? `${CLUMP_THRESHOLD} or more (a clump has formed)` : now.densityExcess.toPrecision(2)}
              </p>
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 2: the strip, your region growing</p>
              <StripPicture kind={kind} startDelta={startDelta} progress={part2Progress} />
              <StripCaption />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 3: your ripple, how much denser than average</p>
              <ExcessGraph kind={kind} startDelta={startDelta} progress={part2Progress} />
              <ExcessCaption kind={kind} startDelta={startDelta} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 4: how big must a ripple start to become a clump by today?</p>
              <NeededSizePicture startDelta={startDelta} />
              <NeededSizeCaption kind={kind} startDelta={startDelta} />
            </Block>
            <Block>
              <WhereFrom>
                <strong>Calculated here:</strong> every line and number, from the growth formula; the strip&rsquo;s dots are drawn at the model&rsquo;s true density excess. <strong>Given by others:</strong> the two start redshifts (Planck 2018). <strong>An illustration, not computed:</strong> the green glow and the split of dots into amber and violet. <strong>Your choice:</strong> the kind of matter and the starting size (trial values). Nothing here is imagined.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              These are the results of your first run, with what each table means. The numbers come from the physics and do not change with your guesses; only the pink row follows your settings in Part 2.
            </PartHeader>
            <StructureFormationResults guesses={submitted} kind={kind} startDelta={startDelta} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks you three questions about what you saw, then explains it and goes through your two guesses.
            </PartHeader>
            {submitted && (
              <StructureFormationTutor
                predictedGrowth={submitted.growth}
                predictedHeadStart={submitted.headStart}
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
    </div>
  )
}
