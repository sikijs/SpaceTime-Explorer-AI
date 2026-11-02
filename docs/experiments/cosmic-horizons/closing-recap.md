# Cosmic Horizons — Closing Recap ("The Frontier Recap"): "Putting It All Together: What Is Settled, What Is Contested, What Is Open?"

**Status: PROPOSED by Claude on 2026-11-02 per `CLAUDE.md` §23 Stages 1 to 3, at the owner's request ("start the Frontier recap proposal"). APPROVED by the owner on 2026-11-02 ("approved, all defaults": all ten decisions on their defaults). Step 1 (the data module and its tests) is BUILT; see Implementation Notes. Every wording line below is still draft for the owner's line-by-line approval (§28.1), and no edit to any approved wording (the pointer sentences below) is made until the owner approves it.**

This is a closing section for the "Cosmic Horizons" group, not an experiment. It follows the precedents of `docs/experiments/spacetime-geometry/closing-synthesis.md` and `docs/experiments/cosmology/closing-synthesis.md`. It is the "Frontier recap" named in `evidence-and-imagination/00-group-proposal.md` ("The recap and the Conclusion page", item 1) and in `00-group-proposal.md` ("The closing recap"). The whole-project Conclusion page (item 2 there) is **not** part of this proposal and is to be proposed on its own afterwards.

---

## Overview

Experiment 25 ("Will the Milky Way and Andromeda collide?") is the last experiment of the group (twenty-four experiments, numbered 1 to 15 and 17 to 25; Experiment 16 was dropped). This section sits at the bottom of its page and appears only after the learner reaches that experiment's tutor explanation. It steps back from the twenty-four results and does four things:

1. **It sorts the group's results by how settled they are**, using the four plain-word labels the group has used from the start: *Settled*, *Strong evidence*, *Contested* and *Open*. Most experiments carry more than one label (for example, Experiment 17: strong evidence for what was seen, contested for what it became, open for how often it happens), so the section sorts **claims**, not whole experiments.
2. **It ties each claim to its experiment**, with one real number from that experiment, so the learner can go back to it.
3. **It says what a label means and what makes a result move between labels** (more measurements, a second independent method, a higher "sigma", a tension that goes away), using examples the learner has already met: the Hubble tension, KiDS's lumpiness tension that went away, DESI's evolving dark energy, the pulsar-timing hum below 5 sigma.
4. **It says what the page is: a snapshot.** Every result is "as of" a date, some may have moved, and the learner has the "Want to know more?" links on each page to check.

It carries **no prediction, no controls, no measurement and no new physics**, and it introduces **no new term** beyond the four labels, which are already shown on every experiment (Decision 5). It is a statement to read, not another round of predict, experiment, observe, explain.

---

## Learning Objective

After this section, the learner should be able to:

1. Say what the four labels mean, in plain words, and give one example of each from the group.
2. Say that one experiment can hold claims of different strength (a result can be strong while what it means is still open).
3. Name two or three things the group found that are solid (for example, that clocks run faster higher up, that the Sun delays a signal, that a visitor from another star passed the Sun on an open path) and two or three that experts still disagree about (for example, the Hubble tension, whether dark energy changes).
4. Say what moves a result from one label to another, with an example from the group.
5. Say that the page is a snapshot "as of" a date and where to look for a newer result.

---

## Placement and Display

