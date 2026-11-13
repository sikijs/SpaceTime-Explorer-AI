import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  COLLISION_RADIUS_FACTOR,
  ORBIT_GRAVITATIONAL_PARAMETER,
  ORBIT_INITIAL_DISTANCE,
  PART_ONE_PUSHES,
  circularSpeedFor,
  edgeCheck,
  farthestPointFraction,
  guessMarkers,
  pushEdgeForCollisionSize,
  pushEdges,
  pushSummary,
  runOrbitExperiment,
} from '../physics/orbitExperiment'
import type { OrbitExperimentResult, OrbitOutcome, YesNo } from '../physics/orbitExperiment'
import { OrbitTutor } from './OrbitTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import {
  Block,
  CaptionBox,
  ExternalLink,
  GuessTag,
  LookFor,
  WhereFrom,
  listStyle,
  paragraph,
  smallNote,
} from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 6, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/06-draft-wording.md,
// approved by the owner on 2026-11-12): the page in four Parts, a labelled top view and an outcome graph with three white guess marks,
// three Part 1 pushes with one Run, the slider in Part 2, a check-up table, links after the tutor, a words box and Start over. Every
// number drawn comes from the physics module (src/physics/orbitExperiment.ts; CLAUDE.md §9).

interface OrbitExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type Part1Key = 'weak' | 'strong' | 'inBetween'
type RunStatus = 'idle' | 'running' | 'complete'
type OutcomeChoice = OrbitOutcome
type YesNoChoice = YesNo

const PART1_KEYS: Part1Key[] = ['weak', 'strong', 'inBetween']
const PART1_BUTTONS: Record<Part1Key, string> = {
  weak: 'A very weak push (push strength 20)',
  strong: 'A very strong push (push strength 200)',
  inBetween: 'A push in between (push strength 100)',
}

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const FIXED_COLOR = '#f59e0b' // amber: Part 1's pushes, the fixed reference
const REFERENCE_COLOR = '#9ca3af' // grey: Part 1's paths once Part 2 is open
const STEP_COLOR = '#2dd4bf' // teal: the real step line
const MASS_COLOR = '#fef08a' // pale yellow: the fixed mass

// Fixed view: from -4 to +4 start distances on each side, so every run is drawn at one scale.
const VIEW_SIZE = 480
const WORLD_HALF_EXTENT = 4 * ORBIT_INITIAL_DISTANCE
const PX_PER_UNIT = VIEW_SIZE / 2 / WORLD_HALF_EXTENT
// Fixed real-world playback duration, independent of how much simulated time the trajectory spans (CLAUDE.md §11).
const ANIMATION_DURATION_MS = 2500
const ARROW_PX_PER_FRACTION = 36

const outcomeChoices: Array<{ value: OutcomeChoice; label: string }> = [
  { value: 'falls-in', label: 'Falls into the mass' },
  { value: 'escapes', label: 'Flies away and never returns' },
  { value: 'orbits', label: 'Curves around and comes back' },
]

const OUTCOME_ROW_LABEL: Record<OrbitOutcome, string> = {
  escapes: 'Flies away',
  orbits: 'Orbits',
  'falls-in': 'Falls in',
}
const GUESS_BOX_TEXT: Record<OrbitOutcome, string> = {
  escapes: 'flies away',
  orbits: 'orbits',
  'falls-in': 'falls in',
}

