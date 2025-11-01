import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import StudentList from '../components/Students/StudentList';
import StudentForm from '../components/Students/StudentForm';
import StudentDetailPage from './StudentDetailPage';
import { keyframes } from '@emotion/react';

// Animation for the header gradient
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const StudentsPage = () => {
  const [refreshList, setRefreshList] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFormClose = () => {
    navigate('/students');
    setRefreshList(prev => !prev);
  };

  const handleAddStudent = () => {
    navigate('/students/new');
  };

  return (
    <Container 
      maxWidth="xl" 
      disableGutters={isMobile}
      sx={{ 
        py: 4,
        mt: '64px',
        minHeight: 'calc(100vh - 64px)',
        background: theme.palette.mode === 'dark' 
          ? theme.palette.background.default 
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`
      }}
    >
      {/* Animated Gradient Header */}
      <Paper 
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          backdropFilter: 'blur(10px)',
          background: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.background.paper, 0.8) 
            : `linear-gradient(90deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
          backgroundSize: '200% 200%',
          animation: `${gradientAnimation} 8s ease infinite`,
          border: theme.palette.mode === 'dark' 
            ? `1px solid ${alpha(theme.palette.divider, 0.2)}`
            : 'none',
          boxShadow: theme.shadows[4]
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PeopleIcon 
              fontSize="large" 
              sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.primary.light 
                  : theme.palette.primary.main,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }} 
            />
            <Typography 
              variant="h4" 
              component="h1"
              fontWeight={700}
              sx={{
                background: theme.palette.mode === 'dark' 
                  ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})` 
                  : `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Student Management
            </Typography>
          </Box>
          
          {/* <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddStudent}
            sx={{ 
              textTransform: 'none',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
              }
            }}
            size={isMobile ? 'medium' : 'large'}
          >
            Add New Student
          </Button> */}
        </Box>

        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2,
            color: theme.palette.mode === 'dark' 
              ? theme.palette.text.secondary 
              : theme.palette.text.primary,
            opacity: 0.8
          }}
        >
          Manage student records, track progress, and analyze performance.
        </Typography>
      </Paper>

      {/* Main Content Area */}
      <Box 
        sx={{ 
          backgroundColor: 'background.paper',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: theme.shadows[4],
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: theme.shadows[8]
          },
          border: theme.palette.mode === 'dark' 
            ? `1px solid ${alpha(theme.palette.divider, 0.2)}`
            : 'none'
        }}
      >
        <Routes>
          <Route path="/" element={<StudentList refresh={refreshList} />} />
          <Route 
            path="/new" 
            element={
              <StudentForm 
                onCancel={handleFormClose} 
                onSuccess={handleFormClose} 
              />
            } 
          />
          <Route path="/:id" element={<StudentDetailPage />} />
        </Routes>
      </Box>
    </Container>
  );
};

export default StudentsPage;