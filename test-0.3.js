const pdfmake = require('pdfmake');
const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};
pdfmake.fonts = fonts;
const docDefinition = {
  content: [
    'This text uses the standard Helvetica font.'
  ],
  defaultStyle: {
    font: 'Helvetica'
  }
};
const pdfDoc = pdfmake.createPdf(docDefinition);
pdfDoc.getBuffer().then(buffer => console.log('Success! Buffer size:', buffer.length)).catch(console.error);
