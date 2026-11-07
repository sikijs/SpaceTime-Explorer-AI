import { useMemo, useRef, useState, type ReactNode } from 'react'
import { BASE_ARM_LENGTH } from '../physics/gravitationalWaveExperiment'
import {
  BASE_AMPLITUDE,
  BASE_FREQUENCY,
  PART1_MASS,
  REAL_CHIRP,
  REFERENCE_PAIRS,
  armMoveForStrain,
  chirpArmTrace,
  chirpCheckUp,
  chirpRunFor,
  chirpRunSummary,
  chirpStateAt,
  firstAndLastSwing,
  graphHalfRange,
  loudnessGuessRatio,
  pitchGuessRatio,
  timingGuessTargets,
  timingGuessTargetsBetween,
} from '../physics/gravitationalWaveChirpExperiment'
import type { ChirpRunSummary, FirstAndLastSwing, LoudnessChoice, PitchChoice, TimingChoice } from '../physics/gravitationalWaveChirpExperiment'
import {
  ArmsPicture,
  ARM_X_COLOR,
  ARM_Y_COLOR,
  MUTED_COLOR,
  PartHeader,
  REST_COLOR,
  TEXT_COLOR,
  YOURS_COLOR,
  svgStyle,
  useRunner,
} from './GravitationalWaveExperiment'
import { GravitationalWaveChirpTutor } from './GravitationalWaveChirpTutor'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import { ReferencePanel } from './EnergyMomentumExperiment'

// Gravitational Waves, Experiment 2 (docs/experiments/gravitational-waves/02-the-chirp.md), being audited to the newer
// rules (docs/audit/gravitational-waves/02-draft-wording.md), Step 4: the page in four Parts, Picture 3, and Part 2's
// Drawings A and B. Every number drawn or shown comes from src/physics/gravitationalWaveChirpExperiment.ts (CLAUDE.md
// §9); the only calculation here is where a point is drawn. Not built yet (later steps): the white YOUR GUESS marks, the
// captions and "Where the real picture comes from" lines, the tables and notes, the tutor's new wording.

interface GravitationalWaveChirpExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const smallNote = { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' } as const

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

// The pages and the paper behind this page's wording (fetched and read on 4 and 6 November 2026;
// see the audit's draft wording).
const PLAIN_LINKS = [
  { href: 'https://www.ligo.caltech.edu/page/gw-sources', label: 'LIGO Lab: "Sources and Types of Gravitational Waves"', what: 'how pairs of black holes and neutron stars spiral together and give off waves that LIGO can turn into a sound called a chirp.' },
  { href: 'https://www.ligo.caltech.edu/page/what-are-gw', label: 'LIGO Lab: "What are Gravitational Waves?"', what: 'ripples in spacetime from violent events, Einstein\'s prediction and LIGO\'s first detection.' },
  { href: 'https://spaceplace.nasa.gov/gravitational-waves/en/', label: 'NASA Space Place: "What Is a Gravitational Wave?"', what: 'a short, plain explainer: waves that squeeze and stretch things, what causes them and how LIGO detects them.' },
  { href: 'https://spaceplace.nasa.gov/black-holes/en/', label: 'NASA Space Place: "What Is a Black Hole?"', what: 'a short, plain page for beginners on what a black hole is and why not even light escapes.' },
  { href: 'https://www.esa.int/Science_Exploration/Space_Science/Black_holes', label: 'ESA: "Black holes"', what: 'what a black hole is, and how pairs of black holes coming together and merging make gravitational waves that LIGO first detected in 2015. A little more technical than the NASA page.' },
]
const PAPER_LINK = {
  href: 'https://arxiv.org/abs/1602.03837',
  label: '"Observation of Gravitational Waves from a Binary Black Hole Merger"',
  what: 'the original report of GW150914 (LIGO Scientific Collaboration and Virgo Collaboration, Physical Review Letters 116, 061102, 2016). Its abstract says the signal sweeps upwards in frequency from 35 to 250 hertz.',
}

// The "Words and formulas" box. Worked examples use the made-up mass 0.3 and take every number
// from the physics module (CLAUDE.md §9). The entries that would give away the predictions
// (how the pitch and loudness change, and how mass sets the time) appear only after a run.
const EXAMPLE_MASS = PART1_MASS
function referenceEntries(done: boolean): { term: string; meaning: string }[] {
  const run = chirpRunFor(EXAMPLE_MASS, BASE_FREQUENCY, BASE_AMPLITUDE)
  const end = chirpStateAt(run.cutoffTime, EXAMPLE_MASS, BASE_FREQUENCY, BASE_AMPLITUDE)
  const swings = end.phase / (2 * Math.PI)
  const f3 = (n: number) => n.toFixed(3)
  const entries = [
    { term: 'Gravitational wave', meaning: 'a ripple in the shape of spacetime that travels outward from a violent event, such as two black holes spiralling into each other, at the speed of light.' },
    { term: 'Black hole', meaning: 'an object so dense that its gravity lets nothing, not even light, escape from it.' },
    { term: 'Mass', meaning: 'how much matter an object has. The more mass, the stronger its gravity. On this page mass is a made-up scale, not real Suns.' },
    { term: 'Orbit', meaning: 'a path where one object keeps going around another, like the Moon going around the Earth.' },
    { term: 'Spiral', meaning: 'a path that goes round and round while the circle gets smaller, like the groove on a vinyl record or the shell of a snail.' },
    { term: 'Inspiral', meaning: 'the closing-in of two objects that orbit each other and slowly draw closer, until they meet and merge.' },
    done
      ? { term: 'Chirp', meaning: 'the name scientists give to the wave from two objects spiralling together. It is named after the sound LIGO can make from its signals, whose pitch and loudness both rise.' }
      : { term: 'Chirp', meaning: 'the name scientists give to the wave from two objects spiralling together. It is named after the sound LIGO can make from its signals. How the wave changes is for you to predict.' },
    { term: 'Light-year', meaning: 'the distance light travels in one year.' },
    { term: 'LIGO', meaning: 'the Laser Interferometer Gravitational-Wave Observatory: two detectors in the United States, each with two arms 4 kilometres long.' },
    { term: 'Pitch (frequency)', meaning: 'how many full swings the arms make in one time unit, at one moment. The higher the number, the higher the pitch. One swing at that moment lasts 1 ÷ the frequency.' },
    { term: 'Loudness (amplitude)', meaning: 'the biggest strain the wave is reaching at one moment.' },
    { term: 'Strain', meaning: 'a plain number saying how strongly the wave is acting on space at one instant. 0 means the wave is doing nothing at that instant; the bigger the number, positive or negative, the stronger its effect.' },
    done
      ? { term: 'Swing (cycle)', meaning: 'one complete repeat of the wave\'s pattern: out, back and out again to where it began. How long one swing takes at a given moment is 1 ÷ the frequency at that moment. In this run the swings get shorter as the run goes on.' }
      : { term: 'Swing (cycle)', meaning: 'one complete repeat of the wave\'s pattern: out, back and out again to where it began. How long one swing takes at a given moment is 1 ÷ the frequency at that moment.' },
    { term: 'Final moment', meaning: 'the idealized end of the run, shortly before the two objects would meet. The meeting itself is not shown.' },
    { term: 'GW150914', meaning: 'the name of the first gravitational wave ever detected. "GW" stands for gravitational wave and the numbers are the date, 14 September 2015.' },
    { term: 'Hertz', meaning: 'swings per second.' },
    { term: 'Formula: strain at a moment', meaning: `amplitude × sin(phase), where the phase says how far through a swing the wave is (a full swing is 2π, about 6.28). Example, at the final moment of the mass ${EXAMPLE_MASS} run: the amplitude is ${f3(end.amplitude)} and the phase has reached ${swings.toFixed(2)} swings, where the sine is ${(end.strain / end.amplitude).toFixed(3)}, so the strain is ${f3(end.amplitude)} × ${(end.strain / end.amplitude).toFixed(3)} = ${f3(end.strain)}.` },
  ]
  if (done) {
    entries.push(
      { term: 'Formula: frequency', meaning: `starting frequency ÷ √(1 − time ÷ T), where T = 1 ÷ mass. Example, mass ${EXAMPLE_MASS}: T = ${f3(run.mergerTime)}; at time ${f3(run.cutoffTime)} the frequency is ${BASE_FREQUENCY.toFixed(3)} ÷ √(1 − ${f3(run.cutoffTime)} ÷ ${f3(run.mergerTime)}) = ${f3(end.frequency)}.` },
      { term: 'Formula: time to the final moment', meaning: `0.9 ÷ mass. Example, mass ${EXAMPLE_MASS}: 0.9 ÷ ${EXAMPLE_MASS} = ${f3(run.cutoffTime)} time units.` },
      { term: 'Formula: arm lengths', meaning: `Arm X = 1 + strain ÷ 2 and Arm Y = 1 − strain ÷ 2, so each arm moves by half the strain. Example, at the final moment of the mass ${EXAMPLE_MASS} run: strain ${f3(end.strain)} gives Arm X = ${f3(end.armXLength)} and Arm Y = ${f3(end.armYLength)}.` }
    )
  }
  return entries
}


const fixed3 = (value: number) => (Math.abs(value) < 1e-9 ? 0 : value).toFixed(3)

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)

const PITCH_SHORT: Record<PitchChoice, string> = {
  'speeds-up': 'the pitch speeds up',
  'slows-down': 'the pitch slows down',
  'stays-the-same': 'the pitch stays the same',
}
const LOUDNESS_SHORT: Record<LoudnessChoice, string> = {
  stronger: 'the wave gets stronger (louder)',
  weaker: 'the wave gets weaker',
  'stays-the-same': 'the wave stays the same strength',
}
const TIMING_SHORT: Record<TimingChoice, string> = {
  'small-mass': 'the small-mass pair reaches its final moment sooner',
  'large-mass': 'the large-mass pair reaches its final moment sooner',
  'same-time': 'they take the same time',
}

function GuessBox({ x, y, width, text }: { x: number; y: number; width: number; text: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={20} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
      <text x={x + 8} y={y + 14} fill={GUESS_COLOR} fontSize="11" fontWeight="bold">
        {text}
      </text>
    </g>
  )
}

