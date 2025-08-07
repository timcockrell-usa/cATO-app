-- NIST Revision Management Database Schema
-- Adds support for NIST 800-53 Rev 4 and Rev 5 management

-- Add revision column to nist_controls (Already exists in TypeScript interface)
-- The EnhancedNISTControl already has nistRevision: '4' | '5'

-- Add current_nist_revision to organizations (Already exists in TypeScript interface)
-- The Organization interface already has nistRevision: NistRevision with 'Rev4' | 'Rev5'

-- Create NIST revision mappings table
CREATE TABLE nist_revision_mappings (
    mapping_id VARCHAR(50) PRIMARY KEY,
    tenantId VARCHAR(50) NOT NULL,
    rev4_control_id VARCHAR(20),
    rev5_control_id VARCHAR(20),
    change_type VARCHAR(50) NOT NULL, -- 'New Control', 'Modified', 'Merged', 'Withdrawn', 'Split'
    change_summary TEXT,
    implementation_impact VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    automated_mapping BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_rev4 (tenantId, rev4_control_id),
    INDEX idx_tenant_rev5 (tenantId, rev5_control_id),
    INDEX idx_change_type (change_type)
);

-- Create NIST revision upgrade history table
CREATE TABLE nist_revision_upgrade_history (
    upgrade_id VARCHAR(50) PRIMARY KEY,
    tenantId VARCHAR(50) NOT NULL,
    from_revision VARCHAR(10) NOT NULL,
    to_revision VARCHAR(10) NOT NULL,
    initiated_by VARCHAR(50) NOT NULL,
    initiated_at DATETIME NOT NULL,
    completed_at DATETIME,
    status VARCHAR(20) DEFAULT 'in_progress', -- 'initiated', 'in_progress', 'completed', 'failed', 'rolled_back'
    controls_affected INT DEFAULT 0,
    controls_migrated INT DEFAULT 0,
    controls_requiring_review INT DEFAULT 0,
    upgrade_summary TEXT,
    rollback_data TEXT, -- JSON backup of pre-upgrade state
    INDEX idx_tenant_status (tenantId, status),
    INDEX idx_upgrade_date (initiated_at)
);

-- Create NIST control revision comparison view
CREATE VIEW nist_control_revision_comparison AS
SELECT 
    nrm.mapping_id,
    nrm.tenantId,
    nrm.rev4_control_id,
    nrm.rev5_control_id,
    nrm.change_type,
    nrm.change_summary,
    nrm.implementation_impact,
    nc4.controlName as rev4_control_name,
    nc5.controlName as rev5_control_name,
    nc4.overallStatus as rev4_status,
    nc5.overallStatus as rev5_status,
    CASE 
        WHEN nrm.change_type = 'New Control' THEN 'not-assessed'
        WHEN nrm.change_type = 'Withdrawn' THEN 'deprecated'
        WHEN nc4.overallStatus = 'compliant' AND nc5.overallStatus IS NULL THEN 'requires-review'
        WHEN nc4.overallStatus = 'compliant' THEN 'likely-compliant'
        ELSE 'likely-noncompliant'
    END as predicted_compliance_status
FROM nist_revision_mappings nrm
LEFT JOIN nist_controls nc4 ON nrm.rev4_control_id = nc4.controlIdentifier AND nc4.nistRevision = '4'
LEFT JOIN nist_controls nc5 ON nrm.rev5_control_id = nc5.controlIdentifier AND nc5.nistRevision = '5'
WHERE nrm.tenantId = @tenantId;

