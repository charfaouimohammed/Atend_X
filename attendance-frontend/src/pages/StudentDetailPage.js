import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudent } from '../api/students';
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Container,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  alpha,
  useTheme,
  keyframes
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { format } from 'date-fns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Animation for gradient background
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StudentDetailPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendance, setAttendance] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid student ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [studentData, attendanceData] = await Promise.all([
          getStudent(id),
          Promise.resolve([]) // Mock for now
        ]);
        
        setStudent(studentData);
        setAttendance(attendanceData);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (!id || id === 'undefined') {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          No student ID provided
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/students')}
          sx={{ mt: 2 }}
        >
          Back to Students
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/students')}
          sx={{ mt: 2 }}
        >
          Back to Students
        </Button>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Student not found
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/students')}
          sx={{ mt: 2 }}
        >
          Back to Students
        </Button>
      </Container>
    );
  }

  // Calculate attendance statistics
  const totalSessions = attendance.length;
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = totalSessions - presentCount;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button with Glass Effect */}
      <Button 
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/students')}
        sx={{ 
          mb: 4,
          backdropFilter: 'blur(10px)',
          background: alpha(theme.palette.background.paper, 0.7),
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          '&:hover': {
            background: alpha(theme.palette.background.paper, 0.9),
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        Back to Students
      </Button>

      {/* Student Profile Card */}
      <Paper 
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          background: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.8)
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
          {/* Avatar Section */}
          <Box flex={1} display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={student.image ? `data:image/jpeg;base64,${student.image}` : '/default-avatar.jpg'}
              sx={{ 
                width: 200, 
                height: 200, 
                mb: 3,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            />
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                fontWeight: 700,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {student.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {student.email}
            </Typography>
          </Box>

          {/* Info Section */}
          <Box flex={2}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Student Information
            </Typography>

            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={3}>
              {[
                { label: 'CNE', value: student.cne || 'N/A' },
                { label: 'Phone', value: student.phone || 'N/A' },
                { 
                  label: 'Registration Date', 
                  value: student.registered_at ? 
                    format(new Date(student.registered_at), 'MMM dd, yyyy HH:mm') : 
                    'N/A' 
                }
              ].map((item, index) => (
                <Box key={index}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 4, borderColor: alpha(theme.palette.divider, 0.1) }} />

            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Attendance Summary
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap" mb={4}>
              {[
                { label: `Total Sessions: ${totalSessions}`, color: 'primary' },
                { label: `Present: ${presentCount}`, color: 'success', icon: <CheckCircleIcon /> },
                { label: `Absent: ${absentCount}`, color: 'error', icon: <CancelIcon /> },
                { label: `Attendance Rate: ${attendanceRate}%`, color: 'info' }
              ].map((stat, index) => (
                <Chip 
                  key={index}
                  label={stat.label}
                  color={stat.color}
                  icon={stat.icon}
                  sx={{ 
                    px: 2,
                    py: 1,
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                    background: alpha(theme.palette[stat.color].main, 0.1),
                    border: `1px solid ${alpha(theme.palette[stat.color].main, 0.2)}`,
                    '& .MuiChip-icon': {
                      color: theme.palette[stat.color].main
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Attendance Timeline */}
      <Paper 
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          background: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.8)
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: 3,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Recent Attendance
        </Typography>

        {attendance.length > 0 ? (
          <Timeline sx={{ p: 0 }}>
            {attendance.map((item, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot 
                    sx={{ 
                      boxShadow: `0 0 0 4px ${alpha(
                        item.status === 'present' ? theme.palette.success.main : theme.palette.error.main, 
                        0.2
                      )}` 
                    }}
                    color={item.status === 'present' ? 'success' : 'error'} 
                  />
                  {index < attendance.length - 1 && (
                    <TimelineConnector sx={{ 
                      bgcolor: alpha(theme.palette.divider, 0.2) 
                    }} />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: alpha(
                        item.status === 'present' ? theme.palette.success.light : theme.palette.error.light, 
                        0.1
                      ),
                      border: `1px solid ${alpha(
                        item.status === 'present' ? theme.palette.success.main : theme.palette.error.main, 
                        0.2
                      )}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(5px)'
                      }
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {format(new Date(item.date), 'MMM dd, yyyy - HH:mm')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={item.status === 'present' ? 'success.main' : 'error.main'}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      {item.status === 'present' ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : (
                        <CancelIcon fontSize="small" />
                      )}
                      {item.status.toUpperCase()}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No attendance records found for this student.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default StudentDetailPage;