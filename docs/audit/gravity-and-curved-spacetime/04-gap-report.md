# Gap report: Gravity and Curved Spacetime Experiment 4 (Curved spacetime: why parallel paths don't stay parallel)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/04-curved-spacetime-geodesics.md | Components: src/components/CurvedSpacetimeExperiment.tsx, CurvedSpacetimeTutor.tsx | Physics module: src/physics/curvedSpacetimeExperiment.ts (+ .test.ts, 14 cases) | Status: read-only, nothing changed

## Summary
Two predictions (flat surface, curved surface; three buttons each), one control (curvature strength), two scene drawings (travelers' paths, with a "the pole" label) and a separation-over-distance graph, a three-line Results block and a tutor. This is the best-labelled picture of the group (guide paths, pole label). Biggest gaps: no guess marks, no "How to read" caption, no check-up or notes, outcome stated in the Results panel and tutor "compare" step before the explanation. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Flat surface: what will the two travelers do? (`CurvedSpacetimeExperiment.tsx:451-458`) | "drift closer together" / "stay the same distance apart" / "drift farther apart" (`:25-29`); `flatPrediction` then `submittedFlatPrediction` (`:280, :282, :295`) | Flat `Scene` (`:99-191`) and the flat (dashed) graph line (`:200-272`), vertical axis = separation, 1.0 m start. |
| 2 | Curved surface: same three options (`:459-466`) | same | Sphere `Scene` with its pole, and the solid graph curve. |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `:294` result from strength only | |
| A2 | Not met | no white mark in `Scene` (`:138-169`) or graph | White marks per guess on the graph's separation axis (above, at, below the 1 m start) with YOUR GUESS boxes, one per surface. |
| A3 | Not met | | A direction guess has no size: marker only, caption must say so. |
| A4 | Not met | | Show after the curves (`:252-253`) are drawn. |
| A5 | N/A | pictures exist | |
| A6 | Not met | note `:267-269` only | Add: calculated here from separation = start × cos(distance ÷ radius) (module `curvedSpacetimeExperiment.ts:1-6`); a geometry analogy, not a model of spacetime (intro `:381-384`). |
| A7 | Not met | intro `:344-390` silent; no note beside the strength control `:392-442` | Add: strength changes the sphere's radius, path length and curve; guesses change nothing. |
| A8 | Not met | Module exports `REFERENCE_RADIUS_METERS`, `runCurvedSpacetimeExperiment`, `separationAt`, types (`:11-47`). `actualOutcomeFor` sits in the component (`:33-35`) | Outcome and marker functions and tests missing. |
| A9 | Partly met | Tutor compare step prints guesses and outcomes (`CurvedSpacetimeTutor.tsx` compare string, shown in the 'compare' step), before the explanation; observe prompt "Look at both graphs" (one graph) | |
| A10 | Not met (no statement) | `:521-534` "You predicted ... What actually happened" | |

## Rule B
- B0. One Results block (`:500-536`): strength, final separation on flat ("unchanged"), final separation on curved ("started at 1.000 m"), predicted/actual pairs. No tables.
- B1. Not met. Reference exists in the module: flat final separation equals the start (1.000 m); sphere final separation is 0.000 m by construction (`maxDistanceMeters` is a quarter circle, `curvedSpacetimeExperiment.ts:38-39, 70`). A check-up with "the same" / "less" readings is possible. The Results block does not tell the learner the end value is zero because the paths meet at the pole.
- B2. Not met.
- B3. N/A.
- B4. Partly met: text guesses (`:523-532`), no row tags.
- B5. Partly met: `separationAt` is from the module; the tutor's `finalSphereSeparation` is computed in the tutor component (not read in detail).

## Rule C
- C1. Mostly met: "Flat surface", "Curved surface (sphere)" titles (`:478-479`), "the pole" (`:164-168`), dashed guide curves with traveler colours (`:162-163`). Not labelled: the two travelers (teal/red, never named), the sphere outline, graph lines (note only), axes bare numbers (`:254-265`, "m traveled" is labelled).
- C2. Met: the sphere's guide curves bend and an ellipse outline is drawn (`:148-163`) so flat and curved look different; strength changes path length and curve.
- C3. Not met: no "How to read this diagram" caption.
- C4. Not met; only `:267-269`. "Geodesic" is defined in the intro list (`:373-376`) but "separation" and the graph axes are not described.
- C5. Not met in the picture; tutor has numbers after the run.
- C6. Not met.
- C7. Partly met: the intro's "does 'walking as straight as you possibly can' even mean the same thing on a flat floor?" (`:354-356`) and the aria label of the sphere scene "meeting at a single point (the 'pole')" (`:144`, screen-reader only) hint at the answer (§12).
- C8. Partly met: geodesic defined in the intro; "curved spacetime" appears in the title; "pole" labelled but never explained for a learner; "curvature strength" explained only as "an exaggerated stand-in" (`:378-379`).

## Other findings
- O1. None found against the specification (not compared line by line). Possible mismatch of the intro's "a fixed small distance apart" with the 1 m separation vs 10 m / strength radius; not checked.
- O2. (a) Pre-run `previewResult` uses a hard-coded 0.5 strength regardless of the buttons (`:336`), so the drawing does not follow the control until Run. (b) Results show the sphere final separation of "0.000 m" without saying the travelers meet at the pole. (c) The tutor point 5 and point 3 say a rocket moves through "flat spacetime" and "Recall Experiment 3: ... for the same reason" (`Tutor` explained step): a strong causal claim with no source; the tutor says the sphere is an analogy (good). (d) The explanation in the Results step is absent here (better than Experiments 2 and 3) but the outcome appears early. (e) Chapter cross-references ("Experiment 3") lack the chapter name.

## What an update would touch, and its size (O3, O4)
CurvedSpacetimeExperiment.tsx (graph marks, caption, intro, notes, results), CurvedSpacetimeTutor.tsx, physics module + test, specification. **Size: M.**

## Not checked
No browser view; the tutor's explanation step was read in a filtered view (style lines removed); specification not compared; Rule D N/A.
