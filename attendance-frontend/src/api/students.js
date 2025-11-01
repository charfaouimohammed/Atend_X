import api from '.';

export const getStudents = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await api.get('/students', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data?.detail || 'Failed to fetch students');
  }
};

export const getStudent = async (id) => {
  try {
    // Enhanced validation
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Invalid student ID');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await api.get(`/students/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching student:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(error.response?.data?.detail || 'Failed to fetch student');
  }
};

export const createStudent = async (studentData) => {
  try {
    const formData = new FormData();
    formData.append('name', studentData.name);
    formData.append('cne', studentData.cne);
    formData.append('email', studentData.email);
    formData.append('phone', studentData.phone);
    formData.append('file', studentData.image);

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await api.post('/students/', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating student:', error);
    throw new Error(error.response?.data?.detail || 'Failed to create student');
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Invalid student ID');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await api.put(`/students/${id}`, studentData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating student:', error);
    throw new Error(error.response?.data?.detail || 'Failed to update student');
  }
};

export const deleteStudent = async (id) => {
  try {
    if (!id || id === 'undefined' || id === 'null') {
      throw new Error('Invalid student ID');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await api.delete(`/students/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw new Error(error.response?.data?.detail || 'Failed to delete student');
  }
};