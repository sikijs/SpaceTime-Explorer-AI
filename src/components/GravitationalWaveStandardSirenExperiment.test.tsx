import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { SIREN_PART1_DISTANCE_MPC, SIREN_PART1_EVENT, sirenRunSummary } from '../physics/standardSirenExperiment'
import type { DistanceKnowChoice, NearFarChoice } from '../physics/standardSirenExperiment'
import { GravitationalWaveStandardSirenExperiment, SirenPicture } from './GravitationalWaveStandardSirenExperiment'
import { GravitationalWaveStandardSirenTutor } from './GravitationalWaveStandardSirenTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and each white guess mark appears at its stage. They do not
// check how the page looks.
const NEAR_FAR: NearFarChoice[] = ['nearby-louder', 'far-louder', 'same']
const DISTANCE_KNOW: DistanceKnowChoice[] = ['yes', 'no']
const part1 = sirenRunSummary(SIREN_PART1_EVENT, SIREN_PART1_DISTANCE_MPC)

const picture = (props: {
  scope: 'all' | 'A' | 'B' | 'C'
  started?: boolean
  finished: boolean
  nearFarGuess: NearFarChoice | null
  distanceKnowGuess: DistanceKnowChoice | null
  yours?: ReturnType<typeof sirenRunSummary> | null
  progress?: number
}) =>
  renderToStaticMarkup(
    createElement(SirenPicture, {
      scope: props.scope,
      eventId: SIREN_PART1_EVENT,
      distanceMpc: SIREN_PART1_DISTANCE_MPC,
      progress: props.progress ?? 0.5,
      started: props.started ?? true,
      finished: props.finished,
      part1,
      nearFarGuess: props.nearFarGuess,
      distanceKnowGuess: props.distanceKnowGuess,
      yours: props.yours ?? null,
      yoursLabel: 'YOUR CHOICE: GW150914 at 400 Mpc',
      label: 'x',
    }),
  )

describe('the standard-sirens page renders', () => {
  it('at rest: the links, the words box and Part 1 only, with no mark, no formula, an always-visible greyed Start over', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveStandardSirenExperiment, {}))
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
    expect(html).not.toContain('Formula: the Hubble constant') // held back until after the run (CLAUDE.md §12)
    expect(html).not.toContain('NaN')
  })

  it('does not give either answer before the learner has predicted', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveStandardSirenExperiment, {}))
    expect(html).not.toContain('Standard candle') // defined only after the run
    expect(html).not.toContain('is called a standard siren')
    expect(html).not.toContain('fades with distance')
    expect(html).not.toContain('depends only on the masses')
    expect(html).not.toContain('weaker, detected amplitude')
    expect(html).not.toContain('62–170')
    expect(html).not.toContain('7.115e-4') // the run's detected amplitude
    expect(html).not.toContain('75.4')
  })

  it('has links to the sources, opening in a new tab', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveStandardSirenExperiment, {}))
    for (const url of [
      'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-constant-and-tension/',
      'https://www.esa.int/media/measurements-of-the-hubble-constant',
      'http://www.ligo.org/science-summaries/GW170817Hubble/',
      'https://arxiv.org/abs/1710.05835',
      'https://arxiv.org/abs/1710.05832',
    ]) {
      expect(html).toContain(url)
    }
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})

describe('the picture', () => {
  it('draws the source and the arms, and no bars and no marks, before the run has finished', () => {
    const html = picture({ scope: 'all', started: false, finished: false, nearFarGuess: 'nearby-louder', distanceKnowGuess: 'no', progress: 0 })
    for (const text of ['Arm X (detected)', 'Arm Y (detected)', 'the source (true amplitude)']) expect(html).toContain(text)
    expect(html).not.toContain('YOUR GUESS')
    expect(html).toContain('Press Run: this panel is drawn when the run has finished.')
    expect(html).not.toContain('NaN')
  })

  it('draws both bar panels and both guess marks when the run has finished, and the marks follow the guesses', () => {
    const boxes = new Set<string>()
    for (const choice of NEAR_FAR) {
      const html = picture({ scope: 'all', finished: true, nearFarGuess: choice, distanceKnowGuess: 'no' })
      expect(html).toContain('2.846e-3') // detected at Nearby
      expect(html).toContain('7.115e-4') // this run
      expect(html).toContain('2.846e-5') // detected at Far
      expect(html).toContain('YOUR GUESS: ')
      expect(html).not.toContain('NaN')
      boxes.add(html.slice(html.indexOf('YOUR GUESS: '), html.indexOf('YOUR GUESS: ') + 70))
    }
    expect(boxes.size).toBe(3)
    const second = new Set<string>()
    for (const choice of DISTANCE_KNOW) {
      const html = picture({ scope: 'all', finished: true, nearFarGuess: null, distanceKnowGuess: choice })
      expect(html).toContain('0.0285') // the 40 Mpc story (the true amplitude)
      expect(html).toContain('7.115e-3') // the 10 Mpc story
      second.add(html.slice(html.lastIndexOf('YOUR GUESS: ')))
    }
    expect(second.size).toBe(2)
  })

  it('draws no guess mark when there is no guess', () => {
    expect(picture({ scope: 'all', finished: true, nearFarGuess: null, distanceKnowGuess: null })).not.toContain('YOUR GUESS')
  })

  it('Drawing B shows the pink bar and the first guess, and Drawing C the pink row and the second guess', () => {
    const yours = sirenRunSummary('gw150914', 400)
    const b = picture({ scope: 'B', started: false, finished: true, nearFarGuess: 'far-louder', distanceKnowGuess: null, yours })
    expect(b).toContain('YOUR CHOICE: GW150914 at 400 Mpc')
    expect(b).toContain('1.304e-3')
    expect(b).toContain('YOUR GUESS: the far one looks stronger')
    expect(b).not.toContain('Panel A')
    expect(b).not.toContain('NaN')
    const c = picture({ scope: 'C', started: false, finished: true, nearFarGuess: null, distanceKnowGuess: 'yes', yours })
    expect(c).toContain('your choice')
    expect(c).toContain('YOUR GUESS: yes, the detected amplitude alone is enough')
    expect(c).not.toContain('Panel B')
    expect(c).not.toContain('NaN')
  })

  it('renders with finite numbers for every event and a spread of distances', () => {
    for (const id of ['gw150914', 'gw170817'] as const) {
      for (const distance of [1, 10, 40, 400, 1000, 2000]) {
        const yours = sirenRunSummary(id, distance)
        for (const scope of ['all', 'A', 'B', 'C'] as const) {
          const html = picture({ scope, finished: true, nearFarGuess: 'same', distanceKnowGuess: 'yes', yours })
          expect(html).not.toContain('NaN')
          expect(html).not.toContain('Infinity')
        }
      }
    }
  })
})

describe('the tutor', () => {
  it('first prompt does not give an answer', () => {
    for (const nearFar of NEAR_FAR) {
      for (const know of DISTANCE_KNOW) {
        const html = renderToStaticMarkup(
          createElement(GravitationalWaveStandardSirenTutor, { predictedNearFar: nearFar, predictedDistanceKnow: know, nearFarMatched: false, distanceKnowMatched: false }),
        )
        expect(html).toContain('What did you notice about the true amplitude compared to the detected amplitude?')
        expect(html).not.toContain('In fact')
      }
    }
  })
})
