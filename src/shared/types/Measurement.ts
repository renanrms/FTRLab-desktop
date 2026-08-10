import { SensorId } from './Device'

export type DeviceMeasurement = [
  sensorIndex: string,
  timestamp: number,
  value: number,
]

export interface Measurement {
  sensorId: string
  timestamp: number
  value: any
}

export interface Measure {
  timestamp: number
  value: any
}

export type MeasurementsBySensor = Record<SensorId, Measurement[] | undefined>
