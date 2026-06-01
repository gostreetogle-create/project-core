import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type NotificationType = 'success' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messageService = inject(MessageService);

  add(type: NotificationType, message: string, summary?: string) {
    const titles: Record<NotificationType, string> = {
      success: 'Успешно',
      info: 'Информация',
      warn: 'Предупреждение',
      error: 'Ошибка'
    };
    this.messageService.add({
      severity: type,
      summary: summary || titles[type],
      detail: message
    });
  }

  success(message: string) { this.add('success', message); }
  error(message: string) { this.add('error', message); }
  info(message: string) { this.add('info', message); }
  warn(message: string) { this.add('warn', message); }
}
