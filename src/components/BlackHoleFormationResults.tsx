import type { ReactNode } from 'react'
import {
  CHANDRASEKHAR_LIMIT_SOLAR_MASSES,
  HORIZON_KM_PER_SOLAR_MASS,
  NEUTRON_STAR_RADIUS_KM,
  PART_ONE_MASS,
  PUBLISHED,
  SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES,
  SURE_NEUTRON_STAR_TOP_SOLAR_MASSES,
  checkUp,
  runBlackHoleFormationExperiment,
  whiteDwarfRadiusSteps,
} from '../physics/blackHoleFormationExperiment'
import type { CheckUpRow, CoreResult, LimitAnswer, SizeAnswer, ThresholdAnswer } from '../physics/blackHoleFormationExperiment'
import { limitLabel, sizeLabel, thresholdLabel } from './BlackHoleFormationChoices'
import { OUTCOME_NAME, formatKm, formatNumber, formatRatio } from './BlackHoleFormationPictures'
import { RealDeadStars } from './BlackHoleFormationIntro'
import { listStyle } from './TidalEffectExperiment'

// Black Holes, Experiment 9 (audit update): Part 3, the results (docs/audit/black-holes-and-strong-gravity/09-draft-wording.md, section 7). Nothing here
// changes with a guess. The guesses are shown beside the results, never marked right or wrong (that is the tutor's job, CLAUDE.md §12, §13). Every number
// comes from the physics module; the interface only formats it (§9). The parent mounts this only after the first Run.

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

const MASS_PRESETS = [0.6, 1.0, 1.4, 1.8, 2.5, 3.5, 10]

const heldUpText = (r: CoreResult) => (r.heldUpRadiusKm === null ? 'none: nothing known holds it' : `${formatKm(r.heldUpRadiusKm)}${r.outcome === 'uncertain' ? ' if it holds' : ''}`)
const ratioText = (r: CoreResult) => (r.radiusOverHorizon === null ? '—' : formatRatio(r.radiusOverHorizon))

// What each check-up row compares, in plain words, and how its numbers are written.
function checkUpText(row: CheckUpRow): { what: string; page: string; published: string; reading: string } {
  const gap = row.percentGap === null ? '' : ` by about ${Math.abs(row.percentGap).toFixed(0)}%`
  const reading = row.reading === 'the same' || row.reading === 'inside the measured ranges' ? row.reading : `${row.reading}${gap}`
  switch (row.id) {
    case 'chandrasekhar':
      return { what: 'The most mass a white dwarf can have (the Chandrasekhar limit)', page: `${row.page} Suns`, published: `${PUBLISHED.chandrasekharLimitSolarMasses} Suns (NASA, “White Dwarfs”)`, reading: row.reading === 'the same' ? 'the same, once rounded to 1.4' : reading }
    case 'siriusB':
      return {
        what: `A white dwarf’s radius at Sirius B’s mass (${PUBLISHED.siriusBMassSolarMasses} Suns)`,
        page: formatKm(row.page),
        published: `about ${formatKm(row.published[0])} (half of ESA/Hubble’s 12,000 km across)`,
        reading,
      }
    case 'neutronStarRadius':
      return {
        what: 'A neutron star’s radius',
        page: formatKm(row.page),
        published: PUBLISHED.neutronStarRadii.map((r) => `${r.radiusKm} km (plus ${r.plusKm}, minus ${r.minusKm}) at ${r.massSolarMasses} Suns`).join('; '),
        reading,
      }
    case 'blackHoleEdge':
      return { what: 'The mass above which a core goes on to form a black hole', page: `about ${row.page} Suns`, published: 'NASA: a core “between about 1 and 3 solar masses” can be stopped by neutrons', reading: row.reading }
    case 'sureNeutronStarEdge':
      return { what: 'The mass up to which a neutron star is sure to hold', page: `about ${row.page} Suns`, published: `measured neutron stars of ${row.published.join(' and ')} Suns`, reading: row.reading }
  }
}

export interface BlackHoleFormationResultsProps {
  sizeGuess: SizeAnswer
  thresholdGuess: ThresholdAnswer
  limitGuess: LimitAnswer
  partTwo: CoreResult | null
}

