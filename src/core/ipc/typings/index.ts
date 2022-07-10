export * from './channel';
export * from './base';

export enum EIpcNamespace {
  Main = 'Main',
  Render = 'Render',
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
   * 各个进程的 port 的集合
   */
  processMessagePortMap: IProcessMessagePortMap;
  /**
   * 每个 port 接收到的事件集合
   */
  portChannelMap: IPortChannelMap;
  /**
   * 发送消息(触发事件)
   */
  send: (channel: string, args?: any) => void;
   /**
    * 请求消息
    */
  // request: (channel: string, timeout?: number | 'infinite', args?: any) => Promise<any>;
   /**
    * 绑定事件
    */
  on: (channel: string, handler: TPortChannelHandler | IPortChannelCallback, once?: boolean) => void;
}

export type TProcessKey = string | number;
export type TMessagePort = MessagePort | Electron.MessagePortMain;

export interface IProcessMessagePortMap {
  [processKey: TProcessKey]: IProcessMessagePortMapItem;
}

export interface IProcessMessagePortMapItem {
  processKey: TProcessKey;
  messagePort: TMessagePort;
}

export interface IPortChannelMap {
  [channel: string]: IPortChannel;
}

export interface IPortChannel {
  callbacks: IPortChannelCallback[];
}

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

export type TPortChannelHandler = (ctx: any, body: any) => void;

export interface IMainIpc extends IBaseIpc {}

export interface IRenderIpc extends IBaseIpc {}