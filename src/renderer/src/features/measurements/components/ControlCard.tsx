import { Dispatch, SetStateAction } from 'react'

import { Slider } from '@mui/material'

import { maxDisplayedTimeRange } from '../constants/maxDisplayedTimeRange'
import { formatTime } from '../utils/formatTime'

interface ControlCardProps {
  timeRange: number
  setTimeRange: Dispatch<SetStateAction<number>>
}

export function ControlCard(props: ControlCardProps) {
  return (
    <div className="w-full p-4 mb-4 border border-neutral-90 dark:border-neutral-30 rounded-md flex flex-col items-start justify-between bg-neutral-100 dark:bg-background text-on-background">
      <p className="mb-1">Janela de tempo: {formatTime(props.timeRange)}</p>
      <Slider
        defaultValue={maxDisplayedTimeRange}
        step={0.025}
        min={1}
        max={Math.log2(24 * 60 * 60)}
        // valueLabelFormat={(value) => `${value} s`}
        // valueLabelDisplay="auto"
        scale={(value) => Math.floor(2 ** value)}
        value={Math.log2(props.timeRange)}
        onChange={(event, value) => {
          props.setTimeRange(2 ** (value as number))
        }}
        size="small"
      />
    </div>
  )
}
