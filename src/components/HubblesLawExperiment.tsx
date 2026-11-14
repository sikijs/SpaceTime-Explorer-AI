import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  GALAXY_PRESETS,
  MAX_PAIR_NEAR_DISTANCE_MPC,
  MIN_PAIR_NEAR_DISTANCE_MPC,
  PART1_NEAR_DISTANCE_MPC,
  PAIR_DISTANCE_RATIO,
  runHubblePair,
  workedExample,
} from '../physics/hubblesLawExperiment'
import type { RedshiftGuess, SpeedGuess } from '../physics/hubblesLawExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { HubblesLawResults } from './HubblesLawResults'
import { HubblesLawTutor } from './HubblesLawTutor'
import { PairPicture, Part1Caption, Part2Caption, fmtNumber } from './HubblesLawPictures'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 1, audited to the newer rules (docs/audit/cosmology/01-draft-wording.md, approved by the owner on 2026-11-14).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a
// real picture or table; they are drawn in white on the real picture once the light has arrived (§14, "Predictions and the Real Results").

interface HubblesLawExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// One run is a fixed real duration, whatever the distances (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 3000

const fmtMpc = (v: number) => (Number.isInteger(v) ? String(v) : String(Number(v.toFixed(1))))

const speedChoices: Array<{ value: SpeedGuess; label: string }> = [
  { value: 'twice', label: 'Twice as fast' },
  { value: 'same', label: 'The same' },
  { value: 'half', label: 'Half as fast' },
]
const redshiftChoices: Array<{ value: RedshiftGuess; label: string }> = [
  { value: 'nearer', label: 'The nearer one (B)' },
  { value: 'farther', label: 'The farther one (A)' },
  { value: 'same', label: 'No difference' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

// ---- the introduction (no answers: §12) ----
function Intro() {
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>The question.</strong> When astronomers look at galaxies far beyond our own, they find something odd about their light. Does it depend on how far away the galaxy is? And does a galaxy&rsquo;s distance tell us how fast it is moving away from us?
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What happens.</strong> In four short steps.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>Light is a wave, and its colour is the length of that wave.</strong> Think of ripples on a pond. The distance from one ripple&rsquo;s peak to the next is its <strong>wavelength</strong>. Light works the same way, only far smaller. Blue light has short
          waves and red light has long waves. Light from a distant galaxy travels for millions of years before it reaches us.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>What redshift is.</strong> On that long journey the light&rsquo;s waves get <strong>stretched</strong>, so the light arrives with longer waves than it left with, which means it arrives <strong>redder</strong>. That is called <strong>redshift</strong>. It is
          like stretching a spring: the coils pull apart. <strong>Why?</strong> Because <strong>space itself is expanding</strong>. Picture a wave drawn on a rubber band that someone slowly pulls longer: the wave is not changed, but the band under it grows, so the gap
          between its peaks grows too. Light crossing the expanding space is stretched the same way, a little more every moment of its journey. (This is not the same as a galaxy moving through space, which can also change a wave&rsquo;s length. The tutor explains the
          difference at the end.) Astronomers can tell how much the light was stretched because atoms give out light in a recognisable pattern of lines at known colours, like a fingerprint. If the lines turn up at longer wavelengths than the
          fingerprint says, the light was stretched. The amount is written as a number, <strong>z</strong>: the fraction by which the wavelength grew. If z is 0.01, a wavelength of 500 nanometres arrives as 505. A bigger z means more stretching.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>What &ldquo;the pattern&rdquo; means.</strong> Astronomers can measure two things for a galaxy: its redshift, and how far away it is (for example, from how dim a star of known brightness looks). A <strong>pattern</strong> here means a rule that links
          the two, so that knowing one tells you something about the other. Edwin Hubble published such a rule in 1929, and it is called <strong>Hubble&rsquo;s Law</strong>. What the rule says is what you are about to find out, so it is not stated yet.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>What &ldquo;the number that sets the pattern&rsquo;s size&rdquo; means.</strong> Take a taxi fare as an example. The fare depends on how far you go, and the price per kilometre is the number that says how much the fare changes for each extra
          kilometre. A different price per kilometre gives a different fare for the same trip, even though the rule is the same. In Hubble&rsquo;s Law the matching number is the <strong>Hubble constant</strong>. It is written in <strong>km/s per Mpc</strong>: it tells how
          much a galaxy&rsquo;s speed away from us changes for each extra megaparsec of distance. This page uses 70. The real value is still debated (see the check-up in Part 3).
        </li>
      </ol>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        Studying what this pattern says about the whole universe is called <strong>cosmology</strong>.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>A daily-life picture.</strong> Think of a stretchy rubber band with two ants standing on it, and someone slowly pulling the band longer. The ants do not walk, yet the gap between them grows. Keep that picture in mind. In this experiment we ask how the gap, and the
        light that crosses it, depends on how big the gap already is.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>Your job.</strong> Guess first, two things. Then press Run and watch light from two galaxies, one nearer and one farther, travel to Earth. Then choose different distances and try again.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables. They are drawn on the pictures in white, in a box marked YOUR GUESS, and shown again beside the results. The distance you choose in Part 2 does change the drawing,
        because it is a real setting. Your guesses do not.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Words first.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Light-year</strong>: the distance light travels in one year, about 9.5 million million kilometres.
        </li>
        <li>
          <strong>Megaparsec (Mpc)</strong>: a distance astronomers use for galaxies. One Mpc is about 3.3 million light-years. A galaxy 16.5 Mpc away is about 54 million light-years away.
        </li>
        <li>
          <strong>Recession speed</strong>: how fast a galaxy is moving away from us, in kilometres per second (km/s). For comparison, a fast jet flies at about 0.3 km/s.
        </li>
        <li>
          <strong>Redshift (z)</strong>: how much the light&rsquo;s wavelength has been stretched, as a fraction. If z is 0.01, a wavelength of 500 nanometres arrives as 505. Redder light has a longer wavelength.
        </li>
        <li>
          <strong>Wavelength</strong>: the distance between one peak of a light wave and the next. Blue light has a shorter wavelength than red light.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          The redshift shown here is explained by <strong>space itself stretching</strong> while the light is on its way, not by a galaxy rushing through space the way the gravitational-wave source did in Gravitational Waves Experiment 5 (that kind of stretching is called the
          Doppler effect).
        </li>
        <li>
          The simple rule this page uses to work out a galaxy&rsquo;s redshift from its distance is only accurate for galaxies that are not too far away. At much larger distances the real relationship is more complicated, and it is not covered here. The rule uses three ingredients: the galaxy&rsquo;s <strong>distance</strong> (written <strong>d</strong>), the <strong>Hubble constant</strong> (written <strong>H0</strong>, 70 km/s per Mpc here) and the <strong>speed of
          light</strong> (written <strong>c</strong>, 299,792 km/s). It gives the <strong>redshift</strong> (written <strong>z</strong>). How they combine appears in the Words and formulas box after your first run.
        </li>
        <li>The Hubble constant is set to <strong>70 km/s per Mpc</strong>, a round value chosen for this page. Its real value is still debated (see the check-up in Part 3).</li>
        <li>The galaxies are not simulated, apart from a distance.</li>
        <li>Only galaxies moving away are shown; a few nearby galaxies move toward us because of local gravity, and that is not modelled.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> Light-year, megaparsec, recession speed, redshift, wavelength, spectral lines, Hubble&rsquo;s Law, Hubble constant, cosmology, Doppler effect, Hubble tension. The &ldquo;Words and formulas&rdquo; box below has each one with a short meaning.
      </p>
    </div>
  )
}

// ---- the words box: Hubble's Law and the formulas wait until after the first Run (they answer the two guesses) ----
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const ex = workedExample()
  const entries = [
    { term: 'Light-year', meaning: 'the distance light travels in one year, about 9.5 million million kilometres.' },
    { term: 'Megaparsec (Mpc)', meaning: 'a distance used for galaxies. One Mpc is about 3.3 million light-years.' },
    { term: 'Recession speed', meaning: 'how fast a galaxy is moving away from us, in km/s.' },
    { term: 'Redshift (z)', meaning: 'how much a light wave has been stretched, as a fraction of its starting wavelength.' },
    { term: 'Wavelength', meaning: 'the distance between one peak of a light wave and the next. Redder light has a longer wavelength.' },
    { term: 'Spectral lines (the light’s fingerprint)', meaning: 'atoms give out light at certain exact colours, which show up as lines. Each kind of atom has its own pattern of lines. If the pattern turns up at longer wavelengths than the atom’s known pattern, the light has been stretched.' },
    { term: 'Hubble constant (H0)', meaning: 'a number that tells how much recession speed there is for each megaparsec of distance, in km/s per Mpc. This page uses 70.' },
    { term: 'Cosmology', meaning: 'the study of the universe as a whole: its beginning, its size, how it changes.' },
    {
      term: 'Doppler effect',
      meaning: 'the change in a wave’s wavelength caused by its source moving through space, as when an ambulance siren drops in pitch as it passes. The redshift on this page has a different cause.',
    },
    { term: 'Hubble tension', meaning: 'a real disagreement between two ways of measuring the Hubble constant, which give about 73 and about 67 km/s per Mpc (see Part 3).' },
  ]
  if (afterRun) {
    entries.splice(5, 0, { term: 'Hubble’s Law', meaning: 'a galaxy’s recession speed is the Hubble constant times its distance, v = H0 × d (v is the speed, H0 the Hubble constant, d the distance).' })
    entries.push({
      term: 'Formulas, with a worked example',
      meaning: `In these formulas z is the redshift, H0 is the Hubble constant (70 km/s per Mpc here), d is the galaxy’s distance in Mpc, v is its recession speed in km/s and c is the speed of light, 299,792 km/s. Worked example: v = H0 × d = 70 × ${fmtMpc(ex.distanceMpc)} = ${fmtNumber(ex.speedKmPerS)} km/s. z = v ÷ c = ${fmtNumber(ex.speedKmPerS)} ÷ 299,792.458 = ${ex.redshift.toFixed(5)}. Stretch factor = 1 + z = ${ex.stretchFactor.toFixed(5)}; a wavelength of ${ex.startWavelengthNm} nm arrives as ${ex.startWavelengthNm} × ${ex.stretchFactor.toFixed(5)} = ${ex.arrivalWavelengthNm.toFixed(1)} nm. c is the speed of light, 299,792 km/s.`,
    })
  } else {
    entries.push({ term: 'More words', meaning: 'Hubble’s Law and the formulas appear here after your first run, because they would give away what you are about to guess.' })
  }
  return entries
}

