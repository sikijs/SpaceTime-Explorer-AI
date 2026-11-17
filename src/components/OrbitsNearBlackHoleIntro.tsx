import type { ReactNode } from 'react'
import {
  FAR_START_IN_HORIZON_RADII,
  LAST_SAFE_ORBIT_IN_HORIZON_RADII,
  MAX_START_IN_HORIZON_RADII,
  MIN_START_IN_HORIZON_RADII,
  NUDGE,
  PART_ONE_START_IN_HORIZON_RADII,
  S2_CLOSEST_APPROACH_AU_ESO,
  S2_PERIOD_YEARS,
  S301_NEXT_CLOSEST_PASSAGE_YEAR,
  S301_PERIOD_YEARS,
  S301_TOP_SPEED_KM_PER_S,
  lastSafeOrbitRows,
  realStarRows,
  runFarPair,
  runPartOne,
  s301TopSpeedFractionOfLight,
} from '../physics/orbitsNearBlackHoleExperiment'
import { SGRA_IMAGE } from './BlackHoleIntro'
import { MUTED_COLOR, TEXT_COLOR } from './GravitationalWaveExperiment'
import { paragraph } from './TidalEffectExperiment'
import { formatDistance, formatNumber, formatRadii } from './OrbitsNearBlackHolePictures'

// Black Holes, Experiment 3 (audit update): the illustrated introduction, the real orbits and recent news, the "Want to know more?" list and
// the "Words and formulas" box (docs/audit/black-holes-and-strong-gravity/03-draft-wording.md, approved by the owner on 2026-11-17).
// It gives no answer to the three guesses (CLAUDE.md §12): it never says where the last safe orbit is, what a nudged circle does at 2 horizon
// radii, or how the two rules compare at 20. Two real pictures (ESO, and the EHT via ESO) and one drawing made for this page.

const BASE = import.meta.env.BASE_URL
const S2_IMAGE = `${BASE}images/black-holes/s2-orbit-eso0226c.jpg`

const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#000',
} as const

function Figure({ children, caption, credit }: { children: ReactNode; caption: ReactNode; credit: ReactNode }) {
  return (
    <figure style={{ margin: '1rem 0', padding: 0 }}>
      {children}
      <figcaption style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
        {caption} <span style={{ fontSize: '0.75rem' }}>{credit}</span>
      </figcaption>
    </figure>
  )
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  )
}

// Rounded to two significant figures, with thousands separators ("1,600", "140").
function roundedTo2(value: number): string {
  return Number(value.toPrecision(2)).toLocaleString('en-US')
}

