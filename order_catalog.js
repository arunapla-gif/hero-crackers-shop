const fs = require('fs');
const prisma = require('./src/lib/prisma.js').default || require('./src/lib/prisma.js').prisma;

async function orderDirectory() {
  const text = fs.readFileSync('catalog.txt', 'utf8');
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  let categorySequence = 1;
  let productSequence = 1;
  
  console.log('Starting ordering process...');
  
  for (const line of lines) {
    if (line.startsWith('## ')) {
      const catName = line.replace('## ', '').trim();
      const cat = await prisma.category.findFirst({
        where: { name: catName }
      });
      if (cat) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { sequence: categorySequence }
        });
        console.log(`Updated Category: ${catName} -> sequence ${categorySequence}`);
        categorySequence++;
      } else {
        console.log(`Category not found: ${catName}`);
      }
    } else if (line.startsWith('##### ')) {
      const prodName = line.replace('##### ', '').trim();
      const prod = await prisma.product.findFirst({
        where: { name: prodName }
      });
      if (prod) {
        await prisma.product.update({
          where: { id: prod.id },
          data: { sequence: productSequence }
        });
        console.log(`Updated Product: ${prodName} -> sequence ${productSequence}`);
        productSequence++;
      } else {
        console.log(`Product not found: ${prodName}`);
      }
    }
  }
  
  console.log('Ordering complete!');
}

orderDirectory().catch(console.error).finally(() => prisma.$disconnect());
