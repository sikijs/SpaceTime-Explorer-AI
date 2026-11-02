# Gap report: Gravity and Curved Spacetime Experiment 2 (Does gravity change time?)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/02-gravitational-time-dilation.md | Components: src/components/GravitationalTimeDilationExperiment.tsx, GravitationalTimeDilationTutor.tsx | Physics module: src/physics/gravitationalTimeDilationExperiment.ts (+ .test.ts, 10 cases) | Status: read-only, nothing changed

## Summary
One prediction (same or different rate), one "strength" control, a floor/ceiling clock panel and a tick-count graph, a short Results block and a long tutor explanation. Biggest gaps: no guess mark, no "How to read" caption (one-line note only), no check-up or "What this table tells us" notes, and the Results panel gives the explanation (gravitational time dilation, GPS) before the tutor runs. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Will the floor and ceiling clocks tick at the same rate or at different rates? (`GravitationalTimeDilationExperiment.tsx:325-328`) | "The same rate" / "Different rates" (`:25-28`); `predictionChoice` then `submittedPrediction` (`:151-152, :170-171`) | "Tick count over time" graph (`:69-141`): whether the floor (solid) and ceiling (dashed) lines separate. Yes/no, so a marker, no size. |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `:169` result from `selectedStrength` only | none |
| A2 | Not met | no white mark/box in graph `:99-135` | Marker + YOUR GUESS box on the graph. |
| A3 | Not met | | Marker only (yes/no); caption must say so. |
| A4 | Not met | | Show once both lines are drawn (`:121-122`). |
| A5 | N/A | answer lives in the existing graph | |
| A6 | Not met | only `:136-138` note | Add "Where the real picture comes from": calculated here from 1/(1 − strength), with an exaggerated strength (the intro says so, `:242-246`); not measured. |
| A7 | Not met | intro `:214-252` silent on predictions; no note by the control `:255-319` | Add both sentences. The strength control changes the drawings (graph slope, tick counts). |
| A8 | Not met | Module exports `runGravitationalTimeDilationExperiment`, `tickCountAt`, the result type (`gravitationalTimeDilationExperiment.ts:4,11,28`). `actualOutcome()` hard-coded `'differentRates'` in the component (`:33-35`). | Outcome and marker functions + tests missing. |
| A9 | Partly met | Tutor compare step states the outcome before the explanation (`GravitationalTimeDilationTutor.tsx:57-58`); "Look at the two tick counts" (`:56`) | No marks to name. Verdict timing for the owner. |
| A10 | Not met (no statement) | no sentence that predictions do not change results; Results has "You predicted / What actually happened" (`:398-404`) | Report as current state. |

## Rule B
- B0. One Results block (`:380-419`): strength and frequency ratio, ceiling ticks, floor ticks, "You predicted / What actually happened", two sentences of conclusion. No tables.
- B1. Not met. A reference exists in the physics: the ceiling should count 1/(1 − strength) ticks per floor tick (the tutor prints it, `Tutor.tsx:112-115`). A check-up row "ticks ratio expected vs found" would be trivially the same, since both come from one formula (a calculation, not a measurement); the specification's real-world references (e.g. GPS, `:414-415`) are not quantified. Owner to decide whether a check-up adds anything.
- B2. Not met.
- B3. N/A: the control only changes the exaggerated strength; no reference.
- B4. Partly met: guess shown as text next to the outcome (`:398-404`), no row tag.
- B5. Partly met: the ratio is from the module (`result.frequencyRatio`); `1 / result.frequencyRatio` is computed in the tutor component (`Tutor.tsx:112`), not the module (§9 gap).

## Rule C
- C1. Partly met: "Ceiling clock" / "Floor clock" labelled (`:47, :53`); the graph's two lines have no on-canvas labels (legend only in the note `:137`); axes show bare numbers (`:123-134`, no axis titles for "ticks"); no drawing of the rocket cabin itself (`RocketCabinClocks` is two text boxes, `:43-60`).
- C2. Partly met: the two clocks have distinct colours and tick numbers (`:47, :53`); the strength changes the numbers but the panel is text only.
- C3. Not met: no "How to read this diagram" caption.
- C4. Not met: only `:136-138`. "Tick", "strength" and axis units are not defined beside the picture.
- C5. Partly met: worked example is in the tutor (`Tutor.tsx:169-180`), not the caption.
- C6. Not met: no look-for list.
- C7. Met: intro does not say the clocks differ (`:214-252`); but "Why even ask this" frames height as normally irrelevant (`:222-226`), a mild lead-in.
- C8. Partly met: "strength" explained in the intro (`:241-247`); "frequency ratio" shown in Results (`:387`) without definition; "redshift", "Doppler" are defined in the tutor (`Tutor.tsx:107-110`), after use of "tick" ratio.

## Other findings
- O1. None found against the specification (not compared line by line).
- O2. (a) Results panel `:408-416` states "gravitational time dilation" and the GPS point before the tutor, which the explanation step then repeats (§12 timing). (b) The tutor cross-refers to "Experiment 4" time dilation (`Tutor.tsx:191`) without the chapter name; ambiguous with other groups' Experiment 4. (c) The tutor says "no matter who's watching ... everyone agrees" (`:198-204`), which the owner may want checked for how it reads next to the earlier relative-motion claim. (d) "1.09×10⁻¹⁵ s" figure (`:177`) is computed by hand (g·h/c² = 9.8 × 10 / c²), not from the module, and the worked example (floor tick sent at cabin speed "zero", 1 s later 9.8 m/s) mixes a different mechanism from the formula used; no source. (e) The model is stated as "first-order" (`:249-251`), yet the tick ratio 1/(1 − strength) is shown as "exactly" (`Tutor.tsx:113-115`).

## What an update would touch, and its size (O3, O4)
GravitationalTimeDilationExperiment.tsx (graph marker, caption, intro, control note, results), the Tutor, physics module + test, specification. Experiment 5 re-uses `RocketCabinClocks` and `RUN_DURATION_FLOOR_SECONDS` (comments `:18-22, :41-42`), so any change must keep Experiment 5 working. **Size: M.**

## Not checked
No browser view; spec not compared line by line; no sources list (Rule D does not apply).
