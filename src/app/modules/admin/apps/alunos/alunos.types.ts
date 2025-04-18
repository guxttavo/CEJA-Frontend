export interface Aluno {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    classId?: number;
    registrationNumber: number;

    class?: {
        id: number;
        year: number;
        shift: number; 
        suffix: string;
        educationLevel: string;
    };
}
