# Cosmology — Experiment 8: How Far Can We See? The Observable Universe

**Status: APPROVED by the owner on 2026-10-08 (proposed by Claude per `CLAUDE.md` §23 Stages 1–3 on 2026-10-08, following the completion of Cosmology Experiment 7; the topic was chosen by the owner from the proposal in conversation). The owner answered the three open items (radiation left out: ok; the faster-than-light statement: include it; the custom slider: keep it), and the other six "Decisions Needing Human Review" items stand as proposed. Built and finally reviewed (2026-10-08); the owner's line-by-line wording approval (`CLAUDE.md` §28.1) is complete (2026-10-08), approved as written with no changes requested. See "Implementation Notes".**

This is the eighth experiment of the "Cosmology" chapter.

---

## Overview

The universe is about 13.5 billion years old in this project's model, and light travels one light-year per year. So it seems that the farthest we could possibly see is about 13.5 billion light-years. Yet astronomers say the edge of the observable universe is about 46 billion light-years away. This experiment lets the learner discover why.

The learner chooses a source (a galaxy, or the oldest light of all, the cosmic microwave background of Experiment 3), described by its redshift (Experiment 1). Light leaves that source and travels to Earth. The experiment shows three distances for the same source:

1. **How far the light travelled** on its journey (its travel time multiplied by the speed of light).
2. **How far away the source is today.**
3. **How far away the source was when the light left it.**

The three are very different. While the light was travelling, the space it crossed kept stretching (Experiments 1 and 2), so the source ended up much farther away than the light's own journey. For the oldest light, the source was only about 41 million light-years away when the light left, but is about 45 billion light-years away today.

This uses real physics in its exact form (no approximation beyond the same flat, matter-plus-dark-energy model as Experiments 5 and 6), and introduces one new idea: the difference between how far the light travelled and where its source is now.

---

## Learning Objective

After this experiment, the learner should understand:

1. The observable universe is the part of the universe whose light has had time to reach us. It is not an edge of space, only a limit on what we can see.
2. Light that has travelled for a given time has not simply covered "time × speed of light" of the distance to its source, because space stretched while it travelled.
3. A source's distance *today* can therefore be much larger than the distance its light travelled, and its distance *when the light left* can be much smaller.
4. For the oldest light we can see (the cosmic microwave background), the source was extremely close when the light left (about 41 million light-years) and is far away today (about 45 billion light-years). This is why the observable universe is about 46 billion light-years in radius although the universe is only about 13.5 billion years old.
5. Nothing travelled faster than light locally. The stretching of the space between us and a faraway source is not a speed through space.

---

## Physical Situation

A single source at a chosen redshift `z`, and Earth. Light leaves the source at the time that corresponds to that redshift and travels to Earth along a straight line. The experiment computes, in a flat universe with matter and a constant dark energy:

- the **light-travel time** (the "look-back time"), and so the distance the light travelled,
- the source's **distance today**, and
- the source's **distance when the light left**.

### Fixed illustrative values

