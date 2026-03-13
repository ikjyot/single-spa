declare module '@comp/auth-utility' {
    import { BehaviorSubject } from 'rxjs';

    interface UserSession {
        isAuthenticated: boolean;
        username: string | null;
        roles: string[];
    }

    export const userSession$: BehaviorSubject<UserSession>;
}