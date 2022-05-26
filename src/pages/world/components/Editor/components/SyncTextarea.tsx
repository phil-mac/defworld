import Button from 'components/Button';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export default ({initialValue, socket, username, nodeId}) => {
  const [draftContent, setDraftContent] = useState(initialValue);

  const rev = useRef(0);
  const sentOps = useRef([]);
  const pendingOps = useRef([]);
  const [content, setContent] = useState([]);
  
  useEffect(() => {
    if (!socket) return;
    socket.emit('joinNode', {name: username, nodeId });
    socket.on('textUpdated', applyOp);
    socket.on('opAcknowledged', processAck);
    
    return () => {
      socket.off('textUpdated', applyOp);
      socket.off('opAcknowledged', processAck);
      socket.emit('leaveNode', {name: username, nodeId });
    }
  }, [nodeId, socket])

  function createOp(type, pos, text) {
    const op = {type, pos, text, rev: rev.current + 1};
    addOpToPending(op);
  };

  function addOpToPending(op) {
    pendingOps.current.push(op);
    attemptNextSend();
  }

  function attemptNextSend() {
    if (sentOps.current.length > 0) return;
    if (pendingOps.current.length === 0) return;
    
    const op = pendingOps.current.shift();
    op.rev = rev.current + 1;
    sentOps.current.push(op);
    socket.emit('updateText', op);
  }

  function processAck({ack}) {
    if (sentOps.current.length === 0) return;
    const op = sentOps.current.shift();    
    
    // applyOp(op);
    // for now, ignoring the op transform from server
    // only accounting for rev transform from server
    rev.current = ack;
    attemptNextSend();
  }

  const textareaRef = useRef<HTMLTextAreaElement>();
  const caretPos = useRef(0);

  function applyOp(op) {
    rev.current = op.rev;
    // console.log("latest rev: ", rev.current)
    caretPos.current = textareaRef.current?.selectionStart || 0;
    console.log('caretPos: ', caretPos.current)
    setContent(current => current.slice(0, op.pos) + op.text + current.slice(op.pos));
  }

 

  useEffect(() => {
    console.log("update content to: ", content)
    setDraftContent(content);
  }, [content]);

  // function setCaretPosition(elem, caretPos) {
  //   var range;

  //   if (elem.createTextRange) {
  //       range = elem.createTextRange();
  //       range.move('character', caretPos);
  //       range.select();
  //   } else {
  //       elem.focus();
  //       if (elem.selectionStart !== undefined) {
  //           elem.setSelectionRange(caretPos, caretPos);
  //       }
  //   }
  // }
  
  useEffect(() => {
    if (caretPos.current !== undefined && caretPos.current !== -1) {
      console.log("set selection range: ", caretPos.current)
      // textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(caretPos.current, caretPos.current);
      // setCaretPosition(textareaRef.current, caretPos);
      caretPos.current = -1;
    }
  }, [draftContent])
  

  return (
    <textarea 
      ref={textareaRef}
      className='mt-2 flex-grow w-[300px] resize-none rounded' 
      value={draftContent}
      onChange={e => {
        const text = e.nativeEvent.data;
        const pos = e.target.selectionStart - 1;
        const type = 'add';

        caretPos.current = -1;
        // caretPos.current = textareaRef.current?.selectionStart;
        // console.log(e)

        createOp(type, pos, text);

        setDraftContent(e.target.value);
        setContent(e.target.value);
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

