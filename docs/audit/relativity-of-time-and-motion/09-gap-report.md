# Gap report: Relativity of Time and Motion Experiment 9 (Same Time, Different Line)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/09-same-time-different-line.md | Components: src/components/Experiment9.tsx, Experiment9Tutor.tsx | Physics module: src/physics/spacetimeDiagramView.ts (`sameMomentLineFor`, + .test.ts) | Status: read-only, nothing changed

## Summary
Experiment 8's diagram plus one magenta "same moment" line revealed after the animation. One prediction (flat or tilted), plain results, 3-step tutor. Older rule. Biggest gaps: no on-canvas labels, short caption without worked moment or three-part look-fors, no guess mark, no reading guide. Size: **Small to Medium** (the guess is a line shape, so the mark is easy to draw; module helper and caption work needed). Rated **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Will the line through the two dots be flat or tilted? (Experiment9.tsx:339-355) | flat / tilted; `predictionShape` -> `submittedShape` (:162-163) | The magenta line through the two event dots (:151 `showSameMomentLine`) |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | Diagram and line from `result` (:187,:189); the guess is read only in text (:446) | |
| A2 | Not met | `SpacetimeDiagram` (:92-155) has no white mark | A white line (flat, or tilted at an example slope) through/near the dots with a "YOUR GUESS" box, beside the real magenta line |
| A3 | Not met | n/a | A "tilted" guess has no size; draw a marker at a fixed example slope and say so in the caption |
| A4 | Not met | The real line appears when `lineRevealed` (:190,:393) | Guess mark only after the dots are drawn (can appear with the line) |
| A5 | N/A | Answer lives on the diagram | |
| A6 | Not met | Caption (:386-392) has no source line | Add "calculated here from Experiment 7" |
| A7 | Not met | Introduction (:331-336) has no sentence about predictions | Needs the new sentences and a speed-control note (:300-332) |
| A8 | Not met | `sameMomentLineFor` (spacetimeDiagramView.ts) returns the real two points; no guess-mark function | Add + tests |
| A9 | Partly met | Observe step points to "the new magenta line" (Experiment9Tutor.tsx) by name; compare step states the guess and the actual shape before the explanation | Tutor should point to the white mark and mark the guess in the explanation only |
| A10 | Not met | No sentence in this experiment says predictions do not change the pictures/tables or "not scored" (grep of Experiment9.tsx and its tutor) | Record as current state; the older rule's sentence is absent here |

## Rule B
- B0: Results (:419-451), shown after `lineRevealed`: speed, lab length, lab-frame event times, "Your prediction" (guess; actual shape). No gap line.
- B1: Not met. Real reference: the line's slope equals v (test spacetimeDiagramView.test.ts:108). Internal only; owner decides if a check-up applies.
- B2: Not met. No notes.
- B3: N/A.
- B4: Partly met (:442-449) text only.
- B5: Not met.

## Rule C
- C1: Not met. No axis names, units, origin label, or labels on the rod lines, light lines or magenta line; only dot time labels (:121-134).
- C2: Met. Blue/purple/magenta are distinct and the line shape changes with speed.
- C3: Partly met. A single paragraph (:386-392), no "How to read" heading.
- C4: Partly met. Names blue, purple, dashed and magenta lines and the two dots; no units, axes, scale, what the dot labels are, or what a tilt means; not bulleted.
- C5: Not met. No worked moment.
- C6: Not met. No look-for list.
- C7: Partly met. The introduction (:304-309) says a flat line is "the lab's same moment line" before the prediction, which frames the options but gives no answer. The caption does not reveal it.
- C8: Partly met. "Worldline" and "event" come from Experiment 8; "light-second" is used in results (:430) but defined only in Experiments 4 to 6; "frame" is used (:289-295).

## Other findings
- O1: Specification and CLAUDE.md agree (complete, wording approved). The spec's own header says the line gets its extension in the component (stated).
- O2: Prediction text says "You already know ... both flashes arrived at exactly the same moment" (:344-349). The extension of the line to the diagram's edges is computed in the component (:123-132, a small §9 point). The component's own `actualShapeFor` (:44-46) decides flat/tilted from `velocity === 0`, not from the module.

## What an update would touch
Experiment9.tsx, Experiment9Tutor.tsx, spacetimeDiagramView.ts and .test.ts, the specification. **Medium**.

## Not checked
Rendering, narrow widths, browser behaviour; no sources needed (re-draws Experiment 7).
