#!/usr/bin/env node

// Simple API testing script for Products Module
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
let adminToken = '';
let productId = '';

// Test utilities
const log = (title, data) => {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(data, null, 2));
};

const error = (title, err) => {
  console.log(`\n❌ ${title}`);
  console.log(err.response?.data || err.message);
};

async function testEndpoints() {
  try {
    // 1. Test GET /products (should be empty)
    console.log('\n🧪 Testing Products Module Endpoints\n');
    
    const products = await axios.get(`${BASE_URL}/products`);
    log('✅ GET /products (Public)', products.data);

    // 2. Create admin user for authentication
    const adminData = {
      fullName: 'Test Admin',
      email: 'admin@momocakes.com',
      phoneNumber: '07012345678',
      address: '123 Test Street, Lagos',
      age: 30,
      password: 'password123'
    };

    try {
      const adminRegister = await axios.post(`${BASE_URL}/auth/register`, adminData);
      log('✅ Admin User Created', { user: adminRegister.data.user, hasToken: !!adminRegister.data.accessToken });
      adminToken = adminRegister.data.accessToken;
    } catch (err) {
      if (err.response?.status === 409) {
        // User already exists, try to login
        const loginData = { email: adminData.email, password: adminData.password };
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, loginData);
        log('✅ Admin User Logged In', { user: adminLogin.data.user, hasToken: !!adminLogin.data.accessToken });
        adminToken = adminLogin.data.accessToken;
      } else {
        throw err;
      }
    }

    // Set Authorization header for admin requests
    const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 3. Test POST /products (Create product - admin only)
    const productData = {
      name: 'Golden Delight Cake',
      price: 5200,
      description: 'A delicious golden cake perfect for celebrations',
      quantityAvailable: 25
    };

    const newProduct = await axios.post(`${BASE_URL}/products`, productData, authHeaders);
    log('✅ POST /products (Admin)', newProduct.data);
    productId = newProduct.data.data._id;

    // 4. Test GET /products (should now have one product)
    const updatedProducts = await axios.get(`${BASE_URL}/products`);
    log('✅ GET /products (After creation)', updatedProducts.data);

    // 5. Test GET /products/:id (Get single product)
    const singleProduct = await axios.get(`${BASE_URL}/products/${productId}`);
    log('✅ GET /products/:id (Public)', singleProduct.data);

    // 6. Test GET /products/admin/all (Admin view all)
    const allProducts = await axios.get(`${BASE_URL}/products/admin/all`, authHeaders);
    log('✅ GET /products/admin/all (Admin)', allProducts.data);

    // 7. Test GET /products/admin/stats (Product statistics)
    const stats = await axios.get(`${BASE_URL}/products/admin/stats`, authHeaders);
    log('✅ GET /products/admin/stats (Admin)', stats.data);

    // 8. Test PATCH /products/:id (Update product)
    const updateData = {
      price: 5500,
      description: 'A delicious golden cake perfect for celebrations - Updated!'
    };
    const updatedProduct = await axios.patch(`${BASE_URL}/products/${productId}`, updateData, authHeaders);
    log('✅ PATCH /products/:id (Admin)', updatedProduct.data);

    // 9. Test PUT /products/:id/quantity (Update quantity)
    const quantityUpdate = { quantityAvailable: 30 };
    const quantityResult = await axios.put(`${BASE_URL}/products/${productId}/quantity`, quantityUpdate, authHeaders);
    log('✅ PUT /products/:id/quantity (Admin)', quantityResult.data);

    // 10. Test PATCH /products/:id/increment-quantity (Increment quantity)
    const incrementData = { quantity: 5 };
    const incrementResult = await axios.patch(`${BASE_URL}/products/${productId}/increment-quantity`, incrementData, authHeaders);
    log('✅ PATCH /products/:id/increment-quantity (Admin)', incrementResult.data);

    // 11. Test PATCH /products/:id/toggle-active (Toggle active status)
    const toggleResult = await axios.patch(`${BASE_URL}/products/${productId}/toggle-active`, {}, authHeaders);
    log('✅ PATCH /products/:id/toggle-active (Admin)', toggleResult.data);

    // Toggle back to active
    await axios.patch(`${BASE_URL}/products/${productId}/toggle-active`, {}, authHeaders);

    // 12. Test Error Cases
    console.log('\n🧪 Testing Error Cases\n');

    // Unauthorized access
    try {
      await axios.post(`${BASE_URL}/products`, productData);
    } catch (err) {
      log('✅ Unauthorized Access Blocked', { status: err.response?.status, message: err.response?.data?.message });
    }

    // Invalid product ID
    try {
      await axios.get(`${BASE_URL}/products/invalid_id`);
    } catch (err) {
      log('✅ Invalid ID Handled', { status: err.response?.status, message: err.response?.data?.message });
    }

    // Invalid data
    try {
      await axios.post(`${BASE_URL}/products`, { name: '', price: -1 }, authHeaders);
    } catch (err) {
      log('✅ Invalid Data Validation', { status: err.response?.status, message: err.response?.data?.message });
    }

    console.log('\n🎉 All tests completed successfully!\n');

  } catch (err) {
    error('Test Failed', err);
  }
}

// Run if axios is available
if (typeof require !== 'undefined') {
  try {
    require('axios');
    testEndpoints();
  } catch (e) {
    console.log('Please install axios: npm install axios');
  }
} else {
  console.log('This script requires Node.js to run');
}