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
