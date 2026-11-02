# Gap report: Relativity of Time and Motion Experiment 8 (Drawing Spacetime)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/08-spacetime-diagrams.md | Components: src/components/Experiment8.tsx, Experiment8Tutor.tsx | Physics module: src/physics/spacetimeDiagramView.ts (+ .test.ts) over relativityOfSimultaneityExperiment.ts | Status: read-only, nothing changed

## Summary
One animated spacetime diagram (rod's two worldlines, two light rays, two event dots), one prediction, plain results, 3-step tutor. Older prediction rule. Biggest gaps: the diagram has no axis or line labels on the canvas, its caption is a single paragraph without a worked moment or three-part look-fors, there is no guess mark, no reading guide. Size: **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | On the diagram, which worldline will the light cross first? (Experiment8.tsx:350-366) | back / front / both at the same time; `predictionOrder` -> `submittedOrder` (:169-170) | The two event dots (lower dot = earlier); "same time" would be a horizontal marker through both |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | Diagram from `spacetimeDiagramFor(result)` (:190); `result` from `runSimultaneityExperiment` (:186); prediction read only in text/tutor (:457) | |
| A2 | Not met | `SpacetimeDiagram` (:87-159) draws no white mark | White dot/line at the guessed event's height with a "YOUR GUESS" box; for "same time" a white level line across both |
| A3 | Not met | n/a | Position follows the guess (earlier event lower); "both" is a marker, say so |
| A4 | Not met | Dots appear at `animTime >= event.time` (:155-156) | Mark only once the dots are drawn |
| A5 | N/A | Answer lives on the diagram | |
| A6 | Not met | Caption :398-406 has no source line | Add: calculated here from Experiments 5 and 6; nothing measured |
| A7 | Not met | "Guesses are not scored." (:283) only | New sentences in the introduction; controls note for the speed buttons (:303-344) |
| A8 | Not met | `spacetimeDiagramFor` gives events and worldlines; no guess-mark function | Add + tests |
| A9 | Partly met | Compare step (Experiment8Tutor.tsx, "You predicted ... Here is what the diagram actually shows") marks the guess before the explanation; observe step points to "the diagram" generally, not marks | Rewrite prompts to name the marks |
| A10 | Met (older rule) | "Guesses are not scored." (Experiment8.tsx:283); no statement that predictions do not change the pictures/tables | Wording is "not scored" only |

## Rule B
- B0: Results (:433-463): speed, lab length, lab-frame event times and gap, "Your prediction" (guess, actual).
- B1: Not met; the real reference is the same numbers as Experiment 7 (module test spacetimeDiagramView.test.ts:52 "marked events match times from runSimultaneityExperiment"). No external source exists; owner decides.
- B2: Not met. No notes.
- B3: N/A.
- B4: Partly met (:455-461): guess text and actual; no row tag.
- B5: Not met.

## Rule C
- C1: Not met. The canvas (:136-158) has no axis names ("position", "time"), no tick marks or unit, no labels on the blue/purple rod lines, dashed light lines or the origin dot. Only the event dots carry "0.xxx s" labels.
- C2: Met. Back = blue, front = purple (:150-153); speed changes the slopes.
- C3: Partly met. A single paragraph (:398-406) with no "How to read" heading.
- C4: Partly met. Names solid lines, dashed lines, origin dot and event dots; does not mention the colours, that the dot labels are times, the units (light-seconds, seconds), or the pictures' scale. Single dense paragraph, not bulleted.
- C5: Not met. No worked moment with real numbers.
- C6: Not met. No "what to look for" list.
- C7: Partly met. Caption says dots appear "where the light meets each end" and the intro (:252-263) says both rod lines "lean by the same amount"; nothing gives away the prediction directly.
- C8: Partly met. "Worldline" and "event" are defined (:243-250); "light-second" is not defined in this experiment (defined in Experiments 4 to 6 only); results use "light-seconds" (:440).

## Other findings
- O1: The specification header says the owner's line-by-line wording approval "was explicitly skipped, not granted" (08-spacetime-diagrams.md:5); CLAUDE.md says wording approved 2026-10-13. Spec header looks stale; report only.
- O2: `onComplete` fires when START is pressed (:187), before the animation ends, and the Results and tutor appear at once while the diagram is still drawing (:423-472), so the learner can read the answer before the dots appear (a §12 timing concern). Experiment 9 gates on `lineRevealed`; this one does not. Also `pointAt` (:29-37) interpolates in the component (minor §9 point).

## What an update would touch, and its size
Experiment8.tsx, Experiment8Tutor.tsx, spacetimeDiagramView.ts and .test.ts, the specification. **Medium**.

## Not checked
Rendering, narrow widths, the animation timing; no external source needed (it re-draws Experiment 7's numbers).
