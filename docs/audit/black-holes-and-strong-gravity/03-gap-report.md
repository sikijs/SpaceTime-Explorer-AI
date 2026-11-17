# Gap report: Black Holes and Strong Gravity Experiment 3 (Orbits Near a Black Hole: Is There a Point of No Safe Orbit?)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/03-orbits-near-a-black-hole.md | Components: src/components/OrbitsNearBlackHoleExperiment.tsx, OrbitsNearBlackHoleTutor.tsx | Physics module: src/physics/orbitsNearBlackHoleExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, two bird's-eye orbit pictures (ordinary gravity, exact theory) plus a distance-against-turns graph, each with a captioned guide, a Results part (one table, three text prediction checks, worked math) and a tutor. The captions are the most detailed of the five experiments. Gaps: no guess marks, no source lines, no check-up or table notes, "What to look for" is one or two sentences. Size: **Medium** (the last-safe-orbit guess fits the existing purple ring and the graph's distance axis; Prediction 1 and 3 are outcome markers).

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | Probe circling at 2 horizon radii gets a tiny inward nudge: what happens? (OrbitsNearBlackHoleExperiment.tsx:655) | wobbles / spirals in / flies off (:66-70); `nudgePrediction`, locked as `submittedNudge` (:473-477) | Orbit pictures, only when the learner starts at 2 radii; the distance graph |
| 2 | Where is the last safe place to circle? | anywhere / about 3 / about 10 horizon radii (:72-77); `lastSafePrediction` | Purple "last safe orbit" ring in the exact-theory picture and the purple dashed line in the graph (real value 3) |
| 3 | 20 horizon radii out, does the exact theory's orbit look different from ordinary gravity's? | very different / nearly the same (:79-83); `farPrediction` | The two panels at start = 20 (the paths nearly coincide) |

## Rule A
| Item | Result | Evidence | Gap / what is needed |
|---|---|---|---|
| A0 | Met | :422-424 | Listed |
| A1 | Met | `runOrbitsNearBlackHoleExperiment` etc.; prediction state only picks wording in :1031-1066 | None |
| A2 | Not met | no mark in `OrbitPanel` or `DistanceGraph` (:177-420) | P2: white YOUR GUESS ring at 3 or 10 radii (and a line on the graph); "anywhere" has no position so a marker. P1 and P3: outcome markers |
| A3 | Not met | | P2 would follow the guess; P1, P3 are marker-only |
| A4 | Not met | purple ring is drawn from the first frame (`showLastSafeOrbit`, :893) | The mark must wait with the ring; the graph's scale is zoomed to the start (:971), so a ring at 10 may fall off the graph and needs thought |
| A5 | Partly | P1 and P3 need the start set to 2 or 20; the learner may be looking at another start | Marker only where the start matches; otherwise state "your guess was about 2 radii" in a small panel |
| A6 | Not met | none under the pictures (:850-976) | Needed: paths are calculated here by a model with our own nudge (:1129), not observed |
| A7 | Not met | intro (:534-650) does not mention predictions not changing pictures, white marks or controls | Add; add note by the black hole and start controls |
| A8 | Not met | module has `exactCircularSpeedFractionOfLight`, `ordinaryCircularSpeedFractionOfLight`, `orbitPath`, `runOrbitsNearBlackHoleExperiment`, `modelEdgeInHorizonRadii` | Missing: guess to ring radius mapping and tests |
| A9 | Partly | Tutor observe (OrbitsNearBlackHoleTutor.tsx:~114) asks about the probes, not marks; compare (:117) restates the guesses; explained step does not mark them | As A9 in the checklist |
| A10 | Not met as such | no "predictions do not change" sentence found; "locked in" wording only | n/a |

## Rule B
- B0 tables today: Results table of 6 rows (:987-1020): the two probes, two launch speeds, last safe orbit, the model's edge; paragraph on why the model's edge is above 3 (:1022-1030); three prediction checks (:1031-1066); worked math (:1069-1105); daily-life comparison (marble in a bowl, :1109); "can and cannot tell you" box (:1127).
- B1 Not met. Reference exists in the same physics: the exact theory's last safe orbit 6GM/c² = 3 horizon radii (the module test :161 compares the model's edge with it). Nothing measured is cited. A check-up could set "exact theory: 3" beside "this model's edge: about 3.0x" (row 6 already states both).
- B2 Not met: no "What this table tells us". The paragraph after the table explains the 3 vs model's edge, which is the nearest thing.
- B3 N/A: the controls pick a hole and a start; nothing published to compare.
- B4 Partly: guesses repeated with verdicts "So your prediction was right / off this time" (:1038-1066); no tag on a row; no marks.
- B5 Partly: table values come from the module. The UI does arithmetic: `(exact/ordinary - 1) * 100`, "% of its starting distance" (`Math.max(1 - closest/2, farthest/2 - 1)`, :1038), and a hard-coded "3.5" in the text (:1046). Tutor imports not read for numbers.

