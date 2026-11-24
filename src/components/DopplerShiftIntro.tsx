import type { CSSProperties, ReactNode } from 'react'
import { DEFAULT_SOURCE_NM, VISIBLE_MAX_NM, VISIBLE_MIN_NM } from '../physics/dopplerShift'
import { HALO, LAB_COLOR, MUTED_COLOR, SVG_STYLE, TEXT_COLOR, TRAVELER_COLOR, colorOfWavelength } from './DopplerShiftPictures'

// Spacetime Geometry 8: the introduction (with four drawings), the "Words and formulas" entries and the "Want to know more?" links. Rebuilt in the audit of 2026-11-23 from
// docs/audit/spacetime-geometry/08-draft-wording.md, sections 1 and 7 (approved by the owner on 2026-11-23, CLAUDE.md §28.1). Nothing here says whether, or which way, a color
// shifts (that is what the predictions ask, §12): the drawings show only waves, frequency, wavelength, counting crests and the setup. The siren picture is in the tutor.

export const PART_ONE_SPEED = 0.6

const small: CSSProperties = { fontSize: '0.875rem', color: 'var(--text-muted)' }
const para: CSSProperties = { marginTop: 0, marginBottom: '0.75rem' }
const figCaption: CSSProperties = { fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.4rem 0 1rem' }

// Terms the introduction defines, repeated in the "Words and formulas" box with no new claims.
export const REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  {
    term: 'Electric field and magnetic field',
    meaning:
      'a field is a number given to every point of space. The electric field says how hard a tiny electric charge placed there would be pushed. The magnetic field says how hard a tiny magnet, such as a compass needle, would be turned there. In a light wave, both rise and fall together. In empty space, far from where the light was made, they are at right angles to each other and to the way the wave travels.',
  },
  {
    term: 'Transverse wave',
    meaning: 'a wave whose wiggle is sideways to the way it travels, like a rope shaken up and down. A light wave in empty space is a transverse wave. Sound is not: the air is pushed forwards and backwards along the way the sound travels.',
  },
  { term: 'Crest and trough', meaning: 'the highest part of a wave is a crest, and the lowest part is a trough. A light wave is a string of evenly spaced crests.' },
  {
    term: 'Doppler effect',
    meaning: 'the change in the frequency of a wave that an observer measures because the observer, or the source, is moving. A siren is the everyday example. This experiment asks whether it happens to light.',
  },
  { term: 'Lab observer and traveler', meaning: 'the lab observer is at rest relative to the stars. The traveler flies through the middle of the ring of stars at a steady speed.' },
  {
    term: 'Direction of travel and the angle θ',
    meaning:
      'the direction of travel is the way the traveler is moving, drawn as an arrow. θ (the Greek letter “theta”) is how far a star is from straight ahead, in degrees: 0° is straight ahead, 90° is exactly sideways, 180° is straight behind. (As in Experiment 7.)',
  },
  { term: 'Speed written as 0.6c', meaning: 'a fraction of the speed of light, c. 0.6c is six tenths of the speed of light.' },
  {
    term: 'Frequency',
    meaning: 'how many wave crests pass you each second (or each tick of your clock). A siren of high pitch has a high frequency. For light, a higher frequency is a bluer color and a lower frequency is a redder one.',
  },
  {
    term: 'Wavelength and nanometres',
    meaning:
      'the distance between two crests of a wave. A higher frequency means a shorter wavelength. Wavelengths of light are written in nanometres (nm), where one nanometre is one billionth of a metre.',
  },
  {
    term: 'Visible, ultraviolet and infrared',
    meaning:
      'the colors the eye can see run from about 400 nm (violet) to about 700 nm (red). Light with a wavelength shorter than that is called ultraviolet, and longer is called infrared. The eye cannot see either, so the pictures mark them with the letters UV and IR instead of a color.',
  },
  {
    term: 'Shifted toward blue, shifted toward red',
    meaning:
      'a measured light has a higher frequency than before (shifted toward blue, also called blueshift) or a lower frequency than before (shifted toward red, also called redshift). Redshift is the word used in Experiment 2 of Gravity and Curved Spacetime and in Experiment 5 of Gravitational Waves.',
  },
  { term: 'The shift factor f′ ÷ f', meaning: 'the frequency the traveler measures divided by the frequency the lab measures for the same light. 2.00 means twice the frequency, and 0.50 means half.' },
  { term: 'Ray of starlight', meaning: 'the thin beam of light that travels from a star to an observer.' },
  { term: 'The star we follow', meaning: 'the star the lab sees exactly sideways. It is marked with a yellow ring in both pictures, so you can find it in each.' },
  {
    term: 'Wedge',
    meaning:
      'a slice of the sky. The striped wedge is every direction within 30° of straight ahead, and the dotted wedge is every direction within 30° of straight behind. The number beside each is how many stars fall inside it.',
  },
  { term: 'The number D', meaning: 'D = √(1 − speed²), the time dilation factor of Experiment 3. At 0.6c, D = √(1 − 0.36) = 0.8.' },
  {
    term: 'The spectrum bar, the white mark and the orange ring',
    meaning:
      'the spectrum bar is a ruler for wavelengths. A white mark with a YOUR GUESS box is your own guess, drawn on the real picture. It never changes the picture. The orange dashed ring marks the star straight ahead, and the yellow ring marks the star we follow.',
  },
]

