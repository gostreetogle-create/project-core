import { ErrorHandler, Injectable, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private notify = inject(NotificationService);

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('[GlobalErrorHandler]', error);
    this.notify.error(`Что-то пошло не так: ${message}`);
  }
}
