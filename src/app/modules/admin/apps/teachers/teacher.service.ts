import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from 'app/core/base/base-http.service';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { Teacher } from '../shared/teacher.types';

@Injectable({ providedIn: 'root' })
export class TeacherService extends BaseHttpService {
    private _teacher: BehaviorSubject<Teacher | null> = new BehaviorSubject(null);
    private _teachers: BehaviorSubject<Teacher[] | null> = new BehaviorSubject(null);
    private _httpClient = inject(HttpClient);

    constructor(http: HttpClient) {
        super(http);
    }

    getAllTeachers(): Observable<Teacher[]> {
        return this._httpClient.get<Teacher[]>(`${this.apiUrl}/teacher`).pipe(
            tap((teachers) => this._teachers.next(teachers)),
            catchError(error => {
                console.error('Erro ao buscar professores:', error);
                return throwError(() => error);
            })
        );
    }
}
