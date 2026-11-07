import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DIRECTION_PRESETS, arrivalSummary } from '../physics/gravitationalWaveTriangulationExperiment'
import type { FirstDetectorChoice, TimingChoice } from '../physics/gravitationalWaveTriangulationExperiment'
import { GravitationalWaveTriangulationExperiment, TriangulationPicture } from './GravitationalWaveTriangulationExperiment'
import { GravitationalWaveTriangulationTutor } from './GravitationalWaveTriangulationTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and each white guess mark appears at its stage. They do not
// check how the page looks.
const DETECTORS: FirstDetectorChoice[] = ['Hanford', 'Livingston', 'Virgo']
const TIMINGS: TimingChoice[] = ['same', 'different']

const picture = (props: {
  scope: 'both' | 'A' | 'B'
  directionIndex?: number
  flashed?: string[]
  finished: boolean
  firstGuess: FirstDetectorChoice | null
  timingGuess: TimingChoice | null
  yours?: ReturnType<typeof arrivalSummary> | null
  showWedges?: boolean
}) =>
  renderToStaticMarkup(
    createElement(TriangulationPicture, {
      scope: props.scope,
      directionIndex: props.directionIndex ?? 0,
      flashed: props.flashed ?? [],
      wedgeProgress: props.showWedges ? 1 : 0,
      showWedges: props.showWedges ?? false,
      finished: props.finished,
      firstGuess: props.firstGuess,
      timingGuess: props.timingGuess,
      yours: props.yours ?? null,
      yoursLabel: 'B',
      label: 'x',
    }),
  )

describe('the triangulation page renders', () => {
  it('at rest: the links, the words box and Part 1 only, with no mark, no formula, an always-visible greyed Start over', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveTriangulationExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS:')
    expect(html).not.toContain('Change predictions')
    expect(html).toContain('Start over')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*class="secondary-button"[^>]*>Start over/)
    expect(html).not.toContain('Formula: the most a gap can be') // held back until after the run (CLAUDE.md §12)
    expect(html).not.toContain('NaN')
  })

  it('does not give either answer before the learner has predicted', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveTriangulationExperiment, {}))
    expect(html).not.toContain('only a few milliseconds')
    expect(html).not.toContain('10 milliseconds')
    expect(html).not.toContain('8 milliseconds') // the link texts do not give GW170814's timings either
    expect(html).not.toContain('about 10 ms')
    expect(html).not.toContain('closest to where it came from')
    expect(html).not.toContain('15.81')
    expect(html).not.toContain('5.80')
  })

  it('has links to the sources, opening in a new tab', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveTriangulationExperiment, {}))
    for (const url of [
      'https://www.ligo.caltech.edu/video/ligo20171016v5',
      'https://www.ligo.caltech.edu/page/ligo-detectors',
      'http://ligo.org/science-summaries/GW170814/',
      'https://ligo.org/detections/gw170817/',
      'https://arxiv.org/abs/1710.05832',
      'https://arxiv.org/abs/1710.05833',
    ]) {
      expect(html).toContain(url)
    }
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})

describe('the picture', () => {
  it('draws the map with the first guess, and no timeline and no second guess, before the run has finished', () => {
    const html = picture({ scope: 'both', finished: false, firstGuess: 'Hanford', timingGuess: 'different' })
    for (const text of ['Hanford', 'Livingston', 'Virgo', 'the wave arrives from here']) expect(html).toContain(text)
    expect(html).toContain('YOUR GUESS: Hanford will be reached first')
    expect(html).not.toContain('YOUR GUESS: at measurably')
    expect(html).toContain('Press Run: the timeline is drawn when the run has finished.')
    expect(html).not.toContain('NaN')
  })

  it('draws the second guess when the timeline is drawn, and both marks follow the guesses', () => {
    const rings = new Set<string>()
    for (const first of DETECTORS) {
      const html = picture({ scope: 'both', finished: true, firstGuess: first, timingGuess: 'different' })
      expect(html).toContain(`YOUR GUESS: ${first} will be reached first`)
      rings.add(html.slice(html.indexOf('<circle', html.indexOf('stroke-width="4"') - 120), html.indexOf('YOUR GUESS')))
    }
    expect(rings.size).toBe(3)
    const signs = new Set<string>()
    for (const timing of TIMINGS) {
      const html = picture({ scope: 'both', finished: true, firstGuess: 'Virgo', timingGuess: timing })
      expect(html).toContain('15.81 ms')
      expect(html).toContain('5.80 ms')
      expect(html).toContain('0.00 ms')
      expect(html).not.toContain('NaN')
      signs.add(html.slice(html.lastIndexOf('YOUR GUESS')))
    }
    expect(signs.size).toBe(2)
  })

  it('draws no guess mark when there is no guess', () => {
    expect(picture({ scope: 'both', finished: true, firstGuess: null, timingGuess: null })).not.toContain('YOUR GUESS')
  })

  it('Drawing A shows the first guess with its direction noted, and Drawing B the second with the pink rows', () => {
    const a = picture({ scope: 'A', directionIndex: 1, firstGuess: 'Livingston', timingGuess: null, finished: false })
    expect(a).toContain('YOUR DIRECTION: B')
    expect(a).toContain('YOUR GUESS (for Direction A): Livingston will be reached first')
    expect(a).not.toContain('Panel B')
    const b = picture({ scope: 'B', finished: true, firstGuess: null, timingGuess: 'same', yours: arrivalSummary(DIRECTION_PRESETS[1].directionDegrees) })
    expect(b).toContain('YOUR DIRECTION: B')
    expect(b).toContain('28.27 ms')
    expect(b).toContain('Part 1: Direction A')
    expect(b).toContain('YOUR GUESS: all three at essentially the same instant')
    expect(b).not.toContain('Panel A')
    expect(b).not.toContain('NaN')
  })

  it('draws the wedges only once the run has finished, in violet and green and never in pink', () => {
    const before = picture({ scope: 'both', finished: false, firstGuess: null, timingGuess: null, showWedges: false })
    expect(before).not.toContain('possible directions')
    const after = picture({ scope: 'both', finished: true, firstGuess: null, timingGuess: null, showWedges: true })
    expect(after).toContain('possible directions (A)')
    expect(after).toContain('#a78bfa')
    expect(after).toContain('#34d399')
    expect(after).not.toContain('#f472b6')
  })

  it('renders at every direction preset with finite numbers', () => {
    DIRECTION_PRESETS.forEach((_, index) => {
      const html = picture({
        scope: 'both',
        directionIndex: index,
        flashed: ['Hanford', 'Virgo'],
        finished: true,
        firstGuess: 'Virgo',
        timingGuess: 'same',
        showWedges: true,
        yours: arrivalSummary(DIRECTION_PRESETS[index].directionDegrees),
      })
      expect(html).not.toContain('NaN')
      expect(html).not.toContain('Infinity')
    })
  })
})

describe('the tutor', () => {
  it('first prompt does not give an answer', () => {
    for (const first of DETECTORS) {
      for (const timing of TIMINGS) {
        const html = renderToStaticMarkup(
          createElement(GravitationalWaveTriangulationTutor, { predictedFirstDetector: first, predictedTiming: timing, firstMatched: false, timingMatched: false }),
        )
        expect(html).toContain('What did you notice about the order and timing of the three pulses?')
        expect(html).not.toContain('In fact')
      }
    }
  })
})
