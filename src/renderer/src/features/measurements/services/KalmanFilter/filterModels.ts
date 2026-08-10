import { add, multiply } from 'mathjs'

export type FilterModel = {
  label: string
  name: string
  type: string
  getParams: (
    processNoise: number,
    measurementNoise: number,
    w?: number,
    x0?: number,
  ) => {
    order: number
    F: (dt: number) => number[][]
    G: (dt: number) => number[][]
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
      G: (dt: number) => [[0]],
      Q: (dt: number) => [[processNoise * dt]],
      H: [[1]],
      R: [[measurementNoise]],
    }),
  },

  // States: [position, velocity]
  // We consider a process additive noise on position, velocity and acceleration.
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
      G: (dt: number) => [[0], [0]],
      Q: (dt: number) =>
        // Teste 2: considerando ruídos aditivos em todas as componentes do estado
        add(
          multiply(0.5 * processNoise, [
            [dt ** 4 / 4, dt ** 3 / 2],
            [dt ** 3 / 2, dt ** 2],
          ]),
          multiply(0.3 * processNoise, [
            [dt ** 2 / 2, dt],
            [dt, 1],
          ]),
          multiply(0.2 * processNoise, [
            [dt, 1],
            [1, 0],
          ]),
        ) as number[][],
      H: [[1, 0]],
      R: [[measurementNoise]],
    }),
  },

  // States: [position, velocity]
  // We consider a process additive noise on acceleration.
  'constant-velocity-strict': {
    label: 'Velocidade constante (estrita)',
    name: 'constant-velocity-strict',
    type: 'kalman-filter',
    getParams: (processNoise: number, measurementNoise: number) => ({
      order: 2,
      F: (dt: number) => [
        [1, dt],
        [0, 1],
      ],
      G: (dt: number) => [[0], [0]],
      Q: (dt: number) =>
        multiply(processNoise, [
          [dt ** 4 / 4, dt ** 3 / 2],
          [dt ** 3 / 2, dt ** 2],
        ]) as number[][],
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
      G: (dt: number) => [[0], [0], [0]],
      Q: (dt: number) =>
        add(
          multiply(0.5 * processNoise, [
            [dt ** 5 / 20, dt ** 4 / 8, dt ** 3 / 6],
            [dt ** 4 / 8, dt ** 3 / 3, dt ** 2 / 2],
            [dt ** 3 / 6, dt ** 2 / 2, dt],
          ]),
          multiply(0.3 * processNoise, [
            [dt ** 3 / 3, dt ** 2 / 2, 0],
            [dt ** 2 / 2, dt, 0],
            [0, 0, 0],
          ]),
          multiply(0.2 * processNoise, [
            [dt, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ]),
        ) as number[][],
      H: [[1, 0, 0]],
      R: [[measurementNoise]],
    }),
  },

  // States: [position, velocity, acceleration]
  // We consider a process additive noise on acceleration derivate.
  'constant-acceleration-strict': {
    label: 'Aceleração constante (estrita)',
    name: 'constant-acceleration-strict',
    type: 'kalman-filter',
    getParams: (processNoise: number, measurementNoise: number) => ({
      order: 3,
      F: (dt: number) => [
        [1, dt, 0.5 * dt * dt],
        [0, 1, dt],
        [0, 0, 1],
      ],
      G: (dt: number) => [[0], [0], [0]],
      Q: (dt: number) =>
        multiply(processNoise, [
          [dt ** 5 / 20, dt ** 4 / 8, dt ** 3 / 6],
          [dt ** 4 / 8, dt ** 3 / 3, dt ** 2 / 2],
          [dt ** 3 / 6, dt ** 2 / 2, dt],
        ]) as number[][],
      H: [[1, 0, 0]],
      R: [[measurementNoise]],
    }),
  },

  // States: [position, velocity, acceleration]
  // We consider a process additive noise on acceleration derivate.
  reparatory: {
    label: 'Força restauradora',
    name: 'reparatory',
    type: 'kalman-filter',
    getParams: (
      processNoise: number,
      measurementNoise: number,
      w = 1,
      x0 = 0,
    ) => ({
      order: 3,
      F: (dt: number) => [
        [1, dt, 0.5 * dt * dt],
        [-w * dt, 1, dt],
        [0, 0, 1],
      ],
      G: (dt: number) => [[0], [x0 * w * dt], [0]],
      Q: (dt: number) =>
        add(
          multiply(0.5 * processNoise, [
            [dt ** 5 / 20, dt ** 4 / 8, dt ** 3 / 6],
            [dt ** 4 / 8, dt ** 3 / 3, dt ** 2 / 2],
            [dt ** 3 / 6, dt ** 2 / 2, dt],
          ]),
          multiply(0.3 * processNoise, [
            [dt ** 3 / 3, dt ** 2 / 2, 0],
            [dt ** 2 / 2, dt, 0],
            [0, 0, 0],
          ]),
          multiply(0.2 * processNoise, [
            [dt, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ]),
        ) as number[][],
      H: [[1, 0, 0]],
      R: [[measurementNoise]],
    }),
  },
}