function outcomeLabel(choice: OutcomeChoice): string {
  return outcomeChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

const resultCache = new Map<number, OrbitExperimentResult>()
function resultForPush(fraction: number): OrbitExperimentResult {
  let found = resultCache.get(fraction)
  if (!found) {
    found = runOrbitExperiment(
      ORBIT_GRAVITATIONAL_PARAMETER,
      ORBIT_INITIAL_DISTANCE,
      fraction * circularSpeedFor(ORBIT_GRAVITATIONAL_PARAMETER, ORBIT_INITIAL_DISTANCE)
    )
    resultCache.set(fraction, found)
  }
  return found
}

const push100 = (fraction: number) => Math.round(fraction * 100)
const num = (value: number, digits = 2) => (Number.isFinite(value) ? value.toFixed(digits) : '—')

// ---- the top-view drawing ----
interface DrawnPath {
  id: string
  label: string
  color: string
  points: Array<{ x: number; y: number }>
}

function toView(x: number, y: number): { cx: number; cy: number } {
  return { cx: VIEW_SIZE / 2 + x * PX_PER_UNIT, cy: VIEW_SIZE / 2 - y * PX_PER_UNIT }
}

const isOutside = (p: { x: number; y: number }) => Math.max(Math.abs(p.x), Math.abs(p.y)) > WORLD_HALF_EXTENT

export function OrbitDrawing({
  paths,
  arrow,
  ariaLabel,
}: {
  paths: DrawnPath[]
  arrow: { fraction: number; color: string; label: string } | null
  ariaLabel: string
}) {
  const mass = toView(0, 0)
  const start = toView(ORBIT_INITIAL_DISTANCE, 0)
  const massRadiusPx = COLLISION_RADIUS_FACTOR * ORBIT_INITIAL_DISTANCE * PX_PER_UNIT
  const arrowLength = arrow ? arrow.fraction * ARROW_PX_PER_FRACTION : 0
  return (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      role="img"
      aria-label={ariaLabel}
      style={{ ...svgStyle, width: '100%', maxWidth: `${VIEW_SIZE}px`, margin: '0 auto' }}
    >
      {paths.map((path, index) => {
        const firstOut = path.points.find(isOutside)
        // The path is drawn only while inside the fixed view; the first point beyond it is where "continues beyond the picture" sits.
        const d = path.points
          .slice(0, path.points.findIndex(isOutside) === -1 ? path.points.length : path.points.findIndex(isOutside) + 1)
          .map((p, i) => {
            const v = toView(p.x, p.y)
            return `${i === 0 ? 'M' : 'L'} ${v.cx.toFixed(1)} ${v.cy.toFixed(1)}`
          })
          .join(' ')
        const exit = firstOut ? toView(firstOut.x, firstOut.y) : null
        // A path that stays in view is named at the point of it farthest from the start (the far side of a circle or oval, the
        // mass end of a path that falls in); one that leaves the picture is named at its exit instead.
        const inViewPoints = path.points.filter((p) => !isOutside(p))
        const farthest = inViewPoints.reduce(
          (best, p) => (Math.hypot(p.x - ORBIT_INITIAL_DISTANCE, p.y) > Math.hypot(best.x - ORBIT_INITIAL_DISTANCE, best.y) ? p : best),
          inViewPoints[0]
        )
        const mid = inViewPoints.length > 3 ? toView(farthest.x, farthest.y) : null
        return (
          <g key={path.id}>
            <path d={d} fill="none" stroke={path.color} strokeWidth={2} strokeLinejoin="round" />
            {!exit && mid && (
              <text
                x={mid.cx}
                y={mid.cy - 8 - (index % 3) * 13}
                fontSize="11"
                fill={path.color}
                textAnchor="middle"
                stroke="#0b1020"
                strokeWidth={3}
                paintOrder="stroke"
              >
                {path.label}
              </text>
            )}
            {exit && (
              <text
                x={Math.min(Math.max(exit.cx - 10, 150), VIEW_SIZE - 10)}
                y={Math.min(Math.max(exit.cy, 14), VIEW_SIZE - 8) + (exit.cy < 20 ? 12 + index * 12 : -6 - index * 12)}
                fontSize="10"
                fill={path.color}
                textAnchor="end"
              >
                {path.label}: continues beyond the picture
              </text>
            )}
          </g>
        )
      })}

      {/* the fixed mass, drawn to scale: its radius is the fall-in size */}
      <circle cx={mass.cx} cy={mass.cy} r={massRadiusPx} fill={MASS_COLOR} />
      <text x={mass.cx} y={mass.cy + 20} fontSize="12" fill={MASS_COLOR} textAnchor="middle">
        Fixed mass
      </text>

      {/* the object's start and the push */}
      <circle cx={start.cx} cy={start.cy} r={5} fill="none" stroke={TEXT_COLOR} strokeWidth={1.5} />
      <text x={start.cx + 8} y={start.cy + 20} fontSize="12" fill={TEXT_COLOR} textAnchor="start">
        Object (start)
      </text>
      {arrow && (
        <g>
          <line x1={start.cx} y1={start.cy - 5} x2={start.cx} y2={start.cy - 5 - arrowLength} stroke={arrow.color} strokeWidth={3} />
          <polygon
            points={`${start.cx - 5},${start.cy - 5 - arrowLength + 7} ${start.cx + 5},${start.cy - 5 - arrowLength + 7} ${start.cx},${start.cy - 5 - arrowLength - 3}`}
            fill={arrow.color}
          />
          <text x={start.cx + 9} y={start.cy - 5 - arrowLength / 2} fontSize="10" fill={arrow.color}>
            {arrow.label}
          </text>
        </g>
      )}
    </svg>
  )
}

// ---- the outcome graph ----
const G = { width: 760, height: 360, left: 120, right: 60, top: 84, bottom: 62 }
const PLOT_W = G.width - G.left - G.right
const PLOT_H = G.height - G.top - G.bottom
const ROW_H = PLOT_H / 3
const ROW_ORDER: OrbitOutcome[] = ['escapes', 'orbits', 'falls-in'] // top to bottom
const xForFraction = (fraction: number) => G.left + (fraction / 2) * PLOT_W
const rowCentre = (outcome: OrbitOutcome) => G.top + ROW_ORDER.indexOf(outcome) * ROW_H + ROW_H / 2

interface GraphGuesses {
  weak: OutcomeChoice
  strong: OutcomeChoice
  inBetween: YesNoChoice
}

export function OutcomeGraph({
  partOneRuns,
  complete,
  guesses,
  part2Runs = [],
}: {
  partOneRuns: Array<{ key: Part1Key; fraction: number; outcome: OrbitOutcome }>
  complete: boolean
  guesses: GraphGuesses | null
  part2Runs?: Array<{ fraction: number; outcome: OrbitOutcome }>
}) {
  const edges = pushEdges()
  const marks = guesses ? guessMarkers(guesses.weak, guesses.strong, guesses.inBetween) : null
  const stepPath = [
    `M ${xForFraction(0)} ${rowCentre('falls-in')}`,
    `L ${xForFraction(edges.fallsInBelow)} ${rowCentre('falls-in')}`,
    `L ${xForFraction(edges.fallsInBelow)} ${rowCentre('orbits')}`,
    `L ${xForFraction(edges.escapesFrom)} ${rowCentre('orbits')}`,
    `L ${xForFraction(edges.escapesFrom)} ${rowCentre('escapes')}`,
    `L ${xForFraction(2)} ${rowCentre('escapes')}`,
  ].join(' ')
  const boxY = 6
  const boxHeight = 38
  const weakBox = { x: 98, w: 200 }
  const middleBox = { x: 322, w: 200 }
  const strongBox = { x: 598, w: 158 }
  const markTop = G.top
  return (
    <svg
      viewBox={`0 0 ${G.width} ${G.height}`}
      role="img"
      aria-label="Graph of how each push ended: push strength across, three rows up the side: flies away, orbits and falls in."
      style={{ ...svgStyle, width: '100%', maxWidth: `${G.width}px` }}
    >
      {ROW_ORDER.map((outcome, i) => (
        <g key={outcome}>
          <rect
            x={G.left}
            y={G.top + i * ROW_H}
            width={PLOT_W}
            height={ROW_H}
            fill={i % 2 === 0 ? '#111936' : '#0b1020'}
            stroke="#1e293b"
          />
          <text x={G.left - 10} y={rowCentre(outcome) + 4} fontSize="13" fill={TEXT_COLOR} textAnchor="end">
            {OUTCOME_ROW_LABEL[outcome]}
          </text>
        </g>
      ))}
      <line x1={G.left} y1={G.top + PLOT_H} x2={G.left + PLOT_W} y2={G.top + PLOT_H} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 50, 100, 150, 200].map((tick) => (
        <g key={tick}>
          <line x1={xForFraction(tick / 100)} y1={G.top + PLOT_H} x2={xForFraction(tick / 100)} y2={G.top + PLOT_H + 5} stroke={MUTED_COLOR} />
          <text x={xForFraction(tick / 100)} y={G.top + PLOT_H + 20} fontSize="12" fill={MUTED_COLOR} textAnchor="middle">
            {tick}
          </text>
        </g>
      ))}
      <text x={G.left + PLOT_W / 2} y={G.height - 10} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        Push strength (a fixed scale, 0 to 200)
      </text>
      <text
        x={14}
        y={G.top + PLOT_H / 2}
        fontSize="12"
        fill={TEXT_COLOR}
        textAnchor="middle"
        transform={`rotate(-90 14 ${G.top + PLOT_H / 2})`}
      >
        How the push ended
      </text>

      {complete && (
        <g>
          <path d={stepPath} fill="none" stroke={STEP_COLOR} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
          <text x={xForFraction(edges.fallsInBelow) + 6} y={G.top + 2 * ROW_H + 14} fontSize="11" fill={STEP_COLOR}>
            edge at about {push100(edges.fallsInBelow)}
          </text>
          <text x={xForFraction(edges.escapesFrom) + 6} y={G.top + ROW_H + 14} fontSize="11" fill={STEP_COLOR}>
            edge at about {push100(edges.escapesFrom)}
          </text>
        </g>
      )}
      {!complete && (
        <text x={G.left + PLOT_W / 2} y={G.top + PLOT_H / 2 + 4} fontSize="12" fill={MUTED_COLOR} textAnchor="middle">
          The full line appears after all three pushes have run.
        </text>
      )}

      {partOneRuns.map((run) => (
        <g key={run.key}>
          <circle cx={xForFraction(run.fraction)} cy={rowCentre(run.outcome)} r={7} fill={FIXED_COLOR} />
          <text x={xForFraction(run.fraction)} y={rowCentre(run.outcome) + 22} fontSize="11" fill={FIXED_COLOR} textAnchor="middle">
            push {push100(run.fraction)}
          </text>
        </g>
      ))}
      {part2Runs.map((run, i) => (
        <circle key={i} cx={xForFraction(run.fraction)} cy={rowCentre(run.outcome)} r={8} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      ))}

      {complete && marks && (
        <g>
          {/* weak push: a ring on the row the learner chose, at push strength 20 */}
          <line x1={xForFraction(marks.weak.pushFraction)} y1={boxY + boxHeight} x2={xForFraction(marks.weak.pushFraction)} y2={rowCentre(marks.weak.row) - 12} stroke={GUESS_COLOR} strokeWidth={1.5} />
          <circle cx={xForFraction(marks.weak.pushFraction)} cy={rowCentre(marks.weak.row)} r={11} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
          <GuessBox x={weakBox.x} y={boxY} width={weakBox.w} height={boxHeight} second={GUESS_BOX_TEXT[marks.weak.row]} />
          {/* strong push: a ring on the row the learner chose, at push strength 200 */}
          <line x1={xForFraction(marks.strong.pushFraction)} y1={boxY + boxHeight} x2={xForFraction(marks.strong.pushFraction)} y2={rowCentre(marks.strong.row) - 12} stroke={GUESS_COLOR} strokeWidth={1.5} />
          <circle cx={xForFraction(marks.strong.pushFraction)} cy={rowCentre(marks.strong.row)} r={11} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
          <GuessBox x={strongBox.x} y={boxY} width={strongBox.w} height={boxHeight} second={GUESS_BOX_TEXT[marks.strong.row]} />
          {/* in between: yes or no has no row of its own, so this is only a marker at the middle push */}
          <line x1={xForFraction(marks.inBetween.pushFraction)} y1={boxY + boxHeight} x2={xForFraction(marks.inBetween.pushFraction)} y2={markTop - 8} stroke={GUESS_COLOR} strokeWidth={1.5} />
          <polygon
            points={`${xForFraction(marks.inBetween.pushFraction)},${markTop - 9} ${xForFraction(marks.inBetween.pushFraction) + 8},${markTop} ${xForFraction(marks.inBetween.pushFraction)},${markTop + 9} ${xForFraction(marks.inBetween.pushFraction) - 8},${markTop}`}
            fill="none"
            stroke={GUESS_COLOR}
            strokeWidth={3}
          />
          <GuessBox
            x={middleBox.x}
            y={boxY}
            width={middleBox.w}
            height={boxHeight}
            second={marks.inBetween.choice === 'yes' ? 'yes: something different in between' : 'no: nothing different in between'}
          />
        </g>
      )}
    </svg>
  )
}

