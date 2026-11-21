import type { CSSProperties, ReactNode } from 'react'
import {
  BRIGHTNESS_RULER_MAX_SOLAR,
  BRIGHTNESS_RULER_MIN_SOLAR,
  FLICKER_ILLUSTRATION_DAYS,
  FUEL_RULER_MAX_SOLAR_PER_YEAR,
  FUEL_RULER_MIN_SOLAR_PER_YEAR,
  MILKY_WAY_LUMINOSITY_RANGE_SOLAR,
  MILKY_WAY_LUMINOSITY_SOLAR,
  MILKY_WAY_WIDTH_LIGHT_YEARS,
  NEPTUNE_ORBIT_WIDTH_AU,
  SECONDS_PER_YEAR,
  SPEED_OF_LIGHT,
  SUN_LUMINOSITY_W,
  SUN_MASS_KG,
  THREE_C_273_LUMINOSITY_SOLAR,
  WIDTH_RULER_MAX_LIGHT_DAYS,
  WIDTH_RULER_MIN_LIGHT_DAYS,
  brightnessRatio,
  brightnessRatioRange,
  brightnessRulerPosition,
  fuelRulerPosition,
  galaxyToSourceWidthRatio,
  lightDayAU,
  luminosityWatts,
  massPerSecondKg,
  milkyWayWidthLightDays,
  sizeLimitAU,
  sizeLimitInNeptuneOrbits,
  fuelGuessMarker,
  ratioGuessMarker,
  widthGuessMarker,
  widthRulerPosition,
} from '../physics/quasarBrightness'
import type { FuelChoiceId, QuasarResult, RatioChoiceId, WidthChoiceId } from '../physics/quasarBrightness'
import { LookForList } from './WideBinariesExperiment'
import { WhereFrom } from './TidalEffectExperiment'
import { formatNumber, formatPercent, formatSuns, fuelLabel, powerOfTen, ratioLabel, scientific, widthLabel } from './QuasarBrightnessFormat'

// Black Holes 11, Steps 3 and 4: the three real pictures and their captions (docs/experiments/black-holes-and-strong-gravity/11-why-do-quasars-outshine-galaxies.md,
// "Pictures"). The real drawing never changes with a guess. When a `guess` is given (Step 4), a separate white YOUR GUESS box, joined by a line to a white mark
// on the ruler, is added below the real picture. Every position and number comes from the physics module; the drawing only places them (CLAUDE.md §9).
// Nothing else here is white: white is kept for the learner's guess.
// Draft wording, for the owner's approval (CLAUDE.md §28.1).

