const sleep = async (duration: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

export const testIpc = () => {
  global.lindaidai.ipc?.on('window-one-send-main', (ctx, data) => {
    console.log('window-one-send-main data:', data);
  });

  global.lindaidai.ipc?.on('window-one-request-main', async (ctx, params) => {
    console.log('window-one-request-main:', params);

    await sleep(3000);

    ctx.request.resolve('I am window-one-request-main result');
  });

  global.lindaidai.ipc?.on('window-two-send-main', (ctx, data) => {
    console.log('window-two-send-main data:', data);
  });

  global.lindaidai.ipc?.on('window-two-request-main', async (ctx, params) => {
    console.log('window-two-request-main:', params);

    await sleep(3000);

    ctx.request.resolve('I am window-two-request-main result');
  });
}