// Added to the box only once a run has ended, because the formula and the everyday factor show which way a color shifts (§12).
export const FORMULA_ENTRIES: { term: string; meaning: string }[] = [
  {
    term: 'The shift factor formula',
    meaning:
      'f′ ÷ f = (1 + β cos θ) ÷ D, where θ is the lab’s angle for the star, β is the traveler’s speed as a fraction of c, cos is a number between 1 (straight ahead) and −1 (straight behind), and D = √(1 − β²) is the time dilation factor of Experiment 3. Example 1: β = 0.6, so D = 0.8. For the star the lab sees sideways, cos 90° = 0, so f′ ÷ f = 1 ÷ 0.8 = 1.25, and its wavelength is 550 ÷ 1.25 = 440 nm. Example 2: for the star straight ahead, cos 0° = 1, so f′ ÷ f = 1.6 ÷ 0.8 = 2.00, and its wavelength is 550 ÷ 2.00 = 275 nm. The stars have not changed color; each observer measures the light that reaches them.',
  },
  {
    term: 'The everyday factor',
    meaning:
      '1 + β cos θ: what simply counting crests would give if the traveler’s clock ran at the same rate as the lab’s. For the star the lab sees sideways it is 1.00 at every speed. The real factor is the everyday factor divided by D.',
  },
]

// ---- The four drawings of the introduction. None shows a color changing.
const D_TEXT = { fill: TEXT_COLOR, style: HALO } as const

// Drawing A: a wave and its parts.
function WaveDrawing() {
  const wl = 110
  const crestX = (k: number) => 60 + k * wl
  const points: string[] = []
  for (let x = 20; x <= 630; x += 5) points.push(`${x},${100 - 40 * Math.cos((2 * Math.PI * (x - 60)) / wl)}`)
  return (
    <svg viewBox="0 0 650 190" style={SVG_STYLE} role="img" aria-label="Drawing A. A wave with five crests, evenly spaced. One crest, one trough and the wavelength, the distance from one crest to the next, are labelled. The wave travels to the right.">
      <text x="14" y="26" fontSize="18" fontWeight="bold" {...D_TEXT}>
        Drawing A: a wave and its parts
      </text>
      <polyline points={points.join(' ')} fill="none" stroke={LAB_COLOR} strokeWidth="3" />
      {[0, 1, 2, 3, 4].map((k) => (
        <circle key={k} cx={crestX(k)} cy="60" r="5" fill={TEXT_COLOR} />
      ))}
      <text x={crestX(0)} y="52" fontSize="16" textAnchor="middle" {...D_TEXT}>
        crest
      </text>
      <text x={crestX(0) + wl / 2} y="168" fontSize="16" textAnchor="middle" {...D_TEXT}>
        trough
      </text>
      <circle cx={crestX(0) + wl / 2} cy="140" r="5" fill={MUTED_COLOR} />
      <line x1={crestX(2)} y1="46" x2={crestX(3)} y2="46" stroke={TEXT_COLOR} strokeWidth="2" />
      <line x1={crestX(2)} y1="40" x2={crestX(2)} y2="52" stroke={TEXT_COLOR} strokeWidth="2" />
      <line x1={crestX(3)} y1="40" x2={crestX(3)} y2="52" stroke={TEXT_COLOR} strokeWidth="2" />
      <text x={(crestX(2) + crestX(3)) / 2} y="36" fontSize="16" textAnchor="middle" {...D_TEXT}>
        wavelength
      </text>
      <line x1="470" y1="170" x2="600" y2="170" stroke={TEXT_COLOR} strokeWidth="2.5" />
      <path d="M 600 164 L 612 170 L 600 176 Z" fill={TEXT_COLOR} />
      <text x="535" y="160" fontSize="15" textAnchor="middle" {...D_TEXT}>
        the wave travels this way
      </text>
    </svg>
  )
}

// Drawing B: short and long wavelength, and the strip of colors.
const B_LEFT = 40
const B_RIGHT = 610
const bx = (nm: number) => B_LEFT + ((nm - 300) / 500) * (B_RIGHT - B_LEFT)