// Shown in Part 2 only after all three Part 1 pushes have run, because saying that 100 is the speed of a perfect circle would give
// away the "in between" answer. Every number is this page's own (the mass's pull is 1 and the start distance is 1).
export function PushStrengthExplanation() {
  const circular = circularSpeedFor(ORBIT_GRAVITATIONAL_PARAMETER, ORBIT_INITIAL_DISTANCE)
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What &ldquo;push strength&rdquo; means.</strong> The push gives the object its speed at the very start. To say how strong a
        push is, we need something to measure it against, the way &ldquo;60% of the speed limit&rdquo; only means something once you know
        the limit. Here the yardstick is one particular speed, called the <strong>circular-orbit speed</strong>.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The circular-orbit speed</strong> is the starting speed that makes the object go round the mass in a perfect circle,
        staying exactly the same distance from it all the way round. With this page&rsquo;s numbers (the mass&rsquo;s pull is 1 and the
        starting distance is 1) it works out to {circular}.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Where does that number come from, and does it depend on anything?</strong> Yes, it depends on two things: how strongly the
        mass pulls, and how far away the object starts. It is not chosen by us; it is the one speed that makes a circle, and it can be
        worked out:
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>A circle needs a certain amount of inward pull.</strong> To keep going round in a circle of a given size, something must
          keep turning the object&rsquo;s path inward. The faster the object moves, the more turning a circle of that size needs. (Think of
          swinging a ball round on a string: the faster you swing it, the harder the string has to pull it inward, or the ball flies off
          in a straight line.) The amount needed is the speed times itself, divided by the distance: speed &times; speed &divide; distance.
        </li>
        <li>
          <strong>Gravity provides a certain amount of inward pull.</strong> At a distance from the mass it is the mass&rsquo;s pull divided
          by the distance times itself: pull &divide; (distance &times; distance). Gravity is the &ldquo;string&rdquo; here, and it gets
          weaker the farther away you are.
        </li>
        <li>
          <strong>The circular-orbit speed is the speed where the two amounts are the same:</strong> the object is turned inward by
          exactly as much as a circle of that size needs. Working that through gives speed = the square root of (pull &divide; distance).
          Nothing pushes the object outward and nothing holds it up; it is just falling, and at this speed its fall curves exactly as much
          as a circle does.
        </li>
        <li>
          <strong>With this page&rsquo;s numbers</strong> (pull 1, distance 1): gravity gives 1 &divide; (1 &times; 1) = 1, and the circle
          needs speed &times; speed &divide; 1, so the speed is the square root of 1, which is {circular}.
        </li>
        <li>
          <strong>What would change it.</strong> A stronger pull needs a faster speed: with a pull of 4 at the same distance the
          circular-orbit speed would be {circularSpeedFor(4, 1)} (the square root of 4), twice as fast. A bigger distance needs a slower
          speed, because gravity is weaker out there: at a distance of 4 with a pull of 1 it would be {circularSpeedFor(1, 4)} (the
          square root of 1 &divide; 4). This page keeps the pull and the distance fixed at 1, so on this page the circular-orbit speed is
          always {circular}; these two examples are only to show what it depends on.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Push strength is the push as a percentage of that yardstick.</strong> So:
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li>Push strength 100 is 100% of it: a starting speed of exactly {circular}.</li>
        <li>Push strength 50 is half of it: a starting speed of {circular * 0.5}.</li>
        <li>Push strength 200 is twice it: a starting speed of {circular * 2}.</li>
        <li>
          Push strength 20, Part 1&rsquo;s very weak push, is a fifth of it: a starting speed of {circular * 0.2}. Push strength 60 is
          three fifths of it: {circular * 0.6}.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        The slider moves in steps of 5, from 0 (no push at all, the object just drops toward the mass) to 200. The arrow in the drawing
        grows with the push strength, so a longer arrow is always a stronger push.
      </p>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Why this yardstick?</strong> We could have used the starting speed itself, but that number has no unit here (the page
        uses relative amounts, not metres per second), so 0.6 on its own would mean little. Measuring against the circular-orbit speed
        gives a scale that reads the same whatever mass and distance are used: 100 is always &ldquo;exactly the circle speed&rdquo;. Part 1
        used the same scale without naming it.
      </p>
    </div>
  )
}

function GuessBox({ x, y, width, height, second }: { x: number; y: number; width: number; height: number; second: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={5} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
      <text x={x + width / 2} y={y + 15} fontSize="12" fontWeight="bold" fill={GUESS_COLOR} textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + width / 2} y={y + 30} fontSize="11" fill={GUESS_COLOR} textAnchor="middle">
        {second}
      </text>
    </g>
  )
}

