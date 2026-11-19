import type { ReactNode } from 'react'
import {
  BACKGROUND_KELVIN,
  HAWKING_PRESETS,
  PART_ONE_MASS_KG,
  PUBLISHED,
  SUN_MASS_KG,
  UNIVERSE_AGE_YEARS,
  balanceMassKg,
  checkUp,
  coldnessAgainstBackground,
  hawkingSteps,
  hawkingTemperatureKelvin,
  lifetimeYears,
  massForLifetimeKg,
  runHawkingRadiationExperiment,
  tenfoldLifetimeRatio,
} from '../physics/hawkingRadiationExperiment'
import type { CheckUpRow, DirectionAnswer, HawkingResult, HotAnswer, LongerAnswer } from '../physics/hawkingRadiationExperiment'
import { directionLabel, hotLabel, longerLabel } from './HawkingRadiationChoices'
import { RealBlackHoles, PrimordialSearch } from './HawkingRadiationIntro'
import {
  compareWithBackground,
  formatBig,
  formatKelvin,
  formatKg,
  formatLength,
  formatScientific,
  formatYears,
  presetLabel,
} from './HawkingRadiationPictures'
import { listStyle } from './TidalEffectExperiment'

// Black Holes, Experiment 10 (audit update): Part 3, the results (docs/audit/black-holes-and-strong-gravity/10-draft-wording.md, section 7). Nothing here
// changes with a guess. The guesses are shown beside the results, never marked right or wrong (that is the tutor's job, CLAUDE.md §12, §13). Every number
// comes from the physics module; the interface only formats it (§9). The parent mounts this only after the first Run.

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

// A ratio of two numbers for the reading column: "0.62 times that".
const ofIt = (ratio: number) => `${Number(ratio.toPrecision(2))} times that`

// What each check-up row compares, in plain words, and how its numbers are written. The reading is "the same", "less" or "more" with the ratio.
function checkUpText(row: CheckUpRow): { what: string; page: string; published: string; reading: string } {
  const word = row.reading === 'the same' ? 'the same' : row.reading
  switch (row.id) {
    case 'temperatureNasa':
      return {
        what: 'The temperature of a black hole of 1 Sun',
        page: formatKelvin(row.page),
        published: 'NASA Goddard, Ask an Astrophysicist: “one ten-millionth of a degree above absolute zero”, which is 1 × 10⁻⁷ K',
        reading: `${word}: ${ofIt(row.ratio)}. NASA’s is a round figure.`,
      }
    case 'temperatureHawking1974':
      return {
        what: 'The same temperature, in Hawking’s first letter',
        page: formatKelvin(row.page),
        published: 'Hawking 1974: “≈ 10⁻⁶ (M☉/M) K”, which is about 1 × 10⁻⁶ K for 1 Sun',
        reading: `${word}: ${ofIt(row.ratio)}, about ${Math.round(1 / row.ratio)} times smaller. This page does not explain why the two differ.`,
      }
    case 'lifetimeAgainstUniverse':
      return {
        what: 'The time for a black hole of 1 Sun to evaporate, against the age of the universe',
        page: formatYears(row.page),
        published: `Hawking 1974: “much longer than the age of the Universe” (about ${formatScientific(UNIVERSE_AGE_YEARS, 2)} years)`,
        reading: `${word}: about ${formatScientific(row.ratio, 2)} times the age of the universe`,
      }
    case 'evaporatingNowMass':
      return {
        what: 'The mass of a black hole that is evaporating about now',
        page: formatKg(row.page),
        published: 'Hawking 1974: a black hole lighter than 10¹⁵ g, which is 10¹² kg, “would have evaporated by now”',
        reading: `${word}: ${ofIt(row.ratio)}, about ${Math.round(1 / row.ratio)} times smaller. Hawking’s is a round figure.`,
      }
  }
}

export interface HawkingRadiationResultsProps {
  hotGuess: HotAnswer
  directionGuess: DirectionAnswer
  longerGuess: LongerAnswer
  // The black hole of the learner's last Part 2 run, or null before one. Table 2 reads Part 1's 10-Suns black hole until then.
  partTwoMassKg: number | null
}

