import type { ReactNode } from 'react'
import {
  CEILING_EFFICIENCY,
  FUSION_EFFICIENCY,
  J0529_LUMINOSITY_SOLAR,
  PART_ONE_LUMINOSITY_SOLAR,
  PART_ONE_SPIN,
  SUN_LUMINOSITY_W,
  SPEED_OF_LIGHT,
  SECONDS_PER_YEAR,
  SUN_MASS_KG,
  infallEfficiency,
  j0529RateCheck,
  lightDayAU,
  lightPerKilogramRatio,
  runQuasarExperiment,
} from '../physics/quasarBrightness'
import { paragraph } from './TidalEffectExperiment'
import { formatNumber, formatPercent, powerOfTen, scientific } from './QuasarBrightnessFormat'

// Black Holes, Experiment 11 (quasars), Step 3: the introduction, the links, the held-back section and the words box
// (docs/experiments/black-holes-and-strong-gravity/11-why-do-quasars-outshine-galaxies.md, "Introduction"). Wording approved by the owner on 2026-11-21
// (CLAUDE.md §28.1). The introduction keeps clear of what the page will ask the learner to predict (CLAUDE.md §12): it does not give 3C 273's brightness,
// the Milky Way's brightness, the size limit, the mass that must fall in each year, or fusion's share of mass turned to light. Those, the record-breaking
// quasar and the latest results appear only after the first Run (QuasarBrightnessHeldBack and the held-back links). Nothing in the drawings is white:
// white is kept for the learner's guess marks (Step 4).

const BASE = import.meta.env.BASE_URL
const HUBBLE_3C273_IMAGE = `${BASE}images/quasars/3c273-hubble-potw1346a.jpg`
const HOSTS_IMAGE = `${BASE}images/quasars/quasar-hosts-hubble-opo9635a.jpg`
const GLARE_IMAGE = `${BASE}images/quasars/3c273-hubble-coronagraph-nasa-2024.jpg`
const ENGINE_IMAGE = `${BASE}images/quasars/black-hole-disk-eso1515a.jpg`
const CHANDRA_IMAGE = `${BASE}images/quasars/3c273-jet-chandra-0131.jpg`

const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#0b1020',
} as const

