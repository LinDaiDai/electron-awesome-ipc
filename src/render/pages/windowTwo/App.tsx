import React, { useEffect } from 'react';
import './index.css';

function App() {
  const handleIpcMessage = (e, data) => {
    console.log('handleIpcMessage', data);
  }
  useEffect(() => {
    // window.lindaidai.ipc.on('window-one-to-winow-two', handleIpcMessage)
    return () => {
      // window.lindaidai.ipc.off('window-one-to-winow-two', handleIpcMessage)
    }
  }, [])
  return <div className='container'>
    <h1>窗口2</h1>
  </div>
}

export default App;