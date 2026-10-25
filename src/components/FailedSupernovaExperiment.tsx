import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  apjlPushErgRange,
  failedDots,
  failedRange,
  FAILED_SUPERNOVA_DATA,
  guessDots,
  guessPushErg,
  logScalePosition,
  massPicture,
  pushOneInRange,
  readings,
  remnantOverLimits,
  runCheckUp,
  runFailedSupernova,
  SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
  supernovaSpreadFactor,
  timeline,
} from '../physics/failedSupernova'
import type { CountAnswer, FailedSupernovaResult, PushAnswer } from '../physics/failedSupernova'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { FailedSupernovaTutor } from './FailedSupernovaTutor'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 17 (docs/experiments/frontier-and-beyond/17-a-star-that-vanished.md).
// STEPS 2 to 4 (the interface skeleton, the predictions, and the run with its three pictures): this file has the status line, the introduction, one illustration (an ordinary
// supernova beside a failed one) with its guide, the new-word list, the collapsed "Words and formulas" panel, the "Want to know more?" links, the two predictions, and Part 1: a
// five-stage run that builds three pictures (what telescopes saw; what is left of the star and how strong the push was; how many stars fail). The learner's guesses are drawn on
// Pictures 2 and 3 in white, beside the real results (the owner's rule of 2026-10-24, CLAUDE.md §14), and the real pictures never change. STEP 5a adds Part 2 (two controls with a drawing each, shown after the run). STEP 5b adds Part 3 (the results: a status box, the predictions beside the results, a check-up and three tables, each with a note). STEP 6 adds Part 4, the tutor (FailedSupernovaTutor.tsx). It has no chapter
// summary yet; those are later steps (CLAUDE.md §6). The timer only paces the display (CLAUDE.md §11). Every number comes from src/physics/failedSupernova.ts (CLAUDE.md §9). The page is built to the plan in the specification: an introduction and four parts (predict and watch, now try it yourself, the results, the
// tutor). The few published numbers the introduction states are read from src/physics/failedSupernova.ts (CLAUDE.md §9). All wording is a DRAFT for the owner's line-by-line
// approval (CLAUDE.md §28.1) and is written to the standard of §29. Nothing here gives the answer to either prediction (CLAUDE.md §12): not the strength of the push, and not
// how many stars fail. The papers that give those numbers are listed only after the run.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const STAR_COLOR = '#fb923c' // orange: the star before it collapses
const FLASH_COLOR = '#fde047' // yellow: the strong push and the bright flash of an ordinary supernova
const NEUTRON_STAR_COLOR = '#c4b5fd' // light violet: a neutron star
const BLACK_HOLE_COLOR = '#f87171' // red: a black hole, and the inward fall of the outer layers
const DUST_COLOR = '#a16207' // brown: a cloud of dust

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <>
      {lines.map((line, i) => (
        <text key={i} x={x} y={y + i * (size + 2)} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor} stroke={fill === '#0b1020' ? 'none' : '#0b1020'} strokeWidth={3} paintOrder="stroke">
          {line}
        </text>
      ))}
    </>
  )
}

// A short arrow from (x1, y1) to (x2, y2), with a small head at the end.
function Arrow({ x1, y1, x2, y2, color, width = 2.5 }: { x1: number; y1: number; x2: number; y2: number; color: string; width?: number }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 6
  const a1 = angle + Math.PI - 0.45
  const a2 = angle + Math.PI + 0.45
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} />
      <path d={`M ${x2} ${y2} L ${x2 + head * Math.cos(a1)} ${y2 + head * Math.sin(a1)} L ${x2 + head * Math.cos(a2)} ${y2 + head * Math.sin(a2)} Z`} fill={color} />
    </g>
  )
}

// ---- Illustration: an ordinary supernova beside a failed one (a sketch of the idea, not to scale, and not any particular star) ----
const ROW_A_Y = 128
const ROW_B_Y = 322
// Four short arrows pointing out of (cx, cy), or into it, along the diagonals.
function RadialArrows({ cx, cy, inner, outer, color, inward }: { cx: number; cy: number; inner: number; outer: number; color: string; inward: boolean }) {
  const d = Math.SQRT1_2
  return (
    <>
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sy], i) => {
        const from = inward ? outer : inner
        const to = inward ? inner : outer
        return <Arrow key={i} x1={cx + sx * d * from} y1={cy + sy * d * from} x2={cx + sx * d * to} y2={cy + sy * d * to} color={color} width={2} />
      })}
    </>
  )
}

function VanishingDrawing() {
  const height = 456
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale, in two rows. Row A, an ordinary supernova: an orange circle, the star, then an arrow labelled the core collapses, then a small violet circle, the neutron star left behind, with four yellow arrows pointing outwards from it, the strong push that throws the outer layers out, then an arrow, then a large yellow burst, the bright flash a telescope sees. Row B, a failed supernova, which is an idea and not an observation: the same orange circle, then the same arrow, then a small dark circle with a red outline, a black hole, with four short red arrows pointing inwards to it, the outer layers falling back, then an arrow, then a brown dashed cloud around a small black hole, with no flash, the star seems to vanish."
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: an ordinary supernova beside a failed one
      </text>

      {/* Row A: an ordinary supernova. */}
      <SvgLines x={20} y={50} lines={['A. An ordinary supernova (Experiment 13)']} fill={TEXT_COLOR} bold size={12} />
      <circle cx={70} cy={ROW_A_Y} r={30} fill={STAR_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={70} y={ROW_A_Y + 4} lines={['the star']} fill="#0b1020" bold anchor="middle" size={10} />
      <Arrow x1={108} y1={ROW_A_Y} x2={168} y2={ROW_A_Y} color={MUTED_COLOR} />
      <SvgLines x={138} y={ROW_A_Y - 26} lines={['the core', 'collapses']} fill={MUTED_COLOR} anchor="middle" />
      <RadialArrows cx={235} cy={ROW_A_Y} inner={20} outer={52} color={FLASH_COLOR} inward={false} />
      <circle cx={235} cy={ROW_A_Y} r={12} fill={NEUTRON_STAR_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={235} y={ROW_A_Y + 74} lines={['strong push: the outer', 'layers are thrown out']} fill={FLASH_COLOR} bold anchor="middle" />
      <Arrow x1={300} y1={ROW_A_Y} x2={360} y2={ROW_A_Y} color={MUTED_COLOR} />
      <SvgLines x={330} y={ROW_A_Y - 26} lines={['what a', 'telescope sees']} fill={MUTED_COLOR} anchor="middle" />
      <circle cx={450} cy={ROW_A_Y} r={44} fill={FLASH_COLOR} fillOpacity={0.35} stroke={FLASH_COLOR} strokeWidth={2.5} />
      <circle cx={450} cy={ROW_A_Y} r={22} fill={FLASH_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={450} y={ROW_A_Y + 74} lines={['a bright flash', 'for weeks or months']} fill={FLASH_COLOR} bold anchor="middle" />

      <line x1={20} y1={230} x2={540} y2={230} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="4 4" />

      {/* Row B: a failed supernova (the idea). */}
      <SvgLines x={20} y={252} lines={['B. A failed supernova (the idea, not an observation)']} fill={TEXT_COLOR} bold size={12} />
      <circle cx={70} cy={ROW_B_Y} r={30} fill={STAR_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <SvgLines x={70} y={ROW_B_Y + 4} lines={['the star']} fill="#0b1020" bold anchor="middle" size={10} />
      <Arrow x1={108} y1={ROW_B_Y} x2={168} y2={ROW_B_Y} color={MUTED_COLOR} />
      <SvgLines x={138} y={ROW_B_Y - 26} lines={['the core', 'collapses']} fill={MUTED_COLOR} anchor="middle" />
      <RadialArrows cx={235} cy={ROW_B_Y} inner={20} outer={40} color={BLACK_HOLE_COLOR} inward={true} />
      <circle cx={235} cy={ROW_B_Y} r={12} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} />
      <SvgLines x={235} y={ROW_B_Y + 74} lines={['weak push: the outer layers', 'fall back in']} fill={BLACK_HOLE_COLOR} bold anchor="middle" />
      <Arrow x1={300} y1={ROW_B_Y} x2={360} y2={ROW_B_Y} color={MUTED_COLOR} />
      <SvgLines x={330} y={ROW_B_Y - 26} lines={['what a', 'telescope sees']} fill={MUTED_COLOR} anchor="middle" />
      <circle cx={450} cy={ROW_B_Y} r={44} fill={DUST_COLOR} fillOpacity={0.4} stroke={DUST_COLOR} strokeWidth={2.5} strokeDasharray="5 4" />
      <circle cx={450} cy={ROW_B_Y} r={11} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} />
      <SvgLines x={450} y={ROW_B_Y + 74} lines={['no flash: the star dims', 'and seems to vanish']} fill={BLACK_HOLE_COLOR} bold anchor="middle" />
      <SvgLines x={450} y={ROW_B_Y - 52} lines={['a cloud of dust']} fill={DUST_COLOR} bold anchor="middle" />

      <SvgLines x={20} y={height - 8} lines={['A sketch of the idea. Not to scale, and not any real star. Row B is a proposal that astronomers are testing.']} fill={MUTED_COLOR} />
    </svg>
  )
}

const lookForVanishing: LookFor[] = [
  {
    look: 'the orange circle at the left of both rows, and the arrow after it.',
    means: 'both rows start in exactly the same way: a star whose core has run out of fuel, and then the core collapses. What differs is only what happens next.',
    matters: 'so the difference between a bright supernova and a star that quietly disappears is not in the collapse itself. It is in whether the push that follows is strong enough to get the outer layers out.',
  },
  {
    look: 'the four yellow arrows pointing out in row A, and the four short red arrows pointing in in row B.',
    means: 'in row A the push is strong, and it throws the star’s outer layers out into space. In row B the idea is that the push is too weak, so the outer layers fall back in towards the centre.',
    matters: 'the gas that is thrown out is what makes the bright flash a telescope sees (Experiment 13). Gas that falls back makes no flash, and it adds its weight to the collapsed core.',
  },
  {
    look: 'the right-hand end of each row: the yellow burst in row A, and the brown dashed cloud with a dark centre in row B.',
    means: 'row A ends in a flash that is easy to notice and fades over weeks or months. Row B ends with no flash at all: the star simply gets fainter, and what is left may be hidden inside a cloud of dust.',
    matters: 'a telescope watching for flashes would miss a row-B star. That is why astronomers look in a different way: they watch many bright stars for years and look for one that goes missing.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Failed supernova', meaning: 'the idea that a massive star’s core collapses but the push that follows is too weak to throw the outer layers out, so most of the star falls back in. If the collapsed part is heavy enough, it is a black hole, and to a telescope the star would simply dim and disappear. NASA’s JPL describes it as a star that “blinked out”.' },
  { term: 'Supernova', meaning: 'the explosion of a star at the end of its life, so bright that it can be seen from millions of light-years away for weeks or months. This experiment is about the stars that might skip it. (NASA: “The result is a huge explosion called a supernova.”)' },
  { term: 'Core collapse', meaning: 'what happens when the core of a very heavy star can no longer be held up and falls in on itself in a fraction of a second (Experiment 13). NASA says: “The core collapses and then rebounds, creating a shock wave that travels through the star’s outer layers.”' },
  { term: 'Shock', meaning: 'a sudden wave of push that runs outward through a star’s gas, like the front of a blast. In an ordinary supernova it is strong enough to throw the outer layers out. In a failed supernova the idea is that it is too weak.' },
  { term: 'Neutrino', meaning: 'a tiny particle with almost no mass and no electric charge that hardly ever interacts with anything. A collapsing core makes them in enormous numbers, and they carry off most of its energy (Experiment 13).' },
  { term: 'Progenitor', meaning: 'the star that existed before an explosion or a disappearance, “the one that came before”. Old pictures of a star are what let astronomers say what kind of star it was.' },
  { term: 'Yellow supergiant', meaning: 'a very large, very bright star that is hotter than a red supergiant. The discovery paper gives about 100,000 times the Sun’s light and a surface temperature of about 4,500 kelvin for the star in this experiment. (Experiment 12 introduced red supergiants.)' },
  { term: 'Outer layers (envelope)', meaning: 'the gas that surrounds a star’s core. In a supernova it is thrown out. In a failed supernova the idea is that it falls back. The paper gives the star’s outer layer of hydrogen gas in this experiment as about 0.28 Suns.' },
  { term: 'Fallback', meaning: 'outer gas that falls back in towards the centre after a weak push, instead of being thrown out into space. It adds to the weight of the core that has collapsed.' },
  { term: 'Black hole', meaning: 'what is left when the core of a star is too heavy for anything known to hold it up, so that it falls in until nothing, not even light, can escape (Black Holes Experiments 1 and 9). NASA: “nothing – not even light – can escape.”' },
  { term: 'Neutron star', meaning: 'the very small, very dense sphere left when the core of a massive star collapses and neutrons stop the squeeze (Experiments 13 and 15). Black Holes Experiment 9 says that above about 3 Suns nothing known can hold such a core up.' },
  { term: 'Accretion', meaning: 'matter falling onto an object and being squeezed and heated on the way. Gas falling onto a black hole can glow brightly in X-rays, which is one way astronomers look for one. The discovery paper says that such X-rays have not been seen from this star.' },
  { term: 'Infrared light', meaning: 'light with longer waves than the red light we can see. NASA: “the human eye cannot see it, but humans can detect it as heat.” Warm dust glows in it, and infrared “can pass through dense regions of gas and dust in space with less scattering and absorption”.' },
  { term: 'Mid-infrared', meaning: 'a middle part of the infrared range. This is the range in which the star in this experiment was seen to brighten in 2014.' },
  { term: 'Dust (a dust shroud)', meaning: 'a cloud of tiny solid grains. It can block visible light and then glow in the infrared, so a star hidden inside a dust cloud can vanish from ordinary pictures and still show up in infrared ones.' },
  { term: 'Merger (of two stars)', meaning: 'two stars that have been circling each other come together and join into one. Two 2026 papers suggest that the star in this experiment may have ended this way, hidden by dust, instead of becoming a black hole.' },
  { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “11 ± 1” or, when the uncertainty is bigger on one side than the other, with two numbers. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
  { term: 'Solar mass', meaning: 'a unit for how heavy stars are. One solar mass is the mass of the Sun, so “13 solar masses” means 13 times as heavy as the Sun.' },
  { term: 'Light-year', meaning: 'the distance light travels in a year, about 9.5 million million kilometres. Looking at something far away is looking at it as it was in the past.' },
]

// ---- Number formats (display only) ----
const SUPERSCRIPT: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
function pow10Label(n: number): string {
  return `10${String(n).split('').map((c) => SUPERSCRIPT[c]).join('')}`
}
function thousands(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}
// Splits a sentence into lines of at most `width` characters, at spaces.
function wrap(text: string, width: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > width) {
      lines.push(line)
      line = word
    } else line = line ? line + ' ' + word : word
  }
  if (line) lines.push(line)
  return lines
}

