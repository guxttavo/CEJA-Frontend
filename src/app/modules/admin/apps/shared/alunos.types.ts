export interface Aluno {
    id: number;
    name: string;
    email: string;
    phoneNumbers?: {
        country: string;
        phoneNumber: string;
        label: string;
    }[];
    document: string;
    password: string;
    phone: string;
    address?: string | null;
    bornDate: string;
    passwordResetToken?: string;
    passwordResetTokenExpiry?: string;
    notes?: string | null;
    tags?: string[];
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
