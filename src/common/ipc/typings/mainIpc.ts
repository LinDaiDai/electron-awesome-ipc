export interface IWindowIpcPort {
  [windowKey: string]: IIpcWindowItem;
}

export interface IIpcWindowItem {
  /**
   * ipc 的事件对象
   */
  ipcMainEvent: any;
  /**
   * ipc 的 port
   */
  ipcPort?: any;
}

export interface IAddMessageChannelArgs {
  /**
   * 窗口的唯一标识
   */
  windowKey: string;
  /**
   * 当前窗口的实例对象
   */
  currentBrowserWindow: any | null;
  /**
   * 新窗口的 ipcMainEvent
   */
  newIpcMainEvent: any;
  /**
   * 之前已经存在的窗口的 port 集合
   */
  providePorts: IProvidePort[];
}

export interface IProvidePort {
  /**
   * 窗口的唯一标识
   */
  windowKey: string;
  /**
   * 窗口的 ipc port
   */
  port: any;
}