// ---- The run: five named stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 5
const STAGE_NAMES = ['', 'The star and its history', 'The fade', 'What is left of the star', 'How weak was the push?', 'How many stars fail?']

const MEASURED_COLOR = '#34d399' // green: measured by telescopes
const LIMIT_COLOR = '#38bdf8' // sky blue: a limit from an earlier experiment, or a published estimate of one
const PUSH_COLOR = '#fb923c' // orange: the failed supernova's push (the discovery paper's estimate)
const OTHER_PAPER_COLOR = '#94a3b8' // grey: the other paper's wording for the push
const YOURS_COLOR = '#ffffff' // white: the learner's guess

// ---- Picture 1: what telescopes saw (a time line of the published marks only) ----
const YEAR_MIN = 2010
const YEAR_MAX = 2025
const TIMELINE_X0 = 30
const TIMELINE_X1 = 540
function yearX(year: number): number {
  return TIMELINE_X0 + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (TIMELINE_X1 - TIMELINE_X0)
}
function PictureOne({ stage }: { stage: number }) {
  const marks = timeline()
  const rowH = 54
  const top = 50
  const axisY = top + marks.length * rowH + 4
  const height = axisY + 62
  const visible = (i: number) => (i < 3 ? stage >= 1 : stage >= 2)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1, a time line from ${YEAR_MIN} to ${YEAR_MAX} of what telescopes recorded about the star M31-2014-DS1. Each row is one published observation, drawn as a green dot for a single year or a green bar from the year it began to the year it ended: ${marks
        .filter((_, i) => visible(i))
        .map((m) => `${m.label}, ${m.text}`)
        .join('; ')}. No curve is drawn between the marks.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: what telescopes saw of the star, {YEAR_MIN} to {YEAR_MAX}
      </text>
      <SvgLines x={20} y={40} lines={['green dots and bars: measured by telescopes. No curve is drawn between the marks.']} fill={MUTED_COLOR} />
      {marks.map((m, i) => {
        if (!visible(i)) return null
        const y0 = top + i * rowH + 10
        const lines = wrap(`${m.label}: ${m.text}`, 80)
        const barY = y0 + 12 * (lines.length - 1) + 12
        return (
          <g key={i}>
            <SvgLines x={20} y={y0} lines={lines} fill={TEXT_COLOR} />
            {m.endYear === null ? (
              <circle cx={yearX(m.startYear)} cy={barY + 5} r={6} fill={MEASURED_COLOR} stroke="#0b1020" strokeWidth={1.5} />
            ) : (
              <rect x={yearX(m.startYear)} y={barY} width={yearX(m.endYear) - yearX(m.startYear)} height={10} rx={3} fill={MEASURED_COLOR} stroke="#0b1020" strokeWidth={1.5} />
            )}
          </g>
        )
      })}
      <line x1={TIMELINE_X0} y1={axisY} x2={TIMELINE_X1} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, k) => YEAR_MIN + k).map((year) => (
        <g key={year}>
          <line x1={yearX(year)} y1={axisY} x2={yearX(year)} y2={axisY + (year % 5 === 0 ? 8 : 4)} stroke={MUTED_COLOR} strokeWidth={1.5} />
          {year % 5 === 0 && <SvgLines x={yearX(year)} y={axisY + 22} lines={[String(year)]} fill={TEXT_COLOR} anchor="middle" />}
        </g>
      ))}
      <SvgLines x={TIMELINE_X0} y={axisY + 42} lines={['the year']} fill={MUTED_COLOR} />
    </svg>
  )
}

// ---- Picture 2: what is left of the star (upper half), and how strong the push was, on a log scale of energy (lower half, from stage 4) ----
const ENERGY_MIN_POWER = 43
const ENERGY_MAX_POWER = 52
const SCALE_X0 = 40
const SCALE_WIDTH = 480
function massX(suns: number): number {
  return SCALE_X0 + suns * 80
}
function energyX(erg: number): number {
  return SCALE_X0 + logScalePosition(erg, ENERGY_MIN_POWER, ENERGY_MAX_POWER) * SCALE_WIDTH
}
function PictureTwo({ stage, guess }: { stage: number; guess: PushAnswer | null }) {
  const m = massPicture()
  const showEnergy = stage >= 4
  const pushRange = pushOneInRange()
  const apjl = apjlPushErgRange()
  const supernovaRange = FAILED_SUPERNOVA_DATA.supernovaGasErgRange
  const weakRange = FAILED_SUPERNOVA_DATA.weakShockErgRange
  const height = showEnergy ? 614 : 272
  const barY = 114
  // The lower half.
  const lowerTop = 284
  const axisY = lowerTop + 56
  const guessErg = guess === null ? null : guessPushErg(guess)
  const gx = guessErg === null ? 0 : energyX(guessErg)
  const boxOnLeft = gx > 300
  const boxX = boxOnLeft ? SCALE_X0 : 296
  const boxW = 244
  const boxY = axisY + 6
  const boxH = 80
  const rows: { y0: number; color: string; lines: string[]; low: number; high: number }[] = [
    {
      y0: axisY + 106,
      color: FLASH_COLOR,
      lines: wrap(`a typical supernova (Experiment 13): about ${pow10Label(51)} erg, give or take a factor of ${supernovaSpreadFactor()}`, 84),
      low: supernovaRange[0],
      high: supernovaRange[1],
    },
    {
      y0: axisY + 160,
      color: PUSH_COLOR,
      lines: wrap(
        `the failed supernova’s shock (the discovery paper’s estimate): ${pow10Label(47)} to ${pow10Label(48)} erg, which is 1 in ${thousands(pushRange.lowOneIn)} to 1 in ${thousands(pushRange.highOneIn)} of a typical supernova’s`,
        84,
      ),
      low: weakRange[0],
      high: weakRange[1],
    },
    {
      y0: axisY + 214,
      color: OTHER_PAPER_COLOR,
      lines: wrap(`the other 2026 paper’s wording (AAS Nova’s summary): about one hundred-millionth to one ten-thousandth of a typical supernova’s, ${pow10Label(43)} to ${pow10Label(47)} erg`, 84),
      low: apjl[0],
      high: apjl[1],
    },
  ]
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 2. Upper half, the star's weight at the end of its life on a scale from 0 to 6 Suns: a red bar for the ${m.remnantSolar.toFixed(1)} Suns that stayed collapsed, a short yellow bar for the at most ${m.thrownOffSolar} Sun thrown off, and blue marks at ${m.neutronStarTopSolar}, ${m.estimateLowSolar} to ${m.estimateHighSolar} and ${m.blackHoleBottomSolar} Suns, the limits from earlier experiments.${
        showEnergy
          ? ` Lower half, on a logarithmic scale of energy in erg from ${pow10Label(ENERGY_MIN_POWER)} to ${pow10Label(ENERGY_MAX_POWER)}: a yellow bar for a typical supernova, about ${pow10Label(51)}; an orange bar for the failed supernova's shock, ${pow10Label(47)} to ${pow10Label(48)}; a grey bar for the other paper's wording, ${pow10Label(43)} to ${pow10Label(47)}.${
              guess === null ? '' : ` Your guess, ${guess}, is a white triangle on the scale at ${guessErg === null ? '' : `about ${guessErg.toExponential(0)}`} erg, joined by a line to a white box, with a white dashed line down through the bars.`
            }`
          : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: what is left of the star, and how strong was the push?
      </text>
      <SvgLines x={20} y={44} lines={['Upper half: the star’s weight at the end of its life, in Suns']} fill={MUTED_COLOR} />

      {/* Upper half: the star's weight. */}
      <rect x={massX(0)} y={barY} width={massX(m.remnantSolar) - massX(0)} height={28} fill={BLACK_HOLE_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <rect x={massX(m.remnantSolar)} y={barY} width={massX(m.starSolar) - massX(m.remnantSolar)} height={28} fill={FLASH_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <rect x={massX(m.estimateLowSolar)} y={barY - 6} width={massX(m.estimateHighSolar) - massX(m.estimateLowSolar)} height={40} fill={LIMIT_COLOR} fillOpacity={0.55} stroke={LIMIT_COLOR} strokeWidth={1.5} />
      <line x1={massX(m.neutronStarTopSolar)} y1={barY - 36} x2={massX(m.neutronStarTopSolar)} y2={barY + 34} stroke={LIMIT_COLOR} strokeWidth={2} strokeDasharray="5 3" />
      <line x1={massX(m.blackHoleBottomSolar)} y1={barY - 36} x2={massX(m.blackHoleBottomSolar)} y2={barY + 34} stroke={LIMIT_COLOR} strokeWidth={2} strokeDasharray="5 3" />
      <SvgLines x={massX(m.neutronStarTopSolar) - 6} y={barY - 40} lines={[`up to ${m.neutronStarTopSolar.toFixed(1)}:`, 'neutrons can hold it up']} fill={LIMIT_COLOR} bold anchor="end" />
      <SvgLines x={massX(m.blackHoleBottomSolar) + 6} y={barY - 52} lines={[`above ${m.blackHoleBottomSolar.toFixed(1)}:`, 'nothing known can', 'hold it up']} fill={LIMIT_COLOR} bold />
      <line x1={massX(0)} y1={barY + 44} x2={massX(6)} y2={barY + 44} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4, 5, 6].map((t) => (
        <g key={t}>
          <line x1={massX(t)} y1={barY + 44} x2={massX(t)} y2={barY + 50} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <SvgLines x={massX(t)} y={barY + 64} lines={[String(t)]} fill={TEXT_COLOR} anchor="middle" />
        </g>
      ))}
      <SvgLines x={massX(6) + 16} y={barY + 64} lines={['Suns']} fill={MUTED_COLOR} />
      <rect x={40} y={barY + 80} width={12} height={12} fill={BLACK_HOLE_COLOR} />
      <SvgLines x={58} y={barY + 90} lines={[`collapsed: ${m.remnantSolar.toFixed(1)} Suns (${m.collapsedPercent.toFixed(0)} percent of the star)`]} fill={BLACK_HOLE_COLOR} bold />
      <rect x={40} y={barY + 98} width={12} height={12} fill={FLASH_COLOR} />
      <SvgLines x={58} y={barY + 108} lines={[`thrown off: at most about ${m.thrownOffSolar} Sun (${m.thrownOffPercent.toFixed(0)} percent)`]} fill={FLASH_COLOR} bold />
      <rect x={40} y={barY + 116} width={12} height={12} fill={LIMIT_COLOR} fillOpacity={0.55} stroke={LIMIT_COLOR} />
      <SvgLines x={58} y={barY + 126} lines={[`${m.estimateLowSolar} to ${m.estimateHighSolar} Suns: one 2026 estimate of the most a neutron star can weigh`]} fill={LIMIT_COLOR} bold />

      {/* Lower half: how strong was the push? (from stage 4) */}
      {showEnergy && (
        <g>
          <line x1={20} y1={lowerTop - 14} x2={540} y2={lowerTop - 14} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="4 4" />
          <SvgLines x={20} y={lowerTop + 6} lines={['Lower half: how much energy the shock gives the outer layers (erg, on a log scale)']} fill={MUTED_COLOR} />
          <SvgLines x={20} y={lowerTop + 20} lines={['each tick is 10 times more than the one before']} fill={MUTED_COLOR} />
          <line x1={SCALE_X0} y1={axisY} x2={SCALE_X0 + SCALE_WIDTH} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1.5} />
          {Array.from({ length: ENERGY_MAX_POWER - ENERGY_MIN_POWER + 1 }, (_, k) => ENERGY_MIN_POWER + k).map((n) => (
            <g key={n}>
              <line x1={energyX(10 ** n)} y1={axisY - 6} x2={energyX(10 ** n)} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1.5} />
              <SvgLines x={energyX(10 ** n)} y={axisY - 12} lines={[pow10Label(n)]} fill={TEXT_COLOR} anchor="middle" size={9} />
            </g>
          ))}
          {guess !== null && guessErg !== null && <line x1={gx} y1={axisY + 18} x2={gx} y2={height - 18} stroke={YOURS_COLOR} strokeWidth={2} strokeDasharray="6 4" />}
          {rows.map((row, i) => {
            const barRowY = row.y0 + 12 * (row.lines.length - 1) + 12
            return (
              <g key={i}>
                <SvgLines x={20} y={row.y0} lines={row.lines} fill={row.color} bold />
                <rect x={energyX(row.low)} y={barRowY} width={Math.max(5, energyX(row.high) - energyX(row.low))} height={12} rx={3} fill={row.color} stroke="#0b1020" strokeWidth={1.5} />
              </g>
            )
          })}
          {guess !== null && guessErg !== null && (
            <g>
              <polygon points={`${gx},${axisY} ${gx - 10},${axisY + 18} ${gx + 10},${axisY + 18}`} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
              <line x1={boxOnLeft ? boxX + boxW : boxX} y1={axisY + 14} x2={boxOnLeft ? gx - 11 : gx + 11} y2={axisY + 14} stroke={YOURS_COLOR} strokeWidth={2} />
              <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={6} fill={YOURS_COLOR} stroke={MUTED_COLOR} strokeWidth={2} />
              <text x={boxX + 10} y={boxY + 20} fill="#0b1020" fontSize="13" fontWeight="bold">YOUR GUESS</text>
              <text x={boxX + 10} y={boxY + 38} fill="#0b1020" fontSize="11" fontWeight="bold">for the failed supernova’s push:</text>
              <text x={boxX + 10} y={boxY + 54} fill="#0b1020" fontSize="11" fontWeight="bold">{guess}</text>
              <text x={boxX + 10} y={boxY + 69} fill="#0b1020" fontSize="10" fontWeight="bold">of a typical supernova’s ({pow10Label(Math.round(Math.log10(guessErg)))} erg)</text>
            </g>
          )}
        </g>
      )}
    </svg>
  )
}

