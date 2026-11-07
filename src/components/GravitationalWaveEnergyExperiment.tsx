import { useMemo, useState, type ReactNode } from 'react'
import {
  BASE_AMPLITUDE,
  BASE_FREQUENCY,
  chirpArmTrace,
  chirpRunFor,
  chirpRunSummary,
  chirpStateAt,
  firstAndLastSwing,
  graphHalfRange,
} from '../physics/gravitationalWaveChirpExperiment'
import type { ChirpRunSummary, FirstAndLastSwing } from '../physics/gravitationalWaveChirpExperiment'
import {
  ENERGY_PART1_MASS,
  REAL_GW150914_ENERGY,
  energyGuessEndFraction,
  energyRunSummary,
  orbitalEnergyStateAt,
} from '../physics/gravitationalWaveEnergyExperiment'
import type { EnergyChoice, EnergyRunSummary } from '../physics/gravitationalWaveEnergyExperiment'
import { GravitationalWaveEnergyTutor } from './GravitationalWaveEnergyTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { ChirpGraph } from './GravitationalWaveChirpExperiment'
import {
  ArmsPicture,
  MUTED_COLOR,
  PartHeader,
  TEXT_COLOR,
  YOURS_COLOR,
  svgStyle,
  useRunner,
} from './GravitationalWaveExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'

// Gravitational Waves, Experiment 3, audited to the newer rules (docs/audit/gravitational-waves/03-draft-wording.md): the
// page in four Parts, labelled pictures with a caption each, the white YOUR GUESS mark on the energy graph, a reading guide
// for the results and a tutor that points to the mark. Every number drawn or shown comes from the physics modules
// (src/physics/gravitationalWaveEnergyExperiment.ts and the chirp module; CLAUDE.md §9). The wording is draft for the
// owner's line-by-line approval (CLAUDE.md §28.1).

interface GravitationalWaveEnergyExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const
const captionBox = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' } as const
const bulletList = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const
const fixed3 = (value: number) => (Math.abs(value) < 1e-9 ? 0 : value).toFixed(3)

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const ENERGY_COLOR = '#cd853f' // brown: the real orbital energy (the guess is white, the learner's own mass is pink)

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages fetched and read on 7 November 2026 (see the audit's draft wording, section 11).
const PLAIN_LINKS = [
  { href: 'https://www.ligo.caltech.edu/page/gw-sources', label: 'LIGO Lab: "Sources and Types of Gravitational Waves"', what: 'how pairs of black holes and neutron stars lose orbital energy as gravitational waves and move closer together, and how short the signal from the first black hole merger was in LIGO\'s detectors.' },
  { href: 'https://ligo.org/science-summaries/GW150914/', label: 'LIGO Scientific Collaboration: "Observation of Gravitational Waves from a Binary Black Hole Merger" (science summary)', what: 'for the first detection, GW150914: the masses of the two black holes and the one they made, the energy that left as gravitational waves (about three Suns\' worth of mass) and the peak power. Written for the public, but not beginner-simple.' },
  { href: 'https://education.nationalgeographic.org/resource/energy-transfers-and-transformations/', label: 'National Geographic Education: "Energy Transfers and Transformations"', what: 'a plain page, with a choice of reading level, on how energy is never created or destroyed but can move from one thing to another or change form, with everyday examples such as a golf swing and a ball on a hill.' },
  { href: 'https://spaceplace.nasa.gov/gravitational-waves/en/', label: 'NASA Space Place: "What Is a Gravitational Wave?"', what: 'a short, plain explainer on what gravitational waves are and how LIGO detects them (it does not talk about their energy).' },
  { href: 'https://arxiv.org/abs/1602.03837', label: 'The original paper: "Observation of Gravitational Waves from a Binary Black Hole Merger"', what: 'the first report of GW150914 (LIGO Scientific Collaboration and Virgo Collaboration, Physical Review Letters 116, 061102, 2016). Its abstract gives the masses and says about 3 Suns\' worth of energy was radiated.' },
]

// The "Words and formulas" box. Worked examples use the made-up mass 0.3 (the pair of the previous experiment) and take every
// number from the physics modules (CLAUDE.md §9). The formulas show the energy falling, so they appear only after a run has
// finished (CLAUDE.md §12).
function referenceEntries(done: boolean): { term: string; meaning: string }[] {
  const mass = ENERGY_PART1_MASS
  const run = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const exampleTime = 1
  const atExample = orbitalEnergyStateAt(exampleTime, mass)
  const atEnd = orbitalEnergyStateAt(run.cutoffTime, mass)
  const f3 = (n: number) => n.toFixed(3)
  const entries = [
    { term: 'Energy', meaning: 'what lets something make a change happen: lift a weight, heat a room, speed something up. It is never created or destroyed, only moved from one place to another or changed from one form into another.' },
    { term: 'Orbital energy', meaning: 'the energy two objects have because they are orbiting each other.' },
    { term: 'Energy units', meaning: 'the made-up units this page uses for energy. They are not joules, so only how the numbers compare with each other means anything.' },
    { term: 'Radiated energy', meaning: 'energy that has left the orbit, counted up to a given moment.' },
    { term: 'Gravitational wave', meaning: 'a ripple in the shape of spacetime that travels outward from a violent event, such as two black holes spiralling into each other, at the speed of light.' },
    { term: 'Black hole', meaning: 'an object so dense that its gravity lets nothing, not even light, escape from it.' },
    { term: 'Inspiral', meaning: 'the closing-in of two objects that orbit each other and slowly draw closer, until they meet and merge.' },
    { term: 'Final moment', meaning: 'the idealized end of the run, shortly before the two objects would meet. The meeting itself is not shown.' },
    { term: 'Mass', meaning: 'how much matter an object has. The more mass, the stronger its gravity. On this page mass is a made-up scale, not real Suns.' },
    { term: 'Pitch (frequency)', meaning: 'how fast the arms swing. The higher the number, the higher the pitch.' },
    { term: 'Loudness (amplitude)', meaning: 'how far the arms swing: the biggest strain the wave is reaching at one moment.' },
    { term: 'Strain', meaning: 'a plain number saying how strongly the wave is acting on space at one instant. 0 means the wave is doing nothing at that instant; the bigger the number, positive or negative, the stronger its effect.' },
    { term: 'Solar mass', meaning: 'the mass of our Sun. It is used to say how much energy GW150914 gave out.' },
    { term: 'LIGO', meaning: 'the Laser Interferometer Gravitational-Wave Observatory: two detectors in the United States, each with two arms 4 kilometres long.' },
    { term: 'GW150914', meaning: 'the name of the first gravitational wave ever detected. "GW" stands for gravitational wave and the numbers are the date, 14 September 2015.' },
  ]
  if (done) {
    entries.push(
      { term: 'Formula: orbital energy left', meaning: `starting energy × (1 − time ÷ time to the merger), where the time to the merger = 1 ÷ mass. Example, mass ${mass}: the starting energy is ${f3(atExample.totalOrbitalEnergy)} and the time to the merger is ${f3(1 / mass)}; at time ${f3(exampleTime)} the energy left is ${f3(atExample.totalOrbitalEnergy)} × (1 − ${f3(exampleTime)} ÷ ${f3(1 / mass)}) = ${f3(atExample.remainingOrbitalEnergy)}.` },
      { term: 'Formula: starting energy', meaning: `the mass, in energy units. Example: a pair of mass ${mass} starts with ${f3(atExample.totalOrbitalEnergy)} energy units.` },
      { term: 'Formula: radiated energy', meaning: `starting energy − energy left. Example, mass ${mass}: at time ${f3(exampleTime)}, ${f3(atExample.totalOrbitalEnergy)} − ${f3(atExample.remainingOrbitalEnergy)} = ${f3(atExample.radiatedEnergy)}; at the final moment, time ${f3(run.cutoffTime)}, ${f3(atEnd.totalOrbitalEnergy)} − ${f3(atEnd.remainingOrbitalEnergy)} = ${f3(atEnd.radiatedEnergy)}.` }
    )
  }
  return entries
}

const energyChoices: Array<{ value: EnergyChoice; label: string }> = [
  { value: 'increases', label: 'Increases' },
  { value: 'decreases', label: 'Decreases' },
  { value: 'stays-the-same', label: 'Stays the same' },
]

const GUESS_SHORT: Record<EnergyChoice, string> = {
  increases: 'the orbital energy increases',
  decreases: 'the orbital energy decreases',
  'stays-the-same': 'the orbital energy stays the same',
}

// ---- Small shared pieces ----
function WhereFrom({ measured, calculated, imagined }: { measured: ReactNode; calculated: ReactNode; imagined: ReactNode }) {
  return (
    <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
      <strong>Where the real picture comes from.</strong> <em>Measured:</em> {measured} <em>Calculated here:</em> {calculated}{' '}
      <em>Imagined for the question:</em> {imagined}
    </p>
  )
}

function LookFor({ items }: { items: Array<{ look: string; means: string; matters: string }> }) {
  return (
    <>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList items={items} />
    </>
  )
}

function Block({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: '1rem' }}>{children}</div>
}

