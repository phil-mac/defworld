import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import Button from 'components/Button';
import Page from 'components/Page';
import Editor from './components/Editor';
import GridCanvas from './components/GridCanvas';
import { io } from 'socket.io-client';
import { UserContext } from 'contexts/userContext';

const nodes = gql`
  query QueryWorld ($id: ID!) {
    world (id: $id) {
      id
      name
      grid
      nodes {
        id
      }
    }
  }
`;

// const worldSubscription = gql`
//   subscription OnNodeCreated($worldId: ID!) {
//     nodeCreated(worldId: $worldId) {
//       id
//       grid
//       nodes {
//         id
//       }
//     }
//   }
// `;

export default () => {
  const {worldId} = useParams();
  const user = useContext(UserContext);

  const {loading, error, data, subscribeToMore} = useQuery(nodes, { variables: {id: worldId }});

  // useEffect(() => {
  //   subscribeToMore({
  //     document: worldSubscription,
  //     variables: { worldId },
  //     updateQuery: (prev, { subscriptionData }) => {
  //       if (!subscriptionData.data) return prev;
  //       const updatedWorld = subscriptionData.data.nodeCreated;

  //       return Object.assign({}, prev, {
  //         grid: updatedWorld.grid,
  //         nodes: updatedWorld.nodes
  //       });
  //     }
  //   })
  // }, [])

  const [openNodeId, setOpenNodeId] = useState<string | null>(1);

  useEffect(() => {
    if (!openNodeId && data && data.world.nodes instanceof Array && data.world.nodes.length > 0) {
      setOpenNodeId(data.world.nodes[0].id);
    }
  }, [data]);

  const [socket, setSocket] = useState<any>();

  const onConnectHandler = () => {
    console.log('connected to socket!')
  }

  const onJoinWorld = () => {
    console.log("joined world")
  }

  const onBroadcastHandler = (message) => {
    console.log("incoming: ", message)
  }

  useEffect(() => {
    if (!socket) {
      const newSocket = io('https://defworld-api.phil-mac.repl.co');
      setSocket(newSocket);
      return;
    }

    socket.emit('joinWorld', {name: user.username, worldId });
    socket.on('connect', onConnectHandler);
    socket.on('broadcast', onBroadcastHandler);

    
    return () => {
      socket.off('connect', onConnectHandler);
      socket.off('broadcast', onBroadcastHandler);

      socket?.disconnect();
    }
    
  }, [socket]);

  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error.</p>;

  return (
    <Page>
      <div className='flex w-full grow mt-0'>
        <div className='border mr-8 h-fit p-4 rounded'>
          <Link to='/'>
            <Button>
              {'<--'}
            </Button>
          </Link>
          <h4 className='mx-auto'>{data.world.name}</h4>
          <Button onClick={() => {
            if (!!socket) socket.emit('message', 'Hello there');
          }}>Hey</Button>
        </div>
        <div className='flex w-[400px]'>
          {!!openNodeId && (
            <Editor nodeId={openNodeId} socket={socket}/>
          )}
        </div>
        <GridCanvas 
          chunk={data?.world?.grid || [[1, 1]]}
          className='mt-0'
          openNodeId={openNodeId}
          setOpenNodeId={setOpenNodeId}
          worldId={data.world.id}
          />
      </div>
    </Page>
  )
}