const ol = { marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' } as const
const ul = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const
const credit = { fontSize: '0.75rem' } as const
const linkItem = { marginBottom: '0.35rem' } as const

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

export function QuasarBrightnessIntro() {
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> Our galaxy, the Milky Way, holds about a hundred billion stars. Now picture one single point of light, so far away that even the
        best telescopes show it as a dot, that gives out more light than a whole galaxy of stars. Astronomers found the first of these in 1963 and named them{' '}
        <strong>quasars</strong>. This experiment asks: <strong>how can something so small shine brighter than a whole galaxy?</strong>
      </p>
      <p style={paragraph}>
        <strong>What that picture means, in plain words.</strong> There are three different things here, and it helps to keep them apart.
      </p>
      <ul style={{ ...paragraph, paddingLeft: '1.25rem' }}>
        <li>
          <strong>How bright it looks from here.</strong> Very faint. A quasar looks like one dim star, a dot, because it is extremely far away. The first one found,
          3C 273, which this page uses, is about 2.5 billion light-years away. (A <em>light-year</em> is the distance light travels in a year, nearly 10 trillion kilometers.)
          Distance dims light: a lighthouse on the horizon looks like a faint dot, and the same lighthouse, seen from a boat beside it, is dazzling.
        </li>
        <li>
          <strong>How much light it really gives out.</strong> Astronomers can work this out, because they know how far away it is and how bright it looks. The answer is
          that, to look even this bright from so far away, it must give out a huge amount of light every second. That total amount of light given out is called its{' '}
          <strong>luminosity</strong>. We count it in <strong>Suns</strong>: a luminosity of 1 Sun means the same light as our own Sun gives out.
        </li>
        <li>
          <strong>The comparison with a galaxy.</strong> The Milky Way’s hundred billion stars each give out some light, and together they give out the galaxy’s luminosity.
          A quasar’s luminosity is bigger than that. So it is not that the quasar looks brighter in the sky. It is that, side by side at the same distance, the one point
          would be brighter than all the stars of the galaxy added up. Think of one floodlight that out-shines every street lamp in a city put together.
        </li>
      </ul>
      <p style={paragraph}>
        The word <em>small</em> matters too, and the page comes back to it: how small the source can be is something we can work out from how its light changes, and it is
        one of the two puzzles this experiment lets you check.
      </p>
      <p style={paragraph}>
        <strong>Why even ask this.</strong> We expect more light from something bigger. A candle flame gives a little light, a street lamp more, a stadium’s floodlights
        more, and a whole city at night, with its millions of lights, gives the most of all. Now imagine that in the middle of that city there is one spot that out-shines
        the entire city put together. You would want to know what it is, and you would not believe the answer until you had checked where the light comes from. That is
        the story of quasars. This page lets you check it with real numbers.
      </p>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Four ideas to start from.</strong>
      </p>
      <ol style={ol}>
        <li>
          <strong>A galaxy.</strong> A galaxy is a huge family of stars, gas and dust held together by gravity. Our Sun is one of the Milky Way’s stars. The light of a
          galaxy is the light of all its stars added together.
        </li>
        <li>
          <strong>Counting brightness in “Suns”.</strong> To compare very different things, astronomers use our Sun as the unit. “1 Sun” means as much light as our own
          Sun gives out. Something of “10 Suns” gives out ten times as much. Astronomers call the light something gives out its <strong>luminosity</strong>, and this page
          just says “brightness” and “Suns”.
        </li>
        <li>
          <strong>A black hole.</strong> You met black holes in the earlier chapters of this group. A black hole gives out no light of its own, but gas close to one can
          shine very brightly, as you will see.
        </li>
        <li>
          <strong>A “supermassive” black hole.</strong> The black holes of Black Holes 9 form when a dead star’s core collapses, so they are a few to a few tens of times the mass of our Sun.
          There is a far bigger kind, a <strong>supermassive black hole</strong>, millions to billions of times the Sun’s mass. Many big galaxies have one in the middle,
          including ours (Sagittarius A*, from Black Holes 1). Ours is quiet today because it gets very little gas.
          Quasars are the cases where such a black hole is being fed a lot of gas, so it shines far brighter than the galaxy around it.
        </li>
      </ol>

      <p style={paragraph}>
        <strong>What a quasar looks like.</strong> Through a telescope a quasar looks like a single star: a sharp point of light with nothing around it. The name
        “quasar” is short for “quasi-stellar”, which means “star-like”. Figure 1 shows the first one found, a quasar called <strong>3C 273</strong>.
      </p>

      <Figure
        caption={
          <>
            <strong>Figure 1. 3C 273, the first quasar found, photographed by the Hubble Space Telescope.</strong> The bright point in the middle is the quasar. It looks
            like a star. The cross of thin lines around it is not part of the quasar: it is an effect of the telescope’s mirrors that appears around any very bright
            point. The curved streak at the upper left is a jet of gas shot out from the quasar, about 200,000 light-years long (a <strong>light-year</strong> is the
            distance light travels in a year, about 9.5 trillion kilometers). The quasar is about 2.5 billion light-years away, in the constellation Virgo. The faint
            orange smudges around it are other galaxies.{' '}
            <span style={credit}>
              Image: ESA/Hubble &amp; NASA (<Ext href="https://esahubble.org/images/potw1346a/">esahubble.org/images/potw1346a</Ext>, licence CC BY 4.0).
            </span>
          </>
        }
      >
        <img
          src={HUBBLE_3C273_IMAGE}
          alt="A dark sky with one very bright blue-white point at the center and a thin cross of light spikes through it. A short curved streak lies at the upper left, and a few faint orange galaxies are scattered around."
          width={705}
          height={696}
          style={{ ...imgStyle, maxWidth: 'min(100%, 460px)' }}
        />
      </Figure>

      <p style={paragraph}>
        <strong>Where quasars live.</strong> A quasar is not a lone star in empty space. Each one sits in the middle of a galaxy, the quasar’s “host”. Figure 2 shows six
        of them. Hubble’s caption says that quasars “reside in a variety of galaxies, from normal to highly disturbed”. Hubble does not define the two words in that caption.
        Here, <strong>normal</strong> means a galaxy that looks tidy and regular, with a smooth shape like most galaxies, and <strong>disturbed</strong> means a galaxy that
        looks pulled out of shape, for example lopsided, with a second bright blob close by. NASA’s 2024 Hubble release says Hubble’s 1994 images showed that quasars’
        surroundings are “far more complex than first suspected”, and suggested collisions and mergers between galaxies, which can pull a galaxy out of shape. In each
        picture the bright spot at the center is the quasar. The galaxy around it can be hard to see, because the quasar is so bright. That is the first hint that a quasar can out-shine its galaxy.
      </p>

      <Figure
        caption={
          <>
            <strong>Figure 2. Six quasars, each in the middle of its own galaxy (Hubble Space Telescope).</strong> In every panel the bright spot at the center is the
            quasar, and the fainter glow around it is its galaxy. Some galaxies look tidy, and some look pulled out of shape. The picture is shown in orange and red.{' '}
            <span style={credit}>
              Image: John Bahcall (Institute for Advanced Study), Mike Disney (University of Wales), NASA/ESA (
              <Ext href="https://esahubble.org/images/opo9635a">esahubble.org/images/opo9635a</Ext>, licence CC BY 4.0).
            </span>
          </>
        }
      >
        <img
          src={HOSTS_IMAGE}
          alt="Six square pictures in orange and red, each with a bright spot near the center surrounded by a fainter glow of a galaxy. Some of the surrounding glows are round and tidy and some are lopsided, with a second bright blob close by."
          width={600}
          height={463}
          style={{ ...imgStyle, maxWidth: 'min(100%, 540px)' }}
        />
      </Figure>

      <p style={paragraph}>
        <strong>Hiding the glare.</strong> To look at what is around a quasar, astronomers have to hide the quasar. Figure 3 is Hubble’s newest look at 3C 273, taken in
        2024 with a small mask that blocks the quasar’s glare, the way you hold up your hand to block the Sun and see what is next to it. The black star-shaped patch in
        the middle is the mask. Around it, gas and small blobs show up that the glare would have drowned out.
      </p>

      <Figure
        caption={
          <>
            <strong>Figure 3. 3C 273 with the quasar’s glare blocked (Hubble Space Telescope, December 2024).</strong> The small black star-shaped patch at the center is
            the mask that hides the quasar. The glow around it is gas near the quasar, and a streak of bright knots runs toward the lower right. The picture is shown in
            shades of blue.{' '}
            <span style={credit}>
              Image: NASA, ESA, Bin Ren (Université Côte d’Azur/CNRS); acknowledgment: John Bahcall (IAS); image processing: Joseph DePasquale (STScI) (
              <Ext href="https://science.nasa.gov/asset/hubble/quasar-3c-273-2/">science.nasa.gov/asset/hubble/quasar-3c-273-2</Ext>; NASA content is generally not
              subject to copyright in the United States, and NASA should be acknowledged as the source).
            </span>
          </>
        }
      >
        <img
          src={GLARE_IMAGE}
          alt="A dark blue sky with a glowing white-blue patch at the left-center. A small black star-shaped mask sits in the middle of the glow. A few small blue blobs lie above it, and a line of bright blue knots runs along the lower right edge."
          width={866}
          height={564}
          style={{ ...imgStyle, maxWidth: 'min(100%, 640px)' }}
        />
      </Figure>

      <p style={paragraph}>
        <strong>But if the quasar is brighter than its galaxy, how can anyone see the galaxy, and how do we know it is there?</strong> These are fair questions. The honest
        answer is that the galaxy <em>is</em> hard to see, and astronomers have had to find ways round the glare.
      </p>
      <ul style={{ ...paragraph, paddingLeft: '1.25rem' }}>
        <li>
          <strong>Why it is hard.</strong> NASA’s Webb page says a quasar’s glare makes it “difficult or impossible” to pick out the light of its galaxy, and compares it
          to “looking directly into a car headlight and trying to figure out what kind of automobile it is attached to”. There are other reasons. The galaxy’s light has
          been stretched on its long trip, so light that left as ultraviolet reaches us as infrared. Dust in the galaxy may hide some of its starlight. And, seen from this
          far away, the galaxy takes up only a tiny patch of the sky, so it is hard to separate from the quasar sitting in its middle.
        </li>
        <li>
          <strong>Ways round the glare.</strong> One way is the mask in Figure 3. NASA says Hubble’s instrument can act as a <em>coronagraph</em>, a small mask that blocks
          light from a bright center, like the Moon covering the Sun in a total eclipse. The black patch in Figure 3 is that mask, and it let astronomers look much closer
          to the black hole than before. A second way is a bigger telescope. NASA’s Webb page says the Webb Space Telescope’s larger mirror gives “more than 4 times the
          resolution” of Hubble, and it sees infrared light, which can pass through dust. Those pages describe simulations of what Webb should be able to do, so this is what
          is expected, and not yet a result.
        </li>
        <li>
          <strong>How we know a galaxy is there.</strong> Where the galaxy can be seen, we see it: in Figure 2, each quasar has a glow of its galaxy around it. NASA’s Webb
          page states that quasars “are known to reside at the centers of galaxies”. Figure 3 does not show the whole galaxy. It shows what lies within about 16,000
          light-years of the black hole: gas, small blobs and a long streak of knots. NASA’s caption calls the host galaxy of 3C 273 “unseen” in that picture. The pages
          read for this page do not explain the full evidence that every quasar has a galaxy around it, so this page does not claim to.
        </li>
        <li>
          <strong>What “brighter than the galaxy” means.</strong> It means the quasar’s total light output is bigger than all the galaxy’s stars added together. It does not
          mean the galaxy has gone. The galaxy is still there, still shining. It is only that its glow is lost beside the quasar’s, as the glow of a city’s street lamps
          would be lost beside one huge floodlight.
        </li>
      </ul>

      <p style={paragraph}>
        <strong>Is a quasar always in the middle of its galaxy?</strong> Almost always. NASA says “almost every large galaxy, including our Milky Way, has a supermassive
        black hole at its center”, and a quasar is that black hole lit up by gas falling in, so the quasar sits where the black hole is.
      </p>
      <p style={paragraph}>
        <strong>Why the center?</strong> The pages read for this page say where the black hole is, but not why it ends up there, so this page does not explain it and does
        not guess. What those pages do say is that when two galaxies collide, their black holes can merge into one.
      </p>
      <p style={paragraph}>
        <strong>Sometimes a quasar is not at the center.</strong> NASA reports a few cases, and most of them are still ideas and not settled:
      </p>
      <ul style={{ ...paragraph, paddingLeft: '1.25rem' }}>
        <li>
          <strong>Two quasars close together.</strong> Hubble has found pairs so close that they look like a single object. Each sits in the core of one of two merging
          galaxies, and the two black holes spiral together towards one bigger black hole. In 2024 Hubble and Chandra confirmed a pair of black holes about 300 light-years
          apart.
        </li>
        <li>
          <strong>A black hole pushed off-center.</strong> NASA says astronomers “hypothesize” that the quasar 3C 186 was thrown out of the center of its galaxy by the
          recoil from gravitational waves, after two black holes merged. NASA also says the black hole in the galaxy M87 is displaced from the center, and that a past merger
          “may” be the cause. Both are candidates, and neither is confirmed.
        </li>
      </ul>

      <p style={paragraph}>
        <strong>The first quasar.</strong> Radio telescopes found 3C 273 first, as a source of radio waves. Its light did not look like any star’s. In 1963 the astronomer
        Maarten Schmidt noticed that the pattern of colors in its light “made sense if it was simply an extremely large redshift” (the words of the Chandra X-ray Center’s
        guide). A <strong>redshift</strong> is a stretching of the colors of light toward the red end. You can hear a similar effect in sound: an engine’s pitch drops as
        it drives away. 3C 273’s colors are stretched by about 16 percent (a redshift of 0.158). A large redshift means a very distant object, and NASA’s 2024 release
        says it was “too far away for a star” at a distance of 2.5 billion light-years, and that it “must have been more energetic than ever imagined”. In other words,
        a point of light that bright from so far away has to be giving out an enormous amount of light, or we would not see it at all.
      </p>

      <p style={paragraph}>
        <strong>What feeds a quasar.</strong> Astronomers think the middle of every quasar holds a supermassive black hole with gas falling toward it. The gas does not
        drop straight in. Like water going round a drain, it circles the black hole and spirals in, forming a flat, spinning <strong>disc</strong> (astronomers call it an
        accretion disc). The black hole itself usually spins too, because the gas that falls in is circling and passes some of that motion on. How fast it spins changes how much
        of the falling gas’s energy comes out as light, which is why this page lets you choose a spin. The gas in the disc is squeezed and moving at enormous speed, so it becomes extremely hot and shines. In Black Holes 8 you saw a probe that
        spiralled down toward a black hole give up a share of its energy, from a few percent with no spin to about four-tenths for the fastest spin. In a quasar that
        released energy comes out as light (how the gas turns its energy into light is not modelled here, or in Black Holes 8). Figure 4 is an artist’s picture of the
        whole engine.
      </p>

      <p style={paragraph}>
        <strong>Can a quasar swallow its whole galaxy?</strong> No. A quasar’s black hole is tiny next to the galaxy around it. A galaxy holds hundreds of billions of stars, and even a
        very heavy black hole is only a small fraction of that mass. Its strong pull reaches only the middle of the galaxy. Stars far out circle the centre the way planets circle the Sun,
        and they do not fall in. Our own Sun, about 26,000 light-years from the middle of the Milky Way, would carry on exactly as it does now if the middle held a quasar. A quasar is fed
        mostly by <strong>gas</strong>, not stars. Gas can rub and collide as it circles, lose some of its sideways motion and spiral in, but a star on a smooth orbit cannot. A good
        comparison is a campfire in the middle of a huge field: it can burn fiercely and warm the ground close by, but it does not burn the whole field. Astronomers think a quasar’s
        light and winds can also push gas out of the galaxy’s centre, which can cut off the quasar’s own fuel. So a quasar is a bright phase that switches on while gas is falling in,
        and later fades. While it shines, the black hole grows. It does not eat the galaxy.
      </p>

      <Figure
        caption={
          <>
            <strong>Figure 4. An artist’s picture of the engine inside a quasar.</strong> This is an artist’s impression, not a photograph: no telescope can see this much
            detail. In the middle is the supermassive black hole. Around it is a bright, flat disc of very hot gas falling in (the blue-white swirl). Further out is a
            thicker doughnut of dusty gas (the red-orange cloud). A narrow jet shoots away from the middle (the green-white streak), and the thin curved lines show a
            magnetic field, which astronomers think helps to form the jet.{' '}
            <span style={credit}>
              Image: ESO/L. Calçada (<Ext href="https://www.eso.org/public/images/eso1515a/">eso.org/public/images/eso1515a</Ext>, licence CC BY 4.0; ESO’s caption
              names the disc, the dusty torus, the jets and the magnetic field).
            </span>
          </>
        }
      >
        <img
          src={ENGINE_IMAGE}
          alt="An artist’s picture of a flat disc seen at a slant. The disc glows blue-white near the middle and red-orange further out. A narrow green-white jet shoots from the middle toward the upper left, with thin curved lines of a magnetic field around the base."
          width={1280}
          height={800}
          style={{ ...imgStyle, maxWidth: 'min(100%, 640px)' }}
        />
      </Figure>

      <p style={paragraph}>
        <strong>Where the light comes from, step by step.</strong> If a quasar is a black hole in the middle of a galaxy, and a black hole gives out no light, where does
        the light that out-shines a galaxy come from? Here is the chain, one link at a time.
      </p>
      <ol style={{ ...paragraph, paddingLeft: '1.25rem' }}>
        <li>
          <strong>The black hole itself gives out nothing.</strong> A black hole is a region that light cannot leave, so it cannot shine. The light comes from the gas just{' '}
          <em>outside</em> it. NASA’s “Black Hole Anatomy” page says that “the main light source from a black hole is a structure called an accretion disk” (
          <Ext href="https://science.nasa.gov/universe/black-holes/anatomy/">NASA Science</Ext>).
        </li>
        <li>
          <strong>The gas forms a spinning disk.</strong> NASA says that the gas “settles into a hot, bright, rapidly spinning disk”. A good comparison is bathwater going
          down a plughole: it swirls round the hole instead of dropping straight down, because it is already moving sideways. This is only a comparison. The pages read for
          this page do not explain why the gas flattens into a disk, and this page does not either.
        </li>
        <li>
          <strong>Falling gives the gas energy, and the disk turns it into heat.</strong> A stone dropped from a cliff speeds up as it falls, and its motion becomes heat when
          it stops. Gas falling toward a black hole falls through a far stronger pull, so it moves far faster. The European Space Agency says that gas flowing in through a
          disc “is heated by friction and shines brightly” (<Ext href="https://sci.esa.int/web/xmm-newton/-/56984-black-hole-at-the-centre-of-a-quasar">ESA, XMM-Newton</Ext>).
          Friction is what warms your hands when you rub them together, or a brake pad when it slows a wheel. The part of the disk nearest the black hole is the hottest:
          NASA’s Chandra pages say that the inner edge of such a disk reaches “millions of degrees” (that page is about black holes in general, and not about one quasar:{' '}
          <Ext href="https://chandra.harvard.edu/resources/illustrations/blackholes3.html">Chandra X-ray Center</Ext>). A simple picture of the friction, which is a general
          explanation and not taken from those pages: gas closer in orbits faster than gas farther out, so neighboring rings of gas rub against each other. How the friction
          arises in a thin gas is a deeper question that this page does not go into.
        </li>
        <li>
          <strong>Very hot things glow.</strong> The disk shines, and what we call the quasar’s light is the glow of this gas. The glow is brightest where the gas is hottest, close
          to the black hole. That is why a quasar’s light can come from a very small place, which is the second puzzle of this page.
        </li>
        <li>
          <strong>How much energy is there?</strong> Einstein’s E = mc² says that a piece of matter’s mass is stored energy. The question is how large a <em>share</em> of the
          gas’s mass comes out as light. As Black Holes 8 found, falling toward a black hole gives up a large share, from a few percent with no spin to about four-tenths for
          the fastest spin. A star, which shines by fusion, turns a much smaller share of its fuel into light. After your first Run, the page puts the numbers side by side.
        </li>
        <li>
          <strong>So why does it out-shine a galaxy?</strong> The stars of a galaxy shine quietly, each one turning a small share of a limited fuel supply into light, over
          billions of years. A quasar turns a large share of what falls in into light, from one small place, for as long as gas keeps arriving. It does not need more fuel than a
          galaxy holds. It needs a far better way of turning fuel into light.
        </li>
      </ol>
      <p style={paragraph}>
        What this page does not model: how the disk’s friction works in detail, the jets, magnetic fields, and what brings gas to the black hole in the first place.
      </p>

      <p style={paragraph}>
        <strong>Does a quasar keep growing, getting bigger and brighter?</strong> Not for ever. A quasar is a bright phase in the life of a black hole that is taking in gas.
      </p>
      <ul style={{ ...paragraph, paddingLeft: '1.25rem' }}>
        <li>
          <strong>It fades, and the black hole stays.</strong> NASA’s “Ask an Astrophysicist” page says that a quasar is a luminous phase of a black hole that is taking in matter, and that
          it gets fainter and fainter in the end. Another answer on the same page says that massive black holes cannot be destroyed, and that nearby galaxies have “quiet” black holes in
          their centers (<Ext href="https://imagine.gsfc.nasa.gov/ask_astro/quasar.html">NASA Goddard</Ext>). Our own Milky Way has one: ESA says it “appears today as a quiet and
          harmless black hole”, and that echoes of gamma rays show it was far more active about 350 years ago (<Ext href="https://www.esa.int/Science_Exploration/Space_Science/Integral/Integral_rolls_back_history_of_Milky_Way_s_super-massive_black_hole2">ESA, 2005</Ext>).
        </li>
        <li>
          <strong>How long a quasar lasts is uncertain.</strong> The same NASA page gives “10 million to a few billion years”, and says that this is known only “on the
          basis of theoretical arguments that are consistent with observational data”. That is a wide range, from an answer written in 1998, and this page does not claim to narrow it.
        </li>
        <li>
          <strong>The black hole grows while the quasar shines, slowly.</strong> NASA says the growth of most massive black holes in the early universe was fueled by “small,
          long-term events” and not by short, dramatic mergers (<Ext href="https://science.nasa.gov/missions/hubble/most-quasars-live-on-snacks-not-large-meals">NASA Science</Ext>).
          This page found no plain statement of how much a typical quasar’s black hole grows.
        </li>
      </ul>
      <p style={paragraph}>
        <strong>Were quasars around long ago?</strong> Yes. NASA’s Hubble team studied 11 ultra-bright quasars that shone about 12 billion years ago, at the peak of the universe’s
        star-formation era, and found them in colliding and merging galaxies (<Ext href="https://science.nasa.gov/missions/hubble/hubble-sees-the-teenage-years-of-quasars/">NASA Science, 2015</Ext>).
        That differs from the page above, which says most black holes grew by small, long-term events. The two pages are about different groups of quasars, and this page does not choose between them.
        NASA’s StarChild page for young learners says: “When we look at a quasar, it is like we are looking back in time.” The light of a quasar billions of light-years away left
        it billions of years ago, so we see it as it was then (<Ext href="https://starchild.gsfc.nasa.gov/docs/StarChild/universe_level1/quasars.html">NASA StarChild</Ext>).
      </p>

      <p style={paragraph}>
        <strong>More than one kind of light.</strong> A quasar gives out many kinds of light, not only the kind our eyes see. X-rays are light with far more energy than
        visible light. Figure 5 shows 3C 273 in X-rays, taken by NASA’s Chandra X-ray Observatory: the bright blob at the upper left is the quasar’s center, and the
        streak of knots running to the lower right is the jet. When astronomers say how bright a quasar is, they add up all the kinds of light.
      </p>

      <Figure
        caption={
          <>
            <strong>Figure 5. 3C 273 in X-rays (Chandra X-ray Observatory, 2000).</strong> X-rays cannot be seen by eye, so the picture uses colors to show how many X-rays
            arrived from each spot, with the brightest colors for the most. The bright blob at the upper left is the center of the quasar, and the streak of
            knots toward the lower right is the jet.{' '}
            <span style={credit}>
              Image: NASA/CXC/SAO/H. Marshall et al. (<Ext href="https://www.chandra.si.edu/photo/2000/0131/index.html">chandra.si.edu/photo/2000/0131</Ext>; “no claim
              to copyright is being asserted and the material may be used in accordance with NASA guidelines”).
            </span>
          </>
        }
      >
        <img
          src={CHANDRA_IMAGE}
          alt="A dark blue square with a very bright yellow-white blob at the upper left corner. A line of smaller orange and red knots runs diagonally from the middle toward the lower right."
          width={504}
          height={484}
          style={{ ...imgStyle, maxWidth: 'min(100%, 400px)' }}
        />
      </Figure>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The question has two halves.</strong>
      </p>
      <ol style={ol}>
        <li>
          <strong>Where does the energy come from?</strong> Stars shine too. A star shines by <strong>fusion</strong>: deep inside, atoms of hydrogen are pushed
          together and joined into helium, and a small part of their mass is turned into light. Matter falling toward a black hole is also turned into light, by a
          different route and in a different share. A quasar gives out a certain amount of light every second, and that light has to come from mass that is used up.
          So one half of the question is: <em>how much matter has to fall in each year to make a quasar’s light, and how does that compare with what a star-powered
          source would need?</em> (Black Holes 8 gave the share for falling matter. The share for fusion comes in the pictures once you have run the experiment.)
        </li>
        <li>
          <strong>How big can the source be?</strong> We cannot see the shape of a quasar’s light source: it is far too far away and too small. But there is a trick
          that uses the speed of light. Picture a stadium of 50,000 people doing “the wave”: each person stands when they see their neighbor stand. The wave takes time to
          go round. If the whole crowd must stand within ten seconds, the stadium cannot be bigger than what the wave can cross in ten seconds. Light plays the same
          role. Nothing travels faster than light, so a glowing object cannot brighten or dim all over at once faster than light needs to cross it. Light travels
          300,000 kilometers in one second, which is about seven and a half times round the Earth. So if something’s brightness changes as a whole within one second,
          it cannot be wider than 300,000 kilometers. Quasars do flicker: their brightness rises and falls over days, weeks and years. That puts a limit on how wide
          the place that makes the light can be. The experiment asks you to work out that limit and compare it with the size of a galaxy.
        </li>
      </ol>

      <p style={paragraph}>
        <strong>New units for sizes.</strong> A <strong>light-second</strong> is the distance light travels in one second (about 300,000 kilometers). A{' '}
        <strong>light-day</strong> is the distance light travels in one day (about 25.9 billion kilometers; see the NASA link below), and a light-year is the distance it
        travels in a year. An <strong>AU</strong> (astronomical unit) is the distance from the Earth to the Sun, about 150 million kilometers. The pictures use rulers on
        which each tick is <strong>10 times</strong> the one before it (a “log ruler”), because the numbers in this experiment differ by millions of times, and a straight
        ruler would squash all the small ones into one corner.
      </p>

      <p style={paragraph}>
        <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a short plain meaning: quasar, galaxy, Suns (brightness), luminosity,
        supermassive black hole, accretion disc, jet, redshift, fusion, efficiency, flicker, light-year, light-second, light-day, AU and log ruler. After you press Run, the
        box also gives the two formulas the page uses, each with a worked example.
      </p>

      <p style={paragraph}>
        <strong>What you do.</strong> Choose how bright the quasar is and how fast its black hole spins, then press Run. Three pictures follow, each with a caption that
        says what is drawn and what to look for: the quasar’s brightness beside the Milky Way’s, how wide its light source can be, and how much matter has to fall in each
        year.
      </p>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What this experiment does not do, and what it assumes.</strong>
      </p>
      <ul style={ul}>
        <li>
          It does not model the disc itself, how the falling gas turns its energy into light, the magnetic field, the jets, dust, or the light of the galaxy around the
          quasar. Those are named here, and not worked out.
        </li>
        <li>
          It does not say how the black hole is fed in the first place, or how long a quasar lasts. How fast a black hole can grow is a different question, asked later in
          the Cosmic Horizons group.
        </li>
        <li>
          It takes the share of mass that becomes light when gas falls toward a black hole from Black Holes 8’s probe. A real disc is messier, so that share is a
          stand-in, and the same one that the earlier chapters used.
        </li>
        <li>
          The brightness of 3C 273 is a round value: the sources that were read give different numbers, and the page says so where it is used. The flicker time in the
          size picture is an example, and not the measured flicker of any particular quasar.
        </li>
      </ul>
    </div>
  )
}

