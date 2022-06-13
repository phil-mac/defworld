import React, { ReactNode } from 'react';

export default ({children}: {children?: ReactNode}) => {
  return (
    <div className='min-h-full bg-gray-900 flex flex-col'>
      {children}
    </div>
  )
}