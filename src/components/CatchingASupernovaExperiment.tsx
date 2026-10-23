import type { ReactNode } from 'react'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 13 (docs/experiments/frontier-and-beyond/13-catching-a-supernova.md).
// Step 2 (the interface skeleton) builds the page's skeleton: the status line, the introduction with its new-word list, its assumptions and its "Want to know more?"
// links, one illustration (what happens in a core-collapse supernova) with its guide, and the collapsed "Words and formulas" panel. The two predictions, the run, the three
// pictures, the controls, the results and the tutor are later steps. All wording is draft for the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard
// of §29. The introduction does not give the distance to M101 or the age of the light, the share of the energy that is light, the star's mass or the time before the
// explosion at which the gas was shed (those are what the predictions and the run show, §12). The interface only displays numbers from src/physics (CLAUDE.md §9); this
// step shows none of the results.

const VIEW_WIDTH = 560
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const ENVELOPE_COLOR = '#fb923c' // orange: the star's outer layer of hydrogen gas
const LAYER_COLOR = '#fcd34d' // yellow: the inner layers
const CORE_COLOR = '#f87171' // red: the core
const FALL_COLOR = '#38bdf8' // sky blue: material falling inward
const BLAST_COLOR = '#c084fc' // purple: material blown outward
const REMNANT_COLOR = '#e2e8f0' // pale: the neutron star

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <>
      {lines.map((line, i) => (
        <text key={i} x={x} y={y + i * (size + 2)} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor} stroke={fill === '#0b1020' ? 'none' : '#0b1020'} strokeWidth={3} paintOrder="stroke">
          {line}
        </text>
      ))}
    </>
  )
}

// A short arrow from (x1, y1) to (x2, y2), with a small head at the end.
function Arrow({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const head = 6
  const a1 = angle + Math.PI - 0.45
  const a2 = angle + Math.PI + 0.45
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} />
      <path d={`M ${x2} ${y2} L ${x2 + head * Math.cos(a1)} ${y2 + head * Math.sin(a1)} L ${x2 + head * Math.cos(a2)} ${y2 + head * Math.sin(a2)} Z`} fill={color} />
    </g>
  )
}

