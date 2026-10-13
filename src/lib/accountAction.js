import { useAuth } from '@/lib/AuthContext';

/**
 * Guests can browse every section of the app. Actions that save personal data
 * (documents, journey steps, plan, contacts, Luz) need an account, so they are
 * wrapped with `whenSignedIn`: guests are sent to sign in and come back to the
 * page they were on, signed-in users run the action.
 */
export function useAccountAction() {
  const { isAuthenticated, navigateToLogin } = useAuth();

  const whenSignedIn = (action) => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    action();
  };

  return { isAuthenticated, navigateToLogin, whenSignedIn };
}