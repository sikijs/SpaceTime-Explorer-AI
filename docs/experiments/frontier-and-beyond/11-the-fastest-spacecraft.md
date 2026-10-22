# Experiment 11 (Frontier and Beyond): The Fastest Spacecraft: How Much Does Its Clock Lag? (Parker Solar Probe)

**Status: Specification APPROVED by the owner on 2026-10-22 ("approve defaults": all ten decisions on their defaults), proposed by Claude on 2026-10-22 per `CLAUDE.md` §23 Stages 1 to 3, as the eleventh experiment of the group approved on 2026-10-16 (`00-group-proposal.md`, item 11, "Part B: testing gravity and time", marked ◇). BUILT (physics model and 28 tests in `src/physics/fastestSpacecraft.ts` and `fastestSpacecraft.test.ts`, checked by seventeen deliberate breaks; interface, two predictions, a five-stage run, three pictures, two controls, four tables, a "Words and formulas" panel, tutor and chapter summary in `FastestSpacecraftExperiment.tsx` and `FastestSpacecraftTutor.tsx`), complete-flow tested in Chrome (all nine prediction pairs and 27 control settings against a separate calculation) and finally reviewed on 2026-10-22. The owner approved the wording of each step as it was built (Steps 2 to 8, 2026-10-22) and the review's fixes 1, 2, 3, 4 and 6 ("fix 1, 2, 3, 4 and 6", 2026-10-22); this text now describes what is built, and the Implementation Notes keep the step-by-step history and the differences from the first proposal. The owner approved the whole list of differences from the first proposal ("differences approved", 2026-10-22; they are in the Implementation Notes), and `CLAUDE.md` §27 was brought up to date. Committed.**

**Sources read on 2026-10-22 (through fetch summaries; no mission paper was read in full):** NASA's blog of 10 September 2026 (29th close approach on 4 September 2026, "within 3.8 million miles", "430,000 miles per hour", mission "extended into 2029 as a result of the 2026 Heliophysics Senior Review"); NASA's blog of 18 December 2025 (records "set and subsequently matched during close approaches on Dec. 24, 2024; March 22; June 19; and Sept. 16", 3.8 million miles, 687,000 kph); the Guinness World Records entry ("6,167,590 km", "192.22 km/sec (692,000 km/h; 430,000 mph) relative to the Sun", 24 December 2024, 11:53:48 UTC); NASA's Parker Solar Probe page (launched 12 August 2018, "closer to the Sun than any previous human-made object", "fastest human-made object", with its own 2020 figure of 244,225 mph); NASA's visualization of the extended mission (3.8 million miles, 430,000 mph, projected orbit through 2029); NASA's "The Sun" page; NIST's "What Time Is It on the Moon?" (12 August 2024); and the abstract of Fox and others, Space Science Reviews 204 (2016), on Princeton's record (24 orbits over seven years, Venus gravity assists, perihelion below 10 solar radii in the final three orbits). The publisher's page of Fox and others redirected to a sign-in cookie and could not be read, and the APL mission page timed out. The 192.22 km/s comes from the Guinness entry; NASA's pages read give 430,000 mph (the same speed).

---

## Overview

Experiment 10 found that a clock on the Moon **gains** on a clock on the Earth, because gravity and motion pull in different directions there: the Moon's weaker gravity speeds the clock up (compared with the Earth's), and its motion slows it. This experiment goes to the opposite extreme: **a place where gravity and motion both slow the clock, and by almost the same amount.**

On 24 December 2024 NASA's Parker Solar Probe passed 6.17 million kilometres above the Sun's surface at 192.22 kilometres per second (430,000 miles per hour), a distance and speed it has matched on the passes since, most recently on 4 September 2026 (its 29th close approach). That speed is about 0.064 percent of the speed of light: fast enough to matter for a clock, and slow enough that the weak-field formula of Experiment 10 works.

The learner rebuilds three ideas:

1. **At the probe's closest point, gravity and speed both slow its clock, and almost equally.** Compared with a clock far from everything, the probe's clock ticks slower by `GM ÷ (r c²) + v² ÷ (2c²)`. Computed: gravity 2.151 × 10⁻⁷, speed 2.056 × 10⁻⁷, total **4.207 × 10⁻⁷**, which is 36.35 milliseconds a day (gravity 18.6, speed 17.8).
2. **Compared with a clock on the Earth, the probe's clock loses 35.01 milliseconds a day at that point** (4.052 × 10⁻⁷). The Earth's clock is itself slowed by 1.550 × 10⁻⁸ (the Earth's own gravity, the Sun's gravity at 1 AU and the Earth's speed round the Sun).
3. **That is not a steady rate.** The probe goes round an oval orbit about every 88 days, out to 0.73 AU. Gravity's part falls about 16 times and motion's part about 256 times from the closest point to the far end, so in this model the lag falls to zero at 0.70 AU and the probe's clock is very slightly ahead of the Earth's farther out (0.10 ms a day at the far end, a model number). If the closest-point rate lasted a whole orbit the lag would be 3.08 s; averaged over the orbit it is 0.173 s.

It says honestly what it does **not** do: it does **not** model the real orbit (the planets' pulls, the Venus flybys), it does **not** say that the probe's clock has been compared with a clock on the Earth, and it does **not** say how the mission keeps or corrects its clock. The 35 ms is a calculation, not a measurement by this mission.

The new ideas are (1) **both terms slow the clock, so they add**, (2) **a clock's rate changes along an elliptical orbit**, and (3) **a clock's lag is small as a fraction and still large against the precision of modern clocks** (only as a scale: light travels about 10,500 km in 35 ms).

---

## Learning Objective

After this experiment, the learner should understand:

1. A clock's rate is lowered by `Φ ÷ c² + v² ÷ (2c²)`; near the Sun both terms lower it.
2. At closest approach the two terms are nearly equal (2.151 × 10⁻⁷ and 2.056 × 10⁻⁷), the total is 4.207 × 10⁻⁷ and the clock loses 36.35 ms a day against a clock far from everything (computed).
3. Against the Earth's equator clock (1.550 × 10⁻⁸) the loss is 35.01 ms a day (computed).
4. Along the orbit the total changes: gravity's part falls about 16 times and motion's about 256 times from the closest point to the far end (0.73 AU); the lag against the Earth's clock falls to zero at 0.70 AU and is −0.10 ms a day (the probe ahead) at the far end, in this model.
5. Over one whole 88-day orbit the lag is 0.173 s, not the 3.08 s that the closest-point rate would give.
6. Calculation versus measurement, as of October 2026.

---

## Physical Situation

**Reused:** both clock-rate terms (Experiment 10; Gravity 2 and 9); moving clocks run slow (Relativity of Time and Motion 3 and 4); elliptical orbits and the speed from energy (Gravity 6).

**Simplifying assumptions (stated to the learner in plain language):** weak-field formula; spherical Sun with GM 1.32712440018 × 10²⁰ m³/s² and radius 695,700 km (a standard value, not read from a source for this page); the closest point uses NASA's distance (6,167,590 km above the surface) and speed (192.22 km/s); the rest of the orbit is a plain oval (ellipse) with that closest distance and a period of 88 days (from the usual description of the mission, not read from a NASA page), with the speed from energy; the planets' pulls, the Venus flybys and the Sun's spin are ignored; the Earth's clock is the equator clock of Experiment 10 with the Sun's gravity at 1 AU and the Earth's mean orbital speed (29.78 km/s) added.

**Not introduced:** coordinate time, the exact metric, how the probe's clock is kept or corrected, the Shapiro delay.

---

## Physics Model (`src/physics/fastestSpacecraft.ts`, imports nothing)

| Item | Value |
|---|---|
| Closest approach (NASA via Guinness) | 6,167,590 km above the surface; 192.22 km/s; 24 December 2024 |
| Distance from the Sun's centre | 6,167,590 + 695,700 = 6,863,290 km = 0.0459 AU = 9.87 solar radii (computed; Fox and others: below 10 solar radii in the final orbits) |
| Gravity term | `GM_Sun ÷ (r c²)` = 2.1515 × 10⁻⁷ |
| Speed term | `v² ÷ (2c²)` = 2.0555 × 10⁻⁷ |
| Total | 4.2070 × 10⁻⁷ = 36.35 ms a day |
| Earth's equator clock | 6.966 × 10⁻¹⁰ (Experiment 10) plus Sun at 1 AU 9.871 × 10⁻⁹ plus orbit 4.934 × 10⁻⁹ = 1.550 × 10⁻⁸ (gravity 1.057 × 10⁻⁸, motion 4.935 × 10⁻⁹) |
| Probe against Earth | 4.052 × 10⁻⁷ = 35.01 ms a day |
| The oval | a = 5.7923 × 10¹⁰ m (from the 88-day period), far end 0.7285 AU; speed at the closest point from energy 190.7 km/s, 0.8 percent below NASA's 192.22 (the real orbit is not exactly an 88-day two-body oval): NASA's speed is used at the closest point, the oval's everywhere else |
| Orbit average | time-average of `1/r` over an ellipse is `1/a`, so the two terms average `1.5 GM ÷ (a c²)` = 3.824 × 10⁻⁸; lag over 88 days against the Earth: 0.1729 s (the closest-point rate would give 3.081 s) |
| Where the clocks match | 0.6989 AU (bisection); beyond it the probe's clock is the faster one, by 0.0993 ms a day at the far end |

Computed on 2026-10-22 with `c = 299,792,458 m/s`. The functions are `closestApproachDistance`, `semiMajorAxis`, `farOrbitDistance`, `closestApproachTerms`, `orbitTerms(distance)`, `orbitSpeed(distance)`, `speedAt(distance)` (NASA's speed at the closest point, the oval's elsewhere, for display), `orbitAverageTerms`, `earthTerms`, `lagMillisecondsPerDay`, `gapSeconds`, `lagOverOneOrbitSeconds`, `earthMatchDistance`, `effectsOf`, `timeScale`, `effectsAnswer`, `sizeAnswer` and `runFastestSpacecraft(distance, seconds)`. Out-of-range inputs throw `RangeError`.

---

## Learner Controls

1. **Run:** gated on both predictions.
2. **After the run only, "Where on the orbit?":** a slider from the closest point to the far end (a log scale, 101 steps; the ends are exact), with a readout of the distance and speed.
3. **After the run only, "For how long (if the probe stayed at that point)?":** buttons for 1 day, 1 orbit (88 days) and 1 year (365.25 days); the page says that a real probe does not stay at one point.
4. **The pictures follow:** Picture 1 gets a white-outlined third bar with the point's parts, Picture 2 a white ring on the oval, Picture 3 a white ring on the curve. **Table 4** reports the learner's point.
5. **A "Start over" button** that resets the predictions, the run and both controls.

---

## Prediction Activity

Two questions, both answered before Run is enabled. Not scored while the learner is predicting; the tutor marks each as matched or not matched in its explanation (the group's pattern). Each ends "You are not graded, and a guess is fine."

> **Prediction 1: gravity and speed.** At its closest point to the Sun, the probe is deep in the Sun's gravity and moving very fast. Compared with a clock far from everything, what do these two effects do to the probe's clock? Do they **both slow** it, **both speed it up**, or **work against each other** (one speeds it up and the other slows it down)?
>
> **Prediction 2: how much in one day?** Imagine the probe stayed at its closest point for **one whole day**, and a clock on the Earth kept time for the same day. How far apart would the two clocks be at the end of the day? Buttons: **About 35 microseconds**, **About 35 milliseconds**, **About 35 seconds**.

Right answers: Prediction 1 is **both slow** (the natural wrong answers: "work against each other", from Experiment 10; "both speed up"). Prediction 2 is **about 35 milliseconds** (35.01 ms; the natural wrong answers: microseconds, from the Moon's tens of microseconds; seconds, from the probe's speed and the Sun's gravity). The buttons give the number 35 (decision 4). Differences from the first proposal's wording: Prediction 1 omits the Moon parenthetical, which nearly gives the answer away (§12), and Prediction 2 asks "how far apart", not "how far behind".

---

## Experiment Behavior

### Introduction (as built; the owner approved the wording on 2026-10-22; the full text is in `FastestSpacecraftExperiment.tsx`)

The status line; the question; where we left off (Gravity 2 and 9, Experiment 10, Relativity of Time and Motion 3 and 4, Experiment 9 of this group); why this spacecraft and why now (Parker Solar Probe, NASA's records and the 29th close approach, the extension into 2029, the 88-day orbit); a drawing of the orbit to scale (Sun, Earth's and Venus's orbits, the probe's oval, its closest point and far end, the far-away clock) with a guide, a worked moment and three "Look at / What it means / Why it matters" items; what can change a clock's rate here; tiny numbers and times; where the question stands (October 2026); new words (orbit and closest approach, astronomical unit, speed compared with light); what the learner does; what we assume; and the "Want to know more?" list. It does not give the sizes of the terms or the sign of the result.

**"Want to know more?" links, visible from the start** (each fetched on 2026-10-22): NASA's blogs of 10 September 2026 and 18 December 2025, NASA's Parker Solar Probe page, NASA's "The Sun", NASA's visualization of the extended mission, and NIST's "What time is it on the Moon?" (the same two effects as here). **Kept back until after the run:** Fox and others, Space Science Reviews, 2016 (through its DOI; the publisher's page may ask for a subscription).

### Display

Three pictures, each with every component labelled on the canvas (§14) and a guide beneath it (what is drawn, the units, a worked moment with real numbers, and "what to look for" items in three parts, each shown only once its feature is drawn):

- **Picture 1: "What changes each clock's rate?"** Horizontal stacked bars of the fraction by which a clock ticks slower than one far from everything (axis to 4.5 × 10⁻⁷), gravity in lavender and motion in green: the Earth's equator clock (1.55 × 10⁻⁸), the probe at its closest point (4.21 × 10⁻⁷), a yellow bracket for the difference (4.05 × 10⁻⁷), and after the run a white-outlined bar for the learner's point.
- **Picture 2: "How the probe's clock differs from the Earth's round its orbit."** The oval to scale with five labelled points (far end, 0.40, 0.20, 0.10 AU and the closest point), each with its distance, speed and lag ("behind" or "ahead"), and after the run a white ring.
- **Picture 3: "The lag against the distance, and over a whole orbit."** The lag in ms a day against the distance (log scale, 0.04 to 0.8 AU), with the closest-point dot (35.0), the dot where the clocks match (0.70 AU) and the far end (−0.1), and two bars for one orbit (3.08 s and 0.173 s); after the run a white ring.

### Run

Five named stages of 2.6 seconds each: (1) "A clock on the Earth" (Picture 1: the Earth's bar), (2) "A clock on the probe" (Picture 1: the probe's bar), (3) "The difference" (Picture 1's bracket), (4) "Along the orbit" (Picture 2), (5) "A whole orbit" (Picture 3). Playback speed does not change any number (§11). At the end the run calls `onComplete`.

### Results (neutral, then explained by the tutor)

Shown only after the run completes: the status label, then four tables and the formulas. **Table 1:** the two clocks term by term, the difference and the lag in a day. **Table 2:** five points on the orbit (distance, speed, total slowing, the lag) and the lag after one whole orbit (3.08 s and 0.173 s). **Table 3:** the published facts with their sources (NASA's dates and records, the Guinness figures, the mission's plan, NASA's "fastest and closest"). **Table 4:** the learner's own point. The "Words and formulas" panel gains seven entries after the run (the slowing formula, the probe at its closest point, the Earth's clock, the lag of one clock behind another, a speed on an oval orbit, the average over an orbit, solar radii). The held-back link is listed below the tables, followed by the tutor.

**Status label (as built):** "Settled: the probe's distance and speed (NASA's) and the physics (the formula has been tested with clocks on the Earth and in orbit). A calculation: the lag of 35 milliseconds a day at the closest point is worked out here from relativity, and the sources read for this page do not report the mission measuring it."

---

## Expected Observations

- At the closest point the probe's gravity and speed parts are 2.15 × 10⁻⁷ and 2.06 × 10⁻⁷; its clock is 35.01 ms a day behind the Earth's.
- The lag falls from 35.0 to 14.6 (0.10 AU), 6.1 (0.20 AU), 1.8 (0.40 AU) and −0.10 ms a day at the far end (0.73 AU); the clocks match at 0.70 AU.
- Over a whole 88-day orbit the lag is 0.173 s.

## Expected Learner Understanding

The learner should leave able to say, in their own words: that near the Sun gravity and motion both slow a clock and add; roughly how big the lag is and that it is a calculation; why it changes round the orbit; and why the lag over a whole orbit is much less than the closest-point rate suggests.

## New Concepts Introduced

Both terms slowing a clock (adding), the change of a clock's rate along an orbit, and averaging over an orbit.

## Relationship to Previous Experiments

Builds on Experiment 10 (the same formula, with the opposite sign pattern), Gravity 2, 6 and 9, and Relativity of Time and Motion 3 and 4.

## Relationship to Later Experiments

Experiment 12 of the group (the black hole area theorem) has no specification yet. The closing recap of the group sorts all nineteen results by status label.

---

## Required Physics Tests (as built: 28 tests; each fails when the module is deliberately broken)

1. `closestApproachTerms()`: gravity 2.1515 × 10⁻⁷, speed 2.0555 × 10⁻⁷, total 4.2070 × 10⁻⁷; the distance is 6,863,290 km. 2. The lag against a clock far from everything is 36.35 ms a day. 3. The lag against the Earth's clock is 35.01 ms a day, and proportional to the time. 4. Both terms are positive (both slow), within 5 percent of each other; `effectsOf` names the other cases. 5. Along the orbit both terms fall steadily from the closest point to the far end. 6. The far-end terms are far smaller. 7. The oval's speed at the closest point is 190.74 km/s, within 1 percent of NASA's; the semi-major axis and the far end (0.7285 AU) are right. 8. The time-average of the terms is `1.5 GM ÷ (a c²)`, checked against a numerical average over the ellipse; the lag over one orbit is 0.173 s against 3.08 s. 9. The published data equal the module's constants. 10. Out-of-range inputs throw `RangeError`. 11. The module imports nothing. 12. `earthMatchDistance()` is 0.699 AU, with the probe's clock the slower one inside it and the faster one outside. 13. `speedAt` is NASA's 192.22 km/s at the closest point, the oval's speed elsewhere, and agrees with the speed term. 14. The predictions' answers (`effectsAnswer()` is "both slow", `sizeAnswer()` is "millisecond"), `timeScale` and `runFastestSpacecraft`.

---

## AI Tutor Behavior (as built)

The group's pattern (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next (Continue enabled only after a reply). The predictions are marked as matched or not matched in the explanation only, with a note for each natural wrong answer. The explanation has seven parts: (1) two parts that add (two leaks in a bucket); (2) why 35 and not 36 ms (the Earth's clock is slowed too); (3) why the rate changes round the orbit (a ball thrown upward); (4) whether the probe's clock could tick faster than the Earth's (the crossing at 0.70 AU, as a model number); (5) the lag over an orbit (a car on a long drive); (6) calculation and measurement; (7) what was shown and what was not. The tutor does not say that time near the Sun "flows" differently in an absolute way.

### Chapter summary (as built; wording approved 2026-10-22; it is in `src/App.tsx`)

"What you learned" and "What's next", shown only after the tutor's explanation. "What's next" names no experiment, because Experiment 12 has no approved specification. Experiment 10's "What's next" now points to this experiment.

---

## Decisions for the owner (all ten settled on their defaults, 2026-10-22)

1. Anchor on Parker Solar Probe's record pass. 2. Two predictions. 3. NASA or APL source for "the fastest": found on NASA's Parker Solar Probe page (the 192.22 km/s itself is from the Guinness entry; NASA's pages read give 430,000 mph). 4. Prediction 2 gives "35" in its buttons. 5. Compare with the Earth's clock as the headline (and with a clock far from everything). 6. Status label as above. 7. Five stages. 8. Closest point from NASA's numbers, a plain oval for the rest, with the 0.8 percent mismatch stated. 9. The lag over an orbit is included. 10. Experiment 10's "What's next" points here.

## Open items

The 88-day period, the Sun's radius, the Earth's orbital speed and Venus at about 0.72 AU are not read from a source for this page; the statement that the formula has been tested with clocks on the Earth and in orbit rests on the project's earlier experiments; "the sources read do not report the mission measuring it" is limited to the sources read; the Fox and others publisher page and the APL mission page were not read; the 0.10 ms "ahead" figure rests on the oval model; and the experiment has not been checked in other browsers, with a keyboard, with a screen reader or with a real learner. At narrow widths the drawings scale down and their labels become small (the same limit as the group's other experiments).

---

## Implementation Notes

**Step 1 (physics model and tests), 2026-10-22.** Built as planned, with these choices the specification left open:
- `Terms` has two fields (`gravity`, `speed`) and a `total`, because this experiment has one gravitating body for the probe. The Earth's clock adds the Sun's gravity at 1 AU to its own gravity term, and the Earth's orbital speed (29.78 km/s) to its speed term.
- The closest point uses NASA's 192.22 km/s (`closestApproachTerms`); every other point uses the ellipse's energy-based speed (`orbitTerms`), which gives 190.74 km/s at the closest point, 0.8 percent lower (decision 8). `runFastestSpacecraft` uses NASA's speed when the distance is exactly the closest distance.
- The time-average of the two terms over a whole orbit is `1.5 GM / (a c²)` (3.824 × 10⁻⁸), checked against a numerical average over the ellipse. Against the Earth's clock the lag over one orbit is 0.173 s (computed), against 3.08 s if the closest-approach rate lasted 88 days. This supports decision 9.
- The far end of the orbit is 0.7285 AU (computed from the 88-day period and the closest distance, not read from NASA).
- Prediction 2's answer scale has three units (microsecond, millisecond, second); its answer is "millisecond" (35.01 ms).
- The Sun's radius (695,700 km) and the 88-day period are not yet source-checked (open items).

**Step 2 (interface), 2026-10-22.** Built in `FastestSpacecraftExperiment.tsx` and wired into `src/App.tsx` as the last chapter. Introduction, drawing of the probe's orbit (to scale apart from the Sun's size) with its guide, collapsed "Words and formulas" panel and two NASA links; the owner approved the wording on 2026-10-22. Experiment 10's "What's next" now points here (decision 10). Unsourced in the new text: Venus at about 0.72 AU; "flies close to the Sun to study it"; "the closest approach to the Sun, and the highest speed, of any spacecraft so far" (from the Guinness entry, not read on a NASA page). The introduction states the two rules (gravity slows, motion slows), which Prediction 1 can therefore be reasoned from.

**Step 3 (predictions), 2026-10-22.** Two predictions with Run gated on both and a Start over button. Run only records the predictions, because the run is Step 4. Differences from the "Prediction Activity" wording above, for the owner's approval: (1) Prediction 1 omits the parenthetical "(The Moon's clock was the case where they work against each other.)", because it nearly gives the answer away (§12); (2) Prediction 2 asks "how far apart would the two clocks be", not "how far behind", so that it does not say which clock is behind; (3) the buttons are "About 35 microseconds / milliseconds / seconds", with the 35 given, as decision 4 chose.

**Step 4 (the run and three pictures), 2026-10-22.** Five stages of 2.6 seconds (1 "A clock on the Earth", 2 "A clock on the probe", 3 "The difference", 4 "Along the orbit", 5 "A whole orbit"); playback speed changes no number (§11). Picture 1 (stacked bars: Earth's clock, probe's clock, a yellow bracket for the difference, 4.05 × 10⁻⁷ = 35.0 ms a day), Picture 2 (the orbit to scale with five labelled points, from the far end, 12 km/s, 0.1 ms a day ahead, to the closest point, 192 km/s, 35.0 ms a day behind) and Picture 3 (the lag against the distance on a log scale, and two bars for one whole orbit: 3.08 s if the closest-point rate lasted, 0.173 s for the real orbit). Each picture has every part labelled and a guide with a worked moment and "Look at / What it means / Why it matters" items (shown only once the feature is drawn). Differences from the plan above, for the owner's approval:
- **The Moon bar is left out of Picture 1.** On a scale that fits the probe's bar (up to 4.5 × 10⁻⁷) the Moon's 4.87 × 10⁻¹¹ would be invisible, and it would need Experiment 10's constants in this module, which imports nothing.
- **A finding the plan did not have:** against the Earth's equator clock the probe's clock is the slower one only inside 0.70 AU; farther out, up to the far end at 0.73 AU, it is very slightly the faster one (0.1 ms a day at the far end), because the Earth's own speed (29.78 km/s) and place in the Sun's gravity lower its clock by 1.55 × 10⁻⁸, more than the probe's 1.43 × 10⁻⁸ there. Picture 3 shows this with a blue dot at the crossing. The module gained `earthMatchDistance()` (bisection) and two tests (25 tests in all), checked by two deliberate breaks. The 0.1 ms figure rests on the 88-day oval and on the Earth's mean orbital speed, so it is a model number, not a measurement.
- **Picture 2 and Picture 3 are separate stages (4 and 5)**; the plan put the oval and the curve together in "along the orbit".
- **The closest-point label in Picture 2 and the curve's first point use NASA's speed (192 km/s, 35.0 ms a day)**; the other points use the oval (the closest point of the oval itself would give 34.7). The caption says the numbers come from NASA's speed at the closest point and a plain oval for the rest.
- Not checked: narrow widths, other browsers, keyboard use, a real learner. The results panel, the "Look closer" control (decision 9's "Where on the orbit?" slider), the "Words and formulas" entries with formulas, the tutor and the chapter summary are later steps.

**Step 5 (results), 2026-10-22.** Built in `FastestSpacecraftExperiment.tsx`, shown after the run: the status label ("Settled: the probe's distance and speed (NASA's) and the physics. A calculation: the lag of 35 milliseconds a day at the closest point is worked out here from relativity, and the sources read for this page do not report the mission measuring it."), three tables (1: the two clocks term by term and the 35.01 ms lag; 2: five points round the orbit, and the lag after one whole orbit, 3.08 s against 0.173 s; 3: the published facts and their sources), seven formula entries in the "Words and formulas" panel (shown only after the run), and a link to Fox and others (Space Science Reviews, 2016) kept back until after the run. Every number is from the module. Differences from the plan above, for the owner's approval:
- **Two links added to the introduction's "Want to know more?" list** (§29 rule 3): NASA's Parker Solar Probe page and NASA's "The Sun" page (both fetched 2026-10-22). The first confirms the launch in 2018, the purpose, "closer to the Sun than any previous human-made object" and the "fastest human-made object" claim (with the page's own 2020 figure of 244,225 mph), which resolves open item 3 of the specification (decision 3) for "fastest". The Sun page gives no size or mass.
- **The Fox and others link is the DOI**, which goes to the publisher's page. The abstract was read on Princeton's record (`collaborate.princeton.edu`): 24 orbits over seven years, Venus gravity assists, perihelion below 10 solar radii in the final three orbits. The publisher's page itself redirected to a sign-in cookie and could not be read. This experiment's closest point is 9.87 solar radii from the Sun's centre, which agrees.
- **Table 4 and the "Where on the orbit?" and "For how long?" controls** (the specification's "Learner Controls", decision 9) are not built in this step; they are a later step, as in Experiment 10.
- Still unsourced: the 88-day orbit (NASA's pages read give no period), the Sun's radius (a standard value), the Earth's orbital speed and Venus at 0.72 AU; the status label's "the physics has been tested with clocks on the Earth and in orbit" is a general statement from Gravity Experiments 2 and 9 and the earlier experiments of this group, not a source read for this page.

**Step 6 (controls), 2026-10-22.** Built in `FastestSpacecraftExperiment.tsx`, shown after the run, above the results: **"Where on the orbit?"**, a slider from the closest point to the far end (a log scale with 101 steps; the two ends are exact, so the closest point uses NASA's 192.22 km/s and the far end the oval's 0.7285 AU), and **"For how long (if the probe stayed at that point)?"**, three buttons (1 day, 1 orbit of 88 days, 1 year of 365.25 days; the page says that a real probe does not stay at one point). The choice adds a white-outlined third bar to Picture 1 (with its parts), a white ring on the oval in Picture 2 (labelled with the distance, speed and lag) and a white ring on the curve in Picture 3, and fills **Table 4** (distance, speed, gravity, motion, total, the Earth's clock, the lag per day, the time and the gap at that rate). Start over resets both controls. Every number is from the module. Checked in Chrome: the readout at 0.183 AU (86.1 km/s, 6.89 ms a day, 606.25 ms over 88 days) against a separate Python calculation, and the two ends (35.01 ms behind at the closest point, 0.10 ms ahead at the far end). Differences from the plan above, for the owner's approval:
- **The durations are 1 day, 1 orbit and 1 year** (the plan's "1 day, 1 orbit, 1 year" with the year labelled as an assumption); the slider is on a log scale like Picture 3, and its step is a position, not a distance.
- **The controls come before the Results heading**, so that the pictures above them change as the learner moves the slider.
- Not checked: narrow widths, other browsers, keyboard use of the slider, a real learner. The tutor and the chapter summary are later steps.

**Step 7 (tutor and chapter summary), 2026-10-22.** The tutor is `src/components/FastestSpacecraftTutor.tsx` (the group's pattern: observe, compare with the predictions, one conceptual question, each answered before Continue is enabled, then the explanation). It marks each prediction as matched or not matched in the explanation only, with a note for each natural wrong answer (for Prediction 1, "work against each other" from Experiment 10 and "both speed up"; for Prediction 2, "microseconds" and "seconds", with the fraction each would need). The seven parts of the explanation: (1) two parts that add (the two-leaks example, with the worked numbers); (2) why 35 and not 36 milliseconds (the Earth's clock is slowed too); (3) why the probe's clock does not keep one rate (gravity's part falls about 16 times and motion's about 256 times from the closest point to the far end, because it depends on the square of the speed; the ball thrown upward example); (4) could the probe's clock tick faster than the Earth's (the crossing at 0.70 AU, and 0.10 ms a day ahead at the far end, as a model number); (5) the lag over an orbit (3.08 s against 0.173 s; the car-on-a-long-drive example); (6) calculation and measurement (NASA's distance and speed, the formula tested on Earth and in orbit, no measurement by the mission reported in the sources read, "for scale only" 10,500 km of light travel in 35 ms, and the oval's 190.7 km/s against NASA's 192.22); (7) what was shown and what was not. Every number comes from the module. The chapter summary ("What you learned") is in `src/App.tsx`; "What's next" names no experiment because Experiment 12 has no approved specification. The complete flow was exercised in Chrome with the prediction "work against each other" and "35 microseconds": the three questions each disabled Continue until text was typed, the explanation appeared, and the chapter summary appeared only after it. Wording is draft for the owner's approval. Not checked: the tutor's text for the other prediction combinations in the browser, narrow widths, other browsers, a real learner; the statements "no measurement by the mission was reported in the sources read" and "the formula has been tested with clocks on the Earth and in orbit" have no source read for this page beyond the earlier experiments of the project.

**Step 8 (complete-flow test), 2026-10-22.** Exercised in Chrome (the stage timer shortened from 2.6 s to 30 ms, in the page only, for speed; no code was changed): **all nine prediction pairs** (3 Prediction 1 answers × 3 Prediction 2 answers). For each: Run disabled until both predictions are answered; the run completes with all three pictures and five tables; the prediction buttons lock; the slider is present; each of the three tutor questions keeps Continue disabled until text is typed; the explanation has all seven parts; and the match marks are the expected ones for the pair ("both slow" and "millisecond" are the right answers; for example "both slow / microsecond" gives matched, not matched), with the right natural-wrong-answer note shown (the Experiment 10 note for "work against each other", the "sped up only when" note for "both speed up", the fraction notes for "microsecond" and "second") and no wrong one. **27 control settings** (nine positions on the slider × 1 day, 1 orbit, 1 year) were compared with a separate Python calculation of the same oval (distance, speed, lag per day and gap): all 27 agree to the displayed rounding (for example 6.89 ms a day and 606.25 ms over 88 days at 0.18 AU; 0.10 ms ahead at the far end). The five fixed table rows of Table 2 (distance, speed, lag) and Tables 1 and 3 agree with the same calculation and with the numbers in `fastestSpacecraft.test.ts`. The chapter summary was absent on load, after the run and after the second tutor answer, and appeared only after the third (starting from empty saved progress); the completion mark and the "explained" mark were both saved (`completed` and `explained` hold the chapter). No console errors were found (console tracking began at the last check, so errors earlier in the session were not captured).
- **Noted, not a defect:** the chapter summary is already visible on load for a learner who finished the tutor earlier, because the project saves "explained" chapters (CLAUDE.md §27); a first pass in this test read that as the summary showing early until saved progress was cleared.
- **Not checked:** narrow widths, other browsers, keyboard use (including the slider), screen readers, a real learner, and the text of the explanation for each pair read by eye (the marks and notes were checked by script).

**Final review (Step 9), 2026-10-22.** Compared with the specification, `CLAUDE.md` §12, §14 and §29 and the separation of physics from the interface; `npm run build` passes (there is no lint script). Seven findings were reported; the owner chose fixes 1, 2, 3, 4 and 6 ("fix 1, 2, 3, 4 and 6") and no fix for 5 (labels become small at narrow widths) and 7 (the unsourced items, listed under "Open items"):
- **Fix 1 (§14, abbreviations):** the guides of Pictures 2 and 3, the results and the controls now define "ms", "s" and "km/s", and the "Words and formulas" panel has entries for them.
- **Fix 2 (§9, physics in the interface):** `speedAt(distance)` is in the module (with three tests, checked by two deliberate breaks, 28 tests in all) and the interface no longer inverts the speed term; the oval's speed at the closest point comes from `orbitSpeed`.
- **Fix 3 (§28.2, specification in line with the build):** this text.
- **Fix 4 (§29 rule 3, links):** two links added to the introduction's list, NASA's visualization of the extended mission (`svs.gsfc.nasa.gov/5534`) and NIST's "What time is it on the Moon?" (the same two effects, fetched 2026-10-22).
- **Fix 6 (accessibility):** the text descriptions of the three pictures now mention the learner's own bar or ring when it is drawn.
Checked after the fixes: all tests pass (1,176), the type check is clean, and in Chrome the new links, the definitions, the picture descriptions and the speeds at both ends of the slider (192.2 km/s at the closest point, 86.1 km/s at 0.183 AU) are right.
