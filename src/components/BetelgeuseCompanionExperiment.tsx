import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Reach, SigmaAnswer } from '../physics/betelgeuseCompanion'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 12 (docs/experiments/frontier-and-beyond/12-betelgeuse-and-its-companion.md).
// Step 5 builds the two predictions (their answer buttons, Run gated on both, and Start over); Run only records the predictions, because the run is a later step.
// Step 4 (the interface skeleton) builds the page's skeleton: the status line, the introduction with its new-word list, its assumptions and its "Want to know more?"
// links, one illustration (how an angle and a distance give a size) with its guide, and the collapsed "Words and formulas" panel. The two predictions, the run, the
// three pictures, the controls, the results and the tutor are later steps. All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1), written to the
// standard of §29. The introduction does not give the star's size, the period, or the chance of 1.5 sigma (those are what the predictions and the run show, §12). The
// interface only displays numbers from src/physics (CLAUDE.md §9); this step shows none of the results.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const STAR_COLOR = '#fb923c' // orange: the star
const YOU_COLOR = '#38bdf8' // sky blue: you, the observer
const ANGLE_COLOR = '#fde047' // yellow: the angle
const SIZE_COLOR = '#4ade80' // green: the star's real size
const DISTANCE_COLOR = '#c084fc' // purple: the distance

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <>
      {lines.map((line, i) => (
        <text key={i} x={x} y={y + i * (size + 2)} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor} stroke={fill === '#0b1020' ? 'none' : '#0b1020'} strokeWidth={3} paintOrder="stroke">
          {line}
        </text>
      ))}
    </>
  )
}

// ---- Illustration: how an angle and a distance give a size (not to scale; it shows the idea, not Betelgeuse) ----
function AngleDrawing() {
  const height = 340
  const eyeX = 70
  const eyeY = 190
  const starX = 430
  const radius = 80
  // The two lines run from the eye to the top and bottom edges of the star; the arc between them is the angle.
  const half = Math.atan2(radius, starX - eyeX)
  const arcR = 70
  const ax = eyeX + arcR * Math.cos(half)
  const ay = (sign: number) => eyeY + sign * arcR * Math.sin(half)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale: an observer on the left looks at a round star on the right. Two yellow lines run from the observer to the top and the bottom edge of the star, and the angle between them is marked. A green bracket beside the star marks its real size across, and a purple arrow underneath marks the distance from the observer to the star"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: how an angle and a distance give a size
      </text>

      {/* The star: a round ball seen from far away. */}
      <circle cx={starX} cy={eyeY} r={radius} fill={STAR_COLOR} fillOpacity={0.85} stroke={STAR_COLOR} strokeWidth={2} />
      <SvgLines x={starX} y={eyeY + 4} lines={['a star (a round', 'ball, seen from', 'far away)']} fill="#0b1020" bold anchor="middle" />

      {/* You: the observer. */}
      <circle cx={eyeX - 8} cy={eyeY} r={8} fill={YOU_COLOR} />
      <SvgLines x={eyeX - 8} y={eyeY + 28} lines={['you, looking', 'through a telescope']} fill={YOU_COLOR} bold anchor="middle" />

      {/* The two lines of sight, and the angle between them. */}
      <line x1={eyeX} y1={eyeY} x2={starX} y2={eyeY - radius} stroke={ANGLE_COLOR} strokeWidth={2} />
      <line x1={eyeX} y1={eyeY} x2={starX} y2={eyeY + radius} stroke={ANGLE_COLOR} strokeWidth={2} />
      <path d={`M ${ax} ${ay(-1)} A ${arcR} ${arcR} 0 0 1 ${ax} ${ay(1)}`} fill="none" stroke={ANGLE_COLOR} strokeWidth={3} />
      <SvgLines x={eyeX + 6} y={eyeY - 104} lines={['the angle between the two lines', 'is the star’s “angular size”']} fill={ANGLE_COLOR} bold />
      <line x1={eyeX + 40} y1={eyeY - 76} x2={ax + 2} y2={eyeY - 2} stroke={ANGLE_COLOR} strokeWidth={1} strokeDasharray="2 3" />

      {/* The star's real size across, beside the star. */}
      <line x1={532} y1={eyeY - radius} x2={532} y2={eyeY + radius} stroke={SIZE_COLOR} strokeWidth={2.5} />
      <line x1={526} y1={eyeY - radius} x2={538} y2={eyeY - radius} stroke={SIZE_COLOR} strokeWidth={2.5} />
      <line x1={526} y1={eyeY + radius} x2={538} y2={eyeY + radius} stroke={SIZE_COLOR} strokeWidth={2.5} />
      <SvgLines x={548} y={eyeY - radius - 32} lines={['the star’s real size', 'across (what we want', 'to find out)']} fill={SIZE_COLOR} bold anchor="end" />

      {/* The distance from you to the star. */}
      <line x1={eyeX - 8} y1={304} x2={starX} y2={304} stroke={DISTANCE_COLOR} strokeWidth={2.5} />
      <line x1={eyeX - 8} y1={298} x2={eyeX - 8} y2={310} stroke={DISTANCE_COLOR} strokeWidth={2.5} />
      <line x1={starX} y1={298} x2={starX} y2={310} stroke={DISTANCE_COLOR} strokeWidth={2.5} />
      <SvgLines x={(eyeX + starX) / 2} y={296} lines={['the distance from you to the star']} fill={DISTANCE_COLOR} bold anchor="middle" />

      <SvgLines x={20} y={height - 6} lines={['Not to scale. A real star is so far away that the angle is far too small to draw.']} fill={MUTED_COLOR} />
    </svg>
  )
}

