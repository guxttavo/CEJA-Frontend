import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from 'app/core/base/base-http.service';
import { BehaviorSubject, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Aluno } from '../shared/alunos.types';
import { Country, Tag } from '../turmas/turma.types';

@Injectable({ providedIn: 'root' })
export class AlunosService extends BaseHttpService{
    private _aluno: BehaviorSubject<Aluno | null> = new BehaviorSubject(null);
    private _alunos: BehaviorSubject<Aluno[] | null> = new BehaviorSubject(null);
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
    private _httpClient = inject(HttpClient);
    
    constructor(http: HttpClient) {
        super(http);
    }

    get aluno$(): Observable<Aluno> {
        return this._aluno.asObservable();
    }

    get alunos$(): Observable<Aluno[]> {
        return this._alunos.asObservable();
    }

    getAllStudents(): Observable<Aluno[]> {
        return this._httpClient.get<Aluno[]>(`${this.apiUrl}/Student`).pipe(
            tap((alunos) => this._alunos.next(alunos)),
            catchError((error) => {
                console.error('Erro ao buscar alunos:', error);
                return throwError(() => error);
            })
        );
    }

    getAllStudentsWithClass(): Observable<Aluno[]> {
        return this._httpClient.get<Aluno[]>(`${this.apiUrl}/Student/GetAllStudentsWithClass`).pipe(
            tap((alunos) => this._alunos.next(alunos)), 
            catchError((error) => {
                console.error('Erro ao buscar alunos com turma:', error);
                return throwError(() => error);
            })
        );
    }
    
    searchAlunos(query: string): Observable<Aluno[]> {
        return this._httpClient.get<Aluno[]>(`${this.apiUrl}/student`, { params: { query } }).pipe(
            tap((alunos) => {
                this._alunos.next(alunos);
            }),
            catchError((error) => {
                console.error('Erro ao buscar alunos com query:', error);
                return throwError(() => new Error('Erro ao buscar alunos com query'));
            })
        );
    }

    getAlunoById(id: number): Observable<Aluno> {
        return this._alunos.pipe(
            take(1),
            map((alunos) => {
                const aluno = alunos.find((item) => item.id == id) || null;
                this._aluno.next(aluno);
                return aluno;
            }),
            switchMap((aluno) => {
                if (!aluno) {
                    return throwError(() => new Error('Aluno não encontrado com id: ' + id));
                }
                return of(aluno);
            })
        );
    }

    createAluno(): Observable<Aluno> {
        return this.alunos$.pipe(
            take(1),
            switchMap((alunos) =>
                this._httpClient.post<Aluno>('api/apps/alunos/aluno', {}).pipe(
                    map((newAluno) => {
                        this._alunos.next([newAluno, ...alunos]);
                        return newAluno;
                    }),
                    catchError((error) => {
                        console.error('Erro ao criar aluno:', error);
                        return throwError(() => new Error('Erro ao criar aluno'));
                    })
                )
            )
        );
    }

    setAlunos(alunos: Aluno[]): void {
        this._alunos.next(alunos);
    }
}
