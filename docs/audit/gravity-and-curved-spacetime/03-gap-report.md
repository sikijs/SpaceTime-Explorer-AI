# Gap report: Gravity and Curved Spacetime Experiment 3 (Why gravity isn't just acceleration: tidal effects)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/03-tidal-effects.md | Components: src/components/TidalEffectExperiment.tsx, TidalEffectTutor.tsx | Physics module: src/physics/tidalEffectExperiment.ts (+ .test.ts, 16 cases) | Status: read-only, nothing changed

## Summary
Two predictions (planet cabin, rocket cabin; three buttons each), two controls (acceleration, convergence strength), two cabin drawings and a separation graph, a Results block and a tutor. Biggest gaps: no guess marks, no "How to read" caption, no check-up or notes, and the Results panel names and explains the "tidal effect" before the tutor. Size: **M**. Experiment 5 re-uses `Cabin` and the initial-condition constants.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Planet cabin: what will the two balls do? (`TidalEffectExperiment.tsx:469-476`) | "They'll drift together" / "stay the same distance apart" / "drift apart" (`:30-34`); `planetPrediction` then `submittedPlanetPrediction` (`:249, :251, :271`) | Planet cabin drawing (`:98-153`, ball gap) and the "planet" curve in the separation graph (`:167-239`). A final separation size could be marked on the graph's vertical axis (1 m start). |
| 2 | Rocket cabin: same three options (`:477-484`) | same | Rocket cabin drawing and the dashed "rocket" curve. |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `:265-270` result depends on g, height, separation, strength only | |
| A2 | Not met | no white mark in `Cabin` or graph | A white mark per guess on the graph (guess end-separation) with YOUR GUESS boxes; a separate mark for the planet and for the rocket guess. |
| A3 | Not met | | Three-way guess has a natural position: "together" below 1 m, "same" at 1 m, "apart" above 1 m. The size of "together/apart" has no value, so a marker with a caption saying so. |
| A4 | Not met | | Draw after the curve exists (`:219-220`). |
| A5 | N/A | graph and cabins exist | |
| A6 | Not met | only note `:234-236` | Add calculated-here / imagined line: convergence strength is exaggerated (`:345-349`). |
| A7 | Not met | intro `:317-356` silent; no note beside the two controls `:358-460` | Add both. Acceleration changes the fall time; strength changes the planet curve and final separation; guesses change nothing. |
| A8 | Not met | Module exports `runTidalEffectExperiment`, `ballPositionsAt`, types (`tidalEffectExperiment.ts:4-66`). `actualOutcomeFor` is in the component (`:38-40`), and `separationAt` also (`:160-163`) | Outcome function, guess-marker data and tests missing in the module. |
| A9 | Partly met | Tutor compare step prints both guesses and both outcomes (`TidalEffectTutor.tsx:59`) before the explanation; observe prompt says "two separation graphs" (`:57`), but there is one graph with two lines | Naming of marks impossible. |
| A10 | Not met (no statement) | Results `:552-565` "You predicted / What actually happened" | no older-rule sentence either. |

## Rule B
- B0. One Results block (`:528-579`): acceleration, strength, final separation planet, final separation rocket ("unchanged"), predicted/actual pairs, two conclusion sentences. No tables.
- B1. Not met. Reference exists inside the physics: rocket separation equals the start (1 m) and planet separation is less. A check-up ("start 1.000 m; rocket final 1.000 m, the same; planet final X m, less") needs no invented cut-off. The "real" tidal size for Earth is not given; the specification does not quote one (not checked).
- B2. Not met.
- B3. N/A (strength is an exaggerated stand-in; no published reference).
- B4. Partly met: guesses shown as text (`:554-564`), no row tags.
- B5. Partly met: final separations computed through `ballPositionsAt` but the difference/rounding is done in the component (`:543, :548`); `finalSeparationMeters` in the tutor is also component arithmetic (`Tutor.tsx:35-37`).

## Rule C
- C1. Partly met: cabins labelled "Planet"/"Rocket" (`:497, :503`); balls are colour-coded teal/red (`:130-131`) but never named; the graph lines have no on-canvas labels, axis labels are bare numbers (`:221-232`); no floor or direction of pull is drawn, so the planet's converging pull is not shown.
- C2. Partly met: the contrast is shown as ball positions and a numeric "Separation" (`:149`); the planet scene's drift is only visible if the strength is large enough.
- C3. Not met: no "How to read this diagram" caption.
- C4. Not met (one-line note `:234-236` only).
- C5. Not met in the picture; the tutor has real numbers (`Tutor.tsx:105-109`) after the run.
- C6. Not met.
- C7. Partly met: intro asks "Does that stay true no matter how big the cabin is?" (`:320-321`) and says the balls are watched "for any change in how far apart they are" (`:327-328`): hints that size matters (§12).
- C8. Partly met: "convergence strength" defined (`:345-348`); "tidal effect" first appears in the Results (`:574`) and tutor, after the run (fine) but undefined beyond "ocean tides".

## Other findings
- O1. None found against the specification (not compared line by line).
- O2. (a) Results panel `:568-576` explains the cause and names "tidal effect" before the tutor's explanation (§12 timing). (b) Initial cabin drawings before a run are generated from a hard-coded strength 0.3 (`:498, :504`), unaffected by the strength button; learner could think the control did nothing before running. (c) The tutor mentions "ocean tides" with no explanation (`Tutor.tsx:125-126`). (d) Tutor point 1: "the center is in a very slightly different direction from each ball's own position" (`:106-108`); plausible, no source. (e) "Experiment 1" cross-references lack the chapter name.

## What an update would touch, and its size (O3, O4)
TidalEffectExperiment.tsx (marks on graph, caption, intro, notes, results), TidalEffectTutor.tsx, physics module + test, specification. Must keep Experiment 5 working (exports `Cabin`, `INITIAL_*`, comments `:15-16, :96-97`). **Size: M.**

## Not checked
No browser view; the tutor's first 19 lines (props only) were skimmed; specification not compared line by line; Rule D N/A.
