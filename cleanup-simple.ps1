# cATO Dashboard - PowerShell Cleanup Script
# This script removes all cATO Dashboard resources from your existing resource group
# WITHOUT affecting any existing infrastructure (VNet, etc.)

param(
    [string]$ResourceGroup = "ampe-eastus-dev-rg",
    [string]$SubscriptionId = "930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"
)

Write-Host "cATO Dashboard Cleanup Script" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will remove ALL cATO Dashboard resources from:" -ForegroundColor Yellow
Write-Host "   Resource Group: $ResourceGroup"
Write-Host "   Subscription: $SubscriptionId"
Write-Host ""
Write-Host "This script will NOT remove:" -ForegroundColor Green
Write-Host "   - Your existing VNet (ampe-eus-dev-vnet)"
Write-Host "   - Your existing resource group"
Write-Host "   - Any other existing infrastructure"
Write-Host ""

# Check if Azure PowerShell is available
try {
    $azContext = Get-AzContext -ErrorAction Stop
    if (-not $azContext) {
        throw "No Azure context found"
    }
    Write-Host "Azure PowerShell context found" -ForegroundColor Green
}
catch {
    Write-Host "Azure PowerShell not connected. Please run Connect-AzAccount first." -ForegroundColor Red
    exit 1
}

# Confirmation prompt
$confirm = Read-Host "Are you sure you want to proceed? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Cleanup cancelled." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting up Azure context..." -ForegroundColor Cyan

