// This file is a compatibility layer for older code that imports GoogleAuth
// It re-exports our new unified Auth service but maintains the old interface

import { Auth } from './auth';

// Re-export the Auth service with the old interface for backward compatibility
export const GoogleAuth = {
  signInWithGoogle: Auth.signInWithGoogle.bind(Auth)
};

// Export the new Auth service directly as well
export { Auth };
