import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { eventComparison, eventRunSummary } from '../physics/gravitationalWaveRealEventsExperiment'
import type { LouderChoice } from '../physics/gravitationalWaveRealEventsExperiment'
import { ComparisonPicture, EventArms, GravitationalWaveRealEventsExperiment } from './GravitationalWaveRealEventsExperiment'
import { GravitationalWaveRealEventsTutor } from './GravitationalWaveRealEventsTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess mark appears exactly when both events
// have run. They do not check how the page looks.
const CHOICES: LouderChoice[] = ['black-holes', 'neutron-stars', 'same']
const MASSES = [0.2, 0.3, 2, 5.5, 6]

const picture = (props: { bothDone: boolean; guess: LouderChoice | null; yourMass: ReturnType<typeof eventRunSummary> | null }) =>
  renderToStaticMarkup(createElement(ComparisonPicture, { ...props, label: 'x' }))

describe('the real-events page renders', () => {
  it('the whole page renders at rest: the links, the words box and Part 1 only, with no mark, no formulas, no Start over', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveRealEventsExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).toContain('multi-messenger astronomy')
    expect(html).not.toContain('Part 2: Now try it yourself') // after the first run, not before
    expect(html).not.toContain('What comes next') // the owner removed this box (2026-11-07)
        expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
    expect(html).not.toContain('YOUR GUESS:') // the drawn mark's text; the introduction names the box in words
    expect(html).not.toContain('Change prediction')
    expect(html).toContain('Start over') // always shown (CLAUDE.md, "Start Over, Not Change Prediction"), greyed out until there is something to clear
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*class="secondary-button"[^>]*>Start over/)
    expect(html).not.toContain('Formula: final loudness') // held back until both runs (CLAUDE.md §12)
    expect(html).not.toContain('NaN')
  })

  it('does not give the answer before the learner has predicted: no masses and no "heavier" in the question or the introduction', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveRealEventsExperiment, {}))
    expect(html).not.toContain('tens of times heavier')
    expect(html).not.toContain('only a little heavier')
    expect(html).not.toContain('36 and 29')
    expect(html).not.toContain('29 and 36')
    expect(html).not.toContain('faster and more dramatically')
    expect(html).not.toContain('bigger mass means louder')
    // The toy masses and the black-hole run's numbers come only after the learner has predicted and run (CLAUDE.md §12).
    expect(html).not.toContain('made-up mass of 5.5')
    expect(html).not.toContain('5.500')
    expect(html).not.toContain('0.165')
    expect(html).not.toContain('Amplitude: 0.')
    expect(html).toContain('Amplitude: —')
    // One Run button and two event choices, all disabled until a guess is chosen.
    expect(html.match(/class="action-button" disabled=""/g)?.length).toBe(1)
    expect(html).toContain('GW150914 (the black holes)')
    expect(html).toContain('GW170817 (the neutron stars)')
    expect(html).not.toContain('Run the black holes (GW150914)')
  })

  it('has links with the papers, opening in a new tab', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveRealEventsExperiment, {}))
    for (const url of ['arxiv.org/abs/1602.03837', 'arxiv.org/abs/1710.05832', 'arxiv.org/abs/1710.05833', 'arxiv.org/abs/1602.03920']) {
      expect(html).toContain(url)
    }
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })
})

