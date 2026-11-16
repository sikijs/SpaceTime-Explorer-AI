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

---

# Re-read of 2026-11-16 (against Rule E, the 2026-11-07 rules, and the owner's request for rich Black Holes pages)
Status: read-only, nothing in the app, tests or specification changed. Black Holes is the owner's favourite topic (2026-11-16): the owner asked for detailed, extensive content on every page of this group, an introduction that fully explains the subject, images and drawings from public sources (NASA, ESA, Hubble and similar) to make the page appealing, a generous list of links to the most important resources, and anything else that keeps the learner focused. The findings above still stand; the new findings are below.

## Rule E (the page in four Parts): not met
| Item | Result | Evidence | Gap |
|---|---|---|---|
| E1 | Not met | One long card: introduction, predictions, controls, Run, pictures, Results, tutor all in sequence (BlackHoleSizeExperiment.tsx:230-895) | Split into Part 1 (predict, then watch), Part 2 (the object and radius controls), Part 3 (results), Part 4 (tutor) |
| E2 | Not met | No Part headings, colours or leads | Four leads to draft; Part 1's lead gives no answers |
| E3 | Not met | The optional guide is held back and appears only after the first Run starts (:880-882); there is no "Want to know more?" list above the predictions, and no "Words and formulas" box | Both go above Part 1 with no heading (CLAUDE.md §14, "Links and Words on Every Experiment Page") |
| E4 | n/a yet | | Leads to be drafted |
| E5 | n/a | One experiment, no sub-parts | None |

## The 2026-11-07 rules
- **Parts 2, 3 and 4 appear after the first Run has finished: partly met.** Results show when `status === 'complete'` (:526), but the object and radius controls (Part 2 content) are on screen from the start and disabled until a prediction exists (:80-118). They must move below the first Run.
- **Start over, not Change prediction: not met.** The button is "Change predictions" (:61-70) and appears only after the first Run (:53). Replace it with an always-visible "Start over", greyed until there is a guess or a run and while a run plays, and say the guess is locked after Run.
- **Run must not need a choice that belongs to Part 2:** today Run needs a prediction, an object and a radius. Part 1 therefore needs a fixed run (see question 1).
- **Links and words: not met** (see E3). The guide's links (BlackHoleGuide.tsx:432-521) are mostly good official or paper links (NASA, STScI, ESA Gaia, EHT paper, arXiv), but five are Wikipedia, a university news page, MIT News, ScienceDaily and phys.org, which the rule says to avoid for results; none have been fetched in this audit.

## Content for a favourite topic (new; all of it is the owner's to approve, §28.1)
What exists today: a long text-only introduction; no pictures in this experiment. The project already holds three licensed images in `public/images/black-holes/` (M87* and Sgr A* by the EHT Collaboration, CC BY 4.0, via ESO; a labelled NASA black-hole visualisation) and an image component used by `BlackHoleIntro.tsx` (credit line under each image, alt text, width and height), so no new framework is needed.

