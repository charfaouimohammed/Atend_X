import api from './index';

const API_URL = 'http://localhost:8000/api';

export const startSession = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await api.post('/sessions/start', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.error === "ACTIVE_SESSION_EXISTS") {
      return {
        error: "ACTIVE_SESSION_EXISTS",
        ...error.response.data
      };
    }
    throw error;
  }
};

export const getCurrentSession = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await api.get('/sessions/current', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      validateStatus: (status) => status < 500
    });

    if (response.status === 404) return null;
    if (response.status === 401) {
      localStorage.removeItem('token');
      return null;
    }
    if (response.status >= 400) {
      throw new Error(response.data?.detail || 'Failed to get current session');
    }
    return response.data;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

export const endSession = async (sessionId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    const response = await api.post(`/sessions/${sessionId}/end`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to end session');
  }
};


export const markAttendance = async (sessionId, studentId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await api.post(
      `/sessions/${sessionId}/mark-attendance`,
      { student_id: studentId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data?.detail || 'Failed to mark attendance');
  }
};

export const getSessionDetails = async (sessionId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await api.get(`/sessions/${sessionId}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 404) {
      throw new Error('Session not found');
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to view this session');
    }
    if (error.response?.status === 404) {
      throw new Error('Session not found');
    }
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to fetch session details'
    );
  }
};

export const getAttendanceStats = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    const response = await api.get('/attendance/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get attendance stats');
  }
};

export const getAllStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await api.get('/api/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch students list');
    }
  };
