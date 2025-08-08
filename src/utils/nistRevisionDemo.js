/**
 * NIST Revision Management Demo Script
 * Demonstrates the complete workflow for NIST revision management
 */
import enhancedCosmosService from '../services/enhancedCosmosService';
import nistRevisionService from '../services/nistRevisionService';
import { seedRevisionMappings } from '../data/nistRevisionMappings';
// Demo tenant configuration
const DEMO_TENANT_ID = 'demo-org-001';
const DEMO_USER_ID = 'demo-user-admin';
/**
 * Demo script to showcase NIST revision management features
 */
export class NISTRevisionManagementDemo {
    async runCompleteDemo() {
        console.log('🚀 Starting NIST Revision Management Demo...\n');
        try {
            // Step 1: Setup demo environment
            await this.setupDemoEnvironment();
            // Step 2: Demonstrate current revision status
            await this.showCurrentRevisionStatus();
            // Step 3: Perform gap analysis
            await this.performGapAnalysisDemo();
            // Step 4: Show control comparison
            await this.showControlComparisonDemo();
            // Step 5: Demonstrate upgrade initiation
            await this.initiateUpgradeDemo();
            // Step 6: Show upgrade history
            await this.showUpgradeHistoryDemo();
            console.log('✅ NIST Revision Management Demo completed successfully!');
        }
        catch (error) {
            console.error('❌ Demo failed:', error);
        }
    }
    async setupDemoEnvironment() {
        console.log('📋 Step 1: Setting up demo environment...');
        try {
            // Seed revision mappings
            await seedRevisionMappings(enhancedCosmosService);
            console.log('   ✓ Revision mappings seeded');
            // Set initial revision to Rev4 for demo
            await nistRevisionService.setRevision(DEMO_TENANT_ID, 'Rev4');
            console.log('   ✓ Demo organization set to NIST 800-53 Rev 4');
        }
        catch (error) {
            console.log('   ⚠️  Environment may already be setup');
        }
        console.log('');
    }
    async showCurrentRevisionStatus() {
        console.log('📊 Step 2: Current revision status...');
        const revisionResponse = await nistRevisionService.getCurrentRevision(DEMO_TENANT_ID);
        if (revisionResponse.success) {
            console.log(`   Current Revision: ${revisionResponse.data.currentRevision}`);
            console.log(`   Last Updated: ${new Date(revisionResponse.data.lastUpdated).toLocaleDateString()}`);
        }
        const complianceResponse = await nistRevisionService.getComplianceSummary(DEMO_TENANT_ID);
        if (complianceResponse.success) {
            const summary = complianceResponse.data;
            console.log(`   Total Controls: ${summary.totalControls}`);
            console.log(`   Compliant: ${summary.compliant} (${summary.compliancePercentage}%)`);
            console.log(`   Partial: ${summary.partial}`);
            console.log(`   Non-Compliant: ${summary.noncompliant}`);
            console.log(`   Not Assessed: ${summary.notAssessed}`);
        }
        console.log('');
    }
    async performGapAnalysisDemo() {
        console.log('🔍 Step 3: Performing gap analysis (Rev4 → Rev5)...');
        const gapAnalysis = await nistRevisionService.performGapAnalysis(DEMO_TENANT_ID, 'Rev5');
        if (gapAnalysis.success) {
            console.log('   Gap Analysis Results:');
            console.log(`   ├─ Current Controls: ${gapAnalysis.gapAnalysis.totalCurrentControls}`);
            console.log(`   ├─ Target Controls: ${gapAnalysis.gapAnalysis.totalTargetControls}`);
            console.log(`   ├─ Unchanged: ${gapAnalysis.gapAnalysis.mappings.unchanged.length}`);
            console.log(`   ├─ Modified: ${gapAnalysis.gapAnalysis.mappings.modified.length}`);
            console.log(`   ├─ New Controls: ${gapAnalysis.gapAnalysis.mappings.newControls.length}`);
            console.log(`   └─ Withdrawn: ${gapAnalysis.gapAnalysis.mappings.withdrawnControls.length}`);
            console.log('\n   Impact Assessment:');
            console.log(`   ├─ Low Impact: ${gapAnalysis.gapAnalysis.impactAssessment.lowImpact} controls`);
            console.log(`   ├─ Medium Impact: ${gapAnalysis.gapAnalysis.impactAssessment.mediumImpact} controls`);
            console.log(`   ├─ High Impact: ${gapAnalysis.gapAnalysis.impactAssessment.highImpact} controls`);
            console.log(`   └─ Total Effort: ${gapAnalysis.gapAnalysis.impactAssessment.estimatedEffortHours} hours`);
            console.log('\n   Compliance Prediction:');
            console.log(`   ├─ Likely Compliant: ${gapAnalysis.gapAnalysis.compliancePrediction.likelyCompliant}`);
            console.log(`   ├─ Requires Review: ${gapAnalysis.gapAnalysis.compliancePrediction.requiresReview}`);
            console.log(`   ├─ Likely Non-Compliant: ${gapAnalysis.gapAnalysis.compliancePrediction.likelyNonCompliant}`);
            console.log(`   └─ Not Assessed: ${gapAnalysis.gapAnalysis.compliancePrediction.notAssessed}`);
            console.log('\n   Estimated Migration Time:');
            console.log(`   ├─ Optimistic: ${gapAnalysis.estimatedMigrationTime.optimisticHours} hours`);
            console.log(`   ├─ Realistic: ${gapAnalysis.estimatedMigrationTime.realisticHours} hours`);
            console.log(`   └─ Pessimistic: ${gapAnalysis.estimatedMigrationTime.pessimisticHours} hours`);
            console.log('\n   Recommended Actions:');
            console.log('   Immediate:');
            gapAnalysis.recommendedActions.immediate.forEach(action => console.log(`     • ${action}`));
            console.log('   Short-term:');
            gapAnalysis.recommendedActions.shortTerm.forEach(action => console.log(`     • ${action}`));
        }
        console.log('');
    }
    async showControlComparisonDemo() {
        console.log('🔀 Step 4: Control comparison demo (AC-20)...');
        try {
            const comparison = await nistRevisionService.getControlComparison('AC-20', DEMO_TENANT_ID);
            if (comparison.success) {
                console.log('   Control Comparison: AC-20 (Use of External Information Systems)');
                console.log(`   Change Type: ${comparison.data.changeAnalysis.changeType}`);
                console.log(`   Implementation Impact: ${comparison.data.changeAnalysis.implementationImpact}`);
                console.log(`   Migration Required: ${comparison.data.changeAnalysis.migrationRequired}`);
                console.log(`   Estimated Effort: ${comparison.data.changeAnalysis.estimatedEffort} hours`);
                console.log(`   Change Summary: ${comparison.data.changeAnalysis.changeSummary}`);
                if (comparison.data.rev4Data) {
                    console.log('\n   Rev 4 Status:');
                    console.log(`   ├─ Current Status: ${comparison.data.rev4Data.currentStatus}`);
                    console.log(`   └─ Control Name: ${comparison.data.rev4Data.controlName}`);
                }
                if (comparison.data.rev5Data) {
                    console.log('\n   Rev 5 Prediction:');
                    console.log(`   ├─ Predicted Status: ${comparison.data.rev5Data.predictedStatus}`);
                    console.log(`   └─ Control Name: ${comparison.data.rev5Data.controlName}`);
                }
            }
        }
        catch (error) {
            console.log('   ⚠️  Control comparison not available (control may not exist in demo data)');
        }
        console.log('');
    }
    async initiateUpgradeDemo() {
        console.log('🚀 Step 5: Initiating upgrade demo (Rev4 → Rev5)...');
        const upgradeResponse = await nistRevisionService.initiateUpgrade(DEMO_TENANT_ID, 'Rev5', DEMO_USER_ID);
        if (upgradeResponse.success) {
            console.log(`   ✓ Upgrade initiated successfully!`);
            console.log(`   Upgrade ID: ${upgradeResponse.upgradeId}`);
            console.log(`   Status: ${upgradeResponse.status}`);
            console.log(`   Message: ${upgradeResponse.message}`);
            console.log(`   Rollback Available: ${upgradeResponse.rollbackAvailable}`);
            console.log(`   Estimated Completion: ${upgradeResponse.estimatedCompletionTime}`);
            console.log('\n   Next Steps:');
            upgradeResponse.nextSteps.forEach((step, index) => console.log(`     ${index + 1}. ${step}`));
        }
        console.log('');
    }
    async showUpgradeHistoryDemo() {
        console.log('📚 Step 6: Upgrade history...');
        const historyResponse = await nistRevisionService.getUpgradeHistory(DEMO_TENANT_ID);
        if (historyResponse.success && historyResponse.data.history.length > 0) {
            console.log(`   Found ${historyResponse.data.count} upgrade record(s):`);
            historyResponse.data.history.forEach((upgrade, index) => {
                console.log(`\n   Upgrade ${index + 1}:`);
                console.log(`   ├─ ID: ${upgrade.upgradeId}`);
                console.log(`   ├─ From: ${upgrade.fromRevision} → To: ${upgrade.toRevision}`);
                console.log(`   ├─ Status: ${upgrade.status}`);
                console.log(`   ├─ Initiated: ${new Date(upgrade.initiatedAt).toLocaleDateString()}`);
                console.log(`   ├─ Initiated By: ${upgrade.initiatedBy}`);
                console.log(`   └─ Summary: ${upgrade.upgradeSummary}`);
            });
        }
        else {
            console.log('   No upgrade history found');
        }
        console.log('');
    }
    // Method to generate upgrade plan
    async generateUpgradePlanDemo() {
        console.log('📋 Generating upgrade plan...');
        const planResponse = await nistRevisionService.generateUpgradePlan(DEMO_TENANT_ID, 'Rev5');
        if (planResponse.success) {
            console.log('   Upgrade Plan Generated:');
            console.log(`   Total Estimated Hours: ${planResponse.data.totalEstimatedHours}`);
            console.log(`   Recommended Timeframe: ${planResponse.data.recommendedTimeframe}`);
            console.log('\n   Phases:');
            planResponse.data.plan.forEach(phase => {
                console.log(`   Phase ${phase.phase}: ${phase.name}`);
                console.log(`   ├─ Description: ${phase.description}`);
                console.log(`   ├─ Priority: ${phase.priority}`);
                console.log(`   ├─ Estimated Hours: ${phase.estimatedHours}`);
                console.log(`   └─ Controls: ${phase.controls.length} controls`);
            });
        }
        console.log('');
    }
    // Method to show revision mappings
    async showRevisionMappingsDemo() {
        console.log('🗺️  Showing revision mappings sample...');
        const mappingsResponse = await nistRevisionService.getRevisionMappings(DEMO_TENANT_ID);
        if (mappingsResponse.success) {
            console.log(`   Total Mappings: ${mappingsResponse.data.count}`);
            // Show sample of different mapping types
            const mappings = mappingsResponse.data.mappings;
            const sampleMappings = {
                modified: mappings.filter(m => m.changeType === 'Modified').slice(0, 2),
                newControls: mappings.filter(m => m.changeType === 'New Control').slice(0, 2),
                withdrawn: mappings.filter(m => m.changeType === 'Withdrawn').slice(0, 1)
            };
            console.log('\n   Sample Modified Controls:');
            sampleMappings.modified.forEach(mapping => {
                console.log(`   ├─ ${mapping.rev4ControlId} → ${mapping.rev5ControlId} (${mapping.implementationImpact} impact)`);
                console.log(`   └─ ${mapping.changeSummary}`);
            });
            console.log('\n   Sample New Controls:');
            sampleMappings.newControls.forEach(mapping => {
                console.log(`   ├─ New: ${mapping.rev5ControlId} (${mapping.implementationImpact} impact)`);
                console.log(`   └─ ${mapping.changeSummary}`);
            });
            if (sampleMappings.withdrawn.length > 0) {
                console.log('\n   Sample Withdrawn Controls:');
                sampleMappings.withdrawn.forEach(mapping => {
                    console.log(`   ├─ Withdrawn: ${mapping.rev4ControlId}`);
                    console.log(`   └─ ${mapping.changeSummary}`);
                });
            }
        }
        console.log('');
    }
}
// Export demo instance
export const nistRevisionDemo = new NISTRevisionManagementDemo();
// Usage example:
// import { nistRevisionDemo } from './path/to/this/file';
// await nistRevisionDemo.runCompleteDemo();
