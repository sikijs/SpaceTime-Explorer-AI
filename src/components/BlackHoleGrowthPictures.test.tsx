import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { trialPicture } from '../physics/blackHoleGrowth'
import { OBJECT_BUTTON_LABELS, OBJECT_NAMES, TrialDrawing, trialCaption, trialVerdict } from './BlackHoleGrowthPictures'
import { BlackHoleGrowthResults } from './BlackHoleGrowthResults'
import { BlackHoleGrowthClosingQuestion } from './BlackHoleGrowthTutor'

// Cosmic Horizons 23 addendum (2026-11-24), Step 2: Drawing A for a second published object.
const html = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(el).replace(/<!-- -->/g, '')
const drawing = (seed: number, e: number, object: 'capers' | 'dun-aonghasa') => html(createElement(TrialDrawing, { trial: trialPicture(seed, e, object) }))
const caption = (seed: number, e: number, object: 'capers' | 'dun-aonghasa') => html(trialCaption(trialPicture(seed, e, object)) as never)

describe('Drawing A for the two objects', () => {
  it('names the two buttons as approved', () => {
    expect(OBJECT_BUTTON_LABELS.capers).toBe('CAPERS-LRD-z9 (the object above)')
    expect(OBJECT_BUTTON_LABELS['dun-aonghasa']).toBe('Dún Aonghasa (a quasar, 2026)')
    expect(OBJECT_NAMES.capers).toBe('CAPERS-LRD-z9')
  })

  it('is unchanged for CAPERS-LRD-z9: its name, the dashed Picture 1 line and its legend line', () => {
    const d = drawing(10, 0.1, 'capers')
    expect(d).toContain('CAPERS-LRD-z9')
    expect(d).not.toContain('Dún Aonghasa')
    expect(d).toContain('stroke-dasharray="5 4"')
    expect(d).toContain('dashed cyan line')
    expect(d).toContain('38 million Suns')
  })

  it('uses Dún Aonghasa, its mass and its age, with no CAPERS-LRD-z9 and no dashed Picture 1 line', () => {
    const d = drawing(1e5, 0.1, 'dun-aonghasa')
    expect(d).toContain('Dún Aonghasa')
    expect(d).not.toContain('CAPERS-LRD-z9')
    expect(d).not.toContain('stroke-dasharray="5 4"')
    expect(d).not.toContain('dashed cyan line')
    expect(d).toContain('360 million Suns')
    expect(d).toContain('YOUR TRIAL SEED')
  })

  it('gives the right verdict for the second object: 1,000 Suns too late, 100,000 Suns in time', () => {
    expect(drawing(1e3, 0.1, 'dun-aonghasa')).toContain('too late')
    expect(drawing(1e5, 0.1, 'dun-aonghasa')).toContain('in time')
  })

  it('the caption follows the chosen object and drops the Picture 1 items for the second one', () => {
    const c = caption(1e5, 0.1, 'capers')
    expect(c).toContain('dashed cyan line')
    const d = caption(1e5, 0.1, 'dun-aonghasa')
    expect(d).toContain('Dún Aonghasa')
    // CAPERS-LRD-z9 is named once only, in the approved sentence that says it is farther.
    expect((d.match(/CAPERS-LRD-z9/g) ?? []).length).toBe(1)
    expect(d).not.toContain('dashed cyan line')
    expect(d).not.toContain('Picture 1’s black hole')
    expect(d).toContain('8.13')
    expect(c).toContain('9.288')
    // No empty bullet where the Picture 1 item was left out.
    expect(d).not.toContain('<li></li>')
    expect((d.match(/<li>/g) ?? []).length).toBe((c.match(/<li>/g) ?? []).length) // one bullet out (Picture 1), one in ("About this object")
  })
})

describe('the approved wording of Step 3', () => {
  const verdict = (seed: number, e: number, object: 'capers' | 'dun-aonghasa') => html(createElement('div', null, trialVerdict(trialPicture(seed, e, object))))

  it('says the verdict in one sentence for Dún Aonghasa, with the module\'s numbers, and the trial-values line', () => {
    const fits = verdict(1e5, 0.1, 'dun-aonghasa')
    expect(fits).toContain('At the limit, a seed of 100,000 Suns takes about 410 million years to reach 360 million Suns.')
    expect(fits).toContain('The universe had about 524 million years. It fits.')
    expect(fits).toContain('These are trial values and do not say the real black hole started like this.')
    const late = verdict(1e3, 0.1, 'dun-aonghasa')
    expect(late).toContain('a seed of 1,000 Suns takes about 640 million years')
    expect(late).toContain('It does not fit.')
  })

  it('adds nothing under Drawing A for CAPERS-LRD-z9', () => {
    expect(verdict(10, 0.1, 'capers')).toBe('<div></div>')
  })

  it('the caption says Dún Aonghasa is the most distant quasar and CAPERS-LRD-z9 is farther, only for Dún Aonghasa', () => {
    const d = caption(1e5, 0.1, 'dun-aonghasa')
    expect(d).toContain('the most distant <em>quasar</em> found so far (ESA, 24 November 2026)')
    expect(d).toContain('It is not the most distant black hole: CAPERS-LRD-z9 is farther.')
    expect(d).toContain('ESA’s figure from Webb. No range is given on the page read.')
    const c = caption(1e5, 0.1, 'capers')
    expect(c).not.toContain('most distant')
    expect(c).not.toContain('About this object')
  })

  it('the results card has the new Open line about slow feeding and the shortest time', () => {
    const r = html(createElement(BlackHoleGrowthResults, { timeGuess: null, seedGuess: null }))
    expect(r).toContain('ESA says Dún Aonghasa feeds at a relatively slow rate')
    expect(r).toContain('gives the <em>shortest</em> time it could have taken. How it grew so fast is not settled.')
  })
})

describe('the tutor question added in Step 4', () => {
  it('asks the approved question once and gives no verdict', () => {
    const q = html(createElement(BlackHoleGrowthClosingQuestion))
    expect(q).toContain('Dún Aonghasa feeds slowly today. What does that do to the number of years the growth needed?')
    for (const word of ['right', 'wrong', 'correct', 'matched', 'shorter', 'longer', 'more years', 'fewer years']) expect(q).not.toContain(word)
  })
})

describe('the ESA link of Step 5', () => {
  it('is in the results list, opens in a new tab and says what the learner will find', () => {
    const r = html(createElement(BlackHoleGrowthResults, { timeGuess: null, seedGuess: null }))
    expect(r).toContain('href="https://www.esa.int/articles/about-us/directorates/science/euclid/euclid-breaks-own-quasar-record-by-40-million-years"')
    expect(r).toContain('the source of the redshift of 8.13')
    expect(r).toContain('The paper behind the release could not be read for this page.')
    expect(r).not.toContain('aanda.org')
  })
})
