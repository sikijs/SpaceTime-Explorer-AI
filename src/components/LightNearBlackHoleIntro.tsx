import type { ReactNode } from 'react'
import {
  CRITICAL_AIM_IN_HORIZON_RADII,
  MAX_AIM_IN_HORIZON_RADII,
  MIN_AIM_IN_HORIZON_RADII,
  PART_ONE_FIVE_AIM_IN_HORIZON_RADII,
  PHOTON_SPHERE_IN_HORIZON_RADII,
  criticalAimRows,
  criticalAimWorked,
  runPartOne,
  weakFieldWorked,
} from '../physics/lightNearBlackHoleExperiment'
import { displayNumber } from '../physics/frontierRecap'
import { M87_IMAGE, SGRA_IMAGE } from './BlackHoleIntro'
import { CRITICAL_AIM_TEXT, formatDistance, formatNumber } from './LightNearBlackHolePictures'
import { paragraph } from './TidalEffectExperiment'

// Black Holes, Experiment 4 (audit update): the introduction, the links, the words box, the notes under the three questions, Part 2's guide and the
// block of real black-hole pictures (docs/audit/black-holes-and-strong-gravity/04-draft-wording.md, approved by the owner on 2026-11-17).
// The introduction keeps clear of the answers to the three questions (CLAUDE.md §12): it does not give the critical aim, say that light can be
// captured or can swing round, or say how much larger the bend is than the simple formula says. Those, the photon sphere and the real pictures of
// black holes (which show a dark middle) come only after the first run.

const ABELL_IMAGE = `${import.meta.env.BASE_URL}images/black-holes/abell2813-hubble-potw2115a.jpg`

const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#000',
} as const

function Figure({ children, caption, credit }: { children: ReactNode; caption: ReactNode; credit?: ReactNode }) {
  return (
    <figure style={{ margin: '1rem 0', padding: 0 }}>
      {children}
      <figcaption style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
        {caption} {credit && <span style={{ fontSize: '0.75rem' }}>{credit}</span>}
      </figcaption>
    </figure>
  )
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}


// The drawing made for this page: how a heavy object in front of a distant galaxy bends its light, so that we see the galaxy twice. A schematic, not to
// scale. It shows the idea of a gravitational lens only: it does not show a black hole, a capture or any number (CLAUDE.md §12).
function LensDrawing() {
  return (
    <svg
      viewBox="0 0 440 270"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px', backgroundColor: '#0b1020' }}
      role="img"
      aria-label="A distant galaxy on the left, a heavy object in the middle and the Earth on the right. Two paths of light leave the galaxy, bend round the heavy object and reach the Earth. Dotted lines trace each path back, to two apparent images of the galaxy, one above the object and one below."
    >
      <path d="M52,135 L222,76 L402,135" stroke="#22d3ee" strokeWidth={2.5} fill="none" />
      <path d="M52,135 L222,194 L402,135" stroke="#22d3ee" strokeWidth={2.5} fill="none" />
      <path d="M402,135 L102,46" stroke="#e2e8f0" strokeDasharray="4 4" strokeOpacity={0.8} fill="none" />
      <path d="M402,135 L102,224" stroke="#e2e8f0" strokeDasharray="4 4" strokeOpacity={0.8} fill="none" />
      <ellipse cx={52} cy={135} rx={20} ry={11} fill="#fb923c" />
      <text x={52} y={165} fill="#fb923c" fontSize="11" textAnchor="middle">
        far galaxy
      </text>
      <text x={52} y={178} fill="#fb923c" fontSize="11" textAnchor="middle">
        (really here)
      </text>
      <circle cx={222} cy={135} r={36} fill="#e879f9" fillOpacity={0.35} stroke="#e879f9" strokeWidth={2} />
      <text x={222} y={131} fill="#e2e8f0" fontSize="11" textAnchor="middle">
        heavy object
      </text>
      <text x={222} y={145} fill="#e2e8f0" fontSize="10" textAnchor="middle">
        (the lens)
      </text>
      <circle cx={402} cy={135} r={9} fill="#60a5fa" />
      <text x={402} y={158} fill="#60a5fa" fontSize="11" textAnchor="middle">
        Earth
      </text>
      <ellipse cx={102} cy={46} rx={17} ry={8} fill="none" stroke="#e2e8f0" strokeDasharray="3 3" transform="rotate(-18 102 46)" />
      <text x={102} y={28} fill="#e2e8f0" fontSize="11" textAnchor="middle">
        what we seem to see: image 1
      </text>
      <ellipse cx={102} cy={224} rx={17} ry={8} fill="none" stroke="#e2e8f0" strokeDasharray="3 3" transform="rotate(18 102 224)" />
      <text x={102} y={250} fill="#e2e8f0" fontSize="11" textAnchor="middle">
        what we seem to see: image 2
      </text>
      <text x={312} y={92} fill="#22d3ee" fontSize="10">
        light bent by gravity
      </text>
    </svg>
  )
}

