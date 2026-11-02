# Gap report: Gravitational Waves Experiment 7 (Standard Sirens)
Date: 2026-11-02 | Specification: docs/experiments/gravitational-waves/07-standard-sirens.md | Components: src/components/GravitationalWaveStandardSirenExperiment.tsx, GravitationalWaveStandardSirenTutor.tsx | Physics module: src/physics/standardSirenExperiment.ts (+ standardSirenExperiment.test.ts) | Status: read-only, nothing changed

## Summary
Pick an event (GW150914 or GW170817) and a distance (real, "Nearby" 10 Mpc, "Far" 1000 Mpc or custom); the arms show the detected amplitude and the source shows the true amplitude; a Hubble constant estimate follows for GW170817. Two predictions (near vs far louder; can distance come from detected amplitude alone). Has a "How to read this diagram" caption (after the run) but no marks, no reading guide, and Results says "right" / "off this time". The "recovered distance" is the input distance reproduced, a circular result the page presents as the method. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Nearby or far merger looks stronger by the time it reaches Earth? (:297-300) | nearby-louder / far-louder / same (:44-49); `nearFarPrediction`, `submittedNearFarPrediction` (:82,:84) | Arm stretching in the drawing (detected strain, :197-204); only one distance is on screen at a time, so there is no near-vs-far view. Nearest picture: add a panel comparing detected amplitude at two distances |
| 2 | Could you find the distance from the detected amplitude alone? (:315-318) | yes / no (:51-55); `distanceKnowPrediction` (:83,:85) | No picture; a yes/no. Marker on the "true vs detected amplitude" readout (:459-477), which is text only |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | None |
| A1 | Met | `detectedAmplitude`, `inferredDistanceMpc`, `estimatedHubbleConstant` (:108-112); predictions not read | None |
| A2 | Not met | No white mark or box (:480-578) | Q1: a white bar at the guessed brighter source; Q2: marker |
| A3 | Not met | Both are choices | "Only a marker" note |
| A4 | Not met | n/a | Draw once both amplitudes are drawn |
| A5 | Not met | As above; add a "true vs detected" bar pair on its own scale | New panel |
| A6 | Not met | No source line. The arm drawing is compressed by a square root with a gain of 125 (:175-196) and the caption says only "scaled up for visibility" (:597-599). Distances and speeds are published values; amplitudes are toy | Measured / calculated / imagined line |
| A7 | Not met | Intro (:234-293) has no mention of guess marks | New text |
| A8 | Partly met | Module has 3 functions plus constants, tested (physics/standardSirenExperiment.test.ts:11-55). Truth is constants in the component (`ACTUAL_NEAR_FAR`, `ACTUAL_DISTANCE_KNOW`, :62-63). The display transform (sqrt, gain, cap) is in the component (:188-196), not in the module | Module function for the display scale and mark values, with tests |
| A9 | Not met | Tutor compare gives amplitudes and distance (GravitationalWaveStandardSirenTutor.tsx:78); Results says "so your prediction was right / off this time" (:628-641) | Newer rule: verdict only in tutor explanation |
| A10 | Not met | No sentence says guesses do not change results; "Change predictions" (:346-366) | Report only |

## Rule B
- B0: One Results block (:605-684): true and detected amplitude, recovered distance, two "Checking your prediction" paragraphs, a Hubble constant paragraph (GW170817 only), an amber "Important: this is an illustration" box, and a no-velocity note for GW150914. No tables.
- B1: Real reference exists: GW170817's published Hubble constant from the 2017 standard-siren measurement. The page cites a range ("62-170 km/s/Mpc (about ±15% around the central estimate)", :68). The model gives 3017 / 40 = 75.4 km/s/Mpc (arithmetic by me from the module constants). A check-up row "page vs published" is possible; the published central value is not on the page.
- B2: Not met.
- B3: Partly met. The distance control moves the numbers; the recovered distance always equals the chosen one (see O2).
- B4: Partly met (text with a verdict).
- B5: Partly met. Numbers come from the module; the "matching the {distance} you actually chose" claim (:617-618) is true by construction.

## Rule C
- C1: Mostly met. "Arm X (detected)", "Arm Y (detected)", "the source (true amplitude)" labelled (:534-577).
- C2: Met. Distance changes the arm movement; the source pulse stays at the true amplitude.
- C3: Partly met. "How to read this diagram" (:580-603) appears only after a run starts.
- C4: Partly met. Names the source and arms and says the arms' scale is exaggerated; does not explain the glow, the gold line, or the source colour. The square-root compression is not mentioned.
- C5: Not met. No worked moment (for example 0.030 / 40 Mpc).
- C6: Not met. "What to look for" is a prose paragraph before the run (:262-267).
- C7: **Not met.** "What happens" says amplitude "fades with distance" (:242-244) (Prediction 1's answer), and says the chirp's shape reveals the true strength so that comparing "is called a standard siren" (:244-249) (Prediction 2's answer), both before the predictions.
- C8: Partly met. "Mpc" is defined (:258-261), "Hubble constant" (:269-272). "Amplitude", "strain", "recession velocity" are used with brief or no definition; "standard candle" is named without a definition (spec only).

## Other findings
- O1: The specification's header says wording approval "has not yet been done" (docs/experiments/gravitational-waves/07-standard-sirens.md:3); `CLAUDE.md` lists wording approved 2026-10-13. Spec header looks stale.
- O2: (a) §12 hints above. (b) The "recovered distance" is `true / (true / d)` = d, so the page recovers the number it was given and then says the match "is the standard-siren method itself" (:616-620). It is a consistency check, not a measurement. (c) `REAL_HUBBLE_CONSTANT_RANGE` says "62-170 ... (about ±15% around the central estimate)" (:68); 62 to 170 is not ±15 % of any single centre, so the two halves of that string disagree. (d) GW150914 at 400 Mpc and GW170817 at 40 Mpc and 3017 km/s are in the module with no source link on the page. (e) The "toy relationship, not the precise general-relativistic formula" (:279-281) is stated, fine.

## What an update would touch, and its size
Component, tutor, module (+ tests), spec. **Size: M to L** (a near/far comparison panel is new, a second yes/no marker, a caption rewrite, and the owner decision on the circular recovery).

## Not checked
Not run in a browser. Published H0 figures and distances not checked against a source. PROJECT.md/AGENTS.md not read in detail.
