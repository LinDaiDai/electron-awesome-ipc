import { RenderIpc } from '../../../dist/esm/render'

/**
 * 给渲染进程的全局变量中注册 ipc
 * @param lindaidai 全局变量
 */
export function attachIpc(processKey: string) {
  const renderIpc = new RenderIpc({ processKey });
  console.log('init render ipc...', renderIpc);
  window.lindaidai.ipc = renderIpc;
}
