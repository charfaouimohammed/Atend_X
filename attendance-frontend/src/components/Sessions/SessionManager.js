import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  PlayCircleFilled as StartIcon,
  StopCircle as EndIcon,
  PersonAdd as MarkIcon,
  Schedule as TimerIcon
} from '@mui/icons-material';
import { startSession, endSession, getCurrentSession } from '../../api/sessions';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';

const SessionManager = ({ onSessionChange }) => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [duration, setDuration] = useState('00:00:00');

  const checkActiveSession = async () => {
    try {
      const session = await getCurrentSession();
      if (session) {
        setCurrentSession(session);
        if (onSessionChange) onSessionChange(true);
      } else if (onSessionChange) {
        onSessionChange(false);
      }
    } catch (err) {
      setError(err.message || 'Error checking session');
    }
  };

  useEffect(() => {
    checkActiveSession();
    
    const interval = setInterval(checkActiveSession, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentSession) {
      setDuration('00:00:00');
      return;
    }
    
    const timer = setInterval(() => {
      const start = new Date(currentSession.start_time);
      const now = new Date();
      const diff = now - start;
      
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      
      setDuration([
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':'));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  const handleStartSession = async () => {
    setLoading(true);
    setError('');
    try {
      const session = await startSession();
      setCurrentSession(session);
      if (onSessionChange) onSessionChange(true);
    } catch (err) {
      setError(err.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    setLoading(true);
    setError('');
    try {
      await endSession(currentSession._id);
      setCurrentSession(null);
      setConfirmEnd(false);
      setDuration('00:00:00');
      if (onSessionChange) onSessionChange(false);
    } catch (err) {
      setError(err.message || 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentSession) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Attendance Session
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!currentSession ? (
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <StartIcon />}
          onClick={handleStartSession}
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? 'Starting...' : 'Start New Session'}
        </Button>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  avatar={<Avatar>{user.email.charAt(0)}</Avatar>}
                  label={`Active Session (${currentSession.present_students?.length || 0} present)`}
                  color="success"
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimerIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Duration: {duration}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<MarkIcon />}
              onClick={() => alert('Mark attendance functionality')}
              sx={{ flexGrow: 1, minWidth: 200 }}
            >
              Mark Attendance
            </Button>
            
            <Button
              variant="contained"
              color="error"
              startIcon={loading ? <CircularProgress size={20} /> : <EndIcon />}
              onClick={() => setConfirmEnd(true)}
              disabled={loading}
              sx={{ flexGrow: 1, minWidth: 200 }}
            >
              {loading ? 'Ending...' : 'End Session'}
            </Button>
          </Box>
        </>
      )}

      <Dialog open={confirmEnd} onClose={() => setConfirmEnd(false)}>
        <DialogTitle>End Session Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to end this session? This action cannot be undone.
          </Typography>
          {currentSession && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Session ID:</strong> {currentSession._id}
              </Typography>
              <Typography variant="body2">
                <strong>Started:</strong> {new Date(currentSession.start_time).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {duration}
              </Typography>
              <Typography variant="body2">
                <strong>Present Students:</strong> {currentSession.present_students?.length || 0}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEnd(false)}>Cancel</Button>
          <Button
            onClick={handleEndSession}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Ending...' : 'Confirm End'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

SessionManager.propTypes = {
  onSessionChange: PropTypes.func,
};

export default SessionManager;