import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import App from './App';
import './index.css';
console.log('main.tsx loading');
createRoot(document.getElementById("root")).render(_jsx(ThemeProvider, { attribute: "class", defaultTheme: "dark", enableSystem: true, children: _jsx(App, {}) }));
