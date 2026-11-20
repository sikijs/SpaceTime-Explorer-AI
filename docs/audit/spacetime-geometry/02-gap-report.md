# Gap report: Spacetime Geometry Experiment 2 (Light Cones: Which Events Can Affect Which)
Date: 2026-11-02 | Specification: docs/experiments/spacetime-geometry/02-light-cones.md | Components: src/components/LightConesExperiment.tsx, src/components/LightConesTutor.tsx | Physics module: src/physics/lightCones.ts (tests: lightCones.test.ts, 13 cases) | Status: read-only, nothing changed

## Summary
One three-way prediction, a space-time drawing with a 9-second playback of a flash of light, a six-column results table and a bar drawing, and a four-step tutor. Built to the older rule: the guess is a sentence beside the results and in the tutor. Missing against the newer rules: guess mark, "Where the real picture comes from", check-up, "What this table tells us", three-part "what to look for", and a note that predictions do not change the pictures. The setup caption (visible before the run) explains the cone's teal and rose regions, which is a possible early hint (C7). Size: **Medium** (the answer has a natural home, the cone regions in the Diagram, so the marker needs no new picture; a new tested helper and wording are needed).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "Could something that starts at O, and never goes faster than light, arrive at B in time to be there when B happens?" (LightConesExperiment.tsx:537-540) | "Yes, and it could be slower than light" / "Yes, but only light itself could do it" / "No, not even light could" (:17-21); `prediction` state (:393); cleared when event B changes (:500), kept when the observer's speed changes (:523) | Event B's position relative to the cone in the Diagram: inside the teal region, on the yellow edge, or in the rose region (drawn only when the run completes, :121-146). |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `result` is a `useMemo` of (event, speed) only (:428); Diagram and ResultsBars take event and speed, not the guess (:584, :684). | None. |
| A2 | Not met | No white mark anywhere in the file. | White marker and "YOUR GUESS" box joined by a line to the region (inside / edge / outside) the guess names, in the completed Diagram. |
| A3 | Not met | The guess is a three-way answer with no size. | Would be a marker on a region, with a caption sentence saying it marks only the guess. |
| A4 | Would need care | Regions are drawn only at `complete` (:121, :179). A mark naming a region should appear only then (not during the playback, not at setup, which deliberately hides the cone, :86-89). | Draw the mark inside the `complete &&` blocks. |
| A5 | N/A | The picture exists (the Diagram). | None. |
| A6 | Not met | No such line under the Diagram (:585-638) or the bars. | Add: the cone and regions are calculated here (flash at 1 light-second per second; Lorentz transformation of Experiment 11); nothing measured, nothing imagined. |
| A7 | Not met | Introduction (:440-486) has no sentence about predictions and pictures. No note beside the two controls (:488-533). | Add the sentences; say the event and speed controls change the drawings, the guess does not. |
| A8 | Not met | Module exports `classifyEventPair`, `speedNeeded`, `runLightConeExperiment` (lightCones.ts:17, :25, :72). | A tested function mapping each answer to the region it names and returning the real region, so the interface types nothing. |
| A9 | Partly | Observe prompt points to "the drawing of the flash" (Tutor:102). Compare quotes the guess, the two numbers and the "Which case" column (:104). No mark to name. The explanation never says whether the guess matched (:146-208). | Prompts to name the marks; owner to decide whether the explanation marks the guess. |
| A10 | Not found in learner text | Only a code comment (:427). | Nothing to remove. |

