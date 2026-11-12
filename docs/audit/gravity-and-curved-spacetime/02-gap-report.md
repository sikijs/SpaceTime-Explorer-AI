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

---

# Re-read, 2026-11-12: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `GravitationalTimeDilationExperiment.tsx` (431 lines), `GravitationalTimeDilationTutor.tsx` (217), `gravitationalTimeDilationExperiment.ts` (38) and the specification `02-gravitational-time-dilation.md`. Nothing changed. Rules A to C above stand as written; this section adds what they did not cover and carries over what the Gravity 1 audit settled.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds everything in one column: introduction, strength buttons, prediction, the two clocks, the graph, the run button, then Results and the tutor (`:214-430`) | Part 1 (prediction, "Start the clocks", the clocks and the graph), Part 2 (strength choice and a drawing that follows it), Part 3 (results), Part 4 (tutor). |
| E2, E4 | Not met | No Part headings, lines or leads | Four leads in the shared colours, drafted for approval. Part 1's lead gives no answer (§12). |
| E3 | Not met | No links list, no words box | See "Links and Words" below. |

## Parts 2 to 4 appear after the first Run
**Partly met.** Results and tutor appear when the run completes (`isComplete`, `:360, :412`). The strength control is visible from the start (`:255-319`). Under the Parts layout it moves into Part 2 and appears after the first run, with a note saying what to do next. Part 1 would be fixed at strength 0.3 (the preset the page opens on).

## Links and Words
- **"Want to know more?" list: Not met. Not searched or read yet.** The page uses no measured result (both lines are calculated from `1 / (1 − strength)`), so no paper is needed for the page itself. The tutor says GPS satellites correct for this effect; that claim has no source in the specification. A plain official page on GPS and relativity (for example from NASA or the GPS programme) is a candidate for the list and for that claim, **only once fetched and read** (§29 rule 3(c)). I have looked up nothing and quote no number from outside.
- **"Words and formulas" box: Not met.** Terms on the page: tick, strength, frequency ratio, rocket cabin, floor clock, ceiling clock, ticks per floor tick, redshift (defined in the tutor), gravitational time dilation (tutor, after the run), first-order. Formulas the module uses, with the page's own numbers: ceiling ticks = floor ticks ÷ (1 − strength), for example 10 ÷ (1 − 0.3) = 14.29 at strength 0.3; ratio = 1 − strength = 0.70.

## Start over, not Change prediction
**Not met.** The only reset is "Run Again", the same button as "Start the clocks" after a run (`:355-357`). There is no reset on the first screen. Needed: an always-visible "Start over", greyed until a guess or run exists and while running; a line saying the guess is locked after Run; "Run Again" removed. (The older code also clears the guess on Run, `:170`, which the locked-guess rule replaces.)

