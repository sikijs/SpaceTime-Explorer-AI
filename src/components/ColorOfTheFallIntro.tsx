import type { ReactNode } from 'react'
import { LAMP_WAVELENGTH_NM, PART_ONE_START_IN_HORIZON_RADII, lightPeriodSeconds, workedDistance, workedSteps } from '../physics/colorOfTheFallExperiment'
import { paragraph } from './TidalEffectExperiment'

// Black Holes, Experiment 7 (audit update): the introduction, the links, the words box and the notes under the three questions
// (docs/audit/black-holes-and-strong-gravity/07-draft-wording.md, "all defaults" from the owner on 2026-11-18). The introduction keeps clear of
// the answers to the three questions (CLAUDE.md §12): it does not say that the light gets redder, how far it goes, that it leaves the visible
// range, or that the black hole's mass does not matter. Nothing in the drawing is white: white is reserved for the learner's guess marks.

const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#0b1020',
} as const

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

const ul = { margin: '0.25rem 0', paddingLeft: '1.25rem' } as const

// Three or four significant figures, with no trailing zeros.
const fmt = (x: number, digits: number) => String(Number(x.toPrecision(digits)))
const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
// A very small number as a power of ten ("1.8 × 10⁻¹⁵").
const sci = (x: number, digits: number) => {
  const exponent = Math.floor(Math.log10(x))
  const mantissa = Number((x / 10 ** exponent).toPrecision(digits))
  return `${mantissa} × 10${String(exponent).split('').map((ch) => SUPERSCRIPT[ch]).join('')}`
}

// Drawing 1: a lamp's crests. The black hole at the left, the traveler with a green lamp, a short row of crests close together just outside the lamp,
// and the observer far away. No numbers and no arrow showing any stretching.
function CrestsDrawing() {
  const crests = [176, 190, 204, 218, 232, 246]
  return (
    <svg
      viewBox="0 0 440 220"
      width="100%"
      style={{ ...imgStyle, maxWidth: '520px' }}
      role="img"
      aria-label="A black hole on the left. A traveler with a green lamp, falling toward it, a little to its right. A short row of green crests, close together, just outside the lamp and pointing away from the black hole. A bracket marks the gap between two neighbouring crests as the wavelength. An observer far to the right, at rest."
    >
      <circle cx={44} cy={130} r={30} fill="#9d174d" stroke="#fb7185" strokeWidth={2} />
      <text x={44} y={134} fill="#e2e8f0" fontSize="11" textAnchor="middle">
        black hole
      </text>
      <text x={14} y={186} fill="#fb7185" fontSize="10" textAnchor="start">
        rose ring: the horizon
      </text>
      <circle cx={130} cy={130} r={8} fill="#22d3ee" />
      <circle cx={141} cy={130} r={4} fill="#4ade80" />
      <text x={130} y={158} fill="#22d3ee" fontSize="11" textAnchor="middle">
        the traveler
      </text>
      <text x={130} y={172} fill="#22d3ee" fontSize="10" textAnchor="middle">
        falling, with a lamp
      </text>
      {crests.map((x) => (
        <line key={x} x1={x} y1={110} x2={x} y2={150} stroke="#4ade80" strokeWidth={3} />
      ))}
      <text x={211} y={102} fill="#4ade80" fontSize="11" textAnchor="middle">
        crests of the lamp’s light
      </text>
      <path d="M204,160 L204,168 L218,168 L218,160" stroke="#4ade80" strokeWidth={1.5} fill="none" />
      <text x={211} y={184} fill="#4ade80" fontSize="10" textAnchor="middle">
        wavelength
      </text>
      <line x1={262} y1={130} x2={338} y2={130} stroke="#64748b" strokeDasharray="4 4" />
      <polygon points="338,125 348,130 338,135" fill="#64748b" />
      <text x={300} y={122} fill="#94a3b8" fontSize="10" textAnchor="middle">
        light travels outward
      </text>
      <circle cx={392} cy={130} r={7} fill="#fb923c" />
      <text x={392} y={158} fill="#fb923c" fontSize="11" textAnchor="middle">
        the observer
      </text>
      <text x={392} y={172} fill="#fb923c" fontSize="10" textAnchor="middle">
        at rest, far away
      </text>
    </svg>
  )
}

