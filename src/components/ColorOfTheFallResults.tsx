import type { ReactNode } from 'react'
import {
  LAMP_WAVELENGTH_NM,
  MASS_PANEL_DISTANCE_IN_HORIZON_RADII,
  PART_ONE_START_IN_HORIZON_RADII,
  bandOf,
  checkUpRows,
  curveEnd,
  distanceWhereWavelengthPasses,
  fallRow,
  lightPeriodSeconds,
  massPanelColumns,
  nearHorizonReadings,
  partOneRow,
  receivedWavelengthNm,
  runPartOne,
  wavelengthRatiosPerTenfoldGap,
  workedDistance,
  workedSteps,
} from '../physics/colorOfTheFallExperiment'
import type { ColorChoice, ColorOfTheFallResult, MassChoice, VisibleChoice } from '../physics/colorOfTheFallExperiment'
import { BLACK_HOLE_PRESETS } from '../physics/colorOfTheFallExperiment'
import { colorLabel, massLabel, visibleLabel } from './ColorOfTheFallChoices'
import { BAND_LABEL, formatBig, formatDistance, formatGap, formatNumber, formatWavelength, withBand } from './ColorOfTheFallPictures'
import { GuessTag, listStyle } from './TidalEffectExperiment'

// Black Holes, Experiment 7 (audit update): Part 3, the results (docs/audit/black-holes-and-strong-gravity/07-draft-wording.md, section 7).
// Nothing here changes with a guess. The guesses are shown beside the results, never marked right or wrong (that is the tutor's job,
// CLAUDE.md §12, §13). Every number comes from the physics module; the interface only formats it (§9). The parent mounts this only after the
// first Run.

const four = (v: number) => v.toFixed(4)

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sci = (x: number) => {
  const exponent = Math.floor(Math.log10(x))
  const mantissa = Number((x / 10 ** exponent).toPrecision(3))
  return `${mantissa} × 10${String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')}`
}

// The gap between a found number and its reference, in percent, written plainly.
function formatPercent(percent: number): string {
  const size = Math.abs(percent)
  if (size === 0) return '0%'
  if (size < 0.0001) return 'less than 0.0001%'
  return `${Number(size.toPrecision(2))}%`
}

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

export interface ColorOfTheFallResultsProps {
  colorGuess: ColorChoice
  visibleGuess: VisibleChoice
  massGuess: MassChoice
  partTwo: ColorOfTheFallResult | null
}

