import React, { useEffect } from 'react';
import { navigateToUrl } from 'single-spa';
import { useAuth } from './useAuth';

export interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }: ProtectedRouteProps) => {
    const session = useAuth();

    useEffect(() => {
        if (session) {
            if (!session.isAuthenticated) {
                console.warn('🔒 Unauthorized access. Rerouting to public portal...');
                navigateToUrl('/');
            } else if (requiredRole && !session.roles.includes(requiredRole)) {
                console.warn(`🔒 Access Denied. Missing clearance: ${requiredRole}`);
                navigateToUrl('/');
            }
        }
    }, [session, requiredRole]);

    if (!session || !session.isAuthenticated) {
        return <div style={{ padding: '2rem', color: '#666' }}>Verifying security clearance...</div>;
    }

    return <>{children}</>;
};