import { Device } from '@shared/types/Device'
import { MeasurementsBySensor } from '@shared/types/Measurement'

import { ChartContainer } from './ChartContainer'

interface ChartsAreaProps {
  devices: Device[]
  sensorMeasurements: MeasurementsBySensor
  timeRange: number
}

export function ChartsArea(props: ChartsAreaProps) {
  return (
    <main
      className="w-full px-4 pt-4 flex justify-evenly items-start flex-wrap overflow-y-auto overflow-hidden"
      style={{
        gridArea: 'main',
      }}
    >
      {props.devices
        .map((device) =>
          device.sensors.filter(
            (sensor) => device.connected || sensor.hasMeasurement,
          ),
        )
        .flat()
        .map((sensor) => (
          <ChartContainer
            sensor={sensor}
            measurements={props.sensorMeasurements[sensor.id]!}
            key={sensor.id}
            timeRange={props.timeRange}
          ></ChartContainer>
        ))}
    </main>
  )
}
