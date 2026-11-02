# Gap report: Black Holes and Strong Gravity Experiment 1 (How Small Must Something Be to Become a Black Hole?)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/01-how-small-a-black-hole.md | Components: src/components/BlackHoleSizeExperiment.tsx, BlackHoleSizeTutor.tsx, BlackHoleGuide.tsx | Physics module: src/physics/blackHoleSizeExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Two predictions (the Sun's horizon radius; how much wider a horizon is for 1,000 times the mass), a ruler (Picture 1) and a ball (Picture 2), one Results table, a text-only prediction check, a tutor and an optional guide. Pictures, caption and tutor are good; there are no guess marks, no check-up table, no per-table notes and the "What to look for" is one paragraph. Size: **Medium** (Prediction 2 has no picture, so a new panel is needed; Results needs a check-up and notes).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | "To turn the Sun into a black hole ... squeeze ... to a ball of what radius?" (BlackHoleSizeExperiment.tsx:372) | 3 buttons: about 6,000 km / about 30 km / about 3 km (:60-64); state `sunRadiusPrediction`, locked into `submittedSunRadiusPrediction` at first Run (:147-149) | Picture 1 ruler, when Sun is chosen (red horizon line); also Picture 2's red circle |
| 2 | "1,000 times the mass ... How much wider is its horizon?" (:391) | 3 buttons: 10 / 1,000 / a million times (:67-71); `massScalingPrediction` | No picture shows a ratio of two horizons |

