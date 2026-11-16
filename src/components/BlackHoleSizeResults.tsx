import type { ReactNode } from 'react'
import {
  checkUpRows,
  compareHorizonsOfSunAndThousandSuns,
  horizonRadiusKm,
  objectCards,
} from '../physics/blackHoleSizeExperiment'
import type { BlackHoleSizeResult, MassScalingGuess, SunRadiusGuess } from '../physics/blackHoleSizeExperiment'
import { formatLength, formatMass, formatNumber } from './BlackHoleSizePictures'
import { GuessTag, listStyle, paragraph, smallNote } from './TidalEffectExperiment'

// Black Holes, Experiment 1 (audit update): Part 3, the results. Nothing here changes with a guess. The guesses are shown beside the
// results, never marked right or wrong (that is the tutor's job, CLAUDE.md §12, §13). Every number comes from the physics module.

export const sunRadiusGuessLabels: Record<SunRadiusGuess, string> = {
  'about-6000-km': 'About 6,000 kilometers, the size of Earth',
  'about-30-km': 'About 30 kilometers',
  'about-3-km': 'About 3 kilometers, a few city blocks',
}

export const massScalingGuessLabels: Record<MassScalingGuess, string> = {
  ten: 'About 10 times wider',
  thousand: 'About 1,000 times wider',
  million: 'About a million times wider',
}

