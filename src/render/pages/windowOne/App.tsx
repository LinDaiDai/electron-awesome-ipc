import React, { useState } from 'react';
import './index.css';
import TestIpc from './TestIpc';

function App() {
  const [isDestoryTestIpc, setIsDestoryTestIpc] = useState<boolean>(false);

  const toggleShowTestIpc = () => {
    setIsDestoryTestIpc(!isDestoryTestIpc);
  }

  return <div className='container'>
    <h1>WindowOne</h1>
    {!isDestoryTestIpc && <TestIpc /> }
    <button onClick={toggleShowTestIpc}>{`${isDestoryTestIpc ? 'create' : 'destory'} TestIpc Component`}</button>
  </div>
}

export default App;