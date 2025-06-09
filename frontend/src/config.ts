const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = 'https://www.rikimi.edu.vn/api';

export const API_BASE_URL_DEV = isDevelopment 
  ? 'http://localhost:8009/api'
  : 'https://www.rikimi.edu.vn/api'; // Replace with your EC2 IP 
  