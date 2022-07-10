const { ipcRenderer } = require('electron');
import BaseIpc from './base';
import { EIpcNamespace, TProcessKey, TMessagePort, IRequestResponse, IIpcMessage } from './typings';
import { CHANNEL_RENDER_REGISTER, CHANNEL_REQUEST, PROCESS_KEY_MAIN } from './constants';

class RenderIpc extends BaseIpc {
  public namespace = EIpcNamespace.Render;
  constructor() {
    super();
    this.init();
  }

  public init = () => {
    this._registerIpcRenderToMain();
  }

  /**
   * 将主进程的 port 添加进内存
   */
  private _registerIpcRenderToMain = (): void => {
    const { port1, port2 } = new MessageChannel();
    ipcRenderer.postMessage(CHANNEL_RENDER_REGISTER, null, [port2]);
    this._addlistenerMainProcessMessage(port1);
  };

  private _addlistenerMainProcessMessage = (messagePort: TMessagePort): void => {
    const processKey = PROCESS_KEY_MAIN;
    this.processMessagePortMap[processKey] = {
      processKey,
      messagePort,
    }
    messagePort.onmessage = (event) => {
      const message: IIpcMessage = event.data;
      console.log('[receive]', event);
      const resolveHandle = (response: IRequestResponse): void => {
        messagePort.postMessage({
          channel: CHANNEL_REQUEST,
          ...response,
        });
      };
      this.handleMessage({ message, resolveHandle });
    };
  };
}

export default RenderIpc;