function WavelengthDrawing() {
  const wave = (wl: number, y: number) => {
    const pts: string[] = []
    for (let x = 30; x <= 620; x += 3) pts.push(`${x},${y - 18 * Math.cos((2 * Math.PI * (x - 30)) / wl)}`)
    return pts.join(' ')
  }
  const slices = []
  for (let nm = VISIBLE_MIN_NM; nm < VISIBLE_MAX_NM; nm += 2) slices.push(<rect key={nm} x={bx(nm)} y="250" width={bx(nm + 2) - bx(nm) + 0.5} height="30" fill={colorOfWavelength(nm + 1)} />)
  return (
    <svg
      viewBox="0 0 650 345"
      style={SVG_STYLE}
      role="img"
      aria-label="Drawing B. Two waves: the top one has crests close together, a short wavelength and a high frequency. The lower one has crests far apart, a long wavelength and a low frequency. Below them is a strip of wavelengths from 300 to 800 nanometres: ultraviolet to the left, the visible colors from 400 to 700, infrared to the right, with 550 nanometres marked."
    >
      <defs>
        <pattern id="intro-uv" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#1e1b4b" />
          <line x1="0" y1="0" x2="0" y2="8" stroke={MUTED_COLOR} strokeWidth="2" strokeOpacity="0.7" />
        </pattern>
        <pattern id="intro-ir" width="9" height="9" patternUnits="userSpaceOnUse">
          <rect width="9" height="9" fill="#2a1414" />
          <circle cx="4.5" cy="4.5" r="1.8" fill={MUTED_COLOR} fillOpacity="0.8" />
        </pattern>
      </defs>
      <text x="14" y="24" fontSize="18" fontWeight="bold" {...D_TEXT}>
        Drawing B: wavelength, frequency and color
      </text>
      <polyline points={wave(60, 62)} fill="none" stroke={TRAVELER_COLOR} strokeWidth="2.5" />
      <text x="14" y="98" fontSize="15" {...D_TEXT}>
        short wavelength: crests close together, so many pass each second
      </text>
      <text x="14" y="116" fontSize="15" {...D_TEXT}>
        (a high frequency), toward the violet end
      </text>
      <polyline points={wave(150, 156)} fill="none" stroke={TRAVELER_COLOR} strokeWidth="2.5" />
      <text x="14" y="192" fontSize="15" {...D_TEXT}>
        long wavelength: crests far apart, so few pass each second
      </text>
      <text x="14" y="210" fontSize="15" {...D_TEXT}>
        (a low frequency), toward the red end
      </text>
      <rect x={B_LEFT} y="250" width={bx(VISIBLE_MIN_NM) - B_LEFT} height="30" fill="url(#intro-uv)" />
      {slices}
      <rect x={bx(VISIBLE_MAX_NM)} y="250" width={B_RIGHT - bx(VISIBLE_MAX_NM)} height="30" fill="url(#intro-ir)" />
      <rect x={B_LEFT} y="250" width={B_RIGHT - B_LEFT} height="30" fill="none" stroke={MUTED_COLOR} strokeWidth="1.5" />
      <text x={(B_LEFT + bx(VISIBLE_MIN_NM)) / 2} y="271" fontSize="16" fontWeight="bold" textAnchor="middle" {...D_TEXT}>
        UV
      </text>
      <text x={(bx(VISIBLE_MAX_NM) + B_RIGHT) / 2} y="271" fontSize="16" fontWeight="bold" textAnchor="middle" {...D_TEXT}>
        IR
      </text>
      <text x={(bx(VISIBLE_MIN_NM) + bx(VISIBLE_MAX_NM)) / 2} y="244" fontSize="15" textAnchor="middle" {...D_TEXT}>
        visible, about 400 to 700 nm
      </text>
      {[VISIBLE_MIN_NM, 500, 600, VISIBLE_MAX_NM].map((nm) => (
        <text key={nm} x={bx(nm)} y="298" fontSize="14" textAnchor="middle" fill={MUTED_COLOR} style={HALO}>
          {nm}
        </text>
      ))}
      <line x1={bx(DEFAULT_SOURCE_NM)} y1="246" x2={bx(DEFAULT_SOURCE_NM)} y2="306" stroke={LAB_COLOR} strokeWidth="3" />
      <text x={bx(DEFAULT_SOURCE_NM)} y="322" fontSize="15" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        {DEFAULT_SOURCE_NM} nm: the color every star sends out
      </text>
      <text x="14" y="338" fontSize="13" fill={MUTED_COLOR} style={HALO}>
        UV: shorter than the eye can see. IR: longer than the eye can see.
      </text>
    </svg>
  )
}

// Drawing C: counting crests per tick of a clock. It says only that more crests per tick means a higher frequency; it does not say who counts more.
function CountingDrawing() {
  const row = (y: number, spacing: number, count: number, label: string, tint: string) => {
    const x0 = 60
    const width = spacing * count
    return (
      <g>
        <line x1="20" y1={y} x2="470" y2={y} stroke={MUTED_COLOR} strokeWidth="1.5" />
        {Array.from({ length: 11 }, (_, i) => {
          const x = x0 + i * spacing
          return x < 460 ? <line key={i} x1={x} y1={y - 16} x2={x} y2={y + 16} stroke={tint} strokeWidth="3" /> : null
        })}
        <rect x={x0 - spacing / 2} y={y - 26} width={width} height="52" fill="none" stroke={TEXT_COLOR} strokeWidth="2" strokeDasharray="5 3" rx="4" />
        <text x={x0 - spacing / 2} y={y - 32} fontSize="15" {...D_TEXT}>
          1 tick of the observer’s clock
        </text>
        <text x="490" y={y + 5} fontSize="16" fontWeight="bold" {...D_TEXT}>
          {label}
        </text>
      </g>
    )
  }
  return (
    <svg
      viewBox="0 0 650 235"
      style={SVG_STYLE}
      role="img"
      aria-label="Drawing C. Two rows of crests, each row with a dashed box that is one tick of an observer's clock. In the first row 4 crests fall inside the box, so the frequency is 4. In the second row 6 crests fall inside, so the frequency is 6, which is a higher frequency, a shorter wavelength and a bluer color."
    >
      <text x="14" y="24" fontSize="18" fontWeight="bold" {...D_TEXT}>
        Drawing C: measuring a color is counting crests
      </text>
      {row(88, 40, 4, '4 crests per tick', LAB_COLOR)}
      {row(178, 27, 6, '6 crests per tick', TRAVELER_COLOR)}
      <text x="490" y="200" fontSize="14" {...D_TEXT}>
        (a higher frequency,
      </text>
      <text x="490" y="217" fontSize="14" {...D_TEXT}>
        a bluer color)
      </text>
    </svg>
  )
}

