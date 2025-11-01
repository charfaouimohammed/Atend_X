import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import PrivateRoute from './components/Layout/PrivateRoute';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import StudentsPage from './pages/StudentsPage';
import SessionsPage from './pages/SessionsPage';
import Profile from './pages/Profile';
import { CssBaseline, ThemeProvider,Alert } from '@mui/material';
import theme from './styles/theme';
import './styles/global.css';
import StudentDetailPage from '../src/pages/StudentDetailPage';
import SessionManager from '../src/components/Sessions/SessionManager';
import StudentForm from './components/Students/StudentForm';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <ApiProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/students/*"
                element={
                  <PrivateRoute>
                    <StudentsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sessions/*"
                element={
                  <PrivateRoute>
                    <SessionsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/student/*"
                element={
                  <PrivateRoute>
                    <SessionsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route path="/students/:id" element={<StudentDetailPage />} />
              <Route path="/attendance-session" element={<SessionManager />} />
              <Route path="/students/new" element={<StudentForm />} />
            </Routes>
          </ApiProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;