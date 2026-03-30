const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getCours = () => 
  fetch(`${API_URL}/api/cours`).then(res => res.json());

export default API_URL;