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

---

# Re-read, 2026-11-12: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `TidalEffectExperiment.tsx` (592 lines), `TidalEffectTutor.tsx` (132), `tidalEffectExperiment.ts` (85) and the specification `03-tidal-effects.md`. Nothing changed. Rules A to C above stand as written; this section adds what they did not cover and carries over what the Gravity 1 and 2 audits settled.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds everything in one column: introduction, acceleration buttons, strength buttons, both predictions, the two cabins, the graph, the run button, then Results and the tutor (`:315-591`) | Part 1 (the two predictions, "Drop the balls", the cabins and the graph), Part 2 (the two controls and a drawing that follows them), Part 3 (results), Part 4 (tutor). |
| E2, E4 | Not met | No Part headings, lines or leads | Four leads in the shared colours, drafted for approval. Part 1's lead gives no answer (§12). |
| E3 | Not met | No links list, no words box | See "Links and Words" below. |

## Parts 2 to 4 appear after the first Run
**Partly met.** Results and tutor appear when the run completes (`isComplete`, `:524, :581`). Both controls are visible from the start (`:358-460`). Under the Parts layout they move into Part 2 and appear after the first run, with a note saying what to do next. Part 1 would be fixed at 1g and strength 0.3, the presets the page opens on.

## Links and Words
- **"Want to know more?" list: Not met. Not searched or read yet.** The page uses no measured result (both lines are calculated), so there is no paper for the page itself. The background ideas are g (a page was read for Gravity 1: NASA Glenn, "Free Fall without Air Resistance", 2026-11-11, which could be reused if it is neutral here) and the tidal effect, which the tutor names only after the run, so a plain official page on tides (for example from NOAA or NASA) would be held back until after the tutor. I have not searched for it, and nothing is linked until it is read (§29 rule 3(c)).
- **"Words and formulas" box: Not met.** Terms on the page: sealed cabin, acceleration, g, separation, graph, strength (called "convergence strength" now), first-order, the planet's centre, and "tidal effect" (listed as "the name for what the tutor explains after your run", as in Gravity 2). Formulas the module uses, with the page's own numbers: separation at time t = start separation × (1 − strength × (t ÷ fall time)²), for example at 1g and 0.3, halfway through the fall: 1 × (1 − 0.3 × 0.25) = 0.925 m, and at the end 1 × (1 − 0.3) = 0.700 m; time to the floor = √(2 × height ÷ acceleration) = 0.64 s at 1g. Rocket cabin: separation stays 1 m.

## Start over, not Change prediction
**Not met.** The only reset is "Run Again", the same button as "Drop the balls" after a run (`:517-519`); it also clears both guesses (`:277-278`) and is not there on the first screen. Needed: an always-visible "Start over", greyed until a guess or run exists and while running; a line saying both guesses are locked after Run; "Run Again" removed.

