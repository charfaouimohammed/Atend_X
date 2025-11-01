import React from 'react';
import { useState } from 'react';
import Webcam from 'react-webcam';
import { 
  Button, 
  Box, 
  Typography, 
  Paper, 
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Avatar
} from '@mui/material';
import { recognizeFace } from '../../api/faceRecognition';

const FaceRecognition = ({ onRecognize, disabled }) => {
  const webcamRef = React.useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    setError(null);
    setMatches([]);
  };

  const handleRecognize = async () => {
    if (!imgSrc) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert base64 to blob
      const response = await fetch(imgSrc);
      const blob = await response.blob();
      
      // Call recognition API
      const result = await recognizeFace(blob);
      
      if (result.length > 0) {
        setMatches(result);
        if (onRecognize) {
          // Use the best match (highest confidence)
          onRecognize(result[0]);
        }
      } else {
        setError('No matching student found. Please try again or register the student.');
      }
    } catch (err) {
      console.error('Recognition error:', err);
      setError('Face recognition failed. Please ensure proper lighting and visibility.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Face Recognition
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        {imgSrc ? (
          <img 
            src={imgSrc} 
            alt="Captured" 
            style={{ 
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '4px'
            }} 
          />
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            style={{ 
              width: '100%',
              maxHeight: '300px',
              borderRadius: '4px'
            }}
            videoConstraints={{
              facingMode: 'user',
              width: 1280,
              height: 720
            }}
          />
        )}

        <Box display="flex" gap={2}>
          {!imgSrc ? (
            <Button 
              variant="contained" 
              onClick={capture}
              disabled={disabled || loading}
            >
              Capture Photo
            </Button>
          ) : (
            <>
              <Button 
                variant="outlined" 
                onClick={() => setImgSrc(null)}
                disabled={loading}
              >
                Retake
              </Button>
              <Button
                variant="contained"
                onClick={handleRecognize}
                disabled={disabled || loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                Recognize
              </Button>
            </>
          )}
        </Box>

        {matches.length > 0 && (
          <Box width="100%" mt={2}>
            <Typography variant="subtitle1" gutterBottom>
              Recognition Results:
            </Typography>
            <List dense>
              {matches.map((match) => (
                <ListItem 
                  key={match.student_id}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  onClick={() => onRecognize(match)}
                >
                  <Avatar 
                    src={`data:image/jpeg;base64,${match.image}`} 
                    sx={{ mr: 2 }}
                  />
                  <ListItemText
                    primary={match.name}
                    secondary={`CNE: ${match.cne} | Confidence: ${(match.confidence * 100).toFixed(1)}%`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FaceRecognition;