import { useMemo, useRef, useState, type ReactNode } from 'react'
import { BASE_ARM_LENGTH } from '../physics/gravitationalWaveExperiment'
import { BASE_AMPLITUDE, BASE_FREQUENCY, chirpStateAt } from '../physics/gravitationalWaveChirpExperiment'
import { orbitalEnergyStateAt } from '../physics/gravitationalWaveEnergyExperiment'
import {
  FERMI_GW150914_REPORT,
  REAL_EVENT_FACTS,
  REAL_EVENT_PRESETS,
  eventComparison,
  eventPresetSummary,
  eventRunSummary,
  louderGuessMarker,
  louderGuessMatches,
} from '../physics/gravitationalWaveRealEventsExperiment'
import type { EventRunSummary, LouderChoice } from '../physics/gravitationalWaveRealEventsExperiment'
import { GravitationalWaveRealEventsTutor } from './GravitationalWaveRealEventsTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle, useRunner } from './GravitationalWaveExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'

// Gravitational Waves, Experiment 4, audited to the newer rules (docs/audit/gravitational-waves/04-draft-wording.md): the page in
// four Parts, two real events run one after the other and drawn side by side on Picture 2 with the white YOUR GUESS mark, pink
// marks for the learner's own mass in Part 2, a full caption on every picture, a reading guide for the results, a links list, a
// words box, a "Start over" button and a tutor that points to the mark. Every number drawn or shown comes from the physics
// modules (src/physics/gravitationalWaveRealEventsExperiment.ts and the chirp and energy modules; CLAUDE.md §9). The wording is
// the owner's, approved on 2026-11-07 as drafted (CLAUDE.md §28.1).

interface GravitationalWaveRealEventsExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

type EventId = 'gw150914' | 'gw170817'
type SourceKind = EventId | 'custom' | 'none'

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const
const captionBox = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' } as const
const bulletList = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const
const fixed3 = (value: number) => (Math.abs(value) < 1e-9 ? 0 : value).toFixed(3)

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const BH_COLOR = '#f59e0b' // amber: the black-hole event (matches its dots' glow); not the arms' colours
const NS_COLOR = '#a5f3fc' // pale cyan: the neutron-star event (matches its dots' glow)
const PART2_MASS_DEFAULT = 2