function WhiteArrow({ x, baseY, height }: { x: number; baseY: number; height: number }) {
  const tip = baseY - height
  return (
    <g>
      <line x1={x} y1={baseY} x2={x} y2={tip + 5} stroke={GUESS_COLOR} strokeWidth={3} />
      <polygon points={`${x},${tip} ${x - 6},${tip + 9} ${x + 6},${tip + 9}`} fill={GUESS_COLOR} />
    </g>
  )
}

function WhiteBracket({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g stroke={GUESS_COLOR} strokeWidth={2.5}>
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} />
      <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} />
    </g>
  )
}

// ---- Picture 2 / Drawing B: the two arm lengths against time ----
const G = { width: 580, left: 62, right: 530, plotHeight: 180 }

export function ChirpGraph({
  mass,
  trace,
  time,
  started,
  pink,
  label,
  guesses = null,
  swing = null,
}: {
  mass: number
  trace: ReturnType<typeof chirpArmTrace>
  time: number
  started: boolean
  pink: boolean
  label: string
  // The learner's guesses 1 and 2, drawn in white once the run has finished (Picture 2 only).
  guesses?: { pitch: PitchChoice; loudness: LoudnessChoice } | null
  swing?: FirstAndLastSwing | null
}) {
  const summary = chirpRunSummary(mass)
  const half = graphHalfRange(mass)
  const yMin = BASE_ARM_LENGTH - half
  const yMax = BASE_ARM_LENGTH + half
  const total = summary.cutoffTime
  const top = 56
  const bottom = top + G.plotHeight
  const height = bottom + (pink ? 112 : 66)
  const px = (t: number) => G.left + (t / total) * (G.right - G.left)
  const py = (v: number) => bottom - ((v - yMin) / (yMax - yMin)) * G.plotHeight
  const shown = started ? trace.filter((point) => point.time <= time) : []
  const line = (axis: 'armXLength' | 'armYLength') => shown.map((point) => `${px(point.time)},${py(point[axis])}`).join(' ')
  const highest = Math.max(summary.armXMax, summary.armYMax)
  const lowest = Math.min(summary.armXMin, summary.armYMin)

  return (
    <svg width={G.width} height={height} viewBox={`0 0 ${G.width} ${height}`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Arm lengths against time
      </text>
      <g fontSize="11">
        <line x1={G.left} y1={36} x2={G.left + 22} y2={36} stroke={ARM_X_COLOR} strokeWidth={3} />
        <text x={G.left + 28} y={40} fill={TEXT_COLOR}>Arm X length</text>
        <line x1={G.left + 130} y1={36} x2={G.left + 152} y2={36} stroke={ARM_Y_COLOR} strokeWidth={3} />
        <text x={G.left + 158} y={40} fill={TEXT_COLOR}>Arm Y length</text>
        <line x1={G.left + 260} y1={36} x2={G.left + 282} y2={36} stroke={REST_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={G.left + 288} y={40} fill={TEXT_COLOR}>rest length 1.000</text>
      </g>
      {/* axes */}
      <line x1={G.left} y1={top} x2={G.left} y2={bottom} stroke={MUTED_COLOR} />
      <line x1={G.left} y1={bottom} x2={G.right} y2={bottom} stroke={MUTED_COLOR} />
      {[yMin, BASE_ARM_LENGTH, yMax].map((v) => (
        <g key={v}>
          <line x1={G.left - 4} y1={py(v)} x2={G.left} y2={py(v)} stroke={MUTED_COLOR} />
          <text x={G.left - 8} y={py(v) + 4} fill={MUTED_COLOR} fontSize="10" textAnchor="end">{v.toFixed(2)}</text>
        </g>
      ))}
      {[0, total].map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={bottom} x2={px(t)} y2={bottom + 4} stroke={MUTED_COLOR} />
          <text x={px(t)} y={bottom + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">{t === 0 ? '0' : `${t.toFixed(3)} (final moment)`}</text>
        </g>
      ))}
      <text x={(G.left + G.right) / 2} y={bottom + 32} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        time (time units)
      </text>
      <text x={12} y={(top + bottom) / 2} fill={MUTED_COLOR} fontSize="10" textAnchor="middle" transform={`rotate(-90 12 ${(top + bottom) / 2})`}>
        arm length (rest length = 1.000)
      </text>
      {/* the rest length */}
      <line x1={G.left} y1={py(BASE_ARM_LENGTH)} x2={G.right} y2={py(BASE_ARM_LENGTH)} stroke={REST_COLOR} strokeWidth={1.5} strokeDasharray="5 4" />
      {/* the two arms */}
      {shown.length > 1 && <polyline points={line('armXLength')} fill="none" stroke={ARM_X_COLOR} strokeWidth={2} />}
      {shown.length > 1 && <polyline points={line('armYLength')} fill="none" stroke={ARM_Y_COLOR} strokeWidth={2} />}
      {/* white: the learner's guesses 1 and 2, drawn once the run has finished; markers only, not measurements */}
      {guesses && swing && (() => {
        // Each mark is drawn only where the feature it sits beside exists: guess 1 needs a full first swing, guess 2 needs two peaks.
        const canPitch = swing.firstSwingLength < total - 1e-9
        const canLoud = swing.firstPeak !== null && swing.lastPeak !== null && swing.lastPeak.time > swing.firstPeak.time
        const baseY = py(BASE_ARM_LENGTH)
        const bracketY = bottom - 12
        const box1 = { x: G.left + 10, y: bottom - 50 }
        const box2 = { x: G.left + 10, y: top + 4 }
        return (
          <g>
            {canPitch && (() => {
              const secondLen = swing.firstSwingLength * pitchGuessRatio(guesses.pitch)
              const b1 = { a: px(0), b: px(swing.firstSwingLength) }
              const b2 = { a: px(Math.max(0, total - secondLen)), b: px(total) }
              return (
                <>
                  <WhiteBracket x1={b1.a} x2={b1.b} y={bracketY} />
                  <WhiteBracket x1={b2.a} x2={b2.b} y={bracketY} />
                  <g stroke={GUESS_COLOR} strokeWidth={1.5}>
                    <line x1={(b1.a + b1.b) / 2} y1={box1.y + 20} x2={(b1.a + b1.b) / 2} y2={bracketY - 7} />
                    <line x1={box1.x + 300} y1={box1.y + 12} x2={(b2.a + b2.b) / 2} y2={bracketY - 7} />
                  </g>
                  <GuessBox x={box1.x} y={box1.y} width={300} text={`YOUR GUESS 1: ${PITCH_SHORT[guesses.pitch]}`} />
                </>
              )
            })()}
            {canLoud && swing.firstPeak && swing.lastPeak && (() => {
              const h1 = (swing.firstPeak.armMove / (2 * half)) * G.plotHeight
              const h2 = h1 * loudnessGuessRatio(guesses.loudness)
              const x1 = px(swing.firstPeak.time)
              const x2 = px(swing.lastPeak.time)
              return (
                <>
                  <WhiteArrow x={x1} baseY={baseY} height={h1} />
                  <WhiteArrow x={x2} baseY={baseY} height={h2} />
                  <g stroke={GUESS_COLOR} strokeWidth={1.5}>
                    <line x1={x1} y1={box2.y + 20} x2={x1} y2={baseY - h1 - 2} />
                    <line x1={box2.x + 300} y1={box2.y + 10} x2={x2} y2={baseY - h2 - 2} />
                  </g>
                  <GuessBox x={box2.x} y={box2.y} width={300} text={`YOUR GUESS 2: ${LOUDNESS_SHORT[guesses.loudness]}`} />
                </>
              )
            })()}
          </g>
        )
      })()}
      {/* pink: the learner's own mass (Part 2), follow the slider */}
      {pink && (
        <g>
          <line x1={G.left} y1={py(highest)} x2={G.right} y2={py(highest)} stroke={YOURS_COLOR} strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={G.right} y={py(highest) - 4} fill={YOURS_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
            YOUR MASS: highest either arm reaches {highest.toFixed(3)}
          </text>
          <line x1={G.left} y1={py(lowest)} x2={G.right} y2={py(lowest)} stroke={YOURS_COLOR} strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={G.right} y={py(lowest) + 13} fill={YOURS_COLOR} fontSize="10" fontWeight="bold" textAnchor="end">
            YOUR MASS: lowest either arm reaches {lowest.toFixed(3)}
          </text>
          <line x1={px(0)} y1={bottom + 46} x2={px(total)} y2={bottom + 46} stroke={YOURS_COLOR} strokeWidth={2} />
          <line x1={px(0)} y1={bottom + 40} x2={px(0)} y2={bottom + 52} stroke={YOURS_COLOR} strokeWidth={2} />
          <line x1={px(total)} y1={bottom + 40} x2={px(total)} y2={bottom + 52} stroke={YOURS_COLOR} strokeWidth={2} />
          <text x={(G.left + G.right) / 2} y={bottom + 68} fill={YOURS_COLOR} fontSize="10" fontWeight="bold" textAnchor="middle">
            YOUR MASS: the final moment is at {total.toFixed(3)} time units; {summary.swings.toFixed(1)} swings in the run
          </text>
        </g>
      )}
    </svg>
  )
}

// ---- Picture 3: the time to the final moment for two pairs ----
const BARS = { width: 580, left: 30, right: 550, scaleMax: 3.2 }

export function TimeBars({ label, guess = null }: { label: string; guess?: TimingChoice | null }) {
  const rows = REFERENCE_PAIRS.map((mass, index) => ({
    mass,
    time: chirpRunSummary(mass).cutoffTime,
    title: index === 0 ? `A light pair: mass ${mass.toFixed(1)} (the pair you just watched)` : `A heavier pair: mass ${mass.toFixed(1)} (ten times heavier)`,
    color: index === 0 ? '#34d399' : '#fb923c',
  }))
  const px = (t: number) => BARS.left + (t / BARS.scaleMax) * (BARS.right - BARS.left)
  const axisY = 214
  return (
    <svg width={BARS.width} height={262} viewBox={`0 0 ${BARS.width} 262`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Time to the final moment for two pairs
      </text>
      {rows.map((row, index) => {
        const y = 52 + index * 86
        return (
          <g key={row.mass}>
            <text x={BARS.left} y={y} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">{row.title}</text>
            <rect x={BARS.left} y={y + 8} width={px(row.time) - BARS.left} height={28} fill={row.color} rx={3} />
            <text x={BARS.left} y={y + 54} fill={TEXT_COLOR} fontSize="11">
              final moment at {row.time.toFixed(3)} time units
            </text>
          </g>
        )
      })}
      {/* white: the learner's guess 3, drawn with the bars; a marker on the end of the bar(s) it names */}
      {guess && (() => {
        const targets = timingGuessTargets(guess)
        const diamond = (x: number, y: number) => (
          <polygon points={`${x},${y - 9} ${x + 9},${y} ${x},${y + 9} ${x - 9},${y}`} fill={GUESS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
        )
        const lightX = px(rows[0].time)
        const heavyX = px(rows[1].time)
        const lightY = 52 + 8 + 14
        const heavyY = 52 + 86 + 8 + 14
        const onLight = targets.includes(REFERENCE_PAIRS[0])
        const onHeavy = targets.includes(REFERENCE_PAIRS[1])
        const text = `YOUR GUESS 3: ${TIMING_SHORT[guess]}`
        const boxWidth = 420
        // one box: beside the heavier bar for "large-mass" and "same time"; in the gap under the light bar for "small-mass"
        const box = onHeavy ? { x: 130, y: heavyY - 10 } : { x: BARS.right - boxWidth, y: 110 }
        return (
          <g>
            <g stroke={GUESS_COLOR} strokeWidth={1.5}>
              {onHeavy && <line x1={heavyX + 10} y1={heavyY} x2={box.x} y2={heavyY} />}
              {onLight && !onHeavy && <line x1={lightX} y1={lightY + 10} x2={lightX} y2={box.y} />}
              {onLight && onHeavy && <line x1={lightX} y1={lightY + 10} x2={lightX} y2={box.y} />}
            </g>
            {onLight && diamond(lightX, lightY)}
            {onHeavy && diamond(heavyX, heavyY)}
            <GuessBox x={box.x} y={box.y} width={boxWidth} text={text} />
          </g>
        )
      })()}
      <line x1={BARS.left} y1={axisY} x2={BARS.right} y2={axisY} stroke={MUTED_COLOR} />
      {[0, 1, 2, 3].map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={axisY} x2={px(t)} y2={axisY + 4} stroke={MUTED_COLOR} />
          <text x={px(t)} y={axisY + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">{t}</text>
        </g>
      ))}
      <text x={(BARS.left + BARS.right) / 2} y={axisY + 34} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        time (time units)
      </text>
    </svg>
  )
}

// ---- Drawing C (Part 2): the time to the final moment for Part 1's pair and your pair ----
export function YourPairBars({ mass, guess, label }: { mass: number; guess: TimingChoice | null; label: string }) {
  const rows = [
    { mass: PART1_MASS, title: 'The Part 1 pair', color: '#34d399', titleColor: TEXT_COLOR },
    { mass, title: 'Your pair', color: YOURS_COLOR, titleColor: YOURS_COLOR },
  ].map((row) => ({ ...row, time: chirpRunSummary(row.mass).cutoffTime }))
  const scaleMax = Math.ceil(Math.max(rows[0].time, rows[1].time) / 0.5) * 0.5
  const px = (t: number) => BARS.left + (t / scaleMax) * (BARS.right - BARS.left)
  const targets = guess ? timingGuessTargetsBetween(guess, rows[0].mass, rows[1].mass) : []
  const rowTop = (i: number) => 52 + i * 100
  const axisY = 250
  const boxWidth = 420
  const ticks = Array.from({ length: Math.floor(scaleMax) + 1 }, (_, k) => k)
  return (
    <svg width={BARS.width} height={300} viewBox={`0 0 ${BARS.width} 300`} style={svgStyle} role="img" aria-label={label}>
      <text x={14} y={20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Time to the final moment: the Part 1 pair and your pair
      </text>
      {rows.map((row, i) => {
        const y0 = rowTop(i)
        const endX = px(row.time)
        const marked = targets.includes(i)
        const boxX = Math.min(Math.max(endX - 30, BARS.left), BARS.right - boxWidth)
        return (
          <g key={row.title}>
            <text x={BARS.left} y={y0} fill={row.titleColor} fontSize="12" fontWeight="bold">
              {row.title}: mass {row.mass.toFixed(1)}, final moment at {row.time.toFixed(3)} time units
            </text>
            <rect x={BARS.left} y={y0 + 8} width={Math.max(2, endX - BARS.left)} height={28} fill={row.color} rx={3} />
            {marked && guess && (
              <g>
                <line x1={endX} y1={y0 + 36} x2={endX} y2={y0 + 48} stroke={GUESS_COLOR} strokeWidth={1.5} />
                <polygon points={`${endX},${y0 + 13} ${endX + 9},${y0 + 22} ${endX},${y0 + 31} ${endX - 9},${y0 + 22}`} fill={GUESS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
                <GuessBox x={boxX} y={y0 + 48} width={boxWidth} text={`YOUR GUESS 3: ${TIMING_SHORT[guess]}`} />
              </g>
            )}
          </g>
        )
      })}
      <line x1={BARS.left} y1={axisY} x2={BARS.right} y2={axisY} stroke={MUTED_COLOR} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={axisY} x2={px(t)} y2={axisY + 4} stroke={MUTED_COLOR} />
          <text x={px(t)} y={axisY + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">{t}</text>
        </g>
      ))}
      <text x={(BARS.left + BARS.right) / 2} y={axisY + 34} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        time (time units)
      </text>
    </svg>
  )
}

export function YourPairBarsCaption({ yours, guess }: { yours: ChirpRunSummary; guess: TimingChoice | null }) {
  const part1 = chirpRunSummary(PART1_MASS)
  const same = yours.mass === PART1_MASS
  const lighterIsPart1 = PART1_MASS < yours.mass
  const targets = guess ? timingGuessTargetsBetween(guess, PART1_MASS, yours.mass) : []
  const targetNames = targets.map((i) => (i === 0 ? 'green bar (the Part 1 pair)' : 'pink bar (your pair)')).join(' and the ')
  const targetTimes = targets.map((i) => fixed3(i === 0 ? part1.cutoffTime : yours.cutoffTime)).join(' and ')
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read Drawing C.</strong> It compares how long two pairs take to reach their final moment, on one time scale: the
        pair you watched in Part 1 and the pair you chose with the slider.
      </p>
      <ul style={bulletList}>
        <li>
          <strong>The green bar</strong> is the Part 1 pair, mass {PART1_MASS.toFixed(1)}. <strong>The pink bar</strong> is your pair, with the mass
          on the slider. Pink always means your own choice, so the pink bar follows the slider and moves as soon as you move it.
        </li>
        <li>
          <strong>The right-hand end of a bar</strong> is that pair&rsquo;s final moment, where its run would stop. <strong>A shorter bar</strong>{' '}
          means a final moment that comes sooner. The title above each bar gives its mass and its final moment.
        </li>
        <li>
          <strong>The scale along the bottom</strong> is time in time units. It stretches to fit the longer bar.
        </li>
        {guess && (
          <li>
            <strong>The white diamond and the YOUR GUESS 3 box</strong> are your guess about which pair reaches its final moment sooner.
            Your answer named &ldquo;the small-mass pair&rdquo; or &ldquo;the large-mass pair&rdquo;, so on this drawing the smaller of the two
            masses is the small-mass pair:{' '}
            {same
              ? 'the two masses are equal here, so the diamond sits on both bars'
              : lighterIsPart1
                ? 'the Part 1 pair is the small-mass pair and your pair is the large-mass pair'
                : 'your pair is the small-mass pair and the Part 1 pair is the large-mass pair'}
            . The diamond is only a marker: it does not say how much sooner, it does not say whether you were right, and it never
            changes the bars.
          </li>
        )}
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong> Both bars are drawn as soon as Part 2 opens and follow the slider, because they are
        worked out, not played. Your guess is drawn with them.
      </p>
      <p style={paragraph}>
        <strong>A worked moment.</strong> The Part 1 pair&rsquo;s final moment is 0.9 ÷ {PART1_MASS.toFixed(1)} = {fixed3(part1.cutoffTime)} time units.
        Your pair&rsquo;s, at mass {yours.mass.toFixed(1)}, is 0.9 ÷ {yours.mass.toFixed(1)} = {fixed3(yours.cutoffTime)}.{' '}
        {same
          ? 'The two masses are equal, so the two times are equal and the bars are the same length.'
          : yours.mass > PART1_MASS
            ? `Your pair is ${(yours.mass / PART1_MASS).toFixed(1)} times as heavy and reaches its final moment ${(part1.cutoffTime / yours.cutoffTime).toFixed(1)} times sooner.`
            : `Your pair is ${(PART1_MASS / yours.mass).toFixed(1)} times as light and reaches its final moment ${(yours.cutoffTime / part1.cutoffTime).toFixed(1)} times later.`}
      </p>
      <LookFor
        items={[
          {
            look: 'the pink bar against the green bar.',
            means: `the green bar ends at ${fixed3(part1.cutoffTime)} and the pink bar at ${fixed3(yours.cutoffTime)}.`,
            matters: 'it shows how a different mass changes the time to the final moment; move the slider and watch the pink bar grow or shrink while the green one stays put.',
          },
          ...(guess
            ? [
                {
                  look: 'the white diamond and the YOUR GUESS 3 box, beside the ends of the bars.',
                  means: `you guessed that ${TIMING_SHORT[guess]}. On this drawing that puts the diamond at the end of the ${targetNames}, at ${targetTimes}.`,
                  matters: 'the tutor marks this guess in Part 4. Until then you can set the diamond beside the real ends of the bars and compare them for yourself.',
                },
              ]
            : []),
        ]}
      />
      <WhereFrom
        measured="nothing in this picture is a measurement."
        calculated="each bar is the run's final-moment time from the same simplified formula as the other pictures (0.9 divided by the mass). Neither pair is played here: both times are calculated."
        imagined={`the two pairs and their masses, on this page's made-up mass scale. The pink bar is your own mass, a trial value, and does not say that a real pair is like that.${guess ? ' The white diamond and box are your guess, drawn only as a marker; they are not part of the calculation.' : ''}`}
      />
    </div>
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
        <strong>Frequency (pitch):</strong> how many full swings the arms make in one time unit, at this instant. The
        higher the number, the higher the pitch. One swing at this instant lasts 1 ÷ the frequency.
      </li>
      <li>
        <strong>Amplitude (loudness):</strong> the biggest strain the wave is reaching at this instant.
      </li>
      <li>
        <strong>Strain:</strong> a plain number saying how strongly the wave is acting on space at this instant. 0 means
        the wave is doing nothing at this instant; the bigger the number, positive or negative, the stronger its effect.
      </li>
    </ul>
  )
}

// ---- Captions (CLAUDE.md §14, "Animated Diagrams"): how to read, a worked moment, what to look for, where it comes from ----
const captionBox = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' } as const
const bulletList = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const

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

export function ArmsCaption({ name, summary, done, pink }: { name: string; summary: ChirpRunSummary; done: boolean; pink: boolean }) {
  const half = Math.abs(summary.finalStrain) / 2
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong> It shows the two arms of a small gravitational-wave detector, seen from above, drawn
        the way a real one is built: two arms at a right angle, meeting at a corner.
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
          <strong>The dashed amber lines and the small amber ticks, "rest length 1.000"</strong>, show how long each arm is when no
          wave is passing. Every length on this page is a fraction of the rest length, so 1.000 means exactly the rest length and,
          for example, 1.014 would mean 1.4 percent longer.
        </li>
        <li>
          <strong>The numbers under the picture</strong> change live: frequency, amplitude, strain and the two arm lengths, as
          defined in the list beneath them.
        </li>
        {pink && (
          <li>
            <strong>No pink marks are drawn on this picture.</strong> Pink always means your own choice, and the pink marks for your
            mass are on Drawing B below. Here, your mass shows up as how far the dots move and for how long the run lasts.
          </li>
        )}
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong> Before a run nothing moves and the arms lie on their ticks (strain 0.000). While the
        run plays, which takes 8 seconds on your screen whatever the mass, the dots move away from their ticks and back. When it
        has finished, the dots are where the wave left them at the final moment: not necessarily back on the ticks, because the run
        ends part-way through a swing.
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
                matters: 'these two numbers are the pitch and the loudness, the two things that Predictions 1 and 2 asked about.',
              },
              {
                look: 'the dots at the very end of the run, next to their amber ticks.',
                means: `Arm X is at ${fixed3(summary.finalArmXLength)} and Arm Y at ${fixed3(summary.finalArmYLength)}, not on the ticks at 1.000.`,
                matters: 'the run stops at an idealized final moment, part-way through a swing, so the wave is still acting on the arms when the picture ends.',
              },
            ]}
          />
        </>
      )}
      <WhereFrom
        measured="nothing in this picture is a measurement. What real detectors measured is described under &ldquo;A real chirp&rdquo; in Part 3."
        calculated={`the arm lengths, from a simplified formula this page uses to stand in for a real inspiral, with a made-up mass of ${summary.mass.toFixed(1)}.`}
        imagined={`the pair itself and its mass of ${summary.mass.toFixed(1)}, on this page's made-up mass scale${pink ? ' (your own choice, in pink)' : ''}. The size of the effect is also hugely exaggerated, so that you can see it.`}
      />
    </div>
  )
}

