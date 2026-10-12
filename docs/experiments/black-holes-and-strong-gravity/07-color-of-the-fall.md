# Black Holes and Strong Gravity — Experiment 7: The Color of the Fall — What Color Does the Falling Traveler's Light Have?

**Status: APPROVED by the owner on 2026-10-12, with all nine "Decisions Needing Human Review" items taken as Claude's recommended defaults. Proposed by Claude per `CLAUDE.md` §23 Stages 1–2 on 2026-10-12, in response to the milestone after Experiment 6, and the direction (the color of the traveler's lamp, with brightness left out) was chosen by the owner the same day. Drafted as a specification per Stage 3. To be built one step at a time (§6); nothing is implemented yet. Learner-facing wording (introduction, prediction questions, captions, Results, tutor) is subject to the owner's line-by-line review when it is drafted (§28.1).**

---

## Overview

Experiment 6 asked what a far-away observer actually receives from a traveler who falls into a black hole, and found that flashes sent at equal steps of the traveler's watch arrive further and further apart. The stretch factor, the gap as received divided by the gap as sent, grows without limit toward the horizon. Experiment 6 left one question open on purpose (its "Not introduced" list and Decision 6): **if the observer cannot see the traveler's watch tick evenly, what happens to the traveler's light itself? What color would it be?**

This experiment answers it with no new physics beyond what Experiment 6 already gives. A steady lamp of one color shines from the traveler. A wave of light is a series of crests, and the crests behave exactly like Experiment 6's flashes: they are sent at equal steps of the lamp's own period (the lamp is on the traveler), and they arrive stretched apart by the same stretch factor. The **wavelength**, the distance from one crest to the next, is the speed of light times the time between crests, so it is stretched by the same factor.

The traveler carries a lamp of green light with a wavelength of 550 nanometers (nm). The observer, far away, receives it with a wavelength of 550 nm times the stretch factor. The learner picks a black hole and a release distance, runs the fall, and watches the received color move along a strip from violet through red and then out of the visible range, into infrared and then microwaves. The graph shows the received wavelength against the traveler's distance above the horizon.

The new idea is one thing: **the light's color is stretched by the same factor as the flash spacing in Experiment 6. For a fall from 10 horizon radii, green light is already past red and in the infrared before the traveler is halfway to the horizon (at about 6.8 horizon radii), and the wavelength keeps growing without limit toward the horizon (about 10 millimeters, a microwave, at 0.0001 horizon radii from it).**

The experiment is a **thought experiment** about a small lamp that shines light straight outward to an observer very far away, for a non-rotating, uncharged black hole. It follows only the wavelength. It does not model how bright the light is.

---

## Learning Objective

After this experiment, the learner should understand:

1. **A light wave is a train of crests, and the crests behave like Experiment 6's flashes.** The lamp sends one crest at equal steps of its own period (for 550 nm, about 1.8 millionths of a billionth of a second, a number the experiment states). The observer receives them stretched apart, by the same stretch factor as in Experiment 6. The wavelength, the distance between crests, is the speed of light times the time between them, so it is multiplied by that same stretch factor.
2. **Falling away from a black hole makes the light redder.** The received wavelength is 550 nm times the stretch factor. From rest at 10 horizon radii the factor is 1.054 at the release (gravity alone: the traveler is not yet moving), so the light is already 580 nm, slightly yellower than green. At 5 horizon radii it is 1.58, so 870 nm. At 2 horizon radii it is 3.16, so 1739 nm. This is called **redshift**, as in Gravitational Waves Experiment 5.
3. **The light leaves the visible range well before the horizon.** The eye responds to wavelengths from about 380 to 750 nm (general knowledge, not checked against a primary source). Green leaves it, passing 750 nm, at 6.83 horizon radii from a release at 10, at 12.7 from a release at 100, at 9.24 from a release at 20 and at 4.43 from a release at 5. From a release at 2 it is already past 750 nm at the release (778 nm), because gravity alone gives a factor of 1.41.
4. **It does not stop at infrared.** From a release at 10 the wavelength is 105 micrometers (µm) at 0.01 horizon radii above the horizon, 1.04 millimeters (mm) at 0.001 and 10.4 mm at 0.0001, which is microwave. Each tenfold closing of the distance multiplies it by 10, and it has no limit. (It would reach radio waves, longer than 1 m, at about 0.000001 horizon radii from the horizon, beyond where the pictures end.)
5. **It does not depend on the black hole's mass.** At a given distance in horizon radii the stretch factor is the same for all three black holes, as in Experiments 2, 5 and 6, so the wavelength is too. Only the distance in kilometers changes.
6. What the experiment does not say: how bright the light is (the experiment leaves brightness out, Decision 1), what a camera or telescope would show, whether a real detector could pick up light of these wavelengths, or anything inside the horizon.

---

## Physical Situation

A small traveler falls straight toward a black hole from rest at a chosen distance, as in Experiments 5 and 6. The traveler carries a **lamp that shines a steady beam of green light, 550 nm, straight outward** toward a very distant observer. The lamp's color is what it is on the traveler, measured by the traveler. The observer, at rest very far away, measures the wavelength they receive.

### The equations (given, not derived)

With `r` in horizon radii (`r_s = 1`), `r0` the release distance, `E = √(1 − 1/r0)`, for a non-rotating, uncharged black hole, from standard general relativity (the same as Experiment 6):

```
the stretch factor:         (1 + z) = [E + √(1/r − 1/r0)] ÷ (1 − 1/r)        (Experiment 6)
the received wavelength:    λ_received = λ_emitted × (1 + z)                  (given here)
the lamp:                   λ_emitted = 550 nm
```

