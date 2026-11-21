import type { ReactNode } from 'react'
import {
  CEILING_EFFICIENCY,
  FLICKER_ILLUSTRATION_DAYS,
  J0529_LUMINOSITY_SOLAR,
  MILKY_WAY_LUMINOSITY_RANGE_SOLAR,
  PART_ONE_LUMINOSITY_SOLAR,
  PART_ONE_SPIN,
  PUBLISHED,
  checkUp,
  impliedEfficiency,
  runQuasarExperiment,
} from '../physics/quasarBrightness'
import type { CheckUpRow, FuelChoiceId, RatioChoiceId, WidthChoiceId } from '../physics/quasarBrightness'
import { formatNumber, formatPercent, formatSuns, fuelLabel, ratioLabel, widthLabel } from './QuasarBrightnessFormat'
import { listStyle } from './TidalEffectExperiment'

// Black Holes 11, Step 5: Part 3, the results (CLAUDE.md §14, "Reading the Results"). Nothing here changes with a guess. The guesses are shown beside the
// results and never marked right or wrong (that is the tutor's job, §12, §13). Every number comes from the physics module and is only formatted here (§9).
// Draft wording, for the owner's approval (§28.1). The parent mounts this only after the first Run.

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

const gapText = (row: CheckUpRow) => (row.reading === 'the same' ? 'the same' : `${row.reading} by about ${Math.abs(row.percentGap).toFixed(0)}%`)
const inTrillions = (suns: number) => formatSuns(suns)

// What each check-up row compares, in plain words, and how its numbers are written.
function checkUpText(row: CheckUpRow): { what: string; page: string; published: string; reading: string } {
  switch (row.id) {
    case 'j0529-rate':
      return {
        what: 'The mass that must fall in each year to make the light of J0529-4351 (500 trillion Suns), at 10 percent',
        page: `about ${formatNumber(row.page)} Suns a year`,
        published: 'just over 1 Sun a day, about 365 Suns a year (ESO, 2024)',
        reading: gapText(row),
      }
    case 'no-spin-efficiency':
      return {
        what: 'The share of mass turned to light when falling into a black hole that does not spin',
        page: formatPercent(row.page),
        published: 'about 6 percent (Begelman, NED/IPAC review)',
        reading: row.reading === 'the same' ? 'the same, to one figure' : gapText(row),
      }
    case 'ceiling-efficiency':
      return {
        what: 'The most that falling into a black hole can turn to light, in theory (the fastest possible spin)',
        page: formatPercent(row.page),
        published: 'about 42 percent (Begelman, NED/IPAC review)',
        reading: row.reading === 'the same' ? 'the same, to two figures' : gapText(row),
      }
    case 'ceiling-efficiency-openstax':
      return {
        what: 'The same ceiling, against a textbook’s “extreme” value',
        page: formatPercent(row.page),
        published: 'about 32 percent, “in the extreme theoretical limit” (OpenStax Astronomy)',
        reading: gapText(row),
      }
    case 'fusion-efficiency':
      return {
        what: 'The share of mass turned to energy by hydrogen fusion in a star',
        page: formatPercent(row.page),
        published: '0.71 percent (OpenStax Astronomy)',
        reading: 'the same',
      }
    case 'light-day':
      return {
        what: 'How far light travels in one day',
        page: `${Math.round(row.page).toLocaleString('en-US')} km`,
        published: `${PUBLISHED.nasaLightDayKm.toLocaleString('en-US')} km (NASA Voyager)`,
        reading: row.reading === 'the same' ? 'the same, to eight figures' : gapText(row),
      }
  }
}

export interface QuasarBrightnessResultsProps {
  ratioGuess: RatioChoiceId
  widthGuess: WidthChoiceId
  fuelGuess: FuelChoiceId
}

