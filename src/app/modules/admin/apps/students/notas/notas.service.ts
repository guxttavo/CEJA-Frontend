import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Grade } from '../../shared/grade.types';

@Injectable({ providedIn: 'root' })
export class GradeService {
    private _httpClient = inject(HttpClient);
    private apiUrl = 'https://localhost:44389/api';

    constructor() {}

    getGradeStudent(studentId: number): Observable<Grade[]> {
        return this._httpClient.get<Grade[]>(`${this.apiUrl}/grades/student/${studentId}`).pipe(
            catchError(error => {
                console.error(`Erro ao buscar notas do aluno ${studentId}:`, error);
                return throwError(() => new Error('Erro ao buscar notas do aluno'));
            })
        );
    }
}
