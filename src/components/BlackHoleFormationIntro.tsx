import type { ReactNode } from 'react'
import { NEUTRON_STAR_RADIUS_KM, PART_ONE_MASS, PUBLISHED, whiteDwarfRadiusSteps } from '../physics/blackHoleFormationExperiment'
import { paragraph } from './TidalEffectExperiment'

// Black Holes, Experiment 9 (audit update): the introduction, the links, the words box, the real dead stars block and the notes under the three
// questions (docs/audit/black-holes-and-strong-gravity/09-draft-wording.md, "all defaults" from the owner on 2026-11-18). The introduction keeps the
// owner's text and adds to it. It keeps clear of the answers to the three questions (CLAUDE.md §12): it does not name the Chandrasekhar limit or say
// "limit", does not say that a heavier white dwarf is smaller, does not give a mass above which a core is a black hole and does not say that a neutron
// star can be heavier than a white dwarf. Nothing in the drawings is white: white is reserved for the learner's guess marks.

const BASE = import.meta.env.BASE_URL
const SIRIUS_IMAGE = `${BASE}images/black-holes/sirius-b-earth-heic0516c.jpg`
const SN1987A_IMAGE = `${BASE}images/black-holes/sn1987a-webb-weic2404a.jpg`
const N6946_IMAGE = `${BASE}images/black-holes/n6946-bh1-nasa-illustration.jpg`
const GAIA_IMAGE = `${BASE}images/black-holes/gaia-bh3-eso2408a.jpg`

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
const GRAVITY = '#4ade80'
const HEAT = '#fb923c'

