import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { EnergyMomentumCollisionTutor } from './EnergyMomentumCollisionTutor'
import { runCollisionExperiment, systemMassOf, totalsOf } from '../physics/energyMomentum'

// Steps 4 to 7 of docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md, Part 2 only: the introduction (stage B), the
// controls, the setup diagram, the prediction that gates Run, the run that connects the diagram to the physics model (the lab's
// view of the collision, with a bar for 2m beside the lump's mass M, and then the passing observer's view of the same collision),
// and the results shown when the run ends (values only, neutral; the explanation is the tutor's, §12). Every number comes from
// `runCollisionExperiment` in `energyMomentum.ts`. The tutor (`EnergyMomentumCollisionTutor`) follows the results. The presets are Decision 5 of that specification.
// Wording here is draft for the owner's review (CLAUDE.md §28.1).
type Prediction = 'less' | 'same' | 'more'

// The three answers of Part 2's prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1).
// Not scored, and the learner is not told which is right (§12).
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'less', label: '(a) Less than 2m.' },
  { value: 'same', label: '(b) Exactly 2m.' },
  { value: 'more', label: '(c) More than 2m.' },
]

// The terms and formulas that stage B's introduction defines, added to the "Words and formulas" panel at the top of the page
// once Part 2 appears (spec, Introduction, rule 5). They repeat the introduction's wording, with no new claims.
export const PART_TWO_REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Collision', meaning: 'two things meeting. Head-on means from opposite directions. Stick together means they join into one lump.' },
  {
    term: 'Conserved',
    meaning: 'a quantity is conserved if its total does not change. Here, the total energy and the total momentum are conserved in a collision.',
  },
  { term: 'System', meaning: 'the whole group of pieces taken together, as if they were one thing.' },
  { term: 'Internal energy', meaning: 'energy inside a thing that is not its motion as a whole, such as the heat in a warm lump of clay.' },
  {
    term: 'Mass of a system: M = √(E_total² − (P_total c)²)',
    meaning: 'put the total energy and the total momentum × c through the same “subtract the squares” combination.',
  },
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
}

// While idle it draws the lab's setup, just before the collision, with the passing observer marked. While the run plays it
// shows the lab's collision first, with a bar for 2m beside the lump's mass M, and then the same collision as the passing
// observer sees it, both in the same style.
function CollisionDiagram({ speed, passingSpeed, progress }: CollisionDiagramProps) {
  const result = runCollisionExperiment(speed, passingSpeed)
  const playing = progress !== null
  const complete = progress !== null && progress >= 1
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  const observerQ = playing ? clamp01((progress - LAB_END) / (OBSERVER_END - LAB_END)) : 0
  const showObserverPicture = playing && progress > LAB_END
  const labStory = panelStory(labQ)
  const observerSpeeds: [number, number] = [result.passingBefore[0].speed, result.passingBefore[1].speed]

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
          <text x="340" y={LAB_LINE_Y + 50} fontSize="10" fill={MUTED_COLOR}>
            The two masses added, 2m
          </text>
          <rect x="340" y={LAB_LINE_Y + 54} width={2 * MASS_BAR_UNIT} height="8" rx="2" fill="#94a3b8" />
          <text x="340" y={LAB_LINE_Y + 76} fontSize="10" fill={LAB_COLOR}>
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
          title="Picture 2: the same collision, as the passing observer sees it"
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
    </g>
  )

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
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
        {playing ? "Picture 1: the lab's view of the collision" : "The lab's view, just before the collision"}
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

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
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

