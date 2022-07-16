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
    resolve: (result?: any) => void;
  };
}

export interface IRenderProvidePortMsg {
  processKeys: string[];
}

export interface IAddPortMsg {
  processKey: string;
}

export interface IRemovePortMsg {
  processKey: string;
}
