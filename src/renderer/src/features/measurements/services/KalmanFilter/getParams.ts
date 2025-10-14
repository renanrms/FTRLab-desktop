import { add, multiply } from 'mathjs'

import { KalmanFilterParams } from './KalmanFilter1D'

export type ModelName =
  | 'constant-position'
  | 'constant-velocity'
  | 'constant-acceleration'

/**
 * Retorna parâmetros compatíveis com o construtor KalmanFilter1D.
 * model: 'constante-position' (posição constante),
 *        'constante-velocity' (velocidade constante),
 *        'constant-acceleration' (aceleração constante)
 */
export function getParams(
  model: ModelName,
  processNoise: number,
  measurementNoise: number,
): KalmanFilterParams {
  switch (model) {
    case 'constant-position': {
      // 1-state model: position is constant.
      // States: [position]
      // We consider a process additive noise on velocity.
      return {
        order: 1,
        F: (dt: number) => [[1]],
        Q: (dt: number) => [[processNoise * dt]],
        H: [[1]],
        R: [[measurementNoise]],
      }
    }

    case 'constant-velocity': {
      // 2-state model: velocity is constant.
      // States: [position, velocity]
      // We consider a process additive noise on acceleration.
      // TODO: Testar ruído aditivo em todas as componentes do estado.
      return {
        order: 2,
        F: (dt: number) => [
          [1, dt],
          [0, 1],
        ],
        Q: (dt: number) => {
          const q = processNoise
          return multiply(
            q,
            // Teste 1: matriz de covariância do modelo de movimento Browniano (Wiener) integrado duas vezes
            // [
            //   [dt ** 4 / 4, dt ** 3 / 2],
            //   [dt ** 3 / 2, dt ** 2],
            // ],

            // Teste 2: outra matriz ad-hoc que também funciona
            // [
            //   [1, dt ** 2],
            //   [0, 1],
            // ]

            // Teste 3: considerando ruídos aditivos em todas as componentes do estado
            add(
              [
                [dt ** 4 / 4, dt ** 3 / 2],
                [dt ** 3 / 2, dt ** 2],
              ],
              add(
                [
                  [dt ** 2 / 2, dt],
                  [dt, 1],
                ],
                [
                  [dt, 1],
                  [1, 0],
                ],
              ),
            ),
          ) as number[][]
        },
        H: [[1, 0]],
        R: [[measurementNoise]],
      }
    }

    case 'constant-acceleration': {
      // 3-state model: acceleration is constant.
      // States: [position, velocity, acceleration]
      // We consider a process additive noise on acceleration derivate.
      // TODO: Testar ruído aditivo em todas as componentes do estado.
      return {
        order: 3,
        F: (dt: number) => [
          [1, dt, 0.5 * dt * dt],
          [0, 1, dt],
          [0, 0, 1],
        ],
        Q: (dt: number) => {
          const q = processNoise
          return [
            [(dt ** 5 / 20) * q, (dt ** 4 / 8) * q, (dt ** 3 / 6) * q],
            [(dt ** 4 / 8) * q, (dt ** 3 / 3) * q, (dt ** 2 / 2) * q],
            [(dt ** 3 / 6) * q, (dt ** 2 / 2) * q, dt * q],
          ]
        },
        H: [[1, 0, 0]],
        R: [[measurementNoise]],
      }
    }

    default:
      // fallback to constant velocity
      return getParams('constant-velocity', processNoise, measurementNoise)
  }
}
