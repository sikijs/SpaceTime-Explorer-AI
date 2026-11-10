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

---

# Re-read, 2026-11-10: Rule E and the owner's rules of 2026-11-02 to 2026-11-10
Read-only. Re-read of `Experiment8.tsx` (479 lines), `Experiment8Tutor.tsx` (146 lines), `Experiment8Sketch.tsx` (the two introduction sketches added on 2026-11-10), `spacetimeDiagramView.ts` over `relativityOfSimultaneityExperiment.ts`, and the specification `08-spacetime-diagrams.md`. Nothing changed. Rules A to C above stand, and the line numbers quoted in them are from before the 2026-11-10 changes (the "block" rename and the two sketches), so they have moved by about 30 lines. This section adds Rule E and the rules set while Relativity 1 to 7 were audited, so the owner's earlier answers carry over (`03-` to `07-draft-wording.md`). Relativity 8 differs from Relativity 7 in these ways: **one guess, a choice among three** (back, front, same); the "answer" lives on a **diagram that draws itself over 2.5 seconds**, not on two panels; and the page has **two introduction sketches** that are already built and approved.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One grey card, one column: introduction, two sketches, speed buttons, the guess, START, the diagram, then Results and the tutor (`Experiment8.tsx:213-476`) | Part 1 (the guess, START, the diagram at 0.5c), Part 2 (the speed and a diagram that follows it), Part 3 (results), Part 4 (tutor) |
| E2, E4 | Not met | No Part headings or leads | Four leads in the shared colours. Part 1's lead must not say which end the light reaches first |
| E3 | Partly met | Introduction, the two sketches and the assumptions sit above the controls (`:226-304`); no links list, no words box | The sketches stay with the introduction, above Part 1, with no Part heading (they carry no answer). See "Links" and "Words" below |

## Parts 2 to 4 appear after the first Run (2026-11-07 rule), and an early reveal
- **Results and tutor appear at once, while the diagram is still drawing.** They render as soon as `result` is set (`:426`, `:469`), which is at START (`:187`), and `onComplete` also fires at START (`:188`). For 2.5 seconds the learner can read "Actual result: the back end's worldline first" and the tutor's first question before the dots have appeared. This is a §12 problem, and the reverse of Relativity 9, which waits for `lineRevealed`. **Needed:** Parts 2, 3 and 4 appear when the first run has finished drawing (not before), and `onComplete` fires then.
- **The speed buttons** (`:306-347`) sit above the guess all the time, so Part 2 would hold them, with a "Not run yet" note.

## The speed has to leave the prediction
The guess ("which worldline will the light cross first?") has a speed-dependent answer in one case: at **0c** the two dots are at the same height. Today the learner can choose 0c, guess, run, then choose another speed and guess again (`handleStart` clears the guess, `:186`), so a changed guess can sit beside results from another speed. **Recommend, as in Relativity 3 to 7:** Part 1 fixed at 0.5c (the specification's worked example, and the sketches' speed); the speeds (0c baseline, 0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) in Part 2, which opens at 0.8c. **Needs the owner's decision** (the specification's Learner Controls line lists the speed on the page).

## A bug found: the tutor says something false at 0c
`Experiment8Tutor.tsx` says in its conceptual question "Why does the back end's worldline reach the light's dashed line lower down on the diagram (in other words, sooner) than the front end's worldline does?" (`:57`) and in its explanation "The back end's worldline leans toward the spot where the flash was released, while the front end's worldline leans away from it" (`:112-118`), and "in the lab, the flash reached the back end at X s and the front end at Y s" (`:129-135`), for **every** run, including the 0c baseline, where both ends are reached at the same moment (gap 0.000 s) and neither end leans. The observe and compare steps are fine (the compare step uses `actualOrderFor`). Fixed by the Part 1 change above (the tutor then only ever sees 0.5c); the explanation would also need a line for Part 2's 0c run, if the tutor says anything about it.

