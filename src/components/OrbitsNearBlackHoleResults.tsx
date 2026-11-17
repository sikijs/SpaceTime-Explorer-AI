import type { ReactNode } from 'react'
import {
  FAR_START_IN_HORIZON_RADII,
  LAST_SAFE_ORBIT_IN_HORIZON_RADII,
  MAX_TURNS,
  NUDGE,
  PART_ONE_START_IN_HORIZON_RADII,
  checkUpRows,
  lastSafeOrbitRows,
  modelEdgeInHorizonRadii,
  realStarRows,
  speedGapPercent,
  wobblePercent,
} from '../physics/orbitsNearBlackHoleExperiment'
import type {
  FarGuess,
  LastSafeGuess,
  NudgeGuess,
  OrbitsNearBlackHoleResult,
} from '../physics/orbitsNearBlackHoleExperiment'
import { GuessTag, listStyle } from './TidalEffectExperiment'
import {
  farLabel,
  formatDistance,
  formatLength,
  formatMass,
  formatNumber,
  formatRadii,
  lastSafeLabel,
  nudgeLabel,
  pathSummary,
} from './OrbitsNearBlackHolePictures'

// Black Holes, Experiment 3 (audit update): Part 3, the results. Nothing here changes with a guess. The guesses are shown beside the results,
// never marked right or wrong (that is the tutor's job, CLAUDE.md §12, §13). Every number comes from the physics module; the interface only
// shows it and does the plain arithmetic of a worked example on module values. The three "your prediction was right / off this time"
// paragraphs of the earlier page are removed (they move into the tutor's explanation).

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

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

export interface OrbitsNearBlackHoleResultsProps {
  partOne: OrbitsNearBlackHoleResult
  farPair: OrbitsNearBlackHoleResult
  nudgeGuess: NudgeGuess
  lastSafeGuess: LastSafeGuess
  farGuess: FarGuess
  partTwo: OrbitsNearBlackHoleResult | null
}

