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

---

# Re-read, 2026-11-10: Rule E and the owner's rules of 2026-11-02 to 2026-11-10
Read-only. Re-read of `Experiment9.tsx` (463 lines), `Experiment9Tutor.tsx` (138 lines), the physics view layer `spacetimeDiagramView.ts` (`sameMomentLineFor`) over `relativityOfSimultaneityExperiment.ts`, and the specification `09-same-time-different-line.md`. Nothing changed. The line numbers in the report above are from before the 2026-11-10 "block" rename (the text changed, the lines did not move). Rules A to C above stand; this section adds Rule E and the rules set while Relativity 1 to 8 were audited, so the owner's earlier answers carry over (`03-` to `08-draft-wording.md`). **Relativity 9 is the sibling of Relativity 8:** the same diagram with one new line, so most of Relativity 8's answers apply directly. It differs in three ways: the guess is a **shape** (flat or tilted), not an order; the real answer is a **line that appears when the drawing ends**; and the chapter's idea ("a level line is the lab's same moment") is a **definition the introduction gives in words**.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One grey card, one column: introduction, speed buttons, the guess, START, the diagram, then Results and the tutor (`Experiment9.tsx:215-460`) | Part 1 (the guess, START, the diagram at 0.5c), Part 2 (the speed and a diagram that follows it), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours. Part 1's lead must not say whether the line is flat or tilted |
| E3 | Partly met | Introduction and assumptions sit above the controls (`:224-288`); no links list, no words box | See "Links" and "Words" below |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule)
- **Better than Relativity 8 here:** the Results and the tutor render only when the magenta line has been revealed (`lineRevealed`, `:409`, `:453`), so the learner cannot read the answer before the line is drawn. **Not met:** `onComplete` still fires at START (`:185`), before the line is drawn, so progress is saved too early. **Needed:** Parts 2, 3 and 4 appear when the Part 1 line has been drawn, and `onComplete` fires then.
- **The speed buttons** (`:290-331`) sit above the guess all the time. They would move into Part 2, which appears after the first Run with a "Not run yet" note.

## The speed has to leave the prediction
The guess ("will that line be flat, or tilted?") has a speed-dependent answer in one case: at **0c** the line is flat (`actualShapeFor`, `:39-41`). Today the learner can choose 0c, guess "tilted", run, then change the speed and guess again (`handleStart` clears the guess, `:183`), so a changed guess can sit beside results from another speed. **Recommend, as in Relativity 3 to 8:** Part 1 fixed at 0.5c (the speed of the Relativity 8 sketches); the speeds (0c baseline, 0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) in Part 2, which opens at 0.8c. **Needs the owner's decision.**

## A bug found: the tutor says something false at 0c
`Experiment9Tutor.tsx` says in its explanation "someone riding along with it has their own line, and you can see it is not the lab's flat line" (`:118`) and "the flash reached the back end at X s and the front end at Y s in the lab — but at exactly the same moment for the block" (`:122-127`), for **every** run, including the 0c baseline, where the line **is** the lab's flat line and the two times are equal. The conceptual question ("why do you think the line through those two events isn't flat?", `:59`) also assumes a tilt. The observe and compare steps are fine (the compare step uses `actualShapeFor`). Fixed by the Part 1 change above (the tutor then only ever sees 0.5c).

