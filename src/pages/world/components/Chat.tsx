import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { Field, Form, Formik } from 'formik';
import { UserContext } from 'contexts/userContext';


export default ({socket}) => {
  const user = useContext(UserContext);
  
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef();

  useEffect(() => {
    if (!socket) return;
    
    socket.on('newMessage', onNewMessage);

    return () => {
      socket.off('newMessage', onNewMessage);
    }
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  
  function onNewMessage (message) {
    setMessages(c => [...c, message]);
  };
  
  return (
    <div className='h-full w-full flex flex-col'>
      <div className='flex-auto overflow-y-auto h-12 flex flex-col'>
        <div className='flex-grow' />
        {messages.map(m => (
          <div key={m.id} className='p-1 indent-[-10px] pl-[14px]'>
            {m.from && (<span className='text-green-600'>{m.from}: </span>)}
            <span>{m.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <Formik
        initialValues={{message: ''}}
        validate={values => {
          const errors = {};
          if (!values.message){
            errors.message = 'Must include value'
          }
          return errors;
        }}
        onSubmit={(values, { errors, setSubmitting }) => {
          socket.emit('message', {
            from: user.username, 
            message: values.message,
            id: Math.floor(Math.random() * 100000)
          });

          values.message = '';
          setSubmitting(false);
        }}
      >
        <Form className='mb-0 relative border border-gray-600 rounded-b'>
          <div className='w-full h-full absolute bg-gray-800 opacity-50' />
          <div className='flex relative pointer-events-auto'>
            <Field name='message' type='text' className='bg-transparent flex-grow' autoComplete='off'/>
            <button type='submit' className='px-2 text-xl'>→</button>
          </div>
        </Form>
      </Formik>
    </div>
  )
}