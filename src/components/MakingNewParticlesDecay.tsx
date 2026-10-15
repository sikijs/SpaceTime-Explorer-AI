import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { totalsOf } from '../physics/energyMomentum'
import { runDecay } from '../physics/makingNewParticles'

// Step 4 of docs/experiments/spacetime-geometry/06-making-new-particles.md for Part 2 (decay): the section, the introduction (stage B),
// the two controls (the pieces' mass, r, and the passing observer's speed), a labeled diagram of the setup (the parent at rest, and
// the passing observer), and its "How to read this diagram" caption (CLAUDE.md §14). Only the setup is shown. There is deliberately no
// tutor yet (Step 7 adds the results table, shown when the run ends: values only, with plain labels, and the explanation is the
// tutor's, §12). Every number
// comes from `runDecay` (CLAUDE.md §9). Wording here is draft for the owner's review (CLAUDE.md §28.1).

// The terms and formulas that stage B's introduction defines, added to the "Words and formulas" panel once Part 2 appears (spec,
// Introduction, rule 5). They repeat the introduction's wording, with no new claims.
export const PART_TWO_REFERENCE_ENTRIES: { term: string; meaning: string }[] = [
  { term: 'Decay', meaning: 'a particle turning into lighter particles on its own, with nothing hitting it.' },
  { term: 'Parent, pieces', meaning: 'the parent is the particle before it decays. The pieces are what it turns into.' },
  { term: 'Mass given up', meaning: 'the parent’s mass minus the sum of the pieces’ rest masses.' },
  {
    term: 'Pieces of a decay at rest: E = ½ each, pc = √(¼ − r²)',
    meaning:
      'the parent is at rest, so the total momentum is zero, and the two equal pieces move apart with equal energies, each half the parent’s energy. Here r is each piece’s mass as a fraction of the parent’s.',
  },
]

type Prediction = 'less' | 'same' | 'more'

// The three answers of Part 2's prediction in the specification's "Prediction Activity" section (wording is a draft, §28.1). Not
// scored, and the learner is not told which is right (§12). The right answer depends on the setting, which is the point.
const PREDICTION_CHOICES: { value: Prediction; label: string }[] = [
  { value: 'less', label: "(a) The pieces' masses add up to less than the parent's mass." },
  { value: 'same', label: "(b) The same as the parent's mass." },
  { value: 'more', label: "(c) More than the parent's mass." },
]

const MASS_PRESETS: { value: number; label: string }[] = [
  { value: 0, label: '0 (pieces of light)' },
  { value: 0.1, label: '0.1' },
  { value: 0.25, label: '0.25' },
  { value: 0.4, label: '0.4' },
  { value: 0.5, label: '0.5' },
  { value: 0.6, label: '0.6' },
]
const PASSING_SPEED_PRESETS = [-0.6, -0.3, 0.3, 0.6]

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
const LAB_COLOR = '#38bdf8'
const PASSING_COLOR = '#c4b5fd'
const HALO: CSSProperties = { paintOrder: 'stroke', stroke: '#0b1020', strokeWidth: 3 }

const VIEW_WIDTH = 520
const VIEW_HEIGHT = 560
const CENTER_X = 260
const PARENT_RADIUS = 22

function formatNumber(value: number, digits = 2): string {
  const text = value.toFixed(digits)
  return /^-0\.0+$/.test(text) ? text.slice(1) : text.replace('-', '−')
}

function passingLabel(speed: number): string {
  return `${speed > 0 ? '+' : '−'}${Math.abs(speed)}c`
}

// Wall-clock length of the playback. It only sets how fast the result is shown; the physics does not depend on it (§11).
const ANIMATION_DURATION_MS = 12_000
// The share of the playback used by each stage: the lab's picture, then the passing observer's picture, then the ledger bars.
const LAB_END = 0.4
const OBSERVER_END = 0.8
// Pixels the pieces travel for each 1c of speed, the same in both pictures so that speeds can be compared.
const PIXELS_PER_SPEED = 150
const PICTURE_HEIGHT = 330
const LIGHT_COLOR = '#facc15'

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

// Where a picture is in its own story, from 0 to 1: a pause with the parent, a flash as it splits, then the pieces moving apart.
function panelStory(q: number): { split: boolean; move: number; flash: number } {
  const move = clamp01((q - 0.3) / 0.7)
  return { split: q >= 0.2, move: move * move * (3 - 2 * move), flash: q >= 0.2 && q < 0.35 ? 1 - (q - 0.2) / 0.15 : 0 }
}

function speedWords(speed: number): string {
  if (Math.abs(speed) < 5e-10) return 'at rest'
  return `${speed > 0 ? 'moving right' : 'moving left'}`
}

