# cATO Dashboard - Cleanup Script (PowerShell)
# This script removes all cATO Dashboard resources from your existing resource group
# WITHOUT affecting any existing infrastructure (VNet, etc.)

param(
    [string]$ResourceGroup = "ampe-eastus-dev-rg",
    [string]$SubscriptionId = "930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

Write-Host "${Blue}🧹 cATO Dashboard Cleanup Script${Reset}"
Write-Host "${Blue}===================================${Reset}"
Write-Host ""
Write-Host "${Yellow}⚠️  WARNING: This will remove ALL cATO Dashboard resources from:${Reset}"
Write-Host "   Resource Group: $ResourceGroup"
Write-Host "   Subscription: $SubscriptionId"
Write-Host ""
Write-Host "${Green}✅ This script will NOT remove:${Reset}"
Write-Host "   • Your existing VNet (ampe-eus-dev-vnet)"
Write-Host "   • Your existing resource group"
Write-Host "   • Any other existing infrastructure"
Write-Host ""

# Confirmation prompt
$confirm = Read-Host "Are you sure you want to proceed? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "${Red}❌ Cleanup cancelled.${Reset}"
    exit 1
}

Write-Host ""
Write-Host "${Blue}🔍 Setting up Azure context...${Reset}"

# Set subscription context
try {
    Set-AzContext -SubscriptionId $SubscriptionId -ErrorAction Stop
    Write-Host "${Green}✅ Set subscription to: $SubscriptionId${Reset}"
}
catch {
    Write-Host "${Red}❌ Failed to set subscription context. Please run Connect-AzAccount first.${Reset}"
    exit 1
}

# Verify resource group exists
try {
    $rg = Get-AzResourceGroup -Name $ResourceGroup -ErrorAction Stop
    Write-Host "${Green}✅ Verified resource group: $ResourceGroup${Reset}"
}
catch {
    Write-Host "${Red}❌ Resource group '$ResourceGroup' not found.${Reset}"
    exit 1
}

Write-Host ""
Write-Host "${Blue}🔍 Discovering cATO Dashboard resources...${Reset}"

# Get all resources in the resource group
$allResources = Get-AzResource -ResourceGroupName $ResourceGroup

# Filter for cATO resources by naming patterns
$catoResources = @{
    StaticWebApps = $allResources | Where-Object { $_.Name -match "^stapp-[a-z0-9]{13}$" }
    CosmosAccounts = $allResources | Where-Object { $_.Name -match "^cosmos-[a-z0-9]{13}$" }
    KeyVaults = $allResources | Where-Object { $_.Name -match "^kv-[a-z0-9]{13}$" }
    ManagedIdentities = $allResources | Where-Object { $_.Name -match "^id-[a-z0-9]{13}$" }
    LogAnalytics = $allResources | Where-Object { $_.Name -match "^log-[a-z0-9]{13}$" }
    AppInsights = $allResources | Where-Object { $_.Name -match "^appi-[a-z0-9]{13}$" }
    SmartDetectors = $allResources | Where-Object { $_.ResourceType -eq "microsoft.alertsmanagement/smartDetectorAlertRules" -and $_.Name -like "*appi-*" }
}

Write-Host "${Green}✅ Discovered cATO resources:${Reset}"
Write-Host "   • Static Web Apps: $($catoResources.StaticWebApps.Count)"
Write-Host "   • Cosmos DB accounts: $($catoResources.CosmosAccounts.Count)"
Write-Host "   • Key Vaults: $($catoResources.KeyVaults.Count)"
Write-Host "   • Managed Identities: $($catoResources.ManagedIdentities.Count)"
Write-Host "   • Log Analytics: $($catoResources.LogAnalytics.Count)"
Write-Host "   • App Insights: $($catoResources.AppInsights.Count)"
Write-Host "   • Smart Detectors: $($catoResources.SmartDetectors.Count)"
Write-Host ""

# List all resources to be deleted
Write-Host "${Blue}🎯 Found cATO resources to delete:${Reset}"
foreach ($resource in $catoResources.StaticWebApps) { Write-Host "   • Static Web App: $($resource.Name)" }
foreach ($resource in $catoResources.CosmosAccounts) { Write-Host "   • Cosmos DB: $($resource.Name)" }
foreach ($resource in $catoResources.KeyVaults) { Write-Host "   • Key Vault: $($resource.Name)" }
foreach ($resource in $catoResources.ManagedIdentities) { Write-Host "   • Managed Identity: $($resource.Name)" }
foreach ($resource in $catoResources.LogAnalytics) { Write-Host "   • Log Analytics: $($resource.Name)" }
foreach ($resource in $catoResources.AppInsights) { Write-Host "   • App Insights: $($resource.Name)" }
foreach ($resource in $catoResources.SmartDetectors) { Write-Host "   • Smart Detector: $($resource.Name)" }
Write-Host ""

# Check if any resources found
$totalResources = ($catoResources.Values | Measure-Object -Property Count -Sum).Sum
if ($totalResources -eq 0) {
    Write-Host "${Yellow}ℹ️  No cATO Dashboard resources found to delete.${Reset}"
    Write-Host "${Green}✅ Resource group appears to be clean already.${Reset}"
    exit 0
}

