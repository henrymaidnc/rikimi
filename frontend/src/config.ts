const isDevelopment = process.env.NODE_ENV === 'development';

// export const API_BASE_URL = 'https://www.rikimi.edu.vn/api';

export const API_BASE_URL = isDevelopment 
  ? 'http://127.0.0.1:8009/api'
  : 'https://www.rikimi.edu.vn/api'; // Replace with your EC2 IP 
  

export const getCSRFToken = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export const getDefaultHeaders = () => {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CSRFToken': getCSRFToken() || '',
  };
};

export const fetchCSRFToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    return true;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};
  