interface PieceShape {
  name: string
  note: string
  isLight: boolean
  restMass: number
  energy: number
  momentumTimesC: number
  speed: number
}

interface PanelProps {
  top: number
  title: string
  subtitle: string
  color: string
  q: number
  allowed: boolean
  parent: { energy: number; momentumTimesC: number; speed: number }
  pieces: PieceShape[]
  arrowId: string
}

// One picture of the decay. Before the split it shows the parent (with an arrow if it is moving). After the split it shows the two
// pieces moving apart from the place where the parent was. The labels stay where the pieces end up, so they do not move while
// the pieces do. If the decay is not allowed, the parent stays and the picture says so.
function DecayPanel({ top, title, subtitle, color, q, allowed, parent, pieces, arrowId }: PanelProps) {
  const story = panelStory(q)
  const lineY = top + 96
  const showPieces = allowed && story.split
  const finalXs = pieces.map((p) => CENTER_X + p.speed * PIXELS_PER_SPEED)
  const labelXs = [...finalXs]
  if (pieces.length === 2 && Math.abs(finalXs[0] - finalXs[1]) < 150) {
    const mid = (finalXs[0] + finalXs[1]) / 2
    const order = finalXs[0] <= finalXs[1] ? [0, 1] : [1, 0]
    labelXs[order[0]] = mid - 75
    labelXs[order[1]] = mid + 75
  }
  const arrow = (x: number, speed: number, radius: number) =>
    Math.abs(speed) < 5e-10 ? null : (
      <line
        x1={x + Math.sign(speed) * (radius + 4)}
        y1={lineY}
        x2={x + Math.sign(speed) * (radius + 4 + 14 + 40 * Math.abs(speed))}
        y2={lineY}
        stroke={color}
        strokeWidth="2.5"
        markerEnd={`url(#${arrowId})`}
      />
    )

  return (
    <g>
      <text x="12" y={top + 16} fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        {title}
      </text>
      <text x="12" y={top + 32} fontSize="11" fill={MUTED_COLOR}>
        {subtitle}
      </text>
      <line x1="20" y1={lineY} x2={VIEW_WIDTH - 20} y2={lineY} stroke={TICK_COLOR} strokeWidth="1" strokeDasharray="2 5" />

      {(!showPieces || !allowed) && (
        <g>
          {arrow(CENTER_X, parent.speed, PARENT_RADIUS)}
          <circle cx={CENTER_X} cy={lineY} r={PARENT_RADIUS} fill={color} stroke="#0b1020" strokeWidth="1.5" />
          <text x={CENTER_X} y={lineY - 36} fontSize="12" fontWeight="bold" textAnchor="middle" fill={color} style={HALO}>
            The parent
          </text>
          <text x={CENTER_X} y={lineY - 22} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
            {Math.abs(parent.speed) < 5e-10 ? 'at rest' : `${speedWords(parent.speed)}, ${formatNumber(Math.abs(parent.speed))}c`}
          </text>
          {!showPieces && (
            <g>
              <text x={CENTER_X} y={lineY + 40} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                mass 1
              </text>
              <text x={CENTER_X} y={lineY + 54} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                energy {formatNumber(parent.energy)}
              </text>
              <text x={CENTER_X} y={lineY + 68} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                momentum × c {formatNumber(parent.momentumTimesC)}
              </text>
            </g>
          )}
        </g>
      )}

      {story.flash > 0 && allowed && (
        <circle
          cx={CENTER_X}
          cy={lineY}
          r={PARENT_RADIUS + 20 * (1 - story.flash)}
          fill="none"
          stroke="#facc15"
          strokeWidth="3"
          opacity={story.flash}
        />
      )}

      {showPieces &&
        pieces.map((p, i) => {
          const x = CENTER_X + p.speed * PIXELS_PER_SPEED * story.move
          const radius = Math.max(PARENT_RADIUS * Math.sqrt(p.restMass), 6)
          return (
            <g key={p.name}>
              {p.isLight ? (
                <line
                  x1={x - Math.sign(p.speed) * 18}
                  y1={lineY}
                  x2={x + Math.sign(p.speed) * 18}
                  y2={lineY}
                  stroke={LIGHT_COLOR}
                  strokeWidth="3.5"
                  markerEnd={`url(#decay-arrowhead-${LIGHT_COLOR.slice(1)})`}
                />
              ) : (
                <g>
                  {arrow(x, p.speed, radius)}
                  <circle cx={x} cy={lineY} r={radius} fill={color} stroke="#0b1020" strokeWidth="1.5" />
                </g>
              )}
              <text
                x={labelXs[i]}
                y={lineY - 36}
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fill={p.isLight ? LIGHT_COLOR : color}
                style={HALO}
              >
                {p.name}
              </text>
              <text x={labelXs[i]} y={lineY - 22} fontSize="10" textAnchor="middle" fill={p.isLight ? LIGHT_COLOR : color} style={HALO}>
                {p.note}
              </text>
              <text x={labelXs[i]} y={lineY + 40} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                {p.isLight ? 'speed 1c (light)' : `speed ${formatNumber(Math.abs(p.speed))}c`}
              </text>
              <text x={labelXs[i]} y={lineY + 54} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                energy {formatNumber(p.energy)}
              </text>
              <text x={labelXs[i]} y={lineY + 68} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                momentum × c {formatNumber(p.momentumTimesC)}
              </text>
              <text x={labelXs[i]} y={lineY + 82} fontSize="11" textAnchor="middle" fill={color} style={HALO}>
                rest mass {formatNumber(p.restMass)}
              </text>
            </g>
          )
        })}

      {!allowed && q >= 0.3 && (
        <g>
          <text x={CENTER_X} y={lineY + 100} fontSize="12" fontWeight="bold" textAnchor="middle" fill="#fb923c" style={HALO}>
            No decay can happen.
          </text>
          <text x={CENTER_X} y={lineY + 116} fontSize="11" textAnchor="middle" fill="#fb923c" style={HALO}>
            The pieces would weigh more than the parent.
          </text>
        </g>
      )}
    </g>
  )
}

