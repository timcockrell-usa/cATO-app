-- Azure Control Coverage Database Migration
-- Generated: 2025-08-26T07:58:52.260Z
-- Updates NIST controls with Azure coverage information

-- Add new columns for Azure coverage if they don't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'provider_covered')
BEGIN
    ALTER TABLE nist_controls ADD provider_covered BIT DEFAULT 0;
    PRINT 'Added provider_covered column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'provider_coverage_type')
BEGIN
    ALTER TABLE nist_controls ADD provider_coverage_type NVARCHAR(10) DEFAULT 'None';
    PRINT 'Added provider_coverage_type column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'azure_inherited')
BEGIN
    ALTER TABLE nist_controls ADD azure_inherited BIT DEFAULT 0;
    PRINT 'Added azure_inherited column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'azure_shared_responsibility')
BEGIN
    ALTER TABLE nist_controls ADD azure_shared_responsibility BIT DEFAULT 0;
    PRINT 'Added azure_shared_responsibility column';
END

-- Update controls with Azure coverage information

UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(3)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(4)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(5)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(6)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(7)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(8)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(9)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-2(10)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-3';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-3(3)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-4';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-5';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-6(1)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-6(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-6(5)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-6(9)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-6(10)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-7';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-8';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-10';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-11';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-12';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-14';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-17';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-17(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-17(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-17(3)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-18';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-19';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-19(5)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-20';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-20(1)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-20(2)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AC-20(3)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AT-1';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AT-2';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AT-3';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AT-4';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-2(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-3(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-5';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-6(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-6(3)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-7';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-8';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-8(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-9';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-9(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-9(4)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-11';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'AU-12';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CA-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CA-2';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CA-3';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CA-5';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CA-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CA-7';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CA-9';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-2(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-3(2)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-5';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-7';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-7(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-7(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-8';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-8(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-8(3)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-9';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-10';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CM-11';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CP-1';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CP-2';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CP-3';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'CP-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CP-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CP-7';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CP-8';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CP-9';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'CP-10';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-2(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-2(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-2(3)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-2(8)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-5';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-5(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-5(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-5(7)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-5(13)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-7';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-8';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-8(1)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-8(3)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-8(4)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-8(5)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-8(6)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IA-11';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'IR-1';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'IR-2';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'IR-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IR-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IR-4(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IR-5';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'IR-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'IR-7';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'IR-8';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MA-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MA-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MA-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MA-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MA-4(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MA-5';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MA-6';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MP-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MP-2';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MP-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MP-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MP-5';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MP-6';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'MP-7';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-4';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-5';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-8';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-9';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-11';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-12';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-13';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-14';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-15';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PE-16';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PL-1';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PL-2';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PL-4';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PL-8';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PL-10';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PL-11';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-1';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-2';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-3';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-4';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-5';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-6';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-7';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-8';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-9';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-10';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-11';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-12';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-14';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PM-16';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PS-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'PS-2';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PS-3';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PS-3(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'PS-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'PS-5';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PS-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'PS-7';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'PS-8';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-2(1)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-5';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-5(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-5(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-5(3)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-5(4)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'RA-6';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-1';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-3';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-4';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-4(1)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-4(2)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-4(3)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-5';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-5(1)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-6';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SA-7';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-5';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-7';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-7(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-7(3)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-8';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-8(1)';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-10';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-12';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-13';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-13(1)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-15';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-17';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-18';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-19';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-20';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-21';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-22';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-23';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-28';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Full',
    azure_inherited = 1,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-28(1)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SC-39';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-1';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-2';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-3';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-4';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-4(14)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-5';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-7';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-7(8)';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-8';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-10';
UPDATE nist_controls 
SET 
    provider_covered = 0,
    provider_coverage_type = 'None',
    azure_inherited = 0,
    azure_shared_responsibility = 0,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-12';
UPDATE nist_controls 
SET 
    provider_covered = 1,
    provider_coverage_type = 'Partial',
    azure_inherited = 0,
    azure_shared_responsibility = 1,
    updated_at = GETDATE()
WHERE control_identifier = 'SI-16';

-- Create view for Azure coverage statistics
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_AzureCoverageStats')
    DROP VIEW vw_AzureCoverageStats;
GO

CREATE VIEW vw_AzureCoverageStats AS
SELECT 
    control_family,
    COUNT(*) as total_controls,
    SUM(CASE WHEN provider_covered = 1 THEN 1 ELSE 0 END) as azure_covered_count,
    SUM(CASE WHEN azure_inherited = 1 THEN 1 ELSE 0 END) as azure_inherited_count,
    SUM(CASE WHEN azure_shared_responsibility = 1 THEN 1 ELSE 0 END) as azure_shared_count,
    SUM(CASE WHEN provider_covered = 0 THEN 1 ELSE 0 END) as customer_responsibility_count,
    CAST(SUM(CASE WHEN provider_covered = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as azure_coverage_percentage
FROM nist_controls
GROUP BY control_family;
GO

-- Create overall Azure coverage statistics
SELECT 
    'Overall' as scope,
    COUNT(*) as total_controls,
    SUM(CASE WHEN provider_covered = 1 THEN 1 ELSE 0 END) as azure_covered,
    SUM(CASE WHEN azure_inherited = 1 THEN 1 ELSE 0 END) as azure_inherited,
    SUM(CASE WHEN azure_shared_responsibility = 1 THEN 1 ELSE 0 END) as azure_shared,
    SUM(CASE WHEN provider_covered = 0 THEN 1 ELSE 0 END) as customer_only,
    CAST(SUM(CASE WHEN provider_covered = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as coverage_percentage
FROM nist_controls;

PRINT 'Azure control coverage migration completed successfully!';