- **Where:** at the bottom of Experiment 25's page (`LocalGroupCollisionExperiment`), below the tutor, shown only once the tutor's explanation step is reached (the same `onTutorComplete` marker), as in Spacetime Geometry Experiment 10 and Cosmology Experiment 10. It is not a separate sidebar page, so a learner cannot read it before running anything (Decision 1).
- **A pointer in Experiment 25's introduction and chapter summary:** one sentence at the end of Experiment 25's introduction, and a changed "What's next", so the learner knows the recap is there (Decision 2). Both are edits to wording the owner has already approved, so they need the owner's approval before they are made. Proposed sentences are below. The "What's next" must also keep working for the Conclusion page, which will follow it (Decision 3).
- **Style:** plain text with a heading, four sub-headings, one summary table and short bullet lists, styled distinctly from the tutor's panel (no text box, no "Continue" button), as in the earlier recaps. No completion callback.
- **Text and one table only (Decision 6).** No new diagram, so the `CLAUDE.md` §14 diagram rules do not apply. If the owner wants a drawing (for example a strip of twenty-four coloured squares by label), it is a separate decision and would need a caption to the §14 standard.
- **Where the code lives:** a small component of its own (proposed name `FrontierRecap.tsx`) rendered by Experiment 25's page, so Experiment 25's component stays as it is. Its list of claims comes from a small pure module (proposed name `src/physics/frontierRecap.ts`) holding the table below as data, with each number read from the earlier experiment's own module wherever a module computes it, so the figures can be tested without the browser (`CLAUDE.md` §9).
- **Tests (§10):** that every one of the twenty-four experiments appears at least once; that every claim has one of the four labels and an experiment number from the allowed set (1 to 15, 17 to 25, never 16); that every quoted number equals the value the earlier experiment's module returns; that no experiment is counted twice under the same label.

---

## The claims (the data the section would show)

Labels and numbers are taken from the status entries in `CLAUDE.md` §27 and each experiment's specification, as approved. Where a number is computed by a module, the recap reads it from there. Wording of each cell is draft.

