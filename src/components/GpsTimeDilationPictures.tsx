import { useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  ALTITUDE_MAX_KM,
  balanceAltitudeKm,
  effectSweep,
  guessMarkers,
  orbitSummary,
  ORBIT_PRESETS_KM,
  workedNumbers,
} from '../physics/gpsTimeDilationExperiment'
import type { MoreLessSameChoice, YesNoChoice } from '../physics/gpsTimeDilationExperiment'
import { MUTED_COLOR, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import { CaptionBox, LookFor, listStyle } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 9, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/09-draft-wording.md,
// approved by the owner on 2026-11-13): the labelled orbit drawing, the graph of the two effects and their sum against altitude, white
// guess marks and the captions. Every number drawn comes from the physics module (src/physics/gpsTimeDilationExperiment.ts).

export const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
export const SPEED_COLOR = '#a78bfa' // violet: the speed effect (slows the clock)
export const GRAVITY_COLOR = '#34d399' // green: the height (gravity) effect (speeds the clock up)
export const NET_COLOR = '#f59e0b' // amber: the two added together
const EARTH_COLOR = '#3b82f6' // blue: Earth
const BALANCE_COLOR = '#67e8f9' // pale cyan: the balance altitude
const FAINT = '#9ca3af' // grey: Part 1's orbits shown again

export type OrbitKey = 'iss' | 'gps' | 'geostationary'
export const ORBIT_KEYS: OrbitKey[] = ['iss', 'gps', 'geostationary']
export const ORBIT_ALTITUDE: Record<OrbitKey, number> = ORBIT_PRESETS_KM
export const ORBIT_NAME: Record<OrbitKey, string> = { iss: 'ISS', gps: 'GPS', geostationary: 'Geostationary' }

const fmtKm = (km: number) => `${Math.round(km).toLocaleString('en-US')} km`
export const signed = (v: number, digits = 2) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(digits)}`

// ---- the orbit drawing: a view from above Earth's pole ----
const VIEW = 400
const CX = VIEW / 2
const CY = 196
const EARTH_R = 46
// Square-root scale, so the ISS ring is not on top of Earth and the geostationary ring still fits (the caption says it is not to scale).
const SCALE = (150 - EARTH_R) / Math.sqrt(ALTITUDE_MAX_KM)
const ringRadius = (altitudeKm: number) => EARTH_R + SCALE * Math.sqrt(altitudeKm)

function GuessBox({ x, y, width, second }: { x: number; y: number; width: number; second: string }) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={36} rx={5} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} />
      <text x={x + width / 2} y={y + 15} fontSize="12" fontWeight="bold" fill={GUESS_COLOR} textAnchor="middle">
        YOUR GUESS
      </text>
      <text x={x + width / 2} y={y + 30} fontSize="11" fill={GUESS_COLOR} textAnchor="middle">
        {second}
      </text>
    </g>
  )
}

export interface OrbitDrawingProps {
  // Part 1 orbits already run (drawn as faint rings and listed in the legend).
  done: OrbitKey[]
  // The orbit being shown now (Part 1), or null.
  current: OrbitKey | null
  // 0 to 1 while a run plays: the satellite goes once round its ring. 1 when finished.
  progress: number
  // After all three Part 1 orbits: the balance ring.
  showBalance: boolean
  // Part 2: the learner's own altitude, drawn in pink (null for none).
  yoursKm: number | null
  yoursProgress?: number
}

export function OrbitDrawing({ done, current, progress, showBalance, yoursKm, yoursProgress = 1 }: OrbitDrawingProps) {
  const currentKm = current ? ORBIT_ALTITUDE[current] : null
  const shownKm = yoursKm ?? currentKm
  const isPink = yoursKm !== null
  const color = isPink ? YOURS_COLOR : NET_COLOR
  const p = isPink ? yoursProgress : progress
  const angle = p * 2 * Math.PI
  const r = shownKm !== null ? ringRadius(shownKm) : 0
  const sx = CX + r * Math.sin(angle)
  const sy = CY - r * Math.cos(angle)
  const finished = p >= 1
  const label = isPink ? `Your satellite: ${fmtKm(shownKm ?? 0)}` : current ? `Satellite (${ORBIT_NAME[current]})` : ''
  return (
    <svg
      width={VIEW}
      height={VIEW}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      style={svgStyle}
      role="img"
      aria-label="A view from above Earth's pole: Earth, the orbit ring, the satellite, the altitude, faint rings for the orbits already run, and, after all three orbits, the balance ring. The orbits are squeezed and not to scale."
    >
      {showBalance && (
        <g>
          <circle cx={CX} cy={CY} r={ringRadius(balanceAltitudeKm())} fill="none" stroke={BALANCE_COLOR} strokeWidth={2} strokeDasharray="5 4" />
          <line x1={CX - ringRadius(balanceAltitudeKm()) * 0.7} y1={CY + ringRadius(balanceAltitudeKm()) * 0.7} x2={64} y2={VIEW - 44} stroke={BALANCE_COLOR} strokeWidth={1} />
          <text x={10} y={VIEW - 33} fontSize="11" fill={BALANCE_COLOR}>
            Balance altitude: the speed and gravity effects
          </text>
          <text x={10} y={VIEW - 20} fontSize="11" fill={BALANCE_COLOR}>
            cancel here (about {Math.round(balanceAltitudeKm()).toLocaleString('en-US')} km)
          </text>
        </g>
      )}
      {done.map((key) => (
        <circle key={key} cx={CX} cy={CY} r={ringRadius(ORBIT_ALTITUDE[key])} fill="none" stroke={FAINT} strokeWidth={1} opacity={0.55} />
      ))}
      <circle cx={CX} cy={CY} r={EARTH_R} fill={EARTH_COLOR} opacity={0.85} />
      <text x={CX} y={CY + 4} fontSize="13" fontWeight="bold" fill="#ffffff" textAnchor="middle">
        Earth
      </text>
      {shownKm !== null && (
        <g>
          <circle cx={CX} cy={CY} r={r} fill="none" stroke={color} strokeWidth={2} />
          <circle cx={sx} cy={sy} r={6} fill={color} stroke="#0b1020" strokeWidth={1.5} />
          {finished && (
            <>
              <line x1={CX} y1={CY - EARTH_R} x2={CX} y2={CY - r} stroke={TEXT_COLOR} strokeWidth={1.5} strokeDasharray="3 3" />
              <text x={CX - 8} y={(CY - EARTH_R + CY - r) / 2 + 4} fontSize="11" fontWeight="bold" fill={TEXT_COLOR} textAnchor="end" stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
                Altitude: {fmtKm(shownKm)}
              </text>
            </>
          )}
          <text x={isPink ? CX + 12 : sx + (finished ? 12 : 0)} y={finished ? sy - 6 : sy - 12} fontSize="12" fontWeight="bold" fill={color} textAnchor={finished ? 'start' : 'middle'}>
            {label}
          </text>
        </g>
      )}
      {/* legend for the faint rings */}
      {done.length > 0 && (
        <g>
          <text x={10} y={18} fontSize="11" fontWeight="bold" fill={TEXT_COLOR} stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
            Faint grey rings: orbits already run
          </text>
          {done.map((key, i) => (
            <text key={key} x={10} y={34 + i * 15} fontSize="11" fill={FAINT} stroke="#0b1020" strokeWidth={3} paintOrder="stroke">
              {ORBIT_NAME[key]}: {fmtKm(ORBIT_ALTITUDE[key])}
            </text>
          ))}
        </g>
      )}
      <text x={VIEW - 10} y={VIEW - 6} fontSize="10" fill={MUTED_COLOR} textAnchor="end">
        Not to scale: the orbits are squeezed so that all three fit.
      </text>
    </svg>
  )
}

// ---- the graph: the speed effect, the height effect and their sum, against altitude ----
const G = { width: 760, height: 512, left: 86, right: 24, top: 100, bottom: 66 }
const PLOT_W = G.width - G.left - G.right
const PLOT_H = G.height - G.top - G.bottom
const X_MAX = 36_000
const Y_MIN = -60
const Y_MAX = 60
const xOf = (km: number) => G.left + (km / X_MAX) * PLOT_W
const yOf = (v: number) => G.top + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * PLOT_H
// The three YOUR GUESS boxes sit in a row along the bottom of the plot, in the order of their marks from left to right, so that each
// leader runs straight down from its mark and none cross.
const BOX_W = 156
const BOX_GAP = 4
const BOX_X0 = G.left + 174
const BOX_Y = yOf(-44)

export interface EffectGraphProps {
  done: OrbitKey[]
  // All three Part 1 orbits have run: the curves, the balance point and the first two white marks.
  curvesDone: boolean
  guesses: { speed: MoreLessSameChoice; balance: YesNoChoice; gps: MoreLessSameChoice } | null
  // The learner's own altitudes from Part 2, oldest first (pink dots, the last one labelled).
  yours?: number[]
}

const SPEED_BOX: Record<MoreLessSameChoice, string> = { more: 'a bigger slowing', less: 'a smaller slowing', same: 'about the same slowing' }
const BALANCE_BOX: Record<YesNoChoice, string> = { yes: 'yes, there is one', no: 'no, there is not' }
const GPS_BOX: Record<MoreLessSameChoice, string> = { more: 'faster', less: 'slower', same: 'same rate' }

export function EffectGraph({ done, curvesDone, guesses, yours = [] }: EffectGraphProps) {
  const sweep = useMemo(() => effectSweep(), [])
  const markers = guesses ? guessMarkers(guesses.speed, guesses.balance, guesses.gps) : null
  const gpsDone = done.includes('gps')
  const yTicks = [-60, -40, -20, 0, 20, 40, 60]
  const xTicks = [0, 5000, 10000, 15000, 20000, 25000, 30000, 35000]
  return (
    <svg
      width={G.width}
      height={G.height}
      viewBox={`0 0 ${G.width} ${G.height}`}
      style={svgStyle}
      role="img"
      aria-label="A graph of how much a satellite's clock gains or loses against a ground clock, in microseconds per day, for each altitude. A violet curve for the speed effect, a green curve for the height effect, an amber curve for the two added together, and white marks for your guesses."
    >
      <text x={G.left} y={22} fontSize="14" fontWeight="bold" fill={TEXT_COLOR}>
        Effect on the satellite&rsquo;s clock, for each altitude
      </text>
      {done.length > 0 && (
        <g>
          <circle cx={G.left + 8} cy={46} r={5} fill={SPEED_COLOR} />
          <text x={G.left + 18} y={50} fontSize="12" fontWeight="bold" fill={SPEED_COLOR}>
            Speed effect (slowing)
          </text>
          <circle cx={G.left + 208} cy={46} r={5} fill={GRAVITY_COLOR} />
          <text x={G.left + 218} y={50} fontSize="12" fontWeight="bold" fill={GRAVITY_COLOR}>
            Height effect (speeding up)
          </text>
          <circle cx={G.left + 436} cy={46} r={5} fill={NET_COLOR} />
          <text x={G.left + 446} y={50} fontSize="12" fontWeight="bold" fill={NET_COLOR}>
            Net: both together
          </text>
          {yours.length > 0 && (
            <>
              <circle cx={G.left + 8} cy={68} r={5} fill={YOURS_COLOR} />
              <text x={G.left + 18} y={72} fontSize="12" fontWeight="bold" fill={YOURS_COLOR}>
                Pink: your own altitude (outline = which effect)
              </text>
            </>
          )}
        </g>
      )}

      <line x1={G.left} y1={G.top} x2={G.left} y2={G.top + PLOT_H} stroke={MUTED_COLOR} />
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={G.left - 4} y1={yOf(t)} x2={G.left} y2={yOf(t)} stroke={MUTED_COLOR} />
          <line x1={G.left} y1={yOf(t)} x2={G.left + PLOT_W} y2={yOf(t)} stroke={MUTED_COLOR} opacity={t === 0 ? 0 : 0.15} />
          <text x={G.left - 8} y={yOf(t) + 4} fontSize="11" fill={MUTED_COLOR} textAnchor="end">
            {t > 0 ? `+${t}` : t}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line x1={xOf(t)} y1={G.top + PLOT_H} x2={xOf(t)} y2={G.top + PLOT_H + 4} stroke={MUTED_COLOR} />
          <text x={xOf(t)} y={G.top + PLOT_H + 18} fontSize="11" fill={MUTED_COLOR} textAnchor="middle">
            {t.toLocaleString('en-US')}
          </text>
        </g>
      ))}
      <text x={G.left + PLOT_W / 2} y={G.height - 14} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        Altitude above Earth&rsquo;s surface (km)
      </text>
      <text x={18} y={G.top + PLOT_H / 2} fontSize="12" fill={TEXT_COLOR} textAnchor="middle" transform={`rotate(-90 18 ${G.top + PLOT_H / 2})`}>
        Clock gain or loss compared with the ground (µs per day)
      </text>

      {/* the zero line: a satellite clock that matches a ground clock */}
      <line x1={G.left} y1={yOf(0)} x2={G.left + PLOT_W} y2={yOf(0)} stroke={TEXT_COLOR} strokeWidth={2} />
      <text x={G.left + PLOT_W - 4} y={yOf(0) - 6} fontSize="11" fontWeight="bold" fill={TEXT_COLOR} textAnchor="end">
        Same as a ground clock
      </text>
      <text x={G.left + 6} y={G.top + 14} fontSize="11" fill={MUTED_COLOR}>
        Above the line: the clock runs fast
      </text>
      <text x={G.left + 6} y={G.top + PLOT_H - 8} fontSize="11" fill={MUTED_COLOR}>
        Below: the clock runs slow
      </text>

      {/* the three curves, drawn only once all three orbits have run */}
      {curvesDone && (
        <g>
          <polyline points={sweep.map((p) => `${xOf(p.altitudeKm)},${yOf(p.gravityEffectMicrosecondsPerDay)}`).join(' ')} fill="none" stroke={GRAVITY_COLOR} strokeWidth={3} />
          <polyline points={sweep.map((p) => `${xOf(p.altitudeKm)},${yOf(p.speedEffectMicrosecondsPerDay)}`).join(' ')} fill="none" stroke={SPEED_COLOR} strokeWidth={3} />
          <polyline points={sweep.map((p) => `${xOf(p.altitudeKm)},${yOf(p.netMicrosecondsPerDay)}`).join(' ')} fill="none" stroke={NET_COLOR} strokeWidth={3} />
        </g>
      )}

      {/* the dots for each orbit run so far */}
      {done.map((key) => {
        const s = orbitSummary(ORBIT_ALTITUDE[key])
        const x = xOf(s.altitudeKm)
        const nearRight = x > G.left + PLOT_W - 120
        return (
          <g key={key}>
            <line x1={x} y1={G.top - 12} x2={x} y2={G.top + PLOT_H} stroke={FAINT} strokeWidth={1} strokeDasharray="2 4" opacity={0.5} />
            <text x={x + (nearRight ? -4 : 4)} y={G.top - 6} fontSize="11" fill={FAINT} textAnchor={nearRight ? 'end' : 'start'}>
              {ORBIT_NAME[key]} {fmtKm(s.altitudeKm)}
            </text>
            <circle cx={x} cy={yOf(s.speedEffectMicrosecondsPerDay)} r={6} fill={SPEED_COLOR} stroke="#0b1020" strokeWidth={1.5} />
            <circle cx={x} cy={yOf(s.gravityEffectMicrosecondsPerDay)} r={6} fill={GRAVITY_COLOR} stroke="#0b1020" strokeWidth={1.5} />
            <circle cx={x} cy={yOf(s.netMicrosecondsPerDay)} r={6} fill={NET_COLOR} stroke="#0b1020" strokeWidth={1.5} />
            {!curvesDone && (
              <text x={x + (nearRight ? -10 : 10)} y={yOf(s.netMicrosecondsPerDay) - 8} fontSize="11" fill={NET_COLOR} textAnchor={nearRight ? 'end' : 'start'}>
                net {signed(s.netMicrosecondsPerDay, 1)}
              </text>
            )}
          </g>
        )
      })}

      {/* white marks: each drawn only once the feature beside it is drawn (CLAUDE.md §14). Each mark is joined to its own YOUR GUESS box by a
          leader that ends on the box's left edge; the boxes are ordered from the highest mark to the lowest so the leaders do not cross. */}
      {markers && (() => {
        const marks: Array<{ id: string; x: number; y: number; text: string; draw: ReactNode }> = []
        if (curvesDone) {
          const t = markers.speedTrend
          marks.push({
            id: 'speed',
            x: xOf((t.altitudeFromKm + t.altitudeToKm) / 2),
            y: yOf((t.microsecondsFrom + t.microsecondsTo) / 2),
            text: SPEED_BOX[guesses!.speed],
            draw: (
              <line x1={xOf(t.altitudeFromKm)} y1={yOf(t.microsecondsFrom)} x2={xOf(t.altitudeToKm)} y2={yOf(t.microsecondsTo)} stroke={GUESS_COLOR} strokeWidth={4} strokeLinecap="round" />
            ),
          })
          const fx = xOf(markers.balance.altitudeKm)
          marks.push({
            id: 'balance',
            x: fx,
            y: yOf(0),
            text: BALANCE_BOX[guesses!.balance],
            draw: (
              <g>
                <line x1={fx} y1={yOf(0)} x2={fx} y2={yOf(0) - 30} stroke={GUESS_COLOR} strokeWidth={3} />
                <polygon points={`${fx},${yOf(0) - 30} ${fx + 22},${yOf(0) - 23} ${fx},${yOf(0) - 16}`} fill={GUESS_COLOR} />
                {guesses!.balance === 'no' && (
                  <g stroke={GUESS_COLOR} strokeWidth={3}>
                    <line x1={fx - 8} y1={yOf(0) - 38} x2={fx + 30} y2={yOf(0) - 8} />
                    <line x1={fx - 8} y1={yOf(0) - 8} x2={fx + 30} y2={yOf(0) - 38} />
                  </g>
                )}
              </g>
            ),
          })
        }
        if (gpsDone) {
          marks.push({
            id: 'gps',
            x: xOf(markers.gpsClock.altitudeKm),
            y: yOf(markers.gpsClock.microseconds),
            text: GPS_BOX[guesses!.gps],
            draw: <circle cx={xOf(markers.gpsClock.altitudeKm)} cy={yOf(markers.gpsClock.microseconds)} r={10} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />,
          })
        }
        const ordered = [...marks].sort((p, q) => p.x - q.x)
        return (
          <g>
            {ordered.map((m, i) => {
              const bx = BOX_X0 + i * (BOX_W + BOX_GAP)
              return (
                <g key={m.id}>
                  {m.draw}
                  <line x1={m.x} y1={m.y + (m.id === 'gps' ? 11 : m.id === 'speed' ? 6 : 4)} x2={bx + BOX_W / 2} y2={BOX_Y} stroke={GUESS_COLOR} strokeWidth={1.5} />
                  <GuessBox x={bx} y={BOX_Y} width={BOX_W} second={m.text} />
                </g>
              )
            })}
          </g>
        )
      })()}

      {/* the learner's own altitudes (Part 2): pink fill, outlined in the colour of each effect */}
      {yours.map((km, i) => {
        const s = orbitSummary(km)
        const x = xOf(km)
        const isLast = i === yours.length - 1
        const rad = isLast ? 7 : 4.5
        const nearRight = x > G.left + PLOT_W - 220
        return (
          <g key={i}>
            <circle cx={x} cy={yOf(s.speedEffectMicrosecondsPerDay)} r={rad} fill={YOURS_COLOR} stroke={SPEED_COLOR} strokeWidth={2.5} />
            <circle cx={x} cy={yOf(s.gravityEffectMicrosecondsPerDay)} r={rad} fill={YOURS_COLOR} stroke={GRAVITY_COLOR} strokeWidth={2.5} />
            <circle cx={x} cy={yOf(s.netMicrosecondsPerDay)} r={rad} fill={YOURS_COLOR} stroke={NET_COLOR} strokeWidth={2.5} />
            {isLast && (
              <text
                x={x + (nearRight ? -12 : 12)}
                y={yOf(Math.min(s.speedEffectMicrosecondsPerDay, s.netMicrosecondsPerDay)) + 20}
                fontSize="11"
                fontWeight="bold"
                fill={YOURS_COLOR}
                textAnchor={nearRight ? 'end' : 'start'}
                stroke="#0b1020"
                strokeWidth={3}
                paintOrder="stroke"
              >
                your altitude {fmtKm(km)}: net {signed(s.netMicrosecondsPerDay, 2)} µs/day
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ---- captions: one under each picture, in Part 1 and in Part 2 ----
type Item = { look: string; means: string; matters: string }

const has = (done: OrbitKey[], k: OrbitKey) => done.includes(k)

function part1Items(done: OrbitKey[]) {
  const iss = orbitSummary(ORBIT_PRESETS_KM.iss)
  const gps = orbitSummary(ORBIT_PRESETS_KM.gps)
  const geo = orbitSummary(ORBIT_PRESETS_KM.geostationary)
  const curvesDone = done.length === 3
  const drawingItems: Item[] = []
  const graphItems: Item[] = []
  if (has(done, 'iss') && has(done, 'gps')) {
    drawingItems.push({
      look: 'the ISS ring and the GPS ring, in the drawing',
      means: `the ISS flies about ${fmtKm(iss.altitudeKm)} up and a GPS satellite about ${fmtKm(gps.altitudeKm)}, about ${Math.round(gps.altitudeKm / iss.altitudeKm)} times higher.`,
      matters: 'it shows how large a change in height the graph covers.',
    })
  }
  if (has(done, 'geostationary')) {
    drawingItems.push({
      look: 'the outermost ring, in the drawing',
      means: `at about ${fmtKm(geo.altitudeKm)}, a satellite goes round Earth once in about one day, the same time Earth takes to spin once. The two keep pace, so to someone on the ground the satellite looks fixed in the sky, always above the same spot on the equator. That is why this is called a geostationary orbit. The drawing does not show Earth spinning, so you cannot see this in the picture.`,
      matters: 'it is the highest orbit used on this page.',
    })
  }
  if (has(done, 'iss')) {
    graphItems.push({
      look: 'the three dots at the ISS orbit (violet, green and amber)',
      means: `at about ${fmtKm(iss.altitudeKm)} the speed effect is ${signed(iss.speedEffectMicrosecondsPerDay)} µs/day, the height effect ${signed(iss.gravityEffectMicrosecondsPerDay)} and the net ${signed(iss.netMicrosecondsPerDay)}, so the net is below zero.`,
      matters: 'it shows that, for a low orbit, one of the two effects is far bigger than the other.',
    })
  }
  if (has(done, 'gps')) {
    graphItems.push({
      look: 'the amber dot at the GPS orbit',
      means: `it sits above the zero line, at ${signed(gps.netMicrosecondsPerDay)} µs/day.`,
      matters: 'it is the picture of the third question: whether a GPS satellite’s clock runs fast or slow.',
    })
  }
  if (curvesDone) {
    graphItems.push({
      look: 'the violet curve from left to right',
      means: `it goes from ${signed(iss.speedEffectMicrosecondsPerDay)} µs/day at ${fmtKm(iss.altitudeKm)} to ${signed(geo.speedEffectMicrosecondsPerDay)} at ${fmtKm(geo.altitudeKm)}.`,
      matters: 'it is the picture of the first question: how the slowing from speed changes as the orbit gets higher.',
    })
    graphItems.push({
      look: 'the amber curve against the zero line',
      means: `it crosses the line once, at about ${Math.round(balanceAltitudeKm()).toLocaleString('en-US')} km, and is above it at every higher altitude.`,
      matters: 'it is the picture of the second question. The tutor explains why it crosses.',
    })
  }
  return { drawingItems, graphItems }
}

export function Part1DrawingCaption({ done }: { done: OrbitKey[] }) {
  const { drawingItems } = part1Items(done)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the orbit drawing.</strong> It is a view from above Earth&rsquo;s pole. It shows where each satellite is, and nothing about its clock.
      </p>
      <ul style={listStyle}>
        <li>The <strong>blue disc</strong> is Earth. The <strong>ring</strong> is the orbit, and the <strong>dot</strong> is the satellite. The dashed line from Earth&rsquo;s surface to the dot is the <strong>altitude</strong>, in kilometres (km).</li>
        <li>
          <strong>Not to scale.</strong> The drawing squeezes the distances (it uses a square-root scale) so that Earth and all three orbits fit. A real GPS orbit is about 50 times as high above the ground as the Space Station&rsquo;s, but on the page it is not drawn
          50 times higher. Only the order, higher or lower, is true.
        </li>
        <li>The <strong>faint grey rings</strong> are the orbits you have already run; the legend at the top left names them.</li>
        <li>
          The <strong>dashed pale-blue ring</strong> appears after all three orbits have run. It marks one altitude, explained under the graph.
        </li>
      </ul>
      {drawingItems.length > 0 ? (
        <LookFor items={drawingItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> in the drawing appears here as the orbits are run.
        </p>
      )}
    </CaptionBox>
  )
}

export function Part1GraphCaption({ done }: { done: OrbitKey[] }) {
  const { graphItems } = part1Items(done)
  const w = workedNumbers()
  const gpsDone = has(done, 'gps')
  const curvesDone = done.length === 3
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the graph.</strong> It shows how much a satellite&rsquo;s clock gains or loses compared with a clock on the ground, for each altitude. It is built from the same numbers as the drawing.
      </p>
      <ul style={listStyle}>
        <li>
          Along the bottom is the <strong>altitude</strong> in km. Up the side is the clock&rsquo;s <strong>gain or loss</strong> in <strong>microseconds per day</strong> (µs/day). A microsecond is one millionth of a second. The bold line at 0 is a clock that matches a
          ground clock: above it the satellite&rsquo;s clock runs fast (it gains), below it the clock runs slow (it loses).
        </li>
        <li>
          The <strong>violet</strong> dots and curve are the effect of the satellite&rsquo;s <strong>speed</strong>. The <strong>green</strong> ones are the effect of its <strong>height</strong> in Earth&rsquo;s gravity. The <strong>amber</strong> ones are the two added together.
        </li>
        <li>
          Your guesses are the <strong>white marks</strong>, each in a box marked YOUR GUESS. For the first question only the <strong>direction</strong> of the short white line is your guess (down to the right for &ldquo;a bigger slowing&rdquo;, up to the right for &ldquo;a smaller
          slowing&rdquo;, flat for &ldquo;about the same&rdquo;); its place and size mean nothing. For the second question the white flag is <strong>only a marker</strong> for yes or no (a crossed-out flag means no), and its place along the line means nothing. For the third question
          the white ring sits above the zero line for &ldquo;faster&rdquo;, below for &ldquo;slower&rdquo; and on it for &ldquo;same rate&rdquo;, and its height means nothing.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>What happens, in order.</strong> Each orbit you run puts three dots on the graph (violet, green and amber). The third run draws the three curves through the dots and adds your white marks for the first two questions. Your mark for the third question appears once the
        GPS orbit has been run.
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong>{' '}
        {gpsDone
          ? `At the GPS orbit the speed effect is ${signed(w.speedMicroseconds)} µs/day (the clock loses ${Math.abs(w.speedMicroseconds).toFixed(2)} millionths of a second a day) and the height effect is ${signed(w.gravityMicroseconds)} µs/day. Added together: ${signed(w.speedMicroseconds)} + ${w.gravityMicroseconds.toFixed(2)} = ${signed(w.netMicroseconds)} µs/day.`
          : 'The numbers for a worked moment appear here once the GPS orbit has been run.'}
      </p>
      {graphItems.length > 0 ? (
        <LookFor items={graphItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> in the graph appears here as the orbits are run{curvesDone ? '' : ', and the curves once all three have run'}.
        </p>
      )}
    </CaptionBox>
  )
}

function part2Items(yours: number[], curvesDone: boolean) {
  const drawingItems: Item[] = []
  const graphItems: Item[] = []
  const latest = yours.length > 0 ? yours[yours.length - 1] : null
  const s = latest !== null ? orbitSummary(latest) : null
  if (s && latest !== null) {
    const below = latest < balanceAltitudeKm()
    if (curvesDone) {
      drawingItems.push({
        look: 'your pink ring against the dashed pale-blue ring',
        means: `your altitude, ${fmtKm(latest)}, is ${below ? 'below' : 'above'} the ring at about ${Math.round(balanceAltitudeKm()).toLocaleString('en-US')} km.`,
        matters: 'you can test the balance altitude yourself: try altitudes on both sides of the ring.',
      })
    }
    graphItems.push({
      look: 'your pink net dot (outlined in amber) against the zero line',
      means: `at ${fmtKm(latest)} the net is ${signed(s.netMicrosecondsPerDay)} µs/day, ${s.netMicrosecondsPerDay < 0 ? 'below' : 'above'} the line.`,
      matters: 'moving the slider moves the three pink dots, so you can find the pattern for yourself.',
    })
    if (curvesDone) {
      graphItems.push({
        look: 'your pink dots, against the curves',
        means: 'every pink dot lands on the curve of its own colour, whatever altitude you choose, because the curves are the effects at every altitude.',
        matters: 'it shows that the curves are not only for the three orbits in Part 1: they answer for any altitude you can try.',
      })
    }
  }
  return { drawingItems, graphItems, latest, s }
}

export function Part2DrawingCaption({ yours, curvesDone }: { yours: number[]; curvesDone: boolean }) {
  const { drawingItems } = part2Items(yours, curvesDone)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the orbit drawing.</strong> It is the drawing of Part 1 again, a view from above Earth&rsquo;s pole, now showing your own altitude in pink. Part 1&rsquo;s orbits stay as faint grey rings.
      </p>
      <ul style={listStyle}>
        <li>The <strong>blue disc</strong> is Earth. The <strong>pink ring</strong> is your orbit, the <strong>pink dot</strong> is your satellite, and the dashed line is its <strong>altitude</strong> in km.</li>
        <li>
          <strong>Not to scale:</strong> the drawing squeezes the distances so that everything fits. Only the order, higher or lower, is true.
        </li>
        <li>The <strong>dashed pale-blue ring</strong> (after all three Part 1 orbits) marks the balance altitude.</li>
      </ul>
      {drawingItems.length > 0 ? (
        <LookFor items={drawingItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> in the drawing appears here after your first run{curvesDone ? '' : ' (and the balance ring after all three Part 1 orbits)'}.
        </p>
      )}
    </CaptionBox>
  )
}

export function Part2GraphCaption({ yours, curvesDone }: { yours: number[]; curvesDone: boolean }) {
  const { graphItems, latest, s } = part2Items(yours, curvesDone)
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read the graph.</strong> It is the graph of Part 1, with your altitudes added. The <strong>violet, green and amber</strong> dots and curves are from Part 1, once they have been drawn there. The <strong>pink dots</strong> are your altitudes, each
        outlined in the colour of the effect it shows: violet for speed, green for height, amber for the net.
      </p>
      {s && latest !== null && (
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>A worked moment, from your latest altitude.</strong> At {fmtKm(latest)} the satellite moves at {s.speedKmPerSecond.toFixed(3)} km/s. The speed effect is {signed(s.speedEffectMicrosecondsPerDay)} µs/day and the height effect is{' '}
          {signed(s.gravityEffectMicrosecondsPerDay)} µs/day. Added together: {signed(s.speedEffectMicrosecondsPerDay)} + {s.gravityEffectMicrosecondsPerDay.toFixed(2)} = {signed(s.netMicrosecondsPerDay)} µs/day.
        </p>
      )}
      {graphItems.length > 0 ? (
        <LookFor items={graphItems} />
      ) : (
        <p style={{ marginTop: 0, marginBottom: 0 }}>
          <strong>What to look for</strong> and a worked moment appear here after your first run.
        </p>
      )}
    </CaptionBox>
  )
}
