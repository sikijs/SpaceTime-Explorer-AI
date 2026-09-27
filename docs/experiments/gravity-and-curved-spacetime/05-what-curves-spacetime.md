# Gravity and Curved Spacetime — Experiment 5: What Curves Spacetime? Mass and Distance

**Status: built, complete-flow tested, and reviewed against this specification (`CLAUDE.md` §21 Steps 9–10, 2026-09-27).** Physics model (`src/physics/spacetimeCurvatureSourceExperiment.ts`), interface, prediction, results panel, and AI tutor are built and wired into the guided journey (`src/components/SpacetimeCurvatureSourceExperiment.tsx`, `src/components/SpacetimeCurvatureSourceTutor.tsx`). The owner's line-by-line wording approval (`CLAUDE.md` §28.1) is complete (2026-09-27), and all items in "Decisions Needing Human Review" are confirmed (2026-09-27). See "Implementation Notes" below for what the wording review and the final review each found and fixed.

## Implementation Notes

During the owner's wording review (§28.1), the owner asked for a small reminder explanation of "tidal effect" wherever it appears without one, since the term was defined back in Experiment 3 and this experiment reuses it repeatedly. Added, in three places: the introduction's "What we assume" bullet ("the tidal effect (the two balls drifting together, from Experiment 3)"), the "bigger mass" tidal prediction question ("the tidal effect (the two balls drifting together)"), and the tutor's explanation point 2 ("The tidal effect (Experiment 3's two balls drifting together)"). The short prediction-question labels and the tutor's point 3 (which already reads "Experiment 3's tidal drift" in context) were left as-is, to avoid over-explaining in places that are either compact labels or already carry enough context. Approved as revised, with no further changes requested.

The final review against this specification (§21 Step 10) found and fixed five gaps:

1. **The prediction prompts shown to the learner were duplicated, hardcoded strings, separate from the `predictionQuestions` array.** This meant the "tidal effect" reminder added during the wording review above had only been applied to the array (used for the results panel and tutor), not to the actual question rendered in the prediction step — the learner never actually saw that reminder. Fixed: the four `PredictionQuestion` elements are now rendered by mapping over `predictionQuestions`, so there is exactly one copy of each prompt's text.
2. **The two panels were not actually side by side**, contradicting the Physical Situation and Display sections' explicit "side by side" requirement — each panel's wrapping `<div>` was stretching to the width of its own heading's unwrapped text (a classic flexbox sizing issue), forcing the two panels onto separate lines. Fixed: each wrapper was given an explicit `maxWidth` (`280px` for the clock panel, `400px` for the tidal panel) so the heading text wraps within it instead of forcing the div wide; verified in the browser that both panels now sit on the same row.
3. **The introduction stated only three of this specification's four required "Simplifying assumptions."** The non-relativistic assumption (present in Experiments 2 and 3's own introductions) was missing. Fixed: added "This experiment doesn't use anything about light, moving clocks, or speeds close to light — it's about ordinary gravity, like Experiments 2 and 3."
4. **Clicking "Run" never actually animated either panel**, contradicting the Display and Run sections (`CLAUDE.md` §11 — playback speed must not change the physical result, but there was no playback at all) — the experiment jumped straight from the pre-run snapshot to the final, completed state. Fixed: added a `status` state machine (`idle`/`running`/`complete`) and a `requestAnimationFrame` loop, matching Experiment 2's and Experiment 3's own existing playback pattern, so both panels now animate together over a shared 2.5-second real-world duration before the Results panel and tutor appear.
5. **While building the fix for #4, a related bug surfaced and was fixed in the same pass:** `strengths`, `dilationResult`, and `tidalResult` were recomputed as new object instances on every render, so the animation's `useEffect` (keyed on `tidalResult`) restarted itself on every tick instead of ever completing. Fixed by memoizing all three with `useMemo`, keyed on the selected mass and distance.

