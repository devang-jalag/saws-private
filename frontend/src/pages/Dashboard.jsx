import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2>Patient Dashboard</h2>
        <span className="status-badge status-approved">Status: Active</span>
      </div>

      <div className="grid-layout mb-6">
        <div className="card stat-card">
          <p style={{margin: 0}}>Upcoming Appointments</p>
          <div className="stat-number">2</div>
          <Link to="/appointment" style={{fontSize: '0.875rem'}}>View Schedule →</Link>
        </div>
        
        <div className="card stat-card">
          <p style={{margin: 0}}>Active Prescriptions</p>
          <div className="stat-number">1</div>
          <span style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>Valid until Oct 2026</span>
        </div>

        <div className="card stat-card">
          <p style={{margin: 0}}>Wellness Score</p>
          <div className="stat-number" style={{color: '#10b981'}}>92</div>
          <Link to="/analytics" style={{fontSize: '0.875rem'}}>View Trends →</Link>
        </div>
      </div>

      <div className="card">
        <h3>Recent Activity</h3>
        <p>Your recent interactions with SAWS.</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-10-15</td>
              <td>Appointment Booked</td>
              <td>Dr. Smith - General Checkup</td>
            </tr>
            <tr>
              <td>2026-10-10</td>
              <td>Chatbot Inquiry</td>
              <td>Wellness package questions</td>
            </tr>
            <tr>
              <td>2026-10-01</td>
              <td>Account Created</td>
              <td>Completed 3-stage MFA setup</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
