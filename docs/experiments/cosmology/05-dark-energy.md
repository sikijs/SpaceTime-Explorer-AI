# Cosmology — Experiment 5: Dark Energy (Is the Expansion Speeding Up?)

**Status: approved (2026-10-06), per `CLAUDE.md` §23 Stages 1–4, proposed by Claude following the completion of Cosmology Experiment 4. The topic was chosen by the owner from three options. The owner approved the specification as drafted; all eight former "Decisions Needing Human Review" items are confirmed as proposed (see "Further Decisions Confirmed"). Not yet implemented.**

This is the fifth experiment of the "Cosmology" chapter.

---

## Overview

Experiment 1 showed that farther galaxies recede faster, using a formula the experiment itself warned is accurate only for nearby galaxies. Experiment 2 ran the expansion backward at a constant rate and noted that the real expansion rate has changed over cosmic history. Experiment 4 said that "dark energy" is a different idea from dark matter. This experiment picks up all three threads: **has the expansion been speeding up or slowing down, and how could we tell?**

The idea is a sibling of Gravitational Waves Experiment 7 (standard sirens). Some exploding stars, **Type Ia supernovae**, have a known true brightness, so how dim one looks tells us how far away it is, in the same way a car's headlights look dimmer the farther away the car is. Pair that distance with the supernova's redshift and we can test what the expansion has been doing. If the universe held only matter, gravity would slow the expansion, and a distant supernova would look a certain brightness. In 1998 two teams found that distant supernovae look **dimmer** than that, meaning they are farther away than a slowing universe predicts. The expansion has been speeding up. Whatever drives that is called **dark energy**.

The learner varies the share of dark energy and sees, on a graph and on a row of supernovae, how the predicted brightness of distant supernovae changes, compared with the matter-only prediction and with what astronomers' best-fit model says is observed.

This uses real physics at its exact form (no low-redshift approximation). For nearby objects it reduces to Experiment 1's relationship, which the experiment shows directly, closing that thread.

---

## Learning Objective

After this experiment, the learner should understand:

1. A source of known true brightness (a "standard candle") gives its distance from how dim it looks: dimmer means farther (brightness falls with the square of distance).
2. In a universe containing only matter, gravity would slow the expansion down, so distant supernovae would look a certain brightness.
3. Real distant supernovae look dimmer than that, so they are farther away than expected: the expansion has been **speeding up**, not slowing down.
4. **Dark energy** is the name for whatever is driving the speed-up. It is inferred from this observation. What it is remains unknown.
5. For nearby objects, all versions of the universe agree, which is why Experiment 1's simple formula worked for nearby galaxies. The differences appear only at large distances.
6. Dark energy is a different idea from dark matter (Experiment 4): dark matter pulls inward with gravity, while dark energy is whatever makes the expansion speed up.

---

## Physical Situation

A flat universe containing matter and dark energy, observed through Type Ia supernovae at three redshifts (0.2, 0.5, 0.8). The learner changes the share of the universe's energy that is dark energy, from none (matter only) up to 90%, and the experiment computes how far away, and how bright, each supernova would appear.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **The universe is "flat," and contains only matter and dark energy.** Matter's share is 100% minus dark energy's share. Light and other radiation, which matter only very early on, are left out; for the redshifts used here (up to 0.8) that is a good approximation, but it is an approximation.
- **Dark energy is a constant** (the simplest model, called a cosmological constant): the same energy density in every bit of space at all times, never diluting as space expands. Whether it is exactly constant is an open research question and is not tested here.
- **The Hubble constant is the same illustrative value as Experiment 1** (70 km/s/Mpc), with the same real caveat (the Hubble tension, 67–73 km/s/Mpc).
- **Supernovae are treated as perfect standard candles.** In reality astronomers calibrate and correct for small differences between them.
- **The "observed" reference curve is not raw data.** It is the best-fit model astronomers have found to real supernova observations, with dark energy at about 70% of the total (a rounded value; the real fit is close to this). It stands for what is measured; it is not a plot of individual real supernovae.
- **Only redshifts up to 1 are shown.**
- **No claim is made about what dark energy is.**

### Not introduced

What dark energy is made of, whether it changes over time, the full cosmic energy budget in detail, radiation's role in the early universe, curved (non-flat) universes, and how real supernova data are calibrated. All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16).

---

## Physics Model

One new, self-contained module. It deliberately **reuses** Experiment 1's Hubble constant and speed of light unchanged (imported, not redefined), so this experiment can never silently drift from them.

For a flat universe with matter share `1 − Λ` and dark energy share `Λ`, the expansion rate at redshift `z`, relative to today's, is:

`E(z) = sqrt( (1 − Λ) × (1 + z)³ + Λ )`

The distance light has traveled to reach us from redshift `z` (the "comoving distance") is `D(z) = (c / H0) × ∫ from 0 to z of dz′ / E(z′)`, and the **luminosity distance**, the distance inferred from how dim a standard candle looks, is `d_L = (1 + z) × D(z)`. These are standard, exact results for this model; the integral is evaluated numerically.

```typescript
// src/physics/darkEnergyExperiment.ts

// Reused unchanged from hubblesLawExperiment.ts (imported, not redefined).
import { HUBBLE_CONSTANT_KM_PER_S_PER_MPC, REAL_SPEED_OF_LIGHT_KM_PER_S } from './hubblesLawExperiment'

// A given, rounded best-fit value (real fits are close to this); used only for the "observed" reference curve.
export const BEST_FIT_DARK_ENERGY_FRACTION = 0.7

export const MAX_DARK_ENERGY_FRACTION = 0.9
export const SUPERNOVA_REDSHIFTS = [0.2, 0.5, 0.8]
export const MAX_REDSHIFT = 1

// E(z) above. darkEnergyFraction in [0, 1].
export function expansionRateRatio(redshift: number, darkEnergyFraction: number): number

// (c / H0) x the integral of dz / E(z), by Simpson's rule (a standard numerical method; documented here
// as the approximation used to evaluate an exact integral).
export function comovingDistanceMpc(redshift: number, darkEnergyFraction: number): number

// (1 + z) x comoving distance: the distance a standard candle's dimness implies.
export function luminosityDistanceMpc(redshift: number, darkEnergyFraction: number): number

// Observed brightness relative to the matter-only prediction: (d_matter-only / d_chosen)^2.
// 1 = same as matter-only; below 1 = dimmer, because the supernova is farther than matter-only predicts.
export function brightnessRelativeToMatterOnly(redshift: number, darkEnergyFraction: number): number

// Today's deceleration parameter for this model: 0.5 - 1.5 x darkEnergyFraction. Positive = the
// expansion is slowing down; negative = it is speeding up; zero at a dark energy share of 1/3.
export function decelerationParameter(darkEnergyFraction: number): number

export interface SupernovaResult {
  redshift: number
  matterOnlyDistanceMpc: number
  distanceMpc: number
  brightnessRelativeToMatterOnly: number
}

export interface DarkEnergyResult {
  darkEnergyFraction: number
  supernovae: SupernovaResult[]
  curve: Array<{ redshift: number; brightnessRelativeToMatterOnly: number }>
  decelerationParameter: number
  isExpansionAccelerating: boolean
}

export function runDarkEnergyExperiment(darkEnergyFraction: number): DarkEnergyResult
```

Values worked out from this model at H0 = 70 km/s/Mpc, for the specification and the tests:

| Redshift | Distance, matter only (Mpc) | Distance, 70% dark energy (Mpc) | Brightness relative to matter-only |
|---|---|---|---|
| 0.2 | 896 | 980 | 0.84 |
| 0.5 | 2358 | 2833 | 0.69 |
| 0.8 | 3926 | 5018 | 0.61 |

At redshift 0.5, the supernova is about 20% farther than a matter-only universe predicts, so it looks about 31% dimmer. Today's deceleration parameter is +0.5 with no dark energy (slowing) and −0.55 with 70% (speeding up).

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser.

---

## Learner Controls

