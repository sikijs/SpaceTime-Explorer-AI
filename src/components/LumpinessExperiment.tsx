import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  bandRelation,
  EARLY_MEASUREMENT,
  LATE_MEASUREMENTS,
  lumpinessCheckUp,
  MEASUREMENTS,
  paperSigma,
  PLANCK_OWN,
  runLumpiness,
  s8,
  shift,
  shiftGuessDirection,
  sigma8OnCurve,
  sigmaGuessBand,
  tensionSigma,
} from '../physics/lumpiness'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LumpinessTutor } from './LumpinessTutor'
import type { LumpinessResult, ShiftDirection, TensionRange } from '../physics/lumpiness'

// Cosmic Horizons, Experiment 3 (docs/experiments/cosmic-horizons/03-how-lumpy-is-the-universe.md).
// Step 2 built the status label, the introduction with its "Want to know more?" links, the weak-lensing drawing and Picture 1 (wording approved
// by the owner on 2026-10-19). Step 3 adds the two predictions, Run, the staged run, the survey measurements and gaps on Picture 1, and Pictures 2
// and 3 with their guides (wording approved by the owner on 2026-10-19). Step 4 adds the "Look closer at" control and the neutral results (shown
// after the run), the "Words and formulas" panel (the formulas appear after the run) and the links kept back until the results (draft wording for
// the owner's review, CLAUDE.md §28.1, written to the standard of §29). The tutor comes in a later step. The interface only displays numbers from src/physics/lumpiness.ts (CLAUDE.md §9); the only calculation here
// is where a point is drawn.

interface LumpinessExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

const VIEW_WIDTH = 560
const AXIS_MIN = 0.7
const AXIS_MAX = 0.88
const AXIS_LEFT = 40
const AXIS_RIGHT = 520
const TICKS = [0.7, 0.72, 0.74, 0.76, 0.78, 0.8, 0.82, 0.84, 0.86, 0.88]

const EARLY_COLOR = '#38bdf8' // sky blue: the microwave-background prediction
const LATE_COLOR = '#fb923c' // orange: a survey's measurement
const PALE_LATE_COLOR = '#fdba74' // paler orange: the other way of modelling the same DES result
const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14, "Predictions and the Real Results")
const TRIAL_COLOR = '#f472b6' // pink: the survey the learner chose to look closer at (Part 2)
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'

// The run's stages, in the order the learner sees them (the result does not depend on playback speed, CLAUDE.md §11).
const STAGE_MS = 2600
const STAGES = [
  'The microwave-background prediction (Picture 1)',
  'The surveys’ measurements (Picture 1)',
  'The gap in sigma (Picture 1)',
  'Why lensing measures a combination (Picture 2)',
  'How the values changed (Picture 3)',
]
const LAST_STAGE = STAGES.length

const SHIFT_CHOICES: Array<{ value: ShiftDirection; label: string }> = [
  { value: 'lower', label: 'Lower' },
  { value: 'same', label: 'About the same' },
  { value: 'higher', label: 'Higher' },
]
const RANGE_CHOICES: Array<{ value: TensionRange; label: string }> = [
  { value: 'under1', label: 'Within 1 sigma (it agrees)' },
  { value: 'oneToTwoAndAHalf', label: 'Between 1 and 2.5 sigma (partly)' },
  { value: 'over2AndAHalf', label: 'More than 2.5 sigma (clearly different)' },
]

// "Look closer at": the survey whose numbers the first results table shows and whose curve Picture 2 draws bold. DES Year 6 is two
// measurements, the main one (NLA) and the other way of modelling the same data (TATT).
const FOCUS_PRESETS: Array<{ label: string; names: string[] }> = [
  { label: 'KiDS-1000', names: ['KiDS-1000'] },
  { label: 'KiDS-Legacy', names: ['KiDS-Legacy'] },
  { label: 'DES Year 6', names: ['DES Y6 (NLA)', 'DES Y6 (TATT)'] },
]
const DEFAULT_FOCUS = 1

// Terms the introduction and the guides define, repeated in the "Words and formulas" panel with no new claims. The formulas are added after the run,
// because their worked examples use the learner's chosen survey (§12).
const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Lumpiness', meaning: 'how much the density of matter differs from place to place today: crowded in galaxies and clusters, thin in the empty spaces between them.' },
  { term: 'Weak lensing, or cosmic shear', meaning: 'the tiny stretching of the shapes of distant galaxies by the matter their light passes on the way to us. Averaged over millions of galaxies, the pattern of stretching maps the matter.' },
  { term: 'Ωm (said “omega-m”)', meaning: 'the share of the universe’s energy today that is matter, meaning ordinary matter plus dark matter. For example, 0.315 means about 31 percent matter.' },
  { term: 'σ₈ (said “sigma-eight”)', meaning: 'how big the ripples in the matter are today, measured in regions of one standard size. It is not the sigma that measures disagreement. A larger σ₈ means a lumpier universe.' },
  { term: 'S₈ (said “S-eight”)', meaning: 'one number that combines the two: S₈ = σ₈ × √(Ωm ÷ 0.3). Lensing measures mostly this combination. It has no units.' },
  { term: 'Curve of equal S₈', meaning: 'all the pairs of Ωm and σ₈ that give one value of S₈ (Picture 2). A lensing measurement fixes this curve, not a point on it.' },
  { term: 'The standard model', meaning: 'the model of the universe built in the Cosmology experiments, with ordinary matter, dark matter and dark energy.' },
  { term: 'The microwave background', meaning: 'the faint afterglow of the Big Bang, which reaches us from every direction in the sky (Cosmology Experiment 3).' },
  { term: 'Planck Legacy', meaning: `the European Space Agency’s Planck satellite mapped the microwave background, and “Legacy” means its final, most refined results (2018). From that map and the standard model, scientists predict the lumpiness today: S₈ = ${EARLY_MEASUREMENT.value} ± ${EARLY_MEASUREMENT.up}. It is a prediction, not a lensing measurement.` },
  { term: 'KiDS (the Kilo-Degree Survey)', meaning: 'a survey run with a telescope of the European Southern Observatory. It photographs a large patch of sky in nine colours to measure the shapes of galaxies for weak lensing. KiDS-1000 is the team’s first analysis (2020) and KiDS-Legacy its analysis of the complete survey (2025): the same survey, and KiDS-Legacy uses its complete data, with more sky and improved calibration and image processing.' },
  { term: 'Square degree', meaning: 'a patch of sky about five times the area of the full Moon. KiDS-Legacy covers 1,347 of them, about 3 percent of the whole sky.' },
  { term: 'DES (the Dark Energy Survey)', meaning: 'a different survey, with a different telescope, camera and team. Its Year 6 result (2026) uses six years of observing and about 140 million galaxies. It is shown twice, NLA and TATT: two ways of treating one nuisance effect in the analysis.' },
  { term: 'arXiv', meaning: 'the free website where scientists post their papers. Links to “arxiv.org” on this page lead to the original papers, which use technical words.' },
  { term: 'Calibration', meaning: 'checking a measuring tool against something whose true value is known, as you might check a kitchen scale with a 1-kilogram weight. For lensing, a hard part is calibrating how far away the lensed galaxies are.' },
  { term: 'Best value and error bar', meaning: 'every measurement is a best value plus a “give or take”. The error bar draws the “give or take” as a line either side of the dot. The surveys publish different upward and downward “give or takes”, so a bar can be longer on one side.' },
  { term: 'Gap and combined give-or-take', meaning: 'the gap is the difference between two best values. The combined give-or-take is the doubt about the gap, worked out from the two uncertainties, using for each the one on the side facing the other value.' },
  { term: 'Sigma and tension', meaning: 'sigma is the gap divided by the combined give-or-take: how many “give or takes” fit in the gap. About 1 is ordinary. A tension is a disagreement too big to put down to chance, a puzzle and not yet a discovery. 5 sigma is the usual bar in many sciences for calling a difference real.' },
  { term: 'The paper’s own sigma', meaning: 'the scientists’ own comparison with the microwave background, which uses fuller statistics (and, for DES, a combination of microwave-background data), so it can differ from the simple sigma worked out here. The results show both.' },
]

// Layout of Picture 1: one row for the microwave-background prediction and one for each survey.
const ROW_STEP = 68
const P1_PLANCK_Y = 70
const surveyY = (i: number) => P1_PLANCK_Y + 54 + ROW_STEP * i

// Layout of Picture 2: Omega_m along the bottom, sigma8 up the side; one curve of equal S8 for each measurement.
const P2_LEFT = 64
const P2_RIGHT = 384
const P2_TOP = 46
const P2_BOTTOM = 252
const OMEGA_AXIS_MIN = 0.2
const OMEGA_AXIS_MAX = 0.4
const SIGMA8_AXIS_MIN = 0.6
const SIGMA8_AXIS_MAX = 1.05
const OMEGA_TICKS = [0.2, 0.25, 0.3, 0.35, 0.4]
const SIGMA8_TICKS = [0.6, 0.7, 0.8, 0.9, 1.0]
const omegaX = (omega: number) => P2_LEFT + ((omega - OMEGA_AXIS_MIN) / (OMEGA_AXIS_MAX - OMEGA_AXIS_MIN)) * (P2_RIGHT - P2_LEFT)
const sigma8Y = (sigma8: number) => P2_BOTTOM - ((sigma8 - SIGMA8_AXIS_MIN) / (SIGMA8_AXIS_MAX - SIGMA8_AXIS_MIN)) * (P2_BOTTOM - P2_TOP)

// Layout of Picture 3: the year each paper was posted along the bottom, S8 up the side.
const P3_LEFT = 64
const P3_RIGHT = 520
const P3_TOP = 50
const P3_BOTTOM = 250
const YEAR_MIN = 2019
const YEAR_MAX = 2028
const S8_AXIS_MIN = 0.72
const S8_AXIS_MAX = 0.88
const YEAR_TICKS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027]
const S8_TICKS = [0.72, 0.76, 0.8, 0.84, 0.88]
const yearX = (year: number) => P3_LEFT + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (P3_RIGHT - P3_LEFT)
const s8Y = (value: number) => P3_BOTTOM - ((value - S8_AXIS_MIN) / (S8_AXIS_MAX - S8_AXIS_MIN)) * (P3_BOTTOM - P3_TOP)
// The four Parts of the page (CLAUDE.md §14, "The Page in Four Parts"): a thick coloured line, a coloured heading and a short lead.
function PartHeader({ color, title, children }: { color: string; title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `6px solid ${color}` }}>
      <h3 style={{ margin: '0 0 0.5rem', color }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
        <strong>What we are about to do.</strong> {children}
      </p>
    </div>
  )
}

// A paper's own sigma as written ("about 3", "2.0", "0.73"), from the module.
const paperText = (m: (typeof MEASUREMENTS)[number]) => {
  const p = paperSigma(m)
  return `${p.approximate ? 'about ' : ''}${p.value.toFixed(p.approximate ? 0 : Math.round(p.value * 100) % 10 === 0 ? 1 : 2)}`
}
const SHIFT_SHORT = { lower: 'lower', same: 'about the same', higher: 'higher' } as const
const RANGE_SHORT = { under1: 'within 1 sigma', oneToTwoAndAHalf: 'between 1 and 2.5 sigma', over2AndAHalf: 'more than 2.5 sigma' } as const
// Picture 1's "How many sigma?" panel (stage 3): its own scale, 0 to 3 sigma.
const SIGMA_PANEL_H = 200
const SIGMA_MAX = 3
const sigmaX = (sigma: number) => AXIS_LEFT + (sigma / SIGMA_MAX) * (AXIS_RIGHT - AXIS_LEFT)
// Drawing A, in Part 2: the survey the learner chose, beside the microwave-background value (S₈ line as in Picture 1, sigma bars on a 0 to 3 scale).
const DA_SIGMA_X0 = 200
const DA_SIGMA_X1 = 520
const daSigmaX = (sigma: number) => DA_SIGMA_X0 + (sigma / SIGMA_MAX) * (DA_SIGMA_X1 - DA_SIGMA_X0)
const signed3 = (value: number) => (value < 0 ? `−${Math.abs(value).toFixed(3)}` : `+${value.toFixed(3)}`)