## Rule C
- C1 Met (read): each `OrbitPanel` has a title, a legend with row labels, a scale bar and labelled rings (:340-406); the graph labels the three dashed lines and both lines (:220-249).
- C2 Met: gold versus blue, plunge ends at the rose horizon; launch speeds differ.
- C3 Met: three captions "How to read this picture / graph" (:852, :899, :942).
- C4 Met in structure: "What you are looking at", the probe, the nudge (with 0.6% of distance per turn), the purple ring, scale, axes, dashed lines, "how to read a line" with a car-on-a-ring-road comparison. Unit: "horizon radii" is used in Prediction 1 and the controls, but the intro's word list (:584-597) defines circular orbit, nudge, plunge and horizon, not horizon radius (it relies on Experiment 1).
- C5 Partly: the "0.6%" nudge and the ring-road comparison help, but no worked moment with run numbers.
- C6 Not met: "What to look for" is one or two sentences per picture (:872, :920), not Look at / Means / Why.
- C7 Partly: the caption of the exact picture says "Notice where the white start ring sits compared with it [the purple ring]" (:915-916) and defines the last safe orbit (:913-915) and its value 3, which is Prediction 2's answer. The picture only appears after lock-in, so this is not a pre-prediction leak.
- C8 Partly met: circular orbit, nudge, plunge, horizon and last safe orbit are defined where first used; "horizon radius" is not defined on this page (the prediction at :655 and the sliders already use it).

## Other findings
- O1: none against the spec found in the parts read.
- O2: Results verdict sentences ("right", "off this time") are the older-rule form.
- O2: the Results state, in a hard-coded sentence, "a probe starting at 3.5 keeps circling for all {MAX_TURNS} turns" (:1046); this is a module test fact (test :115) but is typed in the UI.
- O2: the marble-in-a-bowl comparison is labelled as an analogy; no source.

## What an update would touch, and its size (O3, O4)
OrbitsNearBlackHoleExperiment.tsx (marks in OrbitPanel and DistanceGraph, source lines, check-up, notes, caption items, intro and control notes), OrbitsNearBlackHoleTutor.tsx, physics/orbitsNearBlackHoleExperiment.ts and .test.ts, specification. Size: **Medium**.

## Not checked
Not run in a browser; SVG detail judged from grep of the text elements and the caption text. The tutor's explained step was not read line by line. Links: none on this page.

---

# Re-read of 2026-11-17 (against Rule E, the 2026-11-07 rules, and the owner's request for rich Black Holes pages)
Status: read-only; nothing in the app, tests or specification changed. The findings above still stand; the new findings are below. Line numbers are from `OrbitsNearBlackHoleExperiment.tsx` as read today (1,158 lines; tutor 222; module 203; 251 test lines). The page was not opened in a browser for this re-read.

## One correction to the first report
The first report (C4, C8) said the introduction's word list does not define "horizon radius". It does: the "Some words we will use" paragraph (:587-600) defines circular orbit, nudge, plunge, horizon, **horizon radius** and the astronomical unit. C4 and C8 are therefore better than "partly met" for that term.

## Rule E (the page in four Parts): not met
| Item | Result | Evidence | Gap |
|---|---|---|---|
| E1 | Not met | One long card: introduction (:526-650), three predictions (:655-720), controls and Run (:745-812), three pictures (:838-976), Results (:980-1130), tutor (:1153) | Split into Part 1 (predict, then watch), Part 2 (black-hole and start-distance controls and any drawing that follows them), Part 3 (results), Part 4 (tutor) |
| E2 | Not met | No Part headings, colours or leads | Four leads to draft; Part 1's lead gives no answers |
| E3 | Not met | No "Want to know more?" list, no "Words and formulas" box (the words sit in the introduction) | Both go above Part 1 with no heading |
| E4, E5 | n/a yet | | One experiment, no sub-parts |

