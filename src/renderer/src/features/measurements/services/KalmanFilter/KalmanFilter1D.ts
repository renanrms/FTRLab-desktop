import {
  add,
  identity,
  inv,
  MathCollection,
  multiply,
  subtract,
  transpose,
} from 'mathjs'

import { Measure } from '@shared/types/Measurement'

export interface KalmanFilterState {
  x: number[][]
  P: number[][]
  t: number
}

export interface KalmanFilterParams {
  order: number
  F: (dt: number) => number[][]
  G: (dt: number) => number[][]
  Q: (dt: number) => number[][]
  H: number[][]
  R: number[][]
}

export class KalmanFilter1D {
  order: number
  F: KalmanFilterParams['F']
  G: KalmanFilterParams['G']
  Q: KalmanFilterParams['Q']
  H: KalmanFilterParams['H']
  R: KalmanFilterParams['R']
  S: KalmanFilterState

  constructor(params: KalmanFilterParams, initialState: KalmanFilterState) {
    this.order = params.order
    this.F = params.F
    this.G = params.G
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
    const x = add(multiply(F, this.S.x), this.G(dt))
    const P = add(multiply(multiply(F, this.S.P), transpose(F)), Q)

    return { x, P, t }
  }

  estimate(t: number, z: number, Se: KalmanFilterState): KalmanFilterState {
    const K = multiply(
      Se.P,
      transpose(this.H),
      inv(
        add(
          multiply(this.H, Se.P, transpose(this.H)) as MathCollection,
          this.R,
        ),
      ),
    ) as MathCollection // Kalman Gain

    const aux = subtract(
      identity(this.order),
      multiply(K, this.H),
    ) as number[][]
    const pEstimate = add(
      multiply(aux, Se.P, transpose(aux)),
      multiply(K, this.R, transpose(K)),
    ) // Updated estimate covariance
    const xEstimate = add(
      Se.x,
      multiply(K, subtract([[z]], multiply(this.H, Se.x))),
    ) // Updated state estimate

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
  ): {
    S: KalmanFilterState
    estimate: Measure
    estimateD1?: Measure
    estimateD2?: Measure
  } {
    const Se = this.predict(t)
    this.S = this.estimate(t, z, Se)

    return {
      S: this.S,
      estimate: { value: this.S.x[0][0], timestamp: t },
      estimateD1: { value: this.S.x[1]?.[0], timestamp: t },
      estimateD2: { value: this.S.x[2]?.[0], timestamp: t },
    }
  }

  steps(measurements: Measure[]): {
    S: KalmanFilterState
    estimates: Measure[]
    estimatesD1?: Measure[]
    estimatesD2?: Measure[]
  } {
    const estimates: Measure[] = []
    const estimatesD1 = [] as Measure[]
    const estimatesD2 = [] as Measure[]
    measurements.forEach((m) => {
      const { estimate, estimateD1, estimateD2 } = this.step(
        m.timestamp,
        m.value,
      )
      estimates.push(estimate)
      estimateD1 && estimatesD1.push(estimateD1)
      estimateD2 && estimatesD2.push(estimateD2)
    })
    return {
      S: this.S,
      estimates,
      estimatesD1: estimatesD1.length !== 0 ? estimatesD1 : undefined,
      estimatesD2: estimatesD2.length !== 0 ? estimatesD2 : undefined,
    }
  }
}
