# Azure Entra ID Setup Guide

This guide provides step-by-step instructions for setting up Azure Entra ID authentication for the cATO Dashboard.

## Prerequisites

- Azure subscription with administrative access
- Azure Entra ID (formerly Azure AD) tenant
- Global Administrator or Application Administrator role
- Deployed cATO application or local development environment

## Step 1: Create App Registration

1. **Access Azure Portal**:
   - Navigate to [Azure Portal](https://portal.azure.com)
   - Go to **Azure Active Directory** → **App registrations**

2. **Create New Registration**:
   - Click **+ New registration**
   - Fill in the details:
     ```
     Name: cATO Dashboard
     Supported account types: Accounts in this organizational directory only
     Redirect URI: 
       - Type: Single-page application (SPA)
       - URI: https://your-app-domain.azurestaticapps.net/.auth/login/aad/callback
     ```
   - Click **Register**

3. **Note Important Values**:
   - **Application (client) ID**: Copy this value
   - **Directory (tenant) ID**: Copy this value

## Step 2: Configure Authentication

1. **Authentication Settings**:
   - Go to **Authentication** in your app registration
   - Under **Implicit grant and hybrid flows**, enable:
     - ✅ Access tokens
     - ✅ ID tokens

2. **Add Redirect URIs**:
   ```
   # For production
   https://your-app-domain.azurestaticapps.net/.auth/login/aad/callback
   
   # For local development
   http://localhost:5173/.auth/login/aad/callback
   ```

## Step 3: Configure API Permissions

1. **Add Permissions**:
   - Go to **API permissions**
   - Click **+ Add a permission**
   - Select **Microsoft Graph**
   - Add these delegated permissions:
     - `User.Read`
     - `User.ReadBasic.All`
     - `Directory.Read.All` (admin consent required)

2. **Grant Admin Consent**:
   - Click **Grant admin consent for [Your Organization]**
   - Confirm the consent

## Step 4: Configure Application Settings

### For Azure Static Web Apps

1. **Navigate to Configuration**:
   - Go to your Static Web App in Azure Portal
   - Click **Authentication** → **Add identity provider**

2. **Add Azure Active Directory**:
   ```
   Identity provider: Azure Active Directory
   App registration type: Provide app registration details
   Client ID: [Your Application ID from Step 1]
   Client secret: [Leave empty for SPA]
   Issuer URL: https://login.microsoftonline.com/[Your Tenant ID]/v2.0
   Allowed token audiences: [Your Application ID]
   ```

### For Local Development

Update your `.env.local` file:

```env
# Azure Entra ID Configuration
AZURE_CLIENT_ID=your-application-client-id
AZURE_TENANT_ID=your-tenant-id
AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id

# Optional: For specific authentication flows
AZURE_REDIRECT_URI=http://localhost:5173/.auth/login/aad/callback
```

## Step 5: Configure User Roles (Optional)

1. **Create App Roles**:
   - In your app registration, go to **App roles**
   - Create roles for your application:
     ```json
     {
       "displayName": "System Administrator",
       "id": "unique-guid-1",
       "isEnabled": true,
       "description": "Full system access",
       "value": "SystemAdmin",
       "allowedMemberTypes": ["User"]
     }
     ```

2. **Assign Users to Roles**:
   - Go to **Enterprise applications**
   - Find your app and click on it
   - Go to **Users and groups**
   - Assign users to appropriate roles

## Step 6: Test Authentication

1. **Local Testing**:
   ```bash
   # Start your local development server
   npm run dev
   
   # Navigate to http://localhost:5173
   # Try logging in with your Azure credentials
   ```

2. **Production Testing**:
   - Navigate to your deployed application
   - Click the login button
   - Authenticate with your Azure credentials
   - Verify you can access the dashboard

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**:
   - Ensure redirect URIs in app registration match your application URLs
   - Check for trailing slashes and HTTPS requirements

2. **Permissions Issues**:
   - Verify admin consent has been granted
   - Check user assignments in Enterprise applications

3. **Token Issues**:
   - Ensure implicit grant is enabled for tokens
   - Verify audience configuration

4. **Local Development Issues**:
   - Check that environment variables are correctly set
   - Ensure you're using the correct tenant and client IDs

### Additional Configuration

For advanced scenarios:
- **Multi-tenant support**: Change to "Accounts in any organizational directory"
- **Custom domains**: Update redirect URIs for custom domains
- **API access**: Configure additional API permissions as needed

## Security Best Practices

1. **Use least privilege**: Only assign necessary permissions
2. **Regular reviews**: Periodically review user assignments and permissions
3. **Monitor access**: Use Azure AD logs to monitor authentication events
4. **Secure secrets**: Never expose client secrets in frontend code

```yaml
Application Registration:
  Name: "cATO Command Center"
  Supported account types: "Accounts in this organizational directory only"
  Redirect URI: 
    Platform: "Single-page application (SPA)"
    URL: "https://your-app-name.azurestaticapps.net/.auth/login/aad/callback"
```

4. Click **Register**

### Step 2: Configure Application Settings

After registration, note the following values:
- **Application (client) ID**
- **Directory (tenant) ID**
- **Object ID**

### Step 3: Configure Authentication

1. Go to **Authentication** in your app registration
2. Under **Single-page application**, add redirect URIs:

```
Production: https://your-app-name.azurestaticapps.net/.auth/login/aad/callback
Development: http://localhost:3002/.auth/login/aad/callback
```

3. Configure **Logout URLs**:
```
Production: https://your-app-name.azurestaticapps.net/.auth/logout
Development: http://localhost:3002/.auth/logout
```

4. Enable **ID tokens** under **Implicit grant and hybrid flows**

### Step 4: Configure API Permissions

1. Go to **API permissions**
2. Add the following Microsoft Graph permissions:

```yaml
Required Permissions:
  - User.Read (Delegated)
  - Group.Read.All (Delegated)
  - Directory.Read.All (Application) # For role-based access
  - AuditLog.Read.All (Application) # For compliance logging
```

3. Click **Grant admin consent** for your organization

---

## Configure Authentication Settings

### Step 1: Set Up Scopes

1. Go to **Expose an API**
2. Set the **Application ID URI**: `api://cato-command-center`
3. Add scopes for your application:

```yaml
Scopes:
  - cato.read: "Read cATO data"
  - cato.write: "Write cATO data"
  - cato.admin: "Administrative access"
```

### Step 2: Configure App Roles

1. Go to **App roles**
2. Create the following roles:

```yaml
App Roles:
  SystemAdmin:
    Display name: "System Administrator"
    Description: "Full system administration access"
    Value: "SystemAdmin"
    
  AO:
    Display name: "Authorizing Official"
    Description: "Authorizing Official access"
    Value: "AO"
    
  ComplianceOfficer:
    Display name: "Compliance Officer"
    Description: "Compliance management access"
    Value: "ComplianceOfficer"
    
  SecurityAnalyst:
    Display name: "Security Analyst"
    Description: "Security analysis and monitoring"
    Value: "SecurityAnalyst"
    
  Auditor:
    Display name: "Auditor"
    Description: "Read-only audit access"
    Value: "Auditor"
    
  Viewer:
    Display name: "Viewer"
    Description: "Read-only access"
    Value: "Viewer"
```

---

## Environment Configuration

### Step 1: Create Configuration Files

Create a `.env` file in your project root:

```bash
# Azure Authentication Configuration
AZURE_CLIENT_ID=your-application-client-id
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_SECRET=your-client-secret # Only for backend services

# Application Configuration
REACT_APP_AZURE_CLIENT_ID=${AZURE_CLIENT_ID}
REACT_APP_AZURE_TENANT_ID=${AZURE_TENANT_ID}
REACT_APP_AUTH_DOMAIN=login.microsoftonline.com

# API Configuration
REACT_APP_API_BASE_URL=https://your-app-name.azurestaticapps.net/api
REACT_APP_COSMOS_ENDPOINT=your-cosmos-endpoint
```

### Step 2: Update Azure Configuration

Update your `azure.yaml` file:

```yaml
# azure.yaml
name: cato-command-center
location: eastus2
services:
  frontend:
    project: .
    language: javascript
    host: staticwebapp
    config:
      auth:
        identityProviders:
          azureActiveDirectory:
            registration:
              clientId: ${AZURE_CLIENT_ID}
              clientSecretSettingName: AZURE_CLIENT_SECRET
            userDetailsClaim: preferred_username
        rolesSource: /api/GetUserRoles
```

---

## Azure Static Web Apps Integration

### Step 1: Configure Static Web Apps Authentication

1. In Azure Portal, go to your **Static Web App**
2. Navigate to **Authentication**
3. Configure Azure Active Directory provider:

```json
{
  "platform": {
    "enabled": true
  },
  "globalValidation": {
    "requireAuthentication": true,
    "unauthenticatedClientAction": "RedirectToLoginPage"
  },
  "identityProviders": {
    "azureActiveDirectory": {
      "enabled": true,
      "registration": {
        "openIdIssuer": "https://login.microsoftonline.com/{tenant-id}/v2.0",
        "clientId": "{client-id}"
      },
      "userDetailsClaim": "preferred_username"
    }
  }
}
```

### Step 2: Create Authentication API Function

Create `api/GetUserRoles/index.js`:

```javascript
module.exports = async function (context, req) {
    const user = req.headers['x-ms-client-principal'];
    
    if (!user) {
        context.res = {
            status: 401,
            body: "Unauthorized"
        };
        return;
    }

    const userData = JSON.parse(Buffer.from(user, 'base64').toString());
    
    // Map Azure AD groups/roles to application roles
    const userRoles = mapUserRoles(userData.roles || []);
    
    context.res = {
        status: 200,
        body: {
            roles: userRoles,
            userId: userData.userId,
            userDetails: userData.userDetails
        }
    };
};

function mapUserRoles(azureRoles) {
    const roleMapping = {
        'SystemAdmin': ['SystemAdmin'],
        'AO': ['AO'],
        'ComplianceOfficer': ['ComplianceOfficer'],
        'SecurityAnalyst': ['SecurityAnalyst'],
        'Auditor': ['Auditor'],
        'Viewer': ['Viewer']
    };
    
    let mappedRoles = [];
    azureRoles.forEach(role => {
        if (roleMapping[role]) {
            mappedRoles.push(...roleMapping[role]);
        }
    });
    
    return mappedRoles.length > 0 ? mappedRoles : ['Viewer'];
}
```

### Step 3: Update Application Authentication Context

Update `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  roles: string[];
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get user information from Static Web Apps
    fetch('/.auth/me')
      .then(response => response.json())
      .then(data => {
        if (data.clientPrincipal) {
          setUser(data.clientPrincipal);
          setIsAuthenticated(true);
          
          // Get user roles
          fetch('/api/GetUserRoles')
            .then(response => response.json())
            .then(roleData => {
              setRoles(roleData.roles || []);
            });
        }
      })
      .catch(error => {
        console.error('Authentication check failed:', error);
      });
  }, []);

  const login = () => {
    window.location.href = '/.auth/login/aad';
  };

  const logout = () => {
    window.location.href = '/.auth/logout';
  };

  const hasRole = (role: string) => {
    return roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      roles,
      isAuthenticated,
      login,
      logout,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

---

## Testing Authentication

### Step 1: Local Development Testing

1. Run the application locally:
```bash
npm run dev
```

2. Navigate to `http://localhost:3002`
3. You should be redirected to Azure AD login
4. After successful login, verify user roles are displayed

### Step 2: Production Testing

1. Deploy to Azure Static Web Apps:
```bash
azd up
```

2. Navigate to your production URL
3. Test login/logout functionality
4. Verify role-based access control

### Step 3: Role Assignment Testing

1. In Azure AD, go to **Enterprise applications**
2. Find your application
3. Go to **Users and groups**
4. Assign test users to different roles
5. Verify each role has appropriate access levels

---

## Troubleshooting

### Common Issues

#### Issue 1: Redirect URI Mismatch
**Symptoms**: Authentication fails with redirect URI error
**Solution**: 
- Verify redirect URIs in app registration match deployment URLs
- Check for trailing slashes and protocol (http vs https)

#### Issue 2: Missing Roles
**Symptoms**: User authenticates but has no roles
**Solution**:
- Check app role assignments in Azure AD
- Verify role mapping in GetUserRoles function
- Ensure user is assigned to application

#### Issue 3: CORS Errors
**Symptoms**: API calls fail with CORS errors
**Solution**:
- Configure CORS settings in Static Web Apps
- Verify API endpoints are correctly configured

### Debug Commands

```bash
# Check Azure CLI login
az account show

# Test API endpoints
curl -X GET "https://your-app.azurestaticapps.net/.auth/me"

# Check application logs
az monitor activity-log list --resource-group your-resource-group
```

---

## Security Best Practices

### 1. Token Management
- Use secure token storage
- Implement token refresh logic
- Set appropriate token expiration times

### 2. Role-Based Access Control
- Implement principle of least privilege
- Regular review of user role assignments
- Log all role changes and access attempts

### 3. Network Security
- Enable HTTPS only
- Configure Content Security Policy (CSP)
- Implement rate limiting on API endpoints

### 4. Monitoring and Auditing
- Enable Azure AD sign-in logs
- Monitor authentication failures
- Set up alerts for suspicious activities

### 5. Multi-Factor Authentication
- Require MFA for all users
- Configure conditional access policies
- Implement risk-based authentication

---

## Production Deployment Checklist

- [ ] App registration configured correctly
- [ ] All redirect URIs added for production domain
- [ ] API permissions granted and consented
- [ ] App roles defined and assigned
- [ ] Environment variables configured
- [ ] Static Web Apps authentication enabled
- [ ] User roles API function deployed
- [ ] Authentication testing completed
- [ ] Security review conducted
- [ ] Monitoring and alerting configured

---

## Support and Resources

### Microsoft Documentation
- [Azure Static Web Apps Authentication](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)

### cATO Command Center Resources
- [Project Documentation](./README.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Security Configuration](./docs/fedramp/)

### Contact Information
For technical support or questions about authentication setup, contact your system administrator or refer to the project's GitHub repository for additional documentation and community support.

---

*This guide was created for the cATO Command Center application and follows DoD and FedRAMP security requirements for authentication and authorization.*
