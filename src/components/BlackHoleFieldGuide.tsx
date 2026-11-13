import { useState } from 'react'
import type { ReactNode } from 'react'
import { REAL_C, REAL_G, sizeLadder } from '../physics/blackHoleExperiment'
import type { SizeLadderEntry } from '../physics/blackHoleExperiment'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { M87_IMAGE, SGRA_IMAGE } from './BlackHoleIntro'
import { listStyle, paragraph } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 7: "The black hole field guide" (docs/audit/gravity-and-curved-spacetime/07-draft-wording.md,
// section 10, approved by the owner on 2026-11-13 for this experiment only). It opens after the tutor's explanation, so it gives away
// nothing before the learner has guessed. Every fact below was read on the page named beside it on 13 November 2026 (quotes are from
// those pages). The real sizes in the size ladder come from the physics module. Nothing here is computed by the probe model.

const BASE = import.meta.env.BASE_URL
export const NASA_VISUALIZATION_IMAGE = `${BASE}images/black-holes/nasa-black-hole-visualization-labeled.jpg`

const AMBER = '#f59e0b'
const PINK = '#f472b6'
const TEAL = '#2dd4bf'
const VIOLET = '#c4b5fd'
const YELLOW = '#fef08a'
const GUIDE = '#7c3aed'

// ---- the links (each page was fetched and read on 13 November 2026) ----
export interface GuideLinkData {
  id: string
  href: string
  label: string
  what: string
}

export const GUIDE_LINKS: Record<string, GuideLinkData> = {
  nasaBasics: {
    id: 'nasaBasics',
    href: 'https://science.nasa.gov/universe/black-holes/',
    label: 'NASA: "Black Hole Basics"',
    what: 'a basic overview of what black holes are and how they are found, a "Black Holes Are Not…" myth-buster list, and ten quick facts on the closest, farthest, biggest and smallest. (NASA; page last updated 12 August 2026.)',
  },
  nasaAnatomy: {
    id: 'nasaAnatomy',
    href: 'https://science.nasa.gov/universe/black-holes/anatomy/',
    label: 'NASA: "Black Hole Anatomy"',
    what: 'a tour of a black hole, part by part: the event horizon, the glowing disk, the shadow, the photon sphere, jets and the singularity. (NASA; page last updated 12 August 2026.)',
  },
  nasaTypes: {
    id: 'nasaTypes',
    href: 'https://science.nasa.gov/universe/black-holes/types/',
    label: 'NASA: "Black Hole Types"',
    what: 'the three size classes (stellar, intermediate and supermassive) and the theorised primordial kind, with how each forms and an example. (NASA; page last updated 12 August 2026.)',
  },
  nasaQA: {
    id: 'nasaQA',
    href: 'https://science.nasa.gov/solar-system/10-questions-you-might-have-about-black-holes/',
    label: 'NASA: "10 Questions You Might Have About Black Holes"',
    what: 'ten plain questions and answers: how black holes are seen, how long they take to form, what if the Sun became one, and whether they can shrink. (NASA Science Editorial Team; 23 September 2019, last updated 6 November 2024.)',
  },
  nasaImagine: {
    id: 'nasaImagine',
    href: 'https://imagine.gsfc.nasa.gov/science/objects/black_holes1.html',
    label: 'NASA Goddard, Imagine the Universe: "Black Holes"',
    what: 'an escape-speed explanation of black holes, with the sizes the Sun and the Earth would need to be squeezed to. (NASA Goddard; updated November 2016, page last updated 23 September 2021.)',
  },
  esoM87: {
    id: 'esoM87',
    href: 'https://www.eso.org/public/news/eso1907/',
    label: 'ESO: "Astronomers Capture First Image of a Black Hole"',
    what: 'the press release for the first picture of a black hole, M87*, with how the Event Horizon Telescope was built from eight radio telescopes. (European Southern Observatory, 10 April 2019.)',
  },
  esoSgrA: {
    id: 'esoSgrA',
    href: 'https://www.eso.org/public/news/eso2208/',
    label: 'ESO: "Astronomers reveal first image of the black hole at the heart of our galaxy"',
    what: 'the press release for the first picture of Sagittarius A*, and why its gas made it harder to photograph than M87*. (European Southern Observatory, 12 May 2022.)',
  },
  esoPol: {
    id: 'esoPol',
    href: 'https://www.eso.org/public/news/eso2406/',
    label: 'ESO: "Astronomers unveil strong magnetic fields spiraling at the edge of Milky Way\'s central black hole"',
    what: 'the first picture of Sagittarius A* in polarised light, which shows its magnetic fields, and how it compares with M87*. (European Southern Observatory, 27 March 2024.)',
  },
  asiaa: {
    id: 'asiaa',
    href: 'https://press.asiaa.sinica.edu.tw/ASIAA_TAIWAN_News/250916',
    label: 'ASIAA (Taiwan): "New EHT Images Reveal Unexpected Polarization Flips at M87*"',
    what: 'a short news item about new Event Horizon Telescope pictures of M87* from 2017, 2018 and 2021. It is a news item from an institute that is a member of the collaboration, not the collaboration\'s own page. (16 September 2025.)',
  },
  arxM87: {
    id: 'arxM87',
    href: 'https://arxiv.org/abs/1906.11238',
    label: 'EHT Collaboration (2019): "First M87 Event Horizon Telescope Results. I. The Shadow of the Supermassive Black Hole"',
    what: 'the original research paper (its abstract is free to read), with the ring size and the mass of M87*. (The Astrophysical Journal Letters, 875, L1, 10 April 2019.) It is a technical paper.',
  },
  arxSgrA1: {
    id: 'arxSgrA1',
    href: 'https://arxiv.org/abs/2311.08680',
    label: 'EHT Collaboration (2022): "First Sagittarius A* Event Horizon Telescope Results. I. The Shadow of the Supermassive Black Hole in the Center of the Milky Way"',
    what: 'the original research paper (abstract free to read), with the ring size and the mass of Sagittarius A*. (The Astrophysical Journal Letters, 930, L12, 12 May 2022.) It is a technical paper.',
  },
  arxSgrA3: {
    id: 'arxSgrA3',
    href: 'https://arxiv.org/abs/2311.09479',
    label: 'EHT Collaboration (2022): "First Sagittarius A* Event Horizon Telescope Results. III: Imaging of the Galactic Center Supermassive Black Hole"',
    what: 'the original paper on how the 2017 radio data were turned into a picture of Sagittarius A*. (The Astrophysical Journal Letters, 930, L14, 12 May 2022.) It is a technical paper.',
  },
  ligo150914: {
    id: 'ligo150914',
    href: 'https://www.ligo.caltech.edu/page/press-release-gw150914',
    label: 'LIGO Lab, Caltech: the GW150914 press release',
    what: 'the announcement of the first gravitational waves ever detected, from two colliding black holes, with how LIGO works and who built it.',
  },
  ligo250114: {
    id: 'ligo250114',
    href: 'https://www.ligo.caltech.edu/news/ligo20250910',
    label: 'LIGO Lab, Caltech: "Ten Years Later, LIGO is a Black-Hole Hunting Machine"',
    what: 'a ten-year report, with the clearest signal yet (GW250114) and the best test so far of Stephen Hawking\'s area theorem. (10 September 2025.)',
  },
  ligoGWTC4: {
    id: 'ligoGWTC4',
    href: 'https://www.ligo.org/science-summaries/O4a_catalog_omnibus/',
    label: 'LIGO Scientific Collaboration: "GWTC-4.0" summary',
    what: 'a plain summary of the catalog papers: the 128 new signals, and what the larger catalog shows.',
  },
  ligoO4: {
    id: 'ligoO4',
    href: 'https://www.ligo.caltech.edu/news/ligo20251118',
    label: 'LIGO Lab, Caltech: "LIGO – Virgo – KAGRA Complete Fourth Observing Run"',
    what: 'the announcement that the fourth observing run is over, with how many candidate signals it found. (18 November 2025.)',
  },
  esaGaia: {
    id: 'esaGaia',
    href: 'https://www.esa.int/Science_Exploration/Space_Science/Gaia/Gaia_discovers_a_new_family_of_black_holes',
    label: 'ESA: "Gaia discovers a new family of black holes"',
    what: 'how Gaia found two nearby black holes, Gaia BH1 and BH2, from the wobble of the stars that orbit them. (European Space Agency, 30 March 2023; marked as archive content.)',
  },
  esoGaia3: {
    id: 'esoGaia3',
    href: 'https://eso.org/public/news/eso2408/',
    label: 'ESO: "Most massive stellar black hole in our galaxy found"',
    what: 'the discovery of Gaia BH3, 33 times the mass of the Sun, and how it was confirmed with a very large telescope. (European Southern Observatory, 16 April 2024.)',
  },
  chandraUHZ1: {
    id: 'chandraUHZ1',
    href: 'https://chandra.harvard.edu/press/23_releases/press_110623.html',
    label: 'NASA / Chandra X-ray Center: "NASA Telescopes Discover Record-Breaking Black Hole"',
    what: 'the press release on UHZ1, found by combining Webb and Chandra, and what its mass says about how early giant black holes formed. (6 November 2023.)',
  },
  nasaGNz11: {
    id: 'nasaGNz11',
    href: 'https://science.nasa.gov/missions/webb/webb-unlocks-secrets-of-one-of-the-most-distant-galaxies-ever-seen/',
    label: 'NASA: "Webb Unlocks Secrets of One of the Most Distant Galaxies Ever Seen"',
    what: 'a short news article on the early galaxy GN-z11 and the fast-feeding black hole at its centre. (NASA Webb Mission Team, 4 March 2024.)',
  },
  mcdonald: {
    id: 'mcdonald',
    href: 'https://mcdonaldobservatory.org/news/releases/20250806-0',
    label: 'McDonald Observatory (University of Texas at Austin): "Meet the Universe\'s Earliest Confirmed Black Hole"',
    what: 'a press release on CAPERS-LRD-z9, a "Little Red Dot" galaxy with a very massive black hole, and the Webb spectrum used to confirm it. It comes from a university observatory, not from NASA or ESA. (6 August 2025.)',
  },
  esaWebbBHS: {
    id: 'esaWebbBHS',
    href: 'https://esawebb.org/news/weic2610/',
    label: 'ESA/Webb: "Webb finds strongest evidence yet for black hole stars"',
    what: 'how the detailed Webb spectrum of one "little red dot" supports the idea of a black hole wrapped in a dense gas cocoon. (10 June 2026.)',
  },
  nasaViz: {
    id: 'nasaViz',
    href: 'https://svs.gsfc.nasa.gov/13326/',
    label: 'NASA Scientific Visualization Studio: "Black Hole Accretion Disk Visualization"',
    what: 'the original pictures from this visualization at full size, with NASA\'s credit line. (NASA\'s Goddard Space Flight Center, Jeremy Schnittman.)',
  },
  macTutor: {
    id: 'macTutor',
    href: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Black_Holes/',
    label: 'MacTutor History of Mathematics, University of St Andrews: "The development of the \'black hole\' concept"',
    what: 'a history essay from Michell and Laplace through Einstein and Schwarzschild to Hawking and LIGO. It is a university history site, not an official agency, and it was last updated in November 2018. (By J G Mena and T S C Peres.)',
  },
}

function GuideLinks({ ids, title = 'Go deeper' }: { ids: string[]; title?: string }) {
  return (
    <div style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold', color: GUIDE }}>{title}</p>
      <ul style={{ ...listStyle, marginBottom: 0 }}>
        {ids.map((id) => {
          const link = GUIDE_LINKS[id]
          return (
            <li key={id} style={{ marginBottom: '0.25rem' }}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>{' '}
              &mdash; {link.what}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section
      style={{
        marginTop: '1.5rem',
        padding: '1rem 1.25rem',
        border: '1px solid var(--border-color, #ddd)',
        borderLeft: `6px solid ${GUIDE}`,
        borderRadius: '8px',
        fontSize: '0.9375rem',
      }}
    >
      <h4 style={{ margin: '0 0 0.75rem', color: GUIDE, fontSize: '1.125rem' }}>
        {n}. {title}
      </h4>
      {children}
    </section>
  )
}

function Figure({ children, caption }: { children: ReactNode; caption: ReactNode }) {
  return (
    <figure style={{ margin: '1rem 0', padding: 0 }}>
      {children}
      <figcaption style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>{caption}</figcaption>
    </figure>
  )
}

function Label({ kind }: { kind: 'measured' | 'real-physics' | 'sketch' }) {
  const text =
    kind === 'measured'
      ? 'Real black holes: measured by astronomers'
      : kind === 'real-physics'
        ? 'Real physics: calculated with the real formula, not by the probe model'
        : 'A sketch drawn for this page, not data'
  return (
    <span
      style={{
        display: 'inline-block',
        marginBottom: '0.5rem',
        padding: '0.1rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: kind === 'measured' ? '#0f766e' : kind === 'real-physics' ? '#7c3aed' : '#64748b',
        borderRadius: '4px',
      }}
    >
      {text}
    </span>
  )
}

const quote = (text: string) => <>&ldquo;{text}&rdquo;</>

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻', '+': '' }
const sup = (n: number | string) => String(n).split('').map((c) => SUP[c] ?? c).join('')
const sci = (value: number, digits: number) => {
  const [mantissa, exponent] = value.toExponential(digits).split('e')
  return `${mantissa} × 10${sup(Number(exponent))}`
}

// ---- 1. Myth, fact or still a mystery? ----
const QUIZ: Array<{ q: string; verdict: string; answer: ReactNode }> = [
  {
    q: 'Do black holes suck everything in, like cosmic vacuum cleaners?',
    verdict: 'Myth',
    answer: (
      <>
        NASA&rsquo;s basics page says: {quote("Black holes don't suck in other matter. From far enough away, their gravitational effects are just like those of other objects of the same mass.")}{' '}
        That is the hill from the introduction: far from the centre, the pull depends only on the mass, not on how small the object is. NASA&rsquo;s
        question-and-answer page puts it with the Sun. The Sun will never become a black hole, because it is {quote('not massive enough to explode')}. But
        if it suddenly did, with the same mass as today, {quote('this would not affect the orbits of the planets')}, so {quote('Earth would continue to revolve around the Sun without getting pulled in')}.
        (The page adds that the lack of sunlight would be disastrous for life on Earth.)
      </>
    ),
  },
  {
    q: 'Is the event horizon a solid surface, like a floor?',
    verdict: 'Not a floor',
    answer: (
      <>
        NASA&rsquo;s anatomy page says {quote("We can think of the event horizon as the black hole's surface")}, but it is a point of no return, not a floor to stand on:
        {' '}{quote('whatever passes into the event horizon is doomed to stay inside it – even light')}, because {quote('inside this boundary, the velocity needed to escape the black hole exceeds the speed of light')}.
        That is the dashed circle you saw in the drawings.
      </>
    ),
  },
  {
    q: 'Do we know what is at the very centre of a black hole?',
    verdict: 'Still a mystery',
    answer: (
      <>
        NASA: {quote('General relativity predicts that the very center of a black hole contains a point where matter is crushed to infinite density.')} That point is called
        the singularity. But {quote("The singularity may be either a physical structure or a purely mathematical one, but right now astronomers don't know which is true.")}
      </>
    ),
  },
]

export function MythQuiz() {
  const [open, setOpen] = useState<boolean[]>(QUIZ.map(() => false))
  return (
    <div>
      {QUIZ.map((item, i) => (
        <div key={item.q} style={{ marginBottom: '0.75rem' }}>
          <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>{item.q}</p>
          {!open[i] ? (
            <button
              type="button"
              className="toggle-button"
              onClick={() => setOpen((o) => o.map((v, j) => (j === i ? true : v)))}
              style={{ padding: '0.35rem 0.9rem', fontSize: '0.875rem' }}
            >
              Show the answer
            </button>
          ) : (
            <p style={{ margin: 0, padding: '0.5rem 0.75rem', borderLeft: `4px solid ${TEAL}`, backgroundColor: 'rgba(45, 212, 191, 0.08)' }}>
              <strong>{item.verdict}.</strong> {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- 2. A 240-year-old idea: a timeline (not to scale) ----
const TIMELINE: Array<{ when: string; what: string; sub: string; color: string }> = [
  { when: '1784', what: 'Michell', sub: 'dark stars', color: AMBER },
  { when: '1790s', what: 'Laplace', sub: 'the same idea, on its own', color: AMBER },
  { when: '1915–16', what: 'Einstein, Schwarzschild', sub: 'the exact answer', color: PINK },
  { when: '2015', what: 'LIGO', sub: 'first collision heard', color: TEAL },
  { when: '2019', what: 'M87*', sub: 'first picture', color: TEAL },
  { when: '2022', what: 'Sgr A*', sub: 'our own black hole', color: TEAL },
]

export function TimelineDrawing() {
  const w = 720
  const step = (w - 180) / (TIMELINE.length - 1)
  return (
    <svg
      width={w}
      height={200}
      viewBox={`0 0 ${w} 200`}
      style={svgStyle}
      role="img"
      aria-label="A timeline, not to scale: 1784 Michell's dark stars, the 1790s Laplace, 1915 to 1916 Einstein and Schwarzschild, 2015 the first collision heard by LIGO, 2019 the first picture of M87 star, 2022 the first picture of Sagittarius A star."
    >
      <rect x={0} y={0} width={w} height={200} fill="#0b1020" />
      <text x={12} y={18} fontSize="11" fill={MUTED_COLOR}>
        Not to scale: the first three steps are spread over about 130 years, the last three over 7
      </text>
      <line x1={40} y1={105} x2={w - 40} y2={105} stroke={MUTED_COLOR} strokeWidth={3} />
      {TIMELINE.map((e, i) => {
        const x = 90 + i * step
        const up = i % 2 === 0
        return (
          <g key={e.when}>
            <circle cx={x} cy={105} r={9} fill={e.color} stroke="#0b1020" strokeWidth={2} />
            <line x1={x} y1={up ? 96 : 114} x2={x} y2={up ? 82 : 128} stroke={e.color} strokeWidth={1.5} />
            <text x={x} y={up ? 74 : 144} fontSize="14" fontWeight="bold" fill={e.color} textAnchor="middle">
              {e.when}
            </text>
            <text x={x} y={up ? 60 : 160} fontSize="12" fontWeight="bold" fill={TEXT_COLOR} textAnchor="middle">
              {e.what}
            </text>
            <text x={x} y={up ? 46 : 175} fontSize="10" fill={MUTED_COLOR} textAnchor="middle">
              {e.sub}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ---- 3. The size ladder (real physics) ----
export function formatLength(meters: number): string {
  if (!(meters > 0) || !Number.isFinite(meters)) return 'not a size'
  if (meters < 1e-6) return `${sci(meters, 1)} metres`
  if (meters < 1) {
    const mm = meters * 1000
    return `${mm < 1 ? mm.toFixed(2) : mm < 10 ? mm.toFixed(1) : mm.toFixed(0)} millimetres`
  }
  if (meters < 1000) return `${meters.toFixed(meters < 10 ? 1 : 0)} metres`
  const km = meters / 1000
  if (km < 1e6) return `${km.toFixed(km < 10 ? 1 : 0)} kilometres`
  if (km < 1e9) return `${(km / 1e6).toFixed(1)} million kilometres`
  return `${(km / 1e9).toFixed(1)} billion kilometres`
}

const LADDER_NOTE: Record<string, string> = {
  'A person (70 kg)': 'Far, far smaller than an atom. This one is only for scale: nothing like it could ever form.',
  'The Moon': 'Less than a millimetre. (Calculated here with the standard mass of the Moon.)',
  'The Earth': 'NASA\'s Imagine the Universe page says the Earth would have to be squeezed into a sphere with a radius of 9 mm.',
  Jupiter: 'A few metres across the middle. (Calculated here with the standard mass of Jupiter.)',
  'The Sun': 'NASA\'s Imagine the Universe page says the Sun would need to be squeezed to a radius of about 3 km.',
  'Sagittarius A* (4 million Suns)': 'Its radius is about 12 million kilometres. The mass is from ESO; the radius is calculated here.',
  'M87* (6.5 billion Suns)': 'Its radius is about 19 billion kilometres, so it is about 38 billion kilometres across. The mass is from ESO; the size is calculated here.',
}

export function SizeLadderDrawing({ selected, ladder }: { selected: number; ladder: SizeLadderEntry[] }) {
  const w = 720
  const h = 230
  const lo = -26
  const hi = 14
  const x = (m: number) => 40 + ((Math.log10(m) - lo) / (hi - lo)) * (w - 80)
  const ticks = [-25, -20, -15, -10, -5, 0, 5, 10]
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={svgStyle}
      role="img"
      aria-label="A scale of sizes, from far smaller than an atom to billions of kilometres, with the radius each object would need to be squeezed to in order to become a black hole."
    >
      <rect x={0} y={0} width={w} height={h} fill="#0b1020" />
      <text x={12} y={20} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The radius each object would have to be squeezed to (real physics)
      </text>
      <line x1={40} y1={150} x2={w - 40} y2={150} stroke={MUTED_COLOR} strokeWidth={2} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(10 ** t)} y1={146} x2={x(10 ** t)} y2={156} stroke={MUTED_COLOR} />
          <text x={x(10 ** t)} y={172} fontSize="10" fill={MUTED_COLOR} textAnchor="middle">
            {t === 0 ? '1 m' : `10${sup(t)} m`}
          </text>
        </g>
      ))}
      <text x={w / 2} y={196} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
        Every tick is 100,000 times bigger than the one before it (a "log" scale: equal steps mean equal multiplications)
      </text>
      {ladder.map((e, i) => {
        const cx = x(e.radiusMeters)
        const isSel = i === selected
        const up = i % 2 === 0
        return (
          <g key={e.name}>
            <line x1={cx} y1={150} x2={cx} y2={up ? 84 : 116} stroke={isSel ? PINK : VIOLET} strokeWidth={isSel ? 2.5 : 1} />
            <circle cx={cx} cy={150} r={isSel ? 7 : 5} fill={isSel ? PINK : VIOLET} stroke="#0b1020" strokeWidth={1.5} />
            <text x={Math.min(Math.max(cx, 70), w - 70)} y={up ? 78 : 110} fontSize={isSel ? 12 : 10} fontWeight={isSel ? 'bold' : 'normal'} fill={isSel ? PINK : TEXT_COLOR} textAnchor="middle">
              {e.name.replace(/ \(.*\)/, '')}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function SizeLadder() {
  const ladder = sizeLadder()
  const [selected, setSelected] = useState(4)
  const e = ladder[selected]
  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        {ladder.map((entry, i) => (
          <button
            key={entry.name}
            type="button"
            className={`toggle-button${i === selected ? ' is-selected' : ''}`}
            onClick={() => setSelected(i)}
            style={{ marginRight: '0.4rem', marginBottom: '0.4rem', padding: '0.35rem 0.8rem', fontSize: '0.8125rem' }}
          >
            {entry.name.replace(/ \(.*\)/, '')}
          </button>
        ))}
      </div>
      <p style={{ margin: '0 0 0.5rem', padding: '0.5rem 0.75rem', borderLeft: `4px solid ${PINK}` }}>
        <strong>{e.name}</strong> would become a black hole if it were squeezed into a ball with a radius of <strong>{formatLength(e.radiusMeters)}</strong>.{' '}
        {LADDER_NOTE[e.name]}
      </p>
      <SizeLadderDrawing selected={selected} ladder={ladder} />
      <p style={{ ...paragraph, fontSize: '0.8125rem', marginTop: '0.5rem' }}>
        <strong>The formula.</strong> radius = 2 × G × mass ÷ c², where G is the strength of gravity ({sci(REAL_G, 4)} in
        standard units) and c is the speed of light ({REAL_C.toLocaleString('en-US')} metres a second). <strong>Worked example, the Earth:</strong> mass 5.972 × 10²⁴ kg, so
        radius = 2 × 6.674 × 10⁻¹¹ × 5.972 × 10²⁴ ÷ (3.00 × 10⁸)² ≈ 0.0089 m, about 9 millimetres. It is the same idea as the probe model, with real numbers
        in place of the made-up ones. NASA&rsquo;s page calls this the Schwarzschild radius: {quote('The radius at which a mass has an escape velocity equal to the speed of light')}.
      </p>
    </div>
  )
}

// ---- 4. Where do black holes come from? ----
export function StarLifeDrawing() {
  const w = 720
  const panels = [
    { t: 'A massive star', s: 'more than 8 Suns', c: AMBER },
    { t: 'It runs out of fuel', s: 'the core collapses', c: PINK },
    { t: 'A supernova', s: 'the star explodes', c: '#fb7185' },
    { t: 'What is left', s: 'about 20 Suns or more:|a black hole', c: VIOLET },
  ]
  return (
    <svg
      width={w}
      height={190}
      viewBox={`0 0 ${w} 190`}
      style={svgStyle}
      role="img"
      aria-label="Four steps: a massive star, it runs out of fuel and its core collapses, a supernova explosion, and what is left, which for a star of about 20 Suns or more is a black hole."
    >
      <rect x={0} y={0} width={w} height={190} fill="#0b1020" />
      {panels.map((p, i) => {
        const cx = 90 + i * 180
        return (
          <g key={p.t}>
            {i === 0 && <circle cx={cx} cy={75} r={42} fill={p.c} opacity={0.9} />}
            {i === 1 && (
              <>
                <circle cx={cx} cy={75} r={42} fill="none" stroke={p.c} strokeWidth={2} strokeDasharray="5 4" />
                <circle cx={cx} cy={75} r={14} fill={p.c} />
                {[0, 90, 180, 270].map((a) => (
                  <line key={a} x1={cx + 36 * Math.cos((a * Math.PI) / 180)} y1={75 + 36 * Math.sin((a * Math.PI) / 180)} x2={cx + 20 * Math.cos((a * Math.PI) / 180)} y2={75 + 20 * Math.sin((a * Math.PI) / 180)} stroke={p.c} strokeWidth={2} />
                ))}
              </>
            )}
            {i === 2 && (
              <>
                <circle cx={cx} cy={75} r={14} fill={YELLOW} />
                {Array.from({ length: 12 }).map((_, k) => (
                  <line key={k} x1={cx + 20 * Math.cos((k * Math.PI) / 6)} y1={75 + 20 * Math.sin((k * Math.PI) / 6)} x2={cx + 46 * Math.cos((k * Math.PI) / 6)} y2={75 + 46 * Math.sin((k * Math.PI) / 6)} stroke={p.c} strokeWidth={3} strokeLinecap="round" />
                ))}
              </>
            )}
            {i === 3 && (
              <>
                <circle cx={cx} cy={75} r={30} fill="#000" stroke={p.c} strokeWidth={2.5} strokeDasharray="6 4" />
                <circle cx={cx} cy={75} r={4} fill={p.c} />
              </>
            )}
            <text x={cx} y={140} fontSize="13" fontWeight="bold" fill={p.c} textAnchor="middle">
              {p.t}
            </text>
            {p.s.split('|').map((line, k) => (
              <text key={k} x={cx} y={158 + k * 13} fontSize="11" fill={TEXT_COLOR} textAnchor="middle">
                {line}
              </text>
            ))}
            {i < 3 && (
              <text x={cx + 90} y={82} fontSize="22" fill={MUTED_COLOR} textAnchor="middle">
                →
              </text>
            )}
          </g>
        )
      })}
      <text x={12} y={184} fontSize="10" fill={MUTED_COLOR}>
        Not to scale. Sketch drawn for this page from NASA&rsquo;s description.
      </text>
    </svg>
  )
}

// ---- 6. A sketch of the chirp ----
export function ChirpDrawing() {
  const w = 720
  const pts: string[] = []
  const n = 700
  for (let i = 0; i <= n; i++) {
    const t = i / n
    let y: number
    let x = 40 + t * (w - 80)
    if (t < 0.7) {
      const u = t / 0.7
      const freq = 4 + 40 * u * u
      const amp = 6 + 44 * u * u
      y = 95 - amp * Math.sin(freq * Math.PI * u)
    } else {
      const u = (t - 0.7) / 0.3
      y = 95 - 38 * Math.exp(-4.5 * u) * Math.sin(60 * Math.PI * (0.7 + u * 0.06) + 8 * u)
    }
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return (
    <svg
      width={w}
      height={190}
      viewBox={`0 0 ${w} 190`}
      style={svgStyle}
      role="img"
      aria-label="A sketch of a gravitational wave signal from two black holes merging: a wave that gets faster and stronger as they circle closer, then a short fading ripple as the merged black hole settles."
    >
      <rect x={0} y={0} width={w} height={190} fill="#0b1020" />
      <polyline points={pts.join(' ')} fill="none" stroke={TEAL} strokeWidth={2} />
      <line x1={40} y1={95} x2={w - 40} y2={95} stroke={MUTED_COLOR} strokeDasharray="4 4" />
      <text x={150} y={170} fontSize="12" fontWeight="bold" fill={AMBER} textAnchor="middle">
        The two black holes circle each other
      </text>
      <text x={150} y={185} fontSize="11" fill={TEXT_COLOR} textAnchor="middle">
        faster and faster, and the wave strengthens
      </text>
      <text x={500} y={30} fontSize="12" fontWeight="bold" fill={PINK} textAnchor="middle">
        They merge
      </text>
      <text x={w - 14} y={170} fontSize="12" fontWeight="bold" fill={VIOLET} textAnchor="end">
        The new black hole settles
      </text>
      <text x={w - 14} y={185} fontSize="11" fill={TEXT_COLOR} textAnchor="end">
        and the ripple fades
      </text>
      <text x={w - 12} y={18} fontSize="10" fill={MUTED_COLOR} textAnchor="end">
        A sketch of the idea, not real LIGO data
      </text>
    </svg>
  )
}

// ---- 7. Our neighbours ----
const NEIGHBOURS: Array<{ name: string; ly: number; sub: string; color: string }> = [
  { name: 'Gaia BH1', ly: 1560, sub: 'about 10 Suns', color: AMBER },
  { name: 'Gaia BH3', ly: 2000, sub: '33 Suns', color: PINK },
  { name: 'Gaia BH2', ly: 3800, sub: 'about 10 Suns', color: TEAL },
]

export function NeighboursDrawing() {
  const w = 720
  const x = (ly: number) => 60 + (ly / 4000) * 470
  return (
    <svg
      width={w}
      height={200}
      viewBox={`0 0 ${w} 200`}
      style={svgStyle}
      role="img"
      aria-label="A line showing how far away three nearby black holes are, in light-years from the Sun: Gaia BH1 at 1,560, Gaia BH3 at about 2,000 and Gaia BH2 at 3,800, with Sagittarius A star far off the end at about 27,000."
    >
      <rect x={0} y={0} width={w} height={200} fill="#0b1020" />
      <text x={12} y={20} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        How far away, in light-years from the Sun
      </text>
      <line x1={60} y1={110} x2={x(4000)} y2={110} stroke={MUTED_COLOR} strokeWidth={2} />
      <circle cx={60} cy={110} r={8} fill={YELLOW} />
      <text x={60} y={138} fontSize="12" fontWeight="bold" fill={YELLOW} textAnchor="middle">
        The Sun
      </text>
      {[0, 1000, 2000, 3000, 4000].map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={106} x2={x(t)} y2={114} stroke={MUTED_COLOR} />
          <text x={x(t)} y={158} fontSize="10" fill={MUTED_COLOR} textAnchor="middle">
            {t.toLocaleString('en-US')}
          </text>
        </g>
      ))}
      {NEIGHBOURS.map((b, i) => {
        const anchor = i === 0 ? 'end' : i === 1 ? 'start' : 'middle'
        const dx = i === 0 ? 10 : i === 1 ? -10 : 0
        const top = i === 1 ? 46 : 78
        return (
          <g key={b.name}>
            <circle cx={x(b.ly)} cy={110} r={7} fill="#000" stroke={b.color} strokeWidth={3} />
            <line x1={x(b.ly)} y1={103} x2={x(b.ly)} y2={top + 6} stroke={b.color} strokeWidth={1.5} />
            <text x={x(b.ly) + dx} y={top} fontSize="12" fontWeight="bold" fill={b.color} textAnchor={anchor}>
              {b.name}
            </text>
            <text x={x(b.ly) + dx} y={top - 14} fontSize="10" fill={TEXT_COLOR} textAnchor={anchor}>
              {b.sub}, {b.ly.toLocaleString('en-US')} ly
            </text>
          </g>
        )
      })}
      <text x={x(4000) + 12} y={106} fontSize="22" fill={MUTED_COLOR}>
        →
      </text>
      <text x={x(4000) + 40} y={102} fontSize="12" fontWeight="bold" fill={VIOLET}>
        Sagittarius A*
      </text>
      <text x={x(4000) + 40} y={118} fontSize="10" fill={TEXT_COLOR}>
        4 million Suns, about
      </text>
      <text x={x(4000) + 40} y={131} fontSize="10" fill={TEXT_COLOR}>
        27,000 ly: far off this chart
      </text>
      <text x={12} y={188} fontSize="10" fill={MUTED_COLOR}>
        A light-year is the distance light travels in one year. Distances and masses as given by ESA and ESO.
      </text>
    </svg>
  )
}

// ---- 8. How early? ----
export function EarlyUniverseDrawing() {
  const w = 720
  const full = (myr: number) => 40 + (myr / 13800) * (w - 80)
  const zoom = (myr: number) => 40 + ((myr - 400) / 150) * (w - 80)
  const marks = [
    { name: 'GN-z11', myr: 430, sub: '430 million years (NASA, 2024)', color: AMBER, y: 150 },
    { name: 'UHZ1', myr: 470, sub: '470 million years (Chandra and Webb, 2023)', color: PINK, y: 186 },
    { name: 'CAPERS-LRD-z9', myr: 500, sub: '500 million years (McDonald Observatory, 2025)', color: TEAL, y: 150 },
  ]
  return (
    <svg
      width={w}
      height={240}
      viewBox={`0 0 ${w} 240`}
      style={svgStyle}
      role="img"
      aria-label="The age of the universe from the Big Bang to today, 13.8 billion years, with the first 550 million years magnified to show three early black holes: GN-z11 at 430 million years, UHZ1 at 470 million years and CAPERS-LRD-z9 at 500 million years after the Big Bang."
    >
      <rect x={0} y={0} width={w} height={240} fill="#0b1020" />
      <text x={12} y={18} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The whole history of the universe: 13.8 billion years
      </text>
      <rect x={40} y={30} width={w - 80} height={18} fill="#1e293b" stroke={MUTED_COLOR} />
      <rect x={40} y={30} width={full(550) - 40} height={18} fill={VIOLET} />
      <text x={40} y={64} fontSize="10" fill={MUTED_COLOR}>
        Big Bang
      </text>
      <text x={w - 40} y={64} fontSize="10" fill={MUTED_COLOR} textAnchor="end">
        Today
      </text>
      <line x1={40} y1={48} x2={40} y2={90} stroke={VIOLET} strokeDasharray="3 3" />
      <line x1={full(550)} y1={48} x2={w - 40} y2={90} stroke={VIOLET} strokeDasharray="3 3" />
      <text x={w / 2} y={84} fontSize="11" fill={VIOLET} textAnchor="middle">
        magnified: the first 400 to 550 million years
      </text>
      <line x1={40} y1={110} x2={w - 40} y2={110} stroke={MUTED_COLOR} strokeWidth={2} />
      {[400, 450, 500, 550].map((t) => (
        <g key={t}>
          <line x1={zoom(t)} y1={106} x2={zoom(t)} y2={114} stroke={MUTED_COLOR} />
          <text x={zoom(t)} y={126} fontSize="10" fill={MUTED_COLOR} textAnchor="middle">
            {t}
          </text>
        </g>
      ))}
      {marks.map((m) => (
        <g key={m.name}>
          <circle cx={zoom(m.myr)} cy={110} r={6} fill={m.color} stroke="#0b1020" strokeWidth={1.5} />
          <line x1={zoom(m.myr)} y1={116} x2={zoom(m.myr)} y2={m.y - 14} stroke={m.color} strokeWidth={1} />
          <text x={zoom(m.myr)} y={m.y} fontSize="12" fontWeight="bold" fill={m.color} textAnchor="middle">
            {m.name}
          </text>
          <text x={zoom(m.myr)} y={m.y + 14} fontSize="10" fill={TEXT_COLOR} textAnchor="middle">
            {m.sub}
          </text>
        </g>
      ))}
      <text x={w - 12} y={232} fontSize="10" fill={MUTED_COLOR} textAnchor="end">
        Time after the Big Bang, in millions of years. Each is a claim in the source named; see the text.
      </text>
    </svg>
  )
}

// ---- the whole guide ----
export function BlackHoleFieldGuide() {
  const ladderLinks = ['nasaImagine']
  const allIds = Object.keys(GUIDE_LINKS)
  return (
    <div id="black-hole-field-guide" style={{ marginTop: '3rem' }}>
      <div style={{ paddingTop: '1.5rem', borderTop: `6px solid ${GUIDE}` }}>
        <h3 style={{ margin: '0 0 0.5rem', color: GUIDE }}>The black hole field guide</h3>
        <p style={{ ...paragraph, fontSize: '0.9375rem' }}>
          You have worked out the idea with a made-up model. Now meet the real ones. Everything here is as of November 2026, and the dates sit beside the
          figures, because records and counts keep changing. A label shows what kind of fact each section holds:{' '}
          <strong>real black holes, measured by astronomers</strong>; <strong>real physics, calculated with the real formula</strong>; or{' '}
          <strong>a sketch</strong> drawn for this page. Every link opens in a new tab and was read on 13 November 2026.
        </p>
      </div>

      <Section n={1} title="Myth, fact or still a mystery?">
        <p style={paragraph}>Three things people often say about black holes. Think first, then press the button.</p>
        <MythQuiz />
        <GuideLinks ids={['nasaBasics', 'nasaAnatomy', 'nasaQA']} />
      </Section>

      <Section n={2} title="A 240-year-old idea">
        <p style={paragraph}>
          The reasoning you used in this experiment is old. In 1784 John Michell published a letter in the <em>Philosophical Transactions</em> proposing that
          there could be a body so massive that even light could not escape: &ldquo;dark stars&rdquo;. Pierre-Simon Laplace came to the same idea on his own in the
          1790s. The exact answer, which does not rest on this simple argument, came within about a month of Einstein&rsquo;s general theory of relativity
          (published 1915): Karl Schwarzschild found it. Then came direct evidence that they are real: waves from a collision in 2015, and pictures in 2019 and 2022.
        </p>
        <Figure
          caption={
            <>
              A timeline, not to scale. Dates for 1784, the 1790s and 1915 are as given by the St Andrews history essay named below. 2015, 2019 and 2022 are from the
              LIGO and ESO pages in the later sections. Drawn for this page.
            </>
          }
        >
          <TimelineDrawing />
        </Figure>
        <p style={{ ...paragraph, fontSize: '0.8125rem' }}>
          <strong>About these sources.</strong> I looked for a plain page about Michell and Laplace from an official source (a space agency, an observatory or a
          learned society) and found none that I could read, so the link below is a university history site: a secondary source, not an official agency.
        </p>
        <GuideLinks ids={['macTutor']} />
      </Section>

      <Section n={3} title="How small would it have to be?">
        <Label kind="real-physics" />
        <p style={paragraph}>
          In the experiment the mass and sizes were made-up. Here they are real. Pick an object to see how small it would have to be squeezed to become a black
          hole. The squeeze is only a thought experiment: nothing squeezes the Earth.
        </p>
        <SizeLadder />
        <GuideLinks ids={ladderLinks} />
      </Section>

      <Section n={4} title="Where do black holes come from?">
        <Figure caption={<>The life of a massive star. A sketch drawn for this page from NASA&rsquo;s description on the &ldquo;Black Hole Types&rdquo; page.</>}>
          <StarLifeDrawing />
        </Figure>
        <p style={paragraph}>
          NASA: {quote("When a star with more than eight times the Sun's mass runs out of fuel, its core collapses, rebounds, and explodes as a supernova")}. {quote('If it had around 20 times the Sun\'s mass or more, the star\'s core collapses into a stellar-mass black hole')}.
          It is quick: NASA&rsquo;s question-and-answer page says a stellar-mass black hole {quote('can likely form in seconds, after the collapse of a massive star')}. They can also be made when
          two dense remnants called neutron stars merge, or when a neutron star merges with a black hole, or when two black holes collide.
        </p>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Four sizes, as NASA lists them</p>
        <ul style={listStyle}>
          <li>
            <strong>Stellar-mass:</strong> from {quote('a few to hundreds of times the Sun\'s mass')}. {quote('Binaries have revealed around 50 suspected or confirmed stellar-mass black holes in the Milky Way, but scientists think there may be as many as 100 million in our galaxy alone.')}
          </li>
          <li>
            <strong>Intermediate:</strong> {quote('around one hundred to hundreds of thousands of times the Sun\'s mass')}. {quote('Numerous candidates have been identified but have proven difficult to confirm.')}
          </li>
          <li>
            <strong>Supermassive:</strong> {quote('hundreds of thousands to billions of times the Sun\'s mass')}. Sagittarius A* is {quote('4 million times the mass of the Sun')}, and {quote('most Milky Way-sized galaxies have monster black holes at their centers')}.
            How they grow so big so fast is still open: NASA says {quote('it is unknown how long it takes them to form, generally')}.
          </li>
          <li>
            <strong>Primordial:</strong> only an idea. {quote('Scientists theorize that primordial black holes formed in the first second after the birth of the universe')}, but {quote('scientists haven\'t yet found definitive proof these primordial black holes ever existed')}.
          </li>
        </ul>
        <GuideLinks ids={['nasaTypes', 'nasaQA']} />
      </Section>

      <Section n={5} title="Pictures of the invisible">
        <Label kind="measured" />
        <p style={paragraph}>
          A black hole gives out no light of its own, so how do you photograph one? You photograph what glows around it. In April 2019 the Event Horizon Telescope
          collaboration showed M87*, using eight radio telescopes across the planet linked to work as one Earth-sized telescope (ESO). You saw the picture at the top of this page: it is 55 million
          light-years away and 6.5 billion times the mass of the Sun. In May 2022 came Sagittarius A*, 27,000 light-years away and four million times the mass of the Sun. The two rings
          look about the same size in the sky, even though M87* is about 1,600 times more massive. That is because it is about 2,000 times farther away. (This is our own
          arithmetic from those two sets of numbers.)
        </p>
        <p style={paragraph}>
          The scientists measure the ring in <strong>microarcseconds</strong>, a tiny angle: an arcsecond is one 3,600th of a degree, and a microarcsecond is a millionth of that.
          The papers give <strong>42 ± 3</strong> for M87* and <strong>51.8 ± 2.3</strong> for Sagittarius A*. Sagittarius A* was harder to photograph: ESO quotes the team saying its gas goes round in
          minutes, {quote('a bit like trying to take a clear picture of a puppy quickly chasing its tail')}.
        </p>
        <p style={paragraph}>
          <strong>Newer results.</strong> On 27 March 2024 ESO reported the first picture of Sagittarius A* in polarised light, showing {quote('strong and organised magnetic fields spiraling from the edge of the supermassive black hole')},
          {' '}{quote('suggesting that strong magnetic fields may be common to all black holes')}. On 16 September 2025 an institute of the collaboration reported M87* pictures from 2017, 2018 and 2021:
          {' '}{quote('while the ring size has remained consistent over the years')}, {quote('the polarization pattern changes significantly')}. In 2017 the magnetic fields appeared to spiral one way; in 2021 they reversed.
          One of the scientists called the flip {quote('totally unexpected')}.
        </p>
        <Figure
          caption={
            <>
              <strong>A computer visualization of a black hole, not a photograph.</strong> The labels in the picture are NASA&rsquo;s. The dark patch in the middle is the
              shadow. Credit: NASA&rsquo;s Goddard Space Flight Center/Jeremy Schnittman. Shown at a smaller size than the original; no other change. Source: NASA&rsquo;s Scientific
              Visualization Studio, &ldquo;Black Hole Accretion Disk Visualization&rdquo; (svs.gsfc.nasa.gov/13326).
            </>
          }
        >
          <img
            src={NASA_VISUALIZATION_IMAGE}
            alt="A computer picture of a black hole seen from the side: a dark round shadow in the middle, surrounded by a glowing orange disk of hot gas that is bent over the top and under the bottom, with labels naming the accretion disk, the shadow, the photon ring, Doppler beaming and the images of the far side and underside of the disk."
            width={1600}
            height={900}
            style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid var(--border-color, #ccc)', backgroundColor: '#000' }}
          />
        </Figure>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <figure style={{ margin: 0, flex: '1 1 260px' }}>
            <img src={M87_IMAGE} alt="M87*, a blurry orange ring around a dark patch." width={1280} height={746} style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
            <figcaption style={{ fontSize: '0.75rem' }}>M87*. Image: EHT Collaboration (CC BY 4.0), via ESO.</figcaption>
          </figure>
          <figure style={{ margin: 0, flex: '1 1 200px', maxWidth: '260px' }}>
            <img src={SGRA_IMAGE} alt="Sagittarius A*, a blurry orange ring around a dark patch." width={1280} height={1280} style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
            <figcaption style={{ fontSize: '0.75rem' }}>Sagittarius A*. Image: EHT Collaboration (CC BY 4.0), via ESO.</figcaption>
          </figure>
        </div>
        <GuideLinks ids={['esoM87', 'esoSgrA', 'esoPol', 'asiaa', 'arxM87', 'arxSgrA1', 'arxSgrA3', 'nasaAnatomy', 'nasaViz']} />
      </Section>

      <Section n={6} title="Hearing black holes collide">
        <Label kind="measured" />
        <p style={paragraph}>
          On 14 September 2015 at 09:51 UTC, two detectors of LIGO caught the first gravitational waves ever detected. LIGO&rsquo;s press release: {quote('the black holes for this event were about 29 and 36 times the mass of the sun, and the event took place 1.3 billion years ago')}.
          The signal reached Livingston {quote('7 milliseconds before')} Hanford. LIGO can detect {quote('a change in the lengths of the arms smaller than one-ten-thousandth the diameter of a proton')}.
          And the collision released {quote('about 3 times the mass of the sun')} as gravitational waves in a fraction of a second, {quote('with a peak power output about 50 times that of the whole visible universe')}.
        </p>
        <Figure caption={<>The shape of such a signal, sketched. Drawn for this page; the real signals are in the LIGO pages below.</>}>
          <ChirpDrawing />
        </Figure>
        <p style={paragraph}>
          <strong>Since then.</strong> On 14 January 2025 LIGO caught GW250114, two black holes of {quote('between 30 to 40 times that of our Sun')} about 1.3 billion light-years away, the clearest signal yet. It gave the best
          test so far of {quote("the black hole area theorem, an idea put forth by Stephen Hawking in 1971 that says the total surface areas of black holes cannot decrease")}: confidence of
          {' '}{quote('99.999 percent')} for the new data, against 95 percent before. The black holes began with a total surface area of about 240,000 square kilometres and ended with about 400,000. The
          catalog GWTC-4.0 added {quote('128 new confident gravitational-wave (GW) signals')}, bringing {quote('the total number of candidates within the GWTC to 218')}. The fourth observing run
          ended on 18 November 2025 after {quote('roughly 250 candidate signals')}. Counts like these keep rising.
        </p>
        <GuideLinks ids={['ligo150914', 'ligo250114', 'ligoGWTC4', 'ligoO4']} />
      </Section>

      <Section n={7} title="Our neighbours">
        <Label kind="measured" />
        <p style={paragraph}>
          The nearest known black holes were found by Gaia, a European Space Agency telescope, from the wobble they cause in the stars that circle them.
          ESA reports Gaia BH1 and BH2 {quote('just 1560 light-years away from us in the direction of the constellation Ophiuchus and 3800 light-years away in the constellation Centaurus')}, each
          {' '}{quote('approximately ten times more massive than our Sun')}. NASA rounds the first to about 1,500 light-years. In April 2024 ESO announced Gaia BH3: {quote('33 times that of the Sun')},
          {' '}{quote('2000 light-years away in the constellation Aquila')}, {quote('the second-closest known black hole to Earth')}, and {quote('the most massive stellar black hole yet discovered in the Milky Way galaxy')}.
          None is anywhere near us: the nearest is over a thousand light-years away.
        </p>
        <Figure caption={<>Distances in light-years, to scale along the line. Distances and masses as given by ESA and ESO. Drawn for this page.</>}>
          <NeighboursDrawing />
        </Figure>
        <GuideLinks ids={['esaGaia', 'esoGaia3', 'nasaBasics']} />
      </Section>

      <Section n={8} title="The oldest, the biggest and the smallest">
        <Label kind="measured" />
        <p style={paragraph}>
          The James Webb Space Telescope has found black holes shining when the universe was very young. Three claims are on record, each as its source states it:
        </p>
        <ul style={listStyle}>
          <li>
            <strong>UHZ1</strong>, {quote('just 470 million years after the big bang')} (NASA and Chandra, 6 November 2023), with a mass {quote('estimated to fall between 10 and 100 million Suns')}.
          </li>
          <li>
            <strong>GN-z11</strong>, when the universe {quote('was only about 430 million years old')}, with {quote('a 2-million-solar-mass, supermassive black hole')}. NASA (4 March 2024): {quote('Their finding makes this the farthest active supermassive black hole spotted to date.')}
          </li>
          <li>
            <strong>CAPERS-LRD-z9</strong>, {quote('500 million years after the Big Bang')}, with a mass {quote('up to 300 million times that of our Sun')}. A 2025 release from McDonald Observatory, a university observatory, calls it {quote('the most distant black hole ever confirmed')}.
          </li>
        </ul>
        <Figure caption={<>Where the three claims sit in the history of the universe. The first 550 million years are magnified. Drawn for this page.</>}>
          <EarlyUniverseDrawing />
        </Figure>
        <p style={{ ...paragraph, fontSize: '0.9375rem' }}>
          <strong>These sources do not agree on a single record.</strong> GN-z11 is the earliest of the three on the picture, yet the 2025 release calls CAPERS-LRD-z9 the most distant one confirmed.
          This page does not settle that. Records like these are measured again and often change.
        </p>
        <p style={paragraph}>
          <strong>A new idea.</strong> On 10 June 2026 ESA/Webb&rsquo;s headline was {quote('Webb finds strongest evidence yet for "black hole stars"')}: a little red dot seen 1.8 billion years after the Big Bang, described as
          {' '}{quote('a rapidly accreting, or growing, black hole enveloped in a dense gas cocoon')}. That is a new idea about what some early objects are, not a distance record.
        </p>
        <p style={paragraph}>
          <strong>Biggest and smallest.</strong> NASA: {quote("The most massive black hole observed, TON 618, tips the scales at 66 billion times the Sun's mass.")} And {quote("The lightest-known black hole is only 3.8 times the Sun's mass. It's paired up with a star.")}
        </p>
        <GuideLinks ids={['chandraUHZ1', 'nasaGNz11', 'mcdonald', 'esaWebbBHS', 'nasaBasics']} />
      </Section>

      <Section n={9} title="Do black holes last for ever?">
        <p style={paragraph}>
          Not quite. NASA&rsquo;s question-and-answer page: {quote('The late physicist Stephen Hawking proposed that while black holes get bigger by eating material, they also slowly shrink because they are losing tiny amounts of energy called "Hawking radiation."')}
          {' '}{quote('Eventually, in theory, black holes will evaporate through Hawking radiation. But it would take much longer than the entire age of the universe for most black holes we know about to significantly evaporate.')}
          {' '}{quote('Black holes, even the ones around a few times the mass of the Sun, will be around for a really, really long time!')}
        </p>
        <p style={paragraph}>
          <strong>So what is Hawking radiation?</strong> Nothing can escape from inside a black hole, but in 1974 Stephen Hawking worked out that the
          rules of quantum physics (the physics of the very small) change the picture right at its edge. Very close to the edge, the black hole should give off a
          faint glow of heat and particles. That glow carries energy away, and energy is a kind of mass, so the black hole very slowly gets lighter and smaller.
          It is a little like a cup of hot tea cooling in a cold room: it loses heat all the time, just far more slowly here.
        </p>
        <p style={paragraph}>
          <strong>How faint is the glow?</strong> The bigger the black hole, the colder and fainter it is. For a black hole with the mass of the Sun, the glow
          would be at a temperature of only about 0.00000006 kelvin (six hundred-millionths of a degree above absolute zero). Space itself is warmer than that, at
          about 2.7 kelvin, so such a black hole takes in more heat from its surroundings than it gives out and does not shrink yet. That is why NASA says
          the black holes we know about will last for so long. Hawking radiation has never been measured; it is a prediction of theory.
        </p>
        <p style={{ ...paragraph, fontSize: '0.8125rem' }}>
          <strong>About this source.</strong> I found no dedicated plain page about Hawking radiation from an official source. The NASA quotations above come from NASA&rsquo;s question-and-answer page;
          NASA describes it as something Hawking {quote('proposed')} and that happens {quote('in theory')}. The two paragraphs above, on what it is and how faint it is, are my own plain-words summary of
          the standard theory, not quotations from a fetched page, and are for the owner to check. You will meet it again in the chapters called &ldquo;Black Holes and Strong Gravity&rdquo;.
        </p>
        <GuideLinks ids={['nasaQA']} />
      </Section>

      <div style={{ marginTop: '1.5rem', fontSize: '0.875rem' }}>
        <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold', color: GUIDE }}>All the links in one place</p>
        <p style={{ ...paragraph, fontSize: '0.8125rem' }}>
          Each opens in a new tab. All were read on 13 November 2026. Figures that may change after November 2026 include the gravitational-wave counts, the earliest-black-hole
          claims, the nearest and biggest black holes, and the number of known black holes in our galaxy.
        </p>
        <ul style={listStyle}>
          {allIds.map((id) => (
            <li key={id} style={{ marginBottom: '0.2rem' }}>
              <a href={GUIDE_LINKS[id].href} target="_blank" rel="noopener noreferrer">
                {GUIDE_LINKS[id].label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
