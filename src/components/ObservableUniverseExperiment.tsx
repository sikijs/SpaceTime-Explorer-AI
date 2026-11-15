import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  CMB_REDSHIFT,
  GALAXY_A_REDSHIFT,
  MAX_REDSHIFT,
  MIN_REDSHIFT,
  PLANCK_AGE_YEARS,
  SOURCE_PRESETS,
  runObservableUniverseExperiment,
  workedExamples,
} from '../physics/observableUniverseExperiment'
import type { LeftGuess, TodayGuess } from '../physics/observableUniverseExperiment'
import { ObservableUniverseResults } from './ObservableUniverseResults'
import { ObservableUniverseTutor } from './ObservableUniverseTutor'
import {
  DistanceGraph,
  DistancePicture,
  OwnSourcePicture,
  Part1DistanceCaption,
  Part1GraphCaption,
  Part2Caption,
  YOUR_SOURCE_COLOR,
  distanceLabel,
  redshiftLabel,
} from './ObservableUniversePictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 8, audited to the newer rules (docs/audit/cosmology/08-draft-wording.md, approved by the owner on 2026-11-15).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a real
// picture or table; they are drawn in white once the run has finished (§14, "Predictions and the Real Results").

interface ObservableUniverseExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type SourceMode = 'preset' | 'custom'

// One run is a fixed real duration, whatever the source (CLAUDE.md §11): playback speed never changes the result.
const ANIMATION_DURATION_MS = 8000

