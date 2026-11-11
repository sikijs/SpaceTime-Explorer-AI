# Gap report: Gravity and Curved Spacetime Experiment 1 (The equivalence principle)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/01-equivalence-principle.md | Components: src/components/EquivalencePrincipleExperiment.tsx, EquivalencePrincipleTutor.tsx | Physics module: src/physics/equivalencePrincipleExperiment.ts (+ .test.ts, 16 cases) | Status: read-only, nothing changed

## Summary
One prediction (same or different), one acceleration control, two cabins and one graph, a four-line Results block and a three-question tutor. Under the older rule guesses appear only as text. Biggest gaps: no "How to read this diagram" caption (only a one-line note under the graph), no check-up/"What this table tells us" notes, no guess mark, no "where the picture comes from" line, tutor reveals the outcome at its "compare" step before the explanation. Size: **M** (Rule A marks on one picture need new module functions; Rule B/C are mostly wording). The experiment is small, so no Large work.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Would the ball move differently in the two cabins, or the same way? (`EquivalencePrincipleExperiment.tsx:350-353`) | Buttons "Differently" / "The same way" (`:18-21`); stored in `predictionChoice`, copied to `submittedPrediction` on Run (`:174-175, :194-195`) | Graph "Ball height above the floor, over time" (`:90-168`): whether Cabin A's and Cabin B's curves coincide. A yes/no guess has no size, so a marker would be needed. |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | One prediction. |
| A1 | Met | `:193` result computed from `selectedG` only; no real value reads `predictionChoice` | none |
| A2 | Not met | graph `:119-168` has no white mark or "YOUR GUESS" box | Add white marker + YOUR GUESS box on the graph where the two curves are compared. |
| A3 | Not met | no mark exists | Yes/no guess: a marker only, with the caption saying so. |
| A4 | Not met | no mark exists | Draw the marker only once the second (dashed) curve is drawn (`:146-147`). |
| A5 | N/A | the answer already has a picture (the graph) | none |
| A6 | Not met | no "Where the real picture comes from" line; only the note at `:164-166` | Add: calculated here from one formula (`ballHeightAboveFloorAt`), not measured. Note that both curves come from the same call (comment `:83-86`). |
| A7 | Not met | Intro `:240-275` says nothing about predictions or the pictures not changing; no note beside the control `:277-344` | Add intro sentence and a control note (the acceleration changes the drawings; guesses do not). |
| A8 | Not met | Module exports only `EARTH_GRAVITY`, `runEquivalencePrincipleExperiment`, `ballHeightAboveFloorAt` (`equivalencePrincipleExperiment.ts:4,15,36`). `actualOutcome()` is hard-coded `'sameWay'` in the component (`:25-27`), not in the module. | Move the outcome into the module with a test; add guess-marker data function and tests. |
| A9 | Partly met | Tutor "compare" step names the prediction and states the outcome (`EquivalencePrincipleTutor.tsx:53-54`), before the explanation; observe prompt says "the two graphs" (`:52`) though there is one graph with two curves | Marks cannot be named (none exist). Moving the verdict to the explanation step is a design decision for the owner. |
| A10 | Not met (no statement) | grep for "do not change"/"never change" in the component finds only code comments. Results line "You predicted ... What actually happened" (`:431-435`) is the older text-beside-results | Older-rule sentence is absent; the intro does not say predictions never change the results. Report as current state. |

