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
