import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Button from 'components/Button';
import { Link } from 'react-router-dom';

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <div className='p-12'>
      <h1>defworld</h1>
      <h3 className='mt-12'>create</h3>
      <Button className='mt-4'>
        <p className='text-4xl'>＋</p>
      </Button>
      <h3 className='mt-8'>recent</h3>
      <div className='mt-4 flex gap-4'>
        {data.worlds.map((world: any) => (
          <Button key={world.id}>
            <p>{world.name}</p>
          </Button>
        ))}
      </div>
      <Link to='/world'>world</Link>
    </div>
  )
}