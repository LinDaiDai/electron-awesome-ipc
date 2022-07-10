import React, { useEffect, useState } from 'react';
import './index.css';

function App() {
  const sendMessageToWindowTwo = () => {
    // window.lindaidai.ipc.send('window-one-to-winow-two', 'window-one-to-winow-two');
  }
  const sendMessageToMain = () => {
    window.lindaidai.ipc?.send('render-to-main', 'render-to-main');
  }

  useEffect(() => {
    window.lindaidai.ipc?.on('test.ipc', () => {
      console.log('-----test');
    });
  }, []);

  return <div className='container'>
    <h1>窗口1</h1>
    <button onClick={sendMessageToWindowTwo}>点击发送消息给窗口2</button>
    <button onClick={sendMessageToMain}>点击发送消息给主进程</button>
  </div>
}

export default App;