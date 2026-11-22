import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { EnergyMomentumCollisionTutor } from './EnergyMomentumCollisionTutor'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'
import {
  SECTION_B_PASSING_SPEED,
  SECTION_B_SPEED,
  collisionCheckUpRows,
  collisionGuessMarker,
  everydayTotalGuessMarker,
  runCollisionExperiment,
  systemMassOf,
  totalsOf,
} from '../physics/energyMomentum'
import type { CollisionGuess, EverydayTotalGuess } from '../physics/energyMomentum'

// Steps 4 to 7 of docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md, Part 2 only: the introduction (stage B), the
// controls, the setup diagram, the prediction that gates Run, the run that connects the diagram to the physics model (the lab's
// view of the collision, with a bar for 2m beside the lump's mass M, and then the passing observer's view of the same collision),
// and the results shown when the run ends (values only, neutral; the explanation is the tutor's, §12). Every number comes from
// `runCollisionExperiment` in `energyMomentum.ts`. The tutor (`EnergyMomentumCollisionTutor`) follows the results. The presets are Decision 5 of that specification.
// Wording here is draft for the owner's review (CLAUDE.md §28.1).
// Audit update of 2026-11-21 (wording in docs/audit/spacetime-geometry/05-draft-wording-section-b.md, approved by the owner with all defaults): Section B is in
// four Parts. Part 1 is one guess about one fixed run (two lumps at 0.6c, a passing observer at +0.3c), with the lab's picture, the passing observer's picture and the
// white guess tick drawn beside the mass bars; Part 2 lets the learner choose the speeds; Part 3 has the results; Part 4 the tutor. Parts 2 to 4 appear after the first
// Run, and Start over clears Section B. This step changes the layout, the introduction, the prediction and the pictures with their captions; the results tables and the
// tutor are unchanged and move in later steps.
type Prediction = CollisionGuess

// The three answers of Part 2's prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1).
// Not scored, and the learner is not told which is right (§12).
export const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'less', label: '(a) Less than 2m.' },
  { value: 'same', label: '(b) Exactly 2m.' },
  { value: 'more', label: '(c) More than 2m.' },
]

// The two answers of Part 1's second prediction, about the passing observer (approved by the owner on 2026-11-22). Not scored, and the learner is not told which is right (§12).
export const EVERYDAY_TOTAL_CHOICES: { value: EverydayTotalGuess; label: string }[] = [
  { value: 'same', label: '(a) The same before and after.' },
  { value: 'different', label: '(b) Not the same before and after.' },
]

// The terms and formulas that stage B's introduction defines, added to the "Words and formulas" panel at the top of the page
// once Part 2 appears (spec, Introduction, rule 5). They repeat the introduction's wording, with no new claims.
export const PART_TWO_REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Collision', meaning: 'two things meeting. Head-on means from opposite directions. Stick together means they join into one lump.' },
  {
    term: 'Conserved',
    meaning:
      'a quantity is conserved if its total does not change. Here, the total energy and the total momentum are conserved in a collision. Like money moved between two bank accounts: each changes, the total does not.',
  },
  { term: 'System', meaning: 'the whole group of pieces taken together, as if they were one thing.' },
  { term: 'Lump', meaning: 'the single piece the two clay lumps become when they stick together.' },
  { term: 'Internal energy', meaning: 'energy inside a thing that is not its motion as a whole, such as the heat in a warm lump of clay.' },
  {
    term: 'Mass of a system: M = √(E_total² − (P_total c)²)',
    meaning:
      'put the total energy and the total momentum × c through the same “subtract the squares” combination. For example, a total energy of 5 and a total momentum × c of 3 give M = √(25 − 9) = √16 = 4.',
  },
  { term: 'Everyday momentum', meaning: 'mass × speed, the slow-speed rule. For example, 1 × 2 = 2 for a 1-kilogram ball at 2 meters per second. Part 3 tests it with the speeds a moving observer measures.' },
]

// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
const ANIMATION_DURATION_MS = 12_000
const SPEED_PRESETS = [0.3, 0.6, 0.8, 0.9]
const PASSING_SPEED_PRESETS = [-0.6, -0.3, 0.3, 0.6]

const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const TICK_COLOR = '#cbd5e1'
const LAB_COLOR = '#38bdf8'
const PASSING_COLOR = '#c4b5fd'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

const VIEW_WIDTH = 520
const VIEW_HEIGHT = 580
const MEET_X = 260
const LUMP_RADIUS = 16
// Pixels of travel before the collision for each 1c of speed, the same in both pictures so that speeds can be compared.
const PIXELS_PER_SPEED = 200
// The lab's picture, then the passing observer's picture (SVG y of the line the lumps move along).
const LAB_LINE_Y = 150
const OBSERVER_LINE_Y = 460
// Part 1 only: a third band under Picture 2 for the passing observer's mass × speed totals (its own scale), which makes the picture taller.
const TOTALS_TOP_Y = 590
const TOTALS_ZERO_X = 270
const TOTALS_PIXELS_PER_UNIT = 240
const VIEW_HEIGHT_WITH_TOTALS = 790
const MASS_BAR_UNIT = 20
// The share of the playback used by each picture: the lab's first, then the passing observer's.
const LAB_END = 0.4
const OBSERVER_END = 0.8

// Numbers in the results tables: four decimal places, with a minus sign for a negative number and no "-0.0000".
function formatNumber(value: number): string {
  const text = value.toFixed(4).replace('-', '−')
  return /^−0\.0+$/.test(text) ? text.slice(1) : text
}

// A difference that is zero apart from rounding is shown as 0.0000.
function formatDifference(value: number): string {
  return formatNumber(Math.abs(value) < 5e-10 ? 0 : value)
}

function signed(value: number, digits = 2): string {
  return value.toFixed(digits).replace('-', '−')
}

