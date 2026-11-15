import {
  BEST_FIT_DARK_ENERGY_FRACTION,
  GUESS_REDSHIFT,
  MAX_DARK_ENERGY_FRACTION,
  MAX_REDSHIFT,
  brightnessExample,
  decelerationCurve,
  gravityGuessMarker,
  looksGuessGraphMarker,
  looksGuessRing,
  nearbyAgreementPercent,
  panelPoint,
  runDarkEnergyExperiment,
  zeroCrossingShare,
} from '../physics/darkEnergyExperiment'
import type { GravityGuess, LooksGuess } from '../physics/darkEnergyExperiment'
import { MUTED_COLOR, TEXT_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Cosmology, Experiment 5, audited to the newer rules (docs/audit/cosmology/05-draft-wording.md, approved 2026-11-15).
// Three pictures: the three supernovae, the brightness graph and the "slowing or speeding up" panel. Every number (a distance, a
// brightness, a deceleration number, the place of a guess mark) comes from the physics module; this file only draws and words it
// (CLAUDE.md §9). White is only ever the learner's guess (§14). The guess marks are drawn only once the run has finished (§12).

export const GUESS_COLOR = '#ffffff'
export const MATTER_ONLY_COLOR = '#38bdf8' // blue: a universe of only matter (calculated here)
export const BEST_FIT_COLOR = '#4ade80' // green: astronomers' best fit (calculated here at a given, rounded 70 percent)
export const YOUR_SHARE_COLOR = '#fbbf24' // amber: the learner's own share (Part 2)

export const GRAVITY_GUESS_TEXT: Record<GravityGuess, string> = {
  slow: 'slow the expansion down',
  speed: 'speed the expansion up',
  none: 'not change the expansion',
}
export const LOOKS_GUESS_TEXT: Record<LooksGuess, string> = {
  brighter: 'look brighter',
  same: 'look the same',
  dimmer: 'look dimmer',
}

const BEST_PERCENT = Math.round(BEST_FIT_DARK_ENERGY_FRACTION * 100)

function GuessBox({ x, y, width, line }: { x: number; y: number; width: number; line: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={32} rx={4} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2.5} />
      <text x={x + width / 2} y={y + 14} fill={GUESS_COLOR} fontSize="11" fontWeight="bold" textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + width / 2} y={y + 27} fill={GUESS_COLOR} fontSize="9.5" textAnchor="middle">
        {line}
      </text>
    </g>
  )
}

// ---- Picture 1 and 4: the three supernovae ----
const SN_WIDTH = 520
const SN_HEIGHT = 300
const EARTH_X = 40
const SN_Y = 120
const SN_BASE_RADIUS = 32
const snX = (redshift: number) => 90 + redshift * 470

export interface SupernovaPictureProps {
  // 'best' = Part 1 (astronomers' best fit, green disks); 'yours' = Part 2 (the learner's share, amber disks)
  kind: 'best' | 'yours'
  share: number
  // 0 to 1: how far the disks have eased from the ring size to their final size
  progress: number
  // Part 1 only: nothing but Earth and the three positions is drawn until the run starts
  started: boolean
  guess: LooksGuess | null
}

