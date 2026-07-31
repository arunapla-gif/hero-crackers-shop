export const formatOrderNumber = (orderNumber, dateInput) => {
  if (!orderNumber) return 'ORD-UNKNOWN';
  
  const date = dateInput ? new Date(dateInput) : new Date();
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 1 = Feb, 2 = Mar, 3 = Apr
  
  // Financial year in India is from April 1 to March 31
  const fyStart = month >= 3 ? year : year - 1;
  const fyEnd = (fyStart + 1).toString().slice(-2);
  const fyString = `${fyStart}-${fyEnd}`;

  return `ORD-${fyString}-${String(orderNumber).padStart(5, '0')}`;
};
