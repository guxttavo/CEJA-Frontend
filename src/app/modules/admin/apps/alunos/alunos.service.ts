import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Aluno, Country, Tag } from 'app/modules/admin/apps/alunos/alunos.types';
import { BehaviorSubject, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AlunosService {
    private _aluno: BehaviorSubject<Aluno | null> = new BehaviorSubject(null);
    private _alunos: BehaviorSubject<Aluno[] | null> = new BehaviorSubject(null);
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);

    private apiUrl = 'https://localhost:44389/api';

    constructor(private _httpClient: HttpClient) { }

    get aluno$(): Observable<Aluno> {
        return this._aluno.asObservable();
    }

    get alunos$(): Observable<Aluno[]> {
        return this._alunos.asObservable();
    }

    get countries$(): Observable<Country[]> {
        return this._countries.asObservable();
    }

    get tags$(): Observable<Tag[]> {
        return this._tags.asObservable();
    }

    getAlunos(): Observable<Aluno[]> {
        return this._httpClient.get<Aluno[]>(`${this.apiUrl}/Student`).pipe(
            tap((alunos) => this._alunos.next(alunos)),
            catchError((error) => {
                console.error('Erro ao buscar alunos:', error);
                return throwError(() => error);
            })
        );
    }

    searchAlunos(query: string): Observable<Aluno[]> {
        return this._httpClient.get<Aluno[]>('api/apps/alunos/search', { params: { query } }).pipe(
            tap((alunos) => {
                this._alunos.next(alunos);
            }),
            catchError((error) => {
                console.error('Erro ao buscar alunos com query:', error);
                return throwError(() => new Error('Erro ao buscar alunos com query'));
            })
        );
    }

    getAlunoById(id: string): Observable<Aluno> {
        return this._alunos.pipe(
            take(1),
            map((alunos) => {
                const aluno = alunos.find((item) => item.id === id) || null;
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

    updateAluno(id: string, aluno: Aluno): Observable<Aluno> {
        return this.alunos$.pipe(
            take(1),
            switchMap((alunos) =>
                this._httpClient.patch<Aluno>('api/apps/alunos/aluno', { id, aluno }).pipe(
                    map((updatedAluno) => {
                        const index = alunos.findIndex((item) => item.id === id);
                        alunos[index] = updatedAluno;
                        this._alunos.next(alunos);
                        return updatedAluno;
                    }),
                    catchError((error) => {
                        console.error('Erro ao atualizar aluno:', error);
                        return throwError(() => new Error('Erro ao atualizar aluno'));
                    })
                )
            )
        );
    }

    deleteAluno(id: string): Observable<boolean> {
        return this.alunos$.pipe(
            take(1),
            switchMap((alunos) =>
                this._httpClient.delete('api/apps/alunos/aluno', { params: { id } }).pipe(
                    map((isDeleted: boolean) => {
                        const index = alunos.findIndex((item) => item.id === id);
                        alunos.splice(index, 1);
                        this._alunos.next(alunos);
                        return isDeleted;
                    }),
                    catchError((error) => {
                        console.error('Erro ao deletar aluno:', error);
                        return throwError(() => new Error('Erro ao deletar aluno'));
                    })
                )
            )
        );
    }

    getCountries(): Observable<Country[]> {
        return this._httpClient.get<Country[]>('api/apps/alunos/countries').pipe(
            tap((countries) => {
                this._countries.next(countries);
            }),
            catchError((error) => {
                console.error('Erro ao buscar países:', error);
                return throwError(() => new Error('Erro ao buscar países'));
            })
        );
    }

    getTags(): Observable<Tag[]> {
        return this._httpClient.get<Tag[]>('api/apps/alunos/tags').pipe(
            tap((tags) => {
                this._tags.next(tags);
            }),
            catchError((error) => {
                console.error('Erro ao buscar tags:', error);
                return throwError(() => new Error('Erro ao buscar tags'));
            })
        );
    }

    createTag(tag: Tag): Observable<Tag> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient.post<Tag>('api/apps/alunos/tag', { tag }).pipe(
                    map((newTag) => {
                        this._tags.next([...tags, newTag]);
                        return newTag;
                    }),
                    catchError((error) => {
                        console.error('Erro ao criar tag:', error);
                        return throwError(() => new Error('Erro ao criar tag'));
                    })
                )
            )
        );
    }

    updateTag(id: string, tag: Tag): Observable<Tag> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient.patch<Tag>('api/apps/alunos/tag', { id, tag }).pipe(
                    map((updatedTag) => {
                        const index = tags.findIndex((item) => item.id === id);
                        tags[index] = updatedTag;
                        this._tags.next(tags);
                        return updatedTag;
                    }),
                    catchError((error) => {
                        console.error('Erro ao atualizar tag:', error);
                        return throwError(() => new Error('Erro ao atualizar tag'));
                    })
                )
            )
        );
    }

    deleteTag(id: string): Observable<boolean> {
        return this.tags$.pipe(
            take(1),
            switchMap((tags) =>
                this._httpClient.delete('api/apps/alunos/tag', { params: { id } }).pipe(
                    map((isDeleted: boolean) => {
                        const index = tags.findIndex((item) => item.id === id);
                        tags.splice(index, 1);
                        this._tags.next(tags);
                        return isDeleted;
                    }),
                    catchError((error) => {
                        console.error('Erro ao deletar tag:', error);
                        return throwError(() => new Error('Erro ao deletar tag'));
                    })
                )
            )
        );
    }

    uploadAvatar(id: string, avatar: File): Observable<Aluno> {
        return this.alunos$.pipe(
            take(1),
            switchMap((alunos) =>
                this._httpClient.post<Aluno>('api/apps/alunos/avatar', { id, avatar }, {
                    headers: {
                        'Content-Type': avatar.type,
                    },
                }).pipe(
                    map((updatedAluno) => {
                        const index = alunos.findIndex((item) => item.id === id);
                        alunos[index] = updatedAluno;
                        this._alunos.next(alunos);
                        return updatedAluno;
                    }),
                    catchError((error) => {
                        console.error('Erro ao atualizar avatar:', error);
                        return throwError(() => new Error('Erro ao atualizar avatar'));
                    })
                )
            )
        );
    }
}
