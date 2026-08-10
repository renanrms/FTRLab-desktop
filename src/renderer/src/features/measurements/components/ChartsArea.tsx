import { Device } from '@shared/types/Device'

import { ChartContainer } from './ChartContainer'

interface ChartsAreaProps {
  devices: Device[]
  timeRange: number
}

export function ChartsArea(props: ChartsAreaProps) {
  const sensors = props.devices
    .map((device) =>
      device.sensors.filter(
        (sensor) => device.connected || sensor.hasMeasurement,
      ),
    )
    .flat()

  return (
    <main
      className="w-full px-4 pt-4 flex justify-evenly items-start flex-wrap overflow-y-auto overflow-hidden"
      style={{
        gridArea: 'main',
      }}
    >
      {sensors.map((sensor) => (
        <ChartContainer
          sensor={sensor}
          key={sensor.id}
          timeRange={props.timeRange}
        ></ChartContainer>
      ))}
    </main>
  )
}