// Drawing D: the setup. Every star is the same color; nothing changes in it.
function SetupDrawing() {
  const cx = 325
  const cy = 190
  const r = 130
  const at = (deg: number, radius: number) => ({ x: cx + radius * Math.cos((deg * Math.PI) / 180), y: cy - radius * Math.sin((deg * Math.PI) / 180) })
  const starColor = colorOfWavelength(DEFAULT_SOURCE_NM)
  return (
    <svg
      viewBox="0 0 650 390"
      style={SVG_STYLE}
      role="img"
      aria-label="Drawing D. A ring of 24 stars, all the same yellow-green. At the centre, a lab observer at rest and a traveler in a spaceship with an arrow for the direction of travel, pointing right. Four stars are labelled: straight ahead at 0 degrees, sideways at 90 degrees, straight behind at 180 degrees and sideways at 270 degrees."
    >
      <text x="14" y="24" fontSize="18" fontWeight="bold" {...D_TEXT}>
        Drawing D: two observers, one ring of stars
      </text>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={MUTED_COLOR} strokeWidth="1.5" />
      {Array.from({ length: 24 }, (_, i) => {
        const p = at(i * 15, r)
        return <circle key={i} cx={p.x} cy={p.y} r={i % 6 === 0 ? 8 : 6} fill={starColor} stroke="#0b1020" strokeWidth="1.5" />
      })}
      {/* the lab observer, at rest */}
      <circle cx={cx - 38} cy={cy - 6} r="8" fill="none" stroke={LAB_COLOR} strokeWidth="2.5" />
      <line x1={cx - 38} y1={cy + 2} x2={cx - 38} y2={cy + 22} stroke={LAB_COLOR} strokeWidth="2.5" />
      <text x={cx - 38} y={cy + 42} fontSize="15" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        lab observer
      </text>
      <text x={cx - 38} y={cy + 58} fontSize="15" textAnchor="middle" fill={LAB_COLOR} style={HALO}>
        (at rest)
      </text>
      {/* the traveler */}
      <polygon points={`${cx + 30},${cy} ${cx + 8},${cy - 8} ${cx + 8},${cy + 8}`} fill={TEXT_COLOR} />
      <line x1={cx + 36} y1={cy} x2={cx + 90} y2={cy} stroke={TEXT_COLOR} strokeWidth="2.5" />
      <path d={`M ${cx + 90} ${cy - 6} L ${cx + 102} ${cy} L ${cx + 90} ${cy + 6} Z`} fill={TEXT_COLOR} />
      <text x={cx + 20} y={cy + 28} fontSize="15" textAnchor="middle" {...D_TEXT}>
        traveler
      </text>
      <text x={cx + 66} y={cy - 12} fontSize="14" textAnchor="middle" {...D_TEXT}>
        direction of travel
      </text>
      <text x={cx + r + 16} y={cy - 6} fontSize="15" {...D_TEXT}>
        straight ahead
      </text>
      <text x={cx + r + 16} y={cy + 12} fontSize="15" {...D_TEXT}>
        (0°)
      </text>
      <text x={cx - r - 16} y={cy - 6} fontSize="15" textAnchor="end" {...D_TEXT}>
        straight behind
      </text>
      <text x={cx - r - 16} y={cy + 12} fontSize="15" textAnchor="end" {...D_TEXT}>
        (180°)
      </text>
      <text x={cx} y={cy - r - 18} fontSize="15" textAnchor="middle" {...D_TEXT}>
        sideways (90°)
      </text>
      <text x={cx} y={cy + r + 28} fontSize="15" textAnchor="middle" {...D_TEXT}>
        sideways (270°)
      </text>
      <text x="14" y="378" fontSize="14" fill={MUTED_COLOR} style={HALO}>
        Every star sends out {DEFAULT_SOURCE_NM} nm, so every dot is the same color. Nothing changes in this drawing.
      </text>
    </svg>
  )
}

// Drawing A2: the two fields of a light wave, drawn at one instant. The electric field is drawn up and down; the magnetic field is drawn slanted, to stand for "in and out of the page".
function FieldsDrawing() {
  const x0 = 40
  const x1 = 560
  const y0 = 165
  const wl = 190
  const dE = (x: number) => 70 * Math.sin((2 * Math.PI * (x - x0)) / wl)
  const electric: string[] = []
  const magnetic: string[] = []
  for (let x = x0; x <= x1; x += 4) {
    const d = dE(x)
    electric.push(`${x},${y0 - d}`)
    magnetic.push(`${x + 0.55 * d},${y0 + 0.45 * d}`)
  }
  const ticks = []
  for (let x = x0 + wl / 8; x <= x1; x += wl / 8) ticks.push(x)
  return (
    <svg
      viewBox="0 0 650 330"
      style={SVG_STYLE}
      role="img"
      aria-label="Drawing A2. A light wave at one instant, travelling to the right. The electric field is drawn as a blue wave going up and down. The magnetic field is drawn as an orange wave, slanted to stand for in and out of the page. Both are zero at the same places and strongest at the same places, and they point at right angles to each other and to the direction of travel."
    >
      <text x="14" y="24" fontSize="18" fontWeight="bold" {...D_TEXT}>
        Drawing A2: the two fields of a light wave, at one instant
      </text>
      <line x1={x0} y1={y0} x2={x1 + 50} y2={y0} stroke={TEXT_COLOR} strokeWidth="2.5" />
      <path d={`M ${x1 + 50} ${y0 - 6} L ${x1 + 64} ${y0} L ${x1 + 50} ${y0 + 6} Z`} fill={TEXT_COLOR} />
      <text x="636" y="60" fontSize="15" textAnchor="end" {...D_TEXT}>
        the wave travels to the right
      </text>
      {ticks.map((x) => (
        <g key={x}>
          <line x1={x} y1={y0} x2={x} y2={y0 - dE(x)} stroke={LAB_COLOR} strokeWidth="1.5" strokeOpacity="0.7" />
          <line x1={x} y1={y0} x2={x + 0.55 * dE(x)} y2={y0 + 0.45 * dE(x)} stroke="#fb923c" strokeWidth="1.5" strokeOpacity="0.7" />
        </g>
      ))}
      <polyline points={electric.join(' ')} fill="none" stroke={LAB_COLOR} strokeWidth="3" />
      <polyline points={magnetic.join(' ')} fill="none" stroke="#fb923c" strokeWidth="3" />
      <text x="14" y="60" fontSize="15" fill={LAB_COLOR} style={HALO}>
        electric field: rises and falls up and down
      </text>
      <text x="14" y="296" fontSize="15" fill="#fb923c" style={HALO}>
        magnetic field: rises and falls in and out of the page (drawn slanted)
      </text>
      <text x="14" y="316" fontSize="13" fill={MUTED_COLOR} style={HALO}>
        Strongest and zero at the same places, at right angles to each other and to the way it travels.
      </text>
    </svg>
  )
}

