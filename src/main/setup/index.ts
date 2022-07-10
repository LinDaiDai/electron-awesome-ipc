import MainIpc from "../../core/ipc/main";

export default async function setup() {
  console.log('setup main...');
  const lindaidai: typeof global.lindaidai = {};
  global.lindaidai = lindaidai;
  const ipc = new MainIpc();
  global.lindaidai.ipc = ipc;
}