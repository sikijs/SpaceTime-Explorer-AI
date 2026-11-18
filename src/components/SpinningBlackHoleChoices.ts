import type { EdgeAnswer, EnergyAnswer, HorizonAnswer } from '../physics/spinningBlackHoleExperiment'

// The four guess questions of Black Holes 8 and their choices, exactly as the owner approved them (2026-10-12). Shared by the page, the pictures, the
// results and the tutor so that every place uses the same words. The wording avoids "dragging", which would give away the first two answers.
export const WITH_QUESTION =
  'Suppose the black hole spins and a probe circles the same way as the spin. Compared with a black hole that does not spin (where the last safe orbit is at 3 horizon radii), where do you think the last safe orbit is?'
export const AGAINST_QUESTION = 'Now the probe circles against the spin. Where do you think the last safe orbit is, compared with no spin?'
export const EDGE_CHOICES: Array<{ value: EdgeAnswer; label: string }> = [
  { value: 'closer', label: 'Closer to the black hole' },
  { value: 'same', label: 'The same place' },
  { value: 'farther', label: 'Farther from the black hole' },
]

export const HORIZON_QUESTION = 'As the black hole spins faster, does its horizon (the point of no return) get bigger, stay the same size, or get smaller?'
export const HORIZON_CHOICES: Array<{ value: HorizonAnswer; label: string }> = [
  { value: 'bigger', label: 'Bigger' },
  { value: 'same', label: 'The same size' },
  { value: 'smaller', label: 'Smaller' },
]

export const ENERGY_QUESTION =
  'A probe slowly spirals down to its last safe orbit, giving up some of its energy on the way. Which probe do you think gives up more, when the black hole spins fast?'
export const ENERGY_CHOICES: Array<{ value: EnergyAnswer; label: string }> = [
  { value: 'with', label: 'The one circling with the spin' },
  { value: 'against', label: 'The one circling against the spin' },
  { value: 'same', label: 'They give up the same' },
]

export const edgeLabel = (c: EdgeAnswer) => EDGE_CHOICES.find((x) => x.value === c)!.label
export const horizonLabel = (c: HorizonAnswer) => HORIZON_CHOICES.find((x) => x.value === c)!.label
export const energyLabel = (c: EnergyAnswer) => ENERGY_CHOICES.find((x) => x.value === c)!.label

// The short words in the white YOUR GUESS boxes on the pictures.
export const EDGE_TEXT: Record<EdgeAnswer, string> = { closer: 'closer to the black hole', same: 'the same place', farther: 'farther away' }
export const HORIZON_TEXT: Record<HorizonAnswer, string> = { bigger: 'the horizon gets bigger', same: 'the same size', smaller: 'the horizon gets smaller' }
export const ENERGY_TEXT: Record<EnergyAnswer, string> = { with: 'the probe going with the spin', against: 'the probe going against the spin', same: 'they give up the same' }