## Rule A
| Item | Result | Evidence | Gap / what is needed |
|---|---|---|---|
| A0 | Met | :118-122 | Listed above |
| A1 | Met | `runBlackHoleSizeExperiment(presetId, chosenRadiusKm)` at :128 does not read the prediction state | None |
| A2 | Not met | No mark in either picture (:527-665) | Prediction 1: white "YOUR GUESS" mark on the ruler at 6,000 / 30 / 3 km, when the Sun is selected (all three lie inside the Sun's axis range 0.1 horizon radius to 695,700 km). Prediction 2: nothing to mark yet (see A5) |
| A3 | Not met | n/a | A 3-way choice has a size, so the mark should move with the guess |
| A4 | Not met | Pictures appear only after the first Run (:525); the horizon line is drawn at once | Mark would sit beside the red horizon line, which is drawn from the start of the first run |
| A5 | Not met | | Prediction 2 has no picture. Nearest: Picture 1 (or Picture 2). Add a half or panel on its own scale drawing the horizon radius of mass M against 1,000 M, with the guessed width as the white mark. Note no preset pair differs by exactly 1,000 (stellar 10 vs Sgr A* 4.3 million vs M87* 6.5 billion, `OBJECT_PRESETS`) |
| A6 | Not met | no "Where the real picture comes from" line under either picture (:667-752) | Needed (calculated here from 2GM/c²; masses and sizes are rounded values, black-hole starts are hypothetical) |
| A7 | Not met | The intro (:234-367) never mentions that predictions do not change the pictures, nor white marks | Needs the three statements; no controls note exists beside the object/radius controls (:444-495) |
| A8 | Not met | Module has `horizonRadiusKm`, `radiusInHorizonRadii`, `isBlackHole`, `runBlackHoleSizeExperiment` | Missing: functions that map each guess to a radius / to a width ratio, and the real ratio (all would be pure additions with tests) |
| A9 | Partly met | Tutor "observe" (BlackHoleSizeTutor.tsx:86) points to the ruler, not to marks; "compare" (:88) repeats the guesses in words; the explained step (:140-148) answers prediction 2 generally, never "your guess" | Tutor must point to marks by name and mark each prediction in its explanation only |
| A10 | Not met as such | Searched the five files for "not change" / "never change": no statement that predictions do not change results. Closest: "Your predictions are locked in above" (:425) | The older-rule sentence is absent here; report only |

## Rule B
- B0 tables/blocks today: one Results table of 5 rows (:763-789): horizon radius, squeeze needed, ball chosen in horizon radii, "Is it a black hole?", ordinary-gravity escape speed; two "Checking your ... prediction" paragraphs (:792-810); a "simple math" list (:812-826); a daily-life comparison (:836); a link to Gravity Exp 7 (:845); a "What this model can and cannot tell you" box (:855).
- B1 Not met. A reference exists but is thin: the horizon formula is the same physics as Gravity Exp 7's escape-speed-equals-c radius, and the spec lists sizes (Sun about 3 km, Earth about 9 mm). Could be a "same radius from two methods" check-up (escape speed = 1.00 c at the horizon, row 5). No measured value is involved.
- B2 Not met: no "What this table tells us" note; the prose after the table partly does the job (:812-834) but not headed per table.
- B3 N/A: the controls are the experiment itself; no table needs a published value.
- B4 Partly met: guesses are repeated in text (:793-810), but with "your prediction was right / off this time" verdicts (:797, :800, :808, :809). New rule says guess only, no verdict (tutor marks). No tag on a table row.
- B5 Partly met: table values come from the module. Hard-coded in the UI: `12 / horizonRadiusKm(1.4)` (:832), `695_700` (:831), "10 Suns" text (:799). Tutor also hard-codes masses 3.0e-6, 4.3e6, 6.5e9 (Tutor:63-65).

## Rule C
- C1 Met: ruler axis ticks, horizon line, marker, landmarks and "your chosen radius" are all labelled in the SVG (:540-625); Picture 2 labels are a legend at top left, not on the shapes (:653-659). Partly for Picture 2.
- C2 Met: ball turns yellow to pink and "not a black hole" to "a black hole" (:646-663).
- C3 Met: "How to read these diagrams" (:669).
- C4 Mostly met: names both pictures, lists every element in numbered items (:679-745), explains the log ruler, says picture 2 is not to scale. Unit "AU" is defined in the intro (:253); "escape speed" (Results row :777) is never defined on this page (C8).
- C5 Partly met: only a generic example ("a spot marked 10 km", :683). No worked moment with real numbers (for example the Sun: 695,700 km down to 2.95 km).
- C6 Not met: "What to look for" is one paragraph (:747-751), not Look at / What it means / Why it matters.
- C7 Met: the caption does not name the predicted values; the Results do, after the run.
- C8 Partly met: radius, horizon radius, solar mass, AU, logarithmic ruler defined before use; "escape speed" and "ordinary gravity" are assumed from Gravity Exp 6/7.

## Other findings
- O1: Intro says the optional guide appears "after you have made your predictions and run the experiment once" (:316-319). Code renders `<BlackHoleGuide />` inside the `hasSubmittedPrediction` block (:880-882), so it appears at the start of the first run, before the run ends and before the tutor. The spec (line 162) says pictures and guide appear after predictions are locked, so this fits the spec but not exactly the intro wording.
- O2: BlackHoleGuide.tsx:190 states "The horizon radius is directly proportional to the mass: about 2.95 kilometers for each Sun's worth", which is Prediction 1's and 2's answer, available before the tutor's explanation (after lock-in, so not a pre-prediction leak). The guide also links Wikipedia, phys.org, ScienceDaily and MIT news (BlackHoleGuide.tsx:469-507); §29 does not apply to this group, so noted only.
- O2: Results checking paragraphs give verdicts ("right", "off this time"), which the newer rule leaves to the tutor.
- O2: "neutron star's size ... about 12 to 13 km" (:355) while the module uses a round 12 km.

## What an update would touch, and its size (O3, O4)
BlackHoleSizeExperiment.tsx (marks, panel for Prediction 2, check-up, notes, caption look-for items, intro and control notes), BlackHoleSizeTutor.tsx, physics/blackHoleSizeExperiment.ts and .test.ts, the specification. Size: **Medium**.

## Not checked
Not run in a browser; rendered appearance of the SVG labels was judged from code only. BlackHoleGuide.tsx was read by headings and its table, not word by word. Links not fetched.
