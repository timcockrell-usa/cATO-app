# 🧹 cATO Dashboard - Cleanup and Destruction Guide

## 📋 Overview

This guide provides instructions for safely removing all cATO Dashboard resources from your Azure environment while preserving your existing infrastructure. This is particularly useful for test deployments where you want to start fresh.

## 🎯 What Gets Removed

The cleanup process will remove **ONLY** the cATO Dashboard resources:

✅ **Resources that WILL be removed:**
- Azure Static Web App (`stapp-*`)
- Azure Cosmos DB account (`cosmos-*`)
- Azure Key Vault (`kv-*`)
- User-Assigned Managed Identity (`id-*`)
- Log Analytics Workspace (`log-*`)
- Application Insights (`appi-*`)

✅ **Resources that will NOT be affected:**
- Your existing VNet (`ampe-eus-dev-vnet`)
- Your existing resource group (`ampe-eastus-dev-rg`)
- Any other existing infrastructure
- Subnets, network security groups, etc.

## 🔧 VNet and Subnet Configuration

**Important Answer to Your VNet Question:**

The cATO Dashboard Bicep template **does NOT create or modify VNets or subnets**. Here's what it does:

- ✅ **Creates application resources** with public endpoints by default
- ✅ **Ready for private endpoint integration** with your existing VNet later
- ❌ **Does NOT create new subnets** in your /24 VNet
- ❌ **Does NOT modify your existing VNet** configuration

Your existing `ampe-eus-dev-vnet` (10.8.11.0/24) will remain completely untouched. When you're ready for production, you can add private endpoints to connect the resources to your existing VNet.

---

## 🚀 Cleanup Methods

### Method 1: Automated Cleanup Script (Recommended)

Use the provided cleanup script for safe, automated removal:

```bash
# In Azure Cloud Shell (Bash) or local terminal

# 1. Make the script executable
chmod +x cleanup-deployment.sh

# 2. Review the script configuration (update if needed)
# The script is pre-configured for your environment:
# - Resource Group: ampe-eastus-dev-rg
# - Subscription: 930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e
# - Environment: dev

# 3. Run the cleanup script
./cleanup-deployment.sh
```

The script will:
1. Confirm your intent before proceeding
2. Set the correct Azure subscription context
3. Identify all cATO Dashboard resources
4. Remove them safely one by one
5. Provide detailed progress updates
6. Preserve all existing infrastructure

### Method 2: Manual Azure CLI Commands

If you prefer manual control, use these commands:

```bash
# Set your subscription
az account set --subscription "930a247f-b4fa-4f1b-ad73-6a03cf1d0f4e"

# Get the resource token (you'll need this for resource names)
# Look at your deployed resources to get the actual token
RESOURCE_TOKEN="your-actual-token"  # e.g., "abc123def456g"

# Remove Static Web App
az staticwebapp delete --name "stapp-$RESOURCE_TOKEN" --resource-group "ampe-eastus-dev-rg" --yes

# Remove Application Insights
az monitor app-insights component delete --app "appi-$RESOURCE_TOKEN" --resource-group "ampe-eastus-dev-rg"

# Remove Key Vault (with purge for complete cleanup)
az keyvault delete --name "kv-$RESOURCE_TOKEN" --resource-group "ampe-eastus-dev-rg"
az keyvault purge --name "kv-$RESOURCE_TOKEN"  # Complete removal

# Remove Cosmos DB (takes longest)
az cosmosdb delete --name "cosmos-$RESOURCE_TOKEN" --resource-group "ampe-eastus-dev-rg" --yes

# Remove Log Analytics
az monitor log-analytics workspace delete --workspace-name "log-$RESOURCE_TOKEN" --resource-group "ampe-eastus-dev-rg" --yes

# Remove Managed Identity (do this last)
az identity delete --name "id-$RESOURCE_TOKEN" --resource-group "ampe-eastus-dev-rg"
```

### Method 3: Azure Portal (GUI Method)

1. **Go to Azure Portal** → Resource Groups → `ampe-eastus-dev-rg`
2. **Filter resources** by tag `azd-env-name: dev` or `project: cato-dashboard`
3. **Select all cATO Dashboard resources** (avoid selecting your VNet)
4. **Click Delete** and confirm

---

## ⚠️ Important Notes

### Resource Dependencies
- **Delete in order**: Static Web App → App Insights → Key Vault → Cosmos DB → Log Analytics → Managed Identity
- **Cosmos DB takes longest**: Deletion can take 10-15 minutes
- **Key Vault soft delete**: Requires purge for complete removal

### Data Considerations
- **Cosmos DB data**: Will be permanently lost (ensure you have backups if needed)
- **Key Vault secrets**: Will be permanently lost after purge
- **Application Insights data**: Will be lost after workspace deletion

### Cost Impact
- **Immediate**: Resource charges stop once deletion begins
- **Cosmos DB**: May continue charging until deletion completes (~15 minutes)
- **Key Vault**: Soft-deleted vaults don't incur charges

---

## 🔍 Verification Commands

After cleanup, verify all resources are removed:

```bash
# Check for any remaining cATO Dashboard resources
az resource list --resource-group "ampe-eastus-dev-rg" \
  --query "[?contains(tags.'azd-env-name', 'dev')]" \
  --output table

# Verify your existing infrastructure is intact
az network vnet show --resource-group "ampe-eastus-dev-rg" --name "ampe-eus-dev-vnet"

# List all remaining resources in the resource group
az resource list --resource-group "ampe-eastus-dev-rg" --output table
```

Expected result: Only your existing VNet and related infrastructure should remain.

---

## 🚀 Re-deployment After Cleanup

After cleanup, you can immediately re-deploy:

```bash
# The resource group and VNet are ready for fresh deployment
az deployment group create \
  --resource-group "ampe-eastus-dev-rg" \
  --template-file infra/main.bicep \
  --parameters environmentName=dev \
  --parameters location=eastus \
  --parameters adminGroupObjectId="your-admin-group-id"
```

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: "Resource not found" errors
- **Solution**: Resource may already be deleted, this is normal

**Issue**: Key Vault purge fails
- **Solution**: May require additional permissions, soft-deleted vault doesn't incur charges

**Issue**: Cosmos DB deletion takes too long
- **Solution**: Normal behavior, deletion continues in background

**Issue**: Managed Identity deletion fails
- **Solution**: Other resources may still be using it, delete dependent resources first

### Recovery Options

If you need to stop the cleanup process:
- **Cosmos DB**: Cannot be stopped once started
- **Other resources**: Can be recreated from Bicep template
- **Data recovery**: Only possible if you have backups

---

## 📞 Support

If you encounter issues during cleanup:
1. Check the Azure Activity Log for error details
2. Verify your permissions (Contributor role required)
3. Use the Azure Portal as a backup method
4. Contact your Azure administrator if needed

---

**Remember**: This cleanup process is designed to be safe and preserve your existing infrastructure while completely removing the test deployment for a fresh start.
