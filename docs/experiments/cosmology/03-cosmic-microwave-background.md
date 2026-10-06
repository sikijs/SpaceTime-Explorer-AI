# Cosmology — Experiment 3: The Cosmic Microwave Background (The Afterglow of the Big Bang)

**Status: approved (2026-10-06), per `CLAUDE.md` §23 Stages 1–4, following the completion of Cosmology Experiment 2 (The Big Bang). All four "Decisions Needing Human Review" items were confirmed by the owner in conversation; see "Decisions Confirmed." Not yet implemented.**

This is the third experiment of the "Cosmology" chapter, proposed by Claude per `CLAUDE.md` §23 Stages 1–2 on 2026-10-06, following the completion of Experiment 2 (The Big Bang) and its subsequent horizon-problem/inflation addition.

---

## Overview

Experiment 2 (The Big Bang) ended by raising a real open question — the **horizon problem** — and naming **cosmic inflation** as the leading, still-debated explanation, without ever showing the actual observational evidence the horizon problem is about. This experiment shows that evidence directly: about 380,000 years after the Big Bang, the universe cooled enough for electrons and protons to combine into neutral atoms (**recombination**), and light — which had been scattering constantly off free electrons in the hot plasma before that moment — was finally free to travel. Some of that very first light is still arriving today, stretched by the universe's ongoing expansion from roughly 3,000 K at release down to about 2.7 K now. It is called the **Cosmic Microwave Background (CMB)**, and it looks almost exactly the same temperature in every direction of the sky — the actual observation behind the horizon problem.

