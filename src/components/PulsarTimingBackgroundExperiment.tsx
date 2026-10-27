import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CYCLE_CHOICES, SHIFT_CHOICES_NANOSECONDS, PICTURE_ONE_TICKS_SECONDS, cycleGuessMarker, cycleRulerPosition, pictureOne, pictureTwo, shiftGuessMarker, shiftRulerPosition, PICTURE_TWO_TICKS_SECONDS, TRIAL_MASS_CHOICES_SOLAR, TRIAL_SEPARATION_CHOICES_PC, trialPicture, frequencyRulerPosition, examplePair, separationAu, OBSERVING_SPAN_YEARS } from '../physics/pulsarTimingBackground'
import type { CycleChoiceId, ShiftChoice, TrialPicture } from '../physics/pulsarTimingBackground'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 22 (docs/experiments/frontier-and-beyond/22-does-the-universe-hum.md).
// STEPS 2 to 6 (the interface skeleton and the introduction, the two predictions, the run and Picture 1, then Picture 2, then the "Now try it yourself" controls and Drawing A): this file has the title, the status line, the introduction, the new-word list, the collapsed "Words and formulas" panel and the
// "Want to know more?" links. It also has the two predictions (Part 1), the run (six stages) and Picture 1 and Picture 2 with the guesses. It also has Part 2, "Now try it yourself" (two controls and Drawing A, which follows them). It has no results, tutor or chapter summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for the
// owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. Nothing here says how long one wave cycle of a pair of supermassive black holes lasts, how big the shift in a
// pulse's arrival time is, or what "nanohertz" means (CLAUDE.md §12): those are the predictions' answers and the run's results. The links that give them away (NANOGrav's own pages, which say
// "years to decades", the IPTA's page and the papers) are listed only after the run, in a later step.

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function referenceEntries(): { term: string; meaning: string }[] {
  return [
    { term: 'Gravitational wave', meaning: 'a ripple in spacetime that is sent out when heavy things speed up or change direction, for example two black holes circling each other. As it passes, it very slightly stretches and squeezes space (Gravitational Waves Experiment 1).' },
    { term: 'Hertz', meaning: 'a unit for how often something repeats. One hertz is one repeat (one cycle) every second, so a sound of 100 hertz repeats 100 times a second.' },
    { term: 'Orbit and orbital period', meaning: 'an orbit is the path of one object going round another, and the orbital period is the time it takes to go round once (Gravity Experiment 6). A year is the Earth’s orbital period round the Sun.' },
    { term: 'Parsec', meaning: 'a unit for distances between stars and black holes. One parsec is about 3.26 light-years, which is about 31 million million kilometres. So 0.01 parsecs is about 0.03 light-years.' },
    { term: 'Nanosecond', meaning: 'a billionth of a second. In one nanosecond, light travels about 30 centimetres.' },
    { term: 'Supermassive black hole', meaning: 'a black hole millions to billions of times as heavy as the Sun, found at the centre of most large galaxies. The one at the centre of our own galaxy, Sagittarius A*, is about 4 million Suns (Frontier and Beyond Experiment 21).' },
    { term: 'Neutron star', meaning: 'the extremely dense core left behind when a heavy star explodes, with the mass of more than the Sun squeezed into a sphere about 12 kilometres across (Frontier and Beyond Experiment 15).' },
    { term: 'Pulsar', meaning: 'a neutron star that spins and gives out beams of radio waves from its poles. As it spins, a beam sweeps round the sky like the light of a lighthouse, and each time it points at the Earth, telescopes pick up a short pulse.' },
    { term: 'Millisecond pulsar', meaning: 'a pulsar that spins hundreds of times every second, so a pulse arrives every few thousandths of a second. They are among the steadiest natural clocks known, which is why they are used here.' },
    { term: 'Arrival time', meaning: 'the moment a pulse reaches a radio telescope on Earth. Astronomers compare each pulse’s real arrival time with the time a model says it should arrive, and look at the difference.' },
    { term: 'Background (of gravitational waves)', meaning: 'many waves from many different sources, added together, so that no one wave stands out, like the murmur of a crowd, in which you cannot pick out one voice. A background is a steady, faint signal from all directions.' },
    { term: 'Sigma', meaning: 'a way of saying how many give-or-takes a result is from a value that was expected (Experiment 1 of this group): the bigger the number, the harder it is to say the gap is just chance. About 3 sigma is often called a hint or evidence, and 5 sigma is the usual bar for a discovery.' },
    { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “2.4 ± 0.7”. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
  ]
}

// ---- Colours ----
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const BLACK_HOLE_COLOR = '#a78bfa' // violet: a black hole
const CALC_COLOR = '#22d3ee' // cyan: calculated here
const MEASURED_COLOR = '#fb923c' // orange: measured (LIGO's waves)
const YOURS_COLOR = '#ffffff' // white: the learner's guess
const PULSAR_COLOR = '#fbbf24' // amber: the pulsar
const EARTH_COLOR = '#60a5fa' // blue: the Earth
const IMAGINED_COLOR = '#f472b6' // pink: imagined for the question (the example pulse spacing)

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const VIEW_WIDTH = 560

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size + 3}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

// ---- The run: stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 6
const STAGE_NAMES = ['', 'The pair of black holes', 'Its orbit and its wave', 'One wave cycle, on a ruler', 'LIGO’s waves', 'What 15 years of timing can pick out', 'The pulse and its shift']
const STAGE_LINES = [
  '',
  'Two supermassive black holes of a billion Suns each, circling each other. The drawing is a sketch, not to scale.',
  'The dashed cyan circle is their orbit. The cyan wave is the gravitational wave they send out.',
  'Panel B is a ruler for the length of one wave cycle. The cyan dot is this pair’s cycle, calculated here. Your guess for Prediction 1 is the white marker.',
  'The orange bar is the cycle length of the waves that LIGO detected in its first event.',
  'The cyan band is the range of cycle lengths that 15 years of pulsar timing can pick out.',
  'Picture 2 shows how a passing wave changes when a pulse arrives. The cyan dot is the shift, calculated here. Your guess for Prediction 2 is the white marker.',
]

function n1(x: number): string {
  return x.toFixed(1)
}
function n2(x: number): string {
  return x.toFixed(2)
}
function commas(x: number): string {
  return Math.round(x).toLocaleString('en-US')
}
function msText(seconds: number): string {
  const ms = seconds * 1000
  return ms >= 10 ? `${Math.round(ms)}` : n1(ms)
}

const TICK_LABELS: Record<number, string> = { 0.001: '1 ms', 1: '1 s', 3600: '1 hour', 86400: '1 day', 31557600: '1 yr', 315576000: '10 yr', 3155760000: '100 yr' }

