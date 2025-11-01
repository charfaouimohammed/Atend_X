import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    Grow,
    Fade,
    Slide,
    Zoom,
    Avatar,
    ListItemAvatar,
    Collapse,
    IconButton
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Schedule as ScheduleIcon,
    Close as CloseIcon
} from '@mui/icons-material';

const AttendanceMarker = ({ activeSessionId, onAttendanceMarked }) => {
    const [studentId, setStudentId] = useState('');
    const [message, setMessage] = useState('');
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [showRecent, setShowRecent] = useState(true);
    const api = useApi();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!activeSessionId) {
                throw new Error("Please start a session first");
            }
            if (!studentId.trim()) {
                throw new Error("Please enter a student ID");
            }

            const response = await api.post(
                `/sessions/${activeSessionId}/mark-attendance`,
                { student_id: studentId.trim() }
            );
            
            const successMsg = `Attendance marked for ${response.data.student.name}`;
            setMessage(successMsg);
            
            setRecentAttendance(prev => [
                {
                    id: response.data.student.id,
                    name: response.data.student.name,
                    cne: response.data.student.cne,
                    time: new Date().toLocaleTimeString(),
                    avatar: response.data.student.name.charAt(0).toUpperCase()
                },
                ...prev.slice(0, 4)
            ]);
            
            setStudentId('');
            if (onAttendanceMarked) onAttendanceMarked();
        } catch (error) {
            setMessage(error.response?.data?.detail || error.message);
        }
    };

    return (
        <Grow in={true} timeout={600}>
            <Paper elevation={6} sx={{ 
                p: 3, 
                mb: 3,
                background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8f0 100%)',
                borderRadius: 3,
                borderLeft: '6px solid #4a6bff',
                '&:hover': {
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                }
            }}>
                <Zoom in={true} timeout={500} style={{ transitionDelay: '200ms' }}>
                    <Typography variant="h6" gutterBottom sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: '#2d3748',
                        fontWeight: 700,
                        '& svg': {
                            mr: 1,
                            color: '#4a6bff'
                        }
                    }}>
                        <ScheduleIcon />
                        Mark Attendance
                    </Typography>
                </Zoom>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                    <Fade in={true} timeout={800}>
                        <TextField
                            fullWidth
                            label="Student ID"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#e2e8f0',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#4a6bff',
                                    },
                                }
                            }}
                        />
                    </Fade>
                    
                    <Slide in={true} direction="up" timeout={500} style={{ transitionDelay: '300ms' }}>
                        <Box>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                sx={{ 
                                    mt: 2,
                                    px: 4,
                                    py: 1,
                                    background: 'linear-gradient(90deg, #4a6bff 0%, #6b4aff 100%)',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 10px rgba(74, 107, 255, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(90deg, #3a5bef 0%, #5b3aef 100%)',
                                        boxShadow: '0 4px 12px rgba(74, 107, 255, 0.6)',
                                        transform: 'scale(1.05)'
                                    },
                                    '&:disabled': {
                                        background: '#e2e8f0',
                                        color: '#a0aec0'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                                disabled={!activeSessionId || !studentId.trim()}
                            >
                                Mark Present
                            </Button>
                        </Box>
                    </Slide>
                </Box>

                <Collapse in={!!message}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        backgroundColor: message.includes("successfully") ? '#e8f5e9' : '#ffebee',
                        color: message.includes("successfully") ? '#2e7d32' : '#c62828',
                        boxShadow: 1,
                        '& svg': {
                            mr: 1
                        }
                    }}>
                        {message.includes("successfully") ? (
                            <CheckCircleIcon color="success" />
                        ) : (
                            <ErrorIcon color="error" />
                        )}
                        <Typography variant="body2">{message}</Typography>
                        <IconButton 
                            size="small" 
                            sx={{ ml: 'auto' }}
                            onClick={() => setMessage('')}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Collapse>

                {recentAttendance.length > 0 && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                Recently Marked
                            </Typography>
                            <IconButton 
                                size="small" 
                                onClick={() => setShowRecent(!showRecent)}
                                sx={{ color: '#4a6bff' }}
                            >
                                {showRecent ? <CloseIcon fontSize="small" /> : <ScheduleIcon fontSize="small" />}
                            </IconButton>
                        </Box>
                        
                        <Collapse in={showRecent}>
                            <List dense sx={{
                                background: 'white',
                                borderRadius: 2,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                '&:hover': {
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease'
                                }
                            }}>
                                {recentAttendance.map((student, index) => (
                                    <Fade in={true} timeout={500} key={`${student.id}-${student.time}`}>
                                        <div>
                                            <ListItem sx={{
                                                '&:hover': {
                                                    backgroundColor: '#f8f9fa',
                                                    transition: 'background-color 0.3s ease'
                                                }
                                            }}>
                                                <ListItemAvatar>
                                                    <Avatar sx={{ 
                                                        bgcolor: '#4a6bff',
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {student.avatar}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={student.name}
                                                    secondary={`CNE: ${student.cne} - ${student.time}`}
                                                    primaryTypographyProps={{ fontWeight: 'medium' }}
                                                />
                                            </ListItem>
                                            {index < recentAttendance.length - 1 && <Divider variant="inset" component="li" />}
                                        </div>
                                    </Fade>
                                ))}
                            </List>
                        </Collapse>
                    </>
                )}
            </Paper>
        </Grow>
    );
};

export default AttendanceMarker;