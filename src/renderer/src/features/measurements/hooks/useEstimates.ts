import { useEffect, useMemo, useState } from 'react'

import { Sensor } from '@shared/types/Device'
import { Measurement } from '@shared/types/Measurement'

import {
  getInitialState,
  KalmanFilter1D,
  FilterModel,
} from '../services/KalmanFilter'

export function useEstimates(
  measurements: Measurement[],
  filterModelInit: FilterModel,
  sensor: Sensor,
  processNoiseInit = 0.5,
) {
  const [processNoise, setProcessNoise] = useState<number>(processNoiseInit)
  const [measurementNoise] = useState<number>(0.5) // TODO: incluir esta propriedade no Sensor (variance/stdDev da medida)
  const [model, setModel] = useState(filterModelInit)
  const params = useMemo(
    () => model.getParams(processNoise, measurementNoise),
    [model, processNoise, measurementNoise],
  )
  const [S, setS] = useState(getInitialState(params.order))

  useEffect(() => {
    setS(getInitialState(params.order))
  }, [model, params.order])

  const [estimates, setEstimates] = useState<
    { value: number; timestamp: number }[]
  >([])

  const kalmanFilter = useMemo(() => new KalmanFilter1D(params, S), [params, S])

  useEffect(
    () => {
      if (measurements.length > 0) {
        const start = measurements[0].timestamp

        const startIndex = estimates.findIndex((s) => s.timestamp === start)
        const remainingEstimates = estimates.slice(startIndex)

        if (measurements.length > remainingEstimates.length) {
          const newMeasurements = measurements.slice(remainingEstimates.length)

          const firstNewMeasurement = newMeasurements[0]
          const lastEstimate = estimates.at(-1)
          if (
            lastEstimate &&
            firstNewMeasurement.timestamp < lastEstimate.timestamp
          ) {
            console.warn(
              `New measurement timestamp ${firstNewMeasurement.timestamp} is older than last estimate timestamp ${lastEstimate.timestamp}. Resetting estimates.`,
            )
            setS(getInitialState(params.order))
            setEstimates([])
            return
          }

          const { S: newS, estimates: newEstimates } =
            kalmanFilter.steps(newMeasurements)

          setS(newS)
          setEstimates(remainingEstimates.concat(newEstimates))
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [measurements, processNoise, measurementNoise, params, kalmanFilter],
  )

  return {
    estimates,
    setEstimates,
    model,
    setModel,
    processNoise,
    setProcessNoise,
    kalmanFilter,
  }

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