export function LightNearBlackHoleIntro() {
  const run = runPartOne()
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> In Gravity and Curved Spacetime, Experiment 8, you saw that gravity bends the path of light that passes near a mass, and you met a simple formula for how much. Close to a black hole, gravity is as strong as it ever gets
        (you saw that in Black Holes 2). So how much does a black hole bend light that passes by? And what happens to light that passes very close?
      </p>
      <p style={paragraph}>
        <strong>Why even ask this.</strong> In everyday life, light seems to travel in perfectly straight lines. A torch beam, a laser pointer and sunlight all go straight, and nothing we can see bends them. The bending in Experiment 8 was small, because the gravity
        there was gentle. But that experiment used a simple formula made for gentle gravity. This experiment asks what happens to light where gravity is at its strongest.</p>
      <p style={paragraph}>
        <strong>Light bent by gravity is real.</strong> It was first tested in 1919. The British astronomer Arthur Eddington photographed stars close to the edge of the Sun during a total solar eclipse, when the Moon hides the Sun’s glare, to see whether the Sun’s gravity shifted where those stars appeared. It did, and that was an early confirmation of Einstein’s theory. Today astronomers use the bending as a tool. A <strong>gravitational lens</strong> is a region of space that holds something enormous, such as a galaxy or a whole cluster of galaxies, whose gravity bends the light passing through it, a little like a glass lens does. NASA’s Hubble telescope has photographed the galaxy cluster Abell 2813. Among the cluster’s own galaxies, which look like tiny dots, spirals and ovals, there are several curved, crescent-shaped arcs. Each arc is a much more distant galaxy whose light has been stretched and brightened by the cluster’s gravity. Sometimes the light from one distant object takes several different paths around the lens, so the same object shows up more than once. In a picture called an Einstein Cross, Hubble saw four images of a single quasar (the extremely bright core of a distant galaxy), about 8 billion light-years away, lensed by a galaxy about 400 million light-years away. In all of these, the light passes through the gravity of a galaxy or a cluster, which is gentle compared with the gravity at a black hole’s edge. This experiment is about a much stronger case, light that passes very close to a black hole.
      </p>
      <Figure
        caption={
          <>
            <strong>A real gravitational lens: the galaxy cluster Abell 2813.</strong> The cream-colored blobs and dots are galaxies of the cluster. The orange curved streaks are not curved galaxies: they are much more distant galaxies whose light the cluster’s gravity has bent,
            stretched and brightened, as NASA and ESA describe it.
          </>
        }
        credit={
          <>
            Image credit: <Ext href="https://esahubble.org/images/potw2115a/">ESA/Hubble &amp; NASA, D. Coe</Ext> (Creative Commons Attribution 4.0).
          </>
        }
      >
        <img
          src={ABELL_IMAGE}
          alt="A dark field of many small galaxies, with a group of bright cream-colored galaxies in the middle. Several thin, curved orange streaks near the group are distant galaxies whose light has been bent."
          width={1280}
          height={1075}
          style={{ ...imgStyle, maxWidth: 'min(100%, 560px)' }}
        />
      </Figure>
      <Figure
        caption={
          <>
            <strong>How a lens makes two pictures of one galaxy.</strong> A schematic drawn for this page, not to scale. Light from the far galaxy leaves in every direction. Some of it passes above the heavy object and some below, and its gravity bends both paths toward Earth. Our eyes
            trace each path straight back, along the dotted lines, so we seem to see the galaxy in two places, neither of which is where it really is. ESA/Hubble says such distortions can appear as long lines or arcs, as in the photograph above. The two images are drawn alike here only to keep the picture simple. In a real lens they are not identical copies, in two different ways that can happen together. First, each image is <strong>distorted</strong>, which means stretched and bent out of shape: ESA/Hubble describes the images of one lensed galaxy, in the cluster Abell 383, as each having a “characteristically distorted banana-like shape”. Second, one image can be a <strong>mirror image</strong> of another, which means flipped left to right, like your reflection: NASA reports that lensing produced a mirror image of a different galaxy, SGAS J143845+145407, in a Hubble picture, with a third, distorted image of it between the two. An image can be both flipped and stretched, like your reflection in a wavy shop window. And the images are not seen at the same moment. Each light path has its own length and its own bends, so some paths take longer. For the exploding star nicknamed Refsdal, NASA says Hubble’s four images of it appeared within a few days or weeks of each other.
          </>
        }
      >
        <LensDrawing />
      </Figure>
      <p style={paragraph}>
        <strong>Bending light, in everyday words.</strong> Think of a marble rolled across a stretched rubber sheet with a heavy ball sitting in it. A marble rolled far from the ball curves only a little. One rolled close curves a lot. Gravity bends the path of light
        in a similar way, though the sheet is only a picture, not how gravity works. This experiment follows a thin beam of light and asks how much it curves.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What happens.</strong> Here is the whole experiment, step by step.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          Part 1 fixes the black hole (the 10-Sun one from Black Holes 1) and shows two beams of light, one aimed at {PART_ONE_FIVE_AIM_IN_HORIZON_RADII} horizon radii and one aimed only a tiny bit farther out than the capture distance in question 2 (how far out is shown after the run). In Part 2 you choose a black hole and an aim of your own.
        </li>
        <li>
          <strong>The aim distance is how close to the black hole’s center a beam of light would pass if gravity did nothing.</strong> Think of rolling a ball in a straight line past a post: the aim distance is how far from the post the ball’s straight path goes. A small
          aim distance means the ball would pass close to the post. A large one means it would pass far away.
        </li>
        <li>
          A thin beam of light comes in from very far away, from the right, along that straight line. The first picture draws the line as a dashed white line, so you can see where the light would go with no gravity.
        </li>
        <li>
          But gravity does act. The picture also draws the path the light really takes, worked out with the <strong>exact theory of gravity</strong> (general relativity, the theory that gravity is curved spacetime).
        </li>
        <li>You press Run and watch for a few seconds. Either the light gets past the black hole and goes on its way, or it reaches the black hole’s edge and goes no further.</li>
        <li>
          If the light gets away, its direction has been turned. The angle it has been turned through is called the <strong>bend</strong>. A bend of 0° would mean no bend at all. A bend of 180° would mean the light ends up heading back the way it came.
        </li>
        <li>
          A graph shows the bend for every aim distance from {MIN_AIM_IN_HORIZON_RADII} to {MAX_AIM_IN_HORIZON_RADII} horizon radii, so you can see how the bend changes as the aim gets closer. It also shows the simple formula from Experiment 8, for comparison.
        </li>
      </ol>
      <p style={paragraph}>The question each picture answers is the same: what does the black hole do to the light?</p>
      <p style={paragraph}>
        <strong>Some new words.</strong> The <strong>aim distance</strong> is the distance described above. The <strong>bend</strong> is the angle the light’s direction is turned through, as above. Light that reaches the black hole’s edge and goes no further is{' '}
        <strong>captured</strong>. The <strong>horizon</strong> is that edge, the one-way boundary you met in Experiment 1 of this chapter. The <strong>horizon radius</strong> is the distance from the black hole’s center to its horizon, and we measure distances in
        horizon radii: 10 horizon radii means ten times as far from the center as the edge is. The <strong>exact theory of gravity</strong> is general relativity. The <strong>simple formula</strong> is the weak-gravity rule from Experiment 8. For the biggest black holes
        the distances in kilometers are huge, so we also give them in <strong>astronomical units</strong> (AU): 1 AU is the distance from the Earth to the Sun, about 150 million kilometers. All of these, and a radian, are in the “Words and formulas” box below.
      </p>
      <p style={paragraph}>
        <strong>The black holes.</strong> They are the three from Experiments 1, 2 and 3: a stellar black hole of 10 Suns’ worth of mass (a round, illustrative value), Sagittarius A*, the black hole at the center of our galaxy, and M87*, the black hole imaged in the galaxy
        M87. Their masses are about 4 million and 6.5 billion Suns.
      </p>
      <p style={paragraph}>
        <strong>What this builds on.</strong> Gravity and Curved Spacetime, Experiment 8 gave you the bending of light by a mass. Experiment 1 of this chapter gave you the horizon radius, Experiment 2 showed that gravity close to a horizon is strong enough to change how
        clocks tick, and Experiment 3 asked what that strong gravity does to the orbit of a small probe. Here we ask what it does to light.
      </p>
      <p style={paragraph}>
        <strong>What you will do.</strong> First, make three predictions, then press Run. One run shows two beams of light passing the 10-Sun black hole ({formatDistance(run.five.horizonRadiusKm)} to its edge), and a graph.{' '}
        <strong>The real pictures and tables never change with your guesses. After the run, your guesses are drawn on them in white and shown again beside the results.</strong> Part 2 then lets you choose a black hole and an aim of your own. Those choices do change the drawings.
      </p>
      <p style={paragraph}>
        <strong>What to look for.</strong> How the light’s real path differs from the dashed straight line, how the bend changes as you aim closer, and what happens to the light when you aim very close.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>This is a thought experiment about a thin beam of light.</strong> The beam’s own gravity does not matter. How it got there is not described.
        </li>
        <li>
          <strong>The exact theory’s equation is given, not derived.</strong> It is the standard equation for light passing a black hole that does not spin and has no electric charge. This page does not model a spinning black hole.
        </li>
        <li>
          <strong>The light moves in a flat plane,</strong> seen from above, and nothing else (no gas, no dust, no other star) is in the way.
        </li>
        <li>
          <strong>“Captured” means the light reaches the horizon.</strong> Nothing past that is modeled.
        </li>
        <li>
          <strong>The simple formula in the graph is only a comparison.</strong> It comes from Experiment 8 and was made for weak gravity, far from a mass.
        </li>
        <li>
          <strong>This is not a camera view.</strong> It follows one thin beam, not the picture a telescope would make. (Real pictures of black holes made by telescopes are shown after your first run.)
        </li>
      </ul>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function LightNearBlackHoleLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/mission/hubble/science/universe-uncovered/hubbles-gravitational-lenses/">NASA, “Hubble’s Gravitational Lenses”</Ext> (6 August 2026): how a mass bends the light of things far behind it, the 1919 eclipse test, and Hubble’s pictures of lensed galaxies and the Einstein Cross.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/">NASA, “Black Holes”</Ext> (12 August 2026): a plain overview, including the event horizon and gravitational lensing.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/hubble/hubble-captures-a-mirrored-galaxy/">NASA, “Hubble Captures a Mirrored Galaxy”</Ext> (22 July 2022): a lensed galaxy that shows up as a mirror image of itself.
        </li>
        <li style={linkItem}>
          <Ext href="https://esahubble.org/news/heic1505/">ESA/Hubble, “An explosive quartet”</Ext> (5 March 2015): four images of one exploding star, seen at different times because the light takes different routes.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        All links open in a new tab. After your first run, Part 3 adds more pages, about real pictures of black holes and the original papers. They are held back so they do not give away your guesses.
      </p>
    </div>
  )
}

