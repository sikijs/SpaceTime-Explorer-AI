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
