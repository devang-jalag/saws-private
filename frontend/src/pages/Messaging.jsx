import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, Paper } from '@mui/material';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Messaging() {
  const { isPatient, user } = useAuth();
  const [concerns, setConcerns] = useState([]);
  const [newConcern, setNewConcern] = useState('');

  useEffect(() => {
    // We'll wire this to GCP Cloud Functions later
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Messaging & Support</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        {isPatient ? (
          <>
            <Typography variant="h6">Submit a Concern</Typography>
            <TextField 
              fullWidth 
              multiline 
              rows={4} 
              value={newConcern}
              onChange={(e) => setNewConcern(e.target.value)}
              placeholder="Describe your issue..."
              margin="normal"
            />
            <Button variant="contained" color="primary" sx={{ mt: 1 }}>Submit Concern</Button>
          </>
        ) : (
          <Typography variant="h6">Patient Concerns (Coordinator View)</Typography>
        )}
      </Paper>
    </Box>
  );
}
