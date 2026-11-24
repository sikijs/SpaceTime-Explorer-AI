import { everydayFrequencyFactorOf, frequencyFactorFromTravelerAngle, frequencyFactorOf, runDoppler, travelerCrossingAngle } from '../physics/dopplerShift'
import { AHEAD_COLOR, FOLLOW_COLOR, HALO, LAB_COLOR, MUTED_COLOR, SVG_STYLE, TEXT_COLOR, TRAVELER_COLOR } from './DopplerShiftPictures'

// Spacetime Geometry 8: the tutor's three drawings, shown only in the tutor's explanation (so they cannot give the direction of a shift before the learner has predicted and observed,
// CLAUDE.md §12). Wording in docs/audit/spacetime-geometry/08-draft-wording.md, section 6 (approved by the owner on 2026-11-23, §28.1). Every number comes from the physics module.

const T = { fill: TEXT_COLOR, style: HALO } as const

// T1: the siren. The ambulance's speed is drawn as half the speed of sound: a drawing choice, not a measured value.
export function SirenDrawing() {
  const cx = 325
  return (
    <svg
      viewBox="0 0 650 330"
      style={SVG_STYLE}
      role="img"
      aria-label="Drawing T1, the siren. An ambulance moves to the right, giving out rings of sound. The rings are bunched close together in front of it and spread far apart behind it. A listener in front hears a higher pitch because the crests arrive more often. A listener behind hears a lower pitch because they arrive less often. A person in the ambulance hears the siren unchanged."
    >
      <text x="14" y="24" fontSize="18" fontWeight="bold" {...T}>
        Drawing T1: a siren on a moving ambulance
      </text>
      {[1, 2, 3, 4].map((k) => (
        <circle key={k} cx={cx - 18 * k} cy="170" r={36 * k} fill="none" stroke={LAB_COLOR} strokeWidth="2" strokeOpacity={1 - 0.14 * k} />
      ))}
      <rect x={cx - 28} y="156" width="56" height="28" rx="5" fill={TEXT_COLOR} />
      <polygon points={`${cx + 28},160 ${cx + 44},170 ${cx + 28},182`} fill={TEXT_COLOR} />
      <text x={cx} y="208" fontSize="14" textAnchor="middle" {...T}>
        ambulance
      </text>
      <text x={cx} y="136" fontSize="14" textAnchor="middle" {...T}>
        person inside hears the siren unchanged
      </text>
      <circle cx="560" cy="170" r="9" fill="none" stroke={AHEAD_COLOR} strokeWidth="3" />
      <text x="560" y="144" fontSize="14" textAnchor="middle" {...T}>
        listener in front
      </text>
      <text x="560" y="198" fontSize="14" textAnchor="middle" {...T}>
        higher pitch: crests
      </text>
      <text x="560" y="214" fontSize="14" textAnchor="middle" {...T}>
        arrive more often
      </text>
      <circle cx="90" cy="170" r="9" fill="none" stroke={TRAVELER_COLOR} strokeWidth="3" />
      <text x="90" y="144" fontSize="14" textAnchor="middle" {...T}>
        listener behind
      </text>
      <text x="90" y="198" fontSize="14" textAnchor="middle" {...T}>
        lower pitch: crests
      </text>
      <text x="90" y="214" fontSize="14" textAnchor="middle" {...T}>
        arrive less often
      </text>
      <text x="14" y="296" fontSize="13" fill={MUTED_COLOR} style={HALO}>
        Each ring is a crest sent out earlier.
      </text>
      <text x="14" y="314" fontSize="13" fill={MUTED_COLOR} style={HALO}>
        The ambulance is drawn at half the speed of sound, a drawing choice.
      </text>
    </svg>
  )
}

