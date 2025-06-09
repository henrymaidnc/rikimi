const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8009/api'
  : 'http://your-ec2-public-ip/api'; // Replace with your EC2 IP 