## Items the re-read changes or sharpens
- **Two predictions, three answers each.** "They'll drift together" / "stay the same distance apart" / "drift apart", once for the planet cabin and once for the rocket cabin. Under the newer rule the guess is drawn on the graph where its answer lives: the end of each line. A three-way guess has a direction but no size ("together" has no value), so each mark is a marker with an arrow showing the direction guessed (down for together, none for the same, up for apart), and the caption says the arrow has no length of its own. Suggested: **two white marks**, one at the end of the planet line and one at the end of the rocket line, each joined to its own white box ("YOUR GUESS, planet cabin (a marker only): ..." and "YOUR GUESS, rocket cabin (a marker only): ..."), drawn once the lines are drawn (A4).
- **Room for "drift apart".** The graph's vertical axis runs from 0 to the start separation (1 m), so a guess of "apart" has nowhere to point. Suggested: extend the axis to 1.2 m (a change of scale, not of any number), with a dotted line at the 1 m start.
- **Contrast (§14).** The point is a contrast: planet line bends down, rocket line stays flat. The graph shows it (solid indigo against dashed amber). Needed on the canvas: legend, axis titles ("Separation between the balls (m)", "Time since release (s)"), line-end labels. The two cabins show "Separation: 1.000 m" under them, and the balls are teal and red but never named. Suggested: "left ball" and "right ball", "floor", and the same arrows as Gravity 1 (green "Gravity pulls the balls down" for the planet cabin, red "A rocket pushes the cabin up" for the rocket cabin).
- **Do not draw the convergence itself.** The planet's pull toward its centre (arrows slanting inward) would show the answer before the learner has predicted (§12). Suggested: the arrows point straight down and up only, and the tutor explains the converging pull. Part of C1 (the planet's pull is not drawn) is therefore left as it is, by design.
- **The control's name gives the answer away.** "Convergence strength" says the balls converge, before the prediction. Suggested: call it "Strength" on the page (as Gravity 2 does), with its explanation (how big the cabin is compared with the planet) in the introduction, and keep the module's name. Needs the owner's decision (the specification uses "convergence strength").
- **Initial drawings (O2b).** Before a run, both cabins are drawn with a hard-coded strength 0.3, whatever the strength button says. With Part 1 fixed at 0.3 this is true in Part 1; in Part 2 the cabins would follow the selected strength.
- **A shared component.** `Cabin`, `INITIAL_HEIGHT_METERS` and `INITIAL_SEPARATION_METERS` are used by `SpacetimeCurvatureSourceExperiment.tsx` (Gravity 5). Any change adds optional props or wraps the cabin, and Gravity 5 is re-checked.
- **A8, the outcome and the numbers in the interface.** `actualOutcomeFor()`, a second `separationAt()` and the tutor's `finalSeparationMeters` are component arithmetic. They move into the module with tests; the module also needs the marker data for each scene, the tutor's marking of both guesses, the axis top (1.2 m) and the fixed time scale (2.1 s, as in Gravity 1, whose function can be reused), plus the worked numbers.
- **§12, results and tutor give the verdict early.** Results prints "You predicted / What actually happened" for both cabins and then explains the cause and names the "tidal effect" (`:552-576`); the tutor's compare step prints all four (`Tutor.tsx:59`). Suggested, as in Gravity 1 and 2: Results keep the plain numbers (acceleration, strength, the two final separations) with a guess tag on each, and lose the pair and the two explanation paragraphs; the observe step points to the two white marks, the compare step asks without stating, and the explanation marks both guesses and names the tidal effect. "Tidal effect" is then named only in the tutor.
- **Introduction hints (C7, sharpened).** "Does that stay true no matter how big the cabin is?" and "Why even ask this ... 'idealized and small' was quietly doing a lot of work" tell the learner that size matters, which is the finding. Suggested: ask "In Experiment 1, one ball behaved the same way in both cabins. Does the same hold for two balls dropped side by side?" and drop the quoted sentence. Add the Parts paragraph, the A7 sentences (guesses never change the pictures; they are drawn on the graph in white; the controls do change the drawings), a "What we assume" line for the exaggerated strength (kept) and the "Some new words" line.
- **Controls make a different picture.** The time axis currently stretches to each fall time, so acceleration changes only an end label. Suggested for Part 2's Drawing A (as in Gravity 1): a fixed 0 to 2.1 s time scale, the learner's planet line in pink, the rocket line in light pink (dashed), Part 1's planet line in grey, so both controls give a visible change (acceleration shortens the line, strength lowers its end).
- **Honesty line (§8).** Both lines come from one formula, and the strength is an exaggerated stand-in with a first-order approximation. The rocket's "unchanged" is built in. The "Where the real picture comes from" line says **calculated here**, **not measured**, **imagined for the question**, and does not quote a real tidal size (the specification does not give one).
- **Tutor claims.** "The centre is in a very slightly different direction from each ball's own position" (`Tutor.tsx:106-108`) and the mention of ocean tides (`:125-126`, trimmed to one sentence at an earlier review) have no source check; "Experiment 1" and "Experiment 4" lack the chapter name (suggest "the equivalence-principle experiment (Experiment 1)"). Reported; only the first is changed if you choose.
- **B1 to B3, recommendation.** Every number in the planet row comes from one formula with an exaggerated strength; "the same as the start" for the rocket row compares a number with itself. Recommend **no check-up table and no setting-following table**; plain results lines and guess tags only.
- **Page width:** already 900 px. **Tutor colours:** fixed light colours as in earlier tutors; dark mode not checked. Reported, not changed.

## Updated size
**Medium, near Large** (two predictions, two marks, two controls, a drawing for each). Files: the component, the tutor, the module and its test, the specification, `DEVELOPMENT-STATE.md`, the tracker. Gravity 5 re-checked.

## Questions for the owner before drafting
1. **Gaps:** fix all of the above (Parts layout, links, words box, Start over, two marks, captions, "Where the real picture comes from", tutor marking)? Suggested default: yes, all.
2. **Controls:** Part 1 fixed at 1g and strength 0.3, with both controls in Part 2 (opening on 2g and 0.6)? Suggested default: yes.
3. **The marks:** two white marks, one at the end of each line, each with its own YOUR GUESS box and a direction arrow (down, none, up) that the caption says has no length, and the graph's vertical axis extended to 1.2 m? Suggested default: yes.
4. **Cabin labels:** "left ball", "right ball", "floor" and the Gravity 1 arrows (green down for the planet, red up for the rocket), with no inward-slanting pull drawn? Suggested default: yes.
5. **The control's name:** "Strength" on the page, in place of "Convergence strength"? Suggested default: yes.
6. **Introduction:** reword the question, drop the "quietly doing a lot of work" sentence, add the Parts paragraph, the guess paragraph and the "Some new words" line? Suggested default: yes.
7. **Tutor marking:** observe points to the two white marks, compare asks without stating, the explanation marks both guesses and is the first place "tidal effect" is named (it leaves Results)? Suggested default: yes.
8. **Results:** a guess tag on each final-separation line, the "You predicted / What actually happened" pairs and the two explanation paragraphs removed, no tables? Suggested default: yes.
9. **Drawing A:** a fixed 0 to 2.1 s time scale, the learner's planet line pink, the rocket line light pink, Part 1's planet line grey? Suggested default: yes.
10. **Honesty line:** "calculated here, not measured, built into one formula, strength exaggerated"? Suggested default: yes.
11. **Links:** reuse the NASA Glenn free-fall page up front if it is neutral here, and search for a plain official page on tides (held back until after the tutor), linking only what is read? Suggested default: yes.

## Not checked (re-read)
Not run in a browser; dark mode and narrow widths not looked at; no source page searched or fetched; Gravity 5's use of `Cabin` not run; the specification's decisions on "convergence strength" and ocean tides not re-read in full.