## Rule A to C: what the re-read sharpens
- **One guess, a marker at the dots (A2 to A5).** The guess has no size. The answer lives on the two **event dots** (the back and front events), so the white mark is a **marker**, with a YOUR GUESS box joined by a line: for "back end first" a white ring around the **back** dot, for "front end first" a white ring around the **front** dot, and for "both at the same time" a white **bracket** joining the two dots (a level line would have to sit at one height, and no real event is at a height that stands for "both", so a bracket beside the dots is the honest marker). The caption says it is only a marker. **Needs the owner's decision:** the form of the "same time" marker. The mark appears only when the dots are drawn (A4).
- **The diagram's background is white-ish (`#f9f9f9` card, no fill on the svg).** A white mark needs a dark ground, as in Relativity 5 to 7. **Recommend** the diagram sits on a dark panel (as the event-time strip did), which also helps the blue and purple lines show. **Needs the owner's decision** (it changes how the pictures look).
- **C1, labels on the canvas (not met).** The canvas (`:137-158`) has a bottom axis line and a dashed vertical at the release position, an amber origin dot and four coloured lines, and **nothing is labelled**: no "position" or "time" axis names, no ticks or units (light-seconds, seconds), nothing on the blue and purple solid lines, the dashed light lines or the origin dot. Only the event dots carry "0.xxx s". Needed: axis names with arrows ("position →", "time ↑"), tick marks and numbers on both axes, "Back end of the block", "Front end of the block", "Light going to the back end", "Light going to the front end", "Flash released here", "Back end reached" and "Front end reached" beside the dots. The two new sketches already label theirs.
- **C3 to C6, the caption (`:401-409`).** A single dense paragraph without a heading, a worked moment or three-part look-fors. Needed: "How to read this diagram" in sections; every element and colour; units (light-seconds, seconds, and the one scale for both axes that the code uses, `:15-17`); what appears when (the lines grow upward over about 2.5 seconds, the dots appear when the light meets an end); a **worked moment at 0.5c from the module** (lab length 0.433, half 0.2165; the back end reached at 0.144 s at position -0.144; the front end at 0.433 s at position 0.433; gap 0.289 s); and three-part look-fors. **Wording point:** the caption must not say which dot is lower before the learner has guessed (the existing paragraph says only that a dot appears "where the light meets each end").
- **A6, "Where the real picture comes from."** None. Needs: calculated here from the flash's speed c ("Why can't light go faster?") and the block's length ("Does motion change length?"), via Relativity 7's geometry; nothing measured; nothing imagined except the block and the flash.
- **A7 and A10, the introduction's statement.** "Guesses are not scored." (`:286`) stays. Add: the prediction never changes the pictures or tables; the guess is drawn on the diagram in white and shown again beside the results; the speed (Part 2) changes the drawings. A note beside the speed buttons: the guess does not change the drawings or tables but the speed does.
- **A8, the module.** `spacetimeDiagramFor` returns the lines and events. No function for the guess marker (which dot, or the bracket) or for the marking, and `actualOrderFor` and `orderWording` live in the component file (`:46-56`) and are imported by the tutor. Added to the module with tests (§9). `pointAt` (`:30-38`) interpolates in the component to animate the lines (a drawing step, not a physical quantity; reported only).
- **A9, the tutor.** The observe step (`Experiment8Tutor.tsx:53`) points to "the diagram" and the "meeting point", not to the marker by name. The compare step states the guess and the real result before the explanation. Needed: the observe and compare prompts name the white marker; the explanation says which choice the learner made and what the diagram showed, **without "right" or "wrong" or a score** (§12, §13). The "A familiar version of this" cars paragraph stays. **Needs the owner's confirmation.**
- **The Results block (`:426-467`).** It shows the guess **and** "Actual result, in the lab's frame: ..." side by side, which compares them, where the 2026-11-02 rule is guess only. **Recommend**, as in Relativity 7: the results lines stay, the guess appears as a short block with a tag on the row it concerns (the two event times), and no "Actual result" line (the numbers are already there).
- **Old chapter numbers in wording.** The introduction says "Experiment 1" (`:248`), "Experiment 7" (`:255`, `:278`, `:302`), "Experiment 5" (`:268`, `:297`) and "Experiment 6" (`:300`); the results say "Experiment 6" (`:442`); the tutor says "Experiment 5" and "Experiment 7" (`:122`, `:129`, `:133`). **Recommend** the chapters' titles ("One clock", "Relativity of simultaneity", "Why can't light go faster?", "Does motion change length?").
- **C8, terms.** "Event" and "worldline" are defined (`:243-252`). "Light-second" is **not** defined in the introduction's own text: the two sketch captions define it, but the first use in the diagram's results line (`:443`) and in Part 1's guess wording would stand alone for a learner who has skipped the sketches. Define it where the introduction first needs it, and list it in the words box.
- **B1 to B3.** Every number comes from the same geometry as Relativity 7, so a check-up would be circular, and the speed only moves lines. **Recommend no check-up and no setting-following table.** Keep the results lines, add the guess tag (B4, guess only) and a short note under each results block.
- **Page width and buttons.** The outer width is already 900 px. The page uses inline colours (`#f9f9f9` card, `#28a745` START, `optionButtonStyle`) instead of the shared `exp-card`, `toggle-button` and `action-button` classes. **Recommend** the shared classes, as for Relativity 3 to 7.
- **No "Start over".** There is a **Replay** button only (`:410-417`). Needed: an always-visible "Start over", greyed until there is a guess or a run and while the diagram is drawing; a line saying the guess is locked after START; later runs in Part 2 ("Run your speed", no new guess). **Replay** can stay as a Part 1 and Part 2 control.
- **The sketches.** Both are in the introduction and approved, with full captions. They are fixed at 0.5c, so they agree with Part 1. Nothing to change, except their chapter-number wording if any (none found).
- **Speed cap.** The page caps the custom speed at 0.9c (`MAX_SPEED`). **Recommend keeping the cap** and saying why in Part 2's note.
- **O1, the specification header.** Still says the owner's line-by-line wording approval "was explicitly skipped, not granted" (`08-spacetime-diagrams.md:5`) while CLAUDE.md says the wording was approved. Report only; to be corrected with the owner's word when the specification is updated.
- **Out of scope here, but noticed.** The summary in `src/App.tsx` (the "learned" line, shown only after the tutor) states the result ("the flash reaching the back end, then the front end") and is fine under §12; it carries the old numbering ("Experiment 7"). Reported only.

