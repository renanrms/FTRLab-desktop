import { useEffect, useMemo, useRef, useState } from 'react'

import { Sensor } from '@shared/types/Device'
import { Measurement } from '@shared/types/Measurement'

import {
  getInitialState,
  KalmanFilter1D,
  FilterModel,
} from '../services/KalmanFilter'

export function useEstimates(
  measurements: Measurement[],
  sensor: Sensor,
  processNoiseInit = 0.5,
) {
  const [processNoise, setProcessNoise] = useState<number>(processNoiseInit)
  const [measurementNoise] = useState<number>(0.5) // TODO: incluir esta propriedade no Sensor (variance/stdDev da medida)
  const [model, setModelState] = useState<FilterModel | null>(null)
  const params = useMemo(
    () => (model ? model.getParams(processNoise, measurementNoise) : null),
    [model, processNoise, measurementNoise],
  )
  const [S, setS] = useState(() =>
    params ? getInitialState(params.order) : null,
  )

  // refs for synchronous KF swapping
  const kfRef = useRef<KalmanFilter1D | null>(null)
  const sRef = useRef<any | null>(null)

  useEffect(() => {
    if (!params) {
      setS(null)
      kfRef.current = null
      sRef.current = null
      return
    }
    const initial = getInitialState(params.order)
    setS(initial)
    sRef.current = initial
    kfRef.current = new KalmanFilter1D(params, initial)
  }, [model, params])

  const [estimates, setEstimates] = useState<
    { value: number; timestamp: number }[]
  >([])

  const kalmanFilter = kfRef.current

  useEffect(() => {
    if (!params || !kfRef.current || measurements.length === 0) {
      setEstimates([])
      return
    }

    const start = measurements[0].timestamp

    const startIndex = estimates.findIndex((s) => s.timestamp === start)
    const remainingEstimates =
      startIndex >= 0 ? estimates.slice(startIndex) : []

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
        kfRef.current!.steps(newMeasurements)

      // update refs synchronously, then update state
      sRef.current = newS
      kfRef.current = new KalmanFilter1D(params, newS)
      setS(newS)
      setEstimates(remainingEstimates.concat(newEstimates))
    }
  }, [
    measurements,
    processNoise,
    measurementNoise,
    params,
    kalmanFilter,
    estimates,
  ])

  return {
    estimates,
    setEstimates,
    model,
    setModel: (m: FilterModel | null) => {
      // synchronous swap: reset KF refs immediately then update state
      if (!m) {
        kfRef.current = null
        sRef.current = null
        setS(null)
        setModelState(null)
        setEstimates([])
        return
      }

      const p = m.getParams(processNoise, measurementNoise)
      const initial = getInitialState(p.order)
      kfRef.current = new KalmanFilter1D(p, initial)
      sRef.current = initial
      setS(initial)
      setModelState(m)
      setEstimates([])
    },
    processNoise,
    setProcessNoise,
    kalmanFilter,
    S,
  }
}
