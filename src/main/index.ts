import { electronApp, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow } from 'electron'
import path from 'node:path'

import { Device } from '@shared/types/Device'

import { createWindow } from './createWindow'
import { DevicesController } from './devices'
import { configureIpcHandlers } from './ipc/handlers/configure'
import { State } from './utils/State'

const devicesState = new State<Array<Device>>([])
const devicesController = new DevicesController(devicesState)
devicesController.startListener()
devicesController.startSearch()
configureIpcHandlers(devicesController)

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