This experiment reuses the *concept* of cosmological redshift stretching a wavelength (and, with it, a temperature) already introduced in Experiment 1 (Hubble's Law), applying it to the oldest light there is rather than to a nearby galaxy. It does **not** reuse Experiment 1's `wavelengthStretchFactor` or `cosmologicalRedshift` functions themselves, since those are built on the *low-redshift approximation* (`z ≈ H0 × d / c`), which is explicitly only valid for small `z` — reusing it at the CMB's real redshift (`z ≈ 1090`) would be scientifically wrong. This experiment instead introduces one new, small, exact formula (see "Physics Model").

---

## Learning Objective

After this experiment, the learner should understand:

1. The universe became transparent to light at **recombination**, roughly 380,000 years after the Big Bang — before that, light could not travel freely because it kept scattering off free electrons in the hot, ionized early universe.
2. The light released at that moment has been stretched by the universe's expansion ever since, cooling it from roughly 3,000 K at release to the real, measured value of about 2.7 K today. This is the same redshift-stretching mechanism Experiment 1 already introduced, now applied over the full history of the universe rather than to a single nearby galaxy's light.
3. The CMB looks almost exactly the same temperature in every direction of the sky. This is the real observational fact behind the **horizon problem** Experiment 2's introduction and tutor already raised: regions of sky that could never have been in contact nonetheless show (almost) identical temperatures.
4. The CMB is real, directly measured evidence — discovered accidentally in 1965, and measured with increasing precision by later missions — grounding the Big Bang model in actual observation, not just a backward-running calculation (Experiment 2) or a theoretical mechanism (inflation, Experiment 2's addition).

---

## Physical Situation

A single point of light, released at recombination, traveling to an observer (Earth) today. The learner moves a redshift control between "Recombination" (`z ≈ 1089.8`, the real, precisely measured value) and "Today" (`z = 0`), and the experiment computes the background temperature implied at that redshift. A separate, non-interactive panel shows the CMB's real-world uniformity across many directions of the sky, to make the horizon problem's observational basis visible, not just described in words.

### Simplifying assumptions (must be stated to the learner, in plain language)

- **The relationship used here, `T(z) = T0 × (1 + z)`, is the real, exact relationship between a redshift and the temperature of the light's original blackbody spectrum** — unlike Experiment 1's `z ≈ H0 × d / c`, this is not a low-redshift approximation; it holds at any redshift. This experiment deliberately does **not** reuse Experiment 1's redshift functions, since those are only valid for the small `z` of nearby galaxies.
- **The redshift of recombination (`z ≈ 1089.8`) is stated as a real, independently measured value** (from precise observations, most recently the Planck satellite), not derived here.
- **This experiment does not model the actual physics of recombination or photon scattering** — no plasma, no electrons, no radiative transfer. Recombination is presented only as a plain-language turning point ("light could finally travel freely"), not computed.
- **The sky-uniformity panel is illustrative, not a real measurement or simulation** — it shows a small number of directions at nearly identical temperature to make the observed uniformity visible, not the CMB's real, tiny (about 1-part-in-100,000) temperature variations, which are not modeled here.
- **No connection is drawn here to galaxy or structure formation** — the tiny temperature ripples that seeded galaxies are a later topic, not this experiment's subject.

### Not introduced

The actual physics of recombination (plasma, photon scattering, radiative transfer), the CMB's real temperature anisotropies (ripples) and what they imply about structure formation, CMB polarization, the detailed shape of the blackbody spectrum, and any resolution of whether inflation (Experiment 2) is correct — all explicitly out of scope, consistent with keeping this experiment to a single new idea (`CLAUDE.md` §16).

---

## Physics Model

This experiment introduces one new, small, self-contained, **exact** formula — not an approximation like Experiment 1's low-redshift relationship:

```typescript
// src/physics/cosmicMicrowaveBackgroundExperiment.ts

// Real, measured value (Planck satellite) — the CMB's temperature today.
export const CMB_TEMPERATURE_TODAY_KELVIN = 2.725

// Real, precisely measured value (Planck 2018) — the redshift of recombination, i.e. how much
// the universe has expanded since recombination (today's scale factor / recombination's scale
// factor = 1 + z).
export const RECOMBINATION_REDSHIFT = 1089.8

// Illustrative, commonly cited value — real estimates place recombination at approximately this
// many years after the Big Bang. Stated as approximate, not derived from RECOMBINATION_REDSHIFT
// (that would require the universe's full expansion history, not modeled by this project).
export const RECOMBINATION_YEARS_AFTER_BIG_BANG = 380_000

// The one genuinely new physical idea: a blackbody's temperature scales exactly with (1 + z),
// since a photon's wavelength stretches by exactly that factor and blackbody temperature is
// inversely proportional to wavelength. Unlike hubblesLawExperiment.ts's cosmologicalRedshift
// (a low-z APPROXIMATION of distance-to-redshift), this is an EXACT relationship between a given
// redshift and temperature — valid at any z, including the CMB's z ~ 1090. Deliberately does not
// import anything from hubblesLawExperiment.ts; see "Simplifying assumptions."
export function cmbTemperatureKelvin(redshift: number): number {
  return CMB_TEMPERATURE_TODAY_KELVIN * (1 + redshift)
}

export interface CmbResult {
  redshift: number
  temperatureKelvin: number
}

export function runCmbExperiment(redshift: number): CmbResult
```

Structured independently of the UI, per `CLAUDE.md` §9 — a pure function of redshift, testable with no browser.

---

## Learner Controls

- **Redshift**, a slider from `0` (Today) to `RECOMBINATION_REDSHIFT` (Recombination, `z ≈ 1089.8`), with both endpoints individually labeled and selectable as one-click presets (matching this chapter's established "presets + continuous control" pattern) — labeled in plain language ("Today" / "Recombination (~380,000 years after the Big Bang)"), not just as a bare `z` value.
- **Run**, showing the computed temperature at the chosen redshift, visually represented as a color swatch that shifts from a hot white/orange (near recombination) to a deep microwave blue/violet (today) — reusing this chapter's established "visible, distinguishing cue for different inputs" pattern (`CLAUDE.md` §14).

---

## Prediction Activity

Before the control and results are shown, the learner is asked two questions in sequence:

1. "As you go back in time toward recombination, do you think the background temperature was higher, lower, or the same as it is today?" (Higher / Lower / The same)
2. "Do you think the CMB's temperature is about the same in every direction of the sky, or does it vary a lot from direction to direction?" (About the same / Varies a lot)

Choices are not scored. The control is disabled until both predictions are entered, consistent with the rest of the project.

---

## Experiment Behavior

### Display

- A labeled diagram showing the chosen redshift's position on the Recombination–Today range, with a color swatch representing the computed temperature at that point, and a live numeric readout (redshift, temperature in Kelvin).
- A separate, labeled "the sky in every direction" panel, showing several illustrative directions all at nearly the same color/temperature — making the real observational uniformity visible (`CLAUDE.md` §14), independent of the redshift slider above (this panel always shows today's near-uniform sky).
- A "How to read this diagram" caption explaining both panels, per the established pattern.

### Results

States the chosen redshift and computed temperature, compares both of the learner's predictions to what actually happened (temperature rises going back toward recombination; the sky is observed to be nearly uniform in every direction), and states the real recombination redshift and temperature-today values used, with a brief real-world-grounding note (Penzias and Wilson's accidental 1965 discovery; later precision measurement by COBE, WMAP, and Planck).

### Introductory text

To be drafted during implementation, covering: the question (what is the oldest light we can still see, and what does it tell us?), what happens, the learner's job (both predictions), what to look for, the new terms ("recombination," "Cosmic Microwave Background") defined in plain language, reusing "redshift" from Experiment 1 rather than redefining it, and the assumptions above — subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "What did you notice about the color/temperature as you moved the control back toward recombination?"
  2. Prediction comparison: the learner's two predicted answers beside what actually happened.
  3. Conceptual question: "If this light has been traveling almost since the very beginning of the universe, what does that make it, compared to any other light we could ever observe?" — intended to let the learner reason toward "the oldest light there is" without the tutor stating it outright.
  4. Explanation: (1) recombination, roughly 380,000 years after the Big Bang, is when the universe first became transparent to light; (2) that light has been stretched by the universe's expansion ever since, exactly as `T(z) = T0 × (1+z)`, cooling it from ~3,000 K to today's measured 2.725 K — the same redshift-stretching mechanism from Experiment 1, now applied to the oldest light there is; (3) the CMB looks almost exactly the same temperature in every direction, which is the real evidence behind the horizon problem Experiment 2 already raised, and the reason cosmic inflation (also Experiment 2) was proposed to explain it; (4) real-world grounding: discovered by accident in 1965 by Arno Penzias and Robert Wilson, later measured with great precision by the COBE, WMAP, and Planck missions; (5) not covered here: the actual physics of recombination, the CMB's real tiny temperature ripples and what they imply about galaxy formation, and polarization — later topics.

---

## Required Physics Tests

1. `cmbTemperatureKelvin(0)` equals exactly `CMB_TEMPERATURE_TODAY_KELVIN`.
2. `cmbTemperatureKelvin(RECOMBINATION_REDSHIFT)` is within 5% of 3,000 K — a real sanity check on the "roughly 3,000 K at recombination" claim stated to the learner (computes to ≈2,972 K).
3. `cmbTemperatureKelvin(z) / (1 + z)` equals exactly `CMB_TEMPERATURE_TODAY_KELVIN` for several different `z` values — confirms the exact proportionality, not just the two endpoints.
4. For two redshifts, the larger one produces a strictly higher `cmbTemperatureKelvin` — confirms the premise the first prediction question depends on.
5. `cosmicMicrowaveBackgroundExperiment.ts` does not import anything from `hubblesLawExperiment.ts` — a regression check (matching that experiment's own regression-test precedent) confirming this experiment does not misapply the low-redshift approximation at the CMB's real, much larger redshift (`CLAUDE.md` §8).

---

## Decisions Confirmed

Confirmed by the owner in conversation on 2026-10-06:

1. **Title accepted as proposed:** "The Cosmic Microwave Background: The Afterglow of the Big Bang."
2. **Learner control uses redshift (`z`), not a "time since the Big Bang" slider.** A real continuous time-to-redshift conversion would require the universe's full expansion history, which this project does not model (and Experiment 2 explicitly excludes); `z` is also what the new formula uses directly, with no conversion, and reuses the "redshift" term already taught in Experiment 1. Both endpoints are labeled in plain language with their approximate real-world time, without presenting a fabricated continuous time axis.
3. **Real-world grounding (Penzias and Wilson's 1965 discovery; COBE, WMAP, Planck) is included**, matching the established pattern from other experiments (e.g. the Black Hole experiment's Event Horizon Telescope mention).
4. **The precise measured value `RECOMBINATION_REDSHIFT = 1089.8` (Planck 2018) is used**, rather than a rounded `≈1100`, since precision was preferred here over simplified presentation.

---

## Relationship to Later Experiments

This experiment closes the direct narrative thread Experiment 2's horizon-problem addition opened (singularity → inflation → the CMB as its observational evidence). Possible further Cosmology directions — dark matter (galaxy rotation curves not matching visible mass), the CMB's real temperature ripples and structure formation, or dark energy — are not proposed here and would each need their own Stage 1–2 proposal and approval, per `CLAUDE.md` §23. The owner has already indicated interest in a dark matter experiment as a likely next step, to be proposed formally once this one is complete.

---

## Success Criteria

1. No existing experiment's physics is modified or recomputed; this experiment's only new formula is `cmbTemperatureKelvin`. Experiment 1's `cosmologicalRedshift`/`wavelengthStretchFactor` are **not** used anywhere in this experiment (see "Decisions Confirmed" item 2 and the regression test).
2. The learner makes both predictions before the control and results are shown.
3. Moving the redshift control toward recombination produces a visibly, clearly different color/temperature in the diagram, not just a different number.
4. The sky-uniformity panel visually shows near-identical colors across several directions, making the horizon problem's observational basis visible rather than only stated in text.
5. The Results panel correctly compares both of the learner's predictions to what actually happens.
6. The experiment states plainly, in the introduction, Results panel, and tutor, that this is the same redshift-stretching mechanism from Experiment 1, now applied to light from recombination rather than a nearby galaxy — and that the formula used here is exact, unlike Experiment 1's low-redshift approximation.
7. The learner can, after the tutor conversation, state in their own words what the CMB is, roughly when and why it was released, and why its near-uniformity across the sky is a real puzzle (the horizon problem, already raised in Experiment 2).
8. "Redshift" is reused consistently from Experiment 1's definition rather than redefined; "recombination" and "Cosmic Microwave Background" are each defined in plain language at first use, consistent with `CLAUDE.md` §15; "horizon problem" and "cosmic inflation" are referenced, not redefined, since Experiment 2 already defines them.

---

## Implementation Notes

Not yet implemented. Per `CLAUDE.md` §23 Stage 5 and §6, implementation proceeds one step at a time, starting with the physics model and its tests, once this specification is approved.
