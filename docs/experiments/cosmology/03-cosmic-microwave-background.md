# Cosmology — Experiment 3: The Cosmic Microwave Background (The Afterglow of the Big Bang)

**Status: approved (2026-10-06), per `CLAUDE.md` §23 Stages 1–4, following the completion of Cosmology Experiment 2 (The Big Bang). All four "Decisions Needing Human Review" items were confirmed by the owner in conversation; see "Decisions Confirmed." Implemented and approved (see "Implementation Notes"); rebuilt to the newer rules on 2026-11-14 (see "Audit Update (2026-11-14)" at the end, which supersedes the interface described above).**

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

Implemented one step at a time per `CLAUDE.md` §6, then complete-flow tested in a headless browser and finally reviewed against this specification, `docs/PROJECT.md`, and `AGENTS.md` (§21 Step 10, 2026-10-06). Committed to git (`b9bdd9b` physics and tests, `4c69d93` interface, predictions, results, tutor).

- **Physics:** `src/physics/cosmicMicrowaveBackgroundExperiment.ts` exactly as specified (`cmbTemperatureKelvin`, `runCmbExperiment`, and the three constants). All five "Required Physics Tests" are covered, including the regression check that no import references `hubblesLawExperiment`.
- **Interface:** `src/components/CosmicMicrowaveBackgroundExperiment.tsx` and `CosmicMicrowaveBackgroundTutor.tsx`, wired into `src/App.tsx` under "Cosmology". The Redshift control is two one-click presets (Today, Recombination) plus a Custom slider from 0 to 1089.8. The marker, temperature readout, and color swatch animate from Today back to the chosen redshift over a fixed 3 seconds (§11).
- **Sky panel hidden until predictions are locked in.** The specification does not say when the sky panel appears, but showing it from the start would reveal the answer to the second prediction question (§12). It, and the "How to read this diagram" caption, appear once the first Run locks the predictions.
- **First prediction is always checked against recombination,** not against the chosen moment. Otherwise a Today run (z = 0) would make the comparison meaningless.
- **Final review found one gap, fixed:** the unit kelvin (K) and the symbol z were used without being defined (§15). One sentence for each was added to the introduction.
- **Added at the owner's request, approved as written:** two introduction paragraphs ("Where this shows up in everyday life" and "Why it matters"). They state honestly that the CMB has no effect you can feel, and use the old analog TV static, the kitchen microwave oven contrast, and the 1965 accidental discovery. They also state roughly 400 CMB photons per cubic centimeter. The 400 figure and the TV-static claim (commonly cited as about 1% of the snow, worded here only as "a small part") are not in this specification's original text.
- **A bug found during the complete-flow test:** the first build crashed to a blank page when the animation ended (`onTutorComplete` was referenced but missing from the component's destructured props). Fixed. The "chosen moment" label also overlapped the diagram title; the layout was moved down to fix it.
- **Not verified:** a mid-animation frame (headless playback is throttled), and phone-width layout.
- **Owner's line-by-line wording approval (§28.1): complete (2026-10-06),** approved as written, covering the introduction (including the added paragraphs), prediction prompts, caption, Results, tutor, and chapter summary.

---

## Audit Update (2026-11-14)

Built to `docs/audit/cosmology/03-draft-wording.md` ("defaults accepted" from the owner on 2026-11-14 to the eleven questions of `docs/audit/cosmology/03-gap-report.md`; part 1 of the wording approved with answers 1 to 4 (split, yes, stay, stay); part 2 "defaults accepted, go ahead"; "start" for the build; "stop server and update specs" for this entry). **Not yet committed** (no commit has been requested). The physics (`cmbTemperatureKelvin`, `runCmbExperiment` and the existing constants) does not change; **this Audit Update supersedes the interface described in "Learner Controls", "Prediction Activity", "Experiment Behavior" and "Implementation Notes" above.**

**What changed.**
- **Layout.** A long introduction, a collapsed "Words and formulas" box and a "Want to know more?" list, all above Part 1 with no Part heading; then Part 1 "Predict, then watch" (amber), Part 2 "Now try it yourself" (pink), Part 3 "The results" (teal), Part 4 "The tutor" (blue). Parts 2 to 4 appear after the first Run and stay (changing the moment no longer hides the results or restarts the tutor).
- **Introduction.** The old single "What happens" paragraph is now seven parts, as the owner asked ("elaborate it in much more detail and in simple terms"): a universe full of light but no way to see far (atoms, protons, electrons, "nobody holding hands"); why light could not get far (photons, the pinball machine, the headlight in fog); the fog lifts (recombination, with the "re-" quirk); how long ago (380,000 years is about 1 part in 36,000 of the age, about 19 hours in an 80-year life); why it is the oldest light (the Sun's light is about 8 minutes old, the next star's about 4 years); a "background" (behind the stars and galaxies, like furniture in front of a wall); stretched on the way, so now invisible (wavelength, the balloon, microwaves), then one summary sentence. The daily-life picture (fog on a morning drive), "Where this shows up in everyday life" and "Why it matters" are kept, with the discovery date changed to "1964 to 1965". New: "Your job" (two guesses, then Run), "The four Parts of this page", "Your guesses and the real pictures", a revised "What we assume" and "Some new words". Removed from the introduction because they answered a guess: the stove-colour paragraph, the 1-in-100,000 assumption, "roughly 400" (all now in Part 3), and the phrase "hot gas" (found in the browser build).
- **Part 1.** Guess 1: the temperature at recombination against today's (higher, lower or the same). Guess 2: the temperature across the sky (about the same or varies a lot). An always-visible **Start over** replaces "Change predictions". **One Run**, always from today back to recombination (the moment choice moved to Part 2, so the first Run can no longer be "Today").
- **The picture.** The journey bar, grey with names only until the run has finished (no "hot", no "cold", no gradient before then; found in the gap report's re-read to be on screen before the guesses); the **temperature panel**, a tenfold scale from 1 K to 10,000 K with a **green** mark for today's 2.725 K (measured) and an **amber** mark for recombination's 2,972 K (calculated here); then the **sky panel** of seven labelled circles (an illustration, all the same colour, each "about 2.725 K") and the **"how much directions differ" strip**, a tenfold scale from 1 in 10 to 1 in 1,000,000 with a green mark for the measured spread (about 1 in 100,000, about 0.000027 K). **White marks, drawn only once the run has finished, markers only:** guess 1 an arrow from today's mark pointing toward hotter or cooler, or a tick on it for "the same" (the arrow's length means nothing), in a "YOUR GUESS" box; guess 2 a box joined to the right-hand end of the strip for "about the same" or the left-hand end for "varies a lot" (it says which end, not a size).
- **Caption and "Where the real picture comes from".** One caption: what is drawn, what appears when, and, **only once the run has finished**, a worked moment (2.725 × 1090.8 ≈ 2,972 K; 2.725 ÷ 100,000 ≈ 0.000027 K), the reason for the tenfold scale and four "Look at / What it means / Why it matters" items. The "Where the real picture comes from" line appears after the run, separating *measured by others*, *given from published values*, *calculated here* and *imagined for the question*.
- **Part 2.** A moment of the learner's own (Today, Recombination or a custom z from 0 to 1089.8) with a readout (z, temperature, times today's) and a pink marker on the bar and the temperature scale, in a short caption. No white marks, no sky and no strip there; the green and amber marks do not move.
- **Part 3.** **Table 1, a check-up** (today's 2.725 K against Fixsen's 2.72548 ± 0.00057 K: the same, within the give-or-take; the 2,972 K against ESA's "around 3,000 Kelvin": a little less, 0.92 percent, not a test; the 380,000 years given, with the sources about 1.3 percent apart; the spread between directions quoted, not checked), with the learner's guesses tagged on rows 2 and 4 and a "What this table tells us" note; **Table 2, the temperature at six moments** (z = 0, 1, 10, 100, 1,000, 1,089.8), with a note; a "Your guesses" block (guess only, no verdict); and the **"More about the CMB"** panel (what the CMB's temperature means, −270.4 °C, 2,972 K and 1,091 times hotter, roughly 400 photons per cubic centimetre, the 1-in-100,000 evenness and the swimming-pool comparison, how it was found).
- **Part 4.** Three questions (the observe prompt asks about the amber and green marks; the compare prompt names the learner's white arrow, tick or box; the conceptual question is unchanged), then a five-point explanation that marks each guess from the module's numbers, gives the mechanism (a hotter glow has a shorter wavelength, so stretching by 1090.8 cools it by the same factor, with the slowed-recording comparison), names the horizon problem and inflation as in Cosmology 2, and lists in point 5 what is not covered, including the Sun-motion dipole (about 1 part in 811) with a pointer to the chapter "Is the microwave sky equally warm in every direction?".
- **Words box and links.** A box of 14 entries before the run (with a line saying three more follow) and 17 after it (the temperature of light, the formula with a worked example, and the horizon problem and inflation, held because they would give a guess away). Links: two above Part 1 (NASA's Cosmic History and "What is a light-year?"), and three that appear after the first Run (ESA, NASA's WMAP overview and Fixsen 2009).

**Deviations from the approved draft** (found by tests and the browser check; the wording is otherwise as approved): the words box's "Temperature of light" (the stove colours) and the horizon-problem entry wait until after the run; the "hot gas" bullet lost "hot"; the placeholder "More words" no longer names the held entries; Table 2's note replaces the draft's price-doubling comparison, and the draft's claim that z = 100 is "about room temperature" was **wrong** (275.2 K is about 2 °C) and is corrected (the draft file is annotated); the tutor names the chapter by its sidebar title; the journey bar moved down 14 pixels so the pink label clears the title, and the pink line on the temperature panel is broken so that it does not cut a tick label; Table 2 prints 5.45 K, not 5.450 K.

**Working defaults taken** after "go ahead" without a choice, each open to the owner: the discovery date reads "1964 to 1965" (ESA says 1964, the paper is 1965, neither the paper nor the Nobel pages could be fetched); the redshift 1089.8 stays "given, not derived" and Planck 2018 VI is not linked (its abstract has no redshift); today's temperature is credited to "several instruments, summarised by Fixsen (2009)" in place of "Planck satellite".

**Physics module (new, with tests; `cosmicMicrowaveBackgroundExperiment.ts`).** 18 functions: `temperatureScaleFraction`, `spreadScaleFraction`, `spreadKelvin`, `temperatureGuessMarker`, `skyGuessStripFraction`, `actualTemperatureAnswer`, `actualSkyAnswer`, `temperatureMarking`, `skyMarking`, `temperatureTodayReading`, `cmbCheckUp`, `cmbMomentsTable`, `cmbWorkedExample`, `kelvinToCelsius`, `releaseAsOnePartIn`, `releaseHourInALife`, `evenSpreadExampleKelvin`, `dipoleOneInParts`; 14 constants (the published values, the two scales' ends, `MEASURED_SPREAD_FRACTION`, `SKY_UNIFORM_BELOW_FRACTION`, `MOMENTS_TABLE_REDSHIFTS` and others); 9 types. The existing functions are unchanged; the edits to existing code are three comments (the source of 2.725 K, the status of 1089.8, the sources for 380,000 years). **Two points to note.** (1) **The tutor marks guess 2 with a code threshold, 1 percent of the temperature, which is not a published figure** (no source gives a size for "about the same" or "a lot"); the Results never present it as one, and the measured spread is a thousand times below it. (2) The module now imports T0 and the Planck dipole amplitude from `microwaveDipole.ts` (one source for those numbers), which brings that module's own imports with it; none reaches `hubblesLawExperiment`, and the regression test that this module does not import it still holds. 43 tests in the file (5 existing, 38 new) and 19 render tests in `CosmicMicrowaveBackgroundExperiment.test.tsx`. The module was broken six ways on purpose (a straight scale, a flipped strip, swapped markers, a changed rule, a changed published value) and each break failed 1 to 4 tests; the page was broken six ways (the gradient or a white mark drawn early, the sky marker always on the right, a guess tag with no guess, the "hot gas" hint, the answer in the tutor's first question) and each break failed a test once the missing guess-tag check was added.

**Sources (read 2026-11-14 through helper agents whose fetch tool returns short quotes and summaries, so each quotation and figure should be checked against the live page).**
| Item | Source | Status |
|---|---|---|
| About 3,000 K at release; 380,000 years; 1 part in 100,000; roughly 400 photons per cubic centimetre; the 1978 Nobel Prize; COBE, WMAP, Planck | ESA, "Planck and the cosmic microwave background" (21 Mar 2013) | Read in full; **gives the discovery as 1964**, where the page says 1964 to 1965 |
| 380,000 years; "recombination"; "the oldest light we can observe"; 13.8 billion years (captions) | NASA Science, "Cosmic History" (updated 12 Aug 2026) | Read in full |
| 375,000 years; 13.77 billion years; 2.7251 and 2.7249 K | NASA Science, WMAP overview (updated 16 Apr 2026) | Read in part (the first 39,400 of about 48,600 characters verbatim) |
| T0 = 2.72548 ± 0.00057 K (the literature); 2.7260 ± 0.0013 K (COBE FIRAS recalibrated) | Fixsen (2009), arXiv:0911.1955 | Abstract read |
| "Uniform up to about 1 part in 100,000" | NASA LAMBDA, CMB tutorial (cmb.html) | Fetched; no date shown |
| The Sun's light takes about 8 minutes; the nearest star's about 4.2 years | NASA, "Facts About Earth" (5 Dec 2025); NASA, "What is a light-year?" (6 Apr 2026); NASA Imagine the Universe | Read |
| The Sun-motion dipole amplitude (3,362.08 ± 0.64 µK) and T0 = 2.72548 K | `microwaveDipole.ts` (NASA LAMBDA table and a Colloquium paper, read for Evidence and Imagination 7) | Used through that module; not re-read |
| The redshift of recombination, 1089.8 | Planck 2018 VI, arXiv:1807.06209 | **Not read**: the abstract has no redshift, and the parameter tables were not read; given on the page |
| Plain official page: recombination as distinct from last scattering | none found | Gap (§29 rule 3(c)); the page uses one word and one number |
| Plain official page: the old TV static claim | none found | Gap; a NASA video transcript says about 2 percent, a non-official page 1 percent; the page keeps "a small part" |
| Penzias and Wilson (1965); the Nobel Prize pages | could not be fetched (HTTP 405, 404, 403) | Not linked |
| The "re-" in recombination as a historical quirk | Wikipedia (non-official) only | Kept unlinked, as approved |
| The temperature of an incandescent filament (a comparison) | none fetched | Dropped from the page |

**Open.**
- Quotations and figures come from helper summaries and need checking against the live pages. The discovery date (ESA 1964 against the page's 1964 to 1965), the release time (380,000 against WMAP's 375,000) and the age (13.8 on NASA's captions, 13.77 on WMAP, "nearly 14" on ESA) differ between sources; the page says "about" and notes the differences in the links.
- The redshift 1089.8 has no read source; the recombination-versus-last-scattering distinction, the TV static share, the "fog cleared almost everywhere at about the same time" claim and the "nothing older … with light" claim have no plain official source read for this page.
- The 80-year-life, pinball, balloon, swimming-pool and slowed-recording pictures are mine and unsourced (approved by the owner on 2026-11-14); the "1 percent" rule for marking guess 2 is a code threshold.
- The chapter summary in `src/App.tsx` for this chapter was not changed and has not been re-read against the new page; the Cosmic Horizons chapters that refer to the microwave background were not rechecked.
- **Not checked:** narrow widths (the browser window would not resize; a squeezed-container approximation showed the pictures scale down, the tables scroll in their own boxes, and 13 elements overran the card edge, untraced), dark mode, other browsers, keyboard use, a real learner; of the guess combinations only two were viewed (Higher with About the same, and Lower with Varies a lot), so the "the same" tick was not seen in a browser; the learner's chapter tick marks and the chapter summary were not read.
