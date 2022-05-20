import React, { useState } from 'react';
import Button from 'components/Button';
import Modal from 'components/Modal';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const CreateWorldMutation = gql`
  mutation CreateWorld ($name: String!) {
    createWorld(name: $name) {
      id
      name
    }
  }
`;

export default () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const [createWorld] = useMutation(CreateWorldMutation);
  const navigate = useNavigate(); 
  
  return (
    <>
      <Button className='mt-4 w-fit' onClick={() => setIsModalOpen(true)}>
        <p className='text-4xl'>＋</p>
      </Button>
      <Modal isOpen={isModalOpen} setIsOpen={setIsModalOpen}>
        <Formik
          initialValues={{name: 'New world'}}
          validate={values => {
            const errors = {};
            if (!values.name) {
              errors.name = 'Name your world'
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            let newWorld = await createWorld({variables: {name: values.name}})
            newWorld = newWorld.data.createWorld;
            setSubmitting(false);
            navigate(`/${newWorld.id}`, {replace: true})
          }}
        >
          <Form>
            <Field type='text' name='name'/>
            <ErrorMessage name='name' component='div' className='text-red-500'/>
            <Button className='mt-4'>+ Create world</Button>
          </Form>
        </Formik>
      </Modal>
    </>
  )
}