// An arrow from (x1, y1) to (x2, y2), with a small head at the end.
function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = (d: number) => `${x2 + 8 * Math.cos(angle + d)},${y2 + 8 * Math.sin(angle + d)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} />
      <polygon points={`${x2},${y2} ${head(Math.PI - 0.45)} ${head(Math.PI + 0.45)}`} fill={color} />
    </g>
  )
}

// Figure 1: a star as a balance. Left: gravity pulls in and the heat pushes out, with arrows of the same length. Right: the fuel has run out, so
// only gravity is left. No numbers.
function BalanceDrawing() {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  const at = (cx: number, cy: number, r: number, deg: number) => ({ x: cx + r * Math.cos((deg * Math.PI) / 180), y: cy + r * Math.sin((deg * Math.PI) / 180) })
  return (
    <svg
      viewBox="0 0 440 230"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="Two drawings of a star. On the left, a glowing ball with green arrows pointing in and orange arrows pointing out, all the same length: the star is in balance. On the right, a smaller dim ball with only green arrows pointing in: the fuel has run out and only gravity is left."
    >
      <text x={110} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        a star in balance
      </text>
      <circle cx={110} cy={118} r={32} fill="#f59e0b" />
      {angles.map((a) => {
        const inward = [at(110, 118, 80, a), at(110, 118, 58, a)]
        const outward = [at(110, 118, 38, a + 22.5), at(110, 118, 62, a + 22.5)]
        return (
          <g key={a}>
            <Arrow x1={inward[0].x} y1={inward[0].y} x2={inward[1].x} y2={inward[1].y} color={GRAVITY} />
            <Arrow x1={outward[0].x} y1={outward[0].y} x2={outward[1].x} y2={outward[1].y} color={HEAT} />
          </g>
        )
      })}
      <text x={110} y={208} fill={GRAVITY} fontSize="11" textAnchor="middle">
        green: gravity pulls in
      </text>
      <text x={110} y={222} fill={HEAT} fontSize="11" textAnchor="middle">
        orange: the heat pushes out
      </text>

      <text x={330} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        the fuel has run out
      </text>
      <circle cx={330} cy={118} r={26} fill="#7c2d12" />
      {angles.map((a) => {
        const inward = [at(330, 118, 80, a), at(330, 118, 46, a)]
        return <Arrow key={a} x1={inward[0].x} y1={inward[0].y} x2={inward[1].x} y2={inward[1].y} color={GRAVITY} />
      })}
      <text x={330} y={208} fill={GRAVITY} fontSize="11" textAnchor="middle">
        only gravity pulls in
      </text>
      <text x={330} y={222} fill="#94a3b8" fontSize="11" textAnchor="middle">
        no more push from the heat
      </text>
    </svg>
  )
}

// Figure 3: the seats of the theatre. Nobody shares a seat. A few people sit in the front seats; many people fill the front seats and some farther
// back. No numbers.
function SeatsDrawing() {
  const rows = [150, 110, 70] // front row first (nearest the stage, at the bottom), then farther back
  const seatXs = [0, 1, 2, 3, 4, 5].map((i) => 26 + i * 28)
  const panel = (x0: number, filled: number[], title: string, line2: string) => (
    <g transform={`translate(${x0},0)`}>
      <text x={96} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        {title}
      </text>
      {rows.map((y, r) =>
        seatXs.map((x, i) => (
          <g key={`${r}-${i}`}>
            <rect x={x - 10} y={y - 8} width={20} height={20} rx={4} fill="none" stroke="#475569" strokeWidth={1.5} />
            {i < filled[r] && <circle cx={x} cy={y + 2} r={7} fill={HEAT} />}
          </g>
        )),
      )}
      <text x={96} y={196} fill="#94a3b8" fontSize="11" textAnchor="middle">
        {line2}
      </text>
    </g>
  )
  return (
    <svg
      viewBox="0 0 440 210"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="Two drawings of theatre seats in three rows, with one person to a seat. On the left a few people sit in the front row. On the right the front row and the middle row are full, and some people sit in the back row too."
    >
      {panel(10, [3, 0, 0], 'a few', 'they sit in the front seats')}
      {panel(230, [6, 6, 3], 'many', 'front full, so the rest sit behind')}
    </svg>
  )
}

export function BlackHoleFormationIntro() {
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> In Black Holes 1 you squeezed objects until they became black holes, and found how small each one would have to be. You also found that a neutron star, a dead star only about {NEUTRON_STAR_RADIUS_KM} km in radius, is only about 3 times too big. "Too big" means too big to be a black hole. Any object turns into a black hole if all of its mass is squeezed inside its own critical radius, and that radius is larger for a heavier object. A neutron star holds about 1.4 Suns of mass, so its critical radius is about 4.1 km. Its real radius is {NEUTRON_STAR_RADIUS_KM} km, so it would have to shrink to about a third of its size ({NEUTRON_STAR_RADIUS_KM} ÷ 4.1 is about 3). That is a tiny squeeze compared with the Sun, which would have to shrink about 236,000 times. In other words, a neutron star is already almost small enough. But in nature there is no hand doing the squeezing. When a star runs out of fuel, its own gravity squeezes its core, the middle of the star. So what does the squeezing, and what can stop it?
      </p>
      <p style={paragraph}>
        <strong>Why even ask this.</strong> The Sun will never become a black hole. Some stars do. What decides the difference? It comes down to what is left at the center when the fuel is gone, and whether anything can hold it up.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>How a star ends, and where a black hole comes in.</strong> Six short ideas.
      </p>
      <ol style={ol}>
        <li>
          <strong>A star is a balance.</strong> A star is a huge ball of hot gas. Its own gravity pulls every part of it toward the center. What stops it from collapsing is a push outward, from the heat inside. Think of a balloon: the air inside pushes out, the rubber pulls in, and the balloon keeps its shape for as long as the two balance. The Sun has kept this balance for about 4.6 billion years.
        </li>
        <li>
          <strong>The heat comes from fuel.</strong> Deep in the middle of a star, the heat and the squeeze are so great that the tiny particles at the center of atoms, their nuclei, are forced to join together, and each time they do, they release energy. This is called <strong>nuclear fusion</strong>. It is what keeps the gas hot, and the hot gas is what pushes outward. The star’s “fuel” is whatever can still be fused. NASA’s page on stars says the same: in a star’s core, the nuclei of hydrogen atoms are squeezed together to form helium, a process called nuclear fusion, which releases energy that heats the star and keeps it from collapsing under gravity.
        </li>
        <li>
          <strong>The fuel runs out.</strong> A star does not have an endless supply. Like a campfire, once the wood is used up, the heat is no longer made, and it fades. When the middle of the star has no fuel left that it can use, the push that came from the heat fades with it.
        </li>
        <li>
          <strong>Gravity then squeezes the core.</strong> The middle part of the star, where the fuel was used up, is its <strong>core</strong>. With the push of the heat gone, gravity squeezes the core, packing the same matter into less and less room. (What happens to the star’s outer layers is a different story, and this experiment leaves it out.) The more mass a core has, the harder gravity pulls it in.
        </li>
        <li>
          <strong>Squeezing brings in a different kind of push.</strong> Particles do not like being crowded together, and when a core is squeezed hard enough, they push back. This push has nothing to do with heat, so it can still be there when the core has cooled. You will meet the details below. The question is whether this push is enough to balance gravity and hold the core up. If it is, the core stops shrinking, at a size where the push and gravity balance, just as the balloon does. If it is not, nothing stops the squeeze.
        </li>
        <li>
          <strong>What is left depends on what holds the core up.</strong> A dead core can end in one of three ways, and the difference is what, if anything, holds it up against gravity.
          <ul style={ul}>
            <li>
              <strong>A white dwarf.</strong> Here the core is held up by <strong>electrons</strong>, the tiny particles that circle the outside of atoms. Squeezed together, they resist being crowded any closer. This is enough to stop the core at about the size of the Earth, even though it holds about as much matter as the Sun (Figure 2).
            </li>
            <li>
              <strong>A neutron star.</strong> Here the core has more mass, and the more mass a core has, the harder its own gravity pulls it in. This pull is too strong for the electrons to hold, so the core keeps shrinking and is squeezed far more tightly. It stops only when <strong>neutrons</strong>, the particles that sit in the middle of atoms, push back. Shrinking also makes the pull stronger: the same mass packed into a smaller ball pulls harder at its surface, so a smaller core needs a stronger push to hold it up. Why? Gravity gets weaker with distance, and quickly: if you go twice as far from a mass, its pull falls to a quarter, and if you go half as far, its pull is four times stronger. The surface of a core is one radius away from the center, so when the core shrinks, its surface moves closer to all of its mass. Shrink the core to a third of its radius and the pull at its surface is 3 × 3 = 9 times stronger. Compare your own weight: if the Earth were squeezed to half its radius, with the same mass, you would weigh four times as much. A white dwarf is about 6,400 km in radius and a neutron star about {NEUTRON_STAR_RADIUS_KM} km, more than 500 times smaller, so gravity at a neutron star’s surface is hundreds of thousands of times stronger than at a white dwarf’s of the same mass. A neutron star holds more than the Sun’s mass in a ball only about {NEUTRON_STAR_RADIUS_KM} km in radius, about the size of a city. That is why the page calls it “much more tightly squeezed”: the same push of crowded particles, but at a far smaller size.
            </li>
            <li>
              <strong>A black hole.</strong> If the core is so heavy that gravity beats even the push of the neutrons, nothing is left to hold it up, and nothing can stop the squeeze. The core keeps shrinking until it is smaller than its own horizon radius, the size at which, as you saw in Black Holes 1, a mass becomes a black hole and not even light can get out.
            </li>
          </ul>
          Think of a person pressing down on a spring. A light person compresses it a little and it holds. A heavier person compresses it more, and it still holds. But a person who is heavy enough will crush it flat, however strong it is. A core is like this: each kind of push can hold up a core only up to a limit, and past that limit the squeeze goes on. So a black hole forms when a dead core is squeezed past anything that can hold it up. The experiment asks how that depends on the core’s mass.
        </li>
      </ol>
      <Figure
        caption={
          <>
            <strong>Figure 1. A star is a balance.</strong> Gravity pulls in and the push of the heat inside pushes out. When the fuel is gone, the push from the heat is gone, and gravity squeezes the core. A drawing made for this page, not to scale.
          </>
        }
      >
        <BalanceDrawing />
      </Figure>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What happens.</strong> Here is the whole experiment, step by step.
      </p>
      <ol style={ol}>
        <li>In Part 1 you make three predictions. The dead core is one of {PART_ONE_MASS} Suns.</li>
        <li>
          You press Run. A ball, the core, shrinks over 10 seconds, from a large size down to whatever holds it up (or past its horizon, if nothing does). This is only how the result is shown, and it is not how long a real collapse takes.
        </li>
        <li>
          A <strong>ladder</strong> shows what holds a core up, for every mass. A <strong>ruler</strong> shows how wide the core ends up compared with its own horizon. A <strong>graph</strong> shows how the size of one kind of dead star depends on its mass.
        </li>
        <li>In Part 2 you choose another mass, in Suns (one Sun is the mass of our Sun), run it, and compare.</li>
        <li>The experiment stops at the horizon. It does not show anything inside it.</li>
      </ol>
      <p style={paragraph}>
        <strong>Some words we will use.</strong> A <strong>dead star’s core</strong> is the central part of a star that has used up its fuel. A star’s fuel is what makes it push outward against its own gravity, so once the fuel is gone, only a push that comes from squeezing particles together is left. A <strong>white dwarf</strong> is a dead star roughly the size of the Earth, and a <strong>neutron star</strong> is a dead star only about {NEUTRON_STAR_RADIUS_KM} km in radius (about {2 * NEUTRON_STAR_RADIUS_KM} km across), about the size of a city. Atoms are made of particles. An <strong>electron</strong> is a tiny particle that moves around the outside of an atom, and a <strong>neutron</strong> is a particle that sits in the middle of an atom, in its nucleus. Both can hold a dead star up, in a way that has a name: <strong>degeneracy pressure</strong>. Here is a comparison. In a theatre, every seat holds one person, and you cannot put two people in the same seat, however hard you push. Electrons, and neutrons, behave a little like this: no two of them can be in exactly the same state, so when they are crowded together they resist being crowded more. That resistance is the push. The comparison is only a picture (Figure 3), and the tutor comes back to it. Finally, from Black Holes 1: a <strong>Sun</strong> is the mass of our Sun, which is how we measure the mass of a core here, and the <strong>horizon</strong> is the boundary around a black hole. Think of the horizon at sea, the line past which you cannot see, but much stronger: inside the horizon, gravity is so strong that nothing can get out, not even light. Something can cross it going in, but nothing can come back out, so we can never see what is inside. It is a boundary in space, not a solid surface. It is the horizon of the black hole that a mass would make if all of it were squeezed inside, so it belongs to the mass and not to any star. The <strong>horizon radius</strong> is the distance from the center to the horizon, the size the core would have to be squeezed inside to be a black hole. It depends only on the mass: 2.953 km for each Sun.
      </p>
      <Figure
        caption={
          <>
            <strong>Figure 2. A white dwarf beside the Earth, in an artist’s picture.</strong> This is Sirius B, the white dwarf that circles the bright star Sirius. ESA/Hubble says its diameter is 12,000 kilometres, less than the size of the Earth, and that it has about as much mass as our Sun (a later Hubble measurement, by Bond and others in 2017, gives {PUBLISHED.siriusBMassSolarMasses} times the Sun’s mass, give or take 0.011). The picture is an artist’s idea, made to show the sizes.{' '}
            <span style={{ fontSize: '0.75rem' }}>Image: ESA and NASA, via ESA/Hubble (CC BY 4.0).</span>
          </>
        }
      >
        <img
          src={SIRIUS_IMAGE}
          alt="A glowing blue-white ball on the left, a little smaller than the lit Earth on the right, against a field of stars."
          width={1600}
          height={1202}
          style={{ ...imgStyle, maxWidth: 'min(100%, 520px)' }}
        />
      </Figure>
      <Figure
        caption={
          <>
            <strong>Figure 3. The seats of the theatre.</strong> A drawing made for this page. Nobody shares a seat, however crowded the theatre gets: a few people sit in the front seats, and when many arrive the front is full and the rest sit farther back. Electrons and neutrons behave a little like this. It is only a picture.
          </>
        }
      >
        <SeatsDrawing />
      </Figure>

      <p style={paragraph}>
        <strong>What this builds on.</strong> Black Holes 1 found the horizon radius and squeezed real objects down to it. It said that what could do the squeezing, and what would stop it, was not modeled. This experiment is the answer.
      </p>
      <p style={paragraph}>
        <strong>About your predictions.</strong> In Part 1 you make three guesses before you run anything. Your guesses never change the real pictures or tables. After you press Run they are drawn on the pictures in white, in a box labelled YOUR GUESS, and shown again beside the results. In Part 2, the core mass you choose does change the drawings and the tables, and your guesses do not.
      </p>
      <p style={paragraph}>
        <strong>Your job.</strong> First, make three predictions. Then press Run. After that, choose other masses in Part 2, and compare.
      </p>
      <p style={paragraph}>
        <strong>What to look for.</strong> Where your core is on the ladder, where the ball stops, how far that is from the ring of the horizon, and what the three pictures show as you try different masses.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>This is a thought experiment about a dead core</strong> that has cooled, is not spinning and is at rest. How the star got to the end of its life is not shown.
        </li>
        <li>
          <strong>The numbers are standard results, given and not derived,</strong> and some are not known exactly. The experiment says which, when it uses them.
        </li>
        <li>
          <strong>The sizes and masses are round numbers.</strong> Real ones vary a little.
        </li>
        <li>
          <strong>The experiment stops at the horizon.</strong> Nothing inside it is modeled.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        <strong>As of November 2026.</strong> This page uses standard results for dead stars, given and not derived. Some are not known exactly. Real white dwarfs, neutron stars and young black holes are measured and their numbers are published; some of the newest results are listed under “Want to know more?” and shown after your first run.
      </p>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function BlackHoleFormationLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/stars/">NASA Science, “Stars”</Ext> (updated 12 August 2026): how a star shines by fusion and keeps its balance.
        </li>
        <li style={linkItem}>
          <Ext href="https://esahubble.org/news/heic0516/">ESA/Hubble, “Weighing the Dog Star’s companion”</Ext> (13 December 2005): how Hubble weighed a real white dwarf, Sirius B.
        </li>
        <li style={linkItem}>
          <Ext href="https://chandra.harvard.edu/photo/2000/0065/">Chandra, “Sirius A &amp; B”</Ext>: the same pair of stars seen in X-rays.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        All links open in a new tab. After your first run, Part 3 adds more pages and the papers behind the real results. They are held back so they do not give away your guesses.
      </p>
    </div>
  )
}

// The pages added after the first run (they give guesses away: the 1.4 limit, the 1-to-3-Suns core, "more massive is smaller", whole-star masses).
export function BlackHoleFormationHeldBackLinks() {
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>More to read, after your run</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/stars/types/">NASA Science, “Types of Stars”</Ext>: NASA’s guide to white dwarfs, neutron stars and supernovae.
        </li>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/science/objects/dwarfs2.html">NASA Imagine the Universe, “White Dwarfs”</Ext> (page updated 23 September 2021): why a white dwarf stops shrinking, and the Chandrasekhar limit.
        </li>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/science/objects/neutron_stars.html">NASA Imagine the Universe, “Neutron Stars”</Ext> (page updated 23 September 2021): how a collapsing core makes a neutron star, and what happens above about 3 Suns.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/types/">NASA Science, “Black Hole Types”</Ext>: NASA’s account of how stellar-mass black holes form.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/hubble/collapsing-star-gives-birth-to-a-black-hole/">NASA, “Collapsing Star Gives Birth to a Black Hole”</Ext> (25 May 2017): a star that seems to have vanished, a likely failed supernova.
        </li>
        <li style={linkItem}>
          <Ext href="https://eso.org/public/news/eso2408/">ESO, “Gaia BH3”</Ext> (16 April 2024): a black hole of 33 Suns in our own galaxy.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.su.se/english/news/articles/2024-02-22-james-webb-telescope-detects-traces-of-neutron-star-in-iconic-supernova">Stockholm University, “James Webb telescope detects traces of neutron star in iconic supernova”</Ext> (22 February 2024): evidence of a neutron star in SN 1987A.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Papers and original sources</p>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2207.05124">Romani et al., “PSR J0952-0607: The Fastest and Heaviest Known Galactic Neutron Star”</Ext> (2022): the heaviest well-measured neutron star.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2407.06789">Choudhury et al., “A NICER View of the Nearest and Brightest Millisecond Pulsar: PSR J0437-4715”</Ext> (2024): a neutron star’s mass and radius.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2406.14466">Salmi et al., “The Radius of the High-mass Pulsar PSR J0740+6620 with 3.6 yr of NICER Data”</Ext> (2024): the radius of a heavy neutron star.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2404.04248">LIGO–Virgo–KAGRA, “GW230529”</Ext> (2024): a merger with a compact object of 2.5 to 4.5 Suns that gravitational waves alone cannot call a neutron star or a black hole.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2404.10486">Gaia Collaboration, “Discovery of a dormant 33 solar-mass black hole in pre-release Gaia astrometry”</Ext> (2024).
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/1703.10625">Bond et al., “The Sirius System and its Astrophysical Puzzles”</Ext> (2017): the mass of Sirius B.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/1609.01283">Adams et al., “The search for failed supernovae with the LBT: confirmation of a disappearing star”</Ext> (2017): the star N6946-BH1.
        </li>
        <li style={linkItem}>
          Where the two limits come from: Chandrasekhar, <em>The Astrophysical Journal</em> 74, 81 (1931), and Oppenheimer and Volkoff, <em>Physical Review</em> 55, 374 (1939). These two were not read for this page; they are given as the origin of the limits.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>All links open in a new tab. No plain official page was found for the “mass gap”; it is explained in plain words on this page, and the paper on GW230529 is the source.</p>
    </div>
  )
}

const figureCredit = { fontSize: '0.75rem' } as const

// Real dead stars and young black holes: published measurements and pictures, outside this page's model. Shown in Part 3, after the first run, so that
// nothing here gives a guess away. Every figure is from a page that was read (see the draft wording's source table).
export function RealDeadStars() {
  return (
    <div style={{ margin: '1.25rem 0', padding: '0.75rem 1rem', fontSize: '0.875rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Real dead stars and young black holes (outside this page’s model)</h4>
      <p style={{ marginTop: 0 }}>
        Everything above was calculated here, from standard results given and not derived. Astronomers also measure real dead stars. Here are some published results. They are not outputs of this page: the numbers in the tables are calculated here, and these are measured by others, with their own uncertainties.
      </p>
      <Figure
        caption={
          <>
            <strong>A neutron star in the supernova of 1987.</strong> In 1987 a star exploded in the Large Magellanic Cloud, a small galaxy next to ours. In 2024 the Webb telescope found the best evidence yet for emission from a neutron star at the center of what is left (ESA/Webb). The two small pictures on the right show the gas near the center, in light that comes from argon atoms. <span style={figureCredit}>Image: NASA, ESA, CSA, STScI, and C. Fransson (Stockholm University), M. Matsuura (Cardiff University), M. J. Barlow (University College London), P. J. Kavanagh (Maynooth University), J. Larsson (KTH Royal Institute of Technology), via ESA/Webb (CC BY 4.0).</span>
          </>
        }
      >
        <img
          src={SN1987A_IMAGE}
          alt="On the left, a ring of bright pearls around a pale blue patch of gas. On the right, two close-ups in orange, one with a bright spot near its center."
          width={1402}
          height={834}
          style={{ ...imgStyle, maxWidth: 'min(100%, 600px)' }}
        />
      </Figure>
      <Figure
        caption={
          <>
            <strong>A star that seems to have vanished.</strong> An artist’s illustration of a star of about 25 Suns, N6946-BH1, in the galaxy NGC 6946, 22 million light-years away. In 2009 it shone more than a million times brighter than the Sun for several months, and then it seemed to vanish. NASA calls it a likely failed supernova: a star that collapses to a black hole without a bright explosion. Later work says it is still a candidate. <span style={figureCredit}>Image: NASA, ESA, and C. Kochanek (OSU), an artist’s illustration.</span>
          </>
        }
      >
        <img
          src={N6946_IMAGE}
          alt="An artist's picture in five stages, from left to right: a small red star, then a bright cloud of gas thrown off, then a thinning cloud with a bright disk at the middle, then a darker cloud with a glowing disk around a black center."
          width={1280}
          height={512}
          style={{ ...imgStyle, maxWidth: 'min(100%, 640px)' }}
        />
      </Figure>
      <Figure
        caption={
          <>
            <strong>A black hole of 33 Suns.</strong> Gaia BH3 is a black hole 33 times the mass of the Sun (32.70 ± 0.82, Gaia Collaboration 2024), found in our own galaxy because of the way it makes its companion star wobble. ESO says the stellar black holes found earlier in the Milky Way are on average about 10 times the mass of the Sun. <span style={figureCredit}>Image: ESO/L. Calçada/Space Engine (spaceengine.org).</span>
          </>
        }
      >
        <img
          src={GAIA_IMAGE}
          alt="A bright white star on the left and a tiny red ring on the lower right, joined by a thin blue oval line showing their orbit, on a dark background of faint stars."
          width={1280}
          height={1280}
          style={{ ...imgStyle, maxWidth: 'min(100%, 380px)' }}
        />
      </Figure>
      <p style={{ marginBottom: '0.25rem' }}>
        <strong>Measured numbers, each from its own source:</strong>
      </p>
      <ul style={ul}>
        <li>
          <strong>Sirius B, a white dwarf.</strong> About 12,000 km across (ESA/Hubble, 2005) and {PUBLISHED.siriusBMassSolarMasses} ± 0.011 times the Sun’s mass (Bond and others, 2017). <em>How sure:</em> the 12,000 km is given to two figures.
        </li>
        <li>
          <strong>Three neutron stars.</strong> One of {PUBLISHED.neutronStarRadii[0].massSolarMasses} ± 0.037 Suns with a radius of {PUBLISHED.neutronStarRadii[0].radiusKm} km (plus {PUBLISHED.neutronStarRadii[0].plusKm}, minus {PUBLISHED.neutronStarRadii[0].minusKm}) (NICER, 2024). One of {PUBLISHED.neutronStarRadii[1].massSolarMasses} ± 0.069 Suns with a radius of {PUBLISHED.neutronStarRadii[1].radiusKm} km (plus {PUBLISHED.neutronStarRadii[1].plusKm}, minus {PUBLISHED.neutronStarRadii[1].minusKm}) (NICER, 2024). And one of 2.35 ± 0.17 Suns, which the paper calls “the largest well-measured mass found to date” (Romani and others, 2022). <em>How sure:</em> the heaviest has a wide error bar.
        </li>
        <li>
          <strong>GW230529.</strong> Two objects merged, and one of them had a mass between 2.5 and 4.5 Suns. The paper says gravitational waves alone cannot tell whether it was a neutron star or a black hole, and that it lies within the “lower mass gap” between the heaviest neutron stars and the lightest black holes seen in our galaxy. This is the not-known zone of the ladder, met in nature.
        </li>
        <li>
          <strong>NASA’s numbers for a whole star.</strong> NASA says a star with “between about eight and 20 times the Sun’s mass” leaves a neutron star, and one with “around 20 times the Sun’s mass or more” leaves a black hole. <em>Careful:</em> these are the masses of the whole star when it was born. This page’s cores are the middle of the star, and the page’s mass of about 3 Suns is for the core. NASA’s own page on neutron stars gives the core’s numbers: a core “between about 1 and 3 solar masses” can be stopped by neutrons. The two numbers are for different things.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>These are published measurements, not outputs of this page.</p>
    </div>
  )
}

// The entries of the shared "Words and formulas" panel. The Chandrasekhar name, the formulas (with their worked numbers) and the other words that name an
// answer come only after the first run, because they give guesses away (CLAUDE.md §12).
export function blackHoleFormationWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Core; dead star’s core', meaning: 'the central part of a star that has used up its fuel. It is the core, not the whole star, that is squeezed.' },
    { term: 'Nuclear fusion', meaning: 'the joining of the tiny particles at the center of atoms, which releases energy. It is what keeps a star hot, and its heat pushes outward against gravity.' },
    { term: 'White dwarf', meaning: 'a dead star held up by the push of its electrons. Roughly the size of the Earth.' },
    { term: 'Neutron star', meaning: `a dead star held up by the push of its neutrons. About ${NEUTRON_STAR_RADIUS_KM} km in radius, about ${2 * NEUTRON_STAR_RADIUS_KM} km across, about the size of a city.` },
    { term: 'Electron; neutron', meaning: 'an electron is a tiny particle that moves around the outside of an atom. A neutron is a particle in the middle of an atom, in its nucleus.' },
    { term: 'Degeneracy pressure', meaning: 'the push that electrons, or neutrons, give back when they are crowded together, because no two of them can be in exactly the same state. The picture: seats in a theatre, one person to a seat, however hard you push.' },
    { term: 'Sun (as a unit of mass)', meaning: 'the mass of our Sun, which is how we measure the mass of a core here.' },
    { term: 'Horizon', meaning: 'the boundary around a black hole. Inside it, gravity is so strong that nothing can get out, not even light. Something can cross it going in, but nothing can come back out. It is a boundary in space, not a solid surface. It is the horizon of the black hole that a mass would make if all of it were squeezed inside, so it belongs to the mass and not to any star. From Black Holes 1.' },
    { term: 'Horizon radius', meaning: 'the distance from the center to the horizon of a black hole of that mass: the size a core would have to be squeezed inside to be a black hole. From Black Holes 1. It is 2.953 km for every Sun of mass.' },
  ]
  if (afterRun) {
    const steps = whiteDwarfRadiusSteps(1)
    entries.push(
      { term: 'Chandrasekhar limit', meaning: 'the most mass a white dwarf can have, about 1.4 Suns (NASA’s figure; this page uses 1.44), named after the physicist who worked it out in the 1930s.' },
      { term: 'Supernova; failed supernova', meaning: 'a supernova is the huge explosion that can follow the collapse of a star’s core. A failed supernova is a star that seems to collapse to a black hole without a bright explosion.' },
      { term: 'Mass gap', meaning: 'the stretch of masses between the heaviest neutron stars and the lightest black holes. It is not known exactly what is found there, and the ladder’s hatched zone is this page’s version of it.' },
      { term: 'Formula: the horizon radius', meaning: 'horizon radius = 2.953 km × the mass in Suns. Worked for 3 Suns: 2.953 × 3 = 8.86 km. Given, from Black Holes 1.' },
      { term: 'Formula: how close a core gets to its horizon', meaning: 'ratio = the radius of what holds the core up ÷ its horizon radius. Worked for a neutron star of 3 Suns: 12 ÷ 8.86 = 1.35.' },
      {
        term: 'Formula: a white dwarf’s radius',
        meaning: `R = 0.0131 R☉ × M^(−1/3) × √(1 − (M ÷ 1.44)^(4/3)), where R☉ is the Sun’s radius, 695,700 km, and M is the mass in Suns. Worked for 1 Sun: 0.0131 × 695,700 = ${Math.round(steps.scaleKm).toLocaleString('en-US')} km; 1^(−1/3) = ${steps.massFactor.toFixed(4)}; (1 ÷ 1.44)^(4/3) = ${steps.limitTerm.toFixed(4)}; √(1 − ${steps.limitTerm.toFixed(4)}) = ${steps.squeezeFactor.toFixed(4)}; R = ${Math.round(steps.scaleKm).toLocaleString('en-US')} × ${steps.massFactor.toFixed(4)} × ${steps.squeezeFactor.toFixed(4)} = ${Math.round(steps.radiusKm).toLocaleString('en-US')} km. This is the page’s own fit, given and not derived.`,
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
    1: 'Your guess is drawn on the white dwarf graph (Picture 3) in white, once the run has finished.',
    2: 'Your guess is drawn on the ladder (Picture 1) in white, once the run has finished.',
    3: 'Your guess is drawn on the ladder (Picture 1) in white, once the run has finished.',
  }
  return (
    <p style={notesBox} aria-label={`About question ${n}`}>
      {body[n]}
    </p>
  )
}
