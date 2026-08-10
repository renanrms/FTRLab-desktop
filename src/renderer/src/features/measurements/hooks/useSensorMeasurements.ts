import { useEffect, useState } from 'react'

import { maxDisplayedTimeRange } from '@renderer/features/measurements/constants/maxDisplayedTimeRange'
import { Measurement } from '@shared/types/Measurement'

import { transformToRelativeTime } from '../../devices/utils/transformToRelativeTime'

export function useSensorMeasurements(sensorId: string, timeRange?: number) {
  const [measurements, setMeasurements] = useState<Measurement[]>([])

  useEffect(() => {
    if (!sensorId) return

    const displayedTimeRange = timeRange
      ? Math.min(timeRange, maxDisplayedTimeRange)
      : undefined

    // Initial load: if timeRange provided, query range from now - timeRange to now
    const now = Date.now()
    const req: any = { sensorId }
    if (typeof displayedTimeRange === 'number') {
      req.start = now - displayedTimeRange
      req.end = now
    }

    window.api.measurements.getRange(req).then(({ measurements: m }) => {
      setMeasurements(m.map(transformToRelativeTime))
    })

    const removeListener = window.api.measurements.onNotify(
      sensorId,
      (event, msg) => {
        if (!msg || msg.sensorId !== sensorId) return

        const received = msg.measurements.map(transformToRelativeTime)

        setMeasurements((state) => {
          const newState = state.concat(received)
          newState.sort((a, b) => a.timestamp - b.timestamp)

          if (typeof displayedTimeRange === 'number' && newState.length) {
            const threshold = newState.at(-1)!.timestamp - displayedTimeRange
            const startIndex = newState.findIndex(
              (s) => s.timestamp > threshold,
            )
            return newState.slice(startIndex)
          }

          return newState
        })
      },
    )

    return removeListener
  }, [sensorId, timeRange])

  const clear = async () => setMeasurements([])

  return { measurements, clear }
}