// The two guess questions are kept exactly as the owner approved them on 2026-10-08.
const todayChoices: Array<{ value: TodayGuess; label: string }> = [
  { value: 'less', label: 'Less than 10 billion light-years' },
  { value: 'about', label: 'About 10 billion light-years' },
  { value: 'more', label: 'More than 10 billion light-years' },
]
const leftChoices: Array<{ value: LeftGuess; label: string }> = [
  { value: 'thirteen', label: 'About 13 billion light-years' },
  { value: 'few', label: 'A few billion light-years' },
  { value: 'closer', label: 'Far closer than that, under 100 million light-years' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

// The custom slider moves along a scale where each step multiplies, so low and high redshifts are both easy to pick.
const SLIDER_STEPS = 1000
const sliderToRedshift = (position: number) => MIN_REDSHIFT * (MAX_REDSHIFT / MIN_REDSHIFT) ** (position / SLIDER_STEPS)
const redshiftToSlider = (redshift: number) => Math.round((Math.log(redshift / MIN_REDSHIFT) / Math.log(MAX_REDSHIFT / MIN_REDSHIFT)) * SLIDER_STEPS)

// ---- the introduction (the owner's approved wording, 2026-11-15; no answers given: §12) ----
function Intro() {
  const p = { marginTop: 0, marginBottom: '0.75rem' } as const
  const list = { marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' } as const
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={p}>
        <strong>The question.</strong> The universe is about 13.8 billion years old (Planck 2018: {(PLANCK_AGE_YEARS / 1e9).toFixed(3)} billion), so the oldest light we can see has been travelling for about that long. Light covers one light-year in a year. So you might expect that the farthest we could possibly see is about 13.8 billion light-years. How far away are the things we see, and how big is the part of the universe we can see?
      </p>
      <p style={p}>
        <strong>What happens.</strong> You will look at the light of two very distant sources. For each one you will see <strong>three distances</strong>: how far its light travelled, how far away the source is <strong>today</strong>, and how far away it was <strong>when the light left</strong> it. First you make two guesses. Then you press <strong>Run</strong>, the light is sent from each source to Earth, and two pictures show the distances. Your guesses are drawn on the pictures in white. In <strong>Part 2</strong> you choose any source you like and see its three distances. The results and a tutor follow.
      </p>
      <p style={p}>
        <strong>Step 1: what &ldquo;far&rdquo; means for light.</strong> A <strong>light-year</strong> is the distance light travels in one year, about 9.5 million million kilometres. Because light takes time to travel, every picture of the sky shows the past. A firework burst a kilometre away reaches your eyes a moment after it happened. A star ten light-years away shows you the star as it was ten years ago. The farther the source, the older the light we receive from it. (This is an everyday comparison, not a measurement.)
      </p>
      <p style={p}>
        <strong>Step 2: the oldest light.</strong> In Cosmology 3 you met the <strong>cosmic microwave background</strong>: the oldest light we can see, which left its source when the universe was very young, about 380,000 years after the Big Bang (ESA and NASA/JPL give 380,000 and 370,000 years for the same release). It has been travelling toward us ever since. In this experiment it is called <strong>Source B</strong>.
      </p>
      <p style={p}>
        <strong>Step 3: redshift, a reminder.</strong> In Cosmology 1 you met <strong>redshift</strong>: a number that tells how much the light&rsquo;s colour was shifted toward red on its way to us. A bigger redshift means light that left earlier. A galaxy at redshift 2 (<strong>Galaxy A</strong>) sent its light about ten billion years ago. The oldest light has a redshift of about 1090.
      </p>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>Step 4: three distances for one source.</strong> For any source there are three different questions you can ask about distance, and this experiment is about how they compare:
      </p>
      <ul style={list}>
        <li>
          <strong>How far the light travelled:</strong> the length of the light&rsquo;s own journey, found from how long it has been on its way, multiplied by the speed of light.
        </li>
        <li>
          <strong>How far away the source is today:</strong> if you could freeze everything at this exact moment and stretch a measuring tape from Earth to the source, how long would the tape be? (This is a way of <em>defining</em> a distance across the whole universe at one moment. No signal could measure it.)
        </li>
        <li>
          <strong>How far away it was when the light left:</strong> the length that same tape would have had at the moment the light set off.
        </li>
      </ul>
      <p style={p}>
        <strong>Step 5: the units.</strong> These distances are so large that they are given in <strong>billions of light-years</strong>; one billion is a thousand million. One <strong>megaparsec (Mpc)</strong> is about 3.3 million light-years; Hubble&rsquo;s Law in Cosmology 1 used it.
      </p>
      <p style={p}>
        <strong>Step 6: why ask this at all.</strong> Every picture of the sky is made of light that has had time to reach us, so the limit on how far we can see is a limit on what we can ever study. Astronomers give a number for how far away the edge of the observable universe is. How is that number found, and is it set only by how old the universe is? The three distances for your two sources are the way into that question.
      </p>
      <p style={p}>
        <strong>Your job.</strong> First, make two guesses about distances to the two sources. Then press Run. Afterwards, in Part 2, pick a source of your own.
      </p>
      <p style={p}>
        <strong>What to look for.</strong> <strong>Look at:</strong> the three bars for each source. <strong>What it means:</strong> they are three different distances for one source. <strong>Why it matters:</strong> how they compare is the whole question of this experiment. In Part 2, look at how the bars change as you choose sources whose light left earlier.
      </p>
      <p style={p}>
        <strong>How this page is laid out.</strong> Below this introduction the page has four parts. <strong>Part 1</strong> is where you guess and watch. <strong>Part 2</strong> is where you try your own source. <strong>Part 3</strong> shows the results and what they mean. <strong>Part 4</strong> is the tutor. Parts 2, 3 and 4 appear when your first run has finished.
      </p>
      <p style={p}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables. They are drawn on the real picture in <strong>white</strong>, in a box labelled YOUR GUESS, after the run, and shown again beside the results. The real pictures come from the physics. The source you choose in Part 2 does change Picture 3, the pink line on the graph and the pink row of the table, but never the Part 1 pictures. If you change a guess, press Run and see nothing change, that is not a fault: a guess is only a guess.
      </p>
      <p style={{ ...p, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={list}>
        <li>
          The same simplified universe as Cosmology 5 and 6: &ldquo;flat&rdquo; (space on the very largest scales is not curved, so straight parallel paths stay parallel), with matter and a constant dark energy (70 percent), and an illustrative Hubble constant of 70 km/s per megaparsec. Published values range from about 67 to 73: the &ldquo;Hubble tension&rdquo;. In this model the universe is <strong>13.47 billion years old</strong>; the real age is about 13.8 billion.
        </li>
        <li>
          <strong>Radiation</strong> (the light and other very fast particles of the early universe) is left out, as in Cosmology 5 and 6. This matters most for the earliest times, and the results will show how much difference it makes.
        </li>
        <li>The source stays at a fixed spot in the stretching space, with no motion of its own through space.</li>
        <li>The light travels along a straight line to Earth, and nothing blocks or bends it.</li>
        <li>&ldquo;Distance today&rdquo; is a way of defining a distance across all of space at one moment, not something a signal could measure.</li>
        <li>The cosmic microwave background stands in for &ldquo;the farthest we can see with light.&rdquo; The true edge of the observable universe is slightly farther, and is not computed here.</li>
        <li>Real reference values are given for comparison and are not worked out here.</li>
        <li>Nothing here says how large the whole universe is. The observable universe is only the part we can see. The universe may be much larger, and this experiment does not say (NASA and ESA say so too).</li>
      </ul>
      <p style={{ ...p, marginBottom: 0 }}>
        <strong>Some new words:</strong> observable universe, light-year, redshift, cosmic microwave background, distance today, distance when the light left, megaparsec. All are in the Words and formulas box below.
      </p>
    </div>
  )
}

// ---- the words box (the formulas that give guess 2's answer appear only after the first run: §12) ----
function referenceEntries(afterRun: boolean) {
  const w = workedExamples()
  const entries = [
    { term: 'Observable universe', meaning: 'the part of the universe whose light has had time to reach us. It is not an edge of space, only a limit on what we can see.' },
    { term: 'Light-year', meaning: 'the distance light travels in one year, about 9.5 million million kilometres.' },
    { term: 'Billion', meaning: 'a thousand million.' },
    { term: 'Redshift', meaning: 'a number that tells how much the light’s colour was shifted toward red on its way to us. A bigger redshift means light that left earlier (Cosmology 1).' },
    { term: 'Cosmic microwave background', meaning: 'the oldest light we can see, which left its source when the universe was very young, about 370,000 to 380,000 years after the Big Bang (Cosmology 3). Source B here.' },
    { term: 'Light-travel time (look-back time)', meaning: 'how long the light has been on its way to us.' },
    { term: 'Distance today', meaning: 'the length of a measuring tape stretched from Earth to the source at this exact moment. A way of defining a distance, not something a signal could measure.' },
    { term: 'Distance when the light left', meaning: 'the length the same tape had at the moment the light set off.' },
    { term: 'Megaparsec (Mpc)', meaning: 'a unit of distance: about 3.3 million light-years.' },
    { term: 'Hubble constant', meaning: 'how fast the distance to a galaxy grows for each megaparsec it is away: 70 km/s per Mpc in this model (Cosmology 1).' },
    { term: 'Flat universe', meaning: 'space on the very largest scales is not curved, so straight parallel paths stay parallel.' },
    { term: 'Dark energy', meaning: 'the cause of the speeding up of the expansion; 70 percent of the model’s universe (Cosmology 5).' },
    { term: 'Radiation (left out here)', meaning: 'the light and other very fast particles of the early universe. The model leaves it out, which matters most at the earliest times.' },
    { term: 'Particle horizon', meaning: 'the edge of the observable universe: the farthest from which any signal could have reached us by now. Not computed here.' },
    { term: 'Hubble tension', meaning: 'the small disagreement between two ways of measuring the expansion rate: about 67 to 73 (Cosmology 1 and 6).' },
    { term: 'Formula: distance the light travelled', meaning: `travel time × the speed of light. For the oldest light: ${(w.travelYears / 1e9).toFixed(2)} billion years × 1 light-year per year = ${(w.travelLightYears / 1e9).toFixed(2)} billion light-years.` },
  ]
  if (afterRun) {
    entries.push(
      {
        term: 'Formula: the distance when the light left, with a worked example',
        meaning: `distance today ÷ (1 + z). For the oldest light: ${(w.todayLightYears / 1e9).toFixed(2)} billion ÷ ${w.stretchingFactor.toFixed(1)} = ${Math.round(w.leftLightYears / 1e6)} million light-years.`,
      },
      {
        term: 'Formula: recession speed, with a worked example',
        meaning: `H0 × distance today. For the oldest light: ${w.hubbleConstant} km/s per Mpc × about ${Math.round(w.distanceTodayMpc).toLocaleString('en-US')} Mpc ≈ ${(Math.round(w.recessionSpeedKmPerS / 1000) * 1000).toLocaleString('en-US')} km/s, about ${w.recessionSpeedOverC.toFixed(1)} times the speed of light.`,
      },
    )
  } else {
    entries.push({ term: 'More words', meaning: 'two more formulas appear here after your first run, because they show how the three distances are linked, which is what you are about to guess.' })
  }
  return entries
}

// ---- links (read on 2026-11-15 through a helper's fetch tool, which returns model summaries; see the draft's source table). The page that
// says expansion is of space appears after the first Run (§12), because it says what the tutor asks about. ----
const LINKS_BEFORE: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://arxiv.org/abs/1807.06209',
    label: 'Planck Collaboration (2018): cosmological parameters',
    what: 'the paper behind the universe’s age (13.787 billion years) and the oldest light’s redshift (1089.8). A technical paper; the abstract is the readable part. (Abstract and an HTML copy read.)',
  },
  {
    href: 'https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background',
    label: 'ESA: Planck and the cosmic microwave background (2013)',
    what: 'ESA’s plain page on the oldest light and when it was released, about 380,000 years after the Big Bang. (Read.)',
  },
  {
    href: 'https://imagine.gsfc.nasa.gov/observatories/satellite/wmap/shape.html',
    label: 'NASA: The Shape of the Universe',
    what: 'NASA’s page on how the WMAP satellite found that space is flat, the word the assumptions use. (Read.)',
  },
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/',
    label: 'NASA: the Hubble constant and the tension',
    what: 'NASA’s plain page behind the range 67 to 73 quoted in the assumptions. (Read for Cosmology 6; to be re-read.)',
  },
  {
    href: 'https://esa.int/Science_Exploration/Space_Science/Is_the_Universe_finite_or_infinite_An_interview_with_Joseph_Silk',
    label: 'ESA: Is the Universe finite or infinite? An interview with Joseph Silk (2003)',
    what: 'an old ESA interview on whether the whole universe is bigger than the part we can see. (Read; dated 2003.)',
  },
]
const LINKS_AFTER: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://imagine.gsfc.nasa.gov/ask_astro/cosmology.html',
    label: 'NASA: Ask an Astrophysicist, cosmology',
    what: 'NASA’s question-and-answer page: expansion is of space itself, and it does not break relativity’s speed limit. Entries from 2003 to 2010; its 1997 answer about the size of the observable universe is out of date and should be skipped. (Read.)',
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

export function ObservableUniverseExperiment({ onComplete, onTutorComplete }: ObservableUniverseExperimentProps) {
  const [todayGuess, setTodayGuess] = useState<TodayGuess | null>(null)
  const [leftGuess, setLeftGuess] = useState<LeftGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ today: TodayGuess; left: LeftGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  const [part1Running, setPart1Running] = useState(false)
  const [part1Progress, setPart1Progress] = useState(0)
  const [explained, setExplained] = useState(false)

  // Part 2's source. The first preset is neither of Part 1's two sources, so the first look at Part 2 shows something new.
  const [mode, setMode] = useState<SourceMode>('preset')
  const [presetId, setPresetId] = useState(SOURCE_PRESETS[0].id)
  const [customRedshift, setCustomRedshift] = useState(5)
  // Part 2's bars are drawn when its own Run is pressed; at rest they show the whole picture.
  const [part2Running, setPart2Running] = useState(false)
  const [part2Progress, setPart2Progress] = useState(1)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const hasAllGuesses = todayGuess !== null && leftGuess !== null
  const locked = submitted !== null
  const shownToday = submitted?.today ?? todayGuess
  const shownLeft = submitted?.left ?? leftGuess
  const preset = SOURCE_PRESETS.find((p) => p.id === presetId)!
  const redshift = mode === 'preset' ? preset.redshift : customRedshift

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

  // Part 2's animation: the bars grow over the same fixed duration.
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
    if (!submitted) setSubmitted({ today: todayGuess!, left: leftGuess! })
    setPart1Progress(0)
    setPart1Running(true)
  }

  // Changing the source changes only Part 2's drawings: it never hides Parts 3 and 4 or restarts the tutor.
  const handlePresetChange = (id: string) => {
    setMode('preset')
    setPresetId(id)
    if (!part2Running) setPart2Progress(1)
  }
  const handleCustom = () => {
    setMode('custom')
    if (!part2Running) setPart2Progress(1)
  }
  const handlePart2Run = () => {
    if (part2Running) return
    setPart2Progress(0)
    setPart2Running(true)
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    setTodayGuess(null)
    setLeftGuess(null)
    setSubmitted(null)
    setPart1Done(false)
    setPart1Running(false)
    setPart1Progress(0)
    setExplained(false)
    setMode('preset')
    setPresetId(SOURCE_PRESETS[0].id)
    setCustomRedshift(5)
    setPart2Running(false)
    setPart2Progress(1)
  }

  const hasAnythingToClear = todayGuess !== null || leftGuess !== null || locked || part1Done
  const startOverDisabled = !hasAnythingToClear || part1Running

  const started = part1Running || part1Done
  const shownProgress1 = part1Done ? 1 : part1Progress
  const own = runObservableUniverseExperiment(redshift)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 8: How Far Can We See? The Observable Universe</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 15 November 2026 through a helper&rsquo;s fetch tool, which returns summaries, so a quotation or figure on this page should be checked against the live page. No plain official page was found that gives the observable universe&rsquo;s radius (about 46 billion light-years) or explains why it is larger than the universe&rsquo;s age in years, and none prints the oldest light&rsquo;s distance today, so this page shows the two published figures it found and says where each comes from. The firework and rubber-band pictures are everyday comparisons and have no source.
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
              <p style={{ ...smallNote, marginBottom: '0.25rem' }}>One more link, now that you have run it:</p>
              <ul style={listStyle}>
                {LINKS_AFTER.map((l) => (
                  <li key={l.href} style={{ marginBottom: '0.5rem' }}>
                    <ExternalLink href={l.href}>{l.label}</ExternalLink>: {l.what}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p style={smallNote}>One more link, on how expansion is the stretching of space, appears here after your first Run, because its wording would give away what the tutor asks about.</p>
          )}
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make two guesses about distances to two faraway sources. Then you will press Run and watch light travel from each of them to Earth, with two pictures to show the three distances for each. Your guesses are drawn on the pictures in white. Nothing you guess changes the real pictures.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question prompt="A galaxy's light has been travelling toward us for 10 billion years. How far away is that galaxy today?" guessText={optionText(todayChoices, shownToday)}>
            <ChoiceButtons options={todayChoices} selected={shownToday} disabled={locked || part1Running} onSelect={setTodayGuess} />
          </Question>
          <Question prompt="The oldest light we can see left its source when the universe was very young. How far away was that source when the light left it?" guessText={optionText(leftChoices, shownLeft)}>
            <ChoiceButtons options={leftChoices} selected={shownLeft} disabled={locked || part1Running} onSelect={setLeftGuess} />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your guesses are locked while you try other sources. To change them, press Start over. Start over clears your guesses, the runs, the results and the tutor.
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
          <>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 1: the three distances for Galaxy A and Source B</p>
              <DistancePicture progress={shownProgress1} finished={part1Done} guesses={part1Done ? submitted : null} />
              <Part1DistanceCaption started={started} arrived={part1Done} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 2: the graph, the three distances for every source</p>
              <DistanceGraph
                marks={[
                  { redshift: GALAXY_A_REDSHIFT, label: 'Galaxy A', color: '#e2e8f0' },
                  { redshift: CMB_REDSHIFT, label: 'Source B', color: '#e2e8f0' },
                ]}
              />
              <Part1GraphCaption arrived={part1Done} />
            </Block>
          </>
        )}

        {part1Done && (
          <Block>
            <WhereFrom>
              <strong>Calculated here:</strong> every bar, curve and distance, for a flat universe with 70 percent dark energy and a Hubble constant of 70, without radiation (the model of Cosmology 1, 2, 5 and 6), by the formulas in the Words and formulas box. <strong>Measured by others, given here, not worked out:</strong> the redshift of the oldest light, 1089.8, the universe&rsquo;s age of {(PLANCK_AGE_YEARS / 1e9).toFixed(3)} billion years (Planck 2018) and the real distances used for comparison in the results (about 45.2 to 45.7 billion light-years for the oldest light&rsquo;s source and about 46.1 to 46.5 for the edge of the observable universe; Table 1 says where each figure comes from). <strong>Your guess:</strong> the white marks only. Nothing on this page is imagined.
            </WhereFrom>
          </Block>
        )}
        {!started && <p style={smallNote}>After you press Run, the blue, gold and green bars for Galaxy A and Source B are drawn, with a graph and a caption under each picture. When the run ends your white guess marks and a &ldquo;Where the real picture comes from&rdquo; note appear, and Parts 2, 3 and 4 appear below.</p>}
        {started && !part1Done && <p style={smallNote}>Your white guess marks and Parts 2, 3 and 4 appear when the run ends.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the source. Press Run and its three distances are drawn, in the same colours as before, beside Part 1&rsquo;s. Your guesses do not change anything in this part; your source does.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The source whose light travels to Earth (a larger redshift means light that left earlier):</p>
              {SOURCE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetChange(p.id)}
                  className={`toggle-button${mode === 'preset' && presetId === p.id ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {p.label} (redshift {p.redshift === CMB_REDSHIFT ? '1089.8' : p.redshift})
                </button>
              ))}
              <button type="button" onClick={handleCustom} className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                Custom
              </button>
              {mode === 'custom' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="observable-redshift" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Source redshift: {redshiftLabel(customRedshift)}
                  </label>
                  <input
                    id="observable-redshift"
                    type="range"
                    min={0}
                    max={SLIDER_STEPS}
                    step={1}
                    value={redshiftToSlider(customRedshift)}
                    onChange={(event) => {
                      setCustomRedshift(sliderToRedshift(Number(event.target.value)))
                      if (!part2Running) setPart2Progress(1)
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <button type="button" className="action-button" onClick={handlePart2Run} disabled={part2Running} style={{ padding: '0.5rem 1.5rem' }}>
                  {part2Running ? 'Running...' : 'Run: draw the bars for your source'}
                </button>
              </div>
              <p style={smallNote}>
                Your guesses are locked while you try other sources. Your guesses do not change the drawings or tables, but this source does: it changes Picture 3, the pink line on the graph and the pink row in Part 3. Redshift 2 and the oldest light are also in Part 1, so choose another to see something new. These sources are <strong>trial values</strong>: they show what the model gives for a source with that redshift, and they do not say that a real galaxy is like that.
              </p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', marginBottom: 0 }}>
                Chosen redshift: <strong style={{ color: YOUR_SOURCE_COLOR }}>{redshiftLabel(redshift)}</strong> &nbsp;|&nbsp; Every distance has grown by a factor of {own.stretchingFactor.toFixed(2)} since the light left
                <br />
                Light travelled: {distanceLabel(own.lightTravelYears)}
                <br />
                Source today: {distanceLabel(own.distanceTodayLightYears)}
                <br />
                Source when the light left: {distanceLabel(own.distanceWhenLightLeftLightYears)}
              </p>
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 3: the three distances for your source</p>
              <OwnSourcePicture redshift={redshift} progress={part2Progress} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The graph again, with your source marked in pink</p>
              <DistanceGraph marks={[{ redshift, label: 'Your source', color: YOUR_SOURCE_COLOR }]} />
              <Part2Caption redshift={redshift} />
            </Block>
            <Block>
              <WhereFrom>
                <strong>Calculated here</strong> from the source you chose: the bars, the pink line and dots and the numbers in the pink row of Part 3. The Part 1 pictures are the same as before. <strong>Your choice:</strong> the source (a trial value). Nothing here is imagined.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              These are the results of your first run, with what each table means. The numbers come from the physics and do not change with your guesses; only the pink row follows your source in Part 2.
            </PartHeader>
            <ObservableUniverseResults guesses={submitted} redshift={redshift} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks you three questions about what you saw, then explains it and goes through your two guesses.
            </PartHeader>
            {submitted && (
              <ObservableUniverseTutor
                predictedToday={submitted.today}
                predictedLeft={submitted.left}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            )}
            {explained && <p style={{ ...smallNote, marginTop: '1rem' }}>You have reached the tutor&rsquo;s explanation. You can still try another source in Part 2; the tutor does not restart.</p>}
          </>
        )}
      </div>
    </div>
  )
}
