import type { ReactNode } from 'react'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Frontier and Beyond, Experiment 21 (docs/experiments/frontier-and-beyond/21-black-hole-shadow.md).
// STEP 2 (the interface skeleton and the introduction): this file has the title, the status line, the introduction, the new-word list, the collapsed "Words and formulas" panel
// and the "Want to know more?" links. It has no predictions, run, pictures, results, tutor or chapter summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for
// the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. Nothing here says how big either shadow looks in the sky, how the two compare, or how much
// wider than the horizon the shadow is (CLAUDE.md §12): those are the predictions' answers and the run's results. The links that give them away (the ESO page, which shows both images,
// and the papers) are listed only after the run, in a later step. The introduction has no illustration; the pictures come with the run.

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const list = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const

function referenceEntries(): { term: string; meaning: string }[] {
  return [
    { term: 'Black hole shadow', meaning: 'the dark patch that a black hole makes against the glowing gas behind and around it. Light that passes too close to the black hole is pulled in and never reaches us, so that part of the sky looks dark. The shadow is not the black hole itself.' },
    { term: 'Event horizon', meaning: 'the black hole’s edge, the “point of no return”: nothing that crosses it, not even light, can come back out (Black Holes Experiments 1 and 4). This page also says “horizon”.' },
    { term: 'Gas that glows', meaning: 'gas pulled towards a black hole by its gravity. It swirls round the black hole, and as its parts rub against and squeeze each other it gets extremely hot and gives out light, including radio waves. It is this glowing gas that the shadow is seen against. Magnetic fields play a part in the heating, which is more complicated in detail than rubbing and squeezing.' },
    { term: 'The ring', meaning: 'the bright circle in the pictures. It is made by hot, glowing gas close to the black hole, whose light is bent round the black hole by its gravity. The ring is gas that glows. It is not the black hole and not the shadow, but it surrounds the shadow.' },
    { term: 'Angular size', meaning: 'how wide something looks in the sky, measured as an angle. A coin held close to your eye looks big (a large angle) and the same coin across a street looks tiny (a small angle), though the coin itself has not changed. So how big something looks depends on its real width and on how far away it is.' },
    { term: 'Arcsecond and microarcsecond', meaning: 'tiny units of angle. A full circle is 360 degrees, one degree is 60 arcminutes, and one arcminute is 60 arcseconds, so an arcsecond is 1/3600 of a degree. A microarcsecond is a millionth of an arcsecond. This page writes it as “µas”.' },
    { term: 'Radio telescope', meaning: 'a telescope that collects radio waves, a kind of light our eyes cannot see, instead of the light we can see. The Event Horizon Telescope looks at radio waves with a wavelength of about 1.3 millimetres.' },
    { term: 'Telescope array (interferometry)', meaning: 'several telescopes far apart, whose signals are combined by computer so that together they see as sharply as one huge telescope as wide as the distance between them. The Event Horizon Telescope links dishes on several continents, so it acts like a telescope as wide as the Earth.' },
    { term: 'Solar mass', meaning: 'a unit for how heavy stars and black holes are. One solar mass is the mass of the Sun, so “a million solar masses” means a million times as heavy as the Sun. This page also says “Suns”.' },
    { term: 'Parsec, kiloparsec and megaparsec', meaning: 'units for distances between stars and galaxies. One parsec is about 3.26 light-years. A kiloparsec (kpc) is a thousand parsecs and a megaparsec (Mpc) is a million parsecs.' },
    { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “42 ± 3”. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
    { term: 'Gravitational lensing', meaning: 'the bending of light by the gravity of something heavy that lies in its way (Cosmology Experiment 7 and Gravity Experiment 8). Near a black hole the bending is so strong that light can be bent into a full circle.' },
  ]
}

export function BlackHoleShadowExperiment() {
  return (
    <div>
      <h2>Experiment 21 — Can We Photograph a Black Hole’s Shadow? (Event Horizon Telescope)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): there is strong evidence that the Event Horizon Telescope has imaged the glowing rings around two black holes, one in the galaxy M87 and one at
            the centre of our own Milky Way, and that the sizes of those rings are close to what general relativity gives for the black holes’ masses. How closely they match, and so how tightly this tests gravity, is still open,
            because the masses and the link between a ring and a shadow carry their own uncertainty. The numbers, and where each comes from, are shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The question.</strong> A black hole gives out no light of its own, so you cannot photograph it the way you photograph a star. But there is a way to see it, the way you can see a
            person’s outline when they stand in front of a bright window: you see the <em>dark shape against something bright behind it</em>. Here is how that works for a black hole.
          </p>
          <ol style={list}>
            <li>
              <strong>Where the glowing gas comes from.</strong> Space around a black hole is not empty. At the centre of a galaxy there is gas: drifting clouds, and the winds blown off nearby stars.
              The black hole’s gravity pulls this gas inward. The gas does not fall straight in, just as bathwater does not go straight down the plughole. It swirls round the black hole, faster and
              faster, in a crowded stream.
            </li>
            <li>
              <strong>Why the gas glows.</strong> As the gas piles up and swirls, its parts rub against and squeeze each other. Rubbing makes heat, in the same way your hands warm up when you rub
              them together. The gas becomes extremely hot, and anything that hot gives out light. (The Event Horizon Telescope looks at the radio-wave part of that light.) The heating is more
              complicated in detail, and magnetic fields play a part, but rubbing and squeezing is the simple picture.
            </li>
            <li>
              <strong>What the black hole does to that light.</strong> Some of the glowing gas’s light heads towards the black hole. Light that passes at a safe distance is bent by the black hole’s
              gravity but gets away, and some of it reaches us. Light that passes too close is pulled in and never comes out (Black Holes Experiment 4). So a patch of the sky where we would
              expect light from the black hole’s surroundings gives us none.
            </li>
            <li>
              <strong>What we see.</strong> A glowing, swirling ring of gas, with a dark patch in the middle where the captured light would have been. The dark patch is the black hole’s{' '}
              <strong>shadow</strong>. In 2019 and 2022 the Event Horizon Telescope (EHT) made the first pictures of such rings and shadows.
            </li>
          </ol>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>Two questions follow:</p>
          <ul style={list}>
            <li>How big should a black hole’s shadow look in the sky, and what does that depend on?</li>
            <li>Does the size we measure match what general relativity says it should be?</li>
          </ul>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Black Holes Experiment 4 you aimed beams of light past a black hole and saw that light aimed close enough is captured and light aimed wider escapes,
            bent on the way. The shadow is that same capture, seen from far away: it is the circle of directions from which no light reaches us. In Black Holes Experiment 1 you worked out the
            horizon, a black hole’s edge, from its mass. This experiment asks how that looks from Earth.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How big something looks.</strong> How wide something looks in the sky, its <strong>angular size</strong>, depends on two things: how wide it really is, and how far away it is.
            Hold a coin close to your eye and it hides the Moon. Put the same coin on a table across the street and it looks tiny. The coin has not changed, only its distance. Astronomers measure
            angular size in angles. A full circle is 360 degrees, a degree is 3,600 arcseconds, and a <strong>microarcsecond</strong> (µas) is a millionth of an arcsecond. That is a very small angle.
            For comparison, the European Southern Observatory says that the black hole at the centre of our galaxy looks, from Earth, no bigger than a doughnut would on the surface of the Moon.
          </p>
          <p style={paragraph}>
            So the size of a black hole’s shadow in our sky depends on <em>both</em> of these: how big the shadow really is, and how far away the black hole is.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why an Earth-sized telescope.</strong> A telescope’s sharpness depends on how wide it is compared with the wavelength it observes. A rough rule is that the smallest angle it can
            separate is the wavelength divided by the width (in the same units, giving an angle in radians). The EHT observes radio waves with a wavelength of about 1.3 millimetres (a frequency of
            230 gigahertz). A single dish tens of metres wide is far too blurry. But dishes on several continents, with their signals combined, act like one telescope as wide as the Earth,
            about 12,700 kilometres. Put in numbers:
          </p>
          <ul style={list}>
            <li>1.3 millimetres is 0.0013 metres, and 12,700 kilometres is 12,700,000 metres;</li>
            <li>0.0013 ÷ 12,700,000 is about 1 × 10⁻¹⁰ in radians, which is about 20 millionths of an arcsecond.</li>
          </ul>
          <p style={paragraph}>
            So an Earth-sized telescope at this wavelength can just pick out features a few tens of microarcseconds across. Nothing smaller than the Earth would do. (This is a rough rule, not
            the EHT’s own calculation.)
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The two black holes.</strong> The EHT has imaged two black holes, which differ enormously in mass and in distance:
          </p>
          <ul style={list}>
            <li>
              <strong>Sagittarius A*</strong> (said “Sagittarius A-star”) is at the centre of the Milky Way, our own galaxy, about 8.15 kiloparsecs away (roughly 27,000 light-years). Its mass is about
              4 million times the mass of the Sun (4.0 million, with a give-or-take of about +1.1 and −0.6 million).
            </li>
            <li>
              <strong>M87*</strong> is at the centre of a giant galaxy called M87, about 16.8 megaparsecs away (roughly 55 million light-years). Its mass is about 6.5 billion times the mass of the
              Sun (6.5 billion, with a give-or-take of about 0.7 billion).
            </li>
          </ul>
          <p style={paragraph}>
            So one is far heavier than the other, and also far farther away. Whether that makes its shadow look bigger or smaller in our sky is the first question you will be asked to guess.
          </p>

          <p style={paragraph}>
            <strong>What is the dark patch? Start with what we see.</strong> When you look at the photograph, you see a bright ring of glowing gas and, in the middle, a patch that is dark. The
            question is why that middle patch is dark.
          </p>
          <p style={paragraph}>
            <strong>Why a spot in a picture is dark.</strong> A spot in a picture is dark when no light comes from that direction to our telescope. So the dark patch is a part of the sky where no
            light reaches us.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why no light reaches us from there.</strong> Think of the glowing gas as lots of tiny lamps. Each lamp sends light out in every direction. Imagine the black hole sits between those
            lamps and us:
          </p>
          <ol style={list}>
            <li>Some light from the lamps goes towards the black hole.</li>
            <li>Light that passes the black hole at a safe distance is bent by its gravity but carries on, and some of it reaches our telescope. That is the bright ring.</li>
            <li>Light that passes too close is captured. It falls in and never comes out, so it never reaches us.</li>
          </ol>
          <p style={paragraph}>
            So when we look at the sky, there is a round region where the light that should have arrived was captured on the way. It is as if a piece of the light was removed.
          </p>
          <p style={paragraph}>
            <strong>So the dark patch is not an object.</strong> It is not the black hole, and it is not a hole in space. It is the place in our view where light is missing, because the black hole
            captured it. We call it the black hole’s <strong>shadow</strong> because it is the dark patch the black hole causes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Two pictures that may help.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Ordinary shadow:</strong> a tree blocks sunlight, so the ground behind it is dark. The dark patch is where the tree took away the light.
            </li>
            <li>
              <strong>Black hole shadow:</strong> the black hole captures light, so a patch of the sky is dark. The dark patch is where the black hole took away the light.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>One thing to keep separate.</strong> The black hole’s edge (the event horizon) and the dark patch are two different things. Light has to be captured from some distance out from
            the black hole, not only at the edge itself. How the size of the dark patch compares with the size of the edge is one of the questions you will be asked to guess.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The ring and the shadow are two different things.</strong> The telescope photographs one of them. This page calculates the other.
          </p>
          <ul style={list}>
            <li>
              <strong>The ring is what the telescope photographs.</strong> It is the bright circle of glowing gas. We can measure how wide it looks.
            </li>
            <li>
              <strong>The shadow is the dark patch inside the ring.</strong> The telescope does not photograph it directly. This page calculates its size from the black hole’s mass and distance,
              using one formula.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>Why the ring’s size and the shadow’s size need not be the same number.</strong> Think of a glowing doughnut. The doughnut is the ring of gas, and the hole in the middle is the
            shadow. The width of the hole and the width of the doughnut are related, but they are not the same number. The gas is also thick and its glow is not perfectly even, so the ring’s measured
            width does not have to equal the shadow’s calculated width exactly. The EHT teams use computer models of the glowing gas to work out how the two are related. This page sets the measured
            ring beside the calculated shadow, and the results show how close they are.
          </p>
          <p style={paragraph}>
            <strong>Does the ring change?</strong> The brightness around the ring changes from year to year, because the gas keeps churning, like the bright patches in a flame that move while the
            flame stays in one place. The ring’s size, though, has stayed the same in the pictures taken in 2017, 2018 and 2021.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> The two rings have been measured, and their sizes are close to general relativity’s predictions for those masses. How close, in
            terms of the measurements’ own give-or-takes, is shown in the results. Later EHT results (2017, 2018 and 2021 data of M87*) show the ring’s size staying the same while its pattern of bright patches changes. How exactly this
            tests gravity is still being worked out, because the masses and the link between ring and shadow have their own uncertainties. This page says which is which.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Shadow</strong>, <strong>event horizon</strong>, <strong>the ring</strong> and <strong>gas that glows</strong>: the dark patch, the black hole’s edge, the bright circle, and the hot gas that makes it.
              </li>
              <li>
                <strong>Angular size</strong>, <strong>arcsecond</strong> and <strong>microarcsecond</strong>: how big something looks in the sky, and the units for it.
              </li>
              <li>
                <strong>Radio telescope</strong> and <strong>telescope array</strong>: how the EHT works.
              </li>
              <li>
                <strong>Solar mass</strong>, <strong>parsec</strong>, <strong>give-or-take</strong> and <strong>gravitational lensing</strong>: units and ideas from earlier experiments.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment uses the masses, distances and ring sizes that the EHT teams published, with their give-or-takes, and one formula for the size of the
            shadow of a black hole that is not spinning. It does not model the glowing gas, the telescope, how the pictures are made, or the effect of spin on the shadow. The answers to the predictions
            you will make are not given here.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The EHT’s papers and the pages that show
            both pictures side by side are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://www.nasa.gov/universe/black-hole-image-makes-history-nasa-telescopes-coordinated-observations/">NASA: Black Hole Image Makes History</ExternalLink>: NASA’s
              account of the first image of a black hole’s shadow, in M87, how it was made with telescopes around the world, and how NASA’s X-ray telescopes helped.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/stories/quick-reads/black-holes-seeing-the-invisible/">NASA: Black Holes, Seeing the Invisible</ExternalLink>: how
              astronomers find black holes even though they give out no light, including the EHT’s image, stars orbiting the black hole at the centre of our galaxy, and gravitational waves.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          The predictions, the run, the pictures, the results and the tutor are built in later steps.
        </p>
      </div>
    </div>
  )
}
