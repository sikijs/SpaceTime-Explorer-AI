# Group Proposal: Evidence and Imagination: What Has Been Tested, What Has Not

**Status: PROPOSED by Claude on 2026-10-29 per `CLAUDE.md` §23 Stages 1 to 3, at the owner's request (2026-10-29: after a review of the whole project for gaps, "Build 1 to 4. New group. Include lower priority bridges like 'microwave-background dipole', 'wormholes', 'time travel'… Focus more on what would interest the user the most like wormholes etc."). On 2026-10-29 the owner then decided: exclude the first draft's Experiments 5 (Mercury), 7 (frame dragging), 8 (the star S2), 11 (the thorium clock), 12 (exoplanets) and 13 (Vera Rubin and Euclid); place the group between "Spacetime Geometry" and "Frontier and Beyond"; keep the order as drafted. The group is therefore SEVEN experiments. **On 2026-10-29 the owner approved the name, "Evidence and Imagination: What Has Been Tested, What Has Not" ("Go with 'Evidence and Imagination'"), and approved the group as listed ("approve the group"). The group is APPROVED as a direction; no experiment has a specification yet, and each needs its own specification and approval (§23 Stages 3 and 4).** Nothing is built. No fact below has been looked up: every number marked "indicative" is from Claude's memory and must be sourced (§29) before any wording is approved.**

## Why this group

