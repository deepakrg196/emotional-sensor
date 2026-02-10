import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import WebcamEmotion from './components/WebcamEmotion';
import Login from './components/Login';
import Signup from './components/Signup';
import ChatBot from './components/ChatBot.jsx';

function Shell() {
  const { user, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="app-container">
      <div className="topbar">
        <h1 className="brand-title">Emotional Sensor</h1>
        {user ? (
          <div className="topbar-right">
            <span className="user-pill">{user.email}</span>
            <button className="btn" type="button" onClick={logout}>Log out</button>
          </div>
        ) : null}
      </div>

      {!user ? (
        <div className="content">
          {showSignup ? (
            <Signup onSwitch={() => setShowSignup(false)} />
          ) : (
            <Login onSwitch={() => setShowSignup(true)} />
          )}
        </div>
      ) : (
        <div className="content">
          <WebcamEmotion />
          <ChatBot />
        </div>
      )}
    </div>
  );
}

export default function App(){
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
