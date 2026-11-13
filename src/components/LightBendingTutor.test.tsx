import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { BendChoice, MoreLessSameChoice } from '../physics/lightBendingExperiment'
import { LightBendingExperiment } from './LightBendingExperiment'
import { LightBendingExplanation, LightBendingTutor } from './LightBendingTutor'

// Render checks only (no browser): the tutor's first question gives no answer, and the explanation marks each guess with the real numbers.
const explanation = (b: BendChoice, c: MoreLessSameChoice, r: MoreLessSameChoice) =>
  renderToStaticMarkup(createElement(LightBendingExplanation, { bentGuess: b, closerGuess: c, realGuess: r })).replace(/<!-- -->/g, '')

describe('Gravity 8 tutor (Part 4)', () => {
  it('Part 4 is not on the page before the first pass has finished', () => {
    const page = renderToStaticMarkup(createElement(LightBendingExperiment, {}))
    expect(page).not.toContain('Part 4: The tutor')
  })

  it('the first question points to the pictures and gives no outcome, no marking and no number', () => {
    const html = renderToStaticMarkup(createElement(LightBendingTutor, { bentGuess: 'yes', closerGuess: 'more', realGuess: 'more' }))
    expect(html).toContain('What happened to the light')
    expect(html).not.toContain('Your guesses, marked')
    expect(html).not.toContain('twice')
    expect(html).not.toContain('1919')
    expect(html).not.toContain('That was right')
    expect(html).not.toContain('bent, but kept going')
  })

  it('three right guesses are marked right, with the real numbers', () => {
    const h = explanation('yes', 'more', 'more')
    expect((h.match(/That was right\./g) ?? []).length).toBe(3)
    expect(h).not.toContain('That was not right')
    expect(h).toContain('9.5°')
    expect(h).toContain('7.0°')
    expect(h).toContain('35.2°')
    expect(h).toContain('28.6°')
    expect(h).toContain('14.3°')
    expect(h).not.toContain('NaN')
  })

  it('three wrong guesses are marked not right, and the numbers do not change', () => {
    const h = explanation('no', 'less', 'same')
    expect((h.match(/That was not right\./g) ?? []).length).toBe(3)
    expect(h).toContain('28.6°')
    expect(h).toContain('no, it stays straight')
  })

  it('the explanation gives the real Sun numbers, the 1919 eclipse and lensing, with their sources named', () => {
    const h = explanation('yes', 'more', 'more')
    expect(h).toContain('0.87 arcseconds')
    expect(h).toContain('1.75 arcseconds')
    expect(h).toContain('Physics Today')
    expect(h).toContain('a little under 2 arcseconds')
    expect(h).toContain('Sobral')
    expect(h).toContain('ESA/Hubble')
    expect(h).toContain('exactly twice')
    expect(h).toContain('space itself is curved')
    // point 3: two effects, a daily-life picture, and the sum with the module's numbers
    expect(h).toContain('Effect 1: the pull')
    expect(h).toContain('Effect 2: the curving of space')
    expect(h).toContain('London to New York')
    expect(h).toContain('14.3° + 14.3° = 28.6°')
    expect(h).toContain('about 2.0')
    // point 6: what lensing is, how it works with this page's numbers, and three uses
    expect(h).toContain('wine glass')
    expect(h).toContain('two different routes')
    expect(h).toContain('turns by 9.5°')
    expect(h).toContain('Einstein ring')
    expect(h).toContain('Mapping hidden matter.')
    expect(h).toContain('Why the images are stretched into arcs')
    expect(h).toContain('Why lensed galaxies look brighter')
    expect(h).toContain('Weighing a cluster, step by step')
    expect(h).toContain('Double the mass to 2 and the bend doubles to 28.6°')
    expect(h).toContain('0.5 × 4 × 2 ÷ 4 = 1.0')
    expect(h).toContain('mass twice as big')
    expect(h).toContain('Gravitational Lensing')
    expect(h).toContain('9.5° at aim 3.0')
    expect(h).not.toContain('NaN')
  })
})