// Drawing A3: a stadium wave. Each person only stands up and sits down in place; the pattern moves along the row.
function StadiumDrawing() {
  const person = (i: number, t: number, y: number) => {
    const raise = Math.max(0, Math.cos((2 * Math.PI * (i - t)) / 8))
    const x = 40 + i * 36
    const head = y - 28 * raise
    return (
      <g key={`${t}-${i}`}>
        <line x1={x} y1={y + 24} x2={x} y2={head + 8} stroke={TRAVELER_COLOR} strokeWidth="6" strokeLinecap="round" />
        <circle cx={x} cy={head} r="8" fill={TEXT_COLOR} />
        {i === 5 && <circle cx={x} cy={head} r="14" fill="none" stroke="#fb923c" strokeWidth="2.5" />}
      </g>
    )
  }
  return (
    <svg
      viewBox="0 0 650 270"
      style={SVG_STYLE}
      role="img"
      aria-label="Drawing A3. A row of people at a stadium, shown twice. In the top row a wave of standing people is on the left. A moment later, in the lower row, the same wave has moved to the right. One person is ringed in orange in both rows: that person only stands up and sits down in the same place."
    >
      <text x="14" y="24" fontSize="18" fontWeight="bold" {...D_TEXT}>
        Drawing A3: a stadium wave
      </text>
      <text x="14" y="52" fontSize="14" {...D_TEXT}>
        now
      </text>
      {Array.from({ length: 16 }, (_, i) => person(i, 2, 100))}
      <text x="14" y="152" fontSize="14" {...D_TEXT}>
        a moment later
      </text>
      {Array.from({ length: 16 }, (_, i) => person(i, 5, 200))}
      <line x1="470" y1="236" x2="590" y2="236" stroke={TEXT_COLOR} strokeWidth="2.5" />
      <path d="M 590 230 L 602 236 L 590 242 Z" fill={TEXT_COLOR} />
      <text x="530" y="256" fontSize="14" textAnchor="middle" {...D_TEXT}>
        the pattern moves this way
      </text>
      <text x="14" y="256" fontSize="14" fill="#fb923c" style={HALO}>
        orange ring: one person, sitting then standing in the same seat
      </text>
    </svg>
  )
}

function Figure({ children, caption }: { children: ReactNode; caption: string }) {
  return (
    <div style={{ margin: '0.75rem 0 0' }}>
      {children}
      <p style={figCaption}>{caption}</p>
    </div>
  )
}