// The pages added after the first run (they say how big the dark region is, or that light circles).
export function LightNearBlackHoleHeldBackLinks() {
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Check it against NASA, ESO and the original papers</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/anatomy/">NASA, “Black Hole Anatomy”</Ext> (12 August 2026): the ring of circling light and the dark shadow. NASA says the shadow is “roughly twice as big” as the black hole; this page measures it as about{' '}
          {formatNumber(CRITICAL_AIM_IN_HORIZON_RADII)}.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso1907/">ESO, “Astronomers Capture First Image of a Black Hole”</Ext> (10 April 2019): the first picture of a black hole’s shadow, in the galaxy M87.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso2208/">ESO, “First Image of Sagittarius A*”</Ext> (12 May 2022): the picture of the black hole at the center of our galaxy.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso2406/">ESO, “Astronomers unveil strong magnetic fields spiraling at the edge of Milky Way’s central black hole”</Ext> (27 March 2024): the polarized-light picture of Sagittarius A*.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/1906.11243">EHT Collaboration, “First M87 Event Horizon Telescope Results. VI. The Shadow and Mass of the Central Black Hole”</Ext> (2019): the original measurement (the abstract page).
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2509.24593">EHT Collaboration, “Horizon-scale Variability of M87* from 2017–2021 EHT Observations”</Ext> (2025): how the ring changes from year to year (the abstract page).
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>All links open in a new tab.</p>
    </div>
  )
}