export function GraphCaption({
  name,
  summary,
  done,
  pink,
  swing,
  half,
  guesses = null,
}: {
  name: string
  summary: ChirpRunSummary
  done: boolean
  pink: boolean
  swing: ReturnType<typeof firstAndLastSwing>
  half: number
  guesses?: { pitch: PitchChoice; loudness: LoudnessChoice } | null
}) {
  const first = swing.firstPeak
  const last = swing.lastPeak
  const canPitch = swing.firstSwingLength < summary.cutoffTime - 1e-9
  const canLoud = first !== null && last !== null && last.time > first.time
  // The peak sizes are shown to four places, and the ratio is taken from the shown numbers so that they agree.
  const r4 = (value: number) => Math.round(value * 1e4) / 1e4
  const peakRatio = first && last ? (r4(last.armMove) / r4(first.armMove)).toFixed(1) : ''
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read {name}.</strong> It is a graph of both arm lengths against time while the run plays.
      </p>
      <ul style={bulletList}>
        <li>
          <strong>The side axis</strong> is arm length, as a fraction of the rest length. It is zoomed to this run, so it only
          covers {fixed3(1 - half)} to {fixed3(1 + half)}: read the numbers on it. On the scale of Experiment 1&rsquo;s graph these
          wiggles would be a hair-thin line.
        </li>
        <li>
          <strong>The bottom axis</strong> is time in time units, from 0 to the <strong>final moment</strong>, {fixed3(summary.cutoffTime)},
          where the run stops.
        </li>
        <li>
          <strong>The violet line</strong> is Arm X and <strong>the cyan line</strong> is Arm Y. <strong>The dashed amber line</strong> is
          the rest length, 1.000.
        </li>
        <li>
          <strong>Each wiggle</strong>, one trip up and back down, is one swing.
        </li>
        {pink && (
          <>
            <li>
              <strong>The two pink dashed lines</strong>, &ldquo;YOUR MASS: highest&rdquo; and &ldquo;YOUR MASS: lowest&rdquo;, mark the
              highest and the lowest length that either arm reaches at any time in your run.
            </li>
            <li>
              <strong>The pink bracket under the time axis</strong> spans the whole run and says when the final moment is and how
              many swings the run holds.
            </li>
          </>
        )}
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong>{' '}
        {pink
          ? 'The axes and the pink marks follow the mass slider, so they change as you move it, before you run. The violet and cyan lines are drawn from left to right when you press Run your mass, and only for the mass you ran.'
          : `The two lines are drawn from left to right as the run plays.${guesses ? ' When the run has finished, your guesses 1 and 2 are drawn on the graph in white (where the run is long enough to have something to put them beside).' : ''}`}
      </p>
      {pink && !done && (
        <>
          <p style={paragraph}>
            <strong>A worked moment (mass {summary.mass.toFixed(1)}).</strong> The final moment is 0.9 ÷ {summary.mass.toFixed(1)} ={' '}
            {fixed3(summary.cutoffTime)} time units, and in that time the arms make {summary.swings.toFixed(2)} swings, so the pink bracket
            reads &ldquo;{fixed3(summary.cutoffTime)} time units; {summary.swings.toFixed(1)} swings&rdquo;.
          </p>
          <LookFor
            items={[
              {
                look: 'the pink dashed lines and the numbers on the side axis.',
                means: `at mass ${summary.mass.toFixed(1)} the arms will reach as high as ${fixed3(Math.max(summary.armXMax, summary.armYMax))} and as low as ${fixed3(Math.min(summary.armXMin, summary.armYMin))}, and the side axis spans ${fixed3(1 - half)} to ${fixed3(1 + half)}.`,
                matters: 'a heavier pair is louder overall, so the arms move further and the axis stretches to fit; check the numbers on the axis before comparing two masses by eye.',
              },
              {
                look: 'the pink bracket under the time axis.',
                means: `a run at this mass lasts ${fixed3(summary.cutoffTime)} time units and holds ${summary.swings.toFixed(1)} swings.`,
                matters: 'mass sets how long the chirp lasts, so a heavier pair leaves less time, and fewer swings, to hear it.',
              },
            ]}
          />
          <p style={paragraph}>Press Run your mass to draw the violet and cyan lines, then more things to look at appear here.</p>
        </>
      )}
      {done && (
        <>
          <p style={paragraph}>
            <strong>A worked moment{pink ? ` (mass ${summary.mass.toFixed(1)})` : ''}.</strong> The final moment is 0.9 ÷ {summary.mass.toFixed(1)} ={' '}
            {fixed3(summary.cutoffTime)}.{' '}
            {first && last ? (
              <>
                The first swing takes about {swing.firstSwingLength.toFixed(2)} time units. By the final moment one swing takes only about{' '}
                {swing.lastSwingLength.toFixed(2)} (1 ÷ {fixed3(summary.endFrequency)}). The first peak, at time {first.time.toFixed(2)}, is about{' '}
                {r4(first.armMove).toFixed(4)} from rest and the last peak, at time {last.time.toFixed(2)}, is about {r4(last.armMove).toFixed(4)}, so the arms move about{' '}
                {peakRatio} times as far. Over the whole run the arms make {summary.swings.toFixed(1)} swings.
              </>
            ) : (
              <>
                The run holds only {summary.swings.toFixed(2)} of a swing, less than a quarter, so the lines never reach a peak: Arm X rises to{' '}
                {fixed3(summary.finalArmXLength)} and Arm Y falls to {fixed3(summary.finalArmYLength)} and the run stops.
              </>
            )}
          </p>
          {guesses && !canPitch && !canLoud && (
            <p style={paragraph}>
              <strong>Your guesses 1 and 2 are not drawn on this graph.</strong> At mass {summary.mass.toFixed(1)} the run holds only{' '}
              {summary.swings.toFixed(2)} of a swing, so there is no full first swing and no pair of peaks to put them beside. Try a
              lighter mass to see them here. Your guesses are unchanged, and they are still drawn on Picture 2 in Part 1.
            </p>
          )}
          {guesses && (canPitch || canLoud) && (
            <>
              <p style={paragraph}>
                <strong>The white marks are your guesses.</strong> Each is in a white box labelled YOUR GUESS and joined to its mark by a
                line. A white mark shows only what you guessed: it does not say whether you were right, and it never changes the real
                lines. Your choices have no size of their own, so the marks are only markers.{' '}
                {!canPitch || !canLoud
                  ? `At mass ${summary.mass.toFixed(1)} the run holds ${summary.swings.toFixed(2)} swings, so only ${canPitch ? 'guess 1' : 'guess 2'} has something to sit beside and is drawn.`
                  : ''}
              </p>
              <ul style={bulletList}>
                {canPitch && (<li>
                  <strong>YOUR GUESS 1 (the pitch)</strong> is two <strong>white brackets</strong> along the bottom of the graph. The
                  first is as long as the real first swing ({swing.firstSwingLength.toFixed(2)} time units). The second sits at the end
                  of the run and is half as long, twice as long or the same length as the first, for a guess that the pitch speeds up,
                  slows down or stays the same. It shows the direction of your guess, not how much.
                </li>)}
                {canLoud && (<li>
                  <strong>YOUR GUESS 2 (the loudness)</strong> is two <strong>white arrows</strong> standing on the amber rest line. The
                  first is as tall as the real first peak. The second, near the end of the run, is twice as tall, half as tall or the
                  same, for a guess that the wave gets stronger, gets weaker or stays the same strength. Again it shows the direction of
                  your guess, not how much.
                </li>)}
              </ul>
            </>
          )}
          <LookFor
            items={[
              ...(guesses && canPitch
                ? [
                    {
                      look: 'the white brackets of YOUR GUESS 1, along the bottom, beside the real wiggles above them.',
                      means: `you guessed that ${PITCH_SHORT[guesses.pitch]}. The real first swing takes ${swing.firstSwingLength.toFixed(2)} time units and one swing at the final moment ${swing.lastSwingLength.toFixed(2)}.`,
                      matters: 'the tutor marks this guess in Part 4. Until then the picture lets you set your marker beside the real swings and compare them for yourself.',
                    },
                  ]
                : []),
              ...(guesses && canLoud && first && last
                ? [
                    {
                      look: 'the white arrows of YOUR GUESS 2, standing on the rest line, beside the real peaks.',
                      means: `you guessed that ${LOUDNESS_SHORT[guesses.loudness]}. The real first peak is ${r4(first.armMove).toFixed(4)} from rest and the last is ${r4(last.armMove).toFixed(4)}.`,
                      matters: 'the tutor marks this guess in Part 4. Until then you can compare the height of your arrow with the height of the real peak next to it.',
                    },
                  ]
                : []),
              ...(first && last
                ? [
                    {
                      look: 'the width of the wiggles from the left of the graph to the right.',
                      means: `the first swing takes about ${swing.firstSwingLength.toFixed(2)} time units and one swing at the final moment about ${swing.lastSwingLength.toFixed(2)}, so the wiggles are packed closer together towards the right.`,
                      matters: 'how long one swing takes is 1 ÷ the frequency, so this is what the pitch looks like on a graph: the thing Prediction 1 asked about.',
                    },
                    {
                      look: 'the height of the wiggles from the left of the graph to the right.',
                      means: `the first peak is about ${r4(first.armMove).toFixed(4)} from the rest line and the last about ${r4(last.armMove).toFixed(4)}, about ${peakRatio} times as far.`,
                      matters: 'how far the arms move is set by the amplitude, so this is what the loudness looks like on a graph: the thing Prediction 2 asked about.',
                    },
                  ]
                : [
                    {
                      look: 'the two lines from the start to the end.',
                      means: `they only drift away from the rest line, Arm X up to ${fixed3(summary.finalArmXLength)} and Arm Y down to ${fixed3(summary.finalArmYLength)}, without a full wiggle.`,
                      matters: 'at this mass the run is over before the arms complete even a quarter of a swing, so the change of pitch cannot be seen: this is why Part 1 uses a lighter pair.',
                    },
                  ]),
              {
                look: 'the right-hand end of the graph, where the lines stop.',
                means: `the run stops at the final moment, ${fixed3(summary.cutoffTime)}, with Arm X at ${fixed3(summary.finalArmXLength)} and Arm Y at ${fixed3(summary.finalArmYLength)}, part-way through a swing.`,
                matters: 'the stop is an idealized cutoff just before the two objects would meet; the meeting itself is not shown.',
              },
              {
                look: 'the violet and cyan lines against the dashed amber line.',
                means: 'the two lines are mirror images about the rest line: at every moment one arm is as far above 1.000 as the other is below it.',
                matters: 'a detector compares its two arms, so it is the difference between them that carries the wave.',
              },
              ...(pink
                ? [
                    {
                      look: 'the pink dashed lines and the numbers on the side axis.',
                      means: `at your mass the arms reach as high as ${fixed3(Math.max(summary.armXMax, summary.armYMax))} and as low as ${fixed3(Math.min(summary.armXMin, summary.armYMin))}, and the side axis spans ${fixed3(1 - half)} to ${fixed3(1 + half)}.`,
                      matters: 'a heavier pair is louder overall, so the arms move further and the axis stretches to fit; check the numbers on the axis before comparing two runs by eye.',
                    },
                    {
                      look: 'the pink bracket under the time axis.',
                      means: `your run lasts ${fixed3(summary.cutoffTime)} time units and holds ${summary.swings.toFixed(1)} swings.`,
                      matters: 'mass sets how long the chirp lasts, so a heavier pair leaves less time, and fewer swings, to hear it.',
                    },
                  ]
                : []),
            ]}
          />
        </>
      )}
      <WhereFrom
        measured="nothing in this picture is a measurement."
        calculated={`both lines, from the same simplified formula as ${pink ? 'Drawing A' : 'Picture 1'}, with a made-up mass of ${summary.mass.toFixed(1)}. They stand in for a real inspiral and are not LIGO's equations.${pink ? ' The pink marks are numbers worked out from your mass.' : ''}`}
        imagined={`the pair and its mass${pink ? '. The pink marks are your own mass, a trial value, and do not say that a real pair is like that' : ''}.${guesses ? ' The white marks and boxes are your guesses, drawn only as markers; they are not part of the calculation.' : ''}`}
      />
    </div>
  )
}

