import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ColorSide } from '../physics/dopplerShift'
import { DopplerShiftExperiment, SkyPair, stageOf } from './DopplerShiftExperiment'
import { DopplerShiftLinks, FORMULA_ENTRIES, REFERENCE_ENTRIES } from './DopplerShiftIntro'
import { DopplerShiftResults } from './DopplerShiftResults'
import { DopplerShiftTutor } from './DopplerShiftTutor'
import { ClockBarsDrawing, CrossingDrawing, SirenDrawing } from './DopplerShiftTutorDrawings'
import { FactorGraph } from './DopplerShiftPictures'

// Render checks only (no browser): Experiment 8 after the audit of 2026-11-23. Pressing Run, the playback, the locking and Start over are checked in Chrome.

const SPEED = 0.6
const text = (html: string) => html.replace(/<!-- -->/g, '')
const count = (html: string, needle: string) => html.split(needle).length - 1
const pair = (status: 'idle' | 'running' | 'complete', progress: number, guesses: { ahead: ColorSide; sideways: ColorSide } | null, own = false) =>
  text(renderToStaticMarkup(createElement(SkyPair, { speed: SPEED, status, progress, guesses, own })))

describe('the first screen, before any Run', () => {
  const html = text(renderToStaticMarkup(createElement(DopplerShiftExperiment)))

  it('has the new title and Part 1 only', () => {
    expect(html).toContain('Does Your Motion Change the Color of Starlight?')
    expect(html).not.toContain('Why a Fast Traveler Sees')
    expect(html).toContain('Part 1: Predict, then watch')
    for (const part of ['Part 2: Now try it yourself', 'Part 3: The results', 'Part 4: The tutor']) expect(html).not.toContain(part)
  })

  it('has Start over and Run disabled, and no Change prediction button', () => {
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Start over<\/button>/)
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Run<\/button>/)
    expect(html).not.toContain('Change prediction')
  })

  it('says that predictions never change the pictures or tables, and that guesses are drawn in white', () => {
    expect(html).toContain('Your predictions never change the pictures or the tables.')
    expect(html).toContain('drawn on the spectrum bar in white')
  })

  it('has six answer buttons, three for each question', () => {
    expect(count(html, '>Bluer</button>')).toBe(2)
    expect(count(html, '>The same color</button>')).toBe(2)
    expect(count(html, '>Redder</button>')).toBe(2)
  })

  it('draws no guess mark, no white stroke and no formula before the run', () => {
    expect(html).not.toMatch(/<text[^>]*>YOUR GUESS 1/)
    expect(html).not.toContain('stroke="#ffffff"')
    expect(html).not.toContain('(1 + β cos θ) ÷ D')
  })

  it('draws the introduction’s four drawings and none shows a direction of shift', () => {
    for (const name of ['Drawing A', 'Drawing B', 'Drawing C', 'Drawing D']) expect(html).toContain(name)
    expect(html).not.toContain('Drawing T1')
    expect(html).not.toContain('shifted toward blue ahead')
  })

  it('orders the introduction, the words box and the links above Part 1', () => {
    const at = (needle: string) => html.indexOf(needle)
    expect(at('The question.')).toBeGreaterThan(-1)
    expect(at('The question.')).toBeLessThan(at('Some new words.'))
    expect(at('Some new words.')).toBeLessThan(at('Your job.'))
    expect(at('Your job.')).toBeLessThan(at('What we assume.'))
    expect(at('What we assume.')).toBeLessThan(at('Words and formulas'))
    expect(at('Words and formulas')).toBeLessThan(at('Want to know more?'))
    expect(at('Want to know more?')).toBeLessThan(at('Part 1: Predict, then watch'))
  })

  it('uses orange, not white, for the star straight ahead', () => {
    expect(html).toContain('#fb923c')
    expect(html).toContain('dashed orange ring')
    expect(html).not.toContain('dashed white ring')
  })
})

describe('the words box and the links', () => {
  it('defines Doppler effect and crest, and adds the formula only after the run', () => {
    expect(REFERENCE_ENTRIES.some((e) => e.term === 'Doppler effect')).toBe(true)
    expect(REFERENCE_ENTRIES.some((e) => e.term.startsWith('Crest'))).toBe(true)
    expect(REFERENCE_ENTRIES.every((e) => !e.meaning.includes('(1 + β cos θ)'))).toBe(true)
    expect(FORMULA_ENTRIES.some((e) => e.meaning.includes('(1 + β cos θ) ÷ D'))).toBe(true)
  })

  it('links the five pages that were read, each in a new tab, and no page that was not read', () => {
    const html = renderToStaticMarkup(createElement(DopplerShiftLinks))
    for (const href of [
      'https://imagine.gsfc.nasa.gov/features/yba/M31_velocity/spectrum/doppler_more.html',
      'https://science.nasa.gov/ems/09_visiblelight/',
      'https://science.nasa.gov/ems/02_anatomy/',
      'https://science.nasa.gov/ems/01_intro/',
      'https://www.fourmilab.ch/etexts/einstein/specrel/www/',
    ])
      expect(html).toContain(`href="${href}"`)
    expect(count(html, 'target="_blank"')).toBe(5)
    expect(count(html, 'rel="noopener noreferrer"')).toBe(5)
    expect(html).not.toMatch(/href="[^"]*(glossary|cosmictimes)/)
  })
})

