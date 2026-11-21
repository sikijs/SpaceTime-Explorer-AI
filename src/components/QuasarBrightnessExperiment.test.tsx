import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BRIGHTNESS_CHOICES_SOLAR, FUEL_CHOICES, PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN, RATIO_CHOICES, SPIN_CHOICES, WIDTH_CHOICES, runQuasarExperiment } from '../physics/quasarBrightness'
import { QuasarBrightnessExperiment, QuasarResultTable, formatNumber, formatPercent, formatSuns } from './QuasarBrightnessExperiment'
import { fuelLabel, ratioLabel, widthLabel } from './QuasarBrightnessFormat'

// Render checks only (no browser): the page draws, shows its controls and no "NaN", and the table shows the physics module's numbers.
// They do not check how the page looks, and they cannot press buttons (the project has no browser test tool): the locking of the guesses, Run and Start over
// are checked in Chrome (CLAUDE.md §28.4). Step 4 has no results guide or tutor to check yet.

describe('Black Holes 11 (quasars), Step 4 renders (first screen)', () => {
  const html = renderToStaticMarkup(createElement(QuasarBrightnessExperiment, {}))

  it('the first screen has Part 1, the three questions with five answers each, a disabled Run and a visible but disabled Start over', () => {
    expect(html).toContain('Black Holes 11: Why Do Quasars Outshine Galaxies?')
    expect(html).toContain('Part 1: Predict, then watch')
    for (const q of ['Question 1.', 'Question 2.', 'Question 3.']) expect(html).toContain(q)
    for (const c of RATIO_CHOICES) expect(html).toContain(ratioLabel(c.id))
    for (const c of WIDTH_CHOICES) expect(html).toContain(widthLabel(c.id))
    for (const c of FUEL_CHOICES) expect(html).toContain(fuelLabel(c.id))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toContain('Answer all three questions to run.')
    expect(html).not.toContain('Change prediction')
  })

  it('Parts 2, 3 and 4, the pictures, the white marks and the controls are not there before the first Run, and a note says so', () => {
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('No spin (0)')
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('<table')
    expect(html).toContain('appear after your first run')
    expect(html).not.toContain('NaN')
  })

  it('tells the learner that the guesses never change the real pictures and are drawn on them in white', () => {
    expect(html).toContain('never change with your guesses')
    expect(html).toContain('in white')
    expect(html).toContain('locked')
  })

  it('the table shows the module\'s numbers for 3C 273 with no spin', () => {
    const r = runQuasarExperiment(PART_ONE_LUMINOSITY_SOLAR, PART_ONE_SPIN)
    const html = renderToStaticMarkup(createElement(QuasarResultTable, { result: r }))
    expect(html).toContain('4 trillion Suns')
    expect(html).toContain('5.7 percent')
    expect(html).toContain('0.71 percent')
    expect(html).toContain(`${formatNumber(r.infallSolarMassesPerYear)} Suns a year`)
    expect(html).toContain(`${formatNumber(r.fusionSolarMassesPerYear)} Suns a year`)
    expect(html).toContain('4.73 Suns a year')
    expect(html).toContain('38.08 Suns a year')
    expect(html).toContain('7 days')
    expect(html).not.toContain('NaN')
  })

  it('every brightness and spin the page offers gives a table with no NaN and no "not available"', () => {
    for (const spin of SPIN_CHOICES) {
      for (const L of [PART_ONE_LUMINOSITY_SOLAR, ...BRIGHTNESS_CHOICES_SOLAR]) {
        const html = renderToStaticMarkup(createElement(QuasarResultTable, { result: runQuasarExperiment(L, spin) }))
        expect(html).not.toContain('NaN')
        expect(html).not.toContain('not available')
        expect(html).not.toContain('Infinity')
      }
    }
  })

  it('the number helpers write plain words and sensible digits', () => {
    expect(formatSuns(4e12)).toBe('4 trillion Suns')
    expect(formatSuns(1e10)).toBe('10 billion Suns')
    expect(formatSuns(2.5e5)).toBe('250,000 Suns')
    expect(formatNumber(4.7345)).toBe('4.73')
    expect(formatNumber(0.6384)).toBe('0.64')
    expect(formatNumber(1212.01)).toBe('1,212')
    expect(formatNumber(5_217_840)).toBe('5,217,840')
    expect(formatNumber(Number.NaN)).toBe('not available')
    expect(formatPercent(0.0572)).toBe('5.7 percent')
    expect(formatPercent(0.0071)).toBe('0.71 percent')
  })
})
