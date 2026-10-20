import { useState } from 'react'
import type { ReactNode } from 'react'
import { A0, darkMatterInsideSolarMasses, GAMMA_MOND_WIDE_BINARY, orbitalSpeed, pullInA0, pullOnPair } from '../physics/wideBinaries'
import type { BoostRange, ContaminationRange } from '../physics/wideBinaries'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Frontier and Beyond, Experiment 7 (docs/experiments/frontier-and-beyond/07-wide-binary-stars.md).
// Step 2 builds the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of two stars orbiting
// (an illustration, not data), the collapsed "Words and formulas" panel and the skeleton of Picture 1 with its guide. The predictions, Run,
// the other two pictures, the results, the controls, the tutor and the chapter summary come in later steps. All wording is draft for the
// owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. The introduction does not say how much faster a pull of 1.4
// makes the stars move, or how much a hidden fraction of pairs fakes (that is what the two predictions ask, §12). The interface only displays
// numbers from src/physics (CLAUDE.md §9); the only calculation here is where a point is drawn.

interface WideBinariesExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const STAR_A_COLOR = '#fde047' // yellow: one star
const STAR_B_COLOR = '#fb923c' // orange: the other star
const ORBIT_COLOR = '#64748b'
const ARROW_COLOR = '#4ade80' // green: the direction of motion
const NEWTON_COLOR = '#38bdf8' // sky blue: Newton's law

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

// "8.9 × 10⁻¹¹" from a number, with the exponent in superscript digits.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sci = (value: number, digits = 2) => {
  const [mantissa, exponent] = value.toExponential(digits - 1).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const BOOST_CHOICES: ReadonlyArray<{ value: BoostRange; label: string }> = [
  { value: 'none', label: 'No noticeable difference' },
  { value: 'about20', label: 'About 20 percent faster' },
  { value: 'about40', label: 'About 40 percent faster' },
  { value: 'about100', label: 'About twice as fast' },
]
const CONTAMINATION_CHOICES: ReadonlyArray<{ value: ContaminationRange; label: string }> = [
  { value: 'about2', label: 'About 2 percent' },
  { value: 'about20', label: 'About 20 percent' },
  { value: 'about100', label: 'About 100 percent' },
]

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

// ---- Two stars orbiting (an illustration, not data) ----
function OrbitDrawing() {
  const height = 372
  const cx = 230
  const cy = 190
  const r = 95
  const ax = cx + r // star A, on the right
  const bx = cx - r // star B, on the left
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Two stars far apart orbiting a point halfway between them, with arrows showing the direction each one moves and a line showing the separation"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: a wide binary star
      </text>

      {/* The orbit and the centre. */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ORBIT_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      <circle cx={cx} cy={cy} r={3} fill={TEXT_COLOR} />
      <text x={cx} y={cy + 18} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
        centre they orbit
      </text>

      {/* The two stars and their directions of motion. */}
      <circle cx={ax} cy={cy} r={11} fill={STAR_A_COLOR} />
      <circle cx={bx} cy={cy} r={8} fill={STAR_B_COLOR} />
      <line x1={ax} y1={cy - 16} x2={ax} y2={cy - 52} stroke={ARROW_COLOR} strokeWidth={2.5} />
      <polygon points={`${ax - 5},${cy - 50} ${ax},${cy - 60} ${ax + 5},${cy - 50}`} fill={ARROW_COLOR} />
      <line x1={bx} y1={cy + 14} x2={bx} y2={cy + 52} stroke={ARROW_COLOR} strokeWidth={2.5} />
      <polygon points={`${bx - 5},${cy + 50} ${bx},${cy + 60} ${bx + 5},${cy + 50}`} fill={ARROW_COLOR} />
      <text x={ax + 18} y={cy + 4} fill={STAR_A_COLOR} fontSize="11" fontWeight="bold">
        star A
      </text>
      <text x={bx - 18} y={cy + 4} fill={STAR_B_COLOR} fontSize="11" fontWeight="bold" textAnchor="end">
        star B
      </text>
      <text x={ax + 18} y={cy - 56} fill={ARROW_COLOR} fontSize="10">
        direction of motion
      </text>

      {/* The separation. */}
      <line x1={bx} y1={cy + 90} x2={ax} y2={cy + 90} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <polygon points={`${bx},${cy + 90} ${bx + 8},${cy + 86} ${bx + 8},${cy + 94}`} fill={TEXT_COLOR} />
      <polygon points={`${ax},${cy + 90} ${ax - 8},${cy + 86} ${ax - 8},${cy + 94}`} fill={TEXT_COLOR} />
      <text x={cx} y={cy + 108} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        separation s (thousands of AU)
      </text>

      {/* The scale note. */}
      <text x={20} y={height - 30} fill={MUTED_COLOR} fontSize="10">
        For scale: the Earth’s whole orbit around the Sun is 1 AU, a dot about
      </text>
      <text x={20} y={height - 16} fill={MUTED_COLOR} fontSize="10">
        10,000 times smaller than the separation drawn here (for a 10,000 AU pair).
      </text>
    </svg>
  )
}

