import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from 'pages/home';
import Join from 'pages/join';
import World from 'pages/world';
import { UserContext } from 'contexts/userContext';

export default () => {
  let navigate = useNavigate();
  React.useEffect(() => {
    // navigate to world 1 immediately, to speed development testing
    navigate('/1', { replace: true });
  }, []);

  // generate random player name, to speed development testing
  const ran = Math.floor(Math.random()*1000);
  const username = 'player-' + ran;

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