## Rule B
- **B0.** One table, six columns (Observer, time, distance, time² − distance², speed needed, Which case) with a one-line key (:647-682), and a bar drawing (:684). No other blocks.
- **B1. Not met.** No check-up. A real reference exists inside the physics: the sign of time² − distance² must match "speed needed" below, at or above 1, and the passing observer must agree with the lab (spec; tests lightCones.test.ts:36-72). No outside value needed.
- **B2. Not met.** No "What this table tells us". The tutor's points 3 and 4 hold the content (Tutor:161-187) but only after the tutor.
- **B3. N/A (suggested).** The speed control only moves the second row; the first row, the cone and the case never change.
- **B4. Partly.** The guess is a sentence (:645); no tag on the "Which case" row.
- **B5. Not met.** No new comparison numbers.

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Met (with one doubt) | O (:269), B and its time/distance (:277-282), axes titles and units (:233, :249), the flash front (:159), the key for the four regions (:180-188), "past" (:262), the passing observer (:214-219). | The B label sits above its dashed guides; not viewed in a browser, so overlap for events near the edge (5 ls, 3 s) is unchecked. |
| C2 | Partly | The event control moves B and recolours the picture; the passing observer's speed only flips an arrow whose length is fixed (:194-213) and changes the label. | The speed's size has no visible effect in the Diagram, only in the table. |
| C3 | Met | Captions at :587 and :687. | None. |
| C4 | Partly | Diagram caption lists the two grey lines, O, B, observer, flash and regions (:591-628) in short bullets and says when the flash and regions appear. Results caption lists blue bar, pink bar, shared scale, block and its colours (:692-716). | The results caption does not explain the "Speed needed" or "Which case" columns' link to the cone (only a one-line key under the table, :679-682). |
| C5 | Partly | Intro has 2 s and 1 ls worked example (:471-475); results caption uses an invented 3 s / 2 ls example (:709-710). | No worked moment using the learner's own B (the tutor does, after the run, Tutor:161-166). |
| C6 | Not met | Both "What to look for" paragraphs are single paragraphs (:630-637, :718-723). | Rewrite in Look at / What it means / Why it matters; show the region items only once the cone is drawn. |
| C7 | Partly | The Diagram caption (visible from the start) explains teal "events that something slower than light could reach", rose "events that nothing could reach, not even light" and the grey past half (:621-627) before the guess is made; the three answer buttons use the same ideas. The setup deliberately hides the cone (:86-89), but the caption describes it. The intro also gives the speed-needed test (:471-475). | Owner to judge whether the pre-run caption gives away the classification. A fix would be to show the regions bullet only after the run. |
| C8 | Met | "event", "signal", "light-second", "light cone" are defined before the prediction (:452-461). "timelike / lightlike / spacelike" are introduced in the tutor only (Tutor:170-171) and not used earlier. | None. |

## Other findings
- **O1.** Per CLAUDE.md status the owner approved the 8 differences from the spec on 2026-10-13. The status table says the specification's Learning Objective 3 says "the sign of the interval" where it means the interval squared; the owner has not decided. No new conflict found.
- **O2.** (a) C7, the caption before the run. (b) The first prediction label "Yes, and it could be slower than light" is also the 'reachable' case name; the order of labels is not obviously arranged to avoid favouring any. (c) The tutor point 5 states "nothing can overtake it" and "Light's speed is the same for every observer (Experiment 5...)", a cross-reference using the learner's number for the Relativity chapter; fine. (d) Not source-checked: the 340 m/s sound speed (a standard value; no source in the spec read).

## What an update would touch, and its size
Files: LightConesExperiment.tsx (intro, Diagram marker, captions, results notes), LightConesTutor.tsx, lightCones.ts and lightCones.test.ts (answer-to-region helper), the specification (with owner approval), docs/DEVELOPMENT-STATE.md. Size: **Medium**.

## Not checked
Browser rendering of the Diagram (label overlaps at the extreme events, text sizes), narrow widths, keyboard use, other browsers, the specification's source table, the test bodies beyond their titles.

---

# Re-read 2026-11-19 (Step 1 of the audit, against the rules set after the first report)

