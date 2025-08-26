export type ImpactLevel = 'IL2' | 'IL4' | 'IL5' | 'IL6';
export type DataClassification = 'Public' | 'CUI' | 'Classified';
export type FismaLevel = 'Low' | 'Moderate' | 'High';

export interface SystemClassification {
  impactLevel: ImpactLevel;
  dataClassification: DataClassification;
  fismaLevel: FismaLevel;
  lastUpdated: Date;
  source: 'manual' | 'imported' | 'detected';
}

export interface ClassificationBadgeStyle {
  text: string;
  className: string;
}

class ClassificationService {
  private classifications = new Map<string, SystemClassification>();

  async getCurrentClassification(organizationId: string): Promise<SystemClassification> {
    // Check for stored classification
    const stored = this.classifications.get(organizationId);
    if (stored) {
      return stored;
    }

    // Get from environment or default to IL5 for DoD environments
    const defaultClassification: SystemClassification = {
      impactLevel: 'IL5',
      dataClassification: 'CUI',
      fismaLevel: 'Moderate',
      lastUpdated: new Date(),
      source: 'detected'
    };

    this.classifications.set(organizationId, defaultClassification);
    return defaultClassification;
  }

  async updateClassification(organizationId: string, classification: Partial<SystemClassification>): Promise<void> {
    const current = await this.getCurrentClassification(organizationId);
    const updated: SystemClassification = {
      ...current,
      ...classification,
      lastUpdated: new Date(),
      source: 'manual'
    };
    
    this.classifications.set(organizationId, updated);
    
    // In a real app, this would persist to backend
    console.log('Classification updated:', updated);
  }

  getClassificationBadgeStyle(classification: SystemClassification): ClassificationBadgeStyle {
    const { impactLevel } = classification;
    
    switch (impactLevel) {
      case 'IL2':
        return {
          text: 'IL2 ACTIVE',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'IL4':
        return {
          text: 'IL4 ACTIVE',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'IL5':
        return {
          text: 'IL5 ACTIVE',
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        };
      case 'IL6':
        return {
          text: 'IL6 ACTIVE',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          text: 'IL2 ACTIVE',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
    }
  }

  getCUIBadgeStyle(classification: SystemClassification): ClassificationBadgeStyle {
    const { dataClassification } = classification;
    
    switch (dataClassification) {
      case 'Public':
        return {
          text: 'Public',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'CUI':
        return {
          text: 'CUI',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'Classified':
        return {
          text: 'Classified',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          text: 'CUI',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
    }
  }

  async detectFromEnvironment(): Promise<Partial<SystemClassification>> {
    // In a real environment, this would detect from various sources
    // For now, return default DoD environment settings
    return {
      impactLevel: 'IL5',
      dataClassification: 'CUI',
      fismaLevel: 'Moderate',
      source: 'detected'
    };
  }
}

export const classificationService = new ClassificationService();