export function BarsCaption({ light, heavy, done, guess = null }: { light: ChirpRunSummary; heavy: ChirpRunSummary; done: boolean; guess?: TimingChoice | null }) {
  return (
    <div style={captionBox}>
      <p style={paragraph}>
        <strong>How to read Picture 3.</strong> It compares how long two different pairs take to reach their final moment, on one
        time scale.
      </p>
      <ul style={bulletList}>
        <li>
          <strong>The green bar</strong> is a light pair, mass {light.mass.toFixed(1)}: the pair you just watched.{' '}
          <strong>The orange bar</strong> is a heavier pair, mass {heavy.mass.toFixed(1)}, ten times heavier. They were chosen ten times
          apart so that any difference is easy to see. Mass is a made-up scale, not real Suns.
        </li>
        <li>
          <strong>The right-hand end of a bar</strong> is that pair&rsquo;s final moment: the idealized point where its run would stop.{' '}
          <strong>A shorter bar</strong> means a final moment that comes sooner.
        </li>
        <li>
          <strong>The scale along the bottom</strong> is time in time units, from 0 to 3.2. The bar colours are not the arm colours
          of the other pictures: they only tell the two pairs apart.
        </li>
      </ul>
      <p style={paragraph}>
        <strong>What you see, and when.</strong> Both bars appear when you press Run. Only the light pair is played in the arms. The
        heavier pair&rsquo;s bar is calculated and is not played.
      </p>
      {done && (
        <>
          <p style={paragraph}>
            <strong>A worked moment.</strong> The light pair&rsquo;s final moment is 0.9 ÷ {light.mass.toFixed(1)} = {fixed3(light.cutoffTime)} time
            units. The heavier pair&rsquo;s is 0.9 ÷ {heavy.mass.toFixed(1)} = {fixed3(heavy.cutoffTime)}. {fixed3(light.cutoffTime)} ÷ {fixed3(heavy.cutoffTime)} ={' '}
            {(light.cutoffTime / heavy.cutoffTime).toFixed(0)}: a pair ten times heavier reaches its final moment ten times sooner. In those
            times the light pair makes {light.swings.toFixed(1)} swings and the heavier pair {heavy.swings.toFixed(2)} of a swing.
          </p>
          {guess && (
            <p style={paragraph}>
              <strong>The white diamond is your guess.</strong> It sits at the end of the bar of the pair you said reaches its final moment
              sooner (at the end of both bars if you said they take the same time), and its box, YOUR GUESS 3, is joined to it by a line.
              It shows only what you guessed: it does not say whether you were right, it does not say how much sooner, and it never
              changes the bars.
            </p>
          )}
          <LookFor
            items={[
              ...(guess
                ? [
                    {
                      look: 'the white diamond and the YOUR GUESS 3 box, beside the ends of the bars.',
                      means: `you guessed that ${TIMING_SHORT[guess]}. The green bar ends at ${fixed3(light.cutoffTime)} and the orange bar at ${fixed3(heavy.cutoffTime)}.`,
                      matters: 'the tutor marks this guess in Part 4. Until then you can set the diamond beside the real ends of the bars and compare them for yourself.',
                    },
                  ]
                : []),
              {
                look: 'the length of the green bar against the orange bar.',
                means: `the green bar ends at ${fixed3(light.cutoffTime)} and the orange bar at ${fixed3(heavy.cutoffTime)}, so the heavier pair's final moment comes first.`,
                matters: 'this is the comparison that Prediction 3 asked about: which of the two pairs reaches its final moment sooner.',
              },
              {
                look: 'the scale under the bars, next to where each bar ends.',
                means: `the orange bar is only a tenth as long: ${fixed3(heavy.cutoffTime)} against ${fixed3(light.cutoffTime)} time units.`,
                matters: 'in this model ten times the mass gives one tenth of the time, so mass has a very large effect on how long the whole chirp lasts.',
              },
            ]}
          />
        </>
      )}
      <WhereFrom
        measured="nothing in this picture is a measurement."
        calculated={`each bar is the run's final-moment time from the same simplified formula as the other pictures (0.9 divided by the mass). The heavier pair is not played: its time is calculated.`}
        imagined={`the two pairs and their masses, on this page's made-up mass scale.${guess ? ' The white diamond and box are your guess, drawn only as a marker; they are not part of the calculation.' : ''}`}
      />
    </div>
  )
}

