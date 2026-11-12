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

---

# Re-read, 2026-11-12: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `CurvedSpacetimeExperiment.tsx` (549 lines), `CurvedSpacetimeTutor.tsx` (143), `curvedSpacetimeExperiment.ts` (61) with its 14 tests, the specification `04-curved-spacetime-geodesics.md`, and the Gravity 3 audit it follows (`03-gap-report.md`, `03-draft-wording.md`, as built and approved on 2026-11-12). Nothing changed. Rules A to C above stand; this section adds what they did not cover and carries over what Gravity 1 to 3 settled.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds everything in one column: introduction, the strength buttons, both predictions, the two surfaces, the graph, the run button, Results, the tutor (`:260-549`) | Part 1 (the two predictions, "Send them walking", the two surfaces and the graph), Part 2 (the strength control and a drawing that follows it), Part 3 (results), Part 4 (tutor). |
| E2, E4 | Not met | No Part headings, lines or leads | Four leads in the shared colours, drafted for approval; Part 1's lead gives no answer (§12). |
| E3 | Not met | No links list, no words box | See "Links and Words". |

## Parts 2 to 4 appear after the first Run
**Partly met.** Results and the tutor appear when the run completes (`isComplete`, `:480, :524`). The strength control is visible from the start (`:339-390`). Under the Parts layout it moves into Part 2 and appears after the first run, with a note saying what to do next. Part 1 would be fixed at strength 0.5, the preset the page opens on.

## Links and Words
- **"Want to know more?": Not met. Not searched or read yet.** The page uses no measured result (both lines are calculated), so there is no paper for the page itself. Background ideas: a "geodesic" (a path that is as straight as possible), the sphere used as the analogy, and curved spacetime, which the tutor names only after the run, so any official page on curved spacetime would be held back until after the tutor. I have not searched, and nothing is linked until it is read (§29 rule 3(c)).
- **"Words and formulas" box: Not met.** Terms on the page: traveler, flat surface, curved surface, sphere, geodesic, separation, graph, curvature strength, radius, the pole, analogy, curved spacetime. Formulas the module uses, with the page's own numbers: radius = 10 m ÷ strength (strength 0.5 gives 20 m); distance to the pole = radius × π ÷ 2 (20 × 1.5708 = 31.4 m); separation on the sphere = start × cos(distance ÷ radius), for example 1 × cos(0.5) = 0.878 m after 10 m at strength 0.5. The sphere formula would be held back from the box until the Part 1 caption, since it shows the answer (§12).

## Start over, not Change prediction
**Not met.** The only reset is "Walk Again", the same button as "Send them walking" (`:456-463`); it clears both guesses and is not there on the first screen. Needed: an always-visible "Start over", greyed until a guess or run exists and while running; a line saying both guesses are locked after Run; "Walk Again" removed.