const SVG_STYLE: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: '1px solid var(--border-color, #ccc)',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#0b1020',
}
const TEXT_COLOR = '#e2e8f0'
const MUTED_COLOR = '#94a3b8'
const TICK_COLOR = '#cbd5e1'
const MILKY_WAY_COLOR = '#f59e0b'
const QUASAR_COLOR = '#38bdf8'
const INFALL_COLOR = '#34d399'
const FUSION_COLOR = '#fb923c'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }
const captionStyle = { fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' } as const

// ---- The learner's guess: a white mark on the ruler, joined by a line to a white YOUR GUESS box below the picture ----

const GUESS_COLOR = '#ffffff'
const GUESS_EXTRA_HEIGHT = 66
const GUESS_BOX_WIDTH = 330

// The line is drawn early, so that the picture's own text and ticks sit on top of it.
function GuessLine({ x, axisY, boxY }: { x: number; axisY: number; boxY: number }) {
  const boxX = Math.min(Math.max(x - GUESS_BOX_WIDTH / 2, 8), 600 - 8 - GUESS_BOX_WIDTH)
  const startX = Math.min(Math.max(x, boxX + 12), boxX + GUESS_BOX_WIDTH - 12)
  return <line x1={startX} y1={boxY} x2={x} y2={axisY + 4} stroke={GUESS_COLOR} strokeWidth="2" />
}

// The mark and the box are drawn last, so that nothing hides them.
function GuessMark({ x, axisY, boxY, lines }: { x: number; axisY: number; boxY: number; lines: string[] }) {
  const boxX = Math.min(Math.max(x - GUESS_BOX_WIDTH / 2, 8), 600 - 8 - GUESS_BOX_WIDTH)
  const height = 14 * (lines.length + 1) + 12
  return (
    <g data-testid="guess-mark">
      <rect x={x - 2.5} y={axisY - 18} width="5" height="22" fill={GUESS_COLOR} />
      <polygon points={`${x},${axisY + 4} ${x - 7},${axisY + 15} ${x + 7},${axisY + 15}`} fill={GUESS_COLOR} />
      <rect x={boxX} y={boxY} width={GUESS_BOX_WIDTH} height={height} rx="5" fill="#0b1020" stroke={GUESS_COLOR} strokeWidth="2.5" />
      <text x={boxX + 10} y={boxY + 18} fill={GUESS_COLOR} fontSize="11" fontWeight="bold">
        YOUR GUESS
      </text>
      {lines.map((line, i) => (
        <text key={line} x={boxX + 10} y={boxY + 32 + 14 * i} fill={GUESS_COLOR} fontSize="11">
          {line}
        </text>
      ))}
    </g>
  )
}

const X0 = 40
const X1 = 560
const xAt = (position: number) => X0 + position * (X1 - X0)

// The marks along a log ruler: a tick at every power of ten from `fromExponent` to `toExponent`.
function Ticks({ fromExponent, toExponent, axisY, labelOf, positionOf }: { fromExponent: number; toExponent: number; axisY: number; labelOf: (e: number) => string; positionOf: (e: number) => number }) {
  const marks = []
  for (let e = fromExponent; e <= toExponent; e++) marks.push(e)
  return (
    <g>
      {marks.map((e) => (
        <g key={e}>
          <line x1={xAt(positionOf(e))} y1={axisY} x2={xAt(positionOf(e))} y2={axisY + 6} stroke={TICK_COLOR} />
          <text x={xAt(positionOf(e))} y={axisY + 19} textAnchor="middle" fontSize="9" fill={MUTED_COLOR}>
            {labelOf(e)}
          </text>
        </g>
      ))}
    </g>
  )
}

// ---- Picture A: brightness ----

export function BrightnessPicture({ guess = null }: { guess?: RatioChoiceId | null }) {
  const [mwLow, mwHigh] = MILKY_WAY_LUMINOSITY_RANGE_SOLAR
  const range = brightnessRatioRange(THREE_C_273_LUMINOSITY_SOLAR)
  const axisY = 130
  const mwX = xAt(brightnessRulerPosition(MILKY_WAY_LUMINOSITY_SOLAR))
  const mwX1 = xAt(brightnessRulerPosition(mwLow))
  const mwX2 = xAt(brightnessRulerPosition(mwHigh))
  const qX = xAt(brightnessRulerPosition(THREE_C_273_LUMINOSITY_SOLAR))
  const mark = guess ? ratioGuessMarker(guess) : null
  const guessX = mark ? xAt(mark.position) : 0
  return (
    <svg
      viewBox={`0 0 600 ${200 + (mark ? GUESS_EXTRA_HEIGHT : 0)}`}
      role="img"
      aria-label={`Picture A: a ruler of brightness in which each tick is 10 times brighter than the one before. The Milky Way sits at about 20 to 30 billion Suns. The quasar 3C 273 sits about ${formatNumber(brightnessRatio(THREE_C_273_LUMINOSITY_SOLAR))} times further along, at about 4 trillion Suns.`}
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Picture A: how much light does each give out?
      </text>
      {mark && <GuessLine x={guessX} axisY={axisY} boxY={190} />}
      <line x1={X0} y1={axisY} x2={X1} y2={axisY} stroke={TICK_COLOR} strokeWidth="2" />
      <Ticks
        fromExponent={Math.log10(BRIGHTNESS_RULER_MIN_SOLAR)}
        toExponent={Math.log10(BRIGHTNESS_RULER_MAX_SOLAR)}
        axisY={axisY}
        labelOf={powerOfTen}
        positionOf={(e) => brightnessRulerPosition(10 ** e)}
      />
      <text x={(X0 + X1) / 2} y={axisY + 38} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
        brightness, in Suns (each tick is 10 times brighter than the one to its left; {powerOfTen(12)} is 1 trillion Suns)
      </text>

      {/* The ratio, drawn first so the labels sit on top of its guide lines. */}
      <line x1={mwX} y1={64} x2={mwX} y2={axisY - 52} stroke={MUTED_COLOR} strokeDasharray="3 3" />
      <line x1={qX} y1={64} x2={qX} y2={axisY - 52} stroke={MUTED_COLOR} strokeDasharray="3 3" />
      <line x1={mwX + 4} y1={64} x2={qX - 4} y2={64} stroke={TEXT_COLOR} strokeWidth="1.5" />
      <polygon points={`${qX},64 ${qX - 8},60 ${qX - 8},68`} fill={TEXT_COLOR} />
      <polygon points={`${mwX},64 ${mwX + 8},60 ${mwX + 8},68`} fill={TEXT_COLOR} />
      <text x={(mwX + qX) / 2} y={56} textAnchor="middle" fontSize="11" fontWeight="bold" fill={TEXT_COLOR} style={HALO}>
        about {formatNumber(brightnessRatio(THREE_C_273_LUMINOSITY_SOLAR))} times brighter ({formatNumber(range.low)} to {formatNumber(range.high)})
      </text>

      {/* The Milky Way: a band for the published range, and its midpoint. */}
      <rect x={mwX1} y={axisY - 14} width={mwX2 - mwX1} height="14" fill={MILKY_WAY_COLOR} fillOpacity="0.9" />
      <text x={mwX} y={axisY - 38} textAnchor="middle" fontSize="11" fontWeight="bold" fill={MILKY_WAY_COLOR} style={HALO}>
        Milky Way
      </text>
      <text x={mwX} y={axisY - 26} textAnchor="middle" fontSize="10" fill={MUTED_COLOR} style={HALO}>
        about 20 to 30 billion Suns
      </text>

      {/* The quasar: a dot. */}
      <circle cx={qX} cy={axisY - 7} r="7" fill={QUASAR_COLOR} />
      <text x={qX} y={axisY - 38} textAnchor="middle" fontSize="11" fontWeight="bold" fill={QUASAR_COLOR} style={HALO}>
        3C 273 (a quasar)
      </text>
      <text x={qX} y={axisY - 26} textAnchor="middle" fontSize="10" fill={MUTED_COLOR} style={HALO}>
        about 4 trillion Suns
      </text>
      {mark && <GuessMark x={guessX} axisY={axisY} boxY={190} lines={['Brightness compared with the Milky Way:', ratioLabel(guess!)]} />}
    </svg>
  )
}

export function BrightnessCaption({ withGuess = false }: { withGuess?: boolean }) {
  const range = brightnessRatioRange(THREE_C_273_LUMINOSITY_SOLAR)
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this diagram.</strong> This picture compares how much light two things give out. Brightness is counted in <strong>Suns</strong>: 1 Sun
        is as much light as our own Sun gives out. The line is a <strong>ruler</strong>, and each tick is <strong>10 times</strong> brighter than the tick to its left,
        so the ruler can hold very small and very large numbers on one page. {powerOfTen(9)} is 1 billion Suns, {powerOfTen(10)} is 10 billion, and {powerOfTen(12)} is
        1 trillion (a thousand billion). A step of two ticks is 100 times brighter. A good comparison is a sound-level scale, where each step up is a much louder sound.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong>The line and its ticks.</strong> Further to the right means brighter. The numbers under the ticks are powers of ten, written like {powerOfTen(12)}.
        </li>
        <li>
          <strong style={{ color: MILKY_WAY_COLOR }}>Amber band, the Milky Way.</strong> Our own galaxy, all its stars together. Its brightness is not known exactly: the
          two sources read give about 20 and 30 billion Suns, so the band covers that stretch.
        </li>
        <li>
          <strong style={{ color: QUASAR_COLOR }}>Sky-blue dot, 3C 273.</strong> The first quasar found, at about 4 trillion Suns. Published values differ (about 2, 3.6
          and 5 trillion), so this is a round value for the comparison, and not an exact measurement.
        </li>
        <li>
          <strong>The arrow.</strong> How many times brighter the quasar is than the Milky Way: the quasar’s brightness divided by the Milky Way’s. A longer arrow means
          a bigger ratio.
        </li>
        {withGuess && (
          <li>
            <strong>The white YOUR GUESS box</strong> is your guess, joined by a line to a white mark on the ruler. It sits where your answer would fall: your number of times, multiplied by the Milky Way’s brightness of 25 billion Suns (the middle of the stretch). Compare it with the sky-blue dot. It shows only your guess, and it is not a measurement.
          </li>
        )}
      </ul>
      {withGuess && (
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>What appears when.</strong> The real picture is drawn first, from the physics, and does not depend on your guess. The white box and mark are added beside it, and a different guess moves the white mark and changes nothing else.
        </p>
      )}

      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>A worked moment.</strong> With the Milky Way at the middle of its stretch, 25 billion Suns: 4,000,000,000,000 ÷ 25,000,000,000 = {formatNumber(brightnessRatio(THREE_C_273_LUMINOSITY_SOLAR))}.
        At the two ends of the stretch (30 billion and 20 billion Suns) the answer is {formatNumber(range.low)} and {formatNumber(range.high)}.
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          {
            look: 'the gap between the amber band and the sky-blue dot',
            means: `3C 273 gives out about ${formatNumber(brightnessRatio(THREE_C_273_LUMINOSITY_SOLAR))} times as much light as the whole Milky Way, from the numbers on the ruler`,
            matters: 'this is the first half of the puzzle: a single object outshines a whole galaxy of stars',
          },
          {
            look: 'the width of the amber band',
            means: `the Milky Way’s own brightness is uncertain by about one and a half times (20 to 30 billion Suns), which moves the ratio between ${formatNumber(range.low)} and ${formatNumber(range.high)}`,
            matters: 'it shows how sure the answer is: the quasar is well over 100 times brighter whichever end of the stretch is right',
          },
        ]}
      />
      <WhereFrom>
        <strong>Measured:</strong> the light output of the Milky Way and of 3C 273, by astronomers. The Milky Way’s value is about 2 × {powerOfTen(10)} Suns on a
        Caltech course slide and about 30 billion on a Scientific American page, and no NASA or ESA value was found. 3C 273’s published values are about 2, 3.6 and 5
        trillion Suns on three pages, so the page uses about 4 trillion and says so. <strong>Calculated here:</strong> the ratio. <strong>Imagined:</strong> nothing. {withGuess && <>The white mark is your guess, drawn where it would fall.</>}
      </WhereFrom>
    </div>
  )
}

