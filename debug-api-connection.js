/**
 * API Connection Debugger
 * 
 * This script checks if your backend API is properly configured and accessible.
 * It helps diagnose 404 errors when creating payment intents.
 */

const http = require('http');

// Check if backend is running on port 3000
const checkBackendConnection = () => {
  console.log('🔍 Checking if backend server is running on port 3000...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Successfully connected to backend API on port 3000');
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          console.log(`📋 API response: ${JSON.stringify(parsedData)}`);
          checkPaymentIntentRoute();
        } catch (e) {
          console.error('❌ Error parsing API response:', e.message);
        }
      });
    } else {
      console.error(`❌ Backend responded with status code ${res.statusCode}`);
      suggestFixes();
    }
  });
  
  req.on('error', (e) => {
    console.error(`❌ Failed to connect to backend: ${e.message}`);
    suggestFixes();
  });
  
  req.end();
};

// Check if the payment intent route is accessible
const checkPaymentIntentRoute = () => {
  console.log('\n🔍 Checking if payment intent route is accessible...');
  
  const testData = JSON.stringify({
    productId: 'test-product',
    productName: 'Test Product',
    amount: 10,
    currency: 'usd'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/create-payment-intent',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': testData.length
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    if (res.statusCode === 404) {
      console.error('❌ Payment intent route is not found (404)');
      console.log('This suggests your route registration is not working properly');
      suggestFixes();
    } else if (res.statusCode === 503) {
      console.log('⚠️ Route found but Stripe is not configured (503)');
      console.log('Check your STRIPE_SECRET_KEY environment variable');
    } else if (res.statusCode === 200) {
      console.log('✅ Payment intent route is accessible');
    } else {
      console.log(`⚠️ Payment intent route responded with status code ${res.statusCode}`);
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        console.log(`📋 API response: ${JSON.stringify(parsedData)}`);
      } catch (e) {
        console.error('Failed to parse response:', e.message);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`❌ Failed to connect to payment intent route: ${e.message}`);
    suggestFixes();
  });
  
  req.write(testData);
  req.end();
};

// Suggest fixes based on the errors encountered
const suggestFixes = () => {
  console.log('\n📝 Suggested fixes:');
  console.log('1. Make sure your backend server is running with: npm run dev');
  console.log('2. Check that the server is running on port 3000 (check terminal output)');
  console.log('3. Ensure your .env file contains STRIPE_SECRET_KEY');
  console.log('4. Verify that your frontend is proxying to the correct backend port');
  console.log('   - Current proxy configuration points to: http://localhost:3000');
};

// Run the checks
console.log('🔄 Starting API connection debugging...');
checkBackendConnection();

// Generated by Copilot