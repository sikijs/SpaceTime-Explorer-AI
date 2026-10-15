import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { runMakingExperiment } from '../physics/makingNewParticles'
import type { MakingExperimentResult, SetupResult } from '../physics/makingNewParticles'
import { systemMassOf, totalsOf } from '../physics/energyMomentum'
import { MakingNewParticlesTutor } from './MakingNewParticlesTutor'
import { REFERENCE_ENTRIES, ReferencePanel } from './EnergyMomentumExperiment'
import { PART_TWO_REFERENCE_ENTRIES } from './EnergyMomentumCollision'
import { PART_THREE_REFERENCE_ENTRIES } from './EnergyMomentumReactions'

// Step 4 of docs/experiments/spacetime-geometry/06-making-new-particles.md (the basic interface), Part 1 only: the two controls
// (the energy of motion supplied, K, and the new particle's mass, X), a labeled diagram of the stationary-target setup, the
// head-on setup and the stationary-target setup as the system's own observer sees it, bars for the usable and locked-in energy
// and for the system's mass, a verdict for each setup, and the "How to read this diagram" caption (CLAUDE.md §14).
// Step 5 connects the diagram to the physics model through a Run: the particles approach and collide in the lab's two pictures,
// then the system's own observer's picture of Setup A appears, then the bars fill and the verdicts and numbers appear. Before Run,
// only the setups are shown, so nothing is revealed early (§12). Every number comes from `runMakingExperiment` (CLAUDE.md §9).
// Step 6 adds Part 1's prediction, which gates Run (spec, "Prediction Activity"). It is not scored, and the learner is not told which
// answer is right (§12). Step 7 adds the results, shown when the run ends: values only, with plain labels (the explanation is the
// tutor's, §12). There is deliberately no introduction or tutor yet, and no Part 2: those are later steps.
// The introduction (stage A) and the "Words and formulas" panel were added after Step 7, at the owner's request. Wording here is draft for the owner's review (CLAUDE.md §28.1).

// The terms and formulas that stage A's introduction defines, added to the "Words and formulas" panel after Experiment 5's entries
// (spec, Introduction, rule 5). They repeat the introduction's wording, with no new claims.
const PART_ONE_REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  {
    term: 'Beam, target, stationary target',
    meaning: 'a beam is a stream of particles moving the same way. The target is what it hits. A stationary target is at rest in the lab.',
  },
  { term: 'Collider', meaning: 'a machine in which two beams are sent toward each other and meet head-on.' },
  {
    term: 'Energy of motion supplied, K',
    meaning:
      'the total kinetic energy of all the moving particles in the lab, in rest energies of one colliding particle. K = 3 is three times that rest energy.',
  },
  {
    term: 'New particle, mass X',
    meaning:
      'a particle that was not there before the collision. Here it is made up and neutral, and X is its mass in masses of one colliding particle.',
  },
  {
    term: 'The system’s own observer',
    meaning: 'an observer for whom the total momentum of the system is zero. They travel along with the system as a whole.',
  },
  {
    term: 'Usable energy, U = M − 2',
    meaning:
      'the system’s mass minus the rest masses of the two colliding particles. It is the part of the energy of motion that can become the mass of new particles.',
  },
  {
    term: 'Locked-in energy, L = K − U',
    meaning: 'the part of the energy of motion tied up in the motion of the whole system, which cannot become mass.',
  },
  {
    term: 'Threshold for a new particle: M ≥ 2 + X',
    meaning: 'a new particle of mass X can be made only if the system’s mass is at least the two colliding particles’ masses plus X.',
  },
]

type Prediction = 'setup-a' | 'same' | 'setup-b'

// The three answers of Part 1's prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1).
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'setup-a', label: '(a) Setup A, the stationary target.' },
  { value: 'same', label: '(b) The same for both.' },
  { value: 'setup-b', label: '(c) Setup B, the head-on beams.' },
]

const ENERGY_PRESETS = [1, 2, 5, 10, 100]
const MASS_PRESETS = [0.5, 1, 2, 4]

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
const OWN_COLOR = '#c4b5fd'
const USABLE_COLOR = '#4ade80'
const LOCKED_COLOR = '#fb923c'
const NEEDED_COLOR = '#facc15'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

const VIEW_WIDTH = 520
const MEET_X = 260
const PARTICLE_RADIUS = 14
// Pixels of travel before the collision for each 1c of speed, the same in all pictures so that speeds can be compared.
const PIXELS_PER_SPEED = 120
const PANEL_HEIGHT = 260

// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
const ANIMATION_DURATION_MS = 12_000
// The share of the playback used by each stage: the lab's two pictures, then the system's own observer's picture, then the bars.
const LAB_END = 0.4
const OWN_END = 0.8

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

// Where a picture is in its own story, from 0 to 1: a pause, the particles approaching (approach 0 to 1), then the collision.
function panelStory(q: number): { approach: number; collided: boolean; flash: number } {
  const approach = clamp01((q - 0.2) / 0.45)
  const smooth = approach * approach * (3 - 2 * approach)
  return { approach: smooth, collided: q >= 0.65, flash: q >= 0.65 && q < 0.8 ? 1 - (q - 0.65) / 0.15 : 0 }
}

function formatNumber(value: number, digits = 2): string {
  const text = value.toFixed(digits)
  // A value that rounds to zero is shown without a minus sign.
  return /^-0\.0+$/.test(text) ? text.slice(1) : text.replace('-', '−')
}

function directionWords(speed: number): string {
  return Math.abs(speed) < 5e-10 ? 'at rest' : speed > 0 ? 'moving right' : 'moving left'
}

function arrowId(color: string): string {
  return `making-arrowhead-${color.slice(1)}`
}

interface ArrowProps {
  x: number
  y: number
  speed: number
  radius: number
  color: string
}

// An arrow leaving a particle in the direction it moves; a longer arrow means a faster particle.
function MotionArrow({ x, y, speed, radius, color }: ArrowProps) {
  if (Math.abs(speed) < 5e-10) return null
  const direction = Math.sign(speed)
  return (
    <line
      x1={x + direction * (radius + 4)}
      y1={y}
      x2={x + direction * (radius + 4 + 14 + 50 * Math.abs(speed))}
      y2={y}
      stroke={color}
      strokeWidth="2.5"
      markerEnd={`url(#${arrowId(color)})`}
    />
  )
}

interface PanelProps {
  top: number
  title: string
  subtitle: string
  color: string
  // The two particles before the collision: where they sit on the line, and their name, speed and energy.
  particles: { x: number; name: string; speed: number; energy: number }[]
  // The system as a whole after the collision: its speed (0 if it stays at rest).
  systemSpeed: number
  systemNote: string
  // How far this picture's story has got, from 0 (the setup) to 1.
  q: number
}

// One picture: the particles just before the collision (top row) and the system as a whole afterward (bottom row).
function SetupPanel({ top, title, subtitle, color, particles, systemSpeed, systemNote, q }: PanelProps) {
  const story = panelStory(q)
  const beforeY = top + 100
  const afterY = top + 208
  const systemX = MEET_X
  return (
    <g>
      <text x="12" y={top + 16} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        {title}
      </text>
      <text x="12" y={top + 32} fontSize="11" fill={MUTED_COLOR}>
        {subtitle}
      </text>

      <text x="12" y={beforeY - 40} fontSize="10" fill={MUTED_COLOR}>
        Before the collision
      </text>
      <line x1="20" y1={beforeY} x2={VIEW_WIDTH - 20} y2={beforeY} stroke={TICK_COLOR} strokeWidth="1" strokeDasharray="2 5" />
      <line x1={MEET_X} y1={beforeY - 24} x2={MEET_X} y2={beforeY + 24} stroke={MUTED_COLOR} strokeWidth="1" strokeDasharray="3 4" />
      <text x={MEET_X} y={beforeY - 30} fontSize="10" textAnchor="middle" fill={MUTED_COLOR} style={HALO}>
        where they meet
      </text>
      {story.flash > 0 && (
        <circle
          cx={MEET_X}
          cy={beforeY}
          r={PARTICLE_RADIUS + 30 * (1 - story.flash)}
          fill="none"
          stroke="#facc15"
          strokeWidth="3"
          opacity={story.flash}
        />
      )}
      {particles.map((p) => {
        // Each particle travels from its starting place to the meeting line; a particle already there (the target) stays put.
        const x = MEET_X + (p.x - MEET_X) * (1 - story.approach)
        return (
          <g key={p.name}>
            {!story.collided && <MotionArrow x={x} y={beforeY} speed={p.speed} radius={PARTICLE_RADIUS} color={color} />}
            {!story.collided && <circle cx={x} cy={beforeY} r={PARTICLE_RADIUS} fill={color} stroke="#0b1020" strokeWidth="1.5" />}
            <text x={p.x} y={beforeY + 36} fontSize="11" fontWeight="bold" textAnchor="middle" fill={color} style={HALO}>
              {p.name}
            </text>
            <text x={p.x} y={beforeY + 49} fontSize="10" textAnchor="middle" fill={color} style={HALO}>
              {Math.abs(p.speed) < 5e-10 ? 'at rest' : `${directionWords(p.speed)}, ${formatNumber(Math.abs(p.speed))}c`}
            </text>
          </g>
        )
      })}

      {story.collided && (
        <g>
          <text x="12" y={afterY - 34} fontSize="10" fill={MUTED_COLOR}>
            The whole system, after
          </text>
          <line x1="20" y1={afterY} x2={VIEW_WIDTH - 20} y2={afterY} stroke={TICK_COLOR} strokeWidth="1" strokeDasharray="2 5" />
          <circle cx={systemX} cy={afterY} r={PARTICLE_RADIUS + 4} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="4 3" />
          <MotionArrow x={systemX} y={afterY} speed={systemSpeed} radius={PARTICLE_RADIUS + 4} color={color} />
          <text x={systemX} y={afterY + 34} fontSize="11" fontWeight="bold" textAnchor="middle" fill={color} style={HALO}>
            {systemNote}
          </text>
        </g>
      )}
    </g>
  )
}

