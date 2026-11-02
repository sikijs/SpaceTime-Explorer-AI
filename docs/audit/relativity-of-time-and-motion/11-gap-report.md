# Gap report: Relativity of Time and Motion Experiment 11 (The Rod's Own Axes)
Date: 2026-11-02 | Specification: docs/experiments/relativity-of-time-and-motion/11-rods-own-axes.md | Components: src/components/Experiment11.tsx, Experiment11Tutor.tsx | Physics module: src/physics/lorentzTransform.ts (+ .test.ts, 5 tests), spacetimeDiagramView.ts (`rodTimeAxisFor`, `rodSpaceAxisFor`) | Status: read-only, nothing changed

## Summary
Static spacetime diagram (Experiment 9's lines plus the rod's two orange axes), one prediction (same or different times in the rod's frame), a results list of lab and transformed event numbers, a 3-step tutor with a worked calculation. Older rule. Biggest gaps: no on-canvas labels (the two new axes especially), a one-paragraph colour-list caption without worked moment or three-part look-fors, no picture of the predicted rod-frame times, no reading guide. Size: **Medium**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | In the rod's own frame, do the two events come out at the same time or different times? (Experiment11.tsx:273-290) | same / different; `predictionOutcome` -> `submittedOutcome` (:162-163) | No picture shows rod-frame times; the nearest is the diagram (the events lie on the orange space axis's parallel). A small panel of the two events' rod-frame times could be added |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | Diagram from `result` (:184); `lorentzTransform` outputs (:185-186); guess read only in text (:384-390) | |
| A2 | Not met | `SpacetimeDiagram` (:50-143) draws no white mark | White marker with "YOUR GUESS" box at the guessed times in a new rod-frame-times panel |
| A3 | Not met | n/a | "same/different": marker only, caption must say so |
| A4 | Not met | The whole diagram is drawn at once, no stages (:325-337) | Marks only after the new panel is drawn |
| A5 | Not met (needed) | The rod-frame times are only in the Results text (:366-379) | Add a panel to the diagram (own title, own time scale) |
| A6 | Not met | No source line | Add: calculated here by the Lorentz transformation from Experiment 7's events |
| A7 | Not met | Introduction (:239-262) has no sentence about predictions; no "not scored" either | Add + a speed-control note |
| A8 | Not met | `lorentzTransform` exists and is tested; no guess-mark function | Add + tests |
| A9 | Partly met | Compare step states guess and actual (Experiment11Tutor.tsx) before the explanation; prompts say "the two calculated times", not marks | Rewrite |
| A10 | Not met | No "not scored" or "do not change" sentence in Experiment11.tsx or its tutor | Record as current state |

## Rule B
- B0: Results (:345-392): speed; lab-frame events (position, time); rod-frame events by Lorentz transformation (position, time); "Your prediction" (guess; actual).
- B1: Not met. A real reference exists inside the project: the rod-frame time should equal Experiment 7's `rodFrameEventTime` and the interval is invariant (lorentzTransform.test.ts:24,:35). No external source; owner decides.
- B2: Not met. No notes; unit "ls" is used (:356-374) without being defined.
- B3: N/A.
- B4: Partly met (:381-390) text only.
- B5: Partly met. The transformed numbers come from the module and are tested; no comparison or check-up function.

## Rule C
- C1: Not met. No labels on the orange axes, the magenta line, the rod lines or the origin; no axis names or units (:114-143).
- C2: Met. Blue, purple, magenta and orange (dashed vs solid for space/time axes) are distinct.
- C3: Partly met. One paragraph (:322-337, no "How to read" heading).
- C4: Partly met. Lists every colour (blue, purple, dashed, magenta, orange dashed and solid) but does not define "axis", the origin dot, what the dot time labels mean, units, or what a tilt means; not bulleted.
- C5: Not met in the caption (the tutor has a worked calculation, Experiment11Tutor.tsx step "Working the numbers").
- C6: Not met. No look-for list.
- C7: Partly met. The caption reveals nothing, but the introduction's example of the Lorentz transformation "doesn't change what happened" (:219-226) and Experiment 9's earlier results make Prediction 1 nearly given away (learner has already seen the rod's frame say "same moment").
- C8: Partly met. "Lorentz transformation" is defined (:219-226). "Time dilation factor" is used in the tutor (Experiment11Tutor.tsx) without a definition; "ls" undefined; "space axis" and "time axis" are introduced as "time direction" and "now direction" (:246-248) but the caption uses "space axis and time axis".

## Other findings
- O1: Specification header says the introduction and tutor wording "have not yet had the owner's line-by-line approval" (11-rods-own-axes.md:5); CLAUDE.md says wording approved. Stale header; report only.
- O2: The tutor does arithmetic itself, `1 / timeDilationFactor` (Experiment11Tutor.tsx:133-143), and the diagram extends lines in the component (`extendToEdges`, :115-124): small §9 points. `actualTimeOutcome()` is hard-coded `'same'` (:30-32) rather than computed from the transformed times. The diagram's "Results" and tutor appear immediately with no staged build.

## What an update would touch
Experiment11.tsx, Experiment11Tutor.tsx, lorentzTransform.ts and spacetimeDiagramView.ts with tests, the specification. **Medium**.

## Not checked
Rendering, narrow widths, browsers. The Lorentz formula is standard; no external source read.
