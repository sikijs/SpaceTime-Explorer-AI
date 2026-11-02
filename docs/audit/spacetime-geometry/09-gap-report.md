# Gap report: Spacetime Geometry Experiment 9 (The traveler's whole sky: direction, color and brightness together)
Date: 2026-11-02 | Specification: docs/experiments/spacetime-geometry/09-the-travelers-whole-sky.md | Components: src/components/TravelerSkyExperiment.tsx, TravelerSkyTutor.tsx | Physics module: src/physics/travelerSky.ts (+ travelerSky.test.ts, 16 cases; reuses dopplerShift.ts and aberration.ts) | Status: read-only, nothing changed

## Summary
Two predictions (brightness of the star straight ahead and of the star the lab sees sideways), one speed control, three pictures (lab sky, traveler's sky built in three layers, a log-scale brightness bar), a Results panel with one seven-star table and three bullets, and a tutor that marks both guesses "matched / did not match" in its explanation. Older rule: guesses are text only. Biggest gaps: no guess marks; no check-up or "What this table tells us"; bare "What to look for"; the pictures already use a dashed white ring for the star ahead (clash with "white = guess", O1). Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Brightness of the star straight ahead (TravelerSkyExperiment.tsx:657-666) | brighter / same / dimmer (PREDICTION_CHOICES :62); state predictionAhead :466 | Picture 3, the brightness bar (log scale), the mark for the star straight ahead (left or right of the blue line at 1); also its glow in the traveler's sky. |
| 2 | Brightness of the star the lab sees sideways (:669-677) | same choices; state predictionSideways :467 | Picture 3, the mark for "the star we follow". |
Both clear on a speed change (:640-641).

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | traveler = runTravelerSky(speed) (module); predictions go only to text :925-926 and the tutor | |
| A2 | Not met | no "YOUR GUESS" | White box and line on the brightness bar, one per prediction, on the guessed side of 1. |
| A3 | Not met | | Answers have no size: use markers on the "brighter" or "dimmer" side, say so in the caption. |
| A4 | Not met | | Draw only once the traveler's brightness marks are on the bar (layer 3). |
| A5 | Met | bar exists | |
| A6 | Not met | none | Add: calculated here by the brightness formula; the 24 stars and their equal brightness are imagined. |
| A7 | Not met | "You are not graded while you predict. The tutor will compare your predictions with the result afterwards." :614-615 | Add the new-rule sentence and a note beside the speed control. |
| A8 | Not met | module exports brightnessFactorOf, brightnessFactorFromTravelerAngle, runTravelerSky (travelerSky.ts:15-51); no guess-mark function | Add mark positions for each answer, tested. |
| A9 | Partly met | Explanation marks both: "Your prediction matched / did not match" (TravelerSkyTutor.tsx:125-128); the compare prompt quotes the guess (:78); prompts do not name a white mark | Point prompts to the marks by name once added. |
| A10 | Met (older rule) | "They are only recorded here. The tutor's explanation, further down, compares them with the result." :926-927; "You are not graded" :614, :684 | Not a fault; it does not say the pictures never change with a guess. |

## Rule B
- B0. Results (:916-985): "What you ran" with guesses; table "The seven stars" (lab angle, traveler angle, colour shift factor, wavelength, range, brightness factor); bullets "The counts", "Where both factors are exactly 1", "The number D".
- B1. Not met. Reference: the module's own formula; the spec says the brightness formula was checked only against two secondary sources (Oikofuge, Baez FAQ), so no published numbers to compare. Use "same / more / less" only if a check-up is wanted.
- B2. Not met: a lead line (:929-933) and bullets, but no "What this table tells us" with meaning and why it matters.
- B3. N/A (optional): the speed control only moves marks in the pictures.
- B4. Partly met: guess sentence only (:925-926); no row tag. Rows for 0 and 90 degrees would carry the tags.
- B5. Partly met: all numbers from runTravelerSky; no comparison functions.

## Rule C
- C1. Met for what was read: the labelled stars, direction of travel, "×4.00" labels on labelled stars (:840-844), glow, wedges and the bar's "0.1, 1, 10, 100" scale. SVG texts not all read.
- C2. Met: lab vs traveler skies differ in glow size, colour and position; speed changes them.
- C3. Met: "How to read this diagram" :766, picture by picture.
- C4. Met: three pictures named, layers described in order, wedges, bars and the logarithmic scale explained (:871-880), terms defined.
- C5. Met: worked moment :897-900 (reading the bar: 10 vs 0.1 vs 100), without giving the answer.
- C6. Not met: four bare questions (:907-912).
- C7. Met for what was read: the intro and caption avoid saying which way brightness changes (:550-552, :761-763). Nuance: the last look-for item "Do the stars with a bigger glow have anything in common with their colors?" (:912) hints at a result, but is shown only once the traveler's sky is drawn.
- C8. Met for what was read: photon, brightness (an instrument measure, not an eye), brightness factor, shift factor defined before use (:565-590).

## Other findings
- O1. The caption's "dashed white ring on the right-hand star marks the star straight ahead" (:802) uses white for something other than a guess; CLAUDE.md §14 reserves white for the guess. Report only.
- O2. (a) The spec says the brightness formula was checked only against secondary sources; the tutor's "1 ÷ D" counting argument and its rain remark have no source check (CLAUDE.md status entry for Experiment 9). (b) The rain everyday example is given in the introduction (:593-595) before the run; it is a general comparison, not an answer, but it hints that running into rain changes what reaches you, which is close to Prediction 1's answer; the owner approved it, but it could be viewed as a §12 hint. (c) Brightness is defined as what an instrument measures, not an eye (:578-580), consistent.

## What an update would touch, and its size
Files: TravelerSkyExperiment.tsx (picture 3 marks, results, wording), TravelerSkyTutor.tsx, src/physics/travelerSky.ts and .test.ts, the specification. Size: **Medium** (two predictions on one bar, a reading guide for one table, look-for rewrite, a colour decision for the white ring).

## Not checked
The middle of the caption (:770-850), SVG internals, REFERENCE_ENTRIES text, tutor explanation paragraphs, no browser run, tests not re-run.