// The results, shown only when the run ends. Values only, with plain labels: what they mean is the tutor's to explain (§12).
function CollisionResults({ speed, passingSpeed, prediction }: { speed: number; passingSpeed: number; prediction: Prediction }) {
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

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '0.5rem', marginTop: 0 }}>Results</h3>
      <p style={INTRO}>
        Each lump moved at {speed}c in the lab. The passing observer moved at {passingLabel(passingSpeed)}.{' '}
        <strong>Your prediction was:</strong> {PREDICTION_CHOICES.find((c) => c.value === prediction)?.label} It is only recorded
        here, not marked right or wrong.
      </p>

      <p style={INTRO}>
        <strong>The mass of the lump.</strong> Masses are in units of <em>m</em>, the mass of one lump.
      </p>
      <Table
        head={['', 'In units of m']}
        rows={[
          ['The two masses added, 2m', formatNumber(2)],
          ["The lump's mass, M", formatNumber(result.lumpMass)],
          ['The extra, M − 2m', formatNumber(result.extraMass)],
        ]}
      />

      <p style={{ ...INTRO, marginTop: '1rem' }}>
        <strong>The total energy before and after the collision, for each observer.</strong> Energy is in rest energies of one
        lump. Each difference is the total after minus the total before.
      </p>
      <Table
        head={['Observer', 'Before', 'After', 'Difference']}
        rows={[
          conservationRow('The lab', labBefore.energy, labAfter.energy),
          conservationRow('The passing observer', passingBefore.energy, passingAfter.energy),
        ]}
      />

      <p style={{ ...INTRO, marginTop: '1rem' }}>
        <strong>The total momentum × c before and after the collision, for each observer.</strong> It is in the same units as the
        energy. A minus sign means the total points to the left.
      </p>
      <Table
        head={['Observer', 'Before', 'After', 'Difference']}
        rows={[
          conservationRow('The lab', labBefore.momentumTimesC, labAfter.momentumTimesC),
          conservationRow('The passing observer', passingBefore.momentumTimesC, passingAfter.momentumTimesC),
        ]}
      />

      <p style={{ ...INTRO, marginTop: '1rem' }}>
        <strong>The everyday momentum, for the passing observer.</strong> The everyday rule is mass × speed. Here it is worked out
        with the speeds the passing observer measures, each in units of c, and with each lump's mass taken as m. For the lump
        afterward, the mass is taken as 2m.
      </p>
      <Table
        head={['', 'Before', 'After', 'Difference']}
        rows={[
          [
            'm × (the sum of the speeds)',
            formatNumber(result.newtonMomentumBefore),
            formatNumber(result.newtonMomentumAfter),
            formatDifference(result.newtonMomentumAfter - result.newtonMomentumBefore),
          ],
        ]}
      />

      <p style={{ ...INTRO, marginTop: '1rem' }}>
        <strong>The mass of the whole system, and the sum of the separate masses.</strong> The mass of the whole system is worked
        out from the total energy and the total momentum × c, as M = √(E_total² − (P_total c)²). The sum of the separate masses adds
        up the masses of the pieces: 2m before, and the single lump's M after. Masses are in units of m.
      </p>
      <Table
        head={['', 'Before', 'After']}
        rows={[
          ['Mass of the whole system, found by the lab', formatNumber(result.systemMass), formatNumber(labSystemMassAfter)],
          ['Mass of the whole system, found by the passing observer', formatNumber(passingSystemMassBefore), formatNumber(passingSystemMassAfter)],
          ['Sum of the separate masses', formatNumber(2), formatNumber(result.lumpMass)],
        ]}
      />
    </div>
  )
}

