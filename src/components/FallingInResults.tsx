import type { ReactNode } from 'react'
import {
  BODY_LENGTH_METERS,
  GRAVITY_AT_EARTH_SURFACE_ROUNDED,
  LN_10,
  PART_ONE_START_IN_HORIZON_RADII,
  checkUpRows,
  fallRow,
  farClockIncreasesPerTenfoldGap,
  nearHorizonReadings,
  partOneRow,
  stretchGrowth,
  stretchInMetersPerSecondSquared,
  threeHoleRows,
  travelerClockSteps,
} from '../physics/fallingInExperiment'
import type { EndChoice, FallingInResult, FarClockChoice, StretchChoice } from '../physics/fallingInExperiment'
import { FallingInHeldBackLinks, RealThings } from './FallingInIntro'
import {
  endLabel,
  farClockLabel,
  formatBig,
  formatClock,
  formatDistance,
  formatFour,
  formatG,
  formatMass,
  formatNumber,
  formatSeconds,
  stretchLabel,
} from './FallingInPictures'
import { GuessTag, listStyle } from './TidalEffectExperiment'

// Black Holes, Experiment 5 (audit update): Part 3, the results. Nothing here changes with a guess. The guesses are shown beside the results, never
// marked right or wrong (that is the tutor's job, CLAUDE.md §12, §13). Every number comes from the physics module; the interface only shows it. The
// three "your prediction was right / off this time" paragraphs of the earlier page are removed (they move into the tutor's explanation).

