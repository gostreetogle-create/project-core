import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { KpInputComponent } from '../../shared/ui/kp-input.component';
import { KpButtonComponent } from '../../shared/ui/kp-button.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, KpInputComponent, KpButtonComponent, ToastModule],
  template: `
    <div class="login">
      <div class="login__card">
        <div class="login__header">
          <h1 class="login__title">Project Core</h1>
          <p class="login__subtitle">Вход в систему</p>
        </div>

        <form (ngSubmit)="login()" class="login__form">
          <div class="login__field">
            <kp-input
              label="Имя пользователя"
              [type]="'text'"
              placeholder="Введите логин"
              [(ngModel)]="username"
              name="username"
              [error]="errors().username ?? ''"
            />
          </div>

          <div class="login__field">
            <kp-input
              label="Пароль"
              [type]="'password'"
              placeholder="Введите пароль"
              [(ngModel)]="password"
              name="password"
              [error]="errors().password ?? ''"
            />
          </div>

          @if (errors().general) {
            <div class="login__error">{{ errors().general }}</div>
          }

          <kp-button
            [label]="loading() ? 'Вход...' : 'Войти'"
            [loading]="loading()"
            styleClass="login__submit"
            (buttonClick)="login()"
          />
        </form>
      </div>
    </div>

    <p-toast position="top-right" />
  `,
  styles: [`
    .login {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: var(--color-bg);
      padding: var(--space-4);
    }
    .login__card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: var(--space-8);
      width: 100%;
      max-width: 380px;
    }
    .login__header {
      text-align: center;
      margin-bottom: var(--space-6);
    }
    .login__title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
      margin: 0 0 var(--space-1);
    }
    .login__subtitle {
      color: var(--color-text-muted);
      margin: 0;
      font-size: var(--font-size-sm);
    }
    .login__form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .login__field {
      display: flex;
      flex-direction: column;
    }
    .login__submit {
      width: 100%;
      margin-top: var(--space-2);
    }
    .login__error {
      background: var(--color-error-bg);
      color: var(--color-error);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
      text-align: center;
    }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  username = '';
  password = '';
  loading = signal(false);
  errors = signal<LoginErrors>({});

  login() {
    const errs: LoginErrors = {};
    if (!this.username.trim()) errs.username = 'Введите имя пользователя';
    if (!this.password.trim()) errs.password = 'Введите пароль';
    this.errors.set(errs);
    if (Object.keys(errs).length) return;

    this.loading.set(true);
    this.errors.set({});

    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Добро пожаловать!' });
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err.error?.message || 'Неверный логин или пароль';
        this.errors.set({ general: detail });
        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail });
      }
    });
  }
}
