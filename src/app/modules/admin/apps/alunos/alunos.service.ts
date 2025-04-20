import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from 'app/core/base/base-http.service';
import { Country, Tag } from 'app/modules/admin/apps/shared/alunos.types';
import { BehaviorSubject, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Aluno } from '../shared/alunos.types';

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

    get countries$(): Observable<Country[]> {
        return this._countries.asObservable();
    }

    get tags$(): Observable<Tag[]> {
        return this._tags.asObservable();
    }

    getAlunos(): Observable<Aluno[]> {
        return this._httpClient.get<Aluno[]>(`${this.apiUrl}/student`).pipe(
            tap((alunos) => this._alunos.next(alunos)),
            catchError((error) => {
                console.error('Erro ao buscar alunos:', error);
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

    getAlunoById(id: string): Observable<Aluno> {
        return this._alunos.pipe(
            take(1),
            map((alunos) => {
                if (!alunos) {
                    throw new Error('A lista de alunos não foi carregada.');
                }

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
        // Cria um aluno com dados padrão
        const newAluno: Aluno = {
            id: this.generateId(), // Gere um ID único localmente
            name: 'Novo Aluno',
            email: '',
            phoneNumbers: [],
            bornDate: null,
            address: null,
            notes: null,
            tags: [],
            document: '',
            password: '',
            phone: '',
            registrationNumber: 0
        };
    
        // Atualiza a lista local de alunos
        return this.alunos$.pipe(
            take(1),
            map((alunos) => {
                this._alunos.next([newAluno, ...alunos]);
                return newAluno;
            })
        );
    }
    
    saveAluno(aluno: Aluno): Observable<Aluno> {
        // Salva o aluno na API
        return this._httpClient.post<Aluno>(`${this.apiUrl}/student`, aluno).pipe(
            tap((savedAluno) => {
                // Atualiza a lista local com o aluno salvo
                this.alunos$.pipe(take(1)).subscribe((alunos) => {
                    const updatedAlunos = alunos.map((a) =>
                        a.id === savedAluno.id ? savedAluno : a
                    );
                    this._alunos.next(updatedAlunos);
                });
            }),
            catchError((error) => {
                console.error('Erro ao salvar aluno:', error);
                return throwError(() => new Error('Erro ao salvar aluno'));
            })
        );
    }
    
    private generateId(): string {
        // Gera um ID único localmente
        return Math.random().toString(36).substr(2, 9);
    }

    updateAluno(id: string, aluno: Aluno): Observable<Aluno> {
        return this.alunos$.pipe(
            take(1),
            switchMap((alunos) =>
                this._httpClient.put<Aluno>(`${this.apiUrl}/student`, { id, aluno }).pipe(
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
                this._httpClient.delete(`${this.apiUrl}/student`, { params: { id } }).pipe(
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
        return this._httpClient.get<Country[]>(`${this.apiUrl}/student`).pipe(
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
        return this._httpClient.get<Tag[]>(`${this.apiUrl}/student`).pipe(
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
                this._httpClient.post<Tag>(`${this.apiUrl}/student`, { tag }).pipe(
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
                this._httpClient.patch<Tag>(`${this.apiUrl}/student`, { id, tag }).pipe(
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
                this._httpClient.delete(`${this.apiUrl}/student`, { params: { id } }).pipe(
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
                this._httpClient.post<Aluno>(`${this.apiUrl}/student`, { id, avatar }, {
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