// T2: the three stars' factors, built from the everyday factor (grey) plus the extra from dividing by D (green).
export function ClockBarsDrawing({ speed }: { speed: number }) {
  const doppler = runDoppler(speed)
  const D = doppler.timeDilationFactor
  const rows = [
    { name: 'star straight ahead', labAngle: 0, color: AHEAD_COLOR },
    { name: 'the star we follow (sideways for the lab)', labAngle: 90, color: FOLLOW_COLOR },
    { name: 'star straight behind', labAngle: 180, color: TRAVELER_COLOR },
  ].map((row) => ({ ...row, everyday: everydayFrequencyFactorOf(row.labAngle, speed), total: frequencyFactorOf(row.labAngle, speed) }))
  const scale = 380 / Math.max(...rows.map((r) => r.total))
  const left = 60
  return (
    <svg
      viewBox="0 0 650 300"
      style={SVG_STYLE}
      role="img"
      aria-label={`Drawing T2, the clock. For each of three stars, a grey bar is the everyday factor and a green piece is the extra from dividing by D, ${D.toFixed(3)}. The finished lengths are ${rows.map((r) => r.total.toFixed(2)).join(', ')}.`}
    >
      <text x="14" y="24" fontSize="18" fontWeight="bold" {...T}>
        Drawing T2: the traveler’s slow clock
      </text>
      {rows.map((row, i) => {
        const y = 60 + i * 74
        return (
          <g key={row.name}>
            <text x={left} y={y - 8} fontSize="14" {...T}>
              {row.name}
            </text>
            <rect x={left} y={y} width={row.everyday * scale} height="26" fill={MUTED_COLOR} />
            <rect x={left + row.everyday * scale} y={y} width={(row.total - row.everyday) * scale} height="26" fill="#22c55e" />
            <text x={left + row.everyday * scale / 2} y={y + 19} fontSize="14" textAnchor="middle" fill="#0b1020" fontWeight="bold">
              {row.everyday.toFixed(2)}
            </text>
            <text x={left + row.total * scale + 8} y={y + 19} fontSize="15" fontWeight="bold" fill={row.color} style={HALO}>
              {row.total.toFixed(2)}
            </text>
          </g>
        )
      })}
      <rect x="60" y="272" width="14" height="14" fill={MUTED_COLOR} />
      <text x="80" y="284" fontSize="13" {...T}>
        everyday factor (same clock rate)
      </text>
      <rect x="340" y="272" width="14" height="14" fill="#22c55e" />
      <text x="360" y="284" fontSize="13" {...T}>
        extra: ÷ {D.toFixed(3)} (× {(1 / D).toFixed(2)})
      </text>
    </svg>
  )
}

// T3: the traveler's sky with three rays, to show that blue turns to red ahead of sideways.
export function CrossingDrawing({ speed }: { speed: number }) {
  const cx = 325
  const cy = 250
  const r = 180
  const at = (deg: number, radius: number) => ({ x: cx + radius * Math.cos((deg * Math.PI) / 180), y: cy - radius * Math.sin((deg * Math.PI) / 180) })
  const crossing = travelerCrossingAngle(speed) ?? 90
  const followAngle = runDoppler(speed).stars[6].travelerAngle
  const rays = [
    { angle: followAngle, color: FOLLOW_COLOR, short: 'toward blue', label: `solid yellow: the star we follow, at ${followAngle.toFixed(1)}°, factor ${frequencyFactorOf(90, speed).toFixed(2)}, shifted toward blue`, dash: undefined },
    { angle: crossing, color: FOLLOW_COLOR, short: 'factor 1', label: `dashed yellow: ${crossing.toFixed(1)}°, factor 1.00, the same color as the lab`, dash: '7 4' },
    { angle: 90, color: MUTED_COLOR, short: '90°: toward red', label: `dotted grey: exactly 90°, factor ${frequencyFactorFromTravelerAngle(90, speed).toFixed(2)} (that is D), already shifted toward red`, dash: '2 4' },
  ]
  return (
    <svg
      viewBox="0 0 650 350"
      style={SVG_STYLE}
      role="img"
      aria-label={`Drawing T3, where blue turns to red. The upper half of the traveler's sky, with straight ahead to the right. A ray at ${followAngle.toFixed(1)} degrees is the star we follow, shifted toward blue. A dashed ray at ${crossing.toFixed(1)} degrees has factor 1, the same color as the lab. The ray at 90 degrees is already shifted toward red.`}
    >
      <text x="14" y="24" fontSize="18" fontWeight="bold" {...T}>
        Drawing T3: where blue turns to red
      </text>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={MUTED_COLOR} strokeWidth="1.5" />
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke={MUTED_COLOR} strokeWidth="1.5" />
      <text x={cx + r + 4} y={cy + 18} fontSize="13" textAnchor="end" {...T}>
        straight ahead
      </text>
      <text x={cx - r - 4} y={cy + 18} fontSize="13" textAnchor="start" {...T}>
        straight behind
      </text>
      {rays.map((ray) => {
        const end = at(ray.angle, r)
        return <line key={ray.label} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke={ray.color} strokeWidth="2.5" strokeDasharray={ray.dash} />
      })}
      {rays.map((ray) => {
        const end = at(ray.angle, r + 8)
        const anchor = ray.angle < 85 ? 'start' : ray.angle > 95 ? 'end' : 'middle'
        return (
          <text key={ray.label} x={end.x + (anchor === 'start' ? 4 : anchor === 'end' ? -4 : 0)} y={end.y - 4} fontSize="13" textAnchor={anchor} fill={ray.color} style={HALO}>
            {ray.short}
          </text>
        )
      })}
      {rays.map((ray, i) => (
        <text key={ray.label} x="14" y={290 + i * 18} fontSize="13" fill={ray.color} style={HALO}>
          {ray.label}
        </text>
      ))}
      <text x="14" y="346" fontSize="12" fill={MUTED_COLOR} style={HALO}>
        Upper half of the traveler’s sky. Experiment 7 explains why the two skies differ.
      </text>
    </svg>
  )
}
