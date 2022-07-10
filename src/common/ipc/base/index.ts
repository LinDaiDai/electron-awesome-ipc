import IpcEventEmitter from './events';
import {
  IBaseIpc,
  IPortChannelMap,
  IPortChannelCallback,
  TPortChannelHandler,
  EIpcNamespace,
  IIpcMessage,
  IRequestResponse,
  IIpcMessageCtx,
  IIpcEventEmitter,
} from '../typings';
import { nanoid as uuid } from 'nanoid';
import { IPC_REQUEST } from '../constants';
import { timeoutWrap } from '../utils';

export default class BaseIpc implements IBaseIpc {
  public namespace: EIpcNamespace = EIpcNamespace.Render;

  public eventEmitter: IIpcEventEmitter = new IpcEventEmitter();

  public portChannelMap: IPortChannelMap = {};

  public init = (): void => {};

  public sendToPort = (message: IIpcMessage): void => {};

  /**
   * 接收到其他 port 的消息后，如何处理
   * @param eventMessage 消息体
   * @param resolveHandle 处理函数
   */
  public handleMessage = (message: IIpcMessage, resolveHandle: (requestResponse: IRequestResponse) => void): void => {
    const { channel, headers } = message;
    if (this.portChannelMap[channel]?.callbacks) {
      const ctx: IIpcMessageCtx = {
        ...message,
        request: {
          resolve: function (result: any) {
            const requestResponse: IRequestResponse = {
              headers,
              data: {
                code: 200,
                body: result,
              },
            };
            resolveHandle(requestResponse);
          },
        },
      };
      this._handleListeners(this.portChannelMap[channel].callbacks, ctx);
    }
  };

  /**
   * 1、遍历现在已有的所有 ipc，并使用他们的 port 发送消息
   * 2、触发 eventEmitter 的 emit 事件，为了解决当前进程给自己发消息
   * @param channel
   * @param args
   */
  public send = (channel: string, args?: any) => {
    const finalMessage = this._generateIpcMessage(channel, args);
    console.log('[send]', finalMessage);
    this.sendToPort(finalMessage);
    this.eventEmitter.emit(channel, finalMessage);
  };

  /**
   * 请求消息
   * @param channel 要请求的事件名
   * @param timeout TODO 待实现，超时时间
   * @param args 参数
   */
  public request = async (channel: string, timeout?: number | 'infinite', args?: any): Promise<void> => {
    const finalMessage = this._generateIpcMessage(channel, args);
    console.log('[request]', finalMessage);
    let _timeout = timeout;
    if (!_timeout) {
      _timeout = 15000;
    }
    let requestWrap: Promise<any>;
    if (typeof _timeout === 'number') {
      requestWrap = timeoutWrap(this._request, _timeout, finalMessage);
    } else {
      requestWrap = Promise.race([this._request(finalMessage)]);
    }
    return requestWrap.then(
      (res) => {
        return res;
      },
      (error) => {
        console.error(`channel: ${channel}, request is timeout: ${_timeout}ms, args: `, args);
        return error;
      },
    );
  };

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
    this.eventEmitter.on(channel, messageListener);
  };

  public once = (channel: string, handler: TPortChannelHandler | IPortChannelCallback): void => {
    this.on(channel, handler, true);
  };

  public off = (channel: string, handler?: Function) => {
    this._executeRemoveListener(channel, handler);
  };

  public removeListener = (channel: string, handler?: Function) => {
    this._executeRemoveListener(channel, handler);
  };

  /**
   * 生成 IIpcMessage 格式的消息体
   * @param channel 事件
   * @param args 要传递的参数
   */
  private _generateIpcMessage = (channel: string, args?: any): IIpcMessage => {
    return {
      channel,
      headers: {
        reqId: uuid(),
      },
      data: {
        body: args,
      },
    };
  };

  private _handleListeners = (callbacks: IPortChannelCallback[], ctx: IIpcMessageCtx): void => {
    const { channel, headers, data } = ctx;
    callbacks.forEach((callback) => {
      const callbackReqId = callback.reqId;
      // 若是这个函数有 reqId 且和此次消息的 reqId 不相等，则不执行任何东西
      if (callbackReqId && callbackReqId !== headers.reqId) {
        return;
      }
      callback.handler && callback.handler(ctx, data?.body);
      if (callback.once) {
        this.removeListener(channel, callback.handler);
      }
    });
  };

  private _request = (message: IIpcMessage): Promise<void> => {
    const { headers } = message;
    return new Promise((resolve) => {
      this.once(IPC_REQUEST, {
        handler: (ctx, result) => {
          console.log('[request result], message is :', message, 'result is: ', result);
          resolve(result);
        },
        reqId: headers.reqId,
      });
      this.sendToPort(message);
      this._ownSend(message);
    });
  };

  private _ownSend = (message: IIpcMessage): void => {
    const resolveHandle = (response: IRequestResponse): void => {
      this.eventEmitter.emit(IPC_REQUEST, {
        channel: IPC_REQUEST,
        ...response,
      });
    };
    this.handleMessage(message, resolveHandle);
  };

  private _executeRemoveListener = (channel: string, handler?: Function): void => {
    if (this.portChannelMap[channel]) {
      this._removeChannelCallback(channel, handler);
      handler && this.eventEmitter.removeListener(channel, handler);
    } else {
      console.error(`non-existent channel[${channel}] need removeListener`);
    }
  };

  private _removeChannelCallback = (channel: string, handler?: Function): void => {
    if (!handler) {
      delete this.portChannelMap[channel];
    } else {
      this._removeChannelTargeCallback(channel, handler);
    }
  };

  private _removeChannelTargeCallback = (channel: string, handler: Function): void => {
    this.portChannelMap[channel].callbacks?.forEach((cbItem: IPortChannelCallback, index: number) => {
      if (cbItem.handler === handler) {
        this.portChannelMap[channel].callbacks.splice(index, 1);
      }
    });
  };
}
