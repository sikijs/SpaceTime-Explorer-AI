# Cosmology — Closing Synthesis: "Putting It All Together: What Is the Universe Made Of, and How Do We Know?"

**Status: APPROVED by the owner on 2026-10-09 (proposed by Claude per `CLAUDE.md` §23 Stages 1–2 on 2026-10-09, after the owner asked whether the Cosmology chapter should have more, drafted as a specification per Stage 3, and approved as written, including the defaults chosen for the seven open decisions and the wording below, which the owner reviewed line by line, `CLAUDE.md` §28.1). Built (2026-10-09): `src/components/CosmologySynthesis.tsx`, rendered by `src/components/FateOfTheUniverseExperiment.tsx`, with a pointer sentence at the end of Experiment 10's introduction. Browser-checked, with its figures checked against each earlier experiment's own results. See "Implementation Notes".**

This is a closing section for the "Cosmology" chapter, not an eleventh experiment. It follows the precedent of the Gravity chapter's "Closing Synthesis: Putting It All Together" (`docs/experiments/gravity-and-curved-spacetime/09-gps-time-dilation.md`).

---

## Overview

Cosmology Experiment 10 (the fate of the universe) is the last experiment of the chapter. This section sits at the bottom of its page and appears only after the learner reaches the tutor's explanation. It steps back from the ten experiments and does three things:

1. It tells the chapter's results as **one chain of evidence**, in order, tying each claim back to the experiment that showed it.
2. It says plainly **which parts the experiments support directly and which parts are still open**, naming the experiment that raised each open question.
3. It links cosmology back to the project's earlier chapters (relativity and gravity), using only ties the chapter already established.

It carries **no prediction, no controls, no measurement, and no new physics.** Every number in it is one the learner has already seen in an earlier experiment's own results, and each is computed from that experiment's own code where a function exists, never typed in separately. It is a closing statement to read, not another round of predict, experiment, observe, explain.

This is the only new content: a way of seeing the ten experiments as one story. It introduces no new concept and, by default, no new term (see Decision 3).

---

## Learning Objective

After this section, the learner should be able to:

1. Describe the chapter as a chain of evidence, from "the universe is expanding" to "where it is heading", and say which experiment supplied each link.
2. Say that the same conclusion (unseen mass) was reached in two independent ways (stars' orbit speeds, and bending light), and why that matters.
3. Say which parts of the picture the chapter's experiments support most directly, and name the open questions: what dark matter and dark energy are, whether dark energy is constant, the Hubble tension, whether the early ripples were big enough, and what happened at the very beginning.
4. See cosmology as an application of the relativity and gravity chapters, not a separate subject.

---

## Placement and Display

- **Where:** at the bottom of Experiment 10's page (`FateOfTheUniverseExperiment`), below the tutor, shown only once the tutor's explanation step is reached (as in the Gravity chapter). It is not a separate sidebar page, so a learner cannot read it before running anything (Decision 1).
- **A pointer in the introduction:** one sentence at the end of Experiment 10's introduction ("This is the last experiment in this chapter. Once you have run it, scroll down to 'Putting It All Together'..."), as Gravity Experiment 9's introduction did. The exact sentence is in the wording below.
- **Style:** plain text with a heading, two sub-headings and one table, styled distinctly from the tutor's conversation panel (no text box, no "Continue" button). No completion callback: it needs no separate tracking, because it appears only after the tutor step that `onTutorComplete` already tracks.
- **Text only (Decision 4).** No new diagram, so the `CLAUDE.md` §14 diagram rules do not apply; the one table is a plain table.
- **Where the code lives:** a small component of its own (for example `CosmologySynthesis.tsx`) rendered by Experiment 10's page, so Experiment 10's component stays as it is. Figures are computed there by importing the earlier experiments' constants and functions (see "Figures").

### Figures

Where an earlier experiment already exports a constant or function for a figure, the section imports it and rounds it the way that experiment's own text does; it does not type the number in again. The figures and their sources:

| Figure in the text | Source |
|---|---|
| 70 km/s per megaparsec; a galaxy 100 megaparsecs away moves away at 7,000 km/s (the Coma Cluster preset) | `HUBBLE_CONSTANT_KM_PER_S_PER_MPC`, `recessionSpeedKmPerS`, `GALAXY_PRESETS` (Experiment 1) |
| The Hubble time, about 14.0 billion years; the measured age, 13.8 billion years | `hubbleTimeYears`, `REAL_UNIVERSE_AGE_YEARS` (Experiment 2) |
| About 380,000 years after the Big Bang; about 2,972 K then; stretched about 1,090 times; 2.725 K now | `RECOMBINATION_YEARS_AFTER_BIG_BANG`, `cmbTemperatureKelvin`, `RECOMBINATION_REDSHIFT`, `CMB_TEMPERATURE_TODAY_KELVIN` (Experiment 3) |
| Stars' speeds of about 220 km/s | `OBSERVED_SPEED_KM_PER_S` (Experiment 4) |
| A ring of about 47 arcseconds; visible matter alone could make about 18; about 15% of the cluster's mass is visible; about 6.7 times the visible mass | `OBSERVED_RING_ARCSECONDS`, `VISIBLE_MASS_FRACTION`, the ring function (Experiment 7) |
| About 70% dark energy | `BEST_FIT_DARK_ENERGY_FRACTION` (Experiment 5) |
| Ages of about 9.3 (matter only), 13.5 (70% dark energy) and 13.8 (measured) billion years | `universeAgeYears`, `REAL_UNIVERSE_AGE_YEARS` (Experiment 6) |
| Light travelled about 13.5 billion years; its source is now about 45 billion light-years away | `lightTravelYears`, `distanceTodayLightYears` (Experiment 8) |
| A ripple grows about 850 times since the oldest light, and about 2,650 times with dark matter's head start | `growthBetween` (Experiment 9) |
| Doubling times of about 17, 48 and 136 billion years (matter only) and about 10.7, 11.4 and 11.6 (70% dark energy) | `runFateOfTheUniverseExperiment` (Experiment 10) |

---

## Wording (DRAFT, for the owner's line-by-line review, `CLAUDE.md` §28.1)

### The pointer sentence at the end of Experiment 10's introduction

> **One more thing.** This is the last experiment in this chapter. Once you have run it, scroll down to "Putting It All Together" below. It steps back and shows how all ten experiments fit into one story, and which parts of that story are still open.

### The section

> ## Putting It All Together: What Is the Universe Made Of, and How Do We Know?
>
> You have now run all ten experiments in this chapter. Each one answered a different question, but they were never separate. Together they tell one story, and it is a story built from evidence. This section puts the pieces in order, and says plainly which parts we can be sure of and which are still open. It adds nothing new: every number below is one you have already seen.
>
> ### The story in six steps
>
> **1. The universe is expanding** (Experiment 1). Faraway galaxies are redder, because their light has been stretched, and they move away faster the farther they are. At 70 kilometers per second for each megaparsec, a galaxy 100 megaparsecs away, like the Coma Cluster, moves away at 7,000 kilometers per second. This is space itself stretching, not galaxies flying through space.
>
> **2. It had a hot, dense beginning** (Experiments 2 and 3). Run the expansion backward and every distance shrinks to zero about 14 billion years ago, close to the measured age of 13.8 billion years (a rough estimate, not the real calculation). A hot beginning should have left an afterglow, and it did: the oldest light we can see was released when the universe was about 380,000 years old and about 2,972 K. Space has stretched about 1,090 times since, so it now arrives as a faint microwave glow at 2.725 K.
>
> **3. Most of what is there is unseen** (Experiments 4, 7 and 5). We found this out in three ways.
> - Stars far out in a galaxy orbit at about 220 kilometers per second, far faster than the visible matter alone could hold them (Experiment 4).
> - A cluster of galaxies bends the light of a galaxy behind it into a ring about 47 arcseconds wide. Its visible matter could make a ring of only about 18, so the cluster needs about 6.7 times the visible mass: only about 15% of its mass is visible (Experiment 7). This is a different method, weighing with light and not with orbits, and it points the same way. Two independent methods agreeing is what makes the case strong. The unseen mass is called **dark matter**.
> - Distant supernovae look dimmer than a universe with only matter would make them, so the expansion has been speeding up. The name for whatever drives this is **dark energy**, which fits best at about 70% of the total (Experiment 5).
>
> **4. Together they give a consistent history** (Experiments 6 and 8). With matter only, the universe would be about 9.3 billion years old, too young to hold the oldest stars. With about 70% dark energy it comes out near 13.5 billion years, and the measured value is 13.8 (Experiment 6). The same history explains why the farthest light we can see has travelled about 13.5 billion years, yet its source is now about 45 billion light-years away: space stretched while the light was on its way (Experiment 8).
>
> **5. Galaxies grew from tiny ripples** (Experiment 9). Gravity can grow a small excess of matter only in step with the size of the universe, about 850 times since the oldest light, and about 2,650 times with dark matter's head start. This is why dark matter matters for galaxies as well as for orbits. Whether the real ripples started large enough was something that model could not say.
>
> **6. Where it is heading depends on dark energy** (Experiment 10). With only matter, the expansion would slow down forever without quite stopping: each doubling of the universe's size would take longer, about 17, then 48, then 136 billion years. With a constant dark energy, each doubling takes about the same time, settling toward about 11.6 billion years. But that assumes dark energy never changes.
>
> ### How it fits together
>
> | Experiment | What we saw | What it tells us |
> |---|---|---|
> | 1. Hubble's Law | Farther galaxies are redder and recede faster | Space is expanding |
> | 2. The Big Bang | Running the expansion backward gives about 14 billion years | There was a beginning, about that long ago |
> | 3. The oldest light | A 2.725 K glow, stretched from about 2,972 K | The early universe was hot and dense |
> | 4. Dark matter | Stars orbit faster than visible matter explains | Unseen mass in galaxies |
> | 5. Dark energy | Distant supernovae look dim | The expansion is speeding up |
> | 6. The age | About 70% dark energy gives about 13.5 billion years | The pieces agree on an age |
> | 7. Lensing | A cluster's ring needs about 6.7 times its visible mass | A second, independent sign of unseen mass |
> | 8. The observable universe | Source about 45 billion light-years away, light about 13.5 billion years old | Space stretched while the light travelled |
> | 9. Structure formation | A ripple grows about 850 times (2,650 with dark matter) | Galaxies can grow from tiny ripples |
> | 10. The fate of the universe | Doubling times settle (constant dark energy) or lengthen forever (none) | The future depends on dark energy |
>
> ### What we are sure of, and what is still open
>
> The parts these experiments support most directly are: the universe is expanding; it began hot and dense and left an afterglow; there is mass we cannot see, found in two independent ways; and the expansion has been speeding up.
>
> Still open:
> - **What dark matter and dark energy actually are.** We know what they do, not what they are (Experiments 4 and 5).
> - **Whether dark energy is constant.** This chapter assumed it is, but it is being tested (Experiment 10).
> - **The Hubble tension.** Published values of today's expansion rate range from about 67 to 73, and astronomers do not yet agree why (Experiments 1 and 6).
> - **Whether the early ripples were big enough** to grow into the galaxies we see (Experiment 9).
> - **What happened at the very beginning,** including a brief burst of extremely fast expansion called inflation, which this chapter only mentioned (Experiment 2).
>
> ### How this fits with relativity
>
> Cosmology is an application of the ideas from the first two chapters, not a separate subject. The bending of light by a cluster in Experiment 7 is the same bending of light by mass you met in Gravity Experiment 8. And the formulas this chapter used for how the expansion rate depends on matter and dark energy come from general relativity applied to the whole universe. We gave them to you without deriving them.
>
> ### Why we waited until now to say this
>
> We could have started the chapter with the full picture. But that would have asked you to accept a list of claims before you had any reason to believe them. Instead, each experiment was one small piece of evidence, and only now, with all of it in hand, does the picture read as "that is just what I watched happen."

---

## Decisions Needing Human Review

The owner had not answered these when this was drafted; each shows Claude's recommended default as used above.

1. **Placement.** Default: on Experiment 10's page after the tutor (as in the Gravity chapter), not a separate sidebar page, which would let a learner read it before running anything. Alternative: a sidebar page, which needs a small `App.tsx` change and exposes the conclusions early.
2. **Where this specification lives.** Default: this separate file, so that the approved Experiment 10 specification is not edited without approval. The Gravity chapter put its synthesis inside Experiment 9's specification. If the owner prefers that, this text would be moved into `10-fate-of-the-universe.md` (an edit to an approved specification, needing the owner's approval), and Experiment 10's introduction pointer would be recorded there.
3. **Naming the standard picture.** Default: do not use the name "ΛCDM" at all, and describe the picture in plain words. Alternative sentence, if wanted: "Astronomers call this standard picture ΛCDM: Λ (the Greek letter lambda) stands for dark energy and CDM for 'cold dark matter', meaning dark matter that moves slowly compared with light." The word "cold" would be a new term, and its definition here is from general knowledge, not from an earlier experiment or a source.
4. **Text only.** Default: text plus one table, with no timeline diagram. A labeled timeline of cosmic history would reuse numbers from a model that leaves out radiation and would bring in the `CLAUDE.md` §14 diagram requirements.
5. **The "still open" list.** Default: five items (what dark matter and dark energy are; whether dark energy is constant; the Hubble tension; whether the ripples were big enough; the very beginning and inflation). The Hubble tension is included although no experiment explored it, because Experiments 1 and 6 both named it as a caveat. It is described only as a range of published values that astronomers do not yet agree on, which is what the earlier experiments say.
6. **The link to general relativity.** Default: include two ties: lensing as the same bending of light as Gravity Experiment 8, and the sentence that the chapter's expansion formulas come from general relativity applied to the whole universe and were given, not derived. The second is true but is a statement about the physics behind the formulas that no earlier experiment makes in so many words (Experiment 2's specification says only that the chapter does not model the real expanding-universe theory). It is from general knowledge, not checked against a source here. Alternative: keep only the lensing tie.
7. **Wording.** The full text is above for the owner's line-by-line review before anything is built, as for the Gravity chapter's synthesis. Claims drafted here that the earlier specifications do not state in these words: "two independent methods agreeing is what makes the case strong" (Step 3); "too young to hold the oldest stars" (Step 4, which compresses Experiment 6's comparison with the oldest star clusters); "This is why dark matter matters for galaxies as well as for orbits" (Step 5, a link between Experiments 4 and 9); the Step 3 heading "Most of what is there is unseen" (a judgment resting on the 70% dark energy share and the cluster's mostly invisible mass, not on one measured number); and the "What we are sure of" sentence, which is a judgment about how directly each result is supported, not a measurement.
8. **"What we are sure of" wording.** The section says "the parts these experiments support most directly", not "proven", and does not say the open questions are unlikely to be resolved. Please confirm this level of confidence is right.
9. **The dated dark-energy sentence.** The section says only that dark energy is "being tested" and points to Experiment 10, so it does not repeat the dated "October 2026" wording and will not go stale.

