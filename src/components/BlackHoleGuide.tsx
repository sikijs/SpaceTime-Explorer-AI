import type { CSSProperties, ReactNode } from 'react'
import { horizonRadiusKm } from '../physics/blackHoleSizeExperiment'

// An optional, on-demand background guide to black holes (written at the owner's request on 2026-10-10).
// It adds no physics to the experiment: every size in the table below is computed with the experiment's own
// horizonRadiusKm, and everything else is plain-language background taken from the sources listed at the end.

const KM_PER_AU = 149_597_870.7

// A length in plain units, to two or three significant figures.
function lengthLabel(km: number): string {
  if (km < 1000) return `${Number(km.toPrecision(3))} km`
  if (km < 1e6) return `${Number(km.toPrecision(3)).toLocaleString('en-US')} km`
  if (km < 1e9) return `${Number((km / 1e6).toPrecision(3))} million km`
  return `${Number((km / 1e9).toPrecision(3))} billion km (${Number((km / KM_PER_AU).toPrecision(3))} AU)`
}

const bodyStyle: CSSProperties = { marginTop: 0, marginBottom: '0.75rem' }
const headingStyle: CSSProperties = { margin: '1.25rem 0 0.5rem 0', fontSize: '1rem', color: 'var(--text)' }
const cellStyle: CSSProperties = { padding: '0.35rem 0.6rem', borderBottom: '1px solid var(--border-color, #ccc)', textAlign: 'left', verticalAlign: 'top' }

function P({ children }: { children: ReactNode }) {
  return <p style={bodyStyle}>{children}</p>
}

function H({ children }: { children: ReactNode }) {
  return <h4 style={headingStyle}>{children}</h4>
}

// Real or illustrative masses used only to compute the size table below.
const TABLE_ROWS: Array<{ kind: string; example: string; massLabel: string; massSolar: number; how: string }> = [
  {
    kind: 'Stellar-mass',
    example: 'A typical one',
    massLabel: 'about 10 Suns (illustrative)',
    massSolar: 10,
    how: 'The collapsed core of a massive star',
  },
  {
    kind: 'Stellar-mass',
    example: 'Gaia BH3',
    massLabel: 'about 33 Suns',
    massSolar: 33,
    how: 'Heaviest known of its kind in our galaxy; about 2,000 light-years away',
  },
  {
    kind: 'Intermediate-mass',
    example: 'Omega Centauri (strong candidate)',
    massLabel: 'about 8,200 Suns',
    massSolar: 8200,
    how: 'Evidence from fast stars at the center of a star cluster (Hubble, 2024)',
  },
  {
    kind: 'Supermassive',
    example: 'Sagittarius A*',
    massLabel: 'about 4.3 million Suns',
    massSolar: 4.3e6,
    how: 'At the center of our own galaxy',
  },
  {
    kind: 'Supermassive',
    example: 'M87*',
    massLabel: 'about 6.5 billion Suns',
    massSolar: 6.5e9,
    how: 'At the center of the galaxy M87; the first black hole ever imaged',
  },
]

