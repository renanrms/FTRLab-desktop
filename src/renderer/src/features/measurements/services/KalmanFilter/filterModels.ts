import { add, multiply } from 'mathjs'

export type FilterModel = {
  label: string
  name: string
  type: string
  getParams: (
    processNoise: number,
    measurementNoise: number,
  ) => {
    order: number
    F: (dt: number) => number[][]
    Q: (dt: number) => number[][]
    H: number[][]
    R: number[][]
  }
}

export const filterModels: { [key: string]: FilterModel } = {
  // States: [position]
  // We consider a process additive noise on velocity.
  'constant-position': {
    label: 'Posição constante',
    name: 'constant-position',
    type: 'kalman-filter',
    getParams: (processNoise: number, measurementNoise: number) => ({
      order: 1,
      F: (dt: number) => [[1]],
      Q: (dt: number) => [[processNoise * dt]],
      H: [[1]],
      R: [[measurementNoise]],
    }),
  },

  // States: [position, velocity]
  // We consider a process additive noise on acceleration.
  // TODO: Testar ruído aditivo em todas as componentes do estado.
  'constant-velocity': {
    label: 'Velocidade constante',
    name: 'constant-velocity',
    type: 'kalman-filter',
    getParams: (processNoise: number, measurementNoise: number) => ({
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

          // Teste 2: considerando ruídos aditivos em todas as componentes do estado
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
    }),
  },

  // States: [position, velocity, acceleration]
  // We consider a process additive noise on acceleration derivate.
  // TODO: Testar ruído aditivo em todas as componentes do estado.
  'constant-acceleration': {
    label: 'Aceleração constante',
    name: 'constant-acceleration',
    type: 'kalman-filter',
    getParams: (processNoise: number, measurementNoise: number) => ({
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
    }),
  },
}