export function DopplerShiftIntroduction() {
  return (
    <div style={{ marginBottom: '1.5rem', ...small }}>
      <p style={para}>
        <strong>The question.</strong> In Experiment 7 we saw that a traveler and the lab see the same stars in different directions. Does the <em>color</em> of the light change too? Light is a
        wave, and the color we see depends on how close together its crests are. Does the traveler’s own motion change what color the light has, or does a star simply have one color, whoever
        looks at it? To find out, we will use a traveler on a spaceship, because a spaceship can be given any steady speed we like.
      </p>

      <p style={para}>
        <strong>Light is a wave.</strong> Drop a pebble in a pond and rings spread out. Each ring is a <em>crest</em>, the highest part of the water, and between two crests is a low part, a{' '}
        <em>trough</em>. Light is also a wave, though nothing is going up and down like water: it is electric and magnetic strength that rises and falls. The part that matters for us is only
        this: <strong>a light wave is a string of crests, one after another, and the crests are evenly spaced.</strong>
      </p>
      <Figure caption="Drawing A shows one wave. The dots are crests, the dip between two crests is a trough, and the wavelength is the distance from one crest to the next. Nothing in it changes.">
        <WaveDrawing />
      </Figure>

      <p style={para}>
        <strong>What is waving in a light wave?</strong> In a water wave, the water itself moves up and down. In a light wave, nothing like that moves. What rises and falls is the strength of
        two invisible things called <strong>fields</strong>. A field is a number given to every point of space, like a weather map that gives the temperature at every town. The{' '}
        <strong>electric field</strong> at a point says how hard a tiny electric charge placed there would be pushed. (The little spark you sometimes get from a door handle, or a balloon that
        sticks to a wall, are everyday signs of electric pushes.) The <strong>magnetic field</strong> at a point says how hard a tiny magnet, such as a compass needle, would be turned there.
        In a light wave, both fields swing up and down together as the wave passes. In empty space, far from where the light was made, they point at right angles to each other, and both at right angles to the way the wave is travelling. In
        Drawing A, you can think of the height of the curve as the strength of the electric field at each point along the wave’s path. A crest is where the field is at its strongest in one
        direction.
      </p>
      <Figure caption="Drawing A2 shows both fields of one light wave at one instant. The blue curve is the electric field, going up and down. The orange curve is the magnetic field, going in and out of the page, which is drawn slanted so that it can be seen. The thin lines show the strength at each point. Both are strongest at the same places and zero at the same places. It is a simplified picture of one wave travelling in a straight line, and it does not say that anything changes.">
        <FieldsDrawing />
      </Figure>

      <p style={para}>
        <strong>Why the right angles?</strong> There are two reasons, and both are about empty space with no electric charges nearby. First,{' '}
        <em>neither field can point along the way the wave is travelling.</em> An electric field can only start or stop on an electric charge. In empty space there is no charge to start or stop
        it, so a field pointing along the path would have to bunch up in some places and thin out in others, and nothing is there to make it do that. So the fields have to point sideways. A wave
        whose wiggle is sideways to its direction of travel is called a <strong>transverse wave</strong>. A rope shaken up and down is the everyday example: the rope moves up and down while the
        wave runs along it. (Sound is different: the air is pushed forwards and backwards along the way the sound travels.) Second, <em>the two fields make each other, and only a right-angled
        pair can.</em> A changing electric field creates a magnetic field that circles around it, and a changing magnetic field creates an electric field that circles around it, so each new field
        comes out at right angles to the one that made it. Suppose the electric field points up. The magnetic field it creates points in or out of the page, and that magnetic field creates an
        electric field that points up or down again, which keeps the wave going forward. If the two fields were parallel, neither would create the other, and the wave could not keep itself
        going. This is true for light travelling through empty space, far from where it was made, which is the case for starlight. Very close to the source (for example near a radio aerial),
        inside metal pipes that guide waves, and in some materials, the fields are not exactly at right angles.
      </p>
      <p style={para}>
        <strong>Where does a light wave come from, and what travels?</strong> Any electric charge that is shaken back and forth sends out such a wave: for example the tiny charged particles
        that jiggle in a hot filament, or in the hot gas of the Sun. A changing electric field makes a changing magnetic field, and a changing magnetic field makes a changing electric field, so
        once a wave has started, the two keep each other going and the wave travels on its own. That is why light needs no air and no water: it crosses empty space from the stars to us. In empty
        space it travels at the speed of light, <em>c</em>, which is about 299,792 kilometres every second. Think of a stadium wave. Every person only stands up and sits down in their own
        place, and nobody runs around the stadium, yet the wave goes all the way round. What travels is the pattern. In the same way, the fields at each point only rise and fall, and the
        pattern of crests travels.
      </p>
      <Figure caption="Drawing A3 shows a stadium wave twice, a moment apart. The wave has moved to the right, but the ringed person is in the same seat both times, only standing up and sitting down. In a light wave, the fields at each point play the part of the person, and the pattern of crests is what travels.">
        <StadiumDrawing />
      </Figure>

      <p style={para}>
        <strong>The same kind of wave has many names.</strong> Radio waves, the waves in a microwave oven, Wi-Fi, infrared, visible light, ultraviolet and X-rays are all this same kind of wave.
        The only difference between them is the wavelength: radio waves have crests metres apart, and the light we see has crests only a few hundred nanometres apart. That is why this
        experiment treats ultraviolet and infrared as light too: they are the same kind of wave, only with crests too close together or too far apart for the eye. You do not need the fields for
        the rest of this page. All you need is the picture of evenly spaced crests, and the idea that the frequency is how many of them arrive each second.
      </p>

      <p style={para}>
        <strong>Frequency and wavelength.</strong> Stand still and count the crests that pass you in one second. That count is the wave’s <strong>frequency</strong>. The distance between two
        crests is its <strong>wavelength</strong>. The two go together: if the crests are packed close (a short wavelength), more of them pass you each second (a high frequency). If they are
        spread out (a long wavelength), fewer pass each second (a low frequency).
      </p>
      <p style={para}>
        <strong>Color is wavelength.</strong> The color our eyes see is set by the wavelength of the light. We write wavelengths in <strong>nanometres</strong> (nm). One nanometre is one
        billionth of a metre: a human hair is roughly 80,000 nm wide (a rough figure), so a single nanometre is hard to imagine, but the numbers are easy to compare. The eye sees wavelengths from
        about 400 nm (violet) to about 700 nm (red). Between them are blue, green, yellow and orange. Light with a <em>shorter</em> wavelength than the eye can see is{' '}
        <strong>ultraviolet</strong> (UV), and light with a <em>longer</em> wavelength is <strong>infrared</strong> (IR). The eye cannot see either, so the pictures mark them with the letters
        UV and IR and do not invent a color for them. Our stars all send out <strong>{DEFAULT_SOURCE_NM} nm</strong>, a yellow-green about halfway along the visible range.
      </p>
      <Figure caption="Drawing B shows two waves and a strip of colors. Short wavelength, high frequency and the violet end go together. Long wavelength, low frequency and the red end go together. The blue line marks the 550 nm of our stars. The drawing only shows how the three ideas go together. It does not say that anything changes.">
        <WavelengthDrawing />
      </Figure>

      <p style={para}>
        <strong>Measuring a color is counting crests.</strong> An observer with an instrument that can count crests, and a clock to count against, measures a color like this: count the crests
        that arrive in one tick of the clock. The more crests per tick, the higher the frequency, and the bluer the color. So the color an observer measures depends on{' '}
        <strong>two things: how the crests arrive, and the clock the observer counts against.</strong> Keep that in mind. Experiment 3 showed that clocks do not have to agree.
      </p>
      <Figure caption="Drawing C shows what ‘more crests per tick’ looks like: 4 crests inside one tick of the clock is a frequency of 4, and 6 crests is a frequency of 6, a higher frequency and a bluer color. It does not say who gets more crests. That is what this experiment finds out.">
        <CountingDrawing />
      </Figure>

      <p style={para}>
        <strong>Two observers, one sky.</strong> As in Experiment 7, a ring of 24 stars surrounds the middle. They are all very far away, evenly spaced (one every 15°), and{' '}
        <strong>at rest relative to the lab</strong>. Two observers measure the starlight at the middle of the ring at the same instant. The <strong>lab observer</strong> is at rest relative to
        the stars. The <strong>traveler</strong> is flying through the middle of the ring at a steady speed. At that instant they are in the same place, so the same crests are arriving at both of
        them. The only difference between them is that one is moving. Each observer counts crests with their own clock, and each measurement is just as valid as the other.
      </p>
      <Figure caption="Drawing D is the setup, before anything is measured. The ring is the 24 stars, all the same yellow-green. The lab observer is at rest, the traveler is flying to the right, and four stars are labelled by their angle from straight ahead.">
        <SetupDrawing />
      </Figure>

      <p style={para}>
        <strong>An everyday example.</strong> The pitch of a siren depends on how the ambulance and the listener are moving. The siren has not changed. It is the sound that reaches the listener that
        is different.
      </p>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>Some new words.</strong> Here is each one in plain language.
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>
            <strong>Crest and trough:</strong> the highest and lowest parts of a wave. A light wave is a string of evenly spaced crests.
          </li>
          <li>
            <strong>The Doppler effect:</strong> the change in the frequency of a wave that an observer measures because the observer, or the source, is moving. Sirens are the everyday example.
            This experiment asks whether it happens to light.
          </li>
          <li>
            <strong>Frequency:</strong> how many wave crests pass you each second. A siren of high pitch has a high frequency. For light, a higher frequency is a bluer color, and a lower frequency
            is a redder one.
          </li>
          <li>
            <strong>Wavelength:</strong> the distance between two crests. A higher frequency means a shorter wavelength. Wavelengths of light are written in <strong>nanometres</strong> (nm). The
            colors the eye can see run from about 400 nm (violet) to about 700 nm (red); shorter is <strong>ultraviolet</strong> and longer is <strong>infrared</strong>.
          </li>
          <li>
            <strong>Shifted toward blue, shifted toward red:</strong> a light that is measured at a higher frequency than before is shifted toward blue (a <strong>blueshift</strong>), and one
            measured at a lower frequency is shifted toward red (a <strong>redshift</strong>). Redshift is the word used in Experiment 2 of Gravity and Curved Spacetime and in Experiment 5 of
            Gravitational Waves.
          </li>
          <li>
            <strong>The shift factor</strong> (written f′ ÷ f): the frequency the traveler measures divided by the frequency the lab measures for the same light. A factor of 2.00 means twice the
            frequency, and 0.50 means half.
          </li>
          <li>
            <strong>The angle θ and the direction of travel:</strong> as in Experiment 7, θ is how far a star is from straight ahead, measured from the direction the traveler is moving. 0
            degrees is straight ahead, 90 degrees is exactly sideways, and 180 degrees is straight behind.
          </li>
          <li>
            <strong>Speed written as 0.6c:</strong> a fraction of the speed of light, <em>c</em>. So 0.6c is six tenths of the speed of light, and 0.9c is nine tenths.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>What happens.</strong> When you press Run, the page shows the same ring of 24 stars twice, once for each observer, and then marks what the traveler measured on a ruler for
          wavelengths. Here is the whole run, in the order you will see it.
        </p>
        <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>The lab’s sky is already on the screen.</strong> It shows the ring as the lab observer measures it. Every star sends out the same {DEFAULT_SOURCE_NM} nm light, so all 24
            dots are the same yellow-green. The lab’s picture does not change during the run.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>The traveler’s sky is drawn, a pair of stars at a time.</strong> For each star, the traveler measures two things about the light that arrives at that instant: the{' '}
            <em>direction</em> it comes from (the angle, as in Experiment 7) and its <em>color</em> (the wavelength). The page draws each star where the traveler measures it, in the color the
            traveler measures. It starts with the star straight ahead and goes around to the star straight behind. Each step adds one star above the line of travel and its mirror-image star
            below it, so the ring fills in over 13 steps. The run lasts about 9 seconds, so that you can follow it. The speed of the playback is only for your eyes. It does not change any
            result, because the physics fixes every number before the picture is drawn.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>Some colors cannot be shown as colors.</strong> If the traveler measures a wavelength the eye cannot see, the star is drawn as a hollow circle marked UV (ultraviolet, solid
            outline) or IR (infrared, dashed outline), because the page does not invent a color the eye cannot see.
          </li>
          <li style={{ marginBottom: '0.4rem' }}>
            <strong>When the last pair is drawn, the measurements are marked.</strong> Three things appear together. On the spectrum bar, three marks show the wavelength the traveler measures
            for the star straight ahead, for the star we follow and for the star straight behind, each with its wavelength and its shift factor (the traveler’s frequency divided by the lab’s).
            In the traveler’s sky, a count of the stars in each wedge and two lines appear: a dashed yellow line where the traveler’s frequency is exactly the same as the lab’s, and a dotted
            line at 90° for comparison. Your two white guesses appear under the bar, next to the real marks.
          </li>
          <li style={{ marginBottom: 0 }}>
            <strong>Then the rest of the page opens.</strong> Part 2 lets you choose other speeds, Part 3 gives the numbers, a check-up and your guesses beside the results, and Part 4 is the
            tutor, who asks you three questions and then explains what you saw.
          </li>
        </ol>
        <p style={{ margin: '0.5rem 0 0' }}>
          Nothing in this list tells you what color any star turns out to be. That is what you are asked to predict, and then to watch.
        </p>
      </div>
      <p style={para}>
        <strong>Your job.</strong> Predict first. Part 1 uses a traveler flying at <strong>{PART_ONE_SPEED}c</strong>. You predict the color the traveler measures for two stars: the one straight
        ahead, and the one the lab observer sees exactly sideways. Choose your answers, then press Run. You are not graded.{' '}
        <strong>Your predictions never change the pictures or the tables.</strong> They come from the physics. Your guesses are drawn on the spectrum bar in white, in boxes labelled YOUR GUESS,
        and they are shown again beside the results. Once you press Run, your guesses are locked. After your first run, Part 2 lets you choose other speeds. Those choices <em>do</em> change the
        drawings, but not your guesses. If you want to change your guesses, press Start over.
      </p>
      <p style={{ marginTop: 0, marginBottom: 0 }}>
        <strong>What we assume.</strong> Every star sends out one pure color. Real stars send out a mixture of colors, so the real sky would change in a more complicated way. The stars are very
        far away and at rest in the lab. The traveler moves at a steady speed, and we look only at the moment the traveler is at the middle of the ring. We show a flat slice of the sky, the ring
        along the line of travel, and we show only the color of each star, not its brightness. The numbers on this page come from a formula worked out for a pure color, and we use it for every
        star. We have not measured a traveler at 0.6c: it is a calculation, and Einstein’s 1905 formula is the published source.
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

// Every link below was fetched and read on 2026-11-23 (docs/audit/spacetime-geometry/08-draft-wording.md, section 7), through a fetch helper that returned page text and short quotes.
export function DopplerShiftLinks() {
  return (
    <div style={{ marginBottom: '1.5rem', ...small }}>
      <h4 style={{ margin: '0 0 0.5rem' }}>Want to know more?</h4>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>Plain pages</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://imagine.gsfc.nasa.gov/features/yba/M31_velocity/spectrum/doppler_more.html">NASA, Imagine the Universe!, “Doppler Shift”</Ext> (plain language; page read on 23 November
          2026; last updated 24 September 2020): the siren example with pictures of waves bunching up in front of a moving source, what redshift and blueshift mean, and a note that its simple
          formulas hold only for speeds much less than the speed of light. Its equations are pictures, so they were not read.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/ems/02_anatomy/">NASA Science, “Anatomy of an Electromagnetic Wave”</Ext> (plain language; page read on 23 November 2026; last updated 3 August 2023): that
          a changing magnetic field makes a changing electric field and the other way round, so the two are linked; that moving charged particles create these fields; that electromagnetic waves
          need no medium and can cross the vacuum of space, where sound cannot; and how Hertz showed that radio waves travel at the speed of light. In its text, NASA does not give the speed of
          light and does not say that the two fields are at right angles (a picture description mentions it), so those two statements on this page are not taken from NASA.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/ems/01_intro/">NASA Science, “Introduction to the Electromagnetic Spectrum”</Ext> (plain language; page read on 23 November 2026; last updated 17
          September 2025): electromagnetic energy travels in waves, and the spectrum runs from very long radio waves to very short gamma rays, with the eye able to see only a small part. It does
          not say in so many words that all of them are the same kind of wave.
        </li>
        <li style={linkItem}>
          <Ext href="https://science.nasa.gov/ems/09_visiblelight/">NASA Science, “Visible Light”</Ext> (plain language; page read on 23 November 2026; last updated 4 August 2023): what visible
          light is, and the range of wavelengths the eye can see. NASA gives that range as 380 to 700 nanometres, with violet at about 380. This page uses a round “about 400” for the violet end.
        </li>
      </ul>
      <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold' }}>The original paper</p>
      <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
        <li style={linkItem}>
          <Ext href="https://www.fourmilab.ch/etexts/einstein/specrel/www/">Einstein, “On the Electrodynamics of Moving Bodies” (1905)</Ext> (a physics paper, not a plain page; read on 23 November
          2026, Fourmilab’s copy of the 1923 English translation): look for section 7, “Theory of Doppler’s Principle and of Aberration”. It gives the formula used on this page for the frequency
          an observer measures, and the formula for aberration used in Experiment 7. The translation writes the speed of light as c, where Einstein’s German original has V. The formulas on the
          page are pictures; they were read as their text equivalents.
        </li>
      </ul>
      <p style={{ margin: 0, fontSize: '0.75rem' }}>
        Not linked, because it could not be read for this page (checked 23 November 2026): a plain page from an official source that explains in simple words why a star the lab sees sideways is
        shifted too. None was found. NASA’s glossary page for the Doppler effect was cut off when fetched, and a NASA page on the expansion of the universe was found by search but not read. A link
        is added only after the page has been read.
      </p>
    </div>
  )
}
