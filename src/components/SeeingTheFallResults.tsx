import type { ReactNode } from 'react'
import {
  FLASH_COUNT,
  NEAR_HORIZON_GAPS,
  PART_ONE_START_IN_HORIZON_RADII,
  arrivalIncreasesPerTenfoldGap,
  checkUpRows,
  fallRow,
  nearHorizonReadings,
  partOneRow,
  runPartOne,
  stretchRatiosPerTenfoldGap,
  workedDistance,
  workedSteps,
} from '../physics/seeingTheFallExperiment'
import type { CauseChoice, LastFlashChoice, SeeingTheFallResult, SpacingChoice } from '../physics/seeingTheFallExperiment'
import { causeLabel, lastFlashLabel, spacingLabel } from './SeeingTheFallChoices'
import { GuessTag, listStyle } from './TidalEffectExperiment'

// Black Holes, Experiment 6 (audit update): Part 3, the results (docs/audit/black-holes-and-strong-gravity/06-draft-wording.md, section 7).
// Nothing here changes with a guess. The guesses are shown beside the results, never marked right or wrong (that is the tutor's job,
// CLAUDE.md §12, §13). Every number comes from the physics module; the interface only formats it (§9). The parent mounts this only after the
// first Run.

const KM_PER_AU = 149_597_870.7

// Three significant figures, with no trailing zeros ("10", "2.95", "235,571").
function formatNumber(value: number): string {
  if (value >= 1000) return Number(value.toPrecision(3)).toLocaleString('en-US')
  return String(Number(value.toPrecision(3)))
}

const four = (v: number) => v.toFixed(4)

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

// A number in plain form when it is moderate, as a power of ten when it is very large or very small.
function formatBig(value: number): string {
  if (value >= 0.01 && value < 10_000) return formatNumber(value)
  const exponent = Math.floor(Math.log10(value))
  const mantissa = Number((value / 10 ** exponent).toPrecision(2))
  return `${mantissa} × 10${String(exponent)
    .split('')
    .map((ch) => SUPERSCRIPT[ch])
    .join('')}`
}

function formatLength(km: number): string {
  if (km < 1) return `${formatNumber(km * 1000)} m`
  if (km < 1e6) return `${formatNumber(km)} km`
  if (km < 1e9) return `${formatNumber(km / 1e6)} million km`
  if (km < 1e12) return `${formatNumber(km / 1e9)} billion km`
  return `${formatNumber(km / 1e12)} trillion km`
}

function formatDistance(km: number): string {
  return km >= 7.5e6 ? `${formatLength(km)}, about ${formatNumber(km / KM_PER_AU)} AU` : formatLength(km)
}

function formatMass(solarMasses: number): string {
  if (solarMasses < 1e3) return `${solarMasses} solar masses`
  if (solarMasses < 1e9) return `${solarMasses / 1e6} million solar masses`
  return `${solarMasses / 1e9} billion solar masses`
}

function formatSeconds(seconds: number): string {
  if (seconds < 0.001) return `${formatNumber(seconds * 1e6)} millionths of a second`
  if (seconds < 0.1) return `${formatNumber(seconds * 1000)} thousandths of a second`
  if (seconds < 120) return `${formatNumber(seconds)} seconds`
  if (seconds < 7200) return `${formatNumber(seconds / 60)} minutes`
  if (seconds < 172_800) return `${formatNumber(seconds / 3600)} hours`
  if (seconds < 3.156e7) return `${formatNumber(seconds / 86_400)} days`
  return `${formatNumber(seconds / 3.156e7)} years`
}

// The gap between a found number and its reference, in percent, written plainly.
function formatPercent(percent: number): string {
  const size = Math.abs(percent)
  if (size === 0) return '0%'
  if (size < 0.0001) return 'less than 0.0001%'
  return `${Number(size.toPrecision(2))}%`
}

const withSeconds = (lightTimes: number, lightTimeSeconds: number) => `${formatNumber(lightTimes)} light-times (${formatSeconds(lightTimes * lightTimeSeconds)})`

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

export interface SeeingTheFallResultsProps {
  spacingGuess: SpacingChoice
  lastFlashGuess: LastFlashChoice
  causeGuess: CauseChoice
  partTwo: SeeingTheFallResult | null
}

