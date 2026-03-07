import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  erro = '';
  carregando = false;

  constructor(private auth: AuthService, private router: Router) {}

  entrar(): void {
    this.erro = '';
    if (!this.username || !this.password) {
      this.erro = 'Preencha usuário e senha.';
      return;
    }
    this.carregando = true;
    setTimeout(() => {
      const ok = this.auth.login(this.username, this.password);
      this.carregando = false;
      if (ok) {
        this.router.navigate(['/propostas']);
      } else {
        this.erro = 'Usuário ou senha inválidos.';
      }
    }, 400);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.entrar();
  }
}
