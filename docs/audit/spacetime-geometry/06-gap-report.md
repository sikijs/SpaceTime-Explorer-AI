# Gap report: Spacetime Geometry Experiment 6 (Making new particles: how much energy does it take? With decay)
Date: 2026-11-02 | Specification: docs/experiments/spacetime-geometry/06-making-new-particles.md | Components: src/components/MakingNewParticlesExperiment.tsx (Part 1), MakingNewParticlesDecay.tsx (Part 2), MakingNewParticlesTutor.tsx, MakingNewParticlesDecayTutor.tsx | Physics module: src/physics/makingNewParticles.ts (+ .test.ts, 30 cases) | Status: read-only, nothing changed

## Summary
Two parts, two predictions, two tutors, each part with a lab picture, a bar picture/ledger, a Results table and a tutor. Follows the older prediction rule: guesses appear only as one sentence of text above the Results. Biggest gaps: no guess marks on any picture (Rule A), no reading guide for the Results tables (Rule B, no check-up, no "What this table tells us"), "What to look for" items are bare questions (C6), and the caption/introduction worked examples (K = 3) already show both setups' numbers before the learner predicts (O2). Size: **L** (two predictions, two parts, 4 results tables in Part 2 plus 1 in Part 1).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 (Part 1) | Which setup leaves more usable energy for making new particles? (MakingNewParticlesExperiment.tsx:742-747) | (a) Setup A, (b) the same, (c) Setup B; state `prediction`, :485; PREDICTION_CHOICES :64-68 | The bars picture (MakingBars), first set, green "usable" part of each Setup's bar (drawn from :384-426). Exists, appears at the end of the run. |
| 2 (Part 2) | How do the pieces' masses added up compare with the parent's mass? (MakingNewParticlesDecay.tsx:789; choices :31-35) | (a) less, (b) same, (c) more; state `prediction` :609 | Mass ledger (DecayLedger), "parent" bar against the grey "sum of pieces' rest masses" bar. Exists, appears late in the run. |

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A0 | Met (listed above) | | |
| A1 | Met | Real results come from runMakingExperiment(energyOfMotion,newMass) :525 and runDecay; prediction only enters the text record :933, :316 and the tutor | none |
| A2 | Not met | No "YOUR GUESS" anywhere (grep) | White mark + box on the usable-energy bars (Part 1, per setup) and on the ledger (Part 2). Prediction 1 is about which setup, so mark on the Setup A/B rows. |
| A3 | Not met | n/a, no mark | Prediction 1 and 2 are choices without size: markers plus a caption note that they are only markers. |
| A4 | Not met | no mark | Draw only once the bars/ledger bars have filled. |
| A5 | Met (no new panel needed) | both answers have pictures | none |
| A6 | Not met | No "Where the real picture comes from" lines | Add under bars and ledger: calculated here by the physics module; imagined: the made-up neutral particle X (Part 1). |
| A7 | Not met | Intro says only "You are not graded" :674, :734 | Add the "predictions never change the pictures or tables, guesses are drawn in white and shown beside results" sentence; add a note beside the K and X controls (:693-739) and r / observer-speed controls in Part 2 saying that the controls change the drawings. |
| A8 | Not met | Module has runSetup, runMakingExperiment, runDecay etc. (makingNewParticles.ts:44-167); nothing for a guess mark | Add functions giving the mark position for each answer (e.g. the bar value the guess implies) with tests. Not named in tests today. |
| A9 | Partly met | Tutor "compare" step: "You predicted that ..." with numbers from module, MakingNewParticlesTutor.tsx:167, DecayTutor :210; no explanation text marks the prediction (grep for matched/right: none) | Tutor prompts must point to the white marks by name; add the marking in the explanation (owner decides whether tutor says matched). |
| A10 | Met (older rule) | "It is only recorded here, not marked right or wrong." MakingNewParticlesExperiment.tsx:933, Decay :317; "This is not graded" :766, :813; "You are not graded" :674, :734 | Not a fault; it does not state that predictions never change the pictures and tables. |