// The links visible from the start. The pages that carry the numbers the learner is asked about are held back until after the first Run (QuasarBrightnessHeldBackLinks).
export function QuasarBrightnessLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-quasars">NASA Science, “Hubble Quasars”</Ext> (updated 18 June 2026): what
          a quasar is, what powers it, and what Hubble has shown about quasars.
        </li>
        <li style={linkItem}>
          <Ext href="https://chandra.harvard.edu/xray_sources/3c273/index.html">Chandra X-ray Center, “Quasar 3C273”</Ext>: the story of the first quasars and the jet of 3C 273.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/hubble/nasas-hubble-takes-the-closest-ever-look-at-a-quasar/">NASA/STScI, “NASA’s Hubble Takes the Closest-Ever Look at a Quasar”</Ext>{' '}
          (5 December 2024): the news behind Figure 3.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/webb/simulations-show-webb-telescope-can-reveal-distant-galaxies-hidden-in-quasars-glare/">NASA/STScI, Webb and the galaxies hidden in a quasar’s glare</Ext>{' '}
          (14 October 2020): why a quasar’s glare makes its galaxy hard to see, in plain words.
        </li>
        <li style={linkItem}>
          <Ext href="https://esahubble.org/images/potw1346a/">ESA/Hubble, “Best image of bright quasar 3C 273”</Ext> (18 November 2013): the picture in Figure 1, with its
          caption. (Its text names a different discoverer from the one in the Chandra and NASA pages; this page follows NASA and Chandra: Maarten Schmidt, 1963.)
        </li>
        <li style={linkItem}>
          <Ext href="https://www.caltech.edu/news/fifty-years-quasars-38937">Caltech, “Fifty Years of Quasars”</Ext> (15 March 2013): the human story of the 1963 discovery.
        </li>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/ask_astro/quasar.html">NASA Goddard, “How long is a Quasar’s life and what happens when it dies?”</Ext> (Ask an Astrophysicist,
          1998): how long a quasar lasts, and what ends it.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/hubble/hubble-sees-the-teenage-years-of-quasars/">NASA Science, “Hubble Sees the ‘Teenage Years’ of Quasars”</Ext> (2015): the peak of quasar
          activity in the young universe.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/hubble/most-quasars-live-on-snacks-not-large-meals">NASA Science, “Most Quasars Live on Snacks, Not Large Meals”</Ext> (2012): how early
          black holes grew.
        </li>
        <li style={linkItem}>
          <Ext href="https://starchild.gsfc.nasa.gov/docs/StarChild/universe_level1/quasars.html">NASA StarChild, “Quasars”</Ext>: a very plain page, including why looking far away is looking
          back in time.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.esa.int/Science_Exploration/Space_Science/Integral/Integral_rolls_back_history_of_Milky_Way_s_super-massive_black_hole2">ESA, “Integral rolls back history of the Milky Way’s super-massive black hole”</Ext> (2005):
          our own black hole is quiet now, and was brighter a few centuries ago.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/anatomy/">NASA Science, “Black Hole Anatomy”</Ext>: the accretion disk, the main source of a black hole’s light.
        </li>
        <li style={linkItem}>
          <Ext href="https://sci.esa.int/web/xmm-newton/-/56984-black-hole-at-the-centre-of-a-quasar">ESA, “Black Hole at the Centre of a Quasar”</Ext> (XMM-Newton, 2 December 2015):
          the disc is heated by friction and shines brightly.
        </li>
        <li style={linkItem}>
          <Ext href="https://chandra.harvard.edu/resources/illustrations/blackholes3.html">Chandra X-ray Center, “Black Holes” illustration</Ext>: friction heats the gas, hottest at the inner edge.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/types/">NASA Science, “Black Hole Types”</Ext>: supermassive black holes at the centers of large galaxies, and
          that they can merge when galaxies collide.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/hubble/hubble-spots-double-quasars-in-merging-galaxies">NASA Hubble, “Hubble Spots Double Quasars in Merging Galaxies”</Ext>{' '}
          (6 April 2021): two quasars so close they look like one.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.stsci.edu/contents/news-releases/2024/news-2024-022">STScI/NASA, “NASA’s Hubble, Chandra Find Supermassive Black Hole Duo”</Ext>{' '}
          (9 September 2024): the closest confirmed pair of supermassive black holes.
        </li>
        <li style={linkItem}>
          <Ext href="https://svs.gsfc.nasa.gov/12539">NASA Goddard, “Hubble Detects a Rogue Supermassive Black Hole”</Ext> (23 March 2017): the quasar 3C 186, which may have
          been pushed out of the center of its galaxy.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/hubble/supermassive-black-holes-may-frequently-roam-galaxy-centers">NASA Hubble, “Supermassive Black Holes May Frequently Roam Galaxy Centers”</Ext>{' '}
          (25 May 2010): the black hole in the galaxy M87 is not quite at its center.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/mission/voyager/voyager-1/voyager-1-what-is-a-light-day/">NASA, “What is a light-day?”</Ext>: the distance light travels in a day, as NASA
          states it.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>A history, by an astronomer</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/1304.3627">Kellermann, “The Discovery of Quasars and its Aftermath”</Ext> (Journal of Astronomical History and Heritage, 2014): how 3C 273 and
          the quasars were found, told by an astronomer who worked at the time.
        </li>
      </ul>
    </div>
  )
}

