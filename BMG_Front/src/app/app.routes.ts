import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/propostas', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'propostas', loadComponent: () => import('./pages/propostas/propostas.component').then(m => m.PropostasComponent), canActivate: [AuthGuard] },
  { path: 'contratacoes', loadComponent: () => import('./pages/contratacoes/contratacoes.component').then(m => m.ContratacoesComponent), canActivate: [AuthGuard] },
  { path: 'help', loadComponent: () => import('./pages/help/help.component').then(m => m.HelpComponent), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/propostas' }
];
