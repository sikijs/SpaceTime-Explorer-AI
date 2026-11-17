import type { ReactNode } from 'react'
import {
  BODY_LENGTH_METERS,
  PART_ONE_START_IN_HORIZON_RADII,
  LN_10,
  runPartOne,
  stretchInG,
  threeHoleRows,
  travelerClockSteps,
} from '../physics/fallingInExperiment'
import { formatDistance, formatFour, formatG, formatNumber, formatSeconds } from './FallingInPictures'
import { paragraph } from './TidalEffectExperiment'

// Black Holes, Experiment 5 (audit update): the introduction, the links, the words box, the notes under the three questions, Part 2's guide and
// the block of real things pulled toward black holes (docs/audit/black-holes-and-strong-gravity/05-draft-wording.md, approved by the owner on
// 2026-11-17). The introduction keeps clear of the answers to the three questions (CLAUDE.md §12): it does not say that the far-away clock never
// settles, how large the stretch is, or that it depends on the size of the black hole. Those, and the real things that were torn apart, come only
// after the first run.

const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#0b1020',
} as const

function Figure({ children, caption }: { children: ReactNode; caption: ReactNode }) {
  return (
    <figure style={{ margin: '1rem 0', padding: 0 }}>
      {children}
      <figcaption style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>{caption}</figcaption>
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

// Drawing 1: two watches. Who holds which clock, and nothing else: both faces are blank.
function TwoWatchesDrawing() {
  const ticks = [0, 90, 180, 270]
  const face = (cx: number, cy: number, color: string) => (
    <g>
      <circle cx={cx} cy={cy} r={22} fill="#0b1020" stroke={color} strokeWidth={3} />
      {ticks.map((t) => (
        <line key={t} x1={cx + 17 * Math.sin((t * Math.PI) / 180)} y1={cy - 17 * Math.cos((t * Math.PI) / 180)} x2={cx + 21 * Math.sin((t * Math.PI) / 180)} y2={cy - 21 * Math.cos((t * Math.PI) / 180)} stroke={color} />
      ))}
    </g>
  )
  return (
    <svg
      viewBox="0 0 440 250"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="A black hole at the bottom. Above it, a traveler falling toward it, wearing a watch with a blank face. Far to the right, a friend's clock with a blank face, at rest."
    >
      <circle cx={150} cy={215} r={30} fill="#e879f9" fillOpacity={0.35} stroke="#fb7185" strokeWidth={2} />
      <text x={150} y={219} fill="#e2e8f0" fontSize="11" textAnchor="middle">
        black hole
      </text>
      <line x1={150} y1={70} x2={150} y2={176} stroke="#e2e8f0" strokeDasharray="4 4" strokeOpacity={0.7} />
      <circle cx={150} cy={64} r={7} fill="#22d3ee" />
      <text x={166} y={50} fill="#22d3ee" fontSize="11">
        the traveler, falling
      </text>
      {face(112, 28, '#22d3ee')}
      <text x={112} y={64} fill="#22d3ee" fontSize="10" textAnchor="middle">
        their watch
      </text>
      {face(372, 70, '#fb923c')}
      <text x={372} y={108} fill="#fb923c" fontSize="11" textAnchor="middle">
        a friend's clock
      </text>
      <text x={372} y={122} fill="#fb923c" fontSize="10" textAnchor="middle">
        at rest, far away
      </text>
      <path d="M268,150 L338,150" stroke="#94a3b8" strokeDasharray="3 4" fill="none" />
      <text x={303} y={168} fill="#94a3b8" fontSize="10" textAnchor="middle">
        far away
      </text>
    </svg>
  )
}

// Drawing 2: why the feet are pulled harder than the head. No black-hole numbers and no comparison between black holes.
function FeetDrawing() {
  return (
    <svg
      viewBox="0 0 440 270"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="A body falling feet first toward a black hole at the bottom. A long arrow at the feet and a shorter arrow at the head both point down. The feet are pulled harder because they are nearer."
    >
      <rect x={198} y={34} width={44} height={110} rx={20} fill="#22d3ee" fillOpacity={0.25} stroke="#22d3ee" strokeWidth={2} />
      <text x={220} y={26} fill="#22d3ee" fontSize="11" textAnchor="middle">
        head
      </text>
      <text x={220} y={160} fill="#22d3ee" fontSize="11" textAnchor="middle">
        feet
      </text>
      <path d="M165,52 L165,86" stroke="#fbbf24" strokeWidth={3} fill="none" />
      <polygon points="165,94 159,84 171,84" fill="#fbbf24" />
      <text x={150} y={72} fill="#fbbf24" fontSize="10" textAnchor="end">
        pulled less (farther)
      </text>
      <path d="M165,118 L165,184" stroke="#fbbf24" strokeWidth={5} fill="none" />
      <polygon points="165,194 157,180 173,180" fill="#fbbf24" />
      <text x={150} y={150} fill="#fbbf24" fontSize="10" textAnchor="end">
        pulled harder (nearer)
      </text>
      <path d="M120,270 A100,60 0 0 1 320,270 Z" fill="#e879f9" fillOpacity={0.35} stroke="#fb7185" strokeWidth={2} />
      <text x={220} y={254} fill="#e2e8f0" fontSize="11" textAnchor="middle">
        black hole
      </text>
    </svg>
  )
}

export function FallingInIntro() {
  const run = runPartOne()
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> In Experiment 2 of this chapter you compared two clocks held at rest, one far from a black hole and one hovering close to its horizon, and saw that the hovering clock ticks differently. That experiment said nothing about a traveler who falls in. So what happens to a
        traveler who falls straight toward a black hole? What does their own watch show, what does a clock far away show, and what do they feel on the way?
      </p>
      <p style={paragraph}>
        <strong>Why even ask this.</strong> Picture yourself as the traveler. You let go, and a black hole waits below you. There are no engines and no rope, nothing to hold you back, and once you cross the horizon there is no way back. A friend stays far away, watching over the whole thing with a clock of their
        own, while you carry a watch on your wrist. In everyday life this would not be a puzzle. Drop a stone and it reaches the ground in a moment, and everyone watching agrees how long it took. We take for granted that all clocks agree on how long something lasts. But in Experiment 2, two clocks near a black hole
        did not agree about how fast they tick. So it is fair to ask whether you and your friend would tell the same story of your fall: how long it lasts, and what you feel on the way down.
      </p>
      <p style={paragraph}>
        <strong>Two watches.</strong> In this experiment two clocks keep time for the whole fall. The traveler wears one on their wrist. The other is a clock at rest, far from the black hole, that was started at the moment of release. We compare them at the moment the traveler passes each distance. (This compares two
        clocks. It is not a picture of what a far-away observer would see; that is a different question, for a later experiment.)
      </p>
      <Figure
        caption={
          <>
            <strong>Two watches.</strong> A schematic drawn for this page, not to scale. It shows who holds which clock. Both faces are blank on purpose: the experiment is about what they read.
          </>
        }
      >
        <TwoWatchesDrawing />
      </Figure>
      <p style={paragraph}>
        <strong>Why the feet are pulled harder than the head.</strong> Gravity pulls harder on whatever is nearer to the thing doing the pulling. You can see this with the Moon: NASA explains that the Moon’s pull is strongest on the points of Earth closest to the Moon and weakest on the points farthest away, and that this
        uneven pull is part of what raises the tides. Now picture a traveler falling feet first toward a black hole. Their feet are slightly nearer than their head, so the feet are pulled slightly harder, and the traveler is stretched. We measure the stretch as the difference in pull between the two ends of a{' '}
        {BODY_LENGTH_METERS}-meter body, in <strong>g</strong>: 1 g is the pull of Earth’s gravity at its surface. It is the same kind of effect as the tidal effect you met in Gravity and Curved Spacetime, Experiment 3.
      </p>
      <Figure
        caption={
          <>
            <strong>Why the feet are pulled harder.</strong> A schematic drawn for this page, not to scale, with no numbers. The arrow at the feet is longer because the feet are nearer the black hole.
          </>
        }
      >
        <FeetDrawing />
      </Figure>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What happens.</strong> Here is the whole experiment, step by step.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          Part 1 fixes the black hole (the 10-Sun one from Black Holes 1) and the release distance ({PART_ONE_START_IN_HORIZON_RADII} horizon radii, which is {formatDistance(PART_ONE_START_IN_HORIZON_RADII * run.horizonRadiusKm)} from its center), and you press Run. In Part 2 you choose a black hole and a release
          distance of your own.
        </li>
        <li>
          The traveler is released <strong>from rest</strong>. That means they are not moving at the start. After that, gravity pulls them straight toward the center. Nothing else acts on them: there are no engines.
        </li>
        <li>Two clocks keep time for the whole fall: the traveler’s own watch and the far-away clock.</li>
        <li>You press Run and watch for a few seconds. The first picture follows the traveler down and shows both clocks and how much the traveler is stretched.</li>
        <li>The experiment follows the fall as far as the horizon: it does not show anything inside.</li>
        <li>A second picture is a graph of how near the horizon the traveler is, against each clock. A third is a graph of the stretching at every distance, for all three black holes.</li>
      </ol>
      <p style={paragraph}>
        The path of the fall is worked out with the <strong>exact theory of gravity</strong> (general relativity, the theory that gravity is curved spacetime), the same one used in the earlier experiments of this chapter.
      </p>
      <p style={paragraph}>
        <strong>Some new words.</strong> The <strong>traveler’s clock</strong> is the watch the traveler wears: it shows time as they experience it. The <strong>far-away clock</strong> is a clock at rest far from the black hole, read at the moment the traveler passes each distance. The{' '}
        <strong>horizon</strong> is the one-way boundary you met in Experiment 1 of this chapter, and the <strong>horizon radius</strong> is the distance from the black hole’s center to its horizon. We measure distances in horizon radii: 10 horizon radii means ten times as far from the center as the edge is.
        Because the three black holes are so different in size, we measure time in a unit that scales with them: a <strong>horizon light-time</strong> is the time light takes to travel across one horizon radius. For example, light travels about 300,000 km each second, and the 10-Sun black hole’s horizon radius is about
        30 km, so one horizon light-time for it is about 30 ÷ 300,000 = 0.0001 seconds. For the biggest black holes the distances in kilometers are huge, so we also give them in <strong>astronomical units</strong> (AU): 1 AU is the distance from the Earth to the Sun, about 150 million kilometers. All of these,
        and the stretch formula, are in the “Words and formulas” box below.
      </p>
      <p style={paragraph}>
        <strong>The black holes.</strong> They are the three from the earlier experiments of this chapter: a stellar black hole of 10 Suns’ worth of mass (a round, illustrative value), Sagittarius A*, the black hole at the center of our galaxy, and M87*, the black hole imaged in the galaxy M87. Their masses are about 4.3 million
        and 6.5 billion Suns.
      </p>
      <p style={paragraph}>
        <strong>What this builds on.</strong> Experiment 1 gave you the horizon radius. Experiment 2 compared two clocks at rest near a black hole. Experiments 3 and 4 showed where orbits and light stop being safe near a black hole, and ended in a plunge and a capture. Here we follow a traveler who falls in.
      </p>
      <p style={paragraph}>
        <strong>What you will do.</strong> First, make three predictions, then press Run. One run shows one fall into the 10-Sun black hole, with two clocks and a stretch readout, and two graphs.{' '}
        <strong>The real pictures and tables never change with your guesses. After the run, your guesses are drawn on them in white and shown again beside the results.</strong> Part 2 then lets you choose a black hole and a release distance of your own. Those choices do change the drawings.
      </p>
      <p style={paragraph}>
        <strong>What to look for.</strong> What each clock reads as the traveler nears the horizon, how the stretch changes as the traveler gets nearer, and how the stretch compares from one black hole to another.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>This is a thought experiment about a small traveler,</strong> {BODY_LENGTH_METERS} meters long, released from rest and falling straight in with nothing else acting on them. How they got to the starting point is not described, and their own gravity does not matter.
        </li>
        <li>
          <strong>The equations are given, not derived.</strong> They are the standard ones for a black hole that does not spin and has no electric charge. This page does not model a spinning black hole.
        </li>
        <li>
          <strong>The far-away clock is compared with the traveler’s clock,</strong> not with a picture. What a far-away observer would actually see is a different question, and is not modeled.
        </li>
        <li>
          <strong>The experiment ends at the horizon.</strong> Nothing inside it is modeled, and this is not a camera view. (Real pictures of things pulled toward black holes are shown after your first run.)
        </li>
      </ul>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function FallingInLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/">NASA, “Black Holes”</Ext> (12 August 2026): a plain overview, including the event horizon.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/moon/tides/">NASA, “Tides”</Ext> (12 February 2026): how the Moon’s uneven pull raises ocean tides.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        All links open in a new tab. After your first run, Part 3 adds more pages, about real things pulled toward black holes. They are held back so they do not give away your guesses.
      </p>
    </div>
  )
}

// The pages added after the first run (they describe stretching, being torn apart, or what the clocks do).
export function FallingInHeldBackLinks() {
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Check it against NASA and ESO</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/supermassive-black-holes/new-nasa-black-hole-visualization-takes-viewers-beyond-the-brink/">
            NASA, “New NASA Black Hole Visualization Takes Viewers Beyond the Brink”
          </Ext>{' '}
          (6 May 2024): falling toward a black hole the size of Sagittarius A*, and what small black holes do to approaching objects.
        </li>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/educators/blackholes/imagine/page8.html">NASA Goddard, “The Anatomy of Black Holes”, page 8</Ext>: an explorer falling in, and two clocks that disagree. (Its later lines describe what the far-away watchers see, which is a later experiment’s question.)
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso1151/">ESO, “A Black Hole’s Dinner is Fast Approaching”</Ext> (14 December 2011) and{' '}
          <Ext href="https://www.eso.org/public/news/eso1512/">“Best View Yet of Dusty Cloud Passing Galactic Centre Black Hole”</Ext> (26 March 2015): the gas cloud G2.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso2018/">ESO, “Death by Spaghettification”</Ext> (12 October 2020): a star shredded by a black hole.
        </li>
        <li style={linkItem}>
          <Ext href="https://heasarc.gsfc.nasa.gov/docs/objects/heapow/archive/compact_objects/tdes_swift.html">NASA HEASARC, “Disruption”</Ext>: why a black hole can pull a star apart.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/swift/nasas-swift-sees-wandering-mega-black-hole-shredding-star/">NASA, “NASA’s Swift Sees ‘Wandering’ Mega Black Hole Shredding Star”</Ext> (27 July 2026).
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/apod/frequently-asked-questions-faqs-on-black-holes">NASA, “Frequently Asked Questions (FAQs) on Black Holes”</Ext> (a page last updated in 1995): how the stretching depends on a black hole’s mass.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>All links open in a new tab.</p>
    </div>
  )
}

