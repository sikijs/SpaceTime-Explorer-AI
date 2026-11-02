# Gap report: Spacetime Geometry Experiment 10 (A fast object looks rotated, not squashed)
Date: 2026-11-02 | Specification: docs/experiments/spacetime-geometry/10-rotated-not-squashed.md (and closing-synthesis.md) | Components: src/components/RotatedObjectExperiment.tsx, RotatedObjectTutor.tsx, SpacetimeGeometrySynthesis.tsx | Physics module: src/physics/rotatedObject.ts (+ rotatedObject.test.ts, 13 cases) | Status: read-only, nothing changed

## Summary
Two predictions (the photograph's shape, 4 choices; which other face the camera can see, 3 choices), one speed control, three pictures each with its own guide (lab ruler view, where the light left from, the photographs), a five-stage run, a Results panel (one table plus bullets) and a tutor that marks both guesses matched or not in its explanation. Older rule: text only. Biggest gaps: no guess marks; no check-up or table note; bare "What to look for"; and the pre-run caption and introduction describe the answers to both predictions (O2). Size: **M** (L if the caption is reworked for §12).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Shape of the photograph of the moving cube compared with the cube at rest (RotatedObjectExperiment.tsx:661-674) | squashed / same / stretched / turned (SHAPE_CHOICES :48-53); state predictionShape :454 | Picture 3 "photograph of the cube moving at ...c", the total width (and the turned-cube sketch). Exists, appears in stages 4 and 5. |
| 2 | Besides the front face, which other face can the camera see? (:676-687) | none / leading / trailing (FACE_CHOICES :54-58); state predictionFace :455 | Picture 3, the boxes named "front face" and the other face's box; also Picture 1's leading/trailing sides. Exists. |
Both clear on a speed change (:644-645).

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | result = runRotatedCube(speed) (module); predictions only reach text :866-868 and the tutor :923-933 | |
| A2 | Not met | no "YOUR GUESS" in the file | White box and line on Picture 3: for Prediction 1 an outline of the guessed width (squashed = ruler width, same = 1.00, stretched, turned); for Prediction 2 a marker on the leading or trailing side. |
| A3 | Not met | | Prediction 1 has a size for squashed/stretched (width) but "turned" and Prediction 2 have none: markers, caption says so. |
| A4 | Not met | | Draw only after the moving photograph exists (stage 4); the turned marker only after stage 5. |
| A5 | Met | Picture 3 holds both | |
| A6 | Not met | none | Add: calculated here by the module (the rays and widths); the cube and the camera far away are imagined for the question; no real photograph was taken (the spec states Terrell and Penrose from secondary sources). |
| A7 | Not met | "You are not graded while you predict. The tutor will compare your predictions with the result afterwards." :615-616 | Add the new-rule sentence and a note beside the speed control. |
| A8 | Not met | module exports frontFaceWidth, trailingFaceWidth, photographWidth, apparentTurnDegrees, runRotatedCube, sphereOutlineRadius (rotatedObject.ts:27-131); no guess-mark function | Add mark sizes for squashed/same/stretched/turned and face markers, tested. |
| A9 | Partly met | Explanation marks both: "Your prediction matched / did not match" (RotatedObjectTutor.tsx:125-127); compare prompt quotes the guess (:78); prompts do not name a white mark | Point prompts to the marks. |
| A10 | Met (older rule) | "They are only recorded here. The tutor's explanation, further down, compares them with the result." :868-869; "You are not graded" :615, :693 | Not a fault; it does not say the pictures never change with a guess. |

## Rule B
- B0. Results (:859-920): "What you ran" with guesses; one table (width by ruler, front face, trailing face, total photograph width, turn angle; rest vs moving); bullets "The turned cube's widths", "The leading face", "The number D".
- B1. Not met. Reference: the module's own values; the experiment shows a published prediction (Terrell and Penrose, 1959) which the spec checked only in secondary sources, so a check-up would rest on the page's own calculation; use "same / more / less".
- B2. Not met: a lead line (:871-874) and bullets only; no "What this table tells us" (what, meaning with numbers, why).
- B3. N/A (optional): the speed control only moves marks.
- B4. Partly met: guess sentence only (:866-869); no row tag. Prediction 1 maps to "Total width of the photograph" and "Turn angle"; Prediction 2 to "Trailing face in the photograph" and "The leading face".
- B5. Partly met: all values from runRotatedCube; no comparison functions.

## Rule C
- C1. Met for what was read: each picture has its own guide naming every label (:764-829), including "camera", "light going to the camera", "back/front/leading/trailing face", "total width". SVG strings not read.
- C2. Met: dashed rest square vs solid blue moving rectangle, then moving vs turned photographs, speed changes them.
- C3. Met: "How to read this diagram" :743 plus a guide under every picture.
- C4. Met: pictures named, each element explained, units (cube side, 1.00) defined :755-757, order described (:832-840).
- C5. Met: worked moments :772, :806-809 and :842-845.
- C6. Not met: three bare questions (:849-851).
- C7. Not met (O2 below).
- C8. Met for what was read: photograph, faces, contracted, turned, c defined (:529-552); "lab" and "at the instant of the photograph" defined in the caption (:750-752).

## Other findings
- O1. White is used for the "cube moves this way" arrow and the double arrow (:774, :800, :803); CLAUDE.md §14 reserves white for the learner's guess. Report only; owner decides the colour. The closing-synthesis section (SpacetimeGeometrySynthesis.tsx, shown after the explanation :936) was not read; it reads earlier experiments' functions and does not touch the prediction rule.
- O2. §12 hints before the run: (a) The caption's Picture 3 guide (visible from the start) says the turned sketch shows "front" and "side" faces as the two sides the camera can see, and that "back (hidden)" and "leading" face away from the camera (:826); this gives Prediction 2's answer (not the leading face; the side/trailing face is seen) and, with "turned by ...°" and "Same two widths" (:826-827, :839), Prediction 1's answer ("turned"). (b) The introduction's "What happens" stage 5 says the photograph is put beside the cube at rest "turned by some angle" (:607-609), and the title says "Looks Rotated, Not Squashed" (accepted by the owner, per the project status). (c) "The cube ... is not really turned" (:621). (d) The first caption line "A ruler finds a moving cube shorter ... at 0.6c 0.80" (:772) is the Experiment 6 result, not a hint. (e) Terrell and Penrose statements checked only in secondary sources and "near camera / eye" remark unsourced (status entry). (f) The intro cross-references "Experiment 6 of the first chapter" and "Experiment 4 of this group" (:517-518) use numbering that was not cross-checked. Not decided here.

## What an update would touch, and its size
Files: RotatedObjectExperiment.tsx (PhotographsPicture marks, results, caption), RotatedObjectTutor.tsx, src/physics/rotatedObject.ts and .test.ts, the specification (and closing-synthesis.md only if its reading changes). Size: **Medium to Large**: two predictions with four-way and three-way answers on one picture, a table note and check-up, and a caption rewrite for §12.

## Not checked
SVG internals of the three pictures (LabMeasuredPicture, LightPicture, PhotographsPicture), SpacetimeGeometrySynthesis.tsx, REFERENCE_ENTRIES and FORMULA_ENTRIES, tutor explanation paragraphs, no browser run, tests not re-run.
