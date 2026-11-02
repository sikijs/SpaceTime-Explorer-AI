# Gap report: Gravity and Curved Spacetime Experiment 9 (Real clocks in orbit: GPS, with a closing synthesis)
Date: 2026-11-02 | Specification: docs/experiments/gravity-and-curved-spacetime/09-gps-time-dilation.md | Components: src/components/GpsTimeDilationExperiment.tsx (includes the "Putting It All Together: What Is Relativity?" section, `:494-592`), GpsTimeDilationTutor.tsx | Physics module: src/physics/gpsTimeDilationExperiment.ts (+ .test.ts, 10 cases) | Status: read-only, nothing changed

## Summary
Three predictions (speed effect against altitude, crossover yes/no, GPS clock faster/slower), an altitude slider with three presets (ISS, GPS, geostationary), one orbit drawing (Earth, orbit, satellite dot, dashed crossover ring), a text Results block and a tutor, followed by the group's closing synthesis. This is the only experiment in the group using real numbers (Earth GM, radius, c). Biggest gaps: the drawing's Earth, orbit and satellite are unlabelled and it has no caption; the crossover ring is drawn from the start, so it reveals the answer to Prediction 2 before the learner has run anything; no picture of effect against altitude (the guesses 1 and 3 have no picture); no guess marks; Results has no reference check of the +38 microseconds a day. Size: **L**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | As altitude increases, does the speed-based slowing effect get more, less or stay about the same? (`GpsTimeDilationExperiment.tsx:282-291`) | More / Less / About the same (`:33`); `speedEffectPrediction`, `submittedSpeedEffectPrediction` (`:183, :186, :200`) | No picture of effect against altitude. The drawing (`:376-404`) shows position only. |
| 2 | Is there an altitude where the speed and gravity effects exactly cancel? (`:292-298`) | Yes / No (`:128-173`) | The dashed crossover ring in the drawing (`:382-390`), drawn from the first frame. |
| 3 | At GPS altitude (about 20,200 km), is the satellite's clock faster, slower or the same as a ground clock? (`:299-308`) | Faster / Slower / Same rate (`:301-303`) | The net effect at the GPS preset (`:358-364`); numbers only (Results `:441-450`). |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met | above | |
| A1 | Met | `liveResult` (`:195`) is computed from `altitudeKm` only | |
| A2 | Not met | `<svg>` `:376-404` has no white mark | New panel: effect (microseconds per day) against altitude, with speed, gravity and net curves from the module and the crossover point; white guess marks for each prediction (speed-effect trend marker, crossover marker on the axis, a marker at the GPS altitude on the net-effect line). |
| A3 | Not met | | Trend and yes/no guesses: markers only; for guess 3 the marker can sit above/at/below zero on the net-effect axis. |
| A4 | Not met | | Draw after the curves exist. |
| A5 | Not met (needed) | | A panel on its own scale and title next to the orbit drawing. |
| A6 | Not met | | "Where it comes from": calculated here with Earth's real GM and radius and the weak-field formulas (`gpsTimeDilationExperiment.ts:6-14`, intro `:250-252, :262-271`); GPS's real +38 microseconds per day is quoted at `:452-455` with no source on the page. |
| A7 | Not met | intro `:234-279` and controls `:334-373` silent | Add both. The altitude control changes the drawing and Results; guesses change nothing. |
| A8 | Not met | Module exports `EARTH_GM`, `EARTH_RADIUS_METERS`, `REAL_SPEED_OF_LIGHT`, `CROSSOVER_ORBITAL_RADIUS_METERS`, `GpsTimeDilationResult`, `runGpsTimeDilationExperiment` (`:6-28`). Altitude conversions and µs/day arithmetic are in the component (`:41-57`) | Sweep over altitude, GPS/ISS values, marker data and tests missing; µs/day conversion belongs in the module. |
| A9 | Partly met | Tutor compare step gives each guess and "in fact, it gets weaker" (`GpsTimeDilationTutor.tsx:79`) before the explanation; observe prompt gives the outcome in brackets (`:77`) | |
| A10 | Not met (no statement) | Results `:457-471` | |

