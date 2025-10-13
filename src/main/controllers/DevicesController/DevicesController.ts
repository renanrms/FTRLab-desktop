import { RemoteInfo } from 'dgram'
import Mdns from 'multicast-dns'
import { Op } from 'sequelize'

import { startTime } from '@main/constants/startTime'
import { DeviceModel, MeasurementModel } from '@main/database/models'
import { findAllDevices } from '@main/database/queries/findAllDevices'
import { sendDevicesInfoUpdate } from '@main/ipc/services/sendDevicesInfoUpdate'
import { sendMeasurementUpdate } from '@main/ipc/services/sendDevicesMeasurementUpdate'
import { ConnectionData } from '@shared/types/ConnectionData'
import { Device } from '@shared/types/Device'
import { DeviceMeasurement } from '@shared/types/Measurement'

import { createConnectionExecutor } from './createConnectionExecutor'
import { handleMdnsResponse } from './handleMdnsResponse'
export class DevicesController {
  private connections: {
    [deviceId: string]: ConnectionData
  }

  private mdns

  constructor() {
    /*
      TODO: Tentar usar um hook do sequelize para enviar os dispositivos ao renderer sempre que houver uma alteração testa tabela do banco. Isso vai garantir melhor a atualização.
    */
    this.connections = {}
    this.mdns = Mdns()
  }

  /*
    TODO: corrigir a parte de busca do dispositivo no desktop e/ou no embarcado para que responda mensagens.
    Este trecho está como faz sentido pra mim, mas o dispositivo nunca responde,
    apenas envia respostas de forma força forçada, independente da query.
  */
  startSearch(interval: number = 30) {
    setInterval(() => {
      this.mdns.query({
        questions: [
          {
            name: '_ftr-lab._tcp.local',
            type: 'ANY',
          },
        ],
      } as any)
    }, interval * 1000)
  }

  startListener() {
    this.mdns.on(
      'response',
      (response: Mdns.ResponsePacket, rinfo: RemoteInfo) => {
        handleMdnsResponse(response, rinfo)
      },
    )
  }

  startUpdateDevicesAvailability(interval: number = 30) {
    setInterval(this.updateDevicesAvailability, interval * 1000)
  }

  /**
   * Verifica os dispositivos inativos e altera o estado available.
   * @param tolerance numero de segundos sem respostas do dispositivo para considerá-lo indisponível.
   */
  async updateDevicesAvailability(tolerance: number = 120) {
    const [affectedCount] = await DeviceModel.update(
      { available: false, reachable: false },
      {
        where: {
          connected: false,
          updatedAt: {
            [Op.lt]: new Date(Date.now() - tolerance * 1000),
          },
        },
      },
    )
    if (affectedCount > 0) {
      console.log(`-- Inactive devices set to unavailable`)
      sendDevicesInfoUpdate({
        devices: await findAllDevices(),
      })
    }
  }

  async openConnection(id: string) {
    const connectionPromise = new Promise(
      createConnectionExecutor(this.connections, id, this.handleDeviceMessage),
    )

    // TODO: Fazer um loop de tentativas de conexão porque muitas vezes não vai de primeira.
    await connectionPromise
  }

  async closeConnection(id: string) {
    this.connections[id].socket.destroy()
  }

  async handleDeviceMessage(message: string, deviceId: string) {
    try {
      const device: Device = (
        await DeviceModel.findByPk(deviceId, { include: 'sensors' })
      )?.dataValues

      const measurements: DeviceMeasurement[] = JSON.parse(message).measurements

      if (measurements) {
        const records = measurements.map(([sensorIndex, timestamp, value]) => ({
          sensorId: `${deviceId}:${sensorIndex}`,
          timestamp: device.timeSynced ? timestamp : timestamp + startTime,
          value,
        }))

        // Insere os dados no banco de forma síncrona para garantir que fiquem em ordem.
        await MeasurementModel.bulkCreate(records)

        // Agrupa por sensorId e notifica o renderer para cada sensor separadamente.
        const bySensor: { [sensorId: string]: any[] } = {}
        for (const r of records) {
          bySensor[r.sensorId] = bySensor[r.sensorId] || []
          bySensor[r.sensorId].push(r)
        }

        // Notifica por sensor
        for (const [sensorId, sensorMeasurements] of Object.entries(bySensor)) {
          try {
            // import dinâmico para evitar dependência cíclica no topo do arquivo
            const { sendMeasurementNotify } = await import(
              '@main/ipc/services/sendDevicesMeasurementNotify'
            )
            sendMeasurementNotify({
              sensorId,
              measurements: sensorMeasurements,
            })
          } catch (err) {
            console.error('Failed to send measurement notify', err)
          }
        }

        // Mantemos o envio agregado para compatibilidade com consumidores antigos
        sendMeasurementUpdate({
          measurements: records,
          deviceId,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
}