const xOf = (value: number) => AXIS_LEFT + ((value - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * (AXIS_RIGHT - AXIS_LEFT)

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

// ---- The weak-lensing drawing (an illustration, not data) ----
// A seeded random-number generator, so the drawing is the same every time.
function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PANEL_W = 170
const PANEL_H = 128
const PANEL_TOP = 40
const PANEL_X = [10, 195, 380]
const BUMP = { x: 85, y: 43 } // at the corner where four patches of panel C meet
const SHEAR_STRENGTH = 0.3 // exaggerated, so that it can be seen: real stretching is far smaller
const SHEAR_REACH = 55

// The stretch of an image at (x, y) caused by a bump: along the circle round the bump, strongest near it (an ellipticity as two components).
function lensStretch(x: number, y: number): { e1: number; e2: number } {
  const dx = x - BUMP.x
  const dy = y - BUMP.y
  const r = Math.hypot(dx, dy)
  const g = SHEAR_STRENGTH * Math.exp(-r / SHEAR_REACH)
  const angle = Math.atan2(dy, dx)
  return { e1: -g * Math.cos(2 * angle), e2: -g * Math.sin(2 * angle) }
}

// An oval's shape as two numbers (e1, e2); its direction is half the angle of that pair, its flatness the length of the pair.
function ovalOf(e1: number, e2: number): { angleDegrees: number; flatness: number } {
  return { angleDegrees: (0.5 * Math.atan2(e2, e1) * 180) / Math.PI, flatness: Math.min(0.75, Math.hypot(e1, e2)) }
}

const GALAXIES = (() => {
  const rand = seeded(11)
  const out: Array<{ x: number; y: number; e1: number; e2: number }> = []
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) {
      const size = 0.1 + 0.4 * rand() // how oval it is by nature
      const direction = Math.PI * rand() // which way it points by nature
      out.push({ x: 22 + 26 * col, y: 13 + 26 * row, e1: size * Math.cos(2 * direction), e2: size * Math.sin(2 * direction) })
    }
  }
  return out
})()

const PATCH_COLS = 4
const PATCH_ROWS = 3
const PATCHES = (() => {
  const rand = seeded(23)
  const w = PANEL_W / PATCH_COLS
  const h = PANEL_H / PATCH_ROWS
  const out: Array<{ cx: number; cy: number; without: { e1: number; e2: number }; withBump: { e1: number; e2: number } }> = []
  for (let row = 0; row < PATCH_ROWS; row++) {
    for (let col = 0; col < PATCH_COLS; col++) {
      let sumNatural1 = 0
      let sumNatural2 = 0
      let sumLensed1 = 0
      let sumLensed2 = 0
      const count = 250
      for (let k = 0; k < count; k++) {
        const x = (col + rand()) * w
        const y = (row + rand()) * h
        const size = 0.1 + 0.4 * rand()
        const direction = Math.PI * rand()
        const n1 = size * Math.cos(2 * direction)
        const n2 = size * Math.sin(2 * direction)
        const stretch = lensStretch(x, y)
        sumNatural1 += n1
        sumNatural2 += n2
        sumLensed1 += n1 + stretch.e1
        sumLensed2 += n2 + stretch.e2
      }
      out.push({
        cx: (col + 0.5) * w,
        cy: (row + 0.5) * h,
        without: { e1: sumNatural1 / count, e2: sumNatural2 / count },
        withBump: { e1: sumLensed1 / count, e2: sumLensed2 / count },
      })
    }
  }
  return out
})()

function Oval({ x, y, e1, e2, color }: { x: number; y: number; e1: number; e2: number; color: string }) {
  const { angleDegrees, flatness } = ovalOf(e1, e2)
  const long = 10
  const short = (long * (1 - flatness)) / (1 + flatness)
  return <ellipse cx={x} cy={y} rx={long} ry={short} transform={`rotate(${angleDegrees.toFixed(1)} ${x} ${y})`} fill={color} opacity={0.9} />
}

// One average lean as a short line through the patch centre: its direction is the average direction, its length how strong the lean is.
function Tick({ cx, cy, e1, e2, color, width }: { cx: number; cy: number; e1: number; e2: number; color: string; width: number }) {
  const angle = 0.5 * Math.atan2(e2, e1)
  const length = Math.min(20, Math.hypot(e1, e2) * 150)
  const dx = (Math.cos(angle) * length) / 2
  const dy = (Math.sin(angle) * length) / 2
  return <line x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} stroke={color} strokeWidth={width} strokeLinecap="round" />
}

function LensingDrawing() {
  const galaxyColor = '#cbd5e1'
  const lensedColor = '#fb923c'
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <svg
        width={VIEW_WIDTH}
        height={226}
        viewBox={`0 0 ${VIEW_WIDTH} 226`}
        style={svgStyle}
        role="img"
        aria-label="Three panels: ovals pointing every which way; the same ovals seen through bumpy glass, slightly squashed round a bump; and the average lean of the ovals in each small patch"
      >
        <text x={10} y={20} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
          Drawing: from galaxy shapes to a map of matter (an illustration)
        </text>

        {/* Panel A: the ovals as they are */}
        <g transform={`translate(${PANEL_X[0]} ${PANEL_TOP})`}>
          <rect x={0} y={0} width={PANEL_W} height={PANEL_H} fill="none" stroke={MUTED_COLOR} strokeOpacity={0.5} />
          {GALAXIES.map((g, i) => (
            <Oval key={i} x={g.x} y={g.y} e1={g.e1} e2={g.e2} color={galaxyColor} />
          ))}
        </g>
        <text x={PANEL_X[0]} y={PANEL_TOP + PANEL_H + 16} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
          A: the ovals as they are
        </text>
        <text x={PANEL_X[0]} y={PANEL_TOP + PANEL_H + 30} fill={MUTED_COLOR} fontSize="10">
          every one points its own way
        </text>

        {/* Panel B: the same ovals through bumpy glass */}
        <g transform={`translate(${PANEL_X[1]} ${PANEL_TOP})`}>
          <rect x={0} y={0} width={PANEL_W} height={PANEL_H} fill="none" stroke={MUTED_COLOR} strokeOpacity={0.5} />
          {GALAXIES.map((g, i) => {
            const stretch = lensStretch(g.x, g.y)
            return <Oval key={i} x={g.x} y={g.y} e1={g.e1 + stretch.e1} e2={g.e2 + stretch.e2} color={lensedColor} />
          })}
          <circle cx={BUMP.x} cy={BUMP.y} r={7} fill="none" stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="3 2" />
        </g>
        <text x={PANEL_X[1]} y={PANEL_TOP + PANEL_H + 16} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
          B: through bumpy glass
        </text>
        <text x={PANEL_X[1]} y={PANEL_TOP + PANEL_H + 30} fill={MUTED_COLOR} fontSize="10">
          the same ovals, squashed a little
        </text>
        <text x={PANEL_X[1]} y={PANEL_TOP + PANEL_H + 43} fill={MUTED_COLOR} fontSize="10">
          dashed circle: the bump
        </text>

        {/* Panel C: average lean per patch */}
        <g transform={`translate(${PANEL_X[2]} ${PANEL_TOP})`}>
          <rect x={0} y={0} width={PANEL_W} height={PANEL_H} fill="none" stroke={MUTED_COLOR} strokeOpacity={0.5} />
          {[1, 2, 3].map((k) => (
            <line key={`v${k}`} x1={(PANEL_W / PATCH_COLS) * k} y1={0} x2={(PANEL_W / PATCH_COLS) * k} y2={PANEL_H} stroke={MUTED_COLOR} strokeOpacity={0.25} />
          ))}
          {[1, 2].map((k) => (
            <line key={`h${k}`} x1={0} y1={(PANEL_H / PATCH_ROWS) * k} x2={PANEL_W} y2={(PANEL_H / PATCH_ROWS) * k} stroke={MUTED_COLOR} strokeOpacity={0.25} />
          ))}
          <circle cx={BUMP.x} cy={BUMP.y} r={7} fill="none" stroke={TEXT_COLOR} strokeDasharray="3 2" />
          {PATCHES.map((p, i) => (
            <g key={i}>
              <Tick cx={p.cx} cy={p.cy} e1={p.without.e1} e2={p.without.e2} color={galaxyColor} width={2} />
              <Tick cx={p.cx} cy={p.cy} e1={p.withBump.e1} e2={p.withBump.e2} color={lensedColor} width={3} />
            </g>
          ))}
        </g>
        <text x={PANEL_X[2]} y={PANEL_TOP + PANEL_H + 16} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
          C: average lean per patch
        </text>
        <text x={PANEL_X[2]} y={PANEL_TOP + PANEL_H + 30} fill={MUTED_COLOR} fontSize="10">
          orange: with the bump
        </text>
        <text x={PANEL_X[2]} y={PANEL_TOP + PANEL_H + 43} fill={MUTED_COLOR} fontSize="10">
          grey: without it
        </text>
      </svg>

      {/* The drawing's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). */}
      <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <p style={paragraph}>
          <strong>How to read this drawing.</strong> It is an illustration of the idea, not real data, and the squashing is drawn much bigger than
          the real thing so that you can see it. It has three panels, from left to right, and they show the three stages of the ovals-under-glass
          comparison.
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Panel A, the light-grey ovals:</strong> 30 galaxies as they really are, each drawn as an oval. Some are nearly round, some
            more oval, and each points its own way. This is the page seen through flat glass, or the galaxies with no matter in the way.
          </li>
          <li>
            <strong>Panel B, the orange ovals:</strong> the very same 30 galaxies, in the very same places, seen through the bumpy glass. The
            dashed circle is the bump: a clump of matter. Each oval has been squashed a little along the direction that goes round the bump,
            and the closer to the bump, the more. Compare an orange oval with its grey twin in panel A: you can see a change in some of them, but
            for a single oval you could never be sure, because the natural differences between the ovals are about as big as the squashing.
          </li>
          <li>
            <strong>Panel C, the short lines:</strong> the panel is cut into twelve patches. In each patch we averaged the shapes of{' '}
            <strong>250 galaxies</strong> (many more than panel B can show) and drew the average lean as a short line. The line points the way
            the average oval leans, and a longer line means a stronger lean. <strong>The grey lines</strong> are the average without the bump:
            they are tiny, because the natural leanings cancel out. <strong>The orange lines</strong> are the average with the bump: they are
            longer, and they run round the bump, like the rungs of a ring, strongest in the patches nearest it.
          </li>
        </ul>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What to look for.</strong> Here are three things to look at, what each one means, and why it matters.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>Look at</strong> the jump from panel B to panel C. <strong>What it means:</strong> in B the lean is hidden in the crowd of ovals. In C, averaging 250 galaxies in
            each patch makes it clear. <strong>Why it matters:</strong> this averaging is the whole trick of weak lensing.
          </li>
          <li>
            <strong>Look at</strong> the orange lines going round the bump. <strong>What it means:</strong> they run round the bump like the rungs of a ring. <strong>Why it matters:</strong> a
            pattern going round a spot tells you there is matter there, though nothing is visible.
          </li>
          <li>
            <strong>Look at</strong> the grey lines. <strong>What it means:</strong> they are almost points. <strong>Why it matters:</strong> with no matter in the way, the average has no
            direction, so a lean that does show up can be trusted as a signal.
          </li>
        </ul>
      </div>
    </div>
  )
}

