import { useEffect, useMemo, useState } from 'react'

import { Sensor } from '@shared/types/Device'
import { Measurement } from '@shared/types/Measurement'

import {
  ModelName,
  getParams,
  getInitialState,
  KalmanFilter1D,
} from '../services/KalmanFilter'

export function useEstimates(
  measurements: Measurement[],
  modelInit: ModelName,
  sensor: Sensor,
  processNoiseInit = 0.5,
) {
  const [processNoise, setProcessNoise] = useState<number>(processNoiseInit)
  const [measurementNoise] = useState<number>(0.5) // TODO: incluir esta propriedade no Sensor (variance/stdDev da medida)
  const [model, setModel] = useState<ModelName>(modelInit)
  const params = useMemo(
    () => getParams(model, processNoise, measurementNoise),
    [model, processNoise, measurementNoise],
  )
  const [S, setS] = useState(getInitialState(params.order))

  useEffect(() => {
    setS(getInitialState(params.order))
  }, [model, params.order])

  const [estimates, setEstimates] = useState<
    { value: number; timestamp: number }[]
  >([])

  useEffect(() => {
    if (measurements.length > 0) {
      const start = measurements[0].timestamp

      const startIndex = estimates.findIndex((s) => s.timestamp === start)
      const remainingEstimates = estimates.slice(startIndex)

      if (measurements.length > remainingEstimates.length) {
        const newMeasurements = measurements.slice(remainingEstimates.length)

        const kf = new KalmanFilter1D(params, S)
        const { S: newS, estimates: newEstimates } = kf.steps(newMeasurements)

        setS(newS)
        setEstimates(remainingEstimates.concat(newEstimates))
      }
    }
  }, [measurements, processNoise, measurementNoise, params, S])

  return { estimates, model, setModel, processNoise, setProcessNoise }

  // useEffect(() => {
  //   if (measurements.length > estimates.length) {
  //     const kf = new KalmanFilter1D(params, S)

  //     const slice = measurements.slice(estimates.length)
  //     const { S: newS, estimates: newEstimates } = kf.steps(slice)

  //     setS(newS)
  //     setEstimates(estimates.concat(newEstimates))
  //   }
  // }, [measurements, processNoise, measurementNoise])
}