describe('the pictures during and after the run', () => {
  const guesses = { ahead: 'bluer', sideways: 'same' } as const

  it('draws no white mark while the traveler’s sky is still being built, but says when it will appear', () => {
    const html = pair('running', 0.4, guesses)
    expect(html).not.toMatch(/YOUR GUESS 1: the star straight ahead: /)
    expect(html).toContain('Your two white guess marks appear under the bar')
  })

  it('draws the two white marks once the bar’s marks are drawn, and they follow the guesses', () => {
    expect(stageOf('running', 0.9).showMarks).toBe(true)
    const html = pair('complete', 1, guesses)
    expect(html).toContain('YOUR GUESS 1: the star straight ahead: bluer')
    expect(html).toContain('YOUR GUESS 2: the star we follow: the same color')
    const other = pair('complete', 1, { ahead: 'redder', sideways: 'bluer' })
    expect(other).toContain('YOUR GUESS 1: the star straight ahead: redder')
    expect(other).not.toEqual(html)
  })

  it('draws a ring for “the same color” and an arrow otherwise, with the arrow pointing to the guessed side', () => {
    const arrowEnd = (side: ColorSide) => {
      const m = pair('complete', 1, { ahead: side, sideways: 'same' }).match(/<line x1="(\d+(?:\.\d+)?)" y1="[\d.]+" x2="(\d+(?:\.\d+)?)" y2="[\d.]+" stroke="#ffffff" stroke-width="5" marker-end/)
      return m ? [Number(m[1]), Number(m[2])] : null
    }
    const bluer = arrowEnd('bluer')
    const redder = arrowEnd('redder')
    expect(bluer && bluer[1] < bluer[0]).toBe(true)
    expect(redder && redder[1] > redder[0]).toBe(true)
    expect(arrowEnd('same')).toBeNull()
    expect(pair('complete', 1, { ahead: 'same', sideways: 'same' })).toContain('r="11" fill="none" stroke="#ffffff"')
  })

  it('has no white mark and no caption in Part 2’s copy, even with a guess', () => {
    const html = pair('complete', 1, null, true)
    expect(html).not.toContain('YOUR GUESS')
    expect(html).not.toContain('stroke="#ffffff"')
    expect(html).not.toContain('How to read this diagram')
  })

  it('shows look-for items in three parts, each only once its feature is drawn, and a Where the real picture comes from line', () => {
    const early = pair('running', 0.1, guesses)
    expect(early).toContain('Look at:')
    expect(early).not.toContain('orange-ringed dot')
    const late = pair('complete', 1, guesses)
    expect(count(late, 'Look at:')).toBe(count(late, 'What it means:'))
    expect(count(late, 'What it means:')).toBe(count(late, 'Why it matters:'))
    expect(count(late, 'Look at:')).toBe(6)
    expect(late).toContain('Where the real picture comes from.')
    expect(late).toContain('Your white marks are your guesses, not calculations.')
    expect(late).toContain('white marks</strong> under the bar')
    expect(late).toContain('only show a direction')
  })

  it('does not say which way a color shifts in the caption before the traveler’s sky is drawn', () => {
    const html = pair('idle', 0, guesses)
    expect(html).not.toContain('275 nm')
  })
})

describe('Part 3, the results', () => {
  const html = text(renderToStaticMarkup(createElement(DopplerShiftResults, { speed: SPEED, predictedAhead: 'bluer', predictedSideways: 'same' })))

  it('has the check-up with six rows all reading “the same”, and a note under each table', () => {
    expect(count(html, '>the same</td>')).toBe(6)
    expect(count(html, 'What this table tells us')).toBe(3)
    expect(html).toContain('Einstein’s 1905 formula')
  })

  it('shows the guesses as tags on the 0° and 90° rows and in a block, never marked', () => {
    expect(html).toContain('YOUR GUESS 1: bluer')
    expect(html).toContain('YOUR GUESS 2: the same color')
    expect(html).toContain('Your guesses, beside the results')
    for (const word of ['matched', 'did not match', 'correct', 'wrong', 'right!']) expect(html).not.toContain(word)
  })

  it('draws the graph with the two white guess marks', () => {
    expect(html).toContain('YOUR GUESS 1: the star straight ahead: bluer')
    expect(html).toContain('YOUR GUESS 2: the star we follow: the same color')
    expect(html).toContain('Where the real picture comes from.')
  })

  it('gives the 0.6c numbers', () => {
    for (const value of ['2.00', '1.25', '0.50', '275 nm', '440 nm', '1100 nm', '70.5°', '109.5°', '0.800']) expect(html).toContain(value)
  })

  it('draws the graph alone with its curve and no marks', () => {
    const graph = renderToStaticMarkup(createElement(FactorGraph, { speed: SPEED }))
    expect(graph).toContain('<polyline')
    expect(graph).not.toContain('YOUR GUESS')
  })
})

describe('Part 4, the tutor’s prompts and drawings', () => {
  it('points the first prompt to the white marks by name, and does not mark anything before the explanation', () => {
    const html = text(renderToStaticMarkup(createElement(DopplerShiftTutor, { speed: SPEED, predictedAhead: 'bluer', predictedSideways: 'same' })))
    expect(html).toContain('white YOUR GUESS marks')
    expect(html).not.toContain('matched')
    expect(html).not.toContain('Drawing T1')
  })

  it('draws the three drawings for the learner’s speed', () => {
    expect(renderToStaticMarkup(createElement(SirenDrawing))).toContain('Drawing T1')
    const clock = renderToStaticMarkup(createElement(ClockBarsDrawing, { speed: SPEED }))
    for (const value of ['1.60', '1.00', '0.40', '2.00', '1.25', '0.50']) expect(clock).toContain(value)
    const crossing = renderToStaticMarkup(createElement(CrossingDrawing, { speed: SPEED }))
    for (const value of ['70.5', '53.1', '0.80']) expect(crossing).toContain(value)
  })
})