// Shown only after the first Run: the record-breaking quasar and the latest results, with their numbers (CLAUDE.md §12). Every figure is quoted from the page
// named beside it and is that page's claim. The one calculation, the check of the page's formula against ESO's rate, comes from the physics module.
export function QuasarBrightnessHeldBack() {
  const check = j0529RateCheck(0.1)
  const run = runQuasarExperiment(PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN)
  return (
    <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>The energy, in numbers</h4>
      <p style={paragraph}>
        Earlier, the page said that falling toward a black hole turns a large share of the gas’s mass into light, and a star a much smaller share. Here are the shares, side by
        side:
      </p>
      <ul style={ul}>
        <li>
          <strong>Hydrogen fusion in a star:</strong> {formatPercent(FUSION_EFFICIENCY)} of the mass (OpenStax Astronomy, section 16.2).
        </li>
        <li>
          <strong>Falling toward a black hole with no spin:</strong> {formatPercent(infallEfficiency(0))}. <strong>With the fastest spin possible in theory:</strong> about{' '}
          {formatPercent(CEILING_EFFICIENCY)} (Black Holes 8). Some textbooks quote about 32 percent for the most extreme realistic case.
        </li>
      </ul>
      <p style={paragraph}>
        So each kilogram that falls in makes about {formatNumber(run.lightPerKilogramRatio)} times as much light as a kilogram of hydrogen fused in a star at no spin
        ({formatPercent(infallEfficiency(0))} ÷ {formatPercent(FUSION_EFFICIENCY)}), and about {formatNumber(CEILING_EFFICIENCY / FUSION_EFFICIENCY)} times as much at the ceiling.
      </p>
      <p style={paragraph}>
        <strong>A worked example, 3C 273 with no spin.</strong> Its light is about {formatNumber(PART_ONE_LUMINOSITY_SOLAR / 1e12)} trillion Suns, which is{' '}
        {formatNumber(PART_ONE_LUMINOSITY_SOLAR / 1e12)} × 10¹² × {scientific(SUN_LUMINOSITY_W)} watts = {scientific(run.luminositySolar * SUN_LUMINOSITY_W)} watts. The mass that must turn
        to light each second is that power ÷ (share × c²) = {scientific(run.luminositySolar * SUN_LUMINOSITY_W)} ÷ ({infallEfficiency(0).toFixed(4)} × {scientific(SPEED_OF_LIGHT ** 2)}) ={' '}
        {scientific((run.infallSolarMassesPerYear * SUN_MASS_KG) / SECONDS_PER_YEAR)} kilograms. Over a year that is {scientific(run.infallSolarMassesPerYear * SUN_MASS_KG)} kilograms, which is about{' '}
        {formatNumber(run.infallSolarMassesPerYear)} Suns of mass. Fusion, at {formatPercent(FUSION_EFFICIENCY)}, would need about {formatNumber(run.fusionSolarMassesPerYear)} Suns of hydrogen a
        year to make the same light. The brightness of 3C 273 is a round value on which sources differ, so these are good to about a factor of two, and they rest on the
        assumption that the share a probe gives up in Black Holes 8 is a fair stand-in for the share of falling gas that becomes light.
      </p>

      <h4 style={{ margin: '0 0 0.5rem' }}>What astronomers have found lately</h4>
      <p style={paragraph}>
        <strong>A record-breaker.</strong> In February 2024 the European Southern Observatory (ESO) announced a quasar called <strong>J0529-4351</strong>, “over 500
        trillion times more luminous than the Sun”, with a black hole of 17 billion Suns that “eats just over a Sun per day”. Its light took over 12 billion years to
        reach us, and the disc that makes it measures seven light-years across (<Ext href="https://eso.org/public/news/eso2402/">ESO, eso2402</Ext>; the study is Wolf and
        others in <em>Nature Astronomy</em>, <Ext href="https://arxiv.org/abs/2402.15101">arXiv:2402.15101</Ext>). It had been in survey photographs since 1980. ESO says that
        an automated check of data from the European Space Agency’s Gaia satellite passed over it as too bright to be a quasar, and took it for a star.
      </p>
      <p style={paragraph}>
        <strong>A check of this page’s formula.</strong> At an efficiency of 10 percent, a value that the OpenStax textbook says falling matter “can easily reach”, the formula behind Picture C (shown in the
        Words and formulas box) gives about {formatNumber(check.modelSolarMassesPerYear)} Suns a year for {(J0529_LUMINOSITY_SOLAR / 1e12).toLocaleString('en-US')} trillion Suns of light. ESO’s
        “just over a Sun per day” is about {formatNumber(check.publishedSolarMassesPerYear)} a year. The two are close. ESO does not state the efficiency, so the match shows that
        the numbers agree. It does not show that the efficiency is known. Working backwards, ESO’s rate implies a share of about {formatPercent(check.impliedEfficiency)}.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Other recent results</strong> (each is that source’s own claim, with its date):
      </p>
      <ul style={ul}>
        <li>
          <strong>September 2025, NASA’s Chandra.</strong> The quasar RACS J0320-35, seen about 920 million years after the Big Bang (about 12.8 billion light-years away), “is growing
          at one of the fastest rates ever recorded”, “between 300 and 3,000 Suns per year”, an estimate from computer models fitted to its X-rays (
          <Ext href="https://www.chandra.harvard.edu/photo/2025/red6/">Chandra photo album, red6</Ext>).
        </li>
        <li>
          <strong>November 2025, ESA/Webb.</strong> A galaxy seen less than 600 million years after the Big Bang hosts a supermassive black hole that is growing rapidly, and
          the black hole is “overmassive compared to its stellar mass”, which suggests that early black holes may have grown faster than their galaxies (the release does not
          call it a quasar) (<Ext href="https://esawebb.org/news/weic2522/">ESA/Webb weic2522</Ext>).
        </li>
        <li>
          <strong>June 2026, MIT.</strong> The earliest known <em>flickering</em> quasar, found in archive data from NASA’s NEOWISE telescope. It is estimated to be as bright as
          12 trillion Suns, and it rose and fell by about 20 percent (about 2 trillion Suns) over 14 years, “much like a candle’s flame flickers” (
          <Ext href="https://news.mit.edu/2026/mit-astronomers-discover-earliest-known-flickering-quasar-0608">MIT News</Ext>, a university report of the work).
        </li>
      </ul>
    </div>
  )
}

