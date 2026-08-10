import { useEffect, useMemo, useRef, useState } from 'react'

import { Sensor } from '@shared/types/Device'
import { Measure, Measurement } from '@shared/types/Measurement'

import {
  getInitialState,
  KalmanFilter1D,
  FilterModel,
} from '../services/KalmanFilter'

export function useEstimates(
  measurements: Measurement[],
  sensor: Sensor,
  processNoiseInit = 1,
) {
  const [processNoise, setProcessNoise] = useState<number>(processNoiseInit)
  const [measurementNoise] = useState<number>(0.5) // TODO: incluir esta propriedade no Sensor (variance/stdDev da medida)
  const [model, setModelState] = useState<FilterModel | null>(null)
  const [w, setW] = useState<number>(1)
  const [x0, setX0] = useState<number>(0)
  const params = useMemo(
    () =>
      model ? model.getParams(processNoise, measurementNoise, w, x0) : null,
    [model, processNoise, measurementNoise, w, x0],
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

  const [estimates, setEstimates] = useState<Measure[]>([])
  const [estimatesD1, setEstimatesD1] = useState<Measure[]>([])
  const [estimatesD2, setEstimatesD2] = useState<Measure[]>([])

  const clearEstimates = () => {
    setEstimates([])
    setEstimatesD1([])
    setEstimatesD2([])
  }

  const kalmanFilter = kfRef.current

  useEffect(() => {
    if (!params || !kfRef.current || measurements.length === 0) {
      clearEstimates()
      return
    }

    const start = measurements[0].timestamp
    const startIndex = estimates.findIndex((s) => s.timestamp === start)

    const remaining = startIndex !== -1 ? estimates.slice(startIndex) : []
    const remainingD1 = startIndex !== -1 ? estimatesD1.slice(startIndex) : []
    const remainingD2 = startIndex !== -1 ? estimatesD2.slice(startIndex) : []

    if (measurements.length > remaining.length) {
      const newMeasurements = measurements.slice(remaining.length)

      const firstNewMeasurement = newMeasurements[0]
      const lastEstimate = estimates.at(-1)

      // Verify if new measurements are not older than last estimate. If so, reset all.
      if (
        lastEstimate &&
        firstNewMeasurement.timestamp < lastEstimate.timestamp
      ) {
        console.warn(
          `New measurement timestamp ${firstNewMeasurement.timestamp} is older than last estimate timestamp ${lastEstimate.timestamp}. Resetting estimates.`,
        )
        setS(getInitialState(params.order))
        clearEstimates()
        return
      }

      // Predict and Estimate state
      const {
        S: newS,
        estimates: newEstimates,
        estimatesD1: newEstimatesD1,
        estimatesD2: newEstimatesD2,
      } = kfRef.current!.steps(newMeasurements)

      // update refs synchronously, then update state
      sRef.current = newS
      kfRef.current = new KalmanFilter1D(params, newS)
      setS(newS)
      setEstimates(remaining.concat(newEstimates))
      setEstimatesD1(remainingD1.concat(newEstimatesD1 || []))
      setEstimatesD2(remainingD2.concat(newEstimatesD2 || []))
    }
  }, [
    measurements,
    processNoise,
    measurementNoise,
    params,
    kalmanFilter,
    estimates,
    estimatesD1,
    estimatesD2,
  ])

  return {
    estimates,
    estimatesD1,
    estimatesD2,
    clearEstimates,
    processNoise,
    setProcessNoise,
    kalmanFilter,
    w,
    setW,
    x0,
    setX0,
    S,
    model,
    setModel: (m: FilterModel | null) => {
      // synchronous swap: reset KF refs immediately then update state
      if (!m) {
        kfRef.current = null
        sRef.current = null
        setS(null)
        setModelState(null)
        clearEstimates()
        return
      }

      const p = m.getParams(processNoise, measurementNoise)
      const initial = getInitialState(p.order)
      kfRef.current = new KalmanFilter1D(p, initial)
      sRef.current = initial
      setS(initial)
      setModelState(m)
      clearEstimates()
    },
  }
}
