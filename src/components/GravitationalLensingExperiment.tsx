import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  MAX_LENS_MASS_SOLAR_MASSES,
  MIN_LENS_MASS_SOLAR_MASSES,
  OBSERVED_TOTAL_MASS_SOLAR_MASSES,
  PUBLISHED_NASA_HUBBLE_RANGES,
  coinDistanceKm,
  observedBendArcseconds,
  ringFormulaExample,
  runGravitationalLensingExperiment,
  visibleOnlyMassSolarMasses,
  yourComparison,
} from '../physics/gravitationalLensingExperiment'
import type { FourTimesGuess, RingSizeGuess } from '../physics/gravitationalLensingExperiment'
import { GravitationalLensingResults } from './GravitationalLensingResults'
import { GravitationalLensingTutor } from './GravitationalLensingTutor'
import { LineUpSchematic, MassGraph, Part1GraphCaption, Part1SideCaption, Part1SkyCaption, Part2Caption, SideView, SkyView, massLabel } from './GravitationalLensingPictures'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { PartHeader } from './GravitationalWaveExperiment'
import { Block, ExternalLink, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 7, audited to the newer rules (docs/audit/cosmology/07-draft-wording.md, approved by the owner on 2026-11-15).
// Every number comes from the physics module; this file only draws and words it (CLAUDE.md §9). The learner's guesses never change a real
// picture or table; they are drawn in white once the run has finished (§14, "Predictions and the Real Results").

interface GravitationalLensingExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type MassMode = 'visible' | 'observed' | 'custom'

// Real pictures for the introduction, copied into public/images/lensing (docs/audit/cosmology/07-draft-wording.md, addendum of 2026-11-15).
// ESA/Hubble images are Creative Commons Attribution 4.0 (https://esahubble.org/copyright/): the credit is shown in full with a link, and the
// one change (a crop) is said. NASA images are generally not subject to copyright (https://www.nasa.gov/nasa-brand-center/images-and-media/);
// NASA is acknowledged and no third-party mark was found on either.
const BASE = import.meta.env.BASE_URL
const LENSING_DIAGRAM_IMAGE = `${BASE}images/lensing/lensing-diagram-nasa-stsci.png`
const HORSESHOE_IMAGE = `${BASE}images/lensing/cosmic-horseshoe-esa-hubble-potw1151a-crop.jpg`
const CLUSTER_0024_IMAGE = `${BASE}images/lensing/cluster-0024-1654-esa-hubble-opo9610a.jpg`
const ABELL_1689_IMAGE = `${BASE}images/lensing/abell-1689-nasa-hubble-acs.jpg`
const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#000',
} as const

// One run is a fixed real duration, whatever the mass (CLAUDE.md §11). The first part sends light from the source to Earth; the rest draws the rings.
const ANIMATION_DURATION_MS = 8000
const TRAVEL_FRACTION = 0.6

// The two guess questions are kept exactly as the owner approved them on 2026-10-08.
const ringSizeChoices: Array<{ value: RingSizeGuess; label: string }> = [
  { value: 'larger', label: 'Larger' },
  { value: 'same', label: 'The same size' },
  { value: 'smaller', label: 'Smaller' },
]
const fourTimesChoices: Array<{ value: FourTimesGuess; label: string }> = [
  { value: 'four', label: 'Four times as wide' },
  { value: 'two', label: 'Twice as wide' },
  { value: 'same', label: 'About the same' },
]
const optionText = (options: Array<{ value: string; label: string }>, value: string | null) => options.find((o) => o.value === value)?.label ?? null

function Figure({ children, caption, credit }: { children: ReactNode; caption: ReactNode; credit?: ReactNode }) {
  return (
    <figure style={{ margin: '1rem 0', padding: 0 }}>
      {children}
      <figcaption style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
        {caption}
        {credit && (
          <>
            {' '}
            <span style={{ fontSize: '0.75rem' }}>{credit}</span>
          </>
        )}
      </figcaption>
    </figure>
  )
}

