# Gap report: Spacetime Geometry Experiment 4 (What You See Is the Past: Where Is the Spaceship, and Where Does It Look to Be?)
Date: 2026-11-02 | Specification: docs/experiments/spacetime-geometry/04-what-you-see-is-the-past.md | Components: src/components/SeeingThePastExperiment.tsx, src/components/SeeingThePastTutor.tsx | Physics module: src/physics/seeingThePast.ts (tests: seeingThePast.test.ts, 13 cases) | Status: read-only, nothing changed

## Summary
One three-way prediction (is the image's speed slower, the same or faster than the real speed), two pictures (a map of space and time with a looking dot, a past light cone and two squares; a distance graph that appears at Run), a speed table with a bar drawing, and a four-step tutor. Older rule: the guess is a sentence ("It is only recorded here, not marked right or wrong"). Biggest gaps: no guess mark; no "Where the real picture comes from"; no check-up or "What this table tells us"; "What to look for" lists are not three-part; and the introduction gives a full worked example and a postcard comparison before the prediction that point to the answer (§12). Size: **Medium** (the answer has natural homes, the slopes in Picture 2 and the bars; a marker and a tested helper are needed).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "Compared with the spaceship's real speed, how fast does its image seem to move across the observer's view?" (SeeingThePastExperiment.tsx:637-643) | "Slower than ..." / "The same as ..." / "Faster than the spaceship's real speed" (:18-22); `prediction` state (:458); cleared when direction or speed changes (:601, :623) | The slope of the dashed "looks to be" line against the solid "really is" line in Picture 2 (PositionPlot, :363-364), and the hollow against the solid bar in the speed drawing (SpeedBars, :426-435). Both exist only after Run. |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `run` comes from direction and speed only (:461); Diagram, PositionPlot and SpeedBars are given direction and speed (:687, :692, :914-918). The prediction is used only for the sentence (:861) and the tutor (:941). | None. |
| A2 | Not met | No white mark or "YOUR GUESS" box in the file. | A white marker with box and line on Picture 2 (beside the two line slopes) and/or on the SpeedBars (beside the hollow bar). |
| A3 | Not met | Three-way answer, qualitative. | A marker (slower / same / faster) with caption saying it is only a marker; or a white slope line at the guessed relation, owner choice. |
| A4 | Would need care | Picture 2 is shown from Run (:690-694) and the key labels appear with it; the speed bars only at completion (:855, :914). A mark on Picture 2 would have to wait for the lines to be drawn. | Draw once the two lines exist (or at completion). |
| A5 | N/A | Pictures exist. | None. |
| A6 | Not met | No such line under any picture (:696-852, :920-931). | Add: calculated here from straight-line motion plus the travel time of light (no relativistic formula, seeingThePast.ts:3); the spaceship is imagined, nothing was measured. |
| A7 | Not met | Introduction (:497-591) and "Your job" (:574-581) say nothing about pictures and guesses. No note beside the controls (:593-633). | Add. |
| A8 | Not met | Module exports `measuredPositionAt`, `seenAt`, `lookingRange`, `runSeeingExperiment` (seeingThePast.ts:45, :62, :55, :77). | A tested helper mapping each answer to a marker value and the real value. |
| A9 | Partly | Not fully read in the tutor's early steps; the explanation does not mark the guess (Tutor:100-178). Compare step quotes the guess (not reread line by line). | Read the compare prompt for wording; add mark names. Owner decides on explicit marking. |
| A10 | Met (older rule) | "It is only recorded here, not marked right or wrong." (:861-862). Code comment :7-11. | Report as current state; does not say the pictures ignore the guess. |

## Rule B
- **B0.** Results text with the guess (:858-863); a 2-row table, columns Distance / Time / Speed (:868-893); a "What each number means" list (:894-913); the SpeedBars drawing and its caption (:914-931).
- **B1. Not met.** No check-up. A real reference exists in the physics: the image's speed should equal v ÷ (1 − v) approaching and v ÷ (1 + v) receding (seeingThePast.test.ts:59-65, closed forms) and the same distance for both rows. No outside source needed (the spec says no relativistic formula is used).
- **B2. Partly.** "What each number means" gives a worked 4 ÷ 10 = 0.40c (:909-910) but is not headed "What this table tells us" and does not say what the learner's numbers mean or why they matter.
- **B3. N/A (suggested).** The direction and speed controls only change which of eight runs is shown.
- **B4. Partly.** A sentence (:860-862), no tag on the table row.
- **B5. Not met.** No new comparison functions.

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Mostly met | Picture 1: axes titles (:160-172), the lab's eye and clock line (:176-182), path start label (:197), past light cone label (:228), the looking dot (:233), "Where the spaceship really is now" and "looks to be" (:253-274), a top key (:135-139). Picture 2: title, key lines, axes (:318-358). Bars: names, "1 = the speed of light" (:413). | The dashed continuation of the path and the path's end square have no on-canvas label (:185-188). In Picture 2 the lines are named in the key, not on the lines. |
| C2 | Met | Direction and speed change the path, the cone and every number; the real and seen squares are solid and hollow. | None. |
| C3 | Partly | One caption "How to read these pictures" under both pictures (:697-852) and a short "How to read this drawing" for the bars (:921-926). The first caption stands beneath Picture 1 and is partly about Picture 2, which is not yet shown before Run (:690). | Not wrong, but caption for Picture 2 is not beneath it. |
| C4 | Mostly met | Names both pictures, lists each element with what it means (:712-750), explains the axes and "ls" (:523-525), a nine-step "what happens in order" list (:767-819). | Long; bars caption defines "1 = c" but not the solid/hollow link beyond one sentence (:923). |
| C5 | Met | Worked moment with numbers (0.4c, 8 s, 1.8 and 3 ls) (:822-829); also an intro example (:564-573); tutor uses the learner's numbers (Tutor:100-112). | None. |
| C6 | Not met | "What to look for" is a 4-step list (:832-851) and one paragraph (:927-930); no Look at / What it means / Why it matters; the list asks questions and does not state the meaning. | Rewrite in three parts; show each only once drawn. |
| C7 | Not met (judgment) | Before the prediction the page gives (a) the postcard comparison: cards arrive "less than a day apart" for an approaching friend and "more than a day apart" for a receding one (:499-503); (b) a full worked example: 0.4c approaching, image speed 4 ÷ 6 = 0.67c against 0.4c (:564-573); (c) in the always-visible caption "The hollow square ... sits lower than the dot" (:747). Together they state the answer's mechanism and one answer's size. The tutor repeats the postcard comparison as its example 2 (Tutor:~126-134). | Owner to decide (§12). Same pattern as Experiment 3's pre-run material. The specification may have allowed it (not checked). |
| C8 | Met | Telescope, light-second, measured and seen position, looking time, image, past light cone all defined before use (:515-550). | None. |

## Other findings
- **O1.** CLAUDE.md status says the owner approved the introduction, captions and the differences from the spec on 2026-10-14. The code comment at :17 says "(b) is never right; it is there because it is the natural guess", an internal note that conflicts with the page telling the learner "You are not graded" (:578); it is only a code comment.
- **O2.** (a) C7 above. (b) The tutor's "nothing travels along the image" has no source check, as the status table already records. (c) Tutor point 4 says "for a spaceship coming toward the lab at 0.6c or 0.9c you would see an image faster than light" when the run's image was not above c; the module test says approaching image exceeds c exactly when v > 0.5 (seeingThePast.test.ts:84), so 0.6 and 0.9 are right, but 0.5c approaching gives exactly 1. Not an error. (d) The caption (:699-700) says Picture 2 "appears when you press Run" but the always-shown caption also describes it before that.

## What an update would touch, and its size
Files: SeeingThePastExperiment.tsx (intro, PositionPlot and/or SpeedBars markers, captions, results notes), SeeingThePastTutor.tsx, seeingThePast.ts and seeingThePast.test.ts (marker helper), the specification (with approval), docs/DEVELOPMENT-STATE.md. Size: **Medium**; the intro's worked example may need removal or move (owner decision), which is a wording-only change.

## Not checked
Browser rendering (label collisions at 0.9c, long caption), narrow widths, keyboard, other browsers, the specification's source table, the first tutor prompts' exact wording, test bodies beyond titles.