---

## Relationship to Previous Experiments

- **Cosmology Experiments 1 to 10:** every step above names the experiment it summarizes, and all figures are theirs.
- **The Gravity and Curved Spacetime chapter:** its "Closing Synthesis" is the model for this section (a non-interactive closing statement, shown after the tutor, tying claims back to experiments, with a "why we waited" paragraph). Gravity Experiment 8 (light bending) and Experiment 6 (escape speed) are referred to.
- **The Relativity of Time and Motion chapter:** not referred to directly, beyond the link to the project's relativity theme.

## Relationship to Later Experiments

None. It closes the chapter. A further experiment (for example the Hubble tension, the cosmic event horizon, or changing dark energy) is possible, but none is proposed or approved; this section would then need only a small wording update if its "still open" list changed.

---

## Success Criteria

1. The section appears only after the tutor's explanation step on Experiment 10's page, and not before.
2. It tells the chapter as six steps, in order, each naming the experiment that showed it, and includes the table with one row per experiment.
3. Every number in it matches the corresponding experiment's own result, and each is computed from that experiment's own code where a function exists.
4. It states that unseen mass was found by two independent methods, and which two.
5. It separates what the experiments support directly from what is still open, and names the experiment that raised each open question.
6. It introduces no new physics and, by default, no new term.
7. It contains no prediction, text box, control or "Continue" button, and is visually distinct from the tutor panel.
8. No earlier experiment's physics or components are changed, except for the one-sentence pointer added to Experiment 10's introduction.

