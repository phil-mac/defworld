import Button from 'components/Button';
import Page from 'components/Page';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import { UserContext } from 'contexts/userContext';
import { useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

const CreateUserMutation = gql`
  mutation CreateUser($username: String!) {
    createUser(username: $username) {
      id
      username
    }
  }
`;

export default ({setUser}) => {
  const userContext = React.useContext(UserContext);
  const navigate = useNavigate();

  const [createUser] = useMutation(CreateUserMutation);
  
  return (
    <Page>
      {!!userContext && <p>{JSON.stringify(userContext)}</p>}
      <Formik
        initialValues={{username: 'New player'}}
        validate={values => {
          const errors = {};
          if (!values.username) {
            errors.username = 'Must choose a username';
          }
          return errors;
        }}
        onSubmit={async (values, { setSubmitting }) => {
          let user = await createUser({variables: { username: values.username}});
          user = user.data.createUser;
          console.log({user})
          setUser({username: user.username, id: user.id});
          
          setSubmitting(false);
          navigate('/', {replace: true});
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <div className='space-y-4'>
              <h4>Join form</h4>
              <Field type='text' name='username' />
              <ErrorMessage name='username' component='div' className='text-pink-500'/>
              <Button type='submit' disabled={isSubmitting}>Submit</Button>
            </div>
          </Form>
        )}
      </Formik>
    </Page>
  )
};