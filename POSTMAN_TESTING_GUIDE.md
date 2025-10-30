# 📋 PRODUCTS MODULE - COMPLETE POSTMAN TESTING GUIDE

## 🌐 Base URL: `http://localhost:3001`

---

## 🔐 STEP 1: AUTHENTICATION SETUP

### 1.1 Create Admin User (First Time)
**Method:** `POST`  
**URL:** `http://localhost:3001/auth/register`  
**Headers:**
```
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "fullName": "Test Admin",
  "email": "admin@momocakes.com",
  "phoneNumber": "07012345678",
  "address": "123 Test Street, Lagos",
  "age": 30,
  "password": "password123"
}
```

### 1.2 Login Admin (If User Exists)
**Method:** `POST`  
**URL:** `http://localhost:3001/auth/login`  
**Headers:**
```
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "email": "admin@momocakes.com",
  "password": "password123"
}
```

**📝 IMPORTANT:** Copy the `accessToken` from the response - you'll need it for admin endpoints!

---

## 🌍 PUBLIC ENDPOINTS (No Authentication Required)

### 2.1 Get All Active Products
**Method:** `GET`  
**URL:** `http://localhost:3001/products`  
**Headers:** None required  
**Body:** None  

**Expected Response:**
```json
{
  "message": "Active products retrieved successfully",
  "data": []
}
```

### 2.2 Get Single Product by ID
**Method:** `GET`  
**URL:** `http://localhost:3001/products/{product_id}`  
**Headers:** None required  
**Body:** None  

**Note:** Replace `{product_id}` with actual product ID after creating a product

---

## 🔑 ADMIN ENDPOINTS (Require Authentication)

**⚠️ For all admin endpoints, add this header:**
```
Authorization: Bearer {your_access_token}
```

### 3.1 Create New Product
**Method:** `POST`  
**URL:** `http://localhost:3001/products`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {your_access_token}
```
**Body (JSON):**
```json
{
  "name": "Golden Delight Cake",
  "price": 5200,
  "description": "A delicious golden cake perfect for celebrations",
  "quantityAvailable": 25
}
```

**Field Validation:**
- `name`: String, min 2 characters (required)
- `price`: Number, ≥ 0 (required)
- `description`: String (optional)
- `quantityAvailable`: Number, ≥ 0 (required)
- `isActive`: Boolean (optional, defaults to true)

### 3.2 Get All Products (Admin View)
**Method:** `GET`  
**URL:** `http://localhost:3001/products/admin/all`  
**Headers:**
```
Authorization: Bearer {your_access_token}
```
**Body:** None

### 3.3 Get Product Statistics
**Method:** `GET`  
**URL:** `http://localhost:3001/products/admin/stats`  
**Headers:**
```
Authorization: Bearer {your_access_token}
```
**Body:** None

**Expected Response:**
```json
{
  "message": "Product statistics retrieved successfully",
  "data": {
    "totalProducts": 1,
    "activeProducts": 1,
    "outOfStockProducts": 0,
    "lowStockProducts": 0
  }
}
```

### 3.4 Update Product Information
**Method:** `PATCH`  
**URL:** `http://localhost:3001/products/{product_id}`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {your_access_token}
```
**Body (JSON) - All fields optional:**
```json
{
  "name": "Golden Delight Cake - Premium",
  "price": 5500,
  "description": "A delicious golden cake perfect for celebrations - UPDATED!",
  "isActive": true
}
```

### 3.5 Update Product Quantity (Set Specific Amount)
**Method:** `PUT`  
**URL:** `http://localhost:3001/products/{product_id}/quantity`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {your_access_token}
```
**Body (JSON):**
```json
{
  "quantityAvailable": 30
}
```

### 3.6 Increment Product Quantity (Add More Stock)
**Method:** `PATCH`  
**URL:** `http://localhost:3001/products/{product_id}/increment-quantity`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {your_access_token}
```
**Body (JSON):**
```json
{
  "quantity": 5
}
```

**Use Case:** When new cakes are finished baking and ready for sale

### 3.7 Toggle Product Active Status
**Method:** `PATCH`  
**URL:** `http://localhost:3001/products/{product_id}/toggle-active`  
**Headers:**
```
Authorization: Bearer {your_access_token}
```
**Body:** None (empty JSON `{}` if required)

### 3.8 Upload Product Image
**Method:** `POST`  
**URL:** `http://localhost:3001/products/{product_id}/upload-image`  
**Headers:**
```
Authorization: Bearer {your_access_token}
```
**Body:** `form-data`
- Key: `image`
- Type: File
- Value: Select an image file (JPEG, PNG, WebP)

**File Restrictions:**
- Max size: 5MB
- Allowed types: JPEG, PNG, WebP, JPG

### 3.9 Delete Product
**Method:** `DELETE`  
**URL:** `http://localhost:3001/products/{product_id}`  
**Headers:**
```
Authorization: Bearer {your_access_token}
```
**Body:** None

---

## ❌ ERROR TESTING SCENARIOS

### 4.1 Test Unauthorized Access
**Method:** `POST`  
**URL:** `http://localhost:3001/products`  
**Headers:**
```
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "name": "Unauthorized Product",
  "price": 1000,
  "quantityAvailable": 5
}
```
**Expected Result:** `401 Unauthorized`

### 4.2 Test Invalid Data Validation
**Method:** `POST`  
**URL:** `http://localhost:3001/products`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {your_access_token}
```
**Body (JSON):**
```json
{
  "name": "",
  "price": -100,
  "quantityAvailable": -5
}
```
**Expected Result:** `400 Bad Request` with validation errors

### 4.3 Test Invalid Product ID
**Method:** `GET`  
**URL:** `http://localhost:3001/products/invalid_product_id`  
**Expected Result:** `400 Bad Request` or `404 Not Found`

---

## 📋 TESTING SEQUENCE RECOMMENDATION

1. **Start Server** (ensure it's running on port 3001)
2. **Create Admin User** (Step 1.1) or **Login** (Step 1.2)
3. **Copy Access Token** from response
4. **Test Public Endpoints** (Steps 2.1) - should return empty array
5. **Create Product** (Step 3.1) - copy product ID from response
6. **Test Public Endpoints Again** (Step 2.1, 2.2) - should now show product
7. **Test Admin Endpoints** (Steps 3.2 through 3.9)
8. **Test Error Cases** (Steps 4.1 through 4.3)

---

## 🎯 SUCCESS INDICATORS

✅ **Status Code 200/201** for successful requests  
✅ **Proper JSON responses** with `message` and `data` fields  
✅ **Authentication working** (401 for unauthorized access)  
✅ **Validation working** (400 for invalid data)  
✅ **CRUD operations** create, read, update, delete all functional  
✅ **Image upload** returns Cloudinary URL  
✅ **Statistics** return proper counts  

---

## 🔧 COMMON ISSUES & SOLUTIONS

**Issue:** "Cannot connect to server"  
**Solution:** Ensure NestJS server is running (`npm run start:dev`)

**Issue:** "401 Unauthorized"  
**Solution:** Check Authorization header format: `Bearer {token}` (note the space)

**Issue:** "Validation errors"  
**Solution:** Check required fields and data types in request body

**Issue:** "Product not found"  
**Solution:** Verify product ID in URL path is correct

---

## 📱 POSTMAN COLLECTION

Import the `postman-collection.json` file for automated testing with pre-configured requests and test scripts!