// ---- captions ----
export function Part1Caption({ runsDone }: { runsDone: number }) {
  const weak = pushSummary(PART_ONE_PUSHES.weak)
  const edges = pushEdges()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> There are two pictures. The left one is the drawing and the right one is the graph.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The drawing</strong> is a view from directly above, like looking down at marbles on a table:
      </p>
      <ul style={listStyle}>
        <li>
          The <strong>pale yellow dot</strong> is the fixed mass. Its size is to scale: its radius is {COLLISION_RADIUS_FACTOR} of the
          object&rsquo;s starting distance, the size we gave the mass. A path that comes inside the dot counts as fallen in.
        </li>
        <li>
          The <strong>small ring</strong> is the object at its start, to the right of the mass. The <strong>arrow</strong> at the ring is
          the push, straight up on the screen. A longer arrow is a stronger push.
        </li>
        <li>
          Each <strong>amber line</strong> is the path the object took after one push. Each line is named by its push strength, a plain
          scale from 0 to 200 that is also used on the graph. If a path goes past the edge of the picture it says &ldquo;continues beyond
          the picture&rdquo; and we stop drawing it there.
        </li>
        <li>The view is fixed, so every run is drawn at the same scale and the paths can be compared.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The graph</strong> shows, for each push, how it ended:
      </p>
      <ul style={listStyle}>
        <li>
          Along the bottom is the push strength, from 0 to 200. Up the side are three rows: the bottom row is &ldquo;Falls in&rdquo;, the
          middle row &ldquo;Orbits&rdquo; and the top row &ldquo;Flies away&rdquo;.
        </li>
        <li>
          An <strong>amber dot</strong> is one push you watched, on the row where it ended and at its push strength.
        </li>
        <li>
          After all three pushes have run, a <strong>heavy teal (blue-green) line</strong> shows how every push from 0 to 200 ended, and your{' '}
          <strong>white marks</strong> appear, each in a box labelled YOUR GUESS. The two white rings sit on the row you chose, at push
          strength 20 and 200. The white diamond, for the &ldquo;in between&rdquo; question, is only a marker: a yes or no has no size or
          position of its own, so it sits at the middle of the graph.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> Take the very weak push, push strength 20. The object starts at the right, moving only slowly
        upward. Gravity pulls it toward the mass and it curls in, passing within {num(weak.closestApproach, 2)} of its starting distance
        of the mass (that is 0.2² ÷ (2 − 0.2²) = 0.04 ÷ 1.96), well inside the pale yellow dot, whose radius is {COLLISION_RADIUS_FACTOR}.
        We count that as falling in, and an amber dot appears on the bottom row at 20.
      </p>
      {runsDone >= 1 && (
        <LookFor
          items={[
            {
              look: 'the amber paths in the drawing',
              means: 'each is one push. They all start at the same place, with the same mass pulling, so only the push strength differs between them.',
              matters: 'if only one thing changed and the paths are different, the push strength alone decides what the path does.',
            },
            {
              look: 'the amber dots on the graph',
              means: 'each dot says how one push ended, on a row, at its push strength.',
              matters: 'the graph turns separate pictures into one record, so you can compare the pushes at a glance.',
            },
            ...(runsDone >= 3
              ? [
                  {
                    look: 'the heavy teal (blue-green) line, and where your white marks sit against it',
                    means: `the line shows how every push from 0 to 200 ended, calculated here: it changes row twice, at about ${push100(edges.fallsInBelow)} and about ${push100(edges.escapesFrom)}. Your white marks are your guesses, drawn there to compare.`,
                    matters: 'it shows the outcome as a function of one number, so you see not just what happened at three pushes but across all of them.',
                  },
                ]
              : []),
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function Part2Caption() {
  const sixty = pushSummary(0.6)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong> There are two pictures. The left one is the drawing and the right one is the graph.
        Both show your own pushes, in pink, beside the three pushes you watched in Part 1.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The drawing</strong> is a view from directly above, like looking down at marbles on a table:
      </p>
      <ul style={listStyle}>
        <li>
          The <strong>pale yellow dot</strong> is the fixed mass, drawn to scale: its radius is {COLLISION_RADIUS_FACTOR} of the object&rsquo;s
          starting distance. A path that comes inside the dot counts as fallen in. The <strong>small ring</strong> to its right is the
          object at its start.
        </li>
        <li>
          The <strong>pink arrow</strong> at the ring is your push, straight up on the screen. A longer arrow is a stronger push, so the
          arrow follows the slider.
        </li>
        <li>
          The <strong>pink line</strong> is the path the object took after your push. If it goes past the edge of the picture it says
          &ldquo;continues beyond the picture&rdquo; and we stop drawing it there.
        </li>
        <li>
          The <strong>grey lines</strong> are the paths of the three pushes from Part 1, kept so you can compare them with your own. Each
          is named by its push strength.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The graph</strong> shows, for each push, how it ended:
      </p>
      <ul style={listStyle}>
        <li>
          Along the bottom is the push strength, from 0 to 200. Up the side are three rows: the bottom row is &ldquo;Falls in&rdquo;, the
          middle row &ldquo;Orbits&rdquo; and the top row &ldquo;Flies away&rdquo;.
        </li>
        <li>
          The <strong>heavy teal (blue-green) line</strong> shows how every push from 0 to 200 ended, whether or not you tried it. We
          calculated it by running the whole range. Where the line runs along the bottom row, pushes of that strength fall in. Along the
          middle row, they orbit. Along the top row, they fly away. The line steps up a row at two places, labelled &ldquo;edge at about
          43&rdquo; and &ldquo;edge at about 141&rdquo;: those are the push strengths where the outcome changes.
        </li>
        <li>
          The <strong>amber dots</strong> are the three pushes you watched in Part 1, and the <strong>pink dots</strong> are the pushes
          you have tried here. Each sits on the row where that push ended, at its push strength.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> Take push strength 60 (not one of Part 1&rsquo;s). The object starts moving at 60 of the way to the
        speed that would give a perfect circle. It is pulled toward the mass, and its closest approach is 0.6² ÷ (2 − 0.6²) = 0.36 ÷
        1.64 = {num(sixty.closestApproach, 2)} of its starting distance. That is outside the pale yellow dot (radius {COLLISION_RADIUS_FACTOR}), so it does not fall in. It swings
        back out to its starting distance and goes round again: a closed oval. A pink dot appears on the middle row, at 60.
      </p>
      <LookFor
        items={[
          {
            look: 'your pink dot, against the heavy teal (blue-green) line',
            means: 'the row your dot is on is how your push ended, and the line shows how every push ended. The line changes row at about 43 and about 141, so a push below 43 sits on the bottom row, one between them on the middle row and one above 141 on the top row.',
            matters: 'moving the slider moves the dot along the line, so you can find the two edges for yourself.',
          },
          {
            look: 'your pink path, against the grey paths',
            means: 'a path that stays near the start looks like Part 1’s middle push; one that curls into the pale yellow dot is a fall-in; one that leaves the picture is flying away.',
            matters: 'it lets you see, one push at a time, what the graph’s three rows look like as paths.',
          },
          {
            look: '“Runs so far”, under the drawing',
            means: 'it lists each push you tried, how it ended and its closest approach to the mass.',
            matters: 'comparing closest approach with 0.1, the radius of the dot, shows why one push falls in and another does not.',
          },
        ]}
      />
    </CaptionBox>
  )
}

// ---- the words box (formulas are held back until all three Part 1 pushes have run, because they give the answers away) ----
function referenceEntries(allRun: boolean): { term: string; meaning: string }[] {
  const edges = pushEdges()
  const entries: { term: string; meaning: string }[] = [
    {
      term: 'Orbit',
      meaning: 'a path in which something keeps going round a mass instead of hitting it or leaving. It does not have to be a circle.',
    },
    {
      term: 'Push strength',
      meaning: 'how strong the one push at the start is. Bigger means the object is moving faster when it starts.',
    },
    {
      term: 'Falls in',
      meaning: `the object comes closer to the mass than ${COLLISION_RADIUS_FACTOR} of its starting distance (our chosen size, standing in for the mass’s surface).`,
    },
    {
      term: 'Pull (of the mass)',
      meaning: 'how strongly the mass attracts the object. A heavier mass has a bigger pull. Here it is a relative number, set to 1, not kilograms. Think of it as the mass’s value on this page.',
    },
    { term: 'Flies away', meaning: 'the object keeps moving away from the mass and never comes back.' },
    { term: 'Collision size', meaning: `the ${COLLISION_RADIUS_FACTOR} of the starting distance used for “falls in”. It is the radius of the pale yellow dot.` },
    {
      term: 'Relative units',
      meaning: 'distances and speeds here have no metres or kilometres: the starting distance is 1 and the mass’s pull is 1.',
    },
    { term: 'Top view', meaning: 'looking straight down on the paths, like looking down at marbles on a table.' },
    { term: 'Path', meaning: 'the line the object traces as it moves.' },
    {
      term: 'Closest approach',
      meaning: 'the nearest the object gets to the mass during a run, as a fraction of its starting distance (0.5 means half of it).',
    },
  ]
  if (allRun) {
    const a = pushSummary(0.2)
    const b = pushSummary(0.45)
    entries.push(
      {
        term: 'Circular-orbit speed',
        meaning: 'the starting speed that makes a perfect circle round the mass. It depends on the mass’s pull and on the starting distance (square root of pull ÷ distance), and Part 2 explains how. Push strength 100 means exactly this speed.',
      },
      { term: 'Escape speed', meaning: 'the starting speed above which the object never comes back.' },
      {
        term: 'Formula: circular-orbit speed',
        meaning: 'the square root of (the mass’s pull ÷ the distance). With this page’s numbers: the square root of (1 ÷ 1) = 1.',
      },
      {
        term: 'Formula: escape speed',
        meaning: `the square root of 2 × the circular-orbit speed. With this page’s numbers: 1.414 × 1 = 1.414, which is push strength ${push100(edges.escapesFrom)} to the nearest whole number.`,
      },
      {
        term: 'Formula: closest approach (for a push f below 1)',
        meaning: `f² ÷ (2 − f²) of the start distance. At f = 0.2: 0.04 ÷ 1.96 = ${num(a.closestApproach, 3)}. At f = 0.45: 0.2025 ÷ 1.7975 = ${num(b.closestApproach, 3)}.`,
      },
      {
        term: 'Formula: where “falls in” begins',
        meaning: `the push at which that closest approach equals ${COLLISION_RADIUS_FACTOR}. At f = 0.426: 0.1815 ÷ 1.8185 = 0.0998, so about 0.43, push strength ${push100(edges.fallsInBelow)}.`,
      },
      { term: 'A % sign', meaning: 'where a number is shown with a % sign, it is a percentage of the circular-orbit speed.' }
    )
  } else {
    entries.push({
      term: 'Circular-orbit speed, escape speed and the formulas',
      meaning: 'they appear here after you have run all three pushes in Part 1, because they would give away what the pushes do.',
    })
  }
  return entries
}

const START_NOTE =
  'Links to NASA and ESA pages on orbits are at the bottom of this page. They appear after the tutor, because they would give away the answers to your guesses.'

const AFTER_LINKS = [
  {
    href: 'https://science.nasa.gov/learn/basics-of-space-flight/chapter3-4/',
    label: 'NASA: "Chapter 3: Gravity & Mechanics" (Basics of Space Flight)',
    what: 'Isaac Newton’s cannonball, drawn as three cartoons: a gentle shot lands close, a harder shot lands farther, and a hard enough shot never lands because it falls all the way round the Earth. It says a spacecraft in orbit is "just falling". (NASA, Basics of Space Flight; page dated 16 January 2025.)',
  },
  {
    href: 'https://www.esa.int/Enabling_Support/Space_Transportation/Types_of_orbits',
    label: 'ESA: "Types of orbits"',
    what: 'a tower and a thrown ball: a weak throw lands, a very powerful throw makes the ground curve away before the ball reaches it. It also explains "eccentricity", how round or squashed an orbit is. A long page with some jargon: read the "Reaching orbit" part first. (European Space Agency; marked archive content, 30 March 2020, and updated since.)',
  },
]

function ChoiceButtons<T extends string>({
  options,
  selected,
  disabled,
  onSelect,
}: {
  options: Array<{ value: T; label: string }>
  selected: T | null
  disabled: boolean
  onSelect: (value: T) => void
}) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {options.map((choice) => (
        <button
          key={choice.value}
          onClick={() => onSelect(choice.value)}
          disabled={disabled}
          className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
          style={{
            marginRight: '0.5rem',
            marginBottom: '0.5rem',
            padding: '0.5rem 1rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
}

function Question({
  prompt,
  guessText,
  children,
}: {
  prompt: string
  guessText: string | null
  children: ReactNode
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      {children}
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {guessText ? `Your guess: ${guessText}` : 'Choose an option to continue'}
      </p>
    </div>
  )
}

interface ActiveRun {
  kind: 'part1' | 'part2'
  key?: Part1Key
  fraction: number
  result: OrbitExperimentResult
}

export function OrbitExperiment({ onComplete, onTutorComplete }: OrbitExperimentProps) {
  const [slowPrediction, setSlowPrediction] = useState<OutcomeChoice | null>(null)
  const [fastPrediction, setFastPrediction] = useState<OutcomeChoice | null>(null)
  const [inBetweenPrediction, setInBetweenPrediction] = useState<YesNoChoice | null>(null)
  const [submitted, setSubmitted] = useState<GraphGuesses | null>(null)

  const [selectedPush, setSelectedPush] = useState<Part1Key>('weak')
  const [part1Done, setPart1Done] = useState<Part1Key[]>([])
  const [part2Fractions, setPart2Fractions] = useState<number[]>([])
  const [sliderFraction, setSliderFraction] = useState(0.5)
  const [active, setActive] = useState<ActiveRun | null>(null)
  const [visibleCount, setVisibleCount] = useState(1)
  const [status, setStatus] = useState<RunStatus>('idle')
  const [explained, setExplained] = useState(false)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const isRunning = status === 'running'
  const allThree = part1Done.length === 3
  const firstDone = part1Done.length >= 1
  const hasAllGuesses = slowPrediction !== null && fastPrediction !== null && inBetweenPrediction !== null
  const locked = submitted !== null
  const shownSlow = submitted?.weak ?? slowPrediction
  const shownFast = submitted?.strong ?? fastPrediction
  const shownInBetween = submitted?.inBetween ?? inBetweenPrediction

  // One animation per run: the fixed real duration does not depend on how much simulated time the path covers (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running' || !active) return
    const totalPoints = active.result.trajectory.length
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const progress = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setVisibleCount(Math.max(1, Math.round(progress * (totalPoints - 1)) + 1))
      if (progress >= 1) {
        setStatus('complete')
        if (active.kind === 'part1' && active.key) {
          const key = active.key
          setPart1Done((done) => {
            const next = done.includes(key) ? done : [...done, key]
            const nextUnrun = PART1_KEYS.find((k) => !next.includes(k))
            if (nextUnrun) setSelectedPush(nextUnrun)
            return next
          })
        } else {
          setPart2Fractions((list) => [...list, active.fraction])
        }
        onCompleteRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, active])

  const handleRunPart1 = () => {
    if (!hasAllGuesses || isRunning || part1Done.includes(selectedPush)) return
    if (!submitted) {
      setSubmitted({ weak: slowPrediction!, strong: fastPrediction!, inBetween: inBetweenPrediction! })
    }
    const fraction = PART_ONE_PUSHES[selectedPush]
    setActive({ kind: 'part1', key: selectedPush, fraction, result: resultForPush(fraction) })
    setVisibleCount(1)
    setStatus('running')
  }

  const handleRunPart2 = () => {
    if (isRunning) return
    setActive({ kind: 'part2', fraction: sliderFraction, result: resultForPush(sliderFraction) })
    setVisibleCount(1)
    setStatus('running')
  }

  // Start over: clears the guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    setSlowPrediction(null)
    setFastPrediction(null)
    setInBetweenPrediction(null)
    setSubmitted(null)
    setSelectedPush('weak')
    setPart1Done([])
    setPart2Fractions([])
    setSliderFraction(0.5)
    setActive(null)
    setVisibleCount(1)
    setStatus('idle')
    setExplained(false)
  }

  const hasAnythingToClear = slowPrediction !== null || fastPrediction !== null || inBetweenPrediction !== null || locked || part1Done.length > 0 || part2Fractions.length > 0
  const startOverDisabled = !hasAnythingToClear || isRunning

  const slice = (run: ActiveRun | null) => (run ? run.result.trajectory.slice(0, visibleCount) : [])
  const activePart1 = active && active.kind === 'part1' && isRunning ? active : null
  const activePart2 = active && active.kind === 'part2' && isRunning ? active : null

  // Part 1's drawing: one amber path per finished push, plus the one being drawn.
  const part1Paths: DrawnPath[] = [
    ...part1Done.map((key) => ({
      id: `p1-${key}`,
      label: `push ${push100(PART_ONE_PUSHES[key])}`,
      color: FIXED_COLOR,
      points: resultForPush(PART_ONE_PUSHES[key]).trajectory,
    })),
    ...(activePart1 && activePart1.key && !part1Done.includes(activePart1.key)
      ? [
          {
            id: `p1-${activePart1.key}`,
            label: `push ${push100(activePart1.fraction)}`,
            color: FIXED_COLOR,
            points: slice(activePart1),
          },
        ]
      : []),
  ]

  const lastPart2Fraction = part2Fractions.length > 0 ? part2Fractions[part2Fractions.length - 1] : null
  const part2Paths: DrawnPath[] = [
    ...part1Done.map((key) => ({
      id: `g-${key}`,
      label: `push ${push100(PART_ONE_PUSHES[key])} (Part 1)`,
      color: REFERENCE_COLOR,
      points: resultForPush(PART_ONE_PUSHES[key]).trajectory,
    })),
    ...(activePart2
      ? [{ id: 'p2-active', label: `your push ${push100(activePart2.fraction)}`, color: YOURS_COLOR, points: slice(activePart2) }]
      : lastPart2Fraction !== null
        ? [
            {
              id: 'p2-last',
              label: `your push ${push100(lastPart2Fraction)}`,
              color: YOURS_COLOR,
              points: resultForPush(lastPart2Fraction).trajectory,
            },
          ]
        : []),
  ]

  const graphPart1Runs = part1Done.map((key) => ({
    key,
    fraction: PART_ONE_PUSHES[key],
    outcome: resultForPush(PART_ONE_PUSHES[key]).outcome,
  }))
  const graphPart2Runs = part2Fractions.map((fraction) => ({ fraction, outcome: resultForPush(fraction).outcome }))

  const check = useMemo(() => (allThree ? edgeCheck() : null), [allThree])
  const edges = pushEdges()
  const sliderLabel = allThree
    ? `Push strength: ${push100(sliderFraction)}% of circular-orbit speed`
    : `Push strength: ${push100(sliderFraction)}`

  const guessTagFor = (key: Part1Key): string | null => {
    if (!submitted) return null
    if (key === 'weak') return `your guess: ${outcomeLabel(submitted.weak)}`
    if (key === 'strong') return `your guess: ${outcomeLabel(submitted.strong)}`
    return `your guess: ${submitted.inBetween === 'yes' ? 'yes, something different happens in between' : 'no, nothing different happens in between'}`
  }

  const rowOutcomeText = (outcome: OrbitOutcome) =>
    outcome === 'falls-in' ? 'falls in' : outcome === 'escapes' ? 'flies away' : 'orbits'

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 6 — Why Do Planets Orbit Instead of Falling In?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Why do planets go around the Sun instead of falling straight into it, or flying off into space?
          </p>
          <p style={paragraph}>
            <strong>Why even ask this.</strong> It&rsquo;s easy to think of an orbit as some special, different kind of motion from just
            &ldquo;falling&rdquo; &mdash; planets seem to glide around forever, while a dropped ball simply falls straight down and stops.
            This experiment asks whether that apparent difference is real, or whether an orbit might just be a particular kind of falling,
            seen from the right angle.
          </p>
          <p style={paragraph}>
            <strong>How this page is laid out.</strong> Below this introduction the page is in four sections, called Parts, each with a
            coloured heading. In Part 1 you make guesses and watch three pushes. In Part 2 you try a push of your own. Part 3 shows the
            results, and Part 4 is the tutor, who talks it over with you.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> You&rsquo;ll watch this from directly above, like looking down at two marbles on a table. A small
            object starts to the right of a fixed mass, and you give it a single push, straight up on the screen, at the very start. After
            that, gravity is the only thing acting on it, constantly pulling it back toward the mass on the left. In Part 1 you watch three
            pushes: a very weak one, a very strong one, and one in between. A graph beside the drawing records how each push ended. In Part
            2 you choose the strength of the push yourself.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press Run, guess what a very weak push will do, what a very strong push will do, and
            whether anything different happens in between. Then watch the three pushes, try pushes of your own in Part 2, and talk it over
            with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or the numbers: they come from
            a calculation that knows nothing about what you guessed. Your guesses are drawn on the graph in white, each in a box labelled
            YOUR GUESS, and they are shown again beside the results. In Part 2 the push strength you choose does change the drawing, and
            what it changes is drawn in pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one with a short plain meaning: orbit,
            push strength, falls in, flies away, collision size, relative units, top view, path, closest approach. Two more, circular-orbit
            speed and escape speed, are added to it after you have run all three pushes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              This uses ordinary gravity (the same rule used to predict real satellites and planets), not the exact general relativity from
              Experiment 4 (curved spacetime), a simplification also used in Experiments 2, 3 and 5 of this chapter.
            </li>
            <li>The central mass doesn&rsquo;t move; only the small object does.</li>
            <li>
              The push always points the same way &mdash; straight up on the screen. Only how strong it is changes; its direction never
              does.
            </li>
            <li>There&rsquo;s no friction, no air resistance, and no other mass nearby &mdash; just this one mass and the object.</li>
            <li>
              The mass and distance here are relative, made-up amounts, not real kilograms or metres. The mass&rsquo;s{' '}
              <strong>pull</strong> (how strongly it attracts the object; a heavier mass would pull harder) is set to 1, and the
              object&rsquo;s starting distance from it is set to 1.
            </li>
            <li>Nothing here moves anywhere close to the speed of light.</li>
            <li>
              The object counts as having &ldquo;fallen in&rdquo; if it comes closer to the mass than one tenth of its starting distance. That
              size is the width of the mass, drawn to scale as the pale yellow dot in the drawing. It is our choice, standing in for
              the surface of the mass (here &ldquo;size&rdquo; means how wide, not how heavy). A different size would move one of the
              boundaries you will see later.
            </li>
            <li>
              Each run follows the object for a fixed length of time, about eight times the time a perfect circle would take. If it is still
              going round by then, we call that orbiting.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(allThree)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0 }}>
            <strong>Want to know more?</strong> {START_NOTE} This page uses no measured result, so there is no research paper to cite for it.
          </p>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make three guesses about three pushes: a very weak one, a very strong one, and whether anything different happens in
          between. Then you will watch each push and see how it ended.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="If the starting push is very weak, what do you think happens?"
            guessText={shownSlow ? outcomeLabel(shownSlow) : null}
          >
            <ChoiceButtons options={outcomeChoices} selected={shownSlow} disabled={locked || isRunning} onSelect={setSlowPrediction} />
          </Question>
          <Question
            prompt="If the starting push is very strong instead, which of those three do you expect?"
            guessText={shownFast ? outcomeLabel(shownFast) : null}
          >
            <ChoiceButtons options={outcomeChoices} selected={shownFast} disabled={locked || isRunning} onSelect={setFastPrediction} />
          </Question>
          <Question
            prompt="Is there a push strength in between where something different happens?"
            guessText={shownInBetween ? (shownInBetween === 'yes' ? 'Yes' : 'No') : null}
          >
            <ChoiceButtons
              options={[
                { value: 'yes' as YesNoChoice, label: 'Yes' },
                { value: 'no' as YesNoChoice, label: 'No' },
              ]}
              selected={shownInBetween}
              disabled={locked || isRunning}
              onSelect={setInBetweenPrediction}
            />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your guesses are locked while you try other pushes. To change them, press Start over.
            </p>
          )}
        </div>

        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Choose a push to watch</p>
        <ChoiceButtons
          options={PART1_KEYS.map((key) => ({ value: key, label: PART1_BUTTONS[key] + (part1Done.includes(key) ? ' ✓' : '') }))}
          selected={selectedPush}
          disabled={isRunning}
          onSelect={setSelectedPush}
        />
        <button
          type="button"
          className="action-button"
          onClick={handleRunPart1}
          disabled={!hasAllGuesses || isRunning || part1Done.includes(selectedPush) || allThree}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {activePart1 ? 'Running...' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{
            marginLeft: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            cursor: startOverDisabled ? 'not-allowed' : 'pointer',
            opacity: startOverDisabled ? 0.5 : 1,
          }}
        >
          Start over
        </button>
        {!hasAllGuesses && !locked && <p style={smallNote}>Answer all three questions above to run the pushes.</p>}
        <p style={smallNote}>Pushes watched: {part1Done.length} of 3.</p>

        <Block>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 320px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The drawing (view from above)</p>
              <OrbitDrawing
                paths={part1Paths}
                arrow={{ fraction: PART_ONE_PUSHES[activePart1?.key ?? selectedPush], color: FIXED_COLOR, label: 'Push (straight up)' }}
                ariaLabel="A view from above: a fixed mass at the centre, the object at its start to the right, an arrow for the push, and the path of each push."
              />
            </div>
            <div style={{ flex: '2 1 420px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>How each push ended</p>
              <OutcomeGraph partOneRuns={graphPart1Runs} complete={allThree} guesses={submitted} />
            </div>
          </div>
        </Block>

        {firstDone ? (
          <Block>
            <WhereFrom>
              <strong>Calculated here:</strong> every path and every outcome. The computer steps ordinary gravity forward in very small time
              steps and checks, at each step, how close the object has come to the mass and whether it is moving away for good.{' '}
              <strong>Measured:</strong> nothing; no real planet or satellite was measured for this picture. <strong>Imagined for the
              question:</strong> the mass, the start distance and the push, all in relative units; and the size we gave the mass ({COLLISION_RADIUS_FACTOR} of
              the start distance), which decides where &ldquo;falls in&rdquo; begins. Each run follows the object for about eight times the
              time a perfect circle would take. White is only ever your guess.
            </WhereFrom>
            <Part1Caption runsDone={part1Done.length} />
          </Block>
        ) : (
          <p style={smallNote}>
            After you press Run, the path of the push draws itself in the drawing and a dot appears on the graph. Run all three pushes to see
            the full picture.
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {firstDone && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              You will choose the strength of the push yourself and watch where it goes. The path you make is drawn in pink, and Part 1&rsquo;s
              paths stay in grey so you can compare.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="orbit-speed" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {sliderLabel}
              </label>
              <input
                id="orbit-speed"
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={sliderFraction}
                disabled={isRunning}
                onChange={(event) => setSliderFraction(Number(event.target.value))}
                style={{ width: '100%' }}
              />
              {allThree ? (
                <PushStrengthExplanation />
              ) : (
                <p style={{ ...smallNote, fontSize: '0.875rem' }}>
                  Run the other pushes in Part 1 to see what this scale means. Until then, move the slider and press &ldquo;Push with my
                  strength&rdquo; to see where a push of your own goes.
                </p>
              )}
              <p style={smallNote}>Your guesses do not change the drawing or the graph. This slider does.</p>
              <button
                type="button"
                className="action-button"
                onClick={handleRunPart2}
                disabled={isRunning}
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {activePart2 ? 'Running...' : 'Push with my strength'}
              </button>
            </div>

            <Block>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 320px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The drawing, with your push</p>
                  <OrbitDrawing
                    paths={part2Paths}
                    arrow={{ fraction: activePart2 ? activePart2.fraction : sliderFraction, color: YOURS_COLOR, label: 'Your push' }}
                    ariaLabel="The same view from above, with Part 1's paths in grey and your own push in pink."
                  />
                </div>
                <div style={{ flex: '2 1 420px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>How each push ended</p>
                  <OutcomeGraph partOneRuns={graphPart1Runs} complete={allThree} guesses={null} part2Runs={graphPart2Runs} />
                </div>
              </div>
            </Block>

            {part2Fractions.length > 0 && !activePart2 ? (
              <Block>
                <WhereFrom>
                  <strong>Calculated here:</strong> every path and every outcome, from the same stepping of ordinary gravity as in Part 1, for
                  the push you chose. <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the mass, the start distance
                  and the push, all in relative units, and the size we gave the mass ({COLLISION_RADIUS_FACTOR} of the start distance). The grey lines are Part 1&rsquo;s
                  calculation, kept for comparison.
                </WhereFrom>
                <Part2Caption />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Fractions.map((fraction, i) => {
                    const s = pushSummary(fraction)
                    return (
                      <li key={i}>
                        Push {push100(fraction)}: {rowOutcomeText(s.outcome)}; closest approach {num(s.closestApproach, 2)} of the start distance
                        {Number.isFinite(s.farthestPoint) ? `; farthest point ${num(s.farthestPoint, 2)} times the start distance` : ''}
                      </li>
                    )
                  })}
                </ul>
              </Block>
            ) : (
              <p style={smallNote}>
                Not run yet. Choose a push strength and press &ldquo;Push with my strength&rdquo;; your path will be drawn here in pink and a
                pink dot will appear on the graph.
              </p>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {firstDone && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers behind the pushes you watched in Part 1, with your guesses marked beside them. The table and the check-up do
              not change with your guesses or with the push you choose in Part 2.
            </PartHeader>

            <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Table 1: the pushes you watched</p>
              <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem', width: '100%' }}>
                <thead>
                  <tr>
                    {['Push strength', 'Closest approach to the mass (fraction of the start distance)', 'How it ended', 'Your guess'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color, #ccc)', padding: '0.4rem 0.6rem' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...PART1_KEYS].sort((a, b) => PART_ONE_PUSHES[a] - PART_ONE_PUSHES[b]).map((key) => {
                    const done = part1Done.includes(key)
                    const summary = pushSummary(PART_ONE_PUSHES[key])
                    return (
                      <tr key={key}>
                        <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color, #ccc)' }}>
                          {push100(PART_ONE_PUSHES[key])}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color, #ccc)' }}>
                          {done ? num(summary.closestApproach, 3) : 'not run yet'}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color, #ccc)' }}>
                          {done ? rowOutcomeText(summary.outcome) : 'not run yet'}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color, #ccc)' }}>
                          {guessTagFor(key) && (
                            <>
                              <GuessTag />
                              <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {guessTagFor(key)!.replace('your guess: ', '')}
                              </span>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p style={smallNote}>
              For a push that does not come back (200), the closest approach is the starting distance, 1, because the start is the nearest
              point. Where a guess is shown, it is the guess only; it is marked by the tutor, not here.
            </p>
            {!allThree && (
              <p style={smallNote}>Run all three pushes in Part 1 to fill in the table and to see the check-up below.</p>
            )}

            {allThree && check && (
              <>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.25rem' }}>
                  Table 2, check-up: the formula against the step-by-step calculation
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem', width: '100%' }}>
                    <thead>
                      <tr>
                        {['Question', 'The formula says', 'The step-by-step calculation found', 'Reading'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color, #ccc)', padding: '0.4rem 0.6rem' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={cell}>At what push strength does the object stop coming back?</td>
                        <td style={cell}>{num(edges.escapesFrom * 100, 1)}</td>
                        <td style={cell}>
                          between {push100(check.escape.lastBefore)} (still orbits) and {push100(check.escape.firstAfter)} (flies away)
                        </td>
                        <td style={cell}>the same: the formula&rsquo;s number is between the two</td>
                      </tr>
                      <tr>
                        <td style={cell}>What does a push of exactly 100 do to the distance?</td>
                        <td style={cell}>stays at 1</td>
                        <td style={cell}>
                          closest {num(check.circle.closest, 2)} and farthest {num(check.circle.farthest, 2)}
                        </td>
                        <td style={cell}>the same</td>
                      </tr>
                      <tr>
                        <td style={cell}>Where does &ldquo;falls in&rdquo; begin, with a collision size of {COLLISION_RADIUS_FACTOR}?</td>
                        <td style={cell}>{num(edges.fallsInBelow * 100, 1)}</td>
                        <td style={cell}>
                          between {push100(check.fallsIn.lastBefore)} (falls in) and {push100(check.fallsIn.firstAfter)} (orbits)
                        </td>
                        <td style={cell}>the same, but the {COLLISION_RADIUS_FACTOR} is our choice</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                  <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                    <strong>What this table tells us.</strong>
                  </p>
                  <ul style={{ marginTop: 0, paddingLeft: '1.25rem' }}>
                    <li>
                      <strong>The first row.</strong> <em>What it is:</em> two ways of finding the same boundary. One is a formula, the escape
                      speed: the square root of 2 times the circular-orbit speed, which is 1.414 times it. The other is the step-by-step
                      calculation the page actually runs, tried at {push100(check.escape.lastBefore)} and {push100(check.escape.firstAfter)}.{' '}
                      <em>What it means:</em> the formula puts the boundary at {num(edges.escapesFrom * 100, 1)}, and the calculation finds it
                      between {push100(check.escape.lastBefore)} and {push100(check.escape.firstAfter)}, so they agree. <em>Why it matters:</em>{' '}
                      the pictures come from the calculation, so agreeing with an independent formula is a check that the calculation is not
                      making the boundary up.
                    </li>
                    <li>
                      <strong>The second row.</strong> <em>What it is:</em> the speed that makes a perfect circle. <em>What it means:</em> at
                      100 the object stays at the same distance, 1, all the way round. <em>Why it matters:</em> a circle is the simplest
                      orbit, and it is a check that the stepping does not make the path drift in or out by itself.
                    </li>
                    <li>
                      <strong>The third row.</strong> <em>What it is:</em> the edge between falling in and orbiting. <em>What it means:</em> it
                      depends on the size we gave the mass ({COLLISION_RADIUS_FACTOR} of the start distance). With a different size the edge
                      would move. At 0.2 of the start distance it would be at push {push100(pushEdgeForCollisionSize(0.2))}; at 0.05, at push{' '}
                      {push100(pushEdgeForCollisionSize(0.05))}. <em>Why it matters:</em> unlike the first two rows, this boundary is not a
                      fact about gravity alone but about how close counts as &ldquo;in&rdquo;.
                    </li>
                    <li>
                      <strong>How sure is it?</strong> The formula numbers are exact. The stepping numbers are found by trying whole numbers,
                      so they are only as fine as the whole numbers tried.
                    </li>
                  </ul>
                </div>
              </>
            )}

            {lastPart2Fraction !== null && (
              <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Your own push in Part 2 (this line changes with your slider)</p>
                <p style={{ margin: 0 }}>
                  Push {push100(lastPart2Fraction)}: {rowOutcomeText(pushSummary(lastPart2Fraction).outcome)}; closest approach{' '}
                  {num(pushSummary(lastPart2Fraction).closestApproach, 2)} of the start distance
                  {Number.isFinite(farthestPointFraction(lastPart2Fraction))
                    ? `; farthest point ${num(farthestPointFraction(lastPart2Fraction), 2)} times the start distance`
                    : ''}
                  .
                </p>
              </div>
            )}
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here by stepping ordinary gravity forward, with the formulas in the words
              box; not measured.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {firstDone && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your three white marks on the graph, then explains.
            </PartHeader>
            {allThree && submitted ? (
              <>
                <OrbitTutor
                  slowPrediction={submitted.weak}
                  fastPrediction={submitted.strong}
                  inBetweenPrediction={submitted.inBetween}
                  onExplained={() => {
                    setExplained(true)
                    onTutorComplete?.()
                  }}
                />
                {explained && (
                  <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                      <strong>More to read, now that you have the explanation.</strong> These pages show an orbit as falling, which the
                      tutor says first, so they were held back until now. Checked on 12 November 2026. Each link opens in a new tab.
                    </p>
                    <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
                      {AFTER_LINKS.map((link) => (
                        <li key={link.href}>
                          <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p style={smallNote}>
                The tutor starts when all three pushes in Part 1 have run, because its questions are about all three paths and your three
                guesses. Pushes watched: {part1Done.length} of 3.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const cell = { padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color, #ccc)', verticalAlign: 'top' } as const
