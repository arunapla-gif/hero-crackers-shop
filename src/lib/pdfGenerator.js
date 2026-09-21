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
    
    // Sort items by the product's sequence to match website order
    const sortedItems = [...order.items].sort((a, b) => {
      const productA = products.find(p => p.id === a.productId);
      const productB = products.find(p => p.id === b.productId);
      
      const seqA = productA ? (productA.sequence || 0) : 999999;
      const seqB = productB ? (productB.sequence || 0) : 999999;
      
      return seqA - seqB;
    });
    
    const bodyItems = sortedItems.map((item, idx) => {
      const product = products.find(p => p.id === item.productId);
      const mrp = product?.basePrice || item.price;
      const rate = item.price;
      const qty = item.quantity;
      
      totalMRP += (mrp * qty);
      totalSavings += ((mrp - rate) * qty);

      return [
        { text: (idx + 1).toString(), alignment: 'center', margin: [0, 2] },
        { text: product ? product.name : 'Item', margin: [0, 2] },
        { text: product?.packageString || '-', alignment: 'center', margin: [0, 2] },
        { text: `Rs ${mrp.toFixed(2)}`, alignment: 'right', decoration: 'lineThrough', color: '#666666', margin: [0, 2] },
        { text: `Rs ${rate.toFixed(2)}`, alignment: 'right', bold: true, margin: [0, 2] },
        { text: qty.toString(), alignment: 'center', margin: [0, 2] },
        { text: `Rs ${(rate * qty).toFixed(2)}`, alignment: 'right', bold: true, margin: [0, 2] }
      ];
    });

    const docDefinition = {
      defaultStyle: { font: 'Helvetica', fontSize: 9 },
      pageSize: 'A4',
      pageMargins: [ 30, 30, 30, 30 ],
      content: [
        { text: 'HERO CRACKERS', style: 'header', alignment: 'center', color: '#B71C1C', margin: [0, 0, 0, 2] },
        { text: 'Sivakasi', alignment: 'center', color: '#555555', fontSize: 10, margin: [0, 0, 0, 8] },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1.5, lineColor: '#B71C1C' }], margin: [0, 0, 0, 15] },
        { text: 'ESTIMATE / INVOICE', alignment: 'center', color: '#333333', bold: true, margin: [0, 0, 0, 15] },
        
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
        
        { text: `Shipping Address: ${order.shippingAddress || 'Store Pickup'}`, margin: [0, 0, 0, order.remarks ? 5 : 20] },
        
        ...(order.remarks ? [{
          text: `Remarks: ${order.remarks}`,
          italics: true,
          color: '#555555',
          margin: [0, 0, 0, 20]
        }] : []),
        
        {
          table: {
            headerRows: 1,
            widths: ['5%', '30%', '10%', '15%', '15%', '10%', '15%'],
            body: [
              [
                { text: 'S.No', bold: true, alignment: 'center', fillColor: '#ffebee', margin: [0, 4] },
                { text: 'Particulars', bold: true, fillColor: '#ffebee', margin: [0, 4] },
                { text: 'PKG', bold: true, alignment: 'center', fillColor: '#ffebee', margin: [0, 4] },
                { text: 'MRP', bold: true, alignment: 'right', fillColor: '#ffebee', margin: [0, 4] },
                { text: 'Rate', bold: true, alignment: 'right', fillColor: '#ffebee', margin: [0, 4] },
                { text: 'Qty', bold: true, alignment: 'center', fillColor: '#ffebee', margin: [0, 4] },
                { text: 'Amount', bold: true, alignment: 'right', fillColor: '#ffebee', margin: [0, 4] }
              ],
              ...bodyItems,
              [
                { text: 'Total MRP Value:', colSpan: 6, alignment: 'right', color: '#555555', margin: [0, 6] }, {}, {}, {}, {}, {},
                { text: `Rs ${totalMRP.toFixed(2)}`, alignment: 'right', color: '#555555', margin: [0, 6] }
              ],
              [
                { text: 'Total Discount Savings:', colSpan: 6, alignment: 'right', color: '#2e7d32', margin: [0, 6] }, {}, {}, {}, {}, {},
                { text: `- Rs ${totalSavings.toFixed(2)}`, alignment: 'right', color: '#2e7d32', margin: [0, 6] }
              ],
              [
                { text: 'Net Payable Amount:', colSpan: 6, alignment: 'right', fontSize: 11, bold: true, margin: [0, 8] }, {}, {}, {}, {}, {},
                { text: `Rs ${order.totalAmount.toFixed(2)}`, alignment: 'right', fontSize: 11, bold: true, color: '#B71C1C', margin: [0, 8] }
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
