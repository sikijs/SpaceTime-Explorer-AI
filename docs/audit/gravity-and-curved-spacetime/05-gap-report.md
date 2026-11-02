# Gap report: Gravity and Curved Spacetime Experiment 5 (What curves spacetime? Mass and distance)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/05-what-curves-spacetime.md | Components: src/components/SpacetimeCurvatureSourceExperiment.tsx, SpacetimeCurvatureSourceTutor.tsx (re-uses `RocketCabinClocks` from Experiment 2 and `Cabin` from Experiment 3) | Physics module: src/physics/spacetimeCurvatureSourceExperiment.ts (+ .test.ts, 9 cases) | Status: read-only, nothing changed

## Summary
Four predictions (each stronger / weaker / same), two controls (mass, distance, relative presets), two re-used panels (Experiment 2 clocks and Experiment 3 cabins) and a Results block listing derived strengths, tick counts and separations. Biggest gaps: no guess marks; the predicted quantities (the strengths) have no picture of their own; no caption beneath the re-used panels; the introduction states the answer to all four predictions before they are asked; and the "always stronger" claim is false where the model clamps (see O2). Size: **L** (the guesses are about how a strength changes with mass and distance, which has no picture today, so a new panel would be needed, per A5).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Closer mass: does the time-dilation effect get stronger, weaker or stay the same? (`SpacetimeCurvatureSourceExperiment.tsx:104-109`) | "Get stronger" / "Get weaker" / "Stay the same" (`:26-30`); `predictions` record, copied to `submittedPredictions` on Continue (`:145-154, :171-174`) | No picture of strength versus distance. Nearest: Experiment 2's clock panel (`:443-450`), which shows one setting only. |
| 2 | Closer mass: does the tidal effect get stronger, weaker or stay the same? (`:110-115`) | same | Experiment 3's cabins panel (`:452-462`), one setting only. |
| 3 | Bigger mass, time dilation (`:116-120`) | same | as 1 |
| 4 | Bigger mass, tidal effect (`:121-126`) | same | as 2 |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | Four predictions, asked together before the controls appear (`:339-340`). |
| A1 | Met | the controls are hidden until predictions are submitted; the result uses `selectedMass`/`selectedDistance` only (`:185-210`) | |
| A2 | Not met | no white mark anywhere | |
| A3 | Not met | | Guesses are a direction of change, so markers only. |
| A4 | Not met | | |
| A5 | Not met (needed) | the strengths are shown as numbers only (`:431-440`) | A new panel on the nearest picture (the two re-used panels), on its own scale: "strength against mass" and "strength against distance", with the real curve from the module and a white marker per guess. This is the Large part. |
| A6 | Not met | no picture notes at all | "Where the real picture comes from": calculated here from relative presets (not real kilograms or metres, `:296`) by the module's scalings; constants K_DILATION 0.3 and K_TIDAL 1.2 are chosen, not measured (`spacetimeCurvatureSourceExperiment.ts:10-11`). |
| A7 | Not met | intro `:268-308` and control area `:310-440` silent | Add both. |
| A8 | Not met | Module exports `SpacetimeCurvatureStrengths` and `strengthsForMassAndDistance` only (`:23, :32`). `actualOutcome()` hard-coded `'stronger'` in the component (`:40-42`); final separations computed in the component (`:218-225`) | Outcome function, curve sampler and guess-marker data with tests missing. |
| A9 | Partly met | Tutor compare step lists all four guesses with "it actually did stronger" (`SpacetimeCurvatureSourceTutor.tsx:66-76`) before the explanation | |
| A10 | Not met (no statement) | Results `:499-507` repeat guess and outcome | |

## Rule B
- B0. One Results block (`:474-517`): mass and distance labels, derived strengths, final tick counts, final separations, four prediction lines, one sentence. No tables.
- B1. Not met. Real reference: none from observation (the presets are relative); the module's own relations (strength grows as mass ÷ distance for clocks, mass ÷ distance³ for tides) could give "expected vs found" rows, but they are the module's own model, so no independent check-up exists.
- B2. Not met.
- B3. Partly relevant: the whole Results panel already follows the controls; a comparison "mass doubled / distance halved" would show the clamps, but the specification's real references are not given (not checked).
- B4. Partly met: text only (`:500-506`), the guess shown beside "it actually did stronger".
- B5. Partly met: strengths from the module; tick counts and separations come from Experiments 2 and 3's modules via the component; final separation arithmetic in the component (`:218-225`).

## Rule C
- C1. Partly met: panel titles "Experiment 2's rocket cabin ..." and "Experiment 3's cabins ..." (`:446, :455`); the re-used `RocketCabinClocks` has "Ceiling clock"/"Floor clock" (Experiment 2 `:47, :53`) and `Cabin` "Planet"/"Rocket"; no drawing of the mass or its distance exists at all.
- C2. Partly met: strengths follow mass/distance, but the panels are numeric; no drawing of the mass moving closer.
- C3. Not met: no "How to read this diagram" caption beneath the panels.
- C4. Not met.
- C5. Not met (numbers only appear in the tutor, `Tutor.tsx` explanation 1).
- C6. Not met.
- C7. Not met: intro `:297-301` says "Moving closer or using a bigger mass always makes both effects stronger, but the tidal effect ... grows faster", which answers all four predictions before they are asked (§12).
- C8. Partly met: "strength" and "convergence strength" are not re-defined here, only pointed to Experiments 2 and 3 (`:270-273`); "spacetime" and "first-order approximation" are not defined in plain words; "Small/Medium/Large" are relative presets (explained `:296`).

## Other findings
- O1. None against the specification found (not compared line by line).
- O2. (a) The intro and tutor say "always" stronger (`:298`, `Tutor.tsx` explanation 1) but the module clamps strengths to 0.05 to 0.9 and 0.02 to 0.9 (`spacetimeCurvatureSourceExperiment.ts:17-20, 40-50`). Example from the module's constants: Large mass (4) at Close (1) gives 1.2 and 4.8, both clamped (0.9 and 0.9), so "closer" changes nothing there; Small mass (1) at Far (4) gives tidal 1.2/64 = 0.019, clamped to 0.02. The learner can meet a "stay the same" result that the page says cannot happen. Report only. (b) The scalings (mass ÷ distance, mass ÷ distance³) and K constants have no source in the text read; the intro calls them "first-order" (`:302`). (c) The intro's trampoline picture (`:276-281`) says closer makes the dip "deeper", which is the answer to prediction 1 (hint). (d) The explanation point 3 ("same underlying curvature") is a conclusion in the tutor; fine for the tutor. (e) The cross-references "Experiment 2/3/4" lack the chapter name.

## What an update would touch, and its size (O3, O4)
SpacetimeCurvatureSourceExperiment.tsx (new strength panel with guess marks, caption, intro hint removal if the owner agrees, notes), SpacetimeCurvatureSourceTutor.tsx, physics module + test (curve sampler, outcome, markers), specification; Experiments 2 and 3 components are re-used, so changes there ripple. **Size: L.**

## Not checked
No browser view; tutor read in part (compare and explanation steps); specification not compared line by line; Rule D N/A.
