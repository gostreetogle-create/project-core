import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

interface User { id: string; username: string; displayName: string; role: string; permissions: string[]; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private _currentUser = signal<User | null>(null);
  currentUser = this._currentUser.asReadonly();

  isAuthenticated = computed(() => this._currentUser() !== null);

  get accessToken(): string | null { return localStorage.getItem('accessToken'); }
  get refreshTokenValue(): string | null { return localStorage.getItem('refreshToken'); }

  login(username: string, password: string) {
    return this.http.post<{data: { user: User; accessToken: string; refreshToken: string }}>('/api/v1/auth/login', { username, password }).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        this._currentUser.set(res.data.user);
      })
    );
  }

  refreshToken() {
    return this.http.post<{data: { accessToken: string; refreshToken: string }}>('/api/v1/auth/refresh', {
      refreshToken: this.refreshTokenValue
    }).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
      })
    );
  }

  constructor() {
    this.loadUserFromStorage();
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  loadUserFromStorage() {
    const token = this.accessToken;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this._currentUser.set(payload as User);
      } catch {
        this.logout();
      }
    }
  }
}