## Rule B
- B0. One Results block (`:422-473`): altitude and radius, orbital speed, speed effect, gravity effect, net effect and the crossover altitude in µs/day, a real-GPS paragraph, three "Your prediction ... In fact ..." lines. No tables.
- B1. Partly met: a real reference exists and is quoted in text only: real GPS clocks run about +38 µs/day fast at about 20,200 km (`:452-455`). A check-up row "this page's net effect at GPS altitude vs the published +38 µs/day" would be the natural one; the page does not show the difference or the source. The ISS and geostationary presets have no reference value (not checked in the spec).
- B2. Not met.
- B3. Partly applicable: the altitude control follows the results, and the published value exists only for GPS altitude; the owner may prefer a single check-up row.
- B4. Partly met: text lines, with verdicts.
- B5. Partly met: effect fractions from the module; µs/day conversion in the component (`:53-57`).

## Rule C
- C1. Not met: the drawing has no labels for Earth, the orbit ring or the satellite dot; the only on-canvas text is "dashed ring: crossover altitude (~3,186 km)" (`:401-403`), and "crossover" is not defined at that point.
- C2. Partly met: the dot's radius changes with altitude on a square-root scale (`:30-39`); the speed and gravity effects, the point of the experiment, are not drawn.
- C3. Not met: no "How to read this diagram" caption (the square-root scale is explained only in a code comment, `:26-31`).
- C4. Not met.
- C5. Not met in the picture; the Results give real numbers after the run.
- C6. Not met.
- C7. Not met: the crossover ring and its altitude are on screen as soon as the predictions are answered (`:310, :382-403`), which answers Prediction 2 ("is there a crossover?", and where). The intro's question also frames "which one wins" and the daily-life swimmer picture says it depends on "which push is stronger at that particular moment" (`:242-246`), a hint for Prediction 3. Experiment 2's "higher speeds the clock up" and Experiment 6's "higher orbit moves slower" are recalled in Prediction 1's prompt (`:283`), which contains its own answer ("a satellite orbiting higher up moves slower").
- C8. Partly met: "relativistic effects", "orbital speed", "crossover", "geostationary" and "µs/day" are used without plain definitions beside the picture (`:355-372, :53-57`).

## Other findings
- O1. None found against the specification (not compared line by line).
- O2. (a) Prediction 1's wording gives away the answer: "a satellite orbiting higher up moves slower than one orbiting lower down" (`:283`); the question then asks whether the effect weakens (§12). (b) The real GPS figure and "kilometers within a day" (`:452-455`) have no source on the page. (c) Results `:436-439` states "always slows the clock ... always speeds the clock up" before the tutor. (d) The synthesis section `:494-592` says "every one of the nine-plus-eleven experiments" (`:587`) and "Chapter 2 (Experiments 2 and 9)" (`:578`); wording looks awkward and "Chapter 2" is not a name the learner sees (sidebar groups are named). It also states "Experiments 1–11 ... follow logically from just these two" (`:511`), a strong claim for the owner to confirm. (e) The intro sentence "the last experiment in this two-chapter journey" (`:274`) and the synthesis name only two groups while the app has many more (later groups exist); owner to decide. (f) `onComplete` is called on every "Show results" press (`:209`), not once at the end of an animation; the experiment has no animation. (g) Cross-references ("Experiments 3–4", "Experiment 6") lack chapter names, and in the whole app they are ambiguous with other groups' numbers.

## What an update would touch, and its size (O3, O4)
GpsTimeDilationExperiment.tsx (labels, caption, new altitude panel with marks, intro and prompt hints, notes, results check-up), GpsTimeDilationTutor.tsx, physics module + test (sweep, µs/day conversion, markers, reference comparison), specification. The synthesis section lives in the same file. **Size: L.**

## Not checked
No browser view; the tutor's explanation points 1 to 5 were read by headline only; sources for the real GPS figure not checked; specification not compared line by line; Rule D N/A.
