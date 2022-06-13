import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import Page from 'components/Page';
import Editor from './components/Editor';
import Chat from './components/Chat';
import { io } from 'socket.io-client';
import { UserContext } from 'contexts/userContext';
import Overview from './components/Overview';
import BabylonCanvas from './components/BabylonCanvas';

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

// ---- removing graphql subscription for now, exploring using just sockets.io ----
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

  const [users, setUsers] = useState({});
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    let usersCopy = {...users};
    usersCopy[user.username] = user;
    setUsers(usersCopy);
  }, [])

  const {loading, error, data, subscribeToMore} = useQuery(nodes, { variables: {id: worldId }});

  // ---- removing graphql subscription for now, exploring using just sockets.io ----
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

  const initWorldUsers = ({users}) => {
    console.log("init world users: ", users);
    setUsers(c => ({...c, ...users}));
  }

  const onUserJoined = ({user: joiningUser}) => {
    console.log("add world user: ", joiningUser);
    setUsers(c => {
      let usersCopy = {...c};
      usersCopy[joiningUser.username] = joiningUser;
      return usersCopy;
    });
  }

  const onUserLeft = ({user: leavingUser}) => {
    console.log("remove world user: ", leavingUser);
    setUsers(c => {
      let usersCopy = {...c};
      delete usersCopy[leavingUser.username];
      return usersCopy;
    });
  }

  useEffect(() => {
    if (!socket) {
      const newSocket = io('https://defworld-api.phil-mac.repl.co');
      setSocket(newSocket);
      return;
    }

    socket.emit('joinWorld', {name: user.username, worldId });
    socket.on('connect', onConnectHandler);
    socket.on('initWorldUsers', initWorldUsers);
    socket.on('userJoined', onUserJoined);
    socket.on('userLeft', onUserLeft);
    socket.on('gridUpdate', ({grid}) => {
      console.log('got grid update: ', grid);
      setBlocks(grid);
    });
    socket.on('initWorldGrid', ({grid}) => {
      setBlocks(grid);
    })
    
    return () => {
      socket.off('connect', onConnectHandler);
      socket.off('initWorldUsers', initWorldUsers);
      socket.off('userJoined', onUserJoined);
      socket.off('userLeft', onUserLeft);
    

      socket?.disconnect();
    }
    
  }, [socket]);

  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error.</p>;

  return (
    <Page>
      <div className='flex w-full grow mt-4 justify-center relative'>
        <BabylonCanvas
          blocks={blocks}
          openNodeId={openNodeId}
          setOpenNodeId={setOpenNodeId}
          worldId={data.world.id}
          />
        <div 
          className='fixed w-full h-full 
            grid grid-cols-in-world-ui 
            grid-rows-in-world-ui
            pointer-events-none' 
        >
          {!!openNodeId && (
            <div className='border border-gray-600 rounded row-start-1 row-end-3 pointer-events-auto relative overflow-hidden m-2'>
              <div className='bg-gray-800 opacity-60 absolute h-full w-full'/>
              <div className='relative h-full'>
                <Editor nodeId={openNodeId} setOpenNodeId={setOpenNodeId} socket={socket}/>
              </div>
            </div>
          )}

          <div className='rounded col-start-3 m-2'>
            <Overview worldName={data.world.name} users={users} />
          </div>
          
          <div className='rounded col-start-3 row-start-2 relative overflow-hidden m-2'>
              <Chat socket={socket}/>
          </div>

          {/*
          ---- hiding abilities shelf for now, til basic functionality is stable ----
          <div className='border w-80 mt-4 p-4 rounded col-span-3 mx-auto pointer-events-auto'>
            <h5>Abilities</h5>
          </div>
          */}
        </div>
      </div>
    </Page>
  )
}