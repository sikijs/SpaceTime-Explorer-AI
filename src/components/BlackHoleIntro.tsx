import type { ReactNode } from 'react'
import { hillDepthAt, pullAt } from '../physics/blackHoleExperiment'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { listStyle, paragraph } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 7: the introduction (docs/audit/gravity-and-curved-spacetime/07-draft-wording.md, section 14,
// approved by the owner on 2026-11-13). It gives no answer to the three guesses (CLAUDE.md §12). Two real pictures (EHT Collaboration,
// CC BY 4.0, via ESO) and three drawings made for this page.

const BASE = import.meta.env.BASE_URL
export const M87_IMAGE = `${BASE}images/black-holes/m87-eht-eso1907a.jpg`
export const SGRA_IMAGE = `${BASE}images/black-holes/sgra-eht-eso2208.jpg`

const AMBER = '#f59e0b'
const PINK = '#f472b6'
const BLUE = '#60a5fa'
const TEAL = '#2dd4bf'
const VIOLET = '#c4b5fd'

function Figure({ children, caption, credit }: { children: ReactNode; caption: ReactNode; credit?: ReactNode }) {
  return (
    <figure style={{ margin: '1rem 0', padding: 0 }}>
      {children}
      <figcaption style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
        {caption}
        {credit && (
          <>
            {' '}
            <span style={{ fontSize: '0.75rem' }}>{credit}</span>
          </>
        )}
      </figcaption>
    </figure>
  )
}

const imgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  borderRadius: '8px',
  border: '1px solid var(--border-color, #ccc)',
  backgroundColor: '#000',
} as const

// ---- I3: three throws ----
export function ThreeThrowsDrawing() {
  return (
    <svg
      width={720}
      height={300}
      viewBox="0 0 720 300"
      style={svgStyle}
      role="img"
      aria-label="Three throws of a ball from the same spot on a planet: a gentle throw that lands close, a harder throw that goes higher and lands farther, and the fastest throw that keeps climbing and never comes back."
    >
      <rect x={0} y={0} width={720} height={300} fill="#0b1020" />
      {/* the ground: the top of a large planet */}
      <path d="M 0 262 Q 360 236 720 262 L 720 300 L 0 300 Z" fill="#334155" />
      <text x={330} y={288} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        The ground (the top of a planet)
      </text>
      <circle cx={70} cy={247} r={6} fill="#fef08a" />
      <text x={70} y={279} fontSize="12" fill="#fef08a" textAnchor="middle">
        Thrower
      </text>
      {/* gentle throw */}
      <path d="M 76 245 Q 130 160 190 250" fill="none" stroke={TEAL} strokeWidth={3} />
      <text x={190} y={222} fontSize="12" fontWeight="bold" fill={TEAL}>
        Gentle throw
      </text>
      <text x={190} y={238} fontSize="11" fill={TEAL}>
        comes back down close by
      </text>
      {/* harder throw */}
      <path d="M 76 245 Q 260 30 470 252" fill="none" stroke={AMBER} strokeWidth={3} />
      <text x={400} y={150} fontSize="12" fontWeight="bold" fill={AMBER}>
        Harder throw
      </text>
      <text x={400} y={166} fontSize="11" fill={AMBER}>
        goes higher and lands farther away
      </text>
      {/* fastest throw */}
      <path d="M 76 245 Q 330 40 690 20" fill="none" stroke={PINK} strokeWidth={3} strokeDasharray="1 0" />
      <polygon points="702,18 684,10 686,28" fill={PINK} />
      <text x={470} y={98} fontSize="12" fontWeight="bold" fill={PINK}>
        Fastest throw
      </text>
      <text x={470} y={114} fontSize="11" fill={PINK}>
        keeps climbing and never comes back
      </text>
      <text x={360} y={22} fontSize="12" fill={MUTED_COLOR} textAnchor="middle">
        Not to scale
      </text>
    </svg>
  )
}

// ---- I4: same lump, two sizes ----
// Dots are placed on a sunflower spiral so the picture is the same every time it is drawn.
function dotsIn(cx: number, cy: number, radius: number, count: number): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const r = radius * 0.86 * Math.sqrt((i + 0.5) / count)
    const a = i * golden
    out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  }
  return out
}

