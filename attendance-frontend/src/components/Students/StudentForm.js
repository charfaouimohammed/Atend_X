import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Grow,
  Fade,
  Slide,
  Zoom
} from '@mui/material';
import WebcamCapture from '../Common/WebcamCapture';
import { createStudent } from '../../api/students';

const StudentForm = ({ onCancel, onSuccess = () => {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    cne: '',
    email: '',
    phone: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!image) {
        throw new Error('Please capture a photo');
      }

      await createStudent({
        ...formData,
        image
      });

      setSuccess('Student created successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageCapture = (imageFile) => {
    setImage(imageFile);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grow in={true} timeout={800}>
        <Paper elevation={6} sx={{ 
          p: 4,
          background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8f0 100%)',
          borderRadius: 3,
          borderLeft: '6px solid #4a6bff',
          transformOrigin: 'top center',
          '&:hover': {
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }
        }}>
          <Zoom in={true} timeout={500} style={{ transitionDelay: '300ms' }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              align="center"
              sx={{ 
                color: '#2d3748',
                fontWeight: 700,
                mb: 3,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Add New Student
            </Typography>
          </Zoom>
          
          <Slide in={!!error} direction="down" timeout={300}>
            <Box>
              {error && (
                <Alert severity="error" sx={{ 
                  mb: 3,
                  boxShadow: 1,
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  transform: error ? 'scale(1)' : 'scale(0.9)',
                  transition: 'transform 0.3s ease'
                }}>
                  {error}
                </Alert>
              )}
            </Box>
          </Slide>
          
          <Slide in={!!success} direction="down" timeout={300}>
            <Box>
              {success && (
                <Alert severity="success" sx={{ 
                  mb: 3,
                  boxShadow: 1,
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  transform: success ? 'scale(1)' : 'scale(0.9)',
                  transition: 'transform 0.3s ease'
                }}>
                  {success}
                </Alert>
              )}
            </Box>
          </Slide>

          <Box component="form" onSubmit={handleSubmit}>
            <Box display="flex" gap={4} flexDirection={{ xs: 'column', md: 'row' }}>
              <Fade in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
                <Box flex={1} sx={{
                  background: 'white',
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="CNE"
                    name="cne"
                    value={formData.cne}
                    onChange={handleChange}
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
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
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
                </Box>
              </Fade>
              
              <Fade in={true} timeout={800} style={{ transitionDelay: '600ms' }}>
                <Box flex={1} display="flex" flexDirection="column" alignItems="center" sx={{
                  background: 'white',
                  p: 3,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <WebcamCapture onCapture={handleImageCapture} />
                  <Typography 
                    variant="caption" 
                    mt={1}
                    sx={{
                      color: image ? '#4caf50' : '#ff9800',
                      fontWeight: 500,
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {image ? "✓ Photo captured" : "Please capture a photo"}
                  </Typography>
                </Box>
              </Fade>
            </Box>
            
            <Box display="flex" justifyContent="center" mt={4} gap={2}>
              <Slide in={true} direction="up" timeout={500} style={{ transitionDelay: '700ms' }}>
                <Box>
                  <Button 
                    variant="outlined" 
                    onClick={onCancel}
                    disabled={loading}
                    sx={{
                      px: 4,
                      py: 1,
                      borderWidth: 2,
                      '&:hover': { 
                        borderWidth: 2,
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 8px rgba(74, 107, 255, 0.2)'
                      },
                      color: '#4a6bff',
                      borderColor: '#4a6bff',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:disabled': {
                        color: '#a0aec0',
                        borderColor: '#a0aec0'
                      }
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Slide>
              <Slide in={true} direction="up" timeout={500} style={{ transitionDelay: '800ms' }}>
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !image}
                    sx={{
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
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                        Saving...
                      </>
                    ) : (
                      'Save Student'
                    )}
                  </Button>
                </Box>
              </Slide>
            </Box>
          </Box>
        </Paper>
      </Grow>
    </Container>
  );
};

export default StudentForm;