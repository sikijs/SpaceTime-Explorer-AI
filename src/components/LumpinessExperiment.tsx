import type { ReactNode } from 'react'
import { EARLY_MEASUREMENT, PLANCK_OWN, s8 } from '../physics/lumpiness'

// Frontier and Beyond, Experiment 3 (docs/experiments/frontier-and-beyond/03-how-lumpy-is-the-universe.md).
// Step 2 builds the status label, the introduction with its "Want to know more?" links, and Picture 1 (the microwave-background prediction on
// the S8 number line) with its guide. The predictions, Run, the survey measurements, Pictures 2 and 3, the "Look closer at" control, the results,
// the "Words and formulas" panel and the tutor come in later steps. All wording here is draft wording for the owner's review (CLAUDE.md §28.1),
// written to the standard of §29. The interface only displays numbers from src/physics/lumpiness.ts (CLAUDE.md §9); the only calculation here
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
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'

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
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>What to look for, and what it would mean:</p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>The jump from panel B to panel C.</strong> In B the lean is hidden in the crowd. In C, averaging many galaxies makes it
            clear. This is the whole trick of weak lensing.
          </li>
          <li>
            <strong>The orange lines go round the bump.</strong> So a pattern of lines going round a spot tells you there is matter there, even
            though nothing is visible.
          </li>
          <li>
            <strong>The grey lines are almost points.</strong> With no matter in the way, the average has no direction, which is why a lean
            that does show up can be trusted as a signal.
          </li>
        </ul>
      </div>
    </div>
  )
}

export function LumpinessExperiment(_props: LumpinessExperimentProps) {
  const early = EARLY_MEASUREMENT
  const planckFromParts = s8(PLANCK_OWN.sigma8, PLANCK_OWN.omegaMatter)
  const planckY = 76
  const axisY = 134

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
                microwave background’s own published ingredients: the Planck satellite found Ωm = {PLANCK_OWN.omegaMatter} and σ₈ ={' '}
                {PLANCK_OWN.sigma8}. So Ωm ÷ 0.3 = {(PLANCK_OWN.omegaMatter / 0.3).toFixed(3)}, its square root is{' '}
                {Math.sqrt(PLANCK_OWN.omegaMatter / 0.3).toFixed(4)}, and S₈ = {PLANCK_OWN.sigma8} × {Math.sqrt(PLANCK_OWN.omegaMatter / 0.3).toFixed(4)} ={' '}
                {planckFromParts.toFixed(3)}. (Different analyses of the same microwave-background data give values that differ in the third
                decimal. This page uses {early.value}, the value the Kilo-Degree Survey team compares its own result with.)
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

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions about surveys that measured S₈ by lensing, press Run, and then look
            closer at the survey you choose. Nothing here is graded.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> Each published “give or take” is treated as a simple error bar, and two measurements as independent,
            as in Experiment 1. The surveys publish different upward and downward uncertainties, so for each comparison we use the one on the side
            facing the other value. The scientists’ own papers use more careful statistics, so the sigma they quote can differ from the one
            worked out here, and we show both. We show a few published measurements, not all of them. And this experiment cannot tell you which
            measurement, if any, is wrong.
          </p>

          <p style={{ marginTop: 0, marginBottom: 0 }}>
            <strong>Want to know more?</strong> These are the original scientific papers and official pages. Links open in a new tab. This page
            was written as of October 2026.
          </p>
          <ul style={{ margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://arxiv.org/abs/2503.19441">KiDS-Legacy: cosmological constraints from cosmic shear (Wright et al., 2025)</ExternalLink>
              : the scientific paper behind one of the measurements (technical words). It opens on arxiv.org, the free site where scientists
              post their papers.
            </li>
            <li>
              <ExternalLink href="https://kids.strw.leidenuniv.nl/">The Kilo-Degree Survey (KiDS) website</ExternalLink>: the survey team’s own page,
              with its results and papers.
            </li>
            <li>
              <ExternalLink href="https://arxiv.org/abs/2602.10065">Dark Energy Survey Year 6: cosmic shear (2026)</ExternalLink>: the scientific
              paper behind another of the measurements (technical words).
            </li>
            <li>
              <ExternalLink href="https://www.darkenergysurvey.org/des-y6-cosmology-results-papers/">The Dark Energy Survey Year 6 results page</ExternalLink>
              : the survey team’s own list of its Year 6 papers.
            </li>
          </ul>
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

        {/* Picture 1: the microwave-background prediction on the S8 number line. The surveys' measurements are added at Run (a later step). */}
        <div style={{ marginBottom: '1rem' }}>
          <svg
            width={VIEW_WIDTH}
            height={190}
            viewBox={`0 0 ${VIEW_WIDTH} 190`}
            style={svgStyle}
            role="img"
            aria-label="Number line of S8: the microwave-background prediction with its error bar"
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
            <line
              x1={xOf(early.value - early.down)}
              y1={planckY}
              x2={xOf(early.value + early.up)}
              y2={planckY}
              stroke={EARLY_COLOR}
              strokeWidth={3}
            />
            <circle cx={xOf(early.value)} cy={planckY} r={5} fill={EARLY_COLOR} />
            <text x={xOf(early.value) - 24} y={planckY - 14} fill={EARLY_COLOR} fontSize="12" textAnchor="middle">
              {early.name} (microwave background): {early.value} ± {early.up}
            </text>
            <text x={AXIS_LEFT} y={planckY + 6} fill={MUTED_COLOR} fontSize="11">
              the surveys’ values appear here
            </text>
            <text x={AXIS_LEFT} y={planckY + 20} fill={MUTED_COLOR} fontSize="11">
              when Run is built (a later step)
            </text>
          </svg>
        </div>

        {/* Picture 1's guide: draft wording (CLAUDE.md §14 and §29) for the owner's review (§28.1). It does not say where any survey's value
            lies relative to the microwave background. */}
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
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
              <strong>The grey words on the left:</strong> the place where the surveys’ values will be drawn after you press Run. Each survey will
              be an <strong>orange</strong> dot with its own bar, labelled with its name. Because the surveys publish different upward and
              downward “give or takes”, an orange bar can be longer on one side than the other.
            </li>
          </ul>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>What to look for, and what it would mean:</p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>How far a survey’s dot is from the sky-blue dot, compared with the length of the bars.</strong> If the gap is small compared
              with the bars together, the two measurements agree. If it is several bars wide, they do not.
            </li>
            <li>
              <strong>Whether the bars overlap.</strong> Overlapping bars mean the two measurements could both be right. But overlap alone is not
              the whole story: the sigma, which comes later in this experiment, puts a number on it.
            </li>
            <li>
              <strong>Which side of the sky-blue dot a survey’s dot is on.</strong> Left means a smoother universe than the microwave background
              predicts, right a lumpier one.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
