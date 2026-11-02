import type { ReactNode } from 'react'
import {
  ELEMENT_TESTS,
  FREEZE_OUT_KT_MEV,
  FREEZE_OUT_TIME_S,
  MASS_DIFFERENCE_CHOICES,
  NEUTRON_PROTON_MASS_DIFFERENCE_MEV,
  REAL_WAIT_S,
  TRIAL_AXIS_MAX_ATOMS,
  TRIAL_AXIS_MAX_NEUTRONS_PER_PROTON,
  TRIAL_AXIS_MIN_ATOMS,
  HELIUM_OBSERVED_EMPRESS,
  HELIUM_OBSERVED_LBT,
  HELIUM_THEORY,
  HELIUM_TO_HYDROGEN_WEIGHT,
  LITHIUM_OBSERVED_E10,
  LITHIUM_OBSERVED_E10_2013,
  LITHIUM_THEORY_E10,
  LITHIUM_THEORY_E10_2013,
  atomGuessValue,
  atomRows,
  gapBetween,
  massRows,
  nucleonSample,
  predictionOverObservation,
  rangesOverlap,
  recipe,
  shareGuessPercent,
  timeline,
  trialFigures,
} from '../physics/earlyUniverseRecipe'
import type { Measurement, RecipeSettings, RulerRow } from '../physics/earlyUniverseRecipe'
import { CaptionBlock } from './BlackHoleGrowthPictures'
import type { LookFor } from './WideBinariesExperiment'

// Evidence and Imagination, Experiment 6: Picture 1 (the neutrons at about one second and after the wait), Picture 2 (the helium share, by mass and by number) and Picture 3 (three light elements, calculated and measured),
// with their captions. The wording is Claude's DRAFT of 2026-11-01, for the owner's approval (CLAUDE.md §28.1).
// Every number drawn or written here is read from the physics module (CLAUDE.md §9); this file only draws it (pixel positions on the rulers are the only arithmetic done here).
// Colours: cyan is calculated here, dashed cyan is calculated by others, green is measured by others, pink is imagined for the question (Drawing A's trial settings), orange and blue tell neutrons and protons apart (a sketch, not a measurement) and white is always the learner's guess (CLAUDE.md §14).
// Nothing here says why the neutrons could only be held in nuclei after about three minutes, or why helium and not heavier elements was made, or what might explain the lithium gap (CLAUDE.md §12): that is the tutor's.

const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const CYAN = '#22d3ee'
const GREEN = '#4ade80'
const PINK = '#f472b6'
const NEUTRON = '#fb923c'
const PROTON = '#60a5fa'
const YOURS_COLOR = '#ffffff'

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const n1 = (x: number) => x.toFixed(1)
const n2 = (x: number) => x.toFixed(2)

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor} stroke="#0b1020" strokeWidth={3} paintOrder="stroke" strokeLinejoin="round">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size + 3}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

// The white box that holds the learner's guess, joined to the guess mark by a line (CLAUDE.md §14).
function GuessBox({ x, y, w, lines, fromX, fromY }: { x: number; y: number; w: number; lines: string[]; fromX: number; fromY: number }) {
  const h = 14 + lines.length * 13
  return (
    <g>
      <line x1={fromX} y1={fromY} x2={x} y2={y + h / 2} stroke={YOURS_COLOR} strokeWidth={2} />
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
      <SvgLines x={x + w / 2} y={y + 16} lines={lines} fill={YOURS_COLOR} bold size={10} anchor="middle" />
    </g>
  )
}

type DotKind = 'n' | 'p' | 'd'
function Dot({ cx, cy, kind }: { cx: number; cy: number; kind: DotKind }) {
  if (kind === 'n') return <circle cx={cx} cy={cy} r={5} fill={NEUTRON} />
  if (kind === 'd') return <circle cx={cx} cy={cy} r={4} fill={PROTON} stroke={NEUTRON} strokeWidth={2} />
  return <circle cx={cx} cy={cy} r={5} fill={PROTON} />
}
// A grid of dots, filled row by row.
function DotGrid({ x, y, cols, kinds, pitch = 14 }: { x: number; y: number; cols: number; kinds: DotKind[]; pitch?: number }) {
  return (
    <g>
      {kinds.map((kind, i) => (
        <Dot key={i} cx={x + (i % cols) * pitch + pitch / 2} cy={y + Math.floor(i / cols) * pitch + pitch / 2} kind={kind} />
      ))}
    </g>
  )
}
const repeat = (kind: DotKind, count: number): DotKind[] => Array.from({ length: count }, () => kind)

function Legend({ x, y, withDecayed }: { x: number; y: number; withDecayed: boolean }) {
  return (
    <g>
      <Dot cx={x + 6} cy={y} kind="n" />
      <SvgLines x={x + 18} y={y + 4} lines={['neutron']} fill={TEXT_COLOR} size={11} />
      <Dot cx={x + 96} cy={y} kind="p" />
      <SvgLines x={x + 108} y={y + 4} lines={['proton']} fill={TEXT_COLOR} size={11} />
      {withDecayed && (
        <>
          <Dot cx={x + 176} cy={y} kind="d" />
          <SvgLines x={x + 188} y={y + 4} lines={['a neutron that has decayed into a proton']} fill={TEXT_COLOR} size={11} />
        </>
      )}
    </g>
  )
}

// ---- Picture 1: the neutrons at about one second, and after the wait ----
const P1_W = 760
const P1_H = 520

