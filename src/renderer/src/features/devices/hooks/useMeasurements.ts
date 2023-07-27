import { useEffect, useState } from 'react'

import { Measurement, MeasurementsBySensor } from '@shared/types/Measurement'

import { transformToRelativeTime } from '../utils/transformToRelativeTime'

export function useMeasurements() {
  const [sensorMeasurements, setSensorMeasurements] =
    useState<MeasurementsBySensor>({})

  useEffect(() => {
    window.api.measurements.getAll().then(async ({ measurements }) => {
      const receivedMeasurements: { [x: string]: Measurement[] } = {}

      measurements
        .map(transformToRelativeTime)
        .sort((a, b) => a.timestamp - b.timestamp)
        .forEach((measurement) => {
          receivedMeasurements[measurement.sensorId] = receivedMeasurements[
            measurement.sensorId
          ]?.concat([measurement]) || [measurement]
        })

      setSensorMeasurements(receivedMeasurements)
    })

    const removeListener = window.api.measurements.onUpdate(
      async (event, params) => {
        const receivedMeasurements: { [x: string]: Measurement[] } = {}

        params.measurements
          .map(transformToRelativeTime)
          .forEach((measurement) => {
            console.log(measurement)

            receivedMeasurements[measurement.sensorId] = receivedMeasurements[
              measurement.sensorId
            ]?.concat([measurement]) || [measurement]
          })

        setSensorMeasurements((state) => {
          const newState = { ...state }

          Object.keys(receivedMeasurements).forEach((sensorId) => {
            newState[sensorId] =
              newState[sensorId]?.concat(receivedMeasurements[sensorId]) ||
              receivedMeasurements[sensorId]
            newState[sensorId]?.sort((a, b) => a.timestamp - b.timestamp)
          })

          return newState
        })
      },
    )

    return removeListener
  }, [])

  const clearMeasurements = async () => {
    await window.api.measurements.deleteAll()
    setSensorMeasurements({})
  }

  return { sensorMeasurements, clearMeasurements }
}
