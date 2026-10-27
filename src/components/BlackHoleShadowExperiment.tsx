import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { HORIZON_CHOICES, SIZE_CHOICES, massRatio, distanceRatio, pictureOne, pictureTwo, horizonGuessMarker, ratioRulerPosition, sizeGuessMarker, RATIO_RULER_MIN, RATIO_RULER_MAX, TRIAL_MASS_CHOICES_SOLAR, TRIAL_DISTANCE_CHOICES_PC, TRIAL_RULER_MIN_MICROARCSEC, TRIAL_RULER_MAX_MICROARCSEC, trialPicture, trialRulerPosition, checkUpRows, readingOf, ratioRow, fromMassRows, rangeRows, predictionsBeside } from '../physics/blackHoleShadow'
import type { HorizonChoice, SizeChoiceId } from '../physics/blackHoleShadow'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { LookForList, ResultsTable } from './WideBinariesExperiment'
import type { LookFor } from './WideBinariesExperiment'

// Frontier and Beyond, Experiment 21 (docs/experiments/frontier-and-beyond/21-black-hole-shadow.md).
// STEPS 2, 4, 5a and 5b (the interface skeleton and the introduction, the two predictions, the run and Picture 1, then Picture 2): this file has the title, the status line, the introduction, the new-word list, the collapsed "Words and formulas" panel
// and the "Want to know more?" links. It also has the two predictions (Part 1), the run (eight stages), Picture 1 with Prediction 1's guess and Picture 2 with Prediction 2's guess. It has Part 2 (two trial controls and Drawing A, step 6) and Part 3 (the results, step 7) but no tutor or chapter summary yet; those are later steps (CLAUDE.md §6). All wording is a DRAFT for
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
const TRIAL_COLOR = '#f472b6' // pink: imagined for the question (a trial black hole in Part 2)

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

// A number for a label: three significant figures, with commas.
function fmt(x: number): string {
  return Number(x.toPrecision(3)).toLocaleString('en-US')
}

const MASS_TRIAL_LABELS: Record<number, string> = {
  4e6: '4 million Suns (Sagittarius A*’s mass)',
  1e8: '100 million Suns',
  1e9: '1 billion Suns',
  6.5e9: '6.5 billion Suns (M87*’s mass)',
}
const DISTANCE_TRIAL_LABELS: Record<number, string> = {
  8150: '8.15 kiloparsecs (Sagittarius A*’s distance)',
  100000: '100 kiloparsecs',
  1e6: '1 megaparsec',
  16.8e6: '16.8 megaparsecs (M87*’s distance)',
}