- **Dark energy share**, a slider from 0% ("none, matter only") to 90%, with two one-click presets, "None (matter only)" and "The best fit to observations (about 70%)" (matching this chapter's presets-plus-continuous-control pattern). Labeled in plain language as the share of the universe's total energy, with matter making up the rest.
- **Run**, which plays a fixed-duration animation (independent of the physics result, per `CLAUDE.md` §11).

---

## Prediction Activity

Before the control and results are shown, the learner answers two questions in sequence (not scored):

1. "If the universe contained only matter, how would gravity affect the expansion?" (Slow it down / Speed it up / Not change it)
2. "Now suppose the expansion were speeding up instead. A faraway supernova's light would travel through space that has been stretching faster and faster. Compared with a universe that is slowing down, would that supernova look brighter, the same, or dimmer?" (Brighter / The same / Dimmer)

The control is disabled until both predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the chosen share.

---

## Experiment Behavior

### Display

- **Supernova view (labeled):** a row of three supernovae at redshifts 0.2, 0.5 and 0.8, each drawn as a glowing circle whose brightness follows the chosen model, with a dashed outline showing the brightness a matter-only universe would predict. Each is labeled with its redshift. A live readout lists each supernova's distance (matter-only and chosen) and brightness relative to matter-only.
- **Graph (labeled):** brightness relative to the matter-only prediction (vertical) versus redshift (horizontal). Three visually distinct lines: the **matter-only prediction** (flat at 1), the **prediction with the chosen dark energy** (moves with the control), and the **astronomers' best fit** (the reference curve at 70%). Axis labels with units; a legend.
- A **today's expansion** readout: "slowing down" or "speeding up", from the sign of the deceleration parameter.
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are submitted.
- The graph, the supernova view's matter-only outlines, and the caption appear only after predictions are locked in, so they do not give away prediction 2 (`CLAUDE.md` §12).

### Results

States the chosen dark energy share, each supernova's distance and brightness relative to matter-only, and whether today's expansion is speeding up or slowing down; says whether the chosen share matches the best fit (within a stated tolerance) and what too little or too much does; compares both of the learner's predictions to what the model gives; shows the nearby-object consistency (at a very small redshift every share gives essentially the same distance, as in Experiment 1); includes real-world grounding (the two research teams' 1998–99 supernova results and the 2011 Nobel Prize in Physics); and restates the model caveats. Includes simple math, per `CLAUDE.md` §15: at redshift 0.5, the matter-only distance is about 2358 Mpc and, with 70% dark energy, about 2833 Mpc, so brightness falls by (2358 ÷ 2833)² ≈ 0.69, about 31% dimmer.

### Introductory text

To be drafted during implementation, covering: the question (has the expansion been speeding up or slowing down?), what happens, the learner's job (both predictions), what to look for, new terms defined in plain language before use (**Type Ia supernova / standard candle**, **dark energy**), reuse of "redshift" and "Mpc" from earlier experiments without redefining them, a daily-life picture (a car's headlights looking dimmer the farther away the car is, which does not hint at the experiment's result), and the assumptions above. Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "Compare the line for a matter-only universe with the line for your chosen dark energy. What do you notice as redshift increases?"
  2. Prediction comparison: the learner's two predicted answers beside what the model gave.
  3. Conceptual question: "If distant supernovae look dimmer than a slowing universe predicts, what must have happened to the expansion while their light was on its way to us?" — intended to let the learner reason toward a speeding-up expansion without the tutor stating it outright.
  4. Explanation: (1) a standard candle's dimness gives its distance, with brightness falling as the square of the distance; (2) with matter only, gravity slows the expansion; (3) real distant supernovae look dimmer, so they are farther than expected and the expansion has been speeding up, as two teams found in 1998 and shared the 2011 Nobel Prize in Physics for; (4) **dark energy** is the name for whatever drives the speed-up; astronomers estimate it makes up about 70% of the universe's total energy today (with dark matter about 25% and ordinary matter about 5%); its nature is unknown, and the simplest model, a constant energy density of empty space, is used here, while whether it stays constant over cosmic time is an open research question; (5) it is different from dark matter (Experiment 4), which pulls inward; (6) for nearby objects every model agrees, which is why Experiment 1's simple formula worked for nearby galaxies; (7) not covered: what dark energy is, whether it changes, radiation, curved universes, and real supernova calibration.

---

## Required Physics Tests

1. With no dark energy, `comovingDistanceMpc(z, 0)` equals the exact matter-only result `(2c / H0)(1 − 1/sqrt(1 + z))` (a closed-form check on the numerical integral).
2. With all dark energy (`Λ = 1`), `comovingDistanceMpc(z, 1)` equals `c z / H0` exactly (a second closed-form check).
3. At a very small redshift (for example 0.01), the luminosity distance is within 2% of `c z / H0` for any dark energy share, and inverting it with Experiment 1's `cosmologicalRedshift` recovers `z` within 2% (the nearby-object consistency with Experiment 1).
4. For any fixed redshift above 0, a larger dark energy share gives a strictly larger luminosity distance.
5. `brightnessRelativeToMatterOnly` equals 1 at `Λ = 0`, and is below 1 for `Λ > 0`.
6. At `Λ = 0.7`, the brightness relative to matter-only strictly decreases as redshift increases across 0.2, 0.5, 0.8, with the 0.5 value between 0.6 and 0.8 (the "dimmer, and more so farther away" premise).
7. `decelerationParameter(0)` is +0.5, `decelerationParameter(0.7)` is −0.55, and `decelerationParameter(1/3)` is 0, so the speeding-up threshold is as stated.
8. Convergence: doubling the number of integration steps changes the distance by less than a tiny relative amount, confirming the numerical integral is accurate.
9. The module imports `HUBBLE_CONSTANT_KM_PER_S_PER_MPC` and `REAL_SPEED_OF_LIGHT_KM_PER_S` from `hubblesLawExperiment` rather than redefining them, and does not import from `darkMatterExperiment` or `cosmicMicrowaveBackgroundExperiment` — a regression check that dark energy stays independent of the dark matter and CMB physics (`CLAUDE.md` §8).