// Part 2's section. Changing a setting returns to the setup, so a run is never shown for different settings. Changing the prediction does
// the same.
export function EnergyMomentumCollision() {
  const [speed, setSpeed] = useState(0.6)
  const [passingSpeed, setPassingSpeed] = useState(0.3)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const [runCount, setRunCount] = useState(0)
  const returnToIdle = () => {
    setStatus('idle')
    setProgress(0)
  }

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
  }, [status])

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Part 2 — A collision, seen by two observers</h3>

      {/* Introduction, stage B (needed by Part 2): draft wording for the owner's review (CLAUDE.md §28.1), from the specification's
          "Introduction: three stages". It does not say what the lump's mass is (that is Part 2's prediction, §12). */}
      <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>Why a collision.</strong> So far we looked at one particle. Now two particles meet. This is how momentum was first
          understood, and it is where the everyday rule <em>mass × speed</em> is put to the test.
        </p>

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
              combination." For example, a group of pieces with a total energy of 5 and a total momentum × c of 3 gives M = √(25 − 9) = √16 = 4.{' '}
              <em>What it does not mean:</em> it is not simply the masses of the pieces added together.
            </li>
            <li>
              <strong>Internal energy:</strong> energy inside a thing that is not its motion as a whole. A lump of clay that gets
              warm has more internal energy, in the heat of its jiggling atoms.
            </li>
          </ul>
        </div>

        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>A worked everyday example of conservation (momentum).</strong> Two equal billiard balls, 1 kilogram each, roll
          toward each other at 2 meters per second and stick. Before, the total momentum is 1 × 2 + 1 × (−2) = 0. After, they have
          stopped, so the total is 0. The total is unchanged.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>What happens.</strong> Two identical lumps collide head-on in the lab and stick. Two pictures show it: the lab's
          view, and then the view of a passing observer.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>Your job.</strong> Choose how fast the lumps move and how fast the passing observer moves. Then predict the mass of
          the lump that results, and press Run. You are not graded. The Run button stays off until you choose a prediction. The
          "Words and formulas" panel at the top of the page now includes these new words.
        </p>
        <p style={{ margin: 0 }}>
          <strong>What we assume.</strong> Nothing escapes: no light or heat leaves the lump. Speeds are steady before and after the
          collision, and the collision itself is not shown in detail, only the situation just before and just after.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The speed of each lump in the lab</label>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
          Both lumps move at this same speed, given as a fraction of <strong>c</strong>, the speed of light. One moves to the right
          and the other to the left.
        </p>
        <div style={{ marginBottom: '1rem' }}>
          {SPEED_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setSpeed(value)
                returnToIdle()
              }}
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
              onClick={() => {
                setPassingSpeed(value)
                returnToIdle()
              }}
              className={`toggle-button${passingSpeed === value ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {passingLabel(value)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
          Two identical lumps of clay, each of mass <em>m</em> (that is, <em>m</em> measured when the lump is at rest), move toward
          each other at {speed}c in the lab, collide head-on and stick together. Energy and momentum are not lost: nothing escapes.
          What is the mass of the single lump that results, compared with 2<em>m</em>, the two masses added?
        </p>
        <div>
          {PREDICTION_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => {
                setPrediction(choice.value)
                returnToIdle()
              }}
              className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
              style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
          {prediction !== null
            ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.slice(0, 3)}. This is not graded.`
            : 'Choose an option to continue'}
        </p>
      </div>

      <button
        type="button"
        className="action-button"
        onClick={() => {
          setProgress(0)
          setRunCount((n) => n + 1)
          setStatus('running')
        }}
        disabled={prediction === null || status === 'running'}
        style={{ padding: '0.6rem 1.5rem' }}
      >
        {status === 'running' ? 'Running...' : 'Run'}
      </button>
      {prediction === null && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>
          Choose a prediction above to run the experiment.
        </p>
      )}

      <div style={{ marginTop: '2rem' }}>
        <CollisionDiagram speed={speed} passingSpeed={passingSpeed} progress={status === 'idle' ? null : progress} />
      </div>

      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>How to read this diagram.</strong> Before you press Run, it shows the situation just before the collision, as
          the lab sees it. The two sky-blue circles, <strong>Lump 1</strong> and <strong>Lump 2</strong>, are identical lumps of
          clay. Each arrow shows the way its lump is moving, and a longer arrow means a faster lump. Under each lump are the numbers
          the lab measures for it: its speed, its energy, and its momentum × c. A minus sign on the momentum means the lump moves
          to the left, which is why Lump 2's momentum is the negative of Lump 1's. The dashed line marks where they meet. The{' '}
          <strong>hollow purple circle</strong> is the passing observer, who moves along the same line. Its arrow shows which way
          they move and, by its length, how fast. For your current choice, each lump moves at {speed}c, and the passing observer
          moves at {passingLabel(passingSpeed)}.
        </p>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>What happens when you press Run.</strong>
        </p>
        <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Picture 1, the lab.</strong> The lumps move toward each other and meet at the dashed line. A yellow ring marks
            the collision. Afterward there is one lump, drawn at the dashed line. It is drawn larger because it has more mass. The
            labels give its energy, its momentum × c and its mass M, in units of the mass m of one lump. Two bars beside it
            compare M with 2m, the two masses added.
          </li>
          <li>
            <strong>Picture 2, the passing observer.</strong> Then the same collision is shown as the passing observer sees it, in
            purple. The lumps move at different speeds than in the lab, and the lump afterward is not at rest. Each purple number
            is what that observer measures.
          </li>
          <li>
            The animation takes about 12 seconds. It only sets how fast you watch, and it does not change what the experiment
            finds. At the end, everything stays on the screen.
          </li>
        </ol>
      </div>

      {status === 'complete' && prediction !== null && <CollisionResults speed={speed} passingSpeed={passingSpeed} prediction={prediction} />}
      {status === 'complete' && prediction !== null && (
        <EnergyMomentumCollisionTutor key={runCount} speed={speed} passingSpeed={passingSpeed} predicted={prediction} />
      )}
    </div>
  )
}
