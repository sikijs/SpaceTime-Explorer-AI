import { useMemo, useRef, useState, type ReactNode } from 'react'
import { BASE_ARM_LENGTH } from '../physics/gravitationalWaveExperiment'
import { chirpStateAt } from '../physics/gravitationalWaveChirpExperiment'
import {
  REDSHIFT_BASE_AMPLITUDE,
  REDSHIFT_BASE_FREQUENCY,
  REDSHIFT_MASS,
  REDSHIFT_MAX_SPEED,
  REDSHIFT_PART1_SPEED,
  REDSHIFT_STRETCH_SCALE_MAX,
  directionGuessMarker,
  directionGuessMatches,
  dopplerFactorFor,
  magnitudeGuessMarker,
  magnitudeGuessMatches,
  redshiftRunSummary,
  yourSpeedComparison,
} from '../physics/gravitationalWaveRedshiftExperiment'
import type { DirectionChoice, MagnitudeChoice, RedshiftRunSummary } from '../physics/gravitationalWaveRedshiftExperiment'
import { GravitationalWaveRedshiftTutor } from './GravitationalWaveRedshiftTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle, useRunner } from './GravitationalWaveExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'

// Gravitational Waves, Experiment 5, audited to the newer rules (docs/audit/gravitational-waves/05-draft-wording.md): the page in
// four Parts, one Run at a fixed 0.5c, a picture with two panels (the arms and the two waves; the stretch bars), the white YOUR GUESS
// marks for both predictions, pink marks for the learner's own speed in Part 2, a full caption on every picture, a reading guide for
// the results, a links list, a words box, a "Start over" button and a tutor that points to the marks. Every number drawn or shown
// comes from the physics module (src/physics/gravitationalWaveRedshiftExperiment.ts; CLAUDE.md §9). The wording is the owner's,
// approved on 2026-11-07 as drafted, "approve with defaults" (CLAUDE.md §28.1).

interface GravitationalWaveRedshiftExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const
const captionBox = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' } as const
const bulletList = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const
const f2 = (value: number) => value.toFixed(2)
const f3 = (value: number) => value.toFixed(3)

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const EVERYDAY_COLOR = '#f59e0b' // amber: the everyday-Doppler stretch, a fixed reference
const REAL_COLOR = '#a5f3fc' // pale cyan: the real stretch
const EMITTED_COLOR = '#fde68a'
const DETECTED_COLOR = '#f5f3ff'
const SPEED_DEFAULT = 0.5

