import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { SpeedCompareChoice, YesNo } from '../physics/blackHoleExperiment'
import { BlackHoleExperiment } from './BlackHoleExperiment'
import { BlackHoleExplanation, BlackHoleTutor } from './BlackHoleTutor'

// Render checks only (no browser): the tutor's first question gives no answer, and the explanation marks each guess with the real numbers.
const CHOICES: SpeedCompareChoice[] = ['much-slower', 'faster', 'cannot-escape']
const ANSWERS: YesNo[] = ['yes', 'no']
const explanation = (l: SpeedCompareChoice, h: SpeedCompareChoice, b: YesNo) =>
  renderToStaticMarkup(createElement(BlackHoleExplanation, { lightGuess: l, heavyGuess: h, inBetweenGuess: b })).replace(/<!-- -->/g, '')

describe('Gravity 7 tutor (Part 4)', () => {
  it('Part 4 is not on the page before the first launch has finished', () => {
    const page = renderToStaticMarkup(createElement(BlackHoleExperiment, {}))
    expect(page).not.toContain('Part 4: The tutor')
  })

  it('the first question points to the launches and gives no answer, no marking and no number', () => {
    const html = renderToStaticMarkup(createElement(BlackHoleTutor, { lightGuess: 'much-slower', heavyGuess: 'faster', inBetweenGuess: 'yes' }))
    expect(html).toContain('what did the probe do?')
    expect(html).not.toContain('Your guesses, marked')
    expect(html).not.toContain('173')
    expect(html).not.toContain('event horizon')
    expect(html).not.toContain('That matches')
  })

  it('all three right guesses are marked as matching, with the real numbers', () => {
    const html = explanation('much-slower', 'cannot-escape', 'yes')
    expect((html.match(/That matches what you guessed\./g) ?? []).length).toBe(3)
    expect(html).not.toContain('That is different from what you guessed')
    expect(html).toContain('32 percent')
    expect(html).toContain('173 percent')
    expect(html).toContain('at mass 2.0 the escape speed is exactly the speed of light')
    expect(html).not.toContain('NaN')
  })

  it('three different guesses are marked as different, and "faster than light" is explained', () => {
    const html = explanation('cannot-escape', 'faster', 'no')
    expect((html.match(/That is different from what you guessed/g) ?? []).length).toBe(3)
    expect(html).not.toContain('That matches')
    expect(html).toContain('Faster than light is the number the formula gives')
    expect(html).toContain('the number you had in mind was the right one')
  })

  it('every combination of guesses renders without NaN, and marks each guess exactly once', () => {
    const seen = new Set<string>()
    for (const l of CHOICES) {
      for (const h of CHOICES) {
        for (const b of ANSWERS) {
          const html = explanation(l, h, b)
          expect(html).not.toContain('NaN')
          const marks = (html.match(/That matches what you guessed/g) ?? []).length + (html.match(/That is different from what you guessed/g) ?? []).length
          expect(marks).toBe(3)
          seen.add(html)
        }
      }
    }
    expect(seen.size).toBe(3 * 3 * 2)
  })

  it('the explanation states the real numbers, the sink analogy flagged as an analogy, and the history with its hedged dates', () => {
    const html = explanation('much-slower', 'cannot-escape', 'yes')
    expect(html).toContain('Four times the mass, 2.0, needs 100 percent')
    expect(html).toContain('50 percent')
    expect(html).toContain('radius 0.10')
    expect(html).toContain('radius 3.00')
    expect(html).toContain('2 × 2.0 ÷ 2² = 1.00, the launch distance')
    expect(html).toContain('It is an analogy, not a real drain')
    expect(html).toContain('in a letter printed in 1784')
    expect(html).not.toContain('1783')
    expect(html).toContain('in the 1790s')
    expect(html).toContain('within about a month of Einstein')
    expect(html).toContain('a curious match of form')
  })
})