---

## Required Checks

There is no physics in this section, so there are no new physics tests. The checks are:

1. **A figures check.** In a browser, every figure in the table "Figures" above is compared with the same figure in the corresponding experiment's own Results or tutor, and any difference is a defect.
2. **A regression check** that the section's component imports its figures from the earlier experiments' modules rather than defining them again (as in the other cosmology experiments' import tests), if the owner wants one (small and cheap).
3. **The complete-flow check** (`CLAUDE.md` §21 Step 9) of Experiment 10 still works with the section added: it appears only after the tutor's explanation, and Experiment 10's own behavior, saved progress and chapter summary are unchanged.

---

## Implementation Notes

Built 2026-10-09 as one step (it has no physics, interaction or tutor, so the one-step-at-a-time sequence has a single step). Files: `src/components/CosmologySynthesis.tsx` (new); `src/components/FateOfTheUniverseExperiment.tsx` (edited: renders the section after the tutor's explanation, resets it when a new run starts, and has the "One more thing" pointer at the end of the introduction). No earlier experiment's physics or components changed, and no new term was introduced (the name "ΛCDM" is not used, per Decision 3).

**Behavior checked in a headless browser** (`http://localhost:5173/`, chapter 36, from a cleared `localStorage`): the pointer sentence is in the introduction; the section is absent before the run, after the run, and in the middle of the tutor; it appears once the tutor's explanation is reached, above the chapter summary; saved progress is unchanged (`completed` and `explained`); it goes away if the learner changes the dark energy share and returns after a new run and tutor; no console errors or warnings; and at a 390-pixel window the page does not scroll sideways (the table scrolls inside its own box, because the app-wide content column is only about 174 pixels wide there, the same matter as in the earlier experiments).

**Figures check (Required Check 1)**: the figures were compared with what each earlier experiment itself displays in its own Results, in the browser. All matched:

- Experiment 1 (the Coma Cluster preset): 100 Mpc, 7000 km/s.
- Experiment 2: 13.97 billion years (the synthesis says "about 14") and the measured 13.8.
- Experiment 3: 2972 K, 2.725 K.
- Experiment 4: 220 km/s.
- Experiment 6: 9.31, 13.47 and 13.80 billion years (the synthesis says 9.3, 13.5 and 13.8).
- Experiment 7: a visible-matter ring of 18.2 arcseconds, an observed ring of 47, a 15% visible share, and 6.7 times the visible mass (the observed mass divided by the visible-only mass).
- Experiment 8 (the oldest-light source): 13.47 billion years travelled and 44.61 billion light-years away today (the synthesis says "about 13.5" and "about 45").
- Experiment 9: 850 times and 2,649 times.
- Experiment 10: doublings of 17.0, 48.2 and 136.2 billion years with no dark energy, and 11.6 settled with 70% dark energy.

Experiment 5's "about 70%" is the constant `BEST_FIT_DARK_ENERGY_FRACTION` that Experiment 5 itself uses. Where an earlier experiment shows more decimals than the synthesis, the synthesis rounds (for example 13.47 to "about 13.5"), which is consistent with its "about".

Differences from the wording above, made so that the section matches the earlier experiments' own displays (Required Check 1 treats any difference as a defect):

- **"about 2,649 times with dark matter's head start"**, not "about 2,650" (the table and Step 5). Experiment 9 itself displays 2,649 in its Results and tutor; it states 2,650 only as the starting size needed for a clump (1 part in 2,650). The 2,650 in this specification's "Figures" table and wording was the nearest ten.
- **"stretched about 1,091 times"**, not "about 1,090" (Step 2). It is `1 + 1089.8` rounded, as Experiment 9's tutor states it.
- Numbers are computed by the component from the earlier experiments' exports, and none is typed in separately. Where several experiments use the same constant (for example `RECOMBINATION_REDSHIFT`, defined in both Experiments 3 and 9), the component imports the Experiment 3 copy.

**Not done:** Required Check 2 (a regression test that the component imports its figures and does not redefine them) was marked "if the owner wants one" and was not added; the project's existing import tests are for physics modules, not components. The figures check was done by hand in the browser, not by an automated test, so it will not catch a later change to an earlier experiment. Not checked: keyboard use, any browser other than headless Chrome, and a full re-run of the other nine experiments' complete flows (only the figures above were read from them). The general-relativity sentence (Decision 6) and "most of what is there is unseen" (Decision 7) remain the owner's approved judgments, not checked against a source.
