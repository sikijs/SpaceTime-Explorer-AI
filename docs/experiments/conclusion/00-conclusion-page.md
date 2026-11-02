# Conclusion Page — "Looking Back: What Do We Know, How Well, and What Is Still Open?"

**Status: PROPOSED by Claude on 2026-11-02 per `CLAUDE.md` §23 Stages 1 to 3, at the owner's request ("start the Conclusion page proposal"). APPROVED by the owner on 2026-11-02 ("approved, all defaults": all thirteen decisions on their defaults). Step 1 (the data modules and their tests) is BUILT; see Implementation Notes. Every wording line below is still draft for the owner's line-by-line approval (§28.1), and no edit to any approved wording (Experiment 24's "What's next") is made until the owner approves it.**

This is the "Conclusion page for the whole project" named in `evidence-and-imagination/00-group-proposal.md` ("The recap and the Conclusion page", item 2). It is a last chapter, not an experiment: no prediction, no run, no controls, no tutor, and no new physics. It follows the closing recaps already built (`cosmic-horizons/closing-recap.md`, `spacetime-geometry/closing-synthesis.md`, `cosmology/closing-synthesis.md`), but it looks across all eight groups.

---

## What the project is now (the facts this page rests on)

- **88 chapters in 8 groups**, in the sidebar's order: Relativity of Time and Motion (11), Gravity and Curved Spacetime (9), Gravitational Waves (7), Cosmology (10), Black Holes and Strong Gravity (10), Spacetime Geometry (10), Evidence and Imagination (7) and Cosmic Horizons (24).
- **Only the last two groups carry a status label** on every experiment (Settled, Strong evidence, Contested, Open), because that rule came late (`CLAUDE.md` §14, §29). The other six groups, 57 chapters, were built before it and have no label. This is the central design problem of this page (Decision 3).
- **The closing recap** sorts the 24 Cosmic Horizons experiments by label (43 findings: 5 settled, 15 strong evidence, 9 contested, 14 open). The Evidence and Imagination group's labels are in its experiments' status entries (`CLAUDE.md` §27) but have no data module yet.
- **The Welcome page** opens the project with a promise: claims such as "GPS satellites need constant correction" can sound like science fiction, and the app lets the learner run the experiment that shows why. The Conclusion page can close that loop (Decision 11).
- The sidebar's numbers run 1 to 24 in Cosmic Horizons (the numbering rule in `CLAUDE.md` §27). The page uses the sidebar's numbers.

---

## Overview

The Conclusion page is the last item in the sidebar. It does five things and no more:

1. **The journey.** It states, in a short numbered chain of eight steps (one per group, in the sidebar's order), what each group asked and what it found, in plain words, so a learner who has been through 88 chapters can see how they fit.
2. **How well each kind of answer is tested.** It says which results are settled, which are strong evidence, which are contested and which are open, using the labels the pages already carry, and says plainly which groups do not carry labels and why (Decision 3).
3. **How to read a headline.** It gathers the reasoning habits the project has taught (measured against seen, sigma, a single clear event against many, a tension, a label) into one short list (Decision 9).
4. **What this project did not do.** A plain list of its limits: simplified models, papers not read in full, nothing checked with a real learner (Decision 7).
5. **Where to go next.** A short list of official pages for a learner who wants more (Decision 8).

It adds **no new concept and no new claim about the world.** Every statement about a result repeats what an approved page already says, and every number is read from the project's modules (§9).

---

## Learning Objective

After this page, the learner should be able to:

1. Say in a sentence what each of the eight groups was about, and in what order the ideas build.
2. Say the difference between a result that is settled, one that is strong evidence, one that is contested and one that is open, and give an example of each from the project.
3. Say that the project's status labels belong to the last two groups, and that the older groups teach long-established ideas without labelling each experiment.
4. Name three questions to ask of a science headline (Decision 9).
5. Say what the project did not check, and where to look for newer results.

---

## Placement and Display

- **Where (Decision 1):** a last item in the sidebar, after Cosmic Horizons, under the heading "Conclusion" with a single chapter, "Looking back". It is a page of its own, reached by the sidebar or by Next from the last Cosmic Horizons experiment. Like every chapter it is freely reachable; nothing is locked.
- **How it is built:** as one more entry in the `chapters` list in `src/App.tsx`, appended at the end so that saved progress (kept by position) is not disturbed. The Component takes no experiment props. Its `learned` and `next` lines are not used (there is no tutor), so the experiment-summary block is not shown for it (a small change to how `App` renders chapters; see "Implementation").
- **No prediction, run, controls or tutor,** so §12 and §14's diagram and caption rules do not apply to any experiment-style element. The page is text, lists and (if the owner wants) one or two plain tables.
- **Progress (Decision 12):** opening the page marks nothing and saves nothing.
- **A notice about answers (Decision 2):** because the page states what the experiments found, it opens with a short note saying so, so a learner who has not yet run the experiments can come back later.
- **Style:** the same card style as the recaps, with numbered sub-headings.

---

## Content (outline, with draft wording)

### 0. Opening notice

> **Read this after the experiments.** This page looks back over all eighty-eight chapters, so it says what they found. If you have not run an experiment yet, you may want to run it first and come back: each one asks you to predict and watch before it explains. Everything here is "as of November 2026".

### 1. The journey, in eight steps (in the sidebar's order)

Each step is one sentence on what the group asked and found, with a button that jumps to the group's first chapter. The wording must repeat what each group's own approved summary and overview say. Draft (to be checked against each group's summaries before approval):

1. **Relativity of Time and Motion.** Light travels at the same speed for everyone, so two observers who move differently disagree about time, length and what happens "at the same time".
2. **Gravity and Curved Spacetime.** Gravity can be understood as the curve of spacetime, and it changes how clocks run (the GPS satellites are the working example).
3. **Gravitational Waves.** Moving masses make ripples in spacetime, and the ripples can be detected.
4. **Cosmology.** The universe is expanding, and what we know about its past, its contents and its fate.
5. **Black Holes and Strong Gravity.** What gravity does when it is strongest: time, orbits, light and a falling traveler near a black hole, where black holes come from, and how one might end.
6. **Spacetime Geometry: What Is Real, What Is Seen.** What every observer agrees on, what each measures differently, and what each only sees.
7. **Evidence and Imagination.** What has been tested, and what the mathematics allows but nobody has seen (wormholes, travel to the past).
8. **Cosmic Horizons.** Recent results that are still being tested: where measurements disagree, where something unexpected has been seen, and what it takes to call a result a discovery.

Note on order: the sidebar's order is the build order, not a logical order (Spacetime Geometry comes after Black Holes). The page says so in one line and does not rearrange it (Decision 4).

### 2. How well is each kind of answer tested?

- **The four labels** (the same four words and meanings as the recap and every experiment).
- **The 31 labelled experiments** (Evidence and Imagination, 7; Cosmic Horizons, 24): the counts of findings by label, read from a data module, with the Frontier recap's counts for Cosmic Horizons and the same kind of count for Evidence and Imagination (to be built, Step 1). It points to the recap on the learner's Experiment 24 page for the full list.
- **The other 57 chapters, in six groups:** one plain sentence each, saying that they teach ideas that have been tested for a long time and carry no per-experiment label, and which of them hold a result that is still debated, where the group's own approved text already says so (for example, dark matter and dark energy in Cosmology). The sentence repeats the group's own approved wording and gives no new label (Decision 3).

Draft sentence for the unlabelled groups (to be confirmed with the owner):

> **Why do the first six groups have no label?** Those groups were written before we started to label every result. They teach ideas that have been tested for a long time, and where a result in them is still debated, the experiment says so. The last two groups label every result, because they are about the edge of what is known.

### 3. What is contested, and what is open

Four short items, each repeating an approved page, drawn from both labelled groups. Examples of what would be listed (final list chosen from the data module, not from this outline): the Hubble tension (Contested, Cosmic Horizons 1), whether dark energy changes (Contested, 2), whether a wormhole can exist (Open, Evidence and Imagination 1), whether one can travel back in time (Open, Evidence 2), lithium-7 in the early universe (Open, Evidence 6) and faraway quasars' agreement with the microwave sky's dipole (Contested, Evidence 7).

### 4. How to read a headline

Draft habits, each with the experiment where the learner met it (to be written from those experiments' own approved text, no new claims):

- **Is it measured, or is it seen?** (Spacetime Geometry: a measurement allows for the time light takes; what is seen does not.)
- **How many sigma, and how many independent measurements?** (Cosmic Horizons 2 and 21: a hint at about 3 sigma, and a faint background not yet at 5.)
- **One very clear event, or many?** (Cosmic Horizons 17 and 18: one merger, GW250114, tested a 1971 theorem.)
- **Is it a tension, and has one gone away before?** (Cosmic Horizons 1 and 3.)
- **What label would its own page give it?** (the four labels.)

### 5. What this project did not do

A plain list, to be drawn from `docs/STATUS.md` and each specification's "Open" lines, and shown to the owner before it is written. Candidate items: the models are simplified (for example, two points for the Milky Way and Andromeda, and a non-spinning formula for a shadow); the numbers come from papers, many read only in abstract or summary; no experiment has been checked with a real learner, in other browsers or by keyboard in full; "as of November 2026" is a snapshot.

### 6. Where to go next

A short list of official pages (NASA, ESA, LIGO, CERN, ESO, the Event Horizon Telescope, DESI), each fetched and read before the owner approves it, to the standard of §29 rule 3, with one line of plain words each (Decision 8). If a page cannot be fetched, it is not listed (§29 rule 3(c)).

### 7. Back to the Welcome page

A closing paragraph returns to the Welcome page's promise, "claims like these can sound like science fiction", and says which experiments the learner ran that show GPS satellites need correction (Gravity and Curved Spacetime, Experiment 9, and Cosmic Horizons 9, 10 and 11 for clocks). The Welcome page itself is not edited (Decision 11).

---

## Data and tests (the §9 and §10 part)

The page's numbers and lists come from a small pure module (proposed name `src/physics/projectConclusion.ts`), tested without the browser.

| Figure or list on the page | Source |
|---|---|
| 88 chapters, 8 groups, and each group's size | counted from the app's chapter list (the module takes the list as input, so the test can feed it a known list) |
| Cosmic Horizons: 43 findings by label | `frontierClaims()` in `src/physics/frontierRecap.ts` |
| Evidence and Imagination: findings by label | a new `evidenceClaims()`, built like `frontierClaims()` from the group's approved status entries, with figures read from its modules (`wormholes.ts`, `timeTravel.ts`, `addingSpeeds.ts`, `muonLifetime.ts`, `sunDelay.ts`, `earlyUniverseRecipe.ts`, `microwaveDipole.ts`) |
| One headline number per group (if the owner wants them, Decision 5) | each group's own module, chosen in Step 1 and shown to the owner first |

Tests (draft): the counts add up to the number of claims; every labelled experiment appears (31 of them: 7 and 24); the two groups' counts equal the sum shown; no label appears that is not one of the four; every quoted figure equals the module's value; the group sizes sum to 88 when fed the real list.

---

## Implementation (proposed steps, one at a time, §6)

1. **The data module and its tests** (`evidenceClaims()`, `projectConclusion.ts`), checked by deliberate breaks.
2. **The component and the sidebar entry** (`src/components/ProjectConclusion.tsx`, the appended chapter, the small `App` change so a chapter with no experiment can omit the summary block, and Experiment 24's "What's next" pointer, which edits approved wording and is shown first), checked in Chrome.
3. **The owner's line-by-line wording review**, including the draft sentences above, the group sentences, the habits, the limits list and the links.
4. **Final review** against this specification, `PROJECT.md`, `AGENTS.md` and `CLAUDE.md`, and a complete-flow check in Chrome.

---

## Relationship to earlier and later work

- **Builds on** every group's own summaries and overviews, the Frontier recap and the Evidence and Imagination status entries.
- **Closes** the project's list of work. No later experiment is approved. The experiment-by-experiment audit of Experiments 1 to 14 and the older groups to the newer prediction and reading-guide rules (`CLAUDE.md` §14) is separate, later work that the owner decided on 2026-10-24.
- **Does not replace** `docs/PROJECT.md`'s Definition of Success. It is the learner's view of the same idea, in the app.

---

## Decisions for the owner (each with a default)

1. **Title and place.** Default: a last sidebar item, after Cosmic Horizons, under the heading "Conclusion", with the single chapter "Looking back: what do we know, how well, and what is still open?". Alternatives: a section at the bottom of the learner's Experiment 24 page (as the recaps are), or an unnumbered page like Welcome at the top.
2. **A notice about answers (§12).** Default: an opening note that the page says what the experiments found, with nothing locked. Alternatives: show the page only after the learner has finished some number of chapters (needs the saved progress), or no note.
3. **Labels for the older groups.** Default: the page uses only the labels the pages already carry (the last two groups, 31 experiments) and describes the other six groups by sentences taken from their own approved summaries, with a plain note saying why they have no label. Alternative: the owner assigns a label to each of the 57 older experiments, which would belong to the audit, not to this page.
4. **Order of the journey.** Default: the sidebar's order, with one line saying it is the build order. Alternative: a logical order (the two theories first, then their uses), which would differ from the sidebar and needs a sentence to explain.
5. **Numbers.** Default: counts only (88 chapters, 8 groups, the labels' counts). Alternative: also one headline number per group, read from its module, in the journey list.
6. **A drawing.** Default: no new diagram, text only. Alternative: one picture of the eight groups as a chain (needs on-canvas labels and a "How to read this diagram" caption, §14).
7. **A limits list.** Default: yes, a plain "What this project did not do" list drawn from `docs/STATUS.md`, shown to the owner before it is written. Alternative: leave it to each experiment's own page.
8. **Links.** Default: a short "Where to go next" list of official pages, fetched and read before approval. Alternative: no links.
9. **"How to read a headline."** Default: five short habits, each tied to the experiment where the learner met it. Alternative: leave it out, as the recap already does part of this.
10. **Date.** Default: "as of November 2026", with the recap's one-line note that each experiment's own page says October.
11. **The Welcome page.** Default: the Conclusion refers back to it, and the Welcome page is not edited. Alternative: add a sentence to Welcome pointing forward (an edit to approved wording).
12. **Progress.** Default: opening the page marks nothing and saves nothing. Alternative: a check mark when the learner scrolls to the end.
13. **Pointers.** Default: Experiment 24's "What's next" gets a clause pointing to the Conclusion page (an edit to approved wording, shown first), and the recap's wording is not changed.

---

## Sources and checks

- **Nothing new is claimed.** The page repeats approved wording. The only new sources are the "Where to go next" links (Decision 8), which are fetched and read before approval and recorded here with the date.
- **To check before approval:** each group's own summary and overview against the journey sentences; the Evidence and Imagination labels against each experiment's built status text (as the recap's review did for Cosmic Horizons, which found two mismatches between the specification and the page, so the page's own wording is the reference); the 88 count against the chapter list.
- **Known gap:** the six older groups have no machine-readable labels, which is why Decision 3 defaults to group-level sentences.

---

## Not built

Only Step 1 is built (see Implementation Notes). The rest is built one step at a time, stopping after each (§23 Stage 5).

---

## Implementation Notes

- **Step 1, the data modules and their tests (2026-11-02):** `src/physics/evidenceClaims.ts` (`evidenceClaims()`: 12 findings of the seven Evidence and Imagination experiments, with figures read from their modules: `timeTravel`, `addingSpeeds`, `muonLifetime`, `sunDelay`, `earlyUniverseRecipe`, `microwaveDipole`), `src/physics/projectConclusion.ts` (group sizes, the labelled groups, the counts by label across groups) and their tests (18 in `evidenceClaims.test.ts` and `projectConclusion.test.ts`; the suite has 2,170). **The labels and wording repeat each experiment's built "Where this stands" text, checked on 2026-11-02, not the specification's.** Result: 12 findings, 7 settled (one in each experiment), 4 open (Experiments 1, 2, 5 and 6) and 1 contested (Experiment 7's quasars). Across both labelled groups there are 55 findings (12 settled, 15 strong evidence, 10 contested, 18 open) in 31 of the 88 chapters. Checked by four deliberate breaks (a relabelled claim, a typed-in figure, a share that counted every chapter, an `unlabelledGroups` that ignored the registry), each of which made at least one test fail; `tsc --noEmit -p tsconfig.app.json` is clean. **Built so that labels for an older group update the page:** adding one entry to `LABELLED_GROUPS` (with that group's claims) moves the group out of `unlabelledGroups()`, adds its claims to every count and changes the labelled share (a test does exactly this and removes it again). What would **still need an edit by hand** when older groups get labels: the claims themselves (they are data, not read from the pages, so each new label needs its claim entered and approved), the page's sentence about why the first six groups have no label (it should be shown only while `unlabelledGroups()` is not empty, which Step 2 builds), and any wording that says "the last two groups". **Differences from this specification, for the owner's approval:** (1) the Evidence and Imagination labels follow the built pages, which differ in places from the specification's wording (for example Experiment 6's helium is Settled with a lower second value shown, not chosen between); (2) a test reads `src/App.tsx` to check that the labelled groups' names match the app's group names; (3) the claim wording is draft. **Not checked:** the claims' wording against each page's results tables, anything in the interface (not built).

