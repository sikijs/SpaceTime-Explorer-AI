# Experiment 6 (Cosmic Horizons): Where Is the Dark Matter?

**Status: Specification APPROVED by the owner on 2026-10-20 ("approved, all defaults", read as approving all fourteen decisions on their defaults, including the label, the inclusion of the 2026 event, the counting model and the two predictions; Claude should say so if the owner meant otherwise), proposed by Claude on 2026-10-20 per `CLAUDE.md` §23 Stages 1 to 3, as the sixth experiment of the group approved on 2026-10-16 (`00-group-proposal.md`, "list of 19 approved"). The approval covers the specification, not the learner-facing wording. Steps 1 to 10 are built, and the owner approved the learner-facing wording and the differences from this specification on 2026-10-20 ("approved, update the docs and commit", read as covering both; Claude should say so if the owner meant otherwise); see "Implementation Notes". All learner-facing wording below is draft wording for the owner's line-by-line approval (§28.1), written to the standard of `CLAUDE.md` §29. Every published number was checked on 2026-10-20 against an arXiv abstract page or an official page, in most cases only through a fetch summary of the page (see "Real-World Facts Used, and Source Status"); no full paper was read, the LZ collaboration's December 2025 paper was not found, and one news page could not be fetched at all. Every number marked "computed" was computed on 2026-10-20 with the project's own functions (a throw-away test, deleted afterwards) and must be re-checked by the physics tests.**

**This specification departs from the group proposal in three places, each listed as a decision below (Decisions 1, 2 and 3).**

1. **The anchor has grown.** The proposal (written 2026-10-16 from search summaries) was about the LZ experiment's **December 2025 null results** and its first strong detection of solar neutrinos. A search on 2026-10-20 found that **the LZ collaboration itself reported one unexpected event in a paper posted on arXiv on 2 September 2026** (a theory paper about "the high-energy event in LUX-ZEPLIN", arXiv:2609.01592, is numbered earlier, so the event may have been shown publicly a little before; its date was not checked) (a nuclear recoil of about 248 keV, in a region where almost no background was expected), with a **local significance of 3.4 sigma and a global significance of 2.6 sigma**, and that at least eight theory papers about it appeared in the following weeks (arXiv numbers from 2609.01592 to 2609.17412, that is, in September). A news headline (CNN, 14 September 2026, "LZ experiment may have detected dark matter for the first time", the page itself could not be fetched, HTTP 451) says more than the collaboration does. This specification adds the event as the experiment's second idea, because it is the newest result of the same experiment and the clearest case of the difference between a **local** and a **global** significance. Decision 2 lets the owner leave it out.
2. **The status label changes.** The proposal's "Strong evidence (what dark matter is not); Open (what it is)" no longer covers a new, unexplained event. See Decision 1.
3. **The model is a counting model, not LZ's analysis.** The experiment teaches why a search with no events is a result, and how the result scales with the amount of data, using Poisson counting and the project's existing normal-curve functions. It does **not** reproduce any of LZ's limits (Decision 3).

**Group:** "Cosmic Horizons" (Part A: the expanding universe and what fills it, the dark matter search). **Status label shown to the learner (proposed): "Strong evidence about what dark matter is not; Open: what it is, and what one unexplained event means" (as of October 2026).**

---

## Overview

Cosmology Experiment 4 showed that galaxies spin too fast to be held together by the matter we can see, and that something unseen, called **dark matter**, supplies the extra gravity. Since then, physicists have tried to catch a dark-matter particle directly. The idea is simple: if the dark matter is a particle, a very small number of them pass through the Earth every second, and now and then one should bump into an atom and make it recoil. So a detector is built, deep underground to keep out everything else, and watched for years.

The largest such detector is **LZ** (LUX-ZEPLIN): 10 tonnes of ultra-pure liquid xenon, nearly a mile down in a former gold mine in South Dakota. In **December 2025** it reported that 417 live days of data (March 2023 to April 2025) show **no sign** of dark-matter particles of 3 to 9 times a proton's mass, and, for the first time in this detector, a clear signal (4.5 sigma) of neutrinos from the Sun's core. In **September 2026** (a paper posted on 2 September) a further analysis of 2.84 tonne-years of data, reaching up to much higher recoil energies, found **one event** at about 248 keV where almost nothing was expected, at 3.4 sigma locally and **2.6 sigma globally**. The collaboration says that the event "does not establish a dark matter origin".

This experiment lets the learner rebuild three ideas behind those results:

1. **A search that finds nothing is a result.** If a particle of a given strength were out there, the detector would have *expected* to count a certain number of events. Seeing zero when you expected many rules that strength out. The tightest way to say it: a "limit" is the strength at which the detector would have expected about **2.3 events**, so that seeing none would be a 1-in-10 accident. A stronger interaction is ruled out; a weaker one is not, yet.
2. **A longer run, or a bigger detector, rules out weaker interactions, but not without end.** The number of events you expect is the interaction strength times the amount of data (tonnes of xenon times years). Ten times the data tests an interaction ten times weaker, if no background appears. But neutrinos from the Sun also hit xenon nuclei and look like a light dark-matter particle, so at some point they become a floor, called the **neutrino fog**. LZ's detection of them at 4.5 sigma shows the experiment is reaching it.
3. **One unexplained event is a hint, and how big a hint depends on how many places you looked.** A 3.4 sigma excess at one chosen place is rarer than a 3.4 sigma excess *somewhere* among many. Correcting for that gives the global significance, here 2.6 sigma. This is the same idea as Experiment 2's "if you look in many places, something will stand out", with real numbers from a real event.

It says honestly what it does **not** do: it does **not** reproduce LZ's limits (its statistics are more sophisticated than counting), it does **not** say what the 248 keV event is, and it does **not** say whether dark matter is made of the particles being searched for.

The new ideas are (1) **a limit is a rule about expected counts, not a measurement**, (2) **sensitivity grows with the amount of data, and a floor of unavoidable background changes how fast** and (3) **local and global significance**. Sigma and the difference between a hint and a discovery are reused from Experiments 1 and 2.

---

## Learning Objective

After this experiment, the learner should understand:

1. **Direct detection** is the search for the rare bump of a single dark-matter particle against an atom in a very quiet detector, and a bump shows as a small flash of light and a few freed electrons (stated in plain words; the physics of the flash is not modelled).
2. **Expected events scale as strength times exposure.** If a particle has strength s (compared with a reference) and the detector's exposure is e (compared with a reference), the expected count is proportional to s × e.
3. **A limit is set where the expected count is about 2.3.** If nothing is seen, a strength with an expected count above 2.3 is ruled out with 90 percent confidence (the chance of seeing none is e^−2.3 = 10 percent). It is a statement about what the data allow, not a measurement of the particle.
4. **Ten times the data tests ten times weaker interactions, only if nothing else shows up.** With no background the limit improves as 1 ÷ exposure; with a background that grows with the data it improves more slowly, about as 1 ÷ √exposure (a textbook rule of thumb).
5. **The neutrino fog.** Neutrinos from the Sun's core (boron-8) knock xenon nuclei in the same way a light dark-matter particle would. LZ saw them at 4.5 sigma, more convincingly than PandaX-4T (2.64 sigma) or XENONnT (2.73 sigma) before it. Such a signal is a detection, and is also a background for the dark-matter search.
6. **No dark matter has been found by LZ, in the masses searched, at the strengths searched.** That narrows what dark matter can be (the simplest kinds of particle are ruled out in those ranges), and it does not show that dark matter does not exist: its gravity is measured (Cosmology Experiments 4 and 7).
7. **A single unexplained event is a hint.** LZ230616 at about 248 keV has a local significance of 3.4 sigma and a global significance of 2.6 sigma, short of the 3 sigma that is called "evidence", and far from the 5 sigma that is called a discovery. The collaboration does not claim dark matter. One paper rules out an explanation by ordinary neutrino scattering, and many theory papers propose others.
8. **What would settle it** is more data: LZ plans over 1,000 live days by 2028, and independent experiments (XENONnT, PandaX-4T) can look for similar events.

