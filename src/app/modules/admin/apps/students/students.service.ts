import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from 'app/core/base/base-http.service';
import { BehaviorSubject, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Student } from '../shared/students.types';
import { Country, Tag } from '../turmas/turma.types';

@Injectable({ providedIn: 'root' })
export class StudentsService extends BaseHttpService {

    private _aluno: BehaviorSubject<Student | null> = new BehaviorSubject(null);
    private _alunos: BehaviorSubject<Student[] | null> = new BehaviorSubject(null);
    private _countries: BehaviorSubject<Country[] | null> = new BehaviorSubject(null);
    private _tags: BehaviorSubject<Tag[] | null> = new BehaviorSubject(null);
    private _httpClient = inject(HttpClient);
    
    constructor(http: HttpClient) {
        super(http);
    }

    get aluno$(): Observable<Student> {
        return this._aluno.asObservable();
    }

    get alunos$(): Observable<Student[]> {
        return this._alunos.asObservable();
    }

    getAllStudents(): Observable<Student[]> {
        return this._httpClient.get<Student[]>(`${this.apiUrl}/student`).pipe(
            tap(alunos => this._alunos.next(alunos)),
            catchError(error => {
                console.error('Erro ao buscar alunos:', error);
                return throwError(() => error);
            })
        );
    }

    getAllStudentsWithClass(): Observable<Student[]> {
        return this._httpClient.get<Student[]>(`${this.apiUrl}/student/GetAllStudentsWithClass`).pipe(
            tap(alunos => this._alunos.next(alunos)), 
            catchError(error => {
                console.error('Erro ao buscar alunos com turma:', error);
                return throwError(() => error);
            })
        );
    }

    getAlunoById(id: number): Observable<Student> {
        return this._httpClient.get<Student>(`${this.apiUrl}/student/${id}`).pipe(
            tap(aluno => this._aluno.next(aluno)),
            catchError(error => {
                console.error(`Erro ao buscar aluno com id ${id}:`, error);
                return throwError(() => new Error(`Student não encontrado com id: ${id}`));
            })
        );
    }

    getStudentsByClassId(classId: number): Observable<Student[]> {
        return this._httpClient.get<Student[]>(`${this.apiUrl}/student/buscarAlunoPorTurma/${classId}`).pipe(
            catchError(error => {
                console.error(`Erro ao buscar alunos da turma ${classId}:`, error);
                return throwError(() => new Error('Erro ao buscar alunos da turma'));
            })
        );
    }

    createAluno(aluno: Student): Observable<Student> {
        return this._httpClient.post<Student>(`${this.apiUrl}/student`, aluno).pipe(
            tap(() => this.getAllStudents().subscribe()), // Atualiza lista após criação
            catchError(error => {
                console.error('Erro ao criar aluno:', error);
                return throwError(() => new Error('Erro ao criar aluno'));
            })
        );
    }

    updateAluno(id: number, aluno: Student): Observable<void> {
        return this._httpClient.put<void>(`${this.apiUrl}/student/${id}`, aluno).pipe(
            tap(() => this.getAllStudents().subscribe()), // Atualiza lista após edição
            catchError(error => {
                console.error('Erro ao atualizar aluno:', error);
                return throwError(() => new Error('Erro ao atualizar aluno'));
            })
        );
    }

    deleteAluno(id: number): Observable<void> {
        return this._httpClient.delete<void>(`${this.apiUrl}/student/${id}`).pipe(
            tap(() => this.getAllStudents().subscribe()), // Atualiza lista após exclusão
            catchError(error => {
                console.error('Erro ao deletar aluno:', error);
                return throwError(() => new Error('Erro ao deletar aluno'));
            })
        );
    }

    searchAlunos(query: string): Observable<Student[]> {
        return this._httpClient.get<Student[]>(`${this.apiUrl}/student`, { params: { query } }).pipe(
            tap(alunos => this._alunos.next(alunos)),
            catchError(error => {
                console.error('Erro ao buscar alunos com query:', error);
                return throwError(() => new Error('Erro ao buscar alunos com query'));
            })
        );
    }

    setAlunos(alunos: Student[]): void {
        this._alunos.next(alunos);
    }
}