export function SeeingTheFallResults({ spacingGuess, lastFlashGuess, causeGuess, partTwo }: SeeingTheFallResultsProps) {
  const checkUp = checkUpRows()
  const one = partOneRow()
  const run = runPartOne()
  const near = nearHorizonReadings(PART_ONE_START_IN_HORIZON_RADII)
  const arrivalIncreases = arrivalIncreasesPerTenfoldGap(PART_ONE_START_IN_HORIZON_RADII)
  const stretchRatios = stretchRatiosPerTenfoldGap(PART_ONE_START_IN_HORIZON_RADII)
  const own = partTwo ? fallRow(partTwo) : null
  const ownHole = partTwo ? partTwo.preset.label.replace(/^A /, 'a ') : ''
  const math = partTwo ?? run
  const mathStart = math.startInHorizonRadii
  const mathDistance = workedDistance(mathStart)
  const steps = workedSteps(mathStart)
  const mathHole = math.preset.label.replace(/^A /, 'a ')
  const lt = one.lightTimeSeconds
  const holeRadiusKm = run.horizonRadiusKm
  const last = FLASH_COUNT - 1
  const lastRatio = stretchRatios[stretchRatios.length - 1]
  const lastIncrease = arrivalIncreases[arrivalIncreases.length - 1]

  const rowsOne: Array<[string, ReactNode, ReactNode]> = [
    ['The gap between flashes, as sent (the same for every pair)', withSeconds(one.spacing.firstSent, lt), null],
    ['The gap between flashes 0 and 1, as received', withSeconds(one.spacing.firstReceived, lt), null],
    [`The gap between flashes ${last - 1} and ${last}, as received`, withSeconds(one.spacing.lastReceived, lt), <GuessTag key="g1a" />],
    ['The stretch factor between flashes 0 and 1', `${formatNumber(one.spacing.firstStretch)} (the gap as received divided by the gap as sent)`, null],
    [`The stretch factor between flashes ${last - 1} and ${last}`, formatNumber(one.spacing.lastStretch), <GuessTag key="g1b" />],
    [`The observer's clock when flash ${last} arrives (the last flash sent before the horizon)`, withSeconds(one.lastFlashBeforeHorizonArrival, lt), null],
    [
      `Flash ${FLASH_COUNT}, sent as the traveler reaches the horizon`,
      `Never arrives (it is sent when the traveler's watch reads ${withSeconds(one.travelerWatchAtHorizon, lt)})`,
      <GuessTag key="g2" />,
    ],
  ]

  return (
    <div>
      <p style={{ marginTop: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Here are the numbers behind the pictures. Under each table a short note says <strong>what it is</strong>, <strong>what it means</strong> with the real numbers, and <strong>why it matters</strong>. The tables stay the same however you guess. Nothing here is a measurement of a
        fall: nothing has ever been dropped into a black hole, and every number in these tables is calculated from the equations given on this page. The words “the same”, “more” and “less” are this page’s own, not an official scale; the numbers beside them say how much.
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
            <strong>Guess 1:</strong> {spacingLabel(spacingGuess)}. The question was: as the traveler nears the horizon, how do the flashes arrive? Its numbers are the gaps as received and the stretch factor for the last pair of flashes in Table 2, and the stretch factors in Table 4. <GuessTag />
          </li>
          <li>
            <strong>Guess 2:</strong> {lastFlashLabel(lastFlashGuess)}. The question was: does the observer ever receive the flash sent as the traveler crosses the horizon? Its number is the flash 20 row in Table 2, and the arrival times in Table 4. <GuessTag />
          </li>
          <li>
            <strong>Guess 3:</strong> {causeLabel(causeGuess)}. The question was: which effect changes how far apart the flashes arrive? Its numbers are the gravity part and the motion part in the first row of Table 1. <GuessTag />
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
            {checkUp.map((row, i) => (
              <tr key={row.what}>
                <td style={cell}>
                  {row.what} {i === 0 && <GuessTag />}
                </td>
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
          <strong>Gravity times motion.</strong> <em>What it is:</em> the stretch factor at {workedDistance(PART_ONE_START_IN_HORIZON_RADII)} horizon radii can be found in two ways: as one formula, or as a gravity part multiplied by a motion part. <em>What it means:</em> the two routes give {formatBig(checkUp[0].expected)} and {formatBig(checkUp[0].found)}, which is {checkUp[0].reading}. <em>Why it matters:</em> it shows that the two parts you see in Picture 2 really do multiply to the total.
        </p>
        <p style={noteParagraph}>
          <strong>The tenfold rule.</strong> <em>What it is:</em> every time the gap above the horizon shrinks to a tenth, the stretch factor is about ten times bigger and the observer’s clock reads about 2 ln 10 = {formatBig(checkUp[3].expected)} light-times more. <em>What it means:</em> rows 3 and 4 find {formatBig(checkUp[2].found)} against {formatBig(checkUp[2].expected)} (stretch factor × gap against 2E) and{' '}
          {formatBig(checkUp[3].found)} against {formatBig(checkUp[3].expected)} (the extra reading), with readings of “{checkUp[2].reading}” and “{checkUp[3].reading}”. <em>Why it matters:</em> there is no gap small enough to stop the growth.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure these are.</strong> <em>What it is:</em> every “expected” number comes from the same theory as the calculation, so the check is of the calculation against itself, not of nature. <em>What it means:</em> they have been checked against each other, not against a measured fall. <em>Why it matters:</em> no fall into a black hole has been measured. The equations are given here, not derived, and are for a black hole that does not spin and has no electric charge.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: The fall of Part 1</h4>
      <p style={tableLead}>
        The 10-Sun black hole (horizon radius {formatDistance(holeRadiusKm)}), released from rest {PART_ONE_START_IN_HORIZON_RADII} horizon radii ({formatDistance(one.startKm)}) from its center. {FLASH_COUNT + 1} flashes were sent at equal steps of the traveler’s own watch.
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
          <strong>What it means.</strong> The flashes were sent {formatNumber(one.spacing.firstSent)} light-times apart on the traveler’s watch, every time. The observer received the first two {formatNumber(one.spacing.firstReceived)} apart and the last two before the horizon {formatNumber(one.spacing.lastReceived)} apart, so the stretch factor grows from{' '}
          {formatNumber(one.spacing.firstStretch)} to {formatNumber(one.spacing.lastStretch)}. Flash {FLASH_COUNT}, sent as the traveler reaches the horizon, has no arrival time in this table.
        </p>
        <p style={noteParagraph}>
          <strong>Why it matters.</strong> It is one fall described by two clocks: the one the traveler wears and the one the observer has. The tutor goes through how your guesses compare.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> These numbers are calculated here, not observed, for a thin flash sent straight outward.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: Your own run</h4>
      {partTwo && own ? (
        <>
          <p style={tableLead}>
            You released the traveler from rest at <strong>{partTwo.startInHorizonRadii} horizon radii</strong> ({formatDistance(own.startKm)}) from the center of <strong>{ownHole}</strong> ({formatMass(partTwo.preset.massSolarMasses)}); one horizon light-time for it is {formatSeconds(own.lightTimeSeconds)}.
          </p>
          <Scroll>
            <table style={tableStyle}>
              <tbody>
                {(
                  [
                    ['The gap between flashes, as sent (the same for every pair)', withSeconds(own.spacing.firstSent, own.lightTimeSeconds)],
                    ['The gap between flashes 0 and 1, as received', withSeconds(own.spacing.firstReceived, own.lightTimeSeconds)],
                    [`The gap between flashes ${last - 1} and ${last}, as received`, withSeconds(own.spacing.lastReceived, own.lightTimeSeconds)],
                    ['The stretch factor between flashes 0 and 1', formatNumber(own.spacing.firstStretch)],
                    [`The stretch factor between flashes ${last - 1} and ${last}`, formatNumber(own.spacing.lastStretch)],
                    [`The observer's clock when flash ${last} arrives (the last flash sent before the horizon)`, withSeconds(own.lastFlashBeforeHorizonArrival, own.lightTimeSeconds)],
                    [
                      `Flash ${FLASH_COUNT}, sent as the traveler reaches the horizon`,
                      `Never arrives (it is sent when the traveler's watch reads ${withSeconds(own.travelerWatchAtHorizon, own.lightTimeSeconds)})`,
                    ],
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
        </>
      ) : (
        <p style={{ ...tableLead, fontWeight: 'bold' }}>Not run yet. Choose a black hole and a distance in Part 2, then press Run your choice.</p>
      )}
      <Note>
        <p style={noteParagraph}>
          <strong>What it is.</strong> The same kinds of number as Table 2, for the black hole and the release distance you chose.
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> Change the black hole and keep the release distance: the numbers in light-times stay the same, but one light-time is longer for a bigger black hole, so the seconds change a great deal. Change the release distance and keep the black hole: the gaps as received and the stretch factors change.
        </p>
        <p style={noteParagraph}>
          <strong>Why it matters.</strong> It lets you test for yourself what depends on the black hole and what depends on the release distance.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> These are trial values: your own numbers, from this calculation. They do not say the real system is like that.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 4: Close to the horizon</h4>
      <p style={tableLead}>Calculated here. This table is fixed at the fall of Part 1 (release at {PART_ONE_START_IN_HORIZON_RADII} horizon radii), whatever you ran in Part 2.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>Gap above the horizon (horizon radii)</th>
              <th style={headCell}>Stretch factor</th>
              <th style={headCell}>The observer’s clock at arrival (light-times)</th>
            </tr>
          </thead>
          <tbody>
            {near.map((n, i) => (
              <tr key={NEAR_HORIZON_GAPS[i]}>
                <td style={cell}>{n.gapInHorizonRadii}</td>
                <td style={cell}>
                  <strong>{formatBig(n.stretch)}</strong> {i === near.length - 1 && <GuessTag />}
                </td>
                <td style={cell}>
                  <strong>{formatNumber(n.arrival)}</strong> {i === near.length - 1 && <GuessTag />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={noteParagraph}>
          <strong>What it is.</strong> The stretch factor and the arrival time of the flash sent at three gaps above the horizon, for the Part 1 fall.
        </p>
        <p style={noteParagraph}>
          <strong>What it means.</strong> Each row has a gap ten times smaller than the one above. Each time, the stretch factor is about {formatNumber(lastRatio)} times larger and the arrival is about {formatNumber(lastIncrease)} light-times later. This keeps going for every smaller gap.
        </p>
        <p style={noteParagraph}>
          <strong>Why it matters.</strong> The numbers never settle. They keep rising for every smaller gap, and the flash sent at the horizon would be at a gap of zero above the horizon, so there is no number at which it arrives. The table follows the flashes only down to a gap of {NEAR_HORIZON_GAPS[NEAR_HORIZON_GAPS.length - 1]} horizon radii, where the drawing ends.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> The numbers are calculated here, from the equations given on this page, not observed.</p>
      </Note>

      <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
        <strong>The simple math: the stretch factor.</strong> For a fall from rest at {mathStart} horizon radii, the stretch factor at a distance r is <strong>(gravity part) × (motion part)</strong>, where the gravity part is 1 ÷ √(1 − 1/r) and the motion part is [E + √(1/r − 1/{mathStart})] ÷ √(1 − 1/r), with E = √(1 − 1/{mathStart}). This is given, not derived. Worked out for{' '}
        {partTwo ? `your run (${mathHole})` : 'the fall of Part 1'} at r = {mathDistance}:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
        <li>
          E = √(1 − 1/{mathStart}) = {four(steps.energy)}.
        </li>
        <li>
          √(1 − 1/{mathDistance}) = {four(steps.rootGravity)}, so the gravity part is 1 ÷ {four(steps.rootGravity)} = {four(steps.gravity)}.
        </li>
        <li>
          √(1/{mathDistance} − 1/{mathStart}) = {four(steps.speedTerm)}, so the motion part is ({four(steps.energy)} + {four(steps.speedTerm)}) ÷ {four(steps.rootGravity)} = {four(steps.motion)}.
        </li>
        <li>
          The stretch factor is {four(steps.gravity)} × {four(steps.motion)} = {four(steps.total)}.
        </li>
      </ol>

      <p style={{ fontSize: '0.875rem' }}>
        <strong>A comparison from daily life.</strong> Picture a friend walking steadily away from you, tossing you a ball once every second. Each ball has a little further to travel than the one before, so the balls reach you slightly more than a second apart, even though they were tossed exactly a second apart. The further away the thrower, the longer each toss takes to arrive. This is an analogy for the effect of the traveler{' '}
        <em>moving away</em> (the motion part) only. There is no everyday comparison for the gravity part, which comes from the slowing of clocks near a black hole that you met in Black Holes 2.
      </p>

      <div
        style={{
          margin: '0.75rem 0',
          padding: '0.75rem 1rem',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          fontSize: '0.875rem',
        }}
      >
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What this model can and cannot tell you.</strong> This is a thought experiment about thin flashes of light sent straight outward by a small traveler who falls straight in from rest. It follows only the <em>timing</em> of the flashes. It does not model how bright they are, what color they become, or what a camera or telescope would show, and it does not say the last flashes could be detected in
          practice. It stops at the horizon: nothing inside is modeled.
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
        <p style={{ marginTop: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          This block is outside the model. It describes what NASA, ESO and others have said or observed, and none of it is a falling traveler.
        </p>
        <p style={noteParagraph}>
          <strong>What a far-away watcher is told.</strong> NASA Goddard’s page on a falling explorer (last updated 7 May 2015) says the Watchers see her clock running slow, and that she never appears to cross the event horizon, but seems to hover just above it for infinite time. NASA’s 2024 visualization page (6 May 2024) says a camera falling in would seem to slow and freeze just short of the horizon. These are descriptions, like this
          experiment; nobody has watched a real fall.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>Light from close to a real black hole.</strong> In 2018 ESO’s GRAVITY instrument saw clumps of gas swirling around at about 30 percent of the speed of light on a circular orbit just outside the event horizon of Sagittarius A*, the first time material has been observed orbiting that close to the point of no return (ESO, 31 October 2018). In 2021 NuSTAR and XMM-Newton saw X-rays that had been bent around a supermassive black hole arrive at the
          telescopes with a delay of several minutes (NuSTAR, Caltech, 4 August 2021). <strong>These are real light, from outside the horizon.</strong> They are not a falling traveler, and they are not a thin flash sent straight outward, so they do not show whether anyone sees a crossing.
        </p>
      </div>
    </div>
  )
}
