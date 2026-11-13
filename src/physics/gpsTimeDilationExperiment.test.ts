import { describe, expect, it } from 'vitest'
import {
  CROSSOVER_ORBITAL_RADIUS_METERS,
  EARTH_GM,
  EARTH_RADIUS_METERS,
  runGpsTimeDilationExperiment,
} from './gpsTimeDilationExperiment'

const ISS_ORBITAL_RADIUS_METERS = EARTH_RADIUS_METERS + 400_000
const GPS_ORBITAL_RADIUS_METERS = EARTH_RADIUS_METERS + 20_200_000

describe('runGpsTimeDilationExperiment', () => {
  it('computes orbital speed from sqrt(EARTH_GM / orbitalRadiusMeters)', () => {
    for (const radius of [7e6, 1e7, 2.6571e7, 4.2164e7]) {
      const result = runGpsTimeDilationExperiment(radius)
      expect(result.orbitalSpeedMetersPerSecond).toBeCloseTo(Math.sqrt(EARTH_GM / radius), 6)
    }
  })

  it('orbital speed strictly decreases as orbital radius increases', () => {
    const radii = [7e6, 1e7, 1.5e7, 2.6571e7, 4.2164e7]
    const speeds = radii.map((r) => runGpsTimeDilationExperiment(r).orbitalSpeedMetersPerSecond)
    for (let i = 1; i < speeds.length; i++) {
      expect(speeds[i]).toBeLessThan(speeds[i - 1])
    }
  })

  it('speed effect is always negative, and its magnitude strictly decreases as radius increases', () => {
    const radii = [7e6, 1e7, 1.5e7, 2.6571e7, 4.2164e7]
    const magnitudes = radii.map((r) => {
      const result = runGpsTimeDilationExperiment(r)
      expect(result.speedEffectFraction).toBeLessThan(0)
      return Math.abs(result.speedEffectFraction)
    })
    for (let i = 1; i < magnitudes.length; i++) {
      expect(magnitudes[i]).toBeLessThan(magnitudes[i - 1])
    }
  })

  it('gravity effect is always positive, and strictly increases as radius increases', () => {
    const radii = [7e6, 1e7, 1.5e7, 2.6571e7, 4.2164e7]
    const values = radii.map((r) => {
      const result = runGpsTimeDilationExperiment(r)
      expect(result.gravityEffectFraction).toBeGreaterThan(0)
      return result.gravityEffectFraction
    })
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })

  it('net effect is approximately zero at the crossover orbital radius', () => {
    const result = runGpsTimeDilationExperiment(CROSSOVER_ORBITAL_RADIUS_METERS)
    expect(result.netEffectFraction).toBeCloseTo(0, 9)
  })

  it('crossover orbital radius equals 1.5 * EARTH_RADIUS_METERS exactly', () => {
    expect(CROSSOVER_ORBITAL_RADIUS_METERS).toBe(1.5 * EARTH_RADIUS_METERS)
  })

  it('net effect is negative at the ISS\'s real altitude and positive at GPS altitude', () => {
    const iss = runGpsTimeDilationExperiment(ISS_ORBITAL_RADIUS_METERS)
    const gps = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    expect(iss.netEffectFraction).toBeLessThan(0)
    expect(gps.netEffectFraction).toBeGreaterThan(0)
  })

  it('matches the real, published GPS correction of approximately +38 microseconds/day', () => {
    const gps = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    expect(gps.netMicrosecondsPerDay).toBeCloseTo(38.5, 0)
    expect(gps.speedEffectFraction * 86400 * 1_000_000).toBeCloseTo(-7.2, 0)
    expect(gps.gravityEffectFraction * 86400 * 1_000_000).toBeCloseTo(45.7, 0)
  })

  it('rejects an orbital radius at or below Earth\'s radius', () => {
    expect(() => runGpsTimeDilationExperiment(EARTH_RADIUS_METERS)).toThrow(RangeError)
    expect(() => runGpsTimeDilationExperiment(EARTH_RADIUS_METERS - 1)).toThrow(RangeError)
  })

  it('is deterministic across repeated calls for the same input', () => {
    const a = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    const b = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    expect(a).toEqual(b)
  })
})

// ---- audit update, 2026-11-13 ----
import {
  ALTITUDE_MAX_KM,
  ALTITUDE_MIN_KM,
  ASHBY_PUBLISHED,
  GUESS_FLAG_ALTITUDE_KM,
  GUESS_LINE_OFFSET_MICROSECONDS,
  GUESS_LINE_TILT_MICROSECONDS,
  GUESS_RING_ALTITUDE_KM,
  GUESS_RING_HEIGHT_MICROSECONDS,
  ORBIT_PRESETS_KM,
  altitudeToRadiusMeters,
  ashbyDistanceKm,
  balanceAltitudeKm,
  balanceRadiusCheck,
  distanceEquivalentKm,
  effectSweep,
  gpsDirectionCheck,
  guessMarkers,
  hasBalanceAltitude,
  lowOrbitDirectionCheck,
  microsecondsPerDay,
  netFractionCheck,
  orbitSummary,
  tutorMarking,
  workedNumbers,
} from './gpsTimeDilationExperiment'

