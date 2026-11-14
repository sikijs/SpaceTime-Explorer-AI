import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { GALAXY_PRESETS } from '../physics/hubblesLawExperiment'
import {
  MAX_OWN_GALAXY_DISTANCE_MPC,
  MIN_OWN_GALAXY_DISTANCE_MPC,
  bigBangWorkedExample,
  galaxyTimeRow,
} from '../physics/bigBangExperiment'
import type { AgeGuess, TimeGuess } from '../physics/bigBangExperiment'
import { BigBangPicture, Part1Caption, Part2Caption, fmtBillions } from './BigBangPictures'
import type { PictureGalaxy } from './BigBangPictures'
import { BigBangResults } from './BigBangResults'
import { BigBangTutor } from './BigBangTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 2, audited to the newer rules (docs/audit/cosmology/02-draft-wording.md, approved by the owner on 2026-11-14).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a
// real picture or table; they are drawn in white once the backward run has finished (§14, "Predictions and the Real Results").

interface BigBangExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// One run is a fixed real duration, whatever the (here distance-independent) Hubble time being played back (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 4500

const fmtMpc = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(1))))

const timeChoices: Array<{ value: TimeGuess; label: string }> = [
  { value: 'longer', label: 'Longer' },
  { value: 'shorter', label: 'Shorter' },
  { value: 'same', label: 'The same' },
]
const ageChoices: Array<{ value: AgeGuess; label: string }> = [
  { value: 'muchLonger', label: 'Much longer' },
  { value: 'muchShorter', label: 'Much shorter' },
  { value: 'close', label: 'Close, but not exact' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

type PresetKey = 'virgo' | 'coma' | 'far'
const PRESET_KEYS: PresetKey[] = ['virgo', 'coma', 'far']
const PRESET_SHORT: Record<PresetKey, string> = { virgo: 'Virgo Cluster', coma: 'Coma Cluster', far: 'Distant galaxy' }
const PRESET_LABEL_OFFSET: Record<PresetKey, number> = { virgo: -40, coma: 34, far: -56 }

function presetGalaxies(highlight: PresetKey): PictureGalaxy[] {
  return PRESET_KEYS.map((key, i) => ({
    key,
    label: `${GALAXY_PRESETS[i].label} (${fmtMpc(GALAXY_PRESETS[i].distanceMpc)} Mpc)`,
    shortLabel: PRESET_SHORT[key],
    distanceMpc: GALAXY_PRESETS[i].distanceMpc,
    highlighted: key === highlight,
    labelYOffset: PRESET_LABEL_OFFSET[key],
  }))
}

// ---- the introduction (no answers: §12) ----
function Intro() {
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>The question.</strong> In Cosmology 1 you found a rule linking a galaxy&rsquo;s distance to how fast it is moving away from us (Hubble&rsquo;s Law). If every distant galaxy is moving away, what happens if we run that backward in time?
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>What happens.</strong> Running the rule backward lets us ask, for any galaxy, how long ago its distance from us would have been zero, if it had always moved at its present speed. That moment is popularly called <strong>the Big Bang</strong>, and the time back to it is
        called the <strong>Hubble time</strong>. Physicists call this starting moment a <strong>singularity</strong>: not a place you could travel to or examine, but the point where this simplified model&rsquo;s distances and timeline both reach zero. What actually happens there needs
        physics (quantum gravity) that this experiment does not model.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>What the Big Bang was not.</strong> Almost everyone has heard of the Big Bang, but the name is misleading. It was not an explosion in one place, with empty space around it for the blast to spread into, and the universe has no centre. A better picture is{' '}
        <strong>space itself stretching</strong>, the same stretching you met in Cosmology 1. NASA&rsquo;s John Mather, a Nobel laureate, calls &ldquo;Big Bang&rdquo; &ldquo;a really misleading name for the expanding universe that we see&rdquo; (see the links).
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A puzzle the Big Bang has to answer: why does the whole sky match?</strong>
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>The glow.</strong> Look at the faint glow that fills the whole sky, left over from the early universe. NASA calls it the universe&rsquo;s &ldquo;baby picture&rdquo;: light that was set free about 380,000 years after the beginning. Point a telescope one way, then point
          it the exact opposite way, and the glow has almost exactly the same temperature in both. The differences are tiny.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>Why that is strange.</strong> Think of two cups of tea. They only end up at the same temperature if heat can pass between them, or if they were poured from the same pot. For two parts of space to match, something has to pass between them, such as heat or light. And
          nothing travels faster than light.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>The catch.</strong> When that glow was set free, the universe was only about 380,000 years old, so light had only had 380,000 years to travel. But the two patches of sky we are looking at were already far, far farther apart than that. Light from one could never have
          reached the other. They had never been in touch, never swapped heat or light, and yet they match.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>A picture of it.</strong> Imagine two strangers who have never met, never phoned and never seen each other, and who turn up wearing exactly the same outfit. Once could be luck. Now imagine it happening across the whole sky, thousands of separate patches all matching.
          Physicists call this the <strong>horizon problem</strong>. Each patch has a &ldquo;horizon&rdquo;: the farthest it could have heard from, set by how far light could travel in the time available.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>The leading idea: cosmic inflation.</strong> Picture a wrinkled bedsheet. Take one small square of it that happens to be perfectly smooth, then stretch it so fast and so far that it covers a whole football field. The field looks smooth everywhere, not because
          every part was smoothed out, but because it all came from that one smooth square. <strong>Inflation</strong> says something like that happened to space itself, in the first tiny fraction of a second. The part of the universe we can see began as one tiny patch, small enough
          to have evened out, and was then stretched to fill the whole sky.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>How sure are we?</strong> Inflation is a current theory, not a settled fact. NASA&rsquo;s pages say we do not know what triggered it, and that scientists are still looking for signs of it, for example in that same glow.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>Why it is here.</strong> This page runs the expansion backward at one steady speed, which is a simplification. The puzzle is a reminder that the real early universe held surprises that a steady-speed run cannot show.
        </li>
      </ol>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>A daily-life picture.</strong> This is the same reasoning as noticing that a candle has been burning down at a steady rate and asking: at that rate, how long ago was it full length? You do not have to have watched it burn the whole time: today&rsquo;s length and the
        burning rate are enough to work backward. This experiment does the same for each galaxy&rsquo;s distance and speed.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>Your job.</strong> Guess first, two things. Then press Run and watch three galaxies slide back toward Earth as a clock counts the years. Then add a galaxy of your own and try again.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables. They are drawn on the pictures in white, in a box marked YOUR GUESS, and shown again beside the results. The galaxy you add in Part 2 does change the drawing,
        because it is a real setting. Your guesses do not.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Words first.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Recession speed</strong>: how fast a galaxy is moving away from us, in kilometres per second (km/s).
        </li>
        <li>
          <strong>Megaparsec (Mpc)</strong>: a distance used for galaxies. One Mpc is about 3.3 million light-years.
        </li>
        <li>
          <strong>Billion years</strong>: a thousand million years. 5 billion years is 5,000,000,000 years.
        </li>
        <li>
          <strong>Constant speed</strong>: staying the same the whole time, with no speeding up or slowing down.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          Each galaxy&rsquo;s speed is treated as if it had stayed exactly the same for its whole history, so running it backward in a straight line is valid. In reality the universe&rsquo;s expansion rate has changed over time, so this is a simplification, not the real history.
        </li>
        <li>
          Only each galaxy&rsquo;s distance <strong>from Earth</strong> shrinks to zero here. An observer on any other galaxy would see the same pattern. Earth is only a reference point, not a special or central place.
        </li>
        <li>The real age of the universe, about 13.8 billion years, is a comparison value measured by others. It is not worked out here.</li>
        <li>The Hubble constant is the same 70 km/s per Mpc as in Cosmology 1.</li>
        <li>No orbits, structure or individual galaxy physics are modelled: each galaxy is just a labelled distance, as in Cosmology 1.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> Big Bang, Hubble time, singularity, horizon problem, inflation, recession speed, megaparsec, billion years, constant speed. The &ldquo;Words and formulas&rdquo; box below has each one with a short meaning.
      </p>
    </div>
  )
}

// ---- the words box: the formula and its worked example wait until after the first Run (they show that the distance cancels) ----
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const ex = bigBangWorkedExample(16.5)
  const entries = [
    { term: 'Big Bang', meaning: 'the name for the moment this page’s backward run points to. NASA’s scientists describe it as the expansion of the universe beginning about 13.8 billion years ago (see the links). The name is misleading: it was not an explosion in one place.' },
    { term: 'Hubble time', meaning: 'the time back to zero distance, if a galaxy had always moved at its present speed. It is the same kind of number as 1 divided by the Hubble constant.' },
    { term: 'Singularity', meaning: 'the point where this simplified model’s distances and timeline both reach zero. Not a place you could travel to or examine.' },
    { term: 'Recession speed', meaning: 'how fast a galaxy is moving away from us, in km/s.' },
    { term: 'Megaparsec (Mpc)', meaning: 'a distance used for galaxies. One Mpc is about 3.3 million light-years.' },
    { term: 'Billion years', meaning: 'a thousand million years.' },
    { term: 'Constant speed', meaning: 'staying the same the whole time, with no speeding up or slowing down.' },
    { term: 'Hubble’s Law and the Hubble constant', meaning: 'from Cosmology 1: a galaxy’s recession speed is the Hubble constant times its distance, v = H0 × d (v the speed, H0 the Hubble constant, d the distance). H0 is 70 km/s per Mpc here.' },
    { term: 'Inflation', meaning: 'a very fast stretching of space in the first tiny fraction of a second, which many cosmologists think happened. It is a current theory, not a settled fact (NASA).' },
    { term: 'Horizon problem', meaning: 'the puzzle that two patches of sky on opposite sides match in temperature, although light never had time to travel between them. Each patch has a “horizon”: the farthest it could have heard from. Inflation is one proposed answer.' },
  ]
  if (afterRun) {
    entries.push({
      term: 'Formula, with a worked example',
      meaning: `time back = distance ÷ speed. For the Virgo Cluster: ${fmtMpc(ex.distanceMpc)} Mpc is ${fmtMpc(ex.distanceMpc)} × 3.0857 × 10¹⁹ km = ${(ex.distanceKm / 1e20).toFixed(2)} × 10²⁰ km. Its speed is 70 × ${fmtMpc(ex.distanceMpc)} = ${Math.round(ex.speedKmPerS).toLocaleString('en-US')} km/s. ${(ex.distanceKm / 1e20).toFixed(2)} × 10²⁰ ÷ ${Math.round(ex.speedKmPerS).toLocaleString('en-US')} = ${(ex.seconds / 1e17).toFixed(3)} × 10¹⁷ seconds, which is ${fmtBillions(ex.years)} billion years (one year is about 31.56 million seconds). A Mpc is 3.0857 × 10¹⁹ km.`,
    })
  } else {
    entries.push({ term: 'More words', meaning: 'the formula and its worked example appear here after your first run, because they would give away what you are about to guess.' })
  }
  return entries
}