| # | Experiment | Settled | Strong evidence | Contested | Open |
|---|---|---|---|---|---|
| 1 | The Hubble tension | | | The two ways of measuring the expansion rate disagree by about 4.9 sigma (the page's calculation) | Why |
| 2 | Does dark energy change? | | | DESI's hint that it weakens (2.7 to 3.2 sigma) | |
| 3 | How lumpy is the universe? | | | Whether the Dark Energy Survey's S₈ is below the microwave background's (KiDS's tension went away) | |
| 4 | Can the universe weigh a neutrino? | | | How small the limit on the total mass has come, and whether it leaves any room | |
| 5 | How early can galaxies form? | | Galaxies exist at redshift 14.44 | | What built them so fast |
| 6 | Where is the dark matter? | | What dark matter is not (searches' limits) | | What it is, and what one unexplained event means |
| 7 | Wide binary stars | | | Whether gravity is changed at very small pulls (γ = 1.60 (+0.24, −0.14) in one 2024 paper) | |
| 8 | Does antimatter fall down? | | Antihydrogen is attracted to the Earth (0.75 ± 0.21 of g) | | Whether it falls exactly as ordinary matter does |
| 9 | Can a clock tell its height? | A higher clock ticks faster, seen across about a millimetre | | | |
| 10 | Does time tick faster on the Moon? | | A lunar clock gains about 56 microseconds a day (a calculation) | | No clock on the Moon has measured it |
| 11 | The fastest spacecraft | The probe's distance and speed, and the physics | | | |
| 12 | Betelgeuse | What a red supergiant is | A companion exists | | Its mass and nature |
| 13 | Catching a supernova | | A red supergiant exploded; almost all the energy leaves as neutrinos | The star's mass (about 8 to 24 Suns) | Why it shed so much gas |
| 14 | What makes a white dwarf explode? | | This one remnant came from a double detonation | A 2025 paper reads the two calcium shells another way | How many such supernovae explode this way |
| 15 | How big is a neutron star? | | About 11 to 12 km across for about 1.4 Suns | | How heavy one can be |
| 17 | A star that vanished | | What was seen: it faded by more than 10,000 times with no bright supernova | What it became: a black hole, or two stars that merged | How often stars fail |
| 18 | Does a black hole's area shrink? | | The total area rose, as Hawking's 1971 theorem requires | | |
| 19 | Do black holes ring like bells? | | The main tone matches mass and spin to a few percent | | (the second tone is weaker evidence) |
| 20 | The heaviest merger | | GW231123 was the heaviest seen, with very fast spins | | What made such black holes |
| 21 | Photographing a shadow | | Ring sizes are close to what the masses and distances give | | How tightly that tests gravity |
| 22 | Does the universe hum? | | A faint background at about 3 to 4 sigma, not yet 5 | | What makes it |
| 23 | How fast can a black hole grow? | The Eddington limit and exponential growth | JWST sees growing black holes very early | | Whether any broke the limit or started heavy |
| 24 | A visitor from another star | That 3I/ATLAS is interstellar, on an open path | | | |
| 25 | Will the Milky Way and Andromeda collide? | | Andromeda is approaching; the galaxies will interact | Whether they merge within 10 billion years (about 50 percent in 2025, about 90 percent in 2026) | Andromeda's sideways motion, until Gaia's next release |

Reading the table (a count the module would compute and the tests would check): *Settled* claims appear in experiments 9, 11, 12, 23 and 24; *Contested* claims in 1, 2, 3, 4, 7, 13, 14, 17 and 25; and so on. The page shows the counts as a plain sentence, not a ranking of experiments (Decision 4).

**Two points where the table is not yet clean, for the owner:**

- Experiments 5, 10 and 15 and a few others use "Strong evidence" for a result whose sources were read only in part (their specifications list this under "Open"). The recap would repeat their labels as approved and would not upgrade or downgrade any (Decision 7).
- Experiments 4, 7 and 13 have claims whose labels depend on a choice of wording in the specification. I have used the approved label and put the claim in the column the status entry names; the owner may prefer to move one.

---

## Wording (DRAFT, for the owner's line-by-line review, `CLAUDE.md` §28.1)

### The pointer sentence at the end of Experiment 25's introduction

> **One more thing.** This is the last experiment in this group. Once you have run it, scroll down to "Putting It All Together" below. It steps back and sorts what all twenty-four experiments found by how settled each finding is.

### Experiment 25's chapter summary, "What's next" (replacing its current line)

> This is the last experiment of this group. "Putting It All Together", below on this page, sorts the twenty-four findings by how settled they are, and a Conclusion page after it looks back over the whole project.

(The second clause is only added if the owner approves building the Conclusion page; otherwise it is dropped. Decision 3.)

### The section

> ## Putting It All Together: What Is Settled, What Is Contested, What Is Open?
>
> You have now run twenty-four experiments about results from the last few years. Each one carried a label saying how settled it is. This section puts them side by side. It adds nothing new: every number below is one you have already seen, and everything is "as of November 2026".
>
> ### 1. The four labels, in plain words
>
> - **Settled** means many independent measurements, made in different ways, agree. Example: a clock higher up ticks faster (Experiment 9).
> - **Strong evidence** means one clear result that experts widely accept, but not yet confirmed many different ways. Example: the black hole after a merger ended with a larger total surface area than the two before (Experiment 18).
> - **Contested** means the data are real, but experts disagree about what they mean. Example: two ways of measuring how fast the universe expands disagree (Experiment 1).
> - **Open** means we do not know yet. Example: what the little red dots are (Experiment 23).
>
> One experiment can hold more than one label. A result can be strong while what it means is still open. Experiment 17 is an example: the star's fading is strong evidence, what it became is contested, and how often stars do this is open.
>
> ### 2. What the group found, by label
>
> (The table above, shown as four short lists with the experiment number and one real figure each.)
>
> ### 3. What moves a result from one label to another
>
> - **A second independent method.** (Settled: Experiment 9's clock, seen across a millimetre, a centimetre and, in field tests, hundreds of metres.)
> - **A bigger "sigma".** A hint at about 3 sigma can fade or grow. (Experiments 2 and 22: DESI's 2.7 to 3.2 sigma, and the pulsar-timing hum at 3 to 4, not yet 5.)
> - **A tension that goes away.** (Experiment 3: KiDS's tension went away with a larger survey; the Dark Energy Survey's has not.)
> - **A better measurement of the same thing.** (Experiment 8: ALPHA-g's 0.75 ± 0.21 of g, which a later, more precise campaign could narrow.)
>
> ### 4. This page is a snapshot
>
> Everything here is "as of November 2026". Some findings may have moved since, and the "Want to know more?" list on each experiment's page links to the papers and the official pages, so you can check for yourself. This page did not check that no newer result exists for every experiment: each experiment's own page says what was and was not checked.

(The section's final lines, "what is coming" (the Vera Rubin Observatory, Euclid, Gaia's December 2026 release, which are named in `00-group-proposal.md`) and the sentence "general relativity still holds in the 2025 and 2026 gravitational-wave catalogue tests" are Decision 8 and are not drafted until the owner decides.)

---

## Decisions for the owner (each with a default)

1. **Where it sits.** Default: at the bottom of Experiment 25's page, shown after the tutor's explanation, not a separate sidebar page. Alternative: a sidebar page of its own.
2. **Pointer sentences.** Default: a sentence at the end of Experiment 25's introduction and a changed "What's next", as drafted (edits to approved wording, made only with approval).
3. **Link to the Conclusion page.** Default: the "What's next" second clause is left out until the Conclusion page is approved. Alternative: include it now.
4. **How it sorts.** Default: by claim, in four lists, one per label, with counts as a plain sentence and no ranking of experiments. Alternative: one table with a row per experiment and four columns, as above.
5. **Terms.** Default: it defines only the four labels, which every experiment already shows; "sigma" is mentioned only as an example and is not newly defined. Alternative: add a short "sigma" reminder.
6. **Format.** Default: text and lists, no new diagram. Alternative: a strip of twenty-four squares coloured by label (would need a §14 caption and a non-colour cue for accessibility).
7. **Labels.** Default: repeat each experiment's approved labels exactly, upgrading or downgrading none. Alternative: the owner re-judges any label while the table is in front of them.
8. **Optional extras.** Default: leave out "what is coming" and the sentence on general relativity's tests (both are named in `00-group-proposal.md` as candidates for the recap). Alternative: add either or both, with sources fetched first (§29).
9. **Scope.** Default: this group's twenty-four experiments only. The seven experiments of "Evidence and Imagination" (settled, open or imagined) are left to the whole-project Conclusion page. Alternative: include them here, which makes the recap thirty-one experiments and moves it away from "recent results".
10. **Date.** Default: "as of November 2026" in the recap (today's date is 2 November 2026). Experiments 1 to 25 of this group say "as of October 2026" on their own pages; the recap would say so in one line, so the two dates do not look like a mistake. Alternative: change the experiments' dates (an edit to approved wording; not proposed).

---

## Sources and checks

- **Nothing new is claimed.** Every label and number is already on an approved page. The recap needs no new source, except for the two optional extras in Decision 8, whose sources would be fetched and read first, and recorded in a table here with the date checked (§29 rule 3, §20).
- **Re-check before approving the section:** the labels in the table above against the current wording on the pages (they can drift if an experiment's status line is edited), and the numbers against each module.
- **Not checked:** the table has not been compared line by line with each experiment's built page; some cells (for example Experiments 4 and 13) condense a longer status entry and need the owner's eye.

---

## Not built

Only Step 1 is built (see Implementation Notes). The rest would be built in small steps (§6): (1) the data module and its tests; (2) the component and the pointer sentences, checked in Chrome; (3) the owner's line-by-line wording review; (4) final review. Each step stops for the owner (§23 Stage 5).

---

## Implementation Notes

- **Step 1, the data module and its tests (2026-11-02):** `src/physics/frontierRecap.ts` and `frontierRecap.test.ts` (27 tests). The module holds the table above as data (`frontierClaims()`, with `claimsWithLabel`, `experimentsWithLabel` and `labelCounts`) and reads every quoted figure from the earlier experiment's own module (Hubble tension, dark energy, neutrino mass, earliest galaxies, wide binaries, antimatter, clock height, lunar clocks, the fastest spacecraft, the supernova, the neutron star, the vanished star, the horizon area, the ringdown, the heaviest merger, the shadow, the pulsar timing background, black hole growth, the interstellar visitor and the Local Group collision). The tests check that all twenty-four experiments appear and Experiment 16 never does, that labels are valid, that no claim is duplicated, the sorting by label (Settled: 9, 11, 12, 23, 24; Contested: 1, 2, 3, 4, 7, 13, 14, 17, 25), and every quoted figure against a number written out by hand. Checked by three deliberate breaks (a relabelled claim, a claim moved to Experiment 16, a figure typed in instead of read from its module), each of which made at least one test fail. `tsc --noEmit -p tsconfig.app.json` is clean and the full suite passes. **Draft wording for the owner's approval, with the claim text:** the short claim sentences in the module are placeholders for the recap's lists and are approved with the wording step. **Differences from this specification, for the owner's approval:** (1) a `Figure` can be a range (`high`), used for Experiment 13's mass estimates (8 to 24 Suns, read as the lowest and highest of the module's published estimates); (2) the module adds `EXPERIMENT_NUMBERS` and `STATUS_LABELS`; (3) two experiments' figures differ slightly from the table's drafted words and come from the module: Experiment 2 quotes the 2.7 sigma bar only (the 3.2 is the recalibrated bar, not quoted), and Experiment 22 quotes NANOGrav's upper 4 sigma. **Not checked:** the claims' wording against each built page (Step 3), anything in the interface (not built).
- **Step 2, the component (2026-11-02):** `src/components/FrontierRecap.tsx`, rendered at the bottom of Experiment 25's page (`LocalGroupCollisionExperiment.tsx`) below the tutor, only after the tutor's explanation is reached (a new `explanationReached` state, cleared by Start over; `onTutorComplete` is still called). The section follows the draft wording above: the four labels with an example each, the claims in four lists (experiment number, claim, and the figure read from the module), what moves a result between labels, and the snapshot note. A count sentence ("45 separate findings ... 5 are settled, in 5 experiments; 16 strong evidence, 16; 9 contested, 9; 15 open, 15") is computed from `labelCounts()`. `Figure` gained a `decimals` field (display rounding only, in the module). Checked in Chrome at a local address: with two predictions made and the run finished, the recap was absent before the tutor's explanation and present after it, with no NaN, undefined or Infinity, and the figures match the module (4.89 sigma is shown through `decimals`, 192.22 km/s, 18.7 degrees, 14.44). `tsc --noEmit -p tsconfig.app.json` is clean and the full suite passes. **The pointer sentences (the end of Experiment 25's introduction and the changed "What's next") are NOT made:** they edit approved wording and are shown to the owner first. **Differences from this specification, for the owner's approval:** (1) the lists show the module's short claim sentences with the figure in brackets, where the specification's table showed longer cells; (2) the count sentence (not drafted in the specification) was added from Decision 4's "counts as a plain sentence". **A point for the owner:** the sidebar numbers the Cosmic Horizons chapters 1 to 24 in a row (Andromeda is "24"), while the experiment pages and this recap use the specification's numbers (Andromeda is "Experiment 25", because 16 was dropped), so a learner sees both. Not checked: narrow widths, other browsers, keyboard use, a real learner.
- **Step 2, the pointer sentences (2026-11-02):** **APPROVED by the owner on 2026-11-02** ("commit and approve") and made, exactly as drafted in "Wording" above. The "One more thing." paragraph is added after Experiment 25's "Assumptions" paragraph, before "Want to know more?" (`LocalGroupCollisionExperiment.tsx`), and Experiment 25's "What's next" in `src/App.tsx` (was "None yet: this is the last experiment of the group.") now reads "This is the last experiment of this group. “Putting It All Together”, below on this page, sorts the twenty-four findings by how settled they are." The Conclusion-page clause is left out (Decision 3). The two pointer sentences are not yet in Experiment 25's own specification (`25-will-the-milky-way-and-andromeda-collide.md`), which should be brought in line with the owner's approval (§28.2).
- **Numbers the learner sees (2026-11-02, at the owner's correction: "there is no exp 25. it is exp 24"):** this specification, the table above and the module's `claim.experiment` keep the specification numbers (1 to 15 and 17 to 25), but **the recap shows the sidebar numbers, 1 to 24 in a row** (`displayNumber` in `frontierRecap.ts`: the specification's 17 to 25 are shown as 16 to 24; two tests added, 29 in all). Everything in the table above reads "Experiment N" in specification numbers, so for a learner N is one lower from 17 on (for example the star that vanished is shown as Experiment 16, the little red dots as 22, Andromeda as 24). Checked in Chrome: the recap shows 1 to 24 and no "Experiment 25". **Resolved the same day at the owner's request ("Please resolve this"):** the nine page headings (specification numbers 17 to 25) and 21 learner-facing cross-references in other pages (eight "What's next" lines, "Where we left off" paragraphs, a results line and a tutor line) were changed to the sidebar's numbers (30 lines in 13 files, all one lower); code comments, specifications and file names keep the specification numbers. The cause was that the sidebar numbers chapters by position (`position + 1` in `src/App.tsx`) while each page's heading had its specification number typed in. Checked in Chrome: every Cosmic Horizons page heading matches its sidebar number. `CLAUDE.md` §27 records the rule.
- **Step 3, the owner's wording review, first round (2026-11-02):** the owner asked for fixes 1 to 4 and 6 of Claude's review and for Experiment 12's Settled entry to be dropped ("What a red supergiant is" is a classification, not a finding a learner could test, and Experiment 12 is still in the recap under Strong evidence and Open). Made, wording for the owner's approval: (1) the count sentence now reads "44 separate findings between them: 4 settled, 16 strong evidence, 9 contested and 15 open"; (2) no entry has a bracket inside a bracket (figure labels shortened; the lunar clock claim no longer carries its number; the Andromeda entry reads "the 2025 study gave 50 percent (the 2026 study: 90 percent)"); (3) section 3's numbers (2.7 to 3.2 sigma, 3 to 4 sigma, 0.75 ± 0.21 of g, 1 millimetre) are read from the modules through `frontierFacts()`, with 4 more tests (33 in all); (4) a "Words used in the lists below" list defines sigma, redshift and microarcsecond and says what names such as SH0ES and DESI are; "Lyman-alpha", "CMB", "Type Ia", "calcium shells" and "Eddington limit" were reworded or glossed in the entries; (6) the Experiment 8 sentence now says its team plans upgrades and other CERN experiments aim at the same question by different methods, from `08-does-antimatter-fall-down.md`'s sources (arXiv:2503.22471). **Open:** "in field tests, across hundreds of metres" (Experiment 9) is quoted from Experiment 9's status label and is not a module figure; "5 sigma is the level usually asked for" has the source caveat recorded in Cosmic Horizons Experiment 1's specification; the Words list is new wording. **The revised text was APPROVED by the owner on 2026-11-02 ("approved. commit").**
- **Step 4, final review (2026-11-02):** compared with this specification, `docs/PROJECT.md`, `AGENTS.md`, `CLAUDE.md` §9, §12, §14, §15, §28 and §29, each experiment's built status text, and a run in Chrome. **Checked and fine:** the recap sits below Experiment 24's (specification 25's) tutor and appears only after the explanation (absent before Run, after Run and during the tutor; hidden again by Start over; two prediction pairs run); the numbers in the lists and in section 3 come from the modules (`frontierClaims()` and `frontierFacts()`), 33 tests in the file and 2,152 in the suite, `tsc` clean and `npm run build` passes (the chunk-size warning was already there); no NaN, undefined or null on the page; no horizontal overflow in a 420 px frame (the browser window itself would not resize, so this was a frame inside the page); no new diagram, so §14's diagram rules do not apply. **Findings for the owner (nothing changed yet):** (1) **Andromeda's labels differ from its page.** The recap (and the specification and `CLAUDE.md` §27) say Strong evidence that Andromeda is approaching and the galaxies will interact, and Open for the sideways motion; the built page says Settled (that Andromeda is coming towards us, and its distance), Contested (the sideways speed and the merger chance) and Open (how much the other galaxies matter, and what newer measurements will show). Proposed: follow the page (Settled 5 experiments, Strong evidence 15, and a changed Open line), and bring Experiment 24's specification and `CLAUDE.md` in line. (2) **Experiment 1's Open entry** ("Why the two ways of measuring disagree") is supported only by the tutor's closing "still an open question"; the page's status label says Contested alone. Keep or drop. (3) **Three entries are stronger than their pages:** Experiment 19's "very fast spins" (the page says "probably spinning fast"), Experiment 16's "10,000 times" (the page says "more than"), and Experiment 13's "almost all the energy left as neutrinos" without the page's "from theory and an earlier supernova; none reported from this one". (4) **Names used without a gloss:** ALPHA-g, NIST, Planck, JWST, Gaia, PSR J0437−4715, MoM-z14, CAPERS-LRD-z9, GW231123, M87*, 3I/ATLAS and "Hawking's 1971 theorem" are not in the Names entry (§15). (5) **Typed numbers in the Words list and section 3:** "about 3 sigma", "5 sigma", "3,600th of a degree" and "hundreds of metres" are typed, and the claim "within 10 billion years" is typed; they are conventions or quotations, not module results. (6) **Project documents not yet updated:** `CLAUDE.md` §27 (the Cosmic Horizons paragraph and "What Remains" still say the recap is to be proposed) and `evidence-and-imagination/00-group-proposal.md` ("twenty-five results", now twenty-four). **Not checked:** other browsers, keyboard use, a screen reader, a real learner; the recap's claims were compared with the pages' status text, not with every page's results tables. Omitted on purpose, as in the table: Experiment 9's "Demonstrated in principle" and "Planned" and Experiment 19's weaker second tone.
- **Step 4, final review fixes (2026-11-02, at the owner's request: "fix 1, 3, 4. For 2 do what is appropriate. I am ok with 5"):** (1) Andromeda now follows its page: Settled (approaching; distance known to a small give-or-take), Contested (the sideways speed, and with it whether they merge: 2025 study 50 percent, 2026 study 90 percent), Open (how much the other galaxies matter, and what newer measurements will show, Gaia's release expected December 2026); the "will interact in some way" claim was dropped because the page does not state it; `CLAUDE.md` §27 and Experiment 24's specification (the learner's number; specification 25) were brought in line. (2) **Experiment 1's Open entry was dropped** (appropriate because Decision 7 repeats each experiment's approved label exactly, and its page's label is Contested alone; the tutor's "still an open question" is about the tutor's closing remark, not the label); a test says Experiment 1 holds only Contested. (3) Experiment 19's "very fast spins" now "probably spinning fast"; Experiment 16's fade now "more than 10,000 times" (a `moreThan` flag on the figure); Experiment 13's neutrino claim now names its basis ("Theory and one earlier supernova say ... though none were reported from this one"); the horizon-area claim now says what the theorem says. (4) The Names entry now lists ALPHA-g, NIST, Planck, JWST, Gaia, PSR J0437−4715, MoM-z14, CAPERS-LRD-z9, GW231123, M87* and 3I/ATLAS. (5) accepted by the owner as it stands. The count sentence now reads "43 separate findings: 5 settled, 15 strong evidence, 9 contested and 14 open". 2,152 tests pass and `tsc` is clean. **For the owner's approval:** the revised wording above. **Still open (item 6 of the review, not requested):** `CLAUDE.md` §27's Cosmic Horizons paragraph and "What Remains" still say the recap is to be proposed, and `evidence-and-imagination/00-group-proposal.md` still says "twenty-five results".
- **Final fixes approved and the project documents updated (2026-11-02, "approved, commit and update the project documents"):** the review's revised wording is approved. `CLAUDE.md` §27 now has a table row for this recap, says it is built (it said "to be proposed"), and gives the test total (2,152); `evidence-and-imagination/00-group-proposal.md` says "twenty-four results" and points here; `00-group-proposal.md` marks the recap built. The whole-project Conclusion page is still to be proposed on its own. Committed.