const lookForDrawing: LookFor[] = [
  {
    look: 'the two yellow lines from you to the top and the bottom of the star, and the arc between them.',
    means: 'the arc is the angle the star takes up in your view, its angular size. A bigger star, or a nearer one, takes up a bigger angle.',
    matters: 'an angle is something a telescope can measure, even when the star is far too far away for anyone to measure its size directly. It is the first of the two things we need.',
  },
  {
    look: 'the purple arrow underneath, from you to the star.',
    means: 'the distance to the star. For the same angle, a star twice as far away must be twice as big across.',
    matters: 'an angle alone does not give a size. We also need the distance, and that is harder to measure, so the size is only as sure as the distance is.',
  },
  {
    look: 'the green bracket beside the star.',
    means: 'the star’s real size across, which no telescope can see directly. It is worked out from the angle and the distance.',
    matters: 'this is how astronomers can say how big a star is, and it is why you will be asked, in a moment, to guess how big Betelgeuse is before you are shown.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Fusion', meaning: 'the way a star makes its energy. Inside a star it is so hot, and the weight pressing in is so great, that the centres of atoms (nuclei) are squeezed together until they stick and make one bigger nucleus. Each joining gives off energy as heat and light. In most of a star’s life, hydrogen nuclei fuse into helium. Later, helium nuclei can fuse into heavier ones, such as carbon, nitrogen and oxygen.' },
  { term: 'Core and shell', meaning: 'the core is a star’s very centre, the hottest, densest part, where fusion starts. A shell is a layer of the star’s material that lies round the core, like the flesh of a peach round its stone. When the core runs out of hydrogen, hydrogen in the shell round it can fuse instead.' },
  { term: 'Red giant', meaning: 'a star that has used up the hydrogen in its core and has swollen to many times its old size. NASA describes how: the core shrinks and heats up, helium starts to fuse there, hydrogen fuses in a shell around it, and the extra heat makes the star’s outer layer of gas puff up. Its surface is cooler than before, so it looks redder. The Sun will become one, NASA says some 6 billion years from now.' },
  { term: 'Red supergiant', meaning: 'the same kind of swelling in a star much heavier than the Sun. It ends up far larger than a red giant. Betelgeuse is one.' },
  { term: 'Companion star', meaning: 'a second star that goes round a first one, the two held together by gravity. The pair orbit their common centre. A companion much smaller than the star it orbits is hard to see in its glare.' },
  { term: 'Angular size, and the milliarcsecond', meaning: 'how much of your view an object takes up, measured as an angle. A circle is 360 degrees; one degree is 60 arcminutes; one arcminute is 60 arcseconds; so one degree is 3,600 arcseconds. A milliarcsecond (mas) is a thousandth of an arcsecond, which is a very small angle indeed: the smallest details telescopes can pick out.' },
  { term: 'Radian', meaning: 'another unit for angles. One radian is about 57.3 degrees. It has a useful property: for a small angle in radians, the size of an object is its distance times the angle (size = angle × distance), as in the worked moment under the illustration.' },
  { term: 'Parsec (pc)', meaning: 'a unit of distance used by astronomers: about 3.26 light-years, or about 206,265 times the Earth’s distance from the Sun. It is defined so that one thousandth of an arcsecond (one milliarcsecond) at one parsec is a size of one thousandth of an astronomical unit.' },
  { term: 'Astronomical unit (AU)', meaning: 'the average distance from the Earth to the Sun, about 150 million kilometres. It is a handy ruler for sizes and distances in the solar system: Mars is about 1.5 AU from the Sun and Jupiter about 5.2.' },
  { term: 'Light-year', meaning: 'the distance light travels in a year, about 9.5 million million kilometres.' },
  { term: 'Solar mass and solar radius', meaning: 'the Sun’s mass and the Sun’s radius, used as rulers for other stars. “17.5 solar masses” means 17.5 times as heavy as the Sun.' },
  { term: 'Sigma and noise', meaning: 'every measurement has some random “noise”, a give-or-take that comes from the instrument and the conditions, not from the thing being measured. Sigma counts how many give-or-takes bigger a signal is than that noise, as in Experiment 1 of this group. The bigger the number, the less likely it is that noise alone made the signal. In many sciences, 5 sigma is the usual bar for calling something a discovery.' },
  { term: 'Speckle imaging', meaning: 'a way to take sharper pictures from the ground. The air blurs a star’s image and keeps changing, so the team takes many thousands of extremely short exposures, each too quick to be blurred, and combines them with careful processing.' },
  { term: 'Elongation', meaning: 'how far apart two objects look in the sky. A companion’s “greatest elongation” is the moment in its orbit when it looks farthest from the star it orbits, which makes it the easiest time to see.' },
  { term: 'Orbital period', meaning: 'the time an object takes to go once round its orbit.' },
  { term: 'Kepler’s third law', meaning: 'the rule that links an orbit’s size, its period and the masses of the two bodies: the farther apart they are, the longer the orbit takes; the heavier they are, the shorter. The experiment shows it with numbers after the run.' },
]

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right. The first question has three buttons
// (the physics module's `Reach` also has "past Earth", which has no button).
const REACH_CHOICES: ReadonlyArray<{ value: Reach; label: string }> = [
  { value: 'inside Earth', label: 'Inside Earth’s orbit' },
  { value: 'past Mars', label: 'Past Mars but not as far as Jupiter' },
  { value: 'past Jupiter', label: 'Past Jupiter’s orbit' },
]
const SIGMA_CHOICES: ReadonlyArray<{ value: SigmaAnswer; label: string }> = [
  { value: '1 in 2', label: 'About 1 time in 2' },
  { value: '1 in 15', label: 'About 1 time in 15' },
  { value: '1 in 3.5 million', label: 'About 1 time in 3.5 million' },
]