// The entries of the shared "Words and formulas" panel (ReferencePanel). The critical aim and the circle where light can circle give the answers
// away, so they appear only after the first run (CLAUDE.md §12).
export function lightNearBlackHoleWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const weak = weakFieldWorked(20)
  const worked = criticalAimWorked()
  const rows = criticalAimRows()
  const entries = [
    { term: 'Aim distance', meaning: 'how close to the black hole’s center a beam of light would pass if gravity did nothing: the distance from the center to the straight path. Like how far a rolled ball’s straight path is from a post.' },
    { term: 'Bend', meaning: 'the angle the light’s direction is turned through by gravity. 0° is no bend; 180° is heading back the way it came; 360° is a full turn.' },
    { term: 'Captured', meaning: 'the light reaches the black hole’s edge (the horizon) and goes no further. Nothing past that is modeled.' },
    { term: 'Horizon, horizon radius', meaning: 'the one-way edge of a black hole, and its distance from the center (written r_s). From Black Holes 1.' },
    { term: 'Distance in horizon radii', meaning: 'the distance from the center divided by r_s. “5 horizon radii” means five times as far from the center as the edge is.' },
    { term: 'Exact theory of gravity', meaning: 'general relativity, Einstein’s theory in which gravity is curved spacetime.' },
    { term: 'Simple formula', meaning: 'the weak-gravity rule from Gravity and Curved Spacetime, Experiment 8, written in horizon radii: bend = 2 ÷ aim, in radians.' },
    {
      term: 'Radian',
      meaning: `a way to measure an angle. A half turn (180°) is about 3.14 radians, so one radian is about ${formatNumber(weak.degreesPerRadian)}°.`,
    },
    {
      term: 'Formula: the simple bend',
      meaning: `bend = 2 ÷ aim, in radians. Worked at an aim of 20 horizon radii: 2 ÷ 20 = ${formatNumber(weak.radians)} radian; ${formatNumber(weak.radians)} × ${formatNumber(weak.degreesPerRadian)}° = ${formatNumber(weak.degrees)}°.`,
    },
    { term: 'Astronomical unit (AU)', meaning: 'the distance from the Earth to the Sun, about 150 million kilometers.' },
  ]
  if (afterRun) {
    entries.push(
      {
        term: 'Critical aim',
        meaning: `the closest aim at which a beam of light still gets away: 3√3 ÷ 2 horizon radii. Worked: √3 is about ${formatNumber(worked.sqrt3)}; 3 × ${formatNumber(worked.sqrt3)} = ${formatNumber(worked.threeSqrt3)}; ${formatNumber(worked.threeSqrt3)} ÷ 2 = ${CRITICAL_AIM_TEXT} horizon radii. For the 10-Sun black hole that is ${CRITICAL_AIM_TEXT} × ${formatDistance(rows[0].horizonRadiusKm)} = ${formatDistance(rows[0].criticalAimKm)}.`,
      },
      {
        term: 'Where light can circle (the photon sphere)',
        meaning: `at ${PHOTON_SPHERE_IN_HORIZON_RADII} horizon radii from the center, light can go round the black hole in a circle. The standard name for this is the photon sphere (a photon is a particle of light). The circle does not last: the slightest push sends the light in or out.`,
      },
      {
        term: 'Shadow',
        meaning: 'the dark region in a picture of a black hole, made because light aimed inside the critical aim is captured. Its width is about 2.6 times the horizon’s width. The ring of glowing gas around it is not the shadow itself.',
      },
    )
  } else {
    entries.push({
      term: 'More words',
      meaning: 'the critical aim, the circle where light can circle and the shadow appear here after your first run, with their formulas and a worked example. They are held back so that they do not give away your guesses.',
    })
  }
  return entries
}

