import type { ReactNode } from 'react'
import {
  PLANCK_Z_EQ_RANGE,
  PLANCK_Z_STAR_RANGE,
  TEXTBOOK_LINEAR_COLLAPSE_THRESHOLD,
  captionNumbers,
  checkUp,
  dragRedshiftNote,
  headStartExample,
  startFacts,
  yourRegion,
} from '../physics/structureFormationExperiment'
import type { CheckUpRow, GrowthGuess, HeadStartGuess, KindOfMatter } from '../physics/structureFormationExperiment'
import { GROWTH_GUESS_TEXT, GUESS_COLOR, HEAD_START_GUESS_TEXT, YOUR_COLOR, kindLabels, partsInLabel, redshiftLabel } from './StructureFormationPictures'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 9, Part 3: the results (docs/audit/cosmology/09-draft-wording.md, section 5).
// Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page (CLAUDE.md §12,
// §13). Neither guess changes a table. Only the pink row of Table 2 and "What your numbers show" follow Part 2's two settings.

export interface StructureFormationResultsProps {
  guesses: { growth: GrowthGuess; headStart: HeadStartGuess } | null
  kind: KindOfMatter
  startDelta: number
}

const th = { textAlign: 'left', borderBottom: '2px solid var(--border-color, #ccc)', padding: '0.35rem 0.45rem', fontSize: '0.8125rem' } as const
const cell = { padding: '0.35rem 0.45rem', borderBottom: '1px solid var(--border-color, #ccc)', verticalAlign: 'top', fontSize: '0.8125rem' } as const