// Picture 1. Panel A: the pair, its orbit and its wave. Panel B: a log ruler of the length of one wave cycle, with Prediction 1's guess (a marker at the guessed length).
function PictureOne({ stage, cycleGuess }: { stage: number; cycleGuess: CycleChoiceId | null }) {
  const pic = pictureOne()
  const b = pic.pair
  const height = stage >= 3 ? 560 : 270
  const ax = 150
  const ay = 160
  const r = 50
  const rulerY = 440
  const x0 = 40
  const x1 = 520
  const rx = (pos: number) => x0 + pos * (x1 - x0)
  const guess = cycleGuess ? cycleGuessMarker(cycleGuess) : null
  const boxW = 320
  const boxX = guess ? Math.min(540 - boxW, Math.max(20, rx(guess.position) - boxW / 2)) : 0
  // The wave strip (stage 2): two cycles across, the same as one orbit.
  const wx0 = 310
  const wx1 = 530
  const wy = 160
  const wamp = 24
  const wavePath = Array.from({ length: 111 }, (_, i) => {
    const t = i / 110
    return `${i === 0 ? 'M' : 'L'} ${(wx0 + t * (wx1 - wx0)).toFixed(1)} ${(wy - wamp * Math.sin(2 * Math.PI * pic.waveCyclesPerOrbit * t)).toFixed(1)}`
  }).join(' ')
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1. Panel A: a sketch, not to scale, of two supermassive black holes of ${commas(b.mass1Solar / 1e9)} billion Suns each, ${b.separationPc} parsecs apart, about ${commas(pic.separationAu)} times the distance from the Earth to the Sun. ${
        stage >= 2
          ? `The dashed cyan circle is their orbit, which takes ${n2(b.orbitalPeriodYears)} years, and the cyan wave is the gravitational wave, with ${pic.waveCyclesPerOrbit} cycles for every orbit, so one wave cycle lasts ${n2(b.waveCycleYears)} years. `
          : ''
      }${
        stage >= 3
          ? `Panel B: a ruler of the length of one wave cycle, from 1 millisecond to 100 years and beyond, going up in steps of ten. A cyan dot marks this pair's wave cycle, ${n2(b.waveCycleYears)} years.${
              guess && cycleGuess ? ` Your guess for Prediction 1 is a white marker at ${CYCLE_CHOICES.find((c) => c.id === cycleGuess)?.label}.` : ''
            } `
          : ''
      }${stage >= 4 ? `An orange bar marks the waves of LIGO's first event, with cycles from ${msText(pic.ligo.shortestSeconds)} to ${msText(pic.ligo.longestSeconds)} milliseconds. ` : ''}${
        stage >= 5 ? `A cyan band marks the cycle lengths that ${pic.span.years} years of timing can pick out, up to ${pic.span.years} years, fading to the left.` : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: a pair of supermassive black holes and the length of its wave
      </text>
      <SvgLines x={20} y={38} lines={['A. A sketch seen from above, not to scale.']} fill={MUTED_COLOR} />

      {stage >= 2 && <circle cx={ax} cy={ay} r={r} fill="none" stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="6 4" />}
      <circle cx={ax - r} cy={ay} r={11} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} />
      <circle cx={ax + r} cy={ay} r={11} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} />
      <SvgLines x={ax - r - 17} y={ay + 3} lines={[`${commas(b.mass1Solar / 1e9)} billion Suns`]} fill={BLACK_HOLE_COLOR} size={9} bold anchor="end" />
      <SvgLines x={ax + r + 17} y={ay + 3} lines={[`${commas(b.mass2Solar / 1e9)} billion Suns`]} fill={BLACK_HOLE_COLOR} size={9} bold anchor="start" />
      <SvgLines x={ax} y={ay - r - 18} lines={[`${b.separationPc} parsecs apart (about ${commas(pic.separationAu)} times Earth to Sun)`]} fill={TEXT_COLOR} size={9} anchor="middle" />
      <line x1={ax - r + 12} y1={ay - r - 8} x2={ax + r - 12} y2={ay - r - 8} stroke={TEXT_COLOR} strokeWidth={1} />
      <SvgLines x={ax} y={ay + r + 22} lines={['violet circles: the two black holes']} fill={BLACK_HOLE_COLOR} size={9} bold anchor="middle" />

      {stage >= 2 && (
        <g>
          <SvgLines x={ax} y={ay + r + 36} lines={[`cyan dashed circle: their orbit, one orbit takes ${n2(b.orbitalPeriodYears)} years`]} fill={CALC_COLOR} size={9} bold anchor="middle" />
          <path d={wavePath} fill="none" stroke={CALC_COLOR} strokeWidth={2.5} />
          <line x1={wx0} y1={wy + wamp + 14} x2={wx1} y2={wy + wamp + 14} stroke={TEXT_COLOR} strokeWidth={1} />
          <SvgLines x={(wx0 + wx1) / 2} y={wy + wamp + 28} lines={[`one orbit = ${n2(b.orbitalPeriodYears)} years = ${pic.waveCyclesPerOrbit} wave cycles`]} fill={TEXT_COLOR} size={9} anchor="middle" />
          <line x1={wx0} y1={wy - wamp - 14} x2={(wx0 + wx1) / 2} y2={wy - wamp - 14} stroke={CALC_COLOR} strokeWidth={2} />
          <SvgLines x={(wx0 + (wx0 + wx1) / 2) / 2} y={wy - wamp - 20} lines={[`one wave cycle = ${n2(b.waveCycleYears)} years`]} fill={CALC_COLOR} size={9} bold anchor="middle" />
          <SvgLines x={(wx0 + wx1) / 2} y={wy - wamp - 44} lines={['cyan wave: the gravitational wave they send out']} fill={CALC_COLOR} size={9} bold anchor="middle" />
        </g>
      )}

      {stage >= 3 && (
        <g>
          <line x1={20} y1={286} x2={540} y2={286} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="3 4" />
          <SvgLines x={20} y={308} lines={['B. How long one wave cycle lasts']} fill={TEXT_COLOR} bold size={11} />
          <SvgLines x={20} y={324} lines={['A ruler of times, not of equal steps: each step to the right multiplies the length by ten.']} fill={MUTED_COLOR} size={9} />
          <SvgLines x={20} y={344} lines={[`cyan dot: this pair’s wave cycle, calculated, ${n2(b.waveCycleYears)} years`]} fill={CALC_COLOR} bold size={10} />
          {stage >= 4 && (
            <SvgLines x={20} y={360} lines={[`orange bar: LIGO’s first event, measured, ${msText(pic.ligo.shortestSeconds)} to ${msText(pic.ligo.longestSeconds)} milliseconds a cycle`]} fill={MEASURED_COLOR} bold size={10} />
          )}
          {stage >= 5 && (
            <SvgLines x={20} y={376} lines={[`cyan band: what ${pic.span.years} years of timing can pick out (cycles up to ${pic.span.years} years), calculated`]} fill={CALC_COLOR} bold size={10} />
          )}
          <line x1={x0} y1={rulerY} x2={x1} y2={rulerY} stroke={MUTED_COLOR} strokeWidth={1} />
          {guess && cycleGuess && (
            <g>
              <line x1={rx(guess.position)} y1={rulerY} x2={rx(guess.position)} y2={rulerY + 56} stroke={YOURS_COLOR} strokeWidth={4} />
              <polygon points={`${rx(guess.position)},${rulerY} ${rx(guess.position) - 7},${rulerY + 12} ${rx(guess.position) + 7},${rulerY + 12}`} fill={YOURS_COLOR} />
              <rect x={boxX} y={rulerY + 56} width={boxW} height={28} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
              <SvgLines x={boxX + boxW / 2} y={rulerY + 74} lines={[`YOUR GUESS: ${CYCLE_CHOICES.find((c) => c.id === cycleGuess)!.label}`]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
            </g>
          )}
          {PICTURE_ONE_TICKS_SECONDS.map((t) => (
            <g key={t}>
              <line x1={rx(cycleRulerPosition(t))} y1={rulerY} x2={rx(cycleRulerPosition(t))} y2={rulerY + 5} stroke={MUTED_COLOR} />
              <text x={rx(cycleRulerPosition(t))} y={rulerY + 17} fill={MUTED_COLOR} fontSize={9} textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">{TICK_LABELS[t] ?? String(t)}</text>
            </g>
          ))}
          {stage >= 5 && (
            <g>
              <defs>
                <linearGradient id="bandFade" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor={CALC_COLOR} stopOpacity={0} />
                  <stop offset="0.6" stopColor={CALC_COLOR} stopOpacity={0.3} />
                  <stop offset="1" stopColor={CALC_COLOR} stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <rect x={rx(pic.span.fadeEndPosition)} y={rulerY - 16} width={rx(pic.span.longestCyclePosition) - rx(pic.span.fadeEndPosition)} height={16} fill="url(#bandFade)" />
              <line x1={rx(pic.span.longestCyclePosition)} y1={rulerY - 18} x2={rx(pic.span.longestCyclePosition)} y2={rulerY} stroke={CALC_COLOR} strokeWidth={2} />
            </g>
          )}
          {stage >= 4 && (
            <rect x={rx(pic.ligo.shortestPosition)} y={rulerY - 16} width={rx(pic.ligo.longestPosition) - rx(pic.ligo.shortestPosition)} height={16} fill={MEASURED_COLOR} />
          )}
          <line x1={rx(pic.pairPosition)} y1={rulerY - 40} x2={rx(pic.pairPosition)} y2={rulerY} stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="5 3" />
          <circle cx={rx(pic.pairPosition)} cy={rulerY} r={6} fill={CALC_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <SvgLines x={rx(pic.pairPosition)} y={rulerY - 46} lines={['this pair']} fill={CALC_COLOR} bold size={10} anchor="middle" />
        </g>
      )}
    </svg>
  )
}

