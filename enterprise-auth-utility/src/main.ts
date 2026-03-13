import { BehaviorSubject } from 'rxjs';

// 1. Define our Enterprise User Type
interface UserSession {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
}

// 2. Create the RxJS Event Bus (Our Global State)
// A BehaviorSubject always holds the "current" value and emits it immediately to new subscribers.
// The $ at the end of the userSession$ is a convention to indicate that it is an Observable and not some static content.
// You cannot just read it; you have to .subscribe() to it.
export const userSession$ = new BehaviorSubject<UserSession>({
  isAuthenticated: false,
  username: null,
  roles: [],
});

// 3. Single-SPA Lifecycles (Headless Execution)
export function bootstrap() {
  return Promise.resolve();
}

export function mount() {
  console.log('🔒 Auth Utility MFE Mounted: Initializing Session...');

  // Simulate fetching RBAC permissions from a Spring Boot backend on load
  setTimeout(() => {
    userSession$.next({
      isAuthenticated: true,
      username: 'enterprise_admin',
      roles: ['admin', 'editor'],
    });
    console.log('🔒 Auth Utility MFE: Session broadcasted to enterprise bus.');
  }, 1500);

  return Promise.resolve();
}

export function unmount() {
  // Clear the session on teardown
  userSession$.next({ isAuthenticated: false, username: null, roles: [] });
  return Promise.resolve();
}