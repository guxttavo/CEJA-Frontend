import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Turma } from 'app/modules/admin/apps/turmas/turma.types';
import { BehaviorSubject, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })

export class TurmaService {

    private _turma: BehaviorSubject<Turma | null> = new BehaviorSubject(null);
    private _turmas: BehaviorSubject<Turma[] | null> = new BehaviorSubject(null);

    private apiUrl = 'https://localhost:44389/api';

    constructor(private _httpClient: HttpClient) { }

    get turma$(): Observable<Turma> {
        return this._turma.asObservable();
    }

    get turmas$(): Observable<Turma[]> {
        return this._turmas.asObservable();
    }

    getTurmas(): Observable<Turma[]> {
        return this._httpClient.get<Turma[]>(`${this.apiUrl}/class/buscarTurmas`).pipe(
            tap((turmas) => this._turmas.next(turmas)),
            catchError((error) => {
                console.error('Erro ao buscar turmas:', error);
                return throwError(() => error);
            })
        );
    }

    getTurmaById(id: number): Observable<Turma> {
        return this._turmas.pipe(
            take(1),
            map((turmas) => {
                const turma = turmas.find((item) => item.id === id) || null;
                this._turma.next(turma);
                return turma;
            }),
            switchMap((turma) => {
                if (!turma) {
                    return throwError(() => new Error('Turma não encontrado com id: ' + id));
                }
                return of(turma);
            })
        );
    }

    createTurma(turma: Turma): Observable<Turma> {
        return this._httpClient.post<Turma>(`${this.apiUrl}/class`, turma).pipe(
            catchError((error) => {
                console.error('Erro ao criar turma:', error);
                return throwError(() => new Error('Erro ao criar turma'));
            })
        );
    }
    
    searchTurmas(query: string): Observable<Turma[]> {
        return this._httpClient.get<Turma[]>('api/apps/class/search', { params: { query } }).pipe(
            tap((turmas) => {
                this._turmas.next(turmas);
            }),
            catchError((error) => {
                console.error('Erro ao buscar turmas com query:', error);
                return throwError(() => new Error('Erro ao buscar turmas com query'));
            })
        );
    }
}