export function ConcentratedDrawing() {
  const foam = dotsIn(120, 120, 80, 8)
  const lead = dotsIn(360, 120, 80, 48)
  const squeezed = dotsIn(600, 120, 32, 48)
  return (
    <svg
      width={720}
      height={250}
      viewBox="0 0 720 250"
      style={svgStyle}
      role="img"
      aria-label="Three balls. A foam ball with a few dots of matter in it, a lead ball of the same size with many dots, and the same lump of lead squeezed into a much smaller ball, so the same dots are packed closer together."
    >
      <rect x={0} y={0} width={720} height={250} fill="#0b1020" />
      <circle cx={120} cy={120} r={80} fill="#1e293b" stroke={TEXT_COLOR} strokeWidth={2} />
      {foam.map((d, i) => (
        <circle key={`f${i}`} cx={d.x} cy={d.y} r={4} fill="#fef08a" />
      ))}
      <circle cx={360} cy={120} r={80} fill="#1e293b" stroke={TEXT_COLOR} strokeWidth={2} />
      {lead.map((d, i) => (
        <circle key={`l${i}`} cx={d.x} cy={d.y} r={4} fill="#fef08a" />
      ))}
      <circle cx={600} cy={120} r={32} fill="#1e293b" stroke={TEXT_COLOR} strokeWidth={2} />
      {squeezed.map((d, i) => (
        <circle key={`s${i}`} cx={d.x} cy={d.y} r={2.2} fill="#fef08a" />
      ))}
      <text x={120} y={226} fontSize="12" fontWeight="bold" fill={TEXT_COLOR} textAnchor="middle">
        Foam ball
      </text>
      <text x={120} y={242} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
        little matter in this space
      </text>
      <text x={360} y={226} fontSize="12" fontWeight="bold" fill={TEXT_COLOR} textAnchor="middle">
        Lead ball, same size
      </text>
      <text x={360} y={242} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
        much more matter in it
      </text>
      <text x={600} y={226} fontSize="12" fontWeight="bold" fill={TEXT_COLOR} textAnchor="middle">
        The same lead, squeezed
      </text>
      <text x={600} y={242} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
        same amount, far smaller
      </text>
      <text x={240} y={124} fontSize="22" fill={MUTED_COLOR} textAnchor="middle">
        →
      </text>
      <text x={480} y={124} fontSize="22" fill={MUTED_COLOR} textAnchor="middle">
        →
      </text>
    </svg>
  )
}

// ---- I6: same mass, different closeness (the hill) ----
// The hill around a mass of 4 (relative units): depth = 4 ÷ distance, steepness (the pull) = 4 ÷ distance². Cut through the centre and drawn
// only outside the balls, because inside a real ball the hill looks different.
const HILL_MASS = 4
const HILL_R_MIN = 0.8
const HILL_R_MAX = 7.2
const hillX = (r: number) => 70 + ((r - HILL_R_MIN) / (HILL_R_MAX - HILL_R_MIN)) * 620
const hillY = (r: number) => 60 + hillDepthAt(HILL_MASS, r) * 46
const hillPull = (r: number) => pullAt(HILL_MASS, r)

function Tangent({ r, color }: { r: number; color: string }) {
  const dr = 0.28
  const slopePx = -pullAt(HILL_MASS, r) * 46 // pixels of height per unit of distance
  const x0 = hillX(r - dr)
  const x1 = hillX(r + dr)
  const y0 = hillY(r) - slopePx * dr
  const y1 = hillY(r) + slopePx * dr
  return <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={4} strokeLinecap="round" />
}