interface DecayDiagramProps {
  passingSpeed: number
  pieceMass: number
  // null while idle (only the setup is shown); otherwise how far the playback has got, from 0 to 1.
  progress: number | null
}

const CELL: CSSProperties = { padding: '0.3rem 1rem 0.3rem 0' }

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%', marginBottom: '0.75rem' }}>
      <table style={{ fontSize: '0.875rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{ ...CELL, textAlign: 'left' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i} style={CELL}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// A difference that is zero apart from rounding is shown as 0.0000.
function formatDifference(value: number): string {
  return formatNumber(Math.abs(value) < 5e-10 ? 0 : value, 4)
}

// The results, shown only when the run ends. Values only, with plain labels: what they mean is the tutor's to explain (§12).
function DecayResults({ pieceMass, passingSpeed, prediction }: { pieceMass: number; passingSpeed: number; prediction: Prediction }) {
  const result = runDecay(pieceMass, passingSpeed)
  const chosen = PREDICTION_CHOICES.find((c) => c.value === prediction)?.label
  const record = (
    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
      The pieces' mass was r = {pieceMass === 0 ? '0 (pieces of light)' : pieceMass} times the parent's mass, and the passing observer moved
      at {passingLabel(passingSpeed)}. Masses and energies are in the parent's rest energies. <strong>Your prediction was:</strong> {chosen}{' '}
      It is only recorded here, not marked right or wrong.
    </p>
  )
  if (!result.allowed) {
    return (
      <div style={{ marginTop: '1.5rem', overflowX: 'auto', maxWidth: '100%' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Results</h3>
        {record}
        <p style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>No decay can happen.</p>
        <Table
          head={['', 'Mass']}
          rows={[
            ["The parent's mass", formatNumber(1, 4)],
            ["The pieces' rest masses added up (2r)", formatNumber(result.sumOfRestMasses, 4)],
          ]}
        />
      </div>
    )
  }

  const labBefore = totalsOf([result.labParent])
  const labAfter = totalsOf(result.labPieces.map((p) => p.reading))
  const passingBefore = totalsOf([result.passingParent])
  const passingAfter = totalsOf(result.passingPieces.map((p) => p.reading))
  const row = (name: string, before: number, after: number) => [
    name,
    formatNumber(before, 4),
    formatNumber(after, 4),
    formatDifference(after - before),
  ]
  const pieceRows = (pieces: typeof result.labPieces) =>
    pieces.map((p, i) => [
      pieceMass === 0 ? `Light pulse ${i + 1}` : `Piece ${i + 1}`,
      pieceMass === 0 ? '1c (light)' : `${formatNumber(Math.abs(p.reading.speed), 4)}c`,
      formatNumber(p.reading.energy, 4),
      formatNumber(p.reading.momentumTimesC, 4),
      formatNumber(p.restMass, 4),
    ])
  return (
    <div style={{ marginTop: '1.5rem', overflowX: 'auto', maxWidth: '100%' }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Results</h3>
      {record}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The masses.</strong>
      </p>
      <Table
        head={['', 'Mass']}
        rows={[
          ["The parent's mass", formatNumber(1, 4)],
          ["The pieces' rest masses added up (2r)", formatNumber(result.sumOfRestMasses, 4)],
          ['The mass given up (parent − pieces)', formatNumber(result.massGivenUp, 4)],
        ]}
      />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The pieces, as the lab measures them.</strong>
      </p>
      <Table head={['', 'Speed', 'Energy', 'Momentum × c', 'Rest mass']} rows={pieceRows(result.labPieces)} />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The pieces, as the passing observer ({passingLabel(passingSpeed)}) measures them.</strong>
      </p>
      <Table head={['', 'Speed', 'Energy', 'Momentum × c', 'Rest mass']} rows={pieceRows(result.passingPieces)} />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The totals, before the decay (the parent) and after it (the two pieces together).</strong> A difference of zero means the
        total did not change.
      </p>
      <Table
        head={['', 'Before', 'After', 'Difference']}
        rows={[
          row('Lab: total energy', labBefore.energy, labAfter.energy),
          row('Lab: total momentum × c', labBefore.momentumTimesC, labAfter.momentumTimesC),
          row('Passing observer: total energy', passingBefore.energy, passingAfter.energy),
          row('Passing observer: total momentum × c', passingBefore.momentumTimesC, passingAfter.momentumTimesC),
        ]}
      />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>The system's mass, worked out from the total energy and total momentum.</strong>
      </p>
      <Table
        head={['', 'Before', 'After']}
        rows={[
          ['As the lab finds it', formatNumber(Math.sqrt(result.labParent.invariant), 4), formatNumber(result.systemMassLab, 4)],
          [
            'As the passing observer finds it',
            formatNumber(Math.sqrt(result.passingParent.invariant), 4),
            formatNumber(result.systemMassPassing, 4),
          ],
        ]}
      />
    </div>
  )
}

function DecayDiagram({ passingSpeed, pieceMass, progress }: DecayDiagramProps) {
  const result = runDecay(pieceMass, passingSpeed)
  const playing = progress !== null
  const labQ = playing ? clamp01(progress / LAB_END) : 0
  const observerQ = playing ? clamp01((progress - LAB_END) / (OBSERVER_END - LAB_END)) : 0
  const showObserver = playing && progress > LAB_END
  const parent = result.labParent
  const shapeOf = (pieces: typeof result.labPieces): PieceShape[] =>
    pieces.map((piece, i) => ({
      name: pieceMass === 0 ? `Light pulse ${i + 1}` : `Piece ${i + 1}`,
      note: `went ${i === 0 ? 'right' : 'left'} in the lab`,
      isLight: pieceMass === 0,
      restMass: piece.restMass,
      energy: piece.reading.energy,
      momentumTimesC: piece.reading.momentumTimesC,
      speed: piece.reading.speed,
    }))
  const arrowIds = (color: string) => `decay-arrowhead-${color.slice(1)}`
  const labPieces = shapeOf(result.labPieces)
  const passingPieces = shapeOf(result.passingPieces)
  const resultNote = playing
    ? ` In the lab, ${result.allowed ? `the parent splits into two ${pieceMass === 0 ? 'light pulses' : 'pieces'}.` : 'no decay can happen.'}`
    : ''
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`${playing ? 'Playback' : 'Setup'}: in the lab, a parent particle sits at rest, with a mass of 1, an energy of ${parent.energy.toFixed(2)} and a momentum times c of ${parent.momentumTimesC.toFixed(2)}. A passing observer moves along the same line at ${passingLabel(passingSpeed)}.${resultNote}`}
      style={SVG_STYLE}
    >
      <defs>
        {[PASSING_COLOR, LAB_COLOR, LIGHT_COLOR].map((color) => (
          <marker
            key={color}
            id={arrowIds(color)}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
          </marker>
        ))}
      </defs>
      <text x="12" y="16" fontSize="11" fill={MUTED_COLOR}>
        Energy is in the parent's rest energies. Momentum is shown as momentum × c.
      </text>
      <text x="12" y="30" fontSize="11" fill={MUTED_COLOR}>
        Both pictures are on the same scale.
      </text>
      <g transform="translate(0 28)">
        <DecayPanel
          top={0}
          title="Picture 1: the lab's view"
          subtitle="The lab is at rest, and so is the parent."
          color={LAB_COLOR}
          q={labQ}
          allowed={result.allowed}
          parent={{ energy: parent.energy, momentumTimesC: parent.momentumTimesC, speed: 0 }}
          pieces={labPieces}
          arrowId={arrowIds(LAB_COLOR)}
        />

        {/* The passing observer, marked in the setup: a hollow circle with an arrow for their way and speed. */}
        <circle cx={CENTER_X} cy="234" r="8" fill="#0b1020" stroke={PASSING_COLOR} strokeWidth="2.5" />
        <line
          x1={CENTER_X + Math.sign(passingSpeed) * 14}
          y1="234"
          x2={CENTER_X + Math.sign(passingSpeed) * (14 + 20 + 80 * Math.abs(passingSpeed))}
          y2="234"
          stroke={PASSING_COLOR}
          strokeWidth="2.5"
          markerEnd={`url(#${arrowIds(PASSING_COLOR)})`}
        />
        <text x={CENTER_X} y="264" fontSize="12" fontWeight="bold" textAnchor="middle" fill={PASSING_COLOR}>
          The passing observer
        </text>
        <text x={CENTER_X} y="280" fontSize="11" textAnchor="middle" fill={PASSING_COLOR}>
          moves at {passingLabel(passingSpeed)} ({passingSpeed > 0 ? 'to the right' : 'to the left'}), along the same line
        </text>

        {showObserver ? (
          <DecayPanel
            top={PICTURE_HEIGHT - 30}
            title="Picture 2: the same decay, as the passing observer measures it"
            subtitle="Their ruler and clocks move with them, so for them they are at rest."
            color={PASSING_COLOR}
            q={observerQ}
            allowed={result.allowed}
            parent={{
              energy: result.passingParent.energy,
              momentumTimesC: result.passingParent.momentumTimesC,
              speed: result.passingParent.speed,
            }}
            pieces={passingPieces}
            arrowId={arrowIds(PASSING_COLOR)}
          />
        ) : (
          <text x="12" y={PICTURE_HEIGHT - 10} fontSize="11" fill={MUTED_COLOR}>
            {playing
              ? 'Next, the same decay as the passing observer measures it.'
              : 'Press Run to see the decay, and then how the passing observer measures it.'}
          </text>
        )}
      </g>
    </svg>
  )
}

const LEDGER_BAR_WIDTH = 340

// The ledger: bars for the parent's mass and the sum of the pieces' rest masses, and bars for the system's mass of the pieces, as the
// lab and the passing observer find it. `fill` is how much of each bar is drawn, from 0 to 1.
function DecayLedger({ pieceMass, passingSpeed, fill }: { pieceMass: number; passingSpeed: number; fill: number }) {
  const result = runDecay(pieceMass, passingSpeed)
  const full = fill >= 1
  const scale = LEDGER_BAR_WIDTH / Math.max(1, result.sumOfRestMasses)
  const rows: { name: string; value: number; color: string }[] = [
    { name: "The parent's mass", value: 1, color: LAB_COLOR },
    { name: 'Sum of the pieces’ rest masses', value: result.sumOfRestMasses, color: '#94a3b8' },
  ]
  if (result.allowed) {
    rows.push({ name: "The system's mass of the pieces, as the lab finds it", value: result.systemMassLab, color: LAB_COLOR })
    rows.push({
      name: "The system's mass of the pieces, as the passing observer finds it",
      value: result.systemMassPassing,
      color: PASSING_COLOR,
    })
  }
  const rowHeight = 22
  const top = 50
  const height = top + rows.length * (rowHeight + 38) + 50
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${height}`}
      role="img"
      aria-label={`Mass ledger. The parent's mass is 1. The sum of the pieces' rest masses is ${result.sumOfRestMasses.toFixed(2)}.${result.allowed ? ` The system's mass of the pieces is ${result.systemMassLab.toFixed(2)} for the lab and ${result.systemMassPassing.toFixed(2)} for the passing observer. The mass given up is ${result.massGivenUp.toFixed(2)}.` : ' No decay can happen, because the pieces would weigh more than the parent.'}`}
      style={SVG_STYLE}
    >
      <text x="12" y="20" fontSize="12" fontWeight="bold" fill={TEXT_COLOR}>
        The mass ledger
      </text>
      <text x="12" y="36" fontSize="11" fill={MUTED_COLOR}>
        Masses are in the parent's rest energies. A longer bar is a larger mass.
      </text>
      {rows.map((row, i) => {
        const y = top + i * (rowHeight + 38) + 16
        return (
          <g key={row.name}>
            <text x="12" y={y - 4} fontSize="11" fill={TEXT_COLOR}>
              {row.name}
            </text>
            <rect x="12" y={y + 2} width={Math.max(row.value * scale * fill, 0)} height={rowHeight} fill={row.color} />
            {full && (
              <text x="12" y={y + rowHeight + 16} fontSize="10" fill={MUTED_COLOR}>
                {formatNumber(row.value, 3)}
              </text>
            )}
          </g>
        )
      })}
      {full && (
        <text x="12" y={height - 16} fontSize="12" fontWeight="bold" fill={result.allowed ? TEXT_COLOR : '#fb923c'}>
          {result.allowed
            ? `Mass given up: 1 − ${formatNumber(result.sumOfRestMasses)} = ${formatNumber(result.massGivenUp)}`
            : `The pieces would weigh ${formatNumber(result.sumOfRestMasses)}, more than the parent's 1: no decay can happen.`}
        </text>
      )}
    </svg>
  )
}

