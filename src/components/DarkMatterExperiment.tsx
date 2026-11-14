import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  MARKER_STAR_RADII_KPC,
  MATCH_TOLERANCE,
  MAX_DARK_MATTER_AMOUNT,
  OBSERVED_SPEED_KM_PER_S,
  PUBLISHED_SUN_SPEED_EILERS_KM_PER_S,
  PUBLISHED_SUN_SPEED_REID_KM_PER_S,
  HYDROGEN_RED_LINE_NM,
  amountVerdict,
  dopplerShiftNanometres,
  enclosedMassFromSpeed,
  fractionOfLightSpeed,
  lapsInSimulatedSpan,
  matchingAmountBand,
  orbitalPeriodYears,
  rotationCurve,
  sirenShiftPercent,
  speedRatioForMassRatio,
  visibleEnclosedMass,
} from '../physics/darkMatterExperiment'
import type { MeasuredGuess, SpeedGuess } from '../physics/darkMatterExperiment'
import { DarkMatterResults } from './DarkMatterResults'
import { DarkMatterTutor } from './DarkMatterTutor'
import { GalaxyPicture, GraphPicture, Part1GalaxyCaption, Part1GraphCaption, Part2GalaxyCaption, Part2GraphCaption } from './DarkMatterPictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 4, audited to the newer rules (docs/audit/cosmology/04-draft-wording.md, approved by the owner on 2026-11-14).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a
// real picture or table; they are drawn in white once the run has finished (§14, "Predictions and the Real Results").

interface DarkMatterExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// One run is a fixed real duration, whatever the amount (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 6000

