import type { ReactNode } from 'react'
import { PART_ONE_PRESET_ID, PART_ONE_SPIN, energyReleasedFraction, horizonRadius, lastSafeOrbitRadius, runSpinningBlackHoleExperiment } from '../physics/spinningBlackHoleExperiment'
import { paragraph } from './TidalEffectExperiment'
import { AGAINST_COLOR, HORIZON_COLOR, WITH_COLOR } from './SpinningBlackHolePictures'

// Black Holes, Experiment 8 (audit update): the introduction, the links, the words box and the notes under the four questions
// (docs/audit/black-holes-and-strong-gravity/08-draft-wording.md, "all defaults" from the owner on 2026-11-18). The introduction keeps the owner's
// text and adds to it. It keeps clear of the answers to the four questions (CLAUDE.md §12): it does not say which way the last safe orbit moves for
// either direction, that the horizon shrinks, or which probe gives up more energy, and it does not name "frame dragging" (the specification's
// success criterion 7), which the tutor introduces. Nothing in the drawings is white: white is reserved for the learner's guess marks.

const BASE = import.meta.env.BASE_URL
const NASA_JET_IMAGE = `${BASE}images/black-holes/pia22085-nasa-black-hole-with-jet.jpg`
const HUBBLE_JET_IMAGE = `${BASE}images/black-holes/m87-jet-hubble-opo0020a.jpg`
const M87_IMAGE = `${BASE}images/black-holes/m87-eht-eso1907a.jpg`

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

const ol = { marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' } as const
const ul = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const

// A circle with an arrowhead at the top, pointing the way a thing goes round: counterclockwise (to the left at the top) or clockwise.
function RoundArrow({ cx, cy, r, color, counterclockwise, dash }: { cx: number; cy: number; r: number; color: string; counterclockwise: boolean; dash?: string }) {
  const d = counterclockwise ? -1 : 1
  const y = cy - r
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dash} />
      <polygon points={`${cx + d * 10},${y} ${cx - d * 3},${y - 6} ${cx - d * 3},${y + 6}`} fill={color} />
    </g>
  )
}

// Figure 2: the skater, seen from above. The same person with the arms out (a wide, slow turn) and with the arms pulled in (a narrow, fast turn).
function SkaterDrawing() {
  return (
    <svg
      viewBox="0 0 440 190"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="Two drawings of a skater seen from above. On the left the arms are stretched out wide and one slow turning arrow goes around. On the right the arms are pulled in close and two quick turning arrows go around."
    >
      <text x={110} y={22} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        arms out
      </text>
      <line x1={50} y1={100} x2={170} y2={100} stroke="#fb923c" strokeWidth={5} strokeLinecap="round" />
      <circle cx={110} cy={100} r={13} fill="#fb923c" />
      <RoundArrow cx={110} cy={100} r={68} color="#22d3ee" counterclockwise dash="5 5" />
      <text x={110} y={178} fill="#22d3ee" fontSize="11" textAnchor="middle">
        turns slowly
      </text>
      <text x={330} y={22} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        arms pulled in
      </text>
      <line x1={310} y1={100} x2={350} y2={100} stroke="#fb923c" strokeWidth={5} strokeLinecap="round" />
      <circle cx={330} cy={100} r={13} fill="#fb923c" />
      <RoundArrow cx={330} cy={100} r={34} color="#22d3ee" counterclockwise />
      <RoundArrow cx={330} cy={100} r={58} color="#22d3ee" counterclockwise />
      <text x={330} y={178} fill="#22d3ee" fontSize="11" textAnchor="middle">
        turns fast
      </text>
    </svg>
  )
}

