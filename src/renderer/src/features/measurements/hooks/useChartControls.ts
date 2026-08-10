import { useState } from 'react'

export function useChartControls() {
  const [showPoints, setShowPoints] = useState(false)
  const [showLines, setShowLines] = useState(true)

  const showPointsHandleClick = () => {
    if (showPoints && !showLines) {
      setShowPoints(!showPoints)
      setShowLines(!showLines)
    } else {
      setShowPoints(!showPoints)
    }
  }

  const showLinesHandleClick = () => {
    if (showLines && !showPoints) {
      setShowLines(!showLines)
      setShowPoints(!showPoints)
    } else {
      setShowLines(!showLines)
    }
  }

  const [showExpandedY, setShowExpandedY] = useState(false)
  const [showFromOriginY, setShowFromOriginY] = useState(true)

  const showExpandedYHandleClick = () => {
    setShowExpandedY(!showExpandedY)
    setShowFromOriginY(!showFromOriginY)
  }

  const showFromOriginYHandleClick = () => {
    setShowFromOriginY(!showFromOriginY)
    setShowExpandedY(!showExpandedY)
  }

  const [showDerivate, setShowDerivate] = useState(false)

  const showDerivateHandleClick = () => {
    setShowDerivate(!showDerivate)
  }

  return {
    showPoints,
    showLines,
    showPointsHandleClick,
    showLinesHandleClick,
    showExpandedY,
    showFromOriginY,
    showExpandedYHandleClick,
    showFromOriginYHandleClick,
    showDerivate,
    showDerivateHandleClick,
  }
}
