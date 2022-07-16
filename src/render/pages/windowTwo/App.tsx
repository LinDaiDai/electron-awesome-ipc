import React, { useState } from 'react';
import './index.css';
import TestIpc from './TestIpc';

function App() {
  const [isDestoryTestIpc, setIsDestoryTestIpc] = useState<boolean>(false);

  const toggleShowTestIpc = () => {
    setIsDestoryTestIpc(!isDestoryTestIpc);
  }

  return <div className='container'>
    <h1>WindowTwo</h1>
    <button onClick={toggleShowTestIpc}>destory TestIpc Component</button>
    {!isDestoryTestIpc && <TestIpc /> }
  </div>
}

export default App;