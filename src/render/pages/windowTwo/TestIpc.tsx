import React, { useEffect } from 'react';

const TestIpc = () => {
  const sendMessageToMain = () => {
    window.lindaidai.ipc?.send('window-two-send-main', 'window-two-send-main');
  }
  const sendMessageToWindowTwo = () => {
    window.lindaidai.ipc?.send('window-two-send-winow-one', 'window-two-send-winow-one');
  }
  const requestMessageToMain = async () => {
    const result = await window.lindaidai.ipc?.request('window-two-request-main', 15000 ,{ data: 'I am windowTwo params' });
    console.log('requestMessageToMain result:', result);
  }
  const requestMessageToWindowOne = async () => {
    const result = await window.lindaidai.ipc?.request('window-two-request-window-one', 15000 ,{ data: 'I am windowTwo params' });
    console.log('requestMessageToWindowOne result:', result);
  }
  useEffect(() => {
    const handleMainSendWindowTwo = (ctx, data) => {
      console.log('main-send-window-two data:', data);
    };
    const handleWindowOneSendWindowTwo = (ctx, data) => {
      console.log('window-one-send-winow-two data:', data);
    };
    const handleWindowOneRequestWindowTwo = async (ctx, params) => {
      console.log('window-one-request-window-two params:', params);

      const sleep = async (duration: number): Promise<void> => {
        return new Promise(resolve => {
          setTimeout(resolve, duration);
        });
      }
      await sleep(17000);

      ctx.request.resolve('I am window-one-request-window-two result');
    }
    window.lindaidai.ipc?.on('main-send-window-two', handleMainSendWindowTwo);
    window.lindaidai.ipc?.on('window-one-send-winow-two', handleWindowOneSendWindowTwo);
    window.lindaidai.ipc?.on('window-one-request-window-two', handleWindowOneRequestWindowTwo);
    return () => {
      window.lindaidai.ipc?.off('main-send-window-two', handleMainSendWindowTwo);
      window.lindaidai.ipc?.off('window-one-send-winow-two', handleWindowOneSendWindowTwo);
      window.lindaidai.ipc?.removeListener('window-one-request-window-two', handleWindowOneRequestWindowTwo);
    }
  }, []);
  return <>
    <button onClick={sendMessageToMain}>WindowTwo send to Main</button>
    <button onClick={sendMessageToWindowTwo}>WindowTwo send to WindowOne</button>
    <button onClick={requestMessageToMain}>WindowTwo request to Main</button>
    <button onClick={requestMessageToWindowOne}>WindowTwo request to WindowOne</button>
  </>
}

export default TestIpc;