---

## Decisions Confirmed

Confirmed by the owner via question on 2026-10-06, before this draft:

1. **Topic:** dark energy and the accelerating expansion, over gravitational lensing and the CMB's ripples.

---

## Further Decisions Confirmed

Confirmed by the owner on 2026-10-06, approving the specification as drafted. Each item below is confirmed as proposed.

1. **Title and placement.** Proposed: "Dark Energy: Is the Expansion Speeding Up?" as Cosmology Experiment 5.
2. **The "observed" curve is the best-fit model, not raw data.** I cannot reproduce individual real supernova measurements without fabricating or hand-copying data, so the reference line is the model astronomers fit to them, labeled as such. The alternative is to omit the observed line and compare only the chosen share against matter-only, which is more honest but gives the learner no target to aim for.
3. **Slider range and labeling.** Proposed: 0% to 90% of the total energy, with a preset at 70%. The preset reveals the "answer" to the control, though not to the predictions. The alternative is an unlabeled slider.
4. **Numerical integration (Simpson's rule) rather than a closed form.** A closed form exists only for special cases (matter-only and all-dark-energy), which the tests use as checks; the general case needs a numerical integral. I propose documenting it as a standard numerical method, with the two exact cases as tests.
5. **Real-world grounding scope.** Proposed: the 1998–99 results and the 2011 Nobel Prize, and the "about 70% / 25% / 5%" energy split in the tutor. I will describe the two teams' work in general terms without naming individuals unless you want names. Please confirm or change.
6. **Optional age-of-the-universe link (not included by default).** With dark energy, this model's age comes out near 13.5 billion years at H0 = 70, versus 9.3 with matter only, which would tie back to Experiment 2's Hubble-time comparison. It is a second new idea, so I propose leaving it out of this experiment. Say if you want it added.
7. **Flat universe and constant dark energy.** Both are stated simplifications. Proposed as drafted; the alternative of mentioning curved universes is out of scope.
8. **The Type Ia supernova description.** Proposed wording: an exploding star whose true brightness is very nearly the same each time, or can be corrected to be. Please review the level of detail when the introduction is drafted.

---

## Relationship to Previous Experiments

- **Cosmology Experiment 1 (Hubble's Law):** this experiment is the exact version of the low-redshift relationship that experiment used, and shows it agrees for nearby objects.
- **Cosmology Experiment 2 (the Big Bang):** its tutor already mentions dark energy in passing and notes the expansion rate has changed; this experiment shows how that was found.
- **Cosmology Experiment 4 (dark matter):** both are "invisible" ingredients inferred from effects; they are different, and the tutor says so.
- **Gravitational Waves Experiment 7 (standard sirens):** a sibling idea, a standard candle (light) instead of a standard siren (gravitational waves).

## Relationship to Later Experiments

Possible further directions (none proposed here; each needs its own Stage 1–2 proposal): gravitational lensing as a further line of evidence for dark matter, the CMB's tiny ripples and structure formation, or the question of whether dark energy changes over time.

---

## Success Criteria

1. The learner makes both predictions before the graph, the matter-only outlines, and the control are shown.
2. Moving the dark energy share visibly changes both the supernova brightness and the graph, not just a number.
3. With no dark energy, the matter-only prediction and the chosen prediction coincide; with a larger share, distant supernovae are clearly dimmer, and more so at higher redshift.
4. All three graph lines, and the supernova view's outlines, are visually distinct, labeled, and explained in the caption.
5. The Results panel correctly compares both of the learner's predictions to what the model gives.
6. The model caveats (flat, matter plus constant dark energy only, perfect standard candles, the "observed" curve being a best fit) are stated in the introduction, Results, and tutor.
7. The experiment states plainly that dark energy is inferred from this observation, that its nature is unknown, and that whether it is constant is an open question.
8. "Type Ia supernova / standard candle" and "dark energy" are each defined in plain language at first use; "redshift" and "Mpc" are reused, not redefined (`CLAUDE.md` §15).
9. The experiment shows that nearby objects agree across all models, tying back to Experiment 1.
10. No existing experiment's physics is modified or recomputed.

---

## Implementation Notes

Not yet implemented. The specification is approved. Per `CLAUDE.md` §23 Stage 5 and §6, implementation proceeds one step at a time, starting with the physics model and its tests.
