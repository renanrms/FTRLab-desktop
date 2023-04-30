import { BrowserWindow } from 'electron'

export function sendIpcMessage(channel: string, message: any) {
  const mainWindow = BrowserWindow.getAllWindows()[0]

  if (mainWindow) {
    mainWindow.webContents.send(channel, message)
    console.log(`\nMessage sent on ${channel}:\n${message}`)
  }
}
