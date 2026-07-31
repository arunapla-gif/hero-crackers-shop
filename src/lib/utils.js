export const formatOrderNumber = (orderNumber, dateInput) => {
  if (!orderNumber) return 'ORD-UNKNOWN';
  const year = dateInput ? new Date(dateInput).getFullYear() : new Date().getFullYear();
  return `ORD-${year}-${String(orderNumber).padStart(5, '0')}`;
};
