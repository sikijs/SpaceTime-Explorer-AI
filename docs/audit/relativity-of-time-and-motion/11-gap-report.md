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

---

# Re-read, 2026-11-11: Rule E and the owner's rules of 2026-11-02 to 2026-11-11
Read-only. Re-read of `Experiment11.tsx` (410 lines), `Experiment11Tutor.tsx` (172 lines), the physics `lorentzTransform.ts` (5 tests) and the view functions `rodTimeAxisFor` and `rodSpaceAxisFor` in `spacetimeDiagramView.ts`, and the specification `11-rods-own-axes.md`. Nothing changed. Rules A to C above stand (the file's line numbers are from before the 2026-11-10 "block" rename, which changed the words but not the lines); this section adds Rule E and the rules set while Relativity 1 to 10 were audited, so the owner's earlier answers carry over (`03-` to `10-draft-wording.md`). **Relativity 11 is the sibling of Relativity 9** (the same diagram, now with two more lines) and **closes the chapter**. It differs in four ways: the guess is **"same time or different times" in the block's own frame**, and the answer is **the same at every speed** (0.250 s, half the block's rest length divided by c); the answer lives in **numbers, not in a picture** (the diagram shows the axes, not the block-frame times), so a new panel is needed; the chapter introduces **real new physics** (the Lorentz transformation), so a check-up against an earlier, independently derived result is possible; and its "run" is an instant CALCULATE, so there is no drawing yet.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One grey card, one column: introduction, speed buttons, the guess, CALCULATE, the diagram, Results, tutor (`Experiment11.tsx:190-407`) | Part 1 (the guess, Run, the diagram and the new panel at 0.5c), Part 2 (the speed and a diagram that follows it), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours. Part 1's lead must not say whether the times agree |
| E3 | Partly met | Introduction and assumptions sit above the controls (`:199-227`); no links list, no words box | See "Links" and "Words" below |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
- **Today:** the diagram, the Results and the tutor all appear the moment CALCULATE is pressed (`:320`, `:335`, `:395`), so there is no run to watch and `onComplete` fires at once (`:179`). **Needed:** a **Run** that draws the diagram over a few seconds, as in Relativity 8 and 9, then adds the two orange axes and the new panel; Parts 2, 3 and 4 appear when it has finished, and `onComplete` fires then. The Relativity 9 drawing (`useDrawing`, `SpacetimeDiagram` in `Experiment8Pictures.tsx`) is reused rather than copied.
- **The speed buttons** (`:229-269`) sit above the guess all the time and the guess question does not name the speed. They move into Part 2.

## The speed has to leave the prediction
The answer ("the same time") does **not** depend on the speed, so a changed guess cannot stand beside another speed's answer. But the numbers it is compared with do change (the lab's times), and today a learner can run at 0.8c, guess, then change the speed and guess again (`handleReveal` clears the guess, `:176-177`). **Recommend, as in Relativity 3 to 10:** Part 1 fixed at 0.5c; the speeds (0c baseline, 0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) in Part 2, which opens at 0.8c. **Needs the owner's decision.** (At 0c the two lab times are equal too, so the lab and the block agree; the Part 1 speed avoids that case in the tutor.)

