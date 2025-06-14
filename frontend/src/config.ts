const isDevelopment = process.env.NODE_ENV === 'development';

// export const API_BASE_URL = 'https://www.rikimi.edu.vn/api';

export const API_BASE_URL = isDevelopment 
  ? 'http://127.0.0.1:8009/api'
  : 'https://www.rikimi.edu.vn/api'; // Replace with your EC2 IP 
  