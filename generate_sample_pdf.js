const fs = require('fs');
const pdfMake = require('pdfmake/build/pdfmake.js');
const pdfFonts = require('pdfmake/build/vfs_fonts.js');

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const docDefinition = {
  content: [
    { text: 'HERO CRACKERS', style: 'header', alignment: 'center', margin: [0, 0, 0, 5] },
    { text: 'ESTIMATE', alignment: 'center', color: '#555555', margin: [0, 0, 0, 20] },
    { text: 'This is a sample estimate document for WhatsApp template approval.', margin: [0, 20, 0, 0] }
  ],
  styles: {
    header: { fontSize: 20, bold: true }
  }
};

const printer = new (require('pdfmake'))({
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
});

const pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream('/Users/arun_ap/Desktop/Sample_Estimate.pdf'));
pdfDoc.end();
console.log("PDF Created!");