describe('Gravity 9 audit update: pictures, marks and check-ups', () => {
  it('orbit summary reproduces the values the page and specification already quote', () => {
    const gps = orbitSummary(ORBIT_PRESETS_KM.gps)
    expect(gps.speedKmPerSecond).toBeCloseTo(3.873, 3)
    expect(gps.speedEffectMicrosecondsPerDay).toBeCloseTo(-7.21, 2)
    expect(gps.gravityEffectMicrosecondsPerDay).toBeCloseTo(45.72, 2)
    expect(gps.netMicrosecondsPerDay).toBeCloseTo(38.51, 2)
    const iss = orbitSummary(ORBIT_PRESETS_KM.iss)
    expect(iss.speedKmPerSecond).toBeCloseTo(7.673, 3)
    expect(iss.netMicrosecondsPerDay).toBeCloseTo(-24.74, 2)
    const geo = orbitSummary(ORBIT_PRESETS_KM.geostationary)
    expect(geo.speedEffectMicrosecondsPerDay).toBeCloseTo(-4.54, 2)
    expect(geo.gravityEffectMicrosecondsPerDay).toBeCloseTo(51.06, 2)
    expect(geo.netMicrosecondsPerDay).toBeCloseTo(46.51, 2)
  })

  it('km/h is the km/s speed times 3600 and the radius is altitude plus Earth radius', () => {
    const s = orbitSummary(20_200)
    expect(s.speedKmPerHour).toBeCloseTo(s.speedKmPerSecond * 3600, 6)
    expect(s.radiusKm).toBeCloseTo(26_571, 6)
    expect(altitudeToRadiusMeters(20_200)).toBeCloseTo(26_571_000, 3)
  })

  it('the unit conversion matches the module result', () => {
    const r = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    expect(microsecondsPerDay(r.netEffectFraction)).toBeCloseTo(r.netMicrosecondsPerDay, 9)
  })

  it('the balance altitude is half an Earth radius up, about 3,186 km, and has net zero', () => {
    expect(balanceAltitudeKm()).toBeCloseTo(EARTH_RADIUS_METERS / 2000, 6)
    expect(Math.round(balanceAltitudeKm())).toBe(3186)
    // The module uses the exact time-dilation factor, so the first-order balance is zero to about a millionth of a µs/day.
    expect(orbitSummary(balanceAltitudeKm()).netMicrosecondsPerDay).toBeCloseTo(0, 4)
    expect(orbitSummary(balanceAltitudeKm()).speedEffectMicrosecondsPerDay).toBeCloseTo(-20.05, 2)
    expect(orbitSummary(balanceAltitudeKm()).gravityEffectMicrosecondsPerDay).toBeCloseTo(20.05, 2)
  })

  it('the sweep covers the slider range, the speed slowing shrinks, gravity grows, and net crosses zero once', () => {
    const sweep = effectSweep()
    expect(sweep[0].altitudeKm).toBe(ALTITUDE_MIN_KM)
    expect(sweep[sweep.length - 1].altitudeKm).toBe(ALTITUDE_MAX_KM)
    for (let i = 1; i < sweep.length; i++) {
      expect(Math.abs(sweep[i].speedEffectMicrosecondsPerDay)).toBeLessThan(
        Math.abs(sweep[i - 1].speedEffectMicrosecondsPerDay)
      )
      expect(sweep[i].gravityEffectMicrosecondsPerDay).toBeGreaterThan(sweep[i - 1].gravityEffectMicrosecondsPerDay)
      expect(sweep[i].netMicrosecondsPerDay).toBeGreaterThan(sweep[i - 1].netMicrosecondsPerDay)
    }
    const crossings = sweep.filter((p, i) => i > 0 && Math.sign(p.netMicrosecondsPerDay) !== Math.sign(sweep[i - 1].netMicrosecondsPerDay))
    expect(crossings).toHaveLength(1)
    expect(hasBalanceAltitude()).toBe(true)
  })

  it('guess marks follow the guess and do not follow any real value', () => {
    const more = guessMarkers('more', 'yes', 'more')
    const less = guessMarkers('less', 'no', 'less')
    const same = guessMarkers('same', 'yes', 'same')
    // Guess 1: direction only, centred just below the speed curve.
    expect(more.speedTrend.microsecondsTo).toBeLessThan(more.speedTrend.microsecondsFrom)
    expect(less.speedTrend.microsecondsTo).toBeGreaterThan(less.speedTrend.microsecondsFrom)
    expect(same.speedTrend.microsecondsTo).toBe(same.speedTrend.microsecondsFrom)
    expect(Math.abs(more.speedTrend.microsecondsTo - more.speedTrend.microsecondsFrom)).toBeCloseTo(
      GUESS_LINE_TILT_MICROSECONDS,
      9
    )
    const midpoint = (more.speedTrend.microsecondsFrom + more.speedTrend.microsecondsTo) / 2
    expect(midpoint).toBeCloseTo(orbitSummary(11_000).speedEffectMicrosecondsPerDay + GUESS_LINE_OFFSET_MICROSECONDS, 9)
    // Guess 2: a flag on the zero line at a fixed altitude, whatever the answer.
    expect(more.balance.altitudeKm).toBe(GUESS_FLAG_ALTITUDE_KM)
    expect(more.balance.microseconds).toBe(0)
    expect(less.balance.altitudeKm).toBe(more.balance.altitudeKm)
    expect(less.balance.choice).toBe('no')
    // Guess 3: above, below, on the zero line at the GPS altitude.
    expect(more.gpsClock.altitudeKm).toBe(GUESS_RING_ALTITUDE_KM)
    expect(more.gpsClock.microseconds).toBe(GUESS_RING_HEIGHT_MICROSECONDS)
    expect(less.gpsClock.microseconds).toBe(-GUESS_RING_HEIGHT_MICROSECONDS)
    expect(same.gpsClock.microseconds).toBe(0)
  })

  it('the tutor marks each guess against the module values', () => {
    const right = tutorMarking('less', 'yes', 'more')
    expect(right.speedTrend.actual).toBe('less')
    expect(right.speedTrend.matches).toBe(true)
    expect(right.speedTrend.issMicroseconds).toBeCloseTo(-28.3, 1)
    expect(right.speedTrend.geostationaryMicroseconds).toBeCloseTo(-4.54, 2)
    expect(right.balance.actual).toBe('yes')
    expect(right.balance.matches).toBe(true)
    expect(Math.round(right.balance.altitudeKm)).toBe(3186)
    expect(right.gpsClock.actual).toBe('more')
    expect(right.gpsClock.matches).toBe(true)
    expect(right.gpsClock.netMicroseconds).toBeCloseTo(38.51, 2)
    const wrong = tutorMarking('more', 'no', 'less')
    expect(wrong.speedTrend.matches).toBe(false)
    expect(wrong.balance.matches).toBe(false)
    expect(wrong.gpsClock.matches).toBe(false)
    expect(tutorMarking('same', 'yes', 'same').speedTrend.matches).toBe(false)
  })

  it('the check-up rows compare the page with the published values', () => {
    const net = netFractionCheck()
    expect(net.expected).toBe(ASHBY_PUBLISHED.netFractionFaster)
    expect(net.found).toBeCloseTo(4.4576e-10, 14)
    expect(net.percentApart).toBeCloseTo(0.16, 2)
    const balance = balanceRadiusCheck()
    expect(balance.expected).toBe(9545)
    expect(balance.found).toBeCloseTo(9556.5, 6)
    expect(balance.percentApart).toBeCloseTo(0.12, 2)
    expect(gpsDirectionCheck()).toEqual({ expected: 'faster', found: 'faster', same: true })
    expect(lowOrbitDirectionCheck()).toEqual({ expected: 'slower', found: 'slower', same: true })
  })

  it('a clock error becomes a distance: about 300 m per microsecond, and 30 cm per nanosecond', () => {
    expect(distanceEquivalentKm(1)).toBeCloseTo(0.2998, 4)
    expect(distanceEquivalentKm(38.51)).toBeCloseTo(11.54, 1)
    expect(ashbyDistanceKm(1)).toBeCloseTo(0.3, 9)
    expect(ashbyDistanceKm(38.51)).toBeCloseTo(11.553, 3)
  })

  it('the worked numbers agree with the module and with the page\'s printed arithmetic', () => {
    const w = workedNumbers()
    const r = runGpsTimeDilationExperiment(GPS_ORBITAL_RADIUS_METERS)
    expect(w.speedMetersPerSecond).toBeCloseTo(3873, -1)
    expect(w.speedFractionApprox).toBeCloseTo(-8.35e-11, 13)
    expect(w.speedFractionApprox / r.speedEffectFraction).toBeCloseTo(1, 5)
    expect(w.gmOverCSquaredMeters).toBeCloseTo(4.435e-3, 6)
    expect(w.inverseRadiusDifferencePerMeter).toBeCloseTo(1.1932e-7, 10)
    expect(w.gravityFractionApprox).toBeCloseTo(5.29e-10, 12)
    expect(w.gravityFractionApprox).toBeCloseTo(r.gravityEffectFraction, 18)
    expect(w.speedMicroseconds + w.gravityMicroseconds).toBeCloseTo(w.netMicroseconds, 9)
  })
})