// ---- Picture B: size ----

export function SizePicture({ guess = null }: { guess?: WidthChoiceId | null }) {
  const axisY = 140
  const minE = Math.log10(WIDTH_RULER_MIN_LIGHT_DAYS)
  const maxE = Math.log10(WIDTH_RULER_MAX_LIGHT_DAYS)
  const days = FLICKER_ILLUSTRATION_DAYS
  const limitX = xAt(widthRulerPosition(days))
  const neptuneDays = NEPTUNE_ORBIT_WIDTH_AU / lightDayAU()
  const neptuneX = xAt(widthRulerPosition(neptuneDays))
  const yearX = xAt(widthRulerPosition(365.25))
  const galaxyX = xAt(widthRulerPosition(milkyWayWidthLightDays()))
  const mark = guess ? widthGuessMarker(guess) : null
  const guessX = mark ? xAt(mark.position) : 0
  const labelOf = (e: number) => {
    const v = 10 ** e
    return v >= 1e6 ? `${(v / 1e6).toLocaleString('en-US')} million` : v.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return (
    <svg
      viewBox={`0 0 600 ${240 + (mark ? GUESS_EXTRA_HEIGHT : 0)}`}
      role="img"
      aria-label={`Picture B: a ruler of widths in light-days, each tick 10 times wider than the one before. Neptune's orbit is a little under half a light-day across. A source that changes in ${days} days is no wider than ${days} light-days. One light-year is 365 light-days. The Milky Way is about 36 million light-days across, about ${formatNumber(galaxyToSourceWidthRatio(days))} times wider than that limit.`}
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Picture B: how wide can the source be?
      </text>
      {mark && <GuessLine x={guessX} axisY={axisY} boxY={230} />}
      <line x1={X0} y1={axisY} x2={X1} y2={axisY} stroke={TICK_COLOR} strokeWidth="2" />
      <Ticks fromExponent={minE} toExponent={maxE} axisY={axisY} labelOf={labelOf} positionOf={(e) => widthRulerPosition(10 ** e)} />
      <text x={(X0 + X1) / 2} y={axisY + 38} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
        width, in light-days (each tick is 10 times wider than the one to its left)
      </text>

      {/* The stretch the source must fit in: from the left end of the ruler to the size limit. */}
      <rect x={X0} y={axisY - 12} width={limitX - X0} height="12" fill={QUASAR_COLOR} fillOpacity="0.85" />
      <text x={limitX} y={axisY - 36} textAnchor="middle" fontSize="11" fontWeight="bold" fill={QUASAR_COLOR} style={HALO}>
        size limit for a flicker of {days} days
      </text>
      <text x={limitX} y={axisY - 24} textAnchor="middle" fontSize="10" fill={MUTED_COLOR} style={HALO}>
        {days} light-days, about {formatNumber(sizeLimitAU(days))} AU
      </text>

      {/* The comparison marks. */}
      <line x1={neptuneX} y1={axisY} x2={neptuneX} y2={axisY + 24} stroke={MUTED_COLOR} />
      <circle cx={neptuneX} cy={axisY} r="4" fill={MILKY_WAY_COLOR} />
      <text x={neptuneX} y={axisY + 56} textAnchor="middle" fontSize="10" fill={MILKY_WAY_COLOR} style={HALO}>
        Neptune’s orbit
      </text>
      <text x={neptuneX} y={axisY + 68} textAnchor="middle" fontSize="9" fill={MUTED_COLOR} style={HALO}>
        {NEPTUNE_ORBIT_WIDTH_AU} AU across
      </text>
      <line x1={yearX} y1={axisY} x2={yearX} y2={axisY + 44} stroke={MUTED_COLOR} />
      <circle cx={yearX} cy={axisY} r="4" fill={MILKY_WAY_COLOR} />
      <text x={yearX} y={axisY + 56} textAnchor="middle" fontSize="10" fill={MILKY_WAY_COLOR} style={HALO}>
        one light-year
      </text>
      <text x={yearX} y={axisY + 68} textAnchor="middle" fontSize="9" fill={MUTED_COLOR} style={HALO}>
        365 light-days
      </text>
      <circle cx={galaxyX} cy={axisY} r="6" fill={MILKY_WAY_COLOR} />
      <text x={galaxyX + 6} y={axisY - 36} textAnchor="end" fontSize="11" fontWeight="bold" fill={MILKY_WAY_COLOR} style={HALO}>
        the Milky Way
      </text>
      <text x={galaxyX + 6} y={axisY - 24} textAnchor="end" fontSize="10" fill={MUTED_COLOR} style={HALO}>
        {MILKY_WAY_WIDTH_LIGHT_YEARS.toLocaleString('en-US')} light-years, about {formatNumber(milkyWayWidthLightDays() / 1e6)} million light-days
      </text>

      {/* The ratio. */}
      <line x1={limitX + 4} y1={64} x2={galaxyX - 4} y2={64} stroke={TEXT_COLOR} strokeWidth="1.5" />
      <polygon points={`${galaxyX},64 ${galaxyX - 8},60 ${galaxyX - 8},68`} fill={TEXT_COLOR} />
      <polygon points={`${limitX},64 ${limitX + 8},60 ${limitX + 8},68`} fill={TEXT_COLOR} />
      <text x={(limitX + galaxyX) / 2} y={56} textAnchor="middle" fontSize="11" fontWeight="bold" fill={TEXT_COLOR} style={HALO}>
        the galaxy is about {formatNumber(galaxyToSourceWidthRatio(days) / 1e6)} million times wider than the limit
      </text>
      <line x1={limitX} y1={64} x2={limitX} y2={axisY - 44} stroke={MUTED_COLOR} strokeDasharray="3 3" />
      <line x1={galaxyX} y1={64} x2={galaxyX} y2={axisY - 44} stroke={MUTED_COLOR} strokeDasharray="3 3" />
      {mark && <GuessMark x={guessX} axisY={axisY} boxY={230} lines={['Width of the source, compared with the Milky Way:', widthLabel(guess!)]} />}
    </svg>
  )
}

export function SizeCaption({ withGuess = false }: { withGuess?: boolean }) {
  const days = FLICKER_ILLUSTRATION_DAYS
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this diagram.</strong> This picture compares sizes, and shows how big a quasar’s light source can be. Widths are counted in
        <strong> light-days</strong>. A light-day is the distance light travels in one day: about 25.9 billion kilometers, which is {formatNumber(lightDayAU())} AU. (An AU,
        or astronomical unit, is the distance from the Earth to the Sun, about 150 million kilometers.) Again each tick is <strong>10 times</strong> wider than the tick to
        its left, so very small and very large widths can sit on one ruler. The reason light matters is in the introduction: a source cannot change brightness as a
        whole faster than light can cross it.
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong style={{ color: QUASAR_COLOR }}>Sky-blue bar, the size limit.</strong> If a quasar’s light changes over {days} days, its source cannot be wider than
          {' '}{days} light-days. The bar covers every width up to that limit. The flicker time of {days} days is an <strong>example</strong> for this picture, and not
          the measured flicker of 3C 273.
        </li>
        <li>
          <strong style={{ color: MILKY_WAY_COLOR }}>Amber dots, three things to compare with.</strong> Neptune’s orbit around the Sun ({NEPTUNE_ORBIT_WIDTH_AU} AU across,
          the edge of the planets), one light-year (the distance light goes in a year, 365 light-days), and the Milky Way (about {MILKY_WAY_WIDTH_LIGHT_YEARS.toLocaleString('en-US')} light-years across).
        </li>
        <li>
          <strong>The arrow.</strong> How many times wider the Milky Way is than the size limit. A longer arrow means a bigger ratio.
        </li>
        {withGuess && (
          <li>
            <strong>The white YOUR GUESS box</strong> is your guess, joined by a line to a white mark on the ruler. It sits where your answer would fall: your fraction of the Milky Way’s width, turned into light-days. Compare it with the end of the sky-blue bar. It shows only your guess, and it is not a measurement.
          </li>
        )}
      </ul>
      {withGuess && (
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>What appears when.</strong> The real picture is drawn first, from the physics, and does not depend on your guess. The white box and mark are added beside it, and a different guess moves the white mark and changes nothing else.
        </p>
      )}

      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>A worked moment.</strong> Light travels {days} light-days in {days} days. In AU that is {days} × {formatNumber(lightDayAU())} = {formatNumber(sizeLimitAU(days))} AU,
        about {formatNumber(sizeLimitInNeptuneOrbits(days))} times the width of Neptune’s orbit. The Milky Way is {MILKY_WAY_WIDTH_LIGHT_YEARS.toLocaleString('en-US')} × 365.25 =
        {' '}{Math.round(milkyWayWidthLightDays()).toLocaleString('en-US')} light-days across, and {Math.round(milkyWayWidthLightDays()).toLocaleString('en-US')} ÷ {days} ={' '}
        {Math.round(galaxyToSourceWidthRatio(days)).toLocaleString('en-US')}.
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          {
            look: 'the sky-blue bar and the dot for the Milky Way, far to the right',
            means: `a source that changes in ${days} days fits in a space about ${formatNumber(galaxyToSourceWidthRatio(days) / 1e6)} million times narrower than the galaxy it lights up`,
            matters: 'this is the second half of the puzzle: the light comes from a very small place',
          },
          {
            look: 'the sky-blue bar next to the dot for Neptune’s orbit',
            means: `the limit is about ${formatNumber(sizeLimitInNeptuneOrbits(days))} times the width of Neptune’s orbit, wider than the planets’ region of our Solar System, and still tiny on this ruler`,
            matters: 'it gives a feel for how small “very small” is, in a size we can picture',
          },
        ]}
      />
      <WhereFrom>
        <strong>Measured:</strong> that quasars flicker (the picture’s {days}-day flicker is an example, not a measurement), the width of the Milky Way (“more than
        100,000 light-years”, NASA), and the size of a light-day (25,902,068,356 km, NASA). <strong>Calculated here:</strong> the size limit, the ratio and the AU
        values. <strong>Imagined:</strong> nothing. {withGuess && <>The white mark is your guess, drawn where it would fall.</>}
      </WhereFrom>
    </div>
  )
}

