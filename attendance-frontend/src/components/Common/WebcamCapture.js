import { useCallback, useRef, useState } from 'react';
import { Button, Box } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const WebcamCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 500, height: 375, facingMode: 'user' }
      });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      const file = new File([blob], 'student-photo.jpg', { type: 'image/jpeg' });
      setCapturedImage(URL.createObjectURL(blob));
      onCapture(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  }, [onCapture, stopCamera]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {!capturedImage ? (
        <>
          <Box sx={{ position: 'relative', width: 500, height: 375, border: '1px solid #ccc' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', display: stream ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              style={{ display: 'none' }}
            />
            {!stream && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f5f5f5'
              }}>
                <Button variant="contained" onClick={startCamera}>
                  Start Camera
                </Button>
              </Box>
            )}
          </Box>
          {stream && (
            <Button
              variant="contained"
              startIcon={<CameraAltIcon />}
              onClick={capturePhoto}
              fullWidth
            >
              Capture Photo
            </Button>
          )}
        </>
      ) : (
        <>
          <Box sx={{ width: 500, height: 375, border: '1px solid #ccc' }}>
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              setCapturedImage(null);
              onCapture(null);
            }}
          >
            Retake Photo
          </Button>
        </>
      )}
    </Box>
  );
};

export default WebcamCapture;