import { Socket } from 'node:net'

import { KeyObjectState } from '@main/utils/KeyObjectState'
import { Device } from '@shared/types/Device'

import { ConnectionData } from '../../shared/types/ConnectionData'
import { createHandleData } from './createHandleData'

type PromiseExecutor = (
  resolve: (value: unknown) => void,
  reject: (reason?: any) => void,
) => void

export function createConnectionExecutor(
  devices: KeyObjectState<Device>,
  connections: {
    [deviceId: string]: ConnectionData
  },
  id: string,
  handleDeviceMessage: (message: string, id: string) => void,
): PromiseExecutor {
  return (resolve, reject) => {
    const device = devices.get(id)

    if (!device) {
      throw Error('Dispositivo não encontrado.')
    }

    if (!connections[id]) {
      connections[id] = { socket: new Socket(), buffer: '' }
    }
    const connection = connections[id]
    const socket = new Socket()
    socket.once('error', (error) => {
      reject(error)
    })
    socket.connect(
      {
        port: device.network.port,
        host: device.network.address,
      },
      () => {
        socket.removeAllListeners() // Para remover o error handler vinculado
        socket.setKeepAlive(true, 3000)
        socket.on('data', createHandleData(id, connection, handleDeviceMessage))
        socket.on('close', () => {
          // TODO: Fazer tratamento de erro. Acredito que seria bom destruir o socket e removê-lo.
          devices.updateObject(id, { connected: false })
          console.log('closed')
        })
        socket.on('error', (error) => {
          console.log(error.message)
        })
        devices.updateObject(id, { connected: true })
        resolve(socket)
      },
    )
  }
}