// ---- Picture C: fuel ----

export function FuelPicture({ result, guess = null }: { result: QuasarResult; guess?: FuelChoiceId | null }) {
  const axisY = 150
  const minE = Math.log10(FUEL_RULER_MIN_SOLAR_PER_YEAR)
  const maxE = Math.log10(FUEL_RULER_MAX_SOLAR_PER_YEAR)
  const infallX = xAt(fuelRulerPosition(result.infallSolarMassesPerYear))
  const fusionX = xAt(fuelRulerPosition(result.fusionSolarMassesPerYear))
  const mark = guess ? fuelGuessMarker(guess) : null
  const guessX = mark ? xAt(mark.position) : 0
  const labelOf = (e: number) => (10 ** e).toLocaleString('en-US', { maximumFractionDigits: 3 })
  return (
    <svg
      viewBox={`0 0 600 ${210 + (mark ? GUESS_EXTRA_HEIGHT : 0)}`}
      role="img"
      aria-label={`Picture C: two bars on a ruler of mass per year, each tick 10 times more. Falling into a black hole with spin ${result.spin} needs ${formatNumber(result.infallSolarMassesPerYear)} Suns of mass a year to make ${formatSuns(result.luminositySolar)} of light. Hydrogen fusion in stars would have to burn ${formatNumber(result.fusionSolarMassesPerYear)} Suns of hydrogen a year.`}
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        Picture C: how much matter does it take to make that light?
      </text>
      {mark && <GuessLine x={guessX} axisY={axisY} boxY={200} />}
      <text x={X0} y={52} fontSize="10" fill={INFALL_COLOR} style={HALO}>
        Falling into the black hole (spin {result.spin}: {formatPercent(result.infallEfficiency)} of the mass becomes light)
      </text>
      <rect x={X0} y={58} width={infallX - X0} height="22" fill={INFALL_COLOR} fillOpacity="0.9" />
      <text x={infallX + 6} y={74} fontSize="11" fontWeight="bold" fill={INFALL_COLOR} style={HALO}>
        {formatNumber(result.infallSolarMassesPerYear)} Suns a year
      </text>
      <text x={X0} y={104} fontSize="10" fill={FUSION_COLOR} style={HALO}>
        Hydrogen fusion in a star ({formatPercent(result.fusionEfficiency)} of the mass becomes light)
      </text>
      <rect x={X0} y={110} width={fusionX - X0} height="22" fill={FUSION_COLOR} fillOpacity="0.9" />
      <text x={fusionX + 6} y={126} fontSize="11" fontWeight="bold" fill={FUSION_COLOR} style={HALO}>
        {formatNumber(result.fusionSolarMassesPerYear)} Suns a year
      </text>
      <line x1={X0} y1={axisY} x2={X1} y2={axisY} stroke={TICK_COLOR} strokeWidth="2" />
      <Ticks fromExponent={minE} toExponent={maxE} axisY={axisY} labelOf={labelOf} positionOf={(e) => fuelRulerPosition(10 ** e)} />
      <text x={(X0 + X1) / 2} y={axisY + 38} textAnchor="middle" fontSize="10" fill={MUTED_COLOR}>
        mass used each year, in Suns of mass (each tick is 10 times more than the one to its left)
      </text>
      {mark && <GuessMark x={guessX} axisY={axisY} boxY={200} lines={['Mass that must fall in each year:', fuelLabel(guess!)]} />}
    </svg>
  )
}