The gap review of 2026-10-29 (searching all seven groups' specifications) found that the project teaches the theories of relativity well but shows few of the **tests** of them, and has not touched questions that learners ask about most. The owner chose these four gaps to fill, and asked for the bridges that learners find most interesting:

1. **Adding speeds relativistically** (excluded by Relativity 5, offered as an alternative by Spacetime Geometry 5 and 6, never built).
2. **Real evidence for time dilation** (no muon experiment; GPS is the only real clock test).
3. **A classic test of general relativity.** *Narrowed by the owner's decision:* only the Shapiro delay (named as "not modeled" in Frontier 11) is kept. Mercury's orbit (deferred by Gravity 6 as "a candidate for a later experiment"), frame dragging ("stated, not derived" in Black Holes 8) and the star S2 (only a mass source in Black Holes 1) are **not planned**.
4. **Big Bang nucleosynthesis** (absent from Cosmology).

Bridges kept: the microwave-background dipole, wormholes and time travel. **Not planned (owner, 2026-10-29): the thorium clock, exoplanets, and Vera Rubin and Euclid.**

## The rule this group follows

Some things in relativity and cosmology have been **tested** (and the page says how well), and some have **not** (and the page says why, and what would be needed). Every experiment carries a status label (Settled, Strong evidence, Contested or Open) dated "as of October 2026", and the rules of `CLAUDE.md` §29 (fuller introductions and captions, a "Want to know more?" list, a reading guide with the Results, rule 3(c) for a missing official page) and §14 ("Predictions and the Real Results") apply to every experiment. **Wormholes and time travel are the most speculative: their pages must say plainly which parts are mathematics, which are observation (none) and which are imagination, and a drawing must never suggest an effect that is not in the model (`PROJECT.md` §9).**

## The list (seven experiments, in the order the owner approved)

| # | Title (working) | The question | Model, in one line | Prediction (draft) | Status label | Builds on |
|---|---|---|---|---|---|---|
| 1 | Can a wormhole exist? | Could a tunnel connect two far places, and what would it need? | A curved-surface picture of a throat (as in Gravity 4); the shortcut length against the way round; why the simplest throat pinches shut faster than light could cross; the "exotic" matter a stable one would need | Is the way through shorter than the way round, and by how much? | **Open:** never seen; needs matter not known to exist | Gravity 4, 5, 7; Spacetime Geometry 2 |
| 2 | Can you travel back in time? | Forward is easy (the twins); is backward allowed? | The light-cone picture (Spacetime Geometry 2) with cones that tilt round a loop, so that a closed path forward in time exists; the proposed rule against it ("chronology protection", unproven) | How far must the cones tilt before a path returns to its start? | **Settled:** travel to the future (clocks show it). **Open:** the past | Spacetime Geometry 2 and 3; Relativity 10; this group's 1 |
| 3 | Adding speeds: why 0.5c + 0.5c is not c | Two spaceships each at half the speed of light: how fast does one see the other? | u = (v + w) ÷ (1 + vw ÷ c²), with the speed column of Spacetime Geometry 5 derived | What speed is the result: 1.0c or less? | **Settled** | Relativity 5, 9, 11; Spacetime Geometry 5 |
| 4 | Do fast muons live longer? | Particles made high in the air live about two millionths of a second yet reach the ground; why? | A decaying count seen from the ground (time dilation) and from the muon (length contraction) | What share survives the trip: tiny, or most? | **Settled** | Relativity 3, 4, 6 |
| 5 | Does the Sun slow light? | Does a radio signal passing near the Sun arrive late? | The extra delay from curved space, as a function of the closest distance | How late, in millionths of a second? | **Settled** (to a few parts in a hundred thousand in the best test) | Gravity 4 and 8 |
| 6 | What was the early universe's recipe? | Why is about a quarter of ordinary matter helium? | The neutron share when nuclei began to form, and how much ended up in helium | What fraction of matter is helium? | **Settled** for helium and deuterium; **Open:** the lithium puzzle | Cosmology 2 and 3 |
| 7 | Are we moving through the universe? | Is the microwave sky equally warm everywhere? | The Doppler formula of Spacetime Geometry 8 applied to the microwave background; the quasar count that some say is lopsided | How much warmer is the sky ahead than behind? | **Settled** (the microwave dipole); **Contested** (the quasar dipole) | Spacetime Geometry 7 to 9; Cosmology 3 |

**Indicative numbers for later checking (from memory, none sourced):** muon lifetime about 2.2 millionths of a second; the Cassini delay test to a few parts in a hundred thousand (2003); helium about a quarter of the mass; the microwave dipole about 3.4 millikelvin, a speed of about 370 km/s.

## Where the group goes in the sidebar (decided by the owner, 2026-10-29)

**Between "Spacetime Geometry" and "Frontier and Beyond"** (the `groupOrder` list in `src/App.tsx`). "Frontier and Beyond" stays the project's last group of results, so the sentences calling it the last group stay true, and the Conclusion page follows it as the last page.

## Consequences of the owner's exclusions (to be noted, not decided here)

* **The general-relativity tests are thin.** With Mercury, frame dragging and S2 out, the gravity chapters' evidence side is the Shapiro delay here, plus GPS, gravitational waves and the Event Horizon Telescope shadow already built. Mercury's orbit remains a topic that Gravity 6 itself named as a candidate.
* **The new group has no result from 2024 to 2026**, so it carries fewer "as of October 2026" facts and is cheaper to keep up to date.
* **The reserve list is still not proposed:** distant supernovae in slow motion, constant acceleration and its horizon, binary pulsars, ultra-high-energy cosmic rays and tests of Lorentz invariance, and inflation.

## The recap and the Conclusion page

1. **The Frontier recap:** a section on Experiment 25's page (not an experiment, no new physics), as in the earlier groups: it sorts the group's twenty-five results by status label and says which parts a learner can rely on and which may change. To be proposed on its own.
2. **A "Conclusion" page for the whole project:** a last chapter in the sidebar, not an experiment (no prediction, no run). Proposed content: the journey in one picture (the speed of light is the same for all, so time and space mix, so there is spacetime, so gravity is its curve, so there are black holes, waves and an expanding universe); what has been **tested** and how well, what is **contested** and what is **open**, using the status labels of every group; what "as of October 2026" means (a snapshot); what the page did not check; and where to go next. Every number is read from the experiments' modules. To be proposed on its own, after the group's experiments.

## Decided on 2026-10-29

1. **The name:** "Evidence and Imagination: What Has Been Tested, What Has Not" (the sidebar heading and the overview sentence are the owner's to approve when the first experiment is built).
2. **The group** is approved as listed, so that Experiment 1's specification can be drafted (§23 Stage 3). Not decided: the group's overview sentence, and whether the Frontier recap and the Conclusion page follow (each is proposed on its own).

## Size and how it would be built

Seven experiments, each with its own specification and approval (§23 Stages 3 and 4), built one step at a time (§6); the owner can stop after any experiment.

## Source status

Nothing has been fetched for this proposal. Every experiment's specification would start with a source search and a source-status table (§29), and would record any missing official page under rule 3(c).
