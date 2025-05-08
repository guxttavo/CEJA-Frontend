import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Nota } from '../../shared/notas.types';

@Injectable({ providedIn: 'root' })
export class NotaService {
    private _httpClient = inject(HttpClient);
    private apiUrl = 'https://localhost:44389/api';

    constructor() {}

    getGradeStudent(studentId: number): Observable<Nota[]> {
        return this._httpClient.get<Nota[]>(`${this.apiUrl}/grades/student/${studentId}`).pipe(
            catchError(error => {
                console.error(`Erro ao buscar notas do aluno ${studentId}:`, error);
                return throwError(() => new Error('Erro ao buscar notas do aluno'));
            })
        );
    }
}
