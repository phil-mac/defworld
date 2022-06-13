import { Link } from 'react-router-dom';
import React from 'react';
import Button from 'components/Button';

export default ({worldName, users}) => {
  return (
    <>
      <div className='relative rounded overflow-hidden border border-gray-600'>
        <div className='bg-gray-800 opacity-60 absolute h-full w-full'/>
        <div className='flex justify-evenly items-center p-2 relative'>
          <h4 className=''>{worldName}</h4>
          <Link to='/'>
            <Button className='pointer-events-auto'>
              Leave
            </Button>
          </Link>
        </div>
      </div>
      <div className='space-y-2 mt-2'>
        {Object.keys(users).map(key => (
          <div key={users[key].username} className='relative overflow-hidden rounded border border-gray-600 w-5/6 ml-auto'>
            <div className='bg-gray-800 opacity-60 absolute h-full w-full'/>
            <div className='relative p-1 flex'> 
              <div className='bg-green-800 h-8 w-8 rounded-full mr-4'/>
              <h6>{users[key].username}</h6>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}