// Figure 3: two ways round, seen from above. Both rings have the same size, so the drawing hints at no answer.
function TwoWaysDrawing() {
  const panel = (cx: number, color: string, ccw: boolean, title: string, line2: string) => (
    <g>
      <circle cx={cx} cy={100} r={25} fill="#000000" stroke={HORIZON_COLOR} strokeWidth={2} />
      <text x={cx} y={103} fill={HORIZON_COLOR} fontSize="8" textAnchor="middle">
        black hole
      </text>
      <RoundArrow cx={cx} cy={100} r={40} color={HORIZON_COLOR} counterclockwise />
      <circle cx={cx} cy={100} r={64} fill="none" stroke={color} strokeWidth={2.5} />
      <polygon points={ccw ? `${cx - 10},${36} ${cx + 3},${30} ${cx + 3},${42}` : `${cx + 10},${36} ${cx - 3},${30} ${cx - 3},${42}`} fill={color} />
      <circle cx={cx + (ccw ? -45 : 45)} cy={55} r={6} fill={color} />
      <text x={cx} y={185} fill={color} fontSize="11" fontWeight="bold" textAnchor="middle">
        {title}
      </text>
      <text x={cx} y={199} fill={color} fontSize="11" textAnchor="middle">
        {line2}
      </text>
    </g>
  )
  return (
    <svg
      viewBox="0 0 440 215"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="Two drawings seen from above, with a small black hole in the middle of each and a violet arrow showing which way it turns. On the left a green probe circles the same way. On the right a rose probe circles the opposite way. Both circles are the same size."
    >
      <text x={110} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        the same way
      </text>
      <text x={330} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        the opposite way
      </text>
      {panel(110, WITH_COLOR, true, 'a probe circling', 'with the spin')}
      {panel(330, AGAINST_COLOR, false, 'a probe circling', 'against the spin')}
    </svg>
  )
}

