import type { ReactNode } from 'react'
import {
  BACKGROUND_KELVIN,
  HAWKING_PRESETS,
  HAWKING_TEMPERATURE_OF_ONE_SUN_KELVIN,
  LIFETIME_OF_ONE_SUN_YEARS,
  balanceMassKg,
  coldnessAgainstBackground,
  hawkingTemperatureKelvin,
} from '../physics/hawkingRadiationExperiment'
import {
  DEGREES_BELOW_FREEZING,
  M87_BILLIONS,
  SGR_A_STAR_MILLIONS,
  SUN_MASS_TEXT,
  formatScientific,
} from './HawkingRadiationPictures'

// Black Holes, Experiment 10 (audit update): the introduction, the links, the words box, the real-world blocks and the notes under the three questions
// (docs/audit/black-holes-and-strong-gravity/10-draft-wording.md, "all defaults" from the owner on 2026-11-19). "The question" is kept word for word at
// the owner's request. The introduction keeps clear of the answers to the three questions (CLAUDE.md §12): it does not say that a smaller black hole is
// hotter, that a black hole can be colder than space, which way a mass goes in the background, or how the lifetime depends on the mass. Nothing in the
// drawings is white: white is reserved for the learner's guess marks.

const BASE = import.meta.env.BASE_URL
const M87_IMAGE = `${BASE}images/black-holes/m87-eht-eso1907a.jpg`
const SGRA_IMAGE = `${BASE}images/black-holes/sgra-eht-eso2208.jpg`

const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#0b1020',
} as const