// ---- Picture 2: why lensing measures a combination (stage 4) ----
function Picture2({ result, highlight }: { result: LumpinessResult; highlight: string[] }) {
  const early = result.early
  const planckOwn = result.planckOwnPoint
  const colorOf = (name: string) => (name === early.name ? EARLY_COLOR : name === 'DES Y6 (TATT)' ? PALE_LATE_COLOR : LATE_COLOR)
  // Labels in a column to the right of the plot, in the order of the curves' right-hand ends, kept at least 14 units apart.
  const ends = result.curves
    .map((c) => ({ c, endY: sigma8Y(c.points[c.points.length - 1].sigma8) }))
    .sort((a, b) => a.endY - b.endY)
  let previous = -Infinity
  const placed = ends.map((e) => {
    const labelY = Math.max(e.endY, previous + 14)
    previous = labelY
    return { ...e, labelY }
  })
  const markerX = omegaX(planckOwn.omegaMatter)
  const markerY = sigma8Y(planckOwn.sigma8)

  return (
    <div style={{ marginTop: '2rem' }}>
      <svg
        width={VIEW_WIDTH}
        height={330}
        viewBox={`0 0 ${VIEW_WIDTH} 330`}
        style={svgStyle}
        role="img"
        aria-label="Curves of equal S8 in the plane of the matter fraction and sigma8, for the microwave background and each survey"
      >
        <text x={P2_LEFT - 24} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
          Picture 2: why lensing measures a combination
        </text>

        {/* Axes and grid */}
        {SIGMA8_TICKS.map((t) => (
          <g key={t}>
            <line x1={P2_LEFT} y1={sigma8Y(t)} x2={P2_RIGHT} y2={sigma8Y(t)} stroke={MUTED_COLOR} strokeOpacity={0.25} />
            <text x={P2_LEFT - 6} y={sigma8Y(t) + 4} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        <line x1={P2_LEFT} y1={P2_BOTTOM} x2={P2_RIGHT} y2={P2_BOTTOM} stroke={MUTED_COLOR} strokeWidth={1.5} />
        {OMEGA_TICKS.map((t) => (
          <g key={t}>
            <line x1={omegaX(t)} y1={P2_BOTTOM - 4} x2={omegaX(t)} y2={P2_BOTTOM + 4} stroke={MUTED_COLOR} />
            <text x={omegaX(t)} y={P2_BOTTOM + 17} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
              {t.toFixed(2)}
            </text>
          </g>
        ))}
        <text x={(P2_LEFT + P2_RIGHT) / 2} y={P2_BOTTOM + 36} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
          Ωm: how much of the universe is matter
        </text>
        <text x={16} y={(P2_TOP + P2_BOTTOM) / 2} fill={TEXT_COLOR} fontSize="12" textAnchor="middle" transform={`rotate(-90 16 ${(P2_TOP + P2_BOTTOM) / 2})`}>
          σ₈: how big the ripples are
        </text>

        {/* The line where Ωm = 0.3, on which σ8 equals S8 */}
        <line x1={omegaX(0.3)} y1={P2_TOP} x2={omegaX(0.3)} y2={P2_BOTTOM} stroke={TEXT_COLOR} strokeOpacity={0.5} strokeDasharray="5 4" />
        <text x={omegaX(0.3) + 4} y={P2_TOP + 10} fill={MUTED_COLOR} fontSize="9">
          Ωm = 0.3: σ₈ equals S₈
        </text>

        {/* One curve of equal S8 for each measurement */}
        {result.curves
          .filter((c) => highlight.includes(c.measurement.name))
          .map((c) => (
            <polyline
              key={`glow-${c.measurement.name}`}
              points={c.points.map((pt) => `${omegaX(pt.omegaMatter).toFixed(1)},${sigma8Y(pt.sigma8).toFixed(1)}`).join(' ')}
              fill="none"
              stroke={TRIAL_COLOR}
              strokeWidth={13}
              strokeOpacity={0.55}
              strokeLinecap="round"
            />
          ))}
        {result.curves.map((c) => (
          <polyline
            key={c.measurement.name}
            points={c.points.map((pt) => `${omegaX(pt.omegaMatter).toFixed(1)},${sigma8Y(pt.sigma8).toFixed(1)}`).join(' ')}
            fill="none"
            stroke={colorOf(c.measurement.name)}
            strokeWidth={highlight.includes(c.measurement.name) ? 5 : c.measurement.name === early.name ? 3 : 2.5}
            opacity={highlight.length > 0 && !highlight.includes(c.measurement.name) && c.measurement.name !== early.name ? 0.55 : 1}
          />
        ))}
        {placed.map(({ c, endY, labelY }) => (
          <g key={c.measurement.name}>
            <line x1={P2_RIGHT} y1={endY} x2={P2_RIGHT + 10} y2={labelY} stroke={colorOf(c.measurement.name)} strokeWidth={1} />
            <text x={P2_RIGHT + 14} y={labelY + 4} fill={colorOf(c.measurement.name)} fontSize="11" fontWeight={highlight.includes(c.measurement.name) ? 'bold' : 'normal'}>
              {c.measurement.name === early.name ? 'Planck Legacy' : c.measurement.name} ({c.measurement.value})
            </text>
          </g>
        ))}

        {/* Planck's own point: its own sigma8 and Omega_m, which make an S8 close to the value used */}
        <line x1={markerX} y1={markerY + 5} x2={markerX} y2={P2_BOTTOM - 52} stroke={TEXT_COLOR} strokeOpacity={0.6} />
        <circle cx={markerX} cy={markerY} r={5} fill={TEXT_COLOR} stroke={EARLY_COLOR} strokeWidth={2} />
        <text x={markerX} y={P2_BOTTOM - 40} fill={TEXT_COLOR} fontSize="10" textAnchor="middle">
          Planck’s own σ₈ and Ωm
        </text>
        <text x={markerX} y={P2_BOTTOM - 27} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
          ({planckOwn.sigma8}, {planckOwn.omegaMatter}): S₈ = {planckOwn.s8.toFixed(3)}
        </text>

        <text x={P2_LEFT - 24} y={316} fill={MUTED_COLOR} fontSize="10">
          each curve: every pair (Ωm, σ₈) that gives one value of S₈
        </text>
      </svg>

      {/* Picture 2's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). */}
      <div style={{ marginTop: '1rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <p style={paragraph}>
          <strong>How to read this diagram.</strong> S₈ is built from two things, how much of the universe is matter (Ωm) and how big the ripples
          in it are (σ₈). This picture shows what that means: lensing measures the combination S₈, but it does not tell the two ingredients apart.
          Each curve answers the question “which pairs of Ωm and σ₈ would give this value of S₈?”
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The bottom line (0.20 to 0.40)</strong> is Ωm, the share of the universe’s energy that is matter. <strong>The side line (0.6 to
            1.0)</strong> is σ₈, how big the ripples in the matter are today. A point in the picture is a pair of values, one on each line.
          </li>
          <li>
            <strong>Each curve</strong> is all the pairs (Ωm, σ₈) that give <em>one</em> value of S₈. The sky-blue curve is the microwave
            background’s value, {early.value}. The orange curves are the surveys’ values (the paler one is the second way of treating DES’s
            nuisance effect). Each is labelled at its right-hand end with its name and its S₈. The curves slope downward: if there is more matter,
            the ripples must be smaller to give the same S₈.
          </li>
          <li>
            <strong>The dashed upright line at Ωm = 0.3</strong> is where the formula S₈ = σ₈ × √(Ωm ÷ 0.3) has √(0.3 ÷ 0.3) = 1, so σ₈ equals
            S₈. Every curve crosses it at its own S₈, and that is why 0.3 appears in the formula.
          </li>
          <li>
            <strong>The pale dot</strong> is the microwave background’s own pair: σ₈ = {planckOwn.sigma8} and Ωm = {planckOwn.omegaMatter}, which make S₈ ={' '}
            {planckOwn.s8.toFixed(3)}. It lies almost exactly on the sky-blue curve for {early.value}. (The two numbers differ in the third
            decimal because different analyses of the same data differ slightly.)
          </li>
        </ul>
        <p style={paragraph}>
          <strong>A worked moment, with real numbers.</strong> Take the sky-blue curve, S₈ = {early.value}. At Ωm = 0.25, σ₈ must be {early.value} ÷
          √(0.25 ÷ 0.3) = {early.value} ÷ 0.9129 = {(early.value / Math.sqrt(0.25 / 0.3)).toFixed(3)}. At Ωm = 0.35 it must be {early.value} ÷ √(0.35 ÷ 0.3) ={' '}
          {early.value} ÷ 1.0801 = {(early.value / Math.sqrt(0.35 / 0.3)).toFixed(3)}. Both pairs give the same S₈, which is why a lensing measurement cannot say which pair is
          true. It fixes the curve, not a point on it.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What to look for.</strong> Here are {highlight.length > 0 ? 'three' : 'two'} things to look at, what each one means, and why it matters.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>Look at</strong> how close the curves are to each other. <strong>What it means:</strong> a difference of a few hundredths in S₈ moves a whole curve only a little. The
            curves are about as far apart as the gaps you saw in Picture 1. <strong>Why it matters:</strong> it shows why small differences in S₈ matter.
          </li>
          <li>
            <strong>Look at</strong> the order of the curves. <strong>What it means:</strong> a lower S₈ is a lower curve at every Ωm. <strong>Why it matters:</strong> “this survey is lower”
            does not depend on which Ωm you pick, and lensing compares S₈, the same thing in every survey.
          </li>
          {highlight.length > 0 && (
            <li>
              <strong>Look at</strong> the pink glow. <strong>What it means:</strong> it is on the curve of the survey you chose in Part 2 ({highlight.join(' and ')}). <strong>Why it matters:</strong>{' '}
              it keeps the survey you chose to look at apart from your guesses, which are not drawn in this picture.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}

// ---- Picture 3: how the values changed (stage 5) ----
function Picture3({ shiftPrediction }: { shiftPrediction: ShiftDirection | null }) {
  const early = EARLY_MEASUREMENT
  const kids1000 = MEASUREMENTS.find((m) => m.name === 'KiDS-1000')!
  const kidsLegacy = MEASUREMENTS.find((m) => m.name === 'KiDS-Legacy')!
  const desNla = MEASUREMENTS.find((m) => m.name === 'DES Y6 (NLA)')!
  const desTatt = MEASUREMENTS.find((m) => m.name === 'DES Y6 (TATT)')!
  const kidsShiftValue = shift(kids1000, kidsLegacy)
  const point = (m: (typeof MEASUREMENTS)[number], x: number, color: string) => (
    <g>
      <line x1={x} y1={s8Y(m.value + m.up)} x2={x} y2={s8Y(m.value - m.down)} stroke={color} strokeWidth={3} />
      <line x1={x - 5} y1={s8Y(m.value + m.up)} x2={x + 5} y2={s8Y(m.value + m.up)} stroke={color} strokeWidth={2} />
      <line x1={x - 5} y1={s8Y(m.value - m.down)} x2={x + 5} y2={s8Y(m.value - m.down)} stroke={color} strokeWidth={2} />
      <circle cx={x} cy={s8Y(m.value)} r={5} fill={color} />
    </g>
  )
  const xKids1000 = yearX(kids1000.year)
  const xKidsLegacy = yearX(kidsLegacy.year)
  const xNla = yearX(desNla.year) - 12
  const xTatt = yearX(desTatt.year) + 12

  return (
    <div style={{ marginTop: '2rem' }}>
      <svg
        width={VIEW_WIDTH}
        height={330}
        viewBox={`0 0 ${VIEW_WIDTH} 330`}
        style={svgStyle}
        role="img"
        aria-label="S8 against the year each paper was posted: the microwave-background band and the KiDS and DES measurements"
      >
        <text x={P3_LEFT - 24} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
          Picture 3: how the values changed over time
        </text>

        {/* Axes */}
        {S8_TICKS.map((t) => (
          <g key={t}>
            <line x1={P3_LEFT} y1={s8Y(t)} x2={P3_RIGHT} y2={s8Y(t)} stroke={MUTED_COLOR} strokeOpacity={0.25} />
            <text x={P3_LEFT - 6} y={s8Y(t) + 4} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
              {t.toFixed(2)}
            </text>
          </g>
        ))}
        <line x1={P3_LEFT} y1={P3_BOTTOM} x2={P3_RIGHT} y2={P3_BOTTOM} stroke={MUTED_COLOR} strokeWidth={1.5} />
        {YEAR_TICKS.map((t) => (
          <g key={t}>
            <line x1={yearX(t)} y1={P3_BOTTOM - 4} x2={yearX(t)} y2={P3_BOTTOM + 4} stroke={MUTED_COLOR} />
            <text x={yearX(t)} y={P3_BOTTOM + 17} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
              {t}
            </text>
          </g>
        ))}
        <text x={(P3_LEFT + P3_RIGHT) / 2} y={P3_BOTTOM + 36} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
          The year the paper was posted on arXiv
        </text>
        <text x={16} y={(P3_TOP + P3_BOTTOM) / 2} fill={TEXT_COLOR} fontSize="12" textAnchor="middle" transform={`rotate(-90 16 ${(P3_TOP + P3_BOTTOM) / 2})`}>
          S₈ (how lumpy)
        </text>

        {/* The microwave-background band: the prediction and its give-or-take */}
        <rect x={P3_LEFT} y={s8Y(early.value + early.up)} width={P3_RIGHT - P3_LEFT} height={s8Y(early.value - early.down) - s8Y(early.value + early.up)} fill={EARLY_COLOR} opacity={0.18} />
        <line x1={P3_LEFT} y1={s8Y(early.value)} x2={P3_RIGHT} y2={s8Y(early.value)} stroke={EARLY_COLOR} strokeWidth={1.5} strokeDasharray="6 4" />
        <text x={P3_LEFT + 4} y={s8Y(early.value + early.up) - 5} fill={EARLY_COLOR} fontSize="11">
          Planck Legacy: {early.value} ± {early.up} (the band)
        </text>

        {/* The surveys, with the KiDS shift as an arrow */}
        <line x1={xKids1000 + 8} y1={s8Y(kids1000.value) - 2} x2={xKidsLegacy - 8} y2={s8Y(kidsLegacy.value) + 2} stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="5 3" markerEnd="url(#lumpiness-arrow)" />
        <defs>
          <marker id="lumpiness-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill={TEXT_COLOR} />
          </marker>
        </defs>
        <text x={(xKids1000 + xKidsLegacy) / 2} y={(s8Y(kids1000.value) + s8Y(kidsLegacy.value)) / 2 - 12} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
          KiDS: {signed3(kidsShiftValue)}
        </text>
        {point(kids1000, xKids1000, LATE_COLOR)}
        {point(kidsLegacy, xKidsLegacy, LATE_COLOR)}
        {point(desNla, xNla, LATE_COLOR)}
        {point(desTatt, xTatt, PALE_LATE_COLOR)}
        <text x={xKids1000 + 10} y={s8Y(kids1000.value) + 18} fill={LATE_COLOR} fontSize="11">
          KiDS-1000: {kids1000.value}
        </text>
        {shiftPrediction !== null &&
          (() => {
            // Your guess for Prediction 1: only a direction (up for higher, down for lower, a short tick for about the same). Its length means nothing.
            const direction = shiftGuessDirection(shiftPrediction)
            const ax = xKids1000 - 28
            const ay = s8Y(kids1000.value)
            return (
              <g>
                {direction === 0 ? (
                  <line x1={ax - 9} y1={ay} x2={ax + 9} y2={ay} stroke={GUESS_COLOR} strokeWidth={4} />
                ) : (
                  <>
                    <line x1={ax} y1={ay} x2={ax} y2={ay - direction * 22} stroke={GUESS_COLOR} strokeWidth={4} />
                    <polygon points={`${ax},${ay - direction * 32} ${ax - 7},${ay - direction * 18} ${ax + 7},${ay - direction * 18}`} fill={GUESS_COLOR} />
                  </>
                )}
                <line x1={ax} y1={ay + (direction === 1 ? 0 : direction === -1 ? 34 : 6)} x2={ax} y2={298} stroke={GUESS_COLOR} strokeWidth={2} />
                <rect x={ax - 56} y={298} width={160} height={26} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
                <text x={ax + 24} y={316} fill={GUESS_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
                  YOUR GUESS: {SHIFT_SHORT[shiftPrediction]}
                </text>
              </g>
            )
          })()}
        <text x={xKidsLegacy} y={s8Y(early.value + early.up) - 5} fill={LATE_COLOR} fontSize="11" textAnchor="middle">
          KiDS-Legacy: {kidsLegacy.value}
        </text>
        <text x={xNla - 8} y={s8Y(desNla.value) + 18} fill={LATE_COLOR} fontSize="11" textAnchor="end">
          DES Y6 (NLA): {desNla.value}
        </text>
        <text x={xTatt + 8} y={s8Y(desTatt.value) + 30} fill={PALE_LATE_COLOR} fontSize="11" textAnchor="end">
          DES Y6 (TATT): {desTatt.value}
        </text>
      </svg>

      {/* Picture 3's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). */}
      <div style={{ marginTop: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <p style={paragraph}>
          <strong>How to read this diagram.</strong> Picture 1 compared the measurements side by side. This picture adds <em>time</em>: when each
          result was published, so that you can see how the values changed as the surveys improved. The side line is S₈, as in Picture 1, now
          running up the page, so a higher dot means a lumpier universe.
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The bottom line</strong> is the year each paper was posted on arXiv, the free site where scientists post their papers. It is not
            always the year of the journal version.
          </li>
          <li>
            <strong>The sky-blue band and dashed line:</strong> the microwave-background prediction, {early.value} ± {early.up}. The dashed line is
            the best value and the shaded band is its “give or take”. It runs across all the years because it is one value, not a series.
          </li>
          <li>
            <strong>The orange dots and upright bars:</strong> the survey measurements, each at the year its paper was posted. The bar runs from
            the lowest to the highest value that measurement allows, so it can be longer above the dot than below. The paler dot is the second way
            of treating DES’s nuisance effect.
          </li>
          <li>
            <strong>The dashed arrow between the two KiDS dots</strong> goes from KiDS’s first full analysis to its re-analysis. The words on it
            give how much S₈ changed: {signed3(kidsShiftValue)}. A plus sign means higher.
          </li>
          <li>
            <strong>The white arrow and the YOUR GUESS box</strong> (left of the KiDS-1000 dot): your guess for Prediction 1. Up means you guessed that KiDS’s S₈ came out higher, down means lower, and a
            short tick means about the same. It is only a marker: its length means nothing, and it is not a result.
          </li>
        </ul>
        <p style={paragraph}>
          <strong>A worked moment, with real numbers.</strong> The arrow’s number is the difference of the two dots: {kidsLegacy.value} −{' '}
          {kids1000.value} = {signed3(kidsShiftValue)}. For comparison, the band’s “give or take” is {early.up}, so the KiDS change is about{' '}
          {(Math.abs(kidsShiftValue) / early.up).toFixed(1)} times the width of the band on one side.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What to look for.</strong> Here are three things to look at, what each one means, and why it matters.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>Look at</strong> where each dot sits compared with the band. <strong>What it means:</strong>{' '}
            {[kids1000, kidsLegacy, desNla, desTatt]
              .map((m) => {
                const r = bandRelation(m)
                return `${m.name} is ${r.dot} it${r.barReachesBand ? ', and its bar reaches into it' : ''}`
              })
              .join('; ')}
            . <strong>Why it matters:</strong> a dot inside the band agrees with the prediction within its “give or take”. A dot below it says the universe is smoother than predicted.
          </li>
          <li>
            <strong>Look at</strong> what the arrow did to the KiDS dot, and at the white arrow beside it. <strong>What it means:</strong> the KiDS dot moved by {signed3(kidsShiftValue)}, about{' '}
            {(Math.abs(kidsShiftValue) / early.up).toFixed(1)} times the band’s width on one side. The white arrow is your guess for that move. <strong>Why it matters:</strong> this is how a tension
            can change when a measurement is improved.
          </li>
          <li>
            <strong>Look at</strong> whether the other survey followed. <strong>What it means:</strong> the two DES dots, the newest, sit at {desNla.value} and {desTatt.value}.{' '}
            <strong>Why it matters:</strong> if every survey moved the same way, a single cause would be the natural suspect. If they did not, something specific to each survey may be at work.
          </li>
        </ul>
        <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
          <strong>What the picture cannot tell you:</strong> which survey is right, or why a value changed. It only shows the numbers the papers published.
        </p>
        <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
          <strong>Where the real picture comes from.</strong> <em>Measured:</em> every S₈ value and error bar, by the Planck, KiDS and DES teams, and the year each paper was posted.{' '}
          <em>Calculated here:</em> the change between the two KiDS dots. <em>Imagined for the question:</em> nothing. The white arrow is your guess.
        </p>
      </div>
    </div>
  )
}

export function LumpinessExperiment({ onComplete, onTutorComplete }: LumpinessExperimentProps) {
  const early = EARLY_MEASUREMENT
  const planckFromParts = s8(PLANCK_OWN.sigma8, PLANCK_OWN.omegaMatter)
  const [shiftPrediction, setShiftPrediction] = useState<ShiftDirection | null>(null)
  const [rangePrediction, setRangePrediction] = useState<TensionRange | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const [focusIndex, setFocusIndex] = useState(DEFAULT_FOCUS)

  // The numbers all come from the physics module. Which survey is "looked at" comes in a later step, so any survey does for the curves.
  const focusNames = FOCUS_PRESETS[focusIndex].names
  const focusMeasurements = focusNames.map((n) => MEASUREMENTS.find((m) => m.name === n)!)
  const results = focusMeasurements.map((m) => runLumpiness(m))
  const result = results[0]
  const sign3 = (value: number) => (value < 0 ? `−${Math.abs(value).toFixed(3)}` : `+${value.toFixed(3)}`)
  const kidsChange = shift(MEASUREMENTS.find((m) => m.name === 'KiDS-1000')!, MEASUREMENTS.find((m) => m.name === 'KiDS-Legacy')!)
  const bothPredicted = shiftPrediction !== null && rangePrediction !== null
  const kids1000 = MEASUREMENTS.find((m) => m.name === 'KiDS-1000')!
  const fixedGap = (m: (typeof MEASUREMENTS)[number]) => (result.early.value - m.value).toFixed(3)
  const checkUp = lumpinessCheckUp()

  // Presentation only: advances one stage at a time. The result does not depend on this timer.
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) {
        setStage(stage + 1)
      } else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  const startOver = () => {
    setShiftPrediction(null)
    setRangePrediction(null)
    setStatus('idle')
    setStage(0)
    setFocusIndex(DEFAULT_FOCUS)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }
  const axisY = surveyY(LATE_MEASUREMENTS.length - 1) + 50
  const planckY = P1_PLANCK_Y
  const p1Height = axisY + 52
  const p1Total = stage >= 3 ? p1Height + SIGMA_PANEL_H : p1Height

  return (
    <div>
      <h2>Experiment 3 — How Lumpy Is the Universe? A Tension That Went Away, in One Survey</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>Where this stands (as of October 2026): Contested.</strong> The measurements below are real and published. Whether they agree is
          not settled.
        </p>

        {/* Introduction: draft wording for the owner's review (CLAUDE.md §28.1), written to the standard of CLAUDE.md §29 (up to date, clear,
            detailed, simple terms, everyday examples, links for further reading). It does not say what the KiDS team found in 2025, that its
            value rose, or what the Dark Energy Survey found in 2026 (that is what the predictions ask, §12). */}
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> How lumpy is the universe today, and do the different ways of measuring that lumpiness agree?
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Cosmology Experiment 9 we saw how tiny ripples in the early universe were pulled by gravity into
            galaxies and clusters. Think of a field after a snowfall. At first the snow is smooth. Then wind and time pile it into drifts and leave
            other patches bare. How <strong>lumpy</strong> the snow is means how much the drifts differ from the bare patches. The matter in the
            universe is lumpy in the same way: crowded in some places (galaxies, clusters) and thin in others (the great empty spaces between them).
          </p>

          <p style={paragraph}>
            <strong>Why anyone asks.</strong> The standard model of the universe starts from the cosmic microwave background, the afterglow of the Big
            Bang (Cosmology Experiment 3), and predicts how lumpy matter should be today. So lumpiness is a check on the model: if the real universe
            turned out smoother or lumpier than predicted, the model would be missing something. This is the same kind of check as in Experiment 1
            of this group, where two ways of measuring the expansion rate were compared. Here the two ways of measuring are the microwave
            background and the lensing of galaxy light.
          </p>

          <p style={paragraph}>
            <strong>How lumpiness is measured: weak lensing.</strong> Matter bends light (Cosmology Experiment 7). Far from any single cluster the
            bending is tiny, but the light of every distant galaxy has passed through a great deal of matter on its way to us. The result is that
            each galaxy’s image is stretched by a very small amount, in a direction set by the matter it passed. This is called{' '}
            <strong>weak lensing</strong>, or <strong>cosmic shear</strong>. The problem is that we cannot see the stretching in any one galaxy.
            The next steps explain why, and how astronomers get round it.
          </p>
          <p style={paragraph}>
            <strong>Step 1: galaxies come in all shapes.</strong> Some galaxies look round, some oval, and they point in every direction. Nothing in
            the sky makes oval galaxies point one way more than another. So if you pick one galaxy that looks slightly stretched, you cannot tell
            whether lensing stretched it or whether it was simply oval to begin with. The stretching from lensing is much smaller than the natural
            differences between one galaxy and the next.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Step 2: a comparison with ovals under glass.</strong> Imagine a printed page covered in thousands of small ovals, pointing every
            which way.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              Look at the page through <strong>flat, clear glass</strong>. You see the ovals as they are. They still point every which way.
            </li>
            <li>
              Now look through glass with <strong>slight bumps</strong>. Each oval near a bump is squashed a tiny bit more along one direction,
              which depends on how that part of the glass slopes. The squashing is tiny compared with how oval the ovals already were. You cannot
              tell, from any single oval, whether it has been squashed.
            </li>
            <li>
              Now look at <strong>one small patch of the glass</strong>, with hundreds of ovals under it. Their natural leanings are random, so
              they cancel out when you average them: as many lean left as right. But the squashing from the bump is <em>the same way for all of
              them</em>, so it does not cancel. It adds up. So the <strong>average</strong> shape of the ovals in that patch leans a little in one
              direction.
            </li>
            <li>
              Do this patch by patch, and you can map where the glass is bumpy. Astronomers do the same with whole patches of the sky. Here the
              “glass” is the matter between us and the galaxies. The drawing below shows the three stages.
            </li>
          </ul>

          <LensingDrawing />

          <p style={paragraph}>
            <strong>Step 3: why many galaxies matter, with simple math.</strong> Compare flipping a coin. Flip a fair coin 10 times and you may get
            7 heads. That tells you nothing about the coin. But suppose a coin lands heads 51 times out of 100. With 10 flips you could never tell it
            from a fair coin. With a <strong>million</strong> flips, a fair coin gives about 500,000 heads, give or take about 500. A coin that lands
            heads 51 percent of the time gives 510,000 heads, which is 10,000 more: <strong>20 times the usual give-or-take</strong>. You would be
            certain it was biased. A tiny steady lean, too small to see in one galaxy, shows up clearly in millions of galaxies. That is why
            surveys measure the shapes of millions of galaxies.
          </p>
          <p style={paragraph}>
            <strong>Step 4: what the map tells you.</strong> Where there is more matter in the way, the average lean is stronger. So the map of the
            average lean is a map of the matter, including dark matter. And how strong the lean is, overall, tells how lumpy the matter is. That is
            the number S₈ below.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> Here is each one in plain language.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Ωm</strong> (said “omega-m”): the share of the universe’s energy today that is matter, meaning ordinary matter plus dark
                matter. For example, 0.315 means about 31 percent matter, with the rest dark energy in this simple picture.
              </li>
              <li>
                <strong>σ₈</strong> (said “sigma-eight”; it has nothing to do with the sigma that measures disagreement): how big the ripples in
                the matter are today, measured in regions of one standard size. A larger σ₈ means a lumpier universe.
              </li>
              <li>
                <strong>S₈</strong> (said “S-eight”): one number that combines the two, <strong>S₈ = σ₈ × √(Ωm ÷ 0.3)</strong>. Lensing is
                sensitive mostly to this combination, which is why scientists quote it. It is a plain number with no units. Here is an example with the
                microwave background’s own published ingredients: the Planck satellite (described below) found Ωm = {PLANCK_OWN.omegaMatter} and σ₈ ={' '}
                {PLANCK_OWN.sigma8}. So Ωm ÷ 0.3 = {(PLANCK_OWN.omegaMatter / 0.3).toFixed(3)}, its square root is{' '}
                {Math.sqrt(PLANCK_OWN.omegaMatter / 0.3).toFixed(4)}, and S₈ = {PLANCK_OWN.sigma8} × {Math.sqrt(PLANCK_OWN.omegaMatter / 0.3).toFixed(4)} ={' '}
                {planckFromParts.toFixed(3)}. (Different analyses of the same microwave-background data give values that differ in the third
                decimal. This page uses {early.value}, the value the Kilo-Degree Survey team (described below) compares its own result with.)
              </li>
              <li>
                <strong>Tension:</strong> as in Experiment 1, a disagreement between two measurements that is too big to put down to chance. A
                puzzle, not yet a discovery. It is measured in <strong>sigma</strong>: the gap between two values divided by their combined “give or
                take”. About 1 sigma is an ordinary difference. 5 sigma is the usual bar in many sciences for calling a difference real.
              </li>
              <li>
                <strong>Calibration:</strong> checking a measuring tool against something whose true value is known, as you might check a
                kitchen scale with a 1-kilogram weight. Lensing needs several things to be calibrated, and the next paragraph names the hardest.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>Why distances matter.</strong> To turn the stretching into a value of S₈, you must know how far away the lensed galaxies are. A
            galaxy that is farther away has had more matter in the way of its light. Astronomers estimate each galaxy’s distance from its colours in
            many filters, not by measuring it one galaxy at a time, and getting this right across millions of galaxies is one of the hardest parts
            of the job.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>The measurements you will meet.</strong> Each name below appears in the pictures, so here is what each one is.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Planck Legacy (the microwave background).</strong> Planck was a European Space Agency satellite that mapped the microwave
                background, the afterglow of the Big Bang, more precisely than any before it. “Legacy” means its final, most refined results (2018).
                From that map and the standard model, scientists work out how lumpy the universe should be today. That prediction,{' '}
                <strong>S₈ = {early.value} ± {early.up}</strong>, is the sky-blue dot in the pictures. It is a prediction, not a lensing
                measurement.
              </li>
              <li>
                <strong>KiDS, the Kilo-Degree Survey.</strong> A survey run with a telescope of the European Southern Observatory. It photographs a
                large patch of sky in nine different colours (filters), so that it can measure the shapes of a very large number of galaxies and map
                the matter by weak lensing. It measures S₈ directly, from the lensing, and does not use the microwave background.
                <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>KiDS-1000</strong> is the name of the team’s first analysis (posted in 2020).
                  </li>
                  <li>
                    <strong>KiDS-Legacy</strong> is its analysis of the complete survey (posted in 2025). That is 1,347 square degrees of sky. A
                    square degree is a patch of sky about five times the area of the full Moon, so the survey covers about 3 percent of the whole
                    sky.
                  </li>
                  <li>Both are the same survey: KiDS-Legacy uses its complete data, with more sky and improved calibration and image processing.</li>
                </ul>
              </li>
              <li>
                <strong>DES, the Dark Energy Survey.</strong> A different survey, with a different telescope and camera, run by a different team.
                Its <strong>Year 6</strong> result (posted in 2026) comes from six years of observing and about 140 million galaxies. It measures S₈
                by lensing too.
                <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  <li>
                    It is shown twice, <strong>NLA</strong> and <strong>TATT</strong>. These are two ways of treating one nuisance effect in the
                    analysis, and the paler dot is the second way. This experiment does not explain the effect itself.
                  </li>
                </ul>
              </li>
              <li>
                <strong>Why the surveys are compared.</strong> All of them measure the same thing, S₈, by different routes, so if the universe is as
                the standard model says, they should agree.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions about surveys that measured S₈ by lensing, press Run, and then look
            closer at the survey you choose. Nothing here is graded. Your predictions never change the real pictures or tables. They are drawn on the
            pictures in white, in a box marked YOUR GUESS, so you can compare them with what was measured and calculated, and they are listed again
            beside the results. In Part 2 you can choose which survey to look at closely. That choice is pink: it draws that survey’s curve with a pink glow
            in Picture 2, fills a drawing in Part 2 and picks the column of the first table, but it never changes your guesses.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> Each published “give or take” is treated as a simple error bar, and two measurements as independent,
            as in Experiment 1. The surveys publish different upward and downward uncertainties, so for each comparison we use the one on the side
            facing the other value. The scientists’ own papers use more careful statistics, so the sigma they quote can differ from the one
            worked out here, and we show both. We show a few published measurements, not all of them. And this experiment cannot tell you which
            measurement, if any, is wrong.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Links to the original scientific papers and to the surveys’ own pages appear below the results, after
            you press Run, because their summaries state what the predictions ask, and you should get to guess first. Links open in a new tab. This
            page was written as of October 2026.
          </p>
          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Want it explained in plainer words?</strong> This page is written for the public, by the European Space Agency (ESA).
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://sci.esa.int/web/euclid/-/46680-weak-gravitational-lensing">ESA: Weak gravitational lensing</ExternalLink>
              : how the small distortions of distant galaxies are used to map matter, including dark matter. (ESA’s science pages carry a notice
              that they are under review and not being updated.)
            </li>
          </ul>
        </div>

        <ReferencePanel
          entries={
            status === 'complete'
              ? [
                  ...REFERENCE_ENTRIES,
                  {
                    term: 'S₈ and the curve of equal S₈ (formula)',
                    meaning: `S₈ = σ₈ × √(Ωm ÷ 0.3), so on a curve of equal S₈, σ₈ = S₈ ÷ √(Ωm ÷ 0.3). Example, with ${result.focus.name} (S₈ = ${result.focus.value}) at Ωm = 0.35: √(0.35 ÷ 0.3) = ${Math.sqrt(0.35 / 0.3).toFixed(4)}, so σ₈ = ${result.focus.value} ÷ ${Math.sqrt(0.35 / 0.3).toFixed(4)} = ${sigma8OnCurve(result.focus.value, 0.35).toFixed(3)}.`,
                  },
                  {
                    term: 'Sigma, with unequal error bars (formula)',
                    meaning: `sigma = (the gap) ÷ √(u₁² + u₂²), where u₁ and u₂ are the two uncertainties on the sides facing each other. Example, with ${result.focus.name} against ${result.early.name}: the gap is ${result.early.value} − ${result.focus.value} = ${result.gap.toFixed(3)}. The survey’s uncertainty on the side facing the microwave background is ${result.surveyUncertaintyUsed}, and the microwave background’s on the side facing the survey is ${result.earlyUncertaintyUsed}. So the combined give-or-take is √(${result.surveyUncertaintyUsed}² + ${result.earlyUncertaintyUsed}²) = ${result.combinedUncertainty.toFixed(4)}, and sigma = ${result.gap.toFixed(3)} ÷ ${result.combinedUncertainty.toFixed(4)} = ${result.tension.toFixed(2)}.`,
                  },
                  {
                    term: 'The change between two analyses (formula)',
                    meaning: `change = (the later S₈) − (the earlier S₈); a plus sign means higher. Example, KiDS-1000 to KiDS-Legacy: ${MEASUREMENTS.find((m) => m.name === 'KiDS-Legacy')!.value} − ${MEASUREMENTS.find((m) => m.name === 'KiDS-1000')!.value} = ${sign3(kidsChange)}.`,
                  },
                ]
              : REFERENCE_ENTRIES
          }
        />

        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          We are about to make two predictions, then watch three pictures build up, one stage at a time: the measurements on one line, why lensing measures a
          combination, and how the values changed over the years. Nothing here tells you the answers. When the pictures are drawn, your guesses appear on them in white.
        </PartHeader>

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither
            says which answer is right. */}
        {(
          [
            {
              title: 'Prediction 1: what did the better calibration do?',
              text: (
                <>
                  In 2020, the Kilo-Degree Survey (KiDS) measured S₈ = {kids1000.value}, which was about 3 sigma <strong>below</strong> the value
                  predicted from the microwave background. In 2025 the team re-analysed its complete data with a better way of working out how far
                  away the lensed galaxies are, more sky and improved image processing. Did S₈ come out <strong>lower</strong>, about the{' '}
                  <strong>same</strong> or <strong>higher</strong> than in 2020?
                </>
              ),
              choices: SHIFT_CHOICES,
              value: shiftPrediction,
              set: (v: ShiftDirection) => setShiftPrediction(v),
            },
            {
              title: 'Prediction 2: do the other surveys now agree?',
              text: (
                <>
                  In 2026 the Dark Energy Survey (DES), a different survey with a different telescope, published its own six-year result.
                  Compared with the microwave-background value, how far below or above it is DES’s S₈, in sigma?
                </>
              ),
              choices: RANGE_CHOICES,
              value: rangePrediction,
              set: (v: TensionRange) => setRangePrediction(v),
            },
          ] as const
        ).map((question) => (
          <div key={question.title} style={{ marginBottom: '2rem' }}>
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
                  disabled={status !== 'idle'}
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

        <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || status !== 'idle'} style={{ padding: '0.6rem 1.5rem' }}>
          {status === 'running' ? 'Running...' : 'Run'}
        </button>
        {status === 'complete' && (
          <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
            Start over
          </button>
        )}
        {!bothPredicted && status === 'idle' && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
        )}

        {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
        <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
          {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The pictures fill in, one stage at a time, after you press Run.</span>}
          {status !== 'idle' && (
            <>
              <strong>{status === 'complete' ? 'Run complete' : `Stage ${stage} of ${LAST_STAGE}`}</strong>
              {status === 'running' && <>: {STAGES[stage - 1]}</>}
              {status === 'complete' && <span style={{ color: 'var(--text-muted)' }}> (all {LAST_STAGE} stages shown). Your predictions are recorded and not marked here.</span>}
            </>
          )}
        </p>

        {/* Picture 1: the S8 number line. The microwave-background prediction is always drawn; the surveys appear at stage 2 and their gaps at stage 3. */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={p1Total}
            viewBox={`0 0 ${VIEW_WIDTH} ${p1Total}`}
            style={svgStyle}
            role="img"
            aria-label="Number line of S8: the microwave-background prediction and each survey's measurement with its error bar"
          >
            <text x={AXIS_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
              Picture 1: the measurements of S₈ on one number line
            </text>

            {/* The number line */}
            <line x1={AXIS_LEFT} y1={axisY} x2={AXIS_RIGHT} y2={axisY} stroke={MUTED_COLOR} strokeWidth={1.5} />
            {TICKS.map((t) => (
              <g key={t}>
                <line x1={xOf(t)} y1={axisY - 4} x2={xOf(t)} y2={axisY + 4} stroke={MUTED_COLOR} />
                <text x={xOf(t)} y={axisY + 18} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
                  {t.toFixed(2)}
                </text>
              </g>
            ))}
            <text x={(AXIS_LEFT + AXIS_RIGHT) / 2} y={axisY + 38} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
              S₈ (a plain number: how lumpy matter is today)
            </text>

            {/* The microwave-background prediction: a dot with an error bar, and a dashed line down to the number line */}
            <line x1={xOf(early.value)} y1={planckY + 4} x2={xOf(early.value)} y2={axisY} stroke={EARLY_COLOR} strokeWidth={1} strokeDasharray="4 3" />
            <line x1={xOf(early.value - early.down)} y1={planckY} x2={xOf(early.value + early.up)} y2={planckY} stroke={EARLY_COLOR} strokeWidth={3} />
            <circle cx={xOf(early.value)} cy={planckY} r={5} fill={EARLY_COLOR} />
            <text x={xOf(early.value) - 24} y={planckY - 14} fill={EARLY_COLOR} fontSize="12" textAnchor="middle">
              {early.name} (microwave background): {early.value} ± {early.up}
            </text>

            {/* The surveys: each a dot with an error bar that can be longer on one side (stage 2), then its gap from the prediction (stage 3) */}
            {stage >= 2 &&
              LATE_MEASUREMENTS.map((m, i) => {
                const y = surveyY(i)
                const color = m.name === 'DES Y6 (TATT)' ? PALE_LATE_COLOR : LATE_COLOR
                const sigma = tensionSigma(m, early)
                return (
                  <g key={m.name}>
                    <line x1={xOf(m.value - m.down)} y1={y} x2={xOf(m.value + m.up)} y2={y} stroke={color} strokeWidth={3} />
                    <line x1={xOf(m.value - m.down)} y1={y - 5} x2={xOf(m.value - m.down)} y2={y + 5} stroke={color} strokeWidth={2} />
                    <line x1={xOf(m.value + m.up)} y1={y - 5} x2={xOf(m.value + m.up)} y2={y + 5} stroke={color} strokeWidth={2} />
                    <circle cx={xOf(m.value)} cy={y} r={5} fill={color} />
                    <text x={xOf(m.value)} y={y - 12} fill={color} fontSize="12" textAnchor="middle">
                      {m.name} ({m.year}): {m.value}
                    </text>
                    {stage >= 3 && (
                      <g>
                        <line x1={xOf(m.value)} y1={y + 16} x2={xOf(early.value)} y2={y + 16} stroke={TEXT_COLOR} strokeWidth={1.5} />
                        <line x1={xOf(m.value)} y1={y + 11} x2={xOf(m.value)} y2={y + 21} stroke={TEXT_COLOR} strokeWidth={1.5} />
                        <line x1={xOf(early.value)} y1={y + 11} x2={xOf(early.value)} y2={y + 21} stroke={TEXT_COLOR} strokeWidth={1.5} />
                        <text x={(xOf(m.value) + xOf(early.value)) / 2} y={y + 33} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
                          gap {(early.value - m.value).toFixed(3)} = {sigma.toFixed(2)} sigma
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}

            {/* The "How many sigma?" panel (stage 3): the real sigma of each survey on its own scale, and your guess for Prediction 2 as a white band. */}
            {stage >= 3 && rangePrediction !== null && (() => {
              const oy = p1Height
              const band = sigmaGuessBand(rangePrediction)
              const endX = sigmaX(band.hi ?? SIGMA_MAX)
              const startX = sigmaX(band.lo)
              const mid = (startX + endX) / 2
              const bandY = oy + 118
              return (
                <g>
                  <line x1={AXIS_LEFT} y1={oy} x2={AXIS_RIGHT} y2={oy} stroke={MUTED_COLOR} strokeDasharray="2 4" />
                  <text x={AXIS_LEFT} y={oy + 24} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                    How many sigma? Each survey against the microwave background
                  </text>
                  {LATE_MEASUREMENTS.map((m) => {
                    const sigma = tensionSigma(m, early)
                    const color = m.name === 'DES Y6 (TATT)' ? PALE_LATE_COLOR : LATE_COLOR
                    const short = m.name.replace('DES Y6 ', 'DES ')
                    return (
                      <g key={m.name}>
                        <circle cx={sigmaX(sigma)} cy={oy + 86} r={5} fill={color} />
                        <text x={sigmaX(sigma)} y={oy + (m.name === 'DES Y6 (TATT)' ? 52 : 68)} fill={color} fontSize="11" textAnchor="middle">
                          {short}: {sigma.toFixed(2)}
                        </text>
                        <line x1={sigmaX(sigma)} y1={oy + (m.name === 'DES Y6 (TATT)' ? 56 : 72)} x2={sigmaX(sigma)} y2={oy + 81} stroke={color} strokeWidth={1} strokeOpacity={0.6} />
                      </g>
                    )
                  })}
                  <line x1={AXIS_LEFT} y1={oy + 100} x2={AXIS_RIGHT} y2={oy + 100} stroke={MUTED_COLOR} strokeWidth={1.5} />
                  {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((t) => (
                    <g key={t}>
                      <line x1={sigmaX(t)} y1={oy + 96} x2={sigmaX(t)} y2={oy + 104} stroke={MUTED_COLOR} />
                      <text x={sigmaX(t)} y={oy + 134} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
                        {t}
                      </text>
                    </g>
                  ))}
                  <rect x={startX} y={bandY - 14} width={Math.max(endX - startX, 0)} height={10} fill={GUESS_COLOR} opacity={0.9} />
                  {band.hi === null && <polygon points={`${endX},${bandY - 18} ${endX + 12},${bandY - 9} ${endX},${bandY}`} fill={GUESS_COLOR} />}
                  <line x1={mid + 14} y1={bandY - 4} x2={mid + 14} y2={oy + 148} stroke={GUESS_COLOR} strokeWidth={2} />
                  <rect x={Math.min(Math.max(mid + 14 - 130, 10), VIEW_WIDTH - 270)} y={oy + 148} width={260} height={28} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
                  <text x={(AXIS_LEFT + AXIS_RIGHT) / 2} y={oy + 194} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
                    sigma: how many combined give-or-takes the gap is
                  </text>
                  <text x={Math.min(Math.max(mid + 14 - 130, 10), VIEW_WIDTH - 270) + 130} y={oy + 167} fill={GUESS_COLOR} fontSize="12" fontWeight="bold" textAnchor="middle">
                    YOUR GUESS: {RANGE_SHORT[rangePrediction]}
                  </text>
                </g>
              )
            })()}
          </svg>
        </div>

        {/* Picture 1's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). The first three bullets are the wording
            approved on 2026-10-19; the bullets about the surveys and the gaps replace the placeholder "the surveys' values appear here when Run is
            built". It does not say where any survey's value lies relative to the microwave background. */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <p style={paragraph}>
            <strong>How to read this diagram.</strong> This picture is a <strong>number line</strong>, like the marks on a ruler. It is made to
            compare measurements of one thing, S₈, the number that says how lumpy matter is today. Each measurement is drawn as a dot with a bar
            through it, and where the dot sits on the line is the value that measurement found. The further right a dot sits, the lumpier that
            measurement says the universe is.
          </p>
          <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <strong>The line and its numbers (0.70 to 0.88):</strong> values of S₈. S₈ has no units, because it is built from two plain numbers
              (Ωm and σ₈). Notice that the line starts at 0.70, not at 0. We zoom in on the narrow range where all the measurements fall, so that
              you can see small differences. Zooming in makes small gaps look big, so the sigma is what tells you whether a gap matters.
            </li>
            <li>
              <strong>The sky-blue dot and bar:</strong> the prediction from the microwave background, {early.name}: {early.value} ± {early.up}.
              The dot is the best value. The bar reaches as far to the left and right as the “give or take” ({early.up}), so the true value is
              probably somewhere along it. (An <strong>error bar</strong> is just that “give or take” drawn as a picture. “Error” here means the
              small unavoidable imprecision of any measurement, not a mistake.) The dashed line runs from the dot down to the number line so you
              can read its value.
            </li>
            <li>
              <strong>The orange dots and bars</strong> (they appear at stage 2): one for each survey measurement, labelled with its name and the
              year its paper was posted. Each survey publishes a different upward and downward “give or take”, so an orange bar can be longer on
              one side than the other; the small upright marks at its ends show where it stops. There are four: KiDS’s first full analysis (2020),
              KiDS’s re-analysis (2025) (KiDS is the Kilo-Degree Survey, described in the introduction above), and the Dark Energy Survey’s
              Year 6 result (2026) in two versions (DES, also described above). The two versions are the same data
              analysed with two ways of treating one nuisance effect (written “NLA” and “TATT”), and the paler dot is the second way.
            </li>
            <li>
              <strong>The pale brackets and the words “gap … = … sigma”</strong> (they appear at stage 3): the gap between that survey’s value
              and the microwave-background value, and what it comes to in sigma. As in Experiment 1, sigma is the gap divided by the combined
              “give or take” of the two values. Because the bars can be unequal, the combined “give or take” uses the length of each bar on the
              side facing the other value. The scientists’ own papers use fuller statistics, so their quoted sigma can differ from this simple one;
              the results show both.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>A worked moment, with real numbers.</strong> Take the {kids1000.name} dot ({kids1000.value}) and the sky-blue dot ({early.value}). The gap is{' '}
            {early.value} − {kids1000.value} = {(early.value - kids1000.value).toFixed(3)}. The orange bar reaches up {kids1000.up} on the side facing the
            sky-blue dot, and the sky-blue bar reaches {early.down} on its side, so the combined “give or take” is √({kids1000.up}² + {early.down}²) ={' '}
            {Math.sqrt(kids1000.up ** 2 + early.down ** 2).toFixed(4)}. Then {(early.value - kids1000.value).toFixed(3)} ÷{' '}
            {Math.sqrt(kids1000.up ** 2 + early.down ** 2).toFixed(4)} = {tensionSigma(kids1000, early).toFixed(2)} sigma. That is the number the picture
            shows at stage 3.
          </p>
          {stage >= 3 && (
            <>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong> Here are four things to look at, what each one means, and why it matters.
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Look at</strong> how far a survey’s dot is from the sky-blue dot, compared with the bars. <strong>What it means:</strong>{' '}
                  {LATE_MEASUREMENTS.map((m) => `${m.name} is ${fixedGap(m)} below it (${tensionSigma(m, early).toFixed(2)} sigma)`).join('; ')}. <strong>Why it matters:</strong> a gap that is
                  several bars wide is hard to put down to chance. One smaller than the bars is not.
                </li>
                <li>
                  <strong>Look at</strong> whether the bars overlap. <strong>What it means:</strong>{' '}
                  {LATE_MEASUREMENTS.map((m) => `${m.name}’s bar ${bandRelation(m).barReachesBand ? 'overlaps' : 'does not touch'} the sky-blue bar`).join('; ')}.{' '}
                  <strong>Why it matters:</strong> overlapping bars mean the two measurements could both be right. But overlap alone is not the whole story: the sigma puts a number on it.
                </li>
                <li>
                  <strong>Look at</strong> which side of the sky-blue dot each survey’s dot is on. <strong>What it means:</strong> all four are on the left. <strong>Why it matters:</strong> left means a smoother
                  universe than the microwave background predicts, right a lumpier one.
                </li>
                <li>
                  <strong>Look at</strong> the white band and the dots in the “How many sigma?” panel. <strong>What it means:</strong> the dots are the sigma of each survey, and the band is where you
                  guessed for DES. <strong>Why it matters:</strong> it puts your guess on the same scale as the real numbers.
                </li>
              </ul>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The “How many sigma?” panel (it appears at stage 3, below the number line):</strong> its own scale, from 0 to 3 sigma. Each coloured dot is one survey’s sigma (the number
                  after its name), the same numbers as in the words “gap … = … sigma” above. The white band and the YOUR GUESS box are your guess for Prediction 2. The band covers the range you
                  chose, and “more than 2.5” ends in an arrow. It is only where you guessed, not a result.
                </li>
              </ul>
              <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                <strong>Where the real picture comes from.</strong> <em>Measured:</em> the S₈ values and their error bars, by the Planck, KiDS and DES teams named in the table below.{' '}
                <em>Calculated here:</em> the gaps and every sigma, with the simple rule explained above (the papers use fuller statistics). <em>Imagined for the question:</em> nothing.
              </p>
            </>
          )}
        </div>

        {/* Picture 2: why lensing measures a combination (stage 4). Draft wording for the owner's review. */}
        {status !== 'idle' && stage >= 4 && <Picture2 result={result} highlight={status === 'complete' ? focusNames : []} />}

        {/* Picture 3: how the values changed (stage 5). Draft wording for the owner's review. */}
        {status !== 'idle' && stage >= 5 && <Picture3 shiftPrediction={shiftPrediction} />}

        {/* After the run: the "Look closer at" control, the neutral results, the guide to them and the links kept back until now. Draft wording
            for the owner's review (CLAUDE.md §28.1, §29). The results only report; they do not say why. */}
        {status === 'complete' && (
          <div style={{ marginTop: '0.5rem' }}>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              We are about to choose one survey and look at its numbers more closely. Your choice puts a pink glow on its curve in Picture 2, fills the drawing in this part and picks the
              column of the first table. It never changes the published numbers, the other curves or your guesses.
            </PartHeader>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              Your guesses do not change the drawings or tables. This setting does. The survey you choose is a trial value, not a measurement: it puts a pink glow on its curve in Picture 2,
              fills the drawing below and picks the column of the first table.
            </p>
            <p style={{ fontWeight: 'bold', marginTop: 0, marginBottom: '0.5rem' }}>Look closer at</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
              Choose a survey. (DES Year 6 shows both of its versions.)
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              {FOCUS_PRESETS.map((preset, i) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setFocusIndex(i)}
                  className={`toggle-button${focusIndex === i ? ' is-selected' : ''}`}
                  style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Drawing A: the survey the learner chose (pink), beside the microwave-background value (sky blue); then its sigma worked out here beside the paper's own. */}
            {(() => {
              const n = results.length
              const axisY2 = 120 + 28 * n + 20
              const sy = axisY2 + 66
              const height = sy + 16 + n * 50 + (focusMeasurements.some((m) => paperSigma(m).baseline !== 'Planck alone') ? 26 : 8)
              return (
                <svg width={VIEW_WIDTH} height={height} viewBox={`0 0 ${VIEW_WIDTH} ${height}`} style={svgStyle} role="img" aria-label={`The survey you chose, ${FOCUS_PRESETS[focusIndex].label}, beside the microwave-background value, and its sigma worked out here beside the paper's own`}>
                  <text x={AXIS_LEFT} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
                    Drawing A: the survey you chose, beside the microwave-background value
                  </text>
                  <line x1={xOf(result.early.value)} y1={74} x2={xOf(result.early.value)} y2={axisY2} stroke={EARLY_COLOR} strokeWidth={1} strokeDasharray="4 3" />
                  <line x1={xOf(result.early.value - result.early.down)} y1={66} x2={xOf(result.early.value + result.early.up)} y2={66} stroke={EARLY_COLOR} strokeWidth={3} />
                  <circle cx={xOf(result.early.value)} cy={66} r={5} fill={EARLY_COLOR} />
                  <text x={xOf(result.early.value) - 24} y={52} fill={EARLY_COLOR} fontSize="12" textAnchor="middle">
                    {result.early.name} (microwave background): {result.early.value} ± {result.early.up}
                  </text>
                  {focusMeasurements.map((m, i) => {
                    const y = 108 + 28 * i
                    return (
                      <g key={m.name}>
                        <line x1={xOf(m.value - m.down)} y1={y} x2={xOf(m.value + m.up)} y2={y} stroke={TRIAL_COLOR} strokeWidth={3} strokeOpacity={i === 0 ? 1 : 0.65} />
                        <circle cx={xOf(m.value)} cy={y} r={5} fill={TRIAL_COLOR} fillOpacity={i === 0 ? 1 : 0.65} />
                        <text x={xOf(m.value) - 10} y={y - 10} fill={TRIAL_COLOR} fontSize="11" textAnchor="end">
                          {m.name}: {m.value} (+{m.up}, −{m.down})
                        </text>
                      </g>
                    )
                  })}
                  <line x1={AXIS_LEFT} y1={axisY2} x2={AXIS_RIGHT} y2={axisY2} stroke={MUTED_COLOR} strokeWidth={1.5} />
                  {TICKS.map((t) => (
                    <g key={t}>
                      <line x1={xOf(t)} y1={axisY2 - 4} x2={xOf(t)} y2={axisY2 + 4} stroke={MUTED_COLOR} />
                      <text x={xOf(t)} y={axisY2 + 18} fill={MUTED_COLOR} fontSize="11" textAnchor="middle">
                        {t.toFixed(2)}
                      </text>
                    </g>
                  ))}
                  <text x={(AXIS_LEFT + AXIS_RIGHT) / 2} y={axisY2 + 38} fill={TEXT_COLOR} fontSize="12" textAnchor="middle">
                    S₈ (a plain number: how lumpy matter is today)
                  </text>
                  <line x1={AXIS_LEFT} y1={sy - 22} x2={AXIS_RIGHT} y2={sy - 22} stroke={MUTED_COLOR} strokeDasharray="2 4" />
                  <text x={AXIS_LEFT} y={sy - 4} fill={TEXT_COLOR} fontSize="12" fontWeight="bold">
                    Sigma, from 0 to 3
                  </text>
                  {results.map((r, i) => {
                    const base = sy + 16 + i * 50
                    const paper = paperSigma(r.focus)
                    return (
                      <g key={r.focus.name}>
                        <text x={DA_SIGMA_X0} y={base - 4} fill={TRIAL_COLOR} fontSize="10">
                          {r.focus.name}
                        </text>
                        <text x={AXIS_LEFT} y={base + 11} fill={TEXT_COLOR} fontSize="11">
                          worked out here
                        </text>
                        <rect x={DA_SIGMA_X0} y={base} width={daSigmaX(r.tension) - DA_SIGMA_X0} height={14} fill={TRIAL_COLOR} />
                        <text x={daSigmaX(r.tension) + 6} y={base + 11} fill={TRIAL_COLOR} fontSize="11">
                          {r.tension.toFixed(2)}
                        </text>
                        <text x={AXIS_LEFT} y={base + 31} fill={TEXT_COLOR} fontSize="11">
                          the paper’s own
                        </text>
                        <rect x={DA_SIGMA_X0} y={base + 20} width={daSigmaX(paper.value) - DA_SIGMA_X0} height={14} fill={MUTED_COLOR} />
                        <text x={daSigmaX(paper.value) + 6} y={base + 31} fill={MUTED_COLOR} fontSize="11">
                          {paperText(r.focus)}
                        </text>
                      </g>
                    )
                  })}
                  {focusMeasurements.some((m) => paperSigma(m).baseline !== 'Planck alone') && (
                    <text x={AXIS_LEFT} y={height - 8} fill={MUTED_COLOR} fontSize="10">
                      DES’s own figure compares with Planck + ACT + SPT, a different comparison.
                    </text>
                  )}
                </svg>
              )
            })()}

            <div style={{ marginTop: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={paragraph}>
                <strong>How to read this drawing.</strong> It shows the survey you chose beside the microwave-background value, on the same S₈ line as Picture 1, and then two bars for its sigma: the one worked out
                on this page, and the one the scientists published.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>The sky-blue dot, bar and dashed line:</strong> the microwave-background value, {result.early.value} ± {result.early.up}. The dashed line is a ruler to hold against the pink dot.
                </li>
                <li>
                  <strong>The pink dot and bar:</strong> the survey you chose ({FOCUS_PRESETS[focusIndex].label}). The bar can be longer on one side, because the surveys publish different upward and downward
                  uncertainties. For DES Year 6 there are two pink dots, the second a little paler. Pink always means the survey you chose.
                </li>
                <li>
                  <strong>The two bars below:</strong> the pink bar is the sigma worked out here, with the simple rule from Picture 1. The grey bar is the sigma the scientists published, from fuller statistics. Longer
                  means a larger gap in sigma. For DES the grey bar compares with Planck + ACT + SPT, so it answers a slightly different question.
                </li>
              </ul>
              <p style={paragraph}>
                <strong>A worked moment, with your numbers.</strong> Take {results[0].focus.name} ({results[0].focus.value}) and the sky-blue dot ({result.early.value}). The gap is {result.early.value} −{' '}
                {results[0].focus.value} = {results[0].gap.toFixed(3)}. The pink bar reaches {results[0].surveyUncertaintyUsed} on the side facing the sky-blue dot, and the sky-blue bar reaches{' '}
                {results[0].earlyUncertaintyUsed}, so the combined “give or take” is {results[0].combinedUncertainty.toFixed(4)}. Then {results[0].gap.toFixed(3)} ÷ {results[0].combinedUncertainty.toFixed(4)} ={' '}
                {results[0].tension.toFixed(2)} sigma, against the paper’s {paperText(results[0].focus)}.
                {results.length > 1 && ' The second DES version works the same way.'}
              </p>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What to look for.</strong> Here are three things to look at, what each one means, and why it matters.
              </p>
              <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Look at</strong> where the pink dot sits against the sky-blue dot. <strong>What it means:</strong> {results[0].focus.name} is {results[0].gap.toFixed(3)} to the left, so a smoother universe than
                  the microwave background predicts. <strong>Why it matters:</strong> the distance and the bars together set how big the disagreement is.
                </li>
                <li>
                  <strong>Look at</strong> how the two sigma bars compare. <strong>What it means:</strong> {results[0].tension.toFixed(2)} here, against {paperText(results[0].focus)}{' '}
                  in the paper. <strong>Why it matters:</strong> the papers use fuller statistics, so the two need not match. The simple one is a guide to the size of the gap, not the final word.
                </li>
                <li>
                  <strong>Look at</strong> the pink glow in Picture 2 above. <strong>What it means:</strong> it is on the same survey’s curve. <strong>Why it matters:</strong> it connects the S₈ you see here with the curve of
                  equal S₈ in Picture 2.
                </li>
              </ul>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>Where the real picture comes from.</strong> <em>Measured:</em> the S₈ values, their error bars and the papers’ own sigma, by the Planck, KiDS and DES teams. <em>Calculated here:</em> the sigma worked
                out here. <em>Imagined for the question:</em> nothing. The pink marks are your choice of survey. Your guesses are not drawn here, because they never change a picture.
              </p>
            </div>

            <PartHeader color="#0f766e" title="Part 3: The results">
              We are about to read the numbers: first a check-up against the papers’ own figures, then the tables. A guess never changes them. The survey you chose in Part 2 changes the first table, and the page says
              which one is on.
            </PartHeader>

            <div style={{ border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', padding: '1rem', fontSize: '0.875rem' }}>
              <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
                <strong>Results.</strong> These are the numbers behind the three pictures. They only report what was published and what was calculated.
                They do not say why the numbers are what they are.
              </p>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>The check-up: what the papers give, and what was found here</p>
              <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>What was checked</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>What we would expect</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>What was found</th>
                    <th style={{ padding: '0.4rem 0' }}>Reading</th>
                  </tr>
                </thead>
                <tbody>
                  {checkUp.map((row, i) => {
                    const survey = i === 0 ? null : LATE_MEASUREMENTS[i - 1]
                    const paper = survey ? paperSigma(survey) : null
                    const tag = survey ? (survey.name === 'KiDS-1000' || survey.name === 'KiDS-Legacy' ? ' (a number for Prediction 1’s surveys)' : ' (the row for Prediction 2)') : ''
                    return (
                      <tr key={row.label} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                        <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>
                          {row.label}
                          {survey && survey.side === 'late' && survey.name.startsWith('DES') ? tag : ''}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>
                          {i === 0
                            ? `${row.expected.toFixed(3)} (0.811 × √(0.315 ÷ 0.3))`
                            : `${paperText(survey!)} (the paper’s own${paper!.baseline === 'Planck alone' ? '' : `, against ${paper!.baseline}`})`}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{i === 0 ? `${row.found.toFixed(3)} (as quoted)` : row.found.toFixed(2)}</td>
                        <td style={{ padding: '0.4rem 0', fontWeight: 'bold' }}>{row.reading}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
                The check-up always covers all four surveys, whichever one you chose in Part 2. It never follows your guesses.
              </p>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Planck’s S₈.</strong> The formula gives {checkUp[0].expected.toFixed(3)} from Planck’s own σ₈ and Ωm. The page uses the quoted {checkUp[0].found}. It matters because every sigma on this page is measured from that
                    value. The page does not say why the two differ by {(checkUp[0].found - checkUp[0].expected).toFixed(3)}.
                  </li>
                  <li>
                    <strong>KiDS-1000.</strong> Worked out here: {checkUp[1].found.toFixed(2)}, which is {checkUp[1].reading} than the paper’s about 3. The papers use fuller statistics, so the two need not match. It matters because this is the
                    first tension the experiment is about, so read this page’s number as an approximation.
                  </li>
                  <li>
                    <strong>KiDS-Legacy.</strong> {checkUp[2].found.toFixed(2)} here, which is {checkUp[2].reading} than the paper’s 0.73, for the same reason. It matters because it is the re-analysis the first prediction is about.
                  </li>
                  <li>
                    <strong>DES.</strong> The papers’ {paperText(LATE_MEASUREMENTS[2])} and {paperText(LATE_MEASUREMENTS[3])} compare DES with Planck + ACT + SPT. This page’s {checkUp[3].found.toFixed(2)} and {checkUp[4].found.toFixed(2)} compare it with Planck alone,
                    so they are not the same comparison and the page gives no reading. It matters because the numbers look close but answer different questions.
                  </li>
                </ul>
              </div>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Your guesses, beside the results</p>
              <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
                Your guesses are shown here as you made them, with the place where each one’s number appears. They are not marked here, and they never change a picture or a table.
              </p>
              <ul style={{ marginTop: 0, paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
                <li>
                  <strong>Prediction 1, what the better calibration did to KiDS’s S₈:</strong> {shiftPrediction !== null ? SHIFT_CHOICES.find((c) => c.value === shiftPrediction)?.label.toLowerCase() : ''}. The question was about
                  the change from KiDS-1000 to KiDS-Legacy. Its numbers are in Table 2 (the S₈ column, the rows for KiDS-1000 and KiDS-Legacy), in the line under it that gives the change, and in Picture 3.
                </li>
                <li>
                  <strong>Prediction 2, how many sigma DES is from the microwave value:</strong> {rangePrediction !== null ? RANGE_CHOICES.find((c) => c.value === rangePrediction)?.label.toLowerCase() : ''}. Its numbers are in
                  Table 2 (the two DES rows, the sigma columns), in Table 1 when you look closer at DES Year 6, and in the new panel under Picture 1.
                </li>
              </ul>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {FOCUS_PRESETS[focusIndex].label}, compared with {result.early.name}
              </p>
              <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '320px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'right' }}>
                      <th style={{ padding: '0.4rem 0.5rem 0.4rem 0', textAlign: 'left' }} />
                      {results.map((r) => (
                        <th key={r.focus.name} style={{ padding: '0.4rem 0.5rem' }}>
                          {r.focus.name} ({r.focus.year})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ['S₈, with upward and downward give-or-take', (r: LumpinessResult) => `${r.focus.value.toFixed(3)} (+${r.focus.up.toFixed(3)}, −${r.focus.down.toFixed(3)})`],
                        [`Microwave background (${result.early.name})`, (r: LumpinessResult) => `${r.early.value.toFixed(3)} (±${r.early.up.toFixed(3)})`],
                        ['Gap between the two best values', (r: LumpinessResult) => r.gap.toFixed(3)],
                        ['Survey’s give-or-take, side facing the microwave background', (r: LumpinessResult) => r.surveyUncertaintyUsed.toFixed(3)],
                        ['Microwave background’s give-or-take, side facing the survey', (r: LumpinessResult) => r.earlyUncertaintyUsed.toFixed(3)],
                        ['Combined give-or-take', (r: LumpinessResult) => r.combinedUncertainty.toFixed(4)],
                        ['Sigma, worked out here', (r: LumpinessResult) => `${r.tension.toFixed(2)}${r.focus.name.startsWith('DES') ? ' (the number for Prediction 2)' : ''}`],
                        ['The paper’s own comparison (sigma)', (r: LumpinessResult) => r.paperSigma],
                      ] as const
                    ).map(([name, format]) => (
                      <tr key={name} style={{ borderBottom: '1px solid var(--border-color, #ccc)' }}>
                        <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>{name}</td>
                        {results.map((r) => (
                          <td key={r.focus.name} style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                            {format(r)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>S₈ and the microwave-background value.</strong> The survey’s best value with its upward and downward give-or-take, and the microwave-background value {result.early.value} ± {result.early.up}. It matters because
                    everything below is worked out from these two numbers.
                  </li>
                  <li>
                    <strong>The gap and the two give-or-takes.</strong> The gap is the difference of the two best values: {result.gap.toFixed(3)} for {result.focus.name}. The two give-or-takes are the ones on the sides facing each other
                    ({result.surveyUncertaintyUsed} and {result.earlyUncertaintyUsed}), because the bars are longer on one side. It matters because the side facing the other value is the one that can close the gap.
                  </li>
                  <li>
                    <strong>The combined give-or-take.</strong> {result.combinedUncertainty.toFixed(4)}, the doubt about the gap, worked out as in Experiment 1. It matters because it is the yardstick the gap is measured against.
                  </li>
                  <li>
                    <strong>Sigma, worked out here, and the paper’s own.</strong> {result.tension.toFixed(2)} here, and {paperText(result.focus)} in the paper. The two are different on purpose: the paper’s is from
                    fuller statistics and, for DES, a comparison with a combination of microwave-background data. It matters because the simple sigma is a guide to the size of the gap, not the final word.
                  </li>
                </ul>
              </div>

              <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Every measurement</p>
              <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '420px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color, #ccc)', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>Measurement</th>
                      <th style={{ padding: '0.4rem 0.5rem' }}>Year</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>S₈</th>
                      <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>Sigma, worked out here</th>
                      <th style={{ padding: '0.4rem 0 0.4rem 0.5rem', textAlign: 'right' }}>The paper’s own</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MEASUREMENTS.map((m) => (
                      <tr key={m.name} style={{ borderBottom: '1px solid var(--border-color, #ccc)', fontWeight: focusNames.includes(m.name) ? 'bold' : 'normal' }}>
                        <td style={{ padding: '0.4rem 0.5rem 0.4rem 0' }}>
                          {m.name}
                          {m.name.startsWith('KiDS') ? ' (a row for Prediction 1)' : m.name.startsWith('DES') ? ' (a row for Prediction 2)' : ''}
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{m.year}</td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>
                          {m.value.toFixed(3)} (+{m.up.toFixed(3)}, −{m.down.toFixed(3)})
                        </td>
                        <td style={{ padding: '0.4rem 0.5rem', textAlign: 'right' }}>{m.side === 'early' ? '—' : tensionSigma(m, result.early).toFixed(2)}</td>
                        <td style={{ padding: '0.4rem 0 0.4rem 0.5rem', textAlign: 'right' }}>{m.side === 'early' ? '—' : m.paperSigma}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: 0, marginBottom: '1rem' }}>
                <strong>The change in KiDS’s S₈</strong> from KiDS-1000 to KiDS-Legacy: <strong>{sign3(kidsChange)}</strong> (the number for Prediction 1).
              </p>

              <div style={{ color: 'var(--text-muted)' }}>
                <p style={{ margin: '0 0 0.5rem' }}>
                  <strong>What this table tells us.</strong>
                </p>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>
                    <strong>Every measurement side by side.</strong> Each survey’s sigma worked out here sits beside the paper’s own: {LATE_MEASUREMENTS.map((m) => `${m.name} ${tensionSigma(m, result.early).toFixed(2)}`).join(', ')}. The survey
                    you chose in Part 2 is in bold. It matters because the surveys do not all disagree by the same amount, and the page does not say which, if any, is wrong.
                  </li>
                  <li>
                    <strong>The change in KiDS’s S₈</strong> is the later value minus the earlier one, so a plus sign means higher: {sign3(kidsChange)}. It matters because it is the number the first prediction is about.
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <p style={{ marginTop: 0, marginBottom: 0 }}>
                <strong>More to read, now that you have seen the results.</strong> These are the papers and survey pages whose summaries state what the
                predictions ask, so they were kept back until now. They open in a new tab.
              </p>
              <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2503.19441">KiDS-Legacy: cosmological constraints from cosmic shear (Wright et al., 2025)</ExternalLink>
                  : the scientific paper behind the KiDS-Legacy measurement (technical words). It opens on arxiv.org, the free site where scientists
                  post their papers.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2007.15633">KiDS-1000 cosmology: cosmic shear constraints (Asgari et al., 2020)</ExternalLink>
                  : the scientific paper behind the first KiDS measurement (technical words).
                </li>
                <li>
                  <ExternalLink href="https://kids.strw.leidenuniv.nl/">The Kilo-Degree Survey (KiDS) website</ExternalLink>: the survey team’s own
                  page, with its results and papers.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2602.10065">Dark Energy Survey Year 6: cosmic shear (2026)</ExternalLink>: the scientific
                  paper behind the DES measurements (technical words).
                </li>
                <li>
                  <ExternalLink href="https://www.darkenergysurvey.org/des-y6-cosmology-results-papers/">The Dark Energy Survey Year 6 results page</ExternalLink>
                  : the survey team’s own list of its Year 6 papers.
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/1807.06209">Planck 2018 results VI: cosmological parameters</ExternalLink>: the scientific
                  paper that gives the Ωm and σ₈ used in the introduction (technical words).
                </li>
                <li>
                  <ExternalLink href="https://arxiv.org/abs/2602.12238">Status of the S₈ tension: a 2026 review of probe discrepancies (Pantos and Perivolaropoulos)</ExternalLink>
                  : a review that compares many measurements, including KiDS-Legacy and DES Year 6 (technical words).
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* The tutor: observe, compare with the predictions, one conceptual question, then the explanation. The summary below the experiment (in
            App) is shown only once the learner reaches the explanation. */}
        {status === 'complete' && (
          <PartHeader color="#0066cc" title="Part 4: The tutor">
            We are about to talk through your two predictions with the tutor, who will compare them with the results. Three short questions, one at a time. Nothing is graded.
          </PartHeader>
        )}
        {status === 'complete' && shiftPrediction !== null && rangePrediction !== null && (
          <LumpinessTutor
            focus={focusMeasurements[0]}
            shiftPrediction={shiftPrediction}
            rangePrediction={rangePrediction}
            onExplained={() => onTutorComplete?.()}
          />
        )}
      </div>
    </div>
  )
}
