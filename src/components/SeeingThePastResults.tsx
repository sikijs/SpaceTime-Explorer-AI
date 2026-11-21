import type { ReactNode } from 'react'
import { PART_ONE_DIRECTION, PART_ONE_SPEED, checkUpRows, runSeeingExperiment } from '../physics/seeingThePast'
import type { CheckUpRow, SpeedGuess } from '../physics/seeingThePast'

// Spacetime Geometry 4, Part 3: the results of Part 1's run, the check-up and the notes under each table, with the learner's guess beside them
// (docs/audit/spacetime-geometry/04-draft-wording.md, approved by the owner on 2026-11-21; CLAUDE.md §14 "Reading the Results"). Nothing here changes
// with the guess: it is shown as the learner made it and never marked right or wrong, because the tutor does that (§12, §13). Every number comes
// from the physics module (§9).

const GUESS_LABELS: Record<SpeedGuess, string> = {
  slower: "slower than the spaceship's real speed",
  same: "the same as the spaceship's real speed",
  faster: "faster than the spaceship's real speed",
}

const cell = { padding: '0.3rem 1rem 0.3rem 0', verticalAlign: 'top' } as const
const headCell = { ...cell, textAlign: 'left', fontSize: '0.8125rem', borderBottom: '1px solid var(--border-color, #ccc)' } as const
const tableStyle = { fontSize: '0.875rem', borderCollapse: 'collapse', marginBottom: '0.75rem' } as const
const tableLead = { fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' } as const
const noteParagraph = { marginTop: 0, marginBottom: '0.4rem' } as const
const two = (value: number) => value.toFixed(2)

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

// A small white tag on the row where the guess's number appears. It shows the guess only, never "right" or "wrong".
function Tag() {
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
      your guess
    </span>
  )
}

function checkUpText(row: CheckUpRow, speed: number, approaching: boolean): { what: string; page: string; expected: string; reading: string } {
  const unit = row.id === 'image-speed' ? 'c' : row.id === 'image-distance' ? ' light-seconds' : ' seconds'
  const reading = row.reading === 'the same' ? 'the same' : `${row.reading}, by ${two(row.gap)}${unit}`
  switch (row.id) {
    case 'image-speed':
      return {
        what: "The image's speed, from the two arrival times",
        page: `${two(row.page)}c`,
        expected: approaching ? `${speed} ÷ (1 − ${speed}) = ${two(row.expected)}c` : `${speed} ÷ (1 + ${speed}) = ${two(row.expected)}c`,
        reading,
      }
    case 'image-distance':
      return {
        what: 'How far the image moved',
        page: `${two(row.page)} light-seconds`,
        expected: `the spaceship's own distance, ${two(row.expected)} light-seconds`,
        reading,
      }
    case 'image-time':
      return {
        what: 'The time the image took',
        page: `${two(row.page)} seconds`,
        expected: `the spaceship's own time, ${two(row.expected)} seconds`,
        reading,
      }
  }
}

