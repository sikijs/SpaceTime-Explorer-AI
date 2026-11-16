import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { FarFutureGuess, NextDoublingGuess } from '../physics/fateOfTheUniverseExperiment'
import { FateOfTheUniverseExperiment } from './FateOfTheUniverseExperiment'
import { BarsCaption, DoublingBars, GalaxyStrip, GraphCaption, SizeGraph, StripCaption, YourBarsCaption, YourGraphCaption } from './FateOfTheUniversePictures'
import { FateOfTheUniverseResults } from './FateOfTheUniverseResults'
import { FateOfTheUniverseExplanation, FateOfTheUniverseTutor, tutorPrompt } from './FateOfTheUniverseTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, nothing that answers a guess is drawn before the run, the white marks
// appear exactly when a guess is given and its feature is drawn, and no page says "right", "wrong" or "matched" before the tutor. They do not
// check how the page looks.
const clean = (html: string) => html.replace(/<!-- -->/g, '').replace(/&#x27;/g, "'")
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => clean(renderToStaticMarkup(el))
const count = (h: string, text: string) => (h.match(new RegExp(text, 'g')) ?? []).length
// A verdict on a guess. ("pointing" is not a verdict; the page's own "not whether it is right" is taken out first.)
const VERDICT = /\b(wrong|matches|matched|correct|incorrect)\b|\b(is|was|were|are) right\b(?! now)|\bright (answer|guess)\b/i
// The page says every universe is "matched to the real one today" (the same size and rate today); that is not a verdict on a guess.
const noMatchedToday = (h: string) => h.replace(/matched-today|matched to the real one( today)?|not whether it is right/g, '')
const farAll: FarFutureGuess[] = ['stops', 'slower', 'faster']
const nextAll: NextDoublingGuess[] = ['shorter', 'same', 'longer']
const WHITE = 'stroke="#ffffff"'
const graph = (props: Partial<Parameters<typeof SizeGraph>[0]>) => render(createElement(SizeGraph, { share: 0.7, progress: 1, color: '#fbbf24', legend: 'The real universe', finished: false, guess: null, ...props }))
const bars = (props: Partial<Parameters<typeof DoublingBars>[0]>) => render(createElement(DoublingBars, { share: 0.7, progress: 1, color: '#fbbf24', staged: true, guess: null, ...props }))

describe('Cosmology 10 renders (at rest)', () => {
  const html = render(createElement(FateOfTheUniverseExperiment, {}))

  it('renders the heading, Part 1, the words box, the links and a greyed-out Start over, with no later Part', () => {
    expect(html).toContain('Cosmology 10: The Fate of the Universe: Does the Expansion Ever Stop?')
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    for (const href of ['arxiv.org/abs/1807.06209', 'hubble-constant-and-tension', 'wmap/shape.html', '2025/03/19/more-than-a-hint', 'arxiv.org/abs/2503.14738', '2026/07/30/new-desi-dr2-lyman-alpha', 'ifae.es/news/2026/01/22']) expect(html).toContain(href)
    expect(html).toContain('target="_blank"')
    expect(html).not.toContain('Change prediction')
    for (const later of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(later)
    // The closing synthesis is named twice in the introduction and is not shown before the tutor's explanation.
    expect(count(html, 'Putting It All Together')).toBe(2)
    expect(html).not.toContain(WHITE)
    expect(html).not.toContain('NaN')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Run<\/button>/)
  })

  it('has the two approved guess questions, says they are about the real universe, and has the step-by-step introduction', () => {
    expect(html).toContain('The universe is expanding today. What do you think the far future looks like?')
    expect(html).toContain("Suppose the universe takes about 11 billion years to double in size from today. How long will the next doubling take, from twice today's size to four times?")
    expect(html).toContain('Both guesses are about the real universe, whatever you try later in Part 2.')
    for (const choice of ['The expansion slows down and stops', 'The expansion keeps going, but ever more slowly', 'The expansion keeps speeding up and never stops', 'Shorter, about 5 billion years', 'About the same, about 11 billion years', 'Much longer, about 30 billion years']) expect(html).toContain(choice)
    for (const lead of ['The question.', 'What happens.', 'Step 1: the size of the universe.', 'Step 2: the doubling time.', 'Step 3: the expansion rate.', 'Step 4: what sets the rate.', 'Step 5: what', 'Step 6: why ask this at all.', 'Your job.', 'What to look for.', 'How this page is laid out.', 'What we assume.', 'As of November 2026.']) expect(html).toContain(lead)
    expect(html).toContain('never change the real pictures or tables')
    expect(html).toContain('in <strong>white</strong>')
  })

  it('does not say that the expansion is already speeding up in the question (it would point at one answer to guess 1)', () => {
    const question = html.slice(html.indexOf('The question.'), html.indexOf('What happens.'))
    expect(question).not.toContain('speeding that expansion up')
    expect(question).not.toContain('speeding up')
  })

  it('gives away no answer before the run (§12)', () => {
    for (const answer of ['424.8', '21.3', '10.7, 11.4', '48.2', 'Nine billion years after the universe began, its expansion', 'savings account that earns', 'bath fed by two taps', 'about 7.5 billion years ago', 'will continue to expand forever']) expect(html).not.toContain(answer)
    expect(html).not.toContain('Formula: the settled doubling time')
    expect(html).not.toContain('science.nasa.gov/dark-energy/')
    expect(html).toContain('appear here after your first Run')
    expect(html).toContain('four more formulas appear here after your first run')
  })

  it('dates and sources the DESI sentences, and drops what no fetched page says', () => {
    expect(html).toContain('3.1σ')
    expect(html).toContain('30 July 2026')
    expect(html).toContain('January 2026')
    expect(html).toContain('As of November 2026 the question is still open.')
    expect(html).not.toContain('not strong enough to count as a discovery')
    expect(html).not.toContain('errors in the supernova measurements')
  })

  it('draws no picture and no caption before the run', () => {
    expect(html).not.toContain('<svg')
    expect(html).not.toContain('How to read this picture')
    expect(html).toContain('After you press Run')
  })
})

describe('Picture 1: the graph of the real universe', () => {
  it('draws the labelled axes, both lines and the green dot, and no white before the guess is drawn', () => {
    const h = graph({})
    for (const text of ['How big the universe is, from the past into the future', 'Years from now (billions). Left of 0 is the past.', 'Size compared with today (log scale)', 'today', 'The real universe', 'No dark energy (for comparison)', 'Expansion starts', 'speeding up']) expect(h).toContain(text)
    expect(h).toContain('stroke="#fbbf24"')
    expect(h).toContain('stroke="#38bdf8"')
    expect(h).toContain('fill="#4ade80"')
    expect(h).not.toContain(WHITE)
    expect(h).not.toContain('YOUR GUESS')
    expect(h).not.toContain('NaN')
  })

  it('draws a white sketch and one YOUR GUESS box only once the run has finished and there is a guess', () => {
    for (const guess of farAll) {
      const h = graph({ finished: true, guess })
      expect(count(h, 'YOUR GUESS')).toBe(1)
      expect(h).toContain(WHITE)
      expect(h).not.toContain('NaN')
    }
    expect(graph({ finished: false, guess: 'faster' })).not.toContain('YOUR GUESS')
    expect(graph({ finished: true, guess: null })).not.toContain(WHITE)
  })

  it('draws a different sketch for each guess and states each in its box', () => {
    const polylines = farAll.map((g) => graph({ finished: true, guess: g }).match(/<polyline points="([^"]+)" fill="none" stroke="#ffffff"/)![1])
    expect(new Set(polylines).size).toBe(3)
    expect(graph({ finished: true, guess: 'stops' })).toContain('slows down and stops')
    expect(graph({ finished: true, guess: 'slower' })).toContain('keeps going, more slowly')
    expect(graph({ finished: true, guess: 'faster' })).toContain('keeps speeding up')
  })

  it('grows the line during the run and shows the legend for no dark energy as the same line at 0%', () => {
    expect(graph({ progress: 0.2 }).match(/<polyline points="([^"]+)" fill="none" stroke="#fbbf24"/)![1].length).toBeLessThan(graph({ progress: 1 }).match(/<polyline points="([^"]+)" fill="none" stroke="#fbbf24"/)![1].length)
    const none = graph({ share: 0, progress: 1 })
    expect(none).toContain('No dark energy (the same as the main line)')
    expect(none).not.toContain('Expansion starts')
  })
})

describe('Picture 2: the bars of the real universe', () => {
  it('builds the bars one at a time and settles only after the fourth', () => {
    const early = bars({ progress: 0.05 })
    const middle = bars({ progress: 0.2 })
    const full = bars({ progress: 1 })
    expect(count(early, 'billion years</text>')).toBeLessThan(count(middle, 'billion years</text>'))
    expect(count(full, '→')).toBe(4)
    expect(full).toContain('Settles to 11.6 billion years')
    expect(early).not.toContain('Settles to')
  })

  it('draws the white bar and its box only once the second bar is drawn, with a length that follows the guess', () => {
    expect(bars({ progress: 0.02, guess: 'same' })).not.toContain('YOUR GUESS')
    const lengths = nextAll.map((g) => {
      const h = bars({ progress: 1, guess: g })
      expect(count(h, 'YOUR GUESS')).toBe(1)
      return Number(h.match(/<rect x="110" y="\d+" width="([\d.]+)" height="10" fill="#ffffff"/)![1])
    })
    expect(lengths[0]).toBeLessThan(lengths[1])
    expect(lengths[1]).toBeLessThan(lengths[2])
    expect(lengths[0]).toBeCloseTo((5 / 80) * 380, 1)
    expect(lengths[2]).toBeCloseTo((30 / 80) * 380, 1)
    expect(bars({ progress: 1, guess: null })).not.toContain('#ffffff')
  })

  it('draws all four bars at once for Part 2, with the off-scale bars marked and no settled line for 0%', () => {
    const h = bars({ share: 0, staged: false, progress: 0.3, color: '#f472b6' })
    expect(count(h, '→')).toBe(4)
    expect(h).toContain('(off the scale)')
    expect(h).toContain('No dark energy: it never settles')
    expect(h).not.toContain('Settles to')
    expect(h).not.toContain('NaN')
  })
})

describe('captions', () => {
  const before = render(createElement(GraphCaption, { arrived: false }))
  const after = render(createElement(GraphCaption, { arrived: true }))
  const barsBefore = render(createElement(BarsCaption, { arrived: false }))
  const barsAfter = render(createElement(BarsCaption, { arrived: true }))

  it('lists every drawn element before the run ends', () => {
    for (const text of ['gold line', 'blue dashed line', 'green dot', 'white dot', 'time, counted from now', 'about 10 seconds', 'Why the side axis jumps by 10 each step']) expect(before).toContain(text)
    for (const text of ['four bars', 'green dashed line', 'white outline', 'zigzag']) expect(barsBefore).toContain(text)
  })

  it('shows the worked moment and the three-part look-for items only once the run has ended, with the numbers from the module', () => {
    for (const h of [[before, after], [barsBefore, barsAfter]]) {
      expect(h[0]).not.toContain('What to look for.')
      expect(h[1]).toContain('What to look for.')
    }
    expect(before).not.toContain('A worked moment.')
    expect(after).toContain('A worked moment.')
    expect(count(after, '<strong>Look at:</strong>')).toBe(4)
    expect(count(after, '<strong>What it means:</strong>')).toBe(4)
    expect(count(after, '<strong>Why it matters:</strong>')).toBe(4)
    expect(count(barsAfter, '<strong>Look at:</strong>')).toBe(3)
    expect(count(barsAfter, '<strong>Why it matters:</strong>')).toBe(3)
    expect(after).toContain('21 times its size today')
    expect(after).toContain('425 times')
    expect(after).toContain('3.4 times')
    expect(barsAfter).toContain('10.7, 11.4, 11.6, 11.6 billion years')
    expect(barsBefore).not.toContain('10.7')
  })

  it('gives neither a verdict nor the mechanism', () => {
    for (const h of [before, after, barsBefore, barsAfter]) {
      expect(h).not.toContain('savings')
      expect(h).not.toContain('thins out')
      expect(noMatchedToday(h).replace('None of them says right or wrong', '')).not.toMatch(VERDICT)
    }
  })

  it("has captions for the learner's own pictures that follow the share", () => {
    const g = render(createElement(YourGraphCaption, { share: 0.3 }))
    expect(g).toContain('pink line')
    expect(g).toContain('(30%)')
    expect(g).toContain('<strong>Look at:</strong>')
    const b = render(createElement(YourBarsCaption, { share: 0 }))
    expect(b).toContain('17, 48, 136, 385 billion years')
    const strip = render(createElement(StripCaption, {}))
    for (const text of ['blue dots', 'pink ovals', 'not to scale', '<strong>Look at:</strong>']) expect(strip).toContain(text)
    expect(render(createElement(GalaxyStrip, { share: 0.7, progress: 1 }))).not.toContain('NaN')
  })
})

describe('Part 3: the results', () => {
  const guesses = { farFuture: 'faster' as FarFutureGuess, nextDoubling: 'same' as NextDoublingGuess }
  const html = render(createElement(FateOfTheUniverseResults, { guesses, share: 0.3 }))

  it('shows the guesses beside the results with a tag on the rows, and never says right or wrong', () => {
    expect(html).toContain('Your guesses')
    expect(html).toContain('the expansion keeps speeding up and never stops')
    expect(html).toContain('about the same, about 11 billion years')
    expect(count(html, 'your guess</span>')).toBe(5)
    expect(noMatchedToday(html)).not.toMatch(VERDICT)
    expect(html).not.toContain('So your prediction')
  })

  it('shows no guess block and no tag before there is a guess', () => {
    const none = render(createElement(FateOfTheUniverseResults, { guesses: null, share: 0.3 }))
    expect(none).not.toContain('Your guesses')
    expect(none).not.toContain('your guess</span>')
  })

  it('has the check-up with its six rows, published values, readings and the "What this table tells us" notes', () => {
    for (const text of ['(a) The matter share', '(b) When the expansion began', '(c) The expansion rate today', '(d) The settled doubling time', '(e) The size in 50 and 100 billion years', '(f) Whether dark energy is constant', '0.315 ± 0.007', 'about 5 to 6 billion years ago (NASA, 2006)', 'within the spread', 'within the published values', 'about 1 percent', 'not settled', 'not a measurement']) expect(html).toContain(text)
    expect(count(html, 'What this table tells us')).toBe(2)
  })

  it('has Table 2 with the real universe, no dark energy and the pink column, and says the values are trial values', () => {
    for (const text of ['The real universe (70%)', 'No dark energy (0%)', 'Your universe (30%)', '21.3× today', '424.8×', '10.7, 11.4, 11.6, 11.6', '17.0, 48.2, 136.2, 385.3', 'trial values']) expect(html).toContain(text)
  })

  it('never changes a real column with the share, and changes the pink column and its note with it', () => {
    const other = render(createElement(FateOfTheUniverseResults, { guesses, share: 0.9 }))
    const real = (h: string) => h.slice(h.indexOf('Table 1'), h.indexOf('Table 2'))
    expect(real(html)).toBe(real(other))
    expect(html).toContain('Your universe (30%)')
    expect(other).toContain('Your universe (90%)')
    expect(html).not.toBe(other)
    expect(other).toContain('With <strong>90% dark energy</strong>')
  })

  it("does not answer the tutor's questions or give a verdict", () => {
    for (const text of ['earns a fixed interest rate', 'bath fed by two taps', 'borderline case', 'matter thins out', 'thrown at exactly escape speed']) expect(html).not.toContain(text)
    expect(html).toContain('What this model can and cannot tell you')
    expect(html).toContain('implodes or compresses')
  })
})

describe('Part 4: the tutor', () => {
  it('asks three questions with no outcome and no verdict, naming the white marks', () => {
    for (const far of farAll)
      for (const next of nextAll) {
        const observe = tutorPrompt('observe', far, next)
        const compare = tutorPrompt('compare', far, next)
        const conceptual = tutorPrompt('conceptual', far, next)
        for (const q of [observe, compare, conceptual]) expect(q).not.toMatch(VERDICT)
        expect(observe).toContain('white marks')
        expect(compare).toContain('white curve')
        expect(compare).toContain('white bar')
        expect(conceptual).toContain('why does the universe not simply fall back together')
      }
  })

  it('starts on its first question and marks nothing until the explanation', () => {
    const h = render(createElement(FateOfTheUniverseTutor, { predictedFarFuture: 'faster', predictedNextDoubling: 'same' }))
    expect(h).toContain('Look at the bars showing how long each doubling takes')
    expect(h).not.toContain('That is what you guessed')
    expect(h).not.toContain('That is not what you guessed')
  })

  it('marks each guess once, and only the two the model gives as what you guessed', () => {
    for (const far of farAll)
      for (const next of nextAll) {
        const h = render(createElement(FateOfTheUniverseExplanation, { predictedFarFuture: far, predictedNextDoubling: next }))
        expect(count(h, 'That is what you guessed')).toBe((far === 'faster' ? 1 : 0) + (next === 'same' ? 1 : 0))
        expect(count(h, 'That is not what you guessed')).toBe((far === 'faster' ? 0 : 1) + (next === 'same' ? 0 : 1))
        expect(h).not.toContain('NaN')
      }
    expect(render(createElement(FateOfTheUniverseExplanation, { predictedFarFuture: 'slower', predictedNextDoubling: 'same' }))).toContain('what the model gives with no dark energy')
    expect(render(createElement(FateOfTheUniverseExplanation, { predictedFarFuture: 'stops', predictedNextDoubling: 'same' }))).toContain('does not stop, even with no dark energy')
  })

  it('has the seven points, the comparisons moved from Results, the dated DESI sentence and the figures from the module', () => {
    const h = render(createElement(FateOfTheUniverseExplanation, { predictedFarFuture: 'faster', predictedNextDoubling: 'same' }))
    for (const n of ['1. With only matter', '2. Dark energy does not thin out', '3. With dark energy, each doubling', '4. The real universe has already been through both stages', '5. What grows is the space between groups', '6. The honest limits', '7. Not covered here']) expect(h).toContain(n)
    for (const text of ['bath fed by two taps', 'savings account', 'A simple calculation.', 'about 20', '21.3', '424.8', '48', '2.83', 'As of November 2026', '3.1σ', '0.001 ± 0.002', 'whether dark energy changes is still open', 'from about 5 to 7.5 billion years ago', '6.1 billion years ago', '0.60 times']) expect(h).toContain(text)
  })
})
