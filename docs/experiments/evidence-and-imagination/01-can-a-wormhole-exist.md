# Experiment 1 (Evidence and Imagination): Can a Wormhole Exist? (What Would It Take to Hold One Open?)

**Status: DRAFT specification, PROPOSED by Claude on 2026-10-29 per `CLAUDE.md` §23 Stages 2 and 3, as Experiment 1 of the group (`00-group-proposal.md`, approved by the owner on 2026-10-29). **On 2026-10-29 the owner agreed Decisions 3, 6 and 7 on their defaults** (the four Kruskal snapshots; the derived exotic-mass formula shown with the other one stated and the difference explained; the Casimir comparison with the surface of the observable universe, marked illustrative); **On 2026-10-29 the owner then approved the specification ("approve the spec"), read as all twelve decisions on their defaults.** Step 1 (the physics model and its tests) is the next step; nothing else is built. Every fact below came from search results, abstracts and summarising fetches on 2026-10-29; the Morris and Thorne paper could not be read as text (the PDF was fetched but has no readable text layer here), and no paper was read in full. Each number must be checked at its source before the wording is approved (§29).**

> **Three things for the owner's attention (decisions 2, 6 and 7).** (a) The "exotic mass" for a throat is not given by one agreed formula in the sources I could read: a secondary summary says "−radius × c² ÷ G" (for 1 metre, about one Jupiter mass), and my own integration of the energy of the simplest open throat gives −π × radius × c² ÷ (2G) (for 1 metre, 1.11 Jupiter masses). They agree to 12 percent and both give "about one Jupiter mass per metre". (b) The model is a **toy shape from the mathematics** (no wormhole has ever been seen) and the page must say so on every picture. (c) A comparison with the surface of the observable universe, for how much Casimir plate would be needed, is striking but is only a rough illustration.

## Overview

A **wormhole** is a possible tunnel through spacetime that joins two far-apart places (or two universes). Einstein's equations of general relativity allow shapes like it. This experiment asks two questions about the simplest ones, and the answers are the reason no one has ever built or found one:

1. **Does the simplest wormhole stay open?** The first "bridge" found in the equations, the Einstein–Rosen bridge (1935), is the inside view of a black hole's full solution. In 1962 Fuller and Wheeler showed it opens and closes again before even a ray of light could cross.
2. **What would it take to hold a tunnel open?** In 1988 Morris and Thorne showed that a tunnel that stays open needs "exotic matter" with **negative energy**. For a tunnel one metre across, the amount is about one Jupiter's worth of mass, negative. The only negative energy known is the tiny Casimir effect between two plates a hair apart.

The model is the mathematics, drawn to scale; the status is **Open**: no wormhole has been seen, and none is known to be makeable. The experiment does not say that wormholes exist and does not say they are impossible.

## Learning Objective

By the end the learner can say, in their own words:

