const http = require('http');

const orderPayload = JSON.stringify({
  customerName: "Test Customer",
  customerPhone: "9876543210",
  shippingAddress: "123 Test Street, Sivakasi",
  totalAmount: 1500,
  items: [
    {
      productId: "test-product-id-1", // We need a real product ID, but this will fail relation check if fake. Let's fetch products first.
      quantity: 2,
      price: 750
    }
  ]
});

async function runTest() {
  console.log('1. Fetching available products from API...');
  const res = await fetch('http://localhost:3000/api/products');
  const products = await res.json();
  
  if (products.length === 0) {
    console.log('No products found in DB. Cannot test order.');
    return;
  }
  
  const product = products[0];
  console.log(`Found product: ${product.name} (ID: ${product.id})`);
  
  const payload = {
    customerName: "Arun Tester",
    customerPhone: "9988776655",
    shippingAddress: "42 Developer Lane, Sivakasi 626123",
    totalAmount: product.price * 2,
    items: [
      {
        productId: product.id,
        quantity: 2,
        price: product.price
      }
    ]
  };

  console.log('\n2. Simulating Customer clicking "Submit" on Checkout Page...');
  console.log('Sending Payload:', payload);
  
  const orderRes = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  const order = await orderRes.json();
  
  if (orderRes.ok) {
    console.log('\n✅ TEST SUCCESS!');
    console.log(`Order created successfully with ID: ${order.id}`);
    console.log(`Order Status: ${order.status}`);
    console.log(`Customer Phone recorded: ${order.customerPhone}`);
  } else {
    console.log('\n❌ TEST FAILED!');
    console.log(order);
  }
}

runTest();