// The drawing made for this page: two rules for a circle. It shows the question, not the answer: the right-hand rings are drawn dashed and
// labelled "?" with no distance given.
function TwoRulesDrawing() {
  const ring = (cx: number, r: number, dashed = false, color = '#94a3b8') => (
    <circle cx={cx} cy={110} r={r} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dashed ? '5 4' : undefined} />
  )
  return (
    <svg
      viewBox="0 0 640 230"
      width="100%"
      role="img"
      aria-label="Two sets of rings around a black hole. Left: every ring is solid, labelled a circle at any distance. Right: the outer rings are solid and the inner rings are dashed with a question mark."
      style={{ maxWidth: '640px', display: 'block', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', backgroundColor: '#0b1020' }}
    >
      <text x={160} y={22} fill="#facc15" fontSize="13" fontWeight="bold" textAnchor="middle">
        Ordinary gravity
      </text>
      <text x={480} y={22} fill="#22d3ee" fontSize="13" fontWeight="bold" textAnchor="middle">
        The exact theory
      </text>
      {[30, 55, 80].map((r) => (
        <g key={`l${r}`}>{ring(160, r, false, '#facc15')}</g>
      ))}
      {[30, 55].map((r) => (
        <g key={`r${r}`}>{ring(480, r, true, '#22d3ee')}</g>
      ))}
      {ring(480, 80, false, '#22d3ee')}
      <circle cx={160} cy={110} r={9} fill="#e879f9" fillOpacity={0.4} stroke="#fb7185" strokeWidth={2} />
      <circle cx={480} cy={110} r={9} fill="#e879f9" fillOpacity={0.4} stroke="#fb7185" strokeWidth={2} />
      <text x={160} y={212} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        a circle at any distance
      </text>
      <text x={320} y={22} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
        black hole in the middle of each
      </text>
      <text x={480} y={204} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        a circle at every distance too,
      </text>
      <text x={480} y={219} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        or do the dashed ones differ?
      </text>
      <text x={480} y={140} fill="#e2e8f0" fontSize="22" fontWeight="bold" textAnchor="middle">
        ?
      </text>
    </svg>
  )
}

export function OrbitsNearBlackHoleIntro() {
  const two = runPartOne()
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> In Gravity and Curved Spacetime, Experiment 6, you saw that a planet stays in orbit because it moves sideways as it falls, so it
        keeps missing the thing it falls toward, and that this works at any distance. Close to a black hole, gravity is as strong as it ever gets (you saw that in Black
        Holes 2). So is it still safe to circle a black hole, at any distance outside its edge? Or is there a place where an orbit cannot last?
      </p>
      <p style={paragraph}>
        <strong>Why even ask this.</strong> In the earlier chapters, planets and GPS satellites keep circling steadily. Nothing seems to threaten them, so it is natural
        to assume that if you can get into an orbit, you can stay there. But the earlier experiments only used orbits in gravity that is gentle compared with a black
        hole’s. This experiment asks whether that dependable picture still holds where gravity is at its strongest.
      </p>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>Going round in a circle</h4>
      <p style={paragraph}>
        Think of swinging a stone on a string. Spin it too slowly and it drops. Spin it too fast and the string is pulled from your hand. At one speed in between, the
        stone goes round in a perfect circle. Gravity is the string for a planet. In Gravity 6 you saw that this works at any distance: pick the distance, give the planet
        the right sideways speed, and it circles. Real orbits are never perfectly clean, though. A grain of dust, a passing star or a gentle push can nudge an orbit a
        little. So the question is not only “can a planet circle here?” but “if a circle gets a small nudge, does it stay a circle?”
      </p>
      <Figure
        caption={<>A drawing made for this page: the same black hole with rings of orbits at several distances, under two rules of gravity. It shows the question only.</>}
        credit="Drawing: made for this page."
      >
        <TwoRulesDrawing />
      </Figure>

      <h4 style={{ margin: '1.25rem 0 0.5rem' }}>What happens</h4>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>Here is the whole experiment, step by step.</p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>You make three guesses; then you press Run.</li>
        <li>Two small probes (think of tiny spacecraft) are placed at the same distance from a black hole, one in each picture.</li>
        <li>
          <strong>Each probe is launched sideways at a “just right” speed.</strong> The “just right” speed depends on which rule of gravity you use. The{' '}
          <strong>left probe</strong> uses <strong>ordinary gravity</strong>, the rule from Experiment 6. The <strong>right probe</strong> uses the{' '}
          <strong>exact theory of gravity</strong> (general relativity, the theory that gravity is curved spacetime). So each probe gets the “just right” speed from its
          own rule, and each one starts out as a perfect circle by that rule.
        </li>
        <li>Both probes get the same tiny push inward. It is too small to see in the picture.</li>
        <li>You watch for up to ten turns around the black hole. A probe that reaches the black hole’s edge stops there.</li>
        <li>
          Pictures show each probe’s path and how far each is from the black hole. A second, smaller pair shows the same two probes starting far out, at{' '}
          {FAR_START_IN_HORIZON_RADII} horizon radii.
        </li>
      </ol>
      <p style={paragraph}>The question each picture answers is the same: after the tiny push, does the probe stay in its orbit?</p>

      <p style={paragraph}>
        <strong>Some words we will use.</strong> A <strong>circular orbit</strong> is an orbit that stays at one distance from the center the whole way round, like a stone
        swung steadily on a string, except that here gravity is the string. A <strong>nudge</strong> is a tiny extra push, here inward. Real orbits always get small
        disturbances, for example from a passing grain of dust, so we ask whether an orbit survives one. To <strong>plunge</strong> is to spiral inward and cross the black
        hole’s edge. The <strong>horizon</strong> is that edge, the one-way boundary you met in Black Holes 1. The <strong>horizon radius</strong> is the distance from the black
        hole’s center to its horizon, and we measure distances in horizon radii: 10 horizon radii means ten times as far from the center as the edge is. The{' '}
        <strong>last safe orbit</strong> is the closest distance at which a circular orbit can still survive a small nudge. Closer in than that, a nudged circle does not last.
        The probes’ speeds are given as a fraction of the speed of light: 0.5 means half as fast as light. For the biggest black holes the distances in kilometers are huge,
        so we also give them in <strong>astronomical units</strong> (AU): 1 AU is the distance from the Earth to the Sun, about 150 million kilometers.
      </p>
      <p style={paragraph}>
        <strong>The black holes.</strong> They are the three from Black Holes 1 and 2: a stellar black hole of 10 Suns’ worth of mass (a round, illustrative value),
        Sagittarius A*, the black hole at the center of our galaxy, and M87*, the black hole imaged in the galaxy M87. Their masses are about 4 million and 6.5 billion
        Suns.
      </p>

      <RealOrbits />

      <p style={paragraph}>
        <strong>What you will do.</strong> You answer three questions, press Run and watch. The real pictures and tables never change with your guesses. After the run your
        guesses are drawn on the real pictures in white, and they appear again beside the results. Part 2 then lets you choose a black hole and a starting distance of your
        own, and the drawings follow those choices. In Part 1 the black hole is the 10-Sun one and the first start is {formatRadii(PART_ONE_START_IN_HORIZON_RADII)} horizon radii
        ({formatDistance(two.startKm)} from the center).
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>This is a thought experiment about a small probe.</strong> The probe is so light that its own gravity does not matter. How it got into orbit is not
          described.
        </li>
        <li>
          <strong>The exact theory’s equation is given, not derived.</strong> It is the standard equation for a small object near a black hole that does not spin and has no
          electric charge. Real black holes usually spin, which changes the details.
        </li>
        <li>
          <strong>The orbit lies in a flat plane,</strong> seen from above, and the probe loses no energy as it goes. A real orbit near a black hole loses some energy as
          gravitational waves (see the Gravitational Waves chapter), which is left out here.
        </li>
        <li>
          <strong>Both probes get the same tiny nudge,</strong> small but not zero: if nothing else acted, it would carry a probe in by about{' '}
          {(NUDGE * 2 * Math.PI * 100).toFixed(1)}% of its distance over one full turn.
        </li>
        <li>
          <strong>“Plunges” means the probe reaches the horizon.</strong> Nothing past that is modeled.
        </li>
        <li>
          <strong>The ordinary-gravity probe is shown even where ordinary gravity is not a good description,</strong> only so that the two rules can be compared.
        </li>
        <li>
          <strong>The distance control stops at {MIN_START_IN_HORIZON_RADII} horizon radii,</strong> because closer in than 1.5 no circular orbit exists for anything slower
          than light.
        </li>
      </ul>
    </div>
  )
}

