import { IBaseIpc } from '../core/ipc/typings';

declare global {
  interface Window {
    lindaidai: ILinDaiDai;
  }
}

interface ILinDaiDai {
  ipc?: IBaseIpc;
}