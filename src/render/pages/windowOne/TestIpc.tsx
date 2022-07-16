import React, { useEffect } from 'react';

const TestIpc = () => {
  const sendMessageToMain = () => {
    window.lindaidai.ipc?.send('window-one-send-main', 'window-one-send-main');
  }
  const sendMessageToWindowTwo = () => {
    window.lindaidai.ipc?.send('window-one-send-winow-two', 'window-one-send-winow-two');
  }
  const requestMessageToMain = async () => {
    const result = await window.lindaidai.ipc?.request('window-one-request-main', 15000 ,{ data: 'I am windowOne params' });
    console.log('requestMessageToMain result:', result);
  }
  const requestMessageToWindowTwo = async () => {
    const result = await window.lindaidai.ipc?.request('window-one-request-window-two', 'infinite' ,{ data: 'I am windowOne params' });
    console.log('requestMessageToWindowTwo result:', result);
  }
  useEffect(() => {
    const handleMainSendWindowOne = (ctx, data) => {
      console.log('main-send-window-one data:', data);
    }
    const handleWindowTwoSendWindowOne = (ctx, data) => {
      console.log('window-two-send-window-one data:', data);
    }
    const handleWindowTwoRequestWindowOne = async (ctx, params) => {
      console.log('window-two-request-window-one params:', params);

      const sleep = async (duration: number): Promise<void> => {
        return new Promise(resolve => {
          setTimeout(resolve, duration);
        });
      }
      await sleep(3000);

      ctx.request.resolve('I am window-two-request-window-one result');
    }
    window.lindaidai.ipc?.on('main-send-window-one', handleMainSendWindowOne);
    window.lindaidai.ipc?.on('window-two-send-window-one', handleWindowTwoSendWindowOne);
    window.lindaidai.ipc?.on('window-two-request-window-one', handleWindowTwoRequestWindowOne);

    return () => {
      window.lindaidai.ipc?.off('main-send-window-one', handleMainSendWindowOne);
      window.lindaidai.ipc?.off('window-two-send-window-one', handleWindowTwoSendWindowOne);
      window.lindaidai.ipc?.removeListener('window-two-request-window-one', handleWindowTwoRequestWindowOne);
    }
  }, []);
  return <>
    <button onClick={sendMessageToMain}>WindowOne send to Main</button>
    <button onClick={sendMessageToWindowTwo}>WindowOne send to WindowTwo</button>
    <button onClick={requestMessageToMain}>WindowOne request to Main</button>
    <button onClick={requestMessageToWindowTwo}>WindowOne request to WindowTwo</button>
  </>
}

export default TestIpc;
