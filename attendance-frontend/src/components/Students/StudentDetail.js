import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  alpha,
  useTheme,
  styled
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

const GlassPaper = styled(Paper)(({ theme }) => ({
  backdropFilter: 'blur(16px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  boxShadow: theme.shadows[10]
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 180,
  height: 180,
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[6],
  border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  padding: theme.spacing(1),
  backgroundColor: alpha(
    status === 'present' ? theme.palette.success.main : theme.palette.error.main,
    0.1
  ),
  border: `1px solid ${alpha(
    status === 'present' ? theme.palette.success.main : theme.palette.error.main,
    0.3
  )}`,
  '& .MuiChip-icon': {
    color: status === 'present' ? theme.palette.success.main : theme.palette.error.main
  }
}));

const StudentDetailPage = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendance, setAttendance] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/students/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStudent(data);
      } catch (err) {
        setError(`Failed to connect to backend: ${err.message}`);
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttendance = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/students/${id}/attendance`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAttendance(data);
      } catch (err) {
        console.error('Error fetching attendance:', err);
      }
    };

    fetchStudent();
    fetchAttendance();
  }, [id]);

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
        <GlassPaper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/students')}
            sx={{ mt: 2 }}
          >
            Back to Students
          </Button>
        </GlassPaper>
      </Container>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="md">
        <GlassPaper sx={{ p: 3, mt: 4, textAlign: 'center' }}>
          <Typography variant="h6">Student not found</Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/students')}
            sx={{ mt: 2 }}
          >
            Back to Students
          </Button>
        </GlassPaper>
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
      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/students')}
        sx={{
          mb: 4,
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          '&:hover': {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        Back to Students
      </Button>

      <GlassPaper sx={{ p: 4, mb: 4 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
          <Box flex={1} display="flex" flexDirection="column" alignItems="center">
            <StyledAvatar
              src={student.image ? `data:image/jpeg;base64,${student.image}` : '/default-avatar.jpg'}
            />
            <Typography
              variant="h3"
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

          <Box flex={2}>
            <Typography
              variant="h4"
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
                  value: student.registered_at
                    ? format(new Date(student.registered_at), 'MMM dd, yyyy HH:mm')
                    : 'N/A'
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
              variant="h4"
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
                { label: `Total Sessions: ${totalSessions}`, status: 'primary' },
                { label: `Present: ${presentCount}`, status: 'present', icon: <CheckCircleIcon /> },
                { label: `Absent: ${absentCount}`, status: 'absent', icon: <CancelIcon /> },
                { label: `Attendance Rate: ${attendanceRate}%`, status: 'info' }
              ].map((stat, index) => (
                <StatusChip
                  key={index}
                  label={stat.label}
                  status={stat.status}
                  icon={stat.icon}
                  color={stat.status === 'present' ? 'success' : stat.status === 'absent' ? 'error' : stat.status}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </GlassPaper>

      <GlassPaper sx={{ p: 4 }}>
        <Typography
          variant="h4"
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
                    <TimelineConnector
                      sx={{
                        bgcolor: alpha(theme.palette.divider, 0.2)
                      }}
                    />
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
      </GlassPaper>
    </Container>
  );
};

export default StudentDetailPage;