export function BetelgeuseCompanionExperiment() {
  const [reachPrediction, setReachPrediction] = useState<Reach | null>(null)
  const [sigmaPrediction, setSigmaPrediction] = useState<SigmaAnswer | null>(null)
  // Run only records the predictions for now: the run itself, and the pictures, are the next step.
  const [hasRun, setHasRun] = useState(false)
  const bothPredicted = reachPrediction !== null && sigmaPrediction !== null

  function startOver() {
    setReachPrediction(null)
    setSigmaPrediction(null)
    setHasRun(false)
  }
  return (
    <div>
      <h2>Experiment 12 — The Star That May Be About to Explode: What Is Betelgeuse, and Does It Have a Companion?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): Betelgeuse is a red supergiant, near the end of its life. Whether it has a companion star is still being tested, with
            reports in 2025 and 2026 and the next good chance for a direct look on 26 November 2027. What the evidence adds up to is shown after you press Run, so that
            you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Betelgeuse is one of the brightest stars in the winter sky, an orange-red star at the shoulder of the constellation Orion. It is
            a very large star, near the end of its life. Two questions come up about it. How big is it, really, compared with our own solar system? And does it have a smaller star
            circling it, hidden in its glare, as some astronomers have suspected for years?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Experiment 1 of this group you learned what “sigma” means, how many give-or-takes bigger than the noise a result is. In
            Gravity Experiment 6 you saw how orbits work, and in Black Holes Experiment 9 you saw that what happens at the end of a star’s life depends on how heavy it
            is. This experiment starts a new part of the group, on how stars live and die, with a star near the end of its life.
          </p>

          <p style={paragraph}>
            <strong>What a star does for most of its life.</strong> A star shines because of <strong>fusion</strong>. Deep inside, the star is crushed by its own
            weight and is extremely hot. The tiny particles there, the centres of atoms (called nuclei), are squeezed together so hard that they stick and join into one
            bigger nucleus, a bit like two small drops of water running together into one bigger drop. Each joining gives off energy as heat and light, and that energy
            is what makes the star shine. For most of a star’s life, the nuclei of hydrogen, the lightest atom, fuse together into helium, the next lightest. This
            happens in the star’s <strong>core</strong>, its very centre. A star’s mass decides how fast it uses up its fuel, and the heavier a star is, the faster it
            goes through it (NASA’s page on stars says so).
          </p>

          <p style={paragraph}>
            <strong>What changes at the end.</strong> Think of a peach: the hard stone in the middle is the core, and the soft flesh round it is a <strong>shell</strong>{' '}
            of the star’s material. When the core has used up its hydrogen, NASA explains, it shrinks and heats up, until it is hot enough for the helium nuclei to
            fuse together as well, into heavier ones such as carbon, nitrogen and oxygen. Meanwhile the hydrogen that is left in the shell round the core gets hot
            enough to fuse too. All this extra heat makes the star’s outer layer of gas <strong>puff up</strong>, a little as warming the air in a balloon makes it
            swell. The star becomes far larger, and its surface cooler and redder. A star like the Sun becomes a <strong>red giant</strong>; a much heavier star becomes a{' '}
            <strong>red supergiant</strong>. NASA writes that the Sun will do this some 6 billion years from now, and that it is confident the Sun will swallow Mercury
            and Venus, and not Mars, while the Earth’s fate is less clear.
          </p>

          <p style={paragraph}>
            <strong>Betelgeuse.</strong> Betelgeuse is a red supergiant, and NASA calls it the closest red supergiant to the Earth. Its distance is not known very
            exactly: estimates run from about 550 light-years to about 700. It is not steady. NASA says it has a cycle of about 400 days and a longer one of about 5
            years (the team that looked for a companion says about 6), and in 2019 and early 2020 it dimmed sharply, which NASA describes as the star blowing off a giant
            piece of its surface into space. It will eventually explode as a supernova, but NASA says that is not likely for about another 100,000 years, and this
            experiment is not about when. (Experiment 13 of this group is about a supernova.)
          </p>

          <p style={paragraph}>
            <strong>Why a companion was suggested.</strong> Betelgeuse’s long cycle of about six years is the puzzle. A team writing in 2025 says it cannot be explained
            by the star’s own pulsations (its regular swelling and shrinking). One explanation is a <strong>companion star</strong>: a smaller star going round Betelgeuse,
            so close that it moves through the supergiant’s outer atmosphere. In the glare of such a huge, bright star, a small star would be extremely hard to see.
          </p>

          <p style={paragraph}>
            <strong>What was found.</strong> In July 2025 a team led by NASA’s Steve Howell, using the Gemini North telescope in Hawai‘i, reported a faint spot beside
            Betelgeuse in pictures taken in December 2024, at the place and time where a companion was predicted to appear. They took the pictures with{' '}
            <strong>speckle imaging</strong>, which freezes out the blurring caused by the air. Pictures taken in 2020, when the companion was predicted to be behind
            Betelgeuse, showed no spot. The spot is only about <strong>1.5 sigma</strong>, which the team calls a probable detection. In 2026 other teams reported
            other signs that follow the same cycle: a trail of denser gas in Betelgeuse’s atmosphere, seen with the Hubble Space Telescope and ground telescopes, and a
            slight change in Betelgeuse’s shape in radio waves. The next time the companion is expected to look farthest from Betelgeuse, and so easiest to see, is 26
            November 2027.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <AngleDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It shows the idea behind the first question, how big Betelgeuse is. It is a sketch of any round object seen
              from far away, not of Betelgeuse itself, and it is not to scale.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The orange ball</strong> on the right is a star.
              </li>
              <li>
                <strong>The blue dot</strong> on the left is you, looking at it through a telescope.
              </li>
              <li>
                <strong>The two yellow lines</strong> run from you to the top and bottom of the star. <strong>The yellow arc</strong> between them is the angle the star
                takes up in your view, its <strong>angular size</strong>.
              </li>
              <li>
                <strong>The purple arrow</strong> is the distance from you to the star.
              </li>
              <li>
                <strong>The green bracket</strong> is the star’s real size across, the thing we want to find out.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with a coin.</strong> Hold up a coin 2.4 metres away and it takes up an angle of about 0.01 radians (about half a degree): its
              width, 0.024 metres, divided by the distance, 2.4 metres, gives 0.01. Turn it round: if you know the angle (0.01 radians) and the distance (2.4 metres),
              the width is the angle times the distance, 0.01 × 2.4 = 0.024 metres, about 2.4 centimetres. This works for any small angle, the “radian” in the box
              below. Astronomers do exactly this with a star, with the angle measured in thousandths of an arcsecond and the distance in parsecs.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForDrawing} />
          </div>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> That Betelgeuse is a red supergiant near the end of its life is well established. Whether it has a
            companion is not yet settled, and how the evidence stands, and how heavy the companion would be, is shown after the run, with each source’s own words.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Fusion</strong>, <strong>core</strong> and <strong>shell</strong>: how a star makes its energy, its centre, and the layer round the centre.
              </li>
              <li>
                <strong>Red giant</strong> and <strong>red supergiant</strong>: a star that has used up its core’s hydrogen and swollen, and the much heavier kind.
              </li>
              <li>
                <strong>Companion star</strong>: a second star that goes round a first.
              </li>
              <li>
                <strong>Angular size</strong>, <strong>milliarcsecond</strong> and <strong>radian</strong>: how much of your view something takes up, and two units for it.
              </li>
              <li>
                <strong>Parsec</strong> and <strong>astronomical unit</strong>: two rulers for distances in space.
              </li>
              <li>
                <strong>Sigma</strong>: how many give-or-takes bigger than the noise a signal is.
              </li>
              <li>
                <strong>Speckle imaging</strong> and <strong>elongation</strong>: how the team took the pictures, and when a companion looks farthest from its star.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values
            for the distance, the masses and the strength of the signal. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It treats Betelgeuse as a perfect ball with a sharp edge (the real star has a fuzzy edge,
            pulsates and changes size), uses published values for its angle and distance, and draws the companion’s orbit as a circle. It does not model the inside of
            the star, its pulsations or the 2019 dimming, and it does not combine the different lines of evidence into one number, because the papers give none.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://jpl.nasa.gov/news/nasa-scientist-finds-predicted-companion-star-to-betelgeuse/">
                NASA: NASA scientist finds predicted companion star to Betelgeuse
              </ExternalLink>
              : NASA’s account of the July 2025 announcement.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/what-is-betelgeuse-inside-the-strange-volatile-star">
                NASA: What is Betelgeuse? Inside the strange, volatile star
              </ExternalLink>
              : a plain account of the star, its size, its dimming and its future.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/exoplanets/resources/life-and-death/chapter-6/">NASA: Aging into gianthood</ExternalLink>: how a star becomes a red giant,
              including the Sun’s future.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/stars/">NASA: Stars</ExternalLink>: how a star’s mass decides how it lives and ends.
            </li>
            <li>
              <ExternalLink href="https://www.cfa.harvard.edu/news/cfa-scientists-detect-wake-betelgeuses-elusive-companion-star">
                Center for Astrophysics | Harvard &amp; Smithsonian: scientists detect the “wake” of Betelgeuse’s elusive companion
              </ExternalLink>
              : the January 2026 report of the trail of denser gas.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is
            right, and neither gives the star's size or the chance. */}
        {(
          [
            {
              title: 'Prediction 1: how big?',
              text: (
                <>
                  Betelgeuse is a red supergiant. Imagine it replaced the Sun, with its centre where the Sun is. Mercury, Venus, Earth, Mars and Jupiter would be at their
                  usual distances. How far out would its surface reach?
                </>
              ),
              choices: REACH_CHOICES,
              value: reachPrediction,
              set: (v: Reach) => setReachPrediction(v),
            },
            {
              title: 'Prediction 2: how strong is the hint?',
              text: (
                <>
                  The team’s picture shows a faint spot, at the place and time where a companion was predicted, that is <strong>1.5 sigma</strong> (the spot is 1.5
                  “give-or-takes” stronger than the background noise). If there were really nothing there, and noise alone were responsible, how often would noise make
                  a spot at least this strong in that place? Count only spots that are too strong, not too weak, as in Experiment 1.
                </>
              ),
              choices: SIGMA_CHOICES,
              value: sigmaPrediction,
              set: (v: SigmaAnswer) => setSigmaPrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              {question.text} You are not graded, and a guess is fine.
            </p>
            <div>
              {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => (question.set as (v: never) => void)(choice.value as never)}
                  disabled={hasRun}
                  className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {choice.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
              {question.value !== null
                ? `Your prediction: ${(question.choices as ReadonlyArray<{ value: string; label: string }>).find((c) => c.value === question.value)?.label.toLowerCase()}.`
                : 'Choose an option to continue'}
            </p>
          </div>
        ))}

        <button type="button" className="action-button" onClick={() => setHasRun(true)} disabled={!bothPredicted || hasRun} style={{ padding: '0.6rem 1.5rem' }}>
          Run
        </button>
        {hasRun && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && !hasRun && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0', color: 'var(--text-muted)' }}>
          {hasRun ? 'Your predictions are recorded and not marked here. The pictures and the results will appear here.' : 'The pictures fill in, one stage at a time, after you press Run.'}
        </p>
      </div>
    </div>
  )
}
