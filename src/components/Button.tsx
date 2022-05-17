import React, { HTMLAttributes, ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  className?: HTMLAttributes<HTMLButtonElement>;
}

export default ({children, className, ...rest}: Props) => {
  return (
    <button 
      className={`border rounded-xl py-2 px-3 flex items-center hover:border-green-300 active:border-green-500 ${className}`}
      {...rest}
      >
      {children}
    </button>
  )
}