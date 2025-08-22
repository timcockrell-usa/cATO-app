-- Database Migration Script for Enhanced NIST Controls
-- Updates the NIST controls table structure to support Azure Commercial and Government remediation
-- Run this script in Azure SQL Database if you're using a database backend

USE [YourDatabaseName]; -- Replace with your actual database name

-- Check if the table exists
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='nist_controls' AND xtype='U')
BEGIN
    PRINT 'Creating nist_controls table...'
    
    CREATE TABLE nist_controls (
        id INT IDENTITY(1,1) PRIMARY KEY,
        control_identifier NVARCHAR(20) NOT NULL UNIQUE,
        control_name NVARCHAR(255) NOT NULL,
        control_family NVARCHAR(100) NOT NULL,
        description NTEXT,
        full_control_text NTEXT,
        discussion NTEXT,
        status NVARCHAR(20) DEFAULT 'not-assessed',
        risk_level NVARCHAR(10) DEFAULT 'medium',
        azure_implementation NTEXT,
        azure_commercial_remediation NTEXT,
        azure_government_remediation NTEXT,
        related_controls NVARCHAR(500),
        last_assessed DATETIME2 DEFAULT GETDATE(),
        assessed_by NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    
    PRINT 'Created nist_controls table'
END
ELSE
BEGIN
    PRINT 'nist_controls table already exists, checking for new columns...'
    
    -- Add azure_commercial_remediation column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'azure_commercial_remediation')
    BEGIN
        ALTER TABLE nist_controls ADD azure_commercial_remediation NTEXT;
        PRINT 'Added azure_commercial_remediation column'
    END
    
    -- Add azure_government_remediation column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'azure_government_remediation')
    BEGIN
        ALTER TABLE nist_controls ADD azure_government_remediation NTEXT;
        PRINT 'Added azure_government_remediation column'
    END
    
    -- Add full_control_text column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'full_control_text')
    BEGIN
        ALTER TABLE nist_controls ADD full_control_text NTEXT;
        PRINT 'Added full_control_text column'
    END
    
    -- Add discussion column if it doesn't exist
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('nist_controls') AND name = 'discussion')
    BEGIN
        ALTER TABLE nist_controls ADD discussion NTEXT;
        PRINT 'Added discussion column'
    END
END

-- Create indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_nist_controls_family')
BEGIN
    CREATE INDEX IX_nist_controls_family ON nist_controls(control_family);
    PRINT 'Created index on control_family'
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_nist_controls_status')
BEGIN
    CREATE INDEX IX_nist_controls_status ON nist_controls(status);
    PRINT 'Created index on status'
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_nist_controls_risk')
BEGIN
    CREATE INDEX IX_nist_controls_risk ON nist_controls(risk_level);
    PRINT 'Created index on risk_level'
END

-- Create or update stored procedure for inserting/updating controls
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'usp_UpsertNistControl')
    DROP PROCEDURE usp_UpsertNistControl;
GO

CREATE PROCEDURE usp_UpsertNistControl
    @control_identifier NVARCHAR(20),
    @control_name NVARCHAR(255),
    @control_family NVARCHAR(100),
    @description NTEXT = NULL,
    @full_control_text NTEXT = NULL,
    @discussion NTEXT = NULL,
    @status NVARCHAR(20) = 'not-assessed',
    @risk_level NVARCHAR(10) = 'medium',
    @azure_implementation NTEXT = NULL,
    @azure_commercial_remediation NTEXT = NULL,
    @azure_government_remediation NTEXT = NULL,
    @related_controls NVARCHAR(500) = NULL,
    @assessed_by NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT 1 FROM nist_controls WHERE control_identifier = @control_identifier)
    BEGIN
        UPDATE nist_controls 
        SET 
            control_name = @control_name,
            control_family = @control_family,
            description = @description,
            full_control_text = @full_control_text,
            discussion = @discussion,
            status = @status,
            risk_level = @risk_level,
            azure_implementation = @azure_implementation,
            azure_commercial_remediation = @azure_commercial_remediation,
            azure_government_remediation = @azure_government_remediation,
            related_controls = @related_controls,
            assessed_by = @assessed_by,
            updated_at = GETDATE()
        WHERE control_identifier = @control_identifier;
    END
    ELSE
    BEGIN
        INSERT INTO nist_controls (
            control_identifier, control_name, control_family, description, 
            full_control_text, discussion, status, risk_level, 
            azure_implementation, azure_commercial_remediation, 
            azure_government_remediation, related_controls, assessed_by
        )
        VALUES (
            @control_identifier, @control_name, @control_family, @description,
            @full_control_text, @discussion, @status, @risk_level,
            @azure_implementation, @azure_commercial_remediation,
            @azure_government_remediation, @related_controls, @assessed_by
        );
    END
END
GO

-- Create view for control family statistics
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ControlFamilyStats')
    DROP VIEW vw_ControlFamilyStats;
GO

CREATE VIEW vw_ControlFamilyStats AS
SELECT 
    control_family,
    COUNT(*) as total_controls,
    SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END) as compliant_count,
    SUM(CASE WHEN status = 'partial' THEN 1 ELSE 0 END) as partial_count,
    SUM(CASE WHEN status = 'noncompliant' THEN 1 ELSE 0 END) as noncompliant_count,
    SUM(CASE WHEN status = 'not-assessed' THEN 1 ELSE 0 END) as not_assessed_count,
    CAST(SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as compliance_percentage
FROM nist_controls
GROUP BY control_family;
GO

PRINT 'Database migration completed successfully!'
PRINT 'Tables and procedures are ready for enhanced NIST controls data.'