# Set subscription context
try {
    Set-AzContext -SubscriptionId $SubscriptionId -ErrorAction Stop | Out-Null
    Write-Host "Set subscription to: $SubscriptionId" -ForegroundColor Green
}
catch {
    Write-Host "Failed to set subscription context: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify resource group exists
try {
    Get-AzResourceGroup -Name $ResourceGroup -ErrorAction Stop | Out-Null
    Write-Host "Verified resource group: $ResourceGroup" -ForegroundColor Green
}
catch {
    Write-Host "Resource group '$ResourceGroup' not found." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Discovering cATO Dashboard resources..." -ForegroundColor Cyan

# Get all resources in the resource group
try {
    $allResources = Get-AzResource -ResourceGroupName $ResourceGroup -ErrorAction Stop
    Write-Host "Retrieved $($allResources.Count) total resources from resource group" -ForegroundColor Green
}
catch {
    Write-Host "Failed to retrieve resources: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Filter for cATO resources by naming patterns
$catoResources = @{
    StaticWebApps = $allResources | Where-Object { $_.Name -match "^stapp-[a-z0-9]{13}$" }
    CosmosAccounts = $allResources | Where-Object { $_.Name -match "^cosmos-[a-z0-9]{13}$" }
    KeyVaults = $allResources | Where-Object { $_.Name -match "^kv-[a-z0-9]{13}$" }
    ManagedIdentities = $allResources | Where-Object { $_.Name -match "^id-[a-z0-9]{13}$" }
    LogAnalytics = $allResources | Where-Object { $_.Name -match "^log-[a-z0-9]{13}$" }
    AppInsights = $allResources | Where-Object { $_.Name -match "^appi-[a-z0-9]{13}$" }
    SmartDetectors = $allResources | Where-Object { 
        $_.ResourceType -eq "microsoft.alertsmanagement/smartDetectorAlertRules" -and 
        $_.Name -like "*appi-*" 
    }
}

Write-Host "Discovered cATO resources:" -ForegroundColor Green
Write-Host "   Static Web Apps: $($catoResources.StaticWebApps.Count)"
Write-Host "   Cosmos DB accounts: $($catoResources.CosmosAccounts.Count)"
Write-Host "   Key Vaults: $($catoResources.KeyVaults.Count)"
Write-Host "   Managed Identities: $($catoResources.ManagedIdentities.Count)"
Write-Host "   Log Analytics: $($catoResources.LogAnalytics.Count)"
Write-Host "   App Insights: $($catoResources.AppInsights.Count)"
Write-Host "   Smart Detectors: $($catoResources.SmartDetectors.Count)"
Write-Host ""

# List all resources to be deleted
Write-Host "Found cATO resources to delete:" -ForegroundColor Cyan
foreach ($resource in $catoResources.StaticWebApps) { Write-Host "   Static Web App: $($resource.Name)" }
foreach ($resource in $catoResources.CosmosAccounts) { Write-Host "   Cosmos DB: $($resource.Name)" }
foreach ($resource in $catoResources.KeyVaults) { Write-Host "   Key Vault: $($resource.Name)" }
foreach ($resource in $catoResources.ManagedIdentities) { Write-Host "   Managed Identity: $($resource.Name)" }
foreach ($resource in $catoResources.LogAnalytics) { Write-Host "   Log Analytics: $($resource.Name)" }
foreach ($resource in $catoResources.AppInsights) { Write-Host "   App Insights: $($resource.Name)" }
foreach ($resource in $catoResources.SmartDetectors) { Write-Host "   Smart Detector: $($resource.Name)" }
Write-Host ""

# Check if any resources found
$totalResources = 0
foreach ($resourceType in $catoResources.Values) {
    $totalResources += $resourceType.Count
}
if ($totalResources -eq 0) {
    Write-Host "No cATO Dashboard resources found to delete." -ForegroundColor Yellow
    Write-Host "Resource group appears to be clean already." -ForegroundColor Green
    exit 0
}

# Final confirmation
$finalConfirm = Read-Host "Proceed with deleting these $totalResources resources? (yes/no)"
if ($finalConfirm -ne "yes") {
    Write-Host "Cleanup cancelled." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting cleanup process..." -ForegroundColor Cyan
Write-Host ""

# Function to safely delete resources
function Remove-CatoResource {
    param($Resource, $DisplayName)
    
    Write-Host "Deleting $DisplayName : $($Resource.Name)..." -ForegroundColor Blue
    
    try {
        Remove-AzResource -ResourceId $Resource.ResourceId -Force -Confirm:$false -ErrorAction Stop
        Write-Host "   Successfully deleted: $($Resource.Name)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   Failed to delete: $($Resource.Name)" -ForegroundColor Red
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    finally {
        Write-Host ""
    }
}

# Track deletion results
$deletionResults = @{
    Success = 0
    Failed = 0
}

# Delete resources in optimal order

# 1. Static Web Apps (fastest)
foreach ($resource in $catoResources.StaticWebApps) {
    if (Remove-CatoResource -Resource $resource -DisplayName "Static Web App") {
        $deletionResults.Success++
    } else {
        $deletionResults.Failed++
    }
}

# 2. Application Insights
foreach ($resource in $catoResources.AppInsights) {
    if (Remove-CatoResource -Resource $resource -DisplayName "Application Insights") {
        $deletionResults.Success++
    } else {
        $deletionResults.Failed++
    }
}

# 3. Smart Detector Alert Rules
foreach ($resource in $catoResources.SmartDetectors) {
    if (Remove-CatoResource -Resource $resource -DisplayName "Smart Detector Alert Rule") {
        $deletionResults.Success++
    } else {
        $deletionResults.Failed++
    }
}

# 4. Key Vaults (with special handling for purge)
foreach ($kv in $catoResources.KeyVaults) {
    Write-Host "Deleting Key Vault: $($kv.Name)..." -ForegroundColor Blue
    
    try {
        Remove-AzKeyVault -VaultName $kv.Name -ResourceGroupName $ResourceGroup -Force -Confirm:$false -ErrorAction Stop
        Write-Host "   Key Vault deleted: $($kv.Name)" -ForegroundColor Green
        $deletionResults.Success++
        
        # Purge the Key Vault for complete cleanup
        Write-Host "   Purging Key Vault for complete cleanup..." -ForegroundColor Yellow
        try {
            Remove-AzKeyVault -VaultName $kv.Name -InRemovedState -Force -Confirm:$false -ErrorAction Stop
            Write-Host "   Key Vault purged: $($kv.Name)" -ForegroundColor Green
        }
        catch {
            Write-Host "   Could not purge Key Vault: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "   Failed to delete Key Vault: $($kv.Name)" -ForegroundColor Red
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
        $deletionResults.Failed++
    }
    Write-Host ""
}

# 5. Log Analytics Workspaces
foreach ($resource in $catoResources.LogAnalytics) {
    if (Remove-CatoResource -Resource $resource -DisplayName "Log Analytics Workspace") {
        $deletionResults.Success++
    } else {
        $deletionResults.Failed++
    }
}

# 6. Managed Identities
foreach ($resource in $catoResources.ManagedIdentities) {
    if (Remove-CatoResource -Resource $resource -DisplayName "User-Assigned Managed Identity") {
        $deletionResults.Success++
    } else {
        $deletionResults.Failed++
    }
}

# 7. Cosmos DB accounts (slowest, do last)
foreach ($cosmos in $catoResources.CosmosAccounts) {
    Write-Host "Deleting Cosmos DB: $($cosmos.Name)..." -ForegroundColor Blue
    Write-Host "   This may take several minutes..." -ForegroundColor Yellow
    
    try {
        Remove-AzCosmosDBAccount -ResourceGroupName $ResourceGroup -Name $cosmos.Name -Confirm:$false -ErrorAction Stop
        Write-Host "   Cosmos DB deletion initiated: $($cosmos.Name)" -ForegroundColor Green
        Write-Host "   Cosmos DB deletion continues in the background" -ForegroundColor Yellow
        $deletionResults.Success++
    }
    catch {
        Write-Host "   Failed to delete Cosmos DB: $($cosmos.Name)" -ForegroundColor Red
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
        $deletionResults.Failed++
    }
    Write-Host ""
}

Write-Host ""
Write-Host "Cleanup process completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Deletion Summary:" -ForegroundColor Cyan
Write-Host "   Successfully deleted: $($deletionResults.Success) resources" -ForegroundColor Green
if ($deletionResults.Failed -gt 0) {
    Write-Host "   Failed to delete: $($deletionResults.Failed) resources" -ForegroundColor Red
}
Write-Host ""
Write-Host "Infrastructure Status:" -ForegroundColor Cyan
Write-Host "Your existing VNet and other infrastructure remain intact" -ForegroundColor Green
if ($deletionResults.Success -gt 0) {
    Write-Host "Cosmos DB deletion may take additional time to complete in the background" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "To verify cleanup, run:" -ForegroundColor Cyan
Write-Host "   Get-AzResource -ResourceGroupName $ResourceGroup"
Write-Host ""

if ($deletionResults.Failed -eq 0) {
    Write-Host "Resource group is ready for fresh deployment!" -ForegroundColor Green
} else {
    Write-Host "Some resources failed to delete. Check the errors above and retry if needed." -ForegroundColor Yellow
    exit 1
}