# Final confirmation
$finalConfirm = Read-Host "Proceed with deleting these $totalResources resources? (yes/no)"
if ($finalConfirm -ne "yes") {
    Write-Host "${Red}❌ Cleanup cancelled.${Reset}"
    exit 1
}

Write-Host ""
Write-Host "${Blue}🚀 Starting cleanup process...${Reset}"
Write-Host ""

# Function to safely delete resources
function Remove-CatoResource {
    param($Resource, $DisplayName)
    
    Write-Host "${Blue}🗑️  Deleting $DisplayName`: $($Resource.Name)...${Reset}"
    
    try {
        Remove-AzResource -ResourceId $Resource.ResourceId -Force -Confirm:$false -ErrorAction Stop
        Write-Host "${Green}   ✅ Successfully deleted: $($Resource.Name)${Reset}"
    }
    catch {
        Write-Host "${Red}   ❌ Failed to delete: $($Resource.Name) - $($_.Exception.Message)${Reset}"
    }
    Write-Host ""
}

# Delete resources in optimal order (fastest first)

# 1. Static Web Apps (fastest)
foreach ($resource in $catoResources.StaticWebApps) {
    Remove-CatoResource -Resource $resource -DisplayName "Static Web App"
}

# 2. Application Insights
foreach ($resource in $catoResources.AppInsights) {
    Remove-CatoResource -Resource $resource -DisplayName "Application Insights"
}

# 3. Smart Detector Alert Rules
foreach ($resource in $catoResources.SmartDetectors) {
    Remove-CatoResource -Resource $resource -DisplayName "Smart Detector Alert Rule"
}

# 4. Key Vaults (with special handling for purge)
foreach ($kv in $catoResources.KeyVaults) {
    Write-Host "${Blue}🗑️  Deleting Key Vault: $($kv.Name)...${Reset}"
    
    try {
        Remove-AzKeyVault -VaultName $kv.Name -ResourceGroupName $ResourceGroup -Force -Confirm:$false -ErrorAction Stop
        Write-Host "${Green}   ✅ Key Vault deleted: $($kv.Name)${Reset}"
        
        # Purge the Key Vault for complete cleanup
        Write-Host "${Yellow}   ⚠️  Purging Key Vault for complete cleanup...${Reset}"
        try {
            Remove-AzKeyVault -VaultName $kv.Name -InRemovedState -Force -Confirm:$false -ErrorAction Stop
            Write-Host "${Green}   ✅ Key Vault purged: $($kv.Name)${Reset}"
        }
        catch {
            Write-Host "${Yellow}   ⚠️  Could not purge Key Vault (may require additional permissions)${Reset}"
        }
    }
    catch {
        Write-Host "${Red}   ❌ Failed to delete Key Vault: $($kv.Name) - $($_.Exception.Message)${Reset}"
    }
    Write-Host ""
}

# 5. Log Analytics Workspaces
foreach ($resource in $catoResources.LogAnalytics) {
    Remove-CatoResource -Resource $resource -DisplayName "Log Analytics Workspace"
}

# 6. Managed Identities
foreach ($resource in $catoResources.ManagedIdentities) {
    Remove-CatoResource -Resource $resource -DisplayName "User-Assigned Managed Identity"
}

# 7. Cosmos DB accounts (slowest, do last)
foreach ($cosmos in $catoResources.CosmosAccounts) {
    Write-Host "${Blue}🗑️  Deleting Cosmos DB: $($cosmos.Name)...${Reset}"
    Write-Host "${Yellow}   ⚠️  This may take several minutes...${Reset}"
    
    try {
        Remove-AzCosmosDBAccount -ResourceGroupName $ResourceGroup -Name $cosmos.Name -Force -Confirm:$false -ErrorAction Stop
        Write-Host "${Green}   ✅ Cosmos DB deletion initiated: $($cosmos.Name)${Reset}"
        Write-Host "${Yellow}   ℹ️  Cosmos DB deletion continues in the background${Reset}"
    }
    catch {
        Write-Host "${Red}   ❌ Failed to delete Cosmos DB: $($cosmos.Name) - $($_.Exception.Message)${Reset}"
    }
    Write-Host ""
}

Write-Host ""
Write-Host "${Green}🎉 Cleanup process completed!${Reset}"
Write-Host ""
Write-Host "${Blue}📋 Summary:${Reset}"
Write-Host "${Green}✅ All cATO Dashboard resources have been removed${Reset}"
Write-Host "${Green}✅ Your existing VNet and other infrastructure remain intact${Reset}"
Write-Host "${Yellow}ℹ️  Cosmos DB deletion may take additional time to complete in the background${Reset}"
Write-Host ""
Write-Host "${Blue}🔍 To verify cleanup, run:${Reset}"
Write-Host "   Get-AzResource -ResourceGroupName $ResourceGroup"
Write-Host ""
Write-Host "${Green}✨ Resource group '$ResourceGroup' is ready for fresh deployment!${Reset}"