export function BlackHoleGuide() {
  return (
    <details
      className="exp-card"
      style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}
    >
      <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>
        Optional reading: a guide to black holes (open it only if you want to know more)
      </summary>

      <div style={{ marginTop: '1rem' }}>
        <P>
          <strong>About this guide.</strong> You do not need it to use the experiment. It is background
          reading for anyone who wants a fuller picture of what black holes are, how they form, how we know
          they exist, and what is still unknown. It is written in plain language and draws on the sources
          listed at the end, up to the latest results we found (mid-2026). Science keeps moving, so the "recent
          findings" section will date.
        </P>

        <H>1. The big idea</H>
        <P>
          A black hole is a place where so much mass is packed into so small a space that gravity there is
          too strong for anything to escape, including light. That is all the name means. Nothing about it is
          magic: it follows from gravity, which pulls harder the more mass there is and the closer you are to
          it. Squeeze a mass small enough, and the pull at its surface becomes so strong that the speed
          needed to get away is faster than the speed of light. Since nothing can travel faster than light,
          nothing gets away. You saw this idea, with made-up numbers, in Gravity and Curved Spacetime,
          Experiment 7.
        </P>
        <P>
          Light does not escape, so no light comes from the black hole itself. That is why it looks black,
          and why for a long time black holes were only an idea in equations. Today we have direct evidence
          that they exist (section 6).
        </P>

        <H>2. The parts of a black hole</H>
        <P>
          <strong>The horizon.</strong> The "edge" of a black hole is called its horizon. It is not a solid
          surface. If you flew toward one, you would not hit anything. The horizon is a boundary in space: on
          the outside, light and spacecraft can still get away if they try hard enough; on the inside,
          nothing can, whichever way it is aimed. Everything you can do inside only leads deeper. Because it
          only works in one direction, the horizon is called a one-way boundary. The horizon radius you used
          in this experiment is the distance from the middle to the horizon.
        </P>
        <P>
          <strong>The singularity.</strong> At the very middle, the equations of Einstein's theory of gravity
          say that all of the mass is squeezed to a single point of infinite density. Most physicists read
          that as a sign that the theory stops working there, not as something that really exists. To
          describe the middle properly we would need a theory that joins gravity with quantum physics, and we
          do not have one yet. This is one of the biggest open questions (section 9).
        </P>
        <P>
          <strong>What a black hole is "made of."</strong> Strangely, once a black hole has settled down, only
          three things about it matter from outside: its mass, how fast it spins, and its electric charge
          (which is usually close to zero). Two black holes with the same three numbers are identical, no
          matter whether one was made from stars and the other from gas. Physicists call this the "no-hair"
          idea: the black hole has no other features to tell them apart.
        </P>
        <P>
          <strong>Spin.</strong> Almost everything in space spins, and a star that collapses into a black
          hole spins faster as it shrinks, in the same way that a skater spins faster when they pull their
          arms in. So real black holes usually spin, sometimes very fast. A spinning black hole drags the
          space around it along with it, and has a slightly different shape of horizon from the simple,
          non-spinning one used in this experiment.
        </P>
        <P>
          <strong>The glowing disk and the jets.</strong> Gas that falls toward a black hole does not drop
          straight in. Like water going down a drain, it swirls around, forming a flat spinning disk called
          an <strong>accretion disk</strong>. Gas in the disk rubs against other gas, speeds up, and heats to
          millions of degrees, so it glows brightly, often in X-rays. This glow comes from the gas just
          outside the horizon, not from the black hole. Some black holes also fire narrow beams of fast
          particles, called <strong>jets</strong>, far out into space. The galaxy M87 has a famous jet,
          thousands of light-years long, coming from its central black hole. Magnetic fields near the black
          hole help launch the jets. How exactly they do this is still being worked out.
        </P>

        <H>3. How black holes form</H>
        <P>
          <strong>From a dying star (stellar-mass black holes).</strong> A star holds itself up by a
          balance. Gravity pulls its material in. The heat and pressure from nuclear reactions in its core
          push out. For millions or billions of years the two are equal. When the fuel in the core runs out,
          the push weakens, and gravity wins: the core collapses in a fraction of a second, and the outer
          layers are thrown off in a huge explosion called a <strong>supernova</strong>. What is left is a
          compact core. A smaller one becomes a <strong>neutron star</strong>, a ball a few kilometers
          across, so dense that a teaspoon of it would weigh billions of tons.
          But if the leftover core is heavy enough, nothing known can stop the collapse and it becomes a
          black hole. NASA gives about 8 Suns as roughly the minimum mass of a star that ends this way. Stars
          lighter than that, including our Sun, end up as quieter objects: the Sun will become a small,
          hot, faded star called a white dwarf in about five billion years. It will never be a black hole,
          because it does not have enough mass.
        </P>
        <P>
          A stellar-mass black hole can also form, or grow, another way: a neutron star can pick up extra
          material from a companion star or from another neutron star until it is too heavy to stay a neutron
          star, and it collapses. And two black holes can merge into a bigger one (section 6).
        </P>
        <P>
          <strong>Supermassive black holes.</strong> These weigh hundreds of thousands to billions of Suns
          and sit at the centers of most large galaxies, including ours. How they came to be so big is not
          settled. Part of the answer is that they grow: by swallowing gas, by tearing apart stars that stray
          too close, and by merging when their galaxies collide. But some were already enormous when the
          universe was less than a billion years old, which does not leave much time to grow from a small
          start. The main ideas are that they started from heavier "seeds" than a normal star's core (for
          example, a huge gas cloud collapsing directly into a black hole, or the remains of the first very
          massive stars), or that they sometimes grow much faster than the usual limit (section 8). Which of
          these happened, and how often, is an active research question.
        </P>
        <P>
          <strong>Intermediate-mass black holes.</strong> There is a gap between stellar-mass and
          supermassive ones: black holes of about a hundred to a few hundred thousand Suns. They would
          be the "missing link" in the story, and are hard to find. A few strong candidates exist, including
          one in the star cluster Omega Centauri (section 8).
        </P>
        <P>
          <strong>Primordial black holes (an idea, not a discovery).</strong> Some theories propose that
          tiny black holes could have formed in the first second of the universe, from the dense, hot
          matter of that time. No clear evidence for them has been found, and they remain a hypothesis.
        </P>

        <H>4. Sizes: how big is a horizon?</H>
        <P>
          The horizon radius is directly proportional to the mass: about 2.95 kilometers for each Sun's worth
          of mass (this is the formula 2GM/c² that the experiment uses). So a black hole with ten times the
          mass has a horizon ten times as wide, and one with a million times the mass has a horizon a million
          times as wide. The table below uses that formula, with the experiment's own calculation.
        </P>
        <div style={{ overflowX: 'auto', marginBottom: '0.75rem' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: '520px', width: '100%', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th style={cellStyle}>Kind</th>
                <th style={cellStyle}>Example</th>
                <th style={cellStyle}>Mass</th>
                <th style={cellStyle}>Horizon radius</th>
                <th style={cellStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map((row) => (
                <tr key={row.example}>
                  <td style={cellStyle}>{row.kind}</td>
                  <td style={cellStyle}>{row.example}</td>
                  <td style={cellStyle}>{row.massLabel}</td>
                  <td style={cellStyle}>{lengthLabel(horizonRadiusKm(row.massSolar))}</td>
                  <td style={cellStyle}>{row.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          Notice that a stellar-mass black hole is only as wide as a small city, while the one in M87 is
          bigger than our whole Solar System (Neptune is only about 30 AU from the Sun). Sizes this
          different have surprising consequences. For example, because a huge mass has a huge volume inside
          its horizon, the largest black holes, averaged over that volume, are less dense than water. (This is
          the average over the volume, and does not describe the middle, where the theory says the density is
          far greater.)
        </P>
        <P>
          Astronomers think there could be around 100 million stellar-mass black holes in our galaxy alone,
          although only about fifty have been confirmed (NASA's figures). Most are invisible, because they
          have nothing nearby to light up.
        </P>

        <H>5. What black holes are not</H>
        <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>They are not cosmic vacuum cleaners.</strong> Far away, a black hole pulls just like any
            other object of the same mass. If the Sun were swapped for a black hole of the same mass, the
            planets would keep orbiting as before (it would get dark and cold, of course). A black hole only
            has its strange effects very close to it.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>They are not holes.</strong> A black hole is a region of space with a huge amount of
            mass in it, not an empty hole or tunnel.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>They do not break the laws of physics.</strong> They are a consequence of the laws, as
            understood today. Only at the very middle do the laws we have stop giving answers.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>They are not all alike.</strong> They range from about the mass of a few Suns to tens of
            billions of Suns.
          </li>
        </ul>

        <H>6. How do we know they exist?</H>
        <P>
          For decades the evidence was indirect, and it kept getting stronger. Today there are four
          independent kinds.
        </P>
        <P>
          <strong>(a) Stars that orbit something invisible.</strong> Gravity makes stars circle a heavy
          object, and the faster and tighter the orbit, the more mass in the middle. For about thirty years,
          two teams tracked individual stars around the center of our galaxy and found them whipping around
          an invisible point at thousands of kilometers per second, which needs about 4 million Suns' mass in
          a space not much bigger than our Solar System. In 2020 Reinhard Genzel and Andrea Ghez shared the Nobel Prize
          in Physics for this, together with Roger Penrose, who showed that black holes are a real
          prediction of Einstein's theory. The same method found Gaia BH3, a 33-Sun black hole whose
          nearby companion star wobbles because of it (2024), and more.
        </P>
        <P>
          <strong>(b) Glowing gas.</strong> X-ray telescopes see the hot gas in accretion disks. Cygnus X-1,
          a 21-Sun black hole in our galaxy, is a famous example: it pulls gas from a companion star and
          lights up in X-rays. Far brighter are <strong>quasars</strong>, supermassive black holes feeding so
          fast that they outshine whole galaxies, visible across most of the universe.
        </P>
        <P>
          <strong>(c) Gravitational waves.</strong> When two black holes spiral together and merge, they send
          out ripples in spacetime (see the Gravitational Waves chapter). In 2015 the LIGO detectors caught
          the first one, from two black holes of about 36 and 29 Suns merging more than a billion light-years
          away. Since then, hundreds of mergers have been detected. The loudest and clearest so far, GW250114
          (detected in January 2025), came from black holes of about 33 and 32 Suns merging into one of about
          62. It was so clear that scientists could check a prediction made by Stephen Hawking in 1971: the
          total area of the horizons can never decrease in a merger. The measurement agreed, with very high
          confidence.
        </P>
        <P>
          <strong>(d) Pictures.</strong> The Event Horizon Telescope links radio telescopes around the world
          into one giant "virtual" telescope. In 2019 it released the first image of a black hole's
          surroundings, M87*, and in 2022 the one at the center of our own galaxy, Sagittarius A*. Each shows a
          glowing ring of hot gas around a dark central patch, the black hole's shadow. Its size matches
          what Einstein's theory predicts for the masses known from other measurements. In 2024 the team
          added pictures in polarized light (light whose waves wiggle in a particular direction, which shows
          magnetic fields). They showed strong, organized magnetic fields spiraling near the edge of
          Sagittarius A*, strikingly like those of M87*, even though M87* is more than a thousand times
          bigger.
        </P>

        <H>7. What happens near a black hole, and inside</H>
        <P>
          <strong>Time slows down.</strong> The nearer you are to a black hole, the slower your clock runs
          as seen from far away. You saw this effect in a gentle form in Gravity and Curved Spacetime,
          Experiments 2 and 9. Close to a horizon it becomes extreme: to a distant observer, someone falling
          in seems to slow down and fade as they approach the horizon, never quite seeming to reach it. The
          person falling in notices nothing odd about their own clock, and crosses the horizon in a finite
          time. Later experiments in this group are planned to show this properly. This guide only describes
          it.
        </P>
        <P>
          <strong>Light bends and objects orbit.</strong> Light passing near a black hole bends, as in
          Gravity Experiment 8. Very near the black hole, light can even circle it. This bending is what gives
          the glowing ring in the Event Horizon Telescope images. Things can orbit a black hole just as
          planets orbit the Sun, but close in, the orbits are no longer stable: past a certain distance
          anything that does not move fast enough falls in.
        </P>
        <P>
          <strong>Tidal forces.</strong> Gravity pulls harder on the nearer part of an object than on the
          farther part (Gravity Experiment 3). Near a small black hole, the difference across your body would
          be so large that you would be stretched into a long thin shape long before reaching the horizon,
          sometimes called "spaghettification." Near a supermassive black hole, the horizon is so large that
          the stretching at the horizon is gentle, and you could cross it without feeling anything unusual,
          although you could never come back.
        </P>
        <P>
          <strong>Hawking radiation.</strong> In 1974 Stephen Hawking showed, by combining quantum physics
          with gravity, that a black hole should give off a very faint glow, and so slowly lose mass. For black
          holes of the sizes found in space, the glow is far weaker than the cold background of the
          universe, so they actually take in more than they give out, and the effect has never been
          measured. If nothing fed them, such a black hole would take far longer than 10⁶⁰ years to
          evaporate, vastly longer than the universe's present age of about 14 billion years. Hawking
          radiation matters as an idea, because it ties together gravity, quantum physics and heat, and it
          raises a puzzle about what happens to the information that fell in (the "information paradox"),
          which is still unsolved.
        </P>

        <H>8. Recent findings (2024 to mid-2026)</H>
        <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>A likely intermediate-mass black hole (2024).</strong> Using more than 500 Hubble images
            taken over twenty years, astronomers tracked fast-moving stars in the middle of the star cluster
            Omega Centauri. Their motion points to a black hole of about 8,200 Suns, a strong candidate for
            the long-sought middle class.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>The heaviest stellar black hole in our galaxy, close by (2024).</strong> Gaia BH3, found
            when a star was seen wobbling in data from the Gaia satellite, weighs about 33 Suns and is about
            2,000 light-years away, one of the closest known. It is not feeding on anything, so it gives off
            no glow: it was found only by its pull on its companion.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>Magnetic fields at the edge of Sagittarius A* (2024).</strong> The Event Horizon
            Telescope's polarized images showed strong, organized magnetic fields, as described above.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>The clearest gravitational-wave signal yet (2025).</strong> GW250114 (see above)
            confirmed Hawking's area rule with great accuracy.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>A black hole growing too fast (reported January 2026).</strong> A quasar seen as it was
            about 12 billion years ago appears to be taking in matter at about 13 times what is called the
            Eddington limit. That limit is the rate at which, by the usual theory, the glow of the falling gas
            should push incoming gas away and slow the feeding. The same object also makes X-rays and radio
            jets, a combination theory says should not happen together. The authors suggest it is a brief,
            unstable growth spurt. If so, fast bursts like this might help explain how black holes grew
            enormous so early.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>The Webb telescope and the "little red dots" (2023 to 2026).</strong> The James Webb Space
            Telescope found hundreds of small, red, very compact objects in the young universe. Astronomers
            now think many are growing black holes wrapped in gas. In 2026 a team reported an object called
            MoM-BH*-1, seen just a few hundred million years after the Big Bang, that they call a "black hole
            star": a black hole of about 100,000 Suns inside a huge envelope of gas, glowing like a star the
            size of the Solar System. They say such objects could explain many of the little red dots, and
            suggest that massive black holes formed early and commonly. They describe their understanding of
            the object as still developing quickly.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>Wandering black holes (2026).</strong> Astronomers reported spotting a dormant
            supermassive black hole far from the center of its galaxy, revealed only when it tore apart a
            passing star and produced a brief, bright flare. It suggests that such flares can be used to find
            black holes that are otherwise invisible.
          </li>
        </ul>

        <H>9. What is still unknown</H>
        <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>What is at the center?</strong> Einstein's theory points to a singularity, but it is
            probably a sign that a new theory, joining gravity with quantum physics, is needed.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>What happens to information that falls in?</strong> The information paradox is still
            unsolved.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>How did the first supermassive black holes get so big so fast?</strong> Heavy seeds, fast
            growth, or both: the new Webb results are changing the picture.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>How common are intermediate-mass black holes, and how do they form?</strong>
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>Do primordial black holes exist?</strong> And could some of the unseen mass in the
            universe (Cosmology, Experiment 4) be made of them? Nobody knows.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>How do jets form?</strong> Magnetic fields and spin are involved, but the details are
            still being worked out.
          </li>
        </ul>

        <H>10. In one paragraph</H>
        <P>
          A black hole is what is left when enough mass is squeezed inside its own horizon radius, so that
          not even light can get out. They are made when massive stars die, and they grow by merging and
          feeding; the largest, with millions or billions of Suns, sit in galaxy centers, and how they got
          so big is still a puzzle. We know they exist from stars circling invisible masses, from glowing gas,
          from the ripples of colliding black holes, and now from pictures. Far away they pull like any other
          mass; close in, time slows, light bends, and a one-way horizon marks the point of no return. What is
          at the very middle, and what happens to what falls in, is still unknown.
        </P>

        <H>Sources</H>
        <P>
          Facts in this guide come from the following, read in October 2026. The statements on spin, the
          no-hair idea, jets, tidal stretching, Genzel, Ghez and Penrose's Nobel Prize, the first
          gravitational-wave detection in 2015, the Event Horizon Telescope's 2019 and 2022 images, the
          Sun's future, and the account of how stars end are standard textbook knowledge, not taken from the
          pages below.
        </P>
        <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
          <li>
            NASA,{' '}
            <a href="https://science.nasa.gov/universe/black-holes/types" target="_blank" rel="noreferrer">
              Black Hole Types
            </a>{' '}
            (the four kinds, mass ranges, about 50 confirmed and about 100 million estimated in our galaxy).
          </li>
          <li>
            NASA,{' '}
            <a href="https://www.nasa.gov/universe/what-are-black-holes" target="_blank" rel="noreferrer">
              What Are Black Holes?
            </a>
          </li>
          <li>
            NASA / Space Telescope Science Institute,{' '}
            <a
              href="https://www.stsci.edu/contents/news-releases/2024/news-2024-015"
              target="_blank"
              rel="noreferrer"
            >
              Hubble finds strong evidence for an intermediate-mass black hole in Omega Centauri
            </a>{' '}
            (2024).
          </li>
          <li>
            ESA,{' '}
            <a href="https://www.cosmos.esa.int/web/gaia/iow_20240416" target="_blank" rel="noreferrer">
              Gaia BH3
            </a>{' '}
            (2024).
          </li>
          <li>
            Event Horizon Telescope Collaboration, polarized images of Sagittarius A* (March 2024),{' '}
            <a href="https://clok.uclan.ac.uk/51012/1/Akiyama_2024_ApJL_964_L25.pdf" target="_blank" rel="noreferrer">
              Astrophysical Journal Letters 964, L25
            </a>
            .
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/GW250114" target="_blank" rel="noreferrer">
              GW250114
            </a>{' '}
            (summary page) and{' '}
            <a
              href="https://en.unimib.it/node/3938"
              target="_blank"
              rel="noreferrer"
            >
              University of Milano-Bicocca news
            </a>{' '}
            on the area theorem test (2025).
          </li>
          <li>
            MIT News,{' '}
            <a
              href="https://news.mit.edu/2026/astronomers-discover-brand-new-type-astrophysical-object-black-hole-star-0812"
              target="_blank"
              rel="noreferrer"
            >
              Astronomers discover a brand-new type of astrophysical object: a black hole star
            </a>{' '}
            (August 2026).
          </li>
          <li>
            ScienceDaily,{' '}
            <a
              href="https://www.sciencedaily.com/releases/2026/01/260124003816.htm"
              target="_blank"
              rel="noreferrer"
            >
              Astronomers found a black hole growing way too fast
            </a>{' '}
            (January 2026).
          </li>
          <li>
            Phys.org,{' '}
            <a
              href="https://phys.org/news/2026-07-astronomers-universe-rarest-black-hole.html"
              target="_blank"
              rel="noreferrer"
            >
              Astronomers identify one of the universe's rarest black hole events
            </a>{' '}
            (July 2026; known to us only from a search summary).
          </li>
          <li>
            Hawking radiation and the information paradox:{' '}
            <a href="https://arxiv.org/pdf/1402.5127" target="_blank" rel="noreferrer">
              Black holes and thermodynamics, the first half century
            </a>{' '}
            and{' '}
            <a href="https://arxiv.org/pdf/2207.09421" target="_blank" rel="noreferrer">
              A Modest View of the Black Hole Information Paradox
            </a>{' '}
            (not read in full).
          </li>
        </ul>
      </div>
    </details>
  )
}
