// App principal Vite, trazido do CRA antigo.
// Diferença principal: aqui só cuida do layout/rotas; o bootstrap está em src/main.tsx (Vite),
// enquanto no CRA ficava em src/index.tsx.

import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
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
              className={({ isActive }: { isActive: boolean }) =>
                'nav-item' + (isActive ? ' active' : '')
              }
            >
              <span className="nav-icon">📄</span>
              <span>Propostas</span>
            </NavLink>
            <NavLink
              to="/contratacoes"
              className={({ isActive }: { isActive: boolean }) =>
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