const SHIFT_TICK_LABELS: Record<number, string> = { 1e-11: '0.01 ns', 1e-10: '0.1 ns', 1e-9: '1 ns', 1e-8: '10 ns', 1e-7: '100 ns', 1e-6: '1 µs', 1e-5: '10 µs', 1e-4: '100 µs', 1e-3: '1 ms', 1e-2: '10 ms' }

// Picture 2. Panel A: a pulsar, the Earth and the path between them, with a wave stretching the path (hugely exaggerated). Panel B: a log ruler of the shift in arrival time, with Prediction 2's guess.
function PictureTwo({ shiftGuess }: { shiftGuess: ShiftChoice | null }) {
  const pic = pictureTwo()
  const px = 70
  const ex = 490
  const rulerY = 396
  const x0 = 40
  const x1 = 520
  const rx = (pos: number) => x0 + pos * (x1 - x0)
  const guess = shiftGuess !== null ? shiftGuessMarker(shiftGuess) : null
  const boxW = 330
  const boxX = guess ? Math.min(540 - boxW, Math.max(20, rx(guess.position) - boxW / 2)) : 0
  // Tick marks along the path: even without a wave, uneven (stretched and squeezed, hugely exaggerated) with one.
  const N = 16
  const evenX = (i: number) => px + 22 + ((ex - 22 - (px + 22)) * i) / N
  const waveX = (i: number) => {
    const t = i / N
    return px + 22 + (ex - 22 - (px + 22)) * (t + (0.3 * Math.sin(2 * Math.PI * t)) / (2 * Math.PI) * 1.6)
  }
  return (
    <svg
      width={VIEW_WIDTH}
      height={492}
      viewBox="0 0 560 492"
      style={svgStyle}
      role="img"
      aria-label={`Picture 2. Panel A: a sketch, not to scale, of a pulsar on the left and the Earth on the right, with the path of a pulse between them, once with no wave and once with a gravitational wave passing, which stretches and squeezes the path (hugely exaggerated). Panel B: a ruler of the shift in a pulse's arrival time, from 0.01 nanoseconds to 10 milliseconds, going up in steps of ten. A cyan dot marks the calculated shift, ${n1(pic.shiftNanoseconds)} nanoseconds, with a pale band from ${n1(pic.shiftLowSeconds * 1e9)} to ${n1(pic.shiftHighSeconds * 1e9)} nanoseconds. A pink line marks an example pulse every millisecond.${
        guess && shiftGuess !== null ? ` Your guess for Prediction 2, about ${shiftGuess} nanoseconds, is a white marker.` : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: how a passing wave shifts a pulse
      </text>
      <SvgLines x={20} y={38} lines={['A. A sketch, not to scale. The stretch is hugely exaggerated.']} fill={MUTED_COLOR} />

      <circle cx={px} cy={110} r={13} fill={PULSAR_COLOR} />
      <line x1={px - 22} y1={110} x2={px - 14} y2={110} stroke={PULSAR_COLOR} strokeWidth={2} />
      <line x1={px + 14} y1={110} x2={px + 22} y2={110} stroke={PULSAR_COLOR} strokeWidth={2} />
      <SvgLines x={px} y={84} lines={['pulsar']} fill={PULSAR_COLOR} bold size={10} anchor="middle" />
      <circle cx={ex} cy={110} r={14} fill={EARTH_COLOR} />
      <SvgLines x={ex} y={84} lines={['Earth']} fill={EARTH_COLOR} bold size={10} anchor="middle" />

      <line x1={px + 22} y1={110} x2={ex - 22} y2={110} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {Array.from({ length: N + 1 }, (_, i) => (
        <line key={`a${i}`} x1={evenX(i)} y1={104} x2={evenX(i)} y2={116} stroke={MUTED_COLOR} strokeWidth={1} />
      ))}
      <SvgLines x={(px + ex) / 2} y={96} lines={['grey: the pulse’s path with no wave passing']} fill={MUTED_COLOR} size={9} bold anchor="middle" />

      <line x1={px + 22} y1={170} x2={ex - 22} y2={170} stroke={CALC_COLOR} strokeWidth={1.5} />
      {Array.from({ length: N + 1 }, (_, i) => (
        <line key={`b${i}`} x1={waveX(i)} y1={164} x2={waveX(i)} y2={176} stroke={CALC_COLOR} strokeWidth={1} />
      ))}
      <SvgLines x={(px + ex) / 2} y={196} lines={['cyan: the same path with a wave passing, stretched in some places and squeezed in others (hugely exaggerated)']} fill={CALC_COLOR} size={9} bold anchor="middle" />
      <SvgLines x={(px + ex) / 2} y={211} lines={['so the pulse takes a little longer or a little less time to arrive']} fill={CALC_COLOR} size={9} anchor="middle" />

      <line x1={20} y1={232} x2={540} y2={232} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="3 4" />
      <SvgLines x={20} y={254} lines={['B. How much earlier or later a pulse arrives']} fill={TEXT_COLOR} bold size={11} />
      <SvgLines x={20} y={270} lines={['A ruler of times, not of equal steps: each step to the right multiplies the shift by ten.']} fill={MUTED_COLOR} size={9} />
      <SvgLines
        x={20}
        y={290}
        lines={[`cyan dot and pale band: the calculated shift, ${n1(pic.shiftNanoseconds)} ns (range ${n1(pic.shiftLowSeconds * 1e9)} to ${n1(pic.shiftHighSeconds * 1e9)} ns),`, `for a wave of strength ${(pic.strain * 1e15).toFixed(1)} parts in a million billion`]}
        fill={CALC_COLOR}
        bold
        size={10}
      />
      <SvgLines x={20} y={322} lines={['pink line: one pulse every millisecond (an example, imagined for the question)']} fill={IMAGINED_COLOR} bold size={10} />

      <line x1={x0} y1={rulerY} x2={x1} y2={rulerY} stroke={MUTED_COLOR} strokeWidth={1} />
      {guess && shiftGuess !== null && (
        <g>
          <line x1={rx(guess.position)} y1={rulerY} x2={rx(guess.position)} y2={rulerY + 56} stroke={YOURS_COLOR} strokeWidth={4} />
          <polygon points={`${rx(guess.position)},${rulerY} ${rx(guess.position) - 7},${rulerY + 12} ${rx(guess.position) + 7},${rulerY + 12}`} fill={YOURS_COLOR} />
          <rect x={boxX} y={rulerY + 56} width={boxW} height={28} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
          <SvgLines x={boxX + boxW / 2} y={rulerY + 74} lines={[`YOUR GUESS: about ${shiftGuess.toLocaleString('en-US')} ${shiftGuess === 1 ? 'nanosecond' : 'nanoseconds'}`]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
        </g>
      )}
      {PICTURE_TWO_TICKS_SECONDS.map((t) => (
        <g key={t}>
          <line x1={rx(shiftRulerPosition(t))} y1={rulerY} x2={rx(shiftRulerPosition(t))} y2={rulerY + 5} stroke={MUTED_COLOR} />
          <text x={rx(shiftRulerPosition(t))} y={rulerY + 17} fill={MUTED_COLOR} fontSize={9} textAnchor="middle" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
            {SHIFT_TICK_LABELS[t]}
          </text>
        </g>
      ))}
      <rect x={rx(pic.shiftLowPosition)} y={rulerY - 16} width={rx(pic.shiftHighPosition) - rx(pic.shiftLowPosition)} height={16} fill={CALC_COLOR} fillOpacity={0.35} />
      <line x1={rx(pic.pulsePeriodPosition)} y1={rulerY - 40} x2={rx(pic.pulsePeriodPosition)} y2={rulerY} stroke={IMAGINED_COLOR} strokeWidth={2.5} />
      <SvgLines x={rx(pic.pulsePeriodPosition)} y={rulerY - 46} lines={['one pulse']} fill={IMAGINED_COLOR} bold size={10} anchor="middle" />
      <line x1={rx(pic.shiftPosition)} y1={rulerY - 40} x2={rx(pic.shiftPosition)} y2={rulerY} stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="5 3" />
      <circle cx={rx(pic.shiftPosition)} cy={rulerY} r={6} fill={CALC_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={rx(pic.shiftPosition)} y={rulerY - 46} lines={['the shift']} fill={CALC_COLOR} bold size={10} anchor="middle" />
    </svg>
  )
}

const captionParagraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function CaptionBlock({ title, intro, bullets, worked, lookFor, whereFrom }: { title: string; intro: ReactNode; bullets: ReactNode[]; worked: ReactNode | null; lookFor: LookFor[]; whereFrom: ReactNode }) {
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' }}>
      <p style={captionParagraph}>
        <strong>How to read {title}.</strong> {intro}
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {worked !== null && (
        <p style={captionParagraph}>
          <strong>A worked moment.</strong> {worked}
        </p>
      )}
      {lookFor.length > 0 && (
        <>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList items={lookFor} />
        </>
      )}
      <p style={{ ...captionParagraph, marginTop: '0.75rem' }}>
        <strong>Where the real picture comes from.</strong> {whereFrom}
      </p>
    </div>
  )
}

const CYCLE_LABELS: Record<CycleChoiceId, string> = {
  minute: 'About a minute',
  day: 'About a day',
  month: 'About a month',
  year: 'About a year',
  decade: 'About a decade (10 years)',
  century: 'About a century (100 years)',
}
const SHIFT_LABELS: Record<ShiftChoice, string> = {
  0.1: 'About 0.1 nanoseconds',
  1: 'About 1 nanosecond',
  10: 'About 10 nanoseconds',
  100: 'About 100 nanoseconds',
  1000: 'About 1,000 nanoseconds (a millionth of a second)',
}

// ---- Part 2: "Now try it yourself" (trial values, not real pairs) ----
const MASS_TRIAL_LABELS: Record<number, string> = {
  1e8: '100 million Suns each',
  1e9: '1 billion Suns each',
  1e10: '10 billion Suns each',
}
function separationLabel(pc: number): string {
  const au = separationAu(pc)
  return `${pc} parsecs apart (about ${commas(Math.round(au / 100) * 100)} times the Earth–Sun distance)`
}
function nanohertzText(nh: number): string {
  return nh >= 100 ? commas(nh) : nh >= 10 ? n1(nh) : n2(nh)
}
function cycleText(years: number): string {
  if (years >= 10) return `${commas(years)} years`
  if (years >= 1) return `${n1(years)} years`
  return `${commas(years * 365.25)} days`
}
function cyclesText(c: number): string {
  return c >= 100 ? commas(c) : c >= 10 ? n1(c) : n2(c)
}
const FREQUENCY_TICKS: { nanohertz: number; label: string }[] = [
  { nanohertz: 0.1, label: '0.1' },
  { nanohertz: 1, label: '1' },
  { nanohertz: 10, label: '10' },
  { nanohertz: 100, label: '100' },
  { nanohertz: 1000, label: '1,000' },
  { nanohertz: 10000, label: '10,000' },
]

// Drawing A. A log ruler of wave frequency (nanohertz): the lowest frequency that 15 years can pick out (cyan band), Picture 1's pair (cyan dashed line, calculated) and the trial pair (pink dot, imagined).
function TrialDrawing({ trial }: { trial: TrialPicture }) {
  const ex = examplePair()
  const exPos = frequencyRulerPosition(ex.frequencyNanohertz)
  const rulerY = 170
  const x0 = 40
  const x1 = 520
  const rx = (pos: number) => x0 + pos * (x1 - x0)
  const dotX = rx(trial.frequencyPosition)
  const boxW = 250
  const boxX = Math.min(540 - boxW, Math.max(20, dotX - boxW / 2))
  const verdict = trial.fits ? `can be picked out as a wave (at least 1 cycle in ${OBSERVING_SPAN_YEARS} years)` : `has less than 1 cycle in ${OBSERVING_SPAN_YEARS} years`
  return (
    <svg
      width={VIEW_WIDTH}
      height={310}
      viewBox="0 0 560 310"
      style={svgStyle}
      role="img"
      aria-label={`Drawing A. A ruler of the frequency of a gravitational wave, in nanohertz, from 0.1 to 10,000, going up in steps of ten. A cyan band starts at ${n1(trial.lowestNanohertz)} nanohertz and runs to the right: the waves that ${OBSERVING_SPAN_YEARS} years of timing can pick out. A cyan dashed line marks Picture 1's pair at ${n1(ex.frequencyNanohertz)} nanohertz. A pink dot marks your trial pair, two black holes of ${MASS_TRIAL_LABELS[trial.binary.mass1Solar] ?? ''}, ${trial.binary.separationPc} parsecs apart, at ${nanohertzText(trial.binary.frequencyNanohertz)} nanohertz. One wave cycle lasts about ${cycleText(trial.binary.waveCycleYears)}, with ${cyclesText(trial.cyclesIn15Years)} cycles in ${OBSERVING_SPAN_YEARS} years.`}
    >
      <SvgLines x={20} y={22} lines={['Drawing A. The frequency of your trial pair’s wave']} fill={TEXT_COLOR} bold size={11} />
      <SvgLines x={20} y={38} lines={['Trial values: imagined for the question, not a real pair.']} fill={IMAGINED_COLOR} size={9} />
      {/* The band that 15 years of timing can pick out: from the lowest frequency to the right end. */}
      <rect x={rx(trial.lowestPosition)} y={rulerY - 38} width={x1 - rx(trial.lowestPosition)} height={76} fill={CALC_COLOR} opacity={0.16} />
      <line x1={rx(trial.lowestPosition)} y1={rulerY - 38} x2={rx(trial.lowestPosition)} y2={rulerY + 38} stroke={CALC_COLOR} strokeWidth={1.5} />
      <SvgLines x={rx(trial.lowestPosition) + 6} y={rulerY + 52} lines={[`cyan band: waves that ${OBSERVING_SPAN_YEARS} years of timing can pick out (from about ${n1(trial.lowestNanohertz)} nHz up)`]} fill={CALC_COLOR} size={9} />
      {/* The ruler. */}
      <line x1={x0} y1={rulerY} x2={x1} y2={rulerY} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {FREQUENCY_TICKS.map((t) => (
        <g key={t.nanohertz}>
          <line x1={rx(frequencyRulerPosition(t.nanohertz))} y1={rulerY - 4} x2={rx(frequencyRulerPosition(t.nanohertz))} y2={rulerY + 4} stroke={MUTED_COLOR} />
          <SvgLines x={rx(frequencyRulerPosition(t.nanohertz))} y={rulerY + 17} lines={[t.label]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}
      <SvgLines x={x1} y={rulerY + 30} lines={['nanohertz (nHz), going up in steps of ten']} fill={MUTED_COLOR} size={9} anchor="end" />
      {/* Picture 1's pair: calculated, so cyan and dashed. */}
      <line x1={rx(exPos)} y1={rulerY - 34} x2={rx(exPos)} y2={rulerY + 34} stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="5 4" />
      <SvgLines x={rx(exPos)} y={rulerY + 68} lines={[`dashed line: Picture 1’s pair (1 billion Suns each, 0.01 parsecs apart), ${n1(ex.frequencyNanohertz)} nHz`]} fill={CALC_COLOR} size={9} anchor="middle" />
      {/* The trial pair: imagined, so pink. */}
      <line x1={dotX} y1={rulerY - 56} x2={dotX} y2={rulerY} stroke={IMAGINED_COLOR} strokeWidth={1.5} />
      <circle cx={dotX} cy={rulerY} r={7} fill={IMAGINED_COLOR} stroke="#ffffff" strokeWidth={1} />
      <rect x={boxX} y={rulerY - 92} width={boxW} height={36} rx={4} fill="#0b1020" stroke={IMAGINED_COLOR} strokeWidth={2} />
      <SvgLines x={boxX + boxW / 2} y={rulerY - 76} lines={['YOUR TRIAL PAIR', `${nanohertzText(trial.binary.frequencyNanohertz)} nHz`]} fill={IMAGINED_COLOR} bold size={10} anchor="middle" />
      {/* The readout. */}
      <SvgLines
        x={20}
        y={262}
        lines={[
          `Trial pair: two black holes of ${MASS_TRIAL_LABELS[trial.binary.mass1Solar] ?? ''}, ${trial.binary.separationPc} parsecs apart.`,
          `One wave cycle lasts about ${cycleText(trial.binary.waveCycleYears)}, so ${cyclesText(trial.cyclesIn15Years)} cycles fit in ${OBSERVING_SPAN_YEARS} years.`,
          `Its wave ${verdict}.`,
        ]}
        fill={TEXT_COLOR}
        size={10}
      />
    </svg>
  )
}

export function PulsarTimingBackgroundExperiment() {
  const [cycleGuess, setCycleGuess] = useState<CycleChoiceId | null>(null)
  const [shiftGuess, setShiftGuess] = useState<ShiftChoice | null>(null)
  const [trialMass, setTrialMass] = useState<number>(1e9)
  const [trialSeparation, setTrialSeparation] = useState<number>(0.01)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = cycleGuess !== null && shiftGuess !== null

  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) setStage(stage + 1)
      else setStatus('complete')
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage])

  const startOver = () => {
    setCycleGuess(null)
    setShiftGuess(null)
    setTrialMass(1e9)
    setTrialSeparation(0.01)
    setStatus('idle')
    setStage(0)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }
  const pic = pictureOne()
  const b = pic.pair
  const pic2 = pictureTwo()
  const trial = trialPicture(trialMass, trialSeparation)
  const exampleFrequency = examplePair().frequencyNanohertz
  const exampleCycleYears = examplePair().waveCycleYears
  return (
    <div>
      <h2>Experiment 22 — Does the Universe Hum? (Pulsar Timing Arrays)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): there is strong evidence, at about 3 to 4 sigma in the best-known data set, for a faint background of gravitational waves of a different kind
            from the ones LIGO detects. No team has yet announced the 5 sigma that is the usual bar for a discovery, and the teams are combining their data to try to reach it. The most likely source is
            many pairs of supermassive black holes, but this is not proven. The numbers, and where each comes from, are shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The question.</strong> In Gravitational Waves Experiments 1 and 2 you saw that two black holes circling each other send out gravitational waves, ripples in spacetime, and that the
            waves change as the pair spirals in. The detectors LIGO and Virgo pick up waves from pairs of black holes of a few tens of times the mass of the Sun, in the last moments before they merge. But
            these are not the only black holes there are, and a pair of them circling each other is not the only way to make a wave. This experiment asks about a different kind of wave, from much heavier black holes,
            and about a very different kind of detector.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Much heavier black holes.</strong> At the centre of most large galaxies there is a supermassive black hole, millions or billions of times as heavy as the Sun. Our own galaxy has one,
            Sagittarius A*, and in Experiment 21 you met another, M87*, of 6.5 billion Suns. Galaxies sometimes merge, and when two galaxies merge, the supermassive black holes at their centres can end up in
            the same galaxy. Over time they can drift towards each other and begin to circle one another: two enormous black holes, in orbit. Just as a pair of small black holes sends out gravitational waves,
            so does a pair of enormous ones.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The big question about such a pair</strong> is what its waves are like. For two black holes in orbit, you can work that out from how heavy they are and how far apart they circle, using the
            same law (Kepler’s law) that gives the Earth’s year. It is your job, in a moment, to guess how long one cycle of such a wave lasts, and then to see how it compares with the waves LIGO detects.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What is a pulsar?</strong> To look for waves from such a pair we use stars as clocks. A <strong>neutron star</strong> (Frontier and Beyond Experiment 15) is the core left over when a heavy
            star explodes: a sphere about 12 kilometres across, with more mass than the Sun. Some neutron stars spin and give out a narrow beam of radio waves from near their magnetic poles. As the star spins, the beam sweeps
            round the sky, like the light of a lighthouse. From far away, you do not see a steady light, you see a flash each time the beam points at you. A neutron star seen this way is called a
            <strong> pulsar</strong>, because it pulses.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why does a neutron star send out a beam?</strong> Two things make it happen.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <em>It has a huge magnetic field.</em> The Earth has a magnetic field too, which is why a compass works. A neutron star’s field is enormously stronger. The reason is its size. When the core of a
            heavy star collapses into a sphere 12 kilometres across, its magnetic field lines are squeezed into a much smaller space, like a handful of threads pulled tight into a bundle. Squeezed lines mean a
            much stronger field.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <em>It spins, and its magnetic poles are not at its spin poles.</em> The Earth’s magnetic north is not exactly where its spin axis points. A neutron star is the same, only more so: its magnetic
            axis is tilted away from its spin axis.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            Now put the two together. A strong magnetic field that spins quickly creates a powerful electric force near the star’s surface. The force launches charged particles from the star, and they
            speed up until they are moving at close to the speed of light. Charged particles move easily along magnetic field lines, not across them. Near the two magnetic poles the field lines reach far out
            into space, so the particles stream away along them in two narrow streams, like water from a fountain. The streams give out radio waves, in a narrow cone above each magnetic pole. Scientists are
            still working out exactly how the particles make radio waves, so that part is not fully understood.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why a lighthouse?</strong> The beam leaves from the magnetic poles, and those are tilted away from the spin axis. As the star spins, the beam sweeps round the sky like a torch held at an
            angle by someone turning on the spot. If the beam happens to sweep across the Earth, we see a flash once per turn. If it points elsewhere, we never see the star at all. The energy for the beam
            comes from the star’s spin, so a pulsar slowly loses spin over a very long time, and when its electric force is no longer strong enough to make beams, it stops pulsing.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why pulsars make good clocks.</strong> The fastest ones, <strong>millisecond pulsars</strong>, spin hundreds of times every second, and they spin so steadily that they approach the
            steadiness of the best atomic clocks on Earth. Each pulse arrives at a radio telescope on Earth at a time that can be predicted very precisely. Think of a very steady drummer in a faraway field:
            if the beats you hear are always exactly evenly spaced, then any beat that comes a tiny bit early or late tells you something happened to the sound on its way to you.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How a gravitational wave could change the pulses.</strong> You saw in Gravitational Waves Experiment 1 that a passing wave stretches and squeezes space. If a wave passes through the space
            between the Earth and a pulsar, then for a moment that space is a little longer or a little shorter, so a pulse takes a little longer or a little less time to arrive. The pulse arrives a little late, or a
            little early, compared with its expected time. The shift is tiny, so the detector has to watch the pulses for years. The size of the shift is the second thing you will be asked to guess.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why watch for years?</strong> There are three reasons.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <em>One pulse is not enough.</em> Each single pulse arrives with a little random wobble in its timing, from the star itself and from the thin gas between the star and us. This wobble is much
            bigger than the shift a gravitational wave causes. Think of trying to see the tide by looking at the sea for one second: the splashing of the small waves hides it. If you take thousands of pulses
            and average them, the random wobbles cancel out and the steady shift is left. Averaging takes thousands of pulses, and that takes time.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <em>A wave has to be seen going up and down.</em> A gravitational wave does not shift the pulses in one direction for ever. The shift grows, shrinks, and grows again as the wave passes. To tell
            this from a plain drift, you need to watch the arrival times long enough to see them rise and fall at least once, the way you only know the tide is a tide after watching the water rise and fall. A
            wave that takes a long time to go through one cycle needs a long record.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <em>Many pulsars have to agree.</em> The wave is shared by all the pulsars, in a particular pattern across the sky. A wobble in one pulsar could be that one star’s own trouble. When dozens of
            pulsars show the same pattern, over years, it is much harder to blame chance. This is why the teams keep adding years of data, and why they now combine their arrays.
          </p>
          <p style={paragraph}>
            This is a very different kind of detector from LIGO. The “arms” are the paths from the pulsars to the Earth, and there are dozens of them, pointing in different directions across our galaxy. The
            group of pulsars watched together is called a <strong>pulsar timing array</strong>. Several teams around the world have built one, and they are now combining their data.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>A hum, not a single voice.</strong> There are many such pairs of supermassive black holes in the universe, and each sends out its own waves. If you add the waves from all of them, you do not get
            one clear signal. You get a steady, faint <strong>background</strong>, like the murmur of a crowd, in which you cannot pick out one voice. That is why this experiment is called “Does the universe hum?”.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How sure is the result?</strong> In 2023, teams reported evidence for such a background. The most-quoted result is the 15-year data set of a team called NANOGrav, and it is stated as
            evidence, not as a discovery. Scientists measure how sure a result is in <strong>sigma</strong>. Roughly, the bigger the number, the harder it is to say the result is just chance. About 3 sigma
            is often called a hint or evidence, and 5 sigma is the usual bar for a discovery. This page will show where each team stands, and what the result can and cannot say.
          </p>

          <p style={paragraph}>
            <strong>What this page does and does not model.</strong> It works out, with one law and two short formulas, what the waves from a pair of supermassive black holes are like and how big the shift in
            a pulse’s arrival time is. It does not model the pulsars’ own irregularities, the data analysis that picks the signal out of the noise, how many pairs there are, how pairs come to be so close,
            or the other explanations that have been proposed for the signal. The numbers for the real results are published ones.
          </p>


          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions and press Run. Later steps will draw the pictures one stage at a time, and then let you try other values in a part of its own.
            Nothing here is graded. Your predictions are your own guesses, made before you see anything. They never change the real pictures or the tables, which come from the physics and the published
            numbers. Your guesses will be drawn on top of the real pictures, in white, so you can compare each guess with the real result, and they will be shown again beside the results. The page will have
            four parts: first you predict and watch the pictures; then, in “Now try it yourself”, you can choose the mass of each black hole in a pair and how far apart they are, and watch a drawing follow your
            choices; then come the results; and last a tutor asks you some questions. The real pictures and the results tables never change. Your white guess marks appear on the real pictures, and only the
            drawing in “Now try it yourself” follows your choices.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The pages of the teams themselves, and the papers, are listed
            after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-pulsars/">NASA: Pulsars</ExternalLink>: NASA’s account of pulsars, spinning neutron stars whose
              beams sweep across space like a lighthouse, how the beams are made, and the fastest ones, the millisecond pulsars.
            </li>
            <li>
              <ExternalLink href="https://public.nrao.edu/radio-astronomy/pulsars/">NRAO: Pulsars</ExternalLink>: the National Radio Astronomy Observatory’s plain account of how a collapsing star’s
              magnetic field is squeezed stronger, and how the magnetic poles act like fountains whose beam sweeps past us like a lighthouse.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA: Black Holes</ExternalLink>: NASA’s overview of black holes, including the supermassive ones at the centres of
              galaxies, with links to their types.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed things: a calculation
            for a pair of black holes, and published numbers for the real results. They are the same for everyone. When they are drawn, your guesses appear on them in white, so you can see how each guess
            compares with the real result. The real pictures stay the same whatever you guess.
          </p>

          {(
            [
              {
                title: 'Prediction 1: how long does one cycle of the wave last?',
                text: (
                  <>
                    Two supermassive black holes, each a billion times as heavy as the Sun, circle each other. They are 0.01 parsecs apart, which is about 0.03 light-years, or roughly 2,000 times the distance
                    from the Earth to the Sun. Such a pair sends out gravitational waves. A wave goes through one cycle (one full up-and-down) and then repeats. How long does one cycle of this pair’s wave last?
                  </>
                ),
                choices: CYCLE_CHOICES.map((c) => ({ value: c.id as string, label: CYCLE_LABELS[c.id] })),
                value: cycleGuess as string | null,
                set: (v: string) => setCycleGuess(v as CycleChoiceId),
              },
              {
                title: 'Prediction 2: how much earlier or later does a pulse arrive?',
                text: (
                  <>
                    A gravitational wave of the kind that the NANOGrav team reports squeezes and stretches space by a very small fraction: about 2.4 parts in a million billion (a million billion is 1 followed by 15
                    zeros). The pulses of a millisecond pulsar arrive every few thousandths of a second. Because of such a wave, a pulse arrives a little earlier or later than it would otherwise. About how
                    big is that shift, in billionths of a second (nanoseconds)? This is a separate guess from Prediction 1, so your two answers do not have to agree with each other. The choices below are sizes of the shift. A pulse can arrive earlier or later by that amount, as the wave passes, so you are guessing
                    how big the shift gets, not which way it goes.
                  </>
                ),
                choices: SHIFT_CHOICES_NANOSECONDS.map((c) => ({ value: String(c), label: SHIFT_LABELS[c] })),
                value: shiftGuess === null ? null : String(shiftGuess),
                set: (v: string) => setShiftGuess(Number(v) as ShiftChoice),
              },
            ] as const
          ).map((question) => (
            <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>{question.text} You are not graded, and a guess is fine.</p>
              <div>
                {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => (question.set as (v: string) => void)(choice.value)}
                    disabled={recorded}
                    className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                {question.value !== null
                  ? `Your prediction: ${(question.choices as ReadonlyArray<{ value: string; label: string }>).find((c) => c.value === question.value)?.label.toLowerCase()}.`
                  : 'Choose an option to continue'}
              </p>
            </div>
          ))}

          <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || recorded} style={{ padding: '0.6rem 1.5rem' }}>
            Run
          </button>
          {recorded && (
            <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
              Start over
            </button>
          )}
          {!bothPredicted && !recorded && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
          )}

          {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
          <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
            {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The picture fills in, one stage at a time, after you press Run.</span>}
            {status !== 'idle' && (
              <span>
                <strong>{done ? 'Run complete.' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}.`}</strong>{' '}
                {done ? 'Pictures 1 and 2 are drawn. Your predictions are recorded and not marked here. The rest of the page is built in later steps.' : STAGE_LINES[stage]}
              </span>
            )}
          </p>

          {stage >= 1 && (
            <div>
              <PictureOne stage={stage} cycleGuess={cycleGuess} />
              <CaptionBlock
                title="Picture 1"
                intro="Panel A is a sketch of a pair of black holes seen from above, not drawn to scale. Panel B, which appears from stage 3, is a ruler for the length of one wave cycle, on a different scale from panel A."
                bullets={[
                  ...(stage >= 1 ? [<><strong>The two violet circles</strong> are the two supermassive black holes. Each is {commas(b.mass1Solar / 1e9)} billion times as heavy as the Sun. They are {b.separationPc} parsecs apart, which is about {commas(pic.separationAu)} times the distance from the Earth to the Sun.</>] : []),
                  ...(stage >= 2
                    ? [
                        <><strong>The dashed cyan circle</strong> is the path they follow round each other. One trip round it, one orbit, takes {n2(b.orbitalPeriodYears)} years. It is calculated here from their masses and their distance apart, with the same law (Kepler’s law) that gives the Earth’s year.</>,
                        <><strong>The cyan wave</strong> is the gravitational wave they send out. It goes through {pic.waveCyclesPerOrbit} cycles for every orbit, so <strong>one wave cycle lasts half an orbit: {n2(b.waveCycleYears)} years</strong>. A cycle is one full up-and-down.</>,
                      ]
                    : []),
                  ...(stage >= 3
                    ? [
                        <><strong>Panel B</strong> is a ruler of times from a thousandth of a second (1 ms) up to a hundred years and beyond. It goes up in steps of ten, so each step to the right multiplies the length by ten, and a very short time and a very long one fit on the same ruler.</>,
                        <><strong>The cyan dot and the dashed line above it</strong> mark this pair’s wave cycle, {n2(b.waveCycleYears)} years, calculated here.</>,
                        <><strong>The white marker, with the box “YOUR GUESS”,</strong> is your guess for Prediction 1. It sits at the cycle length you guessed.</>,
                      ]
                    : []),
                  ...(stage >= 4
                    ? [<><strong>The orange bar</strong> is the range of cycle lengths of the waves that LIGO detected in its first event. The wave swept up from 35 to 250 hertz (cycles per second), so a cycle lasted from {msText(pic.ligo.longestSeconds)} milliseconds down to {msText(pic.ligo.shortestSeconds)}.</>]
                    : []),
                  ...(stage >= 5
                    ? [<><strong>The cyan band</strong> is the range of cycle lengths that {pic.span.years} years of pulsar timing can pick out. A wave has to complete at least one cycle in the data, so the longest cycle it can pick out is about {pic.span.years} years (the bright line). The band fades to the left because the shortest cycle it can pick out depends on how often the pulsars are timed, which this page does not model.</>]
                    : []),
                ]}
                worked={
                  stage >= 2 ? (
                    <>
                      The orbit takes {n2(b.orbitalPeriodYears)} years. The wave has {pic.waveCyclesPerOrbit} cycles in each orbit, so one cycle is {n2(b.orbitalPeriodYears)} ÷ {pic.waveCyclesPerOrbit} = {n2(b.waveCycleYears)} years. For comparison, the Earth’s orbit
                      round the Sun takes one year.
                    </>
                  ) : null
                }
                lookFor={[
                  ...(stage >= 2
                    ? [
                        {
                          look: 'the cyan wave beside the orbit.',
                          means: `there are ${pic.waveCyclesPerOrbit} cycles of the wave in the ${n2(b.orbitalPeriodYears)} years of one orbit, so one cycle is ${n2(b.waveCycleYears)} years.`,
                          matters: 'the length of the wave’s cycle, not of the orbit, is what a detector sees, and it is half as long as the orbit.',
                        },
                      ]
                    : []),
                  ...(stage >= 3
                    ? [
                        {
                          look: 'the cyan dot, against the white marker.',
                          means: `this pair’s wave cycle is ${n2(b.waveCycleYears)} years, which is about ${commas(b.waveCycleSeconds / 1e6)} million seconds, and your guess sits at the white marker.`,
                          matters: 'it shows at a glance how your guess compares with the real result. The tutor says what that means.',
                        },
                      ]
                    : []),
                  ...(stage >= 4
                    ? [
                        {
                          look: 'the orange bar, far to the left of the cyan dot.',
                          means: `LIGO’s waves have cycles of ${msText(pic.ligo.shortestSeconds)} to ${msText(pic.ligo.longestSeconds)} milliseconds. This pair’s cycle is about ${(pic.pairOverLigoLongest / 1e9).toFixed(1)} billion times longer than LIGO’s longest.`,
                          matters: 'the two kinds of wave are enormously different, so they need enormously different detectors.',
                        },
                      ]
                    : []),
                  ...(stage >= 5
                    ? [
                        {
                          look: 'the cyan band, and where the dot sits in it.',
                          means: `the dot is inside the band: in ${pic.span.years} years the pair’s wave would go through about ${n1(pic.span.cyclesForPair)} cycles.`,
                          matters: 'a wave with several cycles in the data can be picked out as a wave. One with a cycle longer than the data could not be seen as a wave at all.',
                        },
                      ]
                    : []),
                ]}
                whereFrom={
                  <>
                    <strong>Measured:</strong> LIGO’s range, 35 to 250 hertz, is from the abstract of the discovery paper of its first event (Physical Review Letters, 2016), which was read as an abstract only. <strong>Calculated here:</strong> the orbit and the
                    wave’s cycle, from Kepler’s law, and the band that {pic.span.years} years can pick out, from a rough rule (the longest cycle is about the length of the data; the {pic.span.years}-year length is the NANOGrav data set’s). <strong>Imagined for the question:</strong>{' '}
                    the pair itself: two black holes of a billion Suns each, {b.separationPc} parsecs apart, chosen for the question, not a pair known to exist. Your guess is drawn in white and never changes the real picture.
                  </>
                }
              />
            </div>
          )}

          {stage >= 6 && (
            <div>
              <PictureTwo shiftGuess={shiftGuess} />
              <CaptionBlock
                title="Picture 2"
                intro="Panel A is a sketch of a pulsar, the Earth and the path of a pulse between them, with and without a gravitational wave. Panel B is a ruler for how much earlier or later a pulse arrives, on a different scale from panel A."
                bullets={[
                  <><strong>The amber circle</strong> on the left is a pulsar, and <strong>the blue circle</strong> on the right is the Earth. Each time the pulsar’s beam sweeps past the Earth, a pulse of radio waves travels along the path between them.</>,
                  <><strong>The grey line</strong> is that path with no wave passing, with evenly spaced marks along it. <strong>The cyan line</strong> is the same path while a gravitational wave passes: the marks bunch together in some places and spread apart in others, because the wave stretches space in some places and squeezes it in others. This is hugely exaggerated. The real change is about {(pic2.strain * 1e15).toFixed(1)} parts in a million billion.</>,
                  <><strong>Panel B</strong> is a ruler of times from 0.01 nanoseconds (ns) to 10 milliseconds (ms). A nanosecond is a billionth of a second, and a millisecond is a thousandth. It goes up in steps of ten, so each step to the right multiplies the time by ten.</>,
                  <><strong>The cyan dot, and the pale cyan band round it,</strong> are the calculated shift in a pulse’s arrival time. The band runs from the shift for the lowest published wave strength ({(pic2.strainLow * 1e15).toFixed(1)}) to the one for the highest ({(pic2.strainHigh * 1e15).toFixed(1)}), because the strength has a give-or-take (2.4 + 0.7 − 0.6).</>,
                  <><strong>The pink line</strong> marks an example pulse every millisecond. It is imagined for the question: a fast pulsar’s pulses are a few milliseconds apart, and the line is only there to show how big the shift is next to the gap between pulses.</>,
                  <><strong>The white marker, with the box “YOUR GUESS”,</strong> is your guess for Prediction 2. It sits at the shift you guessed.</>,
                ]}
                worked={
                  <>
                    The strength reported for the wave is {(pic2.strain * 1e15).toFixed(1)} × 10⁻¹⁵ at a frequency of 1 per year, which is {(pic2.referenceFrequencyHz * 1e8).toFixed(1)} × 10⁻⁸ hertz. A rough estimate of the shift is the strength divided by (2π times the frequency):{' '}
                    {(pic2.strain * 1e15).toFixed(1)} × 10⁻¹⁵ ÷ (6.28 × {(pic2.referenceFrequencyHz * 1e8).toFixed(1)} × 10⁻⁸) = {n1(pic2.shiftNanoseconds)} × 10⁻⁹ seconds, which is {n1(pic2.shiftNanoseconds)} nanoseconds. This is a rough standard estimate, not a result
                    from a paper.
                  </>
                }
                lookFor={[
                  {
                    look: 'the grey path and the cyan path.',
                    means: `the wave stretches and squeezes the path a little, so a pulse takes slightly longer or shorter to arrive. The real change in the path is about ${(pic2.strain * 1e15).toFixed(1)} parts in a million billion, far smaller than drawn.`,
                    matters: 'that tiny change in travel time is the only sign of the wave that the Earth can measure.',
                  },
                  {
                    look: 'the cyan dot and its pale band on the ruler.',
                    means: `the calculated shift is about ${n1(pic2.shiftNanoseconds)} billionths of a second, with a range of ${n1(pic2.shiftLowSeconds * 1e9)} to ${n1(pic2.shiftHighSeconds * 1e9)}.`,
                    matters: 'this is the size of change that the timing has to notice, and the give-or-take on the wave’s strength gives it a range, not one exact value.',
                  },
                  {
                    look: 'the cyan dot, beside the pink line.',
                    means: `a pulse every millisecond is about ${commas(pic2.pulsePeriodOverShift)} times longer than the shift.`,
                    matters: 'the shift is a tiny fraction of the gap between pulses, which is why very steady clocks and years of timing are needed.',
                  },
                  {
                    look: 'the white marker.',
                    means: 'your guessed shift, beside the real one.',
                    matters: 'it shows at a glance how your guess compares with the real result. The tutor says what that means.',
                  },
                ]}
                whereFrom={
                  <>
                    <strong>Measured:</strong> the wave’s strength, 2.4 (+0.7, −0.6) × 10⁻¹⁵ at 1 per year, by the NANOGrav team, from the abstract of its 15-year paper, which was read as an abstract only. <strong>Calculated here:</strong> the shift and its range, from a
                    rough standard estimate that has no source read, and the strength’s give-or-take taken as simple low and high ends. <strong>Imagined for the question:</strong> the sketch of the pulsar and the Earth, the exaggerated stretch and the pulse every millisecond. Your guess
                    is drawn in white and never changes the real picture.
                  </>
                }
              />
            </div>
          )}
        </div>

        {done && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #be185d' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#be185d' }}>Part 2: Now try it yourself</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>What we are about to do.</strong> Above, you saw one pair of black holes: two of a billion Suns each, 0.01 parsecs apart (the dashed cyan line below). Here you can try other
              pairs. Pick how heavy each black hole is and how far apart the two are, and one drawing will show how fast the wave from your pair goes through its cycles, and whether 15 years of timing could
              pick it out. The real pictures above do not change, and your two guesses do not change this drawing: only the two settings below do.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>These are your own trial values, not real pairs.</strong> Each button is a number to try. For example, if you choose {MASS_TRIAL_LABELS[trialMass]} and{' '}
              {trialSeparation} parsecs, the drawing works out the wave of a pair like that, with the same law as in Picture 1 (Kepler’s law). Such a pair is imagined for the question, and it is drawn in pink.
              The two black holes are taken to have the same mass.
            </p>

            {(
              [
                {
                  title: 'How heavy is each black hole?',
                  choices: TRIAL_MASS_CHOICES_SOLAR.map((v) => ({ value: v, label: MASS_TRIAL_LABELS[v] })),
                  value: trialMass,
                  set: setTrialMass,
                },
                {
                  title: 'How far apart are the two black holes?',
                  choices: TRIAL_SEPARATION_CHOICES_PC.map((v) => ({ value: v, label: separationLabel(v) })),
                  value: trialSeparation,
                  set: setTrialSeparation,
                },
              ] as const
            ).map((control) => (
              <div key={control.title} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{control.title}</label>
                <div>
                  {control.choices.map((choice) => (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => (control.set as (v: number) => void)(choice.value)}
                      className={`toggle-button${control.value === choice.value ? ' is-selected' : ''}`}
                      style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <TrialDrawing trial={trial} />
            <CaptionBlock
              title="Drawing A"
              intro={`It shows how fast the gravitational wave from your trial pair goes through its cycles. The ruler is a ruler of frequency in nanohertz (nHz). A hertz is one cycle a second, so a nanohertz is a billionth of that: one cycle every 31.7 years. The ruler goes up in steps of ten (0.1, 1, 10, 100 and so on), so that very slow and very fast waves fit on one line. A higher number means a faster wave and a shorter cycle.`}
              bullets={[
                <><strong>The pink dot, in the box “YOUR TRIAL PAIR”,</strong> is the frequency of the wave from your trial pair. It is calculated here, from the masses and the separation you chose, for a pair that is imagined for the question.</>,
                <><strong>The cyan band</strong> shows which waves {OBSERVING_SPAN_YEARS} years of timing can pick out. Think of watching a swing for {OBSERVING_SPAN_YEARS} years: you can only tell that it is swinging if you see it go back and forth at least once
                  in that time. A wave is the same. It has to go through at least one whole cycle while the pulsars are being timed. A wave that takes exactly {OBSERVING_SPAN_YEARS} years for one cycle has a frequency of
                  1 cycle in {OBSERVING_SPAN_YEARS} years, which is about {n1(trial.lowestNanohertz)} nHz, and that is where the band starts (its left edge). A wave with a shorter cycle has a higher frequency, so it is
                  further to the right, inside the band. A wave with a longer cycle is to the left of the band, so it is too slow to be picked out as a wave. Picture 1 showed the same band by the length of the cycle, where the band
                  ran from short cycles up to about {OBSERVING_SPAN_YEARS} years. Here it is drawn by frequency, so the order is turned round: shorter cycles are to the right.</>,
                <><strong>The cyan dashed line</strong> is a fixed mark for the pair you met in Picture 1: two black holes of a billion Suns each, 0.01 parsecs apart. Its wave goes through one cycle in about{' '}
                  {n1(exampleCycleYears)} years, which is {n1(exampleFrequency)} nHz. The line stays where it is when you change a setting, so you can see how far your trial pair’s pink dot moves away from it.</>,
                <><strong>The ruler goes up in steps of ten</strong>, so equal distances along it mean equal multiples of the frequency, not equal amounts.</>,
                <><strong>The three lines of text underneath</strong> give your pair’s numbers: its masses and separation, the length of one wave cycle and how many cycles fit in {OBSERVING_SPAN_YEARS} years, and whether the wave has at least one cycle in that time.</>,
              ]}
              worked={
                <>
                  You chose {MASS_TRIAL_LABELS[trialMass]} and {trialSeparation} parsecs apart. That is {n2(trial.frequencyOverExample)} times the frequency of Picture 1’s pair. Its wave goes through
                  one cycle in about {cycleText(trial.binary.waveCycleYears)}, which is {nanohertzText(trial.binary.frequencyNanohertz)} nHz, so {OBSERVING_SPAN_YEARS} years ÷ {cycleText(trial.binary.waveCycleYears)} ={' '}
                  {cyclesText(trial.cyclesIn15Years)} cycles in {OBSERVING_SPAN_YEARS} years.
                  {trial.frequencyOverExample === 1 ? ' These are the same values as Picture 1’s pair, so the pink dot sits on the cyan dashed line.' : ''}
                </>
              }
              lookFor={[
                {
                  look: 'the pink dot, against the cyan band.',
                  means: `your trial pair’s wave is at ${nanohertzText(trial.binary.frequencyNanohertz)} nHz, ${trial.fits ? 'inside' : 'to the left of'} the band, with ${cyclesText(trial.cyclesIn15Years)} cycles in ${OBSERVING_SPAN_YEARS} years.`,
                  matters: 'a wave with at least one cycle in the data can be picked out as a wave. A wave with less than one cycle in the data would show only as a slow drift, and could not be seen as a wave.',
                },
                {
                  look: 'the pink dot, beside the cyan dashed line.',
                  means: `your pair’s wave has ${n2(trial.frequencyOverExample)} times the frequency of Picture 1’s pair.`,
                  matters: 'the frequency is set by the two settings together, so changing either one moves the dot. Changing only one at a time shows what each does.',
                },
              ]}
              whereFrom={
                <>
                  <strong>Measured:</strong> nothing in Drawing A is a measurement. <strong>Calculated here:</strong> the dashed line (Picture 1’s pair) and the pink dot, from Kepler’s law, with the wave’s frequency
                  twice the pair’s orbital frequency; and the edge of the cyan band, from the rough rule that the lowest frequency {OBSERVING_SPAN_YEARS} years can pick out is about 1 ÷ {OBSERVING_SPAN_YEARS} years.{' '}
                  <strong>Imagined for the question:</strong> the trial pair itself, in pink: its masses and its separation are chosen by you, and no such pair is known to exist. These are trial values and do not say
                  that a real pair is like that.
                </>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
