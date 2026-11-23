import { createElement } from 'react'
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runSky } from '../physics/aberration'
import type { SidewaysGuess } from '../physics/aberration'
import { AberrationExperiment, SkyPair, SkyPicture, stageOf } from './AberrationExperiment'
import { AberrationLinks, REFERENCE_ENTRIES, FORMULA_ENTRIES } from './AberrationIntro'
import { AberrationResults } from './AberrationResults'
import { AberrationExplanation, AberrationTutor } from './AberrationTutor'
import { RayPushDrawing } from './AberrationPushDrawing'

// Render checks only (no browser): Experiment 7 after the audit of 2026-11-23. Pressing Run, the playback, the locking and Start over are checked in Chrome.

const GUESSES: SidewaysGuess[] = ['same', 'ahead', 'behind']
const SPEED = 0.6
const sky = runSky(SPEED)
const travelerAngles = sky.stars.map((s) => s.travelerAngle)
// Stars drawn after `steps` of the 13 build-up steps: star i is drawn when min(i, 24 - i) < steps.
const starsAt = (steps: number) => travelerAngles.map((a, i) => (Math.min(i, 24 - i) < steps ? a : null))
const picture = (steps: number, guess: SidewaysGuess | null) =>
  renderToStaticMarkup(
    createElement(SkyPicture, {
      title: 'The traveler’s sky',
      color: '#c4b5fd',
      stars: starsAt(steps),
      showWedges: false,
      frontCount: null,
      backCount: null,
      followAngle: sky.sidewaysStarTravelerAngle,
      rays: [],
      shipOffset: 0,
      idSuffix: 'test',
      guess,
    }),
  )
// A progress value inside the run at which `steps` build-up steps are shown.
const progressFor = (steps: number) => 0.15 + 0.7 * ((steps - 0.5) / 13)
const pair = (steps: number, guess: SidewaysGuess | null, own = false) =>
  renderToStaticMarkup(createElement(SkyPair, { speed: SPEED, status: 'running', progress: progressFor(steps), guess, own }))
const count = (html: string, text: string) => (html.match(new RegExp(text, 'g')) ?? []).length

describe('the first screen, before any Run', () => {
  const html = renderToStaticMarkup(createElement(AberrationExperiment))

  it('has the new title and Part 1 only, with no Parts 2 to 4', () => {
    expect(html).toContain('Does Your Motion Change Where a Star Appears?')
    expect(html).not.toContain('Experiment 7 — Aberration')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).not.toContain('Part 2: Now try it yourself')
    expect(html).not.toContain('Part 3: The results')
    expect(html).not.toContain('Part 4: The tutor')
  })

  it('has Start over (disabled) and Run (disabled), and no Change prediction button', () => {
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Run<\/button>/)
    expect(html).not.toContain('Change prediction')
  })

  it('says that predictions never change the pictures or tables, and that the guess is drawn in white', () => {
    expect(html).toContain('Your prediction never changes the pictures or the tables.')
    expect(html).toContain('drawn on the traveler’s sky in white')
  })

  it('draws no guess mark and no yellow ring in the traveler’s sky before the run, and no formula in the words box', () => {
    expect(html).not.toMatch(/<text[^>]*>YOUR GUESS<\/text>/)
    // The lab's sky is drawn from the start, with its yellow ring; the traveler's sky has none until its star is drawn.
    expect(count(html, 'the star we follow</text>')).toBe(1)
    expect(html).not.toContain('cos θ′ = (cos θ + β)')
  })

  it('orders the introduction: the question, what happens, some new words, your job, what we assume', () => {
    const at = (text: string) => html.indexOf(text)
    for (const text of ['The question.', 'What happens.', 'Some new words.', 'Your job.', 'What we assume.']) expect(at(text)).toBeGreaterThan(-1)
    expect(at('The question.')).toBeLessThan(at('What happens.'))
    expect(at('What happens.')).toBeLessThan(at('Some new words.'))
    expect(at('Some new words.')).toBeLessThan(at('Your job.'))
    expect(at('Your job.')).toBeLessThan(at('What we assume.'))
  })

  it('does not say which way the stars shift in the introduction (the prediction, §12)', () => {
    const intro = html.slice(html.indexOf('The question.'), html.indexOf('Part 1: Predict, then watch'))
    expect(intro).not.toMatch(/toward the front|crowd|bunch|ahead of sideways|squeez/i)
  })

  it('names the speed 0.6c in the question and has the words box above the links', () => {
    expect(html).toContain('0.6c</strong>')
    expect(html.indexOf('Words and formulas')).toBeGreaterThan(-1)
    expect(html.indexOf('Words and formulas')).toBeLessThan(html.indexOf('Want to know more?'))
    expect(html.indexOf('Want to know more?')).toBeLessThan(html.indexOf('Part 1: Predict, then watch'))
  })
})