// Real orbits we have seen, and recent news (as of November 2026). Sources: ESO eso2006 (16 April 2020) and eso2612 (19 August 2026), read on
// 2026-11-17. The distances in horizon radii are calculated here by the module from ESO's distances. The NASA pages on the disk's inner edge are
// held back until after the first run (they give the size of the edge); see TimeNear-style held-back links in OrbitsNearBlackHoleResults.
export function RealOrbits() {
  const [s2, s301] = realStarRows()
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Real orbits we have seen, and recent news (as of November 2026)</h4>
      <p style={paragraph}>
        <strong>A star whose orbit does not close (ESO, 16 April 2020).</strong> The star S2 circles Sagittarius A*, the black hole at the centre of our galaxy, once every{' '}
        {S2_PERIOD_YEARS} years. At its closest it is less than 20 billion km from the black hole, which is {S2_CLOSEST_APPROACH_AU_ESO} times the distance from the Earth to
        the Sun, and it moves at almost 3% of the speed of light. ESO’s telescope followed it for about 27 years and found that its orbit is shaped like a rosette and not like
        an ellipse: each lap is turned a little compared with the one before, as Einstein’s theory predicts. The same turning was first seen in the orbit of the planet Mercury.
      </p>
      <Figure
        caption={
          <>
            <strong>A real observation.</strong> Left: an infrared picture of the crowded centre of the Milky Way (May 2002) with the star S2 marked next to the invisible black
            hole Sagittarius A*. Right: the path S2 followed from 1992 to 2002, with dated points. This is an early picture; later measurements followed S2 through its closest
            approach in May 2018.
          </>
        }
        credit="Image: ESO."
      >
        <img
          src={S2_IMAGE}
          alt="Left: an infrared image of many bright dots, with the star S2 and the black hole Sagittarius A* marked by arrows. Right: a tall ellipse with dated points from 1992 to 2002 showing the path S2 followed around Sagittarius A*."
          width={1280}
          height={949}
          style={{ ...imgStyle, maxWidth: 'min(100%, 640px)', backgroundColor: '#fff' }}
        />
      </Figure>
      <p style={paragraph}>
        <strong>The fastest known star (ESO, 19 August 2026).</strong> In August 2026 astronomers announced a star named S301. It goes round Sagittarius A* in just{' '}
        {S301_PERIOD_YEARS} years and reaches speeds of {formatNumber(S301_TOP_SPEED_KM_PER_S)} km a second, over 8% of the speed of light ({formatNumber(s301TopSpeedFractionOfLight() * 100)}%
        by this page’s arithmetic). At its closest it is 1.78 billion km from the black hole, about 12 times the distance from the Earth to the Sun: closer than any other star
        observed so far. Its next closest approach is in {S301_NEXT_CLOSEST_PASSAGE_YEAR}. The team hopes to use it to measure how fast Sagittarius A* spins. The paper in{' '}
        <em>Nature</em> was not read for this page; the figures come from ESO’s release.
      </p>
      <Figure
        caption={<>Sagittarius A*, the black hole at the heart of our galaxy (12 May 2022). A real observation: a ring of glowing gas around a dark shadow.</>}
        credit="Image: EHT Collaboration (CC BY 4.0), via ESO."
      >
        <img
          src={SGRA_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas with three brighter spots, around a dark patch in the middle, on a black background."
          width={1280}
          height={1280}
          style={{ ...imgStyle, maxWidth: 'min(100%, 420px)' }}
        />
      </Figure>
      <p style={paragraph}>
        <strong>How far out is that?</strong> Measured the way this page measures, in horizon radii: S2’s closest approach is less than about {roundedTo2(s2.horizonRadiiThisPage)} horizon
        radii from Sagittarius A* and S301’s is about {roundedTo2(s301.horizonRadiiThisPage)} (about {roundedTo2(s301.horizonRadiiEsoMass)} with ESO’s rounder four million Suns). Both
        stars are far outside the distances this experiment is about. They show that Einstein’s theory shapes real orbits even far out; they do not show what happens at the last
        safe orbit.
      </p>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        Science changes quickly; this block shows what was true on the date above. A NASA page and a 2024 NASA report on the gas that circles a black hole are added to the list
        of links after your first run, because they give the size of the edge.
      </p>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function OrbitsNearBlackHoleLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>The discoveries</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso2006/">ESO, “ESO Telescope Sees Star Dance Around Supermassive Black Hole, Proves Einstein Right”</Ext> (16 April
          2020): the star S2 and its rosette-shaped orbit.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso2612/">
            ESO, “Milky Way’s fastest star orbits our supermassive black hole so closely it feels its spin”
          </Ext>{' '}
          (19 August 2026): the star S301 and how close it comes.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        All links open in a new tab. After your first run, Part 3 adds links to two NASA pages about the inner edge of the gas disk around a black hole. They are held back so they do
        not give away your guesses.
      </p>
    </div>
  )
}

