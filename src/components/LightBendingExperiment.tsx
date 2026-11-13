import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  aimSweep,
  AIM_MAX,
  AIM_MIN,
  AIM_STEP,
  fallsInEdge,
  flybySummary,
  guessMarkers,
  LIGHT_MASS,
  PART_ONE_AIMS,
  runLightBendingExperiment,
  workedNumbers,
} from '../physics/lightBendingExperiment'
import type { BendChoice, MoreLessSameChoice } from '../physics/lightBendingExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LightBendingResults } from './LightBendingResults'
import { LightBendingTutor } from './LightBendingTutor'
import { Block, CaptionBox, LookFor, WhereFrom, listStyle, smallNote } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 8, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/08-draft-wording.md,
// approved by the owner on 2026-11-13). Every number comes from the physics module; this file only draws and words it.

interface LightBendingExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const FIXED_COLOR = '#f59e0b' // amber: the simulated (ordinary-gravity) angle and Part 1's launches
const REAL_COLOR = '#34d399' // green: the real general relativity angle, calculated from a formula
const MASS_COLOR = '#fef08a' // pale yellow: the central mass
const HORIZON_COLOR = '#c4b5fd' // pale violet: the event horizon
const GREY = '#9ca3af' // grey: Part 1's passes shown again in Part 2, and the reference line

type Part1Key = 'far' | 'close' | 'sweep'
const PART1_KEYS: Part1Key[] = ['far', 'close', 'sweep']
const PART1_BUTTONS: Record<Part1Key, string> = {
  far: 'A far pass (aim 3.0)',
  close: 'A close pass (aim 1.0)',
  sweep: 'A slow sweep from far to close (aim 4.0 down to 0.8)',
}

const ANIMATION_DURATION_MS = 2500
const SWEEP_DURATION_MS = 4500

// ---- the top-view drawing: a window 8 units either side of the mass ----
const VIEW = 400
const WINDOW_HALF = 8
const PX = VIEW / 2 / WINDOW_HALF
const MASS_X = VIEW / 2
const MASS_Y = 250
const toX = (x: number) => MASS_X + x * PX
const toY = (y: number) => MASS_Y - y * PX
const HORIZON_RADIUS = (2 * LIGHT_MASS) / 4 // the event-horizon scale of Experiment 7 (speed of light 2): 0.5

const roundAim = (aim: number) => Math.round(aim * 10) / 10
const deg = (v: number | null, digits = 1) => (v === null ? 'n/a' : `${v.toFixed(digits)}°`)

interface PassData {
  aim: number
  points: Array<{ x: number; y: number }>
  complete: boolean
  degrees: number | null
  fell: boolean
}

