import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Welcome } from './components/Welcome'
import { HubbleTensionExperiment } from './components/HubbleTensionExperiment'
import { EvolvingDarkEnergyExperiment } from './components/EvolvingDarkEnergyExperiment'
import { LumpinessExperiment } from './components/LumpinessExperiment'
import { NeutrinoMassExperiment } from './components/NeutrinoMassExperiment'
import { EarliestGalaxiesExperiment } from './components/EarliestGalaxiesExperiment'
import { DarkMatterSearchesExperiment } from './components/DarkMatterSearchesExperiment'
import { WideBinariesExperiment } from './components/WideBinariesExperiment'
import { Experiment1 } from './components/Experiment1'
import { Experiment2 } from './components/Experiment2'
import { Experiment3 } from './components/Experiment3'
import { Experiment4 } from './components/Experiment4'
import { Experiment5 } from './components/Experiment5'
import { Experiment6 } from './components/Experiment6'
import { Experiment7 } from './components/Experiment7'
import { Experiment8 } from './components/Experiment8'
import { Experiment9 } from './components/Experiment9'
import { Experiment10 } from './components/Experiment10'
import { Experiment11 } from './components/Experiment11'
import { EquivalencePrincipleExperiment } from './components/EquivalencePrincipleExperiment'
import { GravitationalTimeDilationExperiment } from './components/GravitationalTimeDilationExperiment'
import { TidalEffectExperiment } from './components/TidalEffectExperiment'
import { CurvedSpacetimeExperiment } from './components/CurvedSpacetimeExperiment'
import { SpacetimeCurvatureSourceExperiment } from './components/SpacetimeCurvatureSourceExperiment'
import { OrbitExperiment } from './components/OrbitExperiment'
import { BlackHoleExperiment } from './components/BlackHoleExperiment'
import { LightBendingExperiment } from './components/LightBendingExperiment'
import { GpsTimeDilationExperiment } from './components/GpsTimeDilationExperiment'
import { GravitationalWaveExperiment } from './components/GravitationalWaveExperiment'
import { GravitationalWaveChirpExperiment } from './components/GravitationalWaveChirpExperiment'
import { GravitationalWaveEnergyExperiment } from './components/GravitationalWaveEnergyExperiment'
import { GravitationalWaveRealEventsExperiment } from './components/GravitationalWaveRealEventsExperiment'
import { GravitationalWaveRedshiftExperiment } from './components/GravitationalWaveRedshiftExperiment'
import { GravitationalWaveTriangulationExperiment } from './components/GravitationalWaveTriangulationExperiment'
import { GravitationalWaveStandardSirenExperiment } from './components/GravitationalWaveStandardSirenExperiment'
import { HubblesLawExperiment } from './components/HubblesLawExperiment'
import { BigBangExperiment } from './components/BigBangExperiment'
import { CosmicMicrowaveBackgroundExperiment } from './components/CosmicMicrowaveBackgroundExperiment'
import { DarkMatterExperiment } from './components/DarkMatterExperiment'
import { DarkEnergyExperiment } from './components/DarkEnergyExperiment'
import { UniverseAgeExperiment } from './components/UniverseAgeExperiment'
import { GravitationalLensingExperiment } from './components/GravitationalLensingExperiment'
import { ObservableUniverseExperiment } from './components/ObservableUniverseExperiment'
import { StructureFormationExperiment } from './components/StructureFormationExperiment'
import { FateOfTheUniverseExperiment } from './components/FateOfTheUniverseExperiment'
import { BlackHoleSizeExperiment } from './components/BlackHoleSizeExperiment'
import { TimeNearBlackHoleExperiment } from './components/TimeNearBlackHoleExperiment'
import { OrbitsNearBlackHoleExperiment } from './components/OrbitsNearBlackHoleExperiment'
import { LightNearBlackHoleExperiment } from './components/LightNearBlackHoleExperiment'
import { FallingInExperiment } from './components/FallingInExperiment'
import { SeeingTheFallExperiment } from './components/SeeingTheFallExperiment'
import { ColorOfTheFallExperiment } from './components/ColorOfTheFallExperiment'
import { SpinningBlackHoleExperiment } from './components/SpinningBlackHoleExperiment'
import { BlackHoleFormationExperiment } from './components/BlackHoleFormationExperiment'
import { HawkingRadiationExperiment } from './components/HawkingRadiationExperiment'
import { SpacetimeIntervalExperiment } from './components/SpacetimeIntervalExperiment'
import { LightConesExperiment } from './components/LightConesExperiment'
import { CauseBeforeEffectExperiment } from './components/CauseBeforeEffectExperiment'
import { SeeingThePastExperiment } from './components/SeeingThePastExperiment'
import { EnergyMomentumExperiment } from './components/EnergyMomentumExperiment'
import { MakingNewParticlesExperiment } from './components/MakingNewParticlesExperiment'
import { AberrationExperiment } from './components/AberrationExperiment'
import { DopplerShiftExperiment } from './components/DopplerShiftExperiment'
import { TravelerSkyExperiment } from './components/TravelerSkyExperiment'
import { RotatedObjectExperiment } from './components/RotatedObjectExperiment'

interface Chapter {
  title: string
  // The named group of experiments this chapter belongs to; shown once as the page heading.
  group: string
  Component: ComponentType<{ onComplete?: () => void; onTutorComplete?: () => void }>
  // Shown below the experiment once the learner has run it and finished the tutor's questions.
  learned: string
  next: string
}

// The order groups appear in the sidebar. A group with no chapters yet (its next
// experiment's specification not yet approved) still gets a heading, so the learner can see
// what's coming, but no chapter list beneath it.
const groupOrder = [
  'Relativity of Time and Motion',
  'Gravity and Curved Spacetime',
  'Gravitational Waves',
  'Cosmology',
  'Black Holes and Strong Gravity',
  'Spacetime Geometry: What Is Real, What Is Seen',
  'Frontier and Beyond',
]

// A one-sentence overview of a group, shown under its title on every chapter page of that group. Only groups that have one
// are listed. Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1), including the last clause, "and how one might
// end", which was added for Experiment 10 (Hawking radiation). It names only what is built.
const groupOverviews: Record<string, string> = {
  'Black Holes and Strong Gravity':
    'This group follows black holes from several sides: how small something must be to become one, what happens to time, orbits, light and a falling traveler near one, what spin changes, where black holes come from, and how one might end.',
  'Frontier and Beyond':
    'This group follows recent results that are still being tested: where measurements disagree, where something unexpected has been seen, and what a result must show before it counts as a discovery. Each experiment says how settled its result is, as of October 2026.',
}

