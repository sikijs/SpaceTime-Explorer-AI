import type { ReactNode } from 'react'
import {
  FLASH_COUNT,
  LN_10,
  PART_ONE_START_IN_HORIZON_RADII,
  arrivalIncreasesPerTenfoldGap,
  runPartOne,
  workedDistance,
  workedSteps,
} from '../physics/seeingTheFallExperiment'
import { paragraph } from './TidalEffectExperiment'

// Black Holes, Experiment 6 (audit update): the introduction, the links, the words box and the notes under the three questions
// (docs/audit/black-holes-and-strong-gravity/06-draft-wording.md, "all defaults" from the owner on 2026-11-17). The introduction keeps clear of
// the answers to the three questions (CLAUDE.md §12): it does not say that the gaps grow, that the last flash never arrives, how large the stretch
// factor is, or what causes it. Nothing in the drawings is white: white is reserved for the learner's guess marks.

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

const fmt = (x: number, digits: number) => x.toFixed(digits)
const ul = { margin: '0.25rem 0', paddingLeft: '1.25rem' } as const

// A clock face with blank hands: who holds which clock, nothing else.
function clockFace(cx: number, cy: number, color: string) {
  const ticks = [0, 90, 180, 270]
  return (
    <g>
      <circle cx={cx} cy={cy} r={20} fill="#0b1020" stroke={color} strokeWidth={3} />
      {ticks.map((t) => (
        <line
          key={t}
          x1={cx + 15 * Math.sin((t * Math.PI) / 180)}
          y1={cy - 15 * Math.cos((t * Math.PI) / 180)}
          x2={cx + 19 * Math.sin((t * Math.PI) / 180)}
          y2={cy - 19 * Math.cos((t * Math.PI) / 180)}
          stroke={color}
        />
      ))}
    </g>
  )
}

// A short zigzag arrow pointing to the right (toward the observer). x0 to x1 along y.
function flashArrow(x0: number, x1: number, y: number, key?: string) {
  const mid = (x0 + x1 - 12) / 2
  return (
    <g key={key}>
      <polyline points={`${x0},${y} ${x0 + (mid - x0) * 0.35},${y - 7} ${mid},${y + 7} ${x1 - 12},${y}`} stroke="#fbbf24" strokeWidth={3} fill="none" strokeLinejoin="round" />
      <polygon points={`${x1},${y} ${x1 - 14},${y - 7} ${x1 - 14},${y + 7}`} fill="#fbbf24" />
    </g>
  )
}

// Drawing 1: the observer's view. Black hole at the left, traveler falling toward it, one flash climbing out toward the observer. Blank clock faces.
function ObserversViewDrawing() {
  return (
    <svg
      viewBox="0 0 440 240"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="A black hole on the left. A traveler with a watch that has a blank face, falling toward it, a little to its right. A short zigzag arrow pointing away from the black hole, toward an observer far to the right who stands at rest next to a clock with a blank face."
    >
      <circle cx={50} cy={150} r={32} fill="#9d174d" stroke="#fb7185" strokeWidth={2} />
      <text x={50} y={154} fill="#e2e8f0" fontSize="11" textAnchor="middle">
        black hole
      </text>
      <text x={14} y={208} fill="#fb7185" fontSize="10" textAnchor="start">
        rose ring: the horizon
      </text>
      <circle cx={140} cy={150} r={7} fill="#22d3ee" />
      <path d="M140,128 L140,110" stroke="#22d3ee" strokeWidth={2} fill="none" />
      {clockFace(140, 90, '#22d3ee')}
      <text x={140} y={52} fill="#22d3ee" fontSize="10" textAnchor="middle">
        their watch
      </text>
      <text x={140} y={176} fill="#22d3ee" fontSize="11" textAnchor="middle">
        the traveler
      </text>
      <text x={140} y={190} fill="#22d3ee" fontSize="10" textAnchor="middle">
        falling
      </text>
      {flashArrow(160, 330, 150)}
      <text x={245} y={130} fill="#fbbf24" fontSize="11" textAnchor="middle">
        one flash of light
      </text>
      <text x={245} y={176} fill="#fbbf24" fontSize="10" textAnchor="middle">
        on its way to the observer
      </text>
      {clockFace(385, 90, '#fb923c')}
      <circle cx={385} cy={150} r={7} fill="#fb923c" />
      <text x={385} y={188} fill="#fb923c" fontSize="11" textAnchor="middle">
        the observer
      </text>
      <text x={385} y={202} fill="#fb923c" fontSize="10" textAnchor="middle">
        at rest, far away
      </text>
      <text x={385} y={52} fill="#fb923c" fontSize="10" textAnchor="middle">
        their clock
      </text>
    </svg>
  )
}

