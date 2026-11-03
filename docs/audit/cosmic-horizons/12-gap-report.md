# Gap report: Cosmic Horizons Experiment 12 (Betelgeuse and its companion)
Date: 2026-11-02 | Specification: docs/experiments/cosmic-horizons/12-betelgeuse-and-its-companion.md | Components: src/components/BetelgeuseCompanionExperiment.tsx, BetelgeuseCompanionTutor.tsx | Physics module: src/physics/betelgeuseCompanion.ts (+ .test.ts, 50 `it`s) | Status: read-only, nothing changed

## Summary
Already has Rule B (check-up, notes, predictions block, Table 4) and states in the introduction that predictions do not change pictures or tables. Remaining: Rule A guess marks (none drawn), "Where the real picture comes from" lines, the introduction's "drawn in white" sentence, tutor prompts naming marks, and a colour clash (white is the learner's own *setting* and a real 5-sigma marker). Size **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives |
|---|---|---|---|
| 1 | How far out would Betelgeuse's surface reach if it replaced the Sun? (BetelgeuseCompanionExperiment.tsx:880) | inside Earth / past Mars / past Jupiter (:485-489); state `reachPrediction` | Picture 1 (planet orbits and the radius circle) |
| 2 | How often would noise alone make a spot as strong as the reported 1.5 sigma? (:892) | 1 in 2 / 1 in 15 / 1 in 3.5 million (:490-494); `sigmaPrediction` | Picture 3 (noise curve; the tail area) |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A1 | Met (not exhaustively traced) | pictures take `yours` from the controls (:217,:299,:404); predictions go to the tutor (:1458); the page says so (:1066) | none |
| A2 | Not met | no YOUR GUESS | white box + line on Picture 1 (a ring at the guess's radius) and Picture 3 |
| A3 | Not met | | Reach answers are ranges: module needs a representative radius per button |
| A4 | Not met | Picture 1 look-for list is gated by stage (:998) | draw guess only once the planets' orbits/circle exist |
| A5 | N/A | both have pictures | |
| A6 | Not met | no "Where the real picture comes from" line (grep) | measured (Howell 2025 angle; Joyce 2020 distance; 1.5 sigma), calculated here (radius, Kepler orbit, noise curve), imagined (the Sun replaced by Betelgeuse; trial settings) |
| A7 | Partly met | "they do not change the pictures or the tables... shown again beside the results" (:818-820); controls note "Your predictions do not change the pictures or Table 4... These settings do... change one and watch the white marks... Table 4 says 'the same'... trial values" (:1066) | missing: "guesses are drawn in white on the pictures" (nothing is drawn) |
| A8 | Partly met | `reachOf`, `sizeAnswer`, `sigmaAnswer`, `chanceOfSigma`, `oneInChance` tested (betelgeuseCompanion.ts:214,222,234,182,195); `SIGMA_ANSWERS` has `oneIn` values (:226-230) | missing: radius value for each Reach button; tests for it. (The type `Reach` also has 'past Earth' (:214) which no button offers: see O2) |
| A9 | Not met | observe prompt names Pictures and Tables 1 to 3, not marks (BetelgeuseCompanionTutor.tsx:116-118); explanation marks predictions (:164-175) | name marks |
| A10 | Met (older rule) | "they do not change the pictures or the tables" (:818-819) | to be reworded with the white-mark sentence |

## Rule B
B0: check-up (:1141), Table 1 how big (:1179), Table 2 orbit (:1220), Table 3 evidence so far (:1261), Table 4 your own numbers vs published (:1293); predictions block (:1115-1124).
| Item | Result | Evidence |
|---|---|---|
| B1 | Met | check-up with expected / found / reading ("Close", "Weak on its own", "Not settled") (:1146-1170) |
| B2 | Met (sampled) | "What this table tells us" at :1195, :1238, :1276, :1385; Table 1's is what/means/why (:1198-1210); other notes not read in full |
| B3 | Met | Table 4 + `compareWithPublished` (:592) |
| B4 | Met | block gives the guess and the row tag "(the row for Prediction N)" (:1119-1124, :1160, :1187, :1190); shows the guess only |
| B5 | Met | `periodAgreementPercent`, `separationMismatchPercent`, `compareWithPublished` tested (7, 9, 10 refs) |
Remaining Rule B: nothing structural found; "the reference is what the same physics predicts" (:1173) is correct for two rows only; two rows have no reference and say so.

## Rule C
- C1: Not checked visually (43 SVG texts; 4 aria-labels).
- C2: Met in code (white outline/marker for own settings :257, :346, :456).
- C3: Met: illustration :749, Pictures :979, :1010, :1036.
- C4: Mostly met. C5: Met (coin moment :771; :991, :1017, :1051).
- C6: Met (structure): 12 triples; lists gated by stage (:998).
- C7: Met so far as read (answers withheld until after the run). Pre-run NASA/JPL and CfA links describe the companion finding (:834-866); contents not read, so a hint about Prediction 2 (1.5 sigma) is possible.
- C8: Partly checked.

## Rule D
- D1: Met in structure (dated October 2026, :830).
- D2: As C.
- D3: Met in structure: pre-run list of 8 plain pages (JPL, NASA x4, ESA Parallax, ESA/Hubble, CfA) (:834-865); 8 papers after the run (:1431-1450). Spec records no plain official page for angular size (spec :28).
- D4: Met (= Rule B).

## Other findings
- O1: `YOURS_COLOR` white (:53) is the learner's *setting*, and the real 5-sigma marker in Picture 3 is also white (:641, :1040). Under the new rule white = guess only.
- O2: `Reach` type has 'past Earth' (betelgeuseCompanion.ts:214) not offered by the three buttons. Spec's own open items: no paper read in full; ± on Goldberg's 1.17 Suns.

## What an update would touch
BetelgeuseCompanionExperiment.tsx (Pictures 1 and 3, intro line, source lines), BetelgeuseCompanionTutor.tsx, betelgeuseCompanion.ts/.test.ts, spec, DEVELOPMENT-STATE.md. Size **M**.

## Not checked
Browser rendering; contents of the pre-run links; Tables 2 to 4 notes read in full; the Words panel.

## Resolution (2026-11-02)
Every Rule A gap above was fixed at the owner's direction, and Drawing A was added to "Now try it yourself" at the owner's request: see `12-update-draft.md` (the approved draft) and the specification's "Implementation Notes" (commits `c0e2776`, `45e0edc`, `f0149c2`). The white clash (O1) was resolved by recolouring the settings (pink) and the 5 sigma marker (lime). Left as it was, by the owner's decision: Picture 1's look-for wording "the white line". The unused 'past Earth' value of the `Reach` type (O2) was not removed (not chosen).

