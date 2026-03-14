declare module '@comp/react-core' {
    import * as React from 'react';

    export function useAuth(): any;

    export interface ProtectedRouteProps {
        children: React.ReactNode;
        requiredRole?: string;
    }
    export const ProtectedRoute: React.FC<ProtectedRouteProps>;
}