---

## Physical Situation

### Reused
- **Dark matter, and the evidence for it** (Cosmology Experiments 4 and 7: rotation curves and gravitational lensing).
- **Sigma, tension, and the difference between a hint and a discovery** (Experiments 1 and 2 of this group), including `oneSidedChance(sigma)` and `chanceOfAtLeastOne(chance, tries)` from `evolvingDarkEnergy.ts` ("if you look in many places...").
- **Neutrinos** (Experiment 4 of this group: very light, almost never interact, come from many sources) and **energy and mass** (Spacetime Geometry Experiments 5 and 6, only in passing: a keV is a thousand electron-volts).

### What is new
- **A direct-detection experiment**, in plain words: a tank of liquid xenon, deep underground; an incoming particle that hits a xenon nucleus makes it recoil, giving a flash of light and freed electrons. (The page does not explain the physics of the flash; it says only what is counted.)
- **A recoil energy in keV**, and **a "nuclear recoil" event**.
- **A "cross-section"**, the strength of an interaction, explained as the size of the target the particle sees (a bigger target means more bumps). Its units, square centimetres, are shown and explained as an area only (no conversion to anything familiar).
- **Exposure** (tonnes of xenon times years, "tonne-years", and "live days").
- **Poisson counting**: if you expect N events on average, the chance of seeing none is e^−N.
- **The neutrino fog.**
- **Local and global significance.**

### Simplifying assumptions (all stated to the learner in plain language)
- **The expected number of events is proportional to the interaction strength and to the exposure.** True for a fixed particle mass and no background change.
- **A limit is set where the expected count is 2.3, the zero-event rule.** LZ's actual limits come from a more detailed statistical method (not described on the pages read), so the numbers here are an illustration and not a re-derivation (Decision 3).
- **The "how the limit improves with more data" curves are two idealised cases** (no background; a background growing in step with the data), not LZ's projection, whose own numbers were not found (Decision 4).
- **The "places looked" model** treats the places in the search as independent tries with equal chance, which is not how LZ computed its global significance (by simulation, as far as the abstracts say). The experiment shows that about 14 independent tries reproduce 3.4 sigma becoming 2.6 sigma, as an illustration (Decision 5).
- **The published numbers are quoted as the papers state them.**

### Not introduced
How a WIMP would be made in the early universe, spin-dependent interactions, the physics of the xenon flash and the freed electrons, the profile-likelihood statistics LZ actually uses, the search for axions and other particles, the other ways of looking for dark matter (accelerators, space telescopes), why 248 keV is unusual for a standard particle (named as one sentence), the dozens of theory papers' models (named only), and any claim about what the event is.

---

## Physics Model

### The numbers (published values; checked on 2026-10-20, mostly through fetch summaries, see the source table)

| Quantity | Value | Source |
|---|---|---|
| LZ, December 2025: live days; no WIMPs between 3 and 9 GeV/c²; world-leading above 5 GeV/c²; boron-8 neutrinos at 4.5 sigma, surpassing PandaX-4T's 2.64 sigma and XENONnT's 2.73 sigma | 417 live days (March 2023 to April 2025); the "first time LZ has looked below 9 GeV/c²" | SLAC news release of 8 December 2025 (fetched, 2026-10-20) |
| LZ detector | 10 tonnes of liquid xenon, nearly one mile underground at the Sanford Underground Research Facility, South Dakota; over 1,000 live days planned by 2028 | the same release |
| LZ's published limit at high mass (2025) | spin-independent limit of 2.2 × 10⁻⁴⁸ cm² at 40 GeV/c² (median sensitivity 5.1 × 10⁻⁴⁸ cm²), 4.2 tonne-years (280 live days) | Aker/LZ Collaboration, arXiv:2410.17036 (October 2024), Physical Review Letters 135, 011802 (2025), abstract via a fetch summary |
| XENONnT, 3.1 tonne-years | minimum limit 1.7 × 10⁻⁴⁷ cm² at 30 GeV/c² (90 percent), no significant excess | arXiv:2502.18005, abstract via a search summary |
| PandaX-4T, 1.54 tonne-years | Physical Review Letters 134, 011805 (2025); its limit was not read | search summary |
| The LZ event, September 2026 | 2.84 tonne-years, an extended recoil-energy window up to about 270 keV; one candidate event at ER = 248 ± 23 (stat) ± 23 (sys) keV "in a region of low expected background"; largest local significance 3.4 sigma, global 2.6 sigma; "does not establish a dark matter origin" | LUX-ZEPLIN Collaboration, arXiv:2609.02823 (2 September 2026), abstract via a fetch summary; the quotation from the theory paper arXiv:2609.08893, which cites it |
| Theory papers on the event | Yuan et al. (arXiv:2609.08893, 8 September 2026): inelastic dark matter through an axion-like particle; Chattaraj et al. (arXiv:2609.10504, 9 September 2026): "kinematic considerations, the accompanying low energy recoil spectrum, and existing constraints exclude a viable interpretation of LZ230616 in terms of elastic neutrino-nucleus scattering"; at least six more titles in the same month | arXiv abstracts via fetch summaries and a search listing |

### The rules

- **Expected events** `N = N_ref × s × e`, where `s` is the interaction strength in units of the reference strength (the limit) and `e` the exposure in units of the reference exposure, and `N_ref = −ln(0.10) = 2.3026` (the number expected at the limit, with exposure `e = 1`).
- **Chance of seeing nothing** `P(0) = e^−N`; **chance of seeing at least one** `1 − e^−N`. At `N = 2.3026`, `P(0) = 0.10` and `P(≥1) = 0.90`.
- **How a limit improves with exposure** (`e` times the data): with no background, `limit(e) = limit(1) ÷ e`; with a background that grows with the data, `limit(e) = limit(1) ÷ √e` (an idealised rule of thumb, Decision 4).
- **Local and global significance:** local chance `p = oneSidedChance(σ_local)` (`evolvingDarkEnergy.ts`); with `T` independent tries, `p_global = chanceOfAtLeastOne(p, T)`; and the global significance `σ_global` is the sigma whose one-sided chance is `p_global` (needs an inverse of `oneSidedChance`, a small new function).

### Numbers (computed 2026-10-20; the tests recompute them)

