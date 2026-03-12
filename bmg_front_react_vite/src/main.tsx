// Ponto de entrada Vite (equivale ao index.tsx do CRA).
// Aqui fazemos apenas o bootstrap do App no elemento #root.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
