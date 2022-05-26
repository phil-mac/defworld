import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from 'pages/home';
import Join from 'pages/join';
import World from 'pages/world';
import { UserContext } from 'contexts/userContext';

export default () => {
  let navigate = useNavigate();
  React.useEffect(() => {
    navigate('/', { replace: true });
  }, []);

  const [user, setUser] = useState({username: 'Phil', id: 1});

  useEffect(() => {
    if (!user) {
      navigate('/join', { replace: true });
    }
  }, [])
  
  return (
    <>
      <UserContext.Provider value={user}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/join' element={<Join setUser={setUser} />} />
          <Route path='/:worldId' element={<World />} />
        </Routes>
      </UserContext.Provider>
    </>
  )
}