## Rule B
- B0. Part 1: one table, ten rows (A and B columns), plus a verdict line for each setup (:935-988). Part 2: tables "The masses", "pieces as the lab measures them", "as the passing observer measures them", "totals before/after" (Decay :323-380); the "No decay can happen" case has a short table (:327-336).
- B1. Not met. A real reference exists (the physics module's own hand-worked values; Part 1 real-world numbers: pion 134.98 MeV vs 279.66 MeV, LHC 13 TeV, from the spec's table, makingNewParticles.ts:139-141). The tutor holds these; the Results has no check-up. Whether a "check-up" suits: a "same / more / less" reading (CLAUDE.md allows) of usable energy and of mass-before-after is possible.
- B2. Not met. No "What this table tells us" under any table; row labels only.
- B3. N/A for now (optional). The controls only move marks in the pictures and the tables themselves are the comparison; no published value to compare to.
- B4. Partly met. The guess text appears above the Results (:932-933, Decay :316-317), with no row tag. Add a block and tag the usable-energy row (Part 1) and the "pieces' rest masses added up" row (Part 2).
- B5. Not met. Verdict text uses `verdict()` and formatNumber; row values are module outputs, but there are no comparison functions. Add with tests if a check-up is chosen.

## Rule C
- C1. Met for Part 1: particles named and speeds under each (:213-216), "Before the collision"/"The whole system, after" labels (:187, :225), bar rows labelled (:404, :443). Part 2: not fully read; the caption lists the labels "went right in the lab" etc. (Decay :866+). Not verified line by line in Part 2's SVG.
- C2. Met: K, X, r and observer speed change the drawn speeds, bar lengths and threshold marker (:892-895).
- C3. Met: "How to read this diagram" :794 (picture), "How to read these bars" :868, "How to read the mass ledger" Decay :913 and the diagram caption Decay :841.
- C4. Met: pictures named, each element explained, units (0.5c) defined (:820-822), bars and colours explained, order described.
- C5. Met: worked moments (K = 3) Experiment :845-848; (r = 0.3) Decay :~880. The bars caption has an example for X (:911-912).
- C6. Not met. "What to look for" items are bare questions or pointers with no Look at / What it means / Why it matters (:854-856, :919-921; Decay :896+, :936+).
- C7. Not met (O2 below): the Part 1 caption's worked moment (:845-848) and the introduction (:623-631) give M and usable energy for both setups at K = 3 before the learner predicts which leaves more usable energy.
- C8. Partly met: beam, target, K, usable, locked-in, system's mass, threshold defined in the introduction (:586-612). "System's own observer" defined before it is used. Decay terms (ledger) defined in the caption. Not fully checked for Part 2's intro terms.

## Other findings
- O1. Not found in what was read; not cross-checked against PROJECT.md/AGENTS.md.
- O2. (a) §12: Part 1's introduction (:623-631) and caption (:845-848) show, for K = 3, M = 3.16 (A) and 5 (B), and in the caption the usable energy 1.16 vs 3, which answers Prediction 1 before it is made. (b) Part 2's caption worked moment (r = 0.3: pieces total 0.6) hints at Prediction 2 (:~884). (c) Part 2's prediction note says the answer "depends on the setting" (Decay :29-30 comment only; not shown to learner). (d) Prediction clause text in the Part 1 results is "(a) Setup A..." label, plain; fine. (e) Part 1 results text says "Setup A: ..." verdict from module; no source issue seen. (f) The `prediction` resets when K or X changes (:706, :729), so a guess is lost on a control change; the Part 1 intro says nothing about that. Not decided here.
- No "Want to know more?" list (Cosmic Horizons only; N/A).

## What an update would touch, and its size (O3, O4)
Files: MakingNewParticlesExperiment.tsx (MakingBars, results), MakingNewParticlesDecay.tsx (DecayLedger, results), both tutor files, src/physics/makingNewParticles.ts and .test.ts, the specification, and the introduction/caption wording (owner approval, §28.1).
Size: **Large** (two predictions, two parts, five results tables to get reading guides, new marks on two pictures, a rewrite of both introductions' worked examples, and look-for items).

## Not checked
Part 2's SVG labels line by line, the Part 2 introduction's first half, the REFERENCE_ENTRIES panel, the tutor explanation paragraphs, no browser run, test run not repeated.
