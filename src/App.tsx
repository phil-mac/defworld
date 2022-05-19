import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/home';
import World from './pages/world';

export default () => {

  let navigate = useNavigate();
  React.useEffect(() => {
    navigate('/1', { replace: true });
  }, [])
  
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/:worldId' element={<World />} />
      </Routes>
    </>
  )
}