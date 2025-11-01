import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAttendanceStats } from '../api/sessions';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grow,
  Fade,
  Slide,
  Zoom,
  Skeleton,
  IconButton,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  EventAvailable as EventAvailableIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as RecentIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAttendanceStats();
      setStats(data);
      setError('');
    } catch (err) {
      setError('Failed to load attendance statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <Box sx={{ p: 3 }}>
        {[...Array(4)].map((_, index) => (
          <Slide direction="up" in={true} timeout={index * 150} key={index}>
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="rectangular" height={120} animation="wave" />
            </Box>
          </Slide>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Zoom in={true}>
        <Alert 
          severity="error" 
          sx={{ 
            mt: 4,
            display: 'flex',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              alignItems: 'center'
            }
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchStats}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Zoom>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Grow in={true} timeout={500}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8f0 100%)',
          p: 3,
          borderRadius: 3
        }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Dashboard Overview
          </Typography>
          <Chip 
            avatar={
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            }
            label={`Welcome, ${user?.email}`}
            variant="outlined"
            sx={{ 
              p: 1,
              borderColor: theme.palette.primary.main,
              '& .MuiChip-label': {
                fontWeight: 500
              }
            }}
          />
        </Box>
      </Grow>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Students */}
        <Grid item xs={12} sm={6} md={3}>
          <Slide direction="up" in={true} timeout={500}>
            <Card sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[6],
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PeopleIcon color="primary" sx={{ 
                    fontSize: 40, 
                    mr: 2,
                    p: 1,
                    bgcolor: 'rgba(74, 107, 255, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Total Students
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {stats?.totalStudents || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Today's Attendance */}
        <Grid item xs={12} sm={6} md={3}>
          <Slide direction="up" in={true} timeout={600}>
            <Card sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'secondary.main',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[6],
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CalendarIcon color="secondary" sx={{ 
                    fontSize: 40, 
                    mr: 2,
                    p: 1,
                    bgcolor: 'rgba(156, 39, 176, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Today's Attendance
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                      <Typography variant="h4" component="div" sx={{ mr: 1, fontWeight: 700 }}>
                        {stats?.todayPresent || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        / {stats?.todayTotal || 0}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats?.todayPresent / stats?.todayTotal) * 100 || 0} 
                      sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      color={
                        (stats?.todayPresent / stats?.todayTotal) > 0.7 ? 'success' : 
                        (stats?.todayPresent / stats?.todayTotal) > 0.5 ? 'warning' : 'error'
                      }
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Attendance Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Slide direction="up" in={true} timeout={700}>
            <Card sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'success.main',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[6],
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CheckCircleIcon sx={{ 
                    color: theme.palette.success.main, 
                    fontSize: 40, 
                    mr: 2,
                    p: 1,
                    bgcolor: 'rgba(46, 125, 50, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Attendance Rate
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {stats?.attendanceRate ? `${Math.round(stats.attendanceRate * 100)}%` : '0%'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>

        {/* Absent Students */}
        <Grid item xs={12} sm={6} md={3}>
          <Slide direction="up" in={true} timeout={800}>
            <Card sx={{ 
              height: '100%',
              borderLeft: '4px solid',
              borderColor: 'error.main',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[6],
                transition: 'all 0.3s ease'
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <CancelIcon color="error" sx={{ 
                    fontSize: 40, 
                    mr: 2,
                    p: 1,
                    bgcolor: 'rgba(198, 40, 40, 0.1)',
                    borderRadius: '50%'
                  }} />
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Today's Absent
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                      {stats?.todayAbsent || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      </Grid>

      {/* Recent Sessions Section */}
      <Fade in={true} timeout={1000}>
        <Paper elevation={3} sx={{ 
          p: 3, 
          mb: 4,
          borderRadius: 3,
          borderLeft: '6px solid',
          borderColor: 'primary.main',
          background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8f0 100%)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RecentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Attendance Sessions
              </Typography>
            </Box>
            <IconButton onClick={fetchStats} color="primary">
              <RefreshIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />
          
          {stats?.recentSessions?.length > 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: 'background.paper' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Present</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Absent</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentSessions.map((session, index) => {
                    const rate = session.presentCount / (session.presentCount + session.absentCount);
                    return (
                      <Slide 
                        direction="up" 
                        in={true} 
                        timeout={index * 100} 
                        key={session.id}
                      >
                        <TableRow
                          hover
                          sx={{ 
                            '&:hover': {
                              backgroundColor: 'action.hover',
                              transition: 'background-color 0.3s ease'
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EventAvailableIcon color="action" sx={{ mr: 1 }} />
                              {format(parseISO(session.date), 'MMM dd, yyyy')}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              icon={<CheckCircleIcon fontSize="small" />}
                              label={session.presentCount}
                              color="success"
                              variant="outlined"
                              size="small"
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              icon={<CancelIcon fontSize="small" />}
                              label={session.absentCount}
                              color="error"
                              variant="outlined"
                              size="small"
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={rate * 100} 
                                  color={
                                    rate > 0.7 ? 'success' : 
                                    rate > 0.5 ? 'warning' : 'error'
                                  }
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {Math.round(rate * 100)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Slide>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography 
              variant="body1" 
              color="text.secondary" 
              align="center" 
              sx={{ p: 4 }}
            >
              No recent sessions available
            </Typography>
          )}
        </Paper>
      </Fade>
    </Box>
  );
};

export default Dashboard;