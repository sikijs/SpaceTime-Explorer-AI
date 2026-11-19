# Gap report: Black Holes and Strong Gravity Experiment 10 (Hawking radiation)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/10-hawking-radiation.md | Components: src/components/HawkingRadiationExperiment.tsx, HawkingRadiationTutor.tsx | Physics module: src/physics/hawkingRadiationExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, three pictures (thermometer, heat-flow arrows with a time-lapse disk, lifetime graph), a 7-row table, two worked calculations and a six-black-hole table, and a four-step tutor. Older rule: guesses are text only; Results and the tutor's compare step mark them. Biggest gaps: no guess marks, no table notes, no three-part look-for items, the mechanism and the answer to Prediction 2 appear in the picture, caption and Results before the tutor, and the verdict logic is in the component. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Which is hotter, a big or a small black hole? (HawkingRadiationExperiment.tsx:35-40, :634) | the big / the small / the same | Thermometer: the 1-Sun and 10-Sun dots against each other |
| 2 | Is a 10-Sun black hole losing, gaining or keeping its mass? (:42-47, :654) | losing / gaining / same | Heat-flow picture: which arrow is thick, and the disk |
| 3 | How much longer would a black hole of ten times the mass take to evaporate? (:49-54, :672) | 10 / 100 / 1,000 times | Lifetime graph: the 10-Sun dot against the 1-Sun dot (`TIMES_LONGER` is a component constant, used at :467) |
Stored in `submitted*` state; used in Results (:965-1000) and the tutor props.

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `Thermometer` (:171), `Flow` (:260), `LifetimeGraph` (:333) take only `result`/`progress`; model answers come from the module (:460-467) | none |
| A2 | Not met | No white guess mark or "YOUR GUESS" box in the three SVGs | Marks on thermometer, arrows and graph |
| A3 | Not met | P3 has a numeric position (10, 100 or 1,000 times the 1-Sun lifetime); P1 and P2 are categories | Position for P3; markers for P1 and P2, with a caption line saying so |
| A4 | Not met | The Flow picture builds over the time-lapse (:260); no guess mark | Mark only once the arrows/disk are drawn |
| A5 | Met (not needed) | Each has a picture | none |
| A6 | Not met | No source line (:769-935). Real data is the formula for temperature and lifetime, which the spec says were checked only against search results and not at the original papers (10-hawking-radiation.md:42); the radiation has never been seen from a real black hole | Add: calculated here; nothing measured; the 2.725 K background is from Cosmology Experiment 3 |
| A7 | Not met | Introduction (:527-620) says nothing about guesses or white marks | Add (owner to approve) |
| A8 | Not met | Module exports `hawkingTemperatureKelvin`, `lifetimeYears`, `massForLifetimeKg`, `balanceMassKg`, `massDirection`, `hawkingSteps`, `HAWKING_PRESETS`, `runHawkingRadiationExperiment` (hawkingRadiationExperiment.ts:43-161). `hotModel`, `directionModel`, `longerModel` and `TIMES_LONGER` are in the component (:460-467) | Move into the module; add guess-mark functions and tests |
| A9 | Partly met | Observe prompt names "the thermometer and the arrows" (Tutor:119-120); compare recites guesses with verdicts (:121-122). Results marks them earlier | Prompts would name marks; verdict only in the tutor (owner's decision) |
| A10 | Not met | No sentence says predictions do not change the results | See O1 |

## Rule B
- B0: Results has a 7-row table (:~946-962), three "Checking your Nth prediction" paragraphs (:965-994), a temperature calculation (:~1000-1030), a time-to-evaporate calculation, a six-black-hole table, a coffee/cube comparison and a limits box (to :1142).
- B1 Partly possible: real references exist only as the page's own published-style figures (Hawking temperature of 1 Sun about 6.17 x 10^-8 K; background 2.725 K). The spec says they were not checked against the original papers, and no one has measured Hawking radiation, so a "check-up" row with a measured value is not available; a row comparing the page's balance mass with the 10-Sun hole is an internal comparison only.
- B2 Not met: no "What this table tells us" notes.
- B3 N/A: the control (which black hole) only moves marks.
- B4 Partly met: guesses are in Results with a verdict; no tag on a table row.
- B5 Partly met: values from the module; verdicts in the component.

## Rule C
- C1 Met: thermometer dots are named, background line labelled, your black hole ringed and labelled (:171-250); arrows, black hole and horizon ring labelled (:273-325); graph dots and age-of-universe line labelled (:348-430).
- C2 Met: orange (out) against blue (in); the winning arrow is thick; hotter and colder zones are shaded (`HOTTER_FILL`, `COLDER_FILL`, :58-59).
- C3 Met: captions at :770, :826, :878.
- C4 Mostly met: every element, the kelvin and log scales are explained, with bullets. The time-lapse order is covered in the introduction (:~548-552) and "A limit" (:~866-868).
- C5 Partly met: "Try this" examples with numbers (1 Sun to 10 Suns, tenth of the temperature, 1,000 times as long, :~807, :~917) and an "In this run" line; no fixed worked moment.
- C6 Not met: "Try this" bullets do not use Look at / What it means / Why it matters.
- C7 Partly met: the thermometer caption's "What is really happening" (:~793-798) states the full mechanism ("heat flows from hotter to colder, so... gains mass") and the Flow SVG prints the result inside the picture ("So the black hole's mass goes up", Flow text), and the Results states it for the 10-Sun hole (:~977-983). All after the learner's prediction (so §12 holds), but before the tutor, whose conceptual question (Tutor:123-124) asks the learner to work out the same thing.
- C8 Met: temperature, kelvin, cosmic microwave background, evaporate, powers of ten, "balance mass" are defined (:~574-592).

## Rule D
N/A.

## Other findings
- O1: CLAUDE.md §14 says older experiments state that predictions do not change the pictures; this one does not (A10).
- O2: White is already used for the background line and for the ring marking "your black hole" (`LINE_COLOR` #ffffff, :60; caption :~784-786) and for the horizon ring in the Flow picture, so a white guess mark would clash. The lifetime formula ignores greybody factors (spec says good to a few times); the page says so. "Mountain-sized ... some scientists have suggested" is the page's own wording, sourced in the spec only as Decision 8.

## What an update would touch, and its size
HawkingRadiationExperiment.tsx, HawkingRadiationTutor.tsx, the module and its tests, the specification. Size: **M** (marks on three pictures, module functions and tests, A6/A7 wording, notes under two tables, a recolour decision).

## Not checked
Not run in a browser; tests not run; SVG bodies and the tutor's explanation step read only in part; line numbers marked "~" are approximate; "What's next" not read.


---

# Re-read (2026-11-19)
Re-read against the rules set after the first report: the four Parts and "Parts 2, 3 and 4 appear after the first Run", the links and words box on every page, "Start over, not Change prediction", predictions drawn on the real picture, and the owner's request for rich Black Holes pages (2026-11-16, 2026-11-18: keep the intro, augment it, add NASA-type images). Read: the specification's overview, physics and assumptions, the module in full, the component's state, introduction, prediction block and controls (`HawkingRadiationExperiment.tsx:440-770`), the tutor's first steps (`HawkingRadiationTutor.tsx:100-140`) and the white-colour uses. Nothing changed; `git status` was clean.

## What is still true from the first report
No guess marks, no source lines, no table notes, no three-part look-fors, no check-up, `hotModel`, `directionModel`, `longerModel` and `TIMES_LONGER` live in the component, the Results give verdicts before the tutor, and white is already used for the background line, the chosen-black-hole ring and the horizon ring.

## New findings
| # | Finding | Evidence | What it needs |
|---|---|---|---|
| N1 | **No four Parts.** One long page (1,142 lines in one file). The black hole buttons and Run stay disabled until all three predictions are entered. | :640-770 | Part 1 (predict, one Run, three pictures), Part 2 (the six black holes), Part 3 (results), Part 4 (tutor); Parts 2 to 4 appear after the first Run. Split into intro, choices, pictures, results files as at Black Holes 9. |
| N2 | **"Change predictions" button**, shown only after the first Run, reopens the guesses without clearing anything. | :~704-722 | Always-visible "Start over" with the lock sentence. |
| N3 | **No links and no "Words and formulas" box**; the words are one paragraph (:~565-582). The formulas (T = ħc³ ÷ 8πGMk_B and t = 5120πG²M³ ÷ ħc⁴) appear nowhere with a worked example in a box. | :~565-582 | Both, above Part 1. Candidate sources to fetch and read first: Hawking 1974 (Nature) and 1975 (CMP), NASA/ESA pages on black holes and on Hawking radiation (none read yet). |
| N4 | **Cross-references say "Experiment 1, 9, 3"** (Cosmology). | intro :537, :576, :593-595; Tutor:181, :196; :776, :830 | "Black Holes 1" and "Cosmology 3 (the Cosmic Microwave Background)", "Black Holes 9", and so on. |
| N5 | **The heading says "Experiment 10 — ..."** | :525 | Match the audited pages' heading. |
| N6 | **The introduction is a good base and has no pictures and no real-world story** (Hawking's 1974 result, why it matters, what has and has not been seen: lab imitations, primordial black holes not found). The owner likes the existing intro. | :527-620 | Keep every part; add pictures, real context and numbers without giving any answer (§12). |
| N7 | **Possible early leaks.** (a) Guess 2's question says "A black hole of 10 Suns glows at a temperature far below that [2.725 K]", which points toward guess 1 (the bigger one is colder) and toward the direction (colder than its surroundings). (b) The intro's "Why even ask this" says a black hole "only ever grows" and asks if that is so, which nudges guess 2. (c) The introduction says "a black hole... gives off a very faint heat of its own... The energy that leaves would come out of the black hole's own mass", which nearly states the "losing" answer. | :537-545, :~654 | Owner to judge; defaults would keep what is needed to ask the question and cut only what states an answer. |
| N8 | **White clash is bigger than at Black Holes 9.** White is the background line (thermometer, `LINE_COLOR` #ffffff), the chosen-black-hole ring and its label (thermometer and graph), the horizon ring and its caption text ("white ring: the horizon"), the age-of-universe line and the evaporating-now line on the graph. A white guess mark would be lost among them. | :60, :208-232, :308-319, :380-407; captions :775-805 | Recolour the background line, the chosen ring, the horizon ring and the age lines to other colours (the thermometer's hot and cold fills use orange and blue already, so cyan and rose are candidates); update every caption that says "white line" or "ringed in white". |
| N9 | **All three guesses are about 1 Sun and 10 Suns**, but the page lets the learner choose any of six black holes, so a guess mark and the real answer are not always on screen together (the Flow picture shows only the chosen hole). | :460-467, :654, :672 | Part 1 fixed on 10 Suns (guess 2's own black hole; the thermometer and graph already show all six dots, including 1 Sun, for guesses 1 and 3). The six choices move to Part 2. |
| N10 | **Guess 2's mark needs a place on the Flow picture** (a direction, not a quantity): a marker on the thick-arrow side or beside the disk, with the caption saying it is only a marker. Guess 1 and guess 3 get marks on the thermometer (a marker at which of the two dots it points to, or "same") and on the graph (an arrow from the 1-Sun dot to 10, 100 or 1,000 times its lifetime; 1,000 times reaches 10 Suns' real dot, and 10 and 100 land short of it). | :171-430 | Module functions for each mark (the guess's temperature or lifetime and the real value); tests. |
| N11 | **No reference for a check-up row exists for a measured value** (the radiation has never been seen). Internal and published-formula comparisons are possible: the 1-Sun temperature 6.17 × 10⁻⁸ K and the balance mass of about 0.6 Moon masses. Whether a published source states them has to be fetched and read. | spec :42, :220 | Owner to decide whether the check-up compares the page's values with a published formula value (if a page is read) or is left out. |
| N12 | **The specification's Decision 9 is still open**: the formulas were checked in search results and arXiv papers, not at Hawking's paper or a textbook. | spec :220, :258 | Fetch and read the sources while drafting; record the result in the source table. |
| N13 | **"Mountain-sized ... some scientists have suggested" has no read source** (spec Decision 8). | spec :219 | Search for an official page on primordial black holes; if none is read, apply §29 rule 3(c) and keep the sentence as "hypothetical, none found". |
| N14 | **Tutor** (Tutor:119-124) recites each guess with "right" or "off" in the compare step, and the conceptual question asks the learner to work out what the Flow picture and Results have already stated (see C7). | Tutor:121-124 | Tutor marks the guesses (as at Black Holes 5 to 9); the Results stop giving verdicts and the picture stops printing the answer, so the conceptual question is a real question. |

## Plan for Part 1 (as at Black Holes 5 to 9)
Part 1 has one Run on a fixed 10-Suns black hole. Three pictures with white YOUR GUESS marks: guess 1 on the thermometer (the 1-Sun and 10-Suns dots; a marker for "bigger", "smaller" or "same"), guess 2 on the heat-flow picture (a marker on "losing", "gaining" or "same"; shown only after the arrows and disk are drawn), guess 3 on the lifetime graph (an arrow from the 1-Sun dot toward 10, 100 or 1,000 times as long). Part 2 offers the six black holes. Part 3 has a check-up (if the owner agrees, N11) and notes under each table. Part 4 is the tutor, which marks each guess.

## Size
Still **M**, leaning **M-L**: three marks, a recolour of four white elements, splitting a 1,142-line file, links and a words box with two formulas, and the rich-content additions.

## Questions for the owner (default first)
1. All gaps N1 to N14 fixed as listed? (default: yes)
2. Part 1 fixed on 10 Suns, the six black holes in Part 2? (default: yes)
3. Recolour the white background line, chosen ring, horizon ring and age lines (N8)? (default: yes; the guess is the only white)
4. Early leaks (N7): cut the sentence in guess 2's question that states 10 Suns is far below 2.725 K, and the sentence that says the energy "would come out of the black hole's own mass"? (default: yes, the owner approves the replacement wording)
5. Check-up (N11): compare the page's 6.17 × 10⁻⁸ K and the balance mass with a published formula value if a source is read, otherwise no table? (default: yes, only if read)
6. Rich content: public NASA/ESA images and real context (Hawking 1974, lab imitations, primordial black holes) with every link read first? (default: yes)
7. Results stop giving verdicts and the tutor marks the guesses? (default: yes)

## Not checked in this re-read
Not run in a browser; tests not run. The `Thermometer`, `Flow` and `LifetimeGraph` SVG bodies (:171-430), the Results (:~860-1142) and the tutor's explanation step were not re-read in full. Line numbers marked "~" are approximate. No source has been fetched yet.
