# Gap report: Spacetime Geometry Experiment 1 (The Interval: One Number Everyone Agrees On)
Date: 2026-11-02 | Specification: docs/experiments/spacetime-geometry/01-the-interval.md | Components: src/components/SpacetimeIntervalExperiment.tsx, src/components/SpacetimeIntervalTutor.tsx | Physics module: src/physics/spacetimeInterval.ts (tests: spacetimeInterval.test.ts, 9 cases) | Status: read-only, nothing changed

## Summary
One prediction (3 buttons), a setup drawing with a run, a results table plus a bar drawing, and a four-step tutor. It is built to the older rule: the guess is shown only as a sentence ("Your prediction was: ...") and in the tutor. No guess mark, no "Where the real picture comes from", no check-up, no "What this table tells us", and the two "what to look for" paragraphs are not in Look at / What it means / Why it matters form. No "Want to know more" list (Rule D does not apply to this group). Size: **Medium** (one new physics-module helper, a marker panel on the results drawing, new reading-guide notes, caption rewrite).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "What do you expect the number time² − distance² to be for the lab, compared with the clock's own frame?" (SpacetimeIntervalExperiment.tsx:402-406) | Bigger in the lab / The same in both / Smaller in the lab (:25-29); stored in `prediction` state (:254) | The green "time² − distance²" blocks in the results drawing, lab row vs clock row (:229-232). That drawing exists only after the run. |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `result` is a `useMemo` of the two speeds only (:260); `ResultsBars` and the table take `observers` built from `result` (:261-265). Comment at :259 says so. | None. |
| A2 | Not met | No white mark or "YOUR GUESS" anywhere in the file. | A white mark, box and line on the results drawing at the lab row's green block, set against the clock-frame row's. |
| A3 | Not met | Prediction is a three-way choice with no size of its own. | Would be a marker (bigger / same / smaller), with a caption line saying it is only a marker. |
| A4 | N/A now / would need care | No mark exists. The results drawing appears only at run end (:490), so a mark there would be drawn after the feature. | Keep it in the results drawing, not the setup drawing. |
| A5 | Partly | The predicted quantity does have a picture (green blocks), but those blocks are deliberately drawn the same length in every row (:187-189, :229) so a guess has no length scale to sit on. | A small side panel on the results drawing with its own scale (value of time² − distance² per row) so a guess can be set beside it. Owner decision on whether this clutters. |
| A6 | Not met | No such line under either picture. | Add under the results drawing: calculated here from the Lorentz transform of Experiment 11 and the time-dilation factor of Experiment 3 (spacetimeInterval.ts:39-41); nothing measured. |
| A7 | Not met | Introduction (:315-353) has no sentence about predictions and pictures. | Add the two sentences; note that the two speed controls change the setup and results drawings. No note beside the controls (:355-391). |
| A8 | Not met | Module has `intervalSquared`, `runIntervalExperiment` only (spacetimeInterval.ts:8, :42). | Add a tested function that returns the guess's marker value and the real lab/clock values; the real values exist already. |
| A9 | Partly | Tutor compare step restates the guess in words and quotes the three numbers (SpacetimeIntervalTutor.tsx:67-68, :14-18). It does not point to a mark (none exists). It does not tell the learner whether the guess matched, even in the explanation (:110-152). | If marks are added the prompt must name them; whether the explanation should mark the guess is for the owner. |
| A10 | Not found in learner text | Only a code comment: "the physics result does not depend on the prediction" (:259). The results line repeats the guess (:493-496). | Nothing to remove; the learner is never told the pictures ignore the guess. |

