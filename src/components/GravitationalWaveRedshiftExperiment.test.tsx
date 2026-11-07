import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { REDSHIFT_PART1_SPEED, redshiftRunSummary } from '../physics/gravitationalWaveRedshiftExperiment'
import type { DirectionChoice, MagnitudeChoice } from '../physics/gravitationalWaveRedshiftExperiment'
import { GravitationalWaveRedshiftExperiment, RedshiftPicture } from './GravitationalWaveRedshiftExperiment'
import { GravitationalWaveRedshiftTutor } from './GravitationalWaveRedshiftTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and each white guess mark appears at its stage. They do not
// check how the page looks.
const DIRECTIONS: DirectionChoice[] = ['higher', 'lower', 'same']
const MAGNITUDES: MagnitudeChoice[] = ['exact', 'more', 'less']
const part1 = redshiftRunSummary(REDSHIFT_PART1_SPEED)

const picture = (props: {
  scope: 'both' | 'A' | 'B'
  started: boolean
  finished: boolean
  dirGuess: DirectionChoice | null
  magGuess: MagnitudeChoice | null
  yours?: ReturnType<typeof redshiftRunSummary> | null
  speed?: number
  time?: number
}) =>
  renderToStaticMarkup(
    createElement(RedshiftPicture, {
      scope: props.scope,
      speed: props.speed ?? REDSHIFT_PART1_SPEED,
      time: props.time ?? 0.2,
      started: props.started,
      part1,
      finished: props.finished,
      dirGuess: props.dirGuess,
      magGuess: props.magGuess,
      yours: props.yours ?? null,
      yoursSpeed: props.speed ?? 0.7,
      label: 'x',
    }),
  )

describe('the redshift page renders', () => {
  it('at rest: the links, the words box and Part 1 only, with no mark, no formula, an always-visible greyed Start over', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveRedshiftExperiment, {}))
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
    expect(html).not.toContain('Formula: the real Doppler factor') // held back until after the run (CLAUDE.md §12)
    expect(html).not.toContain('NaN')
  })

  it('does not give either answer before the learner has predicted', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveRedshiftExperiment, {}))
    expect(html).not.toContain('slightly bigger')
    expect(html).not.toContain('slightly more')
    expect(html).not.toContain('slower than the frequency the source')
    expect(html).not.toContain('1.73') // the real stretch at 0.5c
    expect(html).not.toContain('0.577') // the real factor
    expect(html).toContain('1.5') // the everyday stretch is worked out in the introduction and is not the answer
  })

  it('has links to the sources, opening in a new tab', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveRedshiftExperiment, {}))
    for (const url of [
      'https://imagine.gsfc.nasa.gov/features/yba/M31_velocity/spectrum/doppler_more.html',
      'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-cosmological-redshift/',
      'http://ligo.org/science-summaries/O3Cosmology/',
      'https://arxiv.org/abs/1602.03837',
    ]) {
      expect(html).toContain(url)
    }
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})

describe('the picture', () => {
  it('draws the arms and the two waves, with no mark and no bars, before the run', () => {
    const html = picture({ scope: 'both', started: false, finished: false, dirGuess: 'lower', magGuess: 'more', time: 0 })
    for (const text of ['Arm X', 'Arm Y', 'Emitted', 'Detected', 'the detector']) expect(html).toContain(text)
    expect(html).not.toContain('YOUR GUESS')
    expect(html).toContain('Press Run: the two bars are drawn when the run has finished.')
    expect(html).not.toContain('NaN')
  })

  it('draws the first guess when the waves are drawn and the second when the bars are drawn, and the marks follow the guesses', () => {
    const marks = new Set<string>()
    for (const dir of DIRECTIONS) {
      const html = picture({ scope: 'both', started: true, finished: false, dirGuess: dir, magGuess: 'more' })
      expect(html).toContain('YOUR GUESS')
      expect(html).not.toContain('YOUR GUESS: more stretch') // the second guess waits for the bars
      marks.add(html.slice(html.indexOf('YOUR GUESS')))
    }
    expect(marks.size).toBe(3)
    expect(picture({ scope: 'both', started: true, finished: false, dirGuess: 'lower', magGuess: null })).not.toContain('Real stretch" ')
    const magMarks = new Set<string>()
    for (const mag of MAGNITUDES) {
      const html = picture({ scope: 'both', started: true, finished: true, dirGuess: 'lower', magGuess: mag })
      expect(html).toContain('1.50') // the everyday bar
      expect(html).toContain('1.73') // the real bar
      expect(html).not.toContain('NaN')
      magMarks.add(html.slice(html.lastIndexOf('YOUR GUESS')))
    }
    expect(magMarks.size).toBe(3)
  })

  it('draws no guess mark when there is no guess', () => {
    expect(picture({ scope: 'both', started: true, finished: true, dirGuess: null, magGuess: null })).not.toContain('YOUR GUESS')
  })

  it('Drawing A shows the first guess with its speed noted, and Drawing B the second with the pink bars', () => {
    const a = picture({ scope: 'A', started: true, finished: false, dirGuess: 'higher', magGuess: null, speed: 0.7 })
    expect(a).toContain('YOUR SPEED: 0.70c')
    expect(a).toContain('YOUR GUESS (for 0.5c)')
    expect(a).not.toContain('Panel B')
    const b = picture({ scope: 'B', started: false, finished: true, dirGuess: null, magGuess: 'less', yours: redshiftRunSummary(0.9), speed: 0.9 })
    expect(b).toContain('YOUR SPEED 0.90c: everyday')
    expect(b).toContain('YOUR SPEED 0.90c: real')
    expect(b).toContain('4.36')
    expect(b).toContain('1.90')
    expect(b).toContain('YOUR GUESS: less stretch')
    expect(b).not.toContain('Panel A')
    expect(b).not.toContain('NaN')
  })

  it('renders at every speed on the slider with finite numbers', () => {
    for (const speed of [0, 0.05, 0.3, 0.5, 0.9]) {
      for (const time of [0, 0.2, 0.45]) {
        const html = picture({ scope: 'both', started: true, finished: true, dirGuess: 'same', magGuess: 'exact', yours: redshiftRunSummary(speed), speed, time })
        expect(html).not.toContain('NaN')
        expect(html).not.toContain('Infinity')
      }
    }
  })
})

describe('the tutor', () => {
  it('first prompt does not give an answer', () => {
    for (const dir of DIRECTIONS) {
      for (const mag of MAGNITUDES) {
        const html = renderToStaticMarkup(createElement(GravitationalWaveRedshiftTutor, { predictedDirection: dir, predictedMagnitude: mag, directionMatched: false, magnitudeMatched: false }))
        expect(html).toContain('What did you notice about how the two waves behaved during the run?')
        expect(html).not.toContain('In fact')
        expect(html).not.toContain('slightly')
      }
    }
  })
})