| Item | Value |
|---|---|
| Expected events at the limit | −ln 0.10 = **2.3026**; chance of seeing none 10.0 percent, of seeing at least one 90.0 percent |
| Ten times weaker, ten times the data (`s = 0.1`, `e = 10`) | `N = 2.3026 × 0.1 × 10 =` **2.3026**, the same as at the limit |
| LZ's 2.2 × 10⁻⁴⁸ cm² (280 live days), the same data scaled to 1,000 live days (`e = 3.571`) | no background: **6.2 × 10⁻⁴⁹ cm²**; background-limited: **1.16 × 10⁻⁴⁸ cm²** (toy bounds, not LZ's projection) |
| Local 3.4 sigma | one-sided chance **3.37 × 10⁻⁴** (1 in 2,970) |
| Global 2.6 sigma | one-sided chance **4.66 × 10⁻³** (1 in 215) |
| Ratio of the two chances | **13.8**; with independent tries the number of tries that turns 3.4 sigma into 2.6 sigma is **13.9** |
| Chance of at least one of `T` tries giving a 3.4 sigma excess | T = 1: 0.034 %; 2: 0.067 %; 5: 0.17 %; 10: 0.34 %; 14: 0.47 %; 20: 0.67 %; 50: 1.7 %; 100: 3.3 % |
| Sigma of the boron-8 detections | LZ 4.5; XENONnT 2.73; PandaX-4T 2.64 (published numbers) |

### New: a small independent physics module

```typescript
// src/physics/darkMatterSearches.ts (proposed)
export const ZERO_EVENT_CHANCE = 0.1                                   // the chance of seeing nothing at the limit
export const EXPECTED_AT_LIMIT = -Math.log(ZERO_EVENT_CHANCE)           // 2.3026
export const LZ = { liveDays2025: 417, window: [3, 9], b8Sigma: 4.5, ... }  // the published numbers with sources
export const LZ_LIMIT_2025 = { crossSectionCm2: 2.2e-48, massGeV: 40, exposureTonneYears: 4.2, liveDays: 280, source: '...' }
export const OTHER_B8_SIGMAS = { xenonNT: 2.73, pandaX4T: 2.64 }
export const LZ230616 = { energyKeV: 248, statKeV: 23, sysKeV: 23, exposureTonneYears: 2.84, localSigma: 3.4, globalSigma: 2.6, source: '...' }
export function expectedEvents(strength: number, exposure: number): number       // 2.3026 x s x e
export function chanceOfNoEvents(expected: number): number                       // e^-N
export function chanceOfAtLeastOneEvent(expected: number): number               // 1 - e^-N
export function limitAfter(exposure: number, background: 'none' | 'grows'): number   // 1/e or 1/sqrt(e)
export function sigmaOfChance(chance: number): number                           // the inverse of oneSidedChance
export function globalSigma(localSigma: number, tries: number): number          // via chanceOfAtLeastOne
export function triesForGlobalSigma(localSigma: number, globalSigma: number): number
export type CountRange = 'about023' | 'about23' | 'about23x10'
export function countRange(strength: number, exposure: number): CountRange       // the answer to Prediction 1
export type GlobalEffect = 'lower' | 'same' | 'higher'
export function globalEffect(): GlobalEffect                                    // the answer to Prediction 2, from the data
export function runDarkMatterSearches(strength: number, exposure: number, background: 'none' | 'grows', tries: number): DarkMatterSearchesResult
```

Out-of-range inputs throw `RangeError` (a non-positive strength or exposure, a number of tries below 1 or not a whole number, a chance outside 0 to 1). The module reuses `oneSidedChance` and `chanceOfAtLeastOne` from `evolvingDarkEnergy.ts` unchanged (a test scans the imports) and adds standard textbook relations (Poisson, the zero-event rule, the scaling rules of thumb) whose sources are listed as unchecked below.

---

## Learner Controls

