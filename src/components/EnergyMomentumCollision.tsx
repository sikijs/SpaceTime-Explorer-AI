import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { runCollisionExperiment } from '../physics/energyMomentum'

// Steps 4 and 5 of docs/experiments/spacetime-geometry/05-energy-momentum-and-mass.md, Part 2 only: the controls, the setup
// diagram, and the run that connects the diagram to the physics model: the lab's view of the collision (the two lumps meet and
// stick into one at rest, drawn beside a bar for 2m so the extra mass is visible), and then the passing observer's view of the
// same collision. Every number comes from `runCollisionExperiment` in `energyMomentum.ts`. The introduction stage for Part 2,
// the prediction (which will gate Run), the results tables (conservation, everyday momentum, whole-system mass) and the tutor
// are later steps. Presets are Decision 5 of the specification. Wording here is
// draft for the owner's review (CLAUDE.md §28.1).
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

// Part 2's section. Changing a setting returns to the setup, so a run is never shown for different settings. The prediction (which
// will gate Run), the results tables and the tutor are later steps.
export function EnergyMomentumCollision() {
  const [speed, setSpeed] = useState(0.6)
  const [passingSpeed, setPassingSpeed] = useState(0.3)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
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

      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
        Two identical lumps of clay move toward each other along one line, collide head-on and stick together. The lab measures
        them, and so does a passing observer. Choose how fast each lump moves and how fast the passing observer moves, then press
        Run. (The introduction, the prediction and the results for this part come in later steps.)
      </p>

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

      <button
        type="button"
        className="action-button"
        onClick={() => {
          setProgress(0)
          setStatus('running')
        }}
        disabled={status === 'running'}
        style={{ padding: '0.6rem 1.5rem' }}
      >
        {status === 'running' ? 'Running...' : 'Run'}
      </button>

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
    </div>
  )
}