Re-read against the four Parts and "Parts 2, 3 and 4 appear after the first Run", the links and words box on every page, "Start over, not Change prediction", and predictions drawn on the real picture. Read: the specification's overview, objectives, events, behaviour and implementation notes; the module in full (`lightCones.ts`); the component's state, introduction, both control groups, prediction, both captions and Results (`LightConesExperiment.tsx:385-740`); the whole tutor (`LightConesTutor.tsx:30-211`). Nothing changed. Not run in a browser; tests not run; the drawing code (`:30-385`) was not read beyond its colour constants.

## What is still true from the first report
No guess mark, no source line, no check-up, no "What this table tells us", no three-part look-fors, and the introduction does not say that guesses leave the pictures alone. The pre-run caption explains the regions (C7), and the speed's size has no visible effect on the drawing (C2).

## New findings
| # | Finding | Evidence | What it needs |
|---|---|---|---|
| N1 | **No four Parts.** One card holds the introduction, both controls, the prediction, Run, the diagram, the results and, below the card, the tutor. | :383-731 | Part 1 (predict, Run, the diagram), Part 2 (the event and speed controls and the drawing that follows them), Part 3 (results), Part 4 (tutor), each with the coloured line, heading and lead. |
| N2 | **The event is both a control and what the prediction is about.** Choosing event B clears the prediction (:456-459), and any change of event, speed or prediction calls `returnToIdle`, which removes the results and the tutor. The three answers are the three regions, so a fixed B in Part 1 shows only one of the three cases. | :437-441, :456-459, :476, :500 | A decision on what Part 1 shows (question 2 below). Whatever it is, a change in Part 2 must not remove Part 1's results, Part 3 or the tutor. |
| N3 | **The prediction can be changed freely, with no "Start over".** Clicking another answer silently resets the run. No lock sentence. | :500-504 | Always-visible "Start over" (greyed until a guess or run exists, and while running); the guess locks after Run, with the lock sentence. |
| N4 | **No "Want to know more?" list and no "Words and formulas" box.** "Event", "signal", "light-second", "light cone" are defined in the introduction (:425-436). "Timelike", "lightlike" and "spacelike" appear only in the tutor, so the box would list them but hold them back until after the run (§12). The specification used no outside source (spec Decision 10). | :408-451 | Both above Part 1. Links must be found and read: candidates to search are a plain official page on the light cone or on how fast things can affect each other (NASA, ESA or a university course), Minkowski 1908 (already read as a source at Spacetime Geometry 1) and NIST "The Meter". None fetched yet. Where no plain official page exists, §29 rule 3(c). |
| N5 | **Numbering and cross-references.** The heading reads "Experiment 2 — ...". The tutor says "Experiment 5, "Why can't light go faster?"" (point 5) and "the last experiment" (points 3, 4 and 6); the first is the Relativity chapter's number, the second means "The Interval". | :403; Tutor point 5, 3, 4, 6 | Heading in the audited pages' style; "Relativity of Time and Motion 5" and "The Interval" by name. |
| N6 | **The introduction teaches the test that answers the prediction.** "Working it out yourself" (:439-445) says to compare the speed needed (distance ÷ time) with 1: below 1 is reachable, 1 is light only. With a fixed B in Part 1, the learner can simply calculate the answer, so the guess is arithmetic, not a prediction (§12). The owner approved the wording on 2026-10-13. | :439-445; spec "Introductory text" | Owner to judge (question 3). |
| N7 | **Pre-run caption (C7) is firmer than in the first report.** Before the guess, the caption says teal is "events that something slower than light could reach" and rose is "events that nothing could reach, not even light" (:621-627), which are the first and third answer choices in other words. | :621-627 | Show the regions bullet and the "look at the region" sentence only after the run (question 5). |
| N8 | **The passing observer's speed has no visible effect in the diagram (C2).** The arrow length is fixed. In Part 2 the speed matters only in the table. | spec; :194-213 | In the Part 2 drawing, make the arrow length follow the speed, or say in the caption that only the direction shows (question 9). |
| N9 | **The guess mark has a natural home.** The regions are drawn when the run ends, so a white ring in the region each answer names (inside the cone, on the yellow edge, outside it), with a YOUR GUESS box joined by a line, sits on the real picture and needs no new panel. It is only a marker; it is not placed at B. | Diagram `complete` blocks (:121-146) | A white marker per answer, drawn only once the regions are drawn, with a caption sentence saying it is only a marker (question 4). |
| N10 | **Module has no function for the mark.** Exports are `classifyEventPair`, `speedNeeded`, `runLightConeExperiment`, `PRESET_EVENTS`, `EVENT_O`. | lightCones.ts:17, :25, :72, :61, :70 | New tested functions: the region each answer names, the real region, and the marker position (nothing existing changed). |
| N11 | **A check-up has a real reference inside the physics.** The passing observer must find the same time² − distance² as the lab and the same case, and "speed needed" must sit on the side of 1 that the case says. No outside value is needed. | spec; lightCones.test.ts:36-72 | A short "expected, found, a plain reading" table (question 6). |
| N12 | **Tutor.** The compare step restates the guess in words and quotes the two numbers and the "Which case" word. The explanation never marks the guess. | Tutor :60-64, :95-174 | Compare names the white marker; the explanation marks the guess first with no score (as at Spacetime Geometry 1 and Black Holes 5 to 9); Results stop saying "Your prediction was ..." (:630-634). |
| N13 | **Unsourced claims in the tutor.** The speed of sound (about 340 m/s) and "observers moving through the air do not all agree on how fast the sound goes" (point 5); "a fast jet can overtake the sound". The spec itself says none was checked (Decision 10). | Tutor :141-146, :160-166 | Fetch and read a source while drafting; record it in the source table, or reword. |
| N14 | **Learning Objective 3 still says "the sign of the interval"** where the sign belongs to the interval squared. The owner has not decided whether to edit it (recorded 2026-10-13). | spec "Learning Objective" 3 | Ask again (question 10). |

