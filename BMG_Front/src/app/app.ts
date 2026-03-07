import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  isLoginPage = false;

  navItems = [
    { label: 'Propostas', icon: '📋', route: '/propostas' },
    { label: 'Contratações', icon: '📄', route: '/contratacoes' }
  ];

  constructor(public auth: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isLoginPage = e.urlAfterRedirects === '/login';
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
