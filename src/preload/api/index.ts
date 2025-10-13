import { IpcRendererEvent, ipcRenderer } from 'electron'

import { CHANNELS } from '@shared/constants/channels'
import { SensorId } from '@shared/types/Device'
import {
  CloseDeviceConnectionRequest,
  DevicesInfoUpdateMessage,
  ExportMeasurementsRequest,
  FindAllMeasurementsByDeviceRequest,
  FindAllMeasurementsByDeviceResponse,
  GetAllDevicesResponse,
  GetAppInfoResponse,
  MeasurementNotifyMessage,
  GetMeasurementsRangeRequest,
  GetMeasurementsRangeResponse,
  OpenDeviceConnectionRequest,
  UpdateDeviceSettingsRequest,
} from '@shared/types/ipc'

// Custom APIs for renderer
export const api = {
  app: {
    getInfo(): Promise<GetAppInfoResponse> {
      return ipcRenderer.invoke(CHANNELS.APP.GET_INFO)
    },
  },
  devices: {
    async getAll(request: void): Promise<GetAllDevicesResponse> {
      return await ipcRenderer.invoke(CHANNELS.DEVICES.INFO.GET_ALL, request)
    },

    onDevicesInfoUpdate(
      callback: (
        event: IpcRendererEvent,
        params: DevicesInfoUpdateMessage,
      ) => void,
    ) {
      ipcRenderer.on(CHANNELS.DEVICES.INFO.UPDATE, callback)

      return () => {
        ipcRenderer.removeListener(CHANNELS.DEVICES.INFO.UPDATE, callback)
      }
    },

    openConnection(request: OpenDeviceConnectionRequest) {
      return ipcRenderer.invoke(CHANNELS.DEVICES.CONNECTION.OPEN, request)
    },

    closeConnection(request: CloseDeviceConnectionRequest) {
      return ipcRenderer.invoke(CHANNELS.DEVICES.CONNECTION.CLOSE, request)
    },

    updateSettings(request: UpdateDeviceSettingsRequest) {
      return ipcRenderer.invoke(CHANNELS.DEVICES.UPDATE_SETTINGS, request)
    },
  },
  measurements: {
    async findLastByDevice(
      request: FindAllMeasurementsByDeviceRequest,
    ): Promise<FindAllMeasurementsByDeviceResponse> {
      return await ipcRenderer.invoke(
        CHANNELS.MEASUREMENTS.FIND_LAST_BY_DEVICE,
        request,
      )
    },

    async getRange(
      request: GetMeasurementsRangeRequest,
    ): Promise<GetMeasurementsRangeResponse> {
      return await ipcRenderer.invoke(CHANNELS.MEASUREMENTS.GET_RANGE, request)
    },

    async deleteAll(request: void): Promise<void> {
      return await ipcRenderer.invoke(CHANNELS.MEASUREMENTS.DELETE_ALL, request)
    },

    async export(request: ExportMeasurementsRequest): Promise<void> {
      return await ipcRenderer.invoke(CHANNELS.MEASUREMENTS.EXPORT, request)
    },

    onNotify(
      sensorId: SensorId,
      callback: (
        event: IpcRendererEvent,
        params: MeasurementNotifyMessage,
      ) => void,
    ) {
      ipcRenderer.on(CHANNELS.MEASUREMENTS.NOTIFY(sensorId), callback)

      return () => {
        ipcRenderer.removeListener(
          CHANNELS.MEASUREMENTS.NOTIFY(sensorId),
          callback,
        )
      }
    },
  },
}
