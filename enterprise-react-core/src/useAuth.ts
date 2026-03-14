import { useState, useEffect } from 'react';
import { userSession$, type UserSession } from '@comp/auth-utility';

export function useAuth() {
    const [session, setSession] = useState<UserSession | null>(null);

    useEffect(() => {
        const subscription = userSession$.subscribe(setSession);
        return () => subscription.unsubscribe();
    }, []);

    return session;
}