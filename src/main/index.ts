import { app, BrowserWindow } from 'electron'
import { createWindow } from './windowCenter/createWindow';
import setup from './setup';

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
  setIpcListener()
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

const setIpcListener = () => {
  const handleIpcMessage = (e, data) => {
    console.log('main handleIpcMessage', data);
  }
  // global.lindaidai.ipc.on('render-to-main', handleIpcMessage)
}