const textBox = { marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' } as const
const p = { marginTop: 0, marginBottom: '0.75rem' } as const
const ol = { marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' } as const
const ul = { margin: '0.25rem 0 0.75rem', paddingLeft: '1.25rem' } as const
const linkItem = { marginBottom: '0.4rem' } as const

function Figure({ children, caption }: { children: ReactNode; caption: ReactNode }) {
  return (
    <figure style={{ margin: '1rem 0', padding: 0 }}>
      {children}
      <figcaption style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>{caption}</figcaption>
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

const IN = '#38bdf8'
const OUT = '#fb923c'

// An arrow from (x1, y1) to (x2, y2), with a small head at the end.
function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = (d: number) => `${x2 + 9 * Math.cos(angle + d)},${y2 + 9 * Math.sin(angle + d)}`
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={3} />
      <polygon points={`${x2},${y2} ${head(Math.PI - 0.45)} ${head(Math.PI + 0.45)}`} fill={color} />
    </g>
  )
}

// Figure 1: the one-way door. Arrows go in; on the other side, a faint dotted glow with a question mark. No numbers and no answer.
function DoorDrawing() {
  return (
    <svg
      viewBox="0 0 440 200"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="A drawing of a black hole as a dark disc with a ring. Three blue arrows point into it from the left. On the right there is a faint dotted orange glow with a question mark."
    >
      <text x={220} y={20} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        the one-way door, and a question
      </text>
      <Arrow x1={30} y1={80} x2={146} y2={98} color={IN} />
      <Arrow x1={20} y1={105} x2={140} y2={105} color={IN} />
      <Arrow x1={30} y1={132} x2={146} y2={114} color={IN} />
      <circle cx={220} cy={105} r={52} fill="#000000" stroke="#fb7185" strokeWidth={3} />
      <text x={220} y={109} fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="middle">
        black hole
      </text>
      <circle cx={220} cy={105} r={66} fill="none" stroke={OUT} strokeWidth={2} strokeDasharray="2 6" strokeOpacity={0.7} />
      <circle cx={220} cy={105} r={78} fill="none" stroke={OUT} strokeWidth={2} strokeDasharray="2 9" strokeOpacity={0.45} />
      <text x={355} y={100} fill={OUT} fontSize="15" fontWeight="bold" textAnchor="middle">
        a very faint glow?
      </text>
      <text x={355} y={120} fill={OUT} fontSize="22" fontWeight="bold" textAnchor="middle">
        ?
      </text>
      <text x={80} y={170} fill={IN} fontSize="11" textAnchor="middle">
        things fall in
      </text>
      <text x={220} y={186} fill="#fb7185" fontSize="11" textAnchor="middle">
        rose ring: the horizon
      </text>
    </svg>
  )
}

// Figure 2: the kelvin scale, with the cosmic microwave background and everyday marks. No black hole on it.
function KelvinDrawing() {
  const marks: Array<{ label: string; sub: string; y: number; color: string }> = [
    { label: '293 K', sub: 'a room, about 20 °C', y: 40, color: '#cbd5e1' },
    { label: '273 K', sub: 'water freezes, 0 °C', y: 80, color: '#cbd5e1' },
    { label: `${BACKGROUND_KELVIN} K`, sub: `the cosmic microwave background, about ${DEGREES_BELOW_FREEZING} degrees below freezing`, y: 140, color: '#4ade80' },
    { label: '0 K', sub: 'the coldest possible, −273 °C', y: 190, color: '#cbd5e1' },
  ]
  return (
    <svg
      viewBox="0 0 440 230"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="A vertical temperature scale in kelvin with four marks: a room at 293 kelvin, freezing water at 273 kelvin, the cosmic microwave background at 2.725 kelvin, and 0 kelvin, the coldest possible."
    >
      <text x={220} y={18} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        the kelvin scale (not to scale: the real gaps are very uneven)
      </text>
      <line x1={110} y1={30} x2={110} y2={200} stroke="#94a3b8" strokeWidth={3} />
      {marks.map((m) => (
        <g key={m.label}>
          <line x1={100} y1={m.y} x2={120} y2={m.y} stroke={m.color} strokeWidth={3} />
          <text x={92} y={m.y + 4} fill={m.color} fontSize="12" fontWeight="bold" textAnchor="end">
            {m.label}
          </text>
          <text x={130} y={m.y + 4} fill={m.color} fontSize="11">
            {m.sub}
          </text>
        </g>
      ))}
    </svg>
  )
}

// Figure: a river speeding up toward a waterfall. A wave swimming upstream is slowed, and past one place it can no longer make headway. This is the
// comparison for a laboratory analogue. No numbers.
function RiverDrawing() {
  const flows = [
    { x: 30, len: 22 },
    { x: 90, len: 40 },
    { x: 165, len: 62 },
    { x: 265, len: 90 },
    { x: 385, len: 115 },
  ]
  return (
    <svg
      viewBox="0 0 520 210"
      width="100%"
      style={{ ...imgStyle, maxWidth: '560px' }}
      role="img"
      aria-label="A drawing of a river flowing from left to right, speeding up. The blue arrows get longer toward the right. A small orange wave tries to move upstream to the left. A rose dashed line marks the place where the flow becomes faster than the wave can move, and beyond it the wave is carried to the right."
    >
      <text x={260} y={18} fill="#e2e8f0" fontSize="12" fontWeight="bold" textAnchor="middle">
        a river that speeds up, and a wave trying to go upstream
      </text>
      {flows.map((f) => (
        <Arrow key={f.x} x1={f.x} y1={110} x2={f.x + f.len} y2={110} color={IN} />
      ))}
      <text x={60} y={140} fill={IN} fontSize="11" textAnchor="middle">
        slow flow
      </text>
      <text x={440} y={140} fill={IN} fontSize="11" textAnchor="middle">
        fast flow
      </text>
      <path d="M 150 70 q 10 -14 20 0 t 20 0 t 20 0" fill="none" stroke={OUT} strokeWidth={3} />
      <Arrow x1={150} y1={92} x2={112} y2={92} color={OUT} />
      <text x={150} y={58} fill={OUT} fontSize="11">
        a wave moving upstream
      </text>
      <line x1={330} y1={40} x2={330} y2={170} stroke="#fb7185" strokeWidth={2.5} strokeDasharray="6 5" />
      <text x={324} y={188} fill="#fb7185" fontSize="11" textAnchor="end">
        the point of no return for the wave
      </text>
    </svg>
  )
}

// The laboratory copies, in their own section: what an analogue is, why scientists make them, what has been done, and what it does and does not show.
function LaboratoryCopies() {
  return (
    <div style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>Small copies of black holes, made in the laboratory.</strong>
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>1. What is a laboratory analogue?</strong>
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        An <em>analogue</em> is something that is not the real thing but follows some of the same rules, so that studying it teaches us about the real thing. A model aeroplane in a wind tunnel is a small example. A laboratory analogue of a black hole is a small experiment, for instance with a cloud of atoms or a pulse of light, set up so that something behaves like light does near a black hole’s edge. It is not a black hole, and it has no gravity of its own.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>2. Why make one?</strong>
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        A real black hole is too far away, too heavy and, as you will see, far too faint in its glow for anyone to study it close up. In a laboratory a scientist can change the settings and repeat the experiment as often as they like. The team behind the July 2026 experiment says that in a controlled setting it is possible to study effects that would be almost out of reach in the real universe.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>3. A comparison from daily life.</strong>
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        Picture a river that flows faster and faster as it nears a waterfall. A wave moving upstream is slowed by the current. Farther along, the river runs faster than the wave can travel, so the wave can no longer make headway: whatever is past that place is carried on downstream. For that wave, that place is a point of no return, like the horizon of a black hole is for light. Scientists use this kind of idea in their analogues, with waves in cold atoms or in light, instead of water. It is only a comparison, and it does not explain the physics.
      </p>
      <Figure
        caption={
          <>
            <strong>Figure 2. A comparison for a laboratory analogue.</strong> The blue arrows are the flow, longer where it is faster. The orange wave tries to move upstream. The rose dashed line is the place beyond which the flow is faster than the wave, so the wave cannot get back. A drawing made for this page, not to scale, and not a picture of any real experiment.
          </>
        }
      >
        <RiverDrawing />
      </Figure>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>4. What has been done.</strong>
      </p>
      <ul style={{ ...ul, marginBottom: '0.5rem' }}>
        <li>
          <strong>2016.</strong> Jeff Steinhauer reported, in <em>Nature Physics</em>, that he had seen this kind of glow coming from an analogue made of a cloud of atoms cooled to almost absolute zero (a <em>Bose-Einstein condensate</em>, in which the atoms act together like one wave).
        </li>
        <li>
          <strong>2019.</strong> Juan Ramón Muñoz de Nova, Katrine Golubkov, Victor Kolobov and Jeff Steinhauer reported, in <em>Nature</em>, that they had measured the glow of their analogue and found it to be thermal, at the temperature that the theory gives for that analogue. In plain words, the glow behaved like the glow of something with a temperature, as Hawking’s idea says.
        </li>
        <li>
          <strong>July 2026.</strong> A team from Paderborn in Germany, the Weizmann Institute in Israel and Cinvestav in Mexico reported, in <em>Nature</em>, an experiment with a pulse of light travelling in an optical fibre. They say it shows a simpler, more direct way the glow is made than was believed before, and that the glow acts back on the system that makes it. They also say their findings suggest the same direct process for other laboratory analogues, and perhaps for gravity too.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>5. What this shows, and what it does not.</strong>
      </p>
      <ul style={{ ...ul, marginBottom: 0 }}>
        <li>
          <strong>It shows</strong> that the kind of glow Hawking’s idea describes can appear in a system that has the right kind of edge, and it lets scientists study how it is made.
        </li>
        <li>
          <strong>It does not show</strong> that a real black hole gives off Hawking radiation. The July 2026 paper says so itself: Hawking radiation “has never been observed in astronomy”. The authors say their results may help us understand how real black holes radiate, which is a hope, and not a result.
        </li>
      </ul>
    </div>
  )
}

export function HawkingRadiationIntro() {
  return (
    <div style={textBox}>
      {/* "The question" is kept word for word at the owner's request (2026-11-19). */}
      <p style={p}>
        <strong>The question.</strong> So far, a black hole has been a one-way door: things fall in, and nothing comes out, not even light. Black Holes 9 showed how a black hole is born. This experiment asks about its end. Quantum physics, the science of very small things such as atoms and particles, changes the picture a little. It says that a black hole is not perfectly black: it gives off a very faint heat of its own, so it has a temperature. The energy that leaves would come out of the black hole’s own mass. But a black hole does not sit in empty space. Space has some heat of its own too (you will meet it below). So which way does a black hole’s mass go, and can a black hole slowly disappear?
      </p>
      <Figure
        caption={
          <>
            <strong>Figure 1. The question of this page.</strong> Until 1974 the picture was only arrows going in. Quantum physics adds a possibility: that something faint comes out as well. The dotted glow and the question mark mark that possibility, and the page is about what it means. A drawing made for this page, not to scale.
          </>
        }
      >
        <DoorDrawing />
      </Figure>
      {/* Elaborated at the owner's request (2026-11-19): the old closing sentence assumed that a black hole can disappear. It now asks whether it can. */}
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>Why even ask this.</strong> It is easy to think of a black hole as something that only ever grows: everything falls in and nothing comes out, so its mass can only go up, and it would seem to last forever. That would make a black hole the one object in the universe with no end. Is that really so? Three things make the question worth asking.
      </p>
      <ul style={ul}>
        <li>
          <strong>It puts two big ideas side by side.</strong> Einstein’s theory of gravity describes very heavy things, such as stars and black holes. Quantum physics describes very small things, such as atoms and particles. Most of the time we can use one or the other. A black hole is a place where both matter: it is very heavy, and its edge, the horizon, is a sharp boundary where tiny quantum effects can add up. Hawking’s result in 1974 is one of the few places where the two ideas were used together.
        </li>
        <li>
          <strong>It decides what a black hole’s future could be.</strong> If nothing can ever leave a black hole, it can only stay the same or grow. If something can leave, a black hole might shrink, and then there are more questions: what decides whether it shrinks or grows, and how long a shrinking would take. This page does not assume the answer. It asks whether a black hole can disappear at all, and, if the theory says it can, what decides it and how long it would take.
        </li>
        <li>
          <strong>It leads to a puzzle that is not solved.</strong> If a black hole did disappear, what would become of everything that fell in? Scientists call this the information paradox. It is still open, and this page does not try to settle it.
        </li>
      </ul>
      <p style={p}>
        One more thing, to be honest from the start: nobody has ever seen this from a real black hole (see “what has and has not been seen” below). The numbers you will meet here are what the theory predicts, worked out step by step, not measurements.
      </p>

      <p style={p}>
        <strong>Where this idea comes from.</strong> In 1974 the physicist Stephen Hawking worked out that quantum physics means a black hole should give off a faint heat, as if it had a temperature. His short letter in the journal <em>Nature</em> is called “Black hole explosions?”, and it says that as a black hole gives off this heat, “one would expect it to lose mass”. A year later he published the full calculation. Because it joins two big theories, gravity and quantum physics, this is one of the most famous results in modern physics. The glow is called <strong>Hawking radiation</strong>.
      </p>

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>As of November 2026: what has and has not been seen.</strong>
      </p>
      <ul style={ul}>
        <li>
          <strong>Nobody has ever seen it from a real black hole.</strong> A paper in <em>Nature</em> on 1 July 2026 says it plainly: Hawking radiation “has never been observed in astronomy, only in laboratory analogues, and the chances of ever observing it in space are astronomically small”. This page works out what the physics says. It does not show something that has been seen.
        </li>
        <li>
          <strong>Scientists have built small copies in the laboratory.</strong> They are not black holes, but they follow some of the same rules. They are explained in the next section.
        </li>
        <li>
          <strong>The search for tiny black holes that may be ending now</strong> appears after your first run, in Part 3.
        </li>
      </ul>

      {/* Made its own section at the owner's request (2026-11-19): the facts were crammed into one bullet. */}
      <LaboratoryCopies />

      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What happens.</strong> Here is the whole experiment, step by step.
      </p>
      <ol style={ol}>
        <li>In Part 1 you make three predictions.</li>
        <li>You press Run. The page runs a black hole of 10 Suns.</li>
        <li>
          A time-lapse plays for 10 seconds. It shows what happens to the black hole’s mass. This is only how the result is shown: the real changes take far, far longer than that.
        </li>
        <li>
          A <strong>thermometer</strong> compares the black hole’s temperature with the temperature of space. A picture with <strong>arrows</strong> shows the heat going in and out. A <strong>graph</strong> shows how long a black hole alone would take to disappear.
        </li>
        <li>In Part 2 you try the other black holes, one at a time, and compare.</li>
        <li>The experiment shows only the direction in which the mass goes, and not how fast it changes there.</li>
      </ol>

      <Figure
        caption={
          <>
            <strong>Figure 3. The kelvin scale.</strong> Each kelvin is the same size as a degree Celsius, but the scale starts at the coldest temperature there can be. Space itself is a little warmer than that coldest point: the cosmic microwave background, at {BACKGROUND_KELVIN} K. Near the bottom of the scale, where this page works, the numbers become tiny, which is why the thermometer in Part 1 uses powers of ten. A drawing made for this page, with no black hole on it.
          </>
        }
      >
        <KelvinDrawing />
      </Figure>

      <p style={p}>
        <strong>Some words we will use.</strong> <strong>Temperature</strong> says how hot something is. Scientists measure it in <strong>kelvin</strong> (K). A kelvin is the same size of step as a degree Celsius, but the scale starts at the coldest temperature there can be, 0 K, which is −273 °C, so nothing is colder than 0 K. Water freezes at 273 K, and a room is about 293 K. <strong>The cosmic microwave background</strong>, from Cosmology 3, is a very faint glow of microwaves (a kind of light our eyes cannot see) that fills all of space and is left over from the early universe. It has a temperature of {BACKGROUND_KELVIN} K, about {DEGREES_BELOW_FREEZING} degrees below freezing. To <strong>evaporate</strong> is to shrink away, bit by bit, until nothing is left, the way a puddle dries up. From Black Holes 1: a <strong>Sun</strong> is the mass of our Sun, a black hole of “1 Sun” is a black hole with that mass (the Sun itself will never become one), and the <strong>horizon</strong> is the edge of a black hole, from inside which nothing can escape. <strong>Hawking radiation</strong> is the faint heat that quantum physics says a black hole gives off. A <strong>laboratory analogue</strong> is a small experiment that follows the same kind of rules as the edge of a black hole, without being one. A <strong>primordial black hole</strong> is a black hole that may have formed in the first second after the universe began, long before any star; NASA says none has yet been found. The <strong>information paradox</strong> is a puzzle about what happens to everything that fell in if the black hole disappears. It is not solved, and this page does not try. All of these are also in the “Words and formulas” box below.
      </p>
      <p style={p}>
        <strong>The six black holes.</strong> Mass is measured here in kilograms (kg) and in Suns (one Sun is about {SUN_MASS_TEXT} kg). Some numbers in this experiment are very large or very small, so they are written with powers of ten: 10³ is 1,000 (a 1 with 3 zeros after it), and 10⁻³ is 0.001 (one thousandth). The <strong>mountain-sized</strong> black hole has the mass of a small mountain, about 10¹² kg. It is hypothetical: scientists think black holes this small might have formed in the first second of the universe (NASA’s page on black hole types), but none has been found. The <strong>balance mass</strong> is a special black hole of about 0.6 of the Moon’s mass, chosen for a reason you will see in the results. Then come black holes of <strong>1 Sun</strong> and <strong>10 Suns</strong> (a stellar black hole, as in Black Holes 1), and the two giants from Black Holes 1 at the centers of galaxies: <strong>Sagittarius A*</strong>, in our own galaxy (about {SGR_A_STAR_MILLIONS} million Suns), and <strong>M87*</strong> (about {M87_BILLIONS} billion Suns).
      </p>
      <p style={p}>
        <strong>What this builds on.</strong> Black Holes 1 found the horizon radius and gave the black holes in the list. Black Holes 9 showed how a black hole forms. This experiment is about the other end of its story. The cosmic microwave background comes from Cosmology 3 (the Cosmic Microwave Background).
      </p>
      <p style={p}>
        <strong>About your predictions.</strong> In Part 1 you make three guesses before you run anything. Your guesses never change the real pictures or tables. After you press Run, they are drawn on the pictures in white, in a box labelled YOUR GUESS, and shown again beside the results. In Part 2 the black hole you choose does change the drawings and tables, and your guesses do not.
      </p>
      <p style={p}>
        <strong>Your job.</strong> First, make three predictions. Then press Run. After that, choose other black holes and compare.
      </p>
      <p style={p}>
        <strong>What to look for.</strong> Where the black hole’s dot is on the thermometer compared with the green line for the background, which arrow is bold, what the black hole’s disk does, and where the black hole is on the graph as you try different ones.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ ...ul, marginBottom: 0 }}>
        <li>
          <strong>This is a thought experiment about one black hole</strong> that is alone, is not spinning, and has nothing falling into it.
        </li>
        <li>
          <strong>The formulas are standard results, given and not derived.</strong> Nobody has ever seen this faint heat from a real black hole. This page works out what the physics predicts. The experiment says so again where it matters.
        </li>
        <li>
          <strong>The times are rough.</strong> They are only good to within a few times, and are best read as powers of ten.
        </li>
        <li>
          <strong>The background is held at {BACKGROUND_KELVIN} K.</strong> The real background keeps getting colder as the universe expands, and the experiment does not model that.
        </li>
      </ul>
    </div>
  )
}