const chapters: Chapter[] = [
  {
    title: 'One clock',
    group: 'Relativity of Time and Motion',
    Component: Experiment1,
    learned:
      "A clock measures how much time passes between two events. Here, the two events were the start and the end of the experiment. The elapsed time is the difference between the clock's two readings.",
    next: 'You used one clock. Next, two clocks in two different places will measure the same two events. Will they agree?',
  },
  {
    title: 'Two clocks at rest',
    group: 'Relativity of Time and Motion',
    Component: Experiment2,
    learned:
      'Two clocks standing still in the same reference frame, set to the same reading at the start, measured the same elapsed time between the same two events.',
    next: 'So far, nothing has moved. Next, one clock moves compared with the lab. Will it still agree with the clocks that stand still?',
  },
  {
    title: 'A moving clock',
    group: 'Relativity of Time and Motion',
    Component: Experiment3,
    learned:
      'When a clock moves compared with the lab, it measures less elapsed time than the lab clock between the same two events. This effect is called time dilation. The faster the clock moves, the bigger the difference. The moving clock is not broken: the time that passes between two events depends on who is measuring (their reference frame) and how they are moving. (At speed 0 nothing moves, and the two clocks agree.)',
    next: 'Why does time dilation happen? Next, we look inside a clock to find the reason.',
  },
  {
    title: 'Why time dilation happens',
    group: 'Relativity of Time and Motion',
    Component: Experiment4,
    learned:
      "In the lab, light travels at the same speed for both light clocks. The moving clock's pulse of light has a longer, slanted path to travel, so each of its ticks takes longer on the lab's clocks. That is why the moving clock measures less time than the lab clock (time dilation), by the same factor you saw in Experiment 3.",
    next: 'In Experiment 4 we assumed that light always travels at the same speed, c. Next, we ask what would change if light did not work that way.',
  },
  {
    title: "Why can't light go faster?",
    group: 'Relativity of Time and Motion',
    Component: Experiment5,
    learned:
      "We compared two rules for light. In the everyday rule, light gets the speed of the moving clock added to its own, like a ball thrown from a moving train. Then the moving clock would tick at the same rate as the clock standing still, but its light would travel faster than c. In light's actual rule, light always travels at c. The light has a longer path but cannot go faster, so the moving clock's tick takes longer. That is time dilation. In this model, time dilation happens because light always travels at c.",
    next: 'So far, the light in our clocks went across the motion. Next, we turn the clock so that its mirrors are in a line with the motion. Does motion change how long a clock is?',
  },
  {
    title: 'Does motion change length?',
    group: 'Relativity of Time and Motion',
    Component: Experiment6,
    learned:
      "Time dilation says that a moving clock must tick slowly, whichever way it is turned. Light in the lab always goes at c, so a clock moving along its own length can only tick that slowly if it is shorter, as seen from the lab. It is shorter by the same factor as the time dilation factor. This effect is called length contraction. Only the length along the motion changes.",
    next: "So far you compared elapsed time and length between the lab and a moving clock. Next, we ask about something else that felt certain: whether two events happen at the same time.",
  },
  {
    title: 'At the same time... for whom?',
    group: 'Relativity of Time and Motion',
    Component: Experiment7,
    learned:
      "Someone riding along with a moving rod sees a flash from its center reach both ends at the same time. The lab does not: the back end moves toward the flash and the front end moves away, so the lab sees the back end reached first. This is not a delay in either frame's own clocks. It is called relativity of simultaneity: two events that are simultaneous in one reference frame need not be simultaneous in another.",
    next: 'Next, we look at the same rod and flash a different way: as a single picture, with position and time drawn together.',
  },
  {
    title: 'Drawing Spacetime',
    group: 'Relativity of Time and Motion',
    Component: Experiment8,
    learned:
      "A spacetime diagram plots position and time together: a still object is a vertical line, a moving object is a slanted line (a worldline), and light is always drawn at the same slope. The same two events from Experiment 7 — the flash reaching the back end, then the front end — are just where the rod's worldlines cross the light's. The picture agrees with the numbers.",
    next: "Next, we draw one more line on the same picture: one that shows what 'the same moment' looks like for someone riding along with the rod.",
  },
  {
    title: 'Same Time, Different Line',
    group: 'Relativity of Time and Motion',
    Component: Experiment9,
    learned:
      "A flat line straight across the diagram shows what the lab calls \"the same moment.\" But the two events that Experiment 7 said were simultaneous for the rod are not on a flat line at all — they're on a tilted one. \"The same moment\" really does depend on who is watching: it isn't a trick of measurement, it's a different, real line on the same page.",
    next: 'Next, we apply time dilation to a whole round trip: two twins, one who travels and one who stays home, and a famous puzzle about which one is older when they reunite.',
  },
  {
    title: 'The Twin Paradox',
    group: 'Relativity of Time and Motion',
    Component: Experiment10,
    learned:
      "It looked like a contradiction at first: motion is relative, so each twin could argue the other one's clock should run slow. But the two twins aren't in the same situation — only the traveling twin turns around. That difference breaks the symmetry, and it's why, when they're back together comparing the same two clocks, they both agree the traveling twin aged less. It's not a matter of opinion. It's the same time dilation from Experiment 3, just added up over the whole trip.",
    next: "Next, we complete the picture from Experiments 8 and 9: drawing the rod's own two axes on the diagram, and using the actual math that converts the lab's numbers into the rod's own.",
  },
  {
    title: "The Rod's Own Axes",
    group: 'Relativity of Time and Motion',
    Component: Experiment11,
    learned:
      "The rod has its own two tilted axes on the same diagram as the lab's — its own \"straight up\" and \"straight across,\" just like the lab's vertical and horizontal lines, only tilted because it's moving. The Lorentz transformation is the actual mathematical rule for converting an event's lab-frame numbers into the numbers the rod's own frame would assign to it. Applying it to the two flash-arrival events gives the same time for both, in the rod's frame — confirming, by direct calculation, exactly what Experiments 7 and 9 already showed by other means. Nothing physically changed: it's the same rod, the same flash, the same two events, just described using the rod's own ruler-and-clock convention instead of the lab's.",
    next: 'This completes "Relativity of Time and Motion." Next, a new chapter begins: Gravity and Curved Spacetime, starting from a sealed cabin and a dropped ball.',
  },
  {
    title: 'The Equivalence Principle',
    group: 'Gravity and Curved Spacetime',
    Component: EquivalencePrincipleExperiment,
    learned:
      "A ball dropped in a cabin at rest under gravity, and a ball dropped in a cabin accelerating through empty space at the same rate, move in exactly the same way relative to their own cabin. Sealed inside, watching only the ball, there was no experiment that told you which cabin you were in. This is called the equivalence principle — it's the idea that first led Einstein to suspect gravity might not be an ordinary force, but something about the geometry of space and time itself.",
    next: 'Next, we apply the same equivalence principle to clocks instead of a ball: does gravity make time itself run differently?',
  },
  {
    title: 'Does Gravity Change Time?',
    group: 'Gravity and Curved Spacetime',
    Component: GravitationalTimeDilationExperiment,
    learned:
      "In an accelerating rocket, a clock at the ceiling ticks faster than a clock at the floor, because a light signal sent upward arrives redshifted — stretched to a lower frequency — since the cabin keeps speeding up while the signal is in transit. Because gravity and acceleration are locally indistinguishable, the same thing must happen in a real gravitational field: a clock closer to the ground runs slower than a clock higher up. This is gravitational time dilation, and it's real — GPS satellites have to correct for it.",
    next: 'Next, we test the limits of the equivalence principle itself: does it hold no matter how big the cabin is?',
  },
  {
    title: "Why Gravity Isn't Just Acceleration",
    group: 'Gravity and Curved Spacetime',
    Component: TidalEffectExperiment,
    learned:
      "Two balls dropped side by side in a cabin resting on a planet drift slightly toward each other, because gravity pulls each one toward the planet's center, and that's a slightly different direction from two different spots. The same two balls dropped in an accelerating rocket stay exactly the same distance apart, because the rocket pushes every part of the cabin the same way. So a big enough cabin, or two balls far enough apart, actually can tell gravity and acceleration apart — the equivalence principle from Experiment 1 only holds exactly for a small enough cabin. This convergence is called a tidal effect, and it means something more than plain acceleration is going on with real gravity.",
    next: 'Next, we ask what that tidal effect actually means: why paths that start out parallel can still drift together.',
  },
  {
    title: 'Curved Spacetime',
    group: 'Gravity and Curved Spacetime',
    Component: CurvedSpacetimeExperiment,
    learned:
      "Two travelers walking dead straight, starting the same fixed distance apart, stay exactly the same distance apart on a flat surface, but drift together on a curved surface (a sphere) — purely from the surface's shape, with nothing pushing them sideways. Experiment 3's converging balls are the same kind of thing: their free-falling paths are as straight as gravity allows, and they converge because spacetime itself is curved near a planet, not flat. This is what curved spacetime means.",
    next: 'Next, we ask where that curvature actually comes from: a nearby mass, and how far away it is.',
  },
  {
    title: 'What Curves Spacetime?',
    group: 'Gravity and Curved Spacetime',
    Component: SpacetimeCurvatureSourceExperiment,
    learned:
      "Experiments 2 and 3's abstracted 'strength' sliders were standing in for a real mass at a real distance all along — both effects grow stronger closer to a mass and for a bigger mass, though at different rates.",
    next: 'Next, we ask why planets orbit instead of falling straight into the Sun or flying off into space.',
  },
  {
    title: 'Why Do Planets Orbit Instead of Falling In?',
    group: 'Gravity and Curved Spacetime',
    Component: OrbitExperiment,
    learned:
      'An orbit is not a special force holding something up — it is just falling under gravity, curved by the one push the object got at the start. The same mass and the same starting distance can make an object fall in, fly away, or orbit forever, depending only on how strong that starting push was. This is the same geodesic idea as Experiment 4, now curving around a mass instead of converging with another path.',
    next: 'Next, we ask what happens if a mass is so concentrated that not even light could escape it.',
  },
  {
    title: 'What Is a Black Hole?',
    group: 'Gravity and Curved Spacetime',
    Component: BlackHoleExperiment,
    learned:
      "A black hole isn't a mysterious, different kind of object — it's what a mass becomes once it's concentrated enough that its escape speed would need to exceed the speed of light. Since nothing can go faster than light, nothing can escape from inside that boundary, the event horizon. It's the exact same escape-speed idea from Experiment 6, pushed to its physical limit. Real black holes are real, too — astronomers have directly imaged the region around two of them, using the Event Horizon Telescope.",
    next: 'Next, we ask whether gravity affects light in a different way: not just holding it back entirely, but bending its path when it only passes nearby.',
  },
  {
    title: 'Does Gravity Bend Light?',
    group: 'Gravity and Curved Spacetime',
    Component: LightBendingExperiment,
    learned:
      "Light passing near a mass, even without being aimed at it, has its path bent — gravity affects paths themselves, not just things that can be pulled to a stop. This experiment's ordinary-gravity simulation calculates one bending angle, but the real universe bends light exactly twice as much, because real gravity also curves space itself. That doubling is exactly what a 1919 solar eclipse expedition, led by Arthur Eddington, measured — the first confirmation of general relativity over Newtonian gravity — and this same bending, gravitational lensing, is now a routine astronomical tool.",
    next: 'Next, and last, we bring both chapters together: a real satellite clock experiencing both kinds of time dilation at once.',
  },
  {
    title: 'Real Clocks in Orbit (GPS and the Balance of Two Effects)',
    group: 'Gravity and Curved Spacetime',
    Component: GpsTimeDilationExperiment,
    learned:
      "A satellite's clock is pulled two ways at once: its speed slows it down (Experiment 3/4's effect), and its altitude speeds it up (Experiment 2's effect). Which one wins depends on altitude — below about 3,186 km the speed effect wins, above it the altitude effect wins. Real GPS satellites orbit well above that crossover, so their clocks really do run about 38 millionths of a second fast every day, a correction real GPS receivers apply. This is the first calculation in the whole project using real Earth numbers rather than an abstracted stand-in — and, in the closing section on this page, the two theories behind everything in this journey, special and general relativity, are named and explained in full for the first time.",
    next: 'This is the last experiment in this two-chapter journey — see "Putting It All Together" on this page for the full picture.',
  },
  {
    title: 'Ripples in Spacetime: Gravitational Waves',
    group: 'Gravitational Waves',
    Component: GravitationalWaveExperiment,
    learned:
      "A gravitational wave is a ripple of spacetime curvature traveling outward from a violently accelerating mass, like two colliding black holes. As it passes, it stretches space one way while squeezing the perpendicular way, then swaps back and forth — the same kind of curvature effect as Experiment 4's converging travelers, just moving instead of fixed in place. LIGO actually detected one in 2015, using detectors built in exactly this L-shape.",
    next: "Next, we model the wave the way a real inspiral actually produces it: building in both pitch and loudness right up to a final moment, instead of staying steady.",
  },
  {
    title: 'The Chirp: A Wave That Builds',
    group: 'Gravitational Waves',
    Component: GravitationalWaveChirpExperiment,
    learned:
      "A real gravitational wave from an inspiraling pair \"chirps\": its pitch and loudness both rise as the two objects spiral closer together, right up to an idealized final moment, instead of arriving at one steady note. This happens because the pair orbits faster as it gets closer — the same \"closer and faster\" relationship the Orbit experiment already showed — and a faster orbit produces a faster-oscillating, stronger wave. A bigger mass pair follows this pattern on a shorter timescale, reaching its final moment sooner. LIGO's real 2015 detection, GW150914, was recognized as a chirp for exactly this reason, its pitch and loudness both rising over about two-tenths of a second before the two black holes merged.",
    next: 'Next, we ask why the orbit shrinks at all: the wave itself drains the pair of real orbital energy.',
  },
  {
    title: 'Where the Energy Comes From',
    group: 'Gravitational Waves',
    Component: GravitationalWaveEnergyExperiment,
    learned:
      "A gravitational wave is not a free side-effect of two objects orbiting each other — producing it costs the orbit real energy. Losing that orbital energy is what causes the pair to spiral closer together and orbit faster, which is why Experiment 2's chirp happens at all — this experiment shows the cause behind that already-observed effect. A bigger mass pair has more orbital energy to lose, which is part of why it produces a louder wave. LIGO's real GW150914 detection converted roughly 3 solar masses' worth of energy into gravitational waves in about two-tenths of a second, briefly releasing more power than the combined light of every star in the observable universe.",
    next: 'Next, we apply this same model to two real, named detections: a black-hole merger and a neutron-star merger.',
  },
  {
    title: 'Comparing Two Real Events',
    group: 'Gravitational Waves',
    Component: GravitationalWaveRealEventsExperiment,
    learned:
      "The same chirp-and-energy-loss model from the last two experiments applies to any inspiraling pair — only the mass differs. GW150914's two black holes (tens of times the Sun's mass) produced a much louder, faster-rising, shorter chirp than GW170817's two neutron stars (each only a little heavier than the Sun). GW170817 was also seen in light — a gamma-ray burst and a glowing afterglow — because neutron stars have surfaces and material that can radiate light when they collide, while merging black holes do not. Seeing the same event through more than one channel, gravitational waves and light together, is called multi-messenger astronomy, and it let scientists pin down GW170817's location and distance far more precisely than the gravitational-wave signal alone could.",
    next: 'Next, we ask what happens if the source of a gravitational wave is moving away from the detector.',
  },
  {
    title: 'Stretched by Motion',
    group: 'Gravitational Waves',
    Component: GravitationalWaveRedshiftExperiment,
    learned:
      "A source moving away from the detector stretches the wave it sends out to a lower frequency than it was emitted at — the Doppler effect, the same basic effect as a receding ambulance's siren dropping in pitch, now called a redshift. The real amount of stretching is somewhat more than that everyday Doppler effect alone would predict, because relativistic time dilation adds an extra stretch on top of it. This experiment only models that velocity-based piece; for a real, very distant detected event, the much larger contributor to its redshift is the separate cosmological expansion of space itself while the wave travels, not modeled here.",
    next: 'Next, we ask whether a single detector can tell you where a signal came from — or whether you need more than one.',
  },
  {
    title: 'Triangulation',
    group: 'Gravitational Waves',
    Component: GravitationalWaveTriangulationExperiment,
    learned:
      "A single detector can tell you a gravitational wave arrived, but not which direction it came from. Because the wave travels at a fixed, finite speed and real detectors sit far apart on Earth, the same wave reaches the nearest detector first and the others slightly later — comparing those tiny arrival-time gaps across a network of detectors narrows down the direction, the same way a time gap between your two ears tells you which way a sound came from. This is how real discoveries like GW170817 (Experiment 4) could be matched to a patch of sky that telescopes could then point at.",
    next: 'Next, we ask whether a gravitational wave can tell you how far away its source was.',
  },
  {
    title: 'Standard Sirens',
    group: 'Gravitational Waves',
    Component: GravitationalWaveStandardSirenExperiment,
    learned:
      "A gravitational wave's amplitude weakens with distance, but the chirp's own shape depends only on mass, not distance — so comparing the two (a 'standard siren') reveals the distance to the source without any other distance measurement. Pairing that distance with a separately measured recession velocity gives an estimate of the Hubble constant, exactly as astronomers did with GW170817 (Experiment 4) in 2017 — the first-ever gravitational-wave measurement of cosmic expansion. GW150914 could not be used this way, since it had no light counterpart and so no host-galaxy recession velocity was ever measured for it.",
    next: 'Next, a new chapter: Cosmology. If distant galaxies are all receding, what does that say about the universe as a whole?',
  },
  {
    title: "Hubble's Law",
    group: 'Cosmology',
    Component: HubblesLawExperiment,
    learned:
      "Essentially every distant galaxy's light is redshifted, and the farther away a galaxy is, the more redshifted its light is — Hubble's Law. The cause is space itself expanding while the light travels, not a galaxy moving through space.",
    next: "Next, we run that relationship backward in time: does every galaxy really point back to the same moment?",
  },
  {
    title: 'The Big Bang',
    group: 'Cosmology',
    Component: BigBangExperiment,
    learned:
      "Running Hubble's Law backward in time, every galaxy's distance from us implies the same moment in the past — the 'Hubble time' — no matter how far away it is today. That naive, constant-speed estimate comes out close to the universe's real measured age, which is informative but not proof of the real expansion history.",
    next: 'Next, the oldest light there is: the Cosmic Microwave Background.',
  },
  {
    title: 'The Cosmic Microwave Background',
    group: 'Cosmology',
    Component: CosmicMicrowaveBackgroundExperiment,
    learned:
      "About 380,000 years after the Big Bang, the universe became transparent, and that first light is still arriving today as the Cosmic Microwave Background. Stretched by the universe's expansion, it has cooled from about 3,000 K to 2.725 K, following the exact rule T = T0 × (1 + z). It looks almost the same temperature in every direction, the real observation behind the horizon problem.",
    next: 'Next, we zoom in on a single galaxy: is the matter we can see all the matter there is?',
  },
  {
    title: 'Dark Matter',
    group: 'Cosmology',
    Component: DarkMatterExperiment,
    learned:
      "Orbit speed depends on the mass inside the orbit, so measuring how fast stars orbit weighs a galaxy. If only the visible matter counted, far-out stars should orbit more slowly, but their measured speeds stay high. The simplest explanation is unseen mass called dark matter, which pulls with gravity but gives off no light. It is inferred from its gravity alone, and what it is made of is still unknown.",
    next: 'Next, back to the whole universe: has its expansion been speeding up or slowing down?',
  },
  {
    title: 'Dark Energy',
    group: 'Cosmology',
    Component: DarkEnergyExperiment,
    learned:
      "Distant Type Ia supernovae, whose true brightness is known, look dimmer than a matter-only universe predicts, so they are farther away than expected: the expansion has been speeding up. Dark energy is the name for whatever drives this, estimated at about 70% of the universe's energy today. It is inferred from observations like this one, what it is remains unknown, and it is a different idea from dark matter.",
    next: 'Next, we put the expansion history together to ask how old the universe really is.',
  },
  {
    title: 'The Age of the Universe',
    group: 'Cosmology',
    Component: UniverseAgeExperiment,
    learned:
      "The age of the universe depends on its whole expansion history, not only today's rate. With matter only, the universe would be about two thirds of the Hubble time, too young. Dark energy makes it older, and about 70% gives an age close to the measured 13.8 billion years.",
    next: 'Next, a second and independent way to find dark matter: weighing a galaxy cluster with light.',
  },
  {
    title: 'Gravitational Lensing',
    group: 'Cosmology',
    Component: GravitationalLensingExperiment,
    learned:
      "A mass between us and a distant galaxy bends its light into a ring, and the ring grows with the square root of the mass, so the ring weighs the cluster. The ring seen for a real cluster is about 2.6 times as wide as its visible matter could make, which needs about 6.7 times the visible mass. Most of the mass is unseen: dark matter, found without measuring any star's speed.",
    next: 'Next, back to the oldest light: how far away is its source, and how can that be more than the light could have travelled?',
  },
  {
    title: 'The Observable Universe',
    group: 'Cosmology',
    Component: ObservableUniverseExperiment,
    learned:
      "The farthest light we can see has travelled about 13.5 billion years, yet its source is now about 45 billion light-years away, because space stretched while the light was on its way. The source was only about 41 million light-years away when the light left.",
    next: 'Next, how a nearly smooth early universe grew into galaxies: tiny ripples, and how fast gravity can grow them.',
  },
  {
    title: 'Structure Formation',
    group: 'Cosmology',
    Component: StructureFormationExperiment,
    learned:
      'A region that starts slightly denser than average grows only in step with the size of the universe while matter dominates, and dark energy slows it later. Dark matter can start growing earlier than ordinary matter, which gives it a head start.',
    next: 'Next, we follow the expansion into the future: does it ever stop?',
  },
  {
    title: 'The Fate of the Universe',
    group: 'Cosmology',
    Component: FateOfTheUniverseExperiment,
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1).
    learned:
      'With only matter, the expansion slows down forever without quite stopping. With dark energy, each doubling of the universe takes about the same time as the one before, so the growth becomes steady and endless.',
    next: 'Next, a new chapter, Black Holes and Strong Gravity, begins with a simple question: how small would an ordinary object have to be squeezed to become a black hole?',
  },
  {
    title: 'How Small Is a Black Hole?',
    group: 'Black Holes and Strong Gravity',
    Component: BlackHoleSizeExperiment,
    learned:
      'Any mass becomes a black hole if all of it is squeezed inside its horizon radius, 2GM/c². That radius is proportional to the mass, about 3 kilometers for each Sun. Real objects are far from that limit: the Sun would have to shrink about 236,000 times and Earth about 720 million times, while a neutron star is only about 3 times too big.',
    // Wording approved by the owner on 2026-10-10 (CLAUDE.md §28.1): changed to point to Experiment 2.
    next: 'Next, time near a black hole: how much does gravity slow a clock that is held close to the horizon?',
  },
  {
    title: 'Time Near a Black Hole',
    group: 'Black Holes and Strong Gravity',
    Component: TimeNearBlackHoleExperiment,
    // Wording approved by the owner on 2026-10-10 (CLAUDE.md §28.1).
    learned:
      'A clock held still near a black hole ticks more slowly than a clock far away, by the factor √(1 − r_s ÷ r). It depends only on how many horizon radii away the clock is, so it is the same for a small black hole and a giant one. The factor falls toward zero at the horizon. The simple formula from the earlier experiments is accurate far away and fails near the horizon.',
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1): changed to point to Experiment 3.
    next: 'Next, orbits near a black hole: is it safe to circle one at any distance?',
  },
  {
    title: 'Orbits Near a Black Hole',
    group: 'Black Holes and Strong Gravity',
    Component: OrbitsNearBlackHoleExperiment,
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1).
    learned:
      'In ordinary gravity, a circular orbit that gets a small nudge only wobbles, at any distance. In the exact theory, there is a last safe circular orbit at 6GM/c², which is 3 horizon radii, the same number for every black hole. At or inside it, a small nudge sends the probe spiraling into the black hole. Far away, the two rules give nearly the same orbit.',
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1): changed to point to Experiment 4.
    next: 'Next, light near a black hole: how much does it bend light, and can light be trapped?',
  },
  {
    title: 'Light Near a Black Hole',
    group: 'Black Holes and Strong Gravity',
    Component: LightNearBlackHoleExperiment,
    // Wording approved by the owner on 2026-10-11 (CLAUDE.md §28.1).
    learned:
      'Close to a black hole, light is bent far more than the simple formula from Gravity and Curved Spacetime says. There is a critical aim, about 2.6 horizon radii, the same for every black hole: light aimed closer than that is captured, even though it was aimed to miss the edge. Light aimed just outside it swings right round the black hole before it escapes, because light itself can circle at 1.5 horizon radii.',
    // Wording approved by the owner on 2026-10-11 (CLAUDE.md §28.1): changed to point to Experiment 5.
    next: 'Next, falling in: what does a traveler who falls into a black hole experience, and does a far-away observer agree?',
  },
  {
    title: 'Falling In',
    group: 'Black Holes and Strong Gravity',
    Component: FallingInExperiment,
    // Wording approved by the owner on 2026-10-11 (CLAUDE.md §28.1).
    learned:
      "A traveler who falls straight into a black hole reaches the horizon after a finite time on their own watch, while a clock far away reads later and later, without limit, as the traveler nears the horizon. They are different clocks, and neither is the real time. What the traveler feels is the stretching, the difference in pull between head and feet. It grows very fast closer in, and at the horizon it is far larger for a small black hole than for a giant one, so crossing a giant black hole's horizon is, locally, unremarkable.",
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1): changed to point to Experiment 6.
    next: 'Next, seeing the fall from far away: what does an observer far from the black hole actually receive, and do they ever see the traveler cross?',
  },
  {
    title: 'Seeing the Fall From Far Away',
    group: 'Black Holes and Strong Gravity',
    Component: SeeingTheFallExperiment,
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). Shown only after the tutor's explanation.
    learned:
      "A far-away observer receives a falling traveler's flashes further and further apart, even though the traveler sent them at equal steps of their own watch. The stretching comes from two effects that multiply: gravity slowing the traveler's watch, and the traveler moving away. It has no limit near the horizon, so the flash sent at the horizon never arrives. The observer never sees the traveler cross, yet the traveler's own watch reaches the horizon in a finite time. These are two descriptions of the same event, and neither is the real time.",
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1): changed to point to Experiment 7.
    next: 'Next, the color of the fall: what color does the traveler\'s light have when it reaches the far-away observer?',
  },
  {
    title: 'The Color of the Fall',
    group: 'Black Holes and Strong Gravity',
    Component: ColorOfTheFallExperiment,
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). Shown only after the tutor's explanation.
    learned:
      "The crests of a light wave are stretched apart just as the flashes in Experiment 6 were, by the same stretch factor, so the wavelength the observer receives is the lamp's wavelength times that factor. A falling traveler's green lamp turns redder (this is called redshift), leaves visible light well before the horizon, and goes on into infrared and then microwaves, with no limit near the horizon. Two effects multiply to give the stretching: gravity slowing the traveler's clock, and the traveler moving away. The color depends only on the distance in horizon radii, not on the mass of the black hole.",
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1): changed to point to Experiment 8.
    next: 'Next, spinning black holes: does the direction a probe circles, and how fast the black hole spins, change where orbits are safe?',
  },
  {
    title: 'Spinning Black Holes',
    group: 'Black Holes and Strong Gravity',
    Component: SpinningBlackHoleExperiment,
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). Shown only after the tutor's explanation.
    learned:
      "A black hole can spin, and the space around it is dragged around in the direction of the spin (frame dragging). That moves the last safe orbit: closer in for a probe circling with the spin, farther out for one circling against it. At a spin of 0.9 they are at 1.16 and 4.36 reference radii, where a black hole that does not spin has 3. The horizon gets smaller, and the closer in the last safe orbit is, the more of its rest-mass energy a probe gives up on the way down (15.6% with the spin, against 5.7% with no spin and 3.9% against it). In reference radii, all of this is the same for every black hole.",
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1): changed to point to Experiment 9.
    next: 'Next, how a black hole forms: what can hold up a dead star\'s core, and what happens when nothing can?',
  },
  {
    title: 'How a Black Hole Forms',
    group: 'Black Holes and Strong Gravity',
    Component: BlackHoleFormationExperiment,
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). Shown only after the tutor's explanation.
    learned:
      "A dead star's core is held up only by pushes that run out at certain masses. Electrons hold up a white dwarf, which gets smaller as it gets heavier, up to 1.44 Suns (the Chandrasekhar limit). Neutrons hold up a neutron star, about 12 to 13 km in radius, up to somewhere between about 2 and 3 Suns, which is not known exactly. Above that, nothing known holds the core up, so it collapses until it is inside its horizon: a black hole. The heavier the core, the closer it gets to its own horizon before that happens.",
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1): changed to point to Experiment 10.
    next: 'Next, Hawking radiation: does a black hole slowly disappear?',
  },
  {
    title: 'Hawking Radiation',
    group: 'Black Holes and Strong Gravity',
    Component: HawkingRadiationExperiment,
    // Wording approved by the owner on 2026-10-12 (CLAUDE.md §28.1). Shown only after the tutor's explanation.
    learned:
      "A black hole is not perfectly black: it gives off a very faint heat, called Hawking radiation, and the smaller the black hole, the hotter it is (1 Sun: about 0.00000006 K). Heat flows from hot to cold, so a black hole hotter than its surroundings loses mass and one colder gains it. The cosmic microwave background is at 2.725 K, warmer than every black hole found in space, so today they gain mass. A lone black hole would take a time that grows as the cube of its mass to evaporate: about 2 × 10⁶⁷ years for 1 Sun, against the universe's 1.4 × 10¹⁰ years.",
    next: 'This is currently the last experiment in the project. No further experiment is approved in this chapter.',
  },  {
    title: 'The Interval',
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: SpacetimeIntervalExperiment,
    // Wording approved by the owner on 2026-10-13 (CLAUDE.md §28.1); "What's next" is version A.
    learned:
      "Two observers who move differently can measure different times and different distances between the same two events. But there is one number they agree on. Square the time, square the distance, and subtract. For two ticks of one clock, the answer came out the same for the lab, for the clock itself and for the passing observer, however fast each was moving. It is called the interval squared, and its square root, the interval, is the time the clock's own face shows between the two ticks. It is a little like a stick on a table. As you turn the stick, its east-west and north-south parts change, but its length does not. The comparison is not exact, though. A stick's length comes from adding the squares of its parts, while the interval comes from subtracting them, and this experiment did not explain why.",
    next: "You saw this for one pair of events: two ticks of one clock, measured by three observers. Next, we ask whether the same number can be found for other pairs of events, and how what an observer actually sees, because of the light that reaches them, differs from what they measure.",
  },
  {
    title: 'Light Cones',
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: LightConesExperiment,
    // Wording approved by the owner on 2026-10-13 (CLAUDE.md §28.1). Shown only after the tutor's explanation.
    learned:
      "Whether one event can affect another depends on whether a signal could cover the distance between them in the time available. Light is the fastest signal, so the events a flash of light from an event could reach make up its light cone. Measure the time in seconds and the distance in light-seconds. If there is more time than distance, something slower than light could make the trip; if the two are equal, only light could; if there is less time than distance, nothing could. Squaring the time and the distance and subtracting, as in the last experiment, gives a positive number, zero or a negative number in those three cases. Different observers measure different times and distances, but they all get the same sign, so they all agree on which case an event is. Physicists call the three cases timelike, lightlike and spacelike. The comparison with a shout across a field is not exact, because observers can disagree about how fast sound goes, but they all agree on how fast light goes.",
    next: "You saw which events can be reached from one event, and that every observer agrees on it. This experiment left the order of events alone. Next, we ask whether observers can disagree about which of two events came first, and what that means for cause and effect.",
  },
  {
    title: 'Cause Before Effect',
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: CauseBeforeEffectExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1). Shown only after the tutor's explanation.
    learned:
      "Two observers can disagree about which of two events came first, but only for some pairs of events. If an event is inside or on the edge of another event's light cone, then something could travel from the first to the second, and every observer finds the first one first. If an event is outside the cone, then nothing could make the trip, and an observer moving fast enough can find the order reversed. For example, take an event 3 seconds after O and 5 light-seconds away. The lab finds it 3.00 seconds after O, but an observer passing at +0.9c finds it 3.44 seconds before O. The reason is that every observer's same-moment line through O is tilted by their speed. Their speed is always below the speed of light, so the line is always flatter than the edge of the cone. Events inside the cone always stay on the later side of it, and events outside the cone can end up on the earlier side. The events whose order can change are exactly the ones that could not be cause and effect, so no observer ever finds a cause after its effect. If something could go faster than light, this protection would fail. At everyday speeds, the order changes only for events millions of light-seconds apart, so we never notice it.",
    next: "Everything in this experiment was the order that each observer works out from their own ruler and clocks, after allowing for the time light takes to travel. It is not what the observer sees with their eyes. A later experiment looks at that difference.",
  },
  {
    title: 'What You See Is the Past',
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: SeeingThePastExperiment,
    // Wording approved by the owner on 2026-10-14 (CLAUDE.md §28.1). Shown only after the tutor's explanation.
    learned:
      "What a telescope shows is light that reached it now, and that light left the spaceship earlier. So a moving spaceship is not where it looks to be, and its image can seem to move at a different speed from the spaceship. A spaceship coming toward the lab looks faster than it is, and one going away looks slower, because each later picture has a shorter or longer trip. For example, a spaceship flying toward the lab at 0.6c covers 4 light-seconds in 6.67 seconds. The first image arrives at time 5.00 and the last at time 7.67, so the image covers the same distance in 2.67 seconds, which is 1.50c. An image that looks faster than light breaks no rule. The spaceship itself is below the speed of light, and nothing travels along the image. This effect comes only from the time light takes to travel, and it would happen even without relativity.",
    next: "You saw only where the spaceship looks to be, along one line. You did not see its brightness or color, or a spaceship moving across the line of sight. Next, we ask a different question about a moving thing: what do different observers find for its energy, its momentum and its mass?",
  },
  {
    title: 'Energy, Momentum and Mass',
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: EnergyMomentumExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1). Shown only after Part 3's tutor explanation.
    learned:
      "Different observers measure different energies and momenta for the same moving thing, but the combination E² − (pc)² is the same for all of them, and it is the square of the thing's mass. So mass is the number every observer agrees on, and a particle at rest still has energy, its rest energy mc². In a collision, the total energy and the total momentum are conserved for every observer, but the sum of the separate masses is not. Two lumps of mass m that meet at 0.6c each make one lump of mass 2.5 m, not 2 m, because their energy of motion becomes internal energy. What does not change is the mass of the whole system, worked out from its total energy and total momentum. The same holds when pieces are created or destroyed. An electron and a positron at rest turn into two pulses of light: the sum of the masses goes from 2 to 0, while the system's mass stays 2. Two beams of light can make a pair only if each has at least one rest energy. And a helium nucleus weighs 28.3 MeV, about 0.75 percent, less than its two protons and two neutrons, because that energy leaves when they bind.",
    next: "You saw particles and light along one line, and the formulas were used, not derived. Forces, acceleration, electric charge, and the force that holds a nucleus together were not shown. The next experiment applies the system's mass to a practical question: how much energy it takes to make a new particle, and how a particle decays.",
  },
  {
    title: 'Making New Particles',
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: MakingNewParticlesExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after
    // Part 2's tutor reaches its explanation.
    learned:
      "To make a new particle, the system's mass must reach the total mass of what comes out. Two head-on beams make all of their energy of motion usable, while a beam on a stationary target locks part of it into the motion of the whole system. For K = 10, 7.1 of the 10 is locked in, and the system's mass is 4.90 against 12.00. That is why colliders reach much higher masses. A particle can decay only into pieces that weigh less than it in total, with the difference becoming their energy of motion.",
    next: "The experiment used one line, no probabilities and two equal pieces. The next experiment goes back to what observers see, and asks which direction the light from a star comes from for a fast traveler.",
  },
  {
    title: 'Aberration',
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: AberrationExperiment,
    // Wording approved by the owner on 2026-10-16 (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after the tutor's
    // explanation.
    learned:
      "Two observers who move relative to each other measure different directions for the same ray of light, so a traveler sees the stars crowded toward the direction of travel and thinned out behind, and the faster the traveler, the stronger the crowding: for the star the lab sees sideways, the traveler sees it at 72.5 degrees at 0.3c, 53.1 degrees at 0.6c and 25.8 degrees at 0.9c. The two stars straight ahead and straight behind do not move. The stars themselves have not moved; it is the direction of the light, as each observer measures it, that differs.",
    next: "You saw only the direction of the light. Its colour changes too, which the next experiment shows.",
  },
  {
    title: 'The Doppler effect',
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: DopplerShiftExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after the tutor's
    // explanation. The "What's next" pointer follows Decision 9 of the specification (a pointer to Experiment 9 only if the owner
    // approves that experiment's direction). The owner approved Experiment 9 on 2026-10-16, so it now points to it.
    learned:
      "Two observers who move relative to each other measure different frequencies, and so different colors, for the same ray of light. A traveler sees starlight shifted toward blue ahead and toward red behind, by (1 + β cos θ) ÷ D: at 0.6c, 2.00 times the frequency straight ahead and 0.50 times straight behind. Even the star the lab sees sideways is shifted toward blue, by 1 ÷ D (1.25 at 0.6c), because the traveler's clock runs slow. The stars have not changed color.",
    next: "You saw only the colors. The stars' brightness changes too, which the next experiment shows, together with the direction and the color.",
  },
  {
    title: "The traveler's whole sky",
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: TravelerSkyExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after the tutor's
    // explanation. The "What's next" pointer follows Decision 7 of the
    // specification (a pointer to Experiment 10, the fast object looking rotated, now that the owner has chosen the order).
    learned:
      "A traveler's whole sky differs from the lab's in three linked ways: the stars are crowded ahead, shifted toward blue ahead and toward red behind, and brighter ahead and dimmer behind, by ((1 + β cos θ) ÷ D)²: at 0.6c, 4.00 times as bright straight ahead and 0.25 times straight behind. Even the star the lab sees sideways is brighter, by 1 ÷ D² (1.56 at 0.6c). A star is brighter exactly when it is bluer. The stars have not changed.",
    next: "You saw stars, which are points. The next experiment asks what a fast object with a shape looks like.",
  },
  {
    title: 'A fast object looks rotated, not squashed',
    group: 'Spacetime Geometry: What Is Real, What Is Seen',
    Component: RotatedObjectExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after the tutor's
    // explanation. "What's next" points to the closing recap below it on the page (Decision 2 of closing-synthesis.md, approved 2026-10-16).
    learned:
      "A camera records the light that arrives at one moment, and light from the far side of an object left earlier, when the object was farther back. So a very fast cube is photographed turned, not squashed: its front face is contracted to D × its side and its trailing face, of width β × its side, comes into view, exactly like a cube at rest turned by arcsin β (at 0.6c, 0.80 + 0.60 = 1.40 wide, as a cube turned 36.9 degrees). The cube has not turned, and the lab's ruler still measures it as shorter: measured and seen are different questions.",
    next: "This is the last experiment of this group. \"Putting It All Together\", below on this page, steps back and shows how the ten experiments fit together.",
  },
  {
    title: 'Two measurements of the expansion rate',
    group: 'Frontier and Beyond',
    Component: HubbleTensionExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after the tutor's
    // explanation, which is not built yet.
    learned:
      "Two kinds of measurement of how fast the universe is expanding disagree. The microwave background gives 67.4 ± 0.5, and the distance ladder gives about 73 (73.04 ± 1.04 in 2022, 73.50 ± 0.81 in 2026), which is about 5 to 6 sigma apart, where sigma is the gap divided by the combined uncertainty. JWST's sharper images did not change the nearby-universe value, and a third method gives about 70, in between. Nobody knows whether a hidden error or new physics is behind it.",
    next: 'The next experiment asks whether dark energy, the other big unknown of the expansion, changes over time.',
  },
  {
    title: 'Does dark energy change?',
    group: 'Frontier and Beyond',
    Component: EvolvingDarkEnergyExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after the tutor's
    // explanation. Every number is the published one the experiment uses (DESI arXiv:2503.14738 and 2607.27410, DES arXiv:2511.07517).
    learned:
      "Dark energy might not be constant. DESI's 2025 data, combined with the microwave background and a collection of supernovae, fit a dark energy that changes over time slightly better than a constant one, by 2.8 to 4.2 sigma depending on the supernova collection. The effect on distances is small, about 1 to 3 percent at redshift 0.5 for the published fits, so only very large surveys can see it. The preference fell from 4.2 to 3.2 sigma when the Dark Energy Survey supernovae were recalibrated, and DESI's July 2026 Lyman-alpha analysis, on its own, agrees with a constant dark energy, though the combined preference stays at 2.7 to 3.2 sigma. None reaches the 5 sigma bar, so this is a hint, not a discovery: Contested, as of October 2026.",
    next: 'The next experiment looks at a tension that went away: how lumpy is the universe, and why a disagreement between surveys shrank when a measurement was improved.',
  },
  {
    title: 'How lumpy is the universe?',
    group: 'Frontier and Beyond',
    Component: LumpinessExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after the tutor's explanation.
    // Every number is the published one the experiment uses (KiDS arXiv:2007.15633 and 2503.19441, DES arXiv:2602.10065, Planck as quoted by KiDS-Legacy).
    // "What's next" was changed on 2026-10-19, at the owner's request after Experiment 4 was built, to point to Experiment 4 (Decision 13 had kept it silent until then); the owner approved the new sentence on 2026-10-19.
    learned:
      "Lensing measures how lumpy matter is today, summarised in one number, S₈ = σ₈ × √(Ωm ÷ 0.3). The microwave background predicts about 0.834 ± 0.016. The Kilo-Degree Survey's first full analysis (2020) gave 0.759, about 3 sigma below that. Its re-analysis of the complete survey (2025) gave 0.815, in agreement with the microwave background (0.73 sigma in the paper's own comparison); the authors say the rise comes mainly from improved calibration of how far away the lensed galaxies are, together with new sky area and better image processing. But the Dark Energy Survey's 2026 Year 6 result (0.798 or 0.783) is still 2.0 to 2.3 sigma below, in its own paper's comparison. So a tension went away in one survey and not in another, and a 2026 review finds survey-specific systematic effects contribute substantially. Contested, as of October 2026.",
    next: 'The next experiment asks whether the universe, by the way it expands and clumps, can weigh a neutrino, and whether that agrees with what laboratories find.',
  },
  {
    title: 'Can the universe weigh a neutrino?',
    group: 'Frontier and Beyond',
    Component: NeutrinoMassExperiment,
    // Wording approved by the owner on 2026-10-19 (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after the tutor's explanation.
    // Every number is the published one the experiment uses (DESI arXiv:2503.14744 and 2607.27410, Planck arXiv:1807.06209, NuFIT 6.0 arXiv:2410.05380).
    // "What's next" says nothing about Experiment 5 until it has an approved specification (Decision 13).
    learned:
      "Neutrinos left over from the Big Bang fill space, and the sky can weigh them, because even a tiny mass changes how the universe expanded and how matter clumped. For three equal masses adding up to 0.06 eV, the neutrinos turn from light-like to matter-like about 74 million years after the Big Bang, long after the microwave background was released (380,000 years). They make up well under 1 percent of the matter, and smooth the smallest clumps by about 3.6 percent. Oscillation experiments set a floor on the total of about 0.059 eV, or 0.10 eV if the masses are in the inverted order. The sky's ceiling has come down from 0.12 eV (Planck, 2018) to 0.0642 eV (DESI, March 2025) to 0.0592 eV (DESI, July 2026), almost level with the normal-ordering floor (0.0588 eV) and below the inverted-ordering floor (0.1004 eV). DESI's March 2025 paper reported a 3 sigma tension with the floor, and allowing a changing dark energy relaxes the limit to 0.163 eV. Possible explanations are a data or analysis choice, a different dark energy, or new neutrino physics; none is established. This model shows why a tiny mass leaves a mark, not DESI's limit itself. Contested, as of October 2026.",
    next: 'The next experiment asks how early galaxies can form: what the redshift of the most distant galaxy confirmed with a spectrum tells us about time and distance.',
  },
  {
    title: 'How early can galaxies form?',
    group: 'Frontier and Beyond',
    Component: EarliestGalaxiesExperiment,
    // Draft wording for the owner's review (CLAUDE.md §28.1), from the specification's chapter summary. Shown only after the tutor's explanation.
    // Every number is the one the experiment uses (the model's, at Planck's expansion rate) or the published one (Naidu et al., arXiv:2505.11263).
    // "What's next" says nothing about Experiment 6 until it has an approved specification (Decision 12).
    learned:
      "A redshift of 14.44, the most distant galaxy confirmed with a spectrum (MoM-z14), means its light was stretched 15.44 times on the way to us, so ultraviolet light that left at 121.6 nm arrived at about 1,877 nm, in the near-infrared, which is why Webb was needed. In the model, that light left about 284 million years after the Big Bang (the paper says 280), only about 2 percent of the universe's present age of 13.8 billion years. It travelled for about 13.5 billion years, and the galaxy was about 2.2 billion light-years away when the light left and is about 33.85 billion light-years away now. The survey behind it implies about 182 times the number of bright galaxies the models used before Webb predicted, in a range from 77 to 511 times, which is one survey's estimate. The age and the distance come from how the universe expands, so the puzzle is how galaxies could form so early, not the age shown here. Proposed explanations include short, strong bursts of star formation and very efficient early star formation. None is settled. This model gives ages and distances. It does not model how galaxies form, so it cannot say which explanation is right. Strong evidence that these galaxies exist; Open: what built them so fast, as of October 2026.",
    next: 'This is the latest experiment of the group built so far. The next ones will appear here once they have an approved specification.',
  },
  {
    title: 'Where is the dark matter?',
    group: 'Frontier and Beyond',
    Component: DarkMatterSearchesExperiment,
    // Draft chapter summary, for the owner's line-by-line approval (CLAUDE.md §28.1). Every number is the one the experiment uses or the published one
    // (LZ, arXiv:2410.17036 and arXiv:2609.02823; the SLAC release of 8 December 2025). "What's next" says nothing about Experiment 7 until it has an
    // approved specification.
    learned:
      "A search that sees nothing still teaches something: it rules out every interaction strong enough that seeing nothing would have been less than a 1-in-10 accident. That limit sits where a search would expect about 2.3 bumps, so a particle ten times weaker, searched for ten times longer, is expected to give the same 2.3, and more data tests weaker interactions. With no background, LZ's limit of 2.2 × 10^-48 cm² after 280 live days would fall to about 6.2 × 10^-49 cm² after 1,000, and with a background that grows with the data, only to about 1.2 × 10^-48 cm² (two idealised rules, not LZ's forecast). Neutrinos from the Sun are a real signal and also a background: LZ saw the boron-8 kind at 4.5 sigma, above PandaX-4T's 2.64 and XENONnT's 2.73. LZ's 2026 search reported one event at 248 keV, at 3.4 sigma where it appeared. Counting all the places the search looked, LZ gives 2.6 sigma, below the 3 sigma of evidence (about 14 independent places would do this, as an illustration). The collaboration says the event does not establish a dark matter origin, so it is a hint, not a discovery, and what it is remains open. This experiment is a counting model: it does not reproduce LZ's limits, and it cannot say what the event is. Strong evidence about what dark matter is not; Open: what it is, and what one unexplained event means, as of October 2026.",
    next: 'This is the latest experiment of the group built so far. The next ones will appear here once they have an approved specification.',
  },
  {
    title: 'Do we need dark matter, or does gravity change?',
    group: 'Frontier and Beyond',
    Component: WideBinariesExperiment,
    // Draft chapter summary, for the owner's line-by-line approval (CLAUDE.md §28.1). Every number is the one the experiment uses (the physics model's,
    // for a pair of 1.5 Suns) or a published one (the abstracts of arXiv:2311.03436, 2305.04613, 2309.10404, 2601.21728, 2603.11015 and 2602.24035).
    // "What's next" says nothing about Experiment 8 until it has an approved specification.
    learned:
      "Two stars very far apart orbit slowly, at v = √(G × M ÷ s): a pair of 1.5 Suns moves at about 1,154 m/s at 1,000 AU and only about 365 m/s at 10,000 AU, where the pull is about 8.9 × 10^-11 m/s², 0.74 of a₀ and about 110 billion times weaker than the Earth's. If a modified law of gravity made that pull 1.4 times as strong, the speed would be √1.4 = 1.183 times higher, about 18 percent (432 m/s in place of 365), and not 40 percent, because the square of the speed follows the pull. Dark matter would add almost nothing inside a pair (about 1.3 × 10^-4 of a Sun inside 30,000 AU, a rough estimate), so a speed-up would not be hidden mass. But hidden companions can fake one: if 1 pair in 5 is secretly a triple moving twice as fast, the average is 0.8 × 1 + 0.2 × 2 = 1.20, a fake boost of 20 percent, and about 18.3 percent of triples would fake the whole expected boost. As of October 2026 the published results disagree: Banik and colleagues (2024, 8,611 binaries) report that Newton's law is preferred at 19 sigma; Chae (2023, 26,615 binaries) reports a boost of 1.43 ± 0.06 at 10 sigma and Chae (2024, 2,463 binaries) about 5 sigma; and the same 36 binaries gave γ = 1.60 (Chae and colleagues, 2026) and γ = 1.00 when Saad and Ting modelled the orbits forward, and 1.56 with another way of working out the separation; Cookson and colleagues (2026) report no 20 percent enhancement in their cleanest sample. This experiment is a simple model: it did not analyse any Gaia data, decide between the teams, or say whether gravity changes or whether dark matter exists in some other form. Contested, as of October 2026.",
    next: 'This is the latest experiment of the group built so far. The next ones will appear here once they have an approved specification.',
  },
]

