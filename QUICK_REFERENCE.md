# 🚀 QUICK REFERENCE - PRODUCTS API ENDPOINTS

## Authentication First:
```
POST /auth/register or /auth/login
Body: { "email": "admin@momocakes.com", "password": "password123", ... }
→ Copy accessToken for admin endpoints
```

## 🌍 PUBLIC ENDPOINTS
```
GET  /products                     # Get all active products
GET  /products/{id}                # Get single product
```

## 🔑 ADMIN ENDPOINTS (Add: Authorization: Bearer {token})

### Create & Manage Products
```
POST /products
Body: {
  "name": "Golden Delight Cake",
  "price": 5200,
  "description": "Delicious cake",
  "quantityAvailable": 25
}

PATCH /products/{id}
Body: {
  "price": 5500,
  "description": "Updated description"
}

DELETE /products/{id}
```

### Quantity Management
```
PUT /products/{id}/quantity
Body: { "quantityAvailable": 30 }

PATCH /products/{id}/increment-quantity
Body: { "quantity": 5 }
```

### Admin Views
```
GET /products/admin/all            # All products (including inactive)
GET /products/admin/stats          # Dashboard statistics
```

### Product Status
```
PATCH /products/{id}/toggle-active # Enable/disable product
```

### Image Upload
```
POST /products/{id}/upload-image
Body: form-data with "image" file
```

## 📝 SAMPLE TEST DATA

### Admin User:
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

### Sample Product:
```json
{
  "name": "Chocolate Supreme",
  "price": 4500,
  "description": "Rich chocolate cake with premium cocoa",
  "quantityAvailable": 20
}
```

### More Sample Products:
```json
{
  "name": "Vanilla Dream",
  "price": 3800,
  "description": "Classic vanilla sponge cake",
  "quantityAvailable": 15
}

{
  "name": "Red Velvet Delight", 
  "price": 6200,
  "description": "Moist red velvet with cream cheese frosting",
  "quantityAvailable": 12
}

{
  "name": "Fruit Paradise",
  "price": 5800,
  "description": "Mixed fruit cake with seasonal fruits",
  "quantityAvailable": 8
}
```

## 🎯 TESTING CHECKLIST

- [ ] Create admin user / Login
- [ ] Get empty products list
- [ ] Create first product  
- [ ] Get products (should show 1 item)
- [ ] Get single product by ID
- [ ] Update product details
- [ ] Update quantity (both methods)
- [ ] Check admin stats
- [ ] Toggle product status
- [ ] Upload product image
- [ ] Test error cases (no auth, invalid data)
- [ ] Delete product