export function OrbitsNearBlackHoleResults({ partOne, farPair, nudgeGuess, lastSafeGuess, farGuess, partTwo }: OrbitsNearBlackHoleResultsProps) {
  const checkUp = checkUpRows()
  const edge = modelEdgeInHorizonRadii()
  const lastSafeRows = lastSafeOrbitRows()
  const [s2, s301] = realStarRows()
  const own = partTwo ?? partOne
  const ownHole = own.preset.label.replace(/^A /, 'a ')
  const perSun = own.horizonRadiusKm / own.preset.massSolarMasses
  const startIsOwn = partTwo !== null

  return (
    <div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>How to read these tables.</strong> A table of science numbers is a bit like a blood test: the numbers mean little until someone says what each one is. So under
          every table there is a note called “What this table tells us”. It says <strong>what it is</strong>, <strong>what it means</strong> with the real numbers, and{' '}
          <strong>why it matters</strong>, and, where it is the weak link, <strong>how sure we are</strong>.
        </p>
        <ul style={listStyle}>
          <li>
            <strong>Table 1</strong> checks this page’s model against the formulas it is built from.
          </li>
          <li>
            <strong>Table 2</strong> gives the numbers behind the two runs you watched in Part 1.
          </li>
          <li>
            <strong>Table 3</strong> gives the numbers for your own run from Part 2.
          </li>
          <li>
            <strong>Table 4</strong> shows where the last safe orbit sits for the three black holes, and where two real stars come closest to the one at the center of our galaxy.
          </li>
        </ul>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The words “the same”, “more” and “less” are this page’s own, not an official scale. The numbers beside them say how much. Where a number is calculated here and has not been
          measured, the note says so.
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
          <strong>Your guesses, beside the results.</strong> They are shown as you made them, and nothing here says whether they are right. The tutor does that. To compare, find the row with
          the white “your guess” tag and look at its numbers.
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Guess 1:</strong> {nudgeLabel(nudgeGuess)}. The question was: what happens to a probe circling at {PART_ONE_START_IN_HORIZON_RADII} horizon radii when it gets a tiny nudge inward? Its numbers
            are the probes’ rows at {PART_ONE_START_IN_HORIZON_RADII} horizon radii in Table 2. <GuessTag />
          </li>
          <li>
            <strong>Guess 2:</strong> {lastSafeLabel(lastSafeGuess)}. The question was: where is the last safe place to circle? Its numbers are the last-safe-orbit rows in Table 2 and Table 4. <GuessTag />
          </li>
          <li>
            <strong>Guess 3:</strong> {farLabel(farGuess)}. The question was: at {FAR_START_IN_HORIZON_RADII} horizon radii, does the exact theory’s orbit look different from ordinary gravity’s? Its numbers are the
            probes’ rows at {FAR_START_IN_HORIZON_RADII} horizon radii in Table 2. <GuessTag />
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: A check-up on the model</h4>
      <p style={tableLead}>Each row sets what we expect (a formula the model is built from, or a figure already used in Black Holes 1) beside what this page’s model gives, with a plain reading.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>What we compared</th>
              <th style={headCell}>Expected</th>
              <th style={headCell}>This model gives</th>
              <th style={headCell}>Reading</th>
            </tr>
          </thead>
          <tbody>
            {checkUp.map((row, i) => (
              <tr key={row.what}>
                <td style={cell}>
                  {row.what} {i === 0 && <GuessTag />}
                </td>
                <td style={cell}>{row.expected}</td>
                <td style={cell}>
                  <strong>{i === 4 ? row.found.toFixed(2) : row.found.toFixed(3)}</strong>
                </td>
                <td style={cell}>
                  <strong>{row.reading}</strong>
                  {i === 0 && <>: by {formatNumber(((row.found - LAST_SAFE_ORBIT_IN_HORIZON_RADII) / LAST_SAFE_ORBIT_IN_HORIZON_RADII) * 100)}%</>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> A comparison of the model with the formulas it is built from. It is not a measurement of an orbit: nobody has put a probe at these distances.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> The launch speeds agree with their formulas exactly: the model is using the formulas it says it uses. The last safe orbit does not agree exactly: the
          model’s edge is at {edge.toFixed(3)} horizon radii, a little more than the exact theory’s {LAST_SAFE_ORBIT_IN_HORIZON_RADII}. The gap is the nudge: the exact theory’s number is for a nudge that is
          vanishingly small, and ours is small but not zero ({NUDGE} of the distance for each radian swept). An orbit that starts just outside {LAST_SAFE_ORBIT_IN_HORIZON_RADII} needs only a little push to be sent over the edge.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> It tells you which numbers to trust as the formulas’ own values and which depend on a choice we made. The edge at {LAST_SAFE_ORBIT_IN_HORIZON_RADII} is the exact theory’s; the {edge.toFixed(2)} is this model’s, with this nudge.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> The formulas are standard general relativity for a black hole that does not spin and has no electric charge, given here and not derived. A smaller nudge would move
          the model’s edge nearer {LAST_SAFE_ORBIT_IN_HORIZON_RADII}.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: The two runs of Part 1</h4>
      <p style={tableLead}>
        The black hole is {partOne.preset.label.toLowerCase()} ({formatMass(partOne.preset.massSolarMasses)}); the horizon radius is {formatNumber(partOne.horizonRadiusKm)} km.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>What</th>
              <th style={headCell}>Result</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                [`The ordinary-gravity probe (gold) at ${PART_ONE_START_IN_HORIZON_RADII} horizon radii`, pathSummary(partOne.ordinary, PART_ONE_START_IN_HORIZON_RADII), 'guess 1'],
                [`The exact-theory probe (blue) at ${PART_ONE_START_IN_HORIZON_RADII} horizon radii`, pathSummary(partOne.exact, PART_ONE_START_IN_HORIZON_RADII), 'guess 1'],
                [
                  'Launch speeds at 2 horizon radii (ordinary, exact)',
                  `${partOne.ordinarySpeedFractionOfLight.toFixed(3)} and ${partOne.exactSpeedFractionOfLight.toFixed(3)} of the speed of light`,
                  '',
                ],
                [
                  'The last safe orbit of the exact theory',
                  `${LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii, which is ${formatDistance(partOne.lastSafeOrbitKm)} from the center of this black hole`,
                  'guess 2',
                ],
                [
                  'The edge found in this model, with this nudge',
                  `${edge.toFixed(2)} horizon radii, which is ${formatDistance(edge * partOne.horizonRadiusKm)}`,
                  'guess 2',
                ],
                [`The ordinary-gravity probe (gold) at ${FAR_START_IN_HORIZON_RADII} horizon radii`, pathSummary(farPair.ordinary, FAR_START_IN_HORIZON_RADII), 'guess 3'],
                [`The exact-theory probe (blue) at ${FAR_START_IN_HORIZON_RADII} horizon radii`, pathSummary(farPair.exact, FAR_START_IN_HORIZON_RADII), 'guess 3'],
                [
                  `Launch speeds at ${FAR_START_IN_HORIZON_RADII} horizon radii (ordinary, exact)`,
                  `${farPair.ordinarySpeedFractionOfLight.toFixed(3)} and ${farPair.exactSpeedFractionOfLight.toFixed(3)} of the speed of light, which differ by ${formatNumber(speedGapPercent(FAR_START_IN_HORIZON_RADII))}%`,
                  'guess 3',
                ],
              ] as Array<[string, string, string]>
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
          <strong>What it is.</strong> What each probe did in the two runs you watched, and the numbers the pictures were drawn from.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> At {PART_ONE_START_IN_HORIZON_RADII} horizon radii the blue probe reached the horizon after about {partOne.exact.turnsCompleted.toFixed(1)} turns, while the gold probe stayed within{' '}
          {formatNumber(wobblePercent(partOne.ordinary, PART_ONE_START_IN_HORIZON_RADII))}% of its starting distance for all {MAX_TURNS} turns. At {FAR_START_IN_HORIZON_RADII} horizon radii both kept circling, the blue within{' '}
          {formatNumber(wobblePercent(farPair.exact, FAR_START_IN_HORIZON_RADII))}% and the gold within {formatNumber(wobblePercent(farPair.ordinary, FAR_START_IN_HORIZON_RADII))}%.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> The two rules gave the same result far out and different results close in: the extra pull the exact theory adds is negligible far away and strong close in. The tutor goes
          through how your guesses compare.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> These paths are calculated here by stepping the equations in small, equal angles ({formatNumber(720)} steps per turn). They are not observations. The turns to plunge depend on the nudge, which is a choice we made.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: Your own run</h4>
      {partTwo ? (
        <>
          <p style={tableLead}>
            You started both probes at <strong>{formatRadii(partTwo.startInHorizonRadii)} horizon radii</strong> ({formatDistance(partTwo.startKm)}) from the center of <strong>{ownHole}</strong> (
            {formatMass(partTwo.preset.massSolarMasses)}), and gave each a tiny inward nudge.
          </p>
          <Scroll>
            <table style={tableStyle}>
              <tbody>
                {(
                  [
                    ['The ordinary-gravity probe (gold)', pathSummary(partTwo.ordinary, partTwo.startInHorizonRadii)],
                    ['The exact-theory probe (blue)', pathSummary(partTwo.exact, partTwo.startInHorizonRadii)],
                    ['Launch speed, ordinary gravity', `${partTwo.ordinarySpeedFractionOfLight.toFixed(3)} of the speed of light`],
                    [
                      'Launch speed, exact theory',
                      `${partTwo.exactSpeedFractionOfLight.toFixed(3)} of the speed of light, which is ${formatNumber((partTwo.exactSpeedFractionOfLight / partTwo.ordinarySpeedFractionOfLight - 1) * 100)}% more than ordinary gravity’s`,
                    ],
                    [
                      'The last safe orbit of the exact theory',
                      `${LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii, which is ${formatDistance(partTwo.lastSafeOrbitKm)} from the center of ${ownHole}`,
                    ],
                    [
                      'The edge found in this model, with this nudge',
                      `${edge.toFixed(2)} horizon radii, which is ${formatDistance(edge * partTwo.horizonRadiusKm)}`,
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
        <p style={{ ...tableLead, fontWeight: 'bold' }}>Not run yet. Choose a black hole and a start in Part 2 and press Run your choice; this table follows your last completed run.</p>
      )}
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> The same numbers as Table 2, for the black hole and the start you chose.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> Change the black hole and keep the start: the kilometers change a great deal, but the outcome in horizon radii does not. Change the start and keep the black hole: the outcome changes,
          and the blue probe stops plunging somewhere between {LAST_SAFE_ORBIT_IN_HORIZON_RADII} and {edge.toFixed(2)} horizon radii.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> It is what lets you test the edge for yourself, from the same model, at any start.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> These are trial values: your own numbers, from this model. They do not say the real system is like that. There is no published value to compare them with.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 4: Where real orbits sit, in horizon radii</h4>
      <p style={tableLead}>Calculated here. The last safe orbit is 3 horizon radii for every black hole; the stars’ distances are ESO’s, turned into horizon radii of Sagittarius A*.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>What</th>
              <th style={headCell}>Distance from the center</th>
              <th style={headCell}>In horizon radii</th>
            </tr>
          </thead>
          <tbody>
            {lastSafeRows.map((r) => (
              <tr key={r.preset.id}>
                <td style={cell}>
                  Last safe orbit around {r.preset.label.replace(/^A /, 'a ')} <GuessTag />
                </td>
                <td style={cell}>{formatDistance(r.lastSafeOrbitKm)}</td>
                <td style={cell}>
                  <strong>{LAST_SAFE_ORBIT_IN_HORIZON_RADII}</strong>
                </td>
              </tr>
            ))}
            <tr>
              <td style={cell}>The star S2, closest approach to Sagittarius A* (ESO, 2020; “less than”)</td>
              <td style={cell}>less than {formatLength(s2.closestApproachKm)}</td>
              <td style={cell}>
                <strong>less than about {formatNumber(Math.round(s2.horizonRadiiThisPage / 100) * 100)}</strong>
              </td>
            </tr>
            <tr>
              <td style={cell}>The star S301, closest approach to Sagittarius A* (ESO, 2026)</td>
              <td style={cell}>{formatLength(s301.closestApproachKm)}</td>
              <td style={cell}>
                <strong>about {formatNumber(Math.round(s301.horizonRadiiThisPage / 10) * 10)}</strong> (about {formatNumber(Math.round(s301.horizonRadiiEsoMass / 10) * 10)} with ESO’s four million Suns)
              </td>
            </tr>
          </tbody>
        </table>
      </Scroll>
      <Note>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it is.</strong> The last safe orbit in kilometers for each black hole, and how far from Sagittarius A* two real stars come, in the same unit.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What it means.</strong> The edge scales with the black hole’s size, so it is {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii around all three ({formatDistance(lastSafeRows[0].lastSafeOrbitKm)}, {formatDistance(lastSafeRows[1].lastSafeOrbitKm)} and{' '}
          {formatDistance(lastSafeRows[2].lastSafeOrbitKm)}). The two stars stay far outside it: S301, the closest observed so far, is about {formatNumber(Math.round(s301.horizonRadiiThisPage / 10) * 10)} horizon radii out, more than{' '}
          {Math.floor(s301.horizonRadiiThisPage / LAST_SAFE_ORBIT_IN_HORIZON_RADII / 10) * 10} times as far as the edge.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>Why it matters.</strong> It shows that nobody has watched an orbit at the last safe orbit. What we know of real orbits near black holes comes from farther out, where the exact theory and ordinary gravity are close but not identical.
        </p>
        <p style={{ margin: 0 }}>
          <strong>How sure we are.</strong> The stars’ distances come from ESO’s releases (the Nature paper on S301 was not read); S2’s is an upper bound. The conversion uses this page’s 4.3 million Suns for Sagittarius A*; ESO’s rounder four million gives
          a slightly larger number of horizon radii.
        </p>
      </Note>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>The simple math.</strong> The last safe orbit is at 6GM/c² from the center, which is {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii. (G is the strength of gravity, M the black hole’s mass and c the speed of light. This is given, not
        derived.) For {ownHole}{startIsOwn ? '' : ' (the Part 1 black hole)'}:
      </p>
      <ol style={{ ...listStyle, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <li>One horizon radius is about {formatNumber(perSun)} km for each Sun’s worth of mass.</li>
        <li>
          {LAST_SAFE_ORBIT_IN_HORIZON_RADII} × {formatNumber(perSun)} km = {formatNumber(LAST_SAFE_ORBIT_IN_HORIZON_RADII * perSun)} km for each Sun’s worth of mass.
        </li>
        <li>
          {formatMass(own.preset.massSolarMasses)} × that = {formatDistance(own.lastSafeOrbitKm)}.
        </li>
      </ol>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        The launch speeds come from one formula each, with x the distance in horizon radii: ordinary gravity √(1 ÷ 2x) and the exact theory √(1 ÷ (2(x − 1))), as fractions of the speed of light. The only difference is the “− 1”. It makes
        no real difference far away, where x − 1 is nearly x, and a large one close in. At x = 1.5 the exact speed would reach 1, the speed of light, which is why no circular orbit exists closer in than that.
      </p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        <strong>A comparison from daily life.</strong> Picture a marble at the bottom of a bowl. Give it a small nudge and it rolls up the side, then comes back and keeps rolling around the bottom. Now picture a marble balanced on top of an
        upside-down bowl. The slightest nudge and it rolls off for good. An orbit outside the last safe orbit is like the first marble: a small nudge only makes it wobble. An orbit at or inside the last safe orbit is like the second: a small
        nudge ends it. This is an analogy for “survives a nudge or does not”, not for how gravity works.
      </p>
      <div
        style={{
          margin: '0.75rem 0',
          padding: '0.75rem 1rem',
          border: '2px solid #f59e0b',
          borderRadius: '8px',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          fontSize: '0.8125rem',
        }}
      >
        <p style={{ marginTop: 0, marginBottom: '0.4rem' }}>
          <strong>What this model can and cannot tell you.</strong> This is a thought experiment about a small probe. It does not say how the probe got into orbit, or what could give it a nudge. It follows the probe in a flat plane for up to{' '}
          {MAX_TURNS} turns, or until it reaches the horizon. Nothing inside the horizon is modeled, and the experiment does not show what a traveler who falls in would feel.
        </p>
        <p style={{ margin: 0 }}>
          The exact equation is given, not derived, and is for a black hole that does not spin and has no electric charge. Real black holes usually spin, which moves the last safe orbit. A real orbit this close would also lose energy as
          gravitational waves, which is left out. The nudge, {NUDGE} of the distance for each radian swept, is a choice we made, and it sets where the model’s edge falls. The stellar black hole’s mass of 10 Suns is an illustrative round value.
        </p>
      </div>

      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>Check it against NASA</strong> (held back until now because they give the size of the edge)
        </p>
        <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.4rem' }}>
            <Ext href="https://heasarc.gsfc.nasa.gov/docs/objects/heapow/archive/compact_objects/isco_rxte.html">NASA HEASARC, “ISCO Facto?”</Ext> (2 April 2012): why material cannot orbit closer than a certain distance
            from a black hole, and what that means for the inner edge of its gas disk. It says “6 times the black hole’s gravitational radius”; on this page that is {LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <Ext href="https://heasarc.gsfc.nasa.gov/docs/nicer/science_nuggets/20240530.html">NASA NICER, “Taking the plunge”</Ext> (30 May 2024): how the model of a black hole’s disk is being extended inward.
          </li>
        </ul>
        <p style={{ margin: 0, fontSize: '0.75rem' }}>
          Both pages are about gas around a black hole, which this experiment does not model. They are given only to say where the idea of a last safe orbit turns up. The HEASARC page says this distance sets how
          close the inner edge of the disk can get for a black hole that does not spin; the NICER page describes new work that follows the gas inside the inner edge, for a spinning black hole.
        </p>
      </div>
    </div>
  )
}
