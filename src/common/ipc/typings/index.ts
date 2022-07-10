import { IPortEventMessage } from './renderIpc';

export * from './renderIpc';
export * from './mainIpc';
export * from './events';

export enum EIpcNamespace {
  Main = 'Main',
  Render = 'Render',
}

export interface IIpcMessage {
  /**
   * 频道（事件名）
   */
  channel: string;
  /**
   * 头部
   */
  headers: {
    /**
     * 每条消息的 id
     */
    reqId: string;
  };
  /**
   * 消息体
   */
  data?: {
    /**
     * 状态码
     */
    code?: number;
    /**
     * 要传输的内容（一般指 send 时传递的参数）
     */
    body?: any;
  };
}

export interface IRequestResponse {
  headers: {
    reqId: string;
  };
  data?: {
    code?: number;
    body?: any;
  };
}

export interface IIpcMessageCtx extends IIpcMessage {
  request: {
    resolve: (result: any) => void;
  };
}

/**
 * ipc 的基类
 */
export interface IBaseIpc {
  /**
   * 命名空间
   */
  namespace: EIpcNamespace;
  /**
   * 事件处理对象，用于处理进程内部自己的消息
   */
  eventEmitter: any;
  /**
   * 各个窗口的 port 的集合
   */
  portChannelMap: IPortChannelMap;
  /**
   * 初始化函数
   */
  init: () => void;
  /**
   * 定义在接收到消息后如何处理
   */
  handleMessage: (message: IIpcMessage, resolveHandle: (response: IRequestResponse) => void) => void;
  /**
   * 给其它 port 发送消息
   */
  sendToPort: (message: IIpcMessage) => void;
  /**
   * 发送消息(触发事件)
   */
  send: (channel: string, args?: any) => void;
  /**
   * 请求消息
   */
  request: (channel: string, timeout?: number | 'infinite', args?: any) => Promise<any>;
  /**
   * 绑定事件
   */
  on: (channel: string, handler: TPortChannelHandler | IPortChannelCallback, once?: boolean) => void;
  /**
   * 绑定一次事件
   */
  once: (channel: string, handler: TPortChannelHandler | IPortChannelCallback) => void;
  /**
   * 解除绑定事件
   */
  off: (channel: string, handler?: Function) => void;
  /**
   * 解除绑定事件
   */
  removeListener: (channel: string, handler?: Function) => void;
}

/**
 * 渲染进程的 ipc
 */
export interface IRenderIpc extends IBaseIpc {}

/**
 * 主进程的 ipc
 */
export interface IMainIpc extends IBaseIpc {}

export interface IPortChannelMap {
  [channel: string]: IPortChannel;
}

export interface IPortChannel {
  callbacks: IPortChannelCallback[];
}

export type TPortChannelHandler = (ctx: IIpcMessageCtx, body: any) => void;

export interface IPortChannelCallback {
  /**
   * 事件回调函数
   */
  handler: TPortChannelHandler;
  /**
   * 此次消息的 id
   */
  reqId?: string;
  /**
   * 是否单次
   */
  once?: boolean;
  /**
   * 目标窗口(仅为保留字段，暂时无用)
   */
  target?: string;
}

export interface IWindowMessagePorts {
  [windowKey: string]: IWindowMessagePort;
}

export interface IWindowMessagePort {
  messagePort: MessagePort;
}