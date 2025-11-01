import React, { useEffect, useState } from 'react';
import { getStudents } from '../../api/students';
import { 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, CircularProgress, 
  Alert, TablePagination, Typography, Box,
  Chip, TextField, Avatar, styled
} from '@mui/material';
import { 
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Search as SearchIcon,
  Person as StudentIcon
} from '@mui/icons-material';

// Styled components using MUI's styled() API
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  minWidth: 300,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginTop: theme.spacing(2)
  }
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'Present' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark
  }),
  ...(status === 'Absent' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark
  })
}));

const StudentAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  marginRight: theme.spacing(2)
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '50vh'
});

const AttendanceReport = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudents();
        setStudents(data);
        setFilteredStudents(data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cne.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
      setPage(0);
    }
  }, [searchTerm, students]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRandomAttendanceStatus = () => {
    return Math.random() > 0.3 ? 'Present' : 'Absent';
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error" variant="outlined">
          {error}
        </Alert>
      </Box>
    );
  }

  if (!loading && filteredStudents.length === 0) {
    return (
      <Box mt={4}>
        <Alert severity="info" variant="outlined">
          {searchTerm ? 'No matching students found' : 'No students found'}
        </Alert>
      </Box>
    );
  }

  return (
    <StyledPaper elevation={3}>
      <HeaderBox>
        <Typography variant="h5" component="h1" fontWeight="600">
          <StudentIcon fontSize="large" sx={{ verticalAlign: 'middle', mr: 1 }} />
          Student Attendance Report
        </Typography>
        
        <SearchField
          variant="outlined"
          size="small"
          placeholder="Search students..."
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </HeaderBox>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>CNE</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((student) => {
                const status = getRandomAttendanceStatus();
                return (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <StudentAvatar>
                          {student.name.charAt(0)}
                        </StudentAvatar>
                        {student.name}
                      </Box>
                    </TableCell>
                    <TableCell>{student.cne}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell align="center">
                      <StatusChip
                        icon={status === 'Present' ? <PresentIcon /> : <AbsentIcon />}
                        label={status}
                        status={status}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredStudents.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ borderTop: '1px solid', borderColor: 'grey.200' }}
      />
    </StyledPaper>
  );
};

export default AttendanceReport;