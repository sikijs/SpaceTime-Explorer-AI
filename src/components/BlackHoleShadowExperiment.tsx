import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { HORIZON_CHOICES, SIZE_CHOICES, massRatio, pictureOne, pictureTwo, horizonGuessMarker, ratioRulerPosition, sizeGuessMarker, RATIO_RULER_MIN, RATIO_RULER_MAX } from '../physics/blackHoleShadow'
import type { HorizonChoice, SizeChoiceId } from '../physics/blackHoleShadow'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 21 (docs/experiments/frontier-and-beyond/21-black-hole-shadow.md).
// STEPS 2, 4, 5a and 5b (the interface skeleton and the introduction, the two predictions, the run and Picture 1, then Picture 2): this file has the title, the status line, the introduction, the new-word list, the collapsed "Words and formulas" panel
// and the "Want to know more?" links. It also has the two predictions (Part 1), the run (eight stages), Picture 1 with Prediction 1's guess and Picture 2 with Prediction 2's guess. It has no Part 2, results, tutor or chapter summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for
// the owner's line-by-line approval (CLAUDE.md §28.1), written to the standard of §29. Nothing here says how big either shadow looks in the sky, how the two compare, or how much
// wider than the horizon the shadow is (CLAUDE.md §12): those are the predictions' answers and the run's results. The links that give them away (the ESO page, which shows both images,
// and the papers) are listed only after the run, in a later step. The introduction has no illustration; the pictures come with the run.

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

const paragraph = { marginTop: 0, marginBottom: '0.75rem' } as const
const list = { margin: '0 0 0.75rem', paddingLeft: '1.25rem' } as const

function referenceEntries(): { term: string; meaning: string }[] {
  return [
    { term: 'Black hole shadow', meaning: 'the dark patch that a black hole makes against the glowing gas behind and around it. Light that passes too close to the black hole is pulled in and never reaches us, so that part of the sky looks dark. The shadow is not the black hole itself.' },
    { term: 'Event horizon', meaning: 'the black hole’s edge, the “point of no return”: nothing that crosses it, not even light, can come back out (Black Holes Experiments 1 and 4). This page also says “horizon”.' },
    { term: 'Gas that glows', meaning: 'gas pulled towards a black hole by its gravity. It swirls round the black hole, and as its parts rub against and squeeze each other it gets extremely hot and gives out light, including radio waves. It is this glowing gas that the shadow is seen against. Magnetic fields play a part in the heating, which is more complicated in detail than rubbing and squeezing.' },
    { term: 'The ring', meaning: 'the bright circle in the pictures. It is made by hot, glowing gas close to the black hole, whose light is bent round the black hole by its gravity. The ring is gas that glows. It is not the black hole and not the shadow, but it surrounds the shadow.' },
    { term: 'Angular size', meaning: 'how wide something looks in the sky, measured as an angle. A coin held close to your eye looks big (a large angle) and the same coin across a street looks tiny (a small angle), though the coin itself has not changed. So how big something looks depends on its real width and on how far away it is.' },
    { term: 'Arcsecond and microarcsecond', meaning: 'tiny units of angle. A full circle is 360 degrees, one degree is 60 arcminutes, and one arcminute is 60 arcseconds, so an arcsecond is 1/3600 of a degree. A microarcsecond is a millionth of an arcsecond. This page writes it as “µas”.' },
    { term: 'Radio telescope', meaning: 'a telescope that collects radio waves, a kind of light our eyes cannot see, instead of the light we can see. The Event Horizon Telescope looks at radio waves with a wavelength of about 1.3 millimetres.' },
    { term: 'Telescope array (interferometry)', meaning: 'several telescopes far apart, whose signals are combined by computer so that together they see as sharply as one huge telescope as wide as the distance between them. The Event Horizon Telescope links dishes on several continents, so it acts like a telescope as wide as the Earth.' },
    { term: 'Solar mass', meaning: 'a unit for how heavy stars and black holes are. One solar mass is the mass of the Sun, so “a million solar masses” means a million times as heavy as the Sun. This page also says “Suns”.' },
    { term: 'Parsec, kiloparsec and megaparsec', meaning: 'units for distances between stars and galaxies. One parsec is about 3.26 light-years. A kiloparsec (kpc) is a thousand parsecs and a megaparsec (Mpc) is a million parsecs.' },
    { term: 'Give-or-take', meaning: 'the size of the uncertainty of a measurement, written “42 ± 3”. It says how far the true value could be from the measured one. (Experiment 1 of this group explains it.)' },
    { term: 'Gravitational lensing', meaning: 'the bending of light by the gravity of something heavy that lies in its way (Cosmology Experiment 7 and Gravity Experiment 8). Near a black hole the bending is so strong that light can be bent into a full circle.' },
  ]
}


// ---- Colours ----
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const BLACK_HOLE_COLOR = '#a78bfa' // violet: a black hole's edge (its event horizon)
const CALC_COLOR = '#22d3ee' // cyan: calculated here (the shadow)
const MEASURED_COLOR = '#fb923c' // orange: measured by the Event Horizon Telescope (the ring)
const YOURS_COLOR = '#ffffff' // white: the learner's guess

const svgStyle = {
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
} as const

const VIEW_WIDTH = 560

