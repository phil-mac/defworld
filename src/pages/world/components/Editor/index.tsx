import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from 'contexts/userContext';
import SyncCodemirror from './components/SyncCodemirror';

type Props = {
  nodeId: String;
  socket: any;
}

export default ({nodeId, setOpenNodeId, socket}: Props) => {

  const user = useContext(UserContext);

  const [initialDoc, setInitialDoc] = useState()
  const [initialRev, setInitialRev] = useState()
  const [result, setResult] = useState('');
  
  function evalResult ({result}) {
    console.log('eval result: ', result);
    setResult(result);
  }

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinNode', {name: user.username, nodeId });
    
    socket.on('initContent', initContent);
    socket.on('evalResult', evalResult);
    
    return () => {
      socket.off('initContent', initContent);
      socket.off('evalResult', evalResult);
      
      socket.emit('leaveNode', {name: user.username, nodeId });
    }
  }, [nodeId, socket])

  function initContent ({doc, rev}) {
    setInitialDoc(doc);
    setInitialRev(rev);
  }
  
  return (
    <div className='flex flex-col h-full'>
      <div className='bg-stone-800 px-3 flex flex-none justify-between border-b border-gray-600'>
        <h6>Node {nodeId}</h6>
        <button 
          className='' 
          onClick={() => {
            setOpenNodeId(null);
          }}
        >
          ╳
        </button>
      </div>
      <div className='grow min-h-12 w-full overflow-auto'>
        <SyncCodemirror 
          socket={socket} 
          nodeId={nodeId} 
          username={user.username} 
          initialDoc={initialDoc} 
          initialRev={initialRev}
        />
      </div> 
      <div className='flex-none p-2 min-h-[48px] max-h-[48px] border-t border-gray-600'>
        <p className='whitespace-pre'>{result || '--'}</p>
      </div>
    </div>
  )
}