// The links shown from the start: none of them answers a guess. Each was read before it went in (the draft wording's source table).
export function HawkingRadiationLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.nature.com/articles/248030a0">Hawking, “Black hole explosions?”, <em>Nature</em> (1974)</Ext>: the original two-page letter. Its first paragraph, the abstract, is readable; the full text is behind a login.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.nature.com/articles/s41586-026-10720-3">“Backreaction of stimulated Hawking radiation in an optical analogue”, <em>Nature</em> (1 July 2026)</Ext>: the newest laboratory result, with a plain abstract that also says Hawking radiation has never been seen in astronomy.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/1809.00913">Muñoz de Nova and others, “Observation of thermal Hawking radiation at the Hawking temperature in an analogue black hole”</Ext> (<em>Nature</em>, 2019): an earlier laboratory analogue, made of cold atoms.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        All links open in a new tab. After your first run, Part 3 adds more pages and the papers behind the real results. They are held back so they do not give away your guesses.
      </p>
    </div>
  )
}

// The pages added after the first run (they say which way a mass goes or give the evaporation story).
export function HawkingRadiationHeldBackLinks() {
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>More to read, after your run</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/universe/black-holes/types/">NASA Science, “Black Hole Types”</Ext> (updated 12 August 2026): NASA’s tour of black holes, including primordial black holes and why small ones may have evaporated.
        </li>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/ask_astro/black_holes.html">NASA Goddard, “Ask an Astrophysicist: Black Holes”</Ext>: short answers from NASA scientists, including “Will black holes evaporate?” and how cold a black hole of the Sun’s mass is.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.km3net.org/km3net-detects-the-highest-energy-neutrino-ever-observed/">KM3NeT, “KM3NeT detects the highest energy neutrino ever observed”</Ext> (12 February 2025): the record-breaking neutrino that one idea ties to a dying tiny black hole.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Papers</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2503.19227">Klipfel and Kaiser, “Ultra-High-Energy Neutrinos from Primordial Black Holes”</Ext> (<em>Physical Review Letters</em>, 2025): the proposal that the KM3NeT neutrino came from a primordial black hole at the end of its life.
        </li>
        <li style={linkItem}>
          <Ext href="https://arxiv.org/abs/2505.24666">Airoldi and others, “Could a Primordial Black Hole Explosion Explain the KM3NeT Event?”</Ext> (accepted by <em>Physical Review Letters</em>): the later study that says gamma-ray data argue against it.
        </li>
        <li style={linkItem}>
          Hawking (1975), “Particle creation by black holes”, <em>Communications in Mathematical Physics</em> 43, 199: the full calculation. <em>Cited here, not read for this page.</em>
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.8125rem' }}>
        The papers are published research, not outputs of this page. They open in a new tab. No page here is a plain official page on the “information paradox”: none was found when this page was written, so none is linked.
      </p>
    </div>
  )
}

