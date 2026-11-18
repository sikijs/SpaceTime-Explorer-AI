import type { ReactNode } from 'react'
import {
  PART_ONE_PRESET_ID,
  PART_ONE_SPIN,
  checkUp,
  energyReleasedSteps,
  runSpinningBlackHoleExperiment,
} from '../physics/spinningBlackHoleExperiment'
import type { CheckUpRow, EdgeAnswer, EnergyAnswer, HorizonAnswer, SpinningBlackHoleResult } from '../physics/spinningBlackHoleExperiment'
import { edgeLabel, energyLabel, horizonLabel } from './SpinningBlackHoleChoices'
import { formatDistance, formatLength, formatNumber, formatPercent, formatRadii } from './SpinningBlackHolePictures'
import { RealSpinningBlackHoles } from './SpinningBlackHoleIntro'
import { listStyle } from './TidalEffectExperiment'

// Black Holes, Experiment 8 (audit update): Part 3, the results (docs/audit/black-holes-and-strong-gravity/08-draft-wording.md, section 7). Nothing
// here changes with a guess. The guesses are shown beside the results, never marked right or wrong (that is the tutor's job, CLAUDE.md §12, §13).
// Every number comes from the physics module; the interface only formats it (§9). The parent mounts this only after the first Run.

const four = (v: number) => v.toFixed(4)

