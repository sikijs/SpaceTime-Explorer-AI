import { useCallback, useEffect, useRef, useState } from 'react'
import {
  runCurvedSpacetimeExperiment,
  separationAt,
  finalSeparationMeters,
  guessMarkerFor,
  distanceAxisEndMeters,
  workedNumbers,
  SEPARATION_AXIS_TOP_METERS,
  FIXED_DISTANCE_AXIS_METERS,
} from '../physics/curvedSpacetimeExperiment'
import type { CurvedSpacetimeExperimentResult, CurvedSpacetimeScene, PredictionChoice } from '../physics/curvedSpacetimeExperiment'
import { CurvedSpacetimeTutor } from './CurvedSpacetimeTutor'
import { ReferencePanel } from './EnergyMomentumExperiment'
import { MUTED_COLOR, PartHeader, TEXT_COLOR, YOURS_COLOR, svgStyle } from './GravitationalWaveExperiment'
import {
  Block,
  CaptionBox,
  ExternalLink,
  GuessArrow,
  GuessTag,
  Legend,
  LookFor,
  WhereFrom,
  listStyle,
  paragraph,
  smallNote,
} from './TidalEffectExperiment'
import type { Geo } from './TidalEffectExperiment'

// Gravity and Curved Spacetime, Experiment 4, audited to the newer rules (docs/audit/gravity-and-curved-spacetime/04-draft-wording.md,
// approved by the owner on 2026-11-12 "all approved"): the page in four Parts, labelled surfaces and graph, two white ring markers for
// the two guesses, Drawing A on a fixed distance scale, a words box, links, Start over and a tutor that marks both guesses. Every
// number drawn comes from the physics module (src/physics/curvedSpacetimeExperiment.ts; CLAUDE.md §9).

export type { PredictionChoice }

type StrengthPreset = 0.2 | 0.5 | 0.8 | 'other'
type RunStatus = 'idle' | 'running' | 'complete'

const INITIAL_SEPARATION_METERS = 1
const SCENE_WIDTH_PX = 260
const SCENE_HEIGHT_PX = 140
const DOT_SIZE_PX = 14
const VERTICAL_PX_PER_METER = 50
const ANIMATION_DURATION_MS = 2000

const GUESS_COLOR = '#ffffff' // white: the learner's guess, and nothing else (CLAUDE.md §14)
const CURVED_COLOR = '#818cf8' // indigo: the curved surface (solid)
const FLAT_COLOR = '#f59e0b' // amber: the flat surface (dashed)
const YOURS_LIGHT_COLOR = '#f9a8d4' // light pink: the flat surface in Part 2's own strength (dashed)
const REFERENCE_COLOR = '#9ca3af' // grey: Part 1's curved line, for comparison
const LEFT_COLOR = '#0d9488'
const RIGHT_COLOR = '#e11d48'

// Part 1 uses strength 0.5, the preset the page has always opened on; Part 2 lets the learner choose others.
const PART1_RESULT = runCurvedSpacetimeExperiment(INITIAL_SEPARATION_METERS, 0.5)
const run = (strength: number) => runCurvedSpacetimeExperiment(INITIAL_SEPARATION_METERS, strength)

interface CurvedSpacetimeExperimentProps {
  onComplete?: () => void
  onTutorComplete?: () => void
}

export const predictionChoices: Array<{ value: PredictionChoice; label: string }> = [
  { value: 'converge', label: "They'll drift closer together" },
  { value: 'same', label: "They'll stay the same distance apart" },
  { value: 'apart', label: "They'll drift farther apart" },
]

export function labelFor(choice: PredictionChoice): string {
  return predictionChoices.find((c) => c.value === choice)!.label.toLowerCase()
}

const PATH_SAMPLE_COUNT = 30

