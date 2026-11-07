import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { chirpRunSummary, firstAndLastSwing, graphHalfRange } from '../physics/gravitationalWaveChirpExperiment'
import { energyRunSummary } from '../physics/gravitationalWaveEnergyExperiment'
import type { EnergyChoice } from '../physics/gravitationalWaveEnergyExperiment'
import {
  ArmGraphCaption,
  ArmsCaption,
  EnergyCaption,
  EnergyGraph,
  GravitationalWaveEnergyExperiment,
} from './GravitationalWaveEnergyExperiment'
import { GravitationalWaveEnergyTutor } from './GravitationalWaveEnergyTutor'

// Render checks only (no browser): nothing crashes, no "NaN" is drawn, and the white guess mark appears exactly when
// the run has begun. They do not check how the page looks.
const CHOICES: EnergyChoice[] = ['increases', 'decreases', 'stays-the-same']
const MASSES = [0.2, 0.3, 0.5, 1, 3, 6]

describe('the energy page renders', () => {
  it('the whole page renders at rest, with no guess mark and no formulas yet', () => {
    const html = renderToStaticMarkup(createElement(GravitationalWaveEnergyExperiment, {}))
    expect(html).toContain('Part 1: Predict, then watch')
    expect(html).toContain('Words and formulas')
    expect(html).toContain('Want to know more?')
    expect(html).not.toContain('YOUR GUESS:') // the drawn mark's text; the introduction names the box in words
    expect(html).not.toContain('Change prediction')
    expect(html).not.toContain('Start over') // shown only once a prediction is locked by pressing Run
    expect(html).not.toContain('Formula: orbital energy left')
    expect(html).not.toContain('NaN')
  })

  it('the energy graph draws the white guess only once the run has begun, for every guess and mass', () => {
    for (const mass of MASSES) {
      const total = energyRunSummary(mass).cutoffTime
      for (const guess of CHOICES) {
        const before = renderToStaticMarkup(createElement(EnergyGraph, { mass, time: 0, started: false, done: false, pink: false, guess, label: 'x' }))
        expect(before).not.toContain('YOUR GUESS:')
        for (const [time, done] of [[total / 2, false], [total, true]] as const) {
          const html = renderToStaticMarkup(createElement(EnergyGraph, { mass, time, started: true, done, pink: false, guess, label: 'x' }))
          expect(html).toContain('YOUR GUESS:')
          expect(html).not.toContain('NaN')
        }
      }
    }
  })

  it('Drawing C carries pink marks that follow the mass, and the end label only after the run', () => {
    for (const mass of MASSES) {
      const s = energyRunSummary(mass)
      const rest = renderToStaticMarkup(createElement(EnergyGraph, { mass, time: 0, started: false, done: false, pink: true, guess: 'decreases', label: 'x' }))
      expect(rest).toContain(`YOUR MASS: starts at ${s.startEnergy.toFixed(3)}`)
      expect(rest).not.toContain(' radiated</tspan>') // the pink end label appears only after the run
      const done = renderToStaticMarkup(createElement(EnergyGraph, { mass, time: s.cutoffTime, started: true, done: true, pink: true, guess: 'decreases', label: 'x' }))
      expect(done).toContain(`${s.finalRemainingEnergy.toFixed(3)} left, </tspan>`) // the end label is on two lines
      expect(done).toContain(`${s.finalRadiatedEnergy.toFixed(3)} radiated</tspan>`)
      expect(done).not.toContain('NaN')
    }
  })

  it('the captions render before and after a run for every mass, with the look-for items only after', () => {
    for (const mass of MASSES) {
      const arms = chirpRunSummary(mass)
      const swing = firstAndLastSwing(mass)
      const energy = energyRunSummary(mass)
      for (const pink of [false, true]) {
        const pre = [
          renderToStaticMarkup(createElement(ArmsCaption, { name: 'X', summary: arms, done: false, pink })),
          renderToStaticMarkup(createElement(ArmGraphCaption, { name: 'X', summary: arms, swing, half: graphHalfRange(mass), done: false, pink })),
          renderToStaticMarkup(createElement(EnergyCaption, { name: 'X', summary: energy, done: false, pink, guess: 'increases' })),
        ]
        const post = [
          renderToStaticMarkup(createElement(ArmsCaption, { name: 'X', summary: arms, done: true, pink })),
          renderToStaticMarkup(createElement(ArmGraphCaption, { name: 'X', summary: arms, swing, half: graphHalfRange(mass), done: true, pink })),
          renderToStaticMarkup(createElement(EnergyCaption, { name: 'X', summary: energy, done: true, pink, guess: 'increases' })),
        ]
        for (const html of pre) {
          expect(html).toContain('Where the real picture comes from')
          expect(html).not.toContain('What to look for')
          expect(html).not.toContain('NaN')
        }
        for (const html of post) {
          expect(html).toContain('What to look for')
          expect(html).toContain('Look at:')
          expect(html).not.toContain('NaN')
        }
      }
    }
  })

  it('the worked moment for mass 0.3 shows the draft numbers', () => {
    const html = renderToStaticMarkup(createElement(EnergyCaption, { name: 'Picture 3', summary: energyRunSummary(0.3), done: true, pink: false, guess: 'decreases' }))
    expect(html).toContain('0.210')
    expect(html).toContain('0.090')
    expect(html).toContain('0.030')
    expect(html).toContain('0.270')
  })

  it('the tutor renders its first question without giving the answer', () => {
    for (const guess of CHOICES) {
      const html = renderToStaticMarkup(createElement(GravitationalWaveEnergyTutor, { energyPrediction: guess }))
      expect(html).toContain('Picture 3')
      expect(html).not.toContain('it always decreases')
    }
  })
})
