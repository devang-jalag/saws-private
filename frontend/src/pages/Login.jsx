import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [step, setStep] = useState(1);

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="text-center">Secure Login</h2>
        <p className="text-center mb-6">Multi-factor authentication (Step {step} of 3)</p>
        
        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required placeholder="patient@example.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn" style={{width: '100%'}}>Verify Credentials</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
            <div className="form-group">
              <label>Security Question</label>
              <p style={{fontSize: '0.9rem', color: 'var(--text-main)', margin: '0.5rem 0'}}>What was the name of your first pet?</p>
              <input type="text" required placeholder="Your answer" />
            </div>
            <button type="submit" className="btn" style={{width: '100%'}}>Submit Answer</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); alert("Login successful! Use the 'Dev: Log In' button in navbar for now."); }}>
            <div className="form-group">
              <label>Caesar Cipher Challenge</label>
              <p style={{fontSize: '0.9rem', margin: '0.5rem 0'}}>Decrypt the following medical code (Shift: 3)</p>
              <div style={{background: '#f3f4f6', padding: '10px', borderRadius: '4px', fontFamily: 'monospace', textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem', letterSpacing: '2px'}}>
                SKDUPDFB
              </div>
              <input type="text" required placeholder="Decrypted code" />
            </div>
            <button type="submit" className="btn" style={{width: '100%'}}>Complete Login</button>
          </form>
        )}

        <div className="text-center mt-4">
          <p style={{fontSize: '0.875rem'}}>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
