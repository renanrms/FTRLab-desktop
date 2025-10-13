import { useEffect, useState } from 'react'

import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import ExpandRoundedIcon from '@mui/icons-material/ExpandRounded'
import ScatterPlotRoundedIcon from '@mui/icons-material/ScatterPlotRounded'
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded'
import VerticalAlignBottomRoundedIcon from '@mui/icons-material/VerticalAlignBottomRounded'
import { Button, IconButton } from '@mui/material'
import { add, identity, inv, multiply, subtract, transpose } from 'mathjs'
import {
  CartesianGrid,
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { twMerge } from 'tailwind-merge'

import { Sensor } from '@shared/types/Device'
import { Measurement } from '@shared/types/Measurement'

import { useChartControls } from '../hooks/useChartControls'
import { useSensorMeasurements } from '../hooks/useSensorMeasurements'

interface ChartProps {
  className?: string
  XAxis: { key: string; name: string }
  YAxis: { key: string; name: string }
  sensor: Sensor
  timeRange: number
}

export function Chart(props: ChartProps) {
  const chartControls = useChartControls()
  const { measurements } = useSensorMeasurements(
    props.sensor.id,
    props.timeRange,
  )

  // Using a Linear Kalman Filter, assuming constant velocity model...

  const [x, setX] = useState<number[][]>([[measurements?.[0]?.value ?? 0], [0]]) // Initial state (position and velocity)

  const [P, setP] = useState([
    [1, 0],
    [0, 1],
  ]) // Initial Estimate Error Covariance

  const [estimates, setEstimates] = useState<
    { value: number; timestamp: number }[]
  >([])

  const F = (dt: number) => [
    [1, dt],
    [0, 1],
  ] // State Transition Matrix

  const Q = (dt: number, processVar: number) =>
    [
      [1, 0.5 * dt ** 2],
      [0, 1],
    ].map((row) => row.map((val) => val * processVar)) // Process Noise Covariance

  const H = [[1, 0]] // Observation Matrix

  const R = [[0.5]] // Measurement Noise Covariance

  function kalmanFilterEstimate(
    value: number,
    dt: number,
    xK: number[][],
    pK: number[][],
  ) {
    // Predict
    const xPredict = multiply(F(dt), xK) // Predicted state estimate
    const pPredict = add(
      multiply(multiply(F(dt), pK), transpose(F(dt))),
      Q(dt, 0.05),
    ) // Predicted estimate covariance

    // Correct
    const K = multiply(
      multiply(pPredict, transpose(H)),
      inv(add(multiply(multiply(H, pPredict), transpose(H)), R)),
    ) // Kalman Gain

    const aux = subtract(identity(2), multiply(K, H)) as number[][]
    const pEstimate = add(
      multiply(multiply(aux, pPredict), transpose(aux)),
      multiply(multiply(K, R), transpose(K)),
    ) // Updated estimate covariance
    const xEstimate = add(
      xPredict,
      multiply(K, subtract([[value]], multiply(H, xPredict))),
    ) // Updated state estimate

    console.log({ K, xPredict, pPredict, xEstimate, pEstimate })

    // mathjs may return DenseMatrix objects. Convert to plain arrays so calling
    // code can safely use xK[0][0] indexing.
    const xOut =
      typeof (xEstimate as any)?.valueOf === 'function'
        ? (xEstimate as any).valueOf()
        : xEstimate
    const pOut =
      typeof (pEstimate as any)?.valueOf === 'function'
        ? (pEstimate as any).valueOf()
        : pEstimate

    return { xK: xOut as number[][], pK: pOut as number[][] }
  }

  const kalmanFilterNewMeasurements = (
    newMeasurements: Measurement[],
    estimates: { value: number; timestamp: number }[],
    x0: number[][],
    p0: number[][],
  ) => {
    let [xK, pK] = [x0, p0]
    const newEstimates = newMeasurements.map((measurement) => {
      ;({ xK, pK } = kalmanFilterEstimate(
        measurement.value,
        measurement.timestamp -
          (estimates.length ? estimates[estimates.length - 1].timestamp : -100),
        xK,
        pK,
      ))

      console.log('xK after', xK)

      return { value: xK[0][0], timestamp: measurement.timestamp }
    })

    setX(xK)
    setP(pK)
    setEstimates(estimates.concat(newEstimates))
  }

  // When measurements arrive, initialize x if needed and feed new measurements to the Kalman filter
  useEffect(() => {
    let x0 = x
    let p0 = P

    // If we are initializing (no estimates yet), prepare local initial state
    if (measurements.length && estimates.length === 0) {
      x0 = [[measurements[0].value ?? 0], [0]]
      p0 = [
        [1, 0],
        [0, 1],
      ]
    }

    if (measurements.length > estimates.length) {
      console.log(
        'New data for Kalman Filter:',
        measurements.slice(estimates.length),
      )
      console.log('Current estimates:', estimates)
      kalmanFilterNewMeasurements(
        measurements.slice(estimates.length),
        estimates,
        x0,
        p0,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  return (
    <div
      className={twMerge(
        'p-4 pb-16 shadow border-2 border-secondary-90 dark:border-primary-30 bg-neutral-100 dark:bg-[#00000070] rounded-lg',
        props.className,
      )}
    >
      <div className="mb-2 ml-20 flex items-center">
        {/* <div className="rounded-full bg-neutral-98 dark:bg-neutral-20 border border-neutral-95 dark:border-neutral-30 flex items-center mr-4">
          <IconButton>
            <VerticalAlignBottomRoundedIcon
              sx={{
                fontSize: '22px',
                transform: 'rotate(-90deg)',
              }}
              />
            </IconButton>

            <IconButton>
            <ExpandRoundedIcon
            sx={{
                fontSize: '22px',
                transform: 'rotate(90deg)',
              }}
            />
          </IconButton>
        </div> */}
        <div className="rounded-full bg-neutral-98 dark:bg-neutral-20 border border-neutral-95 dark:border-neutral-30 flex items-center mr-6">
          <IconButton onClick={chartControls.ShowFromOriginYHandleClick}>
            <VerticalAlignBottomRoundedIcon
              className={twMerge(
                'rotate-180',
                chartControls.ShowFromOriginY
                  ? 'text-primary-60 dark:text-primary-70'
                  : 'dark:text-neutral-80',
              )}
              color="inherit"
              sx={{ fontSize: '22px' }}
            />
          </IconButton>

          <IconButton onClick={chartControls.showExpandedYHandleClick}>
            <ExpandRoundedIcon
              className={twMerge(
                chartControls.showExpandedY
                  ? 'text-primary-60 dark:text-primary-70'
                  : 'dark:text-neutral-80',
              )}
              color="inherit"
              sx={{ fontSize: '22px' }}
            />
          </IconButton>
        </div>
        <div className="rounded-full bg-neutral-98 dark:bg-neutral-20 border border-neutral-95 dark:border-neutral-30 flex items-center mr-6">
          <IconButton onClick={chartControls.showPointsHandleClick}>
            <ScatterPlotRoundedIcon
              className={twMerge(
                chartControls.showPoints
                  ? 'text-primary-60 dark:text-primary-70'
                  : 'dark:text-neutral-80',
              )}
              color="inherit"
              sx={{ fontSize: '22px' }}
            />
          </IconButton>

          <IconButton onClick={chartControls.showLinesHandleClick}>
            <ShowChartRoundedIcon
              className={twMerge(
                chartControls.showLines
                  ? 'text-primary-60 dark:text-primary-70'
                  : 'dark:text-neutral-80',
              )}
              sx={{ fontSize: '22px' }}
            />
          </IconButton>
        </div>

        <Button
          variant="outlined"
          className="h-[40px] rounded-full capitalize border bg-neutral-98 dark:bg-neutral-20 border-neutral-95 hover:bg-neutral-95 dark:hover:bg-neutral-30 text-primary-60 dark:text-primary-70 dark:border-neutral-30"
          title="Exportar medidas"
          onClick={() => {
            window.api.measurements.export({
              sensorId: props.sensor.id,
              timeRange: props.timeRange,
            })
          }}
        >
          <DownloadOutlinedIcon sx={{ fontSize: '22px' }} />
          <span className="mx-2">Exportar</span>
        </Button>
      </div>

      <ResponsiveContainer width="100%" height="100%" debounce={20}>
        <LineChart
          width={200}
          height={200}
          margin={{ top: 5, right: 5, left: 18, bottom: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={props.XAxis.key}
            type="number"
            tickCount={10}
            domain={([dataMin, dataMax]) => {
              const absMin = Math.floor(dataMin)
              const absMax = Math.ceil(dataMax)
              return [absMin, absMax]
            }}
          >
            <Label value={props.XAxis.name} offset={0} position="bottom" />
          </XAxis>
          <YAxis
            dataKey={props.YAxis.key}
            domain={
              chartControls.showExpandedY
                ? ([dataMin, dataMax]) => {
                    return [dataMin, dataMax]
                  }
                : undefined
            }
          >
            <Label
              value={props.YAxis.name}
              angle={-90}
              offset={-5}
              position="insideBottomLeft"
            />
          </YAxis>
          <Tooltip
            labelClassName="text-neutral-20"
            labelFormatter={(label: number, payload) =>
              `t: ${label.toFixed(6)}`
            }
          />
          <Line
            type="monotone"
            dataKey={props.YAxis.key}
            data={measurements}
            name={props.YAxis.name}
            dot={chartControls.showPoints}
            strokeWidth={2}
            strokeDasharray={chartControls.showLines ? undefined : '0 5'}
            stroke="var(--md-ref-palette-primary50)"
            fill="var(--md-ref-palette-primary70)"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey={props.YAxis.key}
            data={estimates}
            name={props.YAxis.name}
            dot={chartControls.showPoints}
            strokeWidth={2}
            strokeDasharray={chartControls.showLines ? undefined : '0 5'}
            stroke="var(--md-ref-palette-error50)"
            fill="var(--md-ref-palette-error70)"
            // stroke="var(--md-ref-palette-tertiary50)"
            // fill="var(--md-ref-palette-tertiary70)"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
