# Experiment 5 (Evidence and Imagination): Does the Sun Slow Light?

**Status: specification APPROVED by the owner on 2026-11-01 ("approve all defaults": all twelve decisions on their defaults, including the title "How long does the Sun's gravity delay a radio signal?"). Not built yet; it is built one step at a time (see "Implementation Notes").** Proposed by Claude on 2026-11-01 per `CLAUDE.md` §23 Stages 2 and 3. Experiment 5 of the group (`00-group-proposal.md`, approved as a direction on 2026-10-29). Sources were searched on 2026-11-01; **no paper was read in full** (the Cassini paper's abstract was read; see "Sources" and "Implementation Notes"). The file name `05-does-the-sun-slow-light.md` is kept.

> **Four things for the owner's attention (decisions 1, 3, 5 and 7).**
> (a) **Title.** "Does the Sun slow light?" hints at the answer ("yes, late"), and it is also a loose phrase: the signal's speed is not what changes in the model. Six candidates are in Decision 1.
> (b) **Every number in the model comes from one secondary source.** The formula is Wikipedia's; the paper (Shapiro 1964) returned 403 and the Cassini paper's page was blocked. The page's figures are calculated here and compared with the sources' *quoted* figures only (about 200 µs; 20 parts per million).
> (c) **The model's grazing Venus delay is 232.5 µs, not Shapiro's "about 200 µs".** Wikipedia calls his figure approximate and the paper was not read, so the page gives no verdict on the gap (Decision 5).
> (d) **The "doubling" is shared with Gravity 8.** The same factor of two (curved space on top of the slowing of time) that doubled the bending of light doubles the delay; Gravity 8 already states it. This experiment must not teach the mechanism early (§12).

## Overview

Radio waves go at the speed of light. If you send a pulse from the Earth to a spacecraft behind the Sun and back, you can time the round trip very precisely and add up the time it would take in empty, flat space. The Sun's gravity makes the round trip **longer**, by a few hundred millionths of a second (hundreds of µs). This is the **Shapiro delay**, predicted by Irwin Shapiro in 1964 and called the fourth classic test of general relativity.

1. **The sum without gravity.** Distance ÷ speed of light, for a planet at its closest or a spacecraft far away. The learner sees how small a few hundred µs is against a trip of many minutes or hours.
2. **The Sun's extra delay, from the formula.** A closed-form delay for a signal that passes the Sun at a chosen closest distance *b* (given in solar radii): Δt ≈ (1 + γ) × (GM ÷ c³) × (the sum of two logarithms of distance ratios), with γ = 1 in general relativity and γ = 0 in the Newtonian-style picture of Gravity 8. GM ÷ c³ for the Sun is 4.925 µs.
3. **The tests.** Shapiro's own 1964 estimate ("about 200 µs", Venus at the best alignment); the radar tests of 1966 to 1971; Cassini's 2002 radio test, which confirmed the prediction to 20 parts per million, (γ − 1) = (2.1 ± 2.3) × 10⁻⁵ (50 times better than the Viking landers' 1979 result of about 1 part in 1,000).
4. **The doubling and the closest distance.** The delay is not simply "the closer, the longer": it grows only as the logarithm of how close the signal passes. Ten times farther from the Sun's centre cuts the model's Venus delay from 232.5 µs (grazing) to 141.7 µs, not to a tenth.

Status: **Settled** (the delay has been measured and agrees with general relativity to about 20 parts per million), said plainly as an old test, not a new result.

## Learning Objective

By the end the learner can say, in their own words:

1. A signal that passes close to the Sun takes longer than the same signal in empty space, by hundreds of millionths of a second for Earth, Venus and spacecraft beyond the Sun.
2. The effect is real and measured: Shapiro's prediction (1964) was tested by radar in the 1960s and by Cassini in 2002 to about 20 parts per million.
3. The delay grows slowly as the signal passes closer (about the logarithm of the closeness), not in proportion to it.
4. General relativity predicts twice the delay of the Newtonian-style calculation, and the measurement chose the doubled value (the same factor as in Gravity 8's light bending).
5. What this page's model leaves out, and that its numbers are calculated here, not read from the missions.

## Physical Situation

A radio pulse goes from the Earth to a target (a planet or a spacecraft) on the far side of the Sun and back, in a straight line in flat space plus the Sun's gravity. The closest the straight path comes to the Sun's centre is *b*. The extra time is the time in curved space minus the time in flat space for the same straight line. Everything is the lab's (the Sun's) frame.

## Physics Model (`src/physics/sunDelay.ts`, to be written; may import nothing)

| Part | What it computes | Source |
|---|---|---|
| **Constants** | GM of the Sun = 1.32712440018 × 10²⁰ m³/s², c = 299 792 458 m/s, 1 AU = 1.495978707 × 10¹¹ m, solar radius = 6.957 × 10⁸ m; so GM ÷ c³ = 4.9255 µs | standard values; **to be checked against IAU/NASA pages before wording is approved** |
| **Flat-space round trip** | 2 (x_e + x_p) ÷ c, with x = √(r² − b²) for each leg | geometry |
| **The Shapiro delay, one way** | (1 + γ) (GM ÷ c³) ln[ (r_e + x_e)(r_p + x_p) ÷ b² ] for the two ends on opposite sides of the Sun (this is the simplified form of Wikipedia's first-order formula; equal to it when b ≪ r) | Wikipedia's "Shapiro time delay" (read 2026-11-01): the formula, the parametrised form with (1 + γ), "twice the Newtonian prediction"; **not checked against Shapiro 1964 or Weinberg** |
| **The round trip** | twice the one-way value | geometry |
| **The Newtonian-style value** | the same with γ = 0 (half the above) | the same source |
| **Published figures** | Shapiro 1964 "almost 2 × 10⁻⁴ s", "equivalent to 60 km", "5 to 10%" (quoted by Wikipedia); Cassini (γ − 1) = (2.1 ± 2.3) × 10⁻⁵; Viking about 1 in 1,000; 1966 to 1967 radar tests "successful" | see Sources; **stored as quoted, not recomputed** |
| **Comparison helpers** | difference, percent, "inside the give-or-take" | arithmetic |
| **Answers** | each prediction's answer and a nearest-button helper | arithmetic |

**Numbers the model gives (computed 2026-11-01, to be tested):** round-trip extra delay with the signal grazing the Sun's edge (b = 1 solar radius), Earth at 1 AU: Venus (0.72 AU) 232.5 µs; Mercury (0.387 AU) 220.2 µs; Mars (1.52 AU) 247.2 µs. For Venus: b = 10 solar radii 141.7 µs; b = 100 solar radii 47.4 µs; with γ = 0 each is half. The Cassini geometry (about 7.4 AU, closest about 1.6 solar radii) gives 259.9 µs in the model, **but those two geometry numbers were not read from a source** (the JPL release says only "more than 1 billion kilometres" between Earth and Cassini), so they are not used on the page unless a source is found.

**Not modelled (and the page says so):** the Sun's corona (it slows radio waves too, by far more than gravity, and the real tests used several frequencies to remove it); the planets' own gravity; the motion of Earth and the target during the trip; the Sun's spin and shape; the real bounce off a rough planet; the second-order terms of the full theory; and why the delay is twice the Newtonian one (left to the tutor, which must not claim more than Gravity 8 did).

## Learner Controls ("Now try it yourself", trial values)

1. **Target** (buttons: Mercury, Venus, Mars; a spacecraft at 5 AU only if a source is read for it).
2. **Closest distance to the Sun's centre** (buttons: 1 (grazing), 2, 5, 10, 50, 100 solar radii; **100 is not offered for Mercury**, because 100 solar radii is 0.465 AU and Mercury is at 0.387 AU, so a path to Mercury cannot pass the Sun that far out).

Drawing A shows the chosen pair's flat round trip, the extra delay in µs on a log ruler, and the same with γ = 0. These are trial values, not measurements; the real pictures do not change with them.

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **A radio pulse goes from the Earth to Venus, passing right at the Sun's edge on the way, and back. The trip takes many minutes. About how much longer does the round trip take because of the Sun's gravity?** Five buttons: about 0.2 µs, about 2 µs, about 20 µs, about 200 µs, about 2,000 µs. Answer: **about 200 µs** (232.5 in the model). Drawn as a white mark on a log ruler of µs.
2. **Now the signal passes the Sun 10 times farther out (10 solar radii instead of 1). How does the extra delay change?** Five buttons: about 100 times smaller, about 10 times smaller, about 2 times smaller, only a little smaller, about the same. Answer: **about 2 times smaller** (232.5 to 141.7, 1.64 times). Drawn as a white mark on the delay-versus-distance picture.

The guesses are drawn in white on the real pictures, never change them; the tutor marks each in its explanation only. The questions never say "curved space", "doubling" or "logarithm" (§12).

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)

Outline: what radio waves are, and that they go at the speed of light; what a round-trip time is (an echo, with a canyon comparison); how far the Earth, Venus, Mars and the Sun are and how long light takes (a round trip to Venus passing the Sun's edge takes about 28.6 minutes; at its nearest to the Earth, 0.28 AU away, about 4.7 minutes); what µs means (a millionth of a second) and that light goes 300 m in 1 µs; what the learner will do; that the predictions never change the real pictures; assumptions. Terms defined before use: *radio wave*, *round trip*, *µs*, *AU*, *closest distance*, *solar radius*, *radar*, *general relativity* (a reminder from Gravity 8), *parts per million*. **Held back until after the run:** both answers, "twice", "logarithm", and the tests' agreement (§12). The "Want to know more?" list gives the original papers after the run and the JPL page before; for the missing official explainer, §29 rule 3(c) applies (see Sources).

### Display

1. **Picture 1, the path (calculated here, imagined for the question):** the Sun with its edge, the straight path from Earth to the planet passing at the chosen closest distance, on a scale that makes the path's bend-free straightness clear; labels on every shape.
2. **Picture 2, the delay (calculated here):** a log ruler of µs from 1 to 10,000 with the flat-space trip's size noted, the Sun's extra delay, and the γ = 0 value; the white guess for Prediction 1.
3. **Picture 3, closer and farther (calculated here):** delay against closest distance for a chosen target, from 1 to 100 solar radii, showing the slow fall; the white guess for Prediction 2.
4. **Picture 4, the tests (measured by others; quoted):** a ruler of how well each test was known: 1964 estimate (5 to 10 percent), Viking (1 part in 1,000), Cassini (20 parts per million), each as quoted; labelled as quoted figures, not calculations.
5. **Drawing A (follows the controls).**
Each has a "How to read this diagram" caption (§14, §29) with look-at, what-it-means and why-it-matters items and a "Where the real picture comes from" line separating **measured** (Cassini, the radar tests), **calculated here** and **imagined for the question**.

### Run

Five stages: the trip with no Sun's delay (the flat-space time); the path past the Sun; the extra delay (Picture 2); the delay against distance (Picture 3); the tests (Picture 4). Guesses appear once the feature beside them is drawn.

### Results (neutral, then explained by the tutor)

A check-up (the model's grazing Venus delay against Shapiro's "about 200 µs" as quoted, with no verdict; the model's γ = 0 against γ = 1; the quoted tests' precision), a steps table, and a table of what has been tested, each with a "What this table tells us" note (§14). The predictions beside the results, tagged on the row, with no "right" or "wrong". Words such as "close" only where a published reference supports them.

### Tutor (Part 4)

Predict, observe, compare, explain (§13): what the learner expected; what the delay is against the trip time; what changed with distance; why a delay appears (time runs slow near the Sun and space is stretched, each half of the delay; stated as in Gravity 8, with a worked example); why the delay grows only slowly as the signal passes closer (a daily-life comparison, to be drafted for approval); what Cassini showed; what the page leaves out. The tutor must not claim more than the tests show and says plainly that the numbers are calculated here.

## Expected Observations

Flat-space round trip to Venus along the path that grazes the Sun about 28.6 minutes (computed 2026-11-01); extra delay grazing the Sun 232.5 µs; at 10 solar radii 141.7 µs; at 100, 47.4 µs; with γ = 0 each is half. Tests: 5 to 10 percent (1964), about 1 in 1,000 (Viking, 1979), 20 parts per million (Cassini, 2002).

## Expected Learner Understanding

That gravity changes how long a signal takes to cross space, by a small, measurable and well-tested amount; that the measured amount matches general relativity, not the Newtonian-style half; and that the delay depends only slowly on how close the signal passes.

## New Concepts Introduced

The Shapiro delay, a round-trip radio test, a parts-per-million precision, the parameter γ (named only as "1 in general relativity, 0 in the Newtonian-style picture").

## Relationship to Previous Experiments

Gravity 2 (gravitational time dilation), Gravity 4 and 5 (curved space and what curves it), Gravity 8 (light bending and the doubling), Gravity 9 (GPS, a real clock test), Cosmic Horizons 11 (the Sun's gravity and a spacecraft), Evidence and Imagination 3 (a rule tested to a known precision).

## Relationship to Later Experiments

Experiment 6 (early-universe recipe) and 7 (the microwave dipole) are unrelated physics; the group's recap sorts this group's results by status.

## Required Physics Tests (each must fail when the module is deliberately broken)

1. Constants: GM ÷ c³ = 4.9255 µs.
2. Flat-space round trip for Venus grazing the Sun is within 0.01 percent of 2 × (1 + 0.72) AU ÷ c (about 28.6 minutes), and the delay is about 1.4 × 10⁻⁷ of it.
3. Grazing delays: Venus 232.5, Mercury 220.2, Mars 247.2 µs (to 0.1 µs).
4. Venus delay at 10 and 100 solar radii: 141.7 and 47.4 µs; the ratio 232.5 ÷ 141.7 = 1.64.
5. γ = 0 gives exactly half the γ = 1 value for every control setting.
6. Monotonic: the delay falls as b rises, and it rises with the target's distance; it is always positive.
7. The delay agrees with an independent numerical integration of 1 ÷ r along the path at every setting (to 1 part in a million), and with the leading form ln(4 r_e r_t ÷ b²) to 0.1 percent at 1 to 10 solar radii; the leading form is 7.7 percent off at 100 radii, where b is not small against the ends, so it is not used there.
8. The stored published figures are as quoted (2.1 ± 2.3 × 10⁻⁵, 20 ppm, 1 in 1,000, 5 to 10 percent, 2 × 10⁻⁴ s).
9. The comparison helpers and a tenfold wider tolerance that fails a test (as in Experiments 3 and 4's reviews).
10. The nearest-answer helpers: Prediction 1's answer is 200 µs; Prediction 2's is "about 2 times smaller".
11. The module does not change when predictions change.

## Sources (searched 2026-11-01)

| Source | What it was used for | Status |
|---|---|---|
| JPL/NASA, "Saturn-Bound Spacecraft Tests Einstein's Theory" (`jpl.nasa.gov/news/saturn-bound-spacecraft-tests-einsteins-theory/`, release 2003-133, 2 Oct 2003) | Cassini: summer 2002, Earth and spacecraft on opposite sides of the Sun, more than 1 billion km apart, "50 times greater" than before, Viking about 1 part in 1,000 (1979), Cassini 20 parts per million, round-trip light time of the radio signal, several frequencies to remove coronal noise | **fetched and read 2026-11-01 (HTTP 200)**; plain-language; it does **not** give the (2.1 ± 2.3) × 10⁻⁵ figure or the closest distance to the Sun. A candidate for the "before the run" link |
| Bertotti, Iess and Tortora, "A New Test of General Relativity With the Cassini Space Mission", *Nature* 425, 374 (2003) (`nature.com/articles/nature01997`) | the Cassini result | **not read**: the page redirected to a cookie check and returned no abstract on 2026-11-01. The figure (γ − 1) = (2.1 ± 2.3) × 10⁻⁵ is from **search summaries only** (several agreeing) |
| I. I. Shapiro, "Fourth Test of General Relativity", *Phys. Rev. Lett.* 13, 789 (1964) (`journals.aps.org/prl/abstract/10.1103/PhysRevLett.13.789`) | the prediction | **not read: HTTP 403**. "Almost 2 × 10⁻⁴ s", "equivalent to 60 km", "5 to 10%" are Wikipedia's quotation of it |
| "Shapiro time delay", Wikipedia (`en.wikipedia.org/wiki/Shapiro_time_delay`) | the formula, γ form, "twice the Newtonian prediction", the 1966 to 1967 Haystack tests | **fetched and read 2026-11-01 (HTTP 200)**; not an official page, not the papers |
| Harvard CfA PDF `lweb.cfa.harvard.edu/~loeb/Shapiro_D.pdf` | possibly a copy of a Shapiro paper | **could not be read** (scanned PDF); **not used, not linked** |
| A plain official page on the **Shapiro delay itself** (NASA, ESA, JPL, NIST, LIGO) | the "before the run" list (§29 rule 3(b)) | **none found on 2026-11-01**: a search limited to those domains returned only arXiv papers, a NASA ILRS paper and no explainer; the JPL release above explains the effect in two sentences and is the nearest. To be recorded under §29 rule 3(c) if no better page turns up before wording is approved |
| Modern results (BepiColombo, Juno, pulsar timing) | "any newer test?" | **a search on 2026-11-01 found no new solar-conjunction result since Cassini** (only a 2026 proposal for a laboratory test, `arxiv.org/abs/2601.00468`, not read, not on the page). Limited search |
| Constants (GM of the Sun, AU, solar radius, c) | the model | **from memory of standard values; to be checked against IAU/NASA pages before wording is approved** |

## Facts that may change (§29)

| Fact | Why it may change |
|---|---|
| Cassini (2003) is the most precise direct test | a new solar conjunction test (BepiColombo or others) may report |
| The page's links | blocked pages (Nature, APS) may become reachable, or a plain official page may appear |

## Open items

a. **The formula's source is Wikipedia**; check it against Shapiro 1964 or a textbook before wording is approved.
b. **The 232.5 µs grazing Venus figure differs from Shapiro's "about 200 µs"**, which was an estimate for the best alignment; the page gives no verdict.
c. **Cassini's geometry** (closest distance, Cassini's distance) is unread; the page uses it only as quoted.
d. **The (2.1 ± 2.3) × 10⁻⁵ figure** rests on search summaries; the JPL page says only "20 parts per million".
e. **No plain official page for the Shapiro delay** (§29 rule 3(c)).
f. **The tutor's explanation** of why the delay is double rests on Gravity 8's own wording and Wikipedia; no source read for the daily-life comparison.
g. **The corona** (a bigger effect than gravity at radio frequencies) is named only; no source read for how much.

## Decisions for the owner (each with a default)

1. **Title.** Candidates: (a) "How long does the Sun's gravity delay a radio signal?" (default, neutral, says what is measured); (b) "Does the Sun slow light?" (the group's working title; hints "yes"); (c) "A radio echo past the Sun"; (d) "Is a signal past the Sun late?"; (e) "The fourth test of general relativity"; (f) "Does gravity change how long light takes?". The file name `05-does-the-sun-slow-light.md` is kept either way. **Chosen by the owner on 2026-11-01: (a), "How long does the Sun's gravity delay a radio signal?" (all twelve decisions approved on their defaults).**
2. **Status label.** Settled (the delay has been measured to about 20 parts per million and agrees with general relativity), "old test, not a new result" said plainly; Open: whether any tiny deviation exists. Default: as stated.
3. **Scope.** The Sun only; Mercury, Venus and Mars as targets; a straight path, flat space plus the logarithmic delay; the corona and the planets' gravity named, not modelled. Default: yes. Alternative: add a spacecraft target once Cassini's geometry is read.
4. **Two predictions** (grazing Venus delay, five buttons; the effect of passing 10 times farther, five buttons). Default: yes.
5. **The gap to Shapiro's "about 200 µs".** Show both and give no verdict. Default: yes. Alternative: drop Shapiro's number until the paper is read.
6. **Controls:** target (three buttons) and closest distance (six buttons) with Drawing A. Default: yes.
7. **The doubling.** The tutor states that γ = 1 in general relativity is twice the Newtonian-style γ = 0 and that the tests chose γ = 1, tied to Gravity 8, without deriving it. Default: yes.
8. **Introduction length and links:** long and detailed, to §29; the JPL release linked before the run; the two papers after it (Shapiro linked only if reachable, otherwise "Not linked", as in Experiment 4); §29 rule 3(c) for the Shapiro delay itself if no better page is found. Default: yes.
9. **Tutor:** the standard four-step sequence. Default: yes.
10. **Terms defined in plain words where they appear** (see the introduction outline). Default: yes.
11. **Pictures label every shape and say which parts are measured, calculated and imagined** (§14, "Predictions and the Real Results" point 6). Default: yes.
12. **Cassini's own numbers** (the closest distance and Cassini's distance) are left out until read. Default: yes.

## Implementation Notes (2026-11-01, in progress)

**Step 1, the physics model and tests (built, not committed; wording not applicable):** `src/physics/sunDelay.ts` (imports nothing) and `src/physics/sunDelay.test.ts` (21 tests; 1,963 in the project; `tsc --noEmit -p tsconfig.app.json` clean). Eleven of the specification's test groups are covered, with test 2 and test 7 corrected as above.

**Checked by deliberate breaks:** 14 changes to the module were each caught (the round trip not doubled, (1 + γ) replaced by 2, ln replaced by log₁₀, a wrong GM, a one-way flat trip, a wrong Venus distance, a linear instead of a log button match, the closest-distance filter removed, γ for the Newtonian-style value changed to 1, a changed Cassini give-or-take, a changed solar radius, a leg length that ignores the path's closest distance, a loose "the same" tolerance). **One break was missed at first** (the log-versus-linear button match, because the real answer is the same on both scales); `delayAnswerIdFor` was added with a test at 700 µs and 350 µs and the break is now caught. The first attempt at the breaks did not apply them (macOS `sed -i` needs a suffix) and was discarded; the results above are from a second run that did.

**Found while building, for the owner's attention:**
1. **The "12 minutes" in this specification's draft was wrong** (it was written before the trip was computed). The Venus grazing round trip is 28.6 minutes. Corrected in the Overview outline, the Introduction outline and the Expected Observations.
2. **A path to Mercury cannot be offered 100 solar radii** (Decision 6 listed six distances for every target). `closestChoicesFor(targetId)` gives Mercury five choices and the others six. This is a change to the control's list, not to the physics.
3. **(Decided by the owner's delegation, 2026-11-01: "you decide what is best". Claude's decision: the page shows the leading logarithmic term only and says so plainly, gives no verdict on the gap to Shapiro's "about 200 µs", and does not add the recalled extra term until a source is read.)** **The formula is the leading logarithmic term only.** Weinberg's fuller treatment (recalled from memory, not read from a source) adds about GM ÷ c³ per end of each leg, which would add about 20 µs (about 8 percent) to the grazing Venus round trip, taking 232.5 µs to about 252 µs, further from Shapiro's quoted "about 200 µs". Wikipedia's own first-order formula has extra bracketed terms whose sign convention was not clear from the fetched text. **This is not resolved**: the model, the tests and the page's numbers use the leading term as the specification states, and the choice of what the page should show is the owner's (see the question in the Step 1 report). Open item a is extended accordingly.
4. **Prediction 2's answer is close to a boundary.** The model's 1.64 times smaller sits between "about 2 times" and "only a little smaller" (1.2) on the log scale it is matched on (nearest is "about 2 times", by 0.20 against 0.31). The button values 100, 10, 2, 1.2 and 1 are the author's round figures.
5. **Planet distances are round figures** (Venus 0.72, Mercury 0.387, Mars 1.52 AU), as the specification's numbers assumed; the constants (GM, the AU, the solar radius) match those already used in Cosmic Horizons 11 but have still not been checked at an IAU or NASA page.
