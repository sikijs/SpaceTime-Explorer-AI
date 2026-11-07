# Gap report: Gravitational Waves Experiment 4 (Comparing Two Real Events)
Date: 2026-11-02 | Specification: docs/experiments/gravitational-waves/04-comparing-real-events.md | Components: src/components/GravitationalWaveRealEventsExperiment.tsx, GravitationalWaveRealEventsTutor.tsx | Physics module: src/physics/gravitationalWaveRealEventsExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
The chirp and energy model with two presets (GW150914 and GW170817) and a free mass slider; one prediction (which event is louder); a richer drawing (labelled arms, a source pair, wave overlays) with a short bullet caption after the run; Results; 4-step tutor. Gaps: no "How to read this diagram" heading or worked moment, no reading guide, no guess mark, and the prediction question already gives away the answer. The module is a presets table only. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Which event produced the louder, faster-rising chirp? (:321-325) | black-holes / neutron-stars / same (:60-64); `louderPrediction`, `submittedLouderPrediction` (:97-98) | **No picture compares the two events.** The drawing shows one run at a time; the only comparison is a text paragraph (:610-619) after both presets have been run |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | None |
| A1 | Met | Real values come from `chirpStateAt`, `orbitalEnergyStateAt` and `REAL_EVENT_PRESETS`; the prediction is read only for gating and text (:106-109,:597-602) | None |
| A2 | Not met | No white mark (:429-548) | A mark on a side-by-side amplitude/run-time view of both events |
| A3 | Not met | Choice of three; a marker is enough | Say so in the caption |
| A4 | Not met | n/a | Draw once both events' real values are drawn |
| A5 | Not met | Nearest picture: the arm drawing. Needs a new half or panel: final amplitude and run time for GW150914 vs GW170817, on one scale | New panel; it can only be filled after the learner runs both presets (`presetRunSummaries`, :93-95) |
| A6 | Not met | No source line (:429-579). The module says presets are a "presentation choice" (physics/...RealEventsExperiment.ts:1-5) and the Results says "simplified stand-in" (:620-623) but not where the real masses come from | Measured: LIGO/Virgo masses. Calculated here: toy chirp. Imagined: toy mass mapping 5.5 and 0.3 |
| A7 | Not met | Intro (:237-318) has no mention of guess marks | New text |
| A8 | Not met | Module exports `REAL_EVENT_PRESETS` only; truth `ACTUAL_LOUDER` is a component constant (:68) | Module comparison function and tests |
| A9 | Not met | Tutor compare (GravitationalWaveRealEventsTutor.tsx:57) and Results "In fact" (:597-601) state the answer | As earlier |
| A10 | Not met | No sentence says guesses do not change results; "Change prediction" button (:348-369) | Report only |

## Rule B
- B0: One Results block (:581-625): run values, prediction line with "In fact" and a one-line reason, a light-counterpart sentence per preset, and a "Comparing your two runs" paragraph (:610-619). No tables.
- B1: Real references exist in `realDescription` (masses 36 + 29 Suns, 2 x 1.4 Suns, distances, 1.7 s gamma-ray delay). The toy model does not compute these, so a check-up would only restate them. Likely N/A; owner to decide.
- B2: Not met.
- B3: N/A.
- B4: Partly met (text with a verdict).
- B5: Not met. The "which is louder" comparison is a sentence hard-coded in the component (:612-617), not a module function.

## Rule C
- C1: Partly met. "Arm X", "Arm Y", "the source" are labelled on the canvas (:502-547). The wavy overlay, glow and box-shadow are described only in the caption.
- C2: Partly met. The two presets change the dot colour and size (:226-230) and the run values, but the arms' scale is the same, and the two events are never seen together.
- C3: Partly met. A caption exists (:549-579) with no "How to read this diagram" heading, and it appears only after a run starts.
- C4: Partly met. It names the arms and strain, and the source; the glow, dot colours (black = black holes, light = neutron stars), box-shadow and the dark-gold/cyan lines are not explained.
- C5: Not met. No worked moment with real numbers.
- C6: Not met. The "What to look for" paragraph (:279-286) is a prose paragraph before the run, not Look at / What it means / Why it matters.
- C7: **Not met.** The prediction question itself says "each tens of times heavier" and "only a little heavier" (:321-324), and the intro "What are black holes..." paragraph does the same (:258-265). The "What to look for" paragraph says the stretching grows "faster and more dramatically" (:280-286).
- C8: Partly met. "Neutron degeneracy pressure", "black hole", "multi-messenger" are defined (:248-293); "strain" is explained in the caption (:554-556).

## Other findings
- O1: The specification's header (docs/experiments/gravitational-waves/04-comparing-real-events.md:3) says the owner's wording approval "has not yet been done", but `CLAUDE.md` lists the experiment as "Complete (wording approved)". The spec header looks stale. Report only.
- O2: (a) §12 hint above. (b) The claim that a teaspoon of neutron star weighs "billions of tons" (:257-258) and the 100-km size of the GW150914 black holes (:262-263) have no source on the page. (c) "A neutron star ... roughly 8 to 20 times the Sun's mass" (:250-251) describes the progenitor star, but the wording reads as the core's mass. (d) GW170817 "light counterpart" sentence (:605-607) is a mechanism ("have surfaces and material") given with no source.