## Rule A to C: what the re-read sharpens
- **The predicted quantity has no picture (A5; needs the owner's decision).** The diagram shows the two orange axes, not the events' times in the block's frame (`:114-143`; those appear only in Results text, `:365-377`). The Predictions rule says to add a panel to the nearest picture, with its own title and scale. **Recommend** a panel under the diagram, **"The two events on two sets of clocks"**: a dark strip with a time scale in seconds and two rows, **"The lab's clocks"** (back event 0.144 s, front event 0.433 s, two markers apart) and **"The block's own clocks"** (back event 0.250 s, front event 0.250 s, two markers on top of each other), each marker in the event's own colour (blue back, purple front, as on the diagram). It appears when the axes do, so it explains nothing early (A4). Same idea as the event-time strip of Relativity 7.
- **The guess marker (A2, A3).** "Same time" and "different times" have no size, so the marker is only a marker, as in Relativity 7 and 9: a white mark beside the "block's own clocks" row in a YOUR GUESS box. **Recommend** two white ticks level with each other for "same time" and two white ticks apart at a fixed example gap for "different times". The caption says the gap is only an example, not the real one, and that the mark never moves a real marker. Appears with the panel; shown again beside the results as a tag.
- **A6, "Where the real picture comes from."** None. Needs: calculated here (the lab's times from "At the same time... for whom?", the block's times by the Lorentz transformation); nothing measured; the block and the flash imagined; the two orange axes drawn from the block's speed, with no ticks.
- **A7 and A10, the introduction's statement.** No sentence about predictions and no "not scored" (`:214-221`). Add both, the statement that the guess never changes the pictures or tables, is drawn in white and shown again beside the results, and which control (the speed in Part 2) changes the drawings.
- **A8, the module.** `lorentzTransform` and the two axis functions exist and are tested. Missing, and added with tests (§9): **the transformed events and whether their times agree** (a function that replaces the hard-coded `actualTimeOutcome()` that returns `'same'` without looking at the result, `:28-30`), the two rows of the panel, the marker for each guess, the tutor's marking, **the worked numbers the tutor works out by hand** (`1 / timeDilationFactor`, `Experiment11Tutor.tsx:131-144`), and the **extension of the axes to the diagram's edges** (the component's `extendToEdges`, `:115-121`; Relativity 9 already added `sameMomentLineExtended`).
- **A9, the tutor.** The prompts say "the two calculated times" and the compare step states the guess and the actual before the explanation (`Experiment11Tutor.tsx:71-76`). Needed: observe and compare name the white marker and the two rows; the explanation marks the guess with no score. The conceptual question and the "working the numbers" paragraph stay.
- **The prediction nearly answers itself (C7; needs the owner's decision).** The learner has twice been told the block's frame says "the same moment" (Relativity 7 and 9), and the prediction text repeats it (`:276-280`). The spec approved this on purpose: the chapter is a **confirmation by calculation**, not a discovery. **Recommend keeping it** and saying so plainly in the tutor ("you already knew this; what is new is that a calculation gives it too"), as the spec's tutor step 1 does. The alternative, a numeric guess for the block-frame time, would add a number the learner can only get by doing the calculation, and is **not** recommended without your say.
- **C1, labels.** No labels on the orange axes, the green line (now), the block's lines, the origin, or axis names and units (`:134-150`). As in Relativity 9: a dark ground, axis names and arrows, ticks every 0.1, a key; "Flash released here"; "The block's own time axis" (solid orange: where the block's centre is at every moment) and "The block's own space axis" (dashed orange: the block's own 'now' line through the origin); the two dots with times; Relativity 9's same-moment line, named; no ticks on the orange axes (the spec defers a calibrated grid).
- **C2, colour (needs the owner's decision).** The orange axes (`#e65100`) are distinct on the old light ground. On the dark ground used since Relativity 7, orange sits near **amber** (the release dot) and not far from **pink** (the learner's speed, Part 2). **Recommend** a lighter orange (`#fb923c`), keeping Relativity 9's green for the same-moment line, and checking the contrast in the browser. **Keep** orange unless you prefer another colour.
- **C3 to C6, the caption.** One paragraph without a heading (`:323-331`). Needed: "How to read this diagram" in sections; every element and colour; units (light-seconds, seconds, one scale for both axes); what appears when; a **worked moment at 0.5c from the module**: the back event is at (−0.144 ls, 0.144 s) and the front at (0.433 ls, 0.433 s); with the factor 1.155 (1 ÷ 0.866) the back event gives 1.155 × (0.144 − 0.5 × (−0.144)) = **0.250 s** and the front event 1.155 × (0.433 − 0.5 × 0.433) = **0.250 s**; and three-part look-fors. Nothing before the panel appears may say the times agree.
- **A new sketch (needs the owner's decision).** Relativity 8 and 9 added a sketch for the idea the words could not carry. This chapter's new idea is "**each frame has its own pair of axes, tilted if it is moving**". **Recommend one small sketch** in the introduction, "What a frame's own axes are", with a caption in the Relativity 9 style: the lab's pair (vertical time axis, level space axis) and one tilted pair at a fixed example lean, on one scale, with no block, no flash and no events. It gives no answer to the guess.
- **C8, terms.** "Lorentz transformation" is defined (`:207-212`); "ls" is used without a definition (`:356-374`); "time dilation factor" appears in the tutor without one; "space axis" and "time axis" are called "time direction" and "now direction" in the introduction (`:215-217`); "primed" is never used, good, but "position" and "time" of an event in a frame are never named. **Recommend** the chapter titles in place of numbers, "light-second" for "ls", and each term defined where first needed and listed in the words box.

## Rule B: reading the results (a check-up is possible here)
- **B1: a real reference exists, inside the project and derived independently.** "At the same time... for whom?" (Relativity 7) gives the block-frame time of both events by **reasoning in the block's own frame**: the flash starts at the centre and has the same distance to go each way, so it arrives at both ends at (rest length ÷ 2) ÷ c = **0.250 s**. This chapter finds it by **a different route** (the Lorentz transformation of the lab's numbers), and the specification already tests the two against each other (tests 3 and 4). **Recommend** a small check-up table, as the owner's rule says "the same" where a reference exists: rows "Back event, block-frame time", "Front event, block-frame time", "Back event, block-frame position" and "Front event, block-frame position", with **Expected** (0.250 s, 0.250 s, −0.250 ls, +0.250 ls: Relativity 7's time and Relativity 6's rest length ÷ 2), **Found** (the transformation's results) and a reading ("the same"). This is not circular because the two numbers come from different calculations. **Needs the owner's decision.**
- **B2:** a "What this table tells us" note under each block (what it is, what it means with the real numbers, why it matters).
- **B3:** **no setting-following table** (the speed only moves lines; the block-frame numbers are 0.250 at every speed).
- **B4:** the guess as a tag, no "It is actually" line (today `:384-389` says "You guessed ... It is actually ...", comparing them).
- **B5:** the comparison function and its tests go in the module.

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. Background ideas: the Lorentz transformation, a frame and its own axes, an event's position and time, a spacetime diagram. **Not searched or read yet** (the search belongs to the draft step). Pages that say events simultaneous for one frame are simultaneous for the other, or that draw a frame's tilted axes, are probably spoilers and would carry a warning, as for Relativity 10. Einstein Online's "Elementary Tour, part 5: Spacetime" (found for Relativity 9, held back) is the likely first candidate; it will be fetched again.
- **Real results.** None (a calculation on a thought experiment). **Needs the owner's decision:** record a gap for Einstein's 1905 paper ("On the Electrodynamics of Moving Bodies", where the transformation was derived in this form) and Lorentz's 1904 paper, as for Relativity 8 and 9. Default: gap (not read, not linked).
- **"Words and formulas": Not met.** None exists. Terms: Lorentz transformation, frame (the lab's, the block's own), event, position, time, axis, time axis, space axis, origin, light-second, c, time dilation factor, simultaneous. **Formulas on the page:** time' = (1 ÷ time dilation factor) × (time − speed × position) and position' = (1 ÷ time dilation factor) × (position − speed × time), each with a worked example from the page's own numbers but **not the Part 1 answer**: for example an event at position 0.2 ls and time 0.5 s seen from a frame moving at 0.6c (factor 0.8, 1 ÷ 0.8 = 1.25) has time' = 1.25 × (0.5 − 0.6 × 0.2) = **0.475 s** and position' = 1.25 × (0.2 − 0.6 × 0.5) = **−0.125 ls**. The two 0.5c answers (0.250 s each) are withheld until after the run.

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** Neither button exists. `handleReveal` clears the guess (`:176-177`). Needed: an always-visible "Start over", greyed until there is a guess or a run and while the drawing runs, and a locked-guess line. **Run** replaces CALCULATE.

## Other findings (updated)
- **O1 (spec, stale).** The specification header says the introduction and tutor wording "have not yet had the owner's line-by-line approval" (`11-rods-own-axes.md:7`); CLAUDE.md records all wording as approved. It also says the final review found "no gaps". It needs correcting with the update (**needs the owner's confirmation** that the wording is approved).
- **O2 (small §9 points, all moved to the module with A8).** `actualTimeOutcome()` is hard-coded (`:28-30`); the tutor divides by the factor itself (`Experiment11Tutor.tsx:131-144`); the diagram extends lines in the component (`:115-124`).
- **O3.** The page uses inline colours and `optionButtonStyle` instead of the shared classes (`exp-card`, `toggle-button`, `action-button`). **Recommend** the shared classes.
- **O4.** Speed cap 0.9c (`MAX_SPEED`): **keep** the cap.
- **O5.** Old chapter numbers in wording: "Experiment 6 through 9" (`:224`), "Experiment 7" (`:218`, `:276`), "Experiment 9" (`:201`, `:327`), and the tutor's "Experiment 7", "Experiment 8" and "Experiment 9" (`Experiment11Tutor.tsx:124`, `:147`, `:163-164`). **Recommend** the titles ("Does motion change length?", "At the same time... for whom?", "Drawing Spacetime", "Same time, different line").
- **O6.** The chapter's "What you learned / What's next" summary in `App.tsx` stays; it is not part of this audit.

## Updated size
**Medium → Large** (was Medium): the Parts layout; a dark diagram with labels, ticks and a key (reusing Relativity 9's drawing); the two orange axes and the green line named on the canvas; a new "two sets of clocks" panel and a white marker; "Where the real picture comes from"; a Run with a drawing in place of CALCULATE; Part 2 with "Runs so far"; a rewritten caption with a worked moment; one new sketch; a check-up table and notes; the words box; links (search and fetch); Start over; the tutor's marking; module additions with tests; the specification update. Files: `Experiment11.tsx`, `Experiment11Tutor.tsx`, a new `Experiment11Pictures.tsx` (and perhaps `Experiment11Sketch.tsx`), `lorentzTransform.ts` and `.test.ts` and/or `spacetimeDiagramView.ts` and `.test.ts`, the specification and `DEVELOPMENT-STATE.md`. The draft wording would live in `11-draft-wording.md`.

## Questions for the owner before drafting (suggested defaults follow the answers given for Relativity 1 to 10)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Settings:** Part 1 fixed at 0.5c; the speeds (0c baseline, 0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) in Part 2, which opens at 0.8c? Default: yes.
3. **Run with a drawing** (the diagram draws over a few seconds, then the axes and the panel appear) in place of the instant CALCULATE, reusing Relativity 9's drawing? Default: yes.
4. **Parts 2 to 4 appear when the drawing and the panel have finished,** and `onComplete` fires then? Default: yes.
5. **The new panel** "The two events on two sets of clocks" (the lab's clocks, the block's own clocks), under the diagram, as the picture the guess lives in? Default: yes.
6. **The guess marker:** two white ticks, level for "same time" and apart (a fixed example gap) for "different times", in a YOUR GUESS box, with the caption saying it is only a marker? Default: yes.
7. **The prediction stays** ("same time or different times"), with the tutor saying that it confirms what the learner already knew? Default: yes.
8. **Diagram:** a dark ground, axis names, ticks, a key, labelled orange axes (lighter orange, `#fb923c`) and the green same-moment line named; no ticks on the orange axes? Default: yes.
9. **Caption:** "How to read this diagram" in sections, a worked moment at 0.5c (0.250 s for both events), and three-part look-fors? Default: yes.
10. **Results:** a small check-up table (expected from "At the same time... for whom?" and "Does motion change length?", found by the transformation, "the same"), a note under each block, the guess as a tag with no "It is actually" line, no setting-following table? Default: yes.
11. **Tutor:** names the white marker and the two rows, marks the guess with no score; the "working the numbers" paragraph kept and fed from the module? Default: yes.
12. **Introduction:** chapter titles in place of numbers, "light-second" for "ls", each term defined where first needed, the statement about the guess? Default: yes.
13. **One new sketch** "What a frame's own axes are" in the introduction, with a caption? Default: yes.
14. **Links:** search for plain official pages on the Lorentz transformation, frames and spacetime diagrams, put any spoiler under a warning, and **record a gap for Einstein 1905 and Lorentz 1904**? Default: yes.
15. **Words box:** the terms above and two formula entries (time' and position') with a worked example at 0.6c that is not the Part 1 answer? Default: yes.
16. **Buttons and card:** the shared classes; **Run** in place of CALCULATE; "Start over" always visible? Default: yes.
17. **Specification:** correct the stale header and record the audit update? Default: yes.
18. **Size:** accept Medium → Large? Default: yes.

## Not checked (re-read)
The page was not run in a browser; narrow widths were not looked at; no source page was searched or fetched for the links list. The numbers quoted (−0.144, 0.144 s; 0.433, 0.433 s; 1.155; 0.250 s; and the 0.6c example 0.475 s and −0.125 ls) come from the module's formulas by hand, not from running the page. Line numbers are from the files as read on 2026-11-11.