// The entries of the shared "Words and formulas" panel (ReferencePanel). The last safe orbit's value, the launch-speed formulas and the model's
// edge give the guesses away, so they appear only after the first run (CLAUDE.md §12).
export function orbitsNearBlackHoleWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const two = runPartOne()
  const far = runFarPair()
  const rows = lastSafeOrbitRows()
  const entries = [
    { term: 'Circular orbit', meaning: 'an orbit that stays at one distance from the center the whole way round, like a stone swung steadily on a string.' },
    { term: 'Nudge', meaning: 'a tiny extra push, here inward. A real orbit always gets small disturbances, so we ask whether it survives one.' },
    { term: 'Plunge', meaning: 'to spiral inward and cross the black hole’s edge (the horizon). Nothing past that is modeled.' },
    { term: 'Probe', meaning: 'a small object, so light that its own gravity does not matter, followed as it goes round the black hole.' },
    { term: 'Horizon, horizon radius', meaning: 'the one-way edge of a black hole, and its distance from the center (written r_s). From Black Holes 1.' },
    { term: 'Distance in horizon radii', meaning: 'the distance from the center divided by r_s. “2 horizon radii” means twice as far from the center as the edge is.' },
    { term: 'Last safe orbit', meaning: 'the closest distance at which a circular orbit can still survive a small nudge. Closer in than that, a nudged circle does not last.' },
    { term: 'Launch speed', meaning: 'the sideways speed that gives a circular orbit at a given distance, written as a fraction of the speed of light (0.5 is half as fast as light).' },
    { term: 'Precess', meaning: 'to turn a little each lap. S2’s orbit precesses: the closest point of each lap is turned a little compared with the lap before, giving a rosette shape (ESO, 2020).' },
    { term: 'Accretion disk', meaning: 'gas circling a black hole in a flat disk as it spirals toward it.' },
    { term: 'Astronomical unit (AU)', meaning: 'the distance from the Earth to the Sun, about 150 million kilometers.' },
  ]
  if (afterRun) {
    entries.push(
      {
        term: 'Formula: the last safe orbit',
        meaning: `in the exact theory it is at 6GM/c² from the center, which is ${LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii (r_s = 2GM/c², so 6GM/c² = 3 r_s). Worked example for ${rows[0].preset.label.toLowerCase()}: ${LAST_SAFE_ORBIT_IN_HORIZON_RADII} × ${formatNumber(rows[0].horizonRadiusKm)} km = ${formatNumber(rows[0].lastSafeOrbitKm)} km. NASA’s “ISCO Facto?” page writes this as “6 times the black hole’s gravitational radius”; its “gravitational radius” is GM/c², so it is the same distance. It is given here, not derived.`,
      },
      {
        term: 'Formula: the launch speeds',
        meaning: `exact theory: √(r_s ÷ 2(r − r_s)); ordinary gravity: √(r_s ÷ 2r), both as fractions of the speed of light. Worked example at ${formatRadii(PART_ONE_START_IN_HORIZON_RADII)} horizon radii: ${two.exactSpeedFractionOfLight.toFixed(3)} and ${two.ordinarySpeedFractionOfLight.toFixed(3)}; at ${FAR_START_IN_HORIZON_RADII}: ${far.exactSpeedFractionOfLight.toFixed(3)} and ${far.ordinarySpeedFractionOfLight.toFixed(3)}. The exact one reaches 1 at 1.5 horizon radii, which is why no circular orbit exists there.`,
      },
      {
        term: 'The model’s edge',
        meaning: `this model finds the edge at a little over ${LAST_SAFE_ORBIT_IN_HORIZON_RADII} horizon radii (a smaller nudge would move it nearer ${LAST_SAFE_ORBIT_IN_HORIZON_RADII}), because the nudge is small but not zero.`,
      },
    )
  } else {
    entries.push({
      term: 'More words',
      meaning: 'the last safe orbit’s distance, the launch-speed formulas and a worked example appear here after your first run. They are held back so that they do not give away your guesses.',
    })
  }
  return entries
}

