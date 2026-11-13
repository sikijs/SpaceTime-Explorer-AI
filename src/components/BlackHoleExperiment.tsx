import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  escapeSpeedSweep,
  evaluateBlackHole,
  guessMarkers,
  LAUNCH_DISTANCE,
  launchSummary,
  MASS_MAX,
  MASS_MIN,
  PART_ONE_MASSES,
  partOneOutcomes,
  runRadialLightSpeedLaunch,
  specialMass,
} from '../physics/blackHoleExperiment'
import type { RadialLaunchResult, SpeedCompareChoice, YesNo } from '../physics/blackHoleExperiment'
import { BlackHoleFieldGuide } from './BlackHoleFieldGuide'
import { BlackHoleIntro } from './BlackHoleIntro'
import { Part3Results } from './BlackHoleResults'
import { BlackHoleTutor } from './BlackHoleTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { Block, CaptionBox, LookFor, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 7, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/07-draft-wording.md,
// approved by the owner on 2026-11-13). This is Step 4a: the introduction, the words box, and Part 1 (the guesses, three launches
// with one Run, the labelled top view, the new graph of escape speed against mass with white guess marks, and the caption). Parts 2
// to 4 and the field guide are built in the next steps.

interface BlackHoleExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type Part1Key = 'light' | 'heavy' | 'sweep'
const PART1_KEYS: Part1Key[] = ['light', 'heavy', 'sweep']
const PART1_BUTTONS: Record<Part1Key, string> = {
  light: 'A very light mass (0.2)',
  heavy: 'A very heavy mass (6)',
  sweep: 'A mass in between: raised slowly from 0.2 to 6',
}

const speedCompareChoices: Array<{ value: SpeedCompareChoice; label: string }> = [
  { value: 'much-slower', label: 'Much slower than light' },
  { value: 'faster', label: 'Faster than light' },
  { value: 'cannot-escape', label: 'Nothing can escape at all' },
]

function speedCompareLabel(choice: SpeedCompareChoice): string {
  return speedCompareChoices.find((c) => c.value === choice)!.label
}

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const FIXED_COLOR = '#f59e0b' // amber: Part 1's real launches, the fixed reference
const MASS_COLOR = '#fef08a' // pale yellow: the central mass
const HORIZON_COLOR = '#c4b5fd' // pale violet: the event horizon
const LAUNCH_COLOR = '#9ca3af' // grey: the launch point

const VIEW_SIZE = 400
const WORLD_HALF_EXTENT = 4 * LAUNCH_DISTANCE
const PX_PER_UNIT = VIEW_SIZE / 2 / WORLD_HALF_EXTENT
const ANIMATION_DURATION_MS = 2500
const SWEEP_DURATION_MS = 4500

const percent = (fraction: number) => Math.round(fraction * 100)

function distanceToX(distance: number): number {
  return VIEW_SIZE / 2 + distance * PX_PER_UNIT
}

// ---- the top-view drawing ----
export function LaunchDrawing({
  mass,
  trajectory,
  showHorizon,
}: {
  mass: number | null
  trajectory: Array<{ distance: number }>
  showHorizon: boolean
}) {
  const cy = VIEW_SIZE / 2
  const cx = VIEW_SIZE / 2
  const last = trajectory.length > 0 ? trajectory[trajectory.length - 1] : null
  const farthest = trajectory.reduce((m, p) => Math.max(m, p.distance), LAUNCH_DISTANCE)
  const horizonRadius = mass !== null ? evaluateBlackHole(mass, LAUNCH_DISTANCE).eventHorizonRadius : 0
  const horizonPx = horizonRadius * PX_PER_UNIT
  return (
    <svg
      width={VIEW_SIZE}
      height={VIEW_SIZE}
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      style={svgStyle}
      role="img"
      aria-label="A view from above: a central mass in the middle, a launch point to its right, a probe, its path, and, after a launch, the dashed circle of the event horizon."
    >
      {showHorizon && mass !== null && (
        <>
          <circle cx={cx} cy={cy} r={horizonPx} fill="none" stroke={HORIZON_COLOR} strokeWidth={2} strokeDasharray="6 4" />
          <line x1={cx} y1={cy - horizonPx} x2={cx} y2={44} stroke={HORIZON_COLOR} strokeWidth={1} strokeDasharray="2 3" />
          <text x={cx} y={22} fontSize="13" fontWeight="bold" fill={HORIZON_COLOR} textAnchor="middle">
            Event horizon (the point of no return)
          </text>
          <text x={cx} y={38} fontSize="11" fill={HORIZON_COLOR} textAnchor="middle">
            radius {horizonRadius.toFixed(2)}
          </text>
        </>
      )}
      {last && (
        <line x1={distanceToX(LAUNCH_DISTANCE)} y1={cy} x2={distanceToX(farthest)} y2={cy} stroke={FIXED_COLOR} strokeWidth={4} strokeLinecap="round" />
      )}
      <circle cx={cx} cy={cy} r={7} fill={MASS_COLOR} />
      <text x={cx - 8} y={cy + 30} fontSize="12" fill={TEXT_COLOR} textAnchor="end">
        Central mass
      </text>
      <line x1={cx - 6} y1={cy + 24} x2={cx - 3} y2={cy + 10} stroke={MUTED_COLOR} strokeWidth={1} />
      <circle cx={distanceToX(LAUNCH_DISTANCE)} cy={cy} r={12} fill="none" stroke={LAUNCH_COLOR} strokeWidth={2.5} />
      <text x={distanceToX(LAUNCH_DISTANCE)} y={cy + 28} fontSize="12" fill={LAUNCH_COLOR} textAnchor="middle">
        Launch point
      </text>
      <text x={distanceToX(LAUNCH_DISTANCE)} y={cy + 43} fontSize="11" fill={LAUNCH_COLOR} textAnchor="middle">
        (distance 1)
      </text>
      {last && (
        <>
          <circle cx={distanceToX(last.distance)} cy={cy} r={6} fill={FIXED_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <text x={distanceToX(last.distance)} y={cy - 16} fontSize="12" fontWeight="bold" fill={FIXED_COLOR} textAnchor="middle">
            Probe
          </text>
        </>
      )}
    </svg>
  )
}

// ---- the graph of escape speed against mass ----
const G = { width: 760, height: 400, left: 78, right: 30, top: 44, bottom: 64 }
const PLOT_W = G.width - G.left - G.right
const PLOT_H = G.height - G.top - G.bottom
const X_MAX = 6.3
const Y_MAX = 1.9
const xOf = (mass: number) => G.left + (mass / X_MAX) * PLOT_W
const yOf = (fraction: number) => G.top + PLOT_H - (fraction / Y_MAX) * PLOT_H

const GUESS_BOX_TEXT: Record<SpeedCompareChoice, string> = {
  'much-slower': 'much slower than light',
  faster: 'faster than light',
  'cannot-escape': 'nothing can escape',
}

function GuessBox({ x, y, width, second }: { x: number; y: number; width: number; second: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={36} rx={5} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
      <text x={x + width / 2} y={y + 15} fontSize="12" fontWeight="bold" fill={GUESS_COLOR} textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + width / 2} y={y + 30} fontSize="11" fill={GUESS_COLOR} textAnchor="middle">
        {second}
      </text>
    </g>
  )
}

