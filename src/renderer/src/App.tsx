import './styles/global.css'

import { useState } from 'react'

import { Header } from './components/Header'
import { ReactQueryProvider } from './components/providers/ReactQueryProvider'
import { ThemeProvider } from './components/providers/ThemeProvider'
import { Sidebar } from './components/Sidebar'
import { useDevices } from './features/devices/hooks/useDevices'
import { ChartsArea } from './features/measurements/components/ChartsArea'
import { clearMeasurements } from './features/measurements/services/clearMeasurements'

export function App() {
  const [timeRange, setTimeRange] = useState<number>(45)
  const devices = useDevices()
  // const { clearMeasurements } = useMeasurements(timeRange)

  return (
    <ReactQueryProvider>
      <ThemeProvider>
        <div
          className="w-screen h-screen bg-background"
          style={{
            display: 'grid',
            gridTemplateAreas: '"header header" "aside main"',
            gridTemplateRows: '48px auto',
          }}
        >
          <Header clearMeasurements={clearMeasurements}></Header>
          <Sidebar
            devices={devices}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          ></Sidebar>
          <ChartsArea devices={devices} timeRange={timeRange}></ChartsArea>
        </div>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
