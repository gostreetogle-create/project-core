import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="welcome">
      <h1 class="welcome__title">Project Core</h1>
      <p class="welcome__subtitle">Универсальное ядро для быстрого запуска веб-приложений</p>

      <div class="welcome__cards">
        <a routerLink="/ui-kit" class="welcome-card">
          <i class="pi pi-palette welcome-card__icon"></i>
          <span class="welcome-card__title">UI Kit</span>
          <span class="welcome-card__desc">10 компонентов: кнопки, таблицы, формы, диалоги</span>
        </a>

        <div class="welcome-card">
          <i class="pi pi-database welcome-card__icon"></i>
          <span class="welcome-card__title">Backend API</span>
          <span class="welcome-card__desc">Express + MongoDB + JWT + CRUD Factory</span>
        </div>

        <div class="welcome-card">
          <i class="pi pi-shield welcome-card__icon"></i>
          <span class="welcome-card__title">Авторизация</span>
          <span class="welcome-card__desc">JWT access + refresh токены, роли, права</span>
        </div>

        <div class="welcome-card">
          <i class="pi pi-cog welcome-card__icon"></i>
          <span class="welcome-card__title">Готово к работе</span>
          <span class="welcome-card__desc">Скопируй ядро → добавь бизнес-логику → готовый сайт</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-10) var(--space-4);
      text-align: center;
    }
    .welcome__title {
      font-size: 2rem;
      font-weight: var(--font-weight-bold);
      color: var(--color-primary);
      margin: 0 0 var(--space-2);
    }
    .welcome__subtitle {
      font-size: var(--font-size-lg);
      color: var(--color-text-muted);
      margin: 0 0 var(--space-8);
      max-width: 480px;
    }
    .welcome__cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--space-4);
      max-width: 960px;
      width: 100%;
    }
    .welcome-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
      box-shadow: var(--shadow-sm);
      transition: box-shadow 0.2s, transform 0.2s;
      cursor: pointer;
    }
    a.welcome-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .welcome-card__icon {
      font-size: 2rem;
      color: var(--color-primary);
      margin-bottom: var(--space-2);
    }
    .welcome-card__title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text);
    }
    .welcome-card__desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }
  `]
})
export class DashboardComponent {}
