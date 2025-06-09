const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = 'http://13.220.164.76/api';

export const API_BASE_URL_DEV = isDevelopment 
  ? 'http://localhost:8009/api'
  : 'http://your-ec2-public-ip/api'; // Replace with your EC2 IP 