export function BlackHoleFormationResults({ sizeGuess, thresholdGuess, limitGuess, partTwo }: BlackHoleFormationResultsProps) {
  const run = runBlackHoleFormationExperiment(PART_ONE_MASS)
  const rows = checkUp()
  const presetRows = MASS_PRESETS.map((m) => runBlackHoleFormationExperiment(m))
  const edges = [
    { mass: CHANDRASEKHAR_LIMIT_SOLAR_MASSES, below: 'electrons (a white dwarf)', tags: [3] },
    { mass: SURE_NEUTRON_STAR_TOP_SOLAR_MASSES, below: 'neutrons (a neutron star), surely', tags: [3] },
    { mass: SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES, below: 'neutrons, perhaps (not known); above it, nothing known', tags: [2] },
  ].map((e) => ({ ...e, horizon: runBlackHoleFormationExperiment(e.mass).horizonRadiusKm }))

  // The worked calculations use the learner's own core when there is one, and Part 1's fixed core otherwise.
  const math = partTwo ?? run
  const workedMass = math.outcome === 'white-dwarf' ? math.coreMassSolarMasses : 1
  const wd = whiteDwarfRadiusSteps(workedMass)

  const bodyRows = (r: CoreResult): Array<[string, string]> => [
    ['What it is', OUTCOME_NAME[r.outcome]],
    ['Its horizon radius', formatKm(r.horizonRadiusKm)],
    ['The radius of what holds it up', heldUpText(r)],
    ['That radius divided by the horizon radius', r.radiusOverHorizon === null ? 'it ends smaller than its horizon' : `${formatRatio(r.radiusOverHorizon)} times`],
  ]

  return (
    <div>
      <p style={{ marginTop: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Every number in these tables is calculated from the standard results given on this page, except the “published” numbers in Table 1, which are from the pages named there. The words “the same”, “more” and “less” are this page’s own, not an official scale.
      </p>
      <p style={{ marginTop: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>A word you will see in every table: the horizon.</strong> It is the boundary around a black hole, inside which nothing can get out, not even light. It is the horizon of the black hole that a core’s mass would make if all of it were squeezed inside, so it belongs to the mass and not to any star. The <em>horizon radius</em> is its distance from the center, and it is 2.95 km for each Sun of mass. A core only becomes a black hole when it is squeezed inside its own horizon radius, so the ratio “radius of what holds it up ÷ horizon radius” tells you how far a core is from that point.
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
          <strong>Your guesses, beside the results.</strong> They are shown as you made them, and nothing here says whether they are right. The tutor does that. Find the rows with the white “your guess” tag to see the numbers each guess is about.
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Guess 1:</strong> {sizeLabel(sizeGuess)}. The question was: if you add more mass to a white dwarf, what happens to its size? Its numbers are the white dwarf radii at 0.6, 1.0 and 1.4 Suns in Table 3. <Tag n={1} />
          </li>
          <li>
            <strong>Guess 2:</strong> {thresholdLabel(thresholdGuess)}. The question was: at about what mass does a dead star’s core first become a black hole? Its number is the 3-Suns edge in Table 2. <Tag n={2} />
          </li>
          <li>
            <strong>Guess 3:</strong> {limitLabel(limitGuess)}. The question was: is the largest mass a neutron star can have higher than, the same as, or lower than a white dwarf’s? Its numbers are the 1.44 and 2 edges in Table 2. <Tag n={3} />
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: A check-up against published values</h4>
      <p style={tableLead}>
        Each row sets this page’s value beside a value that astronomers or NASA have published, with a plain reading. Every published value is from a page that was read for this page, and the table uses no cut-off of its own: “the same” means the numbers agree at the precision the published figure is given to.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>What we compared</th>
              <th style={headCell}>This page</th>
              <th style={headCell}>Published</th>
              <th style={headCell}>Reading</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const t = checkUpText(row)
              return (
                <tr key={row.id}>
                  <td style={cell}>{t.what}</td>
                  <td style={cell}>
                    <strong>{t.page}</strong>
                  </td>
                  <td style={cell}>{t.published}</td>
                  <td style={cell}>
                    <strong>{t.reading}</strong>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>The white dwarf limit.</strong> <em>What it is:</em> the most mass a white dwarf can have. <em>What it means:</em> this page uses {rows[0].page} Suns, NASA’s page says “1.4 times the mass of the Sun”, and 1.44 rounds to 1.4: the same. <em>Why it matters:</em> it is the first edge of the ladder, so it is a published value and not the page’s invention.
        </p>
        <p style={noteParagraph}>
          <strong>Sirius B.</strong> <em>What it is:</em> the one real white dwarf where this page’s size formula can be tried. <em>What it means:</em> at Sirius B’s mass of {PUBLISHED.siriusBMassSolarMasses} Suns the formula gives {formatKm(rows[1].page)}, and ESA/Hubble’s 12,000 km across means a radius of about {formatKm(rows[1].published[0])}: the page’s number is less, by about {Math.abs(rows[1].percentGap ?? 0).toFixed(0)}%. The published figure is given to two figures. <em>Why it matters:</em> it shows how close this page’s own fitted formula is to a real star, which one star can say but cannot settle.
        </p>
        <p style={noteParagraph}>
          <strong>A neutron star’s radius.</strong> <em>What it is:</em> the page’s round {NEUTRON_STAR_RADIUS_KM} km. <em>What it means:</em> it is inside the measured range of both neutron stars ({PUBLISHED.neutronStarRadii.map((r) => `${(r.radiusKm - r.minusKm).toFixed(2)} to ${(r.radiusKm + r.plusKm).toFixed(2)} km`).join(', and ')}). <em>Why it matters:</em> real radii vary a little with mass, and this page ignores that.
        </p>
        <p style={noteParagraph}>
          <strong>The two edges for neutrons.</strong> <em>What it is:</em> the 3-Suns edge and the 2-Suns edge. <em>What it means:</em> the 3 Suns is the same as the upper end of NASA’s “between about 1 and 3 solar masses”, while the 2 Suns is less than two measured neutron stars ({PUBLISHED.heavyNeutronStarMasses.join(' and ')} Suns), which sit in the page’s hatched zone. <em>Why it matters:</em> that is why the zone between about 2 and 3 Suns is drawn as “not known” and not as a black hole: real neutron stars are known inside it.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure these are.</strong> <em>What it is:</em> the published numbers come from NASA’s pages and from papers whose abstracts were read, with their own error bars. <em>What it means:</em> the neutron star’s largest mass is not known exactly, so no row can settle it. <em>Why it matters:</em> “the same” says the page agrees with what is published, not that the page is exact.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: Where each kind of core begins</h4>
      <p style={tableLead}>The edges of the ladder, with the horizon radius of a core of that mass.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Edge (Suns)', 'What can hold the core up below it', 'The horizon radius at that mass'].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {edges.map((e) => (
              <tr key={e.mass}>
                <td style={cell}>
                  <strong>{e.mass === SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES || e.mass === SURE_NEUTRON_STAR_TOP_SOLAR_MASSES ? `about ${e.mass}` : e.mass}</strong>
                  {e.tags.map((n) => (
                    <Tag key={n} n={n} />
                  ))}
                </td>
                <td style={cell}>{e.below}</td>
                <td style={cell}>{formatKm(e.horizon)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>What it is.</strong> The three edges between the four zones of the ladder: where electrons give out ({CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns), up to where neutrons surely hold (about {SURE_NEUTRON_STAR_TOP_SOLAR_MASSES}) and above where nothing known holds (about {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES}).
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> A neutron star’s largest sure mass, about {SURE_NEUTRON_STAR_TOP_SOLAR_MASSES} Suns, is above a white dwarf’s, {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, and a core first becomes a black hole at about {SURE_BLACK_HOLE_BOTTOM_SOLAR_MASSES} Suns, where its horizon radius is {formatKm(edges[2].horizon)}.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Why it matters.</strong> These three numbers are the whole answer to “what can hold up a dead star’s core?”, as far as it is known. The tutor goes through how your guesses compare.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: The preset masses</h4>
      <p style={tableLead}>The seven masses of Part 2, with the row of the run you are reading in bold.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Core mass (Suns)', 'What it is', 'Horizon radius', 'Radius of what holds it up', 'That radius ÷ the horizon radius'].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {presetRows.map((row) => (
              <tr key={row.coreMassSolarMasses} style={row.coreMassSolarMasses === math.coreMassSolarMasses ? { fontWeight: 'bold' } : undefined}>
                <td style={cell}>{row.coreMassSolarMasses}</td>
                <td style={cell}>{OUTCOME_NAME[row.outcome].replace(/^a /, '')}</td>
                <td style={cell}>{formatKm(row.horizonRadiusKm)}</td>
                <td style={cell}>
                  {heldUpText(row)}
                  {row.outcome === 'white-dwarf' && [0.6, 1.0, 1.4].includes(row.coreMassSolarMasses) && <Tag n={1} />}
                </td>
                <td style={cell}>{ratioText(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>What it is.</strong> For each preset mass: what holds the core up, its horizon radius, the radius of what holds it up, and the ratio of the two.
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> The three white dwarfs are {formatKm(presetRows[0].heldUpRadiusKm as number)} at 0.6 Suns, {formatKm(presetRows[1].heldUpRadiusKm as number)} at 1.0 and {formatKm(presetRows[2].heldUpRadiusKm as number)} at 1.4, so their ratio to the horizon is in the hundreds or thousands: very far from a black hole. A neutron star is only {formatRatio(presetRows[3].radiusOverHorizon as number)} times its horizon at 1.8 Suns and {formatRatio(presetRows[4].radiusOverHorizon as number)} at 2.5. Nothing known holds the 3.5- and 10-Sun cores.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Why it matters.</strong> It shows how close each kind of core gets to its own horizon. The white dwarf sizes are this page’s own fit, and the neutron star’s 12 km is a round value.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 4: The run of Part 1</h4>
      <p style={tableLead}>A dead core of {PART_ONE_MASS} Suns.</p>
      <Scroll>
        <table style={tableStyle}>
          <tbody>
            {bodyRows(run).map(([label, value]) => (
              <tr key={label}>
                <td style={cell}>{label}</td>
                <td style={cell}>
                  <strong>{value}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>What it is.</strong> The numbers behind the three pictures of Part 1.
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> A core of {PART_ONE_MASS} Suns has a horizon radius of {formatKm(run.horizonRadiusKm)}. Nothing known holds it up, so it ends smaller than its horizon: a black hole.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Why it matters.</strong> It is the event the title asks about, for one mass. These numbers are calculated here, not observed, for a cooled core that is not spinning.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 5: Your own run</h4>
      {partTwo ? (
        <>
          <p style={tableLead}>A dead core of {formatNumber(partTwo.coreMassSolarMasses)} Suns.</p>
          <Scroll>
            <table style={tableStyle}>
              <tbody>
                {bodyRows(partTwo).map(([label, value]) => (
                  <tr key={label}>
                    <td style={cell}>{label}</td>
                    <td style={cell}>
                      <strong>{value}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>
          <Note>
            <p style={noteParagraph}>
              <strong>What it is.</strong> The same kinds of number as Table 4, for the mass you chose.
            </p>
            <p style={noteParagraph}>
              <strong>What it means.</strong> A core of {formatNumber(partTwo.coreMassSolarMasses)} Suns is {OUTCOME_NAME[partTwo.outcome]}, with a horizon radius of {formatKm(partTwo.horizonRadiusKm)}.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Why it matters.</strong> Try the other masses and compare with Table 3. These are trial values: your own numbers, not a claim that a real star is like this.
            </p>
          </Note>
        </>
      ) : (
        <p style={{ ...tableLead, fontWeight: 'bold' }}>Not run yet. Choose a mass in Part 2, then press Run your choice. Your own numbers appear here.</p>
      )}

      <p style={{ marginBottom: '0.25rem' }}>
        <strong>The simple math: the horizon, and how close the core gets to it.</strong> The horizon radius is {formatNumber(HORIZON_KM_PER_SOLAR_MASS)} km for every Sun of mass (Black Holes 1). For {partTwo ? 'your core' : 'the core of Part 1'}:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
        <li>
          The horizon radius is {formatNumber(HORIZON_KM_PER_SOLAR_MASS)} km × {formatNumber(math.coreMassSolarMasses)} = <strong>{formatKm(math.horizonRadiusKm)}</strong>.
        </li>
        {math.heldUpRadiusKm === null ? (
          <li>Nothing known holds a core this heavy up, so there is no radius to compare: it keeps shrinking until it is smaller than its horizon, which makes it a black hole.</li>
        ) : (
          <>
            <li>
              What holds it up has a radius of <strong>{formatKm(math.heldUpRadiusKm)}</strong>
              {math.outcome === 'white-dwarf' ? ' (worked out below)' : math.outcome === 'neutron-star' ? ' (a neutron star’s round 12 km)' : ' (a neutron star’s 12 km, if a neutron star holds it)'}.
            </li>
            <li>
              How many times wider than its horizon the core is: {formatNumber(math.heldUpRadiusKm)} ÷ {formatNumber(math.horizonRadiusKm)} = <strong>{formatRatio(math.radiusOverHorizon as number)}</strong>.
            </li>
          </>
        )}
      </ol>

      <p style={{ marginBottom: '0.25rem' }}>
        <strong>The simple math: a white dwarf’s radius.</strong> For a white dwarf of {formatNumber(workedMass)} {workedMass === 1 ? 'Sun' : 'Suns'}
        {math.outcome === 'white-dwarf' ? '' : ' (your core is not a white dwarf, so we use 1 Sun as an example)'}, the page’s formula is <strong>R = 0.0131 R☉ × M^(−1/3) × √(1 − (M ÷ 1.44)^(4/3))</strong>, where R☉ is the Sun’s radius, 695,700 km, and M is the mass in Suns. It is the page’s own fit, given and not derived. Worked out:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
        <li>0.0131 × 695,700 km = {Math.round(wd.scaleKm).toLocaleString('en-US')} km.</li>
        <li>
          M^(−1/3) = {formatNumber(workedMass)}^(−1/3) = {four(wd.massFactor)}.
        </li>
        <li>
          M ÷ 1.44 = {four(wd.massOverLimit)}, and {four(wd.massOverLimit)}^(4/3) = {four(wd.limitTerm)}.
        </li>
        <li>
          √(1 − {four(wd.limitTerm)}) = {four(wd.squeezeFactor)}. As M gets close to 1.44, this number gets close to 0.
        </li>
        <li>
          R = {Math.round(wd.scaleKm).toLocaleString('en-US')} km × {four(wd.massFactor)} × {four(wd.squeezeFactor)} = <strong>{formatKm(wd.radiusKm)}</strong>.
        </li>
      </ol>

      <p>
        <strong>A comparison from daily life.</strong> Think of people being squeezed into a lift. At first you can keep adding people, and the crowd pushes back harder and harder against being squeezed. But a crowd can only push back so hard, and past a certain number there is no way to fit more in. A dead core’s push is a little like this: the more mass is squeezed together, the harder the particles push back, but each kind of push (the electrons’, the neutrons’) has a most it can give. This is only a comparison, and it does not explain why the pushes give out where they do.
      </p>

      <RealDeadStars />

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
          <strong>What this model can and cannot tell you.</strong> This is a thought experiment about the dead core of a star, which has cooled, is not spinning and is at rest. It does not follow the star’s life, the explosion that can happen when a core collapses, or how long a real collapse takes: the squeeze you watched is only a way of showing the result. It does not say which stars end up as which, and it stops at the horizon, so nothing inside is modeled.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The limits are standard results, given and not derived. The white dwarf’s, {CHANDRASEKHAR_LIMIT_SOLAR_MASSES} Suns, is well established. The neutron star’s is not known exactly, which is why a stretch of masses is drawn as not known. “Nothing known holds a heavier core up” is a statement about what is known: a form of matter that could has been suggested, but none has been seen, and the experiment does not model one. The sizes are round or fitted numbers, and real ones vary a little; the check-up in Table 1 shows how a real star compares. The original papers of Chandrasekhar and of Oppenheimer and Volkoff were not read for this page.
        </p>
      </div>
    </div>
  )
}