// The entries of the shared "Words and formulas" panel (ReferencePanel). The closed form for the traveler's clock and the far-away clock's growth
// give guesses 1 and 2 away, so they appear only after the first run (CLAUDE.md §12).
export function fallingInWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const run = runPartOne()
  const steps = travelerClockSteps(PART_ONE_START_IN_HORIZON_RADII)
  const entries = [
    { term: "Traveler's clock", meaning: 'the watch the traveler wears: it shows time as the traveler experiences it.' },
    { term: 'Far-away clock', meaning: 'a clock at rest far from the black hole, started at the moment of release and read at the moment the traveler passes each distance. This compares two clocks; it is not a picture of what a far-away observer would see.' },
    { term: 'From rest', meaning: 'not moving at the start. After release, gravity alone pulls the traveler straight toward the center.' },
    { term: 'Horizon, horizon radius', meaning: 'the one-way edge of a black hole, and its distance from the center (written r_s). From Black Holes 1.' },
    { term: 'Distance in horizon radii', meaning: 'the distance from the center divided by r_s. “10 horizon radii” means ten times as far from the center as the edge is.' },
    { term: 'Horizon light-time', meaning: `the time light takes to cross one horizon radius: r_s ÷ c. For the 10-Sun black hole, ${formatSeconds(run.lightTimeSeconds)}. It is the unit of time on the graphs.` },
    { term: 'Stretch', meaning: `the difference in pull between the two ends of a ${BODY_LENGTH_METERS}-meter body, in g. The nearer end is pulled harder.` },
    { term: 'g', meaning: 'the pull of Earth’s gravity at its surface (9.81 m/s²). A stretch of 3 g means the feet are pulled harder than the head by three times that.' },
    { term: 'Exact theory of gravity', meaning: 'general relativity, Einstein’s theory in which gravity is curved spacetime.' },
    { term: 'Astronomical unit (AU)', meaning: 'the distance from the Earth to the Sun, about 150 million kilometers.' },
    {
      term: 'Formula: the stretch',
      meaning: `the difference in pull across a length h at a distance r from the center of a mass M is 2GM × h ÷ r³ (G is the strength of gravity). Worked for a ${BODY_LENGTH_METERS}-meter body ${PART_ONE_START_IN_HORIZON_RADII} horizon radii (${formatDistance(PART_ONE_START_IN_HORIZON_RADII * run.horizonRadiusKm)}) from a black hole of 10 Suns: ${formatG(run.stretchAtStartInG)}.`,
    },
  ]
  if (afterRun) {
    entries.push(
      {
        term: "Formula: the traveler's clock",
        meaning: `for a fall from rest at r₀ horizon radii, the traveler's clock at the horizon reads ½ × r₀^1.5 × (η + sin η) light-times, where cos η = 2 ÷ r₀ − 1. Worked for r₀ = ${PART_ONE_START_IN_HORIZON_RADII}: ${PART_ONE_START_IN_HORIZON_RADII}^1.5 = ${formatFour(steps.startPower)}; cos η = ${formatFour(steps.cosEta)}, so η = ${formatFour(steps.etaRadians)} radians and sin η = ${formatFour(steps.sinEta)}; ½ × ${formatFour(steps.startPower)} × (${formatFour(steps.etaRadians)} + ${formatFour(steps.sinEta)}) = ${formatFour(steps.clockAtHorizon)} light-times.`,
      },
      {
        term: 'The far-away clock near the horizon',
        meaning: `each time the gap above the horizon shrinks to a tenth, the far-away clock reads about ${formatFour(LN_10)} light-times more (ln 10 = ${formatFour(LN_10)}), however close the traveler gets.`,
      },
    )
  } else {
    entries.push({
      term: 'More words',
      meaning: 'the formula for the traveler’s clock and the far-away clock’s growth near the horizon appear here after your first run. They are held back so that they do not give away your guesses.',
    })
  }
  return entries
}

