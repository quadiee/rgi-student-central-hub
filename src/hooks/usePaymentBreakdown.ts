
import { useState } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const usePaymentBreakdown = () => {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);

  const showPaymentBreakdown = (paymentId: string, breadcrumbs: BreadcrumbItem[] = []) => {
    setSelectedPaymentId(paymentId);
    setBreadcrumbItems(breadcrumbs);
  };

  const hidePaymentBreakdown = () => {
    setSelectedPaymentId(null);
    setBreadcrumbItems([]);
  };

  const isShowingBreakdown = selectedPaymentId !== null;

  return {
    selectedPaymentId,
    breadcrumbItems,
    isShowingBreakdown,
    showPaymentBreakdown,
    hidePaymentBreakdown
  };
};
