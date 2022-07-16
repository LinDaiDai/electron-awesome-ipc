const { ipcRenderer } = require('electron');
import BaseIpc from './base';
import { EIpcNamespace, IRenderIpc, TProcessKey, TMessagePort, IRequestResponse, IIpcMessage, IRemovePortMsg, IRenderProvidePortMsg, IAddPortMsg } from './typings';
import { CHANNEL_RENDER_REGISTER, CHANNEL_REQUEST, PROCESS_KEY_MAIN, CHANNEL_RENDER_REMOVTE_PORT, CHANNEL_RENDER_PROVIDE_PORT, CHANNEL_RENDER_ADD_PORT } from './constants';

class RenderIpc extends BaseIpc implements IRenderIpc {
  public namespace = EIpcNamespace.Render;
  public processKey: TProcessKey = '';
  constructor() {
    super();
    this.init();
  }

  public init = () => {
    this._registerIpcRenderToMain();
    this._addlistenerRenderProcessMessage();
    this._addlistenerRemovePort();
  }

  /**
   * 将主进程的 port 添加进内存
   */
  private _registerIpcRenderToMain = (): void => {
    const { port1, port2 } = new MessageChannel();
    ipcRenderer.postMessage(CHANNEL_RENDER_REGISTER, null, [port2]);
    this._registerProcessAndAddlistener(PROCESS_KEY_MAIN, port1);
  };

  private _registerProcessAndAddlistener = (processKey: TProcessKey, messagePort: TMessagePort): void => {
    this._registerProcessIpcPort(processKey, messagePort);
  this._addlistenerProcessMessage(messagePort);
  };

  private _registerProcessIpcPort = (processKey: TProcessKey, messagePort: TMessagePort): TProcessKey => {
    this.processMessagePortMap[processKey] = {
      processKey,
      messagePort,
    }
    return processKey;
  };

  private _addlistenerProcessMessage = (messagePort: TMessagePort): void => {
    messagePort.onmessage = (event: Electron.MessageEvent) => {
      const message: IIpcMessage = event.data;
      console.log('[receive]', message);
      const resolveHandle = (response: IRequestResponse): void => {
        messagePort.postMessage({
          channel: CHANNEL_REQUEST,
          ...response,
        });
      };
      this.handleMessage({ message, resolveHandle });
    };
  };

  private _addlistenerRenderProcessMessage = (): void => {
    /**
     * 当前的渲染 ipc 在首次注册的时候，需要获取到其他渲染 ipc 的 port
     * 并给他们设置监听
     */
     ipcRenderer.once(CHANNEL_RENDER_PROVIDE_PORT, (event: any, msg: IRenderProvidePortMsg) => {
      const { processKeys } = msg;
      const { ports } = event;
      console.log(`${CHANNEL_RENDER_PROVIDE_PORT} event processKeys`, processKeys);
      processKeys.forEach((processKey: string, index: number) => {
        const messagePort = ports[index];
        this._registerProcessAndAddlistener(processKey, messagePort);
      });
    });
    /**
     * 如果有其他渲染 ipc 注册进来，当前的渲染 ipc 需要将新加进来的 port 存储下来，并设置监听
     */
    ipcRenderer.on(CHANNEL_RENDER_ADD_PORT, (event, msg: IAddPortMsg) => {
      console.log(`${CHANNEL_RENDER_ADD_PORT} event and msg`, msg);
      const [port] = event.ports;
      const { processKey } = msg;
      this._registerProcessAndAddlistener(processKey, port);
    });
  };

  private _addlistenerRemovePort = (): void => {
    this.on(CHANNEL_RENDER_REMOVTE_PORT, (ctx, msg: IRemovePortMsg) => {
      const { processKey } = msg;
      console.log(`receive Ipc.render.remove: ${processKey}`);
      this._removeProcess(processKey);
    });
  };

  private _removeProcess = (processKey: TProcessKey): void => {
    delete this.processMessagePortMap[processKey];
  };
}

export default RenderIpc;