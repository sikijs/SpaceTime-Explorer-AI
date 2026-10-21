import type { ReactNode } from 'react'
import { fallDistance, G_EARTH, timeToFall, TRAP_LENGTH_M } from '../physics/antimatterGravity'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 8 (docs/experiments/frontier-and-beyond/08-does-antimatter-fall-down.md).
// Step 2 builds the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of the ALPHA-g trap (an
// illustration, not data), the collapsed "Words and formulas" panel and the skeleton of Picture 1 with its guide. The predictions, Run, the other two
// pictures, the results, the controls, the tutor and the chapter summary come in later steps. All wording is draft for the owner's line-by-line
// approval (CLAUDE.md §28.1), written to the standard of §29. The introduction does not give the measured ratio, the sigma values or the verdicts (that
// is what the two predictions ask, §12). The interface only displays numbers from src/physics (CLAUDE.md §9); the only calculation here is where a
// point is drawn.

interface AntimatterGravityExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const MATTER_COLOR = '#38bdf8' // sky blue: ordinary matter (a ratio of 1)
const ATOM_COLOR = '#fde047' // yellow: an antihydrogen atom
const BARRIER_COLOR = '#fb7185' // rose: a magnetic barrier
const ESCAPE_COLOR = '#4ade80' // green: an atom escaping
const DETECTOR_COLOR = '#c084fc' // purple: a detector
const TRAP_LINE_COLOR = '#fbbf24' // amber: the length of the trap

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