// ---------------------------------------------------------------------------------------------------------------
// The notes under the three Part 1 questions: the situation with real numbers, what each choice means, and how to answer. They give nothing
// away (CLAUDE.md §12): none says where light is captured, whether it swings round, or how large the bend is.
// ---------------------------------------------------------------------------------------------------------------
const notesBox = {
  margin: '0 0 0.75rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  borderLeft: '3px solid #f59e0b',
} as const
const noteItem = { marginBottom: '0.3rem' } as const

export function GuessNotes({ n }: { n: 1 | 2 | 3 }) {
  const run = runPartOne()
  const body: Record<1 | 2 | 3, ReactNode> = {
    1: (
      <>
        <li style={noteItem}>
          <strong>The situation.</strong> The black hole is the 10-Sun one from Black Holes 1, whose edge is {formatNumber(run.five.horizonRadiusKm)} km from its center. The beam is aimed to pass {PART_ONE_FIVE_AIM_IN_HORIZON_RADII} horizon radii out, which is{' '}
          {formatNumber(run.five.aimKm)} km. Your guess is drawn on the left picture and on the graph.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> “Straight on” means the light’s final direction is almost the same as its first. “Bent noticeably” means its direction has clearly turned, but it gets away. “Captured” means it reaches the black hole’s edge.
        </li>
        <li style={noteItem}>
          <strong>How to answer.</strong> Pick the choice nearest your feeling.
        </li>
      </>
    ),
    2: (
      <>
        <li style={noteItem}>
          <strong>The situation.</strong> This question is about a distance, not about one beam. Your answer is drawn as a white ring on the pictures and a white line on the graph at the distance you chose. If your choice is far out, the ring may not fit in the picture; the page
          then draws an arrow at its edge.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> Each names how close to the center a beam must be aimed to be captured: right at the edge, about 2.6 horizon radii out, or about 10 horizon radii out. Aimed farther out than that, the light gets away.
        </li>
        <li style={noteItem}>
          <strong>How to answer.</strong> Pick the choice nearest your feeling.
        </li>
      </>
    ),
    3: (
      <>
        <li style={noteItem}>
          <strong>The situation.</strong> This question is about the right-hand picture, a beam aimed to pass just on the safe side of the distance in question 2. Its exact aim is shown after the run. A choice of what happens has no position of its own, so it is drawn as a marker only.</li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> “Small bend” means the direction turns only a little. “Swings right around” means the direction turns by more than 180° (more than half a turn), yet the light still gets away. “Captured anyway” means it reaches the edge.
        </li>
        <li style={noteItem}>
          <strong>How to answer.</strong> Pick the choice nearest your feeling.
        </li>
      </>
    ),
  }
  return (
    <ul style={{ ...notesBox, listStyle: 'none', paddingLeft: '0.75rem' }} aria-label={`About question ${n}`}>
      {body[n]}
    </ul>
  )
}