// ---- the introduction (long and step by step at the owner's instruction, 2026-11-15; no answers given: §12) ----
function Intro() {
  const p = { marginTop: 0, marginBottom: '0.75rem' } as const
  const list = { marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' } as const
  const coinKm = coinDistanceKm(1)
  const ranges = PUBLISHED_NASA_HUBBLE_RANGES
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={p}>
        <strong>The question.</strong> How do you weigh something as huge as a galaxy cluster, and what can its effect on light tell us about what it is made of?
      </p>
      <p style={p}>
        <strong>What happens.</strong> In this experiment you watch what happens to the light of a very distant galaxy as it passes a galaxy cluster on its way to us. First you make two guesses. Then you press <strong>Run</strong>. The light travels from the distant galaxy, bends around the cluster and reaches Earth, and then a picture of the sky shows what we would see through a telescope: the light drawn into a ring round the cluster. Your guesses are drawn on the pictures in white. In <strong>Part 2</strong> you choose the cluster&rsquo;s mass yourself and watch the ring for it being drawn. The results and a tutor follow.
      </p>
      <p style={p}>
        <strong>Step 1: a reminder, gravity bends light.</strong> In Gravity and Curved Spacetime Experiment 8 you saw that light passing near a mass is bent toward it. <em>Bent</em> means its path turns slightly; the light does not slow down or stop. The first big test was a solar eclipse on 29 May 1919: Eddington, Dyson and Crommelin took pictures of stars near the darkened Sun, from Sobral in Brazil and from Pr&iacute;ncipe, to see whether the Sun&rsquo;s gravity moved their apparent places (NASA).
      </p>
      <p style={p}>
        <strong>Step 2: what a lens is.</strong> The glass in a magnifying glass or in spectacles is shaped so that the light going through it is bent. All the rays that pass through are bent toward the same place, so a lens can gather light, make things look bigger or smear them. A <strong>gravitational lens</strong> does the same job with no glass at all: a massive object bends the light of whatever lies behind it. NASA puts it this way: &ldquo;Gravity can act like a lens, magnifying and distorting the light of distant objects that would otherwise be invisible.&rdquo;
      </p>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>Step 3: three players.</strong> Three things take part, and you will meet all three on the pictures.
      </p>
      <ul style={list}>
        <li>
          The <strong>source</strong>: a very distant galaxy whose light we are trying to see.
        </li>
        <li>
          The <strong>lens</strong>: a <strong>galaxy cluster</strong> that happens to lie between the source and us. A galaxy cluster is a huge group of galaxies held together by gravity. The cluster used here is like <strong>Abell 1689</strong>, which has about 1,000 galaxies and trillions of stars and is about 2.2 billion light-years away (ESA/Hubble).
        </li>
        <li>
          <strong>Us</strong>: the Earth.
        </li>
      </ul>
      <p style={p}>
        Light leaves the source in every direction. Some of it passes close to the cluster. The cluster&rsquo;s gravity bends that light toward itself, and some of the bent light ends up reaching Earth. Without the cluster, that light would have gone straight past and missed us.
      </p>
      <Figure
        caption={
          <>
            <strong>A picture of the idea (NASA).</strong> The distant galaxy is at the far left, the galaxy cluster is in the middle and Earth is at the right. Three paths of light leave the galaxy. The middle path goes straight. The other two, on either side, are bent by the cluster&rsquo;s gravity and redirected toward Earth; the dashed lines show where they would have gone without the bend. NASA says an observer on Earth then sees the distant object appear brighter than it would if it were not lensed. The drawing is a NASA illustration and is not to scale.
          </>
        }
        credit={
          <>
            Credit: NASA, ESA, Ann Feild (STScI), Frank Summers (STScI). Source: <ExternalLink href="https://science.nasa.gov/asset/webb/gravitational-lensing-diagram/">NASA, &ldquo;Gravitational Lensing Diagram&rdquo;</ExternalLink>. NASA images are generally not subject to copyright; shown at a smaller size, with no other change.
          </>
        }
      >
        <img
          src={LENSING_DIAGRAM_IMAGE}
          alt="A diagram in a box. A distant galaxy at the far left sends three lines of light toward Earth at the right. Between them is a galaxy cluster. Two of the lines bend inward as they pass the cluster and reach Earth; the middle line goes straight. Dashed lines show where the bent paths would have gone."
          width={1200}
          height={840}
          style={{ ...imgStyle, width: 'min(100%, 600px)' }}
        />
      </Figure>
      <p style={p}>
        <strong>Step 4: why a ring.</strong> Suppose the source, the cluster and Earth are in an almost perfect line. Then no direction around the cluster is special. Light that passes the cluster on the top, the bottom, the left and the right is all bent in the same way, and all of it reaches us. We see it arriving from every side of the cluster at once, as a <strong>ring</strong> of light. This ring is called an <strong>Einstein ring</strong>.
      </p>
      <Figure
        caption={
          <>
            <strong>A real Einstein ring (ESA/Hubble).</strong> The blue ring is a distant galaxy that has been magnified and warped into a nearly complete ring by the strong gravity of the massive red galaxy in its middle (the orange dot): the &ldquo;Cosmic Horseshoe&rdquo;. ESA/Hubble calls it one of the best examples of an Einstein ring. Here the lens is a single massive galaxy and not a whole cluster, but the idea is the same. The picture is cropped to the area around the ring.
          </>
        }
        credit={
          <>
            Credit: ESA/Hubble &amp; NASA. Source: <ExternalLink href="https://esahubble.org/images/potw1151a/">ESA/Hubble, potw1151a</ExternalLink>, licensed <ExternalLink href="https://esahubble.org/copyright/">CC BY 4.0</ExternalLink>. Cropped; no other change.
          </>
        }
      >
        <img
          src={HORSESHOE_IMAGE}
          alt="A nearly complete thin blue ring of light around a bright orange galaxy, on a dark background with a few small distant galaxies."
          width={420}
          height={420}
          style={{ ...imgStyle, width: 'min(100%, 420px)' }}
        />
      </Figure>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>When the line-up is not perfect.</strong> Real life is rarely perfect. The distant galaxy is almost never exactly behind the middle of the cluster, and a real cluster is lumpy, not round. Then some directions around the cluster bend the light toward us more than others, and the ring is not complete. Two things can happen, and the drawing below shows both:
      </p>
      <ul style={list}>
        <li>
          <strong>Arcs.</strong> An <strong>arc</strong> is a piece of the ring: a curved streak of light round the cluster. The galaxy&rsquo;s light is stretched along the ring, so a roundish galaxy turns into a long thin curve.
        </li>
        <li>
          <strong>Several separate images.</strong> Light from the same galaxy can reach us by more than one route round the cluster: past its left side, past its right side, above it, below it. Each route arrives from a different direction, so we see the same galaxy in two, three, four or more places on the sky. They are copies of <em>one</em> galaxy, not different galaxies. NASA&rsquo;s Hubble page shows one galaxy split into five.
        </li>
        <li>
          <strong>A worked example.</strong> ESA/Hubble counted 135 lensed images of 42 background galaxies in the cluster Abell 1689. Dividing, 135 ÷ 42 ≈ 3.2, so on average each of those galaxies shows up about three times in that one picture.
        </li>
        <li>
          <strong>Why this experiment draws only a ring.</strong> A perfect line-up and a perfectly round cluster give the simplest case: one number, the ring&rsquo;s radius. Arcs and several images need a detailed model of the lumpy cluster, so they are not covered here.
        </li>
      </ul>
      <Figure caption="Two skies side by side. Left: a perfect line-up makes a complete ring. Right: a slightly-off line-up breaks it into arcs and separate images of the same galaxy. Drawn for this page to show the idea; it is not a photograph and not to scale.">
        <LineUpSchematic />
      </Figure>
      <Figure
        caption={
          <>
            <strong>One galaxy, several images (ESA/Hubble).</strong> The blue loop-shaped streaks around the yellow cluster of galaxies (called 0024+1654) are multiple images of the <em>same</em> background galaxy, duplicated by the gravity of the cluster, according to ESA/Hubble.
          </>
        }
        credit={
          <>
            Credit: W.N. Colley and E. Turner (Princeton University), J.A. Tyson (Bell Labs, Lucent Technologies) and NASA / ESA. Source: <ExternalLink href="https://esahubble.org/images/opo9610a/">ESA/Hubble, opo9610a</ExternalLink>, licensed <ExternalLink href="https://esahubble.org/copyright/">CC BY 4.0</ExternalLink>. Shown at a smaller size; no other change.
          </>
        }
      >
        <img
          src={CLUSTER_0024_IMAGE}
          alt="A cluster of yellow galaxies in the middle of a dark background. Around it are several thin blue curved streaks, which are repeated images of one distant galaxy."
          width={1280}
          height={1280}
          style={{ ...imgStyle, width: 'min(100%, 520px)' }}
        />
      </Figure>
      <Figure
        caption={
          <>
            <strong>The cluster Abell 1689 (NASA and Hubble).</strong> A massive cluster of yellowish galaxies, caught in a red and blue web of distorted background galaxies. The thin curved streaks are arcs: stretched images of galaxies far behind the cluster. NASA says the gravity of the cluster&rsquo;s trillion stars, plus dark matter, acts as a lens in space about 2 million light-years wide. NASA reported that this 2003 picture revealed 10 times more arcs than a ground-based telescope would see. ESA/Hubble&rsquo;s later count was 135 lensed images of 42 background galaxies.
          </>
        }
        credit={
          <>
            Credit: NASA, N. Benitez (JHU), T. Broadhurst (Racah Institute of Physics/The Hebrew University), H. Ford (JHU), M. Clampin (STScI), G. Hartig (STScI), G. Illingworth (UCO/Lick Observatory), the ACS Science Team and ESA. Source: <ExternalLink href="https://science.nasa.gov/asset/hubble/galaxy-abell-1689s-gravitational-lens-magnifies-light-of-distant-galaxies/">NASA, Abell 1689</ExternalLink>. NASA images are generally not subject to copyright; shown at a smaller size, with no other change.
          </>
        }
      >
        <img
          src={ABELL_1689_IMAGE}
          alt="A dense field of yellowish galaxies, brightest in the middle, with many thin blue and red curved streaks among them: lensed images of galaxies far behind the cluster."
          width={1200}
          height={1247}
          style={{ ...imgStyle, width: 'min(100%, 520px)' }}
        />
      </Figure>
      <p style={p}>
        <strong>A daily-life picture.</strong> Hold a wine glass between you and a distant lamp, in a dark room, and look through its thick stem or base. The glass bends the lamp&rsquo;s light by its shape. When the lamp, the glass and your eye line up just right, the lamp&rsquo;s light can be smeared into a ring or an arc. Move your head a little to the side and the ring breaks into bright arcs and spots: that is what an imperfect line-up does. A galaxy cluster does something similar, bending light by its <em>mass</em> instead of by its shape. (This is an everyday comparison, not a measurement.)
      </p>
      <p style={p}>
        <strong>Step 5: a new unit, the arcsecond.</strong> We measure how big the ring looks as an <strong>angle</strong> on the sky, because we see it from far away. A circle is 360 degrees. A <strong>degree</strong> is divided into 60 <strong>arcminutes</strong> and an arcminute into 60 <strong>arcseconds</strong>, so one <strong>arcsecond</strong> is 1/3600th of a degree (the International Astronomical Union&rsquo;s glossary says the same). That is tiny. A one-centimetre coin looks one arcsecond wide from about {coinKm.toFixed(0)} kilometres away ({coinKm.toFixed(2)} km: 1 cm ÷ 0.0000048 ≈ {(coinKm * 1000).toFixed(0)} m). The rings on this page are a few tens of arcseconds in radius, which is a very small piece of the sky.
      </p>
      <p style={p}>
        <strong>Step 6: why ask this at all.</strong> We cannot put a galaxy cluster on a scale, and its mass is spread over millions of light-years. But its gravity bends light that passes it <em>whatever the mass is made of</em>: glowing stars, hot gas or something dark. How strongly it bends the light depends on how much mass there is. So the light is a kind of scale. You will be asked what that does to the ring.
      </p>
      <p style={p}>
        <strong>Step 7: visible and dark matter, a reminder.</strong> In Cosmology 4 you met <strong>dark matter</strong>: matter we cannot see but whose gravity we can feel. In a galaxy cluster, <strong>visible matter</strong> means the stars and hot gas, which give out light we can detect. Later you compare the ring made by the visible matter alone with the ring that is actually seen.
      </p>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>Step 8: lensing today (as of November 2026).</strong> Astronomers now use lensing every day, and the news keeps coming:
      </p>
      <ul style={list}>
        <li>NASA&rsquo;s Hubble page (updated August 2026) says gravitational lensing occurs when a massive object, such as a galaxy cluster, &ldquo;warps space and time causing light to bend, distort, and magnify&rdquo;, and that mapping the distortions helps astronomers discern where mysterious matter is distributed.</li>
        <li>In February 2025 ESA&rsquo;s <strong>Euclid</strong> space telescope found a complete Einstein ring around a galaxy called NGC 6505, about 590 million light-years away. The ring&rsquo;s source is 4.42 billion light-years away. The galaxy had been known for a very long time, and the ring had never been seen.</li>
        <li>In March 2025 Euclid&rsquo;s first catalogue listed about <strong>500</strong> strong-lens candidates, almost all new. ESA expects about 100,000 by the end of the mission, around 100 times more than are known now.</li>
        <li>The <strong>Webb</strong> telescope (NASA, ESA and CSA) uses cluster lenses as natural magnifiers. In 2024 it resolved a galaxy seen when the universe was about 460 million years old down to parsec scales. In February 2026 the COSMOS collaboration published a Webb map of dark matter made from the shapes of about 250,000 distant galaxies.</li>
      </ul>
      <p style={p}>
        This experiment looks at the simplest case, one ring. Arcs, multiple images, the weak lensing used for the big maps, lensing by single stars and the time delays between images are not covered.
      </p>
      <p style={p}>
        <strong>Your job.</strong> First, make two predictions about how the ring depends on the cluster&rsquo;s mass. Then press Run. Afterwards, in Part 2, pick a mass of your own.
      </p>
      <p style={{ ...p, marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong> When the pictures are drawn, these are the things to watch. Each one says what to look at, what it means and why it matters. (The numbers and what they show come later, in the captions and the results.)
      </p>
      <ul style={list}>
        <li>
          <strong>Look at:</strong> the two yellow dots leaving the distant galaxy in the side view, bending at the cluster and arriving at Earth. <strong>What it means:</strong> the light takes a bent path, not a straight one. <strong>Why it matters:</strong> the bent path is why we see the galaxy in a different place and shape from where it really is.
        </li>
        <li>
          <strong>Look at:</strong> the rings on the picture of the sky. <strong>What it means:</strong> each ring is where the distant galaxy&rsquo;s light appears for a cluster of a particular mass. <strong>Why it matters:</strong> comparing rings is how this experiment compares masses.
        </li>
        <li>
          <strong>Look at:</strong> your white guess marks, which appear when the run ends, beside the real rings. <strong>What it means:</strong> each mark shows what you guessed. <strong>Why it matters:</strong> you can compare your guess with the real picture at a glance. The tutor goes through each guess at the end.
        </li>
        <li>
          <strong>Look at:</strong> in Part 2, the gold ring as you change the mass. <strong>What it means:</strong> it is the ring for the mass you chose. <strong>Why it matters:</strong> by moving it you see how the ring depends on the mass.
        </li>
      </ul>
      <p style={p}>
        <strong>How this page is laid out.</strong> Below this introduction the page has four parts. <strong>Part 1</strong> is where you guess and watch. <strong>Part 2</strong> is where you try your own settings. <strong>Part 3</strong> shows the results and what they mean. <strong>Part 4</strong> is the tutor. Parts 2, 3 and 4 appear when your first run has finished.
      </p>
      <p style={p}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables. They are drawn on the real picture in <strong>white</strong>, in a box labelled YOUR GUESS, and shown again beside the results. The real pictures come from the physics. The mass you choose in Part 2 does change the gold ring, the gold dot and the gold row of the table, but never the blue, green or violet ones. If you change a guess, press Run and see nothing change, that is not a fault: a guess is only a guess.
      </p>
      <p style={{ ...p, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={list}>
        <li>The cluster is treated as round, with the source exactly behind its centre. Real clusters are lumpy and rarely line up perfectly, so real rings are usually broken into arcs and images.</li>
        <li>The mass we work out is the mass inside the ring. That is all a ring can tell us about a round lens.</li>
        <li>All the bending is treated as happening at one place, the cluster, and the angles are tiny. This is a standard, very good approximation for clusters.</li>
        <li>
          The three distances (to the cluster, to the source, and between them) are fixed, rounded values for one real situation, a cluster like Abell 1689 at a redshift of 0.18 with a source at a redshift of 2. They are in megaparsecs (Mpc), the unit astronomers use for distances between galaxies; one Mpc is about 3.3 million light-years. They use the same illustrative Hubble constant as Cosmology 1 (70 km/s per megaparsec). Real measurements disagree a little, the <strong>Hubble tension</strong>: as of November 2026, NASA says space-telescope measurements give around {ranges.spaceTelescopes.low} to {ranges.spaceTelescopes.high} and measurements from the cosmic microwave background about {ranges.microwaveBackground.low} to {ranges.microwaveBackground.high}.
        </li>
        <li>Two reference values, an <strong>observed ring</strong> and a <strong>visible share</strong>, are given to compare with. They are explained, with their numbers, after you press Run.</li>
        <li>The real amount of bending is used, which is twice what ordinary gravity alone would give, for the reason in Gravity and Curved Spacetime Experiment 8.</li>
        <li>Nothing here claims to say what dark matter is.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> galaxy cluster, gravitational lensing, lens, source, Einstein ring, arc, arcsecond, arcminute, megaparsec, visible matter, dark matter, Hubble tension. Each is in the &ldquo;Words and formulas&rdquo; box below.
      </p>
    </div>
  )
}

// ---- the words box: the ring formula and the mass inside the ring (they give guess 2's answer away) wait until after the first Run ----
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const f = ringFormulaExample()
  const entries = [
    { term: 'Galaxy cluster', meaning: 'a huge group of galaxies held together by gravity. Abell 1689 has about 1,000 galaxies (ESA/Hubble).' },
    { term: 'Gravitational lensing', meaning: 'the bending of light by the gravity of a massive object, as if by a lens.' },
    { term: 'Lens', meaning: 'the massive object that bends the light: here a galaxy cluster.' },
    { term: 'Source', meaning: 'the distant object whose light is being bent: here a far-away galaxy.' },
    { term: 'Einstein ring', meaning: 'a ring of light seen when the source, the lens and Earth line up almost perfectly.' },
    { term: 'Arc and multiple images', meaning: 'what a slightly-off line-up makes: bright curved pieces of a ring, or several separate pictures of the same galaxy.' },
    { term: 'Strong lensing', meaning: 'lensing strong enough to make rings, arcs or several images. This experiment is about the simplest case.' },
    { term: 'Weak lensing', meaning: 'tiny stretches in the shapes of many galaxies, used to map mass over large areas. Not covered here.' },
    { term: 'Microlensing', meaning: 'lensing by a single star. Not covered here.' },
    { term: 'Degree, arcminute, arcsecond', meaning: 'a degree is 1/360 of a circle; an arcminute is 1/60 of a degree; an arcsecond is 1/60 of an arcminute, which is 1/3600 of a degree.' },
    { term: 'Arcsecond, with a worked example', meaning: `a 1 cm coin looks one arcsecond wide from ${coinDistanceKm(1).toFixed(2)} km away: 1 cm ÷ (1 arcsecond in radians, 0.0000048) ≈ ${(coinDistanceKm(1) * 1000).toFixed(0)} m.` },
    { term: 'Solar mass', meaning: 'the mass of our Sun, the unit used for the mass of a cluster.' },
    { term: 'Megaparsec (Mpc)', meaning: 'a unit of distance: about 3.3 million light-years.' },
    { term: 'Visible matter', meaning: 'in a cluster, the stars and hot gas, which give out light we can detect.' },
    { term: 'Dark matter', meaning: 'matter we cannot see but whose gravity we can feel (Cosmology 4).' },
    { term: 'Hubble tension', meaning: 'the small disagreement between two ways of measuring the expansion rate (Cosmology 1 and 6).' },
    { term: 'Formula: the real bending angle', meaning: `the angle light is bent by a mass M passing at a distance b is 4GM ÷ (c² b). For the observed ring the bend at the ring's edge is about ${observedBendArcseconds().toFixed(0)} arcseconds, about ${(observedBendArcseconds() / 3600).toFixed(3)} of a degree.` },
  ]
  if (afterRun) {
    entries.push({
      term: 'Formula: the ring radius, with a worked example',
      meaning: `θ = √[(4GM ÷ c²) × D_ls ÷ (D_l × D_s)]. For the observed mass of ${massLabel(f.massSolarMasses)} solar masses: GM ÷ c² = ${f.gravitationalLengthKm.toExponential(3)} km, so 4GM ÷ c² = ${f.fourGmOverC2Mpc.toExponential(3)} Mpc; D_ls ÷ (D_l × D_s) = ${f.distanceFactor.toExponential(3)} per Mpc; the square root of their product is ${f.radians.toExponential(3)} radians, which is ${f.arcseconds.toFixed(1)} arcseconds. Because the mass sits under a square root, four times the mass gives a ring twice as wide.`,
    })
  } else {
    entries.push({ term: 'More words', meaning: 'the ring formula and its worked example appear here after your first run, because it shows how the ring depends on the mass, which is what you are about to guess.' })
  }
  return entries
}

// ---- links (pages read 2026-11-15 through helper summaries; see the draft's source table). The pages that say most of a cluster's mass is
// dark appear after the first Run (§12), because that is the tutor's question. ----
const LINKS_BEFORE: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-gravitational-lenses/',
    label: 'NASA: Hubble and gravitational lenses',
    what: 'NASA’s plain page (updated August 2026) on how gravity magnifies and distorts the light of distant objects, with the 1919 eclipse test and a galaxy split into five images. (Read.)',
  },
  {
    href: 'https://esahubble.org/wordbank/gravitational-lensing/',
    label: 'ESA/Hubble: gravitational lensing',
    what: 'a short ESA/Hubble definition of lensing: the bending of light by a massive body such as a galaxy cluster. (Read.)',
  },
  {
    href: 'https://esahubble.org/images/opo1037a',
    label: 'ESA/Hubble: Abell 1689',
    what: 'ESA/Hubble’s 2010 page on the cluster used as the real example here: 2.2 billion light-years away, 135 lensed images of 42 galaxies. (Read.)',
  },
  {
    href: 'https://science.nasa.gov/missions/hubble/biggest-zoom-lens-in-space-takes-hubble-deeper-into-the-universe',
    label: 'NASA: the biggest zoom lens in space (2003, updated 2025)',
    what: 'NASA’s page on Abell 1689 as a lens about 2 million light-years wide. (Read.)',
  },
  {
    href: 'https://www.astro4edu.org/resources/glossary/term/79/',
    label: 'IAU: arcsecond',
    what: 'the International Astronomical Union’s glossary entry: one arcsecond is 1/3600th of a degree. (Read.)',
  },
  {
    href: 'https://www.esa.int/Science_Exploration/Space_Science/Euclid/Euclid_discovers_a_stunning_Einstein_ring',
    label: 'ESA: Euclid discovers a stunning Einstein ring (February 2025)',
    what: 'ESA’s account of the ring round the galaxy NGC 6505. (Read.)',
  },
  {
    href: 'https://www.esa.int/ESA_Multimedia/Images/2025/03/Strong_gravitational_lenses_captured_by_Euclid',
    label: 'ESA: strong gravitational lenses captured by Euclid (March 2025)',
    what: 'ESA’s first catalogue of about 500 strong-lens candidates. (Read.)',
  },
  {
    href: 'https://esawebb.org/news/weic2418/',
    label: 'ESA/Webb: the Cosmic Gems arc (2024)',
    what: 'how Webb used a cluster lens to resolve a galaxy seen when the universe was about 460 million years old. (Read.)',
  },
  {
    href: 'https://www.esa.int/ESA_Multimedia/Images/2025/09/Webb_brings_cosmic_lenses_into_focus',
    label: 'ESA: Webb brings cosmic lenses into focus (30 September 2025)',
    what: 'ESA’s page on the COSMOS-Web lenses, including a ring that lets astronomers see back to when the universe was barely more than a billion years old. (Read.)',
  },
  {
    href: 'https://cosmos.astro.caltech.edu/news/90',
    label: 'COSMOS collaboration: a Webb map of dark matter (February 2026)',
    what: 'how the shapes of about 250,000 distant galaxies were used to map dark matter. (Read.)',
  },
  {
    href: 'https://arxiv.org/abs/astro-ph/0409132',
    label: 'Broadhurst and others (2005): Abell 1689',
    what: 'the paper that studies the cluster’s arcs and images (106 images of 30 galaxies) and gives an Einstein radius of about 50 arcseconds. A technical paper; the abstract is the readable part. (Abstract read; the text read only in part.)',
  },
  {
    href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/',
    label: 'NASA: the Hubble constant and the tension',
    what: 'NASA’s plain page behind the two ranges quoted in the assumptions. (Read for Cosmology 6; to be re-read.)',
  },
]
const LINKS_AFTER: Array<{ href: string; label: string; what: ReactNode }> = [
  {
    href: 'https://chandra.harvard.edu/photo/2006/1e0657/',
    label: 'Chandra: the Bullet Cluster (2006)',
    what: 'Chandra’s page on two colliding clusters, where lensing shows that nearly all of the matter is dark. (Read.)',
  },
  {
    href: 'https://arxiv.org/abs/astro-ph/0608407',
    label: 'Clowe and others (2006): the Bullet Cluster',
    what: 'the paper that argues the Bullet Cluster is a direct empirical proof of dark matter. A technical paper; the abstract is the readable part. (Abstract read.)',
  },
  {
    href: 'https://arxiv.org/abs/1309.3565',
    label: 'Gonzalez and others (2013): galaxy cluster baryon fractions',
    what: 'a technical paper on how much of a cluster’s mass is ordinary (stars plus hot gas). The abstract is the readable part. (Abstract read.)',
  },
  {
    href: 'https://arxiv.org/abs/1807.06209',
    label: 'Planck Collaboration (2018): cosmological parameters',
    what: 'the paper behind the universe’s total amount of ordinary matter. A technical paper. (Abstract read.)',
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

export function GravitationalLensingExperiment({ onComplete, onTutorComplete }: GravitationalLensingExperimentProps) {
  const [ringSizeGuess, setRingSizeGuess] = useState<RingSizeGuess | null>(null)
  const [fourTimesGuess, setFourTimesGuess] = useState<FourTimesGuess | null>(null)
  const [submitted, setSubmitted] = useState<{ ringSize: RingSizeGuess; fourTimes: FourTimesGuess } | null>(null)

  const [part1Done, setPart1Done] = useState(false)
  const [part1Running, setPart1Running] = useState(false)
  const [part1Progress, setPart1Progress] = useState(0)
  const [explained, setExplained] = useState(false)

  const [mode, setMode] = useState<MassMode>('observed')
  const [customMass, setCustomMass] = useState(1e14)
  // Part 2's gold ring is drawn when its own Run is pressed; at rest it shows the whole ring.
  const [part2Running, setPart2Running] = useState(false)
  const [part2Progress, setPart2Progress] = useState(1)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const hasAllGuesses = ringSizeGuess !== null && fourTimesGuess !== null
  const locked = submitted !== null
  const shownRingSize = submitted?.ringSize ?? ringSizeGuess
  const shownFourTimes = submitted?.fourTimes ?? fourTimesGuess
  const visibleMass = visibleOnlyMassSolarMasses()
  const mass = mode === 'visible' ? visibleMass : mode === 'observed' ? OBSERVED_TOTAL_MASS_SOLAR_MASSES : customMass

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

  // Part 2's animation: the light travels and the gold ring is drawn, over the same fixed duration.
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
    if (!submitted) setSubmitted({ ringSize: ringSizeGuess!, fourTimes: fourTimesGuess! })
    setPart1Progress(0)
    setPart1Running(true)
  }

  // Changing the mass changes only Part 2's drawings: it never hides Parts 3 and 4 or restarts the tutor.
  const handleModeChange = (next: MassMode) => {
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
    setRingSizeGuess(null)
    setFourTimesGuess(null)
    setSubmitted(null)
    setPart1Done(false)
    setPart1Running(false)
    setPart1Progress(0)
    setExplained(false)
    setMode('observed')
    setCustomMass(1e14)
    setPart2Running(false)
    setPart2Progress(1)
  }

  const hasAnythingToClear = ringSizeGuess !== null || fourTimesGuess !== null || locked || part1Done
  const startOverDisabled = !hasAnythingToClear || part1Running

  const started = part1Running || part1Done
  const shownProgress1 = part1Done ? 1 : part1Progress
  const travel1 = Math.min(shownProgress1 / TRAVEL_FRACTION, 1)
  const ring1 = Math.max((shownProgress1 - TRAVEL_FRACTION) / (1 - TRAVEL_FRACTION), 0)
  const travel2 = Math.min(part2Progress / TRAVEL_FRACTION, 1)
  const ring2 = Math.max((part2Progress - TRAVEL_FRACTION) / (1 - TRAVEL_FRACTION), 0)

  const yours = yourComparison(mass)
  const run = runGravitationalLensingExperiment(mass)

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Cosmology 7: Gravitational Lensing</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />
        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
          <p style={{ ...smallNote, marginTop: 0 }}>
            Each link opens in a new tab. They were read on 15 November 2026 through helper summaries, so a quotation or figure on this page should be checked against the live page. No official page was found that gives the visible share of a cluster as a figure (this page works it out from two papers) or that says what lensing cannot tell us about dark matter, and the first lens, found in 1979, was not read, so this page does not state its details.
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
            <p style={smallNote}>Four more links, on the Bullet Cluster, on how much of a cluster is ordinary matter and on the total amount of ordinary matter, appear here after your first Run, because their wording would give away what you are asked about.</p>
          )}
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make two guesses. Then you will press Run and watch light from a distant galaxy bend around a galaxy cluster, and then three pictures: a side view, a view of the sky and a graph, all drawn for one real cluster. Your guesses are drawn on the pictures in white. Nothing you guess changes the real pictures.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question prompt="If the cluster between us and a distant galaxy had more mass, would the ring of light we see be larger, the same size, or smaller?" guessText={optionText(ringSizeChoices, shownRingSize)}>
            <ChoiceButtons options={ringSizeChoices} selected={shownRingSize} disabled={locked || part1Running} onSelect={setRingSizeGuess} />
          </Question>
          <Question prompt="If the cluster had four times the mass, how wide would the ring be compared with before?" guessText={optionText(fourTimesChoices, shownFourTimes)}>
            <ChoiceButtons options={fourTimesChoices} selected={shownFourTimes} disabled={locked || part1Running} onSelect={setFourTimesGuess} />
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
          <>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 1: the side view</p>
              <SideView mass={OBSERVED_TOTAL_MASS_SOLAR_MASSES} travel={travel1} />
              <Part1SideCaption started={started} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 2: the sky view</p>
              <SkyView ringProgress={ring1} yourMass={null} yourProgress={0} finished={part1Done} guesses={part1Done ? submitted : null} />
              <Part1SkyCaption started={ring1 > 0} arrived={part1Done} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Picture 3: the graph, ring size for every mass</p>
              <MassGraph yourMass={null} finished={part1Done} guesses={part1Done ? submitted : null} />
              <Part1GraphCaption started={ring1 > 0} arrived={part1Done} />
            </Block>
          </>
        )}

        {part1Done && (
          <Block>
            <WhereFrom>
              <strong>Measured (by others):</strong> the <strong>observed ring</strong> of about <strong>47 arcseconds</strong> is a given, rounded value for the cluster Abell 1689; Broadhurst and others (2005) give an Einstein radius of about 50. It is given here, not worked out. <strong>Calculated here:</strong> the blue dashed ring (the ring that the cluster&rsquo;s visible matter alone, <strong>15 percent</strong> of the mass, would make; the 15 percent is worked out here from Planck 2018 and Gonzalez and others 2013, about 15.7 and 14.6 percent), the purple curve, the real bend and the mass inside the ring, from the formula in the Words and formulas box; the three distances (630, 1730 and 1480 Mpc) are rounded values for a cluster at redshift 0.18 and a source at redshift 2.{' '}
              <strong>Imagined for the question:</strong> the violet &ldquo;four times the visible mass&rdquo; ring and point, the perfectly round cluster with a perfect line-up and, in Part 2, your own mass. <strong>Your guess:</strong> the white marks only.
            </WhereFrom>
          </Block>
        )}
        {!started && <p style={smallNote}>After you press Run, the two yellow dots set off from the distant galaxy, and then the rings and the graph are drawn, each with a caption. When the run ends your white guess marks, the violet imagined ring and a &ldquo;Where the real picture comes from&rdquo; note appear, and Parts 2, 3 and 4 appear below.</p>}
        {started && !part1Done && <p style={smallNote}>Your white guess marks and Parts 2, 3 and 4 appear when the run ends.</p>}

        {part1Done && (
          <>
            {/* ===== Part 2 ===== */}
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the cluster&rsquo;s mass. Press Run and a gold ring is drawn for your choice, beside the blue and green rings from Part 1. Your guesses do not change anything in this part; your mass does.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Mass of the galaxy cluster in the middle (in solar masses):</p>
              <button type="button" onClick={() => handleModeChange('visible')} className={`toggle-button${mode === 'visible' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                Visible matter only
              </button>
              <button type="button" onClick={() => handleModeChange('observed')} className={`toggle-button${mode === 'observed' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                The observed total
              </button>
              <button type="button" onClick={() => handleModeChange('custom')} className={`toggle-button${mode === 'custom' ? ' is-selected' : ''}`} style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}>
                Custom
              </button>
              {mode === 'custom' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label htmlFor="lensing-mass" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Cluster mass: {massLabel(customMass)} solar masses
                  </label>
                  <input
                    id="lensing-mass"
                    type="range"
                    min={MIN_LENS_MASS_SOLAR_MASSES}
                    max={MAX_LENS_MASS_SOLAR_MASSES}
                    step={1e12}
                    value={customMass}
                    onChange={(event) => {
                      setCustomMass(Number(event.target.value))
                      if (!part2Running) setPart2Progress(1)
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
              <div style={{ marginTop: '0.75rem' }}>
                <button type="button" className="action-button" onClick={handlePart2Run} disabled={part2Running} style={{ padding: '0.5rem 1.5rem' }}>
                  {part2Running ? 'Running...' : 'Run: draw the gold ring with your mass'}
                </button>
              </div>
              <p style={smallNote}>
                Your predictions are locked while you try other settings. Your guesses do not change the drawings or tables, but this mass does: it changes the gold ring, the gold dot, the bend in the side view and the gold row in Part 3. Every other number stays the same. These masses are <strong>trial values</strong>: they show what would happen for a cluster with that much mass, and they do not say the real cluster is like that. While the mass is on the observed total, the gold ring lies exactly on the green one, so change the mass to see something move.
              </p>
              <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem', marginBottom: 0 }}>
                Cluster mass: {massLabel(mass)} solar masses &nbsp;|&nbsp; Ring radius: <strong>{run.ringArcseconds.toFixed(1)} arcseconds</strong>
                <br />
                Light bends by {run.bendingAngleArcseconds.toFixed(1)} arcseconds at the ring&rsquo;s edge. The ring for your mass is {yours.ringOverVisibleRing.toFixed(2)} times as wide as the visible-matter ring.
              </p>
            </div>

            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The side view, with your mass ({massLabel(mass)} solar masses)</p>
              <SideView mass={mass} travel={travel2} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The sky view, with your gold ring</p>
              <SkyView ringProgress={1} yourMass={mass} yourProgress={ring2} finished={false} guesses={null} />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The graph, with your gold dot</p>
              <MassGraph yourMass={mass} finished={false} guesses={null} />
              <Part2Caption mass={mass} />
            </Block>
            <Block>
              <WhereFrom>
                <strong>Calculated here</strong> from the mass you chose: the gold ring, the gold dot, the drawn bend and the numbers in the gold row of Part 3. The blue and green rings, the blue dot and the green line are the same as in Part 1. <strong>Imagined for the question:</strong> your trial mass.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              These are the results of your first run, with what each table means. The numbers come from the physics and do not change with your guesses; only the gold row follows your settings in Part 2.
            </PartHeader>
            <GravitationalLensingResults guesses={submitted} mass={mass} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              The tutor asks you three questions about what you saw, then explains it and goes through your two guesses.
            </PartHeader>
            {submitted && (
              <GravitationalLensingTutor
                predictedRingSize={submitted.ringSize}
                predictedFourTimes={submitted.fourTimes}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            )}
            {explained && <p style={{ ...smallNote, marginTop: '1rem' }}>You have reached the tutor&rsquo;s explanation. You can still try another mass in Part 2; the tutor does not restart.</p>}
          </>
        )}
      </div>
    </div>
  )
}
