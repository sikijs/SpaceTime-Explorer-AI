import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BASE_ARM_LENGTH } from '../physics/gravitationalWaveExperiment'
import { BASE_AMPLITUDE, BASE_FREQUENCY, chirpRunFor, chirpStateAt } from '../physics/gravitationalWaveChirpExperiment'
import { REAL_EVENT_PRESETS } from '../physics/gravitationalWaveRealEventsExperiment'
import {
  FAR_DISTANCE_MPC,
  NEARBY_DISTANCE_MPC,
  PUBLISHED_HUBBLE,
  REAL_EVENT_DISTANCES_MPC,
  SIREN_PART1_DISTANCE_MPC,
  SIREN_PART1_EVENT,
  STORY_DISTANCES_MPC,
  displayedStrain,
  distanceKnowGuessMarker,
  distanceKnowGuessMatches,
  hubbleVersusPublished,
  nearFarGuessMarker,
  nearFarGuessMatches,
  publishedBestHubble,
  sameDetectedStories,
  sirenRunSummary,
  yourChoiceComparison,
} from '../physics/standardSirenExperiment'
import type { DistanceKnowChoice, EventId, NearFarChoice, SirenRunSummary } from '../physics/standardSirenExperiment'
import { GravitationalWaveStandardSirenTutor } from './GravitationalWaveStandardSirenTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'

// Gravitational Waves, Experiment 7, audited to the newer rules (docs/audit/gravitational-waves/07-draft-wording.md): the page in four
// Parts, one Run at a fixed GW170817 at 40 Mpc, a picture with three panels (the source and the arms; detected amplitude at three
// distances; one detected amplitude, three possible sources), the white YOUR GUESS marks for both predictions, pink marks for the
// learner's own event and distance in Part 2, a caption section for each panel, a reading guide for the results, a links list, a words
// box, a "Start over" button and a tutor that marks both guesses. Every number drawn or shown comes from the physics module
// (src/physics/standardSirenExperiment.ts; CLAUDE.md §9). The wording is the owner's, approved on 2026-11-07 as drafted,
// "approve with defaults" (CLAUDE.md §28.1).

interface GravitationalWaveStandardSirenExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const
const captionBox = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' } as const
const bulletList = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const
const f1 = (value: number) => value.toFixed(1)
// Amplitudes span several orders of magnitude: plain decimals above 0.01, scientific notation below.
const amp = (value: number) => (value >= 0.01 ? value.toFixed(4) : value.toExponential(3))
const mpc = (value: number) => (Number.isInteger(value) ? value.toLocaleString('en-US') : f1(value))

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const REFERENCE_COLOR = '#f59e0b' // amber: a fixed reference
const RUN_COLOR = '#a5f3fc' // pale cyan: the run
const SOURCE_COLOR = '#fbbf24'
const ANIMATION_DURATION_MS = 3500 // fixed playback (CLAUDE.md §11)
const MIN_CUSTOM_DISTANCE_MPC = 1
const MAX_CUSTOM_DISTANCE_MPC = 2000

type DistanceMode = 'real' | 'nearby' | 'far' | 'custom'

const nearFarChoices: Array<{ value: NearFarChoice; label: string }> = [
  { value: 'nearby-louder', label: 'The nearby one' },
  { value: 'far-louder', label: 'The far one' },
  { value: 'same', label: 'No difference' },
]
const distanceKnowChoices: Array<{ value: DistanceKnowChoice; label: string }> = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]
const NEAR_FAR_BOX: Record<NearFarChoice, string> = {
  'nearby-louder': 'the nearby one looks stronger',
  'far-louder': 'the far one looks stronger',
  same: 'no difference between nearby and far',
}
const DISTANCE_KNOW_BOX: Record<DistanceKnowChoice, string> = {
  yes: 'yes, the detected amplitude alone is enough',
  no: 'no, the detected amplitude alone is not enough',
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages and papers fetched and read by a helper on 7 November 2026 (see the audit's draft wording, section 9).
const LINK_GROUPS: Array<{ heading: string; links: Array<{ href: string; label: string; what: string }> }> = [
  {
    heading: 'The Hubble constant, distances and standard candles',
    links: [
      {
        href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/',
        label: 'NASA Science: "Hubble Constant and Tension"',
        what: 'the Hubble constant relates a galaxy’s distance to how fast it is moving away; astronomers use "standard candles", objects of known brightness such as Cepheids and Type Ia supernovae, and build a distance ladder from them. It does not mention gravitational waves.',
      },
      {
        href: 'https://www.esa.int/media/measurements-of-the-hubble-constant',
        label: 'ESA: "Measurements of the Hubble constant"',
        what: 'what the Hubble constant is and its units, kilometres per second for every million parsecs of separation.',
      },
      {
        href: 'https://science.nasa.gov/solar-system/cosmic-distances/',
        label: 'NASA Science: "Cosmic Distances"',
        what: 'a parsec is 3.26 light-years and a megaparsec is a million parsecs, the unit for distances between galaxies.',
      },
    ],
  },
  {
    heading: 'The gravitational-wave measurement',
    links: [
      {
        href: 'http://www.ligo.org/science-summaries/GW170817Hubble/',
        label: 'LIGO Scientific Collaboration: "Measuring the expansion of the Universe with gravitational waves"',
        what: 'the gravitational-wave "standard siren" as the counterpart of a standard candle; the distance to NGC 4993 is about 44 Mpc; the Hubble constant "peaks at" 70 km/s/Mpc; the distance and the tilt of the orbit are linked. Technical, with explanatory parts.',
      },
      {
        href: 'http://ligo.org/science-summaries/GW170817BNS/',
        label: 'LIGO Scientific Collaboration: "GW170817: Observation of gravitational waves from a binary neutron star inspiral"',
        what: 'about 40 Mpc (130 million light-years) and the chirp in accessible language.',
      },
    ],
  },
  {
    heading: 'The original papers',
    links: [
      {
        href: 'https://arxiv.org/abs/1710.05835',
        label: '"A gravitational-wave standard siren measurement of the Hubble constant" (Nature, 2017)',
        what: 'H0 = 70.0 +12.0/-8.0 km/s/Mpc (the most probable value and the narrowest 68.3% interval, 62 to 82); the best distance, 43.8 Mpc, and the host galaxy’s Hubble-flow velocity, 3,017 ± 166 km/s. Technical.',
      },
      {
        href: 'https://arxiv.org/abs/1710.05832',
        label: '"GW170817: Observation of Gravitational Waves from a Binary Neutron Star Inspiral"',
        what: 'the abstract gives a distance of 40 (+8, -14) Mpc. Technical.',
      },
    ],
  },
]

// The "Words and formulas" box. The two definitions and the formulas give the answer to Prediction 2, so they appear only after the
// Part 1 run (CLAUDE.md §12).
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const run = sirenRunSummary(SIREN_PART1_EVENT, SIREN_PART1_DISTANCE_MPC)
  const entries = [
    { term: 'Amplitude', meaning: 'how strong the wave is at one moment: the biggest strain it reaches.' },
    { term: 'Strain', meaning: 'a plain number saying how strongly the wave is acting on space at one instant.' },
    { term: 'True amplitude', meaning: 'how strong the wave is at the source.' },
    { term: 'Detected amplitude', meaning: 'how strong the wave is when it reaches the detector.' },
    { term: 'Megaparsec (Mpc)', meaning: 'a distance unit for galaxies: about 3.3 million light-years.' },
    { term: 'Recession velocity', meaning: 'how fast a galaxy is moving away from us, measured from its light.' },
    { term: 'Hubble constant', meaning: 'how fast the universe is expanding: kilometres per second for every Mpc of distance (km/s/Mpc).' },
    { term: 'Host galaxy', meaning: 'the galaxy the event happened in.' },
    { term: 'Light counterpart', meaning: 'light from the same event as a gravitational wave.' },
    {
      term: 'Compression',
      meaning: 'drawing a very wide range of sizes so that small ones stay visible. Here the arms use a square root, so a wave 100 times weaker is drawn only about 10 times less stretched.',
    },
  ]
  if (afterRun) {
    entries.push(
      { term: 'Standard candle', meaning: 'an object whose true brightness is known, so how dim it looks tells you how far away it is.' },
      { term: 'Standard siren', meaning: 'the gravitational-wave version: a wave whose true amplitude is known from its chirp, so how weak it is on arrival tells you the distance.' },
      {
        term: 'Formula: detected amplitude',
        meaning: `the true amplitude ÷ the distance. Example: ${amp(run.trueAmplitude)} ÷ ${run.distanceMpc} = ${amp(run.detectedAmplitude)}.`,
      },
      {
        term: 'Formula: distance',
        meaning: `the true amplitude ÷ the detected amplitude. Example: ${amp(run.trueAmplitude)} ÷ ${amp(run.detectedAmplitude)} = ${f1(run.recoveredDistanceMpc)} Mpc.`,
      },
      {
        term: 'Formula: the Hubble constant',
        meaning: `the recession velocity ÷ the distance. Example: ${run.recessionVelocityKmPerS?.toLocaleString('en-US')} ÷ ${f1(run.recoveredDistanceMpc)} = ${f1(run.hubbleConstant ?? 0)} km/s/Mpc.`,
      },
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
          <em>Your guesses:</em> {guess}{' '}
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

function GuessTag({ n }: { n: 1 | 2 }) {
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
      guess {n}
    </span>
  )
}

// ---- A timed run (0 to 1) ----
type RunStatus = 'idle' | 'running' | 'complete'

function useTimedRun(durationMs: number, onFinish?: () => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [progress, setProgress] = useState(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running') return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      const p = Math.min(Math.max((now - startTime) / durationMs, 0), 1)
      setProgress(p)
      if (p >= 1) {
        setStatus('complete')
        finishRef.current?.()
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, durationMs])

  const start = () => {
    setProgress(0)
    setStatus('running')
  }
  const reset = () => {
    setStatus('idle')
    setProgress(0)
  }
  return { status, progress, start, reset }
}

// ---- Panel A: the source and the detector's arms ----
const WIDTH = 580
const MAP = 320
const MAP_X = 130 // the arms' drawing sits in the middle of the wider canvas
const A_TOP = 30
const A_HEIGHT = A_TOP + MAP + 12
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180

function armEndPoint(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x' ? { x: CORNER.x + pixels, y: CORNER.y } : { x: CORNER.x, y: CORNER.y - pixels }
}

function massOf(eventId: EventId) {
  return REAL_EVENT_PRESETS.find((preset) => preset.id === eventId)!.toyMass
}

// What the source and the arms look like at `progress` (0 to 1) of the run, for an event at a distance.
function sirenStateAt(eventId: EventId, distanceMpc: number, progress: number, started: boolean) {
  const mass = massOf(eventId)
  const { cutoffTime } = chirpRunFor(mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const time = started ? Math.min(progress * cutoffTime, cutoffTime) : 0
  const chirp = chirpStateAt(time, mass, BASE_FREQUENCY, BASE_AMPLITUDE)
  const trueAmplitude = chirp.amplitude
  return { time, cutoffTime, chirp, trueAmplitude, detected: trueAmplitude / distanceMpc }
}

function PanelA({
  eventId,
  distanceMpc,
  progress,
  started,
  top,
  pinkTag,
}: {
  eventId: EventId
  distanceMpc: number
  progress: number
  started: boolean
  top: number
  pinkTag: string | null
}) {
  const { time, cutoffTime, chirp } = sirenStateAt(eventId, distanceMpc, progress, started)
  const detectedStrain = displayedStrain(chirp.strain, distanceMpc)
  const armX = BASE_ARM_LENGTH * (1 + detectedStrain / 2)
  const armY = BASE_ARM_LENGTH * (1 - detectedStrain / 2)
  const xEnd = armEndPoint('x', armX)
  const yEnd = armEndPoint('y', armY)
  const magnitude = Math.abs(detectedStrain)
  const trueStrainMagnitude = Math.abs(chirp.strain)
  const armStrokeWidth = started ? Math.min(11, 2 + magnitude * 22) : 1.5
  const pulseRadius = started ? Math.min(15, 4 + magnitude * 26) : 4
  const armGlowOpacity = started ? Math.min(0.85, magnitude * 1.8) : 0
  const armGlowBlur = 2 + magnitude * 10

  // The source: the merging pair, pulsing with the TRUE strain (unaffected by distance), reusing the illustrative orbiting pair of the
  // real-events experiment. The orbit follows the chirp's own frequency and shrinks to overlap at the final moment.
  const sourceCenter = { x: 150, y: 170 }
  const fraction = cutoffTime > 0 ? Math.min(1, time / cutoffTime) : 0
  const orbitRadius = started ? Math.max(0, 30 - fraction * 30) : 30
  const orbitAngle = 2 * Math.PI * chirp.frequency * time
  const dot1 = { x: sourceCenter.x + orbitRadius * Math.cos(orbitAngle), y: sourceCenter.y + orbitRadius * Math.sin(orbitAngle) }
  const dot2 = { x: sourceCenter.x - orbitRadius * Math.cos(orbitAngle), y: sourceCenter.y - orbitRadius * Math.sin(orbitAngle) }
  const sourceGlowOpacity = started ? Math.min(0.65, 0.15 + trueStrainMagnitude * 3) : 0.25

  return (
    <g>
      <text x={14} y={top + 20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Panel A: the source and the detector&rsquo;s arms
      </text>
      <g transform={`translate(${MAP_X}, ${top + A_TOP})`}>
        <defs>
          <filter id="standard-siren-arm-glow" x="-75%" y="-75%" width="250%" height="250%">
            <feGaussianBlur stdDeviation={armGlowBlur} />
          </filter>
        </defs>
        <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke="#a78bfa" strokeWidth={armStrokeWidth + 7} strokeLinecap="round" opacity={armGlowOpacity} filter="url(#standard-siren-arm-glow)" />
        <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke="#22d3ee" strokeWidth={armStrokeWidth + 7} strokeLinecap="round" opacity={armGlowOpacity} filter="url(#standard-siren-arm-glow)" />
        <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke="#c4b5fd" strokeWidth={armStrokeWidth} strokeLinecap="round" />
        <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke="#67e8f9" strokeWidth={armStrokeWidth} strokeLinecap="round" />
        <circle cx={CORNER.x} cy={CORNER.y} r={pulseRadius} fill="#f5f3ff" opacity={started ? 0.9 : 0.6} />
        <circle cx={xEnd.x} cy={xEnd.y} r={5} fill="#c4b5fd" />
        <circle cx={yEnd.x} cy={yEnd.y} r={5} fill="#67e8f9" />
        <text x={(CORNER.x + xEnd.x) / 2} y={CORNER.y + 18} fill="#c4b5fd" fontSize="11" textAnchor="middle">
          Arm X (detected)
        </text>
        <text x={CORNER.x - 10} y={(CORNER.y + yEnd.y) / 2} fill="#67e8f9" fontSize="11" textAnchor="middle" transform={`rotate(-90, ${CORNER.x - 10}, ${(CORNER.y + yEnd.y) / 2})`}>
          Arm Y (detected)
        </text>

        <line x1={dot1.x} y1={dot1.y} x2={dot2.x} y2={dot2.y} stroke={SOURCE_COLOR} strokeWidth={1} opacity={0.5} />
        <circle cx={dot1.x} cy={dot1.y} r={10 + trueStrainMagnitude * 40} fill={SOURCE_COLOR} opacity={sourceGlowOpacity} />
        <circle cx={dot2.x} cy={dot2.y} r={10 + trueStrainMagnitude * 40} fill={SOURCE_COLOR} opacity={sourceGlowOpacity} />
        <circle cx={dot1.x} cy={dot1.y} r={7} fill="#fde68a" />
        <circle cx={dot2.x} cy={dot2.y} r={7} fill="#fde68a" />
        <text x={sourceCenter.x} y={sourceCenter.y - 44} fill={SOURCE_COLOR} fontSize="10" textAnchor="middle">
          the source (true amplitude)
        </text>
        {pinkTag && (
          <text x={0} y={16} fill={YOURS_COLOR} fontSize="12" fontWeight="bold">
            {pinkTag}
          </text>
        )}
      </g>
    </g>
  )
}

// ---- Panels B and C: bars ----
const BAR = { labelX: 12, left: 250, right: 500, valueX: 508 }
const ROW_STEP = 34
const BAR_HEIGHT = 18

function barsHeight(rows: number) {
  return 44 + rows * ROW_STEP + 30 + 32 + 20
}

interface BarRow {
  label: string
  value: number
  color: string
  pink: boolean
  opacity: number
  note?: string
}

function Bars({ top, rows, scaleMax, drawn, note }: { top: number; rows: BarRow[]; scaleMax: number; drawn: boolean; note: string }) {
  const rowsTop = top + 44
  const axisY = rowsTop + rows.length * ROW_STEP
  const widthOf = (value: number) => ((BAR.right - BAR.left) * value) / scaleMax
  return (
    <g>
      <line x1={BAR.left} y1={rowsTop - 6} x2={BAR.left} y2={axisY} stroke={MUTED_COLOR} />
      {drawn &&
        rows.map((row, i) => {
          const y = rowsTop + i * ROW_STEP
          return (
            <g key={row.label}>
              <text x={BAR.labelX} y={y + 13} fill={row.pink ? YOURS_COLOR : TEXT_COLOR} fontSize="11" fontWeight={row.pink ? 'bold' : 'normal'}>
                {row.label}
              </text>
              <rect x={BAR.left} y={y} width={Math.max(widthOf(row.value), 0.5)} height={BAR_HEIGHT} fill={row.color} opacity={row.opacity} rx={2} />
              <text x={BAR.valueX} y={y + 13} fill={row.pink ? YOURS_COLOR : TEXT_COLOR} fontSize="11" fontWeight="bold">
                {amp(row.value)}
              </text>
            </g>
          )
        })}
      <line x1={BAR.left} y1={axisY} x2={BAR.right} y2={axisY} stroke={MUTED_COLOR} />
      <text x={BAR.left} y={axisY + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        0
      </text>
      <text x={BAR.right} y={axisY + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        {note}
      </text>
      {!drawn && (
        <text x={WIDTH / 2} y={rowsTop + 40} fill={TEXT_COLOR} fontSize="14" textAnchor="middle">
          Press Run: this panel is drawn when the run has finished.
        </text>
      )}
    </g>
  )
}

function PanelB({
  top,
  drawn,
  part1,
  guess,
  yours,
  yoursLabel,
}: {
  top: number
  drawn: boolean
  part1: SirenRunSummary
  guess: NearFarChoice | null
  yours: SirenRunSummary | null
  yoursLabel: string
}) {
  const rows: BarRow[] = [
    { label: `Nearby, ${NEARBY_DISTANCE_MPC} Mpc`, value: part1.detectedAtNearby, color: REFERENCE_COLOR, pink: false, opacity: 1 },
    { label: `This run, ${part1.distanceMpc} Mpc`, value: part1.detectedAmplitude, color: RUN_COLOR, pink: false, opacity: 1 },
    { label: `Far, ${mpc(FAR_DISTANCE_MPC)} Mpc`, value: part1.detectedAtFar, color: REFERENCE_COLOR, pink: false, opacity: 1 },
  ]
  if (yours) rows.push({ label: yoursLabel, value: yours.detectedAmplitude, color: YOURS_COLOR, pink: true, opacity: 1 })
  const scaleMax = Math.max(...rows.map((row) => row.value))
  const rowsTop = top + 44
  const axisY = rowsTop + rows.length * ROW_STEP
  const boxY = axisY + 30
  const widthOf = (value: number) => ((BAR.right - BAR.left) * value) / scaleMax
  const rowY = (i: number) => rowsTop + i * ROW_STEP
  const marker = guess ? nearFarGuessMarker(guess) : null
  const outline = (i: number) => (
    <rect x={BAR.left - 5} y={rowY(i) - 5} width={widthOf(rows[i].value) + 10 + 6} height={BAR_HEIGHT + 10} fill="none" stroke={GUESS_COLOR} strokeWidth={4} rx={4} />
  )
  const pointer = (i: number) => {
    const cy = rowY(i) + BAR_HEIGHT / 2
    return <polygon points={`${BAR.left - 28},${cy - 9} ${BAR.left - 28},${cy + 9} ${BAR.left - 12},${cy}`} fill={GUESS_COLOR} />
  }
  const targetRows = marker === 'nearby' ? [0] : marker === 'far' ? [2] : marker === 'both' ? [0, 2] : []
  return (
    <g>
      <text x={14} y={top + 20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Panel B: how strong the wave is on arrival, at three distances
      </text>
      <Bars top={top} rows={rows} scaleMax={scaleMax} drawn={drawn} note="the longest bar sets the scale" />
      {/* white: the learner's first guess, drawn once the bars are drawn; an outline round the bar chosen (a bracket joining both for "no difference"). Big on purpose. */}
      {drawn && guess && marker && (
        <g>
          <line x1={BAR.left - 20} y1={boxY} x2={BAR.left - 20} y2={rowY(targetRows[0]) + BAR_HEIGHT / 2 + 9} stroke={GUESS_COLOR} strokeWidth={3} />
          {targetRows.map((i) => (
            <g key={i}>
              {outline(i)}
              {pointer(i)}
            </g>
          ))}
          {marker === 'both' && (
            <>
              <path d={`M ${BAR.right + 42} ${rowY(0) - 2} H ${BAR.right + 52} V ${rowY(2) + BAR_HEIGHT + 2} H ${BAR.right + 42}`} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
              <text x={BAR.right + 36} y={rowY(1) + BAR_HEIGHT / 2 + 8} fill={GUESS_COLOR} fontSize="24" fontWeight="bold" textAnchor="end">
                =
              </text>
            </>
          )}
          <rect x={BAR.labelX} y={boxY} width={440} height={32} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
          <text x={BAR.labelX + 10} y={boxY + 21} fill={GUESS_COLOR} fontSize="14" fontWeight="bold">
            YOUR GUESS: {NEAR_FAR_BOX[guess]}
          </text>
        </g>
      )}
    </g>
  )
}

function PanelC({
  top,
  drawn,
  run,
  guess,
  pink,
}: {
  top: number
  drawn: boolean
  run: SirenRunSummary
  guess: DistanceKnowChoice | null
  pink: boolean
}) {
  const distances = Array.from(new Set([...STORY_DISTANCES_MPC, run.distanceMpc])).sort((a, b) => a - b)
  const stories = sameDetectedStories(run.detectedAmplitude, distances)
  const rows: BarRow[] = stories.map((story) => {
    const isRun = story.distanceMpc === run.distanceMpc
    return {
      label: isRun ? `At ${mpc(story.distanceMpc)} Mpc (${pink ? 'your choice' : 'this run'})` : `At ${mpc(story.distanceMpc)} Mpc`,
      value: story.trueAmplitude,
      color: isRun ? (pink ? YOURS_COLOR : RUN_COLOR) : REFERENCE_COLOR,
      pink: isRun && pink,
      opacity: 1,
    }
  })
  const scaleMax = Math.max(...rows.map((row) => row.value))
  const rowsTop = top + 44
  const axisY = rowsTop + rows.length * ROW_STEP
  const boxY = axisY + 30
  const marker = guess ? distanceKnowGuessMarker(guess) : null
  const bracketTop = rowsTop - 5
  const bracketBottom = axisY - 2
  return (
    <g>
      <text x={14} y={top + 20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Panel C: one detected amplitude, {rows.length} possible sources
      </text>
      <text x={14} y={top + 32} fill={MUTED_COLOR} fontSize="10">
        each bar is the true amplitude that source would need
      </text>
      <Bars top={top} rows={rows} scaleMax={scaleMax} drawn={drawn} note={drawn ? `all give a detected amplitude of ${amp(run.detectedAmplitude)}` : ''} />
      {/* white: the learner's second guess, drawn once the panel is drawn; a box that says yes or no, with no size of its own. Big on purpose. */}
      {drawn && guess && marker && (
        <g>
          <rect x={4} y={bracketTop} width={WIDTH - 8} height={bracketBottom - bracketTop} fill="none" stroke={GUESS_COLOR} strokeWidth={4} rx={6} />
          <path d={`M 12,${boxY + 16} H 4 V ${bracketBottom}`} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
          <rect x={12} y={boxY} width={440} height={32} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
          <text x={22} y={boxY + 21} fill={GUESS_COLOR} fontSize="14" fontWeight="bold">
            YOUR GUESS: {DISTANCE_KNOW_BOX[guess]}
          </text>
        </g>
      )}
    </g>
  )
}

// The picture of Part 1: Panels A, B and C in one drawing. Drawing A (Part 2) is Panel A alone, Drawing B is Panel B alone and Drawing C is
// Panel C alone.
export function SirenPicture({
  scope,
  eventId,
  distanceMpc,
  progress,
  started,
  finished,
  part1,
  nearFarGuess,
  distanceKnowGuess,
  yours,
  yoursLabel,
  label,
}: {
  scope: 'all' | 'A' | 'B' | 'C'
  eventId: EventId
  distanceMpc: number
  progress: number
  started: boolean
  finished: boolean
  part1: SirenRunSummary
  nearFarGuess: NearFarChoice | null
  distanceKnowGuess: DistanceKnowChoice | null
  yours: SirenRunSummary | null
  yoursLabel: string
  label: string
}) {
  const showA = scope === 'all' || scope === 'A'
  const showB = scope === 'all' || scope === 'B'
  const showC = scope === 'all' || scope === 'C'
  const bRows = yours ? 4 : 3
  const cRun = scope === 'C' && yours ? yours : part1
  const cRows = new Set([...STORY_DISTANCES_MPC, cRun.distanceMpc]).size
  const bTop = showA ? A_HEIGHT : 0
  const cTop = bTop + (showB ? barsHeight(bRows) : 0)
  const height = cTop + (showC ? barsHeight(cRows) : 0)
  return (
    <svg width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`} style={svgStyle} role="img" aria-label={label}>
      {showA && <PanelA eventId={eventId} distanceMpc={distanceMpc} progress={progress} started={started} top={0} pinkTag={scope === 'A' ? yoursLabel : null} />}
      {showB && <PanelB top={bTop} drawn={finished} part1={part1} guess={nearFarGuess} yours={scope === 'B' ? yours : null} yoursLabel={yoursLabel} />}
      {showC && <PanelC top={cTop} drawn={finished} run={cRun} guess={distanceKnowGuess} pink={scope === 'C'} />}
    </svg>
  )
}

// ---- Captions (CLAUDE.md §14, "Animated Diagrams") ----
// One caption per picture. When a picture has several panels (the one in Part 1), each panel is explained in its own section.
function PictureCaption({
  name,
  scope,
  finished,
  pink,
  run,
  nearFarGuess,
  distanceKnowGuess,
}: {
  name: string
  scope: 'all' | 'A' | 'B' | 'C'
  finished: boolean
  pink: boolean
  run: SirenRunSummary
  nearFarGuess: NearFarChoice | null
  distanceKnowGuess: DistanceKnowChoice | null
}) {
  const showA = scope === 'all' || scope === 'A'
  const showB = scope === 'all' || scope === 'B'
  const showC = scope === 'all' || scope === 'C'
  const heading = (text: string) => <p style={{ margin: '1rem 0 0.4rem', fontWeight: 'bold', color: 'var(--text-color, inherit)' }}>{text}</p>
  const stories = sameDetectedStories(run.detectedAmplitude)
  const eventName = REAL_EVENT_PRESETS.find((p) => p.id === run.eventId)!.label.split(' (')[0]
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong>{' '}
        {scope === 'all'
          ? 'It has three panels, one above the other. Panel A shows one real event as it plays. Panel B compares how strong the same wave would be on arrival at three distances. Panel C shows three different sources that would give the detector the same detected amplitude. Each is explained separately below.'
          : showA
            ? 'It shows one event as it plays.'
            : showB
              ? 'It compares how strong a wave is on arrival at different distances.'
              : 'It shows several sources that would give the detector the same detected amplitude.'}{' '}
        {pink && 'Pink marks your own choice.'}
      </p>

      {showA && (
        <>
          {scope === 'all' && heading('Panel A: the source and the detector’s arms')}
          <p style={paragraph}>
            <strong>What it shows.</strong> One real event ({eventName}) as it plays: the strength of the wave at the source, and the strength it reaches the detector with.
          </p>
          <ul style={bulletList}>
            <li>
              <strong>The source</strong> (the glowing, merging pair) pulses with the <strong>true</strong> strain, the strength at the source.
            </li>
            <li>
              <strong>Arm X (violet) and Arm Y (cyan)</strong> stretch and squeeze with the <strong>detected</strong> strain, the strength when the wave arrives. The two numbers under the picture are the exact amplitudes.
            </li>
            <li>
              <strong>The arms are a compressed picture.</strong> The real detected amplitude is far too small to see, so the arms&rsquo; movement is drawn with a square-root compression, the same idea as a decibel scale. A wave
              100 times weaker is drawn only about 10 times less stretched, so read the size of the arms&rsquo; movement as &ldquo;more&rdquo; or &ldquo;less&rdquo;, not as a ratio; the real ratios are in Panel B and the tables.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>What you see, and when.</strong> At the start the source and the arms are at rest. As the run plays, the source pulses and the arms stretch and squeeze, building as the chirp does over 3.5 seconds.
            {pink && ' The arms change to your event and distance when you press Run at your choice.'}
          </p>
          {finished && (
            <>
              <p style={paragraph}>
                <strong>A worked moment (Panel A).</strong> At the final moment the true amplitude is {amp(run.trueAmplitude)} and the detected amplitude at {mpc(run.distanceMpc)} Mpc is {amp(run.trueAmplitude)} ÷ {mpc(run.distanceMpc)} ={' '}
                {amp(run.detectedAmplitude)}.
              </p>
              <LookFor
                items={[
                  {
                    look: 'the source and the arms.',
                    means: `the source pulses at ${amp(run.trueAmplitude)}, while the arms move by the much smaller ${amp(run.detectedAmplitude)} (drawn compressed).`,
                    matters: 'it shows that what a detector receives is not what the source sent.',
                  },
                  {
                    look: 'the two numbers under the picture.',
                    means: `${amp(run.trueAmplitude)} and ${amp(run.detectedAmplitude)}, a ratio of ${f1(run.trueAmplitude / run.detectedAmplitude)}.`,
                    matters: 'the only difference between them is the distance the wave travelled.',
                  },
                ]}
              />
            </>
          )}
        </>
      )}

      {showB && (
        <>
          {scope === 'all' && heading('Panel B: how strong the wave is on arrival, at three distances')}
          <p style={paragraph}>
            <strong>What it shows.</strong> The same event&rsquo;s detected amplitude if it had happened at three different distances.
          </p>
          <ul style={bulletList}>
            <li>
              <strong>Each bar</strong> is the detected amplitude at that distance; a longer bar is a stronger wave on arrival. The longest bar sets the scale, so with {NEARBY_DISTANCE_MPC} Mpc as the longest the bars show the
              ratio, and the Far bar is a sliver. <strong>The amber bars</strong> are Nearby ({NEARBY_DISTANCE_MPC} Mpc) and Far ({mpc(FAR_DISTANCE_MPC)} Mpc), fixed references; <strong>the pale cyan bar</strong> is this run.
              {pink && ' The pink bar is your own choice; if it is stronger than the Nearby bar, the scale grows and the other bars get shorter.'}
            </li>
            {nearFarGuess && (
              <li>
                <strong>The white outline, box and bracket</strong> are your first guess, drawn only as a marker: they show which bar you chose (a bracket and an equals sign for &ldquo;no difference&rdquo;) and say nothing about how
                much. They never change a bar.
              </li>
            )}
          </ul>
          <p style={paragraph}>
            <strong>What you see, and when.</strong> Panel B is drawn when the run has finished; until then it shows a note.{pink && ' The pink bar appears when you press Run at your choice.'}
          </p>
          {finished && (
            <>
              <p style={paragraph}>
                <strong>A worked moment (Panel B).</strong> Detected at {NEARBY_DISTANCE_MPC} Mpc: {amp(run.trueAmplitude)} ÷ {NEARBY_DISTANCE_MPC} = {amp(run.detectedAtNearby)}. At {mpc(FAR_DISTANCE_MPC)} Mpc: {amp(run.trueAmplitude)} ÷{' '}
                {mpc(FAR_DISTANCE_MPC)} = {amp(run.detectedAtFar)}. The first is {Math.round(run.nearFarRatio)} times the second.
              </p>
              <LookFor
                items={[
                  {
                    look: 'the bars.',
                    means: `${amp(run.detectedAtNearby)}, ${amp(run.detectedAmplitude)} and ${amp(run.detectedAtFar)}, so the Far bar is ${f1(100 / run.nearFarRatio)} percent as long as the Nearby bar.`,
                    matters: 'this is the first question, drawn as a ratio.',
                  },
                  ...(nearFarGuess
                    ? [
                        {
                          look: 'the white outline on the bar you chose.',
                          means: 'your first guess, a marker for the bar you chose.',
                          matters: 'it lets you check your idea against the bars before the tutor talks about it; it does not say whether you were right.',
                        },
                      ]
                    : []),
                ]}
              />
            </>
          )}
        </>
      )}

      {showC && (
        <>
          {scope === 'all' && heading('Panel C: one detected amplitude, three possible sources')}
          <p style={paragraph}>
            <strong>What it shows.</strong> Different sources that would all give the detector the same detected amplitude as {pink ? 'your run' : 'this run'}.
          </p>
          <ul style={bulletList}>
            <li>
              <strong>Each row</strong> is a source at a different distance. <strong>Its bar</strong> is the true amplitude that source would need to give the same detected amplitude as the run; the row marked{' '}
              {pink ? '"your choice"' : '"this run"'} is the real one.
            </li>
            {distanceKnowGuess && (
              <li>
                <strong>The white outline and box</strong> are your second guess, drawn only as a marker: they say &ldquo;yes&rdquo; or &ldquo;no&rdquo; and show nothing about size. They never change a bar.
              </li>
            )}
          </ul>
          <p style={paragraph}>
            <strong>What you see, and when.</strong> Panel C is drawn when the run has finished.
          </p>
          {finished && (
            <>
              <p style={paragraph}>
                <strong>A worked moment (Panel C).</strong> To give {amp(run.detectedAmplitude)} at {mpc(stories[0].distanceMpc)} Mpc, a source needs a true amplitude of {amp(run.detectedAmplitude)} × {mpc(stories[0].distanceMpc)} ={' '}
                {amp(stories[0].trueAmplitude)}; at {mpc(stories[1].distanceMpc)} Mpc, {amp(stories[1].trueAmplitude)}; at {mpc(stories[2].distanceMpc)} Mpc, {amp(stories[2].trueAmplitude)}.
              </p>
              <LookFor
                items={[
                  {
                    look: 'the bars.',
                    means: `the true amplitudes are ${amp(stories[0].trueAmplitude)}, ${amp(stories[1].trueAmplitude)} and ${amp(stories[2].trueAmplitude)}, far apart, yet each gives the same ${amp(run.detectedAmplitude)} at the detector.`,
                    matters: 'this is the second question, shown as different sources the detector cannot tell apart by amplitude alone.',
                  },
                  ...(distanceKnowGuess
                    ? [
                        {
                          look: 'the white outline and box beside the panel.',
                          means: 'your second guess, a marker for "yes" or "no".',
                          matters: 'it lets you check your idea against the sources; it does not say whether you were right.',
                        },
                      ]
                    : []),
                ]}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}

// What the learner's own choice shows (updates with the buttons; every number from the module).
function yourChoiceParagraph(eventId: EventId, distanceMpc: number): string {
  const cmp = yourChoiceComparison(eventId, distanceMpc)
  const y = cmp.yours
  const p = cmp.part1
  const eventName = REAL_EVENT_PRESETS.find((preset) => preset.id === eventId)!.label.split(' (')[0]
  if (cmp.atPart1Choice) {
    return `Your choice is ${eventName} at ${mpc(distanceMpc)} Mpc, the same as Part 1’s, so every comparison above says "the same". Choose another event or distance and press Run at your choice again to see it change.`
  }
  const hubble =
    y.hubbleConstant === null
      ? `There is no Hubble constant for ${eventName}: it had no light counterpart and so no recession velocity (see "Comparing Two Real Events").`
      : `The Hubble constant is ${f1(y.hubbleConstant)} km/s/Mpc against ${f1(p.hubbleConstant ?? 0)}: ${cmp.words.hubbleConstant}.`
  return `${eventName} at ${mpc(distanceMpc)} Mpc: the true amplitude is ${amp(y.trueAmplitude)} against ${amp(p.trueAmplitude)} (${cmp.words.trueAmplitude}), and the detected amplitude is ${amp(y.detectedAmplitude)} against ${amp(p.detectedAmplitude)} (${cmp.words.detectedAmplitude}). The distance recovered is ${f1(y.recoveredDistanceMpc)} Mpc, the one this page used. ${hubble}`
}

export function GravitationalWaveStandardSirenExperiment({ onComplete, onTutorComplete }: GravitationalWaveStandardSirenExperimentProps) {
  const [eventId, setEventId] = useState<EventId>(SIREN_PART1_EVENT)
  const [distanceMode, setDistanceMode] = useState<DistanceMode>('real')
  const [customDistanceMpc, setCustomDistanceMpc] = useState(100)
  const [runChoice, setRunChoice] = useState<{ eventId: EventId; distanceMpc: number }>({ eventId: SIREN_PART1_EVENT, distanceMpc: SIREN_PART1_DISTANCE_MPC })
  const [ranPart1, setRanPart1] = useState(false)
  const [nearFarPrediction, setNearFarPrediction] = useState<NearFarChoice | null>(null)
  const [distanceKnowPrediction, setDistanceKnowPrediction] = useState<DistanceKnowChoice | null>(null)
  const [nearFarSubmitted, setNearFarSubmitted] = useState<NearFarChoice | null>(null)
  const [distanceKnowSubmitted, setDistanceKnowSubmitted] = useState<DistanceKnowChoice | null>(null)
  const completedOnce = useRef(false)

  const finishPart1 = () => {
    setRanPart1(true)
    if (!completedOnce.current) {
      completedOnce.current = true
      onComplete?.()
    }
  }
  const part1 = useTimedRun(ANIMATION_DURATION_MS, finishPart1)
  const part2 = useTimedRun(ANIMATION_DURATION_MS)

  const hasPrediction = nearFarPrediction !== null && distanceKnowPrediction !== null
  const locked = nearFarSubmitted !== null && distanceKnowSubmitted !== null
  const part1Running = part1.status === 'running'
  const part2Running = part2.status === 'running'
  const part1Started = part1.status !== 'idle'
  const part1Finished = part1.status === 'complete' || ranPart1

  const pickedDistance =
    distanceMode === 'real' ? REAL_EVENT_DISTANCES_MPC[eventId] : distanceMode === 'nearby' ? NEARBY_DISTANCE_MPC : distanceMode === 'far' ? FAR_DISTANCE_MPC : customDistanceMpc
  const ranHere = part2.status !== 'idle' && runChoice.eventId === eventId && runChoice.distanceMpc === pickedDistance
  const part2Done = part2.status === 'complete' && runChoice.eventId === eventId && runChoice.distanceMpc === pickedDistance

  const partOne = sirenRunSummary(SIREN_PART1_EVENT, SIREN_PART1_DISTANCE_MPC)
  const yours = sirenRunSummary(runChoice.eventId, runChoice.distanceMpc)
  const comparison = yourChoiceComparison(runChoice.eventId, runChoice.distanceMpc)
  const eventLabel = (id: EventId) => REAL_EVENT_PRESETS.find((p) => p.id === id)!.label.split(' (')[0]
  const pickedLabel = `YOUR CHOICE: ${eventLabel(eventId)} at ${mpc(pickedDistance)} Mpc`
  const ranLabel = `YOUR CHOICE: ${eventLabel(runChoice.eventId)} at ${mpc(runChoice.distanceMpc)} Mpc`

  const handleRunPart1 = () => {
    if (!hasPrediction || part1Running || part2Running) return
    if (!locked) {
      setNearFarSubmitted(nearFarPrediction)
      setDistanceKnowSubmitted(distanceKnowPrediction)
    }
    part2.reset()
    part1.start()
  }
  const handleRunPart2 = () => {
    if (part1Running || part2Running) return
    setRunChoice({ eventId, distanceMpc: pickedDistance })
    part2.start()
  }
  // Start over: clears both guesses, the runs, Part 2 and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setRanPart1(false)
    completedOnce.current = false
    setNearFarSubmitted(null)
    setDistanceKnowSubmitted(null)
    setNearFarPrediction(null)
    setDistanceKnowPrediction(null)
    setEventId(SIREN_PART1_EVENT)
    setDistanceMode('real')
    setCustomDistanceMpc(100)
    setRunChoice({ eventId: SIREN_PART1_EVENT, distanceMpc: SIREN_PART1_DISTANCE_MPC })
  }

  const nearFarLabel = (choice: NearFarChoice) => ({ 'nearby-louder': 'the nearby one', 'far-louder': 'the far one', same: 'no difference' })[choice]
  const yourVal = (value: string) => (part2Done ? value : 'not run yet')
  const yourWord = (word: string | null) => (part2Done ? (word ?? 'no value') : 'run your choice to compare')
  const p1Live = sirenStateAt(SIREN_PART1_EVENT, SIREN_PART1_DISTANCE_MPC, part1.progress, part1Started)
  const p2Live = sirenStateAt(ranHere ? runChoice.eventId : eventId, ranHere ? runChoice.distanceMpc : pickedDistance, part2.progress, ranHere)
  const hubbleReading = partOne.hubbleConstant !== null ? hubbleVersusPublished(partOne.hubbleConstant) : null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 7 — Standard Sirens</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> Can a gravitational wave, on its own, tell you how far away its source was? This is the problem astronomers faced with GW170817 (the neutron-star collision in
            &ldquo;Comparing Two Real Events&rdquo;): solving it is what let them use a gravitational wave to measure how fast the universe itself is expanding.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> You will watch a chirp from one of the real events, the same chirp as in the earlier experiments. The picture shows two things side by side: the <strong>source</strong>,
            pulsing at the strength the wave had when it left, and the detector&rsquo;s two <strong>arms</strong>, moving by the strength of the wave when it arrives. Under the picture are the numbers behind it: the{' '}
            <strong>true amplitude</strong> (how strong the wave is at the source) and the <strong>detected amplitude</strong> (how strong it is at the detector). The thing the experiment is about is a third number you
            are not given: how far away the source is.
          </p>
          <p style={paragraph}>
            <strong>A note on units.</strong> Distances are given in <strong>Mpc</strong> (megaparsecs), the unit astronomers use for distances between galaxies. One Mpc is about 3.3 million light-years; GW170817, for
            comparison, was about 40 Mpc away.
          </p>
          <p style={paragraph}>
            <strong>A new term: the Hubble constant.</strong> Pairing a source&rsquo;s distance with how fast it is moving away from us (its <strong>recession velocity</strong>, measured separately from its host
            galaxy&rsquo;s own light) gives a number describing how fast the universe is expanding: the <strong>Hubble constant</strong>. It is measured in kilometres per second for every Mpc of distance (km/s/Mpc).
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> In Part 1, make two predictions: if the same kind of merger happened once nearby and once far away, which would look stronger by the time it reached Earth; and could you work out
            the distance from the detected amplitude alone? Then press Run once and watch a real event, GW170817. In Part 2, choose another event or distance and see what changes. Then the tutor will ask you what you
            saw.
          </p>
          <p style={paragraph}>
            <strong>Your predictions and the real pictures.</strong> Your predictions never change the real pictures, the tables or the numbers: the arms, the bars and the tables come from a calculation that knows
            nothing about what you guessed. Your guesses are drawn on the picture in white, in boxes labelled YOUR GUESS, and listed again beside the results. In Part 2, the event and distance buttons do change the
            drawings; the marks they move are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning: amplitude, strain, true amplitude, detected amplitude, megaparsec (Mpc), recession
            velocity, Hubble constant, host galaxy, light counterpart, compression and, after you run, standard candle and standard siren.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>Amplitude is modelled as falling off in exact inverse proportion to distance: a toy relationship, not the precise general-relativistic formula.</li>
            <li>
              The true amplitude is read directly from the chirp&rsquo;s own shape for the chosen mass; working out a real mass purely from an observed waveform is a much harder problem this experiment assumes is already
              solved.
            </li>
            <li>
              Recession velocities are real, approximate published values for each event&rsquo;s host galaxy, not computed from this project&rsquo;s own Doppler model (the previous experiments), since in reality this number
              comes from the host galaxy&rsquo;s own light, not from the gravitational wave.
            </li>
            <li>The &ldquo;Nearby&rdquo; and &ldquo;Far&rdquo; distances (10 and 1,000 Mpc) are made-up round numbers for contrast.</li>
            <li>
              The real measurement also has to separate the distance from the tilt of the orbit (a far, face-on pair can look like a nearer, edge-on one); this page ignores the tilt (LIGO&rsquo;s summary of the
              measurement says the two are linked).
            </li>
            <li>The arms are drawn as a compressed picture, not at true scale (see the caption); the exact numbers are in the bars and the tables.</li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(part1Finished)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages and the original scientific papers are listed here. Checked on 7 November 2026. Each link opens in a new tab.
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
            No plain page from an official source was found that explains a standard siren for a beginner (the LIGO summary above is technical), nor one that states that a wave&rsquo;s strain falls in proportion to 1 ÷ the
            distance, so this page explains both in its own words and calls the falloff a toy relationship.
          </p>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you make two predictions about how a wave weakens with distance and what a detector can tell you. Then you press Run once and watch GW170817, a real event about 40 Mpc away, reach a detector. Your guesses are
          drawn on the picture in white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If the same kind of merger happened once nearby and once far away, which one would look stronger, with a bigger strain, by the time it reached Earth?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {nearFarChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setNearFarPrediction(choice.value)}
                disabled={locked}
                className={`toggle-button${nearFarPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If you only saw the detected amplitude, could you work out the distance without separately knowing how strong the wave truly was at the source?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {distanceKnowChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setDistanceKnowPrediction(choice.value)}
                disabled={locked}
                className={`toggle-button${distanceKnowPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || locked
              ? `Your predictions: ${nearFarChoices.find((c) => c.value === (nearFarPrediction ?? nearFarSubmitted))!.label}, ${distanceKnowChoices.find((c) => c.value === (distanceKnowPrediction ?? distanceKnowSubmitted))!.label}`
              : 'Answer both questions to continue'}
            {locked && ' Your predictions are locked while you try other events and distances. To change them, press Start over.'}
          </p>
        </div>

        <button
          type="button"
          className="action-button"
          onClick={handleRunPart1}
          disabled={!hasPrediction || part1Running || part2Running}
          style={{ padding: '0.6rem 1.5rem', marginRight: '0.75rem', marginBottom: '0.5rem' }}
        >
          {part1Running ? 'Running...' : part1Finished ? 'Run again' : 'Run'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={!(hasPrediction || part1Started || ranPart1) || part1Running || part2Running}
          className="secondary-button"
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', cursor: 'pointer', backgroundColor: 'rgba(124, 58, 237, 0.22)', marginBottom: '0.5rem' }}
        >
          Start over
        </button>
        {!hasPrediction && <p style={smallNote}>Answer both predictions above to press Run.</p>}

        <Block>
          <SirenPicture
            scope="all"
            eventId={SIREN_PART1_EVENT}
            distanceMpc={SIREN_PART1_DISTANCE_MPC}
            progress={part1.progress}
            started={part1Started}
            finished={part1Finished}
            part1={partOne}
            nearFarGuess={nearFarSubmitted}
            distanceKnowGuess={distanceKnowSubmitted}
            yours={null}
            yoursLabel=""
            label="The source and the detector's arms, above a bar chart of how strong the wave is on arrival at three distances, above a chart of three possible sources that give the same detected amplitude. Your guesses are drawn in white in boxes marked YOUR GUESS."
          />
          {part1Started && (
            <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              True amplitude: {amp(p1Live.trueAmplitude)} &nbsp;|&nbsp; Detected amplitude: {amp(p1Live.detected)}
            </p>
          )}
          {part1Finished && (
            <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.875rem' }}>
              Distance recovered from comparing the two: {f1(partOne.recoveredDistanceMpc)} Mpc &nbsp;|&nbsp; Estimated Hubble constant: {f1(partOne.hubbleConstant ?? 0)} km/s/Mpc
            </p>
          )}
          <PictureCaption name="the picture" scope="all" finished={part1Finished} pink={false} run={partOne} nearFarGuess={nearFarSubmitted} distanceKnowGuess={distanceKnowSubmitted} />
          <WhereFrom
            measured="nothing in this picture is a measurement (GW170817's distance of about 40 Mpc and its host galaxy's recession velocity are published; the amplitudes are not)."
            calculated="every amplitude and bar, from the chirp's own formula and a simple inverse-distance falloff, at the made-up toy mass 0.3."
            guess="the white outlines, boxes and brackets are your guesses, drawn only as markers. They are not part of the calculation."
            imagined="the Nearby and Far distances (10 and 1,000 Mpc), the two extra sources in Panel C (they stand for what the detector cannot rule out), the toy mass, the compression of the arms and the 3.5-second playback."
          />
        </Block>

        {/* ===== Part 2 ===== */}
        {part1Finished && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose an event and a distance of your own and run it. The buttons change the drawings in this Part, marked in pink. They do not change Part 1&rsquo;s picture, the tables in Part 3, or your guesses.
            </PartHeader>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>What you are changing.</strong> The event (GW170817 or GW150914) and the distance the wave travels (the event&rsquo;s own, Nearby, Far, or one you choose). Nothing else changes: the same chirp and
                the same falloff are used every time, so any difference you see comes from the event and the distance.
              </p>
              <p style={paragraph}>
                <strong>What to try.</strong> Run GW170817 at Far, then at Nearby, and watch the pink bar in Drawing B. Then run GW150914 at its own distance and see why it has no Hubble constant.
              </p>
              <p style={paragraph}>
                <strong>The pink marks.</strong> Pink always means your own choice. Drawing A is the source and the arms for your choice. Drawing B has a pink bar for your detected amplitude. Drawing C has a pink row for your
                run. The pink marks are drawn when you press Run at your choice.
              </p>
              <p style={paragraph}>
                <strong>Your guesses.</strong> White always means your guesses. Your first guess is drawn again on Drawing B and your second on Drawing C, beside the real bars, so you can compare. They never change a bar.
              </p>
              <p style={{ ...smallNote, marginBottom: '0.75rem' }}>
                Your guesses do not change these drawings or the tables in Part 3, but these buttons do change the drawings below and Table 2. While the buttons are on GW170817 at its own distance (the Part 1 run), Table 2
                says &ldquo;the same&rdquo; in every comparison; choose another event or distance to see it change.
              </p>
            </div>

            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Event:</p>
            <div style={{ marginBottom: '0.75rem' }}>
              {REAL_EVENT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setEventId(preset.id)}
                  disabled={part1Running || part2Running}
                  className={`toggle-button${eventId === preset.id ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Distance:</p>
            <div style={{ marginBottom: '0.75rem' }}>
              {(
                [
                  ['real', `The event’s own (${REAL_EVENT_DISTANCES_MPC[eventId]} Mpc)`],
                  ['nearby', `Nearby (${NEARBY_DISTANCE_MPC} Mpc)`],
                  ['far', `Far (${mpc(FAR_DISTANCE_MPC)} Mpc)`],
                  ['custom', 'Custom'],
                ] as Array<[DistanceMode, string]>
              ).map(([mode, text]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDistanceMode(mode)}
                  disabled={part1Running || part2Running}
                  className={`toggle-button${distanceMode === mode ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {text}
                </button>
              ))}
            </div>
            {distanceMode === 'custom' && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label htmlFor="standard-siren-distance" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Distance: {customDistanceMpc} Mpc
                </label>
                <input
                  id="standard-siren-distance"
                  type="range"
                  min={MIN_CUSTOM_DISTANCE_MPC}
                  max={MAX_CUSTOM_DISTANCE_MPC}
                  step={1}
                  value={customDistanceMpc}
                  disabled={part1Running || part2Running}
                  onChange={(event) => setCustomDistanceMpc(Number(event.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}
            <button type="button" className="action-button" onClick={handleRunPart2} disabled={part1Running || part2Running} style={{ padding: '0.6rem 1.5rem' }}>
              {part2Running ? 'Running...' : 'Run at your choice'}
            </button>

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Drawing A: the source and the arms for your choice</p>
            <SirenPicture
              scope="A"
              eventId={ranHere ? runChoice.eventId : eventId}
              distanceMpc={ranHere ? runChoice.distanceMpc : pickedDistance}
              progress={part2.progress}
              started={ranHere}
              finished={false}
              part1={partOne}
              nearFarGuess={null}
              distanceKnowGuess={null}
              yours={null}
              yoursLabel={ranHere ? ranLabel : pickedLabel}
              label="Drawing A: the source and the detector's arms for your event and distance."
            />
            {ranHere && (
              <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                True amplitude: {amp(p2Live.trueAmplitude)} &nbsp;|&nbsp; Detected amplitude: {amp(p2Live.detected)}
              </p>
            )}
            <PictureCaption name="Drawing A" scope="A" finished={part2Done} pink run={part2Done ? yours : sirenRunSummary(eventId, pickedDistance)} nearFarGuess={null} distanceKnowGuess={null} />
            <WhereFrom
              measured="nothing in this picture is a measurement."
              calculated={<>the source and the arms, from the chirp&rsquo;s own formula and the inverse-distance falloff, for {pickedLabel.replace('YOUR CHOICE: ', '')}.</>}
              imagined={<>the event and distance (your own choice, a trial value that does not say a real source was there), the compression of the arms and the playback speed.</>}
            />

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Drawing B: detected amplitude, Part 1 and your choice</p>
            <SirenPicture
              scope="B"
              eventId={SIREN_PART1_EVENT}
              distanceMpc={SIREN_PART1_DISTANCE_MPC}
              progress={0}
              started={false}
              finished={part1Finished}
              part1={partOne}
              nearFarGuess={nearFarSubmitted}
              distanceKnowGuess={null}
              yours={part2Done ? yours : null}
              yoursLabel={ranLabel}
              label="Drawing B: the detected amplitude at Nearby, at the Part 1 distance and at Far and, in pink, for your choice. Your first guess is drawn in white in a box marked YOUR GUESS."
            />
            {!part2Done && (
              <p style={{ ...smallNote, marginTop: '0.5rem' }}>
                <span style={{ color: YOURS_COLOR, fontWeight: 'bold' }}>{pickedLabel}</span> — choose an event and a distance and press Run at your choice to draw the pink bar.
              </p>
            )}
            <PictureCaption name="Drawing B" scope="B" finished={part1Finished} pink run={part2Done ? yours : partOne} nearFarGuess={nearFarSubmitted} distanceKnowGuess={null} />
            <WhereFrom
              measured="nothing in this picture is a measurement."
              calculated="the bars, from the chirp's formula and the inverse-distance falloff, for GW170817 at Nearby, 40 Mpc and Far and for your choice."
              guess="the white outline and box are your first guess, drawn only as a marker. They are not part of the calculation."
              imagined="Nearby and Far (made-up round numbers) and the pink bar's event and distance (a trial value)."
            />

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Drawing C: one detected amplitude, possible sources, for your choice</p>
            <SirenPicture
              scope="C"
              eventId={SIREN_PART1_EVENT}
              distanceMpc={SIREN_PART1_DISTANCE_MPC}
              progress={0}
              started={false}
              finished={part2Done}
              part1={partOne}
              nearFarGuess={null}
              distanceKnowGuess={distanceKnowSubmitted}
              yours={part2Done ? yours : null}
              yoursLabel={ranLabel}
              label="Drawing C: sources at different distances that would give the detected amplitude of your run. Your second guess is drawn in white in a box marked YOUR GUESS."
            />
            {!part2Done && <p style={{ ...smallNote, marginTop: '0.5rem' }}>Press Run at your choice to draw Drawing C.</p>}
            <PictureCaption name="Drawing C" scope="C" finished={part2Done} pink run={part2Done ? yours : partOne} nearFarGuess={null} distanceKnowGuess={distanceKnowSubmitted} />
            <WhereFrom
              measured="nothing in this picture is a measurement."
              calculated="the true amplitude each distance would need, as the detected amplitude of your run × that distance."
              guess="the white outline and box are your second guess, drawn only as a marker. They are not part of the calculation."
              imagined="the other sources, which stand for what the detector cannot rule out, and your own choice (a trial value)."
            />
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>These are trial values for the pictures. They do not say the real system is like that.</p>
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Finished && nearFarSubmitted && distanceKnowSubmitted && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guesses listed beside them, a check of the Hubble constant against the published result, and a table for the event and distance you chose. Table 1 and the
              check-up never change with your guesses or with the buttons. Table 2 follows the buttons.
            </PartHeader>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Your guesses, beside the results</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 0, marginBottom: '0.5rem' }}>
              Your guesses are shown here as you made them, with the place where each number appears. They are not marked here, and they never change a picture or a table. The tutor marks them, in Part 4.
            </p>
            <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <li>
                <strong>Your first guess:</strong> {nearFarLabel(nearFarSubmitted)} would look stronger. Its numbers are in Table 1, the &ldquo;Detected at Nearby&rdquo; and &ldquo;Detected at Far&rdquo; rows, and in Panel B&rsquo;s white
                mark.
              </li>
              <li>
                <strong>Your second guess:</strong> the distance {distanceKnowSubmitted === 'yes' ? 'could' : 'could not'} be found from the detected amplitude alone. Its numbers are in Panel C&rsquo;s sources and in the white box.
              </li>
            </ul>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>How to read these results.</strong> A table of numbers is hard to read until someone says what it is. The check-up sets the Hubble constant this page found next to the result that was published, and checks
                the distance this page recovered against the distance it started from. Table 1 gives the Part 1 run in full. Table 2 follows the event and distance you chose in Part 2, and tells you what changes when you press
                another button.
              </p>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Check-up: the Hubble constant and the distance</strong>
            </p>
            <ResultsTable
              head={['What we checked', 'Expected', 'Found', 'Reading']}
              minWidth={620}
              rows={[
                [
                  'Hubble constant (GW170817)',
                  `${f1(PUBLISHED_HUBBLE.value)} km/s/Mpc (published; 68.3% interval ${PUBLISHED_HUBBLE.low} to ${PUBLISHED_HUBBLE.high})`,
                  `${f1(partOne.hubbleConstant ?? 0)} km/s/Mpc`,
                  `${hubbleReading}: ${f1((partOne.hubbleConstant ?? 0) - PUBLISHED_HUBBLE.value)} above the published central value`,
                ],
                [
                  <>
                    Distance recovered, against the distance set
                    <GuessTag n={2} />
                  </>,
                  `${f1(partOne.distanceMpc)} Mpc (the distance this page used to make the detected amplitude)`,
                  `${f1(partOne.recoveredDistanceMpc)} Mpc`,
                  'the same: a consistency check of the formula, not a measurement',
                ],
              ]}
            />
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.75rem 0 1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The Hubble constant.</strong> <em>What it is:</em> this page&rsquo;s Hubble constant next to the published one. <em>What it means:</em> {f1(partOne.hubbleConstant ?? 0)} is{' '}
                  {f1((partOne.hubbleConstant ?? 0) - PUBLISHED_HUBBLE.value)} above the paper&rsquo;s {f1(PUBLISHED_HUBBLE.value)} and {hubbleReading} ({PUBLISHED_HUBBLE.low} to {PUBLISHED_HUBBLE.high}); the paper&rsquo;s own
                  best distance, {PUBLISHED_HUBBLE.bestDistanceMpc} Mpc, would give {f1(publishedBestHubble())} instead, and this page uses the rounded {partOne.distanceMpc} Mpc. <em>Why it matters:</em> it shows that
                  the toy number is the right size without being the real result. <em>How sure:</em> the real value has a wide range ({PUBLISHED_HUBBLE.low} to {PUBLISHED_HUBBLE.high} at 68.3%).
                </li>
                <li>
                  <strong>The distance.</strong> <em>What it is:</em> the distance recovered from the true and detected amplitudes, beside the distance the page used to make the detected amplitude. <em>What it means:</em> both
                  are {f1(partOne.distanceMpc)} Mpc, because the page made the detected amplitude from {partOne.distanceMpc} Mpc, then undoes it. <em>Why it matters:</em> it shows that the formula and its inverse agree. It is a
                  check of the method, not a measurement: in a real detection nature chooses the distance and the detector hands you only the detected amplitude.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Table 1: the Part 1 run (GW170817 at {partOne.distanceMpc} Mpc)</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value']}
              minWidth={460}
              rows={[
                ['True amplitude at the final moment', amp(partOne.trueAmplitude)],
                ['Detected amplitude', amp(partOne.detectedAmplitude)],
                [
                  <>
                    Detected amplitude if it were at Nearby ({NEARBY_DISTANCE_MPC} Mpc)
                    <GuessTag n={1} />
                  </>,
                  amp(partOne.detectedAtNearby),
                ],
                [
                  <>
                    Detected amplitude if it were at Far ({mpc(FAR_DISTANCE_MPC)} Mpc)
                    <GuessTag n={1} />
                  </>,
                  amp(partOne.detectedAtFar),
                ],
                [
                  <>
                    Distance recovered
                    <GuessTag n={2} />
                  </>,
                  `${f1(partOne.recoveredDistanceMpc)} Mpc`,
                ],
                ['Recession velocity (the host galaxy’s, corrected for local motion)', `${partOne.recessionVelocityKmPerS?.toLocaleString('en-US')} km/s`],
                ['Estimated Hubble constant', `${f1(partOne.hubbleConstant ?? 0)} km/s/Mpc`],
              ]}
            />
            <p style={{ ...smallNote, margin: '0.5rem 0 1rem' }}>The tags show which rows relate to your guesses. They do not say whether the guesses matched.</p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>True and detected amplitude.</strong> <em>What they are:</em> how strong the wave is at the source and when it arrives. <em>What they mean:</em> {amp(partOne.trueAmplitude)} and{' '}
                  {amp(partOne.detectedAmplitude)}; {amp(partOne.trueAmplitude)} ÷ {partOne.distanceMpc} = {amp(partOne.detectedAmplitude)}. <em>Why it matters:</em> the only difference between them is the distance travelled.
                </li>
                <li>
                  <strong>Nearby and Far.</strong> <em>What they are:</em> the detected amplitude the same event would have at 10 and at 1,000 Mpc. <em>What they mean:</em> {amp(partOne.detectedAtNearby)} and{' '}
                  {amp(partOne.detectedAtFar)}, a ratio of {Math.round(partOne.nearFarRatio)}. <em>Why it matters:</em> this is your first question.
                </li>
                <li>
                  <strong>The distance and the Hubble constant.</strong> <em>What they are:</em> the distance recovered by comparing the two amplitudes, and the recession velocity ÷ that distance. <em>What they mean:</em>{' '}
                  {f1(partOne.recoveredDistanceMpc)} Mpc, and {partOne.recessionVelocityKmPerS?.toLocaleString('en-US')} ÷ {f1(partOne.recoveredDistanceMpc)} = {f1(partOne.hubbleConstant ?? 0)} km/s/Mpc. The recession velocity is
                  the paper&rsquo;s own corrected figure: the velocity of the group of galaxies containing NGC 4993, 3,327 km/s, corrected by 310 km/s for the bulk flow towards the Great Attractor. <em>Why it matters:</em>{' '}
                  this is the calculation behind the 2017 measurement.
                </li>
                <li>
                  <strong>How sure the numbers are.</strong> They come from a simple model at a made-up toy mass, not from the real signal. They show the method, not the real measurement.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Table 2: your own choice (a trial value)</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Part 1', 'Your value', 'How yours compares']}
              minWidth={640}
              rows={[
                ['Event', 'GW170817', yourVal(eventLabel(runChoice.eventId)), yourWord(comparison.words.event)],
                ['Distance', `${mpc(partOne.distanceMpc)} Mpc`, yourVal(`${mpc(yours.distanceMpc)} Mpc`), yourWord(comparison.words.distance)],
                ['True amplitude', amp(partOne.trueAmplitude), yourVal(amp(yours.trueAmplitude)), yourWord(comparison.words.trueAmplitude)],
                ['Detected amplitude', amp(partOne.detectedAmplitude), yourVal(amp(yours.detectedAmplitude)), yourWord(comparison.words.detectedAmplitude)],
                ['Distance recovered', `${f1(partOne.recoveredDistanceMpc)} Mpc`, yourVal(`${f1(yours.recoveredDistanceMpc)} Mpc`), yourWord(comparison.words.recoveredDistance)],
                [
                  'Estimated Hubble constant',
                  `${f1(partOne.hubbleConstant ?? 0)} km/s/Mpc`,
                  yourVal(yours.hubbleConstant === null ? 'none: no recession velocity' : `${f1(yours.hubbleConstant)} km/s/Mpc`),
                  yourWord(comparison.words.hubbleConstant),
                ],
              ]}
            />
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.75rem 0 1.5rem' }}>
              {part2Done ? (
                <p style={paragraph}>
                  <strong>What your numbers show.</strong> {yourChoiceParagraph(runChoice.eventId, runChoice.distanceMpc)}
                </p>
              ) : (
                <p style={paragraph}>
                  <strong>What your numbers show.</strong> Table 2 fills in when you press Run at your choice in Part 2. Until then only the Part 1 column has numbers.
                </p>
              )}
              <p style={paragraph}>
                <strong>What this table tells us.</strong> <em>What it is:</em> the amplitudes, the distance and the Hubble constant for the event and distance you chose, next to Part 1. <em>What it means:</em> the last
                column says &ldquo;more&rdquo;, &ldquo;less&rdquo;, &ldquo;the same&rdquo; or, for the event, &ldquo;different&rdquo;; there is no cut-off for &ldquo;close enough&rdquo;. <em>Why it matters:</em> it shows that a farther source arrives
                weaker, and that the distance recovered always comes back as the one used, which is why this is a check of the method. The published value for each row is the same formula as the one used here, so there is no
                separate published column.
              </p>
              <p style={{ ...smallNote, marginBottom: 0 }}>These are trial values. They do not say the real system is like that.</p>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              <p style={paragraph}>
                <strong>Why not GW150914?</strong> GW150914 had no light counterpart, so no host galaxy and no recession velocity were ever measured for it. Without one it could not be used to estimate the Hubble constant the
                way GW170817 could.
              </p>
            </div>

            <div
              style={{
                marginTop: '0.75rem',
                marginBottom: '1rem',
                padding: '0.9rem 1rem',
                borderRadius: '8px',
                border: '1px solid #d97706',
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: '#b45309' }}>Important: this is an illustration, not a precise match to the real result.</p>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.875rem' }}>
                The real 2017 measurement from GW170817 gave {f1(PUBLISHED_HUBBLE.value)} (+{f1(PUBLISHED_HUBBLE.plus)}, −{f1(PUBLISHED_HUBBLE.minus)}) km/s/Mpc, so the range it allows runs from {PUBLISHED_HUBBLE.low} to{' '}
                {PUBLISHED_HUBBLE.high}. This page gives one single number from one simplified run; it demonstrates the method real astronomers used, not a faithful reproduction of their result.
              </p>
            </div>

            <p style={{ ...smallNote, marginBottom: 0 }}>
              <strong>Where these figures come from.</strong> The published Hubble constant, the best distance of {PUBLISHED_HUBBLE.bestDistanceMpc} Mpc and the velocity of {PUBLISHED_HUBBLE.velocityKmPerS.toLocaleString('en-US')} km/s are
              from the <ExternalLink href="https://arxiv.org/abs/1710.05835">Hubble-constant paper</ExternalLink>; the distance of about 40 Mpc is from the{' '}
              <ExternalLink href="https://arxiv.org/abs/1710.05832">GW170817 detection paper</ExternalLink>; the tilt-of-the-orbit point is from LIGO&rsquo;s{' '}
              <ExternalLink href="http://www.ligo.org/science-summaries/GW170817Hubble/">science summary</ExternalLink>. The tables, the bars and the check-up are calculated on this page from the formulas in the &ldquo;Words and
              formulas&rdquo; box.
            </p>
          </>
        )}
      </div>

      {/* ===== Part 4 ===== */}
      {part1Finished && nearFarSubmitted && distanceKnowSubmitted && (
        <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            Talk through what you saw. The tutor points to your white guess marks, then explains.
          </PartHeader>
          <GravitationalWaveStandardSirenTutor
            key={`${nearFarSubmitted}-${distanceKnowSubmitted}`}
            predictedNearFar={nearFarSubmitted}
            predictedDistanceKnow={distanceKnowSubmitted}
            nearFarMatched={nearFarGuessMatches(nearFarSubmitted)}
            distanceKnowMatched={distanceKnowGuessMatches(distanceKnowSubmitted)}
            onExplained={onTutorComplete}
          />
        </div>
      )}
    </div>
  )
}
