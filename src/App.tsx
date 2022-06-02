import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from 'pages/home';
import Join from 'pages/join';
import World from 'pages/world';
import { UserContext } from 'contexts/userContext';

export default () => {
  let navigate = useNavigate();
  React.useEffect(() => {
    navigate('/1', { replace: true });
  }, []);

  const ran = Math.floor(Math.random()*1000);
  const username = 'user-' + ran;

  // const [user, setUser] = useState(null);
  const [user, setUser] = useState({username, id: 1});



  useEffect(() => {
    if (!user) {
      navigate('/join', { replace: true });
    }
  }, [])

  if (!user) {
    return <Join setUser={setUser} />
  }
  
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