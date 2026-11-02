# Gap report: Spacetime Geometry Experiment 3 (Cause Before Effect: Can the Order of Events Change?)
Date: 2026-11-02 | Specification: docs/experiments/spacetime-geometry/03-cause-before-effect.md | Components: src/components/CauseBeforeEffectExperiment.tsx, src/components/CauseBeforeEffectTutor.tsx | Physics module: src/physics/causeBeforeEffect.ts (tests: causeBeforeEffect.test.ts, 12 cases; reuses lightCones.ts) | Status: read-only, nothing changed

## Summary
One three-way prediction about ANY observer at ANY speed below c, a 10-second playback with two sweeping "same-moment" lines, a six-column table with a column key, a one-bar-per-observer drawing and a four-step tutor. Older rule: the guess is a sentence beside the results ("It is only recorded here, not marked right or wrong"). Biggest gaps: no guess mark; the guess is about every speed but the picture shows one speed (so the real answer, `simultaneitySpeed`, is in the module but not drawn or shown); no "Where the real picture comes from"; no check-up or "What this table tells us"; "What to look for" lists are not three-part; the pre-run caption and introduction explain the cone, the tilt and "above means later" before the guess (C7 judgment). Size: **Medium to Large** (the predicted quantity, the speed at which B turns first, has no picture, so a marker or panel for it is needed; owner decision).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "Could some observer, moving at some speed below the speed of light, find that B happened before O?" (CauseBeforeEffectExperiment.tsx:684-688) | "Yes, a fast enough observer could find B first" / "An observer could find them at exactly the same moment, but none could find B first" / "No, every observer finds O first" (:18-22); `prediction` state (:467); cleared when event B changes (:647), kept when speed changes (:670) | The answer is about every speed. On the Diagram it lives in where B sits against the whole fan of possible same-moment lines through O (all |slope| < 1, i.e. whether B is outside the cone). The Diagram draws only one purple line (the chosen speed) (:309-311). `simultaneitySpeed(event)` (causeBeforeEffect.ts:27) gives the speed at which B and O are simultaneous, but no component uses it (searched src/components: no match). |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `result` is a `useMemo` of (event, speed) only (:503); Diagram and bars take event and speed (:732, :951). | None. |
| A2 | Not met | No white mark or "YOUR GUESS" box in the file. | White marker and box on the completed Diagram, joined to B or to the cone region. |
| A3 | Not met | Three-way answer, no size. | Marker only (caption must say so). |
| A4 | Would need care | Cone regions and settled lines appear only when `complete` (:192-212, :223); a mark naming a region should wait for that. | Draw inside the `complete` branch. |
| A5 | Partly | B's cone region is drawn, but "any speed" has no picture; the Diagram shows one line. | Owner decision: add a panel (a small strip of speeds from -c to +c showing where the order flips, from `simultaneitySpeed`) or keep the marker on B's region. Do not add a new picture. |
| A6 | Not met | No such line under either picture (:733-871, :952-984). | Add: lines and cone are calculated here from the Lorentz transformation of Experiment 11; nothing measured. |
| A7 | Not met | Introduction (:515-631) and Your job (:616-623) do not say the pictures ignore the guess or that guesses will be drawn in white. No note beside the controls (:634-680). | Add. |
| A8 | Not met | Module has `eventOrder`, `simultaneitySpeed`, `runCauseBeforeEffectExperiment` (causeBeforeEffect.ts:19, :27, :64). | A tested function mapping each answer to its marker position and the real value. |
| A9 | Partly | Compare step quotes the guess and says it concerned any observer while the run showed one (Tutor:105). No mark to name. Explanation does not mark the guess (Tutor:146-203). | Name the marks; owner decides on explicit marking in the explanation. |
| A10 | Met (older rule) | Results text: "It is only recorded here, not marked right or wrong." (Experiment:882). Code comment :502. | Report as current state. Does not yet say that the pictures never change with the guess. |

