// src/auth-utility.d.ts
declare module '@comp/auth-utility' {
    import { BehaviorSubject } from 'rxjs';
    export interface UserSession {
        isAuthenticated: boolean;
        username: string | null;
        roles: string[];
    }
    export const userSession$: BehaviorSubject<UserSession>;
}