import { IBaseIpc, EIpcNamespace, IProcessMessagePortMap, IPortChannelMap, IHandleMessageParams, IIpcMessage, IPortChannelCallback, TPortChannelHandler } from '../typings';
import { generateMessageCtx, generateIpcMessage } from '../utils';
// import { GetTarget } from '../adapter';

export default class BaseIpc implements IBaseIpc {
  public namespace = EIpcNamespace.Render;
  public processMessagePortMap: IProcessMessagePortMap = {};
  public portChannelMap: IPortChannelMap = {};
  public eventEmitter = null;
  public init = (): void => {};

  /**
   * 1、遍历现在已有的所有 ipc，并使用他们的 port 发送消息
   * 2、触发 eventEmitter 的 emit 事件，为了解决当前进程给自己发消息
   * @param channel
   * @param args
   */
  public send = (channel: string, args?: any) => {
    const finalMessage = generateIpcMessage(channel, args);
    // log.info('[send]', finalMessage);
    this._sendToPort(finalMessage);
    // this.eventEmitter.emit(channel, finalMessage);
  };

  // @GetTarget()
  public on = (channel: string, handler: TPortChannelHandler | IPortChannelCallback, once?: boolean): void => {
    if (!this.portChannelMap[channel]) {
      this.portChannelMap[channel] = {
        callbacks: [],
      };
    }

    let messageListener: IPortChannelCallback;
    if (typeof handler === 'function') {
      messageListener = {
        handler,
        once,
      };
    } else {
      messageListener = handler;
    }

    this.portChannelMap[channel].callbacks.push(messageListener);
    // this.eventEmitter.on(channel, messageListener);
  };

  public handleMessage = (params: IHandleMessageParams): void => {
    const { message } = params;
    const { channel } = message;
    if (this.portChannelMap[channel]?.callbacks) {
      this._executePortChannelCallbacks(params);
    }
  };

  private _sendToPort = (message: IIpcMessage): void => {
    for (const [key, processMessagePort] of Object.entries(this.processMessagePortMap)) {
      processMessagePort.messagePort?.postMessage(message);
    }
  };

  private _executePortChannelCallbacks = (params: IHandleMessageParams): void => {
    const { message } = params;
    const { channel, headers } = message;
    const callbacks = this.portChannelMap[channel]?.callbacks;
    const ctx = generateMessageCtx(params);
    const { data } = ctx;
    callbacks.forEach((callback) => {
      const callbackReqId = callback.reqId;
      // 若是这个函数有 reqId 且和此次消息的 reqId 不相等，则不执行任何东西
      if (callbackReqId && callbackReqId !== headers.reqId) {
        return;
      }
      callback.handler && callback.handler(ctx, data?.body);
      if (callback.once) {
        // this.removeListener(channel, callback.handler);
      }
    });
  };
}