export function QuasarBrightnessHeldBackLinks() {
  return (
    <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>More to read, now that you have run it</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://chandra.harvard.edu/xray_sources/quasars.html">Chandra X-ray Center, “Quasars &amp; Active Galaxies”</Ext>: a short plain page that compares a quasar’s
          small size with its great power, using a flashlight and the lights of a whole city.
        </li>
        <li style={linkItem}>
          <Ext href="https://openstax.org/books/astronomy/pages/27-2-supermassive-black-holes-what-quasars-really-are">OpenStax Astronomy, “Supermassive Black Holes: What Quasars Really Are”</Ext>{' '}
          (a free textbook, not an agency page): both halves of this experiment, the energy and the size, with the textbook’s own numbers for how fast quasars flicker and how
          much of the mass becomes light.
        </li>
        <li style={linkItem}>
          <Ext href="https://openstax.org/books/astronomy-2e/pages/16-2-mass-energy-and-the-theory-of-relativity">OpenStax Astronomy 2e, “Mass, Energy, and the Theory of Relativity”</Ext>:
          where the share of mass that a star’s fusion turns into energy comes from.
        </li>
        <li style={linkItem}>
          <Ext href="https://ar5iv.labs.arxiv.org/html/astro-ph/0109495">Peterson, “Variability of Active Galaxies” (arXiv, 2001)</Ext>: a scientist’s own statement of the
          “light-travel time” limit on a source’s size (a review for astronomers; only the start was read for this page).
        </li>
        <li style={linkItem}>
          <Ext href="https://eso.org/public/news/eso2402/">ESO, “Brightest and fastest-growing: astronomers identify record-breaking quasar”</Ext> (19 February 2024), and the paper
          behind it, <Ext href="https://arxiv.org/abs/2402.15101">Wolf and others, <em>Nature Astronomy</em> (arXiv:2402.15101)</Ext>.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.chandra.harvard.edu/photo/2025/red6/">NASA’s Chandra, “Black Hole With Tremendous Growth”</Ext> (18 September 2025), and{' '}
          <Ext href="https://esawebb.org/news/weic2522/">ESA/Webb, “Webb witnesses a feasting supermassive black hole in the early Universe”</Ext> (19 November 2025).
        </li>
        <li style={linkItem}>
          <Ext href="https://news.mit.edu/2026/mit-astronomers-discover-earliest-known-flickering-quasar-0608">MIT News, “MIT astronomers discover the earliest known flickering quasar”</Ext>{' '}
          (8 June 2026).
        </li>
      </ul>
    </div>
  )
}

