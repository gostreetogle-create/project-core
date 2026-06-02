import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from './auth.service';

/** Флаг: идёт ли сейчас обновление токена */
let refreshInProgress = false;
/** Subject для очереди запросов, ожидающих завершения refresh */
let refreshSubject = new BehaviorSubject<string | null>(null);

/**
 * Интерсептор автоматического продления сессии:
 * 1. Добавляет accessToken в заголовок Authorization.
 * 2. При 401 (и не-auth-запросах) — вызывает refreshToken()
 *    и повторяет оригинальный запрос с новым токеном.
 * 3. Очередь конкурирующих запросов: пока идёт refresh, все 401-запросы
 *    ждут его завершения и затем повторяются.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.accessToken;

  // Клонируем запрос с токеном, если он есть
  let authReq = req;
  if (token) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(authReq).pipe(
    catchError((error: unknown) => {
      // Обрабатываем только 401, не на auth-эндпоинтах, и только если был токен
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.startsWith('/api/v1/auth/') &&
        token
      ) {
        return handle401AndRetry(req, next, auth);
      }
      return throwError(() => error);
    })
  );
};

function handle401AndRetry(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
) {
  // Если refresh уже идёт — встаём в очередь
  if (refreshInProgress) {
    return refreshSubject.pipe(
      filter((t): t is string => t !== null),
      take(1),
      switchMap((newToken) =>
        next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))
      )
    );
  }

  // Начинаем refresh
  refreshInProgress = true;
  refreshSubject = new BehaviorSubject<string | null>(null);

  return auth.refreshToken().pipe(
    switchMap(() => {
      refreshInProgress = false;
      const newToken = auth.accessToken;
      refreshSubject.next(newToken);
      // Повторяем оригинальный запрос
      return next(
        req.clone({ setHeaders: { Authorization: `Bearer ${newToken!}` } })
      );
    }),
    catchError((refreshError) => {
      refreshInProgress = false;
      refreshSubject.error(refreshError);
      auth.logout();
      return throwError(() => refreshError);
    })
  );
}
