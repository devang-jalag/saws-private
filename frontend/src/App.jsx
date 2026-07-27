import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointment from './pages/Appointment';
import Chatbot from './pages/Chatbot';
import Analytics from './pages/Analytics';

function App() {
  // Simple fake auth state for demo purposes
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/" className="nav-brand">SAWS SmartCare</Link>
          <div className="nav-links">
            {!isAuthenticated ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" className="btn" style={{padding: '0.5rem 1rem'}}>Sign Up</Link>
                {/* Developer toggle to test authenticated views */}
                <button onClick={() => setIsAuthenticated(true)} style={{fontSize: '0.75rem', background: '#e5e7eb', color: '#000'}}>Dev: Log In</button>
              </>
            ) : (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/appointment">Appointments</Link>
                <Link to="/chatbot">Chatbot</Link>
                <Link to="/analytics">Analytics</Link>
                <button onClick={() => setIsAuthenticated(false)} className="btn btn-secondary" style={{padding: '0.5rem 1rem'}}>Logout</button>
              </>
            )}
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