The second line is given, not derived. In plain language it says that the crests of a light wave are stretched apart exactly as Experiment 6's flashes are, so the distance between crests, which is the speed of light times the time between them, grows by the same factor. It is the standard redshift relation of general relativity for a source and an observer in this situation.

### Facts the model reproduces (computed, not looked up; the tests check them)

- The wavelength at any `r` equals 550 nm times the stretch factor of Experiment 6 (the two agree).
- At release the factor is `1 ÷ √(1 − 1/r0)`, so the wavelength is 550 nm times that (580 nm at 10, 553 nm at 100, 778 nm at 2).
- The wavelength increases as `r` falls from `r0` toward 1 (monotonic).
- Near the horizon each tenfold closing of the gap multiplies the wavelength by 10 (to within 1%).
- At the same distance in horizon radii, the wavelength is the same for all three black holes.

### Illustrative results (computed in a feasibility check on 2026-10-12, in a scratch script outside the project; the tests will check them)

A fall from rest at 10 horizon radii. The lamp is 550 nm.

| Distance from center | Stretch factor | Received wavelength | Band |
|---|---|---|---|
| 10 (release) | 1.054 | 580 nm | visible (yellow-green) |
| 7 | 1.348 | 742 nm | visible (deep red) |
| 5 | 1.581 | 870 nm | infrared |
| 3 | 2.148 | 1181 nm | infrared |
| 2 | 3.162 | 1739 nm | infrared |
| 1.5 | 5.104 | 2807 nm | infrared |
| 1.1 | 20.33 | 11.2 µm | infrared |
| 1.01 | 191.1 | 105 µm | infrared |
| 1.001 | 1,899 | 1.04 mm | microwave |
| 1.0001 | 18,975 | 10.4 mm | microwave |
| 1 (the horizon) | no limit | no limit | |

Where the received light passes 750 nm (leaves the visible range), 1 mm (becomes microwave) and 1 m (becomes radio), by release distance:

| Release distance | Factor at release | Wavelength at release | Passes 750 nm at | Passes 1 mm at (gap above horizon) | Passes 1 m at (gap above horizon) |
|---|---|---|---|---|---|
| 100 | 1.005 | 553 nm | 12.74 | 0.0011 | 0.0000011 |
| 20 | 1.026 | 564 nm | 9.24 | 0.00107 | 0.0000011 |
| 10 | 1.054 | 580 nm | 6.83 | 0.00104 | 0.0000010 |
| 5 | 1.118 | 615 nm | 4.43 | 0.00099 | 0.0000010 |
| 2 | 1.414 | 778 nm | already past at release | 0.00078 | 0.00000078 |

The wavelengths do not depend on the black hole. Only the distances in kilometers do.

### The black holes

Reused unchanged from Experiment 1: the stellar black hole (10 Suns, horizon radius about 29.5 km), Sagittarius A* (about 4.3 million Suns, about 12.7 million km) and M87* (about 6.5 billion Suns, about 19 billion km). Results depend only on the release distance in horizon radii; only the distances in kilometers change with the black hole.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **A thought experiment about a small lamp** that shines light of one color, 550 nm, straight outward from a traveler who falls straight in from rest. The lamp's own gravity does not matter.
- **The observer is at rest, very far away.**
- **The equations are given, not derived,** for a black hole that does not spin and has no electric charge. Real black holes usually spin, which changes the details.
- **Only the wavelength is modeled.** How bright the light is, how a camera or telescope would show it, and whether a real detector could pick up light of these wavelengths are not.
- **The ranges of the colors** (visible, infrared, microwave, radio) are the usual textbook ranges. Their edges are conventions, not sharp boundaries.
- **The experiment stops at the horizon.** Nothing inside it is modeled.

### Not introduced

The brightness (the energy or the number of photons arriving per second) and how it changes, the lamp's beam spreading or being squeezed, the black hole's appearance in a picture or its "shadow", what the traveler sees on the way in, color other than the wavelength (no colored image is simulated), Hawking radiation, spinning (Kerr) black holes, any inside-the-horizon story. All explicitly out of scope (`CLAUDE.md` §16). The tutor may name a few of them in one sentence each as things the model does not cover.

---

## Physics Model

One new, self-contained module, in the style of Experiments 2 to 6. It **reuses** earlier code unchanged (imported, not redefined): `horizonRadiusKm` and `OBJECT_PRESETS` from Experiment 1 of this group (`blackHoleSizeExperiment.ts`). It **restates** the stretch-factor formula in one line (as Experiments 3, 4 and 6 restated theirs); a test checks it against Experiment 6's figures from its specification, not by import, and a regression test checks that the module does not import any other experiment's module (Decision 2). It adds nothing else from earlier experiments.

```typescript
// src/physics/colorOfTheFallExperiment.ts

export const MIN_START_IN_HORIZON_RADII = 2
export const MAX_START_IN_HORIZON_RADII = 100
export const LAMP_WAVELENGTH_NM = 550              // green
export const SMALLEST_GAP_IN_HORIZON_RADII = 0.0001 // where the graph ends, as in Experiment 6
export const BLACK_HOLE_PRESETS: ObjectPreset[]

// The usual ranges of light, in nm (general knowledge; the edges are conventions):
export const BANDS: Array<{ name: 'ultraviolet' | 'visible' | 'infrared' | 'microwave' | 'radio'; fromNm: number; toNm: number }>

export function bandOf(wavelengthNm: number): string

// The stretch factor of Experiment 6, restated.
export function stretchFactor(startInHorizonRadii: number, rInHorizonRadii: number): number
// The wavelength the observer receives from the lamp when the traveler is at r.
export function receivedWavelengthNm(startInHorizonRadii: number, rInHorizonRadii: number): number

// The distance (horizon radii from the center) at which the received wavelength first passes the given value,
// or null if it already does at release.
export function distanceWhereWavelengthPasses(startInHorizonRadii: number, wavelengthNm: number): number | null

export interface ColorOfTheFallResult {
  preset: ObjectPreset
  horizonRadiusKm: number
  startInHorizonRadii: number
  wavelengthAtReleaseNm: number
  leavesVisibleAt: number | null     // distance from the center, horizon radii; null if already past at release
  becomesMicrowaveAtGap: number      // gap above the horizon, horizon radii
  curve: Array<{ gap: number; stretch: number; wavelengthNm: number; band: string }> // for the graph, geometric in the gap
}

export function runColorOfTheFallExperiment(presetId: ObjectPreset['id'], startInHorizonRadii: number): ColorOfTheFallResult
```

