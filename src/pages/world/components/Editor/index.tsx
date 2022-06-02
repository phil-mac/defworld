import React, { useContext, useEffect, useState } from 'react';
import { gql, useQuery } from "@apollo/client";
import Button from 'components/Button';
import { UserContext } from 'contexts/userContext';
import SyncCodemirror from './components/SyncCodemirror';

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

// const updateMutation = gql`
//   mutation UpdateNodeContent ($nodeId: ID!, $content: String!) {
//     updateNodeContent (id: $nodeId, content: $content) {
//       id
//       content
//       result
//       blocks
//     }
//   }
// `;


export default ({nodeId, socket}: Props) => {

  const {loading, error, data } = useQuery(contentQuery, {variables: {nodeId}});
  const user = useContext(UserContext);

  const [initialDoc, setInitialDoc] = useState('')
  const [initialRev, setInitialRev] = useState('')
  
  // const [content, setContent] = useState('');

  // const [updateContent, { data: mData }] = useMutation(updateMutation, {
  //   refetchQueries: ['QueryWorld']
  // });
  // const [updateContent, { data: mData }] = useMutation(updateMutation);


  // useEffect(() => {
  //   if (data) {
  //     setContent(data.node.content);
  //   }
  // }, [data])

  const run = () => {
    console.log("placeholder for run")
  }

  // const run = useCallback(() => {
    // updateContent({
    //   variables: { nodeId, content: draftContent }
    // });
  // }, [nodeId, draftContent, content]);

  // const runShortcutCallback = e => {
  //   if (e.metaKey === true && e.key === 'Enter') {
  //     console.log('run')
  //     run();
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener('keydown', runShortcutCallback);
  //   return () => { 
  //     document.removeEventListener('keydown', runShortcutCallback);
  //   };
  // }, [run])

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinNode', {name: user.username, nodeId });
    socket.on('initContent', initContent);
    // socket.on('selectionUpdated', updateSelection);
    
    return () => {
      socket.off('initContent', initContent);
      // socket.off('selectionUpdated', updateSelection);
      // TODO fix hardcoded name:
      socket.emit('leaveNode', {name: 'Phil', nodeId });
    }
  }, [nodeId, socket])

  function initContent ({doc, rev}) {
    console.log('init', {rev, doc})
    setInitialDoc(doc);
    setInitialRev(rev);
  }
  
  return (
    <div className='flex flex-col px-4 w-full h-[500px]'>
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
            <SyncCodemirror socket={socket} nodeId={nodeId} username={user.username} initialDoc={initialDoc} initialRev={initialRev}/>
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