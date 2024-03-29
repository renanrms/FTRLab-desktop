import { startTime } from '@main/constants/startTime'
import { Measurement } from '@shared/types/Measurement'

/**
 * Transforma uma medição para tempo relativo ao início do app.
 *
 * Deve ser usada apenas no processo main.
 */
export function transformToRelativeTime(measurement: Measurement) {
  return {
    ...measurement,
    timestamp: measurement.timestamp - startTime,
  }
}
