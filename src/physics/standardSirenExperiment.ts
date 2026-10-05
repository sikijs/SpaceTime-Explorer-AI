// Models a gravitational wave's amplitude weakening with distance - the "standard siren" idea:
// comparing a wave's true (source) amplitude, which depends only on mass, to its weaker detected
// amplitude reveals the distance to the source, without any other distance measurement. Reuses
// gravitationalWaveChirpExperiment.ts's amplitude output and gravitationalWaveRealEventsExperiment.ts's
// two real event presets unchanged; the only new physics is the toy inverse-distance falloff below
// and the resulting Hubble-constant ratio (see this experiment's specification, "Physics Model").
import type { RealEventPreset } from './gravitationalWaveRealEventsExperiment'

export interface DistancePreset {
  label: string
  distanceMpc: number
}

// Each event's own real distance, converted from the approximate light-year figures already
// stated in gravitationalWaveRealEventsExperiment.ts's realDescription (1 Mpc ≈ 3.26 million
// light-years): GW150914 ≈ 1.3 billion ly ≈ 400 Mpc; GW170817 ≈ 130 million ly ≈ 40 Mpc.
export const REAL_EVENT_DISTANCES_MPC: Record<RealEventPreset['id'], number> = {
  gw150914: 400,
  gw170817: 40,
}

// Schematic presets for visible side-by-side contrast at a fixed mass - not tied to either
// event's real distance.
export const SCHEMATIC_DISTANCE_PRESETS: DistancePreset[] = [
  { label: 'Nearby', distanceMpc: 10 },
  { label: 'Far', distanceMpc: 1000 },
]

// Real, approximate published recession velocity for each event's host galaxy, corrected for
// local peculiar motion - not computed from this project's own Doppler model (Experiment 5),
// since in reality this number comes from the host galaxy's own light, not from the
// gravitational wave itself. GW150914 had no light counterpart (Experiment 4), so no host
// galaxy was ever identified and no recession velocity exists to give - a real limitation, not
// a simplification.
export const RECESSION_VELOCITY_KM_PER_S: Record<RealEventPreset['id'], number | null> = {
  gw150914: null,
  gw170817: 3017,
}

function validateDistance(distanceMpc: number): void {
  if (!(distanceMpc > 0)) {
    throw new RangeError('Distance must be greater than 0')
  }
}

function validateAmplitude(amplitude: number, name: string): void {
  if (!(amplitude > 0)) {
    throw new RangeError(`${name} must be greater than 0`)
  }
}

// The only new formula: a toy inverse-distance falloff (schematic units, not the precise
// general-relativistic luminosity-distance relation - see this experiment's specification,
// "Simplifying assumptions").
export function detectedAmplitude(trueAmplitude: number, distanceMpc: number): number {
  validateAmplitude(trueAmplitude, 'True amplitude')
  validateDistance(distanceMpc)
  return trueAmplitude / distanceMpc
}

// Inversion: recovers distance from a true amplitude (read directly from chirpStateAt) and a
// detected amplitude - the standard-siren step itself.
export function inferredDistanceMpc(trueAmplitude: number, detectedAmplitudeValue: number): number {
  validateAmplitude(trueAmplitude, 'True amplitude')
  validateAmplitude(detectedAmplitudeValue, 'Detected amplitude')
  return trueAmplitude / detectedAmplitudeValue
}

// Combines the inferred distance with a given recession velocity. Returns null if no velocity
// is available for the event (GW150914), since no real Hubble-constant estimate can be formed
// without one.
export function estimatedHubbleConstant(
  recessionVelocityKmPerS: number | null,
  distanceMpc: number
): number | null {
  if (recessionVelocityKmPerS === null) {
    return null
  }
  validateDistance(distanceMpc)
  return recessionVelocityKmPerS / distanceMpc
}
