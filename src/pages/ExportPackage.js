import { jsx as _jsx } from "react/jsx-runtime";
import ATOPackageExport from "@/components/ATOPackageExport";
export default function ExportPackage() {
    return (_jsx("div", { className: "container mx-auto p-6", children: _jsx(ATOPackageExport, { tenantId: "demo-tenant-001", systemName: "cATO Command Center Demo System" }) }));
}