export function ColorOfTheFallIntro() {
  const period = lightPeriodSeconds(LAMP_WAVELENGTH_NM)
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>The question.</strong> In Black Holes 6 a traveler fell toward a black hole, sending flashes of light at equal steps of their own watch, and a far-away observer received them. We followed the timing of the flashes. We did not ask about the light itself. This time the traveler carries a lamp that
        shines a steady green light straight outward. What color does the observer receive, as the traveler falls?
      </p>
      <p style={paragraph}>
        <strong>Why even ask this.</strong> Picture yourself as the observer, far from the black hole, watching a friend fall in. Your friend carries a green lamp. In everyday life, the color of a lamp belongs to the lamp: a green lamp looks green whether it is near or far, and whether you are walking toward it or away from
        it. So ask yourself: as your friend falls, does their lamp keep looking green to you? And if it changes, how far does it go?
      </p>
      <p style={paragraph}>
        <strong>A wave is a train of crests.</strong> Light is a wave, a long row of crests, like the ripples from a stone dropped in a pond. The <strong>wavelength</strong> is the distance from one crest to the next. A lamp makes one crest after another, at equal steps of its own time. For the green lamp in this experiment
        that step is about {sci(period, 2)} seconds, the time light takes to travel one wavelength. Drawing 1 shows the lamp’s crests close together.
      </p>
      <Figure
        caption={
          <>
            <strong>A lamp’s crests.</strong> A schematic drawn for this page, not to scale, with no numbers. It shows the black hole, the traveler with a green lamp, a short row of green crests just outside the lamp, and the far-away observer.
            <ul style={ul}>
              <li>
                <strong>The black hole</strong> is the dark pink disc, and the <strong>rose ring</strong> around it is its horizon. <strong>The traveler</strong> is the cyan dot, falling toward it, and the small green dot beside them is the lamp.
              </li>
              <li>
                <strong>The crests</strong> are the short green lines in a row. <strong>The bracket</strong> under two neighbouring crests marks the wavelength. <strong>The dashed grey arrow</strong> shows the way the light travels, outward.
              </li>
              <li>
                <strong>The observer</strong> is the orange dot. They are at rest, far away.
              </li>
            </ul>
            <strong>What to look for.</strong>
            <ul style={ul}>
              <li>
                <strong>Look at</strong> the gap between two neighbouring crests, under the bracket. <strong>What it means:</strong> that gap is the wavelength of the lamp’s light, 550 nm for this lamp. <strong>Why it matters:</strong> a color is just a wavelength, so if the observer finds a different wavelength they
                see a different color.
              </li>
            </ul>
          </>
        }
      >
        <CrestsDrawing />
      </Figure>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What happens.</strong> Here is the whole experiment, step by step.
      </p>
      <ol style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li>
          The traveler is released from rest and falls straight in, with the lamp on. Part 1 fixes the black hole (the 10-Sun one from Black Holes 1) and the release distance ({PART_ONE_START_IN_HORIZON_RADII} horizon radii). In Part 2 you choose your own.
        </li>
        <li>
          The <strong>observer</strong>, at rest far from the black hole, receives the lamp’s light and measures its wavelength.
        </li>
        <li>
          You press Run. The first picture shows the lamp’s own color and the color as received, on a strip of all the kinds of light. The second picture is a graph of the color as received against how far the traveler still is from the horizon.
        </li>
        <li>The experiment ends close to the horizon. It does not show anything inside.</li>
      </ol>
      <p style={paragraph}>
        <strong>Some words we will use.</strong> A <strong>wavelength</strong> is the distance from one crest of a wave to the next. We measure it in <strong>nanometers</strong> (nm): one nanometer is a billionth of a meter, so a sheet of paper is about 100,000 nm thick. The light our eyes can see, called{' '}
        <strong>visible light</strong>, has wavelengths of about 380 nm (violet) to about 750 nm (red), and green is in the middle, at about 550 nm. (NASA’s page says the eye typically detects 380 to 700 nm. The red edge is a convention, and this page uses 750.) Longer than red there is light we cannot see:{' '}
        <strong>infrared</strong>, the kind a heat lamp gives out; then <strong>microwaves</strong>, like those in a microwave oven; then <strong>radio waves</strong>, the longest. The edges between these kinds are conventions, not sharp lines. The wavelength of the lamp’s light on the traveler is called{' '}
        <strong>as emitted</strong>, and the wavelength the observer measures is called <strong>as received</strong>. Three words come from Black Holes 6: the <strong>horizon</strong>, the one-way boundary of a black hole; the <strong>horizon radius</strong>, the distance from the black hole’s center to its horizon;
        and the <strong>stretch factor</strong>, how many times as long the gap between two flashes is when they are received, compared with when they were sent. We also use the <strong>gap above the horizon</strong>: how far the traveler is above the horizon, measured in horizon radii (their distance from the center,
        minus 1). This is a distance, not the time between two flashes. The entries are in the “Words and formulas” box below.
      </p>
      <p style={paragraph}>
        <strong>What this builds on.</strong> Black Holes 6 followed flashes of light from the falling traveler and found how their spacing changes. Black Holes 2 showed a clock near a black hole ticking differently from one far away. Gravitational Waves 5 dealt with light from a source that is moving away from you.
        Here we follow the lamp’s light itself.
      </p>
      <p style={paragraph}>
        <strong>Your job.</strong> First, make three guesses and press Run in Part 1. Then, in Part 2, choose a black hole and a release distance of your own, run it, try other black holes and release distances too, and compare.
      </p>
      <p style={paragraph}>
        <strong>What you will do.</strong> The pictures and tables you see here come from the physics, and they never change with your guesses. Your guesses are drawn on the pictures in white and shown again beside the results. The settings in Part 2 do change which drawings you see. If you want to guess again, press Start over.
      </p>
      <p style={paragraph}>
        <strong>What to look for.</strong> Where the received color is at the start, what kind of light it is as the traveler falls, and what it does near the end.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
        <li>
          <strong>This is a thought experiment about a small lamp</strong> that shines light of one color, 550 nm, straight outward from a traveler who falls straight in from rest. The lamp’s own gravity does not matter.
        </li>
        <li>
          <strong>The observer is at rest, very far away.</strong>
        </li>
        <li>
          <strong>The equations are given, not derived.</strong> They are the standard ones for a black hole that does not spin and has no electric charge. Real black holes usually spin, which changes the details.
        </li>
        <li>
          <strong>Only the wavelength is modeled.</strong> How bright the light is, what a camera or telescope would show, and whether a real detector could pick up light of these wavelengths are not.
        </li>
        <li>
          <strong>The experiment stops close to the horizon,</strong> at 0.0001 horizon radii above it. Nothing inside the horizon is modeled.
        </li>
        <li>Real pictures and measurements of light from near black holes are shown after your first Run.</li>
      </ul>
    </div>
  )
}