const cell = { padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' } as const
const headCell = { ...cell, textAlign: 'left', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-color, #ccc)' } as const
const tableStyle = { fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' } as const

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

export interface BlackHoleSizeResultsProps {
  partOne: BlackHoleSizeResult
  sunGuess: SunRadiusGuess
  massGuess: MassScalingGuess
  partTwo: BlackHoleSizeResult | null
}

export function BlackHoleSizeResults({ partOne, sunGuess, massGuess, partTwo }: BlackHoleSizeResultsProps) {
  const rows = checkUpRows()
  const comparison = compareHorizonsOfSunAndThousandSuns()
  const kmPerSolarMass = horizonRadiusKm(1)
  const cards = objectCards()
  const card = (id: string) => cards.find((c) => c.id === id)!
  const neutron = card('neutron-star')

  return (
    <div>
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
          <strong>Your guesses, beside the results.</strong> They are shown as you made them, and nothing here says
          whether they are right. The tutor does that.
        </p>
        <ul style={{ ...listStyle, marginBottom: 0 }}>
          <li>
            <strong>Guess 1:</strong> {sunRadiusGuessLabels[sunGuess]}. The question was: what radius would the Sun be
            squeezed to? Its number is in the first row of Table 2 (“Its horizon radius”). <GuessTag />
          </li>
          <li>
            <strong>Guess 2:</strong> {massScalingGuessLabels[massGuess]}. The question was: how much wider is the
            horizon of a black hole with 1,000 times the mass? Its number is in the last row of Table 2. <GuessTag />
          </li>
        </ul>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: A check-up on the numbers this page uses</h4>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>What we checked</th>
              <th style={headCell}>Published value</th>
              <th style={headCell}>This page uses</th>
              <th style={headCell}>Reading</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.what}>
                <td style={cell}>{r.what}</td>
                <td style={cell}>{/^[0-9.]+$/.test(r.expected) ? formatNumber(Number(r.expected)) : r.expected}</td>
                <td style={cell}>
                  <strong>{formatNumber(r.found)}</strong>
                </td>
                <td style={cell}>
                  <strong>{r.reading}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={smallNote}>
        Published values: NASA and Chandra (the horizon sizes, the Sun and Earth fact sheets, the NICER neutron-star
        radii) and ESO (the mass of Sagittarius A*), read on 2026-11-16. The two escape-speed values are this page’s own
        arithmetic.
      </p>
      <Note>
        <ul style={listStyle}>
          <li>
            <strong>What it is.</strong> A check that the numbers on this page agree with what NASA and ESO print. It
            is not a prediction that came true.
          </li>
          <li>
            <strong>What it means.</strong> Rows marked “the same” use the published value. “The same, to the
            rounding” means the published figure is rounded: {formatNumber(kmPerSolarMass)} km for the Sun and
            NASA’s “about 3 km” are one number, written to different precision. The neutron star’s 12 km sits inside
            the published radii (11.36 km to about 13.7 km), but those measurements differ by more than 2 km, so 12 km
            is a round value, not a precise one. Sagittarius A*’s 4.3 million Suns is 7.5% more than ESO’s rounder “four
            million”.
          </li>
          <li>
            <strong>Why it matters.</strong> Every size on the rulers is calculated from these inputs. A reader should
            know which are published exactly and which are rounded or still debated.
          </li>
        </ul>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: The real Sun, squeezed in Part 1</h4>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={cell}>Its horizon radius</td>
              <td style={cell}>
                <strong>{formatLength(partOne.horizonRadiusKm)}</strong> <GuessTag />
              </td>
            </tr>
            <tr>
              <td style={cell}>The squeeze needed from its real size</td>
              <td style={cell}>
                <strong>
                  {formatNumber(partOne.squeezeNeeded as number)} times smaller (from {formatLength(partOne.preset.realRadiusKm as number)} to{' '}
                  {formatLength(partOne.horizonRadiusKm)})
                </strong>
              </td>
            </tr>
            <tr>
              <td style={cell}>Is it a black hole at the end of the squeeze?</td>
              <td style={cell}>
                <strong>Yes: all of the mass is at its horizon radius.</strong>
              </td>
            </tr>
            <tr>
              <td style={cell}>Ordinary-gravity escape speed at that radius</td>
              <td style={cell}>
                <strong>{formatNumber(partOne.escapeSpeedFractionOfLight)} times the speed of light</strong>
              </td>
            </tr>
            <tr>
              <td style={cell}>
                Horizon of {formatNumber(comparison.largeMassSolarMasses)} Suns ({formatLength(comparison.largeHorizonKm)}) compared with
                that of 1 Sun ({formatLength(comparison.smallHorizonKm)})
              </td>
              <td style={cell}>
                <strong>{formatNumber(comparison.realRatio)} times wider</strong> <GuessTag />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note>
        <ul style={listStyle}>
          <li>
            <strong>What it is.</strong> The result of the fixed run in Part 1: the real Sun, squeezed from its real
            radius down to its own horizon radius. It never changes with your guesses or with your settings in Part 2.
          </li>
          <li>
            <strong>What it means.</strong> The Sun’s horizon radius is {formatLength(partOne.horizonRadiusKm)}, so
            squeezing the Sun to that size is a squeeze of about {formatNumber(partOne.squeezeNeeded as number)} times. At
            exactly that radius the ordinary-gravity escape speed is exactly the speed of light. The last row compares
            two masses: multiply the mass by {formatNumber(comparison.largeMassSolarMasses)} and the horizon radius is multiplied by the same
            number.
          </li>
          <li>
            <strong>Why it matters.</strong> It puts a number on how far an ordinary star is from being a black hole,
            and on how the critical size depends on the mass. Your guesses are tagged on the two rows they were about.
          </li>
        </ul>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 3: Your own run, from Part 2</h4>
      {partTwo ? (
        <>
          <p style={paragraph}>
            You squeezed <strong>{partTwo.preset.label}</strong> ({formatMass(partTwo.preset.massSolarMasses)}) into a ball
            of radius <strong>{formatLength(partTwo.chosenRadiusKm)}</strong>. For this object:
          </p>
          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={tableStyle}>
              <tbody>
                {[
                  ['Its horizon radius', formatLength(partTwo.horizonRadiusKm)],
                  [
                    'The squeeze needed from its real size',
                    partTwo.squeezeNeeded === null
                      ? 'Not applicable: it is already a black hole, so it has no real size to squeeze from. The start in the pictures was a hypothetical ball.'
                      : `${formatNumber(partTwo.squeezeNeeded)} times smaller (from ${formatLength(partTwo.preset.realRadiusKm as number)} to ${formatLength(partTwo.horizonRadiusKm)})`,
                  ],
                  [
                    'The ball you chose, in horizon radii',
                    `${formatNumber(partTwo.chosenInHorizonRadii)} (${partTwo.chosenInHorizonRadii > 1 ? 'bigger than' : partTwo.chosenInHorizonRadii === 1 ? 'exactly' : 'smaller than'} its horizon radius)`,
                  ],
                  [
                    'Is it a black hole?',
                    partTwo.becomesBlackHole
                      ? 'Yes: all of the mass is at or inside its horizon radius.'
                      : 'No: the ball is still bigger than its horizon radius.',
                  ],
                  [
                    'Ordinary-gravity escape speed at that radius',
                    `${formatNumber(partTwo.escapeSpeedFractionOfLight)} times the speed of light`,
                  ],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={cell}>{label}</td>
                    <td style={cell}>
                      <strong>{value}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note>
            <ul style={listStyle}>
              <li>
                <strong>What it is.</strong> The result for the object and radius you chose and ran in Part 2. It
                changes when you run something else; it never changes with your guesses.
              </li>
              <li>
                <strong>What it means.</strong> Compare the ball you chose with the object’s own horizon radius: at or
                below it, all of the mass is inside, and the object is a black hole.
              </li>
              <li>
                <strong>Why it matters.</strong> Each object has its own critical size, set only by its mass, so the same
                squeeze can leave one object ordinary and turn another into a black hole.
              </li>
            </ul>
          </Note>
        </>
      ) : (
        <p style={{ ...paragraph, fontWeight: 'bold' }}>
          Not run yet. Choose an object and a radius in Part 2 and press Run. Your own result appears here.
        </p>
      )}

      <h4 style={{ margin: '0 0 0.5rem' }}>Meet the six objects</h4>
      <p style={paragraph}>
        The six objects you can choose in Part 2, each with its horizon radius worked out from the same formula. The
        comparisons are rough pictures to give a sense of size.
      </p>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCell}>Object</th>
              <th style={headCell}>Mass</th>
              <th style={headCell}>Real radius</th>
              <th style={headCell}>Horizon radius</th>
              <th style={headCell}>A sense of size</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((c) => (
              <tr key={c.id}>
                <td style={cell}>
                  <strong>{c.label}</strong>
                </td>
                <td style={cell}>{formatMass(c.massSolarMasses)}</td>
                <td style={cell}>{c.realRadiusKm === null ? 'none: already a black hole' : formatLength(c.realRadiusKm)}</td>
                <td style={cell}>
                  <strong>{formatLength(c.horizonRadiusKm)}</strong>
                  {c.horizonRadiusKm > 1e6 ? ` (${formatNumber(c.horizonRadiusAu)} AU)` : ''}
                </td>
                <td style={cell}>
                  {c.id === 'earth' && 'a ball as wide as a large marble'}
                  {c.id === 'sun' && 'a few city blocks'}
                  {c.id === 'neutron-star' && `about ${formatNumber(neutron.horizonOverRealRadius as number)} of the star’s own radius`}
                  {c.id === 'stellar-black-hole' && 'like a small city'}
                  {c.id === 'sgr-a-star' && 'a fifth of the way from the Sun to Mercury'}
                  {c.id === 'm87-star' && 'several times wider than the orbit of Neptune'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={smallNote}>
        The masses of Sagittarius A* and M87* are measured values (ESO’s releases of 2022 and 2019 give “four million”
        and 6.5 billion Suns; this page uses 4.3 million for Sagittarius A*). The 10-Sun black hole is an illustrative
        round value, and the neutron star’s radius is a round 12 km.
      </p>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>Check it against NASA</h4>
      <p style={paragraph}>These pages were held back until now because they give the sizes you have just worked out.</p>
      <ul style={listStyle}>
        <li>
          <a href="https://chandra.harvard.edu/xray_sources/blackholes_stellar.html" target="_blank" rel="noreferrer">
            NASA’s Chandra X-ray Observatory, “Stellar Black Holes”
          </a>
          : the size of the horizon for a 10-Sun black hole, and how it grows with every Sun swallowed.
        </li>
        <li>
          <a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" target="_blank" rel="noreferrer">
            NASA, Sun Fact Sheet
          </a>{' '}
          and{' '}
          <a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" target="_blank" rel="noreferrer">
            Earth Fact Sheet
          </a>
          : the published radii used on this page.
        </li>
        <li>
          <a href="https://www.nasa.gov/universe/nasas-nicer-probes-the-squeezability-of-neutron-stars/" target="_blank" rel="noreferrer">
            NASA, “NICER probes the squeezability of neutron stars”
          </a>{' '}
          and{' '}
          <a href="https://heasarc.gsfc.nasa.gov/docs/nicer/science_nuggets/20240822.html" target="_blank" rel="noreferrer">
            “NICER neutron-star radius measurement”
          </a>
          : how big neutron stars really are.
        </li>
      </ul>

      <p style={{ marginBottom: '0.25rem' }}>
        <strong>The simple math.</strong> The horizon radius is <strong>r = 2GM / c²</strong>, where G is the
        gravitational constant, M is the mass and c is the speed of light. You do not need to calculate it yourself: it
        works out to about {formatNumber(kmPerSolarMass)} kilometers for every solar mass. So:
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem', marginBottom: '0.75rem' }}>
        <li>
          1 solar mass (the Sun): 1 × {formatNumber(kmPerSolarMass)} km ≈ {formatLength(horizonRadiusKm(1))}.
        </li>
        <li>
          10 solar masses: 10 × {formatNumber(kmPerSolarMass)} km ≈ {formatLength(horizonRadiusKm(10))}.
        </li>
        <li>
          1,000 solar masses: 1,000 × {formatNumber(kmPerSolarMass)} km ≈ {formatLength(horizonRadiusKm(1000))}.
        </li>
        {partTwo && (
          <li>
            Your object, {partTwo.preset.label}: {formatNumber(partTwo.preset.massSolarMasses)} × {formatNumber(kmPerSolarMass)} km ≈{' '}
            {formatLength(partTwo.horizonRadiusKm)}.
          </li>
        )}
      </ul>
      <p>
        Each time the mass is multiplied by some number, the horizon radius is multiplied by the same number. Real
        objects are very far from this limit, which is why the strange effects of gravity from the earlier chapters were
        so small for everyday objects. The Sun would have to shrink about {formatNumber(partOne.squeezeNeeded as number)} times. Earth
        would have to shrink from 6,371 km to {formatLength(card('earth').horizonRadiusKm)}. A neutron star, though, is only
        about {formatNumber(1 / (neutron.horizonOverRealRadius as number))} times too big, which is why it is the closest
        thing to a black hole that is not one.
      </p>
      <p>
        <strong>A comparison from daily life.</strong> Your weight depends on two things: how much mass the planet has,
        and how far you are from its center. Suppose the Earth were squeezed to half its radius with the same mass. You
        would then be half as far from the center, and you would weigh four times as much. Squeezing a mass smaller makes
        the pull at its surface stronger, and a black hole is what you get when the squeeze goes far enough. This is an
        analogy to show why squeezing matters, not the same calculation.
      </p>
      <p>
        <strong>The link to Gravity and Curved Spacetime, Experiment 7.</strong> That experiment asked for the mass at
        which the escape speed reaches the speed of light. The escape-speed row of Table 2 is that same idea in real
        units, using ordinary gravity: it reaches exactly 1, the speed of light, at the horizon radius, and is above 1
        inside it. Above 1 does not mean anything travels faster than light. It means nothing can escape. The exact
        theory, general relativity, gives the same radius, and adds what the horizon really is: a one-way boundary, not a
        surface.
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
          <strong>What this model can and cannot tell you.</strong> This is a thought experiment. It does not say how a
          real object could be squeezed, what force would do it, or what stops it. It does not say anything about what
          happens inside the horizon.
        </p>
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          The formula is given, not derived, and it is for the simplest kind of black hole: one that does not spin and has
          no electric charge. Real black holes usually spin, and a spinning one has a different, more complicated horizon.
          The neutron star’s size is not settled exactly, and the stellar black hole’s mass of 10 Suns is an illustrative
          round value. The starting ball for the three black holes was hypothetical, not a real size.
        </p>
      </div>
    </div>
  )
}
