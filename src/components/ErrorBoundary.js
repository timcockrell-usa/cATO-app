import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { style: {
                    minHeight: '100vh',
                    backgroundColor: '#0a0a0a',
                    color: 'white',
                    padding: '32px',
                    fontFamily: 'system-ui, sans-serif'
                }, children: [_jsx("h1", { children: "Authentication Error" }), _jsx("p", { children: "There was an error initializing the authentication system." }), _jsxs("p", { children: ["Error: ", this.state.error?.message] }), _jsx("button", { onClick: () => window.location.reload(), style: {
                            marginTop: '16px',
                            padding: '8px 16px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }, children: "Reload Page" })] }));
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
