import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'
import path from 'node:path'

import { createWindow } from './createWindow'
import './ipcHandlers/configure'
import { State } from './utils/State'
import { DeviceInfo } from '@shared/types/ipc'
import { search, startListener } from './devicesHandlers/configure'

const devices = new State<Array<DeviceInfo>>([])

// console.log(devices.getState())

devices.setState([
  {
    id: 'ff-ff-ff-ff-ff-ff',
    name: 'Mecânica',
    capabilities: ['Photogate', 'Distância'],
    network: {
      MACAddress: 'ff-ff-ff-ff-ff-ff',
    },
  },
  {
    id: 'ee-ee-ee-ee-ee-ee',
    name: 'Termologia',
    capabilities: ['Temperatura', 'Pressão'],
    network: {
      MACAddress: 'ee-ee-ee-ee-ee-ee',
    },
  },
])

// console.log(devices.getState())

startListener(devices)

search()

if (process.platform === 'darwin') {
  app.dock.setIcon(path.resolve(__dirname, 'icon.png'))
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