function passingLabel(speed: number): string {
  return `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

function directionWords(speed: number): string {
  return Math.abs(speed) < 5e-10 ? 'at rest' : speed > 0 ? 'to the right' : 'to the left'
}

// Where a picture is in its own story, from 0 to 1: a pause, the lumps approaching (approach 0 to 1), the collision, then the
// lump after it (after 0 to 1).
function panelStory(q: number): { approach: number; after: number; collided: boolean; flash: number } {
  const approach = clamp01((q - 0.2) / 0.45)
  const after = clamp01((q - 0.65) / 0.35)
  const smooth = approach * approach * (3 - 2 * approach)
  return { approach: smooth, after, collided: q >= 0.65, flash: q >= 0.65 && q < 0.8 ? 1 - (q - 0.65) / 0.15 : 0 }
}

interface PanelProps {
  lineY: number
  title: string
  subtitle: string
  color: string
  q: number
  speeds: [number, number]
  readings: [{ energy: number; momentumTimesC: number }, { energy: number; momentumTimesC: number }]
  lumpSpeed: number
  lumpReading: { energy: number; momentumTimesC: number }
  lumpMass: number
}

// One picture of the collision: two identical lumps approach along a line, meet, and stick into one lump. The name labels and
// numbers stay where the lumps start, so they do not run into each other as the lumps come together.
function CollisionPanel({ lineY, title, subtitle, color, q, speeds, readings, lumpSpeed, lumpReading, lumpMass }: PanelProps) {
  const story = panelStory(q)
  const gap = Math.abs(speeds[0] - speeds[1]) * PIXELS_PER_SPEED
  const startXs = speeds.map((v) => MEET_X - v * PIXELS_PER_SPEED)
  const labelXs = [startXs[0], startXs[1]]
  // Keep the two sets of numbers from overlapping when the lumps start close together.
  if (gap < 140) {
    const mid = (startXs[0] + startXs[1]) / 2
    const order = startXs[0] <= startXs[1] ? [0, 1] : [1, 0]
    labelXs[order[0]] = mid - 70
    labelXs[order[1]] = mid + 70
  }
  const lumpRadius = LUMP_RADIUS * Math.sqrt(lumpMass)
  const lumpX = MEET_X + lumpSpeed * PIXELS_PER_SPEED * 0.5 * story.after
  const names = ['Lump 1', 'Lump 2']

  return (
    <g>
      <text x="12" y={lineY - 130} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        {title}
      </text>
      <text x="12" y={lineY - 114} fontSize="11" fill={MUTED_COLOR}>
        {subtitle}
      </text>
      <line x1="20" y1={lineY} x2={VIEW_WIDTH - 20} y2={lineY} stroke={TICK_COLOR} strokeWidth="1" strokeDasharray="2 5" />
      <line x1={MEET_X} y1={lineY - 34} x2={MEET_X} y2={lineY + (story.collided ? 34 : 88)} stroke={MUTED_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      {!story.collided && (
        <text x={MEET_X} y={lineY + 100} fontSize="11" textAnchor="middle" fill={MUTED_COLOR} style={HALO}>
          where they meet
        </text>
      )}

      {!story.collided &&
        [0, 1].map((i) => {
          const x = MEET_X - speeds[i] * PIXELS_PER_SPEED * (1 - story.approach)
          const direction = Math.sign(speeds[i])
          const arrowLength = 14 + 50 * Math.abs(speeds[i])
          return (
            <g key={names[i]}>
              {direction !== 0 && (
                <line
                  x1={x + direction * (LUMP_RADIUS + 4)}
                  y1={lineY}
                  x2={x + direction * (LUMP_RADIUS + 4 + arrowLength)}
                  y2={lineY}
                  stroke={color}
                  strokeWidth="2.5"
                  markerEnd={`url(#collision-arrowhead-${color.slice(1)})`}
                />
              )}
              <circle cx={x} cy={lineY} r={LUMP_RADIUS} fill={color} stroke="#0b1020" strokeWidth="1.5" />
              <text x={x} y={lineY + 4} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0b1020">
                {i + 1}
              </text>
            </g>
          )
        })}

      {story.flash > 0 && <circle cx={MEET_X} cy={lineY} r={lumpRadius + 30 * (1 - story.flash)} fill="none" stroke="#facc15" strokeWidth="3" opacity={story.flash} />}

      {story.collided && (
        <g>
          {Math.abs(lumpSpeed) > 5e-10 && (
            <line
              x1={lumpX + Math.sign(lumpSpeed) * (lumpRadius + 4)}
              y1={lineY}
              x2={lumpX + Math.sign(lumpSpeed) * (lumpRadius + 4 + 14 + 50 * Math.abs(lumpSpeed))}
              y2={lineY}
              stroke={color}
              strokeWidth="2.5"
              markerEnd={`url(#collision-arrowhead-${color.slice(1)})`}
            />
          )}
          <circle cx={lumpX} cy={lineY} r={lumpRadius} fill={color} stroke="#0b1020" strokeWidth="1.5" />
          <text x={lumpX} y={lineY + 4} fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0b1020">
            1+2
          </text>
        </g>
      )}

      {/* Labels. Before the collision: each lump's name and numbers. After: the one lump's name and numbers. */}
      {!story.collided &&
        [0, 1].map((i) => (
          <g key={`label-${names[i]}`}>
            <text x={labelXs[i]} y={lineY - 56} fontSize="12" fontWeight="bold" textAnchor="middle" fill={color} style={HALO}>
              {names[i]}
            </text>
            <text x={labelXs[i]} y={lineY - 42} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
              moves {directionWords(speeds[i])}
            </text>
            <text x={labelXs[i]} y={lineY + 44} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
              speed {Math.abs(speeds[i]).toFixed(2)}c
            </text>
            <text x={labelXs[i]} y={lineY + 58} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
              energy {readings[i].energy.toFixed(2)}
            </text>
            <text x={labelXs[i]} y={lineY + 72} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
              momentum × c {signed(readings[i].momentumTimesC)}
            </text>
          </g>
        ))}
      {story.collided && (
        <g>
          <text x={MEET_X} y={lineY - 56} fontSize="12" fontWeight="bold" textAnchor="middle" fill={color} style={HALO}>
            The lump (1 and 2 stuck together)
          </text>
          <text x={MEET_X} y={lineY - 42} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
            {Math.abs(lumpSpeed) < 5e-10 ? 'at rest' : `moves ${directionWords(lumpSpeed)}`}
          </text>
          <text x={MEET_X} y={lineY + 52} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
            speed {Math.abs(lumpSpeed).toFixed(2)}c
          </text>
          <text x={MEET_X} y={lineY + 66} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
            energy {lumpReading.energy.toFixed(2)}
          </text>
          <text x={MEET_X} y={lineY + 80} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
            momentum × c {signed(lumpReading.momentumTimesC)}
          </text>
          <text x={MEET_X} y={lineY + 94} fontSize="11" fontWeight="bold" textAnchor="middle" fill={color} style={HALO}>
            mass M = {lumpMass.toFixed(2)} m
          </text>
        </g>
      )}
    </g>
  )
}

interface CollisionDiagramProps {
  speed: number
  passingSpeed: number
  // null while idle (only the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
  // True for Part 2's drawings (Drawing A and B), which follow the learner's settings and carry no guess.
  own?: boolean
  // The learner's guess, drawn as a white tick beside the mass bars once they are drawn (Part 1 only).
  guess?: Prediction | null
  // The second guess (about the passing observer), drawn as a white tick on the "after" bar of the totals panel (Part 1 only). The panel is drawn in Part 1 only, whether or not a guess is set.
  everydayGuess?: EverydayTotalGuess | null
}

const GUESS_COLOR = '#ffffff'

// How far the playback has got in each picture, shared by the drawing and the caption so that a feature is explained only once it is drawn (§12).
export function collisionMilestones(progress: number | null) {
  const playing = progress !== null
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  return {
    playing,
    // the lump, the 2m bar and the M bar are drawn
    barsDrawn: playing && panelStory(labQ).collided,
    // the passing observer's picture is drawn
    observerDrawn: playing && progress > LAB_END,
    // the passing observer's lump has formed, so both of their mass × speed totals can be drawn
    totalsDrawn: playing && panelStory(clamp01((progress - LAB_END) / (OBSERVER_END - LAB_END))).collided,
  }
}