function GuessTag() {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: GUESS_COLOR,
        backgroundColor: '#0b1020',
        border: `1px solid ${GUESS_COLOR}`,
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      your guess
    </span>
  )
}

function Readout({ time, mass }: { time: number; mass: number }) {
  const state = chirpStateAt(Math.min(time, chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE).cutoffTime), mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  return (
    <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem' }}>
      Frequency: {state.frequency.toFixed(3)} &nbsp;|&nbsp; Amplitude: {state.amplitude.toFixed(3)} &nbsp;|&nbsp; Strain:{' '}
      {state.strain.toFixed(3)}
      <br />
      Arm X length: {state.armXLength.toFixed(3)} &nbsp;|&nbsp; Arm Y length: {state.armYLength.toFixed(3)}
    </p>
  )
}

function Definitions() {
  return (
    <ul style={{ ...smallNote, marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
      <li>
        <strong>Frequency (pitch):</strong> how many full swings the arms make in one time unit, at this instant. The higher the
        number, the higher the pitch.
      </li>
      <li>
        <strong>Amplitude (loudness):</strong> the biggest strain the wave is reaching at this instant.
      </li>
      <li>
        <strong>Strain:</strong> a plain number saying how strongly the wave is acting on space at this instant. 0 means the wave
        is doing nothing at this instant; the bigger the number, positive or negative, the stronger its effect.
      </li>
    </ul>
  )
}

// ---- Picture 3 / Drawing C: the orbital energy against time ----
const G = { width: 580, left: 62, right: 530, plotHeight: 180 }

export function EnergyGraph({
  mass,
  time,
  started,
  done,
  pink,
  guess,
  label,
}: {
  mass: number
  time: number
  started: boolean
  done: boolean
  pink: boolean
  guess: EnergyChoice | null
  label: string
}) {
  const s = energyRunSummary(mass)
  const total = s.cutoffTime
  const top = 56
  const bottom = top + G.plotHeight
  const height = bottom + (pink ? 112 : 66)
  const px = (t: number) => G.left + (t / total) * (G.right - G.left)
  const py = (e: number) => bottom - (e / s.graphTop) * G.plotHeight
  const shownTime = started ? Math.min(time, total) : 0
  const samples = 120
  const points = started
    ? Array.from({ length: samples + 1 }, (_, i) => {
        const t = (i / samples) * shownTime
        return { t, e: orbitalEnergyStateAt(t, mass).remainingOrbitalEnergy }
      })
    : []
  const line = points.map((p) => `${px(p.t)},${py(p.e)}`).join(' ')
  const area = points.length > 1 ? `${px(0)},${py(s.startEnergy)} ${line} ${px(shownTime)},${py(s.startEnergy)}` : ''
  const endPoint = points.length > 0 ? points[points.length - 1] : null
  const boxX = G.left + 10
  const boxY = bottom - 36

  return (
    <svg width={G.width} height={height} viewBox={`0 0 ${G.width} ${height}`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Orbital energy left, against time
      </text>
      <g fontSize="11">
        <line x1={G.left} y1={36} x2={G.left + 22} y2={36} stroke={ENERGY_COLOR} strokeWidth={3} />
        <text x={G.left + 28} y={40} fill={TEXT_COLOR}>orbital energy left</text>
        <rect x={G.left + 150} y={30} width={22} height={12} fill={ENERGY_COLOR} fillOpacity={0.3} />
        <text x={G.left + 178} y={40} fill={TEXT_COLOR}>radiated so far</text>
        <line x1={G.left + 290} y1={36} x2={G.left + 312} y2={36} stroke={ENERGY_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={G.left + 318} y={40} fill={TEXT_COLOR}>starting energy</text>
      </g>
      {/* axes */}
      <line x1={G.left} y1={top} x2={G.left} y2={bottom} stroke={MUTED_COLOR} />
      <line x1={G.left} y1={bottom} x2={G.right} y2={bottom} stroke={MUTED_COLOR} />
      {[0, s.startEnergy, s.graphTop].map((v, i) => (
        <g key={i}>
          <line x1={G.left - 4} y1={py(v)} x2={G.left} y2={py(v)} stroke={MUTED_COLOR} />
          <text x={G.left - 8} y={py(v) + 4} fill={MUTED_COLOR} fontSize="10" textAnchor="end">{v.toFixed(3)}</text>
        </g>
      ))}
      {[0, total].map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={bottom} x2={px(t)} y2={bottom + 4} stroke={MUTED_COLOR} />
          <text x={t === 0 ? px(t) : G.width - 6} y={bottom + 16} fill={MUTED_COLOR} fontSize="10" textAnchor={t === 0 ? 'middle' : 'end'}>{t === 0 ? '0' : `${t.toFixed(3)} (final moment)`}</text>
        </g>
      ))}
      <text x={(G.left + G.right) / 2} y={bottom + 32} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        time (time units)
      </text>
      <text x={12} y={(top + bottom) / 2} fill={MUTED_COLOR} fontSize="10" textAnchor="middle" transform={`rotate(-90 12 ${(top + bottom) / 2})`}>
        orbital energy (energy units)
      </text>
      {/* the starting energy */}
      <line x1={G.left} y1={py(s.startEnergy)} x2={G.right} y2={py(s.startEnergy)} stroke={ENERGY_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      {/* the real energy: the area already radiated, the line, the start and the end */}
      {area && <polygon points={area} fill={ENERGY_COLOR} fillOpacity={0.3} />}
      {points.length > 1 && <polyline points={line} fill="none" stroke={ENERGY_COLOR} strokeWidth={3} />}
      {started && (
        <g>
          <circle cx={px(0)} cy={py(s.startEnergy)} r={5} fill={ENERGY_COLOR} />
          {!pink && (
            <text x={px(0) + 10} y={py(s.startEnergy) - 8} fill={ENERGY_COLOR} fontSize="10" fontWeight="bold">
              start: {fixed3(s.startEnergy)}
            </text>
          )}
        </g>
      )}
      {done && endPoint && (
        <g>
          <circle cx={px(total)} cy={py(endPoint.e)} r={5} fill={pink ? YOURS_COLOR : ENERGY_COLOR} />
          {!pink && (
            <text x={px(total) - 8} y={(py(s.startEnergy) + py(endPoint.e)) / 2} fill={ENERGY_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
              final moment: {fixed3(s.finalRemainingEnergy)} left
            </text>
          )}
        </g>
      )}
      {/* white: the learner's guess, drawn from the start dot once the run has begun; a marker for the direction only */}
      {started && guess && (() => {
        const endY = py(s.startEnergy * energyGuessEndFraction(guess))
        const midX = (px(0) + px(total)) / 2
        const midY = (py(s.startEnergy) + endY) / 2
        return (
          <g>
            <line x1={px(0)} y1={py(s.startEnergy)} x2={px(total)} y2={endY} stroke={GUESS_COLOR} strokeWidth={3.5} />
            <circle cx={px(total)} cy={endY} r={5} fill={GUESS_COLOR} />
            <line x1={boxX + 140} y1={boxY} x2={midX} y2={midY} stroke={GUESS_COLOR} strokeWidth={1.5} />
            <rect x={boxX} y={boxY} width={290} height={20} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
            <text x={boxX + 8} y={boxY + 14} fill={GUESS_COLOR} fontSize="11" fontWeight="bold">
              YOUR GUESS: {GUESS_SHORT[guess]}
            </text>
          </g>
        )
      })()}
      {/* pink: the learner's own mass (Part 2), follows the slider */}
      {pink && (
        <g>
          <text x={G.right} y={py(s.startEnergy) - 6} fill={YOURS_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
            YOUR MASS: starts at {fixed3(s.startEnergy)}
          </text>
          {done && endPoint && (
            <text x={px(total) - 8} y={(py(s.startEnergy) + py(endPoint.e)) / 2 - 6} fill={YOURS_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
              <tspan x={px(total) - 8}>YOUR MASS: {fixed3(s.finalRemainingEnergy)} left, </tspan>
              <tspan x={px(total) - 8} dy={12}>{fixed3(s.finalRadiatedEnergy)} radiated</tspan>
            </text>
          )}
          <line x1={px(0)} y1={bottom + 46} x2={px(total)} y2={bottom + 46} stroke={YOURS_COLOR} strokeWidth={2} />
          <line x1={px(0)} y1={bottom + 40} x2={px(0)} y2={bottom + 52} stroke={YOURS_COLOR} strokeWidth={2} />
          <line x1={px(total)} y1={bottom + 40} x2={px(total)} y2={bottom + 52} stroke={YOURS_COLOR} strokeWidth={2} />
          <text x={(G.left + G.right) / 2} y={bottom + 68} fill={YOURS_COLOR} fontSize="10" fontWeight="bold" textAnchor="middle">
            YOUR MASS: the final moment is at {total.toFixed(3)} time units
          </text>
        </g>
      )}
    </svg>
  )
}

// ---- Captions (CLAUDE.md §14, "Animated Diagrams"): how to read, a worked moment, what to look for, where it comes from ----
export function ArmsCaption({ name, summary, done, pink }: { name: string; summary: ChirpRunSummary; done: boolean; pink: boolean }) {
  const half = Math.abs(summary.finalStrain) / 2
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong> It shows the two arms of a small gravitational-wave detector, seen from above, drawn the
        way a real one is built: two arms at a right angle, meeting at a corner. The arms are driven by the wave from the two
        spiralling objects, the same chirp as in &ldquo;The Chirp&rdquo;.
      </p>
      <ul style={bulletList}>
        <li>
          <strong>Corner:</strong> where the two arms meet.
        </li>
        <li>
          <strong>Arm X</strong> is the violet horizontal arm and <strong>Arm Y</strong> is the cyan vertical arm. At the end of each
          is a <strong>free-floating mass</strong>: a mass with nothing pushing or pulling it, so it only moves if space itself
          changes. A longer arm means space between the corner and that mass has stretched; a shorter arm means it has been
          squeezed.
        </li>
        <li>
          <strong>The dashed amber lines and the small amber ticks, &ldquo;rest length 1.000&rdquo;</strong>, show how long each arm
          is when no wave is passing. Every length on this page is a fraction of the rest length, so 1.000 means exactly the rest
          length.
        </li>
        <li>
          <strong>The numbers under the picture</strong> change live: frequency, amplitude, strain and the two arm lengths, as defined
          in the list beneath them.
        </li>
        {pink && (
          <li>
            <strong>No pink marks are drawn on this picture.</strong> Pink always means your own choice; the pink marks for your mass
            are on Drawing B and Drawing C below. Here, your mass shows up as how far the dots move and for how long the run lasts.
          </li>
        )}
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong> Before a run nothing moves and the arms lie on their ticks (strain 0.000). While the run
        plays, which takes 8 seconds on your screen whatever the mass, the dots move away from their ticks and back. When it has
        finished, the dots are where the wave left them at the final moment: not necessarily back on the ticks, because the run ends
        part-way through a swing.
      </p>
      {done && (
        <>
          <p style={paragraph}>
            <strong>A worked moment.</strong> At the final moment of the mass {summary.mass.toFixed(1)} run the strain is{' '}
            {fixed3(summary.finalStrain)}. Each arm moves by half the strain, {fixed3(half)}, so Arm X is 1 + ({fixed3(summary.finalStrain)} ÷ 2) ={' '}
            {fixed3(summary.finalArmXLength)} and Arm Y is 1 − ({fixed3(summary.finalStrain)} ÷ 2) = {fixed3(summary.finalArmYLength)}. The readout
            under the picture shows these same numbers.
          </p>
          <LookFor
            items={[
              {
                look: 'the two dots at the ends of the arms while the run plays.',
                means: `they move in opposite directions: when Arm X is longer than its tick, Arm Y is shorter by exactly the same amount. At the final moment Arm X is ${fixed3(summary.finalArmXLength)} and Arm Y is ${fixed3(summary.finalArmYLength)}.`,
                matters: 'a detector works by comparing its two arms, so what counts is how the two lengths change together, not either length alone.',
              },
              {
                look: 'the frequency and amplitude in the numbers under the picture, from the start of the run to the end.',
                means: `the frequency goes from ${fixed3(summary.startFrequency)} to ${fixed3(summary.endFrequency)} and the amplitude from ${fixed3(summary.startAmplitude)} to ${fixed3(summary.endAmplitude)}.`,
                matters: 'these two numbers are the wave\'s pitch and loudness; they are what the orbital energy graph below is drawn beside.',
              },
            ]}
          />
        </>
      )}
      <WhereFrom
        measured="nothing in this picture is a measurement."
        calculated={`the arm lengths, from the simplified formula this page uses to stand in for a real inspiral, with a made-up mass of ${summary.mass.toFixed(1)}.`}
        imagined={`the pair itself and its mass of ${summary.mass.toFixed(1)}, on this page's made-up mass scale${pink ? ' (your own choice)' : ''}. The size of the effect is also hugely exaggerated, so that you can see it.`}
      />
    </div>
  )
}

export function ArmGraphCaption({
  name,
  summary,
  swing,
  half,
  done,
  pink,
}: {
  name: string
  summary: ChirpRunSummary
  swing: FirstAndLastSwing
  half: number
  done: boolean
  pink: boolean
}) {
  const fullSwing = swing.firstSwingLength < summary.cutoffTime - 1e-9
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong> It shows how long each of the two arms is, from the start of the run to its final moment.
      </p>
      <ul style={bulletList}>
        <li>
          <strong>The bottom axis</strong> is time in time units, from 0 to the <strong>final moment</strong>, {fixed3(summary.cutoffTime)}, the end of
          the run. The whole run is always drawn.
        </li>
        <li>
          <strong>The side axis</strong> is arm length, with the rest length at 1.000 in the middle. It is zoomed to this run and runs from{' '}
          {fixed3(1 - half)} to {fixed3(1 + half)}, so read the numbers on it.
        </li>
        <li>
          <strong>The violet line</strong> is Arm X and <strong>the cyan line</strong> is Arm Y. <strong>Each wiggle is one swing</strong>: the arm
          going out, back and out again to where it began. The dashed amber line is the rest length.
        </li>
        {pink && (
          <li>
            <strong>The pink dashed lines and the pink bracket</strong> are your own mass: the highest and the lowest length either arm
            reaches, and how long the run lasts.
          </li>
        )}
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong> Nothing is drawn before a run. While it plays the lines grow from the left, and at the final
        moment they stop. The orbital energy graph is drawn over the same time, so the two can be read together.
      </p>
      {done && (
        <>
          <p style={paragraph}>
            <strong>A worked moment (mass {summary.mass.toFixed(1)}).</strong> The final moment is 0.9 ÷ {summary.mass.toFixed(1)} = {fixed3(summary.cutoffTime)}.{' '}
            {fullSwing ? (
              <>
                The first swing takes about {swing.firstSwingLength.toFixed(2)} time units; one swing at the final moment takes only about{' '}
                {swing.lastSwingLength.toFixed(2)} (1 ÷ {fixed3(summary.endFrequency)}). Over the whole run the arms make {summary.swings.toFixed(1)} swings.
              </>
            ) : (
              <>
                The run holds only {summary.swings.toFixed(2)} of a swing, less than a quarter, so the lines never reach a peak: Arm X rises to{' '}
                {fixed3(summary.finalArmXLength)} and Arm Y falls to {fixed3(summary.finalArmYLength)} and the run stops.
              </>
            )}
          </p>
          <LookFor
            items={[
              {
                look: 'the length of the swings, from left to right.',
                means: fullSwing
                  ? `the swings get shorter: the first takes about ${swing.firstSwingLength.toFixed(2)} time units and one at the final moment about ${swing.lastSwingLength.toFixed(2)}.`
                  : 'this run is too short for a full swing, so there is no swing length to compare.',
                matters: 'it is the pitch of the wave, drawn: shorter swings are a higher pitch. The energy graph is drawn over this same time.',
              },
              {
                look: 'the height of the swings, from left to right.',
                means: `the arms swing further as the run goes on: the amplitude goes from ${fixed3(summary.startAmplitude)} to ${fixed3(summary.endAmplitude)}.`,
                matters: 'it is the loudness of the wave, drawn. The orbital energy graph is drawn over the same run.',
              },
            ]}
          />
        </>
      )}
      <WhereFrom
        measured="nothing in this picture is a measurement."
        calculated={`the two lines, from the simplified formula this page uses to stand in for a real inspiral, with a made-up mass of ${summary.mass.toFixed(1)}.`}
        imagined={`the pair and its mass of ${summary.mass.toFixed(1)}, on this page's made-up mass scale. The size of the effect is hugely exaggerated, so that you can see it.`}
      />
    </div>
  )
}

export function EnergyCaption({ name, summary, done, pink, guess }: { name: string; summary: EnergyRunSummary; done: boolean; pink: boolean; guess: EnergyChoice | null }) {
  const t1 = summary.cutoffTime / 3
  const at1 = orbitalEnergyStateAt(t1, summary.mass)
  const s1 = t1 / summary.mergerTime
  const sEnd = summary.cutoffTime / summary.mergerTime
  const arms = chirpRunSummary(summary.mass)
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong> It shows how much orbital energy the two objects have left, from the start of the run to its final
        moment. Orbital energy is the energy the two objects have because they are orbiting each other. Energy units are made-up units for
        this page: they are not joules, and {fixed3(summary.startEnergy)} does not mean {fixed3(summary.startEnergy)} of anything real.
      </p>
      <ul style={bulletList}>
        <li>
          <strong>The bottom axis</strong> is time, from the start of the run to the final moment ({fixed3(summary.cutoffTime)} time units).
        </li>
        <li>
          <strong>The side axis</strong> is orbital energy. Its top is 25 percent above the energy the pair starts with, so there is room above
          the start for a line that goes up. {pink ? 'Every run' : 'This graph'} is drawn to fit its own run: every run&rsquo;s line starts at the
          same height on the picture, so read the numbers on the side axis to compare masses.
        </li>
        <li>
          <strong>The dashed brown line</strong> is the starting energy, {fixed3(summary.startEnergy)}.
        </li>
        <li>
          <strong>The thick brown line</strong> is the orbital energy the pair has left at each moment.
        </li>
        <li>
          <strong>The pale brown area</strong> between the dashed line and the thick line is energy that has already left the orbit, up to that
          moment. A bigger area means more energy has gone.
        </li>
        <li>
          <strong>The white line and the white box</strong> are your guess, drawn only to show the direction you chose: up, flat or down. Its
          end height is one of three fixed steps (up 20 percent, flat, down 20 percent). They do not say how much you expect, and they never
          change the brown line.
        </li>
        {pink && (
          <li>
            <strong>The pink labels and the pink bracket</strong> are your own mass and follow the slider: the energy the pair starts with, how
            much is left and how much has radiated by the final moment, and how long the run lasts.
          </li>
        )}
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong> Before a run nothing is drawn{pink ? ', except the pink start label and bracket, which move with the slider' : ''}.
        As soon as you press Run, the axes, the start dot and your white guess appear, and the brown line grows from the start dot to the right while
        the arms above move. At the final moment the line stops, and the numbers under the graph{pink ? '' : ' and Table 1 in Part 3'} show where it ended.
      </p>
      {done && (
        <>
          <p style={paragraph}>
            <strong>A worked moment (mass {summary.mass.toFixed(1)}).</strong> The pair starts with {fixed3(summary.startEnergy)} energy units. The
            merger would come at {fixed3(summary.mergerTime)} (1 ÷ the mass) and the run ends at {fixed3(summary.cutoffTime)}. At time {fixed3(t1)}, the
            run is {fixed3(t1)} ÷ {fixed3(summary.mergerTime)} = {s1.toFixed(2)} of the way to the merger, so the energy left is {fixed3(summary.startEnergy)} × (1 − {s1.toFixed(2)}) ={' '}
            {fixed3(at1.remainingOrbitalEnergy)} and {fixed3(at1.radiatedEnergy)} has gone. At the final moment it is {sEnd.toFixed(2)} of the way,{' '}
            {fixed3(summary.startEnergy)} × (1 − {sEnd.toFixed(2)}) = {fixed3(summary.finalRemainingEnergy)} is left and {fixed3(summary.finalRadiatedEnergy)} has gone.
          </p>
          <LookFor
            items={[
              {
                look: 'the thick brown line, from left to right.',
                means: `the orbital energy left goes from ${fixed3(summary.startEnergy)} at the start to ${fixed3(summary.finalRemainingEnergy)} at the final moment: the line slopes down.`,
                matters: 'this is the amount the question asked about, drawn as a line like the phone battery\'s, and its direction is what you predicted.',
              },
              ...(guess
                ? [
                    {
                      look: 'the white line and box beside the brown line.',
                      means: 'your guess, as a marker for the direction. Put it next to the brown line: does the white line slope the same way?',
                      matters: 'it lets you check your own idea against the real line before the tutor talks about it. It does not say whether you were right; the tutor does that.',
                    },
                  ]
                : []),
              {
                look: 'the right end of the brown line, the dot at the final moment.',
                means: `the line stops with some energy left (${fixed3(summary.finalRemainingEnergy)}, a tenth of the start), not at zero, because the run ends at the final moment, just before the objects would meet.`,
                matters: 'the meeting itself is not modelled, so this picture does not say what happens to the last tenth.',
              },
              {
                look: 'the pale brown area.',
                means: `the energy that has left the orbit so far: ${fixed3(at1.radiatedEnergy)} at time ${fixed3(t1)} and ${fixed3(summary.finalRadiatedEnergy)} at the final moment.`,
                matters: 'it shows that what the orbit has less of at the end is a definite amount, and it is the number that "Radiated energy" counts.',
              },
              {
                look: 'the arm lengths graph above this one, beside this graph.',
                means: `they share the same time. While the brown line goes from ${fixed3(summary.startEnergy)} to ${fixed3(summary.finalRemainingEnergy)}, the arms' swings get faster and larger (${arms.swings.toFixed(1)} swings in the run).`,
                matters: 'two things happen over the same stretch of time. Why they happen together is what the tutor asks.',
              },
              ...(pink
                ? [
                    {
                      look: 'the pink start label, the pink end label and the pink bracket.',
                      means: `at your mass the pair starts with ${fixed3(summary.startEnergy)}, has ${fixed3(summary.finalRemainingEnergy)} left at the final moment and has radiated ${fixed3(summary.finalRadiatedEnergy)}; the run lasts ${fixed3(summary.cutoffTime)} time units.`,
                      matters: 'the shape of the line is the same for every mass, because each graph is drawn to fit its run; what changes with the mass are these numbers. Read the numbers, not the height of the line.',
                    },
                  ]
                : []),
            ]}
          />
        </>
      )}
      {pink && (
        <p style={paragraph}>
          <strong>Why the shape does not change.</strong> At mass 0.3 the pair starts with 0.300 energy units; at mass 6 it starts with 6.000,
          twenty times as many, and has 0.600 left at its final moment (a tenth, as at mass 0.3). The graph is drawn to fit each run, so that the
          whole run fills the picture.
        </p>
      )}
      <WhereFrom
        measured="nothing in this picture is a measurement."
        calculated={`the brown line, from a simple formula this page made up to stand in for a real inspiral (energy left = starting energy × (1 − time ÷ the time to the merger)). No instrument measured it, and the energy is in made-up units, not joules.${guess ? ' Your guess: the white mark and box are your guess, drawn only as a marker. They are not part of the calculation.' : ''}`}
        imagined={`the pair and its mass of ${summary.mass.toFixed(1)}, on this page's made-up mass scale${pink ? ' (your own choice, in pink, a trial value that does not say the real system is like that)' : ''}.`}
      />
    </div>
  )
}

export function GravitationalWaveEnergyExperiment({ onComplete, onTutorComplete }: GravitationalWaveEnergyExperimentProps) {
  const [mass, setMass] = useState(0.5)
  const [runMass, setRunMass] = useState(0.5)
  const [hasFinished, setHasFinished] = useState(false)
  const part1 = useRunner(() => {
    setHasFinished(true)
    onComplete?.()
  })
  const part2 = useRunner()
  const [part1RunId, setPart1RunId] = useState(0)

  const [prediction, setPrediction] = useState<EnergyChoice | null>(null)
  const [submitted, setSubmitted] = useState<EnergyChoice | null>(null)

  const hasPrediction = prediction !== null
  const locked = submitted !== null
  const part1Running = part1.status === 'running'
  const part1Started = part1.status !== 'idle'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  // The drawn lines belong to the mass that was run; if the slider has moved on, the drawings show the new mass at rest.
  const ranHere = part2.status !== 'idle' && runMass === mass
  const part2Done = part2.status === 'complete' && runMass === mass

  const part1Trace = useMemo(() => chirpArmTrace(ENERGY_PART1_MASS), [])
  const part2Trace = useMemo(() => chirpArmTrace(mass), [mass])
  const part1Arms = useMemo(() => chirpRunSummary(ENERGY_PART1_MASS), [])
  const part2Arms = useMemo(() => chirpRunSummary(mass), [mass])
  const part1Swing = useMemo(() => firstAndLastSwing(ENERGY_PART1_MASS), [])
  const part2Swing = useMemo(() => firstAndLastSwing(mass), [mass])
  const part1Energy = useMemo(() => energyRunSummary(ENERGY_PART1_MASS), [])
  const part2Energy = useMemo(() => energyRunSummary(mass), [mass])

  const part1Time = part1Started ? part1.time : 0
  const part2Time = ranHere ? part2.time : 0
  const part1State = chirpStateAt(Math.min(part1Time, part1Arms.cutoffTime), ENERGY_PART1_MASS, BASE_FREQUENCY, BASE_AMPLITUDE)
  const part2State = chirpStateAt(Math.min(part2Time, part2Arms.cutoffTime), mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const part1EnergyNow = orbitalEnergyStateAt(Math.min(part1Time, part1Energy.cutoffTime), ENERGY_PART1_MASS)
  const part2EnergyNow = orbitalEnergyStateAt(Math.min(part2Time, part2Energy.cutoffTime), mass)

  const handleRunPart1 = () => {
    if (!hasPrediction || part1Running || part2Running) return
    if (!locked) setSubmitted(prediction)
    part2.reset()
    setPart1RunId((id) => id + 1)
    part1.start(part1Arms.cutoffTime)
  }

  const handleRunPart2 = () => {
    if (part2Running || part1Running) return
    setRunMass(mass)
    part2.start(part2Arms.cutoffTime)
  }

  // Start over: the learner can answer the question again. Clears both runs, Part 2's mass and the tutor.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setSubmitted(null)
    setPrediction(null)
    setMass(0.5)
    setRunMass(0.5)
  }

  const guessLabel = (choice: EnergyChoice) => energyChoices.find((c) => c.value === choice)!.label.toLowerCase()

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 3 — Where the Energy Comes From</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>What is energy?</strong> Energy is what lets something make a change happen —
            lift a weight, heat a room, speed something up. It comes in different forms: motion has
            energy, height above the ground has energy, a stretched rubber band has energy. One of
            the most basic rules in physics is that energy is never created or destroyed — it only
            moves from one place to another, or changes from one form into another. When you throw
            a ball, energy moves from your arm's muscles into the ball's motion. Two objects
            orbiting each other have energy too, simply because they're orbiting — their "orbital
            energy."
          </p>
          <p style={paragraph}>
            <strong>How does a wave transmit energy?</strong> Drop a stone in a still pond, and
            ripples spread outward across the water. Watch a leaf floating nearby: as the ripple
            passes under it, the leaf bobs up and down, then settles back — it doesn't get carried
            along with the ripple. No water actually travels from the splash to the leaf. What
            travels is the up-and-down <em>motion itself</em>, handed off from one bit of water to
            the next, all the way out to the leaf. That motion is energy, and the ripple is how the
            splash's energy reaches the leaf without anything physical making the trip. A
            gravitational wave is a ripple too, except that what ripples outward isn't water — it's
            spacetime itself, alternately stretching and squeezing as the wave passes (the same
            stretching and squeezing &ldquo;Ripples in Spacetime&rdquo; showed). A ripple carries energy
            from the place where it starts to the place where it arrives. What that means for the two
            objects that make a gravitational wave is what you will predict below.
          </p>
          <p style={paragraph}>
            <strong>Why a wave, and not a straight line?</strong> A thrown ball carries its own
            momentum in one direction, so it flies in a straight line, only toward wherever it was
            aimed. A splash is different: the pond's water surrounds the source on every side, so the
            disturbance has no single direction to follow — it spreads outward evenly in a widening
            ring, not as one ray shot at a target. A gravitational wave spreads the same way, for the
            same reason: spacetime surrounds the orbiting pair in every direction, so the disturbance
            they create isn't aimed anywhere — it spreads outward through spacetime in all directions
            at once, exactly as the pond's ripple spreads outward from the splash instead of shooting
            off as a single beam.
          </p>
          <p style={paragraph}>
            <strong>Why does it ripple instead of just pushing out evenly?</strong> Flick a rope once,
            and a single hump travels down its length — a one-time pulse, not a wave. But shake the
            rope back and forth, over and over, and a whole series of ripples travels down it instead,
            because the far end keeps repeating whatever the near end just did, a moment later. A
            gravitational wave ripples for the same reason: the orbiting pair isn't a one-time event —
            they keep going around and around, over and over, in a repeating orbit. Each part of that
            repeating orbit stretches and squeezes the nearby spacetime a little differently, and as
            the pair keeps repeating its motion, the stretching and squeezing keeps repeating too,
            carried outward one cycle at a time — an ongoing ripple, not a single push. (This is also
            why the wave has a <em>pitch</em>, as &ldquo;The Chirp&rdquo; showed: one ripple per orbit, so a
            faster orbit makes a higher-pitched wave.)
          </p>
          <p style={paragraph}>
            This experiment doesn't model the "leaf" end of that handoff. It shows only the source side:
            the energy that the orbiting pair has, which this page calls its orbital energy.
          </p>
          <p style={paragraph}>
            <strong>The question.</strong> The last experiment, &ldquo;The Chirp&rdquo;, showed that a bigger
            mass produces a faster-rising, louder chirp, and that the pair orbits faster as it spirals
            closer together. But why does the orbit shrink at all? What makes the two objects get closer
            together in the first place?
          </p>
          <p style={paragraph}>
            <strong>Reading a line that shows an amount over time.</strong> Think of the charge on a
            phone battery, drawn as a line over a day. While you use the phone, the line slopes down.
            While it charges, the line slopes up. While it sits switched off, the line is flat. You can
            tell what is happening to the charge just by looking at which way the line slopes. In this
            experiment you will see a line like that for the orbital energy of the two objects: the
            energy they have because they are orbiting each other. Before the run, you will say which
            way you think the line goes.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> You'll watch the same chirp as in &ldquo;The Chirp&rdquo;: L-shaped
            detector arms driven by a wave from two massive objects spiralling toward each other. Next
            to it you'll see a new graph, of the orbital energy the two objects have left, drawn over that
            same run. The run ends at an idealized &ldquo;final moment&rdquo;, just before the two objects would
            meet; the meeting itself is not shown. Before you press Run, you'll predict which way the
            orbital energy goes.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> In Part 1, make your prediction, then run a light pair and watch the
            arms and the energy line. In Part 2, choose a mass of your own and run it. Then the tutor will
            ask you what you saw.
          </p>
          <p style={paragraph}>
            <strong>Your prediction and the real pictures.</strong> Your prediction never changes the real
            pictures, the tables or the numbers: the arms, the graphs and the energy line come from a
            calculation that knows nothing about what you guessed. Your guess is drawn on the energy graph
            in white, in a box labelled YOUR GUESS, and listed again beside the results. In Part 2, the
            mass slider does change the drawings; the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each
            one, with a short plain meaning: energy, orbital energy, energy units, radiated energy,
            gravitational wave, black hole, inspiral, final moment, mass, pitch, loudness, strain,
            solar mass, LIGO and GW150914.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything &ldquo;The Chirp&rdquo; assumed still applies here: the effect is hugely
              exaggerated, only one wave pattern is shown, no real detection hardware is modeled,
              the exact moment the two objects meet isn't modeled, and the mass-to-chirp
              relationship is a simplified stand-in for the real physics.
            </li>
            <li>
              The energy-loss relationship shown here is a separate, explicitly-labeled toy
              formula, not derived from the chirp formula and not the real equations that actually
              govern how a real inspiral radiates energy.
            </li>
            <li>
              Energy is shown in made-up units for this experiment's display, not real joules or
              real solar masses of energy.
            </li>
            <li>
              The mass control reuses the made-up mass scale of the black hole experiment in the
              Gravity and Curved Spacetime chapter, not real solar masses.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(hasFinished)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages and the original scientific
            paper are listed here. Checked on 7 November 2026. Each link opens in a new tab.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            {PLAIN_LINKS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you predict which way the orbital energy goes. Then you press Run and watch a light pair&rsquo;s wave pass through
          the arms, with a graph of its orbital energy beside it. Your guess is drawn on that graph in white once the graph is
          drawn.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            During the run, what do you think happens to the orbital energy of the two objects: the energy they have because
            they are orbiting each other?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {energyChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setPrediction(choice.value)}
                disabled={locked}
                className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {prediction || submitted
              ? `Your prediction: ${energyChoices.find((c) => c.value === (prediction ?? submitted))!.label}`
              : 'Choose an option to continue'}
            {locked && ' Your prediction is locked while you try other masses. To change it, press Start over.'}
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRunPart1}
          disabled={!hasPrediction || part1Running || part2Running}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          {part1Running ? 'Running...' : part1Done ? 'Run again' : 'Run'}
        </button>
        {locked && (
          <button
            type="button"
            onClick={handleStartOver}
            disabled={part1Running || part2Running}
            className="secondary-button"
            style={{ marginLeft: '0.75rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer', backgroundColor: 'rgba(124, 58, 237, 0.22)' }}
          >
            Start over
          </button>
        )}
        {!hasPrediction && <p style={smallNote}>Answer the prediction above to press Run.</p>}

        <Block>
          <ArmsPicture
            armXLength={part1State.armXLength}
            armYLength={part1State.armYLength}
            label="The two detector arms seen from above, with a dashed amber outline at the rest length. Arm X is violet and Arm Y is cyan."
          />
          <Readout time={part1Time} mass={ENERGY_PART1_MASS} />
          <Definitions />
          <ArmsCaption name="Picture 1" summary={part1Arms} done={part1Done} pink={false} />
        </Block>

        {part1Started && (
          <Block>
            <ChirpGraph
              mass={ENERGY_PART1_MASS}
              trace={part1Trace}
              time={part1Time}
              started={part1Started}
              pink={false}
              label="A graph of the two arm lengths against time during the run, with a dashed line at the rest length 1.000. Arm X is violet and Arm Y is cyan."
            />
            <ArmGraphCaption
              name="Picture 2"
              summary={part1Arms}
              swing={part1Swing}
              half={graphHalfRange(ENERGY_PART1_MASS)}
              done={part1Done}
              pink={false}
            />
          </Block>
        )}

        {part1Started && (
          <Block>
            <EnergyGraph
              mass={ENERGY_PART1_MASS}
              time={part1Time}
              started={part1Started}
              done={part1Done}
              pink={false}
              guess={submitted}
              label="A graph of the orbital energy the two objects have left, against time during the run. Your guess is drawn in white in a box marked YOUR GUESS."
            />
            <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem' }}>
              Orbital energy left: {part1EnergyNow.remainingOrbitalEnergy.toFixed(3)} &nbsp;|&nbsp; Radiated energy:{' '}
              {part1EnergyNow.radiatedEnergy.toFixed(3)} (energy units, not real joules)
            </p>
            <EnergyCaption name="Picture 3" summary={part1Energy} done={part1Done} pink={false} guess={submitted} />
          </Block>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the mass of the pair, from very light to very heavy, and run it. The mass slider changes the drawings in
              this Part, marked in pink. It does not change Part 1&rsquo;s pictures, the table in Part 3, or your guess.
            </PartHeader>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <p style={paragraph}>
                <strong>What you are changing.</strong> The <strong>mass</strong> of the pair of objects that circle each other. The scale is
                made up, from 0.2 (a very light pair) to 6 (a very heavy pair). In Part 1 the pair had a mass of{' '}
                {ENERGY_PART1_MASS.toFixed(1)}. Nothing else changes: the same simplified formulas are used for every mass, so any difference
                you see comes from the mass.
              </p>
              <p style={paragraph}>
                <strong>What to try.</strong> Run a light pair (try 0.2) and then a heavy pair (try 6), and compare the numbers on the side axis of
                Drawing C: how much energy the pair starts with, and how much is left at the final moment.
              </p>
              <p style={paragraph}>
                <strong>The pink marks.</strong> Pink always means your own choice. The pink start label and bracket on Drawing C follow the
                slider, so they move as soon as you move it, before you run. The lines are drawn only when you press Run your mass.
              </p>
              <p style={paragraph}>
                <strong>Your guess.</strong> White always means your guess. It is drawn again on Drawing C, beside the real line of the mass you
                run, so you can compare. It never changes the line.
              </p>
            </div>

            <p style={smallNote}>
              Your guess does not change these drawings or the table in Part 3, but this slider does change the drawings below.
            </p>
            <label htmlFor="energy-mass" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Mass: {mass.toFixed(1)}
            </label>
            <input
              id="energy-mass"
              type="range"
              min={0.2}
              max={6}
              step={0.1}
              value={mass}
              disabled={part2Running}
              onChange={(event) => setMass(Number(event.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>0.2 (very light)</span>
              <span>6 (very heavy)</span>
            </div>
            <p style={{ fontSize: '0.875rem', margin: '0.75rem 0 0' }}>
              At mass <strong>{mass.toFixed(1)}</strong> the pair starts with <strong>{fixed3(part2Energy.startEnergy)}</strong> energy units of
              orbital energy, and the final moment comes at <strong>{fixed3(part2Energy.cutoffTime)}</strong> time units.
            </p>
            <button
              type="button"
              className="action-button"
              onClick={handleRunPart2}
              disabled={part2Running}
              style={{ marginTop: '1rem', padding: '0.6rem 1.5rem' }}
            >
              {part2Running ? 'Running...' : 'Run your mass'}
            </button>

            <Block>
              <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Drawing A: your arms</p>
              <ArmsPicture
                armXLength={part2State.armXLength}
                armYLength={part2State.armYLength}
                label="Drawing A: the two detector arms at your mass, with a dashed amber outline at the rest length."
              />
              <Readout time={part2Time} mass={mass} />
              <ArmsCaption name="Drawing A" summary={part2Arms} done={part2Done} pink />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Drawing B: your arm lengths against time</p>
              <ChirpGraph
                mass={mass}
                trace={part2Trace}
                time={part2Time}
                started={ranHere}
                pink
                label="Drawing B: a graph of the two arm lengths against time at your mass, with pink marks for your own mass."
              />
              <ArmGraphCaption name="Drawing B" summary={part2Arms} swing={part2Swing} half={graphHalfRange(mass)} done={part2Done} pink />
              <p style={smallNote}>Move the slider and press Run your mass to redraw the arm lines.</p>
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Drawing C: your orbital energy against time</p>
              <EnergyGraph
                mass={mass}
                time={part2Time}
                started={ranHere}
                done={part2Done}
                pink
                guess={submitted}
                label="Drawing C: a graph of the orbital energy left at your mass, against time, with pink marks for your own mass. Your guess is drawn in white in a box marked YOUR GUESS."
              />
              <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem' }}>
                Orbital energy left: {part2EnergyNow.remainingOrbitalEnergy.toFixed(3)} &nbsp;|&nbsp; Radiated energy:{' '}
                {part2EnergyNow.radiatedEnergy.toFixed(3)} (energy units, not real joules)
              </p>
              <EnergyCaption name="Drawing C" summary={part2Energy} done={part2Done} pink guess={submitted} />
              <p style={smallNote}>
                These are trial values for the pictures. They do not say the real system is like that.
              </p>
            </Block>
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && submitted && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guess listed beside them. Nothing in this Part changes with your guess or
              with the mass slider in Part 2.
            </PartHeader>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Your guess, beside the results</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 0, marginBottom: '0.5rem' }}>
              Your guess is shown here as you made it, with the place where its number appears. It is not marked here, and it never changes a
              picture or a table. The tutor marks it, in Part 4.
            </p>
            <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <li>
                <strong>Your guess:</strong> the orbital energy {guessLabel(submitted)}. The question was what happens to the orbital energy of
                the two objects during the run. Its numbers are in Table 1, row &ldquo;Orbital energy left&rdquo;, and in Picture 3&rsquo;s white mark.
              </li>
            </ul>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>How to read these results.</strong> A table of numbers is hard to read until someone says what it is. This table says what
                the pair&rsquo;s orbital energy was at the start and at the final moment of the Part 1 run, and how much of it had left the orbit by
                then. The numbers are in made-up energy units, so what matters is how the numbers compare with each other: a tenth left, nine
                tenths gone.
              </p>
              <p style={paragraph}>
                <strong>Why there is no check-up table here.</strong> A check-up sets a result beside a real reference. The one real figure is the
                energy GW150914 gave out, but it is a share of the two black holes&rsquo; total mass, not of an &ldquo;orbital energy&rdquo; like this page&rsquo;s,
                so it is not the same kind of number. Putting one beside the other would invite a false comparison, so the real figures are given
                under &ldquo;A real detection&rdquo; below, as facts.
              </p>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Table 1: the orbital energy in the Part 1 run (mass {part1Energy.mass.toFixed(1)})</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'At the start', 'At the final moment', 'Change']}
              minWidth={560}
              rows={[
                [
                  <>
                    Orbital energy left
                    <GuessTag />
                  </>,
                  fixed3(part1Energy.startEnergy),
                  fixed3(part1Energy.finalRemainingEnergy),
                  `${fixed3(part1Energy.startEnergy - part1Energy.finalRemainingEnergy)} less`,
                ],
                [
                  'Radiated energy (energy that has left the orbit)',
                  fixed3(0),
                  fixed3(part1Energy.finalRadiatedEnergy),
                  `${fixed3(part1Energy.finalRadiatedEnergy)} more`,
                ],
                [
                  'Share of the starting energy left',
                  '100%',
                  `${Math.round(part1Energy.shareLeft * 100)}%`,
                  `${100 - Math.round(part1Energy.shareLeft * 100)} percentage points less`,
                ],
              ]}
            />
            <p style={{ ...smallNote, margin: '0.5rem 0 1rem' }}>
              The tag shows which row relates to your guess. It does not say whether the guess matched.
            </p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Orbital energy left.</strong> <em>What it is:</em> the energy the two objects still have because they are orbiting each
                  other. <em>What it means:</em> it goes from {fixed3(part1Energy.startEnergy)} to {fixed3(part1Energy.finalRemainingEnergy)}:{' '}
                  {fixed3(part1Energy.startEnergy - part1Energy.finalRemainingEnergy)} less. A daily-life comparison: it is the battery charge in the
                  picture near the top of the page, and the line sloped down, as a battery does while it is being used. <em>Why it matters:</em> it
                  is the amount the question was about, and its direction is the thing you predicted.
                </li>
                <li>
                  <strong>Radiated energy.</strong> <em>What it is:</em> the energy that has left the orbit, up to that moment. <em>What it means:</em>{' '}
                  it goes from {fixed3(0)} to {fixed3(part1Energy.finalRadiatedEnergy)}. Left plus radiated is always {fixed3(part1Energy.startEnergy)}:{' '}
                  {fixed3(part1Energy.finalRemainingEnergy)} + {fixed3(part1Energy.finalRadiatedEnergy)} = {fixed3(part1Energy.startEnergy)}.{' '}
                  <em>Why it matters:</em> nothing disappears from the books: what the orbit has less of is counted as radiated. Where it goes is for
                  the tutor.
                </li>
                <li>
                  <strong>Share left.</strong> <em>What it is:</em> the fraction of the starting energy still in the orbit. <em>What it means:</em> at the
                  final moment a tenth, {Math.round(part1Energy.shareLeft * 100)} percent, of the start is left. It is a tenth for every mass, because
                  this page&rsquo;s formula takes the same fraction of the energy at the same point of the run. A heavier pair has more energy to start
                  with: at mass 3.0 it starts with {fixed3(energyRunSummary(3).startEnergy)}, ten times as much as {fixed3(part1Energy.startEnergy)}, and has{' '}
                  {fixed3(energyRunSummary(3).finalRemainingEnergy)} left. <em>Why it matters:</em> it shows what mass changes (how much energy there
                  is) and what it does not (how much of it is gone at the final moment). Try it in Part 2.
                </li>
                <li>
                  <strong>How sure the numbers are.</strong> These come from a simplified stand-in formula, not the real equations. The straight line is
                  the simplest line that goes from the full amount to a small amount. A real inspiral does not lose energy at a steady rate: LIGO&rsquo;s own
                  page says the closer the pair, the faster it orbits and the stronger its waves, so the more energy it loses. The size of the numbers
                  ({fixed3(part1Energy.startEnergy)}, {fixed3(part1Energy.finalRemainingEnergy)}) is made up, so only the comparison, a tenth left, is
                  meaningful here.
                </li>
              </ul>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>A real detection.</strong> LIGO&rsquo;s GW150914 detection (2015) came from two black holes of about{' '}
                {REAL_GW150914_ENERGY.initialSolarMasses[0]} and {REAL_GW150914_ENERGY.initialSolarMasses[1]} times the mass of the Sun that merged
                into one of about {REAL_GW150914_ENERGY.finalSolarMasses} solar masses. The energy that left in gravitational waves was about{' '}
                {REAL_GW150914_ENERGY.radiatedSolarMasses} solar masses&rsquo; worth: that is, the energy you would get by turning about{' '}
                {REAL_GW150914_ENERGY.radiatedSolarMasses} Suns&rsquo; worth of mass into energy. It came out mostly in a fraction of a second. LIGO
                estimated that, at its peak, the power in the waves was more than ten times the combined light power of all the stars and galaxies in the
                observable Universe. The signal LIGO could record from the end of the pair&rsquo;s inspiral lasted about two-tenths of a second. The energy
                scale on this page is a simplified stand-in, not the real equations.
              </p>
              <p style={paragraph}>
                <strong>Where these figures come from.</strong> The masses and the energy are from the original paper,{' '}
                <ExternalLink href="https://arxiv.org/abs/1602.03837">&ldquo;Observation of Gravitational Waves from a Binary Black Hole Merger&rdquo;</ExternalLink>{' '}
                (the abstract gives 3.0 solar masses with a margin of about 0.5, a 90 percent credible interval). The peak-power comparison and the
                two-tenths of a second are from LIGO&rsquo;s{' '}
                <ExternalLink href="https://ligo.org/science-summaries/GW150914/">science summary</ExternalLink> and{' '}
                <ExternalLink href="https://www.ligo.caltech.edu/page/gw-sources">&ldquo;Sources and Types of Gravitational Waves&rdquo;</ExternalLink>.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ===== Part 4 ===== */}
      {part1Done && submitted && (
        <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            Talk through what you saw. The tutor points to your white guess mark, then explains.
          </PartHeader>
          <GravitationalWaveEnergyTutor key={part1RunId} energyPrediction={submitted} onExplained={onTutorComplete} />
        </div>
      )}
    </div>
  )
}
