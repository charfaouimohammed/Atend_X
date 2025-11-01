import api from './index';

export const login = async (email, password) => {
  const response = await api.post(
    '/token',
    new URLSearchParams({
      username: email,
      password: password,
      grant_type: 'password',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  return response.data;
};

export const register = async (email, password, full_name) => {
  const response = await api.post('/register', {
    email,
    password,
    full_name,
  });
  return response.data;
};