# Gap report: Cosmic Horizons Experiment 10 (Does time tick faster on the Moon?)
Date: 2026-11-02 | Specification: docs/experiments/cosmic-horizons/10-does-time-tick-faster-on-the-moon.md | Components: src/components/LunarClocksExperiment.tsx, LunarClocksTutor.tsx | Physics module: src/physics/lunarClocks.ts (+ .test.ts, 21 `it`s) | Status: read-only, nothing changed

## Summary
Older-pattern experiment (2 predictions, 3 pictures + Earth-Moon drawing, controls, 4 tables, tutor, Words panel). Gaps: no guess marks; no check-up, notes or predictions block; no source lines; introduction does not say predictions leave the results unchanged; white = learner's own place. Prediction 1 is a direction (marker only); Prediction 2 a size on Picture 2's microseconds scale. Size **L** with Rule B (A + C: M).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives |
|---|---|---|---|
| 1 | Moon clock slower, same or faster than Earth's? (LunarClocksExperiment.tsx:837) | Slower / The same / Faster (:572-576) | Picture 2 (microseconds a day gained), the Moon-surface row; sign. Marker only, or Picture 1 bars |
| 2 | How far apart after a day? (:850) | ~56 ns / us / ms (:577-581) | Picture 2, Moon-surface row, on its scale |

## Rule A
| Item | Result | Evidence | Gap |
|---|---|---|---|
| A1 | Met (not exhaustively traced) | pictures take `yours` (own place) only (:263,:400,:493); predictions go to the tutor (:1422) | none |
| A2 | Not met | no YOUR GUESS | white box + line on Picture 2 |
| A3 | Not met | | direction needs a marker (caption: "only a marker"); size can sit on the scale |
| A4 | Not met | Picture 2 appears after Picture 1 | draw only when its row exists |
| A5 | N/A | both answers are on Picture 2 | |
| A6 | Not met | | measured: nothing on the Moon yet (spec :78: the Moon's rate is a calculation that agrees with NIST); calculated here: all rates; imagined: the learner's own orbit |
| A7 | Not met | "Nothing here is graded." (:790-791); controls note "The controls below add a white mark to each picture and fill in Table 4." (:1171) | add the rule's wording |
| A8 | Partly met | `directionAnswer`, `sizeAnswer`, `gainMicrosecondsPerDay`, `timeScale` tested (lunarClocks.ts:116,134,137,97,125) but return names only | add numeric values for the guess buttons (56e-9, 56e-6, 56e-3 s) with tests |
| A9 | Not met | prompt "Look at Picture 1..." (LunarClocksTutor.tsx:112-114); marks predictions in explanation only (:160-170) | name the marks |
| A10 | Older rule, partly | "Your predictions are recorded and not marked here." (:909); "Your predictions are not marked here." (:1271) | never says they do not change the pictures |

## Rule B
B0: Table 1 what slows each clock (:1274); Table 2 how much each clock gains (:1306); Table 3 published results and plans (:1332); Table 4 your own clock (:1384). A note about 56 vs 58.7 us at :1327.
| Item | Result | Gap |
|---|---|---|
| B1 | Not met | Reference exists: NIST 2024 value (`NIST_2024` in module :40) vs this page's 56 us; and GPS/orbit values |
| B2 | Not met | no notes under tables (only the 58.7 remark) |
| B3 | Partly | Table 4 follows the controls; owner decides |
| B4 | Not met | no block |
| B5 | Partly | no check-up function in the module |

## Rule C
- C1: Not checked visually (46 SVG texts, 4 aria-labels).
- C2: Met in code (white ring/bar for own place, orbit :540, :967, :1060, :1130).
- C3: Met: drawing :726, Pictures :936, :1041, :1115.
- C4: Mostly met; terms (coordinate time, TCL, TT, geostationary) in Words panel.
- C5: Met: :979, :1072, :1140.
- C6: Met (structure): 10 triples; stage gating not read line by line.
- C7: Met so far as read: intro defers the sizes (:755); the paper is withheld until after the run (:802-803, :1406).
- C8: Partly checked.

## Rule D
- D1: Met in structure ("Why the Moon, and why now", "Where the question stands (October 2026)").
- D2: As C.
- D3: Partly. Pre-run: NIST, BIPM CGPM 2026, NASA Artemis II, NASA Moon fact sheet, ESA ACES (:808-824); paper after the run (:1412). No page for coordinate time/lunar time scale beyond NIST/BIPM; no 3(c) rows in the spec (grep: none for 10).
- D4: Not met (= Rule B).

## Other findings
- O1: white = learner's own place (`YOURS_COLOR` :51).
- O2: Table 3 area carries a note that "some sources quote 58.7 us" (:1327); the spec already lists this as unresolved (58.7 as a sum not stated by the paper).

## Rule E and re-read additions (2026-11-03)
- **E1 to E3 Not met.** No Parts: after the introduction the page runs on in one column. No coloured lines, headings or leads.
- **The controls already change Part 1 pictures.** The place, the orbit and the duration add a white mark to each picture (a bar on Picture 1, a ring on Picture 2's last row, a ring on Picture 3's curve) and fill in Table 4. Under the rule a learner's own setting is pink.
- **Colour clash found.** White was the learner's own place; the Earth's pull at the Moon was rose (close to pink). Fixed by recolouring (own choice pink, the pull red).
- **Both predictions are about the Moon's dot on Picture 2:** a direction (a marker only) and a size (a diamond, with an arrow at the edge for 56 milliseconds, which is off the scale).
- **B1 reference.** NIST's 56.02, the "Lunar Time" paper's 3.14 × 10⁻¹¹ and 2.7 microseconds and the 58.7 that some sources quote, all already in Table 3. No published-value column.
- **Defaults used.** The owner approved all default recommendations and wording in advance (2026-11-03).

## What an update would touch
LunarClocksExperiment.tsx (Picture 2, intro, Results), LunarClocksTutor.tsx, lunarClocks.ts/.test.ts, spec, DEVELOPMENT-STATE.md. Size **M** / **L** with Rule B.

## Not checked
Browser rendering; Words panel; per-stage gating of look-for lists.