// ---- Picture 3: how many of 100 massive stars might fail (from stage 5) ----
const DOT_X0 = 40
const DOT_Y0 = 100
const DOT_STEP = 28
function dotCenter(i: number): { x: number; y: number } {
  return { x: DOT_X0 + ((i - 1) % 10) * DOT_STEP, y: DOT_Y0 + Math.floor((i - 1) / 10) * DOT_STEP }
}
function PictureThree({ guess }: { guess: CountAnswer | null }) {
  const dots = failedDots()
  const range = failedRange()
  const g = guess === null ? null : guessDots(guess)
  const height = 430
  const boxX = 332
  const boxY = 60
  const boxW = 208
  const boxH = 86
  const colorOf = (i: number) => (i <= dots.low ? { fill: BLACK_HOLE_COLOR, opacity: 1 } : i <= dots.central ? { fill: BLACK_HOLE_COLOR, opacity: 0.65 } : i <= dots.high ? { fill: BLACK_HOLE_COLOR, opacity: 0.28 } : { fill: '#334155', opacity: 1 })
  // The leader from the guess to its box: from the right edge of the last guessed dot's row, or, for a guess of one dot, up and over the grid.
  const lastDot = g === null ? null : dotCenter(g.last)
  const firstDot = g === null ? null : dotCenter(g.first)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 3, one hundred dots, each one massive star. The first ${dots.low} are bright red, up to ${dots.central} medium red, and up to ${dots.high} faint red: the survey's central count of ${range.central.toFixed(0)} in 100, and its 90 percent range of ${range.low.toFixed(0)} to ${range.high.toFixed(0)}. The rest are grey.${
        g === null || guess === null ? '' : ` Your guess, ${guess}, is shown by white outlines on dots ${g.first} to ${g.last}, joined by a line to a white box.`
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 3: of every 100 massive stars, how many might fail?
      </text>
      <SvgLines x={20} y={42} lines={['each dot is one massive star; dots are counted along each row, from the top left']} fill={MUTED_COLOR} />
      {Array.from({ length: 100 }, (_, k) => k + 1).map((i) => {
        const c = dotCenter(i)
        const col = colorOf(i)
        return <circle key={i} cx={c.x} cy={c.y} r={10} fill={col.fill} fillOpacity={col.opacity} stroke="#0b1020" strokeWidth={1} />
      })}
      {g !== null && lastDot !== null && firstDot !== null && guess !== null && (
        <g>
          {Array.from({ length: g.last - g.first + 1 }, (_, k) => g.first + k).map((i) => {
            const c = dotCenter(i)
            return <circle key={i} cx={c.x} cy={c.y} r={14} fill="none" stroke={YOURS_COLOR} strokeWidth={3} />
          })}
          {g.first === g.last ? (
            <polyline points={`${firstDot.x},${firstDot.y - 15} ${firstDot.x},${DOT_Y0 - 32} ${boxX},${DOT_Y0 - 32} ${boxX},${boxY + boxH}`} fill="none" stroke={YOURS_COLOR} strokeWidth={2} />
          ) : (
            <line x1={DOT_X0 + 9 * DOT_STEP + 15} y1={lastDot.y} x2={boxX} y2={boxY + boxH - 10} stroke={YOURS_COLOR} strokeWidth={2} />
          )}
          <rect x={boxX} y={boxY} width={boxW} height={boxH} rx={6} fill={YOURS_COLOR} stroke={MUTED_COLOR} strokeWidth={2} />
          <text x={boxX + 10} y={boxY + 20} fill="#0b1020" fontSize="13" fontWeight="bold">YOUR GUESS</text>
          <text x={boxX + 10} y={boxY + 38} fill="#0b1020" fontSize="11" fontWeight="bold">of every 100 massive stars:</text>
          <text x={boxX + 10} y={boxY + 54} fill="#0b1020" fontSize="11" fontWeight="bold">{guess}</text>
          <text x={boxX + 10} y={boxY + 70} fill="#0b1020" fontSize="10" fontWeight="bold">{g.first === g.last ? '(only a marker: the first dot)' : `(the white outlines: dots ${g.first} to ${g.last})`}</text>
        </g>
      )}
      <rect x={boxX} y={170} width={12} height={12} fill={BLACK_HOLE_COLOR} />
      <SvgLines x={boxX + 18} y={180} lines={[`1 to ${dots.low}: low end of the range`]} fill={BLACK_HOLE_COLOR} bold />
      <rect x={boxX} y={202} width={12} height={12} fill={BLACK_HOLE_COLOR} fillOpacity={0.65} />
      <SvgLines x={boxX + 18} y={212} lines={[`up to ${dots.central}: the central count`]} fill={BLACK_HOLE_COLOR} bold />
      <rect x={boxX} y={234} width={12} height={12} fill={BLACK_HOLE_COLOR} fillOpacity={0.28} />
      <SvgLines x={boxX + 18} y={244} lines={[`up to ${dots.high}: high end of the range`]} fill={BLACK_HOLE_COLOR} bold />
      <rect x={boxX} y={266} width={12} height={12} fill="#334155" />
      <SvgLines x={boxX + 18} y={276} lines={['grey: not counted as failing']} fill={MUTED_COLOR} bold />
      <SvgLines x={20} y={DOT_Y0 + 9 * DOT_STEP + 38} lines={[`The survey’s own range is ${range.low.toFixed(0)} to ${range.high.toFixed(0)} in 100 (90 percent). It rests on one clearly detected failed supernova.`]} fill={MUTED_COLOR} />
    </svg>
  )
}

// ---- Part 2: the learner's own trial values (two drawings that follow the two controls; the real pictures never change) ----
const PART_TWO_COLOR = '#0d9488'
const PART_THREE_COLOR = '#7c3aed'
const PART_FOUR_COLOR = '#0066cc'
const TRIAL_COLOR = '#34d399' // green: imagined for the question (a trial value)
const UNCERTAIN_COLOR = '#f59e0b'
// "1 Sun", "0.1 Suns"; and "25" or "6.3" (one decimal place, without a needless ".0").
function sunsLabel(n: number): string {
  return `${n} ${n === 1 ? 'Sun' : 'Suns'}`
}
function oneIn(n: number | null): string {
  return n === null ? '' : String(Number(n.toFixed(1)))
}
function outcomeColor(outcome: FailedSupernovaResult['outcome']): string {
  return outcome === 'black-hole' ? BLACK_HOLE_COLOR : outcome === 'neutron-star' ? NEUTRON_STAR_COLOR : UNCERTAIN_COLOR
}
function outcomeWords(outcome: FailedSupernovaResult['outcome']): string {
  return outcome === 'black-hole'
    ? 'a black hole (nothing known can hold up so much weight)'
    : outcome === 'neutron-star'
      ? 'a neutron star (neutrons can hold up this much weight)'
      : 'uncertain (between the weight neutrons surely hold up and the weight nothing known can)'
}

function DrawingA({ mine }: { mine: FailedSupernovaResult }) {
  const m = massPicture()
  const barY = 114
  const height = 292
  const colour = outcomeColor(mine.outcome)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Drawing A, your trial. A star of ${mine.starSolar} Suns throws off ${sunsLabel(mine.thrownOffSolar)} and ${mine.remnantSolar.toFixed(2)} Suns stay collapsed, ${mine.collapsedPercent.toFixed(0)} percent of the star. The collapsed part is drawn as a bar on a scale from 0 to 6 Suns, with blue marks at ${m.neutronStarTopSolar}, ${m.estimateLowSolar} to ${m.estimateHighSolar} and ${m.blackHoleBottomSolar} Suns and a grey dashed line at the discovery paper's ${m.remnantSolar.toFixed(1)} Suns. The remnant would be ${outcomeWords(mine.outcome)}. These are trial values, not measurements.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing A: your trial, how much of the star is thrown off?
      </text>
      <SvgLines x={20} y={44} lines={['imagined for the question: the star’s weight is the paper’s 5 Suns, the thrown-off weight is your choice']} fill={MUTED_COLOR} />
      <rect x={massX(0)} y={barY} width={massX(mine.remnantSolar) - massX(0)} height={28} fill={colour} stroke="#0b1020" strokeWidth={1.5} />
      {mine.thrownOffSolar > 0 && (
        <rect x={massX(mine.remnantSolar)} y={barY} width={massX(mine.starSolar) - massX(mine.remnantSolar)} height={28} fill={FLASH_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      )}
      <rect x={massX(m.estimateLowSolar)} y={barY - 6} width={massX(m.estimateHighSolar) - massX(m.estimateLowSolar)} height={40} fill={LIMIT_COLOR} fillOpacity={0.55} stroke={LIMIT_COLOR} strokeWidth={1.5} />
      <line x1={massX(m.neutronStarTopSolar)} y1={barY - 36} x2={massX(m.neutronStarTopSolar)} y2={barY + 34} stroke={LIMIT_COLOR} strokeWidth={2} strokeDasharray="5 3" />
      <line x1={massX(m.blackHoleBottomSolar)} y1={barY - 36} x2={massX(m.blackHoleBottomSolar)} y2={barY + 34} stroke={LIMIT_COLOR} strokeWidth={2} strokeDasharray="5 3" />
      <line x1={massX(m.remnantSolar)} y1={barY - 10} x2={massX(m.remnantSolar)} y2={barY + 38} stroke={OTHER_PAPER_COLOR} strokeWidth={2} strokeDasharray="2 3" />
      <SvgLines x={massX(m.neutronStarTopSolar) - 6} y={barY - 40} lines={[`up to ${m.neutronStarTopSolar.toFixed(1)}:`, 'neutrons can hold it up']} fill={LIMIT_COLOR} bold anchor="end" />
      <SvgLines x={massX(m.blackHoleBottomSolar) + 6} y={barY - 52} lines={[`above ${m.blackHoleBottomSolar.toFixed(1)}:`, 'nothing known can', 'hold it up']} fill={LIMIT_COLOR} bold />
      <line x1={massX(0)} y1={barY + 44} x2={massX(6)} y2={barY + 44} stroke={MUTED_COLOR} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4, 5, 6].map((t) => (
        <g key={t}>
          <line x1={massX(t)} y1={barY + 44} x2={massX(t)} y2={barY + 50} stroke={MUTED_COLOR} strokeWidth={1.5} />
          <SvgLines x={massX(t)} y={barY + 64} lines={[String(t)]} fill={TEXT_COLOR} anchor="middle" />
        </g>
      ))}
      <SvgLines x={massX(6) + 16} y={barY + 64} lines={['Suns']} fill={MUTED_COLOR} />
      <rect x={40} y={barY + 80} width={12} height={12} fill={colour} />
      <SvgLines x={58} y={barY + 90} lines={[`collapsed (your trial): ${mine.remnantSolar.toFixed(2)} Suns, ${mine.collapsedPercent.toFixed(0)} percent of the star`]} fill={colour} bold />
      <rect x={40} y={barY + 98} width={12} height={12} fill={FLASH_COLOR} />
      <SvgLines x={58} y={barY + 108} lines={[`thrown off (your choice): ${sunsLabel(mine.thrownOffSolar)}, ${mine.thrownOffPercent.toFixed(0)} percent`]} fill={FLASH_COLOR} bold />
      <rect x={40} y={barY + 116} width={12} height={12} fill={LIMIT_COLOR} fillOpacity={0.55} stroke={LIMIT_COLOR} />
      <SvgLines x={58} y={barY + 126} lines={[`${m.estimateLowSolar} to ${m.estimateHighSolar} Suns: one 2026 estimate of the most a neutron star can weigh`]} fill={LIMIT_COLOR} bold />
      <line x1={40} y1={barY + 140} x2={52} y2={barY + 140} stroke={OTHER_PAPER_COLOR} strokeWidth={2} strokeDasharray="2 3" />
      <SvgLines x={58} y={barY + 144} lines={[`grey dashed line: the discovery paper’s ${m.remnantSolar.toFixed(1)} Suns, kept for comparison`]} fill={OTHER_PAPER_COLOR} bold />
    </svg>
  )
}

