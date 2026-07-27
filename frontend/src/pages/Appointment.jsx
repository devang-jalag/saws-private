import React from 'react';

function Appointment() {
  return (
    <div>
      <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
        
        {/* Booking Form */}
        <div className="card" style={{flex: '1', minWidth: '300px'}}>
          <h3>Book New Appointment</h3>
          <p>Schedule a visit with one of our wellness experts.</p>
          
          <form onSubmit={(e) => { e.preventDefault(); alert("Booking submitted!"); }}>
            <div className="form-group">
              <label>Service</label>
              <select required>
                <option value="">Select Service...</option>
                <option value="s1">General Checkup ($100)</option>
                <option value="s2">Therapy Session ($150)</option>
                <option value="s3">Nutrition Plan ($80)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Doctor</label>
              <select required>
                <option value="">Select Doctor...</option>
                <option value="d1">Dr. Alice Smith (General)</option>
                <option value="d2">Dr. Bob Jones (Therapist)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Date</label>
              <input type="date" required />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input type="time" required />
            </div>
            
            <button type="submit" className="btn" style={{width: '100%', marginTop: '1rem'}}>Confirm Booking</button>
          </form>
        </div>

        {/* History Table */}
        <div className="card" style={{flex: '2', minWidth: '400px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h3>Appointment History</h3>
            <button className="btn btn-secondary" style={{padding: '0.25rem 0.75rem'}}>Refresh</button>
          </div>
          
          <div style={{overflowX: 'auto'}}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>Doctor</th>
                  <th>Date/Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#APT-8821</td>
                  <td>General Checkup</td>
                  <td>Dr. Alice Smith</td>
                  <td>Oct 15, 2026 10:00 AM</td>
                  <td><span className="status-badge status-approved">Approved</span></td>
                </tr>
                <tr>
                  <td>#APT-8822</td>
                  <td>Therapy Session</td>
                  <td>Dr. Bob Jones</td>
                  <td>Nov 01, 2026 02:30 PM</td>
                  <td><span className="status-badge status-pending">Pending</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Appointment;