const linkItem = { marginBottom: '0.4rem' } as const

export function ColorOfTheFallLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/ems/01_intro/">NASA Science, “Electromagnetic Spectrum: Introduction”</Ext> (updated 17 September 2025): what light is and how the whole spectrum fits together.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/ems/02_anatomy/">NASA Science, “Anatomy of an Electromagnetic Wave”</Ext> (updated 3 August 2023): crests, wavelength and frequency.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/ems/09_visiblelight/">NASA Science, “Visible Light”</Ext> (updated 4 August 2023): what the eye can see, in nanometers.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/ems/07_infraredwaves/">NASA Science, “Infrared Waves”</Ext> (updated 3 August 2023): the light a heat lamp or a TV remote gives out.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/ems/06_microwaves/">NASA Science, “Microwaves”</Ext> (updated 3 August 2023): what microwaves are and what they are used for.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/ems/05_radiowaves/">NASA Science, “Radio Waves”</Ext> (updated 3 August 2023): the longest waves of the spectrum.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>All links open in a new tab. After your first run, Part 3 adds more pages. They are held back so they do not give away your guesses.</p>
    </div>
  )
}

// The pages added after the first run (they say what a far-away watcher sees, or are real observations of light stretched near a black hole).
export function ColorOfTheFallHeldBackLinks() {
  return (
    <div style={{ margin: '1.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Check it against NASA and ESO</h4>
      <ul style={{ marginTop: 0, marginBottom: '0.5rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/educators/blackholes/imagine/page8.html">NASA Goddard, “The Anatomy of Black Holes”, page 8</Ext> (page last updated 7 May 2015): what a far-away watcher sees of a falling explorer, including how the explorer looks.
        </li>
        <li style={linkItem}>
          <Ext href="https://www.eso.org/public/news/eso1825/">ESO, “First Successful Test of Einstein’s General Relativity Near Supermassive Black Hole”</Ext> (26 July 2018) and its paper,{' '}
          <Ext href="https://arxiv.org/abs/1807.09409">GRAVITY Collaboration, “Detection of the gravitational redshift in the orbit of the star S2 near the Galactic centre massive black hole”</Ext> (arXiv, 25 July 2018): the light of a real star near Sagittarius A*, stretched to longer wavelengths.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>All links open in a new tab.</p>
    </div>
  )
}

// The entries of the shared "Words and formulas" panel. The formula and the word "redshift" come only after the first run, because they give
// guess 1 away (CLAUDE.md §12).
export function colorOfTheFallWordsEntries(afterRun: boolean): { term: string; meaning: string }[] {
  const period = lightPeriodSeconds(LAMP_WAVELENGTH_NM)
  const entries = [
    { term: 'Light as a wave; crest', meaning: 'light travels as a wave, a long row of crests, like ripples on a pond. A crest is the top of one ripple.' },
    { term: 'Wavelength', meaning: 'the distance from one crest of a wave to the next. For the green lamp it is 550 nm. A color of light is just a wavelength.' },
    { term: 'Nanometer (nm)', meaning: 'a billionth of a meter. A sheet of paper is about 100,000 nm thick.' },
    {
      term: 'Visible light',
      meaning: 'the light our eyes can see: about 380 nm (violet) to about 750 nm (red), with green in the middle at about 550 nm. NASA’s page says the eye typically detects 380 to 700 nm. The red edge is a convention, and this page uses 750.',
    },
    { term: 'Infrared', meaning: 'light longer than red that we cannot see, from about 750 nm to 1 mm. A heat lamp and a TV remote give it out (NASA says a remote uses about 940 nm).' },
    { term: 'Microwave', meaning: 'longer than infrared, from 1 mm to 1 m, like the waves in a microwave oven.' },
    { term: 'Radio waves', meaning: 'the longest waves, 1 m and longer. NASA says they range from the length of a football to larger than our planet.' },
    { term: 'As emitted; as received', meaning: 'the wavelength of the lamp’s light on the traveler (as emitted, 550 nm), and the wavelength the far-away observer measures (as received).' },
    { term: 'Horizon, horizon radius', meaning: 'the one-way edge of a black hole, and its distance from the center (written r_s). From Black Holes 1.' },
    { term: 'Gap above the horizon', meaning: 'how far the traveler is above the horizon, in horizon radii: their distance from the center minus 1. A distance, not a time.' },
    {
      term: 'Stretch factor',
      meaning: 'from Black Holes 6: the gap between two arriving flashes (as received) divided by the gap between them as sent. Flashes sent 5 seconds apart and received 5 seconds apart: 5 ÷ 5 = 1. Received 10 seconds apart: 10 ÷ 5 = 2.',
    },
    {
      term: 'The period of light',
      meaning: `the time from one crest to the next: the wavelength divided by the speed of light. For ${LAMP_WAVELENGTH_NM} nm: ${LAMP_WAVELENGTH_NM} nm ÷ 300,000 km/s = ${sci(period, 2)} seconds.`,
    },
  ]
  if (afterRun) {
    const d = workedDistance(PART_ONE_START_IN_HORIZON_RADII)
    const s = workedSteps(PART_ONE_START_IN_HORIZON_RADII)
    entries.push(
      {
        term: 'Formula: the received wavelength',
        meaning: `received wavelength = 550 nm × stretch factor, and the stretch factor = gravity part × motion part (as in Black Holes 6). Worked for a release at ${PART_ONE_START_IN_HORIZON_RADII} horizon radii, at ${d} horizon radii from the center: gravity part ${fmt(s.gravity, 4)}; motion part ${fmt(s.motion, 4)}; stretch factor ${fmt(s.gravity, 4)} × ${fmt(s.motion, 4)} = ${fmt(s.stretch, 4)}; so 550 nm × ${fmt(s.stretch, 4)} = ${fmt(s.wavelengthNm, 4)} nm.`,
      },
      {
        term: 'Redshift',
        meaning: 'a longer wavelength of visible light is redder, so a longer wavelength is called a “shift toward red”. The name is used even for light we can no longer see.',
      },
    )
  } else {
    entries.push({
      term: 'More words',
      meaning: 'the formula for the received wavelength, and one more word, appear here after your first run. They are held back so that they do not give away your guesses.',
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
    1: 'Your guess is drawn on the color strip (Picture 1) and at the end of the curve on Picture 2, in white, once they are drawn.',
    2: 'Your guess is drawn on Picture 2 in white, at the 750 nm line.',
    3: 'Your guess is drawn in the small panel on Picture 2, in white.',
  }
  return (
    <p style={notesBox} aria-label={`About question ${n}`}>
      {body[n]}
    </p>
  )
}