// ---- Illustration: what happens in a core-collapse supernova (not to scale; it shows the idea, not SN 2023ixf) ----
function CollapseDrawing() {
  const height = 330
  const cy = 150
  const centres = [95, 280, 465] // the three panels
  const angles = [0, 45, 90, 135, 180, 225, 270, 315].map((d) => (d * Math.PI) / 180)
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label="Illustration, not to scale, in three panels, left to right. Panel 1, before: a large star drawn as nested circles, an outer orange layer of hydrogen gas, yellow inner layers and a red core at the centre. Panel 2, the core collapses: the same star, with the core shrunk to a small red ball and blue arrows pointing inward to it. Panel 3, the explosion: a tiny pale dot at the centre, the neutron star, with purple arrows pointing outward and a dashed purple circle for the outer layers being blown away"
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Illustration: what happens in a core-collapse supernova
      </text>

      {/* Panel 1: before. */}
      <SvgLines x={centres[0]} y={48} lines={['1. Before']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={centres[0]} cy={cy} r={72} fill={ENVELOPE_COLOR} fillOpacity={0.75} stroke={ENVELOPE_COLOR} strokeWidth={2} />
      <circle cx={centres[0]} cy={cy} r={46} fill={LAYER_COLOR} fillOpacity={0.85} stroke={LAYER_COLOR} strokeWidth={2} />
      <circle cx={centres[0]} cy={cy} r={22} fill={CORE_COLOR} stroke={CORE_COLOR} strokeWidth={2} />
      <SvgLines x={centres[0]} y={cy + 4} lines={['core']} fill="#0b1020" bold anchor="middle" />
      <SvgLines x={centres[0]} y={cy - 30} lines={['inner layers']} fill="#0b1020" bold anchor="middle" />
      <SvgLines x={centres[0]} y={cy - 56} lines={['outer layer']} fill="#0b1020" bold anchor="middle" />
      <SvgLines x={centres[0]} y={cy + 100} lines={['a red supergiant:', 'a very large, cool star']} fill={MUTED_COLOR} anchor="middle" />

      {/* Panel 2: the core collapses. */}
      <SvgLines x={centres[1]} y={48} lines={['2. The core collapses']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={centres[1]} cy={cy} r={72} fill={ENVELOPE_COLOR} fillOpacity={0.35} stroke={ENVELOPE_COLOR} strokeWidth={2} />
      <circle cx={centres[1]} cy={cy} r={46} fill={LAYER_COLOR} fillOpacity={0.35} stroke={LAYER_COLOR} strokeWidth={2} />
      <circle cx={centres[1]} cy={cy} r={8} fill={CORE_COLOR} stroke={CORE_COLOR} strokeWidth={2} />
      {angles.map((a, i) => (
        <Arrow key={i} x1={centres[1] + 42 * Math.cos(a)} y1={cy + 42 * Math.sin(a)} x2={centres[1] + 18 * Math.cos(a)} y2={cy + 18 * Math.sin(a)} color={FALL_COLOR} />
      ))}
      <SvgLines x={centres[1]} y={cy + 100} lines={['the core falls inward on itself,', 'in a fraction of a second']} fill={FALL_COLOR} bold anchor="middle" />

      {/* Panel 3: the explosion. */}
      <SvgLines x={centres[2]} y={48} lines={['3. Rebound and explosion']} fill={TEXT_COLOR} bold anchor="middle" size={12} />
      <circle cx={centres[2]} cy={cy} r={72} fill="none" stroke={BLAST_COLOR} strokeWidth={2} strokeDasharray="5 4" />
      <circle cx={centres[2]} cy={cy} r={4} fill={REMNANT_COLOR} />
      {angles.map((a, i) => (
        <Arrow key={i} x1={centres[2] + 16 * Math.cos(a)} y1={cy + 16 * Math.sin(a)} x2={centres[2] + 48 * Math.cos(a)} y2={cy + 48 * Math.sin(a)} color={BLAST_COLOR} />
      ))}
      <SvgLines x={centres[2] + 10} y={cy + 4} lines={['neutron', 'star']} fill={REMNANT_COLOR} bold />
      <SvgLines x={centres[2]} y={cy + 100} lines={['the outer layers are blown outward;', 'a neutron star is left behind']} fill={BLAST_COLOR} bold anchor="middle" />

      <SvgLines x={20} y={height - 8} lines={['Not to scale: the neutron star is millions of times smaller than the star it came from.']} fill={MUTED_COLOR} />
    </svg>
  )
}

const lookForDrawing: LookFor[] = [
  {
    look: 'panel 1: the nested circles, with the red core at the centre and the orange outer layer round the outside.',
    means: 'a red supergiant is built in layers, like an onion: a very hot, dense core in the middle, and a huge, thin, cool layer of gas round the outside.',
    matters: 'the explosion starts in the core, deep inside, but what we see from far away is the outer layer and what happens to it. That is why the star has to be understood in layers.',
  },
  {
    look: 'panel 2: the small red ball and the blue arrows pointing inward.',
    means: 'the core can no longer hold itself up, so it falls in on itself. It happens in a fraction of a second. If the collapsing core holds, it ends as a neutron star about 12 kilometres in radius (panel 3).',
    matters: 'this fall is where the energy of the whole explosion comes from, so everything the experiment asks about starts here.',
  },
  {
    look: 'panel 3: the tiny pale dot, the purple arrows pointing outward and the dashed purple circle.',
    means: 'the falling material is stopped and springs back, and drives a shock outward through the star. The outer layers are blown away (the dashed circle is where they are heading). What is left at the centre is a neutron star.',
    matters: 'the blown-away outer layers are what we photograph as the supernova. How the energy is shared between the blast, the light and everything else is what you will be asked about.',
  },
]

const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Supernova', meaning: 'the explosion of a star at the end of its life, so bright that it can be seen from millions of light-years away for weeks or months. This experiment is about one kind, a core-collapse supernova, in which a very heavy star’s core collapses. (NASA: “The result is a huge explosion called a supernova.”)' },
  { term: 'Core collapse', meaning: 'what happens when the core of a very heavy star can no longer hold itself up against its own weight. It falls in on itself in a fraction of a second. NASA says: “The core collapses and then rebounds back to its original size, creating a shock wave that travels through the star’s outer layers.”' },
  { term: 'Neutron star', meaning: 'the very small, very dense ball that is left when a core collapses and holds. NASA: “The remnant core is a superdense neutron star.” It holds about 1.4 Suns’ worth of material in a ball only about 12 kilometres in radius, roughly the size of a city. Black Holes Experiment 9 explains what holds it up.' },
  { term: 'Rebound and shock wave', meaning: 'think of a ball dropped on a hard floor. It squashes, then springs back. In a supernova the falling material is stopped by the newly formed, extremely dense core and springs back, and the springing back sends a sudden sweep of pressure, a shock wave, outward through the star, like a wave through a crowd that all jump at once.' },
  { term: 'Neutrino', meaning: 'a tiny particle with almost no mass and no electric charge that hardly ever interacts with anything. CERN: “It is neutrinos’ weak interaction with matter that makes them almost impossible to detect”, and they can pass through the whole Earth. A supernova makes them in enormous numbers.' },
  { term: 'Red supergiant', meaning: 'a star much heavier than the Sun that has used up the hydrogen in its core and swollen to many times its old size, with a cooler, redder surface (Experiment 12). Betelgeuse is one, and so was the star in this experiment.' },
  { term: 'Progenitor', meaning: 'the star that existed before a supernova, “the one that came before”. Finding it in old pictures is rare, and it is what lets astronomers say what kind of star exploded.' },
  { term: 'Initial mass', meaning: 'how heavy a star was when it was born, in solar masses (one solar mass is the Sun’s mass). A star loses material through its life, so its mass just before the explosion is less than its initial mass. “17 solar masses” means 17 times as heavy as the Sun.' },
  { term: 'Circumstellar gas', meaning: 'gas that lies round a star, thrown off by the star itself. A red supergiant keeps shedding its outer layer into space, a bit like a pot boiling over, and the gas drifts away from the star. “Circum-” means “round”.' },
  { term: 'Spectrum', meaning: 'light spread out into its colours, like a rainbow. Each kind of gas leaves its own pattern of bright or dark lines in a spectrum, so a spectrum tells astronomers what a gas is made of, and (from how the lines are shifted) how it is moving.' },
  { term: 'Flash spectroscopy', meaning: 'taking a spectrum of a supernova in its first hours and days, before the blast has swept away the gas that lay close to the star. The explosion’s first light shines through and lights that gas up, so the lines of the gas show for a few days: a “flash” that tells astronomers what the star was shedding just before it exploded.' },
  { term: 'Light-year', meaning: 'the distance light travels in a year, about 9.5 million million kilometres. NASA says that because light takes time to cross space, looking at a faraway object is looking at it as it was in the past: we see the Sun as it was 8.3 minutes ago.' },
  { term: 'Astronomical unit (AU)', meaning: 'the average distance from the Earth to the Sun, about 150 million kilometres. Neptune, the farthest planet, is about 30 AU from the Sun.' },
  { term: 'Parsec and megaparsec', meaning: 'a parsec is a unit of distance used by astronomers, about 3.26 light-years. A megaparsec (Mpc) is a million parsecs, about 3.26 million light-years.' },
  { term: 'Joule and erg', meaning: 'two units of energy. One joule is about the energy it takes to lift an apple (about 100 grams) 1 metre. An erg is one ten-millionth of a joule, a unit astronomers often use because the energies in space are so huge. The numbers in this experiment come in both, and the experiment shows how to change from one to the other.' },
]

