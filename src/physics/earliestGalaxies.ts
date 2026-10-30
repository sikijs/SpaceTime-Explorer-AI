// Cosmic Horizons, Experiment 5: how early can galaxies form? (JWST's earliest galaxies).
// See docs/experiments/cosmic-horizons/05-how-early-can-galaxies-form.md, "Physics Model".
//
// No new physics: the stretching of a wavelength by 1 + z is the only new relation. The age and the distances are the project's own
// functions (Cosmology Experiments 6 and 8: a flat universe of matter and a cosmological constant, radiation left out), rescaled from
// the project's illustrative Hubble constant of 70 to Planck's 67.4, as Experiment 4 of this group does (times scale as 1 / H0, and so
// does the comoving distance). This model does NOT model galaxy formation: the comparison of galaxy counts is a published number,
// stated with its uncertainty, not computed here.
import { MEASUREMENTS as HUBBLE_MEASUREMENTS } from './hubbleTension'
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC } from './hubblesLawExperiment'
import {
  distanceTodayLightYears,
  distanceWhenLightLeftLightYears,
  timeAfterBigBangYears,
} from './observableUniverseExperiment'
import { PLANCK_OWN } from './lumpiness'
import { PLANCK_LIKE_DARK_ENERGY_FRACTION, universeAgeYears } from './universeAgeExperiment'

export interface RecordGalaxy {
  name: string
  redshift: number
  redshiftNote: string
  year: number // the year of the cited paper
  method: 'spectroscopic'
  source: string
}

// Confirmed with a spectrum, in order of increasing redshift. Years are the years of the cited papers. The first two rows come from search
// summaries and were not fetched at the paper (the specification's source table); GN-z11's JWST measurement refines an earlier record, it
// was not itself a new record in 2023.
export const RECORDS: RecordGalaxy[] = [
  { name: 'GN-z11', redshift: 10.603, redshiftNote: 'JWST NIRSpec', year: 2023, method: 'spectroscopic', source: 'Bunker et al., A&A 677 (2023), arXiv:2302.07256' },
  { name: 'JADES-GS-z13-0', redshift: 13.2, redshiftNote: 'JWST NIRSpec', year: 2023, method: 'spectroscopic', source: 'Curtis-Lake et al., Nature Astronomy 7, 622 (2023), arXiv:2212.04568' },
  { name: 'JADES-GS-z14-0', redshift: 14.18, redshiftNote: 'refined by ALMA (NIRSpec alone gave 14.32)', year: 2024, method: 'spectroscopic', source: 'Carniani et al., Nature 633, 318 (2024), arXiv:2405.18485; Naidu et al., arXiv:2505.11263' },
  { name: 'MoM-z14', redshift: 14.44, redshiftNote: 'JWST NIRSpec, emission lines (the Lyman-alpha break gives 14.42)', year: 2025, method: 'spectroscopic', source: 'Naidu et al., arXiv:2505.11263' },
]

export const MOM_Z14_REDSHIFT = 14.44
export const JADES_GS_Z14_0_NIRSPEC_REDSHIFT = 14.32 // before ALMA refined it to 14.18
export const MOM_Z14_PAPER_AGE_YEARS = 280e6 // the paper's and the releases' figure; the model gives about 284 million
export const LYMAN_ALPHA_NM = 121.567

// Naidu et al.: the number density of bright z of about 14 to 15 sources implied by their survey is "more than 100 times larger
// (182, +329, -105)" than pre-JWST consensus models. One survey's estimate; the uncertainty is large.
export const NUMBER_DENSITY_EXCESS = { best: 182, low: 182 - 105, high: 182 + 329, headline: 100 }

// Planck's matter fraction (0.315, the same value Experiments 1, 3 and 4 of this group use); with the dark energy fraction of the age function
// (0.685) it makes a flat universe.
export const PLANCK_MATTER_FRACTION = PLANCK_OWN.omegaMatter
// The range of light that Webb's NIRCam camera is designed to capture, in nanometres: 0.6 to 5 microns (NASA's NIRCam page, fetched 2026-10-20).
export const WEBB_NIRCAM_RANGE_NM = { min: 600, max: 5000 }
// For the tutor's comparison of a share of the universe's history with a share of a child's first four years.
export const MONTHS_IN_FOUR_YEARS = 48
export const HUBBLE_CONSTANT_PLANCK = HUBBLE_MEASUREMENTS.find((m) => m.name === 'Planck 2018')!.value // 67.4
export const MIN_REDSHIFT = 0
export const MAX_REDSHIFT = 30
// The control's slider runs from 6 to 30 (Decision 6); the model itself accepts any redshift from 0 to 30.
export const SLIDER_MIN_REDSHIFT = 6

// The ranges of Prediction 1 (the share of the present age): "about 1 percent" below 1.5, "about 2 percent" up to 4, "about 10 percent" above.
export const ABOUT_ONE_UPPER_PERCENT = 1.5
export const ABOUT_TWO_UPPER_PERCENT = 4

const PROJECT_TO_PLANCK = HUBBLE_CONSTANT_KM_PER_S_PER_MPC / HUBBLE_CONSTANT_PLANCK

