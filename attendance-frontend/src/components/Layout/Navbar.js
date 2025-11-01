import { Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Badge,
  Slide,
  Fade,
  styled
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as SessionsIcon,
  AccountCircle as ProfileIcon,
  ExitToApp as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { deepPurple } from '@mui/material/colors';
import { useState, useEffect } from 'react';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: theme.shadows[1],
  borderBottom: 'none',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: theme.shadows[4]
  }
}));

const GlowButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: -1
  },
  '&:hover::before': {
    opacity: 0.1
  }
}));

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(true);

  const open = Boolean(anchorEl);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    handleMobileMenuClose();
    logout();
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    const [username] = email.split('@');
    return username.charAt(0).toUpperCase();
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/students', label: 'Students', icon: <PeopleIcon /> },
    { path: '/sessions', label: 'Sessions', icon: <SessionsIcon /> },
  ];

  return (
    <Slide direction="down" in={isVisible} timeout={300}>
      <StyledAppBar 
        position="fixed"
        elevation={0}
        sx={{ zIndex: theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          px: { xs: 2, md: 4 },
          py: 1,
          minHeight: '70px'
        }}>
          {/* Left side - Brand and Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {user && isMobile && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography 
              variant="h6" 
              component={Link} 
              to="/" 
              sx={{ 
                textDecoration: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                letterSpacing: 1,
                mr: 4,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                bgcolor: 'primary.main', 
                borderRadius: '50%',
                mr: 1,
                animation: 'pulse 2s infinite'
              }} />
              AttendX
            </Typography>
            
            {user && !isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      textTransform: 'none',
                      px: 2,
                      borderRadius: 2,
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: location.pathname === item.path ? '60%' : '0%',
                        height: 2,
                        bgcolor: 'primary.main',
                        transition: 'width 0.3s ease'
                      },
                      '&:hover::after': {
                        width: '60%'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          {/* Right side - User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                {!isMobile && (
                  <>
                    <Tooltip title="Notifications">
                      <IconButton sx={{ mr: 1 }}>
                        <Badge 
                          color="error" 
                          variant="dot" 
                          invisible={!hasNewNotifications}
                        >
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    
                    <GlowButton
                      component={Link}
                      to="/profile"
                      startIcon={<ProfileIcon />}
                      sx={{
                        color: 'text.secondary',
                        textTransform: 'none',
                        mr: 1
                      }}
                    >
                      Profile
                    </GlowButton>
                  </>
                )}
                
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    sx={{ 
                      ml: 1,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 38, 
                        height: 38, 
                        bgcolor: deepPurple[500],
                        fontSize: '1rem',
                        border: `2px solid ${theme.palette.primary.main}`,
                        boxShadow: theme.shadows[2]
                      }}
                    >
                      {getInitials(user?.email)}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{
                    elevation: 4,
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      borderRadius: 2,
                      overflow: 'visible',
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0
                      }
                    }
                  }}
                >
                  <MenuItem 
                    component={Link} 
                    to="/profile" 
                    onClick={handleMenuClose}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ProfileIcon sx={{ mr: 1.5, color: 'primary.main' }} /> 
                    <Typography variant="body1">Profile</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'error.light'
                      }
                    }}
                  >
                    <LogoutIcon sx={{ mr: 1.5, color: 'error.main' }} /> 
                    <Typography variant="body1">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <GlowButton
                  component={Link}
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{
                    color: 'text.secondary',
                    textTransform: 'none',
                  }}
                >
                  Login
                </GlowButton>
                <GlowButton
                  component={Link}
                  to="/register"
                  variant="contained"
                  startIcon={<RegisterIcon />}
                  sx={{
                    textTransform: 'none',
                    ml: 1,
                    boxShadow: `0 4px 14px ${theme.palette.primary.light}`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${theme.palette.primary.light}`
                    }
                  }}
                >
                  Register
                </GlowButton>
              </>
            )}
          </Box>

          {/* Mobile Menu */}
          <Menu
            anchorEl={mobileMenuAnchor}
            open={mobileMenuOpen}
            onClose={handleMobileMenuClose}
            onClick={handleMobileMenuClose}
            PaperProps={{
              sx: {
                width: '100%',
                maxWidth: '280px',
                mt: 5,
                borderRadius: 2
              }
            }}
          >
            {navItems.map((item) => (
              <MenuItem 
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  fontWeight: location.pathname === item.path ? 700 : 500,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <Box sx={{ 
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  mr: 2 
                }}>
                  {item.icon}
                </Box>
                {item.label}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem 
              component={Link} 
              to="/profile"
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ProfileIcon sx={{ mr: 2, color: 'primary.main' }} /> 
              Profile
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'error.light'
                }
              }}
            >
              <LogoutIcon sx={{ mr: 2, color: 'error.main' }} /> 
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </StyledAppBar>
    </Slide>
  );
};

export default Navbar;