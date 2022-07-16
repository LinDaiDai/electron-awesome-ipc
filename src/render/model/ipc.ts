import IpcRender from '../../core/ipc/render'

const handler = {
  apply(target, thisArg: any, argArray: any[]): any {
    console.log('target', target);
    console.log('thisArg', thisArg);
    console.log('argArray', argArray);
    var res = Reflect.apply(target, thisArg, argArray);
    return res;
  }
}

/**
 * 给渲染进程的全局变量中注册 ipc
 * @param lindaidai 全局变量
 */
export function attachIpc(lindaidai: typeof window.lindaidai) {
  const ipcRender = new IpcRender();
  const proxyIpcRender = new Proxy(ipcRender, handler);
  console.log('init render ipc...', proxyIpcRender);
  lindaidai.ipc = proxyIpcRender;
}
