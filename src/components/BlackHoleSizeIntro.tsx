import type { ReactNode } from 'react'
import { horizonRadiusKm } from '../physics/blackHoleSizeExperiment'
import { M87_IMAGE, SGRA_IMAGE } from './BlackHoleIntro'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { paragraph } from './TidalEffectExperiment'

// Black Holes, Experiment 1 (audit update): the illustrated introduction, the recent news, the "Want to know more?" list and the
// "Words and formulas" box (docs/audit/black-holes-and-strong-gravity/01-draft-wording.md, approved by the owner on 2026-11-16).
// It gives no answer to the two guesses (CLAUDE.md §12): no size of the Sun's or the Earth's horizon appears here.
// Four real pictures (ESO and ESA/Hubble, CC BY 4.0) and two drawn here, besides the EHT pictures already in the project.

const BASE = import.meta.env.BASE_URL
const GAIA_IMAGE = `${BASE}images/black-holes/gaia-bh3-eso2408a.jpg`
const S2_IMAGE = `${BASE}images/black-holes/s2-orbit-eso0226c.jpg`
const M77_IMAGE = `${BASE}images/black-holes/m77-webb-sci26004b.jpg`
const CRAB_IMAGE = `${BASE}images/black-holes/crab-hubble-heic0515a.jpg`

const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#000',
} as const

