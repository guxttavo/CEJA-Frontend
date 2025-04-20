import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from 'app/core/base/base-http.service';
import { Turma, EducationLevel, Shift } from 'app/modules/admin/apps/shared/turmas.types';
import { BehaviorSubject, Observable, map, of, switchMap, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TurmasService extends BaseHttpService {
    private _turma: BehaviorSubject<Turma | null> = new BehaviorSubject(null);
    private _turmas: BehaviorSubject<Turma[] | null> = new BehaviorSubject(null);
    private _educationLevels: BehaviorSubject<{ value: number; label: string }[]> = new BehaviorSubject(null);
    private _shifts: BehaviorSubject<{ value: number; label: string }[]> = new BehaviorSubject(null);
    private _httpClient = inject(HttpClient);

    constructor(http: HttpClient) {
        super(http);
        this._initStaticData();
    }

    get turmas$(): Observable<Turma[]> {
        return this._turmas.asObservable();
    }

    get turma$(): Observable<Turma> {
        return this._turma.asObservable();
    }

    get educationLevels$(): Observable<{ value: number; label: string }[]> {
        return this._educationLevels.asObservable();
    }

    get shifts$(): Observable<{ value: number; label: string }[]> {
        return this._shifts.asObservable();
    }

    getTurmas(): Observable<Turma[]> {
        return this._httpClient.get<Turma[]>(`${this.apiUrl}/class`).pipe(
            tap((response: Turma[]) => {
                this._turmas.next(response);
            })
        );
    }

    getTurmaComAlunos(id: string): Observable<Turma> {
        return this._httpClient.get<Turma>(`${this.apiUrl}/class/${id}/withStudents`).pipe(
            map((turma) => {
                this._turma.next(turma);
                return turma;
            }),
            switchMap((turma) => {
                if (!turma) {
                    return throwError(() => new Error('Turma não encontrada com ID ' + id));
                }
                return of(turma);
            })
        );
    }

    addStudentToClass(classId: number, studentId: number): Observable<any> {
        return this._httpClient.post(`${this.apiUrl}/class/${classId}/addStudent/${studentId}`, {});
    }

    private _initStaticData(): void {
        this._educationLevels.next([
            { value: EducationLevel.Fundamental, label: 'Fundamental' },
            { value: EducationLevel.Medio, label: 'Médio' },
            { value: EducationLevel.Infantil, label: 'Infantil' }
        ]);

        this._shifts.next([
            { value: Shift.Manha, label: 'Manhã' },
            { value: Shift.Tarde, label: 'Tarde' },
            { value: Shift.Noite, label: 'Noite' }
        ]);
    }

    getStudentCountByClassId(id: number): Observable<number> {
        return this._httpClient.get<number>(`${this.apiUrl}/class/${id}/students/count`);
    }
    
    getTeacherCountByClassId(id: number): Observable<number> {
        return this._httpClient.get<number>(`${this.apiUrl}/class/${id}/teachers/count`);
    }
    
}
