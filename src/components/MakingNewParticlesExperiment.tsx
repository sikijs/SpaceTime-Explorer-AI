import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  SECTION_A_ENERGY_OF_MOTION,
  SECTION_A_NEW_MASS,
  ownObserverMassGuessMarker,
  ownObserverSystemMassOf,
  runMakingExperiment,
  usableEnergyGuessMarker,
} from '../physics/makingNewParticles'
import type { MakingExperimentResult, OwnObserverMassGuess, SetupResult, UsableEnergyGuess } from '../physics/makingNewParticles'
import { MakingNewParticlesTutor } from './MakingNewParticlesTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MakingNewParticlesDecay, PART_TWO_REFERENCE_ENTRIES } from './MakingNewParticlesDecay'
import { PartHeader } from './GravitationalWaveExperiment'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'
import { MakingNewParticlesLinks, SECTION_A_REFERENCE_ENTRIES, SectionAIntroduction } from './MakingNewParticlesIntro'
import { MakingResults } from './MakingNewParticlesResults'

// Spacetime Geometry 6, Section A (making a new particle; the experiment's "Part 1" until the audit of 2026-11-22). Audit update of 2026-11-22 (wording in
// docs/audit/spacetime-geometry/06-draft-wording.md, approved by the owner on 2026-11-22; the owner answered "all defaults" to the twelve questions of the gap report):
// Section A is in four Parts. Part 1 is one fixed run (K = 5 and X = 2) with two guesses, required before Run: which setup leaves more usable energy (a white outline on the
// bars) and whether the system's own observer finds the same system's mass as the lab (a white tick in a lower panel of Picture 2). Part 2 lets the learner choose K and X;
// Part 3 has the results of Part 1's run; Part 4 the tutor. Parts 2 to 4 appear after the first Run, the guesses lock at Run, and Start over clears Section A. Section B (decay,
// the experiment's "Part 2") is unchanged in this step apart from its names. Every number comes from `makingNewParticles.ts` (CLAUDE.md §9). Wording here is draft for the
// owner's review (CLAUDE.md §28.1).

type PlayStatus = 'idle' | 'running' | 'complete'

// The three answers of Part 1's first prediction and the two answers of its second (wording approved by the owner on 2026-11-22). Not scored, and the learner is not told which is right (§12).
const GUESS1_CHOICES: { value: UsableEnergyGuess; label: string }[] = [
  { value: 'setup-a', label: '(a) Setup A, the stationary target.' },
  { value: 'same', label: '(b) The same for both.' },
  { value: 'setup-b', label: '(c) Setup B, the head-on beams.' },
]
const GUESS2_CHOICES: { value: OwnObserverMassGuess; label: string }[] = [
  { value: 'same', label: "(a) The same as the lab's." },
  { value: 'different', label: "(b) Not the same as the lab's." },
]

const PART_ONE_ID = 'making-new-particles-part-1'
const PART_TWO_ID = 'making-new-particles-part-2'
const PART_ONE_COLOR = '#d97706'
const PART_TWO_COLOR = '#be185d'
const PART_THREE_COLOR = '#0f766e'
const PART_FOUR_COLOR = '#0066cc'
const GUESS_COLOR = '#ffffff'

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

// How far the playback has got in each stage, shared by the drawing and the caption so that a feature is explained only once it is drawn (§12).
export function makingMilestones(progress: number | null) {
  const playing = progress !== null
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  const ownQ = playing ? clamp01((progress - LAB_END) / (OWN_END - LAB_END)) : 0
  return {
    playing,
    // the dashed circle for the whole system, after the collision, is drawn in the lab's pictures
    afterDrawn: playing && panelStory(labQ).collided,
    // Picture 2, the system's own observer's picture, is drawn
    ownDrawn: playing && progress > LAB_END,
    // that observer's collision has happened, so the lower panel's two masses can be drawn
    ownMassDrawn: playing && panelStory(ownQ).collided,
    // the bars have started to fill, and have finished
    barsDrawn: playing && progress > OWN_END,
    barsFilled: playing && progress >= 1,
  }
}

// Part 1 only: a third band under Picture 2 for the system's own observer's mass of the whole system (its own scale), which makes the picture taller.
const SYSTEM_TOP_Y = 3 * PANEL_HEIGHT + 70
const SYSTEM_BAR_X = 40
const SYSTEM_BAR_MAX = 300
const VIEW_HEIGHT_WITH_SYSTEM = SYSTEM_TOP_Y + 200

interface DiagramProps {
  result: MakingExperimentResult
  // null while idle (only the setups are shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
  // True for Part 2's drawings (Drawing A and B), which follow the learner's settings and carry no guess.
  own?: boolean
  // The second guess, drawn as a white tick on the outlined bar of the lower panel (Part 1 only).
  ownGuess?: OwnObserverMassGuess | null
}