// Drawing 2: two flashes. The one from close to the horizon is drawn longer. No numbers.
function TwoFlashesDrawing() {
  return (
    <svg
      viewBox="0 0 440 260"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="A black hole on the left. Two flashes, both pointing to the right toward an observer. The upper one starts far from the black hole and its arrow is short. The lower one starts close to the horizon and its arrow is longer."
    >
      <circle cx={40} cy={206} r={30} fill="#9d174d" stroke="#fb7185" strokeWidth={2} />
      <text x={40} y={210} fill="#e2e8f0" fontSize="11" textAnchor="middle">
        black hole
      </text>
      <text x={10} y={252} fill="#fb7185" fontSize="10" textAnchor="start">
        rose ring: the horizon
      </text>
      <text x={14} y={22} fill="#fbbf24" fontSize="11">
        Flash A: sent from far out
      </text>
      <circle cx={210} cy={50} r={6} fill="#22d3ee" />
      {flashArrow(222, 340, 50)}
      <text x={210} y={74} fill="#22d3ee" fontSize="10" textAnchor="middle">
        traveler, far out
      </text>
      <text x={14} y={128} fill="#fbbf24" fontSize="11">
        Flash B: sent from close to the horizon
      </text>
      <circle cx={100} cy={196} r={6} fill="#22d3ee" />
      <text x={170} y={226} fill="#22d3ee" fontSize="10" textAnchor="middle">
        traveler, close to the horizon
      </text>
      {flashArrow(112, 340, 196)}
      <text x={226} y={180} fill="#fbbf24" fontSize="10" textAnchor="middle">
        longer arrow: more to climb
      </text>
      <circle cx={392} cy={100} r={7} fill="#fb923c" />
      {clockFace(392, 58, '#fb923c')}
      <text x={392} y={126} fill="#fb923c" fontSize="11" textAnchor="middle">
        the observer
      </text>
      <text x={392} y={140} fill="#fb923c" fontSize="10" textAnchor="middle">
        at rest, far away
      </text>
    </svg>
  )
}

