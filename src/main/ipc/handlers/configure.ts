import { format } from 'date-fns'
import { dialog, ipcMain, app } from 'electron'
import fs from 'fs'
import path from 'path'
import { Op } from 'sequelize'

import { startTime } from '@main/constants/startTime'
import { DevicesController } from '@main/controllers/DevicesController'
import { MeasurementModel, SensorModel } from '@main/database/models'
import { findAllDevices } from '@main/database/queries/findAllDevices'
import { getMainWindow } from '@main/utils/getMainWindow'
import { transformToRelativeTime } from '@main/utils/transformToRelativeTime'
import { CHANNELS } from '@shared/constants/channels'
import { Sensor } from '@shared/types/Device'
import {
  CloseDeviceConnectionRequest,
  ExportMeasurementsRequest,
  FindAllMeasurementsByDeviceRequest,
  FindAllMeasurementsByDeviceResponse,
  GetAllDevicesResponse,
  GetAppInfoResponse,
  OpenDeviceConnectionRequest,
  GetMeasurementsRangeRequest,
  GetMeasurementsRangeResponse,
} from '@shared/types/ipc'
import { Measurement } from '@shared/types/Measurement'

export function configureIpcHandlers(devicesController: DevicesController) {
  ipcMain.handle(
    CHANNELS.APP.GET_INFO,
    async (event, request: void): Promise<GetAppInfoResponse> => {
      console.log(`<= ${CHANNELS.APP.GET_INFO}`)
      return {
        appInfo: {
          startTime,
          name: app.getName(),
          version: app.getVersion(),
        },
      }
    },
  )

  ipcMain.handle(
    CHANNELS.DEVICES.INFO.GET_ALL,
    async (event, request: void): Promise<GetAllDevicesResponse> => {
      console.log(`<= ${CHANNELS.DEVICES.INFO.GET_ALL}`)
      return {
        devices: await findAllDevices(),
      }
    },
  )

  ipcMain.handle(
    CHANNELS.DEVICES.CONNECTION.OPEN,
    async (event, request: OpenDeviceConnectionRequest) => {
      console.log(
        `<= ${CHANNELS.DEVICES.CONNECTION.OPEN}\n${JSON.stringify(request)}`,
      )
      return {
        message: 'Conexão estabelecida',
        connection: await devicesController.openConnection(request.deviceId),
      }
    },
  )

  ipcMain.handle(
    CHANNELS.DEVICES.CONNECTION.CLOSE,
    async (event, request: CloseDeviceConnectionRequest) => {
      console.log(
        `<= ${CHANNELS.DEVICES.CONNECTION.CLOSE}\n${JSON.stringify(request)}`,
      )
      return {
        message: 'Conexão encerrada',
        connection: await devicesController.closeConnection(request.deviceId),
      }
    },
  )

  ipcMain.handle(
    CHANNELS.MEASUREMENTS.FIND_LAST_BY_DEVICE,
    async (
      event,
      request: FindAllMeasurementsByDeviceRequest,
    ): Promise<FindAllMeasurementsByDeviceResponse> => {
      console.log(`<= ${CHANNELS.MEASUREMENTS.FIND_LAST_BY_DEVICE}`)

      const sensors: Sensor[] = (await SensorModel.findAll()).map(
        (model) => model.dataValues,
      )

      const measurements = await Promise.all(
        sensors.map(async (sensor): Promise<[string, Measurement[]]> => {
          const maxTimestamp: number = await MeasurementModel.max('timestamp', {
            where: {
              sensorId: sensor.id,
            },
          })

          const sensorMeasurements: Measurement[] = (
            await MeasurementModel.findAll({
              where: {
                sensorId: sensor.id,
                timestamp: {
                  [Op.gte]: maxTimestamp - request.timeRange,
                },
              },
              order: [['timestamp', 'ASC']],
            })
          ).map((measurementM) =>
            transformToRelativeTime(measurementM.dataValues),
          )

          return [sensor.id, sensorMeasurements]
        }),
      )

      const measurementsBySensor = Object.fromEntries(
        measurements.filter(
          ([sensorId, sensorMeasurements]) => sensorMeasurements.length !== 0,
        ),
      )

      return {
        measurementsBySensor,
      }
    },
  )

  ipcMain.handle(
    CHANNELS.MEASUREMENTS.GET_RANGE,
    async (
      event,
      request: GetMeasurementsRangeRequest,
    ): Promise<GetMeasurementsRangeResponse> => {
      console.log(
        `<= ${CHANNELS.MEASUREMENTS.GET_RANGE} \n${JSON.stringify(request)}`,
      )

      const where: any = {
        sensorId: request.sensorId,
      }

      if (
        typeof request.start === 'number' ||
        typeof request.end === 'number'
      ) {
        where.timestamp = {}
        if (typeof request.start === 'number') {
          where.timestamp[Op.gte] = request.start
        }
        if (typeof request.end === 'number') {
          where.timestamp[Op.lte] = request.end
        }
      }

      const measurements: Measurement[] = (
        await MeasurementModel.findAll({
          where,
          order: [['timestamp', 'ASC']],
        })
      ).map((m) => transformToRelativeTime(m.dataValues))

      return { measurements }
    },
  )

  ipcMain.handle(
    CHANNELS.MEASUREMENTS.DELETE_ALL,
    async (event, request: void): Promise<void> => {
      console.log(`<= ${CHANNELS.MEASUREMENTS.DELETE_ALL}`)
      await MeasurementModel.truncate()
    },
  )

  ipcMain.handle(CHANNELS.DEVICES.UPDATE_SETTINGS, async () => {
    console.log(CHANNELS.DEVICES.UPDATE_SETTINGS)
    return {}
  })

  ipcMain.handle(
    CHANNELS.MEASUREMENTS.EXPORT,
    async (event, request: ExportMeasurementsRequest): Promise<void> => {
      console.log(
        `<= ${CHANNELS.MEASUREMENTS.EXPORT}\n${JSON.stringify(request)}`,
      )

      const sensor: Sensor = (await SensorModel.findByPk(request.sensorId))
        ?.dataValues

      const maxTimestamp: number = await MeasurementModel.max('timestamp', {
        where: {
          sensorId: sensor.id,
        },
      })

      const measurements: Measurement[] = (
        await MeasurementModel.findAll({
          where: {
            sensorId: sensor.id,
            timestamp: {
              [Op.gte]: maxTimestamp - request.timeRange,
            },
          },
          order: [['timestamp', 'ASC']],
        })
      ).map((measurementM, index, array) => ({
        ...measurementM.dataValues,
        timestamp:
          measurementM.dataValues.timestamp - array[0].dataValues.timestamp,
      }))

      dialog
        .showSaveDialog(getMainWindow(), {
          title: 'Exportar medições',
          defaultPath: path.join(
            app.getPath('documents'),
            `${format(new Date(), 'yyyyMMdd_HHmmss')}_${sensor.quantity}.dat`,
          ),

          filters: [
            { name: 'Arquivos DAT', extensions: ['dat'] },
            { name: 'Arquivos CSV', extensions: ['csv'] },
            { name: 'Todos os Arquivos', extensions: ['*'] },
          ],
        })
        .then((result) => {
          if (!result.canceled && result.filePath) {
            let fileHeader
            let fileBody

            const extension = result.filePath.split('.').at(-1)

            if (extension === 'csv') {
              fileHeader = `t, ${sensor.quantity}`

              fileBody = measurements
                .map(
                  (measurement) =>
                    `${measurement.timestamp.toFixed(6)}, ${measurement.value}`,
                )
                .join('\n')
            } else {
              fileHeader = `t\t${sensor.quantity}`

              fileBody = measurements
                .map(
                  (measurement) =>
                    `${measurement.timestamp.toFixed(6).replace('.', ',')}\t${(
                      measurement.value as number
                    )
                      .toString()
                      .replace('.', ',')}`,
                )
                .join('\n')
            }

            const fileContent = [fileHeader, fileBody].join('\n')

            fs.writeFile(result.filePath, fileContent, (err) => {
              if (err) {
                console.error('Erro ao salvar o arquivo:', err)
              } else {
                console.log('Arquivo salvo com sucesso!')
              }
            })
          }
        })
        .catch((err) => {
          console.error('Erro ao exibir a caixa de diálogo:', err)
        })
    },
  )
}