// While idle it draws the setups just before the collisions. While the run plays it shows the lab's collisions first, then Setup A as the system's own observer sees it,
// and then (Part 1 only) a lower panel with the system's own observer's mass of the whole system beside the lab's.
export function MakingDiagram({ result, progress, own = false, ownGuess = null }: DiagramProps) {
  const playing = progress !== null
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  const ownQ = playing ? clamp01((progress - LAB_END) / (OWN_END - LAB_END)) : 0
  const showOwn = playing && progress > LAB_END
  const { ownMassDrawn } = makingMilestones(progress)
  const A = result.stationaryTarget
  const B = result.headOn
  const picture1 = own ? 'Drawing A' : 'Picture 1'
  const picture2 = own ? 'Drawing B' : 'Picture 2'
  const total = own ? 3 * PANEL_HEIGHT + 60 : VIEW_HEIGHT_WITH_SYSTEM
  const masses = ownObserverSystemMassOf(A)
  const marker = ownGuess === null ? null : ownObserverMassGuessMarker(ownGuess, result)
  const sysScale = SYSTEM_BAR_MAX / Math.max(masses.lab, masses.own, 1e-9)
  const tickX = marker === null ? 0 : SYSTEM_BAR_X + marker.afterPosition * sysScale
  const boxX = Math.min(Math.max(tickX - 115, 10), VIEW_WIDTH - 240)
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${total}`}
      role="img"
      aria-label={`${playing ? 'Playback' : 'Setup'}. ${picture1}, Setup A, the lab's view: a beam particle moving right at ${A.labPieces[0].speed.toFixed(2)}c hits a target at rest. Afterward the whole system keeps moving at ${A.ownObserverSpeed.toFixed(2)}c. ${picture1}, Setup B, the lab's view: two particles of the same kind meet head-on at ${Math.abs(B.labPieces[0].speed).toFixed(2)}c each, and the whole system is at rest afterward.${showOwn ? ` ${picture2}: Setup A again, as the system's own observer sees it, who moves at ${A.ownObserverSpeed.toFixed(2)}c: the two particles approach each other at ${Math.abs(A.ownPieces[0].speed).toFixed(2)}c each and the system is at rest.` : ''}${showOwn && ownMassDrawn && !own ? ` Lower panel: the lab finds a system's mass of ${masses.lab.toFixed(2)} for Setup A and the system's own observer finds ${masses.own.toFixed(2)}.` : ''}`}
      style={SVG_STYLE}
    >
      <defs>
        {[LAB_COLOR, OWN_COLOR].map((color) => (
          <marker key={color} id={arrowId(color)} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
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
          title={`${picture1}, Setup A: the lab's view of a stationary target`}
          subtitle="One beam particle hits a particle that is at rest."
          color={LAB_COLOR}
          particles={labParticles(A)}
          systemSpeed={A.ownObserverSpeed}
          systemNote={`the whole system keeps moving at ${formatNumber(A.ownObserverSpeed)}c`}
          q={labQ}
        />
        <SetupPanel
          top={PANEL_HEIGHT}
          title={`${picture1}, Setup B: the lab's view of head-on beams`}
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
            title={`${picture2}: Setup A again, as the system's own observer sees it`}
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
              : `Press ${own ? 'Run these settings' : 'Run'} to see the collisions, and then Setup A as the system's own observer sees it.`}
          </text>
        )}
      </g>

      {/* Part 1 only: the system's own observer's mass of the whole system, on its own scale. Solid bar = the lab's, outlined bar = the observer's. The white tick is the second guess; it is only a marker. */}
      {!own && showOwn && (
        <g>
          <text x="12" y={SYSTEM_TOP_Y} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
            Picture 2, lower panel: the system's own observer's mass of the whole system
          </text>
          <text x="12" y={SYSTEM_TOP_Y + 15} fontSize="11" fill={MUTED_COLOR}>
            Their own scale (in rest energies). A longer bar is a bigger mass.
          </text>
          {!ownMassDrawn && (
            <text x="12" y={SYSTEM_TOP_Y + 40} fontSize="11" fill={MUTED_COLOR}>
              The two masses are drawn here once the observer's collision has happened.
            </text>
          )}
          {ownMassDrawn && (
            <g>
              <line x1={SYSTEM_BAR_X} y1={SYSTEM_TOP_Y + 28} x2={SYSTEM_BAR_X} y2={SYSTEM_TOP_Y + 112} stroke={MUTED_COLOR} strokeWidth="1" strokeDasharray="3 4" />
              <text x={SYSTEM_BAR_X} y={SYSTEM_TOP_Y + 124} fontSize="10" textAnchor="middle" fill={MUTED_COLOR} style={HALO}>
                zero
              </text>
              {[
                { key: 'lab', value: masses.lab, y: SYSTEM_TOP_Y + 50, text: "The lab's system mass, Setup A", fill: true, color: LAB_COLOR },
                { key: 'own', value: masses.own, y: SYSTEM_TOP_Y + 90, text: "The system's own observer's system mass, Setup A", fill: false, color: OWN_COLOR },
              ].map((bar) => (
                <g key={bar.key}>
                  <text x="12" y={bar.y - 6} fontSize="10" fill={bar.color} style={HALO}>
                    {bar.text}
                  </text>
                  <rect x={SYSTEM_BAR_X} y={bar.y} width={Math.max(bar.value * sysScale, 2)} height="14" rx="2" fill={bar.fill ? bar.color : 'none'} stroke={bar.color} strokeWidth="2" />
                  <text x={SYSTEM_BAR_X + Math.max(bar.value * sysScale, 2) + 6} y={bar.y + 11} fontSize="10" fontWeight="bold" fill={bar.color} style={HALO}>
                    {bar.value.toFixed(2)}
                  </text>
                </g>
              ))}
              {marker !== null && (
                <g>
                  <line x1={tickX} y1={SYSTEM_TOP_Y + 90} x2={tickX} y2={SYSTEM_TOP_Y + 114} stroke={GUESS_COLOR} strokeWidth="4" />
                  <line x1={tickX} y1={SYSTEM_TOP_Y + 114} x2={boxX + 115} y2={SYSTEM_TOP_Y + 134} stroke={GUESS_COLOR} strokeWidth="2" />
                  <rect x={boxX} y={SYSTEM_TOP_Y + 134} width="230" height="54" rx="6" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="3" />
                  <text x={boxX + 115} y={SYSTEM_TOP_Y + 156} textAnchor="middle" fontSize="16" fontWeight="bold" fill={GUESS_COLOR}>
                    YOUR GUESS
                  </text>
                  <text x={boxX + 115} y={SYSTEM_TOP_Y + 172} textAnchor="middle" fontSize="12" fill={GUESS_COLOR}>
                    {marker.label.replace('YOUR GUESS: ', '')}
                  </text>
                </g>
              )}
            </g>
          )}
        </g>
      )}
    </svg>
  )
}