## Plan for Part 1
One Run and one diagram: the setup builds as before (ruler, O, B, the flash). After the run, the regions are drawn and, only then, the white YOUR GUESS marker appears in the region the guess names. Part 2 holds the event and speed controls. Part 3 holds the table with a note and the check-up. Part 4 is the tutor, which marks the guess.

## Size
Still **Medium**, leaning **M-L**: the Part split, a marker, new tested module functions, links and a words box, caption rewrites and a decision on what Part 1 shows.

## Questions for the owner (default first)
1. All gaps N1 to N14 fixed as listed? (default: yes)
2. **What does Part 1 show?** (a) One fixed event B and one fixed passing speed, all five events and five speeds in Part 2 (default: B = 5 s and 3 ls, the first preset and a "reachable" case, with the passing observer at +0.3c, the page's current default); (b) three events, one for each case, with three choice buttons, one Run that picks the next unrun one, and one prediction per event (more to build, and three guesses to carry).
3. Introduction's "Working it out yourself" (N6): move the speed-needed test out of the introduction into the tutor, keeping only the shout example, so the prediction is a real guess? (default: yes, you approve the replacement)
4. Guess mark: a white ring in the region the answer names, with a YOUR GUESS box and line, drawn after the run (N9)? (default: yes)
5. Pre-run caption (N7): show the regions bullet and the "which region B is in" sentence only after the run? (default: yes)
6. Check-up table of "expected, found" for the passing observer against the lab (N11)? (default: yes, one short table)
7. Results stop saying "Your prediction was ..." and the tutor marks the guess (N12)? (default: yes)
8. Links (N4): search for plain official pages, and apply §29 rule 3(c) where none is found? (default: yes, every link read first)
9. Speed in Part 2's drawing (N8): make the purple arrow's length follow the speed? (default: yes)
10. Learning Objective 3 (N14): change "the sign of the interval" to "the sign of the interval squared" in the Audit Update? (default: yes)
