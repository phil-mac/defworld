import Button from 'components/Button';
import React, { useCallback, useEffect, useState } from 'react';

export default ({initialValue, socket, username, nodeId}) => {
  const [draftContent, setDraftContent] = useState(initialValue);

  const [rev, setRev] = useState(0);
  const [sentOps, setSentOps] = useState([]);
  const [pendingOps, setPendingOps] = useState([]);
  const [content, setContent] = useState([]);

  const updateContentSocket = ({type, pos, text}) => {
    console.log('operation recieved: ', {type, pos, text});
    setContent(current => current.slice(0, pos) + text + current.slice(pos));
  };
  
  useEffect(() => {
    if (!socket) return;
    socket.emit('joinNode', {name: username, nodeId });
    socket.on('textUpdated', updateContentSocket);
    
    return () => {
      socket.off('textUpdated', updateContentSocket);
      socket.emit('leaveNode', {name: username, nodeId });
    }
  }, [nodeId, socket])

  const createOp = useCallback((type, pos, text) => {
    const op = {type, pos, text, rev};
    console.log("create op: ", op);

    setPendingOps(currentPendingOps => [...currentPendingOps, op]);
  }, [rev]);

  useEffect(() => {
    // replace this useEffect with listener for go-ahead from server (new revision or w/e)
    console.log('pending ops changed: ', pendingOps);
    if (pendingOps.length === 0) return;
    sendOp(pendingOps[0]);
  }, [pendingOps]);

  function sendOp(op) {
    socket.emit('updateText', op);
    setPendingOps(current => current.slice(1))
    setSentOps(current => [...current, op]);
  }

  useEffect(() => {
    // replace this useEffect with listner for ack
    if (sentOps.length === 0) return;
    const op = sentOps[0];
    setSentOps(current => current.slice(1));

    applyOp(op);
  }, [sentOps]);

  function applyOp(op) {
    const {type, pos, text, rev} = op;
    // change this to use same "apply" functiona as in reciever (eventually)
    const newContent = content.slice(0, pos) + text + content.slice(pos);
    console.log({newContent})
    setContent(newContent);
  }
  

  useEffect(() => {
    setDraftContent(content);
  }, [content])

  return (
    <textarea 
      className='mt-2 flex-grow w-[300px] resize-none rounded' 
      value={draftContent}
      onChange={e => {
        const text = e.nativeEvent.data;
        const pos = e.target.selectionStart - 1;
        const type = 'add';

        createOp(type, pos, text);


        setDraftContent(e.target.value);
      }}
      onSelect={e => {
        // console.log(e.target.selectionStart)
        // if (e.nativeEvent.type == 'mouseup'){
        //   console.log('set cursor pos:', e.target.selectionStart)
        //   setCursorPos(e.target.selectionStart);
        // }
      }}
      /> 
  )
}