describe('the white guess mark', () => {
  it('is not drawn before the star we follow is drawn (step 6), and appears with it (step 7)', () => {
    for (const guess of GUESSES) {
      expect(picture(6, guess)).not.toContain('>YOUR GUESS<')
      expect(picture(6, guess)).not.toContain('the star we follow')
      expect(picture(7, guess)).toContain('>YOUR GUESS<')
      expect(picture(7, guess)).toContain('the star we follow')
    }
  })

  it('is not drawn without a guess', () => {
    expect(picture(13, null)).not.toContain('>YOUR GUESS<')
  })

  it('follows the guess: a ring for "same", an arrow for "ahead" and "behind" in different directions', () => {
    const same = picture(13, 'same')
    const ahead = picture(13, 'ahead')
    const behind = picture(13, 'behind')
    expect(new Set([same, ahead, behind]).size).toBe(3)
    expect(same).toContain('exactly sideways')
    expect(same).not.toContain('marker-end="url(#aberration-guess-test)"')
    expect(ahead).toContain('ahead of sideways')
    expect(ahead).toContain('marker-end="url(#aberration-guess-test)"')
    expect(behind).toContain('behind sideways')
    expect(behind).toContain('marker-end="url(#aberration-guess-test)"')
  })

  it('says nothing like right, wrong or matched', () => {
    for (const guess of GUESSES) {
      const html = picture(13, guess)
      expect(html).not.toMatch(/\bwrong\b|matched|correct|not right|was right/i)
    }
  })
})

describe('the lab observer in the lab’s sky', () => {
  const html = pair(7, 'ahead')
  it('draws and labels the lab observer, at rest, in the lab’s sky only', () => {
    expect(count(html, 'lab observer \\(at rest\\)</text>')).toBe(1)
    expect(html).toContain('traveler’s direction of travel</text>')
    expect(picture(7, 'ahead')).not.toContain('lab observer (at rest)')
  })

  it('says in the caption that the lab observer is at rest and that the spaceship and arrow are the traveler', () => {
    expect(html).toContain('lab observer is at rest')
    expect(html).toContain('not</strong> the lab observer')
    expect(html).toContain('every angle in both pictures is measured from it')
  })
})

describe('the caption, built up in stages', () => {
  it('shows the look-for items only once their feature is drawn, in three parts', () => {
    expect(pair(0, 'ahead')).not.toContain('Look at:')
    expect(pair(1, 'ahead')).toContain('the dots in the two pictures')
    expect(pair(1, 'ahead')).not.toContain('the yellow ring in each picture')
    const seven = pair(7, 'ahead')
    expect(seven).toContain('the yellow ring in each picture')
    expect(seven).toContain('your white mark and the yellow ring')
    expect(seven).not.toContain('the two stars straight ahead (0°) and straight behind (180°)')
    expect(count(seven, 'Look at:')).toBe(count(seven, 'What it means:'))
    expect(count(seven, 'Look at:')).toBe(count(seven, 'Why it matters:'))
    expect(pair(13, 'ahead')).toContain('the two stars straight ahead (0°) and straight behind (180°)')
  })

  it('gives the worked moment with real numbers only once the star is drawn', () => {
    expect(pair(6, 'ahead')).not.toContain('53.1°')
    expect(pair(7, 'ahead')).toContain('53.1°')
    expect(pair(7, 'ahead')).toContain('36.9° less than 90°')
  })

  it('has the white-mark bullet and "Where the real picture comes from", and says the arrow is only a direction', () => {
    const html = pair(7, 'ahead')
    expect(html).toContain('The white mark and the YOUR GUESS box')
    expect(html).toContain('only shows a direction')
    expect(html).toContain('Where the real picture comes from')
    expect(html).toContain('Imagined for the question')
  })

  it('has no guess bullet, mark or guess look-for item for the learner’s own speed (Part 2)', () => {
    const html = pair(13, 'ahead', true)
    expect(html).not.toContain('>YOUR GUESS<')
    expect(html).not.toContain('The white mark and the YOUR GUESS box')
    expect(html).not.toContain('your white mark and the yellow ring')
  })

  it('shows the wedge counts item only once the counts are drawn', () => {
    expect(stageOf('running', progressFor(13)).showCounts).toBe(false)
    expect(pair(13, 'ahead')).not.toContain('the numbers beside the striped and dotted wedges')
    const done = renderToStaticMarkup(createElement(SkyPair, { speed: SPEED, status: 'complete', progress: 1, guess: 'ahead' }))
    expect(done).toContain('the numbers beside the striped and dotted wedges')
    expect(done).toContain('at 0.6c the lab counts 5 and 5, and the traveler counts 7 and 3')
  })
})