export function PictureOne({ stage }: { stage: number }) {
  const r = recipe()
  const s = nucleonSample()
  const t = timeline()
  const barX0 = 60
  const barW = 640
  const barMaxS = 900
  const tx = (sec: number) => barX0 + (sec / barMaxS) * barW
  return (
    <svg viewBox={`0 0 ${P1_W} ${P1_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 1: a sample of 200 protons and neutrons at about one second, and again after the neutrons have waited, with a ruler of time">
      <SvgLines x={20} y={24} lines={[`A. The mixture at about ${FREEZE_OUT_TIME_S} second: a sample of ${s.total} protons and neutrons`]} fill={TEXT_COLOR} size={12} bold />
      <rect x={34} y={40} width={292} height={152} fill="none" stroke={CYAN} strokeWidth={1.5} />
      <DotGrid x={40} y={44} cols={20} kinds={[...repeat('n', s.neutronsAtFreezeOut), ...repeat('p', s.protonsAtFreezeOut)]} />
      <SvgLines x={350} y={62} lines={[`${s.neutronsAtFreezeOut} neutrons and ${s.protonsAtFreezeOut} protons`, `in this sample of ${s.total}`]} fill={TEXT_COLOR} size={12} bold />
      <SvgLines x={350} y={100} lines={[`That is 1 neutron for every ${n1(1 / r.freezeOutNeutronsPerProton)} protons`, `(${n2(r.freezeOutNeutronsPerProton)} neutrons per proton).`]} fill={TEXT_COLOR} size={11} />
      <SvgLines x={350} y={140} lines={['The cyan frame means the counts were calculated here.', 'The dots are an imagined sketch: real particles are', 'not dots in a grid.']} fill={MUTED_COLOR} size={10} />
      <Legend x={40} y={210} withDecayed={false} />
      {stage >= 2 && (
        <g>
          <line x1={20} y1={236} x2={P1_W - 20} y2={236} stroke="#334155" />
          <SvgLines x={20} y={258} lines={[`B. The same sample after the neutrons have waited until ${t.waitEndS} seconds from the start`]} fill={TEXT_COLOR} size={12} bold />
          <rect x={34} y={274} width={292} height={152} fill="none" stroke={CYAN} strokeWidth={1.5} />
          <DotGrid x={40} y={278} cols={20} kinds={[...repeat('n', s.neutronsAfterWait), ...repeat('d', s.decayed), ...repeat('p', s.protonsAtFreezeOut)]} />
          <SvgLines x={350} y={296} lines={[`${s.neutronsAfterWait} neutrons and ${s.protonsAfterWait} protons`, `in the same sample of ${s.total}`]} fill={TEXT_COLOR} size={12} bold />
          <SvgLines x={350} y={334} lines={[`About ${s.decayed} of the ${s.neutronsAtFreezeOut} neutrons decayed into protons`, 'during the wait (the blue dots with an orange ring).', `Now 1 neutron for every ${n1(r.neutronsPerProtonAsOneIn)} protons.`]} fill={TEXT_COLOR} size={11} />
          <Legend x={40} y={444} withDecayed />
          <SvgLines x={20} y={476} lines={['Ruler of time, in seconds from the start']} fill={TEXT_COLOR} size={11} bold />
          <line x1={barX0} y1={486} x2={barX0 + barW} y2={486} stroke={MUTED_COLOR} strokeWidth={2} />
          <rect x={tx(t.freezeOutS)} y={481} width={tx(t.waitEndS) - tx(t.freezeOutS)} height={10} fill={CYAN} fillOpacity={0.5} stroke={CYAN} />
          <line x1={tx(t.freezeOutS)} y1={476} x2={tx(t.freezeOutS)} y2={496} stroke={TEXT_COLOR} strokeWidth={2} />
          <line x1={tx(t.waitEndS)} y1={476} x2={tx(t.waitEndS)} y2={496} stroke={TEXT_COLOR} strokeWidth={2} />
          <line x1={tx(t.lifetimeS)} y1={476} x2={tx(t.lifetimeS)} y2={496} stroke={NEUTRON} strokeWidth={2} />
          <SvgLines x={tx(t.freezeOutS)} y={510} lines={[`${t.freezeOutS} s: the start of the wait`]} fill={TEXT_COLOR} size={10} anchor="start" />
          <SvgLines x={tx(t.waitEndS) + 6} y={510} lines={[`${t.waitEndS} s (about three minutes): the end of the wait`]} fill={TEXT_COLOR} size={10} anchor="start" />
          <SvgLines x={tx(t.lifetimeS)} y={510} lines={[`${n1(t.lifetimeS)} s: a free neutron’s average life`]} fill={NEUTRON} size={10} anchor="end" />
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2: the helium share, by mass and by number ----
const P2_W = 760
const P2_H = 622

function pct(v: number) {
  return `${n1(v)}%`
}

export function PictureTwo({ shareGuessId, atomGuessId }: { shareGuessId: string | null; atomGuessId: string | null }) {
  const s = nucleonSample()
  const rows = massRows()
  const atoms = atomRows()
  const x0 = 200
  const x1 = 700
  const mx = (percent: number) => x0 + (percent / 100) * (x1 - x0)
  const logLo = Math.log(0.7)
  const logHi = Math.log(140)
  const ax = (v: number) => x0 + ((Math.log(v) - logLo) / (logHi - logLo)) * (x1 - x0)
  const massRowLabels: Record<string, string[]> = {
    model: ['This page’s calculation', '(a chosen input, not a prediction)'],
    lbt: ['Measured: the LBT value'],
    empress: ['Measured: the EMPRESS value'],
    theory: ['Published calculation', '(by others, 2026 paper)'],
  }
  const massRowY = (i: number) => 254 + i * 32
  const guessPercent = shareGuessId ? shareGuessPercent(shareGuessId) : null
  const guessAtoms = atomGuessId ? atomGuessValue(atomGuessId) : null
  const heliumBlocks = Array.from({ length: s.heliumNuclei }, (_, i) => i)
  const rowMark = (row: RulerRow, cx: number, cy: number): ReactNode => {
    if (row.kind === 'measured') return <circle cx={cx} cy={cy} r={5} fill={GREEN} />
    if (row.kind === 'calculated-by-others') return <circle cx={cx} cy={cy} r={5} fill="none" stroke={CYAN} strokeWidth={2} strokeDasharray="3 2" />
    return <circle cx={cx} cy={cy} r={5} fill={CYAN} />
  }
  const atomRowY = (i: number) => 498 + i * 32
  return (
    <svg viewBox={`0 0 ${P2_W} ${P2_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 2: the sample sorted into helium and hydrogen nuclei, and the helium share by mass and by number, with your guesses drawn in white">
      <SvgLines x={20} y={24} lines={['A. The same sample, sorted: neutrons joined with protons into helium-4 nuclei, the other protons left as hydrogen']} fill={TEXT_COLOR} size={12} bold />
      <SvgLines x={40} y={42} lines={[`helium-4 nuclei: ${s.heliumNuclei}`, '(2 neutrons + 2 protons each)']} fill={TEXT_COLOR} size={10} />
      <rect x={34} y={64} width={142} height={110} fill="none" stroke={CYAN} strokeWidth={1.5} />
      {heliumBlocks.map((i) => {
        const bx = 42 + (i % 4) * 32
        const by = 70 + Math.floor(i / 4) * 34
        return (
          <g key={i}>
            <Dot cx={bx + 5} cy={by + 5} kind="n" />
            <Dot cx={bx + 17} cy={by + 5} kind="n" />
            <Dot cx={bx + 5} cy={by + 17} kind="p" />
            <Dot cx={bx + 17} cy={by + 17} kind="p" />
          </g>
        )
      })}
      <SvgLines x={216} y={42} lines={[`hydrogen nuclei: ${s.hydrogenNuclei}`, '(a single proton each)']} fill={TEXT_COLOR} size={10} />
      <rect x={210} y={64} width={246} height={110} fill="none" stroke={CYAN} strokeWidth={1.5} />
      <DotGrid x={216} y={70} cols={19} kinds={repeat('p', s.hydrogenNuclei)} pitch={12} />
      <SvgLines x={480} y={84} lines={[`${s.heliumDots} of the ${s.total} particles are in helium,`, `${s.hydrogenNuclei} are hydrogen.`, `Helium is ${pct((s.heliumDots / s.total) * 100)} of the weight`, 'in this rounded sample.']} fill={TEXT_COLOR} size={11} />
      <SvgLines x={480} y={146} lines={['The cyan frames mean the counts were calculated here.', 'The sorting into groups is an imagined sketch.']} fill={MUTED_COLOR} size={10} />
      <line x1={20} y1={190} x2={P2_W - 20} y2={190} stroke="#334155" />
      <SvgLines x={20} y={212} lines={['B. Helium by mass: what percent of the total weight is helium']} fill={TEXT_COLOR} size={12} bold />
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={mx(v)} y1={232} x2={mx(v)} y2={410} stroke="#1e293b" />
          <SvgLines x={mx(v)} y={424} lines={[`${v}%`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      {rows.map((row, i) => (
        <g key={row.id}>
          <SvgLines x={20} y={massRowY(i) + 3} lines={massRowLabels[row.id]} fill={TEXT_COLOR} size={10} />
          {row.giveOrTake > 0 && <line x1={mx(row.value - row.giveOrTake)} y1={massRowY(i)} x2={mx(row.value + row.giveOrTake)} y2={massRowY(i)} stroke={row.kind === 'measured' ? GREEN : CYAN} strokeWidth={3} />}
          {rowMark(row, mx(row.value), massRowY(i))}
          <SvgLines x={mx(row.value) + 12} y={massRowY(i) + 4} lines={[pct(row.value)]} fill={TEXT_COLOR} size={10} />
        </g>
      ))}
      <SvgLines x={20} y={massRowY(4) + 3} lines={['Your guess (Prediction 1)']} fill={YOURS_COLOR} size={10} bold />
      {guessPercent !== null && (
        <g>
          <polygon points={`${mx(guessPercent)},${massRowY(4) - 8} ${mx(guessPercent) + 8},${massRowY(4)} ${mx(guessPercent)},${massRowY(4) + 8} ${mx(guessPercent) - 8},${massRowY(4)}`} fill={YOURS_COLOR} />
          <GuessBox x={mx(guessPercent) + 44 > x1 - 100 ? mx(guessPercent) - 150 : mx(guessPercent) + 44} y={massRowY(4) - 16} w={108} lines={['YOUR GUESS', `about ${guessPercent} percent`]} fromX={mx(guessPercent) + (mx(guessPercent) + 44 > x1 - 100 ? -8 : 8)} fromY={massRowY(4)} />
        </g>
      )}
      <SvgLines x={20} y={442} lines={['The bars on the dots show each give-or-take; on this scale they are too thin to see, so the numbers are written beside the dots.']} fill={MUTED_COLOR} size={10} />
      <line x1={20} y1={454} x2={P2_W - 20} y2={454} stroke="#334155" />
      <SvgLines x={20} y={476} lines={['C. Helium by number: helium atoms for every 100 hydrogen atoms (a log ruler)']} fill={TEXT_COLOR} size={12} bold />
      {[1, 3, 10, 30, 100].map((v) => (
        <g key={v}>
          <line x1={ax(v)} y1={486} x2={ax(v)} y2={584} stroke="#1e293b" />
          <SvgLines x={ax(v)} y={604} lines={[`${v}`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={20} y={atomRowY(0) + 3} lines={['From this page’s calculation', '(a chosen input)']} fill={TEXT_COLOR} size={10} />
      {rowMark(atoms[0], ax(atoms[0].value), atomRowY(0))}
      <SvgLines x={ax(atoms[0].value) + 12} y={atomRowY(0) + 4} lines={[n1(atoms[0].value)]} fill={TEXT_COLOR} size={10} />
      <SvgLines x={20} y={atomRowY(1) + 3} lines={['From the measured share', '(the LBT value)']} fill={TEXT_COLOR} size={10} />
      {rowMark(atoms[1], ax(atoms[1].value), atomRowY(1))}
      <SvgLines x={ax(atoms[1].value) + 12} y={atomRowY(1) + 4} lines={[n2(atoms[1].value)]} fill={TEXT_COLOR} size={10} />
      <SvgLines x={20} y={atomRowY(2) + 3} lines={['Your guess (Prediction 2)']} fill={YOURS_COLOR} size={10} bold />
      {guessAtoms !== null && (
        <g>
          <polygon points={`${ax(guessAtoms)},${atomRowY(2) - 8} ${ax(guessAtoms) + 8},${atomRowY(2)} ${ax(guessAtoms)},${atomRowY(2) + 8} ${ax(guessAtoms) - 8},${atomRowY(2)}`} fill={YOURS_COLOR} />
          <GuessBox x={ax(guessAtoms) + 44 > x1 - 100 ? ax(guessAtoms) - 150 : ax(guessAtoms) + 44} y={atomRowY(2) - 16} w={108} lines={['YOUR GUESS', `about ${guessAtoms} atoms`]} fromX={ax(guessAtoms) + (ax(guessAtoms) + 44 > x1 - 100 ? -8 : 8)} fromY={atomRowY(2)} />
        </g>
      )}
    </svg>
  )
}

// ---- Picture 3: three light elements, calculated and measured ----
const P3_W = 760
const P3_H = 470

function Panel({ y, title, unit, lo, hi, ticks, tickDecimals, rows, labels, decimals }: { y: number; title: string; unit: string; lo: number; hi: number; ticks: number[]; tickDecimals: number; rows: RulerRow[]; labels: Record<string, string[]>; decimals: number }) {
  const x0 = 250
  const x1 = 700
  const px = (v: number) => x0 + ((v - lo) / (hi - lo)) * (x1 - x0)
  const top = y + 34
  const rowY = (i: number) => top + 12 + i * 28
  const axisY = top + 12 + rows.length * 28
  return (
    <g>
      <SvgLines x={20} y={y + 14} lines={[title]} fill={TEXT_COLOR} size={12} bold />
      <SvgLines x={20} y={y + 28} lines={[unit]} fill={MUTED_COLOR} size={10} />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={top - 4} x2={px(v)} y2={axisY - 6} stroke="#1e293b" />
          <SvgLines x={px(v)} y={axisY + 6} lines={[v.toFixed(tickDecimals)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      {rows.map((row, i) => (
        <g key={row.id}>
          <SvgLines x={20} y={rowY(i) + 4} lines={labels[row.id]} fill={TEXT_COLOR} size={10} />
          <line x1={px(row.value - row.giveOrTake)} y1={rowY(i)} x2={px(row.value + row.giveOrTake)} y2={rowY(i)} stroke={row.kind === 'measured' ? GREEN : CYAN} strokeWidth={3} strokeDasharray={row.kind === 'calculated-by-others' ? '6 3' : undefined} />
          <line x1={px(row.value - row.giveOrTake)} y1={rowY(i) - 6} x2={px(row.value - row.giveOrTake)} y2={rowY(i) + 6} stroke={row.kind === 'measured' ? GREEN : CYAN} strokeWidth={2} />
          <line x1={px(row.value + row.giveOrTake)} y1={rowY(i) - 6} x2={px(row.value + row.giveOrTake)} y2={rowY(i) + 6} stroke={row.kind === 'measured' ? GREEN : CYAN} strokeWidth={2} />
          <circle cx={px(row.value)} cy={rowY(i)} r={5} fill={row.kind === 'measured' ? GREEN : '#0b1020'} stroke={row.kind === 'measured' ? GREEN : CYAN} strokeWidth={2} />
          <SvgLines x={Math.min(px(row.value + row.giveOrTake) + 8, x1 - 60)} y={rowY(i) - 8} lines={[`${row.value.toFixed(decimals)} ± ${row.giveOrTake.toFixed(decimals)}`]} fill={TEXT_COLOR} size={10} />
        </g>
      ))}
    </g>
  )
}

export function PictureThree({ stage }: { stage: number }) {
  const he = massRows().filter((r) => r.id !== 'model')
  const [, deuterium, lithium] = ELEMENT_TESTS
  const dRows: RulerRow[] = [
    { id: 'theory', kind: 'calculated-by-others', value: deuterium.theory.value, giveOrTake: deuterium.theory.giveOrTake },
    { id: 'observed', kind: 'measured', value: deuterium.observed.value, giveOrTake: deuterium.observed.giveOrTake },
  ]
  const lRows: RulerRow[] = [
    { id: 'theory', kind: 'calculated-by-others', value: lithium.theory.value, giveOrTake: lithium.theory.giveOrTake },
    { id: 'observed', kind: 'measured', value: lithium.observed.value, giveOrTake: lithium.observed.giveOrTake },
  ]
  const ratio = predictionOverObservation(LITHIUM_THEORY_E10, LITHIUM_OBSERVED_E10)
  const lx0 = 250
  const lx1 = 700
  const lpx = (v: number) => lx0 + (v / 7) * (lx1 - lx0)
  const liTop = 292 + 34
  return (
    <svg viewBox={`0 0 ${P3_W} ${P3_H}`} width="100%" style={svgStyle} role="img" aria-label="Picture 3: for helium, deuterium and lithium-7, the published calculation and the measurement, each with its give-or-take">
      <Panel
        y={10}
        title="Helium-4"
        unit="percent of the weight"
        lo={23.4}
        hi={25.2}
        ticks={[23.5, 24, 24.5, 25]}
        tickDecimals={1}
        rows={[he[2], he[0], he[1]]}
        labels={{ theory: ['Published calculation'], lbt: ['Measured: the LBT value'], empress: ['Measured: the EMPRESS value'] }}
        decimals={2}
      />
      <line x1={20} y1={158} x2={P3_W - 20} y2={158} stroke="#334155" />
      <Panel
        y={164}
        title="Deuterium"
        unit="×10⁻⁵ (deuterium atoms per hydrogen atom)"
        lo={2.3}
        hi={2.7}
        ticks={[2.3, 2.4, 2.5, 2.6, 2.7]}
        tickDecimals={1}
        rows={dRows}
        labels={{ theory: ['Published calculation'], observed: ['Measured'] }}
        decimals={3}
      />
      {stage >= 5 && (
        <g>
          <line x1={20} y1={286} x2={P3_W - 20} y2={286} stroke="#334155" />
          <Panel
            y={292}
            title="Lithium-7"
            unit="×10⁻¹⁰ (lithium-7 atoms per hydrogen atom)"
            lo={0}
            hi={7}
            ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
            tickDecimals={0}
            rows={lRows}
            labels={{ theory: ['Published calculation'], observed: ['Measured'] }}
            decimals={2}
          />
          <line x1={lpx(LITHIUM_OBSERVED_E10.value)} y1={liTop + 12 + 56 + 26} x2={lpx(LITHIUM_THEORY_E10.value)} y2={liTop + 12 + 56 + 26} stroke={TEXT_COLOR} strokeWidth={2} strokeDasharray="4 3" />
          <SvgLines x={(lpx(LITHIUM_OBSERVED_E10.value) + lpx(LITHIUM_THEORY_E10.value)) / 2} y={liTop + 12 + 56 + 48} lines={[`the gap: the published calculation is ${n1(ratio)} times the measurement`]} fill={TEXT_COLOR} size={11} bold anchor="middle" />
        </g>
      )}
    </svg>
  )
}

// ---- Captions ----
function verdictWord(a: Measurement, b: Measurement): string {
  return rangesOverlap(a, b) ? 'overlap' : 'do not overlap'
}

export function pictureOneCaption(stage: number): ReactNode {
  const r = recipe()
  const s = nucleonSample()
  const t = timeline()
  const ratioFrom = n1(1 / r.freezeOutNeutronsPerProton)
  const lookFor: LookFor[] = [
    {
      look: <>The orange dots in Part A.</>,
      means: (
        <>
          {s.neutronsAtFreezeOut} of the {s.total} particles in the sample are neutrons, and {s.protonsAtFreezeOut} are protons: about 1 neutron for every {ratioFrom} protons (the exact figure is {n2(r.freezeOutNeutronsPerProton)} neutrons per proton).
        </>
      ),
      matters: <>It is the stock the early universe has to work with: neutrons are far scarcer than protons. What can be made from them is what the rest of the experiment is about.</>,
    },
  ]
  if (stage >= 2) {
    lookFor.push(
      {
        look: <>The blue dots with an orange ring in Part B.</>,
        means: (
          <>
            About {s.decayed} of the {s.neutronsAtFreezeOut} neutrons turned into protons during the wait, so only {s.neutronsAfterWait} are left: 1 neutron for every {n1(r.neutronsPerProtonAsOneIn)} protons.
          </>
        ),
        matters: <>The number of neutrons does not stay fixed: it shrinks while they wait. That is why the wait is one of the two settings you can change later.</>,
      },
      {
        look: <>The {t.waitEndS} s mark and the {n1(t.lifetimeS)} s mark on the ruler of time.</>,
        means: (
          <>
            The wait, {t.waitEndS} seconds, is about {Math.round(t.waitAsFractionOfLifetime * 100)} percent ({t.waitEndS} ÷ {n1(t.lifetimeS)} = {n2(t.waitAsFractionOfLifetime)}) of a free neutron’s average life.
          </>
        ),
        matters: <>A wait that is a small part of a neutron’s life leaves most of the neutrons in place, which is why only a few of the {s.neutronsAtFreezeOut} decayed and not most.</>,
      },
    )
  }
  return (
    <CaptionBlock
      title="Picture 1"
      intro={
        <>
          Picture 1 shows a sample of {s.total} protons and neutrons, standing for the mixture in the early universe. Part A is the mixture about {FREEZE_OUT_TIME_S} second after the start. From stage 2, Part B shows the same sample after the neutrons have waited, with a ruler of time.
        </>
      }
      bullets={[
        <>
          <strong>Each dot</strong> is one proton or one neutron. The sample is only {s.total} particles, a handful standing for a very large number, so that you can count them.
        </>,
        <>
          <strong>The orange dots</strong> are neutrons and <strong>the blue dots</strong> are protons. The colours only tell the two kinds apart.
        </>,
        <>
          <strong>The cyan frames</strong> mean the counts were calculated here. Because the sample has only whole particles, the counts are rounded.
        </>,
        ...(stage >= 2
          ? [
              <>
                <strong>A blue dot with an orange ring</strong> is a neutron that has decayed into a proton during the wait.
              </>,
              <>
                <strong>The ruler of time</strong> counts seconds from the start of the universe’s expansion. The cyan stretch is the wait, from {t.freezeOutS} second to {t.waitEndS} seconds (about three minutes). The orange mark is one average neutron lifetime, {n1(t.lifetimeS)} seconds. A neutron’s “average life” means that some
                last longer and some less.
              </>,
            ]
          : []),
      ]}
      worked={
        <>
          In Part A, {s.neutronsAtFreezeOut} of the {s.total} dots are neutrons, so {s.protonsAtFreezeOut} are protons. {s.protonsAtFreezeOut} ÷ {s.neutronsAtFreezeOut} = {n1(s.protonsAtFreezeOut / s.neutronsAtFreezeOut)}: about {n1(s.protonsAtFreezeOut / s.neutronsAtFreezeOut)} protons for each neutron. The exact ratio, before rounding to whole dots, is 1 in {ratioFrom}.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> the neutron and proton counts, from this page’s simplified model, which uses a freeze-out temperature of {FREEZE_OUT_KT_MEV} MeV that this page <em>chose</em> and did not measure. <strong>Imagined for the question:</strong> the dots and the grid, which are a sketch. <strong>Measured:</strong> nothing in this picture is a measurement. The times
          on the ruler come from a Berkeley Lab page and the neutron’s average life from a 2026 paper (read through a summary), and are described, not drawn from a new measurement.
        </>
      }
    />
  )
}

export function pictureTwoCaption(): ReactNode {
  const s = nucleonSample()
  const r = recipe()
  const rows = massRows()
  const a = atomRows()
  const lbt = HELIUM_OBSERVED_LBT
  const empress = HELIUM_OBSERVED_EMPRESS
  const twoTeamsGap = Math.abs(lbt.value - empress.value) * 100
  const lookFor: LookFor[] = [
    {
      look: <>The cyan dot (this page’s calculation) in Part B, beside the green dots and the dashed cyan one.</>,
      means: (
        <>
          This page’s calculation puts helium at {pct(rows[0].value)} of the weight. The two measured values are {pct(rows[1].value)} and {pct(rows[2].value)}, and a published calculation by others gives {pct(rows[3].value)}. All four sit within about 1 percentage point of one another, close to a quarter of the weight.
        </>
      ),
      matters: (
        <>
          The numbers are of the same size, so the simplified calculation lands near what is measured. The page does not call this a match, because one number in it was chosen, not measured.
        </>
      ),
    },
    {
      look: <>The two green dots, the LBT value and the EMPRESS value.</>,
      means: (
        <>
          Two measurements of the same thing give {pct(rows[1].value)} (± {n2(rows[1].giveOrTake)}) and {pct(rows[2].value)} (± {n2(rows[2].giveOrTake)}), which differ by {n2(twoTeamsGap)} percentage points (a percentage point is one step on a percent scale, so 24.6 to 24.0 is 0.6 points). The 2026 review paper says the two analyses differ in how they extend their results to a galaxy with no heavy elements at all, in how uniform their observations are, and in how they treat impossible values in the statistical fitting. It leaves a full comparison for later, so the page does not say which is right.
        </>
      ),
      matters: <>A measured number has a give-or-take and different methods can give different values. It is part of how sure the answer really is.</>,
    },
    {
      look: <>The white diamond for Prediction 1 in Part B, and the one for Prediction 2 in Part C.</>,
      means: (
        <>
          The white marks show your two guesses, on the same rulers as the real numbers. Each moves if you had chosen a different button. They are only your guesses.
        </>
      ),
      matters: <>You can see by eye how far your guess is from each real value. The page does not mark them right or wrong: the tutor does that after you have looked.</>,
    },
    {
      look: <>The cyan and green dots in Part C (a log ruler).</>,
      means: (
        <>
          Counting atoms, this page’s calculation gives {n1(a[0].value)} helium atoms for every 100 hydrogen atoms, and the measured share gives {n2(a[1].value)}. Both are far fewer than the helium’s share of the weight suggests, because a helium atom weighs {HELIUM_TO_HYDROGEN_WEIGHT} times as much as a hydrogen atom.
        </>
      ),
      matters: <>The same early universe can sound like “a quarter helium” or “fewer than one atom in ten”, depending on whether you weigh or count. Both are true.</>,
    },
  ]
  return (
    <CaptionBlock
      title="Picture 2"
      intro={
        <>
          Picture 2 has three parts. Part A sorts the sample of Picture 1 into helium and hydrogen. Part B is a ruler of the percent of the weight that is helium, with the page’s calculation, the measured values and your guess. Part C is a second ruler, counting atoms instead of weighing them.
        </>
      }
      bullets={[
        <>
          <strong>Part A</strong>: each block of four dots (2 orange, 2 blue) is one helium-4 nucleus: {s.heliumNuclei} of them. The single blue dots are hydrogen nuclei: {s.hydrogenNuclei} of them. {s.heliumDots} of the {s.total} particles are in helium.
        </>,
        <>
          <strong>Part B</strong>: a ruler from 0 to 100 percent of the weight. Each row is one number: the <strong>cyan dot</strong> is this page’s calculation, the <strong>dashed cyan dot</strong> is a calculation published by others, and the <strong>green dots</strong> are measured values. <strong>LBT</strong> is the measurement made with the Large Binocular Telescope (a 2026 paper by Aver and colleagues). <strong>EMPRESS</strong> is the EMPRESS collaboration’s measurement from Subaru telescope observations of galaxies with very few heavy elements (called very metal-poor galaxies), from a 2025 paper by Yanagisawa and colleagues; the value is the one in the paper’s abstract and is also quoted in a 2026 review paper (by Burns). A bar through a dot would show its give-or-take (the size of the doubt that the people who made the number put on it), but on this
          scale it is too thin to see.
        </>,
        <>
          <strong>Part C</strong>: a ruler in helium atoms for every 100 hydrogen atoms. It is a <em>log ruler</em>: each step of the same length multiplies the number by the same amount (here, from 1 to 3 to 10 to 30 to 100). This lets a small number and a large number sit on one ruler.
        </>,
        <>
          <strong>The white diamonds</strong> are always your guesses, each in its own row, with a box labelled YOUR GUESS joined to it by a line.
        </>,
      ]}
      worked={
        <>
          In Part A, {s.heliumNuclei} helium nuclei have {HELIUM_TO_HYDROGEN_WEIGHT} particles each, so {s.heliumNuclei} × {HELIUM_TO_HYDROGEN_WEIGHT} = {s.heliumDots} of the {s.total} particles are helium: {s.heliumDots} ÷ {s.total} = {n2(s.heliumDots / s.total)}, or {Math.round((s.heliumDots / s.total) * 100)} percent of the weight. Counting atoms instead,
          there are {s.heliumNuclei} helium atoms and {s.hydrogenNuclei} hydrogen atoms: {s.heliumNuclei} ÷ {s.hydrogenNuclei} × 100 = {n1((s.heliumNuclei / s.hydrogenNuclei) * 100)} helium atoms for every 100 hydrogen atoms (rounded; the exact figure is {n1(r.heliumAtomsPerHundredHydrogen)}).
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> the LBT value (Aver and colleagues, 2026) and the EMPRESS value (Yanagisawa and colleagues, 2025, as given in the paper’s abstract), and, from the LBT value, the atom count in Part C. <strong>Calculated by others:</strong> the dashed cyan row (the 2026 paper’s published calculation). <strong>Calculated here:</strong> the cyan rows and the counts in Part A, from a simplified model with a chosen freeze-out
          temperature of {FREEZE_OUT_KT_MEV} MeV (not a prediction) and the decay of neutrons over the wait. <strong>Imagined for the question:</strong> the dots and how they are grouped. <strong>Your guess:</strong> the white marks.
        </>
      }
    />
  )
}

export function pictureThreeCaption(stage: number): ReactNode {
  const [helium, deuterium, lithium] = ELEMENT_TESTS
  const dGap = gapBetween(deuterium.observed, deuterium.theory)
  const lGap = gapBetween(lithium.theory, lithium.observed)
  const ratio = predictionOverObservation(LITHIUM_THEORY_E10, LITHIUM_OBSERVED_E10)
  const ratio2013 = predictionOverObservation(LITHIUM_THEORY_E10_2013, LITHIUM_OBSERVED_E10_2013)
  const lookFor: LookFor[] = [
    {
      look: <>The dashed cyan bar and the green bars for helium.</>,
      means: (
        <>
          The published calculation, {n2(HELIUM_THEORY.value * 100)} ± {n2(HELIUM_THEORY.giveOrTake * 100)} percent, and the LBT measurement, {n2(helium.observed.value * 100)} ± {n2(helium.observed.giveOrTake * 100)}, {verdictWord(helium.observed, helium.theory)}: they differ by no more than their give-or-takes added. The EMPRESS measurement,{' '}
          {n2(HELIUM_OBSERVED_EMPRESS.value * 100)} ± {n2(HELIUM_OBSERVED_EMPRESS.giveOrTake * 100)}, and the calculation {verdictWord(HELIUM_OBSERVED_EMPRESS, HELIUM_THEORY)}.
        </>
      ),
      matters: <>Helium is a test with two measurements that do not quite agree with each other. The page shows both and does not choose between them.</>,
    },
    {
      look: <>The dashed cyan bar and the green bar for deuterium.</>,
      means: (
        <>
          The published calculation, {deuterium.theory.value} ± {deuterium.theory.giveOrTake}, and the measurement, {deuterium.observed.value} ± {deuterium.observed.giveOrTake}, {verdictWord(deuterium.observed, deuterium.theory)}: they differ by {dGap.difference.toFixed(3)}, which is no more than the
          give-or-takes added together, {dGap.combinedGiveOrTake.toFixed(3)}.
        </>
      ),
      matters: <>A second light element has been both calculated and measured and the two ranges overlap. Two elements agreeing is stronger evidence than one.</>,
    },
  ]
  if (stage >= 5) {
    lookFor.push({
      look: <>The lithium-7 bars, and the dashed gap between them.</>,
      means: (
        <>
          The published calculation, {lithium.theory.value} ± {lithium.theory.giveOrTake}, and the measurement, {lithium.observed.value} ± {lithium.observed.giveOrTake}, {verdictWord(lithium.theory, lithium.observed)}. They differ by {lGap.difference.toFixed(2)}, far more than the give-or-takes added together,{' '}
          {lGap.combinedGiveOrTake.toFixed(3)}. The calculation is {n1(ratio)} times the measurement (an older paper’s pair, {LITHIUM_THEORY_E10_2013.value} and {LITHIUM_OBSERVED_E10_2013.value}, gives {n1(ratio2013)}).
        </>
      ),
      matters: <>This is the one element where the numbers do not meet. It is why the status line calls lithium “Open”: the page does not say why, and nobody has yet settled it.</>,
    })
  }
  return (
    <CaptionBlock
      title="Picture 3"
      intro={
        <>
          Picture 3 has one small ruler for each light element, drawn one at a time as the run goes on. Each ruler shows the same two kinds of number: a calculation published by others and a measurement. It shows the numbers as quoted. The only things calculated here are the differences between them and one ratio.
        </>
      }
      bullets={[
        <>
          <strong>A dot with a bar</strong> is one number with its give-or-take. The dot is the value and the bar runs from the value minus the give-or-take to the value plus it. A longer bar means a less sure number.
        </>,
        <>
          <strong>The dashed cyan bar</strong> is a calculation published by others. <strong>The green bars</strong> are measurements. Helium has two green bars, because two teams’ values are shown: the Large Binocular Telescope’s (LBT) and the EMPRESS collaboration’s, the second from a 2025 paper by Yanagisawa and colleagues, as given in its abstract.
        </>,
        <>
          <strong>The units differ.</strong> Helium is a percent of the weight, as in Picture 2. For deuterium and lithium-7 the number is how many of that kind of atom there are for every hydrogen atom. “×10⁻⁵” means 0.00001 times the number shown, so 2.5 × 10⁻⁵ is about 2.5 atoms in every 100,000. “×10⁻¹⁰” means 0.0000000001 times the number shown.
        </>,
      ]}
      worked={
        <>
          For deuterium the measurement is {deuterium.observed.value} and the calculation is {deuterium.theory.value}. The difference is {deuterium.observed.value} − {deuterium.theory.value} = {dGap.difference.toFixed(3)}. The two give-or-takes added are {deuterium.observed.giveOrTake} + {deuterium.theory.giveOrTake} = {dGap.combinedGiveOrTake.toFixed(3)}. A difference smaller than that
          means the two bars overlap.
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Measured:</strong> the green values, as quoted in a 2026 paper (the helium values read from its text; the deuterium and lithium-7 values through a summary, so they are not verified). How each was measured is not shown here. <strong>Calculated by others:</strong> the dashed cyan values (the same paper; its older 2013 pair is mentioned in the lithium item). <strong>Calculated here:</strong> only the differences and the
          ratio. <strong>Imagined for the question:</strong> nothing.
        </>
      }
    />
  )
}

// ---- Drawing A: the learner's trial settings beside the real settings ----
const A_W = 760
const A_H = 470

function trialLabel(settings: RecipeSettings): string {
  const choice = MASS_DIFFERENCE_CHOICES.find((c) => c.factor === settings.massDifferenceFactor)
  return `a wait of ${settings.waitS} s and ${choice ? choice.label.toLowerCase() : 'a trial difference'}`
}

export function TrialDrawing({ settings }: { settings: RecipeSettings }) {
  const f = trialFigures(settings)
  const x0 = 250
  const x1 = 700
  const lin = (v: number, max: number) => x0 + (v / max) * (x1 - x0)
  const logLo = Math.log(TRIAL_AXIS_MIN_ATOMS)
  const logHi = Math.log(TRIAL_AXIS_MAX_ATOMS)
  const lg = (v: number) => x0 + ((Math.log(v) - logLo) / (logHi - logLo)) * (x1 - x0)
  const neutronMax = TRIAL_AXIS_MAX_NEUTRONS_PER_PROTON
  const realLabel = ['Real settings', `(${REAL_WAIT_S} s, the real difference)`]
  const trialLines = ['Your trial settings', `(${settings.waitS} s, ${n2(f.trial.massDifferenceMeV)} MeV)`]
  const Mark = ({ cx, cy, color }: { cx: number; cy: number; color: string }) => <circle cx={cx} cy={cy} r={6} fill={color} />
  const Val = ({ x, y, text }: { x: number; y: number; text: string }) => <SvgLines x={x + 12} y={y + 4} lines={[text]} fill={TEXT_COLOR} size={10} />
  return (
    <svg viewBox={`0 0 ${A_W} ${A_H}`} width="100%" style={svgStyle} role="img" aria-label="Drawing A: for your trial settings, the neutrons per proton after the wait, the helium share by mass and the helium atoms for every 100 hydrogen atoms, beside the real settings and the measured helium">
      <SvgLines x={20} y={22} lines={[`Your trial: ${trialLabel(settings)} (neutron minus proton: ${n2(f.trial.massDifferenceMeV)} MeV).`]} fill={PINK} size={12} bold />
      <SvgLines x={20} y={38} lines={[`The real settings: a wait of ${REAL_WAIT_S} s and ${n2(NEUTRON_PROTON_MASS_DIFFERENCE_MEV)} MeV. Cyan is calculated here, pink is imagined for the question, green is measured.`]} fill={MUTED_COLOR} size={10} />
      <SvgLines x={20} y={66} lines={['Neutrons per proton after the wait']} fill={TEXT_COLOR} size={12} bold />
      {[0, 0.1, 0.2, 0.3, 0.4].map((v) => (
        <g key={v}>
          <line x1={lin(v, neutronMax)} y1={76} x2={lin(v, neutronMax)} y2={142} stroke="#1e293b" />
          <SvgLines x={lin(v, neutronMax)} y={158} lines={[v.toFixed(1)]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={20} y={96} lines={realLabel} fill={TEXT_COLOR} size={10} />
      <Mark cx={lin(f.real.neutronsPerProton, neutronMax)} cy={92} color={CYAN} />
      <Val x={lin(f.real.neutronsPerProton, neutronMax)} y={92} text={n2(f.real.neutronsPerProton)} />
      <SvgLines x={20} y={124} lines={trialLines} fill={PINK} size={10} bold />
      <Mark cx={lin(f.trial.neutronsPerProton, neutronMax)} cy={120} color={PINK} />
      <Val x={lin(f.trial.neutronsPerProton, neutronMax)} y={120} text={n2(f.trial.neutronsPerProton)} />
      <line x1={20} y1={172} x2={A_W - 20} y2={172} stroke="#334155" />
      <SvgLines x={20} y={194} lines={['Helium by mass (percent of the total weight)']} fill={TEXT_COLOR} size={12} bold />
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={lin(v, 100)} y1={204} x2={lin(v, 100)} y2={282} stroke="#1e293b" />
          <SvgLines x={lin(v, 100)} y={298} lines={[`${v}%`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={20} y={224} lines={realLabel} fill={TEXT_COLOR} size={10} />
      <Mark cx={lin(f.realHeliumPercent, 100)} cy={220} color={CYAN} />
      <Val x={lin(f.realHeliumPercent, 100)} y={220} text={pct(f.realHeliumPercent)} />
      <SvgLines x={20} y={252} lines={trialLines} fill={PINK} size={10} bold />
      <Mark cx={lin(f.trialHeliumPercent, 100)} cy={248} color={PINK} />
      <Val x={lin(f.trialHeliumPercent, 100)} y={248} text={pct(f.trialHeliumPercent)} />
      <SvgLines x={20} y={280} lines={['Measured (the LBT value)']} fill={TEXT_COLOR} size={10} />
      <Mark cx={lin(f.measuredHeliumPercent, 100)} cy={276} color={GREEN} />
      <Val x={lin(f.measuredHeliumPercent, 100)} y={276} text={pct(f.measuredHeliumPercent)} />
      <line x1={20} y1={308} x2={A_W - 20} y2={308} stroke="#334155" />
      <SvgLines x={20} y={330} lines={['Helium atoms for every 100 hydrogen atoms (a log ruler)']} fill={TEXT_COLOR} size={12} bold />
      {[0.3, 1, 3, 10, 30, 100].map((v) => (
        <g key={v}>
          <line x1={lg(v)} y1={340} x2={lg(v)} y2={426} stroke="#1e293b" />
          <SvgLines x={lg(v)} y={442} lines={[`${v}`]} fill={MUTED_COLOR} size={10} anchor="middle" />
        </g>
      ))}
      <SvgLines x={20} y={360} lines={realLabel} fill={TEXT_COLOR} size={10} />
      <Mark cx={lg(f.real.heliumAtomsPerHundredHydrogen)} cy={356} color={CYAN} />
      <Val x={lg(f.real.heliumAtomsPerHundredHydrogen)} y={356} text={n1(f.real.heliumAtomsPerHundredHydrogen)} />
      <SvgLines x={20} y={388} lines={trialLines} fill={PINK} size={10} bold />
      <Mark cx={lg(f.trial.heliumAtomsPerHundredHydrogen)} cy={384} color={PINK} />
      <Val x={lg(f.trial.heliumAtomsPerHundredHydrogen)} y={384} text={n1(f.trial.heliumAtomsPerHundredHydrogen)} />
      <SvgLines x={20} y={416} lines={['Measured (the LBT value)']} fill={TEXT_COLOR} size={10} />
      <Mark cx={lg(f.measuredAtomsPerHundred)} cy={412} color={GREEN} />
      <Val x={lg(f.measuredAtomsPerHundred)} y={412} text={n2(f.measuredAtomsPerHundred)} />
    </svg>
  )
}

export function trialCaption(settings: RecipeSettings): ReactNode {
  const f = trialFigures(settings)
  const s = nucleonSample(settings)
  const real = f.real
  const trial = f.trial
  const lookFor: LookFor[] = [
    {
      look: <>The pink dot and the cyan dot on the first ruler, “Neutrons per proton after the wait”.</>,
      means: (
        <>
          Your trial leaves {n2(trial.neutronsPerProton)} neutrons per proton after the wait (1 in {n1(trial.neutronsPerProtonAsOneIn)}), which is {n2(f.neutronsTrialOverReal)} times the real settings’ {n2(real.neutronsPerProton)} (1 in {n1(real.neutronsPerProtonAsOneIn)}).
        </>
      ),
      matters: <>The neutrons are the stock that the helium is made from, so this is the first thing your two settings change. The other two rulers show what follows from it.</>,
    },
    {
      look: <>The pink, cyan and green dots on the second ruler, “Helium by mass”.</>,
      means: (
        <>
          Your trial gives {pct(f.trialHeliumPercent)} helium by weight, against {pct(f.realHeliumPercent)} for the real settings and {pct(f.measuredHeliumPercent)} measured. Your trial is {n2(Math.abs(f.heliumTrialMinusMeasuredPoints))} percentage points {f.heliumTrialMinusMeasuredPoints >= 0 ? 'above' : 'below'} the measured value.
        </>
      ),
      matters: (
        <>
          It shows how much the helium share depends on these two settings. The cyan dot itself comes from a freeze-out temperature that this page chose, so this drawing does not test the settings: it only shows how the calculation moves.
        </>
      ),
    },
    {
      look: <>The pink, cyan and green dots on the third ruler, “Helium atoms for every 100 hydrogen atoms”.</>,
      means: (
        <>
          Your trial gives {n1(trial.heliumAtomsPerHundredHydrogen)} helium atoms for every 100 hydrogen atoms, against {n1(real.heliumAtomsPerHundredHydrogen)} for the real settings and {n2(f.measuredAtomsPerHundred)} from the measured share.
        </>
      ),
      matters: <>Counting atoms gives a small number even when helium is a large share of the weight, so the same change looks different on this ruler. The log ruler lets small and large values sit together.</>,
    },
  ]
  return (
    <CaptionBlock
      title="Drawing A"
      intro={
        <>
          Drawing A follows the two settings you chose above. It has three rulers, one under another. Each shows the real settings from Part 1, your trial settings and, where there is one, the measured value. It is for trying things out, not a new picture of the real early universe.
        </>
      }
      bullets={[
        <>
          <strong>The cyan dot</strong> is the real settings (a wait of {REAL_WAIT_S} seconds, the real neutron–proton difference of {n2(NEUTRON_PROTON_MASS_DIFFERENCE_MEV)} MeV). They are the settings used in Part 1, so this dot never moves when you change a setting.
        </>,
        <>
          <strong>The pink dot</strong> is your trial settings, <em>imagined for the question</em>: the same calculation with the numbers you chose. It is not a measurement. When your settings are the real ones, the pink dot sits at the same place as the cyan one, in its own row.
        </>,
        <>
          <strong>The green dot</strong> is the measured helium (the LBT value), on the two rulers where a measurement exists. There is no measured value for neutrons per proton.
        </>,
        <>
          <strong>The rulers:</strong> the first counts neutrons for each proton (0.1 is 1 neutron for every 10 protons); the second is the percent of the weight that is helium; the third is a log ruler, where each step of the same length multiplies the number by the same amount.
        </>,
      ]}
      worked={
        <>
          For your trial, take a sample of {s.total} protons and neutrons. After the wait, {s.neutronsAfterWait} are neutrons. They pair up with {s.neutronsAfterWait} protons into {s.heliumNuclei} helium nuclei of {HELIUM_TO_HYDROGEN_WEIGHT} particles each, which is {s.heliumNuclei} × {HELIUM_TO_HYDROGEN_WEIGHT} = {s.heliumDots} of the {s.total} particles: {pct((s.heliumDots / s.total) * 100)} helium by weight in this rounded sample (the exact figure
          is {pct(f.trialHeliumPercent)}). The other {s.hydrogenNuclei} particles are hydrogen, so the atom count is {s.heliumNuclei} helium atoms for every {s.hydrogenNuclei} hydrogen atoms, about {n1((s.heliumNuclei / Math.max(s.hydrogenNuclei, 1)) * 100)} for every 100 (exactly {n1(trial.heliumAtomsPerHundredHydrogen)}).
        </>
      }
      lookFor={lookFor}
      whereFrom={
        <>
          <strong>Calculated here:</strong> the cyan dots, from this page’s simplified model with a freeze-out temperature of {FREEZE_OUT_KT_MEV} MeV that the page chose and did not measure. <strong>Imagined for the question:</strong> the pink dots, the same calculation with your trial settings. The real neutron–proton difference is fixed by nature; halving or doubling it, or changing the wait, describes an imagined
          universe, and nothing is claimed about the real one. <strong>Measured:</strong> the green dots, the LBT helium value (Aver and colleagues, 2026) turned into atoms by this page. Your guesses are not drawn here.
        </>
      }
    />
  )
}

