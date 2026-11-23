import type { CSSProperties, ReactNode } from 'react'

// Spacetime Geometry 7, introduction, "Words and formulas" entries and "Want to know more?" links. Audit update of 2026-11-23 (wording in
// docs/audit/spacetime-geometry/07-draft-wording.md, sections 1 and 7, approved by the owner on 2026-11-23, CLAUDE.md §28.1). The introduction does not say
// whether, or which way, a star's direction changes (that is the prediction, §12), so the formula and its worked example appear only after the run.

export const PART_ONE_SPEED = 0.6

const small: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)' }

// Terms the introduction defines, repeated in the "Words and formulas" box with no new claims.
export const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Lab observer and traveler', meaning: 'the lab observer is at rest relative to the stars. The traveler flies through the middle of the ring of stars at a steady speed.' },
  { term: 'Direction of travel', meaning: 'the way the traveler is moving, drawn as an arrow. Angles are measured from it.' },
  {
    term: 'The angle θ (the Greek letter "theta")',
    meaning:
      'how far a star is from straight ahead, measured around from the direction of travel, in degrees. 0° is straight ahead, 90° is exactly sideways (like 3 o’clock on a clock when you face 12), and 180° is straight behind. A full turn is 360°.',
  },
  { term: 'Speed written as 0.6c', meaning: 'a fraction of the speed of light, c. 0.6c is six tenths of the speed of light.' },
  {
    term: 'Aberration',
    meaning: 'the change, if there is one, in the direction in which a star is seen when the observer moves. This experiment shows how big it is and which way it goes.',
  },
  { term: 'Ray of starlight', meaning: 'the thin beam of light that travels from a star to an observer. The short arrows in the pictures are rays.' },
  { term: 'The star we follow', meaning: 'the star the lab sees exactly sideways. It is marked with a yellow ring in both pictures, so you can find it in each.' },
  {
    term: 'Wedge',
    meaning:
      'a slice of the sky. The striped wedge is every direction within 30° of straight ahead, and the dotted wedge is every direction within 30° of straight behind. The number beside each is how many stars fall inside it.',
  },
  { term: 'Arcsecond', meaning: 'a very small angle: 1/3600 of a degree. 20 arcseconds is about a 180th of a degree.' },
  {
    term: 'The number D',
    meaning: 'D = √(1 − speed²), the same factor as the moving clock of Experiment 3. At 0.6c, D = √(1 − 0.36) = 0.8.',
  },
]

// Added to the box only once a run has ended, because the formula shows which way a star's direction changes (§12).
export const FORMULA_ENTRIES: { term: string; meaning: string }[] = [
  {
    term: 'The traveler’s angle θ′ (“theta prime”)',
    meaning:
      'cos θ′ = (cos θ + β) ÷ (1 + β cos θ), where θ is the lab’s angle, β is the traveler’s speed as a fraction of c, and cos is a number between −1 and 1 that tells you how far ahead (1) or behind (−1) a direction is. Example: β = 0.6 and θ = 90° give cos θ′ = 0.6, so θ′ = 53.1°. The star has not moved; only the traveler’s measurement of its direction is different.',
  },
  {
    term: 'Push of a ray of light (its momentum)',
    meaning:
      'how hard, and in which direction, a ray of light pushes what it lands on. A ray travelling in one direction pushes in that direction, and for light the size of the push equals its energy. You see a star in the direction opposite to the push. Example: a ray with a push of 1 straight down comes from a star straight up.',
  },
  {
    term: 'The rain rule',
    meaning:
      'a rule from everyday life, in which starlight is treated like rain falling past a moving car. It gets the sideways star nearly right at 0.3c (73.3° against the real 72.5°) and badly wrong at 0.9c (48.0° against the real 25.8°), because it leaves out the factor D, which the tutor explains.',
  },
]