1. **Run:** gated on both predictions.
2. **After the run only, "Try your own search":** a strength slider (0.1 to 10 times today's limit) and an exposure slider (1 to 1,000 times the reference exposure), a choice of "no background" or "a background that grows with the data", showing the expected number of events, the chance of seeing none and of seeing at least one, and the limit after that exposure. It changes Picture 1's marker, Picture 2's point and the first results table. It does not clear the predictions.
3. **After the run only, "How many places did you look?":** a slider from 1 to 100 tries, with 14 marked "about the number that gives LZ's 2.6 sigma". It moves Picture 3's global bar and the second results table.
4. **A "Start over" button** clears the predictions and the pictures.

---

## Prediction Activity

Two questions, both answered before Run is enabled. Not scored while the learner is predicting; the tutor marks each as matched or not matched in its explanation (the group's pattern). Each ends "You are not graded, and a guess is fine."

> **Prediction 1: how many events?** An experiment's best limit is the interaction strength at which it would expect to see about 2.3 events, so that seeing none is a 1-in-10 accident. Suppose a particle's interaction is **ten times weaker** than that limit, and the experiment is run **ten times longer** with no background. How many events would it expect to see? Buttons: **About 0.23**, **About 2.3**, **About 23**.
>
> **Prediction 2: how sure?** In 2026 the LZ experiment found one unexpected event. Counting only the place where the event appeared, the chance that chance alone gives so strong an excess is that of a **3.4 sigma** result. But the search looked at many energies and many kinds of signal, so some excess was likely to turn up somewhere. Taking that into account, is the significance **lower**, **the same**, or **higher** than 3.4 sigma? Buttons: **Lower than 3.4 sigma**, **The same, 3.4 sigma**, **Higher than 3.4 sigma**.

Right answers: Prediction 1 is **about 2.3**: ten times weaker means ten times fewer events, ten times longer means ten times more, so the two cancel (`countRange(0.1, 10)`). The natural wrong answers: "about 23" (the longer run is the more obvious change), "about 0.23" (a weaker interaction is the more obvious change). Prediction 2 is **lower** (2.6 sigma; `globalEffect()`). The natural wrong answers: "the same" (the event is the event), and "higher" is unlikely.

The prediction texts do not give the 2.6 sigma, the 14 tries, or the 4.5 sigma of the solar neutrinos, and Prediction 2's text does not say that the global value is lower.

---

## Experiment Behavior

### Introduction (draft contents, to the standard of `CLAUDE.md` §29; the owner approves the wording line by line)

1. **The question.** "If a dark-matter particle is hitting the Earth all the time, why has no one caught one? And what does it mean when a search finds nothing, or finds a single odd event?"
2. **Where we left off.** Cosmology Experiments 4 and 7 (galaxies spin too fast; light bends more than visible matter explains), and this group's Experiments 1 to 5 (sigma, tension, a hint versus a discovery, and the earliest galaxies). Dark matter's *gravity* is measured. What it is made of is not.
3. **What would a dark-matter particle do?** It would have gravity, and almost never touch anything else. A very few might, now and then, bump into the nucleus of an atom. Everyday comparison: a few snowflakes in a gale, at a vast distance, hitting a golf ball once in a year. (To be chosen with the owner.)
4. **How to catch one.** A tank of 10 tonnes of liquid xenon (an unusually heavy, very pure and very still liquid), nearly a mile underground so that cosmic rays are blocked; a bump makes a flash of light and some freed electrons that sensors count (what the pages say, not modelled). Link to the LZ site and to the SLAC release.
5. **Strength, in plain words.** "Cross-section" is the size of the target the particle sees: a bigger target is bumped more often. It is written in square centimetres (an area). A smaller number means a weaker interaction.
6. **What counts, and the exposure.** The more xenon and the more time ("exposure", in tonne-years), the more chances for a bump. Expected number of events = strength × exposure (in a fixed unit). Everyday comparison: expecting raindrops on a roof.
7. **Counting and chance.** If you expect 5 events and see none, that is surprising. If you expect 0.1 and see none, it is not. A "limit" is the strength at which you would expect about 2.3 events, so that seeing none would happen 1 time in 10. That is why seeing nothing rules out stronger interactions but not weaker ones.
8. **The neutrino fog.** Neutrinos (Experiment 4) come from the Sun's core too (boron-8 neutrinos, from the Sun's fusion), and they sometimes knock xenon nuclei just as a light dark-matter particle would. They are a real signal and a background. In December 2025 LZ saw them at 4.5 sigma.
9. **What LZ found.** No dark matter in the masses searched; that narrows what dark matter can be; the new energy window of 2026; one event. (The numbers 2.84 tonne-years, 248 keV, 3.4 and 2.6 sigma are **not** in the introduction: they are what Prediction 2 asks. Only "one event at a very high energy, found in 2026" is.)
10. **Some new words:** WIMP (a "weakly interacting massive particle", the kind searched for), nuclear recoil, keV, cross-section, exposure and tonne-year, live day, limit (90 percent), Poisson, neutrino fog, local and global significance (explained after the run, to avoid revealing Prediction 2), "background".
11. **What the learner does.** Two predictions, press Run, then try a search of their own and change how many places were looked.
12. **Assumptions** (the list above, in plain language).
13. **"Want to know more?" links** (`CLAUDE.md` §29 rule 3), to be fetched and read before approval. **Candidates visible from the start:** CERN's page "Dark matter" (read, 2026-10-20), NASA's "Dark Matter" page (HTTP 200, not read), the LZ collaboration's website (HTTP 200, not read), the SLAC news release of 8 December 2025 (read), and the Imperial College news page on the December 2025 results (HTTP 200, not read). **Kept back until after the run, because they state what the predictions ask (§12):** the LZ collaboration's September 2026 paper (arXiv:2609.02823), the two theory papers (arXiv:2609.08893, 2609.10504), the LZ 2025 limit paper (arXiv:2410.17036), the XENONnT paper (arXiv:2502.18005) and the LZ December 2025 paper (its arXiv ID was **not found**). Each link is fetched and recorded in the source table. **Background ideas without a plain official link yet:** Poisson counting and the zero-event rule, local and global significance (Experiment 2 covers the idea), and the neutrino fog beyond the release's sentence.
14. **Date.** "As of October 2026."

The introduction must **not** say how many events LZ saw in 2026, their energy, the 3.4 or 2.6 sigma, or how the global value compares with the local one.

### Display

Three pictures, each with every component labelled on the canvas (§14) and a guide beneath it (§14 and §29), plus a small drawing in the introduction of a detector tank (an illustration, not a model).

- **Picture 1: "What does seeing nothing rule out?"** A curve of the chance of seeing no events, `e^−N`, against the expected number of events N from 0 to 6, with the 10 percent line and the point N = 2.30 marked and labelled "today's limit", the region N > 2.3 shaded "ruled out" and N < 2.3 "not ruled out", and a marker for the learner's own search (after the run).
- **Picture 2: "More data, weaker interactions."** The limit against exposure for the two idealised cases (no background, and a background that grows) starting from LZ's 2.2 × 10⁻⁴⁸ cm² at 280 live days and extending to 1,000 live days, on logarithmic scales, with the learner's own exposure marked. Labelled as an illustration, not LZ's projection. The neutrino fog is explained in the guide, not drawn (its height depends on the particle mass and was not found).
- **Picture 3: "How sure? A ladder of sigma."** Bars on a scale from 0 to 5 sigma, with the "3 sigma: evidence" and "5 sigma: discovery" lines of Experiment 2: the solar-neutrino detections by PandaX-4T (2.64), XENONnT (2.73) and LZ (4.5), the LZ230616 event's local significance (3.4) and its global significance (2.6, or the value for the learner's number of tries, with a marker at 14).

The guides must name every picture, define every term (including limit, exposure, recoil, keV, Poisson, local and global significance, sigma), list every drawn element, give a worked moment with real numbers (for example: the chance of seeing nothing at N = 2.3 is e^−2.3 = 0.100; 2.3026 × 0.1 × 10 = 2.3026; 2.2 × 10⁻⁴⁸ ÷ 3.571 = 6.2 × 10⁻⁴⁹), and give a "what to look for, and what it would mean" list, without revealing what the learner predicted before the run.

### Run