## The 2026-11-07 rules
- **Parts 2, 3 and 4 appear after the first Run: partly met.** Results need `status === 'complete'` (:434), but the start-distance buttons, the slider and Run (Part 2 content) are on screen from the start, disabled until all three guesses exist (:745-812).
- **Start over, not Change prediction: not met.** The button is "Change predictions" (:728-742), shown only after the first Run; it keeps the chosen hole and start. Replace it with an always-visible "Start over".
- **A Run must not need a choice that belongs to Part 2: the main design problem.** Today's Run uses whatever black hole and start the learner picked. But the three guesses are about three different starts: guess 1 is about a probe at **2** horizon radii, guess 3 about **20**, and guess 2 about where the safe edge is (3). One fixed Part 1 run cannot show all three on one pair of panels. See question 1.
- **Links and words: not met** (see E3).
- **"Parts appear after the first Run" and a learner who runs once at a start that does not match a guess** is the same problem: Part 2 today lets the learner start anywhere, so guesses 1 and 3 may never meet their answer on screen (the first report's A5).

## Verdicts the page gives before the tutor (Rule A, §12)
- The Results contain three "Checking your first/second/third prediction" paragraphs ending "So your prediction was right" or "off this time" (:1038-1066): that is the tutor's job (§12, §13), so they move out, as in Black Holes 1 and 2.
- The Results also state the exact theory's last safe orbit (3), the model's edge and the 3.5-radii sentence next to the guess for question 2, and the introduction's captions describe the purple "last safe orbit" ring. Nothing is drawn before the run, so this is not an early reveal, but the Part 1 caption must not name the value 3 before the learner has seen the ring.
- The tutor's compare step restates the guesses (a verdict-free sentence); its explanation does not mark them. Marking moves into the explanation.

## What to draw for the guesses (Rule A, planned)
- **Guess 1 (probe at 2 radii, nudged: wobbles / spirals in / flies off):** the outcome lives on the **exact-theory orbit picture** at start 2. A white marker beside that probe's path, in a YOUR GUESS box ("wobbles and keeps circling", "spirals in", "flies off"), said in the caption to be a marker only (an outcome has no position). A guess of "flies off" has no path of its own to draw.
- **Guess 2 (last safe place: anywhere / about 3 / about 10 radii):** the answer lives on the picture as the dashed "last safe orbit" ring at 3 and on the graph's distance axis. A white ring at 3 or at 10 horizon radii on the exact-theory panel, and a white line at the same distance on the graph; "anywhere" has no position, so it is a marker. At 10 radii the ring is outside the panel's zoomed view unless the start is large (the panel reaches 1.25 times the start, never less than 4 radii), so the page needs a rule for a guess that falls off the scale (an arrow at the edge, as in earlier experiments).
- **Guess 3 (at 20 radii: very different / nearly the same):** a marker box on the **20-radii pair** (the two panels at start 20), with a bracket between the paths; marker only.
- **Where each is drawn only once its feature is drawn:** the ring (guess 2) waits for the exact-theory panel's ring; the markers wait for the run to finish.

## What an update would touch
`OrbitsNearBlackHoleExperiment.tsx` split into `...Intro.tsx`, `...Pictures.tsx`, `...Results.tsx` (as for Black Holes 1 and 2) plus the tutor; the module and its tests (about a dozen new functions: the guess marks and their marking, the fixed Part 1 run(s), the check-up rows, the objects comparisons); new render tests; the specification's Audit Update; `DEVELOPMENT-STATE.md`; `docs/audit/PROGRESS.md`. Size: **Medium to Large** (Medium by the first report; Large if a second Part 1 pair is added, and for the rich content below).

## Content for a favourite topic (all of it is the owner's to approve, §28.1)
What exists today: a long text-only introduction (about 120 lines), three drawn pictures, no images, no links, no real-world grounding beyond one planned tutor sentence (the disk's inner edge). The project holds seven licensed images in `public/images/black-holes/` (the EHT pictures of M87* and Sgr A*, the S2 orbit, Gaia BH3, the Crab, M77 and a labelled NASA visualisation). Proposed, as a menu to accept or cut (each fact only if a page is read; nothing is read yet for this experiment):
1. **A fuller introduction with sub-headings:** the Earth's and a planet's orbits as the starting point (Gravity 6); why "the same speed gives the same circle at any distance" in ordinary gravity; what "nudged" means; what a "last safe orbit" is in everyday words (the marble on a bowl, kept out of the introduction so it does not give the answer away).
2. **Real-world grounding (the specification's decision 10 allowed one tutor sentence):** the real orbits near black holes seen so far, only from read pages: the star S2 orbiting Sagittarius A* (ESO, image in the project), and the inner edge of a black hole's disk of gas (NASA or ESA pages), kept to what those pages say and marked as outside what this experiment models. Gravitational waves from two black holes' final orbits belong to the Gravitational Waves chapter and are named, not explained.
3. **Images:** the S2 orbit and the EHT picture of Sagittarius A* from the project; an own labelled drawing of "ordinary gravity: a circle at every distance against exact theory: a last safe circle"; no new official image unless a licence is read.
4. **A "Recent news" block** only from read pages, otherwise a dated "Real orbits we have seen" block as for Black Holes 2 (and a recorded gap).
5. **A "Want to know more?" list** of official pages and papers (for orbits and the innermost stable orbit: NASA and ESA education pages; for S2: ESO; the original papers where read), each fetched and read first; gaps recorded under §29 rule 3(c).
6. **A "Words and formulas" box** (collapsed): circular orbit, nudge, plunge, horizon, horizon radius, last safe orbit (in plain words), launch speed, astronomical unit, the formulas for the launch speeds with a worked example at 2 radii, and the edge 6GM/c² = 3 horizon radii with a worked example for the stellar black hole. The formula entry for the last safe orbit appears only after the first Run, because it gives guess 2's answer.
7. **Held back until after the first Run (§12):** the value 3, the model's edge of 3.03, "no circular orbit inside 1.5 radii", the extra pull's name, and the marble comparison.

## The check-up (Rule B)
A real reference exists in the same physics: the exact theory's last safe orbit 6GM/c² = 3 horizon radii (module test :161 already compares the model's edge with it), the launch speeds against the closed formulas, and the horizon-radius sizes already published for Black Holes 1. The model's edge (about 3.03) is the number to set beside it, with the nudge named as the reason for the gap. No measured number is cited. Whether a published value for the last safe orbit can be read from an official page is for the source search (Step 2).

## Questions for the owner (default first)
1. **One Run, three guesses about three different starts: what does Part 1 show?** Default: **one Run that plays two pairs of panels at once**: the pair at **2 radii** (guess 1, and guess 2's ring at 3) and a compact second pair at **20 radii** (guess 3), the second pair labelled, on its own smaller picture (like Black Holes 1's Picture 1b). The Part 2 controls then let the learner pick any start. Alternatives: (a) only the 2-radii pair, with guess 3 drawn on the graph at 20; (b) two runs with choice buttons and one Run, auto-selecting the next (the owner's rule for several runs), which makes Part 1 longer.
2. **Which black hole does Part 1 use?** Default: the 10-Sun black hole (as in Black Holes 1 and 2), because the outcome depends only on the distance in horizon radii.
3. **Verdicts out of the Results:** the three "your prediction was right / off this time" paragraphs move to the tutor's explanation, with the Results only tagging the rows. Default: yes.
4. **A guess that falls off the scale (guess 2 at 10 radii on a view that reaches 1.25 times the start).** Default: Part 1 is fixed at start 2, so the view reaches 4 radii; the 10-radii guess is drawn as an arrow at the edge of the picture labelled "your guess: 10 radii, off this view" and on the graph (which is wider). Alternative: widen Part 1's view to 10 radii.
5. **Real-world grounding.** Default: the S2 orbit and the inner edge of black hole disks, only from pages read in Step 2, each marked as outside the model; no claim without a source, gaps recorded.
6. **Images.** Default: reuse the S2 and Sgr A* images and add one own labelled drawing; no new official image.
7. **A check-up of the model's edge against 3 and of the launch speeds against the formulas.** Default: yes; the words "the same", "a little more" and "much more", with no cut-offs.
8. **The marble comparison.** Default: keep it in the Results and the tutor only, as in the specification (decision 9), after the first Run.
9. **"Black Holes 3" heading and cross-references.** Default: yes, as for Black Holes 1 and 2.
10. **The three guess wordings.** Default: keep the three questions and their choices as approved (2026-10-12), changing nothing but the order of the sentences if the owner asks.
11. **The "What you learned" box staying after Start over for a chapter already completed** (found on Black Holes 2, still open). Default: leave as the app's existing behaviour; decide once for all chapters.

## Not checked
Not run in a browser. The tutor's explanation was read for its structure, not line by line. No source has been searched or read yet for this re-read; every real-world item above is a plan, not a claim.
