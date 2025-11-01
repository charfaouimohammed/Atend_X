import { Typography, Box } from '@mui/material';

const Home = () => {
  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h3" gutterBottom>
        Welcome to Attendance System
      </Typography>
      <Typography variant="h5">
        Please login to access the system
      </Typography>
    </Box>
  );
};

export default Home;