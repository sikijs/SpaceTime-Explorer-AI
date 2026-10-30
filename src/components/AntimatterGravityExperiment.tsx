import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ALPHA_2023,
  combinedUncertainty,
  compatibility,
  fallDistance,
  G_EARTH,
  runAntimatterGravity,
  sigmaNeeded,
  sigmasFrom,
  timeToFall,
  TRAP_LENGTH_M,
  twoSidedChance,
  upOrDown,
} from '../physics/antimatterGravity'
import type { Compatibility, FallsUpAnswer, ReadingAnswer } from '../physics/antimatterGravity'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { AntimatterGravityTutor } from './AntimatterGravityTutor'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Cosmic Horizons, Experiment 8 (docs/experiments/frontier-and-beyond/08-does-antimatter-fall-down.md).
// Step 6 builds the three controls (the ratio, the error bar with the possibility to test, and the difference to see), shown after the run, which change Picture 1's
// white dashed curve, Picture 2's third line, Picture 3's white bar and a last row in Tables 1 and 2, and a Table 4. Step 5 built the results (the status label, three tables, the formulas in the "Words and formulas" panel and the links kept back until after the run). Step 4 built the five-stage run: Picture 1 fills in at stage 1, Picture 2 at stages 2 to 4 and Picture 3 at stage 5, each with a guide. Step 3 built the two predictions. Step 2 built the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of the ALPHA-g trap (an
// illustration, not data), the collapsed "Words and formulas" panel and the skeleton of Picture 1 with its guide. Step 7 built the tutor (AntimatterGravityTutor.tsx) and, in App, the chapter summary. All wording is draft for the owner's line-by-line
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
const ALPHA_COLOR = '#5eead4' // teal: ALPHA's measured value
const NONE_COLOR = '#f472b6' // pink: no gravity (a ratio of 0)
const UP_COLOR = '#fb923c' // orange: falls up (a ratio of -1)
const YOURS_COLOR = '#ffffff' // white, dashed: the learner's own choice
const VERDICT_COLORS: Record<Compatibility, string> = { compatible: '#4ade80', borderline: '#fbbf24', disfavoured: '#fb923c', ruledOut: '#fb7185' }
const VERDICT_WORDS: Record<Compatibility, string> = { compatible: 'compatible', borderline: 'borderline', disfavoured: 'disfavoured', ruledOut: 'ruled out' }

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
// What is drawn follows the Nature paper (PMC10533407, read 2026-10-21): a vertical trap held by two ring-shaped "mirror coils" (electromagnets, one at
// each end); atoms that escape annihilate on "the material walls of the apparatus"; the detectors (a radial time projection chamber and a barrel of
// scintillator bars) are cylinders AROUND the trap, not at its ends.
function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <>
      {lines.map((line, i) => (
        <text key={i} x={x} y={y + i * (size + 2)} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor}>
          {line}
        </text>
      ))}
    </>
  )
}

