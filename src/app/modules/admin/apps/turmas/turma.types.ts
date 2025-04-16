export interface Turma {
    id: string;
    year: number;
    shift: number;
    suffix: string;
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