// Drawing A (Part 2): a trial black hole's shadow on a ruler of angles that goes up in steps of ten. Imagined for the question, drawn in pink.
function TrialDrawing({ trial }: { trial: ReturnType<typeof trialPicture> }) {
  const x0 = 40
  const x1 = 520
  const rulerY = 150
  const x = (pos: number) => x0 + pos * (x1 - x0)
  const ticks = [0.01, 0.1, 1, 10, 100, 1000, 10000, 100000]
  const [sgr, m87] = trial.realMarks
  const shadowX = x(trial.shadowPosition)
  const horizonX = x(trial.horizonPosition)
  const labelW = 340
  const boxX = Math.min(540 - labelW, Math.max(20, shadowX - labelW / 2))
  return (
    <svg
      width={VIEW_WIDTH}
      height={290}
      viewBox={`0 0 ${VIEW_WIDTH} 290`}
      style={svgStyle}
      role="img"
      aria-label={`Drawing A, your own trial. A ruler of angles in the sky, in millionths of an arcsecond, from ${TRIAL_RULER_MIN_MICROARCSEC} to ${TRIAL_RULER_MAX_MICROARCSEC.toLocaleString('en-US')}, going up in steps of ten. Cyan dashed ticks mark the calculated shadows of the real black holes: Sagittarius A star about ${fmt(sgr.shadowMicroarcsec)} and M87 star about ${fmt(m87.shadowMicroarcsec)}. Your trial black hole, of ${fmt(trial.massSolar)} Suns at ${fmt(trial.distancePc)} parsecs, has a calculated shadow of about ${fmt(trial.shadowMicroarcsec)} and a calculated edge of about ${fmt(trial.horizonMicroarcsec)}, drawn in pink and violet. These are trial values, not real black holes.`}
    >
      <text x={20} y={22} fill={TEXT_COLOR} fontSize="13" fontWeight="bold">
        Drawing A: how wide your trial black hole’s shadow looks
      </text>
      <SvgLines x={20} y={38} lines={['A ruler of angles in the sky, in µas (millionths of an arcsecond). Each step to the right is ten times as wide.']} fill={MUTED_COLOR} />
      <line x1={x0} y1={rulerY} x2={x1} y2={rulerY} stroke={MUTED_COLOR} strokeWidth={1} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(trialRulerPosition(t))} y1={rulerY} x2={x(trialRulerPosition(t))} y2={rulerY + 5} stroke={MUTED_COLOR} />
          <SvgLines x={x(trialRulerPosition(t))} y={rulerY + 17} lines={[t.toLocaleString('en-US')]} fill={MUTED_COLOR} size={9} anchor="middle" />
        </g>
      ))}

      {/* The real black holes' calculated shadows: they never move. */}
      <line x1={x(m87.position)} y1={rulerY - 44} x2={x(m87.position)} y2={rulerY} stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="5 3" />
      <line x1={x(sgr.position)} y1={rulerY - 62} x2={x(sgr.position)} y2={rulerY} stroke={CALC_COLOR} strokeWidth={2} strokeDasharray="5 3" />
      <SvgLines x={x(m87.position) - 4} y={rulerY - 48} lines={[`M87*’s shadow, calculated: ${fmt(m87.shadowMicroarcsec)} µas`]} fill={CALC_COLOR} bold size={10} anchor="end" />
      <SvgLines x={x(sgr.position) + 4} y={rulerY - 66} lines={[`Sagittarius A*’s shadow, calculated: ${fmt(sgr.shadowMicroarcsec)} µas`]} fill={CALC_COLOR} bold size={10} />

      {/* The trial black hole: its edge (violet) and its shadow (pink). */}
      <circle cx={horizonX} cy={rulerY} r={6} fill="#05070f" stroke={BLACK_HOLE_COLOR} strokeWidth={2.5} />
      <circle cx={shadowX} cy={rulerY} r={7} fill={TRIAL_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <line x1={shadowX} y1={rulerY + 24} x2={shadowX} y2={rulerY + 36} stroke={TRIAL_COLOR} strokeWidth={2} />
      <rect x={boxX} y={rulerY + 36} width={labelW} height={48} rx={4} fill="#0b1020" stroke={TRIAL_COLOR} strokeWidth={2} />
      <SvgLines x={boxX + 10} y={rulerY + 52} lines={[`YOUR TRIAL: ${fmt(trial.massSolar)} Suns, ${fmt(trial.distancePc)} parsecs away`]} fill={TRIAL_COLOR} bold size={10} />
      <SvgLines x={boxX + 10} y={rulerY + 68} lines={[`pink dot: its shadow, calculated, ${fmt(trial.shadowMicroarcsec)} µas`]} fill={TRIAL_COLOR} bold size={10} />
      <SvgLines x={20} y={rulerY + 104} lines={[`violet circle: its edge (event horizon), calculated, ${fmt(trial.horizonMicroarcsec)} µas`]} fill={BLACK_HOLE_COLOR} bold size={10} />
      <SvgLines x={20} y={rulerY + 124} lines={['Pink and violet are imagined for the question: trial values, not real black holes.']} fill={MUTED_COLOR} size={9} />
    </svg>
  )
}


