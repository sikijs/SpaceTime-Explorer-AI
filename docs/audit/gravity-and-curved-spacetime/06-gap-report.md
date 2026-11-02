# Gap report: Gravity and Curved Spacetime Experiment 6 (Why do planets orbit instead of falling in?)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/06-orbits.md | Components: src/components/OrbitExperiment.tsx, OrbitTutor.tsx | Physics module: src/physics/orbitExperiment.ts (+ .test.ts, 8 cases) | Status: read-only, nothing changed

## Summary
Three predictions (weak push, strong push, "is there something in between?"), one slider (push strength, 0 to 200 percent of circular speed), one unlabelled top-down drawing and a Results block that states the general rules. Biggest gaps: the drawing has no labels or caption at all (mass, object, path, dashed trail are only explained by a one-line note for the escape case); the predictions are about ranges of push strength but the run shows one strength, so the "real result" for each guess has no picture; no guess marks; the Results panel gives the verdict on each prediction. Size: **L** (a picture of outcome against push strength would be new).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | If the starting push is very weak, what happens? (`OrbitExperiment.tsx:311-317`) | "Falls into the mass" / "Flies away and never returns" / "Curves around and comes back" (`:26-30`); `slowPrediction` then `submittedSlowPrediction` (`:163, :166, :180`) | A range of push strengths (low end of the slider, `:356-368`). No picture shows outcome across the range; the run shows only the one chosen strength. |
| 2 | Very strong push: same three options (`:318-324`) | same | High end of the same range. |
| 3 | Is there a push strength in between where something different happens? (`:325-331`) | Yes / No (`:24, :109-154`) | The middle of the range (around 100 percent, circular speed). |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `:178-179` result from `speedFraction` only; predictions are not read by the physics | |
| A2 | Not met | the `<svg>` (`:385-419`) has no white mark | A strip "what happens at each push strength" (0 to 200 percent) coloured by outcome from the module, with white guess marks and YOUR GUESS boxes at the weak end, the strong end and the middle. |
| A3 | Not met | | Guesses are outcomes, not numbers: markers at the ends and middle of the strip, caption saying so. |
| A4 | Not met | | Draw once the strip's outcome bands are drawn. |
| A5 | Not met (needed) | the answer has no picture across strengths | New panel in the same picture area, on its own horizontal scale (push strength), own title. |
| A6 | Not met | no "Where the real picture comes from" | Calculated here by stepping ordinary gravity forward (module header `orbitExperiment.ts:1-16`), relative units (`:306`). |
| A7 | Not met | intro `:264-309` silent; the lock note `:334-339` talks about predictions but not the pictures | Add the three sentences; the slider changes the drawing, guesses do not. |
| A8 | Not met | Module exports `OrbitPoint`, `OrbitOutcome`, `OrbitExperimentResult`, `runOrbitExperiment` (`orbitExperiment.ts:17-72`); the circular speed is recomputed in the component (`:170`); outcome per-strength sweep and thresholds are missing | Add a sweep function, threshold values, guess-marker data and tests. |
| A9 | Partly met | Tutor "compare" step names the guesses and the rule (`OrbitTutor.tsx:67-68`) before the explanation | |
| A10 | Not met (no statement) | Results `:442-454` "Your prediction ... In fact ..." | The panel itself is the older text-beside-results. |

## Rule B
- B0. One Results block (`:426-456`): launch speed and escape speed percentages, outcome sentence, three "Your prediction ... In fact ..." lines. No tables.
- B1. Not met. A real reference exists inside the physics: circular speed 100 percent and escape speed about 141 percent of it (`:430-432` prints the latter). A check-up row "your push vs circular speed vs escape speed" could give "below / near / above". No published value is needed (ordinary gravity).
- B2. Not met.
- B3. N/A: the slider changes the run itself; a settings table would not add to the drawing.
- B4. Partly met: text lines (`:443-454`) that also state the verdict ("In fact, yes"), a tutor job under the newer rule.
- B5. Partly met: `escapeSpeed` is from the module; the percentage arithmetic is in the component (`:432`).

## Rule C
- C1. Not met: the drawing (`:385-419`) labels nothing. The central mass, the moving object, the path, the starting point, the push direction and the dashed escape trail are unlabelled (only the dashed trail has a note under the picture, `:420-424`, when it appears).
- C2. Partly met: different strengths give visibly different paths; the first and second runs are not shown together, so contrasts across strengths are not visible at once.
- C3. Not met: no "How to read this diagram" caption.
- C4. Not met.
- C5. Not met (a cliff-throw comparison is in the tutor's explanation, `OrbitTutor.tsx:123-129`, not in a caption).
- C6. Not met.
- C7. Partly met: intro "Why even ask this" asks whether an orbit is "a particular kind of falling" (`:272-274`), close to the tutor's conclusion (hint, §12); the "Your job" line `:285-286` is neutral.
- C8. Partly met: "circular-orbit speed" and "escape speed" appear in the slider label and Results (`:357, :430-432`) with a brief parenthesis only in the Results (after the run), not before the learner uses the slider; "gravity", "orbit" are everyday words.

## Other findings
- O1. Possible inconsistency inside the experiment: the intro says it uses ordinary gravity and not general relativity (`:292-295`), while the tutor's point 4 says the path is "as straight as spacetime allows ... because spacetime near the mass is curved" (`OrbitTutor.tsx:132-135`). Owner to decide whether that is acceptable; reported only.
- O2. (a) Results `:443-453` states each guess's "In fact ..." verdict immediately after the run (§12 timing vs the tutor). (b) The Results rules ("always falls in", "always flies away") are stated for the extremes while the learner's run may be at any strength; the first prediction has no real run unless the learner happens to choose a low value (the page does not require it). (c) The tutor's first observe prompt gives the outcome in brackets (`:66`), which can be read as the answer before "observe". (d) The classification "falls in" depends on a collision radius of 0.1 × the start distance (`orbitExperiment.ts` constant `COLLISION_RADIUS_FACTOR = 0.1`), a chosen value, not mentioned to the learner. (e) The page says the "Change predictions" button lets the learner start over (`:334-352`), a behaviour not mentioned in the specification summary read. (f) Cross-references to "Experiment 4/5" lack the chapter name.

## What an update would touch, and its size (O3, O4)
OrbitExperiment.tsx (new strength strip, labels on the drawing, caption, intro, notes, results), OrbitTutor.tsx, physics module + test (sweep, thresholds, markers), specification. **Size: L.**

## Not checked
No browser view; the tutor was read from its explanation step and a keyword view of the compare step; the module's internals beyond its header and constants were skimmed; specification not compared; Rule D N/A.
