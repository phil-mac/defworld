import React, { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default ({children, className, onClick, ...rest}: Props) => {
  return (
    <button 
      className={`rounded-xl py-2 px-3 flex justify-center items-center bg-gray-700 hover:bg-gray-600 active:bg-gray-500 ${className}`}
      onClick={onClick}
      {...rest}
      >
      {children}
    </button>
  )
}