import React, { useContext, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { UserContext } from 'contexts/userContext';
import Button from 'components/Button';
import Page from 'components/Page';
import Modal from 'components/Modal';
import CreateWorldButton from './components/CreateWorldButton';
import RecentWorldCard from './components/RecentWorldCard';

const homeQuery = gql`
  query HomeQuery ($userId: ID!) {
    worlds {
      id
      name
    }
    user (id: $userId) {
      worldUsers {
        id
        lastVisited
        world {
          name
        }
      }
    }
  }
`;

export default () => {
  const user = useContext(UserContext);
  const { loading, error, data } = useQuery(homeQuery, { variables: {userId: user.id}});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <Page>
      <div className='flex justify-between'>
        <h1>defworld</h1>
        <p>{!!user && user.username + ' - ' + user.id}</p>
      </div>
      <h3 className='mt-12'>create</h3>
      <CreateWorldButton />
      <h3 className='mt-8'>recent</h3>
      <div className='mt-4 flex gap-4 flex-wrap'>
        {data.user.worldUsers.map((worldUser: any) => (
          <RecentWorldCard 
            key={worldUser.id}
            worldId={worldUser.id} 
            worldName={worldUser.world.name} 
            lastVisited={worldUser.lastVisited}/>
        ))}
      </div>
      <h3 className='mt-8'>all</h3>
      <div className='mt-4 flex gap-4 flex-wrap'>
        {data.worlds.map((world: any) => (
          <RecentWorldCard key={world.id} worldId={world.id} worldName={world.name}/>
        ))}
      </div>
    </Page>
  )
}