export function HillDrawing() {
  const curve: string[] = []
  for (let r = HILL_R_MIN; r <= HILL_R_MAX + 1e-9; r += 0.05) curve.push(`${hillX(r).toFixed(1)},${hillY(r).toFixed(1)}`)
  const rSqueezed = 1
  const rLead = 2
  const rFar = 6
  return (
    <svg
      width={720}
      height={330}
      viewBox="0 0 720 330"
      style={svgStyle}
      role="img"
      aria-label="A side view of the hill of gravity around one mass, deepest near the centre and flattening out far away, with three marked places: the surface of the squeezed ball, the surface of the larger lead ball, and far away, where the hill is nearly flat and is the same for both."
    >
      <rect x={0} y={0} width={720} height={330} fill="#0b1020" />
      {/* the level far away, and the centre */}
      <line x1={70} y1={60} x2={700} y2={60} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="5 4" />
      <text x={700} y={50} fontSize="11" fill={MUTED_COLOR} textAnchor="end">
        Level of the ground very far away
      </text>
      <line x1={70} y1={60} x2={70} y2={300} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="5 4" />
      <text x={78} y={318} fontSize="11" fill={MUTED_COLOR}>
        Centre of the mass
      </text>
      <text x={12} y={20} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The hill around a mass of 4 (relative units)
      </text>
      <text x={12} y={36} fontSize="11" fill={MUTED_COLOR}>
        Lower on the picture means a deeper hill and a harder climb out.
      </text>
      {/* the hill */}
      <polyline points={curve.join(' ')} fill="none" stroke={BLUE} strokeWidth={3} />
      {/* the three places */}
      <Tangent r={rSqueezed} color={PINK} />
      <circle cx={hillX(rSqueezed)} cy={hillY(rSqueezed)} r={6} fill="#0b1020" stroke={PINK} strokeWidth={3} />
      <line x1={hillX(rSqueezed) + 6} y1={hillY(rSqueezed) + 4} x2={150} y2={268} stroke={PINK} strokeWidth={1} />
      <text x={150} y={268} fontSize="12" fontWeight="bold" fill={PINK}>
        Surface of the squeezed ball
      </text>
      <text x={150} y={284} fontSize="11" fill={PINK}>
        1 unit from the centre. Steepness (the pull) = 4 ÷ 1² = {hillPull(rSqueezed)}
      </text>
      <text x={150} y={299} fontSize="11" fill={PINK}>
        four times steeper than at the lead ball
      </text>
      <Tangent r={rLead} color={AMBER} />
      <circle cx={hillX(rLead)} cy={hillY(rLead)} r={6} fill="#0b1020" stroke={AMBER} strokeWidth={3} />
      <line x1={hillX(rLead) + 4} y1={hillY(rLead) + 7} x2={260} y2={190} stroke={AMBER} strokeWidth={1} />
      <text x={260} y={190} fontSize="12" fontWeight="bold" fill={AMBER}>
        Surface of the lead ball
      </text>
      <text x={260} y={206} fontSize="11" fill={AMBER}>
        2 units from the centre. Steepness = 4 ÷ 2² = {hillPull(rLead)}
      </text>
      <Tangent r={rFar} color={TEAL} />
      <circle cx={hillX(rFar)} cy={hillY(rFar)} r={6} fill="#0b1020" stroke={TEAL} strokeWidth={3} />
      <line x1={hillX(rFar)} y1={hillY(rFar) + 7} x2={hillX(rFar)} y2={138} stroke={TEAL} strokeWidth={1} />
      <text x={708} y={150} fontSize="12" fontWeight="bold" fill={TEAL} textAnchor="end">
        Far away: the same for both balls
      </text>
      <text x={708} y={166} fontSize="11" fill={TEAL} textAnchor="end">
        6 units from the centre. Steepness = 4 ÷ 6² = {hillPull(rFar).toFixed(2)} (nearly flat)
      </text>
    </svg>
  )
}

// ---- I5: your route through this page ----
const ROUTE: Array<{ n: number; title: string; sub: string; tag: string; color: string }> = [
  { n: 1, title: 'Guess', sub: 'three guesses', tag: 'Part 1', color: AMBER },
  { n: 2, title: 'Watch', sub: 'three launches', tag: 'Part 1', color: AMBER },
  { n: 3, title: 'Try your own', sub: 'choose a mass', tag: 'Part 2', color: PINK },
  { n: 4, title: 'Talk it over', sub: 'with the tutor', tag: 'Part 4', color: BLUE },
  { n: 5, title: 'Field guide', sub: 'real black holes', tag: 'after the tutor', color: VIOLET },
]