Structured independently of the UI (`CLAUDE.md` §9): pure functions, testable with no browser. The playback speed (a fixed real duration, independent of the result) does not change any result (`CLAUDE.md` §11).

---

## Learner Controls

- **The black hole:** a stellar black hole (10 Suns), Sagittarius A*, or M87*.
- **The release distance,** in horizon radii: presets **100, 20, 10, 5, 2** (as in Experiments 5 and 6). The distance in kilometers (and AU where natural) is shown beside it.
- **Run,** which plays the fall over a fixed real duration independent of the physics (`CLAUDE.md` §11).

There is no control for the lamp's color (Decision 3).

---

## Prediction Activity

Before the controls and results are shown, the learner answers three questions in sequence (not scored):

1. "A traveler falling into a black hole shines a steady green lamp straight outward to a far-away observer. As the traveler falls, what happens to the color the observer receives?" (It stays green / It turns bluer, a shorter wavelength / It turns redder, but only up to a point, then stays the same / It turns redder and keeps on getting redder, with no limit.) The model's answer is the fourth. The second is the tempting wrong answer ("falling toward something"), and the third is the tempting answer by analogy with Experiment 5's clock.
2. "For a fall from rest at 10 horizon radii, does the lamp's light stay visible to the eye all the way down?" (Yes, all the way to the horizon, only dimmer / Yes, until the traveler is very close to the horizon / No, it stops being visible light well before the horizon.) The model's answer is the third (green passes 750 nm at 6.83 horizon radii, so the traveler is still more than 5 horizon radii above the horizon).
3. "Would the color the observer receives at 5 horizon radii from the center be different for a 10-Sun black hole and for M87*?" (Yes, much redder for the small one / Yes, much redder for the big one / No, the same.) The model's answer is the third, as in Experiments 2, 5 and 6.

The controls are disabled until all three predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the choices. The pictures, captions, Results and tutor appear only after predictions are locked in (`CLAUDE.md` §12). The choices need the owner's wording review (see Decision 6).

---

## Experiment Behavior

### Display

Two pictures, one above the other:

