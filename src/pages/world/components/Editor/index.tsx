import React, { useCallback, useContext, useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from "@apollo/client";
import Button from 'components/Button';
import { UserContext } from 'contexts/userContext';

type Props = {
  nodeId: String;
  socket: any;
}

const contentQuery = gql`
  query QueryNodeContent ($nodeId: ID!) {
    node (id: $nodeId) {
      id
      content
      result
      blocks
    }
  }
`;

const updateMutation = gql`
  mutation UpdateNodeContent ($nodeId: ID!, $content: String!) {
    updateNodeContent (id: $nodeId, content: $content) {
      id
      content
      result
      blocks
    }
  }
`;

export default ({nodeId, socket}: Props) => {

  const {loading, error, data } = useQuery(contentQuery, {variables: {nodeId}});

  const [content, setContent] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [addedText, setAddedText] = useState('');
  const [cursorPos, setCursorPos] = useState(-1);

  useEffect(() => {
    setAddedText('');
  }, [cursorPos])

  useEffect(() => {
    setDraftContent(content);
  }, [content])

  // const [updateContent, { data: mData }] = useMutation(updateMutation, {
  //   refetchQueries: ['QueryWorld']
  // });
  const [updateContent, { data: mData }] = useMutation(updateMutation);


  useEffect(() => {
    if (data) {
      setContent(data.node.content);
    }
  }, [data])

  const run = useCallback(() => {
    updateContent({
      variables: { nodeId, content }
    });
  }, [nodeId, content]);

  const runShortcutCallback = e => {
    // console.log('key: ', e.key);
    if (e.metaKey === true && e.key === 'Enter') {
      console.log('run')
      run();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', runShortcutCallback);

    return () => { 
      document.removeEventListener('keydown', runShortcutCallback);
    };
  }, [run])

  const user = useContext(UserContext);

  const updateContentSocket = useCallback(({type, pos, text}) => {
    console.log('transformation recieved: ', {type, pos, text});
    console.log({content})
    const newContent = content.slice(0, pos) + text + content.slice(pos);
    console.log({newContent})
    setContent(newContent);
  }, [content]);

  useEffect(() => {
    if (!socket) return;
    
    socket.emit('joinNode', {name: user.username, nodeId });

    socket.on('textUpdated', updateContentSocket);
    
    return () => {
      socket.off('textUpdated', updateContentSocket);
      socket.emit('leaveNode', {name: user.username, nodeId });
    }

  }, [nodeId, socket, content])
  
  return (
    <div className='flex flex-col px-4 w-full h-[700px]'>
      <div className='w-full flex-grow'>
        {loading && (<p>Loading...</p>)}
        {error && (<p>Error.</p>)}
        {data && (
          <div className='h-full flex flex-col'>
            <Button 
              className='mx-auto' 
              onClick={run}>
              Run
            </Button>
            <Button onClick={() => {
              const transformation = {type: 'add', pos: cursorPos, text: addedText};

              console.log({transformation});
               
              socket.emit('updateText', transformation);
            }}>
              Sync
            </Button>
            <textarea 
              className='mt-2 flex-grow w-full resize-none rounded' 
              value={draftContent}
              onChange={e => {
                console.log(e.nativeEvent.data);
                setAddedText(addedText + e.nativeEvent.data);
                setDraftContent(e.target.value);
              }}
              onSelect={e => {
                // console.log(e.nativeEvent);
                if (e.nativeEvent.type == 'mouseup'){
                  console.log('set cursor pos:', e.target.selectionStart)
                  setCursorPos(e.target.selectionStart);
                }
              }}
            /> 
          </div>
        )}
      </div> 
      <div className='mt-4 p-2 rounded h-24 bg-gray-700'>
        {loading && (<p>Loading...</p>)}
        {error && (<p>Error.</p>)}
        {data && (
          <p className='whitespace-pre'>{data.node.result || '--'}</p>
        )}
      </div>
    </div>
  )
}