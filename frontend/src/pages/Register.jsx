import React from 'react';
import { Link } from 'react-router-dom';

function Register() {
  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h2 className="text-center">Patient Registration</h2>
        <p className="text-center mb-6">Create your SAWS account</p>
        
        <form onSubmit={(e) => { e.preventDefault(); alert("Registration logic will go here"); }}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required placeholder="John Doe" />
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required placeholder="patient@example.com" />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" required placeholder="••••••••" />
          </div>

          <div className="form-group">
            <label>Security Question</label>
            <select required>
              <option value="">Select a question...</option>
              <option value="pet">What was the name of your first pet?</option>
              <option value="school">What was the name of your first school?</option>
              <option value="city">In what city were you born?</option>
            </select>
          </div>

          <div className="form-group">
            <label>Security Answer</label>
            <input type="text" required placeholder="Your answer" />
          </div>
          
          <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}}>Create Account</button>
        </form>

        <div className="text-center mt-4">
          <p style={{fontSize: '0.875rem'}}>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
