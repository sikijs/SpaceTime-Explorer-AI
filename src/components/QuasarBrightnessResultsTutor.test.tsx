import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FUEL_CHOICES, PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN, RATIO_CHOICES, WIDTH_CHOICES, checkUp, fuelAnswer, markGuesses, ratioAnswer, runQuasarExperiment, widthAnswer } from '../physics/quasarBrightness'
import { formatNumber } from './QuasarBrightnessFormat'
import { QuasarBrightnessResults } from './QuasarBrightnessResults'
import { QuasarBrightnessTutor } from './QuasarBrightnessTutor'

// Render checks only (no browser): the tables show the physics module's numbers, no guess is marked right or wrong in Part 3, the guesses appear beside the
// results with their tags, and the tutor marks the guesses only in its explanation. Pressing the tutor's buttons is checked in Chrome (CLAUDE.md §28.4).

const run = runQuasarExperiment(PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN)
const guesses = { ratioGuess: 'same', widthGuess: 'tenth', fuelGuess: 'twentieth' } as const
const results = renderToStaticMarkup(createElement(QuasarBrightnessResults, guesses))

describe('Part 3: the results', () => {
  it('has the check-up table, the two tables and a "What this table tells us" note under each', () => {
    expect(results).toContain('Table 1: A check-up against published values')
    expect(results).toContain('Table 2: The numbers behind the three pictures')
    expect(results.match(/What this table tells us/g)?.length).toBe(2)
    expect(results).not.toContain('NaN')
  })

  it('shows one row for every check in the module, with a plain reading and no invented cut-off word', () => {
    expect(checkUp().length).toBe(6)
    for (const word of ['the same', 'less by about', 'more by about']) expect(results).toContain(word)
    for (const word of ['healthy', 'normal', 'abnormal', 'close enough']) expect(results).not.toContain(word)
  })

  it('Table 2 shows the module\'s numbers for 3C 273 with no spin, and a white tag on each guess row', () => {
    expect(results).toContain(`about ${formatNumber(run.ratioToMilkyWay)} times`)
    expect(results).toContain(`about ${formatNumber(run.infallSolarMassesPerYear)} Suns a year`)
    expect(results).toContain(`about ${formatNumber(run.fusionSolarMassesPerYear)} Suns a year`)
    expect(results).toContain('about 1 part in 5,217,')
    for (const n of [1, 2, 3]) expect(results).toContain(`your guess ${n}`)
  })

  it('shows every possible guess, beside the results, and never says right, wrong or matched', () => {
    for (const r of RATIO_CHOICES) for (const w of WIDTH_CHOICES) {
      for (const f of FUEL_CHOICES) {
        const html = renderToStaticMarkup(createElement(QuasarBrightnessResults, { ratioGuess: r.id, widthGuess: w.id, fuelGuess: f.id }))
        expect(html).not.toContain('NaN')
        expect(html).not.toMatch(/\b(wrong|matched|off this time)\b/i)
        expect(html).toContain('Your guesses, beside the results')
      }
    }
  })

  it('the tables do not change with the guesses', () => {
    const a = renderToStaticMarkup(createElement(QuasarBrightnessResults, { ratioGuess: 'ten', widthGuess: 'billionth', fuelGuess: 'fifty' }))
    const strip = (html: string) => html.slice(html.indexOf('Table 1:'))
    expect(strip(a)).toBe(strip(results))
  })
})

describe('Part 4: the tutor', () => {
  const html = renderToStaticMarkup(createElement(QuasarBrightnessTutor, { ...guesses, matches: markGuesses({ ratio: 'same', width: 'tenth', fuel: 'twentieth' }) }))

  it('starts with the observe question, which names the white marks, and does not mark anything yet', () => {
    expect(html).toContain('white YOUR GUESS marks')
    expect(html).toContain('Continue')
    expect(html).not.toContain('Your guess 1:')
    expect(html).not.toContain('off this time')
  })

  it('no explanation is shown before the three questions are answered', () => {
    expect(html).not.toContain('One point of light')
  })

  it('the module marks the guesses the tutor will show', () => {
    expect(markGuesses({ ratio: ratioAnswer(), width: widthAnswer(), fuel: fuelAnswer() })).toEqual({ ratio: true, width: true, fuel: true })
  })
})
