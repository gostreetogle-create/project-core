import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { authInterceptor } from './auth.interceptor';

@Component({ template: '' })
class DummyComponent {}

/** Browser-compatible base64 encode */
function safeBtoa(str: string): string {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return Buffer.from(bytes).toString('base64');
}

function makeToken(payload: Record<string, unknown>): string {
  return `header.${safeBtoa(JSON.stringify(payload))}.sign`;
}

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  const userPayload = { id: 'u1', username: 'admin', displayName: 'Admin', role: 'admin', permissions: ['*'] };

  /** Создаёт свежий токен с exp в будущем (+1 час) */
  function freshToken(): string {
    return makeToken({ ...userPayload, exp: Math.floor(Date.now() / 1000) + 3600 });
  }

  beforeEach(() => {
    localStorage.clear();
  });

  function setup(token: string | null) {
    if (token) localStorage.setItem('accessToken', token);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', component: DummyComponent }]),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  it('добавляет Authorization-заголовок когда токен есть', () => {
    const token = freshToken();
    setup(token);
    httpClient.get('/api/v1/users').subscribe();
    const req = httpMock.expectOne('/api/v1/users');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush([]);
  });

  it('не добавляет Authorization-заголовок когда токена нет', () => {
    setup(null);
    httpClient.get('/api/v1/users').subscribe();
    const req = httpMock.expectOne('/api/v1/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('при 401 без токена — не вызывает refresh, просто проксирует ошибку', () => {
    setup(null);
    httpClient.get('/api/v1/users').subscribe({
      error: (err) => {
        expect(err.status).toBe(401);
      },
    });
    const req = httpMock.expectOne('/api/v1/users');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Убеждаемся, что refresh НЕ был вызван
    httpMock.expectNone('/api/v1/auth/refresh');
  });

  it('при 401 с токеном — вызывает refresh и повторяет запрос с новым токеном', () => {
    const oldToken = freshToken();
    setup(oldToken);

    httpClient.get('/api/v1/users').subscribe();

    // Первый запрос — 401
    const req1 = httpMock.expectOne('/api/v1/users');
    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Должен быть вызван refresh
    const refreshReq = httpMock.expectOne('/api/v1/auth/refresh');
    const newToken = makeToken({ ...userPayload, exp: Math.floor(Date.now() / 1000) + 7200 });
    refreshReq.flush({ data: { accessToken: newToken } });

    // После refresh — повтор оригинального запроса
    const req2 = httpMock.expectOne('/api/v1/users');
    expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${newToken}`);
    req2.flush([]);
  });

  it('не вызывает refresh для запросов к /auth/*', () => {
    setup(freshToken());
    httpClient.get('/api/v1/auth/me').subscribe({
      error: (err) => {
        expect(err.status).toBe(401);
      },
    });
    const req = httpMock.expectOne('/api/v1/auth/me');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Refresh НЕ должен быть вызван
    httpMock.expectNone('/api/v1/auth/refresh');
  });

  it('при провале refresh — делает logout и редирект', () => {
    setup(freshToken());
    httpClient.get('/api/v1/users').subscribe({
      error: (err) => {
        expect(err.status).toBe(401);
      },
    });

    // Первый запрос — 401
    const req1 = httpMock.expectOne('/api/v1/users');
    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Refresh проваливается
    const refreshReq = httpMock.expectOne('/api/v1/auth/refresh');
    refreshReq.flush('Invalid refresh token', { status: 401, statusText: 'Unauthorized' });

    // Должен быть вызван logout
    const logoutReq = httpMock.expectOne('/api/v1/auth/logout');
    logoutReq.flush({});

    // accessToken удалён
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('ставит конкурирующие 401-запросы в очередь и выполняет только один refresh', () => {
    const oldToken = freshToken();
    setup(oldToken);

    // Три одновременных запроса
    httpClient.get('/api/v1/users').subscribe();
    httpClient.get('/api/v1/dashboard').subscribe();
    httpClient.get('/api/v1/settings').subscribe();

    // Все три получают 401
    const reqs = [
      httpMock.expectOne('/api/v1/users'),
      httpMock.expectOne('/api/v1/dashboard'),
      httpMock.expectOne('/api/v1/settings'),
    ];
    reqs.forEach((r) => r.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' }));

    // Только ОДИН refresh
    const refreshReq = httpMock.expectOne('/api/v1/auth/refresh');
    const newToken = makeToken({ ...userPayload, exp: Math.floor(Date.now() / 1000) + 7200 });
    refreshReq.flush({ data: { accessToken: newToken } });

    // Все три повторяются с новым токеном
    const retries = [
      httpMock.expectOne('/api/v1/users'),
      httpMock.expectOne('/api/v1/dashboard'),
      httpMock.expectOne('/api/v1/settings'),
    ];
    retries.forEach((r) => {
      expect(r.request.headers.get('Authorization')).toBe(`Bearer ${newToken}`);
      r.flush({});
    });
  });
});