export const PART_TWO_AIM_PRESETS = [20, 10, 5, 3.5, 3, 2.7, 2.6, 2.5, 1.5]

const stepItem = { marginBottom: '0.4rem' } as const
const partTwoBox = { margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-muted)' } as const

export function PartTwoGuide() {
  return (
    <div style={partTwoBox}>
      <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
        <strong>How Part 2 works.</strong> In Part 1 the black hole and the aims were chosen for you. Now they are yours, and you can run a beam as many times as you like.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={stepItem}>
          <strong>Choose a black hole.</strong> The three from Black Holes 1 and 2. They are very different in mass and size, but, in horizon radii, the light’s path is the same around each: the black hole you pick changes only the kilometers.
        </li>
        <li style={stepItem}>
          <strong>Choose an aim distance,</strong> in horizon radii, with the buttons or the slider, from {MAX_AIM_IN_HORIZON_RADII} (far) down to {MIN_AIM_IN_HORIZON_RADII} (aimed at the edge). The distance in kilometers is shown beside it.
        </li>
        <li style={stepItem}>
          <strong>Press “Run your choice”.</strong> You watch the beam pass. If you change a setting afterwards, the pictures switch to the new settings until you run again. The results and the tutor stay where they are.
        </li>
        <li style={stepItem}>
          <strong>Compare.</strong> Three things worth trying: keep the black hole and move the aim from far away to very close; keep the aim and change the black hole; and look at where the beam stops getting away.
        </li>
        <li style={stepItem}>
          <strong>Read the numbers.</strong> Table 3 in Part 3 follows your last completed run.
        </li>
      </ol>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>Pictures 3 and 4 below are drawn the same way as Pictures 1 and 2 of Part 1, for your settings. Your guesses are not drawn on them.</p>
    </div>
  )
}

