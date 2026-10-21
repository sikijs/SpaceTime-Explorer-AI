import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  A0,
  contaminatedRatio,
  darkMatterInsideSolarMasses,
  fractionToFake,
  GAMMA_MOND_WIDE_BINARY,
  orbitalSpeed,
  PUBLISHED_RESULTS,
  pullInA0,
  pullOnPair,
  speedBoost,
  speedBoostPercent,
} from '../physics/wideBinaries'
import type { BoostRange, ContaminationRange } from '../physics/wideBinaries'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Frontier and Beyond, Experiment 7 (docs/experiments/frontier-and-beyond/07-wide-binary-stars.md).
// Step 2 built the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of two stars orbiting
// (an illustration, not data), the collapsed "Words and formulas" panel and Picture 1's skeleton. Step 3 built the two predictions. Step 4
// builds the five-stage run (Picture 1 filled in over stages 1 to 3, Picture 2 in stage 4, Picture 3 in stage 5), each with a guide. The
// results, the controls, the tutor and the chapter summary come in later steps. The run's timer only paces the display (CLAUDE.md §11). All wording is draft for the
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
const BOOST_COLOR = '#fb7185' // rose: a pull 1.4 times as strong (the MOND papers' prediction)
const HIDDEN_COLOR = '#c084fc' // purple: a sample with hidden triples
const RESULT_COLOR = '#5eead4' // teal: a published result
const BELOW_A0_COLOR = '#fbbf24' // amber: a pull below a0

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

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = [
  '',
  'How fast two stars orbit',
  'How weak the pull is',
  'A stronger pull',
  'Hidden stars can fake a boost',
  'What the teams found',
]

// ---- Picture 1: how fast do two stars orbit? Stage 1: Newton's curve and a pair; stage 2: the pull row; stage 3: the stronger-pull line ----
const P1_LEFT = 95
const P1_RIGHT = 520
const P1_TOP = 56
const P1_BOTTOM = 210
const P1_HEIGHT = 312
const P1_MIN_AU = 500
const P1_MAX_AU = 30000
const P1_MAX_SPEED = 2000 // m/s, the top of the vertical axis (the stronger-pull line reaches about 1,930 at 500 AU)
const P1_MASS = 1.5 // solar masses: the experiment's own choice, not a published value
const P1_PAIR_AU = 10000 // the pair that is marked (the same pair as Prediction 1; the learner's own pair comes with the controls)
const auToX = (au: number) => P1_LEFT + (Math.log(au / P1_MIN_AU) / Math.log(P1_MAX_AU / P1_MIN_AU)) * (P1_RIGHT - P1_LEFT)
const speedToY = (speed: number) => P1_BOTTOM - (speed / P1_MAX_SPEED) * (P1_BOTTOM - P1_TOP)

// A curve of the speed against the separation, from the physics module; `factor` is 1 for Newton's law.
const speedCurve = (factor: number) => {
  const points: string[] = []
  const steps = 120
  for (let i = 0; i <= steps; i++) {
    const au = P1_MIN_AU * Math.pow(P1_MAX_AU / P1_MIN_AU, i / steps)
    points.push(`${i === 0 ? 'M' : 'L'}${auToX(au).toFixed(1)},${speedToY(orbitalSpeed(P1_MASS, au) * factor).toFixed(1)}`)
  }
  return points.join(' ')
}
const NEWTON_POINTS = speedCurve(1)
const BOOST_POINTS = speedCurve(speedBoost(GAMMA_MOND_WIDE_BINARY))
const formatPull = (value: number) => (value >= 10 ? value.toFixed(0) : value >= 1 ? value.toFixed(1) : value.toFixed(2))

