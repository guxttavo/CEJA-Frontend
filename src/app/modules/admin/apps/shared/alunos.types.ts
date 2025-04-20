export interface Aluno {
    id: string;
    avatar?: string | null;
    background?: string | null;
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
