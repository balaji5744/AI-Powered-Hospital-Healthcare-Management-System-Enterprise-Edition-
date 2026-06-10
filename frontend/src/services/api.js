import axios from 'axios';

// Connects your frontend to your backend port
export const hmsAPI = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});