The same values as Experiments 5 and 6: Hubble constant 70 km/s per megaparsec (Experiment 1), flat universe, dark energy share 70% (Experiment 5's best-fit value, `BEST_FIT_DARK_ENERGY_FRACTION`), matter share 30%. They are **not** controls here (see "Decisions Needing Human Review" item 7).

Distances use the project's existing unit, the megaparsec (Mpc), converted to light-years for display: one Mpc is about 3.26 million light-years, derived from the reused constants (the learner-facing text says "about 3.3 million light-years", matching earlier experiments).

### Simplifying assumptions (must be stated to the learner, in plain language)

- **The same simplified universe as Experiments 5 and 6:** flat, with matter and a constant dark energy, an illustrative Hubble constant of 70 (with the real "Hubble tension" caveat, published values 67–73), and a fixed 70% dark energy share. **Radiation (the light and other very fast particles of the early universe) is left out**, as in Experiments 5 and 6. This matters most for the earliest times, so for the cosmic microwave background this model gives about 44.6 billion light-years where the real value is about 45.7 (about 2.5% lower), and about 470,000 years after the Big Bang where the real time is about 380,000.
- **The source stays at a fixed spot in the stretching space.** It has no motion of its own through space.
- **The light travels along a straight line to Earth** and nothing blocks or bends it (no lensing, as in Experiment 7).
- **"Distance today" means the distance measured at the present moment,** the kind of distance that would be found by laying rulers end to end across all of space at once. This is a way of defining a distance in an expanding universe, not something that could be measured with a signal.
- **The cosmic microwave background stands in for "the farthest we can see with light."** The true edge of the observable universe (the farthest anything could ever have sent a signal to us, called the particle horizon) is about 2% farther, and is not computed here.
- **Real reference values are given, not computed.** The real distance to the source of the cosmic microwave background (about 45.7 billion light-years) and the real edge of the observable universe (about 46.5) are shown only for comparison.
- **Nothing here says how large the whole universe is.** The observable universe is only the part we can see. The universe may be much larger, and this experiment does not say.

### Not introduced

The particle horizon as a computed quantity, the event horizon (the limit on what we will ever see), radiation and inflation (which change the earliest times), the horizon problem's solution (Experiment 2 only named it), how angular size depends on distance, and any cosmology beyond the flat model. All explicitly out of scope, consistent with a single new idea (`CLAUDE.md` §16).

---

## Physics Model

One new, self-contained module. It deliberately **reuses** earlier experiments' code unchanged (imported, not redefined):

- the Hubble constant and speed of light from Experiment 1 (`hubblesLawExperiment.ts`),
- the megaparsec-to-kilometer conversion and the Hubble time from Experiment 2 (`bigBangExperiment.ts`),
- `comovingDistanceMpc` from Experiment 5 (`darkEnergyExperiment.ts`), which gives the distance today (see "Decisions Needing Human Review" item 4), and `BEST_FIT_DARK_ENERGY_FRACTION`,
- `universeAgeYears` from Experiment 6 (`universeAgeExperiment.ts`), the age of the universe.

The one new calculation is the **time after the Big Bang at which the universe had a given relative size** `a = 1 / (1 + z)`. It is the exact inverse of Experiment 6's `relativeSizeAtTime`, using the same closed form:

- matter only (`L = 0`): `t = (2/3) × Hubble time × a^(3/2)`
- with dark energy share `L`: `t = Hubble time × (2 / (3 √L)) × asinh( √(L / (1 − L)) × a^(3/2) )`

Then:

- **Light-travel time** = today's age − the time after the Big Bang when the light left. (Light-years per year is exactly 1, so the number of years is the number of light-years the light travelled.)
- **Distance today** = Experiment 5's comoving distance.
- **Distance when the light left** = distance today ÷ (1 + z). Every distance grows by the same factor as the universe's size, so the distance when the light left is the distance today shrunk by the factor `1 + z`.
- **Stretching factor** = `1 + z` (the same factor Experiment 1 gave for the stretching of light's wavelength).

```typescript
// src/physics/observableUniverseExperiment.ts

// Reused unchanged (imported, not redefined):
//   hubblesLawExperiment.ts: HUBBLE_CONSTANT_KM_PER_S_PER_MPC, REAL_SPEED_OF_LIGHT_KM_PER_S
//   bigBangExperiment.ts: MPC_TO_KM, hubbleTimeYears
//   darkEnergyExperiment.ts: comovingDistanceMpc, BEST_FIT_DARK_ENERGY_FRACTION
//   universeAgeExperiment.ts: universeAgeYears, relativeSizeAtTime (used only in the tests)

// Given, rounded real-world reference values (billions of light-years), used only for comparison.
// See "Decisions Needing Human Review" item 8.
export const REAL_CMB_SOURCE_DISTANCE_TODAY_LIGHT_YEARS = 45.7e9
export const REAL_OBSERVABLE_UNIVERSE_RADIUS_LIGHT_YEARS = 46.5e9

// The redshift of the cosmic microwave background (Experiment 3), reused by import if it can be, else
// restated as a given value; see "Decisions Needing Human Review" item 4.
export const CMB_REDSHIFT = 1089.8

// Years after the Big Bang when the universe had relative size a (today = 1). Exact closed forms above.
export function timeAfterBigBangYears(relativeSize: number, darkEnergyFraction: number): number

// How long the light has been travelling (years). Also the distance it travelled, in light-years.
export function lightTravelYears(redshift: number, darkEnergyFraction: number): number

// The source's distance today, in light-years (Experiment 5's comoving distance converted from Mpc).
export function distanceTodayLightYears(redshift: number, darkEnergyFraction: number): number

// The source's distance when the light left, in light-years: distance today / (1 + z).
export function distanceWhenLightLeftLightYears(redshift: number, darkEnergyFraction: number): number

export interface ObservableUniverseResult {
  redshift: number
  stretchingFactor: number                // 1 + z
  lightTravelYears: number                // also the distance the light travelled, in light-years
  distanceTodayLightYears: number
  distanceWhenLightLeftLightYears: number
  todayOverTravelled: number              // distance today / distance the light travelled
  recessionSpeedTodayOverC: number        // H0 x distance today / c (Hubble's Law, Experiment 1); see item 6
  curve: Array<{                          // for the graph, log-spaced redshifts
    redshift: number
    lightTravelYears: number
    distanceTodayLightYears: number
    distanceWhenLightLeftLightYears: number
  }>
}

export function runObservableUniverseExperiment(redshift: number): ObservableUniverseResult
```

Values worked out from this model (Hubble constant 70, 70% dark energy, no radiation), for the specification and the tests:

| Source redshift | Light travelled (billion light-years) | Distance today (billion light-years) | Distance when the light left (billion light-years) | Distance today ÷ light travelled |
|---|---|---|---|---|
| 0.5 | 5.04 | 6.16 | 4.11 | 1.22 |
| 2 | 10.24 | 16.89 | 5.63 | 1.65 |
| 10 | 13.00 | 30.79 | 2.80 | 2.37 |
| 1089.8 (the cosmic microwave background) | 13.47 | 44.62 | 0.041 | 3.31 |

For the cosmic microwave background, the distance today (44.62 billion light-years) is the distance when the light left (0.0409 billion, about 41 million light-years) times `1 + z` = 1090.8. The age of the universe in this model is 13.47 billion years, which the light-travel time for the earliest source approaches.

Structured independently of the UI, per `CLAUDE.md` §9: pure functions, testable with no browser.

---

## Learner Controls

- **Source:** presets "A galaxy from about 5 billion years ago (redshift 0.5)", "A distant galaxy (redshift 2, the source in Experiment 7)", "A very early galaxy (redshift 10)", and "The oldest light we can see: the cosmic microwave background (redshift 1089.8, Experiment 3)", plus "Custom" with a slider on a logarithmic scale from redshift 0.1 to 1089.8 (confirmed, see "Decisions Needing Human Review" item 5).
- **Run**, which sends the light from the source to Earth over a fixed duration, independent of the physics result (`CLAUDE.md` §11).

---

## Prediction Activity

Before the control and results are shown, the learner answers two questions in sequence (not scored):

1. "A galaxy's light has been travelling toward us for 10 billion years. How far away is that galaxy today?" (Less than 10 billion light-years / About 10 billion light-years / More than 10 billion light-years)
2. "The oldest light we can see left its source when the universe was very young. How far away was that source when the light left it?" (About 13 billion light-years / A few billion light-years / Far closer than that, under 100 million light-years)

The control is disabled until both predictions are entered. The first Run locks them in; "Change predictions" reopens them without resetting the chosen source. The diagram and graph appear only after predictions are locked in (`CLAUDE.md` §12), since they would show the answers.

---

## Experiment Behavior

### Display

- **The distance diagram (labeled):** Earth, the source, and the light between them, with the three distances drawn as three separate labeled bars: **how far the light travelled**, **how far away the source is today**, and **how far away it was when the light left**, in three distinct colors (`CLAUDE.md` §14). During playback, the source marker starts at its distance when the light left and moves out to its distance today as the light travels, so the learner sees the source being carried away while the light is on its way. Marked "not to scale" if the spacing is compressed for visibility (display only).
- **A distance-versus-redshift graph (labeled):** light travelled, distance today, and distance when the light left, against source redshift on a logarithmic axis, with the chosen source marked. It shows the light-travelled curve levelling off near today's age while the distance-today curve keeps climbing, and the distance-when-the-light-left curve rising and then falling. Axis labels with units.
- **Live readout:** the redshift, and the three distances in billions of light-years (and, for the earliest sources, in millions where that is clearer).
- A **"How to read this diagram"** caption (`CLAUDE.md` §14), shown after predictions are submitted, written in the same detailed, step-by-step style as Experiments 5, 6 and 7.

### Results

States the chosen source's three distances; compares both of the learner's predictions to what the model gives; includes simple math, per `CLAUDE.md` §15: for example, for the oldest light, `13.5 billion light-years travelled`, `44.6 billion light-years away today`, and `44.6 ÷ 1090.8 ≈ 0.041 billion = 41 million light-years` when the light left, since every distance has grown by the factor `1 + z`; includes a daily-life comparison (an ant walking along a rubber band that is being stretched: the ant covers a distance, but the far end of the band has been carried much farther away in the meantime); compares the model's cosmic-microwave-background distance with the real value (about 45.7 billion light-years) and the real edge of the observable universe (about 46.5), in a prominent bordered caveat box matching Experiment 7's and Experiment 1's precedent, stating the approximately 2.5% gap and its cause (radiation left out); and restates the model caveats.

### Introductory text

To be drafted during implementation, covering: the question (the universe is about 13.5 billion years old, so why is the observable universe about 46 billion light-years across?), what happens, the learner's job (both predictions), what to look for, new terms defined in plain language before use (**observable universe**, **light-year** reminders only if needed, **distance today** versus **distance when the light left**), reuse of redshift, the cosmic microwave background and the expanding universe from earlier experiments, a "Why even ask this" paragraph (how big is the part of the universe we can see, and does the answer depend only on the universe's age?), and the assumptions above. The daily-life comparison (the stretched rubber band) is deliberately **kept out of the introduction** and used only in the Results and the tutor, because it would give away the answer to both predictions before the learner has made them. Subject to the owner's line-by-line wording review per `CLAUDE.md` §28.1.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of the prior experiments:

- **Before results:** helps the learner form both predictions; does not reveal the answer.
- **After "Run" completes:**
  1. Observation: "Compare the three distances for your source. What do you notice?"
  2. Prediction comparison: the learner's two predicted answers beside what the model gave.
  3. Conceptual question: "The light from the oldest source left only about 13.5 billion years ago, but its source is now about 45 billion light-years away. How can that be, if nothing can travel faster than light?" — intended to let the learner reach "space itself stretched" without the tutor stating it.
  4. Explanation: (1) the observable universe is the part whose light has reached us; (2) how far the light travelled is only travel time × the speed of light; (3) while the light travelled, the space it crossed stretched, carrying the source away, so the source ended up much farther than the light's journey (the rubber-band picture, with the worked numbers); (4) the oldest light's source was about 41 million light-years away when the light left and is about 45 billion light-years away today, a factor of `1 + z`; (5) this is not faster-than-light travel: locally the light always moves at `c`, and the stretching of space between faraway objects is not a speed through space (and that the source's recession speed today, from Hubble's Law, is about 3 times `c` without breaking relativity); (6) why the answer depends on the whole expansion history, not just the age (tying back to Experiment 6); (7) the model's gap from the real values (radiation left out; about 45.7 and 46.5 real); (8) not covered: the particle horizon computed exactly, the event horizon, inflation, and how big the whole universe is.

---

## Required Physics Tests

1. At a very small redshift (for example 0.001), the distance today matches `c × z / H0` and the distance the light travelled, within 0.2%, and `distanceTodayLightYears` is within 0.2% of `lightTravelYears` (everything agrees when nothing has had time to stretch).
2. For every redshift above 0, the distance today is greater than the distance the light travelled, and the ratio `todayOverTravelled` increases with redshift.
3. The distance when the light left equals the distance today divided by `1 + z`, exactly.
4. At the cosmic microwave background redshift, the distance today is within 1% of 44.6 billion light-years, and the distance when the light left is within 2% of 41 million light-years.
5. `timeAfterBigBangYears` is the exact inverse of Experiment 6's `relativeSizeAtTime`: converting a relative size to a time and back returns the same size, for several sizes and for dark energy shares of 0, 0.3 and 0.7.
6. The light-travel time is always less than today's age (`universeAgeYears`), increases with redshift, and at the cosmic microwave background redshift is within 0.5% of the age.
7. The distance the light travelled never exceeds `c` times today's age, while the distance today keeps increasing with redshift past that value (the two curves separate).
8. The distance when the light left rises and then falls: its largest value on the curve occurs at a redshift between 1 and 5.
9. `comovingDistanceMpc` stays accurate at the cosmic microwave background redshift: the default 2000-step result is within 0.1% of a much finer integration (checked, 2026-10-08, at 44.611 versus 44.623 billion light-years; see item 4).
10. The module imports its constants and functions from `hubblesLawExperiment`, `bigBangExperiment`, `darkEnergyExperiment` and `universeAgeExperiment` rather than redefining them, and does not import from `lightBendingExperiment`, `cosmicMicrowaveBackgroundExperiment` (restating the redshift if needed) or `gravitationalLensingExperiment` — a regression check (`CLAUDE.md` §8).

---

## Decisions Needing Human Review

**Confirmed by the owner (2026-10-08):** item 3 (radiation left out: ok), item 6 (include the faster-than-light statement in the tutor), and item 5 (keep the custom slider). The remaining items (1, 2, 4, 7, 8 and 9) stand as proposed.

1. **Title and placement.** Proposed: "How Far Can We See? The Observable Universe" as Cosmology Experiment 8.
2. **The cosmic microwave background as the edge.** The true edge of the observable universe (the particle horizon) is about 2% farther than the source of the cosmic microwave background (about 46.5 versus 45.7 billion light-years, real values). Proposed: use the cosmic microwave background as "the farthest we can see with light," say so plainly, and not compute the particle horizon. The alternative is to compute the particle horizon too, which is a second calculation and an infinite integral that needs radiation to be well-behaved.
3. **Radiation is left out.** As in Experiments 5 and 6. Consequences, all stated to the learner: the model's cosmic-microwave-background distance is about 44.6 billion light-years (real: about 45.7), and the model puts the emission at about 470,000 years after the Big Bang (real: about 380,000, the value Experiment 3 gives). The alternative is to add radiation, which is a second new idea and changes the formulas.
4. **Reuse of Experiment 5's distance function.** Proposed: import `comovingDistanceMpc` unchanged. I checked it (2026-10-08): it has no redshift cap (its `MAX_REDSHIFT` is only a display constant), and at redshift 1089.8 its default 2000 uniform steps give 44.611 billion light-years against 44.623 for a much finer integration, a 0.03% difference. Required test 9 keeps this honest. The cosmic microwave background redshift (1089.8) would be imported from Experiment 3 if that does not break its own independence test, otherwise restated as a given value. If the accuracy test ever failed, the fallback would be a new, log-spaced integration, which I would flag as a new numerical method.
5. **The control.** Proposed: four presets plus a "Custom" slider on a logarithmic scale from redshift 0.1 to 1089.8. The alternative is presets only, which is simpler.
6. **The faster-than-light statement.** Today, Hubble's Law (Experiment 1) gives the cosmic microwave background's source a recession speed of about 3 times `c` (70 km/s per Mpc × about 13,700 Mpc ≈ 960,000 km/s). Proposed: include it in the tutor's explanation, worded carefully, because it is the natural question and the most common misconception ("it must have moved faster than light"). It is a real feature of the model, but it is subtle physics, and Experiment 1 only established Hubble's Law for nearby galaxies. The alternative is to leave it out and say only "nothing travelled faster than light locally."
7. **Fixed 70% dark energy and Hubble constant 70.** Proposed: no dark-energy control, to keep a single new idea. The alternative is to reuse Experiment 6's share control, which ties this experiment to it but dilutes the point.
8. **The real reference values.** About 45.7 billion light-years for the source of the cosmic microwave background and about 46.5 for the edge of the observable universe, from a general web search on 2026-10-08 (the Wikipedia article "Observable universe" gives about 14.0 and 14.3 billion parsecs, which are about 45.7 and 46.6 billion light-years). Not checked against a primary source (a Planck results paper). They are shown as given values, for comparison only.
9. **The daily-life comparison.** Proposed: an ant on a stretching rubber band, used in the Results and the tutor only, because it would reveal the answer if placed in the introduction. A single stretching-space picture is used rather than the balloon surface, since the balloon also shows curvature, which this experiment does not teach.

---

## Relationship to Previous Experiments

- **Cosmology Experiments 1 and 2 (Hubble's Law, the Big Bang):** space expands, and distances scale with it. This applies that to the light's journey. It also closes a loose end: Experiment 2 introduced the horizon problem without ever saying how large the observable universe is.
- **Cosmology Experiment 3 (the cosmic microwave background):** its oldest light is the farthest source this experiment shows, and its redshift (1089.8) is reused.
- **Cosmology Experiments 5 and 6 (dark energy, the age of the universe):** the same flat matter-plus-dark-energy model; this reuses Experiment 5's distance function and Experiment 6's age and size formulas.
- **Cosmology Experiment 7 (gravitational lensing):** its distant galaxy (redshift 2) is one of the presets, and it said the distances there were "computed once". This experiment makes that kind of distance a result the learner can explore.

## Relationship to Later Experiments

Possible further directions (none proposed here; each needs its own Stage 1–2 proposal): why the cosmic microwave background is so uniform and how inflation could explain it (the horizon problem), the Bullet Cluster as stronger dark-matter evidence, the cosmic microwave background's tiny ripples and how structure formed, or whether dark energy changes over time.

---

## Success Criteria

1. The learner makes both predictions before the diagram and graph are shown.
2. Choosing a different source visibly changes all three distances in the diagram and the marker on the graph, not just a number.
3. The three distances (light travelled, today, when the light left) are visually distinct, labeled directly on the diagram, and explained in the caption.
4. The graph shows the light-travelled curve levelling off while the distance-today curve keeps climbing, with the chosen source marked.
5. The Results panel correctly compares both of the learner's predictions to what the model gives, with the worked numbers for the oldest light.
6. The experiment states plainly that this is not faster-than-light travel, and that space itself stretched.
7. The model caveats (radiation left out and the resulting gap from the real values, the fixed illustrative universe, the cosmic microwave background standing in for the edge, the observable universe not being the whole universe) are stated in the introduction, Results, and tutor.
8. "Observable universe", "distance today" and "distance when the light left" are defined in plain language at first use (`CLAUDE.md` §15).
9. The experiment does not claim to say how large the whole universe is.
10. No existing experiment's physics is modified or recomputed.

---

## Implementation Notes

Built one step at a time per `CLAUDE.md` §6: physics model and tests (`src/physics/observableUniverseExperiment.ts`, `.test.ts`), basic UI, introduction and prediction interaction, results panel, and tutor (`src/components/ObservableUniverseExperiment.tsx`, `ObservableUniverseTutor.tsx`), wired into `src/App.tsx`. Nothing from an earlier experiment was modified (only this experiment's own files and `App.tsx` changed).

- The cosmic microwave background redshift (1089.8) is restated in the physics module, with a test that it equals Experiment 3's own constant, so the module does not import Experiment 3's module (required test 10) and the two cannot drift apart. This settled a small conflict between "Decisions Needing Human Review" item 4 and required test 10.
- Experiment 5's `comovingDistanceMpc` was reused unchanged. Required test 9 confirms its default accuracy at redshift 1089.8.
- The distance diagram is drawn to a true linear scale on a fixed 0–50 billion light-year axis; the source's slide during playback is a linear visual aid, and the end values are exact.

**Complete-flow test and final review (2026-10-08, §21 Steps 9 and 10), in a headless browser from a fresh profile.** Checked the introduction, prediction gating, all four presets against the specification's table, the Custom slider at both ends, right and wrong predictions, the Results panel, the tutor, saved progress, changing the source and the predictions after a run, the mid-run animation, and phone width. Every Success Criterion and every Required Physics Test is covered. Gaps found and fixed:

- The term "flat" was used in the introduction without a definition (`CLAUDE.md` §15); the same gap Experiment 5's review found. Fixed with the same wording Experiment 5 uses.
- The blue bar (how far the light travelled) grew outward from Earth with a dot at its tip, which looked like light moving away from Earth, when the light travelled from the source toward Earth (`docs/PROJECT.md` §9: an animation must not imply an effect that is not in the model). Fixed by removing the dot and stating in the caption that the bar starts at Earth only so lengths can be compared.
- Success Criterion 7 (caveats in the introduction, Results and tutor): the tutor never said that the cosmic microwave background stands in for the farthest we can see. Fixed.
- The tutor's point 6 said the expansion history "decides how much the space stretched", which is imprecise (the stretch is the redshift itself; the history decides how it was spread over the trip). Rewritten.
- "The farthest anything could ever have sent a signal to us" blurred two different limits. Reworded to "the farthest from which any signal could have reached us by now" in the Results and the tutor.
- Two label overlaps in the pictures (the graph's "Your chosen source" against its title, and "The source" against the green bar's label), found in the complete-flow test and fixed there.

Other findings, not changed:

- This specification says the model's cosmic-microwave-background distance is "about 2.5%" below the real one, in two places. The computed figure is 2.4% (44.61 against 45.7), and the Results panel computes it live. The specification's figure is slightly off and needs the owner's approval to correct.
- Wording drafted by Claude that the specification does not contain (approved by the owner as written, 2026-10-08, together with the chapter summary): the firework daily-life picture in the introduction (the specification asked only that the rubber band stay out of it), the light-year conversion and the redshift-to-years examples in the caption, the "Try it with the source on the screen now" example, and tutor points 3 and 6.
- At a 390-pixel-wide window the whole app's content column is only about 230 pixels wide (the same in Experiments 4 and 7), so the pictures shrink and their labels become very small; the diagram's long labels make this more noticeable here. An app-wide layout matter, not changed, left for the owner to decide.
- The tutor's "before results" role is met by the prediction questions themselves, as in earlier experiments.
- The chapter summary in `src/App.tsx` is still a draft, and its "next" line says this is the last experiment.
- The test file's `node:fs/promises` type error under `tsc -b` is the same as in earlier experiments' tests.