// A simple sketch of the two travelers' paths. Both scenes call the same separationAt formula (see curvedSpacetimeExperiment.ts).
// The dashed guide curves trace each traveler's full path (side by side on the flat surface; bending together toward a single point,
// "the pole", on the curved surface), so the two surfaces look different, not only different in their numbers. The horizontal
// position is drawn as a fraction of the way to the pole, so the sketch is the same size for every strength (it is not to scale).
export function Scene({
  label,
  result,
  scene,
  distanceMeters,
  noteColor,
}: {
  label: string
  result: CurvedSpacetimeExperimentResult
  scene: CurvedSpacetimeScene
  distanceMeters: number
  noteColor?: string
}) {
  const separation = separationAt(result, distanceMeters, scene)
  const centerY = SCENE_HEIGHT_PX / 2
  const plotWidth = SCENE_WIDTH_PX - DOT_SIZE_PX
  const xFor = (d: number) => (d / result.maxDistanceMeters) * plotWidth + DOT_SIZE_PX / 2
  const yFor = (s: number, side: -1 | 1) => centerY + (side * s * VERTICAL_PX_PER_METER) / 2
  const xPx = xFor(distanceMeters)

  const guidePathFor = (side: -1 | 1) =>
    Array.from({ length: PATH_SAMPLE_COUNT + 1 }, (_, i) => {
      const d = (i / PATH_SAMPLE_COUNT) * result.maxDistanceMeters
      return { x: xFor(d), y: yFor(separationAt(result, d, scene), side) }
    })
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ')

  return (
    <div style={{ flex: '1 1 260px', textAlign: 'center' }}>
      <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
      <div
        className="exp-card"
        style={{
          position: 'relative',
          height: `${SCENE_HEIGHT_PX}px`,
          width: `${SCENE_WIDTH_PX}px`,
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox={`0 0 ${SCENE_WIDTH_PX} ${SCENE_HEIGHT_PX}`}
          role="img"
          aria-label={
            scene === 'flat'
              ? "The two travelers' paths run side by side on the flat surface."
              : 'A sketch of the two travelers’ paths on the curved surface, which is drawn as an outline. The paths run toward a single point, the pole.'
          }
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          {scene === 'sphere' && (
            <>
              <ellipse
                cx={SCENE_WIDTH_PX / 2}
                cy={centerY}
                rx={SCENE_WIDTH_PX / 2 - 2}
                ry={SCENE_HEIGHT_PX / 2 - 6}
                fill="none"
                stroke="#ccc"
                strokeWidth={1}
              />
              <text x={SCENE_WIDTH_PX / 2} y={20} fontSize="9" fill="#888" textAnchor="middle">
                sphere (outline)
              </text>
            </>
          )}
          {/* Each traveler gets one consistent colour, matching the Tidal Effect experiment's two balls. */}
          <path d={guidePathFor(-1)} fill="none" stroke={LEFT_COLOR} strokeWidth={1} strokeDasharray="4 3" />
          <path d={guidePathFor(1)} fill="none" stroke={RIGHT_COLOR} strokeWidth={1} strokeDasharray="4 3" />
          <text x={4} y={SCENE_HEIGHT_PX - 6} fontSize="9" fill="#888">
            start
          </text>
          {scene === 'sphere' && (
            <text x={SCENE_WIDTH_PX - 4} y={centerY - 6} fontSize="9" fill="#888" textAnchor="end">
              the pole
            </text>
          )}
        </svg>
        {([-1, 1] as const).map((side) => (
          <div
            key={side}
            style={{
              position: 'absolute',
              left: `${xPx}px`,
              top: `${yFor(separation, side)}px`,
              transform: 'translate(-50%, -50%)',
              width: `${DOT_SIZE_PX}px`,
              height: `${DOT_SIZE_PX}px`,
              borderRadius: '50%',
              background: side === -1 ? LEFT_COLOR : RIGHT_COLOR,
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
        Separation: <strong>{separation.toFixed(3)} m</strong>
      </p>
      <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>
        <span style={{ color: LEFT_COLOR }}>●</span> left traveler &nbsp; <span style={{ color: RIGHT_COLOR }}>●</span> right traveler
      </p>
      {scene === 'sphere' && (
        <p style={{ fontSize: '0.75rem', margin: '0.15rem 0 0', color: noteColor ?? 'var(--text-muted)' }}>
          The pole is {result.maxDistanceMeters.toFixed(1)} m from the start (radius {result.radiusMeters.toFixed(1)} m).
        </p>
      )}
    </div>
  )
}

function useRun(onFinish?: (result: CurvedSpacetimeExperimentResult) => void) {
  const [status, setStatus] = useState<RunStatus>('idle')
  const [distance, setDistance] = useState(0)
  const [result, setResult] = useState<CurvedSpacetimeExperimentResult | null>(null)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish

  useEffect(() => {
    if (status !== 'running' || !result) return
    const startTime = performance.now()
    let frameId = 0
    const animate = (now: number) => {
      // Clamped on both sides: a first animation frame can report a time slightly before startTime.
      const progress = Math.min(Math.max((now - startTime) / ANIMATION_DURATION_MS, 0), 1)
      setDistance(progress * result.maxDistanceMeters)
      if (progress >= 1) {
        setStatus('complete')
        finishRef.current?.(result)
        return
      }
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [status, result])

  const start = useCallback((runResult: CurvedSpacetimeExperimentResult) => {
    setResult(runResult)
    setDistance(0)
    setStatus('running')
  }, [])
  const reset = useCallback(() => {
    setStatus('idle')
    setDistance(0)
    setResult(null)
  }, [])
  return { status, distance, result, start, reset }
}

// Pages fetched on 12 November 2026 (see the audit's draft wording, section 2). The two linked from the start are neutral: neither says
// anything about paths that start side by side coming together, or about curved spacetime. The ESA page names geodesics and curved
// spacetime, which the tutor names first, so it appears only after the tutor's explanation (§12).
const START_LINKS = [
  {
    href: 'https://science.nasa.gov/earth/facts/',
    label: 'NASA: "Facts About Earth"',
    what: 'a plain fact sheet on our planet, including its size: an equatorial diameter of 12,756 kilometres, which is a radius of about 6,378 kilometres at the equator. (NASA Science; page last updated 5 December 2025.)',
  },
  {
    href: 'https://www.usgs.gov/media/images/great-circlegif',
    label: 'USGS: "Great Circle"',
    what: 'a diagram of a globe with one line drawn around it, and a single sentence: the shortest path between two points on the surface of a sphere lies along a great circle. (U.S. Geological Survey, Earthquake Hazards Program; image page dated about 2021.)',
  },
]

const AFTER_LINKS = [
  {
    href: 'https://www.esa.int/ESA_Multimedia/Images/2015/09/Measuring_spacetime_curvature',
    label: 'ESA: "Measuring spacetime curvature"',
    what: 'an illustrated caption showing two objects falling freely along geodesics, which it calls the equivalent of straight lines in curved geometry, and how ESA’s LISA Pathfinder thinking measures the curvature between them. It is more advanced than this page, so read the first paragraph. (European Space Agency image page, credit ESA/ATG medialab, 7 September 2015.)',
  },
]

// The "Words and formulas" box. Its numbers come from the physics module (CLAUDE.md §9). The separation formula is not in it: it would
// show the answer to the prediction (§12), so it appears in the Part 1 caption after the run.
function referenceEntries(): { term: string; meaning: string }[] {
  const w = workedNumbers()
  return [
    {
      term: 'Traveler',
      meaning: 'a person walking in the picture. The left traveler is drawn in teal and the right traveler in red, so you can follow each one.',
    },
    { term: 'Flat surface', meaning: 'a surface like a floor or a table top, with no bend in it.' },
    {
      term: 'Curved surface / sphere',
      meaning: 'a surface that bends around, like the outside of a ball or the Earth. Here it is a sphere.',
    },
    {
      term: 'Radius',
      meaning: `the distance from the middle of a sphere to its surface. A smaller radius means a more sharply curved sphere. Here, radius = 10 metres ÷ curvature strength. The 10 metres is only a size picked so that you can watch a sphere this small, not a real value.`,
    },
    {
      term: 'Curvature strength',
      meaning:
        'a plain number between 0 and 1 (no unit) that says how sharply curved the sphere is. A bigger number means a smaller, more sharply curved sphere. Real planets are far bigger than any sphere here, so the values are exaggerated.',
    },
    {
      term: 'The pole',
      meaning:
        'the point on the sphere that the travelers are walking toward, a quarter of the way around the sphere from where they started. On the Earth, the North Pole is a pole.',
    },
    { term: 'Separation', meaning: 'the distance between the two travelers, in metres. It starts at 1 m.' },
    {
      term: 'Geodesic',
      meaning:
        'the path you get when you walk as straight as you possibly can on a surface, never turning. On a flat floor it is a straight line. On a sphere it is a path that bends around with the sphere.',
    },
    {
      term: 'Graph (line)',
      meaning: 'a picture of how one number changes as another does. Here each line shows the separation at each distance walked.',
    },
    {
      term: 'Analogy',
      meaning:
        'using something familiar (a sphere) to help understand something harder (spacetime). It is a help for thinking, not a claim that the two are the same thing.',
    },
    { term: 'Curved spacetime', meaning: 'the name for what the tutor explains after your run.' },
    {
      term: 'Formulas (the ones this page uses before the run)',
      meaning: `radius = 10 ÷ curvature strength, for example 10 ÷ 0.5 = ${w.radiusAt0p5} m; distance to the pole = radius × π ÷ 2, for example ${w.radiusAt0p5} × 1.5708 = ${w.poleDistanceAt0p5.toFixed(1)} m. Worked example from this page: strength 0.8 gives a radius of 10 ÷ 0.8 = ${w.radiusAt0p8} m, and the pole is ${w.radiusAt0p8} × 1.5708 = ${w.poleDistanceAt0p8.toFixed(1)} m away.`,
    },
  ]
}

// ---- the graphs ----
// Part 1's graph has a wide right margin for the two YOUR GUESS boxes, which sit beside the line ends and never cover a line.
const G1: Geo = { width: 840, height: 340, left: 64, right: 330, top: 40, bottom: 54 }
// Drawing A has three rows of legend above the plot and room at the right for the line-end labels.
const GA: Geo = { width: 760, height: 360, left: 64, right: 170, top: 88, bottom: 54 }
const SAMPLE_COUNT = 30

function Axes({ g, distanceEnd, distanceTicks }: { g: Geo; distanceEnd: number; distanceTicks: number[] }) {
  const plotW = g.width - g.left - g.right
  const plotH = g.height - g.top - g.bottom
  const xFor = (d: number) => g.left + (d / distanceEnd) * plotW
  const yFor = (sep: number) => g.top + (1 - sep / SEPARATION_AXIS_TOP_METERS) * plotH
  return (
    <>
      <line x1={g.left} y1={g.top} x2={g.left} y2={g.height - g.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={g.left} y1={g.height - g.bottom} x2={g.width - g.right} y2={g.height - g.bottom} stroke={MUTED_COLOR} strokeWidth={1.5} />
      <line x1={g.left} y1={yFor(1)} x2={g.width - g.right} y2={yFor(1)} stroke={MUTED_COLOR} strokeWidth={0.7} strokeDasharray="3 4" opacity={0.7} />
      {[0, 0.5, 1, SEPARATION_AXIS_TOP_METERS].map((v) => (
        <text key={v} x={g.left - 8} y={yFor(v) + 4} fontSize="12" fill={MUTED_COLOR} textAnchor="end">
          {v === 1 ? '1 m' : `${v} m`}
        </text>
      ))}
      <text x={g.left + 6} y={yFor(1) - 5} fontSize="10" fill={MUTED_COLOR}>
        start: 1 m
      </text>
      {distanceTicks.map((d) => (
        <g key={d}>
          <line x1={xFor(d)} y1={g.height - g.bottom} x2={xFor(d)} y2={g.height - g.bottom + 5} stroke={MUTED_COLOR} />
          <text x={xFor(d)} y={g.height - g.bottom + 24} fontSize="12" fill={MUTED_COLOR} textAnchor="middle">
            {+d.toFixed(1)} m
          </text>
        </g>
      ))}
      <text x={(g.left + g.width - g.right) / 2} y={g.height - 8} fontSize="12" fill={TEXT_COLOR} textAnchor="middle">
        Distance each traveler has walked (m)
      </text>
      <text
        x={14}
        y={(g.top + g.height - g.bottom) / 2}
        fontSize="12"
        fill={TEXT_COLOR}
        textAnchor="middle"
        transform={`rotate(-90 14 ${(g.top + g.height - g.bottom) / 2})`}
      >
        Separation between the travelers (m)
      </text>
    </>
  )
}

// Part 1's graph: both lines come from the same separationAt call. The lines draw themselves in step with the walk. Once both are
// fully drawn, a white ring marks each guess at the end of its line, the same place for any guess (a three-way guess has a direction
// but no size, so the arrow shows the direction only).
export function Part1Graph({
  result,
  revealUpToMeters,
  complete,
  flatGuess,
  sphereGuess,
}: {
  result: CurvedSpacetimeExperimentResult
  revealUpToMeters: number
  complete: boolean
  flatGuess: PredictionChoice | null
  sphereGuess: PredictionChoice | null
}) {
  const g = G1
  const plotW = g.width - g.left - g.right
  const plotH = g.height - g.top - g.bottom
  const D = result.maxDistanceMeters
  const revealed = Math.min(Math.max(revealUpToMeters, 0), D)
  const count = Math.max(1, Math.round(SAMPLE_COUNT * (revealed / D)))
  const xFor = (d: number) => g.left + (d / D) * plotW
  const yFor = (sep: number) => g.top + (1 - sep / SEPARATION_AXIS_TOP_METERS) * plotH
  const pathFor = (scene: CurvedSpacetimeScene) =>
    Array.from({ length: count + 1 }, (_, i) => {
      const d = Math.min((i / count) * revealed, D)
      return `${i === 0 ? 'M' : 'L'} ${xFor(d).toFixed(1)} ${yFor(separationAt(result, d, scene)).toFixed(1)}`
    }).join(' ')

  const endX = xFor(D)
  const marks = (
    [
      ['flat', flatGuess],
      ['sphere', sphereGuess],
    ] as const
  ).flatMap(([scene, guess]) => (guess ? [{ scene, marker: guessMarkerFor(result, scene, guess) }] : []))

  return (
    <svg
      className="narrow-scroll"
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="img"
      aria-label="Graph of the distance between the two travelers over the distance walked, for the curved surface and the flat surface."
      style={{ ...svgStyle, width: '100%', maxWidth: `${g.width}px`, margin: '0 auto' }}
    >
      <Legend
        items={[
          { color: CURVED_COLOR, text: 'Curved surface: solid indigo line', x: g.left },
          { color: FLAT_COLOR, dashed: true, text: 'Flat surface: dashed amber line', x: g.left + 270 },
        ]}
      />
      <Axes g={g} distanceEnd={D} distanceTicks={[0, D]} />
      <path d={pathFor('flat')} fill="none" stroke={FLAT_COLOR} strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
      <path d={pathFor('sphere')} fill="none" stroke={CURVED_COLOR} strokeWidth={3} strokeLinecap="round" />
      {!complete && revealed < D && (
        <>
          <circle cx={xFor(revealed)} cy={yFor(separationAt(result, revealed, 'sphere'))} r={5} fill={CURVED_COLOR} stroke="#0b1020" strokeWidth={1.5} />
          <circle cx={xFor(revealed)} cy={yFor(separationAt(result, revealed, 'flat'))} r={5} fill={FLAT_COLOR} stroke="#0b1020" strokeWidth={1.5} />
        </>
      )}
      {complete && (
        <>
          <text x={endX - 10} y={yFor(finalSeparationMeters(result, 'flat')) - 12} fontSize="12" fontWeight="bold" fill={FLAT_COLOR} textAnchor="end">
            Flat surface: {finalSeparationMeters(result, 'flat').toFixed(3)} m
          </text>
          <text x={endX - 40} y={yFor(finalSeparationMeters(result, 'sphere')) - 8} fontSize="12" fontWeight="bold" fill={CURVED_COLOR} textAnchor="end">
            Curved surface: {finalSeparationMeters(result, 'sphere').toFixed(3)} m
          </text>
        </>
      )}
      {complete &&
        marks.map(({ scene, marker }) => {
          const cy = yFor(marker.separationMeters)
          const [head, tail] = marker.boxText.split(': ')
          const [line1, rest] = head.split(' (')
          const boxX = endX + 50
          const boxW = 270
          const boxH = 52
          return (
            <g key={scene}>
              <circle cx={endX} cy={cy} r={11} fill="none" stroke={GUESS_COLOR} strokeWidth={3} />
              <GuessArrow x={endX + 27} y={cy} arrow={marker.arrow} />
              <line x1={endX + 38} y1={cy} x2={boxX} y2={cy} stroke={GUESS_COLOR} strokeWidth={1.5} strokeDasharray="5 3" />
              <rect x={boxX} y={cy - boxH / 2} width={boxW} height={boxH} fill="#0b1020" stroke={GUESS_COLOR} strokeWidth={2} rx={3} />
              <text x={boxX + 10} y={cy - boxH / 2 + 16} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
                {line1}
              </text>
              <text x={boxX + 10} y={cy - boxH / 2 + 31} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
                ({rest}:
              </text>
              <text x={boxX + 10} y={cy - boxH / 2 + 46} fill={GUESS_COLOR} fontSize="12" fontWeight="bold">
                {tail}
              </text>
            </g>
          )
        })}
    </svg>
  )
}

// Part 2's Drawing A: one distance scale for every strength (distanceAxisEndMeters) and the same vertical scale as Part 1, so a
// different strength gives a visibly different curve. The learner's curved line is pink, the flat line light pink, and Part 1's
// curved line stays in grey for comparison.
export function DrawingA({ result, settingsLabel }: { result: CurvedSpacetimeExperimentResult; settingsLabel: string }) {
  const g = GA
  const distanceEnd = distanceAxisEndMeters(result)
  const ticks: number[] = []
  const step = distanceEnd > 100 ? 40 : 20
  for (let d = 0; d <= distanceEnd; d += step) ticks.push(d)
  const plotW = g.width - g.left - g.right
  const plotH = g.height - g.top - g.bottom
  const xFor = (d: number) => g.left + (d / distanceEnd) * plotW
  const yFor = (sep: number) => g.top + (1 - sep / SEPARATION_AXIS_TOP_METERS) * plotH
  const pathFor = (r: CurvedSpacetimeExperimentResult, scene: CurvedSpacetimeScene) =>
    Array.from({ length: SAMPLE_COUNT + 1 }, (_, i) => {
      const d = Math.min((i / SAMPLE_COUNT) * r.maxDistanceMeters, r.maxDistanceMeters)
      return `${i === 0 ? 'M' : 'L'} ${xFor(d).toFixed(1)} ${yFor(separationAt(r, d, scene)).toFixed(1)}`
    }).join(' ')

  const sphereEnd = finalSeparationMeters(result, 'sphere')
  const flatEnd = finalSeparationMeters(result, 'flat')
  const refEnd = finalSeparationMeters(PART1_RESULT, 'sphere')
  const sameAsRef = Math.abs(result.curvatureStrength - PART1_RESULT.curvatureStrength) < 0.0005
  const flatX = xFor(result.maxDistanceMeters)

  return (
    <svg
      className="narrow-scroll"
      viewBox={`0 0 ${g.width} ${g.height}`}
      role="img"
      aria-label={`Drawing A: the distance between the travelers over the distance walked at your strength, ${settingsLabel}, in pink, and Part 1's curved line in grey, on a fixed distance scale from 0 to ${distanceEnd} metres.`}
      style={{ ...svgStyle, width: '100%', maxWidth: `${g.width}px`, margin: '0 auto' }}
    >
      <Legend
        items={[
          { color: YOURS_COLOR, text: `Curved surface, your strength (${settingsLabel}): solid pink`, x: g.left, row: 0 },
          { color: YOURS_LIGHT_COLOR, dashed: true, text: 'Flat surface, your strength: dashed light pink', x: g.left, row: 1 },
          { color: REFERENCE_COLOR, thin: true, text: 'Curved surface, strength 0.5, from Part 1: thin grey', x: g.left, row: 2 },
        ]}
      />
      <Axes g={g} distanceEnd={distanceEnd} distanceTicks={ticks} />
      {!sameAsRef && <path d={pathFor(PART1_RESULT, 'sphere')} fill="none" stroke={REFERENCE_COLOR} strokeWidth={1.5} strokeLinecap="round" />}
      <path d={pathFor(result, 'flat')} fill="none" stroke={YOURS_LIGHT_COLOR} strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
      <path d={pathFor(result, 'sphere')} fill="none" stroke={YOURS_COLOR} strokeWidth={3} strokeLinecap="round" />
      <circle cx={flatX} cy={yFor(sphereEnd)} r={5} fill={YOURS_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      <circle cx={flatX} cy={yFor(flatEnd)} r={4} fill={YOURS_LIGHT_COLOR} stroke="#0b1020" strokeWidth={1.5} />
      {!sameAsRef && <circle cx={xFor(PART1_RESULT.maxDistanceMeters)} cy={yFor(refEnd)} r={4} fill={REFERENCE_COLOR} />}
      <text x={flatX + 10} y={yFor(flatEnd) + 4} fontSize="12" fontWeight="bold" fill={YOURS_LIGHT_COLOR}>
        Flat: {flatEnd.toFixed(3)} m
      </text>
      <text x={flatX + 8} y={yFor(sphereEnd) - 10} fontSize="12" fontWeight="bold" fill={YOURS_COLOR}>
        {sphereEnd.toFixed(3)} m
      </text>
      {!sameAsRef && (
        <text x={xFor(PART1_RESULT.maxDistanceMeters) + 8} y={yFor(refEnd) - 10} fontSize="11" fill={REFERENCE_COLOR}>
          Part 1: {refEnd.toFixed(3)} m
        </text>
      )}
    </svg>
  )
}

// ---- captions ----
export function Part1Caption() {
  const w = workedNumbers()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read this diagram.</strong>
      </p>
      <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
        <strong>What you see.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>The two surfaces</strong> show the same walk on two kinds of surface. The left traveler is teal and the right traveler is
          red. Each dashed line is the path one traveler walks, and the dots show where they are now. The number under each surface is
          the distance between the travelers right now. They are simple sketches, not to scale.
        </li>
        <li>
          <strong>The flat surface</strong> is like a floor. <strong>The curved surface</strong> is a sphere, drawn as an outline.
          &ldquo;The pole&rdquo; is the point the paths are heading toward, a quarter of the way around the sphere: here,{' '}
          {w.poleDistanceAt0p5.toFixed(1)} metres away.
        </li>
        <li>
          <strong>The graph</strong> draws itself as they walk. Up the side is the separation, from 0 to {SEPARATION_AXIS_TOP_METERS} m (the
          dotted line is the 1 m start). Along the bottom is the distance each traveler has walked, up to the pole.
        </li>
        <li>
          <strong>The solid indigo line</strong> is the curved surface. <strong>The dashed amber line</strong> is the flat surface. If the
          two lines lay on top of each other, you would see the amber dashes along the indigo line.
        </li>
        <li>
          <strong>The two white rings, arrows and YOUR GUESS boxes</strong> are your two guesses, drawn once both lines are drawn. A ring
          is in the same place whatever you guessed. Its arrow shows only the direction you guessed (down: closer together; flat bar: the
          same distance; up: farther apart), and its length means nothing. Both are markers only, and neither moves a line.
        </li>
        <li>
          <strong>The formulas used:</strong> separation = 1 m on the flat surface at every distance, and separation = 1 m × cos(distance ÷
          radius) on the sphere. Here the radius is {w.radiusAt0p5} m, so the travelers reach the pole after {w.radiusAt0p5} × π ÷ 2 ={' '}
          {w.poleDistanceAt0p5.toFixed(1)} m. (&ldquo;cos&rdquo; is a button on a calculator: cos 0 = 1, and it falls to 0 at a quarter
          turn.)
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> On the sphere, after the travelers have walked 10 m, the separation is 1 × cos(10 ÷ {w.radiusAt0p5}) =
        1 × cos 0.5 = {w.separationAfter10mAt0p5.toFixed(3)} m. Halfway to the pole, at {w.halfwayDistanceAt0p5.toFixed(1)} m, it is 1 × cos(
        {w.halfwayDistanceAt0p5.toFixed(1)} ÷ {w.radiusAt0p5}) = 1 × cos 0.785 = {w.halfwaySeparationAt0p5.toFixed(3)} m. At the pole, after{' '}
        {w.poleDistanceAt0p5.toFixed(1)} m, it is 1 × cos(1.571) = {w.endSeparationAt0p5.toFixed(3)} m: the two travelers are at the same
        place. On the flat surface the separation is {w.flatEndSeparation.toFixed(3)} m at all three distances. <em>A daily-life picture:</em>{' '}
        on a globe, two lines of longitude start side by side near the equator, each pointing straight north, and they meet at the North
        Pole.
      </p>
      <LookFor
        items={[
          {
            look: 'the solid indigo line and the dashed amber line.',
            means: 'each shows the distance between the two travelers on one surface at every point of the walk.',
            matters: 'it lets you compare the two surfaces and see whether the distance changes, instead of only reading the number at the end.',
          },
          {
            look: 'the right end of each line.',
            means: `it shows the distance between the travelers at the end of the walk: ${w.endSeparationAt0p5.toFixed(3)} m on the curved surface, where they have met at the pole, and ${w.flatEndSeparation.toFixed(3)} m on the flat surface, against the 1 m start.`,
            matters: 'it gives you a number for each surface to compare with the start.',
          },
          {
            look: 'the two white rings and your two YOUR GUESS boxes.',
            means: 'each marks the place on the graph where the answer to that guess can be read: the end of its line.',
            matters: 'it shows where to look to compare what you expected with what was drawn.',
          },
        ]}
      />
    </CaptionBox>
  )
}

export function DrawingACaption() {
  const w = workedNumbers()
  return (
    <CaptionBox>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>How to read Drawing A.</strong>
      </p>
      <ul style={listStyle}>
        <li>
          <strong>The graph</strong> works as in Part 1, but the bottom scale is fixed at {FIXED_DISTANCE_AXIS_METERS} metres, so you can
          compare strengths. In Part 1 it stretched to fit the walk. (For a very small &ldquo;Other&rdquo; strength the pole is farther
          away, and the scale grows in steps of 20 m to fit it.)
        </li>
        <li>
          <strong>Pink</strong> marks your own strength: the solid pink line is the curved surface and the light pink dashed line is the
          flat surface. <strong>The grey line</strong> is Part 1&rsquo;s curved line, for comparison.
        </li>
        <li>
          <strong>&ldquo;Runs so far&rdquo;</strong> lists every run in this Part.
        </li>
      </ul>
      <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
        <strong>A worked moment.</strong> After the travelers have walked 10 m, the separation is 1 × cos(10 ÷ {w.radiusAt0p2}) ={' '}
        {w.separationAfter10mAt0p2.toFixed(3)} m at strength 0.2 (radius {w.radiusAt0p2} m), 1 × cos(10 ÷ {w.radiusAt0p5}) ={' '}
        {w.separationAfter10mAt0p5.toFixed(3)} m at strength 0.5, and 1 × cos(10 ÷ {w.radiusAt0p8}) = {w.separationAfter10mAt0p8.toFixed(3)} m at
        strength 0.8. At strength 0.8 the travelers reach the pole after {w.poleDistanceAt0p8.toFixed(1)} m, much sooner than the{' '}
        {w.poleDistanceAt0p5.toFixed(1)} m at 0.5, so the pink line reaches 0 m earlier.
      </p>
      <LookFor
        items={[
          {
            look: 'where the pink curved line reaches 0 m compared with the grey one.',
            means: `a bigger strength brings the line down sooner: the pole is ${w.poleDistanceAt0p2.toFixed(1)} m away at strength 0.2, ${w.poleDistanceAt0p5.toFixed(1)} m at 0.5 and ${w.poleDistanceAt0p8.toFixed(1)} m at 0.8.`,
            matters: 'it shows that the more sharply curved the sphere, the sooner two straight paths that start side by side come together, and that the light pink flat line stays at 1 m whatever you choose.',
          },
        ]}
      />
    </CaptionBox>
  )
}

const STRENGTH_PRESETS = [0.2, 0.5, 0.8] as const

function PredictionQuestion({
  label,
  prompt,
  selected,
  disabled,
  onSelect,
}: {
  label: string
  prompt: string
  selected: PredictionChoice | null
  disabled: boolean
  onSelect: (choice: PredictionChoice) => void
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{label}</label>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{prompt}</p>
      <div style={{ marginBottom: '0.5rem' }}>
        {predictionChoices.map((choice) => (
          <button
            key={choice.value}
            onClick={() => onSelect(choice.value)}
            disabled={disabled}
            className={`toggle-button${selected === choice.value ? ' is-selected' : ''}`}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        {selected ? `Your prediction: ${labelFor(selected)}` : 'Choose an option to continue'}
      </p>
    </div>
  )
}

export function CurvedSpacetimeExperiment({ onComplete, onTutorComplete }: CurvedSpacetimeExperimentProps) {
  const [strengthPreset, setStrengthPreset] = useState<StrengthPreset>(0.8)
  const [customStrength, setCustomStrength] = useState('')
  const [flatPrediction, setFlatPrediction] = useState<PredictionChoice | null>(null)
  const [spherePrediction, setSpherePrediction] = useState<PredictionChoice | null>(null)
  const [submittedFlat, setSubmittedFlat] = useState<PredictionChoice | null>(null)
  const [submittedSphere, setSubmittedSphere] = useState<PredictionChoice | null>(null)
  const [part2Runs, setPart2Runs] = useState<CurvedSpacetimeExperimentResult[]>([])
  const [explained, setExplained] = useState(false)

  // The completion mark is saved when Part 1's run ends. Part 2 does not call it.
  const part1 = useRun(() => onComplete?.())
  const part2 = useRun((r) => setPart2Runs((runs) => [...runs, r]))

  const locked = submittedFlat !== null && submittedSphere !== null
  const part1Running = part1.status === 'running'
  const part2Running = part2.status === 'running'
  const part1Done = part1.status === 'complete'

  const selectedStrength = strengthPreset === 'other' ? parseFloat(customStrength) || 0 : strengthPreset
  const isValidStrength = selectedStrength >= 0.01 && selectedStrength <= 0.99
  const hasBothPredictions = flatPrediction !== null && spherePrediction !== null

  const hasAnythingToClear = flatPrediction !== null || spherePrediction !== null || locked || part1.status !== 'idle' || part2Runs.length > 0
  const startOverDisabled = !hasAnythingToClear || part1Running || part2Running

  const handleRun = () => {
    if (!hasBothPredictions || locked) return
    setSubmittedFlat(flatPrediction)
    setSubmittedSphere(spherePrediction)
    setFlatPrediction(null)
    setSpherePrediction(null)
    part1.start(PART1_RESULT)
  }

  const handlePart2 = () => {
    if (!isValidStrength || part1Running || part2Running) return
    part2.start(run(selectedStrength))
  }

  // Start over: clears both guesses, the runs, the results and the tutor, and returns the page to its first state.
  const handleStartOver = () => {
    part1.reset()
    part2.reset()
    setFlatPrediction(null)
    setSpherePrediction(null)
    setSubmittedFlat(null)
    setSubmittedSphere(null)
    setStrengthPreset(0.8)
    setCustomStrength('')
    setPart2Runs([])
    setExplained(false)
  }

  const lastPart2 = part2Runs.length > 0 ? part2Runs[part2Runs.length - 1] : null
  const shownFlatGuess = submittedFlat ?? flatPrediction
  const shownSphereGuess = submittedSphere ?? spherePrediction
  const previewResult = part2.result ?? (isValidStrength ? run(selectedStrength) : PART1_RESULT)
  const part2Distance = part2.result ? part2.distance : 0
  const guessesLocked = locked
  const w = workedNumbers()

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Experiment 4 — Curved Spacetime</h2>

      <div className="exp-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={paragraph}>
            <strong>The question.</strong> In Experiment 3 (tidal effects), two balls fell side by side. This time we step back from gravity
            and ask a question about surfaces. Two travelers set off side by side and each walks straight ahead. Does the distance between
            them change?
          </p>
          <p style={paragraph}>
            <strong>Why even ask this.</strong> Experiment 3 showed that two falling balls behave differently on a planet and in a rocket,
            but not why. Before we come back to gravity, we look at the idea underneath: what it means to move in a straight line, and
            whether the shape of the surface the travelers walk on makes any difference.
          </p>
          <p style={paragraph}>
            <strong>How this page is laid out.</strong> Below this introduction the page is in four sections, called Parts, each with a
            coloured heading. In Part 1 you make guesses and watch the experiment. In Part 2 you try it with a strength of your own. Part 3
            shows the results, and Part 4 is the tutor, who talks it over with you.
          </p>
          <p style={paragraph}>
            <strong>What happens.</strong> Picture two travelers, a left traveler and a right traveler, standing side by side 1 metre
            apart, both facing the same direction. Each one walks straight ahead, never turning and always at the same walking speed, and
            we watch how far apart they are as they go. We run this twice: once on a flat surface, and once on a curved surface, a sphere,
            like the Earth. A graph draws the distance between the travelers as they walk. In Part 1 the curved surface has a curvature
            strength of 0.5, which is explained below. In Part 2 you choose your own strength and send them walking again.
          </p>
          <p style={{ ...paragraph, marginBottom: '0.25rem' }}>
            <strong>What &ldquo;curvature strength&rdquo; means.</strong> Curvature strength says how sharply curved the sphere is. Think
            of a basketball and the Earth. Both are spheres, but the basketball bends away quickly, while the Earth is so big that the
            ground looks flat to you. A small sphere is sharply curved, and a big sphere is only gently curved. So a bigger strength number
            means a smaller, more sharply curved sphere. Here is the size of the sphere for each strength (its radius is the distance from
            its middle to its surface):
          </p>
          <ul style={{ marginTop: 0, marginBottom: '0.75rem', paddingLeft: '1.25rem' }}>
            <li>
              Strength 0.2: a gently curved sphere, {w.radiusAt0p2} metres in radius.
            </li>
            <li>
              Strength 0.5 (the one in Part 1): {w.radiusAt0p5} metres in radius.
            </li>
            <li>
              Strength 0.8: a sharply curved sphere, {w.radiusAt0p8} metres in radius.
            </li>
          </ul>
          <p style={paragraph}>
            A real planet is far bigger than any of these. The Earth&rsquo;s radius is about {w.earthRadiusMeters.toLocaleString('en-US')}{' '}
            metres, more than 300,000 times bigger than the {w.radiusAt0p5} metres of Part 1&rsquo;s sphere, which is why the ground looks
            flat to you. On this page&rsquo;s scale the Earth would have a curvature strength of about{' '}
            {w.earthStrengthOnThisScale.toFixed(7)}, far below the smallest value you can choose ({w.smallestChoosableStrength}). Here the sphere is made small enough for the effect to be easy to watch, and the exact sizes are chosen only for that
            reason. Curvature strength has no unit. It is a plain number between 0 and 1.
          </p>
          <p style={paragraph}>
            <strong>Your job.</strong> Before you press the button, guess what the two travelers will do on each surface. Then watch both
            surfaces and compare whether the distance between the travelers changes on each one, try other strengths in Part 2, and talk it
            over with the tutor.
          </p>
          <p style={paragraph}>
            <strong>Your guesses and the real pictures.</strong> Your guesses never change the real pictures, the surfaces or the numbers:
            they come from a calculation that knows nothing about what you guessed. Your two guesses are drawn on the graph in white, each
            in a box labelled YOUR GUESS, and they are shown again beside the results. In Part 2 the strength you choose does change the
            surface drawings and the graph, and the lines it moves are pink.
          </p>
          <p style={paragraph}>
            <strong>Some new words.</strong> The &ldquo;Words and formulas&rdquo; box below has each one with a short plain meaning:
            traveler, flat surface, curved surface, sphere, radius, the pole, separation, geodesic, graph, curvature strength, analogy,
            curved spacetime.
          </p>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>What we assume.</strong>
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            <li>
              Both travelers walk &ldquo;as straight as possible&rdquo; for their surface &mdash; a path called a <strong>geodesic</strong>.
            </li>
            <li>
              Curvature strength is an exaggerated stand-in for how sharply curved the sphere is, so the effect is easy to watch instead of
              needing a huge sphere.
            </li>
            <li>
              The sphere is an analogy for curved spacetime, not a literal picture of it &mdash; real spacetime curvature involves time as
              well as space, which this experiment doesn&rsquo;t model.
            </li>
            <li>
              This experiment doesn&rsquo;t use anything about light, moving clocks, or speeds close to light from earlier chapters
              &mdash; it&rsquo;s ordinary surface geometry.
            </li>
            <li>Both travelers start side by side, 1 metre apart, and walk at the same steady speed.</li>
          </ul>
        </div>

        <ReferencePanel entries={referenceEntries()} />

        <div style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
            <strong>Want to know more?</strong> Two plain-language pages from official sources are listed here. Checked on 12 November 2026.
            Each link opens in a new tab. Another page, about geodesics and curved spacetime, is held back because it names the idea you are
            about to work out. It appears below the tutor&rsquo;s explanation. This page uses no measured result, so there is no research
            paper to cite for it.
          </p>
          <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
            {START_LINKS.map((link) => (
              <li key={link.href}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
              </li>
            ))}
          </ul>
        </div>

        {/* ===== Part 1 ===== */}
        <PartHeader color="#d97706" title="Part 1: Predict, then watch">
          First you guess what the two travelers will do on each surface: the flat one and the curved one. Then you press &ldquo;Send them
          walking&rdquo; and watch both surfaces, with a curvature strength of 0.5. A graph draws itself as they walk, with your two guesses
          marked on it in white.
        </PartHeader>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Make your predictions</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Two travelers start 1 metre apart and both walk dead straight ahead. Do you think they&rsquo;ll drift closer together, drift
            farther apart, or stay exactly the same distance apart, on each surface? Part 1 uses a curvature strength of 0.5.
          </p>
          <PredictionQuestion
            label="Flat surface"
            prompt="On a flat surface, like a floor, what will the two travelers do?"
            selected={shownFlatGuess}
            disabled={guessesLocked || part1Running}
            onSelect={setFlatPrediction}
          />
          <PredictionQuestion
            label="Curved surface (sphere)"
            prompt={`On a curved surface, a sphere with a radius of ${w.radiusAt0p5} metres, what will the two travelers do?`}
            selected={shownSphereGuess}
            disabled={guessesLocked || part1Running}
            onSelect={setSpherePrediction}
          />
          {guessesLocked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 0 }}>
              Your predictions are locked while you try other strengths. To change them, press Start over.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleRun}
          disabled={part1Running || part2Running || locked || !hasBothPredictions}
          className="action-button"
          style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
        >
          {part1Running ? 'Walking...' : 'Send them walking'}
        </button>
        <button
          type="button"
          onClick={handleStartOver}
          disabled={startOverDisabled}
          className="secondary-button"
          style={{
            marginLeft: '0.75rem',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            cursor: startOverDisabled ? 'not-allowed' : 'pointer',
            opacity: startOverDisabled ? 0.5 : 1,
          }}
        >
          Start over
        </button>
        {!hasBothPredictions && !locked && (
          <p style={smallNote}>Choose an option for both surfaces above to press &ldquo;Send them walking&rdquo;.</p>
        )}

        <Block>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Scene label="Flat surface" result={PART1_RESULT} scene="flat" distanceMeters={part1.distance} />
            <Scene label="Curved surface (sphere)" result={PART1_RESULT} scene="sphere" distanceMeters={part1.distance} />
          </div>
          <p style={{ ...smallNote, textAlign: 'center' }}>
            These are simple sketches, not to scale. Each dashed line is the path one traveler walks. On the flat surface the two paths run
            side by side. On the sphere, the outline stands for the sphere, and the paths are drawn as they would look from outside, with
            each traveler setting off from the same starting line and walking toward the pole.
          </p>
        </Block>

        {part1.status !== 'idle' && part1.result ? (
          <Block>
            <Part1Graph
              result={part1.result}
              revealUpToMeters={part1Done ? part1.result.maxDistanceMeters : part1.distance}
              complete={part1Done}
              flatGuess={submittedFlat}
              sphereGuess={submittedSphere}
            />
            {part1Done ? (
              <>
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> the separation of the travelers at every distance,
                  from the formulas in the caption below. The flat line uses plain geometry. The sphere line uses the exact formula for
                  two straight paths on a sphere. The curvature strength of 0.5 is far bigger than any real planet&rsquo;s would be. This
                  page does not measure real surfaces. <strong>Imagined for the question:</strong> the two travelers and the surfaces they
                  walk on. The sphere is an analogy for curved spacetime, not a picture of it. The white rings and arrows are only your
                  guesses.
                </WhereFrom>
                <Part1Caption />
              </>
            ) : (
              <p style={smallNote}>The graph draws itself as they walk. Your guesses will be marked on it when they have finished.</p>
            )}
          </Block>
        ) : (
          <p style={smallNote}>
            After you press &ldquo;Send them walking&rdquo;, a graph of the distance between the travelers will draw itself here as they walk.
          </p>
        )}

        {/* ===== Part 2 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#be185d" title="Part 2: Now try it yourself">
              Now you choose a different curvature strength and send the travelers walking again. The strength you choose changes the sphere
              drawing and Drawing A in this Part, with your lines in pink. It does not change Part 1&rsquo;s picture, the results in Part 3,
              or your guesses.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Curvature strength</label>
              <div style={{ marginBottom: '0.75rem' }}>
                {STRENGTH_PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrengthPreset(s)}
                    disabled={part2Running}
                    className={`toggle-button${strengthPreset === s ? ' is-selected' : ''}`}
                    style={{ marginRight: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                  >
                    {s}
                  </button>
                ))}
                <button
                  onClick={() => setStrengthPreset('other')}
                  disabled={part2Running}
                  className={`toggle-button${strengthPreset === 'other' ? ' is-selected' : ''}`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: part2Running ? 0.6 : 1 }}
                >
                  Other
                </button>
              </div>
              {strengthPreset === 'other' && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    min="0.01"
                    max="0.99"
                    step="0.01"
                    value={customStrength}
                    onChange={(e) => setCustomStrength(e.target.value)}
                    disabled={part2Running}
                    placeholder="Enter strength (0.01-0.99)"
                    className="field-input"
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '220px' }}
                  />
                </div>
              )}
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 0 }}>
                Selected: <strong>{isValidStrength ? `curvature strength ${selectedStrength}` : 'strength — (0.01 to 0.99)'}</strong>
              </p>
              <p style={smallNote}>Your guesses do not change these drawings, but the strength you choose does.</p>
              <button
                type="button"
                onClick={handlePart2}
                disabled={!isValidStrength || part2Running}
                className="action-button"
                style={{ padding: '0.6rem 1.5rem', marginTop: '0.5rem' }}
              >
                {part2Running ? 'Walking...' : 'Send them walking with your strength'}
              </button>
            </div>

            <Block>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Scene label="Flat surface" result={previewResult} scene="flat" distanceMeters={part2Distance} />
                <Scene
                  label="Curved surface (sphere)"
                  result={previewResult}
                  scene="sphere"
                  distanceMeters={part2Distance}
                  noteColor={YOURS_COLOR}
                />
              </div>
              <p style={{ ...smallNote, textAlign: 'center' }}>
                These are simple sketches, not to scale: the sketch is the same size for every strength. The number under the sphere says how
                far away its pole is for the strength shown.
              </p>
            </Block>

            {lastPart2 && !part2Running ? (
              <Block>
                <DrawingA result={lastPart2} settingsLabel={`${lastPart2.curvatureStrength}`} />
                <WhereFrom>
                  <strong>Measured:</strong> nothing. <strong>Calculated here:</strong> the separation of the travelers at every distance,
                  from the same formulas as in Part 1, for the strength you chose, which is far bigger than any real planet&rsquo;s would
                  be. <strong>Imagined for the question:</strong> the two travelers and the surfaces they walk on. The sphere is an analogy
                  for curved spacetime, not a picture of it. The grey line is Part 1&rsquo;s calculation, kept for comparison.
                </WhereFrom>
                <DrawingACaption />
                <p style={{ fontSize: '0.875rem', marginBottom: 0, marginTop: '0.75rem' }}>
                  <strong>Runs so far</strong>
                </p>
                <ul style={{ fontSize: '0.875rem', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {part2Runs.map((r, i) => (
                    <li key={i}>
                      Strength {r.curvatureStrength}: the pole is {r.maxDistanceMeters.toFixed(1)} m away; the travelers on the curved
                      surface ended {finalSeparationMeters(r, 'sphere').toFixed(3)} m apart and on the flat surface{' '}
                      {finalSeparationMeters(r, 'flat').toFixed(3)} m apart (they started {r.initialSeparationMeters.toFixed(3)} m apart)
                    </li>
                  ))}
                </ul>
              </Block>
            ) : (
              <p style={smallNote}>
                Not run yet. Choose a strength and press &ldquo;Send them walking with your strength&rdquo;; Drawing A for your strength will
                appear here.
              </p>
            )}
          </>
        )}

        {/* ===== Part 3 ===== */}
        {part1Done && (
          <>
            <PartHeader color="#0f766e" title="Part 3: The results">
              Here are the numbers from the Part 1 run, with your guesses marked beside them. Nothing in this Part changes with your guesses
              or with the strength you choose in Part 2.
            </PartHeader>

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Curvature strength:</strong> {PART1_RESULT.curvatureStrength} (the sphere&rsquo;s radius is{' '}
                {PART1_RESULT.radiusMeters.toFixed(1)} m)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Distance each traveler walks:</strong> {PART1_RESULT.maxDistanceMeters.toFixed(1)} m (to the pole)
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final separation, flat surface:</strong> {finalSeparationMeters(PART1_RESULT, 'flat').toFixed(3)} m (started at{' '}
                {PART1_RESULT.initialSeparationMeters.toFixed(3)} m)
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess for the flat surface is drawn on Part 1&rsquo;s graph as a white mark.
                </span>
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Final separation, curved surface:</strong> {finalSeparationMeters(PART1_RESULT, 'sphere').toFixed(3)} m (started at{' '}
                {PART1_RESULT.initialSeparationMeters.toFixed(3)} m): the two travelers have met at the pole.
                <GuessTag />
                <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Your guess for the curved surface is drawn on Part 1&rsquo;s graph as a white mark.
                </span>
              </p>
            </div>
            <p style={{ ...smallNote, marginTop: '0.75rem' }}>
              <strong>Where this comes from:</strong> calculated here from the formulas in the caption, with an exaggerated curvature
              strength; not measured. Nothing here changes with your guesses or with the strength you choose in Part 2.
            </p>
          </>
        )}

        {/* ===== Part 4 ===== */}
        {part1Done && submittedFlat !== null && submittedSphere !== null && (
          <>
            <PartHeader color="#0066cc" title="Part 4: The tutor">
              Talk through what you saw. The tutor points to your two white marks on the graph, then explains.
            </PartHeader>
            <CurvedSpacetimeTutor
              flatPrediction={submittedFlat}
              spherePrediction={submittedSphere}
              result={PART1_RESULT}
              onExplained={() => {
                setExplained(true)
                onTutorComplete?.()
              }}
            />
            {explained && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: 0, marginBottom: '0.25rem' }}>
                  <strong>More to read, now that you have the explanation.</strong> This page names geodesics and curved spacetime, which
                  the tutor names first, so it was held back until now. Checked on 12 November 2026. The link opens in a new tab.
                </p>
                <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: '1.25rem' }}>
                  {AFTER_LINKS.map((link) => (
                    <li key={link.href}>
                      <ExternalLink href={link.href}>{link.label}</ExternalLink> — {link.what}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
