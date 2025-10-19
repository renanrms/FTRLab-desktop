import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import ExpandRoundedIcon from '@mui/icons-material/ExpandRounded'
import ScatterPlotRoundedIcon from '@mui/icons-material/ScatterPlotRounded'
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded'
import VerticalAlignBottomRoundedIcon from '@mui/icons-material/VerticalAlignBottomRounded'
import {
  Button,
  IconButton,
  Slider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
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

// Measurement type is not directly used here (removed import)
import { useChartControls } from '../hooks/useChartControls'
import { useEstimates } from '../hooks/useEstimates'
import { useSensorMeasurements } from '../hooks/useSensorMeasurements'
import { filterModels } from '../services/KalmanFilter'
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
  const {
    estimates,
    // estimatesD1,
    // estimatesD2,
    clearEstimates,
    model,
    setModel,
    processNoise,
    setProcessNoise,
    w,
    setW,
    x0,
    setX0,
  } = useEstimates(measurements, props.sensor, 0.5)

  return (
    <div
      className={twMerge(
        'p-4 pb-20 shadow border-2 border-secondary-90 dark:border-primary-30 bg-neutral-100 dark:bg-[#00000070] rounded-lg',
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
          className="h-[40px] mr-6 rounded-full capitalize border bg-neutral-98 dark:bg-neutral-20 border-neutral-95 hover:bg-neutral-95 dark:hover:bg-neutral-30 text-primary-60 dark:text-primary-70 dark:border-neutral-30"
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

        <div className="mr-6 flex items-center">
          <FormControl size="small" className="w-44 mr-4 text-sm">
            <InputLabel id={`model-select-label-${props.sensor.id}`}>
              Filtro
            </InputLabel>
            <Select
              labelId={`model-select-label-${props.sensor.id}`}
              value={model ? model.name : 'none'}
              label="Filtro"
              className="rounded-full text-sm"
              sx={{
                borderRadius: '9999px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRadius: '9999px',
                },
                '& .MuiSelect-select': {
                  borderRadius: '9999px',
                },
              }}
              onChange={(e) => {
                const val = e.target.value as string
                if (val === 'none') return setModel(null)
                const fm = filterModels[val]
                if (fm) setModel(fm)
              }}
            >
              <MenuItem className="text-sm" value="none">
                Nenhum
              </MenuItem>
              {Object.values(filterModels).map((fm) => (
                <MenuItem className="text-sm" key={fm.name} value={fm.name}>
                  {fm.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="w-40 mr-6">
            <Typography variant="caption">
              Q (processo): {processNoise}
            </Typography>
            <Slider
              value={processNoise}
              min={0}
              max={30}
              step={0.1}
              onChange={(_, v) => {
                setProcessNoise(v as number)
                clearEstimates()
              }}
              size="small"
            />
          </div>

          {model && model.name === 'reparatory' && (
            <>
              <div className="w-32 mr-6">
                <Typography variant="caption">w: {w}</Typography>
                <Slider
                  value={w}
                  min={0}
                  max={20}
                  step={0.1}
                  onChange={(_, v) => {
                    setW(v as number)
                    clearEstimates()
                  }}
                  size="small"
                />
              </div>

              <div className="w-32 mr-6">
                <Typography variant="caption">x0: {x0}</Typography>
                <Slider
                  value={x0}
                  min={0}
                  max={100}
                  step={0.1}
                  onChange={(_, v) => {
                    setX0(v as number)
                    clearEstimates()
                  }}
                  size="small"
                />
              </div>
            </>
          )}

          {/* <div className="w-36">
            <Typography variant="caption">
              R (medição): {measurementNoise}
            </Typography>
            <Slider
              value={measurementNoise}
              min={0}
              max={10}
              step={0.1}
              onChange={(_, v) => setMeasurementNoise(v as number)}
              size="small"
            />
          </div> */}
        </div>
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
                    const magnitude =
                      10 ** Math.floor(Math.log10(dataMax - dataMin)) / 100
                    dataMin = Math.floor(dataMin / magnitude) * magnitude
                    dataMax = Math.ceil(dataMax / magnitude) * magnitude
                    return [
                      Number(dataMin.toPrecision(4)),
                      Number(dataMax.toPrecision(4)),
                    ]
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
          {/* <Line
            type="monotone"
            dataKey={props.YAxis.key}
            data={estimatesD1}
            name={props.YAxis.name}
            dot={chartControls.showPoints}
            strokeWidth={2}
            strokeDasharray={chartControls.showLines ? undefined : '0 5'}
            stroke="var(--md-ref-palette-tertiary50)"
            fill="var(--md-ref-palette-tertiary70)"
            isAnimationActive={false}
          /> */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