- **Picture 1, "The color of the lamp, as received" (a color strip).** A horizontal strip of colors on a logarithmic wavelength axis from 100 nm to 10 meters, with the bands labeled on the canvas (ultraviolet, visible drawn as the rainbow, infrared, microwave, radio) and the wavelength marks (500 nm, 1 µm, 1 mm, 1 m). A **green marker** shows the lamp's own wavelength (550 nm, "as emitted by the lamp") and stays put. An **orange marker** shows the wavelength as received, and slides to the right as the traveler falls, with its value and band written beside it. A small side picture shows the traveler and the observer with a line of "crests" between them, drawn closer together at the lamp and further apart at the observer, with the stretch factor beside it. A live readout gives the traveler's distance from the center and from the horizon, the stretch factor, and the wavelength.
- **Picture 2, "The wavelength against the traveler's distance" (a graph).** Horizontal: the traveler's gap above the horizon, in horizon radii (log scale, from the release distance at the left to 0.0001 at the right; the traveler falls to the right, as in Experiment 6). Vertical: the received wavelength (log scale). An orange curve, a dashed line at 550 nm ("the lamp's own color, if nothing stretched it"), and bands drawn as shaded horizontal stripes, labeled, with the visible band's red edge (750 nm) and the 1 mm edge marked. A dot at the current position during playback. The curve is drawn to 0.0001 and labeled "keeps going, no limit".
- Each picture has its own **"How to read this picture" caption** directly under it, shown after predictions are locked in, in the step-by-step style of the earlier experiments, and with what Experiment 6 now has: a paragraph "What is really happening" and a paragraph "How the picture shows it" (`CLAUDE.md` §14). The captions must say what each drawn thing is, what a wavelength is, what "as emitted" and "as received" mean, that the lamp is on the traveler, that each band is a range of wavelengths, that "the gap above the horizon" is a distance (as in Experiment 6's caption), and that the experiment follows the wavelength only.
- **Live readout:** the black hole, the release distance (horizon radii and kilometers), the traveler's distance, the stretch factor, the wavelength and its band.

### Results

States the black hole and release distance, the received wavelength at the release, at half the distance to the horizon and at 0.0001 horizon radii above the horizon, the distance at which it leaves the visible range (or that it already has), the gap at which it becomes microwave, and that it has no limit; compares all three predictions with the model; includes simple math per `CLAUDE.md` §15, for example the received wavelength at 5 horizon radii worked as `550 nm × 1.581 = 870 nm` with the stretch factor worked from the formula as in Experiment 6 and the period of the light (`550 nm ÷ 300,000 km/s ≈ 1.8 × 10⁻¹⁵ s`) stretched in the same ratio, using only quantities the experiment defines; includes a daily-life comparison; and states the model's limits in a prominent bordered box (`CLAUDE.md` §28.1 pattern).

The daily-life comparison (to be confirmed, kept out of the introduction so it does not reveal the answers): the siren of an ambulance driving steadily away from you sounds lower than when it is parked, because its sound waves are stretched out. It is an analogy for the **motion part** only. There is no everyday comparison for the **gravity part**, which relies on Experiment 2.

### Introductory text

To be drafted during implementation, covering the question (what color does the traveler's light have when it reaches the far-away observer?), what happens (step by step), the learner's job, what to look for, new terms defined in plain language before use (**wavelength**, **nanometer** (nm) with its everyday scale, **infrared**, **microwave**, **radio waves**, **visible light**, **as emitted**, **as received**, with **stretch factor**, **horizon**, **horizon radius** and **redshift** recalled from Experiments 6 and 5, and **gap above the horizon** recalled from Experiment 6), what it builds on (Experiment 6's flashes and stretch factor, Experiment 2's slowed clock, and Gravitational Waves Experiment 5's receding source), a "Why even ask this" paragraph that follows the style of Experiments 5 and 6 (put the learner in the observer's place, watching a friend fall in with a green lamp, and ask what color they would see, without giving the answer), and the assumptions above. The introduction says plainly that the equations are given and not derived, and that they are for a non-rotating black hole. It says that a wave is a train of crests, **but not** that the crests are stretched like the flashes (that is the tutor's conceptual question and explanation). Any statement that gives away the prediction answers (that the light turns red, that it has no limit, that it leaves the visible range, that the mass does not matter) is kept out of the introduction (`CLAUDE.md` §12). Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **After "Run" completes:**
  1. Observation: "Look at the color strip and the graph. What happens to the orange marker as the traveler falls, and when does it leave the rainbow? Now try a different release distance and compare."
  2. Prediction comparison: the learner's three predicted answers beside what the model gave.
  3. Conceptual question: "In Experiment 6 the traveler's flashes arrived further apart. Here the traveler's lamp arrives with a longer wavelength. Why might the same number change both?" — intended to let the learner reach "the crests of a light wave are like flashes sent at equal steps, so if the gap between them is stretched, so is the distance between them".
  4. Explanation: (1) a light wave is a train of crests, and they are like Experiment 6's flashes; the distance between crests is the speed of light times the time between them (simple math: 550 nm ÷ 300,000 km/s is about 1.8 × 10⁻¹⁵ s, and a stretch factor of 1.58 makes it about 2.9 × 10⁻¹⁵ s); (2) so the wavelength is multiplied by the same stretch factor (the numbers: 580, 870, 1739 nm, 105 µm, 1.04 mm, 10.4 mm, for the fall from 10, with the ×10-per-tenfold-closing pattern); (3) the two causes still multiply (gravity, Experiment 2; motion, Gravitational Waves Experiment 5), with the worked 5-horizon-radii example and the siren; (4) why it is called redshift (a longer wavelength of visible light is redder) and why it is called that even when the light is no longer visible; (5) the light leaves the visible range well before the horizon (6.83 from a release at 10), so a traveler with a green lamp would not be seen by an eye looking at the lamp's own color long before the traveler crosses, and the wavelength keeps growing without limit; (6) the color does not depend on the black hole's mass, only on the distance in horizon radii; (7) how this finishes the question left open in Experiment 6, and ties back to Experiment 2's slowed clock and Gravitational Waves Experiment 5's redshift; (8) honest limits: only the wavelength is modeled, not how bright the light is, what a camera or telescope would show, or whether a real detector could pick up the longest wavelengths; nothing inside the horizon; non-rotating, uncharged, equations given not derived; the ranges of the bands are conventions. One optional sentence (Decision 1) may say that each photon arriving carries less energy and photons arrive less often, both in the ratio of the stretch factor, and that this is **not** a statement of how bright an object would look.

---

## Required Physics Tests

1. `stretchFactor(r0, r)` agrees with Experiment 6's figures from its specification (not by import): 1.054 at release from 10, 1.581 at 5, 3.162 at 2, 191.1 at 1.01 and 18,975 at 1.0001; at release it equals `1 ÷ √(1 − 1/r0)`; it throws a `RangeError` for `r` at or below 1 and for `r` above `r0`.
2. **`receivedWavelengthNm(r0, r)` equals `LAMP_WAVELENGTH_NM × stretchFactor(r0, r)`** at several distances, and equals `LAMP_WAVELENGTH_NM × (1 + z)` with `z` computed in the test file from the traveler's speed relative to a static observer, `γ(1 + β) − 1` with `γ = E ÷ √(1 − 1/r)` and the gravity part, not from the module's own formula.
3. **The wavelength is monotonic:** it increases as `r` falls from `r0` toward 1, for several `r0`.
4. **Near the horizon the wavelength has no limit:** each tenfold closing of the gap multiplies it by 10, to within 1%, between 1.01 and 1.0001, and `wavelength × (r − 1)` approaches `550 × 2E`.
5. **Illustrative-table values** (from 10 horizon radii: 580 nm at release, 742 nm at 7, 870 nm at 5, 1739 nm at 2, 105 µm at 1.01, 10.4 mm at 1.0001) match to within 0.5%.
6. **`distanceWhereWavelengthPasses(r0, 750)`** returns 12.74, 9.24, 6.83 and 4.43 (to within 0.01) for releases at 100, 20, 10 and 5, and `null` for a release at 2 (where the wavelength at release, 778 nm, is already past it); a returned distance, put back into `receivedWavelengthNm`, gives 750 nm within 0.01%.
7. **The band boundaries:** `bandOf` returns "visible" for 550, 750 nm and 380 nm and "infrared" just above 750 nm, "microwave" for 1 mm and 10 mm, "radio" for 1 m and above, and "ultraviolet" for 300 nm.
8. **The wavelength is the same for the three black holes** at the same release distance in horizon radii; only `horizonRadiusKm` changes.
9. **Reuse:** the module imports `horizonRadiusKm` and `OBJECT_PRESETS` from `blackHoleSizeExperiment` and does not import `seeingTheFallExperiment`, `fallingInExperiment`, `timeNearBlackHoleExperiment`, `orbitsNearBlackHoleExperiment`, `lightNearBlackHoleExperiment`, `blackHoleExperiment` or `orbitExperiment` (a regression test, as in Experiments 3 to 6).
10. **Determinism:** the same inputs give the same result.
11. **Validation:** a release distance not finite, at or below 1, or (in the experiment function) outside 2 to 100 throws a `RangeError`; a wavelength that is not positive and finite throws; the module does not clamp.
12. **Playback speed does not change the result** (`CLAUDE.md` §11): the result is computed from the black hole and release distance alone, with no wall-clock input.

---

## Decisions Needing Human Review

Each shows Claude's recommended default as used above.

1. **Brightness.** Default: leave it out, and say so plainly. The total brightness of a lamp depends on more than the stretch factor (how the beam is spread, the angle of the light, the area), which this specification cannot check. The one statement that follows directly from the stretch factor is that each photon arriving carries less energy and photons arrive less often, both in the ratio of the stretch factor, and the tutor may say this in one optional sentence marked as **not** a statement of how bright an object looks. Alternative: no mention of photons at all (simpler).
2. **Restating Experiment 6's formula, rather than importing it.** Default: restate it in one line in this module (as Experiments 3, 4 and 6 restated theirs), check it against Experiment 6's figures from its specification, and forbid imports of the other experiments' modules by a regression test. Alternative: import `stretchFactor` from Experiment 6 (no duplicate, but the experiments are no longer independent).
3. **One fixed lamp.** Default: one lamp, green, 550 nm, with no color control. Alternative: a choice of red, green and blue lamps (shows that blue light needs a bigger stretch to leave the visible range; adds a control and more to explain).
4. **The band edges.** Default: the usual ranges (visible 380 to 750 nm, infrared to 1 mm, microwave to 1 m, radio beyond), stated as conventions and **not checked against a primary source**. Alternative: draw only "visible" and "not visible".
5. **Where the pictures end.** Default: 0.0001 horizon radii above the horizon, as in Experiment 6, so the received light reaches microwaves (10.4 mm) but **not** radio (which needs about 0.000001, beyond the end). The spec says so. Alternative: extend the graph to 0.000001 to reach radio (a wider range to read on the axis).
6. **The three predictions and their choices.** Default as above; the wording, especially Prediction 1's two tempting wrong answers (bluer; redder up to a point) and Prediction 2, needs the owner's review. Prediction 1 has four choices, where Experiment 6's had three. Alternative: three choices (drop "redder, up to a point").
7. **The daily-life comparison.** Default: the siren of an ambulance driving away, labeled as an analogy for the motion part only, none for the gravity part. Alternative: the friend tossing balls (already used in Experiment 6), or none.
8. **Chapter summary and Experiment 6's "what's next".** Default: when this experiment is built, change Experiment 6's "what's next" (now "no further experiment is planned in this chapter") to point to it, in draft wording for the owner's review, as in earlier steps, and write this experiment's summary with its tutor. Alternative: leave Experiment 6's text alone.
9. **Not checked against a primary source:** the received-wavelength relation `λ_received = λ_emitted × (1 + z)` for this source and observer, the stretch-factor formula it reuses, the band edges and the eye's range of 380 to 750 nm are standard general relativity and physics stated from general knowledge. Claude checked the relation only against Experiment 6's figures and against the speed-based form of the motion part (see "Implementation Notes"). No real telescope or detector claim is made.

---

## Relationship to Previous Experiments

- **Black Holes and Strong Gravity Experiment 6 (seeing the fall):** the same fall and the same stretch factor. That experiment stretched the time between flashes; this one stretches the distance between the crests of a wave, with the same number.
- **Black Holes and Strong Gravity Experiment 2 (time near a black hole):** this experiment's gravity part is that experiment's clock-rate factor, as in Experiment 6.
- **Gravitational Waves Experiment 5 (redshift of a receding source):** this experiment's motion part is the same kind of stretching, and the word **redshift** is the same word.
- **Black Holes and Strong Gravity Experiments 1 and 5:** the horizon radius and the three black holes; the fall.
- **Gravity and Curved Spacetime Experiment 2 (gravitational time dilation):** the same idea of a clock ticking differently in gravity.

## Relationship to Later Experiments

- Nothing further is planned or approved. The topics this one deliberately leaves out (brightness, a camera's view, the black hole's shadow, spinning black holes, Hawking radiation, the inside of a black hole) are the natural candidates, but none is proposed.

---

## Success Criteria

1. The learner makes all three predictions before the pictures, captions and Results are shown.
2. Picture 1 shows the color strip with every band labeled on the canvas, the lamp's own wavelength as a fixed marker, and the received wavelength as a different, moving marker, so the contrast between emitted and received is visible (`CLAUDE.md` §14.2).
3. Both pictures label every drawn component (the strip's bands and marks, both markers, the crests, the traveler and observer, the curve, the 550 nm line, the band stripes, the edge marks), distinguish the lamp's own color from the received color, and carry their own "How to read this picture" caption with "What is really happening" and "How the picture shows it" paragraphs (`CLAUDE.md` §14).
4. The received wavelength reaches the values the model computes and keeps growing toward the horizon.
5. The Results correctly state the wavelengths, the bands, the distance at which the light leaves the visible range (or that it already has), compare all three predictions with the model, and include the worked calculation and the daily-life comparison.
6. The experiment states plainly that it is a thought experiment about a small lamp shining straight outward, that the equations are for a non-rotating, uncharged black hole and are given, not derived, that only the wavelength is modeled (no brightness, no camera or telescope view, no claim about detection), and that nothing inside the horizon is modeled.
7. The experiment connects back to Experiments 2 and 6 of this group and to Gravitational Waves Experiment 5, and does not recompute or modify any earlier experiment's physics.
8. Every specialized term is defined in plain language at first use (`CLAUDE.md` §15), and the word "gap" is not used for both a time and a distance without saying which (as fixed in Experiment 6's captions).

---

## Implementation Notes

Nothing has been built. A feasibility check was run in a scratch script outside the project on 2026-10-12 (not part of the application): the stretch factor was recomputed from the formula of Experiment 6, multiplied by 550 nm, and the distances at which the received wavelength passes 750 nm, 1 mm and 1 m were found by bisection; the numbers in the tables above come from it. Each tenfold closing of the gap multiplied the wavelength by 10 (the factor of 1,899 at 1.001 and 18,975 at 1.0001 gives 1.04 mm and 10.4 mm). **Found while checking, for the owner:** the proposal in conversation said the light would reach "infrared, then microwave, then radio"; with the pictures ending at 0.0001 horizon radii (as in Experiment 6) it reaches microwaves but not radio, which needs about 0.000001 (Decision 5). The specification says so.

- **Approval (2026-10-12):** the owner approved this specification, taking all nine "Decisions Needing Human Review" items as Claude's recommended defaults (one fixed 550 nm lamp, brightness left out, Experiment 6's formula restated rather than imported, the pictures ending at 0.0001 horizon radii so the light reaches microwaves but not radio, and the siren as the daily-life comparison). Learner-facing wording is still subject to the owner's line-by-line review when it is drafted (§28.1).

- **Step 1, physics model and physics tests (2026-10-12):** built `src/physics/colorOfTheFallExperiment.ts` and `src/physics/colorOfTheFallExperiment.test.ts` (26 tests covering all 12 "Required Physics Tests"). The stretch factor is restated in one line, not imported from Experiment 6; the received wavelength is 550 nm times it. **Independent checks in the test file:** the wavelength against 550 nm × `γ(1 + β) ÷ √(1 − 1/r)` written from the traveler's speed (within 1e-9); the stretch factor against Experiment 6's figures from its specification (1.054, 1.581, 3.162, 191.1, 18,975); the illustrative table (580, 742, 870, 1739 nm, 105 µm, 10.4 mm); the distances at which the light passes 750 nm (12.74, 9.24, 6.83, 4.43, and none for a release at 2, where it is already 778 nm); the 1 mm and 1 m gaps; the band edges, including the values just either side of 750 nm, 1 mm and 1 m; the three black holes giving identical wavelengths; no radio within the drawn range for any release distance. **Checked that the tests are not vacuous:** ten deliberate changes to the module were tried (the sign of the motion term, the denominator, the lamp's wavelength, the visible edge, the infrared edge, the microwave edge, the direction of the search, the speed of light, where the curve ends, and which wavelength counts as microwave); the first run left three of them passing (the infrared edge, the speed of light at a 0.07% error, and a redundant clamp), so two tests were tightened and the clamp was removed, and all of the changes now fail at least one test. Full Vitest run: 592 passed (566 before). No type errors in the new files. **Differences from the interface in this specification, for the owner:** (1) `lightPeriodSeconds(wavelengthNm)` was added, with the speed of light restated as a constant (299,792.458 km/s, the same value Experiment 6 imports from `hubblesLawExperiment`), because the Results and the tutor need the period of the light (the specification's "adds nothing else from earlier experiments" is kept: nothing is imported from another experiment, and a regression test forbids `hubblesLawExperiment` and `seeingTheFallExperiment` too); (2) `BANDS` and `bandOf` return a typed `BandName`; (3) `CurvePoint` holds `gap`, `stretch`, `wavelengthNm` and `band`. **Not built yet:** the interface, introduction, predictions, Results, tutor and wiring into `src/App.tsx`.

- **Step 4, basic interface (2026-10-12):** built `src/components/ColorOfTheFallExperiment.tsx` and wired it into `src/App.tsx` as chapter 7 of the "Black Holes and Strong Gravity" group. It has the black-hole buttons, the release presets (100, 20, 10, 5, 2), Run (10 seconds of real playback, independent of the result: the traveler's gap above the horizon falls by the same factor in each equal slice of it, which is presentation only), and two pictures, each with a "How to read this picture" caption (**draft wording, for the owner's review**) that includes "What is really happening" and "How the picture shows it" and defines "the gap above the horizon" as a distance. **Picture 1, the color of the lamp, as received:** a traveler with a lamp, the crests as emitted (green, 14 pixels apart) and as received (orange, that times the stretch factor, drawn to scale only up to 20 times, and the picture says so), a strip of colors on a logarithmic axis from 100 nm to 10 m with the five bands labeled on the canvas (the two narrow ones, ultraviolet and visible light, written upward inside their bands), a fixed green marker for the lamp's own 550 nm and a moving orange marker for the wavelength as received. **Picture 2, the wavelength against the traveler's distance (graph):** an orange curve over shaded stripes for each band, the dashed green line at 550 nm, dotted lines at 750 nm and 1 mm, a white dot for where the traveler is now, "keeps going, no limit" at the end of the curve. Every drawn part is labeled on the canvas. The pictures and readout appear only after Run (as in Experiment 6's first interface step). **Differences from this specification, for the owner:** (1) the received marker is a pointer above the strip, with a line through the strip only beyond visible light, so that it does not cover the narrow visible band; (2) the strip is 84 pixels tall so that the narrow bands' names fit; (3) the crests picture is not to scale beyond 20 times (stated on the picture). Other changes outside the new file: Experiment 6's chapter summary "what's next" line now points to this experiment (draft wording; Decision 8), and a placeholder summary was added for this chapter (not shown to learners until the tutor exists). **Checked** in headless Chromium at 1200 and 390 pixels (scripted, three black holes and release distances, mid-run and at the end, with screenshots viewed at 1200): the pictures are absent until Run; the markers move and end at the wavelengths the model computes (10.4 mm from 10, 7.78 mm from 2, 10.9 mm from 100, 9.84 mm from 5); changing the black hole or release distance hides the pictures again; no console errors; no sideways scroll. Labels were repositioned after the first look (the two narrow bands' names overlapped, and "1 horizon radii from the center" lost the 0.0001). The full Vitest run passed. **Not built yet, by design:** the three predictions and their gating (so the pictures show after Run without them), the introduction, the Results panel and the tutor. **Not checked:** a screen reader, other browsers, and the 390-pixel pictures' labels (very small, the app-wide limit).

- **Step 5, introduction and learner prediction interaction (2026-10-12):** added to `src/components/ColorOfTheFallExperiment.tsx`, above the controls. **Introduction (draft wording, for the owner's review):** the question, why even ask this (a friend with a green lamp: in everyday life a lamp's color belongs to the lamp), what happens in five steps, the words (wavelength, nanometer with a sheet of paper at about 100,000 nm, visible light 380 to 750 nm, infrared, microwave, radio waves, as emitted, as received, with horizon, horizon radius, stretch factor and the gap above the horizon recalled), what it builds on, your job, what to look for, and the assumptions. It contains none of the prediction answers (a search of the page text for "redshift", "redder", "turns red", "no limit", "without limit", "keeps going", "well before", "does not depend", "same for all" and "never" finds none). **Predictions (draft wording):** the three questions in "Prediction Activity" with the choices given there (four for the first). Until all three are answered, the black-hole buttons, release buttons and Run are disabled. The first Run locks them in; "Change predictions" reopens all three without resetting the chosen black hole or release distance, and hides the pictures again. The pictures and captions appear only after the first Run (§12). The choices are not marked yet (that is the Results step). **For the owner:** (1) the introduction does **not** name "redshift", although this specification lists it among the terms recalled from earlier experiments, because the word says "red" and would give away Prediction 1; the tutor introduces it; (2) the introduction's description of infrared ("the kind a heat lamp gives out"), microwaves ("like those in a microwave oven") and radio waves ("the longest") and the sheet of paper at about 100,000 nm are general knowledge, not checked against a primary source; (3) the third prediction's choices name "the 10-Sun black hole" and "M87*" rather than "small" and "big". **Browser check** (headless Chromium, 1200 and 390 pixels, scripted, 62 checks, all passed after correcting two flaws in the script): fresh load shows the introduction with every section and the three questions and no picture; Run and the controls are disabled until all three are answered (the third chosen from the keyboard); no picture until Run; during the run the predictions are locked and Run reads "Running..."; after the run "Change predictions" appears and the choices stay locked; changing the black hole hides the pictures and a new Run shows them again; "Change predictions" hides them, keeps the choices and re-enables Run; no console errors and no sideways scroll. Full Vitest run: 592 passed. **Not checked:** a screen reader, other browsers. **Still not built:** the Results panel and the tutor.

- **Step 6, Results (2026-10-12):** added the Results panel to `src/components/ColorOfTheFallExperiment.tsx`, shown only when the run has ended and the predictions are locked in (**draft wording, for the owner's review**). It has: a table (the wavelength as received at the release, halfway down, and 0.0001 horizon radii above the horizon, with its band; where the light leaves visible light, in horizon radii and kilometers, or "already past 750 nm at the release"; where it becomes microwave; "no limit" at the horizon); the three prediction checks (marked right or "off this time", with the model's numbers); the worked calculation at 5 horizon radii from the center (E, the square root, the stretch factor 1.5811, then 550 nm × 1.5811 = 870 nm), or at 2 or 1.5 when the release is too close for 5; the period of the light stretched by the same factor (1.8 × 10⁻¹⁵ s × 1.5811 = 2.9 × 10⁻¹⁵ s, checked against 870 nm ÷ the speed of light); a "closer and closer" table at gaps of 0.01, 0.001 and 0.0001 showing the tenfold pattern, with a note that radio waves would need about 0.000001; a table of all five release distances (the same for all three black holes); the siren comparison (motion part only); and the amber limits box. `stretchFactorSteps` was added to the physics module (restated, not imported, with 3 more tests: 29 in all) so the screen does no physics (§9); a deliberate break of its energy term, its wavelength and its square root each fails a test. **For the owner:** (1) the specification says "at half the distance to the horizon"; this is shown as halfway down the gap, `1 + (release − 1) ÷ 2` (5.5 horizon radii from a release at 10), and the wavelength there (830 nm) was computed by the module; (2) the siren comparison was marked "to be confirmed" in this specification; (3) "about 0.000001" for radio waves is the specification's own figure (computed in the feasibility check). **Browser check** (headless Chromium, 1200 and 390 pixels, scripted, 26 checks, all passed, with a screenshot of the full panel viewed at 1200): no Results mid-run; Results at the end; the right numbers for release distances 100, 20, 10, 5 and 2 and all three black holes (553, 564, 580, 615 and 778 nm at the release; 12.7, 9.24, 6.83 and 4.43 horizon radii where the light leaves visible light; 10.9, 10.7, 9.84 and 7.78 mm at 0.0001); changing the setting hides the Results; three wrong predictions marked "off this time" and three right ones marked "right"; "Change predictions" hides the Results; no NaN or undefined; no console errors; no sideways scroll. Two wording fixes after the first look (the third check repeated "870 nm" three times, and "0.001" now reads "about 0.001"). Full Vitest run: 595 passed. **Not checked:** a screen reader, other browsers. **Still not built:** the tutor.

- **Step 7, tutor and chapter summary (2026-10-12):** `src/components/ColorOfTheFallTutor.tsx`, the sequence in "AI Tutor Behavior" (observe, compare with the three predictions, the conceptual question "Why might the same number change both?", the eight-point explanation), with every number from the physics module for the reference fall from 10 horizon radii (**draft wording, for the owner's review**). `onTutorComplete` marks the chapter explained; the tutor restarts on each new Run. The chapter summary in `src/App.tsx` was written (draft); its "next" line still says this is the last experiment. `stretchFactorSteps` gained the gravity and motion parts (so the screen does no physics), with one more test (30 in all). **For the owner:** (1) explanation point 7 includes the optional sentence of Decision 1 (each photon arriving carries less energy and the photons arrive less often, both in the ratio of the stretch factor), marked as not a statement of how bright an object would look; (2) point 4 introduces the word "redshift", which the introduction leaves out (Step 5); (3) point 5 says "Eyes respond to wavelengths up to about 750 nm", general knowledge not checked against a primary source. **Browser check** (headless Chromium, 1200 and 390 pixels, scripted, 28 checks, all passed): no tutor before the run or mid-run; at the end the tutor appears and completion is saved but not "explained"; the chapter summary stays hidden until the explanation, then appears and "explained" is saved; Continue is disabled when empty; the three prompts and the eight points show with no NaN or undefined; changing the black hole hides the tutor and a new Run restarts it at the first question; no console errors and no sideways scroll. Full Vitest run: 596 passed. **Not checked:** a screen reader, other browsers.

- **Complete-flow test (2026-10-12, headless Chromium, scripted, at 1200 and 390 pixels wide; §21 Step 9):** 168 checks across both widths, all passed. Fresh load: the introduction has every section and contains none of the prediction answers (a search for "redshift", "redder", "turns red", "no limit", "without limit", "keeps going", "well before", "does not depend", "same for all" and "never arrives" finds none); nothing is revealed before the run (no pictures, captions, Results, tutor or summary); Run and the controls are disabled until all three predictions are answered, and the three can be chosen and Run pressed from the keyboard alone (Enter on each focused button); mid-run the pictures are shown, the predictions and the black-hole buttons are locked, and Results, tutor and summary are not; at the end Results and tutor appear and completion is saved but "explained" is not. Every label the specification requires is present on the canvas of both pictures (bands, both markers, both kinds of crest, the traveler and observer, the 550 nm line, the 750 nm and 1 mm marks, the curve's "keeps going, no limit", the dot, the legends), both captions carry "What is really happening" and "How the picture shows it", and the gap above the horizon is defined as a distance. All 3 black holes × 5 release distances at 1200 pixels (and 3 combinations at 390): changing a setting hides the pictures, Results and tutor; the release wavelength and the wavelength 0.0001 above the horizon in the Results and in the strip both match values computed independently in the test script from the formula (within 0.6%); "already past 750 nm" appears exactly for a release at 2; no NaN or undefined. "Change predictions" hides everything and keeps the choices; three wrong predictions are marked "off this time" and three right ones "right"; the chapter summary stays hidden until the tutor's explanation and "explained" is then saved; Continue is disabled when empty; Next is disabled on the last chapter; Previous goes to Experiment 6, and coming back remounts this experiment with the predictions reset; no console errors; no sideways scroll at either width.

- **Final review (2026-10-12; §21 Step 10):** against this specification, `docs/PROJECT.md` and `AGENTS.md`. Full Vitest run 596 passed. Success criteria 1 to 8 are met; nothing is revealed before the run (§12); playback speed cannot change a result (§11); the physics is separate from the interface (§9); every term is defined before use (§15). **Gaps found and fixed:** (1) the graph's "keeps going, no limit" label sat on the curve's end (moved above and to the left of it); (2) criterion 8 asks that "gap" is not used for both a distance and a time without saying which, and the introduction and the graph caption defined the gap above the horizon without saying it is a distance and not the time between flashes (both now say so). **Differences from this specification, still awaiting the owner:** (1) the received marker is a pointer above the strip, with a line through the strip only beyond visible light; (2) the strip is 84 pixels tall; (3) the crests are drawn to scale only up to 20 times; (4) the strip's marks are every decade from 100 nm to 10 m, not the 500 nm, 1 µm, 1 mm and 1 m listed under "Display"; (5) the Results' "half the distance to the horizon" is read as halfway down the gap; (6) the introduction does not name "redshift" (the tutor does); (7) `lightPeriodSeconds`, `stretchFactorSteps` (with the gravity and motion parts), `CurvePoint`'s fields and the typed `BandName` were added to the physics module's interface. **Not checked:** a screen reader, keyboard use beyond choosing the predictions and pressing Run, browsers other than headless Chromium, and the primary-source check in Decision 9. At 390 pixels the pictures are small and their labels very small (the app-wide column width). **Open:** the owner's line-by-line wording approval (§28.1) of the introduction, predictions, captions, Results, tutor (including the photon sentence in point 7), chapter summary and Experiment 6's changed "what's next" line.
