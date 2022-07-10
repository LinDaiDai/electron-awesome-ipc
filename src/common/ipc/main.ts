const { ipcMain, MessageChannelMain } = require('electron');
import {
  IMainIpc,
  IWindowIpcPort,
  IProvidePort,
  IAddMessageChannelArgs,
  EIpcNamespace,
  IIpcMessage,
  IRequestResponse,
} from './typings';
import { IPC_REQUEST } from './constants';
import BaseIpc from './base';

export class MainIpc extends BaseIpc implements IMainIpc {
  public namespace: EIpcNamespace = EIpcNamespace.Main;
  /**
   * 其他窗口的 port
   */
  public windowIpcPorts: IWindowIpcPort = {};

  constructor() {
    super();
    this.init();
  }

  public init = () => {
    this._addIpcRenderRegisteredListener();
  };

  /**
   * 增加【注册渲染进程 ipc】的监听事件
   */
  private _addIpcRenderRegisteredListener = (): void => {
    ipcMain.on('Ipc.render.register', (event: any) => {
      const windowKey: string = this._getWindowKeyBySender(event);
      console.log('Ipc.render.register', windowKey);
      if (!this.windowIpcPorts[windowKey]) {
        this._batchAddMessageChange(windowKey, event);
        this._registerWindowIpcPort(windowKey, event);
      } else {
        console.error('the window is registered', windowKey);
      }
    });
  };

  /**
   * 通过 ipc 的 event 获取窗口的唯一标识
   * @param ipcMainEvent ipc 的 event
   */
  private _getWindowKeyBySender = (ipcMainEvent: any): string => {
    const { sender } = ipcMainEvent;
    return sender.browserWindowOptions.title;
  };

  /**
   * 注册窗口 ipc
   * 1、将窗口添加进 windowIpcPorts
   * 2、调用 port 的 start() 方法，并设置 message 监听(定义主进程接收到消息后，如果处理)
   * 3、设置 port 的 close 监听
   * @param windowKey 窗口的唯一标识
   * @param ipcMainEvent ipc 的 event
   */
  private _registerWindowIpcPort = (windowKey: string, ipcMainEvent: any): void => {
    console.log('register window', windowKey);
    const [port] = ipcMainEvent.ports;
    this.windowIpcPorts[windowKey] = {
      ipcMainEvent,
      ipcPort: port,
    };
    this.windowIpcPorts[windowKey].ipcPort?.start();
    this.windowIpcPorts[windowKey].ipcPort?.on('message', (event) => {
      const message: IIpcMessage = event.data;
      console.log('[receive]', message);
      const resolveHandle = (response: IRequestResponse): void => {
        port.postMessage({
          channel: IPC_REQUEST,
          ...response,
        });
      };
      this.handleMessage(message, resolveHandle);
    });
    this.windowIpcPorts[windowKey].ipcPort?.on('close', () => {
      console.log('port will be close', windowKey);
      this.removeWindowIpcPort(windowKey);
    });
  };

  /**
   * 移除某个窗口
   * 需要给其他窗口 发送事件，通知其他窗口有窗口关闭了
   * @param windowKey 窗口的唯一标识
   */
  private removeWindowIpcPort = (windowKey: string): void => {
    delete this.windowIpcPorts[windowKey];
    this.send('Ipc.render.remove.port', { windowKey });
  };

  /**
   * 1、遍历当前有的所有窗口, 将这些窗口与新注册进来的窗口建立联系，给所有窗口发送新窗口的 port
   * 2、将当前已有的所有窗口的 port 通知给新窗口
   * @param windowKey
   * @param newIpcMainEvent
   */
  private _batchAddMessageChange = (windowKey: string, newIpcMainEvent): void => {
    const newWindowProvidePorts: IProvidePort[] = [];
    for (const [windowKey, value] of Object.entries(this.windowIpcPorts)) {
      const currentBrowserWindow = this._getBrowserWindowByTitle(windowKey);
      this._addMessageChannel({
        windowKey,
        currentBrowserWindow,
        newIpcMainEvent,
        providePorts: newWindowProvidePorts,
      });
    }
    this._providePortToNewWindow(newIpcMainEvent, newWindowProvidePorts);
  };

  /**
   * 通过窗口唯一标识获取窗口的实例对象
   * @param windowKey 窗口唯一标识
   * @returns
   */
  private _getBrowserWindowByTitle = (windowKey: string) => {
    return global.capsule.windowCenter.windows[windowKey].instance;
  };

  /**
   * 将新窗口与一个已有窗口建立联系
   * 创建一对 port，并给已有窗口发送新窗口的 port
   */
  private _addMessageChannel = (args: IAddMessageChannelArgs): void => {
    const { windowKey, currentBrowserWindow, newIpcMainEvent, providePorts } = args;
    const newWindowKey: string = this._getWindowKeyBySender(newIpcMainEvent);
    const { port1, port2 } = new MessageChannelMain();
    try {
      currentBrowserWindow?.webContents.postMessage('Ipc.render.add.port', { windowKey: newWindowKey }, [port1]);
      providePorts.push({
        windowKey,
        port: port2,
      });
    } catch (error) {
      console.error('[addMessageChannel]', error);
    }
  };

  /**
   * 将所有已有窗口的 port 发送给新窗口
   * @param newIpcMainEvent 新窗口
   * @param windowProvidePorts 所有已有窗口的 port
   */
  private _providePortToNewWindow = (newIpcMainEvent: any, windowProvidePorts: IProvidePort[]): void => {
    const windowKeys: string[] = [];
    const ports: any[] = [];
    windowProvidePorts.forEach((providePort) => {
      windowKeys.push(providePort.windowKey);
      ports.push(providePort.port);
    });
    newIpcMainEvent.sender.postMessage('Ipc.render.provide.port', { windowKeys }, ports);
  };

  public sendToPort = (message: IIpcMessage) => {
    for (const [windowKey, windowItem] of Object.entries(this.windowIpcPorts)) {
      windowItem.ipcPort?.postMessage(message);
    }
  };
}

export default MainIpc;