Five named stages of 2.6 seconds each: (1) "What the detector counts" (the introduction's drawing is highlighted; a text note with the exposure), (2) "What seeing nothing rules out" (Picture 1), (3) "More data" (Picture 2), (4) "Neutrinos from the Sun" (Picture 3's first three bars), (5) "One unexpected event" (Picture 3's last two bars). Playback speed does not change any number (§11).

### Results (neutral, then explained by the tutor)

Shown only after the run. Two tables: (1) for the learner's own search: strength, exposure, expected events, the chance of seeing none and of seeing at least one, and the limit after that exposure under each background rule, with the arithmetic step by step; (2) every published result with its year, value and source (LZ 2025 and 2026, XENONnT, PandaX-4T), and the local and global significance for the learner's number of tries. A "Words and formulas" panel (collapsed from the start) lists every term; formulas and worked examples appear only after the run (§12). The links kept back until now are listed here.

---

## Expected Observations

- A particle ten times weaker, searched for ten times longer, gives the same expected count as the current limit: about 2.3 events, and about a 90 percent chance of seeing at least one.
- Seeing nothing rules out strengths whose expected count is above 2.3, and nothing weaker.
- With no background, 1,000 live days instead of 280 would move LZ's 2.2 × 10⁻⁴⁸ cm² to about 6.2 × 10⁻⁴⁹ cm², and with a growing background to about 1.2 × 10⁻⁴⁸ cm² (illustration only).
- LZ's solar-neutrino detection (4.5 sigma) is stronger than the earlier ones (2.64 and 2.73 sigma), and above the 3 sigma line but below 5.
- The event's local 3.4 sigma is above the 3 sigma line, its global 2.6 sigma below it; about 14 independent tries turn one into the other.

## Expected Learner Understanding

The learner should leave able to say, in their own words: why a search that sees nothing still teaches something; what a limit is and why ten times more data tests ten times weaker interactions; why neutrinos from the Sun are both a signal and a background; why one strange event is a hint and not a discovery, and why the number of places looked matters; and that this experiment did not reproduce LZ's analysis or say what the event is.

## New Concepts Introduced

Direct detection, cross-section, exposure, the limit as an expected-count rule, how sensitivity grows with data, the neutrino fog, and local versus global significance.

## Relationship to Previous Experiments

Builds on Cosmology 4 and 7 (the evidence for dark matter), this group's Experiments 1 and 2 (sigma; local and global; "look in many places"; `oneSidedChance`, `chanceOfAtLeastOne`) and Experiment 4 (neutrinos).

## Relationship to Later Experiments

Experiment 7 of the group ("Do we need dark matter, or does gravity change?", wide binary stars) is the other way of asking whether dark matter is there. The closing recap sorts all nineteen results by status label.

---

## Required Physics Tests

1. `EXPECTED_AT_LIMIT` is 2.3026 (to four decimals, written out by hand as −ln 0.1) and `chanceOfNoEvents(EXPECTED_AT_LIMIT)` is 0.100.
2. `expectedEvents(1, 1)` is 2.3026; `expectedEvents(0.1, 10)` is 2.3026 (the answer to Prediction 1: ten times weaker and ten times longer cancel); `expectedEvents(0.1, 1)` is 0.23026 and `expectedEvents(1, 10)` is 23.026.
3. `chanceOfNoEvents(0)` is 1, it falls with N, and `chanceOfAtLeastOneEvent(N) + chanceOfNoEvents(N)` is 1 for every N; `chanceOfAtLeastOneEvent(2.3026)` is 0.900.
4. `limitAfter(3.571, 'none')` is 1 ÷ 3.571 = 0.280 and `limitAfter(3.571, 'grows')` is 1 ÷ √3.571 = 0.529; the first is smaller for every exposure above 1, the two are equal at 1, and `limitAfter(e, 'none') × e` is 1.
5. LZ's 2.2 × 10⁻⁴⁸ cm² scaled to 1,000 live days is 6.2 × 10⁻⁴⁹ and 1.16 × 10⁻⁴⁸ (to three significant figures, worked out by hand).
6. `sigmaOfChance(oneSidedChance(σ))` returns σ to three decimals for σ = 1, 2, 2.6, 3, 3.4, 4.5 and 5 (the inverse is the inverse).
7. `oneSidedChance(3.4)` is 3.37 × 10⁻⁴ and `oneSidedChance(2.6)` is 4.66 × 10⁻³ (the existing function, checked again here).
8. `globalSigma(3.4, 1)` is 3.4; `globalSigma(3.4, T)` falls as T grows; `globalSigma(3.4, 14)` is 2.6 to one decimal; `triesForGlobalSigma(3.4, 2.6)` is 13.9.
9. `globalEffect()` is `'lower'` (from the published 3.4 and 2.6), and `countRange(0.1, 10)` is `'about23'`.
10. The published values in the tables equal the module's data (a data test that catches a typing error): 417 live days, the 3 to 9 range, 4.5, 2.73 and 2.64 sigma, 2.2 × 10⁻⁴⁸ at 40 GeV and 4.2 tonne-years (280 live days), 2.84 tonne-years, 248 keV with its two uncertainties, 3.4 and 2.6, and the sources.
11. The sigma ladder is in the order the pictures draw it: PandaX-4T < XENONnT < LZ for the neutrinos, and global < local for the event.
12. Out-of-range inputs throw `RangeError`.
13. The module's imports reuse `oneSidedChance` and `chanceOfAtLeastOne` from `evolvingDarkEnergy.ts` (a regression test that scans the imports, as in Cosmology Experiment 6).

Each test must fail when the module is deliberately broken (several deliberate breaks, as in Experiments 1 to 5).

---

## AI Tutor Behavior

The same pattern as the earlier experiments (`CLAUDE.md` §13): **observe, compare with the predictions, a conceptual question, then the explanation**, each answered before the next (Continue enabled only after a reply). The tutor does not invent physics; every number comes from `darkMatterSearches.ts` or the cited papers. The predictions are marked as matched or not matched in the explanation only.

1. **Observe.** "Look at Pictures 1 and 3. What do you notice about where today's limit sits on Picture 1, and about where the five bars of Picture 3 sit compared with the 3 sigma and 5 sigma lines?"
2. **Compare.** The two predictions, without marking.
3. **Conceptual question.** "A detector that sees nothing for 417 days is now said to have seen one strange event. How would you decide whether that event is dark matter, a fluke, or something else? What would you want to know?" (The tutor does not answer it for the learner.)
4. **Explanation**, in simple words, with everyday examples, after a paragraph that marks the two predictions: (1) the learner's own numbers (the search they tried, with the arithmetic); (2) why seeing nothing rules out only stronger interactions (the raindrops on a roof: expecting 5 and seeing none is surprising, expecting 0.1 is not) and why ten times weaker and ten times longer cancel; (3) why more data does not help for ever (the neutrino fog; LZ's 4.5 sigma detection; a signal that is also a background), with the two idealised rules; (4) what has and has not been ruled out (the masses searched; that dark matter's gravity is still measured, Cosmology Experiments 4 and 7); (5) the event: LZ's own numbers, why 2.6 and not 3.4 (14 dice: roll 14 dice, and 'one of them is a six' is common, though a particular die being a six is not), that 3 sigma is "evidence" and 5 is "discovery" (Experiment 2), what the collaboration says ("does not establish a dark matter origin"), and what the theory papers do (many proposals; one rules out ordinary neutrino scattering); (6) what would settle it (more LZ data to over 1,000 live days by 2028, and independent experiments); (7) what was shown and what was not (the experiment is a counting model; it does not reproduce LZ's limits and does not say what the event is). **The tutor does not call the event dark matter, and does not call it a fluke.**

### Chapter summary (draft)

"What you learned" and "What's next", shown only after the tutor's explanation. Drafted after the owner approves the experiment, and then approved line by line. "What's next" points to Experiment 7 only once it has an approved specification.

---

## Real-World Facts Used, and Source Status

| Statement | Source | Status |
|---|---|---|
| LZ, December 2025: 417 live days (March 2023 to April 2025); no WIMPs between 3 and 9 GeV/c²; "world-leading results above 5 GeV/c²"; boron-8 solar neutrinos at 4.5 sigma, surpassing PandaX-4T (2.64) and XENONnT (2.73); over 1,000 live days planned by 2028; 10 tonnes of liquid xenon nearly a mile underground | SLAC news release, 8 December 2025 (www6.slac.stanford.edu/news/2025-12-08-lz-sets-worlds-best-hunt-galactic-dark-matter-and-gets-new-look-neutrinos-suns-core), through a fetch summary; the same facts in four other university and lab pages in a search result | **Checked (a release, through a fetch summary) on 2026-10-20**; **the LZ collaboration's own December 2025 paper was not found**, and the Berkeley Lab release returned HTTP 403 |
| LZ 2025 limit: 2.2 × 10⁻⁴⁸ cm² at 40 GeV/c², median sensitivity 5.1 × 10⁻⁴⁸ cm², 4.2 tonne-years (280 live days) | LZ Collaboration, arXiv:2410.17036, Physical Review Letters 135, 011802 (2025), abstract via a fetch summary | **Checked (abstract, through a summary) on 2026-10-20**; **whether a newer LZ analysis (including the December 2025 or September 2026 papers) gives a tighter limit at 40 GeV/c² was not found** |
| XENONnT, 3.1 tonne-years: minimum limit 1.7 × 10⁻⁴⁷ cm² at 30 GeV/c² (90 percent), best median sensitivity 1.4 × 10⁻⁴⁷ cm² at 41 GeV/c², no significant excess; PandaX-4T, 1.54 tonne-years, PRL 134, 011805 | arXiv:2502.18005, abstract via a search summary; the PandaX paper's title from a search summary | **Partly checked** (search summaries only); the PandaX limit was not read |
| LZ230616: 2.84 tonne-years, extended energy window to about 270 keV, one candidate at 248 ± 23 (stat) ± 23 (sys) keV "in a region of low expected background", largest local significance 3.4 sigma, global 2.6 sigma, "does not establish a dark matter origin" | LUX-ZEPLIN Collaboration, arXiv:2609.02823 (2 September 2026), "Search for dark matter particle interactions in an extended nuclear recoil energy window with the LUX-ZEPLIN (LZ) experiment", abstract via a fetch summary; the quotation as given by Yuan et al., arXiv:2609.08893 | **Checked (abstract, through two summaries) on 2026-10-20**; the fetch summary of the LZ paper also said the event "remains consistent with background processes", **which is not used** because the summary's wording could not be checked against the abstract; the expected background in the region was not read |
| Theory papers: Yuan et al., arXiv:2609.08893 (8 September 2026), inelastic dark matter via an axion-like particle, a dark-matter mass near 350 GeV with a mass splitting near 330 keV; Chattaraj et al., arXiv:2609.10504 (9 September 2026), the quoted exclusion of an explanation by elastic neutrino-nucleus scattering | arXiv abstracts via fetch summaries; at least six more theory titles in a search listing (arXiv:2609.01592, 2609.15742, 2609.15985, 2609.17412, 2609.06825, 2609.04673) | **Checked (two abstracts, through summaries) on 2026-10-20**; the other titles are from a listing and **not read** |
| "LZ experiment may have detected dark matter for the first time" | CNN, 14 September 2026, a search-result title | **Not checked: the page returned HTTP 451.** It is not used; the page says what the collaboration says |
| CERN: "Unlike normal matter, dark matter does not interact with the electromagnetic force. This means it does not absorb, reflect or emit light, making it extremely hard to spot." | home.cern/science/physics/dark-matter | **Fetched on 2026-10-20** (through a fetch summary) |
| Poisson counting: the chance of seeing none is e^−N; the zero-event 90 percent rule N = 2.30; the limit scaling as 1 ÷ exposure with no background and about 1 ÷ √exposure when background-limited | Textbook statistics | **Not checked at a source**; LZ's own analysis uses a more detailed method that the pages read do not describe |
| A cross-section is the effective size of the target; a keV is a thousand electron-volts; a recoil of 248 keV is unusually high (the theory paper says "unusually high recoil energy") | General physics; arXiv:2609.08893 | **Not checked** (the keV definition is standard; the "unusually high" is quoted from the theory paper's abstract summary) |
| Links to read before approval: lz.lbl.gov, science.nasa.gov/dark-matter, www.imperial.ac.uk/news/articles/natural-sciences/physics/2025/dark-matter-search-sets-new-limits-and-achieves-neutrino-breakthrough, xenonexperiment.org | The pages themselves | **HTTP 200 on 2026-10-20 by `curl`; their text was not read** (the SURF page of the LZ experiment returned HTTP 404 and is not a candidate) |

### Facts that may change (re-check list, as of October 2026)

- **Any further LZ result on the event**: more data (LZ plans over 1,000 live days by 2028), the collaboration's later papers, a statement on the expected background.
- **Independent checks**: XENONnT and PandaX-4T looking for similar events (the CNN piece, unread, said they are positioned to test it), and any analysis of the event's origin (backgrounds, instrument effects).
- **LZ's own limits**: the December 2025 paper (not found), the September 2026 paper's limits, and any later limit that replaces the 2025 value of 2.2 × 10⁻⁴⁸ cm².
- **The neutrino fog**: new detections (boron-8 neutrinos at other experiments) and the first atmospheric-neutrino signals.
- **Which theory explanations are excluded**: the eight or more theory papers of September 2026 are early; later papers may confirm or rule out any of them.

---

## Decisions Needing Human Review

Defaults are what I will use unless you say otherwise.

1. **The status label.** Default: "Strong evidence about what dark matter is not; Open: what it is, and what one unexplained event means". Alternatives: the proposal's original "Strong evidence (what it is not); Open (what it is)" (which leaves the event out); or "Contested", which fits the event less well because the collaboration is not claiming anything.
2. **Whether to include the 2026 event.** Default: yes, as the second idea (local versus global significance, using Experiment 2's functions). Alternative: leave it out and teach only the December 2025 null results, which keeps the experiment simpler and the status label as the proposal had it, but leaves the experiment out of date as of the month it is written.
3. **A counting model, not LZ's analysis.** Default: Poisson counting and the zero-event rule as an illustration, stated to the learner as such. Alternative: a profile-likelihood or Feldman-Cousins treatment, which the project does not have and which the pages read do not describe.
4. **The "more data" curves.** Default: two idealised rules (1 ÷ exposure and 1 ÷ √exposure) starting from LZ's published 2.2 × 10⁻⁴⁸ cm² (280 live days), labelled as an illustration and not LZ's projection, with the fog described and not drawn. Alternative: drop Picture 2 (the exposure idea then stays in the text), or look for LZ's own projection and draw it.
5. **Local and global as independent tries.** Default: `chanceOfAtLeastOne(p, tries)` from Experiment 2, with 14 tries marked as the number that reproduces 2.6 sigma, stated as an illustration. Alternative: say only the two published numbers and do not model the step between them.
6. **Two predictions.** Default: Prediction 1 (the counts: ×0.1 and ×10 cancel) and Prediction 2 (the global significance is lower), both with answers fixed by the data. Alternative: replace Prediction 1 with "Is a limit a measurement of the particle's strength?" (a yes/no question, with no number), which is simpler but less quantitative.
7. **Which limit is "today's best".** Default: the 2025 LZ limit (2.2 × 10⁻⁴⁸ cm² at 40 GeV/c²), named as such, with the note that newer analyses may be tighter. Alternative: leave out any cross-section number and teach with ratios only.
8. **The units.** Default: cm² shown and explained as an area only, with no comparison to anything familiar (none was sourced). Alternative: ratios only (Decision 7's alternative).
9. **The neutrino fog.** Default: explained in words and shown only through the three boron-8 detections in Picture 3. Alternative: draw a fog floor (needs a source for its height, which was not found).
10. **Other experiments.** Default: XENONnT and PandaX-4T appear as the earlier boron-8 hints (2.73 and 2.64 sigma) and in the results table with their exposures and limits (the PandaX limit still to be read); no comparison picture. Alternative: leave them out.
11. **Theory explanations of the event.** Default: say that many have been proposed within weeks, that one paper rules out an explanation by ordinary neutrino scattering, and name nothing else. Alternative: leave out all mention of them (the event then has no discussion of what it might be).
12. **The CNN headline.** Default: not used and not linked (the page could not be read, and the collaboration's own words are quoted instead). Alternative: link it after the run as an example of how a news story can say more than the paper, if the owner can read it.
13. **Links kept back.** Default: the collaboration's paper, the two theory papers and the limit papers are shown after the run (§12); the start has CERN, NASA, the LZ site, SLAC and Imperial (all to be read before approval). Alternative: show all from the start (against §12).
14. **The title.** Default: "Where is the dark matter?" (the proposal's, with "The null results" dropped because of the event). Alternative: "Where is the dark matter? What a search that finds nothing teaches" (closer to the proposal, but leaves the event out of the title).

---

## Success Criteria

1. The learner can say in plain words why a search that sees nothing still rules something out, and what a limit is.
2. The learner sees that ten times weaker and ten times longer give the same expected count, and how the limit improves with more data under two idealised rules.
3. The learner sees LZ's solar-neutrino detection and the 2026 event on one sigma ladder, with the 3 and 5 sigma lines, and sees the local and global values.
4. Every drawn component is labelled on the canvas, and each picture's guide follows `CLAUDE.md` §14 and §29.
5. The status label is shown, dated October 2026.
6. Neither the introduction nor the captions reveal the answers to the predictions before the learner has predicted (§12).
7. The physics tests above pass and fail under deliberate breaks.
8. The experiment says it does not reproduce LZ's analysis and does not say what the event is, and the tutor neither calls the event dark matter nor a fluke.
9. The "Words and formulas" panel lists every term and formula (formulas after the run), and every term is defined before it is first used (§15), including sigma, keV, cross-section, exposure, limit, Poisson, local and global.
10. Every published number matches the checked source, the "facts that may change" list is in the specification, and the links list includes the original papers and official pages (§29 rule 3), each fetched **and read**.
11. Nothing contradicts Cosmology 4 and 7 or Experiments 1, 2 and 4 of this group.

---

## Implementation Notes

The specification is approved (2026-10-20). **Built so far (2026-10-20):**

- **Step 1, physics model and tests:** `src/physics/darkMatterSearches.ts` and `darkMatterSearches.test.ts` (28 tests covering the 13 required tests). The expected values in the tests are worked out by hand (logarithms and the standard normal table: Q(3.4) = 3.369e-4, Q(2.6) = 4.661e-3), not by calling the module. **Checked by sixteen deliberate breaks of the module** (the limit rule with the wrong logarithm, the exposure ignored, the Poisson chance wrong, each of the two background rules replaced, LZ's 280 live days changed, the bisection flipped, the number of tries off by one, the tries formula wrong, a prediction's edge moved, the global effect's sign flipped, two published numbers changed, the clamp at one half removed, the largest number of tries changed, and the learner's limit factor replaced), each of which made at least one test fail (1 to 6 failures); none survived. The full suite passed and `tsc --noEmit -p tsconfig.app.json` printed no errors. The module reuses `oneSidedChance`, `chanceOfAtLeastOne` and `sigmaLabel` from `evolvingDarkEnergy.ts` unchanged (a test scans the imports). **Differences from this specification, for the owner's approval:** (1) `CountRange` has the values `'point23'`, `'twoPoint3'` and `'twentyThree'` (the specification's sketch had `'about023'`, `'about23'` and `'about23x10'`, which were confusing), with the edges at 0.73 and 7.3 (the middles of the answers on a logarithmic scale, my choice, since the specification gives only the answers); (2) the module also exports `globalChance`, `limitAtLiveDays` (LZ's published limit scaled to a number of live days, so the 6.16e-49 and 1.164e-48 cm² of the specification are the module's own numbers), `SIGMA_LADDER` (the five bars of Picture 3 with their Experiment 2 labels, in the order they are drawn), `TRIES_FOR_LZ_GLOBAL` (13.86), `XENONNT_LIMIT`, `LZ_DECEMBER_2025` and `LZ_LIMIT_2025`, `OTHER_BORON8_SIGMAS`, `LZ230616` and the constants `ZERO_EVENT_CHANCE`, `MIN_TRIES` (1) and `MAX_TRIES` (100); (3) the number of tries must be a whole number from 1 to 100 (the slider's range; the specification says "at least 1"), and `triesForGlobalSigma`, which is not a whole number, is a separate function; (4) `globalSigma` returns 0 when the global chance is above one half (the specification does not say); (5) `sigmaOfChance` accepts a chance from about 7.6e-24 (the chance at 10 sigma, the top of `oneSidedChance`'s range) to 0.5, and finds the sigma by a bisection of 100 steps; (6) the Poisson and zero-event rules are in the module as standard statistics, with no source read (the source table). **Not checked:** the module's physics beyond its tests (the zero-event rule and the two scaling rules have no source read, and the specification says so); the source figures themselves, which are from fetch summaries; nothing in the interface (not built).
- **Step 1 committed at the owner's request on 2026-10-20** (`01d02ff`, with the specification).
- **Step 2, basic interface (2026-10-20):** `src/components/DarkMatterSearchesExperiment.tsx` (the status line, the introduction with its new-word list and its "Want to know more?" links, a drawing of a detector with a "How to read this drawing" guide, the collapsed "Words and formulas" panel with 15 entries, and the skeleton of Picture 1 with its guide) and, in `src/App.tsx`, the new chapter (sidebar entry "Where is the dark matter?", last in Cosmic Horizons) with a **placeholder** chapter summary (never shown, because the summary appears only after the tutor's explanation). Checked in Chrome at the local address: the page loads, the heading and five links render (all five open in a new tab), the panel has 15 entries, both drawings render, no NaN, undefined or Infinity in the text, none of the 2026 event's numbers (248, 2.84, 3.4 sigma, 2.6 sigma, LZ230616, "global significance") appears, and there are no predictions or Run button yet. Two layout faults were found and fixed in the browser: the detector drawing's labels on the right were cut off and its particle label collided with the depth arrow and the rock note (it was laid out again). The full suite passed (1,056 tests) and `tsc --noEmit -p tsconfig.app.json` printed no errors. All wording is draft for the owner's approval. **Differences from this specification, for the owner's approval:** (1) "How to catch one" says that the tank holds 10 tonnes of xenon **of which seven active tonnes act as the target** (LZ's own site, read on 2026-10-20; the release says 10 tonnes) and gives the depth as the 4,850-foot level; (2) the five visible links are the specification's five (CERN, NASA, the LZ site, SLAC and Imperial College), **all read on 2026-10-20** (the specification said NASA's, LZ's and Imperial's text was not yet read); the XENONnT website is not linked; (3) the introduction says what LZ found in December 2025 (417 live days, the masses searched, the 4.5 sigma of the boron-8 neutrinos) and only that, in 2026, a wider range of recoil energies was searched and "one event at a very high energy" was found, with no number (item 9 of the introduction); (4) the panel has 15 entries (the local and global significance entry and the formulas come after the run); (5) Picture 1's skeleton shows the axes and the curve of the chance of seeing none (the curve is the module's), and a grey note that today's limit and the shaded regions come with Run; (6) "What we assume" is one paragraph, not a list; (7) the drawing and its guide are new wording. **Unchecked claims in the text:** that the detector is in "an old gold mine" (general knowledge, no source read); that the rock "blocks most particles from space" (Imperial's page says the depth is "to shield against cosmic interference"); that the simplest kinds of particle are ruled out at the masses and strengths searched (the specification's own statement, no source read); that a proton weighs about 1 GeV/c² and a keV is a thousand electron-volts (standard); that background includes "a trace of radioactivity in the materials, or particles from space" (general knowledge); that xenon is "a very heavy, very pure gas" (general knowledge; the release says "ultrapure"); and "one of the largest experiments of this kind" (the release says the largest dataset ever collected by a dark-matter detector, through a search summary). Not checked: narrow widths, other browsers, keyboard use, a screen reader, a real learner, and the predictions, Run, Pictures 2 and 3, the results, the controls, the tutor and the summary (not built).

- **Step 3, the predictions (2026-10-20):** the two questions with the specification's wording, the answer buttons, Run disabled until both are answered, and Start over (shown after the run).
- **Steps 4 to 6, the run, Pictures 1 to 3 and the results (2026-10-20):** a five-stage run of 2.6 seconds each (the timer only paces the display); Picture 1 gains the limit marker (2.30 events), the 10 percent line, the "ruled out" and "not ruled out" shading and, after the run, a ring for the learner's own search; Picture 2 (two idealised limit lines from 280 to 1,000 live days on log scales, with a marker for the learner's exposure) and Picture 3 (the sigma ladder with the 3 and 5 sigma lines) are new, each with a "How to read" guide, a worked moment and a "what to look for" list. After the run: the two controls ("Try your own search": strength 0.1 to 10 times today's limit, exposure 1 to 1,000 times the reference, no background or a growing one; "How many places did you look?": 1 to 100, starting at 14), Table 1 (the learner's search with the arithmetic) and Table 2 (the published results, and the global chance and sigma for the learner's number of places), five added entries in the "Words and formulas" panel (local and global significance and four formulas), and the five held-back arXiv links (2609.02823, 2609.08893, 2609.10504, 2410.17036 and 2502.18005; each fetched on 2026-10-20, HTTP 200 with the expected title). The interface calls only functions of `darkMatterSearches.ts`; its own arithmetic is where a point is drawn, the slider-to-value mapping and the display of square roots in the tables.
- **Step 7, the tutor and the chapter summary (2026-10-20):** `src/components/DarkMatterSearchesTutor.tsx` (observe, compare, one conceptual question, then an eight-part explanation that marks each prediction as matched or not matched, and only there) and the chapter summary in `src/App.tsx`. The tutor calls the event neither dark matter nor a fluke.
- **Step 8, complete-flow test (2026-10-20, Chrome):** all nine prediction pairs, each run through all five stages, four control settings per run checked against a separate calculation (expected events, the chance of seeing none, the global chance), the tutor's three steps, the marks (correct for every pair) and the summary. Nothing from the results, tutor or held-back links was on the page before the run. The progress marks (check mark, explained) were saved correctly.
- **Step 9, final review and fixes (2026-10-20):** the review found six items: the stage 1 highlight was missing (fixed: the drawing is outlined in yellow and shown again beside the stage note), Picture 3's bar names used "LZ230616", "local" and "global" before they were defined (fixed: the bars read "LZ 2026 event, at its own place" and "LZ 2026 event, all places counted", with the learner's number of places after the run), some source checks and unsourced claims (fixed as listed below), Picture 2's marker vanished silently beyond 1,000 live days (fixed: a note says so), Table 2 had no year for two rows (not fixed: no source), and a saved "explained" chapter keeps its summary, which contains "248 keV" and "2.6 sigma", on screen after Start over (existing app behaviour for every experiment; not changed).
- **Source checks (2026-10-20):** the abstracts of arXiv:2609.02823, 2609.08893 and 2609.10504 were read directly (not through a summary). The LZ abstract confirms 2.84 tonne-years, 248 ± 23 ± 23 keV, a global significance of 2.6 sigma and "a maximum local significance of 3.4 sigma across the models tested". The Chattaraj abstract says that elastic neutrino-nucleus scattering is excluded "for all scenarios considered". The Yuan abstract describes inelastic scattering between two dark-matter states (the paper's dates: 8 and 9 September 2026, against the LZ paper's 2 September). The LZ site, the SLAC release and the Imperial page were read: they say "a mile underground" or "nearly one mile underground" at the Sanford Underground Research Facility, "ultrapure, ultracold liquid xenon" (Imperial), "shielded from cosmic rays and built from low-radioactivity materials" (SLAC) and "the largest dataset ever collected by a dark matter detector" (Imperial). **None of them says "gold mine"**, so that phrase was removed. **Not found or not read:** the LZ December 2025 paper; the full September 2026 papers; any year for the XENONnT and PandaX-4T boron-8 results; the PandaX-4T limit.
- **Differences from this specification (approved 2026-10-20):** (1) the tutor's explanation has eight parts, not seven (the learner's own search, the zero-event rule, more data, what is ruled out, the event, what is said about it, what would settle it, and what was and was not shown); (2) the dice comparison uses 14 twenty-sided dice (a 1-in-20 chance in one try gives at least one in 14 with a chance of about 51 percent, computed), because a six on a six-sided die is not rare; (3) Picture 3's last bar is computed from the learner's number of places and shown to one decimal (2.6 at 14 places, from 2.59), and the bars' names are shown by the interface (the module's `SIGMA_LADDER` names are unchanged); (4) at stage 1 the drawing is outlined and also shown again beside the note; (5) Start over appears after the run, not during it; (6) Picture 2's marker uses the background the learner chose, and Picture 1's ring is drawn only up to 6 expected events; (7) the held-back links are five arXiv papers, and the December 2025 paper is missing; (8) the chapter summary was drafted with the tutor and approved with it; (9) Table 2 labels the event's local significance as the largest across the models tested, as the LZ abstract says; (10) the introduction says that LZ reported the largest dataset ever collected by a dark-matter detector and names the Sanford Underground Research Facility.
- **Not checked:** narrow widths, other browsers, the keyboard, a screen reader and a real learner; Experiment 5's "What's next" does not yet point to this experiment.

**(Superseded 2026-10-20: the wording is approved, and what is still open is listed above under "Not found or not read".) Before the wording is approved, still to do:** find and read the LZ collaboration's December 2025 paper (its arXiv ID was not found); read the abstract of arXiv:2609.02823 directly (the fetch gave a summary) and the expected background in the region of the event; try again to read the CNN page, or leave it out (Decision 12); read the XENONnT website (the LZ website, NASA's dark matter page and Imperial's news page were read at Step 2); read the PandaX-4T 2025 abstract; check whether a newer LZ limit than 2.2 × 10⁻⁴⁸ cm² exists (Decision 7); check the Poisson and scaling rules at a source (Decision 3); and look again for XENONnT or PandaX-4T results on the event. The next steps follow `CLAUDE.md` §6 and §21 one at a time, starting with the basic interface (the real `tsc` check is `tsc --noEmit -p tsconfig.app.json`).
