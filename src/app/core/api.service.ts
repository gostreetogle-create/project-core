import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
export interface PaginatedResponse<T> extends ApiResponse<T[]> { total: number; page: number; limit: number; totalPages: number; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  baseUrl = '/api/v1';

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params: httpParams });
  }

  getById<T>(path: string, id: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}/${id}`);
  }

  post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body);
  }

  put<T>(path: string, id: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${path}/${id}`, body);
  }

  delete<T>(path: string, id: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}/${id}`);
  }

  getPaginated<T>(
    path: string,
    page = 1,
    limit = 20,
    params?: Record<string, string | number | boolean>
  ): Observable<PaginatedResponse<T>> {
    let httpParams = new HttpParams().set('page', String(page)).set('limit', String(limit));
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        httpParams = httpParams.set(key, String(value));
      }
    }
    return this.http.get<PaginatedResponse<T>>(`${this.baseUrl}${path}`, { params: httpParams });
  }
}
