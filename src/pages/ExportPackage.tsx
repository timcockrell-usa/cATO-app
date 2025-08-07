import ATOPackageExport from "@/components/ATOPackageExport";

export default function ExportPackage() {
  return (
    <div className="container mx-auto p-6">
      <ATOPackageExport 
        tenantId="demo-tenant-001" 
        systemName="cATO Command Center Demo System"
      />
    </div>
  );
}
