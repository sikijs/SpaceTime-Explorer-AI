import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  CMB_TEMPERATURE_TODAY_KELVIN,
  RECOMBINATION_REDSHIFT,
  RECOMBINATION_YEARS_AFTER_BIG_BANG,
  cmbTemperatureKelvin,
  cmbWorkedExample,
  releaseAsOnePartIn,
  releaseHourInALife,
} from '../physics/cosmicMicrowaveBackgroundExperiment'
import type { SkyGuess, TemperatureGuess } from '../physics/cosmicMicrowaveBackgroundExperiment'
import { CmbPicture, Part1Caption, Part2Caption, fmtKelvin } from './CosmicMicrowaveBackgroundPictures'
import { CosmicMicrowaveBackgroundResults } from './CosmicMicrowaveBackgroundResults'
import { CosmicMicrowaveBackgroundTutor } from './CosmicMicrowaveBackgroundTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 3, audited to the newer rules (docs/audit/cosmology/03-draft-wording.md, approved by the owner on 2026-11-14).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a
// real picture or table; they are drawn in white once the run has finished (§14, "Predictions and the Real Results").

interface CosmicMicrowaveBackgroundExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// One run is a fixed real duration, whatever the moment it plays back to (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 3000

const temperatureChoices: Array<{ value: TemperatureGuess; label: string }> = [
  { value: 'higher', label: 'Higher' },
  { value: 'lower', label: 'Lower' },
  { value: 'same', label: 'The same' },
]
const skyChoices: Array<{ value: SkyGuess; label: string }> = [
  { value: 'uniform', label: 'About the same' },
  { value: 'varies', label: 'Varies a lot' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

type MomentMode = 'today' | 'recombination' | 'custom'

// ---- the introduction (no answers: §12) ----
function Intro() {
  const thousand = Math.round(releaseAsOnePartIn() / 1000) * 1000
  const hours = Math.round(releaseHourInALife())
  const para = { marginTop: 0, marginBottom: '0.75rem' } as const
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={para}>
        <strong>The question.</strong> What is the oldest light we can still see, and what can it tell us about the early universe?
      </p>
      <p style={{ ...para, marginBottom: '0.5rem' }}>
        <strong>What happens.</strong>
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>A universe full of light, but no way to see far.</strong> Very soon after the Big Bang, the whole universe was filled with matter and with light, packed close together. The matter was not yet in the form of <strong>atoms</strong>. An atom is a tiny building block of
          matter. The simplest atom, hydrogen, is one <strong>proton</strong> (a very small particle with a positive electric charge) with one <strong>electron</strong> (a much lighter particle with a negative charge) held next to it. In the early universe the electrons and protons were
          not held together. They moved about freely, like people running around a huge, crowded room with nobody holding hands.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>Why light could not get far.</strong> Light is made of tiny packets called <strong>photons</strong>. When a photon meets a free electron, it gets knocked off in a new direction, a bit like a ball in a pinball machine bouncing off a bumper. In the early universe there
          were free electrons everywhere, so a photon could only travel a very short way before being knocked sideways, then again, and again. This is like a car&rsquo;s headlights in thick fog. The fog is made of tiny drops of water, and the light bounces off the drops in all directions, so
          the beam does not reach far and you cannot make out anything in the distance. The early universe was like being inside a fog, but a fog made of free electrons. No light could cross it in a straight line.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>The fog lifts.</strong> About {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after the Big Bang, conditions had changed enough for electrons and protons to join into atoms. An electron that is held inside an atom no longer knocks light about in
          the same way, so the fog cleared almost everywhere at about the same time. Light could finally travel in straight lines, and it has done so ever since. That moment is called <strong>recombination</strong>. (The &ldquo;re-&rdquo; in the name is a historical quirk: electrons
          and protons had never been joined before. The name stuck.)
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>How long ago, and how long it is.</strong> {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years sounds like a very long time, and it is, against a human life. But against the age of the universe, about 13.8 billion years, it is tiny: about 1 part in{' '}
          {thousand.toLocaleString('en-US')}. Imagine the whole history of the universe squeezed into one 80-year human life. On that scale, recombination happened about <strong>{hours} hours</strong> after birth, on the first day of life.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>Why it is the oldest light we can see.</strong> When you look at a faraway thing, you are seeing light that left it a while ago. Sunlight takes about 8 minutes to reach us, so you always see the Sun as it was about 8 minutes ago. Light from the next nearest star takes
          about 4 years. Light from a distant galaxy can take millions or billions of years. So looking far away is looking back in time. Before recombination, no light could cross the universe, so the <strong>first light that could ever travel to us is the light released at
          recombination</strong>. Light that set off then, toward where we are now, has been travelling for almost the whole 13.8 billion years since, and is arriving now. There is nothing older that we can see with light.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>A &ldquo;background&rdquo;.</strong> This light reaches us from all around, from every part of the sky. It is called a <strong>background</strong> because it lies behind everything else we can see. The stars and galaxies formed long after recombination, so they are in
          front of this light, the way furniture is in front of the wall of a room.
        </li>
        <li style={{ marginBottom: '0.5rem' }}>
          <strong>Stretched on the way, so now invisible.</strong> Light is a wave, and the distance from one crest of the wave to the next is its <strong>wavelength</strong>. For visible light, the wavelength decides the colour: red light has a longer wavelength than blue. Space has been{' '}
          <strong>expanding</strong> all this time (Cosmology 1 and 2), and when space stretches, the waves in it stretch too. Draw a wave on a balloon with a marker, then blow the balloon up: the crests move apart. Light released at recombination has been stretched by the expanding
          universe for about 13.8 billion years. It has been stretched so much that it is no longer visible light. It is now <strong>microwaves</strong>: waves our eyes cannot see, in the same family as radio waves, visible light and X-rays, which differ only in wavelength. That is why
          we call it the <strong>Cosmic Microwave Background</strong>, or <strong>CMB</strong>. You need a special microwave detector to see it.
        </li>
      </ol>
      <p style={para}>
        <strong>In one sentence.</strong> The CMB is light left over from the moment the universe became see-through, travelling ever since, and now stretched into invisible microwaves.
      </p>
      <p style={para}>
        <strong>A daily-life picture.</strong> Think of fog lifting on a morning drive. While the fog is thick, you can only see a few meters; once it clears, you can see the whole road, and light from far away reaches your eyes. Recombination was the universe&rsquo;s fog lifting.
      </p>
      <p style={para}>
        <strong>Where this shows up in everyday life.</strong> The CMB is not something you can see or feel. Our eyes only see visible light, and microwaves are invisible to us. Still, it is all around you right now, coming from all directions. It is also very weak. Although the word
        &ldquo;microwave&rdquo; may remind you of a kitchen microwave oven, the CMB is far too faint to warm anything. In 1964 to 1965, two radio engineers, Arno Penzias and Robert Wilson, found it by accident as a faint hiss in a large antenna that they could not get rid of, however
        carefully they cleaned it. Before cable and digital TV, a small part of the static &ldquo;snow&rdquo; on an old TV tuned between channels was also this ancient light.
      </p>
      <p style={para}>
        <strong>Why it matters.</strong> The CMB does not change your day, but it changes what we know. It is the oldest light we can ever observe, so studying it is like finding a photo of the universe as a newborn. It is real, measurable evidence about how the universe began, not only an
        idea on paper.
      </p>
      <p style={para}>
        <strong>Your job.</strong> Make two guesses. First, guess how the temperature of this light at recombination compares with today&rsquo;s. Second, guess whether the light looks about the same in every direction of the sky or varies a lot. Then press <strong>Run</strong>. The Run takes
        you on the light&rsquo;s journey from today back to recombination.
      </p>
      <p style={para}>
        <strong>The four Parts of this page.</strong> Below are four Parts. <strong>Part 1, &ldquo;Predict, then watch&rdquo;</strong> (amber) is where you guess, press Run and watch the pictures. <strong>Part 2, &ldquo;Now try it yourself&rdquo;</strong> (pink) lets you pick any moment
        in the light&rsquo;s journey. <strong>Part 3, &ldquo;The results&rdquo;</strong> (teal) has the numbers behind the pictures. <strong>Part 4, &ldquo;The tutor&rdquo;</strong> (blue) asks you what you saw and then explains it.
      </p>
      <p style={para}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables: those come from the physics and from real measurements. After the Run, your guesses are drawn in <strong>white</strong> on the pictures, next to the real values, and shown
        again beside the results. Part 2&rsquo;s controls change only the pink drawing.
      </p>
      <p style={{ ...para, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          The relationship between redshift and temperature used here is exact at any redshift. It is not the approximation used for nearby galaxies in Cosmology 1, which only works for small redshifts. This page therefore does not reuse that approximation.
        </li>
        <li>
          The redshift of recombination (z ≈ {RECOMBINATION_REDSHIFT}) is a real, carefully measured value, <strong>given here, not derived</strong>.
        </li>
        <li>
          The physics of recombination itself (the gas of electrons and protons, and how light scatters off it) is not simulated. Recombination is only the turning point where light could finally travel freely.
        </li>
        <li>The seven circles in the sky view are an illustration, not a map. Satellites have mapped the real sky; this page does not show that map.</li>
        <li>Nothing here is about how galaxies formed.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> atom, proton, electron, photon, scatter, recombination, wavelength, microwave, kelvin, redshift, background, expansion. The &ldquo;Words and formulas&rdquo; box below has each one with a short meaning.
      </p>
    </div>
  )
}

// ---- the words box: the formula, and the two ideas that give guess 2 away, wait until after the first Run ----
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const w = cmbWorkedExample()
  const entries = [
    { term: 'Atom', meaning: 'a tiny building block of matter. The simplest, hydrogen, is one proton with one electron beside it.' },
    { term: 'Proton', meaning: 'a very small particle with a positive electric charge. It is the centre of a hydrogen atom.' },
    { term: 'Electron', meaning: 'a much lighter particle with a negative electric charge. In an atom it stays close to the centre.' },
    { term: 'Photon', meaning: 'one tiny packet of light.' },
    { term: 'Scatter', meaning: 'to be knocked off in a new direction, as a ball bounces off a bumper.' },
    { term: 'Recombination', meaning: `the moment, about ${RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after the Big Bang, when electrons and protons joined into atoms and light could travel freely.` },
    { term: 'Background (here)', meaning: 'behind everything else we can see.' },
    { term: 'Wavelength', meaning: 'the distance from one crest of a wave to the next.' },
    { term: 'Microwave', meaning: 'a kind of light with a wavelength our eyes cannot see, longer than infrared (heat) light and in the same family as radio waves.' },
    { term: 'Expansion', meaning: 'space itself stretching, so that distant things move apart.' },
    { term: 'CMB', meaning: 'Cosmic Microwave Background: the first light that could travel through the universe, now stretched into microwaves.' },
    { term: 'Kelvin (K)', meaning: 'a temperature scale that starts at 0 K, the coldest possible. Room temperature is about 293 K.' },
    { term: 'Redshift, z', meaning: 'how much light has been stretched on its way to us. z = 0 means no stretching; larger z means more. From Cosmology 1.' },
    { term: 'Tenfold scale', meaning: 'a scale where each tick is ten times the one before it, so very small and very large numbers fit on one line.' },
  ]
  if (afterRun) {
    entries.push(
      {
        term: 'Temperature of light',
        meaning: 'the temperature of a glowing object that would give light of this kind. A stove element glows dull red, then orange, then white as it heats.',
      },
      {
        term: 'Formula, with a worked example',
        meaning: `T = T0 × (1 + z), with T0 = ${CMB_TEMPERATURE_TODAY_KELVIN} K. For recombination: ${w.todayKelvin} × (1 + ${RECOMBINATION_REDSHIFT}) = ${w.todayKelvin} × ${w.factor.toFixed(1)} ≈ ${fmtKelvin(w.temperatureKelvin)} K.`,
      },
      {
        term: 'Horizon problem and inflation',
        meaning: 'from Cosmology 2. The horizon problem is the puzzle that patches of sky on opposite sides match in temperature although light never had time to travel between them. Inflation, a very fast stretching of space in the first tiny fraction of a second, is one proposed answer, and a current theory, not a settled fact.',
      },
    )
  } else {
    entries.push({ term: 'More words', meaning: 'three more entries appear here after your first run, because they would give away what you are about to guess.' })
  }
  return entries
}

// ---- links (pages read 2026-11-14; see the draft's source table) ----
const LINKS_BEFORE: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://science.nasa.gov/universe/overview/',
    label: 'NASA: Cosmic History',
    what: 'a short, plain timeline of the universe from the Big Bang. It names recombination and calls the microwave background the oldest light we can observe. (Read in full; page last updated 12 August 2026.)',
  },
  {
    href: 'https://science.nasa.gov/exoplanets/what-is-a-light-year/',
    label: 'NASA: What is a light-year?',
    what: 'explains why looking far away is looking back in time, with the Sun being about eight light-minutes away. (Read in full; page dated 6 April 2026.)',
  },
]
const LINKS_AFTER: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background',
    label: 'ESA: Planck and the cosmic microwave background',
    what: 'a plain page on the oldest light: the fog lifting, the temperature, the tiny differences across the sky and the satellites that measured them. It gives the discovery as 1964, where this page says 1964 to 1965. (Read in full; page dated 21 March 2013.)',
  },
  {
    href: 'https://science.nasa.gov/mission/wmap/wmap-overview/',
    label: 'NASA: WMAP overview',
    what: 'the mission that measured tiny temperature differences across the sky. It gives the release as about 375,000 years after the Big Bang, where this page says about 380,000. (Read in part, the first 39,400 of about 48,600 characters; page updated 16 April 2026.)',
  },
  {
    href: 'https://arxiv.org/abs/0911.1955',
    label: 'Fixsen (2009): The Temperature of the Cosmic Microwave Background',
    what: 'the paper behind today’s temperature, 2.72548 ± 0.00057 K. A technical paper; the abstract is the readable part. (Abstract read only.)',
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

export function CosmicMicrowaveBackgroundExperiment({ onComplete, onTutorComplete }: CosmicMicrowaveBackgroundExperimentProps) {
  const [temperatureGuess, setTemperatureGuess] = useState<TemperatureGuess | null>(null)
  const [skyGuess, setSkyGuess] = useState<SkyGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ temperature: TemperatureGuess; sky: SkyGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [explained, setExplained] = useState(false)

  const [mode, setMode] = useState<MomentMode>('custom')
  const [customRedshift, setCustomRedshift] = useState(500)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const hasAllGuesses = temperatureGuess !== null && skyGuess !== null
  const locked = submitted !== null
  const shownTemperature = submitted?.temperature ?? temperatureGuess
  const shownSky = submitted?.sky ?? skyGuess

  // One animation per run: a fixed real duration (CLAUDE.md §11).
  useEffect(() => {
    if (!isRunning) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setProgress(p)
      if (p >= 1) {
        setIsRunning(false)
        setPart1Done(true)
        onCompleteRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [isRunning])

  const handleRun = () => {
    if (!hasAllGuesses || isRunning || part1Done) return
    if (!submitted) setSubmitted({ temperature: temperatureGuess!, sky: skyGuess! })
    setProgress(0)
    setIsRunning(true)
  }

  // Start over: clears the guesses, the run, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    setTemperatureGuess(null)
    setSkyGuess(null)
    setSubmitted(null)
    setPart1Done(false)
    setIsRunning(false)
    setProgress(0)
    setExplained(false)
    setMode('custom')
    setCustomRedshift(500)
  }

  const hasAnythingToClear = temperatureGuess !== null || skyGuess !== null || locked || part1Done
  const startOverDisabled = !hasAnythingToClear || isRunning

  // Part 1's picture: the light's redshift is 0 at the start of the run and the recombination redshift at its end.
  const part1Redshift = isRunning ? progress * RECOMBINATION_REDSHIFT : part1Done ? RECOMBINATION_REDSHIFT : 0
  const showReadout = isRunning || part1Done
  const readoutKelvin = cmbTemperatureKelvin(part1Redshift)

  // Part 2's own moment.
  const yourRedshift = mode === 'today' ? 0 : mode === 'recombination' ? RECOMBINATION_REDSHIFT : customRedshift
  const yourExample = cmbWorkedExample(yourRedshift)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 3: The Cosmic Microwave Background</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 14 November 2026 through helper summaries, so a quotation or figure on this page should be checked against the live page. No plain page from NASA or ESA was found that separates recombination from the moment light last
            scattered, or that gives the share of old TV static that came from the CMB, so this page explains them in its own words.
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
            <p style={smallNote}>Three more links, a plain ESA page, a NASA mission page and the paper behind today&rsquo;s temperature, appear here after your first Run, because their wording would give away what you are guessing.</p>
          )}
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make two guesses about the oldest light in the universe, then press Run and watch the light&rsquo;s journey from today back to the moment it was released. The pictures fill in as the journey goes. Your guesses are drawn on them in white. They never change the real pictures or the numbers.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="As you go back in time toward recombination, do you think the background temperature was higher, lower, or the same as it is today?"
            guessText={optionText(temperatureChoices, shownTemperature)}
          >
            <ChoiceButtons options={temperatureChoices} selected={shownTemperature} disabled={locked || isRunning} onSelect={setTemperatureGuess} />
          </Question>
          <Question
            prompt="Do you think the background's temperature is about the same in every direction of the sky, or does it vary a lot from direction to direction?"
            guessText={optionText(skyChoices, shownSky)}
          >
            <ChoiceButtons options={skyChoices} selected={shownSky} disabled={locked || isRunning} onSelect={setSkyGuess} />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your predictions are locked while you try other settings. To change them, press Start over. Start over clears your guesses, the run, the results and the tutor.
            </p>
          )}
        </div>

        <button type="button" className="action-button" onClick={handleRun} disabled={!hasAllGuesses || isRunning || part1Done} style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
          {isRunning ? 'Running...' : part1Done ? 'Run (done)' : 'Run: travel from today back to recombination'}
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

        {showReadout && (
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Redshift (z): {part1Redshift.toFixed(1)} &nbsp;|&nbsp; Background temperature: {fmtKelvin(readoutKelvin)} K
          </p>
        )}

        <Block>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The oldest light: its journey, its temperature and the sky it comes from</p>
          <CmbPicture mode="part1" redshift={part1Redshift} arrived={part1Done} guesses={part1Done ? submitted : null} />
          <Part1Caption arrived={part1Done} />
        </Block>

        {part1Done && (
          <Block>
            <WhereFrom>
              <strong>Measured by others:</strong> today&rsquo;s temperature, {CMB_TEMPERATURE_TODAY_KELVIN} K (several instruments, summarised in Fixsen, 2009: 2.72548 ± 0.00057 K); the difference between directions, about 1 part in 100,000 (ESA).{' '}
              <strong>Given, from published values, not derived here:</strong> the redshift of recombination, z ≈ {RECOMBINATION_REDSHIFT}, and the time after the Big Bang, about {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years.{' '}
              <strong>Calculated here:</strong> the temperature at recombination, {CMB_TEMPERATURE_TODAY_KELVIN} × (1 + {RECOMBINATION_REDSHIFT}) ≈ {fmtKelvin(cmbTemperatureKelvin(RECOMBINATION_REDSHIFT))} K; the position of every mark; the colours.{' '}
              <strong>Imagined for the question:</strong> the colour scale and the arrangement of the seven circles; the circles are an illustration, not a map of the sky. White is only ever your guess.
            </WhereFrom>
          </Block>
        )}
        {!part1Done && <p style={smallNote}>After you press Run, the marker travels back along the bar, the temperature panel, the sky circles, the strip and a &ldquo;Where the real picture comes from&rdquo; note appear, and Parts 2, 3 and 4 appear below.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              You will pick any moment in the light&rsquo;s journey, from today back to recombination, and see what the temperature of the background was then. A pink marker shows your moment on the same bar and the same temperature scale. Your guesses do not change the drawings or tables. These settings do.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Moment in cosmic history:</p>
              <button type="button" onClick={() => setMode('today')} className={`toggle-button${mode === 'today' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                Today (z = 0)
              </button>
              <button
                type="button"
                onClick={() => setMode('recombination')}
                className={`toggle-button${mode === 'recombination' ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                Recombination (about {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years after the Big Bang)
              </button>
              <button type="button" onClick={() => setMode('custom')} className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                Custom
              </button>
              {mode === 'custom' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="cmb-redshift" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Redshift: z = {customRedshift.toFixed(1)}
                  </label>
                  <input
                    id="cmb-redshift"
                    type="range"
                    min={0}
                    max={RECOMBINATION_REDSHIFT}
                    step={0.1}
                    value={customRedshift}
                    onChange={(event) => setCustomRedshift(Number(event.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
                Redshift (z): {yourRedshift.toFixed(1)} &nbsp;|&nbsp; Temperature: {fmtKelvin(yourExample.temperatureKelvin)} K &nbsp;|&nbsp; {yourExample.timesToday < 10 ? yourExample.timesToday.toFixed(2) : Math.round(yourExample.timesToday).toLocaleString('en-US')} times today&rsquo;s
              </p>
              <p style={smallNote}>
                Your guesses do not change the drawings or tables, but these settings do: they move the pink marker and its readout. The tables in Part 3 do not change with them. Press Start over to change a guess.
              </p>
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your moment: z = {yourRedshift.toFixed(1)}</p>
              <CmbPicture mode="part2" redshift={RECOMBINATION_REDSHIFT} arrived guesses={null} yourRedshift={yourRedshift} />
              <Part2Caption chosen />
            </Block>
            <Block>
              <WhereFrom>
                <strong>Calculated here</strong> from the moment you chose, by today&rsquo;s temperature × (1 + z). The green and amber marks are the same as in Part 1. <strong>Imagined for the question:</strong> your moment. Pink is only ever your own moment.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              You will read the numbers behind the pictures, a check-up of this page&rsquo;s numbers against published ones, and a short note on what the CMB is. The tables never change with your guesses or with Part 2&rsquo;s settings.
            </PartHeader>
            <CosmicMicrowaveBackgroundResults guesses={submitted} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              You will talk over what you saw. The tutor will ask three questions, then explain, and will say how each of your guesses compares.
            </PartHeader>
            {submitted && (
              <CosmicMicrowaveBackgroundTutor
                predictedTemperature={submitted.temperature}
                predictedSky={submitted.sky}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            )}
            {explained && <p style={{ ...smallNote, marginTop: '1rem' }}>You have reached the tutor&rsquo;s explanation. You can still pick another moment in Part 2; the tutor does not restart.</p>}
          </>
        )}
      </div>
    </div>
  )
}
