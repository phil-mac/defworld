import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

export default ({isOpen, setIsOpen, children}) => {
  if (!isOpen) return;

  const close = () => setIsOpen(false);
  
  return ReactDOM.createPortal(
    <div className='p-12 absolute top-0 h-full w-full flex items-center justify-center'>
      <div 
        className='p-4 bg-gray-900 absolute top-0 left-0 opacity-70 h-full w-full'
        onClick={close}
      />
      <div className='relative z-10'>
        <Button className='ml-auto mb-2 font-bold rounded-full' onClick={close}>╳</Button>
        <div className='p-4 bg-green-900 rounded'>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}