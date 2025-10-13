import { Device, SensorId } from './Device'
import { Measurement, MeasurementsBySensor } from './Measurement'

// Comunicação partindo do processo Main

export interface GetAllDevicesResponse {
  devices: Device[]
}

export interface DevicesInfoUpdateMessage {
  devices: Device[]
}

export interface MeasurementUpdateMessage {
  measurements: Measurement[]
  deviceId: string
}

export interface MeasurementNotifyMessage {
  sensorId: string
  measurements: Measurement[]
}

export interface GetMeasurementsRangeRequest {
  sensorId: string
  start?: number
  end?: number
}

export interface GetMeasurementsRangeResponse {
  measurements: Measurement[]
}

// Comunicação partindo do processo Renderer

export interface GetAppInfoResponse {
  appInfo: {
    startTime: number
    name: string
    version: string
  }
}

export interface OpenDeviceConnectionRequest {
  deviceId: string
}

export interface CloseDeviceConnectionRequest {
  deviceId: string
}

export interface FindAllMeasurementsByDeviceResponse {
  measurementsBySensor: MeasurementsBySensor
}
export interface FindAllMeasurementsByDeviceRequest {
  timeRange: number
}

export interface UpdateDeviceSettingsRequest {
  deviceId: string
}

export interface ExportMeasurementsRequest {
  sensorId: SensorId
  timeRange: number
}