export function AberrationIntroduction() {
  return (
    <div style={{ marginBottom: '1.5rem', ...small }}>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>The question.</strong> In Experiment 4 we saw that what you see is not the same as what you measure, because light takes time to arrive. Here is a different question about
        seeing: in <em>which direction</em> do you see a star?
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        Think about what “the direction of a star” means. A star sends out light, and the light travels to your eye along a line. You see the star in the direction that line comes from. A star is
        so far away that its light reaches us travelling along an almost perfectly straight line, so “the direction of the star” is the direction of that line. Here is an everyday case. You and a
        friend stand a few steps apart and each point at the same distant mountain peak. You point the same way, because the mountain is so far off that a few steps make no difference. In the same
        way, two people standing in different places on a field see a distant star in the same direction.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        Now add something new: motion. Imagine two observers who are moving relative to each other. One, the <em>lab observer</em>, stands in a lab that is at rest compared with the stars. The
        other, the <em>traveler</em>, flies past the lab on a spaceship at a steady speed. For one moment, the traveler is passing the very middle of the lab. At that moment both observers are in
        the same place, so the same ray of starlight reaches both of them, and both look at the same star. We ask: do they see it in the same direction? Or does an observer’s own motion change the
        direction in which they see it, and if it does, which way?
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        In daily life nobody notices their own walking or driving changing where a distant mountain seems to be. A spaceship, though, can be given any steady speed we like, far faster than any car,
        and whether it matters might depend on how fast the traveler goes. So the experiment lets you try several speeds. You will be asked to predict one result first, and then you will see the
        real one, worked out by the physics.
      </p>

      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What happens.</strong> Here is the whole setup, step by step.
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The stars.</strong> A ring of 24 stars surrounds the lab, like the numbers around the face of a clock. They are all very far away and at rest relative to the lab, and they are
          spaced evenly, one every 15 degrees (a full turn is 360 degrees, and 360 ÷ 24 = 15). The lab observer is at the centre of the ring and sees them evenly spaced.
        </li>
        <li>
          <strong>The traveler.</strong> A traveler flies through the middle of the ring along a straight line, at a steady speed: 0.6c in Part 1, and a speed you choose in Part 2. (0.6c means six
          tenths of the speed of light.) We look only at the moment the traveler is at the centre, so both observers receive the same rays of starlight (a <em>ray</em> is the thin beam of light that
          travels from one star to the observer).
        </li>
        <li>
          <strong>Two pictures of the same sky.</strong> One picture shows the 24 stars as the lab observer sees them. The other shows the same 24 stars as the traveler sees them. The pictures are drawn
          on the same scale, so you can compare them. In both, we mark one star with a yellow ring so that you can find it again: the star the lab observer sees exactly sideways, at a right angle to
          the line along which the traveler flies.
        </li>
        <li>
          <strong>When you press Run.</strong> The picture plays in stages. First the traveler’s icon flies in to the middle of the lab’s picture. Then the traveler’s sky is built up, a pair of
          stars at a time, from straight ahead around to straight behind, and for each star the ray of starlight is drawn in both pictures at once, so you can compare the angle of the same ray as
          each observer sees it. Last, two shaded slices of the sky appear (a <em>wedge</em> is a slice of the sky), with a count of how many stars fall in each, so that the two pictures can be
          compared in numbers.
        </li>
        <li>
          <strong>After the run.</strong> Part 2 lets you try other speeds. Part 3 gives the numbers behind the pictures, and Part 4 is a tutor that asks you what you saw and then explains it.
        </li>
      </ul>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>Some new words.</strong> Here is each one in plain language.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>Direction of travel:</strong> the way the traveler is moving. It is drawn as an arrow, and every angle in this experiment is measured from it.
          </li>
          <li>
            <strong>The angle θ</strong> (the Greek letter “theta”)<strong>:</strong> how far a star is from straight ahead, measured around from the direction of travel, in degrees. 0 degrees is
            straight ahead. 90 degrees is exactly sideways, like 3 o’clock on a clock when you face 12. 180 degrees is straight behind. A full turn all the way around is 360 degrees. For example, a
            star at 45 degrees is halfway between straight ahead and sideways.
          </li>
          <li>
            <strong>Speed written as 0.6c:</strong> a fraction of the speed of light, <em>c</em>. So 0.6c is six tenths of the speed of light, and 0.9c is nine tenths. (As in the earlier
            experiments.)
          </li>
          <li>
            <strong>Aberration:</strong> the change, if there is one, in the direction in which a star is seen when the observer moves. This experiment shows how big the change is, and which way
            it goes.
          </li>
          <li>
            <strong>Ray of starlight:</strong> the thin beam of light that travels from a star to an observer. The short arrows in the pictures are rays.
          </li>
          <li>
            <strong>The star we follow:</strong> one star that we mark with a yellow ring in both pictures, so you can find it in each. It is the star the lab observer sees exactly sideways.
          </li>
          <li>
            <strong>Wedge:</strong> a slice of the sky. The striped wedge is every direction within 30 degrees of straight ahead, and the dotted wedge is every direction within 30 degrees of
            straight behind. The number beside each is how many stars fall inside it.
          </li>
        </ul>
      </div>

      <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
        <strong>Your job.</strong> Predict first. Part 1 uses a traveler flying at <strong>0.6c</strong>. You predict where the traveler will see one particular star: the one the lab observer sees
        exactly sideways. Choose your answer, then press Run. You are not graded. <strong>Your prediction never changes the pictures or the tables.</strong> They come from the physics. Your guess is
        drawn on the traveler’s sky in white, in a box labelled YOUR GUESS, and it is shown again beside the results. Once you press Run, your guess is locked. After your first run, Part 2 lets
        you choose other speeds. Those choices <em>do</em> change the drawings, but not your guess. If you want to change your guess, press Start over.
      </p>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>What we assume.</strong> The stars are very far away and at rest in the lab. The traveler moves at a steady speed, and we look only at the moment the traveler is at the middle of
        the ring. We show a flat slice of the sky, the ring along the line of travel, and we show only the direction of each star, not its brightness or color.
      </p>
    </div>
  )
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const linkItem: CSSProperties = { marginBottom: '0.4rem' }

// Every link below was fetched and read on 2026-11-23 (docs/audit/spacetime-geometry/07-draft-wording.md, section 7).
export function AberrationLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', ...small }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://pwg.gsfc.nasa.gov/stargaze/Saberr.htm">NASA Goddard, “The Aberration of Starlight”</Ext> (plain language with some arithmetic; page read on 23 November 2026; an archival
          page, last updated in 2016, which NASA says it no longer updates): how astronomers found that stars seem to shift because of the Earth’s velocity, told with a boat and its flag, and
          the size of the shift worked out from the Earth’s 30 kilometres per second. It gives 1729 for the boat trip, where ESA’s page below gives 1727 for the discovery.
        </li>
        <li style={linkItem}>
          <Ext href="https://sci.esa.int/web/gaia/-/measuring-the-acceleration-of-the-solar-system-with-gaia">ESA, Gaia: “Measuring the acceleration of the Solar System with Gaia”</Ext> (a news
          item, dated 3 December 2020, which ESA’s site says is under review and not being updated; page read on 23 November 2026): a one-line meaning of aberration, the name of James Bradley and
          the year 1727, and how the Gaia mission used the same effect on distant quasars. It does not explain why the effect happens.
        </li>
        <li style={linkItem}>
          <Ext href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html">NASA, Earth Fact Sheet</Ext> (a table of numbers, last updated 15 November 2024; page read on 23 November
          2026): the Earth’s orbital speed, 29.78 kilometres per second on average, which the tutor uses.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        Two original papers are not linked, because they could not be read for this page (checked 23 November 2026): James Bradley’s paper on the discovery (the Royal Society’s site refused the
        request) and Einstein’s 1905 paper “On the Electrodynamics of Moving Bodies”, section 7, where the formula for the traveler’s angle appears (the copies fetched stopped before that section).
        A link is added only after the page has been read.
      </p>
    </div>
  )
}
