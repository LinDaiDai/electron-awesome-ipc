const { ipcRenderer } = require('electron');
import {
  IRenderIpc,
  IWindowMessagePorts,
  IRenderProvidePortMsg,
  IAddPortMsg,
  IRemovePortMsg,
  IAddWindowMessagePortArgs,
  EIpcNamespace,
  IIpcMessage,
  IRequestResponse,
} from './typings';
import { IPC_REQUEST } from './constants';
import BaseIpc from './base';

class IpcRender extends BaseIpc implements IRenderIpc {
  public namespace: EIpcNamespace = EIpcNamespace.Render;
  public windowMessagePorts: IWindowMessagePorts = {};

  constructor() {
    super();
    this.init();
  }

  public init = () => {
    this._registerIpcRenderToMain();
    this._addListener();
    this._addIpcRenderRemovePort();
  };

  /**
   * 将主进程的 port 添加进内存
   */
  private _registerIpcRenderToMain = (): void => {
    const { port1, port2 } = new MessageChannel();
    ipcRenderer.postMessage('Ipc.render.register', null, [port2]);
    this._addWindowMessagePort({
      windowKey: 'main',
      messagePort: port1,
    });
  };

  /**
   * 设置一些监听
   */
  private _addListener = (): void => {
    /**
     * 当前的渲染 ipc 在首次注册的时候，需要获取到其他渲染 ipc 的 port
     * 并给他们设置监听
     */
    ipcRenderer.once('Ipc.render.provide.port', (event: any, msg: IRenderProvidePortMsg) => {
      const { windowKeys } = msg;
      const { ports } = event;
      console.log('Ipc.render.provide.port event windowKeys', windowKeys);
      windowKeys.forEach((windowKey: string, index: number) => {
        const messagePort = ports[index];
        this._addWindowMessagePort({
          windowKey,
          messagePort,
        });
      });
    });
    /**
     * 如果有其他渲染 ipc 注册进来，当前的渲染 ipc 需要将新加进来的 port 存储下来，并设置监听
     */
    ipcRenderer.on('Ipc.render.add.port', (event, msg: IAddPortMsg) => {
      console.log('Ipc.render.add.port event and msg', msg);
      const [port] = event.ports;
      const { windowKey } = msg;
      this._addWindowMessagePort({
        windowKey,
        messagePort: port,
      });
    });
  };

  /**
   * 设置监听：如果有其他进程销毁了，需要把这个进程对应的数据都移除
   * 该监听的触发源是主进程 ipc。在主进程 ipc 中会监听其他窗口的 port 是否被 close 了
   * 若是 close 就会触发这个事件监听
   */
  private _addIpcRenderRemovePort = (): void => {
    this.on('Ipc.render.remove.port', (event, msg: IRemovePortMsg) => {
      const { windowKey } = msg;
      console.log(`receive Ipc.render.remove: ${windowKey}`);
      this.removeWindow(windowKey);
    });
  };

  private removeWindow = (windowItemKey: string): void => {
    delete this.windowMessagePorts[windowItemKey];
  };

  /**
   * 1、将 port 添加到 windowMessagePorts 中
   * 2、给 port 设置 onmessage 监听事件，这样如果其他 port 发送了消息，就可以在此触发了
   * @param args windowKey: 进程的唯一标识; messagePort: 进程的 port
   */
  private _addWindowMessagePort = (args: IAddWindowMessagePortArgs): void => {
    const { windowKey, messagePort } = args;
    this.windowMessagePorts[windowKey] = {
      messagePort,
    };
    messagePort.onmessage = (event) => {
      const message: IIpcMessage = event.data;
      console.log('[receive]', message);
      const resolveHandle = (response: IRequestResponse): void => {
        messagePort.postMessage({
          channel: IPC_REQUEST,
          ...response,
        });
      };
      this.handleMessage(message, resolveHandle);
    };
  };

  public sendToPort = (message: IIpcMessage) => {
    for (const [windowKey, windowMessagePort] of Object.entries(this.windowMessagePorts)) {
      windowMessagePort.messagePort.postMessage(message);
    }
  };
}

export default IpcRender;
