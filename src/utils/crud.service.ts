import { Inject, inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, UnaryFunction } from 'rxjs';
import { httpContextWithStudyPlace } from '@likdan/studyum-core';

export const CRUD_URL_TOKEN = new InjectionToken<string>('crud url');

@Injectable()
export class CrudService<T, DTO = T, ID = string> {
  protected query: any = {};
  protected onAction: { [key: string]: (response: any, request: any, data: any) => void } = {};
  private http = inject(HttpClient);

  constructor(@Inject(CRUD_URL_TOKEN) protected url: string) {
  }

  set actions(a: { [key: string]: (response: any, request: any, data: any) => void }) {
    this.onAction = a;
  }

  list(
    query: any = {},
    data: any = null,
  ): Observable<T[]> {
    return this.http
      .get<T[]>(this.url, { params: this.concatQuery(query), context: httpContextWithStudyPlace() })
      .pipe(this.applyAction('LIST', null, data));
  }

  get(id: ID, query: any = {}, data: any = null): Observable<T> {
    return this.http
      .get<T>(`${this.url}/${id}`, { params: this.concatQuery(query), context: httpContextWithStudyPlace() })
      .pipe(this.applyAction('GET', null, data));
  }

  put(id: ID, dto: DTO, query: any = {}, data: any = null): Observable<T> {
    return this.http
      .put<T>(this.url, { ...dto, id: id }, { params: this.concatQuery(query), context: httpContextWithStudyPlace() })
      .pipe(this.applyAction('PUT', { ...dto, id: id }, data));
  }

  post(dto: DTO, query: any = {}, data: any = null): Observable<T> {
    return this.http
      .post<T>(this.url, dto, { params: this.concatQuery(query), context: httpContextWithStudyPlace() })
      .pipe(this.applyAction('POST', dto, data));
  }

  postList(dto: DTO[], query: any = {}, data: any = null): Observable<T> {
    return this.http
      .post<T>(this.url, { list: dto }, { params: this.concatQuery(query), context: httpContextWithStudyPlace() })
      .pipe(this.applyAction('POST', dto, data));
  }

  delete(id: ID, query: any = {}, previous: T | null = null, data: any = null): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/${id}`, { params: this.concatQuery(query), context: httpContextWithStudyPlace() })
      .pipe(this.applyAction('DELETE', previous, data));
  }

  deleteList(ids: ID[], query: any = {}, data: any = null): Observable<void> {
    return this.http
      .delete<void>(this.url, {
        params: this.concatQuery(query),
        context: httpContextWithStudyPlace(),
        body: { ids: ids },
      })
      .pipe(this.applyAction('DELETE', ids, data));
  }

  private applyAction<O, T, D>(
    action: string,
    previous: T | null = null,
    data: D | null = null,
  ): UnaryFunction<Observable<O>, Observable<O>> {
    return tap(v => (this.onAction[action] ? this.onAction[action](v, previous, data) : null));
  }

  private concatQuery(query: any): any {
    return { ...this.query, ...query };
  }
}