## Links and Words (2026-11-07 rule)
- **"Want to know more?": Not met.** None exists. Background ideas the introduction explains: a graph of position against time (a car), a **spacetime diagram**, an **event**, a **worldline**, the speed of light and a flash of light, the block (Relativity 7) and its length seen from the lab (Relativity 6). **Not searched or read yet** (the search and fetch belong to the draft step). Plain pages on spacetime diagrams and worldlines are safe from the start (the page asks about the order of the two events, not about what a spacetime diagram is), but **any page that draws the Relativity 7 scenario and says which end the flash reaches first is held back until after the tutor.**
- **Real results.** The page uses none (a thought experiment; every number comes from the specification's geometry), so there is no paper for a result. **Needs the owner's decision:** link a source for the spacetime diagram idea (Minkowski's 1908 lecture, "Space and Time") after the explanation, with no claim of evidence, or record a gap under §29 rule 3(c). Default: record a gap, as for Relativity 6 and 7.
- **"Words and formulas": Not met.** None exists. Terms: spacetime diagram, event, worldline, position, time (as the two axes), lean (slope), the lab, back end, front end, block, rigid, rest length, length seen from the lab, flash, light-second, c, "at rest", "moving". **Formula on the page:** none is used by the reader; the tutor mentions "a steeper line means faster". Offer one entry for the lean: **time = distance ÷ speed**, light covering 0.2 light-second in 0.2 s, to match the second sketch (an example that uses no moving block), and **withhold** the lab's arrival-time formulas, which would give away the answer.

## Start over, not Change prediction (2026-11-07 rule)
**Not met.** There is no "Start over" and no "Change prediction". `handleStart` clears the guess (`:186`), so the learner can choose another speed and guess again. Needed: as described above.

## Updated size
**Medium → Large** (was Medium): the Parts layout; labels, ticks and axis names on the canvas; a dark ground and a white marker with a YOUR GUESS box; "Where the real picture comes from"; the diagram follows the speed in Part 2 with "Runs so far"; a rewritten caption with a worked moment; the words box; links (search and fetch); Start over; the results and tutor held until the diagram finishes; the tutor's marking and the 0c fix; the specification update; and tested module functions. Files: `Experiment8.tsx`, `Experiment8Tutor.tsx`, `Experiment8Sketch.tsx` (unchanged, perhaps one caption line), `spacetimeDiagramView.ts` and `.test.ts`, `07-...`-style draft wording, the specification and `DEVELOPMENT-STATE.md`. The new draft wording would live in `08-draft-wording.md`.

## Questions for the owner before drafting (suggested defaults follow the answers given for Relativity 1 to 7)
1. **Gaps:** fix all of the above? Default: yes, all.
2. **Settings:** Part 1 fixed at 0.5c; the speed (0c baseline, 0.1c, 0.3c, 0.5c, 0.8c, "Other" 0.01c to 0.9c) moves to Part 2, which opens at 0.8c? Default: yes.
3. **Results and tutor held until the diagram has finished drawing** (and `onComplete` then)? Default: yes.
4. **The guess marker:** a white ring and a YOUR GUESS box on the guessed dot (back or front), and for "both at the same time" a white bracket joining the two dots, with the caption saying each is only a marker? Default: yes.
5. **A dark ground for the diagram,** so that the white marker shows and the lines stand out? Default: yes.
6. **Labels on the canvas:** axis names with arrows, tick marks and units, names on each line and dot? Default: yes.
7. **Caption:** "How to read this diagram" in sections, a worked moment at 0.5c (back end at 0.144 s, front end at 0.433 s, gap 0.289 s), and three-part look-fors? Default: yes.
8. **Results:** no "Actual result" line next to the guess, the guess shown as a block with a tag on the event-time rows, and a note under each block? Default: yes.
9. **Tutor:** names the white marker, marks the guess with no score, and the 0c wording problem goes away with question 2? Default: yes.
10. **Introduction:** keep the order, use the chapters' titles instead of numbers, define "light-second" where it is first needed, add the statement about predictions and the controls? Default: yes.
11. **Reading guide:** no check-up or setting-following table? Default: yes.
12. **Links:** search for plain official pages on spacetime diagrams and worldlines, hold back any page that gives the result, and **for Minkowski 1908, link it after the explanation or record a gap?** Default: record a gap.
13. **Words box:** the terms above and one formula entry ("time = distance ÷ speed", light covering 0.2 light-second in 0.2 s), with the arrival-time formulas withheld? Default: yes.
14. **Buttons and card:** switch to the shared classes? Default: yes.
15. **Replay and Start over:** keep Replay, add an always-visible Start over? Default: yes.
16. **Size:** accept Medium → Large? Default: yes.

## Not checked (re-read)
The page was not run in a browser; narrow widths were not looked at; no source page was searched or fetched for the links list. The numbers quoted (0.433 light-seconds, 0.144 s, 0.433 s, 0.289 s at 0.5c) come from the module's formulas by hand, not from running the page. The 0c bug was found by reading the tutor's text against `actualOrderFor`; it was not reproduced in the browser. The line numbers in this section are from the files as read on 2026-11-10.
