import { add, identity, inv, multiply, subtract, transpose } from 'mathjs'

import { Measurement } from '@shared/types/Measurement'

export interface KalmanFilterState {
  x: number[][]
  P: number[][]
  t: number
}

export interface KalmanFilterParams {
  order: number
  F: (dt: number) => number[][]
  Q: (dt: number) => number[][]
  H: number[][]
  R: number[][]
}

export class KalmanFilter1D {
  order: number
  F: KalmanFilterParams['F']
  Q: KalmanFilterParams['Q']
  H: KalmanFilterParams['H']
  R: KalmanFilterParams['R']
  S: KalmanFilterState

  constructor(params: KalmanFilterParams, initialState: KalmanFilterState) {
    this.order = params.order
    this.F = params.F
    this.Q = params.Q
    this.H = params.H
    this.R = params.R
    this.S = initialState
  }

  predict(t: number): KalmanFilterState {
    const dt = t - this.S.t
    const F = this.F(dt)
    const Q = this.Q(dt)

    // Predição do estado
    const x = multiply(F, this.S.x)
    const P = add(multiply(multiply(F, this.S.P), transpose(F)), Q)

    return { x, P, t }
  }

  estimate(t: number, z: number, Se: KalmanFilterState): KalmanFilterState {
    const K = multiply(
      multiply(Se.P, transpose(this.H)),
      inv(add(multiply(multiply(this.H, Se.P), transpose(this.H)), this.R)),
    ) // Kalman Gain

    const aux = subtract(
      identity(this.order),
      multiply(K, this.H),
    ) as number[][]
    const pEstimate = add(
      multiply(multiply(aux, Se.P), transpose(aux)),
      multiply(multiply(K, this.R), transpose(K)),
    ) // Updated estimate covariance
    const xEstimate = add(
      Se.x,
      multiply(K, subtract([[z]], multiply(this.H, Se.x))),
    ) // Updated state estimate

    console.log({ K, Se, xEstimate, pEstimate })

    // mathjs may return DenseMatrix objects. Convert to plain arrays so calling
    // code can safely use xK[0][0] indexing.
    const xOut =
      typeof (xEstimate as any)?.valueOf === 'function'
        ? (xEstimate as any).valueOf()
        : xEstimate
    const pOut =
      typeof (pEstimate as any)?.valueOf === 'function'
        ? (pEstimate as any).valueOf()
        : pEstimate

    return { x: xOut, P: pOut, t }
  }

  step(
    t: number,
    z: number,
  ): { S: KalmanFilterState; estimate: Omit<Measurement, 'sensorId'> } {
    const Se = this.predict(t)
    this.S = this.estimate(t, z, Se)

    return { S: this.S, estimate: { value: this.S.x[0][0], timestamp: t } }
  }

  steps(measurements: Omit<Measurement, 'sensorId'>[]): {
    S: KalmanFilterState
    estimates: Omit<Measurement, 'sensorId'>[]
  } {
    const estimates: Omit<Measurement, 'sensorId'>[] = []
    measurements.forEach((m) => {
      const { estimate } = this.step(m.timestamp, m.value)
      estimates.push(estimate)
    })
    return { S: this.S, estimates }
  }
}
