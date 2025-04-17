export interface Turma {
    id?: number;
    year: number;
    shift: Shift; 
    suffix: string;
}

export enum Shift {
    Manha = 1,
    Tarde = 2,
    Noite = 3
}
  
export interface Country {
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}

export interface Tag {
    id?: string;
    title?: string;
}