function Figure({ children, caption, credit }: { children: ReactNode; caption: ReactNode; credit: ReactNode }) {
  return (
    <figure style={{ margin: '1rem 0', padding: 0 }}>
      {children}
      <figcaption style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
        {caption} <span style={{ fontSize: '0.75rem' }}>{credit}</span>
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

const AMBER = '#f59e0b'
const HORIZON = '#fb7185'
const SKY = '#60a5fa'

// Drawing 1: the same pull at the same distance (an illustration, not to scale).
function SamePullDrawing() {
  return (
    <svg
      viewBox="0 0 720 268"
      width="100%"
      style={{ ...svgStyle, maxWidth: '720px' }}
      role="img"
      aria-label="Two panels. Left: the Earth circles the Sun. Right: the Earth circles a small black dot with the same mass as the Sun, on the same orbit, with the same pull. Illustration, not to scale."
    >
      <text x={14} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing 1: the same pull, far away (illustration, not to scale)
      </text>
      {[0, 1].map((i) => {
        const cx = 180 + i * 360
        return (
          <g key={i}>
            <text x={cx} y={52} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
              {i === 0 ? 'The Sun' : 'A black hole with the Sun’s mass'}
            </text>
            <circle cx={cx} cy={135} r={98} fill="none" stroke={MUTED_COLOR} strokeDasharray="4 4" />
            {i === 0 ? (
              <circle cx={cx} cy={135} r={26} fill={AMBER} />
            ) : (
              <>
                <circle cx={cx} cy={135} r={5} fill="#000" stroke="#e2e8f0" />
                <circle cx={cx} cy={135} r={9} fill="none" stroke={HORIZON} strokeDasharray="3 2" />
              </>
            )}
            <circle cx={cx + 98} cy={135} r={8} fill={SKY} />
            <text x={cx + 98} y={158} fill={SKY} fontSize="11" textAnchor="middle">
              Earth
            </text>
            <text x={cx} y={258} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
              {i === 0 ? 'Earth’s orbit today' : 'Earth’s orbit, unchanged: the same pull at this distance'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Drawing 2: the life of a massive star, from the NASA account in the introduction.
function LifeStagesDrawing() {
  const box = (x: number, y: number, w: number, h: number, color: string, lines: string[]) => (
    <g key={lines[0]}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill="none" stroke={color} strokeWidth={2} />
      {lines.map((line, i) => (
        <text key={line} x={x + w / 2} y={y + 24 + i * 16} fill={color} fontSize="12" textAnchor="middle">
          {line}
        </text>
      ))}
    </g>
  )
  return (
    <svg
      viewBox="0 0 720 260"
      width="100%"
      style={{ ...svgStyle, maxWidth: '720px' }}
      role="img"
      aria-label="Four boxes joined by arrows: a massive star, then its core collapses and it explodes as a supernova, then what is left depends on the core: a neutron star for a core of about 1 to 3 Suns, or a black hole for a heavier core. Illustration."
    >
      <defs>
        <marker id="bh1-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={MUTED_COLOR} />
        </marker>
      </defs>
      <text x={14} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing 2: how a massive star can end (illustration)
      </text>
      {box(14, 50, 150, 70, AMBER, ['A massive star', '(more than about', '8 Suns)'])}
      {box(210, 50, 150, 70, '#fb923c', ['Out of fuel:', 'the core collapses;', 'a supernova'])}
      <line x1={164} y1={85} x2={206} y2={85} stroke={MUTED_COLOR} strokeWidth={2} markerEnd="url(#bh1-arrow)" />
      {box(430, 14, 270, 60, SKY, ['A core of about 1 to 3 Suns:', 'a neutron star'])}
      {box(430, 130, 270, 70, '#e879f9', ['A heavier core: nothing', 'we know stops the collapse:', 'a black hole'])}
      <line x1={360} y1={75} x2={426} y2={46} stroke={MUTED_COLOR} strokeWidth={2} markerEnd="url(#bh1-arrow)" />
      <line x1={360} y1={95} x2={426} y2={160} stroke={MUTED_COLOR} strokeWidth={2} markerEnd="url(#bh1-arrow)" />
      <text x={14} y={240} fill={MUTED_COLOR} fontSize="11">
        What is left depends on how much mass the core has. The outer layers are blown off into space.
      </text>
    </svg>
  )
}

// Drawing 3: the horizon as a one-way boundary.
function HorizonDrawing() {
  return (
    <svg
      viewBox="0 0 720 250"
      width="100%"
      style={{ ...svgStyle, maxWidth: '720px' }}
      role="img"
      aria-label="A black disc with a red dashed circle around it, the event horizon. A light ray outside heads away and escapes. A light ray just inside the circle still heads outward but is pulled back in. Illustration, not to scale."
    >
      <text x={14} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing 3: the horizon is a one-way edge (illustration, not to scale)
      </text>
      <circle cx={200} cy={135} r={62} fill="none" stroke={HORIZON} strokeWidth={2} strokeDasharray="6 4" />
      <circle cx={200} cy={135} r={6} fill="#000" stroke="#e2e8f0" />
      <text x={200} y={222} fill={HORIZON} fontSize="12" textAnchor="middle">
        The event horizon (the red dashed circle)
      </text>
      <line x1={282} y1={135} x2={400} y2={135} stroke="#facc15" strokeWidth={3} />
      <path d="M400,135 l-9,-5 v10 z" fill="#facc15" />
      <text x={410} y={112} fill="#facc15" fontSize="12">
        A light ray just outside the
      </text>
      <text x={410} y={128} fill="#facc15" fontSize="12">
        horizon heads outward and escapes.
      </text>
      <path d="M232,98 C250,88 262,100 250,118 C240,132 222,126 210,112" fill="none" stroke="#c4b5fd" strokeWidth={3} />
      <path d="M210,112 l8,-6 l-2,10 z" fill="#c4b5fd" />
      <text x={410} y={172} fill="#c4b5fd" fontSize="12">
        A light ray just inside points
      </text>
      <text x={410} y={188} fill="#c4b5fd" fontSize="12">
        outward, but is pulled back in.
      </text>
      <text x={410} y={214} fill={MUTED_COLOR} fontSize="11">
        Nothing, not even light, can
      </text>
      <text x={410} y={228} fill={MUTED_COLOR} fontSize="11">
        cross the horizon outward.
      </text>
    </svg>
  )
}

export function BlackHoleSizeIntro() {
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> In Gravity and Curved Spacetime, Experiment 7, you saw that when a mass is
        packed tightly enough, even light cannot escape it, and that is a black hole. That experiment used
        made-up amounts. Here we use real objects and real numbers, and ask: how small would a real object, such
        as the Earth or the Sun, have to be squeezed to become a black hole?
      </p>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>What is a black hole?</h4>
      <p style={paragraph}>
        A black hole is a region of space where gravity is so strong that nothing that gets close enough can ever
        leave it, not even light. Its edge is called the <strong>event horizon</strong>, or just the{' '}
        <strong>horizon</strong>. NASA describes it as a boundary that contains all the matter that makes up the
        black hole, not a surface like the Earth’s. The horizon is not a wall. It is a one-way boundary: anything
        can cross it going in, and nothing, not even light, comes back out. Because no light comes out, we cannot
        see a black hole itself. We see what it does to things nearby.
      </p>
      <Figure
        caption={
          <>
            <strong>A real observation, not a drawing.</strong> The first picture of a black hole’s shadow (April
            2019), the black hole called M87*. The bright ring is hot gas just outside the horizon. The dark middle
            is the black hole’s shadow.
          </>
        }
        credit="Image: EHT Collaboration (CC BY 4.0), via ESO."
      >
        <img
          src={M87_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas, brighter at the bottom, around a dark patch in the middle, on a black background."
          width={1280}
          height={746}
          style={imgStyle}
        />
      </Figure>
      <HorizonDrawing />

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>A black hole is not a vacuum cleaner</h4>
      <p style={paragraph}>
        Far away, a black hole pulls exactly like any other object with the same mass. If the Sun were replaced
        by a black hole with the Sun’s mass, the Earth would keep orbiting just as it does now. A black hole is
        special only very close to it, and this experiment is about how close “very close” is.
      </p>
      <p style={paragraph}>
        <strong>But wouldn’t a black hole pull harder?</strong> Not at that distance. The pull of gravity depends on two
        things only: how much mass there is, and how far you are from its <strong>centre</strong>. It does not depend on
        how tightly the mass is packed. Earth is about 150 million kilometers from the centre of the Sun. Put a black
        hole with the Sun’s mass in the Sun’s place and Earth is still 150 million kilometers from the centre. Same mass
        and same distance mean the same pull, so Earth’s orbit would not change.
      </p>
      <p style={paragraph}>
        <strong>Where the difference is.</strong> A black hole is far, far smaller than the Sun. The Sun is almost
        700,000 kilometers in radius, so you can never get closer to its centre than that. A black hole has no such
        limit: you can fly right up to it. Close in, the distance to the centre is tiny, and that is where the pull
        becomes enormous. The extra strength comes from being able to get closer, not from having more mass.
      </p>
      <p style={paragraph}>
        <strong>A comparison from daily life.</strong> A bowling ball and a beach ball full of sand can have the same
        mass. From 10 meters away they pull on you equally. Touch the surface of each and you are much nearer the bowling
        ball’s centre, so there the pull is much stronger. Squeezing a mass smaller does not change its pull from far
        away. It only lets you stand closer to its centre. This is an analogy for the idea, not the same calculation.
      </p>
      <p style={paragraph}>
        <strong>One thing would change for us:</strong> the black hole gives off no light, so the Earth would go dark and
        cold.
      </p>
      <SamePullDrawing />

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>How stars become black holes</h4>
      <p style={paragraph}>
        A star keeps its size because two things balance. Gravity pulls everything inward. The heat and pressure from the
        nuclear reactions in the core push outward, like the air inside a balloon. When a star with more than about eight
        times the Sun’s mass runs out of fuel, NASA says, its core collapses and the star explodes as a supernova. The
        outer layers are blown into space. What happens to the core depends only on how much mass the core has. (The
        “eight” is a round figure, not a sharp dividing line.)
      </p>
      <p style={paragraph}>
        <strong>Why a squeezed core can stop shrinking.</strong> Once the fuel is gone, the push from heat is gone too.
        But squeezed material can push back in a way that has nothing to do with heat. It comes from a rule of quantum
        physics: two electrons cannot be in the same state in the same place. The Chandra X-ray Observatory compares this
        to a parking lot with one car to a space. When there are many empty spaces, cars park easily and there is little
        movement. When the lot is full, there is nowhere left to go, so cars keep circling and crowding for any space
        that opens up. In extremely dense material the low-energy “parking spaces” for electrons are all taken, so
        electrons are forced into higher-energy states, not because they are hot but because there is nowhere else to go.
        This push is called <strong>electron degeneracy pressure</strong> (“degenerate” means that all the low-energy
        states are occupied). It is what holds up a <strong>white dwarf</strong>, the small, dense core left by a star like
        our Sun. It has a limit. Chandra says that a white dwarf heavier than about 1.4 times the Sun’s mass, the{' '}
        <strong>Chandrasekhar limit</strong>, will collapse: the electrons cannot hold it up any longer.
      </p>
      <p style={paragraph}>
        <strong>What happens to a heavier core.</strong> The core of a massive star is heavier than that limit, so it
        collapses. NASA says the collapse crushes every proton and electron together into a neutron. Neutrons follow the
        same one-to-a-space rule as electrons, so they can push back in the same way. If the core is between about 1 and
        3 times the Sun’s mass, NASA says, the new neutrons can stop the collapse, leaving a <strong>neutron star</strong>:
        about a Sun’s worth of mass in a ball only a few tens of kilometers across. For a core heavier than that, nothing
        we know of can hold it up. The core keeps shrinking until its whole mass is inside its horizon radius. At that
        point it is a black hole. This is exactly the squeeze you will try in this experiment: it lets you choose the final
        size, and asks whether it is small enough.
      </p>
      <LifeStagesDrawing />
      <Figure
        caption={
          <>
            <strong>A real observation.</strong> The Crab Nebula, a supernova remnant: the glowing gas thrown out
            when a massive star exploded. It lies about 6,500 light-years away in the constellation Taurus. It shows
            what a star’s explosion does to its outer layers.
          </>
        }
        credit="Image: NASA, ESA and Allison Loll/Jeff Hester (Arizona State University). Acknowledgement: Davide De Martin (ESA/Hubble). Released 1 December 2005."
      >
        <img
          src={CRAB_IMAGE}
          alt="A tangled shell of glowing red, orange, green and blue gas with a pale blue haze in the middle, on a black background dotted with stars."
          width={1280}
          height={1280}
          style={{ ...imgStyle, maxWidth: 'min(100%, 520px)' }}
        />
      </Figure>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>How we know they are there</h4>
      <p style={paragraph}>
        There are two main ways. First, <strong>stars circle them</strong>. At the centre of our galaxy, a star
        called S2 sweeps around a point where we can see nothing. Its orbit needs the pull of about four million
        Suns packed into a tiny space. Two teams tracked such stars for decades and shared the 2020 Nobel Prize in
        Physics. Second, <strong>gas glows</strong>. Gas falling toward a black hole speeds up and heats until it
        shines brightly, just outside the horizon. The gas and the stars are outside the horizon; the black hole
        itself gives off no light.
      </p>
      <Figure
        caption={
          <>
            <strong>A real observation.</strong> Left: an infrared picture of the crowded centre of the Milky Way
            (May 2002) with the star S2 marked next to the invisible black hole Sagittarius A*. Right: the path S2
            followed from 1992 to 2002, with dated points. The label “0.05 arcsec (2 light-days)” gives the scale.
            This is an early picture; later measurements followed S2 through its closest approach in May 2018.
          </>
        }
        credit="Image: ESO."
      >
        <img
          src={S2_IMAGE}
          alt="Left: an infrared image of many bright dots, with the star S2 and the black hole Sagittarius A* marked by arrows. Right: a tall ellipse with dated points from 1992 to 2002 showing the path S2 followed around Sagittarius A*."
          width={1280}
          height={949}
          style={{ ...imgStyle, maxWidth: 'min(100%, 640px)', backgroundColor: '#fff' }}
        />
      </Figure>
      <Figure
        caption={
          <>
            <strong>A real observation.</strong> Sagittarius A*, the black hole at the heart of our galaxy, about
            27,000 light-years away (12 May 2022). Like M87*, we see a ring of glowing gas around a dark middle.
          </>
        }
        credit="Image: EHT Collaboration (CC BY 4.0), via ESO."
      >
        <img
          src={SGRA_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas with two bright patches, around a dark patch in the middle, on a dark red background."
          width={1280}
          height={1280}
          style={{ ...imgStyle, maxWidth: 'min(100%, 420px)' }}
        />
      </Figure>
      <Figure
        caption={
          <>
            <strong>A real observation.</strong> The galaxy M77, 45 million light-years away, seen by the Webb
            telescope (28 May 2026). Its very bright core is an “active galactic nucleus”, powered by the
            supermassive black hole at its centre. You cannot see the black hole itself, only the glow of what
            surrounds it. The long spikes are an effect of the telescope’s mirror, not part of the galaxy.
          </>
        }
        credit="Image: ESA/Webb, NASA & CSA, A. Leroy."
      >
        <img
          src={M77_IMAGE}
          alt="A spiral galaxy seen face-on in infrared light, with swirling blue dust arms and an extremely bright orange core with long diffraction spikes."
          width={1280}
          height={1555}
          style={{ ...imgStyle, maxWidth: 'min(100%, 420px)' }}
        />
      </Figure>
      <Figure
        caption={
          <>
            <strong>An artist’s impression, not a photograph.</strong> Gaia BH3: a giant star (bright, left) and a
            dark black hole 33 times as heavy as the Sun (the small red ring) circling each other. It was found in
            2024 because its pull makes the star wobble, and it is the heaviest stellar black hole known in our
            galaxy. It lies about 2,000 light-years away.
          </>
        }
        credit="Image: ESO/L. Calçada/Space Engine (spaceengine.org)."
      >
        <img
          src={GAIA_IMAGE}
          alt="A bright white star on the left and a tiny red ring on the lower right, joined by a thin blue oval line showing their orbit, on a dark background of faint stars."
          width={1280}
          height={881}
          style={imgStyle}
        />
      </Figure>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>The objects</h4>
      <p style={paragraph}>
        Some words we will use. The <strong>radius</strong> of a ball is the distance from its middle to its
        surface. The <strong>horizon radius</strong> is the critical size for an object’s mass: if all of the mass
        is squeezed into a ball with that radius or smaller, the object is a black hole. Every mass has its own
        horizon radius. In Gravity and Curved Spacetime, Experiment 7, you found this same critical size using
        ordinary gravity. The exact theory, general relativity, gives the same radius. A{' '}
        <strong>solar mass</strong> is the mass of our Sun, and we measure masses in solar masses (as in
        Cosmology, Experiment 4). Some of the sizes here are very large, so we also use the{' '}
        <strong>astronomical unit</strong> (AU): the distance from the Earth to the Sun, about 150 million
        kilometers.
      </p>
      <p style={paragraph}>
        You can choose Earth, the Sun, a neutron star (the tiny, extremely dense core left behind when a large
        star dies), a stellar black hole (one with a mass of a few Suns), Sagittarius A* (the black hole at the
        center of our galaxy) and M87* (the black hole imaged in the galaxy M87). The three black holes are
        already inside their own horizons, so there is no real size to squeeze them from. For those three, the
        squeeze starts from an invented “hypothetical” ball 100 times as wide as the horizon radius. It is
        labeled hypothetical wherever it appears.
      </p>
      <p style={paragraph}>
        Black holes with millions or billions of times the Sun’s mass, like Sagittarius A* and M87*, are found at
        the centers of galaxies. How they grew so large is still an open question in science. Some of their
        growth comes from swallowing gas and stars and from merging with other black holes, but exactly how the
        first ones got so big so quickly is not settled.
      </p>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>What you will do</h4>
      <p style={paragraph}>
        You pick an object, then imagine squeezing all of its mass into a smaller and smaller ball. As the ball
        shrinks, the experiment compares its size with the critical size. <strong>First, make two guesses</strong>{' '}
        about the real Sun. Then press <strong>Run</strong> and watch the real Sun being squeezed on a ruler of
        sizes. After that you can choose other objects and radii yourself.
      </p>
      <p style={paragraph}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or tables.
        After the run they are drawn on the real ruler and on the “one Sun against 1,000 Suns” panel in{' '}
        <strong>white</strong>, in a box labelled YOUR GUESS, and shown again beside the results. The object and
        radius you choose in Part 2 do change Picture 2, and only Picture 2.
      </p>
      <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>This is a thought experiment.</strong> It does not say how a real object could be squeezed, or
          what force would do it. Real stars that are massive enough do collapse on their own, but that process is
          not modeled.
        </li>
        <li>
          <strong>What happens inside the horizon is not modeled.</strong> The horizon is where this experiment’s
          story stops.
        </li>
        <li>
          <strong>The formula for the horizon radius is given, not derived.</strong> Deriving it needs Einstein’s
          equations, which are outside this project. It is exact for the simplest kind of black hole: one that
          does not spin and has no electric charge. Real black holes usually spin, and a spinning one has a
          different, more complicated horizon.
        </li>
        <li>
          All of the mass is treated as being inside the ball, at rest, with none lost along the way. The ball does
          not spin.
        </li>
        <li>
          The real sizes of Earth and the Sun are NASA’s published values. A neutron star’s size is not settled
          exactly: NASA’s measurements give radii from about 11 to 14 kilometers, and this page uses a round 12.
          The “stellar black hole” mass is an illustrative round value, not a particular object. For Sagittarius
          A* the page uses 4.3 million Suns, while ESO’s release rounds it to “four million”.
        </li>
        <li>
          The “radius” is measured as it would be around the object, and the experiment does not discuss how it
          differs from a distance measured straight inward. The exact theory distinguishes them, and a later
          experiment may return to it.
        </li>
        <li>
          The three black holes are named for their real masses only. The experiment does not describe the glowing
          gas around them or the images made of them.
        </li>
      </ul>
    </div>
  )
}

// Recent news, as of November 2026. Each item was read on its source page on 2026-11-16.
export function BlackHoleRecentNews() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Recent news from black-hole science (as of November 2026)</h4>
      <ol style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>12 November 2026: a second look at the M87* picture.</strong> A new technique from CSIRO,
          Australia’s national science agency, was applied to the original Event Horizon Telescope data and found a
          black hole “almost identical in size and shape” to the famous 2019 image. CSIRO calls it the first truly
          independent check of the picture.{' '}
          <Ext href="https://www.csiro.au/en/news/all/news/2026/november/confirm-black-hole">CSIRO’s news release</Ext>
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>27 May 2026: a black hole older than its galaxy?</strong> NASA says the Webb telescope found a
          black hole, called QSO1, in the universe only about 700 million years after the Big Bang. It seems to
          hold at least two-thirds of the object’s mass, which suggests it formed before its galaxy.{' '}
          <Ext href="https://science.nasa.gov/missions/webb/nasas-webb-reveals-black-hole-that-formed-before-its-galaxy/">
            NASA’s release
          </Ext>
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>26 May 2026: 390 black-hole merger signals.</strong> The LIGO-Virgo-KAGRA teams released a new
          catalogue: 161 new events, bringing the total to 390 since the first in 2015, including the clearest
          gravitational-wave signal ever recorded.{' '}
          <Ext href="https://www.ligo.caltech.edu/MIT/news/ligo20260526">The catalogue announcement</Ext>
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>The heaviest merger seen in gravitational waves (GW231123, signal seen on 23 November 2023).</strong>{' '}
          Two black holes of about 100 and 140 Suns merged into one of more than 225 Suns.{' '}
          <Ext href="https://www.ligo.org/?p=4075">LIGO’s page on GW231123</Ext>
        </li>
        <li style={{ marginBottom: '0.4rem' }}>
          <strong>16 April 2024: the heaviest stellar black hole in our galaxy.</strong> Gaia BH3 has 33 Suns’
          worth of mass and lies about 2,000 light-years away. It was found because it makes its companion star
          wobble.{' '}
          <Ext href="https://www.eso.org/public/news/eso2408/">ESO’s release</Ext>
        </li>
      </ol>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>Science changes quickly. This list shows what was true on the date above.</p>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function BlackHoleSizeLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>Start here</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/">NASA, “Black Holes”</Ext>: NASA’s plain
          introduction: what a black hole is, the event horizon, and why black holes are not cosmic vacuum cleaners.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/types/">NASA, “Black Hole Types”</Ext>: how
          stars, galaxies and the early universe make black holes, and how heavy they can be.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso1907/">ESO, “Astronomers capture first image of a black hole”</Ext>:
          the story of the 2019 picture of M87*.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>Why a core stops shrinking, or does not</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://chandra.harvard.edu/xray_sources/white_dwarfs.html">Chandra, “White Dwarfs and Planetary Nebulas”</Ext>:
          the parking-lot comparison for electron degeneracy pressure, and the Chandrasekhar limit.
        </li>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/science/objects/neutron_stars1.html">NASA, “Neutron Stars”</Ext>: how a
          collapsing core becomes a neutron star, and what happens to a heavier one.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>The discoveries</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso2208/">ESO, the first image of the black hole at the heart of our galaxy</Ext>:
          how the 2022 picture of Sagittarius A* was made.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso2017/">ESO, the 2020 Nobel Prize in Physics</Ext>: how two
          teams followed stars around the black hole in our galaxy’s centre.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso2408/">ESO, “Most massive stellar black hole in our galaxy found”</Ext>:
          Gaia BH3, with a link to the scientific paper.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso2406/">ESO, magnetic fields at the edge of Sagittarius A*</Ext>:
          what the polarised view of our galaxy’s black hole showed (March 2024).
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>Waves and the early universe</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.ligo.caltech.edu/page/press-release-gw150914">LIGO, the first detection of gravitational waves</Ext>:
          two black holes of about 29 and 36 Suns merging (2015).
        </li>
        <li style={linkItem}>
          <Ext href="https://www.ligo.org/?p=4075">LIGO, GW231123</Ext> and{' '}
          <Ext href="https://www.ligo.caltech.edu/MIT/news/ligo20260526">the 2026 catalogue</Ext>: the heaviest
          merger so far, and 390 signals in all.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/webb/nasas-webb-reveals-black-hole-that-formed-before-its-galaxy/">
            NASA, a black hole that formed before its galaxy
          </Ext>
          : Webb’s picture of QSO1 in the young universe (May 2026).
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>Latest</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.25rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.csiro.au/en/news/all/news/2026/november/confirm-black-hole">CSIRO, a new check of the M87* picture</Ext>
          (12 November 2026).
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        All links open in a new tab. After your first run, Part 3 adds links to NASA pages that give the sizes you
        will have just worked out. They are held back so they do not give away your guesses.
      </p>
    </div>
  )
}

const termStyle = { marginBottom: '0.4rem' } as const

export function BlackHoleSizeWords({ afterRun }: { afterRun: boolean }) {
  const sunKm = horizonRadiusKm(1)
  return (
    <details style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Words and formulas</summary>
      <ul style={{ marginTop: '0.75rem', marginBottom: 0, paddingLeft: '1.25rem' }}>
        <li style={termStyle}>
          <strong>Radius:</strong> the distance from the middle of a ball to its surface.
        </li>
        <li style={termStyle}>
          <strong>Horizon, event horizon:</strong> the one-way edge of a black hole. Anything can cross it going in;
          nothing, not even light, can come back out.
        </li>
        <li style={termStyle}>
          <strong>Horizon radius:</strong> the critical size for a mass. A ball of that mass squeezed to this radius
          or smaller is a black hole.
        </li>
        <li style={termStyle}>
          <strong>Solar mass:</strong> the mass of our Sun, about 2 × 10³⁰ kilograms. We measure other masses in
          Suns.
        </li>
        <li style={termStyle}>
          <strong>Astronomical unit (AU):</strong> the distance from the Earth to the Sun, about 150 million
          kilometers.
        </li>
        <li style={termStyle}>
          <strong>Logarithmic ruler:</strong> a ruler where each tick is 10 times the one before it, so very small
          and very large sizes fit on one line.
        </li>
        <li style={termStyle}>
          <strong>Degeneracy pressure:</strong> the push of very squeezed material that comes from the rule that two
          electrons (or two neutrons) cannot be in the same state in the same place. When all the low-energy states are
          taken, the particles are forced into higher-energy ones and push outward, even if the material is cold.
        </li>
        <li style={termStyle}>
          <strong>White dwarf:</strong> the small, dense core left behind by a star like our Sun, held up by electron
          degeneracy pressure.
        </li>
        <li style={termStyle}>
          <strong>Chandrasekhar limit:</strong> the heaviest a white dwarf can be, about 1.4 times the Sun’s mass. A white
          dwarf is held up by electrons pushing back against gravity (electron degeneracy pressure). More mass means gravity
          squeezes harder, so the electrons have to push back harder by moving faster, and nothing can move faster than
          light. So their push has a maximum. Above about 1.4 Suns, gravity is stronger than the strongest push the
          electrons can give, and the star collapses. A comparison: every bridge has a maximum load. Beyond it, adding weight
          does not make the bridge push back harder; it fails. This limit is for white dwarfs. The neutron-star limit, about
          3 Suns, is a different and higher threshold. It is named after Subrahmanyan Chandrasekhar, who found it in his
          twenties.
        </li>
        <li style={termStyle}>
          <strong>Neutron star:</strong> the tiny, extremely dense core left behind when a large star dies. It is
          packed so tightly that it can resist further squeezing.
        </li>
        <li style={termStyle}>
          <strong>Stellar black hole:</strong> a black hole with a mass of a few to hundreds of Suns (NASA), made
          when a massive star dies.
        </li>
        <li style={termStyle}>
          <strong>Supermassive black hole:</strong> a black hole with hundreds of thousands to billions of Suns’
          worth of mass (NASA), found at the centres of galaxies.
        </li>
        <li style={termStyle}>
          <strong>Hypothetical:</strong> invented for the question, not a real object or size.
        </li>
        {afterRun ? (
          <>
            <li style={termStyle}>
              <strong>Schwarzschild radius:</strong> another name for the horizon radius of a black hole that does
              not spin, after Karl Schwarzschild, who found it in 1916.
            </li>
            <li style={termStyle}>
              <strong>Escape speed:</strong> the speed something needs to get away from a ball’s gravity and never
              come back. At the horizon radius, ordinary gravity needs exactly the speed of light.
            </li>
            <li style={termStyle}>
              <strong>Formula:</strong> horizon radius r = 2GM / c², where G is the gravitational constant, M is the
              mass and c is the speed of light. It works out to about {String(Number(sunKm.toPrecision(3)))} kilometers
              for every solar mass. Worked example: 10 solar masses gives 10 × {String(Number(sunKm.toPrecision(3)))} ≈{' '}
              {String(Number(horizonRadiusKm(10).toPrecision(3)))} km.
            </li>
          </>
        ) : (
          <li style={termStyle}>
            <em>More words, and the formula for the horizon radius, appear here after your first run. They are held
            back so that they do not give away your guesses.</em>
          </li>
        )}
      </ul>
    </details>
  )
}
