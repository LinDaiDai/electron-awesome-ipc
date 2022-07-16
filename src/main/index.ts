import { app, BrowserWindow } from 'electron'
import { createWindow } from './windowCenter/createWindow';
import setup from './setup';
import { testIpc } from './test';

function createWindowOne() {
  createWindow({
    name: 'windowOne',
    width: 1000,
    height: 800,
  })
}

function createWindowTwo() {
  createWindow({
    name: 'windowTwo',
    width: 600,
    height: 400,
  })
}

app.whenReady().then(() => {
  setup()
  createWindowOne()
  createWindowTwo()
  testIpc()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindowOne()
    createWindowTwo()
  }
})