// While idle it draws the lab's setup, just before the collision, with the passing observer marked. While the run plays it
// shows the lab's collision first, with a bar for 2m beside the lump's mass M, and then the same collision as the passing
// observer sees it, both in the same style.
export function CollisionDiagram({ speed, passingSpeed, progress, own = false, guess = null, everydayGuess = null }: CollisionDiagramProps) {
  const result = runCollisionExperiment(speed, passingSpeed)
  const playing = progress !== null
  const complete = progress !== null && progress >= 1
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  const observerQ = playing ? clamp01((progress - LAB_END) / (OBSERVER_END - LAB_END)) : 0
  const showObserverPicture = playing && progress > LAB_END
  const labStory = panelStory(labQ)
  const observerSpeeds: [number, number] = [result.passingBefore[0].speed, result.passingBefore[1].speed]
  const { totalsDrawn } = collisionMilestones(progress)

  const body = (
    <g>
      <CollisionPanel
        lineY={LAB_LINE_Y}
        title=""
        subtitle=""
        color={LAB_COLOR}
        q={labQ}
        speeds={[speed, -speed]}
        readings={[result.labBefore[0], result.labBefore[1]]}
        lumpSpeed={0}
        lumpReading={result.labAfter}
        lumpMass={result.lumpMass}
      />

      {/* The extra mass: a bar for the two masses added, and a bar for the lump's mass M, once the lumps have stuck together. */}
      {labStory.collided && (
        <g>
          {/* The white guess: a thick tick across the bars at the place the answer names, and a YOUR GUESS box joined to it by a line. It is only a marker. */}
          {guess !== null && (
            <g>
              <line x1={340 + collisionGuessMarker(guess).position * MASS_BAR_UNIT} y1={LAB_LINE_Y + 14} x2={340 + collisionGuessMarker(guess).position * MASS_BAR_UNIT} y2={LAB_LINE_Y + 96} stroke={GUESS_COLOR} strokeWidth="4" />
              <rect x="360" y={LAB_LINE_Y - 40} width="150" height="54" rx="6" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="3" />
              <text x="435" y={LAB_LINE_Y - 18} textAnchor="middle" fontSize="16" fontWeight="bold" fill={GUESS_COLOR}>
                YOUR GUESS
              </text>
              <text x="435" y={LAB_LINE_Y - 2} textAnchor="middle" fontSize="12" fill={GUESS_COLOR}>
                {collisionGuessMarker(guess).label.replace('YOUR GUESS: ', '')}
              </text>
            </g>
          )}
          <text x="340" y={LAB_LINE_Y + 50} fontSize="10" fill={MUTED_COLOR} style={HALO}>
            The two masses added, 2m
          </text>
          <rect x="340" y={LAB_LINE_Y + 54} width={2 * MASS_BAR_UNIT} height="8" rx="2" fill="#94a3b8" />
          <text x="340" y={LAB_LINE_Y + 76} fontSize="10" fill={LAB_COLOR} style={HALO}>
            The lump's mass, M
          </text>
          <rect x="340" y={LAB_LINE_Y + 80} width={result.lumpMass * MASS_BAR_UNIT} height="8" rx="2" fill={LAB_COLOR} />
        </g>
      )}

      {/* The passing observer: a hollow circle (as in Part 1) with an arrow for their way and speed. */}
      <circle cx="60" cy="290" r="8" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
      {passingSpeed !== 0 && (
        <line
          x1={60 + Math.sign(passingSpeed) * 14}
          y1="290"
          x2={60 + Math.sign(passingSpeed) * (14 + 20 + 80 * Math.abs(passingSpeed))}
          y2="290"
          stroke={PASSING_COLOR}
          strokeWidth="2.5"
          markerEnd={`url(#collision-arrowhead-${PASSING_COLOR.slice(1)})`}
        />
      )}
      <text x="140" y="288" fontSize="12" fontWeight="bold" fill={PASSING_COLOR}>
        The passing observer
      </text>
      <text x="140" y="304" fontSize="11" fill={PASSING_COLOR}>
        moves at {passingLabel(passingSpeed)} ({passingSpeed > 0 ? 'to the right' : 'to the left'}), along the same line
      </text>

      {/* The passing observer's picture, once the lab's has played. */}
      {showObserverPicture ? (
        <CollisionPanel
          lineY={OBSERVER_LINE_Y}
          title={`${own ? 'Drawing B' : 'Picture 2'}: the same collision, as the passing observer sees it`}
          subtitle="Their ruler and clocks move with them, so for them they are at rest."
          color={PASSING_COLOR}
          q={observerQ}
          speeds={observerSpeeds}
          readings={[result.passingBefore[0], result.passingBefore[1]]}
          lumpSpeed={result.passingAfter.speed}
          lumpReading={result.passingAfter}
          lumpMass={result.lumpMass}
        />
      ) : (
        playing && (
          <text x="12" y="330" fontSize="11" fill={MUTED_COLOR}>
            Next, the same collision as the passing observer sees it.
          </text>
        )
      )}

      {/* Part 1 only: the passing observer's mass × speed totals, on their own scale. Solid bar = before, outlined bar = after. The white tick is the second guess; it is only a marker. */}
      {!own && showObserverPicture && (
        <g>
          <text x="12" y={TOTALS_TOP_Y} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
            Picture 2, lower panel: the passing observer's everyday totals, mass × speed
          </text>
          <text x="12" y={TOTALS_TOP_Y + 15} fontSize="11" fill={MUTED_COLOR}>
            Their own scale (in m × c). A bar to the left of the line means to the left.
          </text>
          {!totalsDrawn && (
            <text x="12" y={TOTALS_TOP_Y + 40} fontSize="11" fill={MUTED_COLOR}>
              The two totals are drawn here once their lump has formed.
            </text>
          )}
          {totalsDrawn && (
            <g>
              <line x1={TOTALS_ZERO_X} y1={TOTALS_TOP_Y + 28} x2={TOTALS_ZERO_X} y2={TOTALS_TOP_Y + 112} stroke={MUTED_COLOR} strokeWidth="1" strokeDasharray="3 4" />
              <text x={TOTALS_ZERO_X} y={TOTALS_TOP_Y + 124} fontSize="10" textAnchor="middle" fill={MUTED_COLOR} style={HALO}>
                zero
              </text>
              {[
                { key: 'before', value: result.newtonMomentumBefore, y: TOTALS_TOP_Y + 52, text: 'Before: mass × speed of Lump 1, plus that of Lump 2', fill: true },
                { key: 'after', value: result.newtonMomentumAfter, y: TOTALS_TOP_Y + 92, text: "After: the lump's mass 2m × its speed", fill: false },
              ].map((bar) => (
                <g key={bar.key}>
                  <text x="12" y={bar.y - 6} fontSize="10" fill={PASSING_COLOR} style={HALO}>
                    {bar.text}
                  </text>
                  <rect
                    x={Math.min(TOTALS_ZERO_X, TOTALS_ZERO_X + bar.value * TOTALS_PIXELS_PER_UNIT)}
                    y={bar.y}
                    width={Math.abs(bar.value) * TOTALS_PIXELS_PER_UNIT}
                    height="14"
                    rx="2"
                    fill={bar.fill ? PASSING_COLOR : 'none'}
                    stroke={PASSING_COLOR}
                    strokeWidth="2"
                  />
                  <text
                    x={bar.value < 0 ? TOTALS_ZERO_X + 6 : TOTALS_ZERO_X - 6}
                    y={bar.y + 11}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor={bar.value < 0 ? 'start' : 'end'}
                    fill={bar.fill ? '#0b1020' : PASSING_COLOR}
                  >
                    {signed(bar.value)}
                  </text>
                </g>
              ))}
              {everydayGuess !== null && (
                <g>
                  {(() => {
                    const marker = everydayTotalGuessMarker(everydayGuess, result)
                    const tickX = TOTALS_ZERO_X + marker.afterPosition * TOTALS_PIXELS_PER_UNIT
                    const boxX = Math.min(Math.max(tickX - 85, 10), VIEW_WIDTH - 180)
                    return (
                      <g>
                        <line x1={tickX} y1={TOTALS_TOP_Y + 84} x2={tickX} y2={TOTALS_TOP_Y + 114} stroke={GUESS_COLOR} strokeWidth="4" />
                        <line x1={tickX} y1={TOTALS_TOP_Y + 114} x2={boxX + 85} y2={TOTALS_TOP_Y + 134} stroke={GUESS_COLOR} strokeWidth="2" />
                        <rect x={boxX} y={TOTALS_TOP_Y + 134} width="170" height="54" rx="6" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="3" />
                        <text x={boxX + 85} y={TOTALS_TOP_Y + 156} textAnchor="middle" fontSize="16" fontWeight="bold" fill={GUESS_COLOR}>
                          YOUR GUESS
                        </text>
                        <text x={boxX + 85} y={TOTALS_TOP_Y + 172} textAnchor="middle" fontSize="12" fill={GUESS_COLOR}>
                          {marker.label.replace('YOUR GUESS: ', '')}
                        </text>
                      </g>
                    )
                  })()}
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </g>
  )

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${own ? VIEW_HEIGHT : VIEW_HEIGHT_WITH_TOTALS}`}
      role="img"
      aria-label={`${complete ? 'Result: ' : playing ? 'Playback: ' : 'Setup: '}the lab sees two identical lumps, each moving toward the other at ${speed}c, collide head-on and stick together. Lump 1 moves to the right with an energy of ${result.labBefore[0].energy.toFixed(2)} and a momentum times c of ${result.labBefore[0].momentumTimesC.toFixed(2)}. Lump 2 moves to the left with an energy of ${result.labBefore[1].energy.toFixed(2)} and a momentum times c of ${result.labBefore[1].momentumTimesC.toFixed(2)}. A passing observer moves at ${passingLabel(passingSpeed)}.${playing ? ` After the collision the lab sees one lump at rest, with an energy of ${result.labAfter.energy.toFixed(2)} and a mass of ${result.lumpMass.toFixed(2)} times one lump's mass, compared with 2 for the two added.` : ''}${showObserverPicture ? ` The passing observer sees the lumps moving at ${result.passingBefore[0].speed.toFixed(2)}c and ${result.passingBefore[1].speed.toFixed(2)}c, and the lump afterward moving at ${result.passingAfter.speed.toFixed(2)}c.` : ''}`}
      style={SVG_STYLE}
    >
      <defs>
        {[LAB_COLOR, PASSING_COLOR].map((color) => (
          <marker key={color} id={`collision-arrowhead-${color.slice(1)}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        {playing ? `${own ? 'Drawing A' : 'Picture 1'}: the lab's view of the collision` : "The lab's view, just before the collision"}
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        Energy is in one lump's rest energies. Momentum is shown as momentum × c.
      </text>

      {body}
    </svg>
  )

}

const CELL: CSSProperties = { padding: '0.3rem 1rem 0.3rem 0' }
const INTRO: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ ...CELL, textAlign: 'left' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} style={CELL}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// A small dark tag, "your guess", beside the table row that holds the number the guess is about. It is a marker only: it never says right or wrong.
export function CollisionGuessTag() {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.6875rem',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#0b1020',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      your guess
    </span>
  )
}

function Notes({ children }: { children: ReactNode }) {
  return (
    <div style={{ ...INTRO, margin: '0 0 1.25rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>What this table tells us</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{children}</ul>
    </div>
  )
}

// Part 3, the results of Part 1's run: the guess beside them, the check-up, and the tables, each with a note in plain words (wording: docs/audit/spacetime-geometry/05-draft-wording-section-b.md,
// section 6 and "Build notes"). Values only, neutral; the explanation is the tutor's (§12). Every number comes from `energyMomentum.ts`; nothing here depends on the guess except the
// guess block and its tag.
export function CollisionResults({ speed, passingSpeed, prediction, everydayGuess }: { speed: number; passingSpeed: number; prediction: Prediction; everydayGuess: EverydayTotalGuess }) {
  const result = runCollisionExperiment(speed, passingSpeed)
  const labBefore = totalsOf(result.labBefore)
  const labAfter = totalsOf([result.labAfter])
  const passingBefore = totalsOf(result.passingBefore)
  const passingAfter = totalsOf([result.passingAfter])
  const conservationRow = (name: string, before: number, after: number) => [
    name,
    formatNumber(before),
    formatNumber(after),
    formatDifference(after - before),
  ]
  const passingSystemMassBefore = systemMassOf(result.passingBefore)
  const passingSystemMassAfter = systemMassOf([result.passingAfter])
  const labSystemMassAfter = systemMassOf([result.labAfter])
  const checkUp = collisionCheckUpRows(result)
  const sameCount = checkUp.filter((row) => row.reading === 'the same').length
  const guessLabel = PREDICTION_CHOICES.find((c) => c.value === prediction)!.label
  const everydayGuessLabel = EVERYDAY_TOTAL_CHOICES.find((c) => c.value === everydayGuess)!.label
  const f3 = (v: number) => signed(Math.abs(v) < 5e-10 ? 0 : v, 3)
  const side = passingSpeed > 0 ? 'to the right' : 'to the left'
  const lumpEnergy = result.labBefore[0].energy

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ ...INTRO, marginTop: 0 }}>
        These numbers are for Part 1's run: two lumps moving at {speed}c each in the lab, and a passing observer moving at {passingLabel(passingSpeed)} ({side}). Energy is in the rest energies of
        one lump, momentum is shown as momentum × c, and masses are in units of <em>m</em>, the mass of one lump. They never change with your predictions or with the settings you try in Part 2.
      </p>

      <div style={{ ...INTRO, padding: '0.75rem 1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', marginBottom: '1.25rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Your predictions, beside the results</p>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>Your first guess:</strong> {guessLabel} <strong>The question it was about:</strong> what is the mass of the single lump, compared with 2<em>m</em>, the two masses added?{' '}
          <strong>Where its numbers appear:</strong> the row "The lump's mass, M" in the first table below, which is tagged "your guess", and the white tick on the mass bars in Picture 1. It shows only
          what you chose.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Your second guess:</strong> {everydayGuessLabel} <strong>The question it was about:</strong> when the passing observer adds up mass × speed, is the total the same before and after the
          collision? <strong>Where its numbers appear:</strong> the row "m × (the sum of the speeds)" in the table "The everyday momentum, for the passing observer", which is tagged "your guess", and the white
          tick on the outlined bar in the lower panel of Picture 2. It shows only what you chose.
        </p>
      </div>

      <h4 style={{ margin: '0 0 0.25rem' }}>The check-up</h4>
      <p style={{ ...INTRO, margin: '0 0 0.5rem' }}>
        Each row sets what this physics says to expect beside what was found in your run, with a plain reading. No outside measurement is used here.
      </p>
      <Table
        head={['Check', 'What we would expect', 'What was found', 'Reading']}
        rows={checkUp.map((row) => [
          row.check,
          row.expected === null ? 'the numbers to be equal' : formatNumber(row.expected),
          row.found.map(formatNumber).join(' and '),
          row.reading,
        ])}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> seven checks. The first four ask whether the total energy and the total momentum × c changed in the collision, for the lab and for the passing observer.
          The rule says no, so the expected difference is 0. The last three ask whether the mass of the whole system came out the same before and after, and the same for both observers.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> in your run {sameCount} of the {checkUp.length} rows read "the same". The four differences are{' '}
          {checkUp.slice(0, 4).map((row) => formatNumber(row.found[0])).join(', ')}, and the system's mass is {formatNumber(result.systemMass)} m before the collision as the lab works it out,{' '}
          {formatNumber(passingSystemMassBefore)} m as the passing observer works it out.
        </li>
        <li>
          <strong>Why it matters:</strong> these are the totals the introduction called "conserved". If a row read "different", this page would disagree with its own rules. It does not say
          anything about the lump's mass compared with 2m. That is the question you predicted, and the first table below.
        </li>
        <li>
          <strong>How sure the numbers are:</strong> they are calculated here from the rules in Section A, not measured on this page. The expected values come from the same rules, so this check
          shows that the page is consistent with them. It is not an outside test of the rules.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>The mass of the lump</h4>
      <p style={INTRO}>
        <strong>The mass of the lump.</strong> Masses are in units of <em>m</em>, the mass of one lump.
      </p>
      <Table
        head={['', 'In units of m']}
        rows={[
          ['The two masses added, 2m', formatNumber(2)],
          [
            <>
              The lump's mass, M<CollisionGuessTag />
            </>,
            formatNumber(result.lumpMass),
          ],
          ['The extra, M − 2m', formatNumber(result.extraMass)],
        ]}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> 2m is what you get by adding the two lumps' masses. M is the mass of the single lump that results, worked out from its own energy and momentum. The
          last row is M − 2m.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the lump has an energy of {f3(result.labAfter.energy)} and a momentum × c of {f3(result.labAfter.momentumTimesC)}, so M = √(
          {f3(result.labAfter.energy)}² − {f3(result.labAfter.momentumTimesC)}²) = {formatNumber(result.lumpMass)} m. Set beside 2m = {formatNumber(2)} m, the extra is{' '}
          {formatNumber(result.extraMass)} m.
        </li>
        <li>
          <strong>Why it matters:</strong> this row is the number your prediction was about. The grey and blue bars in Picture 1 draw these two lengths. The tutor goes through where the mass
          comes from.
        </li>
        <li>
          <strong>How sure the numbers are:</strong> calculated here, from the same rules as the rest of the page.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>The total energy before and after the collision</h4>
      <p style={INTRO}>
        <strong>The total energy before and after the collision, for each observer.</strong> Energy is in rest energies of one lump. Each difference is the total after minus the total
        before.
      </p>
      <Table
        head={['Observer', 'Before', 'After', 'Difference']}
        rows={[
          conservationRow('The lab', labBefore.energy, labAfter.energy),
          conservationRow('The passing observer', passingBefore.energy, passingAfter.energy),
        ]}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> each observer adds up the energies of all the pieces before the collision, then the energy of the one lump after it, and subtracts.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> each lump had an energy of {f3(lumpEnergy)}, so the lab's total before is 2 × {f3(lumpEnergy)} = {f3(labBefore.energy)}. After, the
          lump has {f3(labAfter.energy)}. The passing observer's totals are {f3(passingBefore.energy)} before and {f3(passingAfter.energy)} after. The differences are{' '}
          {formatDifference(labAfter.energy - labBefore.energy)} and {formatDifference(passingAfter.energy - passingBefore.energy)}.
        </li>
        <li>
          <strong>Why it matters:</strong> it is like money moved between two bank accounts: each account changes, and the total is what you check. The two observers' totals are different
          numbers, so what is checked is each observer's own total, before against after.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>The total momentum × c before and after the collision</h4>
      <p style={INTRO}>
        <strong>The total momentum × c before and after the collision, for each observer.</strong> It is in the same units as the energy. A minus sign means the total points to the left.
      </p>
      <Table
        head={['Observer', 'Before', 'After', 'Difference']}
        rows={[
          conservationRow('The lab', labBefore.momentumTimesC, labAfter.momentumTimesC),
          conservationRow('The passing observer', passingBefore.momentumTimesC, passingAfter.momentumTimesC),
        ]}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> the same adding up as for the energy, with each piece's momentum × c counted with its direction.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> in the lab the two lumps have {f3(result.labBefore[0].momentumTimesC)} and {f3(result.labBefore[1].momentumTimesC)}, which add up to{' '}
          {f3(labBefore.momentumTimesC)}, and the lump afterward has {f3(labAfter.momentumTimesC)}. The passing observer's totals are {f3(passingBefore.momentumTimesC)} before and{' '}
          {f3(passingAfter.momentumTimesC)} after.
        </li>
        <li>
          <strong>Why it matters:</strong> this is the same kind of check as for the energy, now for momentum. A comparison: two skaters of equal mass who meet head-on at equal speeds have
          opposite momenta, and the pair's total is zero.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>The everyday momentum, for the passing observer</h4>
      <p style={INTRO}>
        <strong>The everyday momentum, for the passing observer.</strong> The everyday rule is mass × speed. Here it is worked out with the speeds the passing observer measures, each in units of
        c, and with each lump's mass taken as m. For the lump afterward, the mass is taken as 2m.
      </p>
      <Table
        head={['', 'Before', 'After', 'Difference']}
        rows={[
          [
            <>
              m × (the sum of the speeds)
              <CollisionGuessTag />
            </>,
            formatNumber(result.newtonMomentumBefore),
            formatNumber(result.newtonMomentumAfter),
            formatDifference(result.newtonMomentumAfter - result.newtonMomentumBefore),
          ],
        ]}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> the momentum you would get from the everyday rule, using the speeds the passing observer measures, before and after.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the passing observer measures the lumps at {result.passingBefore[0].speed.toFixed(3)}c and{' '}
          {result.passingBefore[1].speed.toFixed(3)}c, so the everyday sum before is {formatNumber(result.newtonMomentumBefore)}. The lump afterward moves at{' '}
          {result.passingAfter.speed.toFixed(3)}c, so 2 × {result.passingAfter.speed.toFixed(3)} = {formatNumber(result.newtonMomentumAfter)}. The difference is{' '}
          {formatDifference(result.newtonMomentumAfter - result.newtonMomentumBefore)}.
        </li>
        <li>
          <strong>Why it matters:</strong> it puts the everyday rule to the test for a moving observer. Think of two skaters watched from a moving train: each skater's speed looks different from the
          train than from the platform. The question is whether mass × speed still adds up with the train's speeds. The tutor says what the numbers show.
        </li>
      </Notes>

      <h4 style={{ margin: '0 0 0.25rem' }}>The mass of the whole system, and the sum of the separate masses</h4>
      <p style={INTRO}>
        <strong>The mass of the whole system, and the sum of the separate masses.</strong> The mass of the whole system is worked out from the total energy and the total momentum × c, as M =
        √(E_total² − (P_total c)²). The sum of the separate masses adds up the masses of the pieces: 2m before, and the single lump's M after. Masses are in units of m.
      </p>
      <Table
        head={['', 'Before', 'After']}
        rows={[
          ['Mass of the whole system, found by the lab', formatNumber(result.systemMass), formatNumber(labSystemMassAfter)],
          ['Mass of the whole system, found by the passing observer', formatNumber(passingSystemMassBefore), formatNumber(passingSystemMassAfter)],
          ['Sum of the separate masses', formatNumber(2), formatNumber(result.lumpMass)],
        ]}
      />
      <Notes>
        <li>
          <strong>What it is:</strong> two different numbers. One is the mass of the whole group of pieces, worked out from the totals. The other is the masses of the separate pieces added up.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the lab finds {formatNumber(result.systemMass)} m before and {formatNumber(labSystemMassAfter)} m after. The passing observer finds{' '}
          {formatNumber(passingSystemMassBefore)} m and {formatNumber(passingSystemMassAfter)} m. The sum of the separate masses goes from {formatNumber(2)} m to {formatNumber(result.lumpMass)} m.
          For example, before the collision the lab's totals are an energy of {f3(labBefore.energy)} and a momentum × c of {f3(labBefore.momentumTimesC)}, so M = √({f3(labBefore.energy)}² −{' '}
          {f3(labBefore.momentumTimesC)}²) = {formatNumber(result.systemMass)}.
        </li>
        <li>
          <strong>Why it matters:</strong> the mass of a system is not simply the masses of the pieces added together. The tutor explains where the difference comes from.
        </li>
      </Notes>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

// The "Want to know more?" list of Section B (CLAUDE.md §29 rule 3 and "Links and Words on Every Experiment Page"). Each page was fetched and read on 2026-11-21 before it was
// linked (see "Build notes" in docs/audit/spacetime-geometry/05-draft-wording-section-b.md). The gaps are recorded there under §29 rule 3(c) and stated to the learner below.
export function EnergyMomentumCollisionLinks() {
  const ext = (href: string, text: ReactNode) => (
    <a href={href} target="_blank" rel="noreferrer">
      {text}
    </a>
  )
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          {ext('https://pwg.gsfc.nasa.gov/stargaze/Smoment.htm', 'NASA Goddard, "Momentum"')} (page read on 21 November 2026; NASA keeps it online as an archive, last updated in 2004): a cannon fires a
          shell. Velocities in one direction count as positive and the other direction as negative, and the total momentum stays the same ("is conserved"). It uses everyday speeds.
        </li>
        <li style={linkItem}>
          {ext('https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/conservation-of-momentum-2/', 'NASA Glenn, "Conservation of Momentum"')} (page read on 21 November 2026; last updated 12 September
          2024): the first paragraph says plainly that momentum is neither created nor destroyed, and that it has a direction. The rest of the page is about gas flowing through a pipe and is harder.
        </li>
        <li style={linkItem}>
          {ext('https://home.cern/science/accelerators/large-hadron-collider/', 'CERN, "Large Hadron Collider"')} (page read on 21 November 2026; it shows no date): two beams of particles travel in opposite
          directions at close to the speed of light and are made to collide. This is a real head-on collision of the kind this section imagines with clay.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        No plain-language page from NASA, ESA, CERN or Fermilab was found that explains why the mass of a system can differ from the masses of its pieces added together (searched 21 November 2026;
        the results were research papers, which are not plain pages and were not linked), so this page explains it in its own words. The original paper behind this chapter's energy rule is listed at
        the end of Section A's results.
      </p>
    </div>
  )
}

// ---- The pictures' captions (CLAUDE.md §14, "Animated Diagrams"; wording: docs/audit/spacetime-geometry/05-draft-wording-section-b.md, section 5) ----

const captionStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 } as const
const pictureTitle = { fontWeight: 'bold', fontSize: '0.875rem', marginTop: '1.5rem', marginBottom: '0.5rem' } as const
const PART_ONE_COLOR = '#d97706'
const PART_TWO_COLOR = '#be185d'
const PART_THREE_COLOR = '#0f766e'
const PART_FOUR_COLOR = '#0066cc'
const linkButton: CSSProperties = { background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }

interface CaptionProps {
  speed: number
  passingSpeed: number
  progress: number | null
  // True for Part 2's drawings.
  own?: boolean
  guess?: Prediction | null
  everydayGuess?: EverydayTotalGuess | null
}

// The captions under the lab's picture and the passing observer's picture. A feature is explained only once it is drawn (§12), and nothing here says
// which of the grey bar and the blue bar is longer, or whether the totals are kept: that is the learner's to observe and the tutor's to explain (§12, §13).
export function CollisionCaptions({ speed, passingSpeed, progress, own = false, guess = null, everydayGuess = null }: CaptionProps) {
  const result = runCollisionExperiment(speed, passingSpeed)
  const { playing, barsDrawn, observerDrawn, totalsDrawn } = collisionMilestones(progress)
  const f2 = (v: number) => signed(Math.abs(v) < 5e-10 ? 0 : v, 2)
  const labBefore = totalsOf(result.labBefore)
  const passingBefore = totalsOf(result.passingBefore)
  const picture1 = own ? 'Drawing A' : 'Picture 1'
  const picture2 = own ? 'Drawing B' : 'Picture 2'
  const lump = result.labBefore[0]

  const picture1Items = [
    {
      look: 'the two numbers under each lump before the collision (its energy and its momentum × c)',
      means: `each lump has an energy of ${f2(lump.energy)} and a momentum × c of ${f2(lump.momentumTimesC)} (Lump 1, to the right) or ${f2(result.labBefore[1].momentumTimesC)} (Lump 2, to the left). Adding them, the lab finds a total energy of ${f2(labBefore.energy)} and a total momentum × c of ${f2(labBefore.momentumTimesC)}`,
      matters: 'these are the totals that the collision may or may not keep. Part 3 gives the numbers after it, and the tutor goes through what they show',
    },
    ...(barsDrawn
      ? [
          {
            look: 'the single lump labelled 1+2 after the collision, and the numbers under it',
            means: `the lab finds an energy of ${f2(result.labAfter.energy)}, a momentum × c of ${f2(result.labAfter.momentumTimesC)} and a speed of ${result.labAfter.speed.toFixed(2)}c for it`,
            matters: 'it is one piece now, so these three numbers are all the lab has to describe the system after the collision. You can set them beside the totals from before',
          },
          {
            look: 'the grey bar (the two masses added, 2m) and the blue bar (the lump\'s mass, M)',
            means: `two lengths for the same collision: the grey one is 2m = 2.00 m, and the blue one is the mass of the lump the lab finds, M = ${result.lumpMass.toFixed(2)} m`,
            matters: 'the question you predicted is the comparison of these two lengths. The page does not say which is longer, so read it from the bars',
          },
        ]
      : []),
  ]

  const picture2Items = [
    {
      look: 'the numbers under each lump before the collision in the purple picture',
      means: `this observer finds Lump 1 at ${result.passingBefore[0].speed.toFixed(2)}c with an energy of ${f2(result.passingBefore[0].energy)}, and Lump 2 at ${result.passingBefore[1].speed.toFixed(2)}c with an energy of ${f2(result.passingBefore[1].energy)}. These are not the lab's numbers`,
      matters: 'the same two lumps get different energies and momenta when they are measured by someone who moves differently, as in Section A',
    },
    {
      look: 'the totals in this picture, before and after the collision',
      means: `this observer's total energy before is ${f2(passingBefore.energy)} and their total momentum × c is ${f2(passingBefore.momentumTimesC)}. After the collision the lump has an energy of ${f2(result.passingAfter.energy)} and a momentum × c of ${f2(result.passingAfter.momentumTimesC)}`,
      matters: 'this is the check for this observer, on their own numbers, of whether the totals were kept. Part 3 lists the differences, and the tutor goes through them',
    },
    {
      look: 'the lump\'s mass M written beside the lump in this picture',
      means: `this observer finds M = ${result.lumpMass.toFixed(2)} m for the lump (the lab found ${result.lumpMass.toFixed(2)} m)`,
      matters: 'it asks whether the lump\'s mass depends on who measures it. The tutor explains what the numbers show',
    },
  ]

  const totalsItems = [
    {
      look: 'the solid bar, "Before: mass × speed of Lump 1, plus that of Lump 2"',
      means: `this is the everyday total before the collision, worked out with the speeds this observer measures: ${f2(result.passingBefore[0].speed)}c for Lump 1 and ${f2(result.passingBefore[1].speed)}c for Lump 2, each times its mass m. Added together it is ${f2(result.newtonMomentumBefore)} (in m × c)`,
      matters: 'it is the "before" side of the everyday rule, for this observer. The rule says it should be kept through the collision',
    },
    {
      look: 'the outlined bar, "After: the lump\'s mass 2m × its speed"',
      means: `this is the same everyday total after the collision. The rule uses 2m for the lump's mass, and this observer measures its speed as ${f2(result.passingAfter.speed)}c, so the total is 2 × ${f2(result.passingAfter.speed)} = ${f2(result.newtonMomentumAfter)} (in m × c)`,
      matters: 'it is the "after" side. Setting its length beside the solid bar answers the question of your second prediction. The page does not say whether they are equal, so read it from the bars',
    },
  ]

  return (
    <div style={captionStyle}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{own ? `How to read ${picture1}.` : 'How to read this diagram.'}</strong>{' '}
        {own
          ? `This is the lab's picture of Part 1 again, drawn for your settings, with a pink line beside it because it follows your settings. Everything in it means what it meant in Part 1. `
          : ''}
        For {own ? 'your settings' : 'this run'}, each of two identical lumps of clay moves at {speed}c in the lab, one to the right and one to the left, and they collide head-on and
        stick together. The passing observer moves at {passingLabel(passingSpeed)}. Speeds are given as a fraction of <strong>c</strong>, the speed of light: 0.6c is 60 percent of it.
      </p>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>{picture1}: the lab's view of the collision.</strong> It is drawn in sky blue. The parts of it are:
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The two sky-blue circles, "Lump 1" and "Lump 2".</strong> Identical lumps of clay, each of mass <em>m</em> (its mass at rest). Each arrow shows the way its lump
          moves, and a longer arrow means a faster lump.
        </li>
        <li>
          <strong>The numbers under each lump.</strong> Its speed (a fraction of c), its energy (in the rest energies of one lump, so 1 is one lump sitting still) and its momentum × c
          (in the same unit). A minus sign on the momentum means the lump moves to the left.
        </li>
        <li>
          <strong>The dashed vertical line, "where they meet".</strong> The place of the collision.
        </li>
        <li>
          <strong>The hollow purple circle, "The passing observer", with its arrow.</strong> The second person, who moves along the same line. Its arrow shows their way and speed. They
          are used in {picture2}.
        </li>
        {playing && (
          <li>
            <strong>The yellow ring and the lump "1+2".</strong> The ring flashes at the moment of collision. Afterward there is one lump, drawn larger: its area is M ÷ m times the area of one
            lump, so its size is a rough picture of its mass. The numbers under it, and <strong>M</strong>, are in the same units, with M in units of <em>m</em>.
          </li>
        )}
        {barsDrawn && (
          <li>
            <strong>The two short bars.</strong> The grey bar is the two masses added, 2m. The blue bar is the mass M of the lump. They share one scale, so you can compare their lengths
            directly.
          </li>
        )}
        {barsDrawn && guess !== null && !own && (
          <li>
            <strong>The white tick and the YOUR GUESS box.</strong> This is the answer you chose, drawn across the bars. It is <strong>only a marker</strong>: it has no size of its own, it
            only shows whether you chose "less than", "exactly" or "more than" 2m, and it does not change either bar.
          </li>
        )}
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What to look for in {picture1}.</strong>
      </p>
      <LookForList items={picture1Items} />
      {!own && (
        <WhereFrom>
          <strong>Calculated here:</strong> every number and bar, from the rules of special relativity given in Section A. <strong>Measured:</strong> nothing on this page. The rules have been tested in particle
          accelerators (the tutor says more). <strong>Imagined for the question:</strong> the lumps and the observers.
        </WhereFrom>
      )}

      {observerDrawn && (
        <>
          <p style={{ margin: '1.25rem 0 0.5rem' }}>
            <strong>{picture2}: the same collision, as the passing observer sees it.</strong> It appears below {picture1} after the lab's collision has played. It is drawn in purple instead of blue,
            so you can tell at a glance whose numbers you are reading.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Whose view it is.</strong> The passing observer moves along the same line, so for <em>them</em> it is the lab, and everything in it, that moves. The lumps therefore
              move at different speeds than in {picture1}, and may not move at equal speeds. The lump after the collision is generally not at rest either.
            </li>
            <li>
              <strong>The same scale.</strong> The drawing uses the same number of pixels for each 1c of speed as {picture1}, so you can compare how far and how fast things move in the two
              pictures.
            </li>
            <li>
              <strong>The purple numbers.</strong> Each is what this observer measures with their own ruler and clocks: a speed, an energy and a momentum × c for each lump, then the same for the
              lump afterward, and its mass <strong>M</strong>.
            </li>
          </ul>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>What to look for in {picture2}.</strong>
          </p>
          <LookForList items={picture2Items} />
          <p style={{ margin: '0.75rem 0 0' }}>
            <strong>A worked moment, with numbers that are not among the choices.</strong> Say each lump moves at 0.5c in the lab. In the lab's picture you would read, under Lump 1, speed 0.50c,
            energy 1.155 and momentum × c 0.577, and under Lump 2, speed 0.50c, energy 1.155 and momentum × c −0.577. Before the collision, the total energy is 1.155 + 1.155 = 2.309 and the total
            momentum × c is 0.577 + (−0.577) = 0. Now say the passing observer moves at +0.2c. The rule is the one from Section A: divide by the time dilation factor at 0.2c, which is √(1 − 0.04) =
            0.980, and use energy − 0.2 × momentum × c and momentum × c − 0.2 × energy. For Lump 1, the energy is (1.155 − 0.2 × 0.577) ÷ 0.980 = 1.061 and the momentum × c is (0.577 − 0.2 × 1.155) ÷
            0.980 = 0.354. For Lump 2, they are (1.155 + 0.2 × 0.577) ÷ 0.980 = 1.296 and (−0.577 − 0.2 × 1.155) ÷ 0.980 = −0.825. So this observer's totals before the collision are 2.357 and
            −0.471. The experiment does this arithmetic for you, and shows what happens after the collision.
          </p>
          {!own && (
            <WhereFrom>
              <strong>Calculated here:</strong> every number, by the same rule that carried the lump's energy and momentum from one observer to another in Section A. <strong>Measured:</strong> nothing
              on this page. <strong>Imagined for the question:</strong> the lumps and the observers.
            </WhereFrom>
          )}
          {totalsDrawn && !own && (
            <>
              <p style={{ margin: '1.25rem 0 0.5rem' }}>
                <strong>{picture2}, lower panel: the passing observer's everyday totals.</strong> It appears under the purple picture once the passing observer's lump has formed. It has its own
                scale, so its bars cannot be compared with the mass bars in {picture1}. It asks the question of your second prediction.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The dashed line, "zero".</strong> A total of zero. A bar to the left of it is a total to the left, and a bar to the right of it is a total to the right. A longer bar means a bigger total.
                </li>
                <li>
                  <strong>The solid purple bar.</strong> The total <em>before</em> the collision: each lump's mass <em>m</em> times its speed, added for the two lumps, using the speeds the passing observer
                  measures.
                </li>
                <li>
                  <strong>The outlined purple bar.</strong> The total <em>after</em> the collision: the lump's mass 2<em>m</em> times its speed, using the speed the passing observer measures. It is outlined
                  instead of solid so that the two can be told apart.
                </li>
                <li>
                  <strong>The numbers on the bars.</strong> Each total in units of <em>m</em> × <em>c</em>, where <em>c</em> is the speed of light. For example, a total of −0.50 is half of m × c, to the left.
                </li>
                {everydayGuess !== null && (
                  <li>
                    <strong>The white tick and the YOUR GUESS box.</strong> This is the answer you chose to the second prediction, drawn across the outlined bar. It is <strong>only a marker</strong>:
                    it has no size of its own. If you chose "the same", it sits where the solid bar ends. If you chose "not the same", it sits a fixed distance away. It does not change either bar.
                  </li>
                )}
              </ul>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What to look for in the lower panel.</strong>
              </p>
              <LookForList items={totalsItems} />
              <WhereFrom>
                <strong>Calculated here:</strong> both totals, from the speeds that the passing observer measures (found by the rule of Section A) and the everyday rule <em>mass × speed</em>.{' '}
                <strong>Measured:</strong> nothing on this page. <strong>Imagined for the question:</strong> the lumps, the observer, and the idea of adding mass × speed with this observer's speeds, which is
                the everyday rule being tested.
              </WhereFrom>
            </>
          )}
        </>
      )}
      <p style={{ ...smallNote, marginTop: '0.75rem' }}>
        The animation takes about 12 seconds. It only sets how fast you watch, and it does not change what the experiment finds. At the end, everything stays on the screen.
      </p>
    </div>
  )
}

type PlayStatus = 'idle' | 'running' | 'complete'

// Plays a run: progress goes from 0 to 1 over ANIMATION_DURATION_MS, then the status becomes 'complete'. The length only sets how fast the result is shown (§11).
function usePlayback(status: PlayStatus, setStatus: (status: PlayStatus) => void, setProgress: (progress: number) => void) {
  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId: number
    const animate = (currentTime: number) => {
      const fraction = clamp01((currentTime - startTime) / ANIMATION_DURATION_MS)
      setProgress(fraction)
      if (fraction >= 1) {
        setStatus('complete')
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, setStatus, setProgress])
}

// Section B. Part 1 is one guess about one fixed run, and locks when Run is pressed. Parts 2 to 4 appear once that run has finished. Start over clears everything of
// Section B. `skippedPartOne` is true when the learner reached Section B with the skip link instead of through Section A's tutor; the introduction then adds a reminder,
// because it uses the combination from Section A. `onBackToPartOne` scrolls back up to Section A. `onExplained` is called when the learner reaches the tutor's explanation, which
// shows Section C. `onGoToPartThree` is the skip link to Section C ("Go to Section C - Reactions" once it is open).
export function EnergyMomentumCollision({
  skippedPartOne = false,
  onBackToPartOne,
  onExplained,
  onGoToPartThree,
  partThreeShown = false,
}: {
  skippedPartOne?: boolean
  onBackToPartOne?: () => void
  onExplained?: () => void
  onGoToPartThree?: () => void
  partThreeShown?: boolean
}) {
  // ---- Part 1: one guess, one fixed run (two lumps at 0.6c, a passing observer at +0.3c) ----
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [everydayGuess, setEverydayGuess] = useState<EverydayTotalGuess | null>(null)
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState<PlayStatus>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the Start overs, so the tutor starts again at its first question.
  const [resetCount, setResetCount] = useState(0)

  // ---- Part 2: the learner's own speeds ----
  const [speed, setSpeed] = useState(SECTION_B_SPEED)
  const [passingSpeed, setPassingSpeed] = useState(SECTION_B_PASSING_SPEED)
  const [ownStatus, setOwnStatus] = useState<PlayStatus>('idle')
  const [ownProgress, setOwnProgress] = useState(0)

  const partOneDone = status === 'complete'
  const playing = status === 'running' || ownStatus === 'running'
  const startOverDisabled = (prediction === null && everydayGuess === null && status === 'idle' && ownStatus === 'idle') || playing

  usePlayback(status, setStatus, setProgress)
  usePlayback(ownStatus, setOwnStatus, setOwnProgress)

  const handleRun = () => {
    if (prediction === null || everydayGuess === null || locked) return
    setLocked(true)
    setProgress(0)
    setStatus('running')
  }
  // Start over: clears the guess, the runs, the results and the tutor of Section B, and returns Section B to its first state.
  const handleStartOver = () => {
    if (playing) return
    setPrediction(null)
    setEverydayGuess(null)
    setLocked(false)
    setStatus('idle')
    setProgress(0)
    setSpeed(SECTION_B_SPEED)
    setPassingSpeed(SECTION_B_PASSING_SPEED)
    setOwnStatus('idle')
    setOwnProgress(0)
    setResetCount((n) => n + 1)
  }
  const chooseOwn = (change: () => void) => {
    change()
    setOwnStatus('idle')
    setOwnProgress(0)
  }
  const handleRunOwn = () => {
    setOwnProgress(0)
    setOwnStatus('running')
  }
  const pinkFrame = { borderLeft: `4px solid ${PART_TWO_COLOR}`, paddingLeft: '0.75rem' } as const

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Section B: A collision, seen by two observers</h3>
      {(onBackToPartOne || onGoToPartThree) && (
        <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1rem' }}>
          {onBackToPartOne && (
            <button type="button" onClick={onBackToPartOne} style={linkButton}>
              ← Back to Section A - Energy and momentum
            </button>
          )}
          {onBackToPartOne && onGoToPartThree && ' · '}
          {onGoToPartThree && (
            <button type="button" onClick={onGoToPartThree} style={linkButton}>
              {partThreeShown ? 'Go to Section C - Reactions ↓' : 'Skip to Section C - Reactions'}
            </button>
          )}
        </p>
      )}

      {/* Introduction (draft wording, section 1, for the owner's review, CLAUDE.md §28.1). It does not say what the lump's mass is (that is the prediction, §12). */}
      <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {skippedPartOne && (
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>If you skipped Section A.</strong> This section uses the combination E² − (momentum × c)² from Section A. Open the "Words
            and formulas" panel at the top of the page if you need a reminder of it.
          </p>
        )}
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>The question.</strong> In Section A we followed one particle and saw how its energy and momentum look to different observers. Now we put these ideas to the test with a
          collision. Two identical lumps of clay meet head-on and stick together, so there are two pieces before the collision and one piece after it. Three questions come up. Do two
          observers who move differently agree that the total energy and the total momentum stay the same through the collision? Does the everyday rule for momentum, mass × speed, still work
          when a moving observer measures the speeds? And what is the mass of the single lump that results? You will be asked to predict the last one, and also what a passing observer finds when they add up mass × speed.
        </p>
        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why a collision.</strong> So far we looked at one particle. Now two particles meet. This is how momentum was first
            understood, and it is where the everyday rule <em>mass × speed</em> is put to the test. Here is what that means.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>One particle alone never shows the whole story.</strong> Nothing happens to it, so we can only describe how it
              moves. To see what momentum <em>does</em>, two things have to meet.
            </li>
            <li>
              <strong>Momentum is how hard something is to stop.</strong> A tennis ball rolling toward you is easy to stop with your
              foot. A bowling ball rolling at the same speed is much harder. A tennis ball flying very fast is also harder to stop than
              a slow one. So two things matter: how heavy it is and how fast it moves. The everyday rule puts them together:{' '}
              <em>momentum = mass × speed</em>. For example, a 2 kg bowling ball moving at 3 m/s has momentum 2 × 3 = 6. A 0.1 kg ball
              moving at 3 m/s has momentum 0.1 × 3 = 0.3, so the heavy ball carries 20 times more.
            </li>
            <li>
              <strong>A collision is where momentum shows itself.</strong> Think of a full shopping cart bumping an empty one: the empty
              cart is shoved away and the full cart slows only a little. Think of a cue ball hitting another billiard ball: the cue ball
              slows or stops and the other ball rolls away, as if the push were handed over. Think of two skaters on ice, one pushing
              the other: both glide apart, and the lighter skater moves away faster. Think of a heavy truck meeting a small car: the
              car comes off worse. In each case, what one object loses the other seems to gain, so we can follow the push as it passes
              between them.
            </li>
            <li>
              <strong>Why it is a test.</strong> The rule <em>mass × speed</em> was found by watching slow, everyday things such as
              carts, billiard balls and cars. We do not yet know that it holds everywhere. So we count the total momentum before the
              collision and after it, and check what happens. It is like counting your money before and after a purchase, to see
              whether the totals agree.
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Some new words.</strong> Here is each one in plain language.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Collision:</strong> two things meeting. <strong>Head-on:</strong> meeting from opposite directions.{' '}
              <strong>Stick together:</strong> they join into one lump, as two balls of clay do.
            </li>
            <li>
              <strong>Conserved:</strong> a quantity is conserved if its total does not change. Think of money moved between two
              bank accounts. The money in each account changes, but the total stays the same. In a collision, the{' '}
              <strong>total energy</strong> and the <strong>total momentum</strong> are conserved. We use this as a rule of the
              experiment. The totals add up each piece's value with its direction: a piece moving to the left has a negative
              momentum, so two equal pieces moving toward each other have a total momentum of zero.
            </li>
            <li>
              <strong>System:</strong> the whole group of pieces taken together, as if they were one thing. The pieces' own masses
              are one thing, and the mass of the system is another. The system's mass is worked out from its total energy and its
              total momentum.
            </li>
            <li>
              <strong>The mass of a system:</strong> M = √(E_total² − (P_total c)²). It is the same "subtract the squares"
              combination as before, applied to the totals. In words: "put the total energy and the total momentum through the same
              combination." For example, a group of pieces with a total energy of 5 and a total momentum × c of 3 gives M = √(25 − 9) = √16 = 4.
            </li>
            <li>
              <strong>Internal energy:</strong> energy inside a thing that is not its motion as a whole. A lump of clay that gets
              warm has more internal energy, in the heat of its jiggling atoms.
            </li>
            <li>
              <strong>Lump:</strong> the single piece the two clay lumps become when they stick together.
            </li>
          </ul>
        </div>

        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>A worked everyday example of conservation (momentum).</strong> Two equal billiard balls, 1 kilogram each, roll
          toward each other at 2 meters per second and stick. Before, the total momentum is 1 × 2 + 1 × (−2) = 0. After, they have
          stopped, so the total is 0. The total is unchanged.
        </p>

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What happens.</strong> Two identical lumps of clay move toward each other along a straight line, meet in the lab, and stick together into one lump. The page shows this twice,
            in order.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Before you press Run.</strong> You see the setup: two lumps, each with an arrow for its way and speed, and the numbers the lab measures for each.
            </li>
            <li>
              <strong>Picture 1, the lab's view.</strong> The lumps slide together and a yellow ring flashes where they meet. Afterward there is one lump, with its own numbers. Beside it, two short
              bars let you compare lengths directly: the grey bar is the two masses added, 2m, and the blue bar is the mass M of the lump.
            </li>
            <li>
              <strong>Picture 2, a passing observer's view.</strong> The same collision is replayed as a second person measures it, who moves along the same line. Every number is theirs, so it differs
              from the lab's. Under it, a lower panel adds up mass × speed for this observer, before and after the collision, as two bars on their own scale.
            </li>
            <li>
              <strong>Then it is your turn.</strong> In Part 2 you choose other speeds and run it again. Part 3 gives the numbers, and Part 4 is the tutor.
            </li>
          </ul>
        </div>

        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>Your job.</strong> Predict first. Part 1 uses two lumps that each move at 0.6c in the lab, and a passing observer who moves at 0.3c to the right. You make two predictions: choose one of the three answers about the lump's mass, and one of the two answers about the passing observer.
          Both must be chosen before you can press Run. You are not graded. <strong>Your predictions never change the pictures or the tables.</strong> They come from the physics. Your first guess is drawn
          on the mass bars in white, and your second on the passing observer's everyday totals, each with a box labelled YOUR GUESS, and both are shown again beside the results. After your first run, Part 2 lets you choose other speeds. Those choices <em>do</em> change the drawings, but not your
          predictions. If you want to change your predictions, press Start over.
        </p>
        <p style={{ margin: 0 }}>
          <strong>What we assume.</strong> Nothing escapes: no light or heat leaves the lump. Speeds are steady before and after the
          collision, and the collision itself is not shown in detail, only the situation just before and just after.
        </p>
      </div>

      <EnergyMomentumCollisionLinks />

      {/* ===== Part 1: predict, then watch ===== */}
      <PartHeader color={PART_ONE_COLOR} title="Part 1: Predict, then watch">
        You will predict how the mass of the lump that two clay lumps make compares with the two masses added, then guess what the passing observer finds when they add up mass × speed, press Run and watch the collision from two points of view. Your guesses are drawn on the
        real bars in white. They never change them.
      </PartHeader>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction (1 of 2): the mass of the lump</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
          Two identical lumps of clay, each of mass <em>m</em> (that is, <em>m</em> measured when the lump is at rest), move toward each other at {SECTION_B_SPEED}c in the lab, collide head-on and stick
          together. Energy and momentum are not lost: nothing escapes. What is the mass of the single lump that results, compared with 2<em>m</em>, the two masses added?
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>What Run will show.</strong> Pressing Run plays this one collision twice. <strong>Picture 1</strong> is the lab's view, where the two lumps move toward each other at {SECTION_B_SPEED}c.
          <strong> Picture 2</strong> is the same collision as a <strong>passing observer</strong> sees it: a second person who moves steadily past the lab, along the same line, at{' '}
          {passingLabel(SECTION_B_PASSING_SPEED)} to the right (think of someone watching the same crash from a train that is passing by). You make two predictions before you press Run: the first is about the mass of the single lump, and the second is about
          what the passing observer finds when they add up <em>mass × speed</em>. You will see both pictures.
        </p>
        <div>
          {PREDICTION_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              disabled={locked}
              onClick={() => setPrediction(choice.value)}
              className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
              style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
          {prediction === null
            ? 'Choose an option to continue'
            : locked
              ? 'Your prediction is locked while you try other settings. To change it, press Start over.'
              : `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.slice(0, 3)}. You can still change it until you press Run.`}
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction (2 of 2): the passing observer</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
          Now think about Picture 2. The passing observer measures each lump's speed for themselves, so their speeds differ from the lab's. They add up <em>mass × speed</em> for the two lumps
          before the collision, and again for the single lump after it. Is the everyday total the same before and after, for this observer?
        </p>
        <div>
          {EVERYDAY_TOTAL_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              disabled={locked}
              onClick={() => setEverydayGuess(choice.value)}
              className={`toggle-button${everydayGuess === choice.value ? ' is-selected' : ''}`}
              style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
          {everydayGuess === null
            ? 'Choose an option to continue'
            : locked
              ? 'Your prediction is locked while you try other settings. To change it, press Start over.'
              : `Your prediction: ${EVERYDAY_TOTAL_CHOICES.find((c) => c.value === everydayGuess)?.label.slice(0, 3)}. You can still change it until you press Run.`}
        </p>
      </div>

      <button type="button" className="action-button" onClick={handleRun} disabled={prediction === null || everydayGuess === null || locked} style={{ padding: '0.6rem 1.5rem' }}>
        {status === 'running' ? 'Running...' : locked ? 'Run (done)' : 'Run (lab view, then passing observer)'}
      </button>
      <button
        type="button"
        onClick={handleStartOver}
        disabled={startOverDisabled}
        className="secondary-button"
        style={{ marginLeft: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: startOverDisabled ? 'not-allowed' : 'pointer', opacity: startOverDisabled ? 0.5 : 1 }}
      >
        Start over
      </button>
      {(prediction === null || everydayGuess === null) && <p style={smallNote}>Choose both predictions above to run the experiment.</p>}

      <p style={pictureTitle}>Pictures 1 and 2: the collision, as the lab sees it and as a passing observer sees it</p>
      <CollisionDiagram speed={SECTION_B_SPEED} passingSpeed={SECTION_B_PASSING_SPEED} progress={status === 'idle' ? null : progress} guess={prediction} everydayGuess={everydayGuess} />
      {status === 'idle' && (
        <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.75rem' }}>
          Picture 2, the passing observer's view, and your two white guesses (one on the mass bars, one on the passing observer's everyday totals), appear in this picture when you press Run.
        </p>
      )}
      <CollisionCaptions speed={SECTION_B_SPEED} passingSpeed={SECTION_B_PASSING_SPEED} progress={status === 'idle' ? null : progress} guess={prediction} everydayGuess={everydayGuess} />

      {/* ===== Part 2: appears when the first Run has finished ===== */}
      {partOneDone && (
        <>
          <PartHeader color={PART_TWO_COLOR} title="Part 2: Now try it yourself">
            You choose a different speed for the lumps, or a different speed for the passing observer, and run it again. These choices change the drawings. Your prediction does not. They are trial
            values for imagined lumps, and they do not say that real lumps are like that.
          </PartHeader>

          <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
            Your prediction does not change the drawings or the tables. These settings change Drawing A and Drawing B below, and they do not change Part 3's tables, which are for Part 1's run.
          </p>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The speed of each lump in the lab</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
              Both lumps move at this same speed, given as a fraction of <strong>c</strong>, the speed of light. One moves to the right and the other to the left.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              {SPEED_PRESETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={ownStatus === 'running'}
                  onClick={() => chooseOwn(() => setSpeed(value))}
                  className={`toggle-button${speed === value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {value}c
                </button>
              ))}
            </div>

            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The passing observer's speed</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
              The passing observer moves along the same line. A plus sign means they move to the right, and a minus sign to the left.
            </p>
            <div>
              {PASSING_SPEED_PRESETS.map((value) => (
                <button
                  key={value}
                  type="button"
                  disabled={ownStatus === 'running'}
                  onClick={() => chooseOwn(() => setPassingSpeed(value))}
                  className={`toggle-button${passingSpeed === value ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {passingLabel(value)}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="action-button" onClick={handleRunOwn} disabled={ownStatus === 'running'} style={{ padding: '0.6rem 1.5rem' }}>
            {ownStatus === 'running' ? 'Running...' : 'Run these settings'}
          </button>

          {ownStatus === 'idle' ? (
            <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '1rem' }}>
              Choose the speeds, then press Run these settings. Drawing A (the lab's view) and Drawing B (the passing observer's view) appear here.
            </p>
          ) : (
            <div style={pinkFrame}>
              <p style={{ ...pictureTitle, color: PART_TWO_COLOR }}>
                Drawings A and B: the collision for your settings (lumps at {speed}c, passing observer at {passingLabel(passingSpeed)})
              </p>
              <CollisionDiagram speed={speed} passingSpeed={passingSpeed} progress={ownProgress} own />
              <CollisionCaptions speed={speed} passingSpeed={passingSpeed} progress={ownProgress} own />
            </div>
          )}

          {/* ===== Part 3: the results of Part 1's run (tables unchanged in this step) ===== */}
          <PartHeader color={PART_THREE_COLOR} title="Part 3: The results">
            Here are the numbers behind Part 1's pictures. The tables never change with your prediction or with the settings you tried in Part 2. Your two guesses are shown beside them, as you chose them.
          </PartHeader>
          {prediction !== null && everydayGuess !== null && (
            <CollisionResults speed={SECTION_B_SPEED} passingSpeed={SECTION_B_PASSING_SPEED} prediction={prediction} everydayGuess={everydayGuess} />
          )}

          {/* ===== Part 4: the tutor (unchanged in this step) ===== */}
          <PartHeader color={PART_FOUR_COLOR} title="Part 4: The tutor">
            The tutor asks you three questions, one at a time, about what you saw, then gives its explanation. The tutor's questions are not marked.
          </PartHeader>
          {prediction !== null && everydayGuess !== null && (
            <EnergyMomentumCollisionTutor
              key={resetCount}
              speed={SECTION_B_SPEED}
              passingSpeed={SECTION_B_PASSING_SPEED}
              predicted={prediction}
              everydayPredicted={everydayGuess}
              onExplained={onExplained}
            />
          )}
        </>
      )}
    </div>
  )
}