export function SupernovaPicture({ kind, share, progress, started, guess }: SupernovaPictureProps) {
  const result = runDarkEnergyExperiment(share)
  const color = kind === 'best' ? BEST_FIT_COLOR : YOUR_SHARE_COLOR
  const gradientId = `sn-glow-${kind}`
  const ring = guess ? looksGuessRing(guess) : null
  return (
    <svg width={SN_WIDTH} height={SN_HEIGHT} viewBox={`0 0 ${SN_WIDTH} ${SN_HEIGHT}`} style={{ ...svgStyle, width: SN_WIDTH, maxWidth: '100%' }} role="img" aria-label="Three exploding stars at three distances, each with a dashed ring for a matter-only universe and a glowing disk">
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor="#fffbeb" stopOpacity={1} />
          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
        </radialGradient>
      </defs>
      <text x={SN_WIDTH / 2} y={20} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Exploding stars (Type Ia supernovae) at three distances
      </text>

      <circle cx={EARTH_X} cy={SN_Y} r={12} fill="#38bdf8" />
      <text x={EARTH_X} y={SN_Y + 30} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        Earth
      </text>
      <line x1={EARTH_X + 14} y1={SN_Y} x2={SN_WIDTH - 10} y2={SN_Y} stroke="#334155" strokeDasharray="4 4" />

      {result.supernovae.map((sn) => {
        const shown = 1 - progress * (1 - sn.brightnessRelativeToMatterOnly)
        const x = snX(sn.redshift)
        return (
          <g key={sn.redshift}>
            {started && <circle cx={x} cy={SN_Y} r={SN_BASE_RADIUS} fill="none" stroke={MATTER_ONLY_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />}
            <circle cx={x} cy={SN_Y} r={SN_BASE_RADIUS * (started ? Math.sqrt(shown) : 0.5)} fill={started ? `url(#${gradientId})` : '#64748b'} opacity={started ? 0.25 + 0.75 * shown : 0.9} />
            <text x={x} y={SN_Y - SN_BASE_RADIUS * 1.3 - 8} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
              redshift {sn.redshift}
            </text>
            <text x={x} y={SN_Y + SN_BASE_RADIUS * 1.3 + 14} fill="#fde68a" fontSize="10" textAnchor="middle">
              {started ? `${(shown * 100).toFixed(0)}% as bright` : ' '}
            </text>
          </g>
        )
      })}
      {started && (
        <text x={snX(0.2)} y={SN_Y + SN_BASE_RADIUS * 1.3 + 30} fill={MUTED_COLOR} fontSize="9.5" textAnchor="middle">
          a supernova
        </text>
      )}
      {started && (
        <text x={20} y={SN_HEIGHT - 52} fill={MUTED_COLOR} fontSize="9.5">
          all three have the same true brightness (assumed)
        </text>
      )}

      {/* Guess 2: a white ring round the middle supernova, drawn only once the run has finished */}
      {ring && (
        <g>
          <circle cx={snX(ring.redshift)} cy={SN_Y} r={SN_BASE_RADIUS * ring.radiusFactor} fill="none" stroke={GUESS_COLOR} strokeWidth={3.5} />
          <line x1={snX(ring.redshift) + SN_BASE_RADIUS * ring.radiusFactor * 0.7} y1={SN_Y + SN_BASE_RADIUS * ring.radiusFactor * 0.7} x2={snX(ring.redshift) + 58} y2={SN_Y + 62} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={snX(ring.redshift) - 17} y={SN_Y + 62} width={150} line={`it looks ${guess === 'brighter' ? 'brighter' : guess === 'same' ? 'the same' : 'dimmer'}`} />
        </g>
      )}

      {started && (
        <g transform={`translate(20, ${SN_HEIGHT - 34})`}>
          <circle cx={6} cy={0} r={6} fill="none" stroke={MATTER_ONLY_COLOR} strokeWidth={1.5} strokeDasharray="4 3" />
          <text x={18} y={3} fill={TEXT_COLOR} fontSize="10">
            dashed ring = how bright it would look in a matter-only universe
          </text>
          <circle cx={6} cy={18} r={6} fill={`url(#${gradientId})`} />
          <text x={18} y={21} fill={TEXT_COLOR} fontSize="10">
            {kind === 'best' ? `glowing disk = how bright it looks with astronomers' best fit (${BEST_PERCENT}% dark energy)` : 'glowing disk = how bright it looks with your trial share of dark energy'}
          </text>
        </g>
      )}
    </svg>
  )
}

// ---- Picture 2 and 5: brightness against redshift ----
const GRAPH_WIDTH = 520
const GRAPH_HEIGHT = 340
const GRAPH_LEFT = 58
const GRAPH_RIGHT = GRAPH_WIDTH - 24
const GRAPH_TOP = 34
const GRAPH_BOTTOM = GRAPH_HEIGHT - 52
const GRAPH_MIN_BRIGHTNESS = 0.3
const GRAPH_MAX_BRIGHTNESS = 1.15 // grown from 1.05 so the "brighter" guess marker (1.10) fits

const graphX = (redshift: number) => GRAPH_LEFT + (redshift / MAX_REDSHIFT) * (GRAPH_RIGHT - GRAPH_LEFT)
const graphY = (brightness: number) => GRAPH_BOTTOM - ((brightness - GRAPH_MIN_BRIGHTNESS) / (GRAPH_MAX_BRIGHTNESS - GRAPH_MIN_BRIGHTNESS)) * (GRAPH_BOTTOM - GRAPH_TOP)
const toLine = (points: Array<{ redshift: number; brightnessRelativeToMatterOnly: number }>) => points.map((p) => `${graphX(p.redshift).toFixed(1)},${graphY(p.brightnessRelativeToMatterOnly).toFixed(1)}`).join(' ')

export interface BrightnessGraphProps {
  // null = nothing drawn yet; 0 to 1 = how far the blue and green lines have been drawn
  drawn: number | null
  // Part 2: the learner's share, drawn as the amber line (always the whole line)
  share: number | null
  guess: LooksGuess | null
}

export function BrightnessGraph({ drawn, share, guess }: BrightnessGraphProps) {
  const best = runDarkEnergyExperiment(BEST_FIT_DARK_ENERGY_FRACTION).curve
  const limit = (drawn ?? 0) * MAX_REDSHIFT + 1e-9
  const bestLine = toLine(best.filter((p) => p.redshift <= limit))
  const yourLine = share === null ? '' : toLine(runDarkEnergyExperiment(share).curve)
  const marker = guess ? looksGuessGraphMarker(guess) : null
  const mx = marker ? graphX(marker.redshift) : 0
  const my = marker ? graphY(marker.brightness) : 0
  return (
    <svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`} style={{ ...svgStyle, width: GRAPH_WIDTH, maxWidth: '100%' }} role="img" aria-label="Brightness of a supernova against its redshift: a flat blue line, a green dashed line and, in Part 2, an amber line">
      <text x={GRAPH_WIDTH / 2} y={16} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Brightness of a supernova versus its redshift
      </text>
      <line x1={GRAPH_LEFT} y1={GRAPH_TOP} x2={GRAPH_LEFT} y2={GRAPH_BOTTOM} stroke={MUTED_COLOR} />
      <line x1={GRAPH_LEFT} y1={GRAPH_BOTTOM} x2={GRAPH_RIGHT} y2={GRAPH_BOTTOM} stroke={MUTED_COLOR} />
      {[0.4, 0.6, 0.8, 1].map((b) => (
        <g key={b}>
          <line x1={GRAPH_LEFT - 4} y1={graphY(b)} x2={GRAPH_LEFT} y2={graphY(b)} stroke={MUTED_COLOR} />
          <text x={GRAPH_LEFT - 8} y={graphY(b) + 3} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
            {b.toFixed(1)}
          </text>
        </g>
      ))}
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((z) => (
        <g key={z}>
          <line x1={graphX(z)} y1={GRAPH_BOTTOM} x2={graphX(z)} y2={GRAPH_BOTTOM + 4} stroke={MUTED_COLOR} />
          <text x={graphX(z)} y={GRAPH_BOTTOM + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {z}
          </text>
        </g>
      ))}
      <text x={(GRAPH_LEFT + GRAPH_RIGHT) / 2} y={GRAPH_BOTTOM + 32} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        redshift (how far away the supernova is)
      </text>
      <text x={14} y={(GRAPH_TOP + GRAPH_BOTTOM) / 2} fill={TEXT_COLOR} fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(GRAPH_TOP + GRAPH_BOTTOM) / 2})`}>
        brightness, compared with matter-only
      </text>

      {drawn !== null && (
        <>
          <line x1={graphX(0)} y1={graphY(1)} x2={graphX(Math.min(drawn * MAX_REDSHIFT, MAX_REDSHIFT))} y2={graphY(1)} stroke={MATTER_ONLY_COLOR} strokeWidth={3} />
          {bestLine && <polyline points={bestLine} fill="none" stroke={BEST_FIT_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />}
        </>
      )}
      {yourLine && <polyline points={yourLine} fill="none" stroke={YOUR_SHARE_COLOR} strokeWidth={3} />}

      {drawn !== null && (
        <g transform={`translate(${GRAPH_LEFT + 10}, ${GRAPH_BOTTOM - 62})`}>
          <line x1={0} y1={0} x2={22} y2={0} stroke={MATTER_ONLY_COLOR} strokeWidth={3} />
          <text x={28} y={3} fill={TEXT_COLOR} fontSize="10">
            matter-only prediction (calculated here)
          </text>
          <line x1={0} y1={14} x2={22} y2={14} stroke={BEST_FIT_COLOR} strokeWidth={2.5} strokeDasharray="6 4" />
          <text x={28} y={17} fill={TEXT_COLOR} fontSize="10">
            astronomers&rsquo; best fit, about {BEST_PERCENT}% dark energy (calculated here)
          </text>
          {share !== null && (
            <>
              <line x1={0} y1={28} x2={22} y2={28} stroke={YOUR_SHARE_COLOR} strokeWidth={3} />
              <text x={28} y={31} fill={TEXT_COLOR} fontSize="10">
                your trial share of dark energy
              </text>
            </>
          )}
        </g>
      )}

      {/* Guess 2: a white marker above, on or below the blue line at redshift 0.5, drawn only once the run has finished */}
      {marker && (
        <g>
          <circle cx={mx} cy={my} r={7} fill="none" stroke={GUESS_COLOR} strokeWidth={3.5} />
          <line x1={GRAPH_LEFT + 172} y1={GRAPH_TOP + 18} x2={mx - 6} y2={my - 3} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={GRAPH_LEFT + 6} y={GRAPH_TOP + 2} width={166} line={`at redshift ${GUESS_REDSHIFT}: ${guess === 'brighter' ? 'brighter' : guess === 'same' ? 'the same' : 'dimmer'}`} />
        </g>
      )}
    </svg>
  )
}

// ---- Picture 3 and 6: "is the expansion speeding up or slowing down today?" ----
const PANEL_WIDTH = 520
const PANEL_HEIGHT = 320
const PANEL_LEFT = 62
const PANEL_RIGHT = PANEL_WIDTH - 24
const PANEL_TOP = 34
const PANEL_BOTTOM = PANEL_HEIGHT - 52
const PANEL_MIN_Q = -1
const PANEL_MAX_Q = 0.6

const panelX = (share: number) => PANEL_LEFT + (share / MAX_DARK_ENERGY_FRACTION) * (PANEL_RIGHT - PANEL_LEFT)
const panelY = (q: number) => PANEL_BOTTOM - ((q - PANEL_MIN_Q) / (PANEL_MAX_Q - PANEL_MIN_Q)) * (PANEL_BOTTOM - PANEL_TOP)

export interface ExpansionPanelProps {
  // null = axes only; 0 to 1 = how far the curve has been drawn
  drawn: number | null
  share: number | null
  guess: GravityGuess | null
}

export function ExpansionPanel({ drawn, share, guess }: ExpansionPanelProps) {
  const limit = (drawn ?? 0) * MAX_DARK_ENERGY_FRACTION + 1e-9
  const curve = decelerationCurve().filter((p) => p.darkEnergyFraction <= limit)
  const line = curve.map((p) => `${panelX(p.darkEnergyFraction).toFixed(1)},${panelY(p.decelerationParameter).toFixed(1)}`).join(' ')
  const none = panelPoint(0)
  const best = panelPoint(BEST_FIT_DARK_ENERGY_FRACTION)
  const mine = share === null ? null : panelPoint(share)
  const crossing = zeroCrossingShare()
  const mark = guess ? gravityGuessMarker(guess) : null
  const full = drawn !== null && drawn >= 1
  return (
    <svg width={PANEL_WIDTH} height={PANEL_HEIGHT} viewBox={`0 0 ${PANEL_WIDTH} ${PANEL_HEIGHT}`} style={{ ...svgStyle, width: PANEL_WIDTH, maxWidth: '100%' }} role="img" aria-label="The deceleration number against the share of dark energy">
      <text x={PANEL_WIDTH / 2} y={16} fill={TEXT_COLOR} fontSize="12" fontWeight="600" textAnchor="middle">
        Is the expansion speeding up or slowing down today?
      </text>
      <line x1={PANEL_LEFT} y1={PANEL_TOP} x2={PANEL_LEFT} y2={PANEL_BOTTOM} stroke={MUTED_COLOR} />
      <line x1={PANEL_LEFT} y1={panelY(0)} x2={PANEL_RIGHT} y2={panelY(0)} stroke={MUTED_COLOR} strokeDasharray="3 3" />
      {[-1, -0.5, 0, 0.5].map((q) => (
        <g key={q}>
          <line x1={PANEL_LEFT - 4} y1={panelY(q)} x2={PANEL_LEFT} y2={panelY(q)} stroke={MUTED_COLOR} />
          <text x={PANEL_LEFT - 8} y={panelY(q) + 3} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
            {q > 0 ? `+${q.toFixed(1)}` : q.toFixed(1)}
          </text>
        </g>
      ))}
      {[0, 0.2, 0.4, 0.6, 0.8].map((s) => (
        <g key={s}>
          <line x1={panelX(s)} y1={PANEL_BOTTOM} x2={panelX(s)} y2={PANEL_BOTTOM + 4} stroke={MUTED_COLOR} />
          <text x={panelX(s)} y={PANEL_BOTTOM + 16} fill={MUTED_COLOR} fontSize="10" textAnchor="middle">
            {(s * 100).toFixed(0)}%
          </text>
        </g>
      ))}
      <text x={(PANEL_LEFT + PANEL_RIGHT) / 2} y={PANEL_BOTTOM + 32} fill={TEXT_COLOR} fontSize="11" textAnchor="middle">
        share of the universe&rsquo;s energy that is dark energy
      </text>
      <text x={14} y={(PANEL_TOP + PANEL_BOTTOM) / 2} fill={TEXT_COLOR} fontSize="11" textAnchor="middle" transform={`rotate(-90 14 ${(PANEL_TOP + PANEL_BOTTOM) / 2})`}>
        deceleration number
      </text>

      {drawn !== null && (
        <>
          <text x={PANEL_RIGHT - 4} y={panelY(0) - 6} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
            above zero: slowing down
          </text>
          <text x={PANEL_RIGHT - 4} y={panelY(0) + 14} fill={MUTED_COLOR} fontSize="10" textAnchor="end">
            below zero: speeding up
          </text>
          {line && <polyline points={line} fill="none" stroke={MUTED_COLOR} strokeWidth={2.5} />}
          {drawn * MAX_DARK_ENERGY_FRACTION >= crossing && (
            <g>
              <line x1={panelX(crossing)} y1={PANEL_TOP + 4} x2={panelX(crossing)} y2={PANEL_BOTTOM} stroke={MUTED_COLOR} strokeDasharray="2 4" />
              <text x={panelX(crossing) + 4} y={PANEL_BOTTOM - 6} fill={MUTED_COLOR} fontSize="9.5">
                the speed-up begins here ({(crossing * 100).toFixed(0)}%, in this model)
              </text>
            </g>
          )}
          <circle cx={panelX(0)} cy={panelY(none.decelerationParameter)} r={6} fill={MATTER_ONLY_COLOR} />
          <text x={panelX(0) + 10} y={panelY(none.decelerationParameter) + 14} fill={MATTER_ONLY_COLOR} fontSize="10">
            matter only: {none.decelerationParameter > 0 ? '+' : ''}
            {none.decelerationParameter.toFixed(2)}
          </text>
          {drawn * MAX_DARK_ENERGY_FRACTION >= BEST_FIT_DARK_ENERGY_FRACTION && (
            <>
              <circle cx={panelX(BEST_FIT_DARK_ENERGY_FRACTION)} cy={panelY(best.decelerationParameter)} r={6} fill={BEST_FIT_COLOR} />
              <text x={panelX(BEST_FIT_DARK_ENERGY_FRACTION) - 8} y={panelY(best.decelerationParameter) + 18} fill={BEST_FIT_COLOR} fontSize="10" textAnchor="end">
                astronomers&rsquo; best fit: {best.decelerationParameter.toFixed(2)}
              </text>
            </>
          )}
        </>
      )}
      {mine && (
        <g>
          <circle cx={panelX(mine.darkEnergyFraction)} cy={panelY(mine.decelerationParameter)} r={7} fill={YOUR_SHARE_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <text
            x={panelX(mine.darkEnergyFraction) + (mine.darkEnergyFraction < 0.35 ? 12 : -12)}
            y={panelY(mine.decelerationParameter) + (mine.darkEnergyFraction < 0.35 ? -10 : 16)}
            fill={YOUR_SHARE_COLOR}
            fontSize="10"
            fontWeight="bold"
            textAnchor={mine.darkEnergyFraction < 0.35 ? 'start' : 'end'}
          >
            your trial share: {mine.decelerationParameter > 0 ? '+' : ''}
            {mine.decelerationParameter.toFixed(2)}
          </text>
        </g>
      )}

      {/* Guess 1: a white arrow up, an arrow down or a dot, at a share of 0 (a marker only), drawn only once the run has finished */}
      {mark && full && (
        <g>
          {mark.kind === 'dot' ? (
            <circle cx={panelX(0)} cy={panelY(0)} r={8} fill="none" stroke={GUESS_COLOR} strokeWidth={4} />
          ) : (
            <>
              <line x1={panelX(0) + 8} y1={panelY(mark.fromQ0)} x2={panelX(0) + 8} y2={panelY(mark.toQ0)} stroke={GUESS_COLOR} strokeWidth={5} />
              <polygon
                points={
                  mark.kind === 'up'
                    ? `${panelX(0) + 8},${panelY(mark.toQ0) - 4} ${panelX(0) + 1},${panelY(mark.toQ0) + 8} ${panelX(0) + 15},${panelY(mark.toQ0) + 8}`
                    : `${panelX(0) + 8},${panelY(mark.toQ0) + 4} ${panelX(0) + 1},${panelY(mark.toQ0) - 8} ${panelX(0) + 15},${panelY(mark.toQ0) - 8}`
                }
                fill={GUESS_COLOR}
              />
            </>
          )}
          <line x1={panelX(0) + 24} y1={panelY(mark.toQ0)} x2={panelX(0.1)} y2={panelY(-0.62)} stroke={GUESS_COLOR} strokeWidth={2} />
          <GuessBox x={panelX(0.03)} y={panelY(-0.62)} width={150} line={`gravity alone will ${guess === 'slow' ? 'slow it down' : guess === 'speed' ? 'speed it up' : 'not change it'}`} />
        </g>
      )}
    </svg>
  )
}

// ---- captions ----
const BEST_EXAMPLE = brightnessExample(BEST_FIT_DARK_ENERGY_FRACTION)
const bestRun = runDarkEnergyExperiment(BEST_FIT_DARK_ENERGY_FRACTION)
const [row0, row1, row2] = bestRun.supernovae
const at1 = bestRun.curve[bestRun.curve.length - 1].brightnessRelativeToMatterOnly

export function Part1SupernovaCaption({ started, arrived }: { started: boolean; arrived: boolean }) {
  const e = BEST_EXAMPLE
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: three exploding stars.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>Earth</strong> is on the far left, where we are looking from. The three stars are <strong>Type Ia supernovae</strong> at redshifts 0.2, 0.5 and 0.8. A bigger redshift means farther away, and light that set off longer ago. <strong>Redshift</strong> is a number that says how much
          the light has been stretched on its way to us as space stretched.
        </li>
        {started && (
          <>
            <li>
              The <strong style={{ color: MATTER_ONLY_COLOR }}>dashed blue ring</strong> shows how bright that star would look in a universe made of <strong>only matter</strong>. Think of it as the &ldquo;expected&rdquo; brightness. It is <strong>calculated here</strong>.
            </li>
            <li>
              The <strong style={{ color: BEST_FIT_COLOR }}>glowing green disk</strong> shows how bright it looks with astronomers&rsquo; best fit, about {BEST_PERCENT}% dark energy. The disk&rsquo;s <em>area</em> is drawn in proportion to brightness; the percentage under it says how bright it is compared with its ring.
              We assume all three stars have exactly the same true brightness, so any difference in how bright they look comes from distance alone.
            </li>
          </>
        )}
        {arrived && (
          <li>
            The <strong>white ring</strong> round the middle star, with a YOUR GUESS box, is your guess 2: larger than the dashed ring for &ldquo;brighter&rdquo;, the same size for &ldquo;the same&rdquo;, smaller for &ldquo;dimmer&rdquo;. It is <strong>only a marker</strong>: the sizes are fixed, not
            your own numbers. It does not say right or wrong.
          </li>
        )}
      </ul>
      {started && (
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>A worked moment.</strong> The middle star, at redshift {e.redshift}: a matter-only universe puts it at about {e.matterOnlyDistanceMpc.toFixed(0)} Mpc (one megaparsec is about 3.26 million light-years). The best fit puts it at about {e.distanceMpc.toFixed(0)} Mpc. Brightness falls with the square of the
          distance, so compared with matter-only it is ({e.matterOnlyDistanceMpc.toFixed(0)} ÷ {e.distanceMpc.toFixed(0)})² = {e.distanceRatio.toFixed(4)}² = <strong>{e.brightness.toFixed(2)}</strong>: about {(e.brightness * 100).toFixed(0)} percent as bright, or {e.percentDimmer.toFixed(0)} percent less.
        </p>
      )}
      {started && (
        <LookFor
          items={[
            {
              look: 'the green disk at redshift 0.5, inside its dashed blue ring',
              means: `the disk is smaller than the ring: it is ${(e.brightness * 100).toFixed(0)} percent as bright as the ring.`,
              matters: 'the ring is what a matter-only universe predicts, so the gap between ring and disk is the difference this experiment is built to show.',
            },
            {
              look: 'the three disks, from the nearest star to the farthest',
              means: `they are ${(row0.brightnessRelativeToMatterOnly * 100).toFixed(0)}, ${(row1.brightnessRelativeToMatterOnly * 100).toFixed(0)} and ${(row2.brightnessRelativeToMatterOnly * 100).toFixed(0)} percent as bright as their rings.`,
              matters: 'the gap grows with distance, so only very distant supernovae can tell the two kinds of universe apart.',
            },
            ...(arrived
              ? [
                  {
                    look: 'the white ring against the dashed ring and the green disk',
                    means: 'it shows where your guess 2 sat beside the real picture, at the middle star.',
                    matters: 'you can compare your guess with the real picture directly. The tutor in Part 4 goes through it.',
                  },
                ]
              : []),
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function Part1GraphCaption({ started, arrived }: { started: boolean; arrived: boolean }) {
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: brightness against redshift.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          Along the bottom is <strong>redshift</strong> (how far away the supernova is), from 0 to 1. Up the side is <strong>brightness compared with a matter-only universe</strong>: 1.0 means &ldquo;exactly as bright as a matter-only universe predicts&rdquo; and 0.7 means &ldquo;70 percent as bright&rdquo;.
        </li>
        {started && (
          <>
            <li>
              The <strong style={{ color: MATTER_ONLY_COLOR }}>blue line</strong> is the matter-only prediction. It is flat at 1.0 because everything is measured against it. <strong>Calculated here.</strong>
            </li>
            <li>
              The <strong style={{ color: BEST_FIT_COLOR }}>green dashed line</strong> is the brightness astronomers&rsquo; best fit gives, about {BEST_PERCENT}% dark energy. It is a <strong>model curve calculated here</strong>, not a plot of individual supernovae.
            </li>
          </>
        )}
        {arrived && (
          <li>
            The <strong>white marker</strong> at redshift 0.5, with a YOUR GUESS box, is your guess 2 again: above the blue line for &ldquo;brighter&rdquo;, on it for &ldquo;the same&rdquo;, below it for &ldquo;dimmer&rdquo;. It is <strong>only a marker</strong> with a fixed height. It does not say right or wrong.
          </li>
        )}
      </ul>
      {started && (
        <LookFor
          items={[
            {
              look: 'the green dashed line against the blue line, from left to right',
              means: `they start together at redshift 0 and spread apart: the green line is at ${row0.brightnessRelativeToMatterOnly.toFixed(2)} at redshift 0.2, ${row1.brightnessRelativeToMatterOnly.toFixed(2)} at 0.5, ${row2.brightnessRelativeToMatterOnly.toFixed(2)} at 0.8 and ${at1.toFixed(2)} at 1.`,
              matters: 'the farther away a supernova is, the bigger the difference between the two universes.',
            },
            {
              look: 'where the lines meet, at the far left',
              means: `at a redshift of only 0.01 the two universes put a supernova at almost the same distance, within ${nearbyAgreementPercent().toFixed(1)} percent.`,
              matters: 'this is why the simple formula of Cosmology 1 (Hubble’s Law) worked for nearby galaxies: the versions of the universe disagree only at large distances.',
            },
            ...(arrived
              ? [
                  {
                    look: 'the white marker against the blue and green lines at redshift 0.5',
                    means: 'it shows where your guess 2 sat beside the real lines.',
                    matters: 'the tutor in Part 4 goes through it.',
                  },
                ]
              : []),
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function Part1PanelCaption({ started, arrived }: { started: boolean; arrived: boolean }) {
  const none = panelPoint(0).decelerationParameter
  const best = panelPoint(BEST_FIT_DARK_ENERGY_FRACTION).decelerationParameter
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this picture: is the expansion speeding up or slowing down today?</strong>
      </p>
      <ul style={listStyle}>
        <li>
          Along the bottom is the <strong>share of dark energy</strong>, from 0 to 90 percent of the universe&rsquo;s energy. Up the side is the <strong>deceleration number</strong>, a number this page&rsquo;s model gives for &ldquo;today&rdquo; in each universe. Above the dashed zero line the expansion is
          slowing down; below it, speeding up; on it, steady. Think of a car&rsquo;s dashboard: the sign says whether the car is speeding up or slowing down.
        </li>
        {started && (
          <>
            <li>
              The <strong>grey curve</strong> is the deceleration number for every share, <strong>calculated here</strong>. The <strong style={{ color: MATTER_ONLY_COLOR }}>blue dot</strong> marks a universe of only matter (0 percent). The{' '}
              <strong style={{ color: BEST_FIT_COLOR }}>green dot</strong> marks astronomers&rsquo; best fit ({BEST_PERCENT} percent).
            </li>
            <li>The dotted vertical line marks the share where the curve crosses zero, {(zeroCrossingShare() * 100).toFixed(0)} percent, in this model.</li>
          </>
        )}
        {arrived && (
          <li>
            The <strong>white arrow or dot</strong> at 0 percent, with a YOUR GUESS box, is your guess 1: an arrow up for &ldquo;slow it down&rdquo;, an arrow down for &ldquo;speed it up&rdquo;, a dot on the zero line for &ldquo;not change it&rdquo;. It is <strong>only a marker</strong>: the arrow has a fixed
            length that means nothing as a number (the blue dot is the real value). It does not say right or wrong.
          </li>
        )}
      </ul>
      {started && (
        <LookFor
          items={[
            {
              look: 'the blue dot and the green dot',
              means: `the blue dot sits at ${none > 0 ? '+' : ''}${none.toFixed(2)} and the green dot at ${best.toFixed(2)}, on opposite sides of zero.`,
              matters: 'the deceleration number is the page’s way of saying “speeding up or slowing down today”: one number that anybody can compare.',
            },
            {
              look: 'the dotted line where the curve crosses zero',
              means: `the sign changes at ${(zeroCrossingShare() * 100).toFixed(0)} percent dark energy in this model, and the best fit is well above it.`,
              matters: 'a fairly small share of dark energy is enough to change the sign. This is the page’s model (flat, constant dark energy), not a measurement.',
            },
            ...(arrived
              ? [
                  {
                    look: 'the white arrow or dot beside the blue dot',
                    means: 'it shows where your guess 1 sat beside the real value at 0 percent.',
                    matters: 'you can compare your guess with the real picture directly. The tutor in Part 4 goes through it.',
                  },
                ]
              : []),
          ]}
        />
      )}
    </CaptionBox>
  )
}

export function Part2Caption({ share }: { share: number }) {
  const mine = panelPoint(share).decelerationParameter
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read Part 2&rsquo;s pictures.</strong> They are the same three pictures as in Part 1, with your trial share added in <strong style={{ color: YOUR_SHARE_COLOR }}>amber</strong>.
      </p>
      <ul style={listStyle}>
        <li>
          The <strong style={{ color: YOUR_SHARE_COLOR }}>amber disks</strong>, <strong style={{ color: YOUR_SHARE_COLOR }}>amber line</strong> and <strong style={{ color: YOUR_SHARE_COLOR }}>amber dot</strong> are your trial share, {(share * 100).toFixed(0)} percent dark energy. The dashed blue rings and the blue
          line (matter only) and the green dashed line (astronomers&rsquo; best fit) are the same as in Part 1.
        </li>
        <li>Where the amber line sits <strong>below</strong> the blue line, the stars look less bright than a matter-only universe predicts. If the amber line lies on the green line, your trial share gives the best fit&rsquo;s brightness.</li>
        <li>The amber dot slides along the grey curve as you change the share, and changes sides of the zero line at about {(zeroCrossingShare() * 100).toFixed(0)} percent. At your share the deceleration number is {mine > 0 ? '+' : ''}{mine.toFixed(2)}.</li>
      </ul>
      <LookFor
        items={[
          {
            look: 'the amber line against the green dashed line, as you move the share',
            means: `at ${BEST_PERCENT} percent they lie on top of each other; at 0 percent the amber line lies on the blue line; at 90 percent it drops well below the green line.`,
            matters: 'a bigger share of dark energy dims distant supernovae more, so the amount can be read from the brightness.',
          },
          {
            look: 'the amber dot on the panel',
            means: 'it changes sides of the zero line at about one third.',
            matters: 'it shows how little dark energy it takes, in this model, to change from slowing down to speeding up.',
          },
        ]}
      />
    </CaptionBox>
  )
}
