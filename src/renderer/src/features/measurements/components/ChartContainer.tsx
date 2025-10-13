import { quantities } from '@renderer/constants/quantities'
import { Sensor } from '@shared/types/Device'

import { Chart } from './Chart'

interface ChartContainerProps {
  sensor: Sensor
  timeRange: number
}

export function ChartContainer(props: ChartContainerProps) {
  // Obter o sensor

  const quantity = quantities[props.sensor.quantity]

  const serie = {
    XAxis: { key: 'timestamp', name: 'Tempo (s)' },
    YAxis: {
      key: 'value',
      name: quantity
        ? `${quantity.name} (${quantity.defaultUnit.symbol})`
        : props.sensor.quantity,
    },
  }

  return (
    <Chart
      className="w-full h-[350px] m-2"
      XAxis={serie.XAxis}
      YAxis={serie.YAxis}
      sensor={props.sensor}
      timeRange={props.timeRange}
    ></Chart>
  )
}