## Items the re-read changes or sharpens
- **The strength control changes only two numbers, not the pictures (new, the most important finding).** Both pictures stretch their distance axis to each run's own length (`xFor` normalises by `maxDistanceMeters`, `:97, :215`), and the curve is cos(distance ÷ radius), so the sphere's drawing and the graph's curve are **identical for every strength**. Only the end label ("m traveled") and the Results numbers change. §14 rule 2: a control that changes a number must not leave the animation identical. Suggested for Part 2's Drawing A (as in Gravity 1 to 3): a **fixed distance axis**, so that strength 0.2 (radius 50 m, meeting at 78.5 m), 0.5 (20 m, 31.4 m) and 0.8 (12.5 m, 19.6 m) give visibly different curves, the learner's sphere curve in pink and the flat line in light pink (dashed), with Part 1's sphere curve in grey. A fixed axis of 0 to 80 m fits the three presets; a smaller "Other" strength would stretch it in steps of 20 m with a note, as Gravity 2 does.
- **Two predictions, three answers each.** "Drift closer together" / "stay the same distance apart" / "drift farther apart", once per surface. As in Gravity 3: **two white marks**, one at the end of each line, each in its own YOUR GUESS box with a direction arrow (down, none, up) that has no length of its own and a caption that says so. The sphere line ends at 0 m and the flat line at 1 m.
- **Room for "farther apart".** The graph's vertical axis runs from 0 to the 1 m start (`yFor`, `:217-218`), so a guess of "apart" has nowhere to point. Extend the axis to 1.2 m (a change of scale, not of any number) with a dotted line at the 1 m start.
- **Labels (C1).** Still unlabelled: the two travelers (teal and red, never named), the sphere outline, the graph lines (only a note), and the axes (bare numbers). Suggested: "left traveler" and "right traveler", "start", "the pole", the sphere outline named, a graph legend (curved surface: solid indigo; flat surface: dashed amber), axis titles ("Separation between the travelers (m)" and "Distance each traveler has walked (m)"), and the words "Curved surface" and "Flat surface" beside the line ends. The dashed guide paths stay.
- **What the drawings are (to be settled).** Each scene is a flat sketch of the two paths, with the sphere shown as an ellipse outline and the paths bending toward the pole. The specification asks for a top-down or exterior view. I cannot tell from the code how the sphere should be described to a learner (for example, "seen from outside, the two travelers set off side by side from the equator, heading toward the pole"). Question 4 asks.
- **The strength's name and meaning.** "Curvature strength" is explained only as "an exaggerated stand-in" (`:331-333`). The module's rule is radius = 10 m ÷ strength, so **a bigger strength means a smaller sphere**, which the page never says. Suggested: keep "Curvature strength" (the surface is already labelled "Curved surface"), and add "What 'curvature strength' means": a bigger number means a more sharply curved sphere, or a smaller one: strength 0.5 is a sphere of radius 20 m; strength 0.2, radius 50 m; no unit; a number between 0 and 1.
- **Introduction hints (C7, sharpened).** "What does that convergence actually mean?" states that the balls converged and asks about "that convergence", which tells the learner that curvature leads to convergence; the Why-even-ask paragraph asks whether "walking as straight as you possibly can" means the same on a flat floor, which hints that it does not. Suggested: "In Experiment 3 (tidal effects), two balls fell side by side. Now we step back from gravity and ask a question about surfaces: what happens to two travelers who both walk straight ahead?" and drop the quoted sentence. Add the Parts paragraph, the guess paragraph (guesses never change the pictures; they are drawn on the graph in white; strength does change the drawings) and a "Some new words" line.
- **Results (§12 and the 0.000 m).** Results prints "You predicted / What actually happened" for both surfaces (`:497-512`) and the tutor's compare step prints all four (`Tutor.tsx:55-56`). The sphere's final separation prints as "0.000 m" without saying why: the travelers have met at the pole. Suggested: keep the numbers (strength, the radius, the distance each walked, the two final separations, with "the two travelers meet at the pole" for the sphere), a guess tag on each final-separation line, and remove the pair; the tutor's compare step asks without stating.
- **A8, the outcome in the interface.** `actualOutcomeFor` and `labelFor` live in the component (`:33-39`) and the tutor imports them from it. They move into the module with tests, together with the marker data for each surface, the tutor's marking of both guesses, the axis top (1.2 m), the fixed distance axis, and the worked numbers.
- **Tutor.** The observe prompt says "Look at both graphs" (one graph is drawn). Needed: point to the two white marks by name. The explanation should open with "Your guesses, marked." Points 3 and 5 name "Experiment 3" without the chapter name (suggest "Experiment 3, tidal effects"). **Claims with no source check (reported, not changed unless you choose):** point 3 ("for the same reason: the spacetime they move through is curved") and point 5 ("a rocket's uniform acceleration moves through flat spacetime, and flat spacetime can never make dead-straight paths converge"). Both come from the approved specification and the sphere is named an analogy at the end (good); neither is linked to a page. The approved wording in point 4 ("gravity's pulling-together isn't a sideways force") is kept.
- **Honesty line (§8).** Both lines come from one formula: the flat line is exact geometry, and the sphere line is the exact closed form start × cos(distance ÷ radius) (specification decision 4, not a first-order approximation, unlike Gravity 3). The strength is an exaggerated stand-in with radius = 10 m ÷ strength. The sphere is an analogy with two space directions and no time, and this is stated in the intro. The "Where the real picture comes from" line says **measured: nothing; calculated here; imagined for the question** (the two travelers, a surface to walk on).
- **B1 to B3, recommendation.** The flat row compares a number with itself and the sphere row with its own formula: **no check-up table and no setting-following table**; plain results lines with guess tags only. (A check-up with "the same" and "less" readings is possible but would compare the formula with itself.) Question 8.
- **Shared code.** Nothing else imports this module or component (checked; only `App.tsx` does). No Gravity 5 risk this time.
- **Page width:** already 900 px. **Tutor colours:** fixed light colours as in earlier tutors; dark mode not checked. Reported, not changed.

## Updated size
**Medium.** One component, one tutor, one module and its test, the specification, `DEVELOPMENT-STATE.md`, the tracker.

## Questions for the owner before drafting
1. **Gaps:** fix all of the above (Parts layout, links, words box, Start over, two marks, captions, "Where the real picture comes from", tutor marking)? Suggested default: yes, all.
2. **Controls:** Part 1 fixed at strength 0.5, with the strength control in Part 2 (opening on 0.8)? Suggested default: yes.
3. **The marks:** two white marks, one at the end of each line, each with its own YOUR GUESS box and a direction arrow (down, none, up) that the caption says has no length, and the graph's vertical axis extended to 1.2 m? Suggested default: yes.
4. **Labels and what the drawings show:** "left traveler", "right traveler", "start", "the pole", the sphere outline named, and a note describing the sketch as seen from outside? Suggested default: yes; **please say how the sphere sketch should be described**, because I cannot tell from the code.
5. **The strength's meaning:** keep "Curvature strength", and say that a bigger number means a smaller, more sharply curved sphere (radius = 10 m ÷ strength), with no unit? Suggested default: yes.
6. **Introduction:** reword the question, drop the "walking as straight as you possibly can" hint, add the Parts paragraph, the guess paragraph and the "Some new words" line? Suggested default: yes.
7. **Tutor and Results:** observe points to the two white marks, compare asks without stating, the explanation marks both guesses; Results keeps the numbers with a guess tag on each, explains "0.000 m" (they meet at the pole) and loses the "You predicted / What actually happened" pairs? Suggested default: yes.
8. **Tables:** no check-up and no setting-following table? Suggested default: yes.
9. **Drawing A:** a fixed distance axis (0 to 80 m), the learner's sphere curve pink, the flat line light pink dashed, Part 1's sphere curve grey? Suggested default: yes.
10. **Honesty line:** "calculated here, not measured; the sphere is an analogy; strength is an exaggerated stand-in"? Suggested default: yes.
11. **Links:** search for plain official pages on geodesics or curved spacetime (held back until after the tutor), and reuse nothing else; link only what is read? Suggested default: yes.

## Not checked (re-read)
Not run in a browser; dark mode and narrow widths not looked at; no source page searched or fetched; the specification's "Expected Learner Understanding" and "Experiment Behavior" not compared line by line; the arithmetic above (radius 20 m, 31.4 m, 0.878 m) is by hand, not yet in a test.