## Rule B
- **B0.** Results text with the guess (:877-883); a 6-column table (:888-919); a "What each column means" list (:920-949); a one-bar-per-observer drawing with its caption (:951-984).
- **B1. Not met.** No check-up. A real internal reference exists: the order can differ only when the pair is "unreachable" (tests causeBeforeEffect.test.ts:63-76) and the time² − distance² is equal for both rows (:77-86). No outside value needed.
- **B2. Partly.** The "What each column means" list explains each column with a worked number (:925-948), but it is not headed "What this table tells us" and does not say what the real run's numbers mean or why they matter.
- **B3. N/A (suggested).** Controls only move the passing line and B among five events.
- **B4. Partly.** One sentence (:880-882), no tag on a row.
- **B5. Not met.** No new comparison values.

## Rule C
| Item | Result | Evidence | Gap |
|---|---|---|---|
| C1 | Met | Titles, O, B (:319, :326-330), axes with units (:278, :293), the two lines labelled directly at the run end (:333-350), a key for lines, badges and regions (:216-233), the observer (:258-263). Badges are numbered but only explained in the key and caption. | Not viewed: the key overlaps the drawing's top left at some events (:216-233); not checked. |
| C2 | Met | Speed tilts the purple line (:168, :310) and changes the badge numbers (:165-166); the event choice moves B and region. | None. |
| C3 | Met | Captions at :735 and :954. | None. |
| C4 | Mostly met | Diagram caption names every element and says when each appears, in order (:826-845); a four-step worked example with numbers (:771-797); results caption lists axis, bar direction, scale, words (:959-976). | The caption is very long; a worked example uses "numbers that are not among the choices" and is placed before the element list (:770-797). Not wrong, noted. |
| C5 | Met | Worked example at 6 s / 2 ls / 0.5c (:771-797). | It is not the learner's own run. |
| C6 | Not met | "What to look for" is a numbered list of 4 steps (:847-870) and a paragraph (:978-983); none uses Look at / What it means / Why it matters, and items "When it ends" are listed alongside items for earlier stages. | Rewrite in three parts, each shown only when its feature is drawn. |
| C7 | Partly | Before the prediction the page gives: the cone rule with inside/edge/outside (:548-559), the test "compare distance with time" (:603-614), and the caption's "Above a line means B is later than O for that observer. Below it means B is earlier" (:862-864) and "Teal is inside the cone ... Rose is outside" (:842-844). The three answers map onto these ideas. No bullet states the answer. | Owner to judge whether this pre-run material makes Prediction 1 too easy (§12). The "What to look for" step 3 (:861-865) describes the end state, before the run. |
| C8 | Met | Event, light cone, cause, "finds the order", same-moment line, light-second all defined in the introduction (:531-587). "Reachable / light only / unreachable" are explained in the column key (:940-942); "timelike" is not used. | The relation names appear in the table without being introduced earlier in this experiment, but are explained in the key beside it. |

## Other findings
- **O1.** Per CLAUDE.md status the owner approved this experiment's differences from the spec on 2026-11-02. I did not compare each item here.
- **O2.** (a) The prediction asks about any speed; the picture is for one speed (see A5). The tutor admits this (Tutor:105). (b) Tutor point 4's "about 0.0000001 of the speed of light" for 30 m/s: 30 / 3.0e8 = 1e-7, correct. (c) The status table records the tutor's faster-than-light remark (Tutor:191-196) as having no source check. (d) Introduction's pond comparison says "A pond is only a picture, because you could still throw a pebble there faster" (:543-545), fine but long. (e) Prediction answer 2 ("exactly the same moment, but none could find B first") is one of the three; for the five events the simultaneity speed is 0.6 or 0.8 magnitude only for unreachable events (:27-31): not checked in the UI.

## What an update would touch, and its size
Files: CauseBeforeEffectExperiment.tsx (intro, Diagram marker and any speed-strip panel, captions, results notes), CauseBeforeEffectTutor.tsx, causeBeforeEffect.ts and causeBeforeEffect.test.ts (marker helper, the possible speed-strip data), the specification (with approval), docs/DEVELOPMENT-STATE.md. Size: **Medium to Large**, depending on whether the owner wants the "any speed" panel.

## Not checked
Browser rendering (key overlap, badge collisions, long caption layout), narrow widths, keyboard, other browsers, spec source table, test bodies beyond titles.