export function SeeingThePastResultsTables({ prediction }: { prediction: SpeedGuess }) {
  const direction = PART_ONE_DIRECTION
  const speed = PART_ONE_SPEED
  const run = runSeeingExperiment(direction, speed)
  const rows = checkUpRows(direction, speed)
  const approaching = direction === 'approaching'
  const directionWords = approaching ? 'toward the lab' : 'away from the lab'
  const byId = (id: CheckUpRow['id']) => rows.find((r) => r.id === id)!

  return (
    <div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
        <strong>What you ran.</strong> A spaceship flew {directionWords} at {speed}c, as the lab works it out with its ruler and synchronized clocks. The lab watched it through a telescope. Every
        number in these tables is calculated on this page from straight-line motion and the time light takes to travel. The words "the same", "more" and "less" are this page's own, and not an
        official scale: "the same" means the two numbers agree at the two decimals shown.
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
          <strong>Your guess, beside the results.</strong> It is shown as you made it, and nothing here says whether it is right. The tutor does that. Find the row with the white "your guess" tag in
          Table 1.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Your prediction:</strong> {GUESS_LABELS[prediction]}. The question was: compared with the spaceship's real speed, how fast does its image seem to move? Its number is the image's speed
          in the second row of Table 1. <Tag />
        </p>
      </div>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 1: The spaceship and its image</h4>
      <p style={tableLead}>The first row is the spaceship's real motion. The second row is the motion of its image, which means the place where the spaceship looks to be.</p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['', 'Distance covered (light-seconds)', 'Time it took (seconds)', 'Speed (fraction of c)'].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cell}>The spaceship's real motion</td>
              <td style={cell}>{two(run.distanceCovered)}</td>
              <td style={cell}>{two(run.measuredDuration)}</td>
              <td style={cell}>{two(run.measuredSpeed)}c</td>
            </tr>
            <tr>
              <td style={cell}>The image (where the spaceship looks to be)</td>
              <td style={cell}>{two(run.distanceCovered)}</td>
              <td style={cell}>{two(run.imageDuration)}</td>
              <td style={cell}>
                <strong>{two(run.imageSpeed)}c</strong>
                <Tag />
              </td>
            </tr>
          </tbody>
        </table>
      </Scroll>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>What each number means.</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>Distance covered:</strong> how far the spaceship moved along its path, and how far the place where it looks to be moved. Both are {two(run.distanceCovered)} light-seconds.
          </li>
          <li>
            <strong>Time it took:</strong> for the spaceship, the time on the lab's clock between its start and its end. For the image, the time on the lab's clock between the moment the first light
            arrived at the telescope and the moment the last light arrived.
          </li>
          <li>
            <strong>Speed:</strong> the distance covered divided by the time it took, as a fraction of <strong>c</strong>. For example, 4 light-seconds in 10 seconds is 4 ÷ 10 = 0.40c.
          </li>
        </ul>
      </div>
      <Note>
        <p style={{ margin: 0 }}>
          <strong>What it is:</strong> the spaceship's real motion and its image's motion, side by side. <strong>What it means:</strong> both cover {two(run.distanceCovered)} light-seconds. The spaceship
          takes {two(run.measuredDuration)} seconds; the image takes {two(run.imageDuration)} seconds, so the image's speed is {two(run.distanceCovered)} ÷ {two(run.imageDuration)} ={' '}
          {two(run.imageSpeed)}c. <strong>Why it matters:</strong> the image is not the spaceship. <strong>How sure this is:</strong> these are exact results of a simplified model, with a straight path
          and a steady speed.
        </p>
      </Note>

      <h4 style={{ margin: '0 0 0.5rem' }}>Table 2: A check-up against this page's own physics</h4>
      <p style={tableLead}>
        Each row sets a number from this page beside what the same physics gives. There is no outside source here and no cut-off of this page's own.
      </p>
      <Scroll>
        <table style={tableStyle}>
          <thead>
            <tr>
              {['What we compared', 'This page', 'Expected', 'Reading'].map((h) => (
                <th key={h} style={headCell}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const t = checkUpText(row, speed, approaching)
              return (
                <tr key={row.id}>
                  <td style={cell}>{t.what}</td>
                  <td style={cell}>
                    <strong>{t.page}</strong>
                  </td>
                  <td style={cell}>{t.expected}</td>
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
        <p style={{ margin: 0 }}>
          <strong>What it is:</strong> the page's own calculation, set beside what the formula for this situation gives. <strong>What it means:</strong> the speed from the arrival times and the
          formula {speed} ÷ (1 {approaching ? '−' : '+'} {speed}) agree at {two(byId('image-speed').page)}c. The image covers the same {two(byId('image-distance').page)} light-seconds as the
          spaceship, in {two(byId('image-time').page)} seconds against the spaceship's {two(byId('image-time').expected)}. <strong>Why it matters:</strong> the formula is a shortcut for the same working,
          so agreement shows that the drawings and the table were made correctly. It is not an outside measurement: no real spaceship was timed. <strong>How sure this is:</strong> it checks the arithmetic,
          not that real spaceships behave this way.
        </p>
      </Note>
    </div>
  )
}

// ---- Want to know more about real jets? Held until after the run, because these pages would give away what Part 1 asks the learner to predict (§12). ----

const linkItem = { marginBottom: '0.4rem' } as const

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

export function SeeingThePastJetLinks() {
  return (
    <div style={{ margin: '1.5rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more about real jets?</h4>
      <p style={{ margin: '0 0 0.5rem' }}>
        Real jets are more complicated than this page's spaceship. They fly at a small angle to our line of sight, and their speeds are close to the speed of light. But the idea is the same: a source that
        moves nearly toward us keeps up with its own light, so its image seems to move faster than it really does.
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://public.nrao.edu/gallery/jets-that-appear-faster-than-light/">NRAO, "Jets that Appear Faster than Light"</Ext> (no date shown): a plain explanation with a diagram of why a jet
          coming nearly toward us looks faster than light, and that nothing is moving that fast. Its example is a neutron-star merger.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/missions/hubble/hubble-spots-ultra-speedy-jet-blasting-from-star-crash/">NASA Science, "Hubble Spots Ultra-Speedy Jet Blasting from Star Crash"</Ext> (12 October 2022,
          updated 31 March 2025): the same illusion in plain words, for a jet from a neutron-star merger.
        </li>
        <li style={linkItem}>
          <Ext href="https://chandra.harvard.edu/blog/node/748">Chandra X-ray Center, "Famous Black Hole Has Jet Pushing Cosmic Speed Limit"</Ext> (6 January 2020): the jet of the galaxy M87, and why its
          apparent speed is more than light's.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        These pages are about real jets. None of them states the formula this page uses for its straight-on spaceship, and this page does not suggest that they do.
      </p>
    </div>
  )
}