describe('Part 3, the results', () => {
  const html = (guess: SidewaysGuess) => renderToStaticMarkup(createElement(AberrationResults, { speed: SPEED, guess, bars: createElement('div', null, 'BARS') }))

  it('has the check-up with five rows, all read as "the same"', () => {
    const h = html('ahead')
    expect(h).toContain('The check-up')
    expect(count(h, '>the same<')).toBe(5)
    expect(h).toContain('largest difference 0.0°')
    expect(h).toContain('order unchanged')
  })

  it('has a "What this table tells us" note under the check-up, the angles, the counts and the bars, each with what it is, what it means and why it matters', () => {
    const h = html('ahead')
    expect(count(h, 'What this table tells us')).toBe(4)
    expect(count(h, 'What it is:')).toBe(4)
    expect(count(h, 'What it means with the real numbers:')).toBe(4)
    expect(count(h, 'Why it matters:')).toBe(4)
  })

  it('carries the real numbers of 0.6c and the worked check', () => {
    const h = html('ahead')
    expect(h).toContain('The traveler sees it at 53.1°')
    expect(h).toContain('cos θ′ = (0 + 0.6) ÷ (1 + 0) = 0.6')
    expect(h).toContain('0.800')
  })

  it('shows the guess beside the results with one tag, and never says right, wrong or matched', () => {
    for (const guess of GUESSES) {
      const h = html(guess)
      expect(count(h, '>your guess<')).toBe(1)
      expect(h).toContain('Your guess, beside the results')
      expect(h).not.toMatch(/matched|wrong|not right/i)
    }
  })

  it('has real results that are identical for every guess apart from the guess block and tag', () => {
    const strip = (h: string) => h.replace(/You guessed:.*?Your guess never changes any number on this page\./, '')
    expect(strip(html('same'))).toBe(strip(html('ahead')))
    expect(strip(html('behind'))).toBe(strip(html('ahead')))
  })
})

describe('Part 4, the tutor', () => {
  it('begins with an observe prompt that names the white mark', () => {
    const h = renderToStaticMarkup(createElement(AberrationTutor, { speed: SPEED, predicted: 'ahead' }))
    expect(h).toContain('the white YOUR GUESS mark on the traveler’s sky')
  })
})

