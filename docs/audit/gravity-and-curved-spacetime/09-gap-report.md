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

---

# Re-read, 2026-11-13: Rule E and the owner's rules of 2026-11-02 to 2026-11-07
Read-only. Re-read of `GpsTimeDilationExperiment.tsx` (595 lines, of which the closing synthesis is `:494-592`), `GpsTimeDilationTutor.tsx` (about 150), `gpsTimeDilationExperiment.ts` (55, 10 tests) and the specification `09-gps-time-dilation.md`, following the Gravity 1 to 8 audits. Nothing in the app changed. Rules A to C above stand as written; this section adds what they did not cover.

## What the module returns (I ran the altitude sweep; microseconds per day, ground clock at Earth's surface)
| Altitude (km) | Orbital speed (km/s) | Speed effect | Gravity effect | Net |
|---|---|---|---|---|
| 300 (slider minimum) | 7.730 | -28.72 | +2.70 | -26.02 |
| 400 (ISS preset) | 7.673 | -28.30 | +3.55 | -24.74 |
| 1,000 | 7.354 | -25.99 | +8.16 | -17.83 |
| 2,000 | 6.900 | -22.89 | +14.37 | -8.52 |
| 3,186 (crossover) | 6.458 | -20.05 | +20.05 | 0.00 |
| 5,000 | 5.921 | -16.85 | +26.45 | +9.60 |
| 10,000 | 4.934 | -11.70 | +36.74 | +25.04 |
| 20,200 (GPS preset) | 3.873 | -7.21 | +45.72 | +38.51 |
| 35,786 (geostationary preset) | 3.075 | -4.54 | +51.06 | +46.51 |
| 36,000 (slider maximum) | 3.067 | -4.52 | +51.10 | +46.58 |

1. **Each guess has one clear answer across the whole slider.** The speed effect gets smaller in size with altitude (28.7 down to 4.5); the net rises steadily, so there is exactly one crossover, inside the slider range, at 3,186 km (exactly 1.5 Earth radii); at 20,200 km the net is +38.5, faster. Nothing on the page shows this range at once: one run shows one altitude.
2. **Guess 1 needs a plain meaning of "stronger" and "weaker".** The speed effect is a *slowing*, so its number is negative and gets closer to zero as altitude rises. "Weaker" (the page's answer) means smaller in size. A learner who reads "more" as "more positive" would still be reading the same numbers. The wording needs to say "bigger slowing" and "smaller slowing" (**question 3**).
3. **The first Run lands on the answer to guess 3.** The slider starts at the GPS preset (20,200 km), so the first "Show results" shows +38.51 µs/day. Good for Rule E, but the other two guesses cannot be met from that single run.
4. **The +38 is close to, not the same as, the page's number.** The page says real GPS clocks run "about +38 µs/day fast" (`:452-455`). The module gives +38.51, about 1 percent higher. The page already says that a few smaller corrections are left out (Earth's rotation, eccentricity). The published figure and its source have **not** been read for this report (§29 rule 3(c) applies to the search).
5. **The drawing's scale is not real.** Orbit radius is drawn on a square-root scale (`:26-39`), so the ISS ring sits almost on Earth and geostationary is only about three times as far out on the page as the ISS. No caption says so.

## Rule E: the page in four Parts
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| E1 | Not met | One card holds the introduction, three predictions, the slider, Show results, the drawing and Results (`:232-474`); the tutor is a second card; the synthesis a third | Part 1 (predictions, Run, pictures), Part 2 (the altitude slider and a pink marker), Part 3 (results), Part 4 (tutor). |
| E2, E4 | Not met | No Part headings or leads | Four leads, drafted for approval; Part 1's lead gives no answer (§12). |
| E3 | Not met | No links, no words box | See "Links and Words". |

## Parts 2 to 4 appear after the first Run
**Partly met as built.** The Results and the tutor appear after the first "Show results", but the slider is hidden until all three guesses are made (`:310-420`) and one run shows one altitude. **The same Part 1 question as Gravity 5 to 8:** suggested, three choice buttons (ISS, GPS, geostationary) and one Run that selects the next unrun choice; Parts 2, 3 and 4 appear after the first Run with a note "run the other two to complete the graph". The slider becomes Part 2.

## "Start over, not Change prediction" (2026-11-07 rule)
**Not met.** The page has a "Change predictions" button that appears only after the first Run (`:312-332`). It must be replaced by an always-visible "Start over", greyed out until a guess is chosen or a run exists, which clears the guesses, runs, results and tutor progress; the page also says the guesses are locked after Run. Replaced, and said so in the specification (no need to ask the owner).

## Predictions and where their answers live (A5, sharpened)
- **Guess 1 (the slowing effect against altitude: more, less, about the same):** the answer is the speed curve across altitude. **No such picture exists.** Suggested: one graph beside the orbit drawing (altitude across, microseconds per day up) with three curves from a module sweep, each its own labelled element: the speed effect (slowing), the gravity effect (speeding up), and the net. A white marker for the guess (a direction arrow on the speed curve, a marker only).
- **Guess 2 (is there a crossover: yes or no):** the answer is where the net curve crosses zero. A yes or no, so only a marker (A3): "YES: crosses" or "NO: stays on one side" drawn on the zero line, drawn only once the curves are drawn (A4).
- **Guess 3 (GPS altitude: faster, slower, same rate):** the answer is the net curve's value at 20,200 km. A white marker above, on, or below the zero line at the GPS altitude. A marker only.
- **The orbit drawing** keeps Earth, orbit and satellite, now labelled. The dashed crossover ring is **hidden until the curves are drawn** (it gives away guess 2 now, §12).
- **"Where the real picture comes from":** *calculated here* (Earth's real GM, radius and speed of light, with the page's weak-field formulas, a circular orbit, a non-rotating Earth); *measured*: nothing is measured on this page, the +38 µs/day is a published figure from GPS, named but not drawn; *imagined*: none.

## Links and Words (2026-11-07 rules)
- **Words and formulas box (new).** Entries: orbital speed, time dilation from motion, time dilation from gravity (weak-field), microsecond, crossover, geostationary, GPS, weak-field approximation. Formulas, with a worked example from the page's own numbers at 20,200 km (arithmetic checked against the module): orbital speed v = √(GM ÷ r) = 3.873 km/s; speed effect ≈ −v² ÷ 2c² = −8.35 × 10⁻¹¹, which is −7.21 µs per day; gravity effect ≈ GM × (1/R − 1/r) ÷ c² = +5.29 × 10⁻¹⁰, which is +45.72 µs per day; net +38.51. **Held back until after the Run** (§12): the sign and size of each effect, since they answer guess 1 and 3.
- **"Want to know more?" links (new).** None exists. Plain official pages needed for: GPS and why its clocks need relativity; what a satellite orbit is. Original source for the +38 µs/day: not searched, not fetched. Candidates to search (none read): an official GPS or NASA page on relativity in GPS, and a review paper on relativity in the Global Positioning System. Per §29 rule 3(c), link only what is read; record any gap.

## Wording and claims to check (new and restated)
- **Prediction 1's prompt contains its own answer** (`:283`, "a satellite orbiting higher up moves slower"), and the intro's swimmer picture frames "which push is stronger" (`:242-246`), a hint for guess 3. Both would be rewritten neutral.
- **Results `:436-439`** says the speed effect "always slows" and the gravity effect "always speeds up" before the tutor; and `:459-470` gives the three "In fact" verdicts. They would move to the tutor (A9/A10). Tutor's observe step gives "(It ran fast.)" and its compare step marks all three guesses *before* the explanation; the rule is that the tutor marks them in its explanation, nowhere earlier.
- **Tutor point 5**: "the first calculation in the whole project using real numbers" is true only in the sidebar order if no earlier chapter uses real constants; later groups (Gravitational Waves, Cosmic Horizons) do. **Owner to confirm or soften** (question 8).
- **"Kilometers within a day"** of position drift (`:454-455`) has no source on the page.
- **Synthesis (`:494-592`).** It appears only after the tutor, which is fine (§12), but it says "two-chapter journey" (`:274`) and "nine-plus-eleven experiments" (`:587`), names "Chapter 2 (Experiments 2 and 9)" (`:578`), and uses bare "Experiment 3–4"-style references that clash with other groups' numbers. The learner sees group names, not "Chapter". It also says Experiments 1 to 11 "follow logically from just these two" assumptions, a strong claim. Suggested: group names and numbers fixed, the claim left to the owner (question 7).
- **"Experiment 9" heading and "Experiments 3–4" etc.** lack the group name. The heading should read Gravity and Curved Spacetime 9, to match the learner's sidebar.
- `onComplete` fires on every press of "Show results" (`:209`); not harmful but noted.

