import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="card text-center" style={{marginTop: '2rem'}}>
      <h1 style={{fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem'}}>
        SmartCare Appointment and Wellness System
      </h1>
      <p style={{fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2rem auto'}}>
        A seamless platform connecting patients with wellness coordinators. Book appointments, track your health, and get AI-driven support all in one place.
      </p>
      <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
        <Link to="/register" className="btn">Get Started</Link>
        <Link to="/login" className="btn btn-secondary">Patient Login</Link>
      </div>
      
      <div className="grid-layout mt-4" style={{marginTop: '4rem', textAlign: 'left'}}>
        <div className="card" style={{boxShadow: 'none', backgroundColor: '#f9fafb'}}>
          <h3>Easy Booking</h3>
          <p>Schedule appointments with specialists in just a few clicks.</p>
        </div>
        <div className="card" style={{boxShadow: 'none', backgroundColor: '#f9fafb'}}>
          <h3>24/7 AI Support</h3>
          <p>Get immediate answers to your wellness queries through our smart chatbot.</p>
        </div>
        <div className="card" style={{boxShadow: 'none', backgroundColor: '#f9fafb'}}>
          <h3>Secure Records</h3>
          <p>Your health data is protected with multi-factor authentication.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