-- Sample data for NIST revision mappings (these would be populated from official NIST mapping documentation)
INSERT INTO nist_revision_mappings (mapping_id, tenantId, rev4_control_id, rev5_control_id, change_type, change_summary, implementation_impact) VALUES
('GLOBAL-AC-1', 'global', 'AC-1', 'AC-1', 'Modified', 'Enhanced requirements for policy documentation and dissemination', 'low'),
('GLOBAL-AC-2', 'global', 'AC-2', 'AC-2', 'Modified', 'Added requirements for automated account management', 'medium'),
('GLOBAL-AC-3', 'global', 'AC-3', 'AC-3', 'Modified', 'Enhanced access enforcement requirements', 'low'),
('GLOBAL-AC-4', 'global', 'AC-4', 'AC-4', 'Modified', 'Updated information flow control requirements', 'medium'),
('GLOBAL-AC-5', 'global', 'AC-5', 'AC-5', 'Modified', 'Enhanced separation of duties requirements', 'low'),
('GLOBAL-AC-6', 'global', 'AC-6', 'AC-6', 'Modified', 'Updated least privilege requirements with new enhancements', 'medium'),
('GLOBAL-AC-7', 'global', 'AC-7', 'AC-7', 'Modified', 'Enhanced unsuccessful logon attempt requirements', 'low'),
('GLOBAL-AC-8', 'global', 'AC-8', 'AC-8', 'Modified', 'Updated system use notification requirements', 'low'),
('GLOBAL-AC-11', 'global', 'AC-11', 'AC-11', 'Modified', 'Enhanced device lock requirements', 'low'),
('GLOBAL-AC-12', 'global', 'AC-12', 'AC-12', 'Modified', 'Updated session termination requirements', 'low'),
('GLOBAL-AC-14', 'global', 'AC-14', 'AC-14', 'Modified', 'Enhanced permitted actions without identification', 'low'),
('GLOBAL-AC-17', 'global', 'AC-17', 'AC-17', 'Modified', 'Updated remote access requirements', 'medium'),
('GLOBAL-AC-18', 'global', 'AC-18', 'AC-18', 'Modified', 'Enhanced wireless access requirements', 'medium'),
('GLOBAL-AC-19', 'global', 'AC-19', 'AC-19', 'Modified', 'Updated access control for mobile devices', 'medium'),
('GLOBAL-AC-20', 'global', 'AC-20', 'AC-20', 'Modified', 'Enhanced use of external systems requirements', 'high'),
('GLOBAL-AC-21', 'global', 'AC-21', 'AC-21', 'Modified', 'Updated information sharing requirements', 'medium'),
('GLOBAL-AC-22', 'global', 'AC-22', 'AC-22', 'Modified', 'Enhanced publicly accessible content requirements', 'low'),
('GLOBAL-AC-23', 'global', 'AC-23', 'AC-23', 'Modified', 'Updated data mining protection requirements', 'medium'),
('GLOBAL-AC-24', 'global', 'AC-24', 'AC-24', 'Modified', 'Enhanced access control decisions requirements', 'low'),
('GLOBAL-AC-25', 'global', 'AC-25', 'AC-25', 'Modified', 'Updated reference monitor concept requirements', 'high'),
('GLOBAL-SI-22', 'global', NULL, 'SI-22', 'New Control', 'New control for information diversity', 'high'),
('GLOBAL-SI-23', 'global', NULL, 'SI-23', 'New Control', 'New control for information fragmentation', 'high'),
('GLOBAL-PM-32', 'global', NULL, 'PM-32', 'New Control', 'New control for purposing', 'medium'),
('GLOBAL-PT-1', 'global', NULL, 'PT-1', 'New Control', 'New control family for personally identifiable information processing and transparency - Policy and procedures', 'high'),
('GLOBAL-PT-2', 'global', NULL, 'PT-2', 'New Control', 'Authority to process personally identifiable information', 'high'),
('GLOBAL-PT-3', 'global', NULL, 'PT-3', 'New Control', 'Personally identifiable information processing purposes', 'high'),
('GLOBAL-PT-4', 'global', NULL, 'PT-4', 'New Control', 'Consent', 'high'),
('GLOBAL-PT-5', 'global', NULL, 'PT-5', 'New Control', 'Privacy notice', 'medium'),
('GLOBAL-PT-6', 'global', NULL, 'PT-6', 'New Control', 'System of records notice and privacy act statements', 'medium'),
('GLOBAL-PT-7', 'global', NULL, 'PT-7', 'New Control', 'Specific categories of personally identifiable information', 'medium'),
('GLOBAL-PT-8', 'global', NULL, 'PT-8', 'New Control', 'Computer matching requirements', 'high');

-- Note: This is a sample of mappings. The complete mapping would include all 421+ controls
-- and would be populated from the official NIST SP 800-53 Rev 5 transition documentation.