function kmText(x: number): string {
  return x >= 1e9 ? `${(x / 1e9).toFixed(1)} billion km` : `${(x / 1e6).toFixed(1)} million km`
}
function rangeText(r: { low: number; high: number }): string {
  return `${n1(r.low)} to ${n1(r.high)} µas`
}
const noteStyle = { fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '1.5rem' } as const

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
  const [trialMass, setTrialMass] = useState<number>(TRIAL_MASS_CHOICES_SOLAR[0])
  const [trialDistance, setTrialDistance] = useState<number>(TRIAL_DISTANCE_CHOICES_PC[0])
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
    setTrialMass(TRIAL_MASS_CHOICES_SOLAR[0])
    setTrialDistance(TRIAL_DISTANCE_CHOICES_PC[0])
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
  const trial = trialPicture(trialMass, trialDistance)
  const checkUp = checkUpRows()
  const ratios = ratioRow()
  const fromMass = fromMassRows()
  const ranges = rangeRows()
  const beside = sizeGuess && horizonGuess !== null ? predictionsBeside(sizeGuess, horizonGuess) : null
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

        {done && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #be185d' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#be185d' }}>Part 2: Now try it yourself</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>What we are about to do.</strong> Above, in Picture 1 of Part 1, you saw two real black holes, Sagittarius A* and M87*, and how wide each one’s shadow looks from Earth (the dashed cyan
              circles). Those two black holes have one mass and one distance each. Here you can try other values: pick a mass and a distance for a black hole of your own, and one drawing will show how
              wide its shadow would look. The real pictures above do not change, and your two guesses do not change this drawing: only the two settings below do.
            </p>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>These are your own trial values, not real black holes.</strong> Each button is a number to try. For example, if you choose {fmt(trial.massSolar)} Suns and{' '}
              {fmt(trial.distancePc)} parsecs, the drawing shows a black hole of that mass at that distance, and works out the width its shadow would have in our sky. It is imagined for the
              question, and it is drawn in pink. The same simple formula as in Picture 1 is used, so it leaves out the glowing gas and the effect of spin.
            </p>

            {(
              [
                {
                  title: 'How heavy is the trial black hole?',
                  choices: TRIAL_MASS_CHOICES_SOLAR.map((v) => ({ value: v, label: MASS_TRIAL_LABELS[v] })),
                  value: trialMass,
                  set: setTrialMass,
                },
                {
                  title: 'How far away is it?',
                  choices: TRIAL_DISTANCE_CHOICES_PC.map((v) => ({ value: v, label: DISTANCE_TRIAL_LABELS[v] })),
                  value: trialDistance,
                  set: setTrialDistance,
                },
              ] as const
            ).map((control) => (
              <div key={control.title} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{control.title}</label>
                <div>
                  {control.choices.map((choice) => (
                    <button
                      key={choice.value}
                      type="button"
                      onClick={() => (control.set as (v: number) => void)(choice.value)}
                      className={`toggle-button${control.value === choice.value ? ' is-selected' : ''}`}
                      style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <TrialDrawing trial={trial} />
            <CaptionBlock
              title="Drawing A"
              intro={`It shows how wide the shadow of your trial black hole would look from Earth. The ruler is a ruler of angles, in µas (millionths of an arcsecond), and it goes up in steps of ten (0.01, 0.1, 1, 10, 100 and so on), so that a very small angle and a very large one fit on the same ruler. It is imagined for the question, not observed.`}
              bullets={[
                <><strong>The pink dot</strong> is the shadow of your trial black hole, and <strong>the violet circle</strong> is its edge (event horizon). Both are calculated here, from the mass and the distance you chose. The shadow is always to the right of the edge, because it is wider.</>,
                <><strong>The cyan dashed lines</strong> are the calculated shadows of the two real black holes from Picture 1, Sagittarius A* and M87*. They do not move when you change a setting.</>,
                <><strong>The ruler goes up in steps of ten</strong>, so equal distances along it mean equal multiples of the angle, not equal amounts. Two shadows that are ten times apart in width are always the same distance apart on the ruler.</>,
                <><strong>“µas”</strong> is a millionth of an arcsecond, as in Picture 1.</>,
              ]}
              worked={
                <>
                  You chose {fmt(trial.massSolar)} Suns at {fmt(trial.distancePc)} parsecs. Compared with Sagittarius A*, that is {fmt(trial.massOverSgrA)} times the mass and {fmt(trial.distanceOverSgrA)} times the distance. Its
                  shadow is calculated to look {fmt(trial.shadowMicroarcsec)} µas wide, which is {fmt(trial.shadowOverSgrA)} times Sagittarius A*’s ({fmt(trial.realMarks[0].shadowMicroarcsec)} µas) and {fmt(trial.shadowOverM87)} times M87*’s ({fmt(trial.realMarks[1].shadowMicroarcsec)} µas).
                  {trial.sameAs ? ` These are ${trial.sameAs === 'sgrA' ? 'Sagittarius A*' : 'M87*'}’s own mass and distance, so the pink dot sits on its cyan line.` : ''}
                </>
              }
              lookFor={[
                {
                  look: 'the pink dot, against the two cyan dashed lines.',
                  means: `your trial shadow looks ${fmt(trial.shadowMicroarcsec)} µas wide, ${fmt(trial.shadowOverSgrA)} times the width of Sagittarius A*’s shadow.`,
                  matters: 'the width a shadow has in our sky is set by the mass and the distance together, so changing either setting moves the dot. Changing only one at a time shows what each does.',
                },
                {
                  look: 'the violet circle, beside the pink dot.',
                  means: `the edge looks ${fmt(trial.horizonMicroarcsec)} µas wide, and the shadow is ${fmt(trial.shadowMicroarcsec / trial.horizonMicroarcsec)} times as wide as the edge, for every trial you choose.`,
                  matters: 'it is the same 2.6 as in Picture 2: the shadow is a fixed multiple of the edge, so any change in the shadow is a change in the edge too.',
                },
              ]}
              whereFrom={
                <>
                  <strong>Measured:</strong> nothing in Drawing A is a measurement. <strong>Calculated here:</strong> the real black holes’ cyan lines (from the masses and distances published by the Event Horizon Telescope teams), and the pink dot and violet
                  circle, all from the same formula as Picture 1. <strong>Imagined for the question:</strong> the trial black hole itself, in pink and violet: its mass and its distance are chosen by you, and no such black hole was observed.
                  These are trial values and do not say that a real black hole is like that.
                </>
              }
            />
          </div>
        )}

        {done && (
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '6px solid #0f766e' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#0f766e' }}>Part 3: The results</h3>
            <p style={{ ...paragraph, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <strong>What we are about to do.</strong> Here are the numbers behind the pictures, set out in three tables, each with a short guide to reading it. These tables are the real numbers, so they
              never change with your guesses or with your settings in Part 2.
            </p>

            <div className="exp-card" style={{ padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <strong>Where this stands (as of October 2026).</strong>
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Strong evidence</strong> that the Event Horizon Telescope has imaged the rings of glowing gas round two black holes, and that their sizes are close to what the black holes’ masses and distances give.
                </li>
                <li>
                  <strong>Open:</strong> how tightly this tests gravity, because the masses and the link between a ring and a shadow carry their own give-or-take.
                </li>
                <li>
                  The numbers come from the abstracts and summaries of the Event Horizon Telescope’s papers. No paper was read in full for this page, so each number should be checked against its paper.
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <strong>Your predictions, beside the results.</strong> These are your guesses, shown again so that you can find the real number for each. They are not marked here.
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem' }}>
                <li>
                  <strong>Prediction 1</strong> (how wide M87*’s shadow looks, compared with Sagittarius A*’s): you guessed <strong>{sizeGuess ? `${SIZE_PHRASE[sizeGuess]}, a ratio of ${n2(beside?.sizeGuessRatio ?? 1)}` : '…'}</strong>. The real
                  calculated ratio is in Table 1, in the row “Size ratio”.
                </li>
                <li>
                  <strong>Prediction 2</strong> (how many times wider the shadow is than the black hole’s edge): you guessed <strong>{horizonGuess !== null ? `${horizonGuess} times` : '…'}</strong>. The real number is in Table 2, in the
                  row “Shadow width ÷ edge width”.
                </li>
              </ul>
            </div>

            <p style={paragraph}>
              <strong>How to read these results.</strong> A table of numbers is like a blood test: it means little until someone says what each number is and what it is compared with. So each table has a note under
              it, called “What this table tells us”. Table 1 is a check-up: it sets each calculated shadow beside the ring that was measured, and says in plain words how they compare. It does not say “good” or “bad”,
              because there is no accepted range for how closely a calculated shadow should match a ring. The <strong>give-or-take</strong> of a measurement is the “±” after it. “µas” is a millionth of an arcsecond.
            </p>

            <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 1. Check-up: the calculated shadow against the measured ring</p>
            <ResultsTable
              minWidth={640}
              head={['What we compare', 'Calculated here', 'Measured', 'How to read it']}
              rows={[
                ...checkUp.map((row) => {
                  const c = row.comparison
                  const reading = readingOf(c)
                  return [
                    `${row.blackHole.name}, ${row.ringLabel}`,
                    `${n1(c.calculated)} µas`,
                    `${c.measured} ± ${c.uncertainty} µas`,
                    `${n1(Math.abs(c.differenceMicroarcsec))} µas ${reading.side === 'smaller' ? 'smaller' : reading.side === 'larger' ? 'larger' : 'the same'} than the ring (${n1(Math.abs(c.differencePercent))} percent, ${n1(Math.abs(c.differenceInUncertainties))} give-or-takes). ${
                      reading.withinOneGiveOrTake ? 'Inside' : 'Outside'
                    } the ring’s give-or-take.${row.id === 'm87-later' ? ' See Table 3.' : ''}`,
                  ]
                }),
                [
                  `Size ratio, M87* ÷ Sagittarius A*${sizeGuess && beside ? ` [your guess for Prediction 1: ${n2(beside.sizeGuessRatio)}]` : ''}`,
                  n2(ratios.calculated),
                  `${n2(ratios.measured2019)} (2019 ring), ${n2(ratios.measuredLater)} (later ring)`,
                  'A little lower than the measured ratios. All three are below 1. No give-or-take is given for a ratio here, so no further comparison is made.',
                ],
              ]}
            />
            <div style={noteStyle}>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is:</strong> each calculated shadow beside the ring the telescope measured. The calculation uses only the mass and the distance.
                </li>
                <li>
                  <strong>What it means:</strong> all three calculated shadows are a little narrower than the measured rings. For Sagittarius A* and for M87*’s 2019 ring, the gap ({n1(Math.abs(checkUp[0].comparison.differenceMicroarcsec))} and{' '}
                  {n1(Math.abs(checkUp[1].comparison.differenceMicroarcsec))} µas) is smaller than the ring’s own give-or-take. For M87*’s later ring, which is measured much more precisely (± {checkUp[2].comparison.uncertainty}), the same {n1(Math.abs(checkUp[2].comparison.differenceMicroarcsec))} µas
                  gap is about {n1(Math.abs(checkUp[2].comparison.differenceInUncertainties))} give-or-takes.
                </li>
                <li>
                  <strong>Why it matters:</strong> the ring is glowing gas, not the shadow itself, and the formula is the simple one that leaves out spin. So a gap of this size does not by itself show the formula is wrong. Table 3 shows
                  how sure the calculated shadow is.
                </li>
                <li>
                  <strong>How sure the numbers are:</strong> the rings are measured, and the calculated shadows depend on masses and distances that carry their own give-or-take. M87*’s ring size was the same in the 2017, 2018 and 2021 observations
                  (43.9 ± 0.6 µas) while the brightness pattern round it changed. This page does not model that change.
                </li>
              </ul>
            </div>

            <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 2. From mass and distance to an angle in the sky</p>
            <ResultsTable
              minWidth={600}
              head={['Step', 'Sagittarius A*', 'M87*', 'How to read it']}
              rows={[
                ['Mass (Suns)', massPhrase(fromMass[0].massSolar), massPhrase(fromMass[1].massSolar), `M87* is ${Math.round(massRatio()).toLocaleString('en-US')} times heavier.`],
                ['Distance', distancePhrase(fromMass[0].distancePc), distancePhrase(fromMass[1].distancePc), `M87* is ${Math.round(distanceRatio()).toLocaleString('en-US')} times farther away.`],
                ['Edge (horizon) radius', kmText(fromMass[0].horizonRadiusKm), kmText(fromMass[1].horizonRadiusKm), 'From the mass, as in Black Holes Experiment 1.'],
                ['Shadow width', kmText(fromMass[0].shadowDiameterKm), kmText(fromMass[1].shadowDiameterKm), 'The width of the dark patch, across, in kilometres.'],
                [
                  `Shadow width ÷ edge width${horizonGuess !== null ? ` [your guess for Prediction 2: ${horizonGuess} times]` : ''}`,
                  n2(fromMass[0].shadowOverHorizon),
                  n2(fromMass[1].shadowOverHorizon),
                  'The same for both, because it comes from the same bending of light (Black Holes Experiment 4).',
                ],
                ['Angle in the sky (shadow)', `${n1(fromMass[0].shadowMicroarcsec)} µas`, `${n1(fromMass[1].shadowMicroarcsec)} µas`, `M87*’s is ${n2(ratios.calculated)} times Sagittarius A*’s.`],
              ]}
            />
            <div style={noteStyle}>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is:</strong> the steps from a black hole’s mass and distance to how wide its shadow looks, worked out the same way for both.
                </li>
                <li>
                  <strong>What it means:</strong> the shadow is always {n2(fromMass[0].shadowOverHorizon)} times as wide as the edge. Its angle in the sky is its width divided by the distance. Here the mass is{' '}
                  {Math.round(massRatio()).toLocaleString('en-US')} times larger and the distance {Math.round(distanceRatio()).toLocaleString('en-US')} times larger, so the angle is {Math.round(massRatio()).toLocaleString('en-US')} ÷{' '}
                  {Math.round(distanceRatio()).toLocaleString('en-US')} = {n2(ratios.calculated)} times as large.
                </li>
                <li>
                  <strong>Why it matters:</strong> these are the numbers behind both of your predictions. The reasons for them are for the tutor to explain.
                </li>
              </ul>
            </div>

            <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Table 3. How sure is the calculated shadow?</p>
            <ResultsTable
              minWidth={760}
              head={['Black hole and ring', 'Calculated shadow', 'Mass give-or-take only', 'Distance give-or-take only', 'Both together', 'Measured ring inside “both together”?']}
              rows={ranges.map((r) => [
                `${r.checkUp.blackHole.name}, ${r.checkUp.ringLabel}`,
                `${n1(r.range.centre)} µas`,
                rangeText(r.range.massOnly),
                rangeText(r.range.distanceOnly),
                rangeText(r.range.both),
                `${r.checkUp.comparison.measured} µas: ${r.ringInsideBoth ? 'yes' : 'no'}`,
              ])}
            />
            <div style={noteStyle}>
              <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                <strong>What this table tells us.</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>
                  <strong>What it is:</strong> the calculated shadow worked out again with the published give-or-takes on the mass and on the distance. The lowest value uses the lightest mass and the farthest distance; the highest uses the
                  heaviest mass and the nearest distance.
                </li>
                <li>
                  <strong>What it means:</strong> the calculated shadow has a give-or-take of its own, and most of it comes from the mass. M87*’s runs from about {n1(ranges[1].range.both.low)} to {n1(ranges[1].range.both.high)} µas and Sagittarius A*’s from about{' '}
                  {n1(ranges[0].range.both.low)} to {n1(ranges[0].range.both.high)} µas. Every measured ring in Table 1 lies inside its range, including M87*’s later ring, which was {n1(Math.abs(checkUp[2].comparison.differenceInUncertainties))} of its own give-or-takes from the central value.
                </li>
                <li>
                  <strong>Why it matters:</strong> it sets the size of the gap in Table 1 beside the real uncertainty of the calculation. The ranges are simple low-to-high ends of the published give-or-takes, not a statistical combination of them.
                  The more tightly the masses are known, the more tightly this test can be made.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