export function QuasarBrightnessResults({ ratioGuess, widthGuess, fuelGuess }: QuasarBrightnessResultsProps) {
  const run = runQuasarExperiment(PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN)
  const rows = checkUp()
  const byId = (id: CheckUpRow['id']) => rows.find((r) => r.id === id)!
  const j0529 = byId('j0529-rate')
  const impliedByEso = impliedEfficiency(J0529_LUMINOSITY_SOLAR, j0529.published)
  const [mwLow, mwHigh] = MILKY_WAY_LUMINOSITY_RANGE_SOLAR

  return (
    <div>
      <p style={{ marginTop: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Every number in these tables is calculated on this page from the formulas in the introduction, except the published values: the light outputs of 3C 273 and the Milky Way in Table 2, and the “published” column of Table 1, which are from the pages named there. The words “the same”, “more” and “less” are this page’s own, and not an official scale: “the same” means the two numbers agree at the precision the published number is given to.
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
          <strong>Your guesses, beside the results.</strong> They are shown as you made them, and nothing here says whether they are right. The tutor does that. Find the rows with the white “your guess” tag in Table 2 to see the number each guess is about.
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Guess 1:</strong> {ratioLabel(ratioGuess)}. The question was: about how many times brighter than the whole Milky Way is 3C 273? Its number is the “how many times brighter” row in Table 2. <Tag n={1} />
          </li>
          <li>
            <strong>Guess 2:</strong> {widthLabel(widthGuess)} as the Milky Way. The question was: if a quasar’s light changes as a whole over about a week, how wide can its source be, compared with the Milky Way? Its number is the “fraction of the Milky Way’s width” row in Table 2. <Tag n={2} />
          </li>
          <li>
            <strong>Guess 3:</strong> {fuelLabel(fuelGuess)}. The question was: about how much mass must fall into a black hole that is not spinning each year to make 3C 273’s light? Its number is the “falling into the black hole” row in Table 2. <Tag n={3} />
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: A check-up against published values</h4>
      <p style={tableLead}>
        Each row sets a number from this page beside a number that astronomers, ESO, NASA or a textbook have published, with a plain reading. There is no cut-off of this page’s own, and where two published values differ, both are shown.
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
          <strong>J0529-4351’s feeding rate.</strong> <em>What it is:</em> the page’s formula, applied to the quasar that ESO described in 2024 as the brightest known, set beside what its discoverers say its black hole swallows. <em>What it means:</em> at 10 percent, a share that the OpenStax textbook says falling matter “can easily reach”, the formula gives about {formatNumber(j0529.page)} Suns a year. ESO says “just over a Sun per day”, which is about 365 a year. The page’s number is less, by about {Math.abs(j0529.percentGap).toFixed(0)}%. Turned round, ESO’s rate means about {formatPercent(impliedByEso)} of the mass becomes light. <em>Why it matters:</em> it is a check of the whole method on a real object, and it agrees to within about a tenth. It does not prove the 10 percent: ESO does not state the share it used, so this shows that the page is consistent with it, and not that the share is known.
        </p>
        <p style={noteParagraph}>
          <strong>The shares of mass turned to light.</strong> <em>What it is:</em> the fraction of a piece of matter’s mass that comes out as light or heat. <em>What it means:</em> with no spin the page has {formatPercent(byId('no-spin-efficiency').page)}, which the review calls “about 6%”; the fastest spin possible in theory gives {formatPercent(CEILING_EFFICIENCY)}, the review’s “about 42%”. A textbook gives a smaller extreme value, about 32 percent, so the two published ceilings differ by a good deal, and the page shows both. For hydrogen fusion the page and the textbook both have {formatPercent(byId('fusion-efficiency').page)}. <em>Why it matters:</em> these shares are the whole reason a black hole needs far less matter than a star: {formatPercent(byId('no-spin-efficiency').page)} ÷ {formatPercent(byId('fusion-efficiency').page)} is about {formatNumber(run.lightPerKilogramRatio)} times more light from each kilogram. How sure this is: the spin of a real quasar’s black hole is not known well, so which share fits a real quasar is open.
        </p>
        <p style={{ margin: 0 }}>
          <strong>The light-day.</strong> <em>What it is:</em> the unit of distance behind the size limit. <em>What it means:</em> the page’s {Math.round(byId('light-day').page).toLocaleString('en-US')} km and NASA’s {PUBLISHED.nasaLightDayKm.toLocaleString('en-US')} km agree to eight figures, and differ only in the last few. <em>Why it matters:</em> the size limit is the light-day times the number of days, so the unit has to be right for Picture B to be right.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: The numbers behind the three pictures (3C 273, no spin)</h4>
      <p style={tableLead}>These are the numbers of Pictures A, B and C of Part 1. They stay the same however you guess and however you set Part 2.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>What</th>
              <th style={headCell}>Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>3C 273’s light output</td>
              <td style={cell}>about {inTrillions(run.luminositySolar)}, and the sources differ</td>
            </tr>
            <tr>
              <td style={cell}>The Milky Way’s light output</td>
              <td style={cell}>about {formatSuns(mwLow)} to {formatSuns(mwHigh)}</td>
            </tr>
            <tr>
              <td style={cell}>How many times brighter than the Milky Way</td>
              <td style={cell}>
                <strong>about {formatNumber(run.ratioToMilkyWay)} times</strong> ({formatNumber(run.ratioToMilkyWayRange.low)} to {formatNumber(run.ratioToMilkyWayRange.high)} over the two sources)
                <Tag n={1} />
              </td>
            </tr>
            <tr>
              <td style={cell}>The flicker time used (an example, not 3C 273’s own)</td>
              <td style={cell}>{FLICKER_ILLUSTRATION_DAYS} days</td>
            </tr>
            <tr>
              <td style={cell}>The widest the source can be</td>
              <td style={cell}>
                {FLICKER_ILLUSTRATION_DAYS} light-days, about {formatNumber(run.sizeLimitAU)} AU
              </td>
            </tr>
            <tr>
              <td style={cell}>That, as a fraction of the Milky Way’s width</td>
              <td style={cell}>
                <strong>about 1 part in {Math.round(run.galaxyToSourceWidthRatio).toLocaleString('en-US')}</strong> (the Milky Way is {formatNumber(run.galaxyToSourceWidthRatio / 1e6)} million times wider)
                <Tag n={2} />
              </td>
            </tr>
            <tr>
              <td style={cell}>
                Mass that must fall in each year, falling into the black hole (share of mass turned to light: {formatPercent(run.infallEfficiency)})
              </td>
              <td style={cell}>
                <strong>about {formatNumber(run.infallSolarMassesPerYear)} Suns a year</strong>
                <Tag n={3} />
              </td>
            </tr>
            <tr>
              <td style={cell}>Hydrogen that fusion in a star would have to burn each year (share: {formatPercent(run.fusionEfficiency)})</td>
              <td style={cell}>about {formatNumber(run.fusionSolarMassesPerYear)} Suns a year</td>
            </tr>
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>How bright.</strong> <em>What it is:</em> the quasar’s light divided by the Milky Way’s. <em>What it means:</em> {formatSuns(run.luminositySolar)} ÷ about 25 billion Suns is about {formatNumber(run.ratioToMilkyWay)}, and over the two published values for the Milky Way it runs from {formatNumber(run.ratioToMilkyWayRange.low)} to {formatNumber(run.ratioToMilkyWayRange.high)}. <em>Why it matters:</em> one point of light gives out well over a hundred galaxies’ worth of starlight. How sure this is: the value for 3C 273 is a round number, and published values range from about 2 to 5 trillion Suns, which moves the ratio by more than a factor of two.
        </p>
        <p style={noteParagraph}>
          <strong>How wide.</strong> <em>What it is:</em> the most that light can cross in the time the brightness takes to change. <em>What it means:</em> in {FLICKER_ILLUSTRATION_DAYS} days light goes {FLICKER_ILLUSTRATION_DAYS} light-days, about {formatNumber(run.sizeLimitAU)} AU, which is about 1 part in {Math.round(run.galaxyToSourceWidthRatio).toLocaleString('en-US')} of the Milky Way’s width. <em>Why it matters:</em> the light comes from a region far smaller than the galaxy it outshines. How sure this is: the one-week flicker is an example from a review, and not a measurement of 3C 273, so the real limit for 3C 273 could be larger or smaller.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How much matter.</strong> <em>What it is:</em> the mass that has to fall in each year, from the light output divided by (the share turned to light × c²). <em>What it means:</em> {formatPercent(run.infallEfficiency)} gives {formatNumber(run.infallSolarMassesPerYear)} Suns a year, and the same light from hydrogen fusion at {formatPercent(run.fusionEfficiency)} would need {formatNumber(run.fusionSolarMassesPerYear)}. <em>Why it matters:</em> it is the first half of the puzzle, how a source this bright can be fed with so little. How sure this is: it follows from the light output you started with, so it is only as sure as that round number, and it assumes that the share Black Holes 8 found for a probe is a fair stand-in for falling gas.
        </p>
      </Note>
    </div>
  )
}