const cell = { padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' } as const
const headCell = { ...cell, textAlign: 'left', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-color, #ccc)' } as const
const tableStyle = { fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' } as const
const tableLead = { fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' } as const

function Note({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
        <strong>What this table tells us</strong>
      </p>
      {children}
    </div>
  )
}

function Scroll({ children }: { children: ReactNode }) {
  return <div style={{ overflowX: 'auto', maxWidth: '100%' }}>{children}</div>
}

export interface FallingInResultsProps {
  endGuess: EndChoice
  farClockGuess: FarClockChoice
  stretchGuess: StretchChoice
  partTwo: FallingInResult | null
}

export function FallingInResults({ endGuess, farClockGuess, stretchGuess, partTwo }: FallingInResultsProps) {
  const checkUp = checkUpRows()
  const one = partOneRow()
  const holes = threeHoleRows()
  const near = nearHorizonReadings(PART_ONE_START_IN_HORIZON_RADII)
  const increases = farClockIncreasesPerTenfoldGap(PART_ONE_START_IN_HORIZON_RADII)
  const own = partTwo ? fallRow(partTwo) : null
  const ownHole = partTwo ? partTwo.preset.label.replace(/^A /, 'a ') : ''
  const math = partTwo ?? null
  const mathStart = math ? math.startInHorizonRadii : PART_ONE_START_IN_HORIZON_RADII
  const steps = travelerClockSteps(mathStart)
  const mathRow = own ?? one
  const mathPreset = math ? math.preset : holes[0].preset
  const mathHoleName = mathPreset.label.replace(/^A /, 'a ')
  const mathHorizonKm = math ? math.horizonRadiusKm : holes[0].horizonRadiusKm
  const mathLightTime = math ? math.lightTimeSeconds : one.lightTimeSeconds
  const growth = math ? stretchGrowth(math) : one.stretchAtHorizonInG / one.stretchAtStartInG

  return (
    <div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>How to read these tables.</strong> A table of science numbers is a bit like a blood test: the numbers mean little until someone says what each one is. So under every table there is a note called “What this table tells us”. It says <strong>what it is</strong>, <strong>what it means</strong> with the real
          numbers, and <strong>why it matters</strong>, and, where it is the weak link, <strong>how sure we are</strong>.
        </p>
        <ul style={listStyle}>
          <li>
            <strong>Table 1</strong> checks this page’s calculation against the formulas it is built from.
          </li>
          <li>
            <strong>Table 2</strong> gives the numbers behind the fall you watched in Part 1.
          </li>
          <li>
            <strong>Table 3</strong> gives the numbers for your own fall from Part 2.
          </li>
          <li>
            <strong>Table 4</strong> compares the three black holes for a fall from {PART_ONE_START_IN_HORIZON_RADII} horizon radii.
          </li>
        </ul>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The words “the same” and “more” are this page’s own, not an official scale. The numbers beside them say how much. Nothing here is a measurement of a fall: nothing has ever been dropped into a black hole, and every number is calculated from the equations given on this page.
        </p>
      </div>

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
            <strong>Guess 1:</strong> {endLabel(endGuess)}. The question was: on the traveler’s own watch, does the trip to the horizon come to an end? Its number is the traveler’s clock at the horizon, in Table 2. <GuessTag />
          </li>
          <li>
            <strong>Guess 2:</strong> {farClockLabel(farClockGuess)}. The question was: what does the far-away clock read as the traveler nears the horizon? Its number is the far-away clock row in Table 2, and the check-up’s second row. <GuessTag />
          </li>
          <li>
            <strong>Guess 3:</strong> {stretchLabel(stretchGuess)}. The question was: how does the stretching at the horizon compare between a 10-Sun black hole and Sagittarius A*? Its numbers are the stretch at the horizon in Table 2 and Table 4. <GuessTag />
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
                  {row.what} {i === 1 && <GuessTag />}
                </td>
                <td style={cell}>
                  {formatBig(row.expected)} {row.unit}
                </td>
                <td style={cell}>
                  <strong>{formatBig(row.found)}</strong> {row.unit}
                </td>
                <td style={cell}>
                  <strong>{row.reading}</strong>
                  {row.reading !== 'the same' && <>: by {formatNumber(Math.abs(row.percentAbove))}%</>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> A comparison of the calculation with formulas and separate routes to the same number. It is not a measurement of a fall.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> Row 1: the traveler’s clock from the closed form and from a separate integration both give {formatFour(checkUp[0].found)} light-times. Row 2: when the gap above the horizon shrinks to a tenth, the far-away clock reads {formatFour(checkUp[1].found)} light-times more, {formatNumber(Math.abs(checkUp[1].percentAbove))}% above
          ln 10 = {formatFour(LN_10)}, and it goes on doing so. Row 3: the stretch at the 10-Sun horizon from the page’s formula agrees with the one written from G and the mass. Row 4: the stretch at the horizon of the 10-Sun black hole is {formatBig(checkUp[3].found)} times that of Sagittarius A*, the same as the square of the ratio of their masses.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> It tells you which numbers are the formulas’ own values and which come from stepping an equation. Row 4 is why a bigger black hole stretches gently at its own horizon: the stretch at the same number of horizon radii goes as one over the mass squared.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> The equations are standard general relativity for a black hole that does not spin and has no electric charge, given here and not derived. The check is of the calculation, not of nature.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: The fall of Part 1</h4>
      <p style={tableLead}>
        The 10-Sun black hole (horizon radius {formatDistance(one.startKm / PART_ONE_START_IN_HORIZON_RADII)}), released from rest {PART_ONE_START_IN_HORIZON_RADII} horizon radii ({formatDistance(one.startKm)}) from its center.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <tbody>
            {(
              [
                ["The traveler's clock when they reach the horizon", formatClock(one.clockAtHorizonLightTimes, one.lightTimeSeconds), true],
                [
                  'The far-away clock when the traveler is 0.0001 horizon radii from the horizon',
                  `${formatClock(one.farClockAtCutoffLightTimes, one.lightTimeSeconds)}, and still rising: it has no limit`,
                  true,
                ],
                [`The stretch at the release distance (${PART_ONE_START_IN_HORIZON_RADII} horizon radii)`, formatG(one.stretchAtStartInG), false],
                ['The stretch at the horizon', formatG(one.stretchAtHorizonInG), true],
                [
                  'Where the stretch reaches 1 g',
                  one.oneGRadiusInHorizonRadii === null
                    ? 'Only inside the horizon, which this experiment does not model'
                    : `${formatNumber(one.oneGRadiusInHorizonRadii)} horizon radii from the center, far outside the horizon`,
                  false,
                ],
              ] as Array<[string, string, boolean]>
            ).map(([label, value, tag]) => (
              <tr key={label}>
                <td style={cell}>
                  {label} {tag && <GuessTag />}
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
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> The numbers behind the fall you watched in Part 1.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> The traveler’s own watch reaches the horizon at {formatFour(one.clockAtHorizonLightTimes)} light-times, {formatSeconds(one.clockAtHorizonSeconds)}. Over the last stretch the far-away clock does not settle: at gaps of 0.01, 0.001 and 0.0001 horizon radii it reads{' '}
          {near.map((n) => formatFour(n.farAwayClock)).join(', ')} light-times, about {formatFour(increases[increases.length - 1])} more each time the gap shrinks to a tenth, while the traveler’s own clock reads {near.map((n) => String(Number(n.travelerClock.toPrecision(5)))).join(', ')} and has almost stopped changing. The stretch grows from{' '}
          {formatG(one.stretchAtStartInG)} to {formatG(one.stretchAtHorizonInG)}, {formatNumber(one.stretchAtHorizonInG / one.stretchAtStartInG)} times larger.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> It is one fall timed by two different clocks, plus what the traveler would feel. The tutor goes through how your guesses compare.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> The far-away clock is followed only to a gap of 0.0001 horizon radii, where the drawing ends; it has no limit beyond that. These numbers are calculated here, not observed.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: Your own fall</h4>
      {partTwo && own ? (
        <>
          <p style={tableLead}>
            You released the traveler from rest at <strong>{partTwo.startInHorizonRadii} horizon radii</strong> ({formatDistance(own.startKm)}) from the center of <strong>{ownHole}</strong> ({formatMass(partTwo.preset.massSolarMasses)}).
          </p>
          <Scroll>
            <table style={tableStyle}>
              <tbody>
                {(
                  [
                    ["The traveler's clock when they reach the horizon", formatClock(own.clockAtHorizonLightTimes, own.lightTimeSeconds)],
                    ['The far-away clock when the traveler is 0.0001 horizon radii from the horizon', `${formatClock(own.farClockAtCutoffLightTimes, own.lightTimeSeconds)}, and still rising: it has no limit`],
                    [`The stretch at the release distance (${partTwo.startInHorizonRadii} horizon radii)`, formatG(own.stretchAtStartInG)],
                    ['The stretch at the horizon', formatG(own.stretchAtHorizonInG)],
                    [
                      'Where the stretch reaches 1 g',
                      own.oneGRadiusInHorizonRadii === null
                        ? 'Only inside the horizon, which this experiment does not model'
                        : `${formatNumber(own.oneGRadiusInHorizonRadii)} horizon radii from the center (${formatDistance(own.oneGRadiusInHorizonRadii * partTwo.horizonRadiusKm)}), far outside the horizon`,
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
        <p style={{ ...tableLead, fontWeight: 'bold' }}>Not run yet. Choose a black hole and a release distance in Part 2 and press Run your choice; this table follows your last completed run.</p>
      )}
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> The same kinds of number as Table 2, for the black hole and the release distance you chose.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> Change the black hole and keep the release distance: the traveler’s clock stays at the same number of light-times, but a light-time is longer for a bigger black hole, so the seconds change a great deal; and the stretch at the horizon changes enormously. Change the release distance and keep the
          black hole: the traveler’s clock changes, and the stretch at the release changes with the cube of the distance.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> It lets you test for yourself what depends on the black hole and what does not.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> These are trial values: your own numbers, from this calculation. They do not say the real system is like that. There is no published value to compare them with.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 4: The three black holes, for a fall from {PART_ONE_START_IN_HORIZON_RADII} horizon radii</h4>
      <p style={tableLead}>Calculated here. This table is fixed at {PART_ONE_START_IN_HORIZON_RADII} horizon radii, whatever you ran.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>Black hole</th>
              <th style={headCell}>Horizon radius</th>
              <th style={headCell}>The traveler’s trip to the horizon</th>
              <th style={headCell}>Stretch at the horizon</th>
            </tr>
          </thead>
          <tbody>
            {holes.map((h) => (
              <tr key={h.preset.id}>
                <td style={cell}>
                  {h.preset.label} {h.preset.id !== 'm87-star' && <GuessTag />}
                </td>
                <td style={cell}>{formatDistance(h.horizonRadiusKm)}</td>
                <td style={cell}>{formatSeconds(h.tripSeconds)}</td>
                <td style={cell}>
                  <strong>{formatG(h.stretchAtHorizonInG)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> The same fall, released from the same {PART_ONE_START_IN_HORIZON_RADII} horizon radii, for each of the three black holes.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> The trip is {formatFour(one.clockAtHorizonLightTimes)} light-times for every black hole; in ordinary units it is {holes.map((h) => `${formatSeconds(h.tripSeconds)} for ${h.preset.label.replace(/^A /, 'a ')}`).join(', ')}. The stretch at the horizon is {formatG(holes[0].stretchAtHorizonInG)},{' '}
          {formatG(holes[1].stretchAtHorizonInG)} and {formatG(holes[2].stretchAtHorizonInG)}.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> The same journey in horizon radii is a very different experience in kilometers, seconds and stretch.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> The seconds rest on the masses used in Black Holes 1 (the 10 Suns is a round, typical size). The stretch uses a 2-meter body and a formula given by general relativity for this case.
        </p>
      </Note>

      <RealThings />

      <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
        <strong>The simple math: the traveler’s clock.</strong> For a fall from rest at {mathStart} horizon radii, the traveler’s clock at the horizon is <strong>½ × {mathStart}<sup>1.5</sup> × (η + sin η)</strong> light-times, where η is an angle, in radians, given by cos η = 2 ÷ {mathStart} − 1. This is given, not derived. Worked
        out{math ? '' : ' for the fall of Part 1'}:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
        <li>
          {mathStart}
          <sup>1.5</sup> = {formatFour(steps.startPower)}.
        </li>
        <li>
          cos η = 2 ÷ {mathStart} − 1 = {formatFour(steps.cosEta)}, so η = {formatFour(steps.etaRadians)} radians.
        </li>
        <li>sin η = {formatFour(steps.sinEta)}.</li>
        <li>
          ½ × {formatFour(steps.startPower)} × ({formatFour(steps.etaRadians)} + {formatFour(steps.sinEta)}) = {formatFour(steps.clockAtHorizon)} light-times.
        </li>
        <li>
          One light-time for {mathHoleName} is {formatSeconds(mathLightTime)}, so the trip takes {formatFour(steps.clockAtHorizon)} × {formatSeconds(mathLightTime)} = {formatSeconds(mathRow.clockAtHorizonSeconds)} on the traveler’s own watch.
        </li>
      </ol>
      <p style={{ marginBottom: '0.25rem', fontSize: '0.875rem' }}>
        <strong>The simple math: the stretch.</strong> The difference in pull across a body of length h, at a distance r from the center of a mass M, is <strong>2GM × h ÷ r³</strong> (G is the strength of gravity). This is given, not derived. Worked out for the horizon of {mathHoleName}:
      </p>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
        <li>
          The distance r is one horizon radius: {formatDistance(mathHorizonKm)}, which is {formatNumber(mathHorizonKm * 1000)} meters. The length h is {BODY_LENGTH_METERS} meters.
        </li>
        <li>
          Putting in G and the mass ({formatMass(mathPreset.massSolarMasses)}) gives a stretch of {formatBig(stretchInMetersPerSecondSquared(mathPreset.massSolarMasses, 1))} meters per second, every second (m/s²).
        </li>
        <li>
          Earth’s gravity at its surface is {GRAVITY_AT_EARTH_SURFACE_ROUNDED} m/s², so that is {formatBig(stretchInMetersPerSecondSquared(mathPreset.massSolarMasses, 1))} ÷ {GRAVITY_AT_EARTH_SURFACE_ROUNDED} = {formatG(mathRow.stretchAtHorizonInG)}.
        </li>
        <li>
          Because r is cubed, the stretch grows very fast as the traveler falls: from {mathStart} horizon radii to 1, the distance is {mathStart} times smaller, so the stretch is {mathStart}³ = {formatNumber(growth)} times larger ({formatG(mathRow.stretchAtStartInG)} to {formatG(mathRow.stretchAtHorizonInG)}).
        </li>
      </ol>

      <p style={{ fontSize: '0.875rem' }}>
        <strong>A comparison from daily life.</strong> Picture a long rubber band with one end tied to a post and the other end pulled by a hand. It stretches, because its two ends are not being pulled equally. In a similar way, gravity does not pull the traveler’s two ends equally (it pulls the nearer end harder), so the traveler is stretched.
        This is an analogy for “the two ends are pulled by different amounts”, not for how gravity works.
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
          <strong>What this model can and cannot tell you.</strong> This is a thought experiment about a small traveler, {BODY_LENGTH_METERS} meters long, released from rest and falling straight in. It stops at the horizon: nothing inside is modeled, and this is not the picture a camera or telescope would make. The far-away clock
          is the time on a clock at rest far away when the traveler passes each distance. It is a comparison of two clocks, not what a far-away observer would see.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The equations are given, not derived, and are for a black hole that does not spin and has no electric charge. This page does not model a spinning black hole. The stellar black hole’s mass of 10 Suns is an illustrative round value.
        </p>
      </div>

      <FallingInHeldBackLinks />
    </div>
  )
}