export function SeeingTheFallIntro() {
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> In Black Holes 5 you followed a traveler falling into a black hole and compared two clocks: the traveler’s watch and a clock at rest far away. That was a comparison of clocks. It was not what a far-away observer would actually <em>receive</em>, because light takes time to
        travel, and Black Holes 5 left that out. This time we put it back. What does an observer far away actually receive from the falling traveler, and do they ever see the traveler cross the horizon?
      </p>
      <p style={paragraph}>
        <strong>Why even ask this.</strong> Picture yourself as the observer, far from the black hole, watching a friend fall in. You cannot reach them, so all you have is the light that comes to you from them. In everyday life, watching is the same as knowing: if a friend drops over a cliff edge, you see them go
        at the moment they go, give or take a blink. So ask yourself: when your friend reaches the horizon, do you see it happen? And if you do, when?
      </p>
      <Figure
        caption={
          <>
            <strong>The observer’s view.</strong> A schematic drawn for this page, not to scale. It shows a far-away observer with a clock, a traveler with a watch falling toward a black hole, and one flash of light on its way from the traveler to the observer. Both clock faces are blank on purpose.
            <ul style={ul}>
              <li>
                <strong>The black hole</strong> is the dark pink disc, and the <strong>rose ring</strong> around it is its horizon.
              </li>
              <li>
                <strong>The traveler</strong> is the cyan dot, falling toward the black hole, with the cyan watch above it.
              </li>
              <li>
                <strong>The flash</strong> is the short yellow zigzag arrow. It points away from the black hole, toward the observer.
              </li>
              <li>
                <strong>The observer</strong> is the orange dot with the orange clock. They are at rest, far away.
              </li>
            </ul>
            <strong>What to look for.</strong>
            <ul style={ul}>
              <li>
                <strong>Look at</strong> the yellow arrow between the traveler and the observer. <strong>What it means:</strong> the observer learns about the traveler only from light like this, and the light needs time to arrive. <strong>Why it matters:</strong> so “when does the observer see
                something happen?” is a different question from “when does it happen?”
              </li>
            </ul>
          </>
        }
      >
        <ObserversViewDrawing />
      </Figure>
      <p style={paragraph}>
        <strong>How light climbs out.</strong> Light always takes time to get from one place to another. Sunlight, for example, takes about 8 minutes to reach us. Near a black hole there is a second thing to keep in mind, and the pictures will show it: the journey to the observer is not the same from every starting point.
      </p>
      <p style={paragraph}>
        Think of a deep pit with a ladder up the side. Someone standing at the top has almost no climbing to do. Someone at the bottom has the whole depth to climb before they reach the top. Gravity around a black hole works a little like that pit. The closer to the horizon a flash starts, the deeper in it is, and the more of a “climb” it has to make to get out to an observer far away. So a flash sent from close to the horizon has a longer journey than a flash sent from far out. This is only a picture to help you think about it. The experiment will not use the pit, only the real numbers.
      </p>
      <Figure
        caption={
          <>
            <strong>Two flashes.</strong> A schematic drawn for this page, not to scale, with no numbers. It shows a flash sent from far out (Flash A) and a flash sent from close to the horizon (Flash B), each on its way to the observer. The second arrow is drawn longer, because it has further to climb.
            <ul style={ul}>
              <li>
                The <strong>cyan dots</strong> are the traveler at the moment each flash is sent. The <strong>yellow arrows</strong> are the flashes. The <strong>orange dot and clock</strong> are the observer, far away. The <strong>rose ring</strong> is the horizon.
              </li>
            </ul>
            <strong>What to look for.</strong>
            <ul style={ul}>
              <li>
                <strong>Look at</strong> the two yellow arrows. <strong>What it means:</strong> the flash from nearer the horizon has more climbing to do than the flash from far out. <strong>Why it matters:</strong> the observer will receive the two flashes at different times, even if they were sent at the
                same instant on the same watch.
              </li>
            </ul>
          </>
        }
      >
        <TwoFlashesDrawing />
      </Figure>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What happens.</strong> Here is the whole experiment, step by step.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          Part 1 fixes the black hole (the 10-Sun one from Black Holes 1) and the release distance ({PART_ONE_START_IN_HORIZON_RADII} horizon radii), and you press Run. In Part 2 you choose a black hole and a release distance of your own.
        </li>
        <li>The traveler is released from rest and falls straight in, as in Black Holes 5, until they reach the horizon.</li>
        <li>
          As they fall, the traveler sends a short <strong>flash</strong> of light straight outward, at equal steps of <strong>their own watch</strong>: one at the moment of release, then {FLASH_COUNT - 1} more at equal steps, and a last one, number {FLASH_COUNT}, at the moment they reach the horizon.
          That is {FLASH_COUNT + 1} flashes in all.
        </li>
        <li>
          The <strong>observer</strong>, who is at rest far from the black hole, receives each flash and writes down the time on their own clock when it arrives.
        </li>
        <li>
          You press Run. The first picture shows the flashes twice: <strong>as sent</strong> (the traveler’s watch when each was sent) and <strong>as received</strong> (the observer’s clock when each arrives), with a line joining each flash to its arrival.
        </li>
        <li>A second picture is a graph of how much the spacing between flashes changes, and a third compares the observer’s clock with the traveler’s watch.</li>
      </ol>
      <p style={paragraph}>
        <strong>Some new words.</strong> The <strong>horizon</strong> is the one-way boundary from Black Holes 1, and the <strong>horizon radius</strong> is the distance from the black hole’s center to its horizon. A <strong>horizon light-time</strong> is the time light takes to cross one horizon radius (the
        unit of Black Holes 5). <strong>Light travel time</strong> is how long light takes to get from one place to another. It is never zero. Sunlight, for example, takes about 8 minutes to reach us, so we see the Sun as it was 8 minutes ago. The time between two flashes <em>as sent</em> is the gap between
        them on the traveler’s watch, and <em>as received</em> is the gap between their arrivals on the observer’s clock. The <strong>stretch factor</strong> compares the two: the gap as received divided by the gap as sent. For example, flashes sent 5 seconds apart and received 5 seconds apart have a
        stretch factor of 1; received 10 seconds apart, 2; received 2.5 seconds apart, 0.5. (This is a different thing from the “stretch” of Black Holes 5, which was a pull on the traveler’s body.) The entries are the <strong>flash</strong>, <strong>as sent</strong>, <strong>as received</strong>,{' '}
        <strong>observer</strong>, <strong>light travel time</strong>, <strong>stretch factor</strong>, <strong>horizon</strong>, <strong>horizon radius</strong> and <strong>horizon light-time</strong>, and they are in the “Words and formulas” box below.
      </p>
      <p style={paragraph}>
        <strong>What this builds on.</strong> Black Holes 2 showed a clock near a black hole ticking differently from one far away. Black Holes 5 followed the fall. Gravitational Waves, Experiment 5, dealt with the light from a source that is moving away from you. Here we put these together with the light’s
        journey.
      </p>
      <p style={paragraph}>
        <strong>Your job.</strong> First, make three predictions and press Run. Then, in Part 2, choose a black hole and a release distance of your own, run it, try other black holes and release distances too, and compare.
      </p>
      <p style={paragraph}>
        <strong>What you will do.</strong> The pictures and tables you see here come from the physics, and they never change with your guesses. Your guesses are drawn on the pictures in white and shown again beside the results. The settings in Part 2 do change which drawings you see.
      </p>
      <p style={paragraph}>
        <strong>What to look for.</strong> How far apart the flashes arrive compared with how far apart they were sent, how that changes as the traveler nears the horizon, and what happens to the last flash.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>This is a thought experiment about thin flashes of light,</strong> sent straight outward from a small traveler who falls straight in from rest. The flashes’ own gravity does not matter.
        </li>
        <li>
          <strong>The observer is at rest, very far away,</strong> and arrival times are counted from the arrival of the first flash.
        </li>
        <li>
          <strong>The equations are given, not derived.</strong> They are the standard ones for a black hole that does not spin and has no electric charge. Real black holes usually spin, which changes the details.
        </li>
        <li>
          <strong>Only the timing of the flashes is modeled.</strong> How bright they are, what color they become, and what a camera or telescope would show are not. Nothing here says the last flashes could be detected in practice.
        </li>
        <li>
          <strong>The experiment stops at the horizon.</strong> Nothing inside it is modeled.
        </li>
        <li>Real pictures and measurements of light from near black holes are shown after your first Run.</li>
      </ul>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function SeeingTheFallLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/science/objects/black_holes1.html">NASA Goddard, “Black Holes”</Ext> (Imagine the Universe, updated November 2016): what the event horizon is, “the point of no return”.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/anatomy/">NASA, “Black Hole Anatomy”</Ext> (12 August 2026): the parts of a black hole, including the event horizon.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>All links open in a new tab. After your first run, Part 3 adds more pages. They are held back so they do not give away your guesses.</p>
    </div>
  )
}