// ---------------------------------------------------------------------------------------------------------------
// The notes under the three Part 1 questions: the situation with real numbers, what each choice means, and how to answer. They give nothing
// away (CLAUDE.md §12): none says where the last safe orbit is, what a nudged circle does, or how the two rules compare far out.
// ---------------------------------------------------------------------------------------------------------------
const notesBox = {
  margin: '0 0 0.75rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  borderLeft: '3px solid #f59e0b',
} as const
const noteItem = { marginBottom: '0.3rem' } as const

export function GuessNotes({ n }: { n: 1 | 2 | 3 }) {
  const two = runPartOne()
  const far = runFarPair()
  const body: Record<1 | 2 | 3, ReactNode> = {
    1: (
      <>
        <li style={noteItem}>
          <strong>The situation.</strong> The black hole is the 10-Sun one from Black Holes 1, whose edge is about {formatNumber(two.horizonRadiusKm)} km from its center. The probe
          starts {formatRadii(PART_ONE_START_IN_HORIZON_RADII)} horizon radii out, which is {formatNumber(two.startKm)} km from the center. It is launched at the sideways speed that would give a
          perfect circle by the exact theory. The nudge is tiny: it would carry the probe in by about {(NUDGE * 2 * Math.PI * 100).toFixed(1)}% of its distance over one full turn.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> “Wobbles” means the probe stays roughly the same distance away for ten turns. “Spirals in” means its distance shrinks until it
          reaches the edge. “Flies off” means it ends the run much farther out than it started.
        </li>
        <li style={noteItem}>
          <strong>How to answer.</strong> Pick the choice nearest your feeling.
        </li>
      </>
    ),
    2: (
      <>
        <li style={noteItem}>
          <strong>The situation.</strong> This question is about where, if anywhere, a nudged circle stops lasting. Your answer is drawn on the pictures as a white ring or line at the
          distance you chose, in horizon radii (the unit from Black Holes 1). “Anywhere” has no distance, so it is drawn as a marker only.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> The first says every circle outside the edge is safe. The other two name a distance in horizon radii: closer in than that, a nudged
          circle does not last.
        </li>
        <li style={noteItem}>
          <strong>How to answer.</strong> Pick the choice nearest your feeling.
        </li>
      </>
    ),
    3: (
      <>
        <li style={noteItem}>
          <strong>The situation.</strong> This question is about the second, smaller pair of pictures, where both probes start {FAR_START_IN_HORIZON_RADII} horizon radii out ({formatDistance(far.startKm)} from
          the center). The two launch speeds are given as fractions of the speed of light.
        </li>
        <li style={noteItem}>
          <strong>What the choices mean.</strong> “Nearly the same” means the two paths look alike after ten turns. “Very different” means one of them has gone somewhere the other has not.
        </li>
        <li style={noteItem}>
          <strong>How to answer.</strong> Pick the choice nearest your feeling.
        </li>
      </>
    ),
  }
  return (
    <ul style={{ ...notesBox, listStyle: 'none', paddingLeft: '0.75rem' }} aria-label={`About question ${n}`}>
      {body[n]}
    </ul>
  )
}

