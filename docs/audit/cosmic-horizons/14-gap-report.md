# Gap report: Cosmic Horizons Experiment 14 (What makes a white dwarf explode?)
Date: 2026-11-02 | Specification: docs/experiments/cosmic-horizons/14-what-makes-a-white-dwarf-explode.md | Components: src/components/WhiteDwarfExplosionExperiment.tsx, WhiteDwarfExplosionTutor.tsx | Physics module: src/physics/whiteDwarfExplosion.ts (+ .test.ts, 36 `it`s) | Status: read-only, nothing changed

## Summary
Already has Rule B (check-up, 3 notes in what/means/why form, predictions block; Table 4 removed by the owner on 2026-10-23) and the "do not change" wording. Remaining: Rule A marks, source lines, tutor prompts. Both predictions map to existing numbers: the mass in Picture 1, and the shell speed x age as a radius in Picture 3. Possible early reveal in a pre-run ESO link. Size **M** (smallest of the seven: the module already has numeric answer values).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives |
|---|---|---|---|
| 1 | How heavy was the white dwarf? (WhiteDwarfExplosionExperiment.tsx:731) | ~0.5 / ~1.0 / ~1.4 Suns (:411-415); `sizePrediction` | Picture 1 (five circles of white-dwarf sizes against the limit) |
| 2 | How fast has the outer shell moved on average? (:742) | ~50 / ~5,000 / ~300,000 km/s (:416-420); `speedPrediction` | Picture 3 (remnant seen from the front, shells at parsecs): guess x age gives a radius |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A1 | Met (not exhaustively traced) | PictureOne/Three take `yours` from controls (:173,:301); predictions go to the tutor (:1206); page says so (:922) | none |
| A2 | Not met | no YOUR GUESS | white box + line on Picture 1 and Picture 3 |
| A3 | Not met | | positions available (mass; radius) |
| A4 | Not met | Picture 3's look-for list gated by stage (:875); PictureOne has no stage prop | a guess mark on Picture 1 would be on from the start: owner/§12 check |
| A5 | N/A | pictures exist | |
| A6 | Not met | no source line | measured (shell radii, Das 2025/ESO), calculated here (radius of a white dwarf, speed = distance / age), imagined (trial settings, brightness change) |
| A7 | Partly met | "they do not change the pictures or the tables... shown again beside the results" (:682-683); controls note: "Your predictions do not change the pictures... These settings do... Picture 2 does not change, because it is a sketch" (:922-923) | missing "drawn in white" |
| A8 | Mostly met | `SIZE_ANSWERS` / `SPEED_ANSWERS` with numeric `value` (whiteDwarfExplosion.ts:147-163), `distanceTravelledPc` (:81), `sizeAnswer`, `speedAnswer` tested (2, 3 refs) | tests for guess-to-radius; check the values are exported and tested directly |
| A9 | Not met | prompt "Look at Picture 1... then Picture 3" (WhiteDwarfExplosionTutor.tsx:91-93); explanation marks (:136-146) | name marks |
| A10 | Met (older rule) | :682-683 | |

## Rule B
B0: predictions block (:970-978), check-up 5 rows (:994), Table 1 the white dwarf (:1039), Table 2 the remnant (:1092), Table 3 the two routes (:1155).
| Item | Result | Evidence |
|---|---|---|
| B1 | Met | rows with real reference, and two honestly marked "No published figure is used" (:1016-1030) |
| B2 | Met | notes at :1074, :1137, :1180; Table 1's is what it is / what it means / why it matters (:1076-1090) |
| B3 | N/A (owner removed Table 4, 2026-10-23) | controls still change Pictures 1 and 3 |
| B4 | Met | block, row tags "(the row for Prediction N)" (:1046, :1124); guess only |
| B5 | Met | `twoAnalysesComparison`, `shellSeparationInUncertainties`, `whereInRange`, `distanceErrorPercent` tested |
Remaining: none structural found.

## Rule C
- C1: Not checked visually (47 SVG texts, 4 aria-labels). C2: Met in code (white marks in Pictures 1, 3).
- C3: Met: illustration :621, Pictures :822, :849, :888.
- C4/C5: Met in structure; street-lamp moment :641; :829, :867, :900.
- C6: Met (structure): 10 triples, Picture 2's list gated (:875); Picture 1's list `lookForPictureOne` not gated (:836; check).
- C7: Possible early reveal (not verified): pre-run link "ESO: Double detonation... the 2025 finding in the observatory's own words" (:699-701) may state the white dwarf was below the limit (Prediction 1).
- C8: Partly checked.

## Rule D
- D1: Met in structure (dated, :694).
- D2: As C.
- D3: Met in structure: pre-run ESO, NASA Hubble, Chandra x3, ESA/Hubble (:699-719); 3 papers after the run (:1191-1199). Spec records gaps: no plain page for Type Ia as standard candles, "supernova remnant", "calcium shell", parsec, inverse-square law (spec :210, :216).
- D4: Met (= Rule B).

## Other findings
- O1: white = the learner's settings; to be changed if white means the guess.
- O2: Table 1's note says the two helium-layer figures "do not agree" while the check-up row for the weight says "Close": different quantities, but a learner may read them as conflicting.

## Rule E and re-read additions (2026-11-03)
- **E1 to E3 Not met.** The page below the introduction ran on in one column, with a "Now try it yourself" box and a "Results" heading but no Parts, coloured lines or leads.
- **The controls already change Part 1 pictures.** The weight, the age and the brightness difference add white marks to Pictures 1 and 3. Under the rule a learner's own setting is pink.
- **Colour clash found (O1 confirmed).** White was the learner's setting; now pink.
- **A4 answered.** Picture 1 had no stage prop, so a guess mark there would have shown the simulation's weight from the start; the strip is drawn from stage 3, when Picture 2 gives the weight, and Picture 1 now takes the stage.
- **Prediction 2 is a speed, drawn as a distance.** The shells are drawn as radii, so the guess is the distance that speed would cover in the remnant's age, on a log scale of parsecs, beside the two real shells.
- **Rule B already met.** The check-up, the notes and the guesses beside the results were kept as they were.
- **Defaults used.** The owner approved all default recommendations and wording in advance (2026-11-03).

## What an update would touch
WhiteDwarfExplosionExperiment.tsx (Pictures 1, 3, source lines, intro), WhiteDwarfExplosionTutor.tsx, whiteDwarfExplosion.ts/.test.ts, spec, DEVELOPMENT-STATE.md. Size **M**.

## Not checked
Browser rendering; ESO link contents; Picture 1's gating; Words panel.