// What each black hole's size means, in kilometers.
export function BlackHoleOptionsNote() {
  const rows = criticalAimRows()
  return (
    <ul style={{ ...partTwoBox, margin: '0.25rem 0 0.5rem', paddingLeft: '1.25rem' }}>
      {rows.map((r) => (
        <li key={r.preset.id} style={{ marginBottom: '0.2rem' }}>
          <strong>{r.preset.label}:</strong> its horizon radius is about {formatDistance(r.horizonRadiusKm)}.
        </li>
      ))}
    </ul>
  )
}

// The drawing made for this page: three beams, no gravity, far from a black hole and very close. It is a schematic (not to scale) and is shown only
// after the first run, because its third path shows a beam swinging round.
function BendsDrawing() {
  return (
    <svg viewBox="0 0 400 260" width="100%" style={{ ...imgStyle, maxWidth: '440px', backgroundColor: '#0b1020' }} role="img" aria-label="A black hole at the center and three paths of light coming in from the right: a straight line, a gently bent line, and a line that swings round the black hole.">
      <circle cx={200} cy={150} r={22} fill="#e879f9" fillOpacity={0.35} stroke="#fb7185" strokeWidth={2} />
      <text x={200} y={154} fill="#e2e8f0" fontSize="10" textAnchor="middle">
        black hole
      </text>
      <path d="M392,30 L12,30" stroke="#e2e8f0" strokeDasharray="5 4" fill="none" />
      <text x={12} y={22} fill="#e2e8f0" fontSize="10">
        no gravity: a straight line
      </text>
      <path d="M392,78 Q220,78 40,120" stroke="#22d3ee" strokeWidth={2} fill="none" />
      <text x={392} y={70} fill="#22d3ee" fontSize="10" textAnchor="end">
        far from the black hole: a little bent
      </text>
      <path d="M392,118 C300,118 250,118 232,138 C214,160 172,172 168,146 C164,120 200,106 232,120 C262,134 262,172 222,192 L120,246" stroke="#4ade80" strokeWidth={2} fill="none" />
      <text x={392} y={110} fill="#4ade80" fontSize="10" textAnchor="end">
        very close: swings round
      </text>
    </svg>
  )
}

