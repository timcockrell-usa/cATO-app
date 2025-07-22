import { Configuration } from '@azure/msal-browser';

// MSAL configuration for Azure Entra ID authentication
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message);
            return;
          case 1: // LogLevel.Warning
            console.warn(message);
            return;
          case 2: // LogLevel.Info
            console.info(message);
            return;
          case 3: // LogLevel.Verbose
            console.debug(message);
            return;
        }
      },
    },
  },
};

// Scopes for API access
export const loginRequest = {
  scopes: [
    'User.Read',
    'User.ReadBasic.All',
    'Directory.Read.All',
    'Group.Read.All',
    'RoleManagement.Read.Directory'
  ],
};

// Graph API endpoint
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphUsersEndpoint: 'https://graph.microsoft.com/v1.0/users',
};

// Protected resources for different environments
export const protectedResources = {
  il2Api: {
    endpoint: import.meta.env.VITE_IL2_API_ENDPOINT || 'https://your-il2-app.azurewebsites.net/api',
    scopes: [import.meta.env.VITE_IL2_API_SCOPE || 'api://your-il2-client-id/access_as_user'],
  },
  il5Api: {
    endpoint: import.meta.env.VITE_IL5_API_ENDPOINT || 'https://your-il5-app.azurewebsites.us/api',
    scopes: [import.meta.env.VITE_IL5_API_SCOPE || 'api://your-il5-client-id/access_as_user'],
  },
};

// Role-based access control
export const roles = {
  SYSTEM_ADMIN: 'SystemAdmin',
  SECURITY_ANALYST: 'SecurityAnalyst',
  COMPLIANCE_OFFICER: 'ComplianceOfficer',
  AUDITOR: 'Auditor',
  VIEWER: 'Viewer',
  AO: 'AuthorizingOfficial',
} as const;

export type UserRole = typeof roles[keyof typeof roles];