// ---- Picture 1: how fast do two stars orbit? (Step 2: the axes and Newton's curve) ----
const P1_LEFT = 70
const P1_RIGHT = 520
const P1_TOP = 56
const P1_BOTTOM = 210
const P1_HEIGHT = 290
const P1_MIN_AU = 500
const P1_MAX_AU = 30000
const P1_MAX_SPEED = 1800 // m/s, the top of the vertical axis
const P1_MASS = 1.5 // solar masses: the experiment's own choice, not a published value
const auToX = (au: number) => P1_LEFT + (Math.log(au / P1_MIN_AU) / Math.log(P1_MAX_AU / P1_MIN_AU)) * (P1_RIGHT - P1_LEFT)
const speedToY = (speed: number) => P1_BOTTOM - (speed / P1_MAX_SPEED) * (P1_BOTTOM - P1_TOP)

const NEWTON_POINTS = (() => {
  const points: string[] = []
  const steps = 120
  for (let i = 0; i <= steps; i++) {
    const au = P1_MIN_AU * Math.pow(P1_MAX_AU / P1_MIN_AU, i / steps)
    points.push(`${i === 0 ? 'M' : 'L'}${auToX(au).toFixed(1)},${speedToY(orbitalSpeed(P1_MASS, au)).toFixed(1)}`)
  }
  return points.join(' ')
})()

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Dark matter', meaning: 'the unseen material that supplies extra gravity in galaxies and galaxy clusters (Cosmology Experiments 4 and 7). Its gravity is measured. What it is made of is not known (Experiment 6 of this group searched for its particles).' },
  { term: 'Binary star and wide binary', meaning: 'a binary star is two stars held together by their gravity, each orbiting the other. A wide binary is a pair far apart, thousands of times the Earth-Sun distance, so it moves very slowly. NASA says that more than half of all stars in the sky have one or more partners.' },
  { term: 'AU (astronomical unit)', meaning: 'the distance from the Earth to the Sun, about 150 million kilometres. It is the everyday ruler for distances inside a star system. “10,000 AU” means 10,000 times the Earth-Sun distance.' },
  { term: 'Separation', meaning: 'the distance between the two stars of a pair, written s. In this experiment it is measured in AU.' },
  { term: 'Orbital speed', meaning: 'how fast the stars move round their common centre. For a circular orbit it is v = √(G × M ÷ s), where M is the total mass of the two stars, s is their separation and G is the number that sets how strong gravity is. A wider pair is slower.' },
  { term: 'Pull (gravity’s acceleration)', meaning: 'how strongly gravity tugs on a star, written g, in metres per second per second (m/s²). It is g = G × M ÷ s². It gets weaker very quickly with distance: twice as far means a quarter of the pull.' },
  { term: 'Newtonian gravity', meaning: 'gravity as Newton’s law of gravitation gives it, the law that is used for almost everything from falling apples to orbiting satellites. It is the standard against which a change of law is compared.' },
  { term: 'MOND', meaning: '“Modified Newtonian Dynamics”: an idea that, when gravity is very weak (below a small acceleration called a₀), it pulls somewhat harder than Newton’s law says. It is an alternative to dark matter as an explanation for why galaxies spin so fast. It is a proposal that is being tested, and it is not settled.' },
  { term: 'a₀', meaning: 'the small acceleration, about 1.2 × 10⁻¹⁰ m/s², below which MOND says gravity changes. For scale, the Earth’s pull at its surface is 9.8 m/s². The value is quoted from the MOND literature.' },
  { term: 'Gravity boost factor (γ)', meaning: 'how many times stronger the pull is than Newton’s law says. γ = 1 means Newton’s law, and γ = 1.4 means a pull 1.4 times as strong.' },
  { term: 'External field effect', meaning: 'in MOND, the pull of the whole Galaxy on a pair is not negligible, and it reduces how much extra pull the pair’s own weak gravity shows. It is the reason that the papers expect a boost of about 1.4 for wide binaries in the Galaxy and not a larger one. It is named here and not modelled.' },
  { term: 'Hidden companion', meaning: 'a third star, very close to one of the pair, that is too close to be told apart from it. It makes that “pair” move faster than a true pair of two stars would.' },
  { term: 'Contaminated sample', meaning: 'a list of pairs that includes some that are not true pairs, for example because of a hidden companion. Even a small share of them can change the average.' },
  { term: 'Systematic error', meaning: 'an error that pushes all the results the same way, for example by the way the pairs were chosen, instead of random errors that average out. A study of thousands of pairs can have tiny random errors and still be wrong because of a systematic one.' },
  { term: 'Gaia', meaning: 'a European Space Agency (ESA) space observatory that measured the positions and motions of about two billion stars, and is the source of the wide-binary data used in the studies on this page.' },
  { term: 'Sigma', meaning: 'a way of saying how sure a result is (Experiment 1 of this group): the bigger the number, the less likely the result is just chance. About 3 sigma is often called evidence, and 5 sigma is the usual bar for a discovery.' },
]

