import IpcRender from '../../core/ipc/render'

/**
 * 给渲染进程的全局变量中注册 ipc
 * @param lindaidai 全局变量
 */
export function attachIpc(lindaidai: typeof window.lindaidai) {
  const ipcRender = new IpcRender();
  console.log('init render ipc...', ipcRender);
  console.log('init render ipc...', lindaidai);
  lindaidai.ipc = ipcRender;
}
