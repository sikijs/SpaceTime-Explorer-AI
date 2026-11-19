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


---

# Re-read (2026-11-19)
Re-read against the rules set after the first report: the four Parts and "Parts 2, 3 and 4 appear after the first Run", the links and words box on every page, "Start over, not Change prediction", and predictions drawn on the real picture. Read: the specification's prediction, behaviour and implementation notes, the module in full, the component's state, introduction, controls, prediction, both captions and Results (`SpacetimeIntervalExperiment.tsx:243-577`), the tutor's steps (`SpacetimeIntervalTutor.tsx:40-156`). Nothing changed. Not run in a browser; tests not run; the SVG bodies (:60-240) were read only for colours and constants.

## What is still true from the first report
No guess mark, no source line, no check-up, no "What this table tells us", no three-part look-fors, one fixed-length green block so a guess has no scale, the tutor never marks the guess (O2b), and the introduction does not say that guesses leave the pictures alone.

## New findings
| # | Finding | Evidence | What it needs |
|---|---|---|---|
| N1 | **No four Parts.** One card holds the introduction, both speed controls, the prediction, Run, the setup picture, the results and (below the card) the tutor. | :313-575 | Part 1 (predict, one Run, setup picture, results picture), Part 2 (the two speed controls and the drawings that follow them), Part 3 (results table), Part 4 (tutor), each with the coloured line, heading and "What we are about to do" lead. |
| N2 | **Parts 2 to 4 are not gated the new way, and the controls come before the prediction.** Results and tutor appear after the first Run (good), but the controls sit above Part 1's prediction and Run, and any change of speed or prediction calls `returnToIdle`, which deletes the results and the tutor. | :272-283, :490, :566 | Part 1 fixed on one pair of speeds (default: 0.6c clock, +0.5c passing observer, the worked case in the spec's tests); the speeds move to Part 2; changing a speed after the first Run must not remove the results of Part 1 or the tutor. Owner to confirm the fixed pair. |
| N3 | **Prediction can be changed freely, with no "Start over".** Clicking another answer silently resets the run. No lock sentence, no Start over button. | :280-283, :408-418 | Always-visible "Start over" (greyed until a guess or run exists, and while running); the guess locks after Run, with the lock sentence. |
| N4 | **No "Want to know more?" list and no "Words and formulas" box.** Terms ("event", "light-second", "c") are defined in one paragraph (:328-332); the formula time² − distance² and its worked example are in the prediction block (:396-400), not in a box. "Interval" and "interval squared" are not listed anywhere before the tutor. | :315-353 | Both above Part 1. The spec says no outside source was used (spec item 10, :303), so links must be found and read: candidates to search are a NASA or ESA or university-level page on the spacetime interval, light-seconds (NIST or NASA), and Einstein 1905 or Minkowski 1908 as the original source. None has been fetched. If no plain official page is found, record the gap as in §29 rule 3(c). |
| N5 | **Cross-references use group-local numbers.** "as the moving clock did in Experiments 3 to 5" (:336) and, in the tutor, "the idea from Experiment 1, the one-clock experiment" (Tutor point 4). In the Spacetime Geometry chapter these read as this group's Experiments 3 to 5 and 1. | :336; Tutor:138-143 | "Relativity of Time and Motion 3 to 5" and "Relativity of Time and Motion 1 (One clock)", per the audited pages' convention. |
| N6 | **Heading reads "Experiment 1 — ...".** | :311 | Match the audited pages' heading style. |
| N7 | **Early leak in the prediction block (C7 made firmer).** The sentence "the lab sees its two ticks farther apart in time and in space than the clock's own face shows" is true, but it also states that both numbers are larger for the lab, which steers the learner to "bigger" (time² and distance² both grow, and only the difference matters). The tutor later uses the same facts. | :402-405 | Owner to judge. Default: keep a version that asks the question without saying both numbers grow, and leave the facts to the observation (Part 1's table). |
| N8 | **Setup picture's passing speed has no visible effect (C2) and is not the learner's choice in Part 1 once fixed.** With the pair fixed, this matters less; it becomes a Part 2 drawing, where the arrow length should follow the speed. | :91-109 | In Part 2, make the purple arrow's length follow the speed, or say in its caption that only the direction shows. Owner to choose. |
| N9 | **Guess mark has no scale to sit on (A5 reconfirmed).** The green block is deliberately the same length in every row (:187-189, :229), and the results picture is drawn only after the run. Three answers (bigger / same / smaller) have no size. | :229, :490 | A marker for the lab row's green block with a white YOUR GUESS box and line, plus a small side panel with its own scale of time² − distance² per row so "bigger / same / smaller" is a visibly different position, with the caption saying the mark is only a marker. Owner to decide if the panel clutters. |
| N10 | **Dark-canvas colours.** No white is used in the pictures (greens, blues, pinks, a lime green block, slate text `#e2e8f0` and `#cbd5e1`), so a white guess mark does not clash. The pale ruler and tick text (`#cbd5e1`) is close to white, so the mark needs a heavy outline and the box. | :16-18, :55-58 | Check by eye in a browser. |
| N11 | **Module has no function for the mark.** `intervalSquared` and `runIntervalExperiment` only. A guess of "bigger/same/smaller" needs a position for the lab-row marker and the real lab and clock values on one scale, and a function for the Part 3 comparison. | spacetimeInterval.ts:8, :42 | New tested functions, nothing existing changed. |
| N12 | **Check-up (B1) has a real reference inside the physics.** For a clock the interval equals its own face time (1.00 s). A table "expected 1.00, found" per observer is possible; no outside value is needed. Whether a three-row check-up of the same number tells the learner anything the table does not is for the owner. | spec :303; Tutor point 4 | Owner to decide. |
| N13 | **Tutor.** Compare step restates the guess and the three numbers, with no verdict, and the explanation never marks it. The conceptual question ("Why might one combination of them stay the same?") is asked after the table already shows 1.00, 1.00, 1.00. | Tutor:67-68, :14-18, :110-152 | Tutor names the white mark and marks the guess in the explanation (as at Black Holes 5 to 9); the Results stop saying "Your prediction was ..." (:494-496) and show the guess only as a tag. Owner to approve. |
| N14 | **One quoted claim has no source.** The tutor's "That minus sign is what makes space and time together different from ordinary space" and the "interval" terms come from standard special relativity and the spec lists no outside source. | Tutor:130-136; spec :303 | Fetch and read a source while drafting; record it in the source table. |

## Plan for Part 1 (as at Black Holes 5 to 9)
Part 1 has one Run on a fixed pair of speeds. The setup picture builds as before (ruler, tick 0, the clock travelling, tick 1). After the run, the results picture shows the three rows and, only then, the white YOUR GUESS marker beside the lab row's green block and the new side scale. Part 2 holds the two speed controls. Part 3 holds the table with a note, and the check-up if the owner wants it. Part 4 is the tutor, which marks the guess.

## Size
Still **Medium**, leaning **M-L**: a marker panel, new tested module functions, the Part split, links and a words box with one worked formula, and caption rewrites.

## Questions for the owner (default first)
1. All gaps N1 to N14 fixed as listed? (default: yes)
2. Part 1 fixed on a 0.6c clock and a +0.5c passing observer, with both speed controls moved to Part 2? (default: yes)
3. Guess mark as a marker plus a small side scale for time² − distance² (N9)? (default: yes)
4. Early leak (N7): drop "farther apart in time and in space" from the prediction question? (default: yes, the owner approves the replacement)
5. Check-up of "expected 1.00, found" for each observer (N12)? (default: yes, as one short table)
6. Results stop saying "Your prediction was ..." and the tutor marks the guess (N13)? (default: yes)
7. Links (N4): search for plain official pages, and apply §29 rule 3(c) where none is found? (default: yes, every link read first)