const GUESS_TEXT: Record<LouderChoice, string> = {
  'black-holes': 'the black holes made the louder chirp',
  'neutron-stars': 'the neutron stars made the louder chirp',
  same: 'the two would be the same',
}
const louderChoices: Array<{ value: LouderChoice; label: string }> = [
  { value: 'black-holes', label: 'The black holes' },
  { value: 'neutron-stars', label: 'The neutron stars' },
  { value: 'same', label: 'They would be the same' },
]

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages and papers fetched and read on 7 November 2026 (see the audit's draft wording, section 10).
const LINK_GROUPS: Array<{ heading: string; links: Array<{ href: string; label: string; what: string }> }> = [
  {
    heading: 'The two events',
    links: [
      { href: 'https://www.ligo.caltech.edu/page/press-release-gw170817', label: 'LIGO Caltech: press release for GW170817', what: 'the announcement of the first collision seen in both gravitational waves and light. It says the gamma-ray flash came about 2 seconds later, and that a black hole collision is not expected to give off light.' },
      { href: 'https://science.nasa.gov/missions/chandra/nasa-missions-catch-first-light-from-a-gravitational-wave-event/', label: 'NASA: "NASA Missions Catch First Light from a Gravitational-Wave Event"', what: 'the kilonova and the hot debris. It says merging black holes very likely consume any matter around them long before they crash.' },
      { href: 'https://svs.gsfc.nasa.gov/12740/', label: 'NASA Scientific Visualization Studio: GW170817', what: 'the 1.7-second delay, the distance of about 130 million light-years, and the gold and platinum the collision made.' },
      { href: 'https://www.ligo.caltech.edu/page/press-release-gw150914', label: 'LIGO Caltech: press release for GW150914', what: 'the first detection, from two merging black holes.' },
      { href: 'https://www.ligo.caltech.edu/page/what-are-gw', label: 'LIGO Caltech: "What are gravitational waves?"', what: 'a plain overview, including the 1.3 billion light-years to GW150914.' },
      { href: 'https://www.nasa.gov/universe/nasas-fermi-telescope-poised-to-pin-down-gravitational-wave-sources/', label: 'NASA: "NASA\'s Fermi Telescope Poised to Pin Down Gravitational Wave Sources"', what: 'the faint flash Fermi reported after GW150914, why black-hole mergers were not expected to give light, and that many astronomers think it was a coincidence.' },
    ],
  },
  {
    heading: 'Neutron stars and black holes',
    links: [
      { href: 'https://science.nasa.gov/universe/whats-inside-a-dead-star/', label: 'NASA Science: "What\'s Inside a \'Dead\' Star?"', what: 'how a neutron star forms; about as wide as a city; a teaspoon of it weighing as much as Mount Everest.' },
      { href: 'https://imagine.gsfc.nasa.gov/science/objects/black_holes1.html', label: 'NASA Imagine the Universe: "Black Holes"', what: 'how a black hole forms, and that a black hole with the mass of the Sun would have a radius of about 3 kilometres.' },
      { href: 'https://www.nasa.gov/universe/what-are-black-holes', label: 'NASA: "What Are Black Holes?"', what: 'the kinds of black hole and how the ones made from stars form.' },
    ],
  },
  {
    heading: 'The original papers',
    links: [
      { href: 'https://arxiv.org/abs/1602.03837', label: '"Observation of Gravitational Waves from a Binary Black Hole Merger"', what: 'GW150914 (LIGO Scientific Collaboration and Virgo Collaboration, Physical Review Letters 116, 061102, 2016). The abstract gives the masses, the distance (410 megaparsecs) and the energy (3.0 Suns\' worth).' },
      { href: 'https://arxiv.org/abs/1710.05832', label: '"GW170817: Observation of Gravitational Waves from a Binary Neutron Star Inspiral"', what: 'GW170817 (Physical Review Letters 119, 161101, 2017). The abstract gives the masses, the distance (40 megaparsecs) and the gamma-ray burst 1.7 seconds after the merger.' },
      { href: 'https://arxiv.org/abs/1710.05833', label: '"Multi-messenger Observations of a Binary Neutron Star Merger"', what: 'the light seen from GW170817: the host galaxy NGC 4993, and the glow followed for about 16 days.' },
      { href: 'https://arxiv.org/abs/1602.03920', label: '"Fermi GBM Observations of LIGO Gravitational Wave event GW150914"', what: 'the faint flash 0.4 seconds after GW150914, and why the authors say more events are needed to know whether it was real.' },
    ],
  },
  {
    heading: 'Seeing one event in more than one way',
    links: [
      { href: 'https://ligo.org/science-summaries/GW170817MMA/', label: 'LIGO science summary of GW170817\'s light observations', what: 'defines multi-messenger astronomy and describes the event. Written for the public, but technical, not beginner-simple.' },
    ],
  },
]

// The "Words and formulas" box. Worked examples take every number from the physics modules (CLAUDE.md §9). The formulas show
// how the two runs relate, so they appear only after both Part 1 runs (CLAUDE.md §12).
function referenceEntries(bothDone: boolean): { term: string; meaning: string }[] {
  const { blackHoles: bh, neutronStars: ns } = eventComparison()
  const entries = [
    { term: 'Neutron star', meaning: 'what a big star can leave behind when it runs out of fuel and collapses: a ball of crushed matter about as wide as a city, so dense that a teaspoon of it would weigh as much as Mount Everest. The tiny particles it is made of push back against being squeezed any closer, which stops the collapse.' },
    { term: 'Black hole', meaning: 'what is left when the collapse is too big for that push-back to stop: a region so small and so dense that not even light can escape it. A black hole with the mass of our Sun would be only about 6 kilometres across.' },
    { term: 'Supernova', meaning: 'the explosion that blows apart a massive star when it runs out of fuel and collapses.' },
    { term: 'Solar mass', meaning: 'the mass of our Sun. It is used here to say how heavy the real objects are.' },
    { term: 'Gravitational wave', meaning: 'a ripple in the shape of spacetime that travels outward from a violent event, such as two black holes spiralling into each other, at the speed of light.' },
    { term: 'Chirp', meaning: 'the wave a spiralling pair makes as it closes in: its pitch and loudness build up until the final moment.' },
    { term: 'Pitch (frequency)', meaning: 'how fast the arms swing. The higher the number, the higher the pitch.' },
    { term: 'Loudness (amplitude)', meaning: 'how far the arms swing: the biggest strain the wave is reaching at one moment.' },
    { term: 'Strain', meaning: 'a plain number saying how strongly the wave is acting on space at one instant. 0 means the wave is doing nothing at that instant; the bigger the number, positive or negative, the stronger its effect.' },
    { term: 'Orbital energy', meaning: 'the energy two objects have because they are orbiting each other.' },
    { term: 'Radiated energy', meaning: 'energy that has left the orbit, counted up to a given moment.' },
    { term: 'Final moment', meaning: 'the idealized end of the run, shortly before the two objects would meet. The meeting itself is not shown.' },
    { term: 'Toy mass', meaning: 'a made-up number on this project\'s own scale, 0.2 to 6, used to stand in for a real event. It is not in solar masses.' },
    { term: 'Light counterpart', meaning: 'light that comes from the same event as a gravitational wave.' },
    { term: 'Gamma-ray burst', meaning: 'a short, very bright flash of gamma rays, the most energetic kind of light.' },
    { term: 'Kilonova', meaning: 'the glow of hot, radioactive debris thrown out when two neutron stars merge.' },
    { term: 'Multi-messenger astronomy', meaning: 'watching one event in more than one way, here with gravitational waves and with light. A "messenger" is anything that carries news of an event to us.' },
    { term: 'LIGO and Virgo', meaning: 'the detectors that found the waves: LIGO has two detectors in the United States, each with two arms 4 kilometres long; Virgo is in Italy.' },
    { term: 'GW150914 and GW170817', meaning: 'the names of two real detections. "GW" stands for gravitational wave and the numbers are the date: 14 September 2015 and 17 August 2017.' },
  ]
  if (bothDone) {
    entries.push(
      { term: 'Formula: final loudness', meaning: `0.03 × the mass × 3.162 (the loudness starts at 0.03 × the mass and is 3.162 times larger at the final moment). Example: mass ${bh.mass} gives ${fixed3(bh.startLoudness)} at the start and ${fixed3(bh.finalLoudness)} at the final moment; mass ${ns.mass} gives ${fixed3(ns.startLoudness)} and ${fixed3(ns.finalLoudness)}.` },
      { term: 'Formula: length of the run', meaning: `0.9 ÷ the mass. Example: mass ${bh.mass} gives ${fixed3(bh.runTime)}; mass ${ns.mass} gives ${fixed3(ns.runTime)}.` },
      { term: 'Formula: starting energy', meaning: `the mass, in energy units, with a tenth of it left at the final moment. Example: mass ${bh.mass} starts with ${fixed3(bh.startEnergy)} and has ${fixed3(bh.finalEnergyLeft)} left; mass ${ns.mass} starts with ${fixed3(ns.startEnergy)} and has ${fixed3(ns.finalEnergyLeft)} left.` },
    )
  }
  return entries
}

// ---- Small shared pieces ----
function WhereFrom({ measured, calculated, imagined, guess }: { measured: ReactNode; calculated: ReactNode; imagined: ReactNode; guess?: ReactNode }) {
  return (
    <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.75rem' }}>
      <strong>Where the real picture comes from.</strong> <em>Measured:</em> {measured} <em>Calculated here:</em> {calculated}{' '}
      {guess && (
        <>
          <em>Your guess:</em> {guess}{' '}
        </>
      )}
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

// ---- Picture 1 / Drawing A: the arms and the source ----
const VIEW_SIZE = 320
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180

function armEndPoint(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x' ? { x: CORNER.x + pixels, y: CORNER.y } : { x: CORNER.x, y: CORNER.y - pixels }
}

// A purely illustrative traveling-wave pattern drawn alongside each straight arm, derived from the same strain and
// frequency values shown in the live readout (not a separately simulated quantity).
const WAVE_CYCLES_PER_ARM = 5
const WAVE_SEGMENTS = 48

function armWavePoints(axis: 'x' | 'y', start: { x: number; y: number }, end: { x: number; y: number }, amplitudePixels: number, phase: number) {
  const points: Array<{ x: number; y: number }> = []
  for (let i = 0; i <= WAVE_SEGMENTS; i += 1) {
    const t = i / WAVE_SEGMENTS
    const baseX = start.x + (end.x - start.x) * t
    const baseY = start.y + (end.y - start.y) * t
    const offset = amplitudePixels * Math.sin(2 * Math.PI * (t * WAVE_CYCLES_PER_ARM - phase))
    points.push(axis === 'x' ? { x: baseX, y: baseY + offset } : { x: baseX + offset, y: baseY })
  }
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
}

const SOURCE_NAME: Record<SourceKind, string> = {
  gw150914: 'the source: two black holes',
  gw170817: 'the source: two neutron stars',
  custom: 'the source: a pair of your mass',
  none: 'the source: the pair',
}

export function EventArms({ mass, time, started, kind, label }: { mass: number; time: number; started: boolean; kind: SourceKind; label: string }) {
  const run = eventRunSummary(mass)
  const shownTime = started ? Math.min(time, run.runTime) : 0
  const state = chirpStateAt(shownTime, mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const xEnd = armEndPoint('x', state.armXLength)
  const yEnd = armEndPoint('y', state.armYLength)

  // Purely visual intensity, from the same state values shown in the readout.
  const strainMagnitude = Math.abs(state.strain)
  const progressFraction = run.runTime > 0 ? Math.min(1, shownTime / run.runTime) : 0
  const armStrokeWidth = started ? Math.min(11, 2 + strainMagnitude * 22) : 1.5
  const pulseRadius = started ? Math.min(15, 4 + strainMagnitude * 26) : 4
  const armGlowOpacity = started ? Math.min(0.85, strainMagnitude * 7) : 0
  const armGlowBlur = 2 + strainMagnitude * 6
  const waveAmplitudeMagnitude = started ? Math.min(14, strainMagnitude * 160) : 0
  const waveSign = state.strain < 0 ? -1 : 1
  const wavePhase = shownTime * state.frequency * 2
  const xWavePoints = armWavePoints('x', CORNER, xEnd, waveAmplitudeMagnitude * waveSign, wavePhase)
  const yWavePoints = armWavePoints('y', CORNER, yEnd, -waveAmplitudeMagnitude * waveSign, wavePhase)

  // The orbiting pair that drives the wave, drawn to match the frequency and progress numbers (illustrative, not a
  // separate simulation). It shrinks until the two objects overlap at the final moment.
  const sourceCenter = { x: 150, y: 170 }
  const orbitRadius = started ? Math.max(0, 34 - progressFraction * 34) : 34
  const orbitAngle = 2 * Math.PI * state.frequency * shownTime
  const dot1 = { x: sourceCenter.x + orbitRadius * Math.cos(orbitAngle), y: sourceCenter.y + orbitRadius * Math.sin(orbitAngle) }
  const dot2 = { x: sourceCenter.x - orbitRadius * Math.cos(orbitAngle), y: sourceCenter.y - orbitRadius * Math.sin(orbitAngle) }
  const dotColor = kind === 'gw150914' ? '#111827' : kind === 'gw170817' ? '#f0fdff' : '#c4b5fd'
  const dotGlow = kind === 'gw150914' ? BH_COLOR : kind === 'gw170817' ? '#a5f3fc' : '#67e8f9'
  const dotRadius = kind === 'gw150914' ? 13 : 10
  const filterId = `real-events-arm-glow-${kind}`

  return (
    <svg
      width={VIEW_SIZE}
      height={VIEW_SIZE}
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      style={{
        ...svgStyle,
        boxShadow: started ? `0 0 ${12 + progressFraction * 36}px rgba(124, 58, 237, ${0.25 + progressFraction * 0.55})` : 'none',
        transition: 'box-shadow 80ms linear',
      }}
      role="img"
      aria-label={label}
    >
      <defs>
        <filter id={filterId} x="-75%" y="-75%" width="250%" height="250%">
          <feGaussianBlur stdDeviation={armGlowBlur} />
        </filter>
      </defs>
      <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke="#a78bfa" strokeWidth={armStrokeWidth + 6} strokeLinecap="round" opacity={armGlowOpacity} filter={`url(#${filterId})`} />
      <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke="#22d3ee" strokeWidth={armStrokeWidth + 6} strokeLinecap="round" opacity={armGlowOpacity} filter={`url(#${filterId})`} />
      <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke="#c4b5fd" strokeWidth={armStrokeWidth} strokeLinecap="round" />
      <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke="#67e8f9" strokeWidth={armStrokeWidth} strokeLinecap="round" />
      <circle cx={CORNER.x} cy={CORNER.y} r={pulseRadius} fill="#f5f3ff" opacity={started ? 0.9 : 0.6} />
      <circle cx={xEnd.x} cy={xEnd.y} r={5} fill="#c4b5fd" />
      <circle cx={yEnd.x} cy={yEnd.y} r={5} fill="#67e8f9" />
      <polyline points={xWavePoints} fill="none" stroke="#c4b5fd" strokeWidth={1.5} opacity={started ? 0.85 : 0} />
      <polyline points={yWavePoints} fill="none" stroke="#67e8f9" strokeWidth={1.5} opacity={started ? 0.85 : 0} />
      <text x={(CORNER.x + xEnd.x) / 2} y={CORNER.y + 18} fill="#c4b5fd" fontSize="11" textAnchor="middle">
        Arm X
      </text>
      <text x={CORNER.x - 10} y={(CORNER.y + yEnd.y) / 2} fill="#67e8f9" fontSize="11" textAnchor="middle" transform={`rotate(-90, ${CORNER.x - 10}, ${(CORNER.y + yEnd.y) / 2})`}>
        Arm Y
      </text>
      <text x={CORNER.x + 8} y={CORNER.y - 8} fill={MUTED_COLOR} fontSize="10">
        corner
      </text>
      <line x1={dot1.x} y1={dot1.y} x2={dot2.x} y2={dot2.y} stroke={dotGlow} strokeWidth={1} opacity={0.5} />
      <circle cx={dot1.x} cy={dot1.y} r={dotRadius + 7} fill={dotGlow} opacity={started ? Math.min(0.65, 0.15 + strainMagnitude * 3) : 0.25} />
      <circle cx={dot2.x} cy={dot2.y} r={dotRadius + 7} fill={dotGlow} opacity={started ? Math.min(0.65, 0.15 + strainMagnitude * 3) : 0.25} />
      <circle cx={dot1.x} cy={dot1.y} r={dotRadius} fill={dotColor} />
      <circle cx={dot2.x} cy={dot2.y} r={dotRadius} fill={dotColor} />
      <text x={sourceCenter.x} y={sourceCenter.y - 46} fill="#cbd5e1" fontSize="10" textAnchor="middle">
        {SOURCE_NAME[kind]}
      </text>
    </svg>
  )
}

function Readout({ mass, time, started, hideBeforeStart = false }: { mass: number; time: number; started: boolean; hideBeforeStart?: boolean }) {
  const run = eventRunSummary(mass)
  const t = started ? Math.min(time, run.runTime) : 0
  const state = chirpStateAt(t, mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const energy = orbitalEnergyStateAt(t, mass)
  return (
    <>
      <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem' }}>
        {hideBeforeStart && !started ? (
          // Before the first run no number is shown: the toy masses and their numbers come after the learner has predicted (CLAUDE.md §12).
          <>
            Frequency: — &nbsp;|&nbsp; Amplitude: — &nbsp;|&nbsp; Strain: —
            <br />
            Arm X length: — &nbsp;|&nbsp; Arm Y length: —
            <br />
            Orbital energy left: — &nbsp;|&nbsp; Radiated energy: — (energy units, not real joules)
          </>
        ) : (
          <>
            Frequency: {state.frequency.toFixed(3)} &nbsp;|&nbsp; Amplitude: {state.amplitude.toFixed(3)} &nbsp;|&nbsp; Strain: {state.strain.toFixed(3)}
            <br />
            Arm X length: {state.armXLength.toFixed(3)} &nbsp;|&nbsp; Arm Y length: {state.armYLength.toFixed(3)}
            <br />
            Orbital energy left: {energy.remainingOrbitalEnergy.toFixed(3)} &nbsp;|&nbsp; Radiated energy: {energy.radiatedEnergy.toFixed(3)} (energy units, not real joules)
          </>
        )}
      </p>
      <ul style={{ ...smallNote, marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>Frequency (pitch):</strong> how many full swings the arms make in one time unit, at this instant. The higher the number, the higher the pitch.
        </li>
        <li>
          <strong>Amplitude (loudness):</strong> the biggest strain the wave is reaching at this instant.
        </li>
        <li>
          <strong>Strain:</strong> a plain number saying how strongly the wave is acting on space at this instant. 0 means the wave is doing nothing at this instant; the bigger the number, positive or negative, the stronger its effect.
        </li>
        <li>
          <strong>Orbital energy left</strong> and <strong>radiated energy:</strong> how much of the pair&rsquo;s orbital energy is still in the orbit and how much has left it, in made-up energy units.
        </li>
      </ul>
    </>
  )
}

// ---- Picture 2 / Drawing B: the two events side by side, with the guess and (Part 2) your mass ----
const C = { width: 580, labelX: 12, left: 190, right: 520 }
const ROW_STEP = 34
const BAR_HEIGHT = 18
// Fixed scales taken from the module's extremes, so the bars never rescale when the slider moves.
const LOUDNESS_MAX = eventRunSummary(6).finalLoudness
const RUNTIME_MAX = eventRunSummary(0.2).runTime

interface ComparisonRow {
  id: 'gw150914' | 'gw170817' | 'custom'
  name: string
  color: string
  summary: EventRunSummary
}

export function ComparisonPicture({
  bothDone,
  shown,
  guess,
  yourMass,
  label,
}: {
  bothDone: boolean
  // Which events' bars are drawn: each appears as soon as its run has finished; the white guess appears with the first.
  shown?: Record<EventId, boolean>
  guess: LouderChoice | null
  yourMass: EventRunSummary | null
  label: string
}) {
  const barShown = (id: ComparisonRow['id']) => (id === 'custom' ? true : shown ? shown[id] : bothDone)
  const { blackHoles, neutronStars } = eventComparison()
  const rows: ComparisonRow[] = [
    { id: 'gw150914', name: 'GW150914 (black holes)', color: BH_COLOR, summary: blackHoles },
    { id: 'gw170817', name: 'GW170817 (neutron stars)', color: NS_COLOR, summary: neutronStars },
  ]
  if (yourMass) rows.push({ id: 'custom', name: `YOUR MASS: ${yourMass.mass.toFixed(1)}`, color: YOURS_COLOR, summary: yourMass })
  const n = rows.length
  const a = { title: 30, rows: 44 }
  const aAxis = a.rows + n * ROW_STEP
  const boxY = aAxis + 30
  const b = { title: boxY + 62, rows: boxY + 76 }
  const bAxis = b.rows + n * ROW_STEP
  const height = bAxis + 34
  const widthOf = (value: number, max: number) => ((C.right - C.left) * value) / max
  const rowY = (top: number, i: number) => top + i * ROW_STEP
  const marker = guess ? louderGuessMarker(guess) : null
  // The guess is drawn as soon as the first bar is drawn; a marked bar that is not drawn yet gets a dashed white stub (its length is not shown early).
  const anyShown = barShown('gw150914') || barShown('gw170817')
  const boxText = guess ? `YOUR GUESS: ${GUESS_TEXT[guess]}` : ''
  const boxW = 440

  const bar = (r: ComparisonRow, i: number, top: number, value: number, max: number) => {
    const y = rowY(top, i)
    const w = widthOf(value, max)
    return (
      <g key={r.id}>
        <text x={C.labelX} y={y + 13} fill={r.id === 'custom' ? YOURS_COLOR : TEXT_COLOR} fontSize="11" fontWeight={r.id === 'custom' ? 'bold' : 'normal'}>
          {r.name}
        </text>
        <rect x={C.left} y={y} width={w} height={BAR_HEIGHT} fill={r.color} rx={2} />
        <text x={C.left + w + 10} y={y + 13} fill={r.id === 'custom' ? YOURS_COLOR : TEXT_COLOR} fontSize="11" fontWeight="bold">
          {value.toFixed(3)}
        </text>
      </g>
    )
  }

  const markerRowIndex = marker === 'gw150914' ? 0 : marker === 'gw170817' ? 1 : -1
  // The white guess mark: a thick white outline round the chosen bar and a white triangle pointing at its row.
  const outline = (top: number, i: number, value: number, max: number) => {
    const drawn = barShown(i === 0 ? 'gw150914' : 'gw170817')
    return (
      <rect
        x={C.left - 5}
        y={rowY(top, i) - 5}
        width={drawn ? widthOf(value, max) + 10 : 50}
        height={BAR_HEIGHT + 10}
        fill="none"
        stroke={GUESS_COLOR}
        strokeWidth={4}
        strokeDasharray={drawn ? undefined : '6 4'}
        rx={4}
      />
    )
  }
  const pointer = (top: number, i: number) => {
    const cy = rowY(top, i) + BAR_HEIGHT / 2
    return <polygon points={`${C.left - 28},${cy - 9} ${C.left - 28},${cy + 9} ${C.left - 12},${cy}`} fill={GUESS_COLOR} />
  }

  return (
    <svg width={C.width} height={height} viewBox={`0 0 ${C.width} ${height}`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={a.title - 8} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Panel A: how loud the wave is at the final moment
      </text>
      <line x1={C.left} y1={a.rows - 6} x2={C.left} y2={aAxis} stroke={MUTED_COLOR} />
      {rows.map((r, i) => (!barShown(r.id) || (r.id === 'custom' && !yourMass) ? null : bar(r, i, a.rows, r.summary.finalLoudness, LOUDNESS_MAX)))}
      <line x1={C.left} y1={aAxis} x2={C.right} y2={aAxis} stroke={MUTED_COLOR} />
      <text x={C.left} y={aAxis + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">0</text>
      <text x={C.right} y={aAxis + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="end">{LOUDNESS_MAX.toFixed(2)} (the loudest mass on the slider)</text>
      {/* white: the learner's guess, drawn once the first bar is drawn; a marker for the event chosen only. Big on purpose (the owner could not see a thin mark). */}
      {anyShown && guess && (
        <g>
          {marker !== 'both' && (
            <>
              {/* A straight line up the left edge to the pointer: no bar or number sits there, even when the pink row is drawn. */}
              <line
                x1={C.left - 20}
                y1={boxY}
                x2={C.left - 20}
                y2={rowY(a.rows, markerRowIndex) + BAR_HEIGHT / 2 + 9}
                stroke={GUESS_COLOR}
                strokeWidth={3}
              />
              {outline(a.rows, markerRowIndex, marker === 'gw150914' ? blackHoles.finalLoudness : neutronStars.finalLoudness, LOUDNESS_MAX)}
              {pointer(a.rows, markerRowIndex)}
            </>
          )}
          {marker === 'both' && (
            <>
              {outline(a.rows, 0, blackHoles.finalLoudness, LOUDNESS_MAX)}
              {outline(a.rows, 1, neutronStars.finalLoudness, LOUDNESS_MAX)}
              {pointer(a.rows, 0)}
              {pointer(a.rows, 1)}
              <path d={`M ${C.right + 26} ${rowY(a.rows, 0) - 2} H ${C.right + 36} V ${rowY(a.rows, 1) + BAR_HEIGHT + 2} H ${C.right + 26}`} fill="none" stroke={GUESS_COLOR} strokeWidth={6} />
              <text x={C.right + 41} y={(rowY(a.rows, 0) + rowY(a.rows, 1) + BAR_HEIGHT) / 2 + 8} fill={GUESS_COLOR} fontSize="24" fontWeight="bold">=</text>
              <path d={`M ${C.labelX + boxW} ${boxY + 16} H ${C.right + 46} V ${rowY(a.rows, 1) + BAR_HEIGHT + 2} H ${C.right + 36}`} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
            </>
          )}
          <rect x={C.labelX} y={boxY} width={boxW} height={32} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
          <text x={C.labelX + 10} y={boxY + 21} fill={GUESS_COLOR} fontSize="14" fontWeight="bold">
            {boxText}
          </text>
        </g>
      )}
      <text x={14} y={b.title} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Panel B: how long the run lasts (time units)
      </text>
      <line x1={C.left} y1={b.rows - 6} x2={C.left} y2={bAxis} stroke={MUTED_COLOR} />
      {rows.map((r, i) => (!barShown(r.id) || (r.id === 'custom' && !yourMass) ? null : bar(r, i, b.rows, r.summary.runTime, RUNTIME_MAX)))}
      {anyShown && guess && marker !== 'both' && (
        <g>
          {outline(b.rows, markerRowIndex, marker === 'gw150914' ? blackHoles.runTime : neutronStars.runTime, RUNTIME_MAX)}
          {pointer(b.rows, markerRowIndex)}
        </g>
      )}
      {anyShown && guess && marker === 'both' && (
        <g>
          {outline(b.rows, 0, blackHoles.runTime, RUNTIME_MAX)}
          {outline(b.rows, 1, neutronStars.runTime, RUNTIME_MAX)}
          {pointer(b.rows, 0)}
          {pointer(b.rows, 1)}
        </g>
      )}
      <line x1={C.left} y1={bAxis} x2={C.right} y2={bAxis} stroke={MUTED_COLOR} />
      <text x={C.left} y={bAxis + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">0</text>
      <text x={C.right} y={bAxis + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="end">{RUNTIME_MAX.toFixed(2)} (the lightest mass on the slider)</text>
      {!bothDone && !(shown && (shown.gw150914 || shown.gw170817)) && (
        <text x={C.width / 2} y={a.rows + 40} fill={TEXT_COLOR} fontSize="14" textAnchor="middle">
          Run the two events to fill this in.
        </text>
      )}
    </svg>
  )
}

// ---- Captions (CLAUDE.md §14, "Animated Diagrams") ----
function ArmsCaption({ name, kind, summary, done, pink }: { name: string; kind: SourceKind; summary: EventRunSummary; done: boolean; pink: boolean }) {
  const half = Math.abs(summary.finalStrain) / 2
  const eventName = kind === 'gw150914' ? 'GW150914' : kind === 'gw170817' ? 'GW170817' : 'your mass'
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong> It shows a small gravitational-wave detector, seen from above, drawn the way a real one is
        built: two arms at a right angle, meeting at a corner. It plays the run you just pressed. The arms are driven by the wave from the
        two spiralling objects, the same chirp as in &ldquo;The Chirp&rdquo; and &ldquo;Where the Energy Comes From&rdquo;.
      </p>
      <ul style={bulletList}>
        <li><strong>Corner:</strong> where the two arms meet.</li>
        <li>
          <strong>Arm X</strong> is the violet horizontal arm and <strong>Arm Y</strong> is the cyan vertical arm. At the end of each is a
          free-floating mass: a mass with nothing pushing or pulling it, so it only moves if space itself changes. A longer arm means space
          between the corner and that mass has stretched; a shorter arm means it has been squeezed.
        </li>
        <li>
          <strong>The wavy line on each arm</strong> pictures the wave on that arm: it is bigger when the strain is bigger.
        </li>
        <li>
          <strong>The glow around the arms</strong> shows how strongly the arms are being stretched and squeezed right now: a stronger glow means a bigger strain.
        </li>
        <li>
          <strong>The two dots in the middle, &ldquo;the source&rdquo;,</strong> are the pair that makes the wave. Dark dots with an amber glow are
          black holes; pale dots with a cyan glow are neutron stars; violet dots are a pair of your own mass. They spin faster and move together
          as the run goes on. They are drawn to match the numbers, not as a separate simulation.
        </li>
        <li>
          <strong>The numbers under the picture</strong> change live: frequency, amplitude, strain, the two arm lengths and the orbital energy.
          Every length is a fraction of the rest length, so 1.000 means exactly the rest length.
        </li>
        {pink && (
          <li>No pink marks are drawn on this picture. Pink always means your own choice; the pink marks for your mass are on Drawing B below. Here, your mass shows up as how far the dots move and for how long the run lasts.</li>
        )}
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong> Before a run nothing moves and the arms lie at their rest length (strain 0.000). While a run
        plays, which takes 8 seconds on your screen whatever the event, the arms stretch and squeeze and the numbers change. When it has
        finished, the dots are where the wave left them at the final moment: not necessarily back at the rest length, because the run ends
        part-way through a swing.
      </p>
      {done && (
        <>
          <p style={paragraph}>
            <strong>A worked moment ({eventName}, mass {summary.mass.toFixed(1)}).</strong> At the final moment the strain is {fixed3(summary.finalStrain)}. Each arm
            moves by half the strain, {fixed3(half)}, so Arm X is 1 + ({fixed3(summary.finalStrain)} ÷ 2) = {fixed3(summary.finalArmXLength)} and Arm Y is 1 − (
            {fixed3(summary.finalStrain)} ÷ 2) = {fixed3(summary.finalArmYLength)}. The readout under the picture shows these same numbers.
          </p>
          <LookFor
            items={[
              {
                look: 'the two arm dots while the run plays.',
                means: `one arm is longer than its rest length exactly when the other is shorter. At the final moment Arm X is ${fixed3(summary.finalArmXLength)} and Arm Y is ${fixed3(summary.finalArmYLength)}.`,
                matters: 'a detector works by comparing its two arms, so what counts is how the two lengths change together, not either length alone.',
              },
              {
                look: 'the frequency and amplitude in the numbers under the picture, from the start of the run to the end.',
                means: `the frequency goes from ${fixed3(summary.startPitch)} to ${fixed3(summary.finalPitch)} and the amplitude from ${fixed3(summary.startLoudness)} to ${fixed3(summary.finalLoudness)}.`,
                matters: 'these are the wave’s pitch and loudness. The comparison picture below puts the two events’ numbers next to each other.',
              },
            ]}
          />
        </>
      )}
    </div>
  )
}

function ComparisonCaption({ name, done, pink, yourMass, guess }: { name: string; done: boolean; pink: boolean; yourMass: EventRunSummary | null; guess: LouderChoice | null }) {
  const { blackHoles: bh, neutronStars: ns, ratios } = eventComparison()
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong> It shows the two events you ran, next to each other, so that you can compare them at a glance.
        {pink && ' It also shows the mass you chose, in pink.'}
      </p>
      <ul style={bulletList}>
        <li>
          <strong>Panel A</strong> is how loud the wave is at the final moment (its amplitude). <strong>Panel B</strong> is how long the run lasts, in
          time units, up to the final moment. Each panel has its own scale, set by the extremes of the slider (shown at the right end of its
          bottom line), so a bar&rsquo;s length means something only inside its own panel: do not compare a loudness bar with a time bar.
        </li>
        <li>
          <strong>The amber bars</strong> are GW150914, the two black holes. <strong>The pale cyan bars</strong> are GW170817, the two neutron stars. They
          are not the arms&rsquo; colours. A longer bar means a bigger number; the number is written at the end of each bar.
        </li>
        {pink && (
          <li>
            <strong>The pink bars and the pink label YOUR MASS</strong> are your own mass. The label follows the slider; the pink bars are drawn when you
            press Run your mass.
          </li>
        )}
        <li>
          <strong>The white box, the thick white outline round a bar and the white triangle beside its name</strong> are your guess, drawn only to show which event
          you chose (for &ldquo;the same&rdquo; both bars are outlined and a white bracket with an equals sign joins them). They do not say how much louder you
          expect, and they never change a bar. The white outline and triangle in Panel B repeat your choice on the matching row, because the question was
          about &ldquo;louder, faster-rising&rdquo;.
        </li>
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong> Nothing is drawn until the first run has finished. Your white guess appears with the first run, and each event&rsquo;s bars appear as soon as its run has finished. If the event you
        marked has not run yet, the white outline is dashed and has no bar inside it. When the second event has finished, both events are drawn and the outline closes round its bar.{pink && ' After you press Run your mass, the pink bars appear too.'}
      </p>
      {done && (
        <>
          <p style={paragraph}>
            <strong>A worked moment.</strong> GW150914&rsquo;s final loudness is {fixed3(bh.finalLoudness)} and GW170817&rsquo;s is {fixed3(ns.finalLoudness)}: {fixed3(bh.finalLoudness)} ÷{' '}
            {fixed3(ns.finalLoudness)} = {ratios.finalLoudness.toFixed(1)}, so about {Math.round(ratios.finalLoudness)} times as large. GW150914&rsquo;s run lasts {fixed3(bh.runTime)} and
            GW170817&rsquo;s {fixed3(ns.runTime)}: {fixed3(ns.runTime)} ÷ {fixed3(bh.runTime)} = {ratios.runTime.toFixed(1)}, so GW170817&rsquo;s run lasts about {Math.round(ratios.runTime)} times as long.
            {yourMass && ` Your mass of ${yourMass.mass.toFixed(1)} has a final loudness of ${fixed3(yourMass.finalLoudness)} and a run of ${fixed3(yourMass.runTime)}.`}
          </p>
          <LookFor
            items={[
              {
                look: 'the two bars in Panel A.',
                means: `GW150914’s is ${fixed3(bh.finalLoudness)} and GW170817’s is ${fixed3(ns.finalLoudness)}, so the first is about ${Math.round(ratios.finalLoudness)} times as long.`,
                matters: 'this is the loudness the question asked about, drawn so you can see how big the difference is, not only which way it goes.',
              },
              ...(guess
                ? [
                    {
                      look: 'the white mark and box beside the bars.',
                      means: 'your guess, as a marker for the event you chose. Does it sit against the longer bar?',
                      matters: 'it lets you check your own idea against the real bars before the tutor talks about it. It does not say whether you were right; the tutor does that.',
                    },
                  ]
                : []),
              {
                look: 'the two bars in Panel B.',
                means: `GW150914’s run is ${fixed3(bh.runTime)} and GW170817’s is ${fixed3(ns.runTime)}; the pitch climbs from ${fixed3(bh.startPitch)} to ${fixed3(bh.finalPitch)} in both, but one event takes far less time to do it.`,
                matters: 'this is the “faster-rising” half of the question. How much the two are connected is what the tutor asks.',
              },
              {
                look: 'the two events’ pitch numbers in Picture 1’s readout (1.000 to 3.162 in both runs).',
                means: 'the climb from the start pitch to the final pitch is the same size for the two events.',
                matters: 'the difference between the events is not how far the pitch climbs, but how fast.',
              },
            ]}
          />
        </>
      )}
    </div>
  )
}

export function GravitationalWaveRealEventsExperiment({ onComplete, onTutorComplete }: GravitationalWaveRealEventsExperimentProps) {
  const [mass, setMass] = useState(PART2_MASS_DEFAULT)
  const [runMass, setRunMass] = useState(PART2_MASS_DEFAULT)
  const [done, setDone] = useState<Record<EventId, boolean>>({ gw150914: false, gw170817: false })
  const [part1Kind, setPart1Kind] = useState<EventId | null>(null)
  const [prediction, setPrediction] = useState<LouderChoice | null>(null)
  const [submitted, setSubmitted] = useState<LouderChoice | null>(null)

  // One Run plays both events, one after the other (GW150914, then GW170817), so the learner presses Run once.
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const finishPart1 = () => {
    if (!part1Kind) return
    setDone({ ...done, [part1Kind]: true })
    if (part1Kind === 'gw150914') {
      nextTimer.current = setTimeout(() => {
        setPart1Kind('gw170817')
        part1.start(eventPresetSummary('gw170817').runTime)
      }, 800)
    } else onComplete?.()
  }
  const part1 = useRunner(finishPart1)
  const part2 = useRunner()

  const hasPrediction = prediction !== null
  const locked = submitted !== null
  const part1Running = part1.status === 'running' || (part1.status === 'complete' && part1Kind === 'gw150914' && !done.gw170817)
  const part2Running = part2.status === 'running'
  const bothDone = done.gw150914 && done.gw170817
  const anyDone = done.gw150914 || done.gw170817
  const part1Started = part1.status !== 'idle'
  const part1Complete = part1.status === 'complete'
  const ranHere = part2.status !== 'idle' && runMass === mass
  const part2Done = part2.status === 'complete' && runMass === mass

  const presetMass = (id: EventId) => REAL_EVENT_PRESETS.find((p) => p.id === id)!.toyMass
  const shownEvent: EventId = part1Started && part1Kind ? part1Kind : 'gw150914'
  const part1Mass = presetMass(shownEvent)
  const part1Summary = useMemo(() => eventRunSummary(part1Mass), [part1Mass])
  const part2Summary = useMemo(() => eventRunSummary(mass), [mass])
  const comparison = useMemo(() => eventComparison(), [])

  const handleRunPart1 = () => {
    if (!hasPrediction || part1Running || part2Running) return
    if (!locked) setSubmitted(prediction)
    part2.reset()
    setPart1Kind('gw150914')
    part1.start(eventPresetSummary('gw150914').runTime)
  }

  const handleRunPart2 = () => {
    if (part2Running || part1Running) return
    setRunMass(mass)
    part2.start(part2Summary.runTime)
  }

  // Start over: clears the guess, both runs, Part 2 and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setDone({ gw150914: false, gw170817: false })
    setPart1Kind(null)
    if (nextTimer.current) clearTimeout(nextTimer.current)
    setSubmitted(null)
    setPrediction(null)
    setMass(PART2_MASS_DEFAULT)
    setRunMass(PART2_MASS_DEFAULT)
  }

  const guessLabel = (choice: LouderChoice) => ({ 'black-holes': 'the black holes', 'neutron-stars': 'the neutron stars', same: 'the two would be the same' })[choice]
  const bhFacts = REAL_EVENT_FACTS.gw150914
  const nsFacts = REAL_EVENT_FACTS.gw170817
  const ratio = (value: number) => `${value.toFixed(1)} times as much`
  // Part 3 appears after the first run; a number for an event that has not been run yet is not shown (CLAUDE.md §12).
  const bhVal = (value: string) => (done.gw150914 ? value : 'not run yet')
  const nsVal = (value: string) => (done.gw170817 ? value : 'not run yet')
  const cmpVal = (value: string) => (bothDone ? value : 'run both to compare')
  const lockedFact = (id: EventId, text: string) => (done[id] ? text : 'shown once you have run this event')

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 4 — Comparing Two Real Events</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> The last two experiments, &ldquo;The Chirp&rdquo; and &ldquo;Where the Energy Comes From&rdquo;, built a toy model of two objects
            spiralling together: a wave whose pitch and loudness build, and the orbital energy the pair loses. You steered it with a
            made-up mass slider. But real detections come from real, named events, whose masses scientists have measured. What does the same
            model look like when it is set up for two of them, side by side? And does putting two real events next to each other show something
            the slider alone did not?
          </p>
          <p style={paragraph}>
            <strong>What are black holes and neutron stars?</strong> A big star, many times heavier than our Sun, shines because it burns fuel. When the
            fuel runs out the star collapses under its own weight and blows apart in a <strong>supernova</strong>. What is left behind can be one of two
            things. If the core that is left can be squeezed only so far, the collapse stops at a <strong>neutron star</strong>: a ball of crushed matter
            about as wide as a city (about 20 kilometres), so dense that a teaspoon of it would weigh as much as Mount Everest (NASA). What stops the
            collapse is that the tiny particles it is made of push back against being squeezed any closer, much as the atoms in a solid wall push
            back when you lean on it, only far more strongly. If the core that is left is too big for that push-back to hold, nothing known can
            stop the collapse and it ends as a <strong>black hole</strong>: a region so small and so dense that not even light can escape it. A black hole
            with the mass of our Sun would be only about 6 kilometres across (NASA gives its radius as about 3 kilometres).
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> You will see the same chirp as in the last two experiments, but set up for two real, named events:{' '}
            <strong>GW150914</strong> (2015, the first gravitational wave ever detected, from two merging black holes) and <strong>GW170817</strong> (2017, from
            two colliding neutron stars). You run each one and then see both together on one picture. Afterwards you can choose a mass
            of your own.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> In Part 1, predict which event made the louder, faster-rising chirp, then press Run once to watch both
            events. In Part 2, choose a mass of your own and see where it falls between them. Then the tutor will ask you what you saw.
          </p>
          <p style={paragraph}>
            <strong>A new term: multi-messenger astronomy.</strong> GW170817 was not detected only as a gravitational wave: telescopes around the world also saw
            light from the same collision. Watching one event in more than one way, here with gravitational waves and with light, is called{' '}
            <strong>multi-messenger astronomy</strong>. (A &ldquo;messenger&rdquo; is anything that carries news of an event to us: light is one, gravitational waves are
            another.) Whether the other event also had light is part of what you will compare.
          </p>
          <p style={paragraph}>
            <strong>Your prediction and the real pictures.</strong> Your prediction never changes the real pictures, the tables or the numbers: the arms, the
            bars and the tables come from a calculation that knows nothing about what you guessed. Your guess is drawn on Picture 2 in white, in a
            box labelled YOUR GUESS, and listed again beside the results. In Part 2, the mass slider does change the drawings; the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning: neutron star, black hole, supernova,
            solar mass, gravitational wave, chirp, pitch, loudness, strain, orbital energy, radiated energy, final moment, toy mass, light counterpart,
            gamma-ray burst, kilonova, multi-messenger astronomy, LIGO, Virgo, GW150914 and GW170817.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything &ldquo;The Chirp&rdquo; and &ldquo;Where the Energy Comes From&rdquo; assumed still applies here: the effect is hugely exaggerated, only one wave
              pattern is shown, no real detection hardware is modeled, the merger itself isn&rsquo;t modeled, and the chirp and energy formulas are simplified
              stand-ins, not the real equations.
            </li>
            <li>
              The two events are a simplified stand-in for GW150914 and GW170817, not a faithful reconstruction of either real signal. Only a rough
              direction is kept.
            </li>
            <li>
              The mapping from each event&rsquo;s real mass onto this project&rsquo;s made-up mass scale is a presentation choice, not a physical calculation.
            </li>
            <li>
              The light seen for GW170817 is a real, independently-reported fact, not something this experiment&rsquo;s physics model computes.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(bothDone)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages and the original scientific papers are listed here. Checked on 7 November 2026. Each link
            opens in a new tab.
          </p>
          {LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <p style={{ margin: '0.5rem 0 0.25rem', fontWeight: 'bold' }}>{group.heading}</p>
              <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p style={{ ...smallNote, marginTop: '0.5rem' }}>
            No plain page from an official source was found for &ldquo;multi-messenger astronomy&rdquo; itself, so this page explains it in its own words and links
            LIGO&rsquo;s technical summary. Nor was one found for the push-back that stops a neutron star collapsing, so this page describes it in everyday words.
          </p>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you predict which of the two real events made the louder, faster-rising chirp. Then you press Run once and watch each
          event&rsquo;s wave pass through the arms, one after the other. Picture 2 puts them side by side, and your guess is drawn on it in white as soon as the first event has finished.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            GW150914 came from two merging black holes. GW170817 came from two colliding neutron stars. Which one do you think produced the
            louder, faster-rising chirp?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {louderChoices.map((choice) => (
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
              ? `Your prediction: ${louderChoices.find((c) => c.value === (prediction ?? submitted))!.label}`
              : 'Choose an option to continue'}
            {locked && ' Your prediction is locked while you try other masses. To change it, press Start over.'}
          </p>
        </div>

        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Press Run once. It plays GW150914 (the black holes) first and then GW170817 (the neutron stars) straight after, so you do not need to press anything twice.
        </p>
        <button
          type="button"
          className="action-button"
          onClick={handleRunPart1}
          disabled={!hasPrediction || part1Running || part2Running}
          style={{ padding: '0.6rem 1.5rem', marginRight: '0.75rem', marginBottom: '0.5rem' }}
        >
          {part1Running ? 'Running...' : bothDone ? 'Run again' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={!(hasPrediction || part1Started || anyDone) || part1Running || part2Running}
          className="secondary-button"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer', backgroundColor: 'rgba(124, 58, 237, 0.22)', marginBottom: '0.5rem' }}
        >
          Start over
        </button>
        {!hasPrediction && <p style={smallNote}>Answer the prediction above to press Run.</p>}
        
        {(anyDone || part1Started) && (
          <div style={{ marginTop: '0.75rem' }}>
            {REAL_EVENT_PRESETS.filter((preset) => done[preset.id] || (part1Started && part1Kind === preset.id)).map((preset) => (
              <p key={preset.id} style={{ ...smallNote, marginTop: '0.25rem' }}>
                <strong>{preset.label}.</strong> {preset.realDescription}
              </p>
            ))}
          </div>
        )}

        <Block>
          <EventArms
            mass={part1Mass}
            time={part1Started ? part1.time : 0}
            started={part1Started}
            kind={shownEvent}
            label="The two detector arms seen from above. Arm X is violet and Arm Y is cyan. The pair of objects that makes the wave is drawn in the middle."
          />
          <Readout mass={part1Mass} time={part1.time} started={part1Started} hideBeforeStart />
          <ArmsCaption name="Picture 1" kind={shownEvent} summary={part1Summary} done={part1Complete && part1Kind !== null} pink={false} />
          <WhereFrom
            measured={<>the real masses and distances in the card above (LIGO and Virgo).</>}
            calculated={bothDone ? <>the arm lengths, from the simplified formula this page uses to stand in for a real inspiral, with a made-up mass of {presetMass('gw150914').toFixed(1)} for GW150914 and {presetMass('gw170817').toFixed(1)} for GW170817.</> : 'the arm lengths, from the simplified formula this page uses to stand in for a real inspiral, with a made-up mass for each event (the numbers are shown once both events have run).'}
            imagined={<>those two made-up masses are a choice made for this page (the real masses are in solar masses; the page&rsquo;s scale is not), and the size of the effect is hugely exaggerated so that you can see it.</>}
          />
        </Block>

        <Block>
          <ComparisonPicture
            bothDone={bothDone}
            shown={done}
            guess={submitted}
            yourMass={null}
            label="Two panels comparing the two events: how loud the wave is at the final moment, and how long the run lasts. Your guess is drawn in white in a box marked YOUR GUESS."
          />
          {!bothDone && (
            <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>
              {!anyDone
                ? 'Press Run to draw the bars. Your white guess appears with the first event.'
                : 'GW150914 is drawn. GW170817 is playing now and its bars will be drawn as soon as it finishes. A dashed white outline marks a bar that is not drawn yet.'}
            </p>
          )}
          {bothDone && (
            <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem' }}>
              GW150914: amplitude {fixed3(comparison.blackHoles.finalLoudness)}, run {fixed3(comparison.blackHoles.runTime)} &nbsp;|&nbsp; GW170817: amplitude{' '}
              {fixed3(comparison.neutronStars.finalLoudness)}, run {fixed3(comparison.neutronStars.runTime)}
            </p>
          )}
          <ComparisonCaption name="Picture 2" done={bothDone} pink={false} yourMass={null} guess={submitted} />
          <WhereFrom
            measured="nothing in this picture is a measurement."
            calculated={bothDone ? `the bars, from the same simplified formula as Picture 1, at made-up masses of ${presetMass('gw150914').toFixed(1)} and ${presetMass('gw170817').toFixed(1)}.` : 'the bars, from the same simplified formula as Picture 1, at a made-up mass for each event.'}
            guess="the white mark and box are your guess, drawn only as a marker. They are not part of the calculation."
            imagined="those two masses, which stand in for the real events."
          />
        </Block>

        {/* ===== Part 2 ===== */}
        {anyDone && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a mass of your own, from very light to very heavy, and run it. The slider changes the drawings in this Part, marked in
              pink. It does not change Part 1&rsquo;s pictures, the tables in Part 3, or your guess.
            </PartHeader>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>What you are changing.</strong> The mass of the pair of objects that circle each other. The scale is made up, from 0.2 (a very light pair)
                to 6 (a very heavy pair). Nothing else changes: the same simplified formulas are used for every mass, so any difference you see comes from
                the mass.
              </p>
              <p style={paragraph}>
                <strong>What to try.</strong> Run a mass close to GW170817&rsquo;s (try 0.3), then one close to GW150914&rsquo;s (try 5.5), and then something in between.
                Watch where the pink row falls between the two bars in Drawing B.
              </p>
              <p style={paragraph}>
                <strong>The pink marks.</strong> Pink always means your own choice. Drawing B&rsquo;s pink row (a pink bar in each panel, labelled YOUR MASS) follows the
                slider: its length is your mass&rsquo;s loudness and run time. The pink bars are drawn when you press Run your mass.
              </p>
              <p style={paragraph}>
                <strong>Your guess.</strong> White always means your guess. It is drawn again on Drawing B, beside the real bars, so you can compare. It never changes a bar.
              </p>
              <p style={{ ...smallNote, marginBottom: '0.75rem' }}>
                Your guess does not change these drawings or the tables in Part 3, but this slider does change the drawings below.
              </p>
            </div>

            <label htmlFor="real-events-mass" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Mass: {mass.toFixed(1)}
            </label>
            <input
              id="real-events-mass"
              type="range"
              min={0.2}
              max={6}
              step={0.1}
              value={mass}
              disabled={part1Running || part2Running}
              onChange={(event) => setMass(Number(event.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>0.2 (very light)</span>
              <span>6 (very heavy)</span>
            </div>
            <p style={{ fontSize: '0.875rem', margin: '0.75rem 0' }}>
              At mass {mass.toFixed(1)} the run lasts <strong>{fixed3(part2Summary.runTime)}</strong> time units.
            </p>
            <button type="button" className="action-button" onClick={handleRunPart2} disabled={part1Running || part2Running} style={{ padding: '0.6rem 1.5rem' }}>
              {part2Running ? 'Running...' : 'Run your mass'}
            </button>

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Drawing A: your arms</p>
            <EventArms
              mass={mass}
              time={ranHere ? part2.time : 0}
              started={ranHere}
              kind="custom"
              label="Drawing A: the two detector arms seen from above, driven by a pair of your mass."
            />
            <Readout mass={mass} time={part2.time} started={ranHere} />
            <ArmsCaption name="Drawing A" kind="custom" summary={part2Summary} done={part2Done} pink />
            <WhereFrom
              measured="nothing in this picture is a measurement."
              calculated={<>the arm lengths, from the simplified formula this page uses to stand in for a real inspiral, with a made-up mass of {mass.toFixed(1)}.</>}
              imagined={<>the pair itself and its mass of {mass.toFixed(1)}, on this page&rsquo;s made-up mass scale (your own choice, a trial value that does not say a real system is like that). The size of the effect is also hugely exaggerated, so that you can see it.</>}
            />

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Drawing B: the two events and your mass</p>
            <ComparisonPicture
              bothDone={bothDone}
              shown={done}
              guess={submitted}
              yourMass={part2Done ? part2Summary : null}
              label="Drawing B: the two events side by side, with a pink row for your mass. Your guess is drawn in white in a box marked YOUR GUESS."
            />
            {!part2Done && (
              <p style={{ ...smallNote, marginTop: '0.5rem' }}>
                <span style={{ color: YOURS_COLOR, fontWeight: 'bold' }}>YOUR MASS: {mass.toFixed(1)}</span> — move the slider and press Run your mass to draw the pink bars.
              </p>
            )}
            <ComparisonCaption name="Drawing B" done={bothDone} pink yourMass={part2Done ? part2Summary : null} guess={submitted} />
            <WhereFrom
              measured="nothing in this picture is a measurement."
              calculated={<>the bars, from the same simplified formula as Picture 1, at made-up masses of 5.5 and 0.3 and at your mass of {mass.toFixed(1)}.</>}
              guess="the white mark and box are your guess, drawn only as a marker. They are not part of the calculation."
              imagined={<>those two masses, which stand in for the real events, and your own (in pink, a trial value that does not say the real system is like that).</>}
            />
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>These are trial values for the pictures. They do not say the real system is like that.</p>
          </>
        )}

        {/* ===== Part 3 ===== */}
        {anyDone && submitted && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the two Part 1 runs, with your guess listed beside them, and the facts about the two real events. Nothing in this
              Part changes with your guess or with the mass slider in Part 2.
            </PartHeader>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Your guess, beside the results</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 0, marginBottom: '0.5rem' }}>
              Your guess is shown here as you made it, with the place where its number appears. It is not marked here, and it never changes a picture or a
              table. The tutor marks it, in Part 4.
            </p>
            <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <li>
                <strong>Your guess:</strong> {guessLabel(submitted)}. The question was which event made the louder, faster-rising chirp. Its numbers are in Table 1, rows
                &ldquo;Final loudness&rdquo; and &ldquo;Time to reach the final pitch&rdquo;, and in Picture 2&rsquo;s white mark.
              </li>
            </ul>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>How to read these results.</strong> A table of numbers is hard to read until someone says what it is. Table 1 puts the two Part 1 runs side by side,
                one row for each thing the chirp has: how loud it gets, how long it takes, how much energy is given out. The numbers are in this page&rsquo;s made-up
                units, so what matters is how they compare with each other. Table 2 gives facts about the real events; those are not results of this page&rsquo;s calculation.
              </p>
              <p style={paragraph}>
                <strong>Why there is no check-up table.</strong> A check-up sets a result beside a real reference. The toy model does not calculate the real masses or distances,
                and no real signal was reproduced, so a check-up would only repeat the numbers in Table 2. The real figures are given under Table 2 as facts.
              </p>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Table 1: the two runs (toy masses {comparison.blackHoles.mass.toFixed(1)} and {comparison.neutronStars.mass.toFixed(1)})</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'GW150914 (black holes)', 'GW170817 (neutron stars)', 'How they compare']}
              minWidth={620}
              rows={[
                ['Toy mass (made-up scale)', bhVal(comparison.blackHoles.mass.toFixed(1)), nsVal(comparison.neutronStars.mass.toFixed(1)), cmpVal(`${ratio(comparison.ratios.mass)} (GW150914)`)],
                [
                  <>
                    Final loudness (amplitude at the final moment)
                    <GuessTag />
                  </>,
                  bhVal(fixed3(comparison.blackHoles.finalLoudness)),
                  nsVal(fixed3(comparison.neutronStars.finalLoudness)),
                  cmpVal(`${ratio(comparison.ratios.finalLoudness)} (GW150914)`),
                ],
                [
                  <>
                    Time to reach the final pitch (the run&rsquo;s length)
                    <GuessTag />
                  </>,
                  bhVal(fixed3(comparison.blackHoles.runTime)),
                  nsVal(fixed3(comparison.neutronStars.runTime)),
                  cmpVal(`${comparison.ratios.runTime.toFixed(1)} times as long (GW170817)`),
                ],
                ['Final pitch (frequency)', bhVal(fixed3(comparison.blackHoles.finalPitch)), nsVal(fixed3(comparison.neutronStars.finalPitch)), cmpVal('the same')],
                ['Swings in the run', bhVal(comparison.blackHoles.swings.toFixed(2)), nsVal(comparison.neutronStars.swings.toFixed(1)), cmpVal('fewer (GW150914)')],
                ['Orbital energy at the start', bhVal(fixed3(comparison.blackHoles.startEnergy)), nsVal(fixed3(comparison.neutronStars.startEnergy)), cmpVal(`${ratio(comparison.ratios.startEnergy)} (GW150914)`)],
                ['Orbital energy left at the final moment', bhVal(fixed3(comparison.blackHoles.finalEnergyLeft)), nsVal(fixed3(comparison.neutronStars.finalEnergyLeft)), cmpVal(`${ratio(comparison.ratios.finalEnergyLeft)} (GW150914)`)],
                ['Energy radiated by the final moment', bhVal(fixed3(comparison.blackHoles.finalEnergyRadiated)), nsVal(fixed3(comparison.neutronStars.finalEnergyRadiated)), cmpVal(`${ratio(comparison.ratios.finalEnergyRadiated)} (GW150914)`)],
              ]}
            />
            <p style={{ ...smallNote, margin: '0.5rem 0 0.5rem' }}>The tag shows which rows relate to your guess. It does not say whether the guess matched.</p>
            <p style={{ ...smallNote, margin: '0 0 1rem' }}>
              <strong>Where Table 1&rsquo;s numbers come from.</strong> Nothing in Table 1 is a measurement. Every number is calculated on this page, from the same simplified chirp and energy
              formulas as the last two experiments, at a made-up mass for each event. The real events are described in{' '}
              <ExternalLink href="https://arxiv.org/abs/1602.03837">the GW150914 paper</ExternalLink> and <ExternalLink href="https://arxiv.org/abs/1710.05832">the GW170817 paper</ExternalLink>; for plain
              pages see <ExternalLink href="https://www.ligo.caltech.edu/page/press-release-gw150914">LIGO&rsquo;s GW150914 release</ExternalLink> and{' '}
              <ExternalLink href="https://www.ligo.caltech.edu/page/press-release-gw170817">LIGO&rsquo;s GW170817 release</ExternalLink>.
            </p>

            {bothDone ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Final loudness.</strong> <em>What it is:</em> how strongly the wave acts on the arms at the final moment. <em>What it means:</em> it is{' '}
                  {fixed3(comparison.blackHoles.finalLoudness)} for GW150914 and {fixed3(comparison.neutronStars.finalLoudness)} for GW170817: about{' '}
                  {Math.round(comparison.ratios.finalLoudness)} times as large. A daily-life comparison: a shout and a whisper from the same distance.{' '}
                  <em>Why it matters:</em> it is the half of your question about &ldquo;louder&rdquo;.
                </li>
                <li>
                  <strong>Time to reach the final pitch.</strong> <em>What it is:</em> how long each run lasts before the final moment. <em>What it means:</em> it is{' '}
                  {fixed3(comparison.blackHoles.runTime)} and {fixed3(comparison.neutronStars.runTime)}: GW170817&rsquo;s run is about {Math.round(comparison.ratios.runTime)} times as long.{' '}
                  <em>Why it matters:</em> it is the half of your question about &ldquo;faster-rising&rdquo;: both runs climb the same way in pitch, from {fixed3(comparison.blackHoles.startPitch)} to{' '}
                  {fixed3(comparison.blackHoles.finalPitch)}, but one does it in far less time.
                </li>
                <li>
                  <strong>Final pitch.</strong> <em>What it is:</em> the pitch at the final moment. <em>What it means:</em> it is {fixed3(comparison.blackHoles.finalPitch)} for both, so the two events end at
                  the same pitch. <em>Why it matters:</em> it shows that what differs is how big and how quick the chirp is, not where its pitch ends up.
                </li>
                <li>
                  <strong>The energy rows.</strong> <em>What they are:</em> the orbital energy at the start, left at the final moment and radiated. <em>What they mean:</em> left plus radiated is the starting
                  energy: {fixed3(comparison.blackHoles.finalEnergyLeft)} + {fixed3(comparison.blackHoles.finalEnergyRadiated)} = {fixed3(comparison.blackHoles.startEnergy)} and{' '}
                  {fixed3(comparison.neutronStars.finalEnergyLeft)} + {fixed3(comparison.neutronStars.finalEnergyRadiated)} = {fixed3(comparison.neutronStars.startEnergy)}. A tenth is left at the final
                  moment in both. <em>Why it matters:</em> the pair that starts with more has more to give out, but the same share is gone in both.
                </li>
                <li>
                  <strong>How sure the numbers are.</strong> These come from a simplified stand-in formula at two made-up masses, not from the real signals. They show a rough direction, not the real size
                  of any difference between the events. In particular, the factor of {comparison.ratios.mass.toFixed(1)} is the ratio of the two made-up masses, {comparison.blackHoles.mass.toFixed(1)} ÷{' '}
                  {comparison.neutronStars.mass.toFixed(1)}, and is not a measurement.
                </li>
              </ul>
            </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                <strong>What this table tells us.</strong> Table 1 fills in as each event finishes, and the notes that explain it appear once both events have finished.
              </p>
            )}

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Table 2: the two real events (facts, not results of this page)</strong>
            </p>
            <ResultsTable
              head={['', 'GW150914', 'GW170817']}
              minWidth={560}
              rows={[
                ['Date', bhFacts.date, nsFacts.date],
                [
                  'What merged',
                  lockedFact('gw150914', `two black holes, about ${bhFacts.blackHoleSolarMasses[0]} and ${bhFacts.blackHoleSolarMasses[1]} Suns, into one of about ${bhFacts.finalSolarMass} Suns`),
                  lockedFact('gw170817', `two neutron stars, combined mass about ${nsFacts.totalSolarMass.toFixed(1)} Suns (each between about ${nsFacts.eachSolarMassRange[0].toFixed(1)} and ${nsFacts.eachSolarMassRange[1].toFixed(1)} Suns)`),
                ],
                [
                  'Distance',
                  lockedFact('gw150914', `about ${bhFacts.distanceMegaparsecs} megaparsecs, ${bhFacts.distanceLightYearsText} light-years`),
                  lockedFact('gw170817', `about ${nsFacts.distanceMegaparsecs} megaparsecs, ${nsFacts.distanceLightYearsText} light-years`),
                ],
                [
                  'Energy sent out as gravitational waves',
                  lockedFact('gw150914', `about ${bhFacts.radiatedSolarMasses.toFixed(0)} Suns\u2019 worth of mass`),
                  lockedFact('gw170817', 'not given in the sources read for this page'),
                ],
                [
                  'Light seen',
                  lockedFact('gw150914', `not expected for merging black holes. NASA\u2019s Fermi telescope reported a faint, weak flash of high-energy light about ${FERMI_GW150914_REPORT.delaySeconds} seconds after the wave, but it was never confirmed (see the note below)`),
                  lockedFact('gw170817', `a burst of gamma rays about ${nsFacts.gammaRayDelaySeconds} seconds after the wave, then visible light, X-rays and radio over days and weeks, from the galaxy ${nsFacts.hostGalaxy}`),
                ],
              ]}
            />
            {bothDone && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '1rem 0 1.5rem' }}>
              <p style={paragraph}>
                <strong>Why the light matters.</strong> <em>What it is:</em> GW170817 was also seen in light. <em>What it means:</em> the light let telescopes find the galaxy within about half a day,
                and astronomers learned the burst came about {nsFacts.gammaRayDelaySeconds} seconds after the wave. <em>Why it matters:</em> seeing one event two ways is multi-messenger astronomy
                and tells us more than either way alone. Why neutron stars give light and black holes are not expected to is for the tutor.
              </p>
              <p style={paragraph}>
                <strong>GW150914 and light.</strong> Merging black holes were not expected to give off light, because any gas orbiting them should be cleared away before they merge (NASA). Even
                so, NASA&rsquo;s Fermi telescope reported a faint, short flash of high-energy light about {FERMI_GW150914_REPORT.delaySeconds} seconds after GW150914. The chance that a flash like it
                would turn up that close to the merger by accident was put at about 2 in 1,000. Another gamma-ray detector, INTEGRAL, saw nothing, and one team that re-analysed Fermi&rsquo;s data
                concluded it was probably a chance fluctuation; Fermi&rsquo;s team disagrees. It has never been confirmed. So this page says GW150914 had no confirmed light, not that none was seen.
              </p>
              <p style={paragraph}>
                <strong>How sure the numbers are.</strong> The masses and distances come with margins (for example the distance to GW150914 is about 410 megaparsecs with a 90 percent credible
                range of roughly 230 to 570), and the light-year figures are the sources&rsquo; own roundings.
              </p>
            </div>
            )}
              <p style={{ ...smallNote, margin: '0.75rem 0 0' }}>
                <strong>Where Table 2&rsquo;s figures come from.</strong> The masses, distances and the 1.7 seconds are from the papers&rsquo; abstracts:{' '}
                <ExternalLink href="https://arxiv.org/abs/1602.03837">GW150914</ExternalLink>, <ExternalLink href="https://arxiv.org/abs/1710.05832">GW170817</ExternalLink> and{' '}
                <ExternalLink href="https://arxiv.org/abs/1710.05833">the light seen from GW170817</ExternalLink>. The light-year figures are from LIGO&rsquo;s and NASA&rsquo;s pages listed above. The
                Fermi report is from <ExternalLink href="https://arxiv.org/abs/1602.03920">Connaughton et al.</ExternalLink> and{' '}
                <ExternalLink href="https://www.nasa.gov/universe/nasas-fermi-telescope-poised-to-pin-down-gravitational-wave-sources/">NASA</ExternalLink>.
              </p>
          </>
        )}
      </div>

      {/* ===== Part 4 ===== */}
      {anyDone && submitted && (
        <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            Talk through what you saw. The tutor points to your white guess mark, then explains.
          </PartHeader>
          <GravitationalWaveRealEventsTutor key={submitted} louderPrediction={submitted} matched={louderGuessMatches(submitted)} bothDone={bothDone} onExplained={onTutorComplete} />
        </div>
      )}
    </div>
  )
}
