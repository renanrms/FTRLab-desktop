export type SensorId = string

export interface Sensor {
  id: SensorId
  index: string
  quantity: string
  method: string
  deviceId: string
  hasMeasurement?: boolean
}

export interface Device {
  id: string
  name?: string
  reachable: boolean
  available?: boolean
  connected?: boolean
  timeSynced: boolean
  battery?: {
    level: number
    charging: boolean
  }
  sensors: Sensor[]
  network: {
    address: string
    family: 'IPv4' | 'IPv6'
    port: number
  }
  updatedAt: Date
}