function GuessTag({ n }: { n: 1 | 2 | 3 }) {
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

const superscript = (n: number) => String(n).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('')

function Block({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: '1rem' }}>{children}</div>
}

const pitchChoices: Array<{ value: PitchChoice; label: string }> = [
  { value: 'speeds-up', label: 'Speeds up' },
  { value: 'slows-down', label: 'Slows down' },
  { value: 'stays-the-same', label: 'Stays the same' },
]

const loudnessChoices: Array<{ value: LoudnessChoice; label: string }> = [
  { value: 'stronger', label: 'Gets stronger (louder)' },
  { value: 'weaker', label: 'Gets weaker' },
  { value: 'stays-the-same', label: 'Stays the same strength' },
]

const timingChoices: Array<{ value: TimingChoice; label: string }> = [
  { value: 'small-mass', label: 'The small-mass pair' },
  { value: 'large-mass', label: 'The large-mass pair' },
  { value: 'same-time', label: 'They take the same time' },
]

function PredictionQuestion<Choice extends string>({
  prompt,
  choices,
  selected,
  submitted,
  onSelect,
  disabled,
}: {
  prompt: string
  choices: Array<{ value: Choice; label: string }>
  selected: Choice | null
  submitted: Choice | null
  onSelect: (choice: Choice) => void
  disabled: boolean
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {choices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{ marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected || submitted
          ? `Your prediction: ${choices.find((c) => c.value === (selected ?? submitted))!.label}`
          : 'Choose an option to continue'}
      </p>
    </div>
  )
}


export function GravitationalWaveChirpExperiment({ onComplete, onTutorComplete }: GravitationalWaveChirpExperimentProps) {
  const [mass, setMass] = useState(0.5)
  const [runMass, setRunMass] = useState(0.5)
  const part1 = useRunner(onComplete)
  const part2 = useRunner()
  const [part1RunId, setPart1RunId] = useState(0)
  const previousRunRef = useRef<ChirpRunSummary | null>(null)
  const [comparison, setComparison] = useState<{ current: ChirpRunSummary; previous: ChirpRunSummary } | null>(null)

  const [pitchPrediction, setPitchPrediction] = useState<PitchChoice | null>(null)
  const [loudnessPrediction, setLoudnessPrediction] = useState<LoudnessChoice | null>(null)
  const [timingPrediction, setTimingPrediction] = useState<TimingChoice | null>(null)
  const [submitted, setSubmitted] = useState<{ pitch: PitchChoice; loudness: LoudnessChoice; timing: TimingChoice } | null>(null)

  const hasAllPredictions = pitchPrediction !== null && loudnessPrediction !== null && timingPrediction !== null
  const part1Running = part1.status === 'running'
  const part1Started = part1.status !== 'idle'
  const part1Done = part1.status === 'complete'
  const part2Running = part2.status === 'running'
  // The drawn lines belong to the mass that was run; if the slider has moved on, the drawings show the new mass at rest.
  const ranHere = part2.status !== 'idle' && runMass === mass
  const part2Done = part2.status === 'complete' && runMass === mass

  const part1Trace = useMemo(() => chirpArmTrace(PART1_MASS), [])
  const part2Trace = useMemo(() => chirpArmTrace(mass), [mass])
  const part1Summary = useMemo(() => chirpRunSummary(PART1_MASS), [])
  const checkUp = useMemo(() => chirpCheckUp(), [])
  const part1Swing = useMemo(() => firstAndLastSwing(PART1_MASS), [])
  const heavySummary = useMemo(() => chirpRunSummary(REFERENCE_PAIRS[1]), [])
  const part2Summary = useMemo(() => chirpRunSummary(mass), [mass])
  const part2Swing = useMemo(() => firstAndLastSwing(mass), [mass])

  const part1Time = part1Started ? part1.time : 0
  const part2Time = ranHere ? part2.time : 0
  const part1State = chirpStateAt(Math.min(part1Time, part1Summary.cutoffTime), PART1_MASS, BASE_FREQUENCY, BASE_AMPLITUDE)
  const part2State = chirpStateAt(Math.min(part2Time, part2Summary.cutoffTime), mass, BASE_FREQUENCY, BASE_AMPLITUDE)

  const handleRunPart1 = () => {
    if (!hasAllPredictions || part1Running || part2Running) return
    if (!submitted) setSubmitted({ pitch: pitchPrediction!, loudness: loudnessPrediction!, timing: timingPrediction! })
    previousRunRef.current = part1Summary
    setComparison(null)
    part2.reset()
    setPart1RunId((id) => id + 1)
    part1.start(part1Summary.cutoffTime)
  }

  const handleRunPart2 = () => {
    if (!part1Done || part2Running) return
    const summary = chirpRunSummary(mass)
    const previous = previousRunRef.current
    setComparison(previous && previous.mass !== mass ? { current: summary, previous } : null)
    previousRunRef.current = summary
    setRunMass(mass)
    part2.start(summary.cutoffTime)
  }

  // Start over: the learner can answer the three questions again. Clears both runs, Part 2's mass and the tutor.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    previousRunRef.current = null
    setComparison(null)
    setSubmitted(null)
    setPitchPrediction(null)
    setLoudnessPrediction(null)
    setTimingPrediction(null)
    setMass(0.5)
    setRunMass(0.5)
  }

  const locked = submitted !== null

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 2 — The Chirp: A Wave That Builds</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>The question.</strong> The last experiment, &ldquo;Ripples in Spacetime&rdquo;, showed a gravitational wave
            arriving at one steady pitch and loudness. But a real wave from two massive objects
            spiralling into each other might not stay steady. Does it change as the two objects get
            closer together, right up until they meet?
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What a gravitational wave is, in short.</strong> In the last experiment, &ldquo;Ripples in Spacetime&rdquo;, you saw that when something
            very heavy moves violently, the shape of spacetime around it changes, and that change
            travels outward at the speed of light as a ripple called a gravitational wave. When the
            ripple passes, it stretches and squeezes the space it goes through, so two detector arms
            set at a right angle change length a tiny amount. There the wave came at one steady
            strength and speed. Here the wave comes from something more specific: a pair of very
            heavy objects circling each other.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Two heavy objects spiralling together.</strong> Some of the strongest gravitational waves come from two black holes. A black hole is an
            object so dense that its gravity lets nothing, not even light, escape from it. Mass is
            how much matter an object has, and the more mass it has, the stronger its gravity. Two
            black holes can be locked in orbit around each other. An orbit is a path where one
            object keeps going around another, like the Moon going around the Earth. As the pair
            circle, they send out gravitational waves, and those waves carry energy away. Losing
            energy makes the two slowly draw closer together, so their path is a spiral: a path that
            goes round and round while the circle gets smaller, like the groove on a vinyl record or
            the shell of a snail. This closing-in is called an inspiral. It ends when the two
            objects meet and merge into one.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>A real example.</strong> The first gravitational wave ever detected reached the LIGO detectors in the United
            States on 14 September 2015. It came from two black holes that spiralled together and
            merged about 1.3 billion light-years away (a light-year is the distance light travels in
            one year). The part of the signal that LIGO recorded from the end of their inspiral
            lasted only two-tenths of a second.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What a chirp is.</strong> Scientists call the wave from an inspiral a &ldquo;chirp&rdquo;. The name comes from sound:
            LIGO can turn the signals from its arms into an audible sound, and that sound is called
            a chirp. Scientists use the same word for the wave itself. This page does not play any
            sound. What the wave is like as the pair draws closer, and how it changes if it does, is
            what you will predict and then watch in the arms.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What pitch and loudness mean here.</strong> A gravitational wave is not a sound, but we can talk about it the way we talk about
            sound. Pluck a guitar string. How fast the string shakes decides the note: a slow shake
            is a low note and a fast shake is a high note. That is the pitch. How far the string
            swings decides how loud it is: a small swing is quiet and a big swing is loud. For the
            detector arms below, pitch means how fast they stretch and squeeze, and loudness means
            how far.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>What happens.</strong> You&rsquo;ll watch the same L-shaped detector arms as before, now driven by a wave from two
            massive objects, such as black holes, that are spiralling toward each other. The run ends
            at an idealized &ldquo;final moment&rdquo;, just before they would meet; the meeting itself
            is not shown. Before you press Run, you&rsquo;ll predict what happens to the wave&rsquo;s
            pitch and loudness as the run goes on, and which of two pairs, one light (less mass) and
            one heavy (more mass), reaches its final moment sooner.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Your job.</strong> Try a small mass and a large mass, and watch how the wave's
            pitch, loudness, and the time it takes to reach its final moment change.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each
            one, with a short plain meaning: gravitational wave, black hole, mass, orbit, spiral,
            inspiral, chirp, light-year, LIGO, pitch, loudness, strain, swing, final moment,
            GW150914 and hertz.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Everything &ldquo;Ripples in Spacetime&rdquo; assumed still applies here: the effect is hugely
              exaggerated, only one wave pattern is shown, and no real detection hardware is
              modeled.
            </li>
            <li>
              The exact moment the two objects meet, and everything after it, isn't modeled — the
              run simply stops at an idealized cutoff shortly before that point.
            </li>
            <li>
              The relationship between mass and how quickly the wave builds is a simplified,
              explicitly-labeled stand-in for the real physics, not the actual equations that
              govern a real inspiral.
            </li>
            <li>
              The mass control reuses the made-up mass scale of the black hole experiment in the
              Gravity and Curved Spacetime chapter, not real solar masses.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries(part1Done)} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. The original
            scientific paper is linked under &ldquo;A real chirp&rdquo; in the results, after the run.
            Checked on 4 and 6 November 2026. Each link opens in a new tab.
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
          First you make three predictions: what happens to the wave&rsquo;s pitch, what happens to its loudness, and which of
          two pairs reaches its final moment sooner. Then you press Run and watch a light pair&rsquo;s wave pass through the
          arms. Your guesses are drawn on the pictures in white once each picture is drawn.
        </PartHeader>

        <PredictionQuestion
          prompt="As the two objects spiral closer together, do you think the wave's pitch (how fast it oscillates) speeds up, slows down, or stays the same?"
          choices={pitchChoices}
          selected={pitchPrediction}
          submitted={submitted?.pitch ?? null}
          onSelect={setPitchPrediction}
          disabled={locked}
        />
        <PredictionQuestion
          prompt="Do you think the wave also gets stronger (louder) as it approaches the final moment, gets weaker, or stays the same strength?"
          choices={loudnessChoices}
          selected={loudnessPrediction}
          submitted={submitted?.loudness ?? null}
          onSelect={setLoudnessPrediction}
          disabled={locked}
        />
        <PredictionQuestion
          prompt="If you compare a small-mass pair to a large-mass pair, which one reaches its final moment sooner?"
          choices={timingChoices}
          selected={timingPrediction}
          submitted={submitted?.timing ?? null}
          onSelect={setTimingPrediction}
          disabled={locked}
        />

        <button
          type="button"
          className="action-button"
          onClick={handleRunPart1}
          disabled={!hasAllPredictions || part1Running || part2Running}
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
        {!hasAllPredictions && <p style={smallNote}>Answer all three predictions above to press Run.</p>}

        <Block>
          <ArmsPicture
            armXLength={part1State.armXLength}
            armYLength={part1State.armYLength}
            label="The two detector arms seen from above, with a dashed amber outline at the rest length. Arm X is violet and Arm Y is cyan."
          />
          <Readout time={part1Time} mass={PART1_MASS} />
          <Definitions />
          <ArmsCaption name="Picture 1" summary={part1Summary} done={part1Done} pink={false} />
        </Block>

        {part1Started && (
          <Block>
            <ChirpGraph
              mass={PART1_MASS}
              trace={part1Trace}
              time={part1Time}
              started={part1Started}
              pink={false}
              guesses={part1Done && submitted ? { pitch: submitted.pitch, loudness: submitted.loudness } : null}
              swing={part1Swing}
              label="A graph of the two arm lengths against time during the run, with a dashed line at the rest length 1.000. Arm X is violet and Arm Y is cyan. Your first two guesses are drawn in white in boxes marked YOUR GUESS."
            />
            <GraphCaption
              name="Picture 2"
              summary={part1Summary}
              done={part1Done}
              pink={false}
              swing={part1Swing}
              half={graphHalfRange(PART1_MASS)}
              guesses={submitted ? { pitch: submitted.pitch, loudness: submitted.loudness } : null}
            />
          </Block>
        )}

        {part1Started && (
          <Block>
            <TimeBars
              guess={submitted?.timing ?? null}
              label="Two horizontal bars showing the time to the final moment for a light pair, mass 0.3, and a heavier pair, mass 3.0. Your third guess is drawn in white in a box marked YOUR GUESS 3."
            />
            <BarsCaption light={part1Summary} heavy={heavySummary} done={part1Done} guess={submitted?.timing ?? null} />
          </Block>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose the mass of the pair, from very light to very heavy, and run it. The mass slider changes the
              drawings in this Part, marked in pink. It does not change Part 1&rsquo;s pictures, the tables in Part 3, or your
              guesses.
            </PartHeader>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <p style={paragraph}>
                <strong>What you are changing.</strong> The <strong>mass</strong> of the pair of objects that circle each other: how much
                matter the two of them hold between them. The scale is made up, from 0.2 (a very light pair) to 6 (a very heavy pair).
                In Part 1 the pair had a mass of {PART1_MASS.toFixed(1)}, and Picture 3 compared it with a pair of {REFERENCE_PAIRS[1].toFixed(1)}.
                Nothing else changes: the same simplified formula is used for every mass, so any difference you see comes from the
                mass.
              </p>
              <p style={paragraph}>
                <strong>What to try.</strong> Run a light pair (try 0.2) and then a heavy pair (try 6), and compare the two drawings: how
                long each run lasts, how many swings it holds and how far the arms move. After a second run at a different mass, a
                short note below compares it with your previous run.
              </p>
              <p style={paragraph}>
                <strong>The pink marks.</strong> Pink always means your own choice. The pink marks on Drawing B follow the slider, so
                they move as soon as you move it, before you run. The arm lines are drawn only when you press Run your mass.
              </p>
              <p style={paragraph}>
                <strong>Your guesses.</strong> White always means your guess. When your run has finished, your guesses about the pitch
                and the loudness are drawn on Drawing B in white, beside the real lines of the mass you ran, so you can compare them.
                Your guess about which pair reaches its final moment sooner is drawn on Drawing C, beside the bars for the Part 1 pair
                and your pair. They never change the lines or the bars. A short run, at a heavy mass, has no full first swing and no
                pair of peaks, so there is nothing to put the first two beside and the page says so.
              </p>
            </div>

            <p style={smallNote}>
              Your guesses do not change these drawings or the tables in Part 3, but this slider does change the drawings
              below.
            </p>
            <label htmlFor="chirp-mass" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Mass: {mass.toFixed(1)}
            </label>
            <input
              id="chirp-mass"
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
              At mass <strong>{mass.toFixed(1)}</strong> the final moment comes at <strong>{fixed3(part2Summary.cutoffTime)}</strong> time units
              (0.9 ÷ {mass.toFixed(1)}), and the run holds <strong>{part2Summary.swings.toFixed(2)}</strong> swings.
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
              <ArmsCaption name="Drawing A" summary={part2Summary} done={part2Done} pink />
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Drawing B: your arm lengths against time</p>
              <ChirpGraph
                mass={mass}
                trace={part2Trace}
                time={part2Time}
                started={ranHere}
                pink
                guesses={part2Done && submitted ? { pitch: submitted.pitch, loudness: submitted.loudness } : null}
                swing={part2Swing}
                label="Drawing B: a graph of the two arm lengths against time at your mass, with pink marks for your own mass. Your first two guesses are drawn in white when the run has finished."
              />
              <GraphCaption
                name="Drawing B"
                summary={part2Summary}
                done={part2Done}
                pink
                swing={part2Swing}
                half={graphHalfRange(mass)}
                guesses={submitted ? { pitch: submitted.pitch, loudness: submitted.loudness } : null}
              />
              <p style={smallNote}>Move the slider and press Run your mass to redraw the arm lines.</p>
            </Block>
            <Block>
              <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Drawing C: how long your pair takes, beside the Part 1 pair</p>
              <YourPairBars
                mass={mass}
                guess={submitted?.timing ?? null}
                label="Drawing C: two horizontal bars showing the time to the final moment for the Part 1 pair, mass 0.3, and for your pair. Your third guess is drawn in white in a box marked YOUR GUESS 3."
              />
              <YourPairBarsCaption yours={part2Summary} guess={submitted?.timing ?? null} />
            </Block>

            {part2Done && comparison && (
              <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                <strong>Comparing your runs.</strong>{' '}
                {comparison.current.mass > comparison.previous.mass ? (
                  <>
                    This heavier run (mass {comparison.current.mass.toFixed(1)}) reached its final moment after{' '}
                    <strong>{fixed3(comparison.current.cutoffTime)}</strong>, sooner than the earlier, lighter run (mass{' '}
                    {comparison.previous.mass.toFixed(1)}), which took <strong>{fixed3(comparison.previous.cutoffTime)}</strong>.
                  </>
                ) : (
                  <>
                    This lighter run (mass {comparison.current.mass.toFixed(1)}) reached its final moment after{' '}
                    <strong>{fixed3(comparison.current.cutoffTime)}</strong>, later than the earlier, heavier run (mass{' '}
                    {comparison.previous.mass.toFixed(1)}), which took only <strong>{fixed3(comparison.previous.cutoffTime)}</strong>.
                  </>
                )}{' '}
                In both runs the pitch and the loudness rose by the same multiplier, {comparison.current.rise.toFixed(2)} times.
                But mass changed two things: how long the run takes, and how loud the wave is overall. This run&rsquo;s
                loudness (amplitude) rose from {fixed3(comparison.current.startAmplitude)} to {fixed3(comparison.current.endAmplitude)}, the
                earlier run&rsquo;s from {fixed3(comparison.previous.startAmplitude)} to {fixed3(comparison.previous.endAmplitude)}.
              </p>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && submitted && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run and for the two pairs in Picture 3, with your guesses listed beside them.
              Nothing in this Part changes with your guesses or with the mass slider in Part 2.
            </PartHeader>

            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Your guesses, beside the results</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 0, marginBottom: '0.5rem' }}>
              Your guesses are shown here as you made them, with the place where each one&rsquo;s number appears. They are not marked
              here, and they never change a picture or a table. The tutor marks them, in Part 4.
            </p>
            <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <li>
                <strong>Guess 1, the pitch:</strong> {pitchChoices.find((c) => c.value === submitted.pitch)!.label.toLowerCase()}. The
                question was whether the wave&rsquo;s pitch speeds up, slows down or stays the same as the two objects spiral closer. Its
                numbers are in Table 1, row &ldquo;Frequency (pitch)&rdquo;.
              </li>
              <li>
                <strong>Guess 2, the loudness:</strong> {loudnessChoices.find((c) => c.value === submitted.loudness)!.label.toLowerCase()}.
                The question was whether the wave gets stronger, weaker or stays the same strength. Its numbers are in Table 1, row
                &ldquo;Amplitude (loudness)&rdquo;.
              </li>
              <li>
                <strong>Guess 3, which pair reaches its final moment sooner:</strong>{' '}
                {timingChoices.find((c) => c.value === submitted.timing)!.label.toLowerCase()}. Its numbers are in Table 3, column
                &ldquo;Time to the final moment&rdquo;, and in Picture 3.
              </li>
            </ul>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <p style={paragraph}>
                <strong>How to read these results.</strong> Think of these tables as a set of test results, and this section as the
                doctor explaining them. A table of numbers cannot be read until someone says what each number is. The numbers here come
                from a calculation this page runs with a simple stand-in formula for a real inspiral, so nothing in them was measured
                by an instrument, and most of them have no &ldquo;normal range&rdquo; to be compared with. The question to keep in mind
                is: <strong>how did each number change from the start of the run to the end, and what does a heavier pair change?</strong>
              </p>
              <p style={paragraph}>
                First comes a short check-up that sets this page&rsquo;s run beside the one real chirp it can be compared with. Then each
                table has a plain-words note under it. The page says what each number is and what it means. It does not decide for you
                why the numbers behave as they do: the tutor will help you with that, after the tables. The &ldquo;Words and
                formulas&rdquo; box now has the formulas worked with these numbers.
              </p>
            </div>

            <p style={{ marginBottom: '0.25rem' }}>
              <strong>The check-up: what a real event shows, and what was found here</strong>
            </p>
            <ResultsTable
              head={['What was checked', 'What a real event shows', 'What was found here', 'What this tells us']}
              minWidth={680}
              rows={[
                [
                  'How much the pitch rose',
                  `GW150914 swept upwards from ${REAL_CHIRP.startHz} to ${REAL_CHIRP.endHz} hertz: ${checkUp.realRise.toFixed(1)} times higher, about ${checkUp.realOctaves.toFixed(1)} octaves (LIGO Scientific Collaboration and Virgo Collaboration, 2016)`,
                  `${fixed3(part1Summary.startFrequency)} to ${fixed3(part1Summary.endFrequency)}: ${checkUp.toyRise.toFixed(2)} times higher, about ${checkUp.toyOctaves.toFixed(1)} octaves`,
                  'Less: a gentler rise than the real one. The formula here is a simple stand-in, so this is the same kind of rise as a real chirp, not the same size.',
                ],
                [
                  'How long the signal lasts',
                  `About two-tenths of a second for GW150914 (LIGO Lab)`,
                  `${fixed3(part1Summary.cutoffTime)} time units for the pair in Part 1`,
                  'Not comparable: a time unit on this page is not a second, and the mass scale is made up.',
                ],
                [
                  'How strong the wave gets',
                  `A peak strain of about ${REAL_CHIRP.peakStrain.toExponential(1).replace('e-', ' × 10⁻').replace('+', '')} for GW150914 (the same paper)`,
                  `${fixed3(checkUp.toyEndAmplitude)} at the final moment`,
                  `Much more: more than 10${superscript(checkUp.powerOfTenLarger)} times larger, on purpose, so that you can see the arms move. Real waves are far too small to show at any visible scale.`,
                ],
              ]}
            />
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              A doctor reads each result against a reference. Here the only reference is one real event, GW150914, so only three rows
              have one: one is less, one cannot be compared and one is much more. The tables below have no reference, so they are read
              as &ldquo;the same&rdquo;, &ldquo;more&rdquo; or &ldquo;less&rdquo; than the start of the run, or than another pair.
            </p>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 1: the wave in the Part 1 run (mass {part1Summary.mass.toFixed(1)})</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'At the start', 'At the final moment', 'Change']}
              minWidth={560}
              rows={[
                [
                  <>
                    Frequency (pitch)
                    <GuessTag n={1} />
                  </>,
                  fixed3(part1Summary.startFrequency),
                  fixed3(part1Summary.endFrequency),
                  `${part1Summary.rise.toFixed(2)} times higher`,
                ],
                [
                  <>
                    Amplitude (loudness)
                    <GuessTag n={2} />
                  </>,
                  fixed3(part1Summary.startAmplitude),
                  fixed3(part1Summary.endAmplitude),
                  `${part1Summary.rise.toFixed(2)} times larger`,
                ],
              ]}
            />
            <p style={{ ...smallNote, margin: '0.5rem 0 1rem' }}>
              The tags show which of your guesses relates to a row. They do not say whether a guess matched.
            </p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Frequency (pitch).</strong> <em>What it is:</em> the number of swings the arms make in one time unit, at the
                  start and at the final moment of the run. <em>What it means:</em> it goes from {fixed3(part1Summary.startFrequency)} to{' '}
                  {fixed3(part1Summary.endFrequency)}, which is {part1Summary.rise.toFixed(2)} times as high. A daily-life comparison: on
                  a piano that is about {checkUp.toyOctaves.toFixed(1)} octaves higher (each octave doubles the pitch, so two octaves
                  would be four times). <em>Why it matters:</em> this changing note is what gives the chirp its name, and it is the
                  number a detector uses to recognise a source.
                </li>
                <li>
                  <strong>Amplitude (loudness).</strong> <em>What it is:</em> how far the arms swing, in units of strain, the biggest
                  strain the wave reaches at that moment. <em>What it means:</em> it goes from {fixed3(part1Summary.startAmplitude)} to{' '}
                  {fixed3(part1Summary.endAmplitude)}, again {part1Summary.rise.toFixed(2)} times as large. Each arm moves by half the
                  strain, so at the top of a swing the arms move about {armMoveForStrain(part1Summary.startAmplitude).toFixed(4)} from
                  rest at the start and about {armMoveForStrain(part1Summary.endAmplitude).toFixed(3)} at the final moment.{' '}
                  <em>Why it matters:</em> a louder wave is easier to detect, so the end of a chirp is the part of it that stands out
                  most.
                </li>
                <li>
                  <strong>How sure the numbers are.</strong> They come from a simplified stand-in formula, not the real equations. The
                  real signal&rsquo;s rise is steeper (see the check-up above).
                </li>
              </ul>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 2: the arms in the Part 1 run (mass {part1Summary.mass.toFixed(1)})</strong>
            </p>
            <ResultsTable
              head={['Arm', 'Shortest', 'Longest', 'Length at the final moment']}
              minWidth={520}
              rows={[
                ['Arm\u00a0X', fixed3(part1Summary.armXMin), fixed3(part1Summary.armXMax), fixed3(part1Summary.finalArmXLength)],
                ['Arm\u00a0Y', fixed3(part1Summary.armYMin), fixed3(part1Summary.armYMax), fixed3(part1Summary.finalArmYLength)],
              ]}
            />
            <p style={{ ...smallNote, margin: '0.5rem 0 1rem' }}>Lengths are fractions of the rest length, 1.000.</p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Shortest and longest.</strong> <em>What it is:</em> the lowest and highest length each arm reached at any time
                  in the run. <em>What it means:</em> Arm X went from {fixed3(part1Summary.armXMin)} to {fixed3(part1Summary.armXMax)} and
                  Arm Y from {fixed3(part1Summary.armYMin)} to {fixed3(part1Summary.armYMax)}. They are mirror images: one arm is as far
                  above 1.000 as the other is below it. They are not exactly &plusmn;{fixed3(part1Summary.endAmplitude / 2)} because the
                  wave is still growing and its last full peak comes just before the final moment. <em>Why it matters:</em> this is how
                  far a detector&rsquo;s arms really moved during the run.
                </li>
                <li>
                  <strong>Length at the final moment.</strong> <em>What it is:</em> the length of each arm when the run stops.{' '}
                  <em>What it means:</em> Arm X is {fixed3(part1Summary.finalArmXLength)} and Arm Y is {fixed3(part1Summary.finalArmYLength)}.
                  That is not an extreme, because the run ends {(part1Summary.swings % 1).toFixed(2)} of the way through a swing, not at a
                  peak. <em>Why it matters:</em> the arms are not &ldquo;done&rdquo; at the end: the wave was still going when we stopped
                  the run.
                </li>
              </ul>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 3: two pairs, from Picture 3</strong>
            </p>
            <ResultsTable
              head={['Pair', 'Mass', 'Time to the final moment', 'Swings before it', 'Amplitude at the final moment']}
              minWidth={640}
              rows={[
                [
                  'The light pair',
                  part1Summary.mass.toFixed(1),
                  <>
                    {fixed3(part1Summary.cutoffTime)}
                    <GuessTag n={3} />
                  </>,
                  part1Summary.swings.toFixed(1),
                  fixed3(part1Summary.endAmplitude),
                ],
                [
                  'The heavier pair',
                  heavySummary.mass.toFixed(1),
                  <>
                    {fixed3(heavySummary.cutoffTime)}
                    <GuessTag n={3} />
                  </>,
                  heavySummary.swings.toFixed(2),
                  fixed3(heavySummary.endAmplitude),
                ],
              ]}
            />
            <p style={{ ...smallNote, margin: '0.5rem 0 1rem' }}>
              Times are in time units. The heavier pair was not played: its numbers are calculated. The tags show which of your guesses
              relates to a column. They do not say whether a guess matched.
            </p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Time to the final moment.</strong> <em>What it is:</em> how long each pair&rsquo;s run lasts before its idealized
                  end. <em>What it means:</em> the light pair&rsquo;s final moment comes at {fixed3(part1Summary.cutoffTime)} time units and the
                  heavier pair&rsquo;s at {fixed3(heavySummary.cutoffTime)}, ten times sooner (the time is 0.9 divided by the mass).{' '}
                  <em>Why it matters:</em> it shows how strongly the mass sets how long the whole chirp lasts. Why the formula has this
                  form is for the tutor.
                </li>
                <li>
                  <strong>Swings before it.</strong> <em>What it is:</em> the number of full swings the arms make before the final moment.{' '}
                  <em>What it means:</em> {part1Summary.swings.toFixed(1)} for the light pair and {heavySummary.swings.toFixed(2)} for the
                  heavier pair, less than half a swing. <em>Why it matters:</em> a very heavy pair leaves almost no time to hear a
                  chirp, which is why Part 1 uses a light pair.
                </li>
                <li>
                  <strong>Amplitude at the final moment.</strong> <em>What it is:</em> the loudest the wave gets in each run.{' '}
                  <em>What it means:</em> {fixed3(part1Summary.endAmplitude)} for the light pair and {fixed3(heavySummary.endAmplitude)} for
                  the heavier pair, ten times as much. The rise within each run is the same, {part1Summary.rise.toFixed(2)} times.{' '}
                  <em>Why it matters:</em> mass changes two things: how long the run takes and how loud the wave is overall, while the
                  rise inside a run is the same for both.
                </li>
              </ul>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              <strong>Where these numbers come from.</strong> <em>Measured:</em> only the figures for GW150914 in the check-up (the
              discovery paper and LIGO Lab). <em>Calculated here:</em> everything in Tables 1 to 3, from the simplified stand-in
              formula. <em>Imagined for the question:</em> the two pairs and their masses, on this page&rsquo;s made-up mass scale.
            </p>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>A real chirp.</strong> GW150914, the first gravitational wave LIGO detected (2015), sweeps upwards in frequency
              from {REAL_CHIRP.startHz} hertz to {REAL_CHIRP.endHz} hertz (hertz means swings per second), about {checkUp.realRise.toFixed(0)}{' '}
              times higher, in a signal about two-tenths of a second long, as the two black holes spiral together and merge. That is
              the same kind of rising &ldquo;whoop&rdquo; this experiment models in miniature: here the rise is {checkUp.toyRise.toFixed(2)}{' '}
              times, a gentler rise. The merger itself isn&rsquo;t shown here, and the mass-to-chirp relationship above is a simplified
              stand-in for the real physics, not the actual equations that govern a real inspiral.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>The original paper.</strong> <ExternalLink href={PAPER_LINK.href}>{PAPER_LINK.label}</ExternalLink> —{' '}
              {PAPER_LINK.what}
            </p>
          </>
        )}
      </div>

      {/* ===== Part 4 ===== */}
      {part1Done && submitted && (
        <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            Talk through what you saw. The tutor points to your white guess marks, then explains.
          </PartHeader>
          <GravitationalWaveChirpTutor
            key={part1RunId}
            pitchPrediction={submitted.pitch}
            loudnessPrediction={submitted.loudness}
            timingPrediction={submitted.timing}
            onExplained={onTutorComplete}
          />
        </div>
      )}
    </div>
  )
}
