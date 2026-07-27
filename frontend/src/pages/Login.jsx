import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [cipherAnswer, setCipherAnswer] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    // Simulate API call to auth
    const mockUser = {
      username: email,
      role: email.includes('coordinator') ? 'COORDINATOR' : 'PATIENT'
    };
    const mockToken = 'dummy-jwt-token-12345';
    login(mockUser, mockToken);
    navigate(mockUser.role === 'COORDINATOR' ? '/dashboard' : '/appointments');
  };

  return (
    <div className="auth-container" style={{display: 'flex', justifyContent: 'center', marginTop: '2rem'}}>
      <div className="card auth-card" style={{width: '400px', padding: '2rem'}}>
        <h2 className="text-center" style={{textAlign: 'center', marginBottom: '0.5rem'}}>Secure Login</h2>
        <p className="text-center mb-6" style={{textAlign: 'center', marginBottom: '2rem'}}>Multi-factor authentication (Step {step} of 3)</p>
        
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label>Email Address</label>
              <input type="email" required placeholder="patient@example.com" value={email} onChange={e => setEmail(e.target.value)} style={{width: '100%', padding: '0.5rem'}} />
            </div>
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label>Password</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{width: '100%', padding: '0.5rem'}} />
            </div>
            <button type="submit" className="btn" style={{width: '100%', padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px'}}>Verify Credentials</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label>Security Question</label>
              <p style={{fontSize: '0.9rem', color: 'var(--text-main)', margin: '0.5rem 0'}}>What was the name of your first pet?</p>
              <input type="text" required placeholder="Your answer" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} style={{width: '100%', padding: '0.5rem'}} />
            </div>
            <button type="submit" className="btn" style={{width: '100%', padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px'}}>Submit Answer</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleFinalSubmit}>
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label>Caesar Cipher Challenge</label>
              <p style={{fontSize: '0.9rem', margin: '0.5rem 0'}}>Decrypt the following medical code (Shift: 3)</p>
              <div style={{background: '#f3f4f6', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem', letterSpacing: '2px'}}>
                SKDUPDFB
              </div>
              <input type="text" required placeholder="Decrypted code" value={cipherAnswer} onChange={e => setCipherAnswer(e.target.value)} style={{width: '100%', padding: '0.5rem'}} />
            </div>
            <button type="submit" className="btn" style={{width: '100%', padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px'}}>Complete Login</button>
          </form>
        )}

        <div className="text-center mt-4" style={{textAlign: 'center', marginTop: '1rem'}}>
          <p style={{fontSize: '0.875rem'}}>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
