/**
 * CSV loading utilities with robust header handling and BOM support
 */

import { csvParse } from 'd3-dsv';
import { readFile } from 'fs/promises';
import { log, normalize } from './utils.js';

export interface CSVRow {
  [key: string]: string;
}

/**
 * Remove BOM (Byte Order Mark) from string
 */
function removeBOM(str: string): string {
  if (str.charCodeAt(0) === 0xFEFF) {
    return str.slice(1);
  }
  return str;
}

/**
 * Clean and normalize CSV headers
 */
function cleanHeaders(headers: string[]): string[] {
  return headers.map(header => {
    // Remove BOM, trim whitespace, normalize
    let cleaned = removeBOM(header).trim();
    
    // Remove common artifacts
    cleaned = cleaned.replace(/[""]/g, '"'); // Normalize quotes
    cleaned = cleaned.replace(/\u00A0/g, ' '); // Replace non-breaking spaces
    
    return cleaned;
  });
}

/**
 * Load and parse CSV file with robust error handling
 */
export async function loadCSV(filePath: string): Promise<CSVRow[]> {
  try {
    log(`Loading CSV file: ${filePath}`);
    
    // Read file content
    let content = await readFile(filePath, 'utf-8');
    
    // Remove BOM if present
    content = removeBOM(content);
    
    // Parse CSV using d3-dsv
    const rawData = csvParse(content);
    
    if (!rawData || rawData.length === 0) {
      throw new Error('CSV file is empty or could not be parsed');
    }
    
    // Clean headers in the first row (d3-dsv uses first row as headers)
    const cleanedData: CSVRow[] = rawData.map(row => {
      const cleanedRow: CSVRow = {};
      
      for (const [key, value] of Object.entries(row)) {
        const cleanKey = removeBOM(key).trim();
        const cleanValue = value ? normalize(value) : '';
        cleanedRow[cleanKey] = cleanValue;
      }
      
      return cleanedRow;
    });
    
    log(`Successfully loaded ${cleanedData.length} rows from CSV`);
    return cleanedData;
    
  } catch (error: any) {
    log(`Failed to load CSV file ${filePath}: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Validate CSV has expected headers
 */
export function validateHeaders(data: CSVRow[], expectedHeaders: string[]): void {
  if (data.length === 0) {
    throw new Error('CSV data is empty');
  }
  
  const actualHeaders = Object.keys(data[0]);
  const missingHeaders: string[] = [];
  
  for (const expected of expectedHeaders) {
    // Check for exact match or close match (case insensitive, trimmed)
    const found = actualHeaders.some(actual => 
      actual.toLowerCase().trim() === expected.toLowerCase().trim()
    );
    
    if (!found) {
      missingHeaders.push(expected);
    }
  }
  
  if (missingHeaders.length > 0) {
    log(`Missing expected headers: ${missingHeaders.join(', ')}`, 'warn');
    log(`Available headers: ${actualHeaders.join(', ')}`, 'info');
    // Don't throw error, just warn - CSV might have different but usable headers
  }
}

/**
 * Get value from CSV row with flexible header matching
 */
export function getCSVValue(row: CSVRow, headerVariants: string[]): string {
  for (const variant of headerVariants) {
    // Try exact match first
    if (row[variant] !== undefined) {
      return row[variant] || '';
    }
    
    // Try case-insensitive match
    const key = Object.keys(row).find(k => 
      k.toLowerCase().trim() === variant.toLowerCase().trim()
    );
    
    if (key && row[key] !== undefined) {
      return row[key] || '';
    }
  }
  
  return '';
}

/**
 * Load ZTA Activities CSV
 */
export async function loadActivitiesCSV(filePath: string): Promise<CSVRow[]> {
  const data = await loadCSV(filePath);
  
  const expectedHeaders = [
    'ID#',
    'Activity Name',
    'Pillar',
    'Responsibility',
    'Activity Type',
    'Duration',
    'Descriptions',
    'Outcomes',
    'End State',
    'Predecessor(s)',
    'Successor(s)',
    'Related NIST Controls',
    'Azure Commercial Remediation',
    'Azure Government Remediation'
  ];
  
  validateHeaders(data, expectedHeaders);
  log(`Loaded ${data.length} ZTA activities`);
  
  return data;
}

/**
 * Load ZTA Capabilities CSV
 */
export async function loadCapabilitiesCSV(filePath: string): Promise<CSVRow[]> {
  const data = await loadCSV(filePath);
  
  const expectedHeaders = [
    'ID #',
    'Capability Pillar',
    'Capability Description',
    'Capability Outcome',
    'Impact to ZT',
    'Associated Activities',
    'Related NIST Controls',
    'Azure Commercial Remediation',
    'Azure Government Remediation'
  ];
  
  validateHeaders(data, expectedHeaders);
  log(`Loaded ${data.length} ZTA capabilities`);
  
  return data;
}

/**
 * Show CSV sample for debugging
 */
export function showCSVSample(data: CSVRow[], maxRows: number = 3): void {
  if (data.length === 0) {
    log('No data to show');
    return;
  }
  
  log('CSV Sample:');
  console.log('Headers:', Object.keys(data[0]));
  
  const sampleRows = data.slice(0, Math.min(maxRows, data.length));
  sampleRows.forEach((row, index) => {
    console.log(`\nRow ${index + 1}:`);
    for (const [key, value] of Object.entries(row)) {
      if (value && value.length > 0) {
        const displayValue = value.length > 100 ? value.slice(0, 100) + '...' : value;
        console.log(`  ${key}: ${displayValue}`);
      }
    }
  });
}
