export interface IRenderProvidePortMsg {
  windowKeys: string[];
}

export interface IAddPortMsg {
  windowKey: string;
}

export interface IRemovePortMsg {
  windowKey: string;
}

export interface IAddWindowMessagePortArgs {
  /**
   * 窗口的唯一标识
   */
  windowKey: string;
  /**
   * MessagePort
   */
  messagePort: MessagePort;
}

export interface IPortEventMessage {
  /**
   * 触发的事件名
   */
  channel: string;
  /**
   * 要传递的数据
   */
  data: any;
}