// The entries of the shared "Words and formulas" panel. The formulas (with their worked numbers) and the words that name an answer come only after the
// first run, because they give guesses away (CLAUDE.md §12).
export function hawkingRadiationWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const sunT = HAWKING_TEMPERATURE_OF_ONE_SUN_KELVIN
  const entries = [
    { term: 'Temperature', meaning: 'how hot something is.' },
    { term: 'Kelvin (K)', meaning: 'the scientist’s unit of temperature. A kelvin is the same size of step as a degree Celsius, but 0 K is the coldest there can be, −273 °C. Water freezes at 273 K and a room is about 293 K.' },
    { term: 'Cosmic microwave background', meaning: `a very faint glow of microwaves that fills all of space, left over from the early universe. Its temperature is ${BACKGROUND_KELVIN} K. From Cosmology 3.` },
    { term: 'Evaporate', meaning: 'to shrink away, bit by bit, until nothing is left, like a puddle drying up.' },
    { term: 'Sun (as a unit of mass)', meaning: `the mass of our Sun, about ${SUN_MASS_TEXT} kg. A black hole of “1 Sun” has that mass.` },
    { term: 'Horizon', meaning: 'the edge of a black hole. Inside it, gravity is so strong that nothing can get out, not even light. From Black Holes 1.' },
    { term: 'Power of ten', meaning: 'a short way to write very big or very small numbers. 10³ is 1,000 and 10⁻³ is 0.001.' },
    { term: 'Hawking radiation', meaning: 'the faint heat that quantum physics says a black hole gives off, as if it had a temperature. Worked out by Stephen Hawking in 1974. It has never been seen from a real black hole.' },
    { term: 'Laboratory analogue', meaning: 'a small experiment, for example with very cold atoms or light in an optical fibre, that follows the same kind of rules as the edge of a black hole without being one.' },
    { term: 'Primordial black hole', meaning: 'a black hole that may have formed in the first second after the universe began, before any star. NASA says none has yet been found.' },
    { term: 'Information paradox', meaning: 'a puzzle about what happens to everything that fell into a black hole if the black hole disappears. It is not solved, and this page does not try.' },
  ]
  if (afterRun) {
    entries.push(
      { term: 'Balance mass', meaning: `the mass of the one black hole whose temperature is exactly the background’s, about ${formatScientific(balanceMassKg(), 3)} kg, 0.6 of the Moon’s mass.` },
      { term: 'Greybody factor', meaning: 'a real black hole does not glow like a perfect glowing body, and a small hot one can give off other kinds of particle. The page leaves this out, so its times are good only to within a few times.' },
      { term: 'Backreaction', meaning: 'the glow acting back on whatever makes it. The July 2026 laboratory experiment looked for this.' },
      {
        term: 'Formula: the temperature',
        meaning: `T = ħc³ ÷ (8πGMk), which is ${formatScientific(sunT, 3)} K ÷ (the mass in Suns). Here ħ is the Planck constant divided by 2π, c the speed of light, G the gravitational constant and k Boltzmann’s constant. Worked for 10 Suns: ${formatScientific(sunT, 3)} ÷ 10 = ${formatScientific(sunT / 10, 3)} K. A standard result, given and not derived.`,
      },
      {
        term: 'Formula: the time to evaporate',
        meaning: `t = 5120πG²M³ ÷ (ħc⁴), which is ${formatScientific(LIFETIME_OF_ONE_SUN_YEARS, 3)} years × (the mass in Suns)³. Worked for 10 Suns: 10 × 10 × 10 = 1,000, so ${formatScientific(LIFETIME_OF_ONE_SUN_YEARS, 3)} × 1,000 = ${formatScientific(LIFETIME_OF_ONE_SUN_YEARS * 1000, 3)} years. Alone, with nothing falling in; good only to within a few times.`,
      },
      {
        term: 'Formula: the balance mass',
        meaning: `the mass whose temperature is ${BACKGROUND_KELVIN} K. Worked: ${formatScientific(sunT, 3)} K ÷ ${BACKGROUND_KELVIN} K = ${formatScientific(sunT / BACKGROUND_KELVIN, 3)}, so the balance mass is 1 Sun times ${formatScientific(sunT / BACKGROUND_KELVIN, 3)} = ${formatScientific(balanceMassKg(), 3)} kg.`,
      },
    )
  } else {
    entries.push({
      term: 'More words and the formulas',
      meaning: 'a few more words, and the formulas with their worked numbers, appear here after your first run. They are held back so that they do not give away your guesses.',
    })
  }
  return entries
}

