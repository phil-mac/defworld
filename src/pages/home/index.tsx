import React, { useContext, useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { UserContext } from 'contexts/userContext';
import Button from 'components/Button';
import Page from 'components/Page';
import Modal from 'components/Modal';
import CreateWorldButton from './components/CreateWorldButton';

const worlds = gql`
  query Query {
    worlds {
      id
      name
      nodes {
        id
        content
      }
    }
  }
`;

export default () => {
  const { loading, error, data } = useQuery(worlds);
  const user = useContext(UserContext);

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
      <div className='mt-4 flex gap-4'>
        {data.worlds.map((world: any) => (
          <Link key={world.id} to={world.id}>
            <Button >
              <p>{world.name}</p>
            </Button>
          </Link>
        ))}
      </div>
    </Page>
  )
}