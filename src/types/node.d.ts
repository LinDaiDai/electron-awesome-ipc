import { IBaseIpc } from '../core/ipc/typings';

declare global {
  var lindaidai: ILinDaiDai;
}

interface ILinDaiDai {
  ipc?: IBaseIpc;
}