export function RouteStrip() {
  const w = 124
  const gap = 18
  return (
    <svg
      width={720}
      height={130}
      viewBox="0 0 720 130"
      style={svgStyle}
      role="img"
      aria-label="Your route through this page in five steps: guess, watch three launches, try your own mass, talk it over with the tutor, then the black hole field guide."
    >
      <rect x={0} y={0} width={720} height={130} fill="#0b1020" />
      {ROUTE.map((s, i) => {
        const x = 8 + i * (w + gap)
        return (
          <g key={s.n}>
            <rect x={x} y={20} width={w} height={90} rx={10} fill="#111a33" stroke={s.color} strokeWidth={2.5} />
            <circle cx={x + 18} cy={40} r={11} fill={s.color} />
            <text x={x + 18} y={45} fontSize="13" fontWeight="bold" fill="#0b1020" textAnchor="middle">
              {s.n}
            </text>
            <text x={x + w / 2} y={72} fontSize="14" fontWeight="bold" fill={TEXT_COLOR} textAnchor="middle">
              {s.title}
            </text>
            <text x={x + w / 2} y={89} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
              {s.sub}
            </text>
            <text x={x + w / 2} y={104} fontSize="10" fill={s.color} textAnchor="middle">
              {s.tag}
            </text>
            {i < ROUTE.length - 1 && (
              <text x={x + w + gap / 2} y={70} fontSize="18" fill={MUTED_COLOR} textAnchor="middle">
                →
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ---- the introduction ----
export function BlackHoleIntro() {
  return (
    <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
      <p style={paragraph}>
        <strong>Look at this picture.</strong> It is real. It is not a painting or a computer game. It shows the surroundings of a black
        hole in a galaxy called M87, 55 million light-years from Earth, and it was shown to the world on 10 April 2019. The glowing ring is
        hot gas. The dark patch in the middle is the thing this whole page is about. By the end you will know what you are looking at, and
        you will have worked out for yourself why nothing is visible there.
      </p>
      <Figure
        caption={
          <>
            <strong>M87*</strong> (say &ldquo;M-87-star&rdquo;), the black hole at the centre of the galaxy M87, as seen by the Event Horizon
            Telescope. It has a mass 6.5 billion times that of the Sun.
          </>
        }
        credit="Image: EHT Collaboration (CC BY 4.0), via ESO."
      >
        <img
          src={M87_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas, brighter at the bottom, around a dark patch in the middle, on a black background."
          width={1280}
          height={746}
          style={imgStyle}
        />
      </Figure>

      <p style={paragraph}>
        <strong>The question.</strong> Imagine squeezing the whole Sun into a ball a few kilometres across: smaller than a city. Squeeze
        it that much and gravity near it becomes ferocious. This experiment asks one simple, big question: can a lump of matter ever be
        squeezed so tightly that its pull becomes too strong to get away from, even at the greatest speed there is?
      </p>
      <p style={paragraph}>
        <strong>Concentrated</strong> means how much stuff is packed into a space. A golf-ball-sized lump of lead is far more
        concentrated than a foam ball of the same size, because it has much more matter packed into the same space. Now imagine the lead
        ball squeezed to the size of a pea. It is the same amount of lead, but much more concentrated.
      </p>
      <Figure
        caption={
          <>
            <strong>Same size, different concentration</strong> (left and middle), and the same lump squeezed smaller (right). Each dot
            stands for a little matter. The balls are not to scale. Far away, all three would pull exactly alike. They differ only in how
            near you can stand to their centre. This drawing was made for this page.
          </>
        }
      >
        <ConcentratedDrawing />
      </Figure>
      <p style={paragraph}>
        <strong>Does the squeezed ball pull harder?</strong> Not from far away. Squeezing does not add any mass, so from a distance the two
        balls pull exactly alike. The difference is how close you can get. You can stand much nearer the centre of the squeezed ball, and
        the closer you are to a mass, the harder it pulls: halve your distance and the pull becomes four times stronger. It is like a
        loudspeaker: it sounds the same from far away, and very different right beside it. That is why this experiment keeps the launch
        distance the same every time, so that only the mass changes.
      </p>

      <p style={paragraph}>
        <strong>Words first.</strong> Four ideas will come up, so here they are in plain words.
      </p>
      <ul style={{ ...listStyle, marginBottom: '0.75rem' }}>
        <li>
          <strong>Gravity is like a hill.</strong> Every mass makes a kind of hill around itself. The hill is deepest at the very centre
          and gets gentler as you go farther out. Two things decide how hard it is to climb out: <strong>how big the mass is</strong> (a
          bigger mass makes a deeper, steeper hill) and <strong>how close to the centre you start</strong> (starting near the bottom
          means a longer, steeper climb than starting far up the slope). This is only a way of picturing it. Nothing here is a real
          hill.
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.6rem 0.8rem',
              borderLeft: '4px solid #60a5fa',
              backgroundColor: 'rgba(96, 165, 250, 0.08)',
              borderRadius: '4px',
            }}
          >
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>A question to try: two objects, the same mass, one big and one squeezed small. If you stand the same distance
              from each, is the pull of gravity the same?</strong>
            </p>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>Yes, if you measure the distance from the centre of each, and you are standing outside both.</strong> The pull
              depends on two things only: the mass, and how far you are from the centre. It does not depend on how big the object is.
              The hill you stand on is the same hill for both. Stand 6 units from the centre of each and the steepness is{' '}
              {HILL_MASS} &divide; 6&sup2; = {pullAt(HILL_MASS, 6).toFixed(2)} for the big one and for the squeezed one alike.
            </p>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>Why?</strong> Every bit of matter pulls on you, each from its own place. For a ball-shaped object, all those
              little pulls add up to exactly the pull you would feel if all the matter were gathered at one point at the centre. That is
              why only the mass and the distance from the centre count, and why the size drops out. (This is a well-known result,
              first worked out by Isaac Newton. NASA says the same about black holes: from far enough away, their pull is just like that
              of any other object of the same mass.)
            </p>
            <p style={{ margin: '0 0 0.5rem' }}>
              <strong>So when would the pull be different? Two cases.</strong>
            </p>
            <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>If you measure from the surface instead of the centre.</strong> Say the big ball has a radius of 2 and the
                squeezed one a radius of 1, both with a mass of {HILL_MASS}. Stand 2 units from the <em>surface</em> of each. That is 4 units
                from the big ball&rsquo;s centre, so the steepness is {HILL_MASS} &divide; 4&sup2; = {pullAt(HILL_MASS, 4).toFixed(2)}. It is
                only 3 units from the squeezed ball&rsquo;s centre, so the steepness is {HILL_MASS} &divide; 3&sup2; ={' '}
                {pullAt(HILL_MASS, 3).toFixed(2)}. The squeezed ball pulls harder here, but not because it is squeezed: you are closer to
                its centre.
              </li>
              <li>
                <strong>If you go inside the big ball.</strong> Inside, only some of the matter is pulling you inwards, and the hill
                changes shape. This page does not go inside, so the drawings below show only places outside the balls.
              </li>
            </ul>
            <p style={{ margin: 0 }}>
              <strong>The lesson:</strong> squeezing a mass does not change its pull at any distance from the centre that was already
              outside it. What squeezing does is let you stand much nearer the centre, where the hill is far steeper.
            </p>
          </div>
        </li>
        <li>
          <strong>Escape speed</strong> is that starting speed. Throw a ball up gently and it comes back down. Throw it harder and it goes
          higher before it returns. At the escape speed it never returns: it keeps climbing out of the hill for ever.
        </li>
        <li>
          <strong>The speed of light</strong> is the fastest speed anything can have. Experiment 5 of &ldquo;Relativity of Time and
          Motion&rdquo; showed that nothing can go faster.
        </li>
        <li>
          <strong>Probe</strong> means a small test object that we launch, to see what the gravity does to it. It can stand for anything,
          including a flash of light.
        </li>
      </ul>
      <Figure
        caption={
          <>
            <strong>The hill around one mass, with three places marked.</strong> The curve is the hill around a mass of 4 (relative
            numbers, not real ones), cut through the centre and drawn only outside the balls, because inside a real ball the hill looks
            different and this drawing leaves that part out. The steeper the hill at a spot, the harder gravity pulls there, and the short
            line at each marker shows how steep it is. Pull here is the mass divided by the distance squared. The squeezed ball&rsquo;s
            surface is 1 unit from the centre and the lead ball&rsquo;s is 2 units, so at its own surface the squeezed ball pulls four
            times as hard, with the same mass. Far away, at 6 units, both pull alike. This drawing was made for this page.
          </>
        }
      >
        <HillDrawing />
      </Figure>
      <Figure
        caption={
          <>
            <strong>Three throws from the same spot.</strong> The gentle throw lands close. The harder throw lands farther away. The
            fastest throw never comes back. The speeds are only labelled &ldquo;gentle&rdquo;, &ldquo;harder&rdquo; and
            &ldquo;fastest&rdquo;, because this drawing is about the idea, not about numbers. It was made for this page.
          </>
        }
      >
        <ThreeThrowsDrawing />
      </Figure>

      <p style={paragraph}>
        <strong>How this page is laid out.</strong> Below this introduction the page is in four sections, called Parts, each with a
        coloured heading. In Part 1 you make guesses and watch three launches. In Part 2 you choose the mass yourself. Part 3 shows the
        results, and Part 4 is the tutor, who talks it over with you. After that comes a black hole field guide, with real black holes,
        real pictures and links.
      </p>
      <p style={paragraph}>
        <strong>What happens.</strong> You decide how heavy a central object is. A probe is launched straight outward from the same height
        above it every time, so only the mass changes. It is launched at the speed of light, the fastest launch possible. You watch
        whether it gets away or falls back.
      </p>
      <p style={paragraph}>
        <strong>Your job.</strong> First guess what happens for a very light mass, for a very heavy mass, and whether anything special
        happens somewhere in between. Then watch three launches, and then try masses of your own.
      </p>
      <Figure caption={<>Your route through this page. The Parts are the coloured sections below.</>}>
        <RouteStrip />
      </Figure>

      <p style={paragraph}>
        <strong>Real black holes are real.</strong> Astronomers have photographed the glowing gas around two black holes, using radio
        telescopes all over the Earth working together as one giant telescope. You have just seen the first, M87*. This is the second:
        <strong> Sagittarius A*</strong> (say &ldquo;A-star&rdquo;), at the centre of our own Milky Way, shown on 12 May 2022. It is four
        million times more massive than our Sun and about 27,000 light-years away. As seen from Earth, it appears about the same size in
        the sky as a doughnut on the Moon. Its gas goes round it in minutes, so it was changing quickly while the telescopes watched, and
        the picture is an average of many images.
      </p>
      <Figure
        caption={
          <>
            <strong>Sagittarius A*</strong>, the black hole at the centre of the Milky Way, as seen by the Event Horizon Telescope.
          </>
        }
        credit="Image: EHT Collaboration (CC BY 4.0), via ESO."
      >
        <img
          src={SGRA_IMAGE}
          alt="A blurry ring of orange and yellow glowing gas with two bright patches, around a dark patch in the middle, on a dark red background."
          width={1280}
          height={1280}
          style={{ ...imgStyle, maxWidth: '420px' }}
        />
      </Figure>
      <p style={paragraph}>
        Near the end of this page, a field guide tells the story of both pictures and links to the people who made them. For now, notice
        only that this experiment is a simplified version of the reasoning that first led people to wonder whether such objects could
        exist.
      </p>

      <p style={paragraph}>
        <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures or the numbers: they come from a
        calculation that knows nothing about what you guessed. Your guesses are drawn on the graph in white, each in a box labelled YOUR
        GUESS, and they are shown again beside the results. In Part 2 the mass you choose does change the drawing, and what it changes is
        drawn in pink.
      </p>
      <p style={paragraph}>
        <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one with a short plain meaning: escape
        speed, speed of light, probe, concentrated, relative units, top view. Three more, event horizon, black hole and the escape-speed
        formula, are added to it after you have watched all three launches.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What we assume.</strong>
      </p>
      <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
        <li>
          This uses ordinary gravity, like Experiments 2, 3, 5 and 6 of this chapter, not the exact general relativity a real black hole
          needs.
        </li>
        <li>
          The mass, distance and speed of light in the probe model are relative, made-up amounts, not real numbers. The field guide at the
          end uses real numbers and says so each time.
        </li>
        <li>The probe goes straight outward, not sideways. Orbits were Experiment 6.</li>
        <li>The central mass does not move.</li>
      </ul>
    </div>
  )
}