function Ring({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={9} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
}

interface GraphProps {
  lightDone: boolean
  heavyDone: boolean
  curveMasses: number | null // the largest mass the real curve has reached, or null for none
  sweepDone: boolean
  guesses: { light: SpeedCompareChoice; heavy: SpeedCompareChoice; inBetween: YesNo } | null
  // The learner's own launches from Part 2, drawn as pink dots (the last one labelled).
  yours?: number[]
}

export function EscapeGraph({ lightDone, heavyDone, curveMasses, sweepDone, guesses, yours = [] }: GraphProps) {
  const sweep = useMemo(() => escapeSpeedSweep(0.1), [])
  const real = useMemo(() => partOneOutcomes(), [])
  const curvePoints = curveMasses === null ? [] : sweep.filter((p) => p.mass <= curveMasses + 1e-9)
  const markers = guesses ? guessMarkers(guesses.light, guesses.heavy, guesses.inBetween) : null
  const special = specialMass()
  const yTicks = [0, 0.5, 1, 1.5]
  const xTicks = [0, 1, 2, 3, 4, 5, 6]
  return (
    <svg
      width={G.width}
      height={G.height}
      viewBox={`0 0 ${G.width} ${G.height}`}
      style={svgStyle}
      role="img"
      aria-label="A graph of the speed needed to escape, as a percentage of the speed of light, against the mass of the central object, with a dashed line at the speed of light."
    >
      <text x={G.left} y={22} fontSize="14" fontWeight="bold" fill={TEXT_COLOR}>
        Speed needed to escape, compared with the speed of light
      </text>
      {/* axes */}
      <line x1={G.left} y1={G.top} x2={G.left} y2={G.top + PLOT_H} stroke={MUTED_COLOR} />
      <line x1={G.left} y1={G.top + PLOT_H} x2={G.left + PLOT_W} y2={G.top + PLOT_H} stroke={MUTED_COLOR} />
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={G.left - 4} y1={yOf(t)} x2={G.left} y2={yOf(t)} stroke={MUTED_COLOR} />
          <text x={G.left - 8} y={yOf(t) + 4} fontSize="11" fill={MUTED_COLOR} textAnchor="end">
            {percent(t)}%
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={t}>
          <line x1={xOf(t)} y1={G.top + PLOT_H} x2={xOf(t)} y2={G.top + PLOT_H + 4} stroke={MUTED_COLOR} />
          <text x={xOf(t)} y={G.top + PLOT_H + 17} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={G.left + PLOT_W / 2} y={G.height - 10} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        Mass of the central object (relative units)
      </text>
      <text x={16} y={G.top + PLOT_H / 2} fontSize="12" fill={TEXT_COLOR} textAnchor="middle" transform={`rotate(-90 16 ${G.top + PLOT_H / 2})`}>
        Escape speed (percent of light speed)
      </text>
      {/* the speed-of-light line */}
      <line x1={G.left} y1={yOf(1)} x2={G.left + PLOT_W} y2={yOf(1)} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="7 5" />
      <text x={G.left + 6} y={yOf(1) - 22} fontSize="11" fill="#cbd5e1">
        Speed of light = 100 percent.
      </text>
      <text x={G.left + 6} y={yOf(1) - 8} fontSize="11" fill="#cbd5e1">
        Nothing can go faster.
      </text>
      {/* the real curve (amber) */}
      {curvePoints.length > 1 && (
        <polyline
          points={curvePoints.map((p) => `${xOf(p.mass)},${yOf(p.escapeSpeedFractionOfC)}`).join(' ')}
          fill="none"
          stroke={FIXED_COLOR}
          strokeWidth={3}
        />
      )}
      {sweepDone && (
        <g>
          <line x1={xOf(3.4)} y1={yOf(0.28)} x2={xOf(3.4) + 26} y2={yOf(0.28)} stroke={FIXED_COLOR} strokeWidth={3} />
          <text x={xOf(3.4) + 34} y={yOf(0.28) + 4} fontSize="11" fill={FIXED_COLOR}>
            real escape speed at each mass
          </text>
        </g>
      )}
      {sweepDone && <circle cx={xOf(special)} cy={yOf(1)} r={4} fill={FIXED_COLOR} />}
      {/* the real launches (amber dots) */}
      {lightDone && (
        <g>
          <circle cx={xOf(PART_ONE_MASSES.light)} cy={yOf(real.light.escapeSpeedFractionOfC)} r={5} fill={FIXED_COLOR} stroke="#0b1020" />
          <text x={xOf(PART_ONE_MASSES.light) + 12} y={yOf(real.light.escapeSpeedFractionOfC) + 4} fontSize="11" fill={FIXED_COLOR}>
            mass 0.2: {percent(real.light.escapeSpeedFractionOfC)}%
          </text>
        </g>
      )}
      {heavyDone && (
        <g>
          <circle cx={xOf(PART_ONE_MASSES.heavy)} cy={yOf(real.heavy.escapeSpeedFractionOfC)} r={5} fill={FIXED_COLOR} stroke="#0b1020" />
          <text x={xOf(PART_ONE_MASSES.heavy) - 10} y={yOf(real.heavy.escapeSpeedFractionOfC) - 9} fontSize="11" fill={FIXED_COLOR} textAnchor="end">
            mass 6: {percent(real.heavy.escapeSpeedFractionOfC)}%
          </text>
        </g>
      )}
      {/* the learner's own launches (pink dots), from Part 2 */}
      {yours.map((m, i) => {
        const f = launchSummary(m).escapeSpeedFractionOfC
        const isLast = i === yours.length - 1
        return (
          <g key={`y${i}`}>
            <circle cx={xOf(m)} cy={yOf(f)} r={isLast ? 7 : 5} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
            {isLast && (
              <text x={xOf(m)} y={yOf(f) - 13} fontSize="12" fontWeight="bold" fill={YOURS_COLOR} textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
                your mass {m.toFixed(1)}: {percent(f)}%
              </text>
            )}
          </g>
        )
      })}
      {/* the white guess marks, each drawn only once the feature beside it is drawn */}
      {markers && (lightDone || sweepDone) && (
        <g>
          <Ring cx={xOf(markers.light.mass)} cy={yOf(markers.light.fractionOfC)} />
          <line x1={xOf(markers.light.mass) + 9} y1={yOf(markers.light.fractionOfC)} x2={xOf(markers.light.mass) + 34} y2={yOf(markers.light.fractionOfC)} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={xOf(markers.light.mass) + 34} y={yOf(markers.light.fractionOfC) - 18} width={168} second={GUESS_BOX_TEXT[guesses!.light]} />
        </g>
      )}
      {markers && (heavyDone || sweepDone) && (
        <g>
          <Ring cx={xOf(markers.heavy.mass)} cy={yOf(markers.heavy.fractionOfC)} />
          <line x1={xOf(markers.heavy.mass)} y1={yOf(markers.heavy.fractionOfC) + 9} x2={xOf(markers.heavy.mass)} y2={yOf(markers.heavy.fractionOfC) + 26} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={xOf(markers.heavy.mass) - 168 + 10} y={yOf(markers.heavy.fractionOfC) + 26} width={168} second={GUESS_BOX_TEXT[guesses!.heavy]} />
        </g>
      )}
      {markers && sweepDone && markers.inBetween.choice === 'yes' && markers.inBetween.mass !== null && (
        <g>
          <Ring cx={xOf(markers.inBetween.mass)} cy={yOf(1)} />
          <line x1={xOf(markers.inBetween.mass) + 7} y1={yOf(1) + 7} x2={xOf(markers.inBetween.mass) + 28} y2={yOf(1) + 30} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={xOf(markers.inBetween.mass) + 28} y={yOf(1) + 30} width={190} second="yes: something special here" />
        </g>
      )}
      {markers && sweepDone && markers.inBetween.choice === 'no' && (
        <g>
          <Ring cx={xOf(3.2)} cy={yOf(1)} />
          <line x1={xOf(3.2)} y1={yOf(1) + 9} x2={xOf(3.2)} y2={yOf(1) + 30} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={xOf(3.2) - 95} y={yOf(1) + 30} width={190} second="no: nothing special in between" />
        </g>
      )}
    </svg>
  )
}

// ---- the caption ----
function part1Items({ lightDone, heavyDone, sweepDone }: { lightDone: boolean; heavyDone: boolean; sweepDone: boolean }) {
  const real = partOneOutcomes()
  const graphItems: Array<{ look: string; means: string; matters: string }> = []
  const drawingItems: Array<{ look: string; means: string; matters: string }> = []
  if (lightDone) {
    graphItems.push({
      look: 'the amber dot at mass 0.2, beside the dashed speed-of-light line',
      means: `the probe starts from a place where the speed needed to escape is ${percent(real.light.escapeSpeedFractionOfC)} percent of the speed of light, well below the dashed line. The probe is launched at 100 percent, so it has more than it needs.`,
      matters: 'it shows what a light mass is like: the launch is far faster than the escape speed, so the probe gets away.',
    })
  }
  if (heavyDone) {
    graphItems.push({
      look: 'the amber dot at mass 6, beside the dashed speed-of-light line',
      means: `the speed the formula asks for here is ${percent(real.heavy.escapeSpeedFractionOfC)} percent of the speed of light, above the dashed line. The probe is launched at 100 percent, and that is less than it would need.`,
      matters: 'the dot sits above a line that nothing can cross, so the launch cannot do what the formula asks, and the drawing shows what happens instead.',
    })
  }
  if (sweepDone) {
    graphItems.push({
      look: 'the place where the amber curve meets the dashed line',
      means: `the curve rises with mass and reaches the line at mass ${real.specialMass}. At that mass the escape speed is exactly the speed of light.`,
      matters: 'this is the mass where the launch stops being enough, which is the heart of the question you were asked about the middle.',
    })
    drawingItems.push({
      look: 'the dashed violet circle in the drawing as the mass goes up',
      means: 'the circle is the event horizon. It grows with the mass, and it reaches the launch point at the same mass where the curve meets the dashed line.',
      matters: 'the circle and the curve are two views of one fact, so you can see the graph’s crossing as a place in space.',
    })
  }
  return { graphItems, drawingItems }
}

export function Part1DrawingCaption({ lightDone, heavyDone, sweepDone }: { lightDone: boolean; heavyDone: boolean; sweepDone: boolean }) {
  const { drawingItems } = part1Items({ lightDone, heavyDone, sweepDone })
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the drawing.</strong> It is a view from above, like looking down at a marble beside a heavy ball on a table. It
        shows one launch at a time.
      </p>
      <ul style={listStyle}>
        <li>The <strong>pale yellow dot</strong> in the middle is the central mass. It never moves.</li>
        <li>The <strong>grey ring</strong> is the launch point, always the same distance from the mass (distance 1), so only the mass changes between launches.</li>
        <li>The <strong>amber dot</strong> is the probe, a small test object. It is launched straight outward, away from the mass, at the speed of light. The <strong>amber line</strong> is the path it has travelled.</li>
        <li>After a launch, a <strong>dashed violet circle</strong> appears around the mass: the <strong>event horizon</strong>, the place of no return. Its radius is written under it. A heavier mass has a bigger circle.</li>
        <li><strong>Why the circle is sometimes missing.</strong> Before your first launch there is no circle yet. And for a very light mass the circle is too small to see. For mass 0.2 its radius is only 0.1, a tenth of the launch distance, so it is hidden behind the pale yellow dot. The circle is still there: it is just smaller than the dot that marks the mass. The label and the thin dotted line above the mass are still drawn for that launch.</li>
        <li><strong>Can the circle be inside the mass?</strong> In this drawing, the pale yellow dot is only a marker for where the mass is. It is drawn the same size for every mass, and it is not the size of the object: this experiment gives the mass no size at all, and the circle&rsquo;s radius comes only from the mass (radius = mass &divide; 2). So when a small circle hides behind the dot, that is only because the dot is drawn bigger than the circle. In the real world the question does come up. An ordinary object such as the Earth also has an event horizon, and for the Earth&rsquo;s mass its radius would be only about 9 millimetres (NASA&rsquo;s Imagine the Universe page). That is buried deep inside the Earth, so the Earth is not a black hole. An object is a black hole only when all of its mass is squeezed to fit inside its own event horizon.</li>
      </ul>
      {drawingItems.length > 0 ? (
        <LookFor items={drawingItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> in the drawing appears here once the third launch has finished.
        </p>
      )}
    </CaptionBox>
  )
}

export function Part1GraphCaption({ lightDone, heavyDone, sweepDone }: { lightDone: boolean; heavyDone: boolean; sweepDone: boolean }) {
  const { graphItems } = part1Items({ lightDone, heavyDone, sweepDone })
  const eightTenths = evaluateBlackHole(0.8, LAUNCH_DISTANCE).escapeSpeedFractionOfC
  const three = evaluateBlackHole(3, LAUNCH_DISTANCE).escapeSpeedFractionOfC
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the graph.</strong> It shows how much speed is needed to escape, whatever the mass. It is built from the same numbers as the drawing.
      </p>
      <ul style={listStyle}>
        <li>Along the bottom is the <strong>mass</strong> of the central object, from 0.2 to 6. These are made-up, relative units, so only comparisons matter: 4 is twice as heavy as 2.</li>
        <li>Up the side is the <strong>escape speed</strong>, the speed needed to get away for good, written as a percentage of the speed of light. 100 percent means exactly the speed of light.</li>
        <li>The <strong>dashed grey line</strong> marks the speed of light, 100 percent. Nothing can go faster than that.</li>
        <li>The <strong>amber curve</strong> and <strong>amber dots</strong> are calculated, not guessed. The dots mark the launches you have watched. The curve fills in during the third launch.</li>
        <li>Your guesses are the <strong>white rings</strong>, each joined by a line to a box marked YOUR GUESS. A ring appears once the amber feature beside it has been drawn. For the &ldquo;faster&rdquo; and &ldquo;nothing can escape&rdquo; answers, and for &ldquo;no&rdquo;, there is no number to draw, so the ring is only a marker for your answer and its height means nothing.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What happens, in order.</strong> Each launch plays on the drawing and puts amber on the graph. The first two put one dot each on the graph. The third raises the mass slowly from 0.2 to 6 while the circle grows, and draws the amber curve as it goes. Your white rings appear as the amber beside them appears.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> Take a mass of 0.8 (not one of your three launches). The escape speed is the square root of (2 × 0.8 ÷ 1) = the square root of 1.6 = 1.26. The speed of light in this page is 2, so that is 1.26 ÷ 2 = {percent(eightTenths)} percent of the speed of light, below the dashed line. At mass 3 it is the square root of 6 = 2.45, which is {percent(three)} percent, above the dashed line.
      </p>
      {graphItems.length > 0 ? (
        <LookFor items={graphItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> appears here as each launch finishes.
        </p>
      )}
    </CaptionBox>
  )
}

// ---- Part 2: the learner's own launch, beside Part 1's ----
export interface Part2DrawingProps {
  yoursMass: number | null
  yoursTrajectory: Array<{ distance: number }>
  // Part 1's launches that have finished, kept in grey for comparison.
  reference: Array<{ mass: number; label: string; farthest: number; row: number }>
}

export function Part2Drawing({ yoursMass, yoursTrajectory, reference }: Part2DrawingProps) {
  const cx = VIEW_SIZE / 2
  const cy = VIEW_SIZE / 2
  const last = yoursTrajectory.length > 0 ? yoursTrajectory[yoursTrajectory.length - 1] : null
  const farthest = yoursTrajectory.reduce((m, p) => Math.max(m, p.distance), LAUNCH_DISTANCE)
  const yourHorizon = yoursMass !== null ? evaluateBlackHole(yoursMass, LAUNCH_DISTANCE).eventHorizonRadius : null
  return (
    <svg
      width={VIEW_SIZE}
      height={VIEW_SIZE}
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      style={svgStyle}
      role="img"
      aria-label="A view from above: a central mass in the middle, a launch point to its right, your own launch in pink with its dashed horizon circle, and Part 1's launches in grey."
    >
      {reference.map((r) => {
        const h = evaluateBlackHole(r.mass, LAUNCH_DISTANCE).eventHorizonRadius * PX_PER_UNIT
        return (
          <g key={r.label}>
            <circle cx={cx} cy={cy} r={h} fill="none" stroke={LAUNCH_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />
            <line x1={distanceToX(LAUNCH_DISTANCE)} y1={cy + 8 + r.row * 8} x2={distanceToX(r.farthest)} y2={cy + 8 + r.row * 8} stroke={LAUNCH_COLOR} strokeWidth={3} strokeLinecap="round" />
            <text x={distanceToX(LAUNCH_DISTANCE) + 4} y={cy + 30 + r.row * 14} fontSize="11" fill={LAUNCH_COLOR} stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
              {r.label}
            </text>
          </g>
        )
      })}
      {reference.length > 0 && (
        <text x={VIEW_SIZE - 8} y={VIEW_SIZE - 8} fontSize="11" fill={LAUNCH_COLOR} textAnchor="end">
          grey: Part 1 (dashed circle = its horizon)
        </text>
      )}
      {yourHorizon !== null && yoursMass !== null && (
        <>
          <circle cx={cx} cy={cy} r={yourHorizon * PX_PER_UNIT} fill="none" stroke={YOURS_COLOR} strokeWidth={2} strokeDasharray="6 4" />
          <line x1={cx} y1={cy - yourHorizon * PX_PER_UNIT} x2={cx} y2={44} stroke={YOURS_COLOR} strokeWidth={1} strokeDasharray="2 3" />
          <text x={cx} y={22} fontSize="13" fontWeight="bold" fill={YOURS_COLOR} textAnchor="middle">
            Your event horizon (mass {yoursMass.toFixed(1)})
          </text>
          <text x={cx} y={38} fontSize="11" fill={YOURS_COLOR} textAnchor="middle">
            radius {yourHorizon.toFixed(2)}
          </text>
        </>
      )}
      {last && <line x1={distanceToX(LAUNCH_DISTANCE)} y1={cy} x2={distanceToX(farthest)} y2={cy} stroke={YOURS_COLOR} strokeWidth={4} strokeLinecap="round" />}
      <circle cx={cx} cy={cy} r={7} fill={MASS_COLOR} />
      <text x={cx - 8} y={cy + 30} fontSize="12" fill={TEXT_COLOR} textAnchor="end" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
        Central mass
      </text>
      <line x1={cx - 6} y1={cy + 24} x2={cx - 3} y2={cy + 10} stroke={MUTED_COLOR} strokeWidth={1} />
      <circle cx={distanceToX(LAUNCH_DISTANCE)} cy={cy} r={12} fill="none" stroke={LAUNCH_COLOR} strokeWidth={2.5} />
      <text x={distanceToX(LAUNCH_DISTANCE)} y={cy - 54} fontSize="12" fill={LAUNCH_COLOR} textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
        Launch point (distance 1)
      </text>
      {last && (
        <>
          <circle cx={distanceToX(last.distance)} cy={cy} r={6} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <text x={distanceToX(last.distance)} y={cy - 16} fontSize="12" fontWeight="bold" fill={YOURS_COLOR} textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
            Your probe
          </text>
        </>
      )}
    </svg>
  )
}

function part2Items(yours: number[], curveDrawn: boolean) {
  const latest = yours.length > 0 ? yours[yours.length - 1] : null
  const summary = latest !== null ? launchSummary(latest) : null
  const graphItems: Array<{ look: string; means: string; matters: string }> = []
  const drawingItems: Array<{ look: string; means: string; matters: string }> = []
  if (summary && latest !== null) {
    graphItems.push({
      look: 'your pink dot on the graph',
      means: `it sits at your mass, ${latest.toFixed(1)}, and at the escape speed for that mass: ${percent(summary.escapeSpeedFractionOfC)} percent of the speed of light. Each new launch adds a dot, and the newest is the big one with a label.`,
      matters: 'moving the slider moves the dot, so you can find for yourself where the dots cross the dashed speed-of-light line.',
    })
    if (curveDrawn) {
      graphItems.push({
        look: 'your pink dot, against the amber curve',
        means: 'every pink dot lands on the amber curve, whatever mass you choose, because the curve is the escape speed at every mass.',
        matters: 'it shows that the curve is not only for the three launches in Part 1: it is the answer for any mass you can try.',
      })
      drawingItems.push({
        look: 'your pink dashed circle, against the grey ring of the launch point',
        means: `the circle is the event horizon for your mass. Its radius is ${summary.eventHorizonRadius.toFixed(2)}, and the launch point is at distance ${LAUNCH_DISTANCE}. ${summary.isInsideHorizon ? 'The circle is bigger than the launch distance, so the launch point is inside it.' : 'The circle is smaller than the launch distance, so the launch point is outside it.'}`,
        matters: 'the horizon grows with the mass, so the slider shows where the circle reaches the launch point, the same place the curve meets the dashed line.',
      })
    }
  }
  if (yours.length >= 2) {
    graphItems.push({
      look: 'your pink dots, one against another',
      means: 'a bigger mass gives a dot higher up, which means a faster escape speed.',
      matters: 'it shows how the escape speed climbs as the mass grows, with the launch point held at the same distance every time.',
    })
  }
  return { summary, latest, graphItems, drawingItems }
}

export function Part2DrawingCaption({ yours, curveDrawn }: { yours: number[]; curveDrawn: boolean }) {
  const { drawingItems } = part2Items(yours, curveDrawn)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the drawing.</strong> It is the drawing of Part 1 again, a view from above, now showing your own launches in pink. Part 1&rsquo;s launches stay for comparison.
      </p>
      <ul style={listStyle}>
        <li>The <strong>pale yellow dot</strong> is the central mass. The <strong>grey ring</strong> is the launch point, always at distance 1.</li>
        <li>The <strong>pink dot</strong> is your probe and the <strong>pink line</strong> is the path it has travelled. The <strong>pink dashed circle</strong> is the event horizon for your mass, and its radius is written above it.</li>
        <li>The <strong>grey dashed circles and short grey lines</strong> are the launches you watched in Part 1. The grey lines are drawn a little below the axis so they do not hide yours; each is named beside it.</li>
        <li><strong>Why a circle is sometimes missing.</strong> Before your first launch there is no pink circle yet. If a mass is very light (below about 0.3), its circle is smaller than the pale yellow dot and is hidden behind it. For example, mass 0.2 has a horizon radius of only 0.1, a tenth of the launch distance. The circle is still there, and for your own launch its radius is still written above. The same goes for the grey circle from Part 1&rsquo;s light launch (mass 0.2).</li>
        <li><strong>Can the circle be inside the mass?</strong> The pale yellow dot is only a marker for where the mass is. It is drawn the same size for every mass and is not the size of the object, because this experiment gives the mass no size. A circle hidden behind the dot is hidden only because the dot is drawn bigger. For a real object such as the Earth, the horizon for its mass would be only about 9 millimetres in radius, deep inside the Earth, so the Earth is not a black hole. An object is a black hole only when all of its mass is squeezed to fit inside its own event horizon.</li>
      </ul>
      {drawingItems.length > 0 ? (
        <LookFor items={drawingItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> in the drawing appears here once the third launch of Part 1 has finished and you have made your first launch.
        </p>
      )}
    </CaptionBox>
  )
}

export function Part2GraphCaption({ yours, curveDrawn }: { yours: number[]; curveDrawn: boolean }) {
  const { summary, latest, graphItems } = part2Items(yours, curveDrawn)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the graph.</strong> It is the graph of Part 1, with your launches added.
      </p>
      <ul style={listStyle}>
        <li>Along the bottom is the mass, in relative units. Up the side is the escape speed as a percentage of the speed of light. The <strong>dashed grey line</strong> is the speed of light, 100 percent.</li>
        <li>The <strong>amber curve and dots</strong> are from Part 1, once they have been drawn there. The <strong>pink dots</strong> are your launches.</li>
      </ul>
      {summary && latest !== null && (
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>A worked moment, from your latest launch.</strong> Your mass was {latest.toFixed(1)}. The escape speed is the square root of
          (2 × {latest.toFixed(1)} ÷ {LAUNCH_DISTANCE}) = the square root of {((2 * latest) / LAUNCH_DISTANCE).toFixed(2)} ={' '}
          {evaluateBlackHole(latest, LAUNCH_DISTANCE).escapeSpeed.toFixed(2)}. The speed of light in this page is 2, so that is{' '}
          {percent(summary.escapeSpeedFractionOfC)} percent of it. The horizon radius is {latest.toFixed(1)} ÷ 2 ={' '}
          {summary.eventHorizonRadius.toFixed(2)}. The probe {summary.outcome === 'escapes' ? 'gets away' : 'falls back'}.
        </p>
      )}
      {graphItems.length > 0 ? (
        <LookFor items={graphItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> and a worked moment appear here after your first launch.
        </p>
      )}
    </CaptionBox>
  )
}

// ---- the words box ----
function referenceEntries(allRun: boolean, explained: boolean): { term: string; meaning: string }[] {
  const entries = [
    {
      term: 'Escape speed',
      meaning:
        'the speed you need, starting from a place, to get away from a mass for good and never fall back. Throw a ball up gently and it falls back down. Throw it faster and it goes higher. At the escape speed it never returns.',
    },
    {
      term: 'Speed of light',
      meaning: 'the fastest speed anything can have. Experiment 5 of “Relativity of Time and Motion” showed that nothing can go faster. In this page’s made-up units it is 2.',
    },
    { term: 'Probe', meaning: 'the little test object we launch. It stands for anything, including a flash of light.' },
    { term: 'Concentrated', meaning: 'a lot of mass packed into a small space.' },
    {
      term: 'Relative units',
      meaning: 'numbers that only compare things (this is twice that) instead of real kilometres or kilograms.',
    },
    { term: 'Top view', meaning: 'a drawing looked at from straight above, like a map.' },
  ]
  if (allRun) {
    entries.push(
      {
        term: 'Event horizon',
        meaning:
          'the invisible boundary around a black hole. It is not a wall or a surface. It is a place of no return: from inside it, nothing can get out, not even light.',
      },
      { term: 'Black hole', meaning: 'an object squeezed so tightly that it has an event horizon.' },
      {
        term: 'Escape speed formula',
        meaning:
          'for a mass M and a distance d, escape speed = the square root of (2 × M ÷ d). Worked example in this page’s units: mass 0.8, distance 1: the square root of 1.6 = 1.26. The speed of light here is 2, so that is 63 percent of light speed.',
      }
    )
  } else {
    entries.push({
      term: 'More words',
      meaning: 'event horizon, black hole and the escape-speed formula appear here after you have watched all three launches, because they would give away what the launches show.',
    })
  }
  if (explained) {
    entries.push(
      {
        term: 'Schwarzschild radius',
        meaning:
          'the radius a mass would have to be squeezed to in order to become a black hole: the radius at which the escape speed equals the speed of light. Formula: radius = 2 × G × mass ÷ c². Worked example, the Earth: about 9 millimetres (see section 3 of the field guide).',
      },
      { term: 'Supernova', meaning: 'the explosion of a massive star when it runs out of fuel and its core collapses.' },
      { term: 'Singularity', meaning: 'the point at the very centre of a black hole where, according to general relativity, matter is crushed to infinite density. Astronomers do not know whether it is physically real.' },
      { term: 'Shadow', meaning: 'the dark patch in the middle of a picture of a black hole, surrounded by glowing gas.' },
      { term: 'Accretion disk', meaning: 'the hot, thin, rotating disk of gas that slowly spirals toward a black hole.' },
      { term: 'Gravitational waves', meaning: 'ripples in space-time, made for example when two black holes collide.' },
      { term: 'Hawking radiation', meaning: 'a tiny amount of energy that, in theory, a black hole slowly loses, so that it very slowly shrinks.' },
      { term: 'Light-year', meaning: 'the distance light travels in one year.' },
      { term: 'Microarcsecond', meaning: 'a tiny angle: an arcsecond is one 3,600th of a degree, and a microarcsecond is a millionth of that.' }
    )
  }
  return entries
}

const START_NOTE =
  'Links to the original papers, official pages and pictures are waiting in the black hole field guide after the tutor. They are held back until then because most of them give away what you are about to guess.'

// ---- the questions ----
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

function Question({ prompt, guessText, children }: { prompt: string; guessText: string | null; children: ReactNode }) {
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
  key: Part1Key | 'part2'
  // Part 2 only: the mass the learner chose and its launch.
  mass?: number
  result?: RadialLaunchResult
}

type RunStatus = 'idle' | 'running' | 'complete'

export function BlackHoleExperiment({ onComplete, onTutorComplete }: BlackHoleExperimentProps) {
  const [lightGuess, setLightGuess] = useState<SpeedCompareChoice | null>(null)
  const [heavyGuess, setHeavyGuess] = useState<SpeedCompareChoice | null>(null)
  const [inBetweenGuess, setInBetweenGuess] = useState<YesNo | null>(null)
  const [submitted, setSubmitted] = useState<{ light: SpeedCompareChoice; heavy: SpeedCompareChoice; inBetween: YesNo } | null>(null)

  const [selected, setSelected] = useState<Part1Key>('light')
  const [done, setDone] = useState<Part1Key[]>([])
  const [active, setActive] = useState<ActiveRun | null>(null)
  const [shownKey, setShownKey] = useState<Part1Key | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<RunStatus>('idle')
  const [sliderMass, setSliderMass] = useState(1)
  const [part2Runs, setPart2Runs] = useState<number[]>([])
  const [explained, setExplained] = useState(false)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const isRunning = status === 'running'
  const allThree = done.length === 3
  const firstDone = done.length >= 1
  const hasAllGuesses = lightGuess !== null && heavyGuess !== null && inBetweenGuess !== null
  const locked = submitted !== null
  const shownLight = submitted?.light ?? lightGuess
  const shownHeavy = submitted?.heavy ?? heavyGuess
  const shownInBetween = submitted?.inBetween ?? inBetweenGuess

  const lightResult = useMemo<RadialLaunchResult>(() => runRadialLightSpeedLaunch(PART_ONE_MASSES.light, LAUNCH_DISTANCE), [])
  const heavyResult = useMemo<RadialLaunchResult>(() => runRadialLightSpeedLaunch(PART_ONE_MASSES.heavy, LAUNCH_DISTANCE), [])

  // The slow raise: the mass follows the progress, rounded so the launch is simulated only when it changes.
  const sweepMass = Math.round((MASS_MIN + progress * (MASS_MAX - MASS_MIN)) * 20) / 20
  const sweepResult = useMemo<RadialLaunchResult>(() => runRadialLightSpeedLaunch(sweepMass, LAUNCH_DISTANCE), [sweepMass])

  // One animation per run: a fixed real duration that does not depend on how much simulated time the launch covers (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running' || !active) return
    const duration = active.key === 'sweep' ? SWEEP_DURATION_MS : ANIMATION_DURATION_MS
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min(Math.max((now - startTime) / duration, 0), 1)
      setProgress(p)
      if (p >= 1) {
        setStatus('complete')
        const key = active.key
        if (key === 'part2') {
          if (active.mass !== undefined) setPart2Runs((list) => [...list, active.mass!])
          onCompleteRef.current?.()
          return
        }
        setDone((list) => {
          const next = list.includes(key) ? list : [...list, key]
          const nextUnrun = PART1_KEYS.find((k) => !next.includes(k))
          if (nextUnrun) setSelected(nextUnrun)
          return next
        })
        onCompleteRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, active])

  const handleRun = () => {
    if (!hasAllGuesses || isRunning || done.includes(selected)) return
    if (!submitted) {
      setSubmitted({ light: lightGuess!, heavy: heavyGuess!, inBetween: inBetweenGuess! })
    }
    setActive({ key: selected })
    setShownKey(selected)
    setProgress(0)
    setStatus('running')
  }

  const handleRunPart2 = () => {
    if (isRunning) return
    const mass = sliderMass
    setActive({ key: 'part2', mass, result: runRadialLightSpeedLaunch(mass, LAUNCH_DISTANCE) })
    setProgress(0)
    setStatus('running')
  }

  // Start over: clears the guesses, the runs and the results, and returns the page to its first state.
  const handleStartOver = () => {
    setLightGuess(null)
    setHeavyGuess(null)
    setInBetweenGuess(null)
    setSubmitted(null)
    setSelected('light')
    setDone([])
    setActive(null)
    setShownKey(null)
    setProgress(0)
    setStatus('idle')
    setSliderMass(1)
    setPart2Runs([])
    setExplained(false)
  }

  const hasAnythingToClear =
    lightGuess !== null || heavyGuess !== null || inBetweenGuess !== null || locked || done.length > 0 || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || isRunning

  // What the drawing shows: the launch being played, or the last one that finished.
  let drawnMass: number | null = null
  let drawnTrajectory: Array<{ distance: number }> = []
  if (shownKey === 'light' || shownKey === 'heavy') {
    const result = shownKey === 'light' ? lightResult : heavyResult
    drawnMass = shownKey === 'light' ? PART_ONE_MASSES.light : PART_ONE_MASSES.heavy
    const total = result.trajectory.length
    const count = status === 'running' && active?.key === shownKey ? Math.max(1, Math.round(progress * (total - 1)) + 1) : total
    drawnTrajectory = result.trajectory.slice(0, count)
  } else if (shownKey === 'sweep') {
    drawnMass = status === 'running' && active?.key === 'sweep' ? sweepMass : MASS_MAX
    const result = status === 'running' && active?.key === 'sweep' ? sweepResult : runRadialLightSpeedLaunch(MASS_MAX, LAUNCH_DISTANCE)
    drawnTrajectory = result.trajectory
  }
  const drawnEvaluation = drawnMass !== null ? evaluateBlackHole(drawnMass, LAUNCH_DISTANCE) : null
  const lastDistance = drawnTrajectory.length > 0 ? drawnTrajectory[drawnTrajectory.length - 1].distance : LAUNCH_DISTANCE
  const previousDistance = drawnTrajectory.length > 1 ? drawnTrajectory[drawnTrajectory.length - 2].distance : LAUNCH_DISTANCE
  const movingAway = lastDistance >= previousDistance

  // Part 2's drawing: the launch being played, or the learner's latest finished launch.
  const part2Playing = status === 'running' && active?.key === 'part2' ? active : null
  const lastPart2Mass = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const part2LastResult = useMemo<RadialLaunchResult | null>(
    () => (lastPart2Mass !== null ? runRadialLightSpeedLaunch(lastPart2Mass, LAUNCH_DISTANCE) : null),
    [lastPart2Mass]
  )
  const part2Mass = part2Playing?.mass ?? lastPart2Mass
  let part2Trajectory: Array<{ distance: number }> = []
  if (part2Playing?.result) {
    const total = part2Playing.result.trajectory.length
    part2Trajectory = part2Playing.result.trajectory.slice(0, Math.max(1, Math.round(progress * (total - 1)) + 1))
  } else if (part2LastResult) {
    part2Trajectory = part2LastResult.trajectory
  }
  const farthestOf = (t: Array<{ distance: number }>) => t.reduce((m, p) => Math.max(m, p.distance), LAUNCH_DISTANCE)
  const part2Reference = [
    ...(done.includes('light')
      ? [{ mass: PART_ONE_MASSES.light, label: 'Part 1: mass 0.2', farthest: farthestOf(lightResult.trajectory), row: 0 }]
      : []),
    ...(done.includes('heavy')
      ? [{ mass: PART_ONE_MASSES.heavy, label: 'Part 1: mass 6', farthest: farthestOf(heavyResult.trajectory), row: 1 }]
      : []),
  ]

  const sweepDone = done.includes('sweep')
  const curveMasses = sweepDone ? MASS_MAX : status === 'running' && active?.key === 'sweep' ? sweepMass : null
  const lightDone = done.includes('light')
  const heavyDone = done.includes('heavy')

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 7 — What Is a Black Hole?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <BlackHoleIntro />

        <ReferencePanel entries={referenceEntries(allThree, explained)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0 }}>
            <strong>Want to know more?</strong> {START_NOTE}
          </p>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will make three guesses about a probe launched at the speed of light from a heavy object, and then watch three launches to see
          what really happens.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="If the mass is very small, how does the speed needed to escape compare with the speed of light?"
            guessText={shownLight ? speedCompareLabel(shownLight) : null}
          >
            <ChoiceButtons options={speedCompareChoices} selected={shownLight} disabled={locked || isRunning} onSelect={setLightGuess} />
          </Question>
          <Question prompt="If the mass is very large instead, which do you expect?" guessText={shownHeavy ? speedCompareLabel(shownHeavy) : null}>
            <ChoiceButtons options={speedCompareChoices} selected={shownHeavy} disabled={locked || isRunning} onSelect={setHeavyGuess} />
          </Question>
          <Question
            prompt="Is there a mass in between where something special happens?"
            guessText={shownInBetween ? (shownInBetween === 'yes' ? 'Yes' : 'No') : null}
          >
            <ChoiceButtons
              options={[
                { value: 'yes' as YesNo, label: 'Yes' },
                { value: 'no' as YesNo, label: 'No' },
              ]}
              selected={shownInBetween}
              disabled={locked || isRunning}
              onSelect={setInBetweenGuess}
            />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your guesses are locked while you try other masses. To change them, press Start over.
            </p>
          )}
        </div>

        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Choose a launch to watch</p>
        <ChoiceButtons
          options={PART1_KEYS.map((key) => ({ value: key, label: PART1_BUTTONS[key] + (done.includes(key) ? ' ✓' : '') }))}
          selected={selected}
          disabled={isRunning}
          onSelect={setSelected}
        />
        <button
          type="button"
          className="action-button"
          onClick={handleRun}
          disabled={!hasAllGuesses || isRunning || done.includes(selected) || allThree}
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {isRunning ? 'Running...' : 'Run'}
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
        {!hasAllGuesses && !locked && <p style={smallNote}>Answer all three questions above to run the launches.</p>}
        <p style={smallNote}>Launches watched: {done.length} of 3.</p>

        <Block>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 320px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The drawing (view from above)</p>
              <LaunchDrawing mass={drawnMass} trajectory={drawnTrajectory} showHorizon={shownKey !== null} />
              {drawnEvaluation && (
                <p style={{ ...smallNote, marginTop: '0.5rem' }}>
                  Mass <strong>{drawnMass!.toFixed(shownKey === 'sweep' ? 2 : 1)}</strong>: the probe is{' '}
                  <strong>{movingAway ? 'moving away' : 'falling back'}</strong>.
                </p>
              )}
              {firstDone && <Part1DrawingCaption lightDone={lightDone} heavyDone={heavyDone} sweepDone={sweepDone} />}
            </div>
            <div style={{ flex: '2 1 420px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Speed needed to escape, for each mass</p>
              <EscapeGraph lightDone={lightDone} heavyDone={heavyDone} curveMasses={curveMasses} sweepDone={sweepDone} guesses={submitted} />
              {firstDone && <Part1GraphCaption lightDone={lightDone} heavyDone={heavyDone} sweepDone={sweepDone} />}
            </div>
          </div>
        </Block>

        {firstDone ? (
          <Block>
            <WhereFrom>
              <strong>Calculated here:</strong> every path, every horizon and every point on the curve. The computer steps ordinary gravity
              forward in very small time steps for the probe, and works out the escape speed from the formula for the mass and the launch
              distance. <strong>Measured:</strong> nothing. No real black hole was measured for these pictures; the real ones are in the field
              guide. <strong>Imagined for the question:</strong> the masses 0.2 to 6, the launch distance of 1 and the speed of light of 2, all in
              relative units. White is only ever your guess.
            </WhereFrom>
          </Block>
        ) : (
          <p style={smallNote}>
            After you press Run, the probe is launched in the drawing and the graph starts to fill in. Watch all three launches to see the
            full picture.
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {firstDone && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              You will choose the mass yourself and watch the same launch. Your launch is drawn in pink, and Part 1&rsquo;s launches are kept in
              grey so you can compare.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="black-hole-mass" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Mass: {sliderMass.toFixed(1)}
              </label>
              <input
                id="black-hole-mass"
                type="range"
                min={MASS_MIN}
                max={MASS_MAX}
                step={0.1}
                value={sliderMass}
                disabled={isRunning}
                onChange={(event) => setSliderMass(Number(event.target.value))}
                style={{ width: '100%' }}
              />
              <p style={smallNote}>
                Mass is in relative, made-up units, from {MASS_MIN} (very light) to {MASS_MAX} (very heavy). Your guesses do not change the
                drawings or tables, but this mass does.
              </p>
              <button
                type="button"
                className="action-button"
                onClick={handleRunPart2}
                disabled={isRunning}
                style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}
              >
                {part2Playing ? 'Launching...' : 'Launch with my mass'}
              </button>
              {!allThree && (
                <p style={smallNote}>
                  Part 1 launches watched: {done.length} of 3. Watch the rest in Part 1 to fill in the full graph and the grey comparison
                  launches below.
                </p>
              )}
            </div>

            <Block>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 320px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your launch (view from above)</p>
                  <Part2Drawing yoursMass={part2Mass} yoursTrajectory={part2Trajectory} reference={part2Reference} />
                  <Part2DrawingCaption yours={part2Runs} curveDrawn={sweepDone} />
                </div>
                <div style={{ flex: '2 1 420px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Speed needed to escape, for each mass</p>
                  <EscapeGraph
                    lightDone={lightDone}
                    heavyDone={heavyDone}
                    curveMasses={sweepDone ? MASS_MAX : null}
                    sweepDone={sweepDone}
                    guesses={null}
                    yours={part2Runs}
                  />
                  <Part2GraphCaption yours={part2Runs} curveDrawn={sweepDone} />
                </div>
              </div>
            </Block>

            {part2Runs.length === 0 && (
              <p style={smallNote}>
                Choose a mass and press &ldquo;Launch with my mass&rdquo;. Your probe is drawn in pink, and a pink dot appears on the graph.
              </p>
            )}
            {part2Runs.length > 0 && (
              <Block>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Runs so far</p>
                <ul style={listStyle}>
                  {part2Runs.map((m, i) => {
                    const r = launchSummary(m)
                    return (
                      <li key={i} style={{ fontSize: '0.875rem' }}>
                        Mass <strong>{m.toFixed(1)}</strong>: escape speed {percent(r.escapeSpeedFractionOfC)} percent of the speed of light; horizon
                        radius {r.eventHorizonRadius.toFixed(2)}; the probe {r.outcome === 'escapes' ? 'gets away' : 'falls back'}.
                      </li>
                    )
                  })}
                </ul>
              </Block>
            )}

            <Block>
              <WhereFrom>
                <strong>Calculated here:</strong> your launch, its horizon and your dot on the graph, in the same way as Part 1&rsquo;s.{' '}
                <strong>Measured:</strong> nothing. <strong>Imagined for the question:</strong> the mass you choose, the launch distance of 1 and
                the speed of light of 2, all in relative units. Pink is only ever your own launch; the grey is Part 1&rsquo;s.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              You will read the numbers behind the launches you watched in Part 1, with a plain reading of each and your guesses marked
              beside them. The tables never change with your guesses or with the mass you choose in Part 2. Only the pink line at the bottom
              follows your latest launch.
            </PartHeader>
            <Part3Results lightDone={lightDone} heavyDone={heavyDone} sweepDone={sweepDone} guesses={submitted} yours={part2Runs} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              You will talk over what you saw and why. The tutor points to your three white marks and the amber curve, then explains.
            </PartHeader>
            {allThree && submitted ? (
              <BlackHoleTutor
                lightGuess={submitted.light}
                heavyGuess={submitted.heavy}
                inBetweenGuess={submitted.inBetween}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            ) : (
              <p style={smallNote}>
                <strong>What to do next:</strong> the tutor starts when all three launches in Part 1 have run, because its questions are about all
                three launches and your three guesses. Launches watched: {done.length} of 3.
              </p>
            )}

            {explained && (
              <p style={{ marginTop: '1.5rem', fontSize: '0.9375rem' }}>
                <strong>That is the idea.</strong> Now meet the real ones: the black hole field guide is open below.
              </p>
            )}
          </>
        )}

        {explained && <BlackHoleFieldGuide />}
      </div>
    </div>
  )
}
