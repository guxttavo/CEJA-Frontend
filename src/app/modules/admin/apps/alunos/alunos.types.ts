import { DateTime } from "luxon";

export interface Aluno {
    id: string;
    avatar?: string | null;
    background?: string | null;
    registrationNumber: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    bornDate?: DateTime;
}