export function SpinningBlackHoleIntro() {
  const referenceKm = runSpinningBlackHoleExperiment(PART_ONE_PRESET_ID, PART_ONE_SPIN).referenceRadiusKm
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> In Black Holes 3 you found that a black hole has a last safe circular orbit: the closest circle a small probe can follow without a tiny nudge sending it spiraling in. For a black hole that does not spin, it was at 3 horizon radii from the center. But real black holes usually spin. Does
        the spin change where the last safe orbit is?
      </p>
      <p style={paragraph}>
        <strong>Why even ask this.</strong> Imagine you are planning to park a spacecraft in orbit around a real black hole. You studied one that does not spin, and you know the closest safe distance for it. But the black hole you would actually meet is probably turning. Would the same distance still be safe? And with a
        turning black hole there is a new thing to decide: a spacecraft can circle the same way the black hole turns, or the opposite way. Does that choice matter?
      </p>

      <Figure
        caption={
          <>
            <strong>Figure 1. A spinning black hole, as an artist imagines it.</strong> A flat disk of hot gas circles the black hole, and a thin jet of hot gas shoots out along its axis. Nobody has photographed anything this close: this is a picture made to help you imagine it. The gas in the disk circles the black hole, and the
            black hole itself can turn too. <span style={{ fontSize: '0.75rem' }}>Image: NASA/JPL-Caltech (artist’s concept PIA22085).</span>
          </>
        }
      >
        <img
          src={NASA_JET_IMAGE}
          alt="An artist’s picture of a black hole at the left with a bright disk of gas circling it and a thin purple jet streaming away toward the upper right, against a field of stars."
          width={1600}
          height={900}
          style={{ ...imgStyle, maxWidth: 'min(100%, 640px)' }}
        />
      </Figure>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What a spinning black hole is.</strong> Four short ideas.
      </p>
      <ol style={ol}>
        <li>
          <strong>Where the spin comes from.</strong> Almost everything in space turns: planets, stars and galaxies. Our Sun turns about once a month. When a big star runs out of fuel, its core can collapse into a black hole, and the core shrinks enormously as it does. A shrinking thing that is turning turns faster. You
          can see the same thing on ice: a skater who spins with their arms stretched out turns faster when they pull their arms in (Figure 2). A black hole can also be spun faster by swallowing gas that circles around it before it falls in. So a black hole formed this way keeps its turning, and most are thought to spin.
        </li>
        <li>
          <strong>You cannot see it turn.</strong> A planet has a surface, so you can watch a mountain go around. A black hole has no surface to watch. Its spin is part of the black hole itself, and it shows up in the gravity around it: a black hole that spins does not shape the gravity around it in exactly the same way as a
          black hole of the same mass that does not spin. This experiment asks whether that difference changes where orbits are safe. What astronomers can see is the light and the gas around it. Gas that circles a black hole forms a disk like the one in Figure 1, and the way it glows tells them about the spin. You will meet real
          examples after your first run.
        </li>
        <li>
          <strong>The spin number.</strong> We describe how much a black hole spins with one number, from 0 up to just under 1. Think of a dial with the top mark labelled 1. For a black hole of a given mass, Einstein’s theory sets a limit on how much spin it can have, and that limit is the top mark of the dial. The spin number says how far up the dial the black hole is:
          <ul style={{ margin: '0.4rem 0', paddingLeft: '1.25rem' }}>
            <li>
              <strong>0</strong> is not spinning at all. The black holes of Black Holes 1 to 7 did not spin.
            </li>
            <li>
              <strong>0.5</strong> is halfway up the dial: half of the most spin it could have.
            </li>
            <li>
              <strong>0.9</strong> is nine-tenths of the way up: a fast spinner.
            </li>
            <li>
              <strong>0.99</strong> is ninety-nine hundredths of the way up, very close to the limit. It is the largest spin you can choose on this page.
            </li>
            <li>
              <strong>1</strong> is the top mark, the limit itself. No black hole quite reaches it, and the equations on this page work only for spins below 1, which is why you cannot choose it.
            </li>
          </ul>
          The dial is only a comparison: the spin number is not a speed in kilometers per hour. The limit is different for black holes of different masses, so the spin number is a fraction of each black hole’s own limit. That is what lets us compare black holes of any mass. In books and papers astronomers write the spin as a* (said “a-star”). On this page we just call it “the spin”.
        </li>
        <li>
          <strong>Only the spin changes.</strong> We compare the same black hole, with the same mass, at different spins. That way, anything that changes in the pictures is caused by the spin and by nothing else.
        </li>
      </ol>
      <Figure
        caption={
          <>
            <strong>Figure 2. The skater.</strong> A drawing made for this page, seen from above. The same skater turns slowly with the arms out and fast with the arms pulled in. A star’s core does the same when it shrinks into a black hole.
          </>
        }
      >
        <SkaterDrawing />
      </Figure>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Two ways to circle.</strong> Because the black hole turns, a probe that circles it has two choices: the same way the black hole turns, or the opposite way. We call them <strong>with the spin</strong> and <strong>against the spin</strong>. Everywhere on this page, green means with the spin and rose means against the spin (Figure 3).
      </p>
      <Figure
        caption={
          <>
            <strong>Figure 3. Two ways round.</strong> A drawing made for this page, seen from above and not to scale. The violet arrow shows which way the black hole turns. On the left a green probe circles the same way (with the spin). On the right a rose probe circles the opposite way (against the spin). The two circles are
            drawn the same size on purpose: the drawing says nothing about where a safe orbit is.
          </>
        }
      >
        <TwoWaysDrawing />
      </Figure>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What happens.</strong> Here is the whole experiment, step by step.
      </p>
      <ol style={ol}>
        <li>In Part 1 you make four predictions. The black hole is the one of 10 Suns from Black Holes 1, and the spin is 0.9.</li>
        <li>
          You press Run. The black hole is “spun up” from not spinning to a spin of {PART_ONE_SPIN}, over 10 seconds. This is only how the experiment is shown: the results are the same however fast or slow it plays.
        </li>
        <li>
          A <strong>map</strong>, seen from above, shows the black hole’s horizon and the last safe orbit for a probe circling the same way as the spin, and for a probe circling the opposite way. It also shows Black Holes 3’s distance for no spin, so you can compare.
        </li>
        <li>
          A <strong>graph</strong> shows how those distances change as the spin grows.
        </li>
        <li>A third picture shows how much of its energy a probe gives up on the way down to its last safe orbit, in each direction.</li>
        <li>In Part 2 you choose another black hole and another spin, run it, and compare.</li>
        <li>The experiment is about a small probe circling in a flat sheet, and it does not show anything inside the horizon.</li>
      </ol>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Some words we will use.</strong> They are also in the “Words and formulas” box below.
      </p>
      <ul style={ul}>
        <li>
          The <strong>spin</strong> is the number described above. A probe can circle <strong>with the spin</strong> or <strong>against the spin</strong>. The probe circles in the flat sheet that cuts through the black hole halfway between its two poles (the two ends of the line it turns around), just as the Earth’s equator does for the Earth.
        </li>
        <li>
          Three words come from earlier experiments: the <strong>horizon</strong>, the one-way boundary of a black hole; the <strong>horizon radius</strong>, the distance from the black hole’s center to its horizon; and the <strong>last safe orbit</strong>, described above. Astronomers call it the <strong>innermost stable circular orbit</strong>, or <strong>ISCO</strong>.
        </li>
        <li>
          A spinning black hole’s horizon is not always the same size as one that does not spin, so we need one fixed unit. We call it the <strong>reference radius</strong>: the horizon radius that the same black hole would have if it did not spin. It is {referenceKm.toFixed(1)} km for the 10-Sun black hole, and the numbers on the map are all in reference radii, measured from the center. For the two much larger black holes the distances in kilometers become huge, so we also give them in{' '}
          <strong>AU</strong>, short for astronomical unit: the average distance from the Earth to the Sun, about 150 million km.
        </li>
        <li>
          Every object has energy stored in its mass, just because it has mass (it is called its <strong>rest-mass energy</strong>). Think of a ball at the top of a hill: when it rolls down, it gives up some of its stored energy on the way. In the third picture, a probe slowly spiraling down gives up some of its rest-mass energy, and we show the share it gives up as a percentage. Where that energy goes is not part of this experiment.
        </li>
      </ul>

      <p style={paragraph}>
        <strong>What this builds on.</strong> Black Holes 3 found the last safe orbit at 3 horizon radii for a black hole that does not spin, and its map is the dashed ring here. Black Holes 1 gave the horizon radius and the three black holes.
      </p>
      <p style={paragraph}>
        <strong>About your predictions.</strong> In Part 1 you make four guesses before you run anything. Your guesses never change the real pictures or tables. After you press Run they are drawn on the pictures in white, in a box labelled YOUR GUESS, and shown again beside the results. In Part 2, the black hole and the spin you
        choose do change the drawings and the tables, and your guesses do not.
      </p>
      <p style={paragraph}>
        <strong>Your job.</strong> First, make four predictions. Then press Run. After that, choose other black holes and spins in Part 2, and compare.
      </p>
      <p style={paragraph}>
        <strong>What to look for.</strong> Where the two colored rings are compared with the dashed ring, what happens to the black disk, and how the two energy bars compare with the dashed line.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>This is a thought experiment about a small probe</strong> circling in the flat sheet through the black hole’s equator. The probe’s own gravity does not matter.
        </li>
        <li>
          <strong>The equations are given, not derived.</strong> They are the standard ones for a spinning black hole with no electric charge.
        </li>
        <li>
          <strong>The spin stays below 1,</strong> because the equations describe spins up to, but not including, 1.
        </li>
        <li>
          <strong>The last safe orbit means the same as in Black Holes 3.</strong> The experiment places it using the given equations. It does not follow a probe’s path to show it.
        </li>
        <li>
          <strong>Spin does not change the black hole’s mass</strong> here. The same black hole is compared at different spins, which is why distances are in reference radii.
        </li>
        <li>
          <strong>The energy a probe gives up</strong> is for one that slowly spirals down through safe circular orbits from far away. Where that energy goes is not modeled.
        </li>
        <li>
          <strong>The experiment stops at the horizon.</strong> Nothing inside it is modeled.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        <strong>As of November 2026.</strong> This page uses the standard equations for a spinning black hole with no electric charge. Real black holes are measured and their spins are published; some of the newest results are listed under “Want to know more?” and shown after your first run.
      </p>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function SpinningBlackHoleLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/anatomy/">NASA Science, “Black Hole Anatomy”</Ext> (12 August 2026): the parts of a black hole, including the disk of gas that circles it and the jets.
        </li>
        <li style={linkItem}>
          <Ext href="https://nustar.caltech.edu/news/nustar130227">NuSTAR at Caltech, “NASA’s NuSTAR Helps Solve Riddle of Black Hole Spin”</Ext> (27 February 2013): how astronomers read a black hole’s spin from the X-ray light of its disk.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.mpifr-bonn.mpg.de/pressreleases/2025/6">Max Planck Institute for Radio Astronomy, “New EHT Images Reveal Unexpected Polarization Flips at M87*”</Ext> (16 September 2025): the newest results of the telescope that pictured a black hole’s shadow.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/images/eso1907a/">ESO, “First image of a black hole”</Ext> (10 April 2019): the Event Horizon Telescope’s picture of the black hole in the galaxy M87.
        </li>
        <li style={linkItem}>
          <Ext href="https://esahubble.org/images/opo0020a/">ESA/Hubble, “A cosmic searchlight”</Ext> (6 July 2000): Hubble’s picture of the jet that M87’s black hole shoots out.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Papers and original sources</p>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2011.08948">Reynolds, “Observational Constraints on Black Hole Spin”</Ext> (Annual Review of Astronomy and Astrophysics, 2021): a review by an astronomer of how spins are measured and why spin matters.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2102.09093">Zhao et al., “Re-estimating the Spin Parameter of the Black Hole in Cygnus X-1”</Ext> (The Astrophysical Journal, 2021): a measurement of one of the fastest spins found in our galaxy.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/1302.7002">Risaliti et al., “A rapidly spinning supermassive black hole at the centre of NGC 1365”</Ext> (Nature, 2013): the paper behind NASA’s NuSTAR release above.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2507.08219">LIGO–Virgo–KAGRA Collaborations, “GW231123”</Ext> (arXiv, July 2025): the paper behind the heaviest black hole merger seen so far; both black holes spin fast.
        </li>
        <li style={linkItem}>
          Where the equations on this page come from: Bardeen, Press and Teukolsky, <em>The Astrophysical Journal</em> 178, 347 (1972) (<Ext href="https://doi.org/10.1086/151796">DOI</Ext>), and Kerr, <em>Physical Review Letters</em> 11, 237 (1963) (<Ext href="https://doi.org/10.1103/PhysRevLett.11.237">DOI</Ext>). These two were not read for this page; they are given as the origin of the equations.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        All links open in a new tab. After your first run, Part 3 adds more pages. They are held back so they do not give away your guesses. No plain official page was found for how a spinning black hole can power jets, or for how much energy a falling piece of matter gives up; they are explained here in plain words instead.
      </p>
    </div>
  )
}

