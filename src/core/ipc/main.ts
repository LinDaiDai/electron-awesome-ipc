const { ipcMain, MessageChannelMain } = require('electron');
import BaseIpc from './base';
import { IMainIpc, EIpcNamespace, TProcessKey, TMessagePort, IIpcMessage, IRequestResponse } from './typings';
import { getRenderProcessKey } from './utils';
import { CHANNEL_RENDER_REGISTER, CHANNEL_RENDER_ADD_PORT, CHANNEL_MESSAGE, CHANNEL_REQUEST } from './constants';

class MainIpc extends BaseIpc implements IMainIpc {
  public namespace = EIpcNamespace.Main;
  constructor() {
    super();
    this.init();
  }

  public init = () => {
    this._addIpcRenderRegisteredListener();
  }

  /**
   * 增加【注册渲染进程 ipc】的监听事件
   */
  private _addIpcRenderRegisteredListener = (): void => {
    ipcMain.on(CHANNEL_RENDER_REGISTER, (ipcMainEvent: Electron.IpcMainEvent) => {
      console.log(CHANNEL_RENDER_REGISTER, ipcMainEvent);
      // 2、获取到 port1
      const [port] = ipcMainEvent.ports;
      const renderSender = ipcMainEvent.sender;
      const processKey = this._registerProcessIpcPort(renderSender, port);
      this._mainProcessAddlistenerProcessMessage(processKey);
      this._allRenderProcessAddlistenerProcessMessage(processKey);
    });
  };

  private _registerProcessIpcPort = (renderSender: Electron.webContents, messagePort: TMessagePort): TProcessKey => {
    const processKey = getRenderProcessKey(renderSender, this.processMessagePortMap);
    this.processMessagePortMap[processKey] = {
      processKey,
      messagePort,
    }
    return processKey;
  };

  private _mainProcessAddlistenerProcessMessage = (processKey: TProcessKey): void => {
    const renderMessagePort = this.processMessagePortMap[processKey].messagePort;
    renderMessagePort?.start();
    renderMessagePort?.on(CHANNEL_MESSAGE, (event) => {
      const message: IIpcMessage = event.data;
      console.log('[receive]', message);
      const resolveHandle = (response: IRequestResponse): void => {
        renderMessagePort.postMessage({
          channel: CHANNEL_REQUEST,
          ...response,
        });
      };
      this.handleMessage({ message, resolveHandle });
    });
  };

  private _allRenderProcessAddlistenerProcessMessage = (processKey: TProcessKey): void => {
    for (const [key, processMessagePort] of Object.entries(this.processMessagePortMap)) {
      const { port1, port2 } = new MessageChannelMain();
      if (processKey !== key) {
        processMessagePort.messagePort.postMessage(CHANNEL_RENDER_ADD_PORT, [port1]);
      } else {
        this.processMessagePortMap[processKey].messagePort.postMessage(CHANNEL_RENDER_ADD_PORT, [port2]);
      }
    }
  };
}

export default MainIpc;