function DrawingB({ mine }: { mine: FailedSupernovaResult }) {
  const range = mine.failedRange
  const height = 430
  const boxX = 332
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Drawing B, your trial. One hundred dots, each one massive star, with the first ${mine.filledDots} drawn in green: your trial count of ${mine.failedPerHundred} failing in every 100. Grey rings mark dots ${range.low.toFixed(0)}, ${range.central.toFixed(0)} and ${range.high.toFixed(0)}, the survey's low end, central count and high end. These are trial values, not measurements.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing B: your trial, how many of 100 massive stars fail?
      </text>
      <SvgLines x={20} y={42} lines={['imagined for the question: the count is your choice; dots are counted along each row, from the top left']} fill={MUTED_COLOR} />
      {Array.from({ length: 100 }, (_, k) => k + 1).map((i) => {
        const c = dotCenter(i)
        return <circle key={i} cx={c.x} cy={c.y} r={10} fill={i <= mine.filledDots ? TRIAL_COLOR : '#334155'} stroke="#0b1020" strokeWidth={1} />
      })}
      {[range.low, range.central, range.high].map((v) => {
        const c = dotCenter(Math.round(v))
        return <circle key={v} cx={c.x} cy={c.y} r={14} fill="none" stroke={OTHER_PAPER_COLOR} strokeWidth={2.5} strokeDasharray="3 2" />
      })}
      <rect x={boxX} y={80} width={12} height={12} fill={TRIAL_COLOR} />
      <SvgLines x={boxX + 18} y={90} lines={[`1 to ${mine.filledDots}: your trial count`]} fill={TRIAL_COLOR} bold />
      <rect x={boxX} y={102} width={12} height={12} fill="#334155" />
      <SvgLines x={boxX + 18} y={112} lines={['grey: not counted as failing']} fill={MUTED_COLOR} bold />
      <circle cx={boxX + 6} cy={132} r={7} fill="none" stroke={OTHER_PAPER_COLOR} strokeWidth={2.5} strokeDasharray="3 2" />
      <SvgLines x={boxX + 18} y={136} lines={['grey rings: the survey’s', `${range.low.toFixed(0)}, ${range.central.toFixed(0)} and ${range.high.toFixed(0)}`]} fill={OTHER_PAPER_COLOR} bold />
      <SvgLines x={20} y={DOT_Y0 + 9 * DOT_STEP + 38} lines={[mine.oneStarInEvery === null ? 'Your trial count is 0: no massive star fails.' : `Your trial count means 1 massive star in every ${oneIn(mine.oneStarInEvery)} fails.`]} fill={TRIAL_COLOR} bold />
    </svg>
  )
}

const lookForDrawingA: LookFor[] = [
  {
    look: 'the length of the coloured bar, and where its right-hand end falls against the blue marks (2.0, 2.2 to 2.3 and 3.0).',
    means: 'the bar is the weight that stays collapsed, the star’s 5 Suns minus the amount you chose to throw off. Throw off little and the bar ends beyond 3.0, so the remnant is a black hole. Throw off 3 Suns and it ends at 2.0, the most neutrons are sure to hold up.',
    matters: 'the question the experiment asks is whether a star can end without a flash. This shows how much of the star would have to be pushed out to leave a neutron star instead: at least 3 Suns, which is 60 percent of it.',
  },
  {
    look: 'the grey dashed line at 4.9 Suns, against the end of your bar.',
    means: 'it is the weight the discovery paper estimates stayed collapsed in the real star. With the paper’s 0.1 Sun thrown off, your bar ends exactly on it.',
    matters: 'it lets you see how far your trial value is from the paper’s. It is the paper’s estimate, not a weighing of the star.',
  },
]
const lookForDrawingB: LookFor[] = [
  {
    look: 'the green dots, and the three grey rings on the dots at 4, 16 and 39.',
    means: 'the green dots are your trial count. The rings are the survey’s low end, best count and high end, so you can see whether your count sits inside the range the survey allows.',
    matters: 'the survey could only say the true number lies between 4 and 39 in 100, because it rests on one detection. Moving your count shows how wide that gap is in dots.',
  },
  {
    look: 'the line under the dots, “1 massive star in every …”.',
    means: 'it turns your count into the same idea as “1 in N”: 16 in 100 is about 1 star in every 6, and 4 in 100 is 1 in every 25.',
    matters: 'a small count out of 100 can sound tiny, but “1 in 25” is something an astronomer watching many stars for years could hope to see.',
  },
]

const lookForPictureOne: LookFor[] = [
  {
    look: 'the first three rows (2012, 2014 to 2016, and from 2014).',
    means: 'in 2012 the star was very bright, about 100,000 times the Sun’s light. From 2014 its mid-infrared light rose by about 50 percent over about 2 years, while its total light stayed constant for about 1,000 days.',
    matters: 'a supernova would have made a star many times brighter for weeks or months (Experiment 13). Nothing like that is drawn here: the total light stayed constant, and the paper reports no luminous optical outburst.',
  },
  {
    look: 'the last three rows (2016 to 2019, 2022 to 2023, and 2024).',
    means: 'the star faded by more than a factor of 100, then could not be detected in visible light, but an infrared telescope (JWST) still saw about 7 percent of its old light in 2024.',
    matters: 'the star went almost dark in ordinary pictures, but not completely: something is still giving off infrared light there. That leftover glow is the clue every explanation has to account for.',
  },
]

const lookForPictureTwoMass: LookFor[] = [
  {
    look: 'the red bar, and the three blue marks along the scale (2.0, 2.2 to 2.3, and 3.0).',
    means: 'the part of the star that stayed collapsed, 4.9 Suns, is heavier than every one of the blue marks: 4.9 ÷ 3.0 = 1.63 times the weight above which nothing known can hold a core up.',
    matters: 'a core that heavy would have to fall in until it was a black hole (Black Holes Experiment 9). If much less had stayed collapsed, a neutron star could have been left instead.',
  },
  {
    look: 'the short yellow bar at the right-hand end of the star.',
    means: 'at most about 0.1 Sun, about 2 percent of the star, was thrown off. The other 98 percent stayed.',
    matters: 'this is what “failed” means here: the push did not get the star’s outer layers out. Almost all of them fell back and added their weight to the collapsed core.',
  },
]
const lookForPictureTwoPush: LookFor[] = [
  {
    look: 'the orange bar and the yellow bar, and the gap between them on the scale.',
    means: 'the failed supernova’s shock has 10⁴⁷ to 10⁴⁸ erg, 3 to 4 ticks to the left of a typical supernova’s 10⁵¹: 1,000 to 10,000 times less.',
    matters: 'a push that small is not enough for a bright explosion, so no flash is expected, which is what Picture 1 shows.',
  },
  {
    look: 'the grey bar, which reaches further left than the orange one.',
    means: 'another 2026 paper’s wording, as AAS Nova summarises it, puts the push lower still, 10⁴³ to 10⁴⁷ erg. The two sources differ about how small the push was.',
    matters: 'the exact size of the push is an estimate from a model, and it is not settled. Both sources put it far below a typical supernova’s.',
  },
  {
    look: 'the white triangle, its dashed line, and the white box.',
    means: 'they are your guess for Prediction 1, drawn on the same scale and carried down through all three bars so you can see where it falls.',
    matters: 'comparing your guess with the bars is the point of the picture. It shows only your guess: it does not say whether it was right.',
  },
]

const lookForPictureThree: LookFor[] = [
  {
    look: 'the shades of red, from bright to faint.',
    means: 'the survey’s best count is 16 in every 100 massive stars, but it can only say that the true number lies between 4 and 39.',
    matters: 'a count that rests on a single detection cannot be pinned down: the top of the range is almost 10 times the bottom. So how often stars fail is still open.',
  },
  {
    look: 'the white outlines and the white box.',
    means: 'they are your guess for Prediction 2, drawn over the same dots, so you can see how many of the red dots your outline covers.',
    matters: 'it shows only your guess, and the picture does not say whether it was right. A guess of “less than 1 in every 100” has no dots of its own, so it outlines only the first dot, as a marker.',
  },
]

// The two prediction questions' answers (the specification's "Prediction Activity"). The labels do not say which answer is right.
const PUSH_CHOICES: ReadonlyArray<{ value: PushAnswer; label: string }> = [
  { value: 'about the same', label: 'About the same' },
  { value: 'about 1 in 100', label: 'About 1 in 100' },
  { value: 'about 1 in 10,000', label: 'About 1 in 10,000' },
]
const COUNT_CHOICES: ReadonlyArray<{ value: CountAnswer; label: string }> = [
  { value: 'fewer than 1', label: 'Less than 1 in every 100' },
  { value: 'about 10 to 20', label: 'About 10 to 20 in every 100' },
  { value: 'about half', label: 'About half: about 50 in every 100' },
]

const PART_ONE_COLOR = '#2563eb'
function StepHeader({ step, title, accent, lead }: { step: string; title: string; accent: string; lead: ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.08em', textTransform: 'uppercase', color: accent }}>{step}</p>
      <h3 style={{ margin: '0.25rem 0 0.75rem' }}>{title}</h3>
      <div style={{ padding: '0.75rem 1rem', borderLeft: `4px solid ${accent}`, background: 'rgba(100, 116, 139, 0.10)', fontSize: '0.875rem', borderRadius: '0 8px 8px 0' }}>{lead}</div>
    </div>
  )
}

function PageSection({ step, title, accent, lead, children }: { step: string; title: string; accent: string; lead: ReactNode; children: ReactNode }) {
  return (
    <section className="exp-card" style={{ marginTop: '2.5rem', padding: '1.5rem', borderTop: `6px solid ${accent}` }}>
      <StepHeader step={step} title={title} accent={accent} lead={lead} />
      {children}
    </section>
  )
}

function ChoiceButtons({ options, value, onChange, format }: { options: ReadonlyArray<number>; value: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <div>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`toggle-button${value === option ? ' is-selected' : ''}`}
          style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          {format(option)}
        </button>
      ))}
    </div>
  )
}

interface FailedSupernovaExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

