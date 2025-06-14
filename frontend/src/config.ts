const isDevelopment = process.env.NODE_ENV === 'development';

// export const API_BASE_URL = 'https://www.rikimi.edu.vn/api';

export const API_BASE_URL = isDevelopment 
  ? 'http://127.0.0.1:8009/api'
  : 'https://www.rikimi.edu.vn/api'; // Replace with your EC2 IP 
  

export const getCSRFToken = () => {
  // Get CSRF token from cookie
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
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const csrfToken = getCSRFToken();
  if (csrfToken) {
    headers['X-CSRFToken'] = csrfToken;
  }

  return headers;
};
  