import Button from 'components/Button';
import React from 'react';
import { Link } from 'react-router-dom';
// import formatDistanceToNow from 'date-fns/formatDistanceToNow';
// {lastVisited && <p>{formatDistanceToNow(new Date(lastVisited))} ago</p>}

export default ({worldName, worldId, lastVisited}) => {
  return (
    <Link key={worldId} to={worldId}>
      <Button>
        <div className='text-left'>
          <h4>{worldName}</h4>
          
        </div>
      </Button>
    </Link>
  )
}