// ---------------------------------------------------------------------------------------------------------------
// The notes under the three Part 1 questions: the situation with real numbers, what each choice means, and how to answer. They give nothing
// away (CLAUDE.md §12): none says what the far-away clock does, how large the stretch is, or how it depends on the black hole.
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
          <strong>The situation.</strong> The black hole is the 10-Sun one from Black Holes 1, whose edge is {formatNumber(run.horizonRadiusKm)} km from its center. The traveler is released from rest {PART_ONE_START_IN_HORIZON_RADII} horizon radii out, which is{' '}
          {formatNumber(PART_ONE_START_IN_HORIZON_RADII * run.horizonRadiusKm)} km. “The trip to the horizon” is the fall from there to the edge. “Comes to an end” means the traveler’s own watch shows the traveler arriving. Your guess is drawn on Picture 2.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> The first says the trip ends and the traveler arrives. The second says it never ends. The third says it ends for some black holes and not for others.
        </li>
        <li style={noteItem}>
          <strong>How to answer.</strong> Pick the choice nearest your feeling.
        </li>
      </>
    ),
    2: (
      <>
        <li style={noteItem}>
          <strong>The situation.</strong> The far-away clock was started at the moment of release and sits at rest far from the black hole. We read it at the moment the traveler passes each distance, so the two clocks are compared at the same point in the fall. Both are in horizon light-times. Your guess is drawn
          on Picture 2. The choices are about its shape, so it is drawn as a marker only.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> “About the same” means the two clocks read nearly alike all the way. “Somewhat more, and then it settles” means the far-away clock runs ahead a little and then stops changing much. “Later and later, without limit” means it keeps rising however close the traveler gets.
        </li>
        <li style={noteItem}>
          <strong>How to answer.</strong> Pick the choice nearest your feeling.
        </li>
      </>
    ),
    3: (
      <>
        <li style={noteItem}>
          <strong>The situation.</strong> The stretch is the difference in pull between the two ends of a {BODY_LENGTH_METERS}-meter body, in g, at the moment the traveler reaches the horizon. Picture 3 draws the stretch for three black holes, so the two you are asked about are both there. Your guess is drawn as a
          pointer at the horizon edge of Picture 3, to the black hole you chose, and it is a marker only.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> “Much stronger at the small black hole” means the 10-Sun black hole stretches the traveler far more than Sagittarius A* does. “About the same” means the two are close. “Much stronger at the giant black hole” means Sagittarius A* stretches the traveler far more.
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

const stepItem = { marginBottom: '0.4rem' } as const
const partTwoBox = { margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-muted)' } as const

export function PartTwoGuide() {
  return (
    <div style={partTwoBox}>
      <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
        <strong>How Part 2 works.</strong> In Part 1 the black hole and the release distance were chosen for you. Now they are yours, and you can run the fall as many times as you like.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={stepItem}>
          <strong>Choose a black hole.</strong> The three from the earlier experiments. They are very different in mass and size. In horizon radii and light-times the fall is the same around each; the kilometers, the seconds and the stretch are not.
        </li>
        <li style={stepItem}>
          <strong>Choose a release distance,</strong> in horizon radii (100, 20, 10, 5 or 2). The distance in kilometers is shown beside it.
        </li>
        <li style={stepItem}>
          <strong>Press “Run your choice”.</strong> You watch the traveler fall. If you change a setting afterwards, the pictures switch to the new settings until you run again. The results and the tutor stay where they are.
        </li>
        <li style={stepItem}>
          <strong>Compare.</strong> Three things worth trying: keep the release distance and change the black hole; keep the black hole and release the traveler from nearer or farther; and watch the stretch readout.
        </li>
        <li style={stepItem}>
          <strong>Read the numbers.</strong> Table 3 in Part 3 follows your last completed run.
        </li>
      </ol>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>Pictures 4 to 6 below are drawn the same way as Pictures 1 to 3 of Part 1, for your settings. Your guesses are not drawn on them.</p>
    </div>
  )
}

// What each black hole's size means, in kilometers.
export function BlackHoleOptionsNote() {
  const rows = threeHoleRows()
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

// Real things pulled toward black holes, shown only after the first run (CLAUDE.md §12): they describe stretching and being torn apart.
export function RealThings() {
  const small = stretchInG(10, 1)
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Real things pulled toward black holes, and recent news (as of November 2026)</h4>
      <p style={paragraph}>
        <strong>Stars torn apart.</strong> NASA’s HEASARC explains that a black hole’s gravity pulls harder on the near side of a star than on the far side, and that this tidal force can be large enough to pull the star apart. Astronomers call such a flare a tidal disruption event. NASA, ESO and Chandra call being stretched
        out like this “spaghettification”, and NASA says: “Infalling objects stretch out like noodles.” ESO’s release of 12 October 2020 described a star about the mass of the Sun that lost about half of itself to a black hole more than a million times as heavy. In a NASA release of 27 July 2026, Swift saw a star shredded
        by a black hole of about a million Suns, in a galaxy about 750 million light-years away. In these cases the star is torn apart outside the black hole, which this experiment does not model: it follows one small traveler as far as the horizon.
      </p>
      <p style={paragraph}>
        <strong>A cloud that was expected to be torn apart.</strong> In 2011 ESO reported a gas cloud, called G2, with about three times the mass of the Earth, heading for Sagittarius A*, and said it would not survive the experience. It made its closest approach in May 2014. In 2015 ESO reported that it had survived,
        that astronomers could not confirm any significant stretching, and that it was most likely a young star with a massive core. A prediction about what a black hole’s pull would do did not come out as expected. It is a reminder that these are real objects, not the traveler of this thought experiment.
      </p>
      <p style={paragraph}>
        <strong>Small and large black holes.</strong> NASA’s 2024 page about a visualization of a fall toward a black hole the size of Sagittarius A* (its horizon spans about 25 million km; this page’s horizon radius for Sagittarius A* is 12.7 million km) says that stellar-mass black holes have much smaller event horizons and
        stronger tidal forces, which can rip apart approaching objects before they get to the horizon. A NASA FAQ (a page last updated in 1995) says that, for a person, the stretching becomes survivable for black holes larger than about 1,000 Suns. For comparison, this page’s model gives {formatG(small)} at the horizon of a
        10-Sun black hole. <strong>Neither NASA page is about a star, and neither was made by this experiment.</strong>
      </p>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        These are not observations of falling past a horizon. Nothing has ever been seen crossing one. Science changes quickly; this block shows what was true on the date above.
      </p>
    </div>
  )
}

