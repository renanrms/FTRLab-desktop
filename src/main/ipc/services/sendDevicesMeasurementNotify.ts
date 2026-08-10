import { CHANNELS } from '@shared/constants/channels'
import { MeasurementNotifyMessage } from '@shared/types/ipc'

import { sendIpcMessage } from '../sendIpcMessage'

export function sendMeasurementNotify(message: MeasurementNotifyMessage) {
  sendIpcMessage(
    CHANNELS.MEASUREMENTS.NOTIFY(message.sensorId),
    message,
    `notify ${message.measurements.length} measurements for ${message.sensorId}`,
  )
}