export function FuelCaption({ result, withGuess = false }: { result: QuasarResult; withGuess?: boolean }) {
  const watts = luminosityWatts(result.luminositySolar)
  const perSecond = massPerSecondKg(watts, result.infallEfficiency)
  const perYear = perSecond * SECONDS_PER_YEAR
  return (
    <div style={captionStyle}>
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>How to read this diagram.</strong> This picture shows how much matter has to be used up each year to make the quasar’s light, in two different ways. The
        amount is counted in <strong>Suns of mass per year</strong>: 1 means a mass equal to the Sun’s (about 2 × {powerOfTen(30)} kilograms) every year. The ruler works as in the other pictures, with
        each tick 10 times more than the one to its left, and it follows the settings you chose (the brightness and the black hole’s spin).
      </p>
      <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
        <li>
          <strong style={{ color: INFALL_COLOR }}>Green bar, falling into the black hole.</strong> The mass that must fall in each year. The share written beside its label
          is how much of the mass becomes light; it comes from Black Holes 8 and changes with the spin.
        </li>
        <li>
          <strong style={{ color: FUSION_COLOR }}>Orange bar, hydrogen fusion in a star.</strong> The hydrogen a star-powered source would have to burn each year to give
          out the same light. A star turns about 0.71 percent of the mass of its hydrogen into light. A <strong>longer bar</strong> means <strong>more matter</strong> is needed.
        </li>
        {withGuess && (
          <li>
            <strong>The white YOUR GUESS box</strong> is your guess, joined by a line to a white mark on the ruler. It sits where your answer would fall on the ruler of mass per year, for 3C 273 and a black hole that is not spinning. Compare it with the end of the green bar. It shows only your guess, and it is not a measurement.
          </li>
        )}
      </ul>
      {withGuess && (
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>What appears when.</strong> The real picture is drawn first, from the physics, and does not depend on your guess. The white box and mark are added beside it, and a different guess moves the white mark and changes nothing else.
        </p>
      )}

      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>A worked moment.</strong> The mass needed each second is the light output divided by (the share that becomes light × c²), where c is the speed of light.
        For {formatSuns(result.luminositySolar)}: the light output is {formatNumber(result.luminositySolar)} × {scientific(SUN_LUMINOSITY_W)} watts = {scientific(watts)} watts. With
        {' '}{formatPercent(result.infallEfficiency)} turned to light: {scientific(watts)} ÷ ({(result.infallEfficiency).toFixed(4)} × {scientific(SPEED_OF_LIGHT ** 2)}) = {scientific(perSecond)} kg
        each second, which is {scientific(perYear)} kg each year. Dividing by the Sun’s mass ({scientific(SUN_MASS_KG)} kg) gives {formatNumber(result.infallSolarMassesPerYear)} Suns a year.
      </p>
      <p style={{ margin: '0 0 0.25rem' }}>
        <strong>What to look for.</strong>
      </p>
      <LookForList
        items={[
          {
            look: 'the green bar compared with the orange bar',
            means: `fusion would need ${formatNumber(result.fusionSolarMassesPerYear)} Suns a year, and falling into the black hole needs ${formatNumber(result.infallSolarMassesPerYear)}: ${formatNumber(result.lightPerKilogramRatio)} times less matter for the same light`,
            matters: 'it shows the gap in how much light each kilogram makes, which is the first half of the puzzle',
          },
          {
            look: 'how the green bar changes when you choose a different spin or brightness and press Run again',
            means: 'a faster spin turns a bigger share of the mass into light, so a shorter green bar is enough; a brighter quasar needs a longer one',
            matters: 'it shows the two things that set the feeding rate: how bright the quasar is, and how well the black hole turns mass into light',
          },
        ]}
      />
      <WhereFrom>
        <strong>Calculated here:</strong> every number in this picture, from the light output you chose, the share of mass turned to light (Black Holes 8’s result for the
        spin, and 0.71 percent for fusion, OpenStax Astronomy) and the formula above. <strong>Measured:</strong> the 0.71 percent, in laboratories and from stars. The
        light output of 3C 273 is a round value that published sources differ on. <strong>Imagined for the question:</strong> the trial brightnesses (10 billion to 10
        trillion Suns) and the “star-powered” bar, which shows what fusion would need and is not a real object. {withGuess && <>The white mark is your guess, drawn where it would fall.</>}
      </WhereFrom>
    </div>
  )
}

export function PictureFrame({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: '1rem' }}>{children}</div>
}
