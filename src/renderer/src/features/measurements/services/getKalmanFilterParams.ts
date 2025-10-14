import { identity } from 'mathjs'

import { KalmanFilterParams, KalmanFilterState } from './KalmanFilter'

type ModelName =
  | 'constante-position'
  | 'constante-velocity'
  | 'constant-acceleration'

/**
 * Retorna parâmetros compatíveis com o construtor KalmanFilter1D.
 * model: 'constante-position' (posição constante),
 *        'constante-velocity' (velocidade constante),
 *        'constant-acceleration' (aceleração constante)
 */
export default function getKalmanFilterParams(
  model: ModelName,
  processNoise: number,
  measurementNoise: number,
): KalmanFilterParams {
  switch (model) {
    case 'constante-position': {
      // Simple model: position is constant (velocity ~ 0)
      const F = (dt: number) => [[1]]

      const Q = (dt: number) => [[1e-2 * processNoise * dt]]

      const H = [[1]]
      const R = [[0.01 * measurementNoise]]

      const S0: KalmanFilterState = {
        x: [[0]], // posição
        P: identity(1) as number[][],
        t: -Date.now() / 1000,
      }

      return { F, Q, H, R, S0 }
    }

    case 'constante-velocity': {
      // Constant velocity model: position and velocity state
      const F = (dt: number) => [
        [1, dt],
        [0, 1],
      ]

      const Q = (dt: number) => {
        // Process noise for constant velocity model
        const q = processNoise
        return [
          [(dt ** 3 / 3) * q, (dt ** 2 / 2) * q],
          [(dt ** 2 / 2) * q, dt * q],
        ]
        // return [
        //   [q, q * dt ** 2],
        //   [0, q],
        // ]
      }

      const H = [[1, 0]]
      const R = [[measurementNoise]]

      const S0: KalmanFilterState = {
        x: [[0], [0]], // posição, velocidade
        P: identity(2) as number[][],
        t: -Date.now() / 1000,
      }

      return { F, Q, H, R, S0 }
    }

    case 'constant-acceleration': {
      // Keep 2-state model but increase process noise to emulate acceleration
      const F = (dt: number) => [
        [1, dt],
        [0, 1],
      ]

      const Q = (dt: number) => {
        // larger process noise to account for unmodeled acceleration
        const q11 = dt ** 3 / 3
        const q12 = dt ** 2 / 2
        const q22 = dt
        return [
          [q11 * 1 * processNoise, q12 * 1 * processNoise],
          [q12 * 1 * processNoise, q22 * 1 * processNoise],
        ]
      }

      const H = [[1, 0]]
      const R = [[5e-2 * measurementNoise]]

      const S0: KalmanFilterState = {
        x: [[0], [0]], // posição, velocidade
        P: identity(2) as number[][],
        t: -Date.now() / 1000,
      }

      return { F, Q, H, R, S0 }
    }

    default:
      // fallback to constant velocity
      return getKalmanFilterParams(
        'constante-velocity',
        processNoise,
        measurementNoise,
      )
  }
}
