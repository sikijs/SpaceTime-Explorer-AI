import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PREDICTION_KEYS } from '../physics/spacetimeCurvatureSourceExperiment'
import type { PredictionChoice, PredictionKey } from '../physics/spacetimeCurvatureSourceExperiment'
import { Part1Caption, Part1Graphs, Part2Caption, Part2Graphs, SpacetimeCurvatureSourceExperiment } from './SpacetimeCurvatureSourceExperiment'
import { SpacetimeCurvatureSourceExplanation, SpacetimeCurvatureSourceTutor } from './SpacetimeCurvatureSourceTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white marks appear exactly when a guess is given and the
// lines are complete. They do not check how the page looks.
const CHOICES: PredictionChoice[] = ['stronger', 'same', 'weaker']
const all = (c: PredictionChoice): Record<PredictionKey, PredictionChoice> => ({
  closerDilation: c,
  closerTidal: c,
  biggerDilation: c,
  biggerTidal: c,
})
const SETTINGS: Array<[number, number]> = [
  [1, 1],
  [2, 2],
  [4, 1],
  [1, 4],
  [4, 4],
  [0.5, 10],
  [8, 0.3],
]

describe('Gravity 5 renders', () => {
  it('the page renders at rest: Part 1, links, words box and Start over, but no later Part and no white mark', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Start over')
    expect(html).toContain('>Run<')
    expect(html).not.toContain('Run Again')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('>Continue<')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('a marker only')
    expect(html).not.toContain('NaN')
  })

  it('the introduction explains the Parts first and does not give the answers away', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceExperiment, {}))
    const layout = html.indexOf('How this page is laid out.')
    expect(layout).toBeGreaterThan(-1)
    expect(html.indexOf('Part 1')).toBeGreaterThan(layout)
    expect(html).not.toContain('always makes both effects stronger')
    expect(html).not.toContain('the dip gets noticeably deeper')
    expect(html).not.toContain('onvergence strength')
    expect(html).toContain('Your guesses never change the real pictures')
    expect(html).toContain('further simplification')
    expect(html).toContain('time-dilation')
    expect(html).toContain('tidal strength')
  })

  it('the introduction reminds the learner what the two strengths did, with the earlier experiments\' own numbers', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceExperiment, {}))
    expect(html).toContain('A quick reminder of the two strengths.')
    expect(html).toContain('Time-dilation strength (Experiment 2).')
    expect(html).toContain('Tidal strength (Experiment 3')
    expect(html).toContain('1.43 times for every 1 tick')
    expect(html).toContain('2.50 times')
    expect(html).toContain('0.700 metres apart')
    expect(html).toContain('0.400 metres apart')
  })

  it('Start over is greyed out at rest', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceExperiment, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
  })

  it('only the neutral NASA Glenn link is shown at rest; the three gravity, tides and clocks pages are held back until after the tutor', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceExperiment, {}))
    expect(html).toContain('free-fall-without-air-resistance')
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('what-is-gravity')
    expect(html).not.toContain('what-causes-tides')
    expect(html).not.toContain('putting-einstein-test')
    expect(html).toContain('held back')
  })

  it('the words box does not show the strength formulas before the run', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceExperiment, {}))
    expect(html).not.toContain('0.3 × mass')
    expect(html).not.toContain('1.2 × mass')
    expect(html).toContain('Cap')
  })

  it('Part 1 graphs: four graphs with the cap line, axis titles and the two line styles, for every reveal', () => {
    for (const reveal of [0, 0.3, 1]) {
      const html = renderToStaticMarkup(createElement(Part1Graphs, { reveal, guesses: null }))
      expect(html.match(/<svg/g)?.length).toBe(4)
      for (const text of [
        'Time-dilation strength as the mass moves closer (Medium mass)',
        'Tidal strength as the mass moves closer (Medium mass)',
        'Time-dilation strength as the mass gets bigger (Medium distance)',
        'Tidal strength as the mass gets bigger (Medium distance)',
        'cap: 0.9, the most this page can use',
        'Distance of the mass',
        'Far (4)',
        'Close (1)',
        'Small (1)',
        'Large (4)',
      ]) {
        expect(html).toContain(text)
      }
      expect(html).toContain('#818cf8')
      expect(html).toContain('#f59e0b')
      expect(html).not.toContain('NaN')
    }
  })

  it('the white marks are drawn only when the lines are complete and a guess is given, one per guess, with the module\'s box text', () => {
    expect(renderToStaticMarkup(createElement(Part1Graphs, { reveal: 1, guesses: null }))).not.toContain('YOUR GUESS')
    expect(renderToStaticMarkup(createElement(Part1Graphs, { reveal: 0.4, guesses: all('stronger') }))).not.toContain('YOUR GUESS')
    const one = renderToStaticMarkup(
      createElement(Part1Graphs, { reveal: 1, guesses: { closerDilation: null, closerTidal: 'weaker', biggerDilation: null, biggerTidal: null } })
    )
    expect(one.match(/YOUR GUESS/g)?.length).toBe(1)
    expect(one).toContain('closer mass, tidal effect')
    for (const c of CHOICES) {
      const html = renderToStaticMarkup(createElement(Part1Graphs, { reveal: 1, guesses: all(c) }))
      expect(html.match(/YOUR GUESS/g)?.length).toBe(4)
      expect(html.match(/a marker only/g)?.length).toBe(4)
      expect(html).toContain('#ffffff')
      expect(html).toContain(`the effect ${c === 'stronger' ? 'gets stronger' : c === 'weaker' ? 'gets weaker' : 'stays the same'}`)
      expect(html).not.toContain('NaN')
    }
  })

  it('each ring sits in the same place whatever the guess', () => {
    const rings = (c: PredictionChoice) =>
      renderToStaticMarkup(createElement(Part1Graphs, { reveal: 1, guesses: all(c) })).match(/<circle[^>]*r="11"[^>]*>/g)
    expect(rings('stronger')?.length).toBe(4)
    expect(rings('stronger')).toEqual(rings('same'))
    expect(rings('stronger')).toEqual(rings('weaker'))
  })

  it('Part 2 graphs are pink, keep the grey Part 1 line, carry a pink dot and no white mark, for every setting', () => {
    for (const [m, d] of SETTINGS) {
      const html = renderToStaticMarkup(createElement(Part2Graphs, { mass: m, distance: d, reveal: 1 }))
      expect(html.match(/<svg/g)?.length).toBe(4)
      expect(html).toContain('#f472b6')
      expect(html).toContain('#f9a8d4')
      expect(html).toContain('#9ca3af')
      expect(html.match(/<circle[^>]*r="6"[^>]*fill="#f472b6"/g)?.length).toBe(4)
      expect(html).not.toContain('YOUR GUESS')
      expect(html).not.toContain('#ffffff')
      expect(html).not.toContain('NaN')
    }
  })

  it('Part 2 graphs look different for different masses and distances', () => {
    const a = renderToStaticMarkup(createElement(Part2Graphs, { mass: 1, distance: 4, reveal: 1 }))
    const b = renderToStaticMarkup(createElement(Part2Graphs, { mass: 4, distance: 1, reveal: 1 }))
    expect(a).not.toBe(b)
  })

  it('the captions give the worked moment and three-part look-at items, with the module\'s numbers', () => {
    const part1 = renderToStaticMarkup(createElement(Part1Caption))
    expect(part1).toContain('How to read this diagram.')
    expect(part1).toContain('A worked moment.')
    expect(part1).toContain('0.0375')
    expect(part1).toContain('0.300')
    expect(part1).toContain('0.600')
    expect(part1).toContain('0.900')
    expect(part1).toContain('0.3 × mass ÷ distance')
    expect(part1).toContain('1.4')
    expect(part1.match(/Look at:/g)?.length).toBe(3)
    expect(part1.match(/What it means:/g)?.length).toBe(3)
    expect(part1.match(/Why it matters:/g)?.length).toBe(3)
    const part2 = renderToStaticMarkup(createElement(Part2Caption))
    expect(part2).toContain('How to read Part 2')
    expect(part2).toContain('The two upper graphs (strength against distance).')
    expect(part2).toContain('The two lower graphs (strength against mass).')
    expect(part2).toContain('The pink dot')
    expect(part2).toContain('Worked moments.')
    expect(part2).toContain('14.29')
    expect(part2).toContain('25.00')
    expect(part2).toContain('100.00')
    expect(part2).toContain('0.400 m apart')
    expect(part2).toContain('0.100 m apart')
    expect(part2).not.toContain('&amp;rsquo;')
    expect(part2).toContain('0.01875')
    expect(part2).toContain('0.020')
    expect(part2.match(/Look at:/g)?.length).toBe(3)
    expect(part2.match(/What it means:/g)?.length).toBe(3)
    expect(part2.match(/Why it matters:/g)?.length).toBe(3)
  })

  it('the tutor\'s first prompt points to the four white marks by name and gives no verdict', () => {
    const html = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceTutor, { predictions: all('stronger') }))
    expect(html).toContain('white marks')
    expect(html).not.toContain('both panels')
    expect(html).not.toContain('Your guesses, marked.')
    expect(html).not.toContain('actually did')
  })

  it('the explanation marks all four guesses, uses the module\'s numbers, and no longer says "always"', () => {
    for (const c of CHOICES) {
      const html = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceExplanation, { predictions: all(c) }))
      expect(html).toContain('Your guesses, marked.')
      expect(html).toContain('0.0375')
      expect(html).toContain('0.600')
      expect(html).toContain('where it reaches the cap')
      expect(html).toContain('up to the cap')
      expect(html).toContain('Experiment 4 (curved spacetime)')
      expect(html).toContain('A bigger mass raises both strengths in the same proportion.')
      expect(html).toContain('0.150, 0.300, 0.600')
      expect(html).toContain('loud speaker')
      expect(html).toContain('The cap, and why it is there.')
      expect(html).toContain('10.00 times for every floor tick')
      expect(html).toContain('0.100 m apart')
      expect(html).toContain('So where did the')
      expect(html).toContain('A note on how real these numbers are.')
      expect(html).not.toContain('always makes both numbers grow')
      expect(html).not.toContain('NaN')
    }
    const html = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceExplanation, { predictions: all('stronger') }))
    expect(html.match(/matched/g)?.length).toBe(4)
    const wrong = renderToStaticMarkup(createElement(SpacetimeCurvatureSourceExplanation, { predictions: all('weaker') }))
    expect(wrong.match(/different from your guess/g)?.length).toBe(4)
    expect(PREDICTION_KEYS.length).toBe(4)
  })
})