export function CatchingASupernovaExperiment() {
  return (
    <div>
      <h2>Experiment 13 — Catching a Supernova in the Act: What Exploded, and Where Did the Energy Go? (SN 2023ixf)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): in May 2023 a red supergiant exploded in a galaxy called M101, and astronomers had photographed the star before it blew
            up. How heavy it was is still debated. What the evidence adds up to is shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={paragraph}>
            <strong>The question.</strong> When a very large star dies, it explodes, and for weeks the explosion can be seen from millions of light-years away. That sounds like the
            biggest event imaginable, but how much of its energy do we actually see? And what can we learn about the star itself, from pictures taken before it exploded and
            from the first light afterwards? This experiment follows one real explosion, a supernova called SN 2023ixf.
          </p>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Experiment 12 you met Betelgeuse, a red supergiant near the end of its life, and learned that a very large, aging star
            swells and cools. In Black Holes Experiment 9 you saw what can hold up a dead star’s core, and in Spacetime Geometry Experiment 4 you saw that what we see is the
            past, because light takes time to arrive. All three come back here.
          </p>

          <p style={paragraph}>
            <strong>What a supernova is.</strong> A star shines because its core is making energy, and the energy pushing outward holds the star up against its own weight.
            In a very heavy star, a time comes when the core can no longer do that. With nothing holding it up, the core falls in on itself, in a fraction of a second. NASA
            describes what happens next: the core collapses and then rebounds, “creating a shock wave that travels through the star’s outer layers”, and the result is “a huge
            explosion called a supernova”. A good picture is a ball dropped on a hard floor: it squashes, then springs back, and the springing back is what drives the
            outer layers away. At the centre, “the remnant core is a superdense neutron star”: about 1.4 Suns’ worth of material squeezed into a ball only about 12
            kilometres in radius, roughly the size of a city. The illustration below shows the three steps.
          </p>

          <p style={paragraph}>
            <strong>The star we can see before it explodes.</strong> A supernova is a rare event in any one galaxy, and almost always the star that exploded is unknown,
            because nobody was looking at that star before. SN 2023ixf was different. M101, a spiral galaxy often called the Pinwheel Galaxy, had been photographed many times,
            including by the Hubble Space Telescope and the Spitzer Space Telescope. After the explosion, astronomers looked back through the old pictures, found a star
            at the spot, and could say what it had been: a cool, dusty red supergiant, the same kind of star as Betelgeuse. How heavy it was is much harder to say, and
            different teams, using different methods, have found different answers.
          </p>

          <p style={paragraph}>
            <strong>What was found.</strong> A Japanese amateur astronomer, Kōichi Itagaki, found the supernova on 19 May 2023. Astronomers all over the world pointed
            their telescopes at it. It was the closest supernova in about ten years. In the first days after the explosion, spectra of its light showed that
            the star was surrounded by dense gas that it had thrown off before it exploded, so the star had been shedding its outer layer faster than usual, in the years
            just before the end.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <CollapseDrawing />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            <p style={paragraph}>
              <strong>How to read this illustration.</strong> It shows the idea of a core-collapse supernova in three steps, from left to right. It is a sketch of any star of
              this kind, not of SN 2023ixf itself, and it is not to scale.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The three panels</strong> are three moments, in order: 1, before the explosion; 2, the core collapsing; 3, the explosion.
              </li>
              <li>
                <strong>The orange outer circle</strong> in panel 1 is the star’s huge outer layer of gas. <strong>The yellow circle</strong> is its inner layers.{' '}
                <strong>The red ball</strong> at the centre is the core.
              </li>
              <li>
                <strong>The blue arrows</strong> in panel 2 show material falling inward. In panel 2 the outer layers are drawn faint, because they have not yet moved.
                The core is now much smaller.
              </li>
              <li>
                <strong>The purple arrows and the dashed purple circle</strong> in panel 3 show material being blown outward, and where the outer layers are heading.
              </li>
              <li>
                <strong>The tiny pale dot</strong> in panel 3 is the neutron star left behind. It is drawn far bigger than it should be, because to scale it would be too
                small to see.
              </li>
            </ul>
            <p style={paragraph}>
              <strong>A worked moment, with a ball.</strong> Drop a rubber ball from 1 metre onto a hard floor. It speeds up as it falls, hits the floor and is squashed
              flat for a moment, and then springs back up, almost as high as it started. Nobody pushed it up: the floor pushed back on it. In a supernova, the falling
              material meets the newly formed, extremely dense core, which acts like that floor, and springs back in the same way, with enough force to throw the whole star’s
              outer layers into space.
            </p>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>What to look for.</strong>
            </p>
            <LookForList items={lookForDrawing} />
          </div>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> That a red supergiant exploded in M101 in May 2023 is well established. How heavy the star was is
            still contested, and why it shed so much gas in its last years is still open. Where the energy of the explosion goes is shown after the run, with each number’s source.
          </p>
          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Supernova</strong>, <strong>core collapse</strong>, <strong>rebound</strong> and <strong>neutron star</strong>: the explosion, how it starts, and
                what it leaves behind.
              </li>
              <li>
                <strong>Neutrino</strong>: a tiny particle that hardly ever interacts with anything.
              </li>
              <li>
                <strong>Progenitor</strong> and <strong>initial mass</strong>: the star before the explosion, and how heavy it was when it was born.
              </li>
              <li>
                <strong>Circumstellar gas</strong>, <strong>spectrum</strong> and <strong>flash spectroscopy</strong>: gas round a star, light spread into its colours, and
                how a supernova’s first light reveals that gas.
              </li>
              <li>
                <strong>Light-year</strong>, <strong>astronomical unit</strong>, <strong>parsec</strong> and <strong>megaparsec</strong>: rulers for distances in space.
              </li>
              <li>
                <strong>Joule</strong> and <strong>erg</strong>: two units of energy.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions, press Run to watch the pictures build up one stage at a time, and then try other values for the
            collapsing core, the distance to M101 and the speed of the gas. Nothing here is graded. Your predictions are your own guesses, made before you see anything: they
            do not change the pictures or the tables, which come from the physics and the published numbers. They are shown again beside the results so you can compare. What
            does change the pictures and Table 4 is the “Now try it yourself” controls, which appear after the run finishes.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment is a simple model. It estimates the energy of the collapse with one simple formula (a neutron star’s own
            gravitational energy, which is only a rough estimate), uses published values for the energy of the blast and of the light, and takes the
            distance to M101 and the speed of the gas from the papers. It does not model the collapse, the neutrinos, the shock or the light of the explosion, and it does
            not say which estimate of the star’s mass is right.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The papers behind
            the numbers are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/stars/types/">NASA: Star types</ExternalLink>: how a very heavy star ends, with its core collapsing into a
              neutron star and exploding as a supernova.
            </li>
            <li>
              <ExternalLink href="https://spaceplace.nasa.gov/light-year/en/">NASA Space Place: What is a light-year?</ExternalLink> What a light-year is, and why looking far
              away is looking back in time.
            </li>
            <li>
              <ExternalLink href="https://scienceinschool.web.cern.ch/article/2011/neutrinos">CERN, Science in School: Neutrinos, an introduction</ExternalLink>: what
              neutrinos are, why they are so hard to detect, and how supernovae make them.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={REFERENCE_ENTRIES} />

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 0 }}>
          The two predictions, and the experiment itself, will appear here.
        </p>
      </div>
    </div>
  )
}