const BAR_LEFT = 140
const BAR_WIDTH = 350

interface BarsProps {
  result: MakingExperimentResult
  // How much of each bar is drawn, from 0 to 1; the numbers and markers appear when it reaches 1.
  fill: number
  // True for Part 2's drawings, which follow the learner's settings and carry no guess.
  own?: boolean
  // The first guess, drawn as a white outline round the chosen setup's bar once the bars are drawn (Part 1 only).
  guess?: UsableEnergyGuess | null
}

// Two groups of bars. First, for each setup, the energy of motion supplied, split into its usable and locked-in parts, with a
// marker at the energy of motion needed to make the chosen new particle. Second, the system's mass of each setup, with a line at
// 2 + X, the mass needed to make the new particle.
export function MakingBars({ result, fill, own = false, guess = null }: BarsProps) {
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
  // The two energy rows are spaced wider than the mass rows, so that the white outline of the first guess never touches the numbers under the bars.
  const energyStep = rowHeight + 30
  const massTop = energyTop + 2 * energyStep + 70
  const height = massTop + 2 * (rowHeight + 18) + 64
  const marker = !own && full && guess !== null ? usableEnergyGuessMarker(guess) : null
  const rowCenterY = (i: number) => energyTop + i * energyStep + 10 + rowHeight / 2
  const outlinedRows = marker === null ? [] : energyRows.map(([, s], i) => (marker.outlinedSetups.includes(s.setup) ? i : -1)).filter((i) => i >= 0)
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      role="img"
      aria-label={`Bars. Energy of motion supplied, K = ${result.energyOfMotion}. Setup A: ${A.usable.toFixed(2)} usable and ${A.lockedIn.toFixed(2)} locked in. Setup B: ${B.usable.toFixed(2)} usable and ${B.lockedIn.toFixed(2)} locked in. The system's mass: Setup A ${A.systemMass.toFixed(2)}, Setup B ${B.systemMass.toFixed(2)}, against ${massNeeded.toFixed(2)} needed to make a new particle of mass ${result.newMass}.`}
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
        const y = energyTop + i * energyStep + 10
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
              <text x={BAR_LEFT} y={y + rowHeight + 17} fontSize="10" fill={MUTED_COLOR}>
                usable {formatNumber(s.usable)} · locked in {formatNumber(s.lockedIn)}
              </text>
            )}
          </g>
        )
      })}
      <text x="12" y={energyTop + 2 * energyStep + 18} fontSize="10" fill={NEEDED_COLOR}>
        Yellow marker: the K needed to make a new particle of mass {result.newMass}.
      </text>

      {/* The first guess: a thick white outline round the chosen setup's bar (both bars, with an "=" between them, for "the same"), joined by a line to a large YOUR GUESS box. It is only a marker. */}
      {marker !== null && (
        <g>
          {outlinedRows.map((i) => (
            <rect
              key={i}
              x={BAR_LEFT - 4}
              y={energyTop + i * energyStep + 10 - 4}
              width={BAR_WIDTH + 8}
              height={rowHeight + 8}
              rx="4"
              fill="none"
              stroke={GUESS_COLOR}
              strokeWidth="4"
            />
          ))}
          {marker.equalsSign && (
            <text x={BAR_LEFT - 12} y={(rowCenterY(0) + rowCenterY(1)) / 2 + 6} fontSize="18" fontWeight="bold" textAnchor="middle" fill={GUESS_COLOR}>
              =
            </text>
          )}
          <line x1={BAR_LEFT + BAR_WIDTH + 4} y1={rowCenterY(outlinedRows[0])} x2={504} y2={rowCenterY(outlinedRows[0])} stroke={GUESS_COLOR} strokeWidth="2" />
          <line x1={504} y1={54} x2={504} y2={rowCenterY(outlinedRows[0])} stroke={GUESS_COLOR} strokeWidth="2" />
          <rect x={354} y={4} width={158} height={50} rx="6" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="3" />
          <text x={433} y={25} textAnchor="middle" fontSize="15" fontWeight="bold" fill={GUESS_COLOR}>
            YOUR GUESS
          </text>
          <text x={433} y={44} textAnchor="middle" fontSize="11" fill={GUESS_COLOR}>
            {marker.label.replace('YOUR GUESS: ', '')}
          </text>
        </g>
      )}

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