// The pages added after the first run (they name the effect that the tutor explains, or are real observations of spinning black holes).
export function SpinningBlackHoleHeldBackLinks() {
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>More to read, after your run</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.nasa.gov/universe/nasa-simulation-suggests-black-holes-may-make-ideal-dark-matter-labs/">NASA, “NASA Simulation Suggests Black Holes May Make Ideal Dark Matter Labs”</Ext> (23 June 2015): a plain account of the region around a spinning black hole where everything is forced to go around the same way, and how energy can be taken from it.
        </li>
        <li style={linkItem}>
          <Ext href="https://einstein.stanford.edu/MISSION/mission1.html">Gravity Probe B (NASA and Stanford), mission overview</Ext>: the honey-and-molasses picture of space being dragged around by something that turns.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>All links open in a new tab.</p>
    </div>
  )
}

const figureCredit = { fontSize: '0.75rem' } as const

// Real spinning black holes: published measurements and pictures, outside this page's model. Shown in Part 3, after the first run, so that nothing
// here gives a guess away. Every figure is from a page that was read (see the draft wording's source table).
export function RealSpinningBlackHoles() {
  return (
    <div style={{ margin: '1.25rem 0', padding: '0.75rem 1rem', fontSize: '0.875rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Real spinning black holes (outside this page’s model)</h4>
      <p style={{ marginTop: 0 }}>
        Everything above was calculated here, for a small probe in a thought experiment. Astronomers also study real black holes. Here are some published results. They are not outputs of this page: the numbers in the tables are calculated here, and these are measured by others, with their own uncertainties.
      </p>
      <Figure
        caption={
          <>
            <strong>The jet of M87’s black hole.</strong> The blue streak is a jet of electrons and other tiny particles traveling at nearly the speed of light, shot out by the black hole at the center of the galaxy M87. <span style={figureCredit}>Image: The Hubble Heritage Team (STScI/AURA) and NASA/ESA, via ESA/Hubble (CC BY 4.0).</span>
          </>
        }
      >
        <img
          src={HUBBLE_JET_IMAGE}
          alt="A bright yellow-orange glow at the upper left, which is the center of a galaxy, with a long thin blue jet streaming from it toward the lower right."
          width={1280}
          height={1337}
          style={{ ...imgStyle, maxWidth: 'min(100%, 380px)' }}
        />
      </Figure>
      <Figure
        caption={
          <>
            <strong>The shadow of the same black hole.</strong> The Event Horizon Telescope’s picture: a ring of glowing gas around a dark patch. M87 is about 55 million light-years away, and its black hole is more than six billion times the mass of the Sun, according to the Event Horizon Telescope team (September 2025). The
            pages used here give no measured spin for this black hole. <span style={figureCredit}>Image: EHT Collaboration (CC BY 4.0), via ESO.</span>
          </>
        }
      >
        <img
          src={M87_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas, brighter at the bottom, around a dark patch in the middle, on a black background."
          width={1280}
          height={746}
          style={{ ...imgStyle, maxWidth: 'min(100%, 460px)' }}
        />
      </Figure>
      <p style={{ marginBottom: '0.25rem' }}>
        <strong>Three measured spins, each from its own paper:</strong>
      </p>
      <ul style={ul}>
        <li>
          <strong>Cygnus X-1</strong>, a black hole in our own galaxy that pulls gas from a blue star beside it. One 2021 analysis of its X-rays finds a spin above 0.9985 (with a confidence of three sigma), when a certain effect of the gas on the spin is left out, as the paper says. <em>How sure:</em> it is a lower limit from one analysis with stated assumptions, not a single exact number.
        </li>
        <li>
          <strong>NGC 1365</strong>, a galaxy with a black hole at its center. NASA’s NuSTAR release says the black hole is “spinning almost as fast as Einstein’s theory of gravity will allow”, and the paper finds that the X-ray light reflected from its disk comes from within 2.5 gravitational radii of the black hole. <em>How sure:</em> the NASA page gives no number; the number is in the paper.
        </li>
        <li>
          <strong>GW231123</strong>, two black holes that merged, seen in gravitational waves in 2023 and reported in 2025. The paper gives masses of about 137 and 103 Suns and spins of 0.90 (plus 0.10, minus 0.19) and 0.80 (plus 0.20, minus 0.51), where the ranges are the paper’s 90% ranges. <em>How sure:</em> the spin ranges are wide, so the paper says only that both spin fast.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        Astronomers think a black hole’s spin can power its jets. Reynolds’s review says that spin “can be a potent energy source for powering relativistic jets and energetic particle acceleration”. No plain official page was found that explains how, so it is not explained here.
      </p>
    </div>
  )
}

// The entries of the shared "Words and formulas" panel. The formulas (with their worked numbers), "frame dragging" and the other words that name an
// answer come only after the first run, because they give guesses away (CLAUDE.md §12).
export function spinningBlackHoleWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Spin', meaning: 'a number from 0 to just under 1 that says how far up a dial a black hole is, where the top mark (1) is the most spin a black hole of that mass can have. 0 is not spinning, 0.5 is halfway up, 0.9 is nine-tenths of the way up, and 0.99 is very close to the limit. It is not a speed in kilometers per hour. Astronomers write it a* (said “a-star”).' },
    { term: 'With the spin; against the spin', meaning: 'a probe circling the same way the black hole turns is circling with the spin; one circling the opposite way is circling against the spin. Green and rose on this page.' },
    { term: 'Horizon; horizon radius', meaning: 'the one-way boundary of a black hole, and the distance from its center to that boundary. From Black Holes 1.' },
    { term: 'Reference radius', meaning: 'the horizon radius the same black hole would have if it did not spin. It is the unit for every distance on this page, so the same black hole can be compared at different spins. For the 10-Sun black hole it is about 29.5 km.' },
    { term: 'Last safe orbit; ISCO', meaning: 'the closest circle a small probe can follow without a tiny nudge sending it spiraling in. From Black Holes 3. Astronomers call it the innermost stable circular orbit, or ISCO.' },
    { term: 'Rest-mass energy', meaning: 'the energy an object has stored in its mass just because it has mass.' },
    { term: 'Equator', meaning: 'the flat sheet that cuts through the black hole halfway between its two poles (the ends of the line it turns around), like the Earth’s equator.' },
    { term: 'Probe', meaning: 'a small object that circles the black hole. Its own gravity is ignored.' },
    { term: 'AU (astronomical unit)', meaning: 'the average distance from the Earth to the Sun, about 150 million km.' },
  ]
  if (afterRun) {
    const w = (s: number, d: 'with' | 'against') => lastSafeOrbitRadius(s, d)
    const released = (s: number, d: 'with' | 'against') => energyReleasedFraction(s, d)
    entries.push(
      { term: 'Frame dragging', meaning: 'a spinning black hole drags the space around it along with it, a little like a spoon turning in honey. Gravity Probe B’s page says: “as a celestial body spins on its axis, it drags local spacetime around with it, much like a spinning ball in bowl of molasses would drag around some of the molasses as it spins.”' },
      { term: 'Ergosphere', meaning: 'NASA’s page describes it as a flattened region around a spinning black hole where the black hole’s rotation drags space-time along with it, so that all matter there is forced to move the same way. NASA says: “The faster the black hole spins, the larger its ergosphere becomes.” It is not part of this experiment’s model.' },
      { term: 'Prograde; retrograde', meaning: 'astronomers’ words for circling with the spin and against the spin.' },
      { term: 'Accretion disk; jet', meaning: 'the flat disk of hot gas that circles a black hole, and the thin beam of hot gas that can shoot out along its axis (NASA’s Black Hole Anatomy page). Both are in Figure 1.' },
      {
        term: 'Formula: the horizon',
        meaning: `horizon = (1 + √(1 − a²)) ÷ 2 reference radii, where a is the spin. Worked for a = ${PART_ONE_SPIN}: a² = ${(PART_ONE_SPIN ** 2).toFixed(2)}; 1 − a² = ${(1 - PART_ONE_SPIN ** 2).toFixed(2)}; √ = ${Math.sqrt(1 - PART_ONE_SPIN ** 2).toFixed(4)}; (1 + ${Math.sqrt(1 - PART_ONE_SPIN ** 2).toFixed(4)}) ÷ 2 = ${horizonRadius(PART_ONE_SPIN).toFixed(3)}. Given, not derived.`,
      },
      {
        term: 'Formula: the last safe orbit',
        meaning: `the given three-step formula (see the Results) in units of M, where the no-spin horizon is 2M. Worked values at a = ${PART_ONE_SPIN}: ${(w(PART_ONE_SPIN, 'with') * 2).toFixed(3)} M with the spin and ${(w(PART_ONE_SPIN, 'against') * 2).toFixed(3)} M against it, which is ${w(PART_ONE_SPIN, 'with').toFixed(2)} and ${w(PART_ONE_SPIN, 'against').toFixed(2)} reference radii. With no spin it is 6 M, or 3 reference radii. Given, not derived.`,
      },
      {
        term: 'Formula: the energy given up',
        meaning: `at the last safe orbit r (in M), the share given up is 1 − √(1 − 2 ÷ (3 r)). Worked with no spin (r = 6): 1 − √(1 − 2 ÷ 18) = 1 − √0.8889 = 1 − 0.9428 = ${(released(0, 'with') * 100).toFixed(1)}%. At a = ${PART_ONE_SPIN} it is ${(released(PART_ONE_SPIN, 'with') * 100).toFixed(1)}% with the spin and ${(released(PART_ONE_SPIN, 'against') * 100).toFixed(1)}% against it. Given, not derived; the Results check it a second way.`,
      },
    )
  } else {
    entries.push({
      term: 'More words and the formulas',
      meaning: 'a few more words, and the formulas with their worked numbers, appear here after your first run. They are held back so that they do not give away your guesses.',
    })
  }
  return entries
}

// ---------------------------------------------------------------------------------------------------------------
// The notes under the four Part 1 questions. They give nothing away (CLAUDE.md §12): they say only where the guess will be drawn.
// ---------------------------------------------------------------------------------------------------------------
const notesBox = {
  margin: '0 0 0.75rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  borderLeft: '3px solid #f59e0b',
} as const

export function GuessNotes({ n }: { n: 1 | 2 | 3 | 4 }) {
  const body: Record<1 | 2 | 3 | 4, string> = {
    1: 'Your guess is drawn on the map (Picture 1) and the graph (Picture 2) in white, once the run has finished.',
    2: 'Your guess is drawn on the map (Picture 1) and the graph (Picture 2) in white, once the run has finished.',
    3: 'Your guess is drawn on the map (Picture 1) and the graph (Picture 2) in white, once the run has finished.',
    4: 'Your guess is drawn on the energy picture (Picture 3) in white, once the run has finished.',
  }
  return (
    <p style={notesBox} aria-label={`About question ${n}`}>
      {body[n]}
    </p>
  )
}
