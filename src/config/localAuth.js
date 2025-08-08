// Local Authentication Configuration
// This provides a simple username/password login for local testing without Azure Entra ID
// Local test users with different roles
export const localTestUsers = [
    {
        id: 'admin-001',
        username: 'admin',
        password: 'admin123',
        displayName: 'System Administrator',
        email: 'admin@cato.local',
        roles: ['SystemAdmin']
    },
    {
        id: 'security-001',
        username: 'security',
        password: 'security123',
        displayName: 'Security Analyst',
        email: 'security@cato.local',
        roles: ['SecurityAnalyst']
    },
    {
        id: 'compliance-001',
        username: 'compliance',
        password: 'compliance123',
        displayName: 'Compliance Officer',
        email: 'compliance@cato.local',
        roles: ['ComplianceOfficer']
    },
    {
        id: 'ao-001',
        username: 'ao',
        password: 'ao123',
        displayName: 'Authorizing Official',
        email: 'ao@cato.local',
        roles: ['AO']
    },
    {
        id: 'auditor-001',
        username: 'auditor',
        password: 'auditor123',
        displayName: 'Security Auditor',
        email: 'auditor@cato.local',
        roles: ['Auditor']
    },
    {
        id: 'viewer-001',
        username: 'viewer',
        password: 'viewer123',
        displayName: 'Viewer User',
        email: 'viewer@cato.local',
        roles: ['Viewer']
    }
];
export const authenticateLocalUser = (username, password) => {
    const user = localTestUsers.find(u => u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password);
    return user || null;
};
export const getLocalUserById = (id) => {
    return localTestUsers.find(u => u.id === id) || null;
};
// Check if we're in local auth mode
export const isLocalAuthMode = () => {
    return import.meta.env.DEV &&
        import.meta.env.VITE_USE_LOCAL_AUTH === 'true';
};