export function WideBinariesExperiment(_props: WideBinariesExperimentProps) {
  const [boostPrediction, setBoostPrediction] = useState<BoostRange | null>(null)
  const [contaminationPrediction, setContaminationPrediction] = useState<ContaminationRange | null>(null)
  // Step 3 only locks the predictions in; the five-stage run is the next step.
  const [hasRun, setHasRun] = useState(false)
  const bothPredicted = boostPrediction !== null && contaminationPrediction !== null
  function startOver() {
    setBoostPrediction(null)
    setContaminationPrediction(null)
    setHasRun(false)
  }
  const speedAt1000 = orbitalSpeed(P1_MASS, 1000)
  const speedAt10000 = orbitalSpeed(P1_MASS, 10000)
  const pullAt10000 = pullOnPair(P1_MASS, 10000)
  const earthPullRatio = 9.8 / pullAt10000
  const inA0 = pullInA0(P1_MASS, 10000)
  const dm30000 = darkMatterInsideSolarMasses(30000)

  return (
    <div>
      <h2>Experiment 7 — Do We Need Dark Matter, or Does Gravity Change?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): Contested. Careful teams read the same kind of data from the Gaia space observatory and do not
            agree on whether gravity changes when it is very weak.
          </strong>{' '}
          Neither answer has won.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Galaxies spin faster than the matter we can see can explain. The usual answer is <strong>dark matter</strong>:
            unseen material whose gravity we feel. But there is another idea: that gravity itself gets a little stronger when it is very weak. How could
            we tell the two apart? Two stars very far apart, orbiting each other, are a clean test. So why do the scientists who study them not agree?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Cosmology Experiments 4 and 7 you saw that galaxies spin too fast, and that light is bent by more mass than
            we can see. In Experiment 6 of this group you saw that searches for a dark-matter <em>particle</em> have found none so far. This experiment looks
            at the other possibility: that the law of gravity, and not the amount of matter, needs changing.
          </p>

          <p style={paragraph}>
            <strong>Two stars that orbit.</strong> A <strong>binary star</strong> is two stars held together by their gravity, each going round the other.
            NASA says that “more than half of all stars in the sky have one or more partners”. In a <strong>wide binary</strong> the two stars are very far
            apart, measured in <strong>AU</strong>: one AU is the distance from the Earth to the Sun, about 150 million kilometres. A pair 10,000 AU apart is
            10,000 times as far apart as the Earth and the Sun.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <OrbitDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is an illustration of the idea, not a picture of a real pair. The two filled circles are the two
              stars: <strong>star A</strong> (yellow, the heavier one here) and <strong>star B</strong> (orange). They go round a point between them, marked{' '}
              <strong>“centre they orbit”</strong>, along the dashed circle. The green arrows show the <strong>direction each star is moving</strong> right
              now: the two move in opposite directions, so they stay on opposite sides of the centre. The double-headed line below is the{' '}
              <strong>separation s</strong>, the distance between the stars. The sizes are for illustration only. For a real pair 10,000 AU apart, the
              Earth’s whole orbit around the Sun would be a dot about 10,000 times smaller than the separation, which is why the note says “for scale”.
            </p>
          </div>

          <p style={paragraph}>
            <strong>How fast do they go?</strong> A pair that is far apart moves slowly, just as a satellite high above the Earth moves more slowly than one
            close to it. For a circular orbit, Newton’s law of gravity gives the speed as <strong>v = √(G × M ÷ s)</strong>, where <em>M</em> is the total
            mass of the two stars, <em>s</em> is their separation and <em>G</em> is the number that sets how strong gravity is. Take a pair with the mass of
            1.5 Suns (a choice made for this experiment, not a measured pair). At 1,000 AU its stars move at about {speedAt1000.toFixed(0)} metres per second,
            and at 10,000 AU at only about {speedAt10000.toFixed(0)} metres per second. Ten times as far apart gives about a third of the speed.
          </p>

          <p style={paragraph}>
            <strong>Very weak gravity.</strong> The pull between the stars, <strong>g = G × M ÷ s²</strong>, falls fast with distance. At 10,000 AU the pull
            on a pair of 1.5 Suns is only about {sci(pullAt10000)} metres per second per second. The Earth’s pull on you
            is 9.8 in the same units, about {Math.round(earthPullRatio / 1e9).toLocaleString('en-US')} billion times stronger. That is a very weak pull, and it is why a wide
            binary is such a good place to ask whether gravity behaves differently when it is weak.
          </p>

          <p style={paragraph}>
            <strong>What “changing gravity” means.</strong> One well-known idea is <strong>MOND</strong> (“Modified Newtonian Dynamics”). It says that when
            the pull falls below a small value called <strong>a₀</strong>, about {sci(A0)} m/s², gravity pulls somewhat harder than
            Newton’s law says. The pair above, at 10,000 AU, has a pull of about {inA0.toFixed(2)} a₀: in the range where MOND would matter. To describe a
            change of law as a number, we write the pull as <strong>γ times</strong> Newton’s (the <strong>gravity boost factor</strong>). So γ = 1 is
            Newton’s law, and γ = 1.4 is a pull 1.4 times as strong. For wide binaries in our Galaxy, the papers say MOND predicts about{' '}
            {GAMMA_MOND_WIDE_BINARY}. (Why not larger: the pull of the whole Galaxy on a pair also counts, and in MOND it reduces the extra pull. This is
            called the <strong>external field effect</strong>. This experiment names it and does not model it.)
          </p>

          <p style={paragraph}>
            <strong>Why wide binaries are a clean test.</strong> If a pair moved faster than Newton’s law says, could hidden dark matter be the reason?
            Hardly: at the density of dark matter near the Sun (about 0.01 times the mass of the Sun in every cubic parsec, a rough number), the dark matter
            inside a sphere 30,000 AU across would weigh only about {sci(dm30000)} of a Sun, against 1.5 Suns of stars. So a
            speed-up in a wide binary would point to the law of gravity and not to hidden mass. The data come from <strong>Gaia</strong>, the European Space
            Agency’s observatory, which has measured the positions and motions of about two billion stars.
          </p>

          <p style={paragraph}>
            <strong>Why it is hard.</strong> The effect being looked for is small, about a fifth in the speed, and the data are messy. A star in a pair can have
            a <strong>hidden companion</strong>: a third star so close to it that it cannot be told apart, which makes that “pair” move faster than a true pair.
            Pairs are seen from the side at all sorts of angles. Distances and masses have errors. Think of a poll that asks 1,000 people and finds 52
            percent in favour: a few wrong answers, all in one direction, can change the result. A study of thousands of pairs can have tiny random errors
            and still be wrong because of an error that pushes all the results the same way (a <strong>systematic error</strong>).
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> Banik and colleagues (2024) analysed 8,611 wide binaries and report that Newton’s law is
            preferred at 19 sigma. Chae and colleagues report a boost: about 5 sigma in a paper on 2,463 binaries (2023), and in January 2026 a 3 sigma result
            from 36 binaries whose velocities were measured in three dimensions. In March 2026, Saad and Ting analysed those same 36 binaries in a different
            way and found no boost. In February 2026, Cookson and colleagues reported that their cleanest sample shows none either. Because careful teams
            disagree, the label is <strong>Contested</strong>.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Binary star</strong>, <strong>wide binary</strong>, <strong>AU</strong> and <strong>separation</strong>: two stars that orbit each
                other, far apart, and the distance between them.
              </li>
              <li>
                <strong>Orbital speed</strong> and <strong>pull</strong>: how fast the stars move, and how strongly gravity tugs on them.
              </li>
              <li>
                <strong>MOND</strong>, <strong>a₀</strong> and the <strong>gravity boost factor γ</strong>: an idea that gravity is stronger than Newton’s
                law says when it is very weak, and a number that says by how much.
              </li>
              <li>
                <strong>External field effect</strong>: why the extra pull is expected to be about 1.4 times and not more.
              </li>
              <li>
                <strong>Hidden companion</strong>, <strong>contaminated sample</strong> and <strong>systematic error</strong>: how a small share of
                the wrong kind of pair can change an average.
              </li>
              <li>
                <strong>Sigma</strong> (reminder from Experiments 1 and 2): how sure a result is.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then choose a
            pair of your own and change how many of the pairs are really triples. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It treats the orbits as circles. It takes the boost of about 1.4 from the
            papers and does not work it out: it does not show how a boost switches on with separation, because the papers do not agree on that. Its
            “hidden companion” model is a toy that you control, not any team’s analysis. The pair’s mass of 1.5 Suns is a choice made here. And all the
            published numbers are quoted as the papers state them, which are not always comparable with each other. This experiment does not analyse any
            Gaia data and does not decide between the teams.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links to the original scientific papers appear below the results,
            after you press Run, because their summaries state what the predictions ask, and you should get to guess first. Links open in a new tab. This
            page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/stars/multiple-star-systems/">NASA: Multiple star systems</ExternalLink>: what binary
              and multiple star systems are, how common they are, and the many kinds there are.
            </li>
            <li>
              <ExternalLink href="https://www.esa.int/Science_Exploration/Space_Science/Gaia">ESA: Gaia</ExternalLink>: the observatory that measured the
              positions and motions of about two billion stars, from the agency that runs it.
            </li>
            <li>
              <ExternalLink href="https://home.cern/science/physics/dark-matter">CERN: Dark matter</ExternalLink>: what dark matter is, why galaxies need
              it, and how physicists look for it, in plain words.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither
            says which answer is right, gives the square-root rule, or gives the size of the signal that is being looked for. */}
        {(
          [
            {
              title: 'Prediction 1: how much faster?',
              text: (
                <>
                  Two stars, <strong>10,000 times the Earth-Sun distance</strong> apart, orbit each other so slowly that their gravity is very weak.
                  Suppose a modified law of gravity made the pull between them <strong>{GAMMA_MOND_WIDE_BINARY} times stronger</strong> than Newton’s
                  law says. How much faster would they orbit than Newton’s law says?
                </>
              ),
              choices: BOOST_CHOICES,
              value: boostPrediction,
              set: (v: BoostRange) => setBoostPrediction(v),
            },
            {
              title: 'Prediction 2: how much can hidden stars fake?',
              text: (
                <>
                  In a study of wide pairs, suppose <strong>1 pair in every 5</strong> is secretly a triple star, and its hidden third star makes it move{' '}
                  <strong>twice as fast</strong> as a true pair. The other 4 in 5 are true pairs that move as Newton’s law says. How much faster is the{' '}
                  <strong>average</strong> speed than Newton’s law says?
                </>
              ),
              choices: CONTAMINATION_CHOICES,
              value: contaminationPrediction,
              set: (v: ContaminationRange) => setContaminationPrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginBottom: '2rem' }}>
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
        {hasRun && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>
            Your predictions are recorded and not marked here. The pictures that build up after Run are not built yet (next step).
          </p>
        )}

        {/* Picture 1 (Step 2: the skeleton). Newton's curve is drawn; the learner's pair and the boosted line come with Run. */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={P1_HEIGHT}
            viewBox={`0 0 ${VIEW_WIDTH} ${P1_HEIGHT}`}
            style={svgStyle}
            role="img"
            aria-label="A curve of the orbital speed of a pair of stars against their separation, falling as the separation grows"
          >
            <text x={P1_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 1: how fast do two stars orbit?
            </text>

            {/* The axes and ticks. */}
            <line x1={P1_LEFT} y1={P1_BOTTOM} x2={P1_RIGHT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
            <line x1={P1_LEFT} y1={P1_TOP} x2={P1_LEFT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
            {[500, 1000, 2000, 5000, 10000, 30000].map((au) => (
              <g key={au}>
                <line x1={auToX(au)} y1={P1_BOTTOM} x2={auToX(au)} y2={P1_BOTTOM + 6} stroke={TEXT_COLOR} />
                <text x={auToX(au)} y={P1_BOTTOM + 20} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
                  {au.toLocaleString('en-US')}
                </text>
              </g>
            ))}
            {[0, 400, 800, 1200, 1600].map((speed) => (
              <g key={speed}>
                <line x1={P1_LEFT - 6} y1={speedToY(speed)} x2={P1_LEFT} y2={speedToY(speed)} stroke={TEXT_COLOR} />
                <text x={P1_LEFT - 10} y={speedToY(speed) + 3} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
                  {speed}
                </text>
              </g>
            ))}
            <text x={(P1_LEFT + P1_RIGHT) / 2} y={P1_BOTTOM + 40} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
              separation of the two stars, in AU (a logarithmic scale)
            </text>
            <text x={P1_LEFT} y={P1_TOP - 8} fill={MUTED_COLOR} fontSize="10">
              orbital speed, in metres per second
            </text>

            {/* Newton's curve for a pair of 1.5 Suns (from the physics module). */}
            <path d={NEWTON_POINTS} fill="none" stroke={NEWTON_COLOR} strokeWidth={2.5} />
            <text x={auToX(1500)} y={speedToY(orbitalSpeed(P1_MASS, 1500)) - 10} fill={NEWTON_COLOR} fontSize="11" fontWeight="bold">
              Newton’s law, pair of {P1_MASS} Suns
            </text>

            <text x={P1_LEFT} y={P1_HEIGHT - 12} fill={MUTED_COLOR} fontSize="11">
              Your chosen pair, and the line for a stronger pull, are drawn here when you press Run.
            </text>
          </svg>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>How to read Picture 1.</strong> This picture shows how fast the two stars of a wide pair move round each other, for different
            separations. The horizontal line is the <strong>separation</strong> in AU, from 500 to 30,000. It is a <strong>logarithmic</strong> scale: each
            step to the right multiplies the distance instead of adding to it, so a wide range fits in one picture. The vertical line is the{' '}
            <strong>orbital speed</strong> in metres per second (one metre per second is about 3.6 kilometres per hour, a walking pace).
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The blue curve</strong> is Newton’s law, v = √(G × M ÷ s), for a pair with the mass of {P1_MASS} Suns (the mass is this experiment’s
              own choice). It falls as the separation grows: a wider pair moves more slowly, because gravity between the stars is weaker.
            </li>
            <li>
              <strong>Nothing else is drawn yet.</strong> After you press Run, the picture will add the pair you choose and a second line for a stronger pull.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> At 1,000 AU the curve gives about {speedAt1000.toFixed(0)} m/s. At 10,000 AU, ten times further, it gives
            about {speedAt10000.toFixed(0)} m/s. The ratio is {(speedAt10000 / speedAt1000).toFixed(2)}, which is 1 ÷ √10: ten times the distance gives about a
            third of the speed. A hundred times the distance would give a tenth.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What to look for.</strong> How steeply the curve falls, and how slowly the stars move at the right-hand end (a few hundred metres per second).
          </p>
        </div>
      </div>
    </div>
  )
}
