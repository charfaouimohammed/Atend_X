import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents } from '../../api/students';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Grow,
  Fade,
  Slide,
  Zoom,
  Chip,
  Skeleton,
  TablePagination,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const StudentList = ({ refresh }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getStudents();
        setStudents(data);
        setError('');
      } catch (err) {
        setError('Failed to fetch students. Please try again later.');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [refresh]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    setLoading(true);
    getStudents()
      .then(data => {
        setStudents(data);
        setError('');
      })
      .catch(err => {
        setError('Failed to fetch students. Please try again later.');
        console.error('Error fetching students:', err);
      })
      .finally(() => setLoading(false));
  };

  if (loading && students.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        {[...Array(5)].map((_, index) => (
          <Slide direction="up" in={true} timeout={index * 100} key={index}>
            <Box sx={{ mb: 2 }}>
              <Skeleton variant="rectangular" height={60} animation="wave" />
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
            mt: 2,
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
              onClick={handleRefresh}
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
    <Grow in={true} timeout={500}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Student Directory
          </Typography>
          <Box>
            <Tooltip title="Refresh list">
              <IconButton onClick={handleRefresh} color="primary" sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/students/new')}
              sx={{
                background: 'linear-gradient(90deg, #4a6bff 0%, #6b4aff 100%)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #3a5bef 0%, #5b3aef 100%)',
                },
              }}
            >
              Add Student
            </Button>
          </Box>
        </Box>

        {students.length === 0 ? (
          <Fade in={true}>
            <Paper elevation={3} sx={{ 
              p: 4, 
              textAlign: 'center',
              background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8f0 100%)',
              borderRadius: 3
            }}>
              <ErrorIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No students found
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Add your first student to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/students/new')}
                sx={{
                  background: 'linear-gradient(90deg, #4a6bff 0%, #6b4aff 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #3a5bef 0%, #5b3aef 100%)',
                  },
                }}
              >
                Add Student
              </Button>
            </Paper>
          </Fade>
        ) : (
          <>
            <TableContainer 
              component={Paper}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                '&:hover': {
                  boxShadow: '0 5px 15px rgba(0,0,0,0.12)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <Table>
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>CNE</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((student, index) => (
                      <Slide 
                        direction="up" 
                        in={true} 
                        timeout={(index % rowsPerPage) * 100} 
                        key={student.id}
                      >
                        <TableRow
                          hover
                          sx={{ 
                            '&:last-child td': { borderBottom: 0 },
                            '&:hover': {
                              backgroundColor: 'action.hover',
                              transition: 'background-color 0.3s ease'
                            }
                          }}
                        >
                          <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              bgcolor: '#4a6bff', 
                              color: 'white', 
                              mr: 2,
                              fontWeight: 'bold'
                            }}>
                              {student.name.charAt(0).toUpperCase()}
                            </Avatar>
                            {student.name}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={student.cne} 
                              size="small" 
                              variant="outlined"
                              sx={{ borderRadius: 1 }}
                            />
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.phone}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => navigate(`/students/${student.id}`)}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  color: 'primary.main'
                                }
                              }}
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      </Slide>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={students.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ mt: 2 }}
            />
          </>
        )}
      </Box>
    </Grow>
  );
};

export default StudentList;