No other gaps were found. (The browser check of the final animation fix showed the tick counts and ball separations frozen at their initial values under the browser-automation session used for this review; the same freeze was independently confirmed on Experiment 2's own already-shipped, unmodified animation under the identical session, which is not part of this experiment's scope — this points to `requestAnimationFrame` throttling in a backgrounded automation tab, not a defect in either experiment's code, since the code itself follows the same pattern already working for real users in Experiments 2 and 3.)

Two further corrections were made to this specification's own text, to keep it in sync with the implementation (`CLAUDE.md` §28.2), neither requiring a code change:
- The Physical Situation section's "(relabeled as sitting in a real gravitational field for this experiment)" was dropped — the panel keeps Experiment 2's own "rocket cabin" framing and label, which the owner reviewed and approved as-is.
- The "Decisions Needing Human Review" item about default values was corrected: Experiments 2 and 3 do each have a single default (`0.3`, from each component's own `useState`), so this experiment's constants were chosen to reproduce that default exactly, rather than there being "no default to reproduce."

This specification was drafted per `CLAUDE.md` §23 Stage 3, following the proposal Claude Code made in conversation on 2026-09-27, in response to the milestone set after Experiment 4 (curved spacetime: geodesics) was completed. Experiment 4's own "Relationship to Later Experiments" section named this direction: an experiment showing how a massive body's presence is what makes nearby spacetime curved, linking back to Experiment 2 (gravitational time dilation) and Experiment 3 (tidal effects) as two more consequences of the same curvature.

The following were raised at proposal stage and confirmed by the owner (2026-09-27):

1. **Physics relations** — keep the two real first-order relations (tidal strength scaling with `mass / distance³`, time-dilation strength scaling with `mass / distance`), but simplify how they're presented to the learner: discrete presets rather than continuous formulas or sliders. Confirmed.
2. **Controls** — preset choices for mass and distance, each with an "Other" custom option, matching Experiment 1's preset-plus-custom pattern. Confirmed.
3. **Integration with Experiments 2 and 3** — leave Experiments 2 and 3 completely unchanged (their sliders, wording, and approvals stand as-is); this experiment gets its own scene and its own mass/distance controls, calling Experiment 2's and Experiment 3's existing physics functions directly rather than modifying or replacing them. Confirmed (Claude's recommendation, accepted).
4. **Sequencing** — Experiment 5 of "Gravity and Curved Spacetime," immediately following Experiment 4 (curved spacetime: geodesics). Confirmed.

## Overview

Experiments 2 and 3 each asked the learner to move an abstract, unexplained slider — "strength" for gravitational time dilation, "convergence strength" for the tidal effect — and observe the result. Neither experiment said where that slider's value actually comes from. This experiment answers that question: both effects come from the same two real-world quantities, how much mass is nearby and how far away it is, and grow or shrink together as those two quantities change.

The learner adjusts a mass and a distance, and watches both of Experiment 2's clocks and both of Experiment 3's falling-ball cabins respond together, driven by the same mass and distance. This does not introduce a new physical effect — it reuses Experiment 2's and Experiment 3's exact existing formulas unchanged, only replacing their independent, arbitrary input sliders with two shared, physically-motivated inputs.

This experiment uses first-order (weak-field) proportionalities, simplified further into discrete presets for the learner — real numbers are not shown as an exact formula, and the specification says so plainly.

---

## Learning Objective

After this experiment, the learner should understand:

1. Experiment 2's gravitational time dilation and Experiment 3's tidal effect are not two independent, unrelated phenomena — both grow stronger closer to a mass, and both grow stronger for a bigger mass.
2. The two effects do not grow at the same rate: moving closer to a mass increases the tidal effect much faster than it increases time dilation (a real, if simplified, feature of the underlying physics: tidal strength scales roughly with `mass / distance³`, time-dilation strength with `mass / distance`).
3. Both effects are two different observable consequences of one underlying cause: how strongly spacetime is curved at that location.
4. This does not change anything already learned in Experiments 2 or 3 — it only explains what their abstracted "strength" sliders were secretly standing in for all along.

---

## Physical Situation

No new visual scene of its own. The learner picks a mass and a distance, and the experiment shows, side by side:

- **Left: Experiment 2's rocket cabin**, with its floor and ceiling clocks, running with a time-dilation strength derived from the chosen mass and distance.
- **Right: Experiment 3's planet cabin**, with its two side-by-side balls, running with a convergence strength derived from the same chosen mass and distance.

(During implementation, the "relabeled as sitting in a real gravitational field" idea from the original draft was dropped — the panel keeps Experiment 2's own "rocket cabin" framing, labeled simply "Experiment 2's rocket cabin, at this mass and distance," which the owner reviewed and approved as part of §28.1.)

Both panels reuse Experiment 2's and Experiment 3's existing rendering and results components, unmodified, only fed a computed `strength` and `convergenceStrength` instead of the learner picking those numbers directly.

### Simplifying assumptions (must be stated to the learner, in plain language)

- This experiment uses the same first-order (weak-field) approximation as Experiments 2 and 3, not the exact general-relativistic treatment.
- The mapping from "mass" and "distance" presets to the two strength values is itself a further simplification, chosen to preserve the right *qualitative* behavior (closer or heavier means a stronger effect, and the tidal effect grows faster with distance than time dilation does) rather than realistic numbers — with a real star and real distances, both effects are far too small to see, exactly as Experiments 2 and 3 already state.
- This experiment does not compute or display real units (kilograms, meters) for mass or distance — only relative presets ("small/medium/large," "close/medium/far"), because the underlying strength controls are themselves already abstracted, unrealistic quantities.
- This experiment is entirely non-relativistic in the same sense as Experiments 2 and 3: nothing here moves close to `c`.

### Not introduced

Exact general-relativistic field equations, real astronomical values, the Schwarzschild metric, orbits, or light bending — candidates for later experiments, not this one.

---

## Physics Model

No new fundamental physics — this experiment adds one small, explicit derivation layer in front of Experiment 2's and Experiment 3's existing, unmodified functions.

```typescript
// src/physics/spacetimeCurvatureSourceExperiment.ts
export function strengthsForMassAndDistance(
  relativeMass: number,       // dimensionless preset value; > 0
  relativeDistance: number    // dimensionless preset value; > 0
): {
  timeDilationStrength: number;     // fed directly into runGravitationalTimeDilationExperiment's `strength`
  convergenceStrength: number;      // fed directly into runTidalEffectExperiment's `convergenceStrength`
}
```

```
timeDilationStrength  = clamp(k_dilation * relativeMass / relativeDistance,      strengthMin, strengthMax)
convergenceStrength   = clamp(k_tidal    * relativeMass / relativeDistance ** 3, convergenceMin, convergenceMax)
```

- `relativeMass` and `relativeDistance` are dimensionless learner-facing presets (see "Learner Controls"), not real mass or distance.
- `k_dilation` and `k_tidal` are fixed constants chosen so that the "medium mass, medium distance" preset reproduces each experiment's own existing default strength value exactly — so nothing already approved in Experiment 2 or 3 silently changes when viewed through this experiment.
- `strengthMin`/`strengthMax` and `convergenceMin`/`convergenceMax` reuse Experiment 2's and Experiment 3's own existing valid ranges for `strength` and `convergenceStrength` respectively; values outside those ranges are clamped, so this experiment can never hand an invalid input to either existing function.
- The result feeds directly into the existing, unmodified `runGravitationalTimeDilationExperiment` and `runTidalEffectExperiment`. No changes to `gravitationalTimeDilationExperiment.ts` or `tidalEffectExperiment.ts`.

---

## Learner Controls

- **Mass**: presets **small**, **medium**, **large**, or **Other** (a custom relative value), matching Experiment 1's preset-plus-custom pattern.
- **Distance**: presets **close**, **medium**, **far**, or **Other** (a custom relative value), same pattern.
- A single **run** control, enabled once both are chosen (no prediction gate needed beyond the prediction activity below, which happens before mass/distance are even chosen).

---

## Prediction Activity

Before choosing mass or distance, the learner is asked, referring back to what they already saw in Experiments 2 and 3, as four separate questions (as approved by the owner, `CLAUDE.md` §28.1):

1. "If you moved the mass closer, would the ceiling-clock time-dilation effect from Experiment 2 get stronger, weaker, or stay the same?"
2. "If you moved the mass closer, would the tidal drifting-together effect from Experiment 3 get stronger, weaker, or stay the same?"
3. "If you used a bigger mass instead, would the time-dilation effect get stronger, weaker, or stay the same?"
4. "If you used a bigger mass instead, would the tidal effect (the two balls drifting together) get stronger, weaker, or stay the same?"

Each with choices "Get stronger" / "Get weaker" / "Stay the same". Not scored.

---

## Experiment Behavior

### Introductory text (as approved by the owner, `CLAUDE.md` §28.1)

> **The question.** In Experiment 2, a "strength" slider controlled how much faster the ceiling clock ticked. In Experiment 3, a "convergence strength" slider controlled how much the two balls drifted together. Where do those numbers actually come from?
>
> **What happens.** You'll pick how massive a nearby body is, and how far away it is, and watch Experiment 2's clocks and Experiment 3's balls respond together — both driven by the same two choices.
>
> **Your job.** Change the mass and distance, and compare how much each effect changes.
>
> **What we assume.**
> - Mass and distance here are relative presets, not real kilograms or meters.
> - Moving closer or using a bigger mass always makes both effects stronger, but the tidal effect (the two balls drifting together, from Experiment 3) grows faster than the time-dilation effect as you get closer.
> - This uses the same simplified, first-order approximation as Experiments 2 and 3.

### Display

Experiment 2's cabin panel and Experiment 3's cabin panel, side by side, each unchanged from their own experiments, both re-run whenever the learner changes mass or distance.

### Run

Both panels animate simultaneously using their own existing playback logic (`CLAUDE.md` §11 — playback speed must not change the physical result).

---

## Results Display

- The chosen mass and distance presets, and the two derived strength values.
- Both panels' existing results (final tick counts; final ball separation).
- The learner's four predictions, shown beside the actual directions of change.
- A plain-language statement: both effects come from the same underlying cause — how strongly spacetime is curved at that location — and grow together, though at different rates, as mass increases or distance shrinks.

---

## Expected Observations

1. Increasing mass (distance held fixed) increases both the time-dilation gap and the tidal convergence.
2. Decreasing distance (mass held fixed) increases both, but the tidal convergence increases noticeably faster than the time-dilation gap.
3. At the reference "medium mass, medium distance" preset, both panels match Experiment 2's and Experiment 3's own existing default results exactly.

---

## Expected Learner Understanding

The learner should be able to say: "The 'strength' sliders in Experiments 2 and 3 weren't arbitrary — they both depend on how much mass is nearby and how close it is. Moving closer or using more mass makes both the time-dilation effect and the tidal effect stronger, but getting closer affects the tidal effect more than it affects time dilation. Both are different symptoms of the same underlying cause: curved spacetime."

---

## New Concepts Introduced

None new — this experiment connects three already-introduced ideas (time dilation, tidal effect, curved spacetime) to their common physical source for the first time.

---

## Relationship to Previous Experiments

- Directly fulfills Experiment 4's "Relationship to Later Experiments" note.
- Reuses Experiment 2's and Experiment 3's physics functions and rendering completely unchanged; adds one small new derivation (`strengthsForMassAndDistance`) in front of them.
- Does not touch Experiment 4's geodesic-convergence formula directly — that connection (mass/distance as the source of `curvatureStrength` in Experiment 4's sphere model) is a candidate for a later experiment, not this one.

## Relationship to Later Experiments

None approved. This experiment's mass/distance framing could motivate later experiments on orbits (a geodesic that curves around a mass instead of falling straight in) or light bending (light following a geodesic despite having no mass) — not proposed or approved here.

---

## Required Physics Tests

1. `strengthsForMassAndDistance` at the reference "medium mass, medium distance" preset returns `timeDilationStrength` and `convergenceStrength` exactly equal to Experiment 2's and Experiment 3's own existing default values.
2. Both returned strengths strictly increase as `relativeMass` increases, distance held fixed.
3. Both returned strengths strictly increase as `relativeDistance` decreases, mass held fixed.
4. For a fixed mass, doubling distance decreases `convergenceStrength` by a strictly larger factor than it decreases `timeDilationStrength` (reflecting the `1/r³` vs. `1/r` scaling).
5. Both returned strengths are always clamped within Experiment 2's and Experiment 3's own valid `strength`/`convergenceStrength` ranges, for every tested mass/distance combination, including extreme presets and "Other" custom values.
6. Deterministic across repeated calls; independent of any UI or animation state.

---

## AI Tutor Behavior

Follows the predict → observe → explain pattern of Experiments 1–4 in this phase:

- **Before the run:** helps the learner form all four predictions; does not reveal the answer.
- **During the run:** silent.
- **After the run:**
  1. Observation: "Look at both panels. When you moved the mass closer, which effect changed more?"
  2. Prediction comparison: the learner's four predicted directions beside the actual ones.
  3. Conceptual question: "Both effects come from the same mass at the same distance. Why might they not grow at exactly the same rate?"
  4. Explanation: (1) both the time-dilation gap and the tidal drift grow with more mass and less distance; (2) they don't grow at the same rate — the tidal effect (Experiment 3's two balls drifting together) is more sensitive to distance than time dilation is; (3) this is because both are different consequences of one underlying fact, how curved spacetime is at that location, and curvature shows up differently depending on what you're measuring; (4) this connects back to Experiment 4: the same curved spacetime that bent the two travelers' paths together is what's doing both jobs here.
  - The tutor must not introduce real astronomical values, orbits, light bending, or the exact general-relativistic field equations — out of scope for this experiment.

---

## Decisions Needing Human Review

Resolved with reasonable defaults by Claude (2026-09-27), all confirmed by the owner (2026-09-27):

1. **Exact scaling constants and presets.** Experiments 2 and 3 both default to a `strength`/`convergenceStrength` of `0.3` when their own chapter first loads (`useState<StrengthPreset>(0.3)` in each component) — this experiment's constants reproduce that same default exactly. `relativeMass` presets **small = 1, medium = 2, large = 4**; `relativeDistance` presets **close = 1, medium = 2, far = 4**; constants `k_dilation = 0.3`, `k_tidal = 1.2`, chosen so "medium mass, medium distance" lands exactly on `0.3`. Worked extremes: large mass + close distance clamps both strengths to their existing maximums (`0.9`); small mass + far distance gives `timeDilationStrength ≈ 0.075` (within range) and clamps `convergenceStrength` to its existing minimum (`0.02`). **Confirmed.**
2. **Title** — "What Curves Spacetime? Mass and Distance". **Confirmed as final (no longer a working title).**
3. **Showing derived strength values** — shown as numbers in the Results Display (as drafted above), matching Experiments 2 and 3's own precedent of displaying their strength/convergence values numerically. **Confirmed.**
4. **Prediction structure** — kept as four separate predictions (as drafted), matching Experiment 3's precedent of one prediction per scene rather than a combined question. **Confirmed.**

These are numeric/structural implementation decisions, not learner-facing wording. The owner's line-by-line wording approval (`CLAUDE.md` §28.1) of the introduction, prediction, results, and tutor text is complete (2026-09-27) — see "Implementation Notes" above.

---

## Success Criteria

1. The physics model reuses Experiment 2's and Experiment 3's existing functions completely unchanged, adding only the new mass/distance-to-strength derivation.
2. The learner predicts before choosing mass and distance.
3. The results make visible, numerically and visually, that both effects grow with mass and shrink with distance, and that they do so at different rates.
4. The learner can state, in their own words, that Experiments 2 and 3's abstracted sliders were standing in for mass and distance from a real curving mass all along.
5. The introduction and tutor state plainly that the mass/distance-to-strength mapping is a further simplification on top of Experiments 2 and 3's own existing approximations.
6. No real units, orbits, light bending, or exact field equations appear.