// ---- links (pages read 2026-11-14; see the draft's source table) ----
const LINKS: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-big-bang/',
    label: 'NASA: Big Bang (Hubble)',
    what: 'a plain NASA timeline from the hot, tiny beginning about 13.8 billion years ago, through inflation and the first atoms, to stars and galaxies. It describes the start as a point that surged outward, so read it together with the next link. (Read in full; page last updated 22 October 2024.)',
  },
  {
    href: 'https://science.nasa.gov/mission/webb/big-bang-q-and-a/',
    label: 'NASA: Webb Telescope and the Big Bang (a Q&A with Nobel laureate John Mather)',
    what: 'why “Big Bang” is a misleading name: the universe has no centre, and it happened everywhere at once. Conversational and plain. (Read in full; page last updated 20 February 2026.)',
  },
  {
    href: 'https://science.nasa.gov/universe/overview/',
    label: 'NASA: Cosmic History',
    what: 'a step-by-step history of the universe, including inflation, which the page describes as cosmologists’ current theory. (Read in full; page last updated 12 August 2026.)',
  },
  {
    href: 'https://science.nasa.gov/universe/stories/quick-reads/what-can-we-learn-from-the-universes-baby-picture/',
    label: 'NASA: What Can We Learn from the Universe’s Baby Picture?',
    what: 'the glow left over from the early universe, why it looks nearly uniform, and how scientists look for signs of inflation in it. (Read in part: the first 39,354 of 47,688 characters; the date was not seen.)',
  },
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-cosmological-redshift/',
    label: 'NASA: Hubble Cosmological Redshift',
    what: 'how expanding space stretches the light of distant galaxies, and how Hubble used it. (Read in full; page last updated 17 September 2024.)',
  },
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/',
    label: 'NASA: The Hubble Constant and the Hubble Tension',
    what: 'what the Hubble constant is, and why two ways of measuring it disagree. (Read in full; page last updated 4 August 2025.)',
  },
  {
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC522427/',
    label: 'Hubble’s original 1929 paper (PNAS)',
    what: 'the paper behind the rule this page runs backward. It is a scan of the printed pages, written in the language of 1929, so it is a page to look at more than to read. (The record, title, author and date were read; the text was not.)',
  },
  {
    href: 'https://arxiv.org/abs/2112.04510',
    label: 'The Hubble constant measured from nearby stars and supernovae (Riess and others, 2022)',
    what: 'the paper behind the value near 73 km/s per Mpc, used in the check-up. Technical; the abstract is the readable part. (Abstract read only.)',
  },
  {
    href: 'https://arxiv.org/abs/1807.06209',
    label: 'The Hubble constant from the early universe (Planck 2018 results VI)',
    what: 'the paper behind the value near 67 km/s per Mpc, used in the check-up. Technical; the abstract is the readable part. The abstract gives no age of the universe. (Abstract read only.)',
  },
]

