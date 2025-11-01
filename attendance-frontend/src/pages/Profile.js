import { Typography, Box, Paper, Avatar, Divider, Chip, useTheme, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { 
  Email as EmailIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedIcon
} from '@mui/icons-material';
import { deepPurple } from '@mui/material/colors';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const Profile = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // Extract first letter of email for avatar if no name is available
  const getInitials = (email) => {
    if (!email) return 'U';
    const [username] = email.split('@');
    return username.charAt(0).toUpperCase();
  };

  return (
    <Box sx={{ 
      maxWidth: 900, 
      mx: 'auto', 
      p: { xs: 2, md: 4 },
      animation: `${pulse} 3s ease-in-out 1`
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 800,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <VerifiedIcon fontSize="large" />
        User Profile
      </Typography>
      
      <Paper elevation={0} sx={{ 
        p: { xs: 3, md: 4 }, 
        borderRadius: 4,
        background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
        border: `1px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
        }
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 4,
          mb: 4,
          position: 'relative'
        }}>
          <Avatar sx={{ 
            width: 140, 
            height: 140, 
            bgcolor: deepPurple[500],
            fontSize: '3.5rem',
            border: `4px solid ${theme.palette.primary.light}`,
            boxShadow: '0 4px 20px rgba(74, 107, 255, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 24px rgba(74, 107, 255, 0.4)'
            }
          }}>
            {getInitials(user?.email)}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Typography variant="h4" component="h2" sx={{ 
                fontWeight: 700,
                color: 'text.primary'
              }}>
                {user?.name || 'Administrator'}
              </Typography>
              <Chip 
                icon={<SecurityIcon />} 
                label="Admin" 
                color="primary" 
                sx={{ 
                  borderRadius: 2,
                  px: 1,
                  fontWeight: 600,
                  height: 32,
                  '& .MuiChip-icon': {
                    color: 'inherit',
                    fontSize: '1.2rem'
                  }
                }} 
              />
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Welcome to your personalized dashboard. You have full administrative privileges.
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              Edit Profile
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ 
          my: 4,
          borderColor: theme.palette.divider,
          borderBottomWidth: 2,
          opacity: 0.5
        }} />
        
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 4
        }}>
          <Box sx={{ 
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <EmailIcon sx={{ 
                fontSize: '2rem',
                color: theme.palette.primary.main 
              }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Email
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ pl: 6 }}>
              {user?.email || 'Not provided'}
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <BadgeIcon sx={{ 
                fontSize: '2rem',
                color: theme.palette.secondary.main 
              }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Account Type
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ pl: 6 }}>
              Administrator
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)'
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <CalendarIcon sx={{ 
                fontSize: '2rem',
                color: theme.palette.success.main 
              }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Last Login
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ pl: 6 }}>
              {new Date().toLocaleString()}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ 
          my: 4,
          borderColor: theme.palette.divider,
          borderBottomWidth: 2,
          opacity: 0.5
        }} />
        
        <Box sx={{ 
          p: 3,
          borderRadius: 3,
          background: 'rgba(74, 107, 255, 0.05)',
          border: `1px solid ${theme.palette.primary.light}`
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <SecurityIcon color="primary" />
            Account Security
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Your account is protected with advanced security measures. For additional protection, 
            consider enabling two-factor authentication.
          </Typography>
          <Button
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(74, 107, 255, 0.3)'
              }
            }}
          >
            Security Settings
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;