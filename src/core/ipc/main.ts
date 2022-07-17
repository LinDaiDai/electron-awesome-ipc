const { ipcMain, MessageChannelMain } = require('electron');
import BaseIpc from './base';
import { IMainIpc, IBaseIpcProps, EIpcNamespace, TProcessKey, TMessagePort, IIpcMessage, IRequestResponse, IRemovePortMsg, IProcessMessagePortMapItem } from './typings';
import { getRenderProcessKey } from './utils';
import { CHANNEL_RENDER_REGISTER, CHANNEL_RENDER_ADD_PORT, CHANNEL_MESSAGE, CHANNEL_REQUEST, CHANNEL_RENDER_REMOVTE_PORT, CHANNEL_RENDER_PROVIDE_PORT, PROCESS_KEY_MAIN } from './constants';

class MainIpc extends BaseIpc implements IMainIpc {
  public namespace = EIpcNamespace.Main;
  public processKey: TProcessKey = PROCESS_KEY_MAIN;
  constructor(props: IBaseIpcProps) {
    super(props);
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
      this.logger.info(CHANNEL_RENDER_REGISTER);
      const [port] = ipcMainEvent.ports;
      const webContents = ipcMainEvent.sender;
      const processKey = this._registerProcessIpcPort(webContents, port);
      this._mainProcessAddlistenerProcessMessage(processKey);
      this._allRenderProcessAddlistenerProcessMessage(processKey);
      this._addListenerPortClose(processKey);
    });
  };

  private _registerProcessIpcPort = (webContents: Electron.webContents, messagePort: TMessagePort): TProcessKey => {
    const processKey = getRenderProcessKey(webContents, this.processMessagePortMap);
    this.processMessagePortMap[processKey] = {
      processKey,
      messagePort,
      webContents,
    }
    return processKey;
  };

  private _mainProcessAddlistenerProcessMessage = (processKey: TProcessKey): void => {
    const renderMessagePort = this.processMessagePortMap[processKey].messagePort;
    renderMessagePort?.start();
    renderMessagePort?.on(CHANNEL_MESSAGE, (event) => {
      const message: IIpcMessage = event.data;
      this.logger.info('[receive]', message);
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
    const newProcessWillProviedProcessKeys: TProcessKey[] = [];
    const newProcessWillProvidePorts: TMessagePort[] = [];
    this.logger.info('_allRenderProcessAddlistenerProcessMessage');
    for (const processMessagePort of Object.values(this.processMessagePortMap)) {
      const key = processMessagePort.processKey;
      if (processKey !== key) {
        const { port1, port2 } = new MessageChannelMain();
        processMessagePort.webContents?.postMessage(CHANNEL_RENDER_ADD_PORT, { processKey }, [port1]);
        newProcessWillProviedProcessKeys.push(key);
        newProcessWillProvidePorts.push(port2);
      }
    }
    this.processMessagePortMap[processKey].webContents?.postMessage(
      CHANNEL_RENDER_PROVIDE_PORT,
      {
        processKeys: newProcessWillProviedProcessKeys,
        processKey,
      },
      newProcessWillProvidePorts,
    );
  };

  private _addListenerPortClose = (processKey: TProcessKey): void => {
    this.processMessagePortMap[processKey].messagePort.on('close', () => {
      this.logger.info('port will be close', processKey);
      this._removeProcessMessagePort(processKey);
    });
  };

  private _removeProcessMessagePort = (processKey: TProcessKey): void => {
    delete this.processMessagePortMap[processKey];
    this.send(CHANNEL_RENDER_REMOVTE_PORT, { processKey } as IRemovePortMsg);
  }
}

export default MainIpc;