function ChoiceButtons<T extends string>({
  options,
  selected,
  disabled,
  onSelect,
}: {
  options: Array<{ value: T; label: string }>
  selected: T | null
  disabled: boolean
  onSelect: (value: T) => void
}) {
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

type ActiveRun = { kind: 'part1' } | { kind: 'forward' } | { kind: 'part2'; own: number }
type RunStatus = 'idle' | 'running'

export function BigBangExperiment({ onComplete, onTutorComplete }: BigBangExperimentProps) {
  const [timeGuess, setTimeGuess] = useState<TimeGuess | null>(null)
  const [ageGuess, setAgeGuess] = useState<AgeGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ time: TimeGuess; age: AgeGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  // What Part 1's picture shows once nothing is playing: the end of the backward run, or the end of the forward replay.
  const [part1Rest, setPart1Rest] = useState<'backward' | 'forward'>('backward')
  const [ownRuns, setOwnRuns] = useState<number[]>([])
  const [active, setActive] = useState<ActiveRun | null>(null)
  const [progress, setProgress] = useState(1)
  const [status, setStatus] = useState<RunStatus>('idle')
  const [highlight, setHighlight] = useState<PresetKey>('virgo')
  const [ownDistance, setOwnDistance] = useState(50)
  const [explained, setExplained] = useState(false)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const isRunning = status === 'running'
  const hasAllGuesses = timeGuess !== null && ageGuess !== null
  const locked = submitted !== null
  const shownTime = submitted?.time ?? timeGuess
  const shownAge = submitted?.age ?? ageGuess

  // One animation per run: a fixed real duration (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running' || !active) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(p)
      if (p >= 1) {
        setStatus('idle')
        if (active.kind === 'part1') {
          setPart1Done(true)
          setPart1Rest('backward')
          onCompleteRef.current?.()
        } else if (active.kind === 'forward') {
          setPart1Rest('forward')
        } else {
          setOwnRuns((list) => [...list, active.own])
        }
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, active])

  const handleRun = () => {
    if (!hasAllGuesses || isRunning || part1Done) return
    if (!submitted) setSubmitted({ time: timeGuess!, age: ageGuess! })
    setActive({ kind: 'part1' })
    setProgress(0)
    setStatus('running')
  }

  const handlePlayForward = () => {
    if (!part1Done || isRunning) return
    setActive({ kind: 'forward' })
    setProgress(0)
    setStatus('running')
  }

  const handleRunPart2 = () => {
    if (isRunning) return
    setActive({ kind: 'part2', own: ownDistance })
    setProgress(0)
    setStatus('running')
  }

  // Start over: clears the guesses, the runs, the results, the forward replay and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    setTimeGuess(null)
    setAgeGuess(null)
    setSubmitted(null)
    setPart1Done(false)
    setPart1Rest('backward')
    setOwnRuns([])
    setActive(null)
    setProgress(1)
    setStatus('idle')
    setHighlight('virgo')
    setOwnDistance(50)
    setExplained(false)
  }

  const hasAnythingToClear = timeGuess !== null || ageGuess !== null || locked || part1Done || ownRuns.length > 0
  const startOverDisabled = !hasAnythingToClear || isRunning

  // Part 1's picture.
  const part1Playing = isRunning && (active?.kind === 'part1' || active?.kind === 'forward')
  const part1Mode: 'idle' | 'backward' | 'forward' = part1Playing ? (active?.kind === 'forward' ? 'forward' : 'backward') : part1Done ? part1Rest : 'idle'
  const part1Progress = part1Playing ? progress : 1
  const part1Arrived = part1Done

  // Part 2's picture.
  const part2Playing = isRunning && active?.kind === 'part2' ? active : null
  const lastOwn = ownRuns.length > 0 ? ownRuns[ownRuns.length - 1] : null
  const part2OwnShown = part2Playing?.own ?? lastOwn ?? ownDistance
  const part2Mode: 'idle' | 'backward' = part2Playing ? 'backward' : lastOwn !== null ? 'backward' : 'idle'
  const part2Progress = part2Playing ? progress : 1
  const part2Arrived = lastOwn !== null && !part2Playing
  const part2Galaxies: PictureGalaxy[] = [
    ...presetGalaxies(highlight),
    { key: 'own', label: `Your galaxy (${fmtMpc(part2OwnShown)} Mpc)`, shortLabel: 'Your galaxy', distanceMpc: part2OwnShown, highlighted: false, labelYOffset: 54, yours: true },
  ]

  const presetRows = PRESET_KEYS.map((_, i) => galaxyTimeRow(GALAXY_PRESETS[i].distanceMpc))

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 2: The Big Bang</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 14 November 2026 through helper summaries, so a quotation or figure on this page should be checked against the live page. No plain page from NASA or ESA was found for the Hubble time (1 divided by the Hubble constant) or
            for the horizon problem, so this page explains them in its own words.
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
          You will make two guesses, then press Run. You will watch three galaxies slide back toward Earth while a clock counts the years, and see how long each one takes. Your guesses are drawn on the pictures in white. They never change the real pictures or the numbers.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="If you picked a farther galaxy instead of a nearer one, do you think the time since it was at zero distance from us would be longer, shorter, or the same?"
            guessText={optionText(timeChoices, shownTime)}
          >
            <ChoiceButtons options={timeChoices} selected={shownTime} disabled={locked || isRunning} onSelect={setTimeGuess} />
          </Question>
          <Question
            prompt="How do you think this page's answer will compare with the universe's real age, measured by others (about 13.8 billion years)?"
            guessText={optionText(ageChoices, shownAge)}
          >
            <ChoiceButtons options={ageChoices} selected={shownAge} disabled={locked || isRunning} onSelect={setAgeGuess} />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your predictions are locked while you try other settings. To change them, press Start over.
            </p>
          )}
        </div>

        <button type="button" className="action-button" onClick={handleRun} disabled={!hasAllGuesses || isRunning || part1Done} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          {part1Playing && active?.kind === 'part1' ? 'Running...' : part1Done ? 'Run (done)' : 'Run'}
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
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Three galaxies sliding back toward Earth, and the time each one takes</p>
          <BigBangPicture
            galaxies={presetGalaxies('virgo')}
            mode={part1Mode}
            progress={part1Progress}
            arrived={part1Arrived}
            guesses={part1Done ? submitted : null}
            showZoom
          />
          {part1Done && (
            <button
              type="button"
              className="secondary-button"
              onClick={handlePlayForward}
              disabled={isRunning}
              style={{ marginTop: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: isRunning ? 'not-allowed' : 'pointer', backgroundColor: 'rgba(250, 204, 21, 0.18)', display: 'block' }}
            >
              {part1Playing && active?.kind === 'forward' ? 'Expanding outward...' : part1Rest === 'forward' ? 'Play forward again (from the Big Bang)' : 'Play forward (from the Big Bang)'}
            </button>
          )}
          <Part1Caption arrived={part1Done} />
        </Block>

        {part1Done && (
          <Block>
            <WhereFrom>
              <strong>Calculated here:</strong> the Hubble time, 1 / H0 at H0 = 70 km/s per Mpc, with the standard unit conversions; each galaxy&rsquo;s recession speed; the backward positions. <strong>Measured by others:</strong> the age of the universe, about 13.8 billion years
              (NASA); the Virgo and Coma distances (Cosmology 1&rsquo;s sources); the Hubble constant&rsquo;s published values (Riess and others; Planck). <strong>Imagined for the question:</strong> the constant-speed backward run is not the real history (the real expansion has changed
              over time), and the spacing of the galaxies in the drawing is illustrative, not to scale. White is only ever your guess.
            </WhereFrom>
          </Block>
        )}
        {!part1Done && <p style={smallNote}>After you press Run, the galaxies slide back toward Earth, the bars, the zoom strip and a &ldquo;Where the real picture comes from&rdquo; note appear, and Parts 2, 3 and 4 appear below.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              You will add a galaxy of your own, anywhere from 1 to 200 Mpc away, and watch it run back with the others. You can also choose which of the three galaxies is highlighted. Your guesses do not change the drawings or tables. These settings do.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="big-bang-own-distance" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Your galaxy&rsquo;s distance: {ownDistance} Mpc
              </label>
              <input
                id="big-bang-own-distance"
                type="range"
                min={MIN_OWN_GALAXY_DISTANCE_MPC}
                max={MAX_OWN_GALAXY_DISTANCE_MPC}
                step={1}
                value={ownDistance}
                disabled={isRunning}
                onChange={(event) => setOwnDistance(Number(event.target.value))}
                style={{ width: '100%' }}
              />
              <p style={{ fontWeight: 'bold', margin: '0.75rem 0 0.5rem' }}>Highlight:</p>
              <ChoiceButtons
                options={PRESET_KEYS.map((key, i) => ({ value: key, label: `${GALAXY_PRESETS[i].label} (${fmtMpc(GALAXY_PRESETS[i].distanceMpc)} Mpc)` }))}
                selected={highlight}
                disabled={isRunning}
                onSelect={setHighlight}
              />
              <p style={smallNote}>Your guesses do not change the drawings or tables, but these settings do. Press Start over to change a guess.</p>
              <button type="button" className="action-button" onClick={handleRunPart2} disabled={isRunning} style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}>
                {part2Playing ? 'Running...' : 'Show my galaxy'}
              </button>
              {ownRuns.length > 0 && (
                <p style={smallNote}>
                  The highlight and your galaxy&rsquo;s distance change where the dots start and what the picture shows. They do not change how long it takes to reach Earth.
                </p>
              )}
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your galaxy at {fmtMpc(part2OwnShown)} Mpc</p>
              <BigBangPicture galaxies={part2Galaxies} mode={part2Mode} progress={part2Progress} arrived={part2Arrived} guesses={null} showZoom={false} />
              <Part2Caption ran={ownRuns.length > 0} />
            </Block>
            <Block>
              <WhereFrom>
                <strong>Calculated here</strong> from the distance you chose. <strong>Imagined for the question:</strong> your galaxy. Pink is only ever your own galaxy.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              You will read the numbers behind the three galaxies and a check-up of this page&rsquo;s answer against measured values. The check-up never changes with your guesses or with your galaxy.
            </PartHeader>
            <BigBangResults
              presetDistances={PRESET_KEYS.map((key, i) => ({ label: GALAXY_PRESETS[i].label, distanceMpc: GALAXY_PRESETS[i].distanceMpc, key }))}
              ownDistanceMpc={lastOwn}
              guesses={submitted}
            />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              You will talk over what you saw. The tutor will ask three questions, then explain, and will say how each of your guesses compares.
            </PartHeader>
            {submitted && (
              <BigBangTutor
                timeGuess={submitted.time}
                ageGuess={submitted.age}
                rows={presetRows}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            )}
            {explained && (
              <p style={{ ...smallNote, marginTop: '1rem' }}>You have reached the tutor&rsquo;s explanation. You can still add a galaxy in Part 2; the tutor does not restart.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