export function HawkingRadiationResults({ hotGuess, directionGuess, longerGuess, partTwoMassKg }: HawkingRadiationResultsProps) {
  const massKg = partTwoMassKg ?? PART_ONE_MASS_KG
  const result: HawkingResult = runHawkingRadiationExperiment(massKg)
  const steps = hawkingSteps(massKg)
  const rows = checkUp()
  const presetRows = HAWKING_PRESETS.map((p) => ({ preset: p, row: runHawkingRadiationExperiment(p.massKg) }))
  const tOne = hawkingTemperatureKelvin(SUN_MASS_KG)
  const tTen = hawkingTemperatureKelvin(PART_ONE_MASS_KG)
  const tenResult = runHawkingRadiationExperiment(PART_ONE_MASS_KG)
  const tenTimes = Math.round(tenfoldLifetimeRatio())
  const chosenLabel = presetLabel[HAWKING_PRESETS.find((p) => p.massKg === massKg)!.id]
  const evaporatingNow = massForLifetimeKg(UNIVERSE_AGE_YEARS)

  return (
    <div>
      <p style={{ marginTop: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Every number in these tables is calculated from the standard results given on this page, except the “published” numbers in Table 1, which are from the pages named there. The words “the same”, “more” and “less” are this page’s own, not an official scale. Nobody has measured any of this from a real black hole. Table 2 follows the black hole you ran last in Part 2; until you run one, it shows the 10-Suns black hole of Part 1.
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
          <strong>Your guesses, beside the results.</strong> They are shown as you made them, and nothing here says whether they are right. The tutor does that. Find the rows with the white “your guess” tag in Table 3 to see the numbers each guess is about.
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Guess 1:</strong> {hotLabel(hotGuess)}. The question was: which is hotter, a big black hole or a small one? Its numbers are the temperatures of the 1-Sun and 10-Suns black holes in Table 3. <Tag n={1} />
          </li>
          <li>
            <strong>Guess 2:</strong> {directionLabel(directionGuess)}. The question was: is a black hole of 10 Suns losing mass, gaining mass, or staying the same? Its number is the “which way the mass goes” entry for 10 Suns in Table 3. <Tag n={2} />
          </li>
          <li>
            <strong>Guess 3:</strong> {longerLabel(longerGuess)}. The question was: compared with a black hole of 1 Sun, how many times longer would a black hole of 10 Suns take to evaporate? Its numbers are the times for 1 Sun and 10 Suns in Table 3. <Tag n={3} />
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: A check-up against published values</h4>
      <p style={tableLead}>
        Each row sets this page’s value beside a value that NASA or Hawking published, with a plain reading. Every published value is from a page that was read for this page. The table uses no cut-off of its own: “the same” means the numbers agree, and otherwise the reading says “less” or “more” and by how much.
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
          <strong>The temperature of a black hole of 1 Sun.</strong> <em>What it is:</em> how hot the faint glow of a Sun-mass black hole would be. <em>What it means:</em> this page gives {formatKelvin(tOne)}. NASA gives “one ten-millionth of a degree above absolute zero”, which is 1 × 10⁻⁷ K, so this page’s number is {ofIt(tOne / PUBLISHED.nasaOneSunTemperatureKelvin)}, NASA’s round figure. Hawking’s 1974 letter gives “≈ 10⁻⁶ (M☉/M) K”, which is about 1 × 10⁻⁶ K for 1 Sun, so this page’s number is {ofIt(tOne / PUBLISHED.hawking1974OneSunTemperatureKelvin)}, Hawking’s. All three are far colder than anything in space. <em>Why it matters:</em> it shows the size of the number is not in doubt, but the digits are: this page does not know why Hawking’s first letter is larger.
        </p>
        <p style={noteParagraph}>
          <strong>The time to evaporate.</strong> <em>What it is:</em> how long a black hole of 1 Sun would take to disappear, alone. <em>What it means:</em> {formatYears(lifetimeYears(SUN_MASS_KG))}, about {formatScientific(lifetimeYears(SUN_MASS_KG) / UNIVERSE_AGE_YEARS, 2)} times the age of the universe, which agrees with Hawking’s “much longer than the age of the Universe”. <em>Why it matters:</em> it says that a black hole of the Sun’s mass has not had time to do anything yet.
        </p>
        <p style={noteParagraph}>
          <strong>A black hole that is evaporating about now.</strong> <em>What it is:</em> the mass whose time to evaporate is exactly the age of the universe. <em>What it means:</em> {formatKg(evaporatingNow)}, about the mass of a small mountain. Hawking’s letter says a black hole lighter than 10¹⁵ g (10¹² kg) “would have evaporated by now”, so the two are within a few times of each other, and his is a round figure. <em>Why it matters:</em> it is where the search for evaporating black holes has to look: for black holes this light.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure these are.</strong> <em>What it is:</em> the published figures come from NASA’s answer, an abstract of Hawking’s 1974 letter (the full letter is behind a login) and nothing else. <em>What it means:</em> the page’s two formulas are the standard textbook ones, given and not derived, and they have not been checked against a textbook or Hawking’s 1975 paper for this page. <em>Why it matters:</em> read every number here as good to within a few times, and the radiation itself as a prediction that has not been seen.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: The black hole you ran</h4>
      <p style={tableLead}>
        You ran <strong>{chosenLabel}</strong>{partTwoMassKg === null ? ' (the black hole of Part 1)' : ''}.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <tbody>
            {(
              [
                ['Its mass', `${formatKg(result.massKg)}${result.massSolarMasses >= 0.1 ? ` (${formatBig(result.massSolarMasses)} Suns)` : ''}`],
                ['Its horizon radius', formatLength(result.horizonRadiusKm)],
                ['Its temperature', formatKelvin(result.temperatureKelvin)],
                [`Compared with the background (${BACKGROUND_KELVIN} K)`, `${compareWithBackground(result)} the background`],
                ['Which way its mass goes', result.direction === 'loses' ? 'goes down' : result.direction === 'gains' ? 'goes up' : 'stays the same'],
                ['Time to evaporate, alone', formatYears(result.lifetimeYears)],
                ['That time divided by the age of the universe', `${formatBig(result.lifetimeOverUniverseAge)} times`],
              ] as Array<[string, string]>
            ).map(([label, value]) => (
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
          <strong>The temperature.</strong> <em>What it is:</em> how hot this black hole’s glow would be. <em>What it means, worked:</em> a black hole of 1 Sun is {formatKelvin(steps.oneSunTemperatureKelvin)}, and the temperature is that value divided by the mass in Suns. For yours: {formatKelvin(steps.oneSunTemperatureKelvin)} ÷ {formatBig(steps.massSolarMasses)} = <strong>{formatKelvin(steps.temperatureKelvin)}</strong>.{' '}
          {result.direction === 'balanced'
            ? `Against the background: ${formatKelvin(steps.temperatureKelvin)} ÷ ${BACKGROUND_KELVIN} K = 1, so it is the same temperature.`
            : result.direction === 'loses'
              ? `Against the background: ${formatKelvin(steps.temperatureKelvin)} ÷ ${BACKGROUND_KELVIN} K = ${formatBig(steps.temperatureOverBackground)}, so it is ${formatBig(steps.temperatureOverBackground)} times hotter.`
              : `Against the background: ${BACKGROUND_KELVIN} K ÷ ${formatKelvin(steps.temperatureKelvin)} = ${formatBig(1 / steps.temperatureOverBackground)}, so it is ${formatBig(1 / steps.temperatureOverBackground)} times colder.`}{' '}
          <em>Why it matters:</em> heat flows from what is hotter to what is colder. A hot cup of coffee in a cold room cools down, because heat flows from the coffee into the room. A cold drink in a warm room warms up, because heat flows from the room into the drink. A black hole in the cosmic microwave background is like the coffee or the drink, and the background is like the room. Which one a black hole is decides which way its mass goes. This is only a comparison: it does not explain why a black hole has a temperature.
        </p>
        <p style={noteParagraph}>
          <strong>The time to evaporate.</strong> <em>What it is:</em> how long this black hole would take to disappear, alone. <em>What it means, worked:</em> a black hole of 1 Sun takes {formatYears(steps.oneSunLifetimeYears)}, and the time is that value times the cube of the mass in Suns. For yours: {formatBig(steps.massSolarMasses)} × {formatBig(steps.massSolarMasses)} × {formatBig(steps.massSolarMasses)} = {formatBig(steps.massCubed)}, and {formatYears(steps.oneSunLifetimeYears)} × {formatBig(steps.massCubed)} = <strong>{formatYears(steps.lifetimeYears)}</strong>, which is {formatBig(steps.lifetimeOverUniverseAge)} times the age of the universe. With ten times the mass the cube is 10 × 10 × 10 = 1,000 times bigger, so {formatYears(steps.lifetimeYears)} × 1,000 = {formatYears(steps.tenTimesMassLifetimeYears)}. <em>Why it matters:</em> a cube grows fast. A cube 10 cm on each side, next to one 1 m on each side (ten times as long), holds 10 × 10 × 10 = 1,000 times as much. The time to evaporate follows the same pattern. This is only a comparison.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure these are.</strong> The temperature and the time are standard results, given and not derived, and the times are good only to within a few times. Nobody has measured either from a real black hole.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: The six black holes</h4>
      <p style={tableLead}>The six black holes of Part 2, with the one you ran in bold. Table 3 does not change with your guesses.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['Black hole', 'Mass', 'Temperature', 'Compared with the background', 'Which way the mass goes', 'Time to evaporate, alone'].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {presetRows.map(({ preset, row }) => {
              const isSun = preset.id === 'sun'
              const isTen = preset.id === 'ten-suns'
              return (
                <tr key={preset.id} style={preset.massKg === massKg ? { fontWeight: 'bold' } : undefined}>
                  <td style={cell}>{presetLabel[preset.id]}</td>
                  <td style={cell}>{formatKg(row.massKg)}</td>
                  <td style={cell}>
                    {formatKelvin(row.temperatureKelvin)}
                    {(isSun || isTen) && <Tag n={1} />}
                  </td>
                  <td style={cell}>{compareWithBackground(row)} the background</td>
                  <td style={cell}>
                    {row.direction === 'loses' ? 'goes down' : row.direction === 'gains' ? 'goes up' : 'stays the same'}
                    {isTen && <Tag n={2} />}
                  </td>
                  <td style={{ padding: '0.3rem 0' }}>
                    {formatYears(row.lifetimeYears)}
                    {(isSun || isTen) && <Tag n={3} />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>What it is.</strong> The six black holes side by side: their masses, temperatures, which side of the background they are on, and their times to evaporate.
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> Down the rows, from the mountain-sized black hole to M87*, the mass rises and the temperature falls, from {formatKelvin(presetRows[0].row.temperatureKelvin)} to {formatKelvin(presetRows[5].row.temperatureKelvin)}, and the time to evaporate rises from {formatYears(presetRows[0].row.lifetimeYears)} to {formatYears(presetRows[5].row.lifetimeYears)}. From 1 Sun to 10 Suns the temperature goes from {formatKelvin(tOne)} to {formatKelvin(tTen)}, a tenth, and the time from {formatYears(lifetimeYears(SUN_MASS_KG))} to {formatYears(lifetimeYears(PART_ONE_MASS_KG))}, {tenTimes.toLocaleString('en-US')} times as long. The 10-Suns black hole is {compareWithBackground(tenResult)} the background and its mass goes {tenResult.direction === 'gains' ? 'up' : tenResult.direction === 'loses' ? 'down' : 'nowhere'}. Only the mountain-sized one is on the hot side of the background; the balance mass is exactly at it, at about {formatKg(balanceMassKg())}.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Why it matters.</strong> It puts every black hole of this page on one scale. It is also why no black hole found in space is evaporating today: each is far heavier than the balance mass, so far colder than the background. For a black hole of 1 Sun to start losing mass, the background would have to get about {formatScientific(coldnessAgainstBackground(SUN_MASS_KG), 2)} times colder.
        </p>
      </Note>

      <RealBlackHoles />
      <PrimordialSearch />

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
          <strong>What this model can and cannot tell you.</strong> This is a thought experiment about one black hole that is alone, is not spinning and has nothing falling into it, in a background held at {BACKGROUND_KELVIN} K. It shows which way a black hole’s mass goes, and not how fast. The real background keeps getting colder as the universe expands, and the experiment does not say when a black hole would start to lose mass. The time to evaporate is for a black hole alone in a perfectly cold space, and is only good to within a few times. The very last stage of an evaporation is not modeled.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The formulas are standard results, given and not derived. Nobody has ever seen this faint heat from a real black hole, so everything here is a prediction of the theory. The time-lapse is only a way of showing the direction, and the real changes take far longer.
        </p>
      </div>
    </div>
  )
}