## What an update would touch, and its size
Component, tutor, module (+ tests), spec. **Size: M** (one new two-event comparison panel plus a caption rewrite).

## Not checked
Not run in a browser. PROJECT.md/AGENTS.md not read in detail. Real masses and the "billions of tons" figure not checked against a source.

## Step 1 re-read and additions (2026-11-07)
Re-read of the component (`GravitationalWaveRealEventsExperiment.tsx`, 637 lines), the module (32 lines: a presets table with the two real events, their toy masses 5.5 and 0.3, and `hadLightCounterpart`) and the specification against Rule E and the first report, using the Gravitational Waves 1 to 3 audits as the pattern. Nothing was run in a browser; nothing was changed in the app.

- **E1 to E3 Not met.** One `exp-card` (line 236) holds the introduction, the prediction, the two preset buttons and the mass slider, Run, the drawing, the caption and the Results. There are no Parts, coloured lines or leads, and no "Words and formulas" box.
- **E4 n/a until built.** Part 1's lead must not give the answer; the prediction question itself currently does (first report, C7).
- **E5, a structural question for the owner.** The one prediction ("which event is louder") compares two runs, but the page shows one run at a time and the comparison exists only after the learner has pressed both preset buttons. The page has three kinds of control: the two preset buttons, the free mass slider and Run. How they map onto the four Parts is the owner's decision (see question 1 below). Nothing is decided here.
- **A10 refined.** The "Change prediction" button (:348-369) is the same kind as the one removed from Gravitational Waves 3; there it was replaced by "Start over".
- **A5 refined.** The module already holds both events' toy masses, so the final amplitude, the run time and the energy for both events can be computed for a side-by-side panel without playing a run. Whether the panel appears before the learner has run both presets, or only after, is for the owner to decide (question 2).
- **D (links and words box).** The component has no "Want to know more?" list and no links, and none of the real figures (36 and 29 Suns, 1.4 Suns, 1.3 billion and 130 million light-years, the 1.7-second gamma-ray delay) has a source on the page. Rule D covers Cosmic Horizons 1 to 14 only, but Gravitational Waves 1 to 3 were given a links list and a words box at the owner's choice.
- **New finding O5.** The introduction and the Results use the real masses and distances from the preset text, but nothing in the module or tests checks them against a source; the Gravitational Waves 3 audit checked its real figures against LIGO's pages and the paper (arXiv 1602.03837), and this page would need the same, plus a source for GW170817 (the LIGO/Virgo detection paper and the multi-messenger paper).

### Questions for the owner (before wording is drafted)
1. **Which gaps to fix?** The first report's gaps: the answer is given away in the question and the introduction (C7); no guess mark and no side-by-side panel (A2 to A5); no source line (A6); no introduction or control note (A7); no caption heading, worked moment or Look at / What it means / Why it matters (C3 to C6); no module comparison function (A8, B5); the tutor and Results state the answer (A9); the "Change prediction" button (A10); and, from this re-read, the four-Part layout (E1 to E4) and the missing links and sources (D, O5). All, or a subset?
2. **E5: where do the preset buttons and the slider go?** One option is Part 1 = run GW150914, then GW170817, then see the two together; Part 2 = the free mass slider; Part 3 = the results; Part 4 = the tutor. Another is to keep one run at a time in Part 1 and show the side-by-side panel only once both have been run. Which do you prefer?
3. **Rule B (the reading guide).** A check-up needs a real reference; the toy model does not compute the real masses or distances, so a check-up would only restate them (first report, B1). Leave out the check-up and give "A real detection" as facts, as in Gravitational Waves 3, or something else?
4. **Links and words box.** Add a "Want to know more?" list and a "Words and formulas" box, as in Gravitational Waves 1 to 3?
5. **"Change prediction" button.** Replace it with "Start over", as in Gravitational Waves 3?

## Outcome (2026-11-07)
The owner approved the draft in `04-draft-wording.md` as written and it was built (commit `983e030`). On the owner's first look at the built page, the same day, five problems were found and fixed, and one design decision was reversed:
1. **The guess missing from Part 2's picture (an error).** Drawing B was not told which events had run, so it waited for both. Fixed.
2. **The guess waited for both runs.** It is now drawn as soon as the first event has finished; a marked bar that has not run yet gets a dashed white outline with no length shown.
3. **The "What comes next" box** in Part 1 was removed (Picture 2 carries its own note).
4. **No source links under the results tables.** Table 1 has a "Where Table 1's numbers come from" line (the two detection papers and the two LIGO releases); Table 2's sources line is always visible.
5. **The tutor and "Let's reflect".** The three questions appear after the first run; the explanation was rewritten as eight points (the guess marked with the real numbers and a short note for each possible guess, the mass rule worked through, what stayed the same, multi-messenger astronomy, what the light added, what the pink row showed, what the toy model is and is not, and what was learned).
6. **Reversal of the draft's layout (option A).** The draft had the learner press Run twice, once for each event. The owner found that this confused the learner, so one Run now plays GW150914 and then GW170817. The two choice buttons are gone. This follows the rule in `CLAUDE.md` §14, "Parts 2, 3 and 4 appear after the first Run".

The wording of items 4 to 6 is the agent's draft and is not yet approved. See the specification's "Audit update (2026-11-07)".