const cell = { padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' } as const
const headCell = { ...cell, textAlign: 'left', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-color, #ccc)' } as const
const tableStyle = { fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' } as const
const tableLead = { fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' } as const
const noteParagraph = { marginTop: 0, marginBottom: '0.4rem' } as const

function Note({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
      <p style={noteParagraph}>
        <strong>What this table tells us</strong>
      </p>
      {children}
    </div>
  )
}

function Scroll({ children }: { children: ReactNode }) {
  return <div style={{ overflowX: 'auto', maxWidth: '100%' }}>{children}</div>
}

// A small white tag on the row where a guess's number appears. It shows the guess only, never "right" or "wrong".
function Tag({ n }: { n: number }) {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0b1020',
        border: '1px solid #ffffff',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      your guess {n}
    </span>
  )
}

const SPIN_PRESETS = [0, 0.5, 0.9, 0.99]

// What each check-up row compares, in plain words, and how its numbers are shown.
const CHECK_LABELS: Record<CheckUpRow['id'], { what: string; unit: 'radii' | 'percent' }> = {
  noSpinLastSafe: { what: 'Last safe orbit with no spin, against Black Holes 3 (3 reference radii)', unit: 'radii' },
  noSpinHorizon: { what: 'Horizon with no spin, against Black Holes 1 (1 reference radius)', unit: 'radii' },
  noSpinEnergy: { what: 'Energy given up with no spin, against 1 − √(8 ÷ 9)', unit: 'percent' },
  energyWith: { what: 'Energy given up circling with the spin, by the second route', unit: 'percent' },
  energyAgainst: { what: 'Energy given up circling against the spin, by the second route', unit: 'percent' },
  withOutsideHorizon: { what: 'Last safe orbit circling with the spin, against the horizon', unit: 'radii' },
  againstOutsideHorizon: { what: 'Last safe orbit circling against the spin, against the horizon', unit: 'radii' },
}

export interface SpinningBlackHoleResultsProps {
  withGuess: EdgeAnswer
  againstGuess: EdgeAnswer
  horizonGuess: HorizonAnswer
  energyGuess: EnergyAnswer
  partTwo: SpinningBlackHoleResult | null
}

export function SpinningBlackHoleResults({ withGuess, againstGuess, horizonGuess, energyGuess, partTwo }: SpinningBlackHoleResultsProps) {
  const run = runSpinningBlackHoleExperiment(PART_ONE_PRESET_ID, PART_ONE_SPIN)
  const km = run.referenceRadiusKm
  const rows = checkUp(PART_ONE_SPIN)
  const spinRows = SPIN_PRESETS.map((s) => runSpinningBlackHoleExperiment(PART_ONE_PRESET_ID, s))
  // The worked calculations use the learner's own run when there is one, and Part 1's fixed run otherwise.
  const math = partTwo ?? run
  const mathKm = math.referenceRadiusKm
  const withSteps = energyReleasedSteps(math.spin, 'with')
  const againstSteps = energyReleasedSteps(math.spin, 'against')
  const holeLabel = math.preset.label.replace(/^A /, 'a ')
  const ownHole = partTwo ? partTwo.preset.label.replace(/^A /, 'a ') : ''

  const show = (row: CheckUpRow, value: number) => (CHECK_LABELS[row.id].unit === 'percent' ? formatPercent(value) : formatRadii(value))

  return (
    <div>
      <p style={{ marginTop: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Every number in these tables is calculated from the equations given on this page. The words “the same”, “more” and “less” are this page’s own, not an official scale.
      </p>

      <div
        style={{
          margin: '0 0 1.25rem',
          padding: '0.75rem 1rem',
          border: '1px solid #ffffff',
          borderRadius: '8px',
          backgroundColor: '#0b1020',
          color: '#e2e8f0',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Your guesses, beside the results.</strong> They are shown as you made them, and nothing here says whether they are right. The tutor does that. Find the row with the white “your guess” tag in Table 2 to see the number each guess is about.
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Guess 1:</strong> {edgeLabel(withGuess)}. The question was: for a probe circling with the spin, where is the last safe orbit, compared with no spin? Its number is the “circling with the spin” row of Table 2. <Tag n={1} />
          </li>
          <li>
            <strong>Guess 2:</strong> {edgeLabel(againstGuess)}. The question was the same, for a probe circling against the spin. Its number is the “circling against the spin” row. <Tag n={2} />
          </li>
          <li>
            <strong>Guess 3:</strong> {horizonLabel(horizonGuess)}. The question was: as the black hole spins faster, what happens to the horizon? Its number is the “horizon” row. <Tag n={3} />
          </li>
          <li>
            <strong>Guess 4:</strong> {energyLabel(energyGuess)}. The question was: which probe gives up more energy on the way down? Its numbers are the two energy figures in the “circling with” and “circling against” rows. <Tag n={4} />
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: A check-up on the calculation</h4>
      <p style={tableLead}>
        Each row sets what we expect (an earlier experiment’s value, or a separate route to the same number) beside what the calculation gives, with a plain reading. The last two rows are for the spin of Part 1, {PART_ONE_SPIN}.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>What we compared</th>
              <th style={headCell}>Expected</th>
              <th style={headCell}>This calculation gives</th>
              <th style={headCell}>Reading</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td style={cell}>{CHECK_LABELS[row.id].what}</td>
                <td style={cell}>{show(row, row.expected)}</td>
                <td style={cell}>
                  <strong>{show(row, row.found)}</strong>
                </td>
                <td style={cell}>
                  <strong>{row.reading}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>No spin gives back the earlier values.</strong> <em>What it is:</em> the three “no spin” rows put the spinning-black-hole equations at a spin of 0 beside Black Holes 3’s last safe orbit (3 reference radii), Black Holes 1’s horizon (1 reference radius) and the energy 1 − √(8 ÷ 9). <em>What it means:</em> the equations give {formatRadii(rows[0].found)}, {formatRadii(rows[1].found)} and {formatPercent(rows[2].found)}: the same. <em>Why it matters:</em> it shows these equations agree with the ones you already
          trust when the black hole does not spin.
        </p>
        <p style={noteParagraph}>
          <strong>The energy two ways.</strong> <em>What it is:</em> the share of rest-mass energy a probe gives up can be worked out from the energy of a circular orbit (the page’s main route) or, at the last safe orbit, from the shorter formula 1 − √(1 − 2 ÷ (3 r)). <em>What it means:</em> at a spin of {PART_ONE_SPIN} the two routes give {formatPercent(rows[3].found)} and {formatPercent(rows[3].expected)} with the spin, and {formatPercent(rows[4].found)} and {formatPercent(rows[4].expected)} against it: the same. <em>Why it matters:</em> two different routes agreeing is a check that the calculation was done correctly.
        </p>
        <p style={noteParagraph}>
          <strong>The last safe orbit stays outside the horizon.</strong> <em>What it is:</em> a probe circling at the last safe orbit must not be inside the black hole. <em>What it means:</em> at a spin of {PART_ONE_SPIN} the last safe orbits are {formatRadii(rows[5].found)} (with the spin) and {formatRadii(rows[6].found)} (against it), and the horizon is {formatRadii(rows[5].expected)}: both outside. <em>Why it matters:</em> a probe cannot circle at a distance
          inside the horizon.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure these are.</strong> <em>What it is:</em> every “expected” number comes from the same theory or from earlier experiments of this project, so the check is of the calculation against itself, not of nature. <em>What it means:</em> no published measurement of the last safe orbit or of the energy share was read for this page, so none is claimed. <em>Why it matters:</em> “the same” says the calculation is consistent, not that a real black hole behaves like this.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: The run of Part 1</h4>
      <p style={tableLead}>
        {run.preset.label} ({formatNumber(run.preset.massSolarMasses)} Suns), spun up to a spin of {run.spin}. One reference radius is {formatDistance(km)}.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['', 'In reference radii', 'In kilometers', 'Energy given up on the way down'].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>
                The horizon <Tag n={3} />
              </td>
              <td style={cell}>
                <strong>{formatRadii(run.horizon)}</strong>
              </td>
              <td style={cell}>{formatDistance(run.horizon * km)}</td>
              <td style={cell}>—</td>
            </tr>
            <tr>
              <td style={cell}>
                Last safe orbit, circling with the spin <Tag n={1} />
              </td>
              <td style={cell}>
                <strong>{formatRadii(run.lastSafeWith)}</strong>
              </td>
              <td style={cell}>{formatDistance(run.lastSafeWith * km)}</td>
              <td style={cell}>
                <strong>{formatPercent(run.energyReleasedWith)}</strong> <Tag n={4} />
              </td>
            </tr>
            <tr>
              <td style={cell}>
                Last safe orbit, circling against the spin <Tag n={2} />
              </td>
              <td style={cell}>
                <strong>{formatRadii(run.lastSafeAgainst)}</strong>
              </td>
              <td style={cell}>{formatDistance(run.lastSafeAgainst * km)}</td>
              <td style={cell}>
                <strong>{formatPercent(run.energyReleasedAgainst)}</strong> <Tag n={4} />
              </td>
            </tr>
            <tr>
              <td style={cell}>Last safe orbit with no spin (Black Holes 3)</td>
              <td style={cell}>
                <strong>{formatRadii(run.noSpinLastSafe)}</strong>
              </td>
              <td style={cell}>{formatDistance(run.noSpinLastSafe * km)}</td>
              <td style={cell}>
                <strong>{formatPercent(run.noSpinEnergyReleased)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>What it is.</strong> The numbers behind the three pictures of Part 1: the horizon, the two last safe orbits, the no-spin reference, and the energy a probe gives up on its way down.
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> At a spin of {run.spin}, the horizon is at {formatRadii(run.horizon)} reference radii, where with no spin it is at 1. The last safe orbit is at {formatRadii(run.lastSafeWith)} for a probe circling with the spin and {formatRadii(run.lastSafeAgainst)} for one circling against it, where with no spin it is at {run.noSpinLastSafe}. The probes give up {formatPercent(run.energyReleasedWith)} and {formatPercent(run.energyReleasedAgainst)} of their rest-mass energy, where with no spin the share is {formatPercent(run.noSpinEnergyReleased)}.
        </p>
        <p style={noteParagraph}>
          <strong>Why it matters.</strong> It is one black hole, with one mass, described at one spin: so each difference from the no-spin row comes from the spin and from nothing else. The tutor goes through how your guesses compare.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> These numbers are calculated here from the given equations, for a small probe in the flat sheet through the equator. The 10-Sun mass is an illustrative round value.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: Your own run</h4>
      {partTwo ? (
        <>
          <p style={tableLead}>
            {ownHole} ({formatNumber(partTwo.preset.massSolarMasses)} Suns), spun up to a spin of {partTwo.spin}. One reference radius is {formatDistance(partTwo.referenceRadiusKm)}.
          </p>
          <Scroll>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {['', 'In reference radii', 'In kilometers', 'Energy given up on the way down'].map((h) => (
                    <th key={h} style={headCell}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['The horizon', partTwo.horizon, null],
                  ['Last safe orbit, circling with the spin', partTwo.lastSafeWith, partTwo.energyReleasedWith],
                  ['Last safe orbit, circling against the spin', partTwo.lastSafeAgainst, partTwo.energyReleasedAgainst],
                  ['Last safe orbit with no spin (Black Holes 3)', partTwo.noSpinLastSafe, partTwo.noSpinEnergyReleased],
                ].map(([label, radii, energy]) => (
                  <tr key={label as string}>
                    <td style={cell}>{label as string}</td>
                    <td style={cell}>
                      <strong>{formatRadii(radii as number)}</strong>
                    </td>
                    <td style={cell}>{formatDistance((radii as number) * partTwo.referenceRadiusKm)}</td>
                    <td style={cell}>{energy === null ? '—' : <strong>{formatPercent(energy as number)}</strong>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>
          <Note>
            <p style={noteParagraph}>
              <strong>What it is.</strong> The same kinds of number as Table 2, for the black hole and the spin you chose.
            </p>
            <p style={noteParagraph}>
              <strong>What it means.</strong> At a spin of {partTwo.spin} the horizon is at {formatRadii(partTwo.horizon)}, the last safe orbits are at {formatRadii(partTwo.lastSafeWith)} (with the spin) and {formatRadii(partTwo.lastSafeAgainst)} (against it), and the energy shares are {formatPercent(partTwo.energyReleasedWith)} and {formatPercent(partTwo.energyReleasedAgainst)}.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Why it matters.</strong> Try the same spin on another black hole: the numbers in reference radii are the same, and only the kilometers change. These are trial values: your own numbers, not a claim that a real black hole is like this.
            </p>
          </Note>
        </>
      ) : (
        <p style={{ ...tableLead, fontWeight: 'bold' }}>Not run yet. Choose a black hole and a spin in Part 2, then press Run your choice. Your own numbers appear here.</p>
      )}

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 4: How the spins compare</h4>
      <p style={tableLead}>The same numbers for four spins. They are the same for all three black holes, because distances are in reference radii.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Spin', 'Horizon', 'Last safe orbit, with the spin', 'Last safe orbit, against the spin', 'Energy given up, with / against'].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spinRows.map((row) => (
              <tr key={row.spin} style={row.spin === (partTwo ?? run).spin ? { fontWeight: 'bold' } : undefined}>
                <td style={cell}>{row.spin}</td>
                <td style={cell}>{formatRadii(row.horizon)}</td>
                <td style={cell}>{formatRadii(row.lastSafeWith)}</td>
                <td style={cell}>{formatRadii(row.lastSafeAgainst)}</td>
                <td style={cell}>
                  {formatPercent(row.energyReleasedWith)} / {formatPercent(row.energyReleasedAgainst)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>What it is.</strong> The horizon, the two last safe orbits and the two energy shares at spins 0, 0.5, 0.9 and 0.99, with the row of the run you are reading in bold.
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> The first row (spin 0) is {formatRadii(spinRows[0].horizon)}, {formatRadii(spinRows[0].lastSafeWith)}, {formatRadii(spinRows[0].lastSafeAgainst)} and {formatPercent(spinRows[0].energyReleasedWith)}: the values of Black Holes 1 and 3. The last row (spin 0.99) is {formatRadii(spinRows[3].horizon)}, {formatRadii(spinRows[3].lastSafeWith)}, {formatRadii(spinRows[3].lastSafeAgainst)} and {formatPercent(spinRows[3].energyReleasedWith)} / {formatPercent(spinRows[3].energyReleasedAgainst)}.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Why it matters.</strong> It lets you read across the whole range of spins at once, instead of one run at a time. The numbers come from the given equations.
        </p>
      </Note>

      <p style={{ marginBottom: '0.25rem' }}>
        <strong>The simple math: how far apart the two edges are.</strong> The map’s distances are in reference radii, so to get kilometers, multiply by the length of one reference radius ({formatLength(mathKm)} for {holeLabel}). At a spin of {math.spin}:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
        <li>
          With the spin: about {formatRadii(math.lastSafeWith)} × {formatLength(mathKm)} = <strong>{formatDistance(math.lastSafeWith * mathKm)}</strong> from the center.
        </li>
        <li>
          Against the spin: about {formatRadii(math.lastSafeAgainst)} × {formatLength(mathKm)} = <strong>{formatDistance(math.lastSafeAgainst * mathKm)}</strong> from the center.
        </li>
        <li>
          How many times farther out the second is: {four(math.lastSafeAgainst)} ÷ {four(math.lastSafeWith)} = <strong>{formatNumber(math.lastSafeAgainst / math.lastSafeWith)}</strong>.
        </li>
      </ol>

      <p style={{ marginBottom: '0.25rem' }}>
        <strong>The simple math: the energy given up.</strong> The formulas work in a unit M, which is half a reference radius (the horizon of a black hole that does not spin is at 2M). A probe in a circular orbit at distance r (in units of M) has an energy E, as a share of its rest-mass energy, of{' '}
        <strong>(1 − 2/r + a/r^(3/2)) ÷ √(1 − 3/r + 2a/r^(3/2))</strong>, where a is the spin. This is given, not derived. For a probe circling against the spin, the sign of the a terms is minus. The probe gives up <strong>1 − E</strong> on its way down from far away, where E is the value at its last safe orbit. At a spin of {math.spin}:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
        <li>
          With the spin: the last safe orbit is at r = {four(withSteps.lastSafeInM)} M. The spin term is {four(withSteps.spinTerm)}, the top is {four(withSteps.numerator)}, the bottom is {four(withSteps.denominator)}, so E = {four(withSteps.energy)} and the share given up is <strong>{formatPercent(withSteps.released)}</strong>.
        </li>
        <li>
          Against the spin: the last safe orbit is at r = {four(againstSteps.lastSafeInM)} M. The spin term is {four(againstSteps.spinTerm)}, the top is {four(againstSteps.numerator)}, the bottom is {four(againstSteps.denominator)}, so E = {four(againstSteps.energy)} and the share given up is <strong>{formatPercent(againstSteps.released)}</strong>.
        </li>
      </ol>

      <p>
        <strong>A comparison from daily life.</strong> A ball rolling down a hill gives up more of its stored energy the farther down it goes before it stops. A last safe orbit that is closer in is like a stopping point farther down the hill, so a probe that gets there has given up more energy. This is only a comparison for how the size of the energy depends on how far in the probe gets: the actual numbers come from the formulas above. It does not explain why the last safe orbit moves.
      </p>

      <RealSpinningBlackHoles />

      <div
        style={{
          margin: '0.75rem 0',
          padding: '0.75rem 1rem',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
        }}
      >
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What this model can and cannot tell you.</strong> This is a thought experiment about a small probe circling in the flat sheet through the black hole’s equator. It places the horizon and the two last safe orbits using given formulas. It does not follow a probe’s path, it does not show how a probe could be put into such an orbit, and it does not cover orbits tilted away from the equator. The energy figure is for a probe that slowly spirals down through safe circular orbits from far away. It does not say where that energy goes, or how a real black hole’s surroundings behave.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The equations are given, not derived, and are for a spinning black hole with no electric charge. They were not checked against the original papers for this page; the numbers were checked against an independent recalculation. The spin is kept below 1, because the equations describe spins up to, but not including, 1. The stellar black hole’s mass of 10 Suns is an illustrative round value. The experiment stops at the horizon: nothing inside is modeled.
        </p>
      </div>
    </div>
  )
}
