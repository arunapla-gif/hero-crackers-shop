export const formatOrderNumber = (orderNumber) => {
  if (!orderNumber) return 'ORD-UNKNOWN';
  return `ORD-${String(orderNumber).padStart(5, '0')}`;
};
