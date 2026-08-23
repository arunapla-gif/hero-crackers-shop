import { formatOrderNumber } from './utils';

export async function generateInvoicePDFBuffer(order, products) {
  try {
    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };
    
    const pdfMake = require('pdfmake');
    pdfMake.fonts = fonts;
    
    let totalMRP = 0;
    let totalSavings = 0;
    
    const bodyItems = order.items.map((item, idx) => {
      const product = products.find(p => p.id === item.productId);
      const mrp = product?.basePrice || item.price;
      const rate = item.price;
      const qty = item.quantity;
      
      totalMRP += (mrp * qty);
      totalSavings += ((mrp - rate) * qty);

      return [
        { text: (idx + 1).toString(), alignment: 'center', margin: [0, 5] },
        { text: product ? product.name : 'Item', margin: [0, 5] },
        { text: `Rs ${mrp.toFixed(2)}`, alignment: 'right', decoration: 'lineThrough', color: '#666666', margin: [0, 5] },
        { text: `Rs ${rate.toFixed(2)}`, alignment: 'right', bold: true, margin: [0, 5] },
        { text: qty.toString(), alignment: 'center', margin: [0, 5] },
        { text: `Rs ${(rate * qty).toFixed(2)}`, alignment: 'right', bold: true, margin: [0, 5] }
      ];
    });

    const docDefinition = {
      defaultStyle: { font: 'Helvetica', fontSize: 10 },
      pageSize: 'A4',
      pageMargins: [ 40, 40, 40, 40 ],
      content: [
        { text: 'HERO CRACKERS', style: 'header', alignment: 'center', margin: [0, 0, 0, 5] },
        { text: 'ESTIMATE / INVOICE', alignment: 'center', color: '#555555', margin: [0, 0, 0, 20] },
        
        {
          columns: [
            [
              { text: `Order ID: ${formatOrderNumber(order.orderNumber, order.createdAt)}`, bold: true, margin: [0, 2] },
              { text: `Date: ${new Date(order.createdAt).toLocaleDateString()}`, margin: [0, 2] }
            ],
            [
              { text: `Customer Name: ${order.user?.name || order.customerName || 'Walk-in Customer'}`, alignment: 'right', bold: true, margin: [0, 2] },
              { text: `Phone: ${order.customerPhone || 'N/A'}`, alignment: 'right', margin: [0, 2] }
            ]
          ],
          margin: [0, 0, 0, 15]
        },
        
        { text: `Shipping Address: ${order.shippingAddress || 'Store Pickup'}`, margin: [0, 0, 0, 20] },
        
        {
          table: {
            headerRows: 1,
            widths: ['5%', '40%', '15%', '15%', '10%', '15%'],
            body: [
              [
                { text: 'S.No', bold: true, alignment: 'center', fillColor: '#f5f5f5', margin: [0, 5] },
                { text: 'Particulars', bold: true, fillColor: '#f5f5f5', margin: [0, 5] },
                { text: 'MRP', bold: true, alignment: 'right', fillColor: '#f5f5f5', margin: [0, 5] },
                { text: 'Rate', bold: true, alignment: 'right', fillColor: '#f5f5f5', margin: [0, 5] },
                { text: 'Qty', bold: true, alignment: 'center', fillColor: '#f5f5f5', margin: [0, 5] },
                { text: 'Amount', bold: true, alignment: 'right', fillColor: '#f5f5f5', margin: [0, 5] }
              ],
              ...bodyItems,
              [
                { text: 'Total MRP Value:', colSpan: 5, alignment: 'right', color: '#555555', margin: [0, 8] }, {}, {}, {}, {},
                { text: `Rs ${totalMRP.toFixed(2)}`, alignment: 'right', color: '#555555', margin: [0, 8] }
              ],
              [
                { text: 'Total Discount Savings:', colSpan: 5, alignment: 'right', color: '#2e7d32', margin: [0, 8] }, {}, {}, {}, {},
                { text: `- Rs ${totalSavings.toFixed(2)}`, alignment: 'right', color: '#2e7d32', margin: [0, 8] }
              ],
              [
                { text: 'Net Payable Amount:', colSpan: 5, alignment: 'right', fontSize: 12, bold: true, margin: [0, 10] }, {}, {}, {}, {},
                { text: `Rs ${order.totalAmount.toFixed(2)}`, alignment: 'right', fontSize: 12, bold: true, margin: [0, 10] }
              ]
            ]
          }
        }
      ],
      styles: {
        header: { fontSize: 20, bold: true }
      }
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getBuffer().then(resolve).catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  } catch (err) {
    console.error('PDF Generation Error:', err);
    throw err;
  }
}
