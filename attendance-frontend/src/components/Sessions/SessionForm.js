import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  startSession, 
  endSession, 
  getCurrentSession,
  markAttendance as apiMarkAttendance
} from '../../api/sessions';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Avatar,
  useTheme
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as EndIcon,
  PersonAdd as MarkIcon,
  Schedule as DurationIcon
} from '@mui/icons-material';
import FaceRecognition from '../FaceRecognition/FaceRecognition';
import { useAuth } from '../../context/AuthContext';

const SessionForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [presentStudents, setPresentStudents] = useState([]);
  const [resumeDialog, setResumeDialog] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [existingSession, setExistingSession] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  const presentStudentsCount = useMemo(() => presentStudents.length, [presentStudents]);

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        setLoading(true);
        const session = await getCurrentSession();
        if (session) {
          setSession({
            id: session.id,
            start_time: session.start_time
          });
          setPresentStudents(session.present_students || []);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    checkActiveSession();
  }, []);

  useEffect(() => {
    let interval;
    if (session) {
      const initialDuration = Math.floor(
        (new Date() - new Date(session.start_time)) / 1000
      );
      setSessionDuration(initialDuration);

      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session]);

  const handleApiCall = async (apiCall, successHandler, errorHandler) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      successHandler(result);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'An unknown error occurred';
      setError(errorMsg);
      if (errorHandler) {
        errorHandler(err);
      } else if (errorMsg.includes('authentication')) {
        setTimeout(() => navigate('/login'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = () => handleApiCall(
    startSession,
    (result) => {
      if (result?.error === "ACTIVE_SESSION_EXISTS") {
        setExistingSession({
          id: result.session_id,
          start_time: result.start_time
        });
        setResumeDialog(true);
      } else {
        setSession({
          id: result.id,
          start_time: result.start_time
        });
        setPresentStudents([]);
        setSessionDuration(0);
      }
    }
  );

  const handleResumeSession = () => handleApiCall(
    () => getCurrentSession(),
    (sessionDetails) => {
      setSession({
        id: sessionDetails.id,
        start_time: sessionDetails.start_time
      });
      setPresentStudents(sessionDetails.present_students || []);
      setResumeDialog(false);
    }
  );

  const handleNewSession = () => handleApiCall(
    async () => {
      await endSession(existingSession.id);
      return startSession();
    },
    (result) => {
      setSession({
        id: result.id,
        start_time: result.start_time
      });
      setPresentStudents([]);
      setResumeDialog(false);
      setSessionDuration(0);
    }
  );

  const handleEndSession = () => handleApiCall(
    () => endSession(session.id),
    (report) => {
      navigate(`/sessions/${session.id}/report`, { state: { report } });
    }
  );

  const handleStudentRecognized = (student) => handleApiCall(
    () => apiMarkAttendance(session.id, student.student_id),
    () => {
      if (!presentStudents.some(s => s.id === student.student_id)) {
        setPresentStudents(prev => [
          ...prev,
          {
            id: student.student_id,
            name: student.name,
            cne: student.cne,
            image: student.image
          }
        ]);
      }
    }
  );

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Paper elevation={3} sx={{ 
      p: 3, 
      mb: 4,
      backgroundColor: theme.palette.background.paper
    }}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontWeight: 'bold',
        color: theme.palette.text.primary
      }}>
        {session ? 'Active Attendance Session' : 'Start New Session'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!session ? (
        <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<StartIcon />}
            onClick={handleStartSession}
            disabled={loading}
            sx={{ minWidth: 220 }}
          >
            {loading ? 'Starting...' : 'Start New Session'}
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2,
            p: 2,
            backgroundColor: theme.palette.grey[100],
            borderRadius: 1
          }}>
            <Box display="flex" alignItems="center">
              <Chip
                avatar={<Avatar>{user.email.charAt(0)}</Avatar>}
                label={`Session: ${session.id.substring(0, 8)}...`}
                color="primary"
                variant="outlined"
                sx={{ mr: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                Started: {new Date(session.start_time).toLocaleString()}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <DurationIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {formatDuration(sessionDuration)}
              </Typography>
            </Box>
          </Box>

          <Box mt={3}>
            <FaceRecognition 
              onRecognize={handleStudentRecognized}
              disabled={loading}
            />
          </Box>
          
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Present Students ({presentStudentsCount})
            </Typography>
            {presentStudentsCount > 0 ? (
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {presentStudents.map((student) => (
                  <ListItem key={student.id} divider>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {student.image && (
                        <Avatar 
                          src={`data:image/jpeg;base64,${student.image}`}
                          sx={{ width: 40, height: 40, mr: 2 }}
                        />
                      )}
                      <ListItemText 
                        primary={student.name}
                        secondary={`CNE: ${student.cne}`}
                        sx={{ flexGrow: 1 }}
                      />
                      <Chip 
                        label="Present" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No students marked present yet
              </Typography>
            )}
          </Box>
          
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="error"
              startIcon={<EndIcon />}
              onClick={() => setConfirmEnd(true)}
              disabled={loading}
              sx={{ minWidth: 180 }}
            >
              End Session
            </Button>
          </Box>
        </>
      )}

      <Dialog open={resumeDialog} onClose={() => setResumeDialog(false)}>
        <DialogTitle>Active Session Found</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have an existing session started at {new Date(existingSession?.start_time).toLocaleString()}.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Would you like to resume this session or start a new one?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResumeDialog(false)}>Cancel</Button>
          <Button onClick={handleNewSession}>Start New</Button>
          <Button onClick={handleResumeSession} variant="contained">Resume</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmEnd} onClose={() => setConfirmEnd(false)}>
        <DialogTitle>Confirm End Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to end this attendance session?
          </DialogContentText>
          {presentStudentsCount > 0 && (
            <DialogContentText sx={{ mt: 2 }}>
              This will mark {presentStudentsCount} student(s) as present.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEnd(false)}>Cancel</Button>
          <Button onClick={handleEndSession} color="error" variant="contained">
            End Session
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SessionForm;