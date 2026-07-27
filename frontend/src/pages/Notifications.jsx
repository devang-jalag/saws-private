import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // We'll wire this to AWS SNS/SQS Lambda later
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Notifications</Typography>
      <Paper sx={{ p: 2 }}>
        {notifications.length === 0 ? (
          <Typography color="textSecondary">No notifications yet.</Typography>
        ) : (
          <List>
            {notifications.map((notif, i) => (
              <ListItem key={i} divider>
                <ListItemText primary={notif.message} secondary={new Date(notif.createdAt).toLocaleString()} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
