# Gap report: Spacetime Geometry Experiment 8 (The Doppler effect: why a fast traveler sees the colors of the sky shift)
Date: 2026-11-02 | Specification: docs/experiments/spacetime-geometry/08-doppler-shift.md | Components: src/components/DopplerShiftExperiment.tsx, DopplerShiftTutor.tsx | Physics module: src/physics/dopplerShift.ts (+ dopplerShift.test.ts, 24 cases) | Status: read-only, nothing changed

## Summary
Two predictions (colour of the star straight ahead, colour of the star the lab sees sideways), one speed control, three pictures (lab sky, traveler's sky, a spectrum bar), a Results panel (one table of seven stars plus three bullets) and a tutor that marks each prediction "matched / did not match" in its explanation. Older rule: guesses shown as text only. Biggest gaps: no guess marks (the pictures already use a dashed white ring for the star ahead, which the new rule reserves for the learner's guess: O1); no check-up or table note; bare "What to look for". Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Colour of the star straight ahead as the traveler sees it (DopplerShiftExperiment.tsx:595-604) | bluer / same / redder (PREDICTION_CHOICES :66); state predictionAhead :431 | Spectrum bar: the traveler's mark for the star straight ahead (row "star straight ahead"), and the traveler's sky dot for that star. Both exist. |
| 2 | Colour of the star the lab sees sideways (:607-615) | same choices; state predictionSideways :432 | Spectrum bar row for the followed star, and its dot in the traveler's sky. Exist. |
Both clear when the speed changes (:578-579).

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | doppler = runDoppler(speed) drives the pictures and tables; predictions only reach text :892-893 and the tutor :~930 | |
| A2 | Not met | no "YOUR GUESS" | White box and line on the spectrum bar at the guessed side of the lab's line, one per prediction. |
| A3 | Not met | | Answers are bluer/same/redder with no size: use markers placed left or right of the lab's line, say so in the caption. |
| A4 | Not met | | Draw once the traveler's mark for that star is on the bar (after the traveler's sky is built). |
| A5 | Met | the bar exists | |
| A6 | Not met | none | Add: calculated here by the Doppler formula; the light's single colour of 550 nm and the 24 stars are imagined for the question (the real stars send mixtures, per the intro's assumptions :555-558). |
| A7 | Not met | "You are not graded" :553 | Add the new-rule sentence and a note by the speed control. |
| A8 | Not met | module has frequencyFactorOf, wavelengthNm, rangeOf, runDoppler (dopplerShift.ts:40-113); no guess-mark function | Add mark positions per answer, tested. |
| A9 | Partly met | Tutor marks both predictions in the explanation: "Your prediction matched / did not match" (DopplerShiftTutor.tsx:123-126), as the spec chose; the compare prompt quotes the guess (:76); prompts do not name a white mark | Point prompts to the marks by name once they exist. |
| A10 | Met (older rule) | "They are only recorded here. The tutor's explanation, further down, compares them with the result." :892-894; "You are not graded" :553, :622 | Not a fault; it does not say the pictures never change with a guess. |

## Rule B
- B0. Results (:884-955): "What you ran" text with guesses; table "The seven stars" (lab angle, traveler angle, shift factor, wavelength, range); bullets "The counts", "Where the factor is exactly 1", "The number D".
- B1. Not met. A real reference: the module's own formula is the same physics; a published value for Doppler shift would be the siren/Sun comparisons in the tutor, which the spec marks as unsourced. A check-up could read "same / more / less" only.
- B2. Not met: the table has a lead line (:895-898) and three bullets that say what each number is, but no "What this table tells us" with meaning and why it matters.
- B3. N/A (optional): the speed control only moves marks in the pictures.
- B4. Partly met: guesses as a sentence (:891-894); no row tag. The rows for 0 degrees (ahead) and 90 degrees (sideways) would carry the tags.
- B5. Partly met: all numbers from runDoppler; no comparison functions.

## Rule C
- C1. Met for what was read: "straight ahead (0°)", "straight behind (180°)", sideways stars, "the star we follow", direction of travel, wedge counts (:726-743 text); SVG texts not all read.
- C2. Met: lab dots all yellow-green, traveler's dots take the shifted colours or UV/IR markers; speed changes them.
- C3. Met: "How to read this diagram" :702 picture by picture.
- C4. Met: three pictures named, each element listed, nm, UV/IR, frequency defined (intro :510-540), order of appearance given, after-run "stages" described (:789, :817).
- C5. Met: worked moment :841-845 (550 nm halfway along 400 to 700 nm); after the run "Reading your run" gives real numbers (:847-868, only after the run, good for §12).
- C6. Not met: four bare questions (:874-883).
- C7. Met: the comments and wording keep the shift direction out before the run (:697-699, :493-495).
- C8. Met for what was read: frequency, wavelength, nm, UV, IR, blueshift/redshift, shift factor, θ all defined before use (:510-540). "Time dilation" used only in the tutor (D).

## Other findings
- O1. White is used in the existing pictures: "The dashed white ring on the right-hand star marks the star straight ahead" (:735, :789, :817). CLAUDE.md §14 says white always means the learner's guess, so adding guess marks would clash. Report only; owner decides the colour.
- O2. (a) Tutor claims with no source check per the module comment (siren, galaxy redshift, DopplerShiftTutor.tsx:22, :172); the spec says the 400-700 nm range and 550 nm yellow-green have no source check. (b) The Results sentence "The tutor's explanation, further down, compares them with the result" (:893-894) is consistent with §12 but is the older rule's text. (c) The intro states that the Experiment 7 note and "Redshift ... in Experiment 2 of Gravity and Curved Spacetime" (:518-519): a cross-reference with learner numbering that was not checked.

## What an update would touch, and its size
Files: DopplerShiftExperiment.tsx (picture marks, results, wording), DopplerShiftTutor.tsx, src/physics/dopplerShift.ts and .test.ts, the specification. The white-ring clash needs an owner decision. Size: **Medium** (two predictions, marks on one or two pictures, table notes, look-for rewrite).

## Not checked
SVG internals of the three pictures, REFERENCE_ENTRIES and FORMULA_ENTRIES text, the middle of the Picture 2 caption (:760-840), the tutor explanation paragraphs, no browser run, tests not re-run.