## Items the re-read changes or sharpens
- **A2 to A5, the guess has no size.** "The same rate" / "Different rates" is a yes or no, so the mark is a marker only and the caption says so. Suggested: a white ring around the two line ends at 10 s, joined to a white box "YOUR GUESS (a marker only): the same rate" (or "different rates"). The ring sits in the same place for either guess, so it does not reveal the answer. Drawn only once both lines are drawn (A4).
- **Contrast (§14).** The point of this experiment is a contrast, and the graph already shows it (solid indigo floor line, dashed amber ceiling line, rising at different rates). The strength control changes the gap, so the contrast follows the control. Needed: on-canvas labels "Floor clock" and "Ceiling clock" at the line ends, axis titles ("ticks counted", "time on the floor clock, s"), and a legend. The two clocks panel (`RocketCabinClocks`) is two text boxes, with no cabin drawn.
- **Shared component.** `RocketCabinClocks`, `RUN_DURATION_FLOOR_SECONDS` and the module are used by `SpacetimeCurvatureSourceExperiment.tsx` (Gravity 5). Any change to them must keep Gravity 5 working; the audit would change them only by adding optional props, or leave them as they are and add the labels around them.
- **A8, outcome in the interface.** `actualOutcome()` is hard-coded in the component (`:33-35`). It moves into the module with a test. The module also needs: the marker's position (the two line ends), the "ticks per floor tick" value now computed in the tutor (`Tutor.tsx:112`), and the tutor's marking of the guess.
- **§12, results and tutor give the verdict early.** The Results block says "You predicted / What actually happened" side by side, then states gravitational time dilation and GPS (`:393-417`). The tutor's compare step also states the outcome (`Tutor.tsx:57-58`). The 2026-10-24 rule says the tutor marks each guess in its explanation and nowhere earlier. Suggested: Results keep the plain numbers (strength, ticks, ratio) with a small guess tag, and drop the "What actually happened" line and the two explanation sentences, which the tutor's explanation already covers. The observe step points to the graph and the white marker, the compare step asks what the learner sees without stating it, and the explanation marks the guess.
- **Introduction.** "Why even ask this" frames height as normally irrelevant, a mild lead-in to the answer. Suggested: keep the kitchen-counter-and-shelf picture but drop "height seems completely irrelevant to timekeeping", and add: what a "tick" is, the Parts explained first, and the A7 sentences (guesses never change the pictures or tables; they are drawn on the graph in white; the strength choice does change the drawings). "Experiment 1" is named in the intro and the tutor; Gravity 1 is "Experiment 1" in the same group, so this is fine, but the tutor's "Experiment 4" (`:191`) is ambiguous. Suggested: "the time dilation of Relativity Experiment 3 or 4", checked against the learner numbering.
- **Honesty line (§8).** Both lines come from one formula, so the difference is built in. The "Where the real picture comes from" line says: **calculated here**, from `1 / (1 − strength)`, with a strength exaggerated far beyond anything real; **not measured**. The tutor's "exactly that ratio" (`:113-115`) sits beside the intro's "first-order version", so the wording would be "that ratio in this simplified model".
- **Worked example in the tutor.** The 1.09×10⁻¹⁵ s is g·h/c² = 9.8 × 10 ÷ c² worked by hand (it checks out arithmetically, but the "cabin speed is zero" step is loose and the number is not from the module). Suggested: compute it in the module with a test, and say "about" in the wording. Not changed unless you choose.
- **"Everyone agrees" in the tutor** (`:198-204`) is a physics claim that the specification supports (point 2 of its explanation) but does not cover in the words used. Reported, not changed.
- **B1 to B3, recommendation.** No outside number exists for a check-up (the ratio is compared with its own formula), and the control only moves the lines. Recommend **no check-up table and no setting-following table**; plain results lines and a guess tag only.
- **Page width:** already 900 px. **Tutor colours:** fixed light colours as in earlier tutors; dark mode not checked. Reported, not changed.

## Updated size
**Medium** (unchanged). Files: the component, the tutor, the module and its test, the specification, `DEVELOPMENT-STATE.md`, the tracker. Gravity 5 re-checked.

## Questions for the owner before drafting
1. **Gaps:** fix all of the above (Parts layout, links, words box, Start over, marker, caption, "Where the real picture comes from", tutor marking)? Suggested default: yes, all.
2. **Strength:** Part 1 fixed at 0.3, with the choice (0.1, 0.3, 0.6, Other) in Part 2? Suggested default: yes.
3. **The marker:** a white ring around the two line ends for either guess, joined to a white "YOUR GUESS (a marker only)" box? Suggested default: yes.
4. **Clock panel:** keep the two text boxes (add only on-canvas labels, axis titles and a legend to the graph), or draw a small rocket cabin with the two clocks inside? Suggested default: labels only; the shared panel stays untouched for Gravity 5.
5. **Tutor marking:** observe points at the graph and the white marker, compare asks without stating, the explanation marks the guess? Suggested default: yes.
6. **Results:** drop "What actually happened" and the two explanation sentences (GPS, "gravitational time dilation") from Results, leaving plain numbers and a guess tag? Suggested default: yes.
7. **Introduction:** drop "height seems completely irrelevant" and add the Parts and the A7 sentences? Suggested default: yes.
8. **Reading guide:** no check-up or setting-following table? Suggested default: yes.
9. **Honesty line and tutor wording:** "calculated here, not measured, built into one formula", and "in this simplified model" for the ratio? Suggested default: yes.
10. **GPS claim:** search for and read a plain official page on GPS and relativity for the links list, and link it only if found and read? Suggested default: yes; otherwise §29 rule 3(c) applies.
11. **Worked example:** compute the 1.09×10⁻¹⁵ s in the module with a test, keeping the wording? Suggested default: yes.

## Not checked (re-read)
Not run in a browser; dark mode and narrow widths not looked at; no source page searched or fetched; Gravity 5's use of the shared pieces not yet run.
