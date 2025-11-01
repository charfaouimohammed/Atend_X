import api from './index';

export const recognizeFace = async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
  
      const response = await api.post('/recognize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Face recognition error:', error);
      throw error;
    }
  };