const speedChoices: Array<{ value: SpeedGuess; label: string }> = [
  { value: 'faster', label: 'Faster' },
  { value: 'slower', label: 'Slower' },
  { value: 'same', label: 'About the same' },
]
const measuredChoices: Array<{ value: MeasuredGuess; label: string }> = [
  { value: 'match', label: 'They will match' },
  { value: 'faster', label: 'Faster than predicted' },
  { value: 'slower', label: 'Slower than predicted' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

type AmountMode = 'none' | 'match' | 'custom'

// A made-up speed for the introduction's Doppler example (not this page's measured reference).
const EXAMPLE_GAS_SPEED = 220

// ---- the introduction (no answers given: §12; "What happens" restored from the earlier page at the owner's request, 2026-11-14) ----
function Intro() {
  const para = { marginTop: 0, marginBottom: '0.75rem' } as const
  const li = { marginBottom: '0.5rem' } as const
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={para}>
        <strong>The question.</strong> Is the matter we can see in a galaxy all the matter there is?
      </p>
      <p style={{ ...para, marginBottom: '0.5rem' }}>
        <strong>What happens.</strong>
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={li}>
          <strong>Stars go round a galaxy the way planets go round the Sun.</strong> A galaxy is a huge family of stars, gas and dust held together by gravity. Each star moves sideways while gravity pulls it toward the middle, so instead of falling in or flying off it goes round in a circle,
          called an <strong>orbit</strong>. The Moon going round the Earth, and the Earth going round the Sun, are the same idea on a small scale.
        </li>
        <li style={li}>
          <strong>There is one &ldquo;just right&rdquo; speed.</strong> In the Orbits experiment (Gravity and Curved Spacetime) you found that, for a given mass and distance, there is one sideways speed that keeps an object circling. Go slower and it falls inward; go faster and it flies
          outward. Think of whirling a ball on a string: too slow and the ball drops toward your hand, too fast and the string is yanked tight.
        </li>
        <li style={li}>
          <strong>More pull needs a faster orbit.</strong> How hard gravity pulls depends on how much mass is <strong>inside</strong> the orbit, between the star and the centre. More mass inside means a stronger pull, and so a faster speed is needed to stay in orbit. A simple rule of this kind:
          if the mass inside becomes <strong>four times</strong> as large, the speed needed becomes <strong>{speedRatioForMassRatio(4)} times</strong> as large (because the speed grows with the square root of the mass, and the square root of 4 is {speedRatioForMassRatio(4)}).
        </li>
        <li style={li}>
          <strong>So speed lets us weigh a galaxy.</strong> Turn step 3 around. If we can measure how fast a star orbits at some distance, we can work out how much mass is inside that distance. Do it at several distances and you have weighed the galaxy, shell by shell, without a scale. That is
          the plan of this experiment.
        </li>
        <li style={li}>
          <strong>How we measure the speeds.</strong>
          <ul style={{ marginTop: '0.25rem', paddingLeft: '1.1rem' }}>
            <li>
              <em>Why light.</em> Nobody can fly out to a galaxy with a stopwatch. A galaxy is thousands of light-years across, and the nearest big one is millions of light-years away. But its light reaches us, and light carries a hidden message about motion.
            </li>
            <li>
              <em>A sound you know.</em> An ambulance siren sounds higher as it comes toward you and lower as it goes away. The siren has not changed; the sound waves are squeezed together as it approaches and stretched apart as it leaves, and your ear reads that as a higher or lower
              note. This is the <strong>Doppler effect</strong>. Light is a wave too, so the same thing happens to light: a source moving toward us squeezes its light waves, which shifts the light toward blue, and a source moving away stretches them, which shifts it toward red.
            </li>
            <li>
              <em>A fixed marker to measure against.</em> Glowing gas in a galaxy gives off light at certain exact colours, like a note played on a tuning fork. In a laboratory, the red glow of hydrogen has a wavelength of {HYDROGEN_RED_LINE_NM} nanometres (a nanometre is a billionth of a metre).
              If the gas is moving, that colour is a little different. The size of the change tells us the speed.
            </li>
            <li>
              <em>A worked example, with a made-up speed.</em> Suppose gas is moving toward us at {EXAMPLE_GAS_SPEED} km/s. The change in wavelength is the wavelength times the speed divided by the speed of light: {HYDROGEN_RED_LINE_NM} × {EXAMPLE_GAS_SPEED} ÷ 299,792 = about{' '}
              <strong>{dopplerShiftNanometres(EXAMPLE_GAS_SPEED).toFixed(2)} nanometres</strong>. So the red line would move from {HYDROGEN_RED_LINE_NM} to about {(HYDROGEN_RED_LINE_NM - dopplerShiftNanometres(EXAMPLE_GAS_SPEED)).toFixed(1)} nanometres. That is{' '}
              {(fractionOfLightSpeed(EXAMPLE_GAS_SPEED) * 100).toFixed(2)} percent, less than one part in a thousand. A car&rsquo;s siren shifts by far more: a car doing 30 metres per second (108 km/h) changes a siren&rsquo;s pitch by about{' '}
              {Math.round(sirenShiftPercent(30))} percent, which is about <strong>{Math.round(sirenShiftPercent(30) / (fractionOfLightSpeed(EXAMPLE_GAS_SPEED) * 100) / 10) * 10} times</strong> bigger than this galaxy shift. Astronomers&rsquo; instruments are good enough to measure the tiny one.
            </li>
            <li>
              <em>Two sides of a galaxy.</em> A galaxy is turning, so seen from the side, one edge is coming toward us and the opposite edge is going away. The first is shifted toward blue and the second toward red, and the two shifts, taken together, tell us how fast the galaxy is turning
              at that distance from its middle. Measuring at many distances builds the whole graph of speed against distance that you will see on this page.
            </li>
          </ul>
        </li>
        <li style={li}>
          <strong>Two ways to count the mass.</strong>
          <ul style={{ marginTop: '0.25rem', paddingLeft: '1.1rem' }}>
            <li>
              <em>Count 1, from light.</em> Stars give off light, and a brighter star generally has more mass than a fainter one. Astronomers add up the light of all the stars in a galaxy and turn it into an estimate of their mass. They do the same for glowing gas. The total is the{' '}
              <strong>visible matter</strong>. It is like estimating how many people are in a stadium by counting the lit windows: you only count what you can see.
            </li>
            <li>
              <em>Count 2, from gravity.</em> Step 3 gave us the rule that links speed and mass inside the orbit. Turned around it says: the mass inside an orbit is the speed squared times the distance, divided by the gravity constant (M = v² × r ÷ G).{' '}
              <strong>A made-up example, not this page&rsquo;s numbers:</strong> a star 10 kpc from the centre moving at 100 km/s would mean about 100² × 10 ÷ (4.3 × 10⁻⁶) = <strong>{(enclosedMassFromSpeed(100, 10) / 1e10).toFixed(1)} × 10¹⁰ solar masses</strong> inside 10 kpc. Gravity does
              not care whether that mass shines. It counts everything that pulls, lit or not.
            </li>
            <li>
              <em>Why the two counts are independent.</em> Count 1 asks &ldquo;how much light is there?&rdquo;, and Count 2 asks &ldquo;how hard is gravity pulling?&rdquo;. They use different measurements and different rules, so they do not share a mistake. That is what makes
              comparing them useful.
            </li>
            <li>
              <em>What &ldquo;visible&rdquo; covers here.</em> The visible matter in this page&rsquo;s model is a smooth shape: a lot near the bright middle, thinning out toward the edge. It is a teaching model made up for this experiment, not a map of a real galaxy.
            </li>
          </ul>
        </li>
        <li style={li}>
          <strong>Do the two counts agree?</strong>
          <ul style={{ marginTop: '0.25rem', paddingLeft: '1.1rem' }}>
            <li>
              <em>The three possibilities.</em> Put the two counts side by side. (a) <strong>They agree:</strong> then the matter we can see is all the matter there is. (b) <strong>Count 2 is bigger:</strong> then something is pulling on the stars that gives off no light. (c){' '}
              <strong>Count 2 is smaller:</strong> this would mean the light count is too large, and would be a puzzle of a different kind. Which one holds is the question; this page does not say before you have guessed.
            </li>
            <li>
              <em>What &ldquo;dark&rdquo; means, and what it does not.</em> &ldquo;Dark&rdquo; here does not mean &ldquo;dim&rdquo;. A cold, faint planet or a cloud of dust is dim, but it is ordinary matter, and it can be spotted because it blocks, absorbs or gives off some light. NASA
              describes dark matter as matter that does not absorb, reflect or emit any light, so telescopes cannot see it at all; its presence shows up only through its gravity.
            </li>
            <li>
              <em>The name.</em> The name for matter that gives off no light, but still pulls on other things with gravity, is <strong>dark matter</strong>. A mismatch between the two counts would be a clue, not yet an answer: it would tell you that something is missing, not what it is.
            </li>
            <li>
              <em>What this experiment does and does not say.</em> It asks how much extra mass a model galaxy would need, and shows you that. It makes no claim about what dark matter is made of. The purple glow you will see in Part 2 is only a shape that supplies the extra mass.
            </li>
            <li>
              <em>A daily-life picture.</em> You carry a bag and feel it is heavy, but when you look inside, the contents you can see add up to much less than the weight. You would suspect there is something at the bottom you have not noticed. A mismatch between &ldquo;what I can see&rdquo; and
              &ldquo;what the scale says&rdquo; is exactly such a clue.
            </li>
          </ul>
        </li>
        <li style={li}>
          <strong>What you do.</strong> You make two guesses first. Then you watch a model galaxy made only of the matter we can see, and two lines are drawn. Later you add some invisible matter yourself and see what changes.
        </li>
      </ol>
      <p style={para}>
        <strong>A daily-life picture.</strong> Whirl a ball on a string. The faster the ball goes, the harder the string has to pull it inward, so if you could feel only the string&rsquo;s pull, you could tell how fast the ball was moving. A worked sum: a 1 kg ball whirled at 2 m/s on a
        1 m string needs a pull of 1 × 2² ÷ 1 = 4 newtons, and at 4 m/s it needs 1 × 4² ÷ 1 = 16 newtons, four times as much. In the same way, how fast stars orbit tells us how hard gravity is pulling them inward, and so how much mass is doing the pulling.
      </p>
      <p style={para}>
        <strong>A sealed-box picture.</strong> Imagine a sealed, opaque box with only a small window. Through the window you can see some of what is inside. Then you weigh the whole box on a scale. If the scale reads far more than the contents you can see should weigh, something you cannot
        see is also in there. Astronomers do the same with galaxies: the &ldquo;window&rdquo; is the light we can see, and the &ldquo;scale&rdquo; is gravity, read from how fast stars orbit.
      </p>
      <p style={para}>
        <strong>New terms.</strong> Distances here are in <strong>kiloparsecs (kpc)</strong>. One kiloparsec is about 3,260 light-years. Our Sun is roughly 8 kpc from the centre of the Milky Way. A graph of how fast things orbit at different distances from the centre is called a{' '}
        <strong>rotation curve</strong>. Masses are measured in <strong>solar masses</strong>, where one solar mass is the mass of our Sun.
      </p>
      <p style={para}>
        <strong>What you will do.</strong> Below, the page has four parts. <strong>Part 1</strong> asks for two guesses, then you press Run and watch stars orbit a galaxy that has only the matter we can see, while two lines are drawn on a graph. <strong>Part 2</strong> lets you add some
        invisible matter yourself and see what changes. <strong>Part 3</strong> gives the results, with a short guide to reading them. <strong>Part 4</strong> is a tutor who talks it over with you.
      </p>
      <p style={para}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables. After you press Run they are drawn on the graph in <strong>white</strong>, and shown again beside the results. The amount of dark matter in Part 2 does change the purple
        line, the purple glow and the speed of the stars, and nothing else.
      </p>
      <p style={{ ...para, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          Ordinary Newtonian gravity is used (gravity as Newton described it). The speeds here (about {OBSERVED_SPEED_KM_PER_S} km/s) are tiny compared with the speed of light, so general relativity is not needed.
        </li>
        <li>
          Each star moves in a circle, and gravity depends only on the mass inside its orbit. Real galaxies are mostly flat disks, so this is a simplification, but it gives the right overall picture.
        </li>
        <li>
          The mass shapes used here are simple formulas, not a fit to one real galaxy. Their numbers were chosen so that, when the right amount of dark matter is added, the speeds land near the Milky Way&rsquo;s measured values. The &ldquo;visible matter only&rdquo; line is therefore a
          calculation from a teaching model, not a measurement.
        </li>
        <li>
          The &ldquo;measured&rdquo; speed is a single reference value of <strong>{OBSERVED_SPEED_KM_PER_S} km/s</strong>, rounded, for the Milky Way near the Sun. Published measurements give a little more ({PUBLISHED_SUN_SPEED_EILERS_KM_PER_S.toFixed(0)} and{' '}
          {PUBLISHED_SUN_SPEED_REID_KM_PER_S} km/s in two papers), and other galaxies have values of their own. Real measured curves are not perfectly flat. The line is a given value, not worked out here.
        </li>
        <li>Only the outer galaxy is shown, from 5 to 30 kpc from the centre. The crowded inner region needs a more detailed model and is not covered.</li>
        <li>Nothing here claims to say what dark matter is. The purple glow is just a shape that supplies extra mass.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> galaxy, orbit, solar mass, kiloparsec, light-year, km/s, rotation curve, visible matter, dark matter, halo, Doppler effect, wavelength, nanometre, blueshift and redshift, Newtonian gravity, enclosed mass, circular speed. The &ldquo;Words and formulas&rdquo; box below has each one with a short
        meaning.
      </p>
    </div>
  )
}

// ---- the words box: the formula's worked example (it gives the blue line's value) waits until after the first Run ----
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const sun = rotationCurve(0, [8])[0]
  const mass8 = visibleEnclosedMass(8)
  const lapMillion = orbitalPeriodYears(8, sun.visibleOnlySpeedKmPerS) / 1e6
  const entries = [
    { term: 'Galaxy', meaning: 'a huge family of stars, gas and dust held together by gravity. Our own is the Milky Way.' },
    { term: 'Orbit', meaning: 'the curved path a star or planet takes around something heavier because of gravity.' },
    { term: 'Gravity', meaning: 'the pull that every bit of matter has on every other bit.' },
    { term: 'Mass', meaning: 'how much matter something has.' },
    { term: 'Solar mass', meaning: 'a unit of mass: the mass of our Sun.' },
    { term: 'Kiloparsec (kpc)', meaning: 'a unit of distance: about 3,260 light-years.' },
    { term: 'Light-year', meaning: 'the distance light travels in one year.' },
    { term: 'km/s', meaning: `kilometres per second. ${OBSERVED_SPEED_KM_PER_S} km/s is about 800,000 km an hour.` },
    { term: 'Rotation curve', meaning: 'a graph of how fast things orbit at different distances from the centre.' },
    { term: 'Visible matter', meaning: 'the matter we can see because it gives off light: stars and glowing gas.' },
    { term: 'Dark matter', meaning: 'matter that gives off no light, but still pulls on other things with gravity.' },
    { term: 'Halo', meaning: 'a large, roughly ball-shaped cloud around a galaxy. Here, the shape that holds the dark matter.' },
    { term: 'Doppler effect', meaning: 'a change in the colour (or pitch) of waves because the source is moving toward or away from us.' },
    { term: 'Wavelength', meaning: 'the distance from one crest of a wave to the next. For light, it decides the colour.' },
    { term: 'Nanometre (nm)', meaning: 'a billionth of a metre. Visible light has wavelengths of a few hundred nanometres.' },
    { term: 'Blueshift and redshift', meaning: 'the shift of light toward blue (shorter waves) when its source moves toward us, and toward red (longer waves) when it moves away.' },
    { term: 'Newtonian gravity', meaning: 'gravity as Newton described it. Good enough at these speeds, which are far below the speed of light.' },
    { term: 'Enclosed mass', meaning: "all the mass inside a star's orbit. Only this decides the star's speed, in this model." },
    { term: 'Circular speed', meaning: 'the speed a star needs to stay on a circular orbit.' },
  ]
  if (afterRun) {
    entries.push({
      term: 'Formula, with a worked example',
      meaning: `v = √(G × M ÷ r), with G = 4.3×10⁻⁶ in these units. At 8 kpc, M = ${(mass8 / 1e10).toFixed(1)}×10¹⁰ solar masses: v = √(4.3×10⁻⁶ × ${(mass8 / 1e10).toFixed(1)}×10¹⁰ ÷ 8) ≈ ${sun.visibleOnlySpeedKmPerS.toFixed(0)} km/s. One lap: time = 2 × π × r ÷ v; at 8 kpc and ${sun.visibleOnlySpeedKmPerS.toFixed(0)} km/s that is about ${lapMillion.toFixed(0)} million years.`,
    })
  } else {
    entries.push({ term: 'More words', meaning: 'the formula and its worked example appear here after your first run, because the numbers in it would give away what you are about to guess.' })
  }
  return entries
}

// ---- links (pages read or fetched 2026-11-14; see the draft's source table). The pages that say how fast far stars move, or how much dark
// matter there is, would give away the guesses, so they appear after the first Run (§12). ----
const LINKS_BEFORE: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://science.nasa.gov/asset/webb/doppler-shift-of-a-stars-spectrum/',
    label: 'NASA: Doppler Shift of a Star’s Spectrum',
    what: 'a short NASA picture and caption showing how a moving star’s light is shifted toward blue or red. It is about a star, not a galaxy. (Read; page updated 28 August 2025.)',
  },
  {
    href: 'https://imagine.gsfc.nasa.gov/features/cosmic/milkyway_info.html',
    label: 'NASA Imagine the Universe: The Milky Way',
    what: 'NASA’s facts on the Milky Way’s size, with kiloparsecs and the Sun’s distance from the centre. (Read; page updated 15 May 2025. This host was reported not loading on 25 October 2026 and loaded on 14 November 2026.)',
  },
  {
    href: 'https://starchild.gsfc.nasa.gov/docs/StarChild/questions/question18.html',
    label: 'NASA Starchild: how long does the Sun take to orbit the galaxy?',
    what: 'a short NASA answer: about 230 million years for one lap. Written in 2000. (Read.)',
  },
]
const LINKS_AFTER: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://science.nasa.gov/dark-matter/',
    label: 'NASA: Dark Matter',
    what: 'a plain NASA overview of what dark matter is, how astronomers found it by watching how fast stars in galaxies move, and how much of the universe it makes up. (Read; page dated 12 August 2026.)',
  },
  {
    href: 'https://science.nasa.gov/universe/stories/quick-reads/dark-matter-101-looking-for-the-missing-mass/',
    label: 'NASA: Dark Matter 101, Looking for the Missing Mass',
    what: 'a short NASA story on why astronomers needed “missing mass” to explain spiral galaxies. (Read.)',
  },
  {
    href: 'https://spaceplace.nasa.gov/dark-matter/en/',
    label: 'NASA Space Place: What Is Dark Matter?',
    what: 'a short, simple NASA explainer written for young readers. (Read.)',
  },
  {
    href: 'https://sci.esa.int/web/euclid/-/what-is-dark-matter-',
    label: 'ESA Euclid: What is dark matter?',
    what: 'a European Space Agency explainer that follows the story from the first galaxy-speed measurements to today. (Read; published 8 September 2020.)',
  },
  {
    href: 'https://physicstoday.aip.org/opinion/seeing-dark-matter-in-the-andromeda-galaxy',
    label: 'Physics Today: Seeing dark matter in the Andromeda galaxy',
    what: 'an account of the 1970 Andromeda measurements. Aimed at a reader with some science background. (Read; the author and date were not captured, so check them on the page.)',
  },
  {
    href: 'https://arxiv.org/abs/1810.09466',
    label: 'The Milky Way’s circular speed, 5 to 25 kpc (Eilers and others, 2018)',
    what: 'the paper behind the value near 229 km/s. A technical paper; the abstract (summary) is the readable part. (Abstract read only.)',
  },
  {
    href: 'https://arxiv.org/abs/1401.5377',
    label: 'The structure and speed of the Milky Way (Reid and others, 2014)',
    what: 'the paper behind the value near 240 km/s. A technical paper; the abstract is the readable part. (Abstract read only.)',
  },
  {
    href: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
    label: 'NASA Planetary Fact Sheet',
    what: 'a table of facts on each planet, including how fast each one moves around the Sun. A table, not a story. (Read; updated 13 November 2026.)',
  },
  {
    href: 'https://science.nasa.gov/neptune/neptune-facts/',
    label: 'NASA: Neptune Facts',
    what: 'NASA’s facts on Neptune, including how the planet was predicted from the odd path of Uranus in 1846. (Read; updated 15 October 2026.)',
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

export function DarkMatterExperiment({ onComplete, onTutorComplete }: DarkMatterExperimentProps) {
  const [speedGuess, setSpeedGuess] = useState<SpeedGuess | null>(null)
  const [measuredGuess, setMeasuredGuess] = useState<MeasuredGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ speed: SpeedGuess; measured: MeasuredGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  const [part1Running, setPart1Running] = useState(false)
  const [part1Progress, setPart1Progress] = useState(0)
  const [explained, setExplained] = useState(false)

  const [mode, setMode] = useState<AmountMode>('match')
  const [customAmount, setCustomAmount] = useState(0.5)
  const [part2Running, setPart2Running] = useState(false)
  const [part2Progress, setPart2Progress] = useState(0)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const hasAllGuesses = speedGuess !== null && measuredGuess !== null
  const locked = submitted !== null
  const shownSpeed = submitted?.speed ?? speedGuess
  const shownMeasured = submitted?.measured ?? measuredGuess
  const amount = mode === 'none' ? 0 : mode === 'match' ? 1 : customAmount

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

  // Part 2's animation: the stars at the speeds of the chosen amount, over the same fixed duration.
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
    if (!submitted) setSubmitted({ speed: speedGuess!, measured: measuredGuess! })
    setPart1Progress(0)
    setPart1Running(true)
  }

  // Changing the amount changes only Part 2's drawing: it never hides Parts 3 and 4 or restarts the tutor.
  const handleModeChange = (next: AmountMode) => {
    setMode(next)
    if (!part2Running) setPart2Progress(0)
  }

  const handlePart2Run = () => {
    if (part2Running) return
    setPart2Progress(0)
    setPart2Running(true)
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    setSpeedGuess(null)
    setMeasuredGuess(null)
    setSubmitted(null)
    setPart1Done(false)
    setPart1Running(false)
    setPart1Progress(0)
    setExplained(false)
    setMode('match')
    setCustomAmount(0.5)
    setPart2Running(false)
    setPart2Progress(0)
  }

  const hasAnythingToClear = speedGuess !== null || measuredGuess !== null || locked || part1Done
  const startOverDisabled = !hasAnythingToClear || part1Running

  const started = part1Running || part1Done
  const shownProgress1 = part1Done ? 1 : part1Progress
  const part1Stars = rotationCurve(0, MARKER_STAR_RADII_KPC).map((p) => ({
    ...p,
    periodYears: orbitalPeriodYears(p.radiusKpc, p.visibleOnlySpeedKmPerS),
    laps: lapsInSimulatedSpan(p.radiusKpc, p.visibleOnlySpeedKmPerS) * shownProgress1,
  }))

  const verdict = amountVerdict(amount)
  const band = matchingAmountBand()

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 4: Dark Matter</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 14 November 2026 through helper summaries, so a quotation or figure on this page should be checked against the live page. No plain page from NASA or ESA was found for MOND (an idea that changes the law of gravity instead of adding
            matter), so this page does not discuss it, and Rubin and Ford&rsquo;s original 1970 and 1980 papers could not be fetched, so they are not linked.
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
            <p style={smallNote}>Nine more links, on dark matter, the first galaxy-speed measurements, the published speeds of the Sun and the planets, appear here after your first Run, because their wording would give away what you are guessing.</p>
          )}
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make two guesses. Then you will press Run and watch a galaxy made only of the matter we can see: three stars orbit it, and two lines are drawn on a graph. Your guesses are drawn on the graph in white. Nothing you guess changes the real picture.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="If the stars and gas we can see were all the mass in the galaxy, how would the orbit speed of a star far from the centre compare with a star nearer the centre?"
            guessText={optionText(speedChoices, shownSpeed)}
          >
            <ChoiceButtons options={speedChoices} selected={shownSpeed} disabled={locked || part1Running} onSelect={setSpeedGuess} />
          </Question>
          <Question
            prompt="Astronomers measure the real speeds of far-out stars. Do you think the measured speeds will match what the visible matter predicts?"
            guessText={optionText(measuredChoices, shownMeasured)}
          >
            <ChoiceButtons options={measuredChoices} selected={shownMeasured} disabled={locked || part1Running} onSelect={setMeasuredGuess} />
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
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {part1Stars.map((s, i) => (
              <span key={s.radiusKpc}>
                {i > 0 && <br />}
                Star at {s.radiusKpc} kpc: {s.visibleOnlySpeedKmPerS.toFixed(0)} km/s &nbsp;|&nbsp; one lap every {(s.periodYears / 1e6).toFixed(0)} million years &nbsp;|&nbsp; laps so far: {s.laps.toFixed(1)}
              </span>
            ))}
          </p>
        )}

        <Block>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 1: the galaxy with only the matter we can see</p>
          <GalaxyPicture amount={0} progress={shownProgress1} showHalo={false} showSpeeds={started} />
          <Part1GalaxyCaption started={started} arrived={part1Done} />
        </Block>
        <Block>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 2: the speeds its stars need, against distance</p>
          <GraphPicture drawn={started ? shownProgress1 : null} amount={null} guesses={part1Done ? submitted : null} />
          {started ? <Part1GraphCaption started={started} arrived={part1Done} /> : null}
        </Block>

        {part1Done && (
          <Block>
            <WhereFrom>
              <strong>Measured:</strong> the green dashed line, <strong>{OBSERVED_SPEED_KM_PER_S} km/s</strong>, is a rounded reference value for the Milky Way near the Sun. Published measurements are a little higher ({PUBLISHED_SUN_SPEED_EILERS_KM_PER_S.toFixed(0)} km/s, Eilers and others 2018;{' '}
              {PUBLISHED_SUN_SPEED_REID_KM_PER_S} km/s, Reid and others 2014). It is given, not worked out here. <strong>Calculated here:</strong> the blue line, from a teaching model of the galaxy&rsquo;s visible matter, using v = √(G × M ÷ r); the stars&rsquo; speeds, the length of each
              lap and the number of laps follow from it. The model was made up for this experiment; it is not a fit to a real galaxy. <strong>Imagined for the question:</strong> the three stars&rsquo; positions, the galaxy seen from above, and (in Part 2) the purple glow and the amount of
              dark matter. Nobody has photographed dark matter. White is only ever your guess.
            </WhereFrom>
          </Block>
        )}
        {!started && <p style={smallNote}>After you press Run, the stars start to orbit, the blue and green lines are drawn on the graph, and a caption appears. When the run ends your white guess marks and a &ldquo;Where the real picture comes from&rdquo; note appear, and Parts 2, 3 and 4 appear below.</p>}
        {started && !part1Done && <p style={smallNote}>Your white guess marks and Parts 2, 3 and 4 appear when the run ends.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now add some invisible matter yourself. Pick an amount of dark matter. A purple line is drawn on the graph, the purple glow appears around the galaxy, and the three stars speed up or slow down. Press Run to watch them. Your guesses do not change anything here; the amount does.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Amount of dark matter:</p>
              <button type="button" onClick={() => handleModeChange('none')} className={`toggle-button${mode === 'none' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                None (visible matter only)
              </button>
              <button type="button" onClick={() => handleModeChange('match')} className={`toggle-button${mode === 'match' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                The amount that matches the measured speed
              </button>
              <button type="button" onClick={() => handleModeChange('custom')} className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                Custom
              </button>
              {mode === 'custom' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="dark-matter-amount" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Dark matter: {customAmount.toFixed(2)} × the amount that matches the measured speed
                  </label>
                  <input
                    id="dark-matter-amount"
                    type="range"
                    min={0}
                    max={MAX_DARK_MATTER_AMOUNT}
                    step={0.05}
                    value={customAmount}
                    onChange={(event) => {
                      setCustomAmount(Number(event.target.value))
                      if (!part2Running) setPart2Progress(0)
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <button type="button" className="action-button" onClick={handlePart2Run} disabled={part2Running} style={{ padding: '0.5rem 1.5rem' }}>
                  {part2Running ? 'Running...' : 'Run: watch the stars with your dark matter'}
                </button>
              </div>
              <p style={smallNote}>
                Your predictions are locked while you try other settings. Your guesses do not change the drawings or tables, but this amount does: it changes the purple line, the purple glow and the stars&rsquo; speed, and the &ldquo;With your dark matter&rdquo; column in Part 3. Every
                other number stays the same. These amounts are <strong>trial values</strong>: they show what would happen if there were that much dark matter, and they do not say the real galaxy has it.
              </p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', marginBottom: 0 }}>
                {verdict === 'match'
                  ? `With this amount, the predicted speed stays within ${Math.round(MATCH_TOLERANCE * 100)} percent of ${OBSERVED_SPEED_KM_PER_S} km/s at every distance from 5 to 30 kpc.`
                  : verdict === 'too-little'
                    ? `With this amount, the predicted speed still falls more than ${Math.round(MATCH_TOLERANCE * 100)} percent short of ${OBSERVED_SPEED_KM_PER_S} km/s at some distances.`
                    : `With this amount, the predicted speed goes more than ${Math.round(MATCH_TOLERANCE * 100)} percent above ${OBSERVED_SPEED_KM_PER_S} km/s at some distances.`}{' '}
                The &ldquo;within {Math.round(MATCH_TOLERANCE * 100)} percent&rdquo; rule is this page&rsquo;s own, not a published cut-off. Amounts from about {band.low.toFixed(2)} to {band.high.toFixed(2)} times the matching amount meet it.
              </p>
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 3: the galaxy with your dark matter ({amount.toFixed(2)} × the matching amount)</p>
              <GalaxyPicture amount={amount} progress={part2Progress} showHalo showSpeeds />
              <Part2GalaxyCaption amount={amount} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 4: the speeds with your dark matter, against distance</p>
              <GraphPicture drawn={1} amount={amount} guesses={null} />
              <Part2GraphCaption amount={amount} />
            </Block>
            <Block>
              <WhereFrom>
                <strong>Calculated here</strong> from the amount you chose: the purple line, the speeds and the laps. The blue and green lines are the same as in Part 1. <strong>Imagined for the question:</strong> the amount of dark matter and the purple glow; real dark matter gives off no light.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pictures. Table 1 sets the page&rsquo;s numbers beside the values astronomers report. Table 2 gives the speeds at three distances. Your guesses are shown beside the tables, and nothing you guess changes a number in either table. Only the
              &ldquo;With your dark matter&rdquo; column in Table 2 follows the amount you chose in Part 2.
            </PartHeader>
            <DarkMatterResults guesses={submitted} amount={amount} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              You will talk over what you saw. The tutor will ask three questions, then explain, and will say how each of your guesses compares.
            </PartHeader>
            {submitted && (
              <DarkMatterTutor
                predictedSpeed={submitted.speed}
                predictedMeasured={submitted.measured}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            )}
            {explained && <p style={{ ...smallNote, marginTop: '1rem' }}>You have reached the tutor&rsquo;s explanation. You can still try another amount in Part 2; the tutor does not restart.</p>}
          </>
        )}
      </div>
    </div>
  )
}