// ---- The ALPHA-g trap (an illustration, not data) ----
function TrapDrawing() {
  const height = 450
  const cx = 190
  const top = 105
  const bottom = 345
  const half = 38
  // A handful of atoms, drawn as dots (the real trap holds about 100).
  const atoms = [
    [-18, 40], [10, 62], [-8, 90], [22, 112], [-24, 140], [4, 158], [26, 178], [-14, 196], [14, 214], [-26, 228], [0, 244], [20, 252],
  ]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="A tall vertical magnetic trap holding a few antihydrogen atoms, with a barrier at the top and at the bottom, detectors round both ends, arrows for atoms escaping upward and downward, and an arrow showing that gravity pulls down"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: the ALPHA-g trap
      </text>

      {/* The tube. */}
      <rect x={cx - half} y={top} width={2 * half} height={bottom - top} rx={10} fill="none" stroke={MUTED_COLOR} strokeWidth={2} />

      {/* The two barriers. */}
      <rect x={cx - half - 8} y={top - 6} width={2 * half + 16} height={12} rx={4} fill={BARRIER_COLOR} />
      <rect x={cx - half - 8} y={bottom - 6} width={2 * half + 16} height={12} rx={4} fill={BARRIER_COLOR} />
      <text x={cx + half + 22} y={top + 4} fill={BARRIER_COLOR} fontSize="11" fontWeight="bold">
        top barrier (lowered slowly)
      </text>
      <text x={cx + half + 22} y={bottom + 4} fill={BARRIER_COLOR} fontSize="11" fontWeight="bold">
        bottom barrier (lowered slowly)
      </text>

      {/* The atoms. */}
      {atoms.map(([dx, dy], i) => (
        <circle key={i} cx={cx + dx} cy={top + 14 + dy * 0.85} r={4.5} fill={ATOM_COLOR} />
      ))}
      <text x={cx + half + 22} y={top + 140} fill={ATOM_COLOR} fontSize="11" fontWeight="bold">
        antihydrogen atoms
      </text>
      <text x={cx + half + 22} y={top + 154} fill={ATOM_COLOR} fontSize="10">
        (about 100 in the real trap;
      </text>
      <text x={cx + half + 22} y={top + 167} fill={ATOM_COLOR} fontSize="10">
        a dozen are drawn)
      </text>

      {/* The atoms that escape. */}
      <line x1={cx} y1={top - 14} x2={cx} y2={top - 44} stroke={ESCAPE_COLOR} strokeWidth={3} />
      <polygon points={`${cx - 6},${top - 40} ${cx},${top - 52} ${cx + 6},${top - 40}`} fill={ESCAPE_COLOR} />
      <text x={cx + 14} y={top - 34} fill={ESCAPE_COLOR} fontSize="11" fontWeight="bold">
        an atom escaping upward
      </text>
      <line x1={cx} y1={bottom + 14} x2={cx} y2={bottom + 44} stroke={ESCAPE_COLOR} strokeWidth={3} />
      <polygon points={`${cx - 6},${bottom + 40} ${cx},${bottom + 52} ${cx + 6},${bottom + 40}`} fill={ESCAPE_COLOR} />
      <text x={cx + 14} y={bottom + 40} fill={ESCAPE_COLOR} fontSize="11" fontWeight="bold">
        an atom escaping downward
      </text>

      {/* The detectors. */}
      <rect x={cx - half - 20} y={top - 28} width={2 * half + 40} height={14} rx={4} fill="none" stroke={DETECTOR_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
      <rect x={cx - half - 20} y={bottom + 14} width={2 * half + 40} height={14} rx={4} fill="none" stroke={DETECTOR_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={20} y={top - 18} fill={DETECTOR_COLOR} fontSize="10" fontWeight="bold">
        detectors
      </text>
      <text x={20} y={bottom + 24} fill={DETECTOR_COLOR} fontSize="10" fontWeight="bold">
        detectors
      </text>

      {/* The height of the trap. */}
      <line x1={cx - half - 44} y1={top} x2={cx - half - 44} y2={bottom} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <polygon points={`${cx - half - 44},${top} ${cx - half - 48},${top + 8} ${cx - half - 40},${top + 8}`} fill={TEXT_COLOR} />
      <polygon points={`${cx - half - 44},${bottom} ${cx - half - 48},${bottom - 8} ${cx - half - 40},${bottom - 8}`} fill={TEXT_COLOR} />
      <text x={cx - half - 52} y={(top + bottom) / 2 - 6} fill={TEXT_COLOR} fontSize="11" textAnchor="end">
        {(TRAP_LENGTH_M * 100).toFixed(1)} cm
      </text>
      <text x={cx - half - 52} y={(top + bottom) / 2 + 8} fill={TEXT_COLOR} fontSize="11" textAnchor="end">
        tall
      </text>

      {/* Gravity. */}
      <line x1={500} y1={160} x2={500} y2={270} stroke={MATTER_COLOR} strokeWidth={4} />
      <polygon points="490,264 500,284 510,264" fill={MATTER_COLOR} />
      <text x={500} y={146} fill={MATTER_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        gravity
      </text>
      <text x={500} y={302} fill={MATTER_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        pulls down
      </text>

      <text x={20} y={height - 12} fill={MUTED_COLOR} fontSize="10">
        A sketch of the idea, not to scale. The real trap is {(TRAP_LENGTH_M * 100).toFixed(1)} cm tall and 4.4 cm across.
      </text>
    </svg>
  )
}

// ---- Picture 1: how far does it fall? (Step 2: the axes, ordinary matter's curve and the trap-length line) ----
const P1_LEFT = 90
const P1_RIGHT = 520
const P1_TOP = 56
const P1_BOTTOM = 330
const P1_HEIGHT = 384
const P1_MAX_SECONDS = 0.5
const P1_MAX_DISTANCE = 1.4 // metres, the top and bottom of the vertical axis (negative: risen)
const timeToX = (seconds: number) => P1_LEFT + (seconds / P1_MAX_SECONDS) * (P1_RIGHT - P1_LEFT)
const distanceToY = (metres: number) => (P1_TOP + P1_BOTTOM) / 2 + (metres / P1_MAX_DISTANCE) * ((P1_BOTTOM - P1_TOP) / 2)

const MATTER_POINTS = (() => {
  const points: string[] = []
  const steps = 50
  for (let i = 0; i <= steps; i++) {
    const t = (P1_MAX_SECONDS * i) / steps
    points.push(`${i === 0 ? 'M' : 'L'}${timeToX(t).toFixed(1)},${distanceToY(fallDistance(1, t)).toFixed(1)}`)
  }
  return points.join(' ')
})()

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Antimatter', meaning: 'matter’s mirror image. An antimatter particle has the same mass as its ordinary partner and the opposite electric charge. CERN’s page on antimatter explains it in plain words.' },
  { term: 'Positron', meaning: 'the antimatter partner of the electron. It has the electron’s mass and a positive charge.' },
  { term: 'Antiproton', meaning: 'the antimatter partner of the proton. It has the proton’s mass and a negative charge.' },
  { term: 'Antihydrogen', meaning: 'the antimatter version of a hydrogen atom: an antiproton with a positron going round it. It is electrically neutral overall, like an ordinary hydrogen atom.' },
  { term: 'Annihilation', meaning: 'what happens when antimatter meets ordinary matter: both disappear, and their mass turns into energy. It is why antimatter has to be kept away from the walls of its container, in a vacuum, held by magnetic fields.' },
  { term: 'Weak equivalence principle', meaning: 'the statement that all objects fall in the same way in a gravitational field, whatever they are made of. A hammer and a feather dropped together on the Moon, where there is no air, land together (NASA’s page on Apollo 15 shows it).' },
  { term: 'g', meaning: 'the acceleration of an ordinary falling object near the Earth’s surface, 9.81 metres per second per second. “Acceleration” is how fast the speed grows: after one second of free fall, an object moves at 9.81 metres per second.' },
  { term: 'Ratio to g', meaning: 'how the acceleration of antihydrogen compares with g. A ratio of 1 means it falls exactly like ordinary matter. A ratio of 0 means gravity does not pull it at all. A negative ratio means it rises.' },
  { term: 'Uncertainty (give or take)', meaning: 'every measurement has a range within which the true value is thought to lie. A result is written as, for example, “1.43 ± 0.06”: the value, and the give or take.' },
  { term: 'Statistical, systematic and simulation uncertainty', meaning: 'three sources of give or take. Statistical: too few atoms, so chance matters. Systematic: a small fault in the equipment that pushes every result the same way. Simulation: the experiment compares its counts with a computer model, and the model itself is not exact.' },
  { term: 'Compatible', meaning: 'a possibility is compatible with a measurement if it lies within about two give-or-takes of it, so the measurement cannot rule it out.' },
  { term: 'Sigma', meaning: 'a way of saying how many give-or-takes a result is from a possibility (Experiment 1 of this group): the bigger the number, the harder it is to say the gap is just chance. About 3 sigma is often called a hint, and 5 sigma is the usual bar for a discovery.' },
]

const lookForTrap: LookFor[] = [
  {
    look: 'the two rose barriers at the top and bottom, and the green arrows that leave through them.',
    means: 'the team lowers both barriers slowly, so that the atoms can leave. Each atom leaves through the top or the bottom, and is not held again.',
    matters: 'by counting how many leave each way, the team can see how gravity pushes the atoms. Without a way out at both ends there would be nothing to compare.',
  },
  {
    look: 'the purple detectors at both ends.',
    means: 'when an antihydrogen atom reaches ordinary matter it annihilates, and a detector registers where.',
    matters: 'annihilation is how the team sees an atom at all: they cannot photograph one, so they count the flashes and where they happen.',
  },
  {
    look: 'the 25.6 cm height, and the gravity arrow.',
    means: 'the whole trap is about as tall as a school ruler and a half, and gravity pulls the same way on everything inside it.',
    matters: 'a trap this small means that very small forces matter. The atoms are so slow that a small push, such as gravity, decides which way they go.',
  },
]

export function AntimatterGravityExperiment(_props: AntimatterGravityExperimentProps) {
  const timeAtTrapLength = timeToFall(1, TRAP_LENGTH_M) as number

  return (
    <div>
      <h2>Experiment 8 — Does Antimatter Fall Down?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): measured directly once, in 2023, and repeated in 2024, to a precision of about 20 percent. The
            full status, with what the measurement found, is shown after you press Run, so that you can guess first.
          </strong>{' '}
          The team that measured it plans to do much better.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Drop a ball and it falls. Drop a feather in a vacuum and it falls just as fast. On the Moon, where there is no air,
            the astronauts of Apollo 15 dropped a hammer and a feather together, and they landed at the same moment (NASA has the story). Physicists believe
            that <strong>everything falls alike</strong>, whatever it is made of. They call this the <strong>weak equivalence principle</strong>. But what
            about <strong>antimatter</strong>, matter’s mirror image? Does it fall down, as ordinary matter does? Does it fall faster or slower? Or does it fall
            up?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Gravity Experiment 1 you met the equivalence principle: a ball in a cabin on the ground and a ball in a
            cabin speeding up through empty space move the same way. That argument works only because everything in the cabin falls alike. If one kind of
            object fell differently, you could use it to tell the two cabins apart. In Experiments 1 and 2 of this group you met <strong>sigma</strong>, a way
            of saying how sure a result is.
          </p>

          <p style={paragraph}>
            <strong>What antimatter is.</strong> Every kind of ordinary particle has an <strong>antiparticle</strong>: the same mass, and the opposite
            electric charge. The antiparticle of the electron is the <strong>positron</strong>, with a positive charge. The antiparticle of the proton is the{' '}
            <strong>antiproton</strong>, with a negative charge. Put an antiproton and a positron together and you get <strong>antihydrogen</strong>, the
            antimatter version of the simplest atom. When antimatter meets ordinary matter, both vanish in a flash of energy: they <strong>annihilate</strong>.
            That makes antimatter hard to keep. It has to be held in a vacuum, by magnetic fields, away from every wall. Think of a soap bubble that pops the
            moment it touches anything.
          </p>

          <p style={paragraph}>
            <strong>Why ask?</strong> Falling has been tested on ordinary matter with extraordinary care. But antimatter is so hard to make and keep that,
            until 2023, nobody had watched it fall. CERN’s own news item on the result describes it as the first direct observation of a gravitational effect
            on the motion of antimatter. So a basic question had never been answered by looking.
          </p>

          <p style={paragraph}>
            <strong>How the measurement works (a sketch, not a model).</strong> The <strong>ALPHA</strong> collaboration at CERN, the European particle-physics
            laboratory, made about 100 antihydrogen atoms and held them in a tall, upright magnetic bottle, the <strong>ALPHA-g</strong> trap. The bottle has
            a barrier at the top and a barrier at the bottom. The team lowered both barriers slowly, so that the atoms could leave. An atom that leaves
            annihilates on the equipment, and detectors register where. If gravity pulls the atoms down, more of them should leave through the bottom than
            through the top. Comparing the counts with a computer simulation gives the acceleration. An everyday comparison: open the top and bottom doors of a
            tall lift shaft, and count who falls out of which door.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <TrapDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is a sketch of the idea, not a picture of the real equipment, and it is not to scale. The tall
              grey tube is the trap, {(TRAP_LENGTH_M * 100).toFixed(1)} cm tall in the real thing. The <strong>yellow dots</strong> are antihydrogen atoms
              (about 100 in reality, a dozen here). The two <strong>rose bars</strong> are the magnetic barriers at the top and the bottom. The{' '}
              <strong>green arrows</strong> show an atom escaping, one upward and one downward. The <strong>purple dashed boxes</strong> are the detectors,
              which register where an atom annihilates. The <strong>blue arrow</strong> on the right shows that gravity pulls down.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForTrap} />
          </div>

          <p style={paragraph}>
            <strong>The ratio.</strong> The team writes its result as a <strong>ratio</strong> to g, the acceleration of an ordinary falling object, which
            is {G_EARTH} metres per second per second near the Earth’s surface. A ratio of <strong>1</strong> means “falls exactly like ordinary matter”. A ratio
            of <strong>0</strong> means “gravity does not pull it at all”. A ratio of <strong>−1</strong> means “falls up, as hard as ordinary matter falls
            down”. For scale, a ratio of 1 falls {fallDistance(1, 1).toFixed(1)} metres in the first second, and it takes {timeAtTrapLength.toFixed(2)} seconds to
            fall the {(TRAP_LENGTH_M * 100).toFixed(1)} cm height of the trap. (That is only a size for the idea: ALPHA-g does not time a fall. It counts where
            atoms leave.)
          </p>

          <p style={paragraph}>
            <strong>Give or take.</strong> Every measurement has a range within which the true value is thought to lie. ALPHA states two: one from counting and
            from the equipment, and one from the computer simulation. The size of a measurement’s give or take matters as much as its value, and the number
            of sigma tells you how many give-or-takes away a possibility is.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> ALPHA published the first direct measurement in 2023, in the journal{' '}
            <em>Nature</em>. The team repeated it in 2024 and reports that the result was reproduced. Its precision is about 20 percent, and the team expects that
            1 percent or better is possible with the existing machine, with upgrades planned for later. What the measurement found is for you to predict, and
            it is shown after the run. Other CERN experiments, AEgIS and GBAR, are preparing to measure the fall by
            different methods. This page does not repeat any of these analyses.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with the ones from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Antimatter</strong>, <strong>positron</strong>, <strong>antiproton</strong>, <strong>antihydrogen</strong> and{' '}
                <strong>annihilation</strong>: matter’s mirror image, and what happens when it meets matter.
              </li>
              <li>
                <strong>Weak equivalence principle</strong>: everything falls alike.
              </li>
              <li>
                <strong>g</strong> and the <strong>ratio to g</strong>: how fast ordinary things fall, and how an antimatter atom compares.
              </li>
              <li>
                <strong>Uncertainty</strong>, with its <strong>statistical</strong>, <strong>systematic</strong> and <strong>simulation</strong> kinds, and{' '}
                <strong>compatible</strong>: the give or take of a result, and when a measurement cannot rule a possibility out.
              </li>
              <li>
                <strong>Sigma</strong> (reminder from Experiments 1 and 2): how sure a result is.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other
            ratios, other give-or-takes and other differences of your own. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It describes how ALPHA-g works but does not simulate it: the step from counts of
            atoms to an acceleration needs a detailed computer simulation that is not reproduced here. It uses the published numbers as the papers state them.
            Where it combines two give-or-takes into one, it does so in the simplest way (a rule for independent errors), and it says so. It treats a fall
            as steady, with a constant acceleration. This experiment does not analyse ALPHA’s data and does not claim a new law of gravity.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links to the original scientific papers and to CERN’s news item on the
            result appear below the results, after you press Run, because their summaries state what the predictions ask, and you should get to guess first.
            Links open in a new tab. This page was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://home.cern/science/physics/antimatter">CERN: Antimatter</ExternalLink>: what antimatter is, how it differs from
              matter, and why physicists study it, in plain words.
            </li>
            <li>
              <ExternalLink href="https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_15_feather_drop.html">NASA: The Apollo 15 hammer-feather drop</ExternalLink>
              : the astronaut who dropped a hammer and a feather on the Moon, and what it showed about falling.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        {/* Picture 1 (Step 2: the skeleton). Ordinary matter's curve and the trap-length line are drawn; the other curves come with Run. */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={P1_HEIGHT}
            viewBox={`0 0 ${VIEW_WIDTH} ${P1_HEIGHT}`}
            style={svgStyle}
            role="img"
            aria-label="A curve of the distance fallen against time for ordinary matter, growing faster and faster, with a dashed line at the 25.6 centimetre height of the trap"
          >
            <text x={P1_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 1: how far does it fall?
            </text>

            {/* The axes and ticks. Zero is in the middle: below it the object has fallen, above it the object has risen. */}
            <line x1={P1_LEFT} y1={P1_TOP} x2={P1_LEFT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
            <line x1={P1_LEFT} y1={distanceToY(0)} x2={P1_RIGHT} y2={distanceToY(0)} stroke={TEXT_COLOR} strokeWidth={1.5} />
            {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((t) => (
              <g key={t}>
                <line x1={timeToX(t)} y1={distanceToY(0)} x2={timeToX(t)} y2={distanceToY(0) - 5} stroke={TEXT_COLOR} />
                {t > 0 && (
                  <text x={timeToX(t)} y={distanceToY(0) - 9} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
                    {t.toFixed(1)}
                  </text>
                )}
              </g>
            ))}
            {[-1, -0.5, 0, 0.5, 1].map((d) => (
              <g key={d}>
                <line x1={P1_LEFT - 6} y1={distanceToY(d)} x2={P1_LEFT} y2={distanceToY(d)} stroke={TEXT_COLOR} />
                <text x={P1_LEFT - 10} y={distanceToY(d) + 3} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
                  {d.toFixed(1)}
                </text>
              </g>
            ))}
            <text x={P1_LEFT} y={P1_TOP - 8} fill={MUTED_COLOR} fontSize="10">
              distance fallen, in metres (below the line: fallen; above it: risen)
            </text>
            <text x={P1_RIGHT} y={distanceToY(0) - 22} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
              time since release, in seconds
            </text>

            {/* The length of the trap, and ordinary matter's curve (from the physics module). */}
            <line x1={P1_LEFT} y1={distanceToY(TRAP_LENGTH_M)} x2={P1_RIGHT} y2={distanceToY(TRAP_LENGTH_M)} stroke={TRAP_LINE_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
            <text x={P1_RIGHT} y={distanceToY(TRAP_LENGTH_M) - 4} fill={TRAP_LINE_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
              {(TRAP_LENGTH_M * 100).toFixed(1)} cm: the height of the ALPHA-g trap
            </text>
            <path d={MATTER_POINTS} fill="none" stroke={MATTER_COLOR} strokeWidth={2.5} />
            <circle cx={timeToX(timeAtTrapLength)} cy={distanceToY(TRAP_LENGTH_M)} r={4.5} fill={MATTER_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
            <text x={timeToX(0.2)} y={distanceToY(0.95)} fill={MATTER_COLOR} fontSize="11" fontWeight="bold">
              ordinary matter (ratio 1)
            </text>

            <text x={P1_LEFT} y={P1_HEIGHT - 12} fill={MUTED_COLOR} fontSize="11">
              The other curves, for antimatter, are drawn here when you press Run.
            </text>
          </svg>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>How to read Picture 1.</strong> This picture shows how far an object falls as time passes after it is let go. The horizontal line is{' '}
            <strong>time</strong> since release, from 0 to 0.5 seconds. The vertical line is the <strong>distance fallen</strong>, in metres: the line in the
            middle is the starting height, a point below it has fallen by that much, and a point above it has <em>risen</em> by that much. (One metre is a
            little over three feet.)
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The blue curve</strong> is an ordinary falling object, a ratio of 1. It starts slowly and bends downward: each second it falls faster
              than the one before, because its speed keeps growing.
            </li>
            <li>
              <strong>The amber dashed line</strong> is {(TRAP_LENGTH_M * 100).toFixed(1)} cm, the height of the ALPHA-g trap, and the dot where the blue curve
              meets it is the moment an ordinary object has fallen that far.
            </li>
            <li>
              <strong>Nothing else is drawn yet.</strong> After you press Run, the picture adds the curves for antimatter: the ratio that ALPHA measured, a ratio of
              0 and a ratio you choose.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> The blue curve is ½ × g × t², with g = {G_EARTH}. After 0.5 seconds: ½ × {G_EARTH} × 0.5 × 0.5 ={' '}
            {fallDistance(1, 0.5).toFixed(2)} metres. It reaches {(TRAP_LENGTH_M * 100).toFixed(1)} cm after about {timeAtTrapLength.toFixed(2)} seconds.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>What to look for.</strong> How the curve bends downward (a fall speeds up), and where it crosses the amber line (a fall of this size is over in
            about a quarter of a second).
          </p>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.5rem', marginBottom: 0 }}>
          The predictions, the run, the other pictures, the results, the controls, the tutor and the summary are not built yet (later steps).
        </p>
      </div>
    </div>
  )
}