const LINK_BUTTON: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  color: '#0066cc',
  textDecoration: 'underline',
  cursor: 'pointer',
}

// Part 2's section. `skippedPartOne` is true when the learner reached Part 2 with the skip link instead of through Part 1's tutor; the
// introduction then adds a reminder. `onBackToPartOne` scrolls back up to Part 1.
export function MakingNewParticlesDecay({
  skippedPartOne = false,
  onBackToPartOne,
}: {
  skippedPartOne?: boolean
  onBackToPartOne?: () => void
}) {
  const [pieceMass, setPieceMass] = useState(0.25)
  const [passingSpeed, setPassingSpeed] = useState(0.3)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle')
  const [progress, setProgress] = useState(0)
  const returnToIdle = () => {
    setStatus('idle')
    setProgress(0)
  }

  useEffect(() => {
    if (status !== 'running') return

    const startTime = performance.now()
    let frameId: number

    const animate = (currentTime: number) => {
      const fraction = clamp01((currentTime - startTime) / ANIMATION_DURATION_MS)
      setProgress(fraction)

      if (fraction >= 1) {
        setStatus('complete')
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [status])

  return (
    <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Part 2 — Decay</h3>
      {onBackToPartOne && (
        <p style={{ fontSize: '0.875rem', marginTop: 0, marginBottom: '1rem' }}>
          <button type="button" onClick={onBackToPartOne} style={LINK_BUTTON}>
            ← Back to Part 1 - Making a new particle
          </button>
        </p>
      )}

      {/* Introduction, stage B (needed by Part 2): draft wording for the owner's review (CLAUDE.md §28.1), from the specification's
          "Introduction: two stages". It does not say how the pieces' masses compare with the parent's (that is Part 2's prediction, §12). */}
      <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {skippedPartOne && (
          <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
            <strong>If you skipped Part 1.</strong> This part uses the system's mass, M = √(E_total² − (P_total c)²), worked out from the
            total energy and total momentum of all the particles taken together, and the idea of a threshold: a reaction can happen only if
            the system's mass is at least the total rest mass of everything that comes out. For example, a system with a total energy of 5
            and a total momentum × c of 3 has M = √(25 − 9) = 4. Open the "Words and formulas" panel at the top of Part 1 for more.
          </p>
        )}
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>The question.</strong> In Part 1, we made a new particle by smashing particles together, and the energy of motion of the
          collision became the mass of the new particle. Now we run the idea backward. Can a particle turn into lighter particles on its
          own, with nothing hitting it? If it can, what happens to the mass that goes missing, and what must the lighter particles be like?
        </p>

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
            <strong>Some new words.</strong> Here is each one in plain language.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            <li>
              <strong>Decay:</strong> a particle turning into lighter particles on its own, with nothing hitting it. This experiment shows
              what the lighter particles must be like, so we give no everyday example here that would give that away.
            </li>
            <li>
              <strong>Parent:</strong> the particle before it decays. <strong>Pieces:</strong> what it turns into. Here a parent always
              turns into two equal pieces. A piece can also be a pulse of light, which has no mass.
            </li>
            <li>
              <strong>Mass given up:</strong> the parent's mass minus the sum of the pieces' rest masses. (A piece's rest mass is its mass
              when it sits still, as in Part 1. A pulse of light counts as zero.)
            </li>
          </ul>
        </div>

        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>The units.</strong> In this part, the parent's rest energy is 1, and each piece's mass, <em>r</em>, is a fraction of the
          parent's mass. For example, r = 0.25 means each piece has a quarter of the parent's mass. The case r = 0 means two pulses of
          light.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>The formula we need: the pieces' energy and momentum.</strong> The parent is at rest, so the total momentum is zero. The
          two equal pieces move apart in opposite directions with equal energies, so each has half the parent's energy, E = ½. A piece's
          momentum × c then follows from the combination in Experiment 5: for one piece, E² − (pc)² is its mass squared, r², so pc = √(¼ −
          r²). For example, take r = 0.3, which is not one of the choices. Each piece has E = ½ and pc = √(0.25 − 0.09) = 0.4, so its speed
          is pc ÷ E = 0.4 ÷ 0.5 = 0.8c. <em>What it does not mean:</em> it does not say that a decay will happen, only what the pieces would
          be like if it did.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>What happens.</strong> A parent particle sits at rest in the lab, and then it decays into two equal pieces. You choose how
          heavy each piece is, and which way and how fast a passing observer moves. When you press Run, the picture plays in stages:
        </p>
        <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The lab's view.</strong> The parent sits still. Then it splits, and the two pieces move apart along the line, one to the
            right and one to the left. If you chose r = 0, the pieces are pulses of light, drawn as arrows instead of circles. Each piece is
            labelled with its energy, its momentum × c and its rest mass.
          </li>
          <li>
            <strong>The mass ledger.</strong> Bars then compare the masses. One bar is the parent's mass, and another is the sum of the
            pieces' rest masses. Two more bars show the system's mass of the pieces, as it was before the split and after it. The mass given
            up is written under them.
          </li>
          <li>
            <strong>The passing observer's view.</strong> The same decay is then shown as the passing observer measures it. For them, the
            lab and the parent are moving, so the energies and momenta they find are different from the lab's.
          </li>
          <li>
            <strong>The results.</strong> A table lists the total energy and total momentum × c before and after the decay, for each
            observer. After that come a few questions for you to think about.
          </li>
        </ol>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          Two things to keep in mind. A decay is shown only if energy and momentum allow it, and if they do not, the picture says so
          instead. And the experiment shows only what the pieces would be like. It does not show how long the parent waits before it decays,
          or whether it will decay at all.
        </p>
        <p style={{ marginTop: 0, marginBottom: '0.75rem' }}>
          <strong>Your job.</strong> Choose the pieces' mass and the passing observer's speed. Then predict how the sum of the pieces'
          masses compares with the parent's mass, and press Run. You are not graded. The Run button stays off until you choose a prediction,
          and it resets if you change the pieces' mass.
        </p>
        <p style={{ margin: 0 }}>
          <strong>What we assume.</strong> Everything moves along one line. The parent decays into exactly two equal pieces. Only energy and
          momentum are tracked, and whether and when a decay happens is not modeled.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The pieces' mass, r</label>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
          The mass of each piece, as a fraction of the parent's mass. Zero means pieces of light, which have no mass.
        </p>
        <div style={{ marginBottom: '1rem' }}>
          {MASS_PRESETS.map((choice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => {
                setPieceMass(choice.value)
                setPrediction(null)
                returnToIdle()
              }}
              className={`toggle-button${pieceMass === choice.value ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {choice.label}
            </button>
          ))}
        </div>

        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>The passing observer's speed</label>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.5rem' }}>
          The passing observer moves along the same line. A plus sign means they move to the right, and a minus sign to the left.
        </p>
        <div>
          {PASSING_SPEED_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setPassingSpeed(value)
                returnToIdle()
              }}
              className={`toggle-button${passingSpeed === value ? ' is-selected' : ''}`}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {passingLabel(value)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Make a prediction</label>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '0.75rem' }}>
          A particle at rest splits into two equal pieces. Each piece has{' '}
          {pieceMass === 0 ? 'no mass: it is a pulse of light' : `${pieceMass} times the parent's mass`}. Compare the total of the pieces'
          rest masses with the parent's mass. How do they compare?
        </p>
        <div>
          {PREDICTION_CHOICES.map((choice) => (
            <button
              key={choice.value}
              type="button"
              onClick={() => {
                setPrediction(choice.value)
                returnToIdle()
              }}
              className={`toggle-button${prediction === choice.value ? ' is-selected' : ''}`}
              style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
          {prediction !== null
            ? `Your prediction: ${PREDICTION_CHOICES.find((c) => c.value === prediction)?.label.slice(0, 3)}. This is not graded.`
            : 'Choose an option to continue'}
        </p>
      </div>

      <button
        type="button"
        className="action-button"
        onClick={() => {
          setProgress(0)
          setStatus('running')
        }}
        disabled={prediction === null || status === 'running'}
        style={{ padding: '0.6rem 1.5rem', marginBottom: '1.5rem' }}
      >
        {status === 'running' ? 'Running...' : status === 'complete' ? 'Run again' : 'Run'}
      </button>
      {prediction === null && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-1rem', marginBottom: '1.5rem' }}>
          Choose a prediction above to run the experiment.
        </p>
      )}

      <DecayDiagram passingSpeed={passingSpeed} pieceMass={pieceMass} progress={status === 'idle' ? null : progress} />

      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
        <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          <strong>How to read this diagram.</strong> The diagram shows one decay twice: first as the lab measures it (Picture 1), and then
          as a passing observer measures it (Picture 2). Your choices are r = {pieceMass === 0 ? '0 (pieces of light)' : pieceMass} for the
          pieces' mass and {passingLabel(passingSpeed)} for the passing observer. Both pictures are on the same scale, so you can compare
          them directly.
        </p>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>The pictures</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>Picture 1, the lab (sky blue).</strong> The lab is at rest, and so is the parent. This picture is there from the start.
          </li>
          <li>
            <strong>Picture 2, the passing observer (purple).</strong> This is the same decay, measured by someone moving along the same
            line. It appears during the run, after Picture 1 has played. For them, the lab and the parent are moving, so the parent has an
            arrow, and the pieces have different energies and momenta from the lab's.
          </li>
        </ul>
        <p style={{ margin: '0 0 0.25rem' }}>
          <strong>What is drawn in each picture</strong>
        </p>
        <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
          <li>
            <strong>The dashed horizontal line</strong> is the one line along which everything in this experiment moves.
          </li>
          <li>
            <strong>The large circle</strong> is the parent. In Picture 1 it has no arrow because it is at rest. Its numbers are mass,
            energy and momentum × c. The parent's mass is 1 because the parent's rest energy is our unit.
          </li>
          <li>
            <strong>The yellow ring</strong> flashes at the moment of the decay, when the parent splits.
          </li>
          <li>
            <strong>The two smaller circles</strong> are the pieces. A circle's size is a rough picture of its rest mass: a heavier piece is
            drawn larger. An arrow shows which way a piece moves, and a longer arrow means a faster piece. Under each piece are its speed,
            energy, momentum × c and rest mass. A minus sign on the momentum means it moves to the left.
          </li>
          <li>
            <strong>A yellow arrow with no circle</strong> is a pulse of light. It appears when r = 0. A pulse of light has no mass, so it
            has no circle, and it always moves at the speed of light.
          </li>
          <li>
            <strong>The labels "went right in the lab" and "went left in the lab"</strong> let you follow the same piece from Picture 1 to
            Picture 2, even if the passing observer sees both pieces moving the same way.
          </li>
          <li>
            <strong>The hollow purple circle</strong> is the passing observer. It is hollow because it is not a particle in the experiment,
            only someone who watches and measures. Its arrow shows which way they move, and a longer arrow means a faster observer.
          </li>
        </ul>
        <p style={{ margin: '0 0 0.5rem' }}>
          <strong>A worked moment (r = 0.3, not one of the buttons).</strong> Each piece has energy 0.5 and momentum × c of 0.4, so it moves
          at 0.4 ÷ 0.5 = 0.8c. The two pieces together have rest masses of 0.3 + 0.3 = 0.6.
        </p>
        <p style={{ margin: '0 0 0.25rem' }}>
          <em>What to look for:</em>
        </p>
        <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.25rem' }}>
          <li>What happens to the parent when the yellow ring flashes.</li>
          <li>How the two pieces' energies and momenta compare with each other in Picture 1.</li>
          <li>How the numbers in Picture 2 differ from the numbers in Picture 1.</li>
        </ul>
        <p style={{ margin: 0 }}>
          Not shown: how long the parent waits before it decays, or whether it will decay at all. Only energy and momentum are tracked.
        </p>
      </div>

      {progress > OBSERVER_END && (
        <div style={{ marginTop: '1.5rem' }}>
          <DecayLedger pieceMass={pieceMass} passingSpeed={passingSpeed} fill={clamp01((progress - OBSERVER_END) / (1 - OBSERVER_END))} />
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
              <strong>How to read the mass ledger.</strong> A ledger is a list that keeps track of amounts. This one keeps track of mass.
              Each bar is one amount, and a longer bar is a larger mass. All the masses are in the parent's rest energies, so the parent's
              mass is 1. The bars fill in from the left at the end of the run.
            </p>
            <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
              <li>
                <strong>The parent's mass</strong> (sky blue) is the mass of the particle before it decays.
              </li>
              <li>
                <strong>The sum of the pieces' rest masses</strong> (grey) is the rest mass of one piece plus the rest mass of the other. A
                pulse of light counts as zero.
              </li>
              <li>
                <strong>The system's mass of the pieces</strong> is worked out from the pieces' total energy and total momentum, the same
                way as in Part 1. It is shown once as the lab finds it (sky blue) and once as the passing observer finds it (purple). These
                two bars are left out if no decay can happen, because then there are no pieces.
              </li>
              <li>
                <strong>The line of words under the bars</strong> gives the mass given up: the parent's mass minus the sum of the pieces'
                rest masses. If no decay can happen, it says so instead.
              </li>
            </ul>
            <p style={{ margin: '0 0 0.25rem' }}>
              <em>What to look for:</em>
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>How the grey bar compares with the parent's bar.</li>
              <li>How the system's mass of the pieces compares with the parent's mass, and whether the two observers agree.</li>
            </ul>
          </div>
        </div>
      )}

      {status === 'complete' && prediction !== null && (
        <DecayResults pieceMass={pieceMass} passingSpeed={passingSpeed} prediction={prediction} />
      )}
    </div>
  )
}
