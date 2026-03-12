import React from 'react';
import { BrowserRouter, NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { PropostasPage } from './pages/PropostasPage';
import { ContratacoesPage } from './pages/ContratacoesPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">🏦</span>
            <span className="logo-text">BMG Seguros</span>
          </div>
          <nav className="sidebar-nav">
            <NavLink
              to="/propostas"
              className={({ isActive }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
            >
              <span className="nav-icon">📄</span>
              <span>Propostas</span>
            </NavLink>
            <NavLink
              to="/contratacoes"
              className={({ isActive }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
            >
              <span className="nav-icon">✅</span>
              <span>Contratações</span>
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/propostas" replace />} />
            <Route path="/propostas" element={<PropostasPage />} />
            <Route path="/contratacoes" element={<ContratacoesPage />} />
            <Route path="*" element={<Navigate to="/propostas" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