function TrapDrawing() {
  const height = 510
  const cx = 220
  const top = 140
  const bottom = 350
  const half = 34
  const wallTop = 92
  const wallBottom = 398
  // A handful of atoms, drawn as dots (the real trap holds about 100).
  const atoms = [
    [-18, 40], [10, 62], [-8, 90], [22, 112], [-24, 135], [4, 152], [26, 168], [-14, 182], [14, 196], [-26, 168], [0, 120], [20, 74],
  ]
  const flash = (x: number, y: number) => (
    <polygon
      points={`${x},${y - 9} ${x + 3},${y - 3} ${x + 9},${y} ${x + 3},${y + 3} ${x},${y + 9} ${x - 3},${y + 3} ${x - 9},${y} ${x - 3},${y - 3}`}
      fill="#ffffff"
      stroke={ESCAPE_COLOR}
      strokeWidth={1}
    />
  )
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="A tall vertical trap holding a few antihydrogen atoms, with a ring-shaped electromagnet called a mirror coil at the top and at the bottom, an outer box for the walls of the apparatus, an arrow at each end for an atom that escapes and a flash where it annihilates on the wall, two tall purple strips for the detectors that surround the trap, and an arrow showing that gravity pulls down"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: the ALPHA-g trap, seen from the side
      </text>

      {/* The detectors: a cylinder around the trap, seen from the side as two strips, taller than the trap. */}
      <rect x={cx - 100} y={64} width={18} height={wallBottom - 64 + 20} rx={3} fill="none" stroke={DETECTOR_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
      <rect x={cx + 82} y={64} width={18} height={wallBottom - 64 + 20} rx={3} fill="none" stroke={DETECTOR_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={cx - 91} y={56} fill={DETECTOR_COLOR} fontSize="10" fontWeight="bold" textAnchor="middle">
        detectors
      </text>
      <text x={cx + 91} y={56} fill={DETECTOR_COLOR} fontSize="10" fontWeight="bold" textAnchor="middle">
        detectors
      </text>

      {/* The walls of the apparatus, around the trap. */}
      <rect x={cx - 62} y={wallTop} width={124} height={wallBottom - wallTop} rx={6} fill="none" stroke={MUTED_COLOR} strokeWidth={2.5} />
      <SvgLines x={cx + 112} y={wallTop - 2} lines={['walls of the apparatus: where', 'an escaping atom annihilates']} fill={MUTED_COLOR} bold />

      {/* The trap: no solid walls (a thin dotted outline). */}
      <rect x={cx - half} y={top} width={2 * half} height={bottom - top} rx={8} fill="none" stroke={TEXT_COLOR} strokeWidth={1.2} strokeDasharray="2 4" />

      {/* The two mirror coils (magnetic lids). */}
      <rect x={cx - half - 8} y={top - 6} width={2 * half + 16} height={12} rx={4} fill={BARRIER_COLOR} />
      <rect x={cx - half - 8} y={bottom - 6} width={2 * half + 16} height={12} rx={4} fill={BARRIER_COLOR} />
      <SvgLines x={cx + 112} y={top - 12} lines={['top mirror coil: a ring-shaped', 'electromagnet. Its magnetic field', 'pushes atoms back in, like a lid']} fill={BARRIER_COLOR} bold />
      <SvgLines x={cx + 112} y={bottom - 6} lines={['bottom mirror coil: the same,', 'at the bottom of the trap']} fill={BARRIER_COLOR} bold />

      {/* The atoms. */}
      {atoms.map(([dx, dy], i) => (
        <circle key={i} cx={cx + dx} cy={top + 14 + dy * 0.9} r={4.5} fill={ATOM_COLOR} />
      ))}
      <SvgLines x={cx + 112} y={top + 74} lines={['antihydrogen atoms', '(about 100 in the real trap;', 'a dozen are drawn)']} fill={ATOM_COLOR} bold />

      {/* The atoms that escape: an arrow from the trap to the wall, and a flash where it annihilates. */}
      <line x1={cx} y1={top - 12} x2={cx} y2={wallTop + 16} stroke={ESCAPE_COLOR} strokeWidth={3} />
      <polygon points={`${cx - 6},${wallTop + 22} ${cx},${wallTop + 12} ${cx + 6},${wallTop + 22}`} fill={ESCAPE_COLOR} />
      {flash(cx, wallTop + 2)}
      <line x1={cx} y1={bottom + 12} x2={cx} y2={wallBottom - 16} stroke={ESCAPE_COLOR} strokeWidth={3} />
      <polygon points={`${cx - 6},${wallBottom - 22} ${cx},${wallBottom - 12} ${cx + 6},${wallBottom - 22}`} fill={ESCAPE_COLOR} />
      {flash(cx, wallBottom - 2)}
      <SvgLines x={cx + 112} y={wallBottom - 8} lines={['green arrow: an atom that got', 'past a lid. White star: the flash', 'when it annihilates on the wall']} fill={ESCAPE_COLOR} bold />

      {/* The height of the trap. */}
      <line x1={cx - 124} y1={top} x2={cx - 124} y2={bottom} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <polygon points={`${cx - 124},${top} ${cx - 128},${top + 8} ${cx - 120},${top + 8}`} fill={TEXT_COLOR} />
      <polygon points={`${cx - 124},${bottom} ${cx - 128},${bottom - 8} ${cx - 120},${bottom - 8}`} fill={TEXT_COLOR} />
      <text x={cx - 132} y={(top + bottom) / 2 - 6} fill={TEXT_COLOR} fontSize="11" textAnchor="end">
        {(TRAP_LENGTH_M * 100).toFixed(1)} cm
      </text>
      <text x={cx - 132} y={(top + bottom) / 2 + 8} fill={TEXT_COLOR} fontSize="11" textAnchor="end">
        tall
      </text>

      {/* Gravity. */}
      <line x1={516} y1={200} x2={516} y2={290} stroke={MATTER_COLOR} strokeWidth={4} />
      <polygon points="506,284 516,304 526,284" fill={MATTER_COLOR} />
      <text x={516} y={186} fill={MATTER_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        gravity
      </text>
      <text x={516} y={322} fill={MATTER_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        pulls down
      </text>

      <SvgLines
        x={20}
        y={height - 66}
        lines={[
          'A sketch of the idea, not to scale. The real trap is 25.6 cm tall and 4.4 cm across.',
          'The detectors are far taller than the trap. The purple strips are the two sides of a',
          'cylinder that surrounds the trap, not detectors at its ends. The trap has no solid walls:',
          'the atoms are held by magnetic fields alone (the dotted outline only marks where).',
        ]}
        fill={MUTED_COLOR}
      />
    </svg>
  )
}

// ---- Picture 1: how far does it fall? (Step 2: the axes, ordinary matter's curve and the trap-length line) ----
const P1_LEFT = 90
const P1_RIGHT = 400
const P1_TOP = 56
const P1_BOTTOM = 330
const P1_HEIGHT = 384
const P1_MAX_SECONDS = 0.5
const P1_MAX_DISTANCE = 1.4 // metres, the top and bottom of the vertical axis (negative: risen)
const timeToX = (seconds: number) => P1_LEFT + (seconds / P1_MAX_SECONDS) * (P1_RIGHT - P1_LEFT)
const distanceToY = (metres: number) => (P1_TOP + P1_BOTTOM) / 2 + (metres / P1_MAX_DISTANCE) * ((P1_BOTTOM - P1_TOP) / 2)

// The curve of distance fallen against time for a ratio, drawn from the physics module.
function curvePath(ratio: number): string {
  const points: string[] = []
  const steps = 50
  for (let i = 0; i <= steps; i++) {
    const t = (P1_MAX_SECONDS * i) / steps
    points.push(`${i === 0 ? 'M' : 'L'}${timeToX(t).toFixed(1)},${distanceToY(fallDistance(ratio, t)).toFixed(1)}`)
  }
  return points.join(' ')
}

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'What a ratio means', 'What ALPHA measured', 'How far from each possibility', 'A smaller error bar', 'How precise a test must be']

// The numbers of the run: ALPHA's published ratio, its combined uncertainty and the example error bar and difference of stages 4 and 5.
const MEASURED = ALPHA_2023.ratio
const COMBINED = combinedUncertainty(ALPHA_2023.statSys, ALPHA_2023.simulation)
const SMALL_SIGMA = 0.1 // the pretend error bar of stage 4 (the specification's "A smaller error bar")
const PLANNED_SIGMA = 0.01 // "1 percent or better", drawn as +/-0.01 on the ratio
const EXAMPLE_DIFFERENCE = 0.2 // stage 5's example: a 20 percent difference between the ratios
const EXAMPLE_SIGMAS = 3

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Antimatter', meaning: 'matter’s mirror image. An antimatter particle has the same mass as its ordinary partner and the opposite electric charge. CERN’s page on antimatter explains it in plain words.' },
  { term: 'Positron', meaning: 'the antimatter partner of the electron. It has the electron’s mass and a positive charge.' },
  { term: 'Antiproton', meaning: 'the antimatter partner of the proton. It has the proton’s mass and a negative charge.' },
  { term: 'Antihydrogen', meaning: 'the antimatter version of a hydrogen atom: an antiproton with a positron going round it. It is electrically neutral overall, like an ordinary hydrogen atom.' },
  { term: 'Annihilation', meaning: 'what happens when antimatter meets ordinary matter: both disappear, and their mass turns into energy. It is why antimatter has to be kept away from the walls of its container, in a vacuum, held by magnetic fields.' },
  { term: 'Long Shutdown 3 (LS3)', meaning: 'a long stop of CERN’s accelerators for maintenance and upgrades. CERN’s schedule page says that it began for the LHC at the start of July 2026, that work on the machines that feed the experiments starts in September 2026, and that they gradually restart in 2028. The antimatter plans in Table 3, after the run, are written as plans for “after” it.' },
  { term: 'Atomic interferometry and Moiré interferometry', meaning: 'two very sensitive methods that the antimatter teams plan to use. In outline, each detects a tiny push on a beam of atoms by how the beam shifts a fine pattern. The sources read for this page name the methods but do not explain them, so this is only an outline.' },
  { term: 'AEgIS and GBAR', meaning: 'two other experiments at CERN that plan to measure how antihydrogen falls, by different methods from ALPHA-g. AEgIS plans a horizontal beam of antihydrogen and measures how far it drops. GBAR plans to make antihydrogen ions (an antihydrogen atom with an extra positron), cool them, and remove the extra positron with light so that a very slow atom can fall.' },
  { term: 'Mirror coil', meaning: 'a ring-shaped electromagnet. In the ALPHA-g trap there is one at the top and one at the bottom. Each makes a magnetic field that pushes antihydrogen atoms back in, so it works like a lid. Turning down the current in a coil weakens its field.' },
  { term: 'Detector (time projection chamber, scintillator)', meaning: 'equipment that follows the charged particles thrown out when an atom annihilates, and works out where it happened. ALPHA-g has two: a cylindrical time projection chamber and a barrel of scintillator bars. Both surround the trap.' },
  { term: 'Weak equivalence principle', meaning: 'the statement that all objects fall in the same way in a gravitational field, whatever they are made of. A hammer and a feather dropped together on the Moon, where there is no air, land together (NASA’s page on Apollo 15 shows it).' },
  { term: 'g', meaning: 'the acceleration of an ordinary falling object near the Earth’s surface, 9.81 metres per second per second. “Acceleration” is how fast the speed grows: after one second of free fall, an object moves at 9.81 metres per second.' },
  { term: 'Ratio to g', meaning: 'how the acceleration of antihydrogen compares with g. A ratio of 1 means it falls exactly like ordinary matter. A ratio of 0 means gravity does not pull it at all. A negative ratio means it rises.' },
  { term: 'Uncertainty (give or take)', meaning: 'every measurement has a range within which the true value is thought to lie. A result is written as, for example, “1.43 ± 0.06”: the value, and the give or take.' },
  { term: 'Statistical, systematic and simulation uncertainty', meaning: 'three sources of give or take. Statistical: too few atoms, so chance matters. Systematic: a small fault in the equipment that pushes every result the same way. Simulation: the experiment compares its counts with a computer model, and the model itself is not exact.' },
  { term: 'Compatible', meaning: 'a possibility is compatible with a measurement if it lies within about two give-or-takes of it, so the measurement cannot rule it out.' },
  { term: 'Gap', meaning: 'how far a possibility is from the measured value. For example, if the measured value is 0.75 and the possibility is 1, the gap is 1 − 0.75 = 0.25. Dividing the gap by the give or take tells you how many give-or-takes away the possibility is, which is sigma.' },
  { term: 'Sigma', meaning: 'a way of saying how many give-or-takes a result is from a possibility (Experiment 1 of this group): the bigger the number, the harder it is to say the gap is just chance. About 3 sigma is often called a hint, and 5 sigma is the usual bar for a discovery.' },
]

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right, and they do not
// give the reason for the right one (the tutor explains it).
const FALLS_UP_CHOICES: ReadonlyArray<{ value: FallsUpAnswer; label: string }> = [
  { value: 'compatible', label: 'Yes, it is compatible' },
  { value: 'borderline', label: 'It is borderline' },
  { value: 'ruledOut', label: 'No, it is ruled out' },
]
const READING_CHOICES: ReadonlyArray<{ value: ReadingAnswer; label: string }> = [
  { value: 'slower', label: 'Yes, it falls about 25 percent more slowly' },
  { value: 'cannotTell', label: 'No, the measurement cannot tell' },
  { value: 'exactlyLikeMatter', label: 'No, it shows that it falls exactly like matter' },
]

// ---- Picture 1: how far does it fall? Stage 0: ordinary matter only; from stage 1: the other three curves ----
function PictureOne({ stage, userRatio }: { stage: number; userRatio: number | null }) {
  const timeAtTrapMatter = timeToFall(1, TRAP_LENGTH_M) as number
  const timeAtTrapAlpha = timeToFall(MEASURED, TRAP_LENGTH_M) as number
  const zeroY = distanceToY(0)
  const endLabel = (ratio: number, color: string, line1: string, line2: string | null) => {
    const y = distanceToY(fallDistance(ratio, P1_MAX_SECONDS))
    return (
      <g>
        <text x={P1_RIGHT + 8} y={y + (line2 === null ? 4 : 0)} fill={color} fontSize="11" fontWeight="bold">
          {line1}
        </text>
        {line2 !== null && (
          <text x={P1_RIGHT + 8} y={y + 13} fill={color} fontSize="11" fontWeight="bold">
            {line2}
          </text>
        )}
      </g>
    )
  }
  return (
    <svg
      width={VIEW_WIDTH}
      height={P1_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${P1_HEIGHT}`}
      style={svgStyle}
      role="img"
      aria-label="Curves of the distance fallen against time. Ordinary matter, a ratio of 1, falls faster and faster. From the first stage the picture adds a curve for a ratio of 0.75, a flat line for a ratio of 0, and a curve that rises for a ratio of minus 1, and a dashed line at the 25.6 centimetre height of the trap"
    >
      <text x={P1_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: how far does it fall?
      </text>

      {/* The axes and ticks. Zero is in the middle: below it the object has fallen, above it the object has risen. */}
      <line x1={P1_LEFT} y1={P1_TOP} x2={P1_LEFT} y2={P1_BOTTOM} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <line x1={P1_LEFT} y1={zeroY} x2={P1_RIGHT} y2={zeroY} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((t) => (
        <g key={t}>
          <line x1={timeToX(t)} y1={zeroY} x2={timeToX(t)} y2={zeroY - 5} stroke={TEXT_COLOR} />
          {t > 0 && (
            <text x={timeToX(t)} y={zeroY - 9} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
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
      <text x={P1_RIGHT} y={zeroY - 22} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        time since release, in seconds
      </text>

      {/* The length of the trap. */}
      <line x1={P1_LEFT} y1={distanceToY(TRAP_LENGTH_M)} x2={P1_RIGHT} y2={distanceToY(TRAP_LENGTH_M)} stroke={TRAP_LINE_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={P1_RIGHT + 8} y={distanceToY(TRAP_LENGTH_M) + 4} fill={TRAP_LINE_COLOR} fontSize="10" fontWeight="bold">
        trap height,
      </text>
      <text x={P1_RIGHT + 8} y={distanceToY(TRAP_LENGTH_M) + 16} fill={TRAP_LINE_COLOR} fontSize="10" fontWeight="bold">
        {(TRAP_LENGTH_M * 100).toFixed(1)} cm
      </text>

      {/* Ordinary matter (a ratio of 1), drawn from the start. */}
      <path d={curvePath(1)} fill="none" stroke={MATTER_COLOR} strokeWidth={2.5} />
      <circle cx={timeToX(timeAtTrapMatter)} cy={distanceToY(TRAP_LENGTH_M)} r={4.5} fill={MATTER_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
      {endLabel(1, MATTER_COLOR, 'ordinary matter', 'ratio 1')}

      {stage >= 1 && (
        <>
          <path d={curvePath(MEASURED)} fill="none" stroke={ALPHA_COLOR} strokeWidth={2.5} />
          <circle cx={timeToX(timeAtTrapAlpha)} cy={distanceToY(TRAP_LENGTH_M)} r={4.5} fill={ALPHA_COLOR} stroke={TEXT_COLOR} strokeWidth={1} />
          {endLabel(MEASURED, ALPHA_COLOR, 'ratio 0.75, the', 'value ALPHA reported')}
          {/* A ratio of 0 lies along the time axis, so it is drawn as a thick pink line on top of it. */}
          <line x1={P1_LEFT} y1={zeroY} x2={P1_RIGHT} y2={zeroY} stroke={NONE_COLOR} strokeWidth={3.5} />
          {endLabel(0, NONE_COLOR, 'ratio 0: no gravity,', 'it does not fall')}
          <path d={curvePath(-1)} fill="none" stroke={UP_COLOR} strokeWidth={2.5} />
          {endLabel(-1, UP_COLOR, 'ratio −1: it rises', null)}
        </>
      )}
      {userRatio !== null && <UserCurve ratio={userRatio} />}
      {stage === 0 && (
        <text x={P1_LEFT} y={P1_HEIGHT - 12} fill={MUTED_COLOR} fontSize="11">
          The other curves are drawn here when you press Run.
        </text>
      )}
    </svg>
  )
}

// The learner's own ratio on Picture 1: a white dashed curve, clipped to the picture, with a dot where it crosses the trap's height and a label in the
// margin that is moved out of the way of the other labels.
function UserCurve({ ratio }: { ratio: number }) {
  const zeroY = distanceToY(0)
  const time = timeToFall(ratio, TRAP_LENGTH_M)
  const endY = distanceToY(fallDistance(ratio, P1_MAX_SECONDS))
  const clamped = Math.min(P1_BOTTOM + 6, Math.max(P1_TOP - 6, endY))
  // The labels already in the margin (top of each label, height about 26) and the trap's own label.
  const taken = [1, MEASURED, 0, -1].map((r) => distanceToY(fallDistance(r, P1_MAX_SECONDS)) - 10).concat([zeroY + 19])
  const spans = taken.map((y) => [y, y + 26])
  const collides = (y: number) => spans.some(([a, b]) => y - 10 < b && y + 16 > a)
  let labelY = clamped
  for (const offset of [0, 30, -30, 60, -60, 90, -90]) {
    const candidate = clamped + offset
    if (candidate > P1_TOP - 14 && candidate < P1_BOTTOM + 40 && !collides(candidate)) {
      labelY = candidate
      break
    }
  }
  const offScale = ratio > 0 ? endY > P1_BOTTOM + 6 : endY < P1_TOP - 6
  return (
    <g>
      <defs>
        <clipPath id="p1-user-clip">
          <rect x={P1_LEFT} y={P1_TOP} width={P1_RIGHT - P1_LEFT} height={P1_BOTTOM - P1_TOP} />
        </clipPath>
      </defs>
      <path d={curvePath(ratio)} fill="none" stroke={YOURS_COLOR} strokeWidth={2.5} strokeDasharray="6 4" clipPath="url(#p1-user-clip)" />
      {time !== null && time <= P1_MAX_SECONDS && (
        <circle cx={timeToX(time)} cy={distanceToY(TRAP_LENGTH_M)} r={4} fill="none" stroke={YOURS_COLOR} strokeWidth={2} />
      )}
      <line x1={P1_RIGHT} y1={clamped} x2={P1_RIGHT + 6} y2={labelY} stroke={YOURS_COLOR} strokeWidth={1} />
      <text x={P1_RIGHT + 8} y={labelY + 4} fill={YOURS_COLOR} fontSize="11" fontWeight="bold">
        your ratio: {ratio.toFixed(2)}
      </text>
      {offScale && (
        <text x={P1_RIGHT + 8} y={labelY + 16} fill={YOURS_COLOR} fontSize="10">
          (leaves the picture)
        </text>
      )}
    </g>
  )
}

// ---- Picture 2: what was measured. Stage 2: the value and its ranges; stage 3: three possibilities; stage 4: a smaller error bar ----
const P2_LEFT = 40
const P2_RIGHT = 520
const P2_MIN = -2
const P2_MAX = 3
const ratioToX = (ratio: number) => P2_LEFT + ((ratio - P2_MIN) / (P2_MAX - P2_MIN)) * (P2_RIGHT - P2_LEFT)

const POSSIBILITIES: { ratio: number; head: string; lines: string[] }[] = [
  { ratio: -1, head: 'ratio −1', lines: ['falls up as', 'hard as matter', 'falls down'] },
  { ratio: 0, head: 'ratio 0', lines: ['no gravity', 'at all'] },
  { ratio: 1, head: 'ratio 1', lines: ['falls like', 'ordinary matter'] },
]

function NumberLine({ y }: { y: number }) {
  return (
    <g>
      <line x1={P2_LEFT} y1={y} x2={P2_RIGHT} y2={y} stroke={TEXT_COLOR} strokeWidth={1.5} />
      {[-2, -1, 0, 1, 2, 3].map((r) => (
        <g key={r}>
          <line x1={ratioToX(r)} y1={y - 4} x2={ratioToX(r)} y2={y + 4} stroke={TEXT_COLOR} />
          <text x={ratioToX(r)} y={y + 17} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
            {r}
          </text>
        </g>
      ))}
    </g>
  )
}

function RangeBar({ y, sigma, color, label, labelColor }: { y: number; sigma: number; color: string; label: string; labelColor?: string }) {
  const x1 = ratioToX(MEASURED - sigma)
  const x2 = ratioToX(MEASURED + sigma)
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={5} />
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} stroke={color} strokeWidth={2} />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} stroke={color} strokeWidth={2} />
      <text x={x2 + 10} y={y + 4} fill={labelColor ?? color} fontSize="11" fontWeight="bold">
        {label}
      </text>
    </g>
  )
}

function Marker({ ratio, axisY, sigma, stemTop, textY, head, lines }: { ratio: number; axisY: number; sigma: number; stemTop: number; textY: number; head: string; lines: string[] }) {
  const sigmas = sigmasFrom(MEASURED, sigma, ratio)
  const verdict = compatibility(sigmas)
  const x = ratioToX(ratio)
  const color = VERDICT_COLORS[verdict]
  const all: { t: string; bold: boolean; fill: string }[] = [
    { t: head, bold: true, fill: TEXT_COLOR },
    ...lines.map((t) => ({ t, bold: false, fill: MUTED_COLOR })),
    { t: `gap ${Math.abs(MEASURED - ratio).toFixed(2)}`, bold: false, fill: TEXT_COLOR },
    { t: `${sigmas.toFixed(1)} sigma`, bold: true, fill: color },
    { t: VERDICT_WORDS[verdict], bold: true, fill: color },
  ]
  return (
    <g>
      <line x1={x} y1={stemTop} x2={x} y2={axisY} stroke={color} strokeWidth={2} strokeDasharray="4 3" />
      <polygon points={`${x},${axisY - 7} ${x + 6},${axisY} ${x},${axisY + 7} ${x - 6},${axisY}`} fill={color} />
      {all.map((line, i) => (
        <text key={i} x={x} y={textY + i * 13} fill={line.fill} fontSize="10" fontWeight={line.bold ? 'bold' : 'normal'} textAnchor="middle">
          {line.t}
        </text>
      ))}
    </g>
  )
}

function PictureTwo({ stage, yours }: { stage: number; yours: { sigma: number; possibility: number } | null }) {
  const axisY = 230
  const axis2Y = 440
  const axis3Y = 650
  const height = yours !== null ? 790 : stage >= 4 ? 565 : 395
  const x0 = ratioToX(MEASURED)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="A number line for the ratio of antihydrogen's acceleration to g, from minus 2 to 3. The measured value, 0.75, is marked with three ranges around it. From the third stage, markers at minus 1, 0 and 1 each show how many sigma they are from the measured value and the verdict. In the fourth stage a second line shows the same value with a smaller, pretend error bar. After the run a third line follows the error bar and the possibility that the learner chooses"
    >
      <text x={P2_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: what was measured
      </text>
      <text x={P2_LEFT} y={40} fill={MUTED_COLOR} fontSize="10">
        The ratio of the acceleration to g (1 = falls like ordinary matter)
      </text>

      {/* The measured value and the three ranges (stage 2). */}
      <text x={x0} y={84} fill={ALPHA_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        measured value: {MEASURED}
      </text>
      <line x1={x0} y1={90} x2={x0} y2={axisY} stroke={ALPHA_COLOR} strokeWidth={1} strokeDasharray="2 3" />
      <RangeBar y={105} sigma={ALPHA_2023.statSys} color={ALPHA_COLOR} label={`±${ALPHA_2023.statSys}: counting and equipment`} />
      <RangeBar y={128} sigma={ALPHA_2023.simulation} color="#fbbf24" label={`±${ALPHA_2023.simulation}: the simulation`} />
      <RangeBar y={151} sigma={COMBINED} color="#ffffff" label={`±${COMBINED.toFixed(3)}: the two together`} labelColor={TEXT_COLOR} />
      <NumberLine y={axisY} />
      <circle cx={x0} cy={axisY} r={6} fill={ALPHA_COLOR} stroke={TEXT_COLOR} strokeWidth={1.5} />

      {/* The three possibilities (stage 3). */}
      {stage >= 3 &&
        POSSIBILITIES.map((p) => (
          <Marker key={p.ratio} ratio={p.ratio} axisY={axisY} sigma={COMBINED} stemTop={178} textY={268} head={p.head} lines={p.lines} />
        ))}

      {/* A smaller, pretend error bar (stage 4). */}
      {stage >= 4 && (
        <>
          <text x={P2_LEFT} y={382} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
            What if the error bar were smaller? (a pretend example, not a result)
          </text>
          <RangeBar y={408} sigma={SMALL_SIGMA} color="#ffffff" label={`±${SMALL_SIGMA.toFixed(2)}`} labelColor={TEXT_COLOR} />
          <NumberLine y={axis2Y} />
          <circle cx={x0} cy={axis2Y} r={6} fill={ALPHA_COLOR} stroke={TEXT_COLOR} strokeWidth={1.5} />
          <Marker ratio={1} axisY={axis2Y} sigma={SMALL_SIGMA} stemTop={420} textY={478} head="ratio 1" lines={['falls like', 'ordinary matter']} />
        </>
      )}

      {/* The learner's own error bar and possibility (after the run). */}
      {yours !== null && (
        <>
          <text x={P2_LEFT} y={592} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
            Your choice: the error bar and the possibility that you picked below
          </text>
          <RangeBar y={618} sigma={yours.sigma} color={YOURS_COLOR} label={`±${yours.sigma.toFixed(3)}`} labelColor={TEXT_COLOR} />
          <NumberLine y={axis3Y} />
          <circle cx={x0} cy={axis3Y} r={6} fill={ALPHA_COLOR} stroke={TEXT_COLOR} strokeWidth={1.5} />
          {POSSIBILITIES.filter((p) => p.ratio === yours.possibility).map((p) => (
            <Marker key={p.ratio} ratio={p.ratio} axisY={axis3Y} sigma={yours.sigma} stemTop={630} textY={688} head={p.head} lines={p.lines} />
          ))}
        </>
      )}
    </svg>
  )
}

// ---- Picture 3: how precise must a test be? (stage 5) ----
const P3_CENTRE = 280
const P3_SCALE = 800 // pixels per unit of ratio

function PictureThree({ difference, sigmas }: { difference: number; sigmas: number }) {
  const needed = sigmaNeeded(difference, sigmas)
  const rows: { y: number; color: string; title: string; sigma: number }[] = [
    { y: 100, color: ALPHA_COLOR, title: 'ALPHA’s measurement of 2023', sigma: COMBINED },
    { y: 190, color: '#ffffff', title: `Needed to see a ${(difference * 100).toFixed(0)} percent difference at ${sigmas} sigma`, sigma: needed },
    { y: 280, color: '#4ade80', title: 'The team’s aim: 1 percent or better', sigma: PLANNED_SIGMA },
  ]
  const height = 370
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Three horizontal bars centred on the measured value, each as wide as an error bar: ALPHA's measurement of 2023, the error bar needed to see a 20 percent difference at 3 sigma, and the team's aim of 1 percent or better. The first is much wider than the second, and the second much wider than the third"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: how precise must a test be?
      </text>
      <line x1={P3_CENTRE} y1={50} x2={P3_CENTRE} y2={320} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="3 4" />
      <text x={P3_CENTRE} y={44} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        the measured value (the middle of each bar)
      </text>
      {rows.map((row) => {
        const half = row.sigma * P3_SCALE
        return (
          <g key={row.title}>
            <text x={20} y={row.y - 22} fill={TEXT_COLOR} fontSize="11" fontWeight="bold">
              {row.title}
            </text>
            <rect x={P3_CENTRE - half} y={row.y - 9} width={2 * half} height={18} rx={3} fill={row.color} fillOpacity={0.85} />
            <text x={P3_CENTRE + half + 8} y={row.y + 4} fill={row.color} fontSize="11" fontWeight="bold">
              ±{row.sigma < 0.1 ? row.sigma.toFixed(3) : row.sigma.toFixed(2)}
            </text>
          </g>
        )
      })}
      <text x={20} y={height - 30} fill={MUTED_COLOR} fontSize="10">
        The width of a bar is the size of its error bar. A narrower bar is a more precise test.
      </text>
      <text x={20} y={height - 14} fill={MUTED_COLOR} fontSize="10">
        Rule used here: to see a difference at n sigma, the error bar must be at most 1/n of it.
      </text>
    </svg>
  )
}

// A number in plain scientific notation, such as 2.7 × 10⁻⁴, for the small chances of Table 2.
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
function chanceText(value: number): string {
  if (value >= 0.01) return value.toFixed(2)
  const [mantissa, exponent] = value.toExponential(1).split('e')
  return `${mantissa} × 10${String(Number(exponent)).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}

// Plain-language names for the four verdicts, for Table 2.
const VERDICT_MEANING: Record<Compatibility, string> = {
  compatible: 'compatible: the measurement cannot rule it out',
  borderline: 'borderline',
  disfavoured: 'disfavoured: a hint that it is wrong',
  ruledOut: 'ruled out',
}

// The papers behind the results, shown only after the run because their summaries state what the predictions ask (CLAUDE.md §12). Each address was
// fetched on 2026-10-21 (the arXiv page and the CERN news item through a summary; the paper through its open-access copy).
const PAPER_LINKS: { href: string; label: string; what: string }[] = [
  {
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10533407/',
    label: 'Nature, 2023: the ALPHA collaboration’s paper (open-access copy)',
    what: 'the original measurement of the acceleration of antihydrogen, (0.75 ± 0.13 ± 0.16) g. It is written for scientists.',
  },
  {
    href: 'https://home.cern/alpha-experiment-at-cern-observes-the-influence-of-gravity-on-antimatter/',
    label: 'CERN, 27 September 2023: ALPHA observes the influence of gravity on antimatter',
    what: 'CERN’s own news item on the result, in plain words: how the atoms were held, released and counted.',
  },
  {
    href: 'https://arxiv.org/abs/2503.22471',
    label: 'arXiv:2503.22471: the CERN antimatter programme',
    what: 'a review, written for the European strategy for particle physics, of ALPHA-g, GBAR and AEgIS and their plans. It is the source of the 2024 repeat and of the aim of 1 percent.',
  },
]

const lookForTrap: LookFor[] = [
  {
    look: 'the two rose bars (the mirror coils) and the green arrows that leave through them.',
    means: 'the team turns the current in both coils down, so the magnetic lids weaken. An atom that can then get past a lid leaves, through the top or through the bottom, and is not held again.',
    matters: 'gravity helps an atom going down and hinders one going up. If gravity pulls antihydrogen down, more atoms should leave through the bottom than through the top. Without a way out at both ends there would be nothing to compare.',
  },
  {
    look: 'the white stars on the grey box, and the purple strips on both sides.',
    means: 'an atom that leaves annihilates on the walls of the apparatus, in a flash. The detectors around the trap follow the particles from that flash and work out where it happened, which also tells the team whether it was at the top or the bottom.',
    matters: 'annihilation is how the team sees an atom at all: they cannot photograph one, so they count the flashes and where they happen.',
  },
  {
    look: 'the 25.6 cm height, and the gravity arrow.',
    means: 'the whole trap is about as tall as a school ruler and a half, and gravity pulls the same way on everything inside it.',
    matters: 'a trap this small means that very small forces matter. The atoms are so slow that a small push, such as gravity, decides which way they go.',
  },
]

export function AntimatterGravityExperiment({ onComplete, onTutorComplete }: AntimatterGravityExperimentProps) {
  const timeAtTrapLength = timeToFall(1, TRAP_LENGTH_M) as number
  const [fallsUpPrediction, setFallsUpPrediction] = useState<FallsUpAnswer | null>(null)
  const [readingPrediction, setReadingPrediction] = useState<ReadingAnswer | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  // The controls that appear after the run (the specification's "Learner Controls"). They start at the pictures' own values.
  const [userRatio, setUserRatio] = useState(MEASURED)
  const [userSigma, setUserSigma] = useState(COMBINED)
  const [possibility, setPossibility] = useState<-1 | 0 | 1>(1)
  const [diffPercent, setDiffPercent] = useState(EXAMPLE_DIFFERENCE * 100)
  const [nSigma, setNSigma] = useState<3 | 5>(EXAMPLE_SIGMAS)
  const hasRun = status !== 'idle'
  const bothPredicted = fallsUpPrediction !== null && readingPrediction !== null

  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
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
    setFallsUpPrediction(null)
    setReadingPrediction(null)
    setStatus('idle')
    setStage(0)
    setUserRatio(MEASURED)
    setUserSigma(COMBINED)
    setPossibility(1)
    setDiffPercent(EXAMPLE_DIFFERENCE * 100)
    setNSigma(EXAMPLE_SIGMAS)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }

  const fromMatter = sigmasFrom(MEASURED, COMBINED, 1)
  const fromNone = sigmasFrom(MEASURED, COMBINED, 0)
  const fromUp = sigmasFrom(MEASURED, COMBINED, -1)
  const smallFromMatter = sigmasFrom(MEASURED, SMALL_SIGMA, 1)
  const difference = diffPercent / 100
  const neededExample = sigmaNeeded(difference, nSigma)
  const mine = runAntimatterGravity(userRatio, userSigma, difference)
  const aimPhrase =
    neededExample >= PLANNED_SIGMA
      ? `The aim of ±${PLANNED_SIGMA} is about ${(neededExample / PLANNED_SIGMA).toFixed(1)} times narrower than the white bar, so a test that precise could see this difference at ${nSigma} sigma.`
      : `The aim of ±${PLANNED_SIGMA} is about ${(PLANNED_SIGMA / neededExample).toFixed(1)} times wider than the white bar, so a test that precise could not yet see this difference at ${nSigma} sigma.`
  const mineSigmas = possibility === 1 ? mine.sigmasFromMatter : possibility === 0 ? mine.sigmasFromNoGravity : mine.sigmasFromFallingUp
  const mineVerdict = possibility === 1 ? mine.verdictMatter : possibility === 0 ? mine.verdictNoGravity : mine.verdictFallingUp
  const timeAtTrapAlpha = timeToFall(MEASURED, TRAP_LENGTH_M) as number
  const alphaFallAtMatterTime = fallDistance(MEASURED, timeAtTrapLength)
  const done = status === 'complete'
  const sq = (value: number) => (value * value).toFixed(4)
  // Formulas with worked examples: shown in the "Words and formulas" panel only after the run (the specification's "Results"). Every number is from the module.
  const formulaEntries: { term: string; meaning: string }[] = [
    {
      term: 'Distance fallen (formula)',
      meaning: `distance = ½ × ratio × g × time², with g = ${G_EARTH}. Example, a ratio of ${MEASURED} for 1 second: ½ × ${MEASURED} × ${G_EARTH} × 1 × 1 = ${fallDistance(MEASURED, 1).toFixed(2)} metres. Twice the time gives four times the distance. A negative ratio gives a negative distance: it rises.`,
    },
    {
      term: 'Time to fall a height (formula)',
      meaning: `time = √(2 × height ÷ (ratio × g)). Example, the trap’s ${TRAP_LENGTH_M} metres at a ratio of 1: √(2 × ${TRAP_LENGTH_M} ÷ ${G_EARTH}) = ${timeAtTrapLength.toFixed(3)} seconds. A ratio of 0 or less never falls, so there is no time.`,
    },
    {
      term: 'Combined give or take (formula)',
      meaning: `√(a² + b²), for two independent give-or-takes a and b. Example: √(${ALPHA_2023.statSys}² + ${ALPHA_2023.simulation}²) = √(${sq(ALPHA_2023.statSys)} + ${sq(ALPHA_2023.simulation)}) = √${(ALPHA_2023.statSys ** 2 + ALPHA_2023.simulation ** 2).toFixed(4)} = ${COMBINED.toFixed(3)}. It is never smaller than the larger of the two. Treating the two as independent is this experiment’s simplification.`,
    },
    {
      term: 'Sigma away from a possibility (formula)',
      meaning: `sigma = |measured value − possibility| ÷ give or take. Example, the possibility 1: |${MEASURED} − 1| ÷ ${COMBINED.toFixed(3)} = 0.25 ÷ ${COMBINED.toFixed(3)} = ${fromMatter.toFixed(2)}. Halve the give or take and the sigma doubles.`,
    },
    {
      term: 'Chance from a bell curve',
      meaning: `how often a result at least this many sigma away would turn up by chance if the possibility were true and the scatter were a bell curve. Examples: ${fromMatter.toFixed(1)} sigma is a chance of ${chanceText(twoSidedChance(fromMatter))}, ${fromNone.toFixed(1)} sigma ${chanceText(twoSidedChance(fromNone))}, ${fromUp.toFixed(1)} sigma ${chanceText(twoSidedChance(fromUp))}. Like throwing a dart at a target: if your throws scatter about ±${COMBINED.toFixed(2)}, landing ${fromUp.toFixed(1)} of those scatters from a target almost never happens.`,
    },
    {
      term: 'Verdict scale (this experiment’s own choice)',
      meaning: 'below 2 sigma: compatible. 2 to 3: borderline. 3 to 5: disfavoured (a hint that it is wrong). 5 or more: ruled out. 3 and 5 are the bars of Experiments 1 and 2 of this group; 2 is a common rule of thumb.',
    },
    {
      term: 'Error bar needed (formula)',
      meaning: `error bar needed = difference ÷ number of sigma. Example, to see a difference of ${difference} at ${nSigma} sigma: ${difference} ÷ ${nSigma} = ${neededExample.toFixed(3)}. To see a difference of 0.01 (1 percent) at 3 sigma: 0.01 ÷ 3 = ${sigmaNeeded(0.01, 3).toFixed(4)}.`,
    },
  ]

  return (
    <div>
      <h2>Experiment 8 — Does Antimatter Fall Down?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): measured directly once, in 2023, and repeated in 2024, to a precision of about 20 percent (some sources say about 25 percent; after the run, Table 3 explains the two). The
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
            laboratory, made about 100 antihydrogen atoms and held them in a tall, upright trap, the <strong>ALPHA-g</strong> trap. The trap has no solid
            walls, because an atom that touched one would annihilate. The atoms are held by magnetic fields alone. Two ring-shaped electromagnets, called{' '}
            <strong>mirror coils</strong>, one at the top of the trap and one at the bottom, make fields that push the atoms back in, a little like a lid at
            each end.
          </p>
          <p style={paragraph}>
            To measure the fall, the team <strong>reduced the electric current in both mirror coils at the same time, steadily, over 20 seconds</strong>. A weaker
            current makes a weaker magnetic field, so each lid pushes back less. An atom that is moving fast enough, in the right direction, can then get past a
            lid and leave. Gravity matters here: for an atom heading up, gravity pulls against it, and for an atom heading down, gravity helps. So if gravity
            pulls antihydrogen down, more atoms should leave through the bottom than through the top.
          </p>
          <p style={paragraph}>
            An atom that leaves the trap flies on until it hits the walls of the apparatus around it (the paper’s own words), and there it annihilates in a flash.
            The flash sends out charged particles, called pions. Two detectors that <strong>surround the trap</strong> (they are not at its ends) follow those
            particles and work out where the flash happened. From that the team knows whether each atom left through the top or the bottom. Comparing the number
            of top escapes with the number of bottom escapes, using a computer simulation, gives the acceleration. An everyday comparison: open the top and
            bottom doors of a tall lift shaft, and count who falls out of which door.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <TrapDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this drawing.</strong> It is a sketch of the idea, not a picture of the real equipment, and it is not to scale. You are looking
              at the trap from the side.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The thin dotted outline</strong> in the middle is the trap, {(TRAP_LENGTH_M * 100).toFixed(1)} cm tall in the real thing. It has no solid
                walls: the outline only marks where the atoms are held, by magnetic fields. The <strong>yellow dots</strong> are antihydrogen atoms (about 100 in
                reality, a dozen here).
              </li>
              <li>
                <strong>The two rose bars</strong> are the mirror coils, the ring-shaped electromagnets at the top and the bottom. Their magnetic fields push
                the atoms back in, like lids. The team weakens both fields by turning the current down.
              </li>
              <li>
                <strong>The grey box</strong> around the trap stands for the walls of the apparatus. The <strong>green arrows</strong> show an atom that got past a
                lid, one upward and one downward. The <strong>white stars</strong> show the flash when it hits the wall and annihilates.
              </li>
              <li>
                <strong>The two purple dashed strips</strong> are the detectors. In reality they form a cylinder around the whole trap, so from the side you see
                its two sides. They are not at the ends of the trap, and they are much taller than it. They follow the particles from a flash and work out where it
                happened.
              </li>
              <li>
                <strong>The blue arrow</strong> on the right shows that gravity pulls down.
              </li>
            </ul>
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
            <em>Nature</em>. The team repeated it in 2024 and reports that the result was reproduced. Its precision is about 20 percent (some sources say about 25 percent; Table 3, after the run, shows both), and the team expects that
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
            <li>
              <ExternalLink href="https://home.cern/updated-schedule-cerns-accelerators">CERN: Updated schedule for CERN’s accelerators</ExternalLink>: what
              Long Shutdown 3 is, when each machine stops, and when the machines restart, from CERN itself.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={done ? [...REFERENCE_ENTRIES, ...formulaEntries] : REFERENCE_ENTRIES} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says
            which answer is right, gives a sigma, or says what the measurement found. */}
        {(
          [
            {
              title: 'Prediction 1: could antimatter fall up?',
              text: (
                <>
                  The ALPHA team measured the acceleration of antihydrogen as a <strong>ratio</strong> to the acceleration of ordinary matter:{' '}
                  <strong>0.75, give or take about 0.2</strong>. A ratio of 1 means “falls like ordinary matter”, and a ratio of{' '}
                  <strong>−1 means “falls up, as hard as ordinary matter falls down”</strong>. Is the measurement compatible with antimatter falling up?
                </>
              ),
              choices: FALLS_UP_CHOICES,
              value: fallsUpPrediction,
              set: (v: FallsUpAnswer) => setFallsUpPrediction(v),
            },
            {
              title: 'Prediction 2: what does 0.75 tell us?',
              text: (
                <>
                  Does a measurement of <strong>0.75, give or take about 0.2</strong>, show that antimatter falls more slowly than ordinary matter?
                </>
              ),
              choices: READING_CHOICES,
              value: readingPrediction,
              set: (v: ReadingAnswer) => setReadingPrediction(v),
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
                  (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.
                </span>
              )}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 &&
              `Picture 1 now shows what different ratios mean for a falling atom. The blue curve is a ratio of 1, the teal curve is the ratio ALPHA reported, ${MEASURED}, the pink line is a ratio of 0 (no fall at all) and the orange curve is a ratio of −1 (it rises as far as the blue curve falls).`}
            {stage === 2 &&
              `Picture 2 appears below Picture 1. Its teal dot is ALPHA’s measured ratio, ${MEASURED}. The three bars above it are the give or take: ±${ALPHA_2023.statSys} from counting and the equipment, ±${ALPHA_2023.simulation} from the simulation, and ±${COMBINED.toFixed(3)} for the two together.`}
            {stage === 3 &&
              `Three possibilities are added to Picture 2: a ratio of −1, of 0 and of 1. Each is marked with its gap from ${MEASURED}, how many give-or-takes (sigma) that gap is, and a verdict.`}
            {stage === 4 &&
              `A second line is added to Picture 2. It is a pretend example: the same ${MEASURED}, but with an error bar of ±${SMALL_SIGMA.toFixed(2)} instead of ±${COMBINED.toFixed(2)}. The same gap to 1 now counts for more give-or-takes.`}
            {stage === 5 &&
              `Picture 3 appears below Picture 2. Its three bars are three error bars: ALPHA’s, the one needed to see a ${(diffPercent).toFixed(0)} percent difference at ${nSigma} sigma, and the team’s aim of 1 percent or better.`}
          </p>
        )}

        {/* Picture 1: ordinary matter from the start; the other three curves from stage 1. */}
        <div style={{ marginBottom: '1rem' }}>
          <PictureOne stage={stage} userRatio={done ? userRatio : null} />
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>How to read Picture 1.</strong> This picture shows how far an object falls as time passes after it is let go. The horizontal line is{' '}
            <strong>time</strong> since release, from 0 to 0.5 seconds. The vertical line is the <strong>distance fallen</strong>, in metres: the line in the
            middle is the starting height, a point below it has fallen by that much, and a point above it has <em>risen</em> by that much. (One metre is a
            little over three feet.) A <strong>ratio</strong> says how strongly gravity pulls on the object compared with an ordinary falling object: each
            curve below is for a different ratio.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The blue curve</strong> is an ordinary falling object, a ratio of 1. It starts slowly and bends downward: each moment it falls faster
              than the one before, because its speed keeps growing.
            </li>
            <li>
              <strong>The amber dashed line</strong> is {(TRAP_LENGTH_M * 100).toFixed(1)} cm, the height of the ALPHA-g trap. The dot where a curve meets it
              is the moment an object of that ratio has fallen that far.
            </li>
            {stage === 0 && (
              <li>
                <strong>Nothing else is drawn yet.</strong> After you press Run, the picture adds the curve for the ratio that ALPHA reported, and the
                curves for a ratio of 0 and of −1.
              </li>
            )}
            {done && (
              <li>
                <strong>The white dashed curve</strong> is your own ratio, from control 1 below the pictures. It starts at {MEASURED}, so it lies on top of the
                teal curve until you move the slider. If a ratio falls so fast that its curve would leave the picture, the picture cuts it off.
              </li>
            )}
            {stage >= 1 && (
              <>
                <li>
                  <strong>The teal curve</strong> is a ratio of {MEASURED}, the value ALPHA reported. A ratio of {MEASURED} means gravity pulls it three quarters
                  as hard as it pulls ordinary matter.
                </li>
                <li>
                  <strong>The pink line</strong> is a ratio of 0. There is no pull at all, so the atom stays where it is. It lies along the time line, because
                  “fallen by 0 metres” is that line.
                </li>
                <li>
                  <strong>The orange curve</strong> is a ratio of −1. The pull is as strong as for ordinary matter but points <em>up</em>, so the atom rises
                  by exactly as much as the blue curve falls.
                </li>
              </>
            )}
          </ul>
          {stage >= 1 && (
            <p style={paragraph}>
              <strong>A worked moment.</strong> After one second the distance fallen is ½ × ratio × g × 1 × 1. For a ratio of 1 that is ½ × 1 × {G_EARTH} ×
              1 × 1 = {fallDistance(1, 1).toFixed(2)} metres. For a ratio of {MEASURED} it is ½ × {MEASURED} × {G_EARTH} × 1 × 1 ={' '}
              {fallDistance(MEASURED, 1).toFixed(2)} metres. For a ratio of 0 it is 0, and for a ratio of −1 it is {fallDistance(-1, 1).toFixed(2)} metres (a
              negative distance means it has risen). (The picture stops at 0.5 seconds, so these one-second values are beyond its edge.)
            </p>
          )}
          {stage >= 1 && (
            <>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'the pink line and the orange curve, compared with the blue curve.',
                    means: 'a ratio of 0 stays put, and a ratio of −1 rises exactly as far as ordinary matter falls: the orange curve is the blue one turned upside down.',
                    matters: 'these are the possibilities that “does antimatter fall up?” is about. The three curves, one for each, are very different from each other, so a measurement could in principle tell them apart.',
                  },
                  {
                    look: 'the teal curve, compared with the blue curve.',
                    means: `the two curves are close together. When the blue curve has fallen ${(TRAP_LENGTH_M * 100).toFixed(1)} cm, at ${timeAtTrapLength.toFixed(2)} seconds, the teal curve has fallen ${(alphaFallAtMatterTime * 100).toFixed(1)} cm, a difference of ${((TRAP_LENGTH_M - alphaFallAtMatterTime) * 100).toFixed(1)} cm.`,
                    matters: 'a gap this small is what a measurement has to be careful enough to see. How careful it was is what Picture 2 is about.',
                  },
                  {
                    look: 'the two dots on the amber line.',
                    means: `the blue dot is at ${timeAtTrapLength.toFixed(2)} seconds and the teal dot at ${timeAtTrapAlpha.toFixed(2)} seconds. The two falls differ by about ${(timeAtTrapAlpha - timeAtTrapLength).toFixed(2)} seconds.`,
                    matters: 'a few hundredths of a second is far too short to time by eye. (ALPHA-g does not time a fall at all: it counts where atoms leave, as the introduction says.)',
                  },
                ]}
              />
            </>
          )}
        </div>

        {/* Picture 2: the value and its ranges from stage 2, the three possibilities from stage 3, a smaller error bar from stage 4. */}
        {stage >= 2 && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <PictureTwo stage={stage} yours={done ? { sigma: userSigma, possibility } : null} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>How to read Picture 2.</strong> This picture shows what ALPHA measured, on a number line for the ratio. The numbers along the line
                are ratios, from −2 to 3. A measurement is never exact, so it is written as a value with a <strong>give or take</strong> (also called an
                error bar or an uncertainty). The true value is thought to lie somewhere within it.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The teal dot</strong> is the measured value, {MEASURED}. The dotted line above it is a guide to the eye.
                </li>
                <li>
                  <strong>The three bars above the dot</strong> are three give-or-takes, each drawn from {MEASURED} minus the give or take to {MEASURED} plus it.
                  The <strong>teal bar</strong> (±{ALPHA_2023.statSys}) comes from counting too few atoms and from small faults in the equipment. The{' '}
                  <strong>amber bar</strong> (±{ALPHA_2023.simulation}) comes from the computer simulation, which links the counts to an acceleration and is
                  itself not exact. The <strong>white bar</strong> (±{COMBINED.toFixed(3)}) is the two together.
                </li>
                {stage >= 3 && (
                  <>
                    <li>
                      <strong>The three markers</strong> are possibilities: a ratio of −1, of 0 and of 1. Under each are its <strong>gap</strong> (how far it
                      is from {MEASURED}), the gap in give-or-takes (<strong>sigma</strong>, as in Experiments 1 and 2 of this group), and a verdict.
                    </li>
                    <li>
                      <strong>The verdict</strong> uses this experiment’s own scale: <strong>compatible</strong> below 2 sigma (the measurement cannot rule the
                      possibility out), <strong>borderline</strong> from 2 to 3, <strong>disfavoured</strong> from 3 to 5 (a hint that it is wrong), and{' '}
                      <strong>ruled out</strong> at 5 or more (the usual bar for a discovery). The marker’s colour follows the verdict: green, amber, orange,
                      rose.
                    </li>
                  </>
                )}
                {stage >= 4 && (
                  <li>
                    <strong>The lower line</strong> is a pretend example, not a result: the same {MEASURED}, but with a smaller error bar of ±
                    {SMALL_SIGMA.toFixed(2)}. Only the marker at 1 is shown.
                  </li>
                )}
                {done && (
                  <li>
                    <strong>The third line</strong> (a white bar and one marker) is your own choice, from control 2 below the pictures: the error bar you set and
                    the one possibility you picked. It starts at ALPHA’s error bar and the possibility 1, so it begins as a copy of the first line’s marker at 1.
                    The marker’s text gives its gap, sigma and verdict for your error bar.
                  </li>
                )}
              </ul>
              <p style={paragraph}>
                <strong>A worked moment.</strong> The two give-or-takes are combined as √(0.13² + 0.16²) = √(0.0169 + 0.0256) = √0.0425 ={' '}
                {COMBINED.toFixed(3)}. (This experiment treats the two as independent, which is a simplification: the paper states them separately.)
                {stage >= 3 && (
                  <>
                    {' '}
                    The gap from {MEASURED} to 1 is 1 − {MEASURED} = 0.25, and 0.25 ÷ {COMBINED.toFixed(3)} = {fromMatter.toFixed(1)} sigma. The gap to 0 is{' '}
                    {MEASURED}, and {MEASURED} ÷ {COMBINED.toFixed(3)} = {fromNone.toFixed(1)} sigma. The gap to −1 is 1.75, and 1.75 ÷ {COMBINED.toFixed(3)} ={' '}
                    {fromUp.toFixed(1)} sigma.
                  </>
                )}
                {stage >= 4 && (
                  <>
                    {' '}
                    With a give or take of {SMALL_SIGMA.toFixed(2)}, the gap to 1 would be 0.25 ÷ {SMALL_SIGMA.toFixed(2)} = {smallFromMatter.toFixed(1)} sigma.
                  </>
                )}
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'the width of the three bars, compared with the spaces between −1, 0 and 1.',
                    means: `the whole give or take, ±${COMBINED.toFixed(2)}, is about a fifth of the distance between ratio 0 and ratio 1. It is small next to those distances, but not tiny.`,
                    matters: 'how wide the give or take is, compared with the distance to a possibility, decides whether that possibility can be ruled out. One number alone, without its give or take, tells you very little.',
                  },
                  ...(stage >= 3
                    ? [
                        {
                          look: 'the sigma and the verdict under each of the three markers.',
                          means: `the possibility at 1 is ${fromMatter.toFixed(1)} sigma away, the one at 0 is ${fromNone.toFixed(1)} sigma away, and the one at −1 is ${fromUp.toFixed(1)} sigma away. The verdicts under them follow from the scale above.`,
                          matters: 'a small gap, counted in give-or-takes, means the measurement cannot tell the possibility from the measured value. A large one means it can. This is how a result is turned into a statement about a possibility.',
                        },
                      ]
                    : []),
                  ...(stage >= 4
                    ? [
                        {
                          look: 'the lower line, and the marker at 1 on it.',
                          means: `the measured value and the gap to 1 are the same as above, but the error bar is narrower, so the gap is now ${smallFromMatter.toFixed(1)} sigma and the verdict has changed.`,
                          matters: 'how many sigma a possibility is from a measurement depends on how precise the measurement is as well as on the gap. A more precise measurement of the same value would say more.',
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          </>
        )}

        {/* Picture 3: how precise must a test be? (stage 5) */}
        {stage >= 5 && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <PictureThree difference={difference} sigmas={nSigma} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>How to read Picture 3.</strong> This picture compares three error bars, to show how precise a measurement has to be to see a small
                difference. Each bar is centred on the same middle line, and its <strong>width is the size of the error bar</strong>: a narrower bar means a more
                precise measurement. (The numbers beside the bars are the give or take, written ±.)
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The teal bar</strong> is ALPHA’s measurement of 2023, ±{COMBINED.toFixed(2)}, the same give or take as the white bar of Picture 2.
                </li>
                <li>
                  <strong>The white bar</strong> is the error bar that a test would need in order to see a difference of {(diffPercent).toFixed(0)}{' '}
                  percent (a gap of {difference} in the ratio) at {nSigma} sigma. This experiment uses a simple rule: the error bar needed is the
                  difference divided by the number of sigma. After the run you can change the difference and the number of sigma (control 3), and this bar
                  follows.
                </li>
                <li>
                  <strong>The green bar</strong> is the team’s aim of “1 percent or better”, drawn here as ±{PLANNED_SIGMA} on the ratio (this experiment’s own
                  reading of “1 percent”).
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment.</strong> To see a difference of {difference} at {nSigma} sigma: {difference} ÷ {nSigma} ={' '}
                {neededExample.toFixed(3)}. ALPHA’s ±{COMBINED.toFixed(3)} is about {(COMBINED / neededExample).toFixed(1)} times too wide for that. {aimPhrase} A difference of 1 percent
                (0.01) at 3 sigma would need {sigmaNeeded(0.01, 3).toFixed(4)}.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList
                items={[
                  {
                    look: 'the teal bar, compared with the white bar.',
                    means: `ALPHA’s bar is about ${(COMBINED / neededExample).toFixed(0)} times wider than the bar needed to see a ${(diffPercent).toFixed(0)} percent difference at ${nSigma} sigma.`,
                    matters: 'a measurement can only see differences bigger than its error bar allows. A gap smaller than that is lost in the give or take.',
                  },
                  {
                    look: 'the green bar, compared with the white bar.',
                    means: `the green bar is the precision that the team aims for. ${aimPhrase}`,
                    matters: 'the narrower the bar, the smaller the difference that a test could see. A bar that is wider than the white bar cannot see the difference you chose; a bar that is narrower can.',
                  },
                ]}
              />
            </div>
          </>
        )}

        {/* The three controls (after the run): the specification's "Learner Controls". */}
        {done && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Try your own numbers</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
              The three controls below change the pictures and tables. The measured value, {MEASURED}, stays fixed. The “Start over” button puts everything back.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.25rem' }}>1. What if antimatter fell with a ratio of…?</p>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              Ratio: <strong>{userRatio.toFixed(2)}</strong> (1 = like ordinary matter, 0 = no gravity, negative = it rises)
              <input
                type="range"
                min={-1.5}
                max={2}
                step={0.05}
                value={userRatio}
                onChange={(e) => setUserRatio(Math.round(Number(e.target.value) * 100) / 100)}
                style={{ display: 'block', width: '100%', maxWidth: '420px' }}
              />
            </label>
            <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1.25rem' }}>
              {mine.direction === 'up' ? (
                <>In one second it <strong>rises</strong> {Math.abs(mine.distanceInOneSecond).toFixed(2)} m. It never falls, so there is no time to fall the trap’s height.</>
              ) : mine.direction === 'stays' ? (
                <>It <strong>does not move</strong>. There is no pull, so it never falls the trap’s height.</>
              ) : (
                <>
                  In one second it falls <strong>{mine.distanceInOneSecond.toFixed(2)} m</strong>. It takes <strong>{(mine.timeToFallTrap as number).toFixed(3)} s</strong> to
                  fall the trap’s {(TRAP_LENGTH_M * 100).toFixed(1)} cm.
                </>
              )}{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                (½ × {userRatio.toFixed(2)} × {G_EARTH} × 1² = {mine.distanceInOneSecond.toFixed(2)} m. Picture 1 shows it as the white dashed curve
                {Math.abs(fallDistance(userRatio, P1_MAX_SECONDS)) > P1_MAX_DISTANCE ? ', which leaves the picture before 0.5 seconds' : ''}.)
              </span>
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.25rem' }}>2. What if the error bar were…?</p>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Error bar: <strong>±{userSigma.toFixed(3)}</strong> (ALPHA’s was ±{COMBINED.toFixed(3)})
              <input
                type="range"
                min={0.01}
                max={0.5}
                step={0.001}
                value={userSigma}
                onChange={(e) => setUserSigma(Number(e.target.value))}
                style={{ display: 'block', width: '100%', maxWidth: '420px' }}
              />
            </label>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>Test the possibility:</span>
              {([-1, 0, 1] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPossibility(value)}
                  className={`toggle-button${possibility === value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.875rem' }}
                >
                  ratio {value}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1.25rem' }}>
              With an error bar of ±{userSigma.toFixed(3)}, the possibility {possibility} is{' '}
              <strong>{mineSigmas.toFixed(2)} sigma</strong> from {MEASURED}: <strong>{VERDICT_MEANING[mineVerdict]}</strong>.{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                (|{MEASURED} − ({possibility})| ÷ {userSigma.toFixed(3)} = {Math.abs(MEASURED - possibility).toFixed(2)} ÷ {userSigma.toFixed(3)} = {mineSigmas.toFixed(2)}. Picture 2 shows
                it as its third line.)
              </span>
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.25rem' }}>3. How small a difference could we see?</p>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Difference between two ratios: <strong>{diffPercent} percent</strong> of g (a gap of {difference.toFixed(2)} in the ratio)
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={diffPercent}
                onChange={(e) => setDiffPercent(Number(e.target.value))}
                style={{ display: 'block', width: '100%', maxWidth: '420px' }}
              />
            </label>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', marginRight: '0.5rem' }}>See it at:</span>
              {([3, 5] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setNSigma(value)}
                  className={`toggle-button${nSigma === value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.875rem' }}
                >
                  {value} sigma{value === 3 ? ' (a hint)' : ' (a discovery)'}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: 0 }}>
              To see a difference of {diffPercent} percent at {nSigma} sigma, the error bar must be at most <strong>±{neededExample < 0.1 ? neededExample.toFixed(4) : neededExample.toFixed(3)}</strong>.{' '}
              <span style={{ color: 'var(--text-muted)' }}>
                ({difference.toFixed(2)} ÷ {nSigma} = {neededExample < 0.1 ? neededExample.toFixed(4) : neededExample.toFixed(3)}. ALPHA’s ±{COMBINED.toFixed(3)} is{' '}
                {COMBINED > neededExample ? `${(COMBINED / neededExample).toFixed(1)} times too wide` : `narrow enough`} for this. Picture 3 shows it as the white bar.)
              </span>
            </p>
          </div>
        )}

        {/* The results (after the run): the status label, three tables, and the links kept back until now (CLAUDE.md §12). The tables only report
            numbers; the explanation is the tutor's. */}
        {done && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Results</p>
            <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '0.75rem' }}>
              <strong>
                Where this stands (as of October 2026): strong evidence that antihydrogen is attracted to the Earth, to within about 20 percent. Open: whether
                it falls exactly as ordinary matter does.
              </strong>
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
              These tables only report numbers, step by step. Table 1 repeats the four ratios of Picture 1, with your own ratio as its last row. Table 2 is Picture 2’s three possibilities, with your own error bar and possibility as its last row. Table 3
              lists the published results and plans that this experiment uses, as the sources state them. Table 4 follows your choice of difference. Your predictions are not marked here.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 1: how far each ratio falls</p>
            <ResultsTable
              minWidth={640}
              head={['Ratio', 'Distance in one second', 'Time to fall the trap’s 25.6 cm', 'Which way', 'How it is worked out']}
              rows={[1, MEASURED, 0, -1, userRatio].map((ratio, index) => {
                const time = timeToFall(ratio, TRAP_LENGTH_M)
                const direction = upOrDown(ratio)
                return [
                  index === 4 ? `${ratio.toFixed(2)} (your ratio)` : ratio === MEASURED ? `${ratio} (ALPHA’s value)` : String(ratio),
                  `${fallDistance(ratio, 1).toFixed(2)} m`,
                  time === null ? 'it does not fall' : `${time.toFixed(3)} s`,
                  direction === 'down' ? 'down' : direction === 'up' ? 'up' : 'stays where it is',
                  `½ × ${ratio} × ${G_EARTH} × 1² = ${fallDistance(ratio, 1).toFixed(2)} m` +
                    (time === null ? '; no time, because it never falls' : `; √(2 × ${TRAP_LENGTH_M} ÷ (${ratio} × ${G_EARTH})) = √${((2 * TRAP_LENGTH_M) / (ratio * G_EARTH)).toFixed(4)} = ${time.toFixed(3)} s`),
                ]
              })}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              A negative distance means that it rises. The time to fall the trap’s height is only a size for the idea: ALPHA-g does not time a fall.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 2: the measurement against three possibilities</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
              The give or take used in the first three rows is the combined one: √({ALPHA_2023.statSys}² + {ALPHA_2023.simulation}²) = √{sq(ALPHA_2023.statSys)} + {sq(ALPHA_2023.simulation)}{' '}
              = √{(ALPHA_2023.statSys ** 2 + ALPHA_2023.simulation ** 2).toFixed(4)} = {COMBINED.toFixed(3)}.
            </p>
            <ResultsTable
              minWidth={700}
              head={['Possibility', 'Gap from 0.75', 'Sigma', 'Chance from a bell curve', 'Verdict', 'How it is worked out']}
              rows={[
                [-1, 'falls up as hard as matter falls down'],
                [0, 'no gravity'],
                [1, 'falls like ordinary matter'],
              ].map(([ratio, name]) => {
                const r = ratio as number
                const sigmas = sigmasFrom(MEASURED, COMBINED, r)
                const gap = Math.abs(MEASURED - r)
                return [
                  `${r}: ${name}`,
                  gap.toFixed(2),
                  sigmas.toFixed(2),
                  chanceText(twoSidedChance(sigmas)),
                  VERDICT_MEANING[compatibility(sigmas)],
                  `|${MEASURED} − (${r})| ÷ ${COMBINED.toFixed(3)} = ${gap.toFixed(2)} ÷ ${COMBINED.toFixed(3)} = ${sigmas.toFixed(2)}`,
                ]
              }).concat([
                [
                  `${possibility} with your error bar of ±${userSigma.toFixed(3)}`,
                  Math.abs(MEASURED - possibility).toFixed(2),
                  mineSigmas.toFixed(2),
                  chanceText(twoSidedChance(mineSigmas)),
                  VERDICT_MEANING[mineVerdict],
                  `${Math.abs(MEASURED - possibility).toFixed(2)} ÷ ${userSigma.toFixed(3)} = ${mineSigmas.toFixed(2)}`,
                ],
              ])}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              “Chance from a bell curve” is how often a result at least this far away would turn up by chance if the possibility were true. It assumes a bell
              curve and that the two give-or-takes are independent, which is this experiment’s simplification. The paper uses its own method and reports a chance
              of {chanceText(2.9e-4)} for a ratio of 0, close to the {chanceText(twoSidedChance(fromNone))} here. The verdict scale is this experiment’s own choice
              (compatible below 2 sigma, borderline 2 to 3, disfavoured 3 to 5, ruled out at 5 or more).
            </p>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Table 3: the published results and plans</p>
            <ResultsTable
              minWidth={700}
              head={['Item', 'What the source says', 'Source']}
              rows={[
                [
                  'ALPHA, 2023: the acceleration of antihydrogen',
                  `(${ALPHA_2023.ratio} ± ${ALPHA_2023.statSys} ± ${ALPHA_2023.simulation}) g, with g = ${G_EARTH} m/s². The first ± is the statistical and systematic uncertainty together, and the second is from the simulation. About 100 atoms, stacked over 50 cycles, in a trap 25.6 cm long and 4.4 cm across.`,
                  'Nature 621, 716-722 (27 September 2023)',
                ],
                [
                  'ALPHA, 2023: “no gravity” (ratio 0)',
                  `a probability of ${chanceText(2.9e-4)}, by the paper’s own method`,
                  'Nature 621, 716-722',
                ],
                [
                  'ALPHA, 2023: falling up with the full strength of g (ratio −1)',
                  'the paper calls it ruled out, with a probability below 10⁻¹⁵',
                  'Nature 621, 716-722',
                ],
                [
                  'ALPHA, precision and the repeat',
                  'the acceleration was measured “to a precision of about 20%”, and the result was “reproduced in our run of 2024”. No 2024 number was read.',
                  'arXiv:2503.22471 (submitted 31 March 2025)',
                ],
                [
                  'ALPHA, the aim',
                  'a precision of “1% or better is possible in the existing machine”. Upgrades planned for after Long Shutdown 3 (CERN’s long stop for upgrades) would take the antihydrogen out of the trap and use atomic interferometry (a very sensitive way of measuring a tiny push on atoms) to reach much higher precision. Both terms are in “Words and formulas”.',
                  'arXiv:2503.22471',
                ],
                [
                  'A December 2025 review, on the same measurement',
                  'gives the result as (0.75 ± 0.13 ± 0.16) g, “consistent with attractive gravity but at ∼25% precision”. It says that reaching “the ≲1% regime” needs “order-of-magnitude reductions” in two kinds of systematic error (the starting conditions of the atoms and the gradient of the magnetic field), and that AEgIS and GBAR have “different systematics”.',
                  'arXiv:2512.21445, section VII.4.2 (a review by one author, submitted 24 December 2025, published in the European Physical Journal Plus, 2026)',
                ],
                [
                  'GBAR, a different method',
                  'aims for a relative precision “of order 10⁻⁵” (a hundred-thousandth). It makes and cools antihydrogen ions first. As far as the source says, no result yet.',
                  'arXiv:2503.22471',
                ],
                [
                  'AEgIS, a different method',
                  'plans a first measurement with a horizontal beam of antihydrogen and a technique called Moiré interferometry (a very sensitive way of measuring a tiny push on a beam of atoms), feasible by Long Shutdown 3 (CERN’s long stop for upgrades). Both terms are in “Words and formulas”. As far as the source says, no result yet.',
                  'arXiv:2503.22471',
                ],
              ]}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
              The numbers are quoted as the sources state them. The plans come from a review submitted in March 2025, so they are as of that date; no newer result
              from these experiments was found for this page, but the search was limited. <strong>Two reviews state the precision differently:</strong> “about
              20%” (March 2025) and “∼25%” (December 2025). Both are about this same measurement, and neither says how it was counted. The give or take of ±{COMBINED.toFixed(3)} is{' '}
              {(COMBINED * 100).toFixed(0)} percent of g (the ratio 1) and {((COMBINED / MEASURED) * 100).toFixed(0)} percent of the measured {MEASURED}, which fits numbers in that range. The reviews also differ on how
              hard 1 percent is: the March review says it is possible in the existing machine, and the December review says it needs ten-fold cuts in two kinds
              of systematic error. This experiment does not analyse ALPHA’s data and does not claim a new
              law of gravity.
            </p>

            <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Table 4: how small an error bar a test needs</p>
            <ResultsTable
              minWidth={560}
              head={['Quantity', 'Value', 'How it is worked out']}
              rows={[
                ['The difference to see', `${diffPercent} percent of g`, `your choice; ${diffPercent} ÷ 100 = ${difference.toFixed(2)} in the ratio`],
                ['Error bar needed at 3 sigma', `±${mine.sigmaNeededAt3.toFixed(4)}`, `${difference.toFixed(2)} ÷ 3`],
                ['Error bar needed at 5 sigma', `±${mine.sigmaNeededAt5.toFixed(4)}`, `${difference.toFixed(2)} ÷ 5`],
                ['ALPHA’s 2023 error bar', `±${COMBINED.toFixed(3)}`, `from Table 2: ${COMBINED.toFixed(3)} is ${(COMBINED / mine.sigmaNeededAt3).toFixed(1)} times the bar needed at 3 sigma and ${(COMBINED / mine.sigmaNeededAt5).toFixed(1)} times the bar needed at 5 sigma`],
                ['The team’s aim', `±${PLANNED_SIGMA}`, `“1 percent or better”, drawn as ±${PLANNED_SIGMA} on the ratio (this experiment’s own reading)`],
              ]}
            />

            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Want to know more?</strong> The papers and the news item behind these numbers are listed here now, because their summaries state what the
              predictions asked. Links open in a new tab.
            </p>
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
              {PAPER_LINKS.map((paper) => (
                <li key={paper.href}>
                  <ExternalLink href={paper.href}>{paper.label}</ExternalLink>: {paper.what}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The chapter summary below the experiment
            (in App) is shown only once the learner reaches the explanation. */}
        {done && fallsUpPrediction !== null && readingPrediction !== null && (
          <AntimatterGravityTutor
            fallsUpPrediction={fallsUpPrediction}
            readingPrediction={readingPrediction}
            onExplained={() => onTutorComplete?.()}
          />
        )}
      </div>
    </div>
  )
}
