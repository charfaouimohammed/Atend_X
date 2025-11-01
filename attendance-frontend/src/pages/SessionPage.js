import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { 
    Box, 
    Typography, 
    Button,
    Paper,
    CircularProgress,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import AttendanceMarker from '../components/AttendanceMarker';
import StudentRecognition from '../components/StudentRecognition'; // New component for student recognition

const SessionPage = () => {
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attendanceCount, setAttendanceCount] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [recognitionOpen, setRecognitionOpen] = useState(false); // State for recognition dialog
    const [recognizing, setRecognizing] = useState(false); // State for recognition process

    const api = useApi();

    useEffect(() => {
        const fetchAttendanceCount = async () => {
            if (activeSessionId) {
                try {
                    const response = await api.get(`/sessions/${activeSessionId}/attendance/count`);
                    setAttendanceCount(response.data.count);
                } catch (error) {
                    console.error("Failed to fetch attendance count", error);
                }
            }
        };

        fetchAttendanceCount();
        
        const interval = setInterval(fetchAttendanceCount, 10000);
        return () => clearInterval(interval);
    }, [activeSessionId, api]);

    const startSession = async () => {
        setLoading(true);
        try {
            const response = await api.post('/sessions/start');
            setActiveSessionId(response.data.session_id);
            setAttendanceCount(0);
            setError('');
            showSnackbar('Session started successfully', 'success');
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to start session");
            showSnackbar(error.response?.data?.detail || "Failed to start session", 'error');
        } finally {
            setLoading(false);
        }
    };

    const endSession = async () => {
        setLoading(true);
        try {
            if (attendanceCount < 20) {
                throw new Error(`Cannot end session with only ${attendanceCount} students. Minimum 20 required.`);
            }
            
            await api.post(`/sessions/${activeSessionId}/end`);
            setActiveSessionId(null);
            setError('');
            showSnackbar('Session ended successfully', 'success');
        } catch (error) {
            setError(error.response?.data?.detail || error.message);
            showSnackbar(error.response?.data?.detail || error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceMarked = async (studentId) => {
        try {
            if (attendanceCount >= 60) {
                throw new Error('Class has reached maximum capacity (60 students)');
            }
            
            const response = await api.post(`/sessions/${activeSessionId}/attendance`, {
                student_id: studentId
            });
            
            setAttendanceCount(prev => prev + 1);
            showSnackbar(`Attendance marked for student ${studentId}`, 'success');
            
            return response.data;
        } catch (error) {
            showSnackbar(error.response?.data?.detail || error.message, 'error');
            throw error;
        }
    };

    const handleNewRecognition = () => {
        setRecognitionOpen(true);
    };

    const handleRecognitionClose = () => {
        setRecognitionOpen(false);
    };

    const handleRecognitionComplete = async (studentData) => {
        setRecognizing(true);
        try {
            // Here you would typically:
            // 1. Register the new student if not exists
            // 2. Mark their attendance
            await handleAttendanceMarked(studentData.id);
            showSnackbar(`New student recognized and attendance marked!`, 'success');
            handleRecognitionClose();
        } catch (error) {
            showSnackbar(error.message, 'error');
        } finally {
            setRecognizing(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Attendance Session
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                {activeSessionId ? (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Active Session: {activeSessionId}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Students present: {attendanceCount} / 60
                        </Typography>
                        {attendanceCount < 20 && (
                            <Typography color="warning.main" gutterBottom>
                                Warning: Minimum 20 students required (currently {attendanceCount})
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={endSession}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'End Session'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleNewRecognition}
                                disabled={attendanceCount >= 60}
                            >
                                Register New Student
                            </Button>
                        </Box>
                    </>
                ) : (
                    <>
                        <Typography variant="h6" gutterBottom>
                            No active session
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={startSession}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Start New Session'}
                        </Button>
                    </>
                )}
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </Paper>

            {activeSessionId && (
                <AttendanceMarker 
                    activeSessionId={activeSessionId}
                    onAttendanceMarked={handleAttendanceMarked}
                    disabled={attendanceCount >= 60}
                />
            )}

            {/* New Student Recognition Dialog */}
            <Dialog
                open={recognitionOpen}
                onClose={handleRecognitionClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Register New Student</DialogTitle>
                <DialogContent>
                    <StudentRecognition 
                        onComplete={handleRecognitionComplete}
                        onCancel={handleRecognitionClose}
                        disabled={recognizing}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRecognitionClose} disabled={recognizing}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        disabled={recognizing}
                    >
                        {recognizing ? <CircularProgress size={24} /> : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SessionPage;