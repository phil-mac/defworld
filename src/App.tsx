import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/home';
import World from './pages/world';

export default () => {

  // hack to make the embedded replit browser route to home
  let navigate = useNavigate();
  React.useEffect(() => {
    navigate('/', { replace: true });
  }, [])
  
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/world' element={<World />} />
      </Routes>
    </div>
  )
}