// ---- links (pages read 2026-11-14; see the draft's source table) ----
const LINKS: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-cosmological-redshift/',
    label: 'NASA: Hubble Cosmological Redshift',
    what: 'a plain NASA page on how expanding space stretches the light of distant galaxies into redder colours, and how Edwin Hubble used it. (Read in full; page last updated 17 September 2024.)',
  },
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/',
    label: 'NASA: The Hubble Constant and the Hubble Tension',
    what: 'a plain NASA page on what the Hubble constant is, how it was measured with the Hubble Space Telescope and why two ways of measuring it disagree. (Read in full; page last updated 4 August 2025.)',
  },
  {
    href: 'https://arxiv.org/abs/2112.04510',
    label: 'The Hubble constant measured from nearby stars and supernovae (Riess and others, 2022)',
    what: 'the paper behind the value near 73 km/s per Mpc. A technical paper; the abstract (summary) is the readable part. (Abstract read only.)',
  },
  {
    href: 'https://arxiv.org/abs/1807.06209',
    label: 'The Hubble constant from the early universe (Planck 2018 results VI)',
    what: 'the paper behind the value near 67 km/s per Mpc. A technical paper; the abstract is the readable part. (Abstract read only.)',
  },
  {
    href: 'https://arxiv.org/abs/astro-ph/0702510',
    label: 'The distance to the Virgo Cluster (Mei and others, 2007)',
    what: 'the paper behind the 16.5 Mpc distance used for Galaxy B. A technical paper; the abstract is the readable part. (Abstract read only.)',
  },
  {
    href: 'https://www.jpl.nasa.gov/images/pia04210-coma-cluster-of-galaxies/',
    label: 'NASA: Coma Cluster of Galaxies (image page)',
    what: 'a NASA caption giving the Coma Cluster’s distance and redshift, used in the check-up. Short, and written for a more technical reader. (Read in full.)',
  },
  {
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC522427/',
    label: 'Hubble’s original 1929 paper (PNAS)',
    what: '“A relation between distance and radial velocity among extra-galactic nebulae”, PNAS 15(3), 168–173, 15 March 1929, where Edwin Hubble first showed that galaxies’ speeds and distances are related. It is a scan of the printed pages, written for scientists in the language of 1929, so it is a page to look at more than to read. (The page record, title, author and date were read; the paper’s text was not, because it is page images.)',
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

type NearMode = 'virgo' | 'coma' | 'custom'
interface ActiveRun {
  kind: 'part1' | 'part2'
  near: number
}
type RunStatus = 'idle' | 'running' | 'complete'

export function HubblesLawExperiment({ onComplete, onTutorComplete }: HubblesLawExperimentProps) {
  const [speedGuess, setSpeedGuess] = useState<SpeedGuess | null>(null)
  const [redshiftGuess, setRedshiftGuess] = useState<RedshiftGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ speed: SpeedGuess; redshift: RedshiftGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  const [part2Runs, setPart2Runs] = useState<number[]>([])
  const [active, setActive] = useState<ActiveRun | null>(null)
  const [progress, setProgress] = useState(1)
  const [status, setStatus] = useState<RunStatus>('idle')
  const [nearMode, setNearMode] = useState<NearMode>('virgo')
  const [customNear, setCustomNear] = useState(50)
  const [explained, setExplained] = useState(false)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const isRunning = status === 'running'
  const hasAllGuesses = speedGuess !== null && redshiftGuess !== null
  const locked = submitted !== null
  const shownSpeed = submitted?.speed ?? speedGuess
  const shownRedshift = submitted?.redshift ?? redshiftGuess

  const part2Near = nearMode === 'virgo' ? GALAXY_PRESETS[0].distanceMpc : nearMode === 'coma' ? GALAXY_PRESETS[1].distanceMpc : customNear

  // One animation per run: a fixed real duration, whatever the distances (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running' || !active) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(p)
      if (p >= 1) {
        setStatus('complete')
        if (active.kind === 'part1') {
          setPart1Done(true)
          onCompleteRef.current?.()
        } else {
          setPart2Runs((list) => [...list, active.near])
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
    if (!submitted) setSubmitted({ speed: speedGuess!, redshift: redshiftGuess! })
    setActive({ kind: 'part1', near: PART1_NEAR_DISTANCE_MPC })
    setProgress(0)
    setStatus('running')
  }

  const handleRunPart2 = () => {
    if (isRunning) return
    setActive({ kind: 'part2', near: part2Near })
    setProgress(0)
    setStatus('running')
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    setSpeedGuess(null)
    setRedshiftGuess(null)
    setSubmitted(null)
    setPart1Done(false)
    setPart2Runs([])
    setActive(null)
    setProgress(1)
    setStatus('idle')
    setNearMode('virgo')
    setCustomNear(50)
    setExplained(false)
  }

  const hasAnythingToClear = speedGuess !== null || redshiftGuess !== null || locked || part1Done || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || isRunning

  const part1Pair = runHubblePair(PART1_NEAR_DISTANCE_MPC)
  const part1Playing = isRunning && active?.kind === 'part1'
  const part1Started = part1Playing || part1Done
  const part1Progress = part1Playing ? progress : 1

  const part2Playing = isRunning && active?.kind === 'part2' ? active : null
  const lastPart2Near = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const part2ShownNear = part2Playing?.near ?? lastPart2Near
  const part2Started = part2ShownNear !== null
  const part2Pair = runHubblePair(part2ShownNear ?? part2Near)
  const part2Progress = part2Playing ? progress : 1

  // Part 3 follows the most recent finished run: Part 1's pair, or the learner's latest own pair.
  const resultsNear = lastPart2Near ?? PART1_NEAR_DISTANCE_MPC
  const resultsPair = runHubblePair(resultsNear)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 1: Hubble&rsquo;s Law</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 14 November 2026 through helper summaries, so a quotation or figure on this page should be checked against the live page. No plain page from NASA or ESA was found that defines the megaparsec or says that space
            stretches rather than galaxies moving through it, so this page defines the megaparsec in its own words.
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
          You will make two guesses, then press Run. You will see light leave two galaxies, one nearer and one farther, and travel to Earth. Your guesses are drawn on the pictures in white. They never change the real pictures or the numbers.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="Galaxy B is some distance from Earth. Galaxy A is exactly twice as far away. How do you think Galaxy A's speed of moving away compares with Galaxy B's?"
            guessText={optionText(speedChoices, shownSpeed)}
          >
            <ChoiceButtons options={speedChoices} selected={shownSpeed} disabled={locked || isRunning} onSelect={setSpeedGuess} />
          </Question>
          <Question
            prompt="When the light from the two galaxies reaches Earth, which will look redder: the light from the nearer galaxy (B) or from the farther one (A)?"
            guessText={optionText(redshiftChoices, shownRedshift)}
          >
            <ChoiceButtons options={redshiftChoices} selected={shownRedshift} disabled={locked || isRunning} onSelect={setRedshiftGuess} />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your predictions are locked while you try other settings. To change them, press Start over.
            </p>
          )}
        </div>

        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <strong>The pair.</strong> Part 1 uses Galaxy B at {fmtMpc(PART1_NEAR_DISTANCE_MPC)} Mpc (the Virgo Cluster) and Galaxy A at {fmtMpc(PART1_NEAR_DISTANCE_MPC * PAIR_DISTANCE_RATIO)} Mpc.
        </p>
        <button type="button" className="action-button" onClick={handleRun} disabled={!hasAllGuesses || isRunning || part1Done} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          {part1Playing ? 'Running...' : part1Done ? 'Run (done)' : 'Run'}
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
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Two galaxies, their light, and how fast they are moving away</p>
          <PairPicture pair={part1Pair} progress={part1Progress} started={part1Started} guesses={part1Done ? submitted : null} idPrefix="hubble-p1" />
          <Part1Caption arrived={part1Done} />
        </Block>

        {part1Done && (
        <Block>
          <WhereFrom>
            <strong>Calculated here:</strong> each galaxy&rsquo;s recession speed (70 km/s per Mpc × its distance), its redshift z = H0 × d ÷ c (H0 is the Hubble constant, d the distance, c the speed of light), and the stretch of its light. <strong>Measured:</strong> the Virgo Cluster&rsquo;s distance, 16.5 Mpc (Mei and others, 2007). Galaxy
            A&rsquo;s distance of 33 Mpc is not a real galaxy. <strong>Imagined for the question:</strong> the light&rsquo;s colour and the wave&rsquo;s width are drawn <strong>much stronger than the real stretch</strong> so that you can see them (z of 0.05 is drawn as
            fully red; the real z here is about 0.004 to 0.008), and Galaxy A itself. White is only ever your guess.
          </WhereFrom>
        </Block>
        )}
        {!part1Done && <p style={smallNote}>After you press Run, the light travels to Earth, the numbers and a &ldquo;Where the real picture comes from&rdquo; note appear, and Parts 2, 3 and 4 appear below.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              You will change how far away Galaxy B is, and see the pair again. Galaxy A is always exactly twice as far as B. Your guesses do not change the drawings or tables. These settings do.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Galaxy B&rsquo;s distance:</p>
              <ChoiceButtons
                options={[
                  { value: 'virgo' as NearMode, label: `Virgo Cluster (${fmtMpc(GALAXY_PRESETS[0].distanceMpc)} Mpc)` },
                  { value: 'coma' as NearMode, label: `Coma Cluster (${fmtMpc(GALAXY_PRESETS[1].distanceMpc)} Mpc)` },
                  { value: 'custom' as NearMode, label: 'Custom' },
                ]}
                selected={nearMode}
                disabled={isRunning}
                onSelect={setNearMode}
              />
              {nearMode === 'custom' && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <label htmlFor="hubbles-law-distance" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Galaxy B&rsquo;s distance: {customNear} Mpc
                  </label>
                  <input
                    id="hubbles-law-distance"
                    type="range"
                    min={MIN_PAIR_NEAR_DISTANCE_MPC}
                    max={MAX_PAIR_NEAR_DISTANCE_MPC}
                    step={1}
                    value={customNear}
                    disabled={isRunning}
                    onChange={(event) => setCustomNear(Number(event.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Galaxy A: <strong>{fmtMpc(part2Near * PAIR_DISTANCE_RATIO)} Mpc</strong>
                {nearMode === 'coma' ? ' (an imagined galaxy)' : ''}.
              </p>
              <p style={smallNote}>Your guesses do not change the drawings or tables, but these settings do. Press Start over to change a guess.</p>
              <button type="button" className="action-button" onClick={handleRunPart2} disabled={isRunning} style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}>
                {part2Playing ? 'Running...' : 'Show my pair'}
              </button>
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {part2Started ? `Your own distance: Galaxy B at ${fmtMpc(part2ShownNear!)} Mpc` : 'Your own distance (not shown yet)'}
              </p>
              <PairPicture pair={part2Pair} progress={part2Progress} started={part2Started} guesses={null} yours idPrefix="hubble-p2" />
              <Part2Caption ran={part2Runs.length > 0} />
            </Block>
            {part2Runs.length === 0 && <p style={smallNote}>Choose a distance and press &ldquo;Show my pair&rdquo;. Your pair is drawn in pink, and Part 3&rsquo;s first table then follows it.</p>}
            <Block>
              <WhereFrom>
                <strong>Calculated here:</strong> your pair, in the same way as Part 1&rsquo;s. <strong>Measured:</strong> the Coma Cluster&rsquo;s distance, about 100 Mpc (NASA), if you choose it. <strong>Imagined for the question:</strong> Galaxy A, and the distance
                you choose if it is a custom one. Pink is only ever your own distance.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              You will read the numbers behind the pair and a check-up of the page&rsquo;s numbers against published values. The check-up never changes with your guesses or with your settings. The first table follows the pair you ran most recently.
            </PartHeader>
            <HubblesLawResults pair={resultsPair} ownDistances={part2Runs.length > 0} guesses={submitted} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              You will talk over what you saw. The tutor will ask three questions, then explain, and will say how each of your guesses compares.
            </PartHeader>
            {submitted && (
              <HubblesLawTutor
                speedGuess={submitted.speed}
                redshiftGuess={submitted.redshift}
                pair={part1Pair}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            )}
            {explained && (
              <p style={{ ...smallNote, marginTop: '1rem' }}>
                You have reached the tutor&rsquo;s explanation. You can still change Galaxy B&rsquo;s distance in Part 2; the tutor does not restart.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
