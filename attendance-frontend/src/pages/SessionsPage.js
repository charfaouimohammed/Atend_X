import { Routes, Route } from 'react-router-dom';
import { 
  Box, 
  Container,
  Grow,
  Fade,
  useTheme,
  Typography,
  Paper
} from '@mui/material';
import SessionForm from '../components/Sessions/SessionForm';
import AttendanceReport from '../components/Sessions/AttendanceReport';

const SessionsPage = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        py: 4,
        background: `
          radial-gradient(circle at 10% 20%, ${theme.palette.primary.light}20 0%, transparent 20%),
          radial-gradient(circle at 90% 80%, ${theme.palette.secondary.light}20 0%, transparent 20%),
          linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grow in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              p: { xs: 2, md: 4 },
              borderRadius: '16px',
              backgroundColor: theme.palette.background.paper,
              boxShadow: `
                0 4px 6px -1px rgba(0, 0, 0, 0.05),
                0 10px 15px -3px rgba(0, 0, 0, 0.05),
                0 20px 25px -5px rgba(0, 0, 0, 0.04)
              `,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `
                  0 10px 15px -3px rgba(0, 0, 0, 0.1),
                  0 20px 25px -5px rgba(0, 0, 0, 0.1),
                  0 30px 35px -7px rgba(0, 0, 0, 0.1)
                `
              },
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                transition: 'all 0.3s ease'
              }
            }}
          >
            <Fade in={true} timeout={1000}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ 
                  mb: 4,
                  textAlign: 'center',
                  '& svg': {
                    fontSize: '3rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }
                }}>
                  <Typography 
                    variant="h4" 
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Session Management
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Create and analyze attendance sessions
                  </Typography>
                </Box>

                <Routes>
                  <Route path="/" element={<SessionForm />} />
                  <Route path="/:id/report" element={<AttendanceReport />} />
                </Routes>
              </Box>
            </Fade>
          </Paper>
        </Grow>
      </Container>
    </Box>
  );
};

export default SessionsPage;