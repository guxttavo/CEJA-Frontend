import { Aluno } from "./alunos.types";

export interface Turma {
    id?: number;
    year?: number;
    shift?: Shift;
    suffix?: string;
    educationLevel?: EducationLevel;
    students?: Aluno[];
    teachers_Class?: ProfessorTurma[];
}

export enum Shift {
    Manha = 1,
    Tarde = 2,
    Noite = 3
}

export enum EducationLevel {
    Fundamental = 1,
    Medio = 2,
    Infantil = 3
}

export interface ProfessorTurma {
    id: number;
    teacherId: number;
    classId: number;
    // ...outros campos
}