// The pages added after the first run (they say what a far-away watcher sees, or are real observations of light near black holes).
export function SeeingTheFallHeldBackLinks() {
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Check it against NASA, ESO and NuSTAR</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/educators/blackholes/imagine/page8.html">NASA Goddard, “The Anatomy of Black Holes”, page 8</Ext> (page last updated 7 May 2015): what a far-away watcher sees of a falling explorer’s clock, and whether they see the explorer cross the horizon.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/supermassive-black-holes/new-nasa-black-hole-visualization-takes-viewers-beyond-the-brink/">
            NASA, “New NASA Black Hole Visualization Takes Viewers Beyond the Brink”
          </Ext>{' '}
          (6 May 2024): what a camera falling toward a black hole would seem to do just short of the horizon.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/apod/frequently-asked-questions-faqs-on-black-holes/">NASA, “Frequently Asked Questions (FAQs) on Black Holes”</Ext> (a page last updated in 1995, so an old page): how a friend falling in would look to someone watching, and the light delay.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso1835/">ESO, “Most Detailed Observations of Material Orbiting close to a Black Hole”</Ext> (31 October 2018) and its paper,{' '}
          <Ext href="https://arxiv.org/abs/1810.12641">GRAVITY Collaboration, “Detection of orbital motions near the last stable circular orbit of the massive black hole SgrA*”</Ext> (arXiv, 30 October 2018): gas seen orbiting just outside the horizon of Sagittarius A*.
        </li>
        <li style={linkItem}>
          <Ext href="https://nustar.caltech.edu/news/129">NuSTAR, “NuSTAR and XMM-Newton See Light Echo from Behind a Black Hole”</Ext> (4 August 2021) and its paper,{' '}
          <Ext href="https://www.nature.com/articles/s41586-021-03667-0">“Light bending and X-ray echoes from behind a supermassive black hole”</Ext> (Nature, 28 July 2021): X-rays bent around a black hole that arrived with a delay.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>All links open in a new tab.</p>
    </div>
  )
}