function requireRedshift(redshift: number): void {
  if (!Number.isFinite(redshift) || redshift < MIN_REDSHIFT || redshift > MAX_REDSHIFT) {
    throw new RangeError(`The redshift must be between ${MIN_REDSHIFT} and ${MAX_REDSHIFT}`)
  }
}

// Light from a redshift z has been stretched by the factor 1 + z.
export function stretchFactor(redshift: number): number {
  requireRedshift(redshift)
  return 1 + redshift
}

export function observedWavelengthNm(emittedNm: number, redshift: number): number {
  if (!Number.isFinite(emittedNm) || emittedNm <= 0) throw new RangeError('The wavelength must be positive')
  return emittedNm * stretchFactor(redshift)
}

// The size of the universe when the light left, as a fraction of today's size.
export function relativeSizeThen(redshift: number): number {
  return 1 / stretchFactor(redshift)
}

// Time after the Big Bang, in years: the project's function rescaled from H0 = 70 to Planck's 67.4.
export function ageAfterBigBangYears(redshift: number): number {
  requireRedshift(redshift)
  return timeAfterBigBangYears(relativeSizeThen(redshift), PLANCK_LIKE_DARK_ENERGY_FRACTION) * PROJECT_TO_PLANCK
}

// The universe's present age with Planck's values (about 13.8 billion years).
export function presentAgeYears(): number {
  return universeAgeYears(PLANCK_LIKE_DARK_ENERGY_FRACTION, HUBBLE_CONSTANT_PLANCK)
}

export function shareOfPresentAge(redshift: number): number {
  return ageAfterBigBangYears(redshift) / presentAgeYears()
}

// How long the light has travelled, in years (also the distance it has travelled, in light-years).
export function lightTravelYearsPlanck(redshift: number): number {
  return presentAgeYears() - ageAfterBigBangYears(redshift)
}

export function distanceTodayLightYearsPlanck(redshift: number): number {
  requireRedshift(redshift)
  return distanceTodayLightYears(redshift, PLANCK_LIKE_DARK_ENERGY_FRACTION) * PROJECT_TO_PLANCK
}

export function distanceThenLightYearsPlanck(redshift: number): number {
  requireRedshift(redshift)
  return distanceWhenLightLeftLightYears(redshift, PLANCK_LIKE_DARK_ENERGY_FRACTION) * PROJECT_TO_PLANCK
}

export type AgeShareRange = 'about1' | 'about2' | 'about10'

// The answer to Prediction 1.
export function ageShareRange(redshift: number): AgeShareRange {
  const percent = shareOfPresentAge(redshift) * 100
  if (percent < ABOUT_ONE_UPPER_PERCENT) return 'about1'
  if (percent <= ABOUT_TWO_UPPER_PERCENT) return 'about2'
  return 'about10'
}

export type CountRange = 'fewer' | 'same' | 'few' | 'hundred'

// The answer to Prediction 2, from the published estimate: "about a hundred times more or higher" if even the low end of the range is
// at least 50 times, "a few times more" if the best estimate is at least 2, "about the same" if at least 0.5, otherwise "fewer".
export function countRange(): CountRange {
  const { best, low } = NUMBER_DENSITY_EXCESS
  if (low >= 50) return 'hundred'
  if (best >= 2) return 'few'
  if (best >= 0.5) return 'same'
  return 'fewer'
}

export interface EarliestGalaxiesResult {
  redshift: number
  stretchFactor: number
  lymanAlphaObservedNm: number
  relativeSizeThen: number
  ageAfterBigBangYears: number
  presentAgeYears: number
  shareOfPresentAge: number
  lightTravelYears: number
  distanceThenLightYears: number
  distanceTodayLightYears: number
  ageShareRange: AgeShareRange
}

export function runEarliestGalaxies(redshift: number): EarliestGalaxiesResult {
  return {
    redshift,
    stretchFactor: stretchFactor(redshift),
    lymanAlphaObservedNm: observedWavelengthNm(LYMAN_ALPHA_NM, redshift),
    relativeSizeThen: relativeSizeThen(redshift),
    ageAfterBigBangYears: ageAfterBigBangYears(redshift),
    presentAgeYears: presentAgeYears(),
    shareOfPresentAge: shareOfPresentAge(redshift),
    lightTravelYears: lightTravelYearsPlanck(redshift),
    distanceThenLightYears: distanceThenLightYearsPlanck(redshift),
    distanceTodayLightYears: distanceTodayLightYearsPlanck(redshift),
    ageShareRange: ageShareRange(redshift),
  }
}

// How far the model's age for MoM-z14 is above the paper's 280 million years, in percent (the experiment has not worked out why).
export function paperAgeGapPercent(): number {
  return ((ageAfterBigBangYears(MOM_Z14_REDSHIFT) - MOM_Z14_PAPER_AGE_YEARS) / MOM_Z14_PAPER_AGE_YEARS) * 100
}

// The same share of a child's first four years (48 months) as the share of the universe's present age at this redshift, in months.
export function monthsOfFirstFourYears(redshift: number): number {
  return shareOfPresentAge(redshift) * MONTHS_IN_FOUR_YEARS
}

// How many ticks of a logarithmic scale (each tick ten times the one before) a multiple sits above 1: log10 of the multiple.
export function ticksAboveOne(times: number): number {
  if (!Number.isFinite(times) || times <= 0) throw new RangeError('The multiple must be positive')
  return Math.log10(times)
}
