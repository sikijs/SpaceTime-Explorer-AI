# Gap report: Cosmic Horizons Experiment 13 (Catching a supernova in the act)
Date: 2026-11-02 | Specification: docs/experiments/cosmic-horizons/13-catching-a-supernova.md | Components: src/components/CatchingASupernovaExperiment.tsx, CatchingASupernovaTutor.tsx | Physics module: src/physics/catchingASupernova.ts (+ .test.ts, 49 `it`s) | Status: read-only, nothing changed

## Summary
Already has Rule B (check-up, 4 notes, predictions block, Table 4) and the "predictions do not change" wording. Remaining: Rule A marks; Prediction 2 (how long ago the star exploded) has no picture, so a panel must be added to Picture 2; source lines; tutor prompts; the white clash (white is both the learner's setting and the Sun's whole-life yardstick). Size **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives |
|---|---|---|---|
| 1 | What share of the collapse's energy is visible light? (CatchingASupernovaExperiment.tsx:875) | about half / 1 in 10 / 1 in 100 / 1 in 10,000 (:217-222); `sharePrediction` | Picture 3 (the three energy bars on a log scale; the light share) |
| 2 | How long before May 2023 did it really explode? (:887) | a few months / ~20 thousand years / ~20 million years (:223-227); `travelPrediction` | No picture shows it; Table 2 only. Nearest: Picture 2 (star and gas shells, years before) |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A1 | Met (not exhaustively traced) | Picture 2/3 take `yours` from controls (:332,:385); predictions go to the tutor (:1432); page says so (:1065) | none |
| A2 | Not met | no YOUR GUESS | white box + line on Picture 3 |
| A3 | Not met | | Prediction 1 has a position on the log scale; Prediction 2 too, once a panel exists |
| A4 | Not met | Picture 3 appears at a later stage; look-for lists are gated (:989) | |
| A5 | Needed for Prediction 2 | answer only in Table 2 / results (:1239) | add "when did it happen" panel (own scale, own title) to Picture 2; owner decides |
| A6 | Not met | no source line (grep hits at :1114, :1207 are other text) | measured (teams' mass estimates, distance), calculated here (collapse energy G M^2/R, light travel time), imagined (control values) |
| A7 | Partly met | "they do not change the pictures or the tables... shown again beside the results" (:823-826); controls note :1065-1066 | missing the "drawn in white" sentence |
| A8 | Partly met | `visibleShareAnswer`, `lightTravelAnswer`, `nearestLog`, `shareOf`, `oneInN`, `lightTravelYears` tested; answer values in `SHARE_ANSWERS`/`TRAVEL_ANSWERS` `oneIn` (catchingASupernova.ts:150-154, :172-176) but not exported | export the guess values; tests |
| A9 | Not met | observe prompt "Look at Picture 3..." (CatchingASupernovaTutor.tsx:114-116); explanation marks predictions (:159-169) | name marks |
| A10 | Met (older rule) | :823-826 | |

## Rule B
B0: predictions block (:1099-1107), check-up (:1123), Table 1 where did the energy go (:1168), Table 2 when and where (:1227), Table 3 mass estimates side by side (:1279), Table 4 your own numbers (:1317).
| Item | Result | Evidence |
|---|---|---|
| B1 | Met | 5 rows: collapse energy vs published range, blast energy vs two ranges, gas-shed years vs paper, mass "Not settled", neutrinos (:1128-1160); readings such as "Close: inside the published range" |
| B2 | Met (sampled) | notes at :1202, :1257, :1296, :1369; not read in full |
| B3 | Met | Table 4 + `compareWithPublished` |
| B4 | Met | block with row tags (:1185, :1239); guess only |
| B5 | Met | `whereInRange`, `overlaps`, `overlapCount`, `restShare` tested |
Remaining Rule B: none structural found.

## Rule C
- C1: Not checked visually (52 SVG texts, 4 aria-labels). C2: Met in code (white marks :370-372, :439).
- C3: Met: illustration :755, Pictures :968, :1000, :1027.
- C4/C5: Met in structure; worked moments (ball :779; :981, :1007, :1040).
- C6: Met (structure): 13 triples, stage-gated (:989).
- C7: Met so far as read. Some look-for `matters` lines say "This is what you were asked to guess in Prediction 1" (:642, :657): after the run, so allowed.
- C8: Partly checked.

## Rule D
- D1: Met in structure (dated October 2026, :837).
- D2: As C.
- D3: Met in structure: pre-run NASA stars, Chandra x2, Burrows review (arXiv), NASA light-year, CERN neutrinos (:842-862); 8 papers after the run (:1402-1425). Spec records the gap: no plain NASA/ESA page for SN 2023ixf, neutrinos or SN 1987A neutrinos (spec :223).
- D4: Met (= Rule B).

## Other findings
- O1: white is the Sun's yardstick line in Picture 3 (`SUN_COLOR` :63) and the learner's setting (`YOURS_COLOR` :65): two meanings, and a third (guess) would follow.
- O2: spec open items unchanged (no source for 2023ixf's own radiated energy; Chandra's "radiation pressure"). Table 4's reference is the same module, so "the same" at published settings.

## Rule E and re-read additions (2026-11-03)
- **E1 to E3 Not met.** The page below the introduction ran on in one column, with a heading "Now try it yourself" and "Results" but no Parts, coloured lines or leads.
- **The controls already change Part 1 pictures.** The core and the gas speed add white marks to Pictures 2 and 3 and fill Table 4. Under the rule a learner's own setting is pink.
- **Colour clash found (O1 confirmed).** White was both the Sun's yardstick line and the learner's setting. The yardstick is now amber and the setting pink.
- **A5 corrected.** Prediction 2's answer has a picture after all: Picture 3's stage-5 strip ("22.3 million years ago"). That strip is not to scale in time, so a second line on a logarithmic scale of years was added under it for the guess.
- **Rule B already met.** The check-up, the notes, Table 4 and the guesses beside the results were kept as they were.
- **Defaults used.** The owner approved all default recommendations and wording in advance (2026-11-03).

## What an update would touch
CatchingASupernovaExperiment.tsx (Picture 3, Picture 2 new panel, intro, source lines), CatchingASupernovaTutor.tsx, catchingASupernova.ts/.test.ts, spec, DEVELOPMENT-STATE.md. Size **M**.

## Not checked
Browser rendering; notes 2 to 4 read in full; the Words panel; link contents.