describe('the cause, in the tutor’s explanation (audit of 2026-11-23)', () => {
  const explanation = (guess: SidewaysGuess = 'ahead', speed = SPEED) => renderToStaticMarkup(createElement(AberrationExplanation, { speed, predicted: guess }))

  it('is not in the first three tutor steps, only in the explanation', () => {
    const first = renderToStaticMarkup(createElement(AberrationTutor, { speed: SPEED, predicted: 'ahead' }))
    expect(first).not.toContain('The same ray of starlight')
    expect(first).not.toContain('Turning the push round')
    expect(explanation()).toContain('The same ray of starlight')
  })

  it('walks through items 0 to 9 in order, with the new items 2 to 5', () => {
    const h = explanation()
    let last = -1
    for (const heading of ['0. Your guess, marked', '1. What the results show', '2. What each observer measures', '3. The lab’s numbers', '4. What the traveler’s motion does', '5. Turning the push round', 'Why the rain rule is close but not right', '6. Why two stars do not move', '7. The light clock again', '8. A real example', '9. What was shown, and what was not']) {
      const at = h.indexOf(heading)
      expect(at, heading).toBeGreaterThan(last)
      last = at
    }
  })

  it('carries the real numbers at 0.6c: D 0.800, push 0.750, energy 1.250, 53.1°, rain rule 59.0°', () => {
    const h = explanation()
    for (const text of ['D = 0.800', '0.6 ÷ 0.800 = 0.750', '1 ÷ 0.800 = 1.250', 'They agree', '= 53.1°', '59.0°', '0.314 against 0.3', '2.065 against 0.9', '25.8° and 48.0°']) expect(h, text).toContain(text)
  })

  it('keeps the one-line formula and the statement that neither measurement is the real direction', () => {
    const h = explanation()
    expect(h).toContain('cos θ′ = (cos θ + 0.6) ÷ (1 + 0.6 × cos θ)')
    expect(h).toContain('Neither measurement is the “real” direction')
  })

  it('marks the guess in the explanation only, right for "ahead" and not right for the others', () => {
    expect(explanation('ahead')).toContain('<strong>right</strong>')
    expect(explanation('same')).toContain('not right this time')
    expect(explanation('behind')).toContain('not right this time')
  })

  it('draws both panels with the real numbers, three look-for items, a source line and no white', () => {
    const h = renderToStaticMarkup(createElement(RayPushDrawing, { speed: SPEED }))
    for (const text of ['The lab’s measurement', 'The traveler’s measurement at 0.6c', 'across: 1', 'along: 0.750', 'toward the back (new)', '53.1°', '90.0°']) expect(h, text).toContain(text)
    expect(count(h, 'Look at:')).toBe(3)
    expect(count(h, 'What it means:')).toBe(3)
    expect(count(h, 'Why it matters:')).toBe(3)
    expect(h).toContain('Where the real picture comes from')
    expect(h).not.toMatch(/#fff\b|#ffffff|white/i)
  })

  it('keeps the drawing inside the page at the fastest speed (the push toward the back is long)', () => {
    const h = renderToStaticMarkup(createElement(RayPushDrawing, { speed: 0.99 }))
    expect(h).toContain('along: 7.018')
    const xs = [...h.matchAll(/ x2="(-?[\d.]+)"/g)].map((m) => Number(m[1]))
    for (const x of xs) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(650)
    }
  })
})

describe('the chapter summary and the words box (the cause)', () => {
  it('has the cause sentence in the summary', () => {
    const app = readFileSync('src/App.tsx', 'utf8')
    expect(app).toContain('The cause is that a moving observer finds a different push from the light along the line of travel, while the push across it stays the same')
  })

  it('has a push entry and the rain rule entry only in the entries added after the run', () => {
    expect(REFERENCE_ENTRIES.map((e) => e.term).join(' | ')).not.toContain('Push of a ray')
    expect(FORMULA_ENTRIES.map((e) => e.term).join(' | ')).toContain('Push of a ray of light (its momentum)')
  })
})

describe('the words box and the links', () => {
  it('lists the new terms, and adds the formula and the rain rule only after the run', () => {
    const terms = REFERENCE_ENTRIES.map((e) => e.term).join(' | ')
    for (const word of ['Ray of starlight', 'The star we follow', 'Wedge', 'Arcsecond', 'The number D']) expect(terms).toContain(word)
    expect(terms).not.toContain('rain rule')
    expect(FORMULA_ENTRIES.map((e) => e.term).join(' | ')).toContain('The rain rule')
  })

  it('links the three pages that were read, in new tabs, and no page that was not read', () => {
    const h = renderToStaticMarkup(createElement(AberrationLinks))
    expect(count(h, 'target="_blank"')).toBe(3)
    expect(count(h, 'rel="noopener noreferrer"')).toBe(3)
    for (const url of ['pwg.gsfc.nasa.gov/stargaze/Saberr.htm', 'sci.esa.int/web/gaia/-/measuring-the-acceleration-of-the-solar-system-with-gaia', 'nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html']) {
      expect(h).toContain(url)
    }
    expect(h).not.toContain('royalsocietypublishing')
    expect(h).not.toContain('fourmilab')
    expect(h).toContain('could not be read')
  })
})

describe('the chapter list', () => {
  it('uses the new sidebar title', () => {
    const app = readFileSync('src/App.tsx', 'utf8')
    expect(app).toContain("title: 'Where is the star?'")
    expect(app).not.toContain("title: 'Aberration'")
  })
})