// The head-on picture puts the particles on either side of the meeting line; the stationary-target picture puts the target on it.
function labParticles(result: SetupResult): PanelProps['particles'] {
  if (result.setup === 'stationary-target') {
    const [beam, target] = result.labPieces
    return [
      { x: MEET_X - beam.speed * PIXELS_PER_SPEED, name: 'Beam particle', speed: beam.speed, energy: beam.energy },
      { x: MEET_X, name: 'Target (at rest)', speed: target.speed, energy: target.energy },
    ]
  }
  const [right, left] = result.labPieces
  return [
    { x: MEET_X - right.speed * PIXELS_PER_SPEED, name: 'Beam 1', speed: right.speed, energy: right.energy },
    { x: MEET_X - left.speed * PIXELS_PER_SPEED, name: 'Beam 2', speed: left.speed, energy: left.energy },
  ]
}

function ownParticles(result: SetupResult): PanelProps['particles'] {
  const [beam, target] = result.ownPieces
  return [
    { x: MEET_X - beam.speed * PIXELS_PER_SPEED, name: 'Beam particle', speed: beam.speed, energy: beam.energy },
    { x: MEET_X - target.speed * PIXELS_PER_SPEED, name: 'Target', speed: target.speed, energy: target.energy },
  ]
}

// `progress` is null while idle (only the setups are shown), otherwise how far the playback has got, from 0 to 1.
function MakingDiagram({ result, progress }: { result: MakingExperimentResult; progress: number | null }) {
  const playing = progress !== null
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  const ownQ = playing ? clamp01((progress - LAB_END) / (OWN_END - LAB_END)) : 0
  const showOwn = playing && progress > LAB_END
  const A = result.stationaryTarget
  const B = result.headOn
  const total = 3 * PANEL_HEIGHT + 60
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${total}`}
      role="img"
      aria-label={`${playing ? 'Playback' : 'Setup'}. Setup A, the lab's view: a beam particle moving right at ${A.labPieces[0].speed.toFixed(2)}c hits a target at rest. Afterward the whole system keeps moving right at ${A.ownObserverSpeed.toFixed(2)}c. Setup B, the lab's view: two particles meet head-on, each at ${B.labPieces[0].speed.toFixed(2)}c. Afterward the whole system is at rest. Setup A as the system's own observer sees it: the two particles approach each other at ${Math.abs(A.ownPieces[0].speed).toFixed(2)}c each, and the system is at rest. The energy of motion supplied is ${result.energyOfMotion} rest energies of one particle in both setups.`}
      style={SVG_STYLE}
    >
      <defs>
        {[LAB_COLOR, OWN_COLOR].map((color) => (
          <marker
            key={color}
            id={arrowId(color)}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>
      <text x="12" y="18" fontSize="11" fill={MUTED_COLOR}>
        Both setups supply the same energy of motion, K = {result.energyOfMotion}.
      </text>
      <text x="12" y="33" fontSize="11" fill={MUTED_COLOR}>
        Same scale in every picture: a longer arrow is a faster particle.
      </text>
      <g transform="translate(0 40)">
        <SetupPanel
          top={0}
          title="Setup A, the lab's view: a stationary target"
          subtitle="One beam particle hits a particle that is at rest."
          color={LAB_COLOR}
          particles={labParticles(A)}
          systemSpeed={A.ownObserverSpeed}
          systemNote={`the whole system keeps moving at ${formatNumber(A.ownObserverSpeed)}c`}
          q={labQ}
        />
        <SetupPanel
          top={PANEL_HEIGHT}
          title="Setup B, the lab's view: head-on beams"
          subtitle="Two particles of the same kind meet head-on."
          color={LAB_COLOR}
          particles={labParticles(B)}
          systemSpeed={0}
          systemNote="the whole system is at rest"
          q={labQ}
        />
        {showOwn ? (
          <SetupPanel
            top={2 * PANEL_HEIGHT}
            title="Setup A again, as the system's own observer sees it"
            subtitle="The same collision, seen by the observer for whom the total momentum is zero."
            color={OWN_COLOR}
            particles={ownParticles(A)}
            systemSpeed={0}
            systemNote="the whole system is at rest"
            q={ownQ}
          />
        ) : (
          <text x="12" y={2 * PANEL_HEIGHT + 16} fontSize="11" fill={MUTED_COLOR}>
            {playing
              ? "Next, Setup A as the system's own observer sees it."
              : "Press Run to see the collisions, and then Setup A as the system's own observer sees it."}
          </text>
        )}
      </g>
    </svg>
  )
}

const BAR_LEFT = 140
const BAR_WIDTH = 350

interface BarsProps {
  result: MakingExperimentResult
  // How much of each bar is drawn, from 0 to 1; the numbers and markers appear when it reaches 1.
  fill: number
}

// Two groups of bars. First, for each setup, the energy of motion supplied, split into its usable and locked-in parts, with a
// marker at the energy of motion needed to make the chosen new particle. Second, the system's mass of each setup, with a line at
// 2 + X, the mass needed to make the new particle.
function MakingBars({ result, fill }: BarsProps) {
  const full = fill >= 1
  const A = result.stationaryTarget
  const B = result.headOn
  const energyScale = BAR_WIDTH / Math.max(result.energyOfMotion, result.stationaryTargetThreshold, result.headOnThreshold)
  const massNeeded = 2 + result.newMass
  const massScale = BAR_WIDTH / Math.max(A.systemMass, B.systemMass, massNeeded)
  const rowHeight = 22
  const energyRows: [string, SetupResult, number][] = [
    ['A: stationary target', A, result.stationaryTargetThreshold],
    ['B: head-on beams', B, result.headOnThreshold],
  ]
  const massRows: [string, SetupResult][] = [
    ['A: stationary target', A],
    ['B: head-on beams', B],
  ]
  const energyTop = 56
  const massTop = energyTop + 2 * (rowHeight + 18) + 70
  const height = massTop + 2 * (rowHeight + 18) + 64
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      role="img"
      aria-label={`Bars. Energy of motion supplied, K = ${result.energyOfMotion}. Setup A: ${A.usable.toFixed(2)} usable and ${A.lockedIn.toFixed(2)} locked in. Setup B: ${B.usable.toFixed(2)} usable and ${B.lockedIn.toFixed(2)} locked in. System's mass: Setup A ${A.systemMass.toFixed(2)}, Setup B ${B.systemMass.toFixed(2)}, compared with ${massNeeded.toFixed(2)} needed to make a new particle of mass ${result.newMass}.`}
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The energy of motion supplied, K = {result.energyOfMotion}, split in two
      </text>
      <text x="12" y="35" fontSize="11" fill={MUTED_COLOR}>
        Green, solid: usable (can become mass).
      </text>
      <text x="12" y="49" fontSize="11" fill={MUTED_COLOR}>
        Orange, striped: locked in (the motion of the whole system).
      </text>
      <defs>
        <pattern id="making-locked-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#0b1020" />
          <rect width="3" height="6" fill={LOCKED_COLOR} />
        </pattern>
      </defs>
      {energyRows.map(([name, s, threshold], i) => {
        const y = energyTop + i * (rowHeight + 18) + 10
        const needX = BAR_LEFT + threshold * energyScale
        return (
          <g key={name}>
            <text x="12" y={y + 14} fontSize="11" fill={TEXT_COLOR}>
              {name}
            </text>
            <rect x={BAR_LEFT} y={y} width={Math.max(s.usable * energyScale * fill, 0)} height={rowHeight} fill={USABLE_COLOR} />
            <rect
              x={BAR_LEFT + s.usable * energyScale * fill}
              y={y}
              width={Math.max(s.lockedIn * energyScale * fill, 0)}
              height={rowHeight}
              fill="url(#making-locked-stripes)"
              stroke={LOCKED_COLOR}
              strokeWidth="1"
            />
            <line x1={needX} y1={y - 6} x2={needX} y2={y + rowHeight + 6} stroke={NEEDED_COLOR} strokeWidth="2.5" />
            {full && (
              <text x={BAR_LEFT} y={y + rowHeight + 13} fontSize="10" fill={MUTED_COLOR}>
                usable {formatNumber(s.usable)} · locked in {formatNumber(s.lockedIn)}
              </text>
            )}
          </g>
        )
      })}
      <text x="12" y={energyTop + 2 * (rowHeight + 18) + 18} fontSize="10" fill={NEEDED_COLOR}>
        Yellow marker: the K needed to make a new particle of mass {result.newMass}.
      </text>

      <text x="12" y={massTop} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The system's mass, M
      </text>
      <text x="12" y={massTop + 14} fontSize="11" fill={MUTED_COLOR}>
        Yellow line: 2 + X = {formatNumber(massNeeded)}, the least M that
      </text>
      <text x="12" y={massTop + 28} fontSize="11" fill={MUTED_COLOR}>
        can make the new particle.
      </text>
      {massRows.map(([name, s], i) => {
        const y = massTop + 42 + i * (rowHeight + 18)
        return (
          <g key={name}>
            <text x="12" y={y + 14} fontSize="11" fill={TEXT_COLOR}>
              {name}
            </text>
            <rect x={BAR_LEFT} y={y} width={s.systemMass * massScale * fill} height={rowHeight} fill={LAB_COLOR} />
            {full && (
              <text x={BAR_LEFT} y={y + rowHeight + 13} fontSize="10" fill={MUTED_COLOR}>
                M = {formatNumber(s.systemMass)}
              </text>
            )}
          </g>
        )
      })}
      <line
        x1={BAR_LEFT + massNeeded * massScale}
        y1={massTop + 36}
        x2={BAR_LEFT + massNeeded * massScale}
        y2={massTop + 42 + 2 * (rowHeight + 18) - 8}
        stroke={NEEDED_COLOR}
        strokeWidth="2.5"
      />
    </svg>
  )
}

const CELL: CSSProperties = { padding: '0.3rem 1rem 0.3rem 0' }

function verdict(canMake: boolean, newMass: number, threshold: number, energy: number): string {
  return canMake
    ? `A new particle of mass ${newMass} can be made. It needs K ≥ ${formatNumber(threshold)}, and K = ${energy} is supplied.`
    : `A new particle of mass ${newMass} cannot be made. It needs K ≥ ${formatNumber(threshold)}, and only K = ${energy} is supplied.`
}

export function MakingNewParticlesExperiment() {
  const [energyOfMotion, setEnergyOfMotion] = useState(ENERGY_PRESETS[2])
  const [newMass, setNewMass] = useState(MASS_PRESETS[2])
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

  const result = runMakingExperiment(energyOfMotion, newMass)
  const complete = status === 'complete'
  const A = result.stationaryTarget
  const B = result.headOn

  return (
    <div>
      <h2>Experiment 6 — Making New Particles: How Much Energy Does It Take?</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Part 1 — Making a new particle</h3>

        {/* Introduction, stage A (needed by Part 1): draft wording for the owner's review (CLAUDE.md §28.1), from the specification's
            "Introduction: two stages". It does not say which setup leaves more usable energy (that is the prediction, §12). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> In Experiment 5 we found that when you take several particles together, such as two lumps of clay
            about to collide, the whole set has a mass of its own. It is called the system's mass. You work it out from the total energy and
            total momentum of all the particles, and every observer agrees on it. It is not simply the particles' separate masses added up.
            We also saw that energy of motion can change form. When two lumps of clay hit and stick, their energy of motion became internal
            energy, and that made the lump heavier. Particle physicists use this idea on purpose. They smash particles together to make a
            particle that was not there before, and the mass of the new particle has to come from the energy of the collision.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            Here is the practical question. You choose how much energy of motion to give the colliding particles. That amount is K. Some of
            it may be able to change form into the mass of a new particle. How much? Is it all of K, or only part of it? And does it depend
            on how you arrange the collision? You could fire one particle at another that is sitting still, or you could fire two particles
            at each other. In both cases the particles are given the same K. This experiment lets you compare the two, and you will be asked
            to predict which one lets more of K become the mass of a new particle.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A few reminders from Experiment 5.</strong> A particle's rest energy, the energy it has when it is not moving, is our
            unit, written as 1. The mass of a system is M = √(E_total² − (P_total c)²), worked out from its total energy and total momentum.
            And a reaction can make new pieces only if the system's mass is at least the total rest mass of everything that comes out. That
            least value is called the threshold. All three are also in the "Words and formulas" panel below.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> Here is each one in plain language.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Beam:</strong> a stream of particles moving the same way. <strong>Target:</strong> what the beam hits.{' '}
                <strong>Stationary target:</strong> a target that is at rest in the lab. For example, a billiard ball rolling along (the
                beam) hits a ball that is sitting still (the target).
              </li>
              <li>
                <strong>Collider:</strong> a machine in which two beams are sent toward each other and meet head-on.
              </li>
              <li>
                <strong>The energy of motion supplied, K:</strong> the total kinetic energy of all the moving particles in the lab, in rest
                energies of one colliding particle. For example, K = 3 means the energy of motion is three times the rest energy of one
                particle.
              </li>
              <li>
                <strong>New particle:</strong> a particle that was not there before the collision. Here we use a made-up neutral particle of
                mass X, measured in masses of one colliding particle. The colliding particles survive unchanged.
              </li>
              <li>
                <strong>The system's own observer:</strong> an observer for whom the total momentum of the system is zero. They travel along
                with the system as a whole, as the particle's own observer in Experiment 5 travelled along with a particle.
              </li>
              <li>
                <strong>Usable energy:</strong> the part of the energy of motion that can become the mass of new particles.{' '}
                <strong>Locked-in energy:</strong> the part tied up in the motion of the whole system, which cannot.
              </li>
            </ul>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>The formulas we need.</strong> Each comes in words, with a worked example.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>The system's mass again.</strong> A particle at rest has energy 1. If it also has an energy of motion K, its total
                energy is 1 + K, and its momentum × c is √((1 + K)² − 1), because for one particle E² − (pc)² is its mass squared, which is
                1. For example, take K = 3 with one moving particle hitting one at rest. The moving one has energy 4 and momentum × c of √15
                = 3.873, and the one at rest has energy 1 and momentum 0. So E_total = 5, P_total c = 3.873, and M = √(25 − 15) = √10 =
                3.162. Now take the same K = 3 shared between two particles meeting head-on. Each gets an energy of motion of 1.5, so each
                has energy 2.5. Their momenta are equal and opposite, so E_total = 5, P_total c = 0, and M = √(25 − 0) = 5.{' '}
                <em>What it does not mean:</em> M is not the sum of the particles' masses, and each example shows only one setup.
              </li>
              <li>
                <strong>Usable energy:</strong> U = M − 2. In words: "the system's mass, minus the rest masses of the two colliding
                particles." For example, M = 3.162 gives U = 1.162. <em>What it does not mean:</em> it is not the energy of motion measured
                in the lab.
              </li>
              <li>
                <strong>Locked-in energy:</strong> L = K − U. In words: "what is left of the energy supplied." For example, K = 3 and U =
                1.162 give L = 1.838.
              </li>
              <li>
                <strong>The threshold:</strong> a new particle of mass X can be made only if M ≥ 2 + X. For example, a new particle of mass
                X = 1 needs M ≥ 3.
              </li>
            </ul>
          </div>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> Two collisions are set up with the same energy of motion, K. In Setup A, a beam particle hits a
            particle that is at rest in the lab. In Setup B, two particles of the same kind move toward each other and meet head-on. When
            you press Run, the picture plays in stages:
          </p>
          <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              The lab's two pictures play together. The particles move toward the dashed line where they meet, and a ring flashes at the
              moment of the collision.
            </li>
            <li>
              Under each picture, the whole system (all the pieces taken together) is shown afterward as one dashed circle. If the system as
              a whole is moving, it has an arrow, and if it is not moving, it does not.
            </li>
            <li>
              Setup A is replayed, in purple, as the system's own observer sees it. That observer travels along with the system, so for them
              the total momentum is zero.
            </li>
            <li>
              Bars then fill in. The first pair splits the energy of motion you supplied into a usable part and a locked-in part. The second
              pair shows each setup's system's mass next to the mass that a new particle of your chosen X would need.
            </li>
            <li>
              Finally, a table of the numbers appears, with a line for each setup saying whether the new particle can be made. After that
              come a few questions for you to think about.
            </li>
          </ol>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Choose the energy of motion K and the mass X of the new particle. Predict which setup leaves more
            usable energy, and press Run. You are not graded. The Run button stays off until you choose a prediction.
          </p>
          <p style={{ margin: 0 }}>
            <strong>What we assume.</strong> Everything moves along one line. The two colliding particles are identical and survive
            unchanged. The new particle is neutral. Only energy and momentum are tracked, and whether a possible reaction actually happens
            is not modeled.
          </p>
        </div>

        <ReferencePanel
          entries={[...REFERENCE_ENTRIES, ...PART_TWO_REFERENCE_ENTRIES, ...PART_THREE_REFERENCE_ENTRIES, ...PART_ONE_REFERENCE_ENTRIES]}
        />

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The energy of motion supplied, K</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            The total energy of motion (kinetic energy) of all the moving particles in the lab, in rest energies of one colliding particle.
            For example, K = 3 means the energy of motion is three times the rest energy of one particle.
          </p>
          <div style={{ marginBottom: '1rem' }}>
            {ENERGY_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setEnergyOfMotion(value)
                  setPrediction(null)
                  returnToIdle()
                }}
                className={`toggle-button${energyOfMotion === value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {value}
              </button>
            ))}
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The mass of the new particle, X</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
            In masses of one colliding particle. The new particle is a made-up neutral particle that was not there before the collision. The
            colliding particles survive unchanged.
          </p>
          <div>
            {MASS_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setNewMass(value)
                  setPrediction(null)
                  returnToIdle()
                }}
                className={`toggle-button${newMass === value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
            You supply the same total energy of motion either way, K = {energyOfMotion}. In setup A, one beam particle hits a particle that
            is at rest. In setup B, two particles of the same kind meet head-on. Which setup leaves more energy usable for making new
            particles?
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
          style={{ padding: '0.6rem 1.5rem', marginBottom: '1.5rem' }}
        >
          {status === 'running' ? 'Running...' : complete ? 'Run again' : 'Run'}
        </button>
        {prediction === null && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-1rem', marginBottom: '1.5rem' }}>
            Choose a prediction above to run the experiment.
          </p>
        )}

        <MakingDiagram result={result} progress={status === 'idle' ? null : progress} />

        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How to read this diagram.</strong> The diagram shows two ways of arranging a collision, and both are given the same
            energy of motion, K = {energyOfMotion}. Each way gets its own picture, and the pictures are stacked one above the other. They
            are all drawn on the same scale, so you can compare them directly.
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>The pictures</strong>
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>Setup A, the lab's view (sky blue).</strong> A beam particle moves toward a target particle that is sitting still, and
              hits it.
            </li>
            <li>
              <strong>Setup B, the lab's view (sky blue).</strong> Two particles of the same kind move toward each other and meet head-on.
            </li>
            <li>
              <strong>Setup A again, as the system's own observer sees it (purple).</strong> This is the same collision as the first
              picture, but watched by someone who travels along with the system as a whole. For that observer the total momentum is zero.
              This picture appears during the run, after the lab's pictures have played.
            </li>
          </ul>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>What is drawn in each picture</strong>
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The filled circles</strong> are the particles. Under each one is its name and its speed. Speeds are given as a
              fraction of <em>c</em>, the speed of light, so 0.5c is half the speed of light.
            </li>
            <li>
              <strong>The arrow</strong> on a circle shows which way that particle is moving. A longer arrow means a faster particle. A
              particle with no arrow is not moving.
            </li>
            <li>
              <strong>The dashed vertical line</strong> marks the place where the particles meet.
            </li>
            <li>
              <strong>The top row</strong>, "Before the collision", shows the particles on their way to the dashed line. When you press Run,
              they move along to it, and a yellow ring flashes at the moment they collide.
            </li>
            <li>
              <strong>The bottom row</strong>, "The whole system, after", appears at the collision. The system means all the particles taken
              together, and here it is drawn as one dashed circle. If the system as a whole is moving, the circle has an arrow. If it is not
              moving, there is no arrow. The words under the circle say which it is.
            </li>
          </ul>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>The bars</strong>
          </p>
          <p style={{ margin: '0 0 0.5rem' }}>
            At the end of the run, two sets of bars are drawn below the pictures, and they are explained in their own labels.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The first set</strong> takes the energy of motion you supplied, K, and splits it into two parts for each setup. The{' '}
              <strong>usable</strong> part (green, solid) is the part that can change form into the mass of a new particle. The{' '}
              <strong>locked-in</strong> part (orange, striped) is the part that is tied up in the motion of the whole system, and cannot. A
              yellow marker shows how much K the new particle you chose would need.
            </li>
            <li>
              <strong>The second set</strong> shows the system's mass, M, for each setup. A yellow line marks 2 + X, the smallest M that can
              make a new particle of your chosen mass X.
            </li>
          </ul>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>A worked moment (K = 3, not one of the buttons).</strong> In Setup A, the beam particle has energy 4 and momentum × c of
            √15 = 3.87, and the target has energy 1 and momentum 0. The total energy is 5 and the total momentum × c is 3.87, so M = √(25 −
            15) = √10 = 3.16. The usable energy is M − 2 = 1.16, and the locked-in energy is 3 − 1.16 = 1.84. In Setup B, each particle has
            energy 2.5 and the momenta cancel, so M = 5, the usable energy is 3 and the locked-in energy is 0.
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            <em>What to look for:</em>
          </p>
          <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
            <li>After the collision, is the whole system moving or at rest, in each setup?</li>
            <li>In the purple picture, how does the observer see the collision in Setup A, compared with the lab's picture of Setup B?</li>
            <li>In the first set of bars, how much of each bar is green and how much is orange, and where does the yellow marker fall?</li>
            <li>In the second set, which setup's bar reaches the yellow line?</li>
          </ul>
          <p style={{ margin: 0 }}>
            Not shown: how the leftover energy is shared among the particles after a reaction. Only energy and momentum are tracked, and
            whether a possible reaction actually happens is not modeled.
          </p>
        </div>

        {progress > OWN_END && (
          <div style={{ marginTop: '1.5rem' }}>
            <MakingBars result={result} fill={clamp01((progress - OWN_END) / (1 - OWN_END))} />
          </div>
        )}

        {complete && prediction !== null && (
          <div style={{ marginTop: '1.5rem', overflowX: 'auto', maxWidth: '100%' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Results</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
              The energy of motion supplied was K = {energyOfMotion}, and the new particle's mass was X = {newMass}. Energies are in rest
              energies of one colliding particle. <strong>Your prediction was:</strong>{' '}
              {PREDICTION_CHOICES.find((c) => c.value === prediction)?.label} It is only recorded here, not marked right or wrong.
            </p>
            <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...CELL, textAlign: 'left' }}></th>
                  <th style={{ ...CELL, textAlign: 'left' }}>Setup A (stationary target)</th>
                  <th style={{ ...CELL, textAlign: 'left' }}>Setup B (head-on beams)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Total energy in the lab', formatNumber(A.totalEnergy), formatNumber(B.totalEnergy)],
                  ['Total momentum × c in the lab', formatNumber(A.totalMomentumTimesC), formatNumber(B.totalMomentumTimesC)],
                  ["The system's mass, M, found by the lab", formatNumber(A.systemMass), formatNumber(B.systemMass)],
                  [
                    "Total energy, as the system's own observer finds it",
                    formatNumber(totalsOf(A.ownPieces).energy),
                    formatNumber(totalsOf(B.ownPieces).energy),
                  ],
                  [
                    "Total momentum × c, as the system's own observer finds it",
                    formatNumber(totalsOf(A.ownPieces).momentumTimesC),
                    formatNumber(totalsOf(B.ownPieces).momentumTimesC),
                  ],
                  [
                    "The system's mass, M, found by the system's own observer",
                    formatNumber(systemMassOf(A.ownPieces)),
                    formatNumber(systemMassOf(B.ownPieces)),
                  ],
                  [
                    "Speed of the system's own observer",
                    `${formatNumber(Math.abs(A.ownObserverSpeed))}c`,
                    `${formatNumber(Math.abs(B.ownObserverSpeed))}c`,
                  ],
                  ['Usable energy, M − 2', formatNumber(A.usable), formatNumber(B.usable)],
                  ['Locked-in energy, K − usable', formatNumber(A.lockedIn), formatNumber(B.lockedIn)],
                  ['Share of K locked in', `${formatNumber(A.lockedShare * 100, 1)}%`, `${formatNumber(B.lockedShare * 100, 1)}%`],
                  [`Least K to make X = ${newMass}`, formatNumber(result.stationaryTargetThreshold), formatNumber(result.headOnThreshold)],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} style={CELL}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: '0.875rem', marginTop: '0.75rem', marginBottom: '0.25rem' }}>
              <strong>Setup A:</strong> {verdict(result.stationaryTargetCanMake, newMass, result.stationaryTargetThreshold, energyOfMotion)}
            </p>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              <strong>Setup B:</strong> {verdict(result.headOnCanMake, newMass, result.headOnThreshold, energyOfMotion)}
            </p>
          </div>
        )}

        {complete && prediction !== null && (
          <MakingNewParticlesTutor key={runCount} energyOfMotion={energyOfMotion} newMass={newMass} predicted={prediction} />
        )}
      </div>
    </div>
  )
}