function SvgLines({ x, y, lines, fill, size = 10, bold = false, anchor = 'start' }: { x: number; y: number; lines: string[]; fill: string; size?: number; bold?: boolean; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={bold ? 'bold' : 'normal'} textAnchor={anchor}>
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size + 3}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

// ---- The run: stages. The timer only paces the display; no number depends on it (CLAUDE.md §11). ----
const STAGE_MS = 2600
const LAST_STAGE = 8
const STAGE_NAMES = ['', 'The two black holes', 'Their horizons', 'Their shadows, calculated', 'The rings, measured', 'The comparison', 'One black hole, seen from above', 'Beams of light', 'The shadow’s edge']
const STAGE_LINES = [
  '',
  'The two black holes the Event Horizon Telescope has imaged. Their masses and distances are published numbers.',
  'Each black hole’s edge, the event horizon, drawn at the size it would look from Earth, on one scale for both.',
  'The dashed cyan circles are the shadows, calculated here from each black hole’s mass and distance.',
  'The orange rings are what the telescope measured. The pale band round each is its give-or-take.',
  'Panel B compares how wide the two shadows look. Your guess is the white box.',
  'Picture 2 shows one black hole, seen from above. The dark circle is its edge, the event horizon. All distances use one unit: the distance from the black hole’s centre to its edge.',
  'Beams of light aimed past the black hole at different distances. The red beams are captured. The green beams escape, bent by gravity.',
  'The dashed cyan circle is the shadow’s edge, calculated here. Your guess for Prediction 2 is the white circle.',
]

const SIZE_PHRASE: Record<SizeChoiceId, string> = {
  'much-bigger': 'much wider (about 10 times)',
  'a-little-bigger': 'a little wider (about 1.5 times)',
  'about-the-same': 'about the same',
  'a-little-smaller': 'a little narrower (about 1.5 times)',
  'much-smaller': 'much narrower (about 10 times)',
}

function massPhrase(m: number): string {
  return m >= 1e9 ? `${m / 1e9} billion` : `${m / 1e6} million`
}
function distancePhrase(pc: number): string {
  return pc >= 1e6 ? `${pc / 1e6} Mpc` : `${pc / 1e3} kpc`
}
function n1(x: number): string {
  return x.toFixed(1)
}
function n2(x: number): string {
  return x.toFixed(2)
}

// Picture 1. Panel A: both black holes on one angular scale. Panel B: the ratio of the two shadows on a log ruler, with Prediction 1's guess (a marker only).
function PictureOne({ stage, sizeGuess }: { stage: number; sizeGuess: SizeChoiceId | null }) {
  const pic = pictureOne()
  const k = 3.2 // pixels per microarcsecond
  const cy = 178
  const cxs = [150, 410]
  const barY = 330
  const rulerY = 494
  const rx0 = 60
  const rx1 = 500
  const rx = (r: number) => rx0 + ratioRulerPosition(r) * (rx1 - rx0)
  const height = stage >= 5 ? 595 : 365
  const guess = sizeGuess ? sizeGuessMarker(sizeGuess) : null
  const boxW = 330
  const boxX = guess ? Math.min(540 - boxW, Math.max(20, rx(guess.ratio) - boxW / 2)) : 0
  const [sgr, m87] = pic.rows
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 1. Panel A: Sagittarius A star and M87 star on one scale of angle in the sky, in millionths of an arcsecond. ${
        stage >= 2 ? `Each black hole's edge, its event horizon, is a dark circle: about ${n1(sgr.horizonMicroarcsec)} for Sagittarius A star and ${n1(m87.horizonMicroarcsec)} for M87 star. ` : ''
      }${stage >= 3 ? `A dashed cyan circle is each shadow, calculated: about ${n1(sgr.shadowMicroarcsec)} and ${n1(m87.shadowMicroarcsec)}. ` : ''}${
        stage >= 4 ? `An orange ring is each ring as measured: ${sgr.ringMicroarcsec} plus or minus ${sgr.ringUncertainty} and ${m87.ringMicroarcsec} plus or minus ${m87.ringUncertainty}. ` : ''
      }${
        stage >= 5
          ? `Panel B: a ruler from ${RATIO_RULER_MIN} to ${RATIO_RULER_MAX} for how wide M87 star's shadow looks compared with Sagittarius A star's, calculated ${n2(pic.calculatedRatio)} and measured rings ${n2(pic.measuredRatio)}.${
              sizeGuess ? ` Your guess for Prediction 1, ${SIZE_PHRASE[sizeGuess]}, is a white marker.` : ''
            }`
          : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 1: two black holes on one scale
      </text>
      <SvgLines x={20} y={38} lines={['A. Seen from Earth. Angles are in µas, millionths of an arcsecond.']} fill={MUTED_COLOR} />

      {pic.rows.map((r, i) => {
        const cx = cxs[i]
        return (
          <g key={r.id}>
            <SvgLines x={cx} y={56} lines={[r.name]} fill={TEXT_COLOR} bold size={12} anchor="middle" />
            <SvgLines
              x={cx}
              y={70}
              lines={[`${massPhrase(r.massSolar)} Suns, ${distancePhrase(r.distancePc)} away`]}
              fill={MUTED_COLOR}
              size={9}
              anchor="middle"
            />
            <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke={MUTED_COLOR} strokeWidth={1} />
            <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke={MUTED_COLOR} strokeWidth={1} />
            {stage >= 4 && (
              <g>
                <circle cx={cx} cy={cy} r={(r.ringMicroarcsec / 2) * k} fill="none" stroke={MEASURED_COLOR} strokeOpacity={0.35} strokeWidth={r.ringUncertainty * k} />
                <circle cx={cx} cy={cy} r={(r.ringMicroarcsec / 2) * k} fill="none" stroke={MEASURED_COLOR} strokeWidth={3} />
              </g>
            )}
            {stage >= 3 && (
              <g>
                <circle cx={cx} cy={cy} r={(r.shadowMicroarcsec / 2) * k} fill="none" stroke="#0b1020" strokeWidth={5} />
                <circle cx={cx} cy={cy} r={(r.shadowMicroarcsec / 2) * k} fill="none" stroke={CALC_COLOR} strokeWidth={2.5} strokeDasharray="7 5" />
              </g>
            )}
            {stage >= 2 && <circle cx={cx} cy={cy} r={(r.horizonMicroarcsec / 2) * k} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} />}
            {stage >= 2 && <SvgLines x={cx} y={cy + 106} lines={[`violet solid circle: edge ${n1(r.horizonMicroarcsec)} µas`]} fill={BLACK_HOLE_COLOR} size={9} bold anchor="middle" />}
            {stage >= 3 && <SvgLines x={cx} y={cy + 119} lines={[`cyan dashed circle: shadow, calculated ${n1(r.shadowMicroarcsec)} µas`]} fill={CALC_COLOR} size={9} bold anchor="middle" />}
            {stage >= 4 && <SvgLines x={cx} y={cy + 132} lines={[`orange ring: measured ${r.ringMicroarcsec} ± ${r.ringUncertainty} µas`]} fill={MEASURED_COLOR} size={9} bold anchor="middle" />}
          </g>
        )
      })}
      <line x1={20} y1={barY + 14} x2={20 + pic.barMicroarcsec * k} y2={barY + 14} stroke={TEXT_COLOR} strokeWidth={2} />
      <SvgLines x={20 + pic.barMicroarcsec * k + 8} y={barY + 18} lines={[`scale bar: ${pic.barMicroarcsec} µas`]} fill={MUTED_COLOR} size={9} />
      <SvgLines x={540} y={barY + 18} lines={['Both drawn on the same scale']} fill={MUTED_COLOR} size={9} anchor="end" />

      {stage >= 5 && (
        <g>
          <line x1={20} y1={368} x2={540} y2={368} stroke={MUTED_COLOR} strokeWidth={1} strokeDasharray="3 4" />
          <SvgLines x={20} y={390} lines={['B. How wide M87*’s shadow looks, compared with Sagittarius A*’s']} fill={TEXT_COLOR} bold size={11} />
          <SvgLines x={20} y={406} lines={['A ruler of ratios, not of angles: 1 is the same width; each step to the right multiplies (10 is ten times as wide).']} fill={MUTED_COLOR} size={9} />
          <line x1={rx0} y1={rulerY} x2={rx1} y2={rulerY} stroke={MUTED_COLOR} strokeWidth={1} />
          {[0.1, 0.5, 1, 2, 10].map((t) => (
            <g key={t}>
              <line x1={rx(t)} y1={rulerY} x2={rx(t)} y2={rulerY + 5} stroke={MUTED_COLOR} />
              <SvgLines x={rx(t)} y={rulerY + 17} lines={[String(t)]} fill={MUTED_COLOR} size={9} anchor="middle" />
            </g>
          ))}
          <SvgLines x={rx1} y={rulerY + 31} lines={['M87*’s shadow ÷ Sagittarius A*’s shadow']} fill={MUTED_COLOR} size={9} anchor="end" />
          <line x1={rx(pic.calculatedRatio)} y1={rulerY - 40} x2={rx(pic.calculatedRatio)} y2={rulerY} stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="5 3" />
          <line x1={rx(pic.measuredRatio)} y1={rulerY - 28} x2={rx(pic.measuredRatio)} y2={rulerY} stroke={MEASURED_COLOR} strokeWidth={2} />
          <SvgLines x={rx(pic.calculatedRatio) - 4} y={rulerY - 46} lines={[`shadows, calculated: ${n2(pic.calculatedRatio)}`]} fill={CALC_COLOR} bold size={10} anchor="end" />
          <SvgLines x={rx(pic.measuredRatio) + 6} y={rulerY - 32} lines={[`rings, measured: ${n2(pic.measuredRatio)}`]} fill={MEASURED_COLOR} bold size={10} />
          {guess && sizeGuess && (
            <g>
              <line x1={rx(guess.ratio)} y1={rulerY} x2={rx(guess.ratio)} y2={rulerY + 52} stroke={YOURS_COLOR} strokeWidth={4} />
              <polygon points={`${rx(guess.ratio)},${rulerY} ${rx(guess.ratio) - 7},${rulerY + 12} ${rx(guess.ratio) + 7},${rulerY + 12}`} fill={YOURS_COLOR} />
              <rect x={boxX} y={rulerY + 52} width={boxW} height={28} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
              <SvgLines x={boxX + boxW / 2} y={rulerY + 70} lines={[`YOUR GUESS: ${SIZE_PHRASE[sizeGuess]}`]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
            </g>
          )}
        </g>
      )}
    </svg>
  )
}


const BEAM_CAPTURED_COLOR = '#f87171' // red: a beam that is captured
const BEAM_ESCAPES_COLOR = '#34d399' // green: a beam that gets away

// Picture 2: one black hole seen from above, with beams of light coming in from the right, the capture limit (the shadow's edge) and Prediction 2's guess circle.
function PictureTwoSvg({ stage, horizonGuess }: { stage: number; horizonGuess: HorizonChoice | null }) {
  const pic = pictureTwo()
  const ppr = 21 // pixels per horizon radius
  const cx = 280
  const cy = 262
  const height = 610
  const px = (x: number) => cx + x * ppr
  const py = (y: number) => cy - y * ppr
  const guess = horizonGuess !== null ? horizonGuessMarker(horizonGuess) : null
  const beams = stage >= 7 ? pic.beams : []
  return (
    <svg
      width={VIEW_WIDTH}
      height={height}
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      style={svgStyle}
      role="img"
      aria-label={`Picture 2. One black hole seen from above, with light coming in from the right. All distances are in one unit, the radius of the black hole's edge (centre to edge). ${
        stage >= 6 ? 'A dark violet circle is the black hole’s edge. ' : ''
      }${
        stage >= 7
          ? `Beams of light are aimed past it: red beams aimed ${pic.beams.filter((b) => b.outcome === 'captured').map((b) => b.aim).join(', ')} are captured, and green beams aimed ${pic.beams.filter((b) => b.outcome === 'escapes').map((b) => b.aim).join(', ')} escape, bent. `
          : ''
      }${
        stage >= 8
          ? `A dashed cyan circle, ${n1(pic.shadowOverHorizon)} times as wide as the edge, is the shadow's edge, calculated.${
              horizonGuess !== null ? ` Your guess for Prediction 2, ${horizonGuess} times as wide as the edge, is a white dashed circle.` : ''
            }`
          : ''
      }`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Picture 2: light near one black hole
      </text>
      <SvgLines x={20} y={38} lines={['A bird’s-eye view. Light comes in from the right. Distances are in units of the edge’s radius (centre to edge).']} fill={MUTED_COLOR} />

      {beams.map((b) => (
        <polyline
          key={b.aim}
          points={b.points.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')}
          fill="none"
          stroke={b.outcome === 'captured' ? BEAM_CAPTURED_COLOR : BEAM_ESCAPES_COLOR}
          strokeWidth={2}
        />
      ))}
      {stage >= 8 && (
        <g>
          <circle cx={cx} cy={cy} r={pic.shadowRadius * ppr} fill="none" stroke="#0b1020" strokeWidth={5} />
          <circle cx={cx} cy={cy} r={pic.shadowRadius * ppr} fill="none" stroke={CALC_COLOR} strokeWidth={2.5} strokeDasharray="7 5" />
          {guess && (
            <circle cx={cx} cy={cy} r={guess.radiusInHorizonRadii * ppr} fill="none" stroke={YOURS_COLOR} strokeWidth={3} strokeDasharray="3 5" />
          )}
        </g>
      )}
      {stage >= 6 && <circle cx={cx} cy={cy} r={pic.horizonRadius * ppr} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} />}
      {stage >= 7 &&
        [...pic.beams]
          .sort((m, n) => n.aim - m.aim)
          .map((b, i) => {
            const color = b.outcome === 'captured' ? BEAM_CAPTURED_COLOR : BEAM_ESCAPES_COLOR
            const start = b.points[0]
            const labelY = py(PICTURE_TWO_FIRST_AIM) + i * 14
            return (
              <g key={b.aim}>
                <line x1={px(start.x)} y1={py(start.y)} x2={512} y2={labelY - 3} stroke={color} strokeWidth={0.75} strokeOpacity={0.7} />
                <SvgLines x={516} y={labelY} lines={[`aim ${b.aim}`]} fill={color} size={9} />
              </g>
            )
          })}

      {stage >= 6 && <SvgLines x={20} y={cy + 246} lines={['violet circle: the black hole’s edge (its radius is 1 unit)']} fill={BLACK_HOLE_COLOR} size={10} bold />}
      {stage >= 7 && <SvgLines x={20} y={cy + 261} lines={['red beams: captured. green beams: escape, bent.', '“aim”: how far from the centre a beam would pass if gravity did nothing.']} fill={TEXT_COLOR} size={9} />}
      {stage >= 8 && (
        <SvgLines
          x={20}
          y={cy + 289}
          lines={[`cyan dashed circle: the shadow’s edge, calculated here, ${n1(pic.shadowOverHorizon)} times as wide as the edge`]}
          fill={CALC_COLOR}
          size={10}
          bold
        />
      )}
      {stage >= 8 && guess && horizonGuess !== null && (
        <g>
          <rect x={20} y={cy + 300} width={400} height={26} rx={4} fill="#0b1020" stroke={YOURS_COLOR} strokeWidth={2.5} />
          <SvgLines x={220} y={cy + 317} lines={[`YOUR GUESS (white circle): ${horizonGuess} times as wide as the edge`]} fill={YOURS_COLOR} bold size={10} anchor="middle" />
        </g>
      )}
    </svg>
  )
}
const PICTURE_TWO_FIRST_AIM = 6.5

const captionParagraph = { marginTop: 0, marginBottom: '0.75rem' } as const

function CaptionBlock({ title, intro, bullets, worked, lookFor, whereFrom }: { title: string; intro: ReactNode; bullets: ReactNode[]; worked: ReactNode | null; lookFor: LookFor[]; whereFrom: ReactNode }) {
  return (
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' }}>
      <p style={captionParagraph}>
        <strong>How to read {title}.</strong> {intro}
      </p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {worked !== null && (
        <p style={captionParagraph}>
          <strong>A worked moment.</strong> {worked}
        </p>
      )}
      {lookFor.length > 0 && (
        <>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>What to look for.</strong>
          </p>
          <LookForList items={lookFor} />
        </>
      )}
      <p style={{ ...captionParagraph, marginTop: '0.75rem' }}>
        <strong>Where the real picture comes from.</strong> {whereFrom}
      </p>
    </div>
  )
}

const SIZE_LABELS: Record<SizeChoiceId, string> = {
  'much-bigger': 'Much bigger (about 10 times as wide)',
  'a-little-bigger': 'A little bigger (about 1.5 times as wide)',
  'about-the-same': 'About the same width',
  'a-little-smaller': 'A little smaller (about 1.5 times narrower)',
  'much-smaller': 'Much smaller (about 10 times narrower)',
}
const HORIZON_LABELS: Record<HorizonChoice, string> = {
  1: 'The same width (1 times)',
  1.5: 'About 1.5 times as wide',
  2: 'About 2 times as wide',
  3: 'About 3 times as wide',
  5: 'About 5 times as wide',
  10: 'About 10 times as wide',
}

interface BlackHoleShadowExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export function BlackHoleShadowExperiment({ onComplete }: BlackHoleShadowExperimentProps) {
  const [sizeGuess, setSizeGuess] = useState<SizeChoiceId | null>(null)
  const [horizonGuess, setHorizonGuess] = useState<HorizonChoice | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [stage, setStage] = useState(0)
  const recorded = status !== 'idle'
  const done = status === 'complete'
  const bothPredicted = sizeGuess !== null && horizonGuess !== null

  // Presentation only: advances one stage at a time. The numbers do not depend on this timer (CLAUDE.md §11).
  useEffect(() => {
    if (status !== 'running') return
    const timer = window.setTimeout(() => {
      if (stage < LAST_STAGE) setStage(stage + 1)
      else {
        setStatus('complete')
        onComplete?.()
      }
    }, STAGE_MS)
    return () => window.clearTimeout(timer)
  }, [status, stage, onComplete])

  const startOver = () => {
    setSizeGuess(null)
    setHorizonGuess(null)
    setStatus('idle')
    setStage(0)
  }
  const run = () => {
    setStage(1)
    setStatus('running')
  }
  const pic = pictureOne()
  const [sgrRow, m87Row] = pic.rows
  const pic2 = pictureTwo()
  return (
    <div>
      <h2>Experiment 21 — Can We Photograph a Black Hole’s Shadow? (Event Horizon Telescope)</h2>
      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <p style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <strong>
            Where this stands (as of October 2026): there is strong evidence that the Event Horizon Telescope has imaged the glowing rings around two black holes, one in the galaxy M87 and one at
            the centre of our own Milky Way, and that the sizes of those rings are close to what general relativity gives for the black holes’ masses. How closely they match, and so how tightly this tests gravity, is still open,
            because the masses and the link between a ring and a shadow carry their own uncertainty. The numbers, and where each comes from, are shown after you press Run, so that you can guess first.
          </strong>
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The question.</strong> A black hole gives out no light of its own, so you cannot photograph it the way you photograph a star. But there is a way to see it, the way you can see a
            person’s outline when they stand in front of a bright window: you see the <em>dark shape against something bright behind it</em>. Here is how that works for a black hole.
          </p>
          <ol style={list}>
            <li>
              <strong>Where the glowing gas comes from.</strong> Space around a black hole is not empty. At the centre of a galaxy there is gas: drifting clouds, and the winds blown off nearby stars.
              The black hole’s gravity pulls this gas inward. The gas does not fall straight in, just as bathwater does not go straight down the plughole. It swirls round the black hole, faster and
              faster, in a crowded stream.
            </li>
            <li>
              <strong>Why the gas glows.</strong> As the gas piles up and swirls, its parts rub against and squeeze each other. Rubbing makes heat, in the same way your hands warm up when you rub
              them together. The gas becomes extremely hot, and anything that hot gives out light. (The Event Horizon Telescope looks at the radio-wave part of that light.) The heating is more
              complicated in detail, and magnetic fields play a part, but rubbing and squeezing is the simple picture.
            </li>
            <li>
              <strong>What the black hole does to that light.</strong> Some of the glowing gas’s light heads towards the black hole. Light that passes at a safe distance is bent by the black hole’s
              gravity but gets away, and some of it reaches us. Light that passes too close is pulled in and never comes out (Black Holes Experiment 4). So a patch of the sky where we would
              expect light from the black hole’s surroundings gives us none.
            </li>
            <li>
              <strong>What we see.</strong> A glowing, swirling ring of gas, with a dark patch in the middle where the captured light would have been. The dark patch is the black hole’s{' '}
              <strong>shadow</strong>. In 2019 and 2022 the Event Horizon Telescope (EHT) made the first pictures of such rings and shadows.
            </li>
          </ol>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>Two questions follow:</p>
          <ul style={list}>
            <li>How big should a black hole’s shadow look in the sky, and what does that depend on?</li>
            <li>Does the size we measure match what general relativity says it should be?</li>
          </ul>

          <p style={paragraph}>
            <strong>Where we left off.</strong> In Black Holes Experiment 4 you aimed beams of light past a black hole and saw that light aimed close enough is captured and light aimed wider escapes,
            bent on the way. The shadow is that same capture, seen from far away: it is the circle of directions from which no light reaches us. In Black Holes Experiment 1 you worked out the
            horizon, a black hole’s edge, from its mass. This experiment asks how that looks from Earth.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>How big something looks.</strong> How wide something looks in the sky, its <strong>angular size</strong>, depends on two things: how wide it really is, and how far away it is.
            Hold a coin close to your eye and it hides the Moon. Put the same coin on a table across the street and it looks tiny. The coin has not changed, only its distance. Astronomers measure
            angular size in angles. A full circle is 360 degrees, a degree is 3,600 arcseconds, and a <strong>microarcsecond</strong> (µas) is a millionth of an arcsecond. That is a very small angle.
            For comparison, the European Southern Observatory says that the black hole at the centre of our galaxy looks, from Earth, no bigger than a doughnut would on the surface of the Moon.
          </p>
          <p style={paragraph}>
            So the size of a black hole’s shadow in our sky depends on <em>both</em> of these: how big the shadow really is, and how far away the black hole is.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why an Earth-sized telescope.</strong> A telescope’s sharpness depends on how wide it is compared with the wavelength it observes. A rough rule is that the smallest angle it can
            separate is the wavelength divided by the width (in the same units, giving an angle in radians). The EHT observes radio waves with a wavelength of about 1.3 millimetres (a frequency of
            230 gigahertz). A single dish tens of metres wide is far too blurry. But dishes on several continents, with their signals combined, act like one telescope as wide as the Earth,
            about 12,700 kilometres. Put in numbers:
          </p>
          <ul style={list}>
            <li>1.3 millimetres is 0.0013 metres, and 12,700 kilometres is 12,700,000 metres;</li>
            <li>0.0013 ÷ 12,700,000 is about 1 × 10⁻¹⁰ in radians, which is about 20 millionths of an arcsecond.</li>
          </ul>
          <p style={paragraph}>
            So an Earth-sized telescope at this wavelength can just pick out features a few tens of microarcseconds across. Nothing smaller than the Earth would do. (This is a rough rule, not
            the EHT’s own calculation.)
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The two black holes.</strong> The EHT has imaged two black holes, which differ enormously in mass and in distance:
          </p>
          <ul style={list}>
            <li>
              <strong>Sagittarius A*</strong> (said “Sagittarius A-star”) is at the centre of the Milky Way, our own galaxy, about 8.15 kiloparsecs away (roughly 27,000 light-years). Its mass is about
              4 million times the mass of the Sun (4.0 million, with a give-or-take of about +1.1 and −0.6 million).
            </li>
            <li>
              <strong>M87*</strong> is at the centre of a giant galaxy called M87, about 16.8 megaparsecs away (roughly 55 million light-years). Its mass is about 6.5 billion times the mass of the
              Sun (6.5 billion, with a give-or-take of about 0.7 billion).
            </li>
          </ul>
          <p style={paragraph}>
            So one is far heavier than the other, and also far farther away. Whether that makes its shadow look bigger or smaller in our sky is the first question you will be asked to guess.
          </p>

          <p style={paragraph}>
            <strong>What is the dark patch? Start with what we see.</strong> When you look at the photograph, you see a bright ring of glowing gas and, in the middle, a patch that is dark. The
            question is why that middle patch is dark.
          </p>
          <p style={paragraph}>
            <strong>Why a spot in a picture is dark.</strong> A spot in a picture is dark when no light comes from that direction to our telescope. So the dark patch is a part of the sky where no
            light reaches us.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Why no light reaches us from there.</strong> Think of the glowing gas as lots of tiny lamps. Each lamp sends light out in every direction. Imagine the black hole sits between those
            lamps and us:
          </p>
          <ol style={list}>
            <li>Some light from the lamps goes towards the black hole.</li>
            <li>Light that passes the black hole at a safe distance is bent by its gravity but carries on, and some of it reaches our telescope. That is the bright ring.</li>
            <li>Light that passes too close is captured. It falls in and never comes out, so it never reaches us.</li>
          </ol>
          <p style={paragraph}>
            So when we look at the sky, there is a round region where the light that should have arrived was captured on the way. It is as if a piece of the light was removed.
          </p>
          <p style={paragraph}>
            <strong>So the dark patch is not an object.</strong> It is not the black hole, and it is not a hole in space. It is the place in our view where light is missing, because the black hole
            captured it. We call it the black hole’s <strong>shadow</strong> because it is the dark patch the black hole causes.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Two pictures that may help.</strong>
          </p>
          <ul style={list}>
            <li>
              <strong>Ordinary shadow:</strong> a tree blocks sunlight, so the ground behind it is dark. The dark patch is where the tree took away the light.
            </li>
            <li>
              <strong>Black hole shadow:</strong> the black hole captures light, so a patch of the sky is dark. The dark patch is where the black hole took away the light.
            </li>
          </ul>
          <p style={paragraph}>
            <strong>One thing to keep separate.</strong> The black hole’s edge (the event horizon) and the dark patch are two different things. Light has to be captured from some distance out from
            the black hole, not only at the edge itself. How the size of the dark patch compares with the size of the edge is one of the questions you will be asked to guess.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>The ring and the shadow are two different things.</strong> The telescope photographs one of them. This page calculates the other.
          </p>
          <ul style={list}>
            <li>
              <strong>The ring is what the telescope photographs.</strong> It is the bright circle of glowing gas. We can measure how wide it looks.
            </li>
            <li>
              <strong>The shadow is the dark patch inside the ring.</strong> The telescope does not photograph it directly. This page calculates its size from the black hole’s mass and distance,
              using one formula.
            </li>
          </ul>

          <p style={paragraph}>
            <strong>Why the ring’s size and the shadow’s size need not be the same number.</strong> Think of a glowing doughnut. The doughnut is the ring of gas, and the hole in the middle is the
            shadow. The width of the hole and the width of the doughnut are related, but they are not the same number. The gas is also thick and its glow is not perfectly even, so the ring’s measured
            width does not have to equal the shadow’s calculated width exactly. The EHT teams use computer models of the glowing gas to work out how the two are related. This page sets the measured
            ring beside the calculated shadow, and the results show how close they are.
          </p>
          <p style={paragraph}>
            <strong>Does the ring change?</strong> The brightness around the ring changes from year to year, because the gas keeps churning, like the bright patches in a flame that move while the
            flame stays in one place. The ring’s size, though, has stayed the same in the pictures taken in 2017, 2018 and 2021.
          </p>

          <p style={paragraph}>
            <strong>Where the question stands (October 2026).</strong> The two rings have been measured, and their sizes are close to general relativity’s predictions for those masses. How close, in
            terms of the measurements’ own give-or-takes, is shown in the results. Later EHT results (2017, 2018 and 2021 data of M87*) show the ring’s size staying the same while its pattern of bright patches changes. How exactly this
            tests gravity is still being worked out, because the masses and the link between ring and shadow have their own uncertainties. This page says which is which.
          </p>

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>Some new words.</strong> The “Words and formulas” box below has each one, with a few from earlier experiments.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>
                <strong>Shadow</strong>, <strong>event horizon</strong>, <strong>the ring</strong> and <strong>gas that glows</strong>: the dark patch, the black hole’s edge, the bright circle, and the hot gas that makes it.
              </li>
              <li>
                <strong>Angular size</strong>, <strong>arcsecond</strong> and <strong>microarcsecond</strong>: how big something looks in the sky, and the units for it.
              </li>
              <li>
                <strong>Radio telescope</strong> and <strong>telescope array</strong>: how the EHT works.
              </li>
              <li>
                <strong>Solar mass</strong>, <strong>parsec</strong>, <strong>give-or-take</strong> and <strong>gravitational lensing</strong>: units and ideas from earlier experiments.
              </li>
            </ul>
          </div>

          <p style={paragraph}>
            <strong>What you will do.</strong> You will make two predictions and press Run. Later steps will draw the pictures one stage at a time, and then let you try other values in a part of
            its own. Nothing here is graded. Your predictions are your own guesses, made before you see anything. They never change the real pictures or the tables, which come from the
            physics and the published numbers. Your guesses will be drawn on top of the real pictures, in white, so you can compare each guess with the real result, and they will be shown again
            beside the results. The page will have four parts: first you predict and watch the pictures; then, in “Now try it yourself”, you can choose the mass and the distance of a black hole of
            your own and watch a drawing of its shadow follow your choices; then come the results; and last a tutor asks you some questions. The real pictures and the results tables never change.
            Your white guess marks appear on the real pictures, and only the drawing in “Now try it yourself” follows your choices.
          </p>

          <p style={paragraph}>
            <strong>What we assume.</strong> This experiment uses the masses, distances and ring sizes that the EHT teams published, with their give-or-takes, and one formula for the size of the
            shadow of a black hole that is not spinning. It does not model the glowing gas, the telescope, how the pictures are made, or the effect of spin on the shadow. The answers to the predictions
            you will make are not given here.
          </p>

          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>Want to know more?</strong> Plainer-language pages are listed here. Links open in a new tab. This page was written as of October 2026. The EHT’s papers and the pages that show
            both pictures side by side are listed after the run, so that they do not give away the predictions.
          </p>
          <ul style={{ margin: '0.25rem 0 0', paddingLeft: '1.25rem' }}>
            <li>
              <ExternalLink href="https://www.nasa.gov/universe/black-hole-image-makes-history-nasa-telescopes-coordinated-observations/">NASA: Black Hole Image Makes History</ExternalLink>: NASA’s
              account of the first image of a black hole’s shadow, in M87, how it was made with telescopes around the world, and how NASA’s X-ray telescopes helped.
            </li>
            <li>
              <ExternalLink href="https://science.nasa.gov/universe/stories/quick-reads/black-holes-seeing-the-invisible/">NASA: Black Holes, Seeing the Invisible</ExternalLink>: how
              astronomers find black holes even though they give out no light, including the EHT’s image, stars orbiting the black hole at the centre of our galaxy, and gravitational waves.
            </li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        {/* The two predictions: draft wording for the owner's review (CLAUDE.md §28.1), from the specification's "Prediction Activity". Neither says which answer is right. */}
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #d97706' }}>
          <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>Part 1: Predict, then watch</h3>
          <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong>What we are about to do.</strong> This part is the experiment itself. You make your two predictions and press Run. The pictures that the run will draw show fixed things:
            the published masses, distances and ring sizes of two black holes, and a calculation of the size of a shadow. They are the same for everyone. When they are drawn, your guesses appear on
            them in white, so you can see how each guess compares with the real result. The real pictures stay the same whatever you guess.
          </p>

          {(
            [
              {
                title: 'Prediction 1: which black hole’s shadow looks wider in our sky?',
                text: (
                  <>
                    Sagittarius A* has about 4 million times the mass of the Sun, and it is about 8.15 kiloparsecs away. M87* has about 6.5 billion times the mass of the Sun, which is about
                    1,600 times as much, but it is about 16.8 megaparsecs away, which is about 2,100 times as far. Compared with the shadow of Sagittarius A*, would the shadow of M87* look
                    wider, narrower or about the same, as seen from Earth?
                  </>
                ),
                choices: SIZE_CHOICES.map((c) => ({ value: c.id as string, label: SIZE_LABELS[c.id] })),
                value: sizeGuess as string | null,
                set: (v: string) => setSizeGuess(v as SizeChoiceId),
              },
              {
                title: 'Prediction 2: how wide is the dark patch compared with the black hole’s edge?',
                text: (
                  <>
                    Take one black hole. Its edge, the event horizon, is a circle, and the dark patch (its shadow) is a larger or smaller circle round the same centre. Measure each across its
                    full width. How many times as wide as the black hole’s edge is the dark patch? This is a separate guess from Prediction 1, so your two answers do not have to agree with each
                    other.
                  </>
                ),
                choices: HORIZON_CHOICES.map((c) => ({ value: String(c), label: HORIZON_LABELS[c] })),
                value: horizonGuess === null ? null : String(horizonGuess),
                set: (v: string) => setHorizonGuess(Number(v) as HorizonChoice),
              },
            ] as const
          ).map((question) => (
            <div key={question.title} style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{question.title}</label>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>{question.text} You are not graded, and a guess is fine.</p>
              <div>
                {(question.choices as ReadonlyArray<{ value: string; label: string }>).map((choice) => (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() => (question.set as (v: string) => void)(choice.value)}
                    disabled={recorded}
                    className={`toggle-button${question.value === choice.value ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                {question.value !== null
                  ? `Your prediction: ${(question.choices as ReadonlyArray<{ value: string; label: string }>).find((c) => c.value === question.value)?.label.toLowerCase()}.`
                  : 'Choose an option to continue'}
              </p>
            </div>
          ))}

          <button type="button" className="action-button" onClick={run} disabled={!bothPredicted || recorded} style={{ padding: '0.6rem 1.5rem' }}>
            Run
          </button>
          {recorded && (
            <button type="button" className="secondary-button" onClick={startOver} style={{ marginLeft: '0.75rem', padding: '0.6rem 1.25rem' }}>
              Start over
            </button>
          )}
          {!bothPredicted && !recorded && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 0 }}>Answer both predictions above to run the experiment.</p>
          )}
          {/* The run's stage, named (CLAUDE.md §14): what the learner is looking at now. */}
          <p style={{ fontSize: '0.875rem', margin: '1.5rem 0 0.75rem', minHeight: '1.5rem' }}>
            {status === 'idle' && <span style={{ color: 'var(--text-muted)' }}>The picture fills in, one stage at a time, after you press Run.</span>}
            {status !== 'idle' && (
              <span>
                <strong>{done ? 'Run complete.' : `Stage ${stage} of ${LAST_STAGE}: ${STAGE_NAMES[stage]}.`}</strong>{' '}
                {done
                  ? 'Pictures 1 and 2 are drawn. Your predictions are recorded and not marked here.'
                  : STAGE_LINES[stage]}
              </span>
            )}
          </p>

          {stage >= 1 && (
            <div>
              <PictureOne stage={stage} sizeGuess={sizeGuess} />
              <CaptionBlock
                title="Picture 1"
                intro={`Panel A draws both black holes on the same scale of angle in the sky. “µas” stands for a millionth of an arcsecond, and the bar at the bottom of panel A shows ${pic.barMicroarcsec} µas. Panel B, which appears last, is on a different scale.`}
                bullets={[
                  ...(stage >= 2
                    ? [<><strong>Each black hole is drawn as circles round the same centre, added one at a time. Each circle means something different.</strong> They are all on the same scale, so you can compare them.</>]
                    : []),
                  ...(stage >= 2
                    ? [<><strong>The small dark circle with a violet outline</strong> is the black hole itself: its edge, called the event horizon. Anything that crosses this edge never comes back out. We work out its size from the black hole’s mass.</>]
                    : []),
                  ...(stage >= 3
                    ? [<><strong>The dashed cyan circle</strong> is the black hole’s <strong>shadow</strong>: the dark patch we expect to see. We do not photograph it. We <em>calculate</em> its size with a formula, from the black hole’s mass and its distance from us.</>]
                    : []),
                  ...(stage >= 4
                    ? [<><strong>The solid orange ring, with a pale orange band round it,</strong> is what the telescope <em>actually photographed</em>: the bright ring of glowing gas. We <em>measure</em> how wide it looks. The pale band is the <strong>give-or-take</strong>: the true width could be anywhere inside the band. The two circles this experiment compares are <strong>the dashed cyan circle (calculated)</strong> and <strong>the solid orange ring (measured)</strong>.</>]
                    : []),
                  ...(stage >= 5
                    ? [
                        <><strong>Panel B</strong> is a ruler on a different scale, which shows the <em>ratio</em> of the two shadows. 1 means the same width. Each step to the right is a multiplication, so 10 is ten times as wide and 0.1 is ten times narrower.</>,
                        <><strong>The white box</strong> is your guess. It is only a marker, because a guess has no size of its own here.</>,
                      ]
                    : []),
                ]}
                worked={
                  stage >= 4 ? (
                    <>
                      Sagittarius A* ring: about {sgrRow.ringMicroarcsec} µas. M87* ring: about {m87Row.ringMicroarcsec} µas. Divide {m87Row.ringMicroarcsec} ÷ {sgrRow.ringMicroarcsec} and you get about{' '}
                      {n2(pic.measuredRatio)}. So the M87* ring is a little narrower than Sagittarius A*’s.
                    </>
                  ) : null
                }
                lookFor={[
                  ...(stage >= 3
                    ? [
                        {
                          look: 'the dashed cyan circles in panel A.',
                          means: `the calculated shadow of M87* is about ${n1(m87Row.shadowMicroarcsec)} µas and of Sagittarius A* about ${n1(sgrRow.shadowMicroarcsec)} µas. They are close in width even though the masses differ by about ${Math.round(massRatio() / 100) * 100} times.`,
                          matters: 'mass is only half of what sets how wide a shadow looks.',
                        },
                      ]
                    : []),
                  ...(stage >= 4
                    ? [
                        {
                          look: 'the solid orange rings.',
                          means: `the measured rings are about ${m87Row.ringMicroarcsec} and ${sgrRow.ringMicroarcsec} µas. They sit close to the dashed cyan circles but are not the same circles.`,
                          matters: 'the rings are gas and the shadows are calculated, so how close they come is a real test.',
                        },
                      ]
                    : []),
                  ...(stage >= 5
                    ? [
                        {
                          look: 'panel B.',
                          means: `the calculated and measured ratios sit at about ${n2(pic.calculatedRatio)} and ${n2(pic.measuredRatio)}, with your white box beside them.`,
                          matters: 'it shows in one glance whether your guess was above, below or close to the real result. The tutor says what that means.',
                        },
                      ]
                    : []),
                ]}
                whereFrom={
                  <>
                    <strong>Measured (by the Event Horizon Telescope):</strong> the ring sizes, {m87Row.ringMicroarcsec} ± {m87Row.ringUncertainty} µas for M87* and {sgrRow.ringMicroarcsec} ± {sgrRow.ringUncertainty} µas for
                    Sagittarius A*, and the masses and distances behind them. <strong>Calculated here:</strong> the horizons, the shadows and the ratios, from one formula. <strong>Imagined:</strong>{' '}
                    nothing. Your guess is drawn in white and never changes the real picture.
                  </>
                }
              />
            </div>
          )}

          {stage >= 6 && (
            <div>
              <PictureTwoSvg stage={stage} horizonGuess={horizonGuess} />
              <CaptionBlock
                title="Picture 2"
                intro="It is a bird’s-eye view of one black hole, with beams of light coming in from the right. All distances are measured in one unit: the distance from the black hole’s centre to its edge."
                bullets={[
                  ...(stage >= 6 ? [<><strong>The dark circle with a violet outline</strong> is the black hole’s edge (event horizon).</>] : []),
                  ...(stage >= 7
                    ? [
                        <><strong>The red lines</strong> are beams of light that were captured. <strong>The green lines</strong> are beams that got away, bent on the way. How far from the centre a beam would pass if gravity did nothing is its <strong>aim</strong>, written beside each beam.</>,
                      ]
                    : []),
                  ...(stage >= 8
                    ? [
                        <><strong>The dashed cyan circle</strong> is the boundary between the aims that are captured and the aims that escape. This is the shadow’s edge. It is calculated here.</>,
                        <><strong>The white dashed circle and the box</strong> are your guess for Prediction 2. It is only a guessed circle, drawn to compare with the real one.</>,
                      ]
                    : []),
                ]}
                worked={
                  stage >= 7 ? (
                    <>
                      A beam aimed {pic2.beams[2].aim} units from the centre is captured. One aimed at {pic2.beams[3].aim} escapes, but is bent by about {Math.round(pic2.beams[3].bendDegrees ?? 0)} degrees, almost turned back.
                      {stage >= 8 ? ' The line between the two is the dashed cyan circle.' : ''}
                    </>
                  ) : null
                }
                lookFor={[
                  ...(stage >= 7
                    ? [
                        {
                          look: 'the red and green beams side by side.',
                          means: 'beams aimed a little closer in are captured, and beams aimed a little further out get away.',
                          matters: 'it shows that the shadow’s edge is a sharp boundary. The dark patch is exactly the aims that are captured.',
                        },
                      ]
                    : []),
                  ...(stage >= 8
                    ? [
                        {
                          look: 'the dashed cyan circle against the dark circle.',
                          means: `the shadow’s circle is about ${n1(pic2.shadowOverHorizon)} times as wide as the edge circle.`,
                          matters: 'it shows how much of the sky goes dark. The dark patch is not the black hole itself.',
                        },
                        {
                          look: 'the white circle.',
                          means: 'your guessed width, beside the real one.',
                          matters: 'it shows at a glance how your guess compares with the real result. The tutor says what that means.',
                        },
                      ]
                    : []),
                ]}
                whereFrom={
                  <>
                    <strong>Measured:</strong> nothing in this picture is a measurement. <strong>Calculated here:</strong> the beams and the capture limit, from the same calculation as Black Holes Experiment 4, for a
                    black hole that does not spin. <strong>Imagined:</strong> the beams’ aims, chosen for the picture. Your guess is drawn in white and never changes the real picture.
                  </>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
