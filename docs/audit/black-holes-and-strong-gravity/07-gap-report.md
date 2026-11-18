# Gap report: Black Holes and Strong Gravity Experiment 7 (The color of the fall)
Date: 2026-11-02 | Specification: docs/experiments/black-holes-and-strong-gravity/07-color-of-the-fall.md | Components: src/components/ColorOfTheFallExperiment.tsx, ColorOfTheFallTutor.tsx | Physics module: src/physics/colorOfTheFallExperiment.ts (+ .test.ts) | Status: read-only, nothing changed

## Summary
Three predictions, two pictures (a colour strip and a wavelength graph), three tables with a worked calculation, and a four-step tutor. Older rule: guesses are text only, and Results marks each "right" or "off". Biggest gaps: no guess marks, no "where the picture comes from" lines, no table notes, no three-part look-for items, and the verdict logic is in the component. Prediction 3 (does the black hole's size matter) has no picture, because the pictures show one black hole at a time. Size: **M**.

## Predictions found (A0)
| # | Question | Answers | Where the answer lives on a picture |
|---|---|---|---|
| 1 | What happens to the colour the observer receives? (ColorOfTheFallExperiment.tsx:39-45) | stays green / bluer / redder to a limit / redder with no limit | Picture 1 strip: the orange marker against the green marker; Picture 2 curve |
| 2 | Does the light stay visible to the horizon? (:47-52) | all the way / near the horizon / well before | Picture 2: where the curve crosses the 750 nm line, along the gap axis |
| 3 | Is the colour at 5 horizon radii different for a 10-Sun hole and M87*? (:54-59) | much redder for small / for M87* / same | No picture (only one black hole is drawn at a time) |
Stored in `submitted*` state; read only in Results (:967-1007) and the tutor props (:1147-1154).

## Rule A
| Item | Result | Evidence | Gap and what would be needed |
|---|---|---|---|
| A1 | Met | `ColorStrip` (:158) and `WavelengthGraph` (:343) take only `result` and `progress`; tables read `result`/`start` | none |
| A2 | Not met | No white mark or "YOUR GUESS" box (:158-340, :343-466) | P1: white marker on the strip (a position along the wavelength axis for "same" and "bluer"; an arrow past the edge for "no limit"); P2: white marker on Picture 2 |
| A3 | Not met | none | "Stays green" has a position (550 nm); "limit" has no number, so a marker only, with a caption line saying so |
| A4 | Not met | The strip builds with `progress`, no guess mark | Draw marks only once the received marker has moved |
| A5 | Not met | P3 has no picture | Add a small second panel to Picture 2 or the strip: the two black holes' colour at 5 horizon radii side by side, on its own scale and title (Results already notes they are equal, :999-1002) |
| A6 | Not met | No source line under either picture (:820-870, :874-912) | Add: calculated here from the given formula; nothing measured; the lamp wavelength 550 nm is the page's choice |
| A7 | Not met | Introduction (:575-661) says nothing about guesses never changing the pictures or being drawn in white | Add the wording (owner to approve) |
| A8 | Not met | Module exports `stretchFactor`, `receivedWavelengthNm`, `distanceWhereWavelengthPasses`, `bandOf`, `runColorOfTheFallExperiment` (colorOfTheFallExperiment.ts:45-162). No guess-mark values. Verdict logic is in the component (:975-1006) | New functions and tests |
| A9 | Partly met | Observe prompt names "the orange marker" and "the graph" (Tutor:124); compare lists the guesses without marking (:126-127). Results marks them first (:975-1006) | Prompts would name the white marks; verdicts move to the tutor (owner's decision) |
| A10 | Not met | No such sentence in the introduction, controls or Results | See O1 |

## Rule B
- B0: Results has a 6-row table (:931-965), three "Checking your Nth prediction" paragraphs (:967-1007), a 5-step worked calculation (:1009-1034), a "why the wavelength is stretched by the same number" check (:1035-1043), a near-horizon table (:1049-1074), a release-distance table (:1081-1107), a siren comparison (:1109-1115) and a limits box (:1117-1139).
- B1 Not met / probably N/A: no measured reference. The spec lists the received-wavelength relation and the band edges as not checked against a primary source (07-color-of-the-fall.md:238, :243). A reference-style row could be "the 750 nm edge of visible light", which is a convention the page itself calls non-sharp.
- B2 Not met: no "What this table tells us" notes; one-line remarks only (:1075-1079).
- B3 N/A: the controls only move marks.
- B4 Partly met: guesses are shown in Results with a verdict; no tag on a table row.
- B5 Partly met: numbers come from the module; the right/off decision is made in the component.

## Rule C
- C1 Met: traveler + lamp, observer, crests as emitted/received, bands, both markers and legend are labelled (:238-337); Picture 2 labels the curve, 550 nm line, 750 nm and 1 mm lines, the dot (see labels at :363-466).
- C2 Met: lamp's own colour (green, fixed) against received (orange, moving); crest spacing is drawn to scale up to 20 times (:187).
- C3 Met: captions at :822 and :876.
- C4 Mostly met: pictures, markers, strip bands, units (nm, log scale) and terms are explained. Not explained: how the picture builds over the run, step by step.
- C5 Partly met: no worked moment with numbers in either caption; numbers only in the "In this run" line for Picture 1 (none in Picture 2's caption).
- C6 Not met: Picture 1 has "What to watch" as one sentence (:862-864); Picture 2 has none.
- C7 Partly met: "What is really happening" (:848-853, :898-901) states the full mechanism (the stretch factor of Experiment 6 applied to the wavelength) before the tutor; §12 is not broken because the learner has predicted, but §14 leaves it to the tutor.
- C8 Met: wavelength, nanometer, visible, infrared, microwave, radio, as emitted/received are defined in the introduction (:607-621).

## Rule D
N/A. No external links on the page.

## Other findings
- O1: CLAUDE.md §14 says the older experiments state that predictions do not change the pictures. This one does not (A10).
- O2: White is already used for "where the traveler is now" (the dot on Picture 2, caption :894), which would clash with a white guess mark. The tutor's conceptual question (Tutor:128) follows a caption that already gives the reason (:848-853).

## What an update would touch, and its size
ColorOfTheFallExperiment.tsx, ColorOfTheFallTutor.tsx, the module and its tests, the specification. Size: **M** (marker-only marks on two pictures, one new panel for Prediction 3, new module functions, A6/A7 wording, table notes for three tables).

## Not checked
Not run in a browser; tests not run; the tutor's explanation step, the WavelengthGraph SVG body (only its text labels were scanned) and "What's next" not read in full.

---

# Re-read (2026-11-18)
Re-read against the rules set after the first report: the four Parts and "Parts 2, 3 and 4 appear after the first Run" (2026-11-02, 2026-11-07), the links and words box on every page, "Start over, not Change prediction", predictions drawn on the real picture, and the owner's request for rich content on Black Holes pages (2026-11-17). Read: the specification to the end of "Relationship to Later Experiments", the introduction (`ColorOfTheFallExperiment.tsx:575-661`), the prediction block, the Results guess paragraphs (:967-1007) and the tutor's first three steps (`ColorOfTheFallTutor.tsx:110-150`). Nothing changed.

## What is still true from the first report
Everything above stands: no guess marks, no "where the real picture comes from" lines, no table notes, no three-part look-fors, the verdicts are in the component, and Prediction 3 has no picture.

## New findings
| # | Finding | Evidence | What it needs |
|---|---|---|---|
| N1 | **No four Parts.** One long page; the controls are disabled until all three predictions are entered; Parts 2 to 4 do not exist. | Predictions :706-750, controls after them | Part 1 (predict, one Run, pictures), Part 2 (black hole and release distance), Part 3 (results), Part 4 (tutor); Parts 2 to 4 appear after the first Run. |
| N2 | **"Change predictions" button.** The guess is reopened without resetting, so a changed guess can sit beside results made under the old one. | :746 | Replace with an always-visible "Start over" and the lock sentence (2026-11-07 rule). |
| N3 | **No links list and no "Words and formulas" box.** The introduction defines the words in a paragraph (:607-621) but no box lists them, and there are no links at all. | :575-661 | Both, above Part 1. Sources must be found and read first (§29 rule 3, 3(c)). |
| N4 | **The introduction says "Experiment 6", "Experiments 5 and 6", "Experiment 2".** | :578, :595, :649-653 | "Black Holes 6" and so on (as Black Holes 5 and 6 now do). |
| N5 | **The introduction's "What to look for" names the answers' territory** ("what kind of light it is as the traveler falls, and what it does near the end") but gives no answer. | :655-658 | Probably fine; to be checked when drafting. |
| N6 | **White clash, confirmed.** The "traveler now" dot on Picture 2 is white (:448, legend :458) and the strip's band labels are white text (:284-293). | | Make the dot the traveler's cyan, as on Black Holes 6; white then means only a guess. |
| N7 | **The Observe prompt asks about "the orange marker"** and the Compare step lists the guesses without marking; the Results marks them first. | Tutor :124-127, Results :967-1007 | Prompts name the white marks; the marking moves to the tutor's explanation (as Black Holes 5 and 6). |
| N8 | **No real-world grounding and no pictures.** The page has none, though the topic (light from near a black hole losing energy) has real observations. | | Candidate sources to search at the draft step: NASA Goddard "Anatomy of a Black Hole" page 8 (already read for Black Holes 6, which says the Watchers see the Explorer look redder), ESO eso1825 (the star S2's light stretched to longer wavelengths near Sagittarius A*, noted at Black Holes 6 as held for this experiment), and a plain page on gravitational redshift. None is fetched yet. |
| N9 | **Colour overlap with Black Holes 6.** Black Holes 6 deliberately did not quote the "redder" sentences, to leave this experiment its question. | `06-draft-wording.md`, "Things the owner must see", item 2 | Those sentences belong here, shown after the first Run. |
| N10 | **The tutor's conceptual question and the siren comparison** sit after captions that already give the mechanism (O2 above). | | Move "What is really happening" paragraphs to the tutor, as at Black Holes 6. |

## Plan for Part 1 (as at Black Holes 5 and 6)
One Run, one fall: the 10-Sun black hole from rest at 10 horizon radii (the specification's reference fall: 580 nm at the release, 870 nm at 5 radii, infrared past 6.83, 10.4 mm at 0.0001). Guess marks, white in a YOUR GUESS box, markers only: guess 1 on Picture 1's strip and Picture 2's curve end; guess 2 on Picture 2 at the 750 nm line along the gap axis; guess 3 in a new small panel of Picture 2, "the colour at 5 horizon radii for the 10-Sun hole and M87*", on its own scale, with the real value equal for both. Part 2 gives the black-hole and release-distance controls with a second set of pictures. Part 3 has a check-up (e.g. the wavelength as 550 nm × the stretch factor from two routes; the period of the light; the ×10 per tenfold rule) and notes under each table. Part 4 is the tutor, which marks each guess.

## Questions for the owner (default first)
1. **What does Part 1 show?** Default: one Run, one fall (10-Sun black hole, released at 10 horizon radii); Part 2 lets the learner choose any black hole and release distance (100, 20, 10, 5, 2). Alternative: Sagittarius A* in Part 1.
2. **Verdicts out of the Results:** the three "Checking your Nth prediction" paragraphs move to the tutor's explanation; the Results only tag rows. Default: yes.
3. **How the guesses are drawn.** Default: white YOUR GUESS markers as planned above (guess 1 on the strip and the curve's end, guess 2 at the 750 nm crossing, guess 3 in a new panel on Picture 2, marker only where there is no size). Alternative: guess 3 on the strip, as two small strips.
4. **The white dot and labels:** Picture 2's "traveler now" dot becomes the traveler's cyan, so white means only a guess. Default: yes.
5. **Captions:** keep what each drawn thing is; add a worked moment and three-part look-fors; move "What is really happening" (the stretch factor applied to the wavelength) to the tutor. Default: yes.
6. **Real-world grounding, after the first Run, only from pages I have read:** the redder look of a falling explorer (NASA Goddard page 8) and the star S2's stretched light near Sagittarius A* (ESO eso1825), each marked as outside the model. Default: yes, if both pages read cleanly on the raw text; otherwise recorded as a §29 rule 3(c) gap. No image unless its licence is read.
7. **Introduction drawings.** Default: one new drawing of a wave as a train of crests, close together at the lamp and stretched at the observer (the strip already shows crests in a side picture, but only after Run), shown in the introduction with no numbers. Alternative: none.
8. **A check-up** table of the wavelength by two routes (550 nm × stretch factor, and the module's formula), the period of the light (550 nm ÷ c) stretched in the same ratio, and the ×10 per tenfold closing, in the words "the same". Default: yes, no measured numbers.
9. **The siren comparison** (the motion part only; Decision 7). Default: keep it, after the first Run, labelled an analogy.
10. **Brightness stays out** (Decision 1): the page says so and does not preview it. The optional photon sentence in the tutor: default, leave it out.
11. **Heading and cross-references:** "Black Holes 7: The Color of the Fall: What Color Does the Falling Traveler's Light Have?" with "Black Holes 2, 5, 6" names throughout, and the three guess wordings and Prediction 1's four choices unchanged (approved 2026-10-12). Default: yes.
12. **"What you learned" box after Start over** for a completed chapter (open since Black Holes 2). Default: leave as the app's existing behaviour; decide once for all chapters.
13. **The next experiment (Black Holes 8, spinning black holes)** is not previewed. Default: yes.

## Not checked in this re-read
Not run in a browser; tests not run. The WavelengthGraph and ColorStrip SVG bodies, the Results tables (:931-1139) and the tutor's explanation step (:150 onward) were read only by their line lists from the first report. No link was fetched and no source read; every source named in N8 is a candidate only.