1. A wormhole is a shape that the equations of general relativity allow: a throat joining two regions. It is mathematics, not an observation.
2. The simplest throat (the Einstein–Rosen bridge, the inside of a black hole's full solution) is not a shortcut: it pinches off before light could pass through.
3. A throat that stays open needs matter with negative energy ("exotic matter"), because the throat must flare outward, and ordinary matter cannot make space flare outward there.
4. For a throat of radius b₀ the amount of negative energy is about b₀ c² ÷ G (for 1 metre, about a Jupiter), and the tension at the throat is c⁴ ÷ (8πG b₀²): for a 3 km throat, as large as the pressure at the centre of a massive neutron star.
5. The Casimir effect makes a tiny negative energy between two close plates: for plates 1 millionth of a metre apart, about 4 × 10⁻¹⁰ joules per square metre, a factor of more than 10⁵³ too small.
6. As of October 2026 no wormhole has been seen; searches for gravitational-wave "echoes" that would hint at one found nothing significant.

## Physical Situation

Seen from far away, a wormhole's mouth would look like a sphere. Inside, space narrows to a **throat** and widens again into a second mouth, the way a catenoid (the shape of a soap film between two rings) does. The experiment shows three things: the **shape** of such a throat; the **closing** of the simplest one (Einstein–Rosen); and the **cost** of holding a throat open (negative energy). Everything drawn is calculated from the mathematics, and the page says that it is a toy picture of a shape that no telescope has seen.

## Physics Model (`src/physics/wormholes.ts`, to be written; imports nothing, or only Black Holes 1's constants)

| Part | What it computes | Source |
|---|---|---|
| **The throat's shape** | the simplest Morris–Thorne throat: shape function b(r) = b₀² ÷ r, no tidal force (Φ = 0); circumference radius r(l) = √(l² + b₀²) at a distance l along the tunnel; the drawn "embedding" height z(r) = b₀ arccosh(r ÷ b₀) (a catenoid); flare-out b′(b₀) = −1 < 1 | Morris and Thorne 1988 (through summaries; the choice of this shape function is from memory, **to be checked at the paper**); the arccosh is a standard integral worked here |
| **The energy it needs** | density ρ = −c⁴ b₀² ÷ (8πG r⁴) (negative everywhere); at the throat ρ = −c⁴ ÷ (8πG b₀²), and the radial tension is τ₀ = c⁴ ÷ (8πG b₀²); total negative mass over both sides, M = −π b₀ c² ÷ (2G), by integrating ρ over the proper volume (closed form and a numerical integral, which must agree) | tension formula: Kuhfittig 2022 ("τ(r₀) = 1/(8πGc⁻⁴ r₀²) ≈ 5×10⁴¹ dyn/cm² (10 m/r₀)²", fetched 2026-10-29; at 3 km the same size as a massive neutron star's centre); the mass **derived here**, to be checked; a secondary summary gives "−r c²/G, about −1 Jupiter mass for 1 m" |
| **The closing of the simplest throat** | the Schwarzschild "bridge" of mass M: on each Kruskal slice T the throat's circumference radius r_min(T) solves (r ÷ 2GM/c² − 1) e^{r ÷ 2GM/c²} = −T²; it shrinks from 2GM/c² at T = 0 to 0 at T = 1, and a light ray at 45° from one side cannot reach the other side before T = 1 | Fuller and Wheeler 1962 (through summaries: "nontraversable, even by a photon"); the Kruskal relation is standard, to be checked |
| **Negative energy we know** | the Casimir energy per unit area of two ideal plates a distance d apart, −π² ħ c ÷ (720 d³); the area needed to hold open a b₀ throat; the ratio | the energy density −π² ħ c ÷ (720 a⁴) (search summary); measured by Lamoreaux in 1997 to within 5 percent (summary) |
| **What has been searched for** | none computed; the table of searches is data | arXiv:2512.24730 and arXiv:2602.01615 (abstracts read) |
| **Answers** | each prediction's answer, nearest-button helper, the tutor's marks | arithmetic |

**Not modelled:** any real source of the matter, how a wormhole would form, rotation, charge, quantum effects beyond the Casimir comparison, time travel through a wormhole (a later experiment of the group), and whether a wormhole could be crossed by a person (tides, stability).

## Learner Controls ("Now try it yourself", trial values)

1. **Throat radius** (buttons: 1 millimetre, 1 metre, 1 kilometre, 3 kilometres, 10 kilometres). The drawing shows the negative mass it would need (in Earths, Jupiters or Suns) and its tension against a neutron star's centre.
2. **Gap between the Casimir plates** (buttons: 0.1, 1 and 10 micrometres). The drawing shows how many times too small the Casimir energy is, for a 1 m² pair of plates.

These are trial values for the learner to try, not new measurements, and the real pictures do not change with them.

## Prediction Activity (§12, §14 "Predictions and the Real Results")

1. **Could a ray of light sent in at one mouth of the simplest wormhole (the Einstein–Rosen bridge of a black hole) come out of the other mouth?** Two buttons (yes, no). Answer: **no**; the throat pinches off first. A yes or no has no size of its own, so a marker is drawn, and the caption says so.
2. **A tunnel one metre across (radius 1 metre) would need how much negative mass to hold it open?** Five buttons on a log scale (a car, a mountain, the Moon, the Earth, Jupiter, about 10³, 10¹⁵, 10²³, 10²⁵, 10²⁷ kg). Answer: **about 2 × 10²⁷ kg**, button "Jupiter" (1.11 Jupiter masses by the derived formula; the nearest button on a log scale). Drawn as a white mark on a log ruler of masses (Picture 3).

The guesses are drawn in white on the real pictures and never change them; the tutor marks each in its explanation only.

## Experiment Behavior

### Introduction (to be drafted for the owner's approval after the specification is approved)
Outline: what "spacetime" and "curved" mean (Gravity 4); the idea of a tunnel and the ordinary-travel analogy (a mountain: around or through); where the word comes from and who proposed it (Einstein and Rosen 1935, as a model of particles, not a tunnel; Fuller and Wheeler 1962; Morris and Thorne 1988, written as a teaching tool); what the learner does; that the predictions never change the real pictures; assumptions (a toy shape from the mathematics; nothing seen). Terms defined before use: *wormhole*, *throat*, *mouth*, *Einstein–Rosen bridge*, *exotic matter*, *negative energy*, *tension*, *Casimir effect*, *null energy condition* (named only), *echo*. **Held back until after the run:** both predictions' answers (§12). The "Want to know more?" list gives the original papers after the run (they contain the answers) and background pages before.

### Display
1. **Picture 1, the shape:** the throat as a catenoid for the chosen b₀, with the two mouths labelled, the throat labelled, and "the way round" and "the way through" arrows (imagined, for the picture only).
2. **Picture 2, the closing:** four snapshots of the throat of a Schwarzschild bridge (T = 0, 0.5, 0.9 and 1) with a light ray from the left; Prediction 1's white marker.
3. **Picture 3, the cost:** a log ruler of masses (a car, a mountain, the Moon, the Earth, Jupiter, the Sun), with the negative mass needed for 1 m and the white guess, and a panel on its own scale of the tension against a neutron star's centre.
4. **Drawing A (follows the controls):** the throat's required mass and tension for the chosen radius, and the Casimir ratio for the chosen gap.
Each has a "How to read this diagram" caption (§14, §29), with look-at, what-it-means and why-it-matters items, and a "Where the real picture comes from" line separating the **measured** (the Casimir force, the absence of any sighting), the **calculated here** (the shape, the energy, the closing) and the **imagined** (a wormhole itself).

### Run
Five stages: what a wormhole would be; the throat's shape; the closing of the simplest one; what holds it open; what has been looked for. Guesses appear once the feature beside them is drawn.

### Results (neutral, then explained by the tutor)
A check-up (the mass against Jupiter's; the tension against a neutron star's centre at 3 km; the Casimir energy against the energy needed; the searches), a steps table, and a table of what has been searched for, each with a "What this table tells us" note (§14). The predictions beside the results, tagged on the row. No "right" or "wrong".

### Tutor (Part 4)
Predict, observe, compare, explain (§13): why the simplest throat closes; why a flare needs negative energy (a daily-life comparison: a taut rope or a tunnel wall that must be pushed outward); how big the cost is in everyday objects; why the Casimir effect is not enough; what the 2022 quantum-computer "wormhole" was and was not; what is not settled. The tutor must not say that wormholes exist or that they cannot.

## Expected Observations
A 1 m throat needs about 2.1 × 10²⁷ kg of negative mass (1.11 Jupiter masses) and a tension of 4.8 × 10⁴² Pa; a 3 km throat has a tension of 5.4 × 10³⁵ Pa (5.4 × 10³⁶ dyn/cm²), the same size as a massive neutron star's centre; the Casimir energy for 1 m² plates 1 micrometre apart is 4.3 × 10⁻¹⁰ J, against about 1.9 × 10⁴⁴ J needed, a factor of about 4 × 10⁵³; the Einstein–Rosen throat closes by T = 1.

## Expected Learner Understanding
That a shape the equations allow is not the same as a thing that exists; that a tunnel needs a special kind of matter that has never been found in more than a trace; and how to judge a headline about a "wormhole".

## New Concepts Introduced
Wormhole, throat, Einstein–Rosen bridge, exotic matter and negative energy, tension, the Casimir effect, the null energy condition (named only), gravitational-wave "echoes" (named only).

## Relationship to Previous Experiments
Gravity 4 (curved surfaces), 5, 7 (black holes), Black Holes 1 and 5 (horizon, falling in), Spacetime Geometry 2 (light cones), Frontier 20 (GW231123: the one event tested for a wormhole echo in 2026).

## Relationship to Later Experiments
Experiment 2 of the group (time travel) uses the wormhole as one way to make a closed path in time.

## Required Physics Tests (each must fail when the module is deliberately broken)
1. The flare-out b′(b₀) = −1 < 1; b(b₀) = b₀; b(r) < r for r > b₀; the embedding height matches the integral of 1 ÷ √(r ÷ b − 1).
2. ρ is negative everywhere and, at the throat, equals −τ₀ in magnitude.
3. The tension for r₀ = 10 m is 4.8 × 10⁴⁰ Pa = 4.8 × 10⁴¹ dyn/cm² (checks Kuhfittig's 5 × 10⁴¹) and for 3 km is 5.4 × 10³⁵ Pa = 5.4 × 10³⁶ dyn/cm² (± 0.1).
4. The total negative mass by closed form −π b₀ c² ÷ (2G) agrees with a numerical integral of ρ over the proper volume (both sides); for b₀ = 1 m it is 2.12 × 10²⁷ kg = 1.11 Jupiter masses (± 0.01).
5. The Kruskal throat radius r_min(T) falls from 2GM/c² at T = 0 to 0 at T = 1, monotonically; a 45° ray from the left never reaches the right side's axis before T = 1.
6. The Casimir energy per area for d = 1 µm is 4.33 × 10⁻¹⁰ J/m² (± 0.01) and falls as 1 ÷ d³.
7. The ratio of the energy needed to the Casimir energy is about 4 × 10⁵³ (± 5 percent) for b₀ = 1 m, d = 1 µm, 1 m².
8. The nearest-answer helper picks the closest button on a log scale; Prediction 2's answer is "Jupiter".
9. The module does not change when predictions change.

## Sources (checked 2026-10-29 by search results, abstracts and summarising fetches; none read in a paper)
| Source | What it was used for | Status |
|---|---|---|
| Einstein and Rosen, "The Particle Problem in the General Theory of Relativity", *Physical Review* 48, 73 (1935) | the "bridge", a two-sheeted space meant to represent a particle | search summary only; not fetched |
| Fuller and Wheeler, "Causality and Multiply Connected Space-Time", *Physical Review* 128, 919 (1962) | the Schwarzschild wormhole pinches off before even a photon could cross | search summaries only; not fetched (the reference is from memory, **to be checked**) |
| Morris and Thorne, "Wormholes in spacetime and their use for interstellar travel: A tool for teaching general relativity", *American Journal of Physics* 56, 395 (1988) | the throat, the flare-out, exotic matter | PDF fetched but unreadable here (no text layer); content known through Lobo's review and search summaries |
| Lobo, "From the Flamm-Einstein-Rosen bridge to the modern renaissance of traversable wormholes" (arXiv:1604.02082, 2016) | the flare-out condition entails a violation of the null energy condition | abstract read; full text not |
| Visser and Hochberg, "Geometric wormhole throats" (arXiv:gr-qc/9710001, 1997) | the null energy condition, weighted and integrated over the throat, must be violated | abstract read |
| Kuhfittig, "Accounting for exotic matter and the extreme radial tension in Morris-Thorne wormholes of embedding class one" (arXiv:2202.00051, 2022) | τ(r₀) = 1/(8πG c⁻⁴ r₀²) ≈ 5×10⁴¹ dyn/cm² (10 m/r₀)²; at 3 km the same size as a massive neutron star's centre; the flare-out and shape-function conditions | ar5iv text fetched 2026-10-29; a 2022 paper that repeats the Morris–Thorne figures |
| "mass at throat = −(radius c²)/G; 1 metre is about −1 Jupiter mass" | a cross-check of the derived mass | search-result summary only; source not identified |
| NASA Cosmicopia, "Are wormholes in space real, or are they only science fiction?" (`science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sp_sl.html`) | a plain official page: wormholes "are allowed to exist in the math of General Relativity"; no evidence they exist in the observed universe | fetched 2026-10-29; NASA Heliophysics, general-reader language, modification date October 14, 2005, now kept in NASA's archive ("attic") |
| Wu, Zhang, Huang and Ren, "Model-agnostic search of gravitational wave echoes in LVK data" (arXiv:2512.24730, December 2025, revised June 2026) | no statistically significant evidence of echoes in GW150914, GW231226 and GW250114 | abstract read |
| Lai, Lan, Wang and Piao, "Testing the wormhole echo hypothesis for GW231123" (arXiv:2602.01615, February 2026, revised October 2026) | a Bayes factor of 1.87 for echoes, "not robust"; supports the black-hole interpretation | abstract read |
| Jafferis and others, "Traversable wormhole dynamics on a quantum processor", *Nature* 612, 51 (2022) and the comments on it (arXiv:2308.00697) | a quantum-computer experiment reported as a "wormhole" that simulated a mathematical equivalent, not a tunnel in space; whether it shows what was claimed is debated | search summaries only |
| The Casimir energy −π² ħ c ÷ (720 d⁴); Lamoreaux 1997 | the only known source of negative energy, and its size; measured to within 5 percent | search summaries only |
| Maeda, "Simple traversable wormholes violating energy conditions only near the Planck scale" (arXiv:2107.07052) | a zero-mass wormhole whose exotic matter is confined near the throat (an example of how ideas change); and the limits on negative energy from quantum inequalities (Ford and Roman), not read | abstract read |
| A plain official page for **exotic matter and negative energy** and for the **Casimir effect** | the "Want to know more?" list (§29 rule 3(b)) | **no plain official page found yet** (the search returned papers and reviews); to be recorded under §29 rule 3(c) if none is found after a further search |

## Facts that may change (§29)
| Fact | Why it may change |
|---|---|
| No wormhole or echo has been detected | a new search, or a new event |
| The Bayes factor of 1.87 and the echo limits | a revised analysis |
| The quantum-computer "wormhole" debate | later comments or a repeat |
| NASA's page is dated 2005 | NASA may update or move it |

## Open items
a. The Morris and Thorne paper must be read as text (a library or arXiv-like copy) to confirm the throat shape function chosen here, the tension and the "about one Jupiter" statement.
b. The Fuller and Wheeler paper and the Kruskal relation are from search summaries and memory.
c. The derived total negative mass, −π b₀ c² ÷ (2G), differs by a factor of π/2 from the secondary summary's −b₀ c² ÷ G. The spec's choice is a decision (Decision 6).
d. The Casimir energy formula and Lamoreaux's measurement are from search summaries; the comparison with the surface of the observable universe uses 4.4 × 10²⁶ m for its radius and is to be sourced if kept.
e. A plain official page for exotic matter and the Casimir effect has not been found.

## Decisions for the owner (each with a default)
1. **Status label.** Open overall; Settled (what the equations say: the simplest throat pinches off; holding one open needs negative energy); no evidence that a wormhole exists. Default: as stated.
2. **The model:** only the simplest open throat (b = b₀² ÷ r, no tides), the Schwarzschild bridge and the Casimir comparison; not rotating, charged or quantum wormholes. Default: yes.
3. **The closing:** drawn from the Kruskal relation with four snapshots, or stated in words and drawn as a sketch. Default: the four snapshots.
4. **Two predictions** (yes/no on crossing; the negative mass for a 1 m throat) with five buttons on a log scale. Default: yes.
5. **Controls:** the throat radius and the Casimir plate gap, as trial values. Default: yes.
6. **The exotic mass formula:** the derived −π b₀ c² ÷ (2G) (1.11 Jupiter masses per metre), the secondary summary's −b₀ c² ÷ G (0.71), or both, said plainly. Default: the derived formula, with the other one stated and the difference explained.
7. **The Casimir comparison** with the surface of the observable universe as a rough illustration. Default: include it, marked illustrative; or leave it out.
8. **What has been looked for:** a table of the echo searches of 2025 and 2026 and a plain note on the 2022 quantum-computer "wormhole". Default: yes.
9. **Safeguard:** every picture says it is a toy shape from the mathematics; no drawing of a traveller or a "portal". Default: yes (`PROJECT.md` §9).
10. **Tutor:** the standard four-step sequence, and it never says that wormholes exist or that they cannot. Default: yes.
11. **Introduction length and links:** long and detailed, to §29; no plain official page for exotic matter and the Casimir effect is recorded under rule 3(c) if none is found. Default: yes.
12. **Title** "Can a wormhole exist?" (does not give away either prediction). Default: keep.