// onComplete is called when the run reaches its end. onTutorComplete is called when the learner reaches the tutor's explanation.
export function FailedSupernovaExperiment({ onComplete, onTutorComplete }: FailedSupernovaExperimentProps) {
  const d = FAILED_SUPERNOVA_DATA
  const limit = SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES
  const [pushPrediction, setPushPrediction] = useState<PushAnswer | null>(null)
  const [countPrediction, setCountPrediction] = useState<CountAnswer | null>(null)
  const [thrownOffChoice, setThrownOffChoice] = useState<number>(FAILED_SUPERNOVA_DATA.thrownOffSolar)
  const [failedChoice, setFailedChoice] = useState<number>(failedRange().central)
  const mine = runFailedSupernova({ thrownOffSolar: thrownOffChoice, failedPerHundred: failedChoice })
  // The results (Part 3) use the paper's own numbers, so they never follow the guesses or the Part 2 settings.
  const check = runCheckUp()
  const pushLabel = PUSH_CHOICES.find((c) => c.value === pushPrediction)?.label.toLowerCase() ?? ''
  const countLabel = COUNT_CHOICES.find((c) => c.value === countPrediction)?.label.toLowerCase() ?? ''
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const hasRun = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = pushPrediction !== null && countPrediction !== null

  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) setStage(stage + 1)
      else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  function startOver() {
    setPushPrediction(null)
    setCountPrediction(null)
    setThrownOffChoice(FAILED_SUPERNOVA_DATA.thrownOffSolar)
    setFailedChoice(failedRange().central)
    setStatus('idle')
    setStage(0)
  }
  function run() {
    setStage(1)
    setStatus('running')
  }
  // Every number in the captions comes from the physics module (CLAUDE.md §9).
  const mass = massPicture()
  const over = remnantOverLimits(mass.remnantSolar)
  const pushRange = pushOneInRange()
  const dotCounts = failedDots()
  const countRange = failedRange()
  return (
    <div>
      <h2>Experiment 17 — A Star That Vanished: Can a Star Become a Black Hole Without Exploding? (M31-2014-DS1)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): a bright star in the Andromeda galaxy grew a little brighter in infrared light, then faded from view, and no bright supernova was
            seen. That is strong evidence of what happened to its light. What it became is contested: the team that found it says a black hole, and two other 2026 papers read it as
            two stars that merged. How often stars end this way is open. What the numbers add up to is shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In Experiment 13 you saw a massive star end in a supernova: its core collapsed, and the star was torn apart in a flash that could be seen
            from millions of light-years away. But does every heavy star end that way? Could a star’s core collapse and the star simply fade out of sight, leaving a black hole behind
            and no flash at all? Astronomers have watched many bright stars in other galaxies looking for exactly that, and in 2026 a team reported the best
            candidate yet. Other teams read the same observations differently.
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Experiments 12 and 13 you followed a heavy star to the end of its life. Its core runs out of fuel and collapses. Neutrinos carry
            most of the energy away, and a shock, a sudden wave of push, runs outward through the star and throws the outer layers out as a supernova. In Experiment 15 and in Black
            Holes Experiment 9 you saw what can hold a collapsed core up: neutrons can, but only up to a limit, and above about {limit} Suns nothing known can. In Experiment 1 you met
            the “give-or-take” of a measurement, and in several experiments you saw that a result can be contested, which means that real data exist but experts disagree about what
            they mean. This experiment uses all three ideas.
          </p>

          <p style={paragraph}>
            <strong>The idea of a failed supernova.</strong> Whether the star is torn apart depends on a race. The collapsing core makes a shock, and the shock has to push the star’s
            outer layers out against the pull of gravity. If the push is strong enough, the layers are thrown out and we see a supernova. If the push is too weak, the idea goes,
            the outer layers do not escape. They fall back in, and their weight is added to the collapsed core. If the total is heavier than anything known can hold up, the core
            falls in until it is a black hole. This is called a <strong>failed supernova</strong>: the supernova “fails” to happen. A telescope would not see a flash. It would see a
            star that gets fainter, and then is gone.
          </p>
          <p style={paragraph}>
            An everyday comparison for the race (it is only a comparison, not a model of a star): throw a ball straight up. Gravity slows it by about 10 metres a second every second, and the height it reaches is its speed times its speed, divided by 20. A ball thrown upward at 20 metres a second climbs about 20
            metres before gravity stops it (20 × 20 ÷ (2 × 10) = 20), and then it falls back. A ball thrown at only 5 metres a second climbs about 1 metre 25 centimetres
            (5 × 5 ÷ 20 = 1.25) and falls straight back. Whether gas is thrown out of a star or falls back also depends on whether the push is big enough to beat gravity.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <VanishingDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It sets an ordinary supernova beside a failed one, so you can see where they start the same way and where they differ.
              It is a sketch of the idea, not of a real star, and it is not to scale. Row B is a proposal that astronomers are testing, not something anyone has photographed.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The two rows.</strong> Row A is an ordinary supernova, which you met in Experiment 13. Row B is a failed supernova, the idea this experiment is about. Each row
                reads from left to right, in the order things happen.
              </li>
              <li>
                <strong>The orange circle</strong> at the left is the star before its core collapses. <strong>The grey arrows</strong> are the steps: the core collapses, and then
                a telescope looks at the result. The grey words say which step each arrow is.
              </li>
              <li>
                <strong>The small violet circle</strong> in row A is the neutron star left behind by the collapse. <strong>The yellow arrows</strong> pointing out of it are the strong
                push that throws the outer layers out. A longer arrow would mean a stronger push, but the arrows here are only a sketch and their length means nothing.
              </li>
              <li>
                <strong>The small dark circle with a red outline</strong> in row B is a black hole. <strong>The red arrows</strong> pointing into it are the outer layers falling back.
              </li>
              <li>
                <strong>The big yellow burst</strong> at the right of row A is the bright flash of a supernova. <strong>The brown dashed circle</strong> at the right of row B is a
                cloud of dust round the black hole. There is no flash in row B: the dust blocks the visible light, and the star seems to vanish.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with the ball.</strong> Take the ball thrown at 20 metres a second: it reaches 20 metres and comes back. Throw it harder, at 30 metres a second,
              and it climbs 45 metres (30 × 30 ÷ 20 = 45); throw it softer, at 5, and it climbs only 1.25 metres. In row A the push is like the hard throw: the gas escapes. In row B
              it is like the soft throw: the gas comes back down. The numbers for the real star come after the run.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForVanishing} />
          </div>

          <p style={paragraph}>
            <strong>How astronomers look.</strong> A flash is easy to find: a supernova is bright enough to be seen from millions of light-years away. A star that quietly disappears is much harder, because
            there is nothing to see. So teams watch many bright stars in nearby galaxies, year after year, and look for one that fades and does not come back. One survey, with the Large
            Binocular Telescope, has watched luminous stars in 27 nearby galaxies for 11 years. Space telescopes watching in infrared light have helped too: NASA’s NEOWISE
            telescope recorded the sky in infrared light for years. A star that has gone missing is not proof of a black hole, though. A star can also be hidden by a cloud of dust, or
            two stars can merge and look very different afterwards, so each candidate has to be checked against these other possibilities.
          </p>

          <p style={paragraph}>
            <strong>What was found.</strong> The first good candidate was a star of about {d.ngc6946.massSolar} Suns in a galaxy called NGC 6946. It began to weaken in {d.ngc6946.brightenedYear}
            and had vanished from view by {d.ngc6946.goneYear}. The second, and the subject of this experiment, is called M31-2014-DS1, in the Andromeda galaxy, about {d.m31DistanceMillionLightYears}
            million light-years away. In 2014 it grew brighter in the mid-infrared, and then it faded, until by 2023 it was more than {d.visibleFadeFactor.toLocaleString('en-US')} times
            fainter in visible light than it had been. In February 2026 a team led by Kishalay De reported in the journal <em>Science</em> that this looks like a failed supernova:
            most of the star fell back in, and a black hole formed, hidden in a cloud of dust. Two other 2026 papers disagree. They found that a source of infrared light is still
            there at the same place, and that no X-rays have been seen from it, which a black hole feeding on gas might give off. They suggest that two stars merged, and that what is
            left is a dust-covered star. The team that found it replies that dust would hide the X-rays too, and that they should become visible in time.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> That the star brightened a little in infrared and then faded from sight, with no bright supernova, is strong
            evidence: it was seen by several telescopes. What it became is contested. How often stars end in a failed supernova is open: only a few candidates exist, and an estimate
            built on so few has a large give-or-take. What the numbers add up to is shown after the run, with each number’s source.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Failed supernova</strong>, <strong>shock</strong>, <strong>fallback</strong> and <strong>outer layers (envelope)</strong>: a collapse with no explosion, the
                wave of push, outer gas falling back, and the gas around the core.
              </li>
              <li>
                <strong>Progenitor</strong> and <strong>yellow supergiant</strong>: the star that existed before, and the kind of star it was.
              </li>
              <li>
                <strong>Infrared light</strong>, <strong>mid-infrared</strong> and <strong>dust</strong>: light we cannot see, a part of it, and the cloud that can hide a star.
              </li>
              <li>
                <strong>Accretion</strong> and <strong>merger</strong>: gas falling onto an object and glowing, and two stars joining into one.
              </li>
              <li>
                <strong>Supernova</strong>, <strong>core collapse</strong>, <strong>neutrino</strong>, <strong>black hole</strong> and <strong>neutron star</strong>: ideas from earlier
                experiments.
              </li>
              <li>
                <strong>Give-or-take</strong>, <strong>solar mass</strong> and <strong>light-year</strong>: the uncertainty of a measurement, the unit for star weights and a unit of
                distance.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values in a part of
            its own. Nothing here is graded. Your predictions are your own guesses, made before you see anything. They never change the real pictures or the tables, which come from
            the physics and the published numbers. Your guesses are drawn on top of two of the real pictures, in white, so you can compare each guess with the real result. They are
            shown again beside the results too. The page has four parts: first you predict and watch the pictures; then, in “Now try it yourself”, you can choose how much of the star
            is thrown off and how many stars fail, and watch two drawings of your own follow your choices; then come the results; and last a tutor asks you some questions. The real
            pictures and the results tables never change. Your white guess marks appear on the pictures, and only the two drawings in “Now try it yourself” follow your choices.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is bookkeeping with published numbers. It does not simulate the collapse, the shock, the fall back or the dust, and it does
            not work out the black hole’s X-rays. It adds up masses and energies that the papers give, sets them against the limits from earlier experiments, and counts how many stars
            might fail. It does not decide between a black hole and a merger: it shows what each would predict.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers and news releases
            behind the numbers are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/stars/types/">NASA: Types of stars</ExternalLink>: how a very heavy star ends, and which stars leave neutron stars
              and black holes.
            </li>
            <li>
              <ExternalLink href="https://imagine.gsfc.nasa.gov/science/objects/supernovae1.html">NASA Imagine the Universe: Supernovae</ExternalLink>: why a heavy star’s core
              collapses and what the explosion is like.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/black-holes/">NASA: Black holes</ExternalLink>: what a black hole is, how one forms from a massive star, and what
              the event horizon is.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/ems/07_infraredwaves/">NASA: Infrared waves</ExternalLink>: what infrared light is, why we feel it as heat, and why it can
              get through dust.
            </li>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/light-year/en/">NASA Space Place: What is a light-year?</ExternalLink> What a light-year is, and why looking far away is
              looking into the past.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${PART_ONE_COLOR}` }}>
          <StepHeader
            step="Part 1"
            title="Predict, then watch"
            accent={PART_ONE_COLOR}
            lead={
              <>
                <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions, press Run, and watch three pictures build up one stage at a
                time. The pictures show fixed things: what telescopes recorded about one star in the Andromeda galaxy between 2012 and 2024, what the discovery paper says became of its
                weight and how strong its push was, and a published estimate of how many massive stars might fail. They are the same for everyone. When the run reaches stages 4 and 5,
                your guesses are drawn on them in white, so you can see how each guess compares with the real result. The real pictures stay the same whatever you guess.
              </>
            }
          />
        </div>

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        {(
          [
            {
              title: 'Prediction 1: how much energy does the push have?',
              text: (
                <>
                  Supernovae differ from one another in size and brightness, so by “a typical supernova” we mean a typical core-collapse supernova, the kind you met in Experiment 13. In
                  one of these, the shock gives the star’s outer layers a very large amount of energy to throw them out into space. Supernovae are not all the same: a strong one can
                  have up to {supernovaSpreadFactor()} times the energy of a typical one, and a weak one about half. That is a small difference compared with the differences between the
                  choices below, which are much bigger. For example, say a typical supernova has 100 units of energy. (We use 100 only because it is a round number that makes the sums easy. These are not real units of energy.) Others
                  then range from 50 to 200. “About the same” means about 100 units, which covers that whole range. “About 1 in 100” means one hundredth of 100, which is about 1 unit, and
                  that is 50 times below even the weakest normal supernova. “About 1 in 10,000” means one ten-thousandth of 100, which is about 0.01 units, and that is 5,000 times below it. In a failed supernova the core collapses in the
                  same way, but the shock gives the outer layers less energy, and it is not enough to throw them out. (Energy is what it takes to push something against gravity: the
                  more energy, the bigger the push.) How does the energy the failed supernova’s shock gives them compare with a typical supernova’s? The buttons say what share of a
                  typical supernova’s energy the failed one has: “about the same” means equal, and “about 1 in 100” means one hundredth as much.
                </>
              ),
              choices: PUSH_CHOICES,
              value: pushPrediction,
              set: (v: PushAnswer) => setPushPrediction(v),
            },
            {
              title: 'Prediction 2: how often?',
              text: (
                <>
                  Astronomers have watched many bright stars in nearby galaxies for years, looking for stars that vanish like this. By a “massive star” we mean one heavy enough that its
                  core collapses at the end of its life. Think of a very large group of massive stars. In every 100 of them, on average, about how many do you think end by failing like this, with no bright explosion? (“Less than 1 in every 100” means you would have to watch more than 100 massive stars to find one.)
                </>
              ),
              choices: COUNT_CHOICES,
              value: countPrediction,
              set: (v: CountAnswer) => setCountPrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              {question.text} You are not graded, and a guess is fine.
            </p>
            <div>
              {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => (question.set as (v: never) => void)(choice.value as never)}
                  disabled={hasRun}
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

        <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || hasRun} style={{ padding: '0.6rem 1.5rem' }}>
          Run
        </button>
        {hasRun && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && !hasRun && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}
        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}`}</strong>
              {status === 'complete' && <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>}
            </>
          )}
        </p>
        {status === 'running' && (
          <p style={{ fontSize: '0.875rem', marginTop: 0, color: 'var(--text-muted)' }}>
            {stage === 1 && 'Picture 1 shows what telescopes recorded about the star in 2012 and from 2014.'}
            {stage === 2 && 'The rest of Picture 1 is added: the fade between 2016 and 2024.'}
            {stage === 3 && 'Picture 2 appears below Picture 1. Its upper half shows how much of the star’s weight stayed collapsed, set against the limits from earlier experiments.'}
            {stage === 4 && 'The lower half of Picture 2 is added: how much energy the shock gives the outer layers. Your guess for Prediction 1 is drawn on it in white.'}
            {stage === 5 && 'Picture 3 appears below Picture 2: one hundred massive stars, and how many might fail. Your guess for Prediction 2 is drawn on it in white.'}
          </p>
        )}

        {/* Picture 1 (stage 1 on; the fade from stage 2). */}
        {hasRun && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureOne stage={stage} />
          </div>
        )}
        {hasRun && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>Where the real picture comes from.</strong> Every dot and bar is a published observation of the star M31-2014-DS1, <strong>measured</strong> by telescopes and
              reported by De and others (2026; the papers are listed under the pictures once the run is complete). The years and factors are the paper’s. The one thing worked out here is
              the length of the plateau bar: the paper says “about 1,000 days” from the start of 2014, and 1,000 ÷ 365.25 = {(1000 / 365.25).toFixed(2)} years. Nothing in this picture is
              imagined, and no curve is drawn between the marks, because no data points between them were read.
            </p>
            <p style={paragraph}>
              <strong>How to read Picture 1.</strong> It is a <strong>time line</strong>. The scale along the bottom counts years from {2010} to {2025}. Each <strong>row</strong> is one
              thing the telescopes recorded, and the words above it say what. A <strong>green dot</strong> is a single year, and a <strong>green bar</strong> runs from the year something
              began to the year it ended: a longer bar means it lasted longer. The rows are in the order they began. “Mid-infrared” is a part of the infrared range (see the Words box), and
              “a factor of more than 100” means the star gave out less than one hundredth of its earlier light.
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> The plateau lasts about 1,000 days: 1,000 ÷ 365.25 = {(1000 / 365.25).toFixed(2)} years, so the bar runs from 2014 to about 2016.7.
              {stage >= 2 && (
                <>
                  {' '}
                  If the star’s visible light fell by a factor of more than {thousands(FAILED_SUPERNOVA_DATA.visibleFadeFactor)} (the Hubble figure in the paper), then for every {thousands(FAILED_SUPERNOVA_DATA.visibleFadeFactor)} units of
                  light it gave out before, it gives out less than 1 now. JWST’s {Math.round(FAILED_SUPERNOVA_DATA.jwstFractionOfProgenitor * 100)} percent is {Math.round(FAILED_SUPERNOVA_DATA.jwstFractionOfProgenitor * 100)} units in every 100, in
                  infrared.
                </>
              )}
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureOne.slice(0, stage >= 2 ? 2 : 1)} />
          </div>
        )}

        {/* Picture 2 (the weight from stage 3; the push, and your guess, from stage 4). */}
        {stage >= 3 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureTwo stage={stage} guess={pushPrediction} />
          </div>
        )}
        {stage >= 3 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>Where the real picture comes from.</strong> In the upper half, the star’s {mass.starSolar} Suns at the end of its life ({mass.initialSolar} Suns at birth, after losing mass on the way), the
              at most {mass.thrownOffSolar} Sun thrown off and the {mass.collapsedPercent.toFixed(0)} percent that stayed are <strong>the discovery paper’s estimates</strong> (De and others, 2026), from its model of the star:
              they are not weighings. The blue lines at {mass.neutronStarTopSolar.toFixed(1)} and {mass.blackHoleBottomSolar.toFixed(1)} Suns are the limits from Black Holes Experiment 9, and the blue band at {mass.estimateLowSolar} to{' '}
              {mass.estimateHighSolar} is one 2026 preprint’s estimate (Kasza and Wolf), as in Experiment 15.
              {stage >= 4 && (
                <>
                  {' '}
                  In the lower half, the <strong>yellow bar</strong> is Experiment 13’s figure for a typical supernova. The <strong>orange bar</strong> is the discovery paper’s estimate of the failed supernova’s
                  push: an estimate from its model, <strong>not a measurement</strong>. The <strong>grey bar</strong> is the other paper’s wording, as AAS Nova summarises it (the paper itself was not read). The
                  “1 in {thousands(pushRange.lowOneIn)} to 1 in {thousands(pushRange.highOneIn)}” is <strong>calculated here</strong>, from the two energies. Nothing in this picture is imagined.
                </>
              )}
            </p>
            <p style={paragraph}>
              <strong>How to read Picture 2.</strong> In the <strong>upper half</strong>, the scale counts the star’s weight in Suns, from 0 to 6. The <strong>red bar</strong> is the part that stayed
              collapsed, and the <strong>short yellow bar</strong> at its end is the part that was thrown off. The <strong>blue dashed lines and band</strong> are limits from earlier experiments: up to
              {' '}{mass.neutronStarTopSolar.toFixed(1)} Suns, neutrons can hold a collapsed core up; the band is one 2026 estimate of the most a neutron star can weigh; above {mass.blackHoleBottomSolar.toFixed(1)} Suns, nothing known can.
              {stage >= 4 && (
                <>
                  {' '}
                  In the <strong>lower half</strong>, the scale is <strong>logarithmic</strong>: each tick, from {pow10Label(43)} to {pow10Label(52)}, is 10 times more than the one before, so a short distance can hide a huge
                  difference. Each bar covers the range of energies a source gives. An <strong>erg</strong> is a small unit of energy. The <strong>white triangle</strong> under the scale, its{' '}
                  <strong>dashed line</strong> and the <strong>white box</strong> are your guess: the triangle sits at the energy that matches your answer ({pow10Label(51)} erg for “about the same”, {pow10Label(49)} for “about 1 in 100”,{' '}
                  {pow10Label(47)} for “about 1 in 10,000”), and the dashed line is carried down through the bars so you can see where it falls. A guess has no range of its own, so the triangle is only a marker.
                  Nothing here says whether the guess was right.
                </>
              )}
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> {mass.starSolar} − {mass.thrownOffSolar} = {mass.remnantSolar.toFixed(1)} Suns stayed collapsed, and {mass.remnantSolar.toFixed(1)} ÷ {mass.starSolar} = {(mass.remnantSolar / mass.starSolar).toFixed(2)}, which is{' '}
              {mass.collapsedPercent.toFixed(0)} percent. Against the limits: {mass.remnantSolar.toFixed(1)} ÷ {mass.blackHoleBottomSolar.toFixed(1)} = {over.overSureBlackHole.toFixed(2)} and {mass.remnantSolar.toFixed(1)} ÷ {mass.estimateHighSolar} = {over.overEstimateTop.toFixed(2)}.
              {stage >= 4 && (
                <>
                  {' '}
                  For the energy: {pow10Label(47)} ÷ {pow10Label(51)} = 1 ÷ {thousands(pushRange.highOneIn)}, and {pow10Label(48)} ÷ {pow10Label(51)} = 1 ÷ {thousands(pushRange.lowOneIn)}. Going from {pow10Label(47)} up to {pow10Label(51)} is 4 ticks, and 4 steps
                  of ×10 is 10 × 10 × 10 × 10 = {thousands(10 ** 4)}.
                </>
              )}
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={stage >= 4 ? [...lookForPictureTwoMass, ...lookForPictureTwoPush] : lookForPictureTwoMass} />
          </div>
        )}

        {/* Picture 3 (stage 5). */}
        {stage >= 5 && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <PictureThree guess={countPrediction} />
          </div>
        )}
        {stage >= 5 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>Where the real picture comes from.</strong> The central count of {countRange.central.toFixed(0)} in 100 and the 90 percent range of {countRange.low.toFixed(0)} to {countRange.high.toFixed(0)} are a published estimate from an
              11-year survey of 27 nearby galaxies (Neustadt and others, 2021), turned into a fraction of the stars it watched: <strong>measured</strong> by the survey, but resting on only{' '}
              <strong>one</strong> clearly detected failed supernova. The dots are only a way of drawing a fraction (16 percent as 16 dots out of 100): that part is <strong>calculated here</strong>. Nothing in
              this picture is imagined.
            </p>
            <p style={paragraph}>
              <strong>How to read Picture 3.</strong> Each <strong>dot</strong> is one massive star, and there are 100 of them, so the number of coloured dots is the number out of every 100. The{' '}
              <strong>bright red dots</strong> (1 to {dotCounts.low}) are the low end of the survey’s 90 percent range, the <strong>medium red dots</strong> (up to {dotCounts.central}) are its central count, and the <strong>faint red dots</strong> (up to {dotCounts.high})
              are the high end of the range. The <strong>grey dots</strong> are not counted as failing. The <strong>white outlines and the white box</strong> are your guess: the outlines mark the dots that your
              answer stands for (“about 10 to 20” is dots 11 to 20, and “about half” is dots 41 to 60). A guess of “less than 1 in every 100” has no dots of its own, so it outlines only the first dot, as a marker.
              Nothing here says whether the guess was right.
            </p>
            <p style={paragraph}>
              <strong>A worked moment.</strong> 0.16 × 100 = {countRange.central.toFixed(0)} stars of every 100. The 90 percent range, 0.04 to 0.39, is {countRange.low.toFixed(0)} to {countRange.high.toFixed(0)}, because 0.16 − 0.12 = 0.04 and 0.16 + 0.23 = 0.39. The top of the range is {(countRange.high / countRange.low).toFixed(1)}{' '}
              times the bottom ({countRange.high.toFixed(0)} ÷ {countRange.low.toFixed(0)}), which is how wide a range can be when only one event has been seen.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForPictureThree} />
          </div>
        )}
        {done && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            <p style={paragraph}>
              <strong>The papers and releases behind these pictures.</strong> They are listed here, after the run, because they give the numbers you were asked to guess. Links open in a new tab.
            </p>
            <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2410.14778">De and others, “Disappearance of a massive star in the Andromeda Galaxy due to formation of a black hole” (Science, February 2026)</ExternalLink>:
                the discovery team’s paper, with the star’s weight, the push and the fade.
              </li>
              <li>
                <ExternalLink href="https://aasnova.org/2026/03/04/black-hole-baby-photos-jwst-and-chandra-observe-m31-2014-ds1/">AAS Nova: “Black Hole Baby Photos: JWST and Chandra Observe M31-2014-DS1”</ExternalLink>: a plain summary of
                the same team’s JWST and Chandra paper, with the 7 percent and the other paper’s wording for the push.
              </li>
              <li>
                <ExternalLink href="https://www.jpl.nasa.gov/news/archival-data-from-nasas-neowise-tracks-star-turning-into-black-hole/">NASA JPL: Archival data from NASA’s NEOWISE tracks star turning into black hole</ExternalLink>: the
                February 2026 release on the star’s infrared brightening and fade.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2601.05317">Beasor and others, “The fate of the failed supernova candidate M31-2014-DS1” (2026)</ExternalLink>: JWST, Submillimeter Array and Chandra data, read as a
                possible stellar merger.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2601.14497">Soker, “The failed failed-supernova scenario of M31-2014-DS1” (2026)</ExternalLink>: an argument against the black-hole reading.
              </li>
              <li>
                <ExternalLink href="https://arxiv.org/abs/2104.03318">Neustadt and others, “The search for failed supernovae with the Large Binocular Telescope” (2021)</ExternalLink>: the survey whose count of 16 in 100
                (4 to 39) is used in Picture 3.
              </li>
              <li>
                <ExternalLink href="https://news.osu.edu/the-big-star-that-couldnt-become-a-supernova/">Ohio State University: the big star that couldn’t become a supernova (2017)</ExternalLink>: the first candidate, in NGC 6946.
              </li>
            </ul>
          </div>
        )}
      </div>

        {/* Part 2, a section of its own (after the run): the learner's trial values. Its two drawings follow the controls; nothing in Part 1 does. There is no table that follows the
            controls (specification decision 8). DRAFT wording for the owner's approval (CLAUDE.md §28.1). */}
        {done && (
          <PageSection
            step="Part 2"
            title="Now try it yourself"
            accent={PART_TWO_COLOR}
            lead={
              <>
                <strong>What we are about to do.</strong> The experiment above is finished, and its pictures are fixed. This part is separate from it: a small workshop with two settings, each
                with a drawing of its own that follows your choice. It has no connection to your predictions (your white guess marks do not appear here), and it does not change the pictures
                above or the results below. Two things to explore: how much of the star would have to be thrown off to leave a neutron star instead of a black hole, and what a different count
                of failing stars would look like.
              </>
            }
          >
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>Your guesses from Part 1 have no effect here.</strong> They do not change these drawings or the results tables. Only the two settings below change the drawings.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>These are your own trial values, not real measurements.</strong> The weights on the buttons are numbers you pick to try out, like turning a dial to see how a drawing changes. None
              of them is a measurement. The real star is the one in Part 1: the discovery paper estimates that it weighed about 5 Suns at the end of its life and that at most about 0.1 Sun was thrown
              off, so about 4.9 Suns stayed collapsed. If you choose 3 Suns, the drawing does a simple subtraction, 5 − 3 = 2 Suns, and draws a bar that ends at 2.0, which is the most weight that
              neutrons are sure to hold up. That is a picture of an imagined star that threw off 3 Suns. It does not say that the real star did. The grey dashed line at 4.9 Suns stays in the drawing,
              so you can always see the paper’s estimate next to your trial.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>One thing to know.</strong> In a real star, nobody sets how much is thrown off. It is the result of a tug-of-war: the shock pushes the outer layers outward while the star’s
              gravity pulls them back, and whatever gets away is the amount thrown off. This experiment does not calculate that tug-of-war. The drawing only subtracts the number you pick from the
              star’s 5 Suns. So each button is something you can try, but the page does not check whether a real star’s shock could actually throw off that much. Use the drawing to see what each
              amount would mean for the weight left behind, not to decide what a real star could do.
            </p>
            <p style={{ ...paragraph, fontWeight: 'bold' }}>How much of the star is thrown off? (Suns) It changes the bar in Drawing A.</p>
            <ChoiceButtons
              options={FAILED_SUPERNOVA_DATA.thrownOffChoicesSolar}
              value={thrownOffChoice}
              onChange={setThrownOffChoice}
              format={(v) => `${sunsLabel(v)}${v === d.thrownOffSolar ? ' (the paper’s)' : v === d.envelopeMassSolar ? ' (all of its hydrogen-rich outer layer)' : ''}`}
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: 0 }}>
              {`Throwing off ${sunsLabel(mine.thrownOffSolar)} of the star’s ${sunsLabel(mine.starSolar)} would leave ${sunsLabel(Number(mine.remnantSolar.toFixed(2)))} collapsed, ${mine.collapsedPercent.toFixed(0)} percent of the star. That would be ${outcomeWords(mine.outcome)}. These are trial values, not measurements.`}
            </p>

            <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              <DrawingA mine={mine} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <p style={paragraph}>
                <strong>How to read Drawing A.</strong> It uses the same scale as the upper half of Picture 2: a ruler of weight in Suns, from 0 to 6. The star at the end of its life weighs {mine.starSolar} Suns.
                The <strong>long bar</strong> is the part that stays collapsed. It is coloured by what that weight could become: <strong>red</strong> for a black hole, <strong>violet</strong> for a neutron star,
                <strong> amber</strong> if it is uncertain. The <strong>short yellow bar</strong> at its right-hand end is the part you chose to throw off, and it disappears when you choose 0. The{' '}
                <strong>blue marks</strong> are the limits from earlier experiments: up to 2.0 Suns neutrons can hold a core up, 2.2 to 2.3 is one 2026 estimate of the most a neutron star can weigh, and above 3.0 nothing known can
                hold it up. The <strong>grey dashed line</strong> is the discovery paper’s estimate for the real star, {massPicture().remnantSolar.toFixed(1)} Suns, kept for comparison. Everything coloured here is imagined for the question, not measured.
              </p>
              <p style={paragraph}>
                <strong>A worked moment.</strong> The star weighs {mine.starSolar} Suns and you chose to throw off {mine.thrownOffSolar}, so {mine.starSolar} − {mine.thrownOffSolar} = {mine.remnantSolar.toFixed(2)} Suns stay collapsed. As a share of the star,
                {' '}{mine.remnantSolar.toFixed(2)} ÷ {mine.starSolar} = {(mine.fractionCollapsed).toFixed(2)}, or {mine.collapsedPercent.toFixed(0)} percent. To leave only 2.0 Suns, the most that neutrons are sure to hold up, you would have to
                throw off {mine.thrownOffNeededForNeutronStarSolar} Suns.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList items={lookForDrawingA} />
            </div>

            <p style={{ ...paragraph, fontWeight: 'bold' }}>How many of every hundred massive stars fail? (stars) It changes the green dots in Drawing B.</p>
            <ChoiceButtons
              options={FAILED_SUPERNOVA_DATA.failedPerHundredChoices}
              value={failedChoice}
              onChange={setFailedChoice}
              format={(v) => `${v} in 100${v === mine.failedRange.central ? ' (the survey’s central value)' : v === mine.failedRange.low ? ' (the low end of its range)' : v === mine.failedRange.high ? ' (the high end)' : ''}`}
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: 0 }}>
              {`${mine.failedPerHundred} in 100 means 1 massive star in every ${oneIn(mine.oneStarInEvery)} fails. The survey’s own range is ${mine.failedRange.low.toFixed(0)} to ${mine.failedRange.high.toFixed(0)} in 100, and your trial count is ${mine.failedVersusRange} it. These are trial values, not measurements.`}
            </p>

            <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              <DrawingB mine={mine} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={paragraph}>
                <strong>How to read Drawing B.</strong> It uses the same 100 dots as Picture 3: each dot is one massive star, counted along each row from the top left. The <strong>green dots</strong> are your trial
                count, the stars you chose to count as failing. The <strong>grey dots</strong> are not counted. The <strong>grey dashed rings</strong> sit on dots {mine.failedRange.low.toFixed(0)}, {mine.failedRange.central.toFixed(0)} and {mine.failedRange.high.toFixed(0)}: the low end, the central
                count and the high end of the survey’s range, kept for comparison. Nothing in this drawing is a measurement: the green dots are imagined for the question.
              </p>
              <p style={paragraph}>
                <strong>A worked moment.</strong> You chose {mine.failedPerHundred} in 100, so {mine.filledDots} dots are green. As “1 in N”, 100 ÷ {mine.failedPerHundred} = {oneIn(mine.oneStarInEvery)}, so about 1 massive star in every {oneIn(mine.oneStarInEvery)} would fail.
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong>
              </p>
              <LookForList items={lookForDrawingB} />
              <p style={{ ...paragraph, marginTop: '1rem' }}>
                <strong>These are trial values.</strong> They show what a different choice would look like. They do not say that real stars are like that.
              </p>
            </div>
          </PageSection>
        )}

        {/* Part 3, a section of its own (after the run): the results. Its numbers are fixed: they do not follow the predictions or Part 2's settings. DRAFT wording for the owner's
            approval (CLAUDE.md §28.1). */}
        {done && (
          <PageSection
            step="Part 3"
            title="The results"
            accent={PART_THREE_COLOR}
            lead={
              <>
                <strong>What we are about to do.</strong> In Part 1 you made two predictions: Prediction 1 (how much energy does the failed supernova’s push have, compared with a typical
                supernova’s?) and Prediction 2 (how many of every 100 massive stars fail like this?). Here are the real numbers, in three tables, so you can compare your guesses with them.
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Table 1</strong> is about the star M31-2014-DS1 and about how common failed supernovae may be. The answers to both predictions are in this table.
                  </li>
                  <li>
                    <strong>Table 2</strong> lists the published papers and releases behind the numbers, and says how strong each one is.
                  </li>
                  <li>
                    <strong>Table 3</strong> sets the two readings of the star side by side: a black hole, or two stars that merged.
                  </li>
                </ul>
                None of these tables changes with your guesses, or with the settings you chose in Part 2. Before the tables you will first see where things stand today, then a short check-up.
              </>
            }
          >
            <p style={{ ...paragraph, padding: '0.75rem 1rem', border: '2px solid var(--border-color, #ccc)', borderRadius: '8px', fontSize: '0.875rem' }}>
              <strong>Where this stands (as of October 2026).</strong> <strong>Strong evidence:</strong> the star M31-2014-DS1 in the Andromeda galaxy brightened a little in infrared light from
              2014, then faded in visible light by a factor of more than {thousands(check.visibleFadeFactor)}, and no bright supernova was seen. <strong>Contested:</strong> what it became. The
              team that found it says a black hole (<em>Science</em>, February 2026); two other 2026 papers read it as two stars that merged. <strong>Open:</strong> how often massive stars end
              without exploding: published estimates run from about {check.failedRange.low.toFixed(0)} in 100 to about {check.failedRange.high.toFixed(0)} in 100.
            </p>
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Your predictions, beside the results.</strong> Before the run you made two predictions. Here they are again, each with the place on this page where its number appears.
                Compare them yourself. The tutor will go through them with you after the tables.
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>Prediction 1: how much energy does the push have?</strong> You predicted: <strong>{pushLabel}</strong>. Its number is in Table 1, in the row “The push, compared with a
                typical supernova’s”.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Prediction 2: how often?</strong> You predicted: <strong>{countLabel}</strong>. Its number is in Table 1, in the row “How many of every 100 massive stars fail”.
              </p>
            </div>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>How to read these results.</strong> Think of these tables as a set of test results, and this section as the doctor explaining them. Nobody weighed this star or measured the
              energy of its push with an instrument. The weights and the push are estimates the discovery team worked out from how the star’s light changed, and how common failed supernovae are comes
              from one survey that found only one clear case. So each number comes with its own give-or-take, and some are stronger than others. The question to keep in mind is:{' '}
              <strong>do the numbers agree with each other, and how strong is each one?</strong>
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              First comes a short check-up that sets what we would expect beside what was found. Then each table has a plain-words note under it. The experiment explains what each number means.
              It does not decide for you what the star became: the two readings are set side by side in Table 3, and the tutor will help you think about them, after the tables.
            </p>
            <p style={{ marginBottom: '0.25rem' }}>
              <strong>The check-up: what we would expect, and what was found</strong>
            </p>
            <ResultsTable
              head={['What was checked', 'What we would expect', 'What was found', 'What this tells us']}
              minWidth={760}
              rows={[
                [
                  'What stays collapsed, against the limits',
                  `Black Holes Experiment 9: above ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES.toFixed(1)} Suns nothing known can hold a core up. Experiment 15: one 2026 estimate of the most a neutron star can weigh is ${d.maximumMassEstimateRangeSolar[0]} to ${d.maximumMassEstimateRangeSolar[1]} Suns`,
                  `${check.remnantSolar.toFixed(1)} Suns (the paper’s estimate), ${check.collapsedPercent.toFixed(0)} percent of the star`,
                  `Above both: ${check.overSureBlackHole.toFixed(2)} times the ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES.toFixed(1)} limit and ${check.overEstimateTop.toFixed(2)} times the top of the estimate. By these limits, that much weight would be a black hole.`,
                ],
                [
                  'The push, against an ordinary supernova’s',
                  `An ordinary supernova (Experiment 13): about ${pow10Label(51)} erg, so a ratio of 1 to 1`,
                  `${pow10Label(47)} to ${pow10Label(48)} erg: 1 in ${thousands(check.pushOneIn.lowOneIn)} to 1 in ${thousands(check.pushOneIn.highOneIn)} of that`,
                  `Much weaker: ${thousands(check.pushTimesWeaker.low)} to ${thousands(check.pushTimesWeaker.high)} times less. The other 2026 paper gives a lower range (1 in ${thousands(check.apjlPushOneIn.lowOneIn)} to 1 in ${thousands(check.apjlPushOneIn.highOneIn)}), so the two ranges meet only at 1 in ${thousands(check.pushRangesOverlapAtOneIn ?? 0)}. The sources differ.`,
                ],
                [
                  'The fade in 2024, against a similar star',
                  `NGC 6946-BH1, the first candidate: about ${check.ngc6946PercentRange[0].toFixed(0)} to ${check.ngc6946PercentRange[1].toFixed(0)} percent of its old light left (JWST, 2024; read only in a summary)`,
                  `About ${check.jwstPercent.toFixed(0)} percent of the old light left, in infrared (JWST, 2024)`,
                  `Below that range by ${check.fadeVersusNgc6946.distance.toFixed(0)} percentage points (the gap between 7 percent and 10 percent is 3 points). The first candidate kept ${check.ngc6946TimesJwst.low.toFixed(1)} to ${check.ngc6946TimesJwst.high.toFixed(1)} times as much of its light. Both faded to a small share, but not to the same share.`,
                ],
                [
                  'How common, against two other estimates',
                  `The 2017 press estimate: “as many as ${check.press2017Percent.toFixed(0)} percent”. An earlier 7-year survey: ${check.sevenYear.central.toFixed(0)} in 100 (${check.sevenYear.low.toFixed(0)} to ${check.sevenYear.high.toFixed(0)})`,
                  `${check.failedRange.central.toFixed(0)} in 100 (${check.failedRange.low.toFixed(0)} to ${check.failedRange.high.toFixed(0)}), the 11-year survey, 90 percent range`,
                  `Inside each other’s ranges: ${check.press2017Percent.toFixed(0)} lies inside ${check.failedRange.low.toFixed(0)} to ${check.failedRange.high.toFixed(0)}, and ${check.failedRange.central.toFixed(0)} lies inside ${check.sevenYear.low.toFixed(0)} to ${check.sevenYear.high.toFixed(0)}. They do not contradict each other, but the ranges are wide.`,
                ],
              ]}
            />
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              A doctor reads each result against a reference. Row 1 is set against limits from earlier experiments, row 2 against an ordinary supernova, and rows 3 and 4 against other published
              results. None of the rows says what the star is: that is why the status label says “Contested” for what it became. Table 3 sets out the two readings.
            </p>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 1: the star, the push, the fade and how common</strong>
            </p>
            <ResultsTable
              head={['Quantity', 'Value', 'Where it comes from']}
              minWidth={600}
              rows={[
                ['The star at the end of its life', `about ${check.starSolar} Suns`, 'De and others (2026): the discovery team’s estimate'],
                ['Thrown off', `at most about ${check.thrownOffSolar} Sun, ${check.thrownOffPercent.toFixed(0)} percent of the star`, 'De and others (2026): the discovery team’s estimate'],
                ['Collapsed', `${check.remnantSolar.toFixed(1)} Suns, ${check.collapsedPercent.toFixed(0)} percent of the star`, `worked out here: ${check.starSolar} − ${check.thrownOffSolar}`],
                [
                  'Collapsed, against the limits',
                  `${check.overSureBlackHole.toFixed(2)} times ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES.toFixed(1)} Suns; ${check.overEstimateTop.toFixed(2)} times ${d.maximumMassEstimateRangeSolar[1]} Suns`,
                  `worked out here: ${check.remnantSolar.toFixed(1)} ÷ ${SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES.toFixed(1)} and ${check.remnantSolar.toFixed(1)} ÷ ${d.maximumMassEstimateRangeSolar[1]} (Black Holes Experiment 9; Experiment 15)`,
                ],
                [
                  'What would have to be thrown off to leave a neutron star',
                  `at least ${check.thrownOffNeededSolar.toFixed(1)} Suns, ${check.thrownOffNeededPercent.toFixed(0)} percent of the star`,
                  `worked out here: ${check.starSolar} − 2.0, the most weight neutrons are sure to hold up`,
                ],
                [
                  'The push, compared with a typical supernova’s (the row for Prediction 1)',
                  `${pow10Label(47)} to ${pow10Label(48)} erg, which is 1 in ${thousands(check.pushOneIn.lowOneIn)} to 1 in ${thousands(check.pushOneIn.highOneIn)} of a typical supernova’s ${pow10Label(51)} erg`,
                  `De and others (2026) for the push; the ${pow10Label(51)} is Experiment 13’s. You predicted: ${pushLabel}`,
                ],
                [
                  'The fade',
                  `visible light more than ${thousands(check.visibleFadeFactor)} times fainter than in 2012; about ${check.jwstPercent.toFixed(0)} percent of the old light left in infrared in 2024`,
                  'De and others (2026) (Hubble); De and others, ApJ Letters (2026), through AAS Nova’s summary (JWST)',
                ],
                [
                  'How many of every 100 massive stars fail (the row for Prediction 2)',
                  `${check.failedRange.central.toFixed(0)} in 100, with a 90 percent range of ${check.failedRange.low.toFixed(0)} to ${check.failedRange.high.toFixed(0)}; about 1 star in every ${oneIn(check.oneStarInEvery)}`,
                  `Neustadt and others (2021); it rests on one clearly detected failed supernova. You predicted: ${countLabel}`,
                ],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>What stays collapsed.</strong> What it is: how much of the star’s weight did not get thrown out. What it means: of the {check.starSolar} Suns, at most {check.thrownOffSolar} Sun was thrown off, so{' '}
                {check.starSolar} − {check.thrownOffSolar} = {check.remnantSolar.toFixed(1)} Suns stayed, which is {check.collapsedPercent.toFixed(0)} percent. Why it matters: {check.remnantSolar.toFixed(1)} Suns is above every limit from earlier experiments, so a black hole is the
                result those limits point to. To leave a neutron star instead, at least {check.thrownOffNeededSolar.toFixed(1)} Suns ({check.thrownOffNeededPercent.toFixed(0)} percent) would have to be thrown off, {check.thrownOffNeededOverPaper.toFixed(0)} times more than the paper’s estimate. How sure the number is: it is an estimate from a model of the
                star, not a weighing, and the limits are rough teaching limits.
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>The push.</strong> What it is: the energy the shock gave the star’s outer layers. What it means: {pow10Label(47)} to {pow10Label(48)} erg, against {pow10Label(51)} for a typical supernova. That is {thousands(check.pushTimesWeaker.low)} to {thousands(check.pushTimesWeaker.high)} times less. For example, {thousands(check.pushTimesWeaker.low)} times less is like a full bathtub (about 200 litres) set beside one cup of water (about 0.2 litre), and the
                push is even smaller than that. Why it matters: a push this small does not throw the outer layers away, so there is no bright flash, which is what the telescopes saw. How sure
                the number is: the two 2026 papers give different ranges, and nobody measured the push directly.
              </p>
              <p style={{ margin: '0 0 0.5rem' }}>
                <strong>The fade.</strong> What it is: how much of the star’s light was left. What it means: in visible light it dropped by more than {thousands(check.visibleFadeFactor)} times, but a space telescope still found about {check.jwstPercent.toFixed(0)} percent of the old light in infrared, like a
                lamp turned down to {check.jwstPercent.toFixed(0)} percent of its brightness, not switched off. Why it matters: something is still giving off light there, and both readings have to explain it.
              </p>
              <p style={{ margin: 0 }}>
                <strong>How many fail.</strong> What it is: how many of every 100 massive stars end without a bright explosion. What it means: the best count is {check.failedRange.central.toFixed(0)} in 100, but the range is {check.failedRange.low.toFixed(0)} to {check.failedRange.high.toFixed(0)}, and the top of the range is {check.topOverBottom.toFixed(1)} times the bottom ({check.failedRange.high.toFixed(0)} ÷ {check.failedRange.low.toFixed(0)}). Why it matters: a range that wide
                is what you get when only one event has been seen. It rests on one clearly detected failed supernova, so it is the weakest number on this page.
              </p>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 2: the published papers and releases, and how strong each is</strong>
            </p>
            <ResultsTable
              head={['Source', 'What it reports', 'How strong it is']}
              minWidth={640}
              rows={[
                ['De and others, Science (12 February 2026; arXiv:2410.14778)', 'the star’s history; about 13 Suns at birth and about 5 at the end; the push of 10⁴⁷ to 10⁴⁸ erg; at most about 0.1 Sun thrown off; about 98 percent collapsed or fell back', 'the discovery team’s own paper. Read through its abstract and the first half only. The weights and the push are estimates from a model'],
                ['De and others, ApJ Letters 999, L25 (2026)', 'about 7 percent of the old light left in 2024; a push “one hundred-millionth to one ten-thousandth” of a typical supernova’s; X-rays “no sooner than about 27 years”', 'read only through AAS Nova’s summary'],
                ['Beasor and others (arXiv:2601.05317, 2026)', 'a luminous mid-infrared source persists at the same place; no X-rays; asymmetric dust; a merger “also seems to provide a plausible explanation”', 'a different team’s paper, accepted to a journal; read through its abstract only'],
                ['Soker (arXiv:2601.14497, 2026)', 'argues that the black-hole reading needs less than 1 percent of the bound material accreted and predicts about ten times too much radiation; favours dust ejected by a pair of stars', 'one author’s argument; read through its abstract only'],
                ['Neustadt and others, MNRAS 508, 516 (2021)', 'about 16 in 100 massive stars (4 to 39, 90 percent range), from 27 galaxies over 11 years', 'a survey; its abstract says it found only one clearly detected failed supernova'],
                ['NASA JPL release (12 February 2026)', 'the star brightened in infrared in 2014 and by 2023 was more than 10,000 times fainter in visible light; 2.5 million light-years away', 'an official release; a plain summary of the discovery team’s work'],
                ['Ohio State University news (25 May 2017)', 'the first candidate, NGC 6946-BH1: 25 Suns, brightened in 2009, gone by 2015; “as many as 30 percent” of massive stars may collapse quietly', 'a 2017 news release; it says it is “too early” to know for sure'],
              ]}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: 0 }}>
                <strong>What this table tells us.</strong> What it is: the papers and releases that the pictures and numbers come from, each with what it reports. What it means: the discovery team’s papers give the
                weights, the push and the fade; a different team’s paper and one author’s argument give another reading; a survey gives how common; and news releases give the first candidate and a plain summary. Why it
                matters: the numbers on this page come from abstracts and summaries, not from the full papers (the right-hand column says what was read), and the strongest-sounding numbers, the weights and the push, are estimates from a model, not
                measurements by an instrument. The only direct observations are the star’s light, which several telescopes recorded.
              </p>
            </div>

            <p style={{ margin: '1.5rem 0 0.25rem' }}>
              <strong>Table 3: the two readings, side by side</strong>
            </p>
            <ResultsTable
              head={['Topic', 'A black hole (the discovery team)', 'Two stars that merged (two other teams)', 'Who says so']}
              minWidth={760}
              rows={readings().map((row) => [row.topic, row.blackHole, row.merger, row.source])}
            />
            <div style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <p style={{ margin: 0 }}>
                <strong>What this table tells us.</strong> What it is: what each side says about the same observations. What it means: both sides use the same telescope observations (the fade, the infrared glow
                and the lack of X-rays so far) and disagree about what caused them. Why it matters: a disagreement like this is settled by new observations, such as X-rays (the discovery team says they should appear in about 27
                years) and later infrared pictures. This page does not choose between the readings, because the papers do not settle it yet.
              </p>
            </div>
          </PageSection>
        )}

        {/* Part 4, the tutor (after the results): observe, compare with the predictions, a conceptual question, then the explanation. DRAFT wording for the owner's approval. */}
        {done && pushPrediction !== null && countPrediction !== null && (
          <PageSection
            step="Part 4"
            title="The tutor"
            accent={PART_FOUR_COLOR}
            lead={
              <>
                <strong>What we are about to do.</strong> You have now seen the pictures and the tables. This last part is a short conversation with a tutor, to help you make sense of them.
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Three questions, one at a time.</strong> First, the tutor asks what you see in Pictures 1 and 2. Second, it asks you to compare your own guesses (the white marks) with the
                    real results. Third, it asks one bigger question, about how two teams could tell their readings of the star apart. Type a few words for each. Nothing is graded, and a short answer
                    is fine.
                  </li>
                  <li>
                    <strong>No verdict until you have replied.</strong> The tutor will not say whether your guesses were right until you have answered all three, so you can think it through first.
                  </li>
                  <li>
                    <strong>Then the explanation.</strong> The tutor marks each of your two predictions as matched or not matched, and then goes through what lies behind the numbers in seven short
                    parts: why a collapse does not always end in a flash, what stays collapsed, why the push is so weak, what the telescopes saw, the two readings, how common this may be, and what was and was not
                    shown. Some parts use a worked sum or an everyday comparison.
                  </li>
                  <li>
                    <strong>After the explanation,</strong> a short summary of what you learned will appear below (it is not written yet).
                  </li>
                </ul>
              </>
            }
          >
            <FailedSupernovaTutor pushPrediction={pushPrediction} countPrediction={countPrediction} onExplained={onTutorComplete} />
          </PageSection>
        )}
    </div>
  )
}
