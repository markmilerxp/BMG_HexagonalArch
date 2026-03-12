import axios from 'axios';

// Mesma instância axios usada no CRA, agora dentro do projeto Vite.
export const api = axios.create({
  baseURL: '/api',
});

