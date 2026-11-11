import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runTwinParadoxExperiment } from '../physics/twinParadoxExperiment'
import type { TwinOutcome } from '../physics/twinParadoxExperiment'
import { Experiment10 } from './Experiment10'
import { Experiment10Explanation, Experiment10Tutor } from './Experiment10Tutor'
import { TwinBars, TwinBarsCaption } from './Experiment10Pictures'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess marker appears exactly when a guess is
// given and the trip has ended. They do not check how the page looks.
const SPEEDS = [0.01, 0.1, 0.3, 0.5, 0.8, 0.9]
const GUESSES: TwinOutcome[] = ['sameAge', 'earthOlder', 'travelerOlder']

describe('Relativity 10 renders', () => {
  it('the page at rest shows Part 1, the words box, the links with a spoiler warning and Start over, but no later Part, no marker and no answer', () => {
    const html = renderToStaticMarkup(createElement(Experiment10, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('Spoiler warning:')
    expect(html).toContain('https://www.einstein-online.info/en/spotlight/twins/')
    expect(html).toContain('https://www.einstein-online.info/en/spotlight/twinsroad/')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('Start over')
    expect(html).not.toContain('CALCULATE')
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS (a marker only)')
    expect(html).not.toContain('The gap:')
    expect(html).not.toContain('NaN')
  })

  it('Start over is greyed out at rest, and Run is disabled until a guess is chosen', () => {
    const html = renderToStaticMarkup(createElement(Experiment10, {}))
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('the introduction has the expanded daily-life picture, and chapter titles instead of numbers', () => {
    const html = renderToStaticMarkup(createElement(Experiment10, {}))
    for (const text of [
      'Steady motion can&#x27;t be felt',
      'A change of speed or direction can be felt',
      'What the push is not.',
      'The tutor explains how, after your run.',
      'A familiar version.',
      'What breaks the tie.',
      'Your guess and the real picture.',
    ]) {
      expect(html.replace(/&rsquo;|’/g, '&#x27;')).toContain(text)
    }
    expect(html).not.toContain('Experiment 3')
    expect(html).not.toContain('Experiments 3')
  })

  it('the words box gives no answer: its examples use 0.4c and 0.6c, not the Part 1 totals', () => {
    const html = renderToStaticMarkup(createElement(Experiment10, {}))
    expect(html).toContain('2 × 2 ÷ 0.4 = 10 s')
    expect(html).not.toContain('6.928')
    expect(html).not.toContain('1.072')
  })

  it('the bars label every part and the numbers come from the run, at every speed, with no NaN', () => {
    SPEEDS.forEach((v) => {
      const r = runTwinParadoxExperiment(2, v)
      const html = renderToStaticMarkup(createElement(TwinBars, { result: r, fraction: 1, guess: null, pink: false, label: 'x' }))
      for (const text of ['clock (stays home)', 'clock (goes and returns)', 'Trip starts', 'Trip ends: the twins meet again', 'The gap:', `${r.labElapsedTime.toFixed(3)} s`, `${r.travelerElapsedTime.toFixed(3)} s`]) {
        expect(html).toContain(text)
      }
      expect(html).not.toContain('NaN')
    })
  })

  it('the gap and the white marker appear only when the trip has ended, and the marker only with a guess', () => {
    const r = runTwinParadoxExperiment(2, 0.5)
    const during = renderToStaticMarkup(createElement(TwinBars, { result: r, fraction: 0.5, guess: 'earthOlder', pink: false, label: 'x' }))
    expect(during).not.toContain('The gap:')
    expect(during).not.toContain('YOUR GUESS')
    const noGuess = renderToStaticMarkup(createElement(TwinBars, { result: r, fraction: 1, guess: null, pink: false, label: 'x' }))
    expect(noGuess).not.toContain('YOUR GUESS')
    GUESSES.forEach((g) => {
      const html = renderToStaticMarkup(createElement(TwinBars, { result: r, fraction: 1, guess: g, pink: false, label: 'x' }))
      expect(html).toContain('YOUR GUESS (a marker only):')
      expect(html).not.toContain('NaN')
    })
  })

  it('the guess never changes a bar or a number: only the marker differs between guesses', () => {
    const r = runTwinParadoxExperiment(2, 0.5)
    const strip = (g: TwinOutcome | null) =>
      renderToStaticMarkup(createElement(TwinBars, { result: r, fraction: 1, guess: g, pink: false, label: 'x' }))
        .replace(/<g>(?:(?!<\/g>).)*YOUR GUESS(?:(?!<\/g>).)*<\/g>/s, '')
    expect(strip('sameAge')).toBe(strip('earthOlder'))
    expect(strip('earthOlder')).toBe(strip('travelerOlder'))
  })

  it('Part 2 uses pink for the learner’s speed and carries no white marker', () => {
    const r = runTwinParadoxExperiment(2, 0.8)
    const html = renderToStaticMarkup(createElement(TwinBars, { result: r, fraction: 1, guess: null, pink: true, label: 'x' }))
    expect(html).toContain('#f472b6')
    expect(html).toContain('AT YOUR SPEED: 0.8c')
    expect(html).not.toContain('YOUR GUESS')
  })

  it('the caption gives no numbers before the trip ends, and the worked moment and look-fors after', () => {
    const r = runTwinParadoxExperiment(2, 0.5)
    const before = renderToStaticMarkup(createElement(TwinBarsCaption, { name: 'this diagram', result: r, stage: 'before', guesses: true, pink: false }))
    expect(before).toContain('How to read this diagram')
    expect(before).not.toContain('6.928')
    expect(before).not.toContain('A worked moment')
    expect(before).not.toContain('Look at:')
    const done = renderToStaticMarkup(createElement(TwinBarsCaption, { name: 'this diagram', result: r, stage: 'done', guesses: true, pink: false }))
    expect(done).toContain('A worked moment')
    expect(done).toContain('8.000')
    expect(done).toContain('6.928')
    expect(done).toContain('1.072')
    expect(done).toContain('Look at:')
    expect(done).toContain('What it means:')
    expect(done).toContain('Why it matters:')
  })

  it('the tutor names the marker and the bars, marks the guess with no score, and uses numbers from the module', () => {
    const r = runTwinParadoxExperiment(2, 0.5)
    GUESSES.forEach((g) => {
      const html = renderToStaticMarkup(createElement(Experiment10Tutor, { result: r, guess: g }))
      expect(html).toContain('Look at the two bars')
      expect(html).not.toContain('NaN')
      expect(html).not.toMatch(/right|wrong|score/i)
    })
  })
})

describe('Relativity 10 tutor explanation', () => {
  it('shows the steps 3 to 6 with numbers from the module, and the pointer from the introduction matches', () => {
    const r = runTwinParadoxExperiment(2, 0.5)
    GUESSES.forEach((g) => {
      const html = renderToStaticMarkup(createElement(Experiment10Explanation, { result: r, guess: g }))
      for (const text of [
        '3. A clock counts its own path.',
        '4. Why the Earth twin',
        'there is no acceleration in it.',
        'does not change the traveling twin',
        '5. Why the traveling twin can',
        '6. That is what resolves the paradox.',
        '7. Nothing new happened',
        '8. Your guess, marked.',
        '9. Try it in Part 2.',
        '8 s',
        '8.000 × 0.866 = 6.928 s',
        '2 ÷ 0.5 = 4 s',
      ]) {
        expect(html.replace(/&#x27;/g, "'").replace(/<!-- -->/g, '')).toContain(text)
      }
      expect(html).not.toContain('NaN')
      expect(html).not.toMatch(/\bwrong\b|\bscore\b/i)
    })
  })

  it('the explanation does not use the optional jump check the owner left out', () => {
    const html = renderToStaticMarkup(createElement(Experiment10Explanation, { result: runTwinParadoxExperiment(2, 0.5), guess: 'earthOlder' }))
    expect(html).not.toContain('2.000 s is exactly the jump')
    expect(html).not.toContain('radar')
  })
})