// Real pictures and recent news, shown only after the first run (CLAUDE.md §12): the pictures show a dark middle, which would hint at capture.
export function RealPictures() {
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Real black-hole pictures, and recent news (as of November 2026)</h4>
      <p style={paragraph}>
        <strong>The first picture of a black hole’s shadow (ESO, 10 April 2019).</strong> The Event Horizon Telescope, a network of radio telescopes working together, showed a ring of glowing gas with a dark middle, in the galaxy M87. ESO says the black hole’s edge is
        “around 2.5 times smaller than the shadow it casts”. NASA’s page on black hole anatomy calls the shadow “roughly twice as big as the black hole’s actual surface”. <strong>This page’s number, {formatNumber(CRITICAL_AIM_IN_HORIZON_RADII)}, comes from the same equation as your
        pictures</strong>, and NASA’s and ESO’s wordings are roundings of it. The team measured the ring at 42 ± 3 millionths of an arcsecond across.
      </p>
      <Figure
        caption={
          <>
            <strong>M87*</strong> (say “M-87-star”), the black hole at the center of the galaxy M87, as seen by the Event Horizon Telescope. A real observation: a ring of glowing gas around a dark middle. It has a mass 6.5 billion times that of the Sun.
          </>
        }
        credit="Image: EHT Collaboration (CC BY 4.0), via ESO."
      >
        <img
          src={M87_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas, brighter at the bottom, around a dark patch in the middle, on a black background."
          width={1280}
          height={746}
          style={{ ...imgStyle, maxWidth: 'min(100%, 560px)' }}
        />
      </Figure>
      <p style={paragraph}>
        <strong>Our own galaxy’s black hole (ESO, 12 May 2022).</strong> The same team showed Sagittarius A*. ESO says it appears “about the same size in the sky as a doughnut on the Moon”.
      </p>
      <Figure
        caption={<>Sagittarius A*, the black hole at the heart of our galaxy. A real observation: a ring of glowing gas around a dark middle.</>}
        credit="Image: EHT Collaboration (CC BY 4.0), via ESO."
      >
        <img
          src={SGRA_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas with three brighter spots, around a dark patch in the middle, on a black background."
          width={1280}
          height={1280}
          style={{ ...imgStyle, maxWidth: 'min(100%, 380px)' }}
        />
      </Figure>
      <p style={paragraph}>
        <strong>Recent news.</strong> A 2025 paper by the Event Horizon Telescope team found that M87*’s ring stayed the same size, 43.9 ± 0.6 millionths of an arcsecond, in 2017, 2018 and 2021, while the bright pattern around it changed. In March 2024 ESO reported that the pictures of
        M87* and Sagittarius A* look “remarkably similar” when seen in polarized light.
      </p>
      <Figure
        caption={
          <>
            <strong>Straight, a little bent, swung round.</strong> A schematic drawn for this page, not to scale. It is the picture your own pictures above fill in: no gravity (a straight line), far from a black hole (a little bent) and very close (swung round).
          </>
        }
      >
        <BendsDrawing />
      </Figure>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        These pictures were not made by this experiment. The ring is glowing gas around the dark region, and the experiment’s beams are a thought experiment, not a camera view. Cosmic Horizons, Experiment {displayNumber(21)} (“Can we photograph a black hole’s shadow?”), sets the calculated shadow beside the measured ring sizes. Science changes
        quickly; this block shows what was true on the date above.
      </p>
    </div>
  )
}