const captionStyle: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }
const smallNote: CSSProperties = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }
const pictureTitle: CSSProperties = { fontWeight: 'bold', fontSize: '0.875rem', marginTop: '1.5rem', marginBottom: '0.5rem' }
const linkButton: CSSProperties = { background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#0066cc', textDecoration: 'underline', cursor: 'pointer' }
const toggleStyle: CSSProperties = { marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }
const answerStyle: CSSProperties = { display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }
const hint: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }

// ---- The captions (CLAUDE.md §14, "Animated Diagrams"; wording: docs/audit/spacetime-geometry/06-draft-wording.md, section 4) ----
// A feature is explained only once it is drawn (§12). Nothing here says which setup leaves more usable energy, or whether the two observers agree: that is the learner's to
// observe and the tutor's to explain (§12, §13).

interface DiagramCaptionProps {
  result: MakingExperimentResult
  progress: number | null
  own?: boolean
  ownGuess?: OwnObserverMassGuess | null
}

export function DiagramCaption({ result, progress, own = false, ownGuess = null }: DiagramCaptionProps) {
  const { playing, afterDrawn, ownDrawn, ownMassDrawn } = makingMilestones(progress)
  const A = result.stationaryTarget
  const B = result.headOn
  const masses = ownObserverSystemMassOf(A)
  const picture1 = own ? 'Drawing A' : 'Picture 1'
  const picture2 = own ? 'Drawing B' : 'Picture 2'
  const f2 = (v: number) => formatNumber(v, 2)
  const items = [
    ...(afterDrawn
      ? [
          {
            look: `the dashed circle for the whole system after each collision in ${picture1}, with or without an arrow`,
            means: `in Setup A the system as a whole is still moving after the collision, at ${f2(A.ownObserverSpeed)}c (it has an arrow). In Setup B it is at rest (no arrow)`,
            matters: 'motion of the whole system is energy of motion that is still there afterward. The tutor explains why that matters for making a new particle',
          },
        ]
      : []),
    ...(ownDrawn
      ? [
          {
            look: `the purple picture of Setup A (${picture2}), and the sky-blue picture of Setup B`,
            means: `for the system's own observer, Setup A's particles approach each other at ${f2(Math.abs(A.ownPieces[0].speed))}c and ${f2(Math.abs(A.ownPieces[1].speed))}c, with the system at rest. In the lab's picture of Setup B the particles approach at ${f2(Math.abs(B.labPieces[0].speed))}c each, with the system at rest`,
            matters: 'the observer for whom the total momentum is zero is the one who can say how much energy of motion is left over for making mass',
          },
        ]
      : []),
    ...(ownMassDrawn && !own
      ? [
          {
            look: 'the solid sky-blue bar and the outlined purple bar in the lower panel',
            means: `the lab and the system's own observer each work out the system's mass of Setup A from their own numbers: ${f2(masses.lab)} and ${f2(masses.own)}`,
            matters: "it is the mass of the whole system, and whether two observers agree on it is the question of your second prediction (the page does not say whether the bars are equal, so read it from them)",
          },
        ]
      : []),
  ]
  return (
    <div style={captionStyle}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{own ? `How to read ${picture1} and ${picture2}.` : 'How to read this diagram.'}</strong>{' '}
        {own ? "These are Part 1's pictures again, drawn for your settings, with a pink line beside them because they follow your settings. Everything in them means what it meant in Part 1. " : ''}
        The diagram shows two ways of arranging a collision, and both are given the same energy of motion, K = {result.energyOfMotion}. Each way gets its own picture, and the pictures are stacked
        one above the other. They are all drawn on the same scale, so you can compare them directly. The new particle {own ? 'you chose' : 'we hope to make'} has a mass of X = {result.newMass}.
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>The pictures</strong>
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>{picture1}, Setup A: the lab's view (sky blue).</strong> A beam particle moves toward a target particle that is sitting still, and hits it.
        </li>
        <li>
          <strong>{picture1}, Setup B: the lab's view (sky blue).</strong> Two particles of the same kind move toward each other and meet head-on.
        </li>
        {ownDrawn && (
          <li>
            <strong>{picture2}: Setup A again, as the system's own observer sees it (purple).</strong> This is the same collision as the first picture, but watched by someone who travels along with
            the system as a whole. For that observer the total momentum is zero. It appears during the run, after the lab's pictures have played.
          </li>
        )}
        {ownMassDrawn && !own && (
          <li>
            <strong>{picture2}, lower panel (solid sky blue and outlined purple).</strong> The system's mass of Setup A, as the lab works it out (solid) and as the system's own observer works it out
            (outlined), on a scale of their own.
          </li>
        )}
      </ul>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>What is drawn in each picture</strong>
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The filled circles</strong> are the particles. Under each one is its name and its speed. Speeds are given as a fraction of <em>c</em>, the speed of light, so 0.5c is half the speed
          of light.
        </li>
        <li>
          <strong>The arrow</strong> on a circle shows which way that particle is moving. A longer arrow means a faster particle. A particle with no arrow is not moving.
        </li>
        <li>
          <strong>The dashed vertical line</strong> marks the place where the particles meet.
        </li>
        <li>
          <strong>The top row</strong>, "Before the collision", shows the particles on their way to the dashed line. {playing ? 'When you press Run, they move along to it, and a yellow ring flashes at the moment they collide.' : ''}
        </li>
        {afterDrawn && (
          <li>
            <strong>The bottom row</strong>, "The whole system, after", appears at the collision. The system means all the particles taken together, and here it is drawn as one dashed circle. If the
            system as a whole is moving, the circle has an arrow. If it is not moving, there is no arrow. The words under the circle say which it is.
          </li>
        )}
        {ownMassDrawn && !own && (
          <li>
            <strong>The numbers beside the lower panel's bars</strong> are each mass in rest energies, one rest energy being the rest energy of one colliding particle.{' '}
            {ownGuess !== null && (
              <>
                <strong>The white tick and the YOUR GUESS box</strong> are the answer you chose to the second prediction, drawn across the outlined bar. They are <strong>only a marker</strong>: the answer
                has no size of its own. If you chose "the same as the lab's", the tick sits where the solid bar ends. If you chose "not the same", it sits at half that length. It does not change either bar.
              </>
            )}
          </li>
        )}
      </ul>
      {items.length > 0 && (
        <>
          <p style={{ margin: '0 0 0.5rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList items={items} />
        </>
      )}
      <p style={{ margin: '0.75rem 0 0' }}>
        Not shown: how the leftover energy is shared among the particles after a reaction. Only energy and momentum are tracked, and whether a possible reaction actually happens is not modeled.
      </p>
      {!own && (
        <WhereFrom>
          <strong>Calculated here:</strong> every number and bar, from the rules of special relativity of Experiment 5. <strong>Measured:</strong> nothing on this page (the tutor's real-world figures are
          the exception, and are linked). <strong>Imagined for the question:</strong> the colliding particles, the made-up neutral particle X and the observers.
        </WhereFrom>
      )}
    </div>
  )
}

interface BarsCaptionProps {
  result: MakingExperimentResult
  progress: number | null
  own?: boolean
  guess?: UsableEnergyGuess | null
}

export function BarsCaption({ result, progress, own = false, guess = null }: BarsCaptionProps) {
  const { barsFilled } = makingMilestones(progress)
  const A = result.stationaryTarget
  const B = result.headOn
  const K = result.energyOfMotion
  const massNeeded = 2 + result.newMass
  const f2 = (v: number) => formatNumber(v, 2)
  const items = [
    {
      look: 'the green part and the orange, striped part of each bar in the first set',
      means: `Setup A: usable ${f2(A.usable)} and locked in ${f2(A.lockedIn)}. Setup B: usable ${f2(B.usable)} and locked in ${f2(B.lockedIn)}. Each pair adds up to K = ${K}`,
      matters: 'the green part is the only part that can become the mass of a new particle. This is the question of your first prediction, and the page does not say which setup has more, so read it from the bars',
    },
    {
      look: 'the yellow marker on each bar of the first set, and the yellow line across the second set',
      means: `a new particle of mass X = ${result.newMass} needs a system's mass of 2 + X = ${f2(massNeeded)}. Setup A's blue bar reaches ${f2(A.systemMass)} and Setup B's reaches ${f2(B.systemMass)}. The marker shows the least K for each setup: ${f2(result.stationaryTargetThreshold)} for Setup A and ${f2(result.headOnThreshold)} for Setup B`,
      matters: 'it is the test of whether the new particle can be made at all: a blue bar that reaches the yellow line can make it, and one that stops short cannot',
    },
  ]
  return (
    <div style={captionStyle}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read these bars.</strong> This picture has two sets of bars. In each set there is one bar for Setup A (the stationary target) and one for Setup B (the head-on beams), so you can
        compare them. The bars fill in from the left during the end of the run. Within a set, a longer bar means a bigger number, on one shared scale.
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>The first set: the energy of motion you supplied, K = {K}, split in two</strong>
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The whole bar</strong> is K, the energy of motion given to the particles in the lab. Both setups were given the same K, so both whole bars are the same length.
        </li>
        <li>
          <strong>The green, solid part</strong> is the <em>usable</em> energy: the part that can change form into the mass of a new particle.
        </li>
        <li>
          <strong>The orange, striped part</strong> is the <em>locked-in</em> energy: the part tied up in the motion of the whole system, which cannot become mass. If a bar has no orange part,
          nothing was locked in.
        </li>
        <li>
          <strong>The numbers under each bar</strong> give the usable and locked-in amounts. They add up to K.
        </li>
        <li>
          <strong>The yellow marker</strong> shows the amount of K that making a new particle of your chosen mass, X = {result.newMass}, would need in that setup. If the marker is inside the whole bar, the K you
          supplied is enough. If it is beyond the end of the bar, it is not enough.
        </li>
        {barsFilled && guess !== null && !own && (
          <li>
            <strong>The white outline and the YOUR GUESS box.</strong> This is the answer you chose to the first prediction, drawn round the bar of the setup you chose (round both bars, with an "=" between
            them, if you chose "the same for both"). It is <strong>only a marker</strong>: the answer has no size of its own, and it does not change either bar.
          </li>
        )}
      </ul>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>The second set: the system's mass, M</strong>
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The blue bar</strong> is the system's mass M for that setup: all the particles taken together, worked out from their total energy and total momentum. The number is written under the bar.
        </li>
        <li>
          <strong>The yellow line</strong> marks 2 + X = {formatNumber(massNeeded)}. This is the smallest M at which a new particle of mass X can be made, because the two colliding particles each still have
          a mass of 1 and the new particle adds X.
        </li>
        <li>
          If a blue bar reaches or passes the yellow line, the new particle can be made in that setup. If it stops short of the line, it cannot.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>A worked moment (K = 3 and X = 1, not one of the buttons).</strong> In Setup A, the beam particle has energy 4 and momentum × c of √15 = 3.87, and the target has energy 1 and momentum 0. The total
        energy is 5 and the total momentum × c is 3.87, so M = √(25 − 15) = √10 = 3.16. The usable energy is M − 2 = 1.16, and the locked-in energy is 3 − 1.16 = 1.84. In Setup B, each particle has energy 2.5 and the
        momenta cancel, so M = 5, the usable energy is 3 and the locked-in energy is 0. The line for X = 1 is at 2 + 1 = 3: a system whose M is 3.16 passes it, and one whose M is 2.5 would stop short.
      </p>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
      {!own && (
        <WhereFrom>
          <strong>Calculated here:</strong> every number and bar, from the rules of special relativity of Experiment 5. <strong>Measured:</strong> nothing on this page. <strong>Imagined for the question:</strong>{' '}
          the colliding particles and the made-up neutral particle X.
        </WhereFrom>
      )}
    </div>
  )
}

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

interface MakingNewParticlesExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// The completion mark is saved when Section B's playback ends, and the explained mark, which shows the chapter summary, when Section B's tutor reaches its
// explanation (spec, Decision 14). Section A calls neither.
export function MakingNewParticlesExperiment({ onComplete, onTutorComplete }: MakingNewParticlesExperimentProps) {
  // ---- Part 1: two guesses, one fixed run (K = 5 and X = 2) ----
  const [guess1, setGuess1] = useState<UsableEnergyGuess | null>(null)
  const [guess2, setGuess2] = useState<OwnObserverMassGuess | null>(null)
  const [locked, setLocked] = useState(false)
  const [status, setStatus] = useState<PlayStatus>('idle')
  const [progress, setProgress] = useState(0)
  // Counts the Start overs, so the tutor starts again at its first question.
  const [resetCount, setResetCount] = useState(0)
  // ---- Part 2: the learner's own K and X ----
  const [ownK, setOwnK] = useState(SECTION_A_ENERGY_OF_MOTION)
  const [ownX, setOwnX] = useState(SECTION_A_NEW_MASS)
  const [shown, setShown] = useState<{ K: number; X: number } | null>(null)
  const [ownStatus, setOwnStatus] = useState<PlayStatus>('idle')
  const [ownProgress, setOwnProgress] = useState(0)
  // Section B (decay) is shown after the learner reaches Section A's tutor explanation, or by a skip link under Section A's heading. Skipping does not count as having
  // reached the explanation (spec, Decision 14).
  const [partOneExplained, setPartOneExplained] = useState(false)
  const [skippedToSectionB, setSkippedToSectionB] = useState(false)
  const sectionBShown = partOneExplained || skippedToSectionB
  useEffect(() => {
    if (skippedToSectionB) document.getElementById(PART_TWO_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [skippedToSectionB])

  const partOneDone = status === 'complete'
  const playing = status === 'running' || ownStatus === 'running'
  const startOverDisabled = (guess1 === null && guess2 === null && status === 'idle' && ownStatus === 'idle') || playing
  usePlayback(status, setStatus, setProgress)
  usePlayback(ownStatus, setOwnStatus, setOwnProgress)

  const K1 = SECTION_A_ENERGY_OF_MOTION
  const X1 = SECTION_A_NEW_MASS
  const result = runMakingExperiment(K1, X1)
  const ownResult = shown === null ? null : runMakingExperiment(shown.K, shown.X)

  const handleRun = () => {
    if (guess1 === null || guess2 === null || locked) return
    setLocked(true)
    setProgress(0)
    setStatus('running')
  }
  // Start over: clears the guesses, the runs, the results and the tutor of Section A, and returns Section A to its first state.
  const handleStartOver = () => {
    if (playing) return
    setGuess1(null)
    setGuess2(null)
    setLocked(false)
    setStatus('idle')
    setProgress(0)
    setOwnK(SECTION_A_ENERGY_OF_MOTION)
    setOwnX(SECTION_A_NEW_MASS)
    setShown(null)
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
    setShown({ K: ownK, X: ownX })
    setOwnProgress(0)
    setOwnStatus('running')
  }
  const pinkFrame = { borderLeft: `4px solid ${PART_TWO_COLOR}`, paddingLeft: '0.75rem' } as const
  const guess1Label = GUESS1_CHOICES.find((c) => c.value === guess1)?.label ?? ''
  const guess2Label = GUESS2_CHOICES.find((c) => c.value === guess2)?.label ?? ''
  const bothChosen = guess1 !== null && guess2 !== null

  return (
    <div>
      <h2>Experiment 6 — Making New Particles: How Much Energy Does It Take?</h2>
      <div id={PART_ONE_ID} className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Section A: Making a new particle, how much energy does it take?</h3>
        <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1rem' }}>
          {!sectionBShown && <span style={{ color: 'var(--text-muted)' }}>Already know this? </span>}
          <button
            type="button"
            onClick={() => {
              if (sectionBShown) document.getElementById(PART_TWO_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              else setSkippedToSectionB(true)
            }}
            style={linkButton}
          >
            {sectionBShown ? 'Go to Section B - Decay ↓' : 'Skip to Section B - Decay'}
          </button>
        </p>

        <SectionAIntroduction partOneK={K1} partOneX={X1} />

        <MakingNewParticlesLinks />

        <ReferencePanel entries={[...SECTION_A_REFERENCE_ENTRIES, ...(sectionBShown ? PART_TWO_REFERENCE_ENTRIES : [])]} />

        {/* ===== Part 1: predict, then watch ===== */}
        <PartHeader color={PART_ONE_COLOR} title="Part 1: Predict, then watch">
          You will predict which of two ways of arranging a collision leaves more energy usable for making a new particle, then guess what an observer who rides along with the system finds, press Run
          and watch both collisions. Your guesses are drawn on the real bars in white. They never change them.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction (1 of 2): which setup leaves more usable energy</p>
          <p style={hint}>
            You supply the same total energy of motion either way, K = {K1}, and the new particle you hope to make has a mass of X = {X1}. In Setup A, one beam particle hits a particle that is at rest.
            In Setup B, two particles of the same kind meet head-on. Which setup leaves more energy usable for making new particles?
          </p>
          <p style={hint}>
            <strong>What Run will show.</strong> Pressing Run plays two collisions. <strong>Picture 1</strong> is the lab's view of both setups. <strong>Picture 2</strong> is Setup A again, as the system's own
            observer sees it: someone who moves along with the whole system, so that for them its total momentum is zero (think of a person on a train that keeps pace with the system). You make two
            predictions before you press Run: the first is about which setup leaves more usable energy, and the second is about what that observer finds for the system's mass. You will see both pictures.
          </p>
          <div>
            {GUESS1_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                disabled={locked}
                onClick={() => setGuess1(choice.value)}
                className={`toggle-button${guess1 === choice.value ? ' is-selected' : ''}`}
                style={answerStyle}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ ...smallNote, marginBottom: 0 }}>
            {guess1 === null
              ? 'Choose an option to continue'
              : locked
                ? 'Your prediction is locked while you try other settings. To change it, press Start over.'
                : `Your prediction: ${guess1Label.slice(0, 3)}. You can still change it until you press Run.`}
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Make a prediction (2 of 2): the system's own observer</p>
          <p style={hint}>
            Now think about the purple picture, where the system's own observer watches Setup A. This observer rides along with the system, so for them the total momentum is zero. They work out the
            system's mass from their own total energy and total momentum, with the same formula, M = √(E_total² − (P_total c)²). The lab did the same with its own numbers. Is the system's mass this
            observer finds the same as the lab found for Setup A?
          </p>
          <div>
            {GUESS2_CHOICES.map((choice) => (
              <button
                key={choice.value}
                type="button"
                disabled={locked}
                onClick={() => setGuess2(choice.value)}
                className={`toggle-button${guess2 === choice.value ? ' is-selected' : ''}`}
                style={answerStyle}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ ...smallNote, marginBottom: 0 }}>
            {guess2 === null
              ? 'Choose an option to continue'
              : locked
                ? 'Your prediction is locked while you try other settings. To change it, press Start over.'
                : `Your prediction: ${guess2Label.slice(0, 3)}. You can still change it until you press Run.`}
          </p>
        </div>

        <button type="button" className="action-button" onClick={handleRun} disabled={!bothChosen || locked} style={{ padding: '0.6rem 1.5rem' }}>
          {status === 'running' ? 'Running...' : locked ? 'Run (done)' : 'Run (the lab, then the system\'s own observer)'}
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
        {!bothChosen && <p style={smallNote}>Choose both predictions above to run the experiment.</p>}

        <p style={pictureTitle}>Pictures 1 and 2: the collisions, as the lab sees them and as the system's own observer sees Setup A</p>
        <MakingDiagram result={result} progress={status === 'idle' ? null : progress} ownGuess={guess2} />
        {status === 'idle' && (
          <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.75rem' }}>
            Picture 2, its lower panel, the bars and your two white guesses (one on the bars, one on the system's own observer's mass) appear in these pictures when you press Run.
          </p>
        )}
        <DiagramCaption result={result} progress={status === 'idle' ? null : progress} ownGuess={guess2} />

        {status !== 'idle' && progress > OWN_END && (
          <div style={{ marginTop: '1.5rem' }}>
            <MakingBars result={result} fill={clamp01((progress - OWN_END) / (1 - OWN_END))} guess={guess1} />
            <BarsCaption result={result} progress={progress} guess={guess1} />
          </div>
        )}

        {/* ===== Part 2: appears when the first Run has finished ===== */}
        {partOneDone && (
          <>
            <PartHeader color={PART_TWO_COLOR} title="Part 2: Now try it yourself">
              You choose how much energy of motion to supply (K) and how heavy the new particle is (X), and press Run these settings. These choices change the drawings. Your predictions do not. They are trial
              values for an imagined particle, and they do not say that a real machine is like that.
            </PartHeader>
            <p style={{ ...smallNote, marginTop: 0, marginBottom: '0.75rem' }}>
              Your predictions do not change the drawings or the tables. These settings change Drawing A, Drawing B and the bars below, and they do not change Part 3's tables, which are for Part 1's run.
            </p>
            <div style={{ ...pinkFrame, marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The energy of motion supplied, K</label>
              <p style={hint}>
                The total energy of motion (kinetic energy) of all the moving particles in the lab, in rest energies of one colliding particle. For example, K = 3 means the energy of motion is three times the
                rest energy of one particle.
              </p>
              <div style={{ marginBottom: '1rem' }}>
                {ENERGY_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={ownStatus === 'running'}
                    onClick={() => chooseOwn(() => setOwnK(value))}
                    className={`toggle-button${ownK === value ? ' is-selected' : ''}`}
                    style={toggleStyle}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The mass of the new particle, X</label>
              <p style={hint}>
                In masses of one colliding particle. The new particle is a made-up neutral particle that was not there before the collision. The colliding particles survive unchanged.
              </p>
              <div>
                {MASS_PRESETS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={ownStatus === 'running'}
                    onClick={() => chooseOwn(() => setOwnX(value))}
                    className={`toggle-button${ownX === value ? ' is-selected' : ''}`}
                    style={toggleStyle}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" className="action-button" onClick={handleRunOwn} disabled={ownStatus === 'running'} style={{ padding: '0.6rem 1.5rem' }}>
              {ownStatus === 'running' ? 'Running...' : 'Run these settings'}
            </button>
            {ownStatus === 'idle' && (
              <p style={{ ...smallNote, fontWeight: 'bold', marginTop: '0.75rem' }}>
                Choose K and X, then press Run these settings. Drawing A (the lab's view), Drawing B (the system's own observer's view) and the bars appear here.
              </p>
            )}
            {ownResult !== null && ownStatus !== 'idle' && (
              <div style={{ ...pinkFrame, marginTop: '1rem' }}>
                <p style={pictureTitle}>
                  Drawings A and B: the collisions for your settings (K = {ownResult.energyOfMotion}, X = {ownResult.newMass})
                </p>
                <MakingDiagram result={ownResult} progress={ownProgress} own />
                <DiagramCaption result={ownResult} progress={ownProgress} own />
                {ownProgress > OWN_END && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <MakingBars result={ownResult} fill={clamp01((ownProgress - OWN_END) / (1 - OWN_END))} own />
                    <BarsCaption result={ownResult} progress={ownProgress} own />
                  </div>
                )}
              </div>
            )}

            {/* ===== Part 3: the results of Part 1's run ===== */}
            <PartHeader color={PART_THREE_COLOR} title="Part 3: The results">
              Here are the numbers behind Part 1's pictures, a check-up of this page against its own physics, and your two guesses beside the real results. The tables never change with your predictions or
              with the settings you tried in Part 2.
            </PartHeader>
            {bothChosen && <MakingResults energyOfMotion={K1} newMass={X1} guess1Label={guess1Label} guess2Label={guess2Label} />}

            {/* ===== Part 4: the tutor ===== */}
            <PartHeader color={PART_FOUR_COLOR} title="Part 4: The tutor">
              The tutor asks you three questions, one at a time, about what you saw and how your guesses compare with the pictures, then goes through the explanation. The tutor's questions are not marked.
            </PartHeader>
            {bothChosen && (
              <MakingNewParticlesTutor
                key={resetCount}
                energyOfMotion={K1}
                newMass={X1}
                predicted={guess1}
                ownObserverPredicted={guess2}
                onExplained={() => setPartOneExplained(true)}
              />
            )}
          </>
        )}
      </div>

      {sectionBShown && (
        <div id={PART_TWO_ID}>
          <MakingNewParticlesDecay
            skippedPartOne={skippedToSectionB && !partOneExplained}
            onBackToPartOne={() => document.getElementById(PART_ONE_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            onComplete={onComplete}
            onExplained={onTutorComplete}
          />
        </div>
      )}
    </div>
  )
}