## Rule A to C: what the re-read sharpens
- **The guess marker (A2 to A5; needs the owner's decision).** The guess has no size: "flat" and "tilted" are two shapes, and "tilted" has no slope of its own. The answer lives on the **real line** through the two dots. Two designs:
  1. **A fixed example marker, recommended.** A short white bar with a double arrow, in a box labelled YOUR GUESS, set in the empty upper-left corner of the diagram: **level** for "flat", **leaning at a fixed example angle** for "tilted". The caption says each is only a marker and that the white bar's lean is **not** the real lean. It appears together with the real line (A4). This is how the agreement marker worked in Relativity 7.
  2. **A white line through the dots.** A level white line through the lower dot for "flat". For "tilted" it would have to lie on the real line, so it would coincide with the real answer at every speed and look like a "right" mark (§12, §13). **Not recommended.**
- **The lab's level line is not drawn anywhere (C2; needs the owner's decision).** The chapter's idea is the contrast between the lab's same moment (a level line) and the block's (a tilted line), but only the tilted line is drawn. **Recommend** a faint level reference line through the lower dot, labelled "A level line: the lab's 'same moment'", appearing with the real line. It shows the contrast, as Relativity 6 and 7 drew both views.
- **The colour of the block's own line (needs the owner's decision).** It is **magenta** (`#8e24aa`), and the text calls it "the magenta line" (`:386-391`, tutor `:53`). On the dark ground that Relativity 7 and 8 use, a lighter magenta would sit close to the **pink** that means "your speed" in Part 2 (`#f472b6`). **Recommend** changing it to a green (`#34d399`) and calling it "the green line", so that pink stays the learner's settings and white stays the learner's guess. Keep magenta only if you prefer.
- **The diagram's ground and labels (C1, not met).** As in Relativity 8: a dark ground so that the white marker shows; axis names and arrows, tick marks and a key; "Flash released here", the four lines, the dots ("Back end reached", "Front end reached" with times) and the new line, all named on the canvas. The current canvas (`:133-155`) names nothing except the dots' times.
- **C3 to C6, the caption (`:385-392`).** One short paragraph without a heading, worked moment or look-fors. Needed: "How to read this diagram" in sections; every element and colour; units (light-seconds, seconds, one scale for both axes); what appears when (the four lines and the two dots grow upward over a few seconds, then the new line appears); a **worked moment at 0.5c from the module**: the line goes through (−0.144 light-second, 0.144 s) and (0.433 light-second, 0.433 s), so it rises 0.433 − 0.144 = 0.289 s over 0.433 + 0.144 = 0.577 light-second across, a lean of 0.289 ÷ 0.577 = 0.500 s for every light-second, the block's speed in c; and three-part look-fors. **Wording point:** nothing before the line appears may say it leans.
- **A6, "Where the real picture comes from."** None. Needs: calculated here from the times of "At the same time... for whom?" and the lines of "Drawing Spacetime"; nothing measured; the block and the flash imagined.
- **A7 and A10, the introduction's statement.** No sentence about predictions (`:224-288`), and not even "Guesses are not scored." Add both, the statement that the guess never changes the pictures or tables, is drawn in white and shown again beside the results, and which control (the speed in Part 2) changes the drawings.
- **A8, the module.** `sameMomentLineFor` returns the two real points (`:61-63`). Missing, and added with tests (§9): the guess marker for a shape (which white bar), the line's **ends extended to the diagram's edges** (today done in the component, `:122-131`), the line's **lean** (time over position), and the tutor's marking; and `actualShapeFor` (in the component, `:39-41`) moves into the module.
- **A9, the tutor.** The observe step names "the new magenta line" (good); the compare step states the guess and the real shape before the explanation. Needed: observe and compare name the white marker and the (green) line; the explanation marks the guess with no "right" or "wrong" and no score (§12, §13). The "friends in the car" paragraphs stay. **Needs the owner's confirmation.**
- **Results (`:419-451`).** The "Your prediction" block says "You guessed the line would be flat. It is actually tilted." (`:446-447`), which compares them. **Recommend**, as in Relativity 7 and 8: the guess as a tag, no "It is actually" line; and **add** the real new number, **how much the line leans** (0.500 s for every light-second, which is also the block's speed in c), with a note. Every number from the module. No gap line exists today; the specification does not call for one.
- **Old chapter numbers in wording.** The introduction says "Experiment 7" (`:239`, `:286`), "Experiment 5" (`:285`); the prediction says "from the last chapter" (`:338`); the results say "Experiment 6" (`:425`); the tutor says "Experiment 7" and "Experiment 8" (`:112`, `:122-126`, `:132`). **Recommend** the chapters' titles ("At the same time... for whom?", "Drawing Spacetime", "Why can't light go faster?", "Does motion change length?").
- **C8, terms.** "Frame" is used without a definition here ("the block's own frame", `:240`; it was defined in Relativity 2); "event" and "worldline" are defined in Relativity 8, not here; "light-second" is used in the results (`:426`) and never defined on this page. Define each where first needed, and list each in the words box.
- **B1 to B3.** The real reference for the line's lean is the block's speed (test `spacetimeDiagramView.test.ts:108`, "the slope equals v"), which is the same geometry, so a check-up would be circular. **Recommend no check-up and no setting-following table.**
- **Page width and buttons.** The outer width is already 900 px. The page uses inline colours and `optionButtonStyle` instead of the shared classes. **Recommend** the shared classes, as for Relativity 3 to 8.
- **No "Start over".** There is a **Replay** button only (`:393-400`). Needed: an always-visible "Start over", greyed until there is a guess or a run and while the drawing runs, and a locked-guess line; Replay stays.
- **A sketch for the chapter's idea (needs the owner's decision).** Relativity 8 added two sketches for ideas the words could not carry. This chapter's one new idea is "**a level line means the same moment for the lab, and a tilted line means different moments**". **Recommend one small sketch** in the introduction, "What a level line means", with a caption in the Relativity 8 style: a graph with position across and time up, a level line through two dots at the same height (the same moment) and a leaning line through two dots at different heights (different moments), at one scale. It would show no block and no flash, so it gives no answer to the guess. The wording would be yours to approve.
- **Speed cap.** The page caps the custom speed at 0.9c (`MAX_SPEED`). **Recommend keeping the cap.**
- **O1.** The specification and CLAUDE.md agree (complete, wording approved).
- **O2, small points.** The line's extension to the edges and `actualShapeFor` are in the component (`:39-41`, `:122-131`); both move to the module with A8. The `pointAt` interpolation for the animation stays (a drawing step).

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. Background ideas the introduction explains: a graph of position against time (as in Relativity 8), the same moment and what "simultaneous" means, the relativity of simultaneity (stated here as the reason), an event, a worldline, a frame. **Not searched or read yet** (the search and fetch belong to the draft step). Pages on the relativity of simultaneity say, in general terms, what this chapter's introduction already says, so they are probably safe from the start; **any page that draws the tilted same-moment line, or says that lines of simultaneity tilt, is held back until after the tutor.** Pages found for Relativity 7 and 8 (Einstein Online, parts 3 and 5, "The definition of 'now'") will be fetched again.
- **Real results.** None (a thought experiment). **Needs the owner's decision:** record a gap for Minkowski's 1908 lecture, as in Relativity 8. Default: gap.
- **"Words and formulas": Not met.** None exists. Terms: the same moment, simultaneous, event, worldline, position, time, lab, frame (the lab's, the block's own), block, back end, front end, flash, light-second, c, lean (slope), the line of the same moment. **Formula on the page:** none is used by the reader, but the lean is "time ÷ position". Offer one entry for it with a worked example from the page's own numbers, and withhold the lean at 0.5c until after the run (it is the answer to the guess).

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** There is no "Start over" and no "Change prediction". `handleStart` clears the guess, so the learner can choose another speed and guess again. Needed: as described above.

