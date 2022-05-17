import React from 'react';

export default ({children, className, ...rest}) => {
  return (
    <button 
      className={`border rounded-xl py-2 px-3 flex items-center hover:border-green-300 active:border-green-500 ${className}`}
      {...rest}
      >
      {children}
    </button>
  )
}