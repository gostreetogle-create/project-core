import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { MessageService } from 'primeng/api';

describe('NotificationService', () => {
  let service: NotificationService;
  let messageService: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessageService],
    });
    service = TestBed.inject(NotificationService);
    messageService = TestBed.inject(MessageService);
  });

  it('создаётся', () => {
    expect(service).toBeTruthy();
  });

  describe('add()', () => {
    it('вызывает messageService.add с правильным заголовком для success', () => {
      const spy = vi.spyOn(messageService, 'add').mockImplementation(() => {});
      service.add('success', 'Всё хорошо');
      expect(spy).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Успешно',
        detail: 'Всё хорошо',
      });
      spy.mockRestore();
    });

    it('вызывает messageService.add с кастомным заголовком', () => {
      const spy = vi.spyOn(messageService, 'add').mockImplementation(() => {});
      service.add('success', 'Готово', 'Поздравляем');
      expect(spy).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Поздравляем',
        detail: 'Готово',
      });
      spy.mockRestore();
    });

    it('использует правильные заголовки для всех типов', () => {
      const spy = vi.spyOn(messageService, 'add').mockImplementation(() => {});

      service.add('success', 'msg');
      expect(spy).toHaveBeenLastCalledWith({ severity: 'success', summary: 'Успешно', detail: 'msg' });

      service.add('info', 'msg');
      expect(spy).toHaveBeenLastCalledWith({ severity: 'info', summary: 'Информация', detail: 'msg' });

      service.add('warn', 'msg');
      expect(spy).toHaveBeenLastCalledWith({ severity: 'warn', summary: 'Предупреждение', detail: 'msg' });

      service.add('error', 'msg');
      expect(spy).toHaveBeenLastCalledWith({ severity: 'error', summary: 'Ошибка', detail: 'msg' });

      spy.mockRestore();
    });
  });

  describe('хелперы', () => {
    it('success() → add(success)', () => {
      const spy = vi.spyOn(service, 'add').mockImplementation(() => {});
      service.success('Ура!');
      expect(spy).toHaveBeenCalledWith('success', 'Ура!');
      spy.mockRestore();
    });

    it('error() → add(error)', () => {
      const spy = vi.spyOn(service, 'add').mockImplementation(() => {});
      service.error('Беда');
      expect(spy).toHaveBeenCalledWith('error', 'Беда');
      spy.mockRestore();
    });

    it('info() → add(info)', () => {
      const spy = vi.spyOn(service, 'add').mockImplementation(() => {});
      service.info('Кстати');
      expect(spy).toHaveBeenCalledWith('info', 'Кстати');
      spy.mockRestore();
    });

    it('warn() → add(warn)', () => {
      const spy = vi.spyOn(service, 'add').mockImplementation(() => {});
      service.warn('Осторожно');
      expect(spy).toHaveBeenCalledWith('warn', 'Осторожно');
      spy.mockRestore();
    });
  });
});
