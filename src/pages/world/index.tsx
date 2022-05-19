import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import Home from '../home';
import Button from 'components/Button';
import Page from 'components/Page';
import Editor from './components/Editor';
import GridCanvas from './components/GridCanvas';

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

export default () => {
  const {worldId} = useParams();

  const {loading, error, data} = useQuery(nodes, { variables: {id: worldId }});

  const [openNodeId, setOpenNodeId] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect, data: ', data);
    if (!openNodeId && data && data.world.nodes instanceof Array && data.world.nodes.length > 0) {
      setOpenNodeId(data.world.nodes[0].id);
    }
  }, [data])

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
        </div>
        <div className='flex w-[400px]'>
          {!!openNodeId && (
            <Editor nodeId={openNodeId} />
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