const directionChoices: Array<{ value: DirectionChoice; label: string }> = [
  { value: 'higher', label: 'Higher' },
  { value: 'lower', label: 'Lower' },
  { value: 'same', label: 'The same' },
]
const magnitudeChoices: Array<{ value: MagnitudeChoice; label: string }> = [
  { value: 'exact', label: 'Exactly that much' },
  { value: 'more', label: 'More' },
  { value: 'less', label: 'Less' },
]
const DIRECTION_BOX: Record<DirectionChoice, [string, string]> = {
  higher: ['the detected wave', 'is higher than the emitted one'],
  lower: ['the detected wave', 'is lower than the emitted one'],
  same: ['the detected wave', 'has the same pitch as the emitted one'],
}
const MAGNITUDE_BOX: Record<MagnitudeChoice, string> = {
  exact: 'exactly the everyday amount of stretch',
  more: 'more stretch than the everyday amount',
  less: 'less stretch than the everyday amount',
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// Pages and the paper fetched and read by a helper on 7 November 2026 (see the audit's draft wording, section 9).
const LINK_GROUPS: Array<{ heading: string; links: Array<{ href: string; label: string; what: string }> }> = [
  {
    heading: 'The Doppler effect and redshift',
    links: [
      {
        href: 'https://imagine.gsfc.nasa.gov/features/yba/M31_velocity/spectrum/doppler_more.html',
        label: 'NASA Goddard, Imagine the Universe: "Doppler Shift"',
        what: 'the Doppler effect for sound and light, a fire truck’s pitch rising and falling, and that light from a source moving away is shifted to a lower frequency and a longer wavelength, called redshift. It says the simple formulas hold only well below light speed.',
      },
      {
        href: 'https://imagine.gsfc.nasa.gov/features/cosmic/farthest_info.html',
        label: 'NASA Goddard, Imagine the Universe: "The Farthest Visible Reaches of Space"',
        what: 'what redshift is (light shifted to redder, longer wavelengths) and that astronomers use it to judge how far away distant galaxies are. It describes redshift as motion, so it is linked for "redshift", not for the cosmological kind.',
      },
    ],
  },
  {
    heading: 'Redshift from the expansion of space',
    links: [
      {
        href: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-cosmological-redshift/',
        label: 'NASA Science: "Hubble Cosmological Redshift"',
        what: 'that the expansion of the universe stretches light to redder wavelengths, and that this is different from redshift caused by an object moving away through space.',
      },
      {
        href: 'https://science.nasa.gov/asset/webb/what-is-cosmological-redshift/',
        label: 'NASA Science: "What Is Cosmological Redshift?"',
        what: 'a short Webb infographic: stars and galaxies keep their size while the space between them grows.',
      },
    ],
  },
  {
    heading: 'A gravitational wave is redshifted too',
    links: [
      {
        href: 'http://ligo.org/science-summaries/O3Cosmology/',
        label: 'LIGO Scientific Collaboration: "Improving measurements of the cosmic expansion with gravitational waves"',
        what: 'that the masses of black holes measured from a wave are redshifted by the expansion of the universe, so they look larger than they are, "just like the light from a receding galaxy". It does not mention GW150914. Beginner to intermediate.',
      },
    ],
  },
  {
    heading: 'The original paper',
    links: [
      {
        href: 'https://arxiv.org/abs/1602.03837',
        label: '"Observation of Gravitational Waves from a Binary Black Hole Merger"',
        what: 'GW150914 (LIGO Scientific Collaboration and Virgo Collaboration, 2016). Its abstract gives the distance, about 410 megaparsecs, "corresponding to a redshift z = 0.09". Technical; linked only for that figure.',
      },
    ],
  },
]

// The "Words and formulas" box. Worked examples take every number from the physics module (CLAUDE.md §9). The formula for the real
// factor shows that the real stretch is the larger one, so it appears only after the Part 1 run (CLAUDE.md §12).
function referenceEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const run = redshiftRunSummary(REDSHIFT_PART1_SPEED)
  const entries = [
    { term: 'Doppler effect', meaning: 'the change in pitch (or colour) of a wave that happens when its source is moving relative to whoever is detecting it, as when an ambulance siren drops in pitch once it has passed you and is driving away.' },
    { term: 'Redshift', meaning: 'a wave arriving at a lower pitch than it was sent at (for light, shifted towards red).' },
    { term: 'c', meaning: 'the speed of light. A speed of 0.5c is half the speed of light.' },
    { term: 'Receding', meaning: 'moving away.' },
    { term: 'Emitted', meaning: 'as the source sends the wave out.' },
    { term: 'Detected', meaning: 'as the detector receives the wave.' },
    { term: 'Doppler factor', meaning: 'the number you multiply the pitch the source sent by to get the pitch the detector receives. 1 means no change; less than 1 means the detector hears a lower pitch.' },
    { term: 'Stretch', meaning: '1 divided by the Doppler factor: how many times longer each wave is when it arrives than when it was sent. A stretch of 2 means each wave is twice as long.' },
    { term: 'Everyday stretch', meaning: `1 plus the speed in c: the stretch an everyday Doppler effect alone would give. At ${f2(run.speed)}c it is 1 + ${f2(run.speed)} = ${f2(run.classicalStretch)}.` },
    { term: 'Chirp', meaning: 'the wave a spiralling pair makes as it closes in: its pitch and loudness build up until the final moment.' },
    { term: 'Pitch (frequency)', meaning: 'how fast the arms swing. The higher the number, the higher the pitch.' },
    { term: 'Strain', meaning: 'a plain number saying how strongly the wave is acting on space at one instant. 0 means the wave is doing nothing at that instant; the bigger the number, positive or negative, the stronger its effect.' },
    { term: 'Cycles behind', meaning: 'how many whole waves the detected signal has completed fewer than the emitted one has, counted from the start of the run.' },
    { term: 'Time dilation', meaning: 'a moving clock ticking more slowly (see the Relativity of Time and Motion chapter).' },
    { term: 'Cosmological redshift', meaning: 'redshift caused by the expansion of space while a wave travels. It is not modelled here.' },
  ]
  if (afterRun) {
    entries.push(
      {
        term: 'Formula: the real Doppler factor',
        meaning: `the everyday factor × the time dilation factor = (1 ÷ (1 + speed)) × √(1 − speed²), which equals √((1 − speed) ÷ (1 + speed)). Example at ${f2(run.speed)}c: ${f3(run.classicalFactor)} × ${f3(run.timeDilationFactor)} = ${f3(run.realFactor)}.`,
      },
      {
        term: 'Formula: stretch',
        meaning: `1 ÷ the factor. Example: 1 ÷ ${f3(run.realFactor)} = ${f2(run.realStretch)} for the real factor, and 1 ÷ ${f3(run.classicalFactor)} = ${f2(run.classicalStretch)} for the everyday one.`,
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

// ---- The drawing: Panel A (the arms and the two waves) ----
const WIDTH = 580
const CORNER = { x: 60, y: 260 }
const REST_ARM_PIXELS = 180
const A_TOP = 30 // room for the panel title
const A_HEIGHT = A_TOP + 330

const WINDOW = redshiftRunSummary(0).observerWindow

function armEndPoint(axis: 'x' | 'y', armLength: number) {
  const pixels = REST_ARM_PIXELS * (armLength / BASE_ARM_LENGTH)
  return axis === 'x' ? { x: CORNER.x + pixels, y: CORNER.y } : { x: CORNER.x, y: CORNER.y - pixels }
}

// A purely illustrative traveling-wave pattern: the overlay on each arm uses a fixed number of cycles (it illustrates strain), and the
// two trace strips use a number of cycles proportional to each wave's own frequency, so their wavelengths can be compared by eye.
const WAVE_CYCLES_PER_ARM = 5
const WAVE_SEGMENTS = 48

function wavePoints(axis: 'x' | 'y', start: { x: number; y: number }, end: { x: number; y: number }, amplitudePixels: number, phase: number, cycles: number) {
  const points: Array<{ x: number; y: number }> = []
  for (let i = 0; i <= WAVE_SEGMENTS; i += 1) {
    const t = i / WAVE_SEGMENTS
    const baseX = start.x + (end.x - start.x) * t
    const baseY = start.y + (end.y - start.y) * t
    const offset = amplitudePixels * Math.sin(2 * Math.PI * (t * cycles - phase))
    points.push(axis === 'x' ? { x: baseX, y: baseY + offset } : { x: baseX + offset, y: baseY })
  }
  return points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
}

// What the wave looks like at observer time `time` for a source receding at `speed`. The source's own clock has advanced by the
// real factor; "emitted" is the pitch it sent at that moment, "detected" is that pitch × the factor. The Emitted beacon and trace
// pulse at the emitted pitch, so the two waves differ by exactly the Doppler factor (docs/audit/gravitational-waves/05-draft-wording.md,
// question 1, option (a)).
function waveStateAt(speed: number, time: number, started: boolean) {
  const factor = dopplerFactorFor(speed)
  const shown = started ? Math.min(time, WINDOW) : 0
  const state = chirpStateAt(shown * factor, REDSHIFT_MASS, REDSHIFT_BASE_FREQUENCY, REDSHIFT_BASE_AMPLITUDE)
  const emittedFrequency = state.frequency
  const detectedFrequency = state.frequency * factor
  const emittedPhase = state.phase / factor
  const emittedStrain = state.amplitude * Math.sin(emittedPhase)
  return {
    shown,
    state,
    emittedFrequency,
    detectedFrequency,
    emittedStrain,
    cyclesBehind: Math.max(0, (emittedPhase - state.phase) / (2 * Math.PI)),
  }
}

function PanelA({
  speed,
  time,
  started,
  top,
  guess,
  guessNote,
  pinkTag,
}: {
  speed: number
  time: number
  started: boolean
  top: number
  guess: DirectionChoice | null
  guessNote: string
  pinkTag: boolean
}) {
  const { shown, state, emittedFrequency, detectedFrequency, emittedStrain, cyclesBehind } = waveStateAt(speed, time, started)
  const xEnd = armEndPoint('x', state.armXLength)
  const yEnd = armEndPoint('y', state.armYLength)
  const strainMagnitude = Math.abs(state.strain)
  const armStrokeWidth = started ? Math.min(11, 2 + strainMagnitude * 22) : 1.5
  const pulseRadius = started ? Math.min(15, 4 + strainMagnitude * 26) : 4
  const armGlowOpacity = started ? Math.min(0.85, strainMagnitude * 7) : 0
  const detectedBeaconRadius = started ? Math.min(26, 10 + strainMagnitude * 40) : 10
  const emittedBeaconRadius = started ? Math.min(26, 10 + Math.abs(emittedStrain) * 40) : 10
  const waveAmplitudeMagnitude = started ? Math.min(14, strainMagnitude * 160) : 0
  const waveSign = state.strain < 0 ? -1 : 1
  const wavePhase = shown * detectedFrequency * 2
  const xWave = wavePoints('x', CORNER, xEnd, waveAmplitudeMagnitude * waveSign, wavePhase, WAVE_CYCLES_PER_ARM)
  const yWave = wavePoints('y', CORNER, yEnd, -waveAmplitudeMagnitude * waveSign, wavePhase, WAVE_CYCLES_PER_ARM)

  const TRACE_CYCLE_SCALE = 4
  const TRACE_SCROLL_BOOST = 10
  const TRACE_LEFT = { x: 210 }
  const TRACE_WIDTH = 104
  const TRACE_AMPLITUDE = started ? 8 : 0
  const emittedY = 108
  const detectedY = 218
  const emittedTrace = wavePoints('x', { x: TRACE_LEFT.x, y: emittedY }, { x: TRACE_LEFT.x + TRACE_WIDTH, y: emittedY }, TRACE_AMPLITUDE, shown * emittedFrequency * 2 * TRACE_SCROLL_BOOST, emittedFrequency * TRACE_CYCLE_SCALE)
  const detectedTrace = wavePoints('x', { x: TRACE_LEFT.x, y: detectedY }, { x: TRACE_LEFT.x + TRACE_WIDTH, y: detectedY }, TRACE_AMPLITUDE, shown * detectedFrequency * 2 * TRACE_SCROLL_BOOST, detectedFrequency * TRACE_CYCLE_SCALE)

  const marker = guess ? directionGuessMarker(guess) : null
  const boxLines = guess ? DIRECTION_BOX[guess] : null
  const speedText = `${speed.toFixed(2)}c`

  return (
    <g>
      <text x={14} y={top + 20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Panel A: the detector and the two waves
      </text>
      <g transform={`translate(0, ${top + A_TOP})`}>
        <defs>
          <filter id="redshift-arm-glow" x="-75%" y="-75%" width="250%" height="250%">
            <feGaussianBlur stdDeviation={2 + strainMagnitude * 6} />
          </filter>
        </defs>
        <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke="#a78bfa" strokeWidth={armStrokeWidth + 6} strokeLinecap="round" opacity={armGlowOpacity} filter="url(#redshift-arm-glow)" />
        <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke="#22d3ee" strokeWidth={armStrokeWidth + 6} strokeLinecap="round" opacity={armGlowOpacity} filter="url(#redshift-arm-glow)" />
        <line x1={CORNER.x} y1={CORNER.y} x2={xEnd.x} y2={xEnd.y} stroke="#c4b5fd" strokeWidth={armStrokeWidth} strokeLinecap="round" />
        <line x1={CORNER.x} y1={CORNER.y} x2={yEnd.x} y2={yEnd.y} stroke="#67e8f9" strokeWidth={armStrokeWidth} strokeLinecap="round" />
        <circle cx={CORNER.x} cy={CORNER.y} r={pulseRadius} fill="#f5f3ff" opacity={started ? 0.9 : 0.6} />
        <circle cx={xEnd.x} cy={xEnd.y} r={5} fill="#c4b5fd" />
        <circle cx={yEnd.x} cy={yEnd.y} r={5} fill="#67e8f9" />
        <polyline points={xWave} fill="none" stroke="#c4b5fd" strokeWidth={1.5} opacity={started ? 0.85 : 0} />
        <polyline points={yWave} fill="none" stroke="#67e8f9" strokeWidth={1.5} opacity={started ? 0.85 : 0} />
        <text x={(CORNER.x + xEnd.x) / 2} y={CORNER.y + 18} fill="#c4b5fd" fontSize="11" textAnchor="middle">
          Arm X
        </text>
        <text x={CORNER.x - 10} y={(CORNER.y + yEnd.y) / 2} fill="#67e8f9" fontSize="11" textAnchor="middle" transform={`rotate(-90, ${CORNER.x - 10}, ${(CORNER.y + yEnd.y) / 2})`}>
          Arm Y
        </text>
        <text x={CORNER.x + 12} y={CORNER.y + 36} fill={MUTED_COLOR} fontSize="11">
          the detector
        </text>

        <circle cx={265} cy={55} r={emittedBeaconRadius} fill={EMITTED_COLOR} opacity={started ? 0.9 : 0.5} />
        <text x={265} y={95} fill={EMITTED_COLOR} fontSize="12" textAnchor="middle">
          Emitted
        </text>
        <polyline points={emittedTrace} fill="none" stroke={EMITTED_COLOR} strokeWidth={1.5} opacity={started ? 0.85 : 0} />
        <circle cx={265} cy={165} r={detectedBeaconRadius} fill={DETECTED_COLOR} opacity={started ? 0.9 : 0.5} />
        <text x={265} y={198} fill={DETECTED_COLOR} fontSize="12" textAnchor="middle">
          Detected
        </text>
        <polyline points={detectedTrace} fill="none" stroke={DETECTED_COLOR} strokeWidth={1.5} opacity={started ? 0.85 : 0} />
        {started && (
          <>
            <rect x={190} y={282} width={150} height={32} rx={6} fill="#1e2538" stroke="#fbbf24" strokeWidth={1} />
            <text x={265} y={303} fill="#fbbf24" fontSize="14" fontWeight="bold" textAnchor="middle">
              cycles behind: {cyclesBehind.toFixed(1)}
            </text>
          </>
        )}

        {/* The source is not drawn at this scale; its direction and speed are written beside the waves. */}
        <text x={350} y={52} fill={pinkTag ? YOURS_COLOR : TEXT_COLOR} fontSize="12" fontWeight="bold">
          {pinkTag ? `YOUR SPEED: ${speedText}` : `The source: speed ${speedText}`}
        </text>
        <text x={350} y={70} fill={TEXT_COLOR} fontSize="12">
          moving away from the detector
        </text>
        <line x1={350} y1={84} x2={440} y2={84} stroke={pinkTag ? YOURS_COLOR : TEXT_COLOR} strokeWidth={2} />
        <polygon points="440,79 452,84 440,89" fill={pinkTag ? YOURS_COLOR : TEXT_COLOR} />

        {/* white: the learner's first guess, drawn once the two waves are drawn; a marker for the direction chosen only. Big on purpose. */}
        {started && guess && marker && boxLines && (
          <g>
            <rect x={TRACE_LEFT.x - 5} y={detectedY - 12} width={TRACE_WIDTH + 10} height={24} fill="none" stroke={GUESS_COLOR} strokeWidth={4} rx={4} />
            {marker === 'down' && <polygon points="219,157 231,157 225,172" fill={GUESS_COLOR} />}
            {marker === 'up' && <polygon points="219,172 231,172 225,157" fill={GUESS_COLOR} />}
            {marker === 'equals' && (
              <>
                <rect x={218} y={158} width={14} height={4} fill={GUESS_COLOR} />
                <rect x={218} y={167} width={14} height={4} fill={GUESS_COLOR} />
              </>
            )}
            <line x1={TRACE_LEFT.x + TRACE_WIDTH + 5} y1={detectedY} x2={338} y2={detectedY} stroke={GUESS_COLOR} strokeWidth={3} />
            <rect x={338} y={detectedY - 30} width={236} height={60} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
            <text x={346} y={detectedY - 10} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
              YOUR GUESS{guessNote}: {boxLines[0]}
            </text>
            <text x={346} y={detectedY + 8} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
              {boxLines[1]}
            </text>
          </g>
        )}
      </g>
    </g>
  )
}

// ---- Panel B: how much each wave is stretched ----
const B = { labelX: 12, left: 216, right: 510, valueX: 520 }
const ROW_STEP = 34
const BAR_HEIGHT = 18

function panelBHeight(rows: number) {
  return 44 + rows * ROW_STEP + 30 + 32 + 20
}

function PanelB({
  top,
  drawn,
  part1,
  guess,
  yours,
  yoursSpeed,
}: {
  top: number
  drawn: boolean
  part1: RedshiftRunSummary
  guess: MagnitudeChoice | null
  yours: RedshiftRunSummary | null
  yoursSpeed: number
}) {
  const rows: Array<{ name: string; value: number; color: string; pink: boolean; opacity: number }> = [
    { name: 'Everyday Doppler stretch', value: part1.classicalStretch, color: EVERYDAY_COLOR, pink: false, opacity: 1 },
    { name: 'Real stretch', value: part1.realStretch, color: REAL_COLOR, pink: false, opacity: 1 },
  ]
  if (yours) {
    rows.push(
      { name: `YOUR SPEED ${yoursSpeed.toFixed(2)}c: everyday`, value: yours.classicalStretch, color: YOURS_COLOR, pink: true, opacity: 0.55 },
      { name: `YOUR SPEED ${yoursSpeed.toFixed(2)}c: real`, value: yours.realStretch, color: YOURS_COLOR, pink: true, opacity: 1 },
    )
  }
  const n = rows.length
  const rowsTop = top + 44
  const axisY = rowsTop + n * ROW_STEP
  const boxY = axisY + 30
  const widthOf = (value: number) => ((B.right - B.left) * value) / REDSHIFT_STRETCH_SCALE_MAX
  const rowY = (i: number) => rowsTop + i * ROW_STEP
  const marker = guess ? magnitudeGuessMarker(guess) : null
  const tip = B.left + widthOf(part1.classicalStretch)
  const cy = rowY(0) + BAR_HEIGHT / 2

  return (
    <g>
      <text x={14} y={top + 20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Panel B: how much each wave is stretched (how many times longer it is on arrival)
      </text>
      <line x1={B.left} y1={rowsTop - 6} x2={B.left} y2={axisY} stroke={MUTED_COLOR} />
      {drawn &&
        rows.map((r, i) => (
          <g key={r.name}>
            <text x={B.labelX} y={rowY(i) + 13} fill={r.pink ? YOURS_COLOR : TEXT_COLOR} fontSize="11" fontWeight={r.pink ? 'bold' : 'normal'}>
              {r.name}
            </text>
            <rect x={B.left} y={rowY(i)} width={widthOf(r.value)} height={BAR_HEIGHT} fill={r.color} opacity={r.opacity} rx={2} />
            <text x={B.valueX} y={rowY(i) + 13} fill={r.pink ? YOURS_COLOR : TEXT_COLOR} fontSize="11" fontWeight="bold">
              {f2(r.value)}
            </text>
          </g>
        ))}
      <line x1={B.left} y1={axisY} x2={B.right} y2={axisY} stroke={MUTED_COLOR} />
      <text x={B.left} y={axisY + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">0</text>
      <text x={B.right} y={axisY + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
        {REDSHIFT_STRETCH_SCALE_MAX.toFixed(1)} (the largest stretch on the slider is {f2(redshiftRunSummary(REDSHIFT_MAX_SPEED).realStretch)})
      </text>
      {!drawn && (
        <text x={WIDTH / 2} y={rowsTop + 40} fill={TEXT_COLOR} fontSize="14" textAnchor="middle">
          Press Run: the two bars are drawn when the run has finished.
        </text>
      )}
      {/* white: the learner's second guess, drawn once the bars are drawn; a marker for the choice only. Big on purpose. */}
      {drawn && guess && marker && (
        <g>
          <line x1={B.left - 20} y1={boxY} x2={B.left - 20} y2={cy + 9} stroke={GUESS_COLOR} strokeWidth={3} />
          <rect x={B.left - 5} y={rowY(0) - 5} width={widthOf(part1.classicalStretch) + 10} height={BAR_HEIGHT + 10} fill="none" stroke={GUESS_COLOR} strokeWidth={4} rx={4} />
          <polygon points={`${B.left - 28},${cy - 9} ${B.left - 28},${cy + 9} ${B.left - 12},${cy}`} fill={GUESS_COLOR} />
          {marker === 'past' && (
            <>
              <line x1={tip + 10} y1={cy} x2={tip + 44} y2={cy} stroke={GUESS_COLOR} strokeWidth={4} />
              <polygon points={`${tip + 44},${cy - 8} ${tip + 58},${cy} ${tip + 44},${cy + 8}`} fill={GUESS_COLOR} />
            </>
          )}
          {marker === 'inside' && (
            <>
              <line x1={tip - 6} y1={cy} x2={tip - 40} y2={cy} stroke={GUESS_COLOR} strokeWidth={4} />
              <polygon points={`${tip - 40},${cy - 8} ${tip - 54},${cy} ${tip - 40},${cy + 8}`} fill={GUESS_COLOR} />
            </>
          )}
          <rect x={B.labelX} y={boxY} width={440} height={32} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={3} rx={4} />
          <text x={B.labelX + 10} y={boxY + 21} fill={GUESS_COLOR} fontSize="14" fontWeight="bold">
            YOUR GUESS: {MAGNITUDE_BOX[guess]}
          </text>
        </g>
      )}
    </g>
  )
}

// The whole picture of Part 1: Panel A above Panel B in one drawing; Drawing A (Part 2) is Panel A alone and Drawing B is Panel B alone.
export function RedshiftPicture({
  scope,
  speed,
  time,
  started,
  part1,
  finished,
  dirGuess,
  magGuess,
  yours,
  yoursSpeed,
  label,
}: {
  scope: 'both' | 'A' | 'B'
  speed: number
  time: number
  started: boolean
  part1: RedshiftRunSummary
  finished: boolean
  dirGuess: DirectionChoice | null
  magGuess: MagnitudeChoice | null
  yours: RedshiftRunSummary | null
  yoursSpeed: number
  label: string
}) {
  const showA = scope !== 'B'
  const showB = scope !== 'A'
  const rowsB = yours ? 4 : 2
  const bTop = showA ? A_HEIGHT : 0
  const height = (showA ? A_HEIGHT : 0) + (showB ? panelBHeight(rowsB) : 0)
  return (
    <svg width={WIDTH} height={height} viewBox={`0 0 ${WIDTH} ${height}`} style={svgStyle} role="img" aria-label={label}>
      {showA && (
        <PanelA
          speed={speed}
          time={time}
          started={started}
          top={0}
          guess={dirGuess}
          guessNote={scope === 'A' ? ' (for 0.5c)' : ''}
          pinkTag={scope === 'A'}
        />
      )}
      {showB && <PanelB top={bTop} drawn={finished} part1={part1} guess={magGuess} yours={yours} yoursSpeed={yoursSpeed} />}
    </svg>
  )
}

// ---- Captions (CLAUDE.md §14, "Animated Diagrams") ----
function PictureCaption({
  name,
  scope,
  finished,
  pink,
  run,
  dirGuess,
  magGuess,
}: {
  name: string
  scope: 'both' | 'A' | 'B'
  finished: boolean
  pink: boolean
  run: RedshiftRunSummary
  dirGuess: DirectionChoice | null
  magGuess: MagnitudeChoice | null
}) {
  const speedText = `${run.speed.toFixed(2)}c`
  const showA = scope !== 'B'
  const showB = scope !== 'A'
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong>{' '}
        {showA && 'It shows a detector (two arms) listening to a chirp from a source that is moving away from it. Two waves are drawn so that you can compare them: the one the source sent, and the one that arrives. '}
        {showB && 'It also gives, as two bars, how much longer each wave is when it arrives than when it was sent. '}
        {pink && 'Pink marks your own speed.'}
      </p>
      <ul style={bulletList}>
        {showA && (
          <>
            <li>
              <strong>Arm X (violet) and Arm Y (cyan)</strong> are the detector&rsquo;s two arms; they stretch and squeeze as a wave passes, and the thicker, brighter the glow the stronger the wave is right now.
              <strong> The detector</strong> is the corner where they meet.
            </li>
            <li>
              <strong>The Emitted beacon and the pale yellow wave under it</strong> show the wave as the source sent it. <strong>The Detected beacon and the white-violet wave under it</strong> show the same wave when it
              arrives. A longer wave means a lower pitch; each beacon grows and shrinks with the strength of its wave.
            </li>
            <li>
              <strong>&ldquo;Cycles behind&rdquo;</strong> counts how many whole waves the detected signal has completed fewer than the emitted one has, since the start of the run.
            </li>
            <li>
              <strong>The text at the top right</strong> gives the source&rsquo;s speed. <strong>c</strong> is the speed of light, so {speedText} is {run.speed === 0 ? 'no motion at all' : `${f2(run.speed)} times the speed of light`}. The source itself is too far away to draw at this scale.
            </li>
          </>
        )}
        {showB && (
          <li>
            <strong>Panel B&rsquo;s bars</strong> are stretches: how many times longer each wave is on arrival than at sending. A longer bar is a bigger stretch. <strong>The amber bar</strong> is what an everyday Doppler effect alone
            would give. <strong>The pale cyan bar</strong> is the real stretch.
            {pink && ' The pink bars are the same two stretches at your speed.'} The scale is fixed, so the bars never rescale when the slider moves.
          </li>
        )}
        {(dirGuess || magGuess) && (
          <li>
            <strong>The white boxes, thick white outlines and arrows</strong> are your guesses, drawn only as markers: they show which choice you made and say nothing about how much. They never change a wave or a bar.
            {showA && ' Your first guess (higher, lower or the same) sits beside the Detected wave: an arrow pointing down means lower, up means higher, an equals sign means the same.'}
            {showB && ' Your second guess (exactly, more or less) sits on the amber bar: an arrow pointing past its tip means more, an arrow pointing back inside it means less, and the outline alone means exactly.'}
          </li>
        )}
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong> {showA && 'At the start only the arms, the two waves and your first guess are drawn. As the run plays, the beacons pulse and the waves scroll. '}
        {showB && 'When the run has finished, Panel B’s two bars appear and your second guess is drawn on the amber bar. '}
        {pink && 'The pink bars appear when you press Run at your speed.'}
      </p>
      {finished && (
        <>
          <p style={paragraph}>
            <strong>A worked moment.</strong> At {speedText} the everyday stretch is 1 + {f2(run.speed)} = {f2(run.classicalStretch)}, so each wave arrives {f2(run.classicalStretch)} times as long as it was sent. The real stretch
            is 1 ÷ {f3(run.realFactor)} = {f2(run.realStretch)}. At the final moment the source sent a pitch of {f3(run.finalEmittedFrequency)} and the detector receives {f3(run.finalDetectedFrequency)}: {f3(run.finalEmittedFrequency)} ×{' '}
            {f3(run.realFactor)} = {f3(run.finalDetectedFrequency)}.
          </p>
          <LookFor
            items={[
              ...(showA
                ? [
                    {
                      look: 'the Emitted wave and the Detected wave in Panel A.',
                      means: `the Detected wave is drawn from the pitch the detector receives, ${f3(run.finalDetectedFrequency)} at the final moment; the Emitted wave is drawn at the pitch the source sent, ${f3(run.finalEmittedFrequency)}.`,
                      matters: 'this is the first question, higher, lower or the same, drawn as two waves you can lay side by side.',
                    },
                    ...(dirGuess
                      ? [
                          {
                            look: 'the white outline and arrow beside the Detected wave.',
                            means: 'your first guess, a marker for the direction you chose.',
                            matters: 'it lets you check your own idea against the two waves before the tutor talks about it; it does not say whether you were right.',
                          },
                        ]
                      : []),
                  ]
                : []),
              ...(showB
                ? [
                    {
                      look: 'the amber and pale cyan bars in Panel B.',
                      means: `the everyday stretch is ${f2(run.classicalStretch)} and the real stretch is ${f2(run.realStretch)}.`,
                      matters: 'this is the second question, drawn on one scale so you can see how far apart the two are.',
                    },
                    ...(magGuess
                      ? [
                          {
                            look: 'the white outline and arrow on the amber bar.',
                            means: 'your second guess, a marker: past the bar’s tip for "more", back inside it for "less", the outline alone for "exactly".',
                            matters: 'it lets you check your idea against the pale cyan bar; it does not say whether you were right.',
                          },
                        ]
                      : []),
                  ]
                : []),
              ...(showA
                ? [
                    {
                      look: 'the "cycles behind" badge.',
                      means: 'a running count of how many waves the detected signal has completed fewer than the emitted one.',
                      matters: 'it turns the gap between the two waves into one number that keeps growing during the run.',
                    },
                  ]
                : []),
            ]}
          />
        </>
      )}
    </div>
  )
}

// What the learner's own speed shows (updates with the slider; every number from the module).
function yourNumbersParagraph(speed: number): string {
  const cmp = yourSpeedComparison(speed)
  const y = cmp.yours
  const p = cmp.part1
  if (cmp.atPart1Speed) {
    return `Your speed is ${y.speed.toFixed(2)}c, the same as Part 1’s, so every comparison above says "the same". Move the slider and press Run at your speed again to see it change.`
  }
  if (y.speed === 0) {
    return `With no motion nothing is stretched: the everyday stretch and the real stretch are both ${f2(y.classicalStretch)}. Check 1 (the real stretch is more than the everyday one) does not apply, because there is nothing to exceed.`
  }
  return `At ${y.speed.toFixed(2)}c the everyday stretch is ${f2(y.classicalStretch)} and the real stretch is ${f2(y.realStretch)}, so the real stretch is ${f2(y.extraStretch)} times the everyday one (${y.extraStretchPercent.toFixed(0)} percent more; at ${p.speed.toFixed(2)}c it was ${p.extraStretchPercent.toFixed(0)} percent more). Check 1 (the real stretch is more than the everyday one) ${cmp.realStretchExceedsEveryday ? 'still holds' : 'does not hold'}.`
}

export function GravitationalWaveRedshiftExperiment({ onComplete, onTutorComplete }: GravitationalWaveRedshiftExperimentProps) {
  const [speed, setSpeed] = useState(SPEED_DEFAULT)
  const [runSpeed, setRunSpeed] = useState(SPEED_DEFAULT)
  const [ranPart1, setRanPart1] = useState(false)
  const [dirPrediction, setDirPrediction] = useState<DirectionChoice | null>(null)
  const [magPrediction, setMagPrediction] = useState<MagnitudeChoice | null>(null)
  const [dirSubmitted, setDirSubmitted] = useState<DirectionChoice | null>(null)
  const [magSubmitted, setMagSubmitted] = useState<MagnitudeChoice | null>(null)
  const completedOnce = useRef(false)

  const finishPart1 = () => {
    setRanPart1(true)
    if (!completedOnce.current) {
      completedOnce.current = true
      onComplete?.()
    }
  }
  const part1 = useRunner(finishPart1)
  const part2 = useRunner()

  const hasPrediction = dirPrediction !== null && magPrediction !== null
  const locked = dirSubmitted !== null && magSubmitted !== null
  const part1Running = part1.status === 'running'
  const part2Running = part2.status === 'running'
  const part1Started = part1.status !== 'idle'
  const part1Finished = part1.status === 'complete' || ranPart1
  const ranHere = part2.status !== 'idle' && runSpeed === speed
  const part2Done = part2.status === 'complete' && runSpeed === speed

  const part1Summary = useMemo(() => redshiftRunSummary(REDSHIFT_PART1_SPEED), [])
  const part2Summary = useMemo(() => redshiftRunSummary(speed), [speed])
  const runSummary = useMemo(() => redshiftRunSummary(runSpeed), [runSpeed])
  const comparison = useMemo(() => yourSpeedComparison(runSpeed), [runSpeed])

  const handleRunPart1 = () => {
    if (!hasPrediction || part1Running || part2Running) return
    if (!locked) {
      setDirSubmitted(dirPrediction)
      setMagSubmitted(magPrediction)
    }
    part2.reset()
    part1.start(WINDOW)
  }
  const handleRunPart2 = () => {
    if (part1Running || part2Running) return
    setRunSpeed(speed)
    part2.start(WINDOW)
  }
  // Start over: clears both guesses, the runs, Part 2 and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setRanPart1(false)
    completedOnce.current = false
    setDirSubmitted(null)
    setMagSubmitted(null)
    setDirPrediction(null)
    setMagPrediction(null)
    setSpeed(SPEED_DEFAULT)
    setRunSpeed(SPEED_DEFAULT)
  }

  const dirLabel = (choice: DirectionChoice) => ({ higher: 'higher', lower: 'lower', same: 'the same' })[choice]
  const magLabel = (choice: MagnitudeChoice) => ({ exact: 'exactly the everyday amount', more: 'more than the everyday amount', less: 'less than the everyday amount' })[choice]
  const p1 = part1Summary
  const yourVal = (value: string) => (part2Done ? value : 'not run yet')
  const yourWord = (word: string) => (part2Done ? word : 'run your speed to compare')

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 5 — Stretched by Motion</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> The last three experiments, &ldquo;The Chirp&rdquo;, &ldquo;Where the Energy Comes From&rdquo; and &ldquo;Comparing Two Real Events&rdquo;, built a toy model of
            two objects spiralling together: a wave whose pitch and loudness build as they circle. None of them asked what happens if the pair itself is moving relative to the detector. If the
            source of a gravitational wave is racing away from us as it sends the wave out, does that change what we detect?
          </p>
          <p style={paragraph}>
            <strong>The Doppler effect.</strong> You already know this effect from everyday life, even if you have never named it: an ambulance&rsquo;s siren sounds higher-pitched as it comes towards
            you, then suddenly drops to a lower pitch once it has passed and is driving away. Nothing about the siren changed. What changed is that each new sound wave starts from slightly farther away
            than the last one, so the waves reach your ear a little more spread out. This is called the <strong>Doppler effect</strong>, and it applies to any kind of wave, such as sound, light or a
            gravitational wave, whenever its source is moving relative to whoever is detecting it. The word for a wave that arrives stretched to a lower pitch than it was sent at is{' '}
            <strong>redshift</strong> (first defined in the Gravity and Curved Spacetime chapter). The Doppler effect is one cause of redshift: motion.
          </p>
          <p style={paragraph}>
            <strong>How much stretch? An everyday example.</strong> Here is a way to put a number on it. Imagine a lamp that flashes once every second and is moving away from you. Light travels at a
            speed called <strong>c</strong>, so a speed of 0.5c is half the speed of light. Between one flash and the next, the lamp moves 0.5c × 1 second farther away, so the second flash has a little
            farther to go than the first. Each flash arrives 1.5 seconds after the one before it, not 1 second. The flashes are stretched to 1.5 times as far apart. In general the everyday stretch is 1 plus
            the speed measured in c, so at 0.5c it is 1 + 0.5 = 1.5. A bigger stretch means a lower pitch. This is the amount that an everyday Doppler effect alone predicts, and it is the amount this
            experiment compares against.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> You will see the same chirp as in the last three experiments, now sent by a source that is moving away from the detector. The picture shows the detector&rsquo;s
            arms, and beside them two waves: one drawn as the source sent it, labelled <strong>Emitted</strong>, and one drawn as the detector receives it, labelled <strong>Detected</strong>. A second panel
            under them puts numbers on how much each wave is stretched.
          </p>
          <p style={paragraph}>
            <strong>A word before you run: Doppler factor.</strong> The picture and the numbers use a <strong>Doppler factor</strong>: the number you multiply the pitch the source sent by to get the pitch
            the detector receives. A factor of 1 means no change, and a factor less than 1 means the detector hears a lower pitch. The <strong>stretch</strong> is 1 ÷ the factor: it says how many times
            longer each wave is when it arrives than when it was sent. A stretch of 2 means each wave is twice as long.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> In Part 1, make two predictions. First, will the detected frequency be higher, lower or the same as the frequency at the source? Then, will the real stretch match the
            everyday Doppler stretch described above, or be more or less than that? Then press Run once and watch. In Part 2, choose a speed of your own and see how the stretch changes. Then the tutor will
            ask you what you saw.
          </p>
          <p style={paragraph}>
            <strong>Your predictions and the real pictures.</strong> Your predictions never change the real pictures, the tables or the numbers: the arms, the waves, the bars and the tables come from a
            calculation that knows nothing about what you guessed. Your guesses are drawn on the picture in white, in boxes labelled YOUR GUESS, and listed again beside the results. In Part 2, the speed slider
            does change the drawings; the marks it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one, with a short plain meaning: Doppler effect, redshift, c, receding, emitted, detected, Doppler
            factor, stretch, everyday stretch, chirp, pitch, strain, cycles behind, time dilation and cosmological redshift.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything &ldquo;The Chirp&rdquo; and the experiments after it assumed still applies: the effect is hugely exaggerated, only one wave pattern is shown, no real detection hardware is modelled,
              the merger itself is not modelled, and the chirp formulas are simplified stand-ins, not the real equations.
            </li>
            <li>The source moves directly away from the detector only: no sideways motion, and no approaching case.</li>
            <li>
              This experiment models only the motion-based part of redshift. For a real, very distant source, the larger part of its redshift is usually the expansion of space while the wave travels,
              which is not modelled here (see Part 3).
            </li>
            <li>The source&rsquo;s mass is fixed, so that the experiment stays on one idea: motion-based stretching.</li>
            <li>The speeds up to 0.9c are a toy range, chosen to make the effect easy to see. They are not the speeds of real sources.</li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(part1Finished)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages and the original scientific paper are listed here. Checked on 7 November 2026. Each link opens in a new tab.
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
            No plain page from an official source was found that gives GW150914&rsquo;s masses as the detector measured them, as opposed to at the source, so this page does not use those figures.
          </p>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you make two predictions about a wave from a source moving away at half the speed of light (0.5c). Then you press Run once and watch the wave pass through the detector&rsquo;s arms, as it was
          sent and as it is received. Your guesses are drawn on the picture in white.
        </PartHeader>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            If the source of a gravitational wave is moving away from the detector at half the speed of light (0.5c), will the detected frequency be higher, lower or the same as the frequency at the
            source?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {directionChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setDirPrediction(choice.value)}
                disabled={locked}
                className={`toggle-button${dirPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            Above, an everyday Doppler effect alone gave a stretch of 1.5 at 0.5c. Do you think the real stretch of this wave will be exactly that, more than that, or less than that?
          </p>
          <div style={{ marginBottom: '0.5rem' }}>
            {magnitudeChoices.map((choice) => (
              <button
                key={choice.value}
                onClick={() => setMagPrediction(choice.value)}
                disabled={locked}
                className={`toggle-button${magPrediction === choice.value ? ' is-selected' : ''}`}
                style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
              >
                {choice.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {hasPrediction || locked
              ? `Your predictions: ${directionChoices.find((c) => c.value === (dirPrediction ?? dirSubmitted))!.label}, ${magnitudeChoices.find((c) => c.value === (magPrediction ?? magSubmitted))!.label}`
              : 'Answer both questions to continue'}
            {locked && ' Your predictions are locked while you try other speeds. To change them, press Start over.'}
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
          <RedshiftPicture
            scope="both"
            speed={REDSHIFT_PART1_SPEED}
            time={part1.time}
            started={part1Started}
            part1={p1}
            finished={part1Finished}
            dirGuess={dirSubmitted}
            magGuess={magSubmitted}
            yours={null}
            yoursSpeed={speed}
            label="A detector with two arms and two waves beside it, Emitted and Detected, above two bars showing how much each wave is stretched. Your guesses are drawn in white in boxes marked YOUR GUESS."
          />
          {part1Finished && (
            <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem' }}>
              Frequency as emitted at the final moment: {f3(p1.finalEmittedFrequency)} &nbsp;|&nbsp; Frequency as detected: {f3(p1.finalDetectedFrequency)}
              <br />
              Doppler factor: {f3(p1.realFactor)}
            </p>
          )}
          <PictureCaption name="the picture" scope="both" finished={part1Finished} pink={false} run={p1} dirGuess={dirSubmitted} magGuess={magSubmitted} />
          <WhereFrom
            measured="nothing in this picture is a measurement."
            calculated="the arms, the two waves and both bars, from the simplified chirp formula of the earlier experiments and the Doppler formulas of this page, at one made-up mass."
            guess="the white marks and boxes are your guesses, drawn only as markers. They are not part of the calculation."
            imagined="the source's speed of 0.5c, the fixed mass, and the exaggerated size of the arms' movement."
          />
        </Block>

        {/* ===== Part 2 ===== */}
        {part1Finished && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a speed of your own, from 0 to 0.9c, and run it. The slider changes the drawings in this Part, marked in pink. It does not change Part 1&rsquo;s picture, the tables in Part 3, or your guesses.
            </PartHeader>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>What you are changing.</strong> The speed at which the source moves away from the detector, as a fraction of the speed of light: 0 means no motion, 0.9c is nine tenths of the speed of
                light. Nothing else changes: the same chirp and the same formulas are used at every speed, so any difference you see comes from the speed.
              </p>
              <p style={paragraph}>
                <strong>What to try.</strong> Run 0.3c, then 0.7c, then 0.9c, and watch how the real bar in Drawing B moves compared with the everyday bar. Try 0 to see what happens when nothing is moving.
              </p>
              <p style={paragraph}>
                <strong>The pink marks.</strong> Pink always means your own choice. Drawing A is the detector and the two waves at your speed. Drawing B has two pink bars, the everyday stretch and the real
                stretch at your speed, under the two Part 1 bars. The pink bars are drawn when you press Run at your speed.
              </p>
              <p style={paragraph}>
                <strong>Your guesses.</strong> White always means your guesses. Your first guess is drawn again on Drawing A (it was about 0.5c) and your second on Drawing B, beside the real bars, so you can
                compare. They never change a wave or a bar.
              </p>
              <p style={{ ...smallNote, marginBottom: '0.75rem' }}>
                Your guesses do not change these drawings or the tables in Part 3, but this slider does change the drawings below and Table 2. While the slider is on 0.50c (the Part 1 speed), Table 2 says
                &ldquo;the same&rdquo; in every comparison; move the slider to see it change.
              </p>
            </div>

            <label htmlFor="redshift-speed" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Recession speed: {speed.toFixed(2)}c
            </label>
            <input
              id="redshift-speed"
              type="range"
              min={0}
              max={REDSHIFT_MAX_SPEED}
              step={0.05}
              value={speed}
              disabled={part1Running || part2Running}
              onChange={(event) => setSpeed(Number(event.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>0 (no motion)</span>
              <span>0.9c</span>
            </div>
            <button type="button" className="action-button" onClick={handleRunPart2} disabled={part1Running || part2Running} style={{ marginTop: '0.75rem', padding: '0.6rem 1.5rem' }}>
              {part2Running ? 'Running...' : 'Run at your speed'}
            </button>

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Drawing A: the detector and the two waves at your speed</p>
            <RedshiftPicture
              scope="A"
              speed={ranHere ? runSpeed : speed}
              time={ranHere ? part2.time : 0}
              started={ranHere}
              part1={p1}
              finished={false}
              dirGuess={dirSubmitted}
              magGuess={null}
              yours={null}
              yoursSpeed={speed}
              label="Drawing A: the detector's two arms and the Emitted and Detected waves at your speed. Your first guess is drawn in white in a box marked YOUR GUESS."
            />
            {ranHere && (
              <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.875rem' }}>
                Frequency as emitted: {f3(waveStateAt(runSpeed, part2.time, true).emittedFrequency)} &nbsp;|&nbsp; Frequency as detected: {f3(waveStateAt(runSpeed, part2.time, true).detectedFrequency)} &nbsp;|&nbsp; Doppler factor: {f3(runSummary.realFactor)}
              </p>
            )}
            <PictureCaption name="Drawing A" scope="A" finished={part2Done} pink run={part2Done ? runSummary : part2Summary} dirGuess={dirSubmitted} magGuess={null} />
            <WhereFrom
              measured="nothing in this picture is a measurement."
              calculated={<>the arms and the two waves, from the same simplified formulas as the picture in Part 1, at a speed of {(ranHere ? runSpeed : speed).toFixed(2)}c.</>}
              guess="the white mark and box are your first guess (about 0.5c), drawn only as a marker. They are not part of the calculation."
              imagined={<>the speed, your own choice (a trial value that does not say a real source moves like that), and the exaggerated size of the arms&rsquo; movement.</>}
            />

            <p style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem' }}>Drawing B: the stretch at Part 1&rsquo;s speed and at yours</p>
            <RedshiftPicture
              scope="B"
              speed={speed}
              time={0}
              started={false}
              part1={p1}
              finished={part1Finished}
              dirGuess={null}
              magGuess={magSubmitted}
              yours={part2Done ? runSummary : null}
              yoursSpeed={runSpeed}
              label="Drawing B: the everyday and real stretch at Part 1's speed and, in pink, at your speed. Your second guess is drawn in white in a box marked YOUR GUESS."
            />
            {!part2Done && (
              <p style={{ ...smallNote, marginTop: '0.5rem' }}>
                <span style={{ color: YOURS_COLOR, fontWeight: 'bold' }}>YOUR SPEED: {speed.toFixed(2)}c</span> — move the slider and press Run at your speed to draw the pink bars.
              </p>
            )}
            <PictureCaption name="Drawing B" scope="B" finished={part1Finished} pink run={part2Done ? runSummary : p1} dirGuess={null} magGuess={magSubmitted} />
            <WhereFrom
              measured="nothing in this picture is a measurement."
              calculated={<>the bars, from the Doppler formulas of this page, at 0.50c and at your speed of {runSpeed.toFixed(2)}c.</>}
              guess="the white mark and box are your second guess, drawn only as a marker. They are not part of the calculation."
              imagined={<>the two speeds (the pink one is a trial value that does not say a real source moves like that).</>}
            />
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>These are trial values for the pictures. They do not say the real system is like that.</p>
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Finished && dirSubmitted && magSubmitted && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guesses listed beside them, a check of the result against the everyday guess, and a table for the speed you chose. Table 1 and the check-up never
              change with your guesses or with the slider. Table 2 follows the slider.
            </PartHeader>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Your guesses, beside the results</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 0, marginBottom: '0.5rem' }}>
              Your guesses are shown here as you made them, with the place where each number appears. They are not marked here, and they never change a picture or a table. The tutor marks them, in Part 4.
            </p>
            <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <li>
                <strong>Your first guess:</strong> the detected frequency would be {dirLabel(dirSubmitted)} than the frequency at the source. Its numbers are in Table 1, rows &ldquo;Frequency as emitted&rdquo; and
                &ldquo;Frequency as detected&rdquo;, and in the white mark beside the Detected wave.
              </li>
              <li>
                <strong>Your second guess:</strong> the real stretch would be {magLabel(magSubmitted)}. Its numbers are in the check-up and in Table 1, rows &ldquo;Stretch, everyday&rdquo; and &ldquo;Stretch,
                real&rdquo;, and in the white mark on the amber bar.
              </li>
            </ul>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>How to read these results.</strong> A table of numbers is hard to read until someone says what it is. The check-up sets what an everyday Doppler effect would give next to what this page
                found. Table 1 gives the Part 1 run in full. Table 2 follows the speed you chose in Part 2, and tells you what changes as you move the slider.
              </p>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Check-up: the Part 1 run at {f2(p1.speed)}c against the everyday guess</strong>
            </p>
            <ResultsTable
              head={['What we checked', 'Expected', 'Found', 'Reading']}
              minWidth={560}
              rows={[
                [
                  <>
                    Stretch of each wave
                    <GuessTag n={2} />
                  </>,
                  `${f2(p1.classicalStretch)} (everyday Doppler alone)`,
                  f2(p1.realStretch),
                  `more: the real stretch is about ${p1.extraStretchPercent.toFixed(0)} percent more than the everyday one`,
                ],
                ['Doppler factor', f3(p1.classicalFactor), f3(p1.realFactor), 'lower: the real factor is lower'],
              ]}
            />
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.75rem 0 1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The check.</strong> <em>What it is:</em> the everyday stretch next to the stretch the run actually produced. <em>What it means:</em> the run gave {f2(p1.realStretch)}, which is{' '}
                  {f2(p1.realStretch)} ÷ {f2(p1.classicalStretch)} = {f3(p1.extraStretch)} times the everyday amount, so about {p1.extraStretchPercent.toFixed(0)} percent more. <em>Why it matters:</em> it says
                  the everyday Doppler effect is not the whole story for a source moving this fast. The tutor asks why.
                </li>
                <li>
                  <strong>How sure the numbers are.</strong> Both numbers are exact results of the two formulas on this page, not measurements. They are a rough picture of how a moving source stretches a wave,
                  and no real binary is known to move this fast.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Table 1: the Part 1 run at {f2(p1.speed)}c</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value']}
              minWidth={420}
              rows={[
                ['Speed of the source', `${f2(p1.speed)}c`],
                [
                  <>
                    Frequency as emitted, at the final moment
                    <GuessTag n={1} />
                  </>,
                  f3(p1.finalEmittedFrequency),
                ],
                [
                  <>
                    Frequency as detected, at the final moment
                    <GuessTag n={1} />
                  </>,
                  f3(p1.finalDetectedFrequency),
                ],
                ['Doppler factor, real', f3(p1.realFactor)],
                ['Doppler factor, everyday', f3(p1.classicalFactor)],
                [
                  <>
                    Stretch, real
                    <GuessTag n={2} />
                  </>,
                  f2(p1.realStretch),
                ],
                [
                  <>
                    Stretch, everyday
                    <GuessTag n={2} />
                  </>,
                  f2(p1.classicalStretch),
                ],
                ['Time dilation factor', f3(p1.timeDilationFactor)],
                ['The viewing window (observer time)', f3(p1.observerWindow)],
              ]}
            />
            <p style={{ ...smallNote, margin: '0.5rem 0 1rem' }}>The tags show which rows relate to your guesses. They do not say whether the guesses matched.</p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Emitted and detected pitch.</strong> <em>What they are:</em> the pitch the source sent at the final moment, and the pitch the detector receives then. <em>What they mean:</em> {f3(p1.finalEmittedFrequency)}{' '}
                  × {f3(p1.realFactor)} = {f3(p1.finalDetectedFrequency)}. <em>Why it matters:</em> the detector hears a different pitch from the one sent; that is your first question.
                </li>
                <li>
                  <strong>The two factors and the two stretches.</strong> <em>What they are:</em> how the detector&rsquo;s pitch compares with the source&rsquo;s (the factor), and how many times longer each wave is on
                  arrival (the stretch, 1 ÷ the factor). <em>What they mean:</em> the everyday factor is {f3(p1.classicalFactor)} ({f2(p1.classicalStretch)} as a stretch) and the real one {f3(p1.realFactor)} ({f2(p1.realStretch)}).
                  The real factor is the everyday factor times the time dilation factor: {f3(p1.classicalFactor)} × {f3(p1.timeDilationFactor)} = {f3(p1.realFactor)}. <em>Why it matters:</em> this is your second
                  question. The reason for the extra factor is left to the tutor.
                </li>
                <li>
                  <strong>How sure the numbers are.</strong> They come from formulas on this page at one made-up mass, not from the real signals. They show how a speed changes a wave, not how any real source moves.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1rem 0 0.25rem' }}>
              <strong>Table 2: your own speed (a trial value)</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Part 1 (0.50c)', 'Your value', 'How yours compares']}
              minWidth={620}
              rows={[
                ['Speed of the source', `${f2(p1.speed)}c`, yourVal(`${f2(comparison.yours.speed)}c`), yourWord(comparison.words.speed)],
                ['Stretch, everyday', f2(p1.classicalStretch), yourVal(f2(comparison.yours.classicalStretch)), yourWord(comparison.words.classicalStretch)],
                ['Stretch, real', f2(p1.realStretch), yourVal(f2(comparison.yours.realStretch)), yourWord(comparison.words.realStretch)],
                ['Extra stretch (real ÷ everyday)', f3(p1.extraStretch), yourVal(f3(comparison.yours.extraStretch)), yourWord(comparison.words.extraStretch)],
                ['Doppler factor, real', f3(p1.realFactor), yourVal(f3(comparison.yours.realFactor)), yourWord(comparison.words.realFactor)],
                ['Frequency as detected, at the final moment', f3(p1.finalDetectedFrequency), yourVal(f3(comparison.yours.finalDetectedFrequency)), yourWord(comparison.words.finalDetectedFrequency)],
              ]}
            />
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.75rem 0 1.5rem' }}>
              {part2Done ? (
                <p style={paragraph}>
                  <strong>What your numbers show.</strong> {yourNumbersParagraph(runSpeed)}
                </p>
              ) : (
                <p style={paragraph}>
                  <strong>What your numbers show.</strong> Table 2 fills in when you press Run at your speed in Part 2. Until then only the Part 1 column has numbers.
                </p>
              )}
              <p style={paragraph}>
                <strong>What this table tells us.</strong> <em>What it is:</em> the stretches and factors at the speed you chose, next to the Part 1 speed. <em>What it means:</em> the &ldquo;How yours compares&rdquo;
                column says &ldquo;more&rdquo;, &ldquo;less&rdquo; or &ldquo;the same&rdquo; and nothing else; there is no cut-off for &ldquo;close enough&rdquo;. <em>Why it matters:</em> it shows how both stretches grow as the speed
                rises, and that the real one grows faster. The published value for each row is the same formula as the one used here, so there is no separate published column.
              </p>
              <p style={{ ...smallNote, marginBottom: 0 }}>These are trial values. They do not say the real system is like that.</p>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>What about a real source?</strong> This experiment models only the motion-based part of redshift. For a very distant real source, such as GW150914 (about 1.3 billion light-years away, a
                redshift of about 0.09 in the discovery paper), the larger part of the redshift is the expansion of space while the wave travels, which stretches gravitational waves and light alike. Scientists
                include it when they work out a source&rsquo;s masses from the wave.
              </p>
              <p style={{ ...smallNote, marginBottom: 0 }}>
                <strong>Where these figures come from.</strong> The redshift of 0.09 is from the abstract of the{' '}
                <ExternalLink href="https://arxiv.org/abs/1602.03837">GW150914 paper</ExternalLink>. That expansion stretches gravitational waves and light alike is from LIGO&rsquo;s{' '}
                <ExternalLink href="http://ligo.org/science-summaries/O3Cosmology/">science summary</ExternalLink> and NASA&rsquo;s{' '}
                <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-cosmological-redshift/">Hubble page</ExternalLink>. Tables 1 and 2 and the check-up are
                calculated on this page from the formulas in the &ldquo;Words and formulas&rdquo; box.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ===== Part 4 ===== */}
      {part1Finished && dirSubmitted && magSubmitted && (
        <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            Talk through what you saw. The tutor points to your white guess marks, then explains.
          </PartHeader>
          <GravitationalWaveRedshiftTutor
            key={`${dirSubmitted}-${magSubmitted}`}
            predictedDirection={dirSubmitted}
            predictedMagnitude={magSubmitted}
            directionMatched={directionGuessMatches(dirSubmitted, REDSHIFT_PART1_SPEED)}
            magnitudeMatched={magnitudeGuessMatches(magSubmitted, REDSHIFT_PART1_SPEED)}
            onExplained={onTutorComplete}
          />
        </div>
      )}
    </div>
  )
}
