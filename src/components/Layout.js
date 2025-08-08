import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
export function Layout({ children }) {
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsxs("div", { className: "flex", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 p-6", children: children })] })] }) }));
}
