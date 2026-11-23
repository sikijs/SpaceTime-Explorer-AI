import type { CSSProperties, ReactNode } from 'react'
import { CHECK_UP_LAB_ANGLES, aberrationCheckUp, runSky, travelerAngleOf } from '../physics/aberration'
import type { SidewaysGuess } from '../physics/aberration'

// Spacetime Geometry 7, Part 3 (the results of Part 1's run) and the two tables that Part 2 shows for the learner's own speed. Audit update of 2026-11-23: the reading guide of
// CLAUDE.md §14 ("Reading the Results"): a check-up, a "What this table tells us" note under each table, and the guess beside the results (guess only, never marked). Wording in
// docs/audit/spacetime-geometry/07-draft-wording.md, section 5, approved by the owner on 2026-11-23 (§28.1). Every number comes from `runSky`, `travelerAngleOf` and `aberrationCheckUp`.

const CELL: CSSProperties = { padding: '0.3rem 1rem 0.3rem 0' }
const NOTE: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)' }

export const GUESS_LABELS: Record<SidewaysGuess, string> = {
  same: 'Exactly sideways, the same as the lab',
  ahead: 'Ahead of sideways, nearer the direction of travel',
  behind: 'Behind sideways, further from the direction of travel',
}

export function GuessTag() {
  return (
    <span
      style={{
        marginLeft: '0.4rem',
        padding: '0.05rem 0.4rem',
        fontSize: '0.6875rem',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#0b1020',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      your guess
    </span>
  )
}

function Table({ head, rows, tagRow }: { head: string[]; rows: ReactNode[][]; tagRow?: number }) {
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ ...CELL, textAlign: 'left' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} style={CELL}>
                  {cell}
                  {i === 0 && r === tagRow && <GuessTag />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div style={{ ...NOTE, marginBottom: '1.5rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>What this table tells us</p>
      <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>{children}</ul>
    </div>
  )
}

const one = (value: number) => value.toFixed(1).replace('-', '−')

// The angles of seven stars, lab against traveler. `tag` marks the row the guess was about (the 90° row).
export function AngleTable({ speed, tag }: { speed: number; tag?: boolean }) {
  return (
    <Table
      head={['Lab’s angle θ', 'Traveler’s angle θ′', 'Change']}
      rows={CHECK_UP_LAB_ANGLES.map((labAngle) => {
        const travelerAngle = travelerAngleOf(labAngle, speed)
        return [`${labAngle}°`, `${travelerAngle.toFixed(1)}°`, `${one(travelerAngle - labAngle)}°`]
      })}
      tagRow={tag ? CHECK_UP_LAB_ANGLES.indexOf(90) : undefined}
    />
  )
}

export const COUNT_LABELS = {
  aheadOfSideways: 'Stars seen less than 90° from straight ahead',
  within30OfAhead: 'Stars in the striped wedge (within 30° of straight ahead)',
  within30OfBehind: 'Stars in the dotted wedge (within 30° of straight behind)',
} as const

export function CountTable({ speed }: { speed: number }) {
  const sky = runSky(speed)
  return (
    <Table
      head={['', 'Lab', 'Traveler']}
      rows={(Object.keys(COUNT_LABELS) as (keyof typeof COUNT_LABELS)[]).map((key) => [COUNT_LABELS[key], String(sky.countsLab[key]), String(sky.countsTraveler[key])])}
    />
  )
}

interface AberrationResultsProps {
  speed: number
  guess: SidewaysGuess
  // The bars picture, drawn by the experiment (it shares the experiment's drawing styles).
  bars: ReactNode
}

export function AberrationResults({ speed, guess, bars }: AberrationResultsProps) {
  const sky = runSky(speed)
  const check = aberrationCheckUp(speed)
  const followed = sky.sidewaysStarTravelerAngle
  const change = followed - 90
  const at150 = travelerAngleOf(150, speed)
  const sameCount = check.labStarCount === check.travelerStarCount
  const checkRows: string[][] = [
    [
      'The two ways of working out the traveler’s angle',
      'The formula and the energy-and-momentum method give the same angle for all seven stars of the table',
      `largest difference ${check.largestRouteDifference.toFixed(1)}°`,
      'the same',
    ],
    ['The star straight ahead (lab 0°)', 'the same angle for the traveler', `${check.aheadStarTravelerAngle.toFixed(1)}°`, 'the same'],
    ['The star straight behind (lab 180°)', 'the same angle for the traveler', `${check.behindStarTravelerAngle.toFixed(1)}°`, 'the same'],
    ['How many stars there are', `${check.labStarCount} for the lab, ${check.labStarCount} for the traveler`, `${check.labStarCount} and ${check.travelerStarCount}`, sameCount ? 'the same' : 'not the same'],
    ['The order of the stars around the ring', 'no star passes another', check.orderUnchanged ? 'order unchanged' : 'order changed', check.orderUnchanged ? 'the same' : 'not the same'],
  ]
  return (
    <div>
      <p style={{ ...NOTE, marginTop: 0 }}>
        <strong>What you ran.</strong> A traveler flew through the middle of the ring of 24 stars at {speed}c. The same rays of starlight were measured by the lab and by the traveler.{' '}
        <strong>Your guess</strong> is shown below, next to the row it was about. <strong>It does not change anything on this page.</strong>
      </p>
      <p style={NOTE}>
        <strong>The star we follow.</strong> The lab sees it at 90°. The traveler sees it at {followed.toFixed(1)}°.
      </p>

      <h4 style={{ margin: '1rem 0 0.25rem' }}>The check-up: does this page agree with its own physics?</h4>
      <Table head={['Check', 'What we expected', 'What was found', 'Reading']} rows={checkRows} />
      <Note>
        <li>
          <strong>What it is:</strong> five checks the page makes on its own numbers. It is not a test of a real experiment. It checks that the calculation is consistent.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the formula and the second method (the ray’s energy and momentum) give the same angle for every star, so the angle does not depend on
          which route we took. The two stars on the line of travel stay put (0° and 180°), and the other 22 stars keep their order, so none has jumped over another.
        </li>
        <li>
          <strong>Why it matters:</strong> if the page’s numbers disagreed with themselves, nothing else on the page could be trusted. They agree, so you can read the tables below knowing the
          numbers are consistent. (That the numbers are consistent does not say the real sky behaves this way; for a real example, see the tutor.)
        </li>
      </Note>

      <h4 style={{ margin: '1rem 0 0.25rem' }}>The angles</h4>
      <p style={NOTE}>
        Seven stars from the upper half of the ring. “Change” is the traveler’s angle minus the lab’s angle, in degrees. Your guess was about the 90° row.
      </p>
      <AngleTable speed={speed} tag />
      <Note>
        <li>
          <strong>What it is:</strong> for seven stars of the upper half of the ring, the angle the lab measures and the angle the traveler measures for the same star. “Change” is the traveler’s
          angle minus the lab’s.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> at {speed}c the star at 90° for the lab is at {followed.toFixed(1)}° for the traveler: a change of {one(change)}°. The star at 150°
          is at {at150.toFixed(1)}° (change {one(at150 - 150)}°). The star at 0° stays at 0° and the one at 180° stays at 180°. <strong>A worked check you can do:</strong> for the 90° star, cos θ =
          0, so cos θ′ = (0 + {speed}) ÷ (1 + 0) = {speed}, and the angle whose cos is {speed} is {followed.toFixed(1)}°.
        </li>
        <li>
          <strong>Why it matters:</strong> the column of changes is the whole effect in one list. A change of zero means a star did not shift. A negative change means the traveler measures that
          star at a smaller angle than the lab does. (Which way that is, and why, is for the tutor.)
        </li>
      </Note>

      <h4 style={{ margin: '1rem 0 0.25rem' }}>The counts</h4>
      <p style={NOTE}>How many of the 24 stars fall in each part of the sky, in each picture.</p>
      <CountTable speed={speed} />
      <Note>
        <li>
          <strong>What it is:</strong> how many of the 24 stars fall in each part of the sky, for each observer.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> the lab counts {sky.countsLab.aheadOfSideways} stars less than 90° from straight ahead, and the traveler counts{' '}
          {sky.countsTraveler.aheadOfSideways}. The striped wedge holds {sky.countsLab.within30OfAhead} for the lab and {sky.countsTraveler.within30OfAhead} for the traveler; the dotted wedge holds{' '}
          {sky.countsLab.within30OfBehind} for the lab and {sky.countsTraveler.within30OfBehind} for the traveler.
        </li>
        <li>
          <strong>Why it matters:</strong> the dots are hard to count by eye. The counts say plainly that the two observers spread the same 24 stars differently around their skies. The total is
          24 in both cases.
        </li>
      </Note>

      {bars}
      <Note>
        <li>
          <strong>What it is:</strong> the three counts of the table above, as pairs of bars: the lab’s solid, the traveler’s striped.
        </li>
        <li>
          <strong>What it means with the real numbers:</strong> at {speed}c the pairs read {sky.countsLab.aheadOfSideways} against {sky.countsTraveler.aheadOfSideways},{' '}
          {sky.countsLab.within30OfAhead} against {sky.countsTraveler.within30OfAhead}, and {sky.countsLab.within30OfBehind} against {sky.countsTraveler.within30OfBehind}.
        </li>
        <li>
          <strong>Why it matters:</strong> it shows the same counts as the table, so that the change can be seen at a glance: a longer bar means more of the 24 stars.
        </li>
      </Note>
      <p style={{ ...NOTE, fontSize: '0.75rem', marginTop: '-1rem' }}>
        <strong>Where the real picture comes from.</strong> Counted here from the page’s own angles (calculated here by the aberration formula). Nothing in it was measured. The 24 stars and the
        traveler are imagined for the question.
      </p>

      <p style={NOTE}>
        <strong>The number D.</strong> At {speed}c, D = √(1 − {speed}²) = {sky.timeDilationFactor.toFixed(3)}. It is the same factor that the moving clock of Experiment 3 used. It is listed here
        because the traveler’s angles are worked out with it.
      </p>

      <div style={{ ...NOTE, border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', padding: '0.75rem', marginTop: '1rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Your guess, beside the results</p>
        <p style={{ margin: 0 }}>
          You guessed: <strong>{GUESS_LABELS[guess].toLowerCase()}</strong>. The question was: where does the traveler see the star the lab sees exactly sideways? Its number appears in the table “The
          angles”, in the row for 90°, and in the line “The star we follow” above. A small tag marks that row. Your guess never changes any number on this page.
        </p>
      </div>
    </div>
  )
}
