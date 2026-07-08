import React from 'react';

function Analytics() {
  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2>Platform Analytics</h2>
        <button className="btn btn-secondary" style={{padding: '0.25rem 0.75rem'}}>Export Report</button>
      </div>

      <div className="grid-layout mb-6">
        <div className="card stat-card" style={{padding: '1rem'}}>
          <p style={{margin: 0, fontSize: '0.9rem'}}>Total Users</p>
          <div className="stat-number" style={{fontSize: '2rem'}}>1,248</div>
        </div>
        <div className="card stat-card" style={{padding: '1rem'}}>
          <p style={{margin: 0, fontSize: '0.9rem'}}>Appointments This Week</p>
          <div className="stat-number" style={{fontSize: '2rem'}}>156</div>
        </div>
        <div className="card stat-card" style={{padding: '1rem'}}>
          <p style={{margin: 0, fontSize: '0.9rem'}}>Avg. Patient Satisfaction</p>
          <div className="stat-number" style={{fontSize: '2rem', color: '#10b981'}}>4.8/5</div>
        </div>
      </div>

      <div className="card text-center" style={{padding: '4rem 2rem', background: '#f9fafb', borderStyle: 'dashed'}}>
        <h3 style={{color: 'var(--text-muted)'}}>Looker Studio Embed Placeholder</h3>
        <p>This area will house the Google Looker Studio iframe displaying real-time SAWS analytics and sentiment analysis from AWS Comprehend.</p>
      </div>
    </div>
  );
}

export default Analytics;