export const PART_TWO_START_PRESETS = [20, 6, 3.5, 3, 2.5, 1.6]

const stepItem = { marginBottom: '0.4rem' } as const
const partTwoBox = { margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-muted)' } as const

export function PartTwoGuide() {
  return (
    <div style={partTwoBox}>
      <p style={{ marginTop: 0, marginBottom: '0.3rem' }}>
        <strong>How Part 2 works.</strong> In Part 1 the black hole and the starts were chosen for you. Now they are yours, and you can run the probes as many times as you like.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={stepItem}>
          <strong>Choose a black hole.</strong> The three from Black Holes 1 and 2. They are very different in mass and size, but, in horizon radii, an orbit behaves the same way around each.
        </li>
        <li style={stepItem}>
          <strong>Choose a starting distance,</strong> in horizon radii, with the buttons or the slider, from {MAX_START_IN_HORIZON_RADII} (far) down to {MIN_START_IN_HORIZON_RADII}. The distance in kilometers
          is shown beside it.
        </li>
        <li style={stepItem}>
          <strong>Press “Run your choice”.</strong> Both probes start together, and you watch up to ten turns. If you change a setting afterwards, the pictures switch to the new settings and
          the probes go back to the start until you run again.
        </li>
        <li style={stepItem}>
          <strong>Compare.</strong> Three things worth trying: keep the black hole and move the start from far away to very near; keep the start and change the black hole; and look at where
          the blue probe stops plunging.
        </li>
        <li style={stepItem}>
          <strong>Read the numbers.</strong> Table 3 in Part 3 follows your last completed run.
        </li>
      </ol>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        Pictures 3 and 4 below are drawn the same way as Pictures 1 and 2 of Part 1, for your settings. Your guesses are not drawn on them.
      </p>
    </div>
  )
}

// What each black hole's size means, in kilometers.
export function BlackHoleOptionsNote() {
  const rows = lastSafeOrbitRows()
  return (
    <ul style={{ ...partTwoBox, margin: '0.25rem 0 0.5rem', paddingLeft: '1.25rem' }}>
      {rows.map((r) => (
        <li key={r.preset.id} style={{ marginBottom: '0.2rem' }}>
          <strong>{r.preset.label}:</strong> its horizon radius is about {formatDistance(r.horizonRadiusKm)}.
        </li>
      ))}
    </ul>
  )
}
