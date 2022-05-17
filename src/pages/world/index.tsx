import React from 'react';
import { Link } from 'react-router-dom';
import Home from '../home';
import Button from 'components/Button';

export default () => {
  return (
    <div>
      <Link to='/'>
        <Button>
          {'<-'}
        </Button>
      </Link>
      <h2>World</h2>
    </div>
  )
}