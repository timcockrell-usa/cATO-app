import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { classificationService, SystemClassification } from "@/services/classificationService";
import { useAuth } from "@/contexts/SimpleAuthContext";

export function ClassificationBadges() {
  const [classification, setClassification] = useState<SystemClassification | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadClassification();
  }, [user]);

  const loadClassification = async () => {
    if (!user?.organizationId) {
      setLoading(false);
      return;
    }

    try {
      const current = await classificationService.getCurrentClassification(user.organizationId);
      setClassification(current);
    } catch (error) {
      console.error('Failed to load classification:', error);
      // Use default - create a default classification object
      setClassification({
        impactLevel: 'IL2',
        dataClassification: 'CUI',
        fismaLevel: 'Moderate',
        lastUpdated: new Date(),
        source: 'manual'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 animate-pulse">
          Loading...
        </Badge>
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 animate-pulse">
          Loading...
        </Badge>
      </>
    );
  }

  if (!classification) {
    return (
      <>
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          IL2 ACTIVE
        </Badge>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          CUI
        </Badge>
      </>
    );
  }

  const ilBadge = classificationService.getClassificationBadgeStyle(classification);
  const cuiBadge = classificationService.getCUIBadgeStyle(classification);

  return (
    <>
      <Badge variant="outline" className={ilBadge.className}>
        {ilBadge.text}
      </Badge>
      <Badge variant="outline" className={cuiBadge.className}>
        {cuiBadge.text}
      </Badge>
    </>
  );
}