// The words box. The share for fusion, the two formulas and their worked examples are held until after the first Run (CLAUDE.md §12).
export function quasarBrightnessWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const entries = [
    { term: 'Quasar', meaning: 'the very bright center of a distant galaxy, where gas falls toward a supermassive black hole. It looks like a single star (“quasi-stellar” means “star-like”), and it can out-shine all the stars of its galaxy together.' },
    { term: 'Galaxy', meaning: 'a huge family of stars, gas and dust held together by gravity. The Milky Way, our galaxy, holds about a hundred billion stars.' },
    { term: 'Suns (brightness)', meaning: 'a way of counting how much light something gives out, with our own Sun as the unit. “10 Suns” gives out ten times as much light as the Sun does each second.' },
    { term: 'Luminosity', meaning: 'the scientific word for how much light something gives out each second, in all kinds of light added together. This page says “brightness” and counts it in Suns.' },
    { term: 'Supermassive black hole', meaning: 'a black hole millions to billions of times the mass of the Sun. Many big galaxies have one in the middle, including ours.' },
    { term: 'Accretion disc', meaning: 'the flat, spinning disc of gas that circles a black hole as it spirals in. The gas gets very hot and shines.' },
    { term: 'Jet', meaning: 'a narrow beam of fast gas shot out from near a black hole, along its spin axis. 3C 273’s jet is about 200,000 light-years long.' },
    { term: 'Redshift', meaning: 'the stretching of the colors of light toward red when a source moves away. A bigger stretch means a more distant source. 3C 273’s is 0.158, which is about 16 percent.' },
    { term: 'Fusion', meaning: 'how a star shines: atoms of hydrogen are joined into helium deep inside it, and a small part of their mass becomes light.' },
    { term: 'Efficiency (share of mass that becomes light)', meaning: 'how much of a piece of matter’s mass is turned into light. An efficiency of 10 percent means 1 kilogram of matter gives as much energy as 0.1 kilogram would if all of it were turned to energy (E = mc²).' },
    { term: 'Flicker (variability)', meaning: 'a change in an object’s brightness over time. A quasar’s brightness rises and falls over days, weeks and years.' },
    { term: 'Light-year, light-day, light-second', meaning: `the distance light travels in a year, a day or a second. A light-second is about 300,000 kilometers, a light-day is about 25.9 billion kilometers (${formatNumber(lightDayAU())} AU), and a light-year is about 9.5 trillion kilometers.` },
    { term: 'AU (astronomical unit)', meaning: 'the distance from the Earth to the Sun, about 150 million kilometers.' },
    { term: 'Log ruler', meaning: 'a ruler on which each tick is 10 times the one before it, so numbers that differ by millions of times fit on one page.' },
  ]
  if (afterRun) {
    const share0 = infallEfficiency(0)
    const watts = J0529_LUMINOSITY_SOLAR * SUN_LUMINOSITY_W
    entries.push(
      {
        term: 'Fusion’s share',
        meaning: 'hydrogen fusion in a star turns about 0.71 percent of the mass of the hydrogen into energy (OpenStax Astronomy 2e, section 16.2). Falling toward a black hole turns 5.7 percent (no spin) up to about 42 percent (the fastest spin possible in theory) into light (Black Holes 8). Some textbooks quote about 32 percent as the extreme realistic case (OpenStax Astronomy, section 27.2).',
      },
      {
        term: 'Formula: mass needed each second',
        meaning: `mass per second = light output ÷ (share that becomes light × c²), where c is the speed of light. Example, a quasar of 500 trillion Suns (J0529-4351) at 10 percent: light output = ${scientific(watts)} watts. ${scientific(watts)} ÷ (0.1 × ${scientific(SPEED_OF_LIGHT ** 2)}) = ${scientific(watts / (0.1 * SPEED_OF_LIGHT ** 2))} kg a second, which is ${formatNumber(((watts / (0.1 * SPEED_OF_LIGHT ** 2)) * SECONDS_PER_YEAR) / SUN_MASS_KG)} Suns of mass a year.`,
      },
      {
        term: 'Formula: light per kilogram',
        meaning: `light from a kilogram falling in ÷ light from a kilogram fused = (share falling in) ÷ (share fused). Example at no spin: ${formatPercent(share0)} ÷ 0.71 percent = ${formatNumber(lightPerKilogramRatio(0))}.`,
      },
      {
        term: 'Formula: the size limit',
        meaning: `the widest a source can be = the speed of light × the time over which it changes as a whole. Example, a change over 1 day: 1 light-day, which is ${formatNumber(lightDayAU())} AU. Over 10 days: 10 light-days, ${formatNumber(10 * lightDayAU())} AU.`,
      },
    )
  }
  return entries
}

export { powerOfTen }