Proposed, as a menu for the owner to accept or cut:
1. **A fuller introduction with sub-headings**, in this order: what a black hole is (with the M87* image and a one-line "this is a ring of glowing gas, not the black hole itself"); the one-way edge (an own labelled drawing of the horizon, flagged as an illustration); "it is not a vacuum cleaner" (own drawing: Earth still orbiting a Sun-mass black hole); how stars die and which ones become black holes (own life-stage strip, plus a NASA or ESA image of a supernova remnant only if its licence and wording are read); how we know they exist (Sgr A* image; the orbit of the star S2 around Sgr A* if a licensed ESO or Max Planck image is found); how small a mass must be squeezed (the hook for the two predictions, giving no answer). "As of November 2026" dating where a fact can change.
2. **Image slots (own drawings plus official images, each with credit, alt text and a source link, shown with its licence before use):** M87* and Sgr A* (already in the project); the labelled NASA visualisation (already in the project); a Hubble or Webb image of a galaxy with a central black hole; a NASA or ESA artist's impression of a stellar-mass black hole with a companion star (for example Cygnus X-1, to be fetched and read); a LIGO or Virgo image only if wanted. No agency logo, no implied endorsement, wording of each credit unaltered.
3. **A "Meet the six objects" strip** (Earth, Sun, neutron star, stellar black hole, Sgr A*, M87*): one card each with real size or mass, the horizon radius computed by the module, and a plain comparison (the Earth's horizon is about 9 mm, "a marble"; the Sun's about 3 km, "a small town"). Numbers come from the module, not typed in the interface (§9). It must not show the Sun's or Earth's horizon before the learner has predicted the Sun's (Prediction 1), so it sits in Part 3 or after the first Run.
4. **"Did you know" facts**, three or four, each with a fetched source and date (for example the first image of a black hole, 2019; Sgr A*, 2022; the mass of Sgr A* from stellar orbits), kept short and placed in the introduction.
5. **A "Want to know more?" list**, grouped: *Start here* (plain NASA, ESA and STScI pages), *The discoveries* (the EHT papers and releases; the Nobel Prize 2020 pages on the Galactic Centre orbits, if read), *Watch and explore* (NASA visualisations and videos, and a Hubble or Webb gallery), *Go deeper* (the papers). Roughly eight to twelve links, each opens in a new tab with a plain one-line description, each fetched and read before approval, gaps recorded under CLAUDE.md §29 rule 3(c) practice.
6. **A "Words and formulas" box** (collapsed): radius, horizon, horizon radius, solar mass, astronomical unit, logarithmic ruler, Schwarzschild radius (named only after the tutor, so the box lists it under the tutor's reveal or after the run), escape speed, neutron star; the formula r = 2GM/c² with the Sun worked through, shown only after the first Run so it does not give Prediction 1's answer.
7. **Held back until after the first Run (§12):** the optional guide's statement of "about 2.95 km per Sun" (BlackHoleGuide.tsx:190); any image or fact that states the Sun's or Earth's horizon.

## Updated list of what an update would touch
BlackHoleSizeExperiment.tsx (four Parts, Start over, marks and the Prediction 2 panel, check-up and notes, fixed Part 1 run, images, extended introduction, links, words box), a new render test file, BlackHoleSizeTutor.tsx, BlackHoleGuide.tsx (links, the held-back line, possibly merged into the new links list), physics/blackHoleSizeExperiment.ts and .test.ts (guess-to-radius, guess-to-ratio, real ratio, per-object cards, check-up numbers), `public/images/black-holes/` (new images after licences are read), the specification, DEVELOPMENT-STATE.md and the tracker.

## Updated size
**Large** (was Medium): the four-Part rebuild, a longer illustrated introduction with a links list and a words box, new images, and a reading guide on top of the marks.

## Questions for the owner, each with a suggested default
1. **Part 1 fixed run:** Part 1 runs the Sun at its real size (695,700 km) squeezed to a fixed final radius chosen by the page (for example down through the horizon radius, so the ruler shows the red horizon line and the marker crossing it). The object and radius choices move to Part 2. *Default: yes; the fixed run squeezes the Sun all the way to 1 horizon radius so that Prediction 1's mark can sit beside the line.*
2. **Prediction 1 mark:** a white mark on the ruler at 6,000 km, 30 km or 3 km, in a YOUR GUESS box, drawn once the Sun's horizon line is drawn. *Default: yes.*
3. **Prediction 2 panel:** a new panel on Picture 1 on its own scale, "one Sun against 1,000 Suns": two real bars (horizon of 1 M and of 1,000 M, from the module) with the white mark for the guess (10 times, 1,000 times, a million times). It uses a Sun and 1,000 Suns as a fixed pair because no preset pair differs by 1,000. *Default: yes.*
4. **Colours:** white for the guess; red stays the horizon; the hypothetical start of the three black holes keeps its "hypothetical" label in its own colour. *Default: yes.*
5. **Verdicts:** "your prediction was right / off this time" (:797-809) moves to the tutor; Results show each guess only, with a tag on its row. *Default: yes.*
6. **Check-up (Rule B1):** a small table "the same radius from two methods": the horizon radius from r = 2GM/c² against the radius at which ordinary-gravity escape speed equals the speed of light (Gravity 7), expected "the same". Plus rows for the published sizes the page uses (Sun about 695,700 km, Earth about 6,371 km, neutron star about 12 to 13 km) read from official sources. *Default: yes, each row only where its source is fetched.*
7. **Neutron-star size:** the page says "12 to 13 km" while the module uses 12 km (O2 above). *Default: say "about 12 km" in the cards, keep "12 to 13 km" in the assumption, and name the source once read.*
8. **Images:** which of the proposed images do you want, and do you want own drawings next to official ones (as for Gravity 7)? *Default: own labelled drawings for every mechanism, plus the three images already in the project, and one or two more official images shown with their licences for your approval before use.*
9. **Engagement extras:** the "Meet the six objects" strip, the "Did you know" facts and a short closing "what you can explore next" line pointing to Black Holes 2. *Default: yes to the strip and the facts; the closing line is already the existing "What's next".*
10. **The optional guide (BlackHoleGuide):** keep it as it is, below Part 4 and after the tutor's explanation, with its Wikipedia, MIT News, ScienceDaily and phys.org links replaced by official pages or papers; the "about 2.95 km per Sun" line is fine there because it comes after the tutor. *Default: yes.*
11. **Heading:** "Experiment 1 — ..." changes to "Black Holes 1: ..." as for Cosmology 10, and cross-references use the sidebar's names. *Default: yes.*
12. **Sources:** an official-source search and fetch (with licence reading for each image) is run in the draft-wording step, before any wording is shown, and nothing is linked or embedded until it has been read. *Default: yes.*

## Not checked (re-read)
Not run in a browser; nothing fetched (no link, licence or fact has been verified in this re-read; the candidate images and sources above are proposals, not findings); the tutor was read to its explanation step but not word by word; the module's tests were not re-run; line numbers are from the files as read today.
