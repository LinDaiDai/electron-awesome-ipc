import IpcRender from '../../../core/ipc/render'

/**
 * 给渲染进程的全局变量中注册 ipc
 * @param lindaidai 全局变量
 */
export function attachIpc(processKey: string) {
  const ipcRender = new IpcRender({ processKey });
  console.log('init render ipc...', ipcRender);
  window.lindaidai.ipc = ipcRender;
}
