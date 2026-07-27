import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    securityQuestion: '',
    securityAnswer: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would call the API.
    // For now, redirect to login page.
    alert("Registration successful! Please login.");
    navigate('/login');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container" style={{display: 'flex', justifyContent: 'center', marginTop: '2rem'}}>
      <div className="card auth-card" style={{width: '400px', padding: '2rem'}}>
        <h2 className="text-center" style={{textAlign: 'center', marginBottom: '0.5rem'}}>Patient Registration</h2>
        <p className="text-center mb-6" style={{textAlign: 'center', marginBottom: '2rem'}}>Create your SAWS account</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom: '1rem'}}>
            <label>Full Name</label>
            <input type="text" name="fullName" required placeholder="John Doe" value={formData.fullName} onChange={handleChange} style={{width: '100%', padding: '0.5rem'}} />
          </div>
          
          <div className="form-group" style={{marginBottom: '1rem'}}>
            <label>Email Address</label>
            <input type="email" name="email" required placeholder="patient@example.com" value={formData.email} onChange={handleChange} style={{width: '100%', padding: '0.5rem'}} />
          </div>
          
          <div className="form-group" style={{marginBottom: '1rem'}}>
            <label>Password</label>
            <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} style={{width: '100%', padding: '0.5rem'}} />
          </div>

          <div className="form-group" style={{marginBottom: '1rem'}}>
            <label>Security Question</label>
            <select name="securityQuestion" required value={formData.securityQuestion} onChange={handleChange} style={{width: '100%', padding: '0.5rem'}}>
              <option value="">Select a question...</option>
              <option value="pet">What was the name of your first pet?</option>
              <option value="school">What was the name of your first school?</option>
              <option value="city">In what city were you born?</option>
            </select>
          </div>

          <div className="form-group" style={{marginBottom: '1rem'}}>
            <label>Security Answer</label>
            <input type="text" name="securityAnswer" required placeholder="Your answer" value={formData.securityAnswer} onChange={handleChange} style={{width: '100%', padding: '0.5rem'}} />
          </div>
          
          <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem', padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px'}}>Create Account</button>
        </form>

        <div className="text-center mt-4" style={{textAlign: 'center', marginTop: '1rem'}}>
          <p style={{fontSize: '0.875rem'}}>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Register;