// The part of a pass inside the drawing's window. The physics runs from x = -15 to x = 15; the drawing shows -8 to 8.
function visiblePoints(aim: number): Array<{ x: number; y: number }> {
  const r = runLightBendingExperiment(LIGHT_MASS, aim)
  return r.trajectory.filter((p) => p.x >= -WINDOW_HALF && p.x <= WINDOW_HALF).map((p) => ({ x: p.x, y: p.y }))
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

export interface FlybyDrawingProps {
  current: PassData | null
  color: string
  beamLabel: string
  references?: Array<{ label: string; aim: number; points: Array<{ x: number; y: number }>; dash?: string }>
  showHorizon: boolean
  guess1: BendChoice | null
  // Part 2 draws several paths in one window, so its labels go in a legend at the top left instead of beside each line.
  legend?: boolean
}

export function FlybyDrawing({ current, color, beamLabel, references = [], showHorizon, guess1, legend = false }: FlybyDrawingProps) {
  const aim = current?.aim ?? null
  const last = current && current.points.length > 0 ? current.points[current.points.length - 1] : null
  const prev = current && current.points.length > 1 ? current.points[current.points.length - 2] : null
  let rayEnd: { x: number; y: number } | null = null
  if (current && current.complete && !current.fell && last && prev) {
    const dx = last.x - prev.x
    const dy = last.y - prev.y
    const len = Math.hypot(dx, dy) || 1
    rayEnd = { x: last.x + (dx / len) * 2.2, y: last.y + (dy / len) * 2.2 }
  }
  const ringPoint = current && current.points.length > 0 ? (current.points.find((p) => p.x >= 3) ?? current.points[current.points.length - 1]) : null
  const toPoints = (pts: Array<{ x: number; y: number }>) => pts.map((p) => `${toX(p.x)},${toY(p.y)}`).join(' ')
  return (
    <svg
      width={VIEW}
      height={VIEW}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      style={svgStyle}
      role="img"
      aria-label="A view from above: a central mass, a dashed straight line showing where the light would go with no gravity, the aim distance, the path the light really takes, the light beam, the bend angle, the event horizon circle, and a white ring for your guess."
    >
      {aim !== null && (
        <>
          <line x1={toX(-WINDOW_HALF)} y1={toY(aim)} x2={toX(WINDOW_HALF)} y2={toY(aim)} stroke={GREY} strokeDasharray="5 4" strokeWidth={1.5} />
          {!legend && (
            <>
              <text x={toX(-WINDOW_HALF) + 6} y={toY(aim) + 16} fontSize="11" fill={GREY}>
                Where the light would go
              </text>
              <text x={toX(-WINDOW_HALF) + 6} y={toY(aim) + 29} fontSize="11" fill={GREY}>
                with no gravity
              </text>
            </>
          )}
          <line x1={toX(0)} y1={MASS_Y} x2={toX(0)} y2={toY(aim)} stroke={GREY} strokeWidth={1} strokeDasharray="2 3" />
          <text x={toX(0) - 6} y={(MASS_Y + toY(aim)) / 2 + 4} fontSize="12" fontWeight="bold" fill={TEXT_COLOR} textAnchor="end">
            Aim: {aim.toFixed(1)}
          </text>
        </>
      )}
      {showHorizon && (
        <>
          <circle cx={MASS_X} cy={MASS_Y} r={HORIZON_RADIUS * PX} fill="none" stroke={HORIZON_COLOR} strokeWidth={2} strokeDasharray="4 3" />
          <line x1={MASS_X - HORIZON_RADIUS * PX * 0.7} y1={MASS_Y + HORIZON_RADIUS * PX * 0.7} x2={90} y2={VIEW - 62} stroke={HORIZON_COLOR} strokeWidth={1} />
          <text x={10} y={VIEW - 46} fontSize="11" fill={HORIZON_COLOR}>
            Event horizon (radius {HORIZON_RADIUS.toFixed(1)})
          </text>
          <text x={10} y={VIEW - 33} fontSize="11" fill={HORIZON_COLOR}>
            A beam this close falls in
          </text>
        </>
      )}
      {references.map((r) => (
        <g key={r.label}>
          <polyline points={toPoints(r.points)} fill="none" stroke={GREY} strokeWidth={1.5} strokeDasharray={r.dash} opacity={0.9} />
          {!legend && (
            <text x={toX(r.points[r.points.length - 1].x) - 4} y={toY(r.points[r.points.length - 1].y) - 6} fontSize="10" fill={GREY} textAnchor="end">
              {r.label}
            </text>
          )}
        </g>
      ))}
      {current && current.points.length > 0 && <polyline points={toPoints(current.points)} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />}
      {rayEnd && last && (
        <>
          <line x1={toX(last.x)} y1={toY(last.y)} x2={toX(rayEnd.x)} y2={toY(rayEnd.y)} stroke={color} strokeWidth={1.5} strokeDasharray="2 3" />
          <text x={toX(WINDOW_HALF) - 6} y={toY(last.y) + 30} fontSize="12" fontWeight="bold" fill={color} textAnchor="end">
            Bent by {deg(current!.degrees)}
          </text>
        </>
      )}
      {current && current.complete && current.fell && (
        <text x={MASS_X} y={MASS_Y - 30} fontSize="12" fontWeight="bold" fill={color} textAnchor="middle">
          Fell into the mass
        </text>
      )}
      {legend && aim !== null && (
        <g>
          <line x1={10} y1={18} x2={34} y2={18} stroke={GREY} strokeWidth={1.5} strokeDasharray="5 4" />
          <text x={40} y={22} fontSize="11" fill={GREY}>
            Where the light would go with no gravity
          </text>
          <line x1={10} y1={34} x2={34} y2={34} stroke={color} strokeWidth={3} />
          <text x={40} y={38} fontSize="11" fill={color}>
            {beamLabel.replace('light beam', 'pass')} (aim {aim.toFixed(1)})
          </text>
          {references.map((r, i) => (
            <g key={r.label}>
              <line x1={10} y1={50 + i * 16} x2={34} y2={50 + i * 16} stroke={GREY} strokeWidth={1.5} strokeDasharray={r.dash} />
              <text x={40} y={54 + i * 16} fontSize="11" fill={GREY}>
                {r.label}
              </text>
            </g>
          ))}
        </g>
      )}
      <line x1={VIEW - 10 - PX} y1={32} x2={VIEW - 10} y2={32} stroke={TEXT_COLOR} strokeWidth={3} />
      <line x1={VIEW - 10 - PX} y1={27} x2={VIEW - 10 - PX} y2={37} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <line x1={VIEW - 10} y1={27} x2={VIEW - 10} y2={37} stroke={TEXT_COLOR} strokeWidth={1.5} />
      <text x={VIEW - 10 - PX / 2} y={22} fontSize="11" fill={TEXT_COLOR} textAnchor="middle">
        1 unit
      </text>
      <circle cx={MASS_X} cy={MASS_Y} r={4} fill={MASS_COLOR} />
      <text x={MASS_X - 8} y={MASS_Y + 26} fontSize="12" fill={TEXT_COLOR} textAnchor="end">
        Central mass
      </text>
      <line x1={MASS_X - 6} y1={MASS_Y + 20} x2={MASS_X - 2} y2={MASS_Y + 6} stroke={MUTED_COLOR} strokeWidth={1} />
      {last && (
        <>
          <circle cx={toX(last.x)} cy={toY(last.y)} r={5} fill={color} stroke="#0b1020" strokeWidth={1.5} />
          {!(current && current.complete) && (
            <text x={toX(last.x)} y={toY(last.y) - 12} fontSize="12" fontWeight="bold" fill={color} textAnchor="middle">
              {beamLabel}
            </text>
          )}
        </>
      )}
      {guess1 && ringPoint && (
        <g>
          <Ring cx={toX(ringPoint.x)} cy={toY(ringPoint.y)} />
          <line x1={toX(ringPoint.x) - 7} y1={toY(ringPoint.y) - 7} x2={125} y2={48} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={10} y={12} width={230} second={guess1 === 'yes' ? 'yes, it bends' : 'no, it stays straight'} />
        </g>
      )}
    </svg>
  )
}

// ---- the graph of bending angle against aim distance ----
const G = { width: 760, height: 432, left: 78, right: 30, top: 76, bottom: 64 }
const PLOT_W = G.width - G.left - G.right
const PLOT_H = G.height - G.top - G.bottom
const X_MAX = 4.3
const Y_MAX = 80
const xOf = (aim: number) => G.left + (aim / X_MAX) * PLOT_W
// The two YOUR GUESS boxes sit inside the plot's empty upper right.
const BOX_W = 190
const BOX_X = G.left + PLOT_W - BOX_W - 8
const BOX_Y3 = G.top + 6
const BOX_Y2 = G.top + 56
const yOf = (degrees: number) => G.top + PLOT_H - (degrees / Y_MAX) * PLOT_H

export interface BendGraphProps {
  farDone: boolean
  closeDone: boolean
  // The smallest aim the amber curve has reached (null for none, 0.8 for all of it).
  curveAim: number | null
  sweepDone: boolean
  guesses: { bent: BendChoice; closer: MoreLessSameChoice; real: MoreLessSameChoice } | null
  // The learner's own aims from Part 2, drawn as pink dots (the last one labelled).
  yours?: number[]
}

const CLOSER_BOX: Record<MoreLessSameChoice, string> = { more: 'closer bends more', less: 'closer bends less', same: 'closer, about the same' }
const REAL_BOX: Record<MoreLessSameChoice, string> = { more: 'real bends more', less: 'real bends less', same: 'real, exactly the same' }

export function BendGraph({ farDone, closeDone, curveAim, sweepDone, guesses, yours = [] }: BendGraphProps) {
  const sweep = useMemo(() => aimSweep(), [])
  const edge = useMemo(() => fallsInEdge(), [])
  const curve = curveAim === null ? [] : sweep.filter((p) => p.aim >= curveAim - 1e-9)
  const markers = guesses ? guessMarkers(guesses.bent, guesses.closer, guesses.real) : null
  const far = flybySummary(PART_ONE_AIMS.far)
  const close = flybySummary(PART_ONE_AIMS.close)
  const stripEnd = (edge.lastFallsIn + edge.firstPassesBy) / 2
  const yTicks = [0, 20, 40, 60, 80]
  const xTicks = [0, 1, 2, 3, 4]
  return (
    <svg
      width={G.width}
      height={G.height}
      viewBox={`0 0 ${G.width} ${G.height}`}
      style={svgStyle}
      role="img"
      aria-label="A graph of the bending angle in degrees against the aim distance, with an amber curve for the simulated angle, a green curve for the real general relativity angle, a grey strip where the light falls in, and white marks for your guesses."
    >
      <text x={G.left} y={22} fontSize="14" fontWeight="bold" fill={TEXT_COLOR}>
        Bending angle for each aim distance
      </text>
      <line x1={G.left} y1={G.top} x2={G.left} y2={G.top + PLOT_H} stroke={MUTED_COLOR} />
      <line x1={G.left} y1={G.top + PLOT_H} x2={G.left + PLOT_W} y2={G.top + PLOT_H} stroke={MUTED_COLOR} />
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={G.left - 4} y1={yOf(t)} x2={G.left} y2={yOf(t)} stroke={MUTED_COLOR} />
          <line x1={G.left} y1={yOf(t)} x2={G.left + PLOT_W} y2={yOf(t)} stroke={MUTED_COLOR} opacity={0.15} />
          <text x={G.left - 8} y={yOf(t) + 4} fontSize="11" fill={MUTED_COLOR} textAnchor="end">
            {t}°
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line x1={xOf(t)} y1={G.top + PLOT_H} x2={xOf(t)} y2={G.top + PLOT_H + 4} stroke={MUTED_COLOR} />
          <text x={xOf(t)} y={G.top + PLOT_H + 18} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      <text x={G.left + PLOT_W / 2} y={G.height - 14} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        Aim distance (relative units): how close the light would pass with no gravity
      </text>
      <text x={18} y={G.top + PLOT_H / 2} fontSize="12" fill={TEXT_COLOR} textAnchor="middle" transform={`rotate(-90 18 ${G.top + PLOT_H / 2})`}>
        Bending angle (degrees)
      </text>

      {sweepDone && (
        <g>
          <rect x={xOf(AIM_MIN)} y={G.top} width={xOf(stripEnd) - xOf(AIM_MIN)} height={PLOT_H} fill={GREY} opacity={0.18} />
          <text x={xOf(AIM_MIN) + 4} y={G.top + 14} fontSize="10" fill={GREY}>
            Falls in:
          </text>
          <text x={xOf(AIM_MIN) + 4} y={G.top + 26} fontSize="10" fill={GREY}>
            no bend
          </text>
        </g>
      )}

      {sweepDone && (
        <g>
          <polyline
            points={sweep.map((p) => `${xOf(p.aim)},${yOf(p.realFormulaDegrees)}`).join(' ')}
            fill="none"
            stroke={REAL_COLOR}
            strokeWidth={3}
          />
        </g>
      )}
      {curve.length > 1 && (
        <polyline points={curve.map((p) => `${xOf(p.aim)},${yOf(p.simulatedDegrees!)}`).join(' ')} fill="none" stroke={FIXED_COLOR} strokeWidth={3} />
      )}
      {sweepDone && (
        <g>
          <line x1={G.left} y1={52} x2={G.left + 24} y2={52} stroke={FIXED_COLOR} strokeWidth={3} />
          <text x={G.left + 30} y={56} fontSize="12" fontWeight="bold" fill={FIXED_COLOR}>
            Simulated: ordinary gravity
          </text>
          <line x1={G.left + 250} y1={52} x2={G.left + 274} y2={52} stroke={REAL_COLOR} strokeWidth={3} />
          <text x={G.left + 280} y={56} fontSize="12" fontWeight="bold" fill={REAL_COLOR}>
            Real universe: from the general relativity formula
          </text>
        </g>
      )}
      {farDone && (
        <g>
          <circle cx={xOf(far.aim)} cy={yOf(far.simulatedDegrees!)} r={6} fill={FIXED_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          {!sweepDone && (
            <text x={xOf(far.aim) + 9} y={yOf(far.simulatedDegrees!) - 8} fontSize="11" fill={FIXED_COLOR}>
              far pass: aim 3.0, {deg(far.simulatedDegrees)}
            </text>
          )}
        </g>
      )}
      {closeDone && (
        <g>
          <circle cx={xOf(close.aim)} cy={yOf(close.simulatedDegrees!)} r={6} fill={FIXED_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          {!sweepDone && (
            <text x={xOf(close.aim) + 9} y={yOf(close.simulatedDegrees!) - 8} fontSize="11" fill={FIXED_COLOR}>
              close pass: aim 1.0, {deg(close.simulatedDegrees)}
            </text>
          )}
        </g>
      )}

      {markers && sweepDone && (
        <g>
          {/* guess 2: a straight line whose direction is the guess; its leader goes up from the right end to the lower box */}
          <line
            x1={xOf(markers.closer.aimFrom)}
            y1={yOf(markers.closer.degreesFrom)}
            x2={xOf(markers.closer.aimTo)}
            y2={yOf(markers.closer.degreesTo)}
            stroke={GUESS_COLOR}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <line x1={xOf(markers.closer.aimFrom)} y1={yOf(markers.closer.degreesFrom) - 4} x2={BOX_X + 40} y2={BOX_Y2 + 36} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={BOX_X} y={BOX_Y2} width={BOX_W} second={CLOSER_BOX[guesses!.closer]} />
          {/* guess 3: a ring above, on or below the amber curve; its leader goes up and right to the upper box */}
          <Ring cx={xOf(markers.realVsOrdinary.aim)} cy={yOf(markers.realVsOrdinary.degrees)} />
          <line x1={xOf(markers.realVsOrdinary.aim) + 7} y1={yOf(markers.realVsOrdinary.degrees) - 7} x2={BOX_X} y2={BOX_Y3 + 18} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={BOX_X} y={BOX_Y3} width={BOX_W} second={REAL_BOX[guesses!.real]} />
        </g>
      )}

      {yours.map((aim, i) => {
        const s = flybySummary(aim)
        const isLast = i === yours.length - 1
        if (s.simulatedDegrees === null) {
          return (
            <g key={i}>
              <circle cx={xOf(aim)} cy={yOf(0)} r={isLast ? 8 : 5} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
              {isLast && (
                <text x={xOf(aim) + 10} y={yOf(0) - 10} fontSize="11" fontWeight="bold" fill={YOURS_COLOR}>
                  your aim {aim.toFixed(1)}: falls in
                </text>
              )}
            </g>
          )
        }
        return (
          <g key={i}>
            <circle cx={xOf(aim)} cy={yOf(s.simulatedDegrees)} r={isLast ? 8 : 5} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
            {isLast && (
              <text x={xOf(aim) + 10} y={yOf(s.simulatedDegrees) - 10} fontSize="11" fontWeight="bold" fill={YOURS_COLOR}>
                your aim {aim.toFixed(1)}: {deg(s.simulatedDegrees)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ---- captions: one under each picture, in Part 1 and in Part 2 ----
type Item = { look: string; means: string; matters: string }

function part1Items({ farDone, closeDone, sweepDone }: { farDone: boolean; closeDone: boolean; sweepDone: boolean }) {
  const far = flybySummary(PART_ONE_AIMS.far)
  const close = flybySummary(PART_ONE_AIMS.close)
  const sweep = aimSweep()
  const edge = fallsInEdge()
  const two = flybySummary(2)
  const drawingItems: Item[] = []
  const graphItems: Item[] = []
  if (farDone) {
    drawingItems.push({
      look: 'the amber path against the dashed line, in the drawing',
      means: `the amber line leaves the dashed line and turns toward the mass. At aim ${PART_ONE_AIMS.far.toFixed(1)} it turns by ${deg(far.simulatedDegrees)}.`,
      matters: 'it is the picture of the first question: the light does not stay on the dashed line it would follow with no gravity.',
    })
  }
  if (closeDone) {
    const times = Math.round(close.simulatedDegrees! / far.simulatedDegrees!)
    drawingItems.push({
      look: 'the aim 1.0 path against the aim 3.0 path',
      means: `at aim 1.0 the light turns by ${deg(close.simulatedDegrees)}, about ${times} times as much as at aim 3.0 (${deg(far.simulatedDegrees)}).`,
      matters: 'the aim changes the bend. The graph then shows the bend for every aim, not just two.',
    })
  }
  if (sweepDone) {
    drawingItems.push({
      look: 'the dashed violet circle and the aims that reach it',
      means: `from aim ${edge.firstPassesBy.toFixed(1)} up to 4.0 the light passes by; at ${edge.lastFallsIn.toFixed(1)} and closer it falls in.`,
      matters: 'it ties this experiment to Experiment 7: the closest passes are the ones gravity captures.',
    })
    graphItems.push({
      look: 'the amber curve as the aim gets smaller',
      means: `it rises from ${deg(sweep[0].simulatedDegrees)} at aim ${sweep[0].aim.toFixed(1)} to ${deg(sweep[sweep.length - 1].simulatedDegrees)} at aim ${sweep[sweep.length - 1].aim.toFixed(1)}.`,
      matters: 'it is the picture of the second question: the closer the light passes, the more it is bent, until it falls in.',
    })
    graphItems.push({
      look: 'the green curve against the amber curve',
      means: `at aim 2.0 the amber angle is ${deg(two.simulatedDegrees)} and the green angle is ${deg(two.realFormulaDegrees)}. The green curve is above the amber one at every aim.`,
      matters: 'it is the picture of the third question: the real-universe formula and ordinary gravity give different amounts. The tutor explains why.',
    })
    graphItems.push({
      look: 'the grey strip at the left',
      means: `below an aim of about ${((edge.lastFallsIn + edge.firstPassesBy) / 2).toFixed(2)} the light falls in, so the amber curve stops and there is no angle.`,
      matters: 'the bending stops being a bend and becomes a fall.',
    })
  }
  return { drawingItems, graphItems }
}

export function Part1DrawingCaption(props: { farDone: boolean; closeDone: boolean; sweepDone: boolean }) {
  const { drawingItems } = part1Items(props)
  const far = flybySummary(PART_ONE_AIMS.far)
  const close = flybySummary(PART_ONE_AIMS.close)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the drawing.</strong> It is a view from above, like looking down at a marble rolling past a heavy ball on a table. It
        shows one pass at a time.
      </p>
      <ul style={listStyle}>
        <li>The <strong>pale yellow dot</strong> is the central mass. It never moves.</li>
        <li>
          The <strong>dashed grey line</strong> is the straight path the light would take if gravity did nothing. The <strong>aim</strong> is how far that line is from the
          mass. It is the short dotted line labelled &ldquo;Aim: 3.0&rdquo;, measured from the middle of the yellow dot.
        </li>
        <li>
          <strong>How aim is counted.</strong> In &ldquo;units&rdquo;. A unit is just a length we chose as this page&rsquo;s measuring stick, like one square on graph paper. It has no real size: it is not a metre, a kilometre or a light-year. Only the comparison matters. Aim 3.0 means the dashed line is 3 of those lengths from the mass, and aim 1.0 means it is 1 length from the mass. The small bar at the bottom right of the drawing is 1 unit long, and the numbers along the bottom of the graph are aim values in the same units. So a bigger aim is a farther pass, and a smaller aim is a closer pass.
        </li>
        <li>The <strong>amber line</strong> is the path the light really takes, and the <strong>dot</strong> is the light beam as it moves. The drawing zooms in on the stretch of the path near the mass. The light really starts farther away.</li>
        <li><strong>&ldquo;Bent by …°&rdquo;</strong> is the angle between the dashed line and the path&rsquo;s last direction, measured a little after the light has passed the mass, once most of the bending has happened.</li>
        <li>
          The <strong>dashed violet circle</strong> marks how close is too close. Its edge is 0.5 units from the middle of the mass. If the light comes inside the circle, it falls
          into the mass. The light is pulled inward as it goes, so it can fall in even when its aim is a little bigger than 0.5. On this page, aims of 0.7 and smaller fall in.
        </li>
        <li>The <strong>white ring</strong> is your guess for &ldquo;does it bend at all&rdquo;. It is only a marker for yes or no: it does not show an amount.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked example of the aim.</strong> Imagine rolling a ball in a straight line past a post. If the ball would pass 3 units from the post, the aim is 3.0. That is the
        far pass. If you roll it again so that it would pass 1 unit from the post, the aim is 1.0. That is the close pass, three times closer. Now add gravity. The post pulls on
        the ball, and the real path (the amber line) bends toward it.{' '}
        {props.closeDone
          ? `The far pass (aim 3.0) turned by ${deg(far.simulatedDegrees)} and the close pass (aim 1.0) by ${deg(close.simulatedDegrees)}.`
          : `The far pass (aim 3.0) turned by ${deg(far.simulatedDegrees)}. Run the close pass (aim 1.0) to see how much it turns.`}
      </p>
      {drawingItems.length > 0 ? (
        <LookFor items={drawingItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> in the drawing appears here as each pass finishes.
        </p>
      )}
    </CaptionBox>
  )
}

export function Part1GraphCaption(props: { farDone: boolean; closeDone: boolean; sweepDone: boolean }) {
  const { graphItems } = part1Items(props)
  const two = workedNumbers(2)
  const four = workedNumbers(4)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the graph.</strong> It shows how much the light is bent for each aim distance. It is built from the same numbers as the drawing.
      </p>
      <ul style={listStyle}>
        <li>Along the bottom is the <strong>aim distance</strong> in relative, made-up units, so only comparisons matter. Up the side is the <strong>bending angle</strong> in degrees.</li>
        <li>The <strong>amber dots and curve</strong> are the simulated angle, calculated here by stepping ordinary gravity forward. The first pass puts one dot on the graph, the second a second dot, and the third draws the curve as the aim goes from 4.0 down to 0.8.</li>
        <li>The <strong>green curve</strong> is the angle for the real universe, calculated from the general relativity formula, not measured. It appears when the amber curve is finished.</li>
        <li>The <strong>grey strip</strong> at the left is where the light falls in, so there is no angle.</li>
        <li>Your guesses are the <strong>white marks</strong>, each in a box marked YOUR GUESS. For the second question only the <strong>direction</strong> of the white line is your guess: it slopes up toward the close end for &ldquo;more&rdquo;, down for &ldquo;less&rdquo; and is flat for &ldquo;about the same&rdquo;. Its size means nothing. For the third question the white ring sits above, on or below the amber curve, and its height means nothing.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What happens, in order.</strong> Each pass plays in the drawing and puts amber on the graph. The green curve and your white marks for the second and third questions are drawn when the third pass has finished.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> At aim 2.0 the ordinary-gravity formula gives 2 × 1 ÷ (2 × 2 × 2) = {two.ordinaryFormulaRadians.toFixed(2)} of a unit of angle
        (a radian), and one radian is 57.3°, so {two.ordinaryFormulaRadians.toFixed(2)} × 57.3 = {deg(two.ordinaryFormulaDegrees)}.
        At aim 4.0 the formula gives {deg(four.ordinaryFormulaDegrees)}.
        {props.sweepDone
          ? ` The stepped path gives ${deg(two.simulatedDegrees)} at aim 2.0 and ${deg(four.simulatedDegrees)} at aim 4.0.`
          : ' The stepped path for these aims appears here after the third pass.'}
      </p>
      {graphItems.length > 0 ? (
        <LookFor items={graphItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> in the graph appears here once the third pass has finished.
        </p>
      )}
    </CaptionBox>
  )
}

function part2Items(yours: number[], sweepDone: boolean) {
  const drawingItems: Item[] = []
  const graphItems: Item[] = []
  const latest = yours.length > 0 ? yours[yours.length - 1] : null
  const summary = latest !== null ? flybySummary(latest) : null
  const far = flybySummary(PART_ONE_AIMS.far)
  const close = flybySummary(PART_ONE_AIMS.close)
  if (summary && latest !== null) {
    if (summary.simulatedDegrees !== null) {
      drawingItems.push({
        look: 'your pink path against the grey paths from Part 1',
        means: `your aim ${latest.toFixed(1)} turns by ${deg(summary.simulatedDegrees)}. Part 1's aim 3.0 turned by ${deg(far.simulatedDegrees)} and aim 1.0 by ${deg(close.simulatedDegrees)}.`,
        matters: 'a smaller aim gives a bigger turn, as in Part 1, now for an aim you chose.',
      })
      graphItems.push({
        look: 'your pink dot on the graph',
        means: `it sits at your aim, ${latest.toFixed(1)}, and at the simulated angle for that aim, ${deg(summary.simulatedDegrees)}. Each new pass adds a dot, and the newest is the big one with a label.`,
        matters: 'moving the slider moves the dot, so you can find the pattern for yourself.',
      })
      if (sweepDone) {
        graphItems.push({
          look: 'your pink dot, against the amber curve',
          means: 'every pink dot lands on the amber curve, whatever aim you choose, because the curve is the simulated angle at every aim.',
          matters: 'it shows that the curve is not only for the three passes in Part 1: it is the answer for any aim you can try.',
        })
      }
    } else {
      drawingItems.push({
        look: 'your pink path and the violet circle',
        means: `your aim ${latest.toFixed(1)} is inside the zone where the light falls in, so the pink path ends at the mass.`,
        matters: 'it is the same boundary as Part 1 showed, found for an aim you chose.',
      })
      graphItems.push({
        look: 'your pink dot on the bottom edge of the graph',
        means: `at aim ${latest.toFixed(1)} the light falls in, so there is no angle to plot. The dot sits on the zero line.`,
        matters: 'it marks the aims where gravity captures the light instead of bending it.',
      })
    }
  }
  const bends = yours.filter((a) => flybySummary(a).simulatedDegrees !== null)
  if (bends.length >= 2) {
    graphItems.push({
      look: 'your pink dots, one against another',
      means: 'a smaller aim gives a dot higher up, which means a bigger bend.',
      matters: 'it shows how the bend grows as the light passes closer.',
    })
  }
  return { drawingItems, graphItems, latest, summary }
}

export function Part2DrawingCaption({ yours, sweepDone }: { yours: number[]; sweepDone: boolean }) {
  const { drawingItems } = part2Items(yours, sweepDone)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the drawing.</strong> It is the drawing of Part 1 again, a view from above, now showing your own passes in pink. Part 1&rsquo;s passes stay in grey for comparison.
      </p>
      <ul style={listStyle}>
        <li>
          The <strong>pale yellow dot</strong> is the central mass. The <strong>dashed grey line</strong> is the straight path your light would take with no gravity. The <strong>aim</strong>{' '}
          is how far that line is from the mass, counted in units, a length we chose as this page&rsquo;s measuring stick (not metres or kilometres). A smaller aim is a closer pass.
        </li>
        <li>The <strong>pink line</strong> is your path, the <strong>pink dot</strong> is your light beam, and &ldquo;Bent by …°&rdquo; is the angle between the dashed line and your path&rsquo;s last direction.</li>
        <li>The <strong>grey paths</strong> are the passes you watched in Part 1; each is named beside it.</li>
        <li>
          The <strong>dashed violet circle</strong> is 0.5 units from the middle of the mass. If the light comes inside it, the light falls in. The light is pulled inward as it goes, so aims
          of 0.7 and smaller fall in.
        </li>
      </ul>
      {drawingItems.length > 0 ? (
        <LookFor items={drawingItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> in the drawing appears here after your first pass.
        </p>
      )}
    </CaptionBox>
  )
}

export function Part2GraphCaption({ yours, sweepDone }: { yours: number[]; sweepDone: boolean }) {
  const { graphItems, latest, summary } = part2Items(yours, sweepDone)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the graph.</strong> It is the graph of Part 1, with your passes added. The <strong>amber curve and dots</strong> and the <strong>green curve</strong> are from Part 1, once they have been drawn there. The <strong>pink dots</strong> are your passes.
      </p>
      {summary && latest !== null && (
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>A worked moment, from your latest pass.</strong> Your aim was {latest.toFixed(1)}. The ordinary-gravity formula gives 2 × 1 ÷ (2 × 2 × {latest.toFixed(1)}) ={' '}
          {summary.ordinaryFormulaRadians.toFixed(3)} of a unit of angle, which is {deg(summary.ordinaryFormulaDegrees)}.{' '}
          {summary.simulatedDegrees !== null
            ? `The stepped path gave ${deg(summary.simulatedDegrees)}, and the real-universe formula gives ${deg(summary.realFormulaDegrees)}, twice the ordinary value.`
            : 'At this aim the light falls in, so there is no stepped angle to compare.'}
        </p>
      )}
      {graphItems.length > 0 ? (
        <LookFor items={graphItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> and a worked moment appear here after your first pass.
        </p>
      )}
    </CaptionBox>
  )
}

// ---- the introduction (no answers: §12) ----
function Intro() {
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>The question.</strong> Experiment 7, &ldquo;What is a black hole?&rdquo;, showed that light aimed straight at a massive enough object can&rsquo;t escape it. But
        what about light that isn&rsquo;t aimed at the mass at all, light that just happens to pass nearby? Does gravity do anything to it?
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>What happens.</strong> You will guess three things, then watch light pass a fixed mass three times. Each time, you will see how closely the light passes, its
        &ldquo;aim&rdquo;: how close it would come if gravity did nothing at all. A graph fills in as you watch. Then you can choose an aim of your own.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>Your job.</strong> Guess first. Then watch what the light does, and what the graph shows. Then try your own aim and compare.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or the numbers. They are drawn on the pictures in white, in a box
        marked YOUR GUESS, and shown again beside the results. The aim you choose in Part 2 does change the drawing and the graph, because it is a real setting. Your guesses do not.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>Words first.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Aim</strong> (aim distance): how close the light would pass to the mass if gravity did nothing. Picture rolling a ball in a straight line past a post. The aim is
          how far from the post the ball would pass. A small aim is a close pass, and a big aim is a far pass. Aim is counted in &ldquo;units&rdquo;. A unit is just a length we chose as this page&rsquo;s
          measuring stick, like one square on graph paper. It is not in metres, kilometres or light-years. Aim 3 means 3 units from the mass, and aim 1 means 1 unit. So aim 3 is three times as far away as aim 1.
        </li>
        <li><strong>Ordinary gravity</strong>: the pull between masses you met in Experiments 1 to 7, the same pull that makes a ball fall. This page&rsquo;s animation uses it.</li>
        <li><strong>Relative units</strong>: the mass, the distances and the speed of light on this page are made-up amounts, so only comparisons matter. The speed of light here is 2.</li>
        <li><strong>The speed of light</strong>: the fastest speed anything can have. Experiment 5 of &ldquo;Relativity of Time and Motion&rdquo; showed that nothing can go faster.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>The animation uses ordinary gravity, treating the light as a very fast small object, not the exact general relativity a real light beam needs.</li>
        <li>The mass, the distances and the speed of light are relative, made-up amounts. The angles on this page are therefore not the real bending angle of real starlight.</li>
        <li>There is only one mass, and it does not move.</li>
        <li>The angle is measured a little after the light has passed the mass, so it is nearly, but not exactly, its final angle.</li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each term with a short meaning.
      </p>
    </div>
  )
}

// ---- the words box ----
function referenceEntries(firstDone: boolean, explained: boolean): { term: string; meaning: string }[] {
  const entries = [
    {
      term: 'Aim (aim distance)',
      meaning:
        'how close the light would pass to the mass if gravity did nothing. It is counted in “units”: a unit is a length we chose as this page’s measuring stick, like one square on graph paper. It is not in metres, kilometres or light-years. Aim 3 is three times as far from the mass as aim 1.',
    },
    { term: 'Bend (deflection)', meaning: 'the angle between the dashed line and the direction the light is travelling in at the end.' },
    { term: 'Ordinary gravity', meaning: 'the pull between masses you met in Experiments 1 to 7, the same pull that makes a ball fall.' },
    { term: 'Relative units', meaning: 'numbers that only compare things (this is twice that) instead of real kilometres or kilograms.' },
    { term: 'Speed of light', meaning: 'the fastest speed anything can have. In this page’s made-up units it is 2.' },
    {
      term: 'Event horizon (from Experiment 7)',
      meaning: 'the distance from a mass at which even light cannot escape. For this page’s mass it is 0.5.',
    },
  ]
  if (firstDone) {
    entries.push({
      term: 'Ordinary-gravity formula',
      meaning:
        'bend (in radians, the angle measure the formula uses; 1 radian is 57.3°) = 2 × mass ÷ (speed of light squared × aim). With mass 1 and the speed of light 2, at aim 2: 2 × 1 ÷ (4 × 2) = 0.25, which is 14.3°.',
    })
  } else {
    entries.push({
      term: 'More words',
      meaning: 'the ordinary-gravity formula appears here after your first pass. More terms appear after the tutor’s explanation, because they would give away what you are about to guess.',
    })
  }
  if (explained) {
    entries.push(
      {
        term: 'Real-universe formula',
        meaning: 'bend = 4 × mass ÷ (speed of light squared × aim), twice the ordinary one. At aim 2 on this page: 4 × 1 ÷ (4 × 2) = 0.5 radian, which is 28.6°.',
      },
      {
        term: 'General relativity',
        meaning: 'Einstein’s theory of gravity (1915). It describes gravity as the curving of space and time, and it is what the real-universe formula comes from.',
      },
      {
        term: 'Gravitational lensing',
        meaning: 'the bending of light from a distant object as it passes a massive object on its way to us, so that the massive object acts like a lens.',
      },
      { term: 'Arcsecond', meaning: 'a tiny angle: 1/3600 of a degree.' }
    )
  }
  return entries
}

const START_NOTE =
  'Plain pages and the original sources are listed after the tutor, because each of them says whether and how light bends, which is what you are about to guess.'

const LINKS: Array<{ href: string; label: string; what: string }> = [
  {
    href: 'https://esahubble.org/science/gravitational_lensing/',
    label: 'ESA/Hubble: "Spyglasses into the Universe: gravitational lenses"',
    what: 'a plain explanation of how a massive cluster of galaxies bends the light of galaxies behind it into several images, arcs and rings, how that is used to "weigh" clusters and map dark matter, and how it shows very distant galaxies. (ESA/Hubble; no date shown.)',
  },
  {
    href: 'https://www.jpl.nasa.gov/news/euclid-discovers-einstein-ring-in-our-cosmic-backyard/',
    label: 'NASA JPL: "Euclid Discovers Einstein Ring in Our Cosmic Backyard"',
    what: 'a news release about a real Einstein ring, light from a distant galaxy bent into a ring around a nearer one. It is about one discovery, not a general explainer. (NASA Jet Propulsion Laboratory, 10 February 2025.)',
  },
  {
    href: 'https://physicstoday.aip.org/features/testing-relativity-from-the-1919-eclipse-a-question-of-bias',
    label: 'Physics Today: "Testing relativity from the 1919 eclipse: a question of bias"',
    what: 'a historian-physicist\'s article on the 1919 eclipse test, with the two predictions for light grazing the Sun, about 0.87 and about 1.75 arcseconds. It is a magazine article, not an agency page. (Daniel Kennefick, 1 March 2009.)',
  },
  {
    href: 'https://www.rmg.co.uk/stories/space-astronomy/1919-solar-eclipse',
    label: 'Royal Museums Greenwich: "The 1919 solar eclipse"',
    what: 'a plain account of the eclipse expedition and what was measured: a deflection of a little under 2 arcseconds. (Royal Museums Greenwich; no date shown.)',
  },
  {
    href: 'https://blog.sciencemuseum.org.uk/a-date-to-remember-relatively-speaking',
    label: 'Science Museum Group blog: "A date to remember, relatively speaking"',
    what: 'a short account of the 1919 expedition, why the smaller telescope at Sobral gave the decisive photographs, and the factor of two between the two predictions. It is a museum blog. (Science Museum Group, 29 May 2019.)',
  },
]

// ---- the "run all three" notice: bold, above the Run button, so a learner does not forget the later passes ----
export function RunAllNotice({ done, selected, isRunning }: { done: Part1Key[]; selected: Part1Key; isRunning: boolean }) {
  const count = done.length
  const finished = count === 3
  const accent = finished ? '#15803d' : '#d97706'
  const left = 3 - count
  const heading = finished
    ? 'All 3 passes are done'
    : count === 0
      ? 'Run all three passes'
      : `${count} of 3 passes done. ${left} more to run`
  return (
    <div
      role="status"
      style={{
        marginTop: '0.75rem',
        marginBottom: '0.75rem',
        padding: '0.4rem 0.7rem',
        border: `1px solid ${accent}`,
        borderRadius: '8px',
        backgroundColor: finished ? '#f0fdf4' : '#fffbeb',
        color: '#1f2937',
      }}
    >
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 'bold', color: accent }}>
        {finished ? '✓ ' : '⚠ '}
        {heading}
      </p>
      <p style={{ margin: '0 0 0.35rem', fontSize: '0.75rem' }}>
        {finished ? (
          <>The graph is complete, your white marks are drawn, and the tutor is open in Part 4.</>
        ) : (
          <>
            <strong>Press Run {count === 0 ? 'three times' : 'again'}, once for each pass.</strong> The Run button moves to the next pass by itself. You need all three: the full graph, your
            white marks for questions 2 and 3, and the tutor only appear when all three passes have run.
          </>
        )}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {PART1_KEYS.map((key, i) => {
          const isDone = done.includes(key)
          const isNext = !isDone && key === selected
          return (
            <span
              key={key}
              style={{
                padding: '0.1rem 0.5rem',
                borderRadius: '999px',
                fontSize: '0.6875rem',
                fontWeight: 'bold',
                border: `2px solid ${isDone ? '#15803d' : '#d97706'}`,
                backgroundColor: isDone ? '#15803d' : isNext ? '#fde68a' : '#ffffff',
                color: isDone ? '#ffffff' : '#7c2d12',
              }}
            >
              {isDone ? '✓ ' : `${i + 1}. `}
              {key === 'far' ? 'Far pass' : key === 'close' ? 'Close pass' : 'Slow sweep'}
              {isNext ? (isRunning ? ' (running)' : ' (next)') : ''}
            </span>
          )
        })}
      </div>
    </div>
  )
}

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
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{guessText ? `Your guess: ${guessText}` : 'Choose an option to continue'}</p>
    </div>
  )
}

const yesNoOptions: Array<{ value: BendChoice; label: string }> = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]
const closerOptions: Array<{ value: MoreLessSameChoice; label: string }> = [
  { value: 'more', label: 'More' },
  { value: 'less', label: 'Less' },
  { value: 'same', label: 'About the same' },
]
const realOptions: Array<{ value: MoreLessSameChoice; label: string }> = [
  { value: 'more', label: 'More' },
  { value: 'less', label: 'Less' },
  { value: 'same', label: 'Exactly the same' },
]
const moreLessText = (c: MoreLessSameChoice, same: string) => (c === 'more' ? 'More' : c === 'less' ? 'Less' : same)

interface ActiveRun {
  key: Part1Key | 'part2'
  aim?: number
}
type RunStatus = 'idle' | 'running' | 'complete'

export function LightBendingExperiment({ onComplete, onTutorComplete }: LightBendingExperimentProps) {
  const [bentGuess, setBentGuess] = useState<BendChoice | null>(null)
  const [closerGuess, setCloserGuess] = useState<MoreLessSameChoice | null>(null)
  const [realGuess, setRealGuess] = useState<MoreLessSameChoice | null>(null)
  const [submitted, setSubmitted] = useState<{ bent: BendChoice; closer: MoreLessSameChoice; real: MoreLessSameChoice } | null>(null)

  const [selected, setSelected] = useState<Part1Key>('far')
  const [done, setDone] = useState<Part1Key[]>([])
  const [active, setActive] = useState<ActiveRun | null>(null)
  const [shownKey, setShownKey] = useState<Part1Key | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<RunStatus>('idle')
  const [sliderAim, setSliderAim] = useState(2)
  const [part2Runs, setPart2Runs] = useState<number[]>([])
  const [explained, setExplained] = useState(false)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const isRunning = status === 'running'
  const allThree = done.length === 3
  const firstDone = done.length >= 1
  const hasAllGuesses = bentGuess !== null && closerGuess !== null && realGuess !== null
  const locked = submitted !== null
  const shownBent = submitted?.bent ?? bentGuess
  const shownCloser = submitted?.closer ?? closerGuess
  const shownReal = submitted?.real ?? realGuess

  const farPoints = useMemo(() => visiblePoints(PART_ONE_AIMS.far), [])
  const closePoints = useMemo(() => visiblePoints(PART_ONE_AIMS.close), [])
  // The slow sweep: the aim follows the progress, in steps of 0.1.
  const sweepAim = roundAim(PART_ONE_AIMS.sweepStart - progress * (PART_ONE_AIMS.sweepStart - PART_ONE_AIMS.sweepEnd))
  const sweepPoints = useMemo(() => visiblePoints(sweepAim), [sweepAim])

  // One animation per run: a fixed real duration that does not depend on how much simulated time the pass covers (CLAUDE.md §11).
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
          if (active.aim !== undefined) setPart2Runs((list) => [...list, active.aim!])
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
    if (!submitted) setSubmitted({ bent: bentGuess!, closer: closerGuess!, real: realGuess! })
    setActive({ key: selected })
    setShownKey(selected)
    setProgress(0)
    setStatus('running')
  }

  const handleRunPart2 = () => {
    if (isRunning) return
    setActive({ key: 'part2', aim: sliderAim })
    setProgress(0)
    setStatus('running')
  }

  // Start over: clears the guesses, the runs and the results, and returns the page to its first state.
  const handleStartOver = () => {
    setBentGuess(null)
    setCloserGuess(null)
    setRealGuess(null)
    setSubmitted(null)
    setSelected('far')
    setDone([])
    setActive(null)
    setShownKey(null)
    setProgress(0)
    setStatus('idle')
    setSliderAim(2)
    setPart2Runs([])
    setExplained(false)
  }

  const hasAnythingToClear = bentGuess !== null || closerGuess !== null || realGuess !== null || locked || done.length > 0 || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || isRunning

  // What the Part 1 drawing shows: the pass being played, or the last one that finished.
  const playing1 = status === 'running' && active && active.key !== 'part2' ? active.key : null
  let pass1: PassData | null = null
  if (shownKey) {
    const aim = shownKey === 'far' ? PART_ONE_AIMS.far : shownKey === 'close' ? PART_ONE_AIMS.close : playing1 === 'sweep' ? sweepAim : PART_ONE_AIMS.sweepEnd
    const all = shownKey === 'far' ? farPoints : shownKey === 'close' ? closePoints : playing1 === 'sweep' ? sweepPoints : visiblePoints(PART_ONE_AIMS.sweepEnd)
    const summary = flybySummary(aim)
    const animating = playing1 !== null && shownKey !== 'sweep'
    const count = animating ? Math.max(1, Math.round(progress * (all.length - 1)) + 1) : all.length
    pass1 = {
      aim,
      points: all.slice(0, count),
      complete: !animating,
      degrees: summary.simulatedDegrees,
      fell: summary.outcome === 'falls-in',
    }
  }

  // Part 2's drawing: the pass being played, or the learner's latest finished pass.
  const part2Playing = status === 'running' && active?.key === 'part2' ? active : null
  const lastPart2Aim = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const part2Aim = part2Playing?.aim ?? lastPart2Aim
  const part2All = useMemo(() => (part2Aim !== null ? visiblePoints(part2Aim) : []), [part2Aim])
  let pass2: PassData | null = null
  if (part2Aim !== null) {
    const s = flybySummary(part2Aim)
    const count = part2Playing ? Math.max(1, Math.round(progress * (part2All.length - 1)) + 1) : part2All.length
    pass2 = { aim: part2Aim, points: part2All.slice(0, count), complete: !part2Playing, degrees: s.simulatedDegrees, fell: s.outcome === 'falls-in' }
  }
  const part2Reference = [
    ...(done.includes('far') ? [{ label: 'Part 1: aim 3.0', aim: PART_ONE_AIMS.far, points: farPoints }] : []),
    ...(done.includes('close') ? [{ label: 'Part 1: aim 1.0', aim: PART_ONE_AIMS.close, points: closePoints, dash: '2 3' }] : []),
  ]

  const sweepDone = done.includes('sweep')
  const farDone = done.includes('far')
  const closeDone = done.includes('close')
  const curveAim = sweepDone ? PART_ONE_AIMS.sweepEnd : playing1 === 'sweep' ? sweepAim : null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 8 — Does Gravity Bend Light?</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <Intro />

        <ReferencePanel entries={referenceEntries(firstDone, explained)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0 }}>
            <strong>Want to know more?</strong> {START_NOTE}
          </p>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          You will guess three things about light that passes near a mass. Then you will watch the light pass three times, and a graph will fill in. Nothing you guess
          changes what the light does.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.75rem' }}>Make your predictions</p>
          <Question
            prompt="Does light aimed to pass near the mass, but not directly at it, get bent from a straight line at all?"
            guessText={shownBent ? (shownBent === 'yes' ? 'Yes' : 'No') : null}
          >
            <ChoiceButtons options={yesNoOptions} selected={shownBent} disabled={locked || isRunning} onSelect={setBentGuess} />
          </Question>
          <Question
            prompt="Does aiming closer to the mass bend the light more, less, or about the same amount?"
            guessText={shownCloser ? moreLessText(shownCloser, 'About the same') : null}
          >
            <ChoiceButtons options={closerOptions} selected={shownCloser} disabled={locked || isRunning} onSelect={setCloserGuess} />
          </Question>
          <Question
            prompt="Compared to what ordinary gravity alone would predict, do you think the real universe bends starlight by more, less, or exactly the same amount?"
            guessText={shownReal ? moreLessText(shownReal, 'Exactly the same') : null}
          >
            <ChoiceButtons options={realOptions} selected={shownReal} disabled={locked || isRunning} onSelect={setRealGuess} />
          </Question>
          {locked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your predictions are locked while you try other settings. To change them, press Start over.
            </p>
          )}
        </div>

        <RunAllNotice done={done} selected={selected} isRunning={isRunning} />

        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Choose a pass to watch</p>
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
        {!hasAllGuesses && !locked && <p style={smallNote}>Answer all three questions above to run the passes.</p>}

        <Block>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 320px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The drawing (view from above)</p>
              <FlybyDrawing current={pass1} color={FIXED_COLOR} beamLabel="Light beam" showHorizon={shownKey !== null} guess1={shownKey !== null ? (submitted?.bent ?? null) : null} />
              {pass1 && (
                <p style={{ ...smallNote, marginTop: '0.5rem' }}>
                  Aim <strong>{pass1.aim.toFixed(1)}</strong>:{' '}
                  {pass1.complete ? (pass1.fell ? 'the light falls into the mass.' : `the light is bent by ${deg(pass1.degrees)}.`) : 'the light is passing the mass.'}
                </p>
              )}
              {firstDone && <Part1DrawingCaption farDone={farDone} closeDone={closeDone} sweepDone={sweepDone} />}
            </div>
            <div style={{ flex: '2 1 420px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Bending angle for each aim distance</p>
              <BendGraph farDone={farDone} closeDone={closeDone} curveAim={curveAim} sweepDone={sweepDone} guesses={submitted} />
              {firstDone && <Part1GraphCaption farDone={farDone} closeDone={closeDone} sweepDone={sweepDone} />}
            </div>
          </div>
        </Block>

        {firstDone ? (
          <Block>
            <WhereFrom>
              <strong>Calculated here:</strong> every path and every amber point, by stepping ordinary gravity forward in very small time steps, and the green curve,
              from the general relativity formula for the bending angle. <strong>Measured:</strong> nothing on this page. Real light has been measured bending near
              the Sun (see the tutor&rsquo;s explanation and the links after it). <strong>Imagined for the question:</strong> the mass, the aim distances and the speed
              of light of 2, all in relative units, and the event-horizon circle, which is borrowed from Experiment 7&rsquo;s idea. White is only ever your guess.
            </WhereFrom>
          </Block>
        ) : (
          <p style={smallNote}>
            After you press Run, the light passes the mass in the drawing and the graph starts to fill in. Watch all three passes to see the full picture.
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {firstDone && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              You will choose an aim distance of your own and watch the light pass. Your path is drawn in pink, with Part 1&rsquo;s paths in grey, and a pink dot lands on the
              graph.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="light-bending-aim" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Aim distance: {sliderAim.toFixed(1)}
              </label>
              <input
                id="light-bending-aim"
                type="range"
                min={AIM_MIN}
                max={AIM_MAX}
                step={AIM_STEP}
                value={sliderAim}
                disabled={isRunning}
                onChange={(event) => setSliderAim(Number(event.target.value))}
                style={{ width: '100%' }}
              />
              <p style={smallNote}>
                Aim 0.3 to 0.7 falls into the mass, so there is no bend to measure there. Aim is counted in units, a length we chose as this page&rsquo;s measuring stick (not metres or kilometres), from the middle of the mass. A small aim is a close pass. Your guesses do not change the drawings or
                tables, but this setting does. Press Start over to change a guess.
              </p>
              <button type="button" className="action-button" onClick={handleRunPart2} disabled={isRunning} style={{ marginTop: '0.5rem', padding: '0.6rem 1.5rem' }}>
                {part2Playing ? 'Launching...' : 'Launch with my aim'}
              </button>
              {!allThree && (
                <p style={smallNote}>
                  Part 1 passes watched: {done.length} of 3. Watch the rest in Part 1 to fill in the full graph and the grey comparison paths below.
                </p>
              )}
            </div>
            <Block>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 320px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your pass (view from above)</p>
                  <FlybyDrawing current={pass2} color={YOURS_COLOR} beamLabel="Your light beam" references={part2Reference} showHorizon={part2Aim !== null} guess1={null} legend />
                  <Part2DrawingCaption yours={part2Runs} sweepDone={sweepDone} />
                </div>
                <div style={{ flex: '2 1 420px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Bending angle for each aim distance</p>
                  <BendGraph farDone={farDone} closeDone={closeDone} curveAim={sweepDone ? PART_ONE_AIMS.sweepEnd : null} sweepDone={sweepDone} guesses={null} yours={part2Runs} />
                  <Part2GraphCaption yours={part2Runs} sweepDone={sweepDone} />
                </div>
              </div>
            </Block>
            {part2Runs.length === 0 && (
              <p style={smallNote}>Choose an aim and press &ldquo;Launch with my aim&rdquo;. Your light is drawn in pink, and a pink dot appears on the graph.</p>
            )}
            {part2Runs.length > 0 && (
              <Block>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Runs so far</p>
                <ul style={listStyle}>
                  {part2Runs.map((a, i) => {
                    const r = flybySummary(a)
                    return (
                      <li key={i} style={{ fontSize: '0.875rem' }}>
                        Aim <strong>{a.toFixed(1)}</strong>:{' '}
                        {r.simulatedDegrees === null
                          ? 'the light falls into the mass; no angle to measure.'
                          : `simulated ${deg(r.simulatedDegrees)}; ordinary-gravity formula ${deg(r.ordinaryFormulaDegrees)}; real-universe formula ${deg(r.realFormulaDegrees)}.`}
                      </li>
                    )
                  })}
                </ul>
              </Block>
            )}
            <Block>
              <WhereFrom>
                <strong>Calculated here:</strong> your pass and your dot on the graph, in the same way as Part 1&rsquo;s. <strong>Measured:</strong> nothing.{' '}
                <strong>Imagined for the question:</strong> the aim you choose, the mass and the speed of light of 2, all in relative units. Pink is only ever your own
                pass; the grey is Part 1&rsquo;s.
              </WhereFrom>
            </Block>

            {/* ===== Part 3 ===== */}
            <PartHeader color="#0f766e" title="Part 3: The results">
              You will read the numbers behind the passes you watched, and a check-up of those numbers against themselves and against the Sun. The tables never change with
              your guesses or with the aim you choose in Part 2. Only the pink line at the bottom follows your latest pass.
            </PartHeader>
            <LightBendingResults farDone={farDone} closeDone={closeDone} sweepDone={sweepDone} guesses={submitted} yours={part2Runs} />

            {/* ===== Part 4 ===== */}
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              You will talk over what you saw and why. The tutor points to your three white marks, the amber curve and the green curve, then explains.
            </PartHeader>
            {allThree && submitted ? (
              <LightBendingTutor
                bentGuess={submitted.bent}
                closerGuess={submitted.closer}
                realGuess={submitted.real}
                onExplained={() => {
                  setExplained(true)
                  onTutorComplete?.()
                }}
              />
            ) : (
              <p style={smallNote}>
                <strong>What to do next:</strong> the tutor starts when all three passes in Part 1 have run, because its questions are about all three passes and your three
                guesses. Passes watched: {done.length} of 3.
              </p>
            )}
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Want to know more?</p>
                <p style={{ ...smallNote, marginTop: 0 }}>
                  Each link opens in a new tab. They are listed here, after the tutor, because each one says whether and how light bends. They were read through
                  summaries on 2026-11-13, so a quotation on this page should be checked against the live page. The original 1920 report of the eclipse measurement (Dyson,
                  Eddington and Davidson, Philosophical Transactions of the Royal Society A) is not linked: its page could not be opened for reading.
                </p>
                <ul style={listStyle}>
                  {LINKS.map((l) => (
                    <li key={l.href} style={{ marginBottom: '0.5rem' }}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                      : {l.what}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