const STORAGE_KEY = 'spacetime-explorer-progress'

interface Progress {
  currentChapter: number
  completed: number[]
  // Chapters whose tutor conversation was finished; their summary is shown.
  explained: number[]
}

// -1 is the unnumbered Welcome screen, before chapter 0.
function isChapterIndex(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= -1 && (value as number) < chapters.length
}

function loadProgress(): Progress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        currentChapter: isChapterIndex(parsed.currentChapter) ? parsed.currentChapter : -1,
        completed: Array.isArray(parsed.completed) ? parsed.completed.filter(isChapterIndex) : [],
        explained: Array.isArray(parsed.explained) ? parsed.explained.filter(isChapterIndex) : [],
      }
    }
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  // No saved progress means a first-ever visit: start on Welcome.
  return { currentChapter: -1, completed: [], explained: [] }
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Progress simply won't persist.
  }
}

export function App() {
  const [initialProgress] = useState(loadProgress)
  const [currentChapter, setCurrentChapter] = useState(initialProgress.currentChapter)
  const [completed, setCompleted] = useState<number[]>(initialProgress.completed)
  const [explained, setExplained] = useState<number[]>(initialProgress.explained)

  useEffect(() => {
    saveProgress({ currentChapter, completed, explained })
  }, [currentChapter, completed, explained])

  const markComplete = (index: number) => {
    setCompleted((previous) => (previous.includes(index) ? previous : [...previous, index]))
  }

  const markExplained = (index: number) => {
    setExplained((previous) => (previous.includes(index) ? previous : [...previous, index]))
  }

  const isWelcome = currentChapter === -1
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groupOrder.map((groupName) => [groupName, !isWelcome]))
  )

  useEffect(() => {
    if (isWelcome) return
    const activeGroup = chapters[currentChapter].group
    setOpenGroups((previous) => (previous[activeGroup] ? previous : { ...previous, [activeGroup]: true }))
  }, [currentChapter, isWelcome])

  const activeChapter = isWelcome ? null : chapters[currentChapter]
  const isCurrentExplained = !isWelcome && explained.includes(currentChapter)
  const isFirst = currentChapter === -1
  const isLast = currentChapter === chapters.length - 1

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <div className="app-shell" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {isWelcome && (
          <>
            <h1 className="app-title" style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '3rem' }}>
              SpaceTime Explorer
            </h1>
            <p className="app-subtitle" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem' }}>
              A short sequence of experiments on relativity — space, time, and motion. Each one builds on the one before it.
            </p>
          </>
        )}

        <div className="chapter-layout">
          <nav aria-label="Experiments" className="chapter-nav">
            <button
              type="button"
              onClick={() => setCurrentChapter(-1)}
              aria-current={isWelcome ? 'step' : undefined}
              className={`nav-button${isWelcome ? ' is-active' : ''}`}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: isWelcome ? 700 : 500,
              }}
            >
              Welcome
            </button>
            {groupOrder.map((groupName) => {
              const groupChapters = chapters
                .map((chapter, index) => ({ chapter, index }))
                .filter(({ chapter }) => chapter.group === groupName)

              if (groupChapters.length === 0) {
                return (
                  <div key={groupName}>
                    <div className="chapter-group-heading" style={{ cursor: 'default' }}>
                      {groupName}
                    </div>
                    <p
                      style={{
                        margin: '0 0 1rem',
                        padding: '0 0.25rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      No experiments yet — coming after "Relativity of Time and Motion".
                    </p>
                  </div>
                )
              }

              const isGroupOpen = Boolean(openGroups[groupName])

              return (
                <div key={groupName}>
                  <button
                    type="button"
                    className="chapter-group-heading"
                    aria-expanded={isGroupOpen}
                    onClick={() => setOpenGroups((previous) => ({ ...previous, [groupName]: !previous[groupName] }))}
                  >
                    {groupName}
                    <span className={`chapter-group-chevron${isGroupOpen ? ' is-open' : ''}`} aria-hidden="true">
                      ▾
                    </span>
                  </button>
                  {isGroupOpen && (
                    <ol className="chapter-list">
                      {groupChapters.map(({ chapter, index }, position) => {
                        const isCurrent = index === currentChapter
                        const isCompleted = completed.includes(index)
                        return (
                          <li key={chapter.title}>
                            <button
                              type="button"
                              onClick={() => setCurrentChapter(index)}
                              aria-current={isCurrent ? 'step' : undefined}
                              className={`nav-button${isCurrent ? ' is-active' : ''}`}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.75rem 1rem',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: isCurrent ? 700 : 500,
                              }}
                            >
                              {position + 1}. {chapter.title}
                              {isCompleted && (
                                <span aria-label="completed" className="check" style={{ float: 'right' }}>
                                  ✓
                                </span>
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </div>
              )
            })}
          </nav>

          <main className="chapter-main">
            {activeChapter ? (
              <>
                <h2 className="experiment-group-title">{activeChapter.group}</h2>
                {groupOverviews[activeChapter.group] && <p className="experiment-group-overview">{groupOverviews[activeChapter.group]}</p>}
                <activeChapter.Component
                  key={currentChapter}
                  onComplete={() => markComplete(currentChapter)}
                  onTutorComplete={() => markExplained(currentChapter)}
                />
              </>
            ) : (
              <Welcome chapters={chapters} onSelectChapter={setCurrentChapter} />
            )}

            {!isWelcome && !isCurrentExplained && activeChapter?.learned !== '' && (
              <p
                className="summary-card"
                style={{
                  maxWidth: '700px',
                  margin: '1rem auto 0',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                }}
              >
                When you have run the experiment and answered the questions that follow it, a short
                summary of what you learned and what comes next will appear here.
              </p>
            )}

            {isCurrentExplained && activeChapter?.learned !== '' && (
              <section
                aria-label="Chapter summary"
                className="summary-card is-explained"
                style={{
                  maxWidth: '700px',
                  margin: '1rem auto 0',
                  padding: '1rem 1.5rem',
                }}
              >
                <p style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                  <strong>What you learned.</strong> {activeChapter?.learned}
                </p>
                <p style={{ marginTop: 0, marginBottom: 0 }}>
                  <strong>What's next.</strong> {activeChapter?.next}
                </p>
              </section>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '2rem',
              }}
            >
              <button
                type="button"
                disabled={isFirst}
                onClick={() => setCurrentChapter(currentChapter - 1)}
                className="primary-button"
                style={{ padding: '0.6rem 1.4rem', fontSize: '1rem' }}
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={isLast}
                onClick={() => setCurrentChapter(currentChapter + 1)}
                className="primary-button"
                style={{ padding: '0.6rem 1.4rem', fontSize: '1rem' }}
              >
                Next →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