## Rule B
- **B0.** One results block: a 3-row table (Observer, time, distance, time² − distance²) (:497-519) and a bar drawing (:521). No other tables.
- **B1. Not met.** No check-up. A real reference exists and is internal to the physics: the interval for a clock equals its own face time, 1.00 (spec item 10; tutor point 4, Tutor:138-143), so a "expected 1.00 / found" check for each row is possible. No outside published value is needed.
- **B2. Not met.** No "What this table tells us". The tutor's explanation (:112-121) carries similar content but only after the tutor.
- **B3. N/A (suggested).** The two speed controls only move the same invariant; the table already shows it. Owner decision.
- **B4. Partly.** One sentence of the guess (:495), no tag on the table row.
- **B5. Not met.** Nothing computed for a comparison beyond the existing readings.

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Partly | Setup: ruler title (:85-87), tick 0 (:140), tick 1 (:155-160), passing observer (:111-113), moving clock (:169). Results: row names (:218), "Time and distance (one scale)" and "time² − distance²" headings (:207-212), value labels (:222, :227). | The orange path line (:135) and the blue/orange squares carry no on-canvas "distance covered" label; the passing observer's purple square is labelled only by text below it. Row name "The moving clock itself (the clock's own frame)" is long at font 12 in a 460-wide box (not checked in a browser). |
| C2 | Partly | Clock speed moves tick 1 (:63-66). The passing observer's speed changes only the arrow direction (:91-109; the arrow length is fixed) and the label. | Passing speed magnitude has no visible effect in the setup drawing, though it changes the third results row. |
| C3 | Met | Both pictures have a "How to read ..." caption (:450, :524). | None. |
| C4 | Partly | Setup caption lists the ruler, blue, orange, green and purple squares (:454-481). Results caption lists blue bar, pink bar, scale, green block (:529-554), says what each means and defines "ls", "s" (:236-238). | Says the orange line "is the distance ... as the lab measures it" but the on-canvas elements are described, not "when they appear" for the stages beyond green square. Short bullets: yes. |
| C5 | Partly | Setup: 0.6c puts tick 1 at 0.75 light-seconds (:467-468). Results: a generic example of 3 s and 2 ls (:549-550), not from a real run. | A worked moment using the learner's own run numbers, or the 0.6c case (1.25 s, 0.75 ls, 1.5625 − 0.5625 = 1, which the test already checks). |
| C6 | Not met | Both "What to look for" are single paragraphs (:482-487, :555-560). | Rewrite as items in Look at / What it means / Why it matters. Show each item only when its feature is drawn (the green blocks only after the run). |
| C7 | Partly | The setup caption reveals nothing (:483-486, "measurements ... appear after you run"). The prediction text says the lab sees the ticks "farther apart in time and in space than the clock's own face shows" (:402-405), which is a factual lead toward "bigger". | Owner to judge whether that sentence primes the answer (see O2). |
| C8 | Met | "event", "light-seconds", "c" are defined in the introduction before use (:328-352); time² − distance² worked example before the prediction (:396-400). "Interval squared" and "interval" are defined only in the tutor (Tutor:117-120) and not used earlier. | None. |

## Other findings
- **O1.** No conflict found with the specification: three answers and three observers match (spec Decision list; code :25-29, :261-265). Specification's "Implementation Notes" differences were approved 2026-11-02 (per CLAUDE.md status).
- **O2.** (a) Prediction text :402-405 may lead toward "bigger" (see C7). (b) The tutor never says whether the guess was right; the compare step only restates the numbers (Tutor:67-68). Under the older rule that is the current design; under the newer rule §14 item 2 says the tutor marks each prediction in its explanation. Owner to decide. (c) The experiment's `onComplete` is called when the playback ends, not at the tutor (:297); that is the intended design, noted only.

## What an update would touch, and its size
Files: SpacetimeIntervalExperiment.tsx (introduction, results drawing marker panel, captions, results notes), SpacetimeIntervalTutor.tsx (compare prompt and prediction marking), spacetimeInterval.ts and spacetimeInterval.test.ts (marker/comparison helper), the specification (only with owner approval), docs/DEVELOPMENT-STATE.md. Size: **Medium**.

## Not checked
Rendering in a browser (text overflow in row names, marker placement), narrow widths, other browsers, keyboard use, the specification's source table (the spec states no outside sources were used), the tests beyond their titles.
