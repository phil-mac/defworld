import React, { ReactNode } from 'react';

export default ({children}: {children?: ReactNode}) => {
  return (
    <div className='min-h-full bg-gray-900 p-4 flex flex-col'>
      {children}
    </div>
  )
}