## B1 to B3, recommendation
A real reference independent of the page's own code exists: the published GPS clock offset of about +38 µs/day, with its decomposition (about −7 and +46) in the same source, **if** read. Suggested: a **small check-up table** with the page's net, speed and gravity values at 20,200 km against the published figures (rows say "close" or "the same" only against a value read from a source; no invented cut-offs), plus a row for the crossover (3,186 km, "from the page's own formulas, not measured", **no published reference**, so the row says only that). "What this table tells us" under it, with the daily-life comparison (a clock gaining 38 millionths of a second a day, and what that is in metres at the speed of light: 38 µs × 299,792,458 m/s ≈ 11.4 km; stated as a worked number, not as a claim about real receivers). **No setting-following table:** the pink marker on the graph already shows the altitude's three numbers. **Your decision** (question 6).

## Updated size
**Large.** A new graph with three curves and three guess marks, labels and captions for both pictures, three Part 1 runs, a page rebuilt around Parts, a module (altitude sweep, µs/day conversion, guess markers, tutor marking, worked numbers, reference comparison) and tests, a changed introduction, Results and tutor, the closing synthesis edited, the specification. **No change to approved physics.**

## Questions for the owner before drafting
1. **What does Part 1 show?** Suggested default: three choice buttons (ISS 400 km, GPS 20,200 km, geostationary 35,786 km) and one Run that selects the next unrun choice; each run draws its satellite on the orbit drawing and a dot on the graph; Parts 2, 3 and 4 appear after the first run with a note "run the other two to complete the graph". The three curves and the crossover ring appear only after all three runs, with the white guesses.
2. **The graph and marks:** altitude across (linear, 300 to 36,000 km), microseconds per day up; three curves (speed in one colour, gravity in another, net in amber, each labelled); white markers with YOUR GUESS boxes for guess 1 (a direction marker), guess 2 (a yes or no marker on the zero line) and guess 3 (a marker above, on or below zero at 20,200 km). Suggested default: yes.
3. **Meaning of "more" and "less" for guess 1:** reword to "a bigger slowing", "a smaller slowing" and "about the same slowing", with the real sign explained in the Words box. Suggested default: yes.
4. **Labels on the orbit drawing:** Earth, the orbit ring, the satellite, the scale note ("not to scale: distances squeezed"), and the crossover ring only after the curves. Suggested default: yes.
5. **Introduction, Results and tutor:** neutral introduction (remove the hint in the swimmer picture and in Prediction 1), drop the tutor's bracketed outcome, make compare ask without marking, move the "always slows/always speeds" lines and the three "In fact" lines to the tutor's explanation, add the Parts paragraph and the guess paragraph, a "Some new words" line. Suggested default: yes.
6. **Check-up table** (page against the published values, only if the source is read; the crossover row with no reference)? Suggested default: yes, small, no setting-following table.
7. **The closing synthesis:** fix the group names and numbering and "two-chapter journey" and "nine-plus-eleven", and leave the "follows logically from just these two" claim for you to decide? Suggested default: fix the references only; keep the claim until you say.
8. **Tutor point 5** ("the first calculation in the whole project using real numbers"): soften to "the first in this journey", or keep? Suggested default: soften.
9. **Slider range:** keep 300 to 36,000 km with the three presets. Suggested default: keep.
10. **Links:** search for a plain GPS-and-relativity page and the original source of +38 µs/day, link only what is read, and record a gap if none? Suggested default: yes.

## Not checked (re-read)
Not run in a browser; dark mode and narrow widths not looked at; no source page searched or fetched, so the published +38 µs/day, its −7 and +46 parts and the "kilometers within a day" claim are **not verified**; the table above was made by running the module through a temporary test file (removed afterwards, nothing left in the repo) and is not yet in a test; the worked-example arithmetic (−8.35 × 10⁻¹¹, +5.29 × 10⁻¹⁰) was done by hand and agrees with the module's −7.21 and +45.72; the specification was compared for the wording and behaviour cited, not line by line.
