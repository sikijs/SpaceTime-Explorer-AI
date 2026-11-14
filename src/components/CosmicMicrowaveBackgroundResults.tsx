import type { ReactNode } from 'react'
import {
  CMB_TEMPERATURE_TODAY_KELVIN,
  PUBLISHED_RELEASE_TEMPERATURE_KELVIN,
  PUBLISHED_RELEASE_YEARS_ALT,
  PUBLISHED_T0_GIVE_OR_TAKE_KELVIN,
  PUBLISHED_T0_KELVIN,
  RECOMBINATION_REDSHIFT,
  RECOMBINATION_YEARS_AFTER_BIG_BANG,
  cmbCheckUp,
  cmbMomentsTable,
  cmbWorkedExample,
  evenSpreadExampleKelvin,
  kelvinToCelsius,
  spreadKelvin,
} from '../physics/cosmicMicrowaveBackgroundExperiment'
import type { CmbCheckUpRow, SkyGuess, TemperatureGuess } from '../physics/cosmicMicrowaveBackgroundExperiment'
import { GUESS_COLOR, fmtKelvin } from './CosmicMicrowaveBackgroundPictures'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Cosmology, Experiment 3, Part 3: the results (docs/audit/cosmology/03-draft-wording.md, sections 2 and 7).
// Every number comes from the physics module. The guesses are shown only as guesses: the tutor marks them, not this page
// (CLAUDE.md §12, §13). No setting from Part 2 and no guess changes any table.