## Updated size
**Medium → Large** (was Medium): the Parts layout; a dark diagram with labels, ticks and a key; a white example marker and the lab's level line; a new line colour; "Where the real picture comes from"; Part 2 with "Runs so far"; a rewritten caption with a worked moment; one new sketch and its caption; results with a lean line and notes; the words box; links (search and fetch); Start over; the tutor's marking and the 0c fix; the specification update; and tested module functions. Files: `Experiment9.tsx`, `Experiment9Tutor.tsx`, a new `Experiment9Pictures.tsx` (and perhaps `Experiment9Sketch.tsx`), `spacetimeDiagramView.ts` and `.test.ts`, the specification and `DEVELOPMENT-STATE.md`. The draft wording would live in `09-draft-wording.md`.

## Questions for the owner before drafting (suggested defaults follow the answers given for Relativity 1 to 8)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Settings:** Part 1 fixed at 0.5c; the speed (0c baseline, 0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) moves to Part 2, which opens at 0.8c? Default: yes.
3. **Parts 2 to 4 appear when the Part 1 line has been drawn,** and `onComplete` fires then? Default: yes.
4. **The guess marker:** a fixed example white bar (level for "flat", leaning for "tilted") in a YOUR GUESS box, shown with the real line, and the caption saying it is only a marker? Default: yes (design 1).
5. **The lab's level line:** a faint labelled reference line through the lower dot, appearing with the real line? Default: yes.
6. **The block's own line:** change magenta to green, so pink stays the learner's speed? Default: yes (green, "the green line").
7. **A dark ground, axis names, ticks and a key** for the diagram, as in Relativity 8? Default: yes.
8. **Caption:** "How to read this diagram" in sections, a worked moment at 0.5c (0.289 s up over 0.577 light-second across, a lean of 0.500), and three-part look-fors? Default: yes.
9. **Results:** the guess as a tag with no "It is actually" line, a new "how much the line leans" line with a note, and a note under each block? Default: yes.
10. **Tutor:** names the white marker and the line, marks the guess with no score, and the 0c wording problem goes away with question 2? Default: yes.
11. **Introduction:** the chapters' titles in place of numbers, "frame", "event", "worldline" and "light-second" defined where first needed, the statement about the guess? Default: yes.
12. **Reading guide:** no check-up or setting-following table? Default: yes.
13. **One new sketch** "What a level line means" in the introduction, with a caption? Default: yes.
14. **Links:** search for plain official pages on the relativity of simultaneity and spacetime diagrams, hold back any that show the tilted line, and **record a gap for Minkowski's 1908 lecture**? Default: yes.
15. **Words box:** the terms above and one formula entry ("lean = time ÷ position"), with the lean at 0.5c withheld until after the run? Default: yes.
16. **Buttons and card:** the shared classes; "Start over" always visible, Replay kept? Default: yes.
17. **Size:** accept Medium → Large? Default: yes.

## Not checked (re-read)
The page was not run in a browser; narrow widths were not looked at; no source page was searched or fetched for the links list. The numbers quoted (−0.144, 0.144 s; 0.433, 0.433 s; 0.289 s over 0.577 light-second; a lean of 0.500) come from the module's formulas by hand (the same as Relativity 8's), not from running the page. The 0c bug was found by reading the tutor's text against `actualShapeFor`; it was not reproduced in the browser. The line numbers in this section are from the files as read on 2026-11-10.
