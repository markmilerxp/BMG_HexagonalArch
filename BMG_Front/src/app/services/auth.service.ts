import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly SESSION_KEY = 'bmg_auth';

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem(this.SESSION_KEY, 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem(this.SESSION_KEY) === 'true';
  }
}
