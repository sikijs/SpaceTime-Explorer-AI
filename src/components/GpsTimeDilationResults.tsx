import type { ReactNode } from 'react'
import {
  ASHBY_PUBLISHED,
  ashbyDistanceKm,
  balanceRadiusCheck,
  distanceEquivalentKm,
  gpsDirectionCheck,
  lowOrbitDirectionCheck,
  netFractionCheck,
  orbitSummary,
  ORBIT_PRESETS_KM,
} from '../physics/gpsTimeDilationExperiment'
import type { MoreLessSameChoice, YesNoChoice } from '../physics/gpsTimeDilationExperiment'
import { signed } from './GpsTimeDilationPictures'
import type { OrbitKey } from './GpsTimeDilationPictures'
import { YOURS_COLOR } from './GravitationalWaveExperiment'
import { GuessTag, listStyle, smallNote } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 9, Part 3: the results (docs/audit/gravity-and-curved-spacetime/09-draft-wording.md, section 5,
// approved by the owner on 2026-11-13). Every number comes from the physics module. The guesses are shown only as guesses: the tutor
// marks them, not this page (CLAUDE.md §12, §13). A number for an orbit that has not run is not shown (§12).

export interface Part3Props {
  done: OrbitKey[]
  guesses: { speed: MoreLessSameChoice; balance: YesNoChoice; gps: MoreLessSameChoice } | null
  // The learner's own altitudes in Part 2, oldest first.
  yours: number[]
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

const notRun = <span style={{ fontStyle: 'italic' }}>not run yet</span>
const fmtKm = (km: number) => `${Math.round(km).toLocaleString('en-US')} km`
const exp10 = (v: number, digits = 3) => {
  const e = Math.floor(Math.log10(Math.abs(v)))
  return `${(v / 10 ** e).toFixed(digits)} × 10⁻${String(Math.abs(e)).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])}`
}

const SPEED_TEXT: Record<MoreLessSameChoice, string> = { more: 'a bigger slowing', less: 'a smaller slowing', same: 'about the same slowing' }
const BALANCE_TEXT: Record<YesNoChoice, string> = { yes: 'Yes, there is a balance altitude', no: 'No, there is not' }
const GPS_TEXT: Record<MoreLessSameChoice, string> = { more: 'faster than a ground clock', less: 'slower than a ground clock', same: 'at the same rate as a ground clock' }

const ROWS: Array<{ key: OrbitKey; name: string }> = [
  { key: 'iss', name: 'ISS' },
  { key: 'gps', name: 'GPS' },
  { key: 'geostationary', name: 'Geostationary' },
]

export function GpsTimeDilationResults({ done, guesses, yours }: Part3Props) {
  const issDone = done.includes('iss')
  const gpsDone = done.includes('gps')
  const curvesDone = done.length === 3
  const anyRun = done.length > 0
  const iss = orbitSummary(ORBIT_PRESETS_KM.iss)
  const gps = orbitSummary(ORBIT_PRESETS_KM.gps)
  const net = netFractionCheck()
  const balance = balanceRadiusCheck()
  const gpsDir = gpsDirectionCheck()
  const lowDir = lowOrbitDirectionCheck()
  const latest = yours.length > 0 ? yours[yours.length - 1] : null
  const latestSummary = latest !== null ? orbitSummary(latest) : null

  return (
    <div style={{ marginTop: '1rem' }}>
      {!anyRun && <p style={smallNote}>Run an orbit in Part 1 to fill in these tables.</p>}
      {anyRun && !curvesDone && (
        <p style={smallNote}>
          <strong>What to do next:</strong> some rows below say &ldquo;not run yet&rdquo;. Run the other orbits in Part 1 to fill them in. A number for an orbit you have not run is not shown.
        </p>
      )}

      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Table 1: the orbits you watched</p>
      <Table
        heads={[
          'Orbit and altitude',
          'Speed',
          <>Speed effect{guesses && curvesDone ? <GuessTag /> : null}</>,
          'Height effect',
          <>Net{guesses && curvesDone ? <GuessTag /> : null}</>,
          'Your guess',
        ]}
      >
        {ROWS.map(({ key, name }) => {
          const ran = done.includes(key)
          const s = orbitSummary(ORBIT_PRESETS_KM[key])
          return (
            <tr key={key}>
              <td style={cell}>
                {name}, {fmtKm(s.altitudeKm)}
              </td>
              <td style={cell}>{ran ? `${s.speedKmPerSecond.toFixed(3)} km/s` : notRun}</td>
              <td style={cell}>{ran ? `${signed(s.speedEffectMicrosecondsPerDay)} µs/day` : notRun}</td>
              <td style={cell}>{ran ? `${signed(s.gravityEffectMicrosecondsPerDay)} µs/day` : notRun}</td>
              <td style={cell}>{ran ? `${signed(s.netMicrosecondsPerDay)} µs/day` : notRun}</td>
              <td style={cell}>
                {key === 'gps' && guesses && ran ? (
                  <>
                    {GPS_TEXT[guesses.gps]}
                    <GuessTag />
                  </>
                ) : (
                  ''
                )}
              </td>
            </tr>
          )
        })}
      </Table>

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> Each row is one real orbit. &ldquo;Speed effect&rdquo; is how much the satellite&rsquo;s motion slows its clock. &ldquo;Height effect&rdquo; is how much being higher in Earth&rsquo;s gravity speeds it up.
          &ldquo;Net&rdquo; is the two added together. All are compared with a clock on the ground. The white tags show where your guesses live; they show the guess only.
        </li>
        <li>
          <strong>What it means.</strong>{' '}
          {gpsDone && issDone ? (
            <>
              At the GPS orbit: {signed(gps.speedEffectMicrosecondsPerDay)} + {gps.gravityEffectMicrosecondsPerDay.toFixed(2)} = {signed(gps.netMicrosecondsPerDay)} µs/day, so the satellite&rsquo;s clock gains about{' '}
              {gps.netMicrosecondsPerDay.toFixed(1)} millionths of a second every day. At the ISS orbit: {signed(iss.speedEffectMicrosecondsPerDay)} + {iss.gravityEffectMicrosecondsPerDay.toFixed(2)} ={' '}
              {signed(iss.netMicrosecondsPerDay)}, so the clock loses about {Math.abs(iss.netMicrosecondsPerDay).toFixed(1)} millionths of a second a day. The sign of the net flips somewhere between the two.
            </>
          ) : (
            'The numbers for this note appear after you have run the ISS and GPS orbits.'
          )}
        </li>
        <li>
          <strong>Why it matters.</strong>{' '}
          {gpsDone ? (
            <>
              A tiny clock error can be turned into a distance. Light travels about 300 metres in one millionth of a second, so a clock error of {gps.netMicrosecondsPerDay.toFixed(1)} µs is about {gps.netMicrosecondsPerDay.toFixed(1)} × 300 m ={' '}
              {distanceEquivalentKm(gps.netMicrosecondsPerDay).toFixed(1)} km of position error after a day (a worked number from the speed of light, 299,792,458 m/s, not a measured figure). Ashby (2003) says a one-nanosecond timing error means a position error of
              about 30 centimetres, which for {Math.round(gps.netMicrosecondsPerDay * 1000).toLocaleString('en-US')} ns is {ashbyDistanceKm(gps.netMicrosecondsPerDay).toFixed(1)} km, and NASA Space Place says uncorrected errors &ldquo;would add up to a few miles each
              day&rdquo;. This is why GPS satellites&rsquo; clocks are deliberately set to correct for it.
            </>
          ) : (
            'This note gives the size of the effect as a distance once the GPS orbit has run.'
          )}
        </li>
        <li>
          <strong>How sure.</strong> The page&rsquo;s numbers use simple formulas and a non-spinning Earth, so they are close to, not identical with, the scientific review&rsquo;s. The check-up below shows by how much.
        </li>
      </Note>

      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.5rem' }}>Table 2, check-up: does this page agree with a scientific review?</p>
      <Table heads={['What we check', 'Expected (published)', 'Found (this page)', 'Reading']}>
        <tr>
          <td style={cell}>Net rate offset of a GPS satellite clock, as a fraction</td>
          <td style={cell}>{exp10(ASHBY_PUBLISHED.netFractionFaster, 4)} faster (Ashby 2003)</td>
          <td style={cell}>{gpsDone ? `${exp10(net.found, 3)} faster` : notRun}</td>
          <td style={cell}>{gpsDone ? `close: ${net.percentApart.toFixed(2)} percent apart` : notRun}</td>
        </tr>
        <tr>
          <td style={cell}>Balance orbit (where the two effects cancel), distance from Earth&rsquo;s centre</td>
          <td style={cell}>about {ASHBY_PUBLISHED.balanceRadiusKm.toLocaleString('en-US')} km (Ashby 2003)</td>
          <td style={cell}>{curvesDone ? `${Math.round(balance.found).toLocaleString('en-US')} km (1.5 Earth radii)` : notRun}</td>
          <td style={cell}>{curvesDone ? `close: ${balance.percentApart.toFixed(2)} percent apart` : notRun}</td>
        </tr>
        <tr>
          <td style={cell}>Which way does a GPS satellite&rsquo;s clock run?</td>
          <td style={cell}>{gpsDir.expected} than a ground clock (Ashby 2003; NASA Space Place)</td>
          <td style={cell}>{gpsDone ? gpsDir.found : notRun}</td>
          <td style={cell}>{gpsDone ? (gpsDir.same ? 'the same' : 'different') : notRun}</td>
        </tr>
        <tr>
          <td style={cell}>Which effect wins for a low orbit (a Space Shuttle orbit)?</td>
          <td style={cell}>the speed effect wins, so the clock runs {lowDir.expected} (Ashby 2003)</td>
          <td style={cell}>{issDone ? `the speed effect wins at the ISS orbit (${signed(iss.netMicrosecondsPerDay)} µs/day): ${lowDir.found}` : notRun}</td>
          <td style={cell}>{issDone ? (lowDir.same ? 'the same' : 'different') : notRun}</td>
        </tr>
      </Table>

      <Note title="What this table tells us">
        <li>
          <strong>What it is.</strong> Each row compares something this page calculated with a published scientific review of the same system. The first two rows compare numbers. The last two compare only which way things go.
        </li>
        <li>
          <strong>What it means.</strong>{' '}
          {gpsDone && curvesDone ? (
            <>
              The page&rsquo;s net rate offset, {exp10(net.found, 3)}, is within {net.percentApart.toFixed(2)} percent of the review&rsquo;s {exp10(ASHBY_PUBLISHED.netFractionFaster, 4)}. The balance distance from Earth&rsquo;s centre,{' '}
              {Math.round(balance.found).toLocaleString('en-US')} km against about {ASHBY_PUBLISHED.balanceRadiusKm.toLocaleString('en-US')} km, is within {balance.percentApart.toFixed(2)} percent. The review also gets the same two directions: a GPS clock runs fast,
              and a low orbit&rsquo;s clock runs slow because its speed effect wins.
            </>
          ) : (
            'The numbers for this note appear after you have run all three orbits.'
          )}
        </li>
        <li>
          <strong>Why it matters.</strong> It shows that the simple formulas on this page, with real numbers, give almost what a scientific review of the real GPS system gets. It also shows where they differ.
        </li>
        <li>
          <strong>How sure.</strong> The small difference is expected. The review measures the ground clock on the spinning Earth&rsquo;s surface (it calls this &ldquo;the rotating geoid&rdquo;) and includes Earth&rsquo;s spin in the height effect, and this page does not. The
          numbers are quoted from one published review, read in part through a summary on 2026-11-13; they are not a measurement made here.
        </li>
      </Note>

      {guesses && anyRun && (
        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Your guesses, beside the results</p>
          <ul style={listStyle}>
            <li>
              The slowing as the orbit gets higher: <strong>{SPEED_TEXT[guesses.speed]}</strong> (the Speed effect column of Table 1).
            </li>
            <li>
              Is there a balance altitude: <strong>{BALANCE_TEXT[guesses.balance]}</strong> (the Net column of Table 1).
            </li>
            <li>
              The GPS satellite&rsquo;s clock: <strong>{GPS_TEXT[guesses.gps]}</strong> (the GPS row of Table 1).
            </li>
          </ul>
          <p style={{ ...smallNote, marginTop: '0.25rem' }}>Your guesses never change these tables. The tutor marks them.</p>
        </div>
      )}

      {latest !== null && latestSummary && (
        <p style={{ marginTop: '1.25rem', fontSize: '0.875rem', color: YOURS_COLOR }}>
          <strong>Your latest altitude, {fmtKm(latest)}:</strong> speed effect {signed(latestSummary.speedEffectMicrosecondsPerDay)} µs/day, height effect {signed(latestSummary.gravityEffectMicrosecondsPerDay)}, net{' '}
          {signed(latestSummary.netMicrosecondsPerDay)}. These are trial values of your own; they do not say a real satellite is there.
        </p>
      )}
    </div>
  )
}