function PictureOne({ stage }: { stage: number }) {
  const boost = speedBoost(GAMMA_MOND_WIDE_BINARY)
  const pairX = auToX(P1_PAIR_AU)
  const newtonSpeed = orbitalSpeed(P1_MASS, P1_PAIR_AU)
  const boostedSpeed = newtonSpeed * boost
  return (
    <svg
      width={VIEW_WIDTH}
      height={P1_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${P1_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label="A curve of the orbital speed of a pair of stars against their separation, falling as the separation grows, with the pull between the stars under the axis and a second, higher line for a stronger pull"
    >
      <text x={P1_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: how fast do two stars orbit?
      </text>

      {/* The axes and ticks. */}
      <line x1={P1_LEFT} y1={P1_BOTTOM} x2={P1_RIGHT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <line x1={P1_LEFT} y1={P1_TOP} x2={P1_LEFT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {[500, 1000, 2000, 5000, 10000, 30000].map((au) => {
        const pull = pullInA0(P1_MASS, au)
        return (
          <g key={au}>
            <line x1={auToX(au)} y1={P1_BOTTOM} x2={auToX(au)} y2={P1_BOTTOM + 6} stroke={TEXT_COLOR} />
            <text x={auToX(au)} y={P1_BOTTOM + 20} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
              {au.toLocaleString('en-US')}
            </text>
            {stage >= 2 && (
              <text x={auToX(au)} y={P1_BOTTOM + 38} fill={pull < 1 ? BELOW_A0_COLOR : TEXT_COLOR} fontSize="10" fontWeight="bold" textAnchor="middle">
                {formatPull(pull)}
              </text>
            )}
          </g>
        )
      })}
      {[0, 400, 800, 1200, 1600, 2000].map((speed) => (
        <g key={speed}>
          <line x1={P1_LEFT - 6} y1={speedToY(speed)} x2={P1_LEFT} y2={speedToY(speed)} stroke={TEXT_COLOR} />
          <text x={P1_LEFT - 10} y={speedToY(speed) + 3} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
            {speed}
          </text>
        </g>
      ))}
      {stage >= 2 && (
        <text x={P1_LEFT - 24} y={P1_BOTTOM + 38} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
          pull, in a₀
        </text>
      )}
      <text x={(P1_LEFT + P1_RIGHT) / 2} y={P1_BOTTOM + 58} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        separation of the two stars, in AU (a logarithmic scale)
      </text>
      <text x={P1_LEFT} y={P1_TOP - 8} fill={MUTED_COLOR} fontSize="10">
        orbital speed, in metres per second
      </text>

      {/* The lines (from the physics module). The stronger-pull line is parallel to Newton's: it is drawn at a fixed ratio. */}
      {stage >= 3 && <path d={BOOST_POINTS} fill="none" stroke={BOOST_COLOR} strokeWidth={2.5} strokeDasharray="7 4" />}
      <path d={NEWTON_POINTS} fill="none" stroke={NEWTON_COLOR} strokeWidth={2.5} />

      {/* The key, on the canvas. */}
      <line x1={270} y1={66} x2={295} y2={66} stroke={NEWTON_COLOR} strokeWidth={2.5} />
      <text x={302} y={70} fill={NEWTON_COLOR} fontSize="10" fontWeight="bold">
        Newton’s law, pair of {P1_MASS} Suns
      </text>
      {stage >= 3 && (
        <>
          <line x1={270} y1={88} x2={295} y2={88} stroke={BOOST_COLOR} strokeWidth={2.5} strokeDasharray="7 4" />
          <text x={302} y={86} fill={BOOST_COLOR} fontSize="10" fontWeight="bold">
            if gravity were {GAMMA_MOND_WIDE_BINARY} times stronger,
          </text>
          <text x={302} y={99} fill={BOOST_COLOR} fontSize="10" fontWeight="bold">
            as the MOND papers predict for
          </text>
          <text x={302} y={112} fill={BOOST_COLOR} fontSize="10" fontWeight="bold">
            wide binaries in the Galaxy
          </text>
        </>
      )}

      {/* The marked pair, 10,000 AU apart. */}
      {stage >= 1 && (
        <>
          <line x1={pairX} y1={stage >= 3 ? 150 : 144} x2={pairX} y2={speedToY(stage >= 3 ? boostedSpeed : newtonSpeed) - 5} stroke={MUTED_COLOR} strokeDasharray="2 3" />
          <circle cx={pairX} cy={speedToY(newtonSpeed)} r={5} fill={NEWTON_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
          {stage >= 3 && <circle cx={pairX} cy={speedToY(boostedSpeed)} r={5} fill={BOOST_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />}
          {stage < 3 ? (
            <text x={pairX} y={140} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
              a pair {P1_PAIR_AU.toLocaleString('en-US')} AU apart: {newtonSpeed.toFixed(0)} m/s
            </text>
          ) : (
            <>
              <text x={pairX} y={133} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
                a pair {P1_PAIR_AU.toLocaleString('en-US')} AU apart:
              </text>
              <text x={pairX} y={146} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
                Newton {newtonSpeed.toFixed(0)} m/s, stronger pull {boostedSpeed.toFixed(0)} m/s
              </text>
            </>
          )}
        </>
      )}

      <text x={P1_LEFT} y={P1_HEIGHT - 10} fill={MUTED_COLOR} fontSize="10">
        {stage >= 3 ? `Both lines are for a pair with the mass of ${P1_MASS} Suns (this experiment’s own choice).` : 'The pair’s mass of 1.5 Suns is this experiment’s own choice.'}
      </text>
    </svg>
  )
}

// ---- Picture 2: how hidden stars fake a boost (appears in stage 4) ----
const P2_LEFT = 70
const P2_RIGHT = 520
const P2_TOP = 60
const P2_BOTTOM = 220
const P2_HEIGHT = 292
const P2_MAX_FRACTION = 0.5
const P2_MIN_RATIO = 1
const P2_MAX_RATIO = 1.5
const P2_FRACTION = 0.2 // Prediction 2's example: 1 pair in 5
const P2_FACTOR = 2 // Prediction 2's example: a hidden-triple pair moves twice as fast (the learner's own factor comes with the controls)
const fractionToX = (fraction: number) => P2_LEFT + (fraction / P2_MAX_FRACTION) * (P2_RIGHT - P2_LEFT)
const ratioToY = (ratio: number) => P2_BOTTOM - ((ratio - P2_MIN_RATIO) / (P2_MAX_RATIO - P2_MIN_RATIO)) * (P2_BOTTOM - P2_TOP)

function PictureTwo() {
  const expected = speedBoost(GAMMA_MOND_WIDE_BINARY)
  const matchFraction = fractionToFake(speedBoostPercent(GAMMA_MOND_WIDE_BINARY), P2_FACTOR)
  const examplePoint = contaminatedRatio(P2_FRACTION, P2_FACTOR)
  const linePoints = [0, 0.1, 0.2, 0.3, 0.4, 0.5].map((f) => `${f === 0 ? 'M' : 'L'}${fractionToX(f).toFixed(1)},${ratioToY(contaminatedRatio(f, P2_FACTOR)).toFixed(1)}`).join(' ')
  const bx = fractionToX(matchFraction)
  return (
    <svg
      width={VIEW_WIDTH}
      height={P2_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${P2_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label="A rising line of the average speed of a sample of pairs against the share of the pairs that are really triples, with a dashed horizontal line at the speed that the MOND papers expect"
    >
      <text x={P2_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: how hidden stars fake a boost
      </text>
      <line x1={P2_LEFT} y1={P2_BOTTOM} x2={P2_RIGHT} y2={P2_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <line x1={P2_LEFT} y1={P2_TOP} x2={P2_LEFT} y2={P2_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {[0, 10, 20, 30, 40, 50].map((percent) => (
        <g key={percent}>
          <line x1={fractionToX(percent / 100)} y1={P2_BOTTOM} x2={fractionToX(percent / 100)} y2={P2_BOTTOM + 6} stroke={TEXT_COLOR} />
          <text x={fractionToX(percent / 100)} y={P2_BOTTOM + 20} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            {percent}
          </text>
        </g>
      ))}
      {[1, 1.1, 1.2, 1.3, 1.4, 1.5].map((ratio) => (
        <g key={ratio}>
          <line x1={P2_LEFT - 6} y1={ratioToY(ratio)} x2={P2_LEFT} y2={ratioToY(ratio)} stroke={TEXT_COLOR} />
          <text x={P2_LEFT - 10} y={ratioToY(ratio) + 3} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
            {ratio.toFixed(1)}
          </text>
        </g>
      ))}
      <text x={(P2_LEFT + P2_RIGHT) / 2} y={P2_BOTTOM + 38} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        share of the “pairs” that are really triples (percent)
      </text>
      <text x={P2_LEFT} y={P2_TOP - 10} fill={MUTED_COLOR} fontSize="10">
        average speed of the whole sample, as a multiple of Newton’s speed
      </text>

      {/* The speed that the MOND papers expect (the same boost as Picture 1), and the line for hidden triples. */}
      <line x1={P2_LEFT} y1={ratioToY(expected)} x2={P2_RIGHT} y2={ratioToY(expected)} stroke={BOOST_COLOR} strokeWidth={2} strokeDasharray="7 4" />
      <text x={P2_RIGHT - 6} y={ratioToY(expected) + 16} fill={BOOST_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
        speed the MOND papers expect:
      </text>
      <text x={P2_RIGHT - 6} y={ratioToY(expected) + 29} fill={BOOST_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
        {expected.toFixed(2)} × Newton’s
      </text>
      <path d={linePoints} fill="none" stroke={HIDDEN_COLOR} strokeWidth={2.5} />
      <text x={P2_LEFT + 8} y={P2_TOP + 4} fill={HIDDEN_COLOR} fontSize="10" fontWeight="bold">
        purple line: the sample’s average speed when each hidden triple
      </text>
      <text x={P2_LEFT + 8} y={P2_TOP + 17} fill={HIDDEN_COLOR} fontSize="10" fontWeight="bold">
        moves {P2_FACTOR} times as fast as a true pair
      </text>

      {/* Prediction 2's example, and where the purple line meets the expected speed. */}
      <circle cx={fractionToX(P2_FRACTION)} cy={ratioToY(examplePoint)} r={5} fill={HIDDEN_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      <text x={fractionToX(P2_FRACTION) - 9} y={ratioToY(examplePoint) - 14} fill={TEXT_COLOR} fontSize="10" textAnchor="end">
        1 pair in 5, twice as fast: {examplePoint.toFixed(2)}
      </text>
      <line x1={bx} y1={ratioToY(expected)} x2={bx} y2={P2_BOTTOM} stroke={TEXT_COLOR} strokeDasharray="3 3" />
      <circle cx={bx} cy={ratioToY(expected)} r={4} fill="none" stroke={TEXT_COLOR} strokeWidth={2} />
      <text x={bx + 8} y={P2_BOTTOM - 22} fill={TEXT_COLOR} fontSize="10">
        {(matchFraction * 100).toFixed(1)} percent triples
      </text>
      <text x={bx + 8} y={P2_BOTTOM - 10} fill={TEXT_COLOR} fontSize="10">
        already give {expected.toFixed(2)}
      </text>

      <text x={P2_LEFT} y={P2_HEIGHT - 10} fill={MUTED_COLOR} fontSize="10">
        A toy model: some pairs move {P2_FACTOR} times as fast; the rest move as Newton’s law says.
      </text>
    </svg>
  )
}

// ---- Picture 3: what the teams found (appears in stage 5) ----
const GAMMA_RESULTS = PUBLISHED_RESULTS.filter((result) => result.kind === 'gamma')
const P3_LEFT = 225
const P3_RIGHT = 520
const P3_TOP = 66
const P3_ROW = 40
const P3_BOTTOM = P3_TOP + GAMMA_RESULTS.length * P3_ROW
const P3_HEIGHT = P3_BOTTOM + 70
const P3_MIN_GAMMA = 0.6
const P3_MAX_GAMMA = 2
const gammaToX = (gamma: number) => P3_LEFT + ((gamma - P3_MIN_GAMMA) / (P3_MAX_GAMMA - P3_MIN_GAMMA)) * (P3_RIGHT - P3_LEFT)
const rangeText = (value: number, plus: number, minus: number) =>
  plus === minus ? `${value.toFixed(2)} ± ${plus.toFixed(2)}` : `${value.toFixed(2)} (+${plus.toFixed(2)}, −${minus.toFixed(2)})`

function PictureThree() {
  const sameBinaryRows = GAMMA_RESULTS.map((result, i) => ({ result, i })).filter(({ result }) => result.binaries === 36)
  const firstSame = sameBinaryRows[0].i
  const lastSame = sameBinaryRows[sameBinaryRows.length - 1].i
  return (
    <svg
      width={VIEW_WIDTH}
      height={P3_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${P3_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label="The gravity boost factor that each of five published results gives, as a dot with a range, against a line at 1 for Newton's law and a line at 1.4 for the MOND papers' prediction"
    >
      <text x={10} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: what the teams found
      </text>

      {/* The two reference lines. */}
      <line x1={gammaToX(1)} y1={P3_TOP - 8} x2={gammaToX(1)} y2={P3_BOTTOM} stroke={NEWTON_COLOR} strokeWidth={2} />
      <text x={gammaToX(1) - 5} y={P3_TOP - 12} fill={NEWTON_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
        Newton’s law: γ = 1
      </text>
      <line x1={gammaToX(GAMMA_MOND_WIDE_BINARY)} y1={P3_TOP - 8} x2={gammaToX(GAMMA_MOND_WIDE_BINARY)} y2={P3_BOTTOM} stroke={BOOST_COLOR} strokeWidth={2} strokeDasharray="7 4" />
      <text x={gammaToX(GAMMA_MOND_WIDE_BINARY) + 5} y={P3_TOP - 24} fill={BOOST_COLOR} fontSize="10" fontWeight="bold">
        MOND papers’ prediction:
      </text>
      <text x={gammaToX(GAMMA_MOND_WIDE_BINARY) + 5} y={P3_TOP - 12} fill={BOOST_COLOR} fontSize="10" fontWeight="bold">
        γ ≈ {GAMMA_MOND_WIDE_BINARY}
      </text>

      {/* The horizontal axis. */}
      <line x1={P3_LEFT} y1={P3_BOTTOM} x2={P3_RIGHT} y2={P3_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {[0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2].map((gamma) => (
        <g key={gamma}>
          <line x1={gammaToX(gamma)} y1={P3_BOTTOM} x2={gammaToX(gamma)} y2={P3_BOTTOM + 6} stroke={TEXT_COLOR} />
          <text x={gammaToX(gamma)} y={P3_BOTTOM + 20} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            {gamma.toFixed(1)}
          </text>
        </g>
      ))}
      <text x={(P3_LEFT + P3_RIGHT) / 2} y={P3_BOTTOM + 38} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        gravity boost factor γ (times Newton’s pull)
      </text>

      {/* One row per result: the paper, the year and the number of binaries on the left; the value and its range on the right. */}
      {GAMMA_RESULTS.map((result, i) => {
        const y = P3_TOP + i * P3_ROW + P3_ROW / 2
        const value = result.value as number
        const base = result.name.split(' (')[0]
        const detail = result.name.includes(' (') ? ` ${result.name.slice(result.name.indexOf('('))}` : ''
        return (
          <g key={`${result.name}-${i}`}>
            <text x={10} y={y - 2} fill={TEXT_COLOR} fontSize="10" fontWeight="bold">
              {base} {result.year}
            </text>
            <text x={10} y={y + 10} fill={MUTED_COLOR} fontSize="10">
              {(result.binaries ?? 0).toLocaleString('en-US')} binaries{detail}
            </text>
            <line x1={gammaToX(value - result.errorMinus)} y1={y} x2={gammaToX(value + result.errorPlus)} y2={y} stroke={RESULT_COLOR} strokeWidth={3} />
            <line x1={gammaToX(value - result.errorMinus)} y1={y - 5} x2={gammaToX(value - result.errorMinus)} y2={y + 5} stroke={RESULT_COLOR} strokeWidth={2} />
            <line x1={gammaToX(value + result.errorPlus)} y1={y - 5} x2={gammaToX(value + result.errorPlus)} y2={y + 5} stroke={RESULT_COLOR} strokeWidth={2} />
            <circle cx={gammaToX(value)} cy={y} r={5} fill={RESULT_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
            <text x={gammaToX(value)} y={y - 10} fill={TEXT_COLOR} fontSize="10" textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
              {rangeText(value, result.errorPlus, result.errorMinus)}
            </text>
          </g>
        )
      })}

      {/* A bracket round the rows that use the same 36 binaries. */}
      <line x1={P3_RIGHT + 14} y1={P3_TOP + firstSame * P3_ROW + 6} x2={P3_RIGHT + 14} y2={P3_TOP + (lastSame + 1) * P3_ROW - 6} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <text
        transform={`translate(${P3_RIGHT + 29} ${P3_TOP + ((firstSame + lastSame + 1) / 2) * P3_ROW}) rotate(90)`}
        fill={MUTED_COLOR}
        fontSize="10"
        textAnchor="middle"
      >
        the same 36 binaries
      </text>

      <text x={10} y={P3_HEIGHT - 10} fill={MUTED_COLOR} fontSize="10">
        Each dot is a published value and its line is the range the paper gives. Other results are listed in a table later.
      </text>
    </svg>
  )
}

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

// "What to look for": each item says what to look at, what it means and why it matters. The meaning is given after the learner has predicted and
// run (CLAUDE.md §12); the full explanation, and the verdict on the teams, stay with the tutor.
interface LookFor {
  look: ReactNode
  means: ReactNode
  matters: ReactNode
}
function LookForList({ items }: { items: LookFor[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '0.6rem' }}>
          <strong>Look at:</strong> {item.look}
          <br />
          <strong>What it means:</strong> {item.means}
          <br />
          <strong>Why it matters:</strong> {item.matters}
        </li>
      ))}
    </ul>
  )
}

export function WideBinariesExperiment({ onComplete }: WideBinariesExperimentProps) {
  const [boostPrediction, setBoostPrediction] = useState<BoostRange | null>(null)
  const [contaminationPrediction, setContaminationPrediction] = useState<ContaminationRange | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const hasRun = status !== 'idle'
  const bothPredicted = boostPrediction !== null && contaminationPrediction !== null

  // Presentation only: advances one stage at a time. The result does not depend on this timer (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) {
        setStage(stage + 1)
      } else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  function startOver() {
    setBoostPrediction(null)
    setContaminationPrediction(null)
    setStatus('idle')
    setStage(0)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }
  const speedAt1000 = orbitalSpeed(P1_MASS, 1000)
  const speedAt10000 = orbitalSpeed(P1_MASS, 10000)
  const pullAt10000 = pullOnPair(P1_MASS, 10000)
  const earthPullRatio = 9.8 / pullAt10000
  const inA0 = pullInA0(P1_MASS, 10000)
  const dm30000 = darkMatterInsideSolarMasses(30000)
  const boostFactor = speedBoost(GAMMA_MOND_WIDE_BINARY)
  const boostedAt10000 = speedAt10000 * boostFactor
  const pullA0At1000 = pullInA0(P1_MASS, 1000)
  const matchFraction = fractionToFake(speedBoostPercent(GAMMA_MOND_WIDE_BINARY), 2)
  const exampleRatio = contaminatedRatio(0.2, 2)
  const pullA0At30000 = pullInA0(P1_MASS, 30000)
  const boostGapAt10000 = boostedAt10000 - speedAt10000
  const boostPercent = speedBoostPercent(GAMMA_MOND_WIDE_BINARY)
  const addedPer10Percent = contaminatedRatio(0.1, 2) - 1
  const ratioAt2Percent = contaminatedRatio(0.02, 2)
  const lookForPicture1: LookFor[] = [
    {
      look: 'how steeply the blue curve falls, and how low it is at the right-hand end (a few hundred metres per second).',
      means: 'the wider the pair, the weaker the pull between the stars, and the more slowly they move.',
      matters: 'very wide pairs are the places where gravity is weakest, and weak gravity is where MOND says that Newton’s law could fail. That is why astronomers study them.',
    },
    ...(stage >= 2
      ? [
          {
            look: 'where the amber numbers start along the separation axis (between 5,000 and 10,000 AU here).',
            means: `an amber number is a pull below a₀, the small pull where MOND says gravity changes. At 10,000 AU the pull is ${inA0.toFixed(2)} a₀, and at 30,000 AU only ${pullA0At30000.toFixed(2)} a₀.`,
            matters: 'only pairs in the amber zone can tell Newton’s law and MOND apart. A close pair, with a pull of tens or hundreds of a₀, is not a test.',
          },
        ]
      : []),
    ...(stage >= 3
      ? [
          {
            look: 'how far above the blue curve the rose line sits, and whether the gap looks big or small.',
            means: `a pull ${GAMMA_MOND_WIDE_BINARY} times as strong makes the speed ${boostFactor.toFixed(2)} times as high, ${boostPercent.toFixed(0)} percent more. At ${P1_PAIR_AU.toLocaleString('en-US')} AU that is about ${boostGapAt10000.toFixed(0)} m/s more, on top of ${speedAt10000.toFixed(0)} m/s. The gap is the same fraction everywhere because the picture is drawn that way.`,
            matters: 'the effect that astronomers are looking for is small: about a fifth of the speed. To see it, the speeds of the stars must be measured to much better than a fifth, and anything that fakes a fifth (see Picture 2) has to be ruled out.',
          },
        ]
      : []),
  ]
  const lookForPicture2: LookFor[] = [
    {
      look: 'where the purple line crosses the rose dashed line, and the share of triples at the foot of the dotted line.',
      means: `if hidden triples move twice as fast, a sample in which ${(matchFraction * 100).toFixed(1)} percent of the “pairs” are triples has an average speed of ${boostFactor.toFixed(2)} times Newton’s, the same as the boost the MOND papers expect.`,
      matters: 'a sample with that many hidden triples would show the expected “boost” even if gravity followed Newton’s law exactly. A team must show that its sample has far fewer.',
    },
    {
      look: 'the purple dot (1 pair in 5) against the rose line.',
      means: `the dot, at ${exampleRatio.toFixed(2)}, is a little above the rose line. One pair in five is a larger share than the ${(matchFraction * 100).toFixed(1)} percent that is needed.`,
      matters: 'the share that does the damage is not tiny: it is about one pair in five or six.',
    },
    {
      look: 'how steeply the purple line rises.',
      means: `each extra 10 percent of triples adds ${addedPer10Percent.toFixed(2)} to the average (because a triple is one whole step, 1.0, above a true pair). Even 2 percent of triples gives ${ratioAt2Percent.toFixed(2)}.`,
      matters: 'a team has to know its share of hidden triples to within a few percent to measure a boost of about 0.18, and that is hard, because hidden companions cannot be seen. This picture is a toy model, with “twice as fast” chosen for illustration.',
    },
  ]
  const lookForPicture3: LookFor[] = [
    {
      look: 'which dots lie near the blue line (γ = 1), which near the rose line (γ ≈ 1.4), and which in between.',
      means: 'a dot near the blue line is a result that looks like Newton’s law. A dot near the rose line is a result that looks like the boost that MOND predicts.',
      matters: 'this is the question of the experiment: is there a boost or not? The dots are not all in one place.',
    },
    {
      look: 'whether each teal line includes the blue line, the rose line, both or neither.',
      means: 'a line that includes a value means that the paper’s data are consistent with that value. A line that leaves it out means that the paper’s data disfavour it. A line that includes both means that the data cannot tell the two apart.',
      matters: 'a result only counts for or against an idea if its line leaves the other idea out. Look at which rows manage to do that.',
    },
    {
      look: 'the lengths of the lines, and the number of binaries beside each one.',
      means: 'the rows with 36 binaries have much longer lines than the row with 26,615. A small sample leaves more give-or-take.',
      matters: 'a long line is a result that cannot say much. But a big sample is not the whole story: a systematic error, such as hidden triples, moves the dot and not the line.',
    },
    {
      look: 'the three rows inside the grey bracket, which use the same 36 binaries: how far apart their dots are, compared with the length of their lines.',
      means: 'the same data gave different answers, depending on how the orbits were worked out. The dots run from 1.00 to 1.60, a spread bigger than any one of the three lines.',
      matters: 'the choices that the analysts make, and not only the amount of data, can change the answer. This is a main reason why the question is called Contested, and why new, cleaner data are needed.',
    },
  ]

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
            <strong>Dark matter and dark energy: two different things.</strong> Both names contain the word “dark”, which only means “we cannot see it”.
            They do very different jobs.
          </p>
          <ul style={{ ...paragraph, paddingLeft: '1.5rem' }}>
            <li>
              <strong>Dark matter</strong> pulls. It is unseen material whose <em>gravity</em> holds galaxies together and makes them spin faster than
              their visible stars alone could explain. Picture a room where you cannot see the people, but you can tell a crowd is there because the
              furniture keeps being pushed around.
            </li>
            <li>
              <strong>Dark energy</strong> pushes. It is the name for whatever makes the whole universe’s expansion speed up. It matters only over huge
              distances, between galaxies, and has no measurable effect on one pair of stars. You met it in Cosmology Experiment 5.
            </li>
          </ul>
          <p style={paragraph}>
            Only dark matter, or a change in the law of gravity, is in question here. Dark energy plays no part in this experiment.
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
              it, how physicists look for it, and how it differs from dark energy, in plain words.
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

        <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || hasRun} style={{ padding: '0.6rem 1.5rem' }}>
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
        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}`}</strong>
              {status === 'complete' && (
                <span style={{ color: 'var(--text-muted)' }}>
                  {' '}
                  (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here. The results, the two controls, the tutor and the
                  summary are not built yet (later steps).
                </span>
              )}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 &&
              `Picture 1 shows Newton’s law for a pair with the mass of ${P1_MASS} Suns. The dot marks a pair ${P1_PAIR_AU.toLocaleString('en-US')} AU apart, which moves at about ${speedAt10000.toFixed(0)} m/s. To the left the pair is closer and faster; to the right it is wider and slower.`}
            {stage === 2 &&
              `The row of numbers under the horizontal axis is the pull between the stars at each separation, in units of a₀ (the small pull, about ${sci(A0)} m/s², below which MOND says gravity changes). It falls from about ${pullA0At1000.toFixed(0)} a₀ at 1,000 AU to ${inA0.toFixed(2)} a₀ at 10,000 AU. The amber numbers are below a₀.`}
            {stage === 3 &&
              `The rose dashed line is the speed if gravity pulled ${GAMMA_MOND_WIDE_BINARY} times as hard as Newton’s law says, the boost that the MOND papers predict for wide binaries in the Galaxy. At ${P1_PAIR_AU.toLocaleString('en-US')} AU it gives about ${boostedAt10000.toFixed(0)} m/s, against Newton’s ${speedAt10000.toFixed(0)} m/s.`}
            {stage === 4 &&
              'Picture 2 appears below Picture 1. It asks what happens to the average speed of a study if some of its “pairs” are secretly triples, whose hidden third star makes them move faster. The purple line is the average; the rose dashed line is the speed that the MOND papers expect.'}
            {stage === 5 &&
              'Picture 3 appears below Picture 2. It shows the boost γ that each published result gives, with the range the paper states. The blue line is γ = 1 (Newton’s law) and the rose dashed line is γ ≈ 1.4 (the MOND papers’ prediction).'}
          </p>
        )}

        {/* Picture 1: Newton's curve and a marked pair from stage 1, the pull row from stage 2, the stronger-pull line from stage 3. */}
        <div style={{ marginBottom: '1rem' }}>
          <PictureOne stage={stage} />
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
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
            {stage === 0 && (
              <li>
                <strong>Nothing else is drawn yet.</strong> After you press Run, the picture adds a marked pair, the pull between the stars, and a second line
                for a stronger pull, one stage at a time.
              </li>
            )}
            {stage >= 1 && (
              <li>
                <strong>The blue dot</strong> marks a pair {P1_PAIR_AU.toLocaleString('en-US')} AU apart. This is the pair in Prediction 1. Its label gives its
                speed.
              </li>
            )}
            {stage >= 2 && (
              <li>
                <strong>The row of numbers under the horizontal axis</strong> (labelled “pull, in a₀”) is the pull between the stars at that separation,
                g = G × M ÷ s². <strong>a₀</strong> is a small pull, about {sci(A0)} m/s², below which MOND says gravity changes. So “74” means 74 times a₀, and
                “0.74” means less than a₀. <strong>Amber numbers</strong> are below a₀, white ones are above. For scale, the Earth’s pull at its surface is 9.8 m/s².
              </li>
            )}
            {stage >= 3 && (
              <li>
                <strong>The rose dashed line</strong> is the speed if gravity pulled {GAMMA_MOND_WIDE_BINARY} times as hard as Newton’s law says. The papers say
                this is the boost that MOND predicts for wide binaries in our Galaxy. The picture does not show how a boost would switch on with separation
                (the papers do not agree on that), so this line is simply drawn at the same fixed ratio above the blue curve at every separation.
              </li>
            )}
          </ul>
          <p style={paragraph}>
            <strong>A worked moment.</strong> At 1,000 AU the blue curve gives about {speedAt1000.toFixed(0)} m/s. At 10,000 AU, ten times further, it gives
            about {speedAt10000.toFixed(0)} m/s. The ratio is {(speedAt10000 / speedAt1000).toFixed(2)}, which is 1 ÷ √10: ten times the distance gives about a
            third of the speed. A hundred times the distance would give a tenth.
            {stage >= 3 && (
              <>
                {' '}
                On the rose line, the pair at {P1_PAIR_AU.toLocaleString('en-US')} AU moves at about {boostedAt10000.toFixed(0)} m/s. Divide it by Newton’s{' '}
                {speedAt10000.toFixed(0)} m/s and you get {boostFactor.toFixed(2)}, the same ratio at every separation.
              </>
            )}
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList items={lookForPicture1} />
        </div>

        {/* Picture 2 (stage 4). */}
        {stage >= 4 && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <PictureTwo />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>How to read Picture 2.</strong> This picture is a <strong>“what if”</strong>, built from a simple toy model. It is not real data and
                it is not any team’s analysis. It asks: what happens to the <em>average</em> speed of a study if some of the “pairs” in it are really{' '}
                <strong>triples</strong>? A triple is a pair with a <strong>hidden companion</strong>: a third star so close to one of the two that a
                telescope cannot tell them apart, so it is counted as one star. In this toy model, a triple moves faster than a true pair.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>The two axes.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The horizontal line</strong> is the <strong>share of the “pairs” in the study that are really triples</strong>, in percent, from 0
                  to 50. At 0 every pair is a true pair. At 20, one pair in every five is a triple. At 50, half of them are.
                </li>
                <li>
                  <strong>The vertical line</strong> is the <strong>average speed of the whole sample</strong>, written as a multiple of Newton’s speed.
                  <strong> 1.00</strong> means the average is exactly what Newton’s law says. <strong>1.10</strong> means 10 percent faster, and{' '}
                  <strong>1.20</strong> means 20 percent faster. The same measure is used in Picture 1, where the rose line is {boostFactor.toFixed(2)} times
                  as high as the blue one.
                </li>
              </ul>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>Everything that is drawn.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The purple line</strong> is the sample’s average speed, for every share of triples, when each triple moves{' '}
                  <strong>twice as fast</strong> as a true pair (the same “twice as fast” as in Prediction 2). It starts at 1.00 on the left, where there are
                  no triples, and rises in a straight line to 1.50 on the right, where half of the pairs are triples. “Twice as fast” is a choice made for
                  illustration. A later step will let you change it.
                </li>
                <li>
                  <strong>The rose dashed line</strong> is the speed that the MOND papers expect, {boostFactor.toFixed(2)} times Newton’s. It is the same boost
                  as the rose line in Picture 1, and it is drawn here as a flat line because it does not depend on the share of triples. It is the “signal” a
                  team is looking for.
                </li>
                <li>
                  <strong>The purple dot</strong> is the example of Prediction 2: 1 pair in every 5 (20 percent) is a triple. Its label gives the average
                  speed at that share.
                </li>
                <li>
                  <strong>The white ring and the dotted line below it</strong> mark the place where the purple line crosses the rose dashed line. Read down
                  the dotted line to the horizontal axis to find the share of triples at which that happens. The label beside it says what that share is.
                </li>
                <li>
                  <strong>The words on the picture</strong> repeat this: the purple label names the purple line, the rose label names the dashed line, and the
                  note at the bottom says that this is a toy model.
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment.</strong> Take 100 pairs in a study. 80 are true pairs and move at 1.0 times Newton’s speed. 20 are triples and move
                at 2.0 times. The average is (80 × 1.0 + 20 × 2.0) ÷ 100 = {exampleRatio.toFixed(1)}. That is the purple dot. Try 10 triples instead: (90 × 1.0 +
                10 × 2.0) ÷ 100 = {contaminatedRatio(0.1, 2).toFixed(1)}, which is the purple line at 10 percent. For the white ring, the share is{' '}
                {(matchFraction * 100).toFixed(1)} percent: ({((1 - matchFraction) * 100).toFixed(1)} × 1.0 + {(matchFraction * 100).toFixed(1)} × 2.0) ÷ 100 ={' '}
                {contaminatedRatio(matchFraction, 2).toFixed(2)}, which is the rose line’s height.
              </p>
              <p style={paragraph}>
                <strong>An everyday comparison.</strong> Your marks in a class: if 80 of your tests scored 50 and 20 of them scored 100, your average is 60. A
                minority of high marks pulls the average up, and the average is neither 50 nor 100. The hidden triples do the same to the average speed.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList items={lookForPicture2} />
            </div>
          </>
        )}

        {/* Picture 3 (stage 5). */}
        {stage >= 5 && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <PictureThree />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <p style={paragraph}>
                <strong>How to read Picture 3.</strong> Unlike Pictures 1 and 2, this picture is <strong>not a model</strong>. It shows what teams of astronomers
                published, as of October 2026, after studying wide binaries with data from Gaia. Each team reports a number called the{' '}
                <strong>gravity boost factor γ</strong>: how many times stronger than Newton’s law the pull between the stars seems to be.{' '}
                <strong>γ = 1</strong> means Newton’s law, with no boost. <strong>γ = 1.4</strong> is the boost of Picture 1’s rose line, and it means a pull 1.4
                times as strong. This experiment does not repeat their analysis.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>The horizontal axis and the five rows.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The horizontal line</strong> is γ, from 0.6 to 2.0. Further to the right means a bigger boost.
                </li>
                <li>
                  <strong>Each row</strong> is one published result. On the left of the row are the team’s name, the year of the paper and the number of{' '}
                  <strong>binaries</strong> (pairs of stars) it used. A large sample reduces random errors, but not an error that pushes every result the same way
                  (a <strong>systematic error</strong>, from the introduction), such as hidden companions.
                </li>
                <li>
                  <strong>The teal dot</strong> is the value of γ that the paper reports, and the number above it repeats it. <strong>The teal line through
                  the dot</strong> is the range that the paper gives around its value, with a small cap at each end. A short line means the team is fairly
                  sure of its value; a long line means it is less sure. “1.43 ± 0.06” means the line runs 0.06 below the dot and 0.06 above it. “1.60
                  (+0.24, −0.14)” means it runs 0.24 above the dot and 0.14 below it, so it is longer on one side.
                </li>
              </ul>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>The lines and the bracket.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The blue vertical line</strong> is γ = 1, Newton’s law. A result that lies on it shows no boost.
                </li>
                <li>
                  <strong>The rose dashed vertical line</strong> is γ ≈ {GAMMA_MOND_WIDE_BINARY}, the boost that the MOND papers predict for wide binaries in the
                  Galaxy (the same {GAMMA_MOND_WIDE_BINARY} as in Pictures 1 and 2).
                </li>
                <li>
                  <strong>The grey bracket on the right</strong> groups the three rows that use <strong>the same 36 binaries</strong>. The first of them is the
                  result of one team (January 2026). The other two are from a second team, who studied the same 36 pairs in March 2026 and worked out their
                  orbits in two different ways. So these three rows show how much the answer can change when the data stay the same and only the method changes.
                </li>
                <li>
                  <strong>Other published results are not drawn.</strong> Some papers report a different quantity, or do not give a γ, so their numbers cannot
                  honestly be put on this line. They appear in a table in a later step.
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment.</strong> Take the top row, “Chae 2023”, read as 1.43 ± 0.06. The dot is at γ = 1.43. The line runs from 1.43 − 0.06 = 1.37 to
                1.43 + 0.06 = 1.49. The blue line (γ = 1) is far outside that range, and the rose dashed line (γ = 1.4) is inside it. Now take the fourth row, a
                value of 1.00 (+0.24, −0.19): its line runs from 1.00 − 0.19 = 0.81 to 1.00 + 0.24 = 1.24. It contains the blue line and does not reach the rose
                one. Two rows, two different pictures of the same kind of data.
              </p>
              <p style={paragraph}>
                <strong>An everyday comparison.</strong> Imagine several people measuring the same table, each with a different method, and each writing down a
                length with a give-or-take. If their ranges overlap, you cannot tell their answers apart. If they do not overlap, either the methods differ, or
                one of them has made an error that the give-or-take does not include.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <div style={{ marginBottom: '0.75rem' }}>
                <LookForList items={lookForPicture3} />
              </div>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                This picture shows only what was published. It does not say which team is right, the numbers are quoted as the papers state them and are not
                always directly comparable, and this experiment does not analyse any Gaia data.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