export interface CosmicMicrowaveBackgroundResultsProps {
  guesses: { temperature: TemperatureGuess; sky: SkyGuess } | null
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

const TEMPERATURE_TEXT: Record<TemperatureGuess, string> = { higher: 'hotter at recombination than today', lower: 'cooler at recombination than today', same: 'the same at recombination as today' }
const SKY_TEXT: Record<SkyGuess, string> = { uniform: 'about the same in every direction', varies: 'varies a lot from direction to direction' }

const pct = (fraction: number, digits = 2) => (Math.abs(fraction) * 100).toFixed(digits)
const oneDecimal = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function CosmicMicrowaveBackgroundResults({ guesses }: CosmicMicrowaveBackgroundResultsProps) {
  const rows = Object.fromEntries(cmbCheckUp().map((row) => [row.id, row])) as Record<CmbCheckUpRow['id'], CmbCheckUpRow>
  const today = rows['temperature-today']
  const release = rows['temperature-at-release']
  const time = rows['release-time']
  const spread = rows['spread-between-directions']
  const moments = cmbMomentsTable()
  const w = cmbWorkedExample()
  const z100 = moments.find((m) => m.redshift === 100)!

  return (
    <div style={{ fontSize: '0.875rem' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Table 1: Check-up (calculated beside published)</p>
      <Table heads={['What we check', 'This page', 'Published', 'How they compare']}>
        <tr>
          <td style={cell}>Temperature today</td>
          <td style={cell}>{fmtKelvin(today.used!)} K (this page&rsquo;s own rounding)</td>
          <td style={cell}>
            {PUBLISHED_T0_KELVIN} ± {PUBLISHED_T0_GIVE_OR_TAKE_KELVIN} K (Fixsen, 2009)
          </td>
          <td style={cell}>The same: the difference, {Math.abs(today.difference!).toFixed(5)} K, is inside the published give-or-take</td>
        </tr>
        <tr>
          <td style={cell}>Temperature at recombination</td>
          <td style={cell}>
            {fmtKelvin(release.used!)} K, calculated: {CMB_TEMPERATURE_TODAY_KELVIN} × {w.factor.toFixed(1)} {guesses && <GuessTag />}
          </td>
          <td style={cell}>&ldquo;around {PUBLISHED_RELEASE_TEMPERATURE_KELVIN.toLocaleString('en-US')} Kelvin&rdquo; (ESA)</td>
          <td style={cell}>A little less ({pct(release.relativeGap!)} percent). ESA&rsquo;s figure is rounded (&ldquo;around&rdquo;), so this is not a test</td>
        </tr>
        <tr>
          <td style={cell}>Time after the Big Bang at recombination</td>
          <td style={cell}>about {time.used!.toLocaleString('en-US')} years, given</td>
          <td style={cell}>
            about {time.published.toLocaleString('en-US')} (ESA; NASA&rsquo;s Cosmic History); {time.publishedAlt!.toLocaleString('en-US')} (NASA&rsquo;s WMAP page)
          </td>
          <td style={cell}>Given, not checked. The sources differ by about {pct(time.relativeGap!, 1)} percent</td>
        </tr>
        <tr>
          <td style={cell}>Difference between directions</td>
          <td style={cell}>
            the seven circles all show about {fmtKelvin(CMB_TEMPERATURE_TODAY_KELVIN)} K (an illustration) {guesses && <GuessTag />}
          </td>
          <td style={cell}>
            about 1 part in 100,000, which is about {spread.difference!.toFixed(6)} K (ESA; the LAMBDA tutorial)
          </td>
          <td style={cell}>Quoted, not checked here: this page draws no real map</td>
        </tr>
      </Table>
      {guesses && <p style={smallNote}>The tags mark where each guess is about: guess 1 in row 2, guess 2 in row 4. They show the guess only, not whether it is right.</p>}

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> This page&rsquo;s numbers beside published ones, row by row.
        </li>
        <li>
          <strong>What it means with the real numbers.</strong> Row 1: this page&rsquo;s {fmtKelvin(today.used!)} K agrees with the published {PUBLISHED_T0_KELVIN} K to within its stated give-or-take. Row 2: the rule {CMB_TEMPERATURE_TODAY_KELVIN} × (1 + {RECOMBINATION_REDSHIFT}) gives {fmtKelvin(release.used!)} K,
          close to the rounded &ldquo;around 3,000&rdquo; that ESA gives. Rows 3 and 4 are figures the page gives or quotes; it does not calculate them.
        </li>
        <li>
          <strong>Why it matters.</strong> Rows 1 and 2 are where this page&rsquo;s calculation and real-world numbers meet. A table of numbers about the early universe is only worth trusting if you can see which numbers were measured, which were calculated, and which were simply given.
        </li>
        <li>
          <strong>How sure the numbers are.</strong> Row 2&rsquo;s comparison is only as exact as &ldquo;around 3000&rdquo; is. The {RECOMBINATION_YEARS_AFTER_BIG_BANG.toLocaleString('en-US')} years differs between sources ({PUBLISHED_RELEASE_YEARS_ALT.toLocaleString('en-US')} on NASA&rsquo;s WMAP page), so this page says
          &ldquo;about&rdquo;. The redshift {RECOMBINATION_REDSHIFT} is given here, and its source tables were not read.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.25rem' }}>Table 2: The temperature at some moments (calculated here)</p>
      <Table heads={['z', 'How much the light has been stretched since then (× today)', 'Temperature of the background']}>
        {moments.map((m) => (
          <tr key={m.redshift}>
            <td style={cell}>
              {m.redshift === 0 ? '0 (today)' : m.redshift === RECOMBINATION_REDSHIFT ? `${RECOMBINATION_REDSHIFT.toLocaleString('en-US')} (recombination)` : m.redshift.toLocaleString('en-US')}
            </td>
            <td style={cell}>{Number.isInteger(m.timesToday) ? m.timesToday.toLocaleString('en-US') : m.timesToday.toFixed(1)}</td>
            <td style={cell}>{m.temperatureKelvin < 100 ? String(Number(m.temperatureKelvin.toFixed(m.temperatureKelvin < 10 ? 3 : 2))) : oneDecimal(m.temperatureKelvin)} K</td>
          </tr>
        ))}
      </Table>
      <p style={smallNote}>These are calculated from the rule, so there are no published values to compare them with.</p>

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> The temperature of the background at six moments, found from {CMB_TEMPERATURE_TODAY_KELVIN} × (1 + z).
        </li>
        <li>
          <strong>What it means with the real numbers.</strong> Each temperature is today&rsquo;s multiplied by (1 + z). At z = 100 that is {CMB_TEMPERATURE_TODAY_KELVIN} × 101 = {z100.temperatureKelvin.toFixed(1)} K, which is about {kelvinToCelsius(z100.temperatureKelvin).toFixed(0)} °C, just above the freezing point of water
          (273.15 K). At z = 1,000 it is {oneDecimal(moments.find((m) => m.redshift === 1000)!.temperatureKelvin)} K.
        </li>
        <li>
          <strong>Why it matters.</strong> It shows the rule is one simple multiplication that holds at every z, so the temperature at any moment follows from one number, z. Why that multiplication is right is for the tutor.
        </li>
      </Note>

      {guesses && (
        <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', border: `1px solid ${GUESS_COLOR}`, borderRadius: '6px', backgroundColor: '#0b1020', color: '#e2e8f0' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Your guesses</p>
          <ul style={{ ...listStyle, marginBottom: 0 }}>
            <li>
              <strong>Guess 1</strong> (the temperature at recombination against today&rsquo;s): <strong>{TEMPERATURE_TEXT[guesses.temperature]}</strong>. Row 2 of Table 1 is where its answer is.
            </li>
            <li>
              <strong>Guess 2</strong> (the temperature across the sky): <strong>{SKY_TEXT[guesses.sky]}</strong>. Row 4 of Table 1 is where its answer is.
            </li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>These are your guesses only. The tutor in Part 4 says how they compare with the real numbers.</p>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '0.9rem 1rem', borderRadius: '8px', border: '1px solid #0f766e', backgroundColor: 'rgba(15, 118, 110, 0.08)' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#0f766e' }}>More about the CMB</p>
        <p style={{ margin: '0.5rem 0 0.4rem' }}>
          <strong>What &ldquo;the temperature of the CMB&rdquo; means.</strong> Hot things glow, and the colour of the glow depends on how hot they are: a stove element glows dull red, then orange, then white-hot. In the same way, the CMB has a glow with a <strong>temperature</strong>: it is
          the temperature of a glowing object that would give off light of this kind. We measure it in kelvin (K). 0 K is the coldest possible; room temperature is about 293 K. Today the CMB&rsquo;s temperature is <strong>{CMB_TEMPERATURE_TODAY_KELVIN} K</strong>, which is about{' '}
          <strong>{kelvinToCelsius(CMB_TEMPERATURE_TODAY_KELVIN).toFixed(1)} °C</strong>, colder than anything you have ever touched, and only a little above the coldest possible. It was measured by several instruments; Fixsen (2009) summarises them as {PUBLISHED_T0_KELVIN} ± {PUBLISHED_T0_GIVE_OR_TAKE_KELVIN} K.
        </p>
        <p style={{ margin: '0 0 0.4rem' }}>
          <strong>How hot it was when it was released.</strong> At recombination the same light had a temperature of about <strong>{fmtKelvin(w.temperatureKelvin)} K</strong>: {w.todayKelvin} × (1 + {RECOMBINATION_REDSHIFT}) = {w.todayKelvin} × {w.factor.toFixed(1)} ≈ {fmtKelvin(w.temperatureKelvin)} K. That
          is about <strong>{Math.round(w.timesToday).toLocaleString('en-US')} times</strong> hotter than today. ESA gives &ldquo;around 3000 Kelvin (approximately 2700ºC)&rdquo;.
        </p>
        <p style={{ margin: '0 0 0.4rem' }}>
          <strong>How many light particles.</strong> Even though it is cold and faint, it is everywhere. Every cubic centimetre of space (about the size of a sugar cube) holds roughly <strong>400</strong> photons of the CMB (ESA). You are being passed through by these photons all the time.
        </p>
        <p style={{ margin: '0 0 0.4rem' }}>
          <strong>How even it is.</strong> The CMB is very nearly the same temperature in every direction. The differences between one direction and another are only about <strong>1 part in 100,000</strong> (ESA; the LAMBDA tutorial). For {w.todayKelvin} K that is about{' '}
          <strong>{(spreadKelvin() * 1e6).toFixed(0)} millionths of a kelvin</strong> (calculated here). To get a feeling for how small that is: if the water in a swimming pool were this even, with a temperature of 293 K, the water at one end would differ from the water at the other end by only about{' '}
          {evenSpreadExampleKelvin().toFixed(3)} degrees (calculated here: 293 × 1 ÷ 100,000). The tiny differences are real and have been mapped by satellites. What they mean is a later topic.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How we know.</strong> The CMB was found by accident in 1964 to 1965 by two radio engineers, Arno Penzias and Robert Wilson, as a faint hiss in a large antenna that they could not get rid of. Later satellites measured it with great care: COBE, WMAP and Planck.
        </p>
      </div>
    </div>
  )
}