## Rule B
- B0. Results block `:414-445`: acceleration and time-to-floor lines, a "You predicted / What actually happened" pair, and one closing sentence. No tables.
- B1. Not met. A real reference does not exist as a number; the finding is "the same" in both cabins (the specification's expectation). A check-up row "time to floor, Cabin A vs Cabin B: the same" would fit the "the same/more/less" wording, no invented cut-off.
- B2. Not met: no "What this table tells us" note.
- B3. N/A: the controls only change the drawing's timing; a settings table would tell the learner nothing the graph does not.
- B4. Partly met: the guess is shown beside the result as text (`:431`), with the outcome right under it (`:433-436`), which is a "right/wrong" juxtaposition the newer rule reserves for the tutor. No tag on a table row.
- B5. Not met: no comparison numbers from the module (the "same" claim is text; `timeToFloorSeconds` is from the module).

## Rule C
- C1. Partly met: "Cabin A"/"Cabin B" labelled (`:41-47`); the ball, floor and graph curves are unlabelled on the canvas (legend is only the sentence at `:165`); axis labels are bare numbers (`:151-162`). Cabin A/B being gravity vs rocket is deliberately withheld (`:38-40`).
- C2. Met: the two cabins are deliberately identical (the point is the lack of contrast); the control changes timing and the end time label.
- C3. Not met: no "How to read this diagram" caption under the cabins or the graph.
- C4. Not met: only the one-line note at `:164-166`. No list of elements, no units (m, s, g defined only in the intro/control: "g" is never defined in plain words, `:283-298`).
- C5. Not met: no worked moment with numbers.
- C6. Not met: no look-for list.
- C7. Met: nothing in the intro or note reveals the answer (`:240-275`).
- C8. Partly met: "g" and "acceleration" used at `:279-297` without a definition; "equivalence principle" is first named in the tutor explanation (fine, after the run).

## Other findings
- O1. None found against the specification (not compared line by line).
- O2. The intro's "A daily-life picture" paragraph says a forward-accelerating car "would feel exactly like a weak sideways gravity" (`:249-252`); this is the idea the experiment tests, close to a hint at Prediction 1 (§12). The page says the cabin B rocket is "pushing the cabin forward" (`:259-260`) while the ball falls "to the floor"; direction of acceleration vs "forward" is not explained. Tutor's observe prompt "two graphs" is wrong (one graph). Final tutor point 1 says "exactly the same ... because the calculation itself never had a way to know" (`:99-110`), which is a statement about the model, not the physics; the owner may want it reviewed.

## What an update would touch, and its size (O3, O4)
EquivalencePrincipleExperiment.tsx (graph mark, caption, intro, control note, results), EquivalencePrincipleTutor.tsx, physics module + test (outcome, marker data), specification. **Size: M.**

## Not checked
Not run in a browser; spec not compared line by line; no sources/links list exists (Rule D applies only to Cosmic Horizons).

---

# Re-read, 2026-11-11: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `EquivalencePrincipleExperiment.tsx` (454 lines), `EquivalencePrincipleTutor.tsx` (128), `equivalencePrincipleExperiment.ts` (48) and the specification `01-equivalence-principle.md`. Nothing changed. Rules A to C above stand as written; this section adds what they did not cover and settles what the Relativity audit has since decided.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds everything in a single column: introduction, acceleration buttons, prediction, the two cabins, the graph, the run button, then Results and the tutor (`:237-452`) | Part 1 (prediction, "Drop the ball", the cabins and the graph), Part 2 (acceleration choice and a drawing that follows it), Part 3 (results), Part 4 (tutor). |
| E2 | Not met | No Part headings, coloured lines or leads | Four leads in the shared colours, drafted for approval. |
| E3 | Partly met | The introduction is above the controls (`:240-275`); there is no links list and no words box | See "Links and Words" below. |
| E4 | Not met | No leads exist | Drafted with the leads; Part 1's lead must not give the answer (§12). |
| E5 | N/A | One experiment, one group of four Parts | |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
**Partly met.** The Results and the tutor render only once the ball has landed (`isComplete`, `:413, :448`). The acceleration control is visible from the start, above the prediction (`:277-344`). Under the Parts layout it moves into Part 2 and appears after the first run, with a visible note saying what to do next. Part 1 would be fixed at 1g (the preset the page opens on).

## Links and Words (2026-11-07 rule)
- **"Want to know more?" list: Not met.** None exists (the Rule D note above is out of date: the 2026-11-07 rule applies to every group). **Not searched or read yet.** The search and the fetch belong to the draft step, and nothing is linked until it has been read (§29 rule 3(c)). The page uses no measured result (both curves are calculated), so there is no paper to cite for the page itself. A real test of the idea exists (for example the MICROSCOPE satellite and the earlier torsion-balance tests); it is a candidate for a "Want to know more?" link and a "Where the real picture comes from" line only if an official page is found and read. **I have not looked it up, and no number is quoted here.**
- **"Words and formulas" box: Not met.** None exists. Terms on the page: sealed cabin, acceleration, g, metres per second squared, height above the floor, elapsed time, graph (curve). Two formulas the module uses, with the page's own worked example: height at time t = start height − ½ × acceleration × t², and time to the floor = √(2 × height ÷ acceleration), for example √(2 × 2 m ÷ 9.8 m/s²) = 0.64 s at 1g. "Equivalence principle" is the chapter's title, so it is listed, with a one-line plain meaning that does not say what the experiment shows.

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** The only reset is "Run Again", which is the same button as "Drop the ball" after a run (`:405-411`), so no reset exists on the first screen and it is not greyed out. There is no "Change prediction" button. Needed: an always-visible "Start over", greyed until a guess or a run exists and while the ball is falling; a line saying the guess is locked once the ball is dropped; and "Run Again" removed.

## Rule A to C: items the re-read changes or sharpens
- **The control is both the setup and the control** (as in Relativity 1 to 11). The learner picks the acceleration before guessing. Under the Parts layout Part 1 is fixed at 1g with the guess and one drop; Part 2 offers 0.5g, 1g, 2g and "Other" (0.1g to 5g) and runs it.
- **A2 to A5, the guess has no size.** "Differently" or "The same way" is a yes or no, so the mark is a marker only, and the caption says so. The two curves lie where the real answer lives. Suggested mark: a white ring around the end of the curves, joined by a line to a white box "YOUR GUESS (a marker only): the same way" (or "differently"), drawn once the dashed curve has been drawn (A4). The ring sits in the same place for either guess, so it does not reveal the answer.
- **Where is the contrast (§14, drawings, item 2)?** Here the point is that there is **no** contrast: the two curves coincide. The solid and dashed curves are visibly different styles, so the learner can see two lines were drawn and that they lie on top of each other. That is already in the page and stays. Nothing more is needed unless the owner wants a version of the picture where a difference would be visible if there were one (not suggested: it would be a second calculation that the specification does not define).
- **C1, labelling.** The specification deliberately leaves the cabins as only "Cabin A" and "Cabin B" so that the picture does not give away that they are the same (`:38-40`). The introduction already says which is which. Needed on the canvas: "ball", "floor", a legend for the solid and dashed curves, axis titles in words ("height above the floor, m", "time since release, s"). **The rocket and the planet are not drawn at all; the cabins are plain boxes.** Whether to draw them is the owner's decision (below).
- **A9, the verdict before the explanation (O1 in the first report, still open).** The tutor's compare step states the outcome (`EquivalencePrincipleTutor.tsx:53-54`) before the explanation. The 2026-10-24 rule says the tutor marks each guess in its explanation and nowhere earlier. Suggested: the observe step points to the graph and the white marker by name, the compare step asks the learner to say what they see without stating it, and the explanation marks the guess.
- **Observe prompt:** "Look at the two graphs" is wrong (there is one graph with two curves). Reword.
- **§12 and the introduction's car picture.** The "daily-life picture" says the push "would feel exactly like a weak sideways gravity". That is the idea the experiment tests, and a learner can answer the prediction from it. Suggested: keep the car, drop the last claim, and let the tutor say it.
- **The result is built in, and the page should say so (scientific honesty, §8).** Both curves come from one formula (`ballHeightAboveFloorAt`), so they agree by construction. The tutor's explanation point 1 already says "the exact same math", but the Results do not. The "Where the real picture comes from" line must say: **calculated here**, from one formula; **not measured**; the agreement is built into the model, and whether real objects behave this way is a question for experiments, which the "Want to know more?" list can point to once a page has been read. Nothing is added about real experiments from memory.
- **A8, the outcome in the interface.** `actualOutcome()` is hard-coded in the component (`:25-27`). It moves into the module with a test. The module also needs: the marker's position (end of the curves) and the tutor's marking of the guess.
- **B1 to B3, recommendation.** No outside number exists for a check-up. A check-up row "time to the floor, Cabin A against Cabin B: the same" would compare a number with itself, because both come from one call. Recommend **no check-up table and no setting-following table**; keep the plain results lines, drop the "You predicted / What actually happened" pair (the older text-beside-results, which puts guess and verdict side by side before the tutor), and show the guess only as a tag beside the "time to the floor" line.
- **Page width:** already 900 px (`:237`). **Tutor colours:** fixed light colours (`#f0f7ff`, `#d9e8f5`, `#333`) as in the earlier tutors; not checked in dark mode. Reported, not changed.

## Updated size
**Medium** (unchanged). The Parts layout, the words box, the links list (search and fetch needed), Start over, a marker on the graph with its caption and "Where the real picture comes from" line, leads, tutor wording, the specification update, and tested module functions (the outcome, the marker, the marking). Files: `EquivalencePrincipleExperiment.tsx`, `EquivalencePrincipleTutor.tsx`, `equivalencePrincipleExperiment.ts` and its test, the specification, `DEVELOPMENT-STATE.md`, and the tracker.

## Questions for the owner before drafting
1. **Gaps:** fix all of the above (the Parts layout, links, words box, Start over, the marker, caption, "Where the real picture comes from", tutor marking)? Suggested default: yes, all.
2. **Acceleration:** Part 1 fixed at 1g, with the choice (0.5g, 1g, 2g, Other) in Part 2? Suggested default: yes.
3. **The marker:** a white ring around the end of the two curves for either guess, joined to a white "YOUR GUESS (a marker only)" box? Suggested default: yes.
4. **Cabins:** keep them as plain "Cabin A" and "Cabin B" boxes with the introduction saying which is which, and add only "ball", "floor", the curve legend and axis titles? Or draw a planet under Cabin A and a rocket under Cabin B? Suggested default: add the labels only; do not draw the planet or rocket (the specification keeps the cabins unlabelled so that nothing is given away).
5. **Tutor marking:** the observe step points at the graph and the white marker, the compare step asks without stating, and the explanation marks the guess? Suggested default: yes (and the specification's tutor section updated to say so).
6. **Introduction:** keep the car picture but drop "would feel exactly like a weak sideways gravity"? Suggested default: yes.
7. **Reading guide:** no check-up or setting-following table; only the guess tag on the time-to-the-floor line, and the "You predicted / What actually happened" pair removed from the Results? Suggested default: yes.
8. **Honesty line:** the "Where the real picture comes from" line says the agreement is built into one formula and is not a measurement? Suggested default: yes.

## Not checked (re-read)
The page was not run in a browser; dark mode and narrow widths were not looked at; no source page was searched or fetched for the links list, and nothing about a real equivalence-principle test was looked up.
