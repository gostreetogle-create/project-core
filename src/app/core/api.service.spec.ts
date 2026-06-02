import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('создаётся', () => {
    expect(service).toBeTruthy();
  });

  it('baseUrl по умолчанию /api/v1', () => {
    expect(service.baseUrl).toBe('/api/v1');
  });

  describe('get()', () => {
    it('делает GET-запрос с правильным URL', () => {
      service.get('/users').subscribe((res) => {
        expect(res.data).toEqual([{ id: 1 }]);
      });
      const req = httpMock.expectOne('/api/v1/users');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: [{ id: 1 }] });
    });

    it('добавляет query-параметры', () => {
      service.get('/users', { page: 1, search: 'admin' }).subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === '/api/v1/users' && r.params.get('page') === '1' && r.params.get('search') === 'admin'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: [] });
    });
  });

  describe('getById()', () => {
    it('делает запрос с ID в URL', () => {
      service.getById('/users', 'abc123').subscribe();
      const req = httpMock.expectOne('/api/v1/users/abc123');
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: { id: 'abc123' } });
    });
  });

  describe('post()', () => {
    it('делает POST-запрос с телом', () => {
      service.post('/users', { name: 'Test' }).subscribe();
      const req = httpMock.expectOne('/api/v1/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Test' });
      req.flush({ success: true, data: { id: 'new' }, message: 'Создано' });
    });
  });

  describe('put()', () => {
    it('делает PUT-запрос с ID и телом', () => {
      service.put('/users', 'abc', { name: 'Updated' }).subscribe();
      const req = httpMock.expectOne('/api/v1/users/abc');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: 'Updated' });
      req.flush({ success: true, data: { id: 'abc', name: 'Updated' } });
    });
  });

  describe('delete()', () => {
    it('делает DELETE-запрос с ID', () => {
      service.delete('/users', 'abc').subscribe();
      const req = httpMock.expectOne('/api/v1/users/abc');
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, data: null });
    });
  });

  describe('getPaginated()', () => {
    it('делает GET с page и limit по умолчанию', () => {
      service.getPaginated('/users').subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === '/api/v1/users' && r.params.get('page') === '1' && r.params.get('limit') === '20'
      );
      req.flush({ success: true, data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    });

    it('принимает кастомные page и limit', () => {
      service.getPaginated('/users', 3, 10).subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === '/api/v1/users' && r.params.get('page') === '3' && r.params.get('limit') === '10'
      );
      req.flush({ success: true, data: [], total: 0, page: 3, limit: 10, totalPages: 0 });
    });

    it('добавляет дополнительные параметры', () => {
      service.getPaginated('/users', 1, 10, { sort: '-name', search: 'test' }).subscribe();
      const req = httpMock.expectOne(
        (r) =>
          r.url === '/api/v1/users' &&
          r.params.get('sort') === '-name' &&
          r.params.get('search') === 'test'
      );
      req.flush({ success: true, data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    });
  });
});