describe('Picture 2 (the two events side by side)', () => {
  it('draws nothing but a note until both events have run', () => {
    const html = picture({ bothDone: false, guess: 'black-holes', yourMass: null })
    expect(html).toContain('Run the two events to fill this in.')
    expect(html).not.toContain('YOUR GUESS:')
    expect(html).not.toContain('0.522')
  })

  it('fills in as each event runs: one event\'s bars appear alone, with the guess already drawn, and the other\'s follow', () => {
    const only = (shown: { gw150914: boolean; gw170817: boolean }) =>
      renderToStaticMarkup(createElement(ComparisonPicture, { bothDone: false, shown, guess: 'black-holes', yourMass: null, label: 'x' }))
    const first = only({ gw150914: true, gw170817: false })
    expect(first).toContain('0.522')
    expect(first).toContain('0.164')
    expect(first).not.toContain('0.028')
    expect(first).toContain('YOUR GUESS:') // the guess appears with the first bar; the unrun target is a dashed stub
    expect(first).not.toContain('stroke-dasharray') // the marked bar (GW150914) is drawn, so its outline is solid
    expect(first).not.toContain('Run the two events to fill this in.')
    const second = only({ gw150914: false, gw170817: true })
    expect(second).toContain('0.028')
    expect(second).toContain('3.000')
    expect(second).not.toContain('0.522')
    expect(second).toContain('YOUR GUESS:')
    expect(second).toContain('stroke-dasharray') // the marked bar (GW150914) has not run: a dashed stub, no length shown
  })

  it('draws the bars and the white guess mark only once both have run, and the mark follows the guess', () => {
    const marks = new Set<string>()
    for (const guess of CHOICES) {
      const html = picture({ bothDone: true, guess, yourMass: null })
      expect(html).toContain('YOUR GUESS:')
      expect(html).toContain('0.522') // GW150914's final loudness
      expect(html).toContain('0.028') // GW170817's
      expect(html).toContain('0.164')
      expect(html).toContain('3.000')
      expect(html).not.toContain('NaN')
      marks.add(html)
    }
    expect(marks.size).toBe(3) // a different guess gives a visibly different mark
    expect(picture({ bothDone: true, guess: 'black-holes', yourMass: null })).toContain('the black holes made the louder chirp')
    expect(picture({ bothDone: true, guess: 'neutron-stars', yourMass: null })).toContain('the neutron stars made the louder chirp')
    expect(picture({ bothDone: true, guess: 'same', yourMass: null })).toContain('the two would be the same')
  })

  it('draws no guess mark when there is no guess', () => {
    expect(picture({ bothDone: true, guess: null, yourMass: null })).not.toContain('YOUR GUESS:')
  })

  it('adds a pink row for the learner\'s mass at every slider value, with finite numbers, and never changes the real bars', () => {
    const without = picture({ bothDone: true, guess: 'black-holes', yourMass: null })
    for (const mass of MASSES) {
      const run = eventRunSummary(mass)
      const html = picture({ bothDone: true, guess: 'black-holes', yourMass: run })
      expect(html).toContain(`YOUR MASS: ${mass.toFixed(1)}`)
      expect(html).toContain('#f472b6')
      expect(html).toContain(run.finalLoudness.toFixed(3))
      expect(html).toContain(run.runTime.toFixed(3))
      expect(html).not.toContain('NaN')
      expect(html).toContain('0.522')
      expect(html).toContain('0.028')
    }
    expect(without).not.toContain('YOUR MASS')
  })
})

describe('Drawing B after one run (Parts 2 to 4 appear after the first run)', () => {
  it('draws the pink row for the learner\'s mass while only one event has run, and the guess mark already drawn', () => {
    const run = eventRunSummary(3)
    const html = renderToStaticMarkup(
      createElement(ComparisonPicture, { bothDone: false, shown: { gw150914: true, gw170817: false }, guess: 'black-holes', yourMass: run, label: 'x' }),
    )
    expect(html).toContain('YOUR MASS: 3.0')
    expect(html).toContain(run.finalLoudness.toFixed(3))
    expect(html).toContain('0.522') // the event that has run
    expect(html).not.toContain('0.028') // the event that has not
    expect(html).toContain('YOUR GUESS:') // the guess appears after the first run
    expect(html).not.toContain('NaN')
  })
})

describe('Picture 1 and Drawing A (the arms and the source)', () => {
  it('label the source for each kind and render at rest and at the final moment for every mass', () => {
    for (const mass of MASSES) {
      const run = eventRunSummary(mass)
      for (const started of [false, true]) {
        const html = renderToStaticMarkup(createElement(EventArms, { mass, time: run.runTime, started, kind: 'custom', label: 'x' }))
        expect(html).toContain('the source: a pair of your mass')
        expect(html).not.toContain('NaN')
      }
    }
    const bh = renderToStaticMarkup(createElement(EventArms, { mass: 5.5, time: 0, started: false, kind: 'gw150914', label: 'x' }))
    const ns = renderToStaticMarkup(createElement(EventArms, { mass: 0.3, time: 0, started: false, kind: 'gw170817', label: 'x' }))
    expect(bh).toContain('the source: two black holes')
    expect(ns).toContain('the source: two neutron stars')
    expect(bh).toContain('Arm X')
    expect(bh).toContain('Arm Y')
  })
})

describe('the tutor', () => {
  it('first prompt does not give the answer, and the compare prompt names the white mark and gives no verdict', () => {
    for (const guess of CHOICES) {
      const html = renderToStaticMarkup(createElement(GravitationalWaveRealEventsTutor, { louderPrediction: guess, matched: false, bothDone: true }))
      expect(html).toContain('What did you notice about this chirp')
      expect(html).not.toContain('In fact')
      expect(html).not.toContain('always do')
    }
  })
})

describe('the tutor waits for both events', () => {
  it('shows a plain note instead of the comparison until both have run, and the first question is always available', () => {
    const first = renderToStaticMarkup(createElement(GravitationalWaveRealEventsTutor, { louderPrediction: 'same', matched: false, bothDone: false }))
    expect(first).toContain('What did you notice about this chirp')
    expect(first).not.toContain('needs both of them') // the note appears only where the explanation would be
  })

  it('gives the explanation, with the numbers, only when both have run', () => {
    // Static markup shows only the first step, so check the module-driven numbers the explanation uses are the ones drawn.
    const { blackHoles, neutronStars } = eventComparison()
    expect(blackHoles.finalLoudness.toFixed(3)).toBe('0.522')
    expect(neutronStars.finalLoudness.toFixed(3)).toBe('0.028')
  })
})