function Table({ heads, children }: { heads: ReactNode[]; children: ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: '0.5rem' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem', width: '100%' }}>
        <thead>
          <tr>
            {heads.map((h, i) => (
              <th key={i} style={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>{title}</strong>
      </p>
      <ul style={{ marginTop: 0, paddingLeft: '1.25rem' }}>{children}</ul>
    </div>
  )
}

const whole = (n: number) => Math.round(n).toLocaleString('en-US')
// The start redshifts as the page says them everywhere: 1089.8 and 3,400 (not rounded to 1,090).
const startZ = (z: number) => (Number.isInteger(z) ? z.toLocaleString('en-US') : String(z))
const num = (n: number, digits = 1) => n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export function StructureFormationResults({ guesses, kind, startDelta }: StructureFormationResultsProps) {
  const rows = Object.fromEntries(checkUp().map((r) => [r.id, r])) as Record<CheckUpRow['id'], CheckUpRow>
  const o = startFacts('ordinary')
  const d = startFacts('ordinary-plus-dark')
  const n = captionNumbers()
  const you = yourRegion(kind, startDelta)
  const ex = headStartExample()
  const drag = dragRedshiftNote()
  const youGuess = guesses !== null

  return (
    <div style={{ fontSize: '0.875rem' }}>
      {guesses && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (between the oldest light&rsquo;s release and today): <strong>a slightly denser region would become {GROWTH_GUESS_TEXT[guesses.growth]} denser</strong>. The number it is about is in Table 2, in the &ldquo;Ordinary matter&rdquo; row, &ldquo;Times it grew&rdquo;.
            </li>
            <li>
              <strong>Guess 2</strong> (starting earlier): <strong>{HEAD_START_GUESS_TEXT[guesses.headStart]}</strong>. The numbers it is about are in Table 2, in the &ldquo;Ordinary plus dark matter&rdquo; row, &ldquo;Times it grew&rdquo;, beside the ordinary row.
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}

      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: Check-up, this model against published values (none of these rows depends on your Part 2 settings)</p>
      <Table heads={['What we compare', 'This model', 'Published', 'How they compare']}>
        <tr>
          <td style={cell}>(a) How many times a ripple grows since the oldest light</td>
          <td style={cell}>{num(rows.a.model)}</td>
          <td style={cell}>{num(rows.a.comparedWith!)} (the Carroll, Press and Turner approximation, for 0.3 and 0.7)</td>
          <td style={cell}>
            <strong>
              {rows.a.reading}, by {num(Math.abs(rows.a.difference!))} ({num(Math.abs(rows.a.percent!), 2)} percent)
            </strong>
            ; the formula is itself an approximation
          </td>
        </tr>
        <tr>
          <td style={cell}>(b) The same growth, with dark energy against without</td>
          <td style={cell}>
            {num(rows.b.model)} against {num(rows.b.comparedWith!)}
          </td>
          <td style={cell}>none: a calculated comparison</td>
          <td style={cell}>
            <strong>
              {rows.b.reading}, by {num(Math.abs(rows.b.percent!))} percent
            </strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(c) The head start</td>
          <td style={cell}>
            {num(rows.c.model)} against {num(rows.c.comparedWith!)}
          </td>
          <td style={cell}>none: calculated here only</td>
          <td style={cell}>
            <strong>a factor of {num(rows.c.factor!, 2)}</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(d) The oldest light&rsquo;s redshift</td>
          <td style={cell}>{rows.d.model}</td>
          <td style={cell}>
            {PLANCK_Z_STAR_RANGE.low.toFixed(2)} ± 0.21 (Planck 2018, with BAO); {PLANCK_Z_STAR_RANGE.high.toFixed(2)} and 1089.92 in the other two columns
          </td>
          <td style={cell}>
            <strong>{rows.d.reading}</strong>
          </td>
        </tr>
        <tr>
          <td style={cell}>(e) When matter began to outweigh radiation, as a redshift</td>
          <td style={cell}>{whole(rows.e.model)}</td>
          <td style={cell}>
            {whole(PLANCK_Z_EQ_RANGE.low)} ± 21, 3,402 ± 26 and {whole(PLANCK_Z_EQ_RANGE.high)} ± 31 (Planck 2018)
          </td>
          <td style={cell}>
            <strong>{rows.e.reading}</strong>
          </td>
        </tr>
      </Table>

      <Note title="What this table tells us">
        <li>
          <strong>(a) What it is:</strong> the model&rsquo;s growth for ordinary matter, beside an independent published approximation. <strong>What it means:</strong> {num(rows.a.model)} against {num(rows.a.comparedWith!)}, {num(Math.abs(rows.a.difference!))} ({num(Math.abs(rows.a.percent!), 2)} percent) apart. <strong>Why it matters:</strong> two different methods agree, so the number is not an accident of this model&rsquo;s integral. <strong>How sure:</strong> the approximation is itself approximate and its accuracy was not read; the 1992 paper itself was not read.
        </li>
        <li>
          <strong>(b) What it is:</strong> the growth with dark energy, beside the growth with none (which is exactly the universe&rsquo;s growth in size, 1 + z). <strong>What it means:</strong> dark energy takes away {num(Math.abs(rows.b.percent!))} percent. <strong>Why it matters:</strong> it is the late flattening you see in the graph, and the thread picked up in Cosmology 10.
        </li>
        <li>
          <strong>(c) What it is:</strong> how much more the earlier start grows. <strong>What it means:</strong> {num(rows.c.factor!, 2)} times. <strong>Why it matters:</strong> it is the head start; whether it decides an outcome depends on the starting size (Picture 4).
        </li>
        <li>
          <strong>(d) What it is:</strong> the redshift of the oldest light that this experiment uses as the start of ordinary matter&rsquo;s growth. <strong>What it means:</strong> it lies inside the range Planck gives. <strong>Why it matters:</strong> it fixes where the amber line starts. <strong>How sure:</strong> ordinary matter is released from the light a little later, at the baryon drag redshift of about {whole(drag.dragRedshift)} (Planck 2018); starting there would give about {num(drag.growthFromDrag)}, {num(drag.percentLess)} percent less than {num(drag.growthFromOldestLight)}.
        </li>
        <li>
          <strong>(e) What it is:</strong> the given redshift where dark matter&rsquo;s start is set. <strong>What it means:</strong> it lies inside the range Planck gives. <strong>Why it matters:</strong> it fixes where the violet line starts. <strong>How sure:</strong> the model leaves radiation out, so its own times for these starts are rough ({n.ordinaryStartThousandYears} thousand and {n.darkStartThousandYears} thousand years).
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 2: The starts and your own region (calculated here; the pink row follows your Part 2 settings)</p>
      <Table heads={['', 'Starts at redshift (time after the Big Bang)', 'Times it grew by today', 'Without dark energy', 'Starting size needed to be a clump']}>
        <tr>
          <td style={cell}>Ordinary matter</td>
          <td style={cell}>
            {startZ(o.startRedshift)} (about {n.ordinaryStartThousandYears} thousand years)
          </td>
          <td style={cell}>
            {num(o.growthSinceStart)} {youGuess && <GuessTag />}
          </td>
          <td style={cell}>{num(o.growthWithoutDarkEnergy)}</td>
          <td style={cell}>{partsInLabel(o.requiredStartDelta)}</td>
        </tr>
        <tr>
          <td style={cell}>Ordinary plus dark matter</td>
          <td style={cell}>
            {startZ(d.startRedshift)} (about {n.darkStartThousandYears} thousand years)
          </td>
          <td style={cell}>
            {num(d.growthSinceStart)} {youGuess && <GuessTag />}
          </td>
          <td style={cell}>{num(d.growthWithoutDarkEnergy)}</td>
          <td style={cell}>{partsInLabel(d.requiredStartDelta)}</td>
        </tr>
        <tr style={{ backgroundColor: 'rgba(244, 114, 182, 0.12)' }}>
          <td style={cell}>
            <strong style={{ color: YOUR_COLOR }}>Your region</strong> ({kindLabels[kind].toLowerCase()})
          </td>
          <td style={cell}>{startZ(you.startRedshift)}</td>
          <td style={cell}>{num(you.growthSinceStart)}</td>
          <td style={cell}>{num(you.growthWithoutDarkEnergy)}</td>
          <td style={cell}>{partsInLabel(you.requiredStartDelta)}</td>
        </tr>
      </Table>
      <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>
        <strong>Your region:</strong> starting size {partsInLabel(startDelta)}, density excess today {you.densityExcessToday.toPrecision(2)},{' '}
        {you.becameClump ? `it became a clump at redshift about ${redshiftLabel(you.redshiftOfClump ?? 0)}.` : 'it did not become a clump.'}
      </p>
      {youGuess && <p style={smallNote}>The tags mark where each guess is about (both in the &ldquo;Times it grew&rdquo; column). They show the guess only, not whether it is right.</p>}

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> How much a ripple grows for each start, and how big it must start to become a clump, with your own region beside them.
        </li>
        <li>
          <strong>What it means with the real numbers.</strong> Ordinary matter grows {num(o.growthSinceStart)} times and needs a start of {partsInLabel(o.requiredStartDelta)}; with the earlier start the growth is {num(d.growthSinceStart)} and it needs only {partsInLabel(d.requiredStartDelta)}. A start of {partsInLabel(ex.startDelta)} lies between them: it becomes a clump only with the earlier start (density excess {num(ex.darkExcessToday, 2)} against {num(ex.ordinaryExcessToday, 2)} today).
        </li>
        <li>
          <strong>Why it matters.</strong> It shows how big the starting ripple must be, and how much the earlier start helps.
        </li>
        <li>
          <strong>How sure.</strong> The model counts a density excess of 1 as a clump; the usual textbook figure for the linear value at which a region collapses is about {TEXTBOOK_LINEAR_COLLAPSE_THRESHOLD} (arXiv:1005.0233, for a universe with matter only), so the clump times here are approximate. The oldest light&rsquo;s 1 part in 100,000 is a temperature difference and is not compared with these sizes.
        </li>
      </Note>

      <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', border: `1px solid ${YOUR_COLOR}`, borderRadius: '6px', fontSize: '0.875rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What your numbers show.</strong> With <strong>{kindLabels[kind].toLowerCase()}</strong> and a starting size of <strong>{partsInLabel(startDelta)}</strong>, your region grows <strong>{num(you.growthSinceStart)}</strong> times and ends today at a density excess of <strong>{you.densityExcessToday.toPrecision(2)}</strong>:{' '}
          <strong>{you.becameClump ? `it becomes a clump at redshift about ${redshiftLabel(you.redshiftOfClump ?? 0)}` : 'it does not become a clump'}</strong>. For this kind of matter the size needed is <strong>{partsInLabel(you.requiredStartDelta)}</strong>; yours is{' '}
          <strong>{you.againstRequired === 'the same' ? 'the same' : `${you.againstRequired} than that`}</strong>.
        </p>
        <p style={{ margin: 0, fontSize: '0.8125rem' }}>
          <strong>These are trial values and your own numbers. They do not say the real universe started that way.</strong>
        </p>
      </div>

      <div style={{ marginTop: '1.5rem', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: 'rgba(15, 118, 110, 0.08)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#0f766e' }}>What this model simplifies</p>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
          <li>It is the same simplified universe as Cosmology 5, 6 and 8: flat, with matter and a constant dark energy, an illustrative Hubble constant of 70, and no radiation.</li>
          <li>Only the first, simple stage of growth is modelled, for a region that is still only slightly denser than average. Pressure, gas cooling, star formation and mergers of clumps are not.</li>
          <li>A single region is followed on its own, and the model says when it would become a clump, not what the clump looks like. The green glow is only an illustration.</li>
        </ul>
      </div>
    </div>
  )
}