// ---------------------------------------------------------------------------------------------------------------
// The notes under the three Part 1 questions. They give nothing away (CLAUDE.md §12): they say only where the guess will be drawn.
// ---------------------------------------------------------------------------------------------------------------
const notesBox = {
  margin: '0 0 0.75rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  borderLeft: '3px solid #f59e0b',
} as const

export function GuessNotes({ n }: { n: 1 | 2 | 3 }) {
  const body: Record<1 | 2 | 3, string> = {
    1: 'Your guess is drawn on the thermometer (Picture 1) in white, once the run has finished.',
    2: 'Your guess is drawn on the heat-in-and-heat-out picture (Picture 2) in white, once the run has finished.',
    3: 'Your guess is drawn on the time-to-evaporate graph (Picture 3), in its zoom panel and above it, in white, once the run has finished.',
  }
  return (
    <p style={notesBox} aria-label={`About question ${n}`}>
      {body[n]}
    </p>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Real-world blocks shown in Part 3, after the first run (they give the evaporation story, so they wait for the run).
// ---------------------------------------------------------------------------------------------------------------

// Figure 3: the only two black holes we have photographed. Credits as the project already uses them.
export function RealBlackHoles() {
  const m87 = HAWKING_PRESETS.find((x) => x.id === 'm87-star')!.massKg
  const sgr = HAWKING_PRESETS.find((x) => x.id === 'sgr-a-star')!.massKg
  return (
    <Figure
      caption={
        <>
          <strong>Figure 4. The only two black holes we have photographed.</strong> They are the two giants of this page: M87* (about {M87_BILLIONS} billion Suns, left) and Sagittarius A* (about {SGR_A_STAR_MILLIONS} million Suns, right), as seen by the Event Horizon Telescope. What you see is hot gas glowing around the black hole, not the black hole’s own faint glow. By this page’s formula, M87*’s glow would be at {formatScientific(hawkingTemperatureKelvin(m87), 2)} K, about {formatScientific(coldnessAgainstBackground(m87), 2)} times colder than the {BACKGROUND_KELVIN} K background, and Sagittarius A*’s at {formatScientific(hawkingTemperatureKelvin(sgr), 2)} K, about {formatScientific(coldnessAgainstBackground(sgr), 2)} times colder. The July 2026 <em>Nature</em> paper puts it this way: the chances of ever observing Hawking radiation in space “are astronomically small”. <span style={{ fontSize: '0.75rem' }}>Images: EHT Collaboration (CC BY 4.0), via ESO.</span>
        </>
      }
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <img src={M87_IMAGE} alt="The Event Horizon Telescope picture of the black hole M87*: a bright ring of glowing gas around a dark centre." style={{ ...imgStyle, maxWidth: '260px' }} />
        <img src={SGRA_IMAGE} alt="The Event Horizon Telescope picture of the black hole Sagittarius A*: a bright ring of glowing gas around a dark centre." style={{ ...imgStyle, maxWidth: '260px' }} />
      </div>
    </Figure>
  )
}

// The search for tiny black holes that may be ending now.
export function PrimordialSearch() {
  return (
    <div style={{ margin: '1.25rem 0', padding: '0.75rem 1rem', border: '1px solid var(--border-color, #ccc)', borderRadius: '8px', fontSize: '0.875rem' }}>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>The search for tiny black holes that may be ending now.</strong>
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        NASA says that black holes lighter than a mountain would evaporate more quickly than larger ones, and that scientists have not yet found proof that primordial black holes exist (NASA Science, “Black Hole Types”, updated 12 August 2026). Hawking’s 1974 letter said the same kind of thing: a black hole lighter than about 10¹⁵ grams, which is 10¹² kg, “would have evaporated by now”, and near the end of its life it would release a burst of energy.
      </p>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        In February 2025 the KM3NeT telescope in the Mediterranean Sea recorded the most energetic neutrino ever seen. One proposal, published in <em>Physical Review Letters</em>, is that a primordial black hole at the end of its life could have made it. A later study, accepted by the same journal, found that for this to be true the black hole would have had to be within the Solar System, and that gamma-ray telescopes should then have seen a huge signal, which they did not. The authors say the absence of that signal “strongly disfavors” this explanation. So it is a proposal, and so far it has not held up.
      </p>
    </div>
  )
}