export function ColorOfTheFallResults({ colorGuess, visibleGuess, massGuess, partTwo }: ColorOfTheFallResultsProps) {
  const checkUp = checkUpRows()
  const one = partOneRow()
  const run = runPartOne()
  const columns = massPanelColumns()
  const own = partTwo ? fallRow(partTwo) : null
  const ownHole = partTwo ? partTwo.preset.label.replace(/^A /, 'a ') : ''
  const math = partTwo ?? run
  const mathStart = math.startInHorizonRadii
  const mathDistance = workedDistance(mathStart)
  const steps = workedSteps(mathStart)
  const mathHole = math.preset.label.replace(/^A /, 'a ')
  const periodEmitted = lightPeriodSeconds(LAMP_WAVELENGTH_NM)
  const near = nearHorizonReadings(PART_ONE_START_IN_HORIZON_RADII)
  const ratios = wavelengthRatiosPerTenfoldGap(PART_ONE_START_IN_HORIZON_RADII)
  const end = curveEnd(run)
  const at = (r: number) => receivedWavelengthNm(PART_ONE_START_IN_HORIZON_RADII, r)

  const rowsOne: Array<[string, ReactNode, ReactNode]> = [
    ['The lamp’s own wavelength, as emitted', withBand(LAMP_WAVELENGTH_NM), null],
    ['The wavelength as received, at the release', withBand(one.wavelengthAtReleaseNm), <GuessTag key="a" />],
    [`Halfway down: ${formatNumber(1 + (PART_ONE_START_IN_HORIZON_RADII - 1) / 2)} horizon radii from the center`, withBand(at(1 + (PART_ONE_START_IN_HORIZON_RADII - 1) / 2)), null],
    [`At ${mathDistanceOne()} horizon radii from the center`, withBand(at(mathDistanceOne())), null],
    ['At 2 horizon radii from the center', withBand(at(2)), null],
    ...near.map((n): [string, ReactNode, ReactNode] => [`At a gap of ${formatGap(n.gap)} above the horizon (stretch factor ${formatBig(n.stretch)})`, withBand(n.wavelengthNm), <GuessTag key={`n${n.gap}`} />]),
    [
      'Where the light passes 750 nm, the red edge of visible light',
      one.leavesVisibleAt === null ? 'already past it at the release' : `${formatNumber(one.leavesVisibleAt)} horizon radii from the center (${formatNumber(one.leavesVisibleAt - 1)} above the horizon)`,
      <GuessTag key="v" />,
    ],
    ['Where the light becomes microwave (1 mm)', `a gap of ${formatGap(one.becomesMicrowaveAtGap)} above the horizon`, null],
  ]

  return (
    <div>
      <p style={{ marginTop: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Here are the numbers behind the pictures. Under each table a short note says <strong>what it is</strong>, <strong>what it means</strong> with the real numbers, and <strong>why it matters</strong>. The tables stay the same however you guess. Nothing here is a measurement of a fall: nothing has ever been
        dropped into a black hole, and every number in these tables is calculated from the equations given on this page. The words “the same”, “more” and “less” are this page’s own, not an official scale; the numbers beside them say how much.
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
          <strong>Your guesses, beside the results.</strong> They are shown as you made them, and nothing here says whether they are right. The tutor does that. To compare, find the row with the white “your guess” tag and look at its numbers.
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Guess 1:</strong> {colorLabel(colorGuess)}. The question was: as the traveler falls, what happens to the color the observer receives? Its numbers are the wavelength at the release and at each gap in Table 2. <GuessTag />
          </li>
          <li>
            <strong>Guess 2:</strong> {visibleLabel(visibleGuess)}. The question was: does the lamp’s light stay visible all the way down? Its number is the “passes 750 nm” row in Table 2. <GuessTag />
          </li>
          <li>
            <strong>Guess 3:</strong> {massLabel(massGuess)}. The question was: is the color at {MASS_PANEL_DISTANCE_IN_HORIZON_RADII} horizon radii different for a 10-Sun black hole and for M87*? Its numbers are the two wavelengths in Table 4. <GuessTag />
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: A check-up on the calculation</h4>
      <p style={tableLead}>Each row sets what we expect (a formula the calculation is built from, or a separate route to the same number) beside what the calculation gives, with a plain reading.</p>
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
            {checkUp.map((row) => (
              <tr key={row.what}>
                <td style={cell}>{row.what}</td>
                <td style={cell}>
                  {formatBig(row.expected)} {row.unit}
                </td>
                <td style={cell}>
                  <strong>{formatBig(row.found)}</strong> {row.unit}
                </td>
                <td style={cell}>
                  <strong>{row.reading}</strong>: the gap is {formatPercent(row.percentAbove)}
                  {row.reading !== 'the same' && <>, {row.percentAbove > 0 ? 'above' : 'below'} the expected number</>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>The wavelength two ways.</strong> <em>What it is:</em> the color at {workedDistance(PART_ONE_START_IN_HORIZON_RADII)} horizon radii can be found as 550 nm times the stretch factor, or from the formula in one step. <em>What it means:</em> they agree, {formatBig(checkUp[0].expected)} nm and {formatBig(checkUp[0].found)} nm. <em>Why it matters:</em> it shows that there is one number doing the stretching.
        </p>
        <p style={noteParagraph}>
          <strong>The period.</strong> <em>What it is:</em> a wave’s period is the time between crests, the wavelength divided by the speed of light. <em>What it means:</em> the period as received is {formatBig(checkUp[1].found)} times the period as emitted, the same as the stretch factor, {formatBig(checkUp[1].expected)}. <em>Why it matters:</em> it ties this experiment to Black Holes 6, where the same number stretched the gaps between flashes.
        </p>
        <p style={noteParagraph}>
          <strong>The release value.</strong> <em>What it is:</em> at the release the traveler is not yet moving, so only gravity acts. <em>What it means:</em> the calculation gives {formatBig(checkUp[2].found)} nm, against {formatBig(checkUp[2].expected)} nm from 550 nm ÷ √(1 − 1/{PART_ONE_START_IN_HORIZON_RADII}). <em>Why it matters:</em> it checks the start of the curve.
        </p>
        <p style={noteParagraph}>
          <strong>The tenfold rule.</strong> <em>What it is:</em> every time the gap above the horizon shrinks to a tenth, the wavelength is multiplied by about 10. <em>What it means:</em> from a gap of 0.001 to 0.0001 it grew {formatBig(checkUp[3].found)} times, against {formatBig(checkUp[3].expected)}, with a reading of “{checkUp[3].reading}”. <em>Why it matters:</em> there is no gap small enough to stop the growth.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure these are.</strong> <em>What it is:</em> every “expected” number comes from the same theory as the calculation, so the check is of the calculation against itself, not of nature. <em>What it means:</em> they have been checked against each other and against Black Holes 6, not against a measured fall. <em>Why it matters:</em> no fall into a black hole has been observed, so nothing here has been measured.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: The fall of Part 1</h4>
      <p style={tableLead}>
        The 10-Sun black hole (horizon radius {formatDistance(run.horizonRadiusKm)}), released from rest {PART_ONE_START_IN_HORIZON_RADII} horizon radii ({formatDistance(one.startKm)}) from its center. The lamp’s own color is {LAMP_WAVELENGTH_NM} nm.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <tbody>
            {rowsOne.map(([label, value, tag]) => (
              <tr key={label}>
                <td style={cell}>
                  {label} {tag}
                </td>
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
          <strong>What it is.</strong> The numbers behind the fall you watched in Part 1.
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> The lamp’s own color is {LAMP_WAVELENGTH_NM} nm. The observer receives {formatWavelength(one.wavelengthAtReleaseNm)} at the release, {formatWavelength(at(mathDistanceOne()))} at {mathDistanceOne()} horizon radii, {formatWavelength(at(2))} at 2, and {formatWavelength(near[0].wavelengthNm)}, {formatWavelength(near[1].wavelengthNm)} and {formatWavelength(near[2].wavelengthNm)} at gaps of {near.map((n) => formatGap(n.gap)).join(', ')}. Each of the last steps is about {formatNumber(ratios[ratios.length - 1])} times the one before.
        </p>
        <p style={noteParagraph}>
          <strong>Why it matters.</strong> It is one fall described by one color: the lamp’s, as the observer receives it. The tutor goes through how your guesses compare.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> These numbers are calculated here, not observed, for a lamp shining straight outward. The red edge of visible light is taken as 750 nm, a convention (NASA’s page says the eye typically detects up to about 700 nm; with 700 the light would pass that edge earlier in the fall, at {formatNumber(distanceWhereWavelengthPasses(PART_ONE_START_IN_HORIZON_RADII, 700) as number)} horizon radii from the center instead of {formatNumber(one.leavesVisibleAt as number)}).
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: Your own run</h4>
      {own && partTwo ? (
        <>
          <p style={tableLead}>
            {ownHole} (horizon radius {formatDistance(partTwo.horizonRadiusKm)}), released from rest {partTwo.startInHorizonRadii} horizon radii ({formatDistance(own.startKm)}) from its center.
          </p>
          <Scroll>
            <table style={tableStyle}>
              <tbody>
                <tr>
                  <td style={cell}>The wavelength as received, at the release</td>
                  <td style={cell}>
                    <strong>{withBand(own.wavelengthAtReleaseNm)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style={cell}>Where the light passes 750 nm</td>
                  <td style={cell}>
                    <strong>{own.leavesVisibleAt === null ? 'already past it at the release' : `${formatNumber(own.leavesVisibleAt)} horizon radii from the center`}</strong>
                  </td>
                </tr>
                {own.nearHorizon.map((n) => (
                  <tr key={n.gap}>
                    <td style={cell}>
                      At a gap of {formatGap(n.gap)} above the horizon (stretch factor {formatBig(n.stretch)})
                    </td>
                    <td style={cell}>
                      <strong>{withBand(n.wavelengthNm)}</strong>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={cell}>Where the light becomes microwave (1 mm)</td>
                  <td style={cell}>
                    <strong>a gap of {formatGap(own.becomesMicrowaveAtGap)} above the horizon</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </Scroll>
          <Note>
            <p style={noteParagraph}>
              <strong>What it is.</strong> The same kinds of number as Table 2, for the black hole and the release distance you chose.
            </p>
            <p style={noteParagraph}>
              <strong>What it means.</strong> From a release at {partTwo.startInHorizonRadii} horizon radii the lamp’s light is {formatWavelength(own.wavelengthAtReleaseNm)} at the release and {formatWavelength(own.endWavelengthNm)} at the end of the run. The black hole you pick changes the kilometers; the release distance changes the wavelengths.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Why it matters.</strong> Try the same release distance on another black hole: the wavelengths are the same. These are trial values: your own numbers, not a claim that a real fall would be like that.
            </p>
          </Note>
        </>
      ) : (
        <>
          <p style={{ ...tableLead, fontWeight: 'bold' }}>Not run yet. Choose a black hole and a distance in Part 2, then press Run your choice. Your own numbers appear here.</p>
        </>
      )}

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 4: Two black holes at {MASS_PANEL_DISTANCE_IN_HORIZON_RADII} horizon radii</h4>
      <p style={tableLead}>A fall from rest at {PART_ONE_START_IN_HORIZON_RADII} horizon radii, for the 10-Sun black hole and for M87*, at {MASS_PANEL_DISTANCE_IN_HORIZON_RADII} horizon radii from the center.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>Black hole</th>
              <th style={headCell}>Wavelength as received</th>
              <th style={headCell}>That distance, in kilometers</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, i) => (
              <tr key={col.presetId}>
                <td style={cell}>{BLACK_HOLE_PRESETS.find((p) => p.id === col.presetId)!.label}</td>
                <td style={cell}>
                  <strong>{withBand(col.wavelengthNm)}</strong> {i === 0 && <GuessTag />}
                </td>
                <td style={cell}>{formatDistance(col.distanceKm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>What it is.</strong> The color the observer receives at the same distance in horizon radii, for two black holes.
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> The two wavelengths are {formatWavelength(columns[0].wavelengthNm)} and {formatWavelength(columns[1].wavelengthNm)}. Only the distance in kilometers differs, {formatDistance(columns[0].distanceKm)} and {formatDistance(columns[1].distanceKm)}.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Why it matters.</strong> It tells which numbers the color depends on. The tutor goes through how your guess compares.
        </p>
      </Note>

      <p style={{ marginBottom: '0.25rem' }}>
        <strong>The simple math: the wavelength as received.</strong> For {partTwo ? 'your run' : 'the fall of Part 1'} ({mathHole}, from rest at {mathStart} horizon radii), the received wavelength at a distance r is <strong>{LAMP_WAVELENGTH_NM} nm × (stretch factor)</strong>, where the stretch factor is
        [E + √(1/r − 1/{mathStart})] ÷ (1 − 1/r), with E = √(1 − 1/{mathStart}), as in Black Holes 6. This is given, not derived. Worked out at r = {mathDistance}:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
        <li>E = √(1 − 1/{mathStart}) = {four(steps.energy)}.</li>
        <li>
          √(1/{mathDistance} − 1/{mathStart}) = {four(steps.speedTerm)}.
        </li>
        <li>1 − 1/{mathDistance} = {four(steps.rootGravity ** 2)}.</li>
        <li>
          The stretch factor is ({four(steps.energy)} + {four(steps.speedTerm)}) ÷ {four(steps.rootGravity ** 2)} = {four(steps.stretch)}.
        </li>
        <li>
          The wavelength as received is {LAMP_WAVELENGTH_NM} nm × {four(steps.stretch)} = <strong>{withBand(steps.wavelengthNm)}</strong>.
        </li>
      </ol>
      <p>
        <strong>The period of the light.</strong> The time between two crests is the wavelength divided by the speed of light. For {LAMP_WAVELENGTH_NM} nm that is {LAMP_WAVELENGTH_NM} nm ÷ 299,792 km/s = {sci(periodEmitted)} seconds at the lamp. At r = {mathDistance} the wavelength is {formatWavelength(steps.wavelengthNm)}, so the
        time between crests is {sci(lightPeriodSeconds(steps.wavelengthNm))} seconds, which is {sci(periodEmitted)} × {four(steps.stretch)}.
      </p>

      <p>
        <strong>A comparison from daily life.</strong> The siren of an ambulance driving steadily away from you sounds lower than the same siren when the ambulance is parked, because its sound waves are stretched out as it moves away. This is an analogy for the effect of the traveler <em>moving away</em> (the motion part)
        only. There is no everyday comparison for the gravity part, which comes from the slowing of clocks near a black hole that you met in Black Holes 2.
      </p>

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
          <strong>What this model can and cannot tell you.</strong> This is a thought experiment about a small lamp shining light of one color straight outward from a traveler who falls straight in from rest. It follows only the <em>wavelength</em>. It does not model how bright the light is, what a camera or telescope would
          show, or whether a real detector could pick up light of these wavelengths. The kinds of light (visible, infrared, microwave, radio) are the usual ranges, and their edges are conventions. It stops close to the horizon: nothing inside is modeled.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The equations are given, not derived, and are for a black hole that does not spin and has no electric charge. Real black holes usually spin, which changes the details. The stellar black hole’s mass of 10 Suns is an illustrative round value.
        </p>
      </div>

      <div
        style={{
          margin: '1.25rem 0 0',
          padding: '0.75rem 1rem',
          border: '1px solid var(--border-color, #ccc)',
          borderRadius: '8px',
          fontSize: '0.875rem',
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem' }}>Seeing near real black holes (outside the model)</h4>
        <p style={{ marginTop: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>This block is outside the model. It describes what NASA, ESO and others have said or observed, and none of it is a falling traveler with a lamp.</p>
        <p style={noteParagraph}>
          <strong>What a far-away watcher is told.</strong> NASA Goddard’s page on a falling explorer (last updated 7 May 2015) says the Watchers “notice that the Explorer now appears to look redder than normal, as light loses energy in its struggle with gravity to pull away from the hole”, which is NASA’s way of putting it, and that just above the horizon “the light has become extremely red and dim”. Nobody has watched a real
          fall.
        </p>
        <p style={noteParagraph}>
          <strong>A real star near a real black hole.</strong> In 2018 ESO’s telescopes followed the star S2 as it passed Sagittarius A*. ESO says “light from the star is stretched to longer wavelengths by the very strong gravitational field of the black hole”, and that the change “agrees precisely with that predicted by Einstein’s theory of general relativity” (ESO, 26 July 2018; the paper is the GRAVITY Collaboration’s, in Astronomy &amp;
          Astrophysics Letters). The effect is called <strong>gravitational redshift</strong>. It is small: S2 stays about 1,400 horizon radii from the black hole, so its light changed by only a small fraction of a percent.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>How this differs from the model.</strong> S2 does not fall in. Our lamp falls straight in, and the model follows it down to {formatGap(near[2].gap)} horizon radii above the horizon. The real measurement shows that light from near a black hole is stretched. It does not show how far it could be stretched. It also includes
          an effect of the star’s own motion. The model’s last wavelength is {withBand(end.wavelengthNm)}, a calculation, not a measurement; its band is {BAND_LABEL[bandOf(end.wavelengthNm)]}.
        </p>
      </div>
    </div>
  )

  function mathDistanceOne() {
    return workedDistance(PART_ONE_START_IN_HORIZON_RADII)
  }
}