// The entries of the shared "Words and formulas" panel. The formula for the stretch factor and the tenfold rule come only after the first run, because
// they give guesses 1 and 3 away (CLAUDE.md §12).
export function seeingTheFallWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const run = runPartOne()
  const radiusKm = Math.round(run.horizonRadiusKm)
  const entries = [
    { term: 'Observer', meaning: 'a person (or instrument) at rest, very far from the black hole, who receives the flashes and writes down the time on their own clock when each arrives.' },
    { term: 'Flash', meaning: 'a short burst of light that the traveler sends straight outward, away from the black hole, at equal steps of their own watch.' },
    { term: 'As sent', meaning: 'the gap between two flashes on the traveler’s watch, at the moments they were sent.' },
    { term: 'As received', meaning: 'the gap between the arrivals of two flashes on the observer’s clock.' },
    { term: 'Light travel time', meaning: 'how long light takes to get from one place to another. It is never zero. Sunlight takes about 8 minutes to reach us, so we see the Sun as it was 8 minutes ago.' },
    { term: 'Horizon, horizon radius', meaning: 'the one-way edge of a black hole, and its distance from the center (written r_s). From Black Holes 1.' },
    {
      term: 'Horizon light-time',
      meaning: `the time light takes to cross one horizon radius: r_s ÷ c. Worked for the 10-Sun black hole: its horizon radius is about ${radiusKm} km and light travels about 300,000 km each second, so ${radiusKm} ÷ 300,000 = ${fmt(run.lightTimeSeconds, 4)} seconds. It is the unit of time on the pictures.`,
    },
    {
      term: 'Stretch factor',
      meaning: 'the gap between two arriving flashes (as received) divided by the gap between them as sent. Flashes sent 5 seconds apart and received 5 seconds apart: 5 ÷ 5 = 1. Received 10 seconds apart: 10 ÷ 5 = 2.',
    },
  ]
  if (afterRun) {
    const d = workedDistance(PART_ONE_START_IN_HORIZON_RADII)
    const s = workedSteps(PART_ONE_START_IN_HORIZON_RADII)
    const per = arrivalIncreasesPerTenfoldGap(PART_ONE_START_IN_HORIZON_RADII)
    entries.push(
      {
        term: 'Formula: the stretch factor',
        meaning: `stretch factor = gravity part × motion part. The gravity part is 1 ÷ √(1 − 1/r), where r is the distance in horizon radii. The motion part is (E + √(1/r − 1/r₀)) ÷ √(1 − 1/r), where r₀ is the release distance and E = √(1 − 1/r₀). Worked for a release at r₀ = ${PART_ONE_START_IN_HORIZON_RADII}, at r = ${d}: gravity part = ${fmt(s.gravity, 3)}; motion part = ${fmt(s.motion, 3)}; ${fmt(s.gravity, 3)} × ${fmt(s.motion, 3)} = ${fmt(s.total, 3)}.`,
      },
      {
        term: 'Each tenfold closing of the gap',
        meaning: `each time the gap above the horizon shrinks to a tenth, the stretch factor is multiplied by 10 and the arrival is about ${fmt(2 * LN_10, 1)} light-times later (2 × ln 10 = ${fmt(2 * LN_10, 3)}; for this fall it comes to ${per.map((x) => fmt(x, 2)).join(' and ')}).`,
      },
    )
  } else {
    entries.push({
      term: 'More words',
      meaning: 'the formula for the stretch factor, and what happens each time the traveler gets ten times closer to the horizon, appear here after your first run. They are held back so that they do not give away your guesses.',
    })
  }
  return entries
}

// ---------------------------------------------------------------------------------------------------------------
// The notes under the three Part 1 questions. They give nothing away (CLAUDE.md §12): they say only where the guess will be drawn.
// ---------------------------------------------------------------------------------------------------------------
const notesBox = {
  margin: '0 0 0.75rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  borderLeft: '3px solid #f59e0b',
} as const

export function GuessNotes({ n }: { n: 1 | 2 | 3 }) {
  const body: Record<1 | 2 | 3, string> = {
    1: 'Your guess is drawn on the stretch graph (Picture 2) in white, once it is drawn.',
    2: 'Your guess is drawn on Picture 3 in white, at the horizon line, once it is drawn.',
    3: 'Your guess is drawn on Picture 2 in white, beside the curve you choose.',
  }
  return (
    <p style={notesBox} aria-label={`About question ${n}`}>
      {body[n]}
    </p>
  )
}
