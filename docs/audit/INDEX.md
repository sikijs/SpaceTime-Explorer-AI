# Audit Index: the 71 gap reports, ranked by size

Written 2026-11-02 from the 71 read-only gap reports (`docs/AUDIT-PLAN.md`, `docs/audit/00-checklist.md`). Sizes and gaps are the reading agents' own summaries of their reports, not the owner's decisions, and nothing was run in a browser. Specification numbers are used for Cosmic Horizons. Where a size says "M without Rule B" in a report, the full-Rule-B size is shown here.

**Sizes:** S = wording and labels only; M = new physics-module functions plus marks on one or two pictures; L = new pictures or panels, or a reading guide for several tables.

**Flags** (each is one agent's judgment for the owner to confirm):

- **P**: the guess has no natural picture, so a panel would have to be added to the nearest picture (A5).
- **R**: the introduction, caption or prediction text may reveal an answer before the learner predicts (§12).
- **W**: white already means something else in the drawing, so a white guess mark would clash and the owner must choose colours first.

Findings common to nearly all 71 (no guess marks, no "Where the real picture comes from" line, no reading guide or three-part look-fors, answers and verdicts computed in components, "right / off" verdicts in Results or the tutor's compare step) are not repeated in each row.

Counts: L 18, M-L 5, M 45, S-M 1, S 2. Flags: P 19, R 33, W 15.

## Large (18)

| Experiment | Title | Predictions | Size | Flags | Biggest gap |
|---|---|---|---|---|---|
| Relativity 5 | [Why can't light go faster?](relativity-of-time-and-motion/05-gap-report.md) | 3 | L | R | Hypothetical "everyday rule" panel looks the same as the real one; three guesses plus a marker-only choice |
| Relativity 6 | [Does motion change length?](relativity-of-time-and-motion/06-gap-report.md) | 2 | L | R | One-paragraph caption; hypothetical clock not marked imagined; preview draws part of Prediction 1 |
| Relativity 10 | [The twin paradox](relativity-of-time-and-motion/10-gap-report.md) | 1 | L | PR | No picture at all, so a guess has nowhere to go; intro says "come back younger" before the prediction (outcome bug fixed 9c3e0d2) |
| Gravity 5 | [What curves spacetime?](gravity-and-curved-spacetime/05-gap-report.md) | 4 | L | PR | Predicted strengths have no picture; intro answers all four; reuses Experiment 2 and 3 components |
| Gravity 6 | [Orbits](gravity-and-curved-spacetime/06-gap-report.md) | 3 | L | P | Drawing unlabelled with no caption; guesses are about ranges but the run shows one value |
| Gravity 7 | [What is a black hole?](gravity-and-curved-spacetime/07-gap-report.md) | 3 | L | PR | No escape-speed-against-mass picture; intro and a button reveal the idea; "event horizon" used before defined |
| Gravity 8 | [Does gravity bend light?](gravity-and-curved-spacetime/08-gap-report.md) | 3 | L | R | Drawing unlabelled with no caption; intro reveals Prediction 3 |
| Gravity 9 | [Real clocks in orbit: GPS](gravity-and-curved-spacetime/09-gap-report.md) | 3 | L | PR | Crossover ring drawn from the start gives away Prediction 2; no effect-against-altitude panel |
| Cosmology 10 | [The fate of the universe](cosmology/10-gap-report.md) | 2 | L | PR | Longest caption; eight-row table with no reading guide; hints toward both answers; closing synthesis depends on earlier modules |
| Black Holes 8 | [Spinning black holes](black-holes-and-strong-gravity/08-gap-report.md) | 4 | L | W | Four predictions across three pictures; horizon and "now" dots near-white |
| Spacetime Geom. 5 | [Energy, momentum and mass](spacetime-geometry/05-gap-report.md) | 3 | L | R | Three parts, about 11 tables with no notes, three captions and tutors; Part 1 works the invariant at 0.5c first |
| Spacetime Geom. 6 | [Making new particles](spacetime-geometry/06-gap-report.md) | 2 | L | R | No marks on bars or ledger; no reading guide for 5 tables; worked examples give both setups' usable energy before the guess |
| Cosmic Horizons 6 | [Where is the dark matter?](cosmic-horizons/06-gap-report.md) | 2 | L | - | No reading guide at all, plus no marks |
| Cosmic Horizons 7 | [Wide binary stars](cosmic-horizons/07-gap-report.md) | 2 | L | - | No reading guide for three tables; already uses the three-part look-for format |
| Cosmic Horizons 8 | [Does antimatter fall down?](cosmic-horizons/08-gap-report.md) | 2 | L | W | No marks, check-up or notes; white already used for real data |
| Cosmic Horizons 9 | [Can a clock tell its height?](cosmic-horizons/09-gap-report.md) | 2 | L | W | Both answers are numbers on log scales (good for marks); modules return only a unit name |
| Cosmic Horizons 10 | [Does time tick faster on the Moon?](cosmic-horizons/10-gap-report.md) | 2 | L | W | Prediction 1 is a marker only; unresolved 56 vs 58.7 µs note |
| Cosmic Horizons 11 | [The fastest spacecraft](cosmic-horizons/11-gap-report.md) | 2 | L | W | Check-up has no measured lag; guess unit differs from Picture 3's ms axis |

## Medium to large (5)

| Experiment | Title | Predictions | Size | Flags | Biggest gap |
|---|---|---|---|---|---|
| Grav. Waves 2 | [The chirp](gravitational-waves/02-gap-report.md) | 3 | M-L | PR | "Which mass is sooner" has no picture holding both masses; intro and coin analogy give answers |
| Grav. Waves 7 | [Standard sirens](gravitational-waves/07-gap-report.md) | 2 | M-L | PR | No near-versus-far picture; "recovered distance" is the input returned |
| Cosmology 9 | [Structure formation](cosmology/09-gap-report.md) | 2 | M-L | R | Caption prints real growth numbers and the head-start factor before the run; hard-coded verdicts |
| Spacetime Geom. 3 | [Cause before effect](spacetime-geometry/03-gap-report.md) | 1 | M-L | R | Picture shows one speed but the guess is about any observer; `simultaneitySpeed` unused |
| Spacetime Geom. 10 | [A fast object looks rotated, not squashed](spacetime-geometry/10-gap-report.md) | 2 | M-L | RW | Pre-run Picture 3 guide describes the faces, which answers Predictions 1 and 2 |

## Medium (45)

| Experiment | Title | Predictions | Size | Flags | Biggest gap |
|---|---|---|---|---|---|
| Relativity 3 | [Moving clock](relativity-of-time-and-motion/03-gap-report.md) | 1 | M | P | Track rescaled so the drawing looks the same at every speed; predicted reading has no picture |
| Relativity 4 | [The light clock](relativity-of-time-and-motion/04-gap-report.md) | 1 | M | - | Only "start" labels; no "How to read" caption; no tick-time scale |
| Relativity 7 | [Relativity of simultaneity](relativity-of-time-and-motion/07-gap-report.md) | 2 | M | - | No labels on the two panels; one-paragraph caption |
| Relativity 8 | [Drawing spacetime](relativity-of-time-and-motion/08-gap-report.md) | 1 | M | - | No axis, line or origin labels; Results and tutor appear while the diagram is still drawing |
| Relativity 9 | [Same time, different line](relativity-of-time-and-motion/09-gap-report.md) | 1 | M | - | No on-canvas labels; no worked moment (a guess line is easy to draw) |
| Relativity 11 | [The rod's own axes](relativity-of-time-and-motion/11-gap-report.md) | 1 | M | - | Orange axes and lines unlabelled; no picture of the predicted rod-frame times |
| Gravity 1 | [The equivalence principle](gravity-and-curved-spacetime/01-gap-report.md) | 1 | M | - | No guess mark, no "How to read" caption; tutor states the outcome at "compare" |
| Gravity 2 | [Does gravity change time?](gravity-and-curved-spacetime/02-gap-report.md) | 1 | M | - | No mark, caption or check-up; Results explains the effect before the tutor |
| Gravity 3 | [Tidal effects](gravity-and-curved-spacetime/03-gap-report.md) | 2 | M | R | No marks or caption; Results names and explains the effect before the tutor |
| Gravity 4 | [Curved spacetime](gravity-and-curved-spacetime/04-gap-report.md) | 2 | M | - | No marks or caption (best-labelled picture of the group) |
| Grav. Waves 1 | [Ripples in spacetime](gravitational-waves/01-gap-report.md) | 2 | M | R | No caption or on-canvas labels; intro gives Prediction 1 away |
| Grav. Waves 4 | [Comparing two real events](gravitational-waves/04-gap-report.md) | 1 | M | PR | No picture compares the two events; the question gives away the answer |
| Grav. Waves 5 | [Redshift of a receding source](gravitational-waves/05-gap-report.md) | 2 | M | PR | The "more than classical Doppler" answer is not drawn; intro gives hints |
| Grav. Waves 6 | [Triangulation](gravitational-waves/06-gap-report.md) | 2 | M | R | Prediction 1 asked before a direction is chosen; Results says "right / off this time" |
| Cosmology 1 | [Hubble's Law](cosmology/01-gap-report.md) | 2 | M | P | Results says "right / off"; "twice as far" has no picture |
| Cosmology 2 | [The Big Bang](cosmology/02-gap-report.md) | 2 | M | P | No marks on the time ruler; caption and Results hint at both answers |
| Cosmology 3 | [The Cosmic Microwave Background](cosmology/03-gap-report.md) | 2 | M | PR | Caption and assumptions give away both answers; sky-circle differences are one RGB step |
| Cosmology 4 | [Dark matter](cosmology/04-gap-report.md) | 2 | M | - | No marks on the speed graph (natural home); 5% verdict in the component |
| Cosmology 5 | [Dark energy](cosmology/05-gap-report.md) | 2 | M | PR | Caption says "dimmer ... speeding up" before the run; slowing/speeding guess has no picture |
| Cosmology 6 | [How old is the universe?](cosmology/06-gap-report.md) | 2 | M | R | No marks on the age graph; caption reveals matter-only is younger |
| Cosmology 7 | [Gravitational lensing](cosmology/07-gap-report.md) | 2 | M | R | Picture 3 caption states "four times the mass gives twice as wide" before the run |
| Cosmology 8 | [The observable universe](cosmology/08-gap-report.md) | 2 | M | R | Caption prints the chosen source's distances; predictions are about fixed sources |
| Black Holes 1 | [How small must something be to become a black hole?](black-holes-and-strong-gravity/01-gap-report.md) | 2 | M | P | Prediction 2 (1,000 times the mass) has no picture; Results gives "right / off" verdicts |
| Black Holes 2 | [Time near a black hole](black-holes-and-strong-gravity/02-gap-report.md) | 3 | M | - | Picture 2 can carry all three guesses; no check-up or source lines |
| Black Holes 3 | [Orbits near a black hole](black-holes-and-strong-gravity/03-gap-report.md) | 3 | M | - | Purple ring and graph can carry guess 2; guesses 1 and 3 are markers |
| Black Holes 4 | [Light near a black hole](black-holes-and-strong-gravity/04-gap-report.md) | 3 | M | - | Bend-against-aim graph is the natural home; captions have no "what to look for" |
| Black Holes 5 | [Falling in](black-holes-and-strong-gravity/05-gap-report.md) | 3 | M | R | Two graphs can hold the guesses; no three-part look-fors |
| Black Holes 6 | [Seeing the fall](black-holes-and-strong-gravity/06-gap-report.md) | 3 | M | W | No marks on any of three pictures; Results marks each guess itself |
| Black Holes 7 | [The color of the fall](black-holes-and-strong-gravity/07-gap-report.md) | 3 | M | PW | Prediction 3 (black hole size) has no picture |
| Black Holes 9 | [How a black hole forms](black-holes-and-strong-gravity/09-gap-report.md) | 3 | M | RW | Prediction 2's 30 Suns answer is off the ladder's scale; possible hint in intro |
| Black Holes 10 | [Hawking radiation](black-holes-and-strong-gravity/10-gap-report.md) | 3 | M | RW | Mechanism and Prediction 2 answer already printed before the tutor |
| Spacetime Geom. 1 | [The interval](spacetime-geometry/01-gap-report.md) | 1 | M | R | Green blocks drawn the same length in every row, so a guess has no scale; prediction text leans toward "bigger" |
| Spacetime Geom. 2 | [Light cones](spacetime-geometry/02-gap-report.md) | 1 | M | R | Always-visible caption explains the cone regions before the guess |
| Spacetime Geom. 4 | [What you see is the past](spacetime-geometry/04-gap-report.md) | 1 | M | R | Postcard comparison and a worked example (0.4c to 0.67c) before the prediction |
| Spacetime Geom. 7 | [Aberration](spacetime-geometry/07-gap-report.md) | 1 | M | - | No mark on the traveler's sky; look-fors are bare questions |
| Spacetime Geom. 8 | [The Doppler effect](spacetime-geometry/08-gap-report.md) | 2 | M | W | No marks on the spectrum bar |
| Spacetime Geom. 9 | [The traveler's whole sky](spacetime-geometry/09-gap-report.md) | 2 | M | RW | No marks on the brightness bar; rain example near Prediction 1's answer |
| Cosmic Horizons 1 | [Hubble tension](cosmic-horizons/01-gap-report.md) | 2 | M | P | Prediction 2 (Webb result) has no picture; "What if" wording |
| Cosmic Horizons 2 | [Does dark energy change?](cosmic-horizons/02-gap-report.md) | 2 | M | - | No marks or source lines; predictions not listed in Results |
| Cosmic Horizons 3 | [How lumpy is the universe?](cosmic-horizons/03-gap-report.md) | 2 | M | - | No marks; sigma comparison exists but has no notes |
| Cosmic Horizons 4 | [Can the universe weigh a neutrino?](cosmic-horizons/04-gap-report.md) | 2 | M | - | Prediction 1 uses a fixed total but the marker moves with the control |
| Cosmic Horizons 5 | [How early can galaxies form?](cosmic-horizons/05-gap-report.md) | 2 | M | - | No marks, check-up or notes |
| Cosmic Horizons 12 | [Betelgeuse](cosmic-horizons/12-gap-report.md) | 2 | M | W | Rule B done; remaining: marks, source lines, "drawn in white" sentence |
| Cosmic Horizons 13 | [Catching a supernova](cosmic-horizons/13-gap-report.md) | 2 | M | PW | Prediction 2 (how long ago) has no picture |
| Cosmic Horizons 14 | [What makes a white dwarf explode?](cosmic-horizons/14-gap-report.md) | 2 | M | W | Smallest of the group; module has numeric answers; pre-run ESO link may reveal Prediction 1 |

## Small to medium (1)

| Experiment | Title | Predictions | Size | Flags | Biggest gap |
|---|---|---|---|---|---|
| Grav. Waves 3 | [Where the energy comes from](gravitational-waves/03-gap-report.md) | 1 | S-M | R | Energy graph exists, so a mark is easy; intro says "draining away" first |

## Small (2)

| Experiment | Title | Predictions | Size | Flags | Biggest gap |
|---|---|---|---|---|---|
| Relativity 1 | [One clock](relativity-of-time-and-motion/01-gap-report.md) | 1 | S | - | Event Interval strip has no time scale, so a guess has nowhere to sit; no caption |
| Relativity 2 | [Two clocks at rest](relativity-of-time-and-motion/02-gap-report.md) | 2 | S | - | Same strip with no scale; no caption |

## Things outside the ranking

- **Fixed:** Relativity 10's Results and tutor said the traveling twin is older. Fixed in `9c3e0d2` with a test.
- **Typo, not fixed:** `setThresthresholdPrediction` at `BlackHoleFormationExperiment.tsx:426`.
- **Specification headers that look stale** (they say wording approval is not done, CLAUDE.md says approved): Relativity 8, 10, 11; Gravitational Waves 4, 6, 7.
- **"Change predictions" button** after the results are shown: Gravitational Waves 2 to 7. Owner decision.
- **Shared components:** Gravity 5 reuses Gravity 2's `RocketCabinClocks` and Gravity 3's `Cabin`; Cosmology 10's `CosmologySynthesis.tsx` and Spacetime Geometry 10's synthesis read figures from earlier modules. Changing those experiments means rechecking the dependants.
- **"What if" wording** (the owner asked for "trial values"): Cosmic Horizons 1 and 7.
- **Unsourced or inconsistent claims** are listed under O2 in each report (for example Gravity 9's +38 µs/day, Gravitational Waves 7's H0 string).
