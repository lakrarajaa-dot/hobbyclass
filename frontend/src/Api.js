const BASE_URL = 'http://localhost:5000/api';

export const getCours = () => 
